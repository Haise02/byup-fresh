// Byup Spot — Chiamata assistenza · dati
//
// Quattro corpi di dati che vivono nella stessa sezione perché rispondono alla
// stessa domanda — «come stiamo assistendo i ristoratori?» — da quattro lati:
//
//   1. RICHIAMATE   le prenotazioni di richiamata prese dai ristoratori (la coda)
//   2. TICKET_SRV   le richieste di assistenza aperte, per i volumi e i tempi
//   3. FAQ_SRV      la base di conoscenza pubblicata nel gestionale
//   4. GUIDE_SRV    le guide, raggruppate per argomento, con il video allegato
//
// Le date sono ancorate a `Date.now()` e non a costanti: un dataset con date
// fisse invecchia e dopo qualche settimana la coda mostra scadenze tutte rosse.

// ─── 1. Richiamate ──────────────────────────────────────────────────────────
//
// Il ristoratore prenota una richiamata dal gestionale. Ogni riga porta:
// il numero da chiamare, quando l'ha prenotata, il problema che ha dichiarato
// e — la colonna che conta — entro quando va richiamato.
//
// Come il ristoratore ha etichettato il problema prenotando. Non decide più la
// scadenza — quella la sceglie lui a parte, vedi SRV_FASCE — e serve solo a
// dare un colore alla riga e a leggere lo storico di un locale.
const SRV_CATEGORIE = {
  blocco:      { label: 'Locale fermo',        color: 'DANGER' },
  servizio:    { label: 'Servizio degradato',  color: 'WARN'   },
  contabilita: { label: 'Contabilità e fisco', color: 'INFO'   },
  configurazione: { label: 'Configurazione',   color: 'TEAL'   },
  commerciale: { label: 'Commerciale',         color: 'PURPLE' },
};

// ─── Chi ha diritto alla chiamata ───────────────────────────────────────────
//
// La chiamata è una prestazione dei piani alti. Gratuito e Starter hanno
// l'assistenza via ticket, che è scritta e non ha un orologio; Plus e Business
// possono prenotare di essere richiamati.
//
// Detto in codice e non solo a parole, perché è la differenza che regge il
// prezzo: se comparisse una chiamata da un locale Starter vorrebbe dire che
// stiamo regalando la cosa per cui gli altri pagano il doppio.
const SRV_PIANI_CON_CHIAMATA = ['plus', 'business'];
const srvHaChiamata = (piano) => SRV_PIANI_CON_CHIAMATA.indexOf(piano) !== -1;

// ─── Entro quando richiamare ────────────────────────────────────────────────
//
// La sceglie il ristoratore quando prenota, e per questo la scadenza non si
// deduce più dalla gravità dichiarata: era byup a decidere che «locale fermo»
// valesse un'ora, ma chi sta col locale fermo e la cassa in mano magari
// preferisce essere richiamato con calma domattina invece che in mezzo al
// servizio. La fretta la conosce lui.
//
// Le due fasce lunghe non sono «entro N ore» ma finestre del giorno: chiudono
// alle 12:00 e alle 18:00, e se si prenota a finestra già passata si scivola a
// quella del giorno dopo.
const SRV_FASCE = {
  min30:      { label: 'Entro 30 minuti',  breve: '30 min',    tipo:'durata',    minuti: 30 },
  ore2:       { label: 'Entro 2 ore',      breve: '2 ore',     tipo:'durata',    minuti: 120 },
  mattina:    { label: 'In mattinata',     breve: 'mattina',   tipo:'finestra',  da: 9,  a: 12 },
  pomeriggio: { label: 'Nel pomeriggio',   breve: 'pomeriggio', tipo:'finestra', da: 14, a: 18 },
};

// Scadenza effettiva a partire dal momento della prenotazione.
function srvScadenza(prenotataIl, fascia) {
  const f = SRV_FASCE[fascia] || SRV_FASCE.ore2;
  if (f.tipo === 'durata') return new Date(prenotataIl.getTime() + f.minuti * 60000);
  // Finestra: si chiude all'ora `a`. Se è già passata, vale quella di domani.
  const scad = new Date(prenotataIl);
  scad.setHours(f.a, 0, 0, 0);
  if (scad <= prenotataIl) scad.setDate(scad.getDate() + 1);
  return scad;
}

const SRV_MIN = 60000;
const SRV_ORA = 3600000;
const SRV_GIORNO = 86400000;

// ─── L'esito della chiamata ─────────────────────────────────────────────────
//
// Due tassonomie diverse che è facile confondere, quindi vale la pena dirlo:
//
//   SRV_CATEGORIE  è come il RISTORATORE ha classificato il problema quando ha
//                  prenotato, e non cambia più. Non decide la scadenza:
//                  quella è la fascia che ha scelto lui.
//   SRV_PROBLEMI   è come l'OPERATORE lo classifica dopo aver riagganciato,
//                  cioè che cosa si è rivelato davvero. Le due spesso non
//                  coincidono — «locale fermo» che si scopre essere una
//                  domanda su come si usa il gestionale è il caso tipico — ed
//                  è proprio dallo scarto fra le due che si capisce quali
//                  problemi la piattaforma non sa spiegare da sola.
const SRV_PROBLEMI = {
  tecnico:        { label: 'Tecnico',            color: 'DANGER', nota: 'Guasto o malfunzionamento della piattaforma' },
  configurazione: { label: 'Configurazione',     color: 'TEAL',   nota: 'Impostazioni del locale, menu, sala, dispositivi' },
  pagamenti:      { label: 'Pagamenti e incassi', color: 'GREEN', nota: 'Accrediti, transazioni, POS, IBAN' },
  contabile:      { label: 'Contabilità e fisco', color: 'INFO',  nota: 'Corrispettivi, IVA, esportazioni, commercialista' },
  commerciale:    { label: 'Commerciale',        color: 'PURPLE', nota: 'Piani, prezzi, upgrade, disdette' },
  informazione:   { label: 'Informazione',       color: 'NEUTRAL', nota: 'Domanda su come funziona: nessun problema reale' },
  reclamo:        { label: 'Reclamo',            color: 'WARN',   nota: 'Lamentela sul servizio o sull\'assistenza ricevuta' },
};

