import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";

/* --------------------------------- Members -------------------------------- */

export const useGetMembersByCompany = (
  data: typeof api.members.getByCompany._args,
) => useFetch(api.members.getByCompany, data);

export const useGetCurrentMember = (
  data: typeof api.members.getCurrent._args,
) => useFetch(api.members.getCurrent, data);

export const useChangeMemberRole = () => useMutate(api.members.changeRole);

export const useRemoveMember = () => useMutate(api.members.remove);

export const useLeaveCompany = () => useMutate(api.members.leave);

/* ------------------------------ Invitations ------------------------------- */

export const useGetPendingInvitations = (
  data: typeof api.invitations.getPendingByCompany._args,
) => useFetch(api.invitations.getPendingByCompany, data);

export const useCreateInvitation = () => useMutate(api.invitations.create);

export const useRevokeInvitation = () => useMutate(api.invitations.revoke);

export const useResendInvitation = () => useMutate(api.invitations.resend);
