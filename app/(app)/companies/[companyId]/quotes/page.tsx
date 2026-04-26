"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { RoleGate } from "@/packages/roles/components/role-gate";
import {
  usePaginatedQuotes,
  useGetQuoteCompanyStats,
} from "@/packages/quotes/api";
import {
  createQuoteColumns,
  type QuoteRow,
} from "@/packages/quotes/components/table/quote-column";
import { QuoteDataTable } from "@/packages/quotes/components/table/quote-data-table";
import { QuoteSearchInput } from "@/packages/quotes/components/quote-search-input";
import { QuoteStatusFilter } from "@/packages/quotes/components/quote-status-filter";
import {
  QuoteAdvancedFilters,
  advancedFiltersToQueryArgs,
  countActiveQuoteFilters,
} from "@/packages/quotes/components/quote-advanced-filters";
import { QuotePeriodSummary } from "@/packages/quotes/components/quote-period-summary";
import { QuoteConvertModal } from "@/packages/quotes/components/modals/quote-convert-modal";
import type {
  QuoteAdvancedFilterState,
  QuoteSearchField,
  QuoteStatus,
} from "@/packages/quotes/types";
import type { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";

const EMPTY_FILTERS: QuoteAdvancedFilterState = { periodMode: "all" };

const periodLabel = (state: QuoteAdvancedFilterState): string | undefined => {
  if (state.periodMode === "month" && state.month) {
    const [year, month] = state.month.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return format(date, "MMMM yyyy", { locale: es });
  }
  if (state.periodMode === "range") {
    const from = state.rangeFrom
      ? format(new Date(state.rangeFrom), "dd MMM yyyy", { locale: es })
      : "—";
    const to = state.rangeTo
      ? format(new Date(state.rangeTo), "dd MMM yyyy", { locale: es })
      : "—";
    return `${from} → ${to}`;
  }
  return undefined;
};

export default function QuotesPage() {
  const companyId = useCompanyId();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<QuoteSearchField>("contractor");
  const [status, setStatus] = useState<QuoteStatus | undefined>(undefined);
  const [filters, setFilters] = useState<QuoteAdvancedFilterState>(EMPTY_FILTERS);
  const [convertQuote, setConvertQuote] = useState<Doc<"quotes"> | null>(null);

  const queryArgs = useMemo(() => {
    const adv = advancedFiltersToQueryArgs(filters);
    return {
      companyId,
      searchTerm: searchTerm.trim() || undefined,
      searchField: searchTerm.trim() ? searchField : undefined,
      status,
      ...adv,
    };
  }, [companyId, searchTerm, searchField, status, filters]);

  const { results, status: pagStatus, loadMore } = usePaginatedQuotes(queryArgs);

  // Stats are scoped to the same period (so the Status filter chip counts and
  // the period summary card reflect the period the user is exploring).
  const statsArgs = useMemo(
    () => ({
      companyId,
      dateFrom: queryArgs.dateFrom,
      dateTo: queryArgs.dateTo,
    }),
    [companyId, queryArgs.dateFrom, queryArgs.dateTo],
  );
  const { data: stats } = useGetQuoteCompanyStats(statsArgs);

  const rows: QuoteRow[] = useMemo(
    () =>
      (results ?? []).map((q) => ({
        ...q,
        clientName: undefined,
      })),
    [results],
  );

  const columns = useMemo(
    () =>
      createQuoteColumns({
        onConvertToPolicy: (quote) => setConvertQuote(quote),
      }),
    [],
  );

  const isLoading = pagStatus === "LoadingFirstPage";
  const isDone = pagStatus !== "CanLoadMore";

  const advancedActiveCount = countActiveQuoteFilters(filters);
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    status !== undefined ||
    advancedActiveCount > 0;

  const showPeriodSummary =
    filters.periodMode === "month" || filters.periodMode === "range";

  const clearAll = () => {
    setSearchTerm("");
    setStatus(undefined);
    setFilters(EMPTY_FILTERS);
  };

  return (
    <main className="flex h-full w-full flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Cotizaciones</h1>
          <div className="ml-auto flex items-center gap-2">
            <RoleGate permission="quotes_create">
              <Button
                asChild
                size="sm"
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                <Link href={`/companies/${companyId}/quotes/new`}>
                  <Plus />
                  Nueva cotización
                </Link>
              </Button>
            </RoleGate>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pt-4 lg:px-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <QuoteSearchInput
            value={searchTerm}
            field={searchField}
            onChange={({ term, field }) => {
              setSearchTerm(term);
              setSearchField(field);
            }}
            className="w-full lg:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-2">
            <QuoteStatusFilter
              value={status}
              onChange={setStatus}
              counts={stats?.byStatus}
            />
            <QuoteAdvancedFilters value={filters} onChange={setFilters} />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            {searchTerm.trim() && (
              <FilterChip
                label={`${searchField === "contractor" ? "Contratista" : "Contratante"}: "${searchTerm}"`}
                onRemove={() => setSearchTerm("")}
              />
            )}
            {status && (
              <FilterChip
                label={`Estado: ${status}`}
                onRemove={() => setStatus(undefined)}
              />
            )}
            {filters.periodMode !== "all" && periodLabel(filters) && (
              <FilterChip
                label={`Período: ${periodLabel(filters)}`}
                onRemove={() =>
                  setFilters((f) => ({
                    ...f,
                    periodMode: "all",
                    month: undefined,
                    rangeFrom: undefined,
                    rangeTo: undefined,
                  }))
                }
              />
            )}
            {filters.clientId && (
              <FilterChip
                label="Cliente vinculado"
                onRemove={() =>
                  setFilters((f) => ({ ...f, clientId: undefined }))
                }
              />
            )}
            {filters.quoteType && (
              <FilterChip
                label={`Tipo: ${filters.quoteType === "bidBond" ? "Seriedad" : "Cumplimiento"}`}
                onRemove={() =>
                  setFilters((f) => ({ ...f, quoteType: undefined }))
                }
              />
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
              className="h-7 px-2 text-xs"
            >
              Limpiar todo
            </Button>
          </div>
        )}

        {showPeriodSummary && (
          <QuotePeriodSummary
            companyId={companyId}
            dateFrom={queryArgs.dateFrom}
            dateTo={queryArgs.dateTo}
            periodLabel={periodLabel(filters)}
          />
        )}
      </div>

      <QuoteDataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        isDone={isDone}
        onLoadMore={() => loadMore(25)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAll}
      />
      {convertQuote && (
        <QuoteConvertModal
          open={!!convertQuote}
          onOpenChange={(open) => {
            if (!open) setConvertQuote(null);
          }}
          quote={convertQuote}
        />
      )}
    </main>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full border bg-card px-2.5 text-xs">
      <span className="capitalize">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
