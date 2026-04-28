"use client";

import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useGetCurrentMember } from "@/packages/members/api";
import { useGetCompaniesByUserId, useGetCompany } from "../api";
import { useCompanyId } from "../store/use-company-id";
import { useCreateCompanyModal } from "../store/use-create-company-modal";

/**
 * Compute a stable color hash for an initial chip background.
 * Pairs with low-saturation gradient palette consistent with brand.
 */
function gradientFor(name?: string): string {
  if (!name) return "from-aegis-sapphire/20 to-aegis-sapphire/5";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const palettes = [
    "from-aegis-sapphire/30 to-aegis-sapphire/5",
    "from-emerald-500/30 to-emerald-500/5",
    "from-amber-500/30 to-amber-500/5",
    "from-rose-500/30 to-rose-500/5",
    "from-violet-500/30 to-violet-500/5",
    "from-cyan-500/30 to-cyan-500/5",
  ];
  return palettes[hash % palettes.length];
}

function initialOf(name?: string) {
  if (!name) return "·";
  return name.trim().charAt(0).toUpperCase();
}

function roleLabel(
  member:
    | {
        isOwner?: boolean;
        role?: string;
        customRole?: { name: string } | null;
      }
    | null
    | undefined,
) {
  if (!member) return null;
  if (member.isOwner) return "Propietario";
  if (member.customRole?.name) return member.customRole.name;
  if (member.role === "admin") return "Administrador";
  return "Miembro";
}

export const CompanySwitcher = () => {
  const router = useRouter();
  const { isMobile, state: sidebarState } = useSidebar();
  const companyId = useCompanyId();
  const [search, setSearch] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);

  const { data: companies, isLoading: companiesLoading } =
    useGetCompaniesByUserId();
  const { data: company, isLoading: companyLoading } = useGetCompany({
    id: companyId,
  });
  const { data: currentMember } = useGetCurrentMember(
    companyId ? { companyId } : ({ companyId } as never),
  );

  const [, setOpenCreateCompany] = useCreateCompanyModal();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Keep the first client render aligned with SSR so Radix trigger ids remain
  // stable across hydration.
  const isLoading = !hasHydrated || companyLoading || companiesLoading;
  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  const filtered = useMemo(() => {
    if (!companies) return [];
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => (c?.name ?? "").toLowerCase().includes(q));
  }, [companies, search]);

  const role = roleLabel(currentMember);

  if (!hasHydrated) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            disabled
            aria-label="Agencia"
            className="gap-3 cursor-default"
          >
            <Skeleton className="size-8 rounded-lg" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu onOpenChange={(open) => !open && setSearch("")}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={isLoading}
              className="gap-3 cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              title={isCollapsed ? (company?.name ?? "Agencia") : undefined}
              aria-label={company?.name ?? "Agencia"}
            >
              {isLoading ? (
                <Skeleton className="size-8 rounded-lg" />
              ) : (
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-sidebar-foreground font-semibold",
                    gradientFor(company?.name),
                  )}
                >
                  {initialOf(company?.name)}
                </div>
              )}
              {!isLoading && (
                <div
                  className={cn(
                    "grid flex-1 text-left text-sm leading-tight transition-opacity",
                    isCollapsed && "opacity-0",
                  )}
                >
                  <span className="truncate font-semibold tracking-tight">
                    {company?.name ?? "Agencia"}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {role ?? "Agencia actual"}
                  </span>
                </div>
              )}
              <ChevronsUpDown
                className={cn(
                  "ml-auto size-4 text-sidebar-foreground/60",
                  isCollapsed && "hidden",
                )}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={4}
            side={isMobile ? "bottom" : "right"}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-72 rounded-lg p-0"
          >
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Agencias
            </DropdownMenuLabel>
            {(companies?.length ?? 0) > 5 && (
              <div className="px-2 pb-1">
                <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
                  <Search className="size-3.5 text-muted-foreground" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar agencia…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}
            <div className="max-h-72 space-y-0.5 overflow-y-auto overflow-x-hidden px-1 pb-1">
              {filtered.length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                  Sin coincidencias.
                </p>
              )}
              {filtered.map((c) => {
                const isActive = c?._id === companyId;
                return (
                  <DropdownMenuItem
                    key={c?._id}
                    onClick={() => router.push(`/companies/${c?._id}`)}
                    className={cn(
                      "cursor-pointer gap-2 p-2",
                      isActive && "bg-accent text-accent-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md bg-linear-to-br text-xs font-semibold",
                        gradientFor(c?.name),
                      )}
                    >
                      {initialOf(c?.name)}
                    </div>
                    <span className="line-clamp-1 flex-1">{c?.name}</span>
                    {isActive && (
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[10px]"
                      >
                        Activa
                      </Badge>
                    )}
                    {isActive && (
                      <Check className="size-4 text-aegis-sapphire" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem
              onClick={() => setOpenCreateCompany(true)}
              className="cursor-pointer gap-2 p-2"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-dashed bg-background">
                <Plus className="size-3.5" />
              </div>
              <span className="font-medium">Nueva agencia</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
