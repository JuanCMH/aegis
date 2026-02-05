import { Field } from "@/components/field";
import { Label } from "@/components/ui/label";
import { RiGroup2Fill } from "@remixicon/react";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/date-picker";
import { GenderPicker } from "@/components/gender-picker";
import { IdTypePicker } from "@/components/id-type-picker";
import { MaritalStatusPicker } from "@/components/marital-status-picker";

interface ClientFormProps {
  readOnly?: boolean;
}

const ClientForm = ({ readOnly }: ClientFormProps) => {
  return (
    <section className="m-2 border p-2 rounded-md shadow-sm bg-card">
      <div className="flex gap-2 items-center">
        <RiGroup2Fill className="size-4" />
        <h1 className="text-lg font-semibold">Información del cliente</h1>
      </div>
      <Separator className="my-2" />
      <div className="mt-2 gap-2 grid grid-cols-2 lg:grid-cols-4">
        <Field
          label="NOMBRES*"
          htmlFor="clientName"
          placeholder="Luis Andrés"
          readOnly={readOnly}
        />
        <Field
          label="APELLIDOS"
          htmlFor="clientLastName"
          placeholder="Salamanca Gómez"
          readOnly={readOnly}
        />
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="idType" className="text-xs">
            TIPO DE IDENTIFICACIÓN*
          </Label>
          <IdTypePicker
            readOnly={readOnly}
            placeholder="Seleccione un tipo de identificación"
          />
        </div>
        <Field
          label="NÚMERO DE IDENTIFICACIÓN*"
          htmlFor="idNumber"
          placeholder="1.234.567.890"
          readOnly={readOnly}
        />
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="maritalStatus" className="text-xs">
            ESTADO CIVIL
          </Label>
          <MaritalStatusPicker
            readOnly={readOnly}
            placeholder="Seleccione un estado civil"
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="birthDate" className="text-xs">
            FECHA DE NACIMIENTO*
          </Label>
          <DatePicker readOnly={readOnly} />
        </div>
        <Field
          label="CORREO ELECTRÓNICO"
          htmlFor="clientEmail"
          placeholder="correo@ejemplo.com"
          readOnly={readOnly}
        />
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="gender" className="text-xs">
            GÉNERO*
          </Label>
          <GenderPicker
            readOnly={readOnly}
            placeholder="Seleccione un género"
          />
        </div>
        <Field
          label="CIUDAD*"
          htmlFor="clientCity"
          placeholder="Bogotá"
          readOnly={readOnly}
        />
        <Field
          label="DIRECCIÓN*"
          htmlFor="clientAddress"
          placeholder="Calle 123 #45-67"
          readOnly={readOnly}
        />
        <Field
          label="TELÉFONO*"
          htmlFor="clientPhone"
          placeholder="+57 300 123 4567"
          readOnly={readOnly}
        />
        <Field
          label="PROFESIÓN*"
          htmlFor="clientProfession"
          placeholder="Ingeniero de sistemas"
          readOnly={readOnly}
        />
      </div>
    </section>
  );
};

export default ClientForm;
