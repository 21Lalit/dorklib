import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "cyan" | "violet" | "yellow" | "green" | "red";
  className?: string;
}

const colorMap = {
  cyan: "text-primary",
  violet: "text-violet-400",
  yellow: "text-yellow-400",
  green: "text-emerald-400",
  red: "text-red-400",
};

const bgMap = {
  cyan: "bg-primary/10 border-primary/20",
  violet: "bg-violet-500/10 border-violet-500/20",
  yellow: "bg-yellow-500/10 border-yellow-500/20",
  green: "bg-emerald-500/10 border-emerald-500/20",
  red: "bg-red-500/10 border-red-500/20",
};

export function StatsCard({ label, value, icon: Icon, color = "cyan", className }: Props) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "glass-card rounded-xl p-5 border flex items-center gap-4",
        bgMap[color],
        className
      )}
      data-testid="stats-card"
    >
      <div className={cn("p-3 rounded-lg border", bgMap[color])}>
        <Icon className={cn("h-5 w-5", colorMap[color])} />
      </div>
      <div>
        <p className="text-2xl font-bold font-mono text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}
