"use client";

import { Check, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Whether the form has unsaved changes. */
  dirty?: boolean;
  /** Show "Guardar" button & form wiring. */
  canEdit?: boolean;
  isSaving?: boolean;
  /** Handler when the user submits the section form. */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Handler to discard local changes. */
  onReset?: () => void;
  children: ReactNode;
}

/**
 * One block inside the settings sheet. Renders an icon header, a body slot and
 * (when editable) a per-section save bar that only activates with dirty state.
 */
export function SettingsSection({
  icon: Icon,
  title,
  description,
  dirty,
  canEdit = true,
  isSaving = false,
  onSubmit,
  onReset,
  children,
}: SettingsSectionProps) {
  const showFooter = canEdit && Boolean(onSubmit);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border/60 bg-card"
    >
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-aegis-sapphire/10 text-aegis-sapphire">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="truncate text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">{children}</div>

      {showFooter && (
        <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-4 py-2.5">
          {dirty && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onReset}
              disabled={isSaving}
            >
              Descartar
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!dirty || isSaving}
            className={cn("min-w-24", !dirty && "opacity-60")}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Guardando
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                Guardar
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
