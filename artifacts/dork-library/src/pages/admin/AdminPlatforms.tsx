import { useState } from "react";
import { Plus, Monitor } from "lucide-react";
import { useListPlatforms, useCreatePlatform, getListPlatformsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Platform { id: number; name: string; slug: string; platformType?: string | null; description?: string | null; dorkCount?: number; }

const PLATFORM_TYPES = ["SEARCH_ENGINE", "SECURITY_TOOL", "DATABASE", "CLOUD", "SOCIAL", "GENERAL"];

export default function AdminPlatforms() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", platformType: "SEARCH_ENGINE", description: "" });
  const qc = useQueryClient();

  const { data: platforms } = useListPlatforms();
  const create = useCreatePlatform({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListPlatformsQueryKey() }); setShowForm(false); toast.success("Platform created"); } } });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ name: form.name.trim(), slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"), platformType: form.platformType, description: form.description || undefined });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-xl font-bold text-foreground flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" /> Platforms
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{(platforms ?? []).length} platforms</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(s => !s)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Platform
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card border border-primary/30 rounded-xl p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            <input placeholder="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 font-mono" />
            <select value={form.platformType} onChange={e => setForm(f => ({ ...f, platformType: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50">
              {PLATFORM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={create.isPending}>Create</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {platforms === undefined ? (
        <div className="grid sm:grid-cols-2 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : platforms.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">No platforms yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {platforms.map(p => (
            <div key={p.id} className="glass-card border border-border/60 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">{p.name}</span>
                {p.platformType && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">{p.platformType}</span>}
              </div>
              {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
              {p.dorkCount !== undefined && <p className="text-xs font-mono text-muted-foreground">{p.dorkCount} dorks</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
