# Hubble — la console interna di byup

Entry: [byup-hubble.html](byup-hubble.html). Per chi: il team di byup.

> **È un prototipo di UX/UI.** Vale quanto scritto nel
> [README della monorepo](../README.md): i dati sono finti, niente si salva, e le
> logiche che sembrano funzionare servono a rendere le schermate credibili — non
> sono la specifica del sistema. Per l'architettura e i flussi si parte dai
> documenti, non da questo codice.

*Contenuto verificato contro il codice il 2026-08-18.*

---

## Il nome

La console si chiamava **byup Spot**. Dal 2026-08-14 si chiama **Hubble**, con
un marchio proprio (gradiente rosa → magenta → viola). Il 2026-08-18 anche
cartella e file di ingresso si sono allineati al nome: `spot/` è diventata
`hubble/` e l'entry è `byup-hubble.html` — il commit dedicato che questo
paragrafo prometteva. Gli URL vecchi non si rompono: `vercel.json` fa il
redirect permanente da `/spot/*` alle nuove posizioni.

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
| **Analisi Dati** | Sette tab: Generale, Locali, Valore per il locale, Utenti App, Staff, Servizio Clienti, Mercato |
| **Contatti** → | **Contatti** (la rubrica; all'apertura è la pagina d'ingresso della console), **Elenchi** (segmenti attivi e liste statiche). **Proprietà** non è più qui: vive solo nel menu del profilo, con il resto della governance (2026-08-17). Dalla testata della rubrica si apre anche il **registro Restrizioni** (shadowban/ban con motivi, note e revoche). Il dettaglio di un contatto è una scheda a tutta pagina: le tre schede sono descritte sotto |
| **Marketing** → | **Mail**, **SMS**, **Push**, **Form** |
| **Workflow** | Le automazioni, comprese quelle nate insieme a un form |
| **Agent** | Due schermate: **La squadra** (gli agenti uno per uno) e **Ambiente** (quello che fanno insieme) |
| **Assistenza** | Quattro tab: Chiamate, Ticket, FAQ, Guide |

Le vecchie pagine di sezione **Locali / Staff / Utenti App / Promozioni** e la
vecchia **Dashboard** sono state **eliminate** (2026-08-17) insieme al vecchio
editor «workflow email»: le rotte storiche vengono tradotte da `admin-app.jsx`
(locali/camerieri/utenti → Contatti, promozioni → Marketing). I file di staff e
utenti sopravvivono solo per i **dataset** e le **schede**.

Nel **menu del profilo** (card in fondo alla barra) le voci sono due: **Il mio
profilo** e **Impostazioni** — la governance in una voce sola, distinta
internamente in Sicurezza e sistemi, Proprietà, Domini e mittenti e
**Piattaforma**, che è visibile al solo Super Admin. Le rotte storiche
(`sicurezza`, `proprieta`, `domini`, `team`) si traducono sulla parte interna
giusta.

### Ruoli e permessi (2026-08-17)

L'accesso si descrive **per area, a tre stati**: Nessuno / Lettura /
Scrittura, la stessa grammatica dei consensi. Le aree sono le voci della
console più la governance; Analisi Dati ammette solo la lettura (i dati li
raccoglie la piattaforma), e **Piattaforma non è un permesso assegnabile**:
è del solo Super Admin e non compare né nella matrice né regolando un
account. Tre preset — Super Admin (governa e legge, le scritture operative
sono dei mestieri), Support, Marketing — e dall'invito ogni cella si può
regolare per singola area: se il risultato differisce dal preset, l'account
diventa **Personalizzato** (nel mock: Laura Bianchi). ICT e Viewer non
esistono più. Le aree sono tredici, dodici assegnabili più Piattaforma
riservata: con D-33 (P-41) **Moderazione** e **Conformità** sono righe piene
— le Restrizioni e i ban chiedono Scrittura su Moderazione, approvare o
rifiutare una certificazione chiede Scrittura su Conformità; le funzioni
restano dove si aprono (rubrica, ticket), cambia chi può usarle, e a chiederlo
è una funzione sola, `hubPuo(area, livello)`, con `?ruolo=support|marketing`
che impersona un preset per vedere lo stato negato. Il riesame periodico dei
diritti di accesso non vive nel prodotto: si svolge fuori, su foglio di
calcolo (D-44, P-56, [Riesame-Accessi.md](Riesame-Accessi.md)). Nel prodotto
si concedono e si revocano accessi, e il registro eventi ne tiene traccia.

