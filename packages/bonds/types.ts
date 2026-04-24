import type { Doc, Id } from "@/convex/_generated/dataModel";

/** Catalog row from the `bonds` table. */
export type BondDoc = Doc<"bonds">;

/** Legacy shape used inline by the quote flow (bid/performance bonds UI). */
export type BondDataType = {
  id?: Id<"bonds">;
  name: string;
  startDate: Date;
  endDate: Date;
  expiryDate?: Date;
  percentage: number;
  insuredValue: number;
  rate: number;
};
