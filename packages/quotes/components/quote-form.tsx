"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  CircleCheck,
  FileText,
  Save,
  Send,
  Sparkles,
  User,
  Wand2,
} from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/components/hooks/use-confirm";
import { useDebouncedEffect } from "@/components/hooks/use-debounced-effect";
import { getErrorMessage } from "@/lib/get-error-message";
import { getBondTotals } from "@/lib/get-bond-totals";
import { getQuoteTotals } from "@/lib/get-quote-totals";
import { cn } from "@/lib/utils";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { BondDataType } from "@/packages/bonds/types";
import { useCreateQuote, useUpdateQuote } from "../api";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import type {
  ContractDataType,
  QuoteCompletionStepId,
  QuoteFormValues,
  QuoteType,
} from "../types";
import {
  computeCompletionSteps,
  isQuoteReadyToSend,
} from "../lib/quote-completion";
import ResultsCard from "./results-card";
import { QuoteTypeToggle } from "./quote-type-toggle";
import { ClientLinkPicker } from "./client-link-picker";
import { QuoteProgressStepper } from "./quote-progress-stepper";
import { SavedIndicator } from "./saved-indicator";
import { PartiesSection } from "./form-sections/parties-section";
import { ContractSection } from "./form-sections/contract-section";
import { BondsSection } from "./form-sections/bonds-section";

type QuoteDoc = Doc<"quotes"> & {
  quoteBonds: Array<Doc<"quoteBonds">>;
};

interface QuoteFormProps {
  mode: "create" | "edit";
  initial?: QuoteDoc;
  /** When true, all inputs are disabled (e.g., status === "converted"). */
  readOnly?: boolean;
  /** Optional document file to upload on first save (create mode). */
  documentFile?: File | null;
  setDocumentFile?: (file: File | null) => void;
  /** Override redirect target after create. Defaults to detail page. */
  onCreated?: (id: Id<"quotes">) => void;
  /** Footer slot for actions bar in edit mode. */
  footerExtras?: React.ReactNode;
  /** Header right-side slot (AI / PDF / etc.). */
  headerExtras?: React.ReactNode;
}

const DEFAULT_BID_BOND: BondDataType = {
  name: "Seriedad de la oferta",
  startDate: new Date(),
  endDate: new Date(),
  expiryDate: undefined,
  percentage: 0,
  insuredValue: 0,
  rate: 0,
};

const DEFAULT_CONTRACT: ContractDataType = {
  contractor: "",
  contractorId: "",
  contractee: "",
  contracteeId: "",
  contractType: "",
  agreement: "",
  contractValue: 0,
  contractStart: new Date(),
  contractEnd: new Date(),
};

function quoteToContract(q: QuoteDoc): ContractDataType {
  return {
    contractor: q.contractor,
    contractorId: q.contractorId,
    contractee: q.contractee,
    contracteeId: q.contracteeId,
    contractType: q.contractType,
    agreement: q.agreement,
    contractValue: q.contractValue,
    contractStart: new Date(q.contractStart),
    contractEnd: new Date(q.contractEnd),
  };
}

function quoteToBidBond(q: QuoteDoc): BondDataType {
  const b = q.quoteBonds[0];
  if (!b) return DEFAULT_BID_BOND;
  return {
    name: b.name,
    startDate: new Date(b.startDate),
    endDate: new Date(b.endDate),
    expiryDate: b.expiryDate ? new Date(b.expiryDate) : undefined,
    percentage: b.percentage,
    insuredValue: b.insuredValue,
    rate: b.rate,
  };
}

function quoteToPerformanceBonds(q: QuoteDoc): BondDataType[] {
  return q.quoteBonds.map((b) => ({
    id: b.bondId,
    name: b.name,
    startDate: new Date(b.startDate),
    endDate: new Date(b.endDate),
    percentage: b.percentage,
    insuredValue: b.insuredValue,
    rate: b.rate,
  }));
}

/**
 * Comfortable form único para crear/editar cotizaciones. Layout 2/3 + 1/3 con
 * sticky results, stepper en el header y footer sticky con acciones.
 */
