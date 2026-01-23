import { CurrencyInput } from "@/components/currency-input";
import { DatePicker } from "@/components/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ContractDataType } from "../types";
import { Dispatch, SetStateAction } from "react";
import { isAfter, isBefore } from "date-fns";
import { RiContractFill } from "@remixicon/react";
import { Field } from "@/components/field";
import { Textarea } from "@/components/ui/textarea";

interface ContractInfoProps {
  readOnly?: boolean;
  contractData: ContractDataType;
  setContractData: Dispatch<SetStateAction<ContractDataType>>;
}

const ContractInfo = ({
  readOnly,
  contractData,
  setContractData,
}: ContractInfoProps) => {
  const handleStartDateChange = (date: Date) => {
    if (isAfter(date, contractData.contractEnd)) return;
    setContractData((prev) => ({ ...prev, contractStart: date }));
  };

  const handleEndDateChange = (date: Date) => {
    if (isBefore(date, contractData.contractStart)) return;
    setContractData((prev) => ({ ...prev, contractEnd: date }));
  };

  const handleContractValueChange = (value: string) => {
    setContractData((prev) => ({
      ...prev,
      contractValue: value === "" ? 0 : Number(value),
    }));
  };

  return (
    <section className="m-2 border p-2 rounded-md shadow-sm bg-card">
      <div className="flex gap-2 items-center">
        <RiContractFill className="size-4" />
        <h1 className="text-lg font-semibold">
          Información básica del contrato
        </h1>
      </div>
      <Separator className="my-2" />
      <div className="mt-2 gap-2 grid grid-cols-2 lg:grid-cols-4">
        <Field
          label="AFIANZADO/CONTRATISTA*"
          htmlFor="contractor"
          placeholder="Luis Salamanca"
          value={contractData.contractor}
          onChange={(value) =>
            setContractData((prev) => ({
              ...prev,
              contractor: value,
            }))
          }
          className="lg:col-span-3"
          readOnly={readOnly}
        />
        <Field
          label="IDENTIFICACIÓN"
          htmlFor="contractor-id"
          placeholder="9012345678"
          value={contractData.contractorId}
          onChange={(value) =>
            setContractData((prev) => ({
              ...prev,
              contractorId: value,
            }))
          }
          readOnly={readOnly}
        />
        <Field
          label="ASEGURADO-BENEFICIARIO/CONTRATANTE*"
          htmlFor="contractee"
          placeholder="Juan Pérez"
          value={contractData.contractee}
          onChange={(value) =>
            setContractData((prev) => ({
              ...prev,
              contractee: value,
            }))
          }
          className="lg:col-span-3"
          readOnly={readOnly}
        />
        <Field
          label="IDENTIFICACIÓN"
          htmlFor="contractee-id"
          placeholder="8765432109"
          value={contractData.contracteeId}
          onChange={(value) =>
            setContractData((prev) => ({
              ...prev,
              contracteeId: value,
            }))
          }
          readOnly={readOnly}
        />
        <Field
          label="TIPO DE CONTRATO"
          htmlFor="contract-type"
          placeholder="Prestación de servicios"
          value={contractData.contractType}
          onChange={(value) =>
            setContractData((prev) => ({
              ...prev,
              contractType: value,
            }))
          }
          readOnly={readOnly}
        />
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-value" className="text-xs">
            VALOR DEL CONTRATO*
          </Label>
          <CurrencyInput
            placeholder="$200.000.000"
            value={
              contractData.contractValue
                ? String(contractData.contractValue)
                : ""
            }
            onChange={handleContractValueChange}
            readOnly={readOnly}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-start" className="text-xs">
            INICIO*
          </Label>
          <DatePicker
            readOnly={readOnly}
            date={contractData.contractStart}
            onSelect={(date) => date && handleStartDateChange(date)}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-end" className="text-xs">
            FINALIZACIÓN*
          </Label>
          <DatePicker
            readOnly={readOnly}
            date={contractData.contractEnd}
            onSelect={(date) => date && handleEndDateChange(date)}
          />
        </div>
        <div className="grid w-full items-center gap-1 col-span-full">
          <Label htmlFor="agreement" className="text-xs">
            OBJETO
          </Label>
          <Textarea
            id="agreement"
            maxLength={200}
            readOnly={readOnly}
            className="resize-none h-24"
            placeholder="Descripción del objeto"
            value={contractData.agreement}
            onChange={(e) =>
              setContractData((prev) => ({
                ...prev,
                agreement: e.target.value,
              }))
            }
          />
        </div>
      </div>
    </section>
  );
};

export default ContractInfo;
