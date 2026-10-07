import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { getAllMahalleler, getSitelerByMahalle } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { organizationRef, ozgunPersonJsonLd } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { TrackedLink } from "@/components/ui/tracked-link";
import {
  BuildingIcon,
  CheckBadgeIcon,
  CubeIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { ReviewBadge } from "@/components/ui/review-badge";

const YETKI_BELGESI_NO = "0603771";
/** Ticaret Bakanlığı TTBS belge sorgu ekranı (07.10'da 200 döndüğü doğrulandı). */
const YETKI_BELGESI_SORGU = "https://ttbs.gtb.gov.tr/Home/BelgeSorgula";

export const metadata: Metadata = {
  title: "Hakkımızda — Eryaman'ın Yerel Emlak Ofisi",
  description: `${siteConfig.name}: Eryaman'da evinizi doğru fiyatla satmanız ya da kiraya vermeniz için yanınızda olan yerel emlak ofisi. 0532 363 96 60`,
  alternates: { canonical: "/hakkimizda" },
};

const adimlar = [
  {
    icon: MapPinIcon,
    baslik: "Mahalle Mahalle Tanıyoruz",
    aciklama:
      "Eryaman bölgesindeki her mahalleyi; ulaşımı, yaşam koşulları ve site/rezidans çeşitliliğiyle birlikte detaylı şekilde rehberleştiriyoruz.",
  },
  {
    icon: CheckBadgeIcon,
    baslik: "Doğrudan ve Şeffaf İletişim",
    aciklama:
      "Sorularınızı aracısız, doğrudan bizimle paylaşın; telefon veya WhatsApp üzerinden hızlı dönüş alın.",
  },
  {
    icon: BuildingIcon,
    baslik: "Güncel İlanlar sahibinden.com'da",
    aciklama:
      "Sitemiz bir ilan panosu değil, bölge rehberidir. Güncel satılık/kiralık ilanlarımızı sahibinden.com üzerindeki mağazamızdan takip edebilirsiniz.",
  },
  {
    icon: CubeIcon,
    baslik: "Profesyonel Sanal Tur Hizmeti",
    aciklama:
      "Talep eden müşterilerimiz için 3D sanal tur çekimi de sunuyoruz; bir örneğini aşağıdan inceleyebilirsiniz.",
    link: { href: "https://my.matterport.com/show/?m=uUjuZULQtzJ", label: "Örnek Turu İncele" },
  },
];

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `Hakkımızda | ${siteConfig.name}`,
  url: `${siteConfig.url}/hakkimizda`,
  inLanguage: "tr-TR",
  mainEntity: organizationRef,
};

