import { api } from "@/convex/_generated/api";
import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { useExecute } from "@/components/hooks/use-execute";
import { usePaginatedQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

// Client Template hooks
const templateRoute = api.clientTemplates;

export const useGetClientTemplate = (
  data: typeof templateRoute.getByWorkspace._args,
) => useFetch(templateRoute.getByWorkspace, data);

export const useSaveClientTemplate = () => useMutate(templateRoute.save);

// Client hooks
const clientRoute = api.clients;

export const useCreateClient = () => useMutate(clientRoute.create);

export const useUpdateClient = () => useMutate(clientRoute.update);

export const useRemoveClient = () => useMutate(clientRoute.remove);

export const usePaginatedClients = (
  workspaceId: Id<"workspaces">,
  search?: string,
) => {
  const result = usePaginatedQuery(
    clientRoute.getByWorkspace,
    { workspaceId, search },
    { initialNumItems: 25 },
  );
  return result;
};

export const useGetClientById = (data: typeof clientRoute.getById._args) =>
  useFetch(clientRoute.getById, data);

// AI action hooks
const aiRoute = api.clientActions;

export const useExtractClientFromDoc = () => useExecute(aiRoute.extractFromDoc);

export const useGenerateTemplateFromDoc = () =>
  useExecute(aiRoute.generateFromDoc);

export const useReviewTemplate = () => useExecute(aiRoute.reviewTemplate);
