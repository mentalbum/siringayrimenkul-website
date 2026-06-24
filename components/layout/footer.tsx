import Image from "next/image";
import Link from "next/link";
import { mainNav, siteConfig } from "@/lib/site-config";
import { CtaButton } from "@/components/ui/button";
import { TrackedLink } from "@/components/ui/tracked-link";
import { MapPinIcon, PhoneIcon, TiktokIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Image
            src="/brand/sirin-logo-on-dark.png"
            alt={siteConfig.name}
            width={480}
            height={233}
            className="h-12 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">
            Hızlı Bağlantılar
          </h2>
          <ul className="mt-4 space-y-2.5">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-white/80 hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">İletişim</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a
                href={siteConfig.officeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                {siteConfig.officeAddress}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 shrink-0 text-gold" />
              <TrackedLink
                href={`tel:${siteConfig.phoneTel}`}
                gaEvent="phone_click"
                className="hover:text-gold"
              >
                {siteConfig.phoneDisplay}
              </TrackedLink>
            </li>
          </ul>
          <CtaButton href={siteConfig.sahibindenUrl} external variant="primary" className="mt-5">
            İlanlarımı Gör
          </CtaButton>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={siteConfig.yandexMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Yandex Haritalar'da görüntüle"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:text-gold"
            >
              <MapPinIcon className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok'ta takip edin"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:text-gold"
            >
              <TiktokIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/60 sm:px-6">
        © {new Date().getFullYear()} {siteConfig.name}. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
