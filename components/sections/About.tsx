"use client";

import Image from "next/image";
import { site } from "@/content/site.config";
import { LinkButton } from "@/components/ui/Button";
import { useReveal } from "@/lib/use-reveal";

export function About() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="sobre-mi" className="bg-cream py-[clamp(4rem,10vw,9rem)] text-ink">
      <div
        ref={ref}
        className={`reveal mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:grid-cols-2 ${
          visible ? "is-visible" : ""
        }`}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] shadow-xl md:max-w-md">
          <Image
            src={site.photos.lightBg}
            alt="Retrato de EL TONI con traje crema"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>

        <div>
          <h2 className="font-display text-h2 leading-none text-red-deep">
            Sobre mí
          </h2>
          <p className="mt-6 text-lg leading-relaxed">{site.about}</p>
          <Image
            src="/assets/brand/signature-ink.png"
            alt="Firma de EL TONI"
            width={220}
            height={120}
            className="mt-6 h-auto w-44 opacity-90"
          />
          <div className="mt-6">
            <LinkButton href="#escuchar" variant="secondary">
              Escuchar mi música
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
