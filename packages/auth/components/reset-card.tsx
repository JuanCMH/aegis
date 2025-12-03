"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { calculatePasswordStrength } from "../lib/password-strength";
import type { SignInFlow } from "../types";

interface ResetCardProps {
  setState: (state: SignInFlow) => void;
}

export const ResetCard = ({ setState }: ResetCardProps) => {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"code" | "email">("email");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  const onSengCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    signIn("password", { email, flow: "reset" })
      .then(() => {
        toast.success("Código de verificación enviado");
        setStep("code");
      })
      .catch(() => {
        toast.error("Correo no valido");
      })
      .finally(() => {
        setPending(false);
      });
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
      .catch(() => toast.error("Correo o contraseña incorrectos"))
      .finally(() => setPending(false));
  };

  return (
    <Card className="w-full h-full p-4">
      <CardHeader className="px-0 pt-0 space-y-1 text-center">
        <CardDescription>
          Restablece tu contraseña ingresando tu correo electrónico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-0 pb-0">
        {step === "email" ? (
          <form className="space-y-2" onSubmit={onSengCode}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground"
              >
                Correo
              </label>
              <Input
                required
                type="email"
                value={email}
                disabled={pending}
                placeholder="ejemplo@mail.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={pending}
            >
              Enviar código
            </Button>
          </form>
        ) : (
          <form className="space-y-2" onSubmit={onPasswordReset}>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-muted-foreground"
              >
                Nueva contraseña
              </label>
              <Input
                required
                type="password"
                value={newPassword}
                disabled={pending}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {newPassword && (
                <div className="mt-1.5 space-y-0.5" aria-live="polite">
                  {(() => {
                    const s = calculatePasswordStrength(newPassword);
                    return (
                      <>
                        <div className="h-2 w-full bg-muted rounded">
                          <div
                            className={`h-2 rounded ${s.colorClass}`}
                            style={{ width: `${s.percent}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.label}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-muted-foreground"
              >
                Código de verificación
              </label>
              <Input
                required
                value={code}
                disabled={pending}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={pending}
            >
              Restablecer contraseña
            </Button>
          </form>
        )}
        <Separator />
        <p className="text-sm text-muted-foreground">
          <span
            onClick={() => setState("signIn")}
            className="hover:underline cursor-pointer"
          >
            Regresar al inicio de sesión
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
