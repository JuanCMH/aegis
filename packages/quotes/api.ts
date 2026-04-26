import { api } from "@/convex/_generated/api";
import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { useExecute } from "@/components/hooks/use-execute";
import { usePaginatedQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import type { QuoteSearchField, QuoteStatus, QuoteType } from "./types";

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

interface PaginatedQuotesArgs {
  companyId: Id<"companies">;
  searchTerm?: string;
  searchField?: QuoteSearchField;
  status?: QuoteStatus;
  clientId?: Id<"clients">;
  quoteType?: QuoteType;
  dateFrom?: number;
  dateTo?: number;
}

/**
 * Cursor-paginated wrapper around `quote.searchByCompany`. Used by the list
 * page to drive the data table and IntersectionObserver auto-load.
 */
export const usePaginatedQuotes = (args: PaginatedQuotesArgs) => {
  return usePaginatedQuery(
    route.searchByCompany,
    {
      companyId: args.companyId,
      searchTerm: args.searchTerm,
      searchField: args.searchField,
      status: args.status,
      clientId: args.clientId,
      quoteType: args.quoteType,
      dateFrom: args.dateFrom,
      dateTo: args.dateTo,
    },
    { initialNumItems: 25 },
  );
};
