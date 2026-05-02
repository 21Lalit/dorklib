import { Shield, Search, Database, Cpu, Globe, Zap } from "lucide-react";

const STEPS = [
  { icon: Globe, label: "Source Discovery", desc: "GitHub repos, blogs, RSS feeds, and manual submissions are continuously monitored for new dork patterns." },
  { icon: Database, label: "Ingestion Pipeline", desc: "Raw content is fetched, deduplicated by content hash, and stored for processing." },
  { icon: Cpu, label: "Pattern Extraction", desc: "Regex-based extraction identifies query patterns. AI-assisted normalization removes real targets and replaces them with safe placeholders." },
  { icon: Zap, label: "AI Enrichment", desc: "Optional AI categorization assigns categories, detects intent types, difficulty levels, and tags automatically." },
  { icon: Search, label: "Library Curation", desc: "Security researchers review extracted candidates, then import, enrich, and publish them to the library." },
  { icon: Shield, label: "Safe Distribution", desc: "All published dorks use placeholder variables like {domain} instead of real targets — safe for reference and education." },
];

export default function About() {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono">
          <Shield className="h-3 w-3" /> Open Source Intelligence
        </div>
        <h1 className="font-orbitron text-3xl font-bold text-foreground">About DorkLib</h1>
        <p className="text-muted-foreground leading-relaxed">
          DorkLib is a professional cybersecurity intelligence platform for collecting, categorizing, and searching Google-style dork patterns.
          Built for OSINT researchers, red teamers, blue teamers, and security practitioners who need a reliable reference library — not a hacking tool.
        </p>
      </div>

      <div className="glass-card rounded-xl border border-primary/20 p-6">
        <h2 className="font-orbitron text-lg font-bold text-foreground mb-6">How It Works</h2>
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-border/60" />
          <div className="space-y-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex gap-4 relative">
                  <div className="h-10 w-10 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0 z-10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-sm font-semibold text-foreground">{step.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
        <h3 className="text-sm font-semibold text-yellow-300 mb-2">Ethical Use Notice</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          All dork patterns in this library use safe placeholder variables (e.g. <code className="font-mono text-primary">{"{domain}"}</code>, <code className="font-mono text-primary">{"{keyword}"}</code>) instead of real targets.
          This library is intended for educational purposes, security research, and authorized penetration testing only. Always obtain proper authorization before using any search techniques against real systems.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="glass-card rounded-xl border border-border/60 p-5 space-y-1">
          <p className="font-semibold text-foreground">Intelligence Sources</p>
          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
            <li>• GitHub security repositories</li>
            <li>• Security research blogs</li>
            <li>• RSS security feeds</li>
            <li>• Community contributions</li>
          </ul>
        </div>
        <div className="glass-card rounded-xl border border-border/60 p-5 space-y-1">
          <p className="font-semibold text-foreground">Query Categories</p>
          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
            <li>• Web security & admin panels</li>
            <li>• Cloud infrastructure exposure</li>
            <li>• IoT & OT/SCADA systems</li>
            <li>• API & data exposure</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
