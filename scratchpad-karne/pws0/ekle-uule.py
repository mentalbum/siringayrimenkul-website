#!/usr/bin/env python3
"""Site sorgusu ölçümünü (uule=Eryaman merkez) sonuclar-site-emlakci.jsonl'e ekler — 07.10 çıkarıcı biçimi.
Kullanım: python3 ekle-uule.py '<slug>' '<q>' '<json>' [kanal=uule-eryaman] [not]
  json: serp-cikarici-0710.js çıktısı ({"sira","u","bas","bas_tam","u_kaynak","isgal","isgal_sira","isgal_diger",
        "biz":[[sira, p, bas25, cite90, tamBaslik],...],"biz_k":["cite"|"href",...],"n","hp","hl","ilk3","loc"}).
        biz satırı 5 elemanlıdır: [3] = cite metni, [4] = Google'ın gösterdiği h3'ün TAMAMI.
        (Elle verilen 4 elemanlı eski biçim [sira, p, bas25, tamBaslik] de okunur. serp-cikarici-kompakt.js
        satırı da okunur: 3 eleman [sira, yol, tamBaslik], bağ şifreliyse yol = "cite:<kırıntı>"; o kırıntı
        cite sayılır, 25 karakterden uzun [2] tam başlıktır.)
  slug: 'mah/slug' (site sorgusu). Mahalle/etap sorguları hedef-ekle.py'nin işidir; '/' içermeyen slug
        verilirse betik çökmez, uyarıp kaydı yazar (sayfa yine başlıktan/cite'tan çözülür).

SAYFA NASIL ÇÖZÜLÜR (08.10, karne incelemesi ye-2 adım 0). 07.10'dan beri Google bağları şifreli; yol
cite kırıntısından güvenilir çıkmıyor. Eski kısayol ("başlık site adıyla başlıyorsa beklenen sayfa say")
KALDIRILDI: eski adres kopyalarını, adaş kayıtları ve adı başka kaydın öneki olanları (Uzunali / Uzunali 2,
Platin / Platin 2…) "doğru" yazıyordu. Yeni sıra, her sonucumuz için:
  0) Bağ gerçek adresse (biz_k = "href") yol olduğu gibi yazılır. Cite yolu eksiksiz gösteriyorsa
     (mahalleler › <x>-mahallesi › <bilinen slug>) o yol yazılır.
  i) Cite'ta "-mahallesi" eki OLMAYAN mahalle bölümü varsa (mahalleler › devlet, guzelkent › melte...) sonuç
     26.07 öncesi ESKİ ADRESTİR: u = /mahalleler/<o bölüm>/<slug>. Slug sırasıyla: başlıktaki site, cite'taki
     tam kırıntı, kesik kırıntının tek karşılığı, (aynı mahalleyse) sorgunun sitesi; hiçbiri yoksa
     "(sayfa-okunamadi)". Hepsi 'eski' sınıfına düşer.
 ii) Tam başlığın ilk parçası (" Emlakçı", " - ", " | " öncesi) content/siteler'deki bir `isim` ile TAM ve
     TEK eşleşiyorsa u = o kayıt. Başlıkta ya da cite'ta görünen mahalle kaydın mahallesiyle çelişiyorsa
     (taşınmış kayıt, kaldırılan mahallenin eski kopyası) eşleşme kabul edilmez.
iii) Aynı adı taşıyan birden çok kayıt varsa mahalle başlıktan ya da cite'tan okunur; okunamıyorsa
     u = "cite:<cite>" yazılır (dogru-sayfa.py bunu "adresi doğrulanamayan" sayar).
 iv) Önek eşleşmesi hiçbir durumda "doğru" üretmez.
Site sayfası olmayan sonuçlarımız da başlıktan tanınır (mahalle, ada, etap, ana sayfa); tanınmayan her şey
"cite:<cite>" yazılır.

BİLİNEN KÖR NOKTA. Bağ şifreliyken cite çoğu sonuçta mahalle bölümünü HİÇ göstermez ("› ... › altintepe-sitesi";
07.10'un 11 sonucunun 7'si böyle). O durumda başlık yeni adresle de eski adres kopyasıyla da aynıdır; kayıt
(ii) ile yazılır ama eski/yeni ayrımı yapılmamıştır. Bunu `cite_mah` alanı söyler: "yeni" (…-mahallesi
görüldü), "eski" (eksiz bölüm görüldü), null (mahalle bölümü görünmedi, AYRIM YAPILAMADI). Eski ölçümlerde
(gerçek bağla, 11.08–05.09) adı tutan site sonuçlarının yaklaşık onda biri eski adresti. Kesin ayrım
isteyen tur gerçek bağ veren kanalda (u_kaynak = "href") ölçülmelidir.

Kayda ayrıca `u_kaynak` (href | cite | baslik), `bas_tam`, `bizu` (bütün sonuçlarımızın adresi; eski adres
dedektörü alt sıralara da baksın diye) ve `isgal_diger` geçer.
"""
import json, sys, datetime, os, re, unicodedata, glob