// Urgenza: la mette l'operatore SOLO quando il problema resta aperto. È una
// cosa diversa dall'SLA della prenotazione — quello diceva entro quando
// chiamare, questa dice entro quando tornare sul problema.
const SRV_URGENZE = {
  bassa:   { label: 'Bassa',   color: 'NEUTRAL', nota: 'Nessun impatto sul servizio, si riprende quando capita' },
  media:   { label: 'Media',   color: 'INFO',    nota: 'Da riprendere entro la settimana' },
  alta:    { label: 'Alta',    color: 'WARN',    nota: 'Da riprendere in giornata' },
  critica: { label: 'Critica', color: 'DANGER',  nota: 'Il locale non sta incassando: torna subito sul pezzo' },
};

// Quando il ristoratore non risponde parte questa mail, sempre la stessa.
// Non è una scelta dell'operatore, perché non c'è niente da scegliere: non
// gli promettiamo di richiamarlo — l'impegno preso l'abbiamo già onorato,
// l'abbiamo chiamato entro la scadenza. Gli diciamo che ci abbiamo provato e
// che se il problema è ancora lì la prossima mossa è sua.
//
// Il tono è deliberatamente leggero sul «speriamo si sia risolto»: chiudere
// dicendo «non ti abbiamo trovato» e basta suonerebbe come un rimprovero, e
// il caso più comune è che nel frattempo se la sia cavata da solo.
const SRV_MAIL_NON_RISPOSTA = {
  oggetto: 'Abbiamo provato a chiamarti',
  corpo: 'Abbiamo provato a chiamarti, ma non ti abbiamo trovato disponibile. '
       + 'Speriamo che il tuo problema si sia risolto!',
  chiusura: 'Se non fosse così, prenota pure un altro appuntamento quando ti è comodo.',
  cta: 'Prenota un altro appuntamento',
};

