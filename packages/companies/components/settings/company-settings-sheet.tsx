"use client";

import { Settings2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/packages/auth/api";
import { useHasPermissions } from "@/packages/roles/api";
import { useGetCompany } from "../../api";
import { useCompanyId } from "../../store/use-company-id";
import { useCompanySettingsSheet } from "../../store/use-company-settings-sheet";
import { AdvancedSection } from "./advanced-section";
import { BrandIdentitySection } from "./brand-identity-section";
import { ContactSection } from "./contact-section";
import { LocationSection } from "./location-section";

export function CompanySettingsSheet() {
  const companyId = useCompanyId();
  const [open, setOpen] = useCompanySettingsSheet();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b border-muted bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-aegis-sapphire/10 text-aegis-sapphire">
              <Settings2 className="size-5" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold tracking-tight text-aegis-graphite">
                Ajustes de la agencia
              </SheetTitle>
              <SheetDescription className="text-sm text-aegis-steel">
                Identidad, contacto, ubicación y preferencias de marca.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {companyId ? (
          <SettingsBody companyId={companyId} onClose={() => setOpen(false)} />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function SettingsBody({
  companyId,
  onClose,
}: {
  companyId: ReturnType<typeof useCompanyId>;
  onClose: () => void;
}) {
  const { data: company, isLoading } = useGetCompany({
    id: companyId as never,
  });
  const { data: currentUser } = useCurrentUser();
  const { permissions } = useHasPermissions({
    companyId: companyId as never,
    permissions: ["company_edit"],
  });

  const canEdit = permissions?.company_edit ?? false;
  const isOwner =
    !!currentUser && !!company && currentUser._id === company.userId;

  if (isLoading || !company) {
    return (
      <div className="flex flex-col gap-3 p-6">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-6">
      {!canEdit && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Estás viendo los ajustes en modo solo lectura.
        </div>
      )}

      <BrandIdentitySection
        companyId={company._id}
        canEdit={canEdit}
        initial={{
          name: company.name,
          legalName: company.legalName,
          taxIdType: company.taxIdType,
          taxIdNumber: company.taxIdNumber,
          primaryColor: company.primaryColor,
          secondaryColor: company.secondaryColor,
        }}
        logoUrl={company.logoUrl}
      />

      <ContactSection
        companyId={company._id}
        canEdit={canEdit}
        initial={{
          email: company.email,
          phone: company.phone,
          whatsapp: company.whatsapp,
          website: company.website,
        }}
      />

      <LocationSection
        companyId={company._id}
        canEdit={canEdit}
        initial={{
          country: company.country,
          department: company.department,
          city: company.city,
          address: company.address,
        }}
      />

      <AdvancedSection
        companyId={company._id}
        isOwner={isOwner}
        canEdit={canEdit}
        active={company.active ?? true}
        joinCode={company.joinCode}
        companyName={company.name}
        onClose={onClose}
      />
    </div>
  );
}
