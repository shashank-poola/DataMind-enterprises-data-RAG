import time

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from sqlalchemy.orm import Session

from rag_agent.core.config import settings
from rag_agent.generation.llm import get_llm
from rag_agent.generation.prompts import ENTERPRISE_RAG_PROMPT
from rag_agent.retrieval.hybrid_retriever import get_hybrid_retriever
from rag_agent.retrieval.reranker import rerank_documents
from rag_agent.schemas.query import QueryResponse, SourceDocument


def _format_docs(docs: list[Document]) -> str:
    return "\n\n---\n\n".join(doc.page_content for doc in docs)


class RAGChain:
    def __init__(self, db: Session, k: int | None = None):
        self._db = db
        self._k = k or settings.retrieval_k

    def query(self, question: str) -> QueryResponse:
        start = time.monotonic()

        # 1. Hybrid retrieval (BM25 + vector, over-fetch for reranking)
        retriever = get_hybrid_retriever(self._db, k=self._k)
        docs = retriever.invoke(question)

        # 2. Cohere reranking — collapses to rerank_top_n results
        reranked = rerank_documents(question, docs)

        # 3. Generate
        context = _format_docs(reranked)
        messages = ENTERPRISE_RAG_PROMPT.format_messages(context=context, question=question)
        answer = (get_llm() | StrOutputParser()).invoke(messages)

        latency_ms = int((time.monotonic() - start) * 1000)

        sources = [
            SourceDocument(
                document_id=doc.metadata.get("doc_id"),
                document_name=doc.metadata.get("doc_name"),
                content=doc.page_content[:400],
                score=doc.metadata.get("rerank_score"),
            )
            for doc in reranked
        ]

        return QueryResponse(
            question=question,
            answer=answer,
            sources=sources,
            latency_ms=latency_ms,
        )
