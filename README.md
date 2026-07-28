# byup — Monorepo applicazioni

Hub unico che raccoglie tutte le applicazioni dell'ecosistema **byup**, servite come
sito statico (HTML + React via Babel-standalone, **no build step**) su Vercel.

La **homepage** (`index.html`) è una console che linka a ogni applicazione; dalle app
si torna alla home con il pulsante fluttuante in basso a sinistra (byup App non lo ha).

## Struttura

| Cartella       | Applicazione      | Entry                       | Per chi        |
|----------------|-------------------|-----------------------------|----------------|
| `gestionale/`  | byup Gestionale   | `byup Login.html`           | Ristoratore    |
| `app/`         | byup App          | `byup Home.html`            | Consumer       |
| `web/`         | byup Web          | `index.html`                | Consumer       |
| `staff/`       | byup Staff        | `index.html`                | Staff (incassi)|
| `cameriere/`   | byup Cameriere    | `cameriereweb.html`         | Staff (sala)   |
| `spot/`        | byup Spot         | `byup-spot.html`            | Admin          |
| `backend/`     | API (NestJS)      | servizio Node separato      | —              |

## Deploy

- Hosting statico su **Vercel**, collegato a questo repo (push su `main` = deploy).
- `vercel.json` serve i file `.jsx` come `text/babel` (necessario per Babel-standalone)
  su tutte le cartelle.
- Nessuna build: i file vengono serviti così come sono.

## Note

- Ogni app è autonoma: HTML di entry + file `.jsx` caricati via `<script type="text/babel">`.
- La navigazione interna di ogni app usa percorsi **relativi**, quindi ognuna vive
  indipendentemente nella propria cartella.
- `assets/` contiene icone e loghi condivisi (favicon, apple-touch icon, logo completo).
- `byup_SaldaConto_redesign.html` (in root) è un mockup standalone del redesign della
  schermata "Salda conto".
