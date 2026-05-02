import { motion } from "framer-motion";
import { Eye, Copy, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { DifficultyBadge } from "./DifficultyBadge";
import { TagBadge } from "./TagBadge";
import { QueryBox } from "./QueryBox";
import { cn, timeAgo, truncate } from "@/lib/utils";

interface DorkCardProps {
  dork: {
    id: number;
    title: string;
    queryTemplate: string;
    description?: string | null;
    difficulty?: string | null;
    intentType?: string | null;
    viewsCount: number;
    copyCount: number;
    createdAt: string;
    primaryCategory?: { name: string; color?: string | null; slug?: string | null } | null;
    tags?: { id: number; name: string; slug: string; tagType?: string | null }[];
  };
  className?: string;
  compact?: boolean;
}

export function DorkCard({ dork, className, compact = false }: DorkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 0 24px rgba(0,255,200,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "glass-card rounded-xl border border-border/60 p-4 flex flex-col gap-3 group hover:border-primary/30 transition-colors",
        className
      )}
      data-testid="dork-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link href={`/dorks/${dork.id}`} className="block">
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {dork.title}
            </h3>
          </Link>
          {dork.primaryCategory && (
            <span className="text-xs text-muted-foreground mt-0.5 block">
              {dork.primaryCategory.name}
            </span>
          )}
        </div>
        <DifficultyBadge difficulty={dork.difficulty} />
      </div>

      <QueryBox query={dork.queryTemplate} dorkId={dork.id} compact />

      {!compact && dork.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {truncate(dork.description, 120)}
        </p>
      )}

      {dork.tags && dork.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {dork.tags.slice(0, 4).map(tag => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
          {dork.tags.length > 4 && (
            <span className="text-xs text-muted-foreground px-1">+{dork.tags.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2 mt-auto">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {dork.viewsCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Copy className="h-3 w-3" />
            {dork.copyCount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>{timeAgo(dork.createdAt)}</span>
          <Link href={`/dorks/${dork.id}`} className="hover:text-primary transition-colors">
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
