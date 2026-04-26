import type {
  QuoteCompletionStep,
  QuoteCompletionStepId,
  QuoteFormValues,
} from "../types";

/**
 * Calcula el estado de completitud de cada sección del formulario. La sección
 * `cliente` es opcional (cotizaciones standalone son válidas).
 */
export function computeCompletionSteps(
  values: Partial<QuoteFormValues>,
): QuoteCompletionStep[] {
  const tipo = Boolean(values.quoteType);

  const cliente = Boolean(values.clientId);

  const partes = Boolean(
    values.contractor?.trim() &&
      values.contractorId?.trim() &&
      values.contractee?.trim() &&
      values.contracteeId?.trim(),
  );

  const contrato = Boolean(
    values.contractType?.trim() &&
      typeof values.contractValue === "number" &&
      values.contractValue > 0 &&
      typeof values.contractStart === "number" &&
      typeof values.contractEnd === "number" &&
      values.contractStart < values.contractEnd,
  );

  const amparos = Boolean(
    values.quoteBonds &&
      values.quoteBonds.length > 0 &&
      values.quoteBonds.every(
        (b) => b.percentage > 0 && b.insuredValue > 0 && b.rate > 0,
      ),
  );

  return [
    { id: "tipo", label: "Tipo", done: tipo },
    { id: "cliente", label: "Cliente", done: cliente, optional: true },
    { id: "partes", label: "Partes", done: partes },
    { id: "contrato", label: "Contrato", done: contrato },
    { id: "amparos", label: "Amparos", done: amparos },
  ];
}

export const isQuoteReadyToSend = (values: Partial<QuoteFormValues>) =>
  computeCompletionSteps(values).every((s) => s.done || s.optional);

export const QUOTE_STEP_LABEL: Record<QuoteCompletionStepId, string> = {
  tipo: "Tipo",
  cliente: "Cliente",
  partes: "Partes",
  contrato: "Contrato",
  amparos: "Amparos",
};
