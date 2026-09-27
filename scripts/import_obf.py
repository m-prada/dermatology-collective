"""Curate a reproducible, static snapshot of Open Beauty Facts skincare records.

Run from repository root: python scripts/import_obf.py
Review output before publishing. A country tag or taxonomy match is not verification.
"""
import collections
import datetime
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TODAY = datetime.date.today().isoformat()
API = "https://world.openbeautyfacts.org/api/v2/search"
CATEGORIES = ["face-creams", "facial-cleansers", "sunscreens", "face-serums", "body-lotions", "moisturizers", "acne-treatments", "skin-care", "face-masks", "facial-care-products"]
SEARCH_TERMS = ["cleanser", "face wash", "serum", "acne", "eczema", "barrier repair", "CeraVe", "Cetaphil", "Vanicream", "La Roche-Posay"]
BRANDS = ["cerave", "cetaphil", "la roche-posay", "eucerin", "aveeno", "neutrogena", "the ordinary", "vani cream", "vanicream", "bioderma", "aquaphor", "nivea", "olay", "dove", "first aid beauty", "clinique", "paula's choice", "the inkey list", "burt's bees", "st. ives", "simple", "garnier", "l'oréal", "l'oreal", "vichy", "kiehl's", "supergoop", "eltamd", "cosrx", "cera ve", "isdin", "e.l.f.", "elf", "bioré", "biore", "sebamed", "vaseline", "natura", "nuxe"]
ROLE = {"glycerin": ("Humectant", "Often used to help retain water in a formulation."), "niacinamide": ("Skin conditioning", "A form of vitamin B3 used in skin care."), "panthenol": ("Skin conditioning", "A form of provitamin B5 used in skin care."), "petrolatum": ("Occlusive", "Used to reduce moisture loss from skin."), "phenoxyethanol": ("Preservative", "Used to help preserve cosmetic products."), "hyaluronic acid": ("Humectant", "Used for water binding in skin care."), "sodium hyaluronate": ("Humectant", "A salt of hyaluronic acid used for water binding."), "ceramide np": ("Skin conditioning", "A ceramide used in skin care formulations."), "zinc oxide": ("UV filter", "A mineral UV filter used in sunscreen formulations."), "titanium dioxide": ("UV filter", "A mineral UV filter used in sunscreen formulations."), "salicylic acid": ("Exfoliant", "Used in some acne and exfoliating products."), "aqua": ("Solvent", "Water used as a formulation solvent."), "water": ("Solvent", "Water used as a formulation solvent."), "parfum": ("Fragrance label", "A label for a fragrance mixture; constituents may not all be individually listed."), "fragrance": ("Fragrance label", "A label for a fragrance mixture; constituents may not all be individually listed.")}
ALIASES = {"glycerin": ["Glycerol"], "aqua": ["Water"], "parfum": ["Fragrance"]}
FIELDS = "code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,ingredients,categories_tags,countries_tags,last_modified_t"

