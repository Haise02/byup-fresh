# Byup Fresh — Stato dello Sviluppo

> **File di memoria tra sessioni.** Tutto ciò che serve sapere per riprendere dal punto giusto è qui. Riferimenti tecnici approfonditi: `backend/BACKEND.md` per le decisioni di backend e `backend/erd/` per il modello dati (ERD v0.7, enum, documenti di progettazione). I percorsi in questo documento sono relativi alla root del repo `Byup/`, salvo dove indicato.

**Ultimo aggiornamento:** 5 settembre 2026. Il registro delle sessioni sta qui sotto, dalla più recente; il dettaglio delle motivazioni è in `DESIGN_DECISIONS.md`, che ha una sezione per ogni batch. Ultimo lavoro **backend**: 30 maggio 2026 — fix regressione `strictNullChecks` su colonne nullable TypeORM + warning pg (vedi §5.4, §5.5). Dal 28 luglio il lavoro è tutto sul **prototipo**: il backend descritto dalle sezioni 2–8 non è stato toccato.

### Registro delle sessioni

**5 set — la configurazione completa è ancora onboarding, e la mascotte poggia sul bordo.** Le due fasce di attivazione — «Collega Stripe per incassare» e «Collega i dati fiscali all'Agenzia» — **escono dalla Configurazione completa**: ieri sera erano state messe in tutti e tre i punti d'arrivo, ma quella pagina non è un arrivo — ci si entra solo dallo step 4 dell'onboarding e da lì si esce nel gestionale. Chiedere Stripe e il fiscale mentre il locale sta ancora mettendo in piedi vetrina e personale è lo stesso muro sulla porta che il 4 settembre (D-105) si era tolto dall'onboarding, rimesso due schermate più in là. Le fasce restano dove si atterra **davvero**: **Panoramica** per chi dall'onboarding rapido va dritto nel gestionale, **Profilo → Piani** per chi conclude la configurazione completa. Chi dal rapido passa al completo non le vede: è ancora onboarding.

Nella tessera **«Scarica Byup Staff»** (Impostazioni → Personale, e la rail dello step Personale della configurazione completa) la mascotte stava **in mezzo** al riquadro, coi piedi sopra la riga «Inquadra il codice, oppure vai su Play Store o App Store» e l'ombra che tagliava le parole: il porting dal banner orizzontale dell'onboarding aveva tenuto il margine negativo — che lì serviva a farla poggiare sul bordo inferiore — senza accorgersi che sotto, nella versione verticale, c'era del testo. L'istruzione passa **sopra** il codice e il fondo del riquadro diventa una fascia dove codice e mascotte fanno da reggilibri: il QR al margine sinistro, la mascotte al destro, tutti e due appoggiati alla stessa riga a 16 dal bordo. La mascotte **non si taglia più**: il taglio a filo veniva dal banner orizzontale da cui la tessera è nata, dove la figura era alta 152 su una fascia larga e il taglio si leggeva come «poggia per terra»; qui è una figurina di cento pixel in un angolo arrotondato, e lo stesso taglio le mozzava i piedi e le premeva il braccio contro la curva dell'angolo. Ora sta tutta dentro, con la sua ombra di contatto.

**4 set (sera, 6) — le sette voci di «Modifiche prototipo 3», applicate.** Un blocco solo, dalle decisioni del titolare del 4 settembre sera (P-128…P-134, D-109).

**Stampa (P-128 · D-109, che rivede D-108).** La regola cambia: **le stampanti collegate al nostro server hanno la precedenza, il browser è il ripiego** — e il ripiego vale per i soli documenti. Il **pre-conto passa dalla stessa porta** del documento di cortesia (prima andava dritto al browser): sono due fogli per lo stesso cliente, uno prima e uno dopo il pagamento, e non ha senso che escano da stampanti diverse. Quando la stampante non risponde si ripiega **e il lavoro in coda si annulla**, altrimenti la stampante che torna su mezz'ora dopo sputa un secondo foglio per un cliente che se n'è andato. Il ripiego non è sempre possibile: serve un gestionale su schermo largo o tablet con i permessi da Cassa — se ne è aperto uno solo la finestra di stampa parte da sé (da un **riquadro nascosto nella pagina**, non da `window.open`, che senza un clic il browser blocca), se ne sono aperti due o più compare una **fascia leggera su tutti**, che sparisce da tutti insieme appena uno stampa e da sola dopo qualche minuto, e che non lascia voce in Notifiche; se non ne è aperto nessuno il gestionale lo dice mentre si incassa. Per le **comande non c'è ripiego**: se la stampante di cucina non risponde le comande in coda **scadono** e compare una fascia a tutta larghezza che nomina la stampante e le categorie perse — «Bar non ha stampato le comande: Bevande, Dolci» — e rimanda al monitor; se ne va con «Letto», con una prova di stampa riuscita o collegando un'altra stampante che prende quelle categorie. **Inviare un ordine accoda davvero le comande**: prima non lo faceva nessuno — `mandaInCucina` cambiava uno stato e mostrava un messaggio, e l'unica comanda che andava in stampa nasceva da un pulsante sul monitor — quindi la fascia non aveva origine e non si poteva nemmeno provare. Sparisce `connection_mode`: ogni stampante in elenco interroga il nostro server, e una «da browser» non è un dispositivo — dal browser non torna indietro niente, e quella riga sarebbe un nome scritto a mano e tre campi vuoti per sempre. Arriva **«Prova la stampa dei documenti»**, che è la prova della strada e non di un dispositivo (la funzione c'era da ieri e non la chiamava nessuno). In Contabilità il pulsante **«Stampa»** su un documento saldato stampa davvero, con la stessa precedenza: prima scriveva «Stampato ✓» per due secondi.

**Il foglio nel sacchetto (P-129).** La stampa automatica del documento di cortesia sugli ordini da piattaforma **è un'opzione**, una per piattaforma, e nasce **accesa**: un sacchetto che parte senza foglio è un errore che il cliente scopre a casa. Senza una stampante di cucina collegata si vede ma è spenta e non si può accendere, e dice perché.

**Stripe (P-130).** Gli stati del conto diventano i **quattro del modello** — `pending`, `active`, `restricted`, `disabled` — al posto dei tre inventati, e il **conto limitato** smette di essere invisibile: è la situazione più frequente nella realtà. Non diventa una schermata da compilare, perché i documenti che Stripe chiede non li raccogliamo e non li conserviamo noi: è una fascia che dice la **conseguenza** — «continui a incassare ma i versamenti sono fermi» oppure «non puoi più incassare con la carta» — più il pulsante che porta su Stripe.

**L'anteprima in Dati fiscali (P-131).** Mostra il **documento di cortesia**, cioè il foglio che stampiamo davvero noi, e non più il documento commerciale: quello lo produce la procedura dell'Agenzia, e la forma che avevamo copiato viene dall'allegato della Fase 2. La riga blu diventa una frase sola: «I tuoi dati come li vede il cliente. Lo scontrino fiscale lo emette l'Agenzia con questi stessi dati».

**Residui (P-133).** Il rimando al contratto non punta più a una versione che non esiste (e non punta più a un numero, che si romperebbe di nuovo); la **campanella** `PnNotifBell` — duecento righe che nessuna pagina montava — è tolta; spariscono i commenti sull'incaricato di Byup, sul libero professionista e su `PN_LOCALE`, che nessun file definiva; l'ente si chiama «Ente o altra forma collettiva» anche nell'onboarding.

**Rifiniture, subito dopo.** «Collega monitor cucina» è un **pulsante in testata**, accanto ad «Aggiungi persona», e lascia la colonna destra, che resta «Inviti in attesa» e basta. Nel foglio del collegamento **qualunque codice di quattro caratteri passa** — finzione dichiarata, perché senza server quel codice esiste solo se si è aperto `byup.it/cucina` in un'altra scheda, e così il passo del nome e della visualizzazione si vede comunque; se invece uno schermo lo sta davvero mostrando, il collegamento è quello vero. Le stampanti che il server ha trovato passano da due a **cinque**, così ne restano da aggiungere anche dopo il primo giro, e la **prova della stampa dei documenti** lascia il fondo del blocco: parte alla fine del collegamento di una stampante per i documenti, che è quando la domanda nasce. Sotto le stampanti sparisce il riquadro **«Quale POS stampa dove»**: era una terza copia di una scelta che si fa già nel foglio della stampante, e ripeteva sdraiata quello che le tessere possono dire in piedi — adesso la tessera **nomina le casse che stampano lì**, dice «tutte le casse stampano qui» quando è l'unica per i documenti, e segnala in ambra quando non ne ha nessuna. In **Personale** il filtro degli stati smette di essere un `<select>` nativo e diventa **tre pillole col conteggio** — Tutti, Attivi, Disattivati — che è il linguaggio dei filtri in questo gestionale; il conteggio segue il ruolo selezionato, così dice quante righe si vedrebbero davvero. In Integrazioni sparisce il **riquadro dei telefoni** in cima: dopo P-134 non aveva più niente da far fare — il telefono si registra da sé — ed elencava due apparecchi sotto un titolo che prometteva una cassa; il blocco però continua a chiamarsi «POS e strumenti di pagamento», perché lì dentro sta il rimando al censimento presso l'Agenzia. Nei **ruoli** il gruppo «Dispositivi» diventa **«Monitor cucina»** e «Byup Staff» sparisce: non era un ruolo, era una persona scritta due volte — la pastiglia della comunicazione all'Agenzia passa sulla riga della persona che quel telefono lo usa, che è anche chi deve agire.

**Personale e Integrazioni (P-134).** «Collega un dispositivo» esisteva due volte in due pagine e faceva due cose diverse. Ora: in **Personale** sta chi entra — le persone e il monitor di cucina — e le **stampanti escono**, perché una stampante non entra da nessuna parte, riceve fogli e li stampa; ne discende che le categorie si assegnano **da un posto solo**. La pagina «POS e integrazioni» si chiama **«Integrazioni»**: il POS non si collega più da lì — il telefono si registra entrando in Byup Staff con le credenziali personali — e il «+» col QR sparisce, perché era il doppione di quello che sta in Personale; il primo blocco però continua a chiamarsi «POS e strumenti di pagamento», perché lì vive il censimento presso l'Agenzia e chi lo cerca lo cerca pensando «POS». Il **monitor di cucina si collega con un codice**: si apre `byup.it/cucina` sullo schermo (nuova pagina `byup Cucina Collega.html`), compare un QR con sotto il codice in chiaro che dura pochi minuti e si rigenera, e dal gestionale il **solo Titolare** conferma dando nome e visualizzazione. Nome utente e password spariscono — con loro, chiunque conoscesse `PG1-cucina` apriva la cucina di quel locale da qualunque browser, e lì passano le allergie dichiarate dai clienti. Il collegamento **non scade**: si toglie da Personale, come si toglie l'accesso a una persona, e finisce nel registro delle attività. Nella configurazione completa restano tutte e due le tessere: la stampante apre lo stesso foglio di Integrazioni, il monitor apre le **istruzioni** invece di un modulo.

