import { Hint } from "@/components/aegis/hint";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Doc } from "@/convex/_generated/dataModel";
import { fullDate } from "@/lib/date-formats";
import { formatCop } from "@/lib/format-cop";

interface QuotePopoverProps {
  quote: Doc<"quotes">;
  children?: React.ReactNode;
}

export const QuotePopover = ({ quote, children }: QuotePopoverProps) => {
  const quoteType = quote.quoteType === "bidBond" ? "Seriedad" : "Cumplimiento";
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-2">
        <main className="grid grid-cols-2 gap-2 mt-2">
          <Hint label={quote.contractor}>
            <div className="grid w-full gap-1 border p-1.5 rounded-md bg-muted">
              <Label htmlFor="contractor" className="text-xs">
                CONTRATISTA
              </Label>
              <p className="font-medium text-sm line-clamp-1">
                {quote.contractor}
              </p>
            </div>
          </Hint>
          <Hint label={quote.contractorId}>
            <div className="grid w-full gap-1 border p-1.5 rounded-md bg-muted">
              <Label htmlFor="contractor-id" className="text-xs">
                NIT
              </Label>
              <p className="font-medium text-sm line-clamp-1">
                {quote.contractorId}
              </p>
            </div>
          </Hint>
          <Hint label={quote.contractee}>
            <div className="grid w-full gap-1 border p-1.5 rounded-md bg-muted">
              <Label htmlFor="contractee" className="text-xs">
                CONTRATANTE
              </Label>
              <p className="font-medium text-sm line-clamp-1">
                {quote.contractee}
              </p>
            </div>
          </Hint>
          <Hint label={quote.contracteeId}>
            <div className="grid w-full gap-1 border p-1.5 rounded-md bg-muted">
              <Label htmlFor="contractee-id" className="text-xs">
                NIT
              </Label>
              <p className="font-medium text-sm line-clamp-1">
                {quote.contracteeId}
              </p>
            </div>
          </Hint>
          <Hint label={quote.contractType}>
            <div className="grid w-full gap-1 border p-1.5 rounded-md bg-muted">
              <Label htmlFor="contract-type" className="text-xs">
                TIPO DE CONTRATO
              </Label>
              <p className="font-medium text-sm line-clamp-1">
                {quote.contractType}
              </p>
            </div>
          </Hint>
          <Hint label={quoteType}>
            <div className="grid w-full gap-1 border p-1.5 rounded-md bg-muted">
              <Label htmlFor="quote-type" className="text-xs">
                TIPO DE COTIZACIÓN
              </Label>
              <p className="font-medium text-sm line-clamp-1">{quoteType}</p>
            </div>
          </Hint>
          <Hint label={fullDate(new Date(quote.contractStart))}>
            <div className="grid w-full gap-1 border p-1.5 rounded-md bg-muted">
              <Label htmlFor="contract-start" className="text-xs">
                INICIO
              </Label>
              <p className="font-medium text-sm line-clamp-1">
                {fullDate(new Date(quote.contractStart))}
              </p>
            </div>
          </Hint>
          <Hint label={fullDate(new Date(quote.contractEnd))}>
            <div className="grid w-full gap-1 border p-1.5 rounded-md bg-muted">
              <Label htmlFor="contract-end" className="text-xs">
                FIN
              </Label>
              <p className="font-medium text-sm line-clamp-1">
                {fullDate(new Date(quote.contractEnd))}
              </p>
            </div>
          </Hint>
          <Hint label={formatCop(quote.contractValue)}>
            <div className="grid w-full gap-1 col-span-2 border p-1.5 rounded-md bg-muted">
              <Label htmlFor="contract-value" className="text-xs">
                VALOR DEL CONTRATO
              </Label>
              <p className="font-medium text-sm line-clamp-1">
                {formatCop(quote.contractValue)}
              </p>
            </div>
          </Hint>
        </main>
      </PopoverContent>
    </Popover>
  );
};
