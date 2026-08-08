import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaBanner } from "@/components/ui/cta-banner";
import { CtaButton } from "@/components/ui/button";
import { FaqSection } from "@/components/ui/faq-section";
import { Reveal } from "@/components/ui/reveal";
import type { FaqItem } from "@/lib/faq";
import { getAllBlogPosts, getYayindaMahalleler } from "@/lib/content";
import { getBlogKonu } from "@/lib/blog-konular";
import { siteConfig } from "@/lib/site-config";
import { organizationRef } from "@/lib/structured-data";

export const metadata: Metadata = {
  // absolute: kök şablonun " | Şirin Gayrimenkul" eki (19 karakter) başlığı
  // 60 karakterin üstüne çıkarıyordu; Google orada kesiyor ve uzun başlıkları
  // yeniden yazıyor. Site/mahalle şablonlarında bu ek zaten kaldırılmıştı
  // (2026-08-07/08); dönüşüm ve araç sayfaları atlanmıştı. Marka alan adında,
  // og:site_name ve JSON-LD'de duruyor. Baş terim başta kalacak biçimde kısaltıldı.
  title: { absolute: "Eryaman'da Ev Satmak — Süreci Sizin Adınıza Yönetiyoruz" },
  description:
    "Eryaman'da evinizi satmayı mı düşünüyorsunuz? Değerlemeden tapuya satışın her adımını yürüten yerel emlakçınız. 700'den fazla siteyi blok blok tanıyoruz. Aynı gün dönüş: 0532 363 96 60.",
  alternates: { canonical: "/eryamanda-ev-satmak" },
};

const adimlar = [
  {
    baslik: "1. Değerleme görüşmesi",
    aciklama:
      "Satışın kaderi ilk gün konulan fiyatta belli olur. Dairenizi ilan sitelerindeki 'istenen' rakamlardan değil, sitenizdeki ve mahallenizdeki gerçekleşen satışlardan yola çıkarak birlikte değerliyoruz — elinizde gerçekçi bir fiyat aralığı ve yol haritası oluyor.",
  },
  {
    baslik: "2. Hazırlık ve tanıtım",
    aciklama:
      "Evinizi doğru fotoğraflarla, doğru anlatımla vitrine çıkarıyoruz; ilanınız sahibinden.com mağazamızda yayınlanıyor. Gerektiğinde 3D sanal turla, evinizi gelmeden gezmek isteyen alıcılara da ulaşıyoruz.",
  },
  {
    baslik: "3. Alıcı eleme ve gösterim",
    aciklama:
      "Telefonlara biz bakıyoruz. Meraklıyı, 'fiyat düşer mi' diye gezeni ve portföy toplayan aracıyı eliyoruz; evinize yalnızca ön değerlendirmeden geçmiş gerçek alıcılar geliyor. Gösterimleri sizin uygun olduğunuz saatlere göre planlıyoruz.",
  },
  {
    baslik: "4. Pazarlık",
    aciklama:
      "Alıcıyla aranızdaki tampon biziz. Duygusal bağınız olan evde pazarlığı üçüncü tarafın yürütmesi, hem gerilimi hem fiyat kaybını azaltır; son karar her zaman sizde.",
  },
  {
    baslik: "5. Tapu ve teslim",
    aciklama:
      "Kapora ve sözleşmeden randevu, harç ve devir gününe kadar tapu sürecini sizin adınıza koordine ediyoruz. Bedelin güvenli el değiştirmesi için ödeme ile devrin eşzamanlı kurgulanması dahil.",
  },
];