// Le richiamate chiuse portano l'esito: quando è stata fatta davvero (da cui
// «in tempo» o no), chi l'ha fatta, e — se il ristoratore ha risposto al
// sondaggio — voto da 1 a 5 con l'eventuale commento.
const RICHIAMATE = (() => {
  const grezze = [
    // ── In attesa ──────────────────────────────────────────────────────────
    { id:'RC-241', localeId:'L1005', cat:'blocco',      da:12*SRV_MIN, fascia:'min30',
      problema:'I QR non aprono più il menu: i clienti vedono «pagina non trovata». Sala piena.' },
    { id:'RC-240', localeId:'L1029', cat:'contabilita', da:55*SRV_MIN, fascia:'ore2',
      problema:'Export contabilità di maggio in errore 502. Deve consegnare al commercialista entro venerdì.' },
    { id:'RC-239', localeId:'L1012', cat:'servizio',    da:1.6*SRV_ORA, fascia:'ore2',
      problema:'Le notifiche di nuova prenotazione non arrivano più sul telefono dopo l\'aggiornamento.' },
    { id:'RC-238', localeId:'L1041', cat:'configurazione', da:2.4*SRV_ORA, fascia:'pomeriggio',
      problema:'Ha rifatto la disposizione dei tavoli e non riesce a rigenerare gli sticker QR.' },
    { id:'RC-237', localeId:'L1020', cat:'commerciale', da:3.2*SRV_ORA, fascia:'mattina',
      problema:'Vuole capire cosa cambia passando da Starter a Plus prima di decidere.' },
    // Scaduta: l'SLA era un'ora, sono passate quasi tre. È il caso che la
    // schermata deve saper mostrare, non nascondere.
    { id:'RC-236', localeId:'L1034', cat:'blocco',      da:2.8*SRV_ORA, fascia:'min30',
      problema:'Cassa bloccata sulla schermata di apertura turno, non riesce a battere gli scontrini.' },
    { id:'RC-235', localeId:'L1014', cat:'servizio',    da:5*SRV_ORA, fascia:'ore2',
      problema:'La stampante di cucina salta le comande dei dolci.' },

    // ── Chiamate fatte in giornata ─────────────────────────────────────────
    // `prob` è la classificazione dell'operatore a chiamata finita; `risolto`
    // dice se il problema è chiuso. Se resta aperto servono `urg` e `note`:
    // sono le tre cose che chi la riprende in mano deve trovare scritte.
    { id:'RC-234', localeId:'L1006', cat:'blocco',      da:7*SRV_ORA, fascia:'min30',   fattaDopo:24*SRV_MIN,  op:'support1', durata:11, voto:5,
      prob:'tecnico', risolto:true,
      note:'Servizio di stampa in stallo sul concentratore. Riavviato da remoto, comande ripartite mentre eravamo al telefono.',
      recensione:'Richiamato in venti minuti e risolto al telefono. Non me lo aspettavo a quell\'ora.' },
    { id:'RC-233', localeId:'L1018', cat:'configurazione', da:9*SRV_ORA, fascia:'ore2', fattaDopo:3.1*SRV_ORA, op:'support2', durata:18, voto:4,
      prob:'configurazione', risolto:true,
      note:'Non trovava la rigenerazione dei QR dopo aver rinumerato i tavoli. Fatta insieme, PDF scaricato.',
      recensione:'Tutto chiarito, ma ho dovuto aspettare il pomeriggio.' },
    // Il caso che giustifica due tassonomie: prenotata come «servizio
    // degradato», si è rivelata una domanda su come si usa il gestionale.
    { id:'RC-232', localeId:'L1002', cat:'servizio',    da:10*SRV_ORA, fascia:'ore2',  fattaDopo:47*SRV_MIN,  op:'support1', durata:9,  voto:5,
      prob:'informazione', risolto:true,
      note:'Nessun guasto: cercava il filtro per data nello storico ordini. Indicato dove sta.' },
    { id:'RC-231', localeId:'L1027', cat:'contabilita', da:11*SRV_ORA, fascia:'pomeriggio',  fattaDopo:2.2*SRV_ORA, op:'support3', durata:26, voto:5,
      prob:'contabile', risolto:true,
      note:'Aliquota ridotta non applicata sull\'asporto. Corretta l\'impostazione fiscale del menu e rigenerato il corrispettivo.',
      recensione:'Mi hanno seguito passo passo sull\'IVA di giugno. Competenti.' },
    { id:'RC-230', localeId:'L1009', cat:'commerciale', da:1*SRV_GIORNO, fascia:'mattina', fattaDopo:4.5*SRV_ORA, op:'support2', durata:22, voto:4,
      prob:'commerciale', risolto:false, urg:'bassa',
      note:'Valuta il passaggio a Plus ma vuole prima vedere i numeri del trimestre. Da risentire a inizio mese con il confronto costi già pronto.' },

    // ── Ieri e giorni scorsi ───────────────────────────────────────────────
    { id:'RC-229', localeId:'L1031', cat:'blocco',      da:1.3*SRV_GIORNO, fascia:'ore2', fattaDopo:38*SRV_MIN, op:'support1', durata:14, voto:5,
      prob:'tecnico', risolto:true,
      note:'Tablet di sala fuori dalla rete dopo il cambio router. Riconnesso e fissato l\'IP.' },
    // Fuori tempo massimo: 3 ore su un SLA di 2. Il voto lo racconta.
    { id:'RC-228', localeId:'L1034', cat:'servizio',    da:1.5*SRV_GIORNO, fascia:'ore2', fattaDopo:3*SRV_ORA,  op:'support3', durata:7,  voto:2,
      prob:'tecnico', risolto:true,
      note:'Comande dei dolci perse: regola di instradamento verso la stampante sbagliata. Corretta.',
      recensione:'Il problema è stato risolto, ma ho perso il servizio della sera aspettando la chiamata.' },
    { id:'RC-227', localeId:'L1015', cat:'configurazione', da:2*SRV_GIORNO, fascia:'pomeriggio', fattaDopo:5.4*SRV_ORA, op:'support2', durata:31, voto:4,
      prob:'configurazione', risolto:true,
      note:'Rifatta insieme la mappa sala su due sale separate.',
      recensione:'Spiegazione chiara sulla mappa sala. Un po\' lunga la trafila.' },
    { id:'RC-226', localeId:'L1037', cat:'blocco',      da:2.2*SRV_GIORNO, fascia:'ore2', fattaDopo:41*SRV_MIN, op:'support1', durata:16, voto:5,
      prob:'tecnico', risolto:true,
      note:'Cassa bloccata in apertura turno per una sessione rimasta appesa. Chiusa lato server.',
      recensione:'Sara è stata precisa e veloce, ci ha rimesso in piedi prima della cena.' },
    // Aperta e urgente: l'export non funziona e la scadenza fiscale incombe.
    { id:'RC-225', localeId:'L1005', cat:'contabilita', da:2.6*SRV_GIORNO, fascia:'ore2', fattaDopo:6.8*SRV_ORA, op:'support3', durata:12, voto:3,
      prob:'contabile', risolto:false, urg:'alta',
      note:'Export di maggio va in 502 su tre tentativi: il file supera i 40 MB e il generatore va in timeout. Passato allo sviluppo, al ristoratore serve entro venerdì per il commercialista.',
      recensione:'Risposta corretta ma sono stato richiamato quasi a fine giornata.' },
    { id:'RC-224', localeId:'L1044', cat:'servizio',    da:3*SRV_GIORNO, fascia:'ore2',   fattaDopo:1.1*SRV_ORA, op:'support2', durata:19, voto:5,
      prob:'configurazione', risolto:true,
      note:'Notifiche prenotazioni disattivate sul profilo del titolare dopo l\'aggiornamento. Riattivate.' },
    { id:'RC-223', localeId:'L1011', cat:'commerciale', da:3.4*SRV_GIORNO, fascia:'mattina', fattaDopo:3.9*SRV_ORA, op:'support1', durata:24, voto:4,
      prob:'commerciale', risolto:true,
      note:'Chiarita la differenza fra ordini inclusi ed extra. Resta su Starter, consapevole.' },
    // Non ha risposto: parte la mail automatica. Non è «in tempo» né «in
    // ritardo» — resta fuori dal rapporto sulla puntualità, ma dentro il
    // Non risolto, perché il problema del ristoratore è ancora lì.
    // Niente `note` sulle non risposte: la UI non le chiede più, e un dato di
    // esempio che l'interfaccia non sa produrre è una finzione che poi qualcuno
    // prende per specifica.
    { id:'RC-222', localeId:'L1008', cat:'configurazione', da:3.8*SRV_GIORNO, fascia:'min30', persa:true, tentativi:3, op:'support2' },
    { id:'RC-221', localeId:'L1025', cat:'blocco',      da:4.2*SRV_GIORNO, fascia:'ore2', fattaDopo:52*SRV_MIN, op:'support3', durata:13, voto:5,
      prob:'tecnico', risolto:true,
      note:'QR che rimandavano a un menu archiviato. Ripubblicato quello corrente.' },
    { id:'RC-220', localeId:'L1019', cat:'servizio',    da:4.6*SRV_GIORNO, fascia:'ore2', fattaDopo:1.4*SRV_ORA, op:'support1', durata:8,  voto:4,
      prob:'informazione', risolto:true,
      note:'Voleva sapere come si annulla una comanda già inviata. Spiegato.' },
    { id:'RC-219', localeId:'L1030', cat:'contabilita', da:5.1*SRV_GIORNO, fascia:'pomeriggio', fattaDopo:4.1*SRV_ORA, op:'support2', durata:21, voto:5,
      prob:'pagamenti', risolto:true,
      note:'Accredito settimanale non arrivato: IBAN aggiornato di recente e bonifico respinto. Rilanciato.',
      recensione:'Ho avuto la fattura corretta nel giro di mezz\'ora dalla chiamata.' },
    // Reclamo aperto: il problema tecnico è chiuso ma la lamentela sull'attesa
    // no, ed è quella che va ripresa in mano.
    { id:'RC-218', localeId:'L1034', cat:'blocco',      da:5.5*SRV_GIORNO, fascia:'min30', fattaDopo:1.8*SRV_ORA, op:'support3', durata:15, voto:1,
      prob:'reclamo', risolto:false, urg:'media',
      note:'Terza chiamata di questo locale in una settimana, due servite in ritardo. Chiede un referente fisso e un rimborso del canone del mese. Da portare al responsabile assistenza prima di rispondere.',
      recensione:'Un\'ora e tre quarti con il locale fermo è troppo. Il tecnico è stato bravo, l\'attesa no.' },
    { id:'RC-217', localeId:'L1016', cat:'configurazione', da:6*SRV_GIORNO, fascia:'pomeriggio', fattaDopo:2.9*SRV_ORA, op:'support1', durata:27, voto:5,
      prob:'configurazione', risolto:true,
      note:'Importato il menu dal file Excel del locale, 84 piatti con allergeni.' },
    { id:'RC-216', localeId:'L1022', cat:'commerciale', da:6.4*SRV_GIORNO, fascia:'mattina', fattaDopo:5.2*SRV_ORA, op:'support2', durata:17, voto:4,
      prob:'informazione', risolto:true,
      note:'Domande sul funzionamento degli extra oltre piano. Chiarite.' },
  ];

  // I locali scritti a mano qui sopra non sono per forza su un piano che ha
  // diritto alla chiamata — i piani li assegna il generatore di LOCALI, e non
  // possiamo saperlo scrivendo il dataset. Quindi ogni locale non idoneo viene
  // rimappato su uno che lo è, in modo stabile: stesso id di partenza → stesso
  // id di arrivo, così i clienti che chiamano più volte restano gli stessi e
  // lo storico «ha già chiamato N volte» continua a raccontare la sua storia.
  const ammessi = LOCALI.filter(l => srvHaChiamata(l.piano));
  // Non su TUTTI gli ammessi: dare una chiamata a testa a ognuno farebbe dire
  // al KPI «23 locali su 23 hanno chiamato», cioè che in una settimana ha
  // telefonato la totalità dei clienti dei piani alti. Se ne usa una parte, e
  // le chiamate si concentrano: è così che vanno le cose davvero, pochi locali
  // che chiamano più volte e la maggioranza che non chiama mai.
  const quanti = Math.max(1, Math.round(ammessi.length * 0.6));
  const rimappa = {};
  grezze.map(g => g.localeId)
    .filter((v, i, a) => a.indexOf(v) === i)
    .forEach((id, i) => {
      // Stesso id di partenza → stesso id di arrivo, sempre: i clienti che nel
      // dataset chiamano più volte restano gli stessi e lo storico «ha già
      // chiamato N volte» continua a raccontare la sua storia.
      const scelto = ammessi[i % quanti];
      rimappa[id] = scelto ? scelto.id : id;
    });

  return grezze.map(g => {
    const localeId = rimappa[g.localeId] || g.localeId;
    const locale = LOCALI.find(l => l.id === localeId);
    const prenotataIl = new Date(Date.now() - g.da);
    const entro = srvScadenza(prenotataIl, g.fascia);
    const richiamataIl = g.fattaDopo != null ? new Date(prenotataIl.getTime() + g.fattaDopo) : null;
    const stato = g.persa ? 'persa' : richiamataIl ? 'fatta' : 'attesa';
    return {
      id: g.id,
      localeId,
      localeNome: locale?.nome || '—',
      titolare: locale?.titolare || '—',
      piano: locale?.piano || 'free',
      tel: locale?.tel || '—',
      categoria: g.cat,
      // Entro quando ha chiesto di essere richiamato: è lui a sceglierlo.
      fascia: g.fascia || 'ore2',
      problema: g.problema || null,
      prenotataIl,
      entro,
      stato,
      richiamataIl,
      operatore: g.op || null,
      durataMin: g.durata || null,
      tentativi: g.tentativi || null,
      voto: g.voto || null,
      recensione: g.recensione || null,
      // ── L'esito registrato dall'operatore a chiamata finita ──
      risposto: stato === 'attesa' ? null : stato === 'fatta',
      problemaCat: g.prob || null,
      risolto: g.risolto == null ? null : g.risolto,
      urgenza: g.urg || null,
      noteOperatore: g.note || null,
      // Puntuale = chiamato entro la scadenza. Le non risposte non sono
      // puntuali né in ritardo: restano fuori dal rapporto.
      inTempo: richiamataIl ? richiamataIl <= entro : null,
    };
  }).sort((a, b) => b.prenotataIl - a.prenotataIl);
})();

