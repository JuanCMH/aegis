"use client";

import { toast } from "sonner";
import {
  CheckCircle2,
  FileSignature,
  RotateCcw,
  Send,
  Trash2,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/hooks/use-confirm";
import { getErrorMessage } from "@/lib/get-error-message";
import { RoleGate } from "@/packages/roles/components/role-gate";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useRemoveQuote, useSetQuoteStatus } from "../api";
import type { QuoteStatus } from "../types";
import { QuoteStatusBadge } from "./quote-status-badge";

type QuoteDoc = Doc<"quotes">;

interface QuoteActionsBarProps {
  quote: QuoteDoc;
  onConvertToPolicy?: () => void;
  onAfterRemove?: () => void;
  className?: string;
}

const STATUS_ACTIONS: Record<
  QuoteStatus,
  Array<{
    to: QuoteStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant?: "default" | "outline" | "destructive";
    confirmType?: "info" | "warning" | "critical";
  }>
> = {
  draft: [
    {
      to: "sent",
      label: "Marcar como enviada",
      icon: Send,
      variant: "default",
    },
  ],
  sent: [
    {
      to: "accepted",
      label: "Marcar aceptada",
      icon: CheckCircle2,
      variant: "default",
    },
    {
      to: "rejected",
      label: "Marcar rechazada",
      icon: XCircle,
      variant: "outline",
      confirmType: "warning",
    },
    {
      to: "expired",
      label: "Marcar expirada",
      icon: Clock,
      variant: "outline",
    },
    {
      to: "draft",
      label: "Volver a borrador",
      icon: RotateCcw,
      variant: "outline",
    },
  ],
  accepted: [
    {
      to: "sent",
      label: "Volver a enviada",
      icon: RotateCcw,
      variant: "outline",
    },
  ],
  rejected: [
    {
      to: "sent",
      label: "Reabrir",
      icon: RotateCcw,
      variant: "outline",
    },
  ],
  expired: [
    {
      to: "sent",
      label: "Reabrir",
      icon: RotateCcw,
      variant: "outline",
    },
  ],
  converted: [],
};

export function QuoteActionsBar({
  quote,
  onConvertToPolicy,
  onAfterRemove,
  className,
}: QuoteActionsBarProps) {
  const status: QuoteStatus = (quote.status ?? "draft") as QuoteStatus;
  const { mutate: setStatus, isPending: isChangingStatus } =
    useSetQuoteStatus();
  const { mutate: removeQuote, isPending: isRemoving } = useRemoveQuote();

  const [DeleteDialog, confirmDelete] = useConfirm({
    title: "Eliminar cotización",
    message: "Esta acción no se puede deshacer.",
    type: "critical",
    confirmText: "Eliminar",
  });

  const [StatusDialog, confirmStatus] = useConfirm({
    title: "Cambiar estado",
    message: "¿Confirmas el cambio de estado de la cotización?",
    type: "warning",
    confirmText: "Cambiar",
  });

  const handleStatus = async (to: QuoteStatus, needsConfirm: boolean) => {
    if (needsConfirm) {
      const ok = await confirmStatus();
      if (!ok) return;
    }
    setStatus(
      { id: quote._id as Id<"quotes">, status: to },
      {
        onSuccess: () => toast.success("Estado actualizado"),
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const handleRemove = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    removeQuote(
      { id: quote._id as Id<"quotes"> },
      {
        onSuccess: () => {
          toast.success("Cotización eliminada");
          onAfterRemove?.();
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const transitions = STATUS_ACTIONS[status] ?? [];
  const canConvert = status === "accepted" && !quote.policyId;
  const canDelete = status !== "converted";
  const isPending = isChangingStatus || isRemoving;

  return (
    <>
      <DeleteDialog />
      <StatusDialog />
      <div
        className={
          className ??
          "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 bg-card/80 px-4 py-3"
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Estado:</span>
          <QuoteStatusBadge status={status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canConvert && (
            <RoleGate permission="quotes_convertToPolicy">
              <Button
                size="sm"
                onClick={onConvertToPolicy}
                disabled={isPending}
              >
                <FileSignature />
                Convertir a póliza
              </Button>
            </RoleGate>
          )}
          {transitions.map((t) => {
            const Icon = t.icon;
            return (
              <RoleGate key={t.to} permission="quotes_edit">
                <Button
                  size="sm"
                  variant={t.variant ?? "outline"}
                  disabled={isPending}
                  onClick={() =>
                    handleStatus(t.to, t.confirmType !== undefined)
                  }
                >
                  <Icon />
                  {t.label}
                </Button>
              </RoleGate>
            );
          })}
          {canDelete && (
            <RoleGate permission="quotes_delete">
              <Button
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={handleRemove}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
                Eliminar
              </Button>
            </RoleGate>
          )}
        </div>
      </div>
    </>
  );
}
