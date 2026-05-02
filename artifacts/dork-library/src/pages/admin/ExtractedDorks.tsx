import { useState } from "react";
import { Wand2, Download, X, RefreshCw } from "lucide-react";
import { useListExtractedDorks, useImportExtractedDork, useIgnoreExtractedDork, getListExtractedDorksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";

interface ExtractedDork {
  id: number;
  rawQuery: string;
  normalizedQuery?: string | null;
  detectedCategory?: string | null;
  detectedIntent?: string | null;
  confidenceScore?: string | null;
  processingStatus: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["ALL", "NEW", "PROCESSED", "IMPORTED", "IGNORED"];

export default function AdminExtractedDorks() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("NEW");
  const qc = useQueryClient();

  const { data: result } = useListExtractedDorks({ page, limit: 20, status: status === "ALL" ? undefined : status });

  const importDork = useImportExtractedDork({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListExtractedDorksQueryKey() }); toast.success("Dork imported to library"); } } });
  const ignoreDork = useIgnoreExtractedDork({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListExtractedDorksQueryKey() }); toast.info("Dork ignored"); } } });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-orbitron text-xl font-bold text-foreground">Extracted Dorks</h1>
          <p className="text-sm text-muted-foreground mt-1">{result?.total ?? 0} candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                {s}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => qc.invalidateQueries({ queryKey: getListExtractedDorksQueryKey() })} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {result === undefined ? (
        <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : result.items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Wand2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No {status.toLowerCase()} dorks. Run an ingestion job first.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {result.items.map(d => (
              <div key={d.id} className="glass-card border border-border/60 rounded-xl p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <code className="text-xs font-mono text-primary break-all">{d.normalizedQuery ?? d.rawQuery}</code>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {d.detectedCategory && <span className="px-1.5 py-0.5 rounded bg-muted/60">{d.detectedCategory}</span>}
                    {d.detectedIntent && <span>{d.detectedIntent.replace(/_/g, " ")}</span>}
                    {d.confidenceScore && <span>Confidence: {d.confidenceScore}</span>}
                    <span>{timeAgo(d.createdAt)}</span>
                  </div>
                </div>
                {d.processingStatus === "NEW" && (
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => importDork.mutate({ id: d.id })} disabled={importDork.isPending} className="gap-1 text-xs">
                      <Download className="h-3 w-3" /> Import
                    </Button>
                    <button onClick={() => ignoreDork.mutate({ id: d.id })} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {d.processingStatus !== "NEW" && (
                  <span className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5">{d.processingStatus}</span>
                )}
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
