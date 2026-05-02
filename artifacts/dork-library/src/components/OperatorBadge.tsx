import { cn } from "@/lib/utils";

interface OperatorType {
  id: number;
  name: string;
  syntax: string;
}

interface Props {
  operator: OperatorType;
  className?: string;
}

export function OperatorBadge({ operator, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono",
        "bg-yellow-500/10 text-yellow-300 border border-yellow-500/25",
        className
      )}
      data-testid="operator-badge"
      title={operator.name}
    >
      {operator.syntax}
    </span>
  );
}
