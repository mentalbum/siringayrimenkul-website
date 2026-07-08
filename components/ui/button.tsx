import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "outline" | "outline-light" | "ghost";

interface CtaButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  external?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-navy shadow-md shadow-gold/25 hover:-translate-y-0.5 hover:bg-gold-dark hover:text-white hover:shadow-lg hover:shadow-gold/30 focus-visible:outline-gold",
  outline:
    "border border-navy text-navy hover:-translate-y-0.5 hover:bg-navy hover:text-white focus-visible:outline-navy",
  "outline-light":
    "border border-white text-white hover:-translate-y-0.5 hover:bg-white hover:text-navy focus-visible:outline-white",
  ghost: "text-navy hover:text-gold-dark focus-visible:outline-navy",
};

export function getCtaButtonClasses(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variantClasses[variant]} ${className}`;
}

export function CtaButton({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
}: CtaButtonProps) {
  const classes = getCtaButtonClasses(variant, className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
