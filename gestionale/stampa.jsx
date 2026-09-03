// Stampa di comande e documenti di cortesia (P-101 · SFA §7.1-7.3).
//
// Il perimetro onesto di un prototipo: si costruisce ciò che si può dimostrare.
// Qui vivono (1) il registro delle stampanti della sede coi nomi del modello —
// devices di tipo printer con print_mode browser | bluetooth | wifi, il ponte
// dell'App Staff per il bluetooth, la stampante di cortesia della sede in
// venue_settings.courtesy_printer_device_id e auto_print_courtesy di
// venue_delivery_integrations — e (2) i due layout HTML a 80 mm, la comanda e
// il documento di cortesia, che si aprono e vanno in stampa col print del
// browser: è la base garantita ovunque, e nel prototipo funziona davvero.
//
// Vincoli tecnici accertati: Web Bluetooth non esiste su Safari iOS; l'invio
// diretto in LAN da una pagina web si scontra con mixed content e con
// l'assenza di TCP grezzo — la via wifi robusta è il protocollo HTTP della
// stampante (ePOS Epson, CloudPRNT Star), oppure il ponte dell'app.
//
// FINZIONE DICHIARATA. Senza backend non esistono: l'instradamento per
// categoria via WebSocket, l'invio ePOS o CloudPRNT alla stampante, il ponte
// bluetooth (il collegamento avviene nell'app nativa), la coda e il fallback
// di §7.3. La prova di stampa e la stampa dal browser sono il vero; in wifi e
// bluetooth la prova apre la stessa anteprima e lo dice. Gli stati «online»
// del seme sono seme. Il pezzo (4) della voce — la matrice di compatibilità
// reale, da provare sul campo (Safari iOS, Chrome Android, i modelli) — non è
// codice: resta consegna per la SFA, dove una modalità va precisata se il
// campo la smentisce.
//
// Registro in localStorage (byup_stampanti): le righe toccate si fondono sul
// seme per id, così l'App Staff (che carica questo file) può accendere il
// ponte e il gestionale lo vede. Personale elenca la stessa Epson come
// dispositivo che entra nel gestionale (accesso); qui vive la sua stampa.

