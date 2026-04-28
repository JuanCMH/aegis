"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompanyId } from "../store/use-company-id";
import { useGroupCollapseState } from "../store/use-sidebar-prefs";
import type { NavGroup, NavItem, SheetKey } from "./company-navigation";

interface CompanyMenuProps {
  groups: NavGroup[];
  sheetSetters: Record<SheetKey, (open: boolean) => void>;
}

export function CompanyMenu({ groups, sheetSetters }: CompanyMenuProps) {
  const pathname = usePathname();
  const { isMobile, state, setOpen } = useSidebar();
  const companyId = useCompanyId();
  const {
    collapsed,
    toggle: toggleGroup,
    hydrated,
  } = useGroupCollapseState(companyId);

  const showExpanded = isMobile || state === "expanded";

  const isItemActive = (item: NavItem) => {
    if (item.action.type !== "link") return false;
    const url = item.action.url;
    if (pathname === url) return true;
    if (url.endsWith("/new")) return false;
    if (!pathname.startsWith(`${url}/`)) return false;
    const tail = pathname.slice(url.length + 1);
    return tail.length > 0 && tail !== "new";
  };

  const isGroupActive = (group: NavGroup) => group.items.some(isItemActive);

  const collapseIfNeeded = () => {
    if (!isMobile && state === "expanded") setOpen(false);
  };

  const runItem = (item: NavItem) => {
    if (item.action.type === "callback") {
      sheetSetters[item.action.key as SheetKey]?.(true);
    }
  };

  /* ------------------------------ Collapsed ----------------------------- */
  if (!showExpanded) {
    return (
      <SidebarGroup>
        <SidebarMenu>
          {groups.map((group) => (
            <SidebarMenuItem key={group.title}>
              <SidebarMenuButton
                type="button"
                tooltip={group.title}
                isActive={isGroupActive(group)}
                className="cursor-pointer justify-center"
                onClick={() => setOpen(true)}
              >
                <group.icon />
                <span>{group.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  /* ------------------------------ Expanded ------------------------------ */
  return (
    <>
      {groups.map((group) => {
        const groupActive = isGroupActive(group);
        const isOpen = hydrated ? !collapsed[group.title] : true;

        return (
          <Collapsible
            key={group.title}
            open={isOpen}
            onOpenChange={() => toggleGroup(group.title)}
            asChild
          >
            <SidebarGroup className="py-1">
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel
                  className={cn(
                    "group/label flex cursor-pointer items-center justify-between text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground",
                    groupActive && "text-sidebar-foreground",
                  )}
                >
                  <span>{group.title}</span>
                  <ChevronRight
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      isOpen && "rotate-90",
                    )}
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const active = isItemActive(item);
                      const Icon = item.icon;

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild={item.action.type === "link"}
                            isActive={active}
                            tooltip={item.description ?? item.title}
                            aria-current={active ? "page" : undefined}
                            onClick={
                              item.action.type === "callback"
                                ? () => runItem(item)
                                : undefined
                            }
                            className={cn(
                              "cursor-pointer",
                              active &&
                                "relative font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-r-full before:bg-aegis-sapphire",
                            )}
                          >
                            {item.action.type === "link" ? (
                              <Link
                                href={item.action.url}
                                onClick={collapseIfNeeded}
                              >
                                <Icon className="size-4" />
                                <span>{item.title}</span>
                              </Link>
                            ) : (
                              <>
                                <Icon className="size-4" />
                                <span>{item.title}</span>
                              </>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        );
      })}
    </>
  );
}
