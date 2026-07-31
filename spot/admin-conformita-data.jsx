// Conformità — dati per ISO/IEC 27001 (sicurezza) e ISO 9001 (qualità).
//
// CRITERIO: qui vivono solo i registri la cui evidenza è un sottoprodotto
// dell'operatività. Politiche, procedure, Dichiarazione di Applicabilità e
// metodologia di risk assessment NON stanno qui: sono documenti, e vivono nel
// gestore documentale (Drive). I registri ci puntano con `doc`, non li copiano.
//
// Le due norme condividono l'ossatura: audit interni (9.2), riesame di direzione
// (9.3), non conformità e azioni correttive (10.2). Sono costruiti una volta
// sola e valgono per entrambe le certificazioni.

const CONF_OGGI = new Date();
const cfGiorni = (n) => new Date(CONF_OGGI.getTime() + n * 86400000);
const cfMesi = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };

// ─── Adempimenti ricorrenti ────────────────────────────────────────────────
// È il registro che alimenta il Cruscotto. Il modo tipico di perdere una
// certificazione non è sbagliare l'audit iniziale: è ottenerla e poi lasciar
// slittare le scadenze, così la sorveglianza trova i buchi.
//
// DUE NATURE, non una:
//  - tipo 'cadenza' → la prossima scadenza si CALCOLA (ultima + cadenzaMesi).
//    La cadenza la scegli tu: le norme dicono "a intervalli pianificati", non
//    ogni quanto. Ma una volta scritta ti vincola, quindi va scelta sostenibile.
//  - tipo 'data'    → la prossima scadenza è IMPOSTA da fuori e non si calcola.
//    È il caso della sorveglianza dell'ente: la data arriva, non la decidi.
//
// NON APPLICABILE è uno stato, non una cancellazione: dichiarare che un
// requisito non ti riguarda spiegando perché è una mossa corretta e prevista.
// Un adempimento marcato non applicabile è evidenza; lo stesso adempimento
// assente dalla lista è un buco.
const ADEMPIMENTI = [
  // ─── Sicurezza delle informazioni
  { id:'acc',  nome:'Riesame dei diritti di accesso', norme:['27001'], rif:'A.5.18', tipo:'cadenza',
    cadenzaMesi:3,  ultima:new Date('2026-04-14'), responsabile:'Marco Rinaldi', vaiA:{route:'sicurezza', tab:'accessi'} },
  { id:'risk', nome:'Riesame del registro dei rischi', norme:['27001'], rif:'§6.1', tipo:'cadenza',
    cadenzaMesi:6,  ultima:new Date('2026-02-10'), responsabile:'Marco Rinaldi', vaiA:{route:'conformita', tab:'rischi'} },
  { id:'soa',  nome:'Riesame della Dichiarazione di Applicabilità', norme:['27001'], rif:'§6.1.3', tipo:'cadenza',
    cadenzaMesi:12, ultima:new Date('2026-02-10'), responsabile:'Marco Rinaldi', vaiA:null },
  { id:'forn', nome:'Riesame dei fornitori',          norme:['27001','9001'], rif:'A.5.22 · §8.4', tipo:'cadenza',
    cadenzaMesi:12, ultima:new Date('2025-11-18'), responsabile:'Marco Rinaldi', vaiA:{route:'conformita', tab:'fornitori'} },
  { id:'pol',  nome:'Riesame delle politiche e delle procedure', norme:['27001','9001'], rif:'A.5.1 · §7.5', tipo:'cadenza',
    cadenzaMesi:12, ultima:new Date('2025-12-15'), responsabile:'Marco Rinaldi', vaiA:null },
  { id:'form', nome:'Formazione consapevolezza sicurezza', norme:['27001'], rif:'A.6.3', tipo:'cadenza',
    cadenzaMesi:12, ultima:new Date('2025-09-22'), responsabile:'Sara Conti', vaiA:{route:'conformita', tab:'formazione'} },
  { id:'rest', nome:'Test di ripristino dei backup',   norme:['27001'], rif:'A.8.13', tipo:'cadenza',
    cadenzaMesi:6,  ultima:new Date('2026-05-09'), responsabile:'Marco Rinaldi', vaiA:{route:'sicurezza', tab:'diagnostica'} },
  { id:'cont', nome:'Prova del piano di continuità',   norme:['27001'], rif:'A.5.29 · A.5.30', tipo:'cadenza',
    cadenzaMesi:12, ultima:null, responsabile:'Marco Rinaldi', vaiA:null,
    nota:'Diverso dal ripristino del backup: qui si prova il piano, non solo il database.' },
  { id:'vuln', nome:'Verifica della gestione delle vulnerabilità', norme:['27001'], rif:'A.8.8', tipo:'cadenza',
    cadenzaMesi:3,  ultima:null, responsabile:'Marco Rinaldi', vaiA:null,
    nota:'Per un\'azienda che fa software è l\'area su cui l\'auditor scava di più.' },
  { id:'log',  nome:'Riesame dei log e del monitoraggio', norme:['27001'], rif:'A.8.15 · A.8.16', tipo:'cadenza',
    cadenzaMesi:3,  ultima:null, responsabile:'Marco Rinaldi', vaiA:null,
    nota:'Raccogliere i log non basta: la norma chiede che qualcuno li guardi.' },
  { id:'incp', nome:'Prova del piano di risposta agli incidenti', norme:['27001'], rif:'A.5.24 · A.5.26', tipo:'cadenza',
    cadenzaMesi:12, ultima:null, responsabile:'Marco Rinaldi', vaiA:{route:'conformita', tab:'incidenti'},
    nota:'Diversa dalla prova di continuità: lì i sistemi sono giù, qui c\'è una violazione e contano le prime 72 ore.' },
  { id:'cons', nome:'Riesame della conservazione e cancellazione dei dati', norme:['27001'], rif:'A.5.33 · A.8.10', tipo:'cadenza',
    cadenzaMesi:12, ultima:null, responsabile:'Marco Rinaldi', vaiA:null,
    nota:'Dichiarare per quanto tempo tieni i dati non basta: va verificato che alla scadenza spariscano davvero.' },

  // ─── Qualità
  { id:'sodd', nome:'Misurazione della soddisfazione dei clienti', norme:['9001'], rif:'§9.1.2', tipo:'cadenza',
    cadenzaMesi:6,  ultima:null, responsabile:'Laura Bianchi', vaiA:null,
    nota:'Obbligatoria e oggi non svolta in nessuna forma: i tuoi clienti sono i ristoratori.' },
  { id:'obj',  nome:'Riesame degli obiettivi per la qualità', norme:['9001'], rif:'§6.2', tipo:'cadenza',
    cadenzaMesi:6,  ultima:null, responsabile:'Marco Di Meo', vaiA:null,
    nota:'Un indicatore senza bersaglio non è un obiettivo: servono traguardo e verifica.' },
  { id:'ctx',  nome:'Riesame del contesto e delle parti interessate', norme:['9001','27001'], rif:'§4.1 · §4.2', tipo:'cadenza',
    cadenzaMesi:12, ultima:new Date('2025-12-15'), responsabile:'Marco Rinaldi', vaiA:null,
    nota:'Di solito si svolge dentro il riesame di direzione, ma va registrato.' },
  { id:'disp', nome:'Verifica delle interfacce verso i dispositivi di terzi', norme:['9001','27001'], rif:'§8.6 · A.8.29', tipo:'cadenza',
    cadenzaMesi:6,  ultima:null, responsabile:'Marco Di Meo', vaiA:null,
    nota:'Stampanti fiscali e da comanda: se Byup invia un totale o un\'aliquota sbagliata, il danno non è una misura imprecisa, è un documento fiscale errato emesso dal cliente. Si verifica a ogni rilascio, ma senza registrarlo non è evidenza.' },

  // ─── Comuni alle due norme
  { id:'leg',  nome:'Riesame degli obblighi legali e contrattuali', norme:['27001','9001'], rif:'A.5.31 · §8.2.2', tipo:'cadenza',
    cadenzaMesi:12, ultima:null, responsabile:'Laura Bianchi', vaiA:null,
    nota:'Pagamenti e trasmissione fiscale sono i due terreni che cambiano più spesso: il registro delle norme applicabili va tenuto vivo, non scritto una volta.' },
  { id:'audit',nome:'Audit interno',                   norme:['27001','9001'], rif:'§9.2', tipo:'cadenza',
    cadenzaMesi:12, ultima:new Date('2025-10-06'), responsabile:'Consulente esterno', vaiA:{route:'conformita', tab:'audit'} },
  { id:'dir',  nome:'Riesame di direzione',            norme:['27001','9001'], rif:'§9.3', tipo:'cadenza',
    cadenzaMesi:12, ultima:new Date('2025-12-15'), responsabile:'Marco Rinaldi', vaiA:{route:'conformita', tab:'audit'} },

  // ─── Imposti dall'ente di certificazione: la data non la decidi tu
  { id:'sorv', nome:'Sorveglianza dell\'ente di certificazione', norme:['27001','9001'], rif:'schema di certificazione', tipo:'data',
    prossimaImposta:new Date('2026-10-19'), ultima:new Date('2025-10-20'), responsabile:'Marco Rinaldi', vaiA:null,
    nota:'È l\'unica scadenza che non controlli: mancarla non è un rilievo, è perdere il certificato.' },
  { id:'ricer',nome:'Rinnovo del certificato', norme:['27001','9001'], rif:'schema di certificazione', tipo:'data',
    prossimaImposta:new Date('2028-10-19'), ultima:new Date('2025-10-20'), responsabile:'Marco Rinaldi', vaiA:null,
    nota:'Ogni tre anni l\'ente rifà la verifica completa, non solo la sorveglianza.' },

  // ─── Non applicabile: dichiararlo con il motivo è la mossa corretta
  { id:'tar',  nome:'Taratura degli strumenti di misura', norme:['9001'], rif:'§7.1.5', tipo:'cadenza',
    cadenzaMesi:12, ultima:null, responsabile:'—', vaiA:null,
    nonApplicabile:'La taratura riguarda strumenti che misurano e la cui accuratezza va riferita a un campione. Byup non ne impiega. Le stampanti fiscali e da comanda a cui il software si collega non sono di Byup, non misurano nulla e sono già soggette alla verificazione periodica a carico dell\'esercente. La correttezza di ciò che Byup invia a quei dispositivi non è taratura: è coperta dalla verifica delle interfacce verso i dispositivi di terzi.' },
];

