"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import {
  useGetPolicyTemplate,
  usePaginatedPolicies,
} from "@/packages/policies/api";
import {
  createPolicyColumns,
  type PolicyRow,
} from "@/packages/policies/components/table/policy-columns";
import { PolicyDataTable } from "@/packages/policies/components/table/policy-data-table";
import { useDebounce } from "@/components/hooks/use-debounce";
import { RoleGate } from "@/packages/roles/components/role-gate";
import type { TemplateField, TemplateSection } from "@/packages/policies/types";

const FIXED_FIELD_IDS = new Set([
  "field_policyNumber",
  "field_status",
  "field_startDate",
  "field_endDate",
]);

type StatusFilter = "all" | "active" | "expired" | "canceled" | "pending";

export default function PoliciesPage() {
  const router = useRouter();
  const companyId = useCompanyId();
  const template = useGetPolicyTemplate({ companyId });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const debouncedSearch = useDebounce(search, 300);

  const { results, status, loadMore } = usePaginatedPolicies(
    companyId,
    debouncedSearch || undefined,
    statusFilter === "all" ? undefined : statusFilter,
  );

  const rows: PolicyRow[] = useMemo(
    () =>
      (results ?? []).map((p) => ({
        _id: p._id,
        _creationTime: p._creationTime,
        policyNumber: p.policyNumber,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        clientId: p.clientId,
        data: (p.data ?? {}) as Record<string, unknown>,
      })),
    [results],
  );

  const sections = useMemo<TemplateSection[]>(() => {
    const raw = template.data?.sections as TemplateSection[] | undefined;
    return (raw ?? []).slice().sort((a, b) => a.order - b.order);
  }, [template.data]);

  const visibleFields = useMemo<TemplateField[]>(
    () =>
      sections
        .flatMap((section) => section.fields)
        .filter((field) => field.showInTable && !FIXED_FIELD_IDS.has(field.id)),
    [sections],
  );

  const columns = useMemo(
    () => createPolicyColumns(visibleFields),
    [visibleFields],
  );

  const hasTemplate = sections.length > 0;
  const isLoading = status === "LoadingFirstPage";
  const isDone = status !== "CanLoadMore";

  return (
    <main className="w-full h-full flex-1 flex flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Lista de Pólizas</h1>
          <div className="ml-auto flex items-center gap-2">
            <RoleGate permission="policies_create">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(`/companies/${companyId}/policies/new`)
                }
                className="cursor-pointer"
              >
                <Plus />
                Nueva Póliza
              </Button>
            </RoleGate>
          </div>
        </div>
      </header>
      <PolicyDataTable
        data={rows}
        columns={columns}
        fields={visibleFields}
        sections={sections}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isDone={isDone}
        onLoadMore={() => loadMore(25)}
        hasTemplate={hasTemplate}
      />
    </main>
  );
}
