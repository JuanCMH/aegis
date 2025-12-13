import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";

const route = api.quote;

export const useGetQuoteFromDoc = () => useAction(route.getQuoteFromDoc);
