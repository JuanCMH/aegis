import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";

const route = api.linesOfBusiness;

export const useGetLinesOfBusiness = (data: typeof route.getByCompany._args) =>
  useFetch(route.getByCompany, data);

export const useGetLineOfBusiness = (data: typeof route.getById._args) =>
  useFetch(route.getById, data);

export const useCreateLineOfBusiness = () => useMutate(route.create);

export const useUpdateLineOfBusiness = () => useMutate(route.update);

export const useSetLineOfBusinessActive = () => useMutate(route.setActive);

export const useRemoveLineOfBusiness = () => useMutate(route.remove);
