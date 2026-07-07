import type { EtapEntry } from "@/lib/content";
import { adaDisplayLabel, mahalleKisaIsim } from "@/lib/content";
import type { Mahalle, Site } from "@/lib/types";
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
        ? `${siteConfig.name}, Eryaman (${mahalle.ilce}) bölgesinde emlak danışmanlığı yapıyor; ${site.isim} de yakından tanıdığımız ${tipi} bir yerleşim. Bu sitedeki satılık/kiralık seçenekler hakkında bilgi vermekten mutluluk duyarız.`
        : `${siteConfig.name}, Eryaman (${mahalle.ilce}) bölgesinde emlak danışmanlığı yapıyor ve bu sitedeki satılık/kiralık seçenekler hakkında bilgi verebiliyor. Detaylar için bizimle iletişime geçebilirsiniz.`,
    },
    {
      soru: `${site.isim}'nde satılık veya kiralık daire var mı?`,
      cevap: `Güncel satılık ve kiralık ilanlarımız sahibinden.com üzerindeki mağazamızda yayınlanır. Aradığınız daire şu anda listede yoksa bizi ${siteConfig.phoneDisplay} numarasından arayın; ${site.isim}'nde portföyümüze eklenen daireleri size ilk biz haber verelim.`,
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
          : `${site.isim}'nin ada numarası kaçtır?`,
      cevap:
        site.adalar.length > 1
          ? `${site.isim}, ${adaListesi} adaları üzerinde yer alıyor.`
          : `${site.isim}, ${adaListesi} adası üzerinde yer alıyor.`,
    });
  }

  items.push({
    soru: `${site.isim}'ndeki dairemi satmak istiyorum, nereden başlamalıyım?`,
    cevap: `İlk adım doğru fiyatı bilmek: ${site.isim}'ndeki dairenizi mahalle ortalamasından değil, sitenizdeki gerçek satış hareketliliğinden yola çıkarak birlikte değerliyoruz. Ardından fotoğraf ve tanıtım, alıcı görüşmeleri ve tapu sürecini sizin adınıza biz yönetiyoruz. Bizi ${siteConfig.phoneDisplay} numarasından arayın veya değerleme formunu doldurun; aynı gün dönüş yapalım.`,
  });
  items.push({
    soru: `${site.isim}'nde dairemi kiraya vermek istiyorum, kira bedeli ne olmalı?`,
    cevap: `Doğru kira, ${site.isim}'ndeki emsal dairelerin gerçekleşen kiralarından okunur; ilan sitelerinde görünen fiyatlar çoğu zaman yanıltıcıdır. Kiralamayı bize emanet ettiğinizde dairenize özel kira tespitini biz yapıyoruz; sonrasında kiracı doğrulama, sözleşme ve fotoğraflı teslim tutanağı dahil tüm süreci üstleniyoruz.`,
  });
  items.push({
    soru: `${site.isim} hakkında güncel ilan veya fiyat bilgisi nereden alabilirim?`,
    cevap: `${site.isim} ile ilgili güncel satılık/kiralık ilanlarımıza sahibinden.com mağazamızdan ulaşabilir, fiyat ve detaylar için bizi ${siteConfig.phoneDisplay} numarasından arayabilir veya WhatsApp ile yazabilirsiniz.`,
  });

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
