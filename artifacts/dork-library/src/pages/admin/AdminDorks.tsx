import { useState } from "react";
import { Plus, Trash2, Edit, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useListDorks, useDeleteDork, useCreateDork, getListDorksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";

export default function AdminDorks() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", queryTemplate: "", description: "", difficulty: "BEGINNER", intentType: "RECONNAISSANCE" });
  const qc = useQueryClient();

  const { data: result } = useListDorks({ page, limit: 20, status: "PUBLISHED" });

  const create = useCreateDork({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListDorksQueryKey() }); setShowForm(false); toast.success("Dork created"); } } });
  const remove = useDeleteDork({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListDorksQueryKey() }); toast.success("Dork deleted"); } } });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.queryTemplate.trim()) return;
    create.mutate({ title: form.title, queryTemplate: form.queryTemplate, description: form.description || undefined, difficulty: form.difficulty, intentType: form.intentType });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Dorks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{result?.total ?? 0} published patterns</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(s => !s)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Dork
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card border border-primary/30 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Create Dork</h3>
          <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
            className="w-full px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50" />
          <textarea placeholder="Query template (use {domain}, {keyword} as placeholders)" value={form.queryTemplate} onChange={e => setForm(f => ({ ...f, queryTemplate: e.target.value }))} required rows={2}
            className="w-full px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 font-mono resize-none" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
            className="w-full px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50">
              {["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={form.intentType} onChange={e => setForm(f => ({ ...f, intentType: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50">
              {["RECONNAISSANCE", "VULNERABILITY_DISCOVERY", "DATA_EXPOSURE", "CREDENTIAL_HARVESTING", "ADMIN_ACCESS", "OSINT", "GENERAL"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={create.isPending}>Create</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {result === undefined ? (
        <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : result.dorks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">No dorks yet.</div>
      ) : (
        <>
          <div className="space-y-2">
            {result.dorks.map(dork => (
              <div key={dork.id} className="glass-card border border-border/60 rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <Link href={`/dorks/${dork.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate">
                      {dork.title}
                    </Link>
                    <DifficultyBadge difficulty={dork.difficulty} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <code className="font-mono text-primary/70 truncate max-w-xs">{dork.queryTemplate}</code>
                    <span>{timeAgo(dork.createdAt)}</span>
                  </div>
                </div>
                <button onClick={() => remove.mutate({ id: dork.id })} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
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
