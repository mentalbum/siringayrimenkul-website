import type { EtapEntry } from "@/lib/content";
import type { Mahalle, Site } from "@/lib/types";
import { siteConfig } from "@/lib/site-config";

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
    soru: `${mahalle.isim}'nde ev almak veya kiralamak için kiminle iletişime geçebilirim?`,
    cevap: `${siteConfig.name} olarak ${mahalle.isim}'ndeki site ve rezidansları yakından tanıyoruz. Güncel ilanlarımıza sahibinden.com üzerinden ulaşabilir veya bizi ${siteConfig.phoneDisplay} numarasından arayabilirsiniz.`,
  });

  return items;
}

export function getSiteFaq(site: Site, mahalle: Mahalle): FaqItem[] {
  const items: FaqItem[] = [
    {
      soru: `${site.isim} hangi mahallede yer alıyor?`,
      cevap: `${site.isim}, Ankara'nın ${mahalle.ilce} ilçesine bağlı ${mahalle.isim}'nde yer alıyor.`,
    },
    {
      soru: `${site.isim} emlakçısı kimdir?`,
      cevap: `${siteConfig.name}, ${mahalle.ilce} bölgesinde emlak danışmanlığı yapıyor ve bu sitedeki satılık/kiralık seçenekler hakkında bilgi verebiliyor. Detaylar için bizimle iletişime geçebilirsiniz.`,
    },
  ];

  if (site.adalar && site.adalar.length > 0) {
    const adaListesi = site.adalar
      .map((ada) => `${ada.no}${ada.blok ? ` (${ada.blok} Blok)` : ""}`)
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
    soru: `Bu sitede evimi satmak veya kiraya vermek istiyorum, nasıl başvurabilirim?`,
    cevap: `${siteConfig.name} olarak ücretsiz değerlendirme yapıyoruz; bizi ${siteConfig.phoneDisplay} numarasından arayabilir veya WhatsApp ile yazabilirsiniz.`,
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
      soru: `Eryaman ${etap.no}. Etap'ta ev almak veya kiralamak için kiminle iletişime geçebilirim?`,
      cevap: `${siteConfig.name} olarak Eryaman ${etap.no}. Etap'taki siteleri yakından tanıyoruz. Güncel ilanlarımıza sahibinden.com üzerinden ulaşabilir veya bizi ${siteConfig.phoneDisplay} numarasından arayabilirsiniz.`,
    },
  ];
}
