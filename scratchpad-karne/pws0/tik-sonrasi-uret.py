#!/usr/bin/env python3
"""TIKTAN SONRA ne oluyor? — GA4 verisini karnenin okuduğu JSON'a indirger.

Karne 02.09'a kadar sıra + GSC tık/TO gösteriyordu; gelen kişinin sayfada ne
yaptığı yoktu. GA4 Data API 02.09'da açıldı (Özgün API'yi etkinleştirdi,
servis hesabı Görüntüleyici olarak eklendi). İlk okuma: 28 günde 2.393 oturum,
11 telefon tıklaması, 7 WhatsApp — ve site sayfasından sahibinden mağazasına
17 geçiş. Ev sahibi için asıl sonuç TEMAS; karne artık onu sayıyor.

İki ölçüm uyarısı, karnede de basılır:
  1. gtag.js sayfa hızı için boşta (≤3 sn) yüklenir; 3 sn altı ziyaretler hiç
     sayılmaz, süreler birkaç saniye eksik okunur (bilinçli tercih, lib/ga.ts).
  2. 26 tel: bağının 10'u PR #88'e kadar izlenmiyordu; phone_click bir TABAN,
     gerçek arama sayısı daha yüksek. PR yayına girince kıyas tabanı sıfırlanır.

08.10 DÜZELTMESİ (denetim: temas-1, ek-4 k) — "temas" sözlüğünde üç yanlış okuma vardı:
  - TIK ≠ ZİYARET: 21 tık 15 ayrı ziyaretten geliyordu. Yeni alan `temas_oturum`
    (telefon ya da WhatsApp tıkı olan ziyaret); tık adetleri yerinde durur.
  - `form_start` ana sayfadaki arama kutusunda da tetikleniyor; "3 form başlatıldı"
    üçü de arama kutusuydu. Artık YALNIZ /ev-degerleme ve /iletisim sayılır.
  - Sahibinden çıkışı iki özel olayın toplamıydı (25) ve özel olay 04.10'a kadar
    yalnız site sayfasının üst düğmesindeydi. Yeni alan `sahibinden_cikis` =
    gelişmiş ölçümün yerleşik "click" olayı + linkDomain (51 tık / 48 ziyaret; her
    dönemde tek tanım, alt sınır). Eski `site_ust_sahibinden` (özel olay toplamı)
    ve konum kırılımı `sahibinden_ozel` altında KALIR: konum yalnız özel olayda var.
  Ayrıca scripts/ga4-api.mjs artık yalnız canlı alan adını sayar (localhost'taki
  PR doğrulama tıkları karneye giriyordu).
Yeni alanların kaynağı ga4-temas.mjs. O okunamazsa üretici DURMAZ: eski alanlar
eski tanımla yazılır, yeni alanlar null kalır ve `uyarilar` bunu söyler.

Girdi : <scratchpad>/ga4-ozet28.json, ga4-aile28.json, ga4-olaylar28.tsv
        (node scripts/ga4-api.mjs ozet|aile|olaylar 28)
        <scratchpad>/ga4-temas28.json (node ga4-temas.mjs <bas> <bit>) — yoksa ya da
        penceresi tutmuyorsa bu betik ga4-temas.mjs'i kendisi çağırıp oraya yazar.
        --yerel: API'ye gitmez, yalnız hazır dosyayı okur.
Çıktı : tik-sonrasi.json
"""
import json, os, subprocess, sys, datetime
from pencere import ga4_pencere

S = os.environ.get("KARNE_SCRATCH", "")
KOK = os.path.dirname(os.path.abspath(__file__))
YEREL = "--yerel" in sys.argv
for f in ("ga4-ozet28.json", "ga4-aile28.json", "ga4-olaylar28.tsv"):
    if not S or not os.path.exists(f"{S}/{f}"):
        sys.exit(f"KARNE_SCRATCH içinde {f} yok")

ozet = json.load(open(f"{S}/ga4-ozet28.json"))
aile = json.load(open(f"{S}/ga4-aile28.json"))["aileler"]
olay = {}
for L in open(f"{S}/ga4-olaylar28.tsv"):
    p = L.rstrip("\n").split("\t")
    if len(p) == 2:
        try: olay[p[1]] = int(p[0])
        except ValueError: pass

