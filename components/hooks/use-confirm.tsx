import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Info, OctagonAlert, TriangleAlert } from "lucide-react";
import { JSX, useState } from "react";

interface UseConfirmProps {
  title: string;
  message: string;
  type?: "info" | "warning" | "critical";
  cancelText?: string;
  confirmText?: string;
}

export const useConfirm = ({
  title,
  message,
  type = "info",
  cancelText = "Cancelar",
  confirmText = "Confirmar",
}: UseConfirmProps): [() => JSX.Element, () => Promise<boolean | null>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean | null) => void;
  } | null>(null);

  const confirm = () =>
    new Promise<boolean | null>((resolve, reject) => {
      setPromise({ resolve });
    });

  const handleClose = (resolved = false) => {
    if (promise && !resolved) {
      promise.resolve(null);
    }
    setPromise(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const handleCancel = () => {
    if (promise) {
      promise.resolve(false);
    }
    handleClose(true);
  };

  const handleConfirm = () => {
    if (promise) {
      promise.resolve(true);
    }
    handleClose(true);
  };

  const ConfirmDialog = () => (
    <Dialog open={promise !== null} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="p-0 overflow-hidden gap-0 z-100">
        <DialogHeader className="p-4">
          <div className="flex items-start gap-3 pr-8">
            <div
              className={
                type === "critical"
                  ? "flex size-9 items-center justify-center rounded-lg border border-destructive/10 bg-destructive/10 text-destructive"
                  : type === "warning"
                    ? "flex size-9 items-center justify-center rounded-lg border border-aegis-amber/10 bg-aegis-amber/10 text-aegis-amber"
                    : "flex size-9 items-center justify-center rounded-lg border border-aegis-sapphire/10 bg-aegis-sapphire/10 text-aegis-sapphire"
              }
            >
              {type === "info" && <Info className="size-4 shrink-0" />}
              {type === "warning" && (
                <TriangleAlert className="size-4 shrink-0" />
              )}
              {type === "critical" && (
                <OctagonAlert className="size-4 shrink-0" />
              )}
            </div>
            <div className="space-y-1">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="text-muted-foreground/80">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Separator className="opacity-40" />
        <DialogFooter className="border-t border-border/40 p-4">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmDialog, confirm];
};