def request(category, page):
    query = urllib.parse.urlencode({"categories_tags_en": category, "page": page, "page_size": 250, "fields": FIELDS})
    req = urllib.request.Request(API + "?" + query, headers={"User-Agent": "DermatologyCollective/1.0 (educational static snapshot; contact via GitHub repository)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as response:
                return json.load(response)
        except Exception:
            if attempt == 2: raise
            time.sleep(2 ** attempt)

def search(term, page):
    query = urllib.parse.urlencode({"search_terms": term, "search_simple": 1, "action": "process", "json": 1, "page_size": 100, "page": page, "fields": FIELDS})
    req = urllib.request.Request("https://world.openbeautyfacts.org/cgi/search.pl?" + query, headers={"User-Agent": "DermatologyCollective/1.0 (educational static snapshot; contact via GitHub repository)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as response: return json.load(response)
        except Exception:
            if attempt == 2: raise
            time.sleep(2 ** attempt)

def clean(s):
    return re.sub(r"\s+", " ", str(s or "")).strip()

def key(s):
    return re.sub(r"\s+", " ", clean(s).casefold())

def slug(s):
    result = re.sub(r"[^a-z0-9]+", "-", s.casefold()).strip("-")
    return result

def category(tags):
    tag = " ".join(tags or []).lower()
    for terms, label in [(["sunscreen", "sun-care", "sun-protection"], "Sunscreen"), (["cleanser", "face-wash", "cleansing"], "Cleanser"), (["serum"], "Serum"), (["acne"], "Acne care"), (["moistur", "cream", "lotion"], "Moisturizer"), (["mask"], "Face mask")]:
        if any(term in tag for term in terms): return label
    return "Skin care"

def refine_category(p, name):
    text = name.casefold()
    if any(t in text for t in ["cleanser", "face wash", "facial wash", "cleansing gel", "cleansing foam"]): return "Cleanser"
    if any(t in text for t in ["serum", "sérum"]): return "Serum"
    if any(t in text for t in ["acne", "blemish"]): return "Acne care"
    return category(p.get("categories_tags"))

def tokenize(raw):
    # Split at top-level commas only. Keep the full raw label unchanged in product records.
    out, buf, depth = [], [], 0
    for char in raw:
        if char == "(": depth += 1
        if char == ")": depth = max(0, depth - 1)
        if char == "," and depth == 0:
            out.append(clean("".join(buf))); buf = []
        else: buf.append(char)
    out.append(clean("".join(buf)))
    return [x for x in out if x]

def main():
    found = {}
    for cat in CATEGORIES:
        for page in (1, 2, 3):
            data = request(cat, page)
            for p in data.get("products", []):
                code = clean(p.get("code"))
                if code and code not in found: found[code] = p
            print(cat, page, len(data.get("products", [])), "total", len(found), flush=True)
            if page * 100 >= data.get("count", 0): break
            time.sleep(.2)
    for term in SEARCH_TERMS:
        for page in (1, 2):
            data = search(term, page)
            for p in data.get("products", []):
                code = clean(p.get("code"))
                if code and code not in found: found[code] = p
            print("search", term, page, len(data.get("products", [])), "total", len(found), flush=True)
            if page * 100 >= data.get("count", 0): break
    ranked = []
    for code, p in found.items():
        name = clean(p.get("product_name_en") or p.get("product_name"))
        brand = clean(p.get("brands")).split(",")[0].strip()
        raw = clean(p.get("ingredients_text_en") or p.get("ingredients_text"))
        terms = tokenize(raw)
        if not re.fullmatch(r"\d{8,14}", code) or len(name) < 4 or len(brand) < 2 or len(terms) < 4 or len(raw) < 35 or len(raw) > 9000: continue
        if len(set(map(key, terms))) < 4 or any(len(t) > 180 for t in terms): continue
        countries = p.get("countries_tags") or []
        score = 100 if any(b in brand.casefold() for b in BRANDS) else 0
        score += 35 if "en:united-states" in countries else 0
        score += min(len(terms), 35) / 4
        score += 5 if p.get("ingredients_text_en") else 0
        ranked.append((score, code, p, name, brand, raw, terms))
    ranked.sort(key=lambda row: (-row[0], row[4].casefold(), row[3].casefold()))
    selected, seen = [], set()
    limits = {"Sunscreen": 85, "Face mask": 30, "Moisturizer": 125, "Cleanser": 85, "Serum": 55, "Acne care": 40, "Skin care": 30}
    category_counts = collections.Counter()
    for row in ranked:
        _, code, p, name, brand, raw, terms = row
        signature = (key(brand), key(name), key(raw))
        cat = refine_category(p, name)
        if signature in seen or category_counts[cat] >= limits[cat]: continue
        selected.append(row); seen.add(signature); category_counts[cat] += 1
        if len(selected) == 400: break
    # Only exact label tokens are matched; no guesswork from OBF's inferred ingredient taxonomy.
    names = collections.Counter(t for row in selected for t in row[6])
    display = {}
    for name, n in names.items():
        k = key(name)
        if not k or len(k) > 100: continue
        if k not in display or n > display[k][1]: display[k] = (name, n)
    ingredients = []
    alias_map = {}
    for k, (name, _) in sorted(display.items()):
        if k == "water" and "aqua" in display: continue
        if k == "glycerol" and "glycerin" in display: continue
        if k == "fragrance" and "parfum" in display: continue
        ident = slug(k)
        if not ident or ident in {i["id"] for i in ingredients}: continue
        role, summary = ROLE.get(k, (None, None))
        aliases = ALIASES.get(k, [])
        item = {"id": ident, "name": name, "aliases": aliases, "role": role, "summary": summary, "cas": None, "ec": None, "pubchemCid": None, "formula": None,
                "references": [{"name": "CosIng ingredient search", "url": "https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en"}],
                "source": "Exact ingredient label token from Open Beauty Facts; role supplied only for selected common terms"}
        ingredients.append(item)
        for alias in [name, *aliases]: alias_map.setdefault(key(alias), []).append(ident)
    # Do not let a canonical name be swallowed by another record's alias.
    for i in ingredients: alias_map[key(i["name"])] = [i["id"]]
    products = []
    for _, code, p, name, brand, raw, terms in selected:
        normalized = []
        for term in terms:
            ids = alias_map.get(key(term), [])
            normalized.append(ids[0] if len(ids) == 1 else None)
        products.append({"id": "obf-" + code, "barcode": code, "brand": brand, "name": name, "category": refine_category(p, name),
            "market": "United States (community country tag; unverified)" if "en:united-states" in (p.get("countries_tags") or []) else "Market unverified",
            "countriesTags": p.get("countries_tags") or [], "ingredientText": raw, "ingredientTerms": terms, "ingredientIds": normalized,
            "sourceUrl": "https://world.openbeautyfacts.org/product/" + code, "sourceType": "community", "sourceName": "Open Beauty Facts", "accessed": TODAY,
            "lastModified": datetime.datetime.fromtimestamp(p["last_modified_t"], datetime.timezone.utc).date().isoformat() if isinstance(p.get("last_modified_t"), (int, float)) else None,
            "verification": "community", "imageUrl": None})
    out = ROOT / "data"; out.mkdir(exist_ok=True)
    for filename, obj in {"products.json": products, "ingredients.json": ingredients, "aliases.json": alias_map, "formulations.json": [],
            "sources.json": {"openBeautyFacts": {"name": "Open Beauty Facts", "url": "https://world.openbeautyfacts.org/", "license": "Open Database License (ODbL)", "accessed": TODAY}, "cosing": {"name": "European Commission CosIng", "url": "https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en", "purpose": "reference link only"}}}.items():
        (out / filename).write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "\n")
    print("selected", len(products), "ingredients", len(ingredients), "matched terms", sum(bool(x) for p in products for x in p["ingredientIds"]))

if __name__ == "__main__": main()
