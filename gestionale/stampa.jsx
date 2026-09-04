// Stampa di comande e documenti (P-128 · D-109; rivede D-108, supera P-124).
//
// LA REGOLA, in una riga: comande e documenti del cliente escono dalle
// stampanti che INTERROGANO IL NOSTRO SERVER; il browser è il ripiego, e solo
// per i documenti.
//
// Le due strade, fissate sulle fonti del 3 e 4 settembre 2026 (Epson
// ePOS-Print e Server Direct Print, Star CloudPRNT, W3C Mixed Content e
// Secure Contexts, WebKit su Web Bluetooth, Apple MFi, Android RFCOMM):
//   1. La STAMPANTE COLLEGATA. Non siamo noi a chiamarla: è lei che ogni
//      pochi secondi chiede al nostro server se c'è qualcosa da stampare, se
//      lo scarica e lo stampa. Star con CloudPRNT, Epson con Server Direct
//      Print. È l'unica via che stampa senza una persona davanti a uno
//      schermo e senza un dispositivo acceso nel locale. Ha la PRECEDENZA,
//      sempre, per le comande come per i documenti.
//   2. Il BROWSER della postazione. Prepariamo una pagina da 80 mm e la
//      mandiamo alla stampa del sistema: esce da qualunque stampante, di
//      qualunque marca. Tre limiti che non si aggirano, e sono la ragione di
//      tutte le regole che seguono: serve sempre una persona che confermi;
//      non sappiamo quali stampanti abbia quel computer e non possiamo
//      sceglierne una; non sappiamo se il foglio è uscito.
//
// Per i DOCUMENTI DEL CLIENTE — pre-conto e documento di cortesia, due fogli
// distinti per lo stesso cliente, uno prima e uno dopo il pagamento, e che
// quindi seguono la STESSA strada — se la stampante collegata di quel POS non
// c'è o non risponde si ripiega sul browser, e il lavoro in coda SI ANNULLA:
// se restasse lì, la stampante che torna su mezz'ora dopo lo ritira e sputa un
// secondo foglio per un cliente che se n'è andato.
// Per le COMANDE non esiste ripiego: in cucina non c'è nessuno che prema
// Stampa. Se la stampante di cucina non risponde, la cucina lavora dal
// monitor — che vede tutte le comande — il gestionale lo dice in sala con una
// fascia a tutta larghezza, e le comande rimaste in coda SCADONO: una comanda
// stampata due ore dopo fa più danno di una non stampata.
//
// UNA STAMPANTE CHE STAMPA DAL BROWSER NON È UN DISPOSITIVO e non si aggiunge:
// dal browser non torna indietro niente, quindi quella riga sarebbe un nome
// scritto a mano e tre campi vuoti per sempre. Ogni stampante in elenco è, per
// definizione, una che interroga il nostro server — per questo `connection_mode`
// non esiste più (aveva un valore solo): quel che serve sapere lo dice
// `printer_protocol`. Il browser non è un dispositivo: è quello che succede
// quando un dispositivo non c'è.
//
// Nessuna via passa dalla pagina web alla stampante in rete locale: il
// contenuto misto la blocca senza certificati installati a mano su ogni
// dispositivo, per ammissione dei produttori. Il ponte via App Staff e il
// Bluetooth sono rinviati oltre l'MVP; le stampanti che passano dal cloud di un
// terzo (Sunmi e simili) non sono compatibili finché quel terzo non è valutato
// come responsabile del trattamento.
//
// Qui vivono (1) il registro delle stampanti coi NOMI DEL MODELLO — devices di
// tipo printer con device_model, printer_vendor, printer_protocol `cloudprnt` |
// `server_direct_print`, cloud_client_id, poll_interval_seconds,
// connection_status, connection_checked_at, last_test_print_at,
// last_test_print_result, printer_role (`use` nel prototipo: comande |
// documenti) — con l'instradamento per categoria di category_routings (UNO
// solo: una categoria sta su una stampante sola), la coda print_jobs e
// venue_delivery_integrations.auto_print_courtesy, una per piattaforma
// (P-129); (2) le POSTAZIONI aperte e le RICHIESTE di stampa dal browser, che
// sono il ripiego del caso 3.3; e (3) i layout HTML a 80 mm — comanda per
// categoria, pre-conto, documento di cortesia.
//
// FINZIONE DICHIARATA. Senza backend non esistono gli endpoint CloudPRNT e
// Server Direct Print, la coda vera e i ritentativi: il «primo contatto» della
// stampante, lo stato in linea e l'esito della prova di stampa sono simulati e
// lo dicono a schermo. La stampa dal browser è vera. La coda dichiara
// `payload_format: 'html'` anche per le stampanti collegate: nel prodotto lo
// stesso foglio va reso in tre dialetti — HTML per il browser, ePOS-Print per
// Epson, il linguaggio di Star per Star — ed è tre volte il lavoro di renderlo
// una volta sola.
//
// Registro in localStorage (byup_stampanti): le righe toccate si fondono sul
// seme per id. Via `print_mode`, `connection_mode`, `device_type`, `model`,
// `bridge_device_id`, `ip`, `protocol`, ePOS e WebPRNT: nomi che il modello
// non ha, o che P-128 ha ritirato.

const PN_STAMPANTI_KEY = 'byup_stampanti';

// I modelli ammessi per le comande: quelli degli elenchi ufficiali (scheda di
// versione CloudPRNT di Star; Server Direct Print Rev.U di Epson). La
// TM-T20III non c'è in nessuna versione dell'elenco Epson: stampa solo
// documenti, dal browser, come qualunque stampante di sistema.
const PN_PRINTER_MODELLI = {
  star:  { nome: 'Star Micronics', protocollo: 'cloudprnt', modelli: ['TSP143IV', 'TSP100IV SK', 'mC-Print2', 'mC-Print3', 'mC-Label3'] },
  epson: { nome: 'Epson',          protocollo: 'server_direct_print', modelli: ['TM-m30III', 'TM-m30II', 'TM-m50II', 'TM-T88VII', 'TM-T88VI'] },
};
const PN_PRINTER_PROTOCOLLI = {
  cloudprnt:           { label: 'CloudPRNT',           breve: 'CloudPRNT', chiave: 'indirizzo MAC (la stampante lo presenta da sé al primo sondaggio)', url: 'https://print.byup.it/cloudprnt/' },
  server_direct_print: { label: 'Server Direct Print', breve: 'SDP',       chiave: 'identificativo impostato sulla stampante (ID del server)',          url: 'https://print.byup.it/sdp/' },
};
// Lo stato del collegamento, calcolato dagli eventi (nel prototipo: dal seme).
const PN_PRINT_STATI = {
  never_configured: { label: 'Da configurare', tono: 'muto' },
  online:           { label: 'In linea',       tono: 'ok' },
  polling_late:     { label: 'In ritardo',     tono: 'attesa' },
  offline:          { label: 'Non in linea',   tono: 'errore' },
  error:            { label: 'Errore',         tono: 'errore' },
};
// I menù e le categorie che si instradano: la copia condivisa fra Personale e
// «Collega stampante» (category_routings). Le chiavi sono «menuId:catId».
const PN_MENU_CATEGORIE = [
  { id: 'principale', label: 'Menù principale',
    categories: [{ id: 'antipasti', label: 'Antipasti' }, { id: 'primi', label: 'Primi' }, { id: 'secondi', label: 'Secondi' }, { id: 'dolci', label: 'Dolci' }, { id: 'bevande', label: 'Bevande' }] },
  { id: 'pizzeria', label: 'Menù pizzeria',
    categories: [{ id: 'pizze', label: 'Pizze' }, { id: 'fritti', label: 'Fritti' }, { id: 'dolci-p', label: 'Dolci' }, { id: 'bevande-p', label: 'Bevande' }] },
  { id: 'bar', label: 'Carta bar',
    categories: [{ id: 'cocktail', label: 'Cocktail' }, { id: 'analcolici', label: 'Analcolici' }, { id: 'caffetteria', label: 'Caffetteria' }, { id: 'snack', label: 'Snack' }] },
];
window.pnRoutingLabel = (key) => {
  const [m, c] = String(key).split(':');
  const menu = PN_MENU_CATEGORIE.find(x => x.id === m);
  const cat = menu && menu.categories.find(x => x.id === c);
  return cat ? cat.label : c || key;
};