export function QuoteForm({
  mode,
  initial,
  readOnly,
  documentFile,
  onCreated,
  footerExtras,
  headerExtras,
}: QuoteFormProps) {
  const router = useRouter();
  const companyId = useCompanyId();

  const [quoteType, setQuoteType] = useState<QuoteType>(
    initial?.quoteType ?? "bidBond",
  );
  const [contract, setContract] = useState<ContractDataType>(() =>
    initial ? quoteToContract(initial) : DEFAULT_CONTRACT,
  );
  const [bidBond, setBidBond] = useState<BondDataType>(() =>
    initial && initial.quoteType === "bidBond"
      ? quoteToBidBond(initial)
      : DEFAULT_BID_BOND,
  );
  const [performanceBonds, setPerformanceBonds] = useState<BondDataType[]>(
    () =>
      initial && initial.quoteType === "performanceBonds"
        ? quoteToPerformanceBonds(initial)
        : [],
  );
  const [expenses, setExpenses] = useState<number>(initial?.expenses ?? 0);
  const [calculateExpensesTaxes, setCalculateExpensesTaxes] =
    useState<boolean>(initial?.calculateExpensesTaxes ?? false);
  const [clientId, setClientId] = useState<Id<"clients"> | undefined>(
    initial?.clientId ?? undefined,
  );
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [activeStep, setActiveStep] = useState<QuoteCompletionStepId>("tipo");

  // Autosave state
  const [autosaveQuoteId, setAutosaveQuoteId] = useState<
    Id<"quotes"> | undefined
  >(initial?._id);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(
    initial?._creationTime ?? null,
  );
  const promotingRef = useRef(false);
  const currentStatus = initial?.status ?? "draft";

  const { mutate: createQuote, isPending: isCreating } = useCreateQuote();
  const { mutate: updateQuote, isPending: isUpdating } = useUpdateQuote();

  // Type change confirmation
  const hasUnsavedData =
    contract.contractor.trim().length > 0 ||
    contract.contractee.trim().length > 0 ||
    contract.contractValue > 0 ||
    bidBond.percentage > 0 ||
    performanceBonds.length > 0;

  // Compute totals
  const totals = useMemo(() => {
    if (quoteType === "bidBond") {
      const days = Math.max(
        differenceInCalendarDays(bidBond.endDate, bidBond.startDate),
        0,
      );
      return getBondTotals(bidBond.insuredValue, bidBond.rate, days);
    }
    return getQuoteTotals(
      performanceBonds.map((b) => ({
        insuredValue: b.insuredValue,
        rate: b.rate,
        days: Math.max(
          differenceInCalendarDays(b.endDate, b.startDate),
          0,
        ),
      })),
    );
  }, [quoteType, bidBond, performanceBonds]);

  const breakdown = useMemo(() => {
    if (quoteType === "bidBond") return undefined;
    return performanceBonds.map((b) => ({
      name: b.name,
      premium: getBondTotals(
        b.insuredValue,
        b.rate,
        Math.max(differenceInCalendarDays(b.endDate, b.startDate), 0),
      ).premium,
    }));
  }, [quoteType, performanceBonds]);

  // Completion steps
  const formValues: Partial<QuoteFormValues> = useMemo(
    () => ({
      quoteType,
      contractor: contract.contractor,
      contractorId: contract.contractorId,
      contractee: contract.contractee,
      contracteeId: contract.contracteeId,
      contractType: contract.contractType,
      contractValue: contract.contractValue,
      contractStart: contract.contractStart.getTime(),
      contractEnd: contract.contractEnd.getTime(),
      clientId,
      quoteBonds:
        quoteType === "bidBond"
          ? [
              {
                name: bidBond.name,
                startDate: bidBond.startDate.getTime(),
                endDate: bidBond.endDate.getTime(),
                percentage: bidBond.percentage,
                insuredValue: bidBond.insuredValue,
                rate: bidBond.rate,
              },
            ]
          : performanceBonds.map((b) => ({
              name: b.name,
              startDate: b.startDate.getTime(),
              endDate: b.endDate.getTime(),
              percentage: b.percentage,
              insuredValue: b.insuredValue,
              rate: b.rate,
              bondId: b.id,
            })),
    }),
    [quoteType, contract, bidBond, performanceBonds, clientId],
  );
  const steps = useMemo(() => computeCompletionSteps(formValues), [formValues]);
  const ready = isQuoteReadyToSend(formValues);

  // Section refs for scroll-on-step-click
  const refs: Record<QuoteCompletionStepId, React.RefObject<HTMLElement>> = {
    tipo: useRef<HTMLElement>(null!),
    cliente: useRef<HTMLElement>(null!),
    partes: useRef<HTMLElement>(null!),
    contrato: useRef<HTMLElement>(null!),
    amparos: useRef<HTMLElement>(null!),
  };

  const handleStepClick = (id: QuoteCompletionStepId) => {
    setActiveStep(id);
    refs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Build payload for create/update
  const buildPayload = () => {
    const baseBonds =
      quoteType === "bidBond"
        ? [
            {
              name: bidBond.name,
              startDate: bidBond.startDate.getTime(),
              endDate: bidBond.endDate.getTime(),
              expiryDate: bidBond.expiryDate?.getTime(),
              percentage: bidBond.percentage,
              insuredValue: bidBond.insuredValue,
              rate: bidBond.rate,
            },
          ]
        : performanceBonds.map((b) => ({
            name: b.name,
            startDate: b.startDate.getTime(),
            endDate: b.endDate.getTime(),
            percentage: b.percentage,
            insuredValue: b.insuredValue,
            rate: b.rate,
            bondId: b.id,
          }));

    return {
      quoteType,
      quoteBonds: baseBonds,
      expenses,
      calculateExpensesTaxes,
      contractor: contract.contractor,
      contractorId: contract.contractorId,
      contractee: contract.contractee,
      contracteeId: contract.contracteeId,
      contractType: contract.contractType,
      contractValue: contract.contractValue,
      contractStart: contract.contractStart.getTime(),
      contractEnd: contract.contractEnd.getTime(),
      agreement: contract.agreement,
      clientId,
      notes: notes.trim() || undefined,
    };
  };

  const validate = (): string | null => {
    if (
      differenceInCalendarDays(contract.contractEnd, contract.contractStart) <=
      0
    ) {
      return "La fecha de inicio debe ser anterior a la de fin del contrato.";
    }
    if (
      !contract.contractor.trim() ||
      !contract.contractee.trim() ||
      contract.contractValue <= 0
    ) {
      return "Completa los datos de partes y contrato.";
    }
    if (quoteType === "bidBond") {
      if (
        bidBond.percentage <= 0 ||
        bidBond.insuredValue <= 0 ||
        bidBond.rate <= 0
      ) {
        return "Completa los datos del amparo.";
      }
    } else {
      if (performanceBonds.length === 0) {
        return "Agrega al menos un amparo de cumplimiento.";
      }
      if (
        performanceBonds.some(
          (b) => b.percentage <= 0 || b.insuredValue <= 0 || b.rate <= 0,
        )
      ) {
        return "Completa los datos de todos los amparos.";
      }
    }
    return null;
  };

  const submitCreate = (status: "draft" | "sent") => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    createQuote(
      { ...buildPayload(), companyId, status },
      {
        onSuccess: (id) => {
          const newId = id as Id<"quotes">;
          setAutosaveQuoteId(newId);
          setLastSavedAt(Date.now());
          toast.success(
            status === "draft"
              ? "Borrador guardado"
              : "Cotización creada",
          );
          if (onCreated) {
            onCreated(newId);
          } else {
            router.push(`/companies/${companyId}/quotes/${id}`);
          }
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const submitUpdate = () => {
    if (!initial) return;
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    updateQuote(
      { id: initial._id, ...buildPayload() },
      {
        onSuccess: () => {
          setLastSavedAt(Date.now());
          toast.success("Cotización actualizada");
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  // Silent autosave: promote new draft on first significant change
  const hasMinimalAutosaveData =
    contract.contractor.trim().length > 0 ||
    contract.contractee.trim().length > 0 ||
    contract.contractValue > 0;

  useEffect(() => {
    if (mode !== "create") return;
    if (readOnly) return;
    if (autosaveQuoteId) return;
    if (promotingRef.current) return;
    if (!hasMinimalAutosaveData) return;
    promotingRef.current = true;
    createQuote(
      { ...buildPayload(), companyId, status: "draft" },
      {
        onSuccess: (id) => {
          const newId = id as Id<"quotes">;
          setAutosaveQuoteId(newId);
          setLastSavedAt(Date.now());
          // Silent URL replace so user doesn't see a navigation but next
          // saves are debounced updates instead of creates.
          if (onCreated) {
            onCreated(newId);
          } else {
            router.replace(`/companies/${companyId}/quotes/${newId}`);
          }
        },
        onError: (e) => {
          promotingRef.current = false;
          toast.error(getErrorMessage(e));
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMinimalAutosaveData, autosaveQuoteId, mode, readOnly]);

  // Silent autosave: debounced updates while status === "draft"
  useDebouncedEffect(
    formValues,
    1500,
    () => {
      if (!autosaveQuoteId) return;
      if (currentStatus !== "draft") return;
      if (validate()) return;
      updateQuote(
        { id: autosaveQuoteId, ...buildPayload() },
        {
          onSuccess: () => setLastSavedAt(Date.now()),
          onError: () => {
            // Stay silent; user can still hit "Guardar".
          },
        },
      );
    },
    !readOnly && Boolean(autosaveQuoteId) && currentStatus === "draft",
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (readOnly) return;
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        if (mode === "create") submitCreate("draft");
        else submitUpdate();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (mode === "create" && ready) submitCreate("sent");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, readOnly, ready, formValues]);

  const isPending = isCreating || isUpdating;

  return (
    <div className="flex flex-1 flex-col">
      {/* Stepper header */}
      <div className="sticky top-12 z-10 flex flex-wrap items-center justify-between gap-3 border-b bg-background/80 px-4 py-2 backdrop-blur lg:px-6">
        <QuoteProgressStepper
          steps={steps}
          activeId={activeStep}
          onStepClick={handleStepClick}
          className="flex-1"
        />
        <div className="flex items-center gap-3">
          <SavedIndicator lastSavedAt={lastSavedAt} saving={isPending} />
          {headerExtras && (
            <div className="flex items-center gap-2">{headerExtras}</div>
          )}
        </div>
      </div>

      <div className="grid flex-1 gap-4 px-4 py-4 lg:grid-cols-3 lg:px-6">
        <div className="space-y-4 lg:col-span-2">
          <Section
            id="tipo"
            title="Tipo de cotización"
            number={1}
            sectionRef={refs.tipo}
          >
            <QuoteTypeToggle
              value={quoteType}
              onChange={setQuoteType}
              hasUnsavedData={hasUnsavedData}
              disabled={readOnly}
            />
          </Section>

          <Section
            id="cliente"
            title="Cliente (opcional)"
            number={2}
            optional
            sectionRef={refs.cliente}
          >
            <ClientLinkPicker
              value={clientId}
              onChange={setClientId}
              readOnly={readOnly}
            />
          </Section>

          <Section
            id="partes"
            title="Partes"
            number={3}
            sectionRef={refs.partes}
          >
            <PartiesSection
              value={contract}
              onChange={setContract}
              clientLinked={Boolean(clientId)}
              readOnly={readOnly}
            />
          </Section>

          <Section
            id="contrato"
            title="Contrato"
            number={4}
            sectionRef={refs.contrato}
          >
            <ContractSection
              value={contract}
              onChange={setContract}
              readOnly={readOnly}
            />
          </Section>

          <Section
            id="amparos"
            title="Amparos"
            number={5}
            sectionRef={refs.amparos}
          >
            <BondsSection
              quoteType={quoteType}
              companyId={companyId}
              contractData={contract}
              bidBond={bidBond}
              performanceBonds={performanceBonds}
              onBidBondChange={setBidBond}
              onPerformanceBondsChange={setPerformanceBonds}
              readOnly={readOnly}
            />
          </Section>

          <div className="rounded-xl border border-border/40 bg-card/80 p-4">
            <Label htmlFor="quote-notes" className="text-xs">
              NOTAS INTERNAS
            </Label>
            <Textarea
              id="quote-notes"
              placeholder="Comentarios visibles solo dentro del equipo..."
              value={notes}
              readOnly={readOnly}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 min-h-16 resize-y"
            />
          </div>
        </div>

        <aside className="space-y-3 lg:col-span-1">
          <ResultsCard
            sticky
            premium={totals.premium}
            vat={totals.vat}
            total={totals.total}
            breakdown={breakdown}
            expenses={expenses}
            setExpenses={setExpenses}
            calculateExpensesTaxes={calculateExpensesTaxes}
            setCalculateExpensesTaxes={setCalculateExpensesTaxes}
            readOnly={readOnly}
          />
        </aside>
      </div>

      {/* Sticky footer */}
      {!readOnly && (
        <footer className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-2 border-t bg-background/90 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleCheck
              className={cn(
                "size-4",
                ready ? "text-emerald-500" : "text-muted-foreground/40",
              )}
            />
            <span>
              {ready
                ? "Listo para enviar"
                : `Completa ${steps.filter((s) => !s.done && !s.optional).length} sección(es)`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {footerExtras}
            {mode === "create" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => submitCreate("draft")}
                >
                  <Save />
                  Guardar borrador
                </Button>
                <Button
                  type="button"
                  disabled={isPending || !ready}
                  onClick={() => submitCreate("sent")}
                >
                  <Send />
                  Cotizar
                </Button>
              </>
            ) : (
              <Button
                type="button"
                disabled={isPending}
                onClick={submitUpdate}
              >
                <Save />
                Guardar cambios
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

interface SectionProps {
  id: string;
  title: string;
  number: number;
  optional?: boolean;
  sectionRef?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}

function Section({
  id,
  title,
  number,
  optional,
  sectionRef,
  children,
}: SectionProps) {
  return (
    <section
      id={`section-${id}`}
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="rounded-xl border border-border/40 bg-card/60 p-4"
    >
      <header className="mb-3 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-aegis-sapphire/10 text-[11px] font-semibold text-aegis-sapphire">
          {number}
        </span>
        <h2 className="text-sm font-semibold tracking-tight">
          {title}
          {optional && (
            <span className="ml-2 text-[10px] font-normal text-muted-foreground">
              opcional
            </span>
          )}
        </h2>
      </header>
      {children}
    </section>
  );
}
