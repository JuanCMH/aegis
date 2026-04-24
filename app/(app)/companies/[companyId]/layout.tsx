"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CompanySidebar } from "@/packages/companies/components/company-sidebar";
import { MembersSheet } from "@/packages/members/components/members-sheet";

interface CompanyLayoutProps {
  children: React.ReactNode;
}

const CompanyLayout = ({ children }: CompanyLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <CompanySidebar />
      <SidebarInset>{children}</SidebarInset>
      <MembersSheet />
    </SidebarProvider>
  );
};

export default CompanyLayout;
