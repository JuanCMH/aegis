import { AegisLogo } from "@/components/aegis/aegis-logo";

const productLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Precios", href: "#precios" },
  { label: "Para agencias", href: "#agencias" },
  { label: "Changelog", href: "#" },
];

const legalLinks = [
  { label: "Términos de servicio", href: "#" },
  { label: "Política de privacidad", href: "#" },
  { label: "Tratamiento de datos", href: "#" },
];

const contactLinks = [
  { label: "soporte@aegis.co", href: "mailto:soporte@aegis.co" },
  { label: "LinkedIn", href: "#" },
];

export function Footer() {
  return (
    <footer className="rounded-t-[2.5rem] bg-midnight">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-8 md:px-12">
        {/* Grid */}
        <div className="mb-16 grid gap-10 md:grid-cols-4">
          {/* Logo + tagline */}
          <div className="md:col-span-1">
            <AegisLogo className="mb-4 h-8 w-auto brightness-0 invert" />
            <p className="text-sm leading-relaxed text-steel-gray">
              Aegis — El escudo digital de tu agencia.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Producto
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-steel-gray transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-steel-gray transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Contacto
            </h4>
            <ul className="space-y-2.5">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-steel-gray transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-(family-name:--font-jetbrains) text-xs text-steel-gray">
            <span className="inline-block size-2 animate-pulse rounded-full bg-emerald" />
            <span>SISTEMA OPERATIVO — ACTIVO</span>
          </div>
          <p className="font-(family-name:--font-jetbrains) text-xs text-steel-gray">
            aegis.co · Bogotá, Colombia
          </p>
        </div>
      </div>
    </footer>
  );
}
