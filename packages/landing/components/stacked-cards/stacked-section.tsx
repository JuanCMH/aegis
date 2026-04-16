"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PoliciesCard } from "./policies-card";
import { QuotesCard } from "./quotes-card";
import { WorkspacesCard } from "./workspaces-card";

gsap.registerPlugin(ScrollTrigger);

export function StackedSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Disable pinning on mobile — it causes scroll jank
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-stacked-card]");

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;

        if (isMobile) {
          // Simple fade-up on mobile instead of pin
          gsap.from(card, {
            y: 30,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              once: true,
            },
          });
        } else {
          ScrollTrigger.create({
            trigger: card,
            start: "top 15%",
            endTrigger: cards[i + 1],
            end: "top 15%",
            pin: true,
            pinSpacing: false,
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(card, {
                scale: 1 - progress * 0.08,
                filter: `blur(${progress * 16}px)`,
                opacity: 1 - progress * 0.6,
              });
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-ice py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-graphite md:text-4xl">
            Archivo de funcionalidades
          </h2>
        </div>

        <div className="space-y-8">
          <div data-stacked-card>
            <PoliciesCard />
          </div>
          <div data-stacked-card>
            <QuotesCard />
          </div>
          <div data-stacked-card>
            <WorkspacesCard />
          </div>
        </div>
      </div>
    </section>
  );
}
