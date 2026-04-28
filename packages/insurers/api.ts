import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";

const route = api.insurers;

export const useGetInsurers = (data: typeof route.getByCompany._args) =>
  useFetch(route.getByCompany, data);

export const useGetInsurer = (data: typeof route.getById._args) =>
  useFetch(route.getById, data);

export const useCreateInsurer = () => useMutate(route.create);

export const useUpdateInsurer = () => useMutate(route.update);

export const useSetInsurerActive = () => useMutate(route.setActive);

export const useRemoveInsurer = () => useMutate(route.remove);

export const useBulkCreateInsurers = () => useMutate(route.bulkCreate);
