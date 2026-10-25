// ═══════════════════════════════════════════════════════════════════════
// Panorama · dati dimostrativi (stesso account demo di Fresh: Mario Rossi,
// Cacio e Pepe · Trastevere). Numeri finti ma coerenti tra loro: i totali
// si ricavano dalle campagne, le serie giornaliere si ricavano dai totali.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const I = Pano.IMG;
  const D = (m, d, h = 0, mi = 0) => new Date(2026, m - 1, d, h, mi);
  const T = Pano.TODAY;

  const BG = {
    pesca: 'linear-gradient(135deg, #FFE7D6 0%, #FBCFE0 100%)',
    lilla: 'linear-gradient(135deg, #E9E4FF 0%, #F8D7F4 100%)',
    ghiaccio: 'linear-gradient(135deg, #DDF0FF 0%, #E8E2FF 100%)',
    crema: 'linear-gradient(135deg, #FFF3DC 0%, #FFE0CC 100%)',
    menta: 'linear-gradient(135deg, #DDF7EC 0%, #DCEBFF 100%)',
    notte: 'linear-gradient(135deg, #2A2350 0%, #5B3D8A 100%)',
  };
  Pano.BG = BG;

  const user = { nome: 'Mario', cognome: 'Rossi', email: 'mario.rossi@email.com' };
  const venues = [
    { id: 'cp', name: 'Cacio e Pepe', sede: 'Trastevere', city: 'Roma', addr: 'Via dei Giubbonari 27', role: 'Titolare', rating: 4.6, reviews: 1240, seats: 64, zone: 'Trastevere', category: 'Trattoria romana', access: true, ini: 'CP' },
    { id: 'co', name: 'Cacio e Pepe', sede: 'Ostiense', city: 'Roma', addr: 'Via Ostiense 112', role: 'Titolare', rating: 4.5, reviews: 380, seats: 48, zone: 'Ostiense', category: 'Trattoria romana', access: true, ini: 'CP' },
    { id: 'tb', name: 'Trattoria del Borgo', sede: 'Frascati', city: 'Frascati', role: 'Cameriere', access: false, ini: 'TB' },
  ];

  // Cosa si può comprare (inventario). Fase: MVP, Fase 2, Fase 3.
  const TIPI = {
    ricerca: { label: 'Ricerca in cima', short: 'Ricerca', icon: 'search', phase: 'mvp', price: 'da € 0,30 a tocco', desc: 'Primo risultato quando cercano un piatto o un locale come il tuo. Etichetta «Sponsorizzato».', quality: null },
    evento: { label: 'Eventi in evidenza', short: 'Evento', icon: 'ticket', phase: 'mvp', price: 'da € 0,40 a tocco', desc: 'La tua serata nel carosello degli eventi e delle serate a tema.', quality: null },
    offerta: { label: 'Offerta flash', short: 'Offerta', icon: 'zap', phase: 'mvp', price: 'da € 0,35 a tocco', desc: 'Promo a tempo con conto alla rovescia. Chi ti ha salvato la ritrova nella Posta dell’app.', quality: null },
    // Le notifiche sono due prodotti diversi, con due schermate (Nilo, 25 ottobre):
    // la push suona sul telefono e si vince all'asta; quella in app sta nella Posta
    // dell'app e si prenota a prezzo fisso.
    push: { label: 'Notifica push all’asta', short: 'Push', icon: 'push', phase: 'mvp', price: 'all’asta · da € 5', desc: 'Il tuo locale scritto nella push che arriva sul telefono di chi è in zona, tra i primi tre. Si vince all’asta, fino a 15 minuti prima dell’invio.', quality: null },
    inapp: { label: 'Notifica in app', short: 'In app', icon: 'inbox', phase: 'mvp', price: 'da € 5 al giorno', desc: 'Il tuo messaggio nella Posta dell’app, tra le «Promo per te» di chi è in zona. Non suona: lo legge chi apre l’app. Prezzo fisso, si prenota.', quality: null },
    perte: { label: 'Consigliati «Per te»', short: 'Per te', icon: 'heart', phase: 'f2', price: 'da € 0,45 a tocco', desc: 'Uno slot nelle liste della home, a chi ha gusti simili ai tuoi clienti.', quality: 'Voto ≥ 4,2 e almeno 8 foto' },
    mappa: { label: 'Mappa e categorie', short: 'Mappa', icon: 'map', phase: 'f2', price: 'da € 3 al giorno', desc: 'Pin evidenziato sulla mappa e banner nella categoria «Trattorie».', quality: 'Profilo completo al 100%' },
    piatto: { label: 'Piatto in evidenza', short: 'Piatto', icon: 'cutlery', phase: 'f2', price: 'da € 0,35 a tocco', desc: 'Spingi un piatto del menù, non solo il locale: foto, prezzo, «Ordina» o «Prenota».', quality: 'Foto del piatto approvata' },
    // Promuovi in un tap: solo dentro la tua vetrina. Non è una campagna e non tocca
    // gli spazi a contesa dell'app (quelli si comprano con «Nuova campagna»).
    vetrina: { label: 'In evidenza in vetrina', short: 'Vetrina', icon: 'store', phase: 'mvp', price: '€ 2 al giorno', desc: 'Un piatto o un evento in cima alla tua vetrina, per chi apre il locale. Prezzo fisso, si attiva in un tocco.', quality: null },
  };
  const VETRINA_DAY = 2; // € al giorno, prezzo fisso (da decidere: segnaposto del prototipo)

  const OBIETTIVI = [
    { id: 'prenotazioni', label: 'Più prenotazioni', icon: 'calendar', desc: 'Tavoli prenotati con byup nei prossimi giorni.', phase: 'mvp', yieldPerEur: 0.38, reachPerEur: 70 },
    { id: 'riempi', label: 'Riempi la sala stasera', icon: 'cutlery', desc: 'Per le sere con tanti posti liberi: push di zona più ricerca.', phase: 'mvp', yieldPerEur: 0.72, reachPerEur: 230 },
    { id: 'pranzi', label: 'Più pranzi', icon: 'sun', desc: 'Coperti a pranzo nei giorni feriali.', phase: 'mvp', yieldPerEur: 0.42, reachPerEur: 80 },
    { id: 'evento', label: 'Far conoscere un evento', icon: 'ticket', desc: 'Una serata, una partita, una degustazione.', phase: 'mvp', yieldPerEur: 0.3, reachPerEur: 110 },
    { id: 'offerta', label: 'Spingere un’offerta', icon: 'zap', desc: 'Una promo a tempo, con conto alla rovescia.', phase: 'mvp', yieldPerEur: 0.45, reachPerEur: 95 },
    { id: 'delivery', label: 'Più delivery', icon: 'route', desc: 'Ordini da asporto e consegna dall’app.', phase: 'f2', yieldPerEur: 0.3, reachPerEur: 70 },
  ];

  const TEMPLATE = [
    { id: 'compleanno', label: 'Compleanno', icon: 'gift' },
    { id: 'natale', label: 'Natale', icon: 'star' },
    { id: 'capodanno', label: 'Capodanno', icon: 'party' },
    { id: 'derby', label: 'Derby', icon: 'flag' },
    { id: 'aperitivo', label: 'Aperitivo', icon: 'glass' },
  ];

  // Dal gestionale Fresh: menù (con foto), eventi, offerte
  const MENU = [
    { id: 'm1', name: 'Carbonara', price: 14, img: I.carbonara, bg: BG.pesca, cat: 'Primi' },
    { id: 'm2', name: 'Tagliere romano', price: 16, img: I.tagliere, bg: BG.crema, cat: 'Antipasti' },
    { id: 'm3', name: 'Bruschette miste', price: 8, img: I.bruschette, bg: BG.pesca, cat: 'Antipasti' },
    { id: 'm4', name: 'Polpo e patate', price: 18, img: I.polpo, bg: BG.ghiaccio, cat: 'Secondi' },
    { id: 'm5', name: 'Lasagna della domenica', price: 13, img: I.lasagna, bg: BG.crema, cat: 'Primi' },
    { id: 'm6', name: 'Fritti misti', price: 9, img: I.fritto, bg: BG.crema, cat: 'Antipasti' },
    { id: 'm7', name: 'Tiramisù della casa', price: 6, img: I.tiramisu, bg: BG.lilla, cat: 'Dolci' },
    { id: 'm8', name: 'Spritz', price: 9, img: I.spritz, bg: BG.pesca, cat: 'Bevande' },
    { id: 'm9', name: 'Negroni', price: 10, img: I.negroni, bg: BG.lilla, cat: 'Bevande' },
    { id: 'm10', name: 'Calice di Cesanese', price: 6, img: I.vino, bg: BG.lilla, cat: 'Bevande' },
  ];
  const EVENTI = [
    { id: 'e1', title: 'Derby Roma–Lazio sul maxischermo', when: D(10, 25, 18, 0), img: I.tagliere, bg: BG.menta },
    { id: 'e2', title: 'Halloween in trattoria', when: D(10, 31, 20, 0), img: I.lasagna, bg: BG.notte },
    { id: 'e3', title: 'Serata vini del Lazio', when: D(11, 6, 20, 30), img: I.vino, bg: BG.lilla },
  ];
  // Cosa si può mettere in evidenza nella vetrina (dal menù e dagli eventi di Fresh)
  const VETRINA = {
    piatti: [
      { kind: 'piatto', id: 'm1', title: 'Carbonara', price: 14, photo: I.app.carbonara, img: I.carbonara, bg: BG.pesca, note: 'Il piatto più ordinato della settimana' },
      { kind: 'piatto', id: 'm7', title: 'Tiramisù della casa', price: 6, photo: I.app.tiramisu, img: I.tiramisu, bg: BG.lilla, note: 'Il dolce che chiudono quasi tutti' },
      { kind: 'piatto', id: 'm5', title: 'Lasagna della domenica', price: 13, photo: I.app.penne, img: I.lasagna, bg: BG.crema, note: 'Solo la domenica, fino a esaurimento' },
    ],
    eventi: [
      { kind: 'evento', id: 'e2', title: 'Halloween in trattoria', photo: I.app.notte, img: I.lasagna, bg: BG.notte, when: 'Sab 31 · 20:00', date: { month: 'OTT', day: '31' }, daysTo: 8 },
      { kind: 'evento', id: 'e3', title: 'Serata vini del Lazio', photo: I.app.vino, img: I.vino, bg: BG.lilla, when: 'Ven 6 nov · 20:30', date: { month: 'NOV', day: '6' }, daysTo: 14 },
    ],
  };
  const OFFERTE = [
    { id: 'o1', title: 'Aperitivo 2x1 fino alle 19', img: I.spritz, bg: BG.pesca },
    { id: 'o2', title: 'Pranzo di lavoro a 14 €', img: I.carbonara, bg: BG.crema },
  ];

  // ─── Campagne ───────────────────────────────────────────────────────────
  const campaigns = [
    {
      id: 'c1', name: 'Cacio e Pepe in cima', type: 'ricerca', status: 'attiva', goal: 'prenotazioni',
      subject: { kind: 'locale', title: 'Il locale' }, start: D(10, 1), end: D(10, 31), budgetDay: 12, spent: 268.4,
      reach: 18420, taps: 1106, bookings: 47, covers: 112, revenue: 2980, audience: ['vicini', 'gusti'], radiusKm: 1.5,
      keywords: ['cacio e pepe', 'carbonara', 'trattoria romana', 'cena a trastevere'],
      creative: { title: 'Cacio e Pepe · Trastevere', text: 'Pasta tirata a mano ogni mattina. Prenota in due tocchi.', img: I.carbonara, bg: BG.pesca, cta: 'Prenota', photo: I.app.carbonara },
      log: [{ at: D(10, 1, 9, 12), t: 'Controllo automatico superato: online' }, { at: D(10, 12, 18, 4), t: 'Budget portato da 10 € a 12 € al giorno' }],
    },
    {
      id: 'c2', name: 'Push Cena · Trastevere', type: 'push', status: 'attiva', goal: 'riempi',
      subject: { kind: 'locale', title: 'Il locale' }, start: D(10, 3), end: D(10, 30), budgetDay: null, spent: 212,
      reach: 14760, taps: 702, bookings: 31, covers: 74, revenue: 1990, audience: ['vicini', 'nuovi'], radiusKm: 1.2,
      creative: { title: 'Cacio e Pepe', text: 'Cacio e pepe e carbonara come a casa, a 200 m da te.', img: I.carbonara, bg: BG.pesca, cta: 'Prenota', photo: I.app.trattoria },
      next: 'stasera 20:00 · all’asta sei 2°',
      log: [{ at: D(10, 3, 11, 0), t: 'Primo posto nella push della Cena' }],
    },
    {
      id: 'c3', name: 'Derby Roma–Lazio sul maxischermo', type: 'evento', status: 'revisione', goal: 'evento',
      subject: { kind: 'evento', title: 'Derby Roma–Lazio sul maxischermo', eventId: 'e1' }, start: D(10, 22), end: D(10, 25), budgetDay: null, budgetTot: 60, spent: 0,
      reach: 0, taps: 0, bookings: 0, covers: 0, revenue: 0, audience: ['vicini'], radiusKm: 2,
      creative: { title: 'Derby sul maxischermo', text: 'Domenica alle 18: maxischermo, tagliere e birra a 15 €.', img: I.tagliere, bg: BG.menta, cta: 'Prenota', photo: I.app.pub, date: { month: 'OTT', day: '25' }, when: 'Domani · 18:00' },
      review: { at: D(10, 24, 10, 12), why: 'Cita una partita di calcio: per i marchi delle squadre serve un controllo a mano.', eta: 'di solito entro 4 ore' },
      log: [{ at: D(10, 24, 10, 12), t: 'Inviata · controllo automatico superato' }, { at: D(10, 24, 10, 13), t: 'In revisione manuale da byup' }],
    },
    {
      id: 'c4', name: 'Aperitivo 2x1 fino alle 19', type: 'offerta', status: 'correggere', goal: 'offerta',
      subject: { kind: 'offerta', title: 'Aperitivo 2x1 fino alle 19', offerId: 'o1' }, start: D(10, 29), end: D(10, 29), budgetDay: 15, spent: 0,
      reach: 0, taps: 0, bookings: 0, covers: 0, revenue: 0, audience: ['vicini', 'gusti'], radiusKm: 1,
      creative: { title: 'Aperitivo 2x1!!', text: 'Il miglior spritz di Roma: due al prezzo di uno, prima 12 € ora 6 €.', img: I.spritz, bg: BG.pesca, cta: 'Vedi l’offerta', banner: '2x1!', photo: I.app.cocktail, discount: '2x1' },
      review: {
        at: D(10, 23, 16, 40),
        reasons: [
          { field: 'img', t: 'La foto ha una scritta sopra («2x1!») che copre più di un quinto dell’immagine.' },
          { field: 'text', t: '«Il miglior spritz di Roma» non si può verificare: togli il superlativo.' },
          { field: 'text', t: 'Il prezzo barrato di 12 € non è nel menù di Fresh: lì lo spritz costa 9 €.' },
        ],
      },
      log: [{ at: D(10, 23, 16, 31), t: 'Inviata' }, { at: D(10, 23, 16, 40), t: 'Da correggere: 3 punti da sistemare' }],
    },
    {
      id: 'c5', name: 'Pranzo di lavoro a 14 €', type: 'ricerca', status: 'pausa', goal: 'pranzi',
      subject: { kind: 'offerta', title: 'Pranzo di lavoro a 14 €', offerId: 'o2' }, start: D(9, 29), end: D(10, 31), budgetDay: 6, spent: 96.2,
      reach: 6240, taps: 287, bookings: 14, covers: 31, revenue: 434, audience: ['vicini'], radiusKm: 0.8,
      keywords: ['pranzo veloce', 'menù pranzo', 'pranzo trastevere'],
      creative: { title: 'Pranzo di lavoro a 14 €', text: 'Primo, secondo e acqua. Al tavolo in 30 minuti.', img: I.carbonara, bg: BG.crema, cta: 'Prenota', photo: I.app.penne },
      paused: 'Messa in pausa da te il 20 ottobre',
      log: [{ at: D(10, 20, 15, 2), t: 'Messa in pausa da Mario Rossi' }],
    },
    {
      id: 'c6', name: 'Halloween in trattoria', type: 'evento', status: 'programmata', goal: 'evento',
      subject: { kind: 'evento', title: 'Halloween in trattoria', eventId: 'e2' }, start: D(10, 27), end: D(10, 31), budgetDay: null, budgetTot: 80, spent: 0,
      reach: 0, taps: 0, bookings: 0, covers: 0, revenue: 0, audience: ['vicini', 'nuovi'], radiusKm: 2,
      creative: { title: 'Halloween in trattoria', text: 'Menù a tema e dolcetto della casa. Sabato 31 dalle 20.', img: I.lasagna, bg: BG.notte, cta: 'Prenota', photo: I.app.notte, date: { month: 'OTT', day: '31' }, when: 'Sab 31 · 20:00' },
      log: [{ at: D(10, 22, 12, 0), t: 'Approvata · parte martedì 27 ottobre' }],
    },
    {
      id: 'c7', name: 'Ottobrata romana', type: 'offerta', status: 'conclusa', goal: 'offerta',
      subject: { kind: 'offerta', title: 'Ottobrata romana' }, start: D(10, 4), end: D(10, 12), budgetDay: 14, spent: 118,
      reach: 7900, taps: 421, bookings: 18, covers: 42, revenue: 1090, audience: ['vicini', 'gusti'], radiusKm: 1.5,
      creative: { title: 'Ottobrata romana', text: 'Tavoli fuori fino al 12: tagliere e calice a 15 €.', img: I.tagliere, bg: BG.crema, cta: 'Prenota', photo: I.app.terrazza, discount: '15 €' },
      log: [{ at: D(10, 12, 23, 59), t: 'Conclusa' }],
    },
    {
      id: 'c8', name: 'Menù del giorno', type: 'ricerca', status: 'bozza', goal: 'pranzi',
      subject: { kind: 'locale', title: 'Il locale' }, start: null, end: null, budgetDay: 8, spent: 0,
      reach: 0, taps: 0, bookings: 0, covers: 0, revenue: 0, audience: ['vicini'], radiusKm: 1,
      creative: { title: 'Menù del giorno', text: '', img: I.lasagna, bg: BG.crema, cta: 'Prenota', photo: I.app.penne },
      log: [{ at: D(10, 21, 9, 30), t: 'Bozza salvata' }],
    },
  ];

  // ─── Serie giornaliere (30 giorni, 25 set → 24 ott) ─────────────────────
  // Stagionalità settimanale tipica di una trattoria (ven/sab alti) e leggera crescita.
  const DOW_W = [0.95, 0.62, 0.66, 0.78, 0.9, 1.28, 1.35]; // dom..sab
  function series30() {
    const live = campaigns.filter((c) => c.spent > 0);
    const tot = live.reduce((a, c) => ({ spent: a.spent + c.spent, revenue: a.revenue + c.revenue, covers: a.covers + c.covers, reach: a.reach + c.reach, taps: a.taps + c.taps, bookings: a.bookings + c.bookings }), { spent: 0, revenue: 0, covers: 0, reach: 0, taps: 0, bookings: 0 });
    const r = Pano.rng(11);
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = Pano.addDays(T, -i);
      const w = DOW_W[d.getDay()] * (0.86 + (29 - i) * 0.009) * (0.9 + r() * 0.2);
      days.push({ d, w, wr: w * (0.92 + r() * 0.16) });
    }
    const sw = days.reduce((a, x) => a + x.w, 0), swr = days.reduce((a, x) => a + x.wr, 0);
    days.forEach((x) => {
      x.spent = (tot.spent * x.w) / sw;
      x.revenue = (tot.revenue * x.wr) / swr;
      x.covers = (tot.covers * x.wr) / swr;
      x.reach = (tot.reach * x.w) / sw;
      x.taps = (tot.taps * x.w) / sw;
      x.bookings = (tot.bookings * x.wr) / swr;
    });
    // oggi è a metà giornata: ne è passato ~45%
    const last = days[days.length - 1];
    last.partial = true;
    ['spent', 'revenue', 'covers', 'reach', 'taps', 'bookings'].forEach((k) => { last.full = last.full || {}; last.full[k] = last[k]; last[k] = last[k] * 0.45; });
    return { days, tot };
  }
  const S30 = series30();

  // Settimana: lun 19 → dom 25 (oggi sabato, domenica è previsione)
  function weekSeries() {
    const byKey = (d) => S30.days.find((x) => Pano.sameDay(x.d, d));
    const mon = Pano.addDays(T, -5);
    const cur = [], prev = [];
    for (let i = 0; i < 7; i++) {
      const d = Pano.addDays(mon, i);
      const x = byKey(d);
      const p = byKey(Pano.addDays(d, -7));
      if (x) cur.push({ d, revenue: x.revenue, spent: x.spent, covers: x.covers, partial: x.partial, forecast: x.partial ? x.full.revenue : null });
      else cur.push({ d, revenue: 0, spent: 0, covers: 0, future: true, forecast: (p ? p.revenue : 300) * 1.12 });
      prev.push({ d: Pano.addDays(d, -7), revenue: p ? p.revenue : 0, spent: p ? p.spent : 0, covers: p ? p.covers : 0 });
    }
    return { cur, prev };
  }
  const WEEK = weekSeries();

  // ─── Wallet ─────────────────────────────────────────────────────────────
  const wallet = {
    balance: 184.2, bonus: 20,
    auto: { on: true, under: 50, amount: 200 },
    limits: { day: 40, month: 850 },
    spentToday: 18.4, spentMonth: 694.6, alertAt: 0.8,
    method: { brand: 'Visa', last4: '4242', exp: '08/28' },
    // metodi di pagamento delle ricariche (il primo è quello di Fresh)
    methods: [
      { id: 'visa', kind: 'carta', brand: 'Visa', last4: '4242', exp: '08/28', holder: 'MARIO ROSSI', status: 'attiva', def: true, from: 'Fresh', tone: 'ink' },
      { id: 'mc', kind: 'carta', brand: 'Mastercard', last4: '8810', exp: '03/27', holder: 'CACIO E PEPE SRL', status: 'sospesa', note: 'Rifiutata il 12 ottobre: fondi insufficienti', tone: 'wine' },
      { id: 'sepa', kind: 'sepa', brand: 'SEPA', last4: '4521', iban: 'IT60 •••• •••• 4521', holder: 'CACIO E PEPE SRL', status: 'attiva', note: 'Bonifico: 2–3 giorni', tone: 'pearl' },
    ],
    movements: [
      { id: 'w1', at: D(10, 24, 13, 30), t: 'Campagne di oggi (fin qui)', kind: 'addebito', v: -18.4 },
      { id: 'w2', at: D(10, 24, 9, 2), t: 'Asta push Cena 20:00 · offerta massima € 20 (bloccata fino alle 19:45)', kind: 'blocco', v: -20 },
      { id: 'w3', at: D(10, 23, 23, 59), t: 'Campagne di venerdì', kind: 'addebito', v: -41.6 },
      { id: 'w4', at: D(10, 23, 23, 59), t: 'Tocchi non validi rimborsati (controllo anti-frode)', kind: 'rimborso', v: 3.4 },
      { id: 'w5', at: D(10, 22, 23, 59), t: 'Campagne di giovedì', kind: 'addebito', v: -36.1 },
      { id: 'w6', at: D(10, 21, 18, 12), t: 'Ricarica automatica (saldo sotto 50 €)', kind: 'ricarica', v: 200 },
      { id: 'w7', at: D(10, 21, 18, 12), t: 'Bonus ricarica', kind: 'bonus', v: 20 },
      { id: 'w8', at: D(10, 21, 23, 59), t: 'Campagne di mercoledì', kind: 'addebito', v: -30.9 },
      { id: 'w9', at: D(10, 20, 23, 59), t: 'Campagne di martedì', kind: 'addebito', v: -24.2 },
    ],
  };
  const RICARICHE = [
    { v: 50, bonus: 0 },
    { v: 100, bonus: 5 },
    { v: 200, bonus: 20, best: true },
    { v: 500, bonus: 75 },
  ];

  // ─── Push di zona ───────────────────────────────────────────────────────
  const FASCE = [
    { id: 'pranzo', label: 'Pranzo', time: '12:15', icon: 'sun' },
    { id: 'aperitivo', label: 'Aperitivo', time: '18:30', icon: 'sunset' },
    { id: 'cena', label: 'Cena', time: '20:00', icon: 'moon' },
  ];
  const CATEGORIE = ['Pizzeria', 'Sushi', 'Vineria', 'Burger', 'Bistrot', 'Trattoria', 'Pub', 'Gelateria', 'Cocktail bar'];

  // ─── Asta della push (proposta di Nilo, 25 ottobre) ─────────────────────
  // La push arriva sul telefono di chi è in zona, anche ad app chiusa. byup crea gli
  // slot (zona × giorno × fascia) e dentro ogni push ci sono 3 locali, uno per
  // categoria: i 3 posti si vincono all'asta a busta chiusa fino a 15 minuti prima
  // dell'invio. Conta offerta × qualità del locale e chi vince paga solo quanto serve
  // per superare chi lo segue (secondo prezzo), mai più della sua offerta. Il prezzo
  // minimo dipende dalle persone raggiunte (2,50 € ogni 1.000). Ogni locale vince al
  // massimo 2 push a settimana. La notifica in app è un'altra cosa (sotto, POSTA).
  const PUSH_POSTI = 3, TETTO_PUSH = 2, PER_MILLE = 2.5;
  const QUALITA = 1.15; // Cacio e Pepe: voto 4,6, foto approvate, tocchi sopra la media
  const RIVALI = [
    { name: 'Pizzeria La Fiamma', cat: 'Pizzeria' }, { name: 'Sushi Hanami', cat: 'Sushi' }, { name: 'Vineria Il Moro', cat: 'Vineria' },
    { name: 'Burger Lab', cat: 'Burger' }, { name: 'Bistrot 21', cat: 'Bistrot' }, { name: 'The Drunken Pub', cat: 'Pub' },
    { name: 'Gelateria Fata', cat: 'Gelateria' }, { name: 'Lounge 22', cat: 'Cocktail bar' },
  ];
  const minimoPer = (reach) => Math.max(5, Math.ceil((reach / 1000) * PER_MILLE * 2) / 2);
  const chiusura = (time) => { const [h, m] = time.split(':').map(Number); const t = h * 60 + m - 15; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
  const mezzo = (x) => Math.round(x * 2) / 2;
  // Chi vince e quanto paga (la stessa regola per le stime e per la chiusura)
  Pano.settleAuction = function (a, myMax) {
    const e = a.rivals.map((x) => ({ who: x.name, cat: x.cat, bid: x.bid, q: x.q, s: x.bid * x.q }));
    if (myMax) e.push({ me: true, who: 'Cacio e Pepe', cat: 'Trattoria', bid: myMax, q: QUALITA, s: myMax * QUALITA });
    e.sort((x, y) => y.s - x.s);
    const seen = new Set();
    const ok = e.filter((x) => x.bid >= a.reserve && !seen.has(x.cat) && seen.add(x.cat));
    const win = ok.slice(0, PUSH_POSTI).map((x, i) => {
      const next = ok[i + 1];
      const paid = Math.min(x.bid, Math.max(a.reserve, next ? next.s / x.q + 0.1 : a.reserve));
      return Object.assign({}, x, { pos: i + 1, paid: Math.round(paid * 100) / 100 });
    });
    const me = win.find((x) => x.me) || null;
    const rivalTrattoria = e.find((x) => !x.me && x.cat === 'Trattoria');
    // l'offerta minima per entrare (a parità di tutto il resto)
    const others = ok.filter((x) => !x.me);
    const bar = others[PUSH_POSTI - 1];
    let need = Math.max(a.reserve, bar ? bar.s / QUALITA + 0.1 : a.reserve);
    if (rivalTrattoria) need = Math.max(need, rivalTrattoria.s / QUALITA + 0.1);
    return { win, me, cut: ok[PUSH_POSTI] || null, need: Math.ceil(need * 2) / 2, offers: e.length, rivalTrattoria: !!rivalTrattoria };
  };

  function buildDigest() {
    const r = Pano.rng(42);
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const d = Pano.addDays(T, i);
      FASCE.forEach((f) => {
        const reach = Math.round((f.id === 'cena' ? 3400 : f.id === 'aperitivo' ? 2600 : 2100) * (0.9 + r() * 0.25));
        const reserve = minimoPer(reach);
        const n = f.id === 'cena' ? 4 + Math.floor(r() * 3) : 2 + Math.floor(r() * 3);
        const pool = RIVALI.slice().sort(() => r() - 0.5).slice(0, n);
        const rivals = pool.map((x) => ({ name: x.name, cat: x.cat, bid: mezzo(reserve * (1.05 + r() * 1.9)), q: Math.round((0.9 + r() * 0.25) * 20) / 20 }));
        const past = i === 0 && f.id === 'pranzo';
        const top = mezzo(Math.max(...rivals.map((x) => x.bid)));
        cells.push({ id: `${i}-${f.id}`, day: i, d, fascia: f.id, time: f.time, past, reach,
          auction: { reserve, closeAt: chiusura(f.time), rivals, my: null, status: 'aperta', result: null, range: [mezzo(reserve * 1.6), Math.max(top, mezzo(reserve * 2.6))] } });
      });
    }
    const cell = (id) => cells.find((x) => x.id === id);
    const chiudi = (c) => { const res = Pano.settleAuction(c.auction, c.auction.my && c.auction.my.max); c.auction.status = 'chiusa'; c.auction.result = { win: res.win, me: res.me, cut: res.cut }; };
    // pranzo di oggi: già inviato, eri 3° (pagati € 6,99 con il secondo prezzo)
    const pr0 = cell('0-pranzo');
    pr0.reach = 2040; pr0.auction.reserve = 5.5;
    pr0.auction.rivals = [{ name: 'Pizzeria La Fiamma', cat: 'Pizzeria', bid: 13, q: 1.05 }, { name: 'Bistrot 21', cat: 'Bistrot', bid: 11, q: 1 }, { name: 'Sushi Hanami', cat: 'Sushi', bid: 7.2, q: 1.1 }, { name: 'Burger Lab', cat: 'Burger', bid: 6, q: 0.95 }];
    pr0.auction.my = { max: 9 };
    chiudi(pr0);
    // cena di stasera: la tua offerta è di 20 € e oggi saresti 2° (asta aperta fino alle 19:45)
    const tonight = cell('0-cena');
    tonight.reach = 3113; tonight.auction.reserve = 8;
    tonight.auction.rivals = [{ name: 'Pizzeria La Fiamma', cat: 'Pizzeria', bid: 24, q: 1.05 }, { name: 'Sushi Hanami', cat: 'Sushi', bid: 15, q: 1.1 }, { name: 'Vineria Il Moro', cat: 'Vineria', bid: 13, q: 1 }, { name: 'Burger Lab', cat: 'Burger', bid: 11, q: 0.95 }, { name: 'The Drunken Pub', cat: 'Pub', bid: 9, q: 1 }];
    tonight.auction.range = [18, 25];
    tonight.auction.my = { max: 20 };
    // aperitivo di oggi: asta aperta con tre offerte
    const aper = cell('0-aperitivo');
    aper.auction.rivals = [{ name: 'Lounge 22', cat: 'Cocktail bar', bid: 12, q: 1 }, { name: 'Vineria Il Moro', cat: 'Vineria', bid: 10, q: 1.05 }, { name: 'Pizzeria La Fiamma', cat: 'Pizzeria', bid: 9, q: 1 }];
    // venerdì sera hai già offerto 26 €; martedì sera gareggia anche un'altra trattoria
    cell('6-cena').auction.my = { max: 26 };
    const tue = cell('3-cena');
    tue.auction.rivals = tue.auction.rivals.slice(0, 4).concat([{ name: 'Trattoria da Enzo', cat: 'Trattoria', bid: mezzo(tue.auction.reserve * 2.4), q: 1.1 }]);
    return cells;
  }
  const DIGEST = buildDigest();
  // Push già partite: i risultati, contati sui conti di Fresh
  const PUSH_PAST = [
    { id: 'b4', d: D(10, 24, 12, 15), fascia: 'pranzo', pos: 3, price: 6.99, reach: 2040, taps: 64, bookings: 3, covers: 6, revenue: 141, today: true },
    { id: 'b1', d: D(10, 22, 20, 0), fascia: 'cena', pos: 3, price: 11, reach: 3180, taps: 141, bookings: 6, covers: 15, revenue: 402 },
    { id: 'b2', d: D(10, 21, 18, 30), fascia: 'aperitivo', pos: 2, price: 11, reach: 2460, taps: 98, bookings: 3, covers: 7, revenue: 118 },
    { id: 'b3', d: D(10, 18, 20, 0), fascia: 'cena', pos: 1, price: 19, reach: 3610, taps: 212, bookings: 9, covers: 24, revenue: 640 },
  ];

  // ─── Notifiche in app (dal 25 ottobre, schermata a parte) ──────────────
  // Stanno dentro l'app, nella Posta (la campanella in alto nella home), linguetta
  // «Promo per te», con l'etichetta «Sponsorizzato». Non suonano e non vanno sullo
  // schermo bloccato: le legge chi apre l'app. Le vede solo chi ha acceso le promo
  // (P-163 · D-113); «già clienti» e «per gusti» solo con la profilazione accesa.
  // Quattro posti al giorno per zona a prezzo fisso (segnaposto del prototipo), si
  // prenotano fino al giorno prima; il messaggio arriva alle 11:00 o alle 17:00.
  const POSTA_POSTI = 4;
  const POSTA_ORE = [{ id: 'pranzo', label: 'Per il pranzo', time: '11:00', icon: 'sun' }, { id: 'sera', label: 'Per la sera', time: '17:00', icon: 'moon' }];
  const prezziPosta = (d) => (d.getDay() === 5 || d.getDay() === 6 ? [12, 9, 7, 6] : [9, 7, 6, 5]);
  function buildPosta() {
    const r = Pano.rng(7);
    const out = [];
    for (let i = 1; i <= 7; i++) { // da domani: si prenota fino al giorno prima
      const d = Pano.addDays(T, i);
      const we = d.getDay() === 5 || d.getDay() === 6;
      const reach = Math.round((we ? 5100 : 4300) * (0.92 + r() * 0.16));
      const cats = CATEGORIE.filter((c) => c !== 'Trattoria').sort(() => r() - 0.5);
      const places = prezziPosta(d).map((price, k) => { const sold = r() < (we ? 0.62 : 0.38); return { pos: k + 1, price, sold, cat: sold ? cats[k] : null }; });
      out.push({ id: 'p' + i, day: i, d, reach, places });
    }
    // martedì a pranzo, dove sei sotto del 30%: il 1° posto è già tuo
    const tue = out.find((x) => x.day === 3);
    tue.places[0] = { pos: 1, price: tue.places[0].price, sold: true, mine: true, cat: 'Trattoria', when: 'pranzo', aud: 'vicini', msg: 'Martedì a pranzo: cacio e pepe e acqua a 12 €, a 350 m da te. Prenota in due tocchi.' };
    return out;
  }
  const POSTA = buildPosta();
  const POSTA_PAST = [
    { id: 'q1', d: D(10, 23, 17, 0), pos: 2, price: 9, reads: 1520, taps: 96, bookings: 5, covers: 11, revenue: 238 },
    { id: 'q2', d: D(10, 20, 11, 0), pos: 1, price: 9, reads: 1380, taps: 112, bookings: 4, covers: 8, revenue: 152 },
    { id: 'q3', d: D(10, 17, 17, 0), pos: 1, price: 12, reads: 1810, taps: 121, bookings: 7, covers: 16, revenue: 388 },
  ];

  // ─── Pubblico anonimo ───────────────────────────────────────────────────
  const AUDIENCES = [
    { id: 'a1', name: 'Clienti dell’ultimo mese', size: 1180, trend: 6, icon: 'repeat', desc: 'Hanno pagato un conto da te (Fresh) o prenotato con byup negli ultimi 30 giorni.', mix: [0.35, 0.65], action: 'Ringraziali con un’offerta', phase: 'mvp' },
    { id: 'a2', name: 'Non tornano da 60 giorni', size: 420, trend: -4, icon: 'history', desc: 'Erano clienti, non li vedi da più di due mesi.', mix: [0.28, 0.72], action: 'Riportali con un’offerta', phase: 'mvp' },
    { id: 'a3', name: 'Clienti abituali', size: 260, trend: 3, icon: 'heart', desc: 'Tre o più visite negli ultimi 90 giorni.', mix: [0.4, 0.6], action: 'Invitali al prossimo evento', phase: 'mvp' },
    { id: 'a4', name: 'Vicini, mai venuti', size: 12400, trend: 9, icon: 'pin', desc: 'Usano byup entro 1,5 km e non sono mai stati da te.', mix: [0.42, 0.58], action: 'Fatti conoscere', phase: 'mvp' },
    { id: 'a5', name: 'Amano la cucina romana', size: 3100, trend: 12, icon: 'cutlery', desc: 'In zona cercano e salvano trattorie e piatti romani.', mix: [0.3, 0.7], action: 'Mostra i tuoi piatti', phase: 'mvp' },
    { id: 'a6', name: 'Pranzo in zona', size: 2050, trend: 2, icon: 'sun', desc: 'Aprono byup a pranzo entro 800 m dal locale.', mix: [1, 0], action: 'Spingi il pranzo', phase: 'mvp' },
    { id: 'a7', name: 'Tavolate da 6 o più', size: 64, trend: 0, icon: 'users', desc: 'Hanno prenotato per gruppi grandi.', mix: [0.2, 0.8], action: '', tooSmall: true, phase: 'mvp' },
  ];
  const MIN_AUDIENCE = 100;

  // ─── Suggerimenti di Byuppino (dai dati di Fresh) ──────────────────────
  const SUGGERIMENTI = [
    { id: 's1', icon: 'cutlery', title: 'Stasera alle 21:00 hai 14 posti liberi', text: (f) => `All’asta della push delle 20:00 sei già 2°. Con 10 € in più sulla ricerca di stasera prevedo da ${f.coversLo} a ${f.coversHi} coperti in più.`, cta: 'Prepara la campagna', action: { kind: 'wizard', goal: 'riempi', budget: 10 }, tone: 'hot' },
    { id: 's2', icon: 'sun', title: 'Martedì a pranzo sei sotto del 30%', text: (f) => `Una ricerca a pranzo da 25 € tra martedì e mercoledì: prevedo da ${f.coversLo} a ${f.coversHi} coperti in più.`, cta: 'Prepara la campagna', action: { kind: 'wizard', goal: 'pranzi', budget: 25 } },
    { id: 's3', icon: 'ticket', title: 'Il derby di domenica fa cercare', text: () => 'In zona 1.800 persone hanno cercato «partita» questa settimana. Il tuo evento è in revisione: appena approvato va in evidenza.', cta: 'Vedi evento', action: { kind: 'campagna', id: 'c3' } },
  ];
  // Tetto di spesa di una campagna: al giorno × giorni, oppure totale
  Pano.campCap = (c) => {
    if (c.budgetTot) return c.budgetTot;
    if (!c.budgetDay) return 0;
    const days = c.start && c.end ? Math.round((c.end - c.start) / 86400000) + 1 : 31;
    return c.budgetDay * Math.max(1, days);
  };
  Pano.suggText = (s) => s.text(s.action && s.action.goal ? Pano.forecast(s.action.goal, s.action.budget) : {});

  // Calendario promozioni (prossimi 7 giorni)
  const CALENDARIO = [
    { d: 0, items: [{ t: 'Push Cena 20:00', s: 'asta · sei 2°', kind: 'push' }, { t: 'Ricerca in cima', s: 'tutto il giorno', kind: 'ricerca' }] },
    { d: 1, items: [{ t: 'Derby sul maxischermo', s: 'in revisione', kind: 'evento', warn: true }, { t: 'Ricerca in cima', s: 'tutto il giorno', kind: 'ricerca' }] },
    { d: 2, items: [{ t: 'Ricerca in cima', s: 'tutto il giorno', kind: 'ricerca' }] },
    { d: 3, items: [{ t: 'Notifica in app', s: '1° posto · 11:00', kind: 'inapp' }, { t: 'Halloween in evidenza', s: 'parte oggi', kind: 'evento' }, { t: 'Ricerca in cima', s: 'tutto il giorno', kind: 'ricerca' }] },
    { d: 4, items: [{ t: 'Ricerca in cima', s: 'tutto il giorno', kind: 'ricerca' }] },
    { d: 5, items: [{ t: 'Aperitivo 2x1', s: 'da correggere', kind: 'offerta', bad: true }, { t: 'Ricerca in cima', s: 'tutto il giorno', kind: 'ricerca' }] },
    { d: 6, items: [{ t: 'Push Cena 20:00', s: 'tua offerta · 26 €', kind: 'push' }, { t: 'Halloween in evidenza', s: 'sab 31', kind: 'evento' }] },
  ];

  // Avvisi (campanella)
  const AVVISI = [
    { id: 'n1', icon: 'alertCircle', tone: 'bad', t: '«Aperitivo 2x1» va corretto', s: '3 punti da sistemare prima di andare online', at: 'ieri 16:40', go: { kind: 'campagna', id: 'c4' } },
    { id: 'n2', icon: 'hourglass', tone: 'warn', t: '«Derby Roma–Lazio» è in revisione', s: 'byup risponde di solito entro 4 ore', at: '10:13', go: { kind: 'campagna', id: 'c3' } },
    { id: 'n3', icon: 'wallet', tone: 'warn', t: 'Hai usato l’82% del limite mensile', s: 'Restano € 155,40 fino al 31 ottobre', at: '09:00', go: { kind: 'route', id: 'wallet' } },
    { id: 'n4', icon: 'checkCircle', tone: 'good', t: 'La push delle 12:15 è partita', s: 'Eri 3° · 2.040 persone raggiunte', at: '12:16', go: { kind: 'route', id: 'push' } },
  ];

  // Feed «adesso» del mondo (anonimo)
  const FEED = [
    { icon: 'calendar', t: 'Prenotazione per 2 alle 20:30', s: 'dalla push' },
    { icon: 'bookmark', t: 'Salvato tra i preferiti', s: 'dopo la ricerca «carbonara»' },
    { icon: 'tap', t: 'Tocco sul tuo annuncio', s: 'a 350 m da te' },
    { icon: 'calendar', t: 'Prenotazione per 4 alle 21:00', s: 'ricerca in cima' },
    { icon: 'euro', t: 'Conto da 86 € attribuito', s: 'notifica in app di ieri' },
    { icon: 'tap', t: 'Tocco sul tuo annuncio', s: 'ricerca «trattoria»' },
    { icon: 'bookmark', t: 'Carbonara salvata', s: 'piatti vicino a te' },
    { icon: 'calendar', t: 'Prenotazione per 3 alle 20:00', s: 'push della cena' },
  ];

  // Regole dei contenuti (accettate all'onboarding)
  const REGOLE = [
    { icon: 'image', t: 'Foto vere del locale e dei piatti', s: 'Niente scritte sopra la foto oltre un quinto dell’immagine.' },
    { icon: 'tag', t: 'Prezzi uguali al menù di Fresh', s: 'Offerte e prezzi barrati si controllano sul menù.' },
    { icon: 'ban', t: 'Niente superlativi non verificabili', s: '«Il migliore di Roma» non passa; «pasta tirata a mano» sì.' },
    { icon: 'eye', t: 'Etichetta «Sponsorizzato» sempre visibile', s: 'La mette byup, non si toglie.' },
    { icon: 'shield', t: 'Niente marchi di altri né contenuti per adulti', s: 'Squadre, sponsor e marchi passano dalla revisione a mano.' },
    { icon: 'calendar', t: 'Eventi chiari', s: 'Data, ora e condizioni scritte per intero.' },
  ];

  // Idoneità all'accesso (lato locale: cosa guardiamo, senza il punteggio di Desk)
  const IDONEITA = [
    { t: 'Usi Fresh da almeno 30 giorni', v: 'da 8 mesi', ok: true },
    { t: 'Giorni di apertura registrati', v: '26 negli ultimi 30', ok: true },
    { t: 'Voto medio in app', v: '4,6 su 5', ok: true },
    { t: 'Profilo completo', v: '92% · manca il menù delle bevande', ok: false },
    { t: 'Ordini e prenotazioni da byup', v: '148 nell’ultimo mese', ok: true },
  ];

  Pano.DATA = { user, venues, TIPI, VETRINA, VETRINA_DAY, PUSH_POSTI, TETTO_PUSH, PER_MILLE, QUALITA, POSTA_POSTI, POSTA_ORE, OBIETTIVI, TEMPLATE, MENU, EVENTI, OFFERTE, FASCE, RICARICHE, DIGEST, PUSH_PAST, POSTA, POSTA_PAST, AUDIENCES, MIN_AUDIENCE, SUGGERIMENTI, CALENDARIO, AVVISI, FEED, REGOLE, IDONEITA, S30, WEEK, CATEGORIE };

  // ─── Stato iniziale del prototipo ───────────────────────────────────────
  Pano.store.set({
    variant: 'atlante',
    route: 'panorama',
    theme: 'light',
    venueId: 'cp',
    access: 'approvato',
    campaigns,
    wallet,
    digest: DIGEST,
    posta: POSTA,
    overlay: null,
    toasts: [],
    preset: null,
  });

  // ─── Azioni ─────────────────────────────────────────────────────────────
  const S = Pano.store;
  Pano.act = {
    go(route) {
      S.set({ route, overlay: null });
      const v = S.get().variant;
      try { history.replaceState(null, '', '#' + v + '.' + route); } catch (e) { /* hash non disponibile */ }
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    },
    open(kind, props) { S.set({ overlay: { kind, props: props || {} } }); },
    close() { S.set({ overlay: null }); },
    updateCampaign(id, patch) { S.set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? Object.assign({}, c, typeof patch === 'function' ? patch(c) : patch) : c)) })); },
    addCampaign(c) { S.set((s) => ({ campaigns: [c, ...s.campaigns] })); },
    removeCampaign(id) { S.set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })); },
    wallet(patch) { S.set((s) => ({ wallet: Object.assign({}, s.wallet, typeof patch === 'function' ? patch(s.wallet) : patch) })); },
    recharge(v, bonus, label) {
      const now = new Date(Pano.TODAY.getTime() + 60000);
      Pano.act.wallet((w) => ({
        balance: w.balance + v + bonus,
        bonus: w.bonus + bonus,
        movements: [
          ...(bonus ? [{ id: 'r' + Date.now() + 'b', at: now, t: 'Bonus ricarica', kind: 'bonus', v: bonus }] : []),
          { id: 'r' + Date.now(), at: now, t: label || 'Ricarica', kind: 'ricarica', v },
          ...w.movements,
        ],
      }));
    },
    // Notifica in app: un posto nella Posta a prezzo fisso, bloccato nel wallet fino all'invio
    bookPosta(dayId, pos, opts) {
      let price = 0;
      S.set((s) => ({
        posta: s.posta.map((x) => (x.id !== dayId ? x : Object.assign({}, x, { places: x.places.map((p) => { if (p.pos !== pos) return p; price = p.price; return Object.assign({}, p, { sold: true, mine: true, cat: 'Trattoria' }, opts); }) }))),
      }));
      const day = S.get().posta.find((x) => x.id === dayId);
      Pano.act.wallet((w) => ({
        balance: w.balance - price,
        movements: [{ id: 'q' + Date.now(), at: new Date(Pano.TODAY.getTime() + 60000), t: `Notifica in app · ${Pano.fmtDay(day.d)} · ${pos}° posto (bloccato fino all’invio)`, kind: 'blocco', v: -price }, ...w.movements],
      }));
      return price;
    },
    // annullare: l'importo si sblocca (con «undo» sparisce anche il movimento appena fatto)
    unbookPosta(dayId, pos, undo) {
      let price = 0;
      const day = S.get().posta.find((x) => x.id === dayId);
      S.set((s) => ({
        posta: s.posta.map((x) => (x.id !== dayId ? x : Object.assign({}, x, { places: x.places.map((p) => { if (p.pos !== pos || !p.mine) return p; price = p.price; return { pos: p.pos, price: p.price, sold: false, cat: null }; }) }))),
      }));
      Pano.act.wallet((w) => ({
        balance: w.balance + price,
        movements: undo ? w.movements.slice(1) : [{ id: 'q' + Date.now(), at: new Date(Pano.TODAY.getTime() + 60000), t: `Notifica in app · ${Pano.fmtDay(day.d)} · prenotazione annullata`, kind: 'sblocco', v: price }, ...w.movements],
      }));
    },
    // Asta della push: l'offerta massima resta bloccata nel wallet fino alla chiusura
    placeBid(cellId, max) {
      const c = S.get().digest.find((x) => x.id === cellId);
      const prev = c.auction.my ? c.auction.my.max : 0;
      const at = new Date(Pano.TODAY.getTime() + 60000);
      S.set((st) => ({ digest: st.digest.map((x) => (x.id !== cellId ? x : Object.assign({}, x, { auction: Object.assign({}, x.auction, { my: { max } }) }))) }));
      Pano.act.wallet((w) => ({
        balance: w.balance - (max - prev),
        movements: [{ id: 'a' + Date.now(), at, t: `Asta push ${Pano.cap(c.fascia)} ${c.time} · offerta massima ${Pano.eur(max)} (bloccata fino alle ${c.auction.closeAt})`, kind: 'blocco', v: -(max - prev) }, ...w.movements],
      }));
    },
    withdrawBid(cellId) {
      const c = S.get().digest.find((x) => x.id === cellId);
      if (!c.auction.my) return;
      const prev = c.auction.my.max;
      S.set((st) => ({ digest: st.digest.map((x) => (x.id !== cellId ? x : Object.assign({}, x, { auction: Object.assign({}, x.auction, { my: null }) }))) }));
      Pano.act.wallet((w) => ({ balance: w.balance + prev, movements: [{ id: 'a' + Date.now(), at: new Date(Pano.TODAY.getTime() + 60000), t: `Asta push ${Pano.cap(c.fascia)} ${c.time} · offerta ritirata`, kind: 'sblocco', v: prev }, ...w.movements] }));
    },
    // Chiusura dell'asta (nel prototipo si simula): chi vince paga il secondo prezzo, il resto si sblocca
    closeAuction(cellId) {
      const c = S.get().digest.find((x) => x.id === cellId);
      const my = c.auction.my;
      const res = Pano.settleAuction(c.auction, my && my.max);
      S.set((st) => ({ digest: st.digest.map((x) => (x.id !== cellId ? x : Object.assign({}, x, { auction: Object.assign({}, x.auction, { status: 'chiusa', result: { win: res.win, me: res.me, cut: res.cut } }) }))) }));
      if (my) {
        const at = new Date(Pano.TODAY.getTime() + 120000);
        Pano.act.wallet((w) => ({
          balance: w.balance + my.max - (res.me ? res.me.paid : 0),
          movements: [
            ...(res.me ? [{ id: 'a' + Date.now() + 'w', at, t: `Push ${Pano.cap(c.fascia)} ${c.time} · ${res.me.pos}° posto vinto all’asta (secondo prezzo)`, kind: 'addebito', v: -res.me.paid }] : []),
            { id: 'a' + Date.now() + 's', at, t: `Asta push ${Pano.cap(c.fascia)} ${c.time} · chiusa, offerta massima sbloccata`, kind: 'sblocco', v: my.max },
            ...w.movements,
          ],
        }));
      }
      return res;
    },
    // Interruttore di una campagna: attiva/programmata ↔ in pausa, con annulla
    toggleCampaign(id) {
      const c = S.get().campaigns.find((x) => x.id === id);
      if (!c) return;
      const was = c.status;
      if (was === 'attiva' || was === 'programmata') {
        Pano.act.updateCampaign(id, { status: 'pausa', resumeTo: was, paused: 'Messa in pausa da te adesso' });
        Pano.toast(`«${c.name}» in pausa`, { undo: () => Pano.act.updateCampaign(id, { status: was }) });
      } else if (was === 'pausa') {
        const to = c.resumeTo || 'attiva';
        Pano.act.updateCampaign(id, { status: to });
        Pano.toast(to === 'programmata' ? `«${c.name}» di nuovo programmata` : `«${c.name}» di nuovo attiva`, { undo: () => Pano.act.updateCampaign(id, { status: 'pausa' }) });
      }
    },
    // Metodo di pagamento predefinito per le ricariche
    setDefaultMethod(mid) {
      Pano.act.wallet((w) => {
        const methods = w.methods.map((m) => Object.assign({}, m, { def: m.id === mid }));
        const d = methods.find((m) => m.id === mid);
        return { methods, method: { brand: d.brand, last4: d.last4, exp: d.exp || '—' } };
      });
    },
    // Promuovi in un tap: un piatto o un evento in cima alla vetrina, prezzo fisso al giorno
    vetrinaPromote({ pick, days = 3, by = 'tu' }) {
      const id = 'v' + Date.now();
      const start = Pano.TODAY;
      Pano.act.addCampaign({
        id, name: `${pick.title} in vetrina`, type: 'vetrina', status: 'attiva', goal: pick.kind === 'evento' ? 'evento' : 'prenotazioni',
        subject: { kind: pick.kind, title: pick.title }, start, end: Pano.addDays(start, days - 1), budgetDay: VETRINA_DAY, budgetTot: VETRINA_DAY * days, spent: 0,
        reach: 0, taps: 0, bookings: 0, covers: 0, revenue: 0, audience: ['vetrina'], radiusKm: null, quick: true,
        creative: { title: pick.title, text: pick.note || pick.when || '', img: pick.img, bg: pick.bg, cta: pick.kind === 'evento' ? 'Prenota' : 'Ordina', photo: pick.photo, pick },
        log: [{ at: new Date(), t: by === 'byuppino' ? 'Messa in vetrina da Byuppino · online subito' : 'Messa in vetrina in un tap · online subito' }],
      });
      return id;
    },
    // Promozione veloce sugli spazi dell'app: non più in un tap (si passa dalla procedura);
    // resta per i dati del prototipo e per le prove
    quickPromote({ name, subject = 'locale', goal = 'riempi', budget = 15, days = 1, type = 'ricerca', creative, startIn = 0, status = 'attiva' } = {}) {
      const id = 'q' + Date.now();
      const cr = creative || { title: 'Cacio e Pepe · Trastevere', text: 'Pasta tirata a mano ogni mattina. Prenota in due tocchi.', img: I.carbonara, bg: BG.pesca, cta: 'Prenota', photo: I.app.carbonara };
      const start = Pano.addDays(Pano.TODAY, startIn);
      Pano.act.addCampaign({
        id, name: name || 'Riempi la sala · stasera', type, status, goal,
        subject: { kind: subject, title: cr.title }, start, end: Pano.addDays(start, days - 1), budgetDay: null, budgetTot: budget, spent: 0,
        reach: 0, taps: 0, bookings: 0, covers: 0, revenue: 0, audience: ['vicini'], radiusKm: 1.2, quick: true,
        creative: cr, log: [{ at: new Date(), t: 'Lanciata da Byuppino · controllo automatico superato' }],
      });
      return id;
    },
  };

  // Previsione per la vetrina: chi apre il locale, chi tocca la scheda in evidenza
  Pano.forecastVetrina = function (days = 1) {
    const visits = 210 * days;
    const r10 = (x) => Math.round(x / 10) * 10;
    return {
      visitsLo: r10(visits * 0.9), visitsHi: r10(visits * 1.1),
      tapsLo: Math.round(visits * 0.12), tapsHi: Math.round(visits * 0.18),
      convLo: Math.max(1, Math.floor(visits * 0.12 * 0.09)), convHi: Math.max(2, Math.ceil(visits * 0.18 * 0.12)),
      cost: VETRINA_DAY * days,
    };
  };

  // Previsione semplice (stima mostrata come intervallo)
  Pano.forecast = function (goalId, budget, days = 1) {
    const g = OBIETTIVI.find((o) => o.id === goalId) || OBIETTIVI[0];
    const covers = budget * g.yieldPerEur;
    const reach = budget * g.reachPerEur;
    return {
      coversLo: Math.max(1, Math.floor(covers * 0.78)),
      coversHi: Math.max(2, Math.ceil(covers * 1.22)),
      reachLo: Math.round((reach * 0.85) / 10) * 10,
      reachHi: Math.round((reach * 1.15) / 10) * 10,
      revenueLo: Math.round(covers * 0.78 * 25.4),
      revenueHi: Math.round(covers * 1.22 * 25.4),
      taps: Math.round(budget / 0.42),
      days,
    };
  };
})();