// ─── A che cosa serve una stampante ────────────────────────────────────────
// Due usi, e non si mescolano: una stampante stampa le COMANDE (e allora le si
// assegnano le categorie che deve ricevere) oppure i DOCUMENTI destinati al
// cliente, cioè il pre-conto e il documento di cortesia. La distinzione non è
// di comodo: le comande escono senza che nessuno guardi uno schermo e non
// hanno ripiego, i documenti nascono quando qualcuno incassa e in mancanza
// vanno al browser; e il vincolo di una categoria su una stampante sola vale
// per le prime e non per i secondi.
// Nel modello è `devices.printer_role`: kitchen_tickets | customer_documents.
const PN_PRINT_USI = {
  comande:   { label: 'Comande di cucina', breve: 'Comande',   nota: 'Riceve le comande delle categorie che le assegni. Una categoria sta su una stampante sola.' },
  documenti: { label: 'Documenti del cliente', breve: 'Documenti', nota: 'Il pre-conto e il documento di cortesia. Se non risponde, il foglio si stampa dal browser.' },
};
// Perché una comanda non può uscire dal browser, detto una volta sola e
// riusato dove serve. Non è una limitazione del prototipo: la stampa dal
// browser apre la finestra di dialogo del sistema e aspetta che una persona
// confermi, mentre una comanda deve uscire quando in sala si invia l'ordine e
// in cucina non c'è nessuno davanti a uno schermo.
window.PN_COMANDE_PERCHE_NO = 'Per stampare una comanda serve una stampante che interroghi il nostro server: è l\'unica che stampa senza una persona che conferma la finestra di stampa e senza un dispositivo acceso nel locale. Dal browser la comanda uscirebbe solo se qualcuno fosse lì a premere Stampa ogni volta.';
// I modelli che possono farlo, dagli elenchi ufficiali dei due protocolli.
window.pnModelliComande = function () {
  return Object.values(PN_PRINTER_MODELLI).map(m => `${m.nome}: ${m.modelli.join(', ')}`);
};

const pnIsoFa = (sec) => new Date(Date.now() - sec * 1000).toISOString();
// Le tre piattaforme di consegna predisposte (P-119 · D-106): la casella del
// foglio nel sacchetto è per sede E per piattaforma, perché un locale può
// volerlo per Glovo e non per Deliveroo — le piattaforme non stampano tutte la
// stessa etichetta.
const PN_DELIVERY_PIATTAFORME = ['glovo', 'deliveroo', 'ubereats'];
// Il seme: due stampanti di cucina che interrogano il server, una per
// protocollo. Gli stati «in linea» sono seme. Nessuna stampante «da browser»:
// il browser non è un dispositivo (P-128).
const pnStampantiSeme = () => ({
  devices: [
    { id: 'prn-1', type: 'printer', name: 'Cucina', device_model: 'TSP143IV', printer_vendor: 'star',
      printer_protocol: 'cloudprnt', cloud_client_id: '00:11:62:4F:A3:9C', poll_interval_seconds: 5,
      connection_status: 'online', connection_checked_at: pnIsoFa(9), venue_id: 'cp', use: 'comande', pos_ids: [],
      routing: ['principale:antipasti', 'principale:primi', 'principale:secondi'], last_test_print_at: pnIsoFa(2 * 86400 + 3600), last_test_print_result: 'ok' },
    { id: 'prn-2', type: 'printer', name: 'Bar', device_model: 'TM-m30III', printer_vendor: 'epson',
      printer_protocol: 'server_direct_print', cloud_client_id: 'cp-bar-01', poll_interval_seconds: 5,
      connection_status: 'online', connection_checked_at: pnIsoFa(4), venue_id: 'cp', use: 'comande', pos_ids: [],
      routing: ['principale:bevande', 'principale:dolci'], last_test_print_at: null, last_test_print_result: null },
  ],
  print_jobs: [],
  candidate_aggiunte: [],
  // Il documento di cortesia a incasso chiuso: al tocco (predefinito) o da
  // solo. Da solo è più veloce, ma stampa anche quando il cliente il foglio
  // non lo vuole — e quelli sono fogli buttati. È venue_settings.
  venue_settings: { auto_print_receipt: false },
  // Il foglio nel sacchetto degli ordini a domicilio (P-129). È un'OPZIONE, e
  // nasce ACCESA: un sacchetto che parte senza foglio è un errore che il
  // cliente scopre a casa, e nessuno va ad accendere un'impostazione di cui
  // ignora l'esistenza. Si spegne perché un locale che stampa già l'etichetta
  // della piattaforma si ritroverebbe due fogli nello stesso sacchetto. Senza
  // una stampante di cucina collegata non si può accendere: all'arrivo
  // dell'ordine nessuno sta guardando la finestra di stampa del browser.
  venue_delivery_integrations: Object.fromEntries(PN_DELIVERY_PIATTAFORME.map(k => [k, { auto_print_courtesy: true }])),
});
// I registri scritti prima di P-128 portano `connection_mode`, e alcune righe
// erano stampanti «da browser», che non sono più dispositivi: qui si allineano
// da soli, senza buttare il resto di quello che l'esercente aveva impostato.
// NIENTE destrutturazione con rest qui. Babel compila `const {a, ...resto} = x`
// in una chiamata che legge una variabile di modulo chiamata `_excluded`, e i
// file .jsx del gestionale girano tutti nello STESSO ambito globale: il
// `_excluded` di un altro file sovrascrive il nostro, e la funzione finisce per
// togliere le chiavi sbagliate — qui aveva tolto `name` alle stampanti, e la
// fascia diceva «non ha stampato» senza dire quale. È la stessa collisione già
// vista sulle icone. Si copia a mano, che è esplicito e non ha ambito da
// condividere con nessuno.
const pnPulisciDevice = (d) => {
  const out = {};
  Object.keys(d || {}).forEach(k => { if (k !== 'connection_mode') out[k] = d[k]; });
  return out;
};
const pnMigraDelivery = (v, seme) => {
  // Prima era un unico { auto_print_courtesy }: diventa lo stesso valore per
  // tutte e tre le piattaforme.
  if (v && typeof v.auto_print_courtesy === 'boolean') {
    return Object.fromEntries(PN_DELIVERY_PIATTAFORME.map(k => [k, { auto_print_courtesy: v.auto_print_courtesy }]));
  }
  const out = {};
  PN_DELIVERY_PIATTAFORME.forEach(k => { out[k] = Object.assign({}, seme[k], (v || {})[k] || {}); });
  return out;
};
window.byupReadStampanti = function () {
  const seme = pnStampantiSeme();
  try {
    const s = localStorage.getItem(PN_STAMPANTI_KEY);
    if (!s) return seme;
    const salvato = JSON.parse(s);
    // Un registro scritto prima di P-124 (print_mode, ip, ponte) non si legge: il seme vince.
    if (salvato.devices && salvato.devices.some(d => d.print_mode)) { localStorage.removeItem(PN_STAMPANTI_KEY); return seme; }
    const perId = Object.fromEntries((salvato.devices || []).map(d => [d.id, d]));
    const rimossi = new Set(salvato.rimossi || []);
    const devices = seme.devices.filter(d => !rimossi.has(d.id)).map(d => perId[d.id] ? Object.assign({}, d, perId[d.id]) : d)
      .concat((salvato.devices || []).filter(d => !seme.devices.some(x => x.id === d.id)))
      // Una stampante senza protocollo era una «da browser»: quelle non sono
      // più dispositivi (P-128) e non tornano in elenco.
      .filter(d => !!d.printer_protocol)
      .map(pnPulisciDevice);
    return { devices, rimossi: [...rimossi], print_jobs: salvato.print_jobs || [], candidate_aggiunte: salvato.candidate_aggiunte || [],
      venue_settings: Object.assign({}, seme.venue_settings, salvato.venue_settings || {}),
      venue_delivery_integrations: pnMigraDelivery(salvato.venue_delivery_integrations, seme.venue_delivery_integrations) };
  } catch (e) { return seme; }
};
window.byupWriteStampanti = function (reg) {
  try { localStorage.setItem(PN_STAMPANTI_KEY, JSON.stringify(reg)); } catch (e) {}
  window.dispatchEvent(new Event('byup-stampanti-change'));
};
window.byupStampantePatch = function (id, patch) {
  const reg = window.byupReadStampanti();
  reg.devices = reg.devices.map(d => d.id === id ? Object.assign({}, d, patch) : d);
  window.byupWriteStampanti(reg); return reg;
};
window.byupStampanteAggiungi = function (dev, candidataId) {
  const reg = window.byupReadStampanti();
  reg.devices = [...reg.devices, pnPulisciDevice(dev)];
  if (candidataId) reg.candidate_aggiunte = [...new Set([...(reg.candidate_aggiunte || []), candidataId])];
  window.byupWriteStampanti(reg); return dev;
};
window.byupStampanteRimuovi = function (id) {
  const reg = window.byupReadStampanti();
  reg.devices = reg.devices.filter(d => d.id !== id);
  reg.rimossi = [...new Set([...(reg.rimossi || []), id])];
  window.byupWriteStampanti(reg); return reg;
};
// I due usi. Ogni stampante in elenco interroga il nostro server, quindi il
// filtro è sull'uso e basta: quello che prima si chiedeva a `connection_mode`
// oggi non ha più un secondo valore da distinguere.
window.byupStampantiComande = () => window.byupReadStampanti().devices.filter(d => (d.use || 'comande') === 'comande');
window.byupStampantiDocumenti = () => window.byupReadStampanti().devices.filter(d => (d.use || 'comande') === 'documenti');
// Il foglio nel sacchetto, per piattaforma (P-129).
window.byupAutoPrintCortesiaPiattaforma = function (piattaforma) {
  const v = (window.byupReadStampanti().venue_delivery_integrations || {})[piattaforma];
  return !!(v && v.auto_print_courtesy);
};
window.byupImpostaAutoPrintCortesia = function (piattaforma, on) {
  const reg = window.byupReadStampanti();
  reg.venue_delivery_integrations = Object.assign({}, reg.venue_delivery_integrations, { [piattaforma]: { auto_print_courtesy: !!on } });
  window.byupWriteStampanti(reg); return reg;
};

