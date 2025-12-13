export const formatTwoDecimals = (value: number | string) => {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
};

/**
 * Optional: truncate instead of round to 2 decimals.
 * Example: 10.129 -> 10.12 (not 10.13)
 */
export const truncateTwoDecimals = (value: number | string) => {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "0.00";
  const truncated = Math.trunc(num * 100) / 100;
  return truncated.toFixed(2);
};
