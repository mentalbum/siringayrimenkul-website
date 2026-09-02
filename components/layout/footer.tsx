import Image from "next/image";
import Link from "next/link";
import { hizmetNav, mainNav, siteConfig } from "@/lib/site-config";
import { getAllEtaplar, getAllMahalleler, getYayindaMahalleler } from "@/lib/content";
import { CtaButton } from "@/components/ui/button";
import { TrackedLink } from "@/components/ui/tracked-link";
import {
  FacebookIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  TiktokIcon,
} from "@/components/ui/icons";

/* ETAP BAĞLARI — modül düzeyinde BİR KEZ hesaplanır.
 *
 * Neden önbellek: footer her sayfada render ediliyor ve getAllEtaplar() mahalle
 * başına o mahallenin TÜM site JSON'larını okuyor. Ölçtüm (2026-08-08): 723
 * kaydın tam taraması 146 ms; sitedeki 1594 sayfayla çarpınca derlemeye ~4
 * dakika ekliyordu. Etap listesi derleme boyunca değişmediği için tek seferlik
 * hesap yeterli.
 *
 * Neden footer'da: etap sayfaları sitenin en zayıf bağlanan ailesiydi — menüde
 * ve footer'da hiç bağ yoktu, gelen iç bağların %57-77'si ise ada
 * sayfalarındandı (canonical'ı site sayfasını gösteren, priority 0.2'li
 * sayfalar). Tarama bütçesi darboğazında elde kalan kotasız kaldıraç iç bağ
 * yoğunluğu (bkz. lib/tarama-oncelikli.ts'teki aynı teşhis).
 *
 * Hub (/etaplar) 71553a8 ile yayına girdi ve listeye eklendi: mahalleden
 * bağımsız "eryaman etapları" / "eryaman etap haritası" aramalarının hedefi o
 * sayfa ve tek iç bağı /mahalleler'den geliyordu. Çocuk etap sayfalarına
 * DOĞRUDAN bağ veriliyor, hub üzerinden değil — tarama bütçesi darboğazında
 * beş sayfayı hub'ın arkasına saklamak keşfi bir adım geciktirirdi. */
let etapBaglariCache: { no: string; mahalleSlug: string }[] | null = null;

function etapBaglari() {
  etapBaglariCache ??= getYayindaMahalleler()
    .flatMap((mahalle) =>
      getAllEtaplar(mahalle.slug).map((etap) => ({ no: etap.no, mahalleSlug: mahalle.slug }))
    )
    .sort((a, b) => Number(a.no) - Number(b.no));
  return etapBaglariCache;
}

