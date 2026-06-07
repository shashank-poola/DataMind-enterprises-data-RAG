"use client";

import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar";

function Inner({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  return (
    <div className="flex h-full" style={{ background: "var(--bg)" }}>
      {isOpen && <Sidebar />}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Inner>{children}</Inner>
    </SidebarProvider>
  );
}
