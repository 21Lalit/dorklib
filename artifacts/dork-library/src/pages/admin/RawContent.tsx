import { useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { useListRawContent, getListRawContentQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, truncate } from "@/lib/utils";

interface RawItem {
  id: number;
  title?: string | null;
  rawText?: string | null;
  sourceUrl?: string | null;
  discoveredAt: string;
  extractedDorkCount?: number;
}

export default function AdminRawContent() {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const qc = useQueryClient();

  const { data: result } = useListRawContent({ page, limit: 20 });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Raw Content
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{result?.total ?? 0} items</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => qc.invalidateQueries({ queryKey: getListRawContentQueryKey() })} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {result === undefined ? (
        <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : result.items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No raw content yet. Run an ingestion job.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {result.items.map(item => (
              <div key={item.id} className="glass-card border border-border/60 rounded-xl overflow-hidden">
                <div
                  className="p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground mb-0.5 truncate">{item.title ?? "Untitled"}</div>
                    <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
                      {item.sourceUrl && <span className="truncate max-w-xs">{item.sourceUrl}</span>}
                      <span>{timeAgo(item.discoveredAt)}</span>
                      {item.extractedDorkCount !== undefined && <span className="text-primary">{item.extractedDorkCount} dorks extracted</span>}
                    </div>
                  </div>
                </div>
                {expanded === item.id && item.rawText && (
                  <div className="border-t border-border/60 p-4 bg-black/20">
                    <pre className="text-xs font-mono text-primary/80 whitespace-pre-wrap break-all leading-relaxed max-h-64 overflow-y-auto">
                      {item.rawText}
                    </pre>
                  </div>
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
