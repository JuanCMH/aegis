"use client";

import { Users as UsersIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Doc } from "@/convex/_generated/dataModel";
import type { MemberRow as MemberRowType } from "../types";
import { MemberRow } from "./member-row";

interface MembersTableProps {
  members: MemberRowType[] | undefined;
  isLoading: boolean;
  currentUserId: string;
  canAssignRole: boolean;
  canExpel: boolean;
  customRoles: Doc<"roles">[];
  filter: string;
}

export function MembersTable({
  members,
  isLoading,
  currentUserId,
  canAssignRole,
  canExpel,
  customRoles,
  filter,
}: MembersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border/40 p-4 last:border-b-0"
          >
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const filtered = (members ?? []).filter((m) => {
    if (!filter.trim()) return true;
    const q = filter.trim().toLowerCase();
    return (
      (m.user?.name ?? "").toLowerCase().includes(q) ||
      (m.user?.email ?? "").toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-aegis-sapphire/10 text-aegis-sapphire">
          <UsersIcon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-aegis-graphite">
            {filter.trim() ? "Sin resultados" : "Aún no hay miembros"}
          </p>
          <p className="mt-1 text-xs text-aegis-steel">
            {filter.trim()
              ? "Prueba con otro nombre o correo."
              : "Invita a tu equipo para empezar a colaborar."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="h-10 text-xs font-medium text-aegis-steel">
              Miembro
            </TableHead>
            <TableHead className="h-10 text-xs font-medium text-aegis-steel">
              Rol
            </TableHead>
            <TableHead className="h-10 w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((member) => (
            <MemberRow
              key={member._id}
              member={member}
              currentUserId={currentUserId}
              canAssignRole={canAssignRole}
              canExpel={canExpel}
              customRoles={customRoles}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
