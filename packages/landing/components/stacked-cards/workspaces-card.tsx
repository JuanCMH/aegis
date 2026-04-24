"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const workspaces = [
  { name: "Agencia Norte", color: "#1E5FD8", x: 15, y: 30 },
  { name: "Seguros del Valle", color: "#10B981", x: 50, y: 60 },
  { name: "Broker Central", color: "#F59E0B", x: 85, y: 25 },
];

export function WorkspacesCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visibleWs, setVisibleWs] = useState(0);
  const [dotPos, setDotPos] = useState({ x: 15, y: 30 });
  const [dotVisible, setDotVisible] = useState(false);
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

          // Show workspaces one by one
          workspaces.forEach((_, i) => {
            setTimeout(() => setVisibleWs(i + 1), i * 500);
          });

          // Show dot and animate between workspaces
          setTimeout(() => {
            setDotVisible(true);
            setDotPos({ x: 15, y: 30 });
          }, 1800);

          setTimeout(() => setDotPos({ x: 50, y: 60 }), 2500);
          setTimeout(() => setDotPos({ x: 85, y: 25 }), 3500);
          setTimeout(() => setDotPos({ x: 50, y: 60 }), 4500);
        },
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={cardRef} className="rounded-3xl bg-midnight p-8 md:p-12">
      <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
        Multi-Workspace
      </h3>
      <p className="mb-8 text-sm text-steel-gray">
        Un usuario, múltiples agencias — sin cambiar de cuenta
      </p>

      {/* Workspace islands */}
      <div className="relative mx-auto h-64 max-w-lg md:h-80">
        {/* Connection lines (SVG) */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M15,30 Q32,50 50,60"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.3"
            strokeDasharray="1,1"
          />
          <path
            d="M50,60 Q67,40 85,25"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.3"
            strokeDasharray="1,1"
          />
          <path
            d="M15,30 Q50,20 85,25"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.3"
            strokeDasharray="1,1"
          />
        </svg>

        {/* Workspace nodes */}
        {workspaces.map((ws, i) => (
          <div
            key={ws.name}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
              i < visibleWs ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
            style={{ left: `${ws.x}%`, top: `${ws.y}%` }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex size-14 items-center justify-center rounded-2xl border border-white/10 md:size-16"
                style={{ backgroundColor: `${ws.color}20` }}
              >
                <div
                  className="size-6 rounded-lg md:size-7"
                  style={{ backgroundColor: ws.color }}
                />
              </div>
              <span className="whitespace-nowrap text-xs font-medium text-white/80">
                {ws.name}
              </span>
            </div>
          </div>
        ))}

        {/* Animated user dot */}
        {dotVisible && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out"
            style={{ left: `${dotPos.x}%`, top: `${dotPos.y}%` }}
          >
            <div className="relative">
              <div className="size-4 rounded-full bg-white shadow-lg shadow-white/30" />
              <div className="absolute inset-0 animate-ping rounded-full bg-white/40" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
