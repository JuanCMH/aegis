import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";

const route = api.companies;

export const useCreateCompany = () => useMutate(route.create);

export const useUpdateCompany = () => useMutate(route.update);

export const useSetCompanyLogo = () => useMutate(route.setLogo);

export const useRemoveCompany = () => useMutate(route.remove);

export const useJoinCompany = () => useMutate(route.join);

export const useNewJoinCompanyCode = () => useMutate(route.newJoinCode);

export const useGetCompany = (data: typeof route.getById._args) =>
  useFetch(route.getById, data);

export const useGetCompanyPublic = (data: typeof route.getByIdPublic._args) =>
  useFetch(route.getByIdPublic, data);

export const useGetCompanies = () => useFetch(route.get, {});

export const useGetOwnedCompanies = () => useFetch(route.getOwned, {});

export const useGetCompaniesByUserId = () => useFetch(route.getByUserId, {});