// ─── Fornitori (A.5.19–5.23 · §8.4) ────────────────────────────────────────
// Chi tratta quali dati per conto di Byup. È la seconda area più bocciata dopo
// gli accessi, perché quasi nessuno tiene il registro aggiornato.
// Il campo `datiPersonali` non e un dettaglio: decide se serve il DPA. Un
// fornitore che non tratta dati personali per conto di Byup non e un
// responsabile del trattamento, e chiedergli l'accordo dell'art. 28 non lo
// pretende nessuno. `paese` e il codice ISO: da quello discende se i dati
// escono dallo Spazio economico europeo e quindi se servono le clausole.
const FORNITORI = [
  { id:'F01', nome:'Stripe', servizio:'Pagamenti, Connect, Terminal, Billing',
    dati:'Dati di pagamento dei clienti finali e dei locali', datiPersonali:true, paese:'IE',
    dpa:true, dpaFirmatoIl:new Date('2024-03-12'), doc:'Drive · Fornitori/Stripe/DPA-2025.pdf',
    scc:null, certificazioni:['PCI DSS L1','SOC 2 Type II'],
    ultimoRiesame:new Date('2025-11-18'), esito:'confermato' },
  { id:'F02', nome:'Amazon Web Services', servizio:'Infrastruttura (Fargate, RDS, S3)',
    dati:'Tutti i dati della piattaforma a riposo e in transito', datiPersonali:true, paese:'IE',
    dpa:true, dpaFirmatoIl:new Date('2023-09-05'), doc:'Drive · Fornitori/AWS/DPA-2025.pdf',
    scc:null, certificazioni:['ISO 27001','SOC 2 Type II','ISO 27018'],
    ultimoRiesame:new Date('2025-11-18'), esito:'confermato' },
  { id:'F03', nome:'OpenAPI', servizio:'Trasmissione fiscale, validazione dati aziendali',
    dati:'Dati fiscali dei locali, credenziali AdE', datiPersonali:true, paese:'IT',
    dpa:true, dpaFirmatoIl:new Date('2024-06-20'), doc:'Drive · Fornitori/OpenAPI/DPA-2025.pdf',
    scc:null, certificazioni:['ISO 27001'],
    ultimoRiesame:new Date('2025-11-18'), esito:'confermato' },
  { id:'F04', nome:'Anthropic', servizio:'Elaborazione AI dei menu in onboarding',
    dati:'Contenuto dei menu caricati dai locali, nessun dato personale', datiPersonali:false, paese:'US',
    dpa:true, dpaFirmatoIl:new Date('2026-01-15'), doc:'Drive · Fornitori/Anthropic/DPA-2026.pdf',
    scc:null, certificazioni:['SOC 2 Type II'],
    ultimoRiesame:null, esito:null },
  { id:'F05', nome:'Google Maps Platform', servizio:'Discovery e geolocalizzazione locali',
    dati:'Coordinate approssimate degli utenti app', datiPersonali:true, paese:'US',
    dpa:true, dpaFirmatoIl:new Date('2024-02-08'), doc:'Drive · Fornitori/Google/DPA-2025.pdf',
    scc:{ doc:'Drive · Fornitori/Google/SCC-2024.pdf', firmatoIl:new Date('2024-02-08') },
    certificazioni:['ISO 27001','SOC 2 Type II'],
    ultimoRiesame:new Date('2025-11-18'), esito:'confermato' },
  { id:'F06', nome:'Vercel', servizio:'Hosting dei prototipi e delle superfici statiche',
    dati:'Nessun dato personale in produzione', datiPersonali:false, paese:'US',
    dpa:false, dpaFirmatoIl:null, doc:null,
    scc:null, certificazioni:['SOC 2 Type II'],
    ultimoRiesame:null, esito:null },
  { id:'F07', nome:'Firebase Cloud Messaging / APNs', servizio:'Notifiche push',
    dati:'Token dispositivo degli utenti app', datiPersonali:true, paese:'US',
    dpa:true, dpaFirmatoIl:new Date('2024-02-08'), doc:'Drive · Fornitori/Google/DPA-2025.pdf',
    scc:null, certificazioni:['ISO 27001'],
    ultimoRiesame:new Date('2025-11-18'), esito:'confermato' },
];

