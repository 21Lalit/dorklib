import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Copy, Clock, Tag, Cpu, Monitor, History, Share2 } from "lucide-react";
import { useGetDork } from "@workspace/api-client-react";
import { QueryBox } from "@/components/QueryBox";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { TagBadge } from "@/components/TagBadge";
import { OperatorBadge } from "@/components/OperatorBadge";
import { DorkCard } from "@/components/DorkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/CopyButton";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";

export default function DorkDetail() {
  const { id } = useParams<{ id: string }>();
  const numId = parseInt(id, 10);

  const { data } = useGetDork(numId);

  if (!data) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dorks" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Dorks
        </Link>
        {data.primaryCategory && (
          <>
            <span>/</span>
            <Link href={`/categories/${data.primaryCategory.slug}`} className="hover:text-primary transition-colors">
              {data.primaryCategory.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{data.title}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground font-orbitron">{data.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{data.viewsCount.toLocaleString()} views</span>
              <span className="flex items-center gap-1"><Copy className="h-3.5 w-3.5" />{data.copyCount.toLocaleString()} copies</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(data.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={data.difficulty} />
            <button onClick={handleShare} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-foreground">Query Template</span>
          <CopyButton text={data.queryTemplate} dorkId={data.id} variant="outline" />
        </div>
        <QueryBox query={data.queryTemplate} dorkId={data.id} showCopy={false} />
      </div>

      {data.optimizedQuery && data.optimizedQuery !== data.queryTemplate && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium text-foreground">Optimized Query</span>
            <CopyButton text={data.optimizedQuery} variant="outline" />
          </div>
          <QueryBox query={data.optimizedQuery} showCopy={false} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {data.description && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
          </div>
        )}
        {data.usageContext && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground">Usage Context</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.usageContext}</p>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {data.intentType && (
          <div className="glass-card border border-border/60 rounded-lg p-3">
            <p className="text-muted-foreground mb-1">Intent Type</p>
            <p className="font-mono text-primary">{data.intentType.replace(/_/g, " ")}</p>
          </div>
        )}
        {data.sourceType && (
          <div className="glass-card border border-border/60 rounded-lg p-3">
            <p className="text-muted-foreground mb-1">Source Type</p>
            <p className="font-mono text-foreground">{data.sourceType}</p>
          </div>
        )}
        {data.difficulty && (
          <div className="glass-card border border-border/60 rounded-lg p-3">
            <p className="text-muted-foreground mb-1">Difficulty</p>
            <DifficultyBadge difficulty={data.difficulty} />
          </div>
        )}
        {data.primaryCategory && (
          <div className="glass-card border border-border/60 rounded-lg p-3">
            <p className="text-muted-foreground mb-1">Category</p>
            <Link href={`/categories/${data.primaryCategory.slug}`} className="font-mono text-primary hover:underline">
              {data.primaryCategory.name}
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {data.tags && data.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-muted-foreground">
              <Tag className="h-3.5 w-3.5" /> Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
            </div>
          </div>
        )}

        {data.operators && data.operators.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-muted-foreground">
              <Cpu className="h-3.5 w-3.5" /> Operators
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.operators.map(op => <OperatorBadge key={op.id} operator={op} />)}
            </div>
          </div>
        )}

        {data.platforms && data.platforms.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-muted-foreground">
              <Monitor className="h-3.5 w-3.5" /> Platforms
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.platforms.map(p => (
                <span key={p.id} className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/25">{p.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {data.versions && data.versions.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold mb-3 text-foreground">
            <History className="h-4 w-4 text-primary" /> Version History
          </h3>
          <div className="space-y-2">
            {data.versions.map(v => (
              <div key={v.id} className="glass-card border border-border/60 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-primary">{v.versionLabel ?? "v1.0"}</span>
                  <span className="text-muted-foreground">{timeAgo(v.changedAt)}</span>
                </div>
                {v.changeReason && <p className="text-muted-foreground">{v.changeReason}</p>}
                {v.queryTemplate && <code className="text-xs text-primary/80 mt-1 block font-mono truncate">{v.queryTemplate}</code>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.relatedDorks && data.relatedDorks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">Related Dorks</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.relatedDorks.map(dork => <DorkCard key={dork.id} dork={dork} />)}
          </div>
        </div>
      )}
    </div>
  );
}
