import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useListDorks } from "@workspace/api-client-react";
import { DorkCard } from "@/components/DorkCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

type ViewMode = "grid" | "list";

interface Filters {
  q?: string;
  category?: string;
  tag?: string;
  difficulty?: string;
  intentType?: string;
  platform?: string;
  operator?: string;
  sourceType?: string;
  sortBy?: string;
}

function parseQuery(search: string): Filters {
  const params = new URLSearchParams(search.replace(/^\?/, ""));
  const result: Filters = {};
  for (const key of ["q", "category", "tag", "difficulty", "intentType", "platform", "operator", "sourceType", "sortBy"] as const) {
    const v = params.get(key);
    if (v) result[key] = v;
  }
  return result;
}

export default function Dorks() {
  const [location] = useLocation();
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => parseQuery(window.location.search));

  useEffect(() => {
    setFilters(parseQuery(window.location.search));
    setPage(1);
  }, [location]);

  const { data: result } = useListDorks({
    page,
    limit: 24,
    q: filters.q,
    difficulty: filters.difficulty,
    intentType: filters.intentType,
    sourceType: filters.sourceType,
    sortBy: filters.sortBy as "newest" | "popular" | "copied" | "difficulty" | undefined,
  });

  const [q, setQ] = useState(filters.q ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilters(f => ({ ...f, q: q.trim() || undefined }));
    setPage(1);
  }

  const dorks = result?.dorks ?? [];
  const loading = result === undefined;
  const totalPages = result?.totalPages ?? 1;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground">Dork Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {result?.total !== undefined ? `${result.total.toLocaleString()} patterns` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowFilters(f => !f)} className="gap-1.5 md:hidden">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </Button>
          <Button size="sm" variant={view === "grid" ? "default" : "outline"} onClick={() => setView("grid")}>
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}>
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className={`w-56 shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
          <SearchFilters filters={filters} onChange={f => { setFilters(f); setPage(1); }} />
        </aside>

        <div className="flex-1 min-w-0 space-y-4">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search patterns, operators, keywords..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-card/80 border border-border rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono"
              data-testid="dorks-search"
            />
          </form>

          {loading ? (
            <div className={view === "grid" ? "grid md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : dorks.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No dorks found</p>
              <p className="text-xs mt-1">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className={view === "grid" ? "grid md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
                {dorks.map(dork => <DorkCard key={dork.id} dork={dork} compact={view === "list"} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                  <span className="text-xs text-muted-foreground font-mono">{page} / {totalPages}</span>
                  <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
