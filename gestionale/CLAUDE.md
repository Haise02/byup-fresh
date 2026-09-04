> **Leggi `PROGRESS.md` per lo stato attuale dello sviluppo.**

# Byup — Panoramica di Progetto

## Cos'è Byup

Byup è un ecosistema digitale B2B2C pensato per semplificare l'esperienza al tavolo e la gestione operativa dei locali nel settore Food & Beverage italiano. Al centro c'è la Byup App, un'applicazione che consente ai clienti di consultare il menù, ordinare e pagare direttamente dal tavolo, e Byup Fresh, il gestionale cloud rivolto ai ristoratori. Il modello è circolare: il valore per il ristoratore cresce con l'adozione dell'app da parte dei clienti, e il valore per il consumatore cresce con il numero di locali aderenti alla piattaforma.

La ristorazione italiana conta oltre 324.000 imprese attive. La maggior parte opera con strumenti frammentati, obsoleti o sovradimensionati. I gestionali disponibili impongono costi fissi elevati indipendentemente dalle dimensioni del locale, richiedono lunghi tempi di implementazione e non offrono alcun collegamento diretto con il cliente finale. Byup nasce per risolvere esattamente questo problema.

## Byup Fresh — Il Gestionale

Byup Fresh è il primo prodotto a essere lanciato sul mercato. Si rivolge a locali con un modello operativo snello e ad alta rotazione: pub, cocktail bar, pizzerie d'asporto, hamburgerie, bistrot, gelaterie, food truck, locali serali e attività post cena. Può essere configurato anche per chi non offre servizio al tavolo, ma è principalmente pensato per chi lo fa.

### Funzionalità principali

Fresh integra un sistema di cassa completo per gestire ordini e incassi dal bancone, l'ordinazione e il pagamento tramite Byup App direttamente dal tavolo, un'applicazione completa per il personale di sala (presa comanda, gestione tavoli, prenotazioni, pagamenti, coordinamento con la cucina), il monitoraggio in tempo reale dello stato dei tavoli, la creazione e gestione di menu digitali con categorie, prodotti, prezzi e descrizioni, un kitchen monitor per gli ordini da asporto con storico, una vetrina pubblica del locale, una dashboard analytics con KPI di performance, e una contabilità base con apertura cassa e movimenti IVA.

Come add-on è possibile integrare Fresh con applicazioni di terze parti per il delivery (10€ + IVA) oppure collegare le API con servizi terzi come Zapier, Google, Claude e ChatGPT (22,90€ + IVA). Nel prototipo il collegamento con Zapier c'è, come tessera in POS e integrazioni (P-32): la scheda dice che cosa esce, che cosa non esce mai e chi è titolare del flusso, e chiede la presa d'atto prima di generare la credenziale. Non c'è più la **sezione** «Connessioni con app esterne» (4 settembre 2026): era un elenco a parte per una cosa che la tessera dice già, e la revoca vive sulla tessera, dove uno la cerca. Resta da scrivere, prima di attivare l'add-on, l'elenco degli eventi che il ristoratore può automatizzare e dei dati che escono con ciascuno (P-125). Il foglio del collegamento dice **due righe** e non tre paragrafi (4 settembre 2026) — che cosa esce e che cosa non esce mai — perché la responsabilità del flusso la dichiara la spunta di presa d'atto, che è l'atto che conta.

Le tre piattaforme di consegna (Glovo, Deliveroo, Uber Eats) restano **predisposte, non attive**, e l'add-on è spento nell'MVP; la tessera però non dice più «che cosa farà»: apre **«Collega»**, che percorre il collegamento come lo documenta la piattaforma, con dati di esempio e la riga che dichiara la simulazione. Glovo chiede lo Store ID del punto vendita (`nome-partner__id`), che Glovo crea alla messa in esercizio; Deliveroo dà un codice di collegamento da incollare sul Partner Hub del locale (Integrazioni → Collega sedi → Site location ID, marchio, «menù dalla cassa»); Uber Eats passa dall'autorizzazione OAuth dell'app di Byup sull'account del locale (scope `eats.pos_provisioning`), poi si scelgono i punti vendita e si può nominare Byup gestore degli ordini, col negozio in pausa finché non lo si mette online.

