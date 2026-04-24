"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/aegis/icons/google";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getErrorMessage } from "@/lib/get-error-message";
import type { SignInFlow } from "../types";
import { PasswordField } from "./password-field";
import { TextField } from "./text-field";

interface SignInCardProps {
  setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {
  const { signIn } = useAuthActions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    signIn("password", { email, password, flow: "signIn" })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setPending(false));
  };

  const onProviderSignIn = (value: "google") => {
    setPending(true);
    signIn(value, { redirectTo: "/companies" }).finally(() =>
      setPending(false),
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-aegis-graphite">
          Bienvenido de nuevo
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa a tu agencia con correo y contraseña.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onPasswordSignIn}>
        <TextField
          id="signin-email"
          label="Correo"
          type="email"
          value={email}
          required
          disabled={pending}
          autoComplete="email"
          placeholder="ejemplo@mail.com"
          onChange={setEmail}
        />
        <PasswordField
          id="signin-password"
          label="Contraseña"
          value={password}
          required
          disabled={pending}
          onChange={setPassword}
        />

        <button
          type="button"
          onClick={() => setState("reset")}
          className="text-xs text-muted-foreground transition-colors hover:text-aegis-sapphire"
        >
          ¿Olvidaste tu contraseña?
        </button>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          Iniciar sesión
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
            o
          </span>
        </span>
      </div>

      <Button
        size="lg"
        variant="outline"
        disabled={pending}
        onClick={() => onProviderSignIn("google")}
        className="relative w-full"
      >
        <GoogleIcon className="mr-2 size-5" />
        Continuar con Google
      </Button>
    </div>
  );
};
