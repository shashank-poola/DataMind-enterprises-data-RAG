import type { Document } from "@/types";
import { authHeader, request } from "./client";

export function apiListDocuments() {
  return request<{ documents: Document[]; total: number }>("/api/v1/documents");
}

export async function apiUploadDocument(file: File): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/v1/documents", {
    method: "POST",
    headers: authHeader(), // no Content-Type — browser sets multipart boundary
    body: form,
  });
  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Upload failed");
  }
  return res.json();
}

export async function apiDeleteDocument(id: string): Promise<void> {
  await fetch(`/api/v1/documents/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
}
