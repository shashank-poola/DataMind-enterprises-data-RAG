from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── LLM & Embedding providers ────────────────────────────────────────────
    groq_api_key: str
    gemini_api_key: str
    cohere_api_key: str

    llm_model: str = "llama-3.3-70b-versatile"
    embedding_model: str = "models/gemini-embedding-001"

    # ── Cohere reranking ─────────────────────────────────────────────────────
    cohere_rerank_model: str = "rerank-english-v3.0"
    rerank_top_n: int = 5

    # ── Vector store (Chroma Cloud) ───────────────────────────────────────────
    chroma_api_key: str
    chroma_tenant: str
    chroma_database: str
    chroma_collection: str = "enterprise_docs"

    # ── Hybrid retrieval weights (must sum to 1.0) ───────────────────────────
    bm25_weight: float = 0.4
    vector_weight: float = 0.6

    # ── Chunking ─────────────────────────────────────────────────────────────
    chunk_size: int = 1000
    chunk_overlap: int = 200

    # ── Retrieval ────────────────────────────────────────────────────────────
    # Over-fetch before reranking; rerank_top_n controls final results
    retrieval_k: int = 20

    # ── SQLite metadata store ─────────────────────────────────────────────────
    database_url: str = "sqlite:///./data/rag_agent.db"

    # ── App / security ───────────────────────────────────────────────────────
    app_name: str = "Enterprise RAG Agent"
    app_version: str = "0.1.0"
    app_env: str = "development"
    secret_key: str = "change-me-in-production"
    allowed_origins: str = "http://localhost:3000"
    debug: bool = False

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
