import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CerezTercihiSifirla } from "@/components/analytics/cerez-tercihi-sifirla";
import { siteConfig } from "@/lib/site-config";

// Statik tarih bilinçli: metin değiştikçe elle güncellenir (tek seferlik işler
// kuralı — otomatik tarih, değişmeyen metne yapay tazelik verir).
const SON_GUNCELLEME = "29 Temmuz 2026";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni",
  description:
    "Şirin Gayrimenkul'ün kişisel veri işleme pratiği: hangi veriler, hangi amaçla, nasıl. Form verileriniz sitemizde saklanmaz; çerezler yalnız izninizle çalışır.",
  alternates: { canonical: "/gizlilik" },
};

export default function GizlilikPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Gizlilik ve KVKK", href: "/gizlilik" },
        ]}
      />

      <header className="mt-4">
        <h1 className="text-3xl sm:text-4xl">Gizlilik ve KVKK Aydınlatma Metni</h1>
        <p className="mt-3 text-sm text-muted">Son güncelleme: {SON_GUNCELLEME}</p>
      </header>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-body">
        <section>
          <h2 className="text-xl text-navy">Veri Sorumlusu</h2>
          <p className="mt-3">
            {siteConfig.name} — {siteConfig.officeAddress}. Telefon:{" "}
            <a href={`tel:${siteConfig.phoneTel}`} className="font-semibold text-gold-dark">
              {siteConfig.phoneDisplay}
            </a>
            . Taşınmaz Ticareti Yetki Belgesi No: 0603771.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-navy">Hangi Verileri, Nasıl İşliyoruz?</h2>
          <p className="mt-3">
            <strong>İletişim ve değerleme formu:</strong> Ad-soyad, telefon numarası ve talebinize
            dair yazdıklarınız (mahalle, site, metrekare, oda sayısı, mesajınız). Bu bilgiler{" "}
            <strong>sitemizin sunucusunda saklanmaz</strong>: form, mesajınızı kendi cihazınızdaki
            WhatsApp uygulaması üzerinden bize iletir ya da bizi telefonla ararsınız. Yazışma,
            olağan bir müşteri görüşmesi olarak telefonumuzda/WhatsApp geçmişinde kalır.
          </p>
          <p className="mt-3">
            <strong>Çerezler (yalnız izninizle):</strong> Site deneyimini ölçmek için Google
            Analytics kullanıyoruz. Bu çerezler ancak çerez bildirimindeki{" "}
            <em>&quot;Kabul&quot;</em> seçeneğini işaretlerseniz çalışır; reddederseniz hiçbir
            analitik çerez yüklenmez ve site aynı şekilde çalışmaya devam eder.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-navy">
                  <th className="py-2 pr-4">Çerez</th>
                  <th className="py-2 pr-4">Amaç</th>
                  <th className="py-2 pr-4">Tür</th>
                  <th className="py-2">Süre</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                  <td className="py-2 pr-4">Ziyaretçileri anonim olarak ayırt etme (istatistik)</td>
                  <td className="py-2 pr-4">Analitik — açık rızayla</td>
                  <td className="py-2">2 yıl</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">_ga_*</td>
                  <td className="py-2 pr-4">Oturum ve sayfa görüntüleme istatistikleri</td>
                  <td className="py-2 pr-4">Analitik — açık rızayla</td>
                  <td className="py-2">2 yıl</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Zorunlu (siteyi çalıştıran) çerez kullanmıyoruz; oturum açma, üyelik veya ödeme sistemi
            yoktur.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-navy">İşleme Amaçları ve Hukuki Sebepler</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Talebinize dönüş yapmak ve değerleme/satış/kiralama görüşmesini planlamak — bir
              sözleşmenin kurulması ve ifasıyla doğrudan ilgili olması (KVKK m. 5/2-c).
            </li>
            <li>
              Site kullanım istatistikleri üretmek (Google Analytics) — açık rızanız (KVKK m. 5/1).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl text-navy">Aktarım</h2>
          <p className="mt-3">
            WhatsApp üzerinden gönderdiğiniz mesajlar, WhatsApp&apos;ın (Meta) altyapısı üzerinden
            iletilir. Çerezlere izin verdiyseniz analitik veriler Google&apos;ın sunucularında
            işlenir. Bunların dışında verileriniz üçüncü kişilerle paylaşılmaz, pazarlama amaçlı
            liste oluşturulmaz.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-navy">Haklarınız (KVKK m. 11)</h2>
          <p className="mt-3">
            Kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini
            isteme, itiraz etme dahil KVKK m. 11&apos;deki tüm haklara sahipsiniz. Başvurunuzu
            ofis adresimize yazılı olarak iletebilir ya da{" "}
            <a href={`tel:${siteConfig.phoneTel}`} className="font-semibold text-gold-dark">
              {siteConfig.phoneDisplay}
            </a>{" "}
            numarasından bize ulaşabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-navy">Çerez Tercihinizi Değiştirme</h2>
          <p className="mt-3">
            Daha önce verdiğiniz çerez kararını istediğiniz an değiştirebilirsiniz:{" "}
            <CerezTercihiSifirla />
          </p>
        </section>

        <p className="text-sm text-muted">
          Bu metin bilgilendirme amaçlıdır ve hukuki danışmanlık yerine geçmez. Sorularınız için{" "}
          <Link href="/iletisim" className="font-semibold text-gold-dark hover:underline">
            iletişim sayfamızdan
          </Link>{" "}
          bize ulaşabilirsiniz.
        </p>
      </div>
    </div>
  );
}
