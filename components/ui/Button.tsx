"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[1.25rem] px-7 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors min-h-11 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-red text-white hover:bg-red-hover",
  secondary: "border border-ink/30 text-ink hover:border-ink hover:bg-ink/5",
  ghost: "text-cream/90 hover:text-white",
};

interface CommonProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

interface LinkButtonProps extends CommonProps {
  href: string;
  /** open in a new tab (outbound) — adds rel="noopener" automatically */
  external?: boolean;
  trackEvent?: Parameters<typeof track>;
}

interface ActionButtonProps extends CommonProps {
  onClick: () => void;
  type?: "button" | "submit";
  ariaLabel?: string;
}

export function LinkButton({
  href,
  external,
  trackEvent,
  variant = "primary",
  className = "",
  children,
}: LinkButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;
  const handleClick = () => {
    if (trackEvent) track(...trackEvent);
  };

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} onClick={handleClick}>
      {children}
    </Link>
  );
}

export function ActionButton({
  onClick,
  type = "button",
  ariaLabel,
  variant = "primary",
  className = "",
  children,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
