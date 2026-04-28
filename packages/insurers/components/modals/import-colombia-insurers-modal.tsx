"use client";

import { DownloadCloud, Search } from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import {
  AegisModal,
  AegisModalContent,
  AegisModalFooter,
  AegisModalHeader,
  DialogClose,
} from "@/components/aegis/aegis-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";
import { useBulkCreateInsurers } from "../../api";
import { COLOMBIA_INSURERS } from "../../constants/colombia-insurers";
import type { InsurerDoc } from "../../types";

interface ImportColombiaInsurersModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  companyId: Id<"companies">;
  existing: InsurerDoc[] | undefined;
}

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function ImportColombiaInsurersModal({
  open,
  setOpen,
  companyId,
  existing,
}: ImportColombiaInsurersModalProps) {
  const { mutate: bulkCreate, isPending } = useBulkCreateInsurers();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const existingNames = useMemo(() => {
    const set = new Set<string>();
    for (const ins of existing ?? []) {
      set.add(ins.name.trim().toLowerCase());
    }
    return set;
  }, [existing]);

  const availableSeeds = useMemo(
    () =>
      COLOMBIA_INSURERS.filter(
        (s) => !existingNames.has(s.name.trim().toLowerCase()),
      ),
    [existingNames],
  );

  // Default selection: all available (non-duplicated) seeds, every time the modal opens.
  useEffect(() => {
    if (!open) return;
    setSelected(new Set(availableSeeds.map((s) => s.name)));
    setFilter("");
  }, [open, availableSeeds]);

  const filteredSeeds = useMemo(() => {
    const q = normalize(filter);
    if (!q) return COLOMBIA_INSURERS;
    return COLOMBIA_INSURERS.filter((s) => normalize(s.name).includes(q));
  }, [filter]);

  const filteredAvailable = useMemo(
    () =>
      filteredSeeds.filter(
        (s) => !existingNames.has(s.name.trim().toLowerCase()),
      ),
    [filteredSeeds, existingNames],
  );

  const allFilteredSelected =
    filteredAvailable.length > 0 &&
    filteredAvailable.every((s) => selected.has(s.name));

  const toggleOne = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const s of filteredAvailable) next.delete(s.name);
      } else {
        for (const s of filteredAvailable) next.add(s.name);
      }
      return next;
    });

  const selectedCount = selected.size;
  const totalAvailable = availableSeeds.length;

  const handleImport = async () => {
    if (selectedCount === 0) {
      toast.info("Selecciona al menos una aseguradora para importar.");
      return;
    }

    const toCreate = availableSeeds.filter((s) => selected.has(s.name));

    await bulkCreate(
      { companyId, insurers: toCreate },
      {
        onSuccess: (result) => {
          if (result.created > 0) {
            toast.success(
              `Se importaron ${result.created} aseguradoras${
                result.skipped > 0
                  ? ` (${result.skipped} omitidas por duplicado)`
                  : ""
              }.`,
            );
          } else {
            toast.info("No se importó ninguna aseguradora nueva.");
          }
          setOpen(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <AegisModal open={open} onOpenChange={setOpen} maxWidth="sm:max-w-2xl">
      <AegisModalHeader
        icon={DownloadCloud}
        title="Importar aseguradoras de Colombia"
        description="Selecciona del catálogo oficial autorizado por la Superintendencia Financiera. Las que ya existen en tu agencia se omiten automáticamente."
      />
      <AegisModalContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-aegis-sapphire/20 bg-aegis-sapphire/5 p-3">
              <p className="text-xs font-medium text-muted-foreground/70">
                Seleccionadas
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold leading-none text-aegis-sapphire">
                {selectedCount}
                <span className="ml-1 text-sm text-muted-foreground/70">
                  / {totalAvailable}
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground/70">
                Ya en tu catálogo
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold leading-none text-aegis-steel">
                {COLOMBIA_INSURERS.length - totalAvailable}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-aegis-steel" />
              <Input
                placeholder="Buscar por nombre"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleAllVisible}
              disabled={filteredAvailable.length === 0}
              className="shrink-0 border-border/40 hover:border-aegis-sapphire/30 hover:bg-aegis-sapphire/5 transition-colors"
            >
              {allFilteredSelected ? "Deseleccionar todo" : "Seleccionar todo"}
            </Button>
          </div>

          <div className="rounded-lg border border-border/40 bg-card/90">
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground/70">
                Mostrando {filteredSeeds.length} de {COLOMBIA_INSURERS.length}
              </p>
              <p className="text-xs text-muted-foreground/70">
                Fuente: Fasecolda
              </p>
            </div>
            {filteredSeeds.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
                <p className="text-sm text-aegis-graphite">Sin resultados</p>
                <p className="max-w-xs text-xs text-muted-foreground/80">
                  Prueba con otro término o limpia el buscador.
                </p>
              </div>
            ) : (
              <ul className="max-h-72 divide-y divide-border/40 overflow-y-auto">
                {filteredSeeds.map((seed) => {
                  const isDup = existingNames.has(
                    seed.name.trim().toLowerCase(),
                  );
                  const isChecked = selected.has(seed.name);
                  const checkboxId = `seed-${seed.name}`;
                  return (
                    <li
                      key={seed.name}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={isDup ? false : isChecked}
                        disabled={isDup}
                        onCheckedChange={() => toggleOne(seed.name)}
                      />
                      <label
                        htmlFor={checkboxId}
                        className={`flex min-w-0 flex-1 flex-col ${
                          isDup ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <span className="truncate text-sm text-aegis-graphite">
                          {seed.name}
                        </span>
                        {seed.taxId && (
                          <span className="truncate font-mono text-xs text-muted-foreground/80">
                            NIT {seed.taxId}
                          </span>
                        )}
                      </label>
                      {isDup ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-border/40 text-xs text-muted-foreground"
                        >
                          Existente
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-aegis-sapphire/30 bg-aegis-sapphire/5 text-xs text-aegis-sapphire"
                        >
                          Nueva
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="text-xs text-muted-foreground/80">
            Algunos campos están marcados como <em>por confirmar</em> en las
            fuentes públicas. Después de importar, edita cada aseguradora para
            completar correo, teléfono o NIT específicos de tu operación.
          </p>
        </div>
      </AegisModalContent>
      <AegisModalFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="button"
          onClick={handleImport}
          disabled={isPending || selectedCount === 0}
        >
          {selectedCount === 0
            ? "Selecciona aseguradoras"
            : `Importar ${selectedCount} ${
                selectedCount === 1 ? "aseguradora" : "aseguradoras"
              }`}
        </Button>
      </AegisModalFooter>
    </AegisModal>
  );
}
