"""Unit tests for the document chunking pipeline."""
from langchain_core.documents import Document

from rag_agent.ingestion.chunker import chunk_documents


def _make_doc(text: str, metadata: dict | None = None) -> Document:
    return Document(page_content=text, metadata=metadata or {})


class TestChunkDocuments:
    def test_empty_list_returns_empty(self):
        assert chunk_documents([]) == []

    def test_short_document_stays_as_single_chunk(self):
        doc = _make_doc("Short text that fits in one chunk.")
        chunks = chunk_documents([doc])
        assert len(chunks) == 1
        assert "Short text" in chunks[0].page_content

    def test_long_document_is_split(self):
        # 5000 chars — well above chunk_size=1000
        long_text = "word " * 1000
        doc = _make_doc(long_text)
        chunks = chunk_documents([doc])
        assert len(chunks) > 1

    def test_metadata_preserved_in_all_chunks(self):
        long_text = "sentence. " * 500
        doc = _make_doc(long_text, metadata={"doc_id": "abc", "doc_name": "test.pdf"})
        chunks = chunk_documents([doc])
        for chunk in chunks:
            assert chunk.metadata["doc_id"] == "abc"
            assert chunk.metadata["doc_name"] == "test.pdf"

    def test_chunks_do_not_exceed_size_limit(self):
        long_text = "a" * 5000
        doc = _make_doc(long_text)
        chunks = chunk_documents([doc])
        # Each chunk content should be bounded (allow some slack for splitter logic)
        for chunk in chunks:
            assert len(chunk.page_content) <= 1200

    def test_multiple_documents_all_chunked(self):
        docs = [_make_doc("word " * 300, {"doc_id": str(i)}) for i in range(3)]
        chunks = chunk_documents(docs)
        assert len(chunks) >= 3

    def test_chunk_content_is_non_empty(self):
        doc = _make_doc("Some meaningful content here.")
        chunks = chunk_documents([doc])
        for chunk in chunks:
            assert chunk.page_content.strip() != ""
