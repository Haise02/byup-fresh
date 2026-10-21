# Desk 2.0 — la console interna di byup, ridisegnata

> **Dal 2026-10-21 Desk esiste in due versioni.** `desk/` è Desk com'era il
> 17 ottobre (commit `4019736`: Ambiente e caratteri dei materiali, prima del
> ridisegno). `desk-2/` — questa cartella — è **Desk 2.0**: la shell nuova,
> Oggi, Byuppino, Sales, le notifiche e le condizioni del locale. Online:
> `/desk/byup-desk.html` e `/desk-2/byup-desk.html`. Le due cartelle sono
> indipendenti: un cambio fatto in una non arriva nell'altra.

Entry: [byup-desk.html](byup-desk.html). Per chi: il team di byup.

> **È un prototipo di UX/UI.** Vale quanto scritto nel
> [README della monorepo](../README.md): i dati sono finti, niente si salva, e le
> logiche che sembrano funzionare servono a rendere le schermate credibili — non
> sono la specifica del sistema. Come funziona la console sta nei documenti di
> riferimento fuori dal repo ([DOCUMENTI.md](../DOCUMENTI.md)): DPT 5.3 (i
> moduli), 12.2 (aree, profili, riesame degli accessi fuori dal prodotto), 13.5;
> SFA 23 (i flussi, dal ciclo di vita del locale alla 23.11 su contratti,
> consensi e atti sull'esercente). Il 5 settembre 2026 (P-162) le parti di
> questo file che descrivevano il prodotto sono uscite dopo l'estrazione, e
> `Riesame-Accessi.md` con loro.

*Contenuto verificato contro il codice il 2026-08-18; ridotto al mockup il 2026-09-05; Desk e Ambiente il 2026-10-17; nuova shell, Oggi e Byuppino il 2026-10-20.*

---

## Il nome

La console si chiamava **byup Spot**, poi dal 2026-08-14 **Hubble**. Dal
**2026-10-17 si chiama Desk**: il nome Hubble passa al futuro marketplace dei
fornitori (i locali collegano il magazzino e trovano in automatico la rete dei
fornitori), che è ancora in sviluppo. Cartella ed entry si sono allineati
subito, come la volta prima: `hubble/` è diventata `desk/` e l'entry è
`byup-desk.html`. Gli URL vecchi non si rompono: `vercel.json` rimanda
`/spot/*` (permanente) e `/hubble/*` (temporaneo, 307 — `/hubble/` servirà al
marketplace) alle nuove posizioni.

Il marchio di Desk è il segno byup con la scritta «Desk», **prugna `#492844` su
lilla `#DCBAD7`**: `desk.png` (lockup prugna su trasparente, nella barra),
`desk-mark.png` (solo il segno, per la barra compressa), `desk-mark-bianco.png`
(il segno in bianco, per i fondi scuri) e `desk-badge.png` (il badge lilla). I
due colori stanno in `admin-tokens.jsx` come `DESK_PRUGNA` e `DESK_LILLA` e si
usano per i momenti di marca — logo, pulsante e superfici di Ambiente. La
palette di lavoro (rosa d'azione, magenta del marketing, viola di workflow e
agenti) **resta quella di prima**, per scelta.

---

## Lo stile (dal 2026-10-20)

Desk è stato ridisegnato su riferimenti di dashboard CRM recenti (schede di
vetro su carta calda, controlli a pillola, cerchi). I colori restano quelli di
Desk; cambia la grammatica:

- **Niente colonna a sinistra.** In alto il marchio, le **sezioni come
  linguette** (quella accesa è una pillola d'inchiostro `INCHIOSTRO #1D1520`),
  a destra gli strumenti: cerca (⌘K), la faccia di **Byuppino**, la **pillola
  lilla di Ambiente** (grande, con chi c'è, le menzioni e la riunione in corso:
  `DkAmbientePillola`) e il profilo.
- **La barra nera degli strumenti** galleggia a sinistra, a metà altezza:
  cerca, crea (attività, riunione, messaggio, campagna), chat, attività,
  riunioni, Byuppino, impostazioni. Sotto ci abita Byuppino.
- **Il fondo è carta calda** (`FONDO_PAGINA`: lilla in alto a sinistra, sabbia
  a destra) e le schede sono **vetro** (`GLASS`, bianco al 72% con la
  sfocatura, raggio `R_SCHEDA` 22). Bottoni, segmenti, ricerche e pillole sono
  a pillola; icone e avatar stanno in **cerchi**. Pannelli laterali e modali
  sono fogli arrotondati che galleggiano.
- I titoli di pagina sono grandi (34 px, `HubTestata`); le tab sottolineate
  sono diventate pillole (`AdmTabBar`).
- **L'avviso in basso con «Annulla»** (`window.deskAvviso({testo, annulla})`)
  dice cosa è appena cambiato e lo rimette com'era.

Tutto questo vive nei componenti comuni (`admin-tokens`, `admin-atoms`,
`hub-ui`) e nella shell (`admin-app`): le pagine lo ereditano senza essere
riscritte una per una.

## Oggi

[desk-oggi.jsx](desk-oggi.jsx). La pagina d'ingresso (prima era la rubrica).
Risponde, nell'ordine, a: come stiamo andando (fila di numeri, grafico dei
ricavi 6/12 mesi), cosa devo seguire (schede colorate: le mie attività di
Ambiente, le chiamate in coda, il locale fermo nell'avvio), cosa succede nel
team (Ambiente). Nel mezzo **Byuppino ha letto i dati**: tre spunti con
«Mostrami» (porta dove serve) e «Approfondisci» (apre la chat con la domanda).
I numeri si leggono dalle stesse fonti delle pagine che aprono.

## Byuppino, l'assistente

[desk-byuppino.jsx](desk-byuppino.jsx). La mascotte di byup con le cuffie è
l'assistente di Desk: gli si chiede in italiano normale e **risponde sui dati**
(ricavi, locali per città/piano/tipo/fase, ticket, chiamate, mail, workflow,
agenti, team, riunioni), **trova e apre** schede (locali, titolari, utenti,
staff, sezioni) e **fa le cose**: crea e assegna attività, scrive in un canale
o in privato in Ambiente, fissa riunioni, chiude attività e ticket.

- Ogni azione che cambia i dati è prima una **proposta** con i campi in chiaro
  e parte solo con «Conferma»; poi arriva l'avviso con «Annulla».
- Si apre dal personaggio sotto la barra nera, dalla faccia in alto, dalla
  barra nera, con **⌘J**, e da codice con `window.byuppinoApri(testo, invia)`.
- I suggerimenti sotto la chat cambiano con la pagina in cui si è.
- Nel prototipo capisce con un motore di intenti scritto a mano (`bpCapisci`);
  nel prodotto il posto lo prende un modello linguistico con gli stessi
  strumenti. È l'interfaccia, qui, che si sta decidendo.
- Gli asset sono `byuppino.webp` (intero, scontornato) e `byuppino-viso.webp`
  (la faccia, per i cerchi).

## Sales

[desk-sales.jsx](desk-sales.jsx). Le trattative, solo per **tenerne traccia**:
byup non ha un team commerciale. Quattro fasi aperte (Primo contatto 10% · Demo
30% · Proposta 50% · Trattativa 75%) e due chiuse (Vinta, Persa con il
motivo). Il valore è l'**abbonamento di un anno al piano** scelto, letto da
`PIANI`: si cambia il piano, non si scrive un numero. In alto pipeline aperta,
ponderata, vinte nel mese e passi in ritardo; poi la **bacheca** (si trascinano
le schede; Vinta e Persa sono bersagli nella colonna delle chiuse) o
l'**elenco**. Il pannello della trattativa ha le fasi, il piano, il **prossimo
passo** con la sua data (rosso se in ritardo; «Fatto» lo scrive nel diario e
chiede il successivo), chi la segue e il **diario**. Una trattativa è legata a
un locale della rubrica oppure è un *prospect* col solo nome. Oggi mostra il
prossimo passo di vendita più vicino; Byuppino legge la pipeline («com'è messa
la pipeline?») e apre trattative («apri una trattativa con Osteria Bonelli,
piano Business»).

## Contatti · Locali

[desk-locali.jsx](desk-locali.jsx). Una linguetta di Contatti, fra la rubrica e
gli Elenchi: i locali come **schede con la foto**, ognuna legata all'**account
del titolare** (un titolare può averne più d'uno). Sulla scheda: stato e piano,
ordini, canone, ultimo accesso, il **motivo per guardarlo** (addebito fallito,
ticket di priorità alta, dormiente, fermo nell'avvio) e i **segnali** incrociati
(ticket, trattativa in Sales, condizioni speciali, vetrina). Azioni rapide:
copia il telefono del titolare, crea un'attività con Byuppino, apri le
condizioni, apri una trattativa, **sposta a un altro titolare**. L'ordine di
default è «Da guardare prima». La vista **Per titolare** raggruppa i locali per
account con il valore totale e «Aggiungi locale». La **selezione multipla**
crea un elenco statico, assegna i locali a un titolare o crea un'attività.
Gli account dei titolari vivono in `LC_STORE`; la scheda del locale legge da lì
i «locali associati».

## Le notifiche

[desk-notifiche.jsx](desk-notifiche.jsx). Quando succede qualcosa che ti
riguarda — un messaggio o una menzione in Ambiente, un ticket nuovo, un passo
di vendita che scade, una riunione che sta per iniziare, un agente che trova
qualcosa — arriva un **cartellino in basso a destra**: si tocca e porta alla
pagina giusta (la conversazione, il ticket, Sales…), sparisce da solo dopo
qualche secondo e si ferma se ci passi sopra. Resta nella **campanella** in
alto con il pallino dei non letti; «Non disturbare» spegne i cartellini.

Il modello è quello che dovrà mandare il backend:
`{ id, tipo, da, titolo, testo, quando, vai: { rotta, opts, vista } }` — `tipo`
fra messaggio, menzione, ticket, sales, riunione, agente, sistema; `vai` con le
stesse rotte di `window.hubVai`. Da codice: `window.deskNotifica({...})`. Una
notifica di una conversazione che stai già guardando non suona.

Nel prototipo sono **finte**: un copione (`NT_COPIONE`) ne fa arrivare sei nei
primi tre minuti, e quelle di Ambiente scrivono davvero il messaggio nella
conversazione (Sara in privato, Paola che ti menziona in #lancio), il ticket
entra davvero in coda.

Il **suono**: un rintocco breve e morbido sintetizzato nel browser (due note che
salgono, tre per menzioni e ticket di priorità alta); si spegne dalla
campanella (interruttore «Suono», con «Prova») e tace con «Non disturbare». Il
browser lo lascia suonare solo dopo il primo clic sulla pagina.

## Condizioni e vantaggi del locale

[desk-condizioni.jsx](desk-condizioni.jsx). Una tab della scheda del locale per
tutto quello che lo fa uscire dal listino, deciso a mano:

- **Piano e prezzo**: un piano con lo sconto, a prezzo fisso o gratis, per N
  mesi, fino a una data o per sempre; anteprima con quanto paga, fino a quando
  e quanto ci costa; finito il periodo torna a listino.
- **Promozioni** dal catalogo, ognuna con la sua scadenza.
- **Visibilità in app** (in evidenza nella città, primo nella categoria, nella
  Home): il motore dei posizionamenti arriva dopo il lancio, la scelta si fa
  già qui. La Vetrina speciale resta in Account.
- **Fedeltà e premi** (in arrivo): badge «Locale fondatore», partner
  certificato, mese gratis ogni 12, cashback.
- **Fai un regalo**, per l'assistenza: un mese gratis, ordini in più (passa dal
  registro degli accrediti, col suo tetto), configurazione, kit QR… con il
  motivo e l'avviso al locale.
- **Storico**: ogni atto con chi, quando e perché; si chiude, non si cancella.

Le concessioni grosse (più di 3 mesi gratis, oltre 500 € di valore, o per
sempre) nascono **in attesa** e le conferma un Super Admin diverso, come gli
accrediti; nel prototipo la conferma si simula dallo storico. Byuppino sa farlo
a parole: «fai il 20% per 3 mesi alla Trattoria della Nonna, piano Plus»,
«regala un mese gratis a Pizzeria Sorbillo».

## Le sezioni

La barra è tornata a parlare solo del lavoro di tutti i giorni: la governance
è passata nel menu del profilo. Le voci con delle sotto-sezioni le mostrano in
un pannello che si apre passandoci sopra col mouse, e dentro la pagina come
una fila di pillole.

| Sezione | Cosa contiene |
|---|---|
| **Oggi** (linguetta in testa, pagina d'ingresso) | Numeri del giorno, cose da seguire, Byuppino, il team. Vedi sopra |
| **Ambiente** (pillola lilla grande, in alto a destra) | Il posto dove il team lavora insieme: canali, messaggi diretti, thread, attività in lista e in bacheca, riunioni video. Sta fuori dall'elenco del CRM perché non è una sezione del CRM. Si apre anche con `?rotta=ambiente` |
| **Analisi Dati** | Sette tab: Generale, Locali, Valore per il locale, Utenti App, Staff, Servizio Clienti, Mercato |
| **Contatti** → | **Contatti** (la rubrica; è stata la pagina d'ingresso fino al 2026-10-20, ora lo è Oggi), **Elenchi** (segmenti attivi e liste statiche). **Proprietà** non è più qui: vive solo nel menu del profilo, con il resto della governance (2026-08-17). Dalla testata della rubrica si apre anche il **registro Restrizioni** (sospensione delle recensioni a tempo e ban, con motivi, decisione sulle esistenti, comunicazione alla persona, note e revoche — P-88: lo shadowban non esiste più). Il dettaglio di un contatto è una scheda a tutta pagina: le tre schede sono descritte sotto |
| **Sales** | Le trattative: bacheca per fase, elenco, pannello con prossimo passo e diario. Vedi sopra |
| **Marketing** → | **Mail**, **SMS**, **Messaggi all'app** (Posta e notifica, un canale — D-113), **Form** |
| **Workflow** | Le automazioni, comprese quelle nate insieme a un form |
| **Agent** | Due schermate: **La squadra** (gli agenti uno per uno) e **Ambiente agenti** (quello che fanno insieme; «agenti» per non confonderlo con Ambiente del team) |
| **Assistenza** | Quattro tab: Chiamate, Ticket, FAQ, Guide |

Le vecchie pagine di sezione **Locali / Staff / Utenti App / Promozioni** e la
vecchia **Dashboard** sono state **eliminate** (2026-08-17) insieme al vecchio
editor «workflow email»: le rotte storiche vengono tradotte da `admin-app.jsx`
(locali/camerieri/utenti → Contatti, promozioni → Marketing). I file di staff e
utenti sopravvivono solo per i **dataset** e le **schede**.

Nel **menu del profilo** (il cerchio in alto a destra) le voci sono due: **Il mio
profilo** e **Impostazioni** — la governance in una voce sola, distinta
internamente in Sicurezza e sistemi, Proprietà, Recapiti e domini di invio e
**Piattaforma**, che è visibile al solo Super Admin. Le rotte storiche
(`sicurezza`, `proprieta`, `domini`, `team`) si traducono sulla parte interna
giusta.

### Ruoli e permessi

I permessi si chiedono con una funzione sola, `hubPuo(area, livello)`, e
`?ruolo=admin|support|marketing` impersona un profilo per vedere lo stato negato;
aree, livelli e profili stanno in `admin-data.jsx` (`AREE`, `LIVELLI`, `RUOLI`,
`admLivelliDi`), la matrice si apre da Impostazioni → Sicurezza e sistemi →
Accessi. Il riesame degli accessi non è nel prodotto (D-44): resta la scheda
Accessi (`AccessiList` in `admin-team.jsx`, dati `TEAM` e `INVITI_PENDENTI` in
`admin-data.jsx`). Aree, profili e rito del riesame: DPT 12.2.

---

## Le tre schede

Ogni contatto si apre a **pagina intera** dalla rubrica, con la barra «torna» e
il tasto Esc. La testata **presenta, non riassume**: solo avatar e nome, il
resto vive nelle tab. **Locale** (`admin-locale-detail.jsx`): Anagrafica, Dati
fiscali, Proprietà, Statistiche, Log, Certificazioni, Contratti e consensi,
Fatturazione, Account. **Utente Staff** (`admin-camerieri.jsx`): Anagrafica,
Statistiche, Consensi, Log. **Utente App** (`admin-utenti.jsx`): Anagrafica,
Account, Statistiche, Consensi, Log, Recensioni. Che cosa mostra ciascuna tab e
perché sta nella SFA 23. Per il locale demo del gestionale (Cacio e Pepe,
`gestionaleId` `cp`) alcune tab leggono i registri condivisi sullo stesso
dominio: `byup_ade_incaricato`, `byup_soggetto_change`, `byup_audit_events`,
`byup_consent_state`.

## Il linguaggio comune

Regole che valgono in tutta la console — se una schermata nuova le rompe, è
la schermata a essere sbagliata:

- **La testata presenta, non riassume**; lo stato vive in Anagrafica.
- **Un log si scandisce per testo e data**: niente icone, etichetta + dettaglio
  a sinistra, chiave tecnica mono + timestamp a destra, filtro Dal/Al, righe
  zebrate. Stessa veste su locale, staff e utente app.
- **I consensi hanno un codice, uno stato a tre valori (Sì / No / Mai chiesto),
  una data e la versione dell'informativa**. Senza consenso il dato sensibile
  «non si guarda», non «non c'è».
- **Le cifre hanno un metro**: mediana accanto al numero (↑/↓), formati onesti
  (valute da sala al centesimo, niente percentuali su denominatori piccoli).
- **Una fonte sola per ogni fatto**: i gruppi di locali (`drwLocaliAssociati`)
  valgono per scheda locale, staff proprietario e rubrica; lo scontrino del
  titolare è il `ticketMedio` del business; il log non contraddice le tab che
  dovrebbe provare.
- **I mock sono deterministici sul seme** (`hubSeme` sull'id intero): stessa
  scheda, stessi valori a ogni ricarica.
- **Le tendine non si tagliano mai**: niente `overflow: hidden` sui contenitori
  di popover, e vicino al fondo della finestra si aprono verso l'alto.
- **Le azioni pesanti chiedono un motivo scritto** (rifiuti, sospensioni,
  storni): senza ragione a registro non sono auditabili.

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
ricarica non si può né leggere né filtrare. I **gusti** (P-30 · D-28) sono una
proprietà con lettore (`hubGustiDi`, solo utenti app) sui codici di
`HUB_PN_GUSTI`, copia verbatim del dizionario del gestionale: mai i tre regimi
alimentari (dato art. 9, `excluded_special_categories` del modello). Segmentare
non è comunicare: i compositori e gli elenchi lo dicono a schermo quando il
pubblico è filtrato per gusti, e l'invio resta subordinato al consenso del
canale.

---

## I file

| File | Cosa c'è dentro |
|---|---|
| `admin-tokens.jsx` | La palette (dal 2026-10-20 anche fondo di carta, vetro, inchiostro e raggi). Il marchio è un gradiente a tre colori: **rosa** `#FF1F5A` (accento d'azione), **magenta** `#ED1999` (marketing), **viola** `#D410F1` (workflow e agenti). I colori semantici — verde, ambra, rosso, blu, teal — **non si toccano**: lì il colore significa stato |
| `admin-icons.jsx` | Icone di contorno (`ICON_PATHS`) e piene per la barra (`ICON_FILLED`). Le piene accettano anche `rect:` e `circle:`; i **fori** vanno fatti con `evenodd` dentro lo **stesso** `path` |
| `hub-data.jsx` | Proprietà, operatori, motore dei filtri, e i mock di elenchi, mail, SMS, push, Posta (P-60: il canale in-app a due corsie, con la doppia interrogazione consent_check / suppression_check), form, workflow, agenti, domini e il sottodominio di tracciamento |
| `hub-ui.jsx` | Modale, pannello laterale, pannello dei filtri, modale delle colonne, tabella, testate, riquadri |
| `hub-elenchi.jsx` | Elenchi: lista, dettaglio, creazione con conteggio dal vivo |
| `hub-mail-builder.jsx` | Il costruttore visuale delle email e il generatore di HTML |
| `hub-font.jsx` | I caratteri dei materiali: catalogo (sicuri ovunque, Google Fonts, importati), importazione da Google Fonts o da file, selettore e pannello della barra di testo |
| `hub-marketing.jsx` | Mail, SMS, Messaggi all'app (Posta + archivio notifiche), Form |
| `hub-workflow.jsx` | Workflow (elenco, canvas, campi dei passi) e Agent |
| `hub-workflow-canvas.jsx` | L'albero dei rami, le corsie e l'ispettore del ramo |
| `hub-workflow-regole.jsx` | L'editor delle condizioni di ramo e delle attese |
| `hub-agent-ambiente.jsx` | L'Ambiente degli agenti: catene, lavagna, coda, registro, guardie |
| `desk-ambiente.jsx` | Ambiente del team: chat, attività, riunioni, e la pillola della barra in alto (`DkAmbientePillola`) |
| `desk-oggi.jsx` | Oggi, la pagina d'ingresso |
| `desk-locali.jsx` | Contatti · Locali: schede, account dei titolari (`LC_STORE`, `lcLocaliDelTitolare`), sposta e aggiungi, selezione |
| `desk-notifiche.jsx` | Le notifiche: cartellini, campanella, il copione del prototipo (`deskNotifica`) |
| `desk-condizioni.jsx` | La tab Condizioni e vantaggi della scheda del locale (`condApplicaPrezzo`, `condRegala`) |
| `desk-sales.jsx` | Sales: fasi, store delle trattative (`slLeggi`, `slCrea`, `slSposta`), bacheca, elenco, pannello |
| `desk-byuppino.jsx` | Byuppino: il motore che capisce (`bpCapisci`), le proposte con conferma, il pannello della chat, il personaggio |
| `hub-impostazioni.jsx` | Recapiti e domini di invio (col sottodominio di tracciamento in cima, P-57), catalogo delle proprietà |
| `admin-contatti.jsx` | La rubrica e l'apertura delle tre schede |
| `admin-locale-detail.jsx` | La scheda del locale (nove tab) e il pannello consensi condiviso |
| `admin-camerieri.jsx` | Dataset `STAFF` + scheda staff (nessuna pagina di sezione) |
| `admin-utenti.jsx` | Scheda utente app + `SpesaMediaCard` per Analisi Dati (nessuna pagina di sezione) |
| `admin-restrizioni.jsx` | Registro sospensioni recensioni/ban e popup della sospensione condiviso con scheda utente e moderazione, aperto dalla rubrica |
| `admin-*.jsx` | Le altre sezioni (Analisi Dati, Assistenza, Team, Mappa, Mercato, Valore) |

Il 2026-08-17 sono stati **eliminati** i file morti `admin-locali.jsx`,
`admin-promozioni.jsx`, `admin-workflow-email.jsx` e `hub-panoramica.jsx`
(pagine non più montate da nessuna rotta), insieme alle liste di sezione di
staff e utenti. `FilterDropdown` è passato in `admin-atoms.jsx`.

### Il diario del contatto

`hubAttivita(riga)` costruisce quello che è successo fra noi e una persona:
email inviate, aperte e **su quale link ha cliccato**, SMS e push, form
compilati, elenchi in cui è entrata, workflow, proprietà cambiate e da chi,
telefonate, **ticket con la loro chiusura**, **interventi di assistenza svolti
e in programma**, preventivi, rinnovi, note. È
deterministico sull'id e messo in cache: un diario che cambia date a ogni
render non si può leggere. Due paletti: **niente prima che il contatto
esistesse**, e niente nel futuro — tranne quello che è marcato `futuro`, cioè
le cose ancora da fare, che sono esattamente quello che serve sapere prima di
richiamare qualcuno. Niente pagine visitate e niente dispositivo sulle
aperture: di aperture e clic si conservano il fatto e il momento, e il link
cliccato passa dal sottodominio di tracciamento.

Sopra al diario ci sono due funzioni che fanno la differenza fra un registro e
una schermata che si legge:

- `hubSintesi(c)` risponde alle domande che uno si fa **prima** di leggere —
  quando l'abbiamo sentito e come, che cosa ha in programma, quanti ticket ha
  ancora aperti, che assistenza ha ricevuto e per che cosa, che cosa ci ha
  chiesto — più un semaforo (`temperatura`) che riassume tre segnali.
- `hubEpisodi(eventi)` raggruppa le righe che raccontano **la stessa cosa**:
  un invio con le sue aperture e i suoi click era tre righe a giorni di
  distanza, adesso è una scheda che dice com'è finita. La parentela sta in
  `HUB_ATT_SEGUITI`. Una scheda si data sull'**ultima** cosa successa.

### I workflow sono alberi

Una `condizione` ha dei `rami`; ogni ramo ha un `quando`. Un `quando` è fatto
di **gruppi**, e ogni gruppo di **regole**: dentro un gruppo le regole si
legano con `E` o con `O`, e fra i gruppi vale un'altra `E`/`O` scelta a parte.
Due livelli bastano a scrivere `(A e B) oppure (C e D)` e si continuano a
leggere; un editor di espressioni annidate all'infinito è più potente e non lo
usa nessuno.

Una regola ha un **genere**, e questa è la parte che prima mancava:

| Genere | Che cosa chiede |
|---|---|
| `proprieta` | Com'è fatto il contatto — le stesse frasi dei filtri |
| `evento` | Che cosa **ha fatto**: aperture, click su un link preciso, form, ticket. Niente pagine viste: la navigazione sul sito non si traccia a persona (P-36 · D-31), e i clic si registrano solo con la rilevazione consentita (PRIV-07). Con una **finestra** (`entro 3 giorni`) e un **NON** |
| `elenco` | È dentro o fuori da un elenco |
| `esito` | Com'è andato il passo prima: consegnata, rimbalzata, saltata per consenso, errore |

L'ultimo ramo può essere `altrimenti`: prende quello che non è rientrato
altrove, e non ha regole perché la sua regola è non averne. Un ramo **senza
regole** che non sia l'altrimenti si colora di rosso sul canvas: ci passano
tutti, ed è quasi sempre un errore. Il bottone **«Aggiungi un ramo»** sta sul
canvas, in fondo al ventaglio, largo come una corsia — la ramificazione è
l'operazione centrale della pagina, non una preferenza da ispettore.

I rami vecchi (`criteri` + `congiunzione`) si leggono ancora: `hubRamoQuando`
li converte al volo. `hubContaNodi` conta i passi rami compresi.

### Le attese

`Attendi` non è «quanti giorni». Ha cinque modi (`HUB_ATTESA_MODI`): per un
tempo fisso, fino a una data, fino a un giorno e un'ora (il «prossimo lunedì
alle 9», che serve a non spedire di notte), **finché non succede qualcosa** —
con un tetto oltre il quale si prosegue comunque, perché un'attesa senza tetto
è un workflow che non finisce — e la finestra oraria, che trattiene il passo
fuori orario e lo rilascia dentro. Il testo sulla scatola lo **genera**
`hubDescriviAttesa`: due sorgenti di verità e sul canvas resta scritto
«2 giorni» mentre l'attesa aspetta un click.

Un'attesa scritta a mano dichiara solo i campi che le servono: **chi la legge
passa da `hubAttesaPiena`**, che completa il resto. Senza, bastava cambiare
modo nell'editor per leggere `a.tetto.n` su un `undefined`.

### Ambiente — il team, insieme

[desk-ambiente.jsx](desk-ambiente.jsx). Il team parlava su un'app, teneva le
attività su un'altra e faceva le riunioni su una terza; il CRM stava in una
quarta. Ambiente ne prende le funzioni che servono davvero a una decina di
persone e le mette dentro Desk:

- **chat** — canali (pubblici e privati), messaggi diretti e di gruppo,
  thread, @menzioni (si scrivono `@Nome Cognome` e diventano un token `@[id]`
  legato alla persona), reazioni, messaggi fissati, file, huddle (solo voce,
  senza appuntamento) e la presenza di ciascuno;
- **attività** — stato (Da fare, In corso, In revisione, Fatto), assegnatari,
  scadenza, priorità, checklist e commenti; in **lista** raggruppata per stato o
  in **bacheca** con il trascinamento fra le colonne;
- **riunioni** — cinque giorni a colpo d'occhio, la riunione in corso in
  evidenza, la riunione video con microfono, camera, schermo, mano alzata e
  chat; quando finisce, il riassunto torna nel canale.

E la cosa che fuori da Desk non si può fare: messaggi, attività e riunioni si
**collegano a un contatto del CRM**, e il chip apre la sua scheda. Un messaggio
diventa un'attività con un gesto dalla sua barra, senza ricopiarlo. Gli
**agenti** scrivono nei canali come colleghi (con l'etichetta «Agente»).

Le persone sono `TEAM` di `admin-data.jsx` — una fonte sola. Lo stato vive in
uno store di modulo (`DK_STORE`, con `dkAggiorna` e `dkUsaStore`) e non nella
pagina: il pulsante della barra conta i non letti anche ad Ambiente chiuso, e
un messaggio scritto non sparisce cambiando sezione. Gli orari del mock sono
relativi ad adesso, così la demo non invecchia. Tutti i nomi di primo livello
del file cominciano con `dk`/`Dk`/`DK_`.

### L'Ambiente degli agenti

Gli agenti **non si chiamano fra loro**. Un grafo di chiamate a cinque agenti
sono venti collegamenti da tenere allineati, e il primo che cambia formato ne
rompe tre in silenzio. Qui scrivono una nota su un **argomento** della lavagna,
e chi è iscritto a quell'argomento si sveglia: aggiungere un agente è
iscriverlo, non ricablare gli altri. Sopra la lavagna ci sono quattro
meccanismi:

- **il patto** — ogni consegna dichiara i campi che passa; se mancano, la
  consegna fallisce **e si vede**, invece di far lavorare il secondo agente su
  una nota mezza vuota (che risponderebbe lo stesso, benissimo, a caso);
- **il secondo parere** — prima di scrivere nel CRM o di far uscire qualcosa
  verso un cliente, un altro agente deve confermare. Se non conferma non vince
  la maggioranza: sale a una persona;
- **il tetto** — budget al giorno e profondità massima per catena;
- **la coda** — i compiti non si assegnano tutti subito: uno per volta, per
  priorità, e dopo due tentativi falliti il compito passa a una persona. Per
  questo «A una persona» è una colonna e non un errore.

Il **registro** è la quinta scheda e non è un extra: un ambiente senza registro
è un gruppo di agenti che si accusano a vicenda.

### Il costruttore delle email (e dei form)

Il documento è una **lista di blocchi**, non HTML modificato a mano; l'HTML lo
genera `mbHtml()` quando serve, ed è HTML da email vera: **tabelle**, stili in
linea, larghezza fissa a 600px. Le mail non si renderizzano in un browser
moderno, si renderizzano in Outlook — un builder che produce `<div>` con
flexbox fa anteprime bellissime e mail rotte.

Il **testo è ricco** e si scrive **dentro l'anteprima**, non in una casella
laterale: grassetto, corsivo, sottolineato, corpo, **colore su una parola
sola**, link, simboli e **campi dinamici** presi da `HUB_PROPRIETA`. L'editor
(`MbRicco`) è **non controllato** di proposito — se React riscrivesse
l'`innerHTML` a ogni battuta il cursore tornerebbe a inizio riga a ogni
lettera. Quello che si incolla passa da `mbPulisci`, che tiene solo i tag e gli
stili che la posta capisce: un incollato da Word porta `<o:p>`, classi e font
che in Gmail diventano un pasticcio e in Outlook un altro pasticcio.

Ogni blocco ha un **fondo** (`mbFondoCss`): niente, tinta unita o **sfumatura**
— ed è così che si fa una sezione colorata senza inventare un blocco «sezione»
da spiegare. Nell'HTML la sfumatura esce **sempre con un `background-color` di
ripiego** pari al primo colore, perché Outlook su Windows ignora
`background-image`: meglio una tinta che una banda vuota in mezzo alla mail.

Il **carattere** si sceglie a tre livelli: per tutta la mail (l'ispettore
quando non c'è niente selezionato), per un blocco («Come la mail» di
predefinito), e per le sole parole selezionate (il tasto «Aa» della barra).
Il catalogo sta in [hub-font.jsx](hub-font.jsx): i caratteri **sicuri
ovunque** (Helvetica, Arial, Georgia…), una scelta di **Google Fonts**, e gli
**importati** — qualunque altro carattere di Google Fonts, scritto per nome o
incollando il link della sua pagina, oppure un file proprio (.woff2, .woff,
.ttf, .otf). Si salva sempre la **pila** completa col ripiego scelto
(`'Inter', Arial, Helvetica, sans-serif`): nella posta i caratteri web li
mostrano Apple Mail e iOS, mentre Gmail e Outlook per Windows mostrano il
ripiego. L'HTML generato mette i `<link>` di Google nella testata e il
`font-family` su **ogni cella**, perché Outlook non lo eredita dal `<body>`.
Un nome che non esiste su Google torna con un 400 senza intestazione CORS:
per distinguerlo da una rete assente si prova un carattere sicuro (Inter).

Le immagini si **caricano davvero** (`MbCarica`, drag&drop, GIF comprese, tetto
di 2 MB): nel prototipo diventano un data URL, in produzione vanno su una CDN e
nell'HTML ci finisce l'indirizzo.

Il **form** usa gli stessi pezzi — carattere del form e del titolo compresi: titolo e introduzione ricchi, blocchi
`Paragrafo` e `Immagine o GIF` accanto ai campi veri, fondo del modulo, della
pagina e del pulsante con tinta o sfumatura.

---

## Ruoli e permessi

Le quattordici aree, i tre profili e ciò che ciascuno scrive stanno nel DPT
12.2; qui i dati sono in `admin-data.jsx` e la matrice si apre da Impostazioni →
Sicurezza e sistemi → Accessi. Una scelta resta scritta anche qui perché guida
il mock: **le impostazioni della piattaforma restano al solo Super Admin**, sono
leve commerciali (prezzi, piani, soglie).

Dal 21 ottobre 2026 Desk 2.0 ha quattro preset più il Personalizzato. **Super
Admin** ha l'accesso completo: scrive su ogni area, Piattaforma compresa, ed è
l'unico che cambia i permessi di chi è già nel team. **Admin** è il preset che
prima si chiamava Super Admin: governa sistemi, proprietà, domini e agenti, il
lavoro operativo lo legge e basta, e non vede Piattaforma. Poi Assistenza e
Marketing, invariati. Un Super Admin lo nomina solo un Super Admin, anche
all'invito.

Il cambio dei permessi si apre dalla scheda di un membro in Accessi →
«Modifica permessi» (spento, col perché, per chi non è Super Admin; assente sui
propri permessi, che cambia un altro Super Admin). Si parte da un preset e si
regolano le aree; se le celle coincidono con un preset il membro prende quel
ruolo, altrimenti diventa Personalizzato. Il motivo è obbligatorio e finisce
nell'audit log con le aree cambiate; l'avviso in basso permette di annullare.
Componente: `ModificaPermessi` in `admin-team.jsx`. Da riportare nel DPT 12.2,
che oggi conosce tre profili.

---

## Com'è fatto

Nessun build step: `.jsx` serviti come `text/babel` e compilati nel browser.
I componenti si espongono su `window`; **l'ordine dei tag `<script>` in
[byup-desk.html](byup-desk.html) conta** — `hub-data.jsx` va dopo
`admin-data.jsx`, `hub-ui.jsx` dopo `admin-atoms.jsx`, e `admin-app.jsx`
per ultimo.

**Il cache-buster `?v=N` va incrementato a ogni modifica di un `.jsx`**, altrimenti
il browser serve la versione vecchia e sembra che la modifica non abbia avuto
effetto.

### Gli strati sopra — la regola che evita metà dei bug visivi

Il frame è fisso a 1440×900 con uno `zoom` applicato via JS. Da lì discendono
due regole, e non sono opinioni: sono i due modi in cui un menu sparisce.

1. **Niente `position: fixed` dentro il frame.** Un elemento fisso dentro uno
   `zoom` ha coordinate che non corrispondono a dove lo si vede: si disegna in
   un punto e riceve i click in un altro. Il menu sembra «coperto» perché il
   click atterra sulla pagina sotto.
2. **Niente tendina dentro un contenitore che scorre.** Basta un antenato con
   `overflow: auto` — il pannello dei filtri, una modale, una card — e la
   tendina viene tagliata al bordo.

La soluzione è una sola per entrambe: c'è **un contenitore degli strati**,
`#hub-strati`, montato dentro `.frame` e senza antenati che taglino. Modali,
pannelli laterali, tendine e flyout ci finiscono dentro con un portale
(`AdmPortale`), in `position: absolute`. Le coordinate le calcola `admAncora`,
che misura la scala sull'host stesso (`rect.width / offsetWidth`) e divide —
perché i rect sono pixel **visivi** e `left`/`top` sono pixel di **layout**.

Vale la stessa cautela per le unità `vh` dentro il frame: vengono scalate una
seconda volta e sfondano.

---

## Prima di un rilascio

```
grep -rn "data-demo-only" desk/
```

Marca le affordance che esistono solo per la demo e **non devono finire in
produzione**. Oggi non ce n'è nessuna.
