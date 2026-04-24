"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  /** Adds an eye toggle to reveal the password. */
  revealable?: boolean;
  className?: string;
}

/**
 * Labelled password input with optional reveal toggle. Local UI state only —
 * no business logic, no validation (that's the caller's responsibility).
 */
export const PasswordField = ({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete = "current-password",
  required,
  revealable = false,
  className,
}: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);
  const type = revealable && visible ? "text" : "password";

  return (
    <div className={cn("grid w-full items-center gap-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-aegis-steel">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={revealable ? "pr-10" : undefined}
        />
        {revealable ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
};
