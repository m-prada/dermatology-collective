const structures = {
  epidermis: {
    index: "01",
    title: "Epidermis",
    text: "The outer skin layer. It contains keratinocytes and melanocytes and forms a major protective barrier."
  },
  dermis: {
    index: "02",
    title: "Dermis",
    text: "The deeper skin layer that contains blood vessels, nerves, hair follicles, and glands."
  },
  hypodermis: {
    index: "03",
    title: "Hypodermis",
    text: "A closely associated layer beneath the dermis that contains loose connective tissue and adipose tissue."
  },
  hair: {
    index: "04",
    title: "Hair follicle",
    text: "A structure extending from the epidermis into deeper tissue that anchors and produces hair."
  },
  sebaceous: {
    index: "05",
    title: "Sebaceous gland",
    text: "An oil gland commonly associated with a hair follicle that releases sebum."
  },
  sweat: {
    index: "06",
    title: "Eccrine sweat gland",
    text: "A coiled gland in the dermis whose duct opens to the surface and contributes to thermoregulation."
  },
  vessels: {
    index: "07",
    title: "Blood vessels",
    text: "The dermis is vascularized. Vessels help nourish tissue and participate in temperature regulation."
  },
  nerve: {
    index: "08",
    title: "Sensory structures",
    text: "Nerves and sensory receptors in the dermis help the body detect pressure, temperature, and other sensations."
  }
};

const stage = document.getElementById("modelStage");
const card = document.getElementById("heroModelCard");
const svg = document.getElementById("skinModel");
const lensClipCircle = document.getElementById("lensClipCircle");
const lensRing = document.getElementById("lensRing");
const lensDot = document.getElementById("lensDot");
const calloutTitle = document.getElementById("calloutTitle");
const calloutText = document.getElementById("calloutText");
const calloutIndex = document.querySelector(".callout-index");

function setCallout(key) {
  const info = structures[key];
  if (!info) return;
  calloutIndex.textContent = info.index;
  calloutTitle.textContent = info.title;
  calloutText.textContent = info.text;
}

document.querySelectorAll(".structure").forEach(el => {
  const key = el.dataset.structure;
  el.addEventListener("pointerenter", () => {
    document.querySelectorAll(".structure").forEach(s => s.classList.remove("is-active"));
    el.classList.add("is-active");
    setCallout(key);
  });
  el.addEventListener("focus", () => {
    document.querySelectorAll(".structure").forEach(s => s.classList.remove("is-active"));
    el.classList.add("is-active");
    setCallout(key);
  });
  el.addEventListener("click", () => setCallout(key));
});

function svgPointFromEvent(evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function moveLens(evt) {
  if (!svg || !lensClipCircle) return;
  const p = svgPointFromEvent(evt);
  lensClipCircle.setAttribute("cx", p.x);
  lensClipCircle.setAttribute("cy", p.y);
  lensRing.setAttribute("cx", p.x);
  lensRing.setAttribute("cy", p.y);
  lensDot.setAttribute("cx", p.x);
  lensDot.setAttribute("cy", p.y);
  lensRing.style.opacity = "1";
  lensDot.style.opacity = "1";
}

function hideLens() {
  lensRing.style.opacity = "0";
  lensDot.style.opacity = "0";
  lensClipCircle.setAttribute("cx", -200);
  lensClipCircle.setAttribute("cy", -200);
}

stage?.addEventListener("pointermove", moveLens);
stage?.addEventListener("pointerleave", hideLens);

card?.addEventListener("pointermove", e => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = card.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5;
  const y = (e.clientY - r.top) / r.height - .5;
  card.style.setProperty("--tilt-y", `${x * 4.5}deg`);
  card.style.setProperty("--tilt-x", `${y * -3.7}deg`);
});
card?.addEventListener("pointerleave", () => {
  card.style.setProperty("--tilt-y", "0deg");
  card.style.setProperty("--tilt-x", "0deg");
});

/* Cursor-responsive particle field */
const particleField = document.querySelector(".particle-field");
const particlePalette = [
  "rgba(0,45,114,.22)",
  "rgba(104,172,229,.35)",
  "rgba(77,159,152,.28)",
  "rgba(223,129,107,.25)"
];

