import { useState } from "react";
import { Plus, Wrench } from "lucide-react";
import { useListOperators, useCreateOperator, getListOperatorsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Op { id: number; name: string; syntax: string; description?: string | null; exampleUsage?: string | null; dorkCount?: number; }

export default function AdminOperators() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", syntax: "", description: "", exampleUsage: "" });
  const qc = useQueryClient();

  const { data: operators } = useListOperators();
  const create = useCreateOperator({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListOperatorsQueryKey() }); setShowForm(false); toast.success("Operator created"); } } });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ name: form.name.trim(), syntax: form.syntax.trim(), description: form.description || undefined, exampleUsage: form.exampleUsage || undefined });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" /> Operators
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{(operators ?? []).length} operators</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(s => !s)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Operator
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card border border-primary/30 rounded-xl p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Name (e.g. Site Operator)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            <input placeholder="Syntax (e.g. site:)" value={form.syntax} onChange={e => setForm(f => ({ ...f, syntax: e.target.value }))} required
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 font-mono" />
            <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 sm:col-span-2" />
            <input placeholder="Example usage" value={form.exampleUsage} onChange={e => setForm(f => ({ ...f, exampleUsage: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 font-mono sm:col-span-2" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={create.isPending}>Create</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {operators === undefined ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : operators.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">No operators yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {operators.map(op => (
            <div key={op.id} className="glass-card border border-border/60 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-yellow-300 bg-yellow-500/10 border border-yellow-500/25 px-2 py-0.5 rounded">{op.syntax}</code>
                <span className="text-sm font-semibold text-foreground">{op.name}</span>
                {op.dorkCount !== undefined && <span className="ml-auto text-xs text-muted-foreground">{op.dorkCount} dorks</span>}
              </div>
              {op.description && <p className="text-xs text-muted-foreground">{op.description}</p>}
              {op.exampleUsage && <code className="text-xs font-mono text-primary/70 block">{op.exampleUsage}</code>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
