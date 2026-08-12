#!/usr/bin/env python3
# Prepara gli asset del runner: ritaglia, alleggerisce, rinomina.
# Sorgente: app/assets/game (i PNG originali, intoccati). Uscita: app/assets/runner.
# Rilanciare dopo aver aggiunto o sostituito un asset.
import os, json, shutil
from PIL import Image, ImageDraw

SRC = "/Users/fabiomancinelli/Desktop/Byup/app/assets/game"
# La destinazione NON deve chiamarsi "game" né "Game": il disco è
# case-insensitive, sarebbe la stessa cartella della sorgente.
DST = "/Users/fabiomancinelli/Desktop/Byup/app/assets/runner"
assert os.path.normcase(os.path.abspath(DST)) != os.path.normcase(os.path.abspath(SRC)), \
    "destinazione e sorgente coincidono"

# ── ritaglio ────────────────────────────────────────────────────────────
def bande(alpha, soglia=8):
    """Fasce orizzontali di pixel opachi, separate da righe vuote."""
    w, h = alpha.size
    px = alpha.load()
    conte = []
    for y in range(h):
        n = 0
        for x in range(0, w, 2):          # campiona 1 colonna su 2: basta e avanza
            if px[x, y] > soglia:
                n += 1
        conte.append(n)
    out, y0 = [], None
    for y, n in enumerate(conte):
        if n and y0 is None:
            y0 = y
        elif not n and y0 is not None:
            out.append((y0, y, sum(conte[y0:y])))
            y0 = None
    if y0 is not None:
        out.append((y0, h, sum(conte[y0:h])))
    return out

def ritaglia(im, scarta_staccati=True, quota=0.15):
    """Bbox dei pixel opachi. Se richiesto butta le fasce staccate e minuscole
    (le ombre a terra dei frame in volo), che altrimenti falsano l'ancoraggio."""
    a = im.getchannel("A")
    bb = a.point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bb:
        return None
    if scarta_staccati:
        sotto = a.crop((bb[0], bb[1], bb[2], bb[3]))
        bs = bande(sotto)
        if len(bs) > 1:
            top = max(b[2] for b in bs)
            tenute = [b for b in bs if b[2] >= top * quota]
            y0 = bb[1] + min(b[0] for b in tenute)
            y1 = bb[1] + max(b[1] for b in tenute)
            # ricalcola l'orizzontale sulla sola parte tenuta
            bb2 = a.crop((bb[0], y0, bb[2], y1)).point(lambda v: 255 if v > 8 else 0).getbbox()
            if bb2:
                bb = (bb[0] + bb2[0], y0 + bb2[1], bb[0] + bb2[2], y0 + bb2[3])
    return bb

def togli_fondo_bianco(im):
    """Rende trasparente il rettangolo bianco che circonda il soggetto.
    Riempimento dai bordi: i bianchi interni (occhi, muso) restano.
    Va ritagliato PRIMA sul bbox opaco: il bordo dell'immagine intera è
    trasparente, quindi da lì il riempimento non toccherebbe mai il bianco."""
    im = im.convert("RGBA")
    bb = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if bb:
        im = im.crop(bb)
    w, h = im.size
    px = im.load()
    def bianco(p):
        return p[3] > 0 and p[0] > 232 and p[1] > 232 and p[2] > 232
    visti = set()
    coda = []
    for x in range(w):
        for y in (0, h - 1):
            if bianco(px[x, y]):
                coda.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if bianco(px[x, y]):
                coda.append((x, y))
    while coda:
        x, y = coda.pop()
        if (x, y) in visti:
            continue
        visti.add((x, y))
        if not bianco(px[x, y]):
            continue
        px[x, y] = (255, 255, 255, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visti:
                coda.append((nx, ny))
    return im

def sprite(rel, nome, lato, staccati=True, bianco=False):
    im = Image.open(os.path.join(SRC, rel)).convert("RGBA")
    if bianco:
        im = togli_fondo_bianco(im)
    bb = ritaglia(im, staccati)
    im = im.crop(bb)
    k = lato / max(im.size)
    if k < 1:
        im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    p = os.path.join(DST, nome + ".webp")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, "WEBP", quality=88, method=6)
    return nome, im.size, os.path.getsize(p)