// ─── «Cerca stampante»: che cosa si può davvero trovare ─────────────────────
// Da una pagina web non esiste alcuna scansione della rete locale, e il
// browser non espone a JavaScript l'elenco delle stampanti che il sistema
// conosce: nessuna API lo permette, e la chiamata diretta a una stampante in
// LAN è bloccata dal contenuto misto (D-108). Quindi «cerca» qui vuol dire
// una cosa sola, ma vera: si guarda CHI SI È PRESENTATO AL NOSTRO SERVER.
// Una stampante che interroga il server (CloudPRNT, Server Direct Print) si
// annuncia da sé al primo sondaggio, con il suo identificativo e il suo
// modello: quella la troviamo davvero, e finché non la si aggiunge resta qui,
// in attesa. La stampante di sistema della postazione non si cerca perché non
// si può elencare: c'è sempre, e si aggiunge senza cercarla.
// Nel prototipo le candidate sono un seme: senza backend nessuna stampante
// bussa davvero, e la schermata lo dichiara.
// Cinque, e non due: una stampante si aggiunge e le altre restano lì, quindi
// l'elenco deve reggere più di un giro — con due candidate, aggiunta la
// seconda la schermata diventava vuota e non si vedeva più com'è fatta.
// Le due marche e i due protocolli sono rappresentati da tutte e due le parti,
// perché il foglio dice un indirizzo diverso per ciascuno.
const pnCandidateSeme = () => [
  { id: 'cand-1', device_model: 'TSP143IV', printer_vendor: 'star', printer_protocol: 'cloudprnt',
    cloud_client_id: '00:11:62:7B:1E:44', visto_at: pnIsoFa(12), nome_proposto: 'Pizzeria' },
  { id: 'cand-2', device_model: 'TM-m30III', printer_vendor: 'epson', printer_protocol: 'server_direct_print',
    cloud_client_id: 'cp-cassa2-07', visto_at: pnIsoFa(46), nome_proposto: 'Cassa 2' },
  { id: 'cand-3', device_model: 'mC-Print3', printer_vendor: 'star', printer_protocol: 'cloudprnt',
    cloud_client_id: '00:11:62:9C:04:D1', visto_at: pnIsoFa(95), nome_proposto: 'Banco' },
  { id: 'cand-4', device_model: 'TM-m30II', printer_vendor: 'epson', printer_protocol: 'server_direct_print',
    cloud_client_id: 'cp-dehors-02', visto_at: pnIsoFa(210), nome_proposto: 'Dehors' },
  { id: 'cand-5', device_model: 'TSP100IV SK', printer_vendor: 'star', printer_protocol: 'cloudprnt',
    cloud_client_id: '00:11:62:31:A8:7E', visto_at: pnIsoFa(640), nome_proposto: 'Etichette' },
];
// Le candidate ancora libere: quelle che si sono presentate e che nessuno ha
// già aggiunto (il confronto è sull'identificativo con cui si annunciano).
// ─── Le stampanti che il sistema conosce: quello che possiamo sapere ────────
// Nulla. Nessun browser espone a JavaScript l'elenco delle stampanti che il
// sistema conosce, ed è deliberato: quell'elenco identifica il dispositivo, e
// sarebbe materiale da impronta digitale. Non sappiamo nemmeno quale
// stampante l'utente ha scelto dopo aver premuto Stampa, né se ha stampato o
// annullato — `onafterprint` scatta in tutti e due i casi. Su iPad c'è un
// limite in più: la stampa di sistema è AirPrint, e una termica che non lo
// supporta non compare neanche nell'elenco che il sistema mostra.
// È la ragione per cui una stampante «da browser» non è un dispositivo e non
// si mette in elenco (P-128): non sapremmo dirne né il nome, né lo stato, né
// se ha stampato. Il browser non è una macchina da registrare, è la strada che
// il documento prende quando una macchina non c'è.
window.byupStampantiRilevate = function () {
  const reg = window.byupReadStampanti();
  const prese = new Set(reg.devices.map(d => d.cloud_client_id).filter(Boolean));
  const aggiunte = new Set(reg.candidate_aggiunte || []);
  return pnCandidateSeme().filter(c => !prese.has(c.cloud_client_id) && !aggiunte.has(c.id));
};

