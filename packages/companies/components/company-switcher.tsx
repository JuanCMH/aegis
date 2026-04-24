"use client";

import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useGetCompaniesByUserId, useGetCompany } from "../api";
import { useCompanyId } from "../store/use-company-id";
import { useCreateCompanyModal } from "../store/use-create-company-modal";

export const CompanySwitcher = () => {
  const router = useRouter();
  const { isMobile, state: sidebarState } = useSidebar();
  const companyId = useCompanyId();

  const { data: companies, isLoading: companiesLoading } =
    useGetCompaniesByUserId();
  const { data: company, isLoading: companyLoading } = useGetCompany({
    id: companyId,
  });

  const [, setOpenCreateCompany] = useCreateCompanyModal();

  const isLoading = companyLoading || companiesLoading;
  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={isLoading}
              className="gap-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-aegis-sapphire/15 bg-aegis-sapphire/10 text-aegis-sapphire">
                <Building2 className="size-4" />
              </div>
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
                    Agencia actual
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
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
          >
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Agencias
            </DropdownMenuLabel>
            <div className="max-h-60 space-y-0.5 overflow-y-auto overflow-x-hidden">
              {companies?.map((c) => {
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
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-aegis-sapphire">
                      <Building2 className="size-3.5" />
                    </div>
                    <span className="line-clamp-1 flex-1">{c?.name}</span>
                    {isActive && (
                      <Check className="ml-auto size-4 text-aegis-sapphire" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setOpenCreateCompany(true)}
              className="cursor-pointer gap-2 p-2"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background">
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
