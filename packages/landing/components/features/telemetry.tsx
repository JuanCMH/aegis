"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const messages = [
  "> Procesando póliza #POL-2025-0847...",
  "> Cliente verificado: CC 1.234.567.890",
  "> Prima calculada: $2.340.000 COP",
  "> Asignando al equipo de Bogotá...",
  "> Renovación programada: 45 días restantes",
];

export function Telemetry() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => setStarted(true),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Typing effect
  useEffect(() => {
    if (!started) return;

    const msg = messages[messageIndex];
    let charIndex = 0;
    setDisplayedText("");

    function typeNext() {
      if (charIndex <= msg.length) {
        setDisplayedText(msg.slice(0, charIndex));
        charIndex++;
        typingRef.current = setTimeout(typeNext, 30);
      }
    }

    typeNext();

    // Rotate to next message
    intervalRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, messageIndex]);

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-2xl bg-midnight p-6 md:p-8"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">
          Telemetría del workspace
        </h3>
        <span className="flex items-center gap-2 font-(family-name:--font-jetbrains) text-xs text-emerald">
          <span className="inline-block size-2 animate-pulse rounded-full bg-emerald" />
          EN VIVO
        </span>
      </div>

      {/* Terminal */}
      <div className="min-h-[120px] rounded-xl bg-black/40 p-5 font-(family-name:--font-jetbrains) text-sm leading-relaxed text-cyan-steel">
        <span>{displayedText}</span>
        <span className="inline-block w-2 animate-pulse text-cyan-steel">
          ▊
        </span>
      </div>

      {/* Status bar */}
      <div className="mt-4 flex items-center justify-between font-(family-name:--font-jetbrains) text-xs text-steel-gray">
        <span>aegis://workspace/logs</span>
        <span>
          {messageIndex + 1}/{messages.length}
        </span>
      </div>
    </div>
  );
}
