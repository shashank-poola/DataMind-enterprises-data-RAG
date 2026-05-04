"use client";

import { useState } from "react";
import type { SourceDocument } from "@/types";
import { IconBookOpen } from "nucleo-glass";

const ICON_MUTED: React.CSSProperties = {
  "--nc-gradient-1-color-1": "#A29D98",
  "--nc-gradient-1-color-2": "#6C6760",
  "--nc-gradient-2-color-1": "rgba(162,157,152,0.3)",
  "--nc-gradient-2-color-2": "rgba(108,103,96,0.15)",
  "--nc-light": "rgba(200,196,192,0.6)",
} as React.CSSProperties;

export function SourcesPanel({ sources }: { sources: SourceDocument[] }) {
  const [open, setOpen] = useState(false);
  if (!sources.length) return null;

  return (
    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 transition-colors"
        style={{ color: open ? "var(--text-2)" : "var(--text-3)" }}
      >
        <IconBookOpen size="14px" style={ICON_MUTED} />
        <span className="text-xs font-medium">
          {sources.length} source{sources.length !== 1 ? "s" : ""}
        </span>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-2.5 space-y-2">
          {sources.map((s, i) => (
            <div
              key={i}
              className="rounded-lg p-3 text-xs"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
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
                  className="mt-1.5 font-medium tabular-nums"
                  style={{ color: "var(--text-3)", fontSize: "10px" }}
                >
                  Score: {s.rerank_score.toFixed(3)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
