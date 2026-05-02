import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useGetRecentDorks } from "@workspace/api-client-react";
import { DorkCard } from "@/components/DorkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";

export default function Recent() {
  const { data: dorks } = useGetRecentDorks({ limit: 50 });

  // Group by day
  const byDay = new Map<string, typeof dorks extends undefined ? never : typeof dorks[number][]>();
  if (dorks) {
    for (const d of dorks) {
      const day = new Date(d.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(d);
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Recently Discovered
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Latest dork patterns added to the library</p>
      </div>

      {dorks === undefined ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-48 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : dorks.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No dorks yet. Start by importing some via Admin.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Array.from(byDay.entries()).map(([day, dayDorks]) => (
            <motion.div key={day} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-foreground">{day}</h2>
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-xs text-muted-foreground font-mono">{dayDorks.length} dorks</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayDorks.map(dork => <DorkCard key={dork.id} dork={dork} />)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
