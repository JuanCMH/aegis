import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export const useClientId = () => {
  const { clientId } = useParams<{ clientId: Id<"clients"> }>();
  return clientId;
};