export function Footer() {
  const mahalleler = getAllMahalleler();
  const etaplar = etapBaglari();

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Link href="/" aria-label="Şirin Gayrimenkul anasayfa">
            <Image
              src="/brand/sirin-logo-on-dark.png"
              alt={siteConfig.name}
              width={480}
              height={233}
              className="h-12 w-auto"
            />
          </Link>
          {/* siteConfig.description'ın elle kurulmuş hâli: iç link denetimi
              (2026-08-08) ana sayfaya giden tek çapanın "Anasayfa" olduğunu
              gösterdi — buradaki cümle site genelinde "/"ye tematik çapa taşıyan
              tek yer. Metin description ile eş anlamlı tutulmalı. */}
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            {/* Çapa iyeliksiz kuruldu (2026-08-08): "emlakçısı" biçimi aranan
                tam diziyi ("eryaman emlakçı") kırıyordu. Beklenti düşük — site
                geneli footer linkleri ağır iskonto edilir — bu bir tutarlılık
                düzeltmesi, sıralama kaldıracı değil. */}
            <Link href="/" className="font-medium text-white/90 hover:text-gold">
              Eryaman emlakçı arayanlar için Şirin Gayrimenkul
            </Link>{" "}
            — Eryaman&apos;daki 500&apos;den fazla site ve rezidansı tapu sınırlarıyla
            haritalayan yerel rehberiniz. Evinizi satarken ya da kiraya verirken
            fiyatı birlikte belirleyelim.
          </p>
        </div>

        <div>
          {/* p + role="heading", h2 değil: footer başlıkları her sayfaya 4 jenerik
              H2 ekleyip sayfanın kendi başlık hiyerarşisini sulandırıyordu;
              ARIA rolü ekran okuyucunun başlık gezinmesini koruyor (2026-08-08).
              font-heading ELLE gerekli: globals.css marka fontunu yalnız h1..h6'ya
              veriyor, p'ye vermiyor — sınıf düşerse başlıklar gövde fontuna kayar. */}
          <p
            role="heading"
            aria-level={2}
            className="font-heading text-sm font-semibold uppercase tracking-wide text-gold"
          >
            Hızlı Bağlantılar
          </p>
          <ul className="mt-4 space-y-2.5">
            {hizmetNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-semibold text-gold/90 hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-white/80 hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p
            role="heading"
            aria-level={2}
            className="font-heading text-sm font-semibold uppercase tracking-wide text-gold"
          >
            İletişim
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a
                href={siteConfig.officeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                {siteConfig.officeAddress}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 shrink-0 text-gold" />
              <TrackedLink
                href={`tel:${siteConfig.phoneTel}`}
                gaEvent="phone_click" gaParams={{ konum: "footer" }}
                className="hover:text-gold"
              >
                {siteConfig.phoneDisplay}
              </TrackedLink>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 shrink-0 text-gold" />
              <TrackedLink
                href={siteConfig.whatsappUrl}
                gaEvent="whatsapp_click"
                openInNewTab
                className="hover:text-gold"
              >
                WhatsApp ile yazın
              </TrackedLink>
            </li>
            <li className="pl-6 text-white/60">
              Pzt–Cmt 09:00–19:00 · Paz 09:00–17:00
            </li>
          </ul>
          <CtaButton href={siteConfig.sahibindenUrl} external variant="primary" className="mt-5">
            İlanlarımız — sahibinden.com
          </CtaButton>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={siteConfig.yandexMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Yandex Haritalar'da görüntüle"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:text-gold"
            >
              <MapPinIcon className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok'ta takip edin"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:text-gold"
            >
              <TiktokIcon className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram'da takip edin"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:text-gold"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook'ta takip edin"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:text-gold"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p
            role="heading"
            aria-level={2}
            className="font-heading text-sm font-semibold uppercase tracking-wide text-gold"
          >
            Eryaman Mahalleleri
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
            {mahalleler
              .filter((mahalle) => mahalle.ilce === "Etimesgut")
              .map((mahalle) => (
                <li key={mahalle.slug}>
                  <Link
                    href={`/mahalleler/${mahalle.slug}`}
                    className="text-sm text-white/70 hover:text-gold"
                  >
                    {mahalle.isim.replace(/\s*Mahallesi$/, "")}
                  </Link>
                </li>
              ))}
          </ul>
          {etaplar.length > 0 && (
            <>
              <p
                role="heading"
                aria-level={2}
                className="mt-6 font-heading text-sm font-semibold uppercase tracking-wide text-gold"
              >
                Eryaman Etapları
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
                {etaplar.map((etap) => (
                  <li key={etap.no}>
                    <Link
                      href={`/mahalleler/${etap.mahalleSlug}/etaplar/${etap.no}`}
                      className="text-sm text-white/70 hover:text-gold"
                    >
                      {etap.no}. Etap
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/etaplar" className="text-sm text-gold/90 hover:text-gold">
                    Etap Haritası
                  </Link>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/60 sm:px-6">
        © {new Date().getFullYear()} {siteConfig.name}. Tüm hakları saklıdır. · Taşınmaz Ticareti
        Yetki Belgesi No: 0603771 ·{" "}
        <Link href="/gizlilik" className="underline-offset-2 hover:text-gold hover:underline">
          Gizlilik ve KVKK
        </Link>
      </div>
    </footer>
  );
}
