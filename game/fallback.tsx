"use client";

import { site } from "@/content/site.config";
import { ProductPopup } from "@/components/ui/ProductPopup";

/**
 * Accessible, non-game purchase path (build spec §8 fallback).
 * Buying MUST work without the canvas: keyboard, screen reader,
 * reduced-motion, reduced-data, or canvas-init failure all land here.
 */
export function MerchFallback() {
  return (
    <div
      data-testid="merch-fallback"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {site.merch.products.map((product) => (
        <ProductPopup key={product.id} product={product} variant="card" />
      ))}
    </div>
  );
}