const faqItems: FaqItem[] = [
  {
    soru: "Eryaman'da ev satmak ne kadar sürer?",
    cevap:
      "Dürüst cevap: fiyata bağlıdır. Emsallere göre doğru fiyatlanan daireler makul sürede alıcı bulur; piyasanın üzerinde fiyatlanan daireler aylarca ilanda bekler ve 'bu ev neden satılmıyor?' algısı oluşur. Bu yüzden süreci fiyat konuşarak değil, değerleme yaparak başlatıyoruz.",
  },
  {
    soru: "Satış için hangi belgeler gerekir?",
    cevap:
      "Kimlik, DASK poliçesi, belediyeden rayiç bedel yazısı ve emlak vergisi borcunun kapatılmış olması temel gereksinimlerdir; miras, ipotek ve vekâlet durumlarında ek belgeler devreye girer. Tam listeyi ilk görüşmede durumunuza göre birlikte çıkarırız — süreci bizimle yürütürseniz takibini de biz yaparız.",
  },
  {
    soru: "Satışta hangi masraflar çıkar?",
    cevap:
      "Tapu harcında yasal satıcı payı satış bedelinin %2'sidir; buna döner sermaye ücreti ve anlaşılan emlak hizmet bedeli eklenir. Alış tarihinizin üzerinden 5 yıl geçmediyse değer artışı kazancı vergisi de gündeme gelebilir. Hesaplayıcılarımızla kendi rakamlarınızı görebilirsiniz.",
  },
  {
    soru: "İçinde kiracı olan evimi satabilir miyim?",
    cevap:
      "Evet — satış kira sözleşmesini sona erdirmez, yeni malik sözleşmenin tarafı olur. Kiracılı satışın gösterim düzeni ve alıcı profili farklı işler: gösterim pencerelerini kiracıyla biz kurar, dosyayı kirayı hazır bulmak isteyen yatırımcı alıcılara da sunarız. Bu süreci sık yönetiyoruz.",
  },
  {
    soru: "Kiracım evi göstermiyor, ne yapabilirim?",
    cevap:
      "Kiracının gösterime katlanma yükümlülüğü kanunda yazılıdır (Türk Borçlar Kanunu m. 319) ve emlak danışmanınızla getirdiği alıcı adayını da kapsar; buna karşılık ev sahibi gösterimi önceden bildirmek ve kiracının yararlarını gözetmekle yükümlüdür. Dosyaların çoğu mahkemeye gitmeden, gösterimleri belirli gün ve saat pencerelerinde toplayarak çözülür — bu düzeni kiracıyla biz kurarız, siz karşı karşıya gelmezsiniz. Gerçekten tıkanan dosyalarda yol kiralananın gösterilmesine izin davasıdır — o noktaya gelmeden çözmek için süreci biz yönetiriz. Not: gösterime engel olmak tek başına bir tahliye sebebi değildir, iki süreç ayrıdır.",
  },
  {
    soru: "Satmak mı doğru, kiraya vermek mi?",
    cevap:
      "Cevap evin değil, sizin durumunuzun içindedir: paraya belirli bir tarihte ihtiyacınız varsa ve evi elde tutmanın bir amacı yoksa satış öne çıkar; nakit ihtiyacınız yoksa, evi ileride kullanma ihtimaliniz varsa ya da değer artışı kazancı vergisi açısından beş yılı doldurmanıza az kaldıysa kiraya vermek mantıklı olabilir. Bu başlıkları görüşmede tarafsızca birlikte değerlendiririz — iki işi de yaptığımız için sizi bir yöne itmek gibi bir çıkarımız yok.",
  },
  {
    soru: "Neden bir emlakçıyla çalışayım? Kendim satamaz mıyım?",
    cevap:
      "Satabilirsiniz — yasal engel yok, bunu size açıkça söylüyoruz. Emlakçının karşılığı somuttur: gerçekleşen satışlara dayalı fiyat, alıcı eleme, pazarlık tamponu ve güvenli tapu süreci. Yanlış fiyatın maliyeti çoğu zaman komisyonun birkaç katıdır.",
  },
  {
    soru: "Tapuya gelemeyeceğim; vekâletle satış yapılır mı?",
    cevap:
      "Evet. Noterden düzenlenecek, satış yetkisini açıkça içeren bir vekâletname ile tapu işlemi sizin adınıza tamamlanır; güvenli olan, kapsamı dar tutulmuş bir vekâlettir. Şehir dışında ya da yurt dışındaysanız süreç değişmez — adımları uzaktan satış rehberimizde anlattık; metni notere gitmeden önce birlikte netleştiririz.",
  },
];

