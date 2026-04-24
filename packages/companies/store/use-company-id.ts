import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export const useCompanyId = () => {
  const { companyId } = useParams<{ companyId: Id<"companies"> }>();
  return companyId;
};
