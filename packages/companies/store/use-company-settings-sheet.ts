"use client";

import { atom, useAtom } from "jotai";

const companySettingsSheetState = atom(false);

export const useCompanySettingsSheet = () => useAtom(companySettingsSheetState);
