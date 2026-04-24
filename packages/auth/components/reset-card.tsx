"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/get-error-message";
import { calculatePasswordStrength } from "../lib/password-strength";
import type { SignInFlow } from "../types";
import { PasswordField } from "./password-field";
import { PasswordStrengthMeter } from "./password-strength-meter";
import { TextField } from "./text-field";

interface ResetCardProps {
  setState: (state: SignInFlow) => void;
}

export const ResetCard = ({ setState }: ResetCardProps) => {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"email" | "code">("email");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  const onSendCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    signIn("password", { email, flow: "reset" })
      .then(() => {
        toast.success("Código de verificación enviado");
        setStep("code");
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setPending(false));
  };

  const onPasswordReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const strength = calculatePasswordStrength(newPassword);
    if (!strength.isAcceptable) {
      toast.error(
        "Tu contraseña no es lo suficientemente segura. Debe tener al menos 8 caracteres y cumplir 3 de: mayúscula, minúscula, número y símbolo.",
      );
      return;
    }
    setPending(true);
    signIn("password", { email, newPassword, code, flow: "reset-verification" })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setPending(false));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-aegis-graphite">
          Restablecer contraseña
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === "email"
            ? "Te enviaremos un código de verificación a tu correo."
            : "Ingresa el código que recibiste y tu nueva contraseña."}
        </p>
      </div>

      {step === "email" ? (
        <form className="space-y-4" onSubmit={onSendCode}>
          <TextField
            id="reset-email"
            label="Correo"
            type="email"
            value={email}
            required
            disabled={pending}
            autoComplete="email"
            placeholder="ejemplo@mail.com"
            onChange={setEmail}
          />
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            Enviar código
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={onPasswordReset}>
          <TextField
            id="reset-code"
            label="Código de verificación"
            value={code}
            required
            disabled={pending}
            autoComplete="one-time-code"
            onChange={setCode}
          />
          <div>
            <PasswordField
              id="reset-password"
              label="Nueva contraseña"
              value={newPassword}
              required
              revealable
              disabled={pending}
              autoComplete="new-password"
              onChange={setNewPassword}
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            Restablecer contraseña
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={() => setState("signIn")}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-aegis-sapphire"
      >
        <ArrowLeft className="size-3.5" />
        Regresar al inicio de sesión
      </button>
    </div>
  );
};
