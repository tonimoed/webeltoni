"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site.config";
import { AudioToggle } from "@/components/audio/AudioToggle";

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu on hashchange / resize to desktop
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-cream/90 text-ink shadow-sm backdrop-blur" : "text-cream"
      }`}
    >
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3"
      >
        <Link href="#inicio" aria-label={`${site.artist} — inicio`}>
          <Image
            src={scrolled ? "/assets/brand/signature-ink.png" : "/assets/brand/signature-cream.png"}
            alt={site.artist}
            width={909}
            height={932}
            priority
            unoptimized
            className="h-11 w-auto"
          />
        </Link>

        {/* desktop links */}
        <ul className="hidden items-center gap-7 text-sm font-medium md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-red">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <AudioToggle />

          {/* mobile menu button */}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center md:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              {menuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </nav>

      {/* mobile dropdown */}
      {menuOpen && (
        <ul
          id="mobile-menu"
          className="flex flex-col gap-1 border-t border-ink/10 bg-cream px-5 py-3 text-ink md:hidden"
        >
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-3 text-base font-medium hover:text-red"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
