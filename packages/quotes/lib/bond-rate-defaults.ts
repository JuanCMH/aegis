import { matchBondName } from "./bond-period-defaults";

/**
 * Tasas porcentuales sugeridas por nombre canónico de amparo. Son referencia
 * inicial: el usuario puede ajustar en el form. Valores en porcentaje (ej.
 * `1.5` = 1.5%).
 */
const RATE_DEFAULTS: Record<string, number> = {
  seriedad_oferta: 1.5,
  buen_manejo_anticipo: 1.0,
  cumplimiento: 1.0,
  pago_salarios: 1.0,
  calidad_servicio: 1.0,
  calidad_correcto_funcionamiento: 1.5,
  estabilidad_obra: 2.0,
  responsabilidad_civil_extracontractual: 1.5,
};

/**
 * Porcentajes asegurados por defecto sobre `contractValue`.
 */
const PERCENTAGE_DEFAULTS: Record<string, number> = {
  seriedad_oferta: 10,
  buen_manejo_anticipo: 100,
  cumplimiento: 20,
  pago_salarios: 5,
  calidad_servicio: 20,
  calidad_correcto_funcionamiento: 20,
  estabilidad_obra: 20,
  responsabilidad_civil_extracontractual: 20,
};

export function getBondRateDefault(name: string): number | null {
  const key = matchBondName(name);
  if (!key) return null;
  return RATE_DEFAULTS[key] ?? null;
}

export function getBondPercentageDefault(name: string): number | null {
  const key = matchBondName(name);
  if (!key) return null;
  return PERCENTAGE_DEFAULTS[key] ?? null;
}

/**
 * Sugerencia completa para inicializar un amparo recién agregado a partir del
 * `contractValue`.
 */
export function suggestBondDefaults(
  name: string,
  contractValue: number,
): {
  percentage: number;
  insuredValue: number;
  rate: number;
} {
  const percentage = getBondPercentageDefault(name) ?? 20;
  const rate = getBondRateDefault(name) ?? 1.5;
  const insuredValue = Math.round((contractValue * percentage) / 100);
  return { percentage, insuredValue, rate };
}
