"""Validate a published snapshot. Run: python scripts/check_data.py"""
import json
import re
from pathlib import Path
from urllib.parse import urlparse
root = Path(__file__).resolve().parents[1] / 'data'
p, i, a, f = [json.loads((root / (name + '.json')).read_text()) for name in ('products','ingredients','aliases','formulations')]
errors = []
ids = {x['id'] for x in i}
if len(ids) != len(i): errors.append('duplicate ingredient ID')
if len({x['id'] for x in p}) != len(p): errors.append('duplicate product ID')
if len({x['barcode'] for x in p}) != len(p): errors.append('duplicate barcode')
for x in i:
    if not x['name'] or x['name'] != x['name'].strip(): errors.append('invalid ingredient name: ' + x['id'])
    if any(not isinstance(v,str) for v in x['aliases']): errors.append('bad alias: ' + x['id'])
for k, vals in a.items():
    if not k or len(vals) != len(set(vals)) or any(v not in ids for v in vals): errors.append('invalid alias: ' + k)
for x in p:
    if not x['name'] or not x['brand'] or not x['ingredientText']: errors.append('missing product text: ' + x['id'])
    if not isinstance(x['ingredientTerms'], list) or not isinstance(x['ingredientIds'],list) or len(x['ingredientTerms']) != len(x['ingredientIds']): errors.append('malformed ingredient array: ' + x['id'])
    if any(not isinstance(t,str) or not t.strip() for t in x['ingredientTerms']) or any(v is not None and v not in ids for v in x['ingredientIds']): errors.append('invalid ingredient token: ' + x['id'])
    u = urlparse(x['sourceUrl'])
    if u.scheme != 'https' or u.netloc != 'world.openbeautyfacts.org' or not re.fullmatch(r'/product/\d{8,14}',u.path): errors.append('invalid source URL: ' + x['id'])
    if x['verification'] not in ('community','verified','historical'): errors.append('invalid provenance: ' + x['id'])
for history in f:
    if len(history.get('versions',[])) < 2: errors.append('history needs two dated versions')
    if history['productId'] not in {x['id'] for x in p}: errors.append('orphan history')
print(f'{len(p)} products; {len(i)} ingredient records; {sum(x["verification"] == "verified" for x in p)} verified; {len(f)} histories; {len(errors)} structural errors')
if errors: raise SystemExit('\n'.join(errors[:30]))
