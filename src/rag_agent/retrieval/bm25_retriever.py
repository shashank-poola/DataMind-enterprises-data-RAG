from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from sqlalchemy.orm import Session

from rag_agent.db.models import DocumentChunk
from rag_agent.db.repository import DocumentRepository

# Simple cache keyed by total chunk count — invalidated whenever new docs are indexed
_cache: dict[int, BM25Retriever] = {}


def build_bm25_retriever(db: Session, k: int) -> BM25Retriever | None:
    """Build a BM25 retriever from all indexed chunk content stored in SQLite."""
    chunk_count = db.query(DocumentChunk).count()
    if chunk_count == 0:
        return None

    if chunk_count in _cache:
        retriever = _cache[chunk_count]
        retriever.k = k
        return retriever

    _cache.clear()

    rows = db.query(DocumentChunk).all()
    docs = [
        Document(
            page_content=row.content,
            metadata={"doc_id": row.document_id, "vector_id": row.vector_id},
        )
        for row in rows
    ]

    # Attach doc_name from parent document
    doc_ids = {row.document_id for row in rows}
    repo = DocumentRepository(db)
    name_map = {did: (repo.get(did).name if repo.get(did) else "") for did in doc_ids}
    for doc, row in zip(docs, rows):
        doc.metadata["doc_name"] = name_map.get(row.document_id, "")

    retriever = BM25Retriever.from_documents(docs, k=k)
    _cache[chunk_count] = retriever
    return retriever


def invalidate_bm25_cache() -> None:
    _cache.clear()
