import { api } from "@/convex/_generated/api";
import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { useExecute } from "@/components/hooks/use-execute";

const route = api.quote;

export const useGetQuoteFromDoc = () => useExecute(route.getQuoteFromDoc);

export const useCreateQuote = () => useMutate(route.create);

export const useUpdateQuote = () => useMutate(route.update);

export const useRemoveQuote = () => useMutate(route.remove);

export const useGetQuotesByCompany = (data: typeof route.getByCompany._args) =>
  useFetch(route.getByCompany, data);

export const useGetQuoteById = (data: typeof route.getById._args) =>
  useFetch(route.getById, data);