// ─── Quale POS stampa dove (associazione POS ↔ stampante) ───────────────────
// Con UNA sola stampante per i documenti non c'è nulla da chiedere: tutto esce
// da lì. Da DUE in poi la domanda nasce da sé — quale cassa stampa su quale
// stampante — e la risposta è un'associazione, non una preferenza: un POS sta
// su una stampante sola, altrimenti lo stesso documento potrebbe uscire due
// volte, in due punti del locale. Assegnare un POS lo toglie dalle altre.
window.byupPosStampante = function (posId) {
  return window.byupStampantiDocumenti().find(d => (d.pos_ids || []).includes(posId)) || null;
};
window.byupAssociaPos = function (posId, printerId) {
  const reg = window.byupReadStampanti();
  reg.devices = reg.devices.map(d => {
    const senza = (d.pos_ids || []).filter(x => x !== posId);
    return Object.assign({}, d, { pos_ids: d.id === printerId ? [...senza, posId] : senza });
  });
  window.byupWriteStampanti(reg); return reg;
};
// Le chiavi «menuId:catId» già instradate su altre stampanti: una categoria
// sta su una stampante sola (category_routings).
window.byupRoutingOccupato = function (escludiId) {
  const prese = new Map();
  window.byupStampantiComande().forEach(d => { if (d.id !== escludiId) (d.routing || []).forEach(k => prese.set(k, d.name)); });
  return prese;
};
// ─── La coda (print_jobs) ───────────────────────────────────────────────────
// Accodare è vero, l'esito è simulato: il server che risponde al sondaggio
// della stampante non esiste nel prototipo. `payload_format: 'html'` è finzione
// dichiarata — nel prodotto lo stesso foglio esce in tre dialetti.
window.byupPrintJobAccoda = function (job) {
  const reg = window.byupReadStampanti();
  const j = Object.assign({ id: 'pj-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), status: 'queued', attempts: 0, queued_at: new Date().toISOString(), payload_format: 'html' }, job);
  reg.print_jobs = [j, ...(reg.print_jobs || [])].slice(0, 50);
  window.byupWriteStampanti(reg); return j;
};
window.byupPrintJobPatch = function (jobId, patch) {
  const reg = window.byupReadStampanti();
  reg.print_jobs = (reg.print_jobs || []).map(j => j.id === jobId ? Object.assign({}, j, patch) : j);
  window.byupWriteStampanti(reg); return reg;
};
// Il lavoro si ANNULLA quando si ripiega sul browser (caso 3.4). Non è un
// dettaglio: se restasse in coda, la stampante che torna su mezz'ora dopo lo
// ritira e sputa un secondo foglio per un cliente che se n'è andato.
window.byupPrintJobAnnulla = function (jobId) {
  return window.byupPrintJobPatch(jobId, { status: 'canceled', canceled_at: new Date().toISOString() });
};
// Le comande rimaste in coda su una stampante muta SCADONO (caso 3.6): la
// cucina in quel momento lavora dallo schermo, e la carta che esce dopo è
// peggio della carta che non esce — sono comande di piatti già serviti.
window.byupPrintJobsScadi = function (deviceId) {
  const reg = window.byupReadStampanti();
  const ora = new Date().toISOString();
  reg.print_jobs = (reg.print_jobs || []).map(j => (j.device_id === deviceId && (j.status === 'queued' || j.status === 'claimed'))
    ? Object.assign({}, j, { status: 'expired', expires_at: ora }) : j);
  window.byupWriteStampanti(reg); return reg;
};
window.byupPrintJobSimula = function (jobId, cb) {
  const passo = (status, extra, dopo) => setTimeout(() => {
    const reg = window.byupReadStampanti();
    reg.print_jobs = (reg.print_jobs || []).map(j => j.id === jobId ? Object.assign({}, j, { status }, extra || {}) : j);
    window.byupWriteStampanti(reg);
    if (dopo) dopo();
  }, 700);
  // Lo stato della stampante si legge al SONDAGGIO, non all'accodamento: fra
  // il momento in cui si manda e quello in cui lei viene a prendere passano
  // dei secondi, ed è in quei secondi che la carta finisce o la spina si
  // stacca. L'errore si scopre dopo, e la fascia nasce dallo stato della coda,
  // non dal gesto dell'invio.
  passo('claimed', { attempts: 1, claimed_at: new Date().toISOString() }, () => {
    const reg = window.byupReadStampanti();
    const job = (reg.print_jobs || []).find(j => j.id === jobId);
    const dev = job && reg.devices.find(d => d.id === job.device_id);
    const inLinea = !!(dev && dev.connection_status === 'online');
    passo(inLinea ? 'confirmed' : 'failed', inLinea ? { confirmed_at: new Date().toISOString() } : { last_error_code: 'offline', last_error_at: new Date().toISOString() }, () => cb && cb(inLinea ? 'ok' : 'failed'));
  });
};

// ─── Le postazioni aperte: quante ne sono, e con quali permessi ─────────────
// Serve al ripiego dei documenti (caso 3.3): il foglio si stampa da un
// gestionale aperto su schermo largo o su tablet, mai su telefono, e da un
// utente che abbia i permessi da Cassa. Se una postazione così è aperta in un
// posto solo la finestra di stampa si apre da sola lì; se ne sono aperte due o
// più non decidiamo noi — compare la fascia, e la prende chi è davvero al
// banco.
// Nel prototipo «le postazioni aperte» sono le schede del gestionale aperte in
// questo browser: ognuna si annuncia in localStorage ogni pochi secondi e le
// righe vecchie decadono. È una finzione dichiarata, ma il comportamento che
// mostra è quello vero — con due schede aperte compare la fascia, con una sola
// la stampa parte da sé.
const PN_POSTAZIONI_KEY = 'byup_postazioni';
const PN_POSTAZIONE_TTL = 14000;
const pnPostazioneId = (() => {
  let id = '';
  try { id = sessionStorage.getItem('byup_postazione_id') || ''; } catch (e) {}
  if (!id) { id = 'pz-' + Math.random().toString(36).slice(2, 9); try { sessionStorage.setItem('byup_postazione_id', id); } catch (e) {} }
  return id;
})();
const pnLeggiPostazioni = () => {
  try {
    const v = JSON.parse(localStorage.getItem(PN_POSTAZIONI_KEY) || '{}');
    const ora = Date.now();
    return Object.values(v).filter(p => p && ora - p.at < PN_POSTAZIONE_TTL);
  } catch (e) { return []; }
};
// Idonea: non è un telefono, e chi la guarda ha i permessi da Cassa.
window.byupPostazioneIdonea = function () {
  let classe = 'desktop';
  try { classe = document.documentElement.getAttribute('data-pn-device') || 'desktop'; } catch (e) {}
  const puo = window.pnPuo ? window.pnPuo('vendita') : true;
  return classe !== 'phone' && !!puo;
};
window.byupPostazioniIdonee = () => pnLeggiPostazioni().filter(p => p.idonea);
window.byupPostazioneId = () => pnPostazioneId;
(function pnAnnunciaPostazione() {
  if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;
  const scrivi = () => {
    try {
      const v = JSON.parse(localStorage.getItem(PN_POSTAZIONI_KEY) || '{}');
      const ora = Date.now();
      Object.keys(v).forEach(k => { if (ora - (v[k] || {}).at > PN_POSTAZIONE_TTL) delete v[k]; });
      v[pnPostazioneId] = { id: pnPostazioneId, at: ora, idonea: window.byupPostazioneIdonea(),
        pagina: (document.title || '').replace(/^byup\s*/i, '') };
      localStorage.setItem(PN_POSTAZIONI_KEY, JSON.stringify(v));
    } catch (e) {}
  };
  const chiudi = () => {
    try {
      const v = JSON.parse(localStorage.getItem(PN_POSTAZIONI_KEY) || '{}');
      delete v[pnPostazioneId];
      localStorage.setItem(PN_POSTAZIONI_KEY, JSON.stringify(v));
    } catch (e) {}
  };
  scrivi();
  setInterval(scrivi, 5000);
  window.addEventListener('pagehide', chiudi);
  window.addEventListener('beforeunload', chiudi);
})();

// ─── Le richieste di stampa dal browser (il ripiego, caso 3.3) ──────────────
// Quando il documento non può uscire da una stampante collegata e i gestionali
// aperti sono più d'uno, non scegliamo noi da quale schermo esce: la richiesta
// si affaccia su tutti, e la prende chi è davvero al banco. Nel momento in cui
// uno stampa la richiesta sparisce da tutti gli schermi insieme, così non
// escono due fogli; se non la prende nessuno sparisce da sola dopo qualche
// minuto, perché a quel punto il cliente se n'è andato e un foglio che esce
// dopo è carta buttata.
// Queste richieste NON lasciano voce in Profilo → Notifiche: in un locale
// senza stampante comparirebbero a ogni pagamento con carta e riempirebbero
// l'archivio di righe morte.
const PN_RICHIESTE_KEY = 'byup_stampa_richieste';
const PN_RICHIESTA_VITA = 4 * 60 * 1000;
const pnRichiesteRaw = () => {
  try { return JSON.parse(localStorage.getItem(PN_RICHIESTE_KEY) || '[]'); } catch (e) { return []; }
};
const pnRichiesteScrivi = (lista) => {
  try { localStorage.setItem(PN_RICHIESTE_KEY, JSON.stringify(lista)); } catch (e) {}
  window.dispatchEvent(new Event('byup-stampa-richieste'));
};
window.byupRichiesteStampa = function () {
  const ora = Date.now();
  return pnRichiesteRaw().filter(r => !r.presa_da && ora < r.scade_at);
};
window.byupRichiestaStampaCrea = function (richiesta) {
  const ora = Date.now();
  const r = Object.assign({ id: 'rs-' + ora.toString(36) + Math.random().toString(36).slice(2, 5), creata_at: ora, scade_at: ora + PN_RICHIESTA_VITA, presa_da: null }, richiesta);
  pnRichiesteScrivi([r, ...pnRichiesteRaw().filter(x => ora < x.scade_at)].slice(0, 10));
  return r;
};
// Prendere una richiesta: si marca PRIMA (così sparisce dagli altri schermi) e
// poi si stampa. Ritorna l'esito della stampa dal browser.
window.byupRichiestaStampaPrendi = function (id) {
  const r = pnRichiesteRaw().find(x => x.id === id);
  if (!r || r.presa_da) return { esito: 'gia_presa' };
  pnRichiesteScrivi(pnRichiesteRaw().map(x => x.id === id ? Object.assign({}, x, { presa_da: pnPostazioneId, presa_at: Date.now() }) : x));
  const layout = r.tipo === 'preconto' ? window.byupLayoutPreconto : window.byupLayoutCortesia;
  return window.byupStampaBrowser(layout(Object.assign({}, r.conto)));
};

// ─── Da dove esce il documento del cliente ──────────────────────────────────
// La domanda è una sola: per l'incasso che si è appena chiuso, c'è una
// stampante collegata? Se c'è, il documento ci va in coda e ne esce da solo,
// senza finestre e senza che nessuno confermi — e vale anche quando chi
// incassa ha in mano solo il telefono in sala, perché il foglio esce al banco.
// L'ordine, e sono solo due gradini: la stampante associata a QUEL POS; se il
// POS non ne ha una, la sola stampante dei documenti se ce n'è una sola.
// Altrimenti nessuna, e chi chiama ripiega sul browser. Le due strade che
// cercavano un dispositivo «da browser» sono cadute con P-128: quel
// dispositivo non può più esistere, e una di esse faceva passare il browser
// davanti a una stampante collegata, che è l'opposto della regola.
// Con due casse e due stampanti, una cassa non ancora associata non prende una
// stampante a caso — il foglio uscirebbe dall'altra parte del locale: si
// stampa dal browser e si chiede di completare l'associazione (caso 3.5).
window.byupStampanteDelDocumento = function (posId) {
  const documenti = window.byupStampantiDocumenti();
  if (posId) {
    const sua = documenti.find(d => (d.pos_ids || []).includes(posId));
    if (sua) return sua;
  }
  if (documenti.length === 1) return documenti[0];
  return null;
};
// Vero quando il POS non è associato e le stampanti dei documenti sono più
// d'una: è il caso 3.5, e la schermata deve chiedere di completare
// l'associazione invece di lasciar credere a un guasto.
window.byupPosSenzaStampante = function (posId) {
  const documenti = window.byupStampantiDocumenti();
  if (documenti.length < 2) return false;
  return !documenti.some(d => (d.pos_ids || []).includes(posId));
};
window.byupAutoPrintRicevuta = function () {
  const reg = window.byupReadStampanti();
  return !!(reg.venue_settings && reg.venue_settings.auto_print_receipt);
};
// Il ripiego sul browser, con le regole del caso 3.3. Ritorna
// { via: 'browser' | 'richiesta' | 'niente' }.
const pnRipiegoBrowser = (conto, opts) => {
  const idonee = window.byupPostazioniIdonee();
  const qui = window.byupPostazioneIdonea();
  // Un solo gestionale adatto aperto, ed è questo: la finestra di stampa si
  // apre da sola. Non con window.open — una finestra aperta senza che una
  // persona abbia appena cliccato viene bloccata dal browser — ma con un
  // riquadro nascosto dentro la pagina stessa (byupStampaBrowser).
  if (qui && idonee.length <= 1) {
    const layout = opts.tipo === 'preconto' ? window.byupLayoutPreconto : window.byupLayoutCortesia;
    const r = window.byupStampaBrowser(layout(Object.assign({}, conto)));
    return { via: r.esito === 'bloccata' ? 'bloccata' : 'browser', stampante: null };
  }
  // Nessun gestionale su schermo largo aperto: il foglio non si può stampare,
  // e va detto subito a chi sta incassando — il cliente sente «le mando la
  // ricevuta» e non resta ad aspettare una carta che non arriverà.
  if (!idonee.length) return { via: 'niente', stampante: null };
  // Due o più: la fascia, e la prende chi è davvero al banco.
  const rich = window.byupRichiestaStampaCrea({
    tipo: opts.tipo === 'preconto' ? 'preconto' : 'cortesia',
    titolo: opts.titolo || (conto && conto.tavolo) || 'Conto',
    conto: Object.assign({}, conto),
  });
  return { via: 'richiesta', stampante: null, richiesta: rich };
};
// Il documento del cliente — pre-conto o cortesia — per la strada che gli
// tocca. Ritorna { via: 'server' | 'browser' | 'richiesta' | 'niente' |
// 'bloccata', stampante, job }.
window.byupStampaDocumentoCliente = function (conto, opts = {}) {
  const dev = opts.stampante || window.byupStampanteDelDocumento(opts.posId);
  if (dev) {
    const job = window.byupPrintJobAccoda({ device_id: dev.id, requested_device_id: dev.id, document_kind: opts.tipo === 'preconto' ? 'pre_bill' : 'courtesy_receipt' });
    // Niente finestra: il documento è in coda e la stampante lo ritira. Fra il
    // tocco e la carta passano i secondi del suo sondaggio, quindi finché non
    // ha confermato il foglio STA USCENDO, non è uscito.
    window.byupPrintJobSimula(job.id, (esito) => {
      if (esito === 'ok') { if (opts.onEsito) opts.onEsito('ok', { via: 'server', stampante: dev }); return; }
      // Non ha risposto: si annulla il lavoro in coda e si ripiega sul
      // browser (caso 3.4).
      window.byupPrintJobAnnulla(job.id);
      const r = pnRipiegoBrowser(conto, opts);
      if (opts.onEsito) opts.onEsito(r.via === 'niente' ? 'niente' : r.via === 'bloccata' ? 'bloccata' : 'ripiego', r);
    });
    return { via: 'server', stampante: dev, job };
  }
  const r = pnRipiegoBrowser(conto, opts);
  if (opts.onEsito) opts.onEsito(r.via === 'niente' ? 'niente' : r.via === 'bloccata' ? 'bloccata' : r.via === 'richiesta' ? 'richiesta' : 'ok', r);
  return r;
};

// ─── I layout a 80 mm ────────────────────────────────────────────────────────
// Carta termica da 80 mm, area stampabile 72 mm (48 caratteri per riga),
// monospazio: è ciò che una termica sa fare, e il browser lo riproduce con
// @page. Niente immagini.
const PN_STAMPA_CSS = `
  @page { size: 80mm auto; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { width: 72mm; padding: 4mm; font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 11px; line-height: 1.35; color: #000; }
  .c { text-align: center; } .b { font-weight: 700; } .g { font-size: 15px; }
  .hr { border-top: 1px dashed #000; margin: 5px 0; }
  .r { display: flex; justify-content: space-between; gap: 6px; }
  .d { display: grid; grid-template-columns: 1fr 4.5em 6em; gap: 4px; }
  .d .iva { text-align: right; } .d .pr { text-align: right; }
  .sub { padding-left: 12px; }
  .tot { display: grid; grid-template-columns: 1fr 6em; gap: 4px; }
  .tot .pr { text-align: right; }
  .cat { margin: 6px 0 2px; font-weight: 700; text-transform: uppercase; }
  .mod { padding-left: 14px; } .all { font-weight: 700; }
  .nota { margin-top: 8px; font-size: 9.5px; }
  .anteprima { background: #FEF3C7; color: #78350F; padding: 6px; margin-bottom: 8px; font-size: 10px; border: 1px solid #F59E0B; }
`;
const pnEsc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pnEuro = (n) => '€ ' + (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).replace('.', ',');
const pnOra = (d) => { const x = d ? new Date(d) : new Date(); return x.toLocaleDateString('it-IT') + ' ' + x.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); };
// Il nome del locale in testa alla comanda: dal locale attivo, che è il
// registro condiviso della sidebar. Prima si leggeva `window.PN_LOCALE`, che
// nessun file del prototipo definisce: una strada che non portava da nessuna
// parte, sempre finita sul valore di ripiego (P-133).
const pnLocaleNome = () => {
  try { const l = window.byupReadLocale && window.byupReadLocale(); if (l && l.nome) return l.nome; } catch (e) {}
  try { const d = window.byupReadEsercente && window.byupReadEsercente(); if (d && d.insegna) return d.insegna; } catch (e) {}
  return 'Cacio e Pepe';
};

// ─── La forma del documento commerciale (layout standard dell'Agenzia) ──────
// Fonte: «DOCUMENTO COMMERCIALE DI VENDITA O PRESTAZIONE: LAYOUT STANDARD»
// v4, agenziaentrate.gov.it. Da lì vengono le colonne (DESCRIZIONE · IVA ·
// Prezzo(€)), la riga della quantità scritta sotto la voce come «n.2 * 3,00»,
// lo sconto come riga figlia, l'ordine dei totali (Subtotale, TOTALE
// COMPLESSIVO, di cui IVA), i nomi esatti delle forme di pagamento e la
// chiusura con data «gg-mm-aaaa hh:mm» e «DOCUMENTO N. 0000-0000».
// Due prescrizioni di risparmio carta stanno nella stessa fonte e valgono
// qui: mai più di una riga vuota di seguito, e i campi del resto e delle
// forme di pagamento non si stampano quando valgono zero — «Importo pagato»
// invece si stampa sempre.
//
// ATTENZIONE, ed è il motivo per cui questi mattoni stanno qui e non in un
// «layout dello scontrino»: quello che esce da questa stampante NON è mai un
// documento commerciale. Il documento commerciale lo emette il canale
// fiscale e va all'Agenzia da solo (D-108). Pre-conto e cortesia prendono in
// prestito la FORMA — le stesse colonne, le stesse parole, la stessa
// leggibilità — perché il cliente le riconosce, e dichiarano in testa che
// documento fiscale non sono. Copiarne anche la testata sarebbe un documento
// commerciale apparente, e non si fa.
const pnNum = (n) => (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).replace('.', ',');
const pnDueCifre = (n) => String(n).padStart(2, '0');
// La data come la scrive il layout: 02-06-2020 19:10.
const pnDataDoc = (d) => {
  const x = d ? new Date(d) : new Date();
  return `${pnDueCifre(x.getDate())}-${pnDueCifre(x.getMonth() + 1)}-${x.getFullYear()} ${pnDueCifre(x.getHours())}:${pnDueCifre(x.getMinutes())}`;
};
// L'aliquota della riga: quella congelata sulla riga d'ordine se c'è,
// altrimenti quella che discende da tipologia × modo di consumo (P-108).
// Senza né l'una né l'altra vale la somministrazione, che è il caso del
// locale: al banco o al tavolo tutto sta al 10% (voce 121).
const pnRigaIva = (r, asporto) => {
  if (r.iva != null) return Number(r.iva);
  if (r.tipologia && window.pnTipologiaAliquota) return window.pnTipologiaAliquota(r.tipologia, !!asporto);
  return 10;
};
// Le righe della merce: voce, aliquota, prezzo della riga; la quantità sotto,
// come nel layout, e solo quando c'è più di un pezzo.
const pnDocRighe = (righe, asporto) => (righe || []).map(r => {
  const qty = r.qty || 1;
  const unitario = r.prezzo || 0;
  return `<div class="d"><span>${pnEsc(r.nome)}</span><span class="iva">${pnNum(pnRigaIva(r, asporto)).replace(',00', '')}%</span><span class="pr">${pnNum(unitario * qty)}</span></div>` +
    (qty > 1 ? `<div class="sub">n.${qty} * ${pnNum(unitario)}</div>` : '');
}).join('');
// I totali, nell'ordine del layout. L'IVA è quella compresa nel totale,
// aliquota per aliquota.
const pnDocTotali = (righe, totale, asporto) => {
  const tot = totale != null ? totale : (righe || []).reduce((s, r) => s + (r.prezzo || 0) * (r.qty || 1), 0);
  const iva = (righe || []).reduce((s, r) => {
    const lordo = (r.prezzo || 0) * (r.qty || 1);
    const al = pnRigaIva(r, asporto);
    return s + lordo - lordo / (1 + al / 100);
  }, 0);
  return { tot, iva: Math.round(iva * 100) / 100 };
};
// Le forme di pagamento, coi nomi del layout e la regola dello zero.
const pnDocPagamenti = (p) => {
  const v = p || {};
  const righe = [
    ['Pagamento contante', v.contante],
    ['Pagamento elettronico', v.elettronico],
    ['Non riscosso', v.non_riscosso],
    ['Resto', v.resto],
    ['Sconto a pagare', v.sconto_a_pagare],
  ].filter(([, n]) => Number(n) > 0);
  if (v.pagato == null && !righe.length) return '';
  return righe.map(([label, n]) => `<div class="tot"><span>${label}</span><span class="pr">${pnNum(n)}</span></div>`).join('')
    + `<div class="tot"><span>Importo pagato</span><span class="pr">${pnNum(v.pagato != null ? v.pagato : 0)}</span></div>`;
};
// La testata dell'esercente: le stesse cinque righe del layout, prese dai
// dati fiscali del locale.
const pnDocEsercente = () => {
  const d = (window.byupReadEsercente && window.byupReadEsercente()) || {};
  const insegna = d.insegna || pnLocaleNome();
  const via = d.indirizzo || '';
  const citta = [d.citta && `${d.citta}${d.prov ? `(${d.prov})` : ''}`, d.cap].filter(Boolean).join(', ');
  return `<div class="c">${pnEsc(insegna)}</div>` +
    (d.piva ? `<div class="c">P.I. ${pnEsc(d.piva)}</div>` : '') +
    (via ? `<div class="c">${pnEsc(via)}</div>` : '') +
    (citta ? `<div class="c">${pnEsc(citta)}</div>` : '');
};

// La comanda: UNA per stampante, con le sole righe delle sue categorie
// (category_routings); qui arriva già il pacchetto di righe da stampare,
// raggruppate per categoria e con portata, modificatori e allergeni — quel
// che la cucina deve leggere al volo.
// righe: [{ qty, name, category, course, modifiers:[{type,label}], allergen:{label}, note }]
window.byupLayoutComanda = function ({ identita, righe, quando, stampante, anteprima }) {
  const perCat = {};
  (righe || []).forEach(r => { const k = r.category || 'Altro'; (perCat[k] = perCat[k] || []).push(r); });
  const corsi = { 1: 'antipasto', 2: 'primo', 3: 'secondo', 4: 'dessert' };
  const blocchi = Object.keys(perCat).sort((a, b) => a.localeCompare(b, 'it')).map(cat => `
    <div class="cat">— ${pnEsc(cat)} —</div>
    ${perCat[cat].map(r => `
      <div class="r"><span><span class="b">${r.qty || 1}×</span> ${pnEsc(r.name)}</span>${r.course ? `<span>${corsi[r.course] || r.course}</span>` : ''}</div>
      ${(r.modifiers || []).map(m => `<div class="mod">${m.type === 'remove' ? '−' : '+'} ${pnEsc(m.label)}</div>`).join('')}
      ${r.note ? `<div class="mod">· ${pnEsc(r.note)}</div>` : ''}
      ${r.allergen ? `<div class="mod all">!! ALLERGENE: ${pnEsc(r.allergen.label || r.allergen)}</div>` : ''}
    `).join('')}`).join('');
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Comanda · ${pnEsc(identita)}</title><style>${PN_STAMPA_CSS}</style></head><body>
    ${anteprima ? `<div class="anteprima">${pnEsc(anteprima)}</div>` : ''}
    <div class="c b">${pnEsc(pnLocaleNome())}</div>
    <div class="c">COMANDA</div>
    <div class="hr"></div>
    <div class="c b g">${pnEsc(identita)}</div>
    <div class="c">${pnEsc(pnOra(quando))}</div>
    <div class="hr"></div>
    ${blocchi}
    <div class="hr"></div>
    <div class="nota">${pnEsc(stampante ? `Stampante: ${stampante}` : 'Stampa dal browser')} · Byup Fresh</div>
  </body></html>`;
};

// Il pre-conto: il documento che si porta al tavolo PRIMA del pagamento. Non
// è lo scontrino e non è il documento di cortesia: dice che cosa c'è sul
// conto e quanto fa, e che il documento commerciale arriva al pagamento.
// Prende dal layout dell'Agenzia le colonne e i totali — è la forma che il
// cliente sa leggere — e in testa dichiara che documento fiscale non è.
// righe: [{ nome, qty, prezzo, iva?, tipologia? }]
window.byupLayoutPreconto = function ({ tavolo, coperti, righe, totale, quando, stampante, anteprima, asporto }) {
  const { tot, iva } = pnDocTotali(righe, totale, asporto);
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Pre-conto</title><style>${PN_STAMPA_CSS}</style></head><body>
    ${anteprima ? `<div class="anteprima">${pnEsc(anteprima)}</div>` : ''}
    ${pnDocEsercente()}
    <div class="c b" style="margin-top:6px">PRE-CONTO</div>
    <div class="c b">NON FISCALE · non valido ai fini fiscali</div>
    <div class="hr"></div>
    <div class="r"><span>${pnEsc(tavolo || '')}${coperti ? ` · ${coperti} coperti` : ''}</span><span>${pnEsc(pnDataDoc(quando))}</span></div>
    <div class="hr"></div>
    <div class="d b"><span>DESCRIZIONE</span><span class="iva">IVA</span><span class="pr">Prezzo(&euro;)</span></div>
    ${pnDocRighe(righe, asporto)}
    <div class="hr"></div>
    <div class="tot"><span>Subtotale</span><span class="pr">${pnNum(tot)}</span></div>
    <div class="tot b g"><span>TOTALE COMPLESSIVO</span><span class="pr">${pnNum(tot)}</span></div>
    <div class="tot b"><span>di cui IVA</span><span class="pr">${pnNum(iva)}</span></div>
    <div class="hr"></div>
    <div class="nota">Il documento commerciale ai fini fiscali sarà emesso al pagamento dal canale fiscale e trasmesso all'Agenzia delle Entrate; questo foglio è un pre-conto.</div>
    <div class="nota">${pnEsc(stampante ? `Stampante: ${stampante}` : 'Stampa dal browser')} · Byup Fresh</div>
  </body></html>`;
};

// Il documento di cortesia: NON è lo scontrino. Il documento commerciale lo
// emette il canale fiscale (OpenAPI) e va all'Agenzia da solo; questo è il
// foglio che il cliente porta via dopo il pagamento, e lo dice in testa.
// Della forma ufficiale prende tutto quello che si può prendere — colonne,
// totali, nomi delle forme di pagamento — e in più richiama il documento
// vero, con la stessa formula che il layout usa per il reso: «Documento di
// riferimento: N. 0000-0000 del gg-mm-aaaa». Quello che NON prende è la
// dicitura «DOCUMENTO COMMERCIALE di vendita o prestazione»: portarla senza
// esserlo farebbe un documento commerciale apparente.
// righe: [{ nome, qty, prezzo, iva?, tipologia? }]
// pagamenti: { contante, elettronico, non_riscosso, resto, sconto_a_pagare, pagato }
// documento: { numero, quando } — il documento commerciale già emesso.
window.byupLayoutCortesia = function ({ tavolo, righe, totale, pagamento, pagamenti, documento, quando, stampante, anteprima, asporto }) {
  const { tot, iva } = pnDocTotali(righe, totale, asporto);
  // Le forme di pagamento: se arriva il dettaglio si usa quello, altrimenti
  // il vecchio `pagamento` (una parola sola) diventa la forma corrispondente.
  const pag = pagamenti || (() => {
    const testo = String(pagamento || '').toLowerCase();
    if (!testo) return { pagato: tot };
    const contante = testo.includes('contant');
    return { [contante ? 'contante' : 'elettronico']: tot, pagato: tot };
  })();
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Documento di cortesia</title><style>${PN_STAMPA_CSS}</style></head><body>
    ${anteprima ? `<div class="anteprima">${pnEsc(anteprima)}</div>` : ''}
    ${pnDocEsercente()}
    <div class="c b g" style="margin-top:6px">DOCUMENTO DI CORTESIA</div>
    <div class="c b">NON FISCALE · non valido ai fini fiscali</div>
    ${documento && documento.numero ? `<div class="c" style="margin-top:6px">Documento di riferimento:</div>
    <div class="c b">N. ${pnEsc(documento.numero)} del ${pnEsc(pnDataDoc(documento.quando || quando))}</div>` : ''}
    <div class="hr"></div>
    <div class="r"><span>${pnEsc(tavolo || '')}</span><span>${pnEsc(pnDataDoc(quando))}</span></div>
    <div class="hr"></div>
    <div class="d b"><span>DESCRIZIONE</span><span class="iva">IVA</span><span class="pr">Prezzo(&euro;)</span></div>
    ${pnDocRighe(righe, asporto)}
    <div class="hr"></div>
    <div class="tot"><span>Subtotale</span><span class="pr">${pnNum(tot)}</span></div>
    <div class="tot b g"><span>TOTALE COMPLESSIVO</span><span class="pr">${pnNum(tot)}</span></div>
    <div class="tot b"><span>di cui IVA</span><span class="pr">${pnNum(iva)}</span></div>
    <div class="hr"></div>
    ${pnDocPagamenti(pag)}
    <div class="hr"></div>
    <div class="nota">Il documento commerciale ai fini fiscali è emesso dal canale fiscale e trasmesso all'Agenzia delle Entrate; questo foglio è di cortesia.</div>
    <div class="nota">${pnEsc(stampante ? `Stampante: ${stampante}` : 'Stampa dal browser')} · Byup Fresh</div>
  </body></html>`;
};

// ─── L'invio ─────────────────────────────────────────────────────────────────
// Dal browser: il layout va in un riquadro NASCOSTO dentro la pagina e si
// chiama print(); la persona conferma nella finestra di stampa del sistema,
// sulla stampante che vuole. È tutto vero. Non si apre più una finestra con
// window.open: una finestra aperta senza che una persona abbia appena
// cliccato viene bloccata dal browser, e nel ripiego del caso 3.3 la stampa
// parte da sé, senza un clic. Verso una stampante collegata si ACCODA un
// lavoro (print_jobs) e si apre la stessa anteprima con la fascia che
// dichiara che l'esito è simulato.
window.byupStampaBrowser = function (html) {
  try {
    const f = document.createElement('iframe');
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;';
    document.body.appendChild(f);
    const d = f.contentDocument || (f.contentWindow && f.contentWindow.document);
    if (!d) { f.remove(); return { esito: 'bloccata', vero: true }; }
    d.open(); d.write(html); d.close();
    const vai = () => {
      try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) {}
      setTimeout(() => { try { f.remove(); } catch (e) {} }, 2000);
    };
    if (d.readyState === 'complete') setTimeout(vai, 120);
    else f.onload = () => setTimeout(vai, 120);
    return { esito: 'stampata', vero: true, stampante: null };
  } catch (e) { return { esito: 'bloccata', vero: true }; }
};
// L'anteprima di una comanda accodata: quella sì in una finestra, perché nasce
// sempre da un clic e serve a GUARDARE, non a stampare.
window.byupStampaAnteprima = function (html) {
  const w = window.open('', '_blank', 'width=420,height=720');
  if (!w) return { esito: 'bloccata', vero: false };
  w.document.open(); w.document.write(html); w.document.close();
  return { esito: 'anteprima', vero: false };
};
// La comanda verso una stampante di cucina: si accoda. Senza stampante (il
// pulsante nella rail del monitor di cucina) stampa dal browser, a mano —
// perché lì c'è una persona che preme.
window.byupStampaComanda = function (righe, identita, opts = {}) {
  const dev = opts.stampante || null;
  if (dev) {
    const proto = PN_PRINTER_PROTOCOLLI[dev.printer_protocol] || {};
    const job = window.byupPrintJobAccoda({ device_id: dev.id, requested_device_id: dev.id, document_kind: opts.document_kind || 'kitchen_ticket', identita, categorie: opts.categorie || [] });
    const anteprima = `Anteprima della comanda accodata per «${dev.name}» (${proto.label || dev.printer_protocol}): nel prototipo il server che risponde al sondaggio della stampante non esiste e l'esito è simulato.`;
    const html = window.byupLayoutComanda({ identita, righe, quando: opts.quando, stampante: `${dev.name} · ${dev.device_model}`, anteprima });
    const r = opts.silenzioso ? { esito: 'accodata', vero: false } : window.byupStampaAnteprima(html);
    return Object.assign(r, { job, stampante: dev.name });
  }
  const html = window.byupLayoutComanda({ identita, righe, quando: opts.quando, stampante: null, anteprima: null });
  return window.byupStampaBrowser(html);
};

