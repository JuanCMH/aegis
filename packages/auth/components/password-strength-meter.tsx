import { calculatePasswordStrength } from "../lib/password-strength";

/**
 * Inline password strength meter — progress bar + label. Only renders when
 * `password` is non-empty.
 */
export const PasswordStrengthMeter = ({ password }: { password: string }) => {
  if (!password) return null;
  const s = calculatePasswordStrength(password);

  return (
    <div className="mt-1.5 space-y-1" aria-live="polite">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${s.colorClass}`}
          style={{ width: `${s.percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{s.label}</p>
    </div>
  );
};
