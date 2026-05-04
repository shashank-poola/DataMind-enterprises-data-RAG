"""Unit tests for SQLAlchemy repositories against the in-memory test DB."""
import pytest

from rag_agent.core.security import hash_password
from rag_agent.db.repository import DocumentRepository, QueryLogRepository, UserRepository


class TestDocumentRepository:
    def test_create_returns_document_with_id(self, db):
        repo = DocumentRepository(db)
        doc = repo.create(name="report.pdf", source="/uploads/report.pdf", file_type="pdf")
        assert doc.id is not None
        assert doc.name == "report.pdf"
        assert doc.status == "pending"
        assert doc.chunk_count == 0

    def test_get_returns_existing_document(self, db):
        repo = DocumentRepository(db)
        created = repo.create(name="data.csv", source="/uploads/data.csv", file_type="csv")
        fetched = repo.get(created.id)
        assert fetched is not None
        assert fetched.id == created.id

    def test_get_returns_none_for_missing_id(self, db):
        repo = DocumentRepository(db)
        assert repo.get("non-existent-id") is None

    def test_list_all_returns_all_documents(self, db):
        repo = DocumentRepository(db)
        repo.create(name="a.pdf", source="/a", file_type="pdf")
        repo.create(name="b.txt", source="/b", file_type="txt")
        docs = repo.list_all()
        assert len(docs) == 2

    def test_list_all_ordered_newest_first(self, db):
        repo = DocumentRepository(db)
        d1 = repo.create(name="first.pdf", source="/first", file_type="pdf")
        d2 = repo.create(name="second.pdf", source="/second", file_type="pdf")
        docs = repo.list_all()
        # newest first
        assert docs[0].id == d2.id

    def test_update_status_to_indexed(self, db):
        repo = DocumentRepository(db)
        doc = repo.create(name="file.pdf", source="/file", file_type="pdf")
        repo.update_status(doc.id, "indexed", chunk_count=42)
        updated = repo.get(doc.id)
        assert updated.status == "indexed"
        assert updated.chunk_count == 42

    def test_update_status_to_failed_with_error(self, db):
        repo = DocumentRepository(db)
        doc = repo.create(name="bad.pdf", source="/bad", file_type="pdf")
        repo.update_status(doc.id, "failed", error="File corrupted")
        updated = repo.get(doc.id)
        assert updated.status == "failed"
        assert updated.error == "File corrupted"

    def test_delete_existing_document(self, db):
        repo = DocumentRepository(db)
        doc = repo.create(name="temp.txt", source="/temp", file_type="txt")
        result = repo.delete(doc.id)
        assert result is True
        assert repo.get(doc.id) is None

    def test_delete_non_existent_returns_false(self, db):
        repo = DocumentRepository(db)
        assert repo.delete("does-not-exist") is False

    def test_add_chunks_stores_content(self, db):
        repo = DocumentRepository(db)
        doc = repo.create(name="chunked.pdf", source="/chunked", file_type="pdf")
        repo.add_chunks(doc.id, [("vec-1", "First chunk content"), ("vec-2", "Second chunk content")])
        chunks = repo.get_all_chunks_with_content()
        contents = [c.content for c in chunks]
        assert "First chunk content" in contents
        assert "Second chunk content" in contents


class TestUserRepository:
    def test_create_user(self, db):
        repo = UserRepository(db)
        user = repo.create(email="alice@example.com", name="Alice", hashed_password="hashed")
        assert user.id is not None
        assert user.email == "alice@example.com"
        assert user.is_active is True

    def test_get_by_email_found(self, db):
        repo = UserRepository(db)
        created = repo.create(email="bob@example.com", name="Bob", hashed_password="hashed")
        found = repo.get_by_email("bob@example.com")
        assert found is not None
        assert found.id == created.id

    def test_get_by_email_not_found(self, db):
        repo = UserRepository(db)
        assert repo.get_by_email("nobody@example.com") is None

    def test_get_by_id(self, db):
        repo = UserRepository(db)
        user = repo.create(email="carol@example.com", name="Carol", hashed_password="hashed")
        found = repo.get(user.id)
        assert found.email == "carol@example.com"


class TestQueryLogRepository:
    def test_create_log(self, db):
        repo = QueryLogRepository(db)
        log = repo.create(
            query="What is the contract value?",
            response="The contract value is $1M.",
            source_documents='["doc-1"]',
            latency_ms=1200,
        )
        assert log.id is not None
        assert log.latency_ms == 1200

    def test_list_recent_returns_newest_first(self, db):
        repo = QueryLogRepository(db)
        repo.create(query="Q1", response="A1", source_documents="[]", latency_ms=100)
        repo.create(query="Q2", response="A2", source_documents="[]", latency_ms=200)
        logs = repo.list_recent(limit=10)
        assert logs[0].query == "Q2"

    def test_list_recent_respects_limit(self, db):
        repo = QueryLogRepository(db)
        for i in range(10):
            repo.create(query=f"Q{i}", response=f"A{i}", source_documents="[]", latency_ms=i * 10)
        logs = repo.list_recent(limit=3)
        assert len(logs) == 3