### Piani e prezzi

Il modello di pricing si basa sul volume di ordini effettuati. Per ciascun piano è previsto un numero di ordini inclusi; superata la soglia, viene applicato un costo extra per ordine aggiuntivo. Le transazioni sono pesate: l'unità è la comanda (il singolo invio), l'origine dà il peso provvisorio e la superficie di saldo dà il definitivo, che prevale. I coefficienti sono quelli del piano — listino versionato (D-12), non costanti di prodotto — e il coefficiente ridotto dell'app incentiva l'adozione dell'app da parte dei clienti.

Il listino ha **due prezzi per piano**: il mensile con fatturazione annuale — quello su cui sta la maggior parte della base, ed è il prezzo che si comunica — e il mensile puro, più caro. Gli «ordini inclusi» non sono ordini grezzi ma **transazioni pesate** con i coefficienti del piano.

| Piano    | Transazioni incluse | Con fatturazione annuale | Mensile puro | Costo transazione extra |
|----------|---------------------|--------------------------|--------------|--------------------------|
| Gratuito | 550                 | 0 €                      | 0 €          | 0,45 € + IVA             |
| Starter  | 1.850               | 46,99 € + IVA            | 54,99 € + IVA| 0,34 € + IVA             |
| Plus     | 7.500               | 134,99 € + IVA           | 155,99 € + IVA| 0,23 € + IVA            |
| Business | 15.000              | 250 € + IVA              | 290 € + IVA  | 0,12 € + IVA             |

> **Fonte di verità del listino:** `ACC_PIANI` in `gestionale/account-data.jsx`. La console Hubble lo replica in `hubble/admin-data.jsx` (`PIANI`) e le due copie vanno tenute allineate: quando hanno divergiuto — 49/99/249 di là, 46,99/134,99/250 di qua — ha vinto il gestionale.

Il piano Gratuito (in origine "Free") funge da demo in condizioni reali. Il supporto tecnico include chat bot, tutorial e ticket via email per tutti i piani; Plus aggiunge il supporto telefonico Lun–Ven nelle fasce 12:00–16:00 e 18:00–22:00 con callback entro 2 ore; Business lo estende a H24, 7 giorni su 7, con callback entro 1 ora. Il numero di menu creabili varia da 1 (Gratuito) a 3 (Starter) a illimitati (Plus e Business), e allo stesso modo i membri dello staff: 1, fino a 3, illimitati. Nel gestionale «staff» è una cosa sola — persone e dispositivi (kitchen monitor, stampanti) stanno nello stesso elenco, in Impostazioni → Personale.

Nel prototipo il canale scritto si chiama **Ticket** e non «email» (risposta entro 2 giorni lavorativi), e la chat di primo livello **dichiara di essere un'IA**: da lì si passa a una persona aprendo un ticket o prenotando una chiamata.

Sono previsti anche pacchetti di transazioni acquistabili singolarmente per gestire picchi di attività senza dover passare al piano superiore.

## Byup App — L'interfaccia consumer

Byup App è l'interfaccia rivolta al consumatore finale: consente di ordinare, pagare dal tavolo, ricevere notifiche in tempo reale, accedere a promozioni personalizzate, cercare e prenotare locali, consultare menu in anteprima e gestire storico ordini e pagamenti.

Il pagamento dal tavolo è una funzionalità esclusiva dell'app nativa e richiede il download e la registrazione. Ogni utente che scarica l'app entra nell'ecosistema con carta di pagamento salvata, storico completo e possibilità di interazione con tutti i locali partner. Per il locale, ogni pagamento via app riduce il conteggio delle transazioni (coefficiente ridotto anziché pieno), creando un vantaggio economico diretto.

Per chi non ha l'app, è disponibile una webapp guest accessibile via QR code che permette di ordinare dal tavolo senza registrazione, ma non consente il pagamento, incentivando il download dell'app.

