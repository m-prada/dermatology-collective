'use strict';
let DB = {products: [], ingredients: [], aliases: {}, formulations: []};
let current = null;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = value => String(value ?? '').normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
const getWatch = () => { try { const a = JSON.parse(localStorage.getItem('dcIngredientWatch') || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };
const ingById = new Map(), productById = new Map();
const listing = (items, empty = 'None in this snapshot') => items.length ? items.map(esc).join(', ') : empty;
const row = (label, value) => `<div class="source-row"><span>${esc(label)}</span><strong>${esc(value ?? 'Unknown')}</strong></div>`;
function productMatches(p) { return p.ingredientIds.filter(id => id && getWatch().includes(id)).map(id => ingById.get(id)?.name || id); }
function toggleWatch(id) {
  let ids = getWatch(); ids = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
  localStorage.setItem('dcIngredientWatch', JSON.stringify(ids)); renderWatch(); renderDetail(); renderCompare();
}
function renderWatch() {
  const ids = getWatch().filter(id => ingById.has(id));
  $('watchList').innerHTML = ids.length ? ids.map(id => `<div class="watch-item"><b>${esc(ingById.get(id).name)}</b><button data-remove="${esc(id)}">Remove</button></div>`).join('') : '<div class="notice">No ingredients saved yet.</div>';
  $('watchList').querySelectorAll('[data-remove]').forEach(btn => btn.onclick = () => toggleWatch(btn.dataset.remove));
}
function visibleProducts() {
  const q = norm($('universalSearch').value), category = $('categoryFilter').value, brand = $('brandFilter').value, status = $('statusFilter').value;
  return DB.products.filter(p => (!category || p.category === category) && (!brand || p.brand === brand) && (!status || p.verification === status) && (!q || norm([p.name,p.brand,p.category,p.barcode].join(' ')).includes(q)));
}
function renderResults() {
  const q = norm($('universalSearch').value);
  const ingredients = DB.ingredients.filter(i => !q || norm([i.name, i.role, ...(i.aliases || [])].join(' ')).includes(q));
  const products = visibleProducts();
  const rows = [...products.map(x => ({kind:'product',id:x.id,name:x.name,meta:`${x.brand} · ${x.category}`})), ...ingredients.map(x => ({kind:'ingredient', id:x.id, name:x.name, meta:x.role || 'Ingredient record'}))].slice(0,100);
  $('resultList').innerHTML = rows.length ? rows.map(r => `<button class="result ${current?.kind === r.kind && current?.id === r.id ? 'active' : ''}" data-kind="${r.kind}" data-id="${esc(r.id)}"><strong>${esc(r.name)}</strong><span>${esc(r.meta)}</span></button>`).join('') : '<div class="notice">No matching record in this snapshot.</div>';
  $('resultList').querySelectorAll('[data-kind]').forEach(btn => btn.onclick = () => open(btn.dataset.kind, btn.dataset.id, false));
  $('resultCount').textContent = `${ingredients.length + products.length} matching records${ingredients.length + products.length > 100 ? ' · first 100 shown' : ''}`;
}
function open(kind,id,clearSearch=true) {
  if (!(kind === 'ingredient' ? ingById : productById).has(id)) return;
  current = {kind,id}; if (clearSearch) { $('universalSearch').value = ''; renderResults(); }
  renderResults(); renderDetail();
  history.replaceState(null,'', '#' + (kind === 'ingredient' ? 'ingredient=' : 'product=') + encodeURIComponent(id));
}
function renderDetail() {
  if (!current) return;
  if (current.kind === 'ingredient') {
    const x = ingById.get(current.id), matches = DB.products.filter(p => p.ingredientIds.includes(x.id)), watched = getWatch().includes(x.id);
    $('detailPanel').innerHTML = `<div class="detail-head"><div><h2>${esc(x.name)}</h2><p>${x.aliases.length ? 'Also listed as ' + listing(x.aliases) : 'Ingredient record'}</p></div><span class="role-chip">${esc(x.role || 'Role not reviewed')}</span></div>
    <div class="card-grid"><div class="info-card"><span>Products in this snapshot</span><strong>${matches.length}</strong><p>Matching label terms only</p></div><div class="info-card"><span>Watchlist</span><strong>${watched ? 'Saved' : 'Not saved'}</strong><p>Stored in this browser</p></div></div>
    <div class="section-block"><h3>About this ingredient</h3><p>${esc(x.summary || 'A role description has not yet been reviewed for this ingredient.')}</p><p>Its role depends on the full formula.</p></div>
    <div class="section-block"><h3>Identifiers</h3>${row('CAS',x.cas)}${row('EC',x.ec)}${row('PubChem CID',x.pubchemCid)}${row('Molecular formula',x.formula)}</div>
    <div class="section-block"><h3>Products containing this label term</h3><div class="tag-list">${matches.slice(0,100).map(p => `<button class="tag" data-product="${esc(p.id)}">${esc(p.brand)} · ${esc(p.name)}</button>`).join('') || '<span class="tag">None in this snapshot</span>'}</div>${matches.length > 100 ? '<p>First 100 shown.</p>' : ''}</div>
    <div class="section-block"><h3>Sources</h3><p>${esc(x.source)}</p>${x.references.map(r => `<p><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a></p>`).join('')}</div>
    <div class="action-row"><button class="primary-btn" id="toggleIngredient">${watched ? 'Remove from watchlist' : 'Add to watchlist'}</button></div>`;
    $('toggleIngredient').onclick = () => toggleWatch(x.id);
    $('detailPanel').querySelectorAll('[data-product]').forEach(btn => btn.onclick = () => open('product',btn.dataset.product));
  } else {
    const p = productById.get(current.id), matches = productMatches(p);
    $('detailPanel').innerHTML = `<div class="detail-head"><div><h2>${esc(p.name)}</h2><p>${esc(p.brand)} · ${esc(p.category)}</p></div><span class="pill">Community record</span></div>
    <div class="card-grid"><div class="info-card"><span>Label terms</span><strong>${p.ingredientTerms.length}</strong><p>Published ingredient text below</p></div><div class="info-card"><span>Watchlist matches</span><strong>${matches.length}</strong><p>${listing(matches, 'No matching ingredient identified in this record')}</p></div><div class="info-card"><span>Verification</span><strong>Community record</strong><p>Not independently verified</p></div></div>
    <div class="section-block"><h3>Complete published ingredient text</h3><p>${esc(p.ingredientText)}</p></div>
    <div class="section-block"><h3>Ingredient terms</h3><div class="tag-list">${p.ingredientTerms.map((term,index) => { const id = p.ingredientIds[index]; return id && ingById.has(id) ? `<button class="tag" data-ingredient="${esc(id)}">${esc(term)}</button>` : `<span class="tag">${esc(term)}</span>`; }).join('')}</div><p>Clickable terms have exact matches in the local ingredient dictionary. A term without a match is not evidence of its absence from other products.</p></div>
    <div class="section-block"><h3>Record provenance</h3>${row('Source',p.sourceName)}${row('Status','Community record · not independently verified')}${row('Market',p.market)}${row('Barcode',p.barcode)}${row('Accessed',p.accessed)}${row('Last changed in source',p.lastModified)}<p><a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">View source record</a></p>${DB.formulations.some(f => f.productId === p.id) ? `<p><a href="formulation-watcher.html#product=${encodeURIComponent(p.id)}">View documented formulation history</a></p>` : ''}</div>
    <div class="notice">Manufacturer formulas can change. Verify the ingredient list on the physical product you are using.</div>`;
    $('detailPanel').querySelectorAll('[data-ingredient]').forEach(btn => btn.onclick = () => open('ingredient',btn.dataset.ingredient));
  }
}
function parseLabel() {
  const tokens = $('ingredientPaste').value.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  const matches = [], misses = [], ambiguous = [];
  for (const term of tokens) { const ids = DB.aliases[norm(term)] || []; if (ids.length === 1) matches.push(ingById.get(ids[0])?.name || term); else if (ids.length > 1) ambiguous.push(term); else misses.push(term); }
  $('parseOutput').innerHTML = `<h3>Matched canonical ingredients (${matches.length})</h3><p>${listing(matches)}</p><h3>Unmatched terms (${misses.length})</h3><p>${listing(misses)}</p><h3>Ambiguous terms (${ambiguous.length})</h3><p>${listing(ambiguous)}</p><p>Unmatched terms may appear in formulations under other labels or outside this snapshot.</p>`;
}
function renderCompare() {
  const a = productById.get($('compareA').value), b = productById.get($('compareB').value); if (!a || !b) return;
  const aSet = new Set(a.ingredientIds.filter(Boolean)), bSet = new Set(b.ingredientIds.filter(Boolean));
  const names = ids => [...ids].map(id => ingById.get(id)?.name || id);
  const card = (label, ids) => `<div class="info-card"><span>${label}</span><strong>${ids.length}</strong><p>${listing(names(ids))}</p></div>`;
  $('compareOutput').innerHTML = `<h3>${esc(a.name)} / ${esc(b.name)}</h3><p>Only matched ingredient terms are compared. Unmatched terms remain in each full source list.</p><div class="card-grid">${card('Shared', [...aSet].filter(id => bSet.has(id)))}${card('Only in A',[...aSet].filter(id => !bSet.has(id)))}${card('Only in B',[...bSet].filter(id => !aSet.has(id)))}</div>${row('A watchlist matches',listing(productMatches(a)))}${row('B watchlist matches',listing(productMatches(b)))}${row('A source / accessed',`${a.sourceName} / ${a.accessed} (${a.verification})`)}${row('B source / accessed',`${b.sourceName} / ${b.accessed} (${b.verification})`)}`;
}
async function init() {
  try {
    const [products,ingredients,aliases,formulations] = await Promise.all(['products','ingredients','aliases','formulations'].map(name => fetch(`data/${name}.json`).then(r => {if (!r.ok) throw Error(name); return r.json();})));
    DB = {products, ingredients, aliases, formulations}; ingredients.forEach(i => ingById.set(i.id,i)); products.forEach(p => productById.set(p.id,p));
    for (const [id,vals] of [['categoryFilter',[...new Set(products.map(p => p.category))]],['brandFilter',[...new Set(products.map(p => p.brand))]]]) $(id).innerHTML += vals.sort().map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    for (const [id,index] of [['compareA',0],['compareB',1]]) { $(id).innerHTML = products.map((p,i) => `<option value="${esc(p.id)}" ${i === index ? 'selected' : ''}>${esc(p.brand)} · ${esc(p.name)}</option>`).join(''); $(id).onchange = renderCompare; }
    for (const id of ['categoryFilter','brandFilter','statusFilter','universalSearch']) $(id).addEventListener(id === 'universalSearch' ? 'input' : 'change',renderResults);
    $('parseButton').onclick = parseLabel;
    document.querySelectorAll('[data-mode]').forEach(btn => btn.onclick = () => { document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active')); btn.classList.add('active'); $('pasteDrawer').classList.toggle('open',btn.dataset.mode === 'paste'); $('compareDrawer').classList.toggle('open',btn.dataset.mode === 'compare'); });
    const hash = location.hash.match(/^#(ingredient|product)=(.+)$/); const id = hash && decodeURIComponent(hash[2]);
    current = hash && (hash[1] === 'ingredient' ? ingById : productById).has(id) ? {kind:hash[1],id} : products.length ? {kind:'product',id:products[0].id} : null;
    renderResults(); renderWatch(); renderDetail(); renderCompare();
  } catch (e) { $('detailPanel').textContent = 'Product data could not be loaded. Open this site through a web server and try again.'; console.error(e); }
}
init();
