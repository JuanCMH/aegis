import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export const usePolicyId = () => {
  const { policyId } = useParams<{ policyId: Id<"policies"> }>();
  return policyId;
};
