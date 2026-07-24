import type { AdaEntry, EtapEntry } from "@/lib/content";
import { adaDisplayLabel, mahalleKisaIsim } from "@/lib/content";
import type { Mahalle, Site } from "@/lib/types";
import { bulunmaHali, bulunmaHaliKi, tamlayanHali, dahiBaglaci } from "@/lib/turkce";
import { siteConfig } from "@/lib/site-config";
import { inferSiteTipi } from "@/lib/site-tipi";

export interface FaqItem {
  soru: string;
  cevap: string;
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

export function getSiteFaq(site: Site, mahalle: Mahalle): FaqItem[] {
  const tipi = inferSiteTipi(site.isim);
  const items: FaqItem[] = [
    {
      soru: `${site.isim} hangi mahallede yer alıyor?`,
      cevap: `${site.isim}, Ankara'nın ${mahalle.ilce} ilçesindeki Eryaman bölgesinde, ${mahalle.isim}'nde yer alıyor. ${mahalle.kisaAciklama}`,
    },
    {
      soru: `${site.isim} emlakçısı kimdir?`,
      cevap: tipi
        ? `${siteConfig.name}, Eryaman (${mahalle.ilce}) bölgesinde emlak danışmanlığı yapıyor; ${site.isim} ${dahiBaglaci(site.isim)} yakından tanıdığımız ${tipi} bir yerleşim. Bu sitedeki satılık/kiralık seçenekler hakkında bilgi vermekten mutluluk duyarız.`
        : `${siteConfig.name}, Eryaman (${mahalle.ilce}) bölgesinde emlak danışmanlığı yapıyor ve bu sitedeki satılık/kiralık seçenekler hakkında bilgi verebiliyor. Detaylar için bizimle iletişime geçebilirsiniz.`,
    },
    {
      soru: `${bulunmaHali(site.isim)} satılık veya kiralık daire var mı?`,
      cevap: `Güncel satılık ve kiralık ilanlarımız sahibinden.com üzerindeki mağazamızda yayınlanır. Aradığınız daire şu anda listede yoksa bizi ${siteConfig.phoneDisplay} numarasından arayın; ${bulunmaHali(site.isim)} portföyümüze eklenen daireleri size ilk biz haber verelim.`,
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
    soru: `${bulunmaHaliKi(site.isim)} dairemi satmak istiyorum, nereden başlamalıyım?`,
    cevap: `İlk adım doğru fiyatı bilmek: ${bulunmaHaliKi(site.isim)} dairenizi mahalle ortalamasından değil, sitenizdeki gerçek satış hareketliliğinden yola çıkarak birlikte değerliyoruz. Ardından fotoğraf ve tanıtım, alıcı görüşmeleri ve tapu sürecini sizin adınıza biz yönetiyoruz. Bizi ${siteConfig.phoneDisplay} numarasından arayın veya değerleme formunu doldurun; aynı gün dönüş yapalım.`,
  });
  items.push({
    soru: `${bulunmaHaliKi(site.isim)} daire fiyatları ne durumda?`,
    cevap: `Fiyatlar bu dönemde hızla değiştiği için ilanlarda görülen rakamlar çoğu zaman güncelliğini yitiriyor; sağlıklı fiyat, ${bulunmaHaliKi(site.isim)} gerçekleşen satış ve kiralamalardan okunur. Dairenizin veya almak istediğiniz dairenin güncel değerini öğrenmek için bizi ${siteConfig.phoneDisplay} numarasından arayın — siteyi blok blok tanıyoruz.`,
  },
  {
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
      cevap: `Evet — Eryaman'ın kooperatif kökenli dokusunda birden çok sitenin tek bir tapu parselini paylaşması sık görülür. Bu, dairenizin bağımsız bölüm olarak satılmasına engel değildir; ama emsal seçerken hangi bloğun hangi siteye ait olduğunu bilmek fiyatı doğrudan etkiler. Bu ayrımı blok blok tutuyoruz.`,
    });
  }

  if (site.adalar && site.adalar.length > 2) {
    items.push({
      soru: `${site.isim} kaç ayrı ada üzerine yayılıyor?`,
      cevap: `${site.isim}, ${site.adalar.length} ayrı tapu adasına yayılan bir yerleşim. Bu ölçekteki sitelerde aynı ad altında farklı yapı grupları bulunabilir; dairenizin hangi adada ve hangi blokta olduğu değerlemede belirleyicidir.`,
    });
  }

  const etap = site.adalar?.find((ada) => ada.etap)?.etap;
  if (etap) {
    items.push({
      soru: `${site.isim} Eryaman'ın kaçıncı etabında?`,
      cevap: `${site.isim}, Eryaman ${etap}. Etap bölgesinde yer alıyor. Etaplar Eryaman'da yapılaşma dönemini ve dokusunu anlatır; alıcılar da çoğu zaman "kaçıncı etap" diye sorar, bu yüzden ilan ve tanıtımda etabı belirtmek işe yarar.`,
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
      cevap: `Eryaman ${etap.no}. Etap'ta ${siteConfig.name} olarak tanıdığımız ${etap.siteler.length} site/rezidans ve ${etap.adalar.length} ada bulunuyor.`,
    },
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
  const etapNot = ada.etap ? ` ve Eryaman ${ada.etap}. Etap içinde yer alır` : "";
  return [
    {
      soru: `${label} Ada'da satılık daire var mı?`,
      cevap: `Portföyümüz sürekli değişiyor; ${label} Ada'daki (${siteIsimleri}) güncel satılık ilanlarımıza sahibinden.com mağazamızdan ulaşabilirsiniz. Aradığınız daire şu anda listede yoksa bizi ${siteConfig.phoneDisplay} numarasından arayın — bu adada portföyümüze eklenen daireleri size ilk biz haber verelim.`,
    },
    {
      soru: `${label} Ada'da kiralık daire var mı?`,
      cevap: `Kiralık portföyü satılıktan da hızlı döner; ${label} Ada için güncel kiralık seçeneklerini sahibinden.com mağazamızdan takip edebilir veya bizi ${siteConfig.phoneDisplay} numarasından arayabilirsiniz. Kiraya vermek isteyen ev sahipleri için de doğru kira tespitini birlikte yapıyoruz.`,
    },
    {
      soru: `${label} Ada'daki daire fiyatları ne durumda?`,
      cevap: `Fiyatlar bu dönemde hızla değiştiği için ilanlarda görülen rakamlar çoğu zaman güncelliğini yitiriyor; sağlıklı fiyat, bu adadaki ve ${tekSite ? bulunmaHaliKi(siteAdi) : "çevresindeki sitelerde"} gerçekleşen satış ve kiralamalardan okunur. Dairenizin veya almak istediğiniz dairenin güncel değeri için bizi ${siteConfig.phoneDisplay} numarasından arayın.`,
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
