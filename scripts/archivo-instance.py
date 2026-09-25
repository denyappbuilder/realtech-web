#!/usr/bin/env python3
"""Kolo 54: statická výseč Archiva pro web (wght 600–900, wdth 100–125 %).

Web sází Archivo jen v řezech 650–900 a šířkách 100–118 % (změřeno
Playwrightem na 10 typech stránek × 390/1280 px, 25. 9. 2026). Plný
variabilní font z @fontsource-variable/archivo nese osy wght 100–900
a wdth 62–125 % → 90 + 87 KB woff2 na každou stránku. Výseč os má
43,5 + 40,5 KB se stejnými glyfy (cmap 230 + 262), stejnými OpenType
features a stejnou unicode-range → −93 KB fontů na každé načtení.

Spuštění (jen při zvednutí verze balíčku, výstup je commitnutý):
    python3 -m venv /tmp/ft && /tmp/ft/bin/pip install fonttools brotli
    /tmp/ft/bin/python scripts/archivo-instance.py

Licence: Archivo je OFL-1.1 bez vyhrazeného jména (Reserved Font Name),
upravená výseč smí nést původní jméno rodiny.
"""
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

KOREN = Path(__file__).resolve().parent.parent
ZDROJ = KOREN / "node_modules/@fontsource-variable/archivo/files"
CIL = KOREN / "src/assets/fonts"
OSY = {"wght": (600, 900), "wdth": (100, 125)}

CIL.mkdir(parents=True, exist_ok=True)
for sada in ("latin-ext", "latin"):
    font = TTFont(ZDROJ / f"archivo-{sada}-wdth-normal.woff2")
    glyfu = len(font.getBestCmap())
    vysec = instancer.instantiateVariableFont(font, OSY)
    mezi = CIL / f".archivo-{sada}.ttf"
    vysec.flavor = None
    vysec.save(mezi)
    vystup = CIL / f"archivo-{sada}-wght600-900-wdth100-125.woff2"
    # Všechny glyfy a features: výseč mění jen rozsah os, ne znakovou sadu.
    subset.main([str(mezi), "--glyphs=*", "--unicodes=*", "--layout-features=*",
                 "--name-IDs=*", "--notdef-outline", "--flavor=woff2",
                 f"--output-file={vystup}"])
    mezi.unlink()
    kontrola = TTFont(vystup)
    assert len(kontrola.getBestCmap()) == glyfu, f"{sada}: ztratily se znaky"
    print(f"{vystup.relative_to(KOREN)}  {vystup.stat().st_size} B  ({glyfu} znaků)")
