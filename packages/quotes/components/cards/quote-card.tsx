"use client";

import Link from "next/link";
import { Banknote, Calendar, ChevronRight, FileText } from "lucide-react";
import { formatCop } from "@/lib/format-cop";
import { shortDate } from "@/lib/date-formats";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";
import { QuoteStatusBadge } from "../quote-status-badge";

export type QuoteCardRow = Doc<"quotes"> & {
  documentUrl: string | null;
};

interface QuoteCardProps {
  quote: QuoteCardRow;
  href: string;
  className?: string;
}

const TYPE_LABEL: Record<"bidBond" | "performanceBonds", string> = {
  bidBond: "Seriedad",
  performanceBonds: "Cumplimiento",
};

export function QuoteCard({ quote, href, className }: QuoteCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full items-stretch gap-3 rounded-md border border-border/40 bg-card p-3 transition hover:border-border hover:bg-accent/40",
        className,
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aegis-sapphire/10 text-aegis-sapphire">
        <FileText className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">
            {quote.contractor || "Sin contratista"}
          </p>
          <QuoteStatusBadge status={quote.status} showIcon={false} />
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {quote.contractee || "Sin contratante"}
          <span className="mx-1.5 opacity-50">•</span>
          {TYPE_LABEL[quote.quoteType] ?? "—"}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Banknote className="size-3 opacity-60" />
            {formatCop(quote.contractValue)}
          </span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Calendar className="size-3 opacity-60" />
            {shortDate(new Date(quote.contractStart))}
            <span className="opacity-50">→</span>
            {shortDate(new Date(quote.contractEnd))}
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 self-center text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
