export type PasswordStrength = {
  score: number;
  label: string;
  colorClass: string;
  percent: number;
  isAcceptable: boolean;
  isStrong: boolean;
};

export function calculatePasswordStrength(value: string): PasswordStrength {
  const lengthOk = value.length >= 8;
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  let score = 0;
  score += lengthOk ? 1 : 0;
  score += hasLower ? 1 : 0;
  score += hasUpper ? 1 : 0;
  score += hasNumber ? 1 : 0;
  score += hasSymbol ? 1 : 0;

  const percent = Math.round((score / 5) * 100);
  const categoriesMet = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  const isAcceptable = lengthOk && categoriesMet >= 3;
  const isStrong = lengthOk && categoriesMet === 4;

  let label = "Muy débil";
  let colorClass = "bg-destructive";
  if (score <= 1) {
    label = "Muy débil";
    colorClass = "bg-destructive";
  } else if (score === 2) {
    label = "Débil";
    colorClass = "bg-destructive/70";
  } else if (score === 3) {
    label = "Aceptable";
    colorClass = "bg-light";
  } else if (score === 4) {
    label = "Aceptable";
    colorClass = "bg-light";
  } else if (score === 5) {
    label = "Fuerte";
    colorClass = "bg-main";
  }

  return { score, label, colorClass, percent, isAcceptable, isStrong };
}


