import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataMind — Enterprise RAG",
  description: "AI-powered data intelligence for your enterprise",
  icons: {
    icon: "/images/logo.jpg",
    shortcut: "/images/logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
