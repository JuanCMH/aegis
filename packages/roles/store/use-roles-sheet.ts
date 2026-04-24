import { atom, useAtom } from "jotai";

const rolesSheetState = atom(false);

export const useRolesSheet = () => {
  return useAtom(rolesSheetState);
};
