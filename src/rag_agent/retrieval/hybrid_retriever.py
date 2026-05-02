from langchain.retrievers import EnsembleRetriever
from langchain_core.vectorstores import VectorStoreRetriever
from sqlalchemy.orm import Session

from rag_agent.core.config import settings
from rag_agent.retrieval.bm25_retriever import build_bm25_retriever
from rag_agent.vectorstore.chroma_store import get_vector_store


def get_hybrid_retriever(db: Session, k: int | None = None) -> EnsembleRetriever | VectorStoreRetriever:
    """
    Returns an EnsembleRetriever combining BM25 (keyword) + Chroma (semantic).
    Falls back to vector-only if no chunks are indexed yet.
    """
    fetch_k = k or settings.retrieval_k

    vector_retriever: VectorStoreRetriever = get_vector_store().as_retriever(
        search_type="similarity",
        search_kwargs={"k": fetch_k},
    )

    bm25_retriever = build_bm25_retriever(db, k=fetch_k)
    if bm25_retriever is None:
        return vector_retriever

    return EnsembleRetriever(
        retrievers=[bm25_retriever, vector_retriever],
        weights=[settings.bm25_weight, settings.vector_weight],
    )
