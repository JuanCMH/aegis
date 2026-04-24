"use client";

import {
  Building2,
  Globe,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";
import { useRemoveInsurer, useSetInsurerActive } from "../api";
import type { InsurerDoc } from "../types";

interface InsurerCardProps {
  insurer: InsurerDoc;
  canManage: boolean;
  onEdit: (insurer: InsurerDoc) => void;
}

export function InsurerCard({ insurer, canManage, onEdit }: InsurerCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { mutate: setActive, isPending: isToggling } = useSetInsurerActive();
  const { mutate: remove, isPending: isRemoving } = useRemoveInsurer();

  const [DeleteConfirm, confirmDelete] = useConfirm({
    title: "Eliminar aseguradora",
    message: `Se eliminará "${insurer.name}" del catálogo. Las pólizas existentes mantienen el nombre registrado, pero no podrás seleccionarla en nuevas pólizas.`,
    type: "critical",
    confirmText: "Eliminar",
  });

  const handleToggle = async () => {
    setMenuOpen(false);
    await setActive(
      { id: insurer._id, isActive: !insurer.isActive },
      {
        onSuccess: () =>
          toast.success(
            insurer.isActive ? "Aseguradora archivada" : "Aseguradora activada",
          ),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    const ok = await confirmDelete();
    if (!ok) return;
    await remove(
      { id: insurer._id },
      {
        onSuccess: () => toast.success("Aseguradora eliminada"),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  const initials = insurer.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <DeleteConfirm />
      <div
        className={cn(
          "group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:border-aegis-sapphire/30 hover:shadow-sm",
          !insurer.isActive && "opacity-70",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-aegis-sapphire/10 text-aegis-sapphire">
              {initials ? (
                <span className="text-sm font-semibold">{initials}</span>
              ) : (
                <Building2 className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-aegis-graphite">
                  {insurer.name}
                </p>
                {!insurer.isActive && (
                  <Badge
                    variant="outline"
                    className="bg-aegis-slate/10 text-aegis-steel border-aegis-slate/30 text-[10px]"
                  >
                    Archivada
                  </Badge>
                )}
              </div>
              {insurer.taxId && (
                <p className="mt-0.5 truncate font-mono text-xs text-aegis-steel">
                  NIT · {insurer.taxId}
                </p>
              )}
            </div>
          </div>
          {canManage && (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  disabled={isToggling || isRemoving}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => onEdit(insurer)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleToggle}>
                  {insurer.isActive ? (
                    <>
                      <PowerOff className="size-4" />
                      Archivar
                    </>
                  ) : (
                    <>
                      <Power className="size-4" />
                      Activar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {(insurer.email || insurer.phone || insurer.website) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/40 pt-2 text-xs text-aegis-steel">
            {insurer.email && (
              <a
                href={`mailto:${insurer.email}`}
                className="inline-flex items-center gap-1.5 transition hover:text-aegis-sapphire"
              >
                <Mail className="size-3.5" />
                <span className="truncate">{insurer.email}</span>
              </a>
            )}
            {insurer.phone && (
              <a
                href={`tel:${insurer.phone}`}
                className="inline-flex items-center gap-1.5 transition hover:text-aegis-sapphire"
              >
                <Phone className="size-3.5" />
                <span>{insurer.phone}</span>
              </a>
            )}
            {insurer.website && (
              <a
                href={
                  insurer.website.startsWith("http")
                    ? insurer.website
                    : `https://${insurer.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-aegis-sapphire"
              >
                <Globe className="size-3.5" />
                <span className="truncate">{insurer.website}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
