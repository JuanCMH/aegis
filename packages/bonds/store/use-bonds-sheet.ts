import { atom, useAtom } from "jotai";

const bondsSheetState = atom(false);

export const useBondsSheet = () => {
  return useAtom(bondsSheetState);
};
