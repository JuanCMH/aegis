export type ContractDataType = {
  contractor: string;
  contractorId: string;
  contractee: string;
  contracteeId: string;
  contractType: string;
  contractValue: number;
  contractStart: Date;
  contractEnd: Date;
};

export type BondDataType = {
  name: string;
  startDate: Date;
  endDate: Date;
  days: number;
  months: number;
  percentage: number;
  insuredValue: number;
  rate: number;
};
