import type { Id } from "@/convex/_generated/dataModel";

export type ContractDataType = {
  contractor: string;
  contractorId: string;
  contractee: string;
  contracteeId: string;
  contractType: string;
  contractValue: number;
  contractStart: Date;
  contractEnd: Date;
  agreement: string;
};

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted";

export type QuoteType = "bidBond" | "performanceBonds";

export type QuoteSearchField = "contractor" | "contractee";

export interface QuoteBondValues {
  name: string;
  startDate: number;
  endDate: number;
  expiryDate?: number;
  percentage: number;
  insuredValue: number;
  rate: number;
  bondId?: Id<"bonds">;
}

export interface QuoteFormValues {
  quoteType: QuoteType;
  contractor: string;
  contractorId: string;
  contractee: string;
  contracteeId: string;
  contractType: string;
  contractValue: number;
  contractStart: number;
  contractEnd: number;
  expenses: number;
  agreement: string;
  calculateExpensesTaxes: boolean;
  documentId?: Id<"_storage">;
  clientId?: Id<"clients">;
  notes?: string;
  quoteNumber?: string;
  quoteBonds: QuoteBondValues[];
}

export type QuoteCompletionStepId =
  | "tipo"
  | "cliente"
  | "partes"
  | "contrato"
  | "amparos";

export interface QuoteCompletionStep {
  id: QuoteCompletionStepId;
  label: string;
  done: boolean;
  optional?: boolean;
}

export type QuotePeriodMode = "month" | "range" | "all";

export interface QuoteAdvancedFilterState {
  periodMode: QuotePeriodMode;
  /** YYYY-MM, valid when periodMode === "month". */
  month?: string;
  /** Inclusive. ms epoch. */
  rangeFrom?: number;
  /** Exclusive. ms epoch. */
  rangeTo?: number;
  clientId?: Id<"clients">;
  quoteType?: QuoteType;
}

export interface QuoteSummary {
  total: number;
  totalContractValue: number;
  byStatus: Record<QuoteStatus, number>;
  convertedCount: number;
  conversionRate: number;
}
