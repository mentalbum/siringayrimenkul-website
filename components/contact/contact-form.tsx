"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { sendGAEvent } from "@/lib/ga";
import { siteConfig } from "@/lib/site-config";
import { CheckBadgeIcon, WhatsAppIcon } from "@/components/ui/icons";
import { OfisDurumu } from "@/components/ui/ofis-durumu";

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
  /** Değerleme akışı yalnız ev sahiplerine seslenir; genel iletişim korunur. */
  yalnizEvSahibi?: boolean;
  /** Site-farkında değerleme: verilirse mahalleye göre site seçimi açılır ve
   * ?mahalle=&site= parametreleriyle önceden doldurulur. */
  siteler?: FormSite[];
}

export function ContactForm({ mahalleler, siteler, yalnizEvSahibi = false }: ContactFormProps) {
  const [isim, setIsim] = useState("");
  const [telefon, setTelefon] = useState("");
  const [talepTuru, setTalepTuru] = useState("");
  const [mahalleSlug, setMahalleSlug] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [metrekare, setMetrekare] = useState("");
  const [odaSayisi, setOdaSayisi] = useState("");
  const [mesaj, setMesaj] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const basladi = useRef(false);
  const formKonumu = yalnizEvSahibi ? "degerleme" : "iletisim";

  useEffect(() => {
    const form = formRef.current;
    if (!form || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        sendGAEvent("event", "contact_form_view", { form: formKonumu });
        observer.disconnect();
      }
    });
    observer.observe(form);
    return () => observer.disconnect();
  }, [formKonumu]);
  // WhatsApp herkeste yok — mobilde SMS ikinci bir kapı olsun. Sunucuda
  // bilinemez, mount sonrası açılır.
  const [mobil, setMobil] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(
      () =>
        setMobil(
          /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent) ||
            // iPadOS 13+ masaüstü UA bildiriyor; dokunmatik + dar ekran birlikte
            // güvenilir bir işaret.
            (window.navigator.maxTouchPoints > 1 && window.matchMedia("(max-width: 1024px)").matches)
        ),
      0
    );
    return () => window.clearTimeout(id);
  }, []);

  // Site sayfalarındaki "Evinizi Değerlendirelim" linkleri ?mahalle=&site=
  // taşır — formu önceden doldur (statik sayfayı useSearchParams'a sokmadan;
  // SitelerBrowser'daki desenle aynı, setTimeout lint kuralı için).
  useEffect(() => {
    const id = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const niyet = params.get("niyet");
      if (niyet === "satis") setTalepTuru(talepTurleri[0]);
      if (niyet === "kiralama") setTalepTuru(talepTurleri[1]);
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

  function talepMetni() {
    const mahalleIsim = mahalleler.find((m) => m.slug === mahalleSlug)?.isim;
    return [
      isim.trim() ? `Merhaba, ben ${isim.trim()}.` : "Merhaba,",
      "",
      `Talep: ${talepTuru}`,
      mahalleIsim ? `Mahalle: ${mahalleIsim}` : null,
      seciliSite ? `Site: ${seciliSite.isim}` : null,
      metrekare ? `m²: ${metrekare}` : null,
      odaSayisi ? `Oda Sayısı: ${odaSayisi}` : null,
      mesaj ? `Not: ${mesaj}` : null,
      "",
      telefon.trim() ? `Telefon: ${telefon.trim()}` : null,
    ]
      .filter((satir) => satir !== null)
      .join("\n");
  }

  function olay(kanal: string) {
    // Geçmiş seri korunur; bu olay gerçek mesaj teslimi değil, uygulamaya geçiştir.
    sendGAEvent("event", "contact_form_submit", {
      kanal,
      form: formKonumu,
      asama: "uygulamaya_gecis",
      niyet: talepTuru === talepTurleri[0] ? "satis" : talepTuru === talepTurleri[1] ? "kiralama" : "diger",
      mahalle: mahalleSlug || "(yok)",
      site: seciliSite?.slug ?? "(yok)",
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    olay("whatsapp");
    const url = `${siteConfig.whatsappUrl}?text=${encodeURIComponent(talepMetni())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleSms(event: MouseEvent<HTMLButtonElement>) {
    if (!event.currentTarget.form?.reportValidity()) return;
    olay("sms");
    // "?&body=" hem iOS hem Android'de çalışan ortak biçim.
    window.location.href = `sms:${siteConfig.phoneTel}?&body=${encodeURIComponent(talepMetni())}`;
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={() => {
        if (basladi.current) return;
        basladi.current = true;
        sendGAEvent("event", "contact_form_start", { form: formKonumu });
      }}
      className="space-y-4"
    >
      {yalnizEvSahibi ? (
        <fieldset>
          <legend className="text-sm font-medium text-navy">Talebiniz</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {talepTurleri.slice(0, 2).map((tur) => (
              <label key={tur} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy has-checked:border-gold has-checked:bg-gold/10 focus-within:ring-2 focus-within:ring-gold/30">
                <input
                  type="radio"
                  name="talepTuru"
                  value={tur}
                  checked={talepTuru === tur}
                  onChange={(event) => setTalepTuru(event.target.value)}
                  required
                  className="h-4 w-4 shrink-0 accent-gold-dark"
                />
                {tur}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
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
            <option value="" disabled>Talebinizi seçin</option>
            {talepTurleri.map((tur) => (
              <option key={tur} value={tur}>
                {tur}
              </option>
            ))}
          </select>
        </div>
      )}
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
      <details className="group rounded-xl border border-border bg-surface-muted px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-navy [&::-webkit-details-marker]:hidden">
          Ayrıntı ekleyin <span className="text-xs font-normal text-muted">(isteğe bağlı)</span>
        </summary>
        <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="isim" className="text-sm font-medium text-navy">Ad Soyad (isteğe bağlı)</label>
                  <input id="isim" name="isim" type="text" autoComplete="name" value={isim}
                    onChange={(event) => setIsim(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30" />
                </div>
                <div>
                  <label htmlFor="telefon" className="text-sm font-medium text-navy">Telefon (isteğe bağlı)</label>
                  <input id="telefon" name="telefon" type="tel" autoComplete="tel" value={telefon}
                    onChange={(event) => setTelefon(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30" />
                </div>
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
        </div>
      </details>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-auto"
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp&apos;ta devam et
        </button>
        {mobil ? (
          <button
            type="button"
            onClick={handleSms}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-navy transition-colors duration-200 hover:border-gold hover:text-gold-dark sm:w-auto"
          >
            SMS&apos;te devam et
          </button>
        ) : (
          <a
            href={`tel:${siteConfig.phoneTel}`}
            onClick={() => { sendGAEvent("event", "phone_click", { konum: "iletisim_formu" }); }}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-navy transition-colors duration-200 hover:border-gold hover:text-gold-dark sm:w-auto"
          >
            {siteConfig.phoneDisplay}
          </a>
        )}
      </div>
      <OfisDurumu />
      <p className="text-xs leading-relaxed text-muted">
        Mesajınız seçtiğiniz uygulamada hazır açılır. Bize ulaşması için uygulamadaki
        gönder düğmesine basın. Dilerseniz doğrudan arayın:{" "}
        <a
          href={`tel:${siteConfig.phoneTel}`}
          onClick={() => sendGAEvent("event", "phone_click", { konum: "iletisim_formu_alt" })}
          className="font-semibold text-gold-dark hover:underline"
        >
          {siteConfig.phoneDisplay}
        </a>
        . Forma yazdığınız bilgiler sitemizde saklanmaz; yalnızca WhatsApp veya SMS mesajınıza
        eklenir. Ayrıntılar:{" "}
        <Link href="/gizlilik" className="font-semibold text-gold-dark hover:underline">
          Gizlilik ve KVKK Aydınlatma Metni
        </Link>
        .
      </p>
    </form>
  );
}
