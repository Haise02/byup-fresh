# Hubble — la console interna di byup

Entry: [byup-spot.html](byup-spot.html). Per chi: il team di byup.

> **È un prototipo di UX/UI.** Vale quanto scritto nel
> [README della monorepo](../README.md): i dati sono finti, niente si salva, e le
> logiche che sembrano funzionare servono a rendere le schermate credibili — non
> sono la specifica del sistema. Per l'architettura e i flussi si parte dai
> documenti, non da questo codice.

*Contenuto verificato contro il codice il 2026-08-14.*

---

## Il nome

La console si chiamava **byup Spot**. Dal 2026-08-14 si chiama **Hubble**, con
un marchio proprio (gradiente rosa → magenta → viola). **La cartella e il file
di ingresso NON sono stati rinominati**: restano `spot/` e `byup-spot.html`.
È una scelta: rinominarli avrebbe rotto i link da `index.html`, gli URL di
Vercel già in giro e la leggibilità di ogni diff futuro, in cambio di niente
che si veda a schermo. Se un giorno il rename servirà davvero, si fa in un
commit dedicato che non contiene altro.

Gli asset del marchio sono `hubble.png` (lockup a colori), `hubble-mark.png`
(solo il marchio, per la barra compressa) e `hubble-badge.png` (versione
negativa su rettangolo).

---

## Le sezioni

La barra è tornata a parlare solo del lavoro di tutti i giorni: la governance
è passata nel menu del profilo. Le voci con delle sotto-sezioni le mostrano in
un pannello che si apre passandoci sopra col mouse.

| Sezione | Cosa contiene |
|---|---|
| **Dashboard** | La panoramica trasversale: che cosa chiede una decisione oggi, il team IA, gli elenchi più popolati, le ultime campagne, i workflow al lavoro, la rubrica per ciclo di vita, i consensi |
| **Analisi Dati** | Sette tab: Generale, Locali, Valore per il locale, Utenti App, Staff, Servizio Clienti, Mercato |
| **Contatti** → | **Contatti** (la rubrica), **Elenchi** (segmenti attivi e liste statiche), **Proprietà** |
| **Marketing** → | **Mail**, **SMS**, **Push**, **Form**, **Campagne di acquisizione** |
| **Workflow** | Le automazioni, comprese quelle nate insieme a un form |
| **Agent** | Agenti IA sui dati della piattaforma e cruscotto del team |
| **Assistenza** | Quattro tab: Chiamate, Ticket, FAQ, Guide |

Nel **menu del profilo** (card in fondo alla barra): Il mio profilo, Domini e
mittenti, Proprietà, **Sicurezza e sistemi**, **Piattaforma**.

---

## Il motore del CRM

Sta tutto in [hub-data.jsx](hub-data.jsx) e non disegna niente: dice **di che
cosa si parla**.

- `HUB_PROPRIETA` — il catalogo delle proprietà di un contatto, raggruppate.
  Ogni proprietà ha un `tipo` (`testo`, `elenco`, `multi`, `data`, `numero`,
  `valuta`, `bool`) e, se può comparire in tabella, una `colonna`.
- `HUB_OPERATORI` — quali domande si possono fare su ciascun tipo. Il `tipo`
  della proprietà decide gli operatori; l'operatore decide che cosa chiedere a
  chi filtra (`arg`: niente, un testo, una data, delle spunte, un intervallo).
- `hubValuta` / `hubApplica` — la valutazione. Un filtro è `{prop, op, valore}`.

**Un solo motore, quattro schermate**: i filtri della rubrica, i criteri di un
elenco attivo, il pubblico di una campagna e le condizioni di un workflow sono
lo stesso oggetto. Aggiungere una proprietà a `HUB_PROPRIETA` la fa comparire
da sola in «Modifica colonne», nel pannello dei filtri, fra le destinazioni dei
campi di un form e fra le cose che un workflow può scrivere: **non c'è niente
da abilitare altrove**.

Le proprietà di marketing dei mock (referral, canale, consensi, interessi…) le
deriva `hubArricchisci`, stabili sull'id: una rubrica che cambia valori a ogni
ricarica non si può né leggere né filtrare.

---

## I file

