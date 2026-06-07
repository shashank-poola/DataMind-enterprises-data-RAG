"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  Database01Icon,
  BarChartIcon,
  Loading02Icon,
} from "@hugeicons/core-free-icons";
import { DotmSquare11 } from "@/components/ui/dotm-square-11";

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
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
      <div className="flex items-center justify-between">
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)", letterSpacing: "0.14em" }}
        >
          {label}
        </span>
        <HugeiconsIcon icon={icon} size={16} color="var(--text-3)" strokeWidth={1.5} />
      </div>
      <div>
        <p
          style={{
            fontFamily: "var(--font-screener)",
            fontSize: "2rem",
            color: "var(--text-1)",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 h-28 animate-pulse"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    />
  );
}

export default function HistoryPage() {
  const { data, loading, error } = useAnalytics();

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg)" }}>
      <div className="px-8 py-7 max-w-5xl">
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
            History
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            Query history and workspace insights
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(220,60,60,0.06)",
              border: "1px solid rgba(220,60,60,0.15)",
              color: "#E07070",
            }}
          >
            {error}
          </div>
        )}

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Documents" value={data.total_documents} icon={File01Icon} />
              <StatCard
                label="Indexed"
                value={data.indexed_documents}
                sub={`${data.total_documents - data.indexed_documents} pending`}
                icon={Database01Icon}
              />
              <StatCard label="Total queries" value={data.total_queries} icon={BarChartIcon} />
              <StatCard
                label="Avg. latency"
                value={
                  data.avg_latency_ms >= 1000
                    ? `${(data.avg_latency_ms / 1000).toFixed(1)}s`
                    : `${data.avg_latency_ms}ms`
                }
                sub="last 100 queries"
                icon={Loading02Icon}
              />
            </div>

            {/* Query history */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-screener)",
                    fontSize: "0.95rem",
                    color: "var(--text-1)",
                  }}
                >
                  Recent queries
                </h2>
                <span
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text-3)",
                    fontFamily: "var(--font-screener)",
                  }}
                >
                  {data.recent_queries.length} shown
                </span>
              </div>

              {data.recent_queries.length === 0 ? (
                <div className="px-6 py-12 flex flex-col items-center gap-4">
                  <DotmSquare11
                    size={28}
                    dotSize={4}
                    color="var(--text-3)"
                    speed={0.7}
                    opacityBase={0.08}
                    opacityMid={0.18}
                    opacityPeak={0.45}
                  />
                  <p className="text-sm" style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}>
                    No queries yet — try asking something in the Playground
                  </p>
                </div>
              ) : (
                <div>
                  {/* Table header */}
                  <div
                    className="grid px-6 py-2.5"
                    style={{
                      gridTemplateColumns: "1fr 100px 120px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {["Query", "Latency", "Time"].map((h) => (
                      <span
                        key={h}
                        className="text-xs"
                        style={{
                          color: "var(--text-3)",
                          fontFamily: "var(--font-screener)",
                          letterSpacing: "0.06em",
                          textAlign: h === "Query" ? "left" : "right",
                        }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {data.recent_queries.map((q, i) => (
                    <div
                      key={q.id}
                      className="grid px-6 py-3.5 transition-colors duration-150"
                      style={{
                        gridTemplateColumns: "1fr 100px 120px",
                        borderBottom:
                          i < data.recent_queries.length - 1 ? "1px solid var(--border)" : "none",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <p
                        className="text-sm truncate pr-4"
                        style={{ color: "var(--text-2)" }}
                      >
                        {q.query}
                      </p>
                      <p
                        className="text-sm tabular-nums text-right"
                        style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}
                      >
                        {q.latency_ms >= 1000
                          ? `${(q.latency_ms / 1000).toFixed(1)}s`
                          : `${q.latency_ms}ms`}
                      </p>
                      <p
                        className="text-xs tabular-nums text-right"
                        style={{ color: "var(--text-3)", fontFamily: "var(--font-screener)" }}
                      >
                        {new Date(q.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
