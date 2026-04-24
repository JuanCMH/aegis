"use client";

import { Building2, MailOpen, ShieldAlert, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCurrentUser } from "@/packages/auth/api";
import { cn } from "@/lib/utils";
import { useAcceptInvitation, useGetInvitationByToken } from "../api";

interface InvitationAcceptCardProps {
  token: string;
}

/**
 * Public card rendered on `/auth?invitation=<token>`. Displays invitation
 * metadata and handles the accept flow when the user is authenticated with
 * the matching email.
 */
export function InvitationAcceptCard({ token }: InvitationAcceptCardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { data: invitation, isLoading } = useGetInvitationByToken({ token });
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { mutate: accept, isPending: isAccepting } = useAcceptInvitation();

  if (isLoading || isAuthLoading) {
    return (
      <Card>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-64" />
      </Card>
    );
  }

  if (!invitation) {
    return (
      <Card tone="destructive">
        <Header
          icon={<ShieldAlert className="size-4" />}
          title="Enlace inválido"
          description="Este enlace de invitación no existe o fue revocado."
        />
      </Card>
    );
  }

  if (invitation.status === "revoked") {
    return (
      <Card tone="destructive">
        <Header
          icon={<ShieldAlert className="size-4" />}
          title="Invitación revocada"
          description={`La invitación a ${invitation.company.name} fue revocada.`}
        />
      </Card>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <Card tone="success">
        <Header
          icon={<ShieldCheck className="size-4" />}
          title="Invitación ya aceptada"
          description={`Esta invitación a ${invitation.company.name} ya fue utilizada.`}
        />
      </Card>
    );
  }

  if (invitation.status === "expired" || invitation.isExpired) {
    return (
      <Card tone="destructive">
        <Header
          icon={<ShieldAlert className="size-4" />}
          title="Invitación expirada"
          description={`Pide al administrador de ${invitation.company.name} que te envíe una nueva.`}
        />
      </Card>
    );
  }

  const emailMismatch =
    isAuthenticated &&
    currentUser?.email &&
    currentUser.email.toLowerCase() !== invitation.email.toLowerCase();

  const handleAccept = async () => {
    await accept(
      { token },
      {
        onSuccess: (companyId) => {
          toast.success(`Te uniste a ${invitation.company.name}`);
          router.push(`/companies/${companyId}`);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <Card>
      <Header
        icon={<MailOpen className="size-4" />}
        title={`Invitación a ${invitation.company.name}`}
        description={`Has sido invitado a unirte como ${
          invitation.customRole?.name ??
          (invitation.roleType === "admin" ? "Administrador" : "Miembro")
        }.`}
      />
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs text-aegis-steel">
        <Building2 className="size-4 text-aegis-sapphire" />
        <span className="truncate">
          Para:{" "}
          <span className="font-medium text-aegis-graphite">
            {invitation.email}
          </span>
        </span>
      </div>

      {isAuthenticated && !isUserLoading ? (
        emailMismatch ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Estás autenticado como <strong>{currentUser?.email}</strong>. Cierra
            sesión e ingresa con <strong>{invitation.email}</strong> para
            aceptar.
          </p>
        ) : (
          <Button
            type="button"
            className="mt-4 w-full"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            Aceptar invitación
          </Button>
        )
      ) : (
        <p className="mt-4 text-xs text-aegis-steel">
          Inicia sesión o crea una cuenta con{" "}
          <strong>{invitation.email}</strong> para aceptar esta invitación.
        </p>
      )}
    </Card>
  );
}

function Card({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "destructive" | "success";
}) {
  const toneClass =
    tone === "destructive"
      ? "border-destructive/30 bg-destructive/5"
      : tone === "success"
        ? "border-aegis-emerald/30 bg-aegis-emerald/5"
        : "border-aegis-sapphire/20 bg-aegis-sapphire/5";
  return (
    <div className={cn("rounded-xl border p-4", toneClass)}>{children}</div>
  );
}

function Header({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-aegis-sapphire/10 text-aegis-sapphire">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-aegis-graphite">{title}</p>
        <p className="mt-0.5 text-xs text-aegis-steel">{description}</p>
      </div>
    </div>
  );
}
