"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PermissionKey } from "@/convex/lib/permissions";
import {
  permissionGroups,
  type PermissionGroup,
} from "../lib/permission-groups";
import {
  countPermissions,
  roleTemplates,
  type PermissionsMap,
} from "../lib/role-templates";

interface PermissionMatrixProps {
  value: PermissionsMap;
  onChange: (value: PermissionsMap) => void;
  disabled?: boolean;
}

export function PermissionMatrix({
  value,
  onChange,
  disabled,
}: PermissionMatrixProps) {
  const total = useMemo(
    () => permissionGroups.reduce((acc, g) => acc + g.items.length, 0),
    [],
  );
  const selected = countPermissions(value);

  const applyTemplate = (build: () => PermissionsMap) => {
    if (disabled) return;
    onChange(build());
  };

  const setKey = (key: PermissionKey, next: boolean) => {
    if (disabled) return;
    onChange({ ...value, [key]: next });
  };

  const setGroup = (group: PermissionGroup, next: boolean) => {
    if (disabled) return;
    const updated: PermissionsMap = { ...value };
    for (const item of group.items) updated[item.key] = next;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-aegis-graphite">
          <span className="font-medium">
            {selected} / {total}
          </span>
          <span className="text-aegis-steel">permisos seleccionados</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={disabled}>
              <Sparkles className="size-4" />
              Plantillas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Rellenar desde plantilla</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roleTemplates.map((tpl) => (
              <DropdownMenuItem
                key={tpl.id}
                onSelect={() => applyTemplate(tpl.build)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{tpl.label}</span>
                  <span className="text-xs text-aegis-steel">
                    {tpl.description}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {permissionGroups.map((group) => (
          <GroupSection
            key={group.id}
            group={group}
            value={value}
            disabled={disabled}
            onToggleKey={setKey}
            onToggleGroup={(next) => setGroup(group, next)}
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- group ---------------------------------- */

interface GroupSectionProps {
  group: PermissionGroup;
  value: PermissionsMap;
  disabled?: boolean;
  onToggleKey: (key: PermissionKey, next: boolean) => void;
  onToggleGroup: (next: boolean) => void;
}

function GroupSection({
  group,
  value,
  disabled,
  onToggleKey,
  onToggleGroup,
}: GroupSectionProps) {
  const total = group.items.length;
  const selected = group.items.reduce(
    (acc, item) => (value[item.key] ? acc + 1 : acc),
    0,
  );
  const allChecked = selected === total;
  const partial = selected > 0 && selected < total;
  const [open, setOpen] = useState(selected > 0);

  const Icon = group.icon;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-lg border border-border/60 bg-card"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <Checkbox
          checked={allChecked ? true : partial ? "indeterminate" : false}
          onCheckedChange={(c) => onToggleGroup(c === true)}
          disabled={disabled}
          aria-label={`Seleccionar todos los permisos de ${group.label}`}
        />
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left transition hover:bg-muted/40"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-aegis-sapphire/10 text-aegis-sapphire">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-aegis-graphite">
                {group.label}
              </p>
              <p className="truncate text-xs text-aegis-steel">
                {group.description}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-xs",
                selected === 0 && "text-aegis-steel",
                selected > 0 &&
                  selected < total &&
                  "border-aegis-sapphire/30 text-aegis-sapphire",
                selected === total &&
                  "border-aegis-emerald/30 bg-aegis-emerald/10 text-aegis-emerald",
              )}
            >
              {selected}/{total}
            </Badge>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-aegis-steel transition",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="grid gap-1 border-t border-border/50 bg-muted/10 px-3 py-2 sm:grid-cols-2">
          {group.items.map((item) => {
            const checked = Boolean(value[item.key]);
            return (
              <label
                key={item.key}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted/40",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => onToggleKey(item.key, c === true)}
                  disabled={disabled}
                />
                <span
                  className={cn(
                    "text-sm",
                    item.destructive
                      ? "text-aegis-graphite"
                      : "text-aegis-graphite",
                  )}
                >
                  {item.label}
                  {item.destructive && (
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
                      · destructivo
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
