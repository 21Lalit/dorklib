import { useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useListCollections, useCreateCollection, useDeleteCollection, getListCollectionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";

interface Collection {
  id: number;
  title: string;
  description?: string | null;
  visibility: string;
  itemCount?: number;
  createdAt: string;
}

export default function Collections() {
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const qc = useQueryClient();

  const { data: collections } = useListCollections();
  const create = useCreateCollection({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        setShowNew(false);
        setTitle("");
        setDesc("");
        toast.success("Collection created");
      },
    },
  });
  const remove = useDeleteCollection({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        toast.success("Collection deleted");
      },
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title: title.trim(), description: desc.trim() || undefined, visibility: "PUBLIC" });
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" /> Collections
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Curated sets of dork patterns</p>
        </div>
        <Button size="sm" onClick={() => setShowNew(s => !s)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Collection
        </Button>
      </div>

      {showNew && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleCreate}
          className="glass-card border border-primary/30 rounded-xl p-5 space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">Create Collection</h3>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Collection title"
            className="w-full px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50"
            required
          />
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-3 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 resize-none"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={create.isPending}>Create</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </motion.form>
      )}

      {collections === undefined ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <BookMarked className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No collections yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card border border-border/60 rounded-xl p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <Link href={`/collections/${col.id}`} className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {col.title}
                </Link>
                <button
                  onClick={() => remove.mutate({ id: col.id })}
                  className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {col.description && <p className="text-xs text-muted-foreground mb-3">{col.description}</p>}
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2 mt-auto">
                <span className="font-mono">{(col.itemCount ?? 0)} patterns</span>
                <span>{timeAgo(col.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
