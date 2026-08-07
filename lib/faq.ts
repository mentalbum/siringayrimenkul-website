import type { AdaEntry, EtapEntry } from "@/lib/content";
import { eryamandaMi } from "./bolge";
import { adaDisplayLabel, mahalleKisaIsim } from "@/lib/content";
import type { Mahalle, Site } from "@/lib/types";
import { bulunmaHali, bulunmaHaliKi, tamlayanHali, dahiBaglaci } from "@/lib/turkce";
import { siteConfig } from "@/lib/site-config";
import { inferSiteTipi } from "@/lib/site-tipi";
import { adaOnayliEtap, onayliEtap } from "@/lib/etap-onayli";

export interface FaqItem {
  soru: string;
  cevap: string;
  /** true ise FAQPage JSON-LD'ye GİRMEZ, yalnız sayfada görünür. Neden:
   * 720 site sayfasında yalnız site adı çekimlenen jenerik pazarlama soruları
   * şemaya birebir aynı cevapla giriyordu — "ölçeklendirilmiş içerik" sinyali.
   * Şemada yalnız siteye özgü, veriye dayalı sorular kalır. */
  semaDisi?: boolean;
}

export function getMahalleFaq(mahalle: Mahalle, siteSayisi: number): FaqItem[] {
  const items: FaqItem[] = [
    {
      soru: `${mahalle.isim} hangi ilçede yer alıyor?`,
      cevap: `${mahalle.isim}, Ankara'nın ${mahalle.ilce} ilçesine bağlıdır.`,
    },
  ];

  if (siteSayisi > 0) {
    items.push({
      soru: `${mahalle.isim}'nde kaç site veya rezidans var?`,
      cevap: `${siteConfig.name} olarak ${mahalle.isim} içinde tanıdığımız ${siteSayisi} site/rezidans bulunuyor. Tümünü bu sayfadaki listeden inceleyebilirsiniz.`,
    });
  }

  if (mahalle.uzunAciklama && mahalle.uzunAciklama.length > 0) {
    items.push({
      soru: `${mahalle.isim} yaşamak için nasıl bir yer?`,
      cevap: mahalle.uzunAciklama[0],
    });
  }

  items.push({
    soru: `${mahalle.isim}'nde evimi satmak veya kiraya vermek istiyorum, nasıl başvurabilirim?`,
    cevap: `${siteConfig.name} olarak evini satmayı veya kiraya vermeyi düşünen ev sahipleri için değerleme ve yol haritası çıkarıyoruz; bizi ${siteConfig.phoneDisplay} numarasından arayabilir veya WhatsApp ile yazabilirsiniz.`,
  });

  const kisaIsim = mahalleKisaIsim(mahalle);
  items.push({
    soru: `${kisaIsim} emlakçısı kimdir — ${mahalle.isim}'nde kiminle iletişime geçebilirim?`,
    cevap: `${kisaIsim} emlakçısı olarak ${siteConfig.name}, ${mahalle.isim}'ndeki site ve rezidansları yakından tanıyor. Güncel ilanlarımıza sahibinden.com üzerinden ulaşabilir veya bizi ${siteConfig.phoneDisplay} numarasından arayabilirsiniz.`,
  });

  const alias = mahalle.alternatifAdlar?.[0];
  if (alias) {
    items.push({
      soru: `${alias} emlakçısı mı arıyorsunuz?`,
      cevap: `${mahalle.isim}, ${alias} Mahallesi'nden ayrılarak kuruldu ve bölge halk arasında hâlâ ${alias} olarak biliniyor. ${alias} emlakçısı olarak ${siteConfig.name}, bu bölgedeki site ve rezidansları yakından tanıyor; evinizi satmak veya kiraya vermek için bizi ${siteConfig.phoneDisplay} numarasından arayabilirsiniz.`,
    });
  }

  return items;
}

/**
 * "Eryaman'da emlakçılık yapıyoruz" ifadesi Ata/Susuz/Cumhuriyet sitelerinde
 * yanlış konum iddiası doğurur — o mahalleler Yenimahalle'dedir. Eryaman
 * tarafında bölge adını, komşu tarafta mahalle adını kullan (lib/bolge.ts).
 */
