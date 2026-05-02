import { cn } from "@/lib/utils";

interface TagType {
  id: number;
  name: string;
  slug: string;
  tagType?: string | null;
}

interface Props {
  tag: TagType;
  className?: string;
  onClick?: () => void;
}

export function TagBadge({ tag, className, onClick }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono cursor-default",
        "bg-primary/10 text-primary border border-primary/20 hover:border-primary/40 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      data-testid="tag-badge"
    >
      #{tag.name}
    </span>
  );
}
