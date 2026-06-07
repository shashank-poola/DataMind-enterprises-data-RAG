"use client";

import Image from "next/image";
import Link from "next/link";
import logoImg from "../../public/images/logo.jpg";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getUser } from "@/lib/auth";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BubbleChatIcon,
  File01Icon,
  BarChartIcon,
  Logout01Icon,
  Setting06Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { apiAnalyticsSummary } from "@/lib/api/analytics";
import type { RecentQuery } from "@/types";

const NAV = [
  { href: "/chat", label: "Playground", icon: BubbleChatIcon },
  { href: "/documents", label: "Documents", icon: File01Icon },
  { href: "/analytics", label: "History", icon: BarChartIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const [history, setHistory] = useState<RecentQuery[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    apiAnalyticsSummary()
      .then((d) => setHistory(d.recent_queries.slice(0, 5)))
      .catch(() => {});
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div
      className="w-[210px] flex flex-col shrink-0"
      style={{ background: "#080706", borderRight: "1px solid #141312" }}
    >
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl overflow-hidden shrink-0"
          style={{ border: "1px solid #1E1D1C" }}
        >
          <Image
            src={logoImg}
            alt="DataMind"
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        </div>
        <span
          style={{
            fontFamily: "var(--font-screener)",
            fontSize: "1.1rem",
            color: "#F0EDE8",
            letterSpacing: "0.01em",
          }}
        >
          DataMind
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          const isPlayground = href === "/chat";

          return (
            <div key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 mb-0.5"
                style={{
                  background: active ? "#1A1917" : "transparent",
                  color: active ? "#F0EDE8" : "#5A5652",
                  fontFamily: "var(--font-screener)",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "#111110";
                    (e.currentTarget as HTMLElement).style.color = "#9A9490";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#5A5652";
                  }
                }}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className="font-medium">{label}</span>
              </Link>

              {/* History mini-list below Playground */}
              {isPlayground && history.length > 0 && (
                <div
                  className="mx-2 mb-2 pb-2"
                  style={{ borderBottom: "1px solid #1A1917" }}
                >
                  {history.map((q) => (
                    <Link
                      key={q.id}
                      href="/chat"
                      className="flex items-start gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 group"
                      style={{ color: "#3A3835" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#111110";
                        (e.currentTarget as HTMLElement).style.color = "#6A6560";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#3A3835";
                      }}
                    >
                      <span
                        className="shrink-0 w-1 h-1 rounded-full"
                        style={{ background: "#2A2826", marginTop: "6px" }}
                      />
                      <span
                        className="text-xs leading-relaxed truncate"
                        style={{ fontFamily: "var(--font-screener)", fontSize: "11px" }}
                      >
                        {q.query.length > 36 ? q.query.slice(0, 36) + "…" : q.query}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-2.5 pb-4 pt-3" style={{ borderTop: "1px solid #141312" }}>
        {/* Expandable menu when open */}
        {profileOpen && (
          <div className="mb-1 rounded-xl overflow-hidden" style={{ background: "#111110", border: "1px solid #1A1917" }}>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all duration-150"
              style={{ color: "#5A5652", fontFamily: "var(--font-screener)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#161514";
                (e.currentTarget as HTMLElement).style.color = "#8A857F";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#5A5652";
              }}
            >
              <HugeiconsIcon icon={Setting06Icon} size={13} color="currentColor" strokeWidth={1.5} />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all duration-150"
              style={{ color: "#5A5652", fontFamily: "var(--font-screener)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#161514";
                (e.currentTarget as HTMLElement).style.color = "#C07070";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#5A5652";
              }}
            >
              <HugeiconsIcon icon={Logout01Icon} size={13} color="currentColor" strokeWidth={1.5} />
              <span>Sign out</span>
            </button>
          </div>
        )}

        {/* Profile row — click to toggle menu */}
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200"
          style={{
            background: profileOpen ? "#111110" : "transparent",
            border: profileOpen ? "1px solid #1A1917" : "1px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (!profileOpen) {
              (e.currentTarget as HTMLElement).style.background = "#111110";
              (e.currentTarget as HTMLElement).style.borderColor = "#1A1917";
            }
          }}
          onMouseLeave={(e) => {
            if (!profileOpen) {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            }
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs"
            style={{
              background: "#1A1917",
              color: "#8A857F",
              border: "1px solid #252321",
              fontFamily: "var(--font-screener)",
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs truncate" style={{ color: "#C4C0BA", fontFamily: "var(--font-screener)" }}>
              {user?.name ?? "User"}
            </p>
            <p className="truncate" style={{ color: "#3A3835", fontFamily: "var(--font-screener)", fontSize: "10px" }}>
              {user?.email ?? ""}
            </p>
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={12}
            color="#3A3835"
            strokeWidth={1.5}
            style={{
              transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
          />
        </button>
      </div>
    </div>
  );
}
