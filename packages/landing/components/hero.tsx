"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-anim]", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="producto"
      className="relative flex min-h-dvh items-center overflow-hidden bg-midnight"
    >
      {/* Radial sapphire glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(30,95,216,0.15),transparent_70%)]" />

      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-midnight to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-16 md:px-12 md:py-32">
        <div className="max-w-3xl">
          {/* Headline */}
          <h1 data-hero-anim className="mb-6">
            <span className="block font-(family-name:--font-outfit) text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              El sistema que protege
            </span>
            <span className="block font-(family-name:--font-cormorant) text-5xl italic leading-tight text-white md:text-6xl lg:text-7xl">
              tu operación
            </span>
          </h1>

          {/* Subtitle */}
          <p
            data-hero-anim
            className="mb-8 max-w-xl text-lg leading-relaxed text-steel-gray md:text-xl"
          >
            Aegis unifica pólizas, clientes y garantías en un solo sistema — con
            IA que lee tus contratos y extrae los datos por ti. Diseñado para
            agencias en Colombia.
          </p>

          {/* Live indicators */}
          <div
            data-hero-anim
            className="mb-10 flex flex-wrap items-center gap-4 font-(family-name:--font-jetbrains) text-xs tracking-wide text-cyan-steel md:text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="inline-block size-2 animate-pulse rounded-full bg-emerald" />
              SISTEMA ACTIVO
            </span>
            <span className="text-white/20">/</span>
            <span>12 agencias en beta</span>
            <span className="text-white/20">/</span>
            <span>Colombia · LATAM</span>
          </div>

          {/* CTAs */}
          <div data-hero-anim className="flex flex-wrap gap-4">
            <a
              href="#acceso"
              className="relative inline-flex overflow-hidden rounded-full bg-sapphire px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-sapphire/25 active:scale-[0.97] before:absolute before:inset-0 before:z-0 before:-translate-x-full before:bg-white/15 before:transition-transform before:duration-300 hover:before:translate-x-0"
            >
              <span className="relative z-10">Solicitar acceso anticipado</span>
            </a>
            <a
              href="#funcionalidades"
              className="inline-flex rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:border-white/40 hover:bg-white/5 active:scale-[0.97]"
            >
              Ver demo en vivo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
