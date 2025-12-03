import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ComponentProps } from "react";

export function WorkspaceSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{/* <WorkspaceSwitcher /> */}</SidebarHeader>
      <SidebarContent>{/* <WorkspaceMenu menus={menus} /> */}</SidebarContent>
      <SidebarFooter>
        {/* <SidebarModeToogle /> */}
        {/* <SidebarUser /> */}
      </SidebarFooter>
    </Sidebar>
  );
}
