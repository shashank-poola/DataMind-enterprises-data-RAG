import type { Message } from "@/types";
import { SourcesPanel } from "./SourcesPanel";
import { ThinkingSteps } from "./ThinkingSteps";
import { DotmSquare11 } from "@/components/ui/dotm-square-11";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-1">
        <div
          className="max-w-[72%] rounded-2xl rounded-tr-md px-4 py-2.5 text-sm leading-relaxed"
          style={{ background: "#1A1917", color: "#F0EDE8", border: "1px solid rgba(240,237,232,0.06)" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  const isInitialLoading =
    message.isStreaming &&
    !message.content &&
    (!message.thinking || message.thinking.length === 0);

  return (
    <div className="flex justify-start mb-1">
      <div
        className="max-w-[78%] rounded-2xl rounded-tl-md px-4 py-3.5 text-sm leading-relaxed"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-1)",
        }}
      >
        {/* Initial loading before first thinking step */}
        {isInitialLoading && (
          <div className="flex items-center gap-3 py-1">
            <DotmSquare11
              size={20}
              dotSize={3}
              color="var(--text-3)"
              speed={1.0}
              opacityBase={0.12}
              opacityMid={0.28}
              opacityPeak={0.7}
            />
            <span className="text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}>
              Retrieving…
            </span>
          </div>
        )}

        {/* Thinking steps (SSE streaming) */}
        {message.thinking && message.thinking.length > 0 && (
          <ThinkingSteps steps={message.thinking} isStreaming={message.isStreaming} />
        )}

        {/* Content */}
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
        ) : message.isStreaming && message.thinking?.length && !message.content ? (
          /* Still streaming but content not arrived yet — don't show extra loader */
          null
        ) : null}

        {/* Sources */}
        {!message.isStreaming && message.sources && message.sources.length > 0 && (
          <SourcesPanel sources={message.sources} />
        )}

        {/* Latency */}
        {message.latency_ms != null && !message.isStreaming && (
          <p
            className="text-xs mt-2.5 tabular-nums"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}
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
