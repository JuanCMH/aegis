import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";

const route = api.bonds;

export const useCreateBond = () => useMutate(route.create);

export const useUpdateBond = () => useMutate(route.update);

export const useRemoveBond = () => useMutate(route.remove);

export const useGetBondsByCompany = (
  data: typeof route.getByCompany._args,
) => useFetch(route.getByCompany, data);