K = os.path.dirname(os.path.abspath(__file__))
ICERIK = os.path.normpath(os.path.join(K, "..", "..", "content", "siteler"))

# eski şema bölümü (= yeni slug'ın "-mahallesi"siz hâli) → başlıkta geçen kısa ad
MAHALLE = {"altay": "Altay", "devlet": "Devlet", "eryaman": "Eryaman", "goksu": "Göksu",
           "guzelkent": "Güzelkent", "sehit-osman-avci": "Şehit Osman Avcı", "seker": "Şeker",
           "seyh-samil": "Şeyh Şamil", "tunahan": "Tunahan", "yavuz-selim": "Yavuz Selim", "yesilova": "Yeşilova"}
# 27.08'de siteden kaldırılan mahalleler (sayfaları 410); Google'daki eski kopyaları hâlâ çıkabilir
KALDIRILAN = {"ata": "Ata", "susuz": "Susuz", "cumhuriyet": "Cumhuriyet"}
ETAP = {1: "altay-mahallesi", 2: "sehit-osman-avci-mahallesi", 3: "seyh-samil-mahallesi",
        4: "tunahan-mahallesi", 5: "tunahan-mahallesi"}
# /mahalleler dışındaki üst yollar: cite'ta tam bölüm olarak görülürse sonuç site/mahalle sayfası değildir
UST = {"blog", "araclar", "sozluk", "siteler", "hakkimizda", "iletisim", "ev-degerleme", "gizlilik",
       "eryaman-site-dokusu", "eryamanda-ev-kiraya-vermek", "eryamanda-ev-satmak"}
AYRAC = re.compile(r" emlakç| - | \| | — | – | \(| satılık |…|\.\.\.")
ADA = re.compile(r"(\d{3,6})(?:/(\d+))? ada\b")
SLUG = re.compile(r"[a-z0-9-]+")
HARF = "a-zçğıöşü0-9"
BILINMEYEN = "(sayfa-okunamadi)"   # eski adres olduğu belli, hangi sayfa olduğu okunamadı


def norm(t):
    """Karşılaştırma biçimi: NFKC, Türkçe küçük harf (İ→i, I→ı), tek boşluk."""
    t = unicodedata.normalize("NFKC", t or "").replace("İ", "i").replace("I", "ı")
    return re.sub(r"\s+", " ", t).strip().lower()


def kesik_mi(x):
    return x.endswith("...") or x.endswith("…")


def dizin(kok=ICERIK):
    """content/siteler → ({norm(isim): [mah/slug,…]}, {slug: [mah,…]})"""
    isimler, sluglar = {}, {}
    for f in sorted(glob.glob(os.path.join(kok, "*", "*.json"))):
        try:
            isim = json.load(open(f, encoding="utf-8")).get("isim")
        except Exception:
            continue
        if not isim:
            continue
        mah = os.path.basename(os.path.dirname(f))
        slug = os.path.basename(f)[:-5]
        isimler.setdefault(norm(isim), []).append(f"{mah}/{slug}")
        sluglar.setdefault(slug, []).append(mah)
    return isimler, sluglar


def parcalar(p, cite):
    """Alan adından sonraki kırıntı bölümleri. Önce p (çıkarıcı cite'ın TAMAMINDAN kurar), yoksa cite metni
    (90 karakterde kesik gelebilir: o zaman son bölüm kesik sayılır). Kompakt çıkarıcı şifreli bağda yolu
    "cite:<kırıntı>" verir (cite ayrı gelmez): o kırıntı cite olarak okunur, yok sayılmaz (yoksa
    "› mahalleler › devlet" gibi eski adres kırıntısı gözden kaçar ve kopya "doğru" yazılırdı)."""
    if p and p.startswith("cite:") and not cite:
        cite, p = p[5:], ""
    if p and not p.startswith("cite:"):
        segs = [x for x in p.split("/") if x]
    elif cite:
        segs = [x.strip() for x in cite.split("›")][1:]
        segs = [x for x in segs if x]
        if len(cite) >= 90 and segs and not kesik_mi(segs[-1]):
            segs[-1] += "..."
    else:
        segs = []
    return [x for x in segs if x not in ("...", "…")]


