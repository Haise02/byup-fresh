# byup — Monorepo applicazioni

Hub unico che raccoglie tutte le applicazioni dell'ecosistema **byup**, servite come
sito statico (HTML + React via Babel-standalone, **no build step**) su Vercel.

> ## ⚠️ Che cosa è questo repo, e che cosa non è
>
> **Questo è un prototipo, e ha uno scopo solo: mostrare la UX e la UI.**
> Serve a far vedere come si presentano e come si usano le schermate — quali
> informazioni compaiono, in che ordine, con quali comandi. Niente di più.
>
> **Non descrive come il prodotto è fatto dentro.** I dati sono finti e vivono in
> memoria: niente si salva, niente si autentica davvero, niente parla con un
> backend. Le logiche che qui sembrano funzionare — calcoli, stati, controlli —
> sono scritte per rendere le schermate credibili mentre le si guarda, non per
> essere il modello del sistema. **Non vanno lette come specifica** e non vanno
> trasportate: chi implementa parte dai documenti, non da questo codice.
>
> **Dove sta il progetto vero:**
>
> | Cosa cerchi | Documento |
> |---|---|
> | Il *perché*: visione, modello di ricavo, requisiti | [app/Contesto-App.md](app/Contesto-App.md) |
> | I **flussi** — i tre percorsi d'ordine, pagamento e divisione, recupero ordine | [app/Contesto-App.md §G](app/Contesto-App.md) e i suoi documenti di dettaglio ([Pagamenti-Divisione](app/Pagamenti-Divisione.md), [Recupero-Ordine](app/Recupero-Ordine.md)) |
> | L'**architettura tecnica** e le scelte di backend | [backend/BACKEND.md](backend/BACKEND.md) e [app/Contesto-App.md §E](app/Contesto-App.md) |
> | Le forme dati in ingresso e in uscita | [app/Contratto-Dati.md](app/Contratto-Dati.md) |
> | L'indice completo della documentazione | [app/README.md](app/README.md) |
>
> Se un dettaglio del prototipo e un documento sono in disaccordo, **vince il
> documento**: il prototipo si riscrive, le scelte di prodotto no.

La **homepage** (`index.html`) è una console che linka a ogni applicazione; dalle app
si torna alla home con il pulsante fluttuante in basso a sinistra (byup App non lo ha).

## Struttura

| Cartella       | Applicazione      | Entry                       | Per chi        | Documentazione |
|----------------|-------------------|-----------------------------|----------------|----------------|
| `gestionale/`  | byup Gestionale   | `byup Login.html`           | Ristoratore    | [README](gestionale/README.md) · [scelte di design](gestionale/DESIGN_DECISIONS.md) |
| `app/`         | byup App          | `byup Home.html`            | Consumer       | [indice dei documenti](app/README.md) |
| `web/`         | byup Web          | `index.html`                | Consumer       | [contesto](web/Contesto-WebApp.md) |
| `staff/`       | byup Staff        | `index.html`                | Staff (incassi)| [contesto](staff/Contesto.md) |
| `cameriere/`   | byup Cameriere    | `cameriereweb.html`         | Staff (sala)   | — |
| `spot/`        | Hubble (ex byup Spot) | `byup-spot.html`            | Interno        | [README](spot/README.md) · [riesame accessi](spot/Riesame-Accessi.md) |
| `backend/`     | API (NestJS)      | servizio Node separato      | —              | [BACKEND.md](backend/BACKEND.md) |

## Stato della documentazione

Allineamento fatto il **2026-08-09** rileggendo il codice, non i documenti. Cosa
vale e cosa no:

| Documento | Stato |
|---|---|
| `gestionale/PROGRESS.md` | ✅ **Da leggere per primo.** Registro delle sessioni riscritto e portato al 9 ago; le sezioni backend (2–8) fotografano il 30 maggio e da allora il backend non è stato toccato |
| `gestionale/DESIGN_DECISIONS.md` | ✅ Allineato, con una sezione datata per ogni batch. In caso di dubbio vincono i token `PN` nel codice |
| `gestionale/README.md` · `spot/README.md` · `app/README.md` | ✅ Verificati riga per riga contro il codice |
| `gestionale/CLAUDE.md` | ✅ Listino e livelli di supporto ricontrollati contro `account-data.jsx` |
| `app/*.md` (prodotto), `web/*.md`, `staff/*.md`, `backend/BACKEND.md` | ✅ Reggono: sono documenti di **prodotto e architettura**, e il prodotto non è cambiato. Le poche divergenze trovate (Byup Games rimosso, carrello che si trascina) sono state corrette |
| `gestionale/icon*.md`, `dashboard-icon-mapping.md` | 🕰 **Documenti storici** della migrazione icone di luglio. Marcati come tali: per sapere quali icone esistono si legge il codice |
| `backend/erd/` | ✅ Modello dati: ERD v0.7 in DBML, riferimento agli enum, PDF di progettazione. Stavano dentro il progetto Vue, ora cancellato, e non c'entravano niente con lui |

Regola generale, valida sempre: **quando un documento e il codice divergono su
come è fatto il prototipo, vince il codice**; quando divergono su *cosa deve
fare il prodotto*, vince il documento.

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
- **Il cache-buster `?v=N`** lo usano `spot/byup-spot.html`, `staff/index.html` e
  quattro pagine del gestionale (`byup Impostazioni.html`, `byup Statistiche.html`,
  `byup Contabilita.html`, `byup Cucina KDS v2.html`), su alcuni `.jsx` e non su
  tutti. Va incrementato a mano quando si modifica uno di quei file: senza, il
  browser serve la versione vecchia e sembra che la modifica non abbia avuto
  effetto. Serve però **solo aprendo i file in locale** — da `file://` o da un
  `python -m http.server`, che non mandano header di cache. Su Vercel non serve:
  `vercel.json` manda `max-age=0, must-revalidate` su `.jsx` e `.html`, quindi un
  reload normale basta sempre.
- **Se una modifica «non si vede»**, la prima cosa da guardare è `git status`, non
  la cache: il sito serve l'ultimo commit su `main`, quindi finché una modifica
  resta nel working tree non esiste per chi guarda il sito.
- **Prima di un rilascio**: `grep -rn "data-demo-only" spot/` — marca le affordance
  che esistono solo per la demo e non devono finire in produzione. **Oggi non ce n'è
  nessuna** (l'unico riscontro è lo stesso comando scritto in `spot/README.md`): l'ultima era il
  "simula manomissione" del riesame accessi, sparito insieme alla catena di impronte
  che dimostrava (vedi [spot/Riesame-Accessi.md](spot/Riesame-Accessi.md)). Il
  controllo resta perché la prossima ci sarà.
