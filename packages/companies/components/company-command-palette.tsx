"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useBondsSheet } from "@/packages/bonds/store/use-bonds-sheet";
import { useInsurersSheet } from "@/packages/insurers/store/use-insurers-sheet";
import { useLinesOfBusinessSheet } from "@/packages/linesOfBusiness/store/use-lines-of-business-sheet";
import { useMembersSheet } from "@/packages/members/store/use-members-sheet";
import { useRolesSheet } from "@/packages/roles/store/use-roles-sheet";
import { useCommandPalette } from "../store/use-command-palette";
import { useCompanyId } from "../store/use-company-id";
import { useCompanySettingsSheet } from "../store/use-company-settings-sheet";
import {
  buildCompanyNavigation,
  flattenNavigation,
  type NavItem,
  SHEET_KEYS,
  type SheetKey,
} from "./company-navigation";

export function CompanyCommandPalette() {
  const [open, setOpen] = useCommandPalette();
  const router = useRouter();
  const companyId = useCompanyId();

  const [, setMembersSheet] = useMembersSheet();
  const [, setRolesSheet] = useRolesSheet();
  const [, setInsurersSheet] = useInsurersSheet();
  const [, setLinesOfBusinessSheet] = useLinesOfBusinessSheet();
  const [, setBondsSheet] = useBondsSheet();
  const [, setCompanySettingsSheet] = useCompanySettingsSheet();

  const sheetSetters: Record<SheetKey, (open: boolean) => void> = useMemo(
    () => ({
      [SHEET_KEYS.members]: setMembersSheet,
      [SHEET_KEYS.roles]: setRolesSheet,
      [SHEET_KEYS.insurers]: setInsurersSheet,
      [SHEET_KEYS.linesOfBusiness]: setLinesOfBusinessSheet,
      [SHEET_KEYS.bonds]: setBondsSheet,
      [SHEET_KEYS.companySettings]: setCompanySettingsSheet,
    }),
    [
      setMembersSheet,
      setRolesSheet,
      setInsurersSheet,
      setLinesOfBusinessSheet,
      setBondsSheet,
      setCompanySettingsSheet,
    ],
  );

  const groups = useMemo(
    () => (companyId ? buildCompanyNavigation(companyId) : []),
    [companyId],
  );
  const flat = useMemo(() => flattenNavigation(groups), [groups]);

  /* ⌘K / Ctrl+K toggles. */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  const runItem = (item: NavItem) => {
    setOpen(false);
    if (item.action.type === "link") {
      router.push(item.action.url);
      return;
    }
    sheetSetters[item.action.key as SheetKey]?.(true);
  };

  const quickActions = flat.filter((i) => i.id.includes("-new:"));

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Buscar y navegar"
      description="Usa ⌘K para abrir esta paleta en cualquier momento."
    >
      <CommandInput placeholder="Buscar acción, página o catálogo…" />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>

        {quickActions.length > 0 && (
          <>
            <CommandGroup heading="Acciones rápidas">
              {quickActions.map((i) => (
                <CommandItem
                  key={`act-${i.id}`}
                  value={`crear ${i.title}`}
                  onSelect={() => runItem(i)}
                >
                  <Plus className="text-aegis-sapphire" />
                  <i.icon />
                  <span>{i.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {groups.map((group) => (
          <CommandGroup key={group.title} heading={group.title}>
            {group.items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${group.title} ${item.title} ${item.description ?? ""}`}
                onSelect={() => runItem(item)}
              >
                <item.icon />
                <span>{item.title}</span>
                {item.description ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
                <ArrowRight className="ml-auto size-3.5 opacity-0 group-data-[selected=true]:opacity-100" />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
