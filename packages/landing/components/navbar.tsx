"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AegisLogo } from "@/components/logo";

const navLinks = [
  { label: "Producto", href: "#producto" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Precios", href: "#precios" },
  { label: "Para agencias", href: "#agencias" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-6 inset-x-0 z-60 px-4">
      <div
        className={`mx-auto max-w-4xl rounded-full px-6 py-3 flex items-center justify-between transition-all duration-400 ease-in-out ${
          scrolled
            ? "bg-midnight/85 backdrop-blur-xl border border-sapphire/30 shadow-lg shadow-midnight/20"
            : "bg-transparent border border-transparent"
        }`}
      >
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="shrink-0"
        >
          <AegisLogo className="h-7 w-auto brightness-0 invert" />
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="#acceso"
          onClick={(e) => handleNavClick(e, "#acceso")}
          className="hidden md:inline-flex relative overflow-hidden rounded-full bg-sapphire px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-sapphire/25 before:absolute before:inset-0 before:z-0 before:-translate-x-full before:bg-white/15 before:transition-transform before:duration-300 hover:before:translate-x-0"
        >
          <span className="relative z-10">Solicitar acceso</span>
        </a>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white p-1"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden mx-auto max-w-4xl mt-2 rounded-2xl overflow-hidden transition-all duration-400 ease-in-out ${
          mobileOpen
            ? "max-h-80 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        } bg-midnight/90 backdrop-blur-xl border border-sapphire/30`}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-white/80 hover:text-white py-2.5 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#acceso"
            onClick={(e) => handleNavClick(e, "#acceso")}
            className="relative overflow-hidden mt-2 rounded-full bg-sapphire px-5 py-2.5 text-center text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-sapphire/25 before:absolute before:inset-0 before:z-0 before:-translate-x-full before:bg-white/15 before:transition-transform before:duration-300 hover:before:translate-x-0"
          >
            <span className="relative z-10">Solicitar acceso</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