// ─── Registro dei rischi (§6.1) ────────────────────────────────────────────
// È il documento che l'auditor 27001 legge per primo: da qui discende tutta la
// Dichiarazione di Applicabilità. Livello = probabilità × impatto (scala 1-5).
const RISCHI = [
  { id:'R01', titolo:'Compromissione delle credenziali di un Super Admin',
    categoria:'accessi', prob:2, impatto:5, trattamento:'mitigare',
    controlli:['A.5.15','A.5.17','A.5.18'], responsabile:'Marco Rinaldi',
    misure:'2FA obbligatoria per gli admin, riesame accessi trimestrale, audit log immutabile',
    residuoProb:1, residuoImpatto:5, stato:'trattato', ultimoRiesame:new Date('2026-02-10'),
    riesami:[{ data:new Date('2026-02-10'), chi:'Marco Rinaldi', esito:'confermato',
      nota:'Valutazione invariata. La 2FA risulta attiva su tutti e quattro gli account admin.',
      prob:2, impatto:5, residuoProb:1, residuoImpatto:5 }] },
  { id:'R02', titolo:'Interruzione prolungata del fornitore di pagamento',
    categoria:'fornitori', prob:2, impatto:4, trattamento:'trasferire',
    controlli:['A.5.19','A.5.30'], responsabile:'Marco Di Meo',
    misure:'SLA contrattuale con Stripe, code di retry lato backend, procedura di incasso manuale',
    residuoProb:2, residuoImpatto:3, stato:'trattato', ultimoRiesame:new Date('2026-02-10'),
    riesami:[{ data:new Date('2026-02-10'), chi:'Marco Di Meo', esito:'confermato',
      nota:'Nessun disservizio Stripe oltre i minuti nel semestre. Procedura manuale mai attivata.',
      prob:2, impatto:4, residuoProb:2, residuoImpatto:3 }] },
  { id:'R03', titolo:'Perdita di dati per errore umano o guasto del database',
    categoria:'informatico', prob:2, impatto:5, trattamento:'mitigare',
    controlli:['A.8.13','A.5.29'], responsabile:'Marco Rinaldi',
    misure:'Backup automatici giornalieri con point-in-time recovery, test di ripristino semestrale',
    residuoProb:1, residuoImpatto:4, stato:'trattato', ultimoRiesame:new Date('2026-02-10'),
    riesami:[{ data:new Date('2026-02-10'), chi:'Marco Rinaldi', esito:'aggiornato',
      nota:'Impatto residuo abbassato da 5 a 4 dopo il test di ripristino riuscito di maggio.',
      prob:2, impatto:5, residuoProb:1, residuoImpatto:4 }] },
  { id:'R04', titolo:'Violazione di dati personali dei clienti finali',
    categoria:'dati', prob:2, impatto:5, trattamento:'mitigare',
    controlli:['A.5.34','A.8.12','A.5.24'], responsabile:'Marco Rinaldi',
    misure:'Minimizzazione dei dati raccolti, cifratura a riposo, procedura di notifica entro 72 ore',
    residuoProb:1, residuoImpatto:5, stato:'trattato', ultimoRiesame:new Date('2026-02-10'),
    riesami:[{ data:new Date('2026-02-10'), chi:'Marco Rinaldi', esito:'confermato',
      nota:'Impatto tenuto a 5: la gravità di una violazione non scende per il fatto di essere improbabile.',
      prob:2, impatto:5, residuoProb:1, residuoImpatto:5 }] },
  { id:'R05', titolo:'Dipendenza da una sola persona per le operazioni critiche',
    categoria:'organizzativo', prob:4, impatto:4, trattamento:'mitigare',
    controlli:['A.5.3','A.6.1'], responsabile:'Marco Di Meo',
    misure:'Documentazione delle procedure, nomina di un secondo Super Admin pianificata',
    residuoProb:3, residuoImpatto:4, stato:'aperto', ultimoRiesame:new Date('2026-02-10'),
    riesami:[{ data:new Date('2026-02-10'), chi:'Marco Di Meo', esito:'confermato',
      nota:'Resta aperto: il secondo Super Admin è pianificato ma non ancora nominato.',
      prob:4, impatto:4, residuoProb:3, residuoImpatto:4 }] },
  { id:'R06', titolo:'Indisponibilità della connettività nei locali',
    categoria:'operativo', prob:3, impatto:3, trattamento:'accettare',
    controlli:['A.5.30'], responsabile:'Marco Rinaldi',
    misure:'Rischio accettato: mitigato da partnership con fornitori di connettività, nessun componente locale da presidiare',
    residuoProb:3, residuoImpatto:3, stato:'accettato', ultimoRiesame:new Date('2026-02-10'),
    riesami:[{ data:new Date('2026-02-10'), chi:'Marco Rinaldi', esito:'confermato',
      nota:'Accettazione riconfermata: la connettività del locale non è sotto il controllo di Byup.',
      prob:3, impatto:3, residuoProb:3, residuoImpatto:3 }] },
  { id:'R07', titolo:'Uso improprio dei dati dei menu da parte del fornitore AI',
    categoria:'fornitori', prob:1, impatto:3, trattamento:'mitigare',
    controlli:['A.5.19','A.5.21'], responsabile:'Marco Rinaldi',
    misure:'DPA con esclusione dall\'addestramento, nessun dato personale inviato',
    residuoProb:1, residuoImpatto:2, stato:'nuovo', ultimoRiesame:null, riesami:[] },
];

