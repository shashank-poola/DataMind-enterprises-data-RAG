"use client";

import { useState } from "react";
import { IconPaperPlane, IconLoader } from "nucleo-glass";

const ICON_LIGHT: React.CSSProperties = {
  "--nc-gradient-1-color-1": "#FFFFFF",
  "--nc-gradient-1-color-2": "#D0CDD8",
  "--nc-gradient-2-color-1": "rgba(255,255,255,0.4)",
  "--nc-gradient-2-color-2": "rgba(220,217,228,0.25)",
  "--nc-light": "rgba(255,255,255,0.9)",
} as React.CSSProperties;

interface Props {
  onSend: (question: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || disabled) return;
    onSend(question);
    setInput("");
  }

  const canSend = !!input.trim() && !disabled;

  return (
    <div className="px-5 pb-5 pt-2 shrink-0">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        }}
        onFocusCapture={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
        }}
        onBlurCapture={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Ask a question about your data…"
          rows={1}
          className="flex-1 resize-none text-sm bg-transparent focus:outline-none leading-relaxed max-h-36 overflow-y-auto"
          style={{ color: "var(--text-1)", fontFamily: "inherit" }}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 shrink-0"
          style={{
            background: canSend ? "var(--text-1)" : "var(--surface-2)",
            opacity: disabled && !input.trim() ? 0.5 : 1,
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          {disabled ? (
            <IconLoader
              size="17px"
              style={{
                ...ICON_LIGHT,
                animation: "spin 1s linear infinite",
                "--nc-gradient-1-color-1": "#A29D98",
                "--nc-gradient-1-color-2": "#6C6760",
              } as React.CSSProperties}
            />
          ) : (
            <IconPaperPlane size="17px" style={canSend ? ICON_LIGHT : {
              "--nc-gradient-1-color-1": "#A29D98",
              "--nc-gradient-1-color-2": "#6C6760",
              "--nc-gradient-2-color-1": "rgba(162,157,152,0.3)",
              "--nc-gradient-2-color-2": "rgba(108,103,96,0.15)",
            } as React.CSSProperties} />
          )}
        </button>
      </form>

      <p
        className="text-center mt-2.5"
        style={{ color: "var(--text-3)", fontSize: "11px" }}
      >
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
