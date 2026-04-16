"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileText, Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const fields = [
  { label: "Contratante", value: "CONSORCIO VIAL DEL NORTE S.A.S" },
  { label: "Valor del contrato", value: "$4.250.000.000" },
  { label: "Fecha de inicio", value: "15/03/2025" },
  { label: "Tipo de garantía", value: "Cumplimiento" },
];

export function AiExtraction() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [visibleFields, setVisibleFields] = useState(0);
  const [complete, setComplete] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;
          runAnimation();
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  function runAnimation() {
    // Progress bar
    const duration = 1800;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct * 100);
      if (pct < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Fields appearing one by one
    fields.forEach((_, i) => {
      setTimeout(() => setVisibleFields(i + 1), 800 + i * 500);
    });

    // Completion badge
    setTimeout(() => setComplete(true), 800 + fields.length * 500 + 300);
  }

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-2xl bg-midnight p-6 md:p-8"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-sapphire/15">
          <FileText className="size-5 text-sapphire" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">
            Extracción IA de contratos
          </h3>
          <p className="text-xs text-steel-gray">
            Carga un PDF y deja que la IA haga el resto
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-sapphire transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Extracted fields */}
      <div className="space-y-3 font-(family-name:--font-jetbrains) text-sm">
        {fields.map((field, i) => (
          <div
            key={field.label}
            className={`flex items-baseline gap-2 transition-all duration-500 ${
              i < visibleFields
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
          >
            <span className="text-steel-gray">{field.label}:</span>
            <span className="text-white">{field.value}</span>
          </div>
        ))}
      </div>

      {/* Completion badge */}
      <div
        className={`mt-6 inline-flex items-center gap-2 rounded-full bg-emerald/15 px-4 py-1.5 font-(family-name:--font-jetbrains) text-xs text-emerald transition-all duration-500 ${
          complete
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        }`}
      >
        <Check className="size-3.5" />
        Extracción completada — 2.3s
      </div>
    </div>
  );
}