---

## Le tre schede (la spec UX/UI)

Ogni contatto si apre a **pagina intera** dalla rubrica, con la barra «torna» e
il tasto Esc. La testata **presenta, non riassume**: solo avatar e nome — tutto
il resto vive nelle tab.

**Locale** (`admin-locale-detail.jsx`) — nove tab:
1. **Anagrafica** — l'identità del rapporto (codice non modificabile, piano,
   ciclo di vita, provvedimento, iscritto dal) incorporata in testa alla card
   dei campi; i campi sono quelli dell'onboarding del gestionale (insegna,
   indirizzo e civico, CAP, città, telefono…). Sono **due campi** (P-44 ·
   D-34): il **ciclo di vita** dice dove il locale è arrivato (iscritto non
   avviato, in onboarding, onboarding saltato, attivo, inattivo, disdetto) e
   il **provvedimento** cosa Byup ha deciso (nessuno, limitato, sospeso,
   cessato — quest'ultimo solo per la risoluzione di Byup; la disdetta è
   ciclo di vita). La diffida è una riga del registro, non un valore: la si
   legge nel banner dei Contratti. Sotto, i **Locali associati all'utenza**
   del titolare: utenza e locale sono due cose distinte.
2. **Dati fiscali** — P.IVA senza badge di verifica (nessuno la verifica
   presso l'Agenzia, e il gestionale ha smesso di dirlo), la **delega
   all'Agenzia** letta dal registro delle deleghe (P-52 · D-40: Impostazioni →
   Piattaforma → Deleghe, elenco numerato di conferimenti e revoche con
   scadenza ancorata al conferimento e responsabile della gestione), regime a scelta,
   ATECO, SDI, PEC, REA, sede operativa (derivata, quella dello scontrino) e
   sede legale (campo suo), IBAN in sola lettura «gestito da Stripe».
3. **Proprietà** — campi liberi in stile CRM.
4. **Statistiche** — due sezioni etichettate: **Dati del locale** (tre KPI:
   ordini medi al mese, tasso di coperti occupati, scontrino medio; poi
   andamento ordini e andamento fatturato con **filtro periodo** 12 mesi/6
   mesi/ultimo mese/settimana e riferimenti temporali sotto le barre; adozione
   digitale, scan ordini, funnel) e **Dati da cameriere** (l'utenza del
   titolare al tavolo: mesi di lavoro, scontrino, mancia, ordini, coperti — le
   stesse cifre della scheda staff, con le mediane accanto). Un locale non
   attivo non mostra cifre da sala: la sezione spiega perché.
5. **Log** — eventi con chiave tecnica in chiaro, coerenti con lo stato del
   locale, filtro Dal/Al; con le rettifiche di cassa e gli sconti manuali, che
   sono la materia dell'**estrazione del registro operazioni** (P-47 · D-38):
   si chiede da Assistenza → Estrazioni, con motivo e nota, dietro Scrittura
   su Conformità, e l'estrazione resta a registro e in audit.
6. **Certificazioni** — le dodici del modello (P-61 · RL-06, `CERT_TIPI`, che il
   gestionale copia): nove con ente e documento, tre autodichiarazioni
   (vegetariano, senza lattosio, filiera corta) mostrate «Autodichiarata ·
   senza documento», senza scarico né revisione — presa d'atto, con «Contesta…»
   di Conformità ex post; l'ente è sempre indicativo. Fascicolo operativo: documento scaricabile, approva /
   rifiuta con motivazione, elimina, imposta scadenza (mai nel passato);
   «Scaduta» si deriva dall'orologio; ogni decisione si **sincronizza col
   ticket** in Assistenza (stessa pratica, due superfici).
