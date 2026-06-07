"use client";

import { useCallback, useRef, useState } from "react";
import { apiUploadDocument, apiDeleteDocument } from "@/lib/api";
import { useDocuments } from "@/hooks/useDocuments";
import type { Document } from "@/types";

const FILE_LABELS: Record<string, string> = { pdf: "PDF", csv: "CSV", txt: "TXT", md: "MD" };

const STATUS_STYLE: Record<string, { bg: string; color: string; dot?: string }> = {
  indexed: { bg: "rgba(52,199,89,0.08)", color: "#4ADE80", dot: undefined },
  indexing: { bg: "rgba(99,102,241,0.08)", color: "#818CF8", dot: "#818CF8" },
  pending: { bg: "rgba(240,237,232,0.05)", color: "#6A6560" },
  failed: { bg: "rgba(220,60,60,0.08)", color: "#E07070" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}22`,
        fontFamily: "var(--font-screener)",
      }}
    >
      {status === "indexing" && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
          style={{ background: s.dot }}
        />
      )}
      {status}
    </span>
  );
}

function DocumentCard({ doc, onDelete }: { doc: Document; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    setDeleting(true);
    await apiDeleteDocument(doc.id);
    onDelete(doc.id);
  }

  const date = new Date(doc.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 transition-all duration-200"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
        (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.background = "var(--surface)";
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <span
            className="text-xs"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)", letterSpacing: "0.05em" }}
          >
            {FILE_LABELS[doc.file_type] ?? doc.file_type.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm truncate"
            style={{ color: "var(--text-1)", fontFamily: "var(--font-screener)" }}
          >
            {doc.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}>
            {date}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={doc.status} />
          {doc.status === "indexed" && (
            <span className="text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}>
              {doc.chunk_count} chunks
            </span>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs transition-colors duration-150 disabled:opacity-50"
          style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#E07070")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-3)")}
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>

      {doc.error && (
        <p
          className="text-xs rounded-lg px-3 py-2 truncate"
          style={{
            color: "#E07070",
            background: "rgba(220,60,60,0.06)",
            border: "1px solid rgba(220,60,60,0.15)",
            fontFamily: "var(--font-screener)",
          }}
        >
          {doc.error}
        </p>
      )}
    </div>
  );
}

function UploadZone({ onUploaded }: { onUploaded: (doc: Document) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setUploadError("");
      setUploading(true);
      for (const file of Array.from(files)) {
        try {
          const doc = await apiUploadDocument(file);
          onUploaded(doc);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "Upload failed");
        }
      }
      setUploading(false);
    },
    [onUploaded]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className="rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
      style={{
        border: `1.5px dashed ${dragging ? "rgba(240,237,232,0.2)" : "rgba(240,237,232,0.08)"}`,
        background: dragging ? "rgba(240,237,232,0.03)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!dragging) (e.currentTarget as HTMLElement).style.borderColor = "rgba(240,237,232,0.14)";
      }}
      onMouseLeave={(e) => {
        if (!dragging) (e.currentTarget as HTMLElement).style.borderColor = "rgba(240,237,232,0.08)";
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.csv,.txt,.md"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-2">
        {uploading ? (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin" style={{ color: "var(--text-3)" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p className="text-sm" style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}>Uploading…</p>
          </>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-3)" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div>
              <p className="text-sm" style={{ color: "var(--text-2)", fontFamily: "var(--font-screener)" }}>
                {dragging ? "Drop files here" : "Drop files or click to upload"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}>
                PDF, CSV, TXT, MD supported
              </p>
            </div>
          </>
        )}
      </div>
      {uploadError && (
        <p className="text-xs mt-3" style={{ color: "#E07070", fontFamily: "var(--font-screener)" }}>
          {uploadError}
        </p>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const { docs, loading, error, indexedCount, addDocument, removeDocument } = useDocuments();

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg)" }}>
      <div className="px-8 py-7 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1
            style={{
              fontFamily: "var(--font-screener)",
              fontSize: "1.5rem",
              color: "var(--text-1)",
              letterSpacing: "0.01em",
            }}
          >
            Documents
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}>
            {indexedCount} of {docs.length} indexed
          </p>
        </div>

        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(220,60,60,0.06)",
              border: "1px solid rgba(220,60,60,0.15)",
              color: "#E07070",
              fontFamily: "var(--font-screener)",
            }}
          >
            {error}
          </div>
        )}

        <div className="mb-8">
          <UploadZone onUploaded={addDocument} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-4 space-y-3 animate-pulse"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", height: "112px" }}
              />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}>
              No documents yet. Upload your first file above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {docs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={removeDocument} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
