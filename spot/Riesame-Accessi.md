# Riesame periodico dei diritti di accesso — Spot

Quinta tab di **Impostazioni Admin**. Serve il controllo **ISO/IEC 27001 A.5.18**
(riesame dei diritti di accesso), quello su cui più aziende vengono bocciate
perché lo gestiscono con un foglio Excel.

**Ambito: solo il team admin di Byup.** Lo staff dei locali resta fuori — l'ISMS
è quello di Byup, e Byup non può certificare che un cameriere lavori ancora in
un certo locale: quello lo sa il titolare.

Codice: [admin-team.jsx](admin-team.jsx) (componente `AccessReview` e funzioni
`ra*`), dati in [admin-data.jsx](admin-data.jsx) (`RIESAME_CORRENTE`,
`RIESAMI_CHIUSI`, `RIESAME_CADENZA_MESI`).

---

## ⚠️ DA NON PORTARE IN PRODUZIONE

### L'interruttore «Simula manomissione»

Nel blocco *Integrità delle attestazioni* c'è un riquadro tratteggiato con
etichetta **DEMO** e un bottone «Simula manomissione». **Non deve esistere nel
prodotto.**

Serve solo a mostrare dal vivo — in una demo commerciale o davanti a un auditor —
che il controllo di integrità funziona davvero: altera il contenuto di una
campagna già firmata, così premendo «Verifica integrità» la catena risulta
spezzata invece di dare sempre verde. Senza, chi guarda deve fidarsi sulla parola.

In produzione un comando che modifica un record firmato è **esattamente ciò che
il controllo esiste per impedire**: lasciarlo significherebbe consegnare
all'auditor la prova che i record non sono immutabili.

**Come trovarlo per rimuoverlo:** è marcato con `data-demo-only="simula-manomissione"`,
più le costanti `RA_MANOMISSIONE` e la funzione `toggleManomissione` in
`admin-team.jsx`. Un `grep -r "data-demo-only" spot/` prima di ogni rilascio
li tira fuori tutti.

---

## Cosa è già vero e cosa è mock

**Vero, funziona davvero:** le impronte sono SHA-256 calcolate dal browser con
`crypto.subtle` sul contenuto reale del record, concatenate a quella precedente.
«Verifica integrità» ricalcola la catena e la confronta: se un record cambia, il
controllo fallisce sul serio. Questa parte è stata scritta funzionante di
proposito — una verifica finta in un modulo di compliance è peggio di nessuna
verifica.

**Mock, da costruire:** tutto il resto. I dati stanno in memoria, le campagne
non si salvano, le revoche non toccano nessuna utenza.

---

## Cosa serve per la produzione

**Archiviazione append-only.** I record di attestazione non devono essere
modificabili né cancellabili, nemmeno da un DBA. Tabella in sola aggiunta,
impronta salvata alla firma, e idealmente la catena verificata da un job
periodico che allerta se si rompe. Oggi il "sigillo" vive in una variabile di
modulo (`RA_SIGILLO`) calcolata al primo caricamento: va persistito.

**La revoca deve revocare davvero.** Oggi l'attestazione dichiara che «le
sessioni sono state terminate», ma è una frase. Il backend ha già l'entità
`Session` e `DELETE /auth/sessions/:id`: la revoca va collegata lì, e l'esito
dell'operazione registrato nell'attestazione. È la differenza tra «abbiamo
riesaminato» e «abbiamo riesaminato e rimediato» — cioè tra un rilievo e un pass.

**Apertura automatica della campagna** alla scadenza della cadenza
(`RIESAME_CADENZA_MESI`, oggi 6), con promemoria al revisore. Il chip nella
striscia «Richiede attenzione» del Generale c'è già e compare sotto i 14 giorni.

**Export PDF** oltre al CSV: l'auditor di solito vuole un documento firmato,
il CSV è per le carte di lavoro.

---

## Scelte di prodotto già prese

**L'ordinamento è per rischio, non alfabetico:** mai acceduto → dormiente (oltre
90 giorni) → permessi aumentati → mai riesaminato → invariato. Un riesame si
guarda dall'anomalia in giù; ordinato per nome si timbra dall'alto senza leggere.

**Gli invariati si confermano in blocco** ed è legittimo proprio perché il
confronto con la campagna precedente è calcolato: si attesta che non è cambiato
nulla, non si timbra alla cieca. Senza questo, un riesame semestrale diventa una
sfacchinata e le sfacchinate si rimandano.

**Ogni azione passa da una conferma esplicita**, revoca e conferma. La revoca
chiede un **motivo obbligatorio**: senza motivo non è evidenza, è un click.

**Il Super Admin titolare è confermato d'ufficio**, senza pulsanti sulla sua
riga: l'accesso gli viene dal ruolo e il ruolo cambia fuori da qui. La
limitazione della segregazione dei compiti che ne deriva — in una struttura
piccola il titolare non ha un pari che lo verifichi — **non si risolve
nell'interfaccia**: va dichiarata e compensata nella valutazione del rischio e
nella Dichiarazione di Applicabilità dell'ISMS. Quando ci saranno due Super
Admin potranno verificarsi a vicenda e il punto decade.

**Una campagna chiusa non si modifica.** Non esistono comandi di modifica o
riapertura: una correzione è una campagna nuova. L'assenza del comando è il
segnale più forte di immutabilità, più di un lucchetto disegnato.
