import { atom, useAtom } from "jotai";

const insurersSheetState = atom(false);

export const useInsurersSheet = () => {
  return useAtom(insurersSheetState);
};