# GA4'ün penceresi GSC'ninkinden farklı biter (dün / bugün−3); pencere.py'de gerekçesi.
PENCERE = ga4_pencere(ozet["gun"])
UYARILAR = []


def temas_oku():
    """ga4-temas.mjs çıktısını döndürür; okunamazsa (None, neden).

    Sıra: KARNE_SCRATCH/ga4-temas28.json (penceresi bu üretimin penceresiyle AYNIYSA) →
    değilse betik çağrılır ve çıktı oraya yazılır. Başka pencerenin dosyası kullanılmaz:
    dünün dosyasıyla bugünün oturum sayısı aynı orana girmesin.
    """
    yol = f"{S}/ga4-temas28.json"
    istenen = {"bas": PENCERE["bas"], "bit": PENCERE["bit"]}
    if os.path.exists(yol):
        try:
            d = json.load(open(yol, encoding="utf-8"))
            if d.get("pencere") == istenen:
                return d, None
        except ValueError:
            pass  # bozuk/yarım dosya: yeniden çekilir
    if YEREL:
        return None, "--yerel istendi, bu pencereye ait ga4-temas28.json yok"
    try:
        r = subprocess.run(["node", "ga4-temas.mjs", istenen["bas"], istenen["bit"]],
                           capture_output=True, text=True, cwd=KOK, timeout=300)
    except (OSError, subprocess.TimeoutExpired) as e:
        return None, f"ga4-temas.mjs çalıştırılamadı: {e}"
    if r.returncode != 0:
        # Yakalanmamış hatada son satır "Node.js v…" olur; asıl neden "Error:" / "HTTP" satırındadır.
        satirlar = [x.strip() for x in r.stderr.splitlines() if x.strip()]
        neden = next((x for x in satirlar if "Error" in x or x.startswith("HTTP") or "jeton" in x),
                     satirlar[-1] if satirlar else "?")
        return None, f"ga4-temas.mjs çıkış {r.returncode}: {neden[:200]}"
    try:
        d = json.loads(r.stdout)
    except ValueError:
        return None, "ga4-temas.mjs çıktısı JSON değil"
    open(yol, "w", encoding="utf-8").write(r.stdout)
    return d, None


T, T_HATA = temas_oku()

AD = {"site": "Site sayfaları", "ana sayfa": "Ana sayfa", "mahalle": "Mahalle sayfaları",
      "ada": "Ada sayfaları", "etap": "Etap sayfaları", "yazı": "Yazılar", "diğer": "Diğer (araçlar, iletişim…)"}
oturum = ozet["oturum"] or 1
temas = {"phone_click": olay.get("phone_click", 0), "whatsapp_click": olay.get("whatsapp_click", 0),
         "form_start": olay.get("form_start", 0), "contact_form_submit": olay.get("contact_form_submit", 0),
         # Özel olayların toplamı (04.10'a kadar yalnız site üstü düğmesi, sonra bütün bağlar). Seri için kalır;
         # dönemler arası kıyas için `sahibinden_cikis` kullanılır.
         "site_ust_sahibinden": olay.get("site_ust_sahibinden", 0) + olay.get("sahibinden_click", 0),
         "temas_oturum": None,
         "sahibinden_cikis": {"olay": None, "oturum": None}}
form_start_tanim = "tum_sayfalar"
if T:
    _f = T.get("form") or {}
    _sc = T.get("sahibinden_cikis_click") or {}
    temas["temas_oturum"] = (T.get("temas_oturum") or {}).get("toplam")
    if _f.get("form_start_form_sayfasinda") is not None:
        temas["form_start"] = _f["form_start_form_sayfasinda"]
        form_start_tanim = "form_sayfalari"
    temas["sahibinden_cikis"] = {"olay": _sc.get("olay"), "oturum": _sc.get("oturum")}
    # İki kaynak aynı pencereyi okumalı; tutmuyorsa girdilerden biri başka gün çekilmiştir.
    for ad in ("phone_click", "whatsapp_click"):
        t = (T.get("temas_olay") or {}).get(ad)
        if t is not None and t != temas[ad]:
            UYARILAR.append(f"{ad}: ga4-olaylar28.tsv {temas[ad]}, ga4-temas {t} diyor. İki çekimin penceresi "
                            f"farklı olabilir; ga4-api çıktıları yeniden çekilmeli.")
    for h in T.get("suzulen_host") or []:
        # Karne Özgün'e hitap eder: olay adlarını değil ne olduğunu söyle. Ayrıntı JSON'da durur
        # (ga4_temas.suzulen_host); yerel sunucu = sitenin geliştirme kopyasında yapılan deneme.
        _yer = "kendi bilgisayarımızdaki deneme kopyası" if "localhost" in (h.get("ad") or "") else f"canlı site dışındaki bir adres ({h.get('ad')})"
        _n_olay = sum((h.get("izlenen_olaylar") or {}).values())
        UYARILAR.append(f"Sitenin {_yer} üzerinden gelen {h.get('oturum')} oturum sayılmadı"
                        + (f"; içlerinde {_n_olay} deneme tıklaması vardı" if _n_olay else "") + ".")
