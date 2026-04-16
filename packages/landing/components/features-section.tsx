"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AiExtraction } from "./features/ai-extraction";
import { Telemetry } from "./features/telemetry";
import { RolesPanel } from "./features/roles-panel";

gsap.registerPlugin(ScrollTrigger);

export function FeaturesSection() {
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }, titleRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="funcionalidades" className="bg-ice py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {/* Section title */}
        <div ref={titleRef} className="mb-16 max-w-lg">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-graphite md:text-4xl lg:text-5xl">
            Una plataforma.
            <br />
            <span className="text-sapphire">Toda tu operación.</span>
          </h2>
        </div>

        {/* Feature panels */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* AI Extraction — full width on first row */}
          <div className="md:col-span-2">
            <AiExtraction />
          </div>

          {/* Telemetry + Roles side by side */}
          <Telemetry />
          <RolesPanel />
        </div>
      </div>
    </section>
  );
}
