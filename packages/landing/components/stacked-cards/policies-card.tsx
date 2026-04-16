"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const rows = [
  {
    poliza: "POL-2025-0134",
    asegurado: "Carlos Méndez",
    aseguradora: "SURA",
    prima: "$3.450.000",
    estado: "Activa",
    vencimiento: "15/08/2025",
  },
  {
    poliza: "POL-2025-0291",
    asegurado: "María López",
    aseguradora: "Bolívar",
    prima: "$1.820.000",
    estado: "Activa",
    vencimiento: "22/11/2025",
  },
  {
    poliza: "POL-2025-0387",
    asegurado: "Andrés Ruiz",
    aseguradora: "Allianz",
    prima: "$5.100.000",
    estado: "Pendiente",
    vencimiento: "03/06/2025",
  },
  {
    poliza: "POL-2025-0412",
    asegurado: "Laura Torres",
    aseguradora: "Liberty",
    prima: "$2.670.000",
    estado: "Activa",
    vencimiento: "30/09/2025",
  },
  {
    poliza: "POL-2025-0558",
    asegurado: "Diego Vargas",
    aseguradora: "AXA Colpatria",
    prima: "$4.890.000",
    estado: "Renovación",
    vencimiento: "12/07/2025",
  },
];

export function PoliciesCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visibleRows, setVisibleRows] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top 70%",
        once: true,
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;
          rows.forEach((_, i) => {
            setTimeout(() => setVisibleRows(i + 1), i * 400);
          });
        },
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const statusColor = (estado: string) => {
    if (estado === "Activa") return "bg-emerald/15 text-emerald";
    if (estado === "Pendiente") return "bg-amber-warm/15 text-amber-warm";
    return "bg-sapphire/15 text-sapphire";
  };

  return (
    <div ref={cardRef} className="rounded-3xl bg-midnight p-8 md:p-12">
      <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
        Gestión de Pólizas
      </h3>
      <p className="mb-8 text-sm text-steel-gray">
        Todas tus pólizas sincronizadas en tiempo real
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 font-(family-name:--font-jetbrains) text-xs uppercase tracking-wider text-steel-gray">
              <th className="pb-3 pr-4">Póliza</th>
              <th className="pb-3 pr-4">Asegurado</th>
              <th className="hidden pb-3 pr-4 md:table-cell">Aseguradora</th>
              <th className="pb-3 pr-4">Prima</th>
              <th className="pb-3 pr-4">Estado</th>
              <th className="hidden pb-3 sm:table-cell">Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.poliza}
                className={`border-b border-white/5 transition-all duration-500 ${
                  i < visibleRows
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
              >
                <td className="py-3 pr-4 font-(family-name:--font-jetbrains) text-cyan-steel">
                  {row.poliza}
                </td>
                <td className="py-3 pr-4 text-white">{row.asegurado}</td>
                <td className="hidden py-3 pr-4 text-white/70 md:table-cell">
                  {row.aseguradora}
                </td>
                <td className="py-3 pr-4 text-white">{row.prima}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(row.estado)}`}
                  >
                    {row.estado}
                  </span>
                </td>
                <td className="hidden py-3 text-white/60 sm:table-cell">
                  {row.vencimiento}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
