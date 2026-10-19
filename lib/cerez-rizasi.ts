import { sendGAEvent } from "@/lib/ga";

/**
 * ÇEREZ RIZASI — tek kaynak (2026-10-07, Özgün: "ceza yemeyeceğimiz hale getir").
 *
 * Arka plan: rıza bandı 30.07'de kaldırılmış, GA herkeste çalışıyordu. KVKK
 * Çerez Uygulamaları Rehberi (2025 güncellemesi) analitik çerezler için AÇIK
 * RIZA istiyor; /gizlilik metni de "izninizle" diyordu — uygulama tersiydi.
 * 2026 ceza aralığı: aydınlatma 85.437–1.709.200 TL, veri güvenliği
 * 256.357–17.092.242 TL (sorunlu-siteler.md, 07.10 kaydı).
 *
 * Model: "temel" rıza modu. gtag.js YALNIZ "Kabul et"ten sonra yüklenir;
 * seçim yapılmamış ya da "Reddet" ise Google'a tek ping gitmez. Gelişmiş mod
 * (çerezsiz ping + modelleme) bilinçli seçilmedi: modelleme eşiği günde
 * ~1.000 rızasız olay — bu sitenin trafiğinin çok üstünde, kazanç yok.
 *
 * Saklama: localStorage'da tek kayıt (çerez değil, sunucuya gitmez). Rıza
 * tercihinin kendisini hatırlamak rehberde zorunlu/istisna sınıfında; yine de
 * /gizlilik'te açıkça yazılır. 12 ay sonra yeniden sorulur.
 *
 * Ziyaretçi, sayfa ve kaynak toplamları için Vercel Web Analytics (çerezsiz,
 * rıza gerekmez) ve arama verisi için GSC değişmeden sürer — veri akışının
 * omurgası bu ikisi; GA artık yalnız kabul edenleri sayar.
 */
export type RizaSecimi = "kabul" | "red";

export const RIZA_ANAHTARI = "cerez-rizasi";
/** window üzerinde: seçim yapıldı/değişti — detail: RizaSecimi */
export const RIZA_DEGISTI = "cerez-rizasi-degisti";
/** window üzerinde: tercih sıfırlandı, bant yeniden gösterilsin */
export const RIZA_SIFIRLA = "cerez-rizasi-sifirla";
const GECERLILIK_GUN = 365;

/** useSyncExternalStore için abonelik: tercih değişince ya da sıfırlanınca
 * (bu sekme) ve başka sekmede localStorage yazılınca bildirir. Bileşenler
 * durumu effect içinde setState ile kopyalamaz — React'in önerdiği dış-kaynak
 * okuma kalıbı; hidrasyonda sunucu anlık görüntüsü ("ssr") kullanılır. */
export function rizaAboneOl(bildir: () => void): () => void {
  window.addEventListener(RIZA_DEGISTI, bildir);
  window.addEventListener(RIZA_SIFIRLA, bildir);
  window.addEventListener("storage", bildir);
  return () => {
    window.removeEventListener(RIZA_DEGISTI, bildir);
    window.removeEventListener(RIZA_SIFIRLA, bildir);
    window.removeEventListener("storage", bildir);
  };
}

/** Anlık durum — ilkel değer döner ki useSyncExternalStore eşitlik kontrolü
 * kararlı olsun: "kabul" | "red" | "yok" (tarayıcı), "ssr" (sunucu/hidrasyon). */
export type RizaDurumu = RizaSecimi | "yok" | "ssr";
export function rizaDurumu(): RizaDurumu {
  return rizaOku() ?? "yok";
}
export function rizaSunucuDurumu(): RizaDurumu {
  return "ssr";
}

export function rizaOku(): RizaSecimi | null {
  if (typeof window === "undefined") return null;
  try {
    const ham = window.localStorage.getItem(RIZA_ANAHTARI);
    if (!ham) return null;
    const { secim, tarih } = JSON.parse(ham) as { secim?: unknown; tarih?: unknown };
    if (secim !== "kabul" && secim !== "red") return null;
    const yas = Date.now() - new Date(String(tarih)).getTime();
    if (!Number.isFinite(yas) || yas > GECERLILIK_GUN * 86_400_000) return null;
    return secim;
  } catch {
    return null;
  }
}

/** Seçimi kaydeder, gtag rıza durumunu günceller, dinleyicilere duyurur. */
export function rizaYaz(secim: RizaSecimi): void {
  try {
    window.localStorage.setItem(
      RIZA_ANAHTARI,
      JSON.stringify({ secim, tarih: new Date().toISOString() })
    );
  } catch {
    // Depolama kapalıysa (gizli pencere kısıtı vb.) seçim yalnız bu sayfa için geçer.
  }
  rizaUygula(secim);
  window.dispatchEvent(new CustomEvent<RizaSecimi>(RIZA_DEGISTI, { detail: secim }));
}

/** gtag'e rıza durumunu bildirir; red ise mevcut GA çerezlerini de siler.
 * Sayfa yüklenişinde (kayıtlı "kabul" için) ve her seçimde çağrılır — dataLayer
 * sırası: default denied → ... → update; gtag.js kuyruğu bu sırayla işler. */
export function rizaUygula(secim: RizaSecimi): void {
  sendGAEvent("consent", "update", {
    analytics_storage: secim === "kabul" ? "granted" : "denied",
  });
  if (secim === "red") gaCerezleriniSil();
}

/** Tercihi siler, GA'yı kapatır, bandı yeniden açtırır (/gizlilik düğmesi). */
export function rizaSifirla(): void {
  try {
    window.localStorage.removeItem(RIZA_ANAHTARI);
  } catch {
    // yoksay
  }
  rizaUygula("red");
  window.dispatchEvent(new Event(RIZA_SIFIRLA));
}

/** _ga ve _ga_<ölçüm kimliği> çerezlerini bu alan adı için düşürür. Google
 * çerezi kök alan adına (.siringayrimenkul.com) yazar; www'li ve noktalı
 * biçimlerin ikisi de denenir, path her zaman "/". */
function gaCerezleriniSil(): void {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const alanlar = [host, `.${host.replace(/^www\./, "")}`, host.replace(/^www\./, "")];
  const gecmis = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  for (const parca of document.cookie.split(";")) {
    const ad = parca.split("=")[0].trim();
    if (!/^_ga(_|$)/.test(ad)) continue;
    document.cookie = `${ad}=; ${gecmis}`;
    for (const alan of alanlar) document.cookie = `${ad}=; ${gecmis}; domain=${alan}`;
  }
}