else:
    UYARILAR.append(f"Temas ayrıntısı okunamadı ({T_HATA}). Temas eden ziyaret ve sahibinden çıkışı bu üretimde "
                    f"yok; form başlatma eski tanımla (bütün sayfalar, ana sayfadaki arama kutusu dahil) sayıldı.")


def yuzde100(v):
    """100 oturum başına; ölçülmemiş (None) değer None kalır, iç sözlük aynı anahtarlarla çevrilir."""
    if isinstance(v, dict):
        return {k: yuzde100(x) for k, x in v.items()}
    return None if v is None else round(v * 100 / oturum, 2)


cikti = {
    "guncelleme": datetime.date.today().isoformat(), "gun": ozet["gun"],
    "pencere": PENCERE,
    "ozet": ozet,
    "temas": temas,
    "temas_100": {k: yuzde100(v) for k, v in temas.items()},
    # form_start hangi tanımla sayıldı: "form_sayfalari" (yalnız /ev-degerleme + /iletisim) ya da
    # ga4-temas okunamadıysa "tum_sayfalar" (eski; arama kutusu dahil).
    "form_start_tanim": form_start_tanim,
    # Özel olay dökümü + konum (konum boyutu yalnız özel olayda var; yerleşik click'te yok).
    "sahibinden_ozel": {"site_ust_sahibinden": olay.get("site_ust_sahibinden", 0),
                        "sahibinden_click": olay.get("sahibinden_click", 0),
                        "konum": (T or {}).get("sahibinden_ozel_konum")},
    "temas_kaynak": "ga4-temas.mjs" if T else "eski (ga4-temas okunamadı)",
    "uyarilar": UYARILAR,
    # ga4-temas.mjs'in tam çıktısı: tık/ziyaret kırılımı, konum, form sayfası görüntülemesi,
    # dış bağ tıkları (click_linkdomain), mobil ofis saati. Okunamadıysa null.
    "ga4_temas": T,
    "aileler": [{"ad": AD.get(a["aile"], a["aile"]), **a} for a in aile],
}
json.dump(cikti, open(f"{KOK}/tik-sonrasi.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{ozet['gun']} gün · {ozet['oturum']} oturum · ort {ozet['ort_sure_sn']} sn · hemen çıkma %{ozet['hemen_cikma']}")
_tik = temas["phone_click"] + temas["whatsapp_click"]
_yok = lambda v: "—" if v is None else v  # ölçülmemiş değer çıktıda "None" diye görünmesin
print(f"temas: {_yok(temas['temas_oturum'])} ziyaret · {_tik} tık "
      f"({temas['phone_click']} telefon, {temas['whatsapp_click']} WhatsApp) · form başlatma {temas['form_start']} "
      f"[{form_start_tanim}] · gönderim {temas['contact_form_submit']}")
print(f"sahibinden: yerleşik click {_yok(temas['sahibinden_cikis']['olay'])} tık / {_yok(temas['sahibinden_cikis']['oturum'])} ziyaret · "
      f"özel olay {temas['site_ust_sahibinden']} (site_ust_sahibinden {olay.get('site_ust_sahibinden', 0)} + "
      f"sahibinden_click {olay.get('sahibinden_click', 0)})")
print("temas / 100 oturum:", {k: v for k, v in cikti["temas_100"].items()})
for u in UYARILAR:
    print("uyarı:", u)
