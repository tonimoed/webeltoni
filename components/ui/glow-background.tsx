/**
 * Soft radial-glow background (white base + a single coloured glow, multiply-
 * blended) — adapted from the shadcn "background-components" snippet. Renders an
 * absolute layer meant to sit as the first child of a `relative` section.
 *
 * Default glow is EL TONI red so page 3 keeps following page 2; pass `color`
 * to switch (e.g. "#e8a33d" amber, "#FF7112" orange).
 */
export function GlowBackground({
  color = "#a4161a",
  opacity = 0.22,
  className = "",
}: {
  color?: string;
  opacity?: number;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 z-0 bg-white ${className}`} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          opacity,
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}

export default GlowBackground;