def scena(rel, nome, larg=1920):
    im = Image.open(os.path.join(SRC, rel)).convert("RGB")
    if im.width != larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    p = os.path.join(DST, nome + ".webp")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, "WEBP", quality=82, method=6)
    return nome, im.size, os.path.getsize(p)

# ── mappa sorgente → nome web ───────────────────────────────────────────
BYUP = [
    ("Personaggio/Modello Byup base - Camminata 1.png", "byup/corsa-1", True, False),
    ("Personaggio/Modello Byup base - Camminata 2.png", "byup/corsa-2", True, False),
    ("Personaggio/Modello Byup base - Camminata 3.png", "byup/corsa-3", True, False),
    ("Personaggio/Modello Byup base - Salto 1.png", "byup/stacco", True, False),
    ("Personaggio/Modello Byup base - Salto 2.png", "byup/volo", True, False),
    ("Personaggio/Modello Byup base - Salto 3.png", "byup/salita", True, False),
    ("Personaggio/Modello Byup base - Salto 4.png", "byup/atterra", True, False),
    ("Personaggio/Modello Byup base - Si Abbassa 1.png", "byup/giu", True, False),
    ("Personaggio/Modello Byup base - Colpito Dalla Padella Sconfitta.png", "byup/colpito", True, False),
    ("Personaggio/Modello Byup base - Dopo che hai perso_ Pop up Riprova.png", "byup/ko", True, True),
]
ORO = [
    ("Personaggio/Modello Byup Super - Corsa 1.png", "oro/corsa-1"),
    ("Personaggio/Modello Byup Super - Corsa 2.png", "oro/corsa-2"),
    ("Personaggio/Modello Byup Super - Salto 4.png", "oro/corsa-3"),
    ("Personaggio/Modello Byup Super - Salto 1.png", "oro/salto"),
    ("Personaggio/Modello Byup Super - Salto 2.png", "oro/volo"),
    ("Personaggio/Modello Byup Super - Si Abbassa.png", "oro/giu"),
    ("Personaggio/Modello Byup Super - Salto 3.png", "oro/lampo"),
]
CIBI = [
    ("Cibi/Pizza.png", "cibo/pizza"), ("Cibi/Panino.png", "cibo/panino"),
    ("Cibi/Taco.png", "cibo/taco"), ("Cibi/Nigiri.png", "cibo/nigiri"),
    ("Cibi/Ramen.png", "cibo/ramen"), ("Cibi/Donut.png", "cibo/donut"),
    ("Cibi/Pancake.png", "cibo/pancake"), ("Cibi/Coppetta Gelato.png", "cibo/gelato"),
    ("Cibi/Bubble Tea.png", "cibo/bubbletea"), ("Cibi/Caffè.png", "cibo/caffe"),
    ("Cibi/Cappuccino.png", "cibo/cappuccino"), ("Cibi/Succo Arancia.png", "cibo/succo"),
]

# Nessuna cancellazione: si sovrascrive e basta.
os.makedirs(DST, exist_ok=True)

righe, tot = [], 0
for rel, nome, st, bi in BYUP:
    righe.append(sprite(rel, nome, 440, st, bi))
for rel, nome in ORO:
    righe.append(sprite(rel, nome, 440))
for rel, nome in CIBI:
    righe.append(sprite(rel, nome, 200))
righe.append(sprite("Cibi/Byuppino d'oro.png", "b-oro", 220))
righe.append(sprite("Ostacolo 1.png", "padella", 260))
manca = []
for i in range(1, 7):
    rel = f"Scene/Scena {i}.png"
    if os.path.exists(os.path.join(SRC, rel)):
        righe.append(scena(rel, f"scena-{i}"))
    else:
        manca.append(rel)
for i in range(1, 6):
    rel = f"Scene/Scena di transizione {i}.png"
    if os.path.exists(os.path.join(SRC, rel)):
        righe.append(scena(rel, f"ponte-{i}"))
    else:
        manca.append(rel)

for nome, dim, peso in righe:
    tot += peso
    print(f"{nome:<20} {dim[0]:>5}x{dim[1]:<5} {peso/1024:>8.0f} KB")
print(f"{'TOTALE':<20} {'':>11} {tot/1024/1024:>8.2f} MB")
if manca:
    print("\nscene non ancora sul disco (il gioco usa i fondali provvisori):")
    for m in manca:
        print("  -", m)
