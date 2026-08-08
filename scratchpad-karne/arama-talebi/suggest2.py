#!/usr/bin/env python3
"""Kalan kuyruğu paralel çek (v1'in tamamladıklarını atlar), sonuclar2.jsonl'a yaz."""
import json, sys, time, urllib.parse, urllib.request, random, os, threading, queue
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from suggest import TOHUMLAR, HARFLER, RAKAMLAR, SORULAR, cek

S = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(S, "sonuclar2.jsonl")

def kuyruk_kur():
    istekler = []
    for t in TOHUMLAR:
        istekler.append(t)
        for h in HARFLER + RAKAMLAR: istekler.append(f"{t} {h}")
        for s in SORULAR:            istekler.append(f"{t} {s}")
    g, k = set(), []
    for q in istekler:
        if q not in g: g.add(q); k.append(q)
    return k

def main():
    tam = kuyruk_kur()
    bitmis = set()
    for p in ("sonuclar.jsonl", "sonuclar2.jsonl"):
        fp = os.path.join(S, p)
        if os.path.exists(fp):
            for l in open(fp, encoding="utf-8"):
                try: bitmis.add(json.loads(l)["kok"])
                except Exception: pass
    # v1 sırayla gidiyor: son yazdığı kökten öncesini bitmiş say
    son_idx = max([tam.index(k) for k in bitmis if k in tam] + [-1])
    kalan = [q for i, q in enumerate(tam) if i > son_idx]
    print(f"toplam {len(tam)}, v1 {son_idx+1}'e kadar bitirdi, kalan {len(kalan)}", file=sys.stderr)

    q = queue.Queue()
    for x in kalan: q.put(x)
    kilit = threading.Lock()
    f = open(OUT, "a", encoding="utf-8")
    sayac = [0, 0]

    def worker():
        while True:
            try: kok = q.get_nowait()
            except queue.Empty: return
            r = cek(kok, tries=2)
            with kilit:
                sayac[0] += 1
                if r:
                    sayac[1] += 1
                    f.write(json.dumps({"kok": kok, "oneriler": r}, ensure_ascii=False) + "\n"); f.flush()
                if sayac[0] % 200 == 0:
                    print(f"  {sayac[0]}/{len(kalan)} ({sayac[1]} dolu)", file=sys.stderr)
            time.sleep(random.uniform(0.25, 0.6))

    ts = [threading.Thread(target=worker, daemon=True) for _ in range(6)]
    for t in ts: t.start()
    for t in ts: t.join()
    f.close()
    print(f"BİTTİ: {sayac[1]}/{len(kalan)} dolu → {OUT}", file=sys.stderr)

if __name__ == "__main__":
    main()
