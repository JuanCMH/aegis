"use client";

import { useDates } from "@/lib/useDates";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RiAddCircleFill } from "@remixicon/react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetQuotesByWorkspace } from "@/packages/quotes/api";
import { columns } from "@/packages/quotes/components/table/quote-column";
import { useWorkspaceId } from "@/packages/workspaces/hooks/use-workspace-id";
import { QuoteDataTable } from "@/packages/quotes/components/table/quote-data-table";

const QuotePage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const [{ selectedYear, selectedMonth }, setDates] = useDates();
  const currentMonthValue = `${selectedYear}-${selectedMonth.padStart(2, "0")}`;

  const { data: quotes, isLoading: isLoadingQuotes } = useGetQuotesByWorkspace({
    workspaceId,
    month: currentMonthValue,
  });

  const handleMonthChange = (monthValue: string) => {
    const [year, month] = monthValue.split("-");
    setDates({ selectedYear: year, selectedMonth: month });
  };

  const onNewQuoteClick = () => {
    router.push(`/workspaces/${workspaceId}/quotes/new`);
  };

  return (
    <>
      <main className="w-full h-full flex-1 flex flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">Lista de Cotizaciones</h1>
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={onNewQuoteClick}
                className="cursor-pointer"
              >
                <RiAddCircleFill />
                Nueva Cotización
              </Button>
            </div>
          </div>
        </header>
        <QuoteDataTable
          columns={columns}
          data={quotes || []}
          onMonthChange={handleMonthChange}
          currentMonthValue={currentMonthValue}
          isLoadingQuotes={isLoadingQuotes}
        />
      </main>
    </>
  );
};

export default QuotePage;
