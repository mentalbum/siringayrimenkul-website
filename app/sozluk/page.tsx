import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaBanner } from "@/components/ui/cta-banner";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Emlak Terimleri Sözlüğü — Kat Mülkiyeti, Kârgir, İskân, Emsal Nedir?",
  description:
    "Kat mülkiyeti ile kat irtifakı farkı, kârgir ne demek, iskân neden önemli, emsal nasıl okunur? Ev satan ve kiraya veren ev sahipleri için 27 temel emlak ve tapu teriminin sade açıklaması.",
  alternates: { canonical: "/sozluk" },
};

interface Terim {
  id: string;
  ad: string;
  tanim: React.ReactNode;
  tanimDuz: string; // JSON-LD için düz metin
}

const linkClass = "font-semibold text-gold-dark underline-offset-2 hover:underline";

const terimler: Terim[] = [
  {
    id: "ada-parsel",
    ad: "Ada / Parsel",
    tanimDuz:
      "Kadastroda her arazi parçasının kimliği: ada, çevresi yollarla sınırlı arazi bloğunu; parsel, o blok içindeki tek mülkiyet birimini gösterir. Tapudaki ada/parsel numarasıyla bir sitenin hangi araziye oturduğu resmî olarak görülebilir.",
    tanim: (
      <>
        Kadastroda her arazi parçasının kimliği: <strong>ada</strong>, çevresi yollarla sınırlı
        arazi bloğunu; <strong>parsel</strong>, o blok içindeki tek mülkiyet birimini gösterir.
        Sitelerimizin sayfalarında gördüğünüz &quot;18468/1&quot; gibi ifadeler budur. Ayrıntı için{" "}
        <Link href="/blog/tapu-ada-parsel-nasil-okunur" className={linkClass}>
          tapuda ada/parsel nasıl okunur
        </Link>{" "}
        rehberimize bakın.
      </>
    ),
  },
  {
    id: "kat-mulkiyeti",
    ad: "Kat Mülkiyeti",
    tanimDuz:
      "İskânı alınmış bir binada her bağımsız bölümün (daire, dükkân) kendi tapusuna bağlanmış hâli. Alım-satım ve bankacılık işlemlerinde en sorunsuz kabul edilen tapu türüdür.",
    tanim: (
      <>
        İskânı alınmış bir binada her bağımsız bölümün (daire, dükkân) kendi tapusuna bağlanmış
        hâli. Alım-satım ve bankacılık işlemlerinde en sorunsuz kabul edilen tapu türüdür;
        Eryaman&apos;daki yerleşik sitelerin büyük bölümü kat mülkiyetine geçmiştir.
      </>
    ),
  },
  {
    id: "kat-irtifaki",
    ad: "Kat İrtifakı",
    tanimDuz:
      "Henüz iskân alınmamış binalarda bağımsız bölümlere arsa payı üzerinden kurulan hak tapusu. Satışı mümkündür; bina iskân aldığında kat mülkiyetine çevrilir.",
    tanim: (
      <>
        Henüz iskân alınmamış binalarda bağımsız bölümlere arsa payı üzerinden kurulan hak
        tapusu. Satışı mümkündür; bina iskân aldığında kat mülkiyetine çevrilir.
      </>
    ),
  },
  {
    id: "iskan",
    ad: "İskân (Yapı Kullanma İzin Belgesi)",
    tanimDuz:
      "Belediyenin, binanın onaylı projesine uygun tamamlandığını ve oturulabilir olduğunu belgeleyen izin. Kat mülkiyetine geçişin ön şartıdır.",
    tanim: (
      <>
        Belediyenin, binanın onaylı projesine uygun tamamlandığını ve oturulabilir olduğunu
        belgeleyen izin. Kat mülkiyetine geçişin ön şartıdır.
      </>
    ),
  },
  {
    id: "kargir",
    ad: "Kârgir",
    tanimDuz:
      "Tapu kayıtlarında yapı niteliği terimi: taş, tuğla, beton gibi ahşap dışı malzemeyle inşa edilmiş yapı. Eryaman sitelerinin tapularında '6 Blok Kârgir Apartman' gibi ifadelerle geçer.",
    tanim: (
      <>
        Tapu kayıtlarında yapı niteliği terimi: taş, tuğla, beton gibi ahşap dışı malzemeyle
        inşa edilmiş yapı. Site sayfalarımızda aktardığımız &quot;6 Blok Kârgir Apartman&quot;
        gibi tapu ifadeleri buradan gelir.
      </>
    ),
  },
  {
    id: "tapu-harci",
    ad: "Tapu Harcı",
    tanimDuz:
      "Satışta gerçek bedel üzerinden ödenen harç; toplam %4'tür ve yasal olarak alıcı ile satıcı %2+%2 öder. Tutarı hesaplamak için sitedeki tapu harcı hesaplayıcı kullanılabilir.",
    tanim: (
      <>
        Satışta gerçek bedel üzerinden ödenen harç; toplam %4&apos;tür ve yasal olarak alıcı ile
        satıcı %2+%2 öder. Tutarınızı{" "}
        <Link href="/araclar" className={linkClass}>
          tapu harcı hesaplayıcımızla
        </Link>{" "}
        görebilirsiniz.
      </>
    ),
  },
  {
    id: "doner-sermaye",
    ad: "Döner Sermaye Ücreti",
    tanimDuz:
      "Tapu işlemlerinde harca ek olarak alınan, her yıl resmî tarifeyle belirlenen hizmet bedeli.",
    tanim: (
      <>
        Tapu işlemlerinde harca ek olarak alınan, her yıl resmî tarifeyle belirlenen hizmet
        bedeli.
      </>
    ),
  },
  {
    id: "ekspertiz",
    ad: "Ekspertiz (Değerleme Raporu)",
    tanimDuz:
      "Lisanslı değerleme uzmanının taşınmaz için hazırladığı resmî değer tespiti. Banka kredili satışlarda zorunludur; kredi tutarı ekspertiz değerine göre belirlenir.",
    tanim: (
      <>
        Lisanslı değerleme uzmanının taşınmaz için hazırladığı resmî değer tespiti. Banka
        kredili satışlarda zorunludur; kredi tutarı ekspertiz değerine göre belirlenir.
      </>
    ),
  },
  {
    id: "emsal",
    ad: "Emsal",
    tanimDuz:
      "Aynı sitede veya eşdeğer çevrede, benzer özellikteki dairelerin gerçekleşen satış ya da kira bedelleri. İlan fiyatı emsal değildir; doğru fiyat gerçekleşen emsallerden okunur.",
    tanim: (
      <>
        Aynı sitede veya eşdeğer çevrede, benzer özellikteki dairelerin <em>gerçekleşen</em>{" "}
        satış ya da kira bedelleri. İlan fiyatı emsal değildir; doğru fiyat gerçekleşen
        emsallerden okunur —{" "}
        <Link href="/ev-degerleme" className={linkClass}>
          değerleme görüşmesinde
        </Link>{" "}
        birlikte bakarız.
      </>
    ),
  },
  {
    id: "kapora",
    ad: "Kapora",
    tanimDuz:
      "Alım-satım veya kiralamada niyeti bağlamak için verilen ön ödeme. Tutarın, iade ve cayma koşullarının yazılı sözleşmeyle belgelenmesi önerilir.",
    tanim: (
      <>
        Alım-satım veya kiralamada niyeti bağlamak için verilen ön ödeme. Tutarın, iade ve
        cayma koşullarının yazılı sözleşmeyle belgelenmesi önerilir.
      </>
    ),
  },
  {
    id: "dask",
    ad: "DASK (Zorunlu Deprem Sigortası)",
    tanimDuz:
      "Konutlar için yasal zorunlu deprem sigortası. Tapu devri ve elektrik-su abonelik işlemlerinde poliçe aranır.",
    tanim: (
      <>
        Konutlar için yasal zorunlu deprem sigortası. Tapu devri ve elektrik-su abonelik
        işlemlerinde poliçe aranır.
      </>
    ),
  },
  {
    id: "aidat",
    ad: "Aidat",
    tanimDuz:
      "Sitenin ortak giderlerine (güvenlik, temizlik, asansör, ortak alan bakımı) her bağımsız bölümün katıldığı pay. Kat malikleri kurulunun onayladığı işletme projesiyle belirlenir.",
    tanim: (
      <>
        Sitenin ortak giderlerine (güvenlik, temizlik, asansör, ortak alan bakımı) her bağımsız
        bölümün katıldığı pay. Kat malikleri kurulunun onayladığı işletme projesiyle belirlenir.
      </>
    ),
  },
  {
    id: "depozito",
    ad: "Depozito",
    tanimDuz:
      "Kiralamada kiracının verdiği güvence bedeli. Türk Borçlar Kanunu'na göre konut kiralarında en çok üç aylık kira bedeli kadar olabilir.",
    tanim: (
      <>
        Kiralamada kiracının verdiği güvence bedeli. Türk Borçlar Kanunu&apos;na göre konut
        kiralarında en çok üç aylık kira bedeli kadar olabilir.
      </>
    ),
  },
  {
    id: "tufe",
    ad: "TÜFE (Kira Artışında)",
    tanimDuz:
      "TÜİK'in aylık açıkladığı tüketici fiyat endeksi. Konut kira artışının yasal tavanı, TÜFE'nin on iki aylık ortalamalara göre değişim oranıdır.",
    tanim: (
      <>
        TÜİK&apos;in aylık açıkladığı tüketici fiyat endeksi. Konut kira artışının yasal tavanı,
        TÜFE&apos;nin on iki aylık ortalamalara göre değişim oranıdır — ayrıntı{" "}
        <Link href="/blog/kira-artisi-nasil-hesaplanir" className={linkClass}>
          kira artışı rehberimizde
        </Link>
        , hesap{" "}
        <Link href="/araclar" className={linkClass}>
          araçlar sayfamızda
        </Link>
        .
      </>
    ),
  },
  {
    id: "kira-tespit-davasi",
    ad: "Kira Tespit Davası",
    tanimDuz:
      "Beş yılı aşan kiracılıklarda ev sahibinin, TÜFE tavanından bağımsız olarak mahkemeden yeni kira belirlenmesini isteyebildiği dava. Hâkim TÜFE'yi, taşınmazın durumunu ve emsalleri birlikte değerlendirir.",
    tanim: (
      <>
        Beş yılı aşan kiracılıklarda ev sahibinin, TÜFE tavanından bağımsız olarak mahkemeden
        yeni kira belirlenmesini isteyebildiği dava. Hâkim TÜFE&apos;yi, taşınmazın durumunu ve
        emsalleri birlikte değerlendirir.
      </>
    ),
  },
  {
    id: "tahliye-taahhutnamesi",
    ad: "Tahliye Taahhütnamesi",
    tanimDuz:
      "Kiracının, konutu belirli bir tarihte boşaltacağını yazılı olarak taahhüt ettiği belge. Geçerliliği sıkı şekil şartlarına bağlıdır; kira sözleşmesiyle aynı anda imzalatılan taahhütler tartışmalıdır.",
    tanim: (
      <>
        Kiracının, konutu belirli bir tarihte boşaltacağını yazılı olarak taahhüt ettiği belge.
        Geçerliliği sıkı şekil şartlarına bağlıdır; kira sözleşmesiyle aynı anda imzalatılan
        taahhütler tartışmalıdır.
      </>
    ),
  },
  {
    id: "yetki-belgesi",
    ad: "Taşınmaz Ticareti Yetki Belgesi",
    tanimDuz:
      "Emlak işletmelerinin faaliyet için almak zorunda olduğu resmî belge. Çalıştığınız ofisin yetki belgesini sorgulamak, güvenli işlem için ilk adımdır.",
    tanim: (
      <>
        Emlak işletmelerinin faaliyet için almak zorunda olduğu resmî belge. Çalıştığınız ofisin
        belgesini sorgulamak güvenli işlemin ilk adımıdır — bizim belge numaramız{" "}
        <Link href="/hakkimizda" className={linkClass}>
          Hakkımızda
        </Link>{" "}
        sayfasındadır.
      </>
    ),
  },
  {
    id: "brut-net",
    ad: "Brüt / Net m²",
    tanimDuz:
      "Net alan dairenin içinde fiilen kullanılan alandır; brüt alan duvarlar ve ortak alan payını da içerir. İlanlar çoğunlukla brüt yazar; karşılaştırmayı hep aynı ölçü üzerinden yapın.",
    tanim: (
      <>
        Net alan dairenin içinde fiilen kullanılan alandır; brüt alan duvarlar ve ortak alan
        payını da içerir. İlanlar çoğunlukla brüt yazar; karşılaştırmayı hep aynı ölçü
        üzerinden yapın.
      </>
    ),
  },
  {
    id: "donum",
    ad: "Dönüm",
    tanimDuz: "1.000 m²'lik arazi ölçüsü. Site parselleri anlatılırken sık kullanılır.",
    tanim: <>1.000 m²&apos;lik arazi ölçüsü. Site parselleri anlatılırken sık kullanılır.</>,
  },
  {
    id: "ana-tasinmaz",
    ad: "Ana Taşınmaz",
    tanimDuz:
      "Tapuda kat mülkiyeti veya kat irtifakı henüz kurulmamış, tek bütün olarak kayıtlı taşınmaz (arsa ya da bina). 'Tapuda ana taşınmaz' ifadesi, parselin bağımsız bölümlere ayrılmadığını gösterir.",
    tanim: (
      <>
        Tapuda kat mülkiyeti veya kat irtifakı henüz kurulmamış, tek bütün olarak kayıtlı
        taşınmaz (arsa ya da bina). Bir parsel &quot;ana taşınmaz&quot; görünüyorsa daireler
        henüz ayrı tapulara bağlanmamış demektir; alım-satımda bu ayrımın netleşmesi önemlidir.
      </>
    ),
  },
  {
    id: "cins-tashihi",
    ad: "Cins Tashihi (Cins Değişikliği)",
    tanimDuz:
      "Tapudaki nitelik kaydının fiilî duruma uyarlanması; örneğin bina tamamlandığında 'arsa' kaydının 'apartman' olarak düzeltilmesi. Yapılmadığında bina bitmiş olsa da tapu 'arsa' görünmeye devam eder.",
    tanim: (
      <>
        Tapudaki nitelik kaydının fiilî duruma uyarlanması; örneğin bina tamamlandığında
        &quot;arsa&quot; kaydının &quot;apartman&quot; olarak düzeltilmesi. Bazı yeni sitelerin
        sayfalarında &quot;parsel tapuda kat irtifakı/arsa aşamasında&quot; notunu bu yüzden
        görürsünüz: bina yerinde, kayıt henüz güncellenmemiştir.
      </>
    ),
  },
  {
    id: "emlak-hizmet-bedeli",
    ad: "Emlak Hizmet Bedeli (Komisyon)",
    tanimDuz:
      "Taşınmaz Ticareti Hakkında Yönetmelik uyarınca satışta en fazla satış bedelinin %4'ü + KDV (uygulamada alıcı-satıcı %2+%2), kiralamada bir aylık kira + KDV olan yasal hizmet bedeli.",
    tanim: (
      <>
        Taşınmaz Ticareti Hakkında Yönetmelik uyarınca satışta en fazla satış bedelinin %4&apos;ü
        + KDV (uygulamada alıcı ve satıcıdan %2+%2), kiralamada bir aylık kira + KDV olan yasal
        hizmet bedeli. Kendi rakamlarınız için{" "}
        <Link href="/araclar" className={linkClass}>
          komisyon hesaplayıcımızı
        </Link>{" "}
        kullanabilirsiniz.
      </>
    ),
  },
  {
    id: "rayic-bedel",
    ad: "Rayiç Bedel",
    tanimDuz:
      "Bir taşınmazın güncel piyasa koşullarında alıcı bulabileceği gerçekçi değer. Belediyenin emlak vergisine esas rayici ile piyasa rayici farklı kavramlardır; satış fiyatı piyasa rayicinden okunur.",
    tanim: (
      <>
        Bir taşınmazın güncel piyasa koşullarında alıcı bulabileceği gerçekçi değer. Belediyenin
        emlak vergisine esas rayici ile piyasa rayici farklıdır; doğru satış fiyatı, sitenizdeki
        gerçekleşen emsallerle belirlenir —{" "}
        <Link href="/ev-degerleme" className={linkClass}>
          değerleme görüşmesi
        </Link>{" "}
        tam bunun içindir.
      </>
    ),
  },
  {
    id: "serh",
    ad: "Şerh",
    tanimDuz:
      "Tapu kütüğüne düşülen ve taşınmazın hukuki durumunu etkileyen not (satış vaadi, kira şerhi, aile konutu, haciz gibi). Satış öncesi tapu kaydındaki şerhlerin bilinmesi gerekir.",
    tanim: (
      <>
        Tapu kütüğüne düşülen ve taşınmazın hukuki durumunu etkileyen not (satış vaadi, kira
        şerhi, aile konutu, haciz gibi). Satış sürecine başlamadan tapu kaydındaki şerhlerin
        görülmesi, sonradan sürpriz yaşanmaması için önemlidir.
      </>
    ),
  },
  {
    id: "hisseli-tapu",
    ad: "Hisseli Tapu",
    tanimDuz:
      "Bir taşınmazın birden fazla kişiye paylar hâlinde ait olması. Payın satışı mümkündür; ancak fiilî kullanım ve satış süreci hissedarlar arasındaki anlaşmaya bağlı olduğundan dikkat ister.",
    tanim: (
      <>
        Bir taşınmazın birden fazla kişiye paylar hâlinde ait olması. Payın satışı mümkündür;
        ancak fiilî kullanım ve satış süreci hissedarlar arasındaki anlaşmaya bağlı olduğundan
        süreç yönetimi dikkat ister.
      </>
    ),
  },
  {
    id: "rezidans-tapu",
    ad: "Rezidans (Tapuda Ofis Niteliği)",
    tanimDuz:
      "Konut gibi kullanılan ancak imar durumu gereği tapuda 'ofis/işyeri' niteliğiyle kayıtlı yapılar. Aidat, vergi ve abonelik kalemleri konuttan farklı işleyebilir; alım-satımda tapu niteliğine bakılmalıdır.",
    tanim: (
      <>
        Konut gibi kullanılan ancak imar durumu gereği tapuda &quot;ofis/işyeri&quot; niteliğiyle
        kayıtlı yapılar. Bazı site sayfalarımızdaki &quot;tapu niteliği: ofis (rezidans tipi)&quot;
        notu bunu anlatır; aidat, vergi ve abonelik kalemleri konuttan farklı işleyebileceği için
        alım-satımda tapu niteliğine mutlaka bakılır.
      </>
    ),
  },
  {
    id: "kentsel-donusum",
    ad: "Kentsel Dönüşüm",
    tanimDuz:
      "Riskli veya ömrünü doldurmuş yapıların yıkılıp yeniden yapılması süreci. Hak sahipleri müteahhitle kat karşılığı ya da bedel üzerinden anlaşır; Eryaman çevresinde birçok yeni site bu yolla doğmuştur.",
    tanim: (
      <>
        Riskli veya ömrünü doldurmuş yapıların yıkılıp yeniden yapılması süreci. Hak sahipleri
        müteahhitle kat karşılığı ya da bedel üzerinden anlaşır; bölgedeki bazı yeni projeler
        (ör. 96 konutluk Ritim Eryaman) bu yolla doğmuştur.
      </>
    ),
  },
];