def cite_mahalle(segs):
    """Cite mahalle bölümünü gösteriyor mu? → (tür, bölüm, indeks); tür: "yeni" (…-mahallesi) | "eski"
    (eksiz, 26.07 öncesi şema) | None (görünmüyor). Yalnız TAM bölüm eşleşmesi: "guzelkent-..." gibi kesik
    kırıntı ya da "konum-eryaman" gibi slug sonu mahalle bölümü sayılmaz."""
    for k, x in enumerate(segs):
        if x.endswith("-mahallesi") and (x[:-10] in MAHALLE or x[:-10] in KALDIRILAN):
            return "yeni", x, k
        if (x in MAHALLE or x in KALDIRILAN) and (k == 0 or segs[k - 1] == "mahalleler"):
            return "eski", x, k
    return None, None, None


def baslik_adaylari(tam, kesik):
    """Başlığın ayraçta biten baş parçaları: [(parça, bitiş konumu)]. "<ad> Eryaman | Tapu…" (Başlık deneyi 2)
    ve "Eryaman <ad> Satılık…" (eski kalıp) için "Eryaman"sız hâli de aday. kesik=True: başlık 25 karakterde
    kesilmiş eski kayıt; yalnız ayraçta biten parça aday olur (metnin sonu adın ortası olabilir)."""
    n = norm(tam)
    kesimler = [m.start() for m in AYRAC.finditer(n)]
    if not kesik:
        kesimler.append(len(n))
    out = []
    for k in kesimler:
        c = n[:k].strip()
        if not c:
            continue
        out.append((c, k))
        if c.endswith(" eryaman"):
            out.append((c[:-8].strip(), k))
        if c.startswith("eryaman "):
            out.append((c[8:].strip(), k))
    return n, out


def site_basliktan(tam, isimler, kesik):
    """Başlığın baş parçası bir `isim`le TAM eşleşiyorsa → ([mah/slug,…], başlığın kalanı). Önek eşleşmesi yok;
    birden çok parça tutarsa en uzunu geçerlidir ("Çağdaş - 95 Sitesi" gibi adında ayraç olan kayıtlar)."""
    n, ad = baslik_adaylari(tam, kesik)
    tutan = [(c, k) for c, k in ad if c in isimler]
    if not tutan:
        return [], ""
    c, k = max(tutan, key=lambda t: len(t[0]))
    return list(isimler[c]), n[k:]


def _gecer(ad, metin):
    return re.search(rf"(?<![{HARF}]){re.escape(norm(ad))}(?![{HARF}])", metin) is not None


def mahalle_basliktan(metin):
    """Başlıkta (addan sonraki kısımda) mahalle: "| Göksu Eryaman |", "- Altay Mahallesi -", "(Tunahan Mahallesi)".
    Kaldırılan mahalleler yalnız "<ad> Mahallesi" biçiminde aranır ("Satalım" içinde "ata" geçiyor)."""
    kal = [m for m, ad in KALDIRILAN.items() if _gecer(ad + " Mahallesi", metin)]
    if kal:
        return kal[0] + "-mahallesi"
    bulunan = [m for m, ad in MAHALLE.items() if m != "eryaman" and _gecer(ad, metin)]
    if len(bulunan) == 1:
        return bulunan[0] + "-mahallesi"
    if not bulunan and _gecer("Eryaman Mahallesi", metin):
        return "eryaman-mahallesi"
    return None


def mahalle_basligi(tam, kesik):
    """Başlık bir MAHALLE sayfasının başlığıysa ("Devlet Mahallesi Emlakçı | …") → slug."""
    _, ad = baslik_adaylari(tam, kesik)
    for c, _k in ad:
        for m, kisa in list(MAHALLE.items()) + list(KALDIRILAN.items()):
            if c == norm(kisa + " Mahallesi"):
                return m + "-mahallesi"
    return None


