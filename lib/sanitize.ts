export const sanitizeInteger = (raw: string) => {
  const digits = raw.replace(/[^0-9]/g, "");
  return digits === "" ? 0 : Number(digits);
};

export const sanitizeDecimal = (raw: string) => {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  const normalized =
    parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];
  if (normalized === "" || normalized === ".") return 0;
  return Number(normalized);
};
