"""Unit tests for BM25 retriever construction and caching."""
from unittest.mock import MagicMock, patch

import pytest
from langchain_core.documents import Document

from rag_agent.retrieval.bm25_retriever import build_bm25_retriever, invalidate_bm25_cache


def _make_chunk(doc_id: str, content: str, vector_id: str = "v1"):
    chunk = MagicMock()
    chunk.document_id = doc_id
    chunk.vector_id = vector_id
    chunk.content = content
    return chunk


def _make_db(chunks: list, chunk_count: int | None = None):
    """Return a mock SQLAlchemy session with controlled query results."""
    db = MagicMock()
    count_val = chunk_count if chunk_count is not None else len(chunks)
    db.query.return_value.count.return_value = count_val
    db.query.return_value.all.return_value = chunks
    return db


class TestBuildBM25Retriever:
    def setup_method(self):
        invalidate_bm25_cache()

    def test_returns_none_when_no_chunks(self):
        db = _make_db([], chunk_count=0)
        result = build_bm25_retriever(db, k=5)
        assert result is None

    def test_returns_retriever_when_chunks_exist(self):
        chunks = [
            _make_chunk("doc-1", "The contract expires on January 1st", "v1"),
            _make_chunk("doc-1", "Liability is capped at 1 million dollars", "v2"),
        ]
        db = _make_db(chunks)

        with patch("rag_agent.retrieval.bm25_retriever.DocumentRepository") as MockRepo:
            mock_doc = MagicMock()
            mock_doc.name = "contract.pdf"
            MockRepo.return_value.get.return_value = mock_doc

            result = build_bm25_retriever(db, k=5)

        assert result is not None
        assert result.k == 5

    def test_cache_returns_same_retriever_for_same_chunk_count(self):
        chunks = [_make_chunk("doc-1", "Some content", "v1")]
        db = _make_db(chunks)

        with patch("rag_agent.retrieval.bm25_retriever.DocumentRepository") as MockRepo:
            MockRepo.return_value.get.return_value.name = "doc.txt"
            r1 = build_bm25_retriever(db, k=5)
            r2 = build_bm25_retriever(db, k=5)

        assert r1 is r2

    def test_cache_updates_k_on_hit(self):
        chunks = [_make_chunk("doc-1", "Some content", "v1")]
        db = _make_db(chunks)

        with patch("rag_agent.retrieval.bm25_retriever.DocumentRepository") as MockRepo:
            MockRepo.return_value.get.return_value.name = "doc.txt"
            build_bm25_retriever(db, k=5)
            result = build_bm25_retriever(db, k=10)

        assert result.k == 10

    def test_invalidate_cache_forces_rebuild(self):
        chunks = [_make_chunk("doc-1", "Some content", "v1")]
        db = _make_db(chunks)

        with patch("rag_agent.retrieval.bm25_retriever.DocumentRepository") as MockRepo:
            MockRepo.return_value.get.return_value.name = "doc.txt"
            r1 = build_bm25_retriever(db, k=5)
            invalidate_bm25_cache()
            r2 = build_bm25_retriever(db, k=5)

        assert r1 is not r2
