import {
  CheckCircle2,
  CircleDot,
  FileText,
  Send,
  Timer,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { QuoteStatus } from "../types";

export interface QuoteStatusMeta {
  id: QuoteStatus;
  label: string;
  /** Tailwind classes for the badge background + text. */
  className: string;
  /** Hex/text color for icons / dots when used outside the badge. */
  dotClass: string;
  icon: LucideIcon;
  description: string;
}

export const QUOTE_STATUS_META: Record<QuoteStatus, QuoteStatusMeta> = {
  draft: {
    id: "draft",
    label: "Borrador",
    className:
      "bg-muted text-muted-foreground border-transparent hover:bg-muted",
    dotClass: "bg-muted-foreground",
    icon: FileText,
    description: "Aún editable, no enviada al cliente",
  },
  sent: {
    id: "sent",
    label: "Enviada",
    className:
      "bg-aegis-sapphire/10 text-aegis-sapphire border-transparent hover:bg-aegis-sapphire/15",
    dotClass: "bg-aegis-sapphire",
    icon: Send,
    description: "Compartida con el cliente, en espera de respuesta",
  },
  accepted: {
    id: "accepted",
    label: "Aceptada",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-transparent hover:bg-emerald-500/15",
    dotClass: "bg-emerald-500",
    icon: CheckCircle2,
    description: "Aprobada por el cliente, lista para convertir a póliza",
  },
  rejected: {
    id: "rejected",
    label: "Rechazada",
    className:
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-transparent hover:bg-rose-500/15",
    dotClass: "bg-rose-500",
    icon: XCircle,
    description: "Rechazada por el cliente",
  },
  expired: {
    id: "expired",
    label: "Vencida",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-transparent hover:bg-amber-500/15",
    dotClass: "bg-amber-500",
    icon: Timer,
    description: "Vencida sin respuesta del cliente",
  },
  converted: {
    id: "converted",
    label: "Convertida",
    className:
      "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-transparent hover:bg-violet-500/15",
    dotClass: "bg-violet-500",
    icon: CircleDot,
    description: "Ya generó una póliza activa",
  },
};

export const QUOTE_STATUS_ORDER: QuoteStatus[] = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "converted",
];

export const getQuoteStatusMeta = (status: QuoteStatus | undefined) =>
  QUOTE_STATUS_META[status ?? "draft"];
