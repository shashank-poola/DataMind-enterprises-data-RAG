"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getUser } from "@/lib/auth";
import {
  IconMsgs,
  IconFiles,
  IconSquareChartLine,
  IconCirclePowerOff,
  IconSparkle,
} from "nucleo-glass";

const ICON_ACTIVE: React.CSSProperties = {
  "--nc-gradient-1-color-1": "#FFFFFF",
  "--nc-gradient-1-color-2": "#D0CEC9",
  "--nc-gradient-2-color-1": "rgba(255,255,255,0.35)",
  "--nc-gradient-2-color-2": "rgba(200,198,195,0.2)",
  "--nc-light": "rgba(255,255,255,0.9)",
} as React.CSSProperties;

const ICON_MUTED: React.CSSProperties = {
  "--nc-gradient-1-color-1": "#6B6760",
  "--nc-gradient-1-color-2": "#4A4846",
  "--nc-gradient-2-color-1": "rgba(120,118,115,0.3)",
  "--nc-gradient-2-color-2": "rgba(90,88,85,0.15)",
  "--nc-light": "rgba(150,148,145,0.6)",
} as React.CSSProperties;

const ICON_DANGER: React.CSSProperties = {
  "--nc-gradient-1-color-1": "#7A7571",
  "--nc-gradient-1-color-2": "#5A5652",
  "--nc-gradient-2-color-1": "rgba(130,126,122,0.3)",
  "--nc-gradient-2-color-2": "rgba(100,96,92,0.15)",
  "--nc-light": "rgba(160,156,152,0.6)",
} as React.CSSProperties;

const NAV = [
  { href: "/chat", label: "Chat", Icon: IconMsgs },
  { href: "/documents", label: "Documents", Icon: IconFiles },
  { href: "/analytics", label: "Analytics", Icon: IconSquareChartLine },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div
      className="w-[210px] flex flex-col shrink-0 border-r"
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #3D3B38 0%, #252321 100%)" }}
        >
          <IconSparkle size="14px" style={ICON_ACTIVE} />
        </div>
        <span className="font-semibold text-white text-sm tracking-[-0.01em]">DataMind</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-1 space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
              style={{
                background: active ? "#2A2826" : "transparent",
                color: active ? "#FFFFFF" : "#6B6760",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "#1F1E1C";
                  (e.currentTarget as HTMLElement).style.color = "#B8B4AF";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#6B6760";
                }
              }}
            >
              <Icon size="18px" style={active ? ICON_ACTIVE : ICON_MUTED} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-2.5 pb-4 pt-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-2.5 px-3 py-2 mb-0.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
            style={{ background: "#2A2826", color: "#B8B4AF" }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "#D4D2CF" }}>
              {user?.name ?? "User"}
            </p>
            <p className="text-xs truncate" style={{ color: "#4A4846" }}>
              {user?.email ?? ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-150"
          style={{ color: "#4A4846" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#1F1E1C";
            (e.currentTarget as HTMLElement).style.color = "#9A9693";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#4A4846";
          }}
        >
          <IconCirclePowerOff size="15px" style={ICON_DANGER} />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
}
