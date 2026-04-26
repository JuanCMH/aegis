"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Ban,
  Calendar,
  FileText,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Hint } from "@/components/aegis/hint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/aegis/date-picker";
import { useConfirm } from "@/components/hooks/use-confirm";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { usePolicyId } from "@/packages/policies/store/use-policy-id";
import {
  useCancelPolicy,
  useGetPolicyById,
  useRemovePolicy,
  useRenewPolicy,
  useUpdatePolicy,
} from "@/packages/policies/api";
import { PolicyStepper } from "@/packages/policies/components/policy-stepper";
import { ClientPicker } from "@/packages/policies/components/client-picker";
import { PolicyStatusBadge } from "@/packages/policies/components/table/policy-columns";
import { FIELD_GRID_CLASSES } from "@/packages/policies/lib/grid";
import { validatePolicyData } from "@/packages/policies/lib/validate-policy-data";
import { fullDateTime, shortDate } from "@/lib/date-formats";
import type { TemplateSection } from "@/packages/policies/types";
import { RoleGate } from "@/packages/roles/components/role-gate";
import type { Id } from "@/convex/_generated/dataModel";

type StatusValue = "active" | "expired" | "canceled" | "pending";

const toMs = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  const parsed = Date.parse(String(v));
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function PolicyDetailPage() {
  const router = useRouter();
  const companyId = useCompanyId();
  const policyId = usePolicyId();
  const policy = useGetPolicyById({ id: policyId });
  const { mutate: updatePolicy, isPending: isUpdating } = useUpdatePolicy();
  const { mutate: removePolicy, isPending: isRemoving } = useRemovePolicy();
  const { mutate: cancelPolicy, isPending: isCanceling } = useCancelPolicy();
  const { mutate: renewPolicy, isPending: isRenewing } = useRenewPolicy();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [clientId, setClientId] = useState<Id<"clients"> | undefined>(
    undefined,
  );

  // Fallback editable fields when no template
  const [basicNumber, setBasicNumber] = useState("");
  const [basicStatus, setBasicStatus] = useState<StatusValue>("pending");
  const [basicStart, setBasicStart] = useState<Date | undefined>(undefined);
  const [basicEnd, setBasicEnd] = useState<Date | undefined>(undefined);

  // Renew dialog
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewStart, setRenewStart] = useState<Date | undefined>(undefined);
  const [renewEnd, setRenewEnd] = useState<Date | undefined>(undefined);

  const [DeleteDialog, confirmDelete] = useConfirm({
    title: "Eliminar póliza",
    message: "¿Estás seguro? Esta acción no se puede deshacer.",
    type: "critical",
  });
  const [CancelDialog, confirmCancel] = useConfirm({
    title: "Cancelar póliza",
    message: "La póliza quedará marcada como cancelada. ¿Continuar?",
    type: "warning",
  });

  const sections = useMemo<TemplateSection[]>(
    () =>
      (policy.data?.templateSections as TemplateSection[] | undefined) ?? [],
    [policy.data?.templateSections],
  );
  const hasTemplate = sections.length > 0;
  const resolvedFiles = (policy.data?.resolvedFiles ?? {}) as Record<
    string,
    string
  >;

  // Sync values from policy data when not editing
  useEffect(() => {
    if (policy.data && !isEditing) {
      setValues((policy.data.data as Record<string, unknown>) ?? {});
      setBasicNumber(policy.data.policyNumber ?? "");
      setBasicStatus(policy.data.status ?? "pending");
      setBasicStart(
        policy.data.startDate ? new Date(policy.data.startDate) : undefined,
      );
      setBasicEnd(
        policy.data.endDate ? new Date(policy.data.endDate) : undefined,
      );
      setClientId(policy.data.clientId ?? undefined);
    }
  }, [policy.data, isEditing]);

  const handleChange = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setFieldErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const handleSave = async () => {
    let policyNumber: string;
    let status: StatusValue;
    let startDate: number | undefined;
    let endDate: number | undefined;

    if (hasTemplate) {
      const { valid, errors } = validatePolicyData(sections, values);
      if (!valid) {
        setFieldErrors(errors);
        const count = Object.keys(errors).length;
        toast.error(`Hay ${count} campo${count > 1 ? "s" : ""} con errores`);
        return;
      }
      setFieldErrors({});

      policyNumber = String(values.field_policyNumber ?? "").trim();
      status = (values.field_status as StatusValue) ?? "pending";
      startDate = toMs(values.field_startDate);
      endDate = toMs(values.field_endDate);
    } else {
      policyNumber = basicNumber.trim();
      status = basicStatus;
      startDate = basicStart?.getTime();
      endDate = basicEnd?.getTime();
    }

    if (!policyNumber) return toast.error("El número de póliza es obligatorio");
    if (!startDate) return toast.error("La fecha de inicio es obligatoria");
    if (!endDate) return toast.error("La fecha de fin es obligatoria");
    if (endDate < startDate)
      return toast.error("La fecha de fin debe ser posterior a la de inicio");

    await updatePolicy(
      {
        id: policyId,
        policyNumber,
        status,
        startDate,
        endDate,
        clientId,
        data: values,
      },
      {
        onSuccess: () => {
          toast.success("Póliza actualizada");
          setIsEditing(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFieldErrors({});
    if (policy.data) {
      setValues((policy.data.data as Record<string, unknown>) ?? {});
      setBasicNumber(policy.data.policyNumber ?? "");
      setBasicStatus(policy.data.status ?? "pending");
      setBasicStart(
        policy.data.startDate ? new Date(policy.data.startDate) : undefined,
      );
      setBasicEnd(
        policy.data.endDate ? new Date(policy.data.endDate) : undefined,
      );
      setClientId(policy.data.clientId ?? undefined);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    await removePolicy(
      { id: policyId },
      {
        onSuccess: () => {
          toast.success("Póliza eliminada");
          router.push(`/companies/${companyId}/policies`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleCancelPolicy = async () => {
    const ok = await confirmCancel();
    if (!ok) return;
    await cancelPolicy(
      { id: policyId },
      {
        onSuccess: () => toast.success("Póliza cancelada"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const openRenewDialog = () => {
    if (!policy.data) return;
    // Pre-fill: start = previous end, end = previous end + (end - start) duration
    const prevStart = policy.data.startDate;
    const prevEnd = policy.data.endDate;
    const duration = prevEnd - prevStart;
    setRenewStart(new Date(prevEnd));
    setRenewEnd(new Date(prevEnd + (duration > 0 ? duration : 0)));
    setRenewOpen(true);
  };

  const handleRenew = async () => {
    if (!renewStart || !renewEnd) {
      toast.error("Selecciona ambas fechas");
      return;
    }
    if (renewEnd.getTime() <= renewStart.getTime()) {
      toast.error("La fecha de fin debe ser posterior a la de inicio");
      return;
    }
    await renewPolicy(
      {
        id: policyId,
        startDate: renewStart.getTime(),
        endDate: renewEnd.getTime(),
      },
      {
        onSuccess: (newId) => {
          toast.success("Póliza renovada");
          setRenewOpen(false);
          router.push(`/companies/${companyId}/policies/${newId}`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancelEdit();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isUpdating) void handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditing,
    isUpdating,
    values,
    basicNumber,
    basicStatus,
    basicStart,
    basicEnd,
    clientId,
  ]);

  // ---- Loading skeleton ---------------------------------------------------
  if (policy.isLoading) {
    return (
      <main className="flex h-full w-full flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <Skeleton className="h-4 w-40" />
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl space-y-4 px-8 py-6">
            <Skeleton className="h-4 w-64" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---- Not found ----------------------------------------------------------
  if (!policy.data) {
    return (
      <main className="flex h-full w-full flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">Póliza no encontrada</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-muted-foreground">
            No pudimos encontrar esta póliza. Pudo haber sido eliminada.
          </p>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="cursor-pointer"
          >
            <Link href={`/companies/${companyId}/policies`}>
              <ArrowLeft />
              Volver a la lista
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const createdAt = new Date(policy.data._creationTime);
  const status = policy.data.status;
  const canCancel = status !== "canceled" && status !== "expired";
  const canRenew = status !== "canceled";

  return (
    <main className="flex h-full w-full flex-1 flex-col">
      <DeleteDialog />
      <CancelDialog />
      <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <Hint label="Volver a la lista">
            <Button
              asChild
              size="icon-sm"
              variant="ghost"
              className="cursor-pointer"
            >
              <Link
                href={`/companies/${companyId}/policies`}
                aria-label="Volver a la lista de pólizas"
              >
                <ArrowLeft />
              </Link>
            </Button>
          </Hint>
          <h1 className="truncate text-base font-medium">
            {policy.data.policyNumber}
          </h1>
          {isEditing && (
            <span className="ml-2 inline-flex items-center rounded-full bg-aegis-sapphire/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-aegis-sapphire">
              Editando
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <ClientPicker
              value={clientId}
              onChange={setClientId}
              readOnly={!isEditing}
            />
            {isEditing ? (
              <>
                <Hint label="Cancelar (Esc)">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="cursor-pointer"
                  >
                    <X />
                    Cancelar
                  </Button>
                </Hint>
                <Hint label="Guardar (⌘ + S)">
                  <Button
                    size="sm"
                    type="button"
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="cursor-pointer"
                  >
                    <Save />
                    Guardar
                  </Button>
                </Hint>
              </>
            ) : (
              <>
                {canRenew && (
                  <RoleGate permission="policies_renew">
                    <Hint label="Renovar póliza">
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={openRenewDialog}
                        disabled={isRenewing}
                        className="cursor-pointer"
                      >
                        <RefreshCw />
                        Renovar
                      </Button>
                    </Hint>
                  </RoleGate>
                )}
                {canCancel && (
                  <RoleGate permission="policies_edit">
                    <Hint label="Cancelar póliza">
                      <Button
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                        onClick={handleCancelPolicy}
                        disabled={isCanceling}
                        className="cursor-pointer text-muted-foreground hover:text-aegis-amber"
                        aria-label="Cancelar póliza"
                      >
                        <Ban />
                      </Button>
                    </Hint>
                  </RoleGate>
                )}
                <RoleGate permission="policies_delete">
                  <Hint label="Eliminar póliza">
                    <Button
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      onClick={handleDelete}
                      disabled={isRemoving}
                      className="cursor-pointer text-muted-foreground hover:text-destructive"
                      aria-label="Eliminar póliza"
                    >
                      <Trash2 />
                    </Button>
                  </Hint>
                </RoleGate>
                <RoleGate permission="policies_edit">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer"
                  >
                    <Pencil />
                    Editar
                  </Button>
                </RoleGate>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-8 py-6">
          {/* Metadata strip */}
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <PolicyStatusBadge status={status} />
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-3.5" />
              <span className="tabular-nums text-foreground/80">
                {policy.data.policyNumber}
              </span>
            </span>
            <Hint label={fullDateTime(new Date(policy.data.startDate))}>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Inicia {shortDate(new Date(policy.data.startDate))}
              </span>
            </Hint>
            <Hint label={fullDateTime(new Date(policy.data.endDate))}>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Vence {shortDate(new Date(policy.data.endDate))}
              </span>
            </Hint>
            <Hint label={fullDateTime(createdAt)}>
              <span className="inline-flex items-center gap-1.5">
                Creada el {shortDate(createdAt)}
              </span>
            </Hint>
            {policy.data.parentPolicyId && (
              <span className="inline-flex items-center rounded-full bg-aegis-sapphire/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-aegis-sapphire">
                Renovación
              </span>
            )}
            {!hasTemplate && (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                Sin plantilla
              </span>
            )}
          </div>

          {hasTemplate ? (
            <PolicyStepper
              sections={sections}
              values={values}
              onChange={handleChange}
              readOnly={!isEditing}
              resolvedFiles={resolvedFiles}
              errors={fieldErrors}
              companyId={companyId}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
                Esta empresa aún no tiene una plantilla configurada. Solo se
                muestran los campos básicos.
              </div>
              <div className={FIELD_GRID_CLASSES}>
                <div className="col-span-1 space-y-1.5 sm:col-span-3 lg:col-span-6">
                  <Label htmlFor="basic-number" className="text-xs font-medium">
                    Número de póliza <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="basic-number"
                    placeholder="Ej. POL-2025-001"
                    value={basicNumber}
                    onChange={(e) => setBasicNumber(e.target.value)}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="col-span-1 space-y-1.5 sm:col-span-3 lg:col-span-6">
                  <Label className="text-xs font-medium">
                    Estado <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={basicStatus}
                    onValueChange={(v) => setBasicStatus(v as StatusValue)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="expired">Vencida</SelectItem>
                      <SelectItem value="canceled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 space-y-1.5 sm:col-span-3 lg:col-span-6">
                  <Label className="text-xs font-medium">
                    Fecha de inicio <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    date={basicStart}
                    onSelect={setBasicStart}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="col-span-1 space-y-1.5 sm:col-span-3 lg:col-span-6">
                  <Label className="text-xs font-medium">
                    Fecha de fin <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    date={basicEnd}
                    onSelect={setBasicEnd}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Renew dialog */}
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renovar póliza</DialogTitle>
            <DialogDescription>
              Se creará una nueva póliza enlazada a la actual con las fechas
              indicadas y estado activa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Fecha de inicio <span className="text-destructive">*</span>
              </Label>
              <DatePicker date={renewStart} onSelect={setRenewStart} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Fecha de fin <span className="text-destructive">*</span>
              </Label>
              <DatePicker date={renewEnd} onSelect={setRenewEnd} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenewOpen(false)}
              disabled={isRenewing}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleRenew}
              disabled={isRenewing}
              className="cursor-pointer"
            >
              <RefreshCw />
              Renovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
