import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";

const route = api.bonds;

export const useGetBondsByCompany = (data: typeof route.getByCompany._args) =>
  useFetch(route.getByCompany, data);

export const useGetBond = (data: typeof route.getById._args) =>
  useFetch(route.getById, data);

export const useCreateBond = () => useMutate(route.create);

export const useUpdateBond = () => useMutate(route.update);

export const useSetBondActive = () => useMutate(route.setActive);

export const useRemoveBond = () => useMutate(route.remove);