// ─── Incidenti (A.5.24–5.28) ───────────────────────────────────────────────
// Il campo che conta davvero è `dataBreach`: fa partire l'orologio delle 72 ore
// verso il Garante. Senza quel flag l'incidente è solo un disservizio.
// `categoria` classifica CIO CHE E SUCCESSO, non la causa a monte: e per questo
// che non coincide con le categorie del registro dei rischi, che invece
// classificano per causa. `rischioCollegato` chiude il cerchio di A.5.27 — un
// incidente o conferma un rischio gia censito, o ne rivela uno che manca.
// `origine` distingue cio che il monitoraggio ha visto da solo da cio che ha
// dovuto segnalare una persona: la seconda categoria e la maggioranza.
// `durataMin` e il tempo in cui il servizio e rimasto fermo o degradato, ed e
// quello che Diagnostica va a leggere: 0 vuol dire che il servizio non si e
// mai fermato (un'email spedita all'indirizzo sbagliato e grave, ma non e un
// down), null che l'incidente e ancora aperto e la durata non si puo scrivere.
// Questo registro e l'unica lista degli incidenti: Diagnostica non ne tiene
// una sua: mostra questi, filtrati per impatto sul servizio.
const INCIDENTI = [
  { id:'INC-2026-005', data:cfGiorni(-4), titolo:'Errori 3DS sopra la media sugli addebiti ricorrenti',
    categoria:'fornitore', origine:'automatico', rischioCollegato:'R02',
    servizio:'Pagamenti (Stripe)', gravita:'media', dataBreach:false, durataMin:null,
    causaRadice:'Cambio di policy dell\'emittente su una fascia di carte, non gestito dal retry',
    azione:'Aggiunto fallback su 3DS2 e allerta automatica sopra il 2% di fallimenti',
    stato:'in corso', chiusuraIl:null, responsabile:'Marco Rinaldi' },
  { id:'INC-2026-004', data:new Date('2026-07-14'), titolo:'Timeout sugli addebiti ricorrenti',
    categoria:'indisponibilita', origine:'automatico', rischioCollegato:'R02',
    servizio:'Pagamenti (Stripe)', gravita:'media', dataBreach:false, durataMin:23,
    causaRadice:'Picco di latenza del fornitore durante la finestra di addebito notturna',
    azione:'Riprocessati automaticamente, finestra spostata e allarme sulla coda',
    stato:'chiuso', chiusuraIl:new Date('2026-07-16'), responsabile:'Marco Rinaldi' },
  { id:'INC-2026-003', data:new Date('2026-07-02'), titolo:'Ritardo nella consegna delle notifiche su Android',
    categoria:'indisponibilita', origine:'manuale', rischioCollegato:null,
    servizio:'Notifiche push', gravita:'bassa', dataBreach:false, durataMin:70,
    causaRadice:'Coda FCM satura per un invio broadcast non scaglionato',
    azione:'Introdotto scaglionamento degli invii massivi',
    stato:'chiuso', chiusuraIl:new Date('2026-07-03'), responsabile:'Paola Esposito' },
  // Viveva solo dentro Diagnostica, come riga scritta a mano: un picco di 5xx
  // in produzione e un incidente a tutti gli effetti, e qui si vede che nessun
  // rischio censito copre i rilasci difettosi — il buco che A.5.27 chiede di
  // riportare nel registro dei rischi.
  { id:'INC-2026-002', data:new Date('2026-06-18'), titolo:'Picco di errori 5xx sulle API ordini durante un rilascio',
    categoria:'indisponibilita', origine:'automatico', rischioCollegato:null,
    servizio:'API ordini', gravita:'media', dataBreach:false, durataMin:8,
    causaRadice:'Migrazione di schema non retrocompatibile inclusa nel rilascio',
    azione:'Rollback immediato; le migrazioni di schema viaggiano in un rilascio separato dal codice',
    stato:'chiuso', chiusuraIl:new Date('2026-06-18'), responsabile:'Marco Di Meo' },
  { id:'INC-2026-001', data:new Date('2026-03-11'), titolo:'Invio di un\'email di servizio a un indirizzo errato',
    categoria:'dati', origine:'manuale', rischioCollegato:'R04',
    servizio:'Email transazionali', gravita:'alta', dataBreach:true, durataMin:0,
    breachNotificato:true, breachNotificaIl:new Date('2026-03-12'),
    breachInteressati:1, breachValutazione:'Rischio basso per i diritti dell\'interessato: nessun dato di pagamento, destinatario unico identificato e collaborativo',
    causaRadice:'Errore di digitazione nell\'indirizzo durante una risposta manuale a un ticket',
    azione:'Rimossa la possibilita di digitare a mano il destinatario: si seleziona dall\'anagrafica',
    stato:'chiuso', chiusuraIl:new Date('2026-03-20'), responsabile:'Marco Rinaldi' },
];

