import type { Metadata } from "next";
import Link from "next/link";
import { getAllEtapOzetleri, getEtapBoundary } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { FaqSection } from "@/components/ui/faq-section";
import { Reveal } from "@/components/ui/reveal";
import { EtapMapLoader } from "@/components/maps/etap-map-loader";
import { ResourceHints } from "@/components/seo/resource-hints";
import type { FaqItem } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";

/* Bu sayfa neden var: etap, Eryaman aramalarının en büyük tek temasıdır
 * (2026-08-08 ölçümü, 764 sorgu — scratchpad-karne/arama-talebi). Etap
 * sayfaları mahalle altında yaşıyor ve aralarında bağ yoktu; "eryaman
 * etapları", "eryaman etap haritası", "eryaman kaç etap" gibi mahalleden
 * bağımsız aramaların gideceği bir adres yoktu. Aynı ölçümde bakılan SERP'te
 * bu aramayı etap yönetimlerinin kendi siteleri (eryaman1/3/4/5.com) ve
 * Wikipedia paylaşıyor; hiçbiri beş etabı tek sayfada toplamıyor. */

export const metadata: Metadata = {
  // `absolute`: kök layout'un "%s | Şirin Gayrimenkul" şablonu bu başlığı 68
  // karaktere çıkarıp Google'ın ~60'ta kestiği yere denk getiriyordu — kesilen
  // kısım tam da hedef ifade ("Etap Haritası") olurdu. Anasayfada 08.08'de
  // ölçülen karar burada da geçerli: marka başlıktan çıkınca 48 karakterin
  // tamamı SERP'te görünüyor, marka adı H1/JSON-LD/og:site_name'de duruyor.
  title: { absolute: "Eryaman Etapları — Etap Haritası ve Site Listesi" },
  description:
    "Eryaman'ın resmî toplu yapı listesi bulunan 1–5. etapları: her etap hangi mahallede, içinde hangi siteler var, haritada nereye düşüyor. Eryaman'da eviniz mi var? Etabınızın alıcı ve kiracı profilini birlikte konuşalım.",
  alternates: { canonical: "/etaplar" },
};

