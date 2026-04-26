import { api } from "@/convex/_generated/api";
import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { useExecute } from "@/components/hooks/use-execute";

const route = api.quote;

// AI extraction
export const useGetQuoteFromDoc = () => useExecute(route.getQuoteFromDoc);

// Mutations
export const useCreateQuote = () => useMutate(route.create);
export const useUpdateQuote = () => useMutate(route.update);
export const useRemoveQuote = () => useMutate(route.remove);
export const useSetQuoteStatus = () => useMutate(route.setStatus);
export const useConvertQuoteToPolicy = () => useMutate(route.convertToPolicy);

// Queries
export const useGetQuoteById = (data: typeof route.getById._args) =>
  useFetch(route.getById, data);

export const useSearchQuotes = (data: typeof route.searchByCompany._args) =>
  useFetch(route.searchByCompany, data);

export const useGetQuotesByClient = (data: typeof route.getByClient._args) =>
  useFetch(route.getByClient, data);

export const useGetQuoteCompanyStats = (
  data: typeof route.getCompanyStats._args,
) => useFetch(route.getCompanyStats, data);

/**
 * @deprecated Temporary shim until Phase 4 of the quotes overhaul. Use
 * `useSearchQuotes` instead.
 */
export const useGetQuotesByCompany = (data: typeof route.getByCompany._args) =>
  useFetch(route.getByCompany, data);
