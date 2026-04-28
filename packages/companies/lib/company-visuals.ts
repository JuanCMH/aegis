/**
 * Visual hash → gradient palette used for the agency placeholder when no
 * logo is uploaded. Mirrors the chip used in `CompanySwitcher` so the
 * placeholder is recognisable across the app.
 */
export function gradientForName(name?: string): string {
  if (!name) return "from-aegis-sapphire/30 to-aegis-sapphire/5";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const palettes = [
    "from-aegis-sapphire/30 to-aegis-sapphire/5",
    "from-emerald-500/30 to-emerald-500/5",
    "from-amber-500/30 to-amber-500/5",
    "from-rose-500/30 to-rose-500/5",
    "from-violet-500/30 to-violet-500/5",
    "from-cyan-500/30 to-cyan-500/5",
  ];
  return palettes[hash % palettes.length];
}

export function initialOf(name?: string): string {
  if (!name) return "·";
  return name.trim().charAt(0).toUpperCase();
}