// ─── L'invio di un ordine accoda le comande, per categoria ──────────────────
// È il passaggio che mancava (P-128, § 4.4): inviare un ordine cambiava uno
// stato e mostrava un messaggio, e in tutto il prototipo l'unica comanda che
// andava davvero in stampa nasceva da un pulsante sul monitor di cucina. Senza
// questo non esiste una coda di comande che possa fallire, e la fascia della
// stampante muta non ha origine.
// Una categoria sta su UNA stampante sola (category_routings), quindi ogni
// riga trova al massimo una destinazione; le righe di categorie non instradate
// non stampano e vivono sul monitor, che vede tutte le comande.
const pnNormalizza = (s) => String(s == null ? '' : s).toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
// La stampante che tiene una categoria, cercata sull'ETICHETTA: la Sala
// ragiona per nomi di categoria del menù («Dolci», «Bevande»), il registro per
// chiavi «menuId:catId». È l'etichetta a fare da ponte.
window.byupStampanteDiCategoria = function (categoria) {
  const cerca = pnNormalizza(categoria);
  if (!cerca) return null;
  const comande = window.byupStampantiComande();
  const trova = (prova) => comande.find(d => (d.routing || [])
    .some(k => prova(pnNormalizza(window.pnRoutingLabel(k)))));
  // Prima l'uguaglianza. Poi il prefisso, perché in cassa la stessa categoria
  // si chiama «Primi piatti» e nel menù «Primi»: due nomi per la stessa cosa,
  // e la comanda non deve perdersi per una parola in più.
  return trova(k => k === cerca) || trova(k => k.length > 3 && (cerca.startsWith(k) || k.startsWith(cerca))) || null;
};
// righe: [{ qty, name, category, course, modifiers, allergen, note }]
// Ritorna [{ stampante, righe, categorie, job }] — una voce per stampante.
window.byupAccodaComande = function (righe, identita, opts = {}) {
  const perStampante = new Map();
  (righe || []).forEach(r => {
    const dev = window.byupStampanteDiCategoria(r.category);
    if (!dev) return;
    if (!perStampante.has(dev.id)) perStampante.set(dev.id, { stampante: dev, righe: [], categorie: [] });
    const v = perStampante.get(dev.id);
    v.righe.push(r);
    if (v.categorie.indexOf(r.category) < 0) v.categorie.push(r.category);
  });
  const esiti = [];
  perStampante.forEach(v => {
    const r = window.byupStampaComanda(v.righe, identita, {
      stampante: v.stampante, quando: opts.quando, categorie: v.categorie, silenzioso: true,
    });
    if (r.job) window.byupPrintJobSimula(r.job.id, (esito) => {
      // Non ha risposto: la coda di quella stampante scade e la fascia nasce
      // dal lavoro fallito. Nessun ripiego: in cucina non c'è nessuno che
      // prema Stampa, e la cucina lavora dal monitor.
      if (esito !== 'ok') window.byupPrintJobsScadi(v.stampante.id);
      if (opts.onEsito) opts.onEsito(v.stampante, esito);
    });
    esiti.push(Object.assign({}, v, { job: r.job }));
  });
  return esiti;
};
// Le stampanti mute: quelle con comande fallite non ancora prese in carico.
// La fascia se ne va in tre modi, e solo tre — «Letto», una prova di stampa
// riuscita, o un'altra stampante che prende quelle categorie — e sono i tre
// controlli qui sotto.
window.byupComandeMute = function () {
  const reg = window.byupReadStampanti();
  const perDev = new Map();
  (reg.print_jobs || []).forEach(j => {
    if (j.status !== 'failed' || j.document_kind !== 'kitchen_ticket' || j.visto_at) return;
    const dev = reg.devices.find(d => d.id === j.device_id);
    if (!dev) return;
    // Le categorie di quel lavoro sono passate a un'altra stampante: il buco
    // è tappato e la fascia non ha più oggetto.
    const cat = j.categorie || [];
    const altrove = cat.length > 0 && cat.every(c => {
      const s = window.byupStampanteDiCategoria(c);
      return s && s.id !== dev.id;
    });
    if (altrove) return;
    if (!perDev.has(dev.id)) perDev.set(dev.id, { stampante: dev, categorie: [], comande: 0, jobs: [] });
    const v = perDev.get(dev.id);
    v.comande += 1;
    v.jobs.push(j.id);
    cat.forEach(c => { if (v.categorie.indexOf(c) < 0) v.categorie.push(c); });
  });
  return [...perDev.values()];
};
window.byupComandeMuteLette = function (deviceId) {
  const reg = window.byupReadStampanti();
  const ora = new Date().toISOString();
  reg.print_jobs = (reg.print_jobs || []).map(j => (j.status === 'failed' && j.document_kind === 'kitchen_ticket' && (!deviceId || j.device_id === deviceId))
    ? Object.assign({}, j, { visto_at: ora }) : j);
  window.byupWriteStampanti(reg); return reg;
};
// I documenti del cliente passano tutti dalla stessa porta: il pre-conto e la
// cortesia sono due fogli per lo stesso cliente, uno prima e uno dopo il
// pagamento, e non ha senso che escano da stampanti diverse.
window.byupStampaPreconto = function (conto, opts = {}) {
  return window.byupStampaDocumentoCliente(conto, Object.assign({}, opts, { tipo: 'preconto' }));
};
window.byupStampaCortesia = function (conto, opts = {}) {
  return window.byupStampaDocumentoCliente(conto, Object.assign({}, opts, { tipo: 'cortesia' }));
};
// La prova di stampa di una stampante di cucina: una comanda di prova in coda,
// l'esito simulato dopo il «sondaggio», e a registro last_test_print_at e
// last_test_print_result. `cb(esito)` con 'ok' | 'failed' | 'bloccata'.
window.byupProvaStampa = function (dev, cb) {
  const r = window.byupStampaComanda([
    { qty: 1, name: 'PROVA DI STAMPA', category: 'Prova', course: null, modifiers: [{ type: 'add', label: 'se leggi questo, la stampante è collegata' }] },
  ], 'Prova · ' + dev.name, { stampante: dev, document_kind: 'test_print' });
  if (!r.job) { cb && cb(r.esito); return r; }
  window.byupPrintJobSimula(r.job.id, (esito) => {
    window.byupStampantePatch(dev.id, { last_test_print_at: new Date().toISOString(), last_test_print_result: esito });
    // Una prova riuscita è uno dei tre modi in cui la fascia della stampante
    // muta se ne va: la domanda che poneva — questa stampante risponde? — ha
    // avuto risposta.
    if (esito === 'ok') window.byupComandeMuteLette(dev.id);
    cb && cb(esito);
  });
  return r;
};
// Nel prototipo non esiste un modo di far cadere davvero una stampante, e
// senza quello la fascia della stampante muta non si può nemmeno guardare.
// Questo interruttore è finzione DICHIARATA — la tessera in Integrazioni lo
// dice — e cambia solo `connection_status`, che nel prodotto lo scrive il
// server contando i sondaggi che non arrivano.
window.byupStampanteSimulaLinea = function (id, inLinea) {
  return window.byupStampantePatch(id, {
    connection_status: inLinea ? 'online' : 'offline',
    connection_checked_at: new Date().toISOString(),
  });
};
// La prova della stampa dei documenti (caso 3.8). Serve a chi stampa dal
// browser per sapere se il suo computer è messo bene: se ha una stampante
// configurata, se il margine di 80 mm viene giusto. Non è la prova di un
// dispositivo, perché un dispositivo non c'è: è la prova della STRADA. Per
// questo va dritta al browser senza passare dalla scelta della stampante, e
// non registra nulla.
window.byupProvaStampaDocumenti = function () {
  return window.byupStampaBrowser(window.byupLayoutPreconto({ tavolo: 'Prova di stampa', coperti: 2, righe: [
    { nome: 'Cacio e Pepe', qty: 2, prezzo: 13 }, { nome: 'Acqua naturale 75 cl', qty: 1, prezzo: 2.5 },
  ] }));
};
window.PN_PRINT_USI = PN_PRINT_USI;
window.PN_PRINTER_MODELLI = PN_PRINTER_MODELLI;
window.PN_PRINTER_PROTOCOLLI = PN_PRINTER_PROTOCOLLI;
window.PN_PRINT_STATI = PN_PRINT_STATI;
window.PN_MENU_CATEGORIE = PN_MENU_CATEGORIE;

