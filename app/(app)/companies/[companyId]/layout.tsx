"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CompanySidebar } from "@/packages/companies/components/company-sidebar";
import { MembersSheet } from "@/packages/members/components/members-sheet";
import { RolesSheet } from "@/packages/roles/components/roles-sheet";

interface CompanyLayoutProps {
  children: React.ReactNode;
}

const CompanyLayout = ({ children }: CompanyLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <CompanySidebar />
      <SidebarInset>{children}</SidebarInset>
      <MembersSheet />
      <RolesSheet />
    </SidebarProvider>
  );
};

export default CompanyLayout;
