import { useState } from "react";
import { Rss, RefreshCw } from "lucide-react";
import { useListIngestionJobs, getListIngestionJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusClass, timeAgo } from "@/lib/utils";

interface IngJob {
  id: number;
  sourceId: number;
  jobType: string;
  status: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  itemsFound?: number | null;
  itemsProcessed?: number | null;
  errorMessage?: string | null;
  createdAt: string;
  source?: { id: number; name: string; sourceType: string } | null;
}

export default function AdminIngestionJobs() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data: result } = useListIngestionJobs({ page, limit: 20 });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-xl font-bold text-foreground">Ingestion Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">{result?.total ?? 0} total jobs</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => qc.invalidateQueries({ queryKey: getListIngestionJobsQueryKey() })} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {result === undefined ? (
        <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : result.jobs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Rss className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No ingestion jobs yet. Run one from Sources.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {result.jobs.map(job => (
              <div key={job.id} className="glass-card border border-border/60 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${getStatusClass(job.status)}`}>{job.status}</span>
                    <span className="text-sm font-medium text-foreground">Job #{job.id}</span>
                    {job.source && <span className="text-xs text-muted-foreground">{job.source.name}</span>}
                    <span className="px-1.5 py-0.5 rounded text-xs bg-muted/60 text-muted-foreground">{job.jobType}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-3">
                    <span>Started: {timeAgo(job.startedAt)}</span>
                    {job.finishedAt && <span>Finished: {timeAgo(job.finishedAt)}</span>}
                    {job.itemsFound != null && <span>Found: {job.itemsFound}</span>}
                    {job.itemsProcessed != null && <span>Processed: {job.itemsProcessed}</span>}
                  </div>
                  {job.errorMessage && <p className="text-xs text-red-400 mt-1 font-mono">{job.errorMessage}</p>}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{timeAgo(job.createdAt)}</span>
              </div>
            ))}
          </div>
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="text-xs font-mono text-muted-foreground">{page} / {result.totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= result.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
