import { useEffect, useRef } from "react";
import { Network } from "lucide-react";

const ER_DIAGRAM = `erDiagram
  CATEGORIES ||--o{ DORKS : "primaryCategory"
  CATEGORIES ||--o{ CATEGORIES : "parent"
  DORKS ||--o{ DORK_TAGS : "has"
  DORKS ||--o{ DORK_OPERATORS : "uses"
  DORKS ||--o{ DORK_PLATFORMS : "runs on"
  DORKS ||--o{ DORK_VERSIONS : "versioned"
  DORKS ||--o{ DORK_CATEGORIES : "belongs to"
  TAGS ||--o{ DORK_TAGS : "tagged"
  OPERATORS ||--o{ DORK_OPERATORS : "used by"
  PLATFORMS ||--o{ DORK_PLATFORMS : "used by"
  SOURCES ||--o{ INGESTION_JOBS : "triggers"
  SOURCES ||--o{ RAW_CONTENT : "produces"
  INGESTION_JOBS ||--o{ RAW_CONTENT : "generates"
  RAW_CONTENT ||--o{ EXTRACTED_DORKS : "yields"
  COLLECTIONS ||--o{ COLLECTION_ITEMS : "contains"
  DORKS ||--o{ COLLECTION_ITEMS : "in"
  DORKS ||--o{ BOOKMARKS : "bookmarked"
`;

const FLOW_DIAGRAM = `flowchart LR
  A[External Sources] --> B[Ingestion Engine]
  B --> C[Raw Content Store]
  C --> D[Pattern Extractor]
  D --> E[Extracted Dorks Queue]
  E --> F{AI Enrichment?}
  F -- Yes --> G[AI Categorizer]
  F -- No --> H[Manual Review]
  G --> H
  H --> I{Approve?}
  I -- Import --> J[Dork Library]
  I -- Ignore --> K[Ignored]
  J --> L[Search & Browse]
  J --> M[Collections & Bookmarks]
  J --> N[Analytics]
`;

function MermaidBlock({ diagram, title }: { diagram: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then(({ default: mermaid }) => {
      if (cancelled || !ref.current) return;
      mermaid.initialize({ startOnLoad: false, theme: "dark", themeVariables: { primaryColor: "#00ffc8", background: "#0a0f18", mainBkg: "#0d1520", nodeBorder: "#00ffc8", clusterBkg: "#0d1520", titleColor: "#e0f7ff", edgeLabelBackground: "#0d1520", tertiaryColor: "#0a0f18" } });
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      mermaid.render(id, diagram).then(({ svg }) => {
        if (ref.current && !cancelled) ref.current.innerHTML = svg;
      }).catch(console.error);
    });
    return () => { cancelled = true; };
  }, [diagram]);

  return (
    <div className="glass-card rounded-xl border border-border/60 p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <div ref={ref} className="overflow-x-auto text-xs [&_svg]:max-w-full [&_svg]:h-auto" />
    </div>
  );
}

export default function AdminDiagrams() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="font-orbitron text-xl font-bold text-foreground flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" /> System Diagrams
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Entity relationships and system flow</p>
      </div>
      <MermaidBlock diagram={ER_DIAGRAM} title="Entity Relationship Diagram" />
      <MermaidBlock diagram={FLOW_DIAGRAM} title="Ingestion Pipeline Flow" />
    </div>
  );
}
