"use client";

import { createContext, useContext, useState } from "react";

interface SidebarCtx {
  isOpen: boolean;
  toggle: () => void;
}

const Ctx = createContext<SidebarCtx>({ isOpen: true, toggle: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Ctx.Provider value={{ isOpen, toggle: () => setIsOpen((v) => !v) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSidebar() {
  return useContext(Ctx);
}
