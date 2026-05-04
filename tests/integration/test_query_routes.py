"""Integration tests for /api/v1/query/* endpoints.

RAGChain and stream_rag_response are mocked — no LLM / vector store calls.
"""
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from rag_agent.schemas.query import QueryResponse, SourceDocument


def _mock_query_response(question: str = "test question") -> QueryResponse:
    return QueryResponse(
        question=question,
        answer="The answer is 42.",
        sources=[
            SourceDocument(
                document_id="doc-1",
                document_name="contract.pdf",
                content="Relevant chunk content here.",
                score=0.92,
            )
        ],
        latency_ms=1234,
    )


async def _mock_sse_stream():
    events = [
        {"event": "thinking", "step": "retrieving", "message": "Searching knowledge base..."},
        {"event": "thinking", "step": "reranking", "message": "Reranking 10 candidates..."},
        {"event": "sources", "documents": [{"document_name": "doc.pdf", "content": "chunk", "rerank_score": 0.9}]},
        {"event": "token", "content": "The "},
        {"event": "token", "content": "answer is 42."},
        {"event": "done", "latency_ms": 1500},
    ]
    for event in events:
        yield f"data: {json.dumps(event)}\n\n"


class TestSyncQuery:
    def test_sync_query_returns_answer(self, client, auth_headers):
        with patch("rag_agent.api.routes.query.RAGChain") as MockChain:
            MockChain.return_value.query.return_value = _mock_query_response("What is the answer?")

            response = client.post(
                "/api/v1/query",
                json={"question": "What is the answer?", "k": 5},
                headers=auth_headers,
            )

        assert response.status_code == 200
        data = response.json()
        assert data["answer"] == "The answer is 42."
        assert data["question"] == "What is the answer?"
        assert len(data["sources"]) == 1
        assert data["latency_ms"] == 1234

    def test_sync_query_question_too_short_rejected(self, client, auth_headers):
        response = client.post(
            "/api/v1/query",
            json={"question": "hi", "k": 5},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_sync_query_k_out_of_range_rejected(self, client, auth_headers):
        response = client.post(
            "/api/v1/query",
            json={"question": "What is the answer?", "k": 100},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_sync_query_chain_failure_returns_500(self, client, auth_headers):
        with patch("rag_agent.api.routes.query.RAGChain") as MockChain:
            MockChain.return_value.query.side_effect = Exception("LLM unavailable")

            response = client.post(
                "/api/v1/query",
                json={"question": "What is the answer?", "k": 5},
                headers=auth_headers,
            )
        assert response.status_code == 500


class TestStreamQuery:
    def test_stream_returns_sse_content_type(self, client, auth_headers):
        with patch("rag_agent.api.routes.query.stream_rag_response", return_value=_mock_sse_stream()):
            response = client.post(
                "/api/v1/query/stream",
                json={"question": "What does the contract say?", "k": 5},
                headers=auth_headers,
            )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]

    def test_stream_emits_thinking_events(self, client, auth_headers):
        with patch("rag_agent.api.routes.query.stream_rag_response", return_value=_mock_sse_stream()):
            response = client.post(
                "/api/v1/query/stream",
                json={"question": "What does the contract say?", "k": 5},
                headers=auth_headers,
            )

        raw = response.text
        events = [
            json.loads(line[len("data: "):])
            for line in raw.splitlines()
            if line.startswith("data: ")
        ]
        event_types = [e["event"] for e in events]

        assert "thinking" in event_types
        assert "sources" in event_types
        assert "token" in event_types
        assert "done" in event_types

    def test_stream_tokens_form_complete_answer(self, client, auth_headers):
        with patch("rag_agent.api.routes.query.stream_rag_response", return_value=_mock_sse_stream()):
            response = client.post(
                "/api/v1/query/stream",
                json={"question": "What does the contract say?", "k": 5},
                headers=auth_headers,
            )

        raw = response.text
        tokens = [
            json.loads(line[len("data: "):])["content"]
            for line in raw.splitlines()
            if line.startswith("data: ") and '"event": "token"' in line
        ]
        assert "".join(tokens) == "The answer is 42."


class TestQueryHistory:
    def test_history_returns_list(self, client, auth_headers, db):
        from rag_agent.db.repository import QueryLogRepository

        QueryLogRepository(db).create(
            query="Past question",
            response="Past answer",
            source_documents='["doc-1"]',
            latency_ms=800,
        )

        response = client.get("/api/v1/query/history", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) >= 1

    def test_history_limit_param(self, client, auth_headers):
        response = client.get("/api/v1/query/history?limit=5", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) <= 5
