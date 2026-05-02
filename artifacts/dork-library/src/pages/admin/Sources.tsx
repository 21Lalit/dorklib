import { useState } from "react";
import { Plus, Trash2, Play, CheckCircle, XCircle, Globe } from "lucide-react";
import { useListSources, useCreateSource, useDeleteSource, useRunIngestionJob, getListSourcesQueryKey, getListIngestionJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";

interface Source {
  id: number;
  name: string;
  sourceType: string;
  baseUrl?: string | null;
  isActive: boolean;
  lastFetchedAt?: string | null;
  jobCount?: number;
}

const SOURCE_TYPES = ["GITHUB", "RSS", "MEDIUM", "BLOG", "MANUAL", "IMPORT"];

export default function AdminSources() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", sourceType: "GITHUB", baseUrl: "" });
  const qc = useQueryClient();

  const { data: sources } = useListSources();
  const create = useCreateSource({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListSourcesQueryKey() }); setShowForm(false); setForm({ name: "", sourceType: "GITHUB", baseUrl: "" }); toast.success("Source created"); } } });
  const remove = useDeleteSource({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListSourcesQueryKey() }); toast.success("Source deleted"); } } });
  const runJob = useRunIngestionJob({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListIngestionJobsQueryKey() }); toast.success("Ingestion job started"); } } });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    create.mutate({ name: form.name.trim(), sourceType: form.sourceType, baseUrl: form.baseUrl.trim() || undefined });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-xl font-bold text-foreground">Sources</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure ingestion sources</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(s => !s)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Source
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card border border-primary/30 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Add Source</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Source name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50" required />
            <select value={form.sourceType} onChange={e => setForm(f => ({ ...f, sourceType: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50">
              {SOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="url" placeholder="Base URL (optional)" value={form.baseUrl} onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 sm:col-span-2" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={create.isPending}>Create</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {sources === undefined ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : sources.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No sources configured yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map(src => (
            <div key={src.id} className="glass-card border border-border/60 rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {src.isActive ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                  <span className="font-semibold text-sm text-foreground">{src.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-muted/60 text-muted-foreground">{src.sourceType}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {src.baseUrl && <span className="truncate max-w-xs">{src.baseUrl}</span>}
                  <span>Last fetch: {timeAgo(src.lastFetchedAt)}</span>
                  <span>{src.jobCount ?? 0} jobs</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => runJob.mutate({ sourceId: src.id })} disabled={runJob.isPending} className="gap-1.5 text-xs">
                  <Play className="h-3 w-3" /> Run
                </Button>
                <button onClick={() => remove.mutate({ id: src.id })} className="p-2 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
