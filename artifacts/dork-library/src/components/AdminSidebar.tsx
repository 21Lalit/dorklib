import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Database, Rss, FileText, Wand2, BookOpen,
  FolderTree, Tag, Wrench, Monitor, BarChart3, Network, Search, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dorks", label: "Dorks", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/operators", label: "Operators", icon: Wrench },
  { href: "/admin/platforms", label: "Platforms", icon: Monitor },
  { href: "/admin/sources", label: "Sources", icon: Database },
  { href: "/admin/ingestion", label: "Ingestion Jobs", icon: Rss },
  { href: "/admin/raw-content", label: "Raw Content", icon: FileText },
  { href: "/admin/extracted-dorks", label: "Extracted Dorks", icon: Wand2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/diagrams", label: "Diagrams", icon: Network },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-56 shrink-0 glass border-r border-border/60 flex flex-col h-full" data-testid="admin-sidebar">
      <div className="p-4 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs mb-3">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Library
        </Link>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <span className="font-orbitron text-xs font-bold text-primary tracking-widest">ADMIN</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {ADMIN_LINKS.map(link => {
          const Icon = link.icon;
          const active = location === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors",
                active
                  ? "bg-primary/15 text-primary border border-primary/25 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
