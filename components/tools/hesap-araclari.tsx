"use client";

import { useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n)) + " ₺";

function sayi(deger: string): number {
  const n = Number(deger.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function AracKarti({
  baslik,
  aciklama,
  children,
}: {
  baslik: string;
  aciklama: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-navy">{baslik}</h3>
      <p className="mt-2 text-sm leading-relaxed text-body">{aciklama}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Sonuc({ satirlar, vurgu }: { satirlar: [string, string][]; vurgu?: string }) {
  return (
    <div className="mt-4 rounded-xl bg-navy p-4 text-white">
      {satirlar.map(([etiket, deger]) => (
        <div key={etiket} className="flex items-baseline justify-between gap-3 py-1">
          <span className="text-xs text-white/70">{etiket}</span>
          <span className="text-sm font-semibold text-gold">{deger}</span>
        </div>
      ))}
      {vurgu ? <p className="mt-2 border-t border-white/15 pt-2 text-xs leading-relaxed text-white/85">{vurgu}</p> : null}
    </div>
  );
}

function useIzle() {
  const [izlenen, setIzlenen] = useState<Set<string>>(new Set());
  return (arac: string) => {
    if (izlenen.has(arac)) return;
    setIzlenen((s) => new Set(s).add(arac));
    sendGAEvent("event", "arac_etkilesim", { arac });
  };
}

export function KiraArtisiAraci() {
  const izle = useIzle();
  const [kira, setKira] = useState("");
  const [oran, setOran] = useState("");
  const kiraN = sayi(kira);
  const oranN = sayi(oran);
  const yeniKira = kiraN && oranN ? kiraN * (1 + oranN / 100) : 0;
  return (
    <AracKarti
      baslik="Kira Artışı Hesaplayıcı"
      aciklama="Konut kiralarında yasal artış tavanı, Türk Borçlar Kanunu m.344 uyarınca son 12 aylık TÜFE ortalamasıdır. Güncel oranı her ay TÜİK açıklar; sözleşmenizde daha düşük oran varsa o geçerlidir."
    >
      <label className="block text-xs font-semibold text-navy">
        Mevcut aylık kira (₺)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={kira}
          onFocus={() => izle("kira-artisi")}
          onChange={(e) => setKira(e.target.value)}
          placeholder="Örn. 20000"
          className={inputClass}
        />
      </label>
      <label className="mt-3 block text-xs font-semibold text-navy">
        Uygulanacak artış oranı (%)
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={oran}
          onFocus={() => izle("kira-artisi")}
          onChange={(e) => setOran(e.target.value)}
          placeholder="TÜİK'in açıkladığı 12 aylık TÜFE ortalaması"
          className={inputClass}
        />
      </label>
      <p className="mt-2 text-xs text-body">
        Güncel oran için{" "}
        <a
          href="https://www.tuik.gov.tr"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gold-dark underline-offset-2 hover:underline"
        >
          TÜİK
        </a>
        &apos;in son TÜFE bültenine bakın.
      </p>
      {yeniKira > 0 ? (
        <Sonuc
          satirlar={[
            ["Yeni aylık kira", tl(yeniKira)],
            ["Aylık fark", tl(yeniKira - kiraN)],
            ["Yıllık fark", tl((yeniKira - kiraN) * 12)],
          ]}
        />
      ) : null}
    </AracKarti>
  );
}

export function TapuHarciAraci() {
  const izle = useIzle();
  const [bedel, setBedel] = useState("");
  const bedelN = sayi(bedel);
  return (
    <AracKarti
      baslik="Tapu Harcı Hesaplayıcı"
      aciklama="Tapu harcı, Harçlar Kanunu uyarınca gerçek satış bedelinin toplam %4'üdür; yasal olarak alıcı ve satıcı %2 + %2 öder. Tapuda ayrıca yıllık tarifeyle belirlenen döner sermaye ücreti alınır."
    >
      <label className="block text-xs font-semibold text-navy">
        Satış bedeli (₺)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={bedel}
          onFocus={() => izle("tapu-harci")}
          onChange={(e) => setBedel(e.target.value)}
          placeholder="Örn. 5000000"
          className={inputClass}
        />
      </label>
      {bedelN > 0 ? (
        <Sonuc
          satirlar={[
            ["Toplam tapu harcı (%4)", tl(bedelN * 0.04)],
            ["Satıcı payı (%2)", tl(bedelN * 0.02)],
            ["Alıcı payı (%2)", tl(bedelN * 0.02)],
          ]}
          vurgu="Harcın kimin ödeyeceği uygulamada pazarlıkla değişebilir; hesap yasal paylaşımı gösterir."
        />
      ) : null}
    </AracKarti>
  );
}

export function KomisyonAraci() {
  const izle = useIzle();
  const [komisyonMod, setKomisyonMod] = useState<"satis" | "kiralama">("satis");
  const [komisyonBedel, setKomisyonBedel] = useState("");
  const komisyonN = sayi(komisyonBedel);
  const KDV = 0.2;
  return (
    <AracKarti
      baslik="Emlak Komisyonu Hesaplayıcı"
      aciklama="Taşınmaz Ticareti Hakkında Yönetmelik uyarınca satışta hizmet bedeli, satış bedelinin en fazla %4'ü + KDV'dir (uygulamada alıcı ve satıcıdan %2 + %2). Kiralamada bir aylık kira bedeli + KDV'yi aşamaz."
    >
      <div className="flex gap-2">
        {(
          [
            ["satis", "Satış"],
            ["kiralama", "Kiralama"],
          ] as const
        ).map(([deger, etiket]) => (
          <button
            key={deger}
            type="button"
            onClick={() => {
              setKomisyonMod(deger);
              izle("komisyon");
            }}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
              komisyonMod === deger
                ? "border-navy bg-navy text-white"
                : "border-border bg-surface text-body hover:text-navy"
            }`}
          >
            {etiket}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-xs font-semibold text-navy">
        {komisyonMod === "satis" ? "Satış bedeli (₺)" : "Aylık kira bedeli (₺)"}
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={komisyonBedel}
          onFocus={() => izle("komisyon")}
          onChange={(e) => setKomisyonBedel(e.target.value)}
          placeholder={komisyonMod === "satis" ? "Örn. 5000000" : "Örn. 20000"}
          className={inputClass}
        />
      </label>
      {komisyonN > 0 ? (
        komisyonMod === "satis" ? (
          <Sonuc
            satirlar={[
              ["Satıcıdan azami (%2 + KDV)", tl(komisyonN * 0.02 * (1 + KDV))],
              ["Alıcıdan azami (%2 + KDV)", tl(komisyonN * 0.02 * (1 + KDV))],
            ]}
            vurgu="Rakamlar yasal üst sınırdır; hizmet bedeli sözleşmeyle yazılı olarak belirlenir."
          />
        ) : (
          <Sonuc
            satirlar={[["Azami hizmet bedeli (1 kira + KDV)", tl(komisyonN * (1 + KDV))]]}
            vurgu="Kiralamada hizmet bedeli tek seferliktir ve bir aylık kira + KDV'yi aşamaz."
          />
        )
      ) : null}
    </AracKarti>
  );
}

export function BosKalmaAraci() {
  const izle = useIzle();
  const [istenenKira, setIstenenKira] = useState("");
  const [piyasaKira, setPiyasaKira] = useState("");
  const [bosAy, setBosAy] = useState("");
  const istenenN = sayi(istenenKira);
  const piyasaN = sayi(piyasaKira);
  const bosAyN = sayi(bosAy);
  const aylikFark = istenenN > piyasaN ? istenenN - piyasaN : 0;
  const bosKayip = piyasaN * bosAyN;
  const telafiAy = aylikFark > 0 && bosKayip > 0 ? bosKayip / aylikFark : 0;
  return (
    <AracKarti
      baslik="Boş Kalma Maliyeti Hesaplayıcı"
      aciklama="Yüksek fiyat çoğu zaman bedavaya gelmez: ev boş bekledikçe kira geliri kaybolur, aidat ve giderler devam eder. Bu araç, 'yüksek fiyatla beklemek' ile 'gerçekçi fiyatla hemen kiralamak' arasındaki farkı gösterir."
    >
      <label className="block text-xs font-semibold text-navy">
        İstediğiniz aylık kira (₺)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={istenenKira}
          onFocus={() => izle("bos-kalma")}
          onChange={(e) => setIstenenKira(e.target.value)}
          placeholder="Örn. 24000"
          className={inputClass}
        />
      </label>
      <label className="mt-3 block text-xs font-semibold text-navy">
        Gerçekçi piyasa kirası (₺)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={piyasaKira}
          onFocus={() => izle("bos-kalma")}
          onChange={(e) => setPiyasaKira(e.target.value)}
          placeholder="Örn. 21000"
          className={inputClass}
        />
      </label>
      <label className="mt-3 block text-xs font-semibold text-navy">
        Yüksek fiyatta tahmini boş bekleme (ay)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={bosAy}
          onFocus={() => izle("bos-kalma")}
          onChange={(e) => setBosAy(e.target.value)}
          placeholder="Örn. 3"
          className={inputClass}
        />
      </label>
      {piyasaN > 0 && bosAyN > 0 ? (
        <Sonuc
          satirlar={[
            ["Boş geçen ayların kaybı", tl(bosKayip)],
            ["Yüksek fiyatın aylık getirisi", aylikFark > 0 ? tl(aylikFark) : "—"],
            [
              "Kaybın telafi süresi",
              aylikFark > 0
                ? `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(telafiAy)} ay`
                : "telafi edilemez",
            ],
          ]}
          vurgu={
            aylikFark > 0 && telafiAy > 12
              ? "Bu senaryoda yüksek fiyat, kaybı bir yılda bile telafi edemiyor — gerçekçi fiyat büyük ihtimalle daha kârlı."
              : "Doğru fiyat, boş bekleyen yüksek fiyattan çoğu zaman daha çok kazandırır. Gerçekçi kirayı emsallerle birlikte belirleyelim."
          }
        />
      ) : null}
    </AracKarti>
  );
}

export function HesapAraclari() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <KiraArtisiAraci />
      <TapuHarciAraci />
      <KomisyonAraci />
      <BosKalmaAraci />
    </div>
  );
}
