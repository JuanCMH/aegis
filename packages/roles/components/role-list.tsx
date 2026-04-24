"use client";

import { ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { allPermissionKeys } from "../lib/permission-groups";
import type { RoleWithCount } from "../types";
import { RoleCard } from "./role-card";

interface RoleListProps {
  roles: RoleWithCount[] | undefined;
  isLoading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (role: RoleWithCount) => void;
}

export function RoleList({
  roles,
  isLoading,
  canEdit,
  canDelete,
  onEdit,
}: RoleListProps) {
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

  if (!roles || roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-aegis-cyan/10 text-aegis-cyan">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-aegis-graphite">
            Aún no hay roles personalizados
          </p>
          <p className="mt-1 max-w-sm text-xs text-aegis-steel">
            Crea roles a medida para tu agencia: define qué puede hacer cada
            miembro con granularidad por módulo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {roles.map((role) => (
        <RoleCard
          key={role._id}
          role={role}
          totalPermissions={allPermissionKeys.length}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
