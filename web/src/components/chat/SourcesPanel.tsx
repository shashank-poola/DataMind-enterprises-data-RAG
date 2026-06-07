"use client";

import { useState } from "react";
import type { SourceDocument } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Database01Icon } from "@hugeicons/core-free-icons";

export function SourcesPanel({ sources }: { sources: SourceDocument[] }) {
  const [open, setOpen] = useState(false);
  if (!sources.length) return null;

  return (
    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 transition-colors duration-150"
        style={{ color: open ? "var(--text-2)" : "var(--text-3)", fontFamily: "var(--font-screener)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = open ? "var(--text-2)" : "var(--text-3)";
        }}
      >
        <HugeiconsIcon icon={Database01Icon} size={13} color="currentColor" strokeWidth={1.5} />
        <span className="text-xs font-medium">
          {sources.length} source{sources.length !== 1 ? "s" : ""}
        </span>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-2.5 space-y-2">
          {sources.map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-xs transition-colors duration-150"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                fontFamily: "var(--font-screener)",
              }}
            >
              {s.document_name && (
                <p
                  className="font-semibold mb-1 truncate"
                  style={{ color: "var(--text-2)" }}
                >
                  {s.document_name}
                </p>
              )}
              <p
                className="leading-relaxed line-clamp-3"
                style={{ color: "var(--text-3)" }}
              >
                {s.content}
              </p>
              {s.rerank_score != null && (
                <p
                  className="mt-1.5 tabular-nums"
                  style={{ color: "var(--text-3)", fontSize: "10px" }}
                >
                  Rerank score: {s.rerank_score.toFixed(3)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
