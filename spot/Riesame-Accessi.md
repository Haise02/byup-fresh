# Riesame periodico dei diritti di accesso — Spot

Vive in **Sicurezza e sistemi → Accessi**. Serve il controllo **ISO/IEC 27001
A.5.18** (riesame dei diritti di accesso), quello su cui più aziende vengono
bocciate perché lo gestiscono con un foglio Excel.

> Fino a luglio 2026 era una tab a sé, accanto a una tab «Team» che elencava le
> stesse persone con gli stessi ruoli e due colonne diverse in fondo. Le due sono
> state fuse: **l'elenco è uno solo**, ed è quello del riesame — era già il
> sovrainsieme. 2FA e stato dell'utenza, che erano le uniche colonne in più della
> vecchia tab Team, sono diventate pastiglie accanto al nome. Sotto l'elenco
> restano gli inviti pendenti e la matrice ruoli & permessi.

**Ambito: solo il team admin di Byup.** Lo staff dei locali resta fuori — l'ISMS
è quello di Byup, e Byup non può certificare che un cameriere lavori ancora in
un certo locale: quello lo sa il titolare.

Codice: [admin-team.jsx](admin-team.jsx) (componente `AccessReview` e funzioni
`ra*`), dati in [admin-data.jsx](admin-data.jsx) (`RIESAME_CORRENTE`,
`RIESAMI_CHIUSI`, `RIESAME_CADENZA_MESI`).

---

## Cosa è già vero e cosa è mock

**Vero, funziona davvero:** la classificazione delle utenze, che è il cuore del
riesame — dormiente, permessi aumentati, ruolo cambiato, mai riesaminato — è
calcolata confrontando lo stato di oggi con l'esito della campagna precedente,
non dichiarata a mano.

**Mock, da costruire:** tutto il resto. I dati stanno in memoria, le campagne
non si salvano, le revoche non toccano nessuna utenza.

---

## Cosa serve per la produzione

**Archiviazione append-only.** È *il* controllo che protegge il record, e non
vive in questa pagina: tabella in sola aggiunta, nessun grant di UPDATE o DELETE
sulle attestazioni, backup e retention. Un tempo qui c'era una catena di impronte
SHA-256 con una sezione «Integrità delle attestazioni» e un bottone «Verifica
integrità»: è stata tolta perché il sigillo si calcolava nel browser al
caricamento, dagli stessi dati che avrebbe dovuto proteggere, e viveva in
memoria — bastava ricaricare la pagina dopo una modifica perché la verifica
tornasse verde. Una catena di hash vale qualcosa solo se il capo è ancorato dove
chi tocca il database non arriva: storage WORM, marca temporale RFC 3161, log
esterno. Se un giorno servirà, si rifà così; finché non c'è l'ancoraggio, non
aggiunge niente all'evidenza.

**La revoca deve revocare davvero.** Oggi l'attestazione dichiara che «le
sessioni sono state terminate», ma è una frase. Il backend ha già l'entità
`Session` e `DELETE /auth/sessions/:id`: la revoca va collegata lì, e l'esito
dell'operazione registrato nell'attestazione. È la differenza tra «abbiamo
riesaminato» e «abbiamo riesaminato e rimediato» — cioè tra un rilievo e un pass.

**Apertura automatica della campagna** alla scadenza della cadenza
(`RIESAME_CADENZA_MESI`, oggi **3 mesi**: le campagne sono trimestrali, Q1…Q4),
con promemoria al revisore. Il chip nella striscia «Richiede attenzione» del
Generale c'è già e compare sotto i 14 giorni.

**Export PDF** oltre al CSV: l'auditor di solito vuole un documento firmato,
il CSV è per le carte di lavoro.

---

## Scelte di prodotto già prese

**L'ordinamento è per rischio, non alfabetico:** mai acceduto → dormiente (oltre
90 giorni) → permessi aumentati → mai riesaminato → invariato. Un riesame si
guarda dall'anomalia in giù; ordinato per nome si timbra dall'alto senza leggere.

**Non si registra la data di uscita di una persona.** C'era, e classificava
l'utenza come *«Esce il …»* a priorità massima; l'unico posto dove quella data si
scriveva era una sezione «Uscite dal team» in Risk Management → Formazione, e
tenere una sezione del personale per alimentare una riga sola non valeva il
prezzo. Chi non lavora più qui viene intercettato come **dormiente**, dalla
mancanza di accessi.

**Si decide solo sulle anomalie; il resto parte confermato d'ufficio.** Due
utenze su tre non hanno niente da decidere, e chiedere un clic anche per quelle
trasforma il riesame in una sfacchinata — e le sfacchinate si rimandano. Partono
confermate le invariate, perché «invariata» non è un'opinione ma il confronto con
la campagna precedente calcolato dal codice, e il Super Admin titolare. Le
anomalie no: quelle **sono** il riesame, e restano da decidere a mano. Ogni
conferma d'ufficio porta il proprio motivo scritto ed è marcata come tale
nell'attestazione: dichiararle è ciò che le rende difendibili, nasconderle
sarebbe un timbro. Una riga confermata d'ufficio si può comunque revocare — se il
revisore vede qualcosa che il confronto automatico non poteva vedere, la porta
deve restare aperta.

**Confermare e revocare non sono bottoni da elenco.** Nessuna riga li espone: la
riga dice soltanto a che punto è (*Da decidere*, *Confermato*, *Revocato*) e si
apre sul dettaglio del soggetto — ruolo, aree raggiungibili, da quanto non entra,
ultima verifica, secondo fattore, rilievo. Le due decisioni stanno lì dentro, in
fondo, dopo che si è visto di chi si tratta: confermare un accesso è
un'attestazione firmata col proprio nome, non un click di passaggio. La revoca
chiede in più un **motivo obbligatorio**: senza motivo non è evidenza.

**Il Super Admin titolare è confermato d'ufficio.** La sua riga si apre come
tutte le altre, ma il dettaglio non offre decisioni: spiega perché non ce ne
sono. L'accesso gli viene dal ruolo e il ruolo cambia fuori da qui. La
limitazione della segregazione dei compiti che ne deriva — in una struttura
piccola il titolare non ha un pari che lo verifichi — **non si risolve
nell'interfaccia**: va dichiarata e compensata nella valutazione del rischio e
nella Dichiarazione di Applicabilità dell'ISMS. Quando ci saranno due Super
Admin potranno verificarsi a vicenda e il punto decade.

**Una campagna chiusa non si modifica.** Non esistono comandi di modifica o
riapertura: una correzione è una campagna nuova. L'assenza del comando è il
segnale più forte di immutabilità, più di un lucchetto disegnato.
