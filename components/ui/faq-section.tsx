import type { FaqItem } from "@/lib/faq";
import { Reveal } from "@/components/ui/reveal";

export function FaqSection({
  title,
  items,
  className,
}: {
  title: string;
  items: FaqItem[];
  className?: string;
}) {
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
    <section className={className ?? "mt-14"}>
      <Reveal>
      <h2 className="text-xl">{title}</h2>
      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-surface">
        {items.map((item) => (
          <details key={item.soru} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-navy transition-colors duration-200 hover:text-gold-dark [&::-webkit-details-marker]:hidden">
              {item.soru}
              <span className="shrink-0 text-lg leading-none text-gold-dark transition-transform duration-300 ease-out group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="faq-cevap mt-3 text-sm leading-relaxed text-body">{item.cevap}</p>
          </details>
        ))}
      </div>
      </Reveal>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
