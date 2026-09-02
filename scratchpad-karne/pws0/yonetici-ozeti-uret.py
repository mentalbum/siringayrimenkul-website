#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Yönetici özeti — karnenin tepesindeki 6 rakam (02.09).

Karne 14 bölüm oldu; Özgün'ün ilk 10 saniyede görmesi gereken altı rakam tek
JSON'da toplanır. Hiçbir rakam elle yazılmaz: her biri bir üreticinin
JSON'undan ya da doğrudan ölçüm dosyasından okunur, kaynağı yanına yazılır.

  1. 504 site sorgusunda ilk 3 payı   ← sonuclar-site-emlakci.jsonl + tur-*.json
                                        (karne başlık kartıyla AYNI hesap, aşağıda neden)
  2. ilk 3'te doğru sayfa payı        ← dogru-sayfa.json
  3. GSC 28g Eryaman tıkı             ← sonuc-ozeti.json  (ayrim.eryaman.simdi.tik)
  4. GA4 28g temas (tel+WhatsApp+form)← tik-sonrasi.json  (temas)
  5. hedef sorgularda kutuda olduğumuz sayı ← hedef-sorgular.json (ozet.kutuda)
  6. damla kuyruğunda kalan           ← DIZIN-DAMLASI-31-08.md ("- [ ] url" satırları)

Her rakam için: değer, bir cümlelik "ne demek", kaynak, 7 günlük fark.
Fark karne-gecmis-ozet.json'dan OKUNUR; o dosyanın tek sahibi
anlik-goruntu-uret.py (günlük zaman serisi, "metrikler" şeması). 02.09'a kadar
bu betik de aynı dosyayı kendi şemasıyla yazıyordu — son koşan kazanıyor, öteki
bölüm boş kalıyordu; o yüzden yazma kaldırıldı. Eşleme FARK_KAYNAK'ta; seri
yoksa fark null, uydurulmaz.

Ayrıca:
  "bu hafta ne yapıldı"    ← PROTOKOL-gece.md'nin son 7 gündeki bölüm başlıkları
                             (betikle ayıklanır; gün başına bir madde, en yeni 3 gün)
  "bu hafta ne bekleniyor" ← beklenen düşüşler (sonuc-ozeti + sayfa-turu-verimi),
                             07.09 (eryaman-emlakci.json title_donuk),
                             14.09 (kaldirac-defteri.json sitemap kaydı: 31.08 + 2 hafta)

Çalıştırma (KARNE_SCRATCH gerekmez, hepsi bu klasörden okunur):
  python3 yonetici-ozeti-uret.py  → yonetici-ozeti.json

