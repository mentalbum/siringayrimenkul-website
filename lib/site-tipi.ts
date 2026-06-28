export function inferSiteTipi(isim: string): string | null {
  if (/villa/i.test(isim)) return "villa tipi";
  if (/residence|rezidans/i.test(isim)) return "rezidans tipi";
  if (/kooperatif/i.test(isim)) return "kooperatif konut tipi";
  if (/konut/i.test(isim)) return "konut tipi";
  if (/blok/i.test(isim)) return "apartman/blok tipi";
  if (/tower|loft/i.test(isim)) return "yüksek katlı";
  return null;
}
