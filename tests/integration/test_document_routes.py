"""Integration tests for /api/v1/documents/* endpoints.

IngestionPipeline.ingest is mocked to avoid external calls (ChromaDB, embeddings).
"""
import io
from unittest.mock import MagicMock, patch

import pytest

from rag_agent.db.repository import DocumentRepository


class TestUploadDocument:
    def test_upload_txt_success(self, client, auth_headers, db):
        doc = DocumentRepository(db).create(name="notes.txt", source="/uploads/notes.txt", file_type="txt")
        DocumentRepository(db).update_status(doc.id, "indexed", chunk_count=5)

        with patch("rag_agent.api.routes.documents.IngestionPipeline") as MockPipeline:
            MockPipeline.return_value.ingest.return_value = doc.id

            response = client.post(
                "/api/v1/documents",
                files={"file": ("notes.txt", io.BytesIO(b"Some content here"), "text/plain")},
                headers=auth_headers,
            )

        assert response.status_code == 201
        data = response.json()
        assert data["id"] == doc.id
        assert data["name"] == "notes.txt"

    def test_upload_unsupported_extension_rejected(self, client, auth_headers):
        response = client.post(
            "/api/v1/documents",
            files={"file": ("image.png", io.BytesIO(b"fake png"), "image/png")},
            headers=auth_headers,
        )
        assert response.status_code == 422
        assert "Unsupported file type" in response.json()["detail"]

    def test_upload_requires_authentication(self, client):
        response = client.post(
            "/api/v1/documents",
            files={"file": ("notes.txt", io.BytesIO(b"content"), "text/plain")},
        )
        assert response.status_code in (401, 403)

    def test_upload_ingestion_failure_returns_500(self, client, auth_headers):
        with patch("rag_agent.api.routes.documents.IngestionPipeline") as MockPipeline:
            MockPipeline.return_value.ingest.side_effect = Exception("Embedding API down")

            response = client.post(
                "/api/v1/documents",
                files={"file": ("data.txt", io.BytesIO(b"content"), "text/plain")},
                headers=auth_headers,
            )
        assert response.status_code == 500


class TestListDocuments:
    def test_list_empty(self, client, auth_headers):
        response = client.get("/api/v1/documents", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["documents"] == []
        assert data["total"] == 0

    def test_list_returns_all_documents(self, client, auth_headers, db):
        repo = DocumentRepository(db)
        repo.create(name="a.pdf", source="/a", file_type="pdf")
        repo.create(name="b.csv", source="/b", file_type="csv")

        response = client.get("/api/v1/documents", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        names = {d["name"] for d in data["documents"]}
        assert "a.pdf" in names
        assert "b.csv" in names

    def test_list_requires_authentication(self, client):
        response = client.get("/api/v1/documents")
        assert response.status_code in (401, 403)


class TestGetDocument:
    def test_get_existing_document(self, client, auth_headers, db):
        doc = DocumentRepository(db).create(name="report.pdf", source="/report", file_type="pdf")
        response = client.get(f"/api/v1/documents/{doc.id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == doc.id

    def test_get_non_existent_document(self, client, auth_headers):
        response = client.get("/api/v1/documents/non-existent-id", headers=auth_headers)
        assert response.status_code == 404


class TestDeleteDocument:
    def test_delete_existing_document(self, client, auth_headers, db):
        doc = DocumentRepository(db).create(name="old.txt", source="/old", file_type="txt")
        response = client.delete(f"/api/v1/documents/{doc.id}", headers=auth_headers)
        assert response.status_code == 204

    def test_delete_non_existent_document(self, client, auth_headers):
        response = client.delete("/api/v1/documents/does-not-exist", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_requires_authentication(self, client, db):
        doc = DocumentRepository(db).create(name="file.txt", source="/file", file_type="txt")
        response = client.delete(f"/api/v1/documents/{doc.id}")
        assert response.status_code in (401, 403)