function hizmetBolgesi(mahalle: Mahalle): string {
  return eryamandaMi(mahalle)
    ? `Eryaman (${mahalle.ilce}) bölgesinde`
    : `${mahalle.isim} ve çevresinde`;
}

export function getSiteFaq(site: Site, mahalle: Mahalle): FaqItem[] {
  const tipi = inferSiteTipi(site.isim);
  const items: FaqItem[] = [
    {
      soru: `${site.isim} hangi mahallede yer alıyor?`,
      cevap: `${site.isim}, Ankara'nın ${mahalle.ilce} ilçesine bağlı ${mahalle.isim}'nde${
        eryamandaMi(mahalle) ? " — Eryaman bölgesinde —" : ""
      } yer alıyor. ${mahalle.kisaAciklama}`,
    },
    {
      semaDisi: true,
      soru: `${site.isim} emlakçısı kimdir?`,
      cevap: tipi
        ? `${siteConfig.name}, ${hizmetBolgesi(mahalle)} emlak danışmanlığı yapıyor; ${site.isim} ${dahiBaglaci(site.isim)} yakından tanıdığımız ${tipi} bir yerleşim. Bu sitede evi olan sahiplerin satış ve kiralama sürecini uçtan uca yönetiyoruz.`
        : `${siteConfig.name}, ${hizmetBolgesi(mahalle)} emlak danışmanlığı yapıyor ve bu sitede evi olan sahiplerin satış ve kiralama sürecini uçtan uca yönetiyor. Detaylar için bizimle iletişime geçebilirsiniz.`,
    },
    {
      // EV SAHİBİ dilinde (2026-08-07): eski soru "satılık veya kiralık daire
      // var mı?" idi — telefon eden müşteriler birebir bu soruyu soruyordu ve
      // Google başlık türetirken sayfadaki bu kalıbı kullanıyordu. Soru artık
      // hedef kitlenin sorusu; alıcıyı mağazaya yönlendiren cümle cevabın
      // içinde duruyor (filtre işlevi korunuyor).
      semaDisi: true,
      soru: `${bulunmaHali(site.isim)} dairesi olanlara hangi hizmetleri veriyorsunuz?`,
      cevap: `${bulunmaHali(site.isim)} evi olan sahipler için üç işi üstleniyoruz: emsallere dayalı değerleme, satış temsili (tanıtım, alıcı görüşmeleri, tapu) ve kiralama yönetimi (kira tespiti, kiracı doğrulama, sözleşme). Daire arayanlar içinse güncel ilanlarımız sahibinden.com mağazamızda yayınlanır. Bize ${siteConfig.phoneDisplay} numarasından ulaşabilirsiniz.`,
    },
  ];

  if (site.adalar && site.adalar.length > 0) {
    const adaListesi = site.adalar
      .map((ada) => `${adaDisplayLabel(ada)}${ada.blok ? ` (${ada.blok} Blok)` : ""}`)
      .join(", ");
    items.push({
      soru:
        site.adalar.length > 1
          ? `${site.isim} hangi adalar üzerinde yer alıyor?`
          : `${tamlayanHali(site.isim)} ada numarası kaçtır?`,
      cevap:
        site.adalar.length > 1
          ? `${site.isim}, ${adaListesi} adaları üzerinde yer alıyor.`
          : `${site.isim}, ${adaListesi} adası üzerinde yer alıyor.`,
    });
  }

  items.push({
    semaDisi: true,
    soru: `${bulunmaHaliKi(site.isim)} dairemi satmak istiyorum, nereden başlamalıyım?`,
    cevap: `İlk adım doğru fiyatı bilmek: ${bulunmaHaliKi(site.isim)} dairenizi mahalle ortalamasından değil, sitenizdeki gerçek satış hareketliliğinden yola çıkarak birlikte değerliyoruz. Ardından fotoğraf ve tanıtım, alıcı görüşmeleri ve tapu sürecini sizin adınıza biz yönetiyoruz. Bizi ${siteConfig.phoneDisplay} numarasından arayın veya değerleme formunu doldurun; aynı gün dönüş yapalım.`,
  });
  items.push({
    semaDisi: true,
    soru: `${bulunmaHaliKi(site.isim)} daire fiyatları ne durumda?`,
    cevap: `Fiyatlar bu dönemde hızla değiştiği için ilanlarda görülen rakamlar çoğu zaman güncelliğini yitiriyor; sağlıklı fiyat, ${bulunmaHaliKi(site.isim)} gerçekleşen satış ve kiralamalardan okunur. Tam da bu yüzden sitemizde sabit fiyat rakamı yayınlamıyoruz: birkaç ay önce yazılmış bir rakam sizi yanıltır. Dairenizi güncel arz-talep koşullarına göre değerlendiriyoruz — bizi ${siteConfig.phoneDisplay} numarasından arayın, siteyi blok blok tanıyoruz.`,
  },
  {
    semaDisi: true,
    soru: `${bulunmaHali(site.isim)} dairemi kiraya vermek istiyorum, kira bedeli ne olmalı?`,
    cevap: `Doğru kira, ${bulunmaHaliKi(site.isim)} emsal dairelerin gerçekleşen kiralarından okunur; ilan sitelerinde görünen fiyatlar çoğu zaman yanıltıcıdır. Kiralamayı bize emanet ettiğinizde dairenize özel kira tespitini biz yapıyoruz; sonrasında kiracı doğrulama, sözleşme ve fotoğraflı teslim tutanağı dahil tüm süreci üstleniyoruz.`,
  });
  // Siteye ÖZEL sorular — kaydın kendi tapu diline göre. Ziyaretçi kendi
  // sitesinin sayfasında kendi durumunun cevabını görsün diye; hepsi mevcut
  // veriden türer, uydurma yok. (Jenerik "güncel ilan nereden" sorusu 3.
  // maddeyle çakıştığı için kaldırıldı — sayı artmıyor, isabet artıyor.)
  const metin = `${site.aciklama} ${(site.ozellikler ?? []).join(" ")}`.toLocaleLowerCase("tr");

  if (metin.includes("ofis-işyeri") || metin.includes("ofis işyeri") || metin.includes("büro")) {
    items.push({
      soru: `${bulunmaHaliKi(site.isim)} tapu niteliği nedir — konut mu, ofis mi?`,
      cevap: `Tapu kaydında bu yapı ofis-işyeri niteliğiyle görünüyor; bölgedeki birçok rezidansta karşılaşılan bir durumdur. Daire fiilen konut olarak kullanılsa da tapu tipi değerlemeyi, alıcının kredi sürecini ve aidat/kullanım düzenini etkileyebilir. Satış ya da kiralama öncesi güncel tapu kaydını birlikte kontrol edip sizi doğru bilgilendiriyoruz; bu tapu tipinin ne anlama geldiğini sözlüğümüzdeki rezidans tapusu maddesinde de anlattık.`,
    });
  } else if (metin.includes("kat irtifak")) {
    items.push({
      soru: `${bulunmaHaliKi(site.isim)} tapu kat irtifaklı mı, kat mülkiyetli mi?`,
      cevap: `Kayıtlarımızda bu parsel kat irtifakı aşamasında görünüyor. Kat irtifakı satışa engel değildir; ancak kat mülkiyetine geçmiş bir tapu alıcı gözünde daha nettir ve süreci hızlandırır. İşlem öncesi güncel kaydı birlikte kontrol eder, gerekirse geçiş adımlarını anlatırız — kat irtifakından kat mülkiyetine geçiş rehberimizde süreci adım adım bulabilirsiniz.`,
    });
  }

  if (metin.includes("paylaş")) {
    items.push({
      soru: `${site.isim} komşu siteyle aynı parseli mi paylaşıyor?`,
      cevap: `Evet — bölgenin kooperatif kökenli dokusunda birden çok sitenin tek bir tapu parselini paylaşması sık görülür. Bu, dairenizin bağımsız bölüm olarak satılmasına engel değildir; ama emsal seçerken hangi bloğun hangi siteye ait olduğunu bilmek fiyatı doğrudan etkiler. Bu ayrımı blok blok tutuyoruz.`,
    });
  }

  if (site.adalar && site.adalar.length > 2) {
    items.push({
      soru: `${site.isim} kaç ayrı ada üzerine yayılıyor?`,
      cevap: `${site.isim}, ${site.adalar.length} ayrı tapu adasına yayılan bir yerleşim. Bu ölçekteki sitelerde aynı ad altında farklı yapı grupları bulunabilir; dairenizin hangi adada ve hangi blokta olduğu değerlemede belirleyicidir.`,
    });
  }

  // "Kaçıncı etapta?" sorusu yalnız RESMÎ ada listesiyle doğrulanmış etaplarda
  // üretilir (lib/etap-onayli.ts). Kayıttaki adalar[].etap alanı iç gruplama
  // verisidir; doğrulanmamış bilgiyi soru-cevap biçiminde yazmak onu daha da
  // kesin gösterir, o yüzden oradan beslenmiyoruz.
  const etap = onayliEtap(site.adalar);
  if (etap) {
    items.push({
      soru: `${site.isim} Eryaman'ın kaçıncı etabında?`,
      cevap: `${site.isim}, Eryaman ${etap}. Etap sınırları içindedir — bunu ${etap}. Etap Toplu Yapı Yönetimi'nin yayımladığı resmî ada listesiyle doğruluyoruz. Etaplar Eryaman'da yapılaşma dönemini ve dokusunu anlatır; alıcılar da çoğu zaman "kaçıncı etap" diye sorduğu için ilan ve tanıtımda etabı belirtmek işe yarar.`,
    });
  }

  return items;
}