def coz(s, tam, p, cite, D, kesik=False):
    """Bir sonucumuzun hangi sayfa olduğunu çözer → (u, u_kaynak, not). s = beklenen 'mah/slug'."""
    isimler, sluglar = D
    exp_mah, _, exp_slug = s.partition("/")   # '/' yoksa (mahalle anahtarı verilmiş) çökmez: exp_slug = ""
    if p and p.startswith("cite:"):           # kompakt çıkarıcı satırı: yol yerine "cite:<kırıntı>"
        cite, p = cite or p[5:], ""
    segs = parcalar(p, cite)
    tamam = [x for x in segs if not kesik_mi(x)]
    kirinti = (cite or p or "").strip()[:90]
    n = norm(tam)

    def belirsiz(neden):
        return "cite:" + kirinti, "cite", f"adres çözülemedi ({neden}); başlık: {(tam or '')[:60]}"

    eslesen, kalan = site_basliktan(tam, isimler, kesik)
    ada = ADA.search(n) if not eslesen else None
    # Adında "<no> Ada" geçen site kaydı (Kur Sitesi 46495 Ada / 46496 Ada): başlık 25 karakterde kesikse
    # ("Kur Sitesi 46495 Ada Emla") ayraçta biten parça çıkmaz ve sonuç ada sayfası sanılırdı. Başlığın
    # "… Ada"ya kadarki kısmı bir `isim`le TAM ve TEK eşleşiyorsa (ve o adla başlayan daha uzun bir kayıt
    # adı yoksa: önek kuralı) site kaydıdır. Gerçek ada başlığı ("Tunahan 46495 Ada — Tapu…") eşleşmez.
    if ada:
        ada_adi = n[:ada.end()]
        if len(isimler.get(ada_adi, [])) == 1 and not any(x.startswith(ada_adi + " ") for x in isimler):
            eslesen, kalan, ada = list(isimler[ada_adi]), n[ada.end():], None
    etap = re.match(r"eryaman (\d)\. etap\b", n) if not eslesen else None
    tur, mseg, mi = cite_mahalle(segs)

    # (i) eski şema: cite'ta "-mahallesi" eki olmayan mahalle bölümü
    if tur == "eski":
        mah, kalan_seg = mseg + "-mahallesi", segs[mi + 1:]

        def eski(slug, kaynak, nt):
            return f"/mahalleler/{mseg}/{slug}", kaynak, "eski adres (cite)" + (", " + nt if nt else "")

        if ada:
            return eski("adalar/" + ada.group(1) + (f"-{ada.group(2)}" if ada.group(2) else ""), "baslik", "ada sayfası başlıktan")
        if etap:
            return eski("etaplar/" + etap.group(1), "baslik", "etap sayfası başlıktan")
        ayni = [e for e in eslesen if e.startswith(mah + "/")]
        if len(ayni) == 1:
            return eski(ayni[0].split("/", 1)[1], "baslik", "site başlıktan")
        if kalan_seg and all(SLUG.fullmatch(x) for x in kalan_seg):
            return eski("/".join(kalan_seg), "cite", "")
        if not eslesen and mahalle_basligi(tam, kesik) == mah:
            return f"/mahalleler/{mseg}", "baslik", "eski adres (cite), mahalle sayfası başlıktan"
        if kalan_seg and kesik_mi(kalan_seg[0]):
            on = kalan_seg[0].rstrip(".…")
            ad = [x for x, ml in sluglar.items() if mah in ml and x.startswith(on)] if on else []
            if len(ad) == 1:
                return eski(ad[0], "cite", "slug kesik kırıntının tek karşılığı")
        if len(eslesen) == 1:
            return eski(eslesen[0].split("/", 1)[1], "baslik", "site başlıktan (kayıt bugün başka mahallede)")
        if not kalan_seg and not eslesen and mah == exp_mah:
            if not exp_slug:   # sorgu site sorgusu değil (slug'da '/' yok): mahalle kökü
                return f"/mahalleler/{mseg}", "cite", "eski adres (cite), sayfa başlıktan doğrulanamadı"
            return eski(exp_slug, "cite", "sayfa başlıktan doğrulanamadı, sorgunun sitesi varsayıldı")
        return eski(BILINMEYEN, "cite", "hangi sayfa olduğu okunamadı")

    # (0) cite yolu eksiksiz gösteriyor: mahalleler › <x>-mahallesi › <slug>
    if tur == "yeni" and len(segs) == mi + 2 and SLUG.fullmatch(segs[mi + 1]):
        if mseg in sluglar.get(segs[mi + 1], []) or mseg[:-10] in KALDIRILAN:
            return f"/mahalleler/{mseg}/{segs[mi + 1]}", "cite", "yol cite'ta tam"

    # site/mahalle dışı sayfamız (blog, araçlar, rehberler)
    if any(x in UST for x in tamam):
        if len(tamam) == len(segs):
            return "/" + "/".join(segs), "cite", "site sayfası değil (cite)"
        return belirsiz("site dışı sayfa, kırıntı kesik")

    # kaldırılan mahallenin (Ata/Susuz/Cumhuriyet) Google'da kalmış kopyası: bugünkü bir kayıtla eşleştirilmez
    bas_mah = mahalle_basliktan(kalan if eslesen else n)
    kal = next((x for x in (mseg if tur == "yeni" else None, bas_mah) if x and x[:-10] in KALDIRILAN), None)
    if kal:
        if not eslesen and mahalle_basligi(tam, kesik) == kal:
            return f"/mahalleler/{kal}", "baslik", "kaldırılan mahallenin sayfası (27.08'den beri 410)"
        return f"/mahalleler/{kal}/{BILINMEYEN}", "baslik", "kaldırılan mahallenin sayfası (27.08'den beri 410)"

    if eslesen:
        kanit = {x for x in (mseg if tur == "yeni" else None, bas_mah) if x}
        if len(kanit) > 1:
            return belirsiz("başlıktaki mahalle ile cite'taki mahalle çelişiyor")
        mah = next(iter(kanit), None)
        # (ii) tam ve tek eşleşme
        if len(eslesen) == 1:
            if mah and not eslesen[0].startswith(mah + "/"):
                return belirsiz(f"ad {eslesen[0]} kaydıyla eşleşiyor ama görünen mahalle {mah}")
            return "/mahalleler/" + eslesen[0], "baslik", ""
        # (iii) adaş kayıtlar: mahalle başlıktan ya da cite'tan
        ayni = [e for e in eslesen if mah and e.startswith(mah + "/")]
        if len(ayni) == 1:
            return "/mahalleler/" + ayni[0], "baslik", ""
        return belirsiz(f"aynı adı taşıyan {len(eslesen)} kayıt var, mahalle okunamadı")

    # site sayfası olmayan sonuçlarımız
    if etap and int(etap.group(1)) in ETAP:
        return f"/mahalleler/{ETAP[int(etap.group(1))]}/etaplar/{etap.group(1)}", "baslik", "etap sayfası"
    if ada:
        on = n[:ada.start()].strip()
        mah = (mseg if tur == "yeni" else None) or next((m + "-mahallesi" for m, ad in MAHALLE.items() if on == norm(ad)), None)
        nt = "ada sayfası"
        if not mah:
            mah, nt = exp_mah, "ada sayfası; mahalle başlıkta ve cite'ta yok, sorgunun mahallesi yazıldı"
        return (f"/mahalleler/{mah}/adalar/{ada.group(1)}" + (f"-{ada.group(2)}" if ada.group(2) else ""),
                "baslik", nt)
    mb = mahalle_basligi(tam, kesik)
    if mb:
        return f"/mahalleler/{mb}", "baslik", "mahalle sayfası"
    if not segs and re.match(r"eryaman emlakçı\b", n):
        return "/", "baslik", "ana sayfa"

    # başlık çözmedi: cite'ta TAM bir site slug'ı varsa (önek değil) ve tek kayda gidiyorsa
    for x in reversed(tamam):
        ad = [m for m in sluglar.get(x, []) if tur != "yeni" or m == mseg]
        if len(ad) == 1:
            return f"/mahalleler/{ad[0]}/{x}", "cite", "sayfa cite'taki tam slug'dan (başlık eşleşmedi)"
    return belirsiz("başlık bir kayıt adıyla tam eşleşmedi")


