import Link from "next/link";
import "./landing.css";

const FEATURES = [
  {
    num: "01",
    title: "Hybrid Retrieval Engine",
    body: "Weighted ensemble of BM25 keyword search (0.4) and semantic vector retrieval (0.6) via ChromaDB Cloud. Never misses an exact match or a conceptual near-miss.",
  },
  {
    num: "02",
    title: "Cohere Cross-Encoder Reranking",
    body: "After retrieval, Cohere's cross-encoder reranks top candidates. The model sees the full query-document pair — precision that similarity search alone cannot achieve.",
  },
  {
    num: "03",
    title: "Streaming Synthesis",
    body: "Groq-powered Llama 3.3 70B delivers answers token-by-token via Server-Sent Events. No waiting — results stream as the model thinks.",
  },
  {
    num: "04",
    title: "Document Intelligence",
    body: "Ingest PDFs, CSVs, and plain text. Auto-chunked at 1,000 tokens with 200-token overlap using Google Gemini embeddings. Every chunk is attributed so answers come with sources.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Upload",
    body: "Drop in your documents — PDFs, CSVs, or text. The pipeline chunks, embeds, and indexes them automatically into ChromaDB Cloud.",
  },
  {
    n: "2",
    title: "Query",
    body: "Ask in natural language. Hybrid retrieval runs BM25 and vector search in parallel, then Cohere ranks the top passages for relevance.",
  },
  {
    n: "3",
    title: "Answer",
    body: "The LLM synthesizes a precise, cited answer in real time. Every claim is traceable to a specific document chunk with rerank scores.",
  },
];

const FAQS = [
  {
    q: "What is DataMind?",
    a: "DataMind is an enterprise Retrieval-Augmented Generation (RAG) system. Upload your documents, then ask questions in natural language — DataMind retrieves the most relevant passages and synthesizes precise, cited answers using Llama 3.3 70B on Groq.",
  },
  {
    q: "What document types are supported?",
    a: "PDF, CSV, and plain text files. The ingestion pipeline extracts text, chunks it at 1,000 tokens with 200-token overlap, embeds via Google Gemini, and indexes into ChromaDB Cloud — all automatically.",
  },
  {
    q: "How does hybrid retrieval work?",
    a: "DataMind runs two retrieval strategies in parallel: BM25 keyword search (weight 0.4) and semantic vector search (weight 0.6). The results are merged and reranked by Cohere's cross-encoder model, which evaluates each query-document pair directly for maximum precision.",
  },
  {
    q: "Is my data secure?",
    a: "Authentication uses JWT tokens. Each user's documents are isolated — you can only query documents you've uploaded. All API calls require a valid Bearer token.",
  },
  {
    q: "How do I get started?",
    a: "Create a free account, upload at least one document, then head to the Chat page. Type your question and hit send — the system retrieves, reranks, and streams an answer in seconds.",
  },
];

export default function Home() {
  return (
    <div style={{ background: "#080706", color: "#F0EDE8", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col"
        style={{
          backgroundImage: "url(/images/editbg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,7,6,0.35) 0%, rgba(8,7,6,0.55) 40%, rgba(8,7,6,0.85) 75%, #080706 100%)",
          }}
        />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-7 max-w-7xl mx-auto w-full">
          <span className="landing-brand">DataMind</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="landing-nav-link">
              Sign in
            </Link>
            <Link href="/signup" className="landing-btn-primary">
              Get started
            </Link>
          </div>
        </nav>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-8 pb-28 max-w-7xl mx-auto w-full">
          <div className="landing-eyebrow">Enterprise Retrieval-Augmented Generation</div>
          <h1 className="landing-h1">
            Enterprise RAG,
            <br />
            Built Different.
          </h1>
          <p className="landing-body" style={{ marginTop: "1.75rem", maxWidth: "40rem" }}>
            DataMind delivers precision answers from your document corpus through hybrid
            BM25 + semantic retrieval and Cohere cross-encoder reranking — with streaming
            synthesis powered by Llama 3.3 70B on Groq.
          </p>
          <div className="flex items-center gap-3 mt-9">
            <Link href="/signup" className="landing-cta-primary">
              Start free
            </Link>
            <Link href="/login" className="landing-cta-ghost">
              Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stat strip ── */}
      <div className="landing-divider">
        <div className="landing-stat-grid">
          {[
            { val: "BM25 + Vector", label: "Hybrid Retrieval" },
            { val: "Cohere", label: "Cross-encoder Reranking" },
            { val: "SSE", label: "Real-time Streaming" },
            { val: "ChromaDB", label: "Vector Store" },
          ].map(({ val, label }) => (
            <div key={label} className="landing-stat-cell">
              <span className="landing-stat-val">{val}</span>
              <span className="landing-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-8 py-28">
        <div className="mb-16">
          <div className="landing-eyebrow">Capabilities</div>
          <h2 className="landing-h2">
            Every layer of the RAG stack,
            <br />
            optimized.
          </h2>
        </div>
        <div className="landing-feature-grid">
          {FEATURES.map(({ num, title, body }) => (
            <div key={num} className="landing-feature-card">
              <span className="landing-feature-num">{num}</span>
              <h3 className="landing-feature-title">{title}</h3>
              <p className="landing-feature-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-7xl mx-auto px-8 py-28" style={{ borderTop: "1px solid rgba(240,237,232,0.07)" }}>
        <div className="mb-16">
          <div className="landing-eyebrow">How it works</div>
          <h2 className="landing-h2">
            From document to answer
            <br />
            in three steps.
          </h2>
        </div>
        <div className="landing-steps-grid">
          {STEPS.map(({ n, title, body }) => (
            <div key={n} className="landing-step">
              <span className="landing-step-num">{n}</span>
              <h3 className="landing-step-title">{title}</h3>
              <p className="landing-step-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        className="max-w-7xl mx-auto px-8 py-28"
        style={{ borderTop: "1px solid rgba(240,237,232,0.07)" }}
      >
        <div className="mb-14">
          <div className="landing-eyebrow">FAQ</div>
          <h2 className="landing-h2">Common questions</h2>
        </div>
        <div className="max-w-3xl space-y-0">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="landing-faq-item">
              <summary className="landing-faq-q">
                <span>{q}</span>
                <span className="landing-faq-chevron" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <p className="landing-faq-a">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="px-8 py-32"
        style={{ borderTop: "1px solid rgba(240,237,232,0.07)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-start gap-8">
          <div className="landing-eyebrow">Get started</div>
          <h2 className="landing-h2" style={{ maxWidth: "16ch" }}>
            Ready to query your knowledge base?
          </h2>
          <p className="landing-body" style={{ maxWidth: "34rem" }}>
            Upload your documents and start asking questions in minutes. No infrastructure
            to manage — just intelligence built into your data.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="landing-cta-primary" style={{ padding: "0.9rem 2.25rem" }}>
              Create free account
            </Link>
            <Link href="/login" className="landing-cta-text">
              Already have an account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="landing-footer-brand">DataMind</span>
          <span className="landing-footer-tag">Hybrid RAG · Cohere · Groq · ChromaDB</span>
        </div>
      </footer>
    </div>
  );
}
