import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    dorkCount?: number;
    subcategories?: { id: number; name: string; dorkCount?: number }[];
  };
  className?: string;
  index?: number;
}

export function CategoryCard({ category, className, index = 0 }: CategoryCardProps) {
  const color = category.color ?? "#00ffc8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 280, damping: 24 }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={cn(
        "glass-card rounded-xl border border-border/60 p-5 flex flex-col gap-3 cursor-pointer group hover:border-primary/30 transition-all relative overflow-hidden",
        className
      )}
      data-testid="category-card"
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
      <Link href={`/categories/${category.slug}`} className="flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {category.icon && <span className="text-xl">{category.icon}</span>}
            <h3
              className="font-semibold text-sm group-hover:text-primary transition-colors"
              style={{ color: color !== "#00ffc8" ? color : undefined }}
            >
              {category.name}
            </h3>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
        </div>

        {category.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {category.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border/40">
          <span className="font-mono">{(category.dorkCount ?? 0).toLocaleString()} dorks</span>
          {category.subcategories && category.subcategories.length > 0 && (
            <span>{category.subcategories.length} subcategories</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
