// Site/mahalle adlarına doğru Türkçe çekim eki üretir. Şablonlarda düz
// "'nde" basmak "Göksu Prestij'nde", "Mood Street'nde" gibi hatalar üretiyordu;
// ek, adın son ünlüsüne (ünlü uyumu), son harfine (sert ünsüz benzeşmesi) ve
// iyelikli bitişe (kaynaştırma n'si) göre seçilir.

const UNLULER = "aeıioöuü";
const KALIN = "aıou";
const SERT_UNSUZLER = "fstkçşhp";
// Site adlarında iyelikli bitişler: "Sitesi", "Konutları", "Evleri",
// "Blokları", "Villaları", "Konakları" vb. → bulunma hâlinde kaynaştırma
// n'si alır (Sitesi'nde), yalın ünlüyle bitenler almaz (Genova'da).
const IYELIK_SONU = /(s[ıiuü]|lar[ıi]|ler[ıi])$/;

// Yabancı yazılışlı adlar okunuşa göre ek alır: "Life" → "layf" (kalın ünlü,
// sert f) → Life'ta. Tablo, korpustaki ad sonlarıyla sınırlı tutuldu.
const OKUNUS_ISTISNALARI: Array<[RegExp, { unlu: string; ses: string }]> = [
  [/life$/i, { unlu: "a", ses: "f" }],
  [/residence$/i, { unlu: "ı", ses: "s" }],
  [/tower$/i, { unlu: "ı", ses: "r" }],
  [/towers$/i, { unlu: "ı", ses: "s" }],
  [/house$/i, { unlu: "u", ses: "s" }],
  [/place$/i, { unlu: "e", ses: "s" }],
  [/gate$/i, { unlu: "e", ses: "t" }],
  [/home$/i, { unlu: "o", ses: "m" }],
  [/luxe$/i, { unlu: "ü", ses: "s" }],
  [/white$/i, { unlu: "a", ses: "t" }],
  [/style$/i, { unlu: "a", ses: "l" }],
  [/square$/i, { unlu: "e", ses: "r" }],
  [/business$/i, { unlu: "i", ses: "s" }],
];

function okunus(isim: string): { unlu: string; ses: string } | undefined {
  const kelime = sonKelime(isim);
  for (const [desen, ses] of OKUNUS_ISTISNALARI) {
    if (desen.test(kelime)) return ses;
  }
  return undefined;
}

function sonHarf(isim: string): string {
  const oz = okunus(isim);
  if (oz) return oz.ses;
  return isim.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü]/g, "").slice(-1);
}

function sonUnlu(isim: string): string {
  const oz = okunus(isim);
  if (oz) return oz.unlu;
  const harfler = isim.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü]/g, "");
  for (let i = harfler.length - 1; i >= 0; i--) {
    if (UNLULER.includes(harfler[i])) return harfler[i];
  }
  return "e";
}

function sonKelime(isim: string): string {
  const kelimeler = isim.trim().split(/\s+/);
  return kelimeler[kelimeler.length - 1] ?? isim;
}

/** "X'nde/X'de/X'te…" — bulunma hâli. Örn: Sitesi'nde, Prestij'de, Street'te. */
export function bulunmaHali(isim: string): string {
  const harf = sonHarf(isim);
  const unlu = KALIN.includes(sonUnlu(isim)) ? "a" : "e";
  if (UNLULER.includes(harf)) {
    const iyelikli = IYELIK_SONU.test(sonKelime(isim).toLocaleLowerCase("tr"));
    return `${isim}'${iyelikli ? "n" : ""}d${unlu}`;
  }
  const d = SERT_UNSUZLER.includes(harf) ? "t" : "d";
  return `${isim}'${d}${unlu}`;
}

/** "X'ndeki/X'deki…" — bulunma hâli + -ki. Örn: Sitesi'ndeki, Loft'taki. */
export function bulunmaHaliKi(isim: string): string {
  return `${bulunmaHali(isim)}ki`;
}

/** "X'nin/X'in/X'un…" — tamlayan hâli. Örn: Sitesi'nin, Prestij'in, Loft'un. */
export function tamlayanHali(isim: string): string {
  const harf = sonHarf(isim);
  const u = sonUnlu(isim);
  const ek = u === "a" || u === "ı" ? "ın" : u === "e" || u === "i" ? "in" : u === "o" || u === "u" ? "un" : "ün";
  return `${isim}'${UNLULER.includes(harf) ? "n" : ""}${ek}`;
}
