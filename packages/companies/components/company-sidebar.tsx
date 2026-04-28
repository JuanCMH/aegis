"use client";

import { Search } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  SidebarChangelog,
  SidebarHelp,
} from "@/components/aegis/sidebar-extras";
import { SidebarModeToggle } from "@/components/aegis/sidebar-mode-toggle";
import { SidebarUser } from "@/components/aegis/sidebar-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useBondsSheet } from "@/packages/bonds/store/use-bonds-sheet";
import { useInsurersSheet } from "@/packages/insurers/store/use-insurers-sheet";
import { useLinesOfBusinessSheet } from "@/packages/linesOfBusiness/store/use-lines-of-business-sheet";
import { useMembersSheet } from "@/packages/members/store/use-members-sheet";
import { useRolesSheet } from "@/packages/roles/store/use-roles-sheet";
import { cn } from "@/lib/utils";
import { useCompanyId } from "../store/use-company-id";
import { useCommandPalette } from "../store/use-command-palette";
import { useCompanySettingsSheet } from "../store/use-company-settings-sheet";
import {
  buildCompanyNavigation,
  SHEET_KEYS,
  type SheetKey,
} from "./company-navigation";
import { CompanyMenu } from "./company-menu";
import { CompanySwitcher } from "./company-switcher";

export function CompanySidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const companyId = useCompanyId();
  const [, setMembersSheet] = useMembersSheet();
  const [, setRolesSheet] = useRolesSheet();
  const [, setInsurersSheet] = useInsurersSheet();
  const [, setLinesOfBusinessSheet] = useLinesOfBusinessSheet();
  const [, setBondsSheet] = useBondsSheet();
  const [, setCompanySettingsSheet] = useCompanySettingsSheet();

  const sheetSetters: Record<SheetKey, (open: boolean) => void> = {
    [SHEET_KEYS.members]: setMembersSheet,
    [SHEET_KEYS.roles]: setRolesSheet,
    [SHEET_KEYS.insurers]: setInsurersSheet,
    [SHEET_KEYS.linesOfBusiness]: setLinesOfBusinessSheet,
    [SHEET_KEYS.bonds]: setBondsSheet,
    [SHEET_KEYS.companySettings]: setCompanySettingsSheet,
  };

  const groups = companyId ? buildCompanyNavigation(companyId) : [];

  return (
    <Sidebar variant="inset" collapsible="icon" desktopOverlay {...props}>
      <SidebarHeader className="gap-2">
        <CompanySwitcher />
        <CommandPaletteTrigger />
      </SidebarHeader>
      <SidebarContent>
        <CompanyMenu groups={groups} sheetSetters={sheetSetters} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarChangelog />
        <SidebarHelp />
        <SidebarModeToggle />
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function CommandPaletteTrigger() {
  const [, setOpen] = useCommandPalette();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setOpen(true)}
      className={cn(
        "h-8 w-full justify-start gap-2 border-sidebar-border/60 bg-sidebar-accent/30 px-2 text-xs font-normal text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        isCollapsed && "justify-center px-0",
      )}
      aria-label="Abrir paleta de comandos"
    >
      <Search className="size-3.5" />
      {!isCollapsed && (
        <>
          <span>Buscar o ir a…</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </>
      )}
    </Button>
  );
}