**Una trappola ritrovata.** `pnPulisciDevice` usava la destrutturazione con rest, e Babel la compila leggendo una variabile di modulo `_excluded` che i file .jsx del gestionale — script non isolati — si sovrascrivono a vicenda: la funzione toglieva `name` alle stampanti, e la fascia diceva «non ha stampato» senza dire quale. È la stessa collisione già documentata in `byup-glass.jsx`. Corretto anche un apostrofo non protetto in `supporto-data.jsx`, che dal 4 settembre rompeva la pagina Supporto.

**4 set (sera, 5) — «In caso di controllo» diventa un foglio, e il collegamento POS dice la regola.** Il riquadro che spiegava dove sta la prova in un controllo **non sta più in coda a Contabilità → Conti**: un paragrafo permanente sotto una lista lunga è rumore tutti i giorni e irraggiungibile il giorno che serve, con un verificatore davanti. Al suo posto un **link grigio, 12px, sottolineato, in coda alla riga delle tab** — lo stesso posto in cui, nel regime della Soluzione, sta «Verifica fiscale»: stessa domanda, due risposte a seconda del regime. Non cattura l'occhio (niente riempimento, niente bordo, niente peso) ma sta in alto e non scorre via. Il link apre un **foglio** che è l'unica copia del testo: il percorso esatto del portale, il pulsante che lo apre, e un **selettore di periodo che parte da «oggi e ieri»** — l'intervallo che di solito viene chiesto — e **«Scarica i dati del periodo»**, che tira giù il CSV dei documenti di quella finestra — data, ora, giornata fiscale, numero, importo, metodo, esito e identificativo del canale, rettifiche comprese, punto e virgola e virgola decimale per Excel italiano — che è il termine di confronto da mettere accanto agli invii giornalieri. Non è la finestra per il verificatore, che nel regime attuale non si costruisce (progetto tecnico §4.3): è l'istruzione più una scorciatoia alla lista che il gestionale ha già. Lo aprono anche **⌘K** («controllo», «verificatore», «portale» → `?controllo=1`, come il `?invita=1` di Profilo) e una **FAQ del Supporto** col rimando cliccabile — le risposte ora possono portarne uno — accanto a una **scheda tutorial** «In caso di controllo» in Pagamenti e ordini, col segnaposto video come le altre. In **Impostazioni → Dati fiscali** il collegamento POS smette di raccontare il riparto di responsabilità fra esercente e Byup e dice la regola: «Ogni strumento con cui incassi va collegato. La finestra va dal 6 all'ultimo giorno del secondo mese successivo a quello in cui lo strumento si attiva, e si riapre a ogni variazione» — la nota in fondo che la ripeteva sparisce, e quando non c'è niente da fare la card lo dice e basta.

**4 set (sera, 4) — la tipologia senza numeri, il fuori menù nella lingua del gestionale, il cliente che parcheggia il conto.** Le cinque voci della **tipologia articolo** non portano più le aliquote accanto, né nel menù né in cassa: sulle voci col 10 e il 10 si leggeva un «10 · 10» che non vuol dire niente, e la percentuale accanto faceva scegliere l'aliquota invece della merce — che è l'errore che quella schermata deve impedire. Che cosa comporta la scelta resta scritto sotto, una volta, con l'aliquota che vale per quell'ordine. Il foglio dell'**articolo fuori menù** in cassa passa dal pannello di vetro con le etichette maiuscole al **foglio standard del gestionale** (MODAL_PANEL: bianco, testata col filetto, campi con etichette, piede con Annulla e la conferma che porta l'importo): è un modulo di tre campi, e i moduli del gestionale si somigliano tutti. In **Vendita diretta**, assegnare un cliente al carrello non è più un'etichetta che il primo cambio di schermata si porta via: con delle righe dentro si apre il foglio **«Metti il conto da parte»** — chi ritira, **quando** — l'ORA in grande, in una tendina nostra coi quarti d'ora e «Senza orario» in cima (niente controlli nativi `date`/`time`, che portavano dentro il calendario del browser e il formato del sistema), e il **giorno** in una riga sola sotto, «Ritiro di Oggi, 4 set · Cambia giorno», perché il giorno è oggi in più del novantanove per cento dei casi e una fila di bottoni per quell'uno per cento rubava lo sguardo all'ora — e se **inviarlo in cucina prima del saldo** — e alla conferma l'ordine passa in «Da saldare» a quel nome, con la cassa libera. La spunta della cucina è spenta: un conto non pagato che parte in cucina è cibo preparato su fiducia, e chi sta al banco decide caso per caso; senza spunta il conto resta fermo e ci va quando lo manda lui, dal pulsante **«Manda in cucina»** sulla card della coda, o quando viene saldato. Senza orario non se ne inventa uno: la coda dice «senza orario», e se il ritiro è di un altro giorno lo dice («ritiro 5 set, 19:45»); e il chip **«non in cucina»** dice l'altra metà — così al ritiro non si scopre che non è stato preparato niente. Se nel conto non c'è nulla da preparare la domanda non si fa, e né chip né pulsante compaiono.

**4 set (sera, 3) — allergeni che si leggono, marchi in cucina, Byup AI nei piani.** In **Sala** il tavolo occupato col contrassegno «Allergia» adesso dice **quale**: la riga di comanda porta il codice dell'allergene, e a scheda aperta il riquadro «Allergie dichiarate» unisce i due canali — le righe col contrassegno e la prenotazione collegata — con l'etichetta di legge per esteso; sulla riga il chip non dice più «Allergie» ma «Glutine». Sparisce da tutte le superfici **chi ha registrato l'allergia e a che ora**: a chi deve sapere cosa non far arrivare al tavolo, la firma del cameriere non serve. In **Cucina** i ticket delivery portano il **marchio della piattaforma** — sigla e colori da PN_PARTNER, come sul monitor KDS — al posto del generico «DELIVERY». Nelle **stampanti**, aggiungere non è più un atto di fede: alla conferma parte la prova di stampa e la stampante entra in elenco solo se risponde, quindi il piede del foglio ha un pulsante solo che dice a che punto è; sul foglio di una già collegata restano «Prova di stampa» e «Salva». In **Piani e abbonamenti** arriva **Byup AI**, incluso in Plus e Business: prima voce nelle tessere dei due piani, riga sua nel confronto, e voce fra le perdite di chi scende al Gratuito.

**4 set (sera, 2) — le stampanti: due fogli, e la prova dove si può rimediare.** «Cerca stampante» diventa **«Aggiungi stampante»** e non fa più aspettare: il popup si apre e in cima dice l'**indirizzo del nostro server** da scrivere nella stampante — `https://print.byup.it/cloudprnt/cp` per Star, `https://print.byup.it/sdp/cp` per Epson, con il tasto che copia — mentre l'elenco di chi si è presentato sta sotto, col caricamento dentro la sua sezione e «Cerca di nuovo» accanto. **«Questa postazione» sparisce** da elenco e registro: la stampa dal browser non si collega e non si scollega, c'è sempre, ed è la strada che il documento prende quando per quel POS non risponde nessuna stampante del server. Scelta la stampante si apre il secondo foglio, **«Imposta stampante»**, che è anche quello che si riapre da **«Configura»** sulla tessera: nome, uso (comande o scontrini di cortesia), le categorie per le comande — senza più la tendina «Sede», che aveva una sola risposta giusta — e, per i documenti, i **POS che stampano lì**, chiesti solo da due stampanti in su e con la spunta che toglie il POS dalla precedente. Lì dentro sta anche **«Stampa da sola a incasso avvenuto»**, spenta di default, e la **prova di stampa**, che dalla tessera se ne va: provare serve a sapere se risponde, e la domanda si fa dove si può rimediare. Sulla tessera restano «Configura» e «Scollega». Sotto le stampanti spariscono i due interruttori e il paragrafo di chiusura: l'automatico è nel foglio della stampante; il documento in coda alla comanda per gli ordini da piattaforma non è un'opzione — quando le piattaforme entreranno funzionerà così; e il ripasso su LAN, Bluetooth e Sunmi è documentazione, non interfaccia.

