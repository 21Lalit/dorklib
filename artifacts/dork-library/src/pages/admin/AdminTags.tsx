import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { useListTags, useCreateTag, getListTagsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface TagItem { id: number; name: string; slug: string; tagType?: string | null; dorkCount?: number; }

export default function AdminTags() {
  const [form, setForm] = useState({ name: "", tagType: "GENERAL" });
  const qc = useQueryClient();

  const { data: tags } = useListTags();
  const create = useCreateTag({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTagsQueryKey() }); setForm({ name: "", tagType: "GENERAL" }); toast.success("Tag created"); } } });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    create.mutate({ name: form.name.trim(), slug: form.name.toLowerCase().replace(/\s+/g, "-"), tagType: form.tagType });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="font-orbitron text-xl font-bold text-foreground flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" /> Tags
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{(tags ?? []).length} tags</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3">
        <input placeholder="Tag name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
          className="flex-1 px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50" />
        <select value={form.tagType} onChange={e => setForm(f => ({ ...f, tagType: e.target.value }))}
          className="px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50">
          {["GENERAL", "OPERATOR", "TECHNIQUE", "PLATFORM", "CATEGORY", "STATUS"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <Button type="submit" size="sm" disabled={create.isPending} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </form>

      {tags === undefined ? (
        <div className="flex flex-wrap gap-2">{Array.from({ length: 20 }).map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">No tags yet.</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <div key={tag.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20">
              #{tag.name}
              {tag.dorkCount !== undefined && <span className="text-primary/60">({tag.dorkCount})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
