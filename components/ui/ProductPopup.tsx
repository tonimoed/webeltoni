"use client";

import Image from "next/image";
import { useState } from "react";
import { formatPrice, type MerchProduct } from "@/content/site.config";
import { track } from "@/lib/analytics";
import { ActionButton, LinkButton } from "./Button";

/**
 * Product card / popup shared by the accessible fallback and the tavern game.
 * - buyUrl present  -> "Comprar" links out (new tab)
 * - buyUrl empty    -> "Comprar" reveals a "Próximamente" + email-capture state
 */
export function ProductPopup({
  product,
  onClose,
  variant = "card",
}: {
  product: MerchProduct;
  onClose?: () => void;
  variant?: "card" | "overlay";
}) {
  const [showSoon, setShowSoon] = useState(false);
  const [email, setEmail] = useState("");
  const [captured, setCaptured] = useState(false);

  const hasStore = product.buyUrl.trim().length > 0;

  function handleBuy() {
    track("merch_buy_click", { product: product.id });
    if (!hasStore) setShowSoon(true);
  }

  function handleCapture(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    // No backend yet: persist locally so a real list can be wired later.
    try {
      window.localStorage.setItem(`eltoni:waitlist:${product.id}`, email);
    } catch {
      /* ignore */
    }
    setCaptured(true);
  }

  const card = (
    <div
      className="relative w-full max-w-sm overflow-hidden rounded-[1.25rem] bg-cream text-ink shadow-2xl"
      role="group"
      aria-label={product.name}
      data-testid={`product-${product.id}`}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-cream hover:bg-red"
        >
          ✕
        </button>
      )}

      <div className="relative aspect-square w-full bg-white">
        <Image
          src={product.image}
          alt={`Producto: ${product.name}`}
          fill
          sizes="(max-width: 640px) 90vw, 384px"
          className="object-contain"
        />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
        <p className="text-sm text-muted">{product.desc}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-red-deep" data-testid="product-price">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs uppercase tracking-wide text-muted">
            Tallas {product.sizes.join(" · ")}
          </span>
        </div>

        {!showSoon ? (
          hasStore ? (
            <LinkButton
              href={product.buyUrl}
              external
              trackEvent={["merch_buy_click", { product: product.id }]}
              className="w-full"
            >
              Comprar
            </LinkButton>
          ) : (
            <ActionButton onClick={handleBuy} className="w-full" ariaLabel="Comprar">
              Comprar
            </ActionButton>
          )
        ) : captured ? (
          <p className="rounded-lg bg-amber/20 p-3 text-center text-sm font-medium">
            ¡Hecho! Te avisamos cuando salga a la venta.
          </p>
        ) : (
          <form onSubmit={handleCapture} className="space-y-2">
            <p className="text-sm font-medium">
              Próximamente. Déjanos tu email y te avisamos.
            </p>
            <label className="sr-only" htmlFor={`waitlist-${product.id}`}>
              Tu email
            </label>
            <div className="flex gap-2">
              <input
                id={`waitlist-${product.id}`}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="min-h-11 flex-1 rounded-lg border border-ink/20 bg-white px-3 text-sm"
              />
              <ActionButton onClick={() => {}} type="submit" ariaLabel="Avísame">
                Avísame
              </ActionButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  if (variant === "overlay") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>{card}</div>
      </div>
    );
  }

  return card;
}