// Minuti che mancano alla scadenza (negativi = sforata). Si ricalcola a ogni
// render: è un conto alla rovescia, non un dato salvato.
function srvMinutiAScadere(r) {
  return Math.round((r.entro.getTime() - Date.now()) / SRV_MIN);
}

// «Non risolto» è la coda di lavoro di byup, non l'elenco dei problemi aperti
// del mondo: ci finisce solo ciò su cui tocca a noi tornare, cioè le chiamate
// fatte in cui il problema è rimasto aperto.
//
// Restano fuori due casi, per ragioni opposte:
//   · le chiamate ancora in attesa — quelle non le abbiamo nemmeno fatte, e
//     hanno una coda loro («Da chiamare»);
//   · le chiamate a cui il ristoratore non ha risposto — lì l'impegno preso
//     l'abbiamo mantenuto, l'abbiamo chiamato entro l'SLA e gli è partita la
//     mail con il link per riprenotare. La palla è sua. Contarle come nostro
//     arretrato gonfierebbe la coda con righe su cui l'operatore non può
//     fare niente, e la prima cosa che si smette di guardare è una coda piena
//     di roba che non si può chiudere.
//
// Che i tentativi a vuoto siano comunque tracciati non si perde: il KPI
// «Numeri non raggiunti» li conta a parte, ed è lì che si vede se il problema
// diventa sistematico.
function srvNonRisolto(r) {
  return r.stato === 'fatta' && r.risolto === false;
}