// ─── Non conformità e azioni correttive (§10.2) ────────────────────────────
// Il cuore della 9001. La materia prima arriva già da Ticket: qui le
// segnalazioni che sono davvero non conformità vengono classificate e chiuse
// con la verifica di efficacia, che è il passaggio che quasi tutti saltano.
const NON_CONFORMITA = [
  { id:'NC-2026-006', data:cfGiorni(-9), origine:'Segnalazione locale', tipo:'processo',
    descrizione:'Ritardo di oltre 48 ore nella risposta a tre segnalazioni ad alta priorità',
    causaRadice:'Nessuna regola di presa in carico: i ticket alta priorità entravano nella coda comune',
    azione:'Introdotta la striscia SLA in Ticket e la presa in carico esplicita',
    responsabile:'Sara Conti', scadenza:cfGiorni(12), efficacia:null, stato:'in corso' },
  { id:'NC-2026-005', data:new Date('2026-06-20'), origine:'Audit interno', tipo:'documentale',
    descrizione:'Registro dei fornitori non aggiornato da oltre 8 mesi',
    causaRadice:'Nessun adempimento periodico assegnato né tracciato',
    azione:'Creato il registro fornitori in Spot con riesame annuale e responsabile assegnato',
    responsabile:'Marco Rinaldi', scadenza:cfGiorni(-2), efficacia:null, stato:'da verificare' },
  { id:'NC-2026-004', data:new Date('2026-05-04'), origine:'Reclamo cliente', tipo:'prodotto',
    descrizione:'Scontrini di cortesia non stampati su due locali per un errore di configurazione',
    causaRadice:'Passo di configurazione stampante non obbligatorio nell\'onboarding',
    azione:'Reso obbligatorio il test di stampa prima del go-live',
    responsabile:'Laura Bianchi', scadenza:new Date('2026-05-30'), efficacia:'efficace',
    verificaIl:new Date('2026-06-28'), stato:'chiusa' },
  { id:'NC-2026-003', data:new Date('2026-03-11'), origine:'Incidente', tipo:'processo',
    descrizione:'Email di servizio inviata a destinatario errato (vedi INC-2026-001)',
    causaRadice:'Destinatario digitabile a mano nelle risposte ai ticket',
    azione:'Selezione del destinatario dall\'anagrafica, digitazione libera rimossa',
    responsabile:'Marco Rinaldi', scadenza:new Date('2026-03-31'), efficacia:'efficace',
    verificaIl:new Date('2026-05-11'), stato:'chiusa' },
];

