import { Construction, ScrollText } from "lucide-react";

export default function LogsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-aegis-sapphire/10 text-aegis-sapphire">
        <ScrollText className="size-7" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Auditoría</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          La bitácora de cambios estará disponible próximamente. Aquí podrás
          revisar quién editó qué y cuándo a lo largo de tu agencia.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
        <Construction className="size-3.5" />
        En construcción
      </div>
    </div>
  );
}