// ─── 2. Ticket di assistenza ────────────────────────────────────────────────
//
// Ogni richiesta di assistenza — da qualunque canale arrivi — apre un ticket.
// Serve per due domande diverse: quanti ne arrivano (volume) e quanti si
// chiudono (efficacia). Il periodo coperto è 120 giorni, abbastanza per avere
// un mese pieno di confronto sotto quello corrente.
const TICKET_SRV = (() => {
  const rnd = pseudoRand(4211);
  const canali = ['richiamata', 'email', 'chat', 'gestionale'];
  const out = [];
  let n = 1;
  for (let g = 119; g >= 0; g--) {
    // Volume giornaliero: più basso nel weekend, il ristoratore chiama quando
    // ha il locale aperto ma il problema non è ancora sotto il servizio.
    const giornoSett = new Date(Date.now() - g * SRV_GIORNO).getDay();
    const weekend = giornoSett === 0 || giornoSett === 6;
    const base = weekend ? 4 : 11;
    const quanti = base + Math.floor(rnd() * (weekend ? 4 : 9));
    for (let i = 0; i < quanti; i++) {
      const apertoIl = new Date(Date.now() - g * SRV_GIORNO + (8 + rnd() * 12) * SRV_ORA);
      if (apertoIl.getTime() > Date.now()) continue;
      // Chiusura: la grande maggioranza si chiude, in tempi molto diversi.
      // Il 9% resta aperto — e più il ticket è recente, più è probabile che
      // sia ancora in lavorazione.
      const restaAperto = rnd() < (g < 2 ? 0.42 : g < 7 ? 0.14 : 0.03);
      const durataOre = 0.4 + rnd() * rnd() * 34;   // distribuzione a coda lunga
      const chiusoIl = restaAperto ? null : new Date(apertoIl.getTime() + durataOre * SRV_ORA);
      out.push({
        id: 'TK-' + String(4000 + n++),
        localeId: LOCALI[Math.floor(rnd() * LOCALI.length)].id,
        canale: canali[Math.floor(rnd() * canali.length)],
        apertoIl,
        chiusoIl: chiusoIl && chiusoIl.getTime() > Date.now() ? null : chiusoIl,
      });
    }
  }
  return out.sort((a, b) => b.apertoIl - a.apertoIl);
})();

// ─── 3. FAQ ─────────────────────────────────────────────────────────────────
//
// `live` è lo stato di pubblicazione: una FAQ in bozza esiste in console ma il
// ristoratore non la vede. Sono due cose diverse dal cancellarla, e la
// schermata le tiene separate — si mette offline una risposta sbagliata prima
// di riscriverla, non la si butta.
const FAQ_CATEGORIE = ['Primi passi', 'Menu e QR', 'Prenotazioni', 'Pagamenti', 'Contabilità', 'Account'];

const FAQ_SRV = [
  { id:'F-01', categoria:'Primi passi', live:true,
    domanda:'Quanto tempo serve per attivare byup nel mio locale?',
    risposta:'La configurazione guidata richiede circa 25 minuti: dati del locale, menu, tavoli e metodo di incasso. Puoi interromperla e riprenderla in qualsiasi momento — i passaggi completati restano salvati. Gli sticker QR arrivano per posta entro 3 giorni lavorativi dalla conclusione del setup.',
    aggiornataIl: new Date(Date.now() - 6*SRV_GIORNO), viste: 4820, utile: 391, nonUtile: 12 },
  { id:'F-02', categoria:'Menu e QR', live:true,
    domanda:'Ho cambiato la disposizione dei tavoli: devo rifare gli sticker QR?',
    risposta:'Sì, se cambiano i numeri di tavolo. Da Impostazioni → Sala e tavoli aggiorni la mappa e poi premi «Rigenera QR»: il PDF pronto per la stampa si scarica subito. Se vuoi gli sticker plastificati, dallo stesso pannello richiedi una nuova spedizione senza costi aggiuntivi una volta l\'anno.',
    aggiornataIl: new Date(Date.now() - 2*SRV_GIORNO), viste: 2140, utile: 205, nonUtile: 9 },
  { id:'F-03', categoria:'Prenotazioni', live:true,
    domanda:'Non ricevo più le notifiche delle nuove prenotazioni. Cosa controllo?',
    risposta:'Nell\'ordine: 1) che le notifiche di sistema siano abilitate per l\'app byup nelle impostazioni del telefono; 2) che in Impostazioni → Personale il tuo utente abbia la spunta «Avvisi prenotazioni»; 3) che il dispositivo non sia in risparmio energetico aggressivo, che sospende le notifiche in background. Se dopo questi passaggi il problema resta, prenota una richiamata.',
    aggiornataIl: new Date(Date.now() - 11*SRV_GIORNO), viste: 3305, utile: 288, nonUtile: 41 },
  { id:'F-04', categoria:'Pagamenti', live:true,
    domanda:'Quando ricevo l\'accredito degli incassi byup?',
    risposta:'Gli incassi digitali vengono accreditati sul tuo IBAN ogni martedì, con valuta il giorno stesso, e comprendono le transazioni fino alla domenica precedente. Il dettaglio è sempre in Contabilità → Cassa, con il riferimento del bonifico.',
    aggiornataIl: new Date(Date.now() - 19*SRV_GIORNO), viste: 5610, utile: 502, nonUtile: 18 },
  { id:'F-05', categoria:'Contabilità', live:true,
    domanda:'Come esporto i dati per il commercialista?',
    risposta:'Contabilità → Esporta ti dà tre formati: XML dei corrispettivi telematici, CSV dei movimenti e PDF riepilogativo per periodo. Puoi anche impostare un invio automatico mensile all\'indirizzo del tuo commercialista da Impostazioni → Dati fiscali.',
    aggiornataIl: new Date(Date.now() - 4*SRV_GIORNO), viste: 1890, utile: 176, nonUtile: 23 },
  { id:'F-06', categoria:'Account', live:true,
    domanda:'Posso dare accesso al gestionale a un mio dipendente?',
    risposta:'Sì, da Impostazioni → Personale. Ogni persona ha un ruolo — Cameriere, Cassa, Cucina, Responsabile — e vede solo le sezioni del suo ruolo. Il proprietario resta l\'unico a poter cambiare piano, dati fiscali e IBAN.',
    aggiornataIl: new Date(Date.now() - 27*SRV_GIORNO), viste: 2470, utile: 231, nonUtile: 7 },
  { id:'F-07', categoria:'Menu e QR', live:true,
    domanda:'Come segnalo gli allergeni sui piatti?',
    risposta:'In Impostazioni → Menu e cucina, aprendo un piatto trovi i 14 allergeni previsti dal Reg. UE 1169/2011. Quelli selezionati compaiono come icone nel menu digitale e nella comanda che arriva in cucina. È una dichiarazione di legge: la responsabilità del contenuto resta del locale.',
    aggiornataIl: new Date(Date.now() - 9*SRV_GIORNO), viste: 3960, utile: 344, nonUtile: 11 },
  // In bozza: la risposta c'è ma il prezzo del piano Business non è ancora
  // quello definitivo, quindi non va online.
  { id:'F-08', categoria:'Account', live:false,
    domanda:'Cosa succede ai miei dati se disdico l\'abbonamento?',
    risposta:'I dati restano consultabili in sola lettura per 90 giorni dalla disdetta, durante i quali puoi esportare tutto (menu, anagrafiche, contabilità, storico ordini). Trascorsi i 90 giorni vengono cancellati in modo irreversibile, con l\'eccezione dei documenti fiscali, che per legge conserviamo 10 anni.',
    aggiornataIl: new Date(Date.now() - 1*SRV_GIORNO), viste: 0, utile: 0, nonUtile: 0 },
];

