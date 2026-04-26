/**
 * Reglas de duración por defecto de amparos por nombre canónico.
 *
 * `extraMonths`: meses añadidos a `contractEnd` para calcular la fecha fin del
 * amparo. `0` significa que termina junto con el contrato.
 *
 * `extraMonthsAfterDelivery`: aplica solo cuando hay fecha de entrega/aceptación
 * separada del fin del contrato; lo dejamos como hint informativo, no se usa
 * automáticamente al calcular fechas.
 */
export interface BondPeriodDefault {
  /** Identificador canónico (snake_case sin acentos). */
  key: string;
  /** Etiqueta humana mostrada en el chip "+N meses". */
  label: string;
  /** Meses extra después de `contractEnd`. */
  extraMonths: number;
}

const PERIOD_DEFAULTS: Record<string, BondPeriodDefault> = {
  seriedad_oferta: {
    key: "seriedad_oferta",
    label: "Igual al contrato",
    extraMonths: 0,
  },
  buen_manejo_anticipo: {
    key: "buen_manejo_anticipo",
    label: "+0 meses",
    extraMonths: 0,
  },
  cumplimiento: {
    key: "cumplimiento",
    label: "+12 meses",
    extraMonths: 12,
  },
  pago_salarios: {
    key: "pago_salarios",
    label: "+36 meses",
    extraMonths: 36,
  },
  calidad_servicio: {
    key: "calidad_servicio",
    label: "+12 meses",
    extraMonths: 12,
  },
  calidad_correcto_funcionamiento: {
    key: "calidad_correcto_funcionamiento",
    label: "+12 meses",
    extraMonths: 12,
  },
  estabilidad_obra: {
    key: "estabilidad_obra",
    label: "+60 meses",
    extraMonths: 60,
  },
  responsabilidad_civil_extracontractual: {
    key: "responsabilidad_civil_extracontractual",
    label: "Igual al contrato",
    extraMonths: 0,
  },
};

const ALIASES: Array<{ patterns: RegExp[]; key: string }> = [
  {
    patterns: [/seriedad/, /seriousness/],
    key: "seriedad_oferta",
  },
  {
    patterns: [/buen.*manejo/, /anticipo/],
    key: "buen_manejo_anticipo",
  },
  {
    patterns: [/^cumplimiento$/, /cumplimiento.*contrato/],
    key: "cumplimiento",
  },
  {
    patterns: [/salario/, /prestacion/],
    key: "pago_salarios",
  },
  {
    patterns: [/calidad.*servicio/],
    key: "calidad_servicio",
  },
  {
    patterns: [/calidad.*funcionamiento/, /correcto.*funcionamiento/],
    key: "calidad_correcto_funcionamiento",
  },
  {
    patterns: [/estabilidad.*obra/, /estabilidad/],
    key: "estabilidad_obra",
  },
  {
    patterns: [/responsabilidad.*civil/, /\brce\b/],
    key: "responsabilidad_civil_extracontractual",
  },
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export function matchBondName(name: string): string | null {
  const n = normalize(name);
  for (const a of ALIASES) {
    if (a.patterns.some((p) => p.test(n))) return a.key;
  }
  return null;
}

export function getBondPeriodDefault(
  name: string,
): BondPeriodDefault | null {
  const key = matchBondName(name);
  if (!key) return null;
  return PERIOD_DEFAULTS[key] ?? null;
}

/**
 * Calcula `endDate` por defecto a partir de `contractEnd` y los meses extra
 * sugeridos para el nombre del amparo.
 */
export function suggestBondEndDate(
  bondName: string,
  contractEnd: number,
): number {
  const def = getBondPeriodDefault(bondName);
  const months = def?.extraMonths ?? 0;
  const date = new Date(contractEnd);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.getTime();
}

/** Chips estándar mostrados junto al campo `endDate` del amparo. */
export const BOND_PERIOD_CHIP_OPTIONS = [
  { label: "Igual al contrato", months: 0 },
  { label: "+12 meses", months: 12 },
  { label: "+36 meses", months: 36 },
  { label: "+60 meses", months: 60 },
] as const;
