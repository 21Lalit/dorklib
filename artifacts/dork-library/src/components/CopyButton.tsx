import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  onCopy?: () => void;
  className?: string;
  size?: "sm" | "default";
  variant?: "ghost" | "outline" | "default";
}

export function CopyButton({ text, onCopy, className, size = "sm", variant = "ghost" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Query copied to clipboard");
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleCopy}
      className={cn("gap-1.5 transition-all", copied && "text-primary", className)}
      data-testid="copy-button"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
