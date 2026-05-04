import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(start: number, end?: number): string {
  const diff = Math.floor((end ?? Date.now() - start) / 1000);
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${minutes}分${seconds}秒`;
}