La sezione Discovery funziona come motore di scoperta dei locali aderenti, con filtri per stato (aperto/chiuso), distanza, promozioni attive, rating, tipo di cucina, fascia di prezzo, e tag alimentari (senza glutine, vegano, vegetariano). La discovery si attiva solo sopra la soglia di 125 locali entro 6 km dal GPS dell'utente, oppure 150 entro 50 km come fallback regionale. Raggi e soglie sono parametri configurabili da Hubble (Impostazioni → Piattaforma), non costanti di codice.

In una fase successiva (post 4 anni), l'app sarà disponibile anche in versione Pro a 2,99 € + IVA al mese, con funzionalità avanzate basate su intelligenza artificiale per ricerche e prenotazioni più rapide, sconti dedicati e contenuti personalizzati.

## Architettura Tecnica

### Principi guida

L'architettura è interamente full-cloud su AWS (regione eu-central-1, Francoforte), senza alcun componente locale da installare presso il ristorante — né oggi, né in futuro. Per i locali con connettività instabile, la strategia prevede partnership con fornitori di connettività dedicata (hotspot 4G/5G) piuttosto che l'introduzione di infrastruttura locale.

Le scelte privilegiano servizi gestiti per ridurre il carico operativo del team: Fargate al posto di EC2, RDS al posto di PostgreSQL self-managed, SQS al posto di un broker auto-gestito. Il tradeoff è un costo unitario leggermente superiore in cambio di zero gestione infrastrutturale, coerente con un team in fase iniziale.

### Superfici applicative (MVP)

La piattaforma si compone di cinque superfici: il gestionale staff web (Vue 3 + Composition API) per gli operatori del locale, inclusa un'interfaccia cameriere responsive da browser mobile; l'App Staff POS (React Native) dedicata all'incasso in presenza tramite Stripe Terminal e Tap to Pay; la webapp guest (Vue 3 lightweight) accessibile via QR code per l'ordinazione al tavolo senza registrazione; la Byup App consumer (Flutter, singola codebase iOS/Android) per ordinare, pagare e scoprire locali; e un backoffice Byup (Vue 3) riservato al team interno per gestione tenant, supporto tecnico e amministrazione.

### Stack tecnologico

Il backend è un modular monolith in NestJS (Node.js, TypeScript). La scelta è stata preferita ai microservizi perché il dominio è ancora in consolidamento, l'MVP deve essere veloce da realizzare e semplice da osservare, e il team è contenuto. La struttura interna segue un pattern a moduli con confini espliciti — ogni modulo ha use case, interfacce, adapter e confini di accesso ai dati propri. Quando un modulo raggiunge stabilità e necessità di scaling indipendente, potrà essere estratto a microservizio senza riscrittura del core.

Il database primario è PostgreSQL su RDS (Single-AZ, db.t4g.medium), scelto per le garanzie transazionali ACID e il modello relazionale coerente con il dominio (ordini, conti, pagamenti, documenti fiscali). L'infrastruttura è gestita con Terraform come codice (state remoto su S3 cifrato, lock su DynamoDB). La pipeline CI/CD usa GitHub Actions, con branch protection attiva e check automatici anti-leak di segreti.

### Servizi AWS adottati

ECS Fargate per il compute applicativo, ALB per il load balancing e la terminazione SSL, RDS PostgreSQL come database primario, SQS per le code asincrone (retry, sync differita, notifiche, billing), S3 + CloudFront per frontend, asset e media, Redis (ECS) per cache, rate limiting e supporto realtime (non source of truth), SES per le email transazionali, ECR come container registry privato, CloudWatch per osservabilità base, Secrets Manager e SSM per segreti e configurazioni, NAT Gateway per la connettività in uscita verso provider esterni.

### Provider esterni integrati

Stripe gestisce l'intero ciclo dei pagamenti: Stripe Connect per i connected account dei ristoranti, Stripe Terminal SDK per l'incasso in presenza via Tap to Pay, e Stripe Billing per la gestione degli abbonamenti alla piattaforma. Byup non gestisce direttamente dati carta — il perimetro PCI resta interamente delegato a Stripe.

