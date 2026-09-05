# Byup Staff — prototipo

Byup Staff è l'App Staff di incasso: incassa con Tap to Pay, su iPhone e
Android, con Stripe Terminal. Il nome del prodotto è «Byup Staff»; «POS» qui è
solo il ruolo del dispositivo, e i simboli `pos-` / `POSApp` nel codice sono un
residuo storico da non esporre. Come funziona il prodotto sta nei documenti di
riferimento fuori dal repo ([DOCUMENTI.md](../DOCUMENTI.md)): DPT 5.1 (incasso
in presenza), 6.11 e 8.2 (coda, blocco del conto, ricevuta, giornata), 8.3
(rimborsi), 12.3 e 12.7 (dispositivo e disattivazione), 14.1 (accesso e sblocco
biometrico); SFA 2.1, 5.4, 6.1, 6.8, 7.4, 9, 16.1, 17.2. Il 5 settembre 2026
(P-162) il contesto e la specifica del backend che vivevano qui sono usciti dopo
l'estrazione.

## Stack e struttura

Prototipo statico senza build: React 18 via CDN, JSX compilato nel browser con
Babel Standalone, stato tutto in memoria (si azzera al reload), nessun
`localStorage` né backend. Cache-busting a mano: i tag `<script src="…jsx?v=N">`
in `index.html` vanno incrementati a ogni modifica.

L'app reale è nativa, in React Native, perché è l'unico SDK cross-platform che
Stripe supporta per il Tap to Pay; Flutter non ha un SDK Terminal ufficiale. La
cornice iPhone e gli alert in stile iOS del mock sono illustrativi di una sola
piattaforma: i dialoghi di sistema e l'overlay di lettura della carta li
fornisce il sistema operativo, e la schermata `tap` è illustrativa.

| File | Ruolo |
|------|-------|
| `index.html` | Mount dentro la cornice iPhone; carica gli script |
| `ios-frame.jsx` | Cornice del dispositivo (`IOSDevice`) |
| `pos-tokens.jsx` | Token `ST`, ereditati dai token `PN` del gestionale (`../gestionale/panoramica-tokens.jsx`, caricato prima), icone `I`, atomi `Btn`, `Chip`, `Logo`, helper `eur`, `txConfig` |
| `pos-data.jsx` | Dati mock: esercente, coda di incasso, transazioni |
| `pos-app.jsx` | Shell, stack di navigazione, bottom nav, stato globale |
| `pos-screen-login.jsx` | Login, scelta del locale, accesso disattivato, recupero password, Face ID gate |
| `pos-screen-incassa.jsx` | Coda e dettaglio conto |
| `pos-screen-pagamento.jsx` | Flusso Tap to Pay |
| `pos-screen-transazioni.jsx` | Storico della sola giornata corrente |
| `pos-screen-profilo.jsx` | Profilo, impostazioni, cambio password |
| `pos-modali.jsx` | Bottom sheet e alert: ricevuta, dettaglio, permessi, conferme, pagine legali |

Schermate dello stack: `login`, `locali`, `disattivato`, `recupero`, `incassa`,
`conto`, `tap`, `transazioni`, `profilo`, `password`. La bottom nav (Transazioni
· Incassa · Profilo) è nascosta su login, locali, disattivato, recupero e
durante il pagamento.

## Convenzioni

Riusare token, icone e atomi invece di stili inline; `ST` non ridefinisce brand,
neutri e materiali di `PN`, adatta solo la scala al touch (hit target 44 pt,
raggi 10/14/18, CTA a pillola) e fallisce se `PN` non è caricato prima. Ogni
file espone i simboli con `Object.assign(window, { … })`. I bottom sheet usano
`Sheet`, gli alert `SystemAlert`, le conferme passano `onConfirm` nel payload
del modale.

## Che cosa è simulato

Il primo tentativo del Face ID fallisce sempre, per mostrare il fallback; il
blocco «in pagamento su un altro dispositivo» è un flag statico
(`inPagamentoAltrove`), senza presa in carico live; `?disattiva=1` o
`BYUP_STAFF_DISATTIVA()` in console simulano la disattivazione
dell'appartenenza a sessione aperta; nessun pagamento, ricevuta o rimborso parla
con un servizio vero.
