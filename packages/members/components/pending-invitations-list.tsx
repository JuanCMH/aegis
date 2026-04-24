"use client";

import { Link as LinkIcon, MailOpen, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";
import { useResendInvitation, useRevokeInvitation } from "../api";
import type { PendingInvitation } from "../types";
import { RoleBadge } from "./role-badge";

interface PendingInvitationsListProps {
  invitations: PendingInvitation[] | undefined;
  isLoading: boolean;
  canRevoke: boolean;
  canInvite: boolean;
}

const ONE_DAY = 1000 * 60 * 60 * 24;

function relativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "hace instantes";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  const weeks = Math.floor(days / 7);
  return `hace ${weeks} sem`;
}

function expiresIn(timestamp: number) {
  const diff = timestamp - Date.now();
  if (diff <= 0) return "expirada";
  const days = Math.ceil(diff / ONE_DAY);
  if (days <= 1) return "expira en menos de 1 día";
  return `expira en ${days} días`;
}

export function PendingInvitationsList({
  invitations,
  isLoading,
  canRevoke,
  canInvite,
}: PendingInvitationsListProps) {
  const [open, setOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (!invitations || invitations.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-aegis-amber/30 bg-aegis-amber/5">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-aegis-amber/10"
          >
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-aegis-amber/15 text-aegis-amber">
                <MailOpen className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-aegis-graphite">
                  Invitaciones pendientes
                </p>
                <p className="text-xs text-aegis-steel">
                  {invitations.length}{" "}
                  {invitations.length === 1 ? "pendiente" : "pendientes"}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "text-xs font-medium text-aegis-steel transition",
                open && "rotate-180",
              )}
            >
              ▾
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-aegis-amber/20">
            {invitations.map((inv) => (
              <InvitationRow
                key={inv._id}
                invitation={inv}
                canRevoke={canRevoke}
                canInvite={canInvite}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function InvitationRow({
  invitation,
  canRevoke,
  canInvite,
}: {
  invitation: PendingInvitation;
  canRevoke: boolean;
  canInvite: boolean;
}) {
  const { mutate: revoke, isPending: isRevoking } = useRevokeInvitation();
  const { mutate: resend, isPending: isResending } = useResendInvitation();

  const [RevokeConfirm, confirmRevoke] = useConfirm({
    title: "Revocar invitación",
    message: `¿Revocar la invitación para ${invitation.email}? El enlace dejará de funcionar.`,
    type: "warning",
    confirmText: "Revocar",
  });

  const handleCopy = async () => {
    const url = `${window.location.origin}/auth?invitation=${invitation.token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const handleRevoke = async () => {
    const ok = await confirmRevoke();
    if (!ok) return;
    await revoke(
      { id: invitation._id },
      {
        onSuccess: () => toast.success("Invitación revocada"),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  const handleResend = async () => {
    await resend(
      { id: invitation._id },
      {
        onSuccess: ({ token }) => {
          const url = `${window.location.origin}/auth?invitation=${token}`;
          navigator.clipboard.writeText(url).catch(() => {});
          toast.success("Invitación renovada — enlace copiado");
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <>
      <RevokeConfirm />
      <div className="flex items-center justify-between gap-3 border-b border-aegis-amber/15 px-4 py-3 last:border-b-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-aegis-amber/10 text-aegis-amber">
            <MailOpen className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-aegis-graphite">
              {invitation.email}
            </p>
            <p className="truncate text-xs text-aegis-steel">
              Invitado {relativeTime(invitation._creationTime)} ·{" "}
              <span
                className={cn(
                  invitation.isExpired
                    ? "text-destructive"
                    : "text-aegis-steel",
                )}
              >
                {expiresIn(invitation.expiresAt)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <RoleBadge
            role={invitation.roleType === "admin" ? "admin" : "member"}
            customRoleName={invitation.customRole?.name}
          />
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleCopy}
            title="Copiar enlace"
          >
            <LinkIcon className="size-4" />
          </Button>
          {canInvite && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleResend}
              disabled={isResending}
              title="Reenviar"
            >
              <RefreshCw className="size-4" />
            </Button>
          )}
          {canRevoke && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleRevoke}
              disabled={isRevoking}
              title="Revocar"
              className="text-destructive hover:text-destructive"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
