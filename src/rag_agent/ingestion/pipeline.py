import uuid
from pathlib import Path
from typing import Callable

from langchain_core.documents import Document
from sqlalchemy.orm import Session

from rag_agent.core.logging import logger
from rag_agent.db.repository import DocumentRepository
from rag_agent.ingestion.chunker import chunk_documents
from rag_agent.ingestion.loaders.csv_loader import load_csv
from rag_agent.ingestion.loaders.pdf_loader import load_pdf
from rag_agent.ingestion.loaders.text_loader import load_text
from rag_agent.vectorstore.chroma_store import get_vector_store

_LOADERS: dict[str, Callable[[str | Path], list[Document]]] = {
    ".csv": load_csv,
    ".pdf": load_pdf,
    ".txt": load_text,
    ".md": load_text,
}

SUPPORTED_EXTENSIONS = list(_LOADERS.keys())


class IngestionPipeline:
    def __init__(self, db: Session):
        self.repo = DocumentRepository(db)
        self.vector_store = get_vector_store()

    def ingest(self, file_path: str | Path, name: str | None = None) -> str:
        path = Path(file_path)
        suffix = path.suffix.lower()

        if suffix not in _LOADERS:
            raise ValueError(
                f"Unsupported file type '{suffix}'. Supported: {SUPPORTED_EXTENSIONS}"
            )

        doc_name = name or path.name
        doc_record = self.repo.create(name=doc_name, source=str(path), file_type=suffix.lstrip("."))
        doc_id = doc_record.id

        try:
            self.repo.update_status(doc_id, "indexing")
            logger.info(f"Loading {path.name}")

            raw_docs = _LOADERS[suffix](path)
            self._attach_metadata(raw_docs, doc_id, doc_name)

            chunks = chunk_documents(raw_docs)
            logger.info(f"Split into {len(chunks)} chunks")

            vector_ids = [str(uuid.uuid4()) for _ in chunks]
            for chunk, vid in zip(chunks, vector_ids):
                chunk.metadata["vector_id"] = vid

            self.vector_store.add_documents(chunks, ids=vector_ids)
            self.repo.add_chunks(doc_id, [(vid, chunk.page_content) for vid, chunk in zip(vector_ids, chunks)])
            self.repo.update_status(doc_id, "indexed", chunk_count=len(chunks))

            logger.info(f"Indexed '{doc_name}' — {len(chunks)} chunks (doc_id={doc_id})")
            return doc_id

        except Exception as exc:
            self.repo.update_status(doc_id, "failed", error=str(exc))
            logger.error(f"Ingestion failed for '{doc_name}': {exc}")
            raise

    @staticmethod
    def _attach_metadata(docs: list[Document], doc_id: str, name: str) -> None:
        for doc in docs:
            doc.metadata.update({"doc_id": doc_id, "doc_name": name})
