import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Copy, Check, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { highlightQuery } from "@/lib/utils";
import { toast } from "sonner";
import { useRecordDorkCopy } from "@workspace/api-client-react";

interface Props {
  queryTemplate: string;
  optimizedQuery?: string | null;
  dorkId?: number;
}

function extractPlaceholders(query: string): string[] {
  const matches = query.match(/\{([^}]+)\}/g) ?? [];
  const unique = new Set(matches.map(m => m.slice(1, -1)));
  return Array.from(unique);
}

function fillQuery(query: string, values: Record<string, string>): string {
  return query.replace(/\{([^}]+)\}/g, (_, key) => values[key] || `{${key}}`);
}

const PLACEHOLDER_HINTS: Record<string, string> = {
  domain: "example.com",
  organization: "acme-corp",
  target: "target-site.com",
  company: "Company Name",
  keyword: "search term",
  extension: "pdf",
  path: "/admin",
  ip: "192.168.1.0",
  subnet: "192.168.1.0/24",
  port: "8080",
  username: "admin",
  email: "user@example.com",
  bucket: "my-bucket",
  region: "us-east-1",
};

export function QueryBuilder({ queryTemplate, optimizedQuery, dorkId }: Props) {
  const [open, setOpen] = useState(false);
  const [useOptimized, setUseOptimized] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const recordCopy = useRecordDorkCopy();

  const activeQuery = useOptimized && optimizedQuery ? optimizedQuery : queryTemplate;
  const placeholders = useMemo(() => extractPlaceholders(activeQuery), [activeQuery]);
  const hasPlaceholders = placeholders.length > 0;

  const filledQuery = useMemo(() => fillQuery(activeQuery, values), [activeQuery, values]);
  const isComplete = useMemo(
    () => placeholders.every(p => !!values[p]?.trim()),
    [placeholders, values]
  );

  function handleReset() {
    setValues({});
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(filledQuery);
      setCopied(true);
      if (dorkId) recordCopy.mutate({ id: dorkId });
      toast.success("Query copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  if (!hasPlaceholders) return null;

  return (
    <div className="rounded-xl border border-primary/30 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Query Builder</span>
          <span className="text-xs text-muted-foreground">
            — fill in {placeholders.length} placeholder{placeholders.length !== 1 ? "s" : ""} and copy
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-card/40 border-t border-primary/20">
              {optimizedQuery && optimizedQuery !== queryTemplate && (
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => { setUseOptimized(false); setValues({}); }}
                    className={`px-2.5 py-1 rounded-full border transition-colors ${!useOptimized ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                  >
                    Template
                  </button>
                  <button
                    onClick={() => { setUseOptimized(true); setValues({}); }}
                    className={`px-2.5 py-1 rounded-full border transition-colors ${useOptimized ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                  >
                    Optimized
                  </button>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                {placeholders.map(placeholder => (
                  <div key={placeholder} className="space-y-1">
                    <label className="text-xs font-mono text-violet-300">{`{${placeholder}}`}</label>
                    <input
                      type="text"
                      value={values[placeholder] ?? ""}
                      onChange={e => setValues(v => ({ ...v, [placeholder]: e.target.value }))}
                      placeholder={PLACEHOLDER_HINTS[placeholder] ?? `Enter ${placeholder}`}
                      className="w-full px-3 py-1.5 text-sm font-mono bg-muted/60 border border-border rounded-lg focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Preview</span>
                  {isComplete && (
                    <span className="text-xs text-green-400 font-mono">All fields filled</span>
                  )}
                </div>
                <div
                  className="query-box text-sm"
                  dangerouslySetInnerHTML={{ __html: highlightQuery(filledQuery) }}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className="gap-1.5 flex-1 sm:flex-none"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : isComplete ? "Copy Filled Query" : "Copy (with placeholders)"}
                </Button>
                {Object.values(values).some(v => !!v) && (
                  <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-muted-foreground">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
