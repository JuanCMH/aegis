"use client";

import { useGetWorkspaces } from "@/packages/workspaces/api";
import { useCreateWorkspaceModal } from "@/packages/workspaces/store/use-create-workspace-modal";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Workspaces() {
  const router = useRouter();
  const { data: workspaces, isLoading: isLoadingWorkspaces } =
    useGetWorkspaces();

  const [open, setOpen] = useCreateWorkspaceModal();

  const workspaceId = useMemo(() => workspaces?.[0]?._id, [workspaces]);

  useEffect(() => {
    if (isLoadingWorkspaces) return;
    if (workspaceId) {
      router.replace(`/workspaces/${workspaceId}`);
    } else {
      setOpen(true);
    }
  }, [workspaceId, isLoadingWorkspaces, open, setOpen]);
}
