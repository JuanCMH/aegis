import { Dispatch, SetStateAction } from "react";
import { BondDataType, ContractDataType } from "../types";
import Bond from "./bond";

interface BidBondDataProps {
  contractData: ContractDataType;
  bidBondData: BondDataType;
  setBidBondData: Dispatch<SetStateAction<BondDataType>>;
}

const BidBondInfo = ({
  contractData,
  bidBondData,
  setBidBondData,
}: BidBondDataProps) => {
  return (
    <Bond
      contractData={contractData}
      bondData={bidBondData}
      setBondData={setBidBondData}
    />
  );
};

export default BidBondInfo;
