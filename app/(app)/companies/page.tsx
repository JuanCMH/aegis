"use client";

import { useGetCompanies } from "@/packages/companies/api";
import { useCreateCompanyModal } from "@/packages/companies/store/use-create-company-modal";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Companies() {
  const router = useRouter();
  const { data: companies, isLoading: isLoadingCompanies } =
    useGetCompanies();

  const [open, setOpen] = useCreateCompanyModal();

  const companyId = useMemo(() => companies?.[0]?._id, [companies]);

  useEffect(() => {
    if (isLoadingCompanies) return;
    if (companyId) {
      router.replace(`/companies/${companyId}`);
    } else {
      setOpen(true);
    }
  }, [companyId, isLoadingCompanies, open, setOpen]);
}
