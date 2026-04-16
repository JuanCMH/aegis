"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: "Básico",
    audience: "Agentes independientes",
    price: "$0",
    period: "/ mes",
    features: [
      "1 workspace",
      "Hasta 50 pólizas",
      "Gestión de clientes",
      "Cotizaciones básicas",
    ],
    highlighted: false,
  },
  {
    name: "Profesional",
    audience: "Agencias medianas",
    price: "$149.000",
    period: "COP / mes",
    features: [
      "Workspaces ilimitados",
      "Pólizas ilimitadas",
      "Extracción IA de contratos",
      "Roles y permisos",
      "Reportes avanzados",
      "Soporte prioritario",
    ],
    highlighted: true,
    badge: "MÁS POPULAR",
  },
  {
    name: "Empresa",
    audience: "Grandes corredores",
    price: "A convenir",
    period: "",
    features: [
      "Todo en Profesional",
      "Onboarding dedicado",
      "API personalizada",
      "SLA garantizado",
      "Integraciones a medida",
    ],
    highlighted: false,
  },
];

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-pricing-card]", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="precios" className="bg-ice py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-graphite md:text-4xl lg:text-5xl">
            Elige el plan de tu agencia
          </h2>
        </div>

        <div className="grid items-center gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              data-pricing-card
              className={`relative overflow-hidden rounded-3xl p-8 transition-transform duration-300 ${
                plan.highlighted
                  ? "bg-midnight md:scale-[1.03] text-white shadow-2xl shadow-midnight/30 md:p-10"
                  : "bg-white text-graphite border border-slate-soft"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <span className="absolute top-6 right-6 rounded-full bg-sapphire px-3 py-1 text-xs font-bold tracking-wide text-white">
                  {plan.badge}
                </span>
              )}

              <p
                className={`text-sm font-medium ${plan.highlighted ? "text-cyan-steel" : "text-steel-gray"}`}
              >
                {plan.audience}
              </p>
              <h3 className="mt-1 text-xl font-bold">{plan.name}</h3>

              <div className="mt-6 mb-8">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && (
                  <span
                    className={`ml-1 text-sm ${plan.highlighted ? "text-white/60" : "text-steel-gray"}`}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check
                      className={`size-4 shrink-0 ${plan.highlighted ? "text-emerald" : "text-sapphire"}`}
                    />
                    <span
                      className={
                        plan.highlighted ? "text-white/80" : "text-steel-gray"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#acceso"
                className={`block w-full rounded-full py-3 text-center text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${
                  plan.highlighted
                    ? "bg-sapphire text-white hover:shadow-lg hover:shadow-sapphire/25"
                    : "bg-graphite text-white hover:bg-graphite/90"
                }`}
              >
                {plan.price === "A convenir" ? "Contactar ventas" : "Solicitar acceso"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
