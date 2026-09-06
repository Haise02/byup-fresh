// Hubble — Chiamata assistenza · dati
//
// Sei corpi di dati che vivono nella stessa sezione perché rispondono alla
// stessa domanda — «come stiamo andando con chi ci usa?» — da lati diversi:
//
//   1. RICHIAMATE   le prenotazioni di richiamata prese dai ristoratori (la coda)
//   2. TICKET_SRV   le richieste di assistenza aperte, per i volumi e i tempi
//   3. FAQ_SRV      la base di conoscenza pubblicata nel gestionale
//   4. GUIDE_SRV    le guide, raggruppate per argomento, con il video allegato
//   5. VALUTAZIONE_APP    il voto del cliente finale, dentro l'app
//   6. VALUTAZIONE_STAFF  il voto del cameriere su Byup Staff, il POS di sala
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
// Le fasce sono quelle di D-59 (P-66), le stesse di supporto-modals nel
// gestionale: la richiamata garantita entro due ore è del Plus, entro un'ora
// del Business (H24), e le finestre stanno DENTRO l'orario presidiato, 12-16 e
// 18-22 dal lunedì al venerdì. Prima c'erano «entro 30 minuti», che non era
// la garanzia di nessun piano, e due finestre (9-12, 14-18) fuori orario.
const SRV_FASCE = {
  ore2:  { label: 'Entro 2 ore',        breve: '2 ore',  tipo:'durata',   minuti: 120, nota: 'garanzia Plus' },
  ora1:  { label: 'Entro 1 ora',        breve: '1 ora',  tipo:'durata',   minuti: 60,  nota: 'garanzia Business, H24' },
  f1216: { label: 'Fascia 12:00–16:00', breve: '12–16',  tipo:'finestra', da: 12, a: 16 },
  f1822: { label: 'Fascia 18:00–22:00', breve: '18–22',  tipo:'finestra', da: 18, a: 22 },
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
    { id:'RC-241', localeId:'L1005', cat:'blocco',      da:12*SRV_MIN, fascia:'ora1',
      problema:'I QR non aprono più il menu: i clienti vedono «pagina non trovata». Sala piena.' },
    { id:'RC-240', localeId:'L1029', cat:'contabilita', da:55*SRV_MIN, fascia:'ore2',
      problema:'Export contabilità di maggio in errore 502. Deve consegnare al commercialista entro venerdì.' },
    { id:'RC-239', localeId:'L1012', cat:'servizio',    da:1.6*SRV_ORA, fascia:'ore2',
      problema:'Le notifiche di nuova prenotazione non arrivano più sul telefono dopo l\'aggiornamento.' },
    { id:'RC-238', localeId:'L1041', cat:'configurazione', da:2.4*SRV_ORA, fascia:'f1822',
      problema:'Ha rifatto la disposizione dei tavoli e non riesce a rigenerare gli sticker QR.' },
    { id:'RC-237', localeId:'L1020', cat:'commerciale', da:3.2*SRV_ORA, fascia:'f1216',
      problema:'Vuole capire cosa cambia passando da Starter a Plus prima di decidere.' },
    // Scaduta: l'SLA era un'ora, sono passate quasi tre. È il caso che la
    // schermata deve saper mostrare, non nascondere.
    { id:'RC-236', localeId:'L1034', cat:'blocco',      da:2.8*SRV_ORA, fascia:'ora1',
      problema:'Cassa bloccata sulla schermata di apertura turno, non riesce a battere gli scontrini.' },
    { id:'RC-235', localeId:'L1014', cat:'servizio',    da:5*SRV_ORA, fascia:'ore2',
      problema:'La stampante di cucina salta le comande dei dolci.' },

    // ── Chiamate fatte in giornata ─────────────────────────────────────────
    // `prob` è la classificazione dell'operatore a chiamata finita; `risolto`
    // dice se il problema è chiuso. Se resta aperto servono `urg` e `note`:
    // sono le tre cose che chi la riprende in mano deve trovare scritte.
    { id:'RC-234', localeId:'L1006', cat:'blocco',      da:7*SRV_ORA, fascia:'ora1',   fattaDopo:24*SRV_MIN,  op:'support1', durata:11, voto:5,
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
    { id:'RC-231', localeId:'L1027', cat:'contabilita', da:11*SRV_ORA, fascia:'f1822',  fattaDopo:2.2*SRV_ORA, op:'support3', durata:26, voto:5,
      prob:'contabile', risolto:true,
      note:'Aliquota ridotta non applicata sull\'asporto. Corretta l\'impostazione fiscale del menu e rigenerato il corrispettivo.',
      recensione:'Mi hanno seguito passo passo sull\'IVA di giugno. Competenti.' },
    { id:'RC-230', localeId:'L1009', cat:'commerciale', da:1*SRV_GIORNO, fascia:'f1216', fattaDopo:4.5*SRV_ORA, op:'support2', durata:22, voto:4,
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
    { id:'RC-227', localeId:'L1015', cat:'configurazione', da:2*SRV_GIORNO, fascia:'f1822', fattaDopo:5.4*SRV_ORA, op:'support2', durata:31, voto:4,
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
    { id:'RC-223', localeId:'L1011', cat:'commerciale', da:3.4*SRV_GIORNO, fascia:'f1216', fattaDopo:3.9*SRV_ORA, op:'support1', durata:24, voto:4,
      prob:'commerciale', risolto:true,
      note:'Chiarita la differenza fra ordini inclusi ed extra. Resta su Starter, consapevole.' },
    // Non ha risposto: parte la mail automatica. Non è «in tempo» né «in
    // ritardo» — resta fuori dal rapporto sulla puntualità, ma dentro il
    // Non risolto, perché il problema del ristoratore è ancora lì.
    // Niente `note` sulle non risposte: la UI non le chiede più, e un dato di
    // esempio che l'interfaccia non sa produrre è una finzione che poi qualcuno
    // prende per specifica.
    { id:'RC-222', localeId:'L1008', cat:'configurazione', da:3.8*SRV_GIORNO, fascia:'ora1', persa:true, tentativi:3, op:'support2' },
    { id:'RC-221', localeId:'L1025', cat:'blocco',      da:4.2*SRV_GIORNO, fascia:'ore2', fattaDopo:52*SRV_MIN, op:'support3', durata:13, voto:5,
      prob:'tecnico', risolto:true,
      note:'QR che rimandavano a un menu archiviato. Ripubblicato quello corrente.' },
    { id:'RC-220', localeId:'L1019', cat:'servizio',    da:4.6*SRV_GIORNO, fascia:'ore2', fattaDopo:1.4*SRV_ORA, op:'support1', durata:8,  voto:4,
      prob:'informazione', risolto:true,
      note:'Voleva sapere come si annulla una comanda già inviata. Spiegato.' },
    { id:'RC-219', localeId:'L1030', cat:'contabilita', da:5.1*SRV_GIORNO, fascia:'f1822', fattaDopo:4.1*SRV_ORA, op:'support2', durata:21, voto:5,
      prob:'pagamenti', risolto:true,
      note:'Accredito settimanale non arrivato: IBAN aggiornato di recente e bonifico respinto. Rilanciato.',
      recensione:'Ho avuto la fattura corretta nel giro di mezz\'ora dalla chiamata.' },
    // Reclamo aperto: il problema tecnico è chiuso ma la lamentela sull'attesa
    // no, ed è quella che va ripresa in mano.
    { id:'RC-218', localeId:'L1034', cat:'blocco',      da:5.5*SRV_GIORNO, fascia:'ora1', fattaDopo:1.8*SRV_ORA, op:'support3', durata:15, voto:1,
      prob:'reclamo', risolto:false, urg:'media',
      note:'Terza chiamata di questo locale in una settimana, due servite in ritardo. Chiede un referente fisso e un rimborso del canone del mese. Da portare al responsabile assistenza prima di rispondere.',
      recensione:'Un\'ora e tre quarti con il locale fermo è troppo. Il tecnico è stato bravo, l\'attesa no.' },
    { id:'RC-217', localeId:'L1016', cat:'configurazione', da:6*SRV_GIORNO, fascia:'f1822', fattaDopo:2.9*SRV_ORA, op:'support1', durata:27, voto:5,
      prob:'configurazione', risolto:true,
      note:'Importato il menu dal file Excel del locale, 84 piatti con allergeni.' },
    { id:'RC-216', localeId:'L1022', cat:'commerciale', da:6.4*SRV_GIORNO, fascia:'f1216', fattaDopo:5.2*SRV_ORA, op:'support2', durata:17, voto:4,
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

// ─── Perché ci hanno scritto ────────────────────────────────────────────────
//
// Ogni ticket porta la causa, e non è una tassonomia per fare ordine
// nell'archivio: è la domanda «questo carico ce lo siamo dati da soli?». Un
// motivo che vale un ticket su cinque non è assistenza da smaltire meglio, è
// un difetto di prodotto che si sistema una volta e non torna più.
//
// I pesi sommano a 1 e sono deliberatamente sbilanciati sul primo: nei
// prodotti veri è quasi sempre così, e una distribuzione piatta nasconderebbe
// esattamente la cosa che questa colonna serve a far vedere.
const SRV_CAUSE = [
  { id:'qr_menu',      label:'QR e menu non aggiornati',           peso:0.22, prodotto:true },
  { id:'comande',      label:'Comande che non arrivano in cucina', peso:0.14, prodotto:true },
  { id:'incassi',      label:'Incassi e accrediti',                peso:0.13 },
  { id:'accessi',      label:'Accessi e password dello staff',     peso:0.11, prodotto:true },
  { id:'fiscale',      label:'Corrispettivi e chiusure fiscali',   peso:0.10 },
  { id:'dispositivi',  label:'Dispositivi e rete in sala',         peso:0.09 },
  { id:'prenotazioni', label:'Prenotazioni e notifiche',           peso:0.08 },
  { id:'comefa',       label:'Come si fa (nessun guasto)',         peso:0.08 },
  { id:'canone',       label:'Piano, canone e fatture',            peso:0.05 },
];

function srvCausa(rnd) {
  const x = rnd();
  let acc = 0;
  for (const c of SRV_CAUSE) { acc += c.peso; if (x < acc) return c.id; }
  return SRV_CAUSE[SRV_CAUSE.length - 1].id;
}

// Il voto che il ristoratore lascia alla chiusura del ticket. Circa un terzo
// risponde — chi è arrabbiato e chi è contento rispondono più degli altri, e
// il risultato è la solita distribuzione a J.
//
// Il voto pende col piano, e non per compiacenza verso chi paga: i piani alti
// hanno la chiamata con richiamata entro due ore (Plus) e un'ora (Business),
// i bassi solo la posta. È
// esattamente la differenza che stiamo vendendo, e se nei dati non si vedesse
// vorrebbe dire che non la stiamo mantenendo.
function srvVotoTicket(piano, rnd) {
  if (rnd() > 0.34) return null;              // non tutti rispondono al sondaggio
  const soglie = {
    business: [0.02, 0.05, 0.13, 0.40],       // → 1, 2, 3, 4, resto 5
    plus:     [0.03, 0.07, 0.18, 0.47],
    starter:  [0.07, 0.15, 0.34, 0.68],
    free:     [0.12, 0.25, 0.48, 0.79],
  }[piano] || [0.08, 0.18, 0.38, 0.70];
  const x = rnd();
  for (let i = 0; i < soglie.length; i++) if (x < soglie[i]) return i + 1;
  return 5;
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
  // Chi apre i ticket non è estratto a caso fra i locali: chi usa di più il
  // prodotto ne apre di più, e sorteggiare a caso avrebbe dato alla trattoria
  // da duecento ordini gli stessi ticket del pub da ottomila — cioè avrebbe
  // messo nei dati proprio la distorsione che il conto «ogni mille ordini»
  // serve a smontare. Il peso è il volume del mese; il +60 tiene in gioco chi
  // ordina poco, e un locale ogni sette ne apre il triplo a parità di volume:
  // sono quelli che il conto normalizzato deve far saltare fuori.
  const pesi = LOCALI.map((l, i) => ((l.ordiniMese || 0) + 60) * (i % 7 === 3 ? 3 : 1));
  const pesoTot = pesi.reduce((s, p) => s + p, 0);
  const sorteggiaLocale = () => {
    let x = rnd() * pesoTot;
    for (let i = 0; i < LOCALI.length; i++) { x -= pesi[i]; if (x <= 0) return LOCALI[i]; }
    return LOCALI[LOCALI.length - 1];
  };
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
      const locale = sorteggiaLocale();
      const chiuso = chiusoIl && chiusoIl.getTime() <= Date.now() ? chiusoIl : null;
      const causa = srvCausa(rnd);
      // Riaperture: un ticket su sei circa torna indietro, e torna presto —
      // fra il giorno dopo e i quattro giorni. È la differenza fra aver
      // risolto e aver premuto «chiudi»: senza questa colonna il 93% di
      // chiusure racconta la nostra velocità, non l'esito.
      //
      // I motivi di prodotto rientrano di più: se il difetto è nel prodotto,
      // chiudere il ticket non lo toglie di mezzo e il locale ci riscrive.
      const diProdotto = (SRV_CAUSE.find(c => c.id === causa) || {}).prodotto;
      const riaperto = chiuso && rnd() < (diProdotto ? 0.23 : 0.11);
      const riapertoIl = riaperto
        ? new Date(chiuso.getTime() + (18 + rnd() * 78) * SRV_ORA) : null;
      out.push({
        id: 'TK-' + String(4000 + n++),
        localeId: locale.id,
        piano: locale.piano,
        canale: canali[Math.floor(rnd() * canali.length)],
        causa,
        apertoIl,
        chiusoIl: chiuso,
        riapertoIl: riapertoIl && riapertoIl.getTime() <= Date.now() ? riapertoIl : null,
        // Alla chiusura parte il sondaggio, e risponde circa un terzo. È da
        // qui che viene il voto dei piani bassi: Gratuito e Starter non hanno
        // la chiamata, e senza i ticket la loro soddisfazione non la
        // misureremmo affatto.
        voto: chiuso ? srvVotoTicket(locale.piano, rnd) : null,
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
    // Corretta con P-73 e P-117: i ruoli sono quelli di Personale (Cassa,
    // Cameriere, più i personalizzati), il titolare è uno solo, e non esiste
    // un «cambio del titolare» (D-104): i recapiti si cambiano dal profilo e
    // si registrano, il soggetto fiscale da Dati fiscali con la riaccettazione
    // dei termini.
    risposta:'Sì, da Impostazioni → Personale. Ogni persona ha un ruolo — Cassa, Cameriere, o uno personalizzato — e vede solo le sezioni del suo ruolo. Il titolare è uno solo: resta l\'unico a poter cambiare piano, dati fiscali e IBAN. I suoi recapiti e il suo nome li cambia lui dal profilo in Account, e ogni modifica resta nel registro delle attività; se cambia il soggetto fiscale del locale, si fa da Impostazioni → Dati fiscali e si riaccettano i termini a nome del nuovo soggetto.',
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
    video: { titolo:'Setup guidato — registrazione completa', durataSec: 512, views: 1840, tempoMedioSec: 361, utile: 212, nonUtile: 18 } },
  { id:'G-02', argomentoId:'A-avvio', live:true,
    titolo:'Attivare i pagamenti e collegare l\'IBAN',
    descrizione:'Verifica dell\'identità, collegamento del conto e prima transazione di prova. Cosa serve avere sottomano prima di iniziare.',
    minLettura: 4, aggiornataIl: new Date(Date.now() - 14*SRV_GIORNO), letture: 2280,
    video: { titolo:'Verifica identità e IBAN', durataSec: 194, views: 1210, tempoMedioSec: 171, utile: 158, nonUtile: 6 } },
  { id:'G-03', argomentoId:'A-sala', live:true,
    titolo:'La sala dal punto di vista del cameriere',
    descrizione:'Come si apre un tavolo, si prende una comanda, si invia in cucina e si chiude il conto. La guida che diamo al personale nuovo.',
    minLettura: 9, aggiornataIl: new Date(Date.now() - 3*SRV_GIORNO), letture: 4410,
    video: { titolo:'Un servizio completo, dall\'apertura al conto', durataSec: 736, views: 2640, tempoMedioSec: 302, utile: 289, nonUtile: 47 } },
  { id:'G-04', argomentoId:'A-sala', live:true,
    titolo:'Quando la cucina non riceve le comande',
    descrizione:'I quattro punti in cui una comanda può fermarsi — dispositivo, rete, stampante, regole di instradamento — e come isolarli in ordine.',
    minLettura: 6, aggiornataIl: new Date(Date.now() - 8*SRV_GIORNO), letture: 1670,
    video: null },
  { id:'G-05', argomentoId:'A-menu', live:true,
    titolo:'Costruire il menu digitale',
    descrizione:'Categorie, piatti, varianti, foto e disponibilità in tempo reale. Come si struttura un menu che il cliente scorre senza perdersi.',
    minLettura: 8, aggiornataIl: new Date(Date.now() - 21*SRV_GIORNO), letture: 3890,
    video: { titolo:'Dal foglio Excel al menu pubblicato', durataSec: 428, views: 2050, tempoMedioSec: 249, utile: 196, nonUtile: 22 } },
  { id:'G-06', argomentoId:'A-menu', live:true,
    titolo:'Allergeni: cosa dichiarare e come',
    descrizione:'I 14 allergeni del Reg. UE 1169/2011, dove compaiono per il cliente e di chi è la responsabilità della dichiarazione.',
    minLettura: 5, aggiornataIl: new Date(Date.now() - 30*SRV_GIORNO), letture: 2760,
    video: null },
  { id:'G-07', argomentoId:'A-conti', live:true,
    titolo:'Chiusura di cassa e corrispettivi telematici',
    descrizione:'Cosa fa byup in automatico a fine giornata, cosa devi controllare tu e come si corregge una chiusura sbagliata.',
    minLettura: 11, aggiornataIl: new Date(Date.now() - 7*SRV_GIORNO), letture: 2010,
    video: { titolo:'La chiusura serale, dal primo all\'ultimo passaggio', durataSec: 604, views: 1480, tempoMedioSec: 511, utile: 174, nonUtile: 9 } },
  // In bozza: la guida è scritta ma il video va rigirato dopo il redesign
  // dell'esportazione IVA, quindi l'argomento non è ancora completo.
  { id:'G-08', argomentoId:'A-conti', live:false,
    titolo:'Esportare l\'IVA trimestrale per il commercialista',
    descrizione:'I tre formati di esportazione, quale chiede di solito il commercialista e come impostare l\'invio automatico.',
    minLettura: 6, aggiornataIl: new Date(Date.now() - 1*SRV_GIORNO), letture: 0,
    video: null },
];

// ─── 5. Valutazione della Byup App ──────────────────────────────────────────
//
// L'altro voto da 1 a 5 che riceviamo, e non ha niente a che vedere con
// l'assistenza: lo lascia il cliente finale dentro l'app, non il ristoratore
// dopo una chiamata. Sta in questo file perché la Dashboard li mette a
// confronto nella stessa sezione — sono i due modi in cui qualcuno ci dice
// come stiamo andando — ma vanno tenuti distinti in ogni conto: mescolarli
// darebbe una media che non descrive nessuno dei due.
//
// La distribuzione è a J, come tutte le valutazioni volontarie: tanti 5,
// pochi 4, e una coda bassa di 1 che pesa più di quanto dica il numero.
const VALUTAZIONE_APP = {
  distribuzione: [
    { voto: 1, n: 47 },
    { voto: 2, n: 63 },
    { voto: 3, n: 186 },
    { voto: 4, n: 742 },
    { voto: 5, n: 1594 },
  ],
  recensioni: [
    { id:'VA-09', chi:'Martina C.', dove:'Roma',    voto:5, da:4*SRV_ORA,
      testo:'Ordinato e pagato dal tavolo senza aspettare nessuno. Il conto diviso in quattro ha funzionato al primo colpo.' },
    { id:'VA-08', chi:'Alessio D.', dove:'Milano',  voto:4, da:9*SRV_ORA,
      testo:'Comoda per ordinare, ma la ricerca dei locali mi mostra ancora posti a venti minuti di macchina.' },
    { id:'VA-07', chi:'Giulia P.',  dove:'Napoli',  voto:5, da:1.2*SRV_GIORNO,
      testo:'Le promozioni del locale sotto casa mi arrivano puntuali e le uso davvero.' },
    { id:'VA-06', chi:'Marco T.',   dove:'Torino',  voto:2, da:1.6*SRV_GIORNO,
      testo:'Due volte su tre il pagamento con Apple Pay si blocca e devo rifare tutto dall\'inizio.' },
    { id:'VA-05', chi:'Sara V.',    dove:'Bologna', voto:5, da:2.1*SRV_GIORNO,
      testo:'Prenotazione in tre tocchi e conferma immediata. Non torno più a telefonare.' },
    { id:'VA-04', chi:'Luca B.',    dove:'Firenze', voto:3, da:2.8*SRV_GIORNO,
      testo:'Funziona, ma il menu di alcuni locali è fermo a mesi fa e i prezzi non tornano.' },
    { id:'VA-03', chi:'Elena R.',   dove:'Bari',    voto:5, da:3.4*SRV_GIORNO,
      testo:'Adoro non dover chiedere il conto. L\'ho fatta scaricare a tutto il gruppo.' },
    { id:'VA-02', chi:'Davide M.',  dove:'Verona',  voto:1, da:4*SRV_GIORNO,
      testo:'Ordine partito due volte e addebitato due volte. Rimborsato dopo tre giorni, ma la serata l\'ho passata a scrivere all\'assistenza.' },
    { id:'VA-01', chi:'Chiara F.',  dove:'Palermo', voto:4, da:5.2*SRV_GIORNO,
      testo:'Interfaccia chiara. Manca solo poter salvare un ordine come preferito.' },
  ].map(r => ({ ...r, il: new Date(Date.now() - r.da) })),
};

// ─── 6. Valutazione di Byup Staff ───────────────────────────────────────────
//
// Il terzo voto, e il terzo mestiere: qui a rispondere è chi incassa in sala
// col telefono in mano. Non è il ristoratore che paga il canone né il cliente
// che ordina — è il cameriere, e quando l'app lo rallenta se ne accorge
// durante il servizio, non a fine mese.
//
// Le risposte sono meno di quelle dell'app perché la platea è più piccola:
// qualche cameriere per locale, non tutti i clienti che hanno ordinato.
const VALUTAZIONE_STAFF = {
  distribuzione: [
    { voto: 1, n: 11 },
    { voto: 2, n: 19 },
    { voto: 3, n: 48 },
    { voto: 4, n: 163 },
    { voto: 5, n: 287 },
  ],
  recensioni: [
    { id:'VS-08', chi:'Nicola R.', dove:'Osteria San Pietro',   voto:5, da:6*SRV_ORA,
      testo:'Tap to Pay sul mio telefono, zero POS da rincorrere. Incasso al tavolo mentre finisco il giro.' },
    { id:'VS-07', chi:'Ilaria M.', dove:'Bistrot Aurora',       voto:4, da:11*SRV_ORA,
      testo:'La coda di incasso è chiara. Manca poter tornare indietro di un conto se sbaglio a selezionare.' },
    { id:'VS-06', chi:'Youssef B.', dove:'Pub The Crown',       voto:5, da:1.1*SRV_GIORNO,
      testo:'Il sabato sera facciamo duecento conti e non si è mai piantata.' },
    { id:'VS-05', chi:'Federica L.', dove:'Trattoria del Borgo', voto:2, da:1.7*SRV_GIORNO,
      testo:'Nella saletta in fondo prende male e l\'incasso resta appeso: devo tornare al bancone per chiudere.' },
    { id:'VS-04', chi:'Andrea P.', dove:'Pizzeria Sorbillo',    voto:5, da:2.3*SRV_GIORNO,
      testo:'Il conto diviso lo fa lui, non devo più fare i conti a mano sul blocchetto.' },
    { id:'VS-03', chi:'Giada S.',  dove:'Enoteca Vinitalia',    voto:3, da:3.1*SRV_GIORNO,
      testo:'Va bene, ma la mancia va chiesta prima di appoggiare la carta e a volte me ne dimentico.' },
    { id:'VS-02', chi:'Matteo C.', dove:'Ristorante Fior di Loto', voto:4, da:4.2*SRV_GIORNO,
      testo:'Comoda. Il riepilogo di fine turno mi fa chiudere cassa in due minuti.' },
    { id:'VS-01', chi:'Sonia D.',  dove:'Osteria del Vicolo',   voto:5, da:5.6*SRV_GIORNO,
      testo:'Imparata in una serata dalla ragazza nuova, senza che nessuno le spiegasse niente.' },
  ].map(r => ({ ...r, il: new Date(Date.now() - r.da) })),
};

// ─── KPI derivati ───────────────────────────────────────────────────────────
//
// Una sola funzione, usata sia dalla sezione Chiamata assistenza sia dal tab
// «Servizio Clienti» della Dashboard: due schermate che mostrassero numeri
// diversi per la stessa cosa sarebbero peggio di una schermata sola.
function srvKpi(richiamate = RICHIAMATE, ticket = TICKET_SRV) {
  const ora = Date.now();

  // ── Richiamate ──
  const chiuse    = richiamate.filter(r => r.stato === 'fatta');
  const perse     = richiamate.filter(r => r.stato === 'persa');
  const inTempo   = chiuse.filter(r => r.inTempo);
  const inRitardo = chiuse.filter(r => !r.inTempo);
  const attesa    = richiamate.filter(r => r.stato === 'attesa');
  const scadute   = attesa.filter(r => r.entro.getTime() < ora);
  const atteseMin = chiuse.map(r => (r.richiamataIl - r.prenotataIl) / SRV_MIN)
    .sort((a, b) => a - b);
  const attesaMediaMin = atteseMin.length === 0 ? 0
    : Math.round(atteseMin.reduce((s, m) => s + m, 0) / atteseMin.length);
  // Il p90 è il tempo entro cui abbiamo risposto a nove chiamate su dieci. La
  // media dice com'è andata in generale, il p90 dice com'è andata a chi è
  // andata peggio — e sono quelli che poi ne parlano in giro. Venti risposte
  // in dieci minuti e tre dopo quattordici ore fanno una media presentabile e
  // tre clienti furiosi che la media non nomina.
  const attesaP90Min = atteseMin.length === 0 ? 0
    : Math.round(atteseMin[Math.max(0, Math.ceil(atteseMin.length * 0.9) - 1)]);

  // ── Soddisfazione dell'assistenza ──
  //
  // Due sondaggi, un solo voto: quello dopo la chiamata e quello alla chiusura
  // del ticket. Tenerli separati darebbe due medie che parlano dello stesso
  // servizio, e una delle due — quella delle chiamate — esisterebbe solo per
  // Plus e Business, cioè per un terzo dei clienti.
  //
  // I commenti invece restano quelli delle chiamate: il sondaggio del ticket
  // chiede il voto e basta.
  const votiChiamate = richiamate.filter(r => r.voto != null)
    .map(r => ({ voto: r.voto, piano: r.piano, localeId: r.localeId, il: r.richiamataIl }));
  const votiTicket = ticket.filter(t => t.voto != null)
    .map(t => ({ voto: t.voto, piano: t.piano, localeId: t.localeId, il: t.chiusoIl }));
  const votati = votiChiamate.concat(votiTicket);
  const media  = votati.length === 0 ? 0
    : votati.reduce((s, v) => s + v.voto, 0) / votati.length;
  const distribuzione = [1, 2, 3, 4, 5].map(v => ({ voto: v, n: votati.filter(x => x.voto === v).length }));
  const recensioni = richiamate.filter(r => r.recensione).sort((a, b) => b.richiamataIl - a.richiamataIl);

  // Lo spaccato per piano. Non è un dettaglio: è la prova che quello che
  // vendiamo ai piani alti — la chiamata, la richiamata entro due ore per il
  // Plus e un'ora per il Business — si
  // sente. Se il voto del Gratuito pareggiasse quello del Business, staremmo
  // facendo pagare una cosa che non cambia niente.
  const perPiano = PIANI.map(p => {
    const suoi = votati.filter(v => v.piano === p.id);
    return {
      piano: p.id,
      label: p.label,
      n: suoi.length,
      media: suoi.length ? suoi.reduce((s, v) => s + v.voto, 0) / suoi.length : null,
      conChiamata: srvHaChiamata(p.id),
    };
  });

  // ── I locali che stanno sotto ──
  //
  // La media è un voto solo per tutta la piattaforma: se dieci locali danno 2
  // e novanta danno 4, resta 3,8 e quei dieci diventano invisibili — fino al
  // mese in cui disdicono. Quello che serve non è la media: è l'elenco di chi
  // sta sotto la soglia, dal peggiore in giù, con un nome su cui chiamare.
  //
  // Due voti minimi perché un locale che ha votato una volta sola e male non è
  // un cliente insoddisfatto, è una brutta giornata.
  const SOGLIA_CRITICA = 3;
  const perLocaleVoti = {};
  votati.forEach(v => {
    const e = perLocaleVoti[v.localeId] || (perLocaleVoti[v.localeId] = { voti: [], ultimo: null });
    e.voti.push(v.voto);
    if (v.il && (!e.ultimo || v.il > e.ultimo)) e.ultimo = v.il;
  });
  const localiCritici = Object.entries(perLocaleVoti)
    .map(([localeId, e]) => {
      const l = LOCALI.find(x => x.id === localeId) || {};
      return {
        localeId, nome: l.nome || localeId, citta: l.citta || null, piano: l.piano || null,
        n: e.voti.length,
        media: e.voti.reduce((s, v) => s + v, 0) / e.voti.length,
        ultimo: e.ultimo,
      };
    })
    .filter(l => l.n >= 2 && l.media <= SOGLIA_CRITICA)
    .sort((a, b) => a.media - b.media || b.n - a.n);

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

  // ── Riaperture ──
  //
  // Quante volte chiudiamo un ticket e il locale lo riapre perché il problema
  // era ancora lì. Senza questo numero, «339 chiusi su 363» misura la nostra
  // velocità nel premere «chiudi», non la risoluzione: un quarto che rientra
  // dopo due giorni farebbe la stessa bella percentuale.
  const chiusiMese = ticket.filter(t => t.chiusoIl && t.chiusoIl.getTime() >= ora - 30 * SRV_GIORNO);
  const riapertiMese = chiusiMese.filter(t => t.riapertoIl);
  const riaperture = {
    chiusi: chiusiMese.length,
    riaperti: riapertiMese.length,
    pct: chiusiMese.length ? Math.round(riapertiMese.length / chiusiMese.length * 100) : 0,
    // Quanto ci mette a tornare indietro: se rientra il giorno dopo, il ticket
    // non era risolto quando l'abbiamo chiuso.
    oreMedie: riapertiMese.length
      ? riapertiMese.reduce((s, t) => s + (t.riapertoIl - t.chiusoIl), 0) / riapertiMese.length / SRV_ORA
      : 0,
  };

  // ── Le cause ricorrenti ──
  //
  // Il conto che trasforma il carico di assistenza in una lista di cose da
  // sistemare. Se ottanta ticket su 363 sono lo stesso identico motivo, quello
  // non è lavoro da smaltire meglio: è un difetto che si ripara una volta e
  // toglie un ticket su cinque per sempre.
  const delMese = ticket.filter(t => t.apertoIl.getTime() >= ora - 30 * SRV_GIORNO);
  const cause = SRV_CAUSE.map(c => {
    const suoi = delMese.filter(t => t.causa === c.id);
    const riap = suoi.filter(t => t.riapertoIl).length;
    return {
      id: c.id, label: c.label, prodotto: !!c.prodotto,
      n: suoi.length,
      pct: delMese.length ? Math.round(suoi.length / delMese.length * 100) : 0,
      // Una causa che rientra più delle altre è una che non stiamo risolvendo,
      // solo chiudendo.
      pctRiaperti: suoi.filter(t => t.chiusoIl).length
        ? Math.round(riap / suoi.filter(t => t.chiusoIl).length * 100) : 0,
    };
  }).sort((a, b) => b.n - a.n);

  // ── Pressione da ticket, per locale ──
  //
  // Il conto grezzo — ticket diviso locali — mette sullo stesso piano chi fa
  // duecento ordini al mese e chi ne fa ottomila. Il secondo apre più ticket
  // perché usa di più il prodotto, non perché stia andando peggio.
  //
  // Ogni mille ordini, invece, i due diventano confrontabili: il piccolo che
  // ne apre quattro salta fuori come caso critico, il grande che ne apre sei
  // risulta normale. La soglia dei 150 ordini al mese tiene fuori i locali
  // fermi o appena iscritti: con un denominatore di trenta ordini, un ticket
  // solo vale trentatré ogni mille e la classifica la guiderebbe il rumore.
  const ticketPerLocaleMese = {};
  delMese.forEach(t => { ticketPerLocaleMese[t.localeId] = (ticketPerLocaleMese[t.localeId] || 0) + 1; });
  const ordiniTotaliMese = LOCALI.reduce((s, l) => s + (l.ordiniMese || 0), 0);
  const ticketPerMille = ordiniTotaliMese ? delMese.length / ordiniTotaliMese * 1000 : 0;
  const intensita = Object.entries(ticketPerLocaleMese)
    .map(([localeId, n]) => {
      const l = LOCALI.find(x => x.id === localeId) || {};
      const ordini = l.ordiniMese || 0;
      return {
        localeId, nome: l.nome || localeId, citta: l.citta || null, piano: l.piano || null,
        n, ordini,
        perMille: ordini ? n / ordini * 1000 : null,
      };
    })
    .filter(l => l.ordini >= 150 && l.perMille != null)
    .sort((a, b) => b.perMille - a.perMille);

  const apertiPerLocale = {};
  ticket.filter(t => !t.chiusoIl).forEach(t => {
    apertiPerLocale[t.localeId] = (apertiPerLocale[t.localeId] || 0) + 1;
  });
  const localiConAperti = Object.keys(apertiPerLocale).length;
  const maxAperti = Object.values(apertiPerLocale).reduce((m, n) => Math.max(m, n), 0);

  const perLocale = {
    localiTotali: LOCALI.length,
    ticketPerMille,
    ordiniTotaliMese,
    intensita,
    apertiMedi: localiConAperti ? apertiOra / localiConAperti : 0,
    localiConAperti,
    maxAperti,
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
      attesaP90Min,
    },
    soddisfazione: { media, n: votati.length, distribuzione, recensioni, perPiano,
      nChiamate: votiChiamate.length, nTicket: votiTicket.length,
      localiCritici, sogliaCritica: SOGLIA_CRITICA },
    ticket: { finestre, chiusuraMediaOre, chiusuraPrecOre, apertiOra, serie: serieTicket,
      riaperture, cause },
    perLocale,
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
  SRV_FASCE, SRV_PIANI_CON_CHIAMATA, SRV_CAUSE, srvHaChiamata, srvScadenza,
  RICHIAMATE, TICKET_SRV,
  FAQ_SRV, FAQ_CATEGORIE, GUIDE_ARGOMENTI, GUIDE_SRV, VALUTAZIONE_APP, VALUTAZIONE_STAFF,
  srvKpi, srvMinutiAScadere, srvNonRisolto, srvDurata, srvMinuti, srvOre,
});


// ─── 5. Ripristini di accesso (P-73 · D-57, account_recoveries) ─────────────
// La superficie del ripristino assistito: chi ha perso l'accesso al proprio
// account lo chiede all'assistenza, e la pratica registra il metodo di
// verifica dell'identità, il riferimento opaco all'evidenza, l'operatore e
// l'esito. L'invariante, scolpito nella nota del modello: il ripristino
// restituisce l'accesso ALLA STESSA PERSONA e non lo trasferisce mai — user_id
// «è sempre la stessa persona che lo ha perso». Se chi chiede è un'altra
// persona non c'è nulla da trasferire: non esiste un cambio del titolare né
// un passaggio del locale (D-104, P-117) — l'account è della persona, i suoi
// recapiti si cambiano dal profilo e si registrano (audit_events), il
// soggetto fiscale si cambia in Dati fiscali (restaurant_holder_changes, al
// solo cambio di soggetto, concluso con la riaccettazione dei termini). Il
// pulsante che cambierebbe il titolare non esiste, e non deve.
//   identity_check_method — dominio chiuso: «il metodo si dichiara perché è la
//     sola cosa che regge la decisione».
//   identity_evidence_ref — riferimento opaco all'evidenza conservata fuori
//     dalla base dati: mai la copia del documento, PRO-16 la esclude.
//   verified_by — l'operatore: traccia di responsabilità, mai base di metriche
//     (stessa cautela di D-30: la lettura per singola persona non si costruisce).
//   outcome — pending, restored, refused (con causale), withdrawn: il
//     ripristino riguarda le sole credenziali di accesso.
//   request_channel — callback, email, chat, gestionale.
// Coda registrata: l'operatore ha tre identità nei mock (SRV_IO, MY_ID,
// TEAM isYou); qui vale SRV_IO. Il reset dal login del gestionale funziona
// (P-172 · D-121): «Password dimenticata» manda il collegamento al recapito
// dell'utenza, e il titolare reimposta il proprio personale da Impostazioni →
// Personale. Qui arrivano solo i casi che quei due livelli non risolvono.
const SRV_RIPRISTINO_METODI = [
  { id:'pec_del_locale',               label:'PEC del locale',                nota:'Risposta arrivata dalla PEC censita nei dati fiscali' },
  { id:'documento_di_identita',        label:'Documento d\'identità',         nota:'Esibito in videochiamata: si registra il riferimento all\'evidenza, mai la copia' },
  { id:'dati_fiscali',                 label:'Dati fiscali',                  nota:'P.IVA, codice fiscale e sede confrontati con l\'anagrafica del locale' },
  { id:'chiamata_al_recapito_censito', label:'Chiamata al recapito censito',  nota:'Telefonata al numero già presente in anagrafica, non a uno dettato ora' },
  { id:'altro',                        label:'Altro',                         nota:'Va detto nelle note: senza, il metodo non regge la decisione' },
];
const SRV_RIPRISTINO_CANALI = { callback:'Chiamata', email:'Email', chat:'Chat', gestionale:'Gestionale' };
// Data e ora di una pratica, nel formato di Hubble. Mancava: la sezione dei
// ripristini andava in errore appena si apriva una pratica (trovato con
// P-172, che la porta nella scheda del locale).
const srvDataOra = (d) => { if (!d) return '—'; const x = new Date(d); return `${typeof fmtDate === 'function' ? fmtDate(x) : x.toLocaleDateString('it-IT')} · ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`; };
window.srvDataOra = srvDataOra;
const SRV_RIPRISTINO_ESITI = {
  pending:   { label:'In attesa',  tono:'WARN' },
  restored:  { label:'Ripristinato', tono:'OK' },
  refused:   { label:'Rifiutato',  tono:'DANGER' },
  withdrawn: { label:'Ritirata',   tono:'MUTED' },
};
// Tre pratiche ancorate all'oggi: una in attesa da una chiamata di stamattina,
// una ripristinata tre giorni fa col documento, una rifiutata dieci giorni fa
// con causale — i dati fiscali non tornavano, l'identità non è dimostrata.
const RIPRISTINI = [
  { id:'AR-0142', outcome:'pending', request_channel:'callback',
    user:{ nome:'Mario Rossi', ruolo:'titolare' }, localeNome:'Cacio e Pepe', localeCitta:'Roma',
    richiestaIl: new Date(Date.now() - 2 * SRV_ORA - 10 * SRV_MIN),
    identity_check_method:null, identity_evidence_ref:'', note:'', verified_by:null, verified_at:null, refusal_reason:null },
  { id:'AR-0139', outcome:'restored', request_channel:'email',
    user:{ nome:'Elena Costa', ruolo:'titolare' }, localeNome:'Osteria Francescana', localeCitta:'Modena', // il locale esiste in rubrica: la pratica si apre dalla sua scheda (P-172)
    richiestaIl: new Date(Date.now() - 3 * SRV_GIORNO - 5 * SRV_ORA),
    identity_check_method:'documento_di_identita', identity_evidence_ref:'EV-2026-0830-4F2A',
    note:'Videochiamata di dieci minuti, documento esibito e confrontato con l\'anagrafica.',
    verified_by:'support1', verified_at: new Date(Date.now() - 3 * SRV_GIORNO - 4 * SRV_ORA), refusal_reason:null,
    // Il collegamento mandato tre giorni fa non è stato usato: è scaduto, e la finestra offre «Riemetti» (P-172).
    link_sent_at: new Date(Date.now() - 3 * SRV_GIORNO - 4 * SRV_ORA), link_expires_at: new Date(Date.now() - SRV_GIORNO - 4 * SRV_ORA), link_used_at: null },
  { id:'AR-0131', outcome:'refused', request_channel:'chat',
    user:{ nome:'Paolo Neri', ruolo:'titolare' }, localeNome:'Bar Mediterraneo', localeCitta:'Roma',
    richiestaIl: new Date(Date.now() - 10 * SRV_GIORNO - 6 * SRV_ORA),
    identity_check_method:'dati_fiscali', identity_evidence_ref:'EV-2026-0823-91C0',
    note:'Chiedeva l\'accesso come titolare; ha fornito una P.IVA diversa da quella censita.',
    verified_by:'support1', verified_at: new Date(Date.now() - 10 * SRV_GIORNO - 5 * SRV_ORA),
    refusal_reason:'I dati fiscali forniti non corrispondono all\'anagrafica del locale: identità non dimostrata.' },
];
// P-172 · D-121: la sezione «Ripristini accesso» non c'è più. La richiesta
// pendente è un ticket nella coda che esiste già, con l'argomento «ripristino
// accesso» e il pulsante che porta alla scheda del locale, tab Account, con
// la finestra aperta. Questo file si carica dopo admin-comunicazioni.jsx:
// aggiunge i ticket alla coda e la riordina per data.
if (typeof COMUNICAZIONI !== 'undefined') {
  RIPRISTINI.filter(r => r.outcome === 'pending').forEach(r => {
    const locale = (typeof LOCALI !== 'undefined' ? LOCALI : []).find(l => l.nome === r.localeNome);
    COMUNICAZIONI.push({
      id: 'T-' + r.id, ripristinoId: r.id, certRequest: false, localeId: locale ? locale.id : null,
      senderName: r.user.nome, senderEmail: locale ? locale.email : '',
      oggetto: `Non riesce ad accedere · ${r.user.nome}`,
      desc: `Richiesta di ripristino dell'accesso, arrivata via ${SRV_RIPRISTINO_CANALI[r.request_channel].toLowerCase()}. La pratica si chiude dalla scheda del locale, tab Account, con la finestra «Non riesce ad accedere»: metodo di verifica, riferimento alla prova, esito. L'accesso torna a ${r.user.nome} e non si trasferisce mai.\n\n${r.user.nome}\n${r.localeNome}`,
      allegati: [], data: r.richiestaIl, stato: 'nuova', tags: ['ripristino accesso'], assignedTo: null,
    });
  });
  COMUNICAZIONI.sort((a, b) => b.data - a.data);
}