// ═══════════════════════════════════════════════════════════════════════════
// LE DUE FASCE DELLA STAMPA (P-128, casi 3.3 e 3.6)
// ═══════════════════════════════════════════════════════════════════════════
// Stanno in cima a tutte le schermate del gestionale, dove già sta la fascia
// delle attivazioni, perché nascono mentre si lavora e chi deve agire non è
// detto che stia guardando la pagina in cui il fatto è successo.
//   — la fascia della STAMPANTE MUTA è pesante, a tutta larghezza: nomina la
//     stampante (in cucina possono essere due, e l'altra magari sta
//     lavorando) e le categorie che teneva (una categoria è instradata su una
//     stampante sola, quindi dire «Bevande, Dolci» dice esattamente che cosa
//     non è uscito), e rimanda al monitor. Se ne va con «Letto», con una
//     prova di stampa riuscita, o collegando un'altra stampante che prende
//     quelle categorie.
//   — la fascia dei DOCUMENTI DA STAMPARE è leggera, una riga sola con dentro
//     il pulsante: la prende chi è davvero al banco, sparisce da tutti gli
//     schermi insieme quando uno stampa, e da sola dopo qualche minuto. Non
//     lascia voce in Profilo → Notifiche: in un locale senza stampante
//     comparirebbe a ogni pagamento con carta.
const PN_FASCIA_ALERT = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);
const PN_FASCIA_PRINTER = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="9" rx="1.5"/><path d="M6 14h12v7H6z"/>
  </svg>
);
const pnElenco = (v) => v.length > 1 ? `${v.slice(0, -1).join(', ')} e ${v[v.length - 1]}` : (v[0] || '');

