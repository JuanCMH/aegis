import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export const useQuoteId = () => {
  const { quoteId } = useParams<{ quoteId: Id<"quotes"> }>();
  return quoteId;
};
