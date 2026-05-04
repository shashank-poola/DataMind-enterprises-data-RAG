"use client";

import { useState } from "react";
import type { ThinkingStep } from "@/types";

interface Props {
  steps: ThinkingStep[];
  isStreaming?: boolean;
}

export function ThinkingSteps({ steps, isStreaming }: Props) {
  const [open, setOpen] = useState(false);
  if (!steps.length) return null;

  if (isStreaming) {
    return (
      <div
        className="mb-3 rounded-xl p-3"
        style={{
          background: "var(--thinking-bg)",
          border: "1px solid var(--thinking-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex gap-1">
            <span
              className="thinking-dot w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--thinking-text)" }}
            />
            <span
              className="thinking-dot w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--thinking-text)" }}
            />
            <span
              className="thinking-dot w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--thinking-text)" }}
            />
          </div>
          <span
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--thinking-text)", fontSize: "10px", letterSpacing: "0.06em" }}
          >
            Reasoning
          </span>
        </div>

        <div className="space-y-2">
          {steps.map((s, i) => {
            const isCurrent = i === steps.length - 1;
            return (
              <div key={i} className="step-enter flex items-start gap-2.5">
                <span className="mt-[3px] shrink-0">
                  {isCurrent ? (
                    <span
                      className="block w-2 h-2 rounded-full border-2"
                      style={{
                        borderColor: "var(--thinking-text)",
                        borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : (
                    <svg
                      width="8" height="8" viewBox="0 0 8 8" fill="none"
                    >
                      <circle cx="4" cy="4" r="3.5" stroke="#C4B5FD" strokeWidth="1" fill="#EDE9FE" />
                      <path d="M2.5 4L3.5 5L5.5 3" stroke="#7C3AED" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: isCurrent ? "var(--thinking-text)" : "#7C6FAD", fontWeight: isCurrent ? 500 : 400 }}
                >
                  {s.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 transition-colors"
        style={{ color: open ? "var(--text-2)" : "var(--text-3)" }}
      >
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-xs font-medium">
          {open ? "Hide" : "Show"} reasoning ({steps.length} steps)
        </span>
      </button>

      {open && (
        <div
          className="mt-2.5 pl-3 space-y-1.5"
          style={{ borderLeft: "2px solid var(--border)" }}
        >
          {steps.map((s, i) => (
            <p key={i} className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
              {s.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
