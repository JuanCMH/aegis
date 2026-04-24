"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/aegis/icons/google";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getErrorMessage } from "@/lib/get-error-message";
import { calculatePasswordStrength } from "../lib/password-strength";
import { PasswordField } from "./password-field";
import { PasswordStrengthMeter } from "./password-strength-meter";
import { TextField } from "./text-field";

export const SignUpCard = () => {
  const { signIn } = useAuthActions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);

  const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    const strength = calculatePasswordStrength(password);
    if (!strength.isAcceptable) {
      toast.error(
        "Tu contraseña no es lo suficientemente segura. Debe tener al menos 8 caracteres y cumplir 3 de: mayúscula, minúscula, número y símbolo.",
      );
      return;
    }
    setPending(true);
    signIn("password", { name, email, password, flow: "signUp" })
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
          Crea tu cuenta
        </h1>
        <p className="text-sm text-muted-foreground">
          Regístrate para empezar a centralizar tu operación.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onPasswordSignUp}>
        <TextField
          id="signup-name"
          label="Nombre"
          value={name}
          required
          disabled={pending}
          autoComplete="name"
          placeholder="Juan Pérez"
          onChange={setName}
        />
        <TextField
          id="signup-email"
          label="Correo"
          type="email"
          value={email}
          required
          disabled={pending}
          autoComplete="email"
          placeholder="ejemplo@mail.com"
          onChange={setEmail}
        />

        <div>
          <PasswordField
            id="signup-password"
            label="Contraseña"
            value={password}
            required
            revealable
            disabled={pending}
            autoComplete="new-password"
            onChange={setPassword}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <PasswordField
          id="signup-confirm"
          label="Confirmar contraseña"
          value={confirmPassword}
          required
          revealable
          disabled={pending}
          autoComplete="new-password"
          onChange={setConfirmPassword}
        />

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          Crear cuenta
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
