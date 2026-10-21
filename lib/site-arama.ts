/** Türkçe klavyesiz yazımlar da eşleşir: goksu → Göksu, cinar → Çınar.
 * Yalnız arama anahtarında kullanılır; görünen adlar değiştirilmez. */
export function aramaNormalize(metin: string): string {
  return metin
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replaceAll("ı", "i");
}

/** Hash'teki + işareti oda/salon ayrımıdır, boşluğa çevrilmemeli.
 * Bozuk veya kayıtlarda bulunmayan bir filtre listeyi boşaltmaz. */
export function odaTipiOku(hash: string, bilinenTipler: ReadonlySet<string>): string | null {
  const eslesme = hash.match(/^#oda=(.+)$/);
  if (!eslesme) return null;
  try {
    const tip = decodeURIComponent(eslesme[1]);
    return bilinenTipler.has(tip) ? tip : null;
  } catch {
    return null;
  }
}