export default function EvSatmakPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Eryaman'da Ev Satış Danışmanlığı",
    serviceType: "Konut satış aracılık ve danışmanlık hizmeti",
    description:
      "Değerlemeden tapuya, Eryaman'da ev satış sürecinin tamamını ev sahibi adına yürüten yerel emlak danışmanlığı hizmeti.",
    url: `${siteConfig.url}/eryamanda-ev-satmak`,
    provider: organizationRef,
    areaServed: { "@type": "Place", name: "Eryaman, Etimesgut, Ankara" },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Eryaman'da Ev Satmak", href: "/eryamanda-ev-satmak" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Ev Sahipleri İçin
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman&apos;da Evinizi Satmak</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Ev satmak bir ilan verme işi değil, bir süreç yönetimi işidir: doğru fiyat, doğru
          alıcı, güvenli tapu. Eryaman&apos;ın {""}
          <Link href="/siteler" className="font-semibold text-gold-dark hover:underline">
            700&apos;den fazla sitesini
          </Link>{" "}
          blok blok tanıyan yerel ofis olarak bu sürecin tamamını sizin adınıza yürütüyoruz —
          siz kararları verirsiniz, koşturmayı biz üstleniriz. (Taşınmaz Ticareti Yetki Belgesi
          No: 0603771)
        </p>
        {/* Niyet denetimi (2026-07-29): hero'da tıklanabilir CTA yoktu; hizmet
            niyetli ziyaretçi ilk ekranda eylem yolu görmeli. */}
        <div className="mt-6">
          <CtaButton href="/ev-degerleme" variant="primary" className="px-8">
            Evinizi Değerlendirelim
          </CtaButton>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-2xl">Eryaman&apos;da Ev Satış Süreci Nasıl İşler?</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-body">
          Eryaman&apos;da ev satışı beş adımda ilerler: sitenizdeki gerçekleşen satışlara dayalı
          değerleme, fotoğraf ve ilanla hazırlık-tanıtım, alıcı eleme ve gösterim, pazarlık ve
          tapu-teslim. Şirin Gayrimenkul olarak bu adımların tamamını ev sahibi adına
          yürütüyoruz: telefonlara biz bakarız, gösterimleri biz planlarız, tapu gününü biz
          koordine ederiz — son karar her adımda sizde kalır.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {adimlar.map((adim, i) => (
            <Reveal key={adim.baslik} delay={(i % 3) * 70} className="h-full">
              <div className="h-full rounded-2xl border border-border bg-surface p-5">
                <h3 className="text-base">{adim.baslik}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{adim.aciklama}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={140} className="h-full">
            <div className="flex h-full flex-col justify-between rounded-2xl bg-navy p-5 text-white">
              <p className="text-sm leading-relaxed text-white/85">
                Rakamlarınızı önceden görmek isterseniz:{" "}
                <Link href="/araclar/tapu-harci-hesaplama" className="font-semibold text-gold hover:underline">
                  tapu harcı
                </Link>{" "}
                ve{" "}
                <Link href="/araclar/emlak-komisyonu-hesaplama" className="font-semibold text-gold hover:underline">
                  komisyon hesaplayıcı
                </Link>{" "}
                elinizin altında; tapu harcı ve vergi kalemlerini de görüşmede tek tek
                netleştiririz.
              </p>
              <CtaButton href="/ev-degerleme" variant="primary" className="mt-4">
                Değerlemeyle Başlayın
              </CtaButton>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <Reveal>
          <h2 className="text-2xl">Eryaman&apos;daki Evimi Uzaktan Satabilir miyim?</h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Evet — Eryaman&apos;daki evinizi şehir dışından, hatta yurt dışından da
            satabilirsiniz. Değerleme görüşmesi telefonla veya görüntülü yapılır, gösterimleri
            biz yönetiriz; tapu günü için kapsamı dar tutulmuş bir vekâlet yeterlidir. Tayin,
            iş ya da miras — hangi sebeple uzakta olursanız olun sürecin Eryaman ayağını biz
            üstleniriz.
          </p>
          <p className="mt-4 text-base leading-relaxed text-body">
            Ayrıntılar{" "}
            <Link
              href="/blog/eryaman-disinda-yasayanlar-icin-ev-satisi-kiralama"
              className="font-semibold text-gold-dark hover:underline"
            >
              uzaktan satış rehberimizde
            </Link>
            ; ev miras kaldıysa intikalden satışa kadar olan adımları da birlikte planlarız.
          </p>
        </Reveal>
      </section>

      <section className="mt-12 max-w-3xl">
        <Reveal>
          <h2 className="text-2xl">Eryaman&apos;da Evimi Hızlı Satmak İçin Ne Yapmalıyım?</h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Eryaman&apos;da evi hızlı satmanın yolu ilan çokluğu değil,{" "}
            <strong>doğru fiyatla çıkmaktır</strong>: emsal satışlara dayanan gerçekçi bir
            fiyat, derli toplu bir sunum ve ciddi alıcının hızla ayrıştırılması — satışları
            hızlandıran üç şey budur. Piyasanın üzerinde başlayan ilan aylarca bekler, sonra
            art arda indirimlerle &quot;pazarlıklı ev&quot; izlenimi verir.
          </p>
          <p className="mt-4 text-base leading-relaxed text-body">
            Eviniz bir süredir satılmıyorsa da başlangıç noktası aynıdır: fiyatı ve sunumu
            birlikte gözden geçirmek.
          </p>
        </Reveal>
      </section>

      <section className="mt-12 max-w-3xl">
        <Reveal>
          <h2 className="text-2xl">Neden Şirin Gayrimenkul?</h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Şirin Gayrimenkul, Eryaman&apos;da genel bir portal değil, bölgeye gömülü bir yerel
            ofistir: 11 mahallenin her sitesinin envanterini tapu kayıtlarına dayanarak tek tek
            tutuyoruz. Bu, dairenize fiyat konuşurken &quot;mahalle ortalaması&quot;yla değil,
            kendi sitenizin gerçek hareketliliğiyle konuşmamız; satışı da ilan verip beklemeden,
            süreci adım adım yöneterek yürütmemiz demektir.
          </p>
          <p className="mt-4 text-base leading-relaxed text-body">
            Satış rehberlerimizi de aynı dürüstlükle yazdık:{" "}
            <Link href="/blog/eryamanda-ev-satis-sureci" className="font-semibold text-gold-dark hover:underline">
              satış süreci adım adım
            </Link>{" "}
            ve{" "}
            <Link href="/blog/eryamanda-ev-fiyatlarini-ne-belirler" className="font-semibold text-gold-dark hover:underline">
              fiyatı ne belirler
            </Link>{" "}
            — hepsi açık. Bilgi bizde saklı değil; farkımız, bu bilgiyi sizin eviniz için
            uygulamak.
          </p>
        </Reveal>
      </section>

      <section className="mt-12 max-w-3xl">
        <Reveal>
          <h2 className="text-2xl">İlk Görüşme Neye Benzer?</h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Eryaman&apos;da satış için ilk görüşme bir satış konuşması değil, bir durum
            tespitidir: dairenin sitesi, katı, durumu ve tapu tipi üzerinden konuşuruz; sonunda
            elinizde gerçekçi bir fiyat aralığı ve &quot;bu evi satmak için önce şunu
            yapmalı&quot; diyebileceğimiz kısa bir yol haritası olur. Devam etmeye karar
            vermeseniz de o bilgi sizde kalır — yetki sözleşmesi ayrı ve sonraki bir adımdır.
          </p>
          <p className="mt-4 text-base leading-relaxed text-body">
            Evinizi bize emanet etme zorunluluğunuz yoktur; yetkinin kapsamını ve süresini ilk
            görüşmede madde madde anlatırız — ne imzaladığınızı bilmeden hiçbir adım atılmaz.{" "}
            <strong className="font-semibold text-navy">
              Süreci bize bıraktığınızda telefonunuz da susar:
            </strong>{" "}
            ilanda bizim numaramız yer alır, gün boyu gelen &quot;fiyat düşer mi&quot; aramalarını
            ve portföy toplayan aracıları biz karşılarız; siz yalnızca ciddi alıcı çıktığında
            aranırsınız.
          </p>
        </Reveal>
      </section>

      <FaqSection title="Eryaman'da Ev Satmak Hakkında Sık Sorulanlar" items={faqItems} />

      {/* Kardeş hizmet sayfasına bağlamsal bağ (2026-08-08 iç link denetimi):
          iki hizmet sayfası birbirine yalnız footer'dan bağlıydı, oysa ev
          sahibi çoğu zaman "satsam mı kiraya mı versem" ikilemiyle geliyor —
          soru yukarıdaki SSS'te de var ve SSS cevapları düz metin (link
          alamıyor, bkz. FaqItem.cevap). */}
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
        Satmakla kiraya vermek arasında kararsızsanız sürecin diğer tarafını{" "}
        <Link
          href="/eryamanda-ev-kiraya-vermek"
          className="font-semibold text-gold-dark hover:underline"
        >
          Eryaman&apos;da evinizi kiraya vermek
        </Link>{" "}
        sayfasında anlattık; iki işi de yaptığımız için sizi bir yöne itmiyoruz.
      </p>



      {/* Tam mahalle adlarıyla hizmet bölgesi köprüleri: "X mahallesi emlakçı"
          sorgularında yüksek otoriteli hizmet sayfasından tam-eşleşme çapa
          sinyali (2026-07-31 SERP taraması — 7 mahalle ilk sayfada değildi). */}
      <section className="mt-14 max-w-3xl">
        <h2 className="text-xl">Hangi Mahallelerde Çalışıyoruz?</h2>
        <p className="mt-3 text-base leading-relaxed text-body">
          Eryaman tarafında{" "}
          {getYayindaMahalleler()
            .filter((m) => m.ilce === "Etimesgut")
            .map((m, i, dizi) => (
              <span key={m.slug}>
                <Link
                  href={`/mahalleler/${m.slug}`}
                  className="font-medium text-navy hover:text-gold-dark hover:underline"
                >
                  {m.isim}
                </Link>
                {i < dizi.length - 2 ? ", " : i === dizi.length - 2 ? " ve " : ""}
              </span>
            ))}
          ; komşu Yenimahalle tarafında{" "}
          {getYayindaMahalleler()
            .filter((m) => m.ilce === "Yenimahalle")
            .map((m, i, dizi) => (
              <span key={m.slug}>
                <Link
                  href={`/mahalleler/${m.slug}`}
                  className="font-medium text-navy hover:text-gold-dark hover:underline"
                >
                  {m.isim}
                </Link>
                {i < dizi.length - 2 ? ", " : i === dizi.length - 2 ? " ve " : ""}
              </span>
            ))}
          {" "}için mahalle emlakçınız olarak çalışıyoruz — her mahallenin site envanteri kendi
          rehber sayfasında.
        </p>
      </section>

      <CtaBanner
        size="large"
        className="mt-14"
        baslik="Satış Kararının İlk Adımı: Değerleme"
        aciklama="Dairenizin güncel satış değerini sitenizdeki gerçek emsallerle birlikte netleştirelim; satış yol haritanızı aynı görüşmede çıkaralım."
      >
        <CtaButton href="/ev-degerleme" variant="primary">
          Evinizi Değerlendirelim
        </CtaButton>
        <CtaButton href={`tel:${siteConfig.phoneTel}`} variant="outline-light">
          {siteConfig.phoneDisplay}
        </CtaButton>
      </CtaBanner>

      {/* Hub-spoke tamamlama (iç bağ ölçümü 2026-07-29): bu sayfa konunun
          HUB'ı ama rehberlerin yalnız bir kısmına düzyazıdan bağlanıyordu.
          Kitaplık veri-güdümlü: lib/blog-konular.ts haritasına eklenen her
          yeni rehber otomatik listeye girer. */}
      <section className="mt-12">
        <h2 className="text-xl">Satış Rehberi Kitaplığı</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {getAllBlogPosts()
            .filter((post) => getBlogKonu(post.slug) === "satis")
            .map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-semibold text-gold-dark hover:underline"
                >
                  {post.baslik}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
