import type { FaqItem } from "@/lib/faq";

export function FaqSection({ title, items }: { title: string; items: FaqItem[] }) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.soru,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.cevap,
      },
    })),
  };

  return (
    <section className="mt-14">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-surface">
        {items.map((item) => (
          <details key={item.soru} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-navy [&::-webkit-details-marker]:hidden">
              {item.soru}
              <span className="shrink-0 text-lg leading-none text-gold-dark transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-body">{item.cevap}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
