import { getDifficultyClass } from "@/lib/utils";

interface Props {
  difficulty?: string | null;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: Props) {
  if (!difficulty) return null;
  const label = difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono ${getDifficultyClass(difficulty)} ${className ?? ""}`}
      data-testid="difficulty-badge"
    >
      {label}
    </span>
  );
}
