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
- Token + design system in `panoramica-tokens.jsx`, `onboarding-icons.jsx`

## Pagine

- `byup Login.html` — pagina login
- `byup Restaurant Onboarding.html` — onboarding ristoratore (4 step)
- `byup Panoramica.html` — dashboard widget (drag/drop + edit mode)
- `byup Configurazione Completa.html` — vetrina + personale post-onboarding
- `byup Sala v3.html` — sala & prenotazioni (mappa + lista)
- `byup Cucina.html` — kitchen monitor (KDS)
- `byup Statistiche.html`, `byup Contabilita.html`, `byup Impostazioni.html`,
  `byup Profilo.html`, `byup Account.html`, `byup Supporto.html`

## Deploy Vercel

Push del repo → Vercel deploy automatico (static, no build). `vercel.json`
configura content-type `text/babel` per i `.jsx` così Babel-standalone li compila
correttamente al fetch. `index.html` redirige a Login.

Vedi `DESIGN_DECISIONS.md` per palette, token, regole UX.
