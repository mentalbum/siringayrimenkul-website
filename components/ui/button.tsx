import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

interface CtaButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  external?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-gold text-navy hover:bg-gold-dark focus-visible:outline-gold",
  outline:
    "border border-navy text-navy hover:bg-navy hover:text-white focus-visible:outline-navy",
  ghost: "text-navy hover:text-gold-dark focus-visible:outline-navy",
};

export function CtaButton({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
}: CtaButtonProps) {
  const classes = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variantClasses[variant]} ${className}`;

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
