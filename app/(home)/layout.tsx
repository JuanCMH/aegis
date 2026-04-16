import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

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
  return (
    <div
      className={`${cormorant.variable} ${jetbrainsMono.variable} landing-noise`}
    >
      {children}
    </div>
  );
}
