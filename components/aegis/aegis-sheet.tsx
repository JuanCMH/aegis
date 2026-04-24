"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * AegisSheet — compound wrapper around shadcn Sheet.
 *
 * Use this for **variable-length content**: browseable lists, collections,
 * search results, detail views with nested records. For fixed-content dialogs
 * (forms, tabs, confirmations), use `AegisModal` instead. See
 * `.agents/skills/aegis-interface/SKILL.md` §2.3 for the full contract,
 * including the standard item-card structure inside `AegisSheetContent`.
 *
 * The header icon container defaults to the Aegis Sapphire accent. Override
 * with `iconClassName` on `AegisSheetHeader` for destructive / semantic
 * variants.
 */

/* ---------------------------------- Root ---------------------------------- */

interface AegisSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tailwind max-width class. Default: `sm:max-w-lg`. Use `sm:max-w-2xl` for heavy detail views. */
  maxWidth?: string;
  children: React.ReactNode;
}

function AegisSheet({
  open,
  onOpenChange,
  maxWidth = "sm:max-w-lg",
  children,
}: AegisSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn("flex flex-col gap-0", maxWidth)}>
        {children}
      </SheetContent>
    </Sheet>
  );
}

/* --------------------------------- Header --------------------------------- */

interface AegisSheetHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  /** Override the icon container classes. Default: Aegis Sapphire accent. */
  iconClassName?: string;
  title: string;
  description?: string;
}

function AegisSheetHeader({
  icon: Icon,
  iconClassName = "bg-aegis-sapphire/10 border-aegis-sapphire/10 text-aegis-sapphire",
  title,
  description,
}: AegisSheetHeaderProps) {
  return (
    <>
      <SheetHeader className="pb-4">
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
            <SheetTitle className="text-base font-semibold tracking-tight">
              {title}
            </SheetTitle>
            {description && (
              <SheetDescription className="text-sm">
                {description}
              </SheetDescription>
            )}
          </div>
        </div>
      </SheetHeader>
      <Separator className="opacity-40" />
    </>
  );
}

/* --------------------------------- Toolbar -------------------------------- */

interface AegisSheetToolbarProps {
  children: React.ReactNode;
  className?: string;
}

function AegisSheetToolbar({ children, className }: AegisSheetToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* --------------------------------- Content -------------------------------- */

interface AegisSheetContentProps {
  children: React.ReactNode;
  className?: string;
}

function AegisSheetContent({ children, className }: AegisSheetContentProps) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className={cn("flex flex-col gap-2 px-2 pb-4", className)}>
        {children}
      </div>
    </div>
  );
}

/* --------------------------------- Footer --------------------------------- */

interface AegisSheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

function AegisSheetFooter({ children, className }: AegisSheetFooterProps) {
  return (
    <>
      <Separator className="opacity-40" />
      <div className={cn("flex items-center gap-2 p-4", className)}>
        {children}
      </div>
    </>
  );
}

/* --------------------------------- Exports -------------------------------- */

export {
  AegisSheet,
  AegisSheetHeader,
  AegisSheetToolbar,
  AegisSheetContent,
  AegisSheetFooter,
  SheetClose,
};
