# Enterprises Data Intelligence RAG System

[Python](https://python.org/)
[FastAPI](https://fastapi.tiangolo.com/)
[Next.js](https://nextjs.org/)
[LangChain](https://langchain.com/)
[License](LICENSE)

> Ask your documents anything. Get answers you can actually trust.

---

## Why This Exists

Every company has knowledge trapped in documents. PDFs no one reads. CSVs no one queries. Text files buried in folders. When someone needs an answer, they either dig for hours or ask someone who digs for hours.

The obvious fix is RAG, Retrieval Augmented Generation. Feed your documents into a vector store, embed queries, retrieve similar chunks, generate an answer. Everybody's doing it.

**Except most RAG implementations are mediocre.**

I built a few. They worked fine on demo docs. Then I tried them on real queries — exact clause numbers, specific dates, precise product codes and watched them fail. The model hallucinated. The retrieved chunks were vaguely related but not the right ones. Confidence scores looked fine. Answers were wrong.

The problem wasn't the LLM.

**The problem was retrieval.**

Semantic/vector search is powerful for meaning. It's terrible for precision. Ask "what does clause 4B say about liability?" and semantic search returns everything that's vaguely about liability. BM25 — the classic keyword algorithm — finds "clause 4B" exactly.

Neither alone is enough. You need both.

Then you need a reranker to look at all the retrieved candidates together, in context of the actual question, and sort them by true relevance. That's what Cohere's cross-encoder does — and it changes everything.

**DataMind is what I built to actually get RAG right.**

Hybrid retrieval. Cohere reranking. Streaming agent that shows its reasoning in real time. A proper UI that makes the whole thing usable. Built to understand the problem deeply, not to ship a demo.

---

## How It Works

```
Document Upload
      │
      ▼
  Chunking (1000 tokens, 200 overlap)
      │
      ├──► BM25 Index         (keyword precision)
      └──► ChromaDB Vectors   (semantic understanding via Gemini)
                        │
               Query comes in
                        │
              ┌─────────┴──────────┐
         BM25 (0.4)        Vector (0.6)
              └─────────┬──────────┘
                   Ensemble merge
                        │
               Cohere Reranker
               (cross-encoder: sees query + all chunks together)
                        │
              Groq LLM (Llama 3.3 70B)
                        │
          Streamed response + sources + latency
```

The insight: retrieval quality matters more than model quality. A great model with bad retrieval gives bad answers. A decent model with precise retrieval gives great answers. This architecture optimizes for retrieval first.

---

## What It Does

**Hybrid Retrieval**
Runs BM25 and semantic vector search in parallel. Merges results using a weighted ensemble (BM25 × 0.4, vector × 0.6). Falls back to vector-only if no BM25 index exists yet. You get keyword precision AND semantic understanding in every query.

**Cohere Reranking**
After the ensemble merge, a cross-encoder reranker sees the full query alongside every candidate chunk simultaneously. Unlike cosine similarity (query vs. chunk in isolation), the reranker understands the question in context of the answer — which is how humans actually judge relevance.

**Streaming Reasoning UI**
The agent streams its reasoning steps in real time via Server-Sent Events. Watch it think: searching, analyzing, generating. Each step appears as it happens. After the response, reasoning collapses into a "show steps" toggle. Answers feel trustworthy because you see the work.

**Source Attribution**
Every answer includes the exact document chunks it was built from, with their Cohere rerank scores. You know not just what the answer is, but where it came from and how confident the retrieval was.

**Document Management**
Upload PDFs, CSVs, and TXT files. Track indexing status per document (pending → indexing → indexed → failed). Delete individual documents. Everything is isolated per user.

**Auth + Analytics**
JWT-based authentication. Per-user document isolation. Analytics dashboard with query history and usage patterns.

---

## Stack


| Layer          | Technology                             | Why                                  |
| -------------- | -------------------------------------- | ------------------------------------ |
| LLM            | Groq — `llama-3.3-70b-versatile`       | Fast inference, strong reasoning     |
| Embeddings     | Google Gemini — `gemini-embedding-001` | High quality, multimodal-ready       |
| Vector Store   | ChromaDB Cloud                         | Managed, no infra to run             |
| Keyword Search | BM25 (`rank-bm25`)                     | Exact match, zero latency overhead   |
| Reranker       | Cohere — `rerank-english-v3.0`         | Cross-encoder, context-aware ranking |
| Backend        | FastAPI + LangChain + SQLAlchemy       | Fast, typed, composable              |
| Auth           | JWT (`python-jose`)                    | Stateless, standard                  |
| Frontend       | Next.js 16 + React 19 + Tailwind v4    | App router, streaming-ready          |
| Font           | Onest (Google Fonts)                   | Clean, modern                        |
| Icons          | Nucleo Glass                           | Premium SVG icon set                 |


---

## Project Structure

```
rag-agent/
├── main.py                      # Uvicorn entrypoint (port 8000)
├── pyproject.toml               # Python deps, managed with uv
├── src/rag_agent/
│   ├── api/
│   │   ├── app.py               # FastAPI app, CORS, router registration
│   │   ├── dependencies.py      # Auth dependency injection
│   │   └── routes/
│   │       ├── auth.py          # /api/v1/auth/* — signup, login
│   │       ├── documents.py     # /api/v1/documents/* — upload, list, delete
│   │       ├── query.py         # /api/v1/query/stream — SSE streaming
│   │       └── analytics.py     # /api/v1/analytics/* — usage data
│   ├── core/
│   │   ├── config.py            # Pydantic settings — all env vars typed
│   │   └── security.py          # JWT encode/decode, password hashing
│   ├── db/
│   │   ├── database.py          # SQLAlchemy engine + session factory
│   │   ├── models.py            # ORM models (User, Document, Query)
│   │   └── repository.py        # Database query layer
│   ├── ingestion/               # Document loaders + chunking pipeline
│   ├── embeddings/              # Gemini embedding wrapper
│   ├── vectorstore/             # ChromaDB Cloud client
│   ├── retrieval/
│   │   ├── hybrid_retriever.py  # BM25 + vector ensemble (the core)
│   │   ├── bm25_retriever.py    # BM25 index builder + search
│   │   ├── reranker.py          # Cohere cross-encoder reranking
│   │   └── retriever.py        # Base retriever interface
│   ├── generation/              # LLM wrapper + prompt templates
│   ├── chain/                   # RAG chain + SSE streaming logic
│   └── schemas/                 # Pydantic request/response models
│
└── web/                         # Next.js 16 frontend
    └── src/
        ├── app/                 # App router — auth + dashboard pages
        ├── components/
        │   ├── Sidebar.tsx      # Nav — Chat, Documents, Analytics
        │   └── chat/
        │       ├── ChatWindow.tsx      # Main chat container
        │       ├── ChatInput.tsx       # Textarea + send (SSE-aware)
        │       ├── MessageBubble.tsx   # User + assistant message display
        │       ├── ThinkingSteps.tsx   # Live reasoning animation
        │       └── SourcesPanel.tsx    # Retrieved chunks + scores
        ├── hooks/
        │   ├── useChat.ts       # SSE stream state + message management
        │   ├── useDocuments.ts  # Document list + upload/delete
        │   └── useAnalytics.ts  # Analytics data
        ├── lib/api/             # Typed fetch clients + SSE parser
        └── types/               # Shared TypeScript interfaces
```

---

## Setup

### Prerequisites

- Python 3.12+
- Node.js 18+
- `[uv](https://docs.astral.sh/uv/)` — Python package manager (replaces pip/poetry)

### 1. Clone

```bash
git clone https://github.com/shashank-poola/rag-agent.git
cd rag-agent
```

### 2. Install dependencies

**Backend:**

```bash
uv sync
```

**Frontend:**

```bash
cd web && npm install
```

### 3. Environment variables

Create `.env` in the project root:

```env
# LLM — get from console.groq.com
GROQ_API_KEY=your_groq_api_key
LLM_MODEL=llama-3.3-70b-versatile

# Embeddings — get from aistudio.google.com
GEMINI_API_KEY=your_gemini_api_key
EMBEDDING_MODEL=gemini-embedding-001

# Reranking — get from cohere.com
COHERE_API_KEY=your_cohere_api_key
COHERE_RERANK_MODEL=rerank-english-v3.0

# Vector Store — get from trychroma.com
CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_tenant
CHROMA_DATABASE=your_database
CHROMA_COLLECTION=your_collection

# Auth
SECRET_KEY=any_long_random_string_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (SQLite by default, swap for Postgres in prod)
DATABASE_URL=sqlite:///./datamind.db

# Retrieval weights — these are the defaults, tune as needed
BM25_WEIGHT=0.4
VECTOR_WEIGHT=0.6
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run

**Backend:**

```bash
uv run python main.py
# API live at http://localhost:8000
# Docs at http://localhost:8000/docs
```

**Frontend (new terminal):**

```bash
cd web && npm run dev
# UI at http://localhost:3000
```

---

## API Reference


| Method   | Endpoint                   | Description                       |
| -------- | -------------------------- | --------------------------------- |
| `POST`   | `/api/v1/auth/signup`      | Register new user                 |
| `POST`   | `/api/v1/auth/login`       | Login — returns JWT               |
| `GET`    | `/api/v1/documents`        | List uploaded documents           |
| `POST`   | `/api/v1/documents/upload` | Upload document (PDF / CSV / TXT) |
| `DELETE` | `/api/v1/documents/{id}`   | Delete document + its index       |
| `POST`   | `/api/v1/query/stream`     | Stream RAG query via SSE          |
| `GET`    | `/api/v1/analytics`        | Query analytics + history         |
| `GET`    | `/health`                  | Health check                      |


### SSE stream format

`POST /api/v1/query/stream` body: `{ "question": "...", "k": 5 }`

```
data: {"event": "thinking", "step": "retrieve",  "message": "Searching documents..."}
data: {"event": "thinking", "step": "rerank",    "message": "Reranking results..."}
data: {"event": "thinking", "step": "generate",  "message": "Generating response..."}
data: {"event": "sources",  "documents": [{ "content": "...", "document_name": "...", "rerank_score": 0.94 }]}
data: {"event": "token",    "content": "The contract states..."}
data: {"event": "done",     "latency_ms": 2341}
data: {"event": "error",    "message": "..."}
```

---

## Retrieval Design

This is the part that actually matters.

**Why hybrid search?**

Semantic search finds meaning. BM25 finds words. A query like *"what does section 4.2 say about indemnification?"* — semantic search returns anything vaguely about indemnification. BM25 finds "section 4.2" exactly. You need both.

Scores are merged with configurable weights:

```
final_score = (bm25_score × 0.4) + (vector_score × 0.6)
```

**Why reranking?**

Cosine similarity scores each chunk against the query independently. The reranker sees all candidates together, alongside the full query, and scores them as a cross-encoder. It understands that "the liability cap is $1M" is more relevant to "what is the liability limit?" than "the parties agree to indemnify each other" even if the latter has higher cosine similarity. This is the biggest single quality improvement in the stack.

---

## Supported Formats


| Format | Notes                      |
| ------ | -------------------------- |
| `.pdf` | Multi-page text extraction |
| `.csv` | Row-level chunking         |
| `.txt` | Plain text chunking        |


## License

MIT — use it, fork it, build on it.