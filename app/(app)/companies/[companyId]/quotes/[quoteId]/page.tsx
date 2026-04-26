"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/aegis/hint";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetQuoteById } from "@/packages/quotes/api";
import { useQuoteId } from "@/packages/quotes/store/use-quote-id";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { QuoteForm } from "@/packages/quotes/components/quote-form";
import { QuoteActionsBar } from "@/packages/quotes/components/quote-actions-bar";
import { QuoteStatusBadge } from "@/packages/quotes/components/quote-status-badge";
import { QuoteConvertModal } from "@/packages/quotes/components/modals/quote-convert-modal";

const QuoteIdPage = () => {
  const router = useRouter();
  const quoteId = useQuoteId();
  const companyId = useCompanyId();
  const [convertOpen, setConvertOpen] = useState(false);

  const { data: quote, isLoading } = useGetQuoteById({ id: quoteId });

  const onBack = () => router.push(`/companies/${companyId}/quotes`);
  const onAfterRemove = () => onBack();

  if (isLoading || !quote) {
    return (
      <main className="flex h-full w-full flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">Cotización</h1>
          </div>
        </header>
        <div className="grid gap-4 px-4 py-4 lg:grid-cols-3 lg:px-6">
          <div className="space-y-4 lg:col-span-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/40 bg-card/60 p-4"
              >
                <Skeleton className="mb-3 h-4 w-32" />
                <Skeleton className="mb-2 h-9 w-full" />
                <Skeleton className="h-9 w-2/3" />
              </div>
            ))}
          </div>
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-border/40 bg-card/60 p-4">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="mb-2 h-6 w-full" />
              <Skeleton className="mb-2 h-6 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </aside>
        </div>
      </main>
    );
  }

  const status = quote.status ?? "draft";
  const readOnly = status === "converted";

  return (
    <main className="flex h-full w-full flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-base font-medium">
              {quote.quoteNumber ?? "Cotización"}
            </h1>
            <QuoteStatusBadge status={status} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {quote.documentUrl && (
              <Hint label="Ver documento de referencia" align="end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(quote.documentUrl as string, "_blank")
                  }
                >
                  <FileText />
                  Documento
                </Button>
              </Hint>
            )}
            <Hint label="Volver a Cotizaciones" align="end">
              <Button size="sm" variant="outline" onClick={onBack}>
                <ArrowLeft />
                Volver
              </Button>
            </Hint>
          </div>
        </div>
      </header>

      <div className="px-4 pt-3 lg:px-6">
        <QuoteActionsBar
          quote={quote}
          onAfterRemove={onAfterRemove}
          onConvertToPolicy={() => setConvertOpen(true)}
        />
      </div>

      <QuoteForm mode="edit" initial={quote} readOnly={readOnly} />

      <QuoteConvertModal
        open={convertOpen}
        onOpenChange={setConvertOpen}
        quote={quote}
      />
    </main>
  );
};

export default QuoteIdPage;
