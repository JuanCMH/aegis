"use client";

import { atom, useAtom } from "jotai";

const commandPaletteOpenAtom = atom(false);

export const useCommandPalette = () => useAtom(commandPaletteOpenAtom);
