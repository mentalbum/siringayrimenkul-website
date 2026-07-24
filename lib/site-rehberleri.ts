import type { Site } from "@/lib/types";

export interface RehberBaglantisi {
  href: string;
  etiket: string;
}

/** Site sayfasından ev sahibinin derdine giden köprüler.
 *
 * 15 kişilik saha simülasyonunun tek ortak bulgusu şuydu: ziyaretçi sitesinin
 * adını arayıp bu sayfaya düşüyor, ama derdinin cevabı (vergi, tahliye, miras,
 * kat irtifakı…) blogda kalıyor ve sayfadan oraya tek bir link yok. Bu liste o
 * köprüyü kurar — sabit dört ev sahibi rehberi + kaydın tapu diline göre
 * eklenen bağlamsal rehber(ler). */
export function siteRehberleri(site: Site): RehberBaglantisi[] {
  const rehberler: RehberBaglantisi[] = [
    { href: "/blog/eryamanda-ev-satis-sureci", etiket: "Satış süreci adım adım" },
    { href: "/blog/ev-satarken-odenecek-vergiler", etiket: "Satarken hangi vergiler ödenir?" },
    {
      href: "/blog/dairenizi-kiraya-verirken-dikkat-edilmesi-gerekenler",
      etiket: "Kiraya verirken nelere dikkat etmeli?",
    },
    { href: "/blog/emlakci-komisyonu-nasil-isler", etiket: "Komisyon nasıl işler?" },
  ];

  const metin = `${site.aciklama} ${(site.ozellikler ?? []).join(" ")}`.toLocaleLowerCase("tr");

  if (metin.includes("kat irtifak")) {
    rehberler.push({
      href: "/blog/kat-irtifakindan-kat-mulkiyetine-gecis",
      etiket: "Kat irtifakından kat mülkiyetine geçiş",
    });
  }
  if (metin.includes("ofis-işyeri") || metin.includes("ofis işyeri") || metin.includes("büro")) {
    rehberler.push({ href: "/sozluk#rezidans-tapu", etiket: "Rezidans tapusu ne demek?" });
  }
  if (metin.includes("dubleks") || metin.includes("villa")) {
    rehberler.push({ href: "/blog/evinizi-satisa-hazirlamak", etiket: "Evi satışa hazırlamak" });
  }

  return rehberler;
}
