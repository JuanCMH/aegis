import { CurrencyInput } from "@/components/currency-input";
import { DatePicker } from "@/components/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ContractDataType } from "../types";
import { Dispatch, SetStateAction } from "react";
import { isAfter, isBefore } from "date-fns";

interface ContractInfoProps {
  contractData: ContractDataType;
  setContractData: Dispatch<SetStateAction<ContractDataType>>;
}

const ContractInfo = ({ contractData, setContractData }: ContractInfoProps) => {
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
    <main className="mt-2">
      <h1 className="text-xl font-semibold text-sky-500">
        Información básica del contrato
      </h1>
      <Separator className="my-2" />
      <div className="mt-2 grid grid-cols-4 gap-2">
        <div className="grid w-full items-center gap-1 col-span-3">
          <Label htmlFor="contractor">AFIANZADO/CONTRATISTA</Label>
          <Input
            id="contractor"
            placeholder="Luis Salamanca"
            value={contractData.contractor}
            onChange={(e) =>
              setContractData((prev) => ({
                ...prev,
                contractor: e.target.value,
              }))
            }
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contractor-id">NIT</Label>
          <Input
            id="contractor-id"
            placeholder="9012345678"
            value={contractData.contractorId}
            onChange={(e) =>
              setContractData((prev) => ({
                ...prev,
                contractorId: e.target.value,
              }))
            }
          />
        </div>
        <div className="grid w-full items-center gap-1 col-span-3">
          <Label htmlFor="contractee">ASEGURADO-BENEFICIARIO/CONTRATANTE</Label>
          <Input
            id="contractee"
            placeholder="Juan Pérez"
            value={contractData.contractee}
            onChange={(e) =>
              setContractData((prev) => ({
                ...prev,
                contractee: e.target.value,
              }))
            }
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contractee-id">NIT</Label>
          <Input
            id="contractee-id"
            placeholder="8765432109"
            value={contractData.contracteeId}
            onChange={(e) =>
              setContractData((prev) => ({
                ...prev,
                contracteeId: e.target.value,
              }))
            }
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-type">TIPO DE CONTRATO</Label>
          <Input
            id="contract-type"
            placeholder="Prestación de servicios"
            value={contractData.contractType}
            onChange={(e) =>
              setContractData((prev) => ({
                ...prev,
                contractType: e.target.value,
              }))
            }
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-value">VALOR DEL CONTRATO</Label>
          <CurrencyInput
            placeholder="$200.000.000"
            value={
              contractData.contractValue
                ? String(contractData.contractValue)
                : ""
            }
            onChange={handleContractValueChange}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-start">INICIO</Label>
          <DatePicker
            date={contractData.contractStart}
            onSelect={(date) => date && handleStartDateChange(date)}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-end">FINALIZACIÓN</Label>
          <DatePicker
            date={contractData.contractEnd}
            onSelect={(date) => date && handleEndDateChange(date)}
          />
        </div>
      </div>
    </main>
  );
};

export default ContractInfo;
