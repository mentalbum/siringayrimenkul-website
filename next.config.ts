import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Logo/görseller dosya adı değişmeden güncellenmez — tarayıcı önbelleği 31 gün.
    minimumCacheTTL: 2678400,
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // 27.08: Yenimahalle grubu (ata/susuz/cumhuriyet mahalleleri) siteden
    // kaldırıldı. Eski adresleri proxy.ts 410 (Gone) ile kapatıyor; buraya o
    // mahallelere YENİ kural ekleme. TEK İSTİSNA aşağıdaki ÇAPRAZ-KAYNAK bloğu:
    // kaynağı YAŞAYAN bir mahallenin eski slug'ı olan bu kurallar bilerek
    // duruyor — silinselerdi kaynak adres genel slug-taşıma kuralına düşüp
    // 301→404 zinciri üretirdi; şimdi 301→410 (proxy hedefi yakalıyor), Google
    // adresi kesin sinyalle düşürüyor.
    return [
      { source: "/mahalleler/yavuz-selim/adalar/46432-1", destination: "/mahalleler/ata-mahallesi/gozde-evler-sitesi", permanent: true },
      { source: "/mahalleler/yavuz-selim-mahallesi/adalar/46432-1", destination: "/mahalleler/ata-mahallesi/gozde-evler-sitesi", permanent: true },
      { source: "/mahalleler/goksu/alya-park", destination: "/mahalleler/susuz-mahallesi/alya-park", permanent: true },
      { source: "/mahalleler/goksu/bella-garden", destination: "/mahalleler/susuz-mahallesi/bella-garden", permanent: true },
      { source: "/mahalleler/goksu/bordo-gol-evleri", destination: "/mahalleler/susuz-mahallesi/bordo-gol-evleri", permanent: true },
      { source: "/mahalleler/goksu/goksu-marina", destination: "/mahalleler/susuz-mahallesi/goksu-marina", permanent: true },
      { source: "/mahalleler/goksu/green-life-goksu", destination: "/mahalleler/susuz-mahallesi/green-life-goksu-konutlari", permanent: true },
      { source: "/mahalleler/goksu/green-life-goksu-konutlari", destination: "/mahalleler/susuz-mahallesi/green-life-goksu-konutlari", permanent: true },
      { source: "/mahalleler/goksu/korucam-sitesi", destination: "/mahalleler/susuz-mahallesi/korucam-sitesi", permanent: true },
      { source: "/mahalleler/goksu/lake-life", destination: "/mahalleler/susuz-mahallesi/lake-life", permanent: true },
      { source: "/mahalleler/goksu/lilyum-sitesi", destination: "/mahalleler/susuz-mahallesi/lilyum-sitesi", permanent: true },
      { source: "/mahalleler/goksu/liva-goksu", destination: "/mahalleler/susuz-mahallesi/liva-goksu", permanent: true },
      { source: "/mahalleler/goksu/merdin-sitesi", destination: "/mahalleler/susuz-mahallesi/merdin-sitesi", permanent: true },
      { source: "/mahalleler/goksu/neovadi-konutlari", destination: "/mahalleler/susuz-mahallesi/neovadi-konutlari", permanent: true },
      { source: "/mahalleler/goksu/neva-palas", destination: "/mahalleler/susuz-mahallesi/neva-palas", permanent: true },
      { source: "/mahalleler/goksu/nil-my-home", destination: "/mahalleler/susuz-mahallesi/nil-my-home", permanent: true },
      { source: "/mahalleler/goksu/perla-life", destination: "/mahalleler/susuz-mahallesi/perla-life", permanent: true },
      { source: "/mahalleler/goksu/serline-konutlari", destination: "/mahalleler/susuz-mahallesi/serline-konutlari", permanent: true },
      { source: "/mahalleler/goksu/vera-life-goksu", destination: "/mahalleler/susuz-mahallesi/vera-life-goksu", permanent: true },
      { source: "/mahalleler/goksu/white-dream-sitesi", destination: "/mahalleler/susuz-mahallesi/white-dream-sitesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/golde-luxe-konutlari", destination: "/mahalleler/cumhuriyet-mahallesi/golde-luxe-konutlari", permanent: true },
      { source: "/mahalleler/seyh-samil/alkon-sitesi", destination: "/mahalleler/ata-mahallesi/alkon-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/dilara-sitesi", destination: "/mahalleler/ata-mahallesi/dilara-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/rusen-park-sitesi", destination: "/mahalleler/ata-mahallesi/rusen-park-evleri", permanent: true },
      { source: "/mahalleler/seyh-samil/vizyon-baspinar", destination: "/mahalleler/ata-mahallesi/vizyon-baspinar-sitesi", permanent: true },
      { source: "/mahalleler/yavuz-selim/aker-mucevher-evleri", destination: "/mahalleler/ata-mahallesi/aker-mucevher-evleri", permanent: true },
      { source: "/mahalleler/yavuz-selim/genova", destination: "/mahalleler/ata-mahallesi/genova", permanent: true },
      { source: "/mahalleler/yavuz-selim/gold-life-konutlari", destination: "/mahalleler/ata-mahallesi/gold-life-konutlari", permanent: true },
      { source: "/mahalleler/yavuz-selim/mavi-bayrak-sitesi", destination: "/mahalleler/ata-mahallesi/mavi-bayrak-sitesi", permanent: true },
      { source: "/mahalleler/yavuz-selim/panorama-plus", destination: "/mahalleler/ata-mahallesi/panorama-plus", permanent: true },
      { source: "/mahalleler/yavuz-selim/prestige-park-konutlari", destination: "/mahalleler/ata-mahallesi/prestij-park-konutlari", permanent: true },
      { source: "/mahalleler/yavuz-selim/selvi-evleri", destination: "/mahalleler/ata-mahallesi/selvi-evleri-sitesi", permanent: true },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      // Google yorum kısa yolu: müşteriye "siringayrimenkul.com/yorum" demek,
      // g.page/r/... bağlantısını okumaktan kolay ve markalı. permanent DEĞİL —
      // hedef Google tarafında değişebilir ve dış siteye kalıcı yönlendirme
      // vermek istemiyoruz.
      {
        source: "/yorum",
        destination: "https://g.page/r/CYTc7nWjtnEoEBM/review",
        permanent: false,
      },
      // KALDIRILAN BLOG YAZILARININ 301'LERİ BURADAN ÇIKARILDI (2026-08-10).
      //
      // 25 yazı (TTBS yazısı + 2026-08-07'deki 24 genel konulu yazı) tam da
      // "Türkiye geneli alakasız trafik" gerekçesiyle silinmişti, ama hepsi
      // /blog'a 301'leniyordu. TTBS'te sonucu ölçtük: silinmesinden on gün
      // sonra GSC hâlâ o adrese günde ~90 gösterim yazıyordu. Yönlendirme
      // adresi Google'ın gözünde canlı tutuyor ve "ttbs sorgulama" gibi
      // sorguların sinyalini /blog'a taşıyor — yani gereksiz trafik ölmüyor,
      // adres değiştiriyor. (Silinen içeriğin konusuyla ilgisiz bir hedefe
      // yapılan 301'i Google zaten yumuşak 404 sayıyor.)
      //
      // Hepsi artık proxy.ts'teki tek listeden 410 Gone dönüyor. Yeni bir
      // yazı kapatılırsa kural buraya değil o listeye eklenir.
      // 1/2/3. Etap yönlendirmeleri BİLEREK KALDIRILDI (2026-08-08).
      //
      // Bu üç kural, o etapların sayfaları doğrulanmamış gruplamadan beslendiği
      // için kapatıldığında eklenmişti ve eski adresi MAHALLE sayfasına
      // gönderiyordu. 81cda7d (2026-08-07) ile üç etap da resmî ada listeleriyle
      // yeniden açıldı; kurallar ise kaldı. Sonuç: /mahalleler/altay/etaplar/1
      // yeniden açılan etap sayfasına değil mahalle sayfasına 301'leniyordu —
      // yani eski adresin taşıdığı sinyal etap sayfasından KAÇIRILIYORDU.
      // (4. ve 5. Etap'ta böyle bir kural olmadığı için onlar hep doğru gidiyordu.)
      //
      // Silindiler; aşağıdaki MAHALLE SLUG TAŞIMASI bloğundaki genel kural
      // (`/mahalleler/altay/:path*`) eski adresi doğru hedefe taşıyor:
      //   /mahalleler/altay/etaplar/1 → /mahalleler/altay-mahallesi/etaplar/1
      // Bir etap sayfası ileride tekrar kapanırsa buraya yeniden kural eklemek
      // yerine önce lib/etap-onayli.ts'ten çıkarılır (sayfa zaten üretilmez).

      // ÖLÜ ADA URL'LERİ (2026-08-12 gece analizi): kadastro düzeltmeleriyle
      // sahipsiz kalan ama dizinde/SERP'te hâlâ yaşayan ada adresleri. Varisler
      // git geçmişinden doğrulandı (90b7f70/07bd9f8/8e6950d). Hem eski hem
      // yeni slug biçimi yazıldı ki genel taşıma kuralına düşüp zincir olmasın.
      // (46432-1 kuralları 27.08 Yenimahalle kaldırmasıyla silindi — varisi ata-mahallesi'ndeydi.)
      { source: "/mahalleler/goksu/adalar/46480-1", destination: "/mahalleler/goksu-mahallesi/goksu-metrokent-sitesi", permanent: true },
      { source: "/mahalleler/goksu-mahallesi/adalar/46480-1", destination: "/mahalleler/goksu-mahallesi/goksu-metrokent-sitesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/adalar/46656-5", destination: "/mahalleler/sehit-osman-avci-mahallesi/karma-modern", permanent: true },
      { source: "/mahalleler/sehit-osman-avci-mahallesi/adalar/46656-5", destination: "/mahalleler/sehit-osman-avci-mahallesi/karma-modern", permanent: true },

      // Silinen/birleştirilen/taşınan site kayıtlarının eski URL'leri —
      // 404 yerine yaşayan varislerine kalıcı yönlendirme (SEO değeri taşınır).
      { source: "/mahalleler/altay/ege-bloklari", destination: "/mahalleler/altay-mahallesi/age-bloklari", permanent: true },
      { source: "/mahalleler/altay/eryaman-doktorlar-sitesi", destination: "/mahalleler/altay-mahallesi/doktorlar-sitesi", permanent: true },
      { source: "/mahalleler/altay/firat-life-style", destination: "/mahalleler/altay-mahallesi/firat-life-style-botanik", permanent: true },
      { source: "/mahalleler/altay/frekans-cadde", destination: "/mahalleler/altay-mahallesi/frekans-eryaman", permanent: true },
      { source: "/mahalleler/altay/kutlutas-villalari", destination: "/mahalleler/altay-mahallesi/kutlutas-sitesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/bosphorus-ankara-konutlari", destination: "/mahalleler/sehit-osman-avci-mahallesi/alpak-neve-armonia-residence", permanent: true },
      { source: "/mahalleler/devlet/cagrikent-sitesi", destination: "/mahalleler/devlet-mahallesi", permanent: true },
      { source: "/mahalleler/devlet/ornek-tes-is-sitesi", destination: "/mahalleler/devlet-mahallesi/tes-is-bloklari", permanent: true },
      { source: "/mahalleler/eryaman/ankapark-sitesi", destination: "/mahalleler/eryaman-mahallesi/ankapark-konutlari", permanent: true },
      { source: "/mahalleler/eryaman/atakent-2-sitesi", destination: "/mahalleler/eryaman-mahallesi/atakent-2-cumhuriyet-sitesi", permanent: true },
      { source: "/mahalleler/eryaman/gestas-toki", destination: "/mahalleler/eryaman-mahallesi", permanent: true },
      { source: "/mahalleler/eryaman/metrokent-sitesi", destination: "/mahalleler/eryaman-mahallesi", permanent: true },
      { source: "/mahalleler/eryaman/sehr-i-huzur-gold-konutlari", destination: "/mahalleler/eryaman-mahallesi/asm-golt-sitesi", permanent: true },
      { source: "/mahalleler/eryaman/sehr-i-huzur-prestij-konutlari", destination: "/mahalleler/eryaman-mahallesi/asm-prestij-konutlari", permanent: true },
      { source: "/mahalleler/goksu/metrokent-sitesi", destination: "/mahalleler/goksu-mahallesi", permanent: true },
      { source: "/mahalleler/goksu/spor-sitesi", destination: "/mahalleler/goksu-mahallesi/gsv-spor-sitesi", permanent: true },
      { source: "/mahalleler/goksu/utku-kent-1-sitesi", destination: "/mahalleler/goksu-mahallesi/utku-kent-2-sitesi", permanent: true },
      { source: "/mahalleler/goksu/uzuner-sitesi", destination: "/mahalleler/altay-mahallesi/uzuner-konutlari", permanent: true },
      { source: "/mahalleler/guzelkent/ersan-sitesi", destination: "/mahalleler/guzelkent-mahallesi/kosk-sitesi", permanent: true },
      { source: "/mahalleler/guzelkent/eryaman-renk-villalari", destination: "/mahalleler/guzelkent-mahallesi/renk-villalari", permanent: true },
      { source: "/mahalleler/guzelkent/guz-gol-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/guz-gol-sitesi", permanent: true },
      { source: "/mahalleler/guzelkent/seniz-konut-kooperatifi", destination: "/mahalleler/guzelkent-mahallesi/seniz-sitesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/akin-689-konutlari", destination: "/mahalleler/sehit-osman-avci-mahallesi/akin-688-konutlari", permanent: true },
      // "-mahallesi" ekli biçim de kapsanmalı: canlı SERP taramasında (2026-08-01)
      // "Akın 688 Konutları emlakçı" aramasında Google TAM BU ADRESİ gösteriyordu
      // ve adres 404 veriyordu — kural yalnızca eski kısa mahalle adına yazılmıştı.
      { source: "/mahalleler/sehit-osman-avci-mahallesi/akin-689-konutlari", destination: "/mahalleler/sehit-osman-avci-mahallesi/akin-688-konutlari", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/armonia-konutlari", destination: "/mahalleler/sehit-osman-avci-mahallesi/alpak-neve-armonia-residence", permanent: true },
      // Cumhuriyet Sitesi (17491) = Kutlutaş 2 Blokları'nın ilk adası; Özgün'ün
      // 28.08 kararıyla tek kayda birleştirildi (üç ada tek site). Eski ad
      // alternatifAdlar'da yaşıyor, sayfa varisine yönlenir.
      { source: "/mahalleler/sehit-osman-avci/cumhuriyet-sitesi", destination: "/mahalleler/sehit-osman-avci-mahallesi/kutlutas-2-bloklari", permanent: true },
      { source: "/mahalleler/sehit-osman-avci-mahallesi/cumhuriyet-sitesi", destination: "/mahalleler/sehit-osman-avci-mahallesi/kutlutas-2-bloklari", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/firat-life-style-goksu-sitesi", destination: "/mahalleler/sehit-osman-avci-mahallesi/goksu-prestij", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/hill-tower-cadde", destination: "/mahalleler/sehit-osman-avci-mahallesi/hill-tower-goksu", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/koroglu-goldekent-evleri", destination: "/mahalleler/sehit-osman-avci-mahallesi/goldekent-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/concept-eryaman", destination: "/mahalleler/yavuz-selim-mahallesi/concept-eryaman", permanent: true },
      { source: "/mahalleler/seyh-samil/alarko-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/alarko-bloklari", permanent: true },
      { source: "/mahalleler/seyh-samil/borankent-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/borankent", permanent: true },
      { source: "/mahalleler/seyh-samil/eston-2-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/eston-bloklari", permanent: true },
      { source: "/mahalleler/seyh-samil-mahallesi/eston-2-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/eston-bloklari", permanent: true },
      // Google, "Eston Sitesi eryaman emlakçı" aramasında Şehit Osman Avcı
      // altındaki eston-2-sitesi adresini gösteriyor (canlı ölçüm 2026-08-01) —
      // orada hiç sayfa olmadı, 404 dönüyordu. Eston Sitesi ŞOA'da, Eston
      // Blokları Şeyh Şamil'de; bu adres ŞOA kaydına gitmeli.
      { source: "/mahalleler/sehit-osman-avci/eston-2-sitesi", destination: "/mahalleler/sehit-osman-avci-mahallesi/eston-sitesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci-mahallesi/eston-2-sitesi", destination: "/mahalleler/sehit-osman-avci-mahallesi/eston-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/hava-yollari-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/havayollari-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/oz-ahi-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/ozahikent-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/ozahi-kent", destination: "/mahalleler/seyh-samil-mahallesi/ozahikent-sitesi", permanent: true },
      { source: "/mahalleler/tunahan/kur-sitesi", destination: "/mahalleler/tunahan-mahallesi/kur-sitesi-46495-ada", permanent: true },
      { source: "/mahalleler/tunahan/kur-sitesi-c1b-2k", destination: "/mahalleler/tunahan-mahallesi/kur-sitesi-46495-ada", permanent: true },
      { source: "/mahalleler/tunahan/kur-sitesi-c2b-2h", destination: "/mahalleler/tunahan-mahallesi/kur-sitesi-46496-ada", permanent: true },
      { source: "/mahalleler/yavuz-selim/demirglass-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/lider-yasam-evleri", permanent: true },
      { source: "/mahalleler/yavuz-selim/elitnar-cicegi-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/elit-nar-cicegi", permanent: true },
      { source: "/mahalleler/yavuz-selim/ozahikent-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/ozahikent-sitesi", permanent: true },
      { source: "/mahalleler/yesilova/doganlife-yesilova", destination: "/mahalleler/yesilova-mahallesi/dogan-life", permanent: true },
      { source: "/mahalleler/yesilova/ekiciler-sitesi", destination: "/mahalleler/yesilova-mahallesi", permanent: true },
      { source: "/mahalleler/yesilova/meric-sitesi", destination: "/mahalleler/yesilova-mahallesi", permanent: true },

      // Search Console'un raporladığı gerçek 404'ler (2026-07-28). Ada rota
      // anahtarı bugün "<ada>-<parsel>"; Google'ın hâlâ denediği parselsiz eski
      // biçim 404 veriyordu. Ada sayfaları artık noindex olduğu için hedef,
      // adanın kendisi değil o adadaki SİTE sayfası — link değeri dizindeki
      // sayfaya aksın. "etaplar/undefined" ise ölü bir link hatasının kalıntısı.
      { source: "/mahalleler/tunahan/adalar/46497", destination: "/mahalleler/tunahan-mahallesi/sarigul-sitesi", permanent: true },
      { source: "/mahalleler/tunahan-mahallesi/adalar/46497", destination: "/mahalleler/tunahan-mahallesi/sarigul-sitesi", permanent: true },
      { source: "/mahalleler/tunahan/adalar/17635", destination: "/mahalleler/tunahan-mahallesi/haznedaroglu-bloklari", permanent: true },
      { source: "/mahalleler/tunahan-mahallesi/adalar/17635", destination: "/mahalleler/tunahan-mahallesi/haznedaroglu-bloklari", permanent: true },
      { source: "/mahalleler/yesilova/etaplar/undefined", destination: "/mahalleler/yesilova-mahallesi", permanent: true },
      { source: "/mahalleler/yesilova-mahallesi/etaplar/undefined", destination: "/mahalleler/yesilova-mahallesi", permanent: true },

      // GSC 404 raporunun 2026-08-08 turunda kalan iki kayıt. İkisi de
      // "yönlendirme var ama vardığı yer yok" durumundaydı: mahalle slug'ı
      // <slug>-mahallesi'ne çevriliyor, sonra hedef 404 veriyordu — düz 404'ten
      // kötü, çünkü tarama bütçesini iki istekte harcıyor.
      // 46495: parselsiz eski ada biçimi; gerçek rota anahtarı "<ada>-<parsel>".
      // cevilidere: eski link "z" harfi eksik yazılmış (doğrusu cevizlidere).
      { source: "/mahalleler/tunahan/adalar/46495", destination: "/mahalleler/tunahan-mahallesi/kur-sitesi-46495-ada", permanent: true },
      { source: "/mahalleler/tunahan-mahallesi/adalar/46495", destination: "/mahalleler/tunahan-mahallesi/kur-sitesi-46495-ada", permanent: true },
      { source: "/mahalleler/devlet/cevilidere-sitesi", destination: "/mahalleler/devlet-mahallesi/cevizlidere-sitesi", permanent: true },
      { source: "/mahalleler/devlet-mahallesi/cevilidere-sitesi", destination: "/mahalleler/devlet-mahallesi/cevizlidere-sitesi", permanent: true },

      // Özgün kararı (2026-07-28): ela-concept-evleri silindi — müteahhidin 2014
      // tanıtımı dışında kanıt yok, işaret ettiği parsel (46653/2) uyduda hâlâ boş
      // ve tapuda "tek katlı kargir ahır" — proje gerçekleşmemiş.
      { source: "/mahalleler/sehit-osman-avci/ela-concept-evleri", destination: "/mahalleler/sehit-osman-avci-mahallesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci-mahallesi/ela-concept-evleri", destination: "/mahalleler/sehit-osman-avci-mahallesi", permanent: true },

      // Başkent Sular Sitesi iki kez kayıtlıydı. Yavuz Selim'deki kayıt doğru
      // (19524/2, "16 adet dubleks ev"); Google ve Yandex de siteyi Yavuz Selim'de
      // gösteriyor. Güzelkent'teki ikinci kayıt hatalıydı: 18477/1 parselini tutuyordu
      // ama orası Ritim Eryaman (510. Sok. No:1, "A ve B blok 14 katlı", 96 konut).
      // Dupe silindi, parsel Ritim'e verildi.
      { source: "/mahalleler/guzelkent/baskent-sular-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/baskent-sular-sitesi", permanent: true },
      { source: "/mahalleler/guzelkent-mahallesi/baskent-sular-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/baskent-sular-sitesi", permanent: true },

      // "Çelikler Sitesi": Eryaman'da bu adla bir yerleşim yok — Google Maps, OSM,
      // bilgiemlak ve Yandex'te sıfır sonuç (Ankara'daki tek Çelikler Sitesi Bilkent
      // tarafında, 20 km uzakta). mahalleportal'ın 45824/1'e verdiği bu etiket yanlış;
      // o parsel Esenkent Sitesi'nin ve TKGM ile doğrulanmış. Ad, Esenkent'in
      // alternatifAdlar'ında yaşıyor.
      { source: "/mahalleler/yavuz-selim/celikler-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/esenkent-sitesi", permanent: true },
      { source: "/mahalleler/yavuz-selim-mahallesi/celikler-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/esenkent-sitesi", permanent: true },

      // Hayalet kayıt temizliği (2026-07-28, araştırma turu) — gerçek bir
      // yerleşim değil, dizin/etiket artığıydı:
      //  - "Türk Konut": TÜRKKONUT = yapı kooperatifleri merkez birliği, yani çatı marka.
      //    Şeyh Şamil'deki 14+ site zaten "Türkkonut X Sitesi" adıyla ayrı ayrı kayıtlı;
      //    düz bu adla anılan tek bir yerleşim yok. SEO'su mahallenin alternatifAdlar'ında.
      { source: "/mahalleler/seyh-samil/turk-konut", destination: "/mahalleler/seyh-samil-mahallesi", permanent: true },
      { source: "/mahalleler/seyh-samil-mahallesi/turk-konut", destination: "/mahalleler/seyh-samil-mahallesi", permanent: true },

      // MAHALLE SLUG TAŞIMASI (2026-07-26): /mahalleler/tunahan ->
      // /mahalleler/tunahan-mahallesi. Eski adreslerin TAMAMI (mahalle sayfası,
      // altındaki site/ada/etap sayfaları) kalıcı olarak yenisine taşınıyor.
      // Bu blok listenin SONUNDA olmalı: yukarıdaki tekil yönlendirmeler daha
      // spesifik ve Next.js ilk eşleşeni uyguluyor.
      { source: "/mahalleler/altay", destination: "/mahalleler/altay-mahallesi", permanent: true },
      { source: "/mahalleler/altay/:path*", destination: "/mahalleler/altay-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/devlet", destination: "/mahalleler/devlet-mahallesi", permanent: true },
      { source: "/mahalleler/devlet/:path*", destination: "/mahalleler/devlet-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/eryaman", destination: "/mahalleler/eryaman-mahallesi", permanent: true },
      { source: "/mahalleler/eryaman/:path*", destination: "/mahalleler/eryaman-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/goksu", destination: "/mahalleler/goksu-mahallesi", permanent: true },
      { source: "/mahalleler/goksu/:path*", destination: "/mahalleler/goksu-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/guzelkent", destination: "/mahalleler/guzelkent-mahallesi", permanent: true },
      { source: "/mahalleler/guzelkent/:path*", destination: "/mahalleler/guzelkent-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/sehit-osman-avci", destination: "/mahalleler/sehit-osman-avci-mahallesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/:path*", destination: "/mahalleler/sehit-osman-avci-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/seker", destination: "/mahalleler/seker-mahallesi", permanent: true },
      { source: "/mahalleler/seker/:path*", destination: "/mahalleler/seker-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/seyh-samil", destination: "/mahalleler/seyh-samil-mahallesi", permanent: true },
      { source: "/mahalleler/seyh-samil/:path*", destination: "/mahalleler/seyh-samil-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/tunahan", destination: "/mahalleler/tunahan-mahallesi", permanent: true },
      { source: "/mahalleler/tunahan/:path*", destination: "/mahalleler/tunahan-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/yavuz-selim", destination: "/mahalleler/yavuz-selim-mahallesi", permanent: true },
      { source: "/mahalleler/yavuz-selim/:path*", destination: "/mahalleler/yavuz-selim-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/yesilova", destination: "/mahalleler/yesilova-mahallesi", permanent: true },
      { source: "/mahalleler/yesilova/:path*", destination: "/mahalleler/yesilova-mahallesi/:path*", permanent: true },

      // KÖK DİZİN ŞEMASI (mahalleler/ öneki gelmeden önceki en eski adresler):
      // /tunahan/etaplar/4, /altay/kutlutas-sitesi gibi. Yukarıdaki blok yalnız
      // /mahalleler/<eskiSlug> ailesini kurtarıyordu; bu aile 404 dönüyordu ve
      // en az biri hâlâ Google'ın dizininde: "site:siringayrimenkul.com" taraması
      // /tunahan/etaplar sayfasını ESKİ içerikle (49 ada) listeliyor (08.08.2026).
      // Kök segmentler mahalle adlarıyla sınırlı — gerçek üst düzey rotalarla
      // (/blog, /araclar, /eryamanda-ev-satmak…) çakışmaz.
      { source: "/altay", destination: "/mahalleler/altay-mahallesi", permanent: true },
      { source: "/altay/:path*", destination: "/mahalleler/altay-mahallesi/:path*", permanent: true },
      { source: "/devlet", destination: "/mahalleler/devlet-mahallesi", permanent: true },
      { source: "/devlet/:path*", destination: "/mahalleler/devlet-mahallesi/:path*", permanent: true },
      { source: "/eryaman", destination: "/mahalleler/eryaman-mahallesi", permanent: true },
      { source: "/eryaman/:path*", destination: "/mahalleler/eryaman-mahallesi/:path*", permanent: true },
      { source: "/goksu", destination: "/mahalleler/goksu-mahallesi", permanent: true },
      { source: "/goksu/:path*", destination: "/mahalleler/goksu-mahallesi/:path*", permanent: true },
      { source: "/guzelkent", destination: "/mahalleler/guzelkent-mahallesi", permanent: true },
      { source: "/guzelkent/:path*", destination: "/mahalleler/guzelkent-mahallesi/:path*", permanent: true },
      { source: "/sehit-osman-avci", destination: "/mahalleler/sehit-osman-avci-mahallesi", permanent: true },
      { source: "/sehit-osman-avci/:path*", destination: "/mahalleler/sehit-osman-avci-mahallesi/:path*", permanent: true },
      { source: "/seker", destination: "/mahalleler/seker-mahallesi", permanent: true },
      { source: "/seker/:path*", destination: "/mahalleler/seker-mahallesi/:path*", permanent: true },
      { source: "/seyh-samil", destination: "/mahalleler/seyh-samil-mahallesi", permanent: true },
      { source: "/seyh-samil/:path*", destination: "/mahalleler/seyh-samil-mahallesi/:path*", permanent: true },
      { source: "/tunahan", destination: "/mahalleler/tunahan-mahallesi", permanent: true },
      { source: "/tunahan/:path*", destination: "/mahalleler/tunahan-mahallesi/:path*", permanent: true },
      { source: "/yavuz-selim", destination: "/mahalleler/yavuz-selim-mahallesi", permanent: true },
      { source: "/yavuz-selim/:path*", destination: "/mahalleler/yavuz-selim-mahallesi/:path*", permanent: true },
      { source: "/yesilova", destination: "/mahalleler/yesilova-mahallesi", permanent: true },
      { source: "/yesilova/:path*", destination: "/mahalleler/yesilova-mahallesi/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
