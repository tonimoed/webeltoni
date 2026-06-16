/** Small pill label (e.g. "Nuevo single"). */
export function Badge({
  children,
  tone = "red",
}: {
  children: React.ReactNode;
  tone?: "red" | "amber" | "cream";
}) {
  const tones = {
    red: "bg-red text-white",
    amber: "bg-amber text-ink",
    cream: "bg-cream/15 text-cream",
  } as const;
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
