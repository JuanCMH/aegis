import { FileCheck2 } from "lucide-react";
import { CurrencyInput } from "@/components/aegis/currency-input";
import { DatePicker } from "@/components/aegis/date-picker";
import { Field } from "@/components/aegis/field";
import { PolicyStatusPicker } from "@/components/aegis/policy-status-picker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface PolicyFormProps {
  readOnly?: boolean;
}

const PolicyForm = ({ readOnly }: PolicyFormProps) => {
  return (
    <section className="m-2 overflow-hidden rounded-xl border border-border/40 bg-card/90 backdrop-blur-sm">
      <header className="flex items-center gap-3 p-4">
        <div className="flex size-9 items-center justify-center rounded-lg border border-aegis-sapphire/10 bg-aegis-sapphire/10 text-aegis-sapphire">
          <FileCheck2 className="size-4" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Información de la póliza
          </h1>
        </div>
      </header>
      <Separator className="opacity-40" />
      <div className="grid grid-cols-2 gap-2 p-4 lg:grid-cols-4">
        {/* General Info */}
        <Field
          label="NÚMERO DE PÓLIZA*"
          htmlFor="policyNumber"
          placeholder="12345678"
          readOnly={readOnly}
        />
        <Field
          label="TIPO DE PÓLIZA"
          htmlFor="policyType"
          placeholder="Cumplimiento"
          readOnly={readOnly}
        />
        <Field
          label="RAMO"
          htmlFor="lineOfBusiness"
          placeholder="Cumplimiento"
          readOnly={readOnly}
        />
        <Field
          label="ASEGURADORA"
          htmlFor="insurer"
          placeholder="Seguros del Estado"
          readOnly={readOnly}
        />
        <Field
          label="AGENTE"
          htmlFor="agentName"
          placeholder="Nombre del agente"
          readOnly={readOnly}
        />
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="status" className="text-xs">
            ESTADO*
          </Label>
          <PolicyStatusPicker
            readOnly={readOnly}
            placeholder="Seleccione un estado"
          />
        </div>

        {/* Dates */}
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="issueDate" className="text-xs">
            FECHA DE EMISIÓN
          </Label>
          <DatePicker readOnly={readOnly} />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="startDate" className="text-xs">
            FECHA DE INICIO*
          </Label>
          <DatePicker readOnly={readOnly} />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="endDate" className="text-xs">
            FECHA DE FIN*
          </Label>
          <DatePicker readOnly={readOnly} />
        </div>

        {/* Roles */}
        <Field
          label="TOMADOR"
          htmlFor="policyHolderName"
          placeholder="Nombre del tomador"
          readOnly={readOnly}
        />
        <Field
          label="DOCUMENTO TOMADOR"
          htmlFor="policyHolderIdNumber"
          placeholder="123456789"
          readOnly={readOnly}
        />
        <Field
          label="ASEGURADO"
          htmlFor="insuredName"
          placeholder="Nombre del asegurado"
          readOnly={readOnly}
        />
        <Field
          label="DOCUMENTO ASEGURADO"
          htmlFor="insuredIdNumber"
          placeholder="123456789"
          readOnly={readOnly}
        />
        <Field
          label="BENEFICIARIO"
          htmlFor="beneficiaryName"
          placeholder="Nombre del beneficiario"
          readOnly={readOnly}
        />
        <Field
          label="DOCUMENTO BENEFICIARIO"
          htmlFor="beneficiaryIdNumber"
          placeholder="123456789"
          readOnly={readOnly}
        />

        {/* Values */}
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="premiumAmount" className="text-xs">
            PRIMA
          </Label>
          <CurrencyInput placeholder="$0" readOnly={readOnly} />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="issuanceExpenses" className="text-xs">
            GASTOS DE EMISIÓN
          </Label>
          <CurrencyInput placeholder="$0" readOnly={readOnly} />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="taxes" className="text-xs">
            IVA
          </Label>
          <CurrencyInput placeholder="$0" readOnly={readOnly} />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="totalAmount" className="text-xs">
            TOTAL
          </Label>
          <CurrencyInput placeholder="$0" readOnly={readOnly} />
        </div>

        {/* Commission */}
        <Field
          label="% COMISIÓN"
          htmlFor="commissionPercentage"
          type="number"
          placeholder="0"
          readOnly={readOnly}
        />
        <Field
          label="% PARTICIPACIÓN"
          htmlFor="participation"
          type="number"
          placeholder="0"
          readOnly={readOnly}
        />
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="totalCommission" className="text-xs">
            TOTAL COMISIÓN
          </Label>
          <CurrencyInput placeholder="$0" readOnly={readOnly} />
        </div>

        {/* Switches */}
        <div className="h-9 flex items-center justify-between border rounded-md space-x-2 shadow-sm mt-auto px-3 bg-muted">
          <Switch id="isRenewal" disabled={readOnly} />
          <Label htmlFor="isRenewal" className="text-xs">
            ¿Es renovación?
          </Label>
        </div>
        <div className="h-9 flex items-center justify-between border rounded-md space-x-2 shadow-sm mt-auto px-3 bg-muted">
          <Switch id="isRenewable" disabled={readOnly} />
          <Label htmlFor="isRenewable" className="text-xs">
            ¿Es renovable?
          </Label>
        </div>

        {/* Descriptions */}
        <div className="grid w-full items-center gap-1 col-span-full lg:col-span-2">
          <Label htmlFor="riskDescription" className="text-xs">
            DESCRIPCIÓN DEL RIESGO
          </Label>
          <Textarea
            id="agreement"
            maxLength={200}
            readOnly={readOnly}
            className="resize-none h-24"
            placeholder="Descripción del riesgo asegurado..."
          />
        </div>
        <div className="grid w-full items-center gap-1 col-span-full lg:col-span-2">
          <Label htmlFor="observations" className="text-xs">
            OBSERVACIONES
          </Label>
          <Textarea
            id="observations"
            maxLength={200}
            readOnly={readOnly}
            className="resize-none h-24"
            placeholder="Observaciones generales..."
          />
        </div>
      </div>
    </section>
  );
};

export default PolicyForm;
