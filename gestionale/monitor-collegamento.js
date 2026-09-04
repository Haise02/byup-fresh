// Il collegamento del monitor di cucina, per approvazione (P-134).
//
// Prima il monitor entrava con un nome utente e una password — del genere
// `PG1-cucina` — da digitare su un televisore appeso al muro, spesso col
// telecomando. Non è più così, e il guadagno non è solo di comodità: chiunque
// conoscesse quelle due parole apriva la cucina di quel locale da qualunque
// browser del mondo, e su quello schermo passano i nomi dei tavoli e le
// allergie dichiarate dai clienti, che sono dati sulla salute.
//
// Il gesto, per intero:
//   1. In cucina si accende il monitor e si scrive un indirizzo CORTO e
//      dedicato, `byup.it/cucina` (qui: «byup Cucina Collega.html»). Non
//      l'indirizzo del gestionale: su un televisore si scrive col telecomando,
//      e ogni carattere in più è un errore in più. Quell'indirizzo non porta a
//      una pagina di accesso, porta dritto al collegamento.
//   2. Lo schermo mostra un QR e, sotto, lo stesso codice in chiaro, del
//      genere `4KP2`: il QR per chi passa col telefono, il codice per chi in
//      quel momento è alla cassa davanti al computer. Il codice dura pochi
//      minuti e lo schermo lo rigenera da solo — un codice che resta appeso in
//      cucina tutta la sera è una porta aperta.
//   3. Sul gestionale chi conferma trova la schermata già compilata su quello
//      schermo lì, gli dà un nome e sceglie la vista. Può confermare il SOLO
//      Titolare: è un permesso, e per ora sta lì.
//   4. Il collegamento dura finché non lo si revoca. Nessuna scadenza e
//      nessuna sessione che finisce da sola: lo schermo della cucina resta
//      acceso dall'apertura alla chiusura e nessuno lo guarda per accertarsi
//      che sia ancora collegato — lo guarda per sapere cosa cucinare. Se
//      cadesse durante il servizio, nessuno se ne accorgerebbe finché non
//      smettono di arrivare comande. Si toglie da Personale, come si toglie
//      l'accesso a una persona.
//   5. Se il collegamento si perde — si svuota una cache, si cambia lo
//      schermo — il monitor torna a mostrare il codice da sé e sul gestionale
//      arriva la richiesta di riapprovarlo.
//
// Nel prototipo le due parti si parlano attraverso localStorage, che è quanto
// due schede dello stesso browser possono condividere senza un backend: nel
// prodotto è il server a tenere il codice, che vive quei pochi minuti e
// sparisce. Il codice è effimero e non ha bisogno di una colonna nel modello.

(function () {
  var CHIAVE = 'byup_monitor_richieste';
  var VITA_CODICE = 3 * 60 * 1000;   // pochi minuti, poi si rigenera
  // Niente I, O, 0 e 1: il codice si detta ad alta voce a chi sta al banco, e
  // quelle quattro si sbagliano sempre.
  var ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function leggi() {
    try { var v = JSON.parse(localStorage.getItem(CHIAVE) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function scrivi(lista) {
    try { localStorage.setItem(CHIAVE, JSON.stringify(lista)); } catch (e) {}
    try { window.dispatchEvent(new Event('byup-monitor-richieste')); } catch (e) {}
  }
  function nuovoCodice() {
    var c = '';
    for (var i = 0; i < 4; i++) c += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
    return c;
  }

  // Le richieste vive: quelle in attesa il cui codice non è ancora scaduto.
  window.byupMonitorRichieste = function () {
    var ora = Date.now();
    return leggi().filter(function (r) { return r.stato === 'attesa' && ora < r.scade_at; });
  };
  window.byupMonitorRichiestaPerCodice = function (codice) {
    var c = String(codice || '').trim().toUpperCase();
    return window.byupMonitorRichieste().find(function (r) { return r.code === c; }) || null;
  };
  // Lo schermo si annuncia: nasce una richiesta con un codice nuovo. Se ne
  // aveva già una viva la tiene, altrimenti la rigenera.
  window.byupMonitorAnnuncia = function (schermoId) {
    var ora = Date.now();
    var lista = leggi().filter(function (r) { return r.schermo_id !== schermoId && (r.stato !== 'attesa' || ora < r.scade_at); });
    var mia = leggi().find(function (r) { return r.schermo_id === schermoId && r.stato === 'attesa' && ora < r.scade_at; });
    var r = mia || { schermo_id: schermoId, code: nuovoCodice(), stato: 'attesa', at: ora, scade_at: ora + VITA_CODICE, monitor: null };
    scrivi([r].concat(lista).slice(0, 8));
    return r;
  };
  // Come sta questo schermo: in attesa col suo codice, oppure collegato al
  // monitor che il gestionale ha approvato.
  window.byupMonitorStato = function (schermoId) {
    var mia = leggi().find(function (r) { return r.schermo_id === schermoId; });
    if (!mia) return null;
    if (mia.stato === 'approvato') return mia;
    return Date.now() < mia.scade_at ? mia : null;
  };
  // L'approvazione, dal gestionale: nome e vista si danno qui, e il monitor
  // entra in elenco. Il codice muore con l'approvazione.
  window.byupMonitorApprova = function (codice, monitor) {
    var r = window.byupMonitorRichiestaPerCodice(codice);
    if (!r) return null;
    var m = {
      id: monitor && monitor.id ? monitor.id : 'mon-' + Date.now().toString(36),
      nome: (monitor && monitor.nome) || 'Kitchen Monitor',
      vista: monitor && monitor.vista === 'pub' ? 'pub' : 'ristorante',
      collegato_il: new Date().toISOString(),
    };
    scrivi(leggi().map(function (x) {
      return x.schermo_id === r.schermo_id ? Object.assign({}, x, { stato: 'approvato', monitor: m, approvato_at: Date.now() }) : x;
    }));
    if (window.byupUpsertMonitorKds) window.byupUpsertMonitorKds(m);
    return m;
  };
  // La revoca: lo schermo torna a mostrare il codice. La chiama
  // byupRimuoviMonitorKds, così togliere un monitor da Personale e
  // disconnetterlo sono lo stesso gesto.
  window.byupMonitorRevoca = function (monitorId) {
    scrivi(leggi().filter(function (r) { return !(r.monitor && r.monitor.id === monitorId); }));
  };
})();
