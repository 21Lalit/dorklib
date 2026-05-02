import { highlightQuery } from "@/lib/utils";
import { CopyButton } from "./CopyButton";
import { useRecordDorkCopy } from "@workspace/api-client-react";

interface Props {
  query: string;
  dorkId?: number;
  showCopy?: boolean;
  compact?: boolean;
}

export function QueryBox({ query, dorkId, showCopy = true, compact = false }: Props) {
  const recordCopy = useRecordDorkCopy();

  function handleCopy() {
    if (dorkId) {
      recordCopy.mutate({ id: dorkId });
    }
  }

  return (
    <div className="query-box group relative" data-testid="query-box">
      <div
        className={compact ? "text-xs" : "text-sm"}
        dangerouslySetInnerHTML={{ __html: highlightQuery(query) }}
      />
      {showCopy && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={query} onCopy={handleCopy} variant="outline" size="sm" />
        </div>
      )}
    </div>
  );
}
