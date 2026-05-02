import { motion } from "framer-motion";
import { TrendingUp, Eye, Copy } from "lucide-react";
import { useGetTrendingDorks } from "@workspace/api-client-react";
import { DorkCard } from "@/components/DorkCard";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryBox } from "@/components/QueryBox";

export default function Trending() {
  const { data: dorks } = useGetTrendingDorks({ limit: 50 });

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Trending Dorks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Most viewed patterns right now</p>
      </div>

      {dorks === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : dorks.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No trending dorks yet. Check back after some views.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dorks.map((dork, i) => (
            <motion.div
              key={dork.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card rounded-xl border border-border/60 p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="font-mono text-2xl font-bold text-muted-foreground/30 w-8 text-center shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-foreground truncate">{dork.title}</span>
                  <DifficultyBadge difficulty={dork.difficulty} />
                </div>
                <QueryBox query={dork.queryTemplate} dorkId={dork.id} compact />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-primary" />{dork.viewsCount.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Copy className="h-3.5 w-3.5 text-violet-400" />{dork.copyCount.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
