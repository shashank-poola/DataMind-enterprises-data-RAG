"use client";

import Image from "next/image";
import { useChat } from "@/hooks/useChat";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatAddIcon, SidebarLeft01Icon, SidebarRight01Icon } from "@hugeicons/core-free-icons";
import { useSidebar } from "@/contexts/sidebar";

function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 select-none gap-7">
      {/* Logo */}
      <div
        className="w-20 h-20 rounded-[22px] overflow-hidden transition-transform duration-300"
        style={{
          border: "1px solid rgba(240,237,232,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(240,237,232,0.04)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        }}
      >
        <Image
          src="/images/logo.jpg"
          alt="DataMind"
          width={80}
          height={80}
          className="object-cover w-full h-full"
        />
      </div>

      <div>
        <h2
          className="mb-2"
          style={{
            fontFamily: "var(--font-screener)",
            fontSize: "1.4rem",
            color: "var(--text-1)",
            letterSpacing: "0.01em",
          }}
        >
          Stop searching. Start knowing.
        </h2>
        <p
          className="text-sm leading-relaxed max-w-xs"
          style={{ color: "var(--text-3)" }}
        >
          Every answer is already in your documents.
          Ask and let the machine find it.
        </p>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {[
          "What are the key findings?",
          "Summarize this for me",
          "Find contradictions in…",
        ].map((s) => (
          <span
            key={s}
            className="text-xs px-3 py-1.5 rounded-full transition-all duration-150"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-3)",
              cursor: "default",
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ChatWindow() {
  const { messages, streaming, bottomRef, sendMessage, clearMessages } = useChat();
  const { isOpen, toggle } = useSidebar();

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center justify-between shrink-0"
        style={{ background: "var(--bg)" }}
      >
        {/* Left: sidebar toggle — SidebarLeft01 when open (click to close), SidebarRight01 when closed (click to open) */}
        <button
          onClick={toggle}
          className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150"
          style={{ color: "var(--text-3)" }}
          title={isOpen ? "Close sidebar" : "Open sidebar"}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
          }}
        >
          <HugeiconsIcon
            icon={isOpen ? SidebarLeft01Icon : SidebarRight01Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>

        {/* Right: New chat */}
        <button
          onClick={clearMessages}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150"
          style={{
            color: "var(--text-3)",
            fontFamily: "var(--font-screener)",
            border: "1px solid transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
          }}
        >
          <HugeiconsIcon icon={BubbleChatAddIcon} size={13} color="currentColor" strokeWidth={1.5} />
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
