"use client";

import { CreateCompanyModal } from "@/packages/companies/components/modals/create-company-modal";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CreateCompanyModal />
    </>
  );
};
