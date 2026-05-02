import { useGetCategoryDistribution, useGetDifficultyBreakdown, useGetIngestionActivity, useGetStats } from "@workspace/api-client-react";
import { BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { StatsCard } from "@/components/StatsCard";
import { Database, FolderTree, Globe, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_COLORS = ["#00ffc8", "#8b5cf6", "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#ec4899", "#f97316", "#06b6d4", "#a855f7"];

const DIFF_COLORS: Record<string, string> = {
  BEGINNER: "#22c55e",
  INTERMEDIATE: "#f59e0b",
  ADVANCED: "#f97316",
  EXPERT: "#8b5cf6",
};

interface CatDist { name: string; count: number; color?: string | null; }
interface DiffBreak { difficulty?: string | null; count: number; }
interface IngActivity { date: string; dorksAdded: number; rawContentFetched: number; }

export default function AdminAnalytics() {
  const { data: stats } = useGetStats();
  const { data: catDist } = useGetCategoryDistribution();
  const { data: diffBreak } = useGetDifficultyBreakdown();
  const { data: ingActivity } = useGetIngestionActivity();

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <div>
        <h1 className="font-orbitron text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Library statistics and trends</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Dorks" value={stats?.totalDorks ?? 0} icon={Database} color="cyan" />
        <StatsCard label="Categories" value={stats?.totalCategories ?? 0} icon={FolderTree} color="violet" />
        <StatsCard label="Sources" value={stats?.totalSources ?? 0} icon={Globe} color="yellow" />
        <StatsCard label="Recent (30d)" value={stats?.recentDiscoveries ?? 0} icon={Zap} color="green" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl border border-border/60 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Category Distribution</h3>
          {catDist === undefined ? <Skeleton className="h-56" /> : catDist.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={e => e.name}>
                  {catDist.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(220 24% 9%)", border: "1px solid hsl(220 20% 14%)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card rounded-xl border border-border/60 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Difficulty Breakdown</h3>
          {diffBreak === undefined ? <Skeleton className="h-56" /> : diffBreak.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={diffBreak} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 14%)" />
                <XAxis dataKey="difficulty" tick={{ fontSize: 10, fill: "hsl(215 25% 50%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215 25% 50%)" }} />
                <Tooltip contentStyle={{ background: "hsl(220 24% 9%)", border: "1px solid hsl(220 20% 14%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {diffBreak.map(entry => (
                    <Cell key={entry.difficulty ?? "unknown"} fill={DIFF_COLORS[entry.difficulty ?? ""] ?? "#00ffc8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border/60 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Ingestion Activity (Last 30 Days)</h3>
        {ingActivity === undefined ? <Skeleton className="h-48" /> : ingActivity.every(d => d.dorksAdded === 0 && d.rawContentFetched === 0) ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No ingestion activity yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ingActivity} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 14%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215 25% 50%)" }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 25% 50%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220 24% 9%)", border: "1px solid hsl(220 20% 14%)", borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="dorksAdded" stroke="#00ffc8" dot={false} strokeWidth={2} name="Dorks Added" />
              <Line type="monotone" dataKey="rawContentFetched" stroke="#8b5cf6" dot={false} strokeWidth={2} name="Raw Content" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