def satir_coz(s, b, kaynak, D):
    """biz satırı → {sira, u, u_kaynak, cite_mah, bas, tam, not}"""
    sira, p, bas25 = b[0], b[1], (b[2] if len(b) > 2 else "") or ""
    if len(b) > 4:
        cite, tam = b[3] or "", b[4] or ""
    elif len(b) > 3:
        cite, tam = "", b[3] or ""
    else:
        cite, tam = "", ""
        if len(bas25) > 25:   # 3 elemanlı kompakt satır: [2] kesilmemiş başlık ('bas' 25 karakter KALIR)
            tam, bas25 = bas25, bas25[:25]
    if re.match(r"https?://", tam):  # 4 elemanlı satırda [3] cite gelmiş: başlık diye yazma
        print(f"UYARI: {sira}. sıradaki sonucumuzda tam başlık yerine cite geldi; başlık yok sayıldı", file=sys.stderr)
        cite, tam = tam, ""
    if kaynak == "href" and (p or "").startswith("/"):
        u, uk, nt, cm = p, "href", "", None
    else:
        u, uk, nt = coz(s, tam or bas25, p, cite, D, kesik=not tam)
        cm = cite_mahalle(parcalar(p, cite))[0]
    return {"sira": sira, "u": u, "u_kaynak": uk, "cite_mah": cm, "bas": bas25 or (tam[:25] if tam else None) or None,
            "tam": tam or None, "not": nt}


