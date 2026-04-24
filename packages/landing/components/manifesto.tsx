"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const firstParagraph =
  "Las agencias de seguros en Colombia administran millones en pólizas en hojas de cálculo.";
const secondParagraph = "Aegis es el sistema que ese dinero merece.";

function SplitWords({ text, className }: { text: string; className: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          data-manifesto-word
          className={`inline-block opacity-0 ${className}`}
        >
          {word}&nbsp;
        </span>
      ))}
    </>
  );
}

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>("[data-manifesto-word]");

      gsap.to(words, {
        opacity: 1,
        y: 0,
        stagger: 0.04,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          once: true,
        },
      });

      // Set initial state
      gsap.set(words, { opacity: 0, y: 10 });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-midnight py-32 md:py-40"
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,95,216,0.08),transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-12">
        <p className="mb-8 text-xl leading-relaxed md:text-2xl">
          <SplitWords text={firstParagraph} className="text-steel-gray" />
        </p>
        <p className="text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl">
          <SplitWords text={secondParagraph} className="text-white" />
        </p>
      </div>
    </section>
  );
}
