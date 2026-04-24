import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRemoveQuote } from "../../api";
import { useRouter } from "next/navigation";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useConfirm } from "@/components/hooks/use-confirm";
import {
  X,
  Eye,
  FileText,
} from "lucide-react";

interface QuoteActionsProps {
  id: Id<"quotes">;
  quote: Doc<"quotes"> & { documentUrl: string | null };
  children?: React.ReactNode;
}

export const QuoteActions = ({ id, quote, children }: QuoteActionsProps) => {
  const router = useRouter();

  const { mutate: removeQuote, isPending: isRemovingQuote } = useRemoveQuote();

  const [ConfirmDialog, confirm] = useConfirm({
    title: "Eliminar Cotización",
    message: "¿Estás seguro que deseas eliminar esta Cotización?",
  });

  const handleRemoveTask = async () => {
    const ok = await confirm();
    if (!ok) return;

    removeQuote(
      { id },
      {
        onSuccess() {
          toast.success("Cotización eliminada correctamente");
        },
        onError() {
          toast.error("Ocurrió un error al eliminar la cotización");
        },
      },
    );
  };

  const onOpenQuote = () => {
    router.push(`/companies/${quote.companyId}/quotes/${id}`);
  };

  return (
    <div className="flex justify-end">
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 space-y-1" align="end">
          <DropdownMenuItem onClick={onOpenQuote} className="cursor-pointer">
            Ver Cotización
            <Eye className="size-4 ml-auto" />
          </DropdownMenuItem>
          {quote.documentUrl && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => window.open(quote.documentUrl!, "_blank")}
                className="cursor-pointer"
              >
                Ver Documento
                <FileText className="size-4 ml-auto" />
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isRemovingQuote}
            onClick={handleRemoveTask}
            className="cursor-pointer"
          >
            Eliminar Cotización
            <X className="size-4 ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
