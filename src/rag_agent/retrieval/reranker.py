import cohere
from langchain_core.documents import Document

from rag_agent.core.config import settings
from rag_agent.core.logging import logger

_client: cohere.ClientV2 | None = None


def _get_client() -> cohere.ClientV2:
    global _client
    if _client is None:
        _client = cohere.ClientV2(api_key=settings.cohere_api_key)
    return _client


def rerank_documents(
    question: str,
    docs: list[Document],
    top_n: int | None = None,
) -> list[Document]:
    if not docs:
        return docs

    n = min(top_n or settings.rerank_top_n, len(docs))

    try:
        response = _get_client().rerank(
            model=settings.cohere_rerank_model,
            query=question,
            documents=[doc.page_content for doc in docs],
            top_n=n,
        )
    except Exception as exc:
        logger.warning(f"Cohere rerank failed, returning unranked results: {exc}")
        return docs[:n]

    reranked: list[Document] = []
    for result in response.results:
        doc = docs[result.index]
        doc.metadata["rerank_score"] = result.relevance_score
        reranked.append(doc)

    return reranked
