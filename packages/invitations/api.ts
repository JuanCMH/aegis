import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";

export const useGetInvitationByToken = (
  data: typeof api.invitations.getByToken._args,
) => useFetch(api.invitations.getByToken, data);

export const useAcceptInvitation = () => useMutate(api.invitations.accept);
