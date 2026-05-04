"use client";

import { useChat } from "@/hooks/useChat";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { IconMsgs, IconPen } from "nucleo-glass";

const ICON_MUTED: React.CSSProperties = {
  "--nc-gradient-1-color-1": "#A29D98",
  "--nc-gradient-1-color-2": "#6C6760",
  "--nc-gradient-2-color-1": "rgba(162,157,152,0.3)",
  "--nc-gradient-2-color-2": "rgba(108,103,96,0.15)",
  "--nc-light": "rgba(200,196,192,0.6)",
} as React.CSSProperties;

function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 select-none">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <IconMsgs size="26px" style={ICON_MUTED} />
      </div>
      <h2
        className="text-base font-semibold mb-2 tracking-[-0.01em]"
        style={{ color: "var(--text-1)" }}
      >
        Ask your data anything
      </h2>
      <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
        Hybrid BM25 + semantic search with Cohere reranking delivers precise answers from your indexed documents.
      </p>
    </div>
  );
}

export function ChatWindow() {
  const { messages, streaming, bottomRef, sendMessage, clearMessages } = useChat();

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between shrink-0"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1
          className="font-semibold text-sm tracking-[-0.01em]"
          style={{ color: "var(--text-1)" }}
        >
          Chat
        </h1>
        <button
          onClick={clearMessages}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
          }}
        >
          <IconPen size="13px" style={ICON_MUTED} />
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <div className="max-w-3xl mx-auto space-y-2">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput onSend={sendMessage} disabled={streaming} />
      </div>
    </div>
  );
}
