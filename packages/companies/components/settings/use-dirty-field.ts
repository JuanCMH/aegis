"use client";

import { useEffect, useRef, useState } from "react";

function areRecordsEqual<T extends Record<string, unknown>>(left: T, right: T) {
  if (left === right) return true;

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key) => Object.is(left[key], right[key]));
}

/**
 * Tiny helper that mirrors a server-side value into a local input state and
 * exposes a `dirty` flag plus a `reset()` to revert to the canonical value.
 *
 * Designed for per-section save bars in the company settings sheet.
 */
export function useDirtyField<T>(serverValue: T | undefined | null) {
  const [value, setValue] = useState<T | undefined>(
    (serverValue ?? undefined) as T | undefined,
  );
  const lastServerValueRef = useRef<T | undefined | null>(serverValue);

  // Re-sync when the upstream value changes (e.g. after a save round-trip).
  useEffect(() => {
    if (Object.is(lastServerValueRef.current, serverValue)) return;
    lastServerValueRef.current = serverValue;
    setValue((serverValue ?? undefined) as T | undefined);
  }, [serverValue]);

  const reset = () => setValue((serverValue ?? undefined) as T | undefined);

  const dirty =
    (value ?? "") !== (serverValue ?? "") &&
    !(value === undefined && serverValue === undefined);

  return { value, setValue, reset, dirty } as const;
}

/**
 * Snapshot helper: maintains a draft object that can be diffed against the
 * server value to know whether the section has pending changes.
 *
 * Importante: el padre suele pasar `serverValue` como objeto literal nuevo en
 * cada render (referencia distinta, mismos valores). Para evitar borrar el
 * draft del usuario en cada re-render, comparamos los valores reales contra
 * el último `serverValue` visto y solo re-sincronizamos cuando el server
 * efectivamente cambió (p.ej. tras un save round-trip).
 */
export function useDirtyRecord<T extends Record<string, unknown>>(
  serverValue: T,
) {
  const [draft, setDraft] = useState<T>(serverValue);
  const lastServerRef = useRef<T>(serverValue);

  useEffect(() => {
    if (areRecordsEqual(lastServerRef.current, serverValue)) return;
    lastServerRef.current = serverValue;
    setDraft(serverValue);
  }, [serverValue]);

  const reset = () => {
    lastServerRef.current = serverValue;
    setDraft(serverValue);
  };

  const set = <K extends keyof T>(key: K, value: T[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const dirty = !areRecordsEqual(draft, serverValue);

  return { draft, set, reset, dirty } as const;
}
