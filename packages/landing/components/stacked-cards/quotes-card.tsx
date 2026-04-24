"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const insurers = [
  { name: "SURA", price: "$1.247.500", pct: 85 },
  { name: "Bolívar", price: "$1.380.000", pct: 72 },
  { name: "Allianz", price: "$1.520.000", pct: 60 },
];

export function QuotesCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showPrice, setShowPrice] = useState(false);
  const [barWidths, setBarWidths] = useState<number[]>([0, 0, 0]);
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

          // Animate bars
          setTimeout(() => {
            setBarWidths(insurers.map((ins) => ins.pct));
          }, 400);

          // Show price
          setTimeout(() => {
            setShowPrice(true);
          }, 1200);
        },
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={cardRef} className="rounded-3xl bg-midnight p-8 md:p-12">
      <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
        Cotizaciones de Garantías
      </h3>
      <p className="mb-8 text-sm text-steel-gray">
        Compara y cotiza garantías al instante
      </p>

      {/* Waveform / pulse line */}
      <div className="mb-8 flex items-center justify-center">
        <svg
          viewBox="0 0 400 60"
          className="h-16 w-full max-w-md"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 Q25,30 50,30 T100,20 T150,40 T200,15 T250,45 T300,25 T350,35 T400,30"
            fill="none"
            stroke="#0FB8C9"
            strokeWidth="2"
            className="animate-pulse"
          />
          {showPrice && (
            <circle
              cx="350"
              cy="35"
              r="4"
              fill="#10B981"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Price reveal */}
      <div
        className={`mb-10 text-center transition-all duration-700 ${
          showPrice ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <span className="font-(family-name:--font-jetbrains) text-3xl font-bold text-white md:text-4xl">
          $1.247.500 COP
        </span>
        <p className="mt-1 text-sm text-steel-gray">Mejor tarifa encontrada</p>
      </div>

      {/* Insurer comparison */}
      <div className="space-y-4">
        {insurers.map((ins, i) => (
          <div key={ins.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-white">{ins.name}</span>
              <span className="font-(family-name:--font-jetbrains) text-cyan-steel">
                {ins.price}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-sapphire transition-all duration-1000 ease-out"
                style={{ width: `${barWidths[i]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
