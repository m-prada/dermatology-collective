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
