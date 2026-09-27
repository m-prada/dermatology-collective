# Dermatology Collective Homepage

A dependency-free homepage prototype for the Johns Hopkins Dermatology Collective.

## What is included

- JHU-inspired editorial homepage aesthetic based on the provided `jhusga-main` repository
- Interactive cursor-responsive skin cross-section
- Magnifying "micro-detail" lens
- Hover/focus anatomy callouts
- Cursor-reactive particle field and subtle 3D tilt
- Featured-learning section
- Functional myth/fact knowledge check
- Functional Ingredient Lab demo search
- Watchlist interaction
- Formulation Tracker preview
- Evidence/methodology section
- Dermatology Collective + contact section
- Mobile navigation
- Reduced-motion accessibility support

## Anatomy reference

The original SVG illustration was drawn specifically for this prototype and is *not* copied from OpenStax.
Its structure is informed by:

OpenStax, Anatomy & Physiology 2e:
- 5.1 Layers of the Skin
- 5.2 Accessory Structures of the Skin

The model includes a simplified epidermis, dermis, hypodermis, hair follicle,
sebaceous gland, eccrine sweat gland, vessels, and sensory structures.

## Files

- `index.html`
- `styles.css`
- `script.js`

No build step or dependencies are required.

## View locally

### Easiest
Double-click `index.html`.

### Better local preview
From this folder:

```bash
python -m http.server 8000
```

Then visit:

`http://localhost:8000`

## Publish with GitHub Pages

1. Create a GitHub repository, for example `dermatology-collective`.
2. Upload `index.html`, `styles.css`, and `script.js` to the repository root.
3. Commit the files.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Choose branch `main` and folder `/ (root)`.
7. Click **Save**.
8. GitHub will show your public `github.io` URL after deployment.

## Before public launch

- Replace the placeholder contact email in `index.html`.
- Build real Learn / Ingredient Lab pages before removing "coming next" placeholders.
- Use only medically reviewed, properly sourced educational claims.
- Do not republish proprietary AAD worksheets/slides without permission.
- Replace demo Ingredient Lab counts with real verified data.
