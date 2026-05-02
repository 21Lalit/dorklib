import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Database, FolderTree, Globe, Zap, TrendingUp, Clock, Shield } from "lucide-react";
import { Link } from "wouter";
import { useGetStats, useGetTrendingDorks, useGetRecentDorks, useListCategories } from "@workspace/api-client-react";
import { StatsCard } from "@/components/StatsCard";
import { DorkCard } from "@/components/DorkCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/hooks/use-navigate";

export default function Home() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data: stats } = useGetStats();
  const { data: trending } = useGetTrendingDorks({ limit: 6 });
  const { data: recent } = useGetRecentDorks({ limit: 6 });
  const { data: categories } = useListCategories();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) navigate(`/dorks?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="relative max-w-screen-xl mx-auto px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6">
              <Shield className="h-3 w-3" />
              Cybersecurity Intelligence Library
            </div>
            <h1 className="font-orbitron text-4xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="text-glow-cyan text-primary">DORK</span>
              <span className="text-foreground">LIB</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              A professional intelligence library for collecting, categorizing, and exploring Google-style search dork patterns for OSINT and security research.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground z-10" />
                <input
                  type="search"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search dork patterns, operators, categories..."
                  className="w-full pl-12 pr-36 py-4 text-sm bg-card/80 border border-border/80 rounded-xl focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50 font-mono backdrop-blur-md"
                  data-testid="hero-search"
                />
                <Button
                  type="submit"
                  className="absolute right-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm"
                  size="sm"
                >
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Popular:</span>
              {["site: filetype:", "intitle:admin", "inurl:api", "ext:env"].map(s => (
                <button
                  key={s}
                  onClick={() => navigate(`/dorks?q=${encodeURIComponent(s)}`)}
                  className="font-mono px-2 py-0.5 rounded border border-border/60 bg-muted/40 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-12">
        {/* Stats */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Total Dorks" value={stats?.totalDorks ?? 0} icon={Database} color="cyan" />
            <StatsCard label="Categories" value={stats?.totalCategories ?? 0} icon={FolderTree} color="violet" />
            <StatsCard label="Sources" value={stats?.totalSources ?? 0} icon={Globe} color="yellow" />
            <StatsCard label="Recent (30d)" value={stats?.recentDiscoveries ?? 0} icon={Zap} color="green" />
          </div>
        </motion.section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-primary" /> Categories
            </h2>
            <Link href="/categories" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              View all &rarr;
            </Link>
          </div>
          {categories === undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No categories yet. Seed your database via Admin.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
            </div>
          )}
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Trending Dorks
            </h2>
            <Link href="/trending" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              View all &rarr;
            </Link>
          </div>
          {trending === undefined ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : trending.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No trending dorks yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map(dork => <DorkCard key={dork.id} dork={dork} />)}
            </div>
          )}
        </section>

        {/* Recent */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recently Discovered
            </h2>
            <Link href="/recent" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              View all &rarr;
            </Link>
          </div>
          {recent === undefined ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No dorks discovered yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.map(dork => <DorkCard key={dork.id} dork={dork} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