const PN_STAMPANTI_KEY = 'byup_stampanti';
const PN_PRINT_MODES = {
  browser:   { label: 'Dal browser',            breve: 'Browser',   nota: 'Layout HTML e stampa nativa del browser: la base che funziona ovunque.' },
  wifi:      { label: 'Wi-Fi (HTTP della stampante)', breve: 'Wi-Fi', nota: 'ePOS (Epson) o CloudPRNT (Star): la stampante riceve via HTTP sulla rete locale.' },
  bluetooth: { label: 'Bluetooth via App Staff', breve: 'Bluetooth', nota: 'Su iPhone il Bluetooth non è raggiungibile da una pagina web: stampa il ponte dell\'App Staff.' },
};
// Il seme: i tre casi della voce. La Epson è la stessa di Personale.
const pnStampantiSeme = () => ({
  devices: [
    { id: 'prn-browser', device_type: 'printer', name: 'Questo dispositivo', model: 'Stampa dal browser', print_mode: 'browser', ip: null, protocol: null,
      bridge_device_id: null, online: true, fisso: true, categories: [], last_test_at: null },
    { id: 'prn-1', device_type: 'printer', name: 'Cassa principale', model: 'Epson TM-T20III', print_mode: 'wifi', ip: '192.168.1.101', protocol: 'epos',
      bridge_device_id: null, online: true, categories: ['antipasti', 'primi', 'dolci'], last_test_at: null },
    { id: 'prn-2', device_type: 'printer', name: 'Bar', model: 'Star TSP143IV BT', print_mode: 'bluetooth', ip: null, protocol: null,
      // bp-01 è l'iPhone 14 Pro censito in P-105 (byup_pos_censimento): il ponte.
      bridge_device_id: 'bp-01', bridge_label: 'iPhone 14 Pro · Marco Silvestri', bridge_online: true, online: true, categories: ['bevande'], last_test_at: null },
  ],
  venue_settings: { courtesy_printer_device_id: 'prn-1', auto_print_courtesy: false },
});
window.byupReadStampanti = function () {
  const seme = pnStampantiSeme();
  try {
    const s = localStorage.getItem(PN_STAMPANTI_KEY);
    if (!s) return seme;
    const salvato = JSON.parse(s);
    const perId = Object.fromEntries((salvato.devices || []).map(d => [d.id, d]));
    const devices = seme.devices.map(d => perId[d.id] ? Object.assign({}, d, perId[d.id]) : d)
      .concat((salvato.devices || []).filter(d => !seme.devices.some(x => x.id === d.id)));
    return { devices, venue_settings: Object.assign({}, seme.venue_settings, salvato.venue_settings || {}) };
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

// ─── I layout a 80 mm ────────────────────────────────────────────────────────
// Carta termica da 80 mm, area stampabile 72 mm, monospazio: è ciò che una
// termica sa fare, e il browser lo riproduce con @page. Niente immagini.
const PN_STAMPA_CSS = `
  @page { size: 80mm auto; margin: 4mm; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { width: 72mm; font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 11px; line-height: 1.35; color: #000; }
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
const pnLocaleNome = () => (window.PN_LOCALE && window.PN_LOCALE.nome) || 'Trattoria del Borgo';

// La comanda: UNA per stampante, con le sole righe delle sue categorie
// (menu_categories.printer_device_id); qui arriva già il pacchetto di righe
// da stampare, raggruppate per categoria e con portata, modificatori e
// allergeni — quel che la cucina deve leggere al volo.
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

// Il documento di cortesia: NON è lo scontrino. Il documento commerciale lo
// emette il canale fiscale (OpenAPI); questo è il foglio che il cliente porta
// via, e lo dice in testa.
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
// Dal browser: si apre una finestra col layout e si chiama print(). È tutto
// vero. In wifi e bluetooth si apre la STESSA anteprima con la fascia che
// dichiara che l'invio non parte: senza backend non c'è ePOS, CloudPRNT né
// ponte, e non si finge. Ritorna cosa ha fatto, per i toast e per le prove.
window.byupStampa = function (html, { modalita, stampante } = {}) {
  const vero = !modalita || modalita === 'browser';
  const w = window.open('', '_blank', 'width=420,height=720');
  if (!w) return { esito: 'bloccata', vero };
  w.document.open(); w.document.write(html); w.document.close();
  if (vero) { try { w.focus(); setTimeout(() => { try { w.print(); } catch (e) {} }, 250); } catch (e) {} }
  return { esito: vero ? 'stampata' : 'anteprima', vero, stampante: stampante || null };
};
window.byupStampaComanda = function (righe, identita, opts = {}) {
  const dev = opts.stampante || null;
  const modalita = dev ? dev.print_mode : 'browser';
  const anteprima = modalita === 'browser' ? null : `Anteprima di ciò che «${dev.name}» riceverebbe via ${PN_PRINT_MODES[modalita].breve}: nel prototipo l'invio non parte.`;
  const html = window.byupLayoutComanda({ identita, righe, quando: opts.quando, stampante: dev ? `${dev.name} · ${dev.model}` : null, anteprima });
  return window.byupStampa(html, { modalita, stampante: dev && dev.name });
};
window.byupStampaCortesia = function (conto, opts = {}) {
  const reg = window.byupReadStampanti();
  const dev = opts.stampante || reg.devices.find(d => d.id === reg.venue_settings.courtesy_printer_device_id) || null;
  const modalita = dev ? dev.print_mode : 'browser';
  const anteprima = modalita === 'browser' ? null : `Anteprima di ciò che «${dev.name}» riceverebbe via ${PN_PRINT_MODES[modalita].breve}: nel prototipo l'invio non parte.`;
  const html = window.byupLayoutCortesia(Object.assign({}, conto, { stampante: dev ? `${dev.name} · ${dev.model}` : null, anteprima }));
  return window.byupStampa(html, { modalita, stampante: dev && dev.name });
};
// La prova di stampa: una comanda campione sulla stampante scelta, e la data
// dell'ultima prova a registro.
window.byupProvaStampa = function (dev) {
  const esito = window.byupStampaComanda([
    { qty: 1, name: 'PROVA DI STAMPA', category: 'Prova', course: null, modifiers: [{ type: 'add', label: 'se leggi questo, la stampante è collegata' }] },
  ], 'Prova · ' + dev.name, { stampante: dev });
  window.byupStampantePatch(dev.id, { last_test_at: new Date().toISOString() });
  return esito;
};
window.PN_PRINT_MODES = PN_PRINT_MODES;
