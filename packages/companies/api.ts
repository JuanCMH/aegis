import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";

const route = api.workspaces;

export const useCreateWorkspace = () => useMutate(route.create);

export const useUpdateWorkspace = () => useMutate(route.update);

export const useRemoveWorkspace = () => useMutate(route.remove);

export const useJoinWorkspace = () => useMutate(route.join);

export const useNewJoinWorkspaceCode = () => useMutate(route.newJoinCode);

export const useGetWorkspace = (data: typeof route.getById._args) =>
  useFetch(route.getById, data);

export const useGetWorkspacePublic = (data: typeof route.getByIdPublic._args) =>
  useFetch(route.getByIdPublic, data);

export const useGetWorkspaces = () => useFetch(route.get, {});

export const useGetOwnedWorkspaces = () => useFetch(route.getOwned, {});

export const useGetWorkspacesByUserId = () => useFetch(route.getByUserId, {});
