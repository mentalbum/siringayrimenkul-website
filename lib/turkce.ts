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
// "ğ" + dar ünlü, iyelik ekinin yumuşattığı k'nin kanıtıdır: çiçek → Çiçeği →
// "Çiçeği'nde" (2026-08-15 denetimi; önce "Çiçeği'de" üretiyordu). "Kooperatifi"
// yumuşama izi bırakmadığı için adıyla listelendi.
const IYELIK_SONU = /(s[ıiuü]|lar[ıi]|ler[ıi]|ğ[ıiuü]|kooperatifi)$/;
// "su" ile biten BİRLEŞİK coğrafi adlar iyelikli değildir: "Göksu'da" doğru,
// "Göksu'nda" değil (kural denetimi, 2026-07-31). Gerekirse listeye ekle.
const IYELIK_DEGIL = /^(göksu|karasu|aksu|incesu)$/;

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

// Sonu rakamla biten adlar okunuşa göre ek alır: "Konutları 3" → "üç" → 3'te.
// Harf süzgeci rakamları atıp bir önceki kelimeye bakıyordu ve "3'da" üretiyordu
// (2026-08-15 denetimi). Ek, sayının SÖYLENİŞİNİN son sesine bağlıdır; birler
// basamağı 0 ise onlar/yüzler basamağı okunur.
const RAKAM_OKUNUSU: Record<string, { unlu: string; ses: string }> = {
  "0": { unlu: "ı", ses: "r" }, // sıfır
  "1": { unlu: "i", ses: "r" }, // bir
  "2": { unlu: "i", ses: "i" }, // iki
  "3": { unlu: "ü", ses: "ç" }, // üç
  "4": { unlu: "ö", ses: "t" }, // dört
  "5": { unlu: "e", ses: "ş" }, // beş
  "6": { unlu: "ı", ses: "ı" }, // altı
  "7": { unlu: "i", ses: "i" }, // yedi
  "8": { unlu: "i", ses: "z" }, // sekiz
  "9": { unlu: "u", ses: "z" }, // dokuz
};
const YUVARLAK_OKUNUSU: Record<string, { unlu: string; ses: string }> = {
  "10": { unlu: "o", ses: "n" }, // on
  "20": { unlu: "i", ses: "i" }, // yirmi
  "30": { unlu: "u", ses: "z" }, // otuz
  "40": { unlu: "ı", ses: "k" }, // kırk
  "50": { unlu: "i", ses: "i" }, // elli
  "60": { unlu: "ı", ses: "ş" }, // altmış
  "70": { unlu: "i", ses: "ş" }, // yetmiş
  "80": { unlu: "e", ses: "n" }, // seksen
  "90": { unlu: "a", ses: "n" }, // doksan
  "00": { unlu: "ü", ses: "z" }, // yüz (100, 200… sonu iki sıfır)
  "000": { unlu: "i", ses: "n" }, // bin
};

function rakamOkunusu(isim: string): { unlu: string; ses: string } | undefined {
  const rakamlar = isim.trim().match(/(\d+)$/)?.[1];
  if (!rakamlar) return undefined;
  if (rakamlar.endsWith("000")) return YUVARLAK_OKUNUSU["000"];
  if (rakamlar.endsWith("00")) return YUVARLAK_OKUNUSU["00"];
  const birler = rakamlar.slice(-1);
  if (birler !== "0") return RAKAM_OKUNUSU[birler];
  return YUVARLAK_OKUNUSU[rakamlar.slice(-2)] ?? RAKAM_OKUNUSU["0"];
}

function okunus(isim: string): { unlu: string; ses: string } | undefined {
  const rakam = rakamOkunusu(isim);
  if (rakam) return rakam;
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
    const son = sonKelime(isim).toLocaleLowerCase("tr");
    const iyelikli = IYELIK_SONU.test(son) && !IYELIK_DEGIL.test(son);
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

/** Yalnızca tamlayan eki: "'nin/'in/'un…" — link içi ad + dışarıda ek dizmek için. */
export function tamlayanEk(isim: string): string {
  return tamlayanHali(isim).slice(isim.length);
}

/** Yalnızca bulunma eki: "'nde/'de/'te…". */
export function bulunmaEk(isim: string): string {
  return bulunmaHali(isim).slice(isim.length);
}

/** Ayrı yazılan "de/da" bağlacı — son ünlüye göre: Blokları da, Sitesi de. */
export function dahiBaglaci(isim: string): string {
  const unluler = "aeıioöuü";
  const kucuk = isim.toLocaleLowerCase("tr");
  for (let i = kucuk.length - 1; i >= 0; i--) {
    if (unluler.includes(kucuk[i])) return "aıou".includes(kucuk[i]) ? "da" : "de";
  }
  return "de";
}
