"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Send,
  Timer,
  Undo2,
  X,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/hooks/use-confirm";
import { RoleGate } from "@/packages/roles/components/role-gate";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useRemoveQuote, useSetQuoteStatus } from "../../api";
import type { QuoteStatus } from "../../types";
import { getQuoteStatusMeta } from "../../lib/quote-status-meta";

interface QuoteActionsProps {
  id: Id<"quotes">;
  quote: Doc<"quotes"> & { documentUrl: string | null };
  children?: React.ReactNode;
  onAfterAction?: () => void;
  onConvertToPolicy?: (quote: Doc<"quotes">) => void;
}

const STATUS_TRANSITIONS: Record<
  QuoteStatus,
  Array<{
    to: QuoteStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>
> = {
  draft: [{ to: "sent", label: "Marcar como enviada", icon: Send }],
  sent: [
    { to: "accepted", label: "Marcar como aceptada", icon: CheckCircle2 },
    { to: "rejected", label: "Marcar como rechazada", icon: XCircle },
    { to: "expired", label: "Marcar como vencida", icon: Timer },
    { to: "draft", label: "Volver a borrador", icon: Undo2 },
  ],
  accepted: [{ to: "sent", label: "Volver a enviada", icon: Undo2 }],
  rejected: [{ to: "draft", label: "Volver a borrador", icon: Undo2 }],
  expired: [{ to: "draft", label: "Volver a borrador", icon: Undo2 }],
  converted: [],
};

export const QuoteActions = ({
  id,
  quote,
  children,
  onAfterAction,
  onConvertToPolicy,
}: QuoteActionsProps) => {
  const router = useRouter();
  const status = (quote.status ?? "draft") as QuoteStatus;
  const transitions = STATUS_TRANSITIONS[status];

  const { mutate: removeQuote, isPending: isRemovingQuote } = useRemoveQuote();
  const { mutate: setStatus, isPending: isUpdatingStatus } =
    useSetQuoteStatus();

  const [DeleteConfirm, confirmDelete] = useConfirm({
    title: "Eliminar cotización",
    message:
      "Esta acción no se puede deshacer. ¿Confirmas eliminar esta cotización?",
    type: "critical",
    confirmText: "Eliminar",
  });

  const handleRemove = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    removeQuote(
      { id },
      {
        onSuccess() {
          toast.success("Cotización eliminada");
          onAfterAction?.();
        },
        onError() {
          toast.error("No se pudo eliminar la cotización");
        },
      },
    );
  };

  const handleStatus = (next: QuoteStatus) => {
    setStatus(
      { id, status: next },
      {
        onSuccess() {
          toast.success(
            `Estado actualizado a "${getQuoteStatusMeta(next).label}"`,
          );
          onAfterAction?.();
        },
        onError(error) {
          const message =
            error instanceof Error
              ? error.message
              : "No se pudo actualizar el estado";
          toast.error(message);
        },
      },
    );
  };

  const onOpen = () => {
    router.push(`/companies/${quote.companyId}/quotes/${id}`);
  };

  const canConvert = status === "accepted" && !quote.policyId;

  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <DeleteConfirm />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={onOpen} className="cursor-pointer">
            <Eye className="size-4" />
            Ver cotización
          </DropdownMenuItem>
          {quote.documentUrl && (
            <DropdownMenuItem
              onClick={() => window.open(quote.documentUrl!, "_blank")}
              className="cursor-pointer"
            >
              <FileText className="size-4" />
              Abrir documento
            </DropdownMenuItem>
          )}

          {transitions.length > 0 && (
            <RoleGate permission="quotes_edit">
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  disabled={isUpdatingStatus}
                  className="cursor-pointer"
                >
                  <ArrowRightLeft className="size-4" />
                  Cambiar estado
                  <ChevronRight className="ml-auto size-3.5 opacity-60" />
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Desde {getQuoteStatusMeta(status).label}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {transitions.map((t) => (
                    <DropdownMenuItem
                      key={t.to}
                      onClick={() => handleStatus(t.to)}
                      className="cursor-pointer"
                    >
                      <t.icon className="size-4" />
                      {t.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </RoleGate>
          )}

          {canConvert && (
            <RoleGate permission="quotes_convertToPolicy">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onConvertToPolicy?.(quote)}
                className="cursor-pointer text-aegis-sapphire focus:text-aegis-sapphire"
              >
                <CheckCircle2 className="size-4" />
                Convertir a póliza
              </DropdownMenuItem>
            </RoleGate>
          )}

          <RoleGate permission="quotes_delete">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isRemovingQuote || status === "converted"}
              onClick={handleRemove}
              className="cursor-pointer"
            >
              <X className="size-4" />
              Eliminar cotización
            </DropdownMenuItem>
          </RoleGate>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
