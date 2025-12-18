import { Id } from "@/convex/_generated/dataModel";
import { BondDataType } from "@/packages/bonds/types";
import { ContractDataType } from "@/packages/quotes/types";

type AgentBond = {
  id?: unknown;
  name?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  percentage?: unknown;
  rate?: unknown;
};

type AgentPayload = {
  contractData?: {
    contractor?: unknown;
    contractorId?: unknown;
    contractee?: unknown;
    contracteeId?: unknown;
    contractType?: unknown;
    contractValue?: unknown;
    contractStart?: unknown;
    contractEnd?: unknown;
  };
  bonds?: unknown;
};

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const isNumber = (v: unknown): v is number =>
  typeof v === "number" && !Number.isNaN(v);

const isPositiveNumber = (v: unknown): v is number => isNumber(v) && v > 0;

const toValidDate = (v: unknown): Date | null => {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isConvexId = (v: unknown): v is Id<"bonds"> =>
  typeof v === "string" && v.trim().length > 0;

export const string2Object = (
  str: string,
  quoteType: "bidBond" | "performanceBonds",
) => {
  let parsed: AgentPayload;

  try {
    parsed = JSON.parse(str);
  } catch {
    return {
      contractData: {
        contractor: "",
        contractorId: "",
        contractee: "",
        contracteeId: "",
        contractType: "",
        contractValue: 0,
        contractStart: new Date(),
        contractEnd: new Date(),
      },
      performanceBondsData: [],
    };
  }

  const data: {
    contractData: ContractDataType;
    performanceBondsData: BondDataType[];
  } = {
    contractData: {
      contractor: "",
      contractorId: "",
      contractee: "",
      contracteeId: "",
      contractType: "",
      contractValue: 0,
      contractStart: new Date(),
      contractEnd: new Date(),
    },
    performanceBondsData: [],
  };

  const c = parsed.contractData;

  if (c) {
    if (isNonEmptyString(c.contractor))
      data.contractData.contractor = c.contractor;

    if (isNonEmptyString(c.contractorId))
      data.contractData.contractorId = c.contractorId;

    if (isNonEmptyString(c.contractee))
      data.contractData.contractee = c.contractee;

    if (isNonEmptyString(c.contracteeId))
      data.contractData.contracteeId = c.contracteeId;

    if (isNonEmptyString(c.contractType))
      data.contractData.contractType = c.contractType;

    if (isPositiveNumber(c.contractValue))
      data.contractData.contractValue = c.contractValue;

    const start = toValidDate(c.contractStart);
    if (start) data.contractData.contractStart = start;

    const end = toValidDate(c.contractEnd);
    if (end) data.contractData.contractEnd = end;
  }

  if (quoteType === "performanceBonds" && Array.isArray(parsed.bonds)) {
    parsed.bonds.forEach((rawBond) => {
      const bond = rawBond as AgentBond;

      if (!isNonEmptyString(bond.id)) return;
      if (!isConvexId(bond.id)) return;

      const percentage = isPositiveNumber(bond.percentage)
        ? bond.percentage
        : 0;

      const insuredValue =
        data.contractData.contractValue > 0
          ? data.contractData.contractValue * (percentage / 100)
          : 0;

      const perfBond: BondDataType = {
        id: bond.id,
        name: isNonEmptyString(bond.name) ? bond.name : "",
        startDate: toValidDate(bond.startDate) ?? new Date(),
        endDate: toValidDate(bond.endDate) ?? new Date(),
        percentage,
        insuredValue,
        rate: isPositiveNumber(bond.rate) ? bond.rate : 0,
      };

      data.performanceBondsData.push(perfBond);
    });
  }

  return data;
};