OpenAPI è il provider per la trasmissione fiscale (corrispettivi e fatture) e la validazione dei dati aziendali. Nel prototipo **non ha una tessera in POS e integrazioni**: un catalogo è il posto dove si sceglie, e sul canale non c'è niente da scegliere — è uno solo, incluso nell'abbonamento (D-38), non si collega e non si scollega. Chi trasmette si legge in Dati fiscali, dove vivono credenziali, delega, POS e codice destinatario. Il modello fiscale del prototipo, verificato sulle fonti e rivisto il 4 settembre 2026 con D-103, è questo. Le forme giuridiche sono **tre**: ditta individuale, società, ente o altra forma collettiva. Il professionista non esiste — chi somministra alimenti esercita un'impresa (art. 4 DPR 633/72, art. 2195 c.c.) e il rapporto FIPE 2026 non conosce la categoria: le imprese del settore sono individuali (46,5%), società di capitale (29,1%), società di persone (23,3%) e altre forme collettive (circa 1%). L'ente non è più rimandato alla Soluzione Software: ha i campi della società e nessun percorso proprio.

I corrispettivi passano dalla procedura web del documento commerciale online, che non è delegabile, e **le credenziali Fisconline sono sempre dell'esercente**: del titolare per la ditta individuale; per società ed enti della persona fisica che il locale nomina incaricata sul portale (specifiche corrispettivi §2.9, «operatori incaricati»), di norma il titolare o il rappresentante legale. Chi sia quella persona lo dichiara l'esercente in Dati fiscali — nome, cognome e codice fiscale, cioè `ade_operator_name` e `ade_operator_tax_code` — e Hubble la legge in sola lettura, per l'assistenza; la nomina si compie sul portale e Byup non ne è parte. **Byup non nomina incaricati propri e non rinnova credenziali per conto di nessuno**: la figura dell'«incaricato di Byup», costruita il 3 settembre 2026 senza decisione, è ritirata e resta annotata come alternativa sospesa, da riaprire solo dopo il parere del consulente fiscale (D-40) e solo se la rotazione a novanta giorni si rivelasse un problema prima del ponte sulla Soluzione Software, che le credenziali le elimina.

