import { useListCategories, useListTags, useListPlatforms, useListOperators } from "@workspace/api-client-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface Filters {
  q?: string;
  category?: string;
  tag?: string;
  difficulty?: string;
  intentType?: string;
  platform?: string;
  operator?: string;
  sourceType?: string;
  sortBy?: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
const INTENT_TYPES = ["RECONNAISSANCE", "VULNERABILITY_DISCOVERY", "DATA_EXPOSURE", "CREDENTIAL_HARVESTING", "ADMIN_ACCESS", "OSINT", "GENERAL"];
const SOURCE_TYPES = ["GITHUB", "RSS", "MEDIUM", "BLOG", "MANUAL", "IMPORT"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Viewed" },
  { value: "copied", label: "Most Copied" },
  { value: "difficulty", label: "Difficulty" },
];

export function SearchFilters({ filters, onChange }: Props) {
  const { data: catsRaw } = useListCategories();
  const { data: tagsRaw } = useListTags();
  const { data: platformsRaw } = useListPlatforms();

  const cats = Array.isArray(catsRaw) ? catsRaw : [];
  const tags = Array.isArray(tagsRaw) ? tagsRaw : [];
  const platforms = Array.isArray(platformsRaw) ? platformsRaw : [];

  const hasFilters = Object.entries(filters).some(([k, v]) => k !== "sortBy" && !!v);

  function clear() {
    onChange({ sortBy: filters.sortBy });
  }

  return (
    <div className="glass-card rounded-xl border border-border/60 p-4 space-y-4" data-testid="search-filters">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-3.5 w-3.5 text-primary" />
          Filters
        </div>
        {hasFilters && (
          <Button size="sm" variant="ghost" onClick={clear} className="text-xs gap-1">
            <X className="h-3 w-3" />Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Sort by</Label>
          <Select value={filters.sortBy ?? "newest"} onValueChange={v => onChange({ ...filters, sortBy: v })}>
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={filters.category ?? "all"} onValueChange={v => onChange({ ...filters, category: v === "all" ? undefined : v })}>
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All categories</SelectItem>
              {(cats ?? []).map(c => <SelectItem key={c.id} value={c.slug} className="text-xs">{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Difficulty</Label>
          <Select value={filters.difficulty ?? "all"} onValueChange={v => onChange({ ...filters, difficulty: v === "all" ? undefined : v })}>
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue placeholder="Any difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Any difficulty</SelectItem>
              {DIFFICULTIES.map(d => <SelectItem key={d} value={d} className="text-xs">{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Intent Type</Label>
          <Select value={filters.intentType ?? "all"} onValueChange={v => onChange({ ...filters, intentType: v === "all" ? undefined : v })}>
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue placeholder="Any intent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Any intent</SelectItem>
              {INTENT_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Platform</Label>
          <Select value={filters.platform ?? "all"} onValueChange={v => onChange({ ...filters, platform: v === "all" ? undefined : v })}>
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue placeholder="Any platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Any platform</SelectItem>
              {(platforms ?? []).map(p => <SelectItem key={p.id} value={p.slug} className="text-xs">{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Source Type</Label>
          <Select value={filters.sourceType ?? "all"} onValueChange={v => onChange({ ...filters, sourceType: v === "all" ? undefined : v })}>
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue placeholder="Any source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Any source</SelectItem>
              {SOURCE_TYPES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
