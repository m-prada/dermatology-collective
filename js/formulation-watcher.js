'use strict';
let products = [], histories = [], currentId = null;
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getWatch = () => { try { const ids = JSON.parse(localStorage.getItem('dcProductWatch') || '[]'); return Array.isArray(ids) ? ids : []; } catch { return []; } };
function renderWatch() {
  $('productWatchList').innerHTML = getWatch().map(id => products.find(p => p.id === id)).filter(Boolean).map(p => `<div class="watch-item"><b>${esc(p.brand)} · ${esc(p.name)}</b><button data-open="${esc(p.id)}">Open</button></div>`).join('') || '<div class="notice">No products saved yet.</div>';
  $('productWatchList').querySelectorAll('[data-open]').forEach(b => b.onclick = () => openProduct(b.dataset.open));
}
function renderProducts() {
  const q = $('watchSearch').value.trim().toLowerCase();
  const matches = products.filter(p => [p.name,p.brand,p.category,p.barcode].join(' ').toLowerCase().includes(q));
  $('productList').innerHTML = matches.slice(0,100).map(p => `<button class="result ${p.id===currentId ? 'active' : ''}" data-id="${esc(p.id)}"><strong>${esc(p.name)}</strong><span>${esc(p.brand)} · ${esc(p.category)}</span></button>`).join('') || '<div class="notice">No matching record in this snapshot.</div>';
  $('productList').querySelectorAll('[data-id]').forEach(b => b.onclick = () => openProduct(b.dataset.id));
  $('productCount').textContent = `${matches.length} matching products${matches.length > 100 ? ' · first 100 shown' : ''}`;
}
function diffVersions(a,b) {
  const x = a.ingredientIds, y = b.ingredientIds;
  const added = y.filter(id => !x.includes(id)), removed = x.filter(id => !y.includes(id));
  const unchanged = x.filter(id => y.includes(id) && x.indexOf(id) === y.indexOf(id));
  const reordered = x.filter(id => y.includes(id) && x.indexOf(id) !== y.indexOf(id));
  return {added,removed,unchanged,reordered};
}
function renderHistory() {
  const p = products.find(p => p.id === currentId); if (!p) return;
  $('productTitle').textContent = p.name;
  $('productMeta').textContent = `${p.brand} · ${p.category} · ${p.market}`;
  $('productBadge').textContent = 'Community record · not independently verified';
  const h = histories.find(h => h.productId === p.id && h.versions?.length >= 2);
  const versions = h?.versions || [];
  $('emptyHistory').hidden = Boolean(h);
  $('documentedHistory').hidden = !h;
  $('currentSource').innerHTML = `<p>Current community record: <a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open Beauty Facts</a>. Accessed ${esc(p.accessed)}. Market: ${esc(p.market)}.</p><p>Published ingredient text: ${esc(p.ingredientText)}</p>`;
  if (!h) return;
  for (const id of ['versionA','versionB']) $(id).innerHTML = versions.map(v => `<option value="${esc(v.id)}">${esc(v.date)} · ${esc(v.market)}</option>`).join('');
  $('versionB').selectedIndex = versions.length - 1;
  const renderDiff = () => {
    const a = versions.find(v => v.id === $('versionA').value), b = versions.find(v => v.id === $('versionB').value);
    if (!a || !b) return;
    const d = diffVersions(a,b);
    $('timelineA').textContent = a.date; $('timelineB').textContent = b.date;
    for (const state of ['added','removed','unchanged','reordered']) { $(state + 'Count').textContent = d[state].length; $(state + 'Names').textContent = d[state].join(', ') || 'None'; }
    for (const [side,v] of [['A',a],['B',b]]) {
      $('version' + side + 'Title').textContent = side === 'A' ? 'Earlier formula' : 'Current formula';
      $('version' + side + 'Date').textContent = v.date;
      $('stack' + side).innerHTML = v.ingredientTerms.map((term,i) => { const id = v.ingredientIds[i]; const status = d.added.includes(id) ? 'added' : d.removed.includes(id) ? 'removed' : d.reordered.includes(id) ? 'reordered' : 'unchanged'; return `<div class="ingredient-row"><b>${esc(term)}</b><span class="status ${esc(status)}">${esc(status)}</span></div>`; }).join('');
      $('source' + side).innerHTML = `<a href="${esc(v.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(v.sourceName)}</a>`;
      $('market' + side).textContent = `${v.date} · ${v.market} · ${v.verification} · accessed ${v.accessed}`;
    }
  };
  $('versionA').onchange = renderDiff; $('versionB').onchange = renderDiff; renderDiff();
}
function openProduct(id) { if (!products.some(p => p.id === id)) return; currentId = id; renderProducts(); renderHistory(); $('watchProductButton').textContent = getWatch().includes(id) ? 'Remove from watchlist' : 'Save to watchlist'; history.replaceState(null,'','#product=' + encodeURIComponent(id)); }
async function init() {
  try {
    [products,histories] = await Promise.all(['products','formulations'].map(s => fetch(`data/${s}.json`).then(r => {if (!r.ok) throw Error(s); return r.json();})));
    $('watchSearch').oninput = renderProducts;
    $('watchProductButton').onclick = () => { const ids = getWatch(); localStorage.setItem('dcProductWatch',JSON.stringify(ids.includes(currentId) ? ids.filter(id => id !== currentId) : [...ids,currentId])); renderWatch(); openProduct(currentId); };
    const match = location.hash.match(/^#product=(.+)$/); const id = match && decodeURIComponent(match[1]);
    currentId = products.some(p => p.id === id) ? id : products[0]?.id;
    renderWatch(); if (currentId) openProduct(currentId);
  } catch (e) { $('productTitle').textContent = 'Product data could not be loaded. Open this site through a web server and try again.'; console.error(e); }
}
init();
