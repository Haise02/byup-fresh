// Stampa di comande e documenti (P-124 · D-108; supera P-101).
//
// Due usi, due vie — la regola fissata sulle fonti del 3 e 4 settembre 2026
// (Epson ePOS-Print e Server Direct Print, Star CloudPRNT, W3C Mixed Content e
// Secure Contexts, WebKit su Web Bluetooth, Apple MFi, Android RFCOMM):
//   1. Le COMANDE escono soltanto da stampanti che INTERROGANO IL NOSTRO SERVER
//      (Star con CloudPRNT, Epson con Server Direct Print, sui modelli dei
//      rispettivi elenchi) oppure compaiono sul monitor di cucina. È l'unica
//      via che stampa senza una persona davanti a un dispositivo, senza un
//      dispositivo acceso nel locale e senza un terzo fra Byup e la stampante.
//   2. I DOCUMENTI — pre-conto e documento di cortesia, due documenti distinti —
//      escono dal browser della postazione, su qualunque stampante che il
//      sistema del dispositivo conosce (USB, rete o Bluetooth accoppiata a
//      livello di sistema, di qualunque marca), con la persona che conferma la
//      finestra di stampa. Non si registra nulla in Byup.
// Nessuna via passa dalla pagina web alla stampante in rete locale: il
// contenuto misto la blocca senza certificati installati a mano su ogni
// dispositivo, per ammissione dei produttori. Il ponte via App Staff e il
// Bluetooth sono rinviati oltre l'MVP (app in primo piano, MFi per il
// Bluetooth classico su iOS, un dialetto di comandi per marca); le stampanti
// che passano dal cloud di un terzo (Sunmi e simili) non sono compatibili
// finché quel terzo non è valutato come responsabile del trattamento.
//
// Qui vivono (1) il registro delle stampanti coi NOMI DEL MODELLO — devices di
// tipo printer con connection_mode `browser` | `server_polling`, device_model,
// printer_vendor, printer_protocol `cloudprnt` | `server_direct_print`,
// cloud_client_id, poll_interval_seconds, connection_status,
// connection_checked_at, last_test_print_at, last_test_print_result — con
// l'instradamento per categoria di category_routings (UNO solo: Personale e
// «Collega stampante» scrivono qui, e una categoria sta su una stampante
// sola), la coda print_jobs e venue_delivery_integrations.auto_print_courtesy;
// e (2) i layout HTML a 80 mm — comanda per categoria, pre-conto, documento di
// cortesia — che si aprono e vanno in stampa col print del browser.
//
// FINZIONE DICHIARATA. Senza backend non esistono gli endpoint CloudPRNT e
// Server Direct Print, la coda vera, i ritentativi e il ripiego
// (category_routings.fallback_device_id): il «primo contatto» della stampante,
// lo stato in linea e l'esito della prova di stampa sono simulati e lo dicono
// a schermo. La stampa dal browser è vera.
//
// Registro in localStorage (byup_stampanti): le righe toccate si fondono sul
// seme per id. Via `print_mode`, `device_type`, `model`, `bridge_device_id`,
// `ip`, `protocol`, ePOS e WebPRNT: nomi che il modello non ha.

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

