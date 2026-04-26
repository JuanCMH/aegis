import { api } from "@/convex/_generated/api";
import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { useExecute } from "@/components/hooks/use-execute";
import { usePaginatedQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

// Policy Template hooks
const templateRoute = api.policyTemplates;

export const useGetPolicyTemplate = (
  data: typeof templateRoute.getByCompany._args,
) => useFetch(templateRoute.getByCompany, data);

export const useSavePolicyTemplate = () => useMutate(templateRoute.save);

// Policy hooks
const policyRoute = api.policies;

export const useCreatePolicy = () => useMutate(policyRoute.create);

export const useUpdatePolicy = () => useMutate(policyRoute.update);

export const useRemovePolicy = () => useMutate(policyRoute.remove);

export const useCancelPolicy = () => useMutate(policyRoute.cancel);

export const useRenewPolicy = () => useMutate(policyRoute.renew);

export const usePaginatedPolicies = (
  companyId: Id<"companies">,
  search?: string,
  status?: "active" | "expired" | "canceled" | "pending",
) => {
  const result = usePaginatedQuery(
    policyRoute.getByCompany,
    { companyId, search, status },
    { initialNumItems: 25 },
  );
  return result;
};

export const useGetPolicyById = (data: typeof policyRoute.getById._args) =>
  useFetch(policyRoute.getById, data);

export const useGetPoliciesDueSoon = (
  data: typeof policyRoute.getDueSoon._args,
) => useFetch(policyRoute.getDueSoon, data);

// AI action hooks
const aiRoute = api.policyActions;

export const useExtractPolicyFromDoc = () => useExecute(aiRoute.extractFromDoc);

export const useGenerateTemplateFromDoc = () =>
  useExecute(aiRoute.generateFromDoc);

export const useReviewTemplate = () => useExecute(aiRoute.reviewTemplate);
