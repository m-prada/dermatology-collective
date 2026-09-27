# Dermatology Collective Homepage

This is a **homepage-only** static site for the Johns Hopkins Dermatology Collective.

It intentionally does **not** create Learn, Ingredient Lab, Derm Challenge, Tools, or About pages yet.

## Design basis

The visual system was rebuilt after reviewing the supplied JHU SGA repository, especially:

- `app/page.tsx`
- `app/home.module.css`
- `app/(components)/Header.tsx`
- `app/(components)/Header.module.css`
- `app/(components)/BlueJayAsciiVideo.tsx`

The homepage borrows the SGA site's high-level design language:

- Source Serif 4 + Work Sans
- Hopkins blue
- large editorial hero typography
- section numbering
- thin divider rules
- restrained uppercase labels
- interactive hero field
- understated arrow motion

The dermatology illustration and cursor interactions are original.

## Anatomy reference

The hero model is an original simplified SVG whose structure is informed by OpenStax Anatomy & Physiology 2e, Section 5.1, "Layers of the Skin."

https://openstax.org/books/anatomy-and-physiology-2e/pages/5-1-layers-of-the-skin

## Files

- `index.html`
- `styles.css`
- `script.js`

No package install or build step is required.

## Replace the current GitHub Pages site

In your `dermatology-collective` GitHub repository, replace the existing:

- `index.html`
- `styles.css`
- `script.js`

with the versions in this folder.

Keep `index.html` at the repository root.

GitHub Pages can stay configured as:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

After committing the replacements, GitHub Pages will redeploy automatically.

## Important before public launch

The contact button intentionally does not use a guessed club email. Replace it with the official Dermatology Collective email or form when you have it.
