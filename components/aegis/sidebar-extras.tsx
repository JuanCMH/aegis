"use client";

import { LifeBuoy, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const CHANGELOG_KEY = "aegis:changelog:lastSeen";
const CURRENT_VERSION = "0.4.0";

const ENTRIES: Array<{ version: string; date: string; items: string[] }> = [
  {
    version: "0.4.0",
    date: "Abril 2026",
    items: [
      "Sidebar reorganizado (Operación · Catálogos · Administración · Configuración).",
      "Paleta de comandos global con ⌘K.",
      "Importar catálogo de aseguradoras de Colombia (35 entidades).",
    ],
  },
  {
    version: "0.3.0",
    date: "Marzo 2026",
    items: [
      "Plantillas de cliente y póliza.",
      "Roles personalizados con permisos granulares.",
    ],
  },
];

export function SidebarChangelog() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const [open, setOpen] = useState(false);
  // Empezamos en `false` para que el SSR coincida con el primer render del
  // cliente; el indicador "nuevo" se activa en el efecto post-mount.
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    try {
      const lastSeen = window.localStorage.getItem(CHANGELOG_KEY);
      setHasNew(lastSeen !== CURRENT_VERSION);
    } catch {
      // localStorage no disponible (modo privado, etc.) — ignoramos.
    }
  }, []);

  const handleOpen = (next: boolean) => {
    setOpen(next);
    if (next) {
      try {
        window.localStorage.setItem(CHANGELOG_KEY, CURRENT_VERSION);
        setHasNew(false);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <>
      <SidebarMenuButton
        size="sm"
        tooltip={{ hidden: false, children: "Novedades" }}
        onClick={() => handleOpen(true)}
        className="w-full cursor-pointer text-sidebar-foreground/70 hover:text-sidebar-foreground"
      >
        <span className={cn("truncate mr-auto", isCollapsed && "hidden")}>
          Novedades
        </span>
        <span className="relative flex items-center justify-center">
          <Megaphone className="size-4" />
          {hasNew && (
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-aegis-sapphire ring-2 ring-sidebar" />
          )}
        </span>
      </SidebarMenuButton>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="size-4 text-aegis-sapphire" />
              Novedades
            </DialogTitle>
            <DialogDescription>Lo último que llegó a Aegis.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {ENTRIES.map((entry) => (
              <div key={entry.version}>
                <div className="mb-1.5 flex items-center gap-2 text-sm">
                  <span className="font-semibold tracking-tight">
                    v{entry.version}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {entry.date}
                  </span>
                </div>
                <ul className="space-y-1.5 pl-4">
                  {entry.items.map((it) => (
                    <li
                      key={it}
                      className="list-disc text-sm text-muted-foreground marker:text-aegis-sapphire"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SidebarHelp() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarMenuButton
      asChild
      size="sm"
      tooltip={{ hidden: false, children: "Ayuda" }}
      className="w-full cursor-pointer text-sidebar-foreground/70 hover:text-sidebar-foreground"
    >
      <a
        href="mailto:soporte@aegis.app?subject=Ayuda%20con%20Aegis"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={cn("truncate mr-auto", isCollapsed && "hidden")}>
          Ayuda
        </span>
        <LifeBuoy className="size-4" />
      </a>
    </SidebarMenuButton>
  );
}
