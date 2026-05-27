# CLAUDE.md — Byup

## Cosa è Byup

Byup è una piattaforma SaaS in cloud per la gestione e gli ordini nei locali della ristorazione italiana di piccole e medie dimensioni. Si compone di due prodotti distinti pensati come alternative, non come progressione: il cliente sceglie all'onboarding in base al modello operativo del proprio locale.

*Byup Fresh* è il prodotto in fase di MVP e si rivolge a locali ad alta rotazione senza servizio al tavolo (pizzerie d'asporto, cocktail bar, food truck, bistrot veloci). Pricing a fasce basate sul numero di ordini.

*Byup Manager* si rivolge a ristoranti strutturati con servizio al tavolo, pricing a fasce basate sul fatturato. Più complesso, verrà sviluppato dopo che Fresh avrà validato le ipotesi core. Per ora non scrivere codice Manager-specifico.

Il go-to-market verso un'unica brand con due tier determinati all'onboarding (invece di due prodotti distinti) è una decisione ancora aperta: l'architettura deve poter accomodare entrambe le narrative senza riscritture.

## La meccanica del mezzo ordine

È il meccanismo distintivo di Byup e va trattato come logica di business di primo livello, non come un dettaglio. Gli ordini pagati tramite l'app consumer di Byup contano 0,5x verso le soglie del piano del ristoratore. Questo crea l'incentivo per il ristoratore a spingere l'adozione dell'app tra i propri clienti finali. Il pagamento via app richiede il download dell'app nativa: è una scelta strategica deliberata per costruire una user base identificata che alimenti il flywheel — non va aggirata con flussi web-only "perché più comodi".

Conseguenza architetturale importante: la dashboard del ristoratore deve rendere visibile in modo evidente il risparmio generato dagli ordini app rispetto alle soglie. Senza quella visibilità, il flywheel non funziona.

## MVP Fresh: cosa è dentro e cosa è fuori

Lo scope dell'MVP è volutamente stretto. Dentro ci sono cassa, menù, kitchen monitor, ordini e webapp consumer. Fuori dall'MVP, da affrontare dopo: analytics, vetrina, integrazione SdI fiscale, modello local-first, packaging desktop multi-OS, onboarding self-service completo, strategia di test formalizzata, modellazione dei costi cloud.

Decisioni architetturali già prese da non rimettere in discussione senza esplicito accordo: il modello local-first è stato rimosso dall'MVP; il connettore RT per stampante fiscale è stato rimosso a favore di un approccio fiscale solo via OpenAPI; il multi-site rimane in piattaforma ma UI e onboarding nell'MVP sono vincolati a esperienza single-site; per la stampa di cucina si va su Epson ePOS SDK direct browser-to-printer più schermi KDS.

Due aree restano sotto-specificate e vanno chiarite prima di scriverne il codice: il journey end-to-end dell'app consumer (discovery → associazione tavolo → ordine → pagamento) e i flussi di onboarding self-service.

## Pricing e logica di billing

Fresh ha cinque fasce: Free fino a 500 ordini, Starter a 24,99 € fino a 1.000, Plus a 49,99 € fino a 2.100, Business a 86,99 € fino a 4.200, Enterprise a 126,99 € fino a 8.000. Le tariffe di overage sono volutamente aggressive per mantenere l'effetto cliff e spingere l'upgrade — non vanno "addolcite" nell'implementazione perché sembrano ostili. Tre meccanismi di mitigazione che devono entrare nella billing logic: capping automatico dell'overage al prezzo del piano successivo (elimina il bill shock), 60 giorni di onboarding senza overage per i nuovi clienti, opzione tariffa annuale flat per chi rifiuta il variabile.

Manager non ha free tier e assegna automaticamente il piano in base al fatturato del locale, da Low a 50 € fino a Champion a 400 €. I pacchetti spot per acquisti una tantum sono rimandati al lancio.

## Stack e strumenti

Stripe per i pagamenti, con gestione del PCI scope confermata via Stripe stesso. Epson ePOS SDK per la stampa di cucina, integrazione browser-direct senza middleware. Claude Code come acceleratore primario di sviluppo, in coppia con un senior full-stack developer come collaboratore umano. Per il dimensionamento di mercato il riferimento sono i dati FIPE: ~195.000 esercizi totali, ~135-155k indirizzabili da Fresh, ~80-90k da Manager.

## Come lavorare con Fabio

Fabio lavora in modo iterativo e diretto: conferma, corregge o reindirizza in modo conciso prima di passare al punto successivo. Spinge indietro con forza quando le stime non sono ancorate a dati reali, e preferisce risposte che mantengano una posizione quando i numeri la sostengono, piuttosto che assecondare per accomodamento. Le decisioni si strutturano in sequenza: pricing → modello finanziario → architettura → go-to-market → fundraising.

Niente bullet point e niente prolissità nelle risposte. Stile descrittivo, conciso, focalizzato. Quando emerge una nuova feature in conversazione, la domanda di default è "fa parte del core MVP o va deferito?", e il default è deferire salvo evidenza contraria. La copy di prodotto preferita è snella e focalizzata sul prodotto, non introduzioni aziendali generiche.

Lingua: i documenti italiani si lavorano in italiano, per il resto flessibile.

## Contesto competitivo

I competitor (Tilby, Cassa in Cloud, SumUp, Toast, Lightspeed) usano universalmente flat monthly fees. Il modello usage-based di Byup è genuinamente differenziato ma richiede calibrazione attenta delle soglie per non distruggere l'incentivo all'upsell. Le preoccupazioni residue dei ristoratori (switching cost, rischio startup) non sono problemi di pricing: si risolvono con traction e social proof, non rivedendo i piani — quindi non vanno usate come pretesto per ammorbidire la struttura tariffaria nel codice o nella UX.