// ─── Audit interni (§9.2) ──────────────────────────────────────────────────
const AUDIT_INTERNI = [
  { id:'AI-2025-01', data:new Date('2025-10-06'), ambito:['27001','9001'],
    auditor:'Studio Bianchi & Associati · esterno', aree:'Accessi, fornitori, incidenti, onboarding clienti',
    rilievi:3, maggiori:0, minori:2, osservazioni:1, stato:'chiuso',
    doc:'Drive · Audit/2025/Rapporto-audit-interno-2025.pdf' },
  { id:'AI-2024-01', data:new Date('2024-11-12'), ambito:['9001'],
    auditor:'Studio Bianchi & Associati · esterno', aree:'Gestione reclami, soddisfazione cliente',
    rilievi:2, maggiori:0, minori:1, osservazioni:1, stato:'chiuso',
    doc:'Drive · Audit/2024/Rapporto-audit-interno-2024.pdf' },
];

// ─── Riesami di direzione (§9.3) ───────────────────────────────────────────
// Gli input richiesti dalla norma sono sempre gli stessi: Spot li sa già quasi
// tutti, quindi il pacchetto si prepara da solo.
const RIESAMI_DIREZIONE = [
  { id:'RD-2025', data:new Date('2025-12-15'), partecipanti:'Marco Rinaldi, Marco Di Meo, Laura Bianchi',
    // Le decisioni portano il tipo previsto dalla 9.3.3: miglioramento,
    // modifiche al sistema, risorse. Sono le tre voci che l'auditor cerca
    // separatamente, e una casella vuota per anni e essa stessa un segnale.
    decisioni:[
      { testo:'Avviare il registro fornitori strutturato', tipo:'miglioramento' },
      { testo:'Portare il riesame accessi da semestrale a trimestrale', tipo:'modifiche' },
      { testo:'Nominare un secondo Super Admin entro il primo semestre 2026 (rischio R05)', tipo:'risorse' },
    ],
    stato:'chiuso', doc:'Drive · Riesami/2025/Verbale-riesame-direzione-2025.pdf' },
];

