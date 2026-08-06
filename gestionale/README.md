# Byup Fresh — Prototipo gestionale

Prototipo HTML + React (via Babel-standalone, no build) del gestionale Byup Fresh
per la ristorazione.

## Demo

- Entry: `index.html` → redirect a `byup Login.html`
- Login demo: **`admin / admin`**
- Flow: Login → Onboarding ristoratore → Panoramica / Configurazione completa

## Stack

- HTML + JSX (Babel standalone, compilato nel browser, no build step)
- React 18 UMD via unpkg
- CSS-in-JS inline (no Tailwind, no styled-components)
- Token + design system in `panoramica-tokens.jsx` (sistema `PN`, sorgente viva)
  e `onboarding-icons.jsx` (`ONB`, onboarding); i token legacy `BU`
  (`byup-tokens.jsx`) sono stati rimossi il 2026-07-28

## Pagine

- `byup Login.html` — pagina login
- `byup Restaurant Onboarding.html` — onboarding ristoratore (4 step)
- `byup Panoramica.html` — dashboard widget (drag/drop + edit mode)
- `byup Configurazione Completa.html` — vetrina + personale post-onboarding
- `byup Sala.html` — sala & prenotazioni (mappa + lista; `?tab=tavoli|vendita|calendar`)
- `byup Cucina.html` — kitchen monitor (KDS)
- `byup Statistiche.html`, `byup Contabilita.html`, `byup Impostazioni.html`,
  `byup Profilo.html` (pagina Account), `byup Supporto.html`

## Assistente IA fluttuante

`byup-ai-fab.jsx` è un widget che **si monta da solo**: alle pagine serve solo
il tag `<script>` in fondo, dopo l'app. Si aggancia dentro `.frame` (non al
`body`: il frame ha uno `zoom` che scala tutta la UI) e mostra un bollino
trascinabile che apre una chat con l'assistente. La posizione scelta vale su
tutte le schermate — `localStorage`, chiave `byup.ai.fab.pos`.

È caricato dalle sette schermate della console: Panoramica, Sala, Cucina,
Statistiche, Contabilita, Impostazioni, Profilo. **Non** dal Supporto, dove
l'angolo è già della chat dell'assistenza, né da Login, Restaurant Onboarding
e Configurazione Completa. La mascotte è `byuppino-wave.png`, copia
ridimensionata di `app/assets/mascot-wave.png`.

> Il 2026-07-28 sono state rimosse da questa cartella le copie mai linkate delle
> altre superfici — `byup Home.html`, `byup Menu.html` (demo Byup App consumer),
> `byup Staff.html` (app cameriere) e i `.jsx` relativi. Le versioni vive stanno
> in `app/` (consumer) e `cameriere/` (cameriere web).

## Deploy Vercel

Push del repo → Vercel deploy automatico (static, no build). `vercel.json`
(nella root del repo) configura content-type `text/babel` per i `.jsx` così
Babel-standalone li compila correttamente al fetch. `index.html` redirige a Login.

Vedi `DESIGN_DECISIONS.md` per palette, token, regole UX (nota: stantio sui
pesi dei font — fanno fede i token `PN` in `panoramica-tokens.jsx`).
