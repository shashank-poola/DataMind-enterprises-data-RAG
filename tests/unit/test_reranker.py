"""Unit tests for Cohere reranking — all Cohere API calls are mocked."""
from unittest.mock import MagicMock, patch

import pytest
from langchain_core.documents import Document

from rag_agent.retrieval.reranker import rerank_documents


def _docs(*contents: str) -> list[Document]:
    return [Document(page_content=c, metadata={}) for c in contents]


def _mock_rerank_response(indices_scores: list[tuple[int, float]]):
    """Build a mock Cohere rerank response."""
    results = []
    for idx, score in indices_scores:
        r = MagicMock()
        r.index = idx
        r.relevance_score = score
        results.append(r)
    response = MagicMock()
    response.results = results
    return response


@patch("rag_agent.retrieval.reranker._get_client")
class TestRerankDocuments:
    def test_empty_docs_returns_empty(self, mock_client):
        result = rerank_documents("question", [])
        assert result == []
        mock_client.assert_not_called()

    def test_rerank_orders_by_relevance(self, mock_client):
        docs = _docs("low relevance", "high relevance", "medium relevance")
        mock_client.return_value.rerank.return_value = _mock_rerank_response(
            [(1, 0.95), (2, 0.70), (0, 0.30)]
        )
        result = rerank_documents("question", docs)

        assert result[0].page_content == "high relevance"
        assert result[1].page_content == "medium relevance"
        assert result[2].page_content == "low relevance"

    def test_rerank_score_attached_to_metadata(self, mock_client):
        docs = _docs("doc A", "doc B")
        mock_client.return_value.rerank.return_value = _mock_rerank_response(
            [(0, 0.88), (1, 0.42)]
        )
        result = rerank_documents("question", docs)

        assert result[0].metadata["rerank_score"] == pytest.approx(0.88)
        assert result[1].metadata["rerank_score"] == pytest.approx(0.42)

    def test_top_n_limits_results(self, mock_client):
        docs = _docs("a", "b", "c", "d", "e")
        mock_client.return_value.rerank.return_value = _mock_rerank_response(
            [(0, 0.9), (1, 0.8)]
        )
        result = rerank_documents("question", docs, top_n=2)
        assert len(result) == 2

    def test_cohere_failure_returns_unranked_fallback(self, mock_client):
        docs = _docs("a", "b", "c")
        mock_client.return_value.rerank.side_effect = Exception("API error")
        result = rerank_documents("question", docs)
        # Falls back: returns docs[:rerank_top_n] unmodified
        assert len(result) > 0
        for doc in result:
            assert "rerank_score" not in doc.metadata

    def test_passes_correct_query_and_documents_to_cohere(self, mock_client):
        docs = _docs("chunk one", "chunk two")
        mock_client.return_value.rerank.return_value = _mock_rerank_response(
            [(0, 0.9), (1, 0.5)]
        )
        rerank_documents("what is X?", docs)

        call_kwargs = mock_client.return_value.rerank.call_args.kwargs
        assert call_kwargs["query"] == "what is X?"
        assert "chunk one" in call_kwargs["documents"]
        assert "chunk two" in call_kwargs["documents"]
