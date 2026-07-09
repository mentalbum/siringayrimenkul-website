"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { siteConfig } from "@/lib/site-config";
import { CheckBadgeIcon, WhatsAppIcon } from "@/components/ui/icons";

const talepTurleri = [
  "Evimi satmak istiyorum",
  "Evimi kiraya vermek istiyorum",
  "Ev almak istiyorum",
  "Ev kiralamak istiyorum",
  "Diğer bir konuda yardım istiyorum",
] as const;

const odaSecenekleri = ["1+1", "2+1", "3+1", "4+1", "5+1 ve üzeri", "Diğer"] as const;

export interface FormSite {
  slug: string;
  isim: string;
  mahalleSlug: string;
}

interface ContactFormProps {
  mahalleler: { slug: string; isim: string }[];
  /** Site-farkında değerleme: verilirse mahalleye göre site seçimi açılır ve
   * ?mahalle=&site= parametreleriyle önceden doldurulur. */
  siteler?: FormSite[];
}

export function ContactForm({ mahalleler, siteler }: ContactFormProps) {
  const [isim, setIsim] = useState("");
  const [telefon, setTelefon] = useState("");
  const [talepTuru, setTalepTuru] = useState<string>(talepTurleri[0]);
  const [mahalleSlug, setMahalleSlug] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [metrekare, setMetrekare] = useState("");
  const [odaSayisi, setOdaSayisi] = useState("");
  const [mesaj, setMesaj] = useState("");

  // Site sayfalarındaki "Evinizi Değerlendirelim" linkleri ?mahalle=&site=
  // taşır — formu önceden doldur (statik sayfayı useSearchParams'a sokmadan;
  // SitelerBrowser'daki desenle aynı, setTimeout lint kuralı için).
  useEffect(() => {
    const id = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("mahalle");
      const s = params.get("site");
      if (m && mahalleler.some((item) => item.slug === m)) {
        setMahalleSlug(m);
        if (s && siteler?.some((item) => item.slug === s && item.mahalleSlug === m)) {
          setSiteSlug(s);
        }
      }
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mahalleSiteleri = useMemo(
    () => (siteler ?? []).filter((site) => site.mahalleSlug === mahalleSlug),
    [siteler, mahalleSlug]
  );
  const seciliSite = mahalleSiteleri.find((site) => site.slug === siteSlug);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mahalleIsim = mahalleler.find((m) => m.slug === mahalleSlug)?.isim;
    sendGAEvent("event", "contact_form_submit", {
      mahalle: mahalleSlug || "(yok)",
      site: seciliSite?.slug ?? "(yok)",
    });

    const satirlar = [
      `Merhaba, ben ${isim}.`,
      "",
      `Talep: ${talepTuru}`,
      mahalleIsim ? `Mahalle: ${mahalleIsim}` : null,
      seciliSite ? `Site: ${seciliSite.isim}` : null,
      metrekare ? `m²: ${metrekare}` : null,
      odaSayisi ? `Oda Sayısı: ${odaSayisi}` : null,
      mesaj ? `Not: ${mesaj}` : null,
      "",
      `Telefon: ${telefon}`,
    ].filter((satir) => satir !== null);

    const url = `${siteConfig.whatsappUrl}?text=${encodeURIComponent(satirlar.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="talepTuru" className="text-sm font-medium text-navy">
          Talebiniz
        </label>
        <select
          id="talepTuru"
          name="talepTuru"
          required
          value={talepTuru}
          onChange={(event) => setTalepTuru(event.target.value)}
          className="mt-1.5 w-full cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        >
          {talepTurleri.map((tur) => (
            <option key={tur} value={tur}>
              {tur}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="isim" className="text-sm font-medium text-navy">
            Ad Soyad
          </label>
          <input
            id="isim"
            name="isim"
            type="text"
            required
            autoComplete="name"
            value={isim}
            onChange={(event) => setIsim(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <div>
          <label htmlFor="telefon" className="text-sm font-medium text-navy">
            Telefon
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            required
            autoComplete="tel"
            value={telefon}
            onChange={(event) => setTelefon(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </div>
      </div>
      <div className={siteler ? "grid gap-4 sm:grid-cols-2" : undefined}>
        <div>
          <label htmlFor="mahalleSlug" className="text-sm font-medium text-navy">
            Mahalle <span className="text-muted">(opsiyonel)</span>
          </label>
          <select
            id="mahalleSlug"
            name="mahalleSlug"
            value={mahalleSlug}
            onChange={(event) => {
              setMahalleSlug(event.target.value);
              setSiteSlug("");
            }}
            className="mt-1.5 w-full cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
          >
            <option value="">Seçiniz</option>
            {mahalleler.map((mahalle) => (
              <option key={mahalle.slug} value={mahalle.slug}>
                {mahalle.isim}
              </option>
            ))}
          </select>
        </div>
        {siteler && (
          <div>
            <label htmlFor="siteSlug" className="text-sm font-medium text-navy">
              Siteniz <span className="text-muted">(opsiyonel)</span>
            </label>
            <select
              id="siteSlug"
              name="siteSlug"
              value={siteSlug}
              disabled={!mahalleSlug}
              onChange={(event) => setSiteSlug(event.target.value)}
              className="mt-1.5 w-full cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted"
            >
              <option value="">
                {mahalleSlug ? "Seçiniz / listede yok" : "Önce mahalle seçin"}
              </option>
              {mahalleSiteleri.map((site) => (
                <option key={site.slug} value={site.slug}>
                  {site.isim}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {seciliSite && (
        <p className="flex items-start gap-2 rounded-xl bg-gold/10 px-4 py-3 text-sm text-navy">
          <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
          <span>
            <strong>{seciliSite.isim}</strong>&apos;ni tanıyoruz — değerlemede sitenizin kendi
            emsalleri kullanılır.
          </span>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="metrekare" className="text-sm font-medium text-navy">
            m² <span className="text-muted">(opsiyonel)</span>
          </label>
          <input
            id="metrekare"
            name="metrekare"
            type="number"
            min="0"
            inputMode="numeric"
            value={metrekare}
            onChange={(event) => setMetrekare(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <div>
          <label htmlFor="odaSayisi" className="text-sm font-medium text-navy">
            Oda Sayısı <span className="text-muted">(opsiyonel)</span>
          </label>
          <select
            id="odaSayisi"
            name="odaSayisi"
            value={odaSayisi}
            onChange={(event) => setOdaSayisi(event.target.value)}
            className="mt-1.5 w-full cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
          >
            <option value="">Seçiniz</option>
            {odaSecenekleri.map((oda) => (
              <option key={oda} value={oda}>
                {oda}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="mesaj" className="text-sm font-medium text-navy">
          Mesajınız <span className="text-muted">(opsiyonel)</span>
        </label>
        <textarea
          id="mesaj"
          name="mesaj"
          rows={4}
          value={mesaj}
          onChange={(event) => setMesaj(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-auto"
      >
        <WhatsAppIcon className="h-4 w-4" />
        WhatsApp ile Gönder
      </button>
    </form>
  );
}
