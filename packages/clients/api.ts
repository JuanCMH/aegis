import { api } from "@/convex/_generated/api";
import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";

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

export const useGetClientsByWorkspace = (
  data: typeof clientRoute.getByWorkspace._args,
) => useFetch(clientRoute.getByWorkspace, data);

export const useGetClientById = (data: typeof clientRoute.getById._args) =>
  useFetch(clientRoute.getById, data);