La password scade ogni novanta giorni e alla scadenza **l'emissione si ferma** (progetto tecnico §12.2): promemoria a 14, 7 e 3 giorni in Dati fiscali, in Cassa e nelle notifiche; blocco nei quattro punti dove nasce un documento (saldo del conto, vendita diretta, le due schermate d'incasso dell'App Staff); rinnovo con trasmissione di prova che sblocca (P-104, P-120). Le fatture le trasmette e riceve OpenAPI come trasmittente accreditato allo SDI senza deleghe; il mandato è contrattuale (TC-01 art. 12); l'esercente registra sul portale il codice destinatario del canale, PIC7CPS, come proprio indirizzo telematico. La delega unica a Byup, ammessa anche a chi non è intermediario, è una sola con due servizi: «fatturazione elettronica e conservazione» (conservazione presso l'Agenzia; la scheda del fornitore in raccolta offre la conservazione a norma delle fatture a 0,105 euro per chiamata, dieci anni, eIDAS) e «accreditamento e censimento dispositivi». Il collegamento dei POS lo fa l'esercente da solo, col foglio precompilato di P-105, e nasce con lo strumento, non nell'onboarding. Con la Soluzione Software (Provv. 111204/2025) spariscono le credenziali per tutti, l'accreditamento diventa un aggiornamento di registrazione fatto da Byup con la delega, e la delega resta quella, una sola.

**Dove si fanno i collegamenti (4 settembre 2026).** Non nell'onboarding: delega, credenziali e Stripe sono atti che si compiono su altri siti — il portale dell'Agenzia con SPID, la verifica d'identità di Stripe — e tenere il locale fermo sulla porta finché non li ha compiuti voleva dire non farlo entrare. L'onboarding chiede il menù, l'anagrafica del locale, le sale e i tavoli; il resto lo chiedono le **prime due notifiche** che trova appena atterra nel gestionale, e ognuna porta dove il lavoro si fa: «Collega Stripe per incassare» → POS e integrazioni, «Collega i dati fiscali all'Agenzia» → Dati fiscali. Lì vivono la scheda **Attivazioni fiscali** (delega, conservazione, accreditamento: la prima è un atto suo che Byup controlla, le altre due le fa Byup con la delega) e la scheda **Incaricato Fisconline** — la persona, il suo codice fiscale, la sua password e il suo PIN, che si cambiano insieme e **si applicano solo dopo la trasmissione di prova**: finché non passa restano attivi i dati di prima. Le due schede spariscono quando non c'è più niente da fare, come il banner dei campi mancanti. Il **POS virtuale nasce col collegamento Stripe** (P-105) e non un minuto prima: senza Stripe non esiste, e con lui nasce la finestra della comunicazione all'Agenzia. Il pulsante «Rinnova la delega» non c'è più: una delega valida non si rifà, e quando cambia il soggetto la si riconferma dentro la catena del cambio.

L'account è della persona (D-104): non esiste un cambio del titolare né un passaggio del locale. Chi ha l'account cambia i propri recapiti e il proprio nome dal profilo — il recapito nuovo si verifica prima di sostituire il vecchio, il precedente riceve l'avviso, e ogni modifica scrive un evento nel registro delle attività con il valore precedente e quello nuovo. Quello che cambia, quando cambia il contribuente, è il **soggetto fiscale**, e si cambia in Dati fiscali: nuovi dati con il precedente conservato, delega riconferita e revocata, credenziali nuove con la prova, conto Stripe nuovo, censimento dei POS rifatto e **riaccettazione dei termini a nome del nuovo soggetto**, senza la quale il cambiamento non è concluso.

Claude API è utilizzato durante l'onboarding per il processing AI dei menu (estrazione piatti, categorie, prezzi, descrizioni da foto, documenti o URL).

Google Maps Platform supporta la discovery dei locali nella Byup App. FCM e APNs gestiscono le notifiche push rispettivamente su Android e iOS.

### Sicurezza

L'autenticazione segue flussi distinti per tipologia di utente: lo staff accede con email e password (2FA disponibile), i dispositivi cucina con username locale e password generata, i consumer con email/password o social login (Google, Apple), e il team admin con 2FA obbligatorio.

I container girano in subnet private, non esposti a Internet. Tutto il traffico in ingresso passa dall'ALB. Il codice sorgente è su GitHub con branch protection attiva e nessun push diretto su main. I container girano con utente non-root e senza privilegi elevati. I log di audit sono conservati per cinque anni e non sono modificabili né cancellabili.

La compliance GDPR è assicurata dalla minimizzazione dei dati raccolti, consenso esplicito per dati opzionali, retention proporzionata allo scopo e cancellazione irreversibile su richiesta.

### Scaling

Con un volume MVP (fino a 75 locali, ~90.000 transazioni al mese), le query aggregate su PostgreSQL sono sostenibili. Il primo collo di bottiglia in crescita è il database, mitigabile con upgrade della classe istanza RDS e, oltre una certa scala, read replica per le query analitiche. Il secondo è Redis in configurazione single-instance, migrabile a ElastiCache con clustering quando necessario. Fargate scala orizzontalmente con autoscaling automatico.

## Modello di Business e Revenue

Byup basa i propri ricavi sul volume di ordini effettuati nei locali affiliati, con abbonamenti a livelli differenziati per funzionalità, ordini inclusi, dimensione dello staff e livello di assistenza. Un modello freemium favorisce l'adozione: il piano Gratuito consente di sperimentare il prodotto in condizioni reali senza impegno economico, e la conversione ai piani a pagamento è affidata all'esperienza d'uso effettiva.

La ponderazione delle comande — coefficiente pieno al saldo in cassa o cameriere, ridotto al saldo in app, secondo i coefficienti del piano — è il meccanismo chiave del flywheel B2B2C: incentiva il locale a promuovere l'uso dell'app, che a sua volta rafforza l'ecosistema consumer.

## Mercato di Riferimento

Il TAM globale dei software gestionali per la ristorazione è stimato in circa 5,79 miliardi di dollari nel 2024, con una crescita prevista fino a 14,7 miliardi di dollari entro il 2030 (CAGR 17,4%). Il mercato europeo vale circa 1,67 miliardi di dollari con previsione a 4,12 miliardi entro il 2030.

Il SAM è il mercato italiano, stimato in circa 219,6 milioni di dollari nel 2024 (circa 189,4 milioni di euro), con proiezioni a 561,6 milioni di dollari entro il 2030 e CAGR del 17,5%. Le imprese italiane con codice Ateco 56.1 (ristoranti e ristorazione mobile, esclusi bar senza cucina e catering) ammontano a circa 195.471 nel 2023.

## Go-to-Market

La distribuzione di Fresh è interamente online, con un modello self-service: i ristoratori accedono al piano Gratuito dal sito, completando l'attivazione in pochi minuti. Gli upgrade avvengono in autonomia dal pannello di controllo. L'onboarding è assistito da tutorial video, guide interattive e — sul piano tecnico — dal processing AI di Claude per l'importazione del menu.

L'espansione geografica segue una strategia a cluster con saturazione progressiva. Il lancio iniziale avviene a Roma e in Puglia nei primi 6-12 mesi, regioni scelte per la presenza di contatti diretti e familiarità del team con il tessuto ristorativo locale. L'espansione procede regione per regione, concentrandosi su ciascuna fino a raggiungere una densità critica di locali prima di passare alla successiva. Regioni prioritarie: Lombardia, Lazio, Campania, Sicilia, Veneto, Toscana, Emilia-Romagna.

La comunicazione B2C non viene spinta finché non si raggiunge un numero sufficiente di locali. La strategia è prima consolidare il B2B, poi attivare il flywheel consumer.

## Validazione

Sono state condotte 42 interviste qualitative su tre segmenti (clienti 25-40 anni, staff di sala, gestori) per identificare i friction point critici. I clienti mostrano apertura condizionale al digitale, lo staff privilegia strumenti immediati, i gestori adottano solo soluzioni con ROI dimostrabile. Sono stati condotti anche smoke test sugli utenti finali, riscontrando interesse concreto — in particolare nella facilità di coinvolgimento di un pubblico giovane e digitalmente competente.

Nel giugno 2025 è stata rifiutata una prima offerta di investimento seed da 55.000€ per consolidare la value proposition prima di raccogliere capitali. La raccolta è stata avviata ufficialmente a ottobre 2025.

## Team

Il team è composto da cinque fondatori che si conoscono da oltre dieci anni e hanno già lavorato insieme in altri progetti e startup:

Fabio Mancinelli (CEO) — Responsabile della direzione strategica, coordinamento tra le aree funzionali, gestione delle relazioni con stakeholder, investitori e partner. Supervisiona l'implementazione della strategia go-to-market, le decisioni su pricing, posizionamento competitivo ed espansione geografica.

Marco Di Meo (CFO) — Responsabile della pianificazione finanziaria, controllo di gestione e sostenibilità economica dell'azienda.

Il team include inoltre un CMO, un CBO (Brand Manager) e un CPO (Head of Product). Il CTO è incluso nel pool ESOP. Nel primo anno il team opera con compensazione ridotta (rimborsi spese e compenso minimo), con un costo del personale di 165.000€, coerente con la fase bootstrap e i fondi pre-seed.

## Piano Finanziario e Raccolta

La struttura societaria prevede un 63% al team interno, 22% come pool ESOP (incluso CTO), e 15% come riserva non assegnata per partnership strategiche, PR e brand ambassador. La diluizione segue una progressione definita: 12% al Pre-Seed, 15% al Seed, 16% al Round A, 17% al Round B, 17% al Round C. L'equity del CEO è dotato di diritti di voto rinforzati (x5 o x10) per garantire continuità strategica.

Per i round Pre-Seed e Seed è previsto l'uso di strumenti snelli come il SAFE, rinviando la definizione della valutazione al primo round priced (Round A).

Il personale cresce da 6 persone (Anno 1, 165.000€) a ~30 risorse entro il sesto anno (2.100.000€), con la prima espansione strutturale dell'organico al quarto anno. Il break-even operativo è previsto nella seconda metà del terzo anno. La cassa non presenta mai saldi negativi a condizione che i round seguano la tempistica prevista, con il margine di sicurezza più contenuto a fine primo anno (~24.000€).

## Rischi principali

I rischi più critici (Grado A) sono quattro: il mancato raggiungimento della massa critica di locali, un costo di acquisizione cliente superiore al lifetime value, problemi organizzativi, e l'esaurimento del budget prima della raccolta successiva. A mitigazione, il team si dedica personalmente all'acquisizione nei primi due anni (CAC stimato 264-380€, budget 114.000€, obiettivo 195 ristoranti attivi), il progetto è dotato di milestone progressive, e il piano di raccolta è strutturato in fasi con budget calibrati.

I rischi di grado B includono la connettività di scarsa qualità dei locali (mitigata dall'evoluzione delle infrastrutture di rete italiane e da partnership con fornitori di connettività), la concorrenza sleale, e la compliance normativa (gestita delegando i pagamenti a Stripe e la trasmissione fiscale a OpenAPI).

## Stampa e Hardware

Due usi, due vie (D-108, sulle fonti dei produttori e degli standard acquisite il 3 e 4 settembre 2026). Le **comande** escono soltanto da stampanti che **interrogano il nostro server** — Star con CloudPRNT, Epson con Server Direct Print, sui modelli dei rispettivi elenchi — oppure compaiono sul monitor di cucina: è l'unica via che stampa senza una persona davanti a un dispositivo, senza un dispositivo acceso nel locale e senza un terzo fra Byup e la stampante. I **documenti** — pre-conto e documento di cortesia, due documenti distinti — escono **dal browser della postazione**, su qualunque stampante che il sistema del dispositivo conosce, di qualunque marca, con la persona che conferma la finestra di stampa; al tavolo, col telefono, il cliente riceve la ricevuta elettronica o ritira il foglio al banco.

Nessuna via passa dalla pagina web alla stampante in rete locale: i produttori stessi dichiarano che il contenuto misto la blocca senza certificati installati a mano su ogni dispositivo. Il ponte attraverso l'App Staff e il Bluetooth sono **rinviati oltre l'MVP**, con i vincoli accertati (app in primo piano, programma MFi di Apple per il Bluetooth classico su iOS, un dialetto di comandi per marca); le stampanti che passano dal cloud di un terzo (Sunmi e simili) non sono compatibili finché quel terzo non è valutato come responsabile del trattamento. Resta la regola: mai driver né SDK proprietari — ePOS-Print e Server Direct Print sono protocolli HTTP con documenti XML, non l'SDK vietato — e mai stampante esposta al cloud.

Nel prototipo (P-124): registro, coda e i tre layout a 80 mm vivono in `stampa.jsx`; la configurazione sta in **POS e integrazioni**, in un box con «Aggiungi stampante», e la sezione Impostazioni → Stampanti non esiste più.

**I due fogli (4 settembre 2026).** «Aggiungi stampante» si apre subito e in cima dice la cosa che serve: l'**indirizzo del nostro server** da scrivere nella pagina di configurazione della stampante — `https://print.byup.it/cloudprnt/<sede>` per Star (CloudPRNT → Server URL), `https://print.byup.it/sdp/<sede>` per Epson (Web Config → Server Direct Print) — con il tasto che lo copia. Sotto sta l'elenco di chi si è presentato, e il **caricamento vive dentro quell'elenco**, con «Cerca di nuovo» accanto: nessuno deve guardare una schermata vuota per leggere un indirizzo che è già scritto e non cambia. Da una pagina web non esiste una scansione della rete locale e il browser non espone a JavaScript l'elenco delle stampanti di sistema: si guarda **chi ha contattato il nostro server**, e fingere altro sarebbe una promessa che il primo sabato sera si scopre falsa. **«Questa postazione» non è più in elenco**: la stampa dal browser non si collega e non si scollega — c'è sempre, ed è la strada che il documento prende quando per quel POS non risponde nessuna stampante del server; metterla fra le cose da aggiungere confondeva una via con un oggetto.

Scelta la stampante si apre il secondo foglio, **«Imposta stampante»**, che è anche quello che si riapre da **«Configura»** sulla tessera: nome, uso, e ciò che l'uso porta con sé. La **prova di stampa vive qui**, non sulla tessera: provare serve a sapere se la stampante risponde davvero, e la domanda si fa dove si può rimediare. Sulla tessera restano «Configura» e «Scollega». La sede non si chiede: una stampante appartiene alla sede in cui la stai collegando.

**Che cosa si sceglie.** Il nome (proposto dal modello, riscrivibile) e l'**uso**: comande, e allora si assegnano le categorie di tutti i menù come in «Collega un dispositivo» di Personale, con quelle già prese da un'altra stampante spente e col nome di chi le tiene; oppure **scontrini di cortesia**, e allora — solo se una seconda stampante per i documenti esiste già — si scelgono i **POS che stampano lì**, con la spunta che toglie il POS dalla stampante di prima. Con una stampante sola la domanda non si fa. Nello stesso foglio sta la casella **«Stampa da sola a incasso avvenuto»**, spenta di default.

**Con più di una stampante per i documenti** compare l'associazione dei POS: ogni strumento di pagamento censito (P-105) stampa sulla sua stampante, e su **una sola** — altrimenti lo stesso scontrino uscirebbe due volte, in due punti del locale. Assegnare un POS a una stampante lo toglie dalla precedente, che è il modo in cui il vincolo si fa rispettare senza spiegarlo. Con una stampante sola la domanda non esiste e il riquadro non compare.

**Il documento del cliente, a incasso chiuso.** Da dove esce lo decide il POS su cui si è incassato: se quel POS ha una stampante che interroga il server, il documento ci va in coda e ne esce **diretto**, senza finestre e senza conferme — ed è l'unica via che stampa così, anche quando chi incassa ha in mano solo il telefono in sala, perché il foglio esce al banco. Altrimenti si stampa dal browser, dove la finestra di dialogo del sistema chiede conferma: non per scelta nostra, ma perché nessun browser lascia stampare una pagina in silenzio. La casella nel foglio della stampante decide se il documento parte **da solo** a incasso chiuso o **al tocco**: il predefinito è al tocco, perché l'automatico stampa anche quando il cliente il foglio non lo vuole, e quelli sono fogli buttati. Con l'automatico acceso il pulsante in cassa dice che il foglio è già uscito e serve solo a ristamparlo, e resta spento mentre la stampa è in corso.

La stampa dal browser è vera; il rilevamento, lo stato «in linea» e l'esito della prova sono simulati e lo dicono. Per gli ordini da piattaforma il documento di cortesia esce **in coda alla comanda** sulla stampante di cucina, e non è un'opzione da accendere: dal browser non potrebbe avvenire — la stampa dal browser vuole una persona — e quando le piattaforme entreranno funzionerà così.

Stampanti e monitor cucina si instradano in modo diverso, perché sono oggetti diversi. La stampante è cieca e irreversibile: al collegamento le si assegnano le categorie che deve stampare, e una categoria non può essere assegnata a due stampanti — l'instradamento è uno solo (`category_routings`), scritto sia dal popup sia da Impostazioni → Personale. Il monitor cucina non riceve categorie: vede tutte le comande, e chi ci lavora restringe con i filtri Canali e Categorie nella testata della schermata Cucina. Con più monitor, tutti vedono tutto e ciascuno filtra per conto proprio.

Non è prevista alcuna infrastruttura hardware presso il ristorante. Lo smartphone del personale opera come terminale di pagamento tramite l'App Staff POS con Stripe Terminal SDK e Tap to Pay, con registrazione automatica del dispositivo al primo login.
