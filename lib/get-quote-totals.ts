const VAT_RATE = 0.19;
const DAYS_IN_YEAR = 365;

export function getQuoteTotals(
  insuredValue: number,
  rate: number,
  days: number,
) {
  const rateAsDecimal = rate / 100;
  const premium =
    Math.round(((insuredValue * rateAsDecimal) / DAYS_IN_YEAR) * days * 100) /
    100;
  const vat = Math.round(premium * VAT_RATE * 100) / 100;
  const total = Math.round((premium + vat) * 100) / 100;

  return { premium, vat, total };
}
