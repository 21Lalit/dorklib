import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, FolderTree } from "lucide-react";
import { useListCategories, useCreateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Category {
  id: number; name: string; slug: string; color?: string | null; icon?: string | null;
  dorkCount?: number; subcategories?: { id: number; name: string; slug: string; dorkCount?: number; subcategories?: { id: number; name: string }[] }[];
}

export default function AdminCategories() {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [form, setForm] = useState({ name: "", slug: "", description: "", color: "#00ffc8", icon: "", parentCategoryId: "" });
  const qc = useQueryClient();

  const { data: categories } = useListCategories();
  const create = useCreateCategory({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); setShowForm(false); toast.success("Category created"); } } });
  const remove = useDeleteCategory({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); toast.success("Category deleted"); } } });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      name: form.name.trim(),
      slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, "-"),
      description: undefined,
      color: form.color,
      icon: form.icon || undefined,
      parentCategoryId: form.parentCategoryId ? parseInt(form.parentCategoryId, 10) : undefined,
    });
  }

  function toggle(id: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-xl font-bold text-foreground flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" /> Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage category taxonomy</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(s => !s)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Category
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card border border-primary/30 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Create Category</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            <input placeholder="Slug (auto-generated)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 font-mono" />
            <input placeholder="Icon emoji" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            <div className="flex gap-2 items-center">
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className="h-9 w-12 rounded border border-border bg-transparent cursor-pointer" />
              <span className="text-xs text-muted-foreground font-mono">{form.color}</span>
            </div>
            <select value={form.parentCategoryId} onChange={e => setForm(f => ({ ...f, parentCategoryId: e.target.value }))}
              className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 sm:col-span-2">
              <option value="">No parent (top-level)</option>
              {(categories ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={create.isPending}>Create</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {categories === undefined ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">No categories yet.</div>
      ) : (
        <div className="space-y-1">
          {categories.map(cat => (
            <div key={cat.id}>
              <div className="glass-card border border-border/60 rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
                <button onClick={() => toggle(cat.id)} className="p-0.5 text-muted-foreground">
                  {expanded.has(cat.id) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
                <div className="h-3 w-3 rounded-full shrink-0" style={{ background: cat.color ?? "#00ffc8" }} />
                {cat.icon && <span className="text-base">{cat.icon}</span>}
                <span className="font-semibold text-sm text-foreground flex-1">{cat.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{cat.dorkCount ?? 0} dorks</span>
                <button onClick={() => remove.mutate({ id: cat.id })} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {expanded.has(cat.id) && cat.subcategories && cat.subcategories.length > 0 && (
                <div className="ml-8 mt-1 space-y-1">
                  {cat.subcategories.map(sub => (
                    <div key={sub.id} className="glass-card border border-border/40 rounded-lg p-2.5 flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground flex-1">{sub.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{sub.dorkCount ?? 0} dorks</span>
                      <button onClick={() => remove.mutate({ id: sub.id })} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
