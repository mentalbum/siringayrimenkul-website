import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Logo/görseller dosya adı değişmeden güncellenmez — tarayıcı önbelleği 31 gün.
    minimumCacheTTL: 2678400,
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
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
      // Etap sayfaları artık yalnız RESMÎ ada listesi olan etaplarda üretiliyor
      // (lib/etap-onayli.ts): 4. ve 5. Etap. 1/2/3. Etap sayfaları doğrulanmamış
      // gruplamadan besleniyordu — kaldırıldı, mahalle sayfalarına yönlendirildi.
      // İlgili etabın toplu yapı yönetiminden resmî ada listesi gelirse geri açılır.
      { source: "/mahalleler/altay/etaplar/1", destination: "/mahalleler/altay-mahallesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/etaplar/2", destination: "/mahalleler/sehit-osman-avci-mahallesi", permanent: true },
      { source: "/mahalleler/seyh-samil/etaplar/3", destination: "/mahalleler/seyh-samil-mahallesi", permanent: true },

      // Silinen/birleştirilen/taşınan site kayıtlarının eski URL'leri —
      // 404 yerine yaşayan varislerine kalıcı yönlendirme (SEO değeri taşınır).
      { source: "/mahalleler/altay/ege-bloklari", destination: "/mahalleler/altay-mahallesi/age-bloklari", permanent: true },
      { source: "/mahalleler/altay/eryaman-doktorlar-sitesi", destination: "/mahalleler/altay-mahallesi/doktorlar-sitesi", permanent: true },
      { source: "/mahalleler/altay/firat-life-style", destination: "/mahalleler/altay-mahallesi/firat-life-style-botanik", permanent: true },
      { source: "/mahalleler/altay/frekans-cadde", destination: "/mahalleler/altay-mahallesi/frekans-eryaman", permanent: true },
      { source: "/mahalleler/altay/kutlutas-villalari", destination: "/mahalleler/altay-mahallesi/kutlutas-sitesi", permanent: true },
      { source: "/mahalleler/ata/bilgeturk-manzara-evleri", destination: "/mahalleler/ata-mahallesi", permanent: true },
      { source: "/mahalleler/ata/karkonut", destination: "/mahalleler/ata-mahallesi/anemon-sitesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/bosphorus-ankara-konutlari", destination: "/mahalleler/sehit-osman-avci-mahallesi/alpak-neve-armonia-residence", permanent: true },
      { source: "/mahalleler/ata/erkent-umut-sitesi", destination: "/mahalleler/ata-mahallesi/beloren-manzara-evleri", permanent: true },
      { source: "/mahalleler/ata/prestige-park-konutlari", destination: "/mahalleler/ata-mahallesi/prestij-park-konutlari", permanent: true },
      { source: "/mahalleler/ata/selvi-evleri", destination: "/mahalleler/ata-mahallesi/selvi-evleri-sitesi", permanent: true },
      { source: "/mahalleler/ata/sogut-bahce-sitesi", destination: "/mahalleler/ata-mahallesi/sogut-bahce-konutlari", permanent: true },
      { source: "/mahalleler/cumhuriyet/bati-konutlari", destination: "/mahalleler/cumhuriyet-mahallesi", permanent: true },
      { source: "/mahalleler/cumhuriyet/ciglik-sitesi", destination: "/mahalleler/cumhuriyet-mahallesi/gunebakan-sitesi", permanent: true },
      { source: "/mahalleler/cumhuriyet/green-tower", destination: "/mahalleler/cumhuriyet-mahallesi/ap-green-tower", permanent: true },
      { source: "/mahalleler/cumhuriyet/kiratli-akropolis", destination: "/mahalleler/cumhuriyet-mahallesi", permanent: true },
      { source: "/mahalleler/cumhuriyet/tuna-park-evleri", destination: "/mahalleler/cumhuriyet-mahallesi", permanent: true },
      { source: "/mahalleler/cumhuriyet/yeni-botanik-parki", destination: "/mahalleler/cumhuriyet-mahallesi/yeni-botanik-sitesi", permanent: true },
      { source: "/mahalleler/devlet/cagrikent-sitesi", destination: "/mahalleler/devlet-mahallesi", permanent: true },
      { source: "/mahalleler/devlet/ornek-tes-is-sitesi", destination: "/mahalleler/devlet-mahallesi/tes-is-bloklari", permanent: true },
      { source: "/mahalleler/eryaman/ankapark-sitesi", destination: "/mahalleler/eryaman-mahallesi/ankapark-konutlari", permanent: true },
      { source: "/mahalleler/eryaman/atakent-2-sitesi", destination: "/mahalleler/eryaman-mahallesi/atakent-2-cumhuriyet-sitesi", permanent: true },
      { source: "/mahalleler/eryaman/gestas-toki", destination: "/mahalleler/eryaman-mahallesi", permanent: true },
      { source: "/mahalleler/eryaman/metrokent-sitesi", destination: "/mahalleler/eryaman-mahallesi", permanent: true },
      { source: "/mahalleler/eryaman/sehr-i-huzur-gold-konutlari", destination: "/mahalleler/eryaman-mahallesi/asm-golt-sitesi", permanent: true },
      { source: "/mahalleler/eryaman/sehr-i-huzur-prestij-konutlari", destination: "/mahalleler/eryaman-mahallesi/asm-prestij-konutlari", permanent: true },
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
      { source: "/mahalleler/goksu/metrokent-sitesi", destination: "/mahalleler/goksu-mahallesi", permanent: true },
      { source: "/mahalleler/goksu/neovadi-konutlari", destination: "/mahalleler/susuz-mahallesi/neovadi-konutlari", permanent: true },
      { source: "/mahalleler/goksu/neva-palas", destination: "/mahalleler/susuz-mahallesi/neva-palas", permanent: true },
      { source: "/mahalleler/goksu/nil-my-home", destination: "/mahalleler/susuz-mahallesi/nil-my-home", permanent: true },
      { source: "/mahalleler/goksu/perla-life", destination: "/mahalleler/susuz-mahallesi/perla-life", permanent: true },
      { source: "/mahalleler/goksu/serline-konutlari", destination: "/mahalleler/susuz-mahallesi/serline-konutlari", permanent: true },
      { source: "/mahalleler/goksu/spor-sitesi", destination: "/mahalleler/goksu-mahallesi/gsv-spor-sitesi", permanent: true },
      { source: "/mahalleler/goksu/utku-kent-1-sitesi", destination: "/mahalleler/goksu-mahallesi/utku-kent-2-sitesi", permanent: true },
      { source: "/mahalleler/goksu/uzuner-sitesi", destination: "/mahalleler/altay-mahallesi/uzuner-konutlari", permanent: true },
      { source: "/mahalleler/goksu/vera-life-goksu", destination: "/mahalleler/susuz-mahallesi/vera-life-goksu", permanent: true },
      { source: "/mahalleler/goksu/white-dream-sitesi", destination: "/mahalleler/susuz-mahallesi/white-dream-sitesi", permanent: true },
      { source: "/mahalleler/guzelkent/ersan-sitesi", destination: "/mahalleler/guzelkent-mahallesi/kosk-sitesi", permanent: true },
      { source: "/mahalleler/guzelkent/eryaman-renk-villalari", destination: "/mahalleler/guzelkent-mahallesi/renk-villalari", permanent: true },
      { source: "/mahalleler/guzelkent/guz-gol-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/guz-gol-sitesi", permanent: true },
      { source: "/mahalleler/guzelkent/seniz-konut-kooperatifi", destination: "/mahalleler/guzelkent-mahallesi/seniz-sitesi", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/akin-689-konutlari", destination: "/mahalleler/sehit-osman-avci-mahallesi/akin-688-konutlari", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/armonia-konutlari", destination: "/mahalleler/sehit-osman-avci-mahallesi/alpak-neve-armonia-residence", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/firat-life-style-goksu-sitesi", destination: "/mahalleler/sehit-osman-avci-mahallesi/goksu-prestij", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/golde-luxe-konutlari", destination: "/mahalleler/cumhuriyet-mahallesi/golde-luxe-konutlari", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/hill-tower-cadde", destination: "/mahalleler/sehit-osman-avci-mahallesi/hill-tower-goksu", permanent: true },
      { source: "/mahalleler/sehit-osman-avci/koroglu-goldekent-evleri", destination: "/mahalleler/sehit-osman-avci-mahallesi/goldekent-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/concept-eryaman", destination: "/mahalleler/yavuz-selim-mahallesi/concept-eryaman", permanent: true },
      { source: "/mahalleler/seyh-samil/alarko-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/alarko-bloklari", permanent: true },
      { source: "/mahalleler/seyh-samil/alkon-sitesi", destination: "/mahalleler/ata-mahallesi/alkon-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/borankent-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/borankent", permanent: true },
      { source: "/mahalleler/seyh-samil/dilara-sitesi", destination: "/mahalleler/ata-mahallesi/dilara-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/eston-2-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/eston-bloklari", permanent: true },
      { source: "/mahalleler/seyh-samil/hava-yollari-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/havayollari-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/oz-ahi-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/ozahikent-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/ozahi-kent", destination: "/mahalleler/seyh-samil-mahallesi/ozahikent-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/rusen-park-sitesi", destination: "/mahalleler/ata-mahallesi/rusen-park-evleri", permanent: true },
      { source: "/mahalleler/seyh-samil/vizyon-baspinar", destination: "/mahalleler/ata-mahallesi/vizyon-baspinar-sitesi", permanent: true },
      { source: "/mahalleler/susuz/mizan-sitesi", destination: "/mahalleler/ata-mahallesi/mizan-sitesi", permanent: true },
      { source: "/mahalleler/susuz/ozkardesler-sitesi", destination: "/mahalleler/ata-mahallesi/ozkardesler-sitesi", permanent: true },
      { source: "/mahalleler/susuz/palmiye-evleri", destination: "/mahalleler/susuz-mahallesi/tatli-yamac-palmiye-evleri", permanent: true },
      { source: "/mahalleler/susuz/panorama-gold", destination: "/mahalleler/ata-mahallesi/panorama-gold", permanent: true },
      { source: "/mahalleler/susuz/paradise-goksu-konutlari", destination: "/mahalleler/susuz-mahallesi/paradise-goksu", permanent: true },
      { source: "/mahalleler/susuz/rusen-park-evleri", destination: "/mahalleler/ata-mahallesi/rusen-park-evleri", permanent: true },
      { source: "/mahalleler/susuz/ruya-kent-sitesi", destination: "/mahalleler/ata-mahallesi/ruyakent-sitesi", permanent: true },
      { source: "/mahalleler/susuz/sumeyra-2-sitesi", destination: "/mahalleler/ata-mahallesi/sumeyra-2-sitesi", permanent: true },
      { source: "/mahalleler/susuz/vizyon-baspinar-sitesi", destination: "/mahalleler/ata-mahallesi/vizyon-baspinar-sitesi", permanent: true },
      { source: "/mahalleler/tunahan/kur-sitesi", destination: "/mahalleler/tunahan-mahallesi/kur-sitesi-46495-ada", permanent: true },
      { source: "/mahalleler/tunahan/kur-sitesi-c1b-2k", destination: "/mahalleler/tunahan-mahallesi/kur-sitesi-46495-ada", permanent: true },
      { source: "/mahalleler/tunahan/kur-sitesi-c2b-2h", destination: "/mahalleler/tunahan-mahallesi/kur-sitesi-46496-ada", permanent: true },
      { source: "/mahalleler/yavuz-selim/aker-mucevher-evleri", destination: "/mahalleler/ata-mahallesi/aker-mucevher-evleri", permanent: true },
      { source: "/mahalleler/yavuz-selim/demirglass-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/lider-yasam-evleri", permanent: true },
      { source: "/mahalleler/yavuz-selim/elitnar-cicegi-sitesi", destination: "/mahalleler/yavuz-selim-mahallesi/elit-nar-cicegi", permanent: true },
      { source: "/mahalleler/yavuz-selim/genova", destination: "/mahalleler/ata-mahallesi/genova", permanent: true },
      { source: "/mahalleler/yavuz-selim/gold-life-konutlari", destination: "/mahalleler/ata-mahallesi/gold-life-konutlari", permanent: true },
      { source: "/mahalleler/yavuz-selim/mavi-bayrak-sitesi", destination: "/mahalleler/ata-mahallesi/mavi-bayrak-sitesi", permanent: true },
      { source: "/mahalleler/yavuz-selim/ozahikent-sitesi", destination: "/mahalleler/seyh-samil-mahallesi/ozahikent-sitesi", permanent: true },
      { source: "/mahalleler/yavuz-selim/panorama-plus", destination: "/mahalleler/ata-mahallesi/panorama-plus", permanent: true },
      { source: "/mahalleler/yavuz-selim/prestige-park-konutlari", destination: "/mahalleler/ata-mahallesi/prestij-park-konutlari", permanent: true },
      { source: "/mahalleler/yavuz-selim/selvi-evleri", destination: "/mahalleler/ata-mahallesi/selvi-evleri-sitesi", permanent: true },
      { source: "/mahalleler/yesilova/doganlife-yesilova", destination: "/mahalleler/yesilova-mahallesi/dogan-life", permanent: true },
      { source: "/mahalleler/yesilova/ekiciler-sitesi", destination: "/mahalleler/yesilova-mahallesi", permanent: true },
      { source: "/mahalleler/yesilova/meric-sitesi", destination: "/mahalleler/yesilova-mahallesi", permanent: true },

      // "Hürev Yapı Kooperatifi" kaydı kaldırıldı (Özgün, 2026-07-29:
      // "hürev yapı kooperatifi diye bir yer yok"). Kayıt bilgiemlak'ın 2013
      // dönemi dizininden gelmişti ("Hür-Ev KYK (44774 Ada)"); o parselde
      // (44774/3) bugün Ata Life Sitesi var — saha tabelası, Google kaydı ve
      // 3768. Sokak adresi onu gösteriyor. Ada 44774'te yalnız iki parsel var
      // ve /2 Raylı Sistemciler'e alanla çivilendiği için /3 elemeyle Ata
      // Life'a kalıyor. Kooperatif adı Özgün tanımadığı için alternatif ad
      // olarak da tutulmadı.
      { source: "/mahalleler/ata/hurev-yapi-kooperatifi", destination: "/mahalleler/ata-mahallesi/ata-life-sitesi", permanent: true },
      { source: "/mahalleler/ata-mahallesi/hurev-yapi-kooperatifi", destination: "/mahalleler/ata-mahallesi/ata-life-sitesi", permanent: true },

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

      // Özgün kararı (2026-07-28): kanat-yapi-evleri ve ela-concept-evleri silindi.
      // Kanat Yapı: sahibinden'in Ata Mahallesi site listesinden gelmişti ama Google,
      // Yandex, OSM, bilgiemlak ve ticaret sicilinin hiçbirinde iz yok. Ela Concept:
      // müteahhidin 2014 tanıtımı dışında kanıt yok, işaret ettiği parsel (46653/2)
      // uyduda hâlâ boş ve tapuda "tek katlı kargir ahır" — proje gerçekleşmemiş.
      { source: "/mahalleler/ata/kanat-yapi-evleri", destination: "/mahalleler/ata-mahallesi", permanent: true },
      { source: "/mahalleler/ata-mahallesi/kanat-yapi-evleri", destination: "/mahalleler/ata-mahallesi", permanent: true },
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

      // Hayalet kayıt temizliği (2026-07-28, araştırma turu). Üçü de gerçek bir
      // yerleşim değil, dizin/etiket artığıydı:
      //  - "Ortak Grup Yapı": bilgiemlak'ın "Etikent 44756 Ada Ortak Yapı Grup" etiketinin
      //    bozulmuş hâli. O parselde (44756/2) gerçekte Umut Yapı Sitesi var, kayıtlı.
      //  - "Türk Konut": TÜRKKONUT = yapı kooperatifleri merkez birliği, yani çatı marka.
      //    Şeyh Şamil'deki 14+ site zaten "Türkkonut X Sitesi" adıyla ayrı ayrı kayıtlı;
      //    düz bu adla anılan tek bir yerleşim yok. SEO'su mahallenin alternatifAdlar'ında.
      { source: "/mahalleler/ata/ortak-grup-yapi", destination: "/mahalleler/ata-mahallesi/umut-yapi-sitesi", permanent: true },
      { source: "/mahalleler/ata-mahallesi/ortak-grup-yapi", destination: "/mahalleler/ata-mahallesi/umut-yapi-sitesi", permanent: true },
      { source: "/mahalleler/seyh-samil/turk-konut", destination: "/mahalleler/seyh-samil-mahallesi", permanent: true },
      { source: "/mahalleler/seyh-samil-mahallesi/turk-konut", destination: "/mahalleler/seyh-samil-mahallesi", permanent: true },

      // MAHALLE SLUG TAŞIMASI (2026-07-26): /mahalleler/tunahan ->
      // /mahalleler/tunahan-mahallesi. Eski adreslerin TAMAMI (mahalle sayfası,
      // altındaki site/ada/etap sayfaları) kalıcı olarak yenisine taşınıyor.
      // Bu blok listenin SONUNDA olmalı: yukarıdaki tekil yönlendirmeler daha
      // spesifik ve Next.js ilk eşleşeni uyguluyor.
      { source: "/mahalleler/altay", destination: "/mahalleler/altay-mahallesi", permanent: true },
      { source: "/mahalleler/altay/:path*", destination: "/mahalleler/altay-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/ata", destination: "/mahalleler/ata-mahallesi", permanent: true },
      { source: "/mahalleler/ata/:path*", destination: "/mahalleler/ata-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/cumhuriyet", destination: "/mahalleler/cumhuriyet-mahallesi", permanent: true },
      { source: "/mahalleler/cumhuriyet/:path*", destination: "/mahalleler/cumhuriyet-mahallesi/:path*", permanent: true },
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
      { source: "/mahalleler/susuz", destination: "/mahalleler/susuz-mahallesi", permanent: true },
      { source: "/mahalleler/susuz/:path*", destination: "/mahalleler/susuz-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/tunahan", destination: "/mahalleler/tunahan-mahallesi", permanent: true },
      { source: "/mahalleler/tunahan/:path*", destination: "/mahalleler/tunahan-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/yavuz-selim", destination: "/mahalleler/yavuz-selim-mahallesi", permanent: true },
      { source: "/mahalleler/yavuz-selim/:path*", destination: "/mahalleler/yavuz-selim-mahallesi/:path*", permanent: true },
      { source: "/mahalleler/yesilova", destination: "/mahalleler/yesilova-mahallesi", permanent: true },
      { source: "/mahalleler/yesilova/:path*", destination: "/mahalleler/yesilova-mahallesi/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
