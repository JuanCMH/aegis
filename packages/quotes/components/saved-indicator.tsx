"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatRelative(diffMs: number): string {
  const s = Math.floor(diffMs / 1000);
  if (s < 5) return "ahora";
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

interface SavedIndicatorProps {
  lastSavedAt: number | null;
  saving?: boolean;
  className?: string;
}

/**
 * Discreet "● Guardado hace Xs" indicator. Refreshes every 30s. Hidden until
 * first save lands.
 */
export function SavedIndicator({
  lastSavedAt,
  saving,
  className,
}: SavedIndicatorProps) {
  const [, force] = useState(0);

  useEffect(() => {
    if (lastSavedAt == null) return;
    const t = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, [lastSavedAt]);

  if (saving) {
    return (
      <span
        className={cn(
          "flex items-center gap-1.5 text-[11px] text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="size-3 animate-spin" />
        Guardando…
      </span>
    );
  }

  if (lastSavedAt == null) return null;

  const label = formatRelative(Date.now() - lastSavedAt);
  const fullDate = new Date(lastSavedAt).toLocaleString("es-CO");

  return (
    <span
      title={fullDate}
      className={cn(
        "flex items-center gap-1.5 text-[11px] text-muted-foreground",
        className,
      )}
    >
      <CheckCircle2 className="size-3 text-emerald-500" />
      Guardado {label}
    </span>
  );
}