// ─── 4. Guide ───────────────────────────────────────────────────────────────
//
// Due livelli: l'argomento raccoglie più guide, la guida è l'articolo.
// Il video è opzionale; quando c'è, la sua durata sta accanto al tempo di
// lettura — il ristoratore decide se ha dieci minuti per leggere o tre per
// guardare, e la scheda deve dirglielo prima che apra.
const GUIDE_ARGOMENTI = [
  { id:'A-avvio',    nome:'Avvio e configurazione', descrizione:'Dal primo accesso al primo ordine incassato.', icona:'store' },
  { id:'A-sala',     nome:'Sala e servizio',        descrizione:'Tavoli, comande, cucina e il lavoro del cameriere.', icona:'utensils' },
  { id:'A-menu',     nome:'Menu digitale',          descrizione:'Piatti, categorie, allergeni e QR.', icona:'list' },
  { id:'A-conti',    nome:'Incassi e contabilità',  descrizione:'Cassa, corrispettivi, IVA ed esportazioni.', icona:'receipt' },
];

const GUIDE_SRV = [
  { id:'G-01', argomentoId:'A-avvio', live:true,
    titolo:'Configurare il locale in 25 minuti',
    descrizione:'La configurazione guidata passo per passo: dati del locale, orari, sala, menu e metodo di incasso. Alla fine hai un menu pubblicabile e i QR pronti da stampare.',
    minLettura: 7, aggiornataIl: new Date(Date.now() - 5*SRV_GIORNO), letture: 3120,
    video: { titolo:'Setup guidato — registrazione completa', durataSec: 512, views: 1840, tempoMedioSec: 361, utile: 212, nonUtile: 18,
      descrizioneSotto:'Nel video usiamo un locale di prova. Se la tua sala ha più di 30 tavoli, salta al minuto 4:20: la mappa si costruisce per zone e non tavolo per tavolo.' } },
  { id:'G-02', argomentoId:'A-avvio', live:true,
    titolo:'Attivare i pagamenti e collegare l\'IBAN',
    descrizione:'Verifica dell\'identità, collegamento del conto e prima transazione di prova. Cosa serve avere sottomano prima di iniziare.',
    minLettura: 4, aggiornataIl: new Date(Date.now() - 14*SRV_GIORNO), letture: 2280,
    video: { titolo:'Verifica identità e IBAN', durataSec: 194, views: 1210, tempoMedioSec: 171, utile: 158, nonUtile: 6,
      descrizioneSotto:'La verifica dell\'identità è richiesta dalla normativa antiriciclaggio: la fa il nostro istituto di pagamento, non byup, e i documenti non transitano dal gestionale.' } },
  { id:'G-03', argomentoId:'A-sala', live:true,
    titolo:'La sala dal punto di vista del cameriere',
    descrizione:'Come si apre un tavolo, si prende una comanda, si invia in cucina e si chiude il conto. La guida che diamo al personale nuovo.',
    minLettura: 9, aggiornataIl: new Date(Date.now() - 3*SRV_GIORNO), letture: 4410,
    video: { titolo:'Un servizio completo, dall\'apertura al conto', durataSec: 736, views: 2640, tempoMedioSec: 302, utile: 289, nonUtile: 47,
      descrizioneSotto:'Il video è girato su tablet da 10". Sui telefoni la barra delle azioni sta in basso invece che a destra, ma i passaggi sono identici.' } },
  { id:'G-04', argomentoId:'A-sala', live:true,
    titolo:'Quando la cucina non riceve le comande',
    descrizione:'I quattro punti in cui una comanda può fermarsi — dispositivo, rete, stampante, regole di instradamento — e come isolarli in ordine.',
    minLettura: 6, aggiornataIl: new Date(Date.now() - 8*SRV_GIORNO), letture: 1670,
    video: null },
  { id:'G-05', argomentoId:'A-menu', live:true,
    titolo:'Costruire il menu digitale',
    descrizione:'Categorie, piatti, varianti, foto e disponibilità in tempo reale. Come si struttura un menu che il cliente scorre senza perdersi.',
    minLettura: 8, aggiornataIl: new Date(Date.now() - 21*SRV_GIORNO), letture: 3890,
    video: { titolo:'Dal foglio Excel al menu pubblicato', durataSec: 428, views: 2050, tempoMedioSec: 249, utile: 196, nonUtile: 22,
      descrizioneSotto:'Se hai già il menu in un file, scrivi all\'assistenza: lo importiamo noi la prima volta, così parti da una bozza completa invece che da zero.' } },
  { id:'G-06', argomentoId:'A-menu', live:true,
    titolo:'Allergeni: cosa dichiarare e come',
    descrizione:'I 14 allergeni del Reg. UE 1169/2011, dove compaiono per il cliente e di chi è la responsabilità della dichiarazione.',
    minLettura: 5, aggiornataIl: new Date(Date.now() - 30*SRV_GIORNO), letture: 2760,
    video: null },
  { id:'G-07', argomentoId:'A-conti', live:true,
    titolo:'Chiusura di cassa e corrispettivi telematici',
    descrizione:'Cosa fa byup in automatico a fine giornata, cosa devi controllare tu e come si corregge una chiusura sbagliata.',
    minLettura: 11, aggiornataIl: new Date(Date.now() - 7*SRV_GIORNO), letture: 2010,
    video: { titolo:'La chiusura serale, dal primo all\'ultimo passaggio', durataSec: 604, views: 1480, tempoMedioSec: 511, utile: 174, nonUtile: 9,
      descrizioneSotto:'La procedura mostrata vale per i registratori telematici certificati. Con la cassa virtuale byup i passaggi 3 e 4 non servono: l\'invio all\'Agenzia parte da solo alle 23:30.' } },
  // In bozza: la guida è scritta ma il video va rigirato dopo il redesign
  // dell'esportazione IVA, quindi l'argomento non è ancora completo.
  { id:'G-08', argomentoId:'A-conti', live:false,
    titolo:'Esportare l\'IVA trimestrale per il commercialista',
    descrizione:'I tre formati di esportazione, quale chiede di solito il commercialista e come impostare l\'invio automatico.',
    minLettura: 6, aggiornataIl: new Date(Date.now() - 1*SRV_GIORNO), letture: 0,
    video: null },
];

