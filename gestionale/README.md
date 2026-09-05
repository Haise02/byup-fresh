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
- `byup Cucina.html` — kitchen monitor. In testata si sceglie **quale monitor**
  guardare, non come guardarlo: la visualizzazione è del monitor e si decide
  dove lo si collega (Impostazioni → Personale). Un monitor «Ristorante» mostra
  i ticket a colonne (`cucina-ticket.jsx`, `cucina-tab-insala.jsx`); un monitor
  «Pub» mostra la **board del KDS v2** (`cucina-kds2-board.jsx`), alimentata dal
  servizio vero attraverso `cucina-kds2-da-cucina.jsx`, che converte i ticket in
  porzioni — un file solo, che sparirà insieme ai mock quando arriverà l'API
- `byup Cucina KDS v2.html` — la stessa board come **route autonoma**, con i
  propri dati finti da hamburgeria (`cucina-kds2-mock.jsx`, `cucina-kds2-data.jsx`
  regole, `cucina-kds2-app.jsx` montaggio): serve a guardare il KDS v2 da solo,
  a schermo fisso, senza passare dalla Cucina
- `byup Statistiche.html` — tre schede: **Economici** (Ricavi e costi · Vendite
  piatti), **Operazioni** (Prenotazioni · Ordini · Team), **Clienti**
  (Conversione · Fidelizzazione). Deep-link `?tab=…&sub=…`
- `byup Contabilita.html` (`?tab=cassa|conti|costi|iva|export`),
  `byup Impostazioni.html` (`?page=vetrina|menu-cucina|sala|personale|flussi|fiscali|integrazioni`),
  `byup Profilo.html` (pagina Account), `byup Supporto.html` (`?chat=1` apre la chat)
- `mockup-incassa-contanti.html` — mockup statico fuori dal flusso, non linkato

> Il 2026-07-28 sono state rimosse da questa cartella le copie mai linkate delle
> altre superfici — `byup Home.html`, `byup Menu.html` (demo Byup App consumer),
> `byup Staff.html` (app cameriere) e i `.jsx` relativi. Le versioni vive stanno
> in `app/` (consumer) e `cameriere/` (cameriere web).

## Deploy Vercel

Push del repo → Vercel deploy automatico (static, no build). `vercel.json`
(nella root del repo) configura content-type `text/babel` per i `.jsx` così
Babel-standalone li compila correttamente al fetch, e manda `must-revalidate`
su `.jsx` e `.html`. `index.html` redirige a Login.

**Quello che vedi in locale non è quello che vede chi guarda il sito**: il sito
serve l'ultimo commit su `main`, quindi una modifica non è verificabile finché
non è committata e pushata.

### Cache-buster `?v=N`

Quattro pagine caricano alcuni `.jsx` con un `?v=N` scritto a mano —
`byup Impostazioni.html`, `byup Statistiche.html`, `byup Contabilita.html`,
`byup Cucina KDS v2.html`. Serve solo quando si apre il file da `file://` o da
un `python -m http.server`, che non manda header di cache: lì il browser tiene
i `.jsx` e continua a eseguire codice vecchio anche dopo il reload. Su Vercel
non serve, ci pensa `vercel.json`.

## Documentazione

- `PROGRESS.md` — stato dello sviluppo e registro delle sessioni. **Si legge per primo.**
- `DESIGN_DECISIONS.md` — palette, token, regole UX, e una sezione datata per
  ogni batch di lavoro. Allineato al codice il 2026-08-09; in caso di dubbio
  fanno fede i token `PN` in `panoramica-tokens.jsx`.
- `icons-*.md`, `dashboard-icon-mapping.md` — **documenti storici** della
  migrazione icone di luglio: fotografano lo stato di allora, non il codice di oggi.
