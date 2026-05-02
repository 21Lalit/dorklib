import { useParams, Link } from "wouter";
import { ArrowLeft, FolderTree } from "lucide-react";
import { useGetCategoryBySlug, useListDorks } from "@workspace/api-client-react";
import { DorkCard } from "@/components/DorkCard";
import { CategoryCard } from "@/components/CategoryCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Filters {
  difficulty?: string;
  intentType?: string;
  sortBy?: string;
}

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});

  const { data: cat } = useGetCategoryBySlug(slug);

  const { data: result } = useListDorks({
    page, limit: 18,
    category: slug,
    difficulty: filters.difficulty,
    intentType: filters.intentType,
    sortBy: filters.sortBy as "newest" | "popular" | "copied" | "difficulty" | undefined,
  });

  if (!cat) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const color = cat.color ?? "#00ffc8";

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/categories" className="hover:text-primary flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Categories
        </Link>
        <span>/</span>
        <span className="text-foreground">{cat.name}</span>
      </div>

      <div className="glass-card rounded-xl border border-border/60 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {cat.icon && <span className="text-2xl">{cat.icon}</span>}
              <h1 className="font-orbitron text-2xl font-bold" style={{ color }}>{cat.name}</h1>
            </div>
            {cat.description && <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>}
          </div>
          <div className="font-mono text-3xl font-bold text-primary">{(cat.dorkCount ?? 0).toLocaleString()}<span className="text-sm text-muted-foreground ml-1">dorks</span></div>
        </div>
      </div>

      {cat.subcategories && cat.subcategories.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-primary" /> Subcategories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cat.subcategories.map((sub, i) => (
              <CategoryCard key={sub.id} category={sub} index={i} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <aside className="w-52 shrink-0 hidden md:block">
          <SearchFilters filters={filters} onChange={f => { setFilters(f); setPage(1); }} />
        </aside>
        <div className="flex-1 min-w-0 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Dork Patterns {result && <span className="text-muted-foreground font-normal">({result.total.toLocaleString()})</span>}</h2>
          {!result ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : result.dorks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No dorks in this category yet.</div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.dorks.map(dork => <DorkCard key={dork.id} dork={dork} />)}
              </div>
              {result.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                  <span className="text-xs font-mono text-muted-foreground">{page} / {result.totalPages}</span>
                  <Button size="sm" variant="outline" disabled={page >= result.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
