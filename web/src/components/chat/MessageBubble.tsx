import type { Message } from "@/types";
import { SourcesPanel } from "./SourcesPanel";
import { ThinkingSteps } from "./ThinkingSteps";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-1">
        <div
          className="max-w-[72%] rounded-2xl rounded-tr-md px-4 py-2.5 text-sm leading-relaxed"
          style={{ background: "var(--text-1)", color: "#FFFFFF" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-1">
      <div
        className="max-w-[78%] rounded-2xl rounded-tl-md px-4 py-3.5 text-sm leading-relaxed shadow-sm"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-1)",
        }}
      >
        {message.thinking && message.thinking.length > 0 && (
          <ThinkingSteps steps={message.thinking} isStreaming={message.isStreaming} />
        )}

        {message.content ? (
          <div className="whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span
                className="cursor-blink inline-block w-0.5 h-[1.1em] rounded-sm ml-0.5 align-text-bottom"
                style={{ background: "var(--text-3)" }}
              />
            )}
          </div>
        ) : message.isStreaming && !message.thinking?.length ? (
          <div className="flex gap-1 py-0.5">
            <span className="thinking-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-3)" }} />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-3)" }} />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-3)" }} />
          </div>
        ) : null}

        {!message.isStreaming && message.sources && message.sources.length > 0 && (
          <SourcesPanel sources={message.sources} />
        )}

        {message.latency_ms != null && !message.isStreaming && (
          <p
            className="text-xs mt-2.5 tabular-nums"
            style={{ color: "var(--text-3)" }}
          >
            {message.latency_ms < 1000
              ? `${message.latency_ms}ms`
              : `${(message.latency_ms / 1000).toFixed(1)}s`}
          </p>
        )}
      </div>
    </div>
  );
}
