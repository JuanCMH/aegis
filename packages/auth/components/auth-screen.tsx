"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AegisLogo } from "@/components/aegis/aegis-logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCurrentUser } from "../api";
import {
  useAcceptInvitation,
  useGetInvitationByToken,
} from "@/packages/invitations/api";
import { InvitationAcceptCard } from "@/packages/invitations/components/invitation-accept-card";
import type { SignInFlow } from "../types";
import { ResetCard } from "./reset-card";
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";

export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn");
  const searchParams = useSearchParams();
  const router = useRouter();
  const invitationToken = searchParams.get("invitation");

  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { data: currentUser } = useCurrentUser();
  const { data: invitation } = useGetInvitationByToken(
    invitationToken ? { token: invitationToken } : { token: "" },
  );
  const { mutate: accept } = useAcceptInvitation();

  // Auto-accept: once user is authenticated with matching email, accept.
  const acceptedRef = useRef(false);
  useEffect(() => {
    if (acceptedRef.current) return;
    if (!invitationToken || !invitation) return;
    if (invitation.status !== "pending" || invitation.isExpired) return;
    if (isAuthLoading || !isAuthenticated) return;
    if (!currentUser?.email) return;
    if (currentUser.email.toLowerCase() !== invitation.email.toLowerCase())
      return;

    acceptedRef.current = true;
    accept(
      { token: invitationToken },
      {
        onSuccess: (companyId) => {
          toast.success(`Te uniste a ${invitation.company.name}`);
          router.push(`/companies/${companyId}`);
        },
        onError: (err) => {
          acceptedRef.current = false;
          toast.error(getErrorMessage(err));
        },
      },
    );
  }, [
    accept,
    currentUser?.email,
    invitation,
    invitationToken,
    isAuthLoading,
    isAuthenticated,
    router,
  ]);

  return (
    <div className="grid min-h-svh w-full grid-cols-1 md:grid-cols-2">
      <div className="relative flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <AegisLogo className="size-9" />
            <span className="text-2xl font-semibold tracking-tight text-aegis-graphite">
              Aegis
            </span>
          </div>

          {invitationToken && (
            <div className="mb-6">
              <InvitationAcceptCard token={invitationToken} />
            </div>
          )}

          {state === "reset" ? (
            <ResetCard setState={setState} />
          ) : (
            <Tabs
              value={state}
              onValueChange={(val) => setState(val as SignInFlow)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signIn">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="signUp">Crear cuenta</TabsTrigger>
              </TabsList>

              <TabsContent value="signIn" className="mt-6">
                <SignInCard setState={setState} />
              </TabsContent>
              <TabsContent value="signUp" className="mt-6">
                <SignUpCard />
              </TabsContent>
            </Tabs>
          )}

          <p className="mt-8 text-balance text-center text-xs leading-relaxed text-muted-foreground">
            Crear una cuenta no otorga acceso automático a una agencia. Solicita
            tu invitación o una prueba gratuita en{" "}
            <Link
              href="/contacto"
              className="font-medium text-aegis-sapphire underline-offset-4 hover:underline"
            >
              contacto
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-aegis-midnight md:flex md:flex-col md:justify-between md:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--color-aegis-sapphire) 0, transparent 45%), radial-gradient(circle at 85% 75%, var(--color-aegis-cyan) 0, transparent 40%)",
          }}
        />
        <div className="relative flex items-center gap-3 text-white/90">
          <AegisLogo className="size-8" />
          <span className="text-lg font-medium tracking-tight">Aegis</span>
        </div>

        <div className="relative max-w-md">
          <p className="font-cormorant text-3xl italic leading-tight text-white">
            El instrumento de trabajo de los profesionales del riesgo.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-white/70">
            Clientes, pólizas, cotizaciones, garantías, comisiones y
            renovaciones — en una sola plataforma trazable.
          </p>
        </div>

        <div className="relative flex items-center justify-between text-xs text-white/50">
          <span>© Aegis</span>
          <span className="font-mono tracking-wider">v1.0</span>
        </div>
      </div>
    </div>
  );
};