// ─── KPI derivati ───────────────────────────────────────────────────────────
//
// Una sola funzione, usata sia dalla sezione Chiamata assistenza sia dal tab
// «Servizio Clienti» della Dashboard: due schermate che mostrassero numeri
// diversi per la stessa cosa sarebbero peggio di una schermata sola.
function srvKpi(richiamate = RICHIAMATE, ticket = TICKET_SRV, guide = GUIDE_SRV) {
  const ora = Date.now();

  // ── Richiamate ──
  const chiuse    = richiamate.filter(r => r.stato === 'fatta');
  const perse     = richiamate.filter(r => r.stato === 'persa');
  const inTempo   = chiuse.filter(r => r.inTempo);
  const inRitardo = chiuse.filter(r => !r.inTempo);
  const attesa    = richiamate.filter(r => r.stato === 'attesa');
  const scadute   = attesa.filter(r => r.entro.getTime() < ora);
  const attesaMediaMin = chiuse.length === 0 ? 0
    : Math.round(chiuse.reduce((s, r) => s + (r.richiamataIl - r.prenotataIl), 0) / chiuse.length / SRV_MIN);

  // ── Soddisfazione ──
  const votati = richiamate.filter(r => r.voto != null);
  const media  = votati.length === 0 ? 0
    : votati.reduce((s, r) => s + r.voto, 0) / votati.length;
  const distribuzione = [1, 2, 3, 4, 5].map(v => ({ voto: v, n: votati.filter(r => r.voto === v).length }));
  const recensioni = richiamate.filter(r => r.recensione).sort((a, b) => b.richiamataIl - a.richiamataIl);

  // ── Ticket per finestra ──
  // Una finestra si descrive con due numeri soli: quanti ne sono arrivati e
  // quanti di quelli sono già chiusi. Il tasso di chiusura della finestra
  // «oggi» è per costruzione basso e non va letto come un peggioramento.
  const finestra = (giorni, label) => {
    const da = ora - giorni * SRV_GIORNO;
    const avviati = ticket.filter(t => t.apertoIl.getTime() >= da);
    const chiusi  = avviati.filter(t => t.chiusoIl);
    return {
      label, giorni,
      avviati: avviati.length,
      chiusi: chiusi.length,
      pct: avviati.length ? Math.round(chiusi.length / avviati.length * 100) : 0,
    };
  };
  const finestre = [finestra(1, 'Oggi'), finestra(7, 'Settimana'), finestra(30, 'Mese')];

  // Tempo medio di chiusura: sui ticket CHIUSI negli ultimi 30 giorni, non su
  // quelli aperti in quella finestra. Altrimenti un ticket aperto il 29 e
  // chiuso oggi conterebbe, e uno aperto il 40 e chiuso ieri no — il numero
  // misurerebbe la finestra, non il lavoro.
  const chiusiUlt30 = ticket.filter(t => t.chiusoIl && t.chiusoIl.getTime() >= ora - 30 * SRV_GIORNO);
  const chiusuraMediaOre = chiusiUlt30.length === 0 ? 0
    : chiusiUlt30.reduce((s, t) => s + (t.chiusoIl - t.apertoIl), 0) / chiusiUlt30.length / SRV_ORA;
  // Mese precedente, per la variazione.
  const chiusiPrec30 = ticket.filter(t => t.chiusoIl
    && t.chiusoIl.getTime() < ora - 30 * SRV_GIORNO
    && t.chiusoIl.getTime() >= ora - 60 * SRV_GIORNO);
  const chiusuraPrecOre = chiusiPrec30.length === 0 ? 0
    : chiusiPrec30.reduce((s, t) => s + (t.chiusoIl - t.apertoIl), 0) / chiusiPrec30.length / SRV_ORA;

  const apertiOra = ticket.filter(t => !t.chiusoIl).length;

  // Serie giornaliera degli ultimi 14 giorni, per lo sparkline dei volumi.
  const serieTicket = Array.from({ length: 14 }, (_, i) => {
    const g = 13 - i;
    const da = ora - (g + 1) * SRV_GIORNO, a = ora - g * SRV_GIORNO;
    return ticket.filter(t => t.apertoIl.getTime() >= da && t.apertoIl.getTime() < a).length;
  });

  // ── Pressione per locale ──
  //
  // Due medie che rispondono alla stessa domanda da due lati: quanto pesa
  // l'assistenza sul singolo cliente. La base è chi ha davvero aperto qualcosa,
  // NON tutti i locali della piattaforma: dividere per 50 darebbe «0,5 chiamate
  // a locale», un numero vero e inutile, perché nasconde che i locali che
  // chiamano lo fanno più di una volta. Quanti siano quei locali sta accanto
  // alla media, così la base resta leggibile.
  const perLocaleChiamate = {};
  richiamate.forEach(r => { perLocaleChiamate[r.localeId] = (perLocaleChiamate[r.localeId] || 0) + 1; });
  const localiCheChiamano = Object.keys(perLocaleChiamate).length;
  const topChiamate = Object.entries(perLocaleChiamate)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([localeId, n]) => ({
      localeId, n,
      nome: (richiamate.find(r => r.localeId === localeId) || {}).localeNome || localeId,
    }));

  const apertiPerLocale = {};
  ticket.filter(t => !t.chiusoIl).forEach(t => {
    apertiPerLocale[t.localeId] = (apertiPerLocale[t.localeId] || 0) + 1;
  });
  const localiConAperti = Object.keys(apertiPerLocale).length;
  const maxAperti = Object.values(apertiPerLocale).reduce((m, n) => Math.max(m, n), 0);

  const perLocale = {
    chiamateMedie: localiCheChiamano ? richiamate.length / localiCheChiamano : 0,
    localiCheChiamano,
    // Il denominatore delle chiamate NON è la piattaforma intera ma i soli
    // locali che hanno diritto alla chiamata: mettere a confronto chi chiama
    // con tutti e 50 farebbe sembrare bassissimo un tasso che si misura solo
    // sui Plus e Business. I ticket invece li può aprire chiunque, e lì il
    // paragone con tutta la base è quello giusto.
    localiAmmessi: LOCALI.filter(l => srvHaChiamata(l.piano)).length,
    localiTotali: LOCALI.length,
    topChiamate,
    apertiMedi: localiConAperti ? apertiOra / localiConAperti : 0,
    localiConAperti,
    maxAperti,
  };

  // ── Video ──
  const video = guide.filter(g => g.video).map(g => {
    const v = g.video;
    const voti = v.utile + v.nonUtile;
    return {
      guidaId: g.id,
      guidaTitolo: g.titolo,
      argomentoId: g.argomentoId,
      titolo: v.titolo,
      durataSec: v.durataSec,
      tempoMedioSec: v.tempoMedioSec,
      // Quanto del video viene effettivamente guardato. È il numero che dice
      // se un video è troppo lungo, molto più della somma delle view.
      completamento: Math.round(v.tempoMedioSec / v.durataSec * 100),
      views: v.views,
      utile: v.utile,
      nonUtile: v.nonUtile,
      voti,
      pctUtile: voti ? Math.round(v.utile / voti * 100) : null,
    };
  }).sort((a, b) => b.views - a.views);

  const videoTot = video.reduce((acc, v) => ({
    views: acc.views + v.views,
    utile: acc.utile + v.utile,
    nonUtile: acc.nonUtile + v.nonUtile,
    pesoTempo: acc.pesoTempo + v.tempoMedioSec * v.views,
    pesoDurata: acc.pesoDurata + v.durataSec * v.views,
  }), { views: 0, utile: 0, nonUtile: 0, pesoTempo: 0, pesoDurata: 0 });
  const videoMedia = {
    views: videoTot.views,
    utile: videoTot.utile,
    nonUtile: videoTot.nonUtile,
    pctUtile: (videoTot.utile + videoTot.nonUtile)
      ? Math.round(videoTot.utile / (videoTot.utile + videoTot.nonUtile) * 100) : null,
    // Media pesata sulle view: un video visto 50 volte non deve spostare la
    // media quanto uno visto 2.600.
    tempoMedioSec: videoTot.views ? Math.round(videoTot.pesoTempo / videoTot.views) : 0,
    completamento: videoTot.pesoDurata ? Math.round(videoTot.pesoTempo / videoTot.pesoDurata * 100) : 0,
  };

  return {
    richiamate: {
      totali: richiamate.length,
      chiuse: chiuse.length,
      inTempo: inTempo.length,
      inRitardo: inRitardo.length,
      perse: perse.length,
      pctInTempo: chiuse.length ? Math.round(inTempo.length / chiuse.length * 100) : 0,
      attesa: attesa.length,
      scadute: scadute.length,
      attesaMediaMin,
    },
    soddisfazione: { media, n: votati.length, distribuzione, recensioni },
    ticket: { finestre, chiusuraMediaOre, chiusuraPrecOre, apertiOra, serie: serieTicket },
    perLocale,
    video, videoMedia,
  };
}

