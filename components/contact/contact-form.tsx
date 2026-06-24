"use client";

import { useState, type FormEvent } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { siteConfig } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/ui/icons";

export function ContactForm() {
  const [isim, setIsim] = useState("");
  const [telefon, setTelefon] = useState("");
  const [mesaj, setMesaj] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendGAEvent("event", "contact_form_submit");
    const metin = `Merhaba, ben ${isim}.\n\n${mesaj}\n\nTelefon: ${telefon}`;
    const url = `${siteConfig.whatsappUrl}?text=${encodeURIComponent(metin)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div>
        <label htmlFor="mesaj" className="text-sm font-medium text-navy">
          Mesajınız
        </label>
        <textarea
          id="mesaj"
          name="mesaj"
          required
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
