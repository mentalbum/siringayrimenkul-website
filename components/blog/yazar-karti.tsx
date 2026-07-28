import Link from "next/link";
import { PhoneIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

/** Yazı sonu yazar kartı — QRG "içerikten kim sorumlu" sorusunun görünür
 * cevabı. Portre bilinçli yok (gerçek fotoğraf gelene dek baş harf; uydurma
 * görsel kullanılmaz); kanıt yetki belgesi + gerçek iletişim. */
export function YazarKarti() {
  return (
    <aside className="mt-12 rounded-2xl border border-gold/40 bg-surface p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-lg font-semibold text-gold">
          ÖŞ
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-navy">
            <Link href="/hakkimizda#ozgun-sirin" className="hover:text-gold-dark">
              Özgün Şirin
            </Link>
          </p>
          <p className="text-xs text-muted">
            Emlak Danışmanı, {siteConfig.name} · Taşınmaz Ticareti Yetki Belgesi No: 0603771
          </p>
          <p className="mt-2 text-sm leading-relaxed text-body">
            Eryaman&apos;ı ada ve parsel düzeyinde tanır; bu sitedeki rehberler onun
            sorumluluğunda yayımlanır.{" "}
            <Link
              href="/hakkimizda#yontem"
              className="font-semibold text-gold-dark hover:underline"
            >
              İçerik yöntemimiz →
            </Link>
          </p>
          <p className="mt-2 text-sm">
            <a
              href={`tel:${siteConfig.phoneTel}`}
              className="inline-flex items-center gap-1.5 font-semibold text-gold-dark hover:underline"
            >
              <PhoneIcon className="h-3.5 w-3.5" />
              {siteConfig.phoneDisplay}
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}
