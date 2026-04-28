import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

interface ModeToggleProps {
  align?: "center" | "end" | "start";
}

export const SidebarModeToggle = ({ align = "center" }: ModeToggleProps) => {
  const { setTheme } = useTheme();
  const { state: sidebarState } = useSidebar();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const content = (
    <SidebarMenuButton
      size="sm"
      className="w-full overflow-hidden cursor-pointer text-sidebar-foreground/70 hover:text-sidebar-foreground"
      title={sidebarState === "collapsed" ? "Tema" : undefined}
      aria-label="Tema"
    >
      <span
        className={cn(
          "truncate mr-auto",
          sidebarState === "collapsed" && "hidden transition-all duration-700",
        )}
      >
        Tema
      </span>
      <span className="relative flex items-center justify-center">
        <Sun className="size-4 rotate-0 scale-100 transition-all duration-700 dark:-rotate-90 dark:scale-0 origin-left" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-700 dark:rotate-0 dark:scale-100 origin-right" />
      </span>
    </SidebarMenuButton>
  );

  if (!hasHydrated) {
    return content;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {content}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setTheme("light")}
        >
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setTheme("dark")}
        >
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setTheme("system")}
        >
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
