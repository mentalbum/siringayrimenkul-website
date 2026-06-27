"use client";

import { useState, type FormEvent } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { siteConfig } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/ui/icons";

const talepTurleri = [
  "Evimi satmak istiyorum",
  "Evimi kiraya vermek istiyorum",
  "Ev almak istiyorum",
  "Ev kiralamak istiyorum",
  "Diğer bir konuda yardım istiyorum",
] as const;

const odaSecenekleri = ["1+1", "2+1", "3+1", "4+1", "5+1 ve üzeri", "Diğer"] as const;

interface ContactFormProps {
  mahalleler: { slug: string; isim: string }[];
}

export function ContactForm({ mahalleler }: ContactFormProps) {
  const [isim, setIsim] = useState("");
  const [telefon, setTelefon] = useState("");
  const [talepTuru, setTalepTuru] = useState<string>(talepTurleri[0]);
  const [mahalleSlug, setMahalleSlug] = useState("");
  const [metrekare, setMetrekare] = useState("");
  const [odaSayisi, setOdaSayisi] = useState("");
  const [mesaj, setMesaj] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendGAEvent("event", "contact_form_submit");

    const mahalleIsim = mahalleler.find((m) => m.slug === mahalleSlug)?.isim;

    const satirlar = [
      `Merhaba, ben ${isim}.`,
      "",
      `Talep: ${talepTuru}`,
      mahalleIsim ? `Mahalle: ${mahalleIsim}` : null,
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
      <div>
        <label htmlFor="mahalleSlug" className="text-sm font-medium text-navy">
          Mahalle <span className="text-muted">(opsiyonel)</span>
        </label>
        <select
          id="mahalleSlug"
          name="mahalleSlug"
          value={mahalleSlug}
          onChange={(event) => setMahalleSlug(event.target.value)}
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
