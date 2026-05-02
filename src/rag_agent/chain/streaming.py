"""SSE streaming for the RAG pipeline.

Each yielded string is a complete SSE message in the format:
    data: <json>\n\n

Event types the frontend receives:
    thinking  — intermediate step the agent is performing
    sources   — retrieved & reranked source documents
    token     — one LLM output token
    done      — final metadata (latency_ms)
    error     — if the pipeline fails
"""
import json
import time
from collections.abc import AsyncGenerator

from sqlalchemy.orm import Session

from rag_agent.core.config import settings
from rag_agent.generation.llm import get_llm
from rag_agent.generation.prompts import ENTERPRISE_RAG_PROMPT
from rag_agent.retrieval.hybrid_retriever import get_hybrid_retriever
from rag_agent.retrieval.reranker import rerank_documents


def _sse(event: str, data: dict) -> str:
    return f"data: {json.dumps({'event': event, **data})}\n\n"


async def stream_rag_response(
    question: str,
    db: Session,
    k: int | None = None,
    answer_buffer: list[str] | None = None,
    sources_buffer: list[dict] | None = None,
) -> AsyncGenerator[str, None]:
    """
    Async generator that yields SSE strings for the full RAG pipeline.

    answer_buffer / sources_buffer are optional lists the caller can pass to
    collect the full answer and sources after streaming completes (for DB logging).
    """
    start = time.monotonic()
    fetch_k = k or settings.retrieval_k

    # ── Step 1: Hybrid retrieval ─────────────────────────────────────────────
    yield _sse("thinking", {"step": "retrieving", "message": "Searching knowledge base with hybrid BM25 + vector search..."})

    try:
        retriever = get_hybrid_retriever(db, k=fetch_k)
        docs = retriever.invoke(question)
    except Exception as exc:
        yield _sse("error", {"message": f"Retrieval failed: {exc}"})
        return

    yield _sse("thinking", {
        "step": "retrieved",
        "message": f"Found {len(docs)} candidate chunks via hybrid search",
    })

    # ── Step 2: Cohere reranking ─────────────────────────────────────────────
    yield _sse("thinking", {"step": "reranking", "message": f"Reranking {len(docs)} candidates with Cohere..."})

    reranked = rerank_documents(question, docs)

    sources = [
        {
            "document_id": doc.metadata.get("doc_id"),
            "document_name": doc.metadata.get("doc_name"),
            "content": doc.page_content[:400],
            "rerank_score": doc.metadata.get("rerank_score"),
        }
        for doc in reranked
    ]
    if sources_buffer is not None:
        sources_buffer.extend(sources)

    yield _sse("thinking", {
        "step": "reranked",
        "message": f"Selected top {len(reranked)} chunks after reranking",
    })
    yield _sse("sources", {"documents": sources})

    # ── Step 3: Stream LLM generation ────────────────────────────────────────
    yield _sse("thinking", {"step": "generating", "message": f"Generating answer with {settings.llm_model}..."})

    context = "\n\n---\n\n".join(doc.page_content for doc in reranked)
    messages = ENTERPRISE_RAG_PROMPT.format_messages(context=context, question=question)

    llm = get_llm()
    try:
        async for chunk in llm.astream(messages):
            token = chunk.content
            if token:
                if answer_buffer is not None:
                    answer_buffer.append(token)
                yield _sse("token", {"content": token})
    except Exception as exc:
        yield _sse("error", {"message": f"Generation failed: {exc}"})
        return

    latency_ms = int((time.monotonic() - start) * 1000)
    yield _sse("done", {"latency_ms": latency_ms})
