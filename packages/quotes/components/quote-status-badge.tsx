import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuoteStatus } from "../types";
import { getQuoteStatusMeta } from "../lib/quote-status-meta";

interface QuoteStatusBadgeProps {
  status: QuoteStatus | undefined;
  className?: string;
  showIcon?: boolean;
}

export function QuoteStatusBadge({
  status,
  className,
  showIcon = true,
}: QuoteStatusBadgeProps) {
  const meta = getQuoteStatusMeta(status);
  const Icon = meta.icon;
  return (
    <Badge
      variant="outline"
      className={cn(meta.className, "gap-1 font-medium", className)}
      aria-label={`Estado: ${meta.label}`}
    >
      {showIcon && <Icon className="size-3" />}
      {meta.label}
    </Badge>
  );
}
