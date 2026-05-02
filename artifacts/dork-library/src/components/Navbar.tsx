import { Link, useLocation } from "wouter";
import { Search, BookOpen, Grid3X3, TrendingUp, Clock, Bookmark, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "@/hooks/use-navigate";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dorks", label: "Dorks" },
  { href: "/categories", label: "Categories" },
  { href: "/trending", label: "Trending" },
  { href: "/recent", label: "Recent" },
  { href: "/collections", label: "Collections" },
];

export function Navbar() {
  const [location] = useLocation();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) navigate(`/dorks?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-7 w-7 rounded border border-primary/50 bg-primary/10 flex items-center justify-center">
            <Search className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-orbitron text-sm font-bold text-primary tracking-wider hidden sm:block">
            DORK<span className="text-foreground">LIB</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md transition-colors",
                location === link.href
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-sm ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search dorks..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/60"
            data-testid="navbar-search"
          />
        </form>

        <Link
          href="/admin"
          className="ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="Admin"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}
