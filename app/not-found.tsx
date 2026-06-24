import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { CtaButton } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { MapPinIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
        <MapPinIcon className="h-6 w-6 text-gold-dark" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-gold-dark">404</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Bu Sayfayı Bulamadık</h1>
      <p className="mt-4 text-base leading-relaxed text-body">
        Aradığınız mahalle, site veya sayfa kaldırılmış ya da hiç var olmamış olabilir. Eryaman
        bölgesindeki mahalleleri aşağıdan inceleyebilir veya doğrudan bizimle iletişime
        geçebilirsiniz.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <CtaButton href="/mahalleler" variant="primary">
          Mahalleleri İncele
        </CtaButton>
        <CtaButton href="/" variant="outline">
          Anasayfa
        </CtaButton>
        <TrackedCtaLink href={`tel:${siteConfig.phoneTel}`} gaEvent="phone_click" variant="outline">
          Bizi Arayın
        </TrackedCtaLink>
      </div>
    </div>
  );
}