**4 set (sera) — i collegamenti escono dall'onboarding, e Dati fiscali si alleggerisce.** Stripe, le credenziali dell'Agenzia e la delega **non si chiedono più all'ingresso**: sono atti che si compiono su altri siti — la verifica d'identità di Stripe, il portale dell'Agenzia con SPID — e mettere quei tre muri sulla porta voleva dire non far entrare nessuno. Lo step 2 dell'onboarding torna a un passo solo (anagrafica e P.IVA): via il sotto-passo «Pagamenti» con Stripe e i metodi alternativi, via «Gli scontrini li trasmette un incaricato», via «Attivazioni fiscali» (≈700 righe, con le costanti e i componenti che vivevano solo lì). Al loro posto, **le prime due notifiche dell'atterraggio**: «Collega Stripe per incassare» porta in POS e integrazioni, «Collega i dati fiscali all'Agenzia» porta in Dati fiscali, e arrivano anche come avviso in Panoramica, una dopo l'altra. Nascono due registri condivisi: `byup_ade_delega` (delega, conservazione, accreditamento) e lo stato di partenza di `byup_stripe`, che ora è **da collegare** e non «connesso» — e il **POS virtuale nasce con quel collegamento**, con la data di oggi, invece di esistere da sempre. In **Dati fiscali**: la scheda «Attivazioni fiscali» arriva dall'onboarding con il CF di Byup, i sette tap e il controllo che la prima volta non trova nulla; «Chi trasmette gli scontrini» diventa **«Incaricato Fisconline»** e cambia insieme nome, cognome, codice fiscale, **password e PIN**, con la trasmissione di prova che decide — finché non passa restano attivi i dati di prima; spariscono la riga «Scontrini e fatture passano dal canale OpenAPI», il riquadro verde «Collegamento attivo» (un riepilogo che diceva che non c'era niente da fare), il pulsante «Rinnova la delega» (una delega valida non si rifà) e la scheda «Accredito degli incassi», che era il doppione della tessera Stripe. In **POS e integrazioni**: Stripe non ha più «Configura» ma **«Gestisci su Stripe ↗»**, che apre la dashboard in una scheda nuova; le tre piattaforme di consegna non hanno più «Che cosa farà» ma **«Collega»**, che apre il percorso vero di ciascuna — Store ID per Glovo, codice di collegamento e Partner Hub per Deliveroo, autorizzazione OAuth e scelta dei punti vendita per Uber Eats — dichiarato come simulazione, con l'add-on che resta spento; il foglio di Zapier perde il paragrafo «Chi risponde» e le due righe rimaste dicono l'essenziale. Le due notifiche di attivazione non sono più un riquadro in basso a destra che si dissolve in sei secondi — la forma giusta per «report mensile pronto», non per «senza questo non incassi»: sono **due fasce a tutta larghezza in cima alla Panoramica**, persistenti, che tornano a ogni ritorno finché la cosa non è fatta. Ognuna ha la sua azione e un **«Non ora»** che non è un annullamento silenzioso: apre il foglio che dice dove si fa la cosa (Impostazioni → POS e integrazioni per Stripe, Impostazioni → Dati fiscali per gli scontrini) e la mette a tacere per la sessione, non per sempre. Chiudere l'onboarding **azzera i registri delle due attivazioni** (Stripe, credenziali, delega, censimento POS, stato di lettura delle notifiche e i «Non ora» della sessione): finire l'onboarding vuol dire un locale nuovo, e un locale nuovo non ha ancora né Stripe né il fiscale — senza quel reset le fasce dipendevano da quello che era rimasto in quel browser, e in un browser già usato non comparivano affatto. Le fasce vivono nei tre punti dove si atterra finito l'onboarding — Panoramica (percorso rapido), Configurazione completa (percorso completo) e Profilo → Piani, dove porta la fine della configurazione — così comparire «subito dopo l'onboarding» non dipende da quale strada si è presa. In POS e integrazioni sparisce anche il riquadro «Il canale fiscale non si configura qui»: spiegava l'assenza di una tessera, e l'assenza non ha bisogno di essere spiegata. Anche la tessera **«Scarica Byup Staff»** lascia l'onboarding: chiedeva di portarsi via l'app quando il locale non aveva ancora né menù né tavoli, e ora sta in **Impostazioni → Personale**, nella colonna destra sotto «Collega un dispositivo» — che è il gesto che la presuppone — rifatta verticale sui token PN, col QR e la mascotte; sta anche nella rail dello step Personale della Configurazione completa, che è l'altro posto in cui il personale si mette in piedi. Da Profilo → Account e fatturazione esce il riquadro «Intestate a», che accanto allo storico delle fatture faceva la cronaca del cambio di soggetto.

**4 set — le venti voci della cartella «modifiche prototipo», applicate.** Un blocco solo, dalle decisioni del titolare del 3 e 4 settembre (D-102…D-108). **Fiscale:** le forme giuridiche sono tre e il professionista esce, l'ente non è più «in attesa»; le credenziali dell'Agenzia sono sempre dell'esercente — del titolare, o della persona che il *locale* nomina incaricata sul portale — e l'«incaricato di Byup» è ritirato ovunque, gestionale, onboarding, Hubble e documenti; alla scadenza della password l'emissione **si ferma davvero** nei quattro punti dove nasce un documento, coi tre gradini a 14, 7 e 3 giorni in Dati fiscali, in Cassa e nelle notifiche. **Account e soggetto:** non esiste più un cambio del titolare — l'account è della persona, i recapiti si verificano prima di sostituire i vecchi e ogni modifica finisce nel registro delle attività — e quello che cambia è il soggetto fiscale, con la catena a sei passi che si chiude sulla **riaccettazione dei termini** a nome del nuovo soggetto. **IVA:** l'articolo dichiara la **tipologia** fra cinque voci, non l'aliquota, e il profilo discende da tipologia × modo di consumo, in cassa come nel menù; via la spunta «Prodotto finito» e il foglio di riproposta, al cambio di modo le aliquote si ricalcolano da sole con un avviso di una riga. **Stampa:** due usi, due vie — le comande solo da stampanti che interrogano il nostro server (CloudPRNT, Server Direct Print) o dal KDS, i documenti dal browser di qualunque postazione; la sezione Impostazioni → Stampanti sparisce e diventa «Collega stampante» in POS e integrazioni, il pre-conto stampa davvero ed è un documento distinto dalla cortesia, il ponte Bluetooth dell'App Staff esce dall'MVP. **Contabilità:** «Verifica fiscale» non esiste nel regime attuale — diventa la porta verso la console della Soluzione — e al suo posto c'è la riga «In caso di controllo», che manda al portale dove la prova sta davvero; il periodo acquista «Oggi e ieri». **Il resto:** un solo dizionario di allergeni coi codici del modello e le allergie a scheda aperta in Sala; Just Eat esce e entra Uber Eats; Aruba e Google My Business escono dal catalogo, «Suggeriti per te» sparisce e la pagina si riordina in tre blocchi; le notifiche hanno un avviso d'arrivo, un suono e un riquadro in Panoramica; in Hubble il ciclo di vita torna ai cinque stati del modello con «configurazione saltata» come contrassegno, e arriva l'area «Richieste delle autorità». Nell'app la scala del recupero torna a tre-uno-tre-cinque-tre-chiuso, i contrassegni Byuppini escono, i dati anagrafici si modificano e si confermano, e i suggerimenti non leggono più la dieta senza un consenso distinto.

**25 ago — il conto si salda in due passi, e le correzioni diventano una modalità.** Per incassare un tavolo si aprivano due finestre — «Conto» e dietro «Salda conto», quest'ultima spaccata in due colonne — cioè tre superfici per un gesto solo. La finestra «Conto» **sparisce**: «Vai al conto» apre direttamente il saldo, e il saldo è una finestra in **due passi** invece che due colonne. Primo passo *Cosa saldi*: la lista a tutta larghezza, le spunte, «Seleziona tutti», il saldo residuo riga per riga, e in fondo la cifra con le due strade ai due angoli — «Modifica» a sinistra, «Procedi al pagamento» a destra. Secondo passo *Da incassare*: la cifra riscrivibile, lo sconto, quello che è già arrivato, il metodo e la conferma; lì la finestra si stringe da 1080 a **620**, che è la misura della finestra Incassa di Vendita diretta, e la testata si rifà su due righe (titolo e chiusura sopra, ritorno + pre-conto + fattura sotto). **Gli ordini già saldati slittano in fondo** alla lista: in cima resta il lavoro da fare. «Modifica» apre una **modalità dichiarata** dentro il primo passo — via le spunte, arrivano il cestino sempre visibile, il pulsante «Aggiungi articolo» (che si apre in campo di ricerca solo quando lo si preme, al posto della barra sempre aperta), la quantità *ordinata* e il **prezzo unitario riscrivibile con una cornice tratteggiata che gira** (`saldaAnts`, che rispetta `prefers-reduced-motion`); i piatti già pagati lì dentro non compaiono, e «Annulla» rimette il conto com'era mentre «Salva» lo chiude. Con la lista piatta se ne vanno `ListaPerCanale` e `SALDA_CANALI` — il raggruppamento per canale viveva solo nella finestra sparita, la provenienza resta scritta sulla riga.

**9 ago — via il progetto Vue.** `gestionale/vue-components/` è stato cancellato: era la migrazione a Vue 3 + Vite, ferma da fine luglio alla sola Panoramica, cioè a una versione della dashboard che il prototipo React ha già superato. Tenerlo significava tenere in vita una seconda implementazione parziale e disallineata di una schermata sola. Quello che c'era dentro e **non era Vue** — i quattro ERD v0.7 in DBML (sorgente di verità del DB), il riferimento agli enum e i due PDF di progettazione tecnica e flussi — è stato spostato in **`backend/erd/`**, che è dove il modello dati ha senso di stare: non dipende dal frontend, e infatti è sopravvissuto a lui.

**9 ago — ruoli di sistema, ruoli personalizzati, aree cliccabili delle tabelle.** In Impostazioni → Personale l'editor dei permessi era di facciata: «Salva modifiche» chiudeva e basta. Ora vale la regola vera: Cassa, Cameriere e Titolare sono **ruoli di sistema**, hanno permessi di partenza e non si smontano — aprirne i permessi e salvare non li cambia, si esce con un **ruolo personalizzato nuovo**, e il ruolo di sistema resta intatto. Un personalizzato invece si modifica sul posto. Due ruoli non possono chiamarsi allo stesso modo: salvando un nome già in uso esce un popup che ferma il salvataggio e rimanda al modulo con dentro quello che c'era. La matita «permessi» sulle righe dei ruoli è stata **tolta** — i permessi si aprono solo da «Crea ruolo» — e con lei lo stato `editRole`: il ramo `role` di `CreateRoleModal` resta nel codice come regola di prodotto, oggi senza porta d'ingresso. In tutto il repo le **intestazioni di colonna ordinabili** sono tornate cliccabili solo sul nome: erano bottoni dentro una griglia, e in griglia un figlio si allarga per tutta la cella anche con `padding: 0` — 18 intestazioni fra `SortHead` (Statistiche), i Conti della Contabilità e `PromoTable` di Spot.

**7–8 ago — Statistiche rifatta, Cucina a due monitor, Menù a tre colonne, Personale e Sala.** La sessione più grossa dall'inizio del prototipo, ~190 commit.

- **Statistiche.** Le tre schede sono ora **Economici · Operazioni · Clienti** (la scheda «App» è diventata Clienti, con sotto-schede *Conversione* e *Fidelizzazione*); barra e sub-tab restano incollate in alto mentre si scorre, e si atterra su Economici. *Vendite piatti* rifatta — KPI con il gradiente di Ricavi e costi, scontrino medio e il suo trend spostati qui, podio dei piatti, card del margine più alto, distribuzione per categoria, tabella con foto, categoria e margine per piatto accanto al margine %. *Operazioni → Ordini* distingue tre canali (sala, asporto, vendita diretta) e accoglie «Articoli per ordine»; la heatmap oraria mostra il ritmo invece di 63 numeri; *Prenotazioni* passa all'impaginazione di Economici. *Team* diventa due classifiche — scontrino e mancia per tavolo — e perde tabella ed export. Il **funnel di conversione** è quattro righe e arriva fino alla recensione. **Valutazioni** rifatta in una card sola: il voto è quello **byup**, le recensioni scorrono, si filtrano per stelle e per problema e si segnalano, la distribuzione filtra l'elenco. Le recensioni **Google sono uscite** da qui e il collegamento dell'account è uscito dalla Vetrina: erano schede senza piatto e senza caselle, e leggerle si va a farlo su Google.
- **Cucina.** Il KDS v2 non è più solo una route a sé: in testata si sceglie **quale monitor** guardare, e la visualizzazione è del monitor (si decide in Impostazioni → Personale, non qui). Con un monitor su «Pub» la cucina mostra la board del KDS v2, alimentata dal **servizio vero** e non più dai suoi dati finti — la conversione ticket → porzioni sta in `cucina-kds2-da-cucina.jsx`, in un file solo, così sparirà con i mock. «Schermo intero» toglie anche la sidebar.
- **Impostazioni → Menù.** Si lavora a **tre colonne** — categorie, piatti, dettaglio. L'anteprima è la schermata dell'app e non un'idea di schermata; gli allergeni hanno un segno disegnato invece dell'iniziale; i piatti hanno gli ingredienti.
- **Impostazioni → Personale.** Persone e dispositivi in una tabella sola che si prende la pagina; in riga il dispositivo dice se è monitor o stampante; il menu «⋯» fa quello che dice; «Modifica associazione» è una finestra di modifica e il cambio password del dispositivo passa da una conferma; il ruolo si sceglie da un selettore nostro; il titolare è teal col lucchetto disegnato.
- **Impostazioni → Sala e tavoli.** «Ruota» arriva anche sulla mappa; le unioni restano **una fila retta** in tutti i casi, gruppo su gruppo compreso. La geometria della sala — ingombro, sovrapposizione, ricerca del posto libero, fila, rotazione — è scritta **una volta sola** in `sala-geometria.jsx` e la usano sia Sala sia Impostazioni: erano due copie divergenti che facevano correggere lo stesso difetto due volte.
- **Configurazione completa.** Tessere-ruolo orizzontali, il monitor cucina chiede Pub o Ristorante al collegamento, il menu dispositivo chiede quale stampante.
- **App consumer.** Il gratta e vinci diventa **Byuppino Run**, l'età minima per registrarsi scende a **14 anni**, il carrello si trascina (il tap resta sulla lineetta), lo swipe divide un piatto per volta. Chiuso l'**audit privacy/legale**: cookie policy self-built, opt-out analytics nel pannello consensi, disclaimer sui valori nutrizionali generati con IA, genere esplicito in registrazione.
- **Contabilità.** Lo stato di **trasmissione fiscale** è del pagamento e Conti ne è la casa; le chiusure di cassa la derivano.

**6 ago — statistiche economiche, Supporto e assistente IA.** Ricavi e costi ridisegnata (barre che dicono la quota, «Totale costi» a due colonne con incidenza e peso della parte fissa, hover su box e spicchi del donut). Nel Supporto la chat **dichiara di essere un'IA**, il canale Email diventa **Ticket** (risposta entro 2 giorni lavorativi), «Parla con un operatore umano» apre Ticket o Prenota una chiamata, `?chat=1` apre la chat all'arrivo. Nuovo **assistente IA fluttuante** (`byup-ai-fab.jsx`): bollino trascinabile su tutte le schermate tranne il Supporto, seconda conferma prima di pubblicare, esempi a rotazione nel campo. Dettagli in `DESIGN_DECISIONS.md` § «Statistiche economiche, Supporto e assistente IA — 6 ago 2026».

**31 lug — ruoli del personale, referral fra locali, pulizia del codice morto.** I ruoli diventano tre — Cassa, Titolare, Cameriere — più dispositivi e ruoli personalizzati; `ALL_AREAS` guadagna **Vendita diretta** e passa a nove sezioni. Nuovo **referral fra locali** (due mesi gratis a testa) in Profilo → Piani, nelle Azioni rapide, in ⌘K e come «Codice invito» nello step 2 dell'onboarding. Rimosse ~395 righe di codice morto su 21 file. Dettagli in `DESIGN_DECISIONS.md` § «Ruoli del personale, referral e azioni rapide — 31 lug 2026».

**29 lug — batch Impostazioni** (Vetrina, Sala e tavoli, Personale, POS e integrazioni). Vetrina salva da una barra fissa in fondo, Sala e tavoli con selezione ad anello e menu a vetro, Personale come tabella unica, integrazioni a tessere quadrate. Dettagli in `DESIGN_DECISIONS.md` § «Batch Impostazioni — 29 lug 2026».

**28 lug — riallineamento percorsi alla struttura del repo `Byup/`** e rimozione del codice morto: copie mai linkate delle app consumer/cameriere, token legacy `BU`, `cucina-tab-storico.jsx`, `tweaks-panel.jsx`, `_demo-card-*.html`.

---

## 1. Stato attuale — Fase 1 MVP **completata e testata**

✅ **55 / 55 sub-test passati** sulla checklist di validazione Fase 1.
✅ **Build TypeScript verde**, `npm test` verde (9/9 unit), `npm run test:e2e` verde (41 passati + 2 skip documentati su 4 suite: auth critico + hardening A/B/C — vedi §5.6).
✅ **Docker Compose** funzionante (Postgres 16 + Redis 7 + app).
✅ **23 tabelle DB** create da TypeORM sync, allineate all'ERD v0.7.
✅ **Checklist funzionale rieseguita via HTTP** contro il server reale (container Docker) il 30 mag 2026: **74/74 flussi verdi** — script ri-eseguibile in `backend/scripts/phase1-functional-check.sh` (vedi §5.7 e §8).

### Cosa significa "Fase 1 MVP" nel contesto Byup

La Fase 1 copre **l'identità e la collaborazione**: chiunque possa registrarsi, configurare il proprio locale, gestire un team con ruoli e permessi, configurare dispositivi cucina/cassa, gestire sessioni multi-dispositivo, e fare reset password senza email leak. **Niente operatività**: la presa ordini, la comanda in cucina, il conto e il pagamento sono **Fase 2**.

Frase di sintesi: "un ristorante può registrarsi e creare il proprio team con piena sicurezza, ma non può ancora servire un cliente."

### Cosa NON è in Fase 1 (rimandato)

- **Email reale** (SES) — il `devToken` di reset/invito è esposto nella response come comodità dev. Da togliere in produzione.
- **Stripe Connect reale** — l'endpoint `POST /onboarding/stripe-connect` ritorna un URL placeholder.
- **Claude API reale** — l'AI processing del menu è simulato con `setTimeout(5s)` + dati mock.
- **S3 upload** — il file menu arriva al backend come `fileKey` già caricato dal client.

Tutti documentati come TODO espliciti in `backend/BACKEND.md` e ripresi sotto.

---

## 2. Moduli costruiti

Tutti i moduli vivono in `backend/src/modules/`. Architettura: **modular monolith** in NestJS, ogni modulo isolato con entities/service/controller propri, comunicazione cross-module via `exports`.

### 2.1 `identity/`

Tenant + auth staff + collaborazione (inviti, ruoli custom, sessioni, 2FA, password reset, switch tenant).

**Sotto-moduli:**
- `identity/auth/` — autenticazione (login/register/refresh/me/sessions/2FA/password reset/switch-tenant)
- `identity/users/` — `UsersService` lookup-only
- `identity/staff/` — gestione team del titolare (inviti, membership, ruoli custom)

**Entities:** `User`, `Session`, `UserTwoFa`, `Restaurant`, `Role`, `Membership`, `Invitation`, `PasswordReset`.

**Endpoint pubblici:**
```
POST   /auth/staff/register
POST   /auth/staff/login
POST   /auth/staff/login/2fa
POST   /auth/refresh
POST   /auth/password/forgot
POST   /auth/password/reset
GET    /staff/invitations/verify?token=...
POST   /staff/invitations/accept
```

**Endpoint con JWT:**
```
GET    /auth/me
GET    /auth/memberships
POST   /auth/switch-tenant
GET    /auth/sessions
DELETE /auth/sessions/:id
DELETE /auth/logout
DELETE /auth/logout/all
POST   /auth/2fa/setup | enable
DELETE /auth/2fa/disable
GET    /staff/roles
```

**Endpoint solo titolare (`JwtAuthGuard` + `OwnerGuard`):**
```
POST   /staff/invitations
GET    /staff/invitations
DELETE /staff/invitations/:id
GET    /staff/members
PUT    /staff/members/:id/role
DELETE /staff/members/:id
POST   /staff/roles
PUT    /staff/roles/:id
DELETE /staff/roles/:id
```

### 2.2 `venue/`

Sedi, sale, tavoli, orari, impostazioni operative del locale.

**Entities:** `Venue`, `Room`, `Table`, `VenueHours`, `VenueSettings`.

**Endpoint:**
```
GET    /venue
GET    /venue/hours
PUT    /venue/hours              ← replace completo (7 giorni)
GET    /venue/settings           ← lazy-create con default ERD
PATCH  /venue/settings           ← partial update
```

### 2.3 `onboarding/`

Orchestrazione del journey post-registrazione, mappato 1:1 sui 4 step del prototipo JSX.

**Entities:** `OnboardingProgress`, `RestaurantFiscalData`.

**Endpoint:**
```
GET    /onboarding/status
POST   /onboarding/menu          ← step 1: avvia AI mock 5s
GET    /onboarding/menu/ai-result
POST   /onboarding/menu/ai-review
PUT    /onboarding/locale        ← step 2a
POST   /onboarding/stripe-connect ← step 2b (placeholder)
POST   /onboarding/rooms          ← step 3 (replace idempotente)
POST   /onboarding/go-live        ← step 4
```

**Hook critico:** quando il mock AI termina, `OnboardingService.simulateAiProcessing` chiama `CatalogService.createFromAiResult` che popola **menu reale + categorie + piatti**. End-to-end completo: dal `POST /onboarding/menu` puoi subito chiamare `GET /catalog/menus/:id` dopo 5 secondi.

### 2.4 `catalog/`

Menu, categorie, piatti, allergeni e tag.

**Entities:** `Menu`, `MenuCategory`, `MenuItem`, `Allergen`, `Tag`, `MenuItemAllergen`, `MenuItemTag`.

**Seed automatico al boot** (`CatalogSeedService.onApplicationBootstrap`):
- 14 allergeni UE (gluten, crustaceans, eggs, fish, peanuts, soybeans, milk, nuts, celery, mustard, sesame, sulphites, lupin, molluscs)
- 6 tag piattaforma (senza_glutine, vegano, vegetariano, bio, piccante, senza_lattosio)

Idempotente via `upsert(['code'])` / `upsert(['name'])`.

**Endpoint (16 totali):**
```
GET    /catalog/allergens
GET    /catalog/tags
GET    /catalog/menus
POST   /catalog/menus
GET    /catalog/menus/:menuId           ← tree menu→categorie→piatti
PUT    /catalog/menus/:menuId
DELETE /catalog/menus/:menuId
POST   /catalog/menus/:menuId/categories
PUT    /catalog/categories/:id
DELETE /catalog/categories/:id
GET    /catalog/categories/:id/items
POST   /catalog/categories/:id/items
PUT    /catalog/items/:id
DELETE /catalog/items/:id
PUT    /catalog/items/:id/allergens     ← replace set
PUT    /catalog/items/:id/tags          ← replace set
```

### 2.5 `devices/`

Tablet, KDS (kitchen monitor), POS terminal. Login dispositivo con scope ridotto.

**Entities:** `Device`.

**Strategie auth:** oltre a `JwtAccessStrategy` (staff) esiste `JwtDeviceStrategy` con payload `{ sub, type:'device', deviceType, venueId, restaurantId, scope[] }`. I due tipi di token non sono interoperabili: un JWT device su un endpoint staff → 401.

**Scope per tipo:**
- `kds` → `kitchen:read, kitchen:update`
- `pos_terminal` → `orders:read, payments:create, payments:read`
- `tablet` → `orders:read, orders:create`

**Endpoint pubblici:**
```
POST   /devices/login            ← username/password locale, ritorna deviceToken (TTL 365gg)
```

**Endpoint solo titolare:**
```
GET    /devices
POST   /devices                  ← genera username + password per type='kds'
PUT    /devices/:id
DELETE /devices/:id
POST   /devices/:id/regenerate-password
```

---

## 3. Struttura cartelle

```
Byup/                            ← root del repo (Desktop/Byup)
├── vercel.json, index.html      ← deploy Vercel + landing "Ecosistema" con i link a tutte le superfici (il redirect alla Login è gestionale/index.html)
├── gestionale/                  ← prototipo React/HTML del gestionale ────────
│   ├── CLAUDE.md                ← project overview (riferimento globale)
│   ├── PROGRESS.md              ← QUESTO FILE: stato sviluppo tra sessioni
│   ├── DESIGN_DECISIONS.md      ← design system frontend
│   ├── README.md
│   └── *.jsx, *.html            ← prototipi React/HTML del gestionale
├── app/, hubble/, staff/, cameriere/, web/  ← altre superfici (app consumer, console Hubble, POS staff, cameriere web, webapp guest)
│
├── backend/                     ← NestJS modular monolith ──────────────────
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── docker-compose.yml       ← Postgres + Redis + app
│   ├── Dockerfile               ← multi-stage dev/builder/prod
│   ├── .env                     ← (gitignored)
│   ├── .env.example
│   ├── api.http                 ← collection REST Client VS Code
│   ├── jest-e2e.json
│   ├── BACKEND.md               ← reference dettagliato decisioni backend
│   ├── erd/                     ← modello dati, indipendente dal codice ─────
│   │   ├── *.dbml               ← 4 file ERD v0.7 (sorgente di verità DB)
│   │   └── byup-database-enums-reference-v7.md  ← valori e stati DB
│   ├── src/
│   │   ├── main.ts              ← bootstrap: helmet, ValidationPipe, ExceptionFilter
│   │   ├── app.module.ts        ← root + ThrottlerModule globale
│   │   ├── config/
│   │   │   └── configuration.ts ← Joi schema + typed config
│   │   ├── database/
│   │   │   └── database.module.ts ← TypeORM async factory
│   │   ├── common/
│   │   │   ├── decorators/current-user.decorator.ts
│   │   │   └── filters/http-exception.filter.ts
│   │   └── modules/
│   │       ├── identity/
│   │       │   ├── identity.module.ts
│   │       │   ├── entities/    (User, Session, UserTwoFa, Restaurant, Role, Membership, Invitation, PasswordReset)
│   │       │   ├── auth/
│   │       │   │   ├── auth.controller.ts
│   │       │   │   ├── auth.service.ts
│   │       │   │   ├── auth.module.ts
│   │       │   │   ├── sessions.service.ts
│   │       │   │   ├── sessions.service.spec.ts
│   │       │   │   ├── dto/
│   │       │   │   ├── guards/  (JwtAuthGuard, OwnerGuard)
│   │       │   │   └── strategies/jwt-access.strategy.ts
│   │       │   ├── users/
│   │       │   └── staff/       (invitations + memberships + roles custom)
│   │       ├── venue/
│   │       │   ├── venue.module.ts
│   │       │   ├── venue.controller.ts
│   │       │   ├── venue.service.ts
│   │       │   ├── entities/    (Venue, Room, Table, VenueHours, VenueSettings)
│   │       │   └── dto/
│   │       ├── onboarding/
│   │       │   ├── onboarding.module.ts
│   │       │   ├── onboarding.controller.ts
│   │       │   ├── onboarding.service.ts
│   │       │   ├── entities/    (OnboardingProgress, RestaurantFiscalData)
│   │       │   └── dto/
│   │       ├── catalog/
│   │       │   ├── catalog.module.ts
│   │       │   ├── catalog.controller.ts
│   │       │   ├── catalog.service.ts
│   │       │   ├── entities/    (Menu, MenuCategory, MenuItem, Allergen, Tag, +N:M)
│   │       │   ├── seeds/catalog.seed.ts
│   │       │   └── dto/
│   │       └── devices/
│   │           ├── devices.module.ts
│   │           ├── devices.controller.ts
│   │           ├── devices.service.ts
│   │           ├── entities/device.entity.ts
│   │           ├── strategies/jwt-device.strategy.ts
│   │           ├── guards/jwt-device.guard.ts
│   │           └── dto/
│   ├── scripts/
│   │   └── phase1-functional-check.sh ← checklist funzionale Fase 1 via curl (vedi §5.7, §8)
│   └── test/
│       ├── auth.e2e-spec.ts     ← e2e Jest+supertest: register/login/me/duplicate/protected
│       ├── helpers.ts
│       └── section-a|b|c-*.e2e-spec.ts ← suite hardening (vedi §5.6)
│
└── ...
```

---

## 4. Decisioni architetturali

### 4.1 Modular monolith, NON microservizi
Dominio ancora in consolidamento, MVP veloce, team contenuto. Quando un modulo raggiunge stabilità + necessità di scaling indipendente, può essere estratto senza riscrittura del core.

### 4.2 Stack
- **NestJS 10** + TypeScript (decoratori IoC, DX eccellente).
- **TypeORM 0.3** (integrazione nativa NestJS, entity-as-truth).
- **PostgreSQL 16** (ACID, schema relazionale coerente con ERD).
- **Redis 7** (predisposto: cache + rate limit + supporto realtime futuro).
- **bcrypt rounds=12** (cost factor solido nel 2026).
- **otplib** per TOTP 2FA.
- **@nestjs/throttler** per rate limiting.
- **passport-jwt** per JWT validation.

### 4.3 Auth strategy: JWT stateless + sessions DB

**Access token (JWT 15min):**
```json
{ "sub": userId, "type": "access", "sessionId", "restaurantId", "role" }
```

**Refresh token (opaco 30gg):**
- 48 random bytes hex (96 char)
- Hash SHA-256 salvato in `sessions.token_hash`
- **Rotazione ad ogni `/auth/refresh`**: la vecchia sessione viene revocata e ne nasce una nuova
- Verifica server-side abilita revoca immediata (altrimenti JWT puro non sarebbe revocabile prima dell'`exp`)

**2FA pending token (JWT 5min, secret separato):**
- Emesso quando il login riconosce 2FA attiva
- Tipo `'2fa_pending'`, non utilizzabile sugli endpoint protetti
- Speso su `POST /auth/staff/login/2fa` con il codice TOTP

**Device token (JWT 365gg, scope ridotto):**
- Tipo `'device'`, payload include `scope[]`
- `JwtAuthGuard` (staff) e `JwtDeviceGuard` sono passport strategies separate → un device token su `/staff/members` viene rifiutato come 401

### 4.4 Tenant scoping: service-level esplicito invece di middleware globale

**Decisione presa in Fase 1.** Non c'è un middleware globale che fa `WHERE tenant_id = ?` ovunque. Ogni service ha helper privati come `requireMenu(restaurantId, menuId)`, `requireCategory()`, `requireMembership()` ecc. che:
1. Caricano la risorsa via id
2. Confrontano `resource.restaurantId` con `restaurantId` dal JWT
3. Lanciano `ForbiddenException` se non combaciano

**Perché:** un middleware globale che fa magic injection è elegante ma rischia bug silenti ("ho dimenticato di filtrare questa query"). Lo scoping esplicito è 1 riga in più per metodo ma impossibile dimenticarlo senza errore di compilazione. Trade-off accettato deliberatamente.

**Conta totale:** 30 chiamate `require[Resource]` nei service (verificato via grep, lug 2026). Vedi `BACKEND.md` per il riferimento.

### 4.5 PUT replace vs PATCH partial — semantica deliberata

- Endpoint che gestiscono **set completi** sono PUT replace, idempotenti:
  - `PUT /venue/hours` (i 7 giorni vivono insieme)
  - `PUT /catalog/items/:id/allergens` (il set di allergeni del piatto)
  - `PUT /catalog/items/:id/tags`
  - `POST /onboarding/rooms` (è POST per convenzione onboarding, ma è replace)
- Endpoint che gestiscono **stato granulare** sono PATCH partial:
  - `PATCH /venue/settings` (13 campi, cambi uno alla volta)

**Vantaggio del replace:** il client può fare "salva e riprendi" senza preoccuparsi dello stato precedente.

### 4.6 Lookup table seedate al boot

`Allergen` e `Tag` sono **lookup globali**, non per-tenant. Vengono seedate da `CatalogSeedService.onApplicationBootstrap` con `upsert` per `code` / `name` → idempotente, sicuro a riavvii multipli. Mai modificabili da tenant.

### 4.7 Lazy-create con default per `VenueSettings`

La prima `GET /venue/settings` materializza il record con tutti i default ERD (15/25/90 min warning/alert/overstay, `kitchen_mode='kds'`, `payment_methods=['card_terminal','cash']`). Nessuna migration one-shot da scrivere.

### 4.8 Risposta API standard

```json
{ "success": true, "data": {...} }
{ "success": false, "error": { "code": "Forbidden", "message": "..." } }
```

Implementato da `GlobalExceptionFilter` ovunque, anche sui test e2e. Validation Pipe in modalità whitelist + forbidNonWhitelisted: campi sconosciuti → 400.

### 4.9 Protezioni anti-lockout (RBAC)

In `StaffService`:
- Non si può rimuovere il ruolo "titolare" all'**ultimo titolare attivo** (`ensureNotLastOwner`)
- Non si può disattivare l'ultimo titolare
- Non si può **auto-disattivarsi**
- Non si può **auto-degradarsi** da titolare

Tutte e 4 le check sono testate ed entrano in 400 con messaggi specifici.

### 4.10 Password reset: SHA-256 hash, monouso, 30min

- Token = 32 random bytes hex (64 char) consegnato al client
- Hash SHA-256 salvato in `password_resets.token_hash`
- TTL 30 minuti
- All'utilizzo: marca `used_at`, **revoca tutte le sessioni attive** dell'utente (chi conosceva la vecchia password non deve più stare loggato)
- Endpoint `POST /auth/password/forgot` ritorna sempre `success: true` (no email enumeration)
- In dev espone `devToken` nella response (da rimuovere quando SES è attivo)

### 4.11 DB_SYNC=true in dev, migrazioni in prod

- In dev: `synchronize: true` in TypeORM → schema aggiornato automaticamente al boot
- In prod: deve essere `false`, con migration files versionati. **TODO esplicito**, vedi sezione 6.

### 4.12 Hot-reload via `nest start --watch`

Modifiche al codice → restart automatico del processo (PID cambia). Non richiede stop/start manuale durante lo sviluppo.

### 4.13 `strictNullChecks: true` — entità TypeORM "oneste"

**Decisione presa il 30 mag 2026.** Attivato `strictNullChecks` in `tsconfig.json` (prima era `false`). La compilazione strict ha fatto emergere 36 errori, risolti tutti (build `tsc --noEmit` verde).

**Causa radice del grosso degli errori:** molte entità dichiaravano colonne `@Column({ nullable: true })` ma le tipizzavano come non-null (es. `vatNumber: string`, `enabledAt: Date`, `recoveryCodes: string[]`). Il tipo mentiva rispetto allo schema DB. **Regola adottata:** una colonna `nullable: true` si tipizza sempre `T | null`. Entità corrette: `Restaurant.vatNumber`, `Venue.phone`, `UserTwoFa.enabledAt/recoveryCodes`, `Device.deviceModel/username/passwordHash`, `OnboardingProgress.menuSourceUrl/websiteUrl`, `RestaurantFiscalData.regimeFiscale`, `MenuCategory.description`, `MenuItem.description/foodCost/recipe/prepTimeMinutes`.

**Bug runtime veri intercettati:** 6 `findOne()` il cui risultato (`T | null` in TypeORM 0.3) veniva dereferenziato senza guardia → potenziale `TypeError`/500 invece di un errore pulito. Aggiunte guardie esplicite in `setup2fa`, `disable2fa`, `me` (auth) e `getStatus` (onboarding), più la guardia su `titolareRole` nel register. Config garantita da Joi → `getOrThrow` in `main.ts`, `totpIssuer`, `refreshTokenTtlDays`.

**Convenzione:** d'ora in poi le nuove entità e i nuovi service nascono già null-safe. Vedi memoria persistente per il dettaglio del perché.

### 4.14 `JwtAccessPayload.restaurantId/role` restano `string` (non-null)

**Decisione collegata alla 4.13.** Sui sign-site del token, `restaurantId`/`role` erano valorizzati con `?? null` (difensivo). Tipizzare il payload come `string | null` sarebbe stato *letteralmente* più onesto, ma avrebbe fatto esplodere ~40 controller che estraggono `user.restaurantId` e lo passano a service tenant-scoped che lo richiedono `string`.

**Scelta:** il payload resta `restaurantId: string` / `role: string`, perché su quelle rotte (tutte sotto `JwtAuthGuard`, tutte su risorse di un tenant) **un token staff porta sempre** un ristorante attivo. L'invariante è reso esplicito da due guardie ai sign-site `refresh` e `issueFullSession`: se manca la membership attiva → `UnauthorizedException`. È uno stato impossibile in pratica (chi si registra possiede ≥1 ristorante e l'anti-lockout — vedi 4.9 — impedisce di perderne l'ultimo), ma ora è impossibile *anche per il compilatore* invece che gestito con `?? null` silenzioso. `register` e `switchTenant` già firmavano valori non-null e non sono stati toccati.

### 4.15 Esecuzione test/app: solo nel terminale utente (nota ambientale)

L'ambiente di esecuzione Claude Code (harness) **non può eseguire la suite jest né bootare l'app**: macOS vieta il caricamento di addon nativi `.node` nel processo dell'harness (`library load disallowed by system policy`). Questo colpisce il resolver nativo di jest 30 (`unrs-resolver`) e `bcrypt`. Gate di verifica usabile dentro l'harness = `node ./node_modules/typescript/bin/tsc --noEmit -p tsconfig.json`. **I test runtime (unit + e2e) vanno lanciati nel terminale dell'utente.** La cartella di progetto era stata rinominata `Byup Fresh` → `Byup-Fresh` (rimosso lo spazio); oggi il progetto vive nel repo `Desktop/Byup` — utile per tooling locale, ma non è la causa del limite sopra.

### 4.16 Access token revocabile: la JwtAccessStrategy valida la sessione

**Decisione presa il 30 mag 2026 (revisione di 4.3).** La `JwtAccessStrategy.validate` non si limita più a controllare `payload.type`: fa anche una lookup della sessione (`payload.sessionId`) e verifica che sia **attiva e non scaduta**, altrimenti `401`.

**Perché:** la specifica di hardening (test C.5 e C.12) richiede che **logout, revoca da un altro dispositivo, rotazione del refresh e cambio password** invalidino l'access token *immediatamente*, non solo alla scadenza naturale (15 min). Prima il token restava valido fino all'`exp` anche dopo il logout.

**Trade-off:** una query DB indicizzata (PK sessione) per ogni richiesta autenticata, in cambio della revocabilità immediata. Accettabile a scala MVP; quando il volume cresce, la sessione è cachabile su Redis (già previsto in architettura). I **device token** (strategy separata `JwtDeviceStrategy`) NON sono toccati: restano persistenti 365g e non dipendono dalle sessioni staff (coerente col test C.11).

---

## 5. Bug intercettati e risolti

Memoria di tre bug "non ovvi" emersi durante i test, salvati anche come `feedback-*.md` nella memoria persistente.

### 5.1 FK violation su `sessions.user_id` al register

**Sintomo:** la prima `POST /auth/staff/register` falliva con `insert or update on table "sessions" violates foreign key constraint`.

**Causa:** `SessionsService.create()` usa il suo repository iniettato → connessione separata dal callback `dataSource.transaction(em => …)`. L'INSERT su sessions partiva prima del commit di users → FK fallita.

**Fix:** la transazione di register ora include solo user/restaurant/roles/membership/onboarding_progress. La creazione di session + token avviene **dopo** il commit. Regola generale: un repository iniettato fuori dall'EntityManager della transazione non è transactional.

### 5.2 `EntityMetadataNotFoundError` su `RestaurantFiscalData`

**Sintomo:** `PUT /onboarding/locale` → 500 con `No metadata for "RestaurantFiscalData" was found`.

**Causa:** l'entity era usata solo via `em.findOne(RestaurantFiscalData, ...)` dentro la transazione, e nessun `TypeOrmModule.forFeature` la registrava. `autoLoadEntities: true` da solo NON basta per registrare un'entity nel metadata registry.

**Fix:** aggiunta a `OnboardingModule.forFeature([…])`. **Regola di stile**: registra sempre tutte le entity nel modulo dove vivono, anche quelle "ausiliarie" usate solo via `em`.

### 5.3 Rate limit "fratricida" durante test E2E

**Sintomo:** durante un test E2E con molti `POST /auth/staff/login` consecutivi, alcuni assert fallivano per `401 Unauthorized` invece di rispondere normalmente.

**Causa:** il throttler globale (5 login/min/IP, per design) bloccava lo script di test, non il sistema sotto test.

**Fix lato test:** riusare i token già acquisiti invece di rilogarsi, oppure aspettare 60s tra burst. Nessuna modifica al server (il rate limit È desiderato).

### 5.4 `DataTypeNotSupportedError: Data type "Object"` dopo l'attivazione di `strictNullChecks`

**Sintomo:** dopo la modifica 4.13, `npm test` (unit) restava verde ma `npm run test:e2e` falliva *tutti* i test con `DataTypeNotSupportedError: Data type "Object" in "<Entity>.<col>" is not supported by "postgres"` alla `DataSource.initialize`. L'errore appariva su un'entity diversa a ogni fix (prima `UserTwoFa.enabledAt`, poi `Restaurant.vatNumber`) perché il validator TypeORM si ferma alla prima colonna invalida.

**Causa:** tipizzando i campi nullable come union `T | null`, `emitDecoratorMetadata` serializza il `design:type` come `Object` per **qualsiasi** union — incluso `string | null` (non solo Date/number). TypeORM non sa mappare `Object` a un tipo Postgres. Le colonne nullable tipizzate come tipo *puro* (es. `legalName: string`) non crashano perché la reflection emette `String`. **Bug invisibile a compile-time**: `tsc --noEmit` resta verde e gli unit test (che non aprono il DataSource reale) passano — emerge solo negli e2e o avviando l'app.

**Fix:** aggiunto `type` esplicito al `@Column` di tutte e 10 le colonne tipizzate `T | null` senza type: `UserTwoFa.enabledAt` (timestamp), `MenuItem.prepTimeMinutes` (int), `Restaurant.vatNumber`, `Venue.phone`, `OnboardingProgress.menuSourceUrl/websiteUrl`, `RestaurantFiscalData.regimeFiscale`, `Device.deviceModel/username/passwordHash` (varchar). **Regola generale:** ogni colonna la cui proprietà è `T | null` deve avere `type:` esplicito. Verifica: `grep -rn "| null;" src/modules --include="*.entity.ts"` e controlla che la riga `@Column` precedente contenga `type:`.

### 5.5 Deprecation warning pg: "client is already executing a query"

**Sintomo:** durante gli e2e (flusso register) compariva `DeprecationWarning: Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0`.

**Causa:** in `AuthService.registerStaff` i ruoli di sistema venivano salvati con `Promise.all(roles.map(r => em.save(r)))` **dentro** la transazione → più `INSERT` concorrenti sullo stesso client `pg` transazionale.

**Fix:** sostituito con un singolo `em.save(roles[])` batch, che persiste in sequenza sullo stesso client. Nessun cambiamento semantico (sempre dentro la transazione di register). **Regola:** mai `Promise.all` di query sullo stesso `EntityManager`/client — usare save batch o `await` sequenziali.

### 5.6 Suite di hardening A/B/C — bug intercettati e corretti (30 mag 2026)

Aggiunta una suite e2e su tre aree (input malformati, concorrenza, edge temporali token). I test vivono in `test/section-a-malformed-input.e2e-spec.ts`, `test/section-b-concurrency.e2e-spec.ts`, `test/section-c-token-temporal.e2e-spec.ts` + helper `test/helpers.ts`. Bug reali emersi e corretti:

- **A.1 / A.14 — body-parser → 500 invece di 400/413.** Il `GlobalExceptionFilter` con `@Catch()` mappava a 500 ogni errore non-`HttpException`. Gli errori di body-parser (JSON malformato → 400, payload troppo grande → 413) portano uno `status` numerico ma non sono `HttpException`. **Fix:** ramo `isHttpishError` che rispetta `err.status/statusCode`.
- **A.6 — `restaurantName` di soli spazi accettato.** Mancavano trim + not-empty. **Fix:** `@Transform(trim)` + `@IsNotEmpty()` su `restaurantName/firstName/lastName` nel `RegisterStaffDto`.
- **A.15 — interi enormi → overflow int4 → 500.** I campi minuti di `VenueSettings` non avevano `@Max`: `999999999999` superava `int4` e arrivava al DB. **Fix:** `@Max` (1440 / 720) sui campi int del DTO.
- **B.1 — register concorrente stessa email → 500.** Il vincolo UNIQUE su `users.email` reggeva (mai due utenti), ma il perdente prendeva un `QueryFailedError` grezzo. **Fix:** catch SQLSTATE `23505` → `ConflictException` (409).
- **B.3 — replay del refresh token.** `findActiveByToken → revoke → create` non atomico: due refresh simultanei creavano due sessioni. **Fix:** `SessionsService.revokeIfActive` (UPDATE condizionale `WHERE is_active=true`, controllo `affected`) — un solo vincitore.
- **B.4 — doppio uso del token di reset.** Check-then-act non atomico. **Fix:** claim atomico `UPDATE ... WHERE used_at IS NULL` dentro la transazione.
- **B.2 — accept invito concorrente.** Nessun lock sulla riga invito → il perdente falliva con errore DB grezzo. **Fix:** `pessimistic_write` sulla riga `Invitation` (ruolo caricato a parte per non rompere il `FOR UPDATE` con l'outer join).
- **B.8 — anti-lockout aggirabile sotto concorrenza.** Due titolari che si declassano a vicenda passavano entrambi il check `ensureNotLastOwner` → zero titolari. **Fix:** `ensureNotLastOwner(em, ...)` con lock `pessimistic_write` su tutte le righe titolare attive, dentro la transazione di `updateMemberRole`/`deactivateMember`.

**Regola generale (concorrenza):** ogni invariante "una sola operazione vince" va imposta a DB con un claim atomico condizionato (`UPDATE ... WHERE <stato> ...` + check `affected`) oppure con un lock pessimistico sulla riga critica dentro una transazione — mai con un check-then-act applicativo.

**Note (documentate, non bug):**
- **B.7 / C.11** richiedono un device KDS provisionato (onboarding/venue completo) → `it.skip` con spiegazione, fuori scope della suite auth-only.
- **C.10** (replay TOTP nella stessa finestra) — comportamento attuale: accettato (nessun tracciamento del counter). Meno sicuro ma comune; il test lo documenta con assert tollerante `[200,401]`.

### 5.7 `PUT /onboarding/locale` → 500 su P.IVA duplicata

**Sintomo:** durante la riesecuzione via HTTP della checklist funzionale Fase 1 (74 flussi con curl contro il container, 30 mag 2026), `PUT /onboarding/locale` ritornava 500 quando la P.IVA era già usata da un altro ristorante.

**Causa:** `restaurants.vat_number` è UNIQUE; `updateLocale` faceva `em.update(Restaurant, …, { vatNumber })` senza catturare la violazione → `QueryFailedError` (SQLSTATE 23505) risaliva come 500. Stessa classe del bug B.1.

**Fix:** transazione di `updateLocale` avvolta in try/catch che converte 23505 → `ConflictException` ("Partita IVA già registrata da un altro ristorante.", 409). Verificato: con P.IVA libera la pratica passa (200), con P.IVA già presa → 409 pulito.

**Esito checklist:** 74/74 flussi verdi contro il server reale (auth, 2FA, onboarding end-to-end, catalog, venue, staff/ruoli/inviti/membri, RBAC, devices). La verifica gira via curl con throttler reale attivo (richieste spaziate ~1.1s) e calcolo TOTP lato client; non passa per jest (l'harness non carica gli addon nativi, ma il container Docker sì).

---

## 6. TODO rimasti

### 6.1 Critici per produzione

- [ ] **Migrazioni TypeORM** — disabilitare `DB_SYNC=true`, generare migration files versionati. Script `migration:generate` / `migration:run` / `migration:revert` già configurati in `package.json`. File `src/database/typeorm.config.ts` da creare.
- [ ] **Integrazione SES** per invio email reale di:
  - Reset password (rimuovere `devToken` dalla response di `/auth/password/forgot`)
  - Invito staff (rimuovere `token` dalla response di `POST /staff/invitations`)
  - Email verification (`email_verified` esiste in DB ma il flusso non è cablato)
- [ ] **Stripe Connect** flusso OAuth reale + callback per popolare `restaurants.stripe_connect_account_id` e `stripe_connect_status`.
- [ ] **Claude API** integrazione vera per il processing del menu — al posto del `setTimeout(5s)` in `OnboardingService.simulateAiProcessing`.
- [ ] **S3 upload presigned URL** per il file menu allegato in onboarding step 1 (attualmente il client passa `fileKey` come stringa libera).
- [ ] **CI/CD** — GitHub Actions per build + test + lint (TODO documento di progettazione tecnica).
- [ ] **Audit log** con retention 5 anni (TODO documento di progettazione tecnica).
- [ ] **Health check endpoint** (es. `GET /health`) per ECS/ALB liveness/readiness.

### 6.2 Funzionali non bloccanti

- [ ] **Accept invito come utente già loggato** — oggi se l'email dell'invitato esiste già in `users`, l'accept ritorna 409 con "accedi e accetta dal pannello". Manca l'endpoint `POST /staff/invitations/accept-as-user` (autenticato).
- [ ] **Resend invitation** se l'invitato non riceve la mail.
- [ ] **Soft delete** dell'account user (oggi la colonna `deleted_at` esiste ma non c'è endpoint per cancellazione utente).
- [ ] **GDPR data export** (download dati utente).

### 6.3 Test coverage

- [x] Test unit `SessionsService` (9 test, build pulita)
- [x] Test e2e flusso auth critico (5 test: register/duplicate/login-wrong/login-me/no-token)
- [x] Suite di hardening e2e A/B/C (`test/section-a|b|c-*.e2e-spec.ts` + `test/helpers.ts`): input malformati, concorrenza, edge temporali token/sessioni. Scritta + typecheck verde; **da eseguire nel terminale utente** (vedi §5.6). `jest-e2e.json` ora gira `maxWorkers: 1` (più app che bootano in parallelo con `DB_SYNC=true` racevano sullo schema sync).
- [ ] **Estendere test unit** ad almeno: `AuthService.registerStaff`, `AuthService.resetPassword`, `StaffService.ensureNotLastOwner`, `CatalogService.requireMenu`, `OnboardingService.createRooms`. Coverage attuale ~5%, target Fase 2: ≥40%.
- [ ] **Estendere test e2e** ai flussi: onboarding completo, staff invite/accept, RBAC OwnerGuard, multi-tenant switch.
- [ ] **Test E2E in CI** con Docker Compose della pipeline.

### 6.4 Polish

- [ ] **Swagger/OpenAPI** auto-generato da DTOs.
- [ ] **Logging strutturato** (Pino/Winston) al posto di `console.log` e `Logger` di NestJS default.
- [ ] **OWASP cleanup**: CORS configurato esplicitamente (oggi default), Content-Security-Policy custom, helmet review.
- [ ] **Refactor `auth.controller.ts`**: è cresciuto a ~200 righe con molte responsabilità (auth + 2FA + sessions + password reset + switch-tenant). Considera split in `auth.controller`, `mfa.controller`, `sessions.controller`.

---

## 7. Convenzioni di codice

### 7.1 Nomi file

- `kebab-case.ts` per tutto (es. `restaurant-fiscal-data.entity.ts`)
- Suffissi: `.entity.ts`, `.dto.ts`, `.service.ts`, `.controller.ts`, `.module.ts`, `.guard.ts`, `.strategy.ts`, `.spec.ts`, `.e2e-spec.ts`

### 7.2 DB vs TypeScript

- **DB**: `snake_case` (es. `password_hash`, `restaurant_id`)
- **TS**: `camelCase` (es. `passwordHash`, `restaurantId`)
- Mapping esplicito via `@Column({ name: 'password_hash' })`

### 7.3 Endpoint

- Sempre sotto `/api/v1/` (set da `setGlobalPrefix`)
- Set replace → `PUT`, partial update → `PATCH`
- Response sempre `{ success, data | error }`
- `ParseUUIDPipe` su ogni `:id` per validare prima del service

### 7.4 Lingua

- **Italiano** nei messaggi rivolti all'utente finale (`throw new ConflictException('Email già registrata.')`)
- **Inglese** in nomi tecnici (variabili, funzioni, file, commenti tecnici, log)
- File di documentazione (`BACKEND.md`, `PROGRESS.md`) in italiano

### 7.5 Tenant scoping

- **Sempre** via metodi privati `require[Resource](restaurantId, id)` nel service
- **Mai** controllo `if` inline nei controller

### 7.6 Validazione DTO

- Sempre con `class-validator` (`@IsString`, `@IsEmail`, `@IsInt`, `@Min`, ecc.)
- `Transform` per normalizzazione (es. `email.toLowerCase().trim()`)
- DTO `Create*` e `Update*` separati (il secondo ha tutto opzionale)

### 7.7 Errori

- `BadRequestException` 400 — validazione fallita / pre-condizione operativa
- `UnauthorizedException` 401 — credenziali / token
- `ForbiddenException` 403 — autenticato ma non autorizzato (tenant, role)
- `NotFoundException` 404 — risorsa inesistente
- `ConflictException` 409 — duplicato / stato incompatibile

### 7.8 Transazioni

- Sempre via `dataSource.transaction(async (em) => …)` per operazioni multi-tabella
- **Non** chiamare service esterni dentro la transazione se questi usano repository iniettati (vedi bug 5.1) — committi prima

### 7.9 Niente file inutili

Non si creano file `.md` di documentazione, file di "appunti" o di "decisioni" senza richiesta esplicita. La doc ufficiale è: `CLAUDE.md`, `PROGRESS.md` (questo), `DESIGN_DECISIONS.md`, `BACKEND.md`.

---

## 8. Comandi utili

### Infrastruttura

```bash
# Dalla cartella backend/
docker compose up postgres redis -d         # solo DB e Redis
docker compose up -d app                     # avvia ANCHE l'app (build dev + hot-reload, porta 3000)
docker compose stop app                      # ferma solo l'app (lascia su DB/Redis)
docker compose down                          # ferma tutto
docker compose down -v                       # ferma + cancella volumi (reset totale DB)
docker exec byup_postgres psql -U byup -d byup_fresh   # shell SQL
docker exec byup_redis redis-cli              # shell Redis
docker logs --tail 30 byup_app                # log dell'app (stack trace dei 500, ecc.)
```

> **Verifica funzionale via HTTP (utile dentro l'harness Claude Code).** L'app
> in Docker espone :3000 e gira con `nest start --watch` (volume montato →
> hot-reload: un edit al sorgente ricompila senza rebuild). jest non è
> eseguibile nell'harness (addon nativi), ma `curl` sì → si può validare ogni
> flusso a server attivo. Lo script `backend/scripts/phase1-functional-check.sh`
> automatizza la checklist Fase 1 (74 flussi, PASS/FAIL + conteggio), spaziando
> le richieste per rispettare il throttler reale e calcolando i TOTP del 2FA in
> python. Prerequisito: `docker compose up -d app`.

### Server

```bash
cd backend
cp .env.example .env                          # solo la prima volta
npm install                                   # solo la prima volta
npm run start:dev                             # dev con hot-reload (porta 3000)
npm run build                                 # compila a dist/
npm start                                     # esegue dist/main (production)
```

### Test

```bash
cd backend
npm test                                      # unit (Jest, rootDir=src)
npm run test:watch                            # unit in watch mode
PORT=3100 npm run test:e2e                    # e2e su porta separata (Jest + supertest + DB reale)
```

### REST Client

Apri `backend/api.http` in VS Code con l'estensione "REST Client" e clicca **Send Request** su ogni blocco. Le variabili dinamiche (token, id) si concatenano tra request.

### Memoria persistente Claude

Quella attiva per questo repo è `~/.claude/projects/-Users-fabiomancinelli-Desktop-Byup/memory/` (indice `MEMORY.md`; note su design token PN/BU, piani gestionale, Hubble, workflow push). La vecchia memoria `~/.claude/projects/-Users-fabiomancinelli-Desktop-byup-fresh-main-3-vue-components/memory/` esiste ancora ma non viene più caricata; conteneva:
- `MEMORY.md` — indice
- `user-fabio.md` — profilo utente
- `project-byup.md` — contesto progetto
- `feedback-transactions.md` — lezione bug 5.1
- `feedback-entity-metadata.md` — lezione bug 5.2

---

## 9. Prossimo passo — **Fase 2: Operatività ristorante**

Quando il ristorante può servire un cliente. È il blocco grosso del prodotto.

### Filosofia Fase 2

Tutto il Fase 1 era "configurazione". Il Fase 2 è "azione reale": un ordine viene preso, mandato in cucina, servito, pagato, chiuso fiscalmente. Deve girare **in tempo reale** (WebSocket per stato tavoli + comande), deve gestire **conflitti** (due camerieri che modificano lo stesso conto), deve essere **idempotente** (chi paga vince, non si paga due volte), deve **calcolare correttamente l'IVA** (10% somministrazione vs 22% asporto packaged).

### 9.1 Modulo `orders/` — Ordini

**Entities (da ERD operational core v0.7):**
- `Order` (id, restaurant_id, venue_id, table_id, channel, source_surface, weight, status, note_type, ...)
- `OrderItem` (order_id, menu_item_id, qty, vat_category, preparation_status, ...)
- `OrderItemAssignment` (order_item_id, table_guest_id, assignment_type, status) — per split bill

**Concetti chiave:**
- **Canali** (`orders.channel`): `sala`, `vendita_diretta`, `asporto_app`
- **Surface** (`orders.source_surface`): `staff_web`, `webapp_guest`, `byup_app`
- **Peso** (`orders.weight`): calcolato da `source_surface` — 1.0 per staff_web/webapp_guest/vendita_diretta, **0.5 per byup_app** (è il meccanismo chiave del flywheel B2B2C) — *regola superata da D-11/D-12: l'unità è la comanda, il peso definitivo viene dal saldo, i coefficienti sono il listino versionato del piano*
- **Stati** (12 stati possibili): `created → pending_validation → confirmed → sent_to_kitchen → in_preparation → ready → served → bill_open → paid → fiscally_closed | fiscally_failed | canceled`
- **VAT effettiva**: calcolata da `vat_category` + `delivery_mode`: 10% per somministrazione/asporto prepared_on_site, 22% per asporto packaged_product
- **Validazione esterna** (`venue_settings.validate_external_orders`): se true, gli ordini da app/webapp restano in `pending_validation` finché lo staff non conferma

### 9.2 Modulo `kitchen/` — Comande cucina + KDS

**Entities:**
- `KitchenTicket` (id, order_id, kds_device_id?, printer_device_id?, status, course_number)
- `KitchenTicketItem` (ticket_id, order_item_id, status)

**Concetti chiave:**
- **Routing per categoria**: ogni `MenuCategory` ha `printer_device_id` e/o `kds_device_id` opzionali → quando un OrderItem viene "sent_to_kitchen", si crea un KitchenTicket sul device giusto
- **Portate sequenziate** (`kitchen_ticket_items.course_number`): 1=antipasto, 2=primo, 3=secondo, 4=dessert, NULL=portata unica
- **Real-time push**: i KDS sono **WebSocket subscribers** sul `venueId`, ricevono nuove comande live
- **Operations**: marca singolo item ready, marca ticket intero ready, cancel
- **Auth**: KDS usa `JwtDeviceGuard` con scope `kitchen:read, kitchen:update`

### 9.3 Modulo `bills/` — Conti + split

**Entities:**
- `Bill` (id, order_id, bill_type, adjustment_type, status, ...)
- (la singola riga di un bill viene da `order_item_assignments`)

**Concetti chiave:**
- **Tipi conto** (`bills.bill_type`): `full` (tutto in un conto) | `split` (più conti dallo stesso ordine, uno per `table_guest`)
- **Adjustment** (`bills.adjustment_type`): `discount_pct` | `discount_eur` | `round_down` | null
- **Stati**: `open → payment_in_progress → paid → fiscally_pending → fiscally_closed | fiscally_failed`
- **Split per coperto**: gli `OrderItemAssignment` collegano un order_item a un table_guest specifico, permettendo split granulari (Mario paga la sua pasta, Luca paga la sua)

### 9.4 Modulo `payments/` — Pagamenti

**Entities:**
- `Payment` (id, bill_id, method, amount, status, stripe_payment_intent_id, ...)
- `PaymentLock` (bill_id, locked_by_type, locked_until) — protegge dalla doppia incassazione (consumer app + cassa contemporaneamente)
- `Refund` (id, payment_id, refund_type, method, status, initiated_from)
- `FiscalDocument` (id, bill_id, doc_type, transmission_status, openapi_receipt_id, ...)

**Concetti chiave:**
- **Metodi** (`payments.method`): `card_terminal` (Stripe Terminal + Tap to Pay) | `in_app` (Byup App) | `cash`
- **Stripe Connect**: ogni pagamento card_terminal/in_app passa via il connected account del ristorante → Byup non maneggia mai dati carta
- **OpenAPI** per trasmissione fiscale: `corrispettivo` (default) o `fattura_elettronica` (su richiesta del cliente)
- **Lock pattern**: chi inizia il pagamento prende il lock (TTL ~5min), l'altro fronte vede "in pagamento" e non può procedere

### 9.5 Modulo `tables/` — Sala con WebSocket

**Stato già esistente:** `Table` entity in `venue/` ha `status` (free/occupied/reserved/to_clean), `position_x/y`, `qr_token`, `assigned_waiter_id`.

**Da aggiungere:**
- `TableGuest` (table_id, status, joined_at, left_at) — chi è seduto al tavolo
- **WebSocket gateway** `/ws/sala?venueId=…` con eventi:
  - `table.status_changed` (free → occupied → to_clean)
  - `table.guest_joined / table.guest_left`
  - `order.created / order.confirmed`
  - `kitchen.ticket_ready`
- **Alert configurabili** (da `venue_settings`):
  - `no_order_warn_min` (default 15) → highlight giallo
  - `no_order_alert_min` (default 25) → highlight rosso
  - `overstay_min` (default 90) → notifica al personale
- **Auth gateway**: estende `JwtAuthGuard` per WS, scope per role

### 9.6 Modulo `reservations/` — Prenotazioni

**Entity:** `Reservation` (id, venue_id, table_id?, guest_name, party_size, scheduled_at, duration_min, status, ...)

**Concetti:**
- **Stati**: `confirmed → arrived → completed | no_show | canceled`
- **Source** (`reservations.source`): nell'MVP solo `staff` (no booking da app)
- **Auto-assign tavolo** (`venue_settings.auto_assign_table`): se true, propone automaticamente un tavolo compatibile
- **No-show timeout** (`venue_settings.no_show_timeout_min`, default 15): dopo X minuti di ritardo, lo stato passa a `no_show`

### 9.7 Modulo `vendita-diretta/` — Bancone e asporto

**Non è un modulo separato**, è un **canale** dentro `orders/` con `channel='vendita_diretta'` e `delivery_mode`:
- `bancone` → consumo immediato, somministrazione (10% IVA)
- `asporto` → take-away, IVA per `vat_category` (10% prepared_on_site, 22% packaged_product)

UI dedicata (no tavolo), ma backend riusa orders/bills/payments standard.

### 9.8 Modulo `accounting/` — Contabilità base

**Entities:**
- `CashRegisterSession` (id, venue_id, opened_at, closed_at, opening_amount, closing_amount, status)
- `CostEntry` (id, restaurant_id, category, recurrence_type, status, amount, due_date, ...)

**Concetti:**
- **Apertura cassa**: ogni giorno il primo addetto apre la cassa dichiarando il contante iniziale, alla chiusura quadra
- **Categorie costo**: `affitti | personale | materie | servizi | altro`
- **Ricorrenze**: `one_off | weekly | biweekly | monthly | bimonthly | quarterly | annual`
- **Stati costo**: `paid | due | overdue`
- **Export IVA**: report per regime fiscale (ordinario/forfettario/semplificato)

### 9.9 Strategia di rollout Fase 2

Suggerita per **non avere un blocco gigante non navigabile**:

1. **Sub-fase 2a (settimana 1-2)**: `orders` end-to-end *senza* split né WebSocket. Un ordine viene creato, confermato, mandato in cucina, marcato servito. Stato salvato in DB, polling per refresh client. **Esce funzionante a sé**.
2. **Sub-fase 2b (settimana 2-3)**: `kitchen` con KDS reali. Routing per categoria, course_number, marcatura ready. Sempre con polling.
3. **Sub-fase 2c (settimana 3-4)**: `bills + payments` (cash + card_terminal placeholder). Pagamento marca order paid + bill closed. **Stripe Terminal reale come step a sé.**
4. **Sub-fase 2d (settimana 4-5)**: **WebSocket reale** per `tables` + `kitchen`. Sostituisce il polling. È un upgrade trasparente al client.
5. **Sub-fase 2e (settimana 5-6)**: split bill + payment_locks. È la parte più delicata, va affrontata dopo che la base funziona.
6. **Sub-fase 2f (settimana 6)**: reservations + cash_register_sessions + cost_entries. Sono "appoggi", non sul critical path operativo.

### 9.10 Cose da decidere prima di iniziare Fase 2

- **Strumento WebSocket**: `@nestjs/websockets` (gateway nativo con socket.io adapter) vs Pusher gestito vs MQTT. Default suggerito: socket.io via gateway NestJS per zero-vendor lock.
- **Stato realtime**: Redis pub/sub per multi-istanza, oppure single-instance per MVP? Default: single-instance ECS task fino a ~75 locali (vedi sezione "Scaling" del CLAUDE.md), poi Redis ElastiCache.
- **Stripe Terminal**: SDK lato React Native (app POS) vs lato server (collect payment intent). Default: SDK su app + webhook server-side per confirmation.
- **Idempotency keys** sui POST critici di `/orders` e `/payments`: per evitare doppie scritture in caso di retry. Pattern standard via header `Idempotency-Key`.
- **Modello concorrenza per tavolo**: optimistic (version column) o pessimistic (advisory lock SQL)? Probabilmente optimistic + `WHERE updated_at = :prev` per i conflitti rari, fallback UI a "ricarica e riprova".

---

## 10. Note di sessione

### Riferimenti tecnici dettagliati
- `backend/BACKEND.md` — dettagli decisioni backend modulo per modulo
- `backend/erd/*.dbml` — ERD v0.7 (sorgente di verità DB)
- `backend/erd/byup-database-enums-reference-v7.md` — valori e stati DB
- `DOCUMENTI.md` — i tre documenti di riferimento (ERD, DPT, SFA) stanno fuori dal repo, nel progetto Byup: le copie PDF in `backend/erd/` sono state tolte perché invecchiavano in silenzio
- `gestionale/CLAUDE.md` — overview di prodotto (cosa è Byup, GTM, validation, team)
- `gestionale/DESIGN_DECISIONS.md` — design system frontend, riallineato al codice il 2026-08-09 e tenuto aggiornato a fine sessione con una sezione datata per ogni batch; in caso di dubbio i token `PN` nel codice restano la verità

### Memoria conversazionale Claude
La memoria persistente fra sessioni vive sotto `~/.claude/projects/-Users-fabiomancinelli-Desktop-Byup/memory/` ed è automaticamente caricata. Contiene note su: design token (PN vivo, BU legacy), piani del gestionale (accento aurora, Free→Gratuito), console Hubble, workflow di push, audit del gestionale. Le due "lezioni operative" dai bug intercettati (transazioni service-level, entity metadata) restano nella vecchia memoria `...-byup-fresh-main-3-vue-components` (vedi §8).

### Frequenza aggiornamento di questo file

**Ad ogni fine sessione che chiude una fase o sub-fase**. Non per micro-modifiche. Quando si finisce un modulo nuovo, si aggiunge alla sezione 2 + si aggiorna sezione 6 (TODO completati).
