import Link from "next/link";

const tabs = [
  { href: "/siteler", label: "Eryaman Siteleri" },
  { href: "/siteler/yenimahalle", label: "Yenimahalle Siteleri" },
] as const;

export function SitelerTabs({ aktif }: { aktif: (typeof tabs)[number]["href"] }) {
  return (
    <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-px">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={
            tab.href === aktif
              ? "cursor-pointer rounded-t-xl border border-b-0 border-gold bg-gold/10 px-4 py-2 text-sm font-semibold text-gold-dark"
              : "cursor-pointer rounded-t-xl border border-b-0 border-border bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:border-gold hover:text-gold-dark"
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
