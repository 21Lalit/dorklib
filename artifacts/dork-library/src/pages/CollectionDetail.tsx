import { useParams, Link } from "wouter";
import { ArrowLeft, BookMarked } from "lucide-react";
import { useGetCollection } from "@workspace/api-client-react";
import { DorkCard } from "@/components/DorkCard";
import { Skeleton } from "@/components/ui/skeleton";

interface CollectionItem {
  dorkId: number;
  notes?: string | null;
  dork: {
    id: number; title: string; queryTemplate: string; description?: string | null;
    difficulty?: string | null; viewsCount: number; copyCount: number; createdAt: string;
    primaryCategory?: { name: string; slug: string; color?: string | null } | null;
    tags?: { id: number; name: string; slug: string; tagType?: string | null }[];
  };
}

interface Collection {
  id: number; title: string; description?: string | null; visibility: string;
  itemCount?: number; items?: CollectionItem[];
}

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: col } = useGetCollection(parseInt(id, 10));

  if (!col) return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/collections" className="hover:text-primary flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Collections
        </Link>
        <span>/</span>
        <span className="text-foreground">{col.title}</span>
      </div>

      <div className="glass-card rounded-xl border border-border/60 p-6">
        <div className="flex items-start gap-3">
          <BookMarked className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h1 className="font-orbitron text-xl font-bold text-foreground">{col.title}</h1>
            {col.description && <p className="text-sm text-muted-foreground mt-1">{col.description}</p>}
            <p className="text-xs text-muted-foreground mt-2 font-mono">{(col.itemCount ?? 0)} patterns</p>
          </div>
        </div>
      </div>

      {col.items && col.items.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {col.items.map(item => <DorkCard key={item.dorkId} dork={item.dork} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground text-sm">This collection is empty.</div>
      )}
    </div>
  );
}
