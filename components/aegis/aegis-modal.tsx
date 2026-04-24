"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * AegisModal — compound wrapper around shadcn Dialog.
 *
 * Use this for **fixed-content** dialogs only: forms, tabs, settings,
 * confirmations. For variable-length lists or browseable collections, use
 * `AegisSheet` instead. See `.agents/skills/aegis-interface/SKILL.md` §2.2
 * and §2.3 for the full contract.
 *
 * The header icon container defaults to the Aegis Sapphire accent. Override
 * with `iconClassName` on `AegisModalHeader` for destructive / semantic
 * variants.
 */

/* ---------------------------------- Root ---------------------------------- */

interface AegisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tailwind max-width class, e.g. `sm:max-w-2xl`. Defaults to shadcn's Dialog max-width. */
  maxWidth?: string;
  children: React.ReactNode;
}

function AegisModal({
  open,
  onOpenChange,
  maxWidth,
  children,
}: AegisModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden [&>form]:min-h-0 [&>form]:flex [&>form]:flex-col [&>form]:overflow-hidden",
          maxWidth,
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- Header --------------------------------- */

interface AegisModalHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  /** Override the icon container classes. Default: Aegis Sapphire accent. */
  iconClassName?: string;
  title: string;
  description?: string;
}

function AegisModalHeader({
  icon: Icon,
  iconClassName = "bg-aegis-sapphire/10 border-aegis-sapphire/10 text-aegis-sapphire",
  title,
  description,
}: AegisModalHeaderProps) {
  return (
    <div className="shrink-0">
      <DialogHeader className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center size-10 rounded-xl border",
              iconClassName,
            )}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold tracking-tight">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm">
                {description}
              </DialogDescription>
            )}
          </div>
        </div>
      </DialogHeader>
      <Separator className="opacity-40" />
    </div>
  );
}

/* --------------------------------- Content -------------------------------- */

interface AegisModalContentProps {
  children: React.ReactNode;
  className?: string;
}

function AegisModalContent({ children, className }: AegisModalContentProps) {
  return (
    <div className={cn("p-4 min-h-0 overflow-y-auto", className)}>
      {children}
    </div>
  );
}

/* --------------------------------- Footer --------------------------------- */

interface AegisModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

function AegisModalFooter({ children, className }: AegisModalFooterProps) {
  return (
    <div className="shrink-0">
      <Separator className="opacity-40" />
      <div className={cn("flex items-center justify-end gap-2 p-4", className)}>
        {children}
      </div>
    </div>
  );
}

/* --------------------------------- Exports -------------------------------- */

export {
  AegisModal,
  AegisModalHeader,
  AegisModalContent,
  AegisModalFooter,
  DialogClose,
};
