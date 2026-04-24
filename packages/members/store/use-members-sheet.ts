import { atom, useAtom } from "jotai";

const membersSheetState = atom(false);

export const useMembersSheet = () => {
  return useAtom(membersSheetState);
};