// ─── Formazione (A.6.3) ────────────────────────────────────────────────────
// Solo il registro: chi, quando, quando scade. Il contenuto del corso sta su Drive.
const FORMAZIONE = [
  { persona:'Marco Rinaldi',   corso:'Consapevolezza sicurezza e phishing', completatoIl:new Date('2025-09-22'), validitaMesi:12 },
  { persona:'Laura Bianchi',   corso:'Consapevolezza sicurezza e phishing', completatoIl:new Date('2025-09-22'), validitaMesi:12 },
  { persona:'Davide Romano',   corso:'Consapevolezza sicurezza e phishing', completatoIl:new Date('2025-09-22'), validitaMesi:12 },
  { persona:'Sara Conti',      corso:'Consapevolezza sicurezza e phishing', completatoIl:new Date('2025-09-22'), validitaMesi:12 },
  { persona:'Andrea Verdi',    corso:'Consapevolezza sicurezza e phishing', completatoIl:new Date('2025-09-22'), validitaMesi:12 },
  { persona:'Paola Esposito',  corso:'Consapevolezza sicurezza e phishing', completatoIl:new Date('2025-09-22'), validitaMesi:12 },
  { persona:'Marco Galli',     corso:'Consapevolezza sicurezza e phishing', completatoIl:new Date('2026-02-03'), validitaMesi:12 },
  { persona:'Elena Ricci',     corso:'Consapevolezza sicurezza e phishing', completatoIl:null, validitaMesi:12 },
  // Un corso avviato e non ancora finito: «mai svolta» e «in corso» sono due
  // situazioni diverse e la prima e un rilievo, la seconda no.
  { persona:'Nicola Ferrara',  corso:'Consapevolezza sicurezza e phishing', completatoIl:null, avviatoIl:new Date('2026-07-20'), validitaMesi:12 },
  { persona:'Marco Rinaldi',   corso:'Gestione degli incidenti e data breach', completatoIl:new Date('2026-01-15'), validitaMesi:24 },
  { persona:'Sara Conti',      corso:'Gestione degli incidenti e data breach', completatoIl:new Date('2026-01-15'), validitaMesi:24 },
];

