"use client";

import { CreateWorkspaceModal } from "@/packages/workspaces/components/modals/create-workspace-modal";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CreateWorkspaceModal />
    </>
  );
};