export default function SozlukPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Emlak Terimleri Sözlüğü",
    url: `${siteConfig.url}/sozluk`,
    hasDefinedTerm: terimler.map((t) => ({
      "@type": "DefinedTerm",
      name: t.ad,
      description: t.tanimDuz,
      url: `${siteConfig.url}/sozluk#${t.id}`,
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Emlak Sözlüğü", href: "/sozluk" },
        ]}
      />

      <header className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Ev Sahipleri İçin
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Emlak Terimleri Sözlüğü</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Tapuda, ilanlarda ve site sayfalarımızda geçen terimlerin sade karşılıkları — kat
          mülkiyetinden kârgire, emsalden tahliye taahhütnamesine. Satış ya da kiralama
          görüşmesine bu sözlükle oturduğunuzda masada eşit konuşursunuz.
        </p>
      </header>

      <dl className="mt-10 space-y-4">
        {terimler.map((t) => (
          <div
            key={t.id}
            id={t.id}
            className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5"
          >
            <dt className="text-base font-semibold text-navy">{t.ad}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-body">{t.tanim}</dd>
          </div>
        ))}
      </dl>

      <CtaBanner
        size="large"
        className="mt-14"
        baslik="Terimler tamam — sıra sizin dairenizde"
        aciklama="Kat mülkiyeti, emsal, ekspertiz... Hepsinin sizin daireniz için ne anlama geldiğini bir görüşmede netleştirelim; satış ya da kiralama yol haritanızla çıkın."
      >
        <TrackedCtaLink href="/ev-degerleme" gaEvent="sozluk_degerleme_cta" variant="primary">
          Değerleme Görüşmesi Planla
        </TrackedCtaLink>
        <TrackedCtaLink
          href={`tel:${siteConfig.phoneTel}`}
          gaEvent="sozluk_tel_cta"
          variant="outline-light"
        >
          {siteConfig.phoneDisplay}
        </TrackedCtaLink>
      </CtaBanner>
    </div>
  );
}
