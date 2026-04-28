"use client";

import { Copy, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  useNewJoinCompanyCode,
  useRemoveCompany,
  useUpdateCompany,
} from "../../api";

interface AdvancedSectionProps {
  companyId: Id<"companies">;
  isOwner: boolean;
  canEdit: boolean;
  active: boolean;
  joinCode: string;
  companyName: string;
  onClose?: () => void;
}

export function AdvancedSection({
  companyId,
  isOwner,
  canEdit,
  active,
  joinCode,
  companyName,
  onClose,
}: AdvancedSectionProps) {
  const router = useRouter();
  const { mutate: updateCompany, isPending: updating } = useUpdateCompany();
  const { mutate: regen, isPending: regenerating } = useNewJoinCompanyCode();
  const { mutate: remove, isPending: removing } = useRemoveCompany();
  const [optimisticActive, setOptimisticActive] = useState(active);

  const [RegenConfirm, confirmRegen] = useConfirm({
    title: "¿Regenerar código de invitación?",
    message:
      "El código actual dejará de funcionar. Los nuevos miembros deberán usar el nuevo código.",
  });

  const [DeleteConfirm, confirmDelete] = useConfirm({
    title: `¿Eliminar ${companyName}?`,
    message:
      "Se eliminarán todos los miembros, pero no se puede deshacer. Escribe el nombre exacto para confirmar.",
    type: "critical",
  });

  const handleToggleActive = (next: boolean) => {
    setOptimisticActive(next);
    updateCompany(
      { id: companyId, active: next },
      {
        onSuccess: () =>
          toast.success(next ? "Agencia activada" : "Agencia desactivada"),
        onError: () => {
          setOptimisticActive(!next);
          toast.error("No se pudo cambiar el estado");
        },
      },
    );
  };

  const handleRegen = async () => {
    if (!(await confirmRegen())) return;
    regen(
      { id: companyId },
      {
        onSuccess: () => toast.success("Código regenerado"),
        onError: () => toast.error("No se pudo regenerar"),
      },
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      toast.success("Código copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const handleDelete = async () => {
    if (!(await confirmDelete())) return;
    remove(
      { id: companyId },
      {
        onSuccess: () => {
          toast.success("Agencia eliminada");
          onClose?.();
          router.push("/companies");
        },
        onError: () => toast.error("No se pudo eliminar"),
      },
    );
  };

  return (
    <>
      <RegenConfirm />
      <DeleteConfirm />

      <div className="rounded-xl border border-border/60 bg-card">
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold tracking-tight">Avanzado</h3>
            <p className="truncate text-xs text-muted-foreground">
              Acciones sensibles. Solo el propietario puede eliminar la agencia.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {/* Join code */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Código de invitación</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm tracking-wider">
                {joinCode}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopy}
              >
                <Copy className="size-4" />
                Copiar
              </Button>
              {canEdit && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRegen}
                  disabled={regenerating}
                >
                  <RefreshCw
                    className={cn("size-4", regenerating && "animate-spin")}
                  />
                  Regenerar
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Comparte este código con quienes deban unirse a la agencia.
            </p>
          </div>

          {/* Active toggle */}
          {canEdit && (
            <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium">Agencia activa</p>
                <p className="text-xs text-muted-foreground">
                  Si la desactivas, no aparecerá en listas pero sus datos se
                  preservan.
                </p>
              </div>
              <Switch
                checked={optimisticActive}
                onCheckedChange={handleToggleActive}
                disabled={updating}
              />
            </div>
          )}

          {/* Danger zone */}
          {isOwner && (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-destructive">
                  Eliminar agencia
                </p>
                <p className="text-xs text-muted-foreground">
                  Borra la agencia y todos sus miembros. No se puede deshacer.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={removing}
              >
                <Trash2 className="size-4" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
