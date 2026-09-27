const partInfo = {
  epidermis: ["01", "Epidermis", "The outer layer of the skin. Move through the model to see how the layers connect."],
  dermis: ["02", "Dermis", "The deeper skin layer that contains follicles, glands, vessels, and sensory structures."],
  hypodermis: ["03", "Hypodermis", "A closely associated layer beneath the dermis that contains connective and adipose tissue."],
  hair: ["04", "Hair follicle", "A structure that extends from the epidermis into deeper tissue and anchors hair."],
  sebaceous: ["05", "Sebaceous gland", "A gland commonly associated with a hair follicle that releases sebum."],
  sweat: ["06", "Sweat gland", "A coiled gland in the dermis whose duct reaches the skin surface."],
  vessels: ["07", "Blood vessels", "The dermis is vascularized. Vessels support tissue and help with temperature regulation."],
  nerve: ["08", "Sensory structures", "Nerve fibers and sensory receptors in the skin help detect environmental stimuli."]
};

const heroField = document.getElementById('heroField');
const shell = document.getElementById('skinShell');
const svg = document.getElementById('skinModel');
const lensRing = document.getElementById('lensRing');
const lensCenter = document.getElementById('lensCenter');
const lensClipCircle = document.getElementById('lensClipCircle');
const captionIndex = document.querySelector('.caption-index');
const captionTitle = document.querySelector('.model-caption strong');
const captionText = document.querySelector('.model-caption p');
const parts = [...document.querySelectorAll('.model-part')];

function setCaption(key) {
  const info = partInfo[key];
  if (!info) return;
  captionIndex.textContent = info[0];
  captionTitle.textContent = info[1];
  captionText.textContent = info[2];
}

function svgPoint(evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

parts.forEach(part => {
  part.addEventListener('pointerenter', () => {
    parts.forEach(p => p.classList.remove('is-active'));
    part.classList.add('is-active');
    setCaption(part.dataset.part);
  });
});

svg?.addEventListener('pointermove', evt => {
  const p = svgPoint(evt);
  lensRing.setAttribute('cx', p.x);
  lensRing.setAttribute('cy', p.y);
  lensCenter.setAttribute('cx', p.x);
  lensCenter.setAttribute('cy', p.y);
  lensClipCircle.setAttribute('cx', p.x);
  lensClipCircle.setAttribute('cy', p.y);
  lensRing.style.opacity = '1';
  lensCenter.style.opacity = '1';
});
svg?.addEventListener('pointerleave', () => {
  lensRing.style.opacity = '0';
  lensCenter.style.opacity = '0';
  lensClipCircle.setAttribute('cx', -200);
  lensClipCircle.setAttribute('cy', -200);
  parts.forEach(p => p.classList.remove('is-active'));
});

heroField?.addEventListener('pointermove', evt => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = heroField.getBoundingClientRect();
  const nx = (evt.clientX - r.left) / r.width - .5;
  const ny = (evt.clientY - r.top) / r.height - .5;
  shell.style.setProperty('--ry', `${nx * 5.5}deg`);
  shell.style.setProperty('--rx', `${ny * -4.2}deg`);
});
heroField?.addEventListener('pointerleave', () => {
  shell.style.setProperty('--ry', '0deg');
  shell.style.setProperty('--rx', '0deg');
});

/* Cursor-reactive dot field, inspired by the supplied SGA hero's interactive field. */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let pointer = { x: -9999, y: -9999 };
let dots = [];

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const r = heroField.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(r.width * dpr));
  canvas.height = Math.max(1, Math.round(r.height * dpr));
  canvas.style.width = `${r.width}px`;
  canvas.style.height = `${r.height}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  dots = [];
  const spacing = r.width < 700 ? 25 : 22;
  for (let y = 18; y < r.height; y += spacing) {
    for (let x = 16; x < r.width; x += spacing) {
      const wave = Math.sin((x + y) * .018) * 2.2;
      dots.push({ x, y, bx: x, by: y + wave, dx: 0, dy: 0 });
    }
  }
}

function drawDots() {
  const r = heroField.getBoundingClientRect();
  ctx.clearRect(0,0,r.width,r.height);
  for (const d of dots) {
    let tx = 0, ty = 0;
    const vx = d.bx - pointer.x;
    const vy = d.by - pointer.y;
    const dist = Math.hypot(vx,vy);
    if (dist < 125) {
      const force = (125 - dist) / 125;
      const inv = 1 / Math.max(dist, 1);
      tx = vx * inv * force * 22;
      ty = vy * inv * force * 22;
    }
    d.dx += (tx - d.dx) * .12;
    d.dy += (ty - d.dy) * .12;
    const x = d.bx + d.dx;
    const y = d.by + d.dy;
    const local = Math.sin((d.bx + d.by) * .013) * .5 + .5;
    ctx.beginPath();
    ctx.arc(x,y,local > .65 ? 1.7 : 1.15,0,Math.PI*2);
    ctx.fillStyle = local > .72 ? 'rgba(0,45,114,.30)' : 'rgba(0,45,114,.16)';
    ctx.fill();
  }
  requestAnimationFrame(drawDots);
}

heroField?.addEventListener('pointermove', evt => {
  const r = heroField.getBoundingClientRect();
  pointer.x = evt.clientX - r.left;
  pointer.y = evt.clientY - r.top;
});
heroField?.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawDots();

/* Mobile menu */
const menuButton = document.getElementById('menuButton');
const mobileNav = document.getElementById('mobileNav');
menuButton?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded','false');
}));

/* Contact placeholder so the page does not ship with a fake email. */
const contactButton = document.getElementById('contactButton');
const contactPlaceholder = document.getElementById('contactPlaceholder');
contactButton?.addEventListener('click', () => {
  contactPlaceholder.textContent = "Before publishing, replace this button with the Dermatology Collective's official email or contact form.";
  contactPlaceholder.style.color = '#ffffff';
});
