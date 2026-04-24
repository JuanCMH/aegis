import { atom, useAtom } from "jotai";

const modalState = atom(false);

export const useCreateCompanyModal = () => {
  return useAtom(modalState);
};