const pnIsoFa = (sec) => new Date(Date.now() - sec * 1000).toISOString();
// Il seme: la base dal browser (sempre) e due stampanti di cucina che
// interrogano il server, una per protocollo. Gli stati «in linea» sono seme.
const pnStampantiSeme = () => ({
  devices: [
    { id: 'prn-browser', type: 'printer', name: 'Questa postazione', device_model: 'Stampante di sistema', printer_vendor: 'other',
      connection_mode: 'browser', printer_protocol: null, cloud_client_id: null, connection_status: null, connection_checked_at: null,
      routing: [], fisso: true, last_test_print_at: null, last_test_print_result: null },
    { id: 'prn-1', type: 'printer', name: 'Cucina', device_model: 'TSP143IV', printer_vendor: 'star',
      connection_mode: 'server_polling', printer_protocol: 'cloudprnt', cloud_client_id: '00:11:62:4F:A3:9C', poll_interval_seconds: 5,
      connection_status: 'online', connection_checked_at: pnIsoFa(9), venue_id: 'cp',
      routing: ['principale:antipasti', 'principale:primi', 'principale:secondi'], last_test_print_at: pnIsoFa(2 * 86400 + 3600), last_test_print_result: 'ok' },
    { id: 'prn-2', type: 'printer', name: 'Bar', device_model: 'TM-m30III', printer_vendor: 'epson',
      connection_mode: 'server_polling', printer_protocol: 'server_direct_print', cloud_client_id: 'cp-bar-01', poll_interval_seconds: 5,
      connection_status: 'online', connection_checked_at: pnIsoFa(4), venue_id: 'cp',
      routing: ['principale:bevande', 'principale:dolci'], last_test_print_at: null, last_test_print_result: null },
  ],
  print_jobs: [],
  venue_delivery_integrations: { auto_print_courtesy: false },
});
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
      .concat((salvato.devices || []).filter(d => !seme.devices.some(x => x.id === d.id)));
    return { devices, rimossi: [...rimossi], print_jobs: salvato.print_jobs || [],
      venue_delivery_integrations: Object.assign({}, seme.venue_delivery_integrations, salvato.venue_delivery_integrations || {}) };
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
window.byupStampanteAggiungi = function (dev) {
  const reg = window.byupReadStampanti();
  reg.devices = [...reg.devices, dev];
  window.byupWriteStampanti(reg); return dev;
};
window.byupStampanteRimuovi = function (id) {
  const reg = window.byupReadStampanti();
  reg.devices = reg.devices.filter(d => d.id !== id);
  reg.rimossi = [...new Set([...(reg.rimossi || []), id])];
  window.byupWriteStampanti(reg); return reg;
};
// Le stampanti delle comande: quelle che interrogano il server.
window.byupStampantiComande = () => window.byupReadStampanti().devices.filter(d => d.connection_mode === 'server_polling');
// Le chiavi «menuId:catId» già instradate su altre stampanti: una categoria
// sta su una stampante sola (category_routings).
window.byupRoutingOccupato = function (escludiId) {
  const prese = new Map();
  window.byupStampantiComande().forEach(d => { if (d.id !== escludiId) (d.routing || []).forEach(k => prese.set(k, d.name)); });
  return prese;
};
// La coda (print_jobs): accodare è vero, l'esito è simulato — il server che
// risponde al sondaggio della stampante non esiste nel prototipo.
window.byupPrintJobAccoda = function (job) {
  const reg = window.byupReadStampanti();
  const j = Object.assign({ id: 'pj-' + Date.now().toString(36), status: 'queued', attempts: 0, queued_at: new Date().toISOString(), payload_format: 'html' }, job);
  reg.print_jobs = [j, ...(reg.print_jobs || [])].slice(0, 50);
  window.byupWriteStampanti(reg); return j;
};
window.byupPrintJobSimula = function (jobId, cb) {
  const passo = (status, extra, dopo) => setTimeout(() => {
    const reg = window.byupReadStampanti();
    reg.print_jobs = (reg.print_jobs || []).map(j => j.id === jobId ? Object.assign({}, j, { status }, extra || {}) : j);
    window.byupWriteStampanti(reg);
    if (dopo) dopo();
  }, 700);
  const reg = window.byupReadStampanti();
  const job = (reg.print_jobs || []).find(j => j.id === jobId);
  const dev = job && reg.devices.find(d => d.id === job.device_id);
  const inLinea = !!(dev && dev.connection_status === 'online');
  passo('claimed', { attempts: 1, claimed_at: new Date().toISOString() }, () =>
    passo(inLinea ? 'confirmed' : 'failed', inLinea ? { confirmed_at: new Date().toISOString() } : { last_error_code: 'offline', last_error_at: new Date().toISOString() }, () => cb && cb(inLinea ? 'ok' : 'failed')));
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
  .cat { margin: 6px 0 2px; font-weight: 700; text-transform: uppercase; }
  .mod { padding-left: 14px; } .all { font-weight: 700; }
  .nota { margin-top: 8px; font-size: 9.5px; }
  .anteprima { background: #FEF3C7; color: #78350F; padding: 6px; margin-bottom: 8px; font-size: 10px; border: 1px solid #F59E0B; }
`;
const pnEsc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pnEuro = (n) => '€ ' + (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).replace('.', ',');
const pnOra = (d) => { const x = d ? new Date(d) : new Date(); return x.toLocaleDateString('it-IT') + ' ' + x.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); };
const pnLocaleNome = () => (window.PN_LOCALE && window.PN_LOCALE.nome) || 'Cacio e Pepe';

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

// Il pre-conto: il documento che si porta al tavolo PRIMA del pagamento. Non è
// lo scontrino e non è il documento di cortesia: dice che cosa c'è sul conto
// e quanto fa, e che il documento commerciale arriva al pagamento.
// righe: [{ nome, qty, prezzo }]
window.byupLayoutPreconto = function ({ tavolo, coperti, righe, totale, quando, stampante, anteprima }) {
  const tot = totale != null ? totale : (righe || []).reduce((s, r) => s + (r.prezzo || 0) * (r.qty || 1), 0);
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Pre-conto</title><style>${PN_STAMPA_CSS}</style></head><body>
    ${anteprima ? `<div class="anteprima">${pnEsc(anteprima)}</div>` : ''}
    <div class="c b">${pnEsc(pnLocaleNome())}</div>
    <div class="c b g">PRE-CONTO</div>
    <div class="c b">NON FISCALE · non valido ai fini fiscali</div>
    <div class="hr"></div>
    <div class="r"><span>${pnEsc(tavolo || '')}${coperti ? ` · ${coperti} coperti` : ''}</span><span>${pnEsc(pnOra(quando))}</span></div>
    <div class="hr"></div>
    ${(righe || []).map(r => `<div class="r"><span>${r.qty || 1}× ${pnEsc(r.nome)}</span><span>${pnEuro((r.prezzo || 0) * (r.qty || 1))}</span></div>`).join('')}
    <div class="hr"></div>
    <div class="r b g"><span>TOTALE</span><span>${pnEuro(tot)}</span></div>
    <div class="hr"></div>
    <div class="nota">Il documento commerciale ai fini fiscali sarà emesso al pagamento dal canale fiscale e trasmesso all'Agenzia delle Entrate; questo foglio è un pre-conto.</div>
    <div class="nota">${pnEsc(stampante ? `Stampante: ${stampante}` : 'Stampa dal browser')} · Byup Fresh</div>
  </body></html>`;
};

// Il documento di cortesia: NON è lo scontrino. Il documento commerciale lo
// emette il canale fiscale (OpenAPI); questo è il foglio che il cliente porta
// via dopo il pagamento, e lo dice in testa.
// righe: [{ nome, qty, prezzo }]
window.byupLayoutCortesia = function ({ tavolo, righe, totale, pagamento, quando, stampante, anteprima }) {
  const tot = totale != null ? totale : (righe || []).reduce((s, r) => s + (r.prezzo || 0) * (r.qty || 1), 0);
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Documento di cortesia</title><style>${PN_STAMPA_CSS}</style></head><body>
    ${anteprima ? `<div class="anteprima">${pnEsc(anteprima)}</div>` : ''}
    <div class="c b">${pnEsc(pnLocaleNome())}</div>
    <div class="c b g">DOCUMENTO DI CORTESIA</div>
    <div class="c b">NON FISCALE · non valido ai fini fiscali</div>
    <div class="hr"></div>
    <div class="r"><span>${pnEsc(tavolo || '')}</span><span>${pnEsc(pnOra(quando))}</span></div>
    <div class="hr"></div>
    ${(righe || []).map(r => `<div class="r"><span>${r.qty || 1}× ${pnEsc(r.nome)}</span><span>${pnEuro((r.prezzo || 0) * (r.qty || 1))}</span></div>`).join('')}
    <div class="hr"></div>
    <div class="r b g"><span>TOTALE</span><span>${pnEuro(tot)}</span></div>
    ${pagamento ? `<div class="r"><span>Pagamento</span><span>${pnEsc(pagamento)}</span></div>` : ''}
    <div class="hr"></div>
    <div class="nota">Il documento commerciale ai fini fiscali è emesso dal canale fiscale e trasmesso all'Agenzia delle Entrate; questo foglio è di cortesia.</div>
    <div class="nota">${pnEsc(stampante ? `Stampante: ${stampante}` : 'Stampa dal browser')} · Byup Fresh</div>
  </body></html>`;
};

// ─── L'invio ─────────────────────────────────────────────────────────────────
// Dal browser: si apre una finestra col layout e si chiama print(); la persona
// conferma nella finestra di stampa del sistema, sulla stampante che vuole. È
// tutto vero. Verso una stampante che interroga il server si ACCODA un lavoro
// (print_jobs) e si apre la stessa anteprima con la fascia che dichiara che
// l'esito è simulato. Ritorna cosa ha fatto, per i toast e per le prove.
window.byupStampaBrowser = function (html) {
  const w = window.open('', '_blank', 'width=420,height=720');
  if (!w) return { esito: 'bloccata', vero: true };
  w.document.open(); w.document.write(html); w.document.close();
  try { w.focus(); setTimeout(() => { try { w.print(); } catch (e) {} }, 250); } catch (e) {}
  return { esito: 'stampata', vero: true, stampante: null };
};
window.byupStampaAnteprima = function (html) {
  const w = window.open('', '_blank', 'width=420,height=720');
  if (!w) return { esito: 'bloccata', vero: false };
  w.document.open(); w.document.write(html); w.document.close();
  return { esito: 'anteprima', vero: false };
};
// La comanda: verso una stampante di cucina si accoda; senza stampante (il
// pulsante nella rail del monitor di cucina) stampa dal browser, a mano.
window.byupStampaComanda = function (righe, identita, opts = {}) {
  const dev = opts.stampante || null;
  if (dev && dev.connection_mode === 'server_polling') {
    const proto = PN_PRINTER_PROTOCOLLI[dev.printer_protocol] || {};
    const job = window.byupPrintJobAccoda({ device_id: dev.id, requested_device_id: dev.id, document_kind: opts.document_kind || 'kitchen_ticket', identita });
    const anteprima = `Anteprima della comanda accodata per «${dev.name}» (${proto.label || dev.printer_protocol}): nel prototipo il server che risponde al sondaggio della stampante non esiste e l'esito è simulato.`;
    const html = window.byupLayoutComanda({ identita, righe, quando: opts.quando, stampante: `${dev.name} · ${dev.device_model}`, anteprima });
    const r = window.byupStampaAnteprima(html);
    return Object.assign(r, { job, stampante: dev.name });
  }
  const html = window.byupLayoutComanda({ identita, righe, quando: opts.quando, stampante: null, anteprima: null });
  return window.byupStampaBrowser(html);
};
// I documenti: sempre dal browser, su qualunque stampante di sistema. Nessuna
// stampante «di cortesia della sede»: quella colonna non esiste più.
window.byupStampaPreconto = function (conto) {
  return window.byupStampaBrowser(window.byupLayoutPreconto(Object.assign({}, conto)));
};
window.byupStampaCortesia = function (conto) {
  return window.byupStampaBrowser(window.byupLayoutCortesia(Object.assign({}, conto)));
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
    cb && cb(esito);
  });
  return r;
};
// La prova della stampa dei documenti: un pre-conto di prova dal browser.
// Non si registra nulla.
window.byupProvaStampaDocumenti = function () {
  return window.byupStampaPreconto({ tavolo: 'Prova di stampa', coperti: 2, righe: [
    { nome: 'Cacio e Pepe', qty: 2, prezzo: 13 }, { nome: 'Acqua naturale 75 cl', qty: 1, prezzo: 2.5 },
  ] });
};
window.PN_PRINTER_MODELLI = PN_PRINTER_MODELLI;
window.PN_PRINTER_PROTOCOLLI = PN_PRINTER_PROTOCOLLI;
window.PN_PRINT_STATI = PN_PRINT_STATI;
window.PN_MENU_CATEGORIE = PN_MENU_CATEGORIE;
