"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Shield } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const permissions = [
  { label: "Editar pólizas", key: "editPolicies" },
  { label: "Ver reportes", key: "viewReports" },
  { label: "Invitar usuarios", key: "inviteUsers" },
  { label: "Gestionar roles", key: "manageRoles" },
];

export function RolesPanel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeToggles, setActiveToggles] = useState<Set<string>>(new Set());
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [saved, setSaved] = useState(false);
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
          runSequence();
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  function runSequence() {
    setCursorVisible(true);

    // Step 1: Hover over "Editar pólizas" toggle and activate
    setTimeout(() => {
      setCursorPos({ x: 85, y: 20 });
    }, 400);
    setTimeout(() => {
      setActiveToggles((prev) => new Set(prev).add("editPolicies"));
    }, 900);

    // Step 2: Hover over "Ver reportes" toggle and activate
    setTimeout(() => {
      setCursorPos({ x: 85, y: 44 });
    }, 1400);
    setTimeout(() => {
      setActiveToggles((prev) => new Set(prev).add("viewReports"));
    }, 1900);

    // Step 3: Move to save button
    setTimeout(() => {
      setCursorPos({ x: 50, y: 88 });
    }, 2400);

    // Step 4: Click save
    setTimeout(() => {
      setSaved(true);
    }, 2900);

    // Step 5: Hide cursor
    setTimeout(() => {
      setCursorVisible(false);
    }, 3400);
  }

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-2xl bg-midnight p-6 md:p-8"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-sapphire/15">
          <Shield className="size-5 text-sapphire" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">
            Roles y permisos
          </h3>
          <p className="text-xs text-steel-gray">
            Control granular de acceso por rol
          </p>
        </div>
      </div>

      {/* Permissions grid */}
      <div className="relative">
        {/* Animated cursor */}
        {cursorVisible && (
          <div
            className="pointer-events-none absolute z-20 transition-all duration-500 ease-in-out"
            style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
              className="drop-shadow-lg"
            >
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" />
            </svg>
          </div>
        )}

        <div className="space-y-3 rounded-xl bg-black/30 p-5">
          {permissions.map((perm) => (
            <div
              key={perm.key}
              className="flex items-center justify-between py-1"
            >
              <span className="text-sm text-white/80">{perm.label}</span>
              <div
                className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                  activeToggles.has(perm.key) ? "bg-sapphire" : "bg-white/15"
                }`}
              >
                <div
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ${
                    activeToggles.has(perm.key)
                      ? "translate-x-[22px]"
                      : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className={`rounded-full bg-sapphire px-6 py-2 text-sm font-semibold text-white transition-transform duration-150 ${
              saved ? "scale-95" : ""
            }`}
          >
            Guardar rol
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/15 px-3 py-1 text-xs text-emerald transition-all duration-500">
              <Check className="size-3" />
              Guardado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
