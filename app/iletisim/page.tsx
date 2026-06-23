import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { ContactForm } from "@/components/contact/contact-form";
import { MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "İletişim",
  description: `${siteConfig.name} ile iletişime geçin. Telefon: ${siteConfig.phoneDisplay}.`,
};

export default function IletisimPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "İletişim", href: "/iletisim" }]} />

      <header className="mt-4 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">İletişim</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Bize Ulaşın</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman bölgesinde ev almak, kiralamak veya sadece bir mahalle hakkında bilgi almak
          istiyorsanız bize doğrudan ulaşabilirsiniz.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
            <PhoneIcon className="h-5 w-5 shrink-0 text-gold-dark" />
            <div>
              <p className="text-sm font-semibold text-navy">Telefon</p>
              <a
                href={`tel:${siteConfig.phoneTel}`}
                className="text-sm text-body hover:text-gold-dark"
              >
                {siteConfig.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
            <WhatsAppIcon className="h-5 w-5 shrink-0 text-gold-dark" />
            <div>
              <p className="text-sm font-semibold text-navy">WhatsApp</p>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-body hover:text-gold-dark"
              >
                WhatsApp ile yazın
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
            <MapPinIcon className="h-5 w-5 shrink-0 text-gold-dark" />
            <div>
              <p className="text-sm font-semibold text-navy">Ofis Adresimiz</p>
              <p className="text-sm text-body">{siteConfig.officeAddress}</p>
              <a
                href={siteConfig.officeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-block text-sm font-semibold text-gold-dark hover:underline"
              >
                Yol Tarifi Al →
              </a>
            </div>
          </div>
          <CtaButton
            href={siteConfig.sahibindenUrl}
            external
            variant="outline"
            className="w-full justify-center"
          >
            sahibinden.com&apos;daki İlanlarımız
          </CtaButton>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-xl">Mesaj Gönderin</h2>
          <p className="mt-1.5 text-sm text-muted">
            Tüm alanlar zorunludur. Form, mesajınızı WhatsApp üzerinden iletir.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