// ─── Test di ripristino (A.8.13) ───────────────────────────────────────────
// "Quando avete provato l'ultimo restore" è la domanda che gli auditor fanno
// sempre e a cui quasi nessuno sa rispondere con un registro.
const RIPRISTINI = [
  { data:new Date('2026-05-09'), oggetto:'Database Postgres · point-in-time a 24 ore',
    tempoMin:38, esito:'riuscito', chi:'Marco Rinaldi',
    note:'Ripristino su ambiente isolato, verificata integrità di ordini e conti dell\'ultima giornata' },
  { data:new Date('2025-11-14'), oggetto:'Database Postgres · snapshot completo',
    tempoMin:52, esito:'riuscito con osservazioni', chi:'Marco Rinaldi',
    note:'Riuscito ma oltre l\'obiettivo di 45 minuti: aumentata la classe dell\'istanza di ripristino' },
  { data:new Date('2025-05-20'), oggetto:'Bucket S3 · media e allegati',
    tempoMin:12, esito:'riuscito', chi:'Marco Rinaldi', note:'' },
];

window.CONF_OGGI = CONF_OGGI;
window.cfMesi = cfMesi;
window.ADEMPIMENTI = ADEMPIMENTI;
window.FORNITORI = FORNITORI;
window.RISCHI = RISCHI;
window.INCIDENTI = INCIDENTI;
window.NON_CONFORMITA = NON_CONFORMITA;
window.AUDIT_INTERNI = AUDIT_INTERNI;
window.RIESAMI_DIREZIONE = RIESAMI_DIREZIONE;
window.FORMAZIONE = FORMAZIONE;
window.RIPRISTINI = RIPRISTINI;
