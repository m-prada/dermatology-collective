# Dermatology Collective

An interactive dermatology education platform created by the **Dermatology Collective at Johns Hopkins University**.

The project is designed to make dermatology easier to explore by connecting skin biology, common conditions, product ingredients, formulation changes, and evidence in one cohesive learning experience.

## About the Project

Dermatology information is often spread across anatomy diagrams, condition pages, product labels, and ingredient databases. This platform brings those pieces together into a more visual and interactive format.

The website currently includes four main areas:

- **Home**  
  Introduces the platform, its educational philosophy, and the Dermatology Collective.

- **Learn**  
  Interactive dermatology education covering skin anatomy, skin function, common conditions, prevention, and skin health.

- **Ingredient Lab**  
  A searchable interface for exploring ingredients, product records, ingredient roles, watchlists, and label information.

- **Formulation Watcher**  
  A tool for comparing documented product formulations over time and identifying ingredients that were added, removed, or remained unchanged.

## Project Goals

The platform is built around several principles:

- make dermatology education visual and interactive
- connect anatomy and physiology to real-world skin health
- make sources and review information visible
- explain product ingredients without assigning misleading safety scores
- show formulation changes transparently
- create educational tools that are approachable for patients, students, and the broader community

## Current Features

### Interactive Learning

The Learn section combines educational lessons with:

- interactive anatomy
- mechanism-based visual explanations
- knowledge checks
- condition-focused modules
- supporting educational resources

### Ingredient Lab

The Ingredient Lab prototype currently supports:

- ingredient and product search
- ingredient detail pages
- product ingredient records
- ingredient watchlists
- pasted ingredient-list parsing
- product comparison
- source and verification information

### Formulation Watcher

The Formulation Watcher currently supports:

- product search
- formulation version timelines
- side-by-side version comparison
- added ingredient detection
- removed ingredient detection
- unchanged ingredient tracking
- product watchlists
- formulation source information

## Evidence and Transparency

Educational and product information is intended to display its source and review context whenever possible.

Product formulations can change over time. Ingredient records should therefore be interpreted in the context of their listed source, market, and verification date. Users should also verify the ingredient list on the physical product they are currently using.

This website is intended for **education only** and is not a substitute for individualized medical advice, diagnosis, or treatment.

## Technology

The website is currently built with:

- HTML
- CSS
- JavaScript
- SVG-based scientific illustrations
- browser `localStorage` for selected interactive features
- GitHub Pages for hosting

The current architecture is intentionally lightweight and does not require a backend for the initial version.

## Repository Structure

```text
index.html
learn.html
ingredient-lab.html
formulation-watcher.html
README.md

## Product data, attribution, and limitations

The static snapshot under `data/` currently contains **398 product records**, **2,290 distinct exact-label ingredient records**, **0 manufacturer-verified product records**, and **0 products with documented formulation histories**. Imported September 27, 2026. This is a selected subset, not a complete catalog. It includes products from several markets; a community United States country tag does not establish a United States formulation. Product search does not imply that a product is currently sold or that its ingredients are current.

Product facts and ingredient label strings: [Open Beauty Facts](https://world.openbeautyfacts.org/), contributed by its community, licensed under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/). Keep this attribution and the source link with any reuse of the database. If you publish an adapted database, check and follow ODbL share-alike requirements. No product images are used. Ingredient records link to the [European Commission CosIng](https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en) lookup as a reference, not as evidence that each imported spelling or role has been checked there. No paid ingredient database was imported.

**Provenance:** `community` means imported from Open Beauty Facts and not independently verified. `verified` is reserved for a complete list checked against a dated manufacturer source for a specified market. `historical` requires a separately dated, attributable formulation source. Currently no record has been assigned either of the latter two statuses. An Open Beauty Facts edit alone does not demonstrate a reformulation. The Formulation Watcher honestly shows no timeline until two independently attributable dated lists have been reviewed.

**Data layout:** `products.json` stores barcodes, complete source ingredient text, ordered label terms, aligned exact-match ingredient IDs, market tags, source URL and dates. `ingredients.json` stores canonical label terms and only a few editorial descriptions of common roles; unknown identifiers and roles remain `null`. `aliases.json` maps exact lowercased names or a small explicitly reviewed synonym set to IDs. `formulations.json` is an empty history array pending source review. `sources.json` describes provenance and licensing. The site fetches the JSON files at runtime and requires a web server (including GitHub Pages), rather than opening the HTML via `file://`.

**Updating:** Run `python scripts/import_obf.py` at the repository root to rebuild a candidate snapshot, review changes and market labels manually, then run `python scripts/check_data.py`. Reimport replaces product and ingredient snapshots, so review watchlist ID continuity and any independently reviewed metadata before publishing. Recheck manufacturer labels against dated source materials to mark verified records. Add formulation history only after capturing two attributable dated ingredient lists for the same product and market, each with source URL and access date. Never convert inferred Open Beauty Facts ingredient taxonomy or revision timestamps into proof of a formulation change.

**Data quality:** The current automated check finds no duplicate barcode or record IDs, missing product names or ingredient text, malformed aligned ingredient arrays, duplicate alias IDs, or malformed source URL formats. It checks URL shapes, not whether source pages remain online. The initial importer rejects incomplete entries, preserves raw label text, and leaves unmatched tokens without an ingredient ID. Manual review remains necessary for OCR errors, language and market differences, label punctuation, role descriptions, duplicate products under different barcodes, and source link availability. A label term match does not establish chemical identity in ambiguous cases. Ingredient roles are broad editorial context, not product effectiveness or safety assessments.
