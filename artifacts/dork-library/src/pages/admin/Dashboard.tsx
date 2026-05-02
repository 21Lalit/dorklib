import { motion } from "framer-motion";
import { Database, FolderTree, Globe, FileText, Wand2, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useGetAnalytics } from "@workspace/api-client-react";
import { StatsCard } from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusClass, timeAgo } from "@/lib/utils";

interface AnalyticsData {
  totalDorks?: number;
  totalCategories?: number;
  totalSources?: number;
  totalRawContent?: number;
  totalExtracted?: number;
  pendingReview?: number;
  recentIngestions?: { id: number; sourceId: number; status: string; createdAt: string; itemsFound?: number | null; itemsProcessed?: number | null }[];
  categoryDistribution?: { name: string; count: number; color?: string | null }[];
  difficultyBreakdown?: { difficulty?: string | null; count: number }[];
}

export default function AdminDashboard() {
  const { data: analytics } = useGetAnalytics();

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <div>
        <h1 className="font-orbitron text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and recent activity</p>
      </div>

      {analytics === undefined ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard label="Published Dorks" value={analytics.totalDorks ?? 0} icon={Database} color="cyan" />
          <StatsCard label="Categories" value={analytics.totalCategories ?? 0} icon={FolderTree} color="violet" />
          <StatsCard label="Sources" value={analytics.totalSources ?? 0} icon={Globe} color="yellow" />
          <StatsCard label="Raw Content" value={analytics.totalRawContent ?? 0} icon={FileText} color="green" />
          <StatsCard label="Extracted Dorks" value={analytics.totalExtracted ?? 0} icon={Wand2} color="cyan" />
          <StatsCard label="Pending Review" value={analytics.pendingReview ?? 0} icon={AlertCircle} color="red" />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl border border-border/60 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Ingestion Jobs
          </h3>
          {!analytics?.recentIngestions ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : analytics.recentIngestions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No ingestion jobs yet. <Link href="/admin/sources" className="text-primary hover:underline">Add a source</Link>.</p>
          ) : (
            <div className="space-y-2">
              {analytics.recentIngestions.map(job => (
                <div key={job.id} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${getStatusClass(job.status)}`}>{job.status}</span>
                    <span className="text-muted-foreground">Job #{job.id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {job.itemsProcessed != null && <span>{job.itemsProcessed} processed</span>}
                    <span>{timeAgo(job.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-xl border border-border/60 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Category Distribution
          </h3>
          {!analytics?.categoryDistribution ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
          ) : analytics.categoryDistribution.length === 0 ? (
            <p className="text-xs text-muted-foreground">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {analytics.categoryDistribution.slice(0, 8).map(cat => {
                const max = analytics.categoryDistribution![0]?.count ?? 1;
                const pct = Math.round((cat.count / max) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground truncate">{cat.name}</span>
                      <span className="font-mono text-foreground">{cat.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%`, background: cat.color ?? "hsl(174 100% 45%)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link href="/admin/sources" className="text-xs px-3 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
          + Add Source
        </Link>
        <Link href="/admin/ingestion" className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
          View Ingestion Jobs
        </Link>
        <Link href="/admin/extracted-dorks" className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
          Review Extracted Dorks
        </Link>
        <Link href="/admin/analytics" className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
          Full Analytics
        </Link>
      </div>
    </div>
  );
}