export default function HakkimizdaPage() {
  // Deneyim iddiası yerine işin kendisi: rehberdeki gerçek site ve tapu
  // sınırı sayıları — "bölgeyi tanıyoruz" lafının kanıtı.
  const gruplar = getAllMahalleler().map((m) => getSitelerByMahalle(m.slug));
  const toplamSite = gruplar.reduce((sum, siteler) => sum + siteler.length, 0);
  const haritaliSite = gruplar.reduce(
    (sum, siteler) => sum + siteler.filter((site) => site.sinirGeoJSON).length,
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "Hakkımızda", href: "/hakkimizda" }]} />

      <header className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Hakkımızda
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{siteConfig.name}</h1>
        <ReviewBadge className="mt-3" />
        <p className="mt-5 text-base leading-relaxed text-body">
          {siteConfig.name}, Ankara&apos;nın Eryaman bölgesinde (Etimesgut ilçe sınırları
          içinde) faaliyet gösteren yerel bir gayrimenkul ofisidir. Ofisimiz Tunahan
          Mahallesi&apos;nde, 4. Etap Çarşı&apos;da yer alıyor — bölgeyi uzaktan değil, içinden
          takip ediyoruz.
        </p>
        <p className="mt-4 text-base leading-relaxed text-body">
          Bu sitede ilan yayınlamıyoruz — güncel satılık ve kiralık ilanlarımıza sahibinden.com
          üzerindeki mağazamızdan ulaşabilirsiniz. Burada bulacağınız şey, mahalle ve site bazlı
          rehber içerikler; evinizi satmak ya da kiraya vermek istiyorsanız da doğrudan bize
          ulaşabilirsiniz.
        </p>
        <p className="mt-4 text-xs text-muted">
          Taşınmaz Ticareti Yetki Belgesi No: {YETKI_BELGESI_NO} ·{" "}
          {/* Doğrulanabilirlik sinyali (07.10): belge numarası Bakanlığın resmî
              sorgu ekranına bağlanır; sıralama hilesi değil, kimlik kanıtı. */}
          <a
            href={YETKI_BELGESI_SORGU}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-gold/60 underline-offset-2 hover:text-navy"
          >
            Ticaret Bakanlığı kaydında doğrulayın
          </a>
        </p>
      </header>

      {/* Ofisin kendisi. Ziyaretçilerin bir kısmı buraya "beni arayan / bana
          tavsiye edilen bu ofis gerçek mi" sorusuyla geliyor; o soruya en hızlı
          cevabı metin değil, kapıdan içerisi veriyor. */}
      {/* Tek kare, ama "çalışırken" hâli: iki benzer açıyı yan yana koymak ek
          bilgi vermiyordu. Doğrulama anında gelen ziyaretçi için içinde insan
          olan bir ofis, boş bir mekândan ikna edicidir. */}
      <figure className="mt-8">
        <Image
          src="/images/ofis-ic-mekan-2.jpg"
          alt={`${siteConfig.name} ofisi — Tunahan Mahallesi, 4. Etap Çarşı, Eryaman`}
          width={1284}
          height={934}
          preload
          sizes="(min-width: 896px) 896px, 100vw"
          className="w-full rounded-2xl border border-border object-cover"
        />
        <figcaption className="mt-2 text-xs text-muted">
          Ofisimiz — {siteConfig.officeAddress}
        </figcaption>
      </figure>

      <section className="mt-12">
        <h2 className="text-xl">Ekibimiz</h2>
        <div className="mt-5 space-y-5">
          {/* Danışman profili — E-E-A-T: içeriğin arkasındaki kişi.
              Fotoğraf bilinçli yok; kanıt işin kendisi (site + tapu sayıları). */}
          <div id="ozgun-sirin" className="rounded-2xl border border-gold/40 bg-surface p-6">
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-xl font-semibold text-gold">
                ÖŞ
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-navy">Özgün Şirin</p>
                <p className="text-sm text-muted">Emlak Danışmanı — Eryaman</p>
                <p className="mt-3 text-sm leading-relaxed text-body">
                  Değerleme talepleriniz ve site/mahalle sorularınız aracıya değil, doğrudan
                  Özgün Şirin&apos;e ulaşır. Bu rehberdeki {toplamSite} site kaydı ve{" "}
                  {haritaliSite}
                  {/* {" "} ŞART: &apos; içeren çok satırlı metnin baştaki boşluğunu derleyici
                      düşürüyor — canlıda "520sitenin" basılıyordu (06.10 ölçümü). */}
                  {" "}
                  sitenin gerçek tapu (TKGM) sınırı, mahalle mahalle yürüttüğü
                  saha çalışmasının ürünü — Eryaman&apos;ı tabeladan değil, ada ve parsel
                  düzeyinde tanır.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <TrackedCtaLink
                    href={`tel:${siteConfig.phoneTel}`}
                    gaEvent="phone_click" gaParams={{ konum: "hakkimizda" }}
                    variant="ghost"
                    className="px-0 text-gold-dark"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {siteConfig.phoneDisplay}
                  </TrackedCtaLink>
                  {/* 08.10: düz <a> idi ve whatsapp_click göndermiyordu — sitedeki
                      izlenmeyen tek WhatsApp bağıydı (telefon bağları PR #88'de 26/26). */}
                  <TrackedLink
                    href={siteConfig.whatsappUrl}
                    gaEvent="whatsapp_click" gaParams={{ konum: "hakkimizda" }}
                    openInNewTab
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition-colors hover:text-gold-dark"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </TrackedLink>
                  <span className="text-xs text-muted">
                    Taşınmaz Ticareti Yetki Belgesi No: {YETKI_BELGESI_NO} ·{" "}
                    <a
                      href={YETKI_BELGESI_SORGU}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-gold/60 underline-offset-2 hover:text-navy"
                    >
                      Bakanlık kaydında doğrulayın
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15">
              <UserIcon className="h-6 w-6 text-gold-dark" />
            </div>
            <div>
              <p className="text-base font-semibold text-navy">Hamza Şirin</p>
              <p className="text-sm text-muted">Kurucu</p>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ozgunPersonJsonLd) }}
      />

      {/* "NASIL" ayağı (Google'ın Kim/Nasıl/Neden çerçevesi): içerik ve verinin
          nasıl üretildiği tek yerde, dürüstçe. AI şeffaflığı paragrafı bilinçli —
          700+ sayfalık tek-imzalı sitede okuyucunun sorması makul bir soru. */}
      <section id="yontem" className="mt-12 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-xl">İçerik ve Veri Yöntemimiz</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-body">
          <p>
            <strong className="text-navy">Konum ve tapu verisi:</strong>
            {/* {" "} ŞART: &quot; içeren çok satırlı metnin baştaki boşluğunu derleyici
                düşürüyor — canlıda "verisi:Site" basılıyordu (06.10 ölçümü). */}
            {" "}
            Site sayfalarındaki
            parsel sınırları TKGM parsel sorgu verisine dayanır; her sınır yayına alınmadan önce
            ada/parsel düzeyinde doğrulanır, doğrulanamayan bilgi yayınlanmaz. Sayfalardaki
            &quot;son doğrulama&quot; tarihi, o kaydın en son ne zaman elden geçtiğini gösterir.
          </p>
          <p>
            <strong className="text-navy">Yazılar:</strong> Rehber ve site tanıtımları{" "}
            <Link
              href="/hakkimizda#ozgun-sirin"
              className="font-semibold text-gold-dark hover:underline"
            >
              Özgün Şirin
            </Link>{" "}
            sorumluluğunda yayımlanır. Hazırlıkta yapay zekâ araçlarından destek alıyoruz;
            bilgilerin kaynağı her zaman TKGM kayıtları, resmî mevzuat ve saha bilgisidir ve
            yayın öncesi insan kontrolünden geçer. Hukuk ve vergi konularında yazılarımız
            bilgilendirme amaçlıdır — somut adımlar için ilgili meslek insanına yönlendiririz.
          </p>
          <p>
            <strong className="text-navy">Fiyat politikası:</strong> Sayfalarımızda güncel piyasa
            fiyatı rakamı yayınlamıyoruz — enflasyon ortamında yazılı rakam günü geçmiş bilgi
            hâline gelir ve yanıltır. Fiyat, güncel emsallerle görüşmede birlikte belirlenir.
          </p>
        </div>
      </section>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {adimlar.map((adim) => (
          <div key={adim.baslik} className="rounded-2xl border border-border bg-surface p-5">
            <adim.icon className="h-7 w-7 text-gold-dark" />
            <h2 className="mt-3 text-base">{adim.baslik}</h2>
            <p className="mt-2 text-sm leading-relaxed text-body">{adim.aciklama}</p>
            {adim.link && (
              <a
                href={adim.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block cursor-pointer text-sm font-semibold text-gold-dark hover:underline"
              >
                {adim.link.label} →
              </a>
            )}
          </div>
        ))}
      </div>

      <CtaBanner
        size="large"
        className="mt-12"
        baslik="Eryaman'ı Birlikte Keşfedelim"
        aciklama="Hizmet bölgemizdeki mahalleleri inceleyin veya doğrudan bizimle iletişime geçin."
      >
        <CtaButton href="/mahalleler" variant="primary">
          Mahalleleri İncele
        </CtaButton>
        <CtaButton href="/iletisim" variant="outline-light">
          İletişime Geçin
        </CtaButton>
      </CtaBanner>
    </div>
  );
}