def main(argv):
    s, q, ham = argv[1], argv[2], json.loads(argv[3])
    kanal = argv[4] if len(argv) > 4 else "uule-eryaman"
    ek_not = argv[5] if len(argv) > 5 else ""
    if "/" not in s:
        print(f"UYARI: slug '{s}' 'mah/slug' biçiminde değil; bu betik site sorgusu içindir "
              "(mahalle/etap sorgusu: hedef-ekle.py). Kayıt yine yazılıyor.", file=sys.stderr)
    D = dizin()
    if not D[0]:
        print(f"UYARI: {ICERIK} okunamadı; site sonuçları 'cite:' (adresi doğrulanamayan) yazılacak", file=sys.stderr)
    biz = ham.get("biz") or []
    biz_k = ham.get("biz_k") or []
    if not biz_k and ham.get("u_kaynak") == "href":   # kompakt çıkarıcı: biz_k yok, u_kaynak İLK sonucumuzun kaynağı
        biz_k = ["href"]
    kayitlar = [satir_coz(s, b, biz_k[i] if i < len(biz_k) else None, D) for i, b in enumerate(biz)]
    ilk = kayitlar[0] if kayitlar else None
    hl = ham.get("hl") or []
    kutu = ("harita kutusunda" if any(re.search("şirin", x, re.I) for x in hl)
            else ("kutu var biz yok" if ham.get("hp") else "kutu yok"))
    notlar = ([f"kanal {kanal}", kutu] + [f"#{k['sira']} {k['not']}" for k in kayitlar if k["not"]]
              + ([ek_not] if ek_not else []))
    rec = {"d": datetime.date.today().isoformat(), "kanal": kanal, "loc": ham.get("loc"), "tur": "site",
           "mah": s.split("/")[0], "s": s, "q": q, "sira": ilk["sira"] if ilk else 0, "u": ilk["u"] if ilk else None,
           "u_kaynak": ilk["u_kaynak"] if ilk else None, "cite_mah": ilk["cite_mah"] if ilk else None,
           "bas": ilk["bas"] if ilk else None, "bas_tam": ilk["tam"] if ilk else None,
           "ilk3": [x[:80] for x in ham.get("ilk3", [])],
           "isgal": len(kayitlar), "isgal_sira": [k["sira"] for k in kayitlar], "bizu": [k["u"] for k in kayitlar],
           "isgal_diger": ham.get("isgal_diger"), "n": ham.get("n", 0), "hl": hl, "hp": bool(ham.get("hp")),
           "s2sira": None, "s2u": None, "not": "; ".join(notlar)}
    open(os.path.join(K, "sonuclar-site-emlakci.jsonl"), "a").write(json.dumps(rec, ensure_ascii=False) + "\n")
    hedef = "/mahalleler/" + s
    u = rec["u"]
    m = re.match(r"/mahalleler/([^/?#]+)", u or "")   # eski şema: alt yollu ya da yolsuz (mahalle kökü de)
    if not u:
        durum = "DISI"
    elif u.startswith("cite:"):
        durum = "BELIRSIZ:" + u
    elif m and not m.group(1).endswith("-mahallesi"):
        durum = "ESKI:" + u
    elif u == hedef:
        durum = "DOGRU" + ("" if rec["u_kaynak"] == "href" or rec["cite_mah"] == "yeni" else " (eski/yeni adres ayrılamadı)")
    else:
        durum = "YANLIS:" + u
    print(f"{s} → sıra {rec['sira']} {durum} | {kutu} | n={rec['n']} | kaynak {rec['u_kaynak']}")


if __name__ == "__main__":
    main(sys.argv)