export default function EtaplarPage() {
  const etaplar = getAllEtapOzetleri();
  const mapItems = etaplar.flatMap((etap) => {
    const boundary = getEtapBoundary(etap.no);
    // Sınırı çizilemeyen etap haritada hiç görünmez — çerçeve uydurulmaz.
    if (!boundary) return [];
    return [{ no: etap.no, href: etapYolu(etap), boundary }];
  });

  const toplamSite = etaplar.reduce((acc, etap) => acc + etap.siteler.length, 0);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Eryaman Etapları",
    description:
      "Eryaman'da resmî toplu yapı yönetimi listesi bulunan etaplar — Şirin Gayrimenkul",
    url: `${siteConfig.url}/etaplar`,
    numberOfItems: etaplar.length,
    itemListElement: etaplar.map((etap, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Eryaman ${etap.no}. Etap`,
      url: `${siteConfig.url}${etapYolu(etap)}`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ResourceHints />
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "Etaplar", href: "/etaplar" }]} />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Eryaman Bölgesi
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman Etapları</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman, etap etap planlanmış bir semt: her etabın kendi toplu yapı yönetimi,
          kendi çarşısı ve kendi site dokusu var. Aşağıdaki haritada resmî ada listesi
          elimizde olan {etaplar.length} etabı ve bu etaplarda tanıdığımız {toplamSite}{" "}
          site ile rezidansı görüyorsunuz.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Eryaman&apos;da satmak veya kiraya vermek istediğiniz bir eviniz varsa,
          etabınızın sayfasından o bölgeyi tanıyan danışmanımıza ulaşabilirsiniz.
        </p>
      </header>

      {mapItems.length > 0 && (
        <>
          <div className="mt-8 h-[420px] overflow-hidden rounded-2xl border border-border sm:h-[520px]">
            <EtapMapLoader items={mapItems} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Haritadaki alanlar, her etabın resmî ada listesindeki yapı adalarının kadastro
            poligonlarıdır (kaynak: TKGM Parsel Sorgu). Etabın adaları renkle ayrılır;
            aradaki cadde, park ve okul parselleri etap alanına dahil edilmemiştir. Bilgilendirme
            amaçlıdır, resmî kadastro belgesi yerine geçmez.
          </p>
        </>
      )}

      <section className="mt-12">
        <h2 className="text-xl">Etaplar ve Hangi Mahallede Yer Aldıkları</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {etaplar.map((etap, i) => (
            <Reveal key={etap.no} delay={(i % 3) * 70} className="h-full">
              <Link
                href={etapYolu(etap)}
                className="flex h-full cursor-pointer flex-col rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold"
              >
                <h3 className="text-lg font-semibold text-navy">Eryaman {etap.no}. Etap</h3>
                <p className="mt-1 text-sm text-muted">{etap.mahalle.isim}</p>
                <p className="mt-3 text-sm leading-relaxed text-body">
                  {/* Kayıtlarımız resmî listenin alt kümesiyse sayıyı etap toplamı
                      gibi sunmuyoruz — etap sayfasındaki aynı ihtiyat. */}
                  {etap.adalar.length === etap.resmiAdaSayisi
                    ? `${etap.siteler.length} site ve rezidans, ${etap.adalar.length} yapı adası.`
                    : `Resmî liste ${etap.resmiAdaSayisi} adayı kapsıyor; bunlardan ${etap.adalar.length} adayı ve üzerindeki ${etap.siteler.length} site ile rezidansı tek tek tanıyoruz.`}
                </p>
                <span className="mt-4 text-sm font-semibold text-gold-dark">
                  {etap.no}. Etap sayfası →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <FaqSection title="Eryaman Etapları Hakkında Sık Sorulan Sorular" items={etaplarFaq(etaplar)} />

      <CtaBanner
        className="mt-14"
        baslik="Eryaman'da Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?"
        aciklama="Hangi etapta olduğunu bilmiyorsanız da sorun; adresten çıkarır, o etaptaki alıcı ve kiracı profilini birlikte konuşuruz."
      >
        <CtaButton href="/ev-degerleme" variant="primary">
          Evinizi Değerlendirelim
        </CtaButton>
      </CtaBanner>

      <section className="mt-14">
        <h2 className="text-xl">Etap Sistemi Nasıl İşliyor?</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-body">
          &ldquo;Etap&rdquo; kavramının ne anlama geldiğini, dairenizin hangi etapta
          olduğunu tapu ve ada sorgusundan nasıl çıkarabileceğinizi ayrı bir yazıda
          adım adım anlattık.
        </p>
        <div className="mt-5">
          <CtaButton href="/blog/eryamanda-etap-sistemi-nedir" variant="outline">
            Eryaman&apos;da Etap Sistemi Nedir?
          </CtaButton>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl">Mahalle Mahalle Eryaman</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-body">
          Etaplar Eryaman&apos;ın tamamını kapsamaz; semtin 11 mahallesinde etap
          yapılaşmasının dışında kalan site ve rezidanslar da var.
        </p>
        <div className="mt-5">
          <CtaButton href="/mahalleler" variant="outline">
            Eryaman Mahalleleri
          </CtaButton>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </div>
  );
}

function etapYolu(etap: { no: string; mahalle: { slug: string } }): string {
  return `/mahalleler/${etap.mahalle.slug}/etaplar/${etap.no}`;
}

function etaplarFaq(etaplar: ReturnType<typeof getAllEtapOzetleri>): FaqItem[] {
  const liste = etaplar.map((etap) => `${etap.no}. Etap (${etap.mahalle.isim})`).join(", ");

  return [
    {
      soru: "Eryaman'da kaç etap var?",
      // "6. Etap yok" gibi bir OLUMSUZ iddia kurulmuyor; söylenen şey
      // doğrulanabilir olan: hangi etapların resmî toplu yapı listesi elimizde.
      cevap: `Şirin Gayrimenkul rehberinde, resmî toplu yapı yönetimi ada listesi elimizde olan ${etaplar.length} etap yayınlanıyor: ${liste}. Bir etabı rehbere ancak o etabın toplu yapı yönetiminin resmî ada listesiyle ekliyoruz; liste olmadan "şu site şu etaptadır" demiyoruz.`,
    },
    {
      soru: "Eryaman etapları hangi mahallelerde yer alıyor?",
      cevap: etaplar
        .map(
          (etap) =>
            `Eryaman ${etap.no}. Etap, ${etap.mahalle.ilce} ilçesine bağlı ${etap.mahalle.isim} içinde yer alıyor.`
        )
        .join(" "),
    },
    {
      soru: "Etap haritasındaki alanlar neye göre çizildi?",
      cevap:
        "Her etabın resmî ada listesindeki yapı adalarının kadastro poligonları TKGM Parsel Sorgu (CBS) verisinden alınıp etap rengiyle çizildi. Etabın dış çeperi tek bir poligon olarak birleştirilmedi; birleştirmek aradaki cadde, park ve okul parsellerini de etabın içine katardı. Harita bilgilendirme amaçlıdır, resmî kadastro belgesi yerine geçmez.",
    },
    {
      soru: "Evimin hangi etapta olduğunu bilmiyorum, nasıl öğrenebilirim?",
      cevap: `Adresi veya sitenizin adını söylemeniz yeterli; kayıtlarımızdaki ada bilgisiyle etabınızı çıkarıyoruz. ${siteConfig.phoneDisplay} numarasından arayabilir veya WhatsApp ile yazabilirsiniz.`,
      semaDisi: true,
    },
  ];
}
