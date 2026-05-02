from datetime import datetime, timezone

from sqlalchemy.orm import Session

from rag_agent.db.models import Document, DocumentChunk, QueryLog


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, name: str, source: str, file_type: str) -> Document:
        doc = Document(name=name, source=source, file_type=file_type)
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def get(self, doc_id: str) -> Document | None:
        return self.db.get(Document, doc_id)

    def list_all(self) -> list[Document]:
        return self.db.query(Document).order_by(Document.created_at.desc()).all()

    def update_status(
        self,
        doc_id: str,
        status: str,
        chunk_count: int = 0,
        error: str | None = None,
    ) -> None:
        doc = self.db.get(Document, doc_id)
        if doc:
            doc.status = status
            doc.chunk_count = chunk_count
            doc.error = error
            doc.updated_at = datetime.now(timezone.utc)
            self.db.commit()

    def delete(self, doc_id: str) -> bool:
        doc = self.db.get(Document, doc_id)
        if not doc:
            return False
        self.db.delete(doc)
        self.db.commit()
        return True

    def add_chunks(self, doc_id: str, chunks_data: list[tuple[str, str]]) -> None:
        """chunks_data: list of (vector_id, content) tuples."""
        chunks = [
            DocumentChunk(document_id=doc_id, chunk_index=i, vector_id=vid, content=content)
            for i, (vid, content) in enumerate(chunks_data)
        ]
        self.db.bulk_save_objects(chunks)
        self.db.commit()

    def get_all_chunks_with_content(self) -> list[DocumentChunk]:
        return self.db.query(DocumentChunk).all()


class QueryLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        query: str,
        response: str,
        source_documents: str,
        latency_ms: int,
    ) -> QueryLog:
        log = QueryLog(
            query=query,
            response=response,
            source_documents=source_documents,
            latency_ms=latency_ms,
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def list_recent(self, limit: int = 50) -> list[QueryLog]:
        return (
            self.db.query(QueryLog)
            .order_by(QueryLog.created_at.desc())
            .limit(limit)
            .all()
        )
