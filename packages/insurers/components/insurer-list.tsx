"use client";

import { Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { InsurerDoc } from "../types";
import { InsurerCard } from "./insurer-card";

interface InsurerListProps {
  insurers: InsurerDoc[] | undefined;
  isLoading: boolean;
  canManage: boolean;
  filter: string;
  onEdit: (insurer: InsurerDoc) => void;
}

export function InsurerList({
  insurers,
  isLoading,
  canManage,
  filter,
  onEdit,
}: InsurerListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="mt-3 h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const filtered = (insurers ?? []).filter((ins) => {
    if (!filter.trim()) return true;
    const q = filter.trim().toLowerCase();
    return (
      ins.name.toLowerCase().includes(q) ||
      (ins.taxId ?? "").toLowerCase().includes(q) ||
      (ins.email ?? "").toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-aegis-sapphire/10 text-aegis-sapphire">
          <Building2 className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-aegis-graphite">
            {filter.trim() ? "Sin resultados" : "Aún no hay aseguradoras"}
          </p>
          <p className="mt-1 max-w-sm text-xs text-aegis-steel">
            {filter.trim()
              ? "Prueba con otro nombre, NIT o correo."
              : "Crea el catálogo de aseguradoras con las que opera tu agencia."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((insurer) => (
        <InsurerCard
          key={insurer._id}
          insurer={insurer}
          canManage={canManage}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
