"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import {
  useGetClientTemplate,
  usePaginatedClients,
} from "@/packages/clients/api";
import {
  createClientColumns,
  type ClientRow,
} from "@/packages/clients/components/table/client-columns";
import { ClientDataTable } from "@/packages/clients/components/table/client-data-table";
import { useDebounce } from "@/components/hooks/use-debounce";
import { RoleGate } from "@/packages/roles/components/role-gate";
import type { TemplateField, TemplateSection } from "@/packages/clients/types";

export default function ClientsPage() {
  const router = useRouter();
  const companyId = useCompanyId();
  const template = useGetClientTemplate({ companyId });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { results, status, loadMore } = usePaginatedClients(
    companyId,
    debouncedSearch || undefined,
  );

  const rows: ClientRow[] = useMemo(
    () =>
      (results ?? []).map((c) => ({
        _id: c._id,
        _creationTime: c._creationTime,
        name: c.name,
        identificationNumber: c.identificationNumber,
        data: (c.data ?? {}) as Record<string, unknown>,
      })),
    [results],
  );

  const columns = useMemo(() => {
    const sections = template.data?.sections as TemplateSection[] | undefined;
    const visibleFields: TemplateField[] = (sections ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((section) => section.fields)
      .filter(
        (field) =>
          field.showInTable &&
          field.id !== "field_name" &&
          field.id !== "field_identificationNumber",
      );

    return createClientColumns(visibleFields);
  }, [template.data]);

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
          <h1 className="text-base font-medium">Lista de Clientes</h1>
          <div className="ml-auto flex items-center gap-2">
            <RoleGate permission="clients_create">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(`/companies/${companyId}/clients/new`)
                }
                className="cursor-pointer"
              >
                <Plus />
                Nuevo Cliente
              </Button>
            </RoleGate>
          </div>
        </div>
      </header>
      <ClientDataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        isDone={isDone}
        onLoadMore={() => loadMore(25)}
      />
    </main>
  );
}
