'use strict';
const siteHeader = document.getElementById('siteHeader');
const siteMenuButton = document.getElementById('menuButton');
const siteMobileNav = document.getElementById('mobileNav');
if (siteHeader && siteMenuButton && siteMobileNav) {
  const closeMenu = (returnFocus = false) => {
    siteMobileNav.classList.remove('open');
    siteMenuButton.setAttribute('aria-expanded', 'false');
    siteMenuButton.setAttribute('aria-label', 'Open menu');
    if (returnFocus) siteMenuButton.focus();
  };
  siteMenuButton.addEventListener('click', () => {
    const isOpen = siteMobileNav.classList.toggle('open');
    siteMenuButton.setAttribute('aria-expanded', String(isOpen));
    siteMenuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
  siteMobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && siteMobileNav.classList.contains('open')) closeMenu(true); });
  document.addEventListener('click', event => { if (!siteHeader.contains(event.target)) closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 940) closeMenu(); });
}
