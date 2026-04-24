import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export type CompanyMenuItem = {
  title: string;
  icon: LucideIcon;
  url?: string;
  onClick?: () => void;
};

export type CompanyMenuSection = {
  title: string;
  icon: LucideIcon;
  items: CompanyMenuItem[];
};

export function CompanyMenu({ data }: { data: CompanyMenuSection[] }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const { isMobile, open, setOpen, state } = useSidebar();

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;
    if (!isMobile && open) {
      setOpen(false);
    }
  }, [pathname, isMobile, open, setOpen]);

  const showExpandedMenu = isMobile || state === "expanded";

  const isItemActive = (url?: string) => {
    if (!url) {
      return false;
    }
    if (pathname === url) {
      return true;
    }

    if (url.endsWith("/new")) {
      return false;
    }

    if (!pathname.startsWith(`${url}/`)) {
      return false;
    }

    const nestedPath = pathname.slice(url.length + 1);
    return nestedPath.length > 0 && nestedPath !== "new";
  };

  const isSectionActive = (items: CompanyMenuItem[]) =>
    items.some((item) => isItemActive(item.url));

  const collapseIfNeeded = () => {
    if (!isMobile && open) {
      setOpen(false);
    }
  };

  if (!showExpandedMenu) {
    return (
      <SidebarGroup>
        <SidebarMenu>
          {data.map((section) => (
            <SidebarMenuItem key={section.title}>
              <SidebarMenuButton
                type="button"
                tooltip={section.title}
                isActive={isSectionActive(section.items)}
                className="cursor-pointer justify-center"
                onClick={() => setOpen(true)}
              >
                <section.icon />
                <span>{section.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="gap-3">
      <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/50">
        Navegacion
      </SidebarGroupLabel>
      <SidebarGroupContent className="space-y-3">
        {data.map((section) => (
          <div key={section.title} className="space-y-1">
            <div
              className={cn(
                "flex items-center gap-2 px-2 text-xs font-medium tracking-tight text-sidebar-foreground/60",
                isSectionActive(section.items) && "text-sidebar-foreground",
              )}
            >
              <section.icon className="size-4" />
              <span>{section.title}</span>
            </div>
            <SidebarMenuSub className="mx-0 py-0 pl-2 pr-0">
              {section.items.map((item) => {
                const isActive = isItemActive(item.url);

                if (item.onClick) {
                  return (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive}
                        size="md"
                        className="cursor-pointer rounded-md px-2"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            item.onClick?.();
                            collapseIfNeeded();
                          }}
                          className="w-full text-left"
                        >
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                }

                return (
                  <SidebarMenuSubItem key={item.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive}
                      size="md"
                      className="cursor-pointer rounded-md px-2"
                    >
                      <Link href={item.url ?? "#"} onClick={collapseIfNeeded}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </div>
        ))}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