const particles = [];
if (particleField) {
  const seeded = [
    [8,14,7],[18,5,4],[29,17,5],[40,7,3],[58,11,6],[73,4,4],[89,17,5],
    [95,31,3],[83,37,6],[69,28,3],[54,33,5],[37,29,4],[21,35,6],[7,42,4],
    [14,59,4],[28,51,3],[43,62,6],[61,49,5],[76,58,4],[92,53,6],[86,72,3],
    [70,69,5],[54,78,4],[38,72,3],[20,80,6],[5,72,3],[13,92,5],[31,88,4],
    [49,94,6],[67,87,3],[82,94,5],[96,83,4]
  ];
  seeded.forEach((p, i) => {
    const dot = document.createElement("span");
    dot.className = "particle";
    dot.style.left = `${p[0]}%`;
    dot.style.top = `${p[1]}%`;
    dot.style.setProperty("--size", `${p[2]}px`);
    dot.style.setProperty("--color", particlePalette[i % particlePalette.length]);
    particleField.appendChild(dot);
    particles.push(dot);
  });
}

document.querySelector(".hero-model-wrap")?.addEventListener("pointermove", e => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = e.currentTarget.getBoundingClientRect();
  particles.forEach(dot => {
    const dr = dot.getBoundingClientRect();
    const dx = (dr.left + dr.width / 2) - e.clientX;
    const dy = (dr.top + dr.height / 2) - e.clientY;
    const dist = Math.max(40, Math.hypot(dx,dy));
    const influence = Math.min(20, 900 / dist);
    dot.style.setProperty("--dx", `${(dx / dist) * influence}px`);
    dot.style.setProperty("--dy", `${(dy / dist) * influence}px`);
  });
});

document.querySelector(".hero-model-wrap")?.addEventListener("pointerleave", () => {
  particles.forEach(dot => {
    dot.style.setProperty("--dx", "0px");
    dot.style.setProperty("--dy", "0px");
  });
});

/* Quiz */
const quizFeedback = document.getElementById("quizFeedback");
document.querySelectorAll(".quiz-choice").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".quiz-choice").forEach(b => b.classList.remove("is-correct","is-wrong"));
    const correct = btn.dataset.choice === "myth";
    btn.classList.add(correct ? "is-correct" : "is-wrong");
    quizFeedback.innerHTML = correct
      ? "<strong>Correct.</strong> Eczema is not contagious. A full lesson can explain what eczema is, how the skin barrier is involved, and why that misconception matters."
      : "<strong>Not quite.</strong> Eczema is not contagious. The point of the knowledge check is to explain the misconception, not just mark it wrong.";
  });
});

/* Ingredient Lab demo */
const labRecords = {
  fragrance: {
    title: "Fragrance",
    description: "A labeling term that may represent a mixture of fragrance ingredients.",
    match: 24,
    noMatch: 61
  },
  lanolin: {
    title: "Lanolin",
    description: "An ingredient derived from wool grease and used in some personal-care formulations.",
    match: 8,
    noMatch: 77
  },
  glycerin: {
    title: "Glycerin",
    description: "A humectant widely used in personal-care formulations to help attract and retain water.",
    match: 52,
    noMatch: 33
  },
  niacinamide: {
    title: "Niacinamide",
    description: "A form of vitamin B3 used in many topical cosmetic and skin-care formulations.",
    match: 19,
    noMatch: 66
  }
};

const labInput = document.getElementById("labSearchInput");
const labButton = document.getElementById("labSearchButton");
const resultTitle = document.getElementById("labResultTitle");
const resultDescription = document.getElementById("labResultDescription");
const matchCount = document.getElementById("matchCount");
const noMatchCount = document.getElementById("noMatchCount");
const watchButton = document.getElementById("watchButton");

function renderLabRecord() {
  const key = labInput.value.trim().toLowerCase();
  const record = labRecords[key] || {
    title: labInput.value.trim() || "Ingredient",
    description: "No demo record is loaded for this term yet. The full Ingredient Lab will search a curated ingredient and product dataset.",
    match: "—",
    noMatch: "—"
  };
  resultTitle.textContent = record.title;
  resultDescription.textContent = record.description;
  matchCount.textContent = record.match;
  noMatchCount.textContent = record.noMatch;
  watchButton.classList.remove("is-watching");
  watchButton.textContent = "+ Add to watchlist";
}

labButton?.addEventListener("click", renderLabRecord);
labInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") renderLabRecord();
});
watchButton?.addEventListener("click", () => {
  const watching = watchButton.classList.toggle("is-watching");
  watchButton.textContent = watching ? "✓ On watchlist" : "+ Add to watchlist";
});

/* Mobile nav */
const menuButton = document.querySelector(".mobile-menu-button");
const mobileNav = document.querySelector(".mobile-nav");
menuButton?.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
});
mobileNav?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    mobileNav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded","false");
  });
});

/* Placeholder future-page links */
const toast = document.getElementById("toast");
let toastTimer;
document.querySelectorAll(".coming-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    clearTimeout(toastTimer);
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  });
});