Sıra: karne-html.py'den ÖNCE, diğer üreticilerden ve anlik-goruntu-uret.py'den
SONRA koşar (onların JSON'unu okur). Hesaplanamayan rakam None kalır ve gosterim "ölçülmedi" olur; uydurulmaz.
"""
import json, re, os, datetime, collections

KOK = os.path.dirname(os.path.abspath(__file__))
BUGUN = datetime.date.today()


def yol(ad):
    return os.path.join(KOK, ad)


def tr_sayi(n, ondalik=0):
    """Türkçe biçim: binlik nokta, ondalık virgül (karne-html.py ile aynı).

    karne-html.py içe aktarılamaz (modül düzeyinde HTML üretir, adı tireli);
    aynı sayfada iki sayı biçimi görünmesin diye tanım burada tekrarlanır.
    """
    if n is None:
        return "—"
    t = f"{n:,.{ondalik}f}"
    return t.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def yuzde(a, b):
    return round(100 * a / b) if b else 0


def tr_tarih(iso):
    """'2026-08-29' → '29.08'."""
    return f"{iso[8:10]}.{iso[5:7]}" if iso and len(iso) >= 10 else ""


def gg_aa(d):
    return d.strftime("%d.%m")


UYARILAR = []


# ---------------------------------------------------------------------------
# 1. Site sorgularında ilk 3 payı
# ---------------------------------------------------------------------------
# Karnenin başlık kartı bu rakamı üretici JSON'undan değil, 11 mahalle turunun
# kuyruk dosyalarından hesaplıyor (karne-html.py: OLCULEN / TOPLAM_N / TOPLAM_I3).
# dogru-sayfa.json ise kuyruk-site-emlakci.json'u taban alır ve toplamı 505 verir.
# Tepe rakam karne başlığıyla AYNI olmalı — aynı sayfada "504" ve "505" birlikte
# görünürse okuyucu hangisine inanacağını bilemez. O yüzden hesap burada karnenin
# yöntemiyle tekrarlanır; liste karne-html.py TURLAR ile birebir tutulur.
TURLAR = [
    "tur-tunahan-2708.json", "tur-altay-2708.json", "tur-devlet-2708.json",
    "tur-eryaman-2708.json", "tur-goksu-2808.json", "tur-guzelkent-2808.json",
    "tur-sehit-osman-avci-2908.json", "tur-seker-2908.json", "tur-yesilova-2908.json",
    "tur-yavuz-selim-2908.json", "tur-seyh-samil-2908.json",
]


def ilk3_payi():
    son = {}
    for L in open(yol("sonuclar-site-emlakci.jsonl"), encoding="utf-8"):
        if L.strip():
            r = json.loads(L)
            son[r["s"]] = r  # s bazında SON ölçüm geçerli (karne ile aynı)
    n = i3 = 0
    for f in TURLAR:
        gs = [k["s"] for k in json.load(open(yol(f), encoding="utf-8"))]
        g = [son[s] for s in gs if s in son]
        # etap kayıtları ve mahalle sorguları site sorgusu değil (karne ile aynı süzgeç)
        site = [r for r in g if "/" in r["s"] and "/etaplar/" not in r["s"]]
        n += len(site)
        i3 += sum(1 for r in site if 1 <= r["sira"] <= 3)
    return n, i3


# ---------------------------------------------------------------------------
# 6. Damla kuyruğu
# ---------------------------------------------------------------------------
def damla_sayimi():
    metin = open(yol("DIZIN-DAMLASI-31-08.md"), encoding="utf-8").read()
    # karne-html.py de aynı deseni okuyor: "- [ ] https://…" açık, "- [x] …" bitmiş
    acik = len(re.findall(r"^- \[ \] https://\S+", metin, re.M))
    bitmis = len(re.findall(r"^- \[x\] https://\S+", metin, re.M))
    return acik, bitmis


# ---------------------------------------------------------------------------
# Geçmiş (7 günlük fark) — karne-gecmis-ozet.json'dan yalnız OKUNUR
# ---------------------------------------------------------------------------
# 02.09: bu betik dosyayı kendisi yazıyordu ({"kayitlar": [...]} şeması); aynı
# dosyayı anlik-goruntu-uret.py de {"metrikler": {...}} şemasıyla yazıyor ve son
# koşan ötekinin çıktısını siliyordu. Tek sahip artık anlık üretici; burada
# yalnız eşleme var: tepe rakam → serideki metrik(ler). Serinin "onceki"si tam
# D-7, yoksa en çok 3 gün geriye en yakın nokta (7-10 gün) — "yedi günlük fark"
# adına uygun. Temas serisi telefon + WhatsApp'tan kurulur; form
# (contact_form_submit) seride yok, fark ona kapalıdır ve JSON'da yazılır.
GECMIS_DOSYA = "karne-gecmis-ozet.json"
FARK_KAYNAK = {
    "ilk3_pay": ["ilk3_pay"],
    "dogru_sayfa_pay": ["dogru_sayfa_pay"],
    "gsc_eryaman_tik": ["eryaman_tik_28"],
    "ga4_temas": ["phone_click_28", "whatsapp_click_28"],
    "hedef_kutuda": ["hedef_kutuda"],
    "damla_kalan": ["damla_acik"],
}
FARK_NOTU = {
    "ga4_temas": "form hariç (seride telefon + WhatsApp var, contact_form_submit yok); "
                 "PR #88 (02.09) telefon bağı izlemesini genişletti, taban değişti — ihtiyatla oku",
}


def gecmis_oku():
    try:
        g = json.load(open(yol(GECMIS_DOSYA), encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None
    return g if isinstance(g.get("metrikler"), dict) else None


def fark_kur(gecmis, k, birim):
    """Tepe rakam k için 7 günlük fark; seri eksikse None."""
    parcalar = [(m, (gecmis or {}).get("metrikler", {}).get(m)) for m in FARK_KAYNAK.get(k, [])]
    if not parcalar or any(p is None or p.get("onceki") is None or p.get("son") is None for _, p in parcalar):
        return None
    tarihler = {p["onceki_tarih"] for _, p in parcalar}
    if len(tarihler) != 1:
        return None  # parçalar farklı güne kıyaslanıyorsa toplanmaz
    onceki_tarih = tarihler.pop()
    son = sum(p["son"] for _, p in parcalar)
    onceki = sum(p["onceki"] for _, p in parcalar)
    fark = round(son - onceki, 2)
    artis = {p["artis"] for _, p in parcalar}
    if len(artis) != 1:
        return None
    artis = artis.pop()
    yon = "nötr" if fark == 0 else ("iyi" if (fark > 0) == (artis == "iyi") else "kötü")
    # SERP serisinde 27.08 öncesi nokta başka ölçüm rejiminden (bölge turu payı
    # %0 → %99): fark gerçek hareket değil; işaretlenir, iyi/kötü diye okunmaz.
    # Üretici artık hükmü kendisi yazıyor (olcum_yontemi_degisti: SERP'te bölge turu payı,
    # hedefte kanal etiketi payı); eski özet JSON'da alan yoksa SERP kuralı burada yinelenir.
    rejim = any(p.get("olcum_yontemi_degisti") for _, p in parcalar) or any(
        p.get("olcum_yontemi_degisti") is None
        and p.get("onceki_bolge_turu_pay") is not None and p.get("son_bolge_turu_pay") is not None
        and abs(p["son_bolge_turu_pay"] - p["onceki_bolge_turu_pay"]) >= 50 for _, p in parcalar)
    notlar = [FARK_NOTU[k]] if k in FARK_NOTU else []
    if rejim:
        notlar.append("ölçüm yöntemi değişti: önceki nokta 27.08 öncesi turdan, sonuç aynı rejimde değil")
    return {
        "deger": fark, "onceki": round(onceki, 2), "son": round(son, 2),
        "kiyas_tarihi": onceki_tarih,
        "gun": (BUGUN - datetime.date.fromisoformat(onceki_tarih)).days,
        # yüzdelerde fark "puan", sayılarda adet — okuyucu "%3 arttı" ile "3 puan" ayrımını görsün
        "birim": "puan" if birim == "%" else birim,
        "yon": "nötr" if rejim else yon,
        "olcum_yontemi_degisti": rejim,
        "seri": [m for m, _ in parcalar],
        "not": "; ".join(notlar) or None,
    }


# ---------------------------------------------------------------------------
# Rakamlar
# ---------------------------------------------------------------------------
RAKAMLAR = []


def ekle(k, baslik, deger, gosterim, ne_demek, kaynak, ayrinti=None, birim=None):
    RAKAMLAR.append({
        "k": k, "baslik": baslik, "deger": deger, "birim": birim,
        "gosterim": gosterim if deger is not None else "ölçülmedi",
        "ne_demek": ne_demek, "kaynak": kaynak, "ayrinti": ayrinti or {},
        "fark_7g": None,  # aşağıda doldurulur
    })


# 1 ------------------------------------------------------------------------
try:
    _n, _i3 = ilk3_payi()
    _pay = yuzde(_i3, _n)
    ekle("ilk3_pay", "Site sorgularında ilk 3", _pay, f"%{_pay}",
         f"Ölçülen {tr_sayi(_n)} site sorgusu içinde ilk 3 sıradan birini tuttuğumuz "
         f"sorgu sayısı {tr_sayi(_i3)}. (Sıra var demek doğru sayfa çıkıyor demek değil; "
         f"o ayrım 2. rakamda.)",
         "sonuclar-site-emlakci.jsonl + tur-*.json (karne başlık kartıyla aynı hesap)",
         {"sorgu": _n, "ilk3": _i3}, birim="%")
except Exception as e:  # dosya yoksa uydurma, boş bırak
    ekle("ilk3_pay", "Site sorgularında ilk 3", None, None,
         "Ölçüm dosyası okunamadı.", "sonuclar-site-emlakci.jsonl + tur-*.json", birim="%")
    UYARILAR.append(f"ilk3_pay hesaplanamadı: {e}")

# 2 ------------------------------------------------------------------------
try:
    _DS = json.load(open(yol("dogru-sayfa.json"), encoding="utf-8"))
    _d3, _t3 = _DS["ilk3_dogru"], _DS["ilk3_toplam"]
    _pay = yuzde(_d3, _t3)
    ekle("dogru_sayfa_pay", "İlk 3 içinde doğru sayfa", _pay, f"%{_pay}",
         f"İlk 3 sırada olduğumuz {tr_sayi(_t3)} sorgunun {tr_sayi(_d3)} tanesinde arayanın "
         f"karşısına doğru site sayfası çıkıyor; kalanında sırayı ada, mahalle, eski adres ya da "
         f"başka bir site sayfamız tutuyor.",
         "dogru-sayfa.json", {"ilk3_dogru": _d3, "ilk3_toplam": _t3, "guncelleme": _DS.get("guncelleme")},
         birim="%")
    # 1. rakamın paydası ile bu dosyanın toplamı farklıysa açıkça söyle (505 / 504 vakası)
    if RAKAMLAR[0]["deger"] is not None and _DS.get("toplam") != RAKAMLAR[0]["ayrinti"]["sorgu"]:
        UYARILAR.append(
            f"Toplam sorgu sayısı iki dosyada farklı: karne başlığı/tepe rakam {tr_sayi(RAKAMLAR[0]['ayrinti']['sorgu'])} "
            f"(11 mahalle turu), dogru-sayfa.json {tr_sayi(_DS.get('toplam'))} (kuyruk-site-emlakci tabanı). "
            f"Tepe rakam karneyle aynı hesabı kullanır.")
except Exception as e:
    ekle("dogru_sayfa_pay", "İlk 3 içinde doğru sayfa", None, None,
         "dogru-sayfa.json okunamadı.", "dogru-sayfa.json", birim="%")
    UYARILAR.append(f"dogru_sayfa_pay hesaplanamadı: {e}")

# 3 ------------------------------------------------------------------------
try:
    _SO = json.load(open(yol("sonuc-ozeti.json"), encoding="utf-8"))
    _e = _SO["ayrim"]["eryaman"]["simdi"]
    _dn = _SO.get("donem", {})
    ekle("gsc_eryaman_tik", "Google′dan gelen tık (Eryaman)", _e["tik"], tr_sayi(_e["tik"]),
         f"Son {_dn.get('gun', 28)} günde ({tr_tarih(_dn.get('bas'))}–{tr_tarih(_dn.get('bit'))}) "
         f"Google aramasından sitede KALAN Eryaman sayfalarına gelen tık; {tr_sayi(_e['gos'])} gösterim. "
         f"Siteden kaldırılan Yenimahalle sayfaları bu rakama dahil değil.",
         "sonuc-ozeti.json (ayrim.eryaman.simdi)",
         {"gos": _e["gos"], "donem": _dn, "uretim": _SO.get("uretim"),
          "toplam_tik": _SO.get("simdi", {}).get("tik")}, birim="tık")
    if _SO.get("uretim") and _SO["uretim"] != BUGUN.isoformat():
        UYARILAR.append(f"sonuc-ozeti.json en son {tr_tarih(_SO['uretim'])} tarihinde üretildi "
                        f"(dönem {tr_tarih(_dn.get('bas'))}–{tr_tarih(_dn.get('bit'))}); GSC 2-3 gün geriden gelir.")
except Exception as e:
    ekle("gsc_eryaman_tik", "Google′dan gelen tık (Eryaman)", None, None,
         "sonuc-ozeti.json okunamadı.", "sonuc-ozeti.json", birim="tık")
    UYARILAR.append(f"gsc_eryaman_tik hesaplanamadı: {e}")

# 4 ------------------------------------------------------------------------
try:
    _TS = json.load(open(yol("tik-sonrasi.json"), encoding="utf-8"))
    _t = _TS["temas"]
    # form = contact_form_submit (karne 'Tıktan sonra' bölümüyle aynı tanım).
    # form_start temas değil: formu açıp bırakan da sayılır, gönderim ayrı olay.
    _tel, _wa, _form = _t.get("phone_click", 0), _t.get("whatsapp_click", 0), _t.get("contact_form_submit", 0)
    _top = _tel + _wa + _form
    ekle("ga4_temas", "Siteden gelen temas", _top, tr_sayi(_top),
         f"Son {_TS.get('gun', 28)} günde ziyaretçinin bizimle kurduğu temas: {tr_sayi(_tel)} telefon, "
         f"{tr_sayi(_wa)} WhatsApp, {tr_sayi(_form)} form (GA4; {tr_sayi(_TS['ozet']['oturum'])} oturum içinden).",
         "tik-sonrasi.json (temas)",
         {"telefon": _tel, "whatsapp": _wa, "form": _form, "oturum": _TS["ozet"]["oturum"],
          "guncelleme": _TS.get("guncelleme")}, birim="temas")
except Exception as e:
    ekle("ga4_temas", "Siteden gelen temas", None, None,
         "tik-sonrasi.json okunamadı (GA4 çekimi yapılmamış olabilir).", "tik-sonrasi.json", birim="temas")
    UYARILAR.append(f"ga4_temas hesaplanamadı: {e}")

# 5 ------------------------------------------------------------------------
try:
    _HS = json.load(open(yol("hedef-sorgular.json"), encoding="utf-8"))
    _oz = _HS["ozet"]
    _hedef = _oz["hedef_sayisi"]
    _kutuda = _oz["kutuda"]
    # ozet ile satırlar çelişirse söyle (üretici değişmiş olabilir)
    _hesap = sum(1 for s in _HS["satirlar"] if (s.get("kutuda") or 0) >= 1)
    if _hesap != _kutuda:
        UYARILAR.append(f"hedef-sorgular.json: ozet.kutuda {_kutuda} ile satırlardan sayılan {_hesap} uyuşmuyor; ozet esas alındı.")
    ekle("hedef_kutuda", "Hedef sorgularda harita kutusu", _kutuda, f"{_kutuda}/{_hedef}",
         f"{tr_sayi(_hedef)} hedef sorgunun {tr_sayi(_kutuda)} tanesinde harita kutusunda görünüyoruz, "
         f"{tr_sayi(_oz.get('kutuda_birinci', 0))} tanesinde kutuda 1. sıradayız; "
         f"{tr_sayi(_oz.get('kutu_var_biz_yok', 0))} sorguda kutu çıkıyor ama biz yokuz. "
         f"(Organik ilk 3: {tr_sayi(_oz.get('ilk3', 0))} sorgu.)",
         "hedef-sorgular.json (ozet.kutuda)",
         {"hedef": _hedef, "kutuda_birinci": _oz.get("kutuda_birinci"),
          "kutu_var_biz_yok": _oz.get("kutu_var_biz_yok"), "organik_ilk3": _oz.get("ilk3"),
          "organik_birinci": _oz.get("birinci"), "guncelleme": _HS.get("guncelleme")}, birim="sorgu")
except Exception as e:
    ekle("hedef_kutuda", "Hedef sorgularda harita kutusu", None, None,
         "hedef-sorgular.json okunamadı.", "hedef-sorgular.json", birim="sorgu")
    UYARILAR.append(f"hedef_kutuda hesaplanamadı: {e}")

# 6 ------------------------------------------------------------------------
try:
    _acik, _bitmis = damla_sayimi()
    ekle("damla_kalan", "Damla kuyruğunda kalan", _acik, tr_sayi(_acik),
         f"Dizine ekleme isteği bekleyen sayfa sayısı {tr_sayi(_acik)}; {tr_sayi(_bitmis)} sayfa işaretlendi "
         f"(istek gönderildi ya da kendiliğinden dizine girdi). İstek yalnız GSC arayüzünden, günlük kotayla gidiyor.",
         "DIZIN-DAMLASI-31-08.md (\"- [ ] url\" satırları)",
         {"bitmis": _bitmis, "toplam": _acik + _bitmis}, birim="sayfa")
except Exception as e:
    ekle("damla_kalan", "Damla kuyruğunda kalan", None, None,
         "DIZIN-DAMLASI-31-08.md okunamadı.", "DIZIN-DAMLASI-31-08.md", birim="sayfa")
    UYARILAR.append(f"damla_kalan hesaplanamadı: {e}")

# --- 7 günlük fark ---------------------------------------------------------
GECMIS = gecmis_oku()
for r in RAKAMLAR:
    if GECMIS and r["deger"] is not None:
        r["fark_7g"] = fark_kur(GECMIS, r["k"], r["birim"])
_kiyas_tarihleri = sorted({r["fark_7g"]["kiyas_tarihi"] for r in RAKAMLAR if r["fark_7g"]})
# Karne "Fark N günlük seriden" yazar: GÜN sayısı, satır sayısı değil (aynı günde anlık +
# geri doldurma iki satır; 02.09'da 13 gün için "14 günlük" basılmıştı).
KAYIT_SAYISI = ((GECMIS or {}).get("gun_sayisi") or 0) if GECMIS else 0
if GECMIS and not KAYIT_SAYISI:
    try:  # eski özet JSON (gun_sayisi yok): jsonl'den ayrı gün say
        KAYIT_SAYISI = len({json.loads(L)["tarih"] for L in open(yol("karne-gecmis.jsonl"), encoding="utf-8") if L.strip()})
    except Exception:
        KAYIT_SAYISI = sum(GECMIS.get("satir_sayisi", {}).values())
if not GECMIS:
    UYARILAR.append(f"7 günlük fark yok: {GECMIS_DOSYA} bulunamadı ya da 'metrikler' şeması değil — "
                    f"önce anlik-goruntu-uret.py koşmalı.")
else:
    _eksik = [r["baslik"] for r in RAKAMLAR if r["deger"] is not None and not r["fark_7g"]]
    if _eksik:
        UYARILAR.append("7 gün önceki değer seride yok, fark basılmadı: " + ", ".join(_eksik) +
                        f" — seri {GECMIS.get('seri_bas')} tarihinden beri birikiyor.")
    _rejim = [r["baslik"] for r in RAKAMLAR if r["fark_7g"] and r["fark_7g"].get("olcum_yontemi_degisti")]
    if _rejim:
        UYARILAR.append("Ölçüm yöntemi değişti, fark iyi/kötü diye okunmaz: " + ", ".join(_rejim) +
                        " (önceki nokta 27.08 öncesi turdan).")

# ---------------------------------------------------------------------------
# Bu hafta ne yapıldı — PROTOKOL-gece.md başlıkları
# ---------------------------------------------------------------------------
# Başlık biçimleri defterde karışık: "## 2026-08-27 — …", "## 31.08 — …",
# "## 31.08 BAŞLIK…", "## 02.09 08:28 — …". Hepsini tek desen yakalar; tarihi
# olmayan başlık (## Adımlar, ### A) …) bu haftaya ait sayılmaz.
BASLIK_RE = re.compile(
    r"^#{2,3}\s+(?:(\d{4})-(\d{2})-(\d{2})|(\d{1,2})\.(\d{2}))"  # ISO ya da gg.aa
    r"(?:\s+\d{1,2}:\d{2})?"                                     # isteğe bağlı saat
    r"\s*(?:[—–-]\s*)?(.*\S)\s*$")


def protokol_basliklari():
    gunler = collections.OrderedDict()
    for L in open(yol("PROTOKOL-gece.md"), encoding="utf-8"):
        m = BASLIK_RE.match(L)
        if not m:
            continue
        try:
            if m.group(1):
                t = datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            else:
                # gg.aa biçiminde yıl yok: bu yıl varsayılır; gelecekteki bir tarih
                # çıkarsa (yılbaşı geçişi) geçen yıla düşer
                t = datetime.date(BUGUN.year, int(m.group(5)), int(m.group(4)))
                if t > BUGUN + datetime.timedelta(days=1):
                    t = t.replace(year=BUGUN.year - 1)
        except ValueError:
            continue
        gunler.setdefault(t, []).append(m.group(6).strip())
    return gunler


YAPILAN = []
try:
    _g = protokol_basliklari()
    _hafta = {t: b for t, b in _g.items() if BUGUN - datetime.timedelta(days=7) <= t <= BUGUN}
    # gün başına bir madde, en yeni 3 gün: "3 madde" derken haftanın üç gününü
    # göstermek, bugünün üç başlığını göstermekten daha iyi anlatır
    for t in sorted(_hafta, reverse=True)[:3]:
        b = _hafta[t]
        metin = f"{gg_aa(t)} — " + " · ".join(b[:3])
        if len(b) > 3:
            metin += f" (+{len(b) - 3} başlık daha)"
        YAPILAN.append({"tarih": gg_aa(t), "iso": t.isoformat(), "baslik_sayisi": len(b),
                        "basliklar": b, "metin": metin})
    if not YAPILAN:
        UYARILAR.append("PROTOKOL-gece.md içinde son 7 güne ait tarihli başlık yok.")
except Exception as e:
    UYARILAR.append(f"PROTOKOL-gece.md okunamadı: {e}")

# ---------------------------------------------------------------------------
# Bu hafta ne bekleniyor
# ---------------------------------------------------------------------------
BEKLENEN = []

# (a) beklenen düşüşler — karnenin 'panik yok' paneliyle aynı kaynaklar
try:
    _SO = json.load(open(yol("sonuc-ozeti.json"), encoding="utf-8"))
    _ym = _SO["ayrim"]["yenimahalle"]["simdi"]["tik"]
    _top = _SO["simdi"]["tik"]
    _er = _SO["ayrim"]["eryaman"]["simdi"]["tik"]
    _yazi = None
    try:
        _yazi = next(r for r in json.load(open(yol("sayfa-turu-verimi.json"), encoding="utf-8"))["satirlar"]
                     if r["tur"] == "blog")
    except Exception:
        pass
    metin = (f"Search Console′un toplam tık çizgisi İNECEK, panik yok: son {_SO['donem']['gun']} gündeki "
             f"{tr_sayi(_top)} tıkın %{yuzde(_ym, _top)} kadarı ({tr_sayi(_ym)}) artık sitede olmayan "
             f"Yenimahalle sayfalarından geldi")
    if _yazi:
        metin += f"; kapatılan genel yazılar da {tr_sayi(_yazi['gos'])} gösterim / {tr_sayi(_yazi['tik'])} tık taşıyordu"
    metin += f". İkisi eriyecek; ölçüt Eryaman satırı ({tr_sayi(_er)} tık)."
    BEKLENEN.append({"tarih": None, "iso": None, "metin": metin,
                     "kaynak": "sonuc-ozeti.json (ayrim) + sayfa-turu-verimi.json (blog)",
                     "ayrinti": {"yenimahalle_tik": _ym, "toplam_tik": _top, "pay": yuzde(_ym, _top),
                                 "yazi_gos": _yazi["gos"] if _yazi else None,
                                 "yazi_tik": _yazi["tik"] if _yazi else None}})
except Exception as e:
    UYARILAR.append(f"beklenen düşüş maddesi kurulamadı: {e}")

# (b) 07.09 — başlık/H1 dondurması biter
try:
    _EE = json.load(open(yol("eryaman-emlakci.json"), encoding="utf-8"))
    _td = _EE.get("title_donuk")
    _don = _EE.get("donemler") or []
    _to_ilk = _don[0] if _don else None
    _to_son = _don[-1] if _don else None
    # tarih elle yazılmaz: title_donuk alanı verir; "08.08 kararı" gibi gerekçe
    # rakamları da bu metne girmez, onlar kaldıraç defterinde duruyor
    metin = (f"{tr_tarih(_td)} — Başlık/H1 dondurması biter (başlık şablonu değişikliğinden sonraki "
             f"bekleme süresi). O gün ilk iş ana sayfanın başlığı ve snippet′i: \"eryaman emlakçı\" sorgusunda organik "
             f"sıra yerinde, tıklanma oranı düştü")
    if _to_ilk and _to_son and _to_ilk is not _to_son:
        metin += (f" (%{tr_sayi(_to_ilk['to'], 1)} → %{tr_sayi(_to_son['to'], 1)}; "
                  f"{tr_tarih(_to_ilk['bas'])}–{tr_tarih(_to_ilk['bit'])} ile "
                  f"{tr_tarih(_to_son['bas'])}–{tr_tarih(_to_son['bit'])} dönemleri)")
    metin += ". O tarihe kadar başlığa dokunulmaz."
    BEKLENEN.append({"tarih": tr_tarih(_td), "iso": _td, "metin": metin,
                     "kaynak": "eryaman-emlakci.json (title_donuk, donemler)",
                     "ayrinti": {"to_ilk": _to_ilk["to"] if _to_ilk else None,
                                 "to_son": _to_son["to"] if _to_son else None}})
except Exception as e:
    UYARILAR.append(f"07.09 maddesi kurulamadı: {e}")

# (c) 14.09 — sitemap tazelik düzeltmesinin izleme süresi dolar
# Tarih elle yazılmaz: kaldıraç kaydının 'kaynak' alanındaki gün (31.08) +
# 'kisit' alanındaki "1-2 hafta"nın üst sınırı (2 hafta) toplanır.
try:
    _KD = json.load(open(yol("kaldirac-defteri.json"), encoding="utf-8"))
    _sm = next(k for k in _KD["kaldiraclar"] if k["ad"].lower().startswith("sitemap"))
    _mg = re.search(r"(\d{1,2})\.(\d{2})", _sm.get("kaynak", ""))
    _mh = re.search(r"(\d+)\s*-\s*(\d+)\s*hafta", _sm.get("kisit", ""))
    if not (_mg and _mh):
        raise ValueError("kaldıraç kaydında tarih ya da hafta aralığı okunamadı")
    _bas = datetime.date(BUGUN.year, int(_mg.group(2)), int(_mg.group(1)))
    if _bas > BUGUN:
        _bas = _bas.replace(year=BUGUN.year - 1)
    _hafta_ust = int(_mh.group(2))
    _bit = _bas + datetime.timedelta(weeks=_hafta_ust)
    # PR numarası ve tarih kaydın 'kaynak' alanından olduğu gibi alınır (elle "PR #87" yazılmaz);
    # 'durum' ham anahtar (acik/kanitli/curuk) okuyucuya Türkçe etiketle gösterilir
    _DURUM_AD = {"acik": "açık, sonuç bekleniyor", "kanitli": "kanıtlı", "curuk": "çürük"}
    metin = (f"{gg_aa(_bit)} — Sitemap tazelik düzeltmesinin ({_sm.get('kaynak')}) izleme süresi dolar: "
             f"tarama dağılımı {_mh.group(1)}-{_mh.group(2)} hafta izleniyor. Sonuç henüz ölçülmedi; "
             f"o güne kadar Google site sayfalarını ada sayfalarından taze görmeye başlamadıysa kaldıraç "
             f"yeniden değerlendirilir. Kaldıraç defterindeki durumu: {_DURUM_AD.get(_sm.get('durum'), _sm.get('durum'))}.")
    BEKLENEN.append({"tarih": gg_aa(_bit), "iso": _bit.isoformat(), "metin": metin,
                     "kaynak": "kaldirac-defteri.json (Sitemap tazelik sinyali: kaynak tarihi + kisit haftası)",
                     "ayrinti": {"baslangic": _bas.isoformat(), "hafta": _hafta_ust, "durum": _sm.get("durum")}})
except Exception as e:
    UYARILAR.append(f"14.09 maddesi kurulamadı: {e}")

# ---------------------------------------------------------------------------
# Çıktı
# ---------------------------------------------------------------------------
CIKTI = {
    "guncelleme": BUGUN.isoformat(),
    "rakamlar": RAKAMLAR,
    "bu_hafta_yapilan": YAPILAN,
    "bu_hafta_yapilan_kurali": "PROTOKOL-gece.md'nin son 7 gündeki tarihli bölüm başlıkları; gün başına bir madde, en yeni 3 gün.",
    "bu_hafta_beklenen": BEKLENEN,
    "gecmis": {"dosya": GECMIS_DOSYA, "sahip": "anlik-goruntu-uret.py", "kayit": KAYIT_SAYISI,
               "kiyas_tarihi": _kiyas_tarihleri[0] if len(_kiyas_tarihleri) == 1 else (_kiyas_tarihleri or None)},
    "uyarilar": UYARILAR,
}
json.dump(CIKTI, open(yol("yonetici-ozeti.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

for r in RAKAMLAR:
    f = r["fark_7g"]
    fs = (f" (7g: {'+' if f['deger'] > 0 else ''}{tr_sayi(f['deger'], 1)} {f['birim']}"
          f"{' · yöntem değişti' if f.get('olcum_yontemi_degisti') else ''})") if f else " (7g: —)"
    print(f"{r['baslik']:36} {r['gosterim']:>8}{fs}   ← {r['kaynak']}")
print(f"yapılan {len(YAPILAN)} madde · beklenen {len(BEKLENEN)} madde · geçmiş kayıt {KAYIT_SAYISI} · uyarı {len(UYARILAR)}")
for u in UYARILAR:
    print("  !", u)