| File | Cosa c'è dentro |
|---|---|
| `admin-tokens.jsx` | La palette. Il marchio è un gradiente a tre colori: **rosa** `#FF1F5A` (accento d'azione), **magenta** `#ED1999` (marketing), **viola** `#D410F1` (workflow e agenti). I colori semantici — verde, ambra, rosso, blu, teal — **non si toccano**: lì il colore significa stato |
| `admin-icons.jsx` | Icone di contorno (`ICON_PATHS`) e piene per la barra (`ICON_FILLED`). Le piene accettano anche `rect:` e `circle:`; i **fori** vanno fatti con `evenodd` dentro lo **stesso** `path` |
| `hub-data.jsx` | Proprietà, operatori, motore dei filtri, e i mock di elenchi, mail, SMS, push, form, workflow, agenti, domini |
| `hub-ui.jsx` | Modale, pannello laterale, pannello dei filtri, modale delle colonne, tabella, testate, riquadri |
| `hub-panoramica.jsx` | La Dashboard |
| `hub-elenchi.jsx` | Elenchi: lista, dettaglio, creazione con conteggio dal vivo |
| `hub-mail-builder.jsx` | Il costruttore visuale delle email e il generatore di HTML |
| `hub-marketing.jsx` | Mail, SMS, Push, Form |
| `hub-workflow.jsx` | Workflow (canvas) e Agent |
| `hub-impostazioni.jsx` | Domini e mittenti, catalogo delle proprietà |
| `admin-contatti.jsx` | La rubrica |
| `admin-*.jsx` | Le sezioni preesistenti |

### Il costruttore delle email

Il documento è una **lista di blocchi**, non HTML modificato a mano; l'HTML lo
genera `mbHtml()` quando serve, ed è HTML da email vera: **tabelle**, stili in
linea, larghezza fissa a 600px. Le mail non si renderizzano in un browser
moderno, si renderizzano in Outlook — un builder che produce `<div>` con
flexbox fa anteprime bellissime e mail rotte.

---

## Ruoli e permessi

Cinque ruoli su nove aree. La matrice sta in **Sicurezza e sistemi → Accessi**;
i dati in [admin-data.jsx](admin-data.jsx) (`RUOLI`, `PERMESSI`).

| Ruolo | Accede a |
|---|---|
| **Super Admin** | tutto |
| **Support** | dashboard, locali, utenti, ticket, chiamate e knowledge base, certificazioni |
| **Marketing** | dashboard, messaggi |
| **ICT** | dashboard, Sicurezza e sistemi |
| **Viewer** | dashboard |

Una scelta deliberata: **le impostazioni della piattaforma restano al solo Super
Admin** — sono leve commerciali (prezzi, piani, soglie), e ICT amministra i
sistemi ma non decide quanto costa un piano.

---

## Com'è fatto

Nessun build step: `.jsx` serviti come `text/babel` e compilati nel browser.
I componenti si espongono su `window`; **l'ordine dei tag `<script>` in
[byup-spot.html](byup-spot.html) conta** — `hub-data.jsx` va dopo
`admin-data.jsx`, `hub-ui.jsx` dopo `admin-atoms.jsx`, e `admin-app.jsx`
per ultimo.

**Il cache-buster `?v=N` va incrementato a ogni modifica di un `.jsx`**, altrimenti
il browser serve la versione vecchia e sembra che la modifica non abbia avuto
effetto.

Il frame è fisso a 1440×900 con uno `zoom` applicato via JS. Tre conseguenze
che mordono:

- le unità `vh` dentro il frame vengono scalate una seconda volta e sfondano;
- `getBoundingClientRect()` restituisce pixel **visivi**, mentre `maxHeight` li
  vuole di **layout**: per fissare l'altezza di N righe si misura col rect e si
  **divide per lo zoom**;
- vale anche per i pannelli in `position: fixed` posizionati a partire da un
  rect — è quello che fa `apriFly` in [admin-app.jsx](admin-app.jsx).

---

## Prima di un rilascio

```
grep -rn "data-demo-only" spot/
```

Marca le affordance che esistono solo per la demo e **non devono finire in
produzione**. Oggi non ce n'è nessuna.