export function getEtapFaq(etap: EtapEntry, mahalle: Mahalle): FaqItem[] {
  return [
    {
      soru: `Eryaman ${etap.no}. Etap hangi mahallede yer alıyor?`,
      cevap: `Eryaman ${etap.no}. Etap, Ankara'nın ${mahalle.ilce} ilçesine bağlı ${mahalle.isim} içinde yer alıyor.`,
    },
    {
      soru: `Eryaman ${etap.no}. Etap'ta kaç site veya ada var?`,
      // Kayıtlarımız resmî listenin alt kümesiyse sayıyı etap toplamı gibi sunma.
      cevap:
        etap.adalar.length === etap.resmiAdaSayisi
          ? `Eryaman ${etap.no}. Etap'ta ${siteConfig.name} olarak tanıdığımız ${etap.siteler.length} site/rezidans ve ${etap.adalar.length} ada bulunuyor.`
          : `Eryaman ${etap.no}. Etap'ın resmî ada listesi ${etap.resmiAdaSayisi} adayı kapsıyor; ${siteConfig.name} olarak bu adalardan ${etap.adalar.length} tanesini ve üzerlerindeki ${etap.siteler.length} site/rezidansı tek tek tanıyoruz.`,
    },
    // "eston hangi etap" tipi gerçek soru; cevap iddiasız tespit (2026-08-07
    // araştırması: resmî listeler + ilan dili + tapulu plan, sorunlu-siteler.md).
    ...(etap.no === "2"
      ? [
          {
            soru: "Eston Blokları, İçtaş ve Cumhuriyet Sitesi 2. Etap'ta mı?",
            cevap:
              "Resmî 2. Etap toplu yapı listesi 17 ada ile sınırlıdır ve bu siteleri kapsamaz; tapu kaydında bu şeridin toplu yapı bağı Eryaman (1. Etap) yönetim planınadır. Gündelik kullanımda ve ilan dilinde ise şerit 2. Etap'la birlikte anılır. Her üç sitenin kendi sayfasında tapu kimliği ayrıca kayıtlıdır.",
          },
        ]
      : []),
    {
      soru: `Eryaman ${etap.no}. Etap'ta evimi satmak veya kiraya vermek istiyorum, nasıl başvurabilirim?`,
      cevap: `${siteConfig.name} olarak evini satmayı veya kiraya vermeyi düşünen ev sahipleri için değerleme ve yol haritası çıkarıyoruz; bizi ${siteConfig.phoneDisplay} numarasından arayabilir veya WhatsApp ile yazabilirsiniz.`,
    },
    {
      soru: `Eryaman ${etap.no}. Etap'ta ev almak veya kiralamak için kiminle iletişime geçebilirim?`,
      cevap: `${siteConfig.name} olarak Eryaman ${etap.no}. Etap'taki siteleri yakından tanıyoruz. Güncel ilanlarımıza sahibinden.com üzerinden ulaşabilir veya bizi ${siteConfig.phoneDisplay} numarasından arayabilirsiniz.`,
    },
  ];
}

