import { useState } from "react";
import { motion } from "framer-motion";
import { FolderTree, Search } from "lucide-react";
import { useListCategories } from "@workspace/api-client-react";
import { CategoryCard } from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  dorkCount?: number;
  subcategories?: { id: number; name: string; dorkCount?: number }[];
}

export default function Categories() {
  const [q, setQ] = useState("");
  const { data: categories } = useListCategories();

  const filtered = q
    ? (categories ?? []).filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.description?.toLowerCase().includes(q.toLowerCase()))
    : categories;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" /> Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Browse dork patterns by security domain</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Filter categories..."
            className="pl-9 pr-4 py-2 text-sm bg-card/80 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            data-testid="categories-search"
          />
        </div>
      </div>

      {filtered === undefined ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FolderTree className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>{q ? "No categories match your search." : "No categories found. Add some via Admin."}</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filtered.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
