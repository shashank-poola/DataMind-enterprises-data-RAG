import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function nanoid(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 21);
}