function PnStampaFasce() {
  const [mute, setMute] = React.useState(() => (window.byupComandeMute ? window.byupComandeMute() : []));
  const [richieste, setRichieste] = React.useState(() => (window.byupRichiesteStampa ? window.byupRichiesteStampa() : []));
  const [inStampa, setInStampa] = React.useState(null);
  React.useEffect(() => {
    const agg = () => {
      setMute(window.byupComandeMute ? window.byupComandeMute() : []);
      setRichieste(window.byupRichiesteStampa ? window.byupRichiesteStampa() : []);
    };
    const ev = ['byup-stampanti-change', 'byup-stampa-richieste', 'storage'];
    ev.forEach(e => window.addEventListener(e, agg));
    // Le richieste scadono da sole: senza un battito la riga resterebbe in
    // pagina anche dopo che il cliente se n'è andato.
    const t = setInterval(agg, 4000);
    return () => { ev.forEach(e => window.removeEventListener(e, agg)); clearInterval(t); };
  }, []);
  // Il ripiego è per chi può stampare: su un telefono, o senza i permessi
  // della Cassa, la riga non ha nessuno che possa agire.
  const puoStampare = window.byupPostazioneIdonea ? window.byupPostazioneIdonea() : true;
  const daStampare = puoStampare ? richieste : [];
  if (!mute.length && !daStampare.length) return null;

  const prendi = (r) => {
    setInStampa(r.id);
    const esito = window.byupRichiestaStampaPrendi(r.id);
    setRichieste(window.byupRichiesteStampa());
    setTimeout(() => setInStampa(null), 1200);
    return esito;
  };

  return (
    <div data-stampa-fasce style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 450,
      display: 'flex', flexDirection: 'column',
      boxShadow: (mute.length || daStampare.length) ? '0 12px 32px -16px rgba(15,17,21,0.35)' : 'none',
    }}>
      <style>{`@keyframes pnStampaGiu { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: none; } }`}</style>

      {/* La stampante muta: pesante, perché delle comande si sono perse. */}
      {mute.map(m => (
        <div key={m.stampante.id} data-fascia-muta={m.stampante.id} style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '13px 24px',
          background: '#FEF2F2', borderBottom: '1px solid #FECACA',
          animation: 'pnStampaGiu 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <span style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: '#B91C1C', color: '#fff', display: 'grid', placeItems: 'center',
          }}>{PN_FASCIA_ALERT}</span>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 15.5, fontWeight: 800, color: '#B91C1C', letterSpacing: -0.1}}>
              «{m.stampante.name}» non ha stampato {m.comande === 1 ? 'la comanda' : 'le comande'}{m.categorie.length ? `: ${pnElenco(m.categorie)}` : ''}.
            </div>
            <div style={{fontSize: 14, color: PN.TEXT, marginTop: 1, lineHeight: 1.4}}>
              Vai in Cucina per seguire gli ordini sullo schermo.
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0}}>
            <button onClick={() => { window.byupComandeMuteLette(m.stampante.id); setMute(window.byupComandeMute()); }}
              className="pn-btn-feedback" style={{
                padding: '9px 15px', borderRadius: 10, border: `1px solid ${PN.BORDER}`,
                background: PN.WHITE, color: PN.TEXT, fontSize: 14.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Letto</button>
            <a href="byup Cucina KDS v2.html" className="pn-btn-feedback" style={{
              padding: '9px 17px', borderRadius: 10, background: PN.BTN_DARK, color: PN.WHITE,
              fontSize: 14.5, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
            }}>Vai in Cucina</a>
          </div>
        </div>
      ))}

      {/* Il documento che aspetta una postazione: leggera, una riga sola. */}
      {daStampare.map(r => (
        <div key={r.id} data-fascia-documento={r.id} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '9px 24px',
          background: PN.WHITE, borderBottom: `1px solid ${PN.BORDER_SOFT}`,
          animation: 'pnStampaGiu 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <span style={{color: PN.MUTED, display: 'inline-flex', flexShrink: 0}}>{PN_FASCIA_PRINTER}</span>
          <div style={{flex: 1, minWidth: 0, fontSize: 14.5, color: PN.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            <b style={{fontWeight: 700}}>{r.titolo}</b>, {r.tipo === 'preconto' ? 'pre-conto' : 'documento di cortesia'} da stampare
          </div>
          <button onClick={() => prendi(r)} disabled={inStampa === r.id} className="pn-btn-feedback" style={{
            flexShrink: 0, padding: '7px 16px', borderRadius: 9, border: 'none',
            background: PN.BTN_DARK, color: PN.WHITE, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', opacity: inStampa === r.id ? 0.6 : 1,
          }}>{inStampa === r.id ? 'In stampa…' : 'Stampa'}</button>
        </div>
      ))}
    </div>
  );
}
window.PnStampaFasce = PnStampaFasce;
