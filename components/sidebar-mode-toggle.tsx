import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RiMoonFill, RiSunFill } from "@remixicon/react";
import { useTheme } from "next-themes";
import { SidebarMenuButton, useSidebar } from "./ui/sidebar";

interface ModeToggleProps {
  align?: "center" | "end" | "start";
}

export const SidebarModeToggle = ({ align = "center" }: ModeToggleProps) => {
  const { setTheme } = useTheme();
  const { state: sidebarState } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="sm"
          tooltip={{
            hidden: false,
            children: "Tema",
          }}
          className="font-semibold w-full overflow-hidden cursor-pointer border"
        >
          <span
            className={cn(
              "truncate mr-auto",
              sidebarState === "collapsed" &&
                "hidden transition-all duration-700",
            )}
          >
            Tema
          </span>
          <span className="relative flex items-center justify-center">
            <RiSunFill className="size-4 rotate-0 scale-100 transition-all duration-700 dark:-rotate-90 dark:scale-0 origin-left" />
            <RiMoonFill className="absolute size-4 rotate-90 scale-0 transition-all duration-700 dark:rotate-0 dark:scale-100 origin-right" />
          </span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="poppins">
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
