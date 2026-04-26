import { useEffect, useRef } from "react";

/**
 * Calls `effect(value)` after `delay` ms of stable `value`. Skips initial
 * mount and any change while `enabled` is false. Cancels in-flight timers on
 * unmount or value change.
 */
export function useDebouncedEffect<T>(
  value: T,
  delay: number,
  effect: (v: T) => void,
  enabled: boolean = true,
) {
  const initial = useRef(true);
  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    if (!enabled) return;
    const t = setTimeout(() => effect(value), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay, enabled]);
}