export function getAdaFaq(label: string, entries: AdaEntry[], mahalle: Mahalle): FaqItem[] {
  const ada = entries[0];
  const tekSite = entries.length === 1;
  const siteAdi = ada.site.isim;
  const siteIsimleri = entries.map((entry) => entry.site.isim).join(", ");
  // Etap notu yalnız resmî listeyle doğrulanmışsa eklenir (lib/etap-onayli.ts).
  const dogrulanmisEtap = adaOnayliEtap(ada.no);
  const etapNot = dogrulanmisEtap ? ` ve Eryaman ${dogrulanmisEtap}. Etap sınırları içindedir` : "";
  return [
    // EV SAHİBİ dilinde (2026-08-07): eski iki soru "satılık/kiralık daire var
    // mı?" idi — alıcı sorusu. Telefonla arayanlar birebir bunu soruyordu ve
    // Google, sayfa başlıklarını türetirken bu kalıpları kullanıyordu. Sorular
    // artık evi olan sahibin sorusu; alıcı yönlendirmesi cevap içinde sürüyor.
    {
      soru: `${label} Ada'daki dairemi satmak istiyorum, nasıl ilerliyoruz?`,
      cevap: `İlk adım doğru fiyat: ${label} Ada'daki (${siteIsimleri}) dairenizi bu adadaki gerçek satış hareketliliğinden yola çıkarak birlikte değerliyoruz; ardından tanıtım, alıcı görüşmeleri ve tapu sürecini sizin adınıza biz yönetiyoruz. Bizi ${siteConfig.phoneDisplay} numarasından arayın. (Daire arayanlar için güncel ilanlarımız sahibinden.com mağazamızdadır.)`,
    },
    {
      soru: `${label} Ada'daki dairemi kiraya vermek istiyorum, kira bedeli ne olmalı?`,
      cevap: `Doğru kira, bu adadaki emsal dairelerin gerçekleşen kiralarından okunur; ilan sitelerindeki rakamlar çoğu zaman yanıltıcıdır. Kiralamayı bize emanet ettiğinizde dairenize özel kira tespitini biz yapıyoruz; kiracı doğrulama, sözleşme ve teslim tutanağı dahil süreci üstleniyoruz. Bizi ${siteConfig.phoneDisplay} numarasından arayabilirsiniz.`,
    },
    {
      soru: `${label} Ada'daki daire fiyatları ne durumda?`,
      cevap: `Fiyatlar bu dönemde hızla değiştiği için ilanlarda görülen rakamlar çoğu zaman güncelliğini yitiriyor; sağlıklı fiyat, bu adadaki ve ${tekSite ? bulunmaHaliKi(siteAdi) : "çevresindeki sitelerde"} gerçekleşen satış ve kiralamalardan okunur. Dairenizin güncel değeri için bizi ${siteConfig.phoneDisplay} numarasından arayın.`,
    },
    {
      soru: `${label} Ada hangi sitede yer alıyor?`,
      cevap: tekSite
        ? `${label} Ada, ${mahalle.isim} sınırları içindedir; ${tamlayanHali(siteAdi)} bir parçasıdır${etapNot}.`
        : `${label} Ada, ${mahalle.isim} sınırları içindedir${etapNot}; bu parselde ${entries.length} ayrı site bulunur: ${siteIsimleri}.`,
    },
    {
      soru: `Bu adadaki evimi satmak istiyorum — süreç nasıl işler?`,
      cevap: `İlk adım doğru fiyat: dairenizi ilan sitelerindeki 'istenen' rakamlardan değil, adanızdaki ve sitenizdeki gerçek satış hareketliliğinden yola çıkarak birlikte değerliyoruz. Ardından tanıtım, alıcı görüşmeleri ve tapu sürecini sizin adınıza biz yönetiyoruz. Bizi ${siteConfig.phoneDisplay} numarasından arayın veya değerleme formunu doldurun; aynı gün dönüş yapalım.`,
    },
  ];
}
