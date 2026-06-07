"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SquareArrowUp01Icon, Loading02Icon } from "@hugeicons/core-free-icons";

interface Props {
  onSend: (question: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || disabled) return;
    onSend(question);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  const canSend = !!input.trim() && !disabled;

  return (
    <div className="px-5 pb-5 pt-2 shrink-0">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
        style={{
          background: "var(--surface)",
          border: `1px solid ${focused ? "var(--border-strong)" : "var(--border)"}`,
          boxShadow: focused
            ? "0 0 0 3px rgba(26,25,23,0.05), 0 4px 16px rgba(0,0,0,0.07)"
            : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoResize(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask a question about your data…"
          rows={1}
          className="flex-1 resize-none bg-transparent focus:outline-none"
          style={{
            color: "var(--text-1)",
            fontFamily: "var(--font-screener)",
            fontSize: "0.875rem",
            lineHeight: "1.6",
            paddingTop: "2px",
            overflowY: "hidden",
          }}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 shrink-0"
          style={{
            background: canSend ? "#1A1917" : "var(--surface-2)",
            color: canSend ? "#F0EDE8" : "var(--text-3)",
            transform: "scale(1)",
            cursor: canSend ? "pointer" : "default",
          }}
          onMouseEnter={(e) => {
            if (canSend) {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
              (e.currentTarget as HTMLElement).style.background = "#080706";
            }
          }}
          onMouseLeave={(e) => {
            if (canSend) {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.background = "#1A1917";
            }
          }}
          onMouseDown={(e) => {
            if (canSend) (e.currentTarget as HTMLElement).style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            if (canSend) (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
          }}
        >
          {disabled ? (
            <HugeiconsIcon icon={Loading02Icon} size={16} color="currentColor" strokeWidth={2} className="animate-spin" />
          ) : (
            <HugeiconsIcon icon={SquareArrowUp01Icon} size={16} color="currentColor" strokeWidth={2} />
          )}
        </button>
      </form>

      <p
        className="text-center mt-2.5"
        style={{ color: "var(--text-3)", fontSize: "11px", fontFamily: "var(--font-screener)" }}
      >
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
