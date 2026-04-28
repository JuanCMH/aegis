"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BondsSheet } from "@/packages/bonds/components/bonds-sheet";
import { CompanyCommandPalette } from "@/packages/companies/components/company-command-palette";
import { CompanySidebar } from "@/packages/companies/components/company-sidebar";
import { CompanySettingsSheet } from "@/packages/companies/components/settings/company-settings-sheet";
import { InsurersSheet } from "@/packages/insurers/components/insurers-sheet";
import { LinesOfBusinessSheet } from "@/packages/linesOfBusiness/components/lines-of-business-sheet";
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
      <CompanyCommandPalette />
      <MembersSheet />
      <RolesSheet />
      <InsurersSheet />
      <LinesOfBusinessSheet />
      <BondsSheet />
      <CompanySettingsSheet />
    </SidebarProvider>
  );
};

export default CompanyLayout;
