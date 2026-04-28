"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { QuoteForm } from "@/packages/quotes/components/quote-form";

const NewQuotePage = () => {
  return (
    <main className="flex h-svh w-full flex-col overflow-hidden md:h-[calc(100svh-1rem)]">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Nueva cotización</h1>
        </div>
      </header>
      <QuoteForm mode="create" />
    </main>
  );
};

export default NewQuotePage;
