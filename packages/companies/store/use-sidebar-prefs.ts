"use client";

import { useCallback, useEffect, useState } from "react";

const COLLAPSE_KEY = "aegis:sidebar:groups";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / privacy mode — silent. */
  }
}

function scopedKey(base: string, companyId?: string) {
  return companyId ? `${base}:${companyId}` : base;
}

/**
 * Persists per-group collapse state in `localStorage`, scoped by `companyId`.
 */
export function useGroupCollapseState(companyId?: string) {
  const key = scopedKey(COLLAPSE_KEY, companyId);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(read<Record<string, boolean>>(key, {}));
    setHydrated(true);
  }, [key]);

  const toggle = useCallback(
    (groupTitle: string) => {
      setCollapsed((prev) => {
        const next = { ...prev, [groupTitle]: !prev[groupTitle] };
        write(key, next);
        return next;
      });
    },
    [key],
  );

  return { collapsed, toggle, hydrated };
}