7. **Contratti e consensi** — versioni accettate contro correnti (esplicita /
   tacita art. 15 / presa visione), avvisi di disallineamento e preavvisi; il
   rimando al documento porta **nome, versione e data** (chi/IP restano al
   registro); in fondo la card dei **consensi** (M-EM, M-SMS, M-REF), con lo
   stesso stato delle proprietà CRM della rubrica. M-REF è un consenso
   dell'esercente e ha la sua **storia** (P-70 · L4-05): eventi
   `reference_use` in `CONSENT_EVENTS`, seminati dallo stesso seme, letti a
   intervalli «legittimo dal … al …»; M-EM e M-SMS restano senza storia.
8. **Fatturazione** — piano, cambio piano, rimborsi, fatture, e gli
   **accrediti di unità** (P-69 · D-58): causale da elenco chiuso, nota
   obbligatoria, tetto letto da `HUB_LEVE`; sotto il tetto si conferma, sopra
   l'accredito resta in attesa e lo approva un Super Admin **diverso da chi ha
   disposto** (il codice lo impedisce: «L'hai disposto tu»); la coda vive in
   Piattaforma → Accrediti, ogni atto in audit col tipo Fatturazione.
9. **Account** — reset password del titolare, esportazione dati, **sospensione
   del servizio** (motivo tipizzato art. 13, nota obbligatoria, audit), e la
   **vetrina speciale** come registro di atti (P-63 · D-51): motivo da
   elenco, scadenza facoltativa che chiude da sola, sul merito la fotografia
   dei tre numeri congelata sull'atto, revoca con nota che **chiude la riga**
   invece di cancellarla, storico in card.

**Utente Staff** (`admin-camerieri.jsx`) — Anagrafica (dati persona editabili:
nome, email, luogo principale — niente nascita, età né genere, P-58 · RL-09:
il gestionale invita con nome, email e ruolo e nient'altro; card
Locali associati col principale in evidenza; dettagli utenza), **Statistiche**
(solo camerieri: mesi di lavoro, scontrino medio, mancia media con mediane dei
camerieri, ordini e coperti), **Consensi** (solo persone), **Log** (anche i
dispositivi: ping e stampe). I dispositivi sono utenze senza persona: niente
form, niente consensi.

**Utente App** (`admin-utenti.jsx`) — Anagrafica (verificato **in cima**, poi i
campi), **Account** (byuppini con storico movimenti e popup carica/storna col
riepilogo saldo → movimento → nuovo saldo; reset password sull'email salvata;
zona sensibile con ban ed eliminazione), **Statistiche** (abitudini con sessioni
sui cinque orizzonti, spesa, prenotazioni con no-show onesto sui denominatori
piccoli, tempi medi, inviti, preferenze alimentari **solo col consenso A3**),
**Consensi** (A3/A18/A6, specchio di ByupConsensi dell'app, con documenti e
versioni), **Log** (i tre eventi del registro d'uso — `app_open`, `qr_scan`,
`menu_view` — con la riga che dice a quali condizioni si scrive, e la card dei
rimandi alle tab dove vivono gli altri fatti: ordini, prenotazioni, recensioni,
byuppini, consensi e notifiche non si riscrivono in un registro parallelo,
P-37 · D-31), **Recensioni** (con lo shadowban accanto a ciò che nasconde).

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
| `admin-tokens.jsx` | La palette. Il marchio è un gradiente a tre colori: **rosa** `#FF1F5A` (accento d'azione), **magenta** `#ED1999` (marketing), **viola** `#D410F1` (workflow e agenti). I colori semantici — verde, ambra, rosso, blu, teal — **non si toccano**: lì il colore significa stato |
| `admin-icons.jsx` | Icone di contorno (`ICON_PATHS`) e piene per la barra (`ICON_FILLED`). Le piene accettano anche `rect:` e `circle:`; i **fori** vanno fatti con `evenodd` dentro lo **stesso** `path` |
| `hub-data.jsx` | Proprietà, operatori, motore dei filtri, e i mock di elenchi, mail, SMS, push, Posta (P-60: il canale in-app a due corsie, con la doppia interrogazione consent_check / suppression_check), form, workflow, agenti, domini e il sottodominio di tracciamento |
| `hub-ui.jsx` | Modale, pannello laterale, pannello dei filtri, modale delle colonne, tabella, testate, riquadri |
| `hub-elenchi.jsx` | Elenchi: lista, dettaglio, creazione con conteggio dal vivo |
| `hub-mail-builder.jsx` | Il costruttore visuale delle email e il generatore di HTML |
| `hub-marketing.jsx` | Mail, SMS, Push, Form |
| `hub-workflow.jsx` | Workflow (elenco, canvas, campi dei passi) e Agent |
| `hub-workflow-canvas.jsx` | L'albero dei rami, le corsie e l'ispettore del ramo |
| `hub-workflow-regole.jsx` | L'editor delle condizioni di ramo e delle attese |
| `hub-agent-ambiente.jsx` | L'Ambiente: catene, lavagna, coda, registro, guardie |
| `hub-impostazioni.jsx` | Domini e mittenti (col sottodominio di tracciamento in cima, P-57), catalogo delle proprietà |
| `admin-contatti.jsx` | La rubrica e l'apertura delle tre schede |
| `admin-locale-detail.jsx` | La scheda del locale (nove tab) e il pannello consensi condiviso |
| `admin-camerieri.jsx` | Dataset `STAFF` + scheda staff (nessuna pagina di sezione) |
| `admin-utenti.jsx` | Scheda utente app + `SpesaMediaCard` per Analisi Dati (nessuna pagina di sezione) |
| `admin-restrizioni.jsx` | Registro shadowban/ban, aperto dalla rubrica |
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

Le immagini si **caricano davvero** (`MbCarica`, drag&drop, GIF comprese, tetto
di 2 MB): nel prototipo diventano un data URL, in produzione vanno su una CDN e
nell'HTML ci finisce l'indirizzo.

Il **form** usa gli stessi pezzi: titolo e introduzione ricchi, blocchi
`Paragrafo` e `Immagine o GIF` accanto ai campi veri, fondo del modulo, della
pagina e del pulsante con tinta o sfumatura.

---

## Ruoli e permessi

Tre preset su tredici aree, di cui dodici assegnabili. La matrice si apre dal
bottone **Ruoli & permessi** in **Impostazioni → Sicurezza e sistemi →
Accessi**; i dati in [admin-data.jsx](admin-data.jsx) (`AREE`, `LIVELLI`,
`RUOLI`, `admLivelliDi`, `hubPuo`). Ogni cella vale Nessuno, Lettura o
Scrittura; Analisi Dati ammette solo la lettura; Piattaforma è riservata al
Super Admin e non compare. I preset si regolano per cella: un account che
differisce dal suo preset è **Personalizzato**.

| Preset | Scrive su |
|---|---|
| **Super Admin** | Proprietà, Agent, Domini e mittenti, Sicurezza e sistemi — il lavoro operativo lo legge, Moderazione e Conformità comprese |
| **Support** | Contatti, Moderazione, Elenchi, Workflow, Agent, Assistenza, Conformità |
| **Marketing** | Elenchi, Proprietà, Marketing, Workflow, Domini e mittenti — Moderazione e Conformità: nessuno |
| **Personalizzato** | cella per cella (nel mock Laura Bianchi: partita da Support, scrive solo su Assistenza) |

Una scelta deliberata: **le impostazioni della piattaforma restano al solo Super
Admin** — sono leve commerciali (prezzi, piani, soglie).

---|---|
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
[byup-hubble.html](byup-hubble.html) conta** — `hub-data.jsx` va dopo
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
grep -rn "data-demo-only" hubble/
```

Marca le affordance che esistono solo per la demo e **non devono finire in
produzione**. Oggi non ce n'è nessuna.
