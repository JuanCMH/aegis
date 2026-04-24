"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CompanySidebar } from "@/packages/companies/components/company-sidebar";

interface CompanyLayoutProps {
  children: React.ReactNode;
}

const CompanyLayout = ({ children }: CompanyLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <CompanySidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default CompanyLayout;