// ─── Formattatori ───────────────────────────────────────────────────────────
function srvDurata(sec) {
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
// Minuti → «2h 10m». Con il segno, per i conti alla rovescia.
function srvMinuti(min) {
  const seg = min < 0 ? '−' : '';
  const a = Math.abs(min);
  if (a < 60) return `${seg}${a}m`;
  const h = Math.floor(a / 60), m = a % 60;
  return m === 0 ? `${seg}${h}h` : `${seg}${h}h ${m}m`;
}
function srvOre(ore) {
  const dec = (n) => n.toFixed(1).replace('.0', '').replace('.', ',');
  if (ore < 1) return `${Math.round(ore * 60)} min`;
  if (ore < 24) return `${dec(ore)} h`;
  return `${dec(ore / 24)} g`;
}

Object.assign(window, {
  SRV_CATEGORIE, SRV_PROBLEMI, SRV_URGENZE, SRV_MAIL_NON_RISPOSTA,
  SRV_FASCE, SRV_PIANI_CON_CHIAMATA, srvHaChiamata, srvScadenza,
  RICHIAMATE, TICKET_SRV,
  FAQ_SRV, FAQ_CATEGORIE, GUIDE_ARGOMENTI, GUIDE_SRV,
  srvKpi, srvMinutiAScadere, srvNonRisolto, srvDurata, srvMinuti, srvOre,
});
