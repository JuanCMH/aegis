import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aegis — La plataforma que los seguros siempre merecieron",
  description:
    "Aegis centraliza pólizas, clientes y garantías en un solo sistema — con IA que lee tus contratos y extrae los datos por ti. Diseñado para agencias en Colombia.",
  keywords: [
    "seguros",
    "pólizas",
    "garantías",
    "cotizaciones",
    "agencias de seguros",
    "Colombia",
    "gestión de seguros",
    "IA",
  ],
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="landing-noise">{children}</div>;
}
