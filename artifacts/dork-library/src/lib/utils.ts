import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function highlightQuery(query: string): string {
  return query
    .replace(/(site:|filetype:|ext:|intitle:|allintitle:|inurl:|allinurl:|intext:|allintext:|cache:|related:|before:|after:)/gi,
      "<span class='query-operator'>$1</span>")
    .replace(/\{([^}]+)\}/g, "<span class='query-placeholder'>{$1}</span>")
    .replace(/"([^"]+)"/g, '<span class=\'query-value\'>"$1"</span>');
}

export function getDifficultyClass(difficulty?: string | null): string {
  switch (difficulty?.toUpperCase()) {
    case "BEGINNER": return "badge-beginner";
    case "INTERMEDIATE": return "badge-intermediate";
    case "ADVANCED": return "badge-advanced";
    case "EXPERT": return "badge-expert";
    default: return "badge-beginner";
  }
}

export function getStatusClass(status?: string | null): string {
  switch (status?.toUpperCase()) {
    case "PENDING": return "badge-pending";
    case "RUNNING": return "badge-running";
    case "COMPLETED": return "badge-completed";
    case "FAILED": return "badge-failed";
    default: return "badge-pending";
  }
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "..." : str;
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "never";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export const CATEGORY_COLORS: Record<string, string> = {
  "#00ffc8": "rgba(0, 255, 200, 0.15)",
  "#8b5cf6": "rgba(139, 92, 246, 0.15)",
  "#f59e0b": "rgba(245, 158, 11, 0.15)",
  "#ef4444": "rgba(239, 68, 68, 0.15)",
  "#3b82f6": "rgba(59, 130, 246, 0.15)",
  "#10b981": "rgba(16, 185, 129, 0.15)",
  "#ec4899": "rgba(236, 72, 153, 0.15)",
  "#f97316": "rgba(249, 115, 22, 0.15)",
};
