import { atom, useAtom } from "jotai";

const linesOfBusinessSheetState = atom(false);

export const useLinesOfBusinessSheet = () => {
  return useAtom(linesOfBusinessSheetState);
};
