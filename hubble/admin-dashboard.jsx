// Dashboard byup — 4 tab: Generale · Locali · Utenti App · Camerieri
// Guardia anti-cache: se il browser ha in cache una versione vecchia di
// admin-tokens.jsx senza i token INK, i grafici diventerebbero invisibili
// (colori undefined). Definiamo i fallback qui.
if (!window.ADM.INK) { window.ADM.INK = '#31353D'; window.ADM.INK_SOFT = '#C9CDD4'; }


const { useState: useStateDash, useMemo: useMemoDash } = React;

// --- Costanti app-side (mock metrics) ---
//
// Due popolazioni che non vanno mai sommate né divise l'una per l'altra:
//
//   registrati        hanno un account, uno storico e una carta salvata. Si
//                     contano come persone.
//   sessioni guest    la webapp aperta col QR, senza registrazione. NON sono
//                     persone: lo stesso cliente che inquadra il QR due sere
//                     di fila conta due volte e noi non possiamo saperlo.
//
// DAU, WAU e MAU contano solo i primi. Prima il MAU includeva anche le
// sessioni guest mentre al denominatore c'erano i soli registrati: 42.180
// attivi su 12.480 iscritti, il 338%. Un tasso di attività sopra il cento per
// cento non è un numero ottimista, è il segno che stiamo dividendo due cose
// diverse — e con quello rotto sono rotte anche la stickiness e la fedeltà,
// che ci si appoggiano sopra.
//
// UTENTI è un sample: per le metriche di piattaforma la base si stima × 312.
const UTENTI_BASE = UTENTI.length * 312;
const APP_METRICS = {
  totUtenti: UTENTI_BASE,
  // Quote dei registrati, non numeri liberi: per costruzione nessuna finestra
  // può contenere più persone di quante ne siano iscritte.
  mau: Math.round(UTENTI_BASE * 0.34),
  wau: Math.round(UTENTI_BASE * 0.148),
  dau: Math.round(UTENTI_BASE * 0.072),
  newRegistrazioni30g: Math.round(UTENTI_BASE * 0.058),
  // Le guest vivono a parte e non entrano in nessuno dei numeri sopra.
  sessioniGuest30g: 26400,
  ordiniGuest30g: 8420,
  // Le prenotazioni sono un'AZIONE, non una persona: si contano sugli attivi
  // del mese. Prima valeva 12.480, cioè esattamente UTENTI_BASE — la stessa
  // variabile letta due volte e presentata come due misure.
  prenotazioniApp30g: Math.round(UTENTI_BASE * 0.34 * 0.62),
  ticketMedioApp: 32,
  avgSessioneMin: 6.4,
};

// Lo staff si conta sui locali che ci sono, non a occhio: 1.840 camerieri su
// una piattaforma di cinquanta locali facevano trentasei dipendenti a testa,
// e la card che li divideva per i locali configurati ne dichiarava 73,6.
// Nessun ristorante ha settantaquattro dipendenti.
//
// Qui la squadra la si stima dal volume del locale — chi fa nove ordini al
// giorno non ha la brigata di chi ne fa trenta — con un minimo di tre: sotto
// non ci si sta in sala nemmeno a pranzo.
//
// Ha una squadra chi è vivo E ha lo staff collegato — il passo «Staff
// collegato» dell'imbuto (P-45), cioè un collaboratore entrato davvero, non
// un invito: la stessa regola che la card «Locali con staff» usa per
// contarli, così i due numeri della stessa riga non contano due popolazioni
// diverse. Prima controllava un passo «team_staff» che non esisteva, e di
// fatto contava solo gli attivi.
const STAFF_CONFIGURATO = (l) =>
  (l.stato === 'active' || l.stato === 'inactive' || l.stato === 'skipped')
  && l.completedSteps && l.completedSteps.includes('staff');
const STAFF_PER_LOCALE_BASE = LOCALI.map(l => ({
  localeId: l.id,
  n: STAFF_CONFIGURATO(l)
    ? Math.max(3, Math.min(14, Math.round(3 + (l.ordiniGiorno || 0) / 3.2)))
    : 0,
}));
const STAFF_PER_LOCALE = STAFF_PER_LOCALE_BASE;
const STAFF_TOT = STAFF_PER_LOCALE.reduce((s, x) => s + x.n, 0);
// Quanto lo staff USA il prodotto, locale per locale. Contare i camerieri
// registrati non dice niente: la sala che non apre l'app è il modo più comune
// in cui un'adozione muore, e il titolare ci mette settimane ad accorgersene —
// se se ne accorge. Il tasso di attivazione della sala segue l'adozione
// digitale del locale, perché è la stessa cosa vista da due lati.
const STAFF_USO = LOCALI.map((l, i) => {
  const squadra = (STAFF_PER_LOCALE_BASE[i] || {}).n || 0;
  if (!squadra) return { localeId: l.id, nome: l.nome, citta: l.citta, squadra: 0, attivi: 0, pct: 0, azioniTurno: 0, qr: l.qrAdoption };
  // Chi ha i QR fermi ha quasi sempre la sala ferma: la quota di camerieri che
  // aprono il gestionale in settimana va con l'adozione, non a caso.
  const q = l.qrAdoption == null ? 20 : l.qrAdoption;
  const quota = Math.max(0.12, Math.min(0.95, 0.18 + q / 55));
  const attivi = Math.max(0, Math.round(squadra * quota));
  return {
    localeId: l.id, nome: l.nome, citta: l.citta,
    squadra, attivi,
    pct: Math.round(attivi / squadra * 100),
    // Azioni per turno di chi lavora: se sono meno di dieci, il cameriere
    // apre l'app e poi torna al blocchetto.
    azioniTurno: Math.round(4 + quota * 38),
    qr: l.qrAdoption,
  };
});

const STAFF_METRICS = {
  totCamerieri: STAFF_TOT,
  // Un terzo scarso è in turno oggi: il resto è part-time, riposo, stagionali.
  activeOggi: Math.round(STAFF_TOT * 0.33),
  // Nuovi registrati del mese: un FLUSSO, e va tenuto separato dallo stock.
  // La card prima lo ricavava dalla differenza fra due somme di trenta giorni
  // di una serie di livelli, e dichiarava +1.900 nuovi su un totale di 1.840.
  nuovi30g: Math.round(STAFF_TOT * 0.06),
};

// ════════════════════════════════════════════════════════════════════════════
// CATALOGO PIATTI · usato sia per Stagionalità (DashUtentiApp) sia per
// Posizionamento prezzi (DashLocali). Demo con ~60 piatti raggruppati per
// categoria — supporta facilmente migliaia se si estende l'array.
// ════════════════════════════════════════════════════════════════════════════
const SEASONAL_ARC = {
  estate_pesce:    [ 74, 72, 86,108,128,150,170,184,154,116, 90, 78 ],
  estate_light:    [ 50, 48, 62, 86,124,158,194,212,168,114, 68, 52 ],
  estate_dolce:    [ 58, 56, 70, 92,128,162,194,206,160,108, 70, 60 ],
  estate_aperitivo:[ 66, 64, 76, 98,134,164,188,196,158,116, 80, 68 ],
  inverno_caldo:   [144,138,124,108, 92, 76, 68, 64, 82,108,132,150 ],
  inverno_dolce:   [128,118,108, 98, 88, 82, 78, 74, 92,114,138,156 ],
  anti_stagionale: [120,124,128,124,118,108,100, 96,108,124,134,132 ],
  costante:        [ 98, 98,100,102,100, 98, 96, 94,100,104,106,104 ],
  natalizio:       [ 62, 55, 60, 68, 72, 68, 60, 55, 75, 92,140,210 ],
  primaverile:     [ 60, 58, 82,118,154,162,138,100, 82, 76, 68, 62 ],
  autunnale:       [ 68, 66, 70, 80, 88, 86, 84, 82,114,154,168,142 ],
  pasquale:        [ 70, 78, 96,168,118, 94, 86, 80, 92,100,108, 88 ],
  pranzo_business: [108,112,116,114,108,100, 92, 78,108,116,118,108 ],
};
const SEASONAL_BIAS = {
  estate_pesce:    { 'Nord-Ovest':0.82,'Nord-Est':0.88,'Centro':1.00,'Sud':1.22,'Isole':1.28 },
  estate_light:    { 'Nord-Ovest':0.96,'Nord-Est':0.98,'Centro':1.02,'Sud':1.06,'Isole':1.08 },
  estate_dolce:    { 'Nord-Ovest':0.92,'Nord-Est':0.94,'Centro':1.00,'Sud':1.10,'Isole':1.12 },
  estate_aperitivo:{ 'Nord-Ovest':1.18,'Nord-Est':1.20,'Centro':1.02,'Sud':0.84,'Isole':0.88 },
  inverno_caldo:   { 'Nord-Ovest':1.28,'Nord-Est':1.24,'Centro':1.04,'Sud':0.82,'Isole':0.78 },
  inverno_dolce:   { 'Nord-Ovest':1.14,'Nord-Est':1.12,'Centro':1.04,'Sud':0.92,'Isole':0.88 },
  anti_stagionale: { 'Nord-Ovest':0.92,'Nord-Est':0.94,'Centro':1.16,'Sud':0.96,'Isole':0.96 },
  costante:        { 'Nord-Ovest':1.00,'Nord-Est':1.00,'Centro':1.00,'Sud':1.00,'Isole':1.00 },
  natalizio:       { 'Nord-Ovest':1.12,'Nord-Est':1.10,'Centro':1.00,'Sud':0.94,'Isole':0.92 },
  primaverile:     { 'Nord-Ovest':1.04,'Nord-Est':1.06,'Centro':1.02,'Sud':0.96,'Isole':0.94 },
  autunnale:       { 'Nord-Ovest':1.16,'Nord-Est':1.18,'Centro':1.06,'Sud':0.84,'Isole':0.80 },
  pasquale:        { 'Nord-Ovest':1.02,'Nord-Est':1.02,'Centro':1.06,'Sud':1.00,'Isole':0.96 },
  pranzo_business: { 'Nord-Ovest':1.22,'Nord-Est':1.18,'Centro':1.06,'Sud':0.78,'Isole':0.72 },
};
// Base price (€) per categoria di piatto · usato come fallback se il singolo
// piatto non ha un basePrice esplicito. La componente città arriva da CITY_PRICE_MULT.
const DISH_CAT_BASE = {
  'Pizza':9.5, 'Primi':12.0, 'Secondi':22.0, 'Antipasti':11.0,
  'Street':10.0, 'Dolci':6.0, 'Drink':7.0,
};
const DISH_CATALOG = [
  // Pizza
  { n:'Pizza Margherita',     arc:'estate_pesce',     cat:'Pizza',     basePrice:10.0 },
  { n:'Pizza Marinara',       arc:'costante',         cat:'Pizza',     basePrice: 8.5 },
  { n:'Pizza Diavola',        arc:'costante',         cat:'Pizza',     basePrice:10.5 },
  { n:'Pizza Quattro Formaggi', arc:'inverno_caldo',  cat:'Pizza',     basePrice:11.0 },
  { n:'Pizza Capricciosa',    arc:'costante',         cat:'Pizza',     basePrice:11.5 },
  { n:'Pizza Bufalina',       arc:'estate_pesce',     cat:'Pizza',     basePrice:12.0 },
  { n:'Pizza Tartufo',        arc:'autunnale',        cat:'Pizza',     basePrice:15.0 },
  { n:'Pizza Bianca con porchetta', arc:'pranzo_business', cat:'Pizza', basePrice:13.0 },
  // Primi
  { n:'Carbonara',            arc:'anti_stagionale',  cat:'Primi',     basePrice:12.5 },
  { n:'Cacio e Pepe',         arc:'anti_stagionale',  cat:'Primi',     basePrice:11.0 },
  { n:'Amatriciana',          arc:'anti_stagionale',  cat:'Primi',     basePrice:12.0 },
  { n:'Gricia',               arc:'anti_stagionale',  cat:'Primi',     basePrice:11.5 },
  { n:'Pesto alla Genovese',  arc:'primaverile',      cat:'Primi',     basePrice:11.0 },
  { n:'Lasagne al ragù',      arc:'inverno_caldo',    cat:'Primi',     basePrice:11.0 },
  { n:'Pasta al pomodoro',    arc:'costante',         cat:'Primi',     basePrice: 9.5 },
  { n:'Pasta alla Norma',     arc:'estate_pesce',     cat:'Primi',     basePrice:11.0 },
  { n:'Risotto allo zafferano', arc:'inverno_caldo',  cat:'Primi',     basePrice:13.5 },
  { n:'Risotto ai funghi',    arc:'autunnale',        cat:'Primi',     basePrice:14.0 },
  { n:'Risotto agli asparagi',arc:'primaverile',      cat:'Primi',     basePrice:13.5 },
  { n:'Tortellini in brodo',  arc:'inverno_caldo',    cat:'Primi',     basePrice:12.0 },
  { n:'Pasta fredda & insalatone', arc:'estate_light',cat:'Primi',     basePrice:10.5 },
  { n:'Gnocchi al pomodoro',  arc:'costante',         cat:'Primi',     basePrice:10.0 },
  { n:'Pappardelle al cinghiale', arc:'autunnale',    cat:'Primi',     basePrice:14.5 },
  { n:'Trofie al pesto',      arc:'primaverile',      cat:'Primi',     basePrice:11.5 },
  // Secondi
  { n:'Tagliata di manzo',    arc:'costante',         cat:'Secondi',   basePrice:22.0 },
  { n:'Brasato al Barolo',    arc:'inverno_caldo',    cat:'Secondi',   basePrice:24.0 },
  { n:'Ossobuco',             arc:'inverno_caldo',    cat:'Secondi',   basePrice:22.0 },
  { n:'Bistecca alla Fiorentina', arc:'costante',     cat:'Secondi',   basePrice:38.0 },
  { n:'Cotoletta alla Milanese', arc:'pranzo_business', cat:'Secondi', basePrice:20.0 },
  { n:'Saltimbocca alla Romana', arc:'pranzo_business', cat:'Secondi', basePrice:18.0 },
  { n:'Coniglio in porchetta',arc:'autunnale',        cat:'Secondi',   basePrice:19.0 },
  { n:'Agnello al forno',     arc:'pasquale',         cat:'Secondi',   basePrice:24.0 },
  { n:'Pesce alla griglia',   arc:'estate_pesce',     cat:'Secondi',   basePrice:23.0 },
  { n:'Frittura di paranza',  arc:'estate_pesce',     cat:'Secondi',   basePrice:20.0 },
  { n:'Polpo alla griglia',   arc:'estate_pesce',     cat:'Secondi',   basePrice:21.0 },
  { n:'Baccalà mantecato',    arc:'inverno_dolce',    cat:'Secondi',   basePrice:18.0 },
  { n:'Polenta concia',       arc:'inverno_caldo',    cat:'Secondi',   basePrice:16.0 },
  { n:'Trippa alla romana',   arc:'autunnale',        cat:'Secondi',   basePrice:15.0 },
  // Antipasti / Contorni
  { n:'Caprese',              arc:'estate_pesce',     cat:'Antipasti', basePrice:10.0 },
  { n:'Burrata e pomodorini', arc:'estate_pesce',     cat:'Antipasti', basePrice:11.5 },
  { n:'Tagliere salumi e formaggi', arc:'costante',   cat:'Antipasti', basePrice:14.0 },
  { n:'Bruschette miste',     arc:'estate_aperitivo', cat:'Antipasti', basePrice: 8.0 },
  { n:'Vitello tonnato',      arc:'estate_light',     cat:'Antipasti', basePrice:13.0 },
  { n:'Carpaccio di manzo',   arc:'costante',         cat:'Antipasti', basePrice:13.5 },
  { n:'Insalata di farro',    arc:'estate_light',     cat:'Antipasti', basePrice: 9.5 },
  { n:'Parmigiana di melanzane', arc:'estate_pesce',  cat:'Antipasti', basePrice:11.0 },
  // Street food / casual
  { n:'Burger classico',      arc:'costante',         cat:'Street',    basePrice:11.0 },
  { n:'Burger gourmet',       arc:'costante',         cat:'Street',    basePrice:14.5 },
  { n:'Sushi mix',            arc:'costante',         cat:'Street',    basePrice:18.0 },
  { n:'Poke bowl',            arc:'estate_light',     cat:'Street',    basePrice:12.5 },
  { n:'Tacos',                arc:'estate_aperitivo', cat:'Street',    basePrice:10.0 },
  { n:'Arancini',             arc:'costante',         cat:'Street',    basePrice: 5.0 },
  { n:'Piadina romagnola',    arc:'estate_aperitivo', cat:'Street',    basePrice: 8.0 },
  // Dolci
  { n:'Tiramisù',             arc:'costante',         cat:'Dolci',     basePrice: 6.5 },
  { n:'Panna cotta',          arc:'costante',         cat:'Dolci',     basePrice: 6.0 },
  { n:'Cannoli siciliani',    arc:'costante',         cat:'Dolci',     basePrice: 6.0 },
  { n:'Gelato artigianale',   arc:'estate_dolce',     cat:'Dolci',     basePrice: 5.0 },
  { n:'Sorbetto al limone',   arc:'estate_dolce',     cat:'Dolci',     basePrice: 5.0 },
  { n:'Castagnaccio',         arc:'autunnale',        cat:'Dolci',     basePrice: 5.5 },
  { n:'Panettone',            arc:'natalizio',        cat:'Dolci',     basePrice: 7.0 },
  { n:'Colomba pasquale',     arc:'pasquale',         cat:'Dolci',     basePrice: 7.0 },
  // Bevande
  { n:'Spritz Aperol',        arc:'estate_aperitivo', cat:'Drink',     basePrice: 7.0 },
  { n:'Negroni',              arc:'costante',         cat:'Drink',     basePrice: 9.0 },
  { n:'Vino rosso della casa',arc:'inverno_dolce',    cat:'Drink',     basePrice: 5.5 },
  { n:'Vino bianco della casa',arc:'estate_light',    cat:'Drink',     basePrice: 5.5 },
  { n:'Birra artigianale',    arc:'estate_aperitivo', cat:'Drink',     basePrice: 6.5 },
];
// Multiplier prezzo per città (vs prezzo base nazionale)
const CITY_PRICE_MULT = {
  'Milano': 1.22, 'Roma': 1.06, 'Firenze': 1.08, 'Bologna': 0.98,
  'Torino': 1.02, 'Bari': 0.82, 'Palermo': 0.78, 'Napoli': 0.78,
};
// Override per piatti-icona delle città (es. Pizza Margherita a Napoli costa molto meno per cultura locale)
const CITY_PRICE_OVERRIDE = {
  'Pizza Margherita': { 'Napoli': 0.55 },
  'Spritz Aperol':    { 'Napoli': 0.78, 'Palermo': 0.82 },
  'Bistecca alla Fiorentina': { 'Firenze': 1.18 },
  'Cannoli siciliani':{ 'Palermo': 0.72 },
  'Pizza Bufalina':   { 'Napoli': 0.62 },
  'Carbonara':        { 'Roma': 0.96 },
};
// Inflazione lieve negli ultimi 12 mesi · base 100 = 12 mesi fa, 100+x = oggi
const DISH_INFLATION = { default: 2.8, 'Pizza Margherita': 4.2, 'Carbonara': 3.4, 'Spritz Aperol': 4.8, 'Tagliata di manzo': 2.6, 'Tiramisù': 1.8 };
// Componente stagionale lieve sul prezzo (in % moltiplicativi mese per mese)
const DISH_PRICE_SEASONAL_DEFAULT = [0,0,0,0,0,0,0,0,0,0,0,0];
const DISH_PRICE_SEASONAL = {
  'Pizza Margherita': [-1, 0, 1, 1, 0,-1,-1,-2,-1, 0, 1, 2],
  'Carbonara':        [ 0, 0,-1, 0, 1, 2, 3, 2, 1, 0,-1, 0],
  'Tagliata di manzo':[ 0, 1, 1,-1,-1, 0, 2, 1, 0,-1,-1, 0],
  'Tiramisù':         [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  'Spritz Aperol':    [ 3, 4, 5, 3, 0,-3,-3,-3,-2, 0, 2, 4],
  'Gelato artigianale':[ 4, 5, 5, 3, 0,-2,-3,-3,-1, 1, 2, 3],
  'Panettone':        [-2,-2,-2,-2,-2,-2,-1, 0, 1, 2, 4, 6],
  'Colomba pasquale': [-1,-1, 0, 6, 0,-1,-1,-1,-1, 0, 0, 0],
};
const DISH_LOOKUP = Object.fromEntries(DISH_CATALOG.map(d => [d.n, d]));
const dishBasePrice = (dishName) => {
  const d = DISH_LOOKUP[dishName];
  if (!d) return 12;
  return d.basePrice ?? DISH_CAT_BASE[d.cat] ?? 12;
};
const dishPriceForCity = (dishName, city) => {
  const base = dishBasePrice(dishName);
  const override = (CITY_PRICE_OVERRIDE[dishName] || {})[city];
  const mult = override ?? CITY_PRICE_MULT[city] ?? 1;
  return Math.round(base * mult * 100) / 100;
};
const seasonalSeriesFor = (dishName, region) => {
  const d = DISH_LOOKUP[dishName];
  if (!d) return Array(12).fill(100);
  const base = SEASONAL_ARC[d.arc];
  if (region === 'Tutta Italia') return base.slice();
  const m = (SEASONAL_BIAS[d.arc] || {})[region] || 1;
  return base.map(v => Math.round(v * m));
};

// ════════════════════════════════════════════════════════════════════════════
// TIME-SERIES · genera serie giornaliere 90gg seedate + helper di confronto
// (data-scientist perspective: tutti i KPI devono avere context temporale)
// ════════════════════════════════════════════════════════════════════════════
function pseudoRandSeed(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function genDaily(seed, days, latest, weeklyTrendPct=0.02, weekendFactor=0, vol=0.06) {
  const r = pseudoRandSeed(seed);
  const out = new Array(days);
  out[days-1] = latest;
  // ricostruzione retroattiva con trend e rumore
  for (let i = days-2; i >= 0; i--) {
    const daily = weeklyTrendPct / 7;
    const noise = (r() - 0.5) * 2 * vol;
    const factor = 1 + daily + noise;
    out[i] = Math.max(1, out[i+1] / factor);
  }
  // weekend bump/dip (locali → weekend ↑, B2B saas → weekend ↓)
  if (weekendFactor !== 0) {
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today); d.setDate(today.getDate() - (days-1-i));
      const dow = d.getDay();
      if (dow === 0 || dow === 6) out[i] *= (1 + weekendFactor);
    }
  }
  return out.map(v => Math.round(v));
}
// WoW (last 7 vs previous 7) — il confronto più utile per metriche giornaliere
function woW(series) {
  if (!series || series.length < 14) return { delta:0, last:0, prev:0 };
  const last = series.slice(-7).reduce((s,v)=>s+v,0);
  const prev = series.slice(-14,-7).reduce((s,v)=>s+v,0);
  return { last, prev, delta: prev > 0 ? ((last - prev) / prev) * 100 : 0 };
}
// MoM (last 30 vs previous 30)
function moM(series) {
  if (!series || series.length < 60) return { delta:0, last:0, prev:0 };
  const last = series.slice(-30).reduce((s,v)=>s+v,0);
  const prev = series.slice(-60,-30).reduce((s,v)=>s+v,0);
  return { last, prev, delta: prev > 0 ? ((last - prev) / prev) * 100 : 0 };
}

const _mese = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
const _mesePrec = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2];
const _ricaviGiornoCorr = Math.round((_mese.sub + _mese.extra) / 30);
const _ricaviMoMReal = ((_mese.sub + _mese.extra) - (_mesePrec.sub + _mesePrec.extra)) / (_mesePrec.sub + _mesePrec.extra) * 100;

const TS = {
  ricaviDay:    genDaily(101, 90, _ricaviGiornoCorr, 0.025, 0.08, 0.06),
  utentiTot:    genDaily(104, 90, UTENTI_BASE, 0.018, 0, 0.008),
  dau:          genDaily(105, 90, APP_METRICS.dau, 0.015, 0.12, 0.07),
  wau:          genDaily(106, 90, APP_METRICS.wau, 0.013, 0.04, 0.05),
  mau:          genDaily(107, 90, APP_METRICS.mau, 0.012, 0.02, 0.04),
  guestAccessi: genDaily(108, 90, 520, 0.015, 0.18, 0.08),
  newReg:       genDaily(109, 90, 108, 0.020, 0.08, 0.12),
  staffActive:  genDaily(110, 90, STAFF_METRICS.activeOggi, 0.008, 0.22, 0.05),
  staffTot:     genDaily(118, 90, STAFF_METRICS.totCamerieri, 0.012, 0, 0.005),
  ordiniTavolo: genDaily(111, 90, 1280, 0.012, 0.20, 0.06),
  inOnboardCount: genDaily(112, 90, 17, -0.008, 0, 0.18),
  prenotApp:    genDaily(113, 90, Math.round(APP_METRICS.prenotazioniApp30g/30), 0.014, 0.15, 0.10),
  ordiniGuest:  genDaily(114, 90, Math.round(APP_METRICS.ordiniGuest30g/30), 0.011, 0.16, 0.09),
};
// Override ricavi con dato reale (uso MoM da MONTHLY_REVENUE)
const TS_RICAVI_MOM = { delta: _ricaviMoMReal, last: _mese.sub+_mese.extra, prev: _mesePrec.sub+_mesePrec.extra };

// ─── Trend badge inline (Apple-style: minimal, contestuale, una sola riga) ──
function TrendBadge({ delta, label='vs 7gg', size='sm', tone, hideLabel=false }) {
  const positive = delta > 0.5;
  const negative = delta < -0.5;
  const c = tone || (positive ? ADM.OK : negative ? ADM.DANGER : ADM.MUTED);
  const arrow = positive ? '↑' : negative ? '↓' : '→';
  const fs = size === 'lg' ? 13.5 : size === 'sm' ? 11.5 : 12;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4, whiteSpace:'nowrap',
      padding:'2px 7px', borderRadius:99,
      background:`${c}14`, color:c,
      fontSize: fs, fontWeight: 700, letterSpacing:'-0.005em',
    }}>
      <span style={{fontSize: fs+1, lineHeight:1, fontWeight:800}}>{arrow}</span>
      <span>{Math.abs(delta).toFixed(1)}%</span>
      {!hideLabel && <span style={{fontWeight:500, opacity:0.7, marginLeft:1}}>{label}</span>}
    </span>
  );
}

// Sparkline minimale: range calcolato sui dati e punto finale in evidenza
function MicroSpark({ data, color, height=22, width=78 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const area = `0,${height} ${pts} ${width},${height}`;
  const lastX = width;
  const lastY = height - ((data[data.length-1] - min) / range) * height;
  return (
    <svg width={width} height={height} style={{display:'block', overflow:'visible'}}>
      <polygon points={area} fill={color} fillOpacity={0.10}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lastX} cy={lastY} r={2.2} fill={color}/>
    </svg>
  );
}

// ─── Aging onboarding · giorni dal blocco ────────────────────────────────────
function ageDaysInOnboarding(locale) {
  // Per pending/onboarding: giorni dalla data iscrizione (o dall'ultimo step completato)
  if (locale.stato !== 'pending' && locale.stato !== 'onboarding') return 0;
  const lastStepTime = locale.completedSteps && locale.completedSteps.length > 0 && locale.stepTimes
    ? Math.max(...locale.completedSteps.map(s => locale.stepTimes[s] ? new Date(locale.stepTimes[s]).getTime() : 0))
    : new Date(locale.dataIscrizione).getTime();
  return Math.max(0, Math.floor((Date.now() - lastStepTime) / 86400000));
}

// Chi è fermo in onboarding, e da quanto. Sta a livello di modulo perché lo
// leggono due tab: Generale per il numero, Locali per l'elenco di chi
// richiamare.
function onboardingFermi() {
  const dettaglio = LOCALI.filter(l => l.stato === 'pending' || l.stato === 'onboarding')
    .map(l => ({ l, age: ageDaysInOnboarding(l) }));
  const ordinati = [...dettaglio].sort((a, b) => a.age - b.age);
  return {
    dettaglio,
    stuckOver7: dettaglio.filter(x => x.age >= 7).length,
    stuckOver14: dettaglio.filter(x => x.age >= 14).length,
    ageMedian: ordinati.length ? ordinati[Math.floor(ordinati.length / 2)].age : 0,
    setupIniziale: LOCALI.filter(l => l.stato === 'pending' || l.stato === 'onboarding').length,
    onbIncompleto: LOCALI.filter(l => l.stato === 'skipped').length,
  };
}


function AdmDashboard({ onNav }) {
  const [tab, setTab] = useStateDash('generale');
  const [reportSent, setReportSent] = useStateDash(false);
  // Segmento e periodo hanno perimetri diversi, e la barra li dichiara uno
  // per uno. Piano e regione valgono dove i blocchi leggono i locali: Locali
  // e Staff. Il Generale è di piattaforma — MRR, utenti app, salute — e
  // dichiararlo filtrabile faceva reagire il contatore della barra mentre
  // ogni numero della tab restava identico. Il periodo invece vive dove c'è
  // una serie da ri-finestrare: oggi i grafici di andamento del Generale;
  // nelle altre tab le finestre sono fisse o le scelgono le card.
  const [filtri, setFiltri] = useStateDash(window.AN_FILTRI_VUOTI || { periodo:'365', piano:'tutti', regione:'tutte' });
  const segmentoAttivo = ['locali', 'camerieri'].includes(tab);
  const periodoAttivo = tab === 'generale';

  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      {/* La testata alla maniera di Hubble: la pagina si presenta da sola,
          nell'header resta la briciola. La banda bianca delle tab, che prima
          toccava l'header, ora è una striscia con i suoi due bordi. */}
      <div style={{padding:'28px 28px 18px'}}>
        <HubTestata titolo="Analisi Dati"
          sotto="Come sta la piattaforma, letta dai numeri: locali, valore per il locale, utenti app, staff, servizio clienti e mercato."/>
      </div>
      <div style={{padding:'0 28px', background:'#fff', borderTop:`1px solid ${ADM.BORDER}`, borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:12}}>
        <AdmTabBar tabs={[
          { id:'generale', label:'Generale' },
          { id:'locali',   label:'Locali' },
          // Subito dopo Locali, perché è la stessa popolazione letta dal lato
          // del ristoratore: non «come vanno i nostri locali» ma «i nostri
          // locali ci guadagnano». Era la domanda senza risposta di tutta la
          // sezione, ed è quella che il 34% degli abbandoni ci fa in faccia.
          { id:'valore',   label:'Valore per il locale' },
          { id:'utentiapp',label:'Utenti App' },
          { id:'camerieri',label:'Staff' },
          // Stesso componente della sezione Chiamata assistenza → Andamento.
          // Qui i KPI stanno accanto a locali, utenti e staff perché il
          // servizio clienti è una delle facce dello stato della piattaforma,
          // non un capitolo a parte da andarsi a cercare.
          { id:'servizio', label:'Servizio Clienti' },
          // Ultima, e staccata di senso dalle altre: le cinque prima dicono
          // come sta byup, questa com'è il mercato in cui sta. Dentro Locali,
          // il food cost dei ristoranti sembrava una nostra metrica.
          { id:'mercato',  label:'Mercato' },
        ]} active={tab} onChange={setTab}/>
        <div style={{flex:1}}/>
        {reportSent
          ? <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700, whiteSpace:'nowrap'}}>✓ Report inviato a marco.rinaldi@byup.it</span>
          : <AdmButton variant="ghost" size="sm" icon="download" onClick={()=>{ setReportSent(true); setTimeout(()=>setReportSent(false), 3500); }}>Report mensile</AdmButton>}
      </div>
      {window.AnBarraFiltri ? <AnBarraFiltri filtri={filtri} onChange={setFiltri} attivo={segmentoAttivo} periodoAttivo={periodoAttivo}/> : null}
      <div>
        {tab === 'generale'  && <DashGenerale onNav={onNav} filtri={filtri}/>}
        {tab === 'locali'    && <DashLocali onNav={onNav} filtri={filtri}/>}
        {tab === 'valore'    && (window.DashValore ? <DashValore/> : null)}
        {tab === 'utentiapp' && <DashUtentiApp/>}
        {tab === 'camerieri' && <DashCamerieri filtri={filtri}/>}
        {tab === 'servizio'  && (window.AdmServizioClientiKPI ? <AdmServizioClientiKPI/> : null)}
        {tab === 'mercato'   && <DashMercato/>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Primitive del redesign Dashboard (Tier 1-3). Nate accanto a HoverStat, la
// vecchia tile con tooltip al hover: quando anche gli ultimi tab sono passati a
// queste, HoverStat è rimasta dichiarata e mai renderizzata, e se n'è andata.
// ═══════════════════════════════════════════════════════════════════════════

// Area chart responsive: riempie il contenitore, stroke costante (non-scaling),
// fill a gradient verticale. Sostituisce le sparkline che galleggiavano.
function AreaSpark({ data, color, height = 38, gradId, strokeW = 1.6 }) {
  if (!data || data.length < 2) return null;
  const W = 100, H = height, pad = 3;
  const max = Math.max(...data), min = Math.min(...data), range = (max - min) || 1;
  const xy = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    pad + (H - pad * 2) * (1 - (v - min) / range),
  ]);
  const line = xy.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const gid = gradId || 'as-grad';
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block'}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${line} ${W},${H}`} fill={`url(#${gid})`}/>
      <polyline points={line} fill="none" stroke={color} strokeWidth={strokeW} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// Barra proporzione (es. paganti vs free) — riempie il fondo di una stat card
// quando non c'è una serie storica, invece di lasciare la card vuota.
function MiniRatioBar({ a, b, aLabel, bLabel, aColor }) {
  const tot = (a + b) || 1;
  return (
    <div>
      <div style={{display:'flex', height:6, borderRadius:99, overflow:'hidden', background:ADM.BORDER_SOFT}}>
        <div style={{width:`${a/tot*100}%`, background:aColor||ADM.PINK}}/>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginTop:7, fontSize:12, color:ADM.MUTED}}>
        <span><b style={{color:ADM.TEXT}}>{a}</b> {aLabel}</span>
        <span><b style={{color:ADM.TEXT}}>{b}</b> {bLabel}</span>
      </div>
    </div>
  );
}

function DashHero({ label, value, trend, trendLabel, sub, detail, data, accent, onClick, selected }) {
  const c = accent || ADM.PINK;
  return (
    <AdmCard padding={0} interactive={!!onClick} onClick={onClick} style={{overflow:'hidden', cursor: onClick ? 'pointer' : 'default', ...(selected ? { border:`1px solid ${ADM.PINK}`, boxShadow:`0 0 0 3px ${ADM.PINK}38` } : {})}}>
      <div style={{display:'flex', alignItems:'stretch', minHeight:138}}>
        <div style={{flex:'1 1 44%', padding:'20px 24px', display:'flex', flexDirection:'column', justifyContent:'center', gap:8}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:12.5, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', flex:1, minWidth:0}}>{label}</span>
            {onClick && <span className="adm-open-chip"><BuIcons.chevronRight size={14}/></span>}
          </div>
          <div style={{display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap'}}>
            <span style={{fontSize:40, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1}}>{value}</span>
            {trend != null && <TrendBadge delta={trend} label={trendLabel} size="lg"/>}
          </div>
          {sub && <span style={{fontSize:13.5, color:ADM.MUTED}}>{sub}</span>}
          {detail && <span style={{fontSize:12.5, color:ADM.MUTED_SOFT}}>{detail}</span>}
        </div>
        <div style={{flex:'1 1 56%', minWidth:0, display:'flex', alignItems:'flex-end', borderLeft:`1px solid ${ADM.BORDER_SOFT}`}}>
          <div style={{width:'100%'}}>
            <AreaSpark data={data} color={c} height={138} gradId="grad-hero" strokeW={2}/>
          </div>
        </div>
      </div>
    </AdmCard>
  );
}

// Stat compatta (Tier 2) — 4 in fila, uniformi. Sparkline integrata in basso
// a tutta larghezza (o barra proporzione). Click = drill, ⓘ = dettaglio.
function DashStatCard({ label, value, trend, trendLabel, sub, alertText, data, ratio, accent='PINK', gradId, onClick, selected }) {
  const c = ADM[accent] || ADM.PINK;
  return (
    <AdmCard padding={0} interactive={!!onClick} onClick={onClick}
      style={{display:'flex', flexDirection:'column', cursor: onClick ? 'pointer' : 'default', overflow:'hidden', ...(selected ? { border:`1px solid ${ADM.PINK}`, boxShadow:`0 0 0 3px ${ADM.PINK}38` } : {})}}>
      <div style={{padding:'15px 16px 12px', display:'flex', flexDirection:'column', gap:7, flex:1}}>
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{label}</span>
          {onClick && <span className="adm-open-chip" style={{width:22, height:22}}><BuIcons.chevronRight size={13}/></span>}
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap'}}>
          <span style={{fontSize:29, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1}}>{value}</span>
          {trend != null && <TrendBadge delta={trend} label={trendLabel} size="sm"/>}
        </div>
        {alertText
          ? <span style={{fontSize:12.5, fontWeight:700, color:ADM.WARN, display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:6, height:6, borderRadius:'50%', background:ADM.WARN, flexShrink:0}}/>{alertText}</span>
          : sub ? <span style={{fontSize:12.5, color:ADM.MUTED, lineHeight:1.45}}>{sub}</span>
          : null}
      </div>
      {ratio
        ? <div style={{padding:'0 16px 14px'}}><MiniRatioBar {...ratio}/></div>
        : data
        ? <AreaSpark data={data} color={c} height={38} gradId={gradId}/>
        : <div style={{height:14}}/>}
    </AdmCard>
  );
}

// Dettaglio in-linea — click su TUTTA la card apre una fascia SOTTO, in pagina,
// senza overlay né sfondo scurito. Riusa i componenti *Tooltip esistenti come
// corpo → nessun dato perso. La card cliccata resta evidenziata.
function InlineDetail({ detail, onClose }) {
  if (!detail) return null;
  const c = detail.accent || ADM.PINK;
  return (
    <div style={{
      background:ADM.PANEL, border:`1px solid ${ADM.BORDER}`, borderRadius:14,
      boxShadow:ADM.CARD_SHADOW, overflow:'hidden',
      animation:'admExpandIn 0.24s cubic-bezier(0.22,0.9,0.35,1)',
    }}>
      <style>{`@keyframes admExpandIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{padding:'15px 20px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:12}}>
        <div style={{width:4, height:20, borderRadius:3, background:c, flexShrink:0}}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{detail.title}</div>
          {detail.subtitle && <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:1}}>{detail.subtitle}</div>}
        </div>
        {detail.onPage && (
          <button onClick={detail.onPage} className="adm-btn" style={{display:'inline-flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:9, background:'#fff', border:`1px solid ${ADM.BORDER}`, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, color:ADM.TEXT}}>
            {detail.pageLabel || 'Apri pagina'} <BuIcons.chevronRight size={14}/>
          </button>
        )}
        <button onClick={onClose} className="adm-iconbtn" title="Chiudi" style={{width:28, height:28, borderRadius:8, border:'none', background:ADM.NEUTRAL_SOFT, color:ADM.MUTED, cursor:'pointer', display:'grid', placeItems:'center', flexShrink:0}}>
          <BuIcons.x size={16}/>
        </button>
      </div>
      <div style={{padding:'20px 22px'}}>{detail.content}</div>
    </div>
  );
}

// Card "Ordini processati" — il volume che guida il modello di business
// (piani a ordini inclusi + extra fatturati). Confronto mese/media/anno,
// stessa terna per gli extra, mini-barre 12 mesi in ink.
function DashOrdiniCard({ mese, media, anno, extraMese, extraMedia, extraAnno, serie, trend }) {
  const maxV = Math.max(...serie, 1);
  return (
    <AdmCard padding={0} style={{overflow:'hidden', display:'flex', flexDirection:'column'}}>
      <div style={{padding:'20px 24px 12px', flex:1, display:'flex', flexDirection:'column', gap:8}}>
        <span style={{fontSize:12.5, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Ordini processati · ultimo mese</span>
        <div style={{display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap'}}>
          <span style={{fontSize:40, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1}}>{fmtNum(mese)}</span>
          {trend != null && <TrendBadge delta={trend} label="vs mese precedente" size="lg"/>}
        </div>
        <span style={{fontSize:13.5, color:ADM.MUTED}}>media <b style={{color:ADM.TEXT}}>{fmtNum(media)}</b>/mese · <b style={{color:ADM.TEXT}}>{fmtNum(anno)}</b> negli ultimi 12 mesi</span>
        <div style={{fontSize:12.5, color:ADM.MUTED, paddingTop:8, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
          Di cui <b style={{color:ADM.TEXT}}>extra</b> oltre piano: <b style={{color:ADM.TEXT}}>{fmtNum(extraMese)}</b> mese · media <b style={{color:ADM.TEXT}}>{fmtNum(extraMedia)}</b> · <b style={{color:ADM.TEXT}}>{fmtNum(extraAnno)}</b> anno
        </div>
      </div>
      <div style={{display:'flex', alignItems:'flex-end', gap:4, height:40, padding:'0 24px'}}>
        {serie.map((v, i) => {
          const last = i === serie.length - 1;
          return <div key={i} style={{flex:1, height:`${Math.max((v/maxV)*100, 4)}%`, background:ADM.INK, opacity: last ? 1 : 0.35, borderRadius:'3px 3px 0 0'}}/>;
        })}
      </div>
    </AdmCard>
  );
}

// ---------- GENERALE ----------
function DashGenerale({ onNav, filtri }) {
  // === LOCALI ===
  // Le categorie arrivano da LOC (admin-data.jsx), che le definisce una volta
  // sola: qui non se ne inventano di nuove, si contano quelle.
  const totLocali = LOC.totali;
  const attivi = LOC.attivi.length;
  const setupIniziale = LOCALI.filter(l => l.stato === 'pending' || l.stato === 'onboarding').length;
  const onbIncompleto = LOCALI.filter(l => l.stato === 'skipped').length;
  const inOnbTot = LOC.inOnboarding.length;
  const inattivi = LOC.inattivi.length;
  const churned = LOC.churned.length;

  // === AGING ONBOARDING · quanti fermi da più di 7gg (azionabile) ===
  const { dettaglio: onbLocaliDetail, stuckOver7, stuckOver14, ageMedian } = onboardingFermi();

  // Piani: si contano sulla BASE INSTALLATA (attivi + inattivi), che è la sola
  // popolazione che un piano ce l'ha. Chi è in onboarding non ha ancora
  // scelto, chi ha disdetto non paga più.
  const livePool = LOC.live;
  const freeCount = LOC.gratuiti.length;
  const freeActive = LOC.gratuiti.filter(locAttivo).length;
  const freeInactive = LOC.gratuiti.filter(locInattivo).length;
  const payingPool = LOC.paganti;
  const paying = payingPool.length;
  const planCount = (pid) => livePool.filter(l => l.piano === pid).length;

  // === RICAVI ===
  const mese = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
  const mrrSubMese = mese.sub;
  const mrrExtraMese = mese.extra;
  const mrrMese = mrrSubMese + mrrExtraMese;

  const last12 = MONTHLY_REVENUE.slice(-12);
  const subAnno = last12.reduce((s, m) => s + m.sub, 0);
  const extraAnno = last12.reduce((s, m) => s + m.extra, 0);
  const ricaviAnno = subAnno + extraAnno;

  // Il periodo della barra ri-finestra i due grafici di andamento: 30 e 90
  // giorni affettano la serie giornaliera, «12 mesi» passa alla mensile —
  // così ogni scelta mostra dati che esistono davvero, senza spacciare 90
  // giorni per un anno. I valori grandi delle card non cambiano: dichiarano
  // «ultimo mese» e «12 mesi» nel testo, e il filtro non deve riscriverli.
  const periodo = (filtri && filtri.periodo) || '365';
  const heroRicaviData = periodo === '365'
    ? last12.map(m => m.sub + m.extra)
    : TS.ricaviDay.slice(-Number(periodo));
  const mesiPeriodo = periodo === '30' ? 1 : periodo === '90' ? 3 : 12;

  // === UTENTI APP ===
  const totUtenti = UTENTI_BASE;
  const attivi24 = APP_METRICS.dau;

  // Accessi guest: la costante, non una stima ricavata dagli ordini. Erano due
  // numeri per la stessa cosa — 15,6k qui e 26,4k in APP_METRICS — e la
  // conversione che ne usciva era quella del numero sbagliato.
  const guestLog30g = APP_METRICS.sessioniGuest30g;
  const ordiniGuest30g = APP_METRICS.ordiniGuest30g;


  // Ordini processati — serie 12 mesi derivata (mock) in proporzione ai ricavi.
  const totOrdiniMese = LOCALI.reduce((s2,l)=>s2+(l.ordiniMese||0),0);
  const totOrdiniAnno = LOCALI.reduce((s2,l)=>s2+(l.ordiniAnno||0),0);
  const mediaOrdiniMese = Math.round(totOrdiniAnno/12);
  const lastRevTot = mese.sub + mese.extra;
  const ordiniSerie12 = last12.map(m => Math.round((m.sub+m.extra) * totOrdiniMese / lastRevTot));
  const ordiniMoM = (() => { const a=ordiniSerie12[ordiniSerie12.length-1]||0, b=ordiniSerie12[ordiniSerie12.length-2]||a; return b ? ((a-b)/b*100) : 0; })();
  // Ordini oltre piano: si contano dai locali, uno per uno. Prima si
  // dividevano gli euro di extra per «≈0,30 a ordine», un prezzo medio
  // inventato quando il listino ne ha quattro veri (0,45 / 0,34 / 0,23 /
  // 0,12) e i locali che sfondano si sanno per nome.
  const extraOrdMese = ESPANSIONE.sopraSoglia.reduce((s2, l) => s2 + (l.ordiniOltre || 0), 0);
  const prezzoExtraMedio = extraOrdMese ? mrrExtraMese / extraOrdMese : 0.3;
  const extraOrdAnno = prezzoExtraMedio ? Math.round(extraAnno / prezzoExtraMedio) : 0;
  const extraOrdMedia = Math.round(extraOrdAnno / 12);

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:20}}>

      {/* La fascia «Richiede attenzione» stava qui e non c'è più. Questa
          schermata si chiama Analisi Dati e serve a leggere come sta la
          piattaforma: una coda di cose da fare in cima le dava un compito che
          non è il suo, e ogni voce viveva comunque nella sezione che quella
          cosa la risolve — i corrispettivi e la coda di retry in Diagnostica,
          gli addebiti falliti e gli onboarding fermi in Locali, segnalazioni e
          certificazioni in Assistenza. */}


      {/* La riga di salute apre la sezione. L'intestazione «In sintesi» che
          stava qui sopra ripeteva parola per parola il titolo della card che
          segue: una delle due era di troppo, ed era quella che non porta
          numeri. */}
      {window.AnSalute ? <AnSalute onNav={onNav}/> : null}

      {/* ═══════════ Tier 1 · Andamento — il polso della piattaforma ═══════════ */}
      <SectionLabel title="Andamento" desc="Ricavi, ordini e base clienti nel dettaglio"/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:14}}>
        <DashHero
          label="Ricavi · ultimo mese"
          value={fmtEur(mrrMese)}
          trend={TS_RICAVI_MOM.delta}
          trendLabel="vs mese precedente"
          sub={`${fmtEur(mrrSubMese)} abbonamenti · ${fmtEur(mrrExtraMese)} extra ordini`}
          detail={`Ultimi 12 mesi ${fmtEur(ricaviAnno)} · media ${fmtEur(Math.round(ricaviAnno/12))}/mese`}
          data={heroRicaviData}
          accent={ADM.PINK}
        />
        <DashOrdiniCard
          mese={totOrdiniMese} media={mediaOrdiniMese} anno={totOrdiniAnno}
          extraMese={extraOrdMese} extraMedia={extraOrdMedia} extraAnno={extraOrdAnno}
          serie={ordiniSerie12.slice(-mesiPeriodo)} trend={ordiniMoM}
        />
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        {/* La scomposizione copre tutti e cinquanta: attivi, inattivi, in
            onboarding, disdetti. La barra sotto NON è su questo totale ma
            sulla base installata, ed è scritto — prima diceva 24 paganti e 7
            gratuiti sotto un totale di 50, lasciando diciannove locali senza
            collocazione. */}
        <DashStatCard
          label="Locali totali" value={fmtNum(totLocali)} accent="INK"
          sub={`${attivi} attivi · ${inattivi} inattivi · ${inOnbTot} in onboarding · ${churned} disdetti`}
          ratio={{ a: paying, b: freeCount, aLabel:`paganti (su ${livePool.length} con un piano)`,
            bLabel:'gratuiti', aColor: ADM.INK }}
        />
        {/* Non si apre più: l'elenco di chi è fermo era una lista di telefonate
            da fare nascosta dietro un clic, in una schermata che serve a dire
            come sta la piattaforma. Vive in Locali → Onboarding e adozione,
            accanto al funnel che dice DOVE si bloccano. */}
        <DashStatCard
          label="Locali in onboarding" value={fmtNum(inOnbTot)} accent="WARN"
          alertText={stuckOver7 > 0 ? `${stuckOver7} fermi da oltre 7gg · l'elenco è in Locali` : null}
          sub={`${setupIniziale} in setup · ${onbIncompleto} da completare · l'elenco è in Locali`}
          data={TS.inOnboardCount.slice(-30)} gradId="grad-onb"
        />
        {/* Non si apre più: l'espansione mostrava attivi a 24h/7g/30g, cioè
            DAU, WAU e MAU, che nel tab Utenti App sono già tre card intere
            con serie storica e variazione. Qui resta il totale con l'attività
            di oggi, e il resto si legge dove vive. */}
        <DashStatCard
          label="Utenti totali" value={fmtNum(totUtenti)} accent="INK"
          trend={woW(TS.utentiTot).delta} trendLabel="7gg"
          sub={<span><b style={{color:ADM.TEXT}}>{fmtNum(attivi24)}</b> attivi oggi · <b style={{color:ADM.TEXT}}>{Math.round(attivi24/totUtenti*100)}%</b> dei registrati · il dettaglio è in Utenti App</span>}
          data={TS.utentiTot.slice(-30)} gradId="grad-ute"
        />
        <DashStatCard
          label="Accessi guest · 30gg" value={fmtNum(guestLog30g)} accent="INK"
          trend={moM(TS.guestAccessi).delta} trendLabel="30gg"
          sub={<span><b style={{color:ADM.TEXT}}>{fmtNum(ordiniGuest30g)}</b> ordini · il guest si legge in Utenti App</span>}
          data={TS.guestAccessi.slice(-30)} gradId="grad-gue"
        />
      </div>

      {/* ═══════════ In dettaglio — gli approfondimenti chiave, a vista ═══════════ */}
      <SectionLabel title="In dettaglio" desc="Gli approfondimenti chiave, sempre visibili"/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:14, alignItems:'start'}}>
        <AdmCard padding={20}>
          <RevenueTooltip sub={mrrSubMese} extra={mrrExtraMese} subAnno={subAnno} extraAnno={extraAnno} ricaviAnno={ricaviAnno} mesePrec={MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2]}/>
        </AdmCard>
        <AdmCard padding={20}>
          <LocaliTotaliTooltip total={totLocali} free={freeCount} freeActive={freeActive} freeInactive={freeInactive} paying={paying} planCount={planCount}/>
        </AdmCard>
      </div>

      {/* Le parole e la loro affidabilità: sta in fondo perché si legge quando
          serve, ma sta in Generale perché vale per tutte le tab. */}
      <SectionLabel title="Come si leggono questi numeri" desc="Le definizioni, e quanto è buona l'anagrafica su cui poggiano"/>
      {window.AnDefinizioni ? <AnDefinizioni/> : null}


    </div>
  );
}

// ─── Section label · separatore di gerarchia (Agire / Monitorare / Esplorare) ─
function SectionLabel({ title, desc, muted, first }) {
  return (
    <div style={{display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap', marginTop: first ? 6 : 14, marginBottom:2}}>
      <div style={{fontSize:13, fontWeight:700, color: muted ? ADM.MUTED : ADM.TEXT, textTransform:'uppercase', letterSpacing:'0.07em'}}>{title}</div>
      {desc && <div style={{fontSize:13, color:ADM.MUTED_SOFT, fontWeight:500}}>{desc}</div>}
    </div>
  );
}

// ─── Tooltip contents ────────────────────────────────────────────────────────
function RevenueTooltip({ sub, extra, subAnno, extraAnno, ricaviAnno, mesePrec }) {
  const mesePrecTot = mesePrec.sub + mesePrec.extra;
  const meseTot = sub + extra;
  const delta = mesePrecTot > 0 ? ((meseTot - mesePrecTot) / mesePrecTot) * 100 : 0;

  return (
    <div>
      <TooltipTitle>Spaccato ricavi</TooltipTitle>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:14}}>
        <div>
          <div style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>Ultimo mese</div>
          <RevRow color={ADM.INK} label="Abbonamenti" val={fmtEur(sub)}/>
          <RevRow color={ADM.INK_SOFT} label="Extra ordini" val={fmtEur(extra)}/>
          <div style={{borderTop:`1px solid ${ADM.BORDER_SOFT}`, marginTop:7, paddingTop:7, display:'flex', justifyContent:'space-between'}}>
            <span style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT}}>Totale</span>
            <span style={{fontSize:14.4, fontWeight:800, color:ADM.TEXT}}>{fmtEur(sub + extra)}</span>
          </div>
          {Math.abs(delta) > 0.5 && (
            <div style={{fontSize:13, color: delta >= 0 ? ADM.OK : ADM.DANGER, marginTop:5, fontWeight:600}}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}% vs mese precedente
            </div>
          )}
        </div>
        <div>
          <div style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>Ultimo anno (12m)</div>
          <RevRow color={ADM.INK} label="Abbonamenti" val={fmtEur(subAnno)}/>
          <RevRow color={ADM.INK_SOFT} label="Extra ordini" val={fmtEur(extraAnno)}/>
          <div style={{borderTop:`1px solid ${ADM.BORDER_SOFT}`, marginTop:7, paddingTop:7, display:'flex', justifyContent:'space-between'}}>
            <span style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT}}>Totale</span>
            <span style={{fontSize:14.4, fontWeight:800, color:ADM.TEXT}}>{fmtEur(ricaviAnno)}</span>
          </div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:5}}>Media mensile {fmtEur(Math.round(ricaviAnno/12))}</div>
        </div>
      </div>

      {/* Mini stacked bar mensile (12m) */}
      <div style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6}}>Andamento 12 mesi</div>
      <MiniRevBar/>
    </div>
  );
}

function MiniRevBar() {
  const last12 = MONTHLY_REVENUE.slice(-12);
  const max = Math.max(...last12.map(m => m.sub + m.extra), 1);
  return (
    <div style={{display:'flex', alignItems:'flex-end', gap:4, height:48}}>
      {last12.map((m, i) => {
        const totH = ((m.sub + m.extra) / max) * 100;
        const subH = (m.sub / (m.sub + m.extra)) * totH;
        return (
          <div key={i} style={{flex:1, height:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
            <div style={{width:'100%', height:`${totH - subH}%`, background:ADM.INK_SOFT, borderRadius:'3px 3px 0 0'}}/>
            <div style={{width:'100%', height:`${subH}%`, background:ADM.INK}}/>
            <div style={{fontSize:11, color:ADM.MUTED_SOFT, marginTop:3, textAlign:'center', fontWeight:600}}>{m.mese.slice(0,3)}</div>
          </div>
        );
      })}
    </div>
  );
}

function RevRow({ color, label, val }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8, padding:'4px 0'}}>
      <span style={{width:8, height:8, borderRadius:2, background:color}}/>
      <span style={{fontSize:13.7, color:ADM.TEXT, flex:1}}>{label}</span>
      <span style={{fontSize:14, fontWeight:700, color:ADM.TEXT}}>{val}</span>
    </div>
  );
}

function LocaliTotaliTooltip({ total, free, freeActive, freeInactive, paying, planCount }) {
  const freePct = total > 0 ? (free / total) * 100 : 0;
  const payPct = total > 0 ? (paying / total) * 100 : 0;
  const freeActPct = free > 0 ? Math.round((freeActive / free) * 100) : 0;
  const freeInactPct = free > 0 ? Math.round((freeInactive / free) * 100) : 0;

  const paidPlans = PIANI.filter(p => p.id !== 'free');
  return (
    <div>
      <TooltipTitle>Spaccato per piano</TooltipTitle>
      {/* La base va dichiarata: le percentuali qui sotto sono sui locali che un
          piano ce l'hanno — chi è in onboarding non l'ha ancora scelto, chi ha
          disdetto non paga più. Senza questa riga sembrava uno spaccato dei
          cinquanta locali che ne copriva sessantadue. */}
      <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:-4, marginBottom:12, lineHeight:1.45}}>
        Su <b style={{color:ADM.TEXT}}>{paying + free} locali con un piano attivo</b> (attivi e inattivi).
        Gli altri {LOC.totali - (paying + free)} sono in onboarding o hanno disdetto.
      </div>

      {/* Free vs Paganti */}
      <div style={{marginBottom:16}}>
        <div style={{display:'flex', height:8, borderRadius:99, overflow:'hidden', background:'#F0F1F3', marginBottom:10}}>
          <div style={{width:`${payPct}%`, background:`linear-gradient(90deg, ${ADM.PINK}, ${ADM.PINK_DARK})`}}/>
          <div style={{width:`${freePct}%`, background:'#D1D5DB'}}/>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <SplitRow color={ADM.PINK_DARK} label="Paganti" val={paying} pct={Math.round(payPct)}/>
          <SplitRow color="#9CA3AF" label="Piano free" val={free} pct={Math.round(freePct)}/>
        </div>
      </div>

      {/* Free attivi vs inattivi */}
      <div style={{paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`, marginBottom:14}}>
        <div style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>
          Suddivisione piano free
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
          <span style={{width:9, height:9, borderRadius:2, background:ADM.OK}}/>
          <span style={{fontSize:13.7, color:ADM.TEXT, flex:1, fontWeight:500}}>Free attivi</span>
          <div style={{width:60, height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
            <div style={{width:`${freeActPct}%`, height:'100%', background:ADM.OK}}/>
          </div>
          <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:700, width:32, textAlign:'right'}}>{freeActive}</span>
          <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, width:36, textAlign:'right'}}>{freeActPct}%</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{width:9, height:9, borderRadius:2, background:ADM.MUTED_LIGHT}}/>
          <span style={{fontSize:13.7, color:ADM.TEXT, flex:1, fontWeight:500}}>Free inattivi</span>
          <div style={{width:60, height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
            <div style={{width:`${freeInactPct}%`, height:'100%', background:ADM.MUTED_LIGHT}}/>
          </div>
          <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:700, width:32, textAlign:'right'}}>{freeInactive}</span>
          <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, width:36, textAlign:'right'}}>{freeInactPct}%</span>
        </div>
      </div>

      {/* Solo paganti — breakdown */}
      <div style={{paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
        <div style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>
          Distribuzione tra paganti
        </div>
        {paidPlans.map(p => {
          const c = planCount(p.id);
          const pct = paying > 0 ? Math.round((c / paying) * 100) : 0;
          return (
            <div key={p.id} style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
              <span style={{width:9, height:9, borderRadius:2, background:ADM[p.color]}}/>
              <span style={{fontSize:13.7, color:ADM.TEXT, flex:1, fontWeight:500}}>{p.label}</span>
              <div style={{width:60, height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                <div style={{width:`${pct}%`, height:'100%', background:ADM[p.color]}}/>
              </div>
              <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:700, width:32, textAlign:'right'}}>{c}</span>
              <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, width:36, textAlign:'right'}}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SplitRow({ color, label, val, pct }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <span style={{width:9, height:9, borderRadius:2, background:color, flexShrink:0}}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>{label}</div>
        <div style={{fontSize:15.8, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{val} <span style={{fontSize:13, color:ADM.MUTED_SOFT, fontWeight:500}}>· {pct}%</span></div>
      </div>
    </div>
  );
}

// I locali fermi in onboarding: una card, non un pannello che si apre.
//
// Stava dietro il clic sulla card «Locali in onboarding» in Generale, e non è
// un approfondimento: è una lista di telefonate da fare — chi è fermo, da
// quanti giorni, e il link per aprirlo. Una coda di lavoro dietro un clic, in
// una schermata di sintesi, è una coda che non smaltisce nessuno.
//
// Vive in Locali → Onboarding e adozione, sotto il funnel: il funnel dice a
// quale passo si bloccano, questa dice chi si è bloccato.
function OnboardingDaSeguire({ onNav }) {
  const { dettaglio, stuckOver7, stuckOver14, ageMedian, setupIniziale, onbIncompleto } = onboardingFermi();
  const ordinati = [...dettaglio].sort((a, b) => b.age - a.age);
  return (
    <AdmCard padding={0} style={{overflow:'hidden'}}>
      <div style={{padding:'14px 20px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
        display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
        <div style={{width:4, height:20, borderRadius:3, background: stuckOver14 > 0 ? ADM.DANGER : ADM.WARN, flexShrink:0}}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Locali da seguire</div>
          <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:1}}>
            {dettaglio.length} in onboarding · mediana {ageMedian} giorni · dal più fermo
          </div>
        </div>
        {stuckOver7 > 0 && (
          <span style={{fontSize:12.6, fontWeight:700, color: stuckOver14 > 0 ? ADM.DANGER : ADM.WARN,
            background: stuckOver14 > 0 ? ADM.DANGER_SOFT : ADM.WARN_SOFT,
            padding:'5px 11px', borderRadius:99, whiteSpace:'nowrap'}}>
            {stuckOver7} fermi da oltre 7 giorni{stuckOver14 > 0 ? ` · ${stuckOver14} oltre 14` : ''}
          </span>
        )}
      </div>

      <div className="adm-scroll" style={{maxHeight:330, overflowY:'auto'}}>
        {ordinati.map(({ l, age }, i) => {
          const tono = age >= 14 ? ADM.DANGER : age >= 7 ? ADM.WARN : ADM.MUTED_LIGHT;
          return (
            <button key={l.id} onClick={()=>onNav && onNav('locali', { openLocale: l })} style={{
              all:'unset', cursor:'pointer', width:'100%', boxSizing:'border-box',
              display:'grid', gridTemplateColumns:'10px minmax(0,1fr) 190px 70px 20px',
              alignItems:'center', gap:12, padding:'10px 20px',
              borderTop: i ? `1px solid ${ADM.BORDER_SOFT}` : 'none',
            }}
              onMouseEnter={e=>e.currentTarget.style.background = ADM.PANEL_SOFT}
              onMouseLeave={e=>e.currentTarget.style.background = 'transparent'}>
              <span style={{width:7, height:7, borderRadius:'50%', background:tono}}/>
              <span style={{minWidth:0}}>
                <span style={{display:'block', fontSize:13.6, fontWeight:600, color:ADM.TEXT,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.nome}</span>
                <span style={{display:'block', fontSize:11.8, color:ADM.MUTED_LIGHT, marginTop:1}}>{l.citta}</span>
              </span>
              <span style={{fontSize:12.8, color:ADM.MUTED}}>
                {/* Il sotto-passo di «Il tuo locale» si dice qui, dove serve
                    a chi telefona; l'imbuto conta il passo e basta. */}
                {l.stato === 'pending' ? 'Non ha ancora iniziato' : `Fermo a «${(ONB_STEPS.find(s2 => s2.id === l.stoppedAt) || {}).label || '—'}${l.stoppedSub ? ' · ' + onbSottoLabel(l.stoppedSub) : ''}»`}
              </span>
              <span style={{fontSize:13.6, fontWeight:800, color:tono, textAlign:'right',
                fontVariantNumeric:'tabular-nums'}}>{age} gg</span>
              <span style={{color:ADM.MUTED_LIGHT, display:'grid', placeItems:'center'}}><BuIcons.chevronRight size={15}/></span>
            </button>
          );
        })}
        {ordinati.length === 0 && <AdmEmpty icon="store" title="Nessuno fermo" desc="Tutti hanno finito la configurazione"/>}
      </div>

      {/* La scomposizione dei numeri della card in Generale: «17 di che tipo?»
          è la prima domanda che si fa chi la legge, e la risposta è qui. */}
      <div style={{padding:'13px 20px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
        display:'flex', gap:26, flexWrap:'wrap'}}>
        <span style={{fontSize:12.8, color:ADM.MUTED}}>
          <b style={{color:ADM.TEXT}}>{setupIniziale}</b> non hanno finito la configurazione di base — non operano ancora
        </span>
        <span style={{fontSize:12.8, color:ADM.MUTED}}>
          <b style={{color:ADM.TEXT}}>{onbIncompleto}</b> operano avendo saltato la configurazione completa (informazioni, aspetto, personale)
        </span>
      </div>
    </AdmCard>
  );
}


function ConvOnboardingTooltip({ tot, completati, tentati, convRate, pending, inOnboarding, skipped }) {
  // Due righe, non tre: chi ha saltato la configurazione completa è ARRIVATO
  // all'avvio, e sta fra i completati — lo si dice sotto, come sottoinsieme.
  const rows = [
    { label: 'Completati · Go-live',  desc: 'Percorso rapido finito: il locale opera',      count: completati,   color: 'OK',   base: tentati },
    { label: 'In onboarding · fermi', desc: 'Hanno iniziato e non sono arrivati all\'avvio', count: inOnboarding, color: 'WARN', base: tentati },
  ];
  return (
    <div>
      <TooltipTitle>Conversione onboarding · spaccato</TooltipTitle>

      {/* Box riepilogo */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14}}>
        <div style={{padding:'12px 14px', background:`${ADM.OK}10`, border:`1px solid ${ADM.OK}40`, borderRadius:9}}>
          <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Conversion rate</div>
          <div style={{fontSize:20.9, fontWeight:800, color:ADM.TEXT, marginTop:5, letterSpacing:'-0.02em', lineHeight:1}}>{convRate}%</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:4}}>{completati} di {tentati} iscritti</div>
        </div>
        <div style={{padding:'12px 14px', background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:9}}>
          <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Iscritti totali</div>
          <div style={{fontSize:20.9, fontWeight:800, color:ADM.TEXT, marginTop:5, letterSpacing:'-0.02em', lineHeight:1}}>{fmtNum(tot)}</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:4}}>{pending} in attesa di iniziare</div>
        </div>
      </div>

      {/* Stacked bar */}
      <div style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>Stato dell'onboarding</div>
      <div style={{display:'flex', height:8, borderRadius:99, overflow:'hidden', background:'#F0F1F3', marginBottom:12}}>
        <div style={{width:`${tentati>0 ? (completati/tentati)*100 : 0}%`,  background:ADM.OK}}/>
        <div style={{width:`${tentati>0 ? (inOnboarding/tentati)*100 : 0}%`, background:ADM.WARN}}/>
      </div>

      {/* Rows */}
      <div style={{display:'flex', flexDirection:'column', gap:9}}>
        {rows.map((r, i) => {
          const pct = r.base > 0 ? Math.round((r.count / r.base) * 100) : 0;
          return (
            <div key={i} style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{width:9, height:9, borderRadius:2, background:ADM[r.color], flexShrink:0}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13.7, color:ADM.TEXT, fontWeight:600}}>{r.label}</div>
                <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:1}}>{r.desc}</div>
              </div>
              <span style={{fontSize:14.4, color:ADM.TEXT, fontWeight:800, width:32, textAlign:'right'}}>{r.count}</span>
              <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, width:36, textAlign:'right'}}>{pct}%</span>
            </div>
          );
        })}
      </div>

      <div style={{marginTop:12, paddingTop:11, borderTop:`1px solid ${ADM.BORDER_SOFT}`, fontSize:13, color:ADM.MUTED, lineHeight:1.5}}>
        Fra i completati, <strong style={{color:ADM.TEXT}}>{skipped}</strong> hanno saltato la configurazione completa: operano, senza vetrina né personale.
        Il <strong style={{color:ADM.TEXT}}>conversion rate</strong> esclude chi non ha iniziato: misura quanti, una volta iniziato, arrivano davvero all'avvio.
      </div>
    </div>
  );
}

// Tooltip: Tempo medio setup — distribuzione + dettaglio per step
function TempoMedioSetupTooltip({ media, mediana, minV, maxV, campione, buckets, steps, maxStepMin }) {
  const fmtMin = (m) => m < 60 ? `${m} min` : `${Math.floor(m/60)}h ${m%60}m`;
  const totBuckets = buckets.reduce((s,b)=>s+b.count, 0) || 1;
  return (
    <div>
      <TooltipTitle>Tempo di setup · da iscrizione a Go-live</TooltipTitle>

      {/* Media / Mediana */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14}}>
        <div style={{padding:'12px 14px', background:`${ADM.PURPLE}10`, border:`1px solid ${ADM.PURPLE}40`, borderRadius:9}}>
          <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Media</div>
          <div style={{fontSize:20.9, fontWeight:800, color:ADM.PURPLE, marginTop:5, letterSpacing:'-0.02em', lineHeight:1}}>{fmtMin(media)}</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:4}}>su {campione} locali</div>
        </div>
        <div style={{padding:'12px 14px', background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:9}}>
          <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Mediana</div>
          <div style={{fontSize:20.9, fontWeight:800, color:ADM.TEXT, marginTop:5, letterSpacing:'-0.02em', lineHeight:1}}>{fmtMin(mediana)}</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:4}}>min {fmtMin(minV)} · max {fmtMin(maxV)}</div>
        </div>
      </div>

      {/* Distribuzione */}
      <div style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>Distribuzione</div>
      <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:14}}>
        {buckets.map((b, i) => {
          const pct = Math.round((b.count / totBuckets) * 100);
          return (
            <div key={i} style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{width:9, height:9, borderRadius:2, background:ADM[b.color], flexShrink:0}}/>
              <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:500, width:88, flexShrink:0}}>{b.range}</span>
              <div style={{flex:1, height:6, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                <div style={{width:`${pct}%`, height:'100%', background:ADM[b.color], borderRadius:99}}/>
              </div>
              <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:700, width:28, textAlign:'right'}}>{b.count}</span>
              <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, width:36, textAlign:'right'}}>{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Tempo medio per step */}
      <div style={{paddingTop:12, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
        <div style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>Tempo medio per step</div>
        <div style={{display:'flex', flexDirection:'column', gap:5}}>
          {steps.map((s, i) => {
            const w = Math.round((s.minutes / maxStepMin) * 100);
            const isSlow = s.minutes === maxStepMin && maxStepMin > 0;
            return (
              <div key={i} style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:13.3, color:ADM.TEXT, fontWeight:500, width:138, flexShrink:0}}>{s.label}</span>
                <div style={{flex:1, height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${w}%`, height:'100%', background: isSlow ? ADM.WARN : ADM.PURPLE, borderRadius:99}}/>
                </div>
                <span style={{fontSize:13.3, color: isSlow ? ADM.WARN : ADM.TEXT, fontWeight:700, width:54, textAlign:'right'}}>{fmtMin(s.minutes)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TooltipTitle({ children }) {
  return <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12}}>{children}</div>;
}

// Tooltip specifico per Ordini · Scan QR (mostra entrambi + tasso di conversione)
function ScanOrdiniTooltip({ scanMese, ordMese, ratioMese, scanAnno, ordAnno, ratioAnno }) {
  return (
    <div>
      <TooltipTitle>Ordini · Scan QR · spaccato temporale</TooltipTitle>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <ScanOrdiniBox label="Ultimi 30 giorni" scan={scanMese} ord={ordMese} ratio={ratioMese} primary/>
        <ScanOrdiniBox label="Ultimi 12 mesi"   scan={scanAnno} ord={ordAnno} ratio={ratioAnno}/>
      </div>
      <div style={{marginTop:11, fontSize:13, color:ADM.MUTED, lineHeight:1.5}}>
        La % indica il tasso di conversione: quanti scan QR diventano un ordine completato.
        Al numeratore ci sono i soli ordini nati da uno scan — cassa, cameriere e app
        restano fuori, perché non passano dal QR. Valori più alti significano migliore
        esperienza post-scan.
      </div>
    </div>
  );
}

function ScanOrdiniBox({ label, scan, ord, ratio, primary }) {
  const c = primary ? ADM.PINK : ADM.MUTED;
  return (
    <div style={{
      padding:'12px 14px',
      background: primary ? ADM.PINK_BG_SOFT : ADM.PANEL_SOFT,
      border:`1px solid ${primary ? ADM.PINK_SOFT : ADM.BORDER_SOFT}`,
      borderRadius:9,
    }}>
      <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:7}}>{label}</div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12, marginBottom:4}}>
        <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, flexShrink:0}}>Ordini da QR</span>
        <span style={{fontSize:15.1, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{fmtNum(ord)}</span>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12, marginBottom:7}}>
        <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, flexShrink:0}}>Scan QR</span>
        <span style={{fontSize:15.1, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{fmtNum(scan)}</span>
      </div>
      <div style={{borderTop:`1px solid ${primary ? ADM.PINK_SOFT : ADM.BORDER_SOFT}`, paddingTop:7, display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12}}>
        <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600, flexShrink:0}}>Conversione</span>
        <span style={{fontSize:16.6, fontWeight:800, color: c, letterSpacing:'-0.01em'}}>
          {scan > 0 ? `${(ratio * 100).toFixed(1).replace('.', ',')}%` : '—'}
        </span>
      </div>
    </div>
  );
}


// SparkStat · stat compatta con trend inline + sparkline (per le griglie 4-col)
function SparkStat({ label, value, sub, accent='PINK', icon='trendUp', trend, trendLabel, spark, onClick }) {
  const [hover, setHover] = React.useState(false);
  const Icon = BuIcons[icon] || BuIcons.trendUp;
  const c = ADM[accent];
  const hasTrend = trend !== undefined && trend !== null;
  return (
    <AdmCard padding={18} onClick={onClick} interactive={!!onClick}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        // Feedback SOLO se cliccabile: una card che reagisce all'hover senza
        // azione è una falsa affordance.
        cursor: onClick ? 'pointer' : 'default',
        borderColor: (onClick && hover) ? c : ADM.BORDER,
        boxShadow: (onClick && hover) ? `0 6px 18px -10px ${c}66` : 'none',
        transition:'border-color 0.15s, box-shadow 0.15s',
      }}>
      <div style={{display:'flex', alignItems:'flex-start', gap:12, marginBottom: spark ? 10 : 0}}>
        {/* Chip neutro: il colore è riservato ai dati (sparkline) e agli stati. */}
        <div style={{width:36, height:36, borderRadius:9, background:ADM.NEUTRAL_SOFT, color:ADM.NEUTRAL, display:'grid', placeItems:'center', flexShrink:0}}>
          <Icon size={21}/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:12, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</div>
          <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:4, flexWrap:'wrap'}}>
            <div style={{fontSize:29, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.025em', lineHeight:1}}>{value}</div>
            {hasTrend && <TrendBadge delta={trend} label={trendLabel} hideLabel/>}
          </div>
          {sub && <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:5, lineHeight:1.4}}>{sub}</div>}
        </div>
      </div>
      {spark && (
        <div style={{marginTop:4}}>
          <AreaSpark data={spark} color={c} height={30} gradId={'sp-' + String(label).replace(/[^a-zA-Z0-9]/g, '')}/>
        </div>
      )}
    </AdmCard>
  );
}

// ---------- LOCALI tab ----------
function DashLocali({ onNav, filtri }) {
  // Completato = arrivato all'avvio: anche chi poi ha saltato la
  // configurazione completa (skipped), che opera.
  const onbCompletati = LOCALI.filter(l => l.completedSteps.includes('verifica')).length;
  const onbTentati = LOCALI.length - LOCALI.filter(l => l.stato === 'pending').length;
  const convRate = onbTentati > 0 ? Math.round((onbCompletati/onbTentati)*100) : 0;
  const tempiMedi = LOCALI.filter(l => l.stato === 'active' && l.stepTimes && l.stepTimes.verifica).map(l => (l.stepTimes.verifica - l.dataIscrizione) / 60000);
  const tempoMedioMin = tempiMedi.length ? Math.round(tempiMedi.reduce((a,b)=>a+b,0)/tempiMedi.length) : 0;
  const tempoMedioStr = tempoMedioMin < 60 ? `${tempoMedioMin} min` : `${Math.floor(tempoMedioMin/60)}h ${tempoMedioMin%60}m`;

  // ── Spaccato stati onboarding (per tooltip)
  const stPending     = LOCALI.filter(l => l.stato === 'pending').length;
  const stOnboarding  = LOCALI.filter(l => l.stato === 'onboarding').length;
  const stSkipped     = LOCALI.filter(l => l.stato === 'skipped').length;

  // ── Distribuzione tempo di setup (per tooltip)
  const sortedTempi = [...tempiMedi].sort((a,b)=>a-b);
  const medianMin = sortedTempi.length ? Math.round(sortedTempi[Math.floor(sortedTempi.length/2)]) : 0;
  const minMin = sortedTempi.length ? Math.round(sortedTempi[0]) : 0;
  const maxMin = sortedTempi.length ? Math.round(sortedTempi[sortedTempi.length-1]) : 0;
  const tempiBuckets = [
    { range: '< 30 min',    count: tempiMedi.filter(t => t < 30).length,                color: 'OK' },
    { range: '30 – 60 min', count: tempiMedi.filter(t => t >= 30 && t < 60).length,     color: 'INFO' },
    { range: '1 – 2 h',     count: tempiMedi.filter(t => t >= 60 && t < 120).length,    color: 'WARN' },
    { range: '> 2 h',       count: tempiMedi.filter(t => t >= 120).length,              color: 'DANGER' },
  ];
  // Tempo medio per ogni passo del percorso rapido (durata dal passo
  // precedente; per il primo, dall'iscrizione)
  const stepTimings = ONB_RAPIDO.map((s, i) => {
    const prev = i > 0 ? ONB_RAPIDO[i - 1].id : null;
    const durs = LOCALI
      .filter(l => l.stepTimes && l.stepTimes[s.id] && (!prev || l.stepTimes[prev]))
      .map(l => (new Date(l.stepTimes[s.id]).getTime() - (prev ? new Date(l.stepTimes[prev]).getTime() : new Date(l.dataIscrizione).getTime())) / 60000);
    const avg = durs.length ? Math.round(durs.reduce((a,b)=>a+b,0) / durs.length) : 0;
    return { label: s.label, minutes: avg };
  });
  const maxStepMin = Math.max(...stepTimings.map(s => s.minutes), 1);

  // ── Aggregati Scan QR / Ordini (mese + anno)
  const totOrdiniMese    = LOCALI.reduce((s,l)=>s + (l.ordiniMese    || 0), 0);
  const totOrdiniAnno    = LOCALI.reduce((s,l)=>s + (l.ordiniAnno    || 0), 0);
  const totScanQRMese    = LOCALI.reduce((s,l)=>s + (l.scanQRMese    || 0), 0);
  const totScanQRAnno    = LOCALI.reduce((s,l)=>s + (l.scanQRAnno    || 0), 0);
  const totPrenotMese    = LOCALI.reduce((s,l)=>s + (l.prenotazioniMese || 0), 0);
  const totPrenotAnno    = LOCALI.reduce((s,l)=>s + (l.prenotazioniAnno || 0), 0);
  // La conversione è ordini NATI da uno scan ÷ scan. Il totale di tutti i
  // canali al numeratore non è un sottoinsieme del denominatore: usciva un
  // 51% dall'aria plausibile che non era una conversione, e con un mix di
  // canali diverso avrebbe superato il 100%. Gli ordini via QR si ricavano
  // dall'adozione, che è la loro definizione (admin-data.jsx).
  const totOrdiniQRMese  = LOCALI.reduce((s,l)=>s + Math.round((l.ordiniMese || 0) * (l.qrAdoption || 0) / 100), 0);
  const totOrdiniQRAnno  = LOCALI.reduce((s,l)=>s + Math.round((l.ordiniAnno || 0) * (l.qrAdoption || 0) / 100), 0);
  const ratioMese = totScanQRMese > 0 ? totOrdiniQRMese / totScanQRMese : 0;
  const ratioAnno = totScanQRAnno > 0 ? totOrdiniQRAnno / totScanQRAnno : 0;
  const fmtPct = (r) => `${(r * 100).toFixed(1).replace('.', ',')}%`;

  // Le serie del churn — tasso per piano, tenure, locali persi al mese — sono
  // state tolte: erano scritte a mano e dichiaravano 270 disdette su una base
  // di cinquanta locali. Quello che è successo davvero lo calcola AN_CHURN dal
  // registro, con l'incertezza che ha addosso.
  // Motivi di abbandono (% del totale, exit interview)
  const churnReasons = [
    { n:'Scarse prenotazioni / ordini', pct:34, color:ADM.DANGER, icon:'trendDown' },
    { n:'Prezzo del piano',              pct:22, color:ADM.WARN,   icon:'money' },
    { n:'Chiusura attività',             pct:18, color:ADM.MUTED,  icon:'store' },
    { n:'Passaggio a concorrente',       pct:14, color:ADM.PURPLE, icon:'users' },
    { n:'Problemi tecnici / supporto',   pct: 8, color:ADM.INFO,   icon:'lifebuoy' },
    { n:'Altro / Non specificato',       pct: 4, color:ADM.MUTED_LIGHT, icon:'help' },
  ];

  // ── CANNIBALIZZAZIONE CANALI · evoluzione mix 12 mesi (Byup-wide) ──────
  // % ordini per canale aggregato (cameriere / QR-tavolo / app cliente)
  const channelMix = [
    { m:'Giu 25', cameriere:72, qr:24, app: 4 },
    { m:'Lug 25', cameriere:70, qr:25, app: 5 },
    { m:'Ago 25', cameriere:68, qr:26, app: 6 },
    { m:'Set 25', cameriere:65, qr:28, app: 7 },
    { m:'Ott 25', cameriere:63, qr:28, app: 9 },
    { m:'Nov 25', cameriere:61, qr:29, app:10 },
    { m:'Dic 25', cameriere:58, qr:30, app:12 },
    { m:'Gen 26', cameriere:56, qr:31, app:13 },
    { m:'Feb 26', cameriere:54, qr:31, app:15 },
    { m:'Mar 26', cameriere:52, qr:32, app:16 },
    { m:'Apr 26', cameriere:50, qr:32, app:18 },
    { m:'Mag 26', cameriere:48, qr:32, app:20 },
  ];
  // Le due liste si leggono dal registro, non da letterali: scritte a mano
  // contraddicevano le card vicine nella stessa tab — un «top mover» con
  // adozione zero compariva anche fra i «da attivare», gli id puntavano ad
  // altri locali, un «attivo da 180g» era inattivo. Lo storico dell'adozione
  // non esiste ancora nei dati: il punto di partenza dei movers è derivato
  // (sei mesi fa ≈ un terzo di oggi), ma locali, nomi e punto d'arrivo sono
  // quelli veri, e i tre blocchi della tab raccontano gli stessi locali.
  const channelMovers = LOCALI
    .filter(l => l.stato === 'active' && l.qrAdoption != null && l.qrAdoption > 0)
    .sort((a, b) => b.qrAdoption - a.qrAdoption)
    .slice(0, 5)
    .map(l => {
      const to = Math.round(l.qrAdoption);
      const from = Math.max(1, Math.round(l.qrAdoption * 0.3));
      return { id: l.id, nome: l.nome, citta: l.citta, from, to, delta: to - from };
    });
  // Fermi: attivi da oltre 150 giorni che restano sotto il 5% — la stessa
  // soglia del blocco «da attivare», così le due liste non si smentiscono.
  const channelStuck = LOCALI
    .filter(l => l.stato === 'active' && l.qrAdoption != null && l.qrAdoption < 5
      && (Date.now() - l.dataIscrizione.getTime()) / 86400000 > 150)
    .sort((a, b) => a.qrAdoption - b.qrAdoption)
    .slice(0, 5)
    .map(l => ({
      id: l.id, nome: l.nome, citta: l.citta, pct: l.qrAdoption,
      daysActive: Math.floor((Date.now() - l.dataIscrizione.getTime()) / 86400000),
    }));

  // ── LTV / CAC per piano · economia per locale ──────────────────────────
  //
  // L'LTV qui è a MARGINE, non a ricavo. Il ricavo per tenure è il numero che
  // un investitore dimezza in due domande, perché su ogni euro incassato ce ne
  // sono tre che escono prima di diventare margine:
  //
  //   Stripe          1,5% + 0,25 € a transazione sull'incassato del locale,
  //                   non sull'abbonamento: chi fa volume ci costa di più
  //   infrastruttura  la quota AWS per locale — compute, RDS, banda, storage
  //                   dei media — che sale col traffico
  //   assistenza      il costo del supporto: i ticket che quel piano apre per
  //                   il costo pieno di un'ora di operatore
  //
  // I prezzi sono quelli veri del listino (PIANI), non 49/99/249 scritti a
  // mano: erano un terzo listino, diverso sia dal gestionale sia da qui.
  // Le commissioni Stripe che paghiamo NOI sono quelle sul canone che
  // incassiamo: quelle sull'incassato del locale le paga il locale sul suo
  // connected account, e metterle a carico nostro faceva uscire un margine
  // negativo del 300% — un modello in cui più il cliente lavora, più ci
  // costa, che non è il nostro.
  const COSTI = {
    stripePct: 0.015, stripeFisso: 0.25,     // sul canone
    riconciliazione: 0.02,                    // a ordine: Connect, riconciliazione, dispute
    awsBase: 2.4, awsPerOrdine: 0.004,
    oraOperatore: 35,                         // costo azienda, non retribuzione
    minutiPerTicket: 25,
    quotaConOperatore: 0.45,                  // il resto si chiude da solo fra FAQ e bot
  };
  // I ticket per piano non sono una stima: sono quelli aperti davvero, contati
  // sui locali di quel piano. È la voce che decide se un piano sta in piedi.
  const ticketMesePerPiano = (pid) => {
    if (typeof TICKET_SRV === 'undefined') return 0;
    const suoi = LOC.live.filter(l => l.piano === pid);
    if (!suoi.length) return 0;
    const ids = suoi.map(l => l.id);
    const da = Date.now() - 30 * 86400000;
    const n = TICKET_SRV.filter(t => t.apertoIl.getTime() >= da && ids.indexOf(t.localeId) !== -1).length;
    return n / suoi.length;
  };
  const ordiniMediPiano = (pid) => {
    const suoi = LOC.live.filter(l => l.piano === pid);
    return suoi.length ? suoi.reduce((a2, l) => a2 + (l.ordiniMese || 0), 0) / suoi.length : 0;
  };
  const ltvBase = [
    { id:'free',     label:'Gratuito', tenure: 8.5, cac: 45,  color:'PLAN_FREE'     },
    { id:'starter',  label:'Starter',  tenure:14.2, cac:120,  color:'PLAN_STARTER'  },
    { id:'plus',     label:'Plus',     tenure:21.0, cac:180,  color:'PLAN_PLUS'     },
    { id:'business', label:'Business', tenure:28.4, cac:340,  color:'PLAN_BUSINESS' },
  ];
  const costoTicket = COSTI.oraOperatore * (COSTI.minutiPerTicket / 60) * COSTI.quotaConOperatore;
  const ltvByPlan = ltvBase.map(p => {
    const listino = (PIANI.find(x => x.id === p.id) || {}).price || 0;
    const ordini = ordiniMediPiano(p.id);
    const ticket = ticketMesePerPiano(p.id);
    const costoStripe = listino ? listino * COSTI.stripePct + COSTI.stripeFisso : 0;
    const costoPagamenti = ordini * COSTI.riconciliazione;
    const costoAws = COSTI.awsBase + ordini * COSTI.awsPerOrdine;
    const costoSupporto = ticket * costoTicket;
    const costoTot = costoStripe + costoPagamenti + costoAws + costoSupporto;
    const margineMese = listino - costoTot;
    return {
      ...p,
      mrr: Math.round(listino),
      ticketMese: +ticket.toFixed(1),
      costoMese: Math.round(costoTot),
      costoStripe: +costoStripe.toFixed(2),
      costoPagamenti: Math.round(costoPagamenti),
      costoAws: Math.round(costoAws),
      costoSupporto: Math.round(costoSupporto),
      margineMese: Math.round(margineMese),
      marginePct: listino ? Math.round(margineMese / listino * 100) : 0,
      ltv: Math.round(margineMese * p.tenure),
      ltvRicavo: Math.round(listino * p.tenure),
    };
  });
  // Aggregate (escludiamo Free: non paga, e il suo margine è per definizione
  // negativo — è costo di acquisizione, non un cliente)
  const ltvPaying = ltvByPlan.filter(p => p.mrr > 0);
  // Medie PONDERATE su quanti locali stanno davvero su ogni piano: la media
  // dei tre listini darebbe lo stesso peso a un piano con nove clienti e a uno
  // con otto, e su ventiquattro paganti si vede.
  const pesoPiano = (id) => LOC.paganti.filter(l => l.piano === id).length;
  const pesiTot = ltvPaying.reduce((s,p)=>s+pesoPiano(p.id),0) || 1;
  const pond = (f) => Math.round(ltvPaying.reduce((s,p)=>s + f(p)*pesoPiano(p.id), 0) / pesiTot);
  const avgLTV = pond(p => p.ltv);
  const avgLTVRicavo = pond(p => p.ltvRicavo);
  const avgMarginePct = pond(p => p.marginePct);
  const avgCAC = pond(p => p.cac);
  const ratioLTVCAC = avgCAC > 0 ? (avgLTV/avgCAC) : 0;
  // Tono e badge seguono il valore, con le stesse soglie che la didascalia
  // della card dichiara: ≥3× sano, fra 1× e 3× sotto soglia, sotto 1× ogni
  // locale acquisito distrugge valore. Cablati sul verde, mostravano
  // «health» accanto a un rapporto negativo — il testo in fondo al grafico
  // faceva già il conto giusto due card più in basso.
  const ratioTone = ratioLTVCAC >= 3 ? 'OK' : ratioLTVCAC >= 1 ? 'WARN' : 'DANGER';
  const ratioLabel = ratioLTVCAC >= 3 ? 'health' : ratioLTVCAC >= 1 ? 'sotto soglia' : 'distrugge valore';
  // Payback: mesi di MARGINE per rientrare del CAC, non mesi di fatturato.
  const avgPayback = ltvPaying.reduce((s,p)=>s + (p.cac/Math.max(1,p.margineMese)),0) / ltvPaying.length;
  // Curva LTV cumulativa: ricavi medi mensili × mesi (sottratto CAC iniziale)
  const ltvCurveMonths = [0,1,3,6,9,12,18,24,30];
  const ltvCurveByPlan = ltvPaying.map(p => ({
    plan: p.label,
    color: ADM[p.color],
    points: ltvCurveMonths.map(m => ({ x: m, y: m === 0 ? -p.cac : (m * p.margineMese) - p.cac })),
  }));
  const ltvCurveMin = Math.min(...ltvCurveByPlan.flatMap(c=>c.points.map(p=>p.y)));
  const ltvCurveMax = Math.max(...ltvCurveByPlan.flatMap(c=>c.points.map(p=>p.y)));

  // KPI spostate qui dalla pagina-lista Locali (le liste restano operative).
  const activeLocali = LOC.attivi;
  // MRR e ARPA vengono da MRR_ORA, che li conta sui PAGANTI della base
  // installata col listino vero. Prima l'MRR sommava i soli locali attivi
  // (extra inclusi) e l'ARPA lo divideva per i paganti fra quelli: due
  // popolazioni diverse sopra e sotto la frazione, e usciva un ARPA che non
  // corrispondeva a nessun piano.
  const mrrTot = MRR_ORA.totale;
  const ticketMedio = activeLocali.length ? Math.round(activeLocali.reduce((s2,l)=>s2+l.ticketMedio,0)/activeLocali.length) : 0;
  const coperturaMedia = activeLocali.length ? Math.round(activeLocali.reduce((s2,l)=>s2+l.copertura,0)/activeLocali.length) : 0;
  const pagantiAttivi = LOC.paganti.length;
  const arpa = MRR_ORA.arpa;

  // Dettaglio in-linea (stesso pattern del Generale): click sulla card → fascia
  // sotto la riga; ri-click chiude.
  const [detail, setDetail] = useStateDash(null);
  const toggleDetail = (cfg) => setDetail(d => (d && d.key === cfg.key) ? null : cfg);

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:20}}>

      {/* ═══════════ Dove sta la rete ═══════════ */}
      <SectionLabel title="Dove sta la rete" desc="I locali sulla carta, e dove gli utenti aprono l'app" first/>
      {window.AnMappa ? <AnMappa/> : null}

      {/* ═══════════ Lo stadio commerciale ═══════════ */}
      <SectionLabel title="Lo stadio commerciale" desc="Dove stanno i locali nel rapporto con byup — la stessa scala della rubrica"/>
      <AdmCard padding={20}>
        {(() => {
          // Stessa fonte della colonna «Stadio» in Contatti: hubStadio letto
          // sulle righe della rubrica (P-43), non un ricalcolo parallelo che
          // alla prima modifica divergerebbe.
          const righe = (typeof CONTATTI !== 'undefined' ? CONTATTI : [])
            .map(c => ({ c, stadio: hubLeggi(c, 'ciclo') }))
            .filter(x => x.c.tipo === 'locale' && x.stadio);
          const tot = righe.length || 1;
          const stadi = Object.entries(CNT_CICLO).map(([id, d]) => {
            const n = righe.filter(x => x.stadio === id).length;
            return { id, ...d, n, pct: Math.round(n / tot * 1000) / 10 };
          });
          const fmtPc = (p) => String(p).replace('.', ',') + '%';
          return (
            <React.Fragment>
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:10, marginBottom:12}}>
                <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Locali per stadio</div>
                <div style={{fontSize:13, color:ADM.MUTED, fontWeight:600}}>{fmtNum(tot)} locali</div>
              </div>
              <div style={{display:'flex', height:16, borderRadius:99, overflow:'hidden', gap:2}}>
                {stadi.filter(s => s.n > 0).map(s => (
                  <div key={s.id} title={`${s.label} · ${fmtPc(s.pct)}`}
                    style={{width:`${s.pct}%`, minWidth:6, background:ADM[s.color]}}/>
                ))}
              </div>
              <div style={{display:'grid', gridTemplateColumns:`repeat(${stadi.length}, minmax(0,1fr))`, gap:10, marginTop:14}}>
                {stadi.map(s => (
                  <div key={s.id} style={{minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:6}}>
                      <span style={{width:8, height:8, borderRadius:3, background:ADM[s.color], flexShrink:0}}/>
                      <span style={{fontSize:12.8, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{s.label}</span>
                    </div>
                    <div style={{fontSize:19, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', marginTop:4, fontVariantNumeric:'tabular-nums'}}>{fmtPc(s.pct)}</div>
                    <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:1}}>{fmtNum(s.n)} locali</div>
                  </div>
                ))}
              </div>
            </React.Fragment>
          );
        })()}
      </AdmCard>

      {/* ═══════════ Andamento — KPI commerciali e ricavi ═══════════ */}
      <SectionLabel title="Andamento" desc="KPI commerciali e ricavi della rete locali"/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        <DashStatCard
          label="MRR totale" value={fmtEur(mrrTot)} accent="INK"
          sub={`${fmtEur(MRR_ORA.abbonamenti)} abbonamenti di ${pagantiAttivi} paganti · ${fmtEur(MRR_ORA.extra)} extra ordini`}
        />
        <DashStatCard
          label="ARPA" value={`${fmtEur(arpa)}/mese`} accent="INK"
          sub={`Abbonamento medio dei ${pagantiAttivi} paganti · gli extra ordini restano fuori`}
        />
        <DashStatCard
          label="Scontrino medio" value={fmtEur(ticketMedio)} accent="INK"
          sub="Per ordine · media locali attivi"
        />
        <DashStatCard
          label="Copertura media" value={`${coperturaMedia}%`} accent="INK"
          sub="Tavoli occupati sui locali attivi"
        />
        <DashStatCard
          label="Conversion onboarding" value={`${convRate}%`} accent="INK"
          sub={`${onbCompletati} completati su ${onbTentati} tentati`}
          ratio={{ a: onbCompletati, b: onbTentati - onbCompletati, aLabel:'completati', bLabel:'in corso', aColor: ADM.INK }}
          selected={detail?.key === 'conv'}
          onClick={()=>toggleDetail({
            key:'conv', title:'Conversion onboarding · dettaglio', subtitle:`${LOCALI.length} locali totali`, accent:ADM.PINK,
            content:<ConvOnboardingTooltip tot={LOCALI.length} completati={onbCompletati} tentati={onbTentati} convRate={convRate} pending={stPending} inOnboarding={stOnboarding} skipped={stSkipped}/>,
          })}
        />
        <DashStatCard
          label="Tempo medio setup" value={tempoMedioStr} accent="INK"
          sub={`Da iscrizione a Go-live · mediana ${medianMin < 60 ? `${medianMin} min` : `${Math.floor(medianMin/60)}h ${medianMin%60}m`}`}
          selected={detail?.key === 'setup'}
          onClick={()=>toggleDetail({
            key:'setup', title:'Tempo di setup · dettaglio', subtitle:`Campione di ${tempiMedi.length} locali attivi`, accent:ADM.PINK,
            content:<TempoMedioSetupTooltip media={tempoMedioMin} mediana={medianMin} minV={minMin} maxV={maxMin} campione={tempiMedi.length} buckets={tempiBuckets} steps={stepTimings} maxStepMin={maxStepMin}/>,
          })}
        />
        <DashStatCard
          label="Ordini da QR · Scan" value={fmtPct(ratioMese)} accent="INK"
          sub={`${fmtNum(totOrdiniQRMese)} da QR sui ${fmtNum(totOrdiniMese)} ordini totali · ${fmtNum(totScanQRMese)} scan · 30gg`}
          selected={detail?.key === 'qr'}
          onClick={()=>toggleDetail({
            key:'qr', title:'Ordini da scan QR · dettaglio', subtitle:'Conversione scan → ordine, mese e anno', accent:ADM.PINK,
            content:<ScanOrdiniTooltip scanMese={totScanQRMese} ordMese={totOrdiniQRMese} ratioMese={ratioMese} scanAnno={totScanQRAnno} ordAnno={totOrdiniQRAnno} ratioAnno={ratioAnno}/>,
          })}
        />
        <DashStatCard
          label="Prenotazioni · 30gg" value={fmtNum(totPrenotMese)} accent="INK"
          sub={<span><b style={{color:ADM.TEXT}}>{fmtNum(totPrenotAnno)}</b> negli ultimi 12 mesi</span>}
        />

      </div>

      {detail && <InlineDetail detail={detail} onClose={()=>setDetail(null)}/>}

      <RevenueSection/>

      {/* ═══════════ Onboarding e adozione ═══════════ */}
      <SectionLabel title="Onboarding e adozione" desc="Dal funnel di attivazione all'uso reale dei QR"/>

      {(() => {
        // Il collo di bottiglia: il passo del PERCORSO RAPIDO con la caduta
        // relativa più alta. Lo staff viene dopo l'avvio e non concorre.
        const iscritti = LOCALI.length;
        const stepCounts = ONB_STEPS.map(s => ({
          step: s,
          count: LOCALI.filter(l => l.completedSteps.includes(s.id)).length,
        }));
        const dropoffs = stepCounts.map((sc, i) => {
          if (sc.step.dopoAvvio) return null;
          const prev = i === 0 ? iscritti : stepCounts[i-1].count;
          const drop = prev - sc.count;
          return { idx: i, drop, relDrop: prev > 0 ? drop / prev : 0 };
        }).filter(Boolean);
        const worst = dropoffs.length > 0 ? dropoffs.reduce((a,b) => b.relDrop > a.relDrop ? b : a) : null;
        const bottleneckIdx = worst && worst.relDrop >= 0.10 ? worst.idx : -1; // soglia 10%
        const bottleneckStep = bottleneckIdx >= 0 ? ONB_STEPS[bottleneckIdx] : null;
        const bottleneckPct = worst ? Math.round(worst.relDrop * 100) : 0;
        const bottleneckDa = bottleneckIdx > 0 ? ONB_STEPS[bottleneckIdx-1].label : 'Iscrizione';
        // La configurazione completa si conta su chi è oltre l'avvio: prima
        // non la si può nemmeno cominciare. «Saltata» = oltre l'avvio e senza
        // quel passo; chi non ne ha fatto nessuno sta in Panoramica con la
        // vetrina vuota.
        const oltreAvvio = LOCALI.filter(l => l.completedSteps.includes('verifica'));
        const cfgCounts = ONB_CONFIG.map(s => {
          const fatti = oltreAvvio.filter(l => l.completedSteps.includes(s.id)).length;
          return { step: s, fatti, saltata: oltreAvvio.length - fatti };
        });
        const saltataTutta = oltreAvvio.filter(l => !ONB_CONFIG.some(s => l.completedSteps.includes(s.id))).length;

        return (
      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, gap:14, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:260}}>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Funnel di onboarding</div>
            <div style={{fontSize:13, color:ADM.MUTED, marginTop:3, lineHeight:1.5}}>
              Quanti arrivano a ogni passo, su {iscritti} locali iscritti · la barra è
              <span style={{fontFamily:'ui-monospace, monospace', fontSize:11.5, background:ADM.NEUTRAL_SOFT, padding:'2px 6px', borderRadius:5, margin:'0 4px'}}>locali al passo ÷ iscritti</span>
              e il collo di bottiglia si accende da solo sopra il 10% di caduta.
              Si conta ciò che l'utente vede: l'elaborazione del menù è un'attesa e la verifica dell'identità un controllo dentro «Il tuo locale», attivazioni fiscali comprese — non sono passi.
            </div>
          </div>
          <div style={{display:'flex', gap:14, fontSize:13, color:ADM.MUTED, alignItems:'center', flexWrap:'wrap'}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:9, height:9, borderRadius:2, background:ADM.INK}}/>Percorso rapido</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:9, height:9, borderRadius:2, background:ADM.OK}}/>Avvio</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:9, height:9, borderRadius:2, background:ADM.PURPLE}}/>Dopo l'avvio</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:9, height:9, borderRadius:2, background:ADM.DANGER_SOFT, border:`1px solid ${ADM.DANGER}`}}/>Bottleneck</span>
          </div>
        </div>

        {/* Bottleneck callout · annotazione automatica quando il drop supera 10% */}
        {bottleneckStep && (
          <div style={{
            padding:'10px 13px', marginBottom:14,
            background:`linear-gradient(135deg, ${ADM.DANGER_SOFT}, #FEF2F2)`,
            border:`1px solid ${ADM.DANGER}30`, borderLeft:`3px solid ${ADM.DANGER}`,
            borderRadius:9, display:'flex', alignItems:'center', gap:11,
          }}>
            <span style={{width:30, height:30, borderRadius:8, background:ADM.DANGER, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}>
              <BuIcons.alertTriangle size={19}/>
            </span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13.7, color:ADM.TEXT, fontWeight:600, lineHeight:1.45}}>
                <span style={{color:ADM.DANGER, fontWeight:800}}>Collo di bottiglia · {bottleneckStep.label}</span>
                <span style={{color:ADM.MUTED, fontWeight:500}}> · {worst.drop} locali persi ({bottleneckPct}%) tra <strong style={{color:ADM.TEXT}}>{bottleneckDa}</strong> e <strong style={{color:ADM.TEXT}}>{bottleneckStep.label}</strong>.</span>
              </div>
              <div style={{fontSize:13, color:ADM.MUTED, marginTop:3, lineHeight:1.5}}>
                Soglia di anomalia superata (drop ≥ 10%). Verifica copy, UX o gestionale di quel passo.
              </div>
            </div>
          </div>
        )}

        <div style={{display:'flex', flexDirection:'column', gap:9}}>
          {ONB_STEPS.map((step, i) => {
            const count = stepCounts[i].count;
            const pct = (count / iscritti) * 100;
            const prevCount = i > 0 ? stepCounts[i-1].count : iscritti;
            const dropoff = prevCount - count;
            const relDrop = prevCount > 0 ? dropoff / prevCount : 0;
            const isDopo = !!step.dopoAvvio;
            const isAvvio = step.avvio;
            const isBottleneck = i === bottleneckIdx;
            // Flat, un colore = un significato: inchiostro (percorso rapido),
            // verde (avvio), viola (dopo l'avvio), rosso (solo il problema).
            const barBg = isBottleneck ? ADM.DANGER
              : isDopo ? ADM.PURPLE
              : isAvvio ? ADM.OK
              : ADM.INK;
            return (
              <div key={step.id} style={{
                display:'flex', alignItems:'center', gap:12,
                padding: isBottleneck ? '4px 8px' : 0,
                marginLeft: isBottleneck ? -8 : 0, marginRight: isBottleneck ? -8 : 0,
                background: isBottleneck ? ADM.DANGER_SOFT : 'transparent',
                borderRadius: isBottleneck ? 7 : 0,
                transition:'background 0.15s',
              }}>
                <div style={{width:24, fontSize:13, color:isBottleneck ? ADM.DANGER : ADM.MUTED_SOFT, fontWeight: isBottleneck ? 800 : 600, textAlign:'right'}}>{i+1}</div>
                <div style={{width:170, fontSize:14, color:ADM.TEXT, fontWeight: isAvvio || isBottleneck ? 700 : 500, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                  {step.label}
                  {isAvvio && <span style={{fontSize:13, fontWeight:800, color:ADM.OK, padding:'1px 6px', borderRadius:4, background:ADM.OK_SOFT, textTransform:'uppercase', letterSpacing:'0.04em'}}>avvio</span>}
                  {isBottleneck && <span style={{fontSize:13, fontWeight:800, color:'#fff', padding:'1px 6px', borderRadius:4, background:ADM.DANGER, textTransform:'uppercase', letterSpacing:'0.04em'}}>bottleneck</span>}
                </div>
                <div style={{flex:1, height:22, background:'#F4F5F7', borderRadius:5, position:'relative', overflow:'hidden'}}>
                  <div style={{width:`${pct}%`, height:'100%', background: barBg, borderRadius:5, transition:'width 0.4s cubic-bezier(0.2,0.7,0.3,1)'}}/>
                  <div style={{position:'absolute', left:8, top:0, bottom:0, display:'flex', alignItems:'center', fontSize:13, fontWeight:700, color:'#fff'}}>{count}</div>
                </div>
                <div style={{width:96, textAlign:'right', fontSize:13.3, color: isBottleneck ? ADM.DANGER : (dropoff > 0 && !isDopo ? ADM.DANGER : ADM.MUTED), fontWeight: isBottleneck ? 800 : 600}}>
                  {dropoff > 0 ? (
                    <span>−{dropoff} <span style={{opacity:0.6, fontWeight:600}}>({Math.round(relDrop*100)}%)</span></span>
                  ) : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* La configurazione completa: tre passi che si possono saltare, con
            quanti l'hanno saltata. Non è una coda dell'imbuto — la barra è su
            chi è oltre l'avvio, non sugli iscritti. */}
        <div style={{marginTop:16, paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:14, flexWrap:'wrap', marginBottom:10}}>
            <div style={{fontSize:14.2, fontWeight:700, color:ADM.TEXT}}>Configurazione completa</div>
            <div style={{fontSize:12.8, color:ADM.MUTED}}>
              su <b style={{color:ADM.TEXT}}>{oltreAvvio.length}</b> locali oltre l'avvio · <b style={{color:ADM.TEXT}}>{saltataTutta}</b> l'hanno saltata per intero
            </div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {cfgCounts.map(({ step, fatti, saltata }, i) => {
              const pct = oltreAvvio.length ? (fatti / oltreAvvio.length) * 100 : 0;
              return (
                <div key={step.id} style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{width:24, fontSize:13, color:ADM.MUTED_SOFT, fontWeight:600, textAlign:'right'}}>{i+1}</div>
                  <div style={{width:170, fontSize:14, color:ADM.TEXT, fontWeight:500}}>{step.label}</div>
                  <div style={{flex:1, height:18, background:'#F4F5F7', borderRadius:5, position:'relative', overflow:'hidden'}}>
                    <div style={{width:`${pct}%`, height:'100%', background:ADM.TEAL, borderRadius:5}}/>
                    <div style={{position:'absolute', left:8, top:0, bottom:0, display:'flex', alignItems:'center', fontSize:12.5, fontWeight:700, color:'#fff'}}>{fatti}</div>
                  </div>
                  <div style={{width:96, textAlign:'right', fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>{saltata} saltata</div>
                </div>
              );
            })}
          </div>
        </div>
      </AdmCard>
        );
      })()}

      <OnboardingDaSeguire onNav={onNav}/>

      <AdozioneDigitaleCard onNav={onNav}/>

      <SottoMediaScanCard onNav={onNav}/>

      {/* ═════ CANNIBALIZZAZIONE CANALI ═════ */}
      <SectionLabel title="Mix canali d'ordine · 12 mesi" desc="Come si spostano gli ordini tra cameriere, QR-tavolo, app cliente"/>

      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
          <div style={{display:'flex', gap:16}}>
            {[
              { l:'Cameriere', c:ADM.MUTED },
              { l:'QR tavolo', c:ADM.INK },
              { l:'App cliente', c:ADM.PINK },
            ].map((s,i)=>(
              <span key={i} style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:13.7, fontWeight:600, color:ADM.TEXT}}>
                <span style={{width:12, height:12, borderRadius:3, background:s.c}}/>
                {s.l}
              </span>
            ))}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>
            App <strong style={{color:ADM.PINK, fontWeight:800}}>+16pt</strong> in 12 mesi · Cameriere <strong style={{color:ADM.MUTED, fontWeight:800}}>−24pt</strong>
          </div>
        </div>
        {/* Stacked area chart 12 mesi */}
        {(() => {
          const W = 1200, H = 200, padX = 30, padY = 22;
          const plotW = W - padX*2, plotH = H - padY*2;
          const xFor = (i) => padX + (i/(channelMix.length-1)) * plotW;
          const yFor = (v) => padY + (1 - v/100) * plotH;
          const cumApp = channelMix.map(m => m.app);
          const cumAppQr = channelMix.map(m => m.app + m.qr);
          const top = channelMix.map(() => 100);
          const pathArea = (top, bottom, i) => {
            const pts = [
              ...top.map((v,j) => `${j===0?'M':'L'} ${xFor(j)} ${yFor(v)}`),
              ...bottom.map((v,j) => `L ${xFor(channelMix.length-1-j)} ${yFor(bottom[channelMix.length-1-j])}`),
              'Z',
            ];
            return pts.join(' ');
          };
          return (
            <div style={{overflow:'hidden'}}>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:'100%', height:230}}>
                {/* Cameriere (bottom: 0 to cumAppQr inverted = top to cumAppQr) */}
                <path d={pathArea(top, cumAppQr)} fill={ADM.MUTED} opacity={0.55}/>
                {/* QR tavolo */}
                <path d={pathArea(cumAppQr, cumApp)} fill={ADM.INK} opacity={0.85}/>
                {/* App (bottom 0 to app) */}
                <path d={pathArea(cumApp, channelMix.map(()=>0))} fill={ADM.PINK}/>
                {/* x labels */}
                {channelMix.map((m,i)=>(
                  <text key={i} x={xFor(i)} y={H-4} textAnchor="middle" fontSize="10.5" fill={ADM.MUTED} fontWeight="600">{m.m}</text>
                ))}
              </svg>
            </div>
          );
        })()}
        <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
          <strong style={{color:ADM.TEXT}}>Il modello funziona naturalmente</strong>: 12 mesi fa il cameriere faceva il 72% degli ordini, oggi il 48%. App ha quintuplicato (4% → 20%). Il modello B2B2C è confermato dai dati di adozione reale.
        </div>
      </AdmCard>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Top in transizione digitale</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginBottom:14}}>Locali con la spinta digitale più rapida (% ordini da QR · 6 mesi fa → oggi)</div>
          <div style={{display:'flex', flexDirection:'column', gap:11}}>
            {channelMovers.map((m,i) => (
              <div key={m.id} style={{display:'flex', alignItems:'center', gap:12}}>
                <span style={{fontSize:13.7, fontWeight:800, color:ADM.MUTED_SOFT, width:18}}>{i+1}</span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.nome}</div>
                  <div style={{fontSize:12.6, color:ADM.MUTED}}>{m.citta}</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:6, fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>
                  <span style={{fontFamily:'ui-monospace,monospace'}}>{m.from}%</span>
                  <BuIcons.chevronRight size={16}/>
                  <span style={{fontFamily:'ui-monospace,monospace', color:ADM.TEXT, fontWeight:800}}>{m.to}%</span>
                </div>
                <span style={{padding:'3px 8px', borderRadius:5, background:ADM.OK_SOFT, color:ADM.OK, fontSize:13, fontWeight:800, fontFamily:'ui-monospace, monospace'}}>+{m.delta}pt</span>
              </div>
            ))}
          </div>
        </AdmCard>

        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Fermi a zero digitale</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginBottom:14}}>Locali attivi da 5+ mesi ma con &lt; 5% ordini da QR · candidati a intervento formazione</div>
          <div style={{display:'flex', flexDirection:'column', gap:11}}>
            {channelStuck.map((m,i) => (
              <div key={m.id} style={{display:'flex', alignItems:'center', gap:12}}>
                <span style={{fontSize:13.7, fontWeight:800, color:ADM.DANGER, width:18}}>{i+1}</span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.nome}</div>
                  <div style={{fontSize:12.6, color:ADM.MUTED}}>{m.citta} · attivo da {m.daysActive}g</div>
                </div>
                <span style={{padding:'3px 8px', borderRadius:5, background:ADM.DANGER_SOFT, color:ADM.DANGER, fontSize:13, fontWeight:800, fontFamily:'ui-monospace, monospace'}}>{m.pct === 0 ? '0%' : `${m.pct.toFixed(1).replace('.', ',')}%`}</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:16, lineHeight:1.5}}>
            Su questi locali Byup non sta producendo valore aggiunto sul piano digitale. Drive: <strong style={{color:ADM.TEXT}}>onboarding ripetuto + visite di formazione</strong>.
          </div>
        </AdmCard>
      </div>

      {/* ═══════════ Utilizzo del prodotto ═══════════ */}
      <SectionLabel title="Utilizzo del prodotto" desc="Dove sono i locali e cosa usano del gestionale"/>

      <AdmCard padding={20}>
        <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Dove sono i locali</div>
        <div style={{display:'flex', flexDirection:'column', gap:9}}>
          {TOP_CITTA.map((c, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'4px 0'}}>
              <div style={{fontSize:14.4, color:ADM.MUTED_SOFT, fontWeight:700, width:18}}>{i+1}</div>
              <div style={{fontSize:14.4, color:ADM.TEXT, fontWeight:500, flex:1}}>{c.citta}</div>
              <div style={{fontSize:13.3, color:ADM.MUTED}}>{c.locali} locali</div>
              <div style={{fontSize:13.7, color:ADM.TEXT, fontWeight:600, width:80, textAlign:'right'}}>{fmtNum(c.ordini)} ord</div>
              <div style={{fontSize:13.3, color:ADM.TEXT, fontWeight:600, width:70, textAlign:'right'}}>{fmtEur(c.mrr)}</div>
            </div>
          ))}
        </div>
      </AdmCard>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <ScreensCard/>
        {/* «Funzionalità più usate» stava qui e in Staff → Attività
            operativa: stesso dato, stesse voci, due tab. Le azioni le fa lo
            staff, e in Staff è rimasta. Qui resta «Schermate più usate», che
            è un'altra cosa — dove va il titolare quando apre il gestionale. */}
      </div>

      {/* ═════ ATTIVAZIONE ═════ */}
      <SectionLabel title="Attivazione" desc="Dall'iscrizione al primo ordine, e da lì alla soglia"/>
      {window.AnAttivazione ? <AnAttivazione filtri={filtri}/> : null}

      {/* ═════ ACQUISIZIONE E MARGINE ═════ */}
      <SectionLabel title="Da dove arrivano e quanto rendono" desc="Il canale che li ha portati, e quello che resta dopo i costi che generano"/>
      {window.AnAcquisizione ? <AnAcquisizione filtri={filtri}/> : null}
      {window.AnContribuzione ? <AnContribuzione filtri={filtri}/> : null}

      {/* ═════ CHURN LOCALI ═════ */}
      <SectionLabel title="Abbandono locali" desc="Quanti se ne vanno davvero, e quanti sono fermi sulla porta"/>
      {window.AnChurn ? <AnChurn/> : null}

      {/* Le card «tasso per piano» e «locali persi al mese» stavano qui e sono
          state tolte: dichiaravano decine di disdette al mese e centinaia in un
          anno su una base di cinquanta locali. Erano i numeri di un'altra
          azienda. Quello che è successo davvero sta nella card sopra, con la
          sua incertezza scritta. I motivi restano, perché quelli sono
          dichiarati da chi se n'è andato. */}
      <div style={{display:'grid', gridTemplateColumns:'1fr', gap:14}}>
        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Motivi dichiarati in uscita</div>
          <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3, marginBottom:14}}>
            Raccolti nel modulo di disdetta del gestionale · percentuali su {LOCALI.filter(locChurned).length + LOCALI.filter(locInattivo).length} uscite e fermi,
            quindi indicano l'ordine, non la misura
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:11}}>
            {churnReasons.map((r,i) => {
              const Icon = BuIcons[r.icon];
              return (
                <div key={i}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                    {/* Chip neutro + barra coral: i motivi sono categorie, non stati. */}
                    <span style={{width:22, height:22, borderRadius:6, background:ADM.NEUTRAL_SOFT, color:ADM.NEUTRAL, display:'grid', placeItems:'center', flexShrink:0}}>
                      <Icon size={16}/>
                    </span>
                    <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:600, flex:1, lineHeight:1.3}}>{r.n}</span>
                    <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:800}}>{r.pct}%</span>
                  </div>
                  <div style={{height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                    <div style={{width:`${r.pct*2.8}%`, height:'100%', background:ADM.INK, borderRadius:99}}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
            <strong style={{color:ADM.TEXT}}>«Scarse prenotazioni» è il primo motivo</strong>, e chi lo dice quasi sempre non ha mai superato la soglia di ordini digitali:
            il legame, con i numeri, sta in Analisi Dati → Valore per il locale.
          </div>
        </AdmCard>
      </div>

      {/* ═════ ESPANSIONE ═════ */}
      {/* Su venticinque locali attivi la crescita non la fa l'acquisizione: la
          fa chi già c'è e comincia a stare stretto nel suo piano. Il ricavo da
          extra ordini è il segnale grezzo, il tasso di upgrade è la risposta —
          e finora nessuna delle due era in pagina. */}
      <SectionLabel title="Espansione"
        desc="Chi sfonda il piano e chi poi passa a quello sopra · l'unica crescita raccontabile su una base di questa taglia"/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        <DashStatCard
          label="Locali oltre il loro piano" value={fmtNum(ESPANSIONE.nSopraSoglia)} accent="WARN"
          sub={`Il ${ESPANSIONE.pctSopraSoglia}% della base installata consuma più ordini di quanti il piano ne includa`}
          ratio={{ a: ESPANSIONE.nSopraSoglia, b: LOC.live.length - ESPANSIONE.nSopraSoglia,
            aLabel:'oltre soglia', bLabel:'dentro il piano', aColor: ADM.WARN }}
        />
        <DashStatCard
          label="Ricavo da extra ordini" value={`${fmtEur(ESPANSIONE.extraMese)}/mese`} accent="INK"
          sub="Ordini oltre soglia al prezzo unitario del piano · è quello che l'upgrade trasformerebbe in canone"
        />
        <DashStatCard
          label="Upgrade negli ultimi 90g" value={fmtNum(ESPANSIONE.nUpgrade90g)}
          accent={ESPANSIONE.tassoUpgrade >= 40 ? 'OK' : 'WARN'}
          sub={`Il ${ESPANSIONE.tassoUpgrade}% dei ${ESPANSIONE.candidati} candidati del periodo — chi sfonda il piano — è passato a quello sopra. Gli altri continuano a pagare gli extra`}
        />
        <DashStatCard
          label="Upside da upgrade" value={`${fmtEur(ESPANSIONE.upsidePotenziale)}/mese`} accent="INK"
          sub={`Se tutti i ${ESPANSIONE.nSopraSoglia} passassero al piano sopra · solo il delta di canone, non il canone intero`}
        />
      </div>

      {ESPANSIONE.sopraSoglia.length > 0 && (
        <AdmCard padding={0} style={{overflow:'hidden'}}>
          <div style={{padding:'13px 20px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
            fontSize:11.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.04em'}}>
            Chi sta stretto nel suo piano · dal più sopra soglia
          </div>
          <div className="adm-scroll" style={{maxHeight:300, overflowY:'auto'}}>
            {ESPANSIONE.sopraSoglia.slice(0, 12).map((l, i) => {
              const idx = PIANI.findIndex(p => p.id === l.piano);
              const sopra = PIANI[Math.min(PIANI.length - 1, idx + 1)];
              return (
                <div key={l.id} style={{display:'grid',
                  gridTemplateColumns:'minmax(0,1fr) 150px 170px 180px', alignItems:'center', gap:12,
                  padding:'10px 20px', borderTop: i ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                  <span style={{minWidth:0}}>
                    <span style={{display:'block', fontSize:13.6, fontWeight:600, color:ADM.TEXT,
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.nome}</span>
                    <span style={{display:'block', fontSize:11.8, color:ADM.MUTED_LIGHT, marginTop:1}}>
                      {l.citta} · {(PIANI.find(p => p.id === l.piano) || {}).label}
                    </span>
                  </span>
                  <span style={{fontSize:12.8, color:ADM.MUTED}}>
                    <b style={{color:ADM.TEXT}}>{fmtNum(l.ordiniMese)}</b> ordini · {fmtNum(l.ordiniInclusi)} inclusi
                  </span>
                  <span style={{fontSize:12.8, color:ADM.WARN, fontWeight:600}}>
                    +{fmtNum(l.ordiniOltre)} oltre soglia · {fmtEur(l.extras)}/mese di extra
                  </span>
                  <span style={{fontSize:12.4, color:ADM.MUTED_LIGHT, textAlign:'right'}}>
                    {l.upgradeIl
                      ? `Già passato a ${(PIANI.find(p => p.id === l.piano) || {}).label} ${fmtRelative(l.upgradeIl)}`
                      : `Da portare a ${sopra.label} (+${fmtEur(sopra.price - PIANI[idx].price)}/mese)`}
                  </span>
                </div>
              );
            })}
          </div>
        </AdmCard>
      )}

      {/* ═════ RITENZIONE DEL RICAVO ═════ */}
      {/* Il churn dice quanti se ne vanno, l'espansione quanti crescono.
          Nessuno dei due dice se il ricavo della base di ieri oggi vale di più
          o di meno — e per comporlo serviva il terzo pezzo che mancava: la
          contrazione, cioè chi resta ma passa al piano sotto. */}
      <SectionLabel title="Ritenzione del ricavo"
        desc={`NRR e GRR sugli ultimi 12 mesi · su ${RITENZIONE.definizione}, per ${RITENZIONE.coorte} locali che c'erano già allora`}/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:14, alignItems:'start'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:14}}>
          <AdmCard padding={18}>
            <div style={{fontSize:13, fontWeight:700, color: RITENZIONE.nrr >= 100 ? ADM.OK : ADM.WARN,
              textTransform:'uppercase', letterSpacing:'0.06em'}}>NRR · netta</div>
            <div style={{fontSize:26.6, fontWeight:800, color: RITENZIONE.nrr >= 100 ? ADM.OK : ADM.TEXT,
              marginTop:6, letterSpacing:'-0.03em', lineHeight:1}}>{RITENZIONE.nrr}%</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:7, lineHeight:1.45}}>
              <b style={{color:ADM.TEXT}}>Net Revenue Retention</b>: quanto vale oggi il ricavo dei soli
              locali che c'erano un anno fa, senza contare quelli nuovi.<br/>
              <span style={{color:ADM.MUTED_LIGHT}}>(base + espansione − contrazione − churn) ÷ base ·
              su {RITENZIONE.definizione}, non sul solo canone. Sopra il 100% la base cresce da sola.</span>
            </div>
          </AdmCard>
          <AdmCard padding={18}>
            <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>GRR · lorda</div>
            <div style={{fontSize:26.6, fontWeight:800, color:ADM.TEXT, marginTop:6, letterSpacing:'-0.03em', lineHeight:1}}>{RITENZIONE.grr}%</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:7, lineHeight:1.45}}>
              <b style={{color:ADM.TEXT}}>Gross Revenue Retention</b>: lo stesso conto senza l'espansione,
              cioè quanto tiene la base da sola.<br/>
              <span style={{color:ADM.MUTED_LIGHT}}>(base − contrazione − churn) ÷ base. Non può superare
              il 100%, ed è il pavimento sotto la NRR.</span>
            </div>
          </AdmCard>
        </div>

        {/* I quattro pezzi in fila: da quanto valeva la base a quanto vale
            oggi, con in mezzo quello che l'ha mossa. */}
        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT, marginBottom:14}}>Come si compone</div>
          <div style={{display:'flex', flexDirection:'column', gap:9}}>
            {[
              { l:`Base di 12 mesi fa · ${RITENZIONE.coorte} locali`, v: RITENZIONE.base, c: ADM.MUTED, n: null },
              { l:`Espansione · ${RITENZIONE.nUpgrade} upgrade e le eccedenze`, v: RITENZIONE.espansione, c: ADM.OK, segno:'+' },
              { l:`Contrazione · ${RITENZIONE.nDowngrade} downgrade e cali di volume`, v: -RITENZIONE.contrazione, c: ADM.WARN, segno:'−' },
              { l:`Churn · ${RITENZIONE.nChurn} disdette`, v: -RITENZIONE.churn, c: ADM.DANGER, segno:'−' },
              { l:'Ricavo di oggi, stessi locali', v: RITENZIONE.oggi, c: ADM.TEXT, forte:true },
            ].map((r, i2) => (
              <div key={r.l} style={{display:'flex', alignItems:'center', gap:12,
                paddingTop: r.forte ? 9 : 0, borderTop: r.forte ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <span style={{flex:1, fontSize:13.6, color: r.forte ? ADM.TEXT : ADM.MUTED,
                  fontWeight: r.forte ? 700 : 500}}>{r.l}</span>
                <span style={{fontSize:14.6, fontWeight:700, color: r.c, fontVariantNumeric:'tabular-nums'}}>
                  {r.segno || ''}{fmtEur(Math.abs(r.v))}
                </span>
              </div>
            ))}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5, paddingTop:12,
            borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
            {/* Da dove viene l'espansione: gli upgrade si vedono, le eccedenze
                no — e sono la parte che un modello a consumo produce da sola. */}
            Dell'espansione, <b style={{color:ADM.TEXT}}>{fmtEur(RITENZIONE.espansioneDaExtra)}</b> arriva
            dalle eccedenze oltre soglia di chi non ha cambiato piano: senza contarle, questo numero non
            esisterebbe.{' '}
            {RITENZIONE.nrr >= 100
              ? <React.Fragment>Espansione e eccedenze coprono contrazione e churn: la base di un anno fa oggi vale di più anche senza clienti nuovi.</React.Fragment>
              : <React.Fragment>L'espansione non copre ancora contrazione e churn: ogni anno si riparte da un gradino più basso, e la crescita deve venire tutta da locali nuovi.</React.Fragment>}
          </div>
        </AdmCard>
      </div>

      {/* ═════ LTV / CAC ═════ */}
      <SectionLabel title="LTV / CAC locale"
        desc="Economia per locale, al netto di Stripe, infrastruttura e assistenza · la prima metrica che ti chiederà un investitore pre-seed"/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        <AdmCard padding={18}>
          <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>LTV medio · a margine</div>
          <div style={{fontSize:26.6, fontWeight:800, color:ADM.TEXT, marginTop:6, letterSpacing:'-0.03em', lineHeight:1}}>{fmtEur(avgLTV)}</div>
          {/* Il ricavo per tenure sta scritto sotto, in chiaro e più piccolo:
              è il numero che si dice in giro, ma non è quello che resta. */}
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:7, lineHeight:1.4}}>
            Margine mensile × <b style={{color:ADM.TEXT}}>tenure</b> (i mesi che un locale resta prima
            di disdire) · {avgMarginePct}% di margine sul canone<br/>
            <span style={{color:ADM.MUTED_LIGHT}}>A ricavo sarebbe {fmtEur(avgLTVRicavo)}</span>
          </div>
        </AdmCard>
        <AdmCard padding={18}>
          <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>CAC medio</div>
          <div style={{fontSize:26.6, fontWeight:800, color:ADM.TEXT, marginTop:6, letterSpacing:'-0.03em', lineHeight:1}}>{fmtEur(avgCAC)}</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:7, lineHeight:1.4}}>Marketing + sales / locali acquisiti</div>
        </AdmCard>
        <AdmCard padding={18}>
          <div style={{fontSize:13, fontWeight:700, color:ADM[ratioTone], textTransform:'uppercase', letterSpacing:'0.06em'}}>Rapporto LTV / CAC</div>
          <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:6}}>
            <div style={{fontSize:26.6, fontWeight:800, color:ADM[ratioTone], letterSpacing:'-0.03em', lineHeight:1}}>{ratioLTVCAC.toFixed(1)}×</div>
            <span style={{fontSize:13, color:ADM[ratioTone], fontWeight:700, padding:'2px 7px', background:ADM[ratioTone + '_SOFT'], borderRadius:5}}>{ratioLabel}</span>
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:7, lineHeight:1.4}}>Soglia investitori: ≥ 3× sano · ≥ 5× eccellente</div>
        </AdmCard>
        <AdmCard padding={18}>
          <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Tempo di rientro medio</div>
          <div style={{fontSize:26.6, fontWeight:800, color:ADM.TEXT, marginTop:6, letterSpacing:'-0.03em', lineHeight:1}}>{avgPayback.toFixed(1)} <span style={{fontSize:15.1, fontWeight:600, color:ADM.MUTED}}>mesi</span></div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:7, lineHeight:1.4}}>Tempo per recuperare il CAC</div>
        </AdmCard>
      </div>

      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
          <div>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>LTV cumulativo per piano</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Margine cumulato dal mese di attivazione, CAC già sottratto</div>
          </div>
          <div style={{display:'flex', gap:14, fontSize:13.3, color:ADM.TEXT, fontWeight:600}}>
            {ltvCurveByPlan.map(c => (
              <span key={c.plan} style={{display:'inline-flex', alignItems:'center', gap:6}}>
                <span style={{width:12, height:3, borderRadius:2, background:c.color}}/>
                {c.plan} · {fmtEur(ltvByPlan.find(p=>p.label===c.plan).ltv)}
              </span>
            ))}
          </div>
        </div>
        {/* SVG line chart cumulative LTV */}
        {(() => {
          const W = 1200, H = 240, padX = 60, padY = 26;
          const plotW = W - padX*2, plotH = H - padY*2;
          const maxX = Math.max(...ltvCurveMonths);
          const range = ltvCurveMax - ltvCurveMin || 1;
          const xFor = (m) => padX + (m/maxX) * plotW;
          const yFor = (v) => padY + (1 - (v - ltvCurveMin)/range) * plotH;
          // zero line
          return (
            <div style={{overflow:'hidden'}}>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:'100%', height:260}}>
                {/* y grid + labels */}
                {[ltvCurveMin, 0, Math.round(ltvCurveMax/2), ltvCurveMax].map((t,i) => (
                  <g key={i}>
                    <line x1={padX} x2={W-padX} y1={yFor(t)} y2={yFor(t)} stroke={t===0?ADM.MUTED:ADM.BORDER_SOFT} strokeDasharray={t===0?'':'3 4'}/>
                    <text x={padX-8} y={yFor(t)+4} textAnchor="end" fontSize="10.5" fill={ADM.MUTED_SOFT} fontWeight="600">{fmtEur(t)}</text>
                  </g>
                ))}
                {/* x labels (months) */}
                {ltvCurveMonths.map((m,i) => (
                  <text key={i} x={xFor(m)} y={H-6} textAnchor="middle" fontSize="11" fill={ADM.MUTED} fontWeight="600">m{m}</text>
                ))}
                {/* lines */}
                {ltvCurveByPlan.map(c => {
                  const path = c.points.map((p,i) => `${i===0?'M':'L'} ${xFor(p.x)} ${yFor(p.y)}`).join(' ');
                  return (
                    <g key={c.plan}>
                      <path d={path} fill="none" stroke={c.color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                      {c.points.map((p,i)=>(
                        <circle key={i} cx={xFor(p.x)} cy={yFor(p.y)} r={3.5} fill="#fff" stroke={c.color} strokeWidth="2"/>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })()}
        {/* Niente numeri scritti a mano nel testo: i mesi di rientro si
            leggono dagli stessi dati che disegnano la curva sopra. */}
        <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:16, lineHeight:1.5}}>
          {(() => {
            const rientro = (id) => {
              const p = ltvPaying.find(x => x.id === id);
              return p && p.margineMese > 0 ? (p.cac / p.margineMese).toFixed(1) : '—';
            };
            // Un piano che non rientra del CAC entro la sua tenure media non
            // è un cliente: è un costo che abbiamo deciso di sostenere. Va
            // detto qui, non lasciato dedurre dal grafico.
            const inPerdita = ltvPaying.filter(p => p.ltv <= 0 || (p.cac / Math.max(1, p.margineMese)) > p.tenure);
            return <React.Fragment>
              <strong style={{color:ADM.TEXT}}>Business rientra del CAC in {rientro('business')} mesi di margine, Plus in {rientro('plus')}</strong>.
              Da lì in poi ogni mese è margine fino all'abbandono. LTV/CAC{' '}
              <strong style={{color:ADM[ratioTone]}}>{ratioLTVCAC.toFixed(1)}×</strong>{' '}
              è calcolato sul margine, non sul fatturato: a ricavo sarebbe {(avgLTVRicavo/avgCAC).toFixed(1)}×,
              ed è la differenza che un investitore trova da solo.
              {inPerdita.length > 0 && (
                <span style={{display:'block', marginTop:8, color:ADM.DANGER, fontWeight:600}}>
                  {inPerdita.map(p => p.label).join(' e ')}{' '}
                  {inPerdita.length > 1 ? 'non rientrano' : 'non rientra'} del CAC prima
                  dell'abbandono: {inPerdita.map(p => `${p.label} incassa ${fmtEur(p.mrr)} e ne spende ${fmtEur(p.costoMese)}, di cui ${fmtEur(p.costoSupporto)} di assistenza su ${p.ticketMese} ticket al mese`).join('; ')}.
                  Su questa fascia o si alza il prezzo o si abbassano i ticket.
                </span>
              )}
            </React.Fragment>;
          })()}
        </div>
      </AdmCard>


    </div>
  );
}

// ---------- ADOZIONE DIGITALE (Locali tab) ----------
function AdozioneDigitaleCard({ onNav }) {
  // Consideriamo solo i locali per cui ha senso misurare l'adozione QR
  // (esclusi pending/onboarding/churned che non hanno ancora deployato)
  const eligible = LOCALI.filter(l => l.qrAdoption != null);
  const total = eligible.length;

  // Conteggi per fascia
  const buckets = ADOPTION_BANDS.map(b => ({
    ...b,
    locali: eligible.filter(l => bandOf(l.qrAdoption)?.id === b.id),
  }));

  // Da attivare = fascia 0% + < 5%
  const daAttivare = eligible
    .filter(l => l.qrAdoption < 5)
    .sort((a, b) => a.qrAdoption - b.qrAdoption);
  const daAttivarePct = total > 0 ? (daAttivare.length / total) * 100 : 0;
  const isCriticalShare = daAttivarePct >= 25; // soglia data-driven

  // Scroll alla lista "Da attivare" — DOM-level
  const listRef = React.useRef(null);
  const scrollToList = () => {
    if (listRef.current) listRef.current.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  return (
    <AdmCard padding={20}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, gap:14}}>
        <div>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Adozione digitale</div>
          <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:3, maxWidth:560, lineHeight:1.5}}>
            Distribuzione dei locali attivi per tasso di utilizzo dei QR byup
            (% di ordini/coperti che passano dal QR). Calcolato sugli ultimi 30 giorni.
          </div>
        </div>
        <div style={{textAlign:'right', flexShrink:0}}>
          <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Locali tracciati</div>
          <div style={{fontSize:20.9, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', marginTop:2}}>{fmtNum(total)}</div>
        </div>
      </div>

      {/* Critical share alert · in cima quando ≥ 25% dei locali è da attivare */}
      {isCriticalShare && (
        <button onClick={scrollToList} style={{
          all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:13,
          width:'100%', boxSizing:'border-box',
          padding:'13px 15px', marginBottom:16,
          background: `linear-gradient(135deg, ${ADM.DANGER}, #B91C1C)`,
          borderRadius:11, color:'#fff',
          boxShadow:'0 8px 24px -10px rgba(220,38,38,0.55)',
          transition:'transform 0.12s, box-shadow 0.18s',
        }}
        onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 12px 30px -10px rgba(220,38,38,0.65)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 24px -10px rgba(220,38,38,0.55)'; }}>
          <span style={{width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.18)', display:'grid', placeItems:'center', flexShrink:0, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.25)'}}>
            <BuIcons.alertTriangle size={23} color="#fff"/>
          </span>
          <div style={{flex:1, minWidth:0, textAlign:'left'}}>
            <div style={{fontSize:15.1, fontWeight:800, letterSpacing:'-0.01em'}}>
              {daAttivare.length} locali ({daAttivarePct.toFixed(0)}%) sotto la soglia minima
            </div>
            <div style={{fontSize:13.3, color:'rgba(255,255,255,0.88)', marginTop:3, lineHeight:1.45}}>
              Più di 1 locale su 4 non sta usando i QR. Intervento commerciale o tecnico necessario.
            </div>
          </div>
          <span style={{
            padding:'7px 12px', background:'rgba(255,255,255,0.2)', borderRadius:8,
            fontSize:13.7, fontWeight:700, display:'inline-flex', alignItems:'center', gap:6,
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.25)',
          }}>
            Vai alla lista <BuIcons.chevronRight size={18} color="#fff"/>
          </span>
        </button>
      )}

      {/* Stacked bar */}
      <div style={{
        display:'flex', height:54, borderRadius:10, overflow:'hidden',
        background:'#F0F1F3', boxShadow:'inset 0 0 0 1px rgba(0,0,0,0.04)',
      }}>
        {buckets.map(b => {
          const pct = total > 0 ? (b.locali.length / total) * 100 : 0;
          if (pct === 0) return null;
          // Mostra label/numero solo se il segmento è abbastanza largo
          const showText = pct >= 6;
          return (
            <div key={b.id}
              title={`${b.label} (${b.range}) · ${b.locali.length} locali · ${pct.toFixed(1)}%`}
              style={{
                width:`${pct}%`,
                background: b.color,
                color: b.textOn,
                display:'flex', alignItems:'center', justifyContent:'center',
                flexDirection: showText ? 'row' : 'column',
                gap: showText ? 8 : 0,
                fontSize:14.4, fontWeight: 700,
                padding: showText ? '0 10px' : 0,
                minWidth:0, overflow:'hidden',
                borderRight: '1px solid rgba(255,255,255,0.12)',
              }}>
              {showText && (
                <>
                  <span style={{fontSize:15.8, fontWeight:800, letterSpacing:'-0.01em'}}>{b.locali.length}</span>
                  <span style={{fontSize:13.3, fontWeight:600, opacity:0.92}}>{pct.toFixed(0)}%</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Range axis (etichette di soglia sotto la barra) */}
      <div style={{
        display:'flex', marginTop:8, fontSize:12.6, color:ADM.MUTED_SOFT, fontWeight:600,
        fontFamily:'ui-monospace, monospace',
      }}>
        {buckets.map(b => {
          const pct = total > 0 ? (b.locali.length / total) * 100 : 0;
          return (
            <div key={b.id} style={{width:`${pct}%`, textAlign:'center', minWidth:0, overflow:'hidden', whiteSpace:'nowrap'}}>
              {pct >= 6 ? b.range : ''}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div style={{
        marginTop:16,
        display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:10,
      }}>
        {ADOPTION_BANDS.map(b => (
          <div key={b.id} style={{
            padding:'10px 12px',
            border:`1px solid ${ADM.BORDER_SOFT}`,
            borderRadius:8,
            background:'#fff',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:5}}>
              <span style={{width:10, height:10, borderRadius:3, background:b.color, flexShrink:0}}/>
              <span style={{fontSize:13.7, fontWeight:700, color:ADM.TEXT}}>{b.label}</span>
              <span style={{fontSize:12.6, color:ADM.MUTED, fontFamily:'ui-monospace, monospace', marginLeft:'auto'}}>{b.range}</span>
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.4}}>{b.hint}</div>
          </div>
        ))}
      </div>

      {/* Da attivare */}
      <div ref={listRef} style={{
        marginTop:18, padding:'14px 16px',
        background:'#FFF7ED', border:`1px solid #FED7AA`, borderRadius:10,
        scrollMarginTop: 80,
      }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{
              width:24, height:24, borderRadius:6,
              background:ADM.DANGER, color:'#fff',
              display:'grid', placeItems:'center',
            }}>
              {/* alertTriangle, non «alert»: il Proxy delle icone rende null
                  i nomi ignoti, e il chip restava un quadratino vuoto. */}
              <BuIcons.alertTriangle size={18}/>
            </span>
            <div>
              <div style={{fontSize:14.4, fontWeight:700, color:'#7C2D12'}}>Da attivare</div>
              <div style={{fontSize:13, color:'#9A3412', marginTop:1}}>
                Locali in fascia <strong>Non attivato</strong> e <strong>Critico</strong> — richiedono intervento commerciale o tecnico
              </div>
            </div>
          </div>
          <span style={{
            padding:'4px 10px', background:ADM.DANGER, color:'#fff',
            borderRadius:99, fontSize:13.3, fontWeight:800,
          }}>{daAttivare.length}</span>
        </div>

        {daAttivare.length === 0 ? (
          <div style={{padding:'14px 8px', fontSize:14, color:'#9A3412', fontStyle:'italic', textAlign:'center'}}>
            Nessun locale problematico — ottimo lavoro 🎉
          </div>
        ) : (
          <div style={{
            background:'#fff', borderRadius:8, border:`1px solid #FED7AA`,
            overflow:'hidden', maxHeight: 360, overflowY:'auto',
          }}>
            {daAttivare.slice(0, 12).map((l, i, arr) => {
              const b = bandOf(l.qrAdoption);
              return (
                <button
                  key={l.id}
                  className="adm-row-open"
                  onClick={()=>onNav && onNav('locali', { openLocale: l })}
                  style={{
                    all:'unset',
                    display:'flex', alignItems:'center', gap:12,
                    padding:'10px 14px',
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
                    cursor:'pointer', width:'100%', boxSizing:'border-box',
                    transition:'background 0.12s',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=ADM.PANEL_SOFT}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div style={{
                    width:8, height:8, borderRadius:2, background:b.color, flexShrink:0,
                  }}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                      {l.nome} <span style={{color:ADM.MUTED, fontWeight:400}}>· {admTipoLabel(l.tipo)}</span>
                    </div>
                    <div style={{fontSize:13, color:ADM.MUTED, marginTop:1, fontFamily:'ui-monospace, monospace'}}>
                      {l.id} · {l.citta}
                    </div>
                  </div>
                  <div style={{
                    fontSize:14.4, fontWeight:800, color: b.color,
                    fontFamily:'ui-monospace, monospace',
                    minWidth:48, textAlign:'right',
                  }}>
                    {l.qrAdoption === 0 ? '0%' : `${l.qrAdoption.toFixed(1)}%`}
                  </div>
                  <span style={{
                    padding:'3px 9px', borderRadius:99,
                    background: b.color, color: b.textOn,
                    fontSize:12.6, fontWeight:700, whiteSpace:'nowrap',
                    textTransform:'uppercase', letterSpacing:'0.04em',
                  }}>{b.label}</span>
                  <span className="adm-row-chev" style={{color:ADM.MUTED, flexShrink:0}}><BuIcons.chevronRight size={20}/></span>
                </button>
              );
            })}
            {daAttivare.length > 12 && (
              <div style={{
                padding:'10px 14px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
                fontSize:13.3, color:ADM.MUTED, textAlign:'center', fontStyle:'italic',
                background:'#FFFBF6',
              }}>
                e altri {daAttivare.length - 12} locali · usa la sezione Operatività per la lista completa
              </div>
            )}
          </div>
        )}
      </div>
    </AdmCard>
  );
}

// ---------- SCAN / ORDINI: sotto la media (Locali tab) ----------
function SottoMediaScanCard({ onNav }) {
  const [periodo, setPeriodo] = React.useState('mese'); // 'mese' | 'anno'
  const isAnno = periodo === 'anno';

  // Solo locali "live" che hanno almeno qualche ordine (eligible per il confronto)
  const eligible = LOCALI.filter(l =>
    (l.stato === 'active' || l.stato === 'inactive' || l.stato === 'skipped') &&
    (isAnno ? l.ordiniAnno : l.ordiniMese) > 0
  );

  // La conversione è ordini NATI da uno scan ÷ scan. Con gli ordini di tutti
  // i canali al numeratore la lista «sotto la media» era guidata dai campioni
  // dell'adozione QR e assolveva i fermi con conversioni da 800% in su:
  // l'esatto contrario di quello che la card promette. Gli ordini via QR si
  // ricavano dall'adozione, che è la loro definizione (admin-data.jsx).
  const ordiniViaQR = (l) => Math.round((isAnno ? l.ordiniAnno : l.ordiniMese) * (l.qrAdoption || 0) / 100);

  const totScan  = eligible.reduce((s,l)=> s + (isAnno ? l.scanQRAnno : l.scanQRMese), 0);
  const totOrdQR = eligible.reduce((s,l)=> s + ordiniViaQR(l), 0);
  const ratioAvg = totScan > 0 ? totOrdQR / totScan : 0;

  const withRatio = eligible.map(l => {
    const scan = isAnno ? l.scanQRAnno : l.scanQRMese;
    const ord  = ordiniViaQR(l);
    return { ...l, _scan: scan, _ord: ord, _ratio: scan > 0 ? ord / scan : 0 };
  });

  const sottoMedia = withRatio
    .filter(l => l._scan > 0 && l._ratio < ratioAvg)
    .sort((a, b) => a._ratio - b._ratio);

  const visible = sottoMedia.slice(0, 12);
  const fmtPct = (r) => `${(r * 100).toFixed(1).replace('.', ',')}%`;

  return (
    <AdmCard padding={20}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, gap:14, flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Locali sotto la media · Conversione QR</div>
          <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:3, maxWidth:540, lineHeight:1.5}}>
            % di scan QR che diventano un ordine completato.
            Locali con tasso di conversione inferiore alla media della piattaforma — candidati per intervento.
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          {/* Periodo toggle */}
          <div style={{
            display:'inline-flex', padding:2, borderRadius:8,
            background:'#F0F1F3', fontFamily:'inherit',
          }}>
            {[
              { id:'mese', label:'Mese' },
              { id:'anno', label:'Anno' },
            ].map(p => (
              <button key={p.id} className="adm-pill" onClick={()=>setPeriodo(p.id)} style={{
                padding:'6px 14px', border:'none',
                background: periodo === p.id ? '#fff' : 'transparent',
                color: periodo === p.id ? ADM.TEXT : ADM.MUTED,
                fontSize:13.7, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                borderRadius:6,
                boxShadow: periodo === p.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition:'all 0.15s',
              }}>{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Riepilogo media */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:10, marginBottom:14,
      }}>
        <SottoMediaKpi label="Media piattaforma" value={fmtPct(ratioAvg)} sub={`${fmtNum(totOrdQR)} ordini da QR su ${fmtNum(totScan)} scan`} highlight/>
        <SottoMediaKpi label="Locali sotto media" value={fmtNum(sottoMedia.length)} sub={`su ${fmtNum(eligible.length)} tracciati`}/>
        <SottoMediaKpi label="Periodo" value={isAnno ? '12 mesi' : '30 giorni'} sub={isAnno ? 'Annuale completo' : 'Mensile corrente'}/>
      </div>

      {/* Lista */}
      {sottoMedia.length === 0 ? (
        <div style={{padding:'24px 16px', textAlign:'center', fontSize:14.4, color:ADM.MUTED, fontStyle:'italic'}}>
          Tutti i locali sono in linea o sopra la media 🎉
        </div>
      ) : (
        <div style={{
          background:'#fff', borderRadius:8, border:`1px solid ${ADM.BORDER_SOFT}`,
          overflow:'hidden',
        }}>
          {/* Header */}
          <div style={{
            display:'grid', gridTemplateColumns:'minmax(0, 2fr) 1fr 1fr 1.1fr 24px',
            padding:'8px 14px', background:ADM.PANEL_SOFT,
            borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
            fontSize:12.2, fontWeight:700, color:ADM.MUTED,
            textTransform:'uppercase', letterSpacing:'0.06em',
          }}>
            <div>Locale</div>
            <div style={{textAlign:'right'}}>Ordini da QR</div>
            <div style={{textAlign:'right'}}>Scan QR</div>
            <div style={{textAlign:'right'}}>Conversione · gap</div>
            <div/>
          </div>
          {visible.map((l, i) => {
            const gap = ratioAvg > 0 ? ((l._ratio - ratioAvg) / ratioAvg) * 100 : 0;
            const b = bandOf(l.qrAdoption);
            return (
              <button key={l.id} className="adm-row-open" onClick={()=>onNav && onNav('locali', { openLocale: l })} style={{
                all:'unset', cursor:'pointer', width:'100%', boxSizing:'border-box',
                display:'grid', gridTemplateColumns:'minmax(0, 2fr) 1fr 1fr 1.1fr 24px',
                padding:'10px 14px', alignItems:'center',
                borderBottom: i === visible.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
                transition:'background 0.12s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background=ADM.PANEL_SOFT}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{display:'flex', alignItems:'center', gap:9, minWidth:0}}>
                  {b && <span style={{width:8, height:8, borderRadius:2, background:b.color, flexShrink:0}}/>}
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                      {l.nome} <span style={{color:ADM.MUTED, fontWeight:400}}>· {admTipoLabel(l.tipo)}</span>
                    </div>
                    <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:1, fontFamily:'ui-monospace, monospace'}}>{l.id} · {l.citta}</div>
                  </div>
                </div>
                <div style={{textAlign:'right', fontSize:14, color:ADM.TEXT, fontWeight:600, fontFamily:'ui-monospace, monospace'}}>{fmtNum(l._ord)}</div>
                <div style={{textAlign:'right', fontSize:14, color:ADM.TEXT, fontWeight:600, fontFamily:'ui-monospace, monospace'}}>{fmtNum(l._scan)}</div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:14.4, fontWeight:800, color:ADM.DANGER, letterSpacing:'-0.01em'}}>{fmtPct(l._ratio)}</div>
                  <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:1, fontWeight:600}}>
                    {gap.toFixed(0)}% vs media
                  </div>
                </div>
                <span className="adm-row-chev" style={{color:ADM.MUTED, textAlign:'right'}}><BuIcons.chevronRight size={20}/></span>
              </button>
            );
          })}
          {sottoMedia.length > visible.length && (
            <div style={{
              padding:'10px 14px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
              fontSize:13.3, color:ADM.MUTED, textAlign:'center', fontStyle:'italic',
              background:ADM.PANEL_SOFT,
            }}>
              e altri {sottoMedia.length - visible.length} locali sotto la media
            </div>
          )}
        </div>
      )}
    </AdmCard>
  );
}

function SottoMediaKpi({ label, value, sub, highlight }) {
  return (
    <div style={{
      padding:'12px 14px',
      background: highlight ? ADM.PINK_BG_SOFT : '#fff',
      border:`1px solid ${highlight ? ADM.PINK_SOFT : ADM.BORDER_SOFT}`,
      borderRadius:9,
    }}>
      <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</div>
      <div style={{fontSize:19.4, fontWeight:800, color: highlight ? ADM.PINK_DARK : ADM.TEXT, marginTop:5, letterSpacing:'-0.02em', lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:13, color:ADM.MUTED, marginTop:4, fontWeight:500}}>{sub}</div>}
    </div>
  );
}

// ---------- UTENTI APP tab ----------
const scalaUtenti = UTENTI_BASE / UTENTI.length;

function DashUtentiApp() {
  const totUtenti = UTENTI_BASE;
  const stickiness = Math.round(APP_METRICS.dau/APP_METRICS.mau*100);
  // Benchmark di settore food/lifestyle apps · DAU/MAU 20% = ottimo, 10-20% = buono, <10% = basso
  const stickinessTone = stickiness >= 20 ? 'OK' : stickiness >= 10 ? 'WARN' : 'DANGER';
  const stickinessLabel = stickiness >= 20 ? 'frequenza d’uso eccellente' : stickiness >= 10 ? 'frequenza d’uso in linea' : 'frequenza d’uso sotto la media';
  const quotaRegistrati = (n) => Math.round(n / totUtenti * 100);

  // demografia mock
  const genere = { F: 0.54, M: 0.44, altro: 0.02 };
  const fasceEta = [
    { label: '18-25', pct: 22 },
    { label: '26-35', pct: 38 },
    { label: '36-45', pct: 24 },
    { label: '46-55', pct: 11 },
    { label: '56+',   pct: 5  },
  ];
  const dauW = woW(TS.dau);
  const wauW = woW(TS.wau);
  const mauW = moM(TS.mau);
  const totW = woW(TS.utentiTot);
  const guestW = woW(TS.ordiniGuest);
  const prenotW = woW(TS.prenotApp);

  // ───── Mock data segmentati ─────────────────────────────────────────────
  // AOV per sesso × fascia età (€ scontrino medio)
  const ages = ['18-25','26-35','36-45','46-55','56+'];
  const aovMatrix = {
    F: { '18-25': 22, '26-35': 27, '36-45': 29, '46-55': 33, '56+': 35 },
    M: { '18-25': 19, '26-35': 24, '36-45': 31, '46-55': 38, '56+': 42 },
  };
  const aovValues = ages.flatMap(a => [aovMatrix.F[a], aovMatrix.M[a]]);
  const aovMin = Math.min(...aovValues), aovMax = Math.max(...aovValues);

  // Distribuzione scontrino in fasce (% utenti)
  const ticketBuckets = [
    { range: '€ 0-15',    pct: 18, color: 'rgba(49,53,61,0.30)' },
    { range: '€ 15-25',   pct: 34, color: 'rgba(49,53,61,0.45)' },
    { range: '€ 25-40',   pct: 28, color: 'rgba(49,53,61,0.60)' },
    { range: '€ 40-60',   pct: 13, color: 'rgba(49,53,61,0.75)' },
    { range: '€ 60-100',  pct:  5, color: 'rgba(49,53,61,0.88)' },
    { range: '€ 100+',    pct:  2, color: '#31353D' },
  ];

  // ── PRENOTAZIONI NO-SHOW · pain point ristoratore ──────────────────────
  // Industria: 5-10% no-show su prenotato (peggio venerdì/sabato sera)
  const noShowRate = 7.4; // %
  // Il prenotato del mese non è più un numero a sé: è quello che i locali
  // vivi ricevono davvero, e il no-show è una quota di quello.
  const totPrenot30g = LOC.live.reduce((s2, l) => s2 + (l.prenotazioniMese || 0), 0);
  const noShowCount30g = Math.round(totPrenot30g * noShowRate / 100);
  const noShowTrend = [
    { m:'Giu 25', pct:6.2 },{ m:'Lug 25', pct:6.8 },{ m:'Ago 25', pct:7.4 },
    { m:'Set 25', pct:6.9 },{ m:'Ott 25', pct:6.5 },{ m:'Nov 25', pct:7.1 },
    { m:'Dic 25', pct:8.4 },{ m:'Gen 26', pct:7.8 },{ m:'Feb 26', pct:7.0 },
    { m:'Mar 26', pct:7.2 },{ m:'Apr 26', pct:7.6 },{ m:'Mag 26', pct:7.4 },
  ];
  // Heatmap giorno × fascia oraria: % no-show
  const noShowHeat = [
    { g:'Lun', vals:[3.4, 4.1, 4.8, 5.2, 6.1] },
    { g:'Mar', vals:[3.6, 4.3, 5.0, 5.4, 6.4] },
    { g:'Mer', vals:[3.8, 4.5, 5.4, 5.8, 6.8] },
    { g:'Gio', vals:[4.2, 5.0, 6.0, 6.8, 8.2] },
    { g:'Ven', vals:[5.0, 6.2, 7.4, 9.2,11.4] },
    { g:'Sab', vals:[5.6, 6.8, 8.6,10.4,12.8] },
    { g:'Dom', vals:[4.6, 5.4, 6.2, 7.0, 7.8] },
  ];
  const noShowSlots = [
    { label:'Pranzo',      range:'12–14h' },
    { label:'Pomeriggio',  range:'14–19h' },
    { label:'Pre-cena',    range:'19–20h' },
    { label:'Cena',        range:'20–21h' },
    { label:'Serale',      range:'21–23h' },
  ];
  const noShowMax = Math.max(...noShowHeat.flatMap(d => d.vals));


  // Frequenza ordini/utente/mese per fascia età
  // Frequenza d'ordine per fascia d'età: contata sugli utenti, non scritta a
  // mano. I valori a mano dicevano 1,8-3,4 ordini al mese quando la media
  // consentita dal canale app è mezzo ordine — e la card accanto, che la
  // spesa la calcola dai dati, li smentiva.
  const freqByAge = (() => {
    const fasce = [
      { age:'18-25', min:18, max:25, trend:-0.2 },
      { age:'26-35', min:26, max:35, trend:+0.4 },
      { age:'36-45', min:36, max:45, trend:+0.1 },
      { age:'46-55', min:46, max:55, trend: 0.0 },
      { age:'56+',   min:56, max:200, trend:+0.2 },
    ];
    return fasce.map(f => {
      const suoi = UTENTI.filter(u => u.eta >= f.min && u.eta <= f.max);
      const mesi = suoi.reduce((a, u) => a + Math.max(1,
        (Date.now() - new Date(u.dataRegistrazione).getTime()) / 86400000 / 30), 0);
      const ordini = suoi.reduce((a, u) => a + u.ordini, 0);
      return { ...f, orders: mesi ? +(ordini / mesi).toFixed(2) : 0 };
    });
  })();
  const freqMax = Math.max(...freqByAge.map(f=>f.orders));

  // Top 3 categorie piatti per cohort (8 cohort: 4 fasce × 2 sessi più ricche)
  const topCatByCohort = [
    { cohort:'F 18-25', cats:[ {n:'Pizza', p:32}, {n:'Sushi & Poke', p:24}, {n:'Drinks', p:18} ] },
    { cohort:'F 26-35', cats:[ {n:'Sushi & Poke', p:28}, {n:'Pizza', p:23}, {n:'Primi', p:19} ] },
    { cohort:'F 36-45', cats:[ {n:'Primi', p:27}, {n:'Secondi', p:21}, {n:'Pizza', p:18} ] },
    { cohort:'F 46+',   cats:[ {n:'Secondi', p:31}, {n:'Primi', p:24}, {n:'Antipasti', p:17} ] },
    { cohort:'M 18-25', cats:[ {n:'Pizza', p:38}, {n:'Burger', p:22}, {n:'Drinks', p:15} ] },
    { cohort:'M 26-35', cats:[ {n:'Pizza', p:29}, {n:'Burger', p:19}, {n:'Primi', p:17} ] },
    { cohort:'M 36-45', cats:[ {n:'Primi', p:26}, {n:'Pizza', p:22}, {n:'Secondi', p:20} ] },
    { cohort:'M 46+',   cats:[ {n:'Secondi', p:34}, {n:'Primi', p:23}, {n:'Antipasti', p:15} ] },
  ];
  const catColors = { 'Pizza':ADM.PINK, 'Sushi & Poke':ADM.INFO, 'Drinks':ADM.PURPLE, 'Primi':ADM.WARN, 'Secondi':ADM.DANGER, 'Antipasti':ADM.OK, 'Burger':'#92400E' };

  // Heatmap fascia oraria × cohort età (intensità 0-100)
  const hourBands = ['Colazione 7-10', 'Pranzo 12-14', 'Pomer. 14-18', 'Aperitivo 18-20', 'Cena 20-22', 'Dopocena 22-01'];
  const hourCohorts = [
    { c:'18-25', vals:[ 8, 38, 18, 48, 88, 72 ] },
    { c:'26-35', vals:[12, 62, 24, 64, 94, 48 ] },
    { c:'36-45', vals:[14, 72, 22, 38, 86, 22 ] },
    { c:'46-55', vals:[18, 68, 20, 26, 78, 12 ] },
    { c:'56+',   vals:[28, 58, 18, 14, 64,  6 ] },
  ];

  // Top città con AOV e ordini/mese (estendo TOP_CITTA con AOV per città).
  // TOP_CITTA ora si conta dal registro e i suoi ordini sono già MENSILI:
  // il vecchio ÷12 li avrebbe fatti passare per annuali una seconda volta.
  const cityAOV = { 'Milano':29, 'Roma':25, 'Napoli':19, 'Bologna':27, 'Firenze':28, 'Torino':24 };
  const cityRows = TOP_CITTA.map(c => ({
    ...c,
    aov: cityAOV[c.citta] || 22,
    ordiniMese: c.ordini,
  })).sort((a,b) => b.ordiniMese - a.ordiniMese);
  const cityMaxOrdini = Math.max(...cityRows.map(c=>c.ordiniMese));

  // Top ingredienti più ordinati (mock — richiede labeling per piatto in futuro)
  const topIngredienti = [
    { n:'Pomodoro',         ord: 32400, cat:'Base',        trend: +6 },
    { n:'Mozzarella',       ord: 28160, cat:'Latticini',   trend: +9 },
    { n:'Farina di grano',  ord: 24820, cat:'Base',        trend: +4 },
    { n:'Olio EVO',         ord: 19340, cat:'Condimento',  trend: +2 },
    { n:'Basilico',         ord: 14210, cat:'Aromatica',   trend: +11 },
    { n:'Guanciale',        ord:  9870, cat:'Carne',       trend: +14 },
    { n:'Pecorino romano',  ord:  8340, cat:'Latticini',   trend: +8 },
    { n:'Uovo',             ord:  7720, cat:'Proteine',    trend: -3 },
    { n:'Salmone',          ord:  6420, cat:'Pesce',       trend: +22 },
    { n:'Avocado',          ord:  5180, cat:'Vegetale',    trend: +28 },
  ];

  // Distribuzione macronutrienti aggregata · serie 12 mesi (Giu 25 → Mag 26)
  // per macro-regione. Le % per ogni mese sommano a 100 dentro la regione.
  // Pattern: Sud e Isole carboidrati alti (pizza/pasta); Nord-Ovest più
  // proteine/health-trend; Centro pasta-heavy. Dieta in lieve riequilibrio
  // ovunque (meno carbo, più prot/fibre).
  const foodMonths = ['Giu 25','Lug 25','Ago 25','Set 25','Ott 25','Nov 25','Dic 25','Gen 26','Feb 26','Mar 26','Apr 26','Mag 26'];
  const FOOD_REGIONS = ['Tutta Italia','Nord-Ovest','Nord-Est','Centro','Sud','Isole'];
  const macrosByRegion = {
    'Tutta Italia': [
      { n:'Carboidrati', color:'#F59E0B', desc:'pasta, pizza, pane',           series:[55,55,54,54,54,53,53,53,52,52,52,52] },
      { n:'Proteine',    color:'#DC2626', desc:'carne, pesce, formaggi',       series:[21,21,21,22,22,22,22,23,23,23,23,23] },
      { n:'Grassi',      color:'#FBBF24', desc:'oli, latticini, frutta secca', series:[20,20,21,20,20,21,21,20,20,20,20,20] },
      { n:'Fibre',       color:'#16A34A', desc:'verdura, legumi, integrali',   series:[ 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5] },
    ],
    'Nord-Ovest': [
      { n:'Carboidrati', color:'#F59E0B', desc:'pasta, pizza, pane',           series:[51,51,50,50,50,49,49,49,48,48,48,48] },
      { n:'Proteine',    color:'#DC2626', desc:'carne, pesce, formaggi',       series:[24,24,24,25,25,25,25,26,26,26,26,26] },
      { n:'Grassi',      color:'#FBBF24', desc:'oli, latticini, frutta secca', series:[20,20,21,20,20,21,21,20,20,20,20,20] },
      { n:'Fibre',       color:'#16A34A', desc:'verdura, legumi, integrali',   series:[ 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6] },
    ],
    'Nord-Est': [
      { n:'Carboidrati', color:'#F59E0B', desc:'polenta, riso, pane',          series:[55,55,54,54,54,53,53,53,52,52,52,52] },
      { n:'Proteine',    color:'#DC2626', desc:'carne, pesce, formaggi',       series:[22,22,22,23,23,23,23,24,24,24,24,24] },
      { n:'Grassi',      color:'#FBBF24', desc:'burro, latticini, lardo',      series:[19,19,20,19,19,19,19,19,19,19,19,19] },
      { n:'Fibre',       color:'#16A34A', desc:'verdura, legumi, integrali',   series:[ 4, 4, 4, 4, 4, 5, 5, 4, 5, 5, 5, 5] },
    ],
    'Centro': [
      { n:'Carboidrati', color:'#F59E0B', desc:'pasta, pizza, pane (Lazio)',   series:[59,59,58,58,58,57,57,57,56,56,56,56] },
      { n:'Proteine',    color:'#DC2626', desc:'carne, pesce, formaggi',       series:[19,19,19,20,20,20,20,21,21,21,21,21] },
      { n:'Grassi',      color:'#FBBF24', desc:'guanciale, pecorino, olio',    series:[18,18,19,18,18,19,19,18,19,19,19,19] },
      { n:'Fibre',       color:'#16A34A', desc:'verdura, legumi, integrali',   series:[ 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] },
    ],
    'Sud': [
      { n:'Carboidrati', color:'#F59E0B', desc:'pizza, pasta, pane, frittura', series:[60,60,59,59,59,58,58,58,57,57,57,57] },
      { n:'Proteine',    color:'#DC2626', desc:'mozzarella, pesce, carne',     series:[18,18,18,19,19,19,19,20,20,20,20,20] },
      { n:'Grassi',      color:'#FBBF24', desc:'olio EVO, mozzarella, fritto', series:[19,19,20,19,19,19,19,19,19,19,19,19] },
      { n:'Fibre',       color:'#16A34A', desc:'verdura, legumi, integrali',   series:[ 3, 3, 3, 3, 3, 4, 4, 3, 4, 4, 4, 4] },
    ],
    'Isole': [
      { n:'Carboidrati', color:'#F59E0B', desc:'pasta, pane, arancini',        series:[57,57,56,56,56,55,55,55,55,55,55,55] },
      { n:'Proteine',    color:'#DC2626', desc:'pesce, tonno, carne',          series:[20,20,20,21,21,21,21,22,22,22,22,22] },
      { n:'Grassi',      color:'#FBBF24', desc:'olio EVO, fritto, latticini',  series:[20,20,21,20,20,20,20,20,20,20,20,20] },
      { n:'Fibre',       color:'#16A34A', desc:'verdura, legumi, integrali',   series:[ 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3] },
    ],
  };
  const [macroRegion, setMacroRegion] = useStateDash('Tutta Italia');
  const macrosTime = macrosByRegion[macroRegion];
  const macros = macrosTime.map(m => ({ n:m.n, color:m.color, desc:m.desc, pct: m.series[m.series.length-1], trend: m.series[m.series.length-1] - m.series[0] }));

  // Generatore sparkline 12 mesi: dato value corrente e trend% (vs 12m fa),
  // produce 12 punti con drift lineare + lieve componente sinusoidale.
  const gen12 = (current, trendPct, seed=0) => {
    const start = current / (1 + trendPct/100);
    return Array.from({length:12}, (_, i) => {
      const t = i / 11;
      const base = start + (current - start) * t;
      const wobble = Math.sin((i + seed) * 1.7) * 0.045 * current;
      return Math.max(1, Math.round(base + wobble));
    });
  };
  const topPiattiTrend  = TOP_PIATTI.slice(0, 8).map((p, i) => ({ ...p, spark: gen12(p.ordini, p.trend, i+1) }));
  const topIngrTrend    = topIngredienti.map((ing, i) => ({ ...ing, spark: gen12(ing.ord, ing.trend, i+11) }));

  // Consumo alimentare per macro-regione: top 3 categorie ordinate
  const regionFood = [
    { regione:'Nord-Ovest', top:[{n:'Pizza',pct:24},{n:'Risotti',pct:18},{n:'Aperitivi',pct:16}] },
    { regione:'Nord-Est',   top:[{n:'Polenta & carne',pct:22},{n:'Pizza',pct:21},{n:'Cicchetti',pct:14}] },
    { regione:'Centro',     top:[{n:'Carbonara & paste',pct:28},{n:'Pizza',pct:22},{n:'Trippa & lampredotto',pct:9}] },
    { regione:'Sud',        top:[{n:'Pizza napoletana',pct:36},{n:'Pasta al pomodoro',pct:24},{n:'Frittura mista',pct:13}] },
    { regione:'Isole',      top:[{n:'Pesce alla griglia',pct:26},{n:'Pasta alla Norma',pct:21},{n:'Arancini & street food',pct:18}] },
  ];

  // ───── Stagionalità × geografia: 12 mesi × N piatti ─────────────────────
  // DISH_CATALOG / SEASONAL_ARC / SEASONAL_BIAS sono definiti a livello modulo
  // (in cima al file) per essere condivisi con la sezione "Posizionamento prezzi"
  // del tab Locali.
  const monthsLabel = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  const SEASONAL_REGIONS = ['Tutta Italia','Nord-Ovest','Nord-Est','Centro','Sud','Isole'];
  // Palette per linee piatto (max 10)
  const dishPalette = ['#0F1115', '#FF1F5A', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#EF4444'];
  const [seasonalRegion, setSeasonalRegion] = useStateDash('Tutta Italia');
  const [seasonalSel, setSeasonalSel] = useStateDash(['Pizza Margherita', 'Carbonara', 'Pasta fredda & insalatone']);
  const [seasonalQuery, setSeasonalQuery] = useStateDash('');
  const [seasonalPickerOpen, setSeasonalPickerOpen] = useStateDash(false);
  const seasonalMaxPick = 10;
  const seasonalSeriesByDish = seasonalSel.map(n => ({ name:n, vals: seasonalSeriesFor(n, seasonalRegion) }));
  const seasonalAllVals = seasonalSeriesByDish.flatMap(d => d.vals);
  const seasonalMax = seasonalAllVals.length ? Math.max(...seasonalAllVals) : 200;
  const seasonalMin = seasonalAllVals.length ? Math.min(...seasonalAllVals) : 0;
  const seasonalFiltered = DISH_CATALOG.filter(d => {
    const q = seasonalQuery.trim().toLowerCase();
    if (!q) return true;
    return d.n.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q);
  });

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:20}}>

      {/* ═══════════ Andamento — la base utenti in sintesi ═══════════ */}
      <SectionLabel title="Andamento" desc="La base utenti e il suo utilizzo in sintesi" first/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        <SparkStat label="Utenti totali" value={fmtNum(totUtenti)}
          sub={`+${fmtNum(APP_METRICS.newRegistrazioni30g)} ultimi 30g`}
          accent="INK" icon="users"
          trend={totW.delta} trendLabel="vs 7gg" spark={TS.utentiTot.slice(-30)}/>
        {/* La quota sui registrati arriva dall'espansione «Utenti · dettaglio»
            che stava in Analisi Dati → Generale: diceva questi stessi tre
            numeri come percentuale della base iscritta. È l'unica cosa che qui
            mancava — DAU su MAU e WAU su MAU c'erano già — e adesso sta
            attaccata ai numeri che descrive. */}
        <SparkStat label="DAU · giornalieri" value={fmtNum(APP_METRICS.dau)}
          sub={<><strong style={{color:ADM[stickinessTone]}}>{stickiness}%</strong> degli utenti mensili li usa ogni giorno <span style={{color:ADM.MUTED}}>· {stickinessLabel} · {quotaRegistrati(APP_METRICS.dau)}% dei registrati</span></>}
          accent="INK" icon="trendUp"
          trend={dauW.delta} trendLabel="vs 7gg" spark={TS.dau.slice(-30)}/>
        <SparkStat label="WAU · settimanali" value={fmtNum(APP_METRICS.wau)}
          sub={`${Math.round(APP_METRICS.wau/APP_METRICS.mau*100)}% del MAU · ${quotaRegistrati(APP_METRICS.wau)}% dei registrati`}
          accent="INK" icon="trendUp"
          trend={wauW.delta} trendLabel="vs 7gg" spark={TS.wau.slice(-30)}/>
        <SparkStat label="MAU · mensili" value={fmtNum(APP_METRICS.mau)}
          sub={`${quotaRegistrati(APP_METRICS.mau)}% dei registrati ha usato l'app nel mese`}
          accent="INK" icon="trendUp"
          trend={mauW.delta} trendLabel="vs 30gg" spark={TS.mau.slice(-30)}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        {/* Le guest sono sessioni, non persone: stanno qui sotto e non dentro
            DAU/WAU/MAU, che contano solo chi ha un account. */}
        <SparkStat label="Ordini da Guest (30g)" value={fmtNum(APP_METRICS.ordiniGuest30g)}
          sub={`Su ${fmtNum(APP_METRICS.sessioniGuest30g)} sessioni anonime · ${Math.round(APP_METRICS.ordiniGuest30g / APP_METRICS.sessioniGuest30g * 100)}% converte in ordine · fuori dal conto degli utenti`}
          accent="INK" icon="receipt"
          trend={guestW.delta} trendLabel="vs 7gg" spark={TS.ordiniGuest.slice(-30)}/>
        <SparkStat label="Prenotazioni da app (30g)" value={fmtNum(APP_METRICS.prenotazioniApp30g)}
          accent="INK" icon="calendar"
          trend={prenotW.delta} trendLabel="vs 7gg" spark={TS.prenotApp.slice(-30)}/>
        <SparkStat label="Scontrino medio" value={fmtEur(APP_METRICS.ticketMedioApp)}
          sub="Per ordine via app" accent="INK" icon="money"
          trend={+2.4} trendLabel="vs mese prec."/>
        <SparkStat label="Sessione media" value={`${APP_METRICS.avgSessioneMin} min`}
          accent="INK" icon="clock"
          trend={+0.6} trendLabel="vs mese prec."/>
      </div>

      {/* DAU e MAU dicono quanto usano l'app quelli rimasti; questa dice quanti
          restano. Sono due domande diverse. */}
      <SectionLabel title="Quanti restano" desc="Chi torna dopo un giorno, una settimana, un mese · e chi fa un secondo ordine"/>
      {window.AnRitenzione ? <AnRitenzione/> : null}

      {/* Da dove arrivano gli iscritti: le due strade che non costano niente. */}
      <SectionLabel title="Da dove arrivano" desc="Inviti condivisi e riscattati, e il passaggio dalla webapp all'app"/>
      {window.AnCrescita ? <AnCrescita/> : null}

      {/* ═══════════ La rete ═══════════ */}
      {/* Il campione è di quaranta utenti: la piattaforma ne dichiara 12.480,
          e i due numeri stanno sulla stessa pagina. La scala è la stessa che
          costruisce UTENTI_BASE. */}
      {/* Il numero che dice se byup è una rete o venticinque app separate: un
          utente che ordina solo dove ha ordinato la prima volta ha scaricato
          l'app di quel ristorante, non la nostra. */}
      <SectionLabel title="La rete" desc="Quanti clienti girano fra più locali · è il flywheel, misurato"/>
      <div style={{display:'grid', gridTemplateColumns:'320px minmax(0,1fr)', gap:14, alignItems:'stretch'}}>
        <AdmCard padding={20} style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
          <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>
            Ordinano in più di un locale
          </div>
          <div style={{fontSize:40, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1, marginTop:8}}>
            {RETE.pct}%
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:8, lineHeight:1.45}}>
            {/* Come le altre card di questa schermata, i conteggi sono sulla
                base stimata (il campione × 312), non sulle quaranta righe del
                campione: due scale nella stessa riga non si possono leggere. */}
            {fmtNum(Math.round(RETE.cross * scalaUtenti))} clienti su {fmtNum(Math.round(RETE.conOrdini * scalaUtenti))} che
            hanno ordinato almeno una volta · in media in <b style={{color:ADM.TEXT}}>{RETE.mediaCross.toFixed(1).replace('.', ',')} locali</b>
          </div>
        </AdmCard>
        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT, marginBottom:14}}>In quanti locali diversi ordinano</div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {RETE.distribuzione.map((d, i2) => {
              const max = Math.max(...RETE.distribuzione.map(x => x.n), 1);
              const pct = RETE.conOrdini ? Math.round(d.n / RETE.conOrdini * 100) : 0;
              return (
                <div key={d.label} style={{display:'flex', alignItems:'center', gap:12}}>
                  <span style={{width:78, fontSize:13.6, color:ADM.TEXT, fontWeight:600}}>{d.label}</span>
                  <span style={{flex:1, height:9, borderRadius:99, background:'#F4F5F7', overflow:'hidden'}}>
                    <span style={{display:'block', width:`${d.n / max * 100}%`, height:'100%', borderRadius:99,
                      background: i2 === 0 ? ADM.MUTED_LIGHT : ADM.INK}}/>
                  </span>
                  <span style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT, width:52, textAlign:'right',
                    fontVariantNumeric:'tabular-nums'}}>{fmtNum(Math.round(d.n * scalaUtenti))}</span>
                  <span style={{fontSize:12.6, color:ADM.MUTED, width:38, textAlign:'right'}}>{pct}%</span>
                </div>
              );
            })}
          </div>
          {/* Normalizzato per densità: il tasso complessivo non misura
              l'effetto rete, misura Milano. Dove abbiamo un locale solo il
              secondo ordine altrove è impossibile per costruzione, e un
              utente che non gira non ci dice che la rete non funziona — ci
              dice che lì la rete non c'è. Stessa logica della soglia di
              densità della discovery. */}
          <div style={{marginTop:16, paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
              letterSpacing:'0.05em', marginBottom:10}}>Per densità della città</div>
            <div style={{display:'flex', flexDirection:'column', gap:9}}>
              {RETE.perDensita.map(f => (
                <div key={f.id} style={{display:'flex', alignItems:'center', gap:12}}>
                  <span style={{width:150, fontSize:13.4, color:ADM.TEXT, fontWeight:600}}>{f.label}</span>
                  <span style={{flex:1, height:9, borderRadius:99, background:'#F4F5F7', overflow:'hidden'}}>
                    <span style={{display:'block', width:`${f.pct == null ? 0 : f.pct}%`, height:'100%', borderRadius:99,
                      background: f.id === 'densa' ? ADM.INK : f.id === 'media' ? ADM.MUTED : ADM.MUTED_LIGHT}}/>
                  </span>
                  <span style={{fontSize:13.6, fontWeight:800, color: f.pct == null ? ADM.MUTED_LIGHT : ADM.TEXT,
                    width:44, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
                    {f.pct == null ? '—' : `${f.pct}%`}
                  </span>
                  <span style={{fontSize:12.2, color:ADM.MUTED_LIGHT, width:150, textAlign:'right'}}>
                    {f.citta} città · {fmtNum(Math.round(f.utenti * scalaUtenti))} clienti
                  </span>
                </div>
              ))}
            </div>
            {(() => {
              const densa = RETE.perDensita.find(f => f.id === 'densa');
              // La città con più locali, presa dai dati: scriverne una a mano
              // significa sbagliarla il giorno in cui la rete cresce altrove.
              const cittaPiuDensa = Object.keys(RETE.localiPerCitta)
                .sort((a, b) => RETE.localiPerCitta[b] - RETE.localiPerCitta[a])[0] || '—';
              const sottile = RETE.perDensita.find(f => f.id === 'sottile');
              if (!densa || !sottile || densa.pct == null || sottile.pct == null) return null;
              return (
                <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:12, lineHeight:1.5}}>
                  Dove abbiamo almeno quattro locali gira il <b style={{color:ADM.TEXT}}>{densa.pct}%</b>, dove
                  ce n'è uno solo il <b style={{color:ADM.TEXT}}>{sottile.pct}%</b>: l'effetto rete è la
                  differenza fra i due, non il numero complessivo — il {RETE.pct}% della prima card è, in
                  buona parte, la densità di {cittaPiuDensa}. Con {RETE.perDensita[0].utenti} clienti nella
                  fascia densa il dato è ancora fragile: si legge come direzione, non come misura.
                </div>
              );
            })()}
          </div>

          {/* Il perché la rete conviene anche al singolo ristoratore, non solo
              a noi: chi gira ordina di più, anche da lui. */}
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5, paddingTop:12,
            borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
            Chi gira fra più locali ordina <strong style={{color:ADM.TEXT}}>{RETE.ordiniMediSolo ? (RETE.ordiniMediCross / RETE.ordiniMediSolo).toFixed(1).replace('.', ',') : '—'}×</strong> di
            chi resta in uno solo ({RETE.ordiniMediCross.toFixed(1).replace('.', ',')} contro {RETE.ordiniMediSolo.toFixed(1).replace('.', ',')} ordini
            a testa): la rete non conviene solo a noi, conviene anche al locale che l'ha portato dentro.
          </div>
        </AdmCard>
      </div>

      {/* ═══════════ Prenotazioni e no-show ═══════════ */}
      {/* Le prenotazioni erano in tre pezzi su due tab: il totale in Locali,
          quelle da app qui, i no-show di nuovo in Locali. Ma chi prenota e chi
          poi non si presenta è il cliente finale: stanno tutte qui, e in
          Locali resta il totale. */}
      <SectionLabel title="Prenotazioni e no-show"
        desc="Chi prenota dall'app e quanti tavoli restano vuoti · la prima sofferenza che il ristoratore ci gira"/>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:14}}>
        <AdmCard padding={20}>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
            <div style={{width:40, height:40, borderRadius:10, background:ADM.DANGER_SOFT, color:ADM.DANGER, display:'grid', placeItems:'center', flexShrink:0}}>
              <BuIcons.alertTriangle size={23}/>
            </div>
            <div>
              <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Tasso di no show · 30g</div>
              <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:3}}>
                <div style={{fontSize:28.1, fontWeight:800, color:ADM.DANGER, letterSpacing:'-0.025em', lineHeight:1}}>{noShowRate}%</div>
                <span style={{fontSize:13.7, color:ADM.MUTED, fontWeight:600}}>≈ {fmtNum(noShowCount30g)} prenotazioni</span>
              </div>
            </div>
          </div>
          <div style={{padding:'12px 14px', background:ADM.PANEL_SOFT, borderRadius:9, fontSize:13.3, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}><span>Media di settore IT</span><strong style={{color:ADM.TEXT}}>8-12%</strong></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Posizione Byup</span><strong style={{color:ADM.OK}}>↓ sotto la media</strong></div>
          </div>
          {/* Line chart 12 mesi con banda benchmark di settore */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Andamento ultimi 12 mesi</div>
              {(() => {
                const last = noShowTrend[noShowTrend.length-1].pct;
                const prev = noShowTrend[noShowTrend.length-2].pct;
                const d = last - prev;
                return <span style={{fontSize:13, fontWeight:700, color: d > 0 ? ADM.DANGER : d < 0 ? ADM.OK : ADM.MUTED, fontVariantNumeric:'tabular-nums'}}>{d>=0?'+':''}{d.toFixed(1)}pp vs mese prec.</span>;
              })()}
            </div>
            {(() => {
              const W = 320, H = 110, padX = 26, padY = 14;
              const plotW = W - padX*2, plotH = H - padY*2;
              const benchLo = 8, benchHi = 12;
              const yLo = 4, yHi = 14;
              const range = yHi - yLo;
              const xFor = (i) => padX + (i/(noShowTrend.length-1)) * plotW;
              const yFor = (v) => padY + (1 - (v - yLo)/range) * plotH;
              const linePath = noShowTrend.map((m,i) => `${i===0?'M':'L'} ${xFor(i)} ${yFor(m.pct)}`).join(' ');
              const areaPath = `${linePath} L ${xFor(noShowTrend.length-1)} ${yFor(yLo)} L ${xFor(0)} ${yFor(yLo)} Z`;
              const last = noShowTrend[noShowTrend.length-1];
              return (
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:'100%', height:120, display:'block'}}>
                  {/* Banda benchmark di settore */}
                  <rect x={padX} y={yFor(benchHi)} width={plotW} height={yFor(benchLo)-yFor(benchHi)} fill={ADM.WARN} opacity={0.10}/>
                  <line x1={padX} x2={W-padX} y1={yFor(benchLo)} y2={yFor(benchLo)} stroke={ADM.WARN} strokeDasharray="3 4" strokeOpacity={0.55}/>
                  <line x1={padX} x2={W-padX} y1={yFor(benchHi)} y2={yFor(benchHi)} stroke={ADM.WARN} strokeDasharray="3 4" strokeOpacity={0.55}/>
                  <text x={W-padX-2} y={yFor(benchHi)-2} textAnchor="end" fontSize="9" fill={ADM.WARN} fontWeight="700">settore 8-12%</text>
                  {/* Y axis labels */}
                  {[yLo, 10, yHi].map((t,i) => (
                    <text key={i} x={padX-6} y={yFor(t)+3} textAnchor="end" fontSize="9.5" fill={ADM.MUTED_SOFT} fontWeight="600">{t}%</text>
                  ))}
                  {/* Area + line */}
                  <path d={areaPath} fill={ADM.DANGER} opacity={0.10}/>
                  <path d={linePath} fill="none" stroke={ADM.DANGER} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                  {noShowTrend.map((m,i) => (
                    <circle key={i} cx={xFor(i)} cy={yFor(m.pct)} r={i === noShowTrend.length-1 ? 4 : 2.2} fill={i === noShowTrend.length-1 ? ADM.DANGER : '#fff'} stroke={ADM.DANGER} strokeWidth="1.6"/>
                  ))}
                  {/* X labels (ogni 2 mesi) */}
                  {noShowTrend.map((m,i) => (i % 2 === 0 || i === noShowTrend.length-1) && (
                    <text key={i} x={xFor(i)} y={H-2} textAnchor="middle" fontSize="9" fill={ADM.MUTED} fontWeight="600">{m.m.split(' ')[0]}</text>
                  ))}
                  {/* Label sull'ultimo punto */}
                  <text x={xFor(noShowTrend.length-1)} y={yFor(last.pct)-9} textAnchor="end" fontSize="10" fill={ADM.DANGER} fontWeight="800">{last.pct.toFixed(1)}%</text>
                </svg>
              );
            })()}
            <div style={{display:'flex', justifyContent:'space-between', fontSize:12.6, color:ADM.MUTED, marginTop:6, fontWeight:600}}>
              <span><span style={{display:'inline-block', width:10, height:2, background:ADM.DANGER, verticalAlign:'middle', marginRight:5}}/>Byup</span>
              <span><span style={{display:'inline-block', width:10, height:8, background:ADM.WARN, opacity:0.25, verticalAlign:'middle', marginRight:5}}/>Banda settore</span>
            </div>
          </div>
        </AdmCard>

        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Dove succede di più</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginBottom:14}}>% di no show per <strong style={{color:ADM.TEXT}}>giorno della settimana</strong> × <strong style={{color:ADM.TEXT}}>fascia oraria del giorno</strong></div>
          <div style={{display:'grid', gridTemplateColumns:`66px repeat(${noShowSlots.length}, 1fr)`, gap:4}}>
            <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em', display:'flex', alignItems:'flex-end', paddingBottom:6}}>Giorno</div>
            {noShowSlots.map(s => (
              <div key={s.label} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 0'}}>
                <span style={{fontSize:11.9, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.05em'}}>{s.label}</span>
                <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, letterSpacing:'0.02em', fontVariantNumeric:'tabular-nums'}}>{s.range}</span>
              </div>
            ))}
            {noShowHeat.map(row => (
              <React.Fragment key={row.g}>
                <div style={{fontSize:13.3, fontWeight:700, color:ADM.TEXT, display:'flex', alignItems:'center'}}>{row.g}</div>
                {row.vals.map((v,j) => {
                  const intensity = v / noShowMax;
                  return (
                    <div key={j} style={{
                      padding:'10px 4px', borderRadius:7, textAlign:'center',
                      // Ramp mono-hue coral, cap morbido: solo il picco è pieno.
                      background: intensity > 0.82 ? ADM.PINK : intensity < 0.1 ? '#F4F5F7' : `rgba(49,53,61,${(0.05 + intensity*0.42).toFixed(2)})`,
                    }}>
                      <span style={{fontSize:13, fontWeight:700, color: intensity > 0.55 ? '#fff' : ADM.TEXT, fontVariantNumeric:'tabular-nums'}}>{v.toFixed(1)}</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          {/* Legenda scala */}
          <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', gap:8, marginTop:10}}>
            <span style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Intensità no show</span>
            <span style={{fontSize:12.2, color:ADM.MUTED, fontWeight:600}}>basso</span>
            <span style={{display:'inline-flex', borderRadius:99, overflow:'hidden', border:`1px solid ${ADM.BORDER_SOFT}`}}>
              {/* Stessa formula delle celle — ink con cap rosa sul picco: la
                  rampa DANGER che stava qui descriveva colori che nella
                  matrice non compaiono in nessuna cella. */}
              {[0.08,0.3,0.5,0.7,0.9].map((t,i) => (
                <span key={i} style={{width:18, height:10, background: t > 0.82 ? ADM.PINK : t < 0.1 ? '#F4F5F7' : `rgba(49,53,61,${(0.05 + t*0.42).toFixed(2)})`}}/>
              ))}
            </span>
            <span style={{fontSize:12.2, color:ADM.MUTED, fontWeight:600}}>alto</span>
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
            <strong style={{color:ADM.TEXT}}>Sabato sera 21-23 è il punto critico (12.8%)</strong>. Andamento weekend serale comune all'intero settore. Servono <strong>conferma automatica 24h prima</strong>, deposito, waitlist intelligente.
          </div>
        </AdmCard>
      </div>

      {(() => { const vApp = (() => {
        const d = VALUTAZIONE_APP.distribuzione;
        const n = d.reduce((a, x) => a + x.n, 0);
        return { n, media: n ? d.reduce((a, x) => a + x.voto * x.n, 0) / n : 0 };
      })(); return (<React.Fragment>
      {/* Il voto sta in Servizio Clienti insieme agli altri due, perché il
          valore è il confronto fra i tre mestieri. Qui ne resta il numero:
          chi apre questa tab se lo aspetta, e non deve andarlo a cercare. */}
      <AdmCard padding={0} style={{overflow:'hidden'}}>
        <div style={{padding:'13px 20px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
          <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.04em'}}>Valutazione dell'app</span>
          <span style={{fontSize:22, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em'}}>
            {vApp.media.toFixed(1).replace('.', ',')}
          </span>
          <span style={{fontSize:13, color:ADM.MUTED_SOFT}}>/ 5 su {fmtNum(vApp.n)} risposte</span>
          <span style={{flex:1}}/>
          <span style={{fontSize:12.6, color:ADM.MUTED_LIGHT}}>
            Distribuzione e commenti in Analisi Dati → Servizio Clienti
          </span>
        </div>
      </AdmCard>
</React.Fragment>); })()}

      {/* ═══════════ Chi sono gli utenti ═══════════ */}
      <SectionLabel title="Chi sono gli utenti" desc="Demografia della base installata"/>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <AdmCard padding={20}>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14}}>
            <span style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Distribuzione per età</span>
            <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600}}>media <b style={{color:ADM.TEXT}}>{Math.round(UTENTI.reduce((a,u)=>a+u.eta,0)/UTENTI.length)} anni</b></span>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {fasceEta.map((f, i) => (
              <div key={i}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                  <span style={{fontSize:14, color:ADM.TEXT}}>{f.label}</span>
                  <span style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>{f.pct}%</span>
                </div>
                <div style={{height:6, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${f.pct*2}%`, height:'100%', background:ADM.INK, borderRadius:99}}/>
                </div>
              </div>
            ))}
          </div>
        </AdmCard>

        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Genere</div>
          <AdmStackedBar segments={[
            { label:'Donne', value: Math.round(genere.F*100), color: ADM.PINK },
            { label:'Uomini', value: Math.round(genere.M*100), color: ADM.INFO },
            { label:'Altro/N.D.', value: Math.round(genere.altro*100), color: ADM.MUTED_LIGHT },
          ]} height={12}/>
          <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:18}}>
            {[
              { label:'Donne', val: Math.round(genere.F*100), c: ADM.PINK },
              { label:'Uomini', val: Math.round(genere.M*100), c: ADM.INFO },
              { label:'Altro / N.D.', val: Math.round(genere.altro*100), c: ADM.MUTED_LIGHT },
            ].map((g,i)=>(
              <div key={i} style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{width:10, height:10, borderRadius:3, background:g.c}}/>
                <span style={{fontSize:14, color:ADM.TEXT, flex:1}}>{g.label}</span>
                <span style={{fontSize:14, color:ADM.MUTED, fontWeight:600}}>{fmtNum(Math.round(totUtenti*(g.val/100)))} · {g.val}%</span>
              </div>
            ))}
          </div>
        </AdmCard>

        {/* Preferenze alimentari — distribuzione sul totale utenti */}
        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Preferenze alimentari</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:2, marginBottom:14}}>Dichiarate dagli utenti nel profilo app</div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {[
              { label:'Nessuna preferenza', pct:62 },
              { label:'Senza glutine',      pct:11 },
              { label:'Vegetariano',        pct:10 },
              { label:'Senza lattosio',     pct:8 },
              { label:'Vegano',             pct:6 },
              { label:'Pescetariano',       pct:3 },
            ].map((f, i) => (
              <div key={i}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                  <span style={{fontSize:14, color:ADM.TEXT}}>{f.label}</span>
                  <span style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>{fmtNum(Math.round(totUtenti*(f.pct/100)))} · {f.pct}%</span>
                </div>
                <div style={{height:6, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${Math.max(f.pct, 1.5)}%`, height:'100%', background:ADM.INK, opacity: i === 0 ? 0.45 : 0.85, borderRadius:99}}/>
                </div>
              </div>
            ))}
          </div>
        </AdmCard>

        {/* Lingua dell'app — con i territori dove è usata */}
        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Lingua dell'app</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:2, marginBottom:14}}>Impostata dagli utenti · concentrazione territoriale</div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {[
              { label:'Italiano', pct:96.8, terr:'Tutta la rete' },
              { label:'Inglese',  pct:1.8,  terr:'Milano · Roma · Firenze' },
              { label:'Tedesco',  pct:0.9,  terr:'Trentino-Alto Adige' },
              { label:'Francese', pct:0.3,  terr:'Valle d’Aosta · Torino' },
              { label:'Spagnolo', pct:0.2,  terr:'Milano · Bologna' },
            ].map((l, i) => (
              <div key={i}>
                <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:4}}>
                  <span style={{fontSize:14, color:ADM.TEXT, fontWeight: i === 0 ? 600 : 400}}>{l.label}</span>
                  <span style={{fontSize:12, color:ADM.MUTED_SOFT, flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.terr}</span>
                  <span style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600, flexShrink:0}}>{fmtNum(Math.round(totUtenti*(l.pct/100)))} · {l.pct}%</span>
                </div>
                <div style={{height:6, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${Math.max(l.pct, 1.5)}%`, height:'100%', background:ADM.INK, opacity: i === 0 ? 0.85 : 0.6, borderRadius:99}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:12, lineHeight:1.5, padding:'9px 11px', background:ADM.PANEL_SOFT, borderRadius:8}}>
            Al lancio la rete è quasi interamente in italiano: le altre lingue emergono nei territori turistici e bilingui — un segnale utile per future localizzazioni.
          </div>
        </AdmCard>
      </div>

      {/* Qui stava «Ritorno degli utenti nel tempo»: una curva confrontata con
          una «media di settore» che nessuno aveva verificato, e una tabella di
          gruppi con numeri scritti a mano. Rispondeva alla stessa domanda del
          blocco «Quanti restano» qui sopra, che almeno dichiara da dove
          vengono i numeri e cosa non si può ancora dire. */}

      {/* ═════ SEZIONE: SEGMENTAZIONE COMPORTAMENTO ORDINI ═════ */}
      <SectionLabel title="Comportamento d'ordine per cluster demografico" desc="Cluster = combinazione sesso × fascia d'età · chi spende quanto · quando · cosa"/>

      {/* MATRICE scontrino × cohort (sesso × età) */}
      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
          <div>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Scontrino medio per sesso × età</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Scontrino medio per gruppo · ultimi 30 giorni</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:13, color:ADM.MUTED, fontWeight:600}}>
            <span>{fmtEur(aovMin)}</span>
            <div style={{width:80, height:8, borderRadius:99, background:`linear-gradient(90deg, ${ADM.PANEL_SOFT}, ${ADM.PINK})`}}/>
            <span>{fmtEur(aovMax)}</span>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'80px repeat(5, minmax(0,1fr))', gap:6}}>
          <div></div>
          {ages.map(a => <div key={a} style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textAlign:'center', padding:'4px 0', letterSpacing:'0.04em', textTransform:'uppercase'}}>{a}</div>)}
          {['F','M'].map(sex => (
            <React.Fragment key={sex}>
              <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13.7, fontWeight:700, color:sex==='F'?ADM.PINK:ADM.INFO}}>
                <span style={{width:8, height:8, borderRadius:'50%', background:sex==='F'?ADM.PINK:ADM.INFO}}/>
                {sex==='F'?'Donne':'Uomini'}
              </div>
              {ages.map(a => {
                const v = aovMatrix[sex][a];
                const intensity = (v - aovMin) / (aovMax - aovMin);
                return (
                  <div key={a} style={{
                    padding:'14px 8px', borderRadius:8, textAlign:'center',
                    background:`hsl(${sex==='F'?345:215}, ${50+intensity*30}%, ${94-intensity*30}%)`,
                    border:`1px solid ${intensity > 0.7 ? (sex==='F'?ADM.PINK:ADM.INFO) : 'transparent'}`,
                  }}>
                    <div style={{fontSize:16.6, fontWeight:800, color:intensity > 0.55 ? '#fff' : ADM.TEXT, letterSpacing:'-0.015em'}}>{fmtEur(v)}</div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
          <strong style={{color:ADM.TEXT}}>Insight:</strong> il valore-cliente cresce con l'età sugli uomini (+121% da 18-25 a 56+), più piatto sulle donne (+59%). Le donne 26-35 spendono il 12% in più degli uomini stessa fascia.
        </div>
      </AdmCard>

      {/* Spesa media/utente + Distribuzione scontrino + Frequenza ordini:
          tre tagli complementari sulla spesa, in una riga bilanciata. */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:14}}>
        {(() => {
          const totalSpesa = UTENTI.reduce((a, u) => a + u.spesaTotale, 0);
          const lifetime = Math.round(totalSpesa / UTENTI.length);
          const horizon = UTENTI.reduce((a, u) => a + Math.max(1, Math.floor((Date.now() - new Date(u.dataRegistrazione).getTime()) / 86400000)), 0) / UTENTI.length;
          return <SpesaMediaCard lifetime={lifetime} anno={Math.round(lifetime*(365/horizon))} mese={Math.round(lifetime*(30/horizon))} horizonDays={Math.round(horizon)}/>;
        })()}
        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT, marginBottom:14}}>Distribuzione scontrino</div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {ticketBuckets.map((b,i) => (
              <div key={i}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                  <span style={{fontSize:14, color:ADM.TEXT, fontWeight:600}}>{b.range}</span>
                  <span style={{fontSize:13.7, color:ADM.MUTED, fontWeight:600}}>{b.pct}% utenti</span>
                </div>
                <div style={{height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${b.pct*2.5}%`, height:'100%', background:b.color, borderRadius:99}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
            La maggior parte (52%) ordina tra €15-40. Il 7% sono <strong style={{color:ADM.TEXT}}>grandi spendenti</strong> oltre €60 — target ideale per campagne fidelizzazione premium.
          </div>
        </AdmCard>

        <AdmCard padding={20}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, gap:10}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Frequenza ordini</div>
              <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Ordini al mese per utente · per fascia d'età</div>
            </div>
          </div>
          {(() => {
            const freqAvg = freqByAge.reduce((s,f)=>s+f.orders,0) / freqByAge.length;
            // Le etichette si danno RISPETTO alla media della base, non su
            // soglie assolute: scritte a mano (≥3 assiduo, ≥2 frequente)
            // valevano solo per la frequenza inventata di prima, e con quella
            // vera avrebbero chiamato «dormiente» anche il segmento migliore.
            const sortedFreq = [...freqByAge].sort((a,b)=>b.orders-a.orders);
            const peak = sortedFreq[0];
            const classifyFreq = (o) => {
              const k = freqAvg ? o / freqAvg : 0;
              if (k >= 1.5) return { label:'Assiduo', tone: ADM.PINK_DARK, bg: ADM.PINK_BG_SOFT };
              if (k >= 1.0) return { label:'Frequente', tone: ADM.OK, bg: '#E6F5EC' };
              if (k >= 0.6) return { label:'Saltuario', tone: ADM.WARN, bg: '#FEF3C7' };
              return { label:'Dormiente', tone: ADM.DANGER, bg: ADM.DANGER_SOFT };
            };
            return (
              <React.Fragment>
                {/* Hero: segmento più attivo */}
                <div style={{padding:'14px 16px', background:`linear-gradient(135deg, ${ADM.PINK_BG_SOFT}, #fff)`, border:`1px solid ${ADM.PINK_SOFT}`, borderRadius:10, display:'flex', alignItems:'center', gap:14, marginBottom:14}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', minWidth:84}}>
                    <div style={{fontSize:31, fontWeight:800, color:ADM.PINK_DARK, letterSpacing:'-0.03em', lineHeight:1}}>{peak.orders.toFixed(1)}</div>
                    <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:4}}>ord / mese</div>
                  </div>
                  <div style={{flex:1, minWidth:0, borderLeft:`1px solid ${ADM.PINK_SOFT}`, paddingLeft:14}}>
                    <div style={{fontSize:12.6, fontWeight:700, color:ADM.PINK_DARK, textTransform:'uppercase', letterSpacing:'0.06em'}}>Segmento più attivo</div>
                    <div style={{fontSize:15.8, fontWeight:700, color:ADM.TEXT, marginTop:3, letterSpacing:'-0.01em'}}>{peak.age} anni</div>
                    <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:3, lineHeight:1.4}}>Ordinano ogni <strong style={{color:ADM.TEXT}}>~{Math.round(30/peak.orders)} giorni</strong> · +{Math.round((peak.orders/freqAvg-1)*100)}% rispetto alla media app</div>
                  </div>
                </div>

                {/* Ranked rows */}
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {sortedFreq.map((f,i) => {
                    const cls = classifyFreq(f.orders);
                    const delta = ((f.orders - freqAvg)/freqAvg)*100;
                    const isPeak = f.age === peak.age;
                    return (
                      <div key={f.age} style={{display:'grid', gridTemplateColumns:'52px 1fr auto', alignItems:'center', columnGap:12}}>
                        <span style={{fontSize:13.7, fontWeight:700, color: isPeak ? ADM.TEXT : ADM.MUTED, letterSpacing:'-0.005em'}}>{f.age}</span>
                        <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
                          <div style={{flex:1, height:10, background:'#F4F5F7', borderRadius:99, overflow:'hidden', position:'relative'}}>
                            {/* riferimento: la media della base */}
                            <div style={{position:'absolute', left:`${(freqAvg/freqMax)*100}%`, top:-3, bottom:-3, width:2, background:ADM.MUTED_SOFT, opacity:0.55}}/>
                            <div style={{width:`${(f.orders/freqMax)*100}%`, height:'100%', background: isPeak ? `linear-gradient(90deg, ${ADM.PINK}, ${ADM.PINK_DARK})` : cls.tone, borderRadius:99}}/>
                          </div>
                          <span style={{fontSize:15.8, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', minWidth:34, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{f.orders.toFixed(1)}</span>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end'}}>
                          <span style={{fontSize:12.6, fontWeight:700, color: delta > 0 ? ADM.OK : ADM.DANGER, minWidth:36, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{delta>=0?'+':''}{delta.toFixed(0)}%</span>
                          <span style={{fontSize:12.2, fontWeight:700, padding:'3px 8px', background:cls.bg, color:cls.tone, borderRadius:99, letterSpacing:'0.02em', minWidth:72, textAlign:'center'}}>{cls.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{display:'flex', alignItems:'center', gap:14, marginTop:14, paddingTop:12, borderTop:`1px solid ${ADM.BORDER_SOFT}`, fontSize:13, color:ADM.MUTED, fontWeight:600}}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                    <span style={{width:2, height:12, background:ADM.MUTED_SOFT, opacity:0.7}}/>
                    Media della base <strong style={{color:ADM.TEXT}}>{freqAvg.toFixed(2)}</strong> ordini/mese
                  </span>
                  <span style={{color:ADM.BORDER}}>·</span>
                  <span>Il tetto lo mette il canale: l'app fa il {Math.round(QUOTA_APP_MEDIA_12M * 100)}% degli ordini della rete</span>
                </div>
                <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:10, lineHeight:1.5}}>
                  Picco sul segmento <strong style={{color:ADM.TEXT}}>{peak.age}</strong>, che ordina
                  il <strong style={{color:ADM.TEXT}}>{freqAvg ? Math.round((peak.orders/freqAvg - 1) * 100) : 0}%</strong> in
                  più della media. Il fondo della classifica —{' '}
                  <strong style={{color:ADM.DANGER}}>{sortedFreq[sortedFreq.length-1].age}</strong> — è il
                  bersaglio della riattivazione dopo 45 giorni senza ordine.
                </div>
              </React.Fragment>
            );
          })()}
        </AdmCard>
      </div>

      {/* Le medie della base, aggregate DAGLI STESSI numeri delle schede dei
          singoli utenti (utnStatDerivate) e messe accanto alla loro mediana
          (UTN_MEDIANE): la scheda di un utente e questa riga leggono la
          stessa fonte. */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        {(() => {
          const righe = UTENTI.map(utnStatDerivate);
          const media = (arr) => { const v = arr.filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
          const eurCc = (v) => v == null ? '—' : '€ ' + v.toFixed(2).replace('.', ',');
          const sesMese = media(righe.map(x => x.sessioniAnno / 12));
          const spesa = media(righe.map(x => x.spesaMedia));
          const pren = media(righe.map(x => x.prenAnno));
          const tempoSes = media(righe.map(x => x.tempoSessione));
          return (
            <React.Fragment>
              <SparkStat label="Sessioni al mese · media" value={sesMese.toFixed(1).replace('.', ',')}
                sub={`Mediana ${fmtNum(UTN_MEDIANE.sesMese)} · aggregata dai profili dei singoli utenti`}
                accent="INK" icon="phone"/>
              <SparkStat label="Spesa media per ordine" value={eurCc(spesa)}
                sub={`Mediana ${eurCc(UTN_MEDIANE.spesaMedia)} · chi non ha mai ordinato resta fuori`}
                accent="INK" icon="receipt"/>
              <SparkStat label="Prenotazioni all'anno · media" value={pren.toFixed(1).replace('.', ',')}
                sub={`Mediana ${fmtNum(UTN_MEDIANE.prenAnno)} · riportate a 12 mesi sull'età dell'account`}
                accent="INK" icon="calendar"/>
              <SparkStat label="Tempo per sessione · media" value={`${Math.round(tempoSes / 60)} min`}
                sub={`Mediana ${Math.round(UTN_MEDIANE.tempoSessione / 60)} min · dall'apertura alla chiusura dell'app`}
                accent="INK" icon="clock"/>
            </React.Fragment>
          );
        })()}
      </div>

      {/* Top categorie per cluster demografico */}
      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
          <div>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Top categorie ordinate · per cluster demografico</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Ogni colonna è un segmento di clientela <strong style={{color:ADM.TEXT}}>sesso × fascia d'età</strong>. Top 3 categorie più ordinate dal segmento, % sugli ordini del segmento.</div>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:10}}>
          {topCatByCohort.map((row, i) => {
            const isF = row.cohort[0]==='F';
            const sexLabel = isF ? 'Donne' : 'Uomini';
            const ageLabel = row.cohort.slice(2).trim();
            const tone = isF ? ADM.PINK : ADM.INFO;
            return (
              <div key={i} style={{padding:'14px 14px 12px', background:ADM.PANEL_SOFT, borderRadius:9, border:`1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                  <span style={{width:26, height:26, borderRadius:'50%', background:isF?ADM.PINK_BG_SOFT:'#E0EFFE', color:tone, fontSize:13, fontWeight:800, display:'grid', placeItems:'center', letterSpacing:'-0.02em'}}>{isF?'♀':'♂'}</span>
                  <div style={{display:'flex', flexDirection:'column', gap:1, minWidth:0}}>
                    <span style={{fontSize:13.7, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em', lineHeight:1.1}}>{sexLabel}</span>
                    <span style={{fontSize:12.6, fontWeight:600, color:ADM.MUTED, letterSpacing:'0.02em'}}>{ageLabel} anni</span>
                  </div>
                </div>
                {row.cats.map((c,j) => (
                  <div key={j} style={{marginBottom: j < row.cats.length-1 ? 8 : 0}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:3}}>
                      <span style={{fontSize:13.3, color:ADM.TEXT, fontWeight:600}}>{c.n}</span>
                      <span style={{fontSize:13, color:ADM.MUTED, fontWeight:700}}>{c.p}%</span>
                    </div>
                    <div style={{height:4, background:'#fff', borderRadius:99, overflow:'hidden'}}>
                      <div style={{width:`${c.p*2.5}%`, height:'100%', background:catColors[c.n] || ADM.MUTED, borderRadius:99}}/>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
          Andamento netto: <strong style={{color:ADM.TEXT}}>Pizza domina i giovani</strong>, <strong style={{color:ADM.TEXT}}>Primi/Secondi crescono con l'età</strong>. Sushi & Poke è quasi solo femminile 18-35. Burger è quasi solo maschile under-35.
        </div>
      </AdmCard>

      {/* Heatmap fascia oraria × cohort */}
      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
          <div>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Fasce orarie di ordine per età</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Intensità relativa per fascia oraria · trigger per workflow push/email</div>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'80px repeat(6, minmax(0,1fr))', gap:5}}>
          <div></div>
          {hourBands.map(b => (
            <div key={b} style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textAlign:'center', padding:'2px 0', letterSpacing:'0.02em', lineHeight:1.3}}>{b}</div>
          ))}
          {hourCohorts.map(row => (
            <React.Fragment key={row.c}>
              <div style={{fontSize:13.7, fontWeight:700, color:ADM.TEXT, display:'flex', alignItems:'center'}}>{row.c}</div>
              {row.vals.map((v,j) => {
                const intensity = v / 100;
                return (
                  <div key={j} style={{
                    padding:'14px 4px', borderRadius:6, textAlign:'center',
                    background: intensity < 0.05 ? '#F4F5F7' : `rgba(255,31,90,${0.08 + intensity*0.85})`,
                    border: intensity > 0.8 ? `1px solid ${ADM.PINK_DARK}` : '1px solid transparent',
                  }}>
                    <span style={{fontSize:13.3, fontWeight:700, color: intensity > 0.5 ? '#fff' : ADM.TEXT}}>{v}</span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
          <strong style={{color:ADM.TEXT}}>Cena è il prime time per tutti</strong>. I 18-25 dominano dopocena (22-01), gli over 36 sono concentrati su pranzo e cena classica. Manda push pranzo alle 11:30 sui 36-55 e dopocena alle 22 sui 18-25.
        </div>
      </AdmCard>

      {/* ═════ SEZIONE: DISTRIBUZIONE GEOGRAFICA ═════ */}
      <SectionLabel title="Geografia del consumo" desc="Dove si ordina cosa"/>

      {/* Top città */}
      <AdmCard padding={0}>
        <div style={{padding:'16px 20px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Dove ordinano i clienti · volume e scontrino</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Ordini mensili aggregati e scontrino medio</div>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'2fr 0.8fr 2fr 1.1fr', columnGap:28, padding:'10px 20px', background:ADM.PANEL_SOFT, fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>
          <div>Città</div>
          <div style={{textAlign:'right'}}>Locali</div>
          <div>Ordini / mese</div>
          <div style={{textAlign:'right'}}>Scontrino medio</div>
        </div>
        {cityRows.map((c, i) => (
          <div key={c.citta} style={{
            display:'grid', gridTemplateColumns:'2fr 0.8fr 2fr 1.1fr', columnGap:28,
            padding:'12px 20px', alignItems:'center',
            borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
          }}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{width:22, height:22, borderRadius:6, background:`hsl(${(c.citta.charCodeAt(0)*7)%360}, 45%, 55%)`, color:'#fff', fontSize:12.2, fontWeight:800, display:'grid', placeItems:'center'}}>{i+1}</span>
              <span style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{c.citta}</span>
            </div>
            <div style={{fontSize:14, color:ADM.MUTED, textAlign:'right', fontWeight:600}}>{c.locali}</div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{flex:1, height:6, background:'#F4F5F7', borderRadius:99, overflow:'hidden', maxWidth:180}}>
                <div style={{width:`${(c.ordiniMese/cityMaxOrdini)*100}%`, height:'100%', background:`linear-gradient(90deg, ${ADM.INFO}, ${ADM.PURPLE})`, borderRadius:99}}/>
              </div>
              <span style={{fontSize:14, color:ADM.TEXT, fontWeight:700, minWidth:60, textAlign:'right'}}>{fmtNum(c.ordiniMese)}</span>
            </div>
            <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, textAlign:'right'}}>{fmtEur(c.aov)}</div>
          </div>
        ))}
      </AdmCard>

      {/* Consumo per macro-regione */}
      <AdmCard padding={20}>
        <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT, marginBottom:14}}>Top piatti per macro-regione</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:10}}>
          {regionFood.map((r,i) => (
            <div key={i} style={{padding:'12px 14px', background:ADM.PANEL_SOFT, borderRadius:9, border:`1px solid ${ADM.BORDER_SOFT}`}}>
              <div style={{fontSize:13, fontWeight:700, color:ADM.PINK, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>{r.regione}</div>
              {r.top.map((t,j) => (
                <div key={j} style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: j < r.top.length-1 ? 6 : 0}}>
                  <span style={{fontSize:13.3, color:ADM.TEXT, fontWeight:j===0?700:500, lineHeight:1.3}}>{t.n}</span>
                  <span style={{fontSize:13, color:ADM.MUTED, fontWeight:700, marginLeft:6}}>{t.pct}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </AdmCard>

      {/* Stagionalità mensile × geografia */}
      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, gap:14, flexWrap:'wrap'}}>
          <div style={{minWidth:0, flex:'1 1 320px'}}>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Stagionalità · confronto piatti su 12 mesi</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Indice di ordini · <strong style={{color:ADM.TEXT}}>100 = media annuale del piatto</strong>. Confronta fino a {seasonalMaxPick} piatti dello stesso o di diversi catering pattern. Dato monetizzabile verso fornitori horeca.</div>
          </div>
          {/* Region selector */}
          <div style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Area</span>
            <AdmSelect value={seasonalRegion} onChange={setSeasonalRegion} align="right"
              buttonStyle={{borderRadius:8, fontWeight:600}}
              options={SEASONAL_REGIONS}/>
          </div>
        </div>

        {/* Multi-select dish picker */}
        <div style={{marginBottom:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
            <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Piatti da confrontare</span>
            <span style={{fontSize:13, color:ADM.MUTED_SOFT, fontWeight:600}}>{seasonalSel.length} / {seasonalMaxPick}</span>
          </div>
          {/* Chips selezionati */}
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:8, padding:'8px 8px', border:`1px solid ${ADM.BORDER}`, borderRadius:9, background:'#fff', minHeight:42, alignItems:'center', cursor:'text', position:'relative'}} onClick={()=>setSeasonalPickerOpen(true)}>
            {seasonalSel.map((name, i) => {
              const c = dishPalette[i % dishPalette.length];
              return (
                <span key={name} style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px 4px 10px', background:`${c}14`, border:`1px solid ${c}40`, borderRadius:99, fontSize:13.3, fontWeight:600, color:ADM.TEXT}}>
                  <span style={{width:8, height:8, borderRadius:'50%', background:c}}/>
                  {name}
                  <button onClick={(e)=>{e.stopPropagation(); setSeasonalSel(seasonalSel.filter(x=>x!==name));}} style={{background:'transparent', border:'none', padding:0, margin:'0 0 0 2px', cursor:'pointer', color:ADM.MUTED, fontSize:15.1, lineHeight:1, fontFamily:'inherit', width:16, height:16, display:'inline-grid', placeItems:'center'}} aria-label={`Rimuovi ${name}`}>×</button>
                </span>
              );
            })}
            <input
              type="text"
              value={seasonalQuery}
              onChange={(e)=>{setSeasonalQuery(e.target.value); setSeasonalPickerOpen(true);}}
              onFocus={()=>setSeasonalPickerOpen(true)}
              onBlur={()=>setTimeout(()=>setSeasonalPickerOpen(false), 180)}
              placeholder={seasonalSel.length === 0 ? 'Cerca tra centinaia di piatti…' : seasonalSel.length >= seasonalMaxPick ? `Massimo ${seasonalMaxPick} piatti — rimuovine uno per aggiungerne altri` : 'Aggiungi piatto…'}
              disabled={seasonalSel.length >= seasonalMaxPick}
              style={{flex:'1 1 160px', minWidth:140, border:'none', outline:'none', fontSize:13.7, color:ADM.TEXT, fontFamily:'inherit', padding:'4px 6px', background:'transparent'}}
            />
            {seasonalPickerOpen && (
              <div style={{position:'absolute', top:'100%', left:0, right:0, marginTop:6, background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:9, boxShadow:'0 8px 24px rgba(15,17,21,0.10)', maxHeight:280, overflowY:'auto', zIndex:30}}>
                {seasonalFiltered.length === 0 ? (
                  <div style={{padding:'12px 14px', fontSize:13.7, color:ADM.MUTED}}>Nessun piatto corrisponde a "{seasonalQuery}"</div>
                ) : (() => {
                  // raggruppa per categoria
                  const byCat = seasonalFiltered.reduce((acc, d) => { (acc[d.cat] = acc[d.cat] || []).push(d); return acc; }, {});
                  return Object.entries(byCat).map(([cat, items]) => (
                    <div key={cat}>
                      <div style={{padding:'8px 14px 4px', fontSize:12.6, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em', background:ADM.PANEL_SOFT, position:'sticky', top:0}}>{cat}</div>
                      {items.map(d => {
                        const selected = seasonalSel.includes(d.n);
                        const disabled = !selected && seasonalSel.length >= seasonalMaxPick;
                        return (
                          <button
                            key={d.n}
                            onMouseDown={(e)=>e.preventDefault()}
                            onClick={()=>{
                              if (selected) setSeasonalSel(seasonalSel.filter(x=>x!==d.n));
                              else if (!disabled) setSeasonalSel([...seasonalSel, d.n]);
                            }}
                            disabled={disabled}
                            style={{
                              width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10,
                              padding:'8px 14px', border:'none', background: selected ? ADM.PINK_BG_SOFT : 'transparent',
                              cursor: disabled ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                              opacity: disabled ? 0.4 : 1, color: ADM.TEXT, fontSize:13.7, fontWeight: selected ? 700 : 500,
                            }}>
                            <span style={{width:14, height:14, borderRadius:4, border:`1.5px solid ${selected ? ADM.PINK_DARK : ADM.BORDER}`, background: selected ? ADM.PINK_DARK : '#fff', display:'inline-grid', placeItems:'center', color:'#fff', fontSize:12.2, fontWeight:800}}>{selected?'✓':''}</span>
                            <span style={{flex:1}}>{d.n}</span>
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Line chart 12 mesi × N piatti */}
        {(() => {
          if (seasonalSeriesByDish.length === 0) {
            return <div style={{padding:'48px 20px', textAlign:'center', color:ADM.MUTED, fontSize:14}}>Seleziona almeno un piatto per visualizzare la curva di stagionalità</div>;
          }
          const W = 1200, H = 240, padX = 40, padY = 28;
          const plotW = W - padX*2, plotH = H - padY*2;
          const yLo = Math.max(0, Math.floor(seasonalMin/10)*10 - 10);
          const yHi = Math.ceil(seasonalMax/10)*10 + 10;
          const range = yHi - yLo || 1;
          const xFor = (i) => padX + (i/11) * plotW;
          const yFor = (v) => padY + (1 - (v - yLo)/range) * plotH;
          const yTicks = [yLo, Math.round((yLo+yHi)/2), yHi, 100];
          const uniqueYTicks = [...new Set(yTicks)].sort((a,b)=>a-b);
          return (
            <div style={{overflow:'hidden'}}>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:'100%', height:260}}>
                {/* y axis grid */}
                {uniqueYTicks.map((t,i) => (
                  <g key={i}>
                    <line x1={padX} x2={W-padX} y1={yFor(t)} y2={yFor(t)} stroke={t===100?ADM.MUTED_SOFT:ADM.BORDER_SOFT} strokeDasharray={t===100?'2 3':'3 4'} strokeWidth={t===100?1.2:1}/>
                    <text x={padX-8} y={yFor(t)+4} textAnchor="end" fontSize="11" fill={t===100?ADM.MUTED:ADM.MUTED_SOFT} fontWeight={t===100?'700':'600'}>{t}</text>
                  </g>
                ))}
                {/* x labels */}
                {monthsLabel.map((m, i) => (
                  <text key={i} x={xFor(i)} y={H-6} textAnchor="middle" fontSize="11" fill={ADM.MUTED} fontWeight="600">{m}</text>
                ))}
                {/* lines per dish */}
                {seasonalSeriesByDish.map((d, di) => {
                  const c = dishPalette[di % dishPalette.length];
                  const path = d.vals.map((v,i) => `${i===0?'M':'L'} ${xFor(i)} ${yFor(v)}`).join(' ');
                  return (
                    <g key={d.name}>
                      <path d={path} fill="none" stroke={c} strokeWidth={seasonalSel.length > 6 ? 2 : 2.4} strokeLinecap="round" strokeLinejoin="round" opacity={seasonalSel.length > 6 ? 0.9 : 1}/>
                      {seasonalSel.length <= 6 && d.vals.map((v,i) => (
                        <circle key={i} cx={xFor(i)} cy={yFor(v)} r={3} fill="#fff" stroke={c} strokeWidth="2"/>
                      ))}
                    </g>
                  );
                })}
              </svg>
              {/* Legend dishes */}
              <div style={{display:'flex', flexWrap:'wrap', gap:'8px 16px', marginTop:12, justifyContent:'center'}}>
                {seasonalSeriesByDish.map((d, di) => {
                  const c = dishPalette[di % dishPalette.length];
                  const peakIdx = d.vals.indexOf(Math.max(...d.vals));
                  return (
                    <span key={d.name} style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:13.3, fontWeight:600, color:ADM.TEXT}}>
                      <span style={{width:16, height:3, borderRadius:2, background:c}}/>
                      {d.name}
                      <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>· picco {monthsLabel[peakIdx]}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })()}
        <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:18, lineHeight:1.5}}>
          <strong style={{color:ADM.TEXT}}>Come leggere:</strong> linea sopra 100 = mese sopra la media annuale del piatto · sotto 100 = sotto media. Cambia <strong style={{color:ADM.TEXT}}>area</strong> per vedere come la stessa categoria si comporta in geografie diverse. <strong>Dato vendibile</strong> a fornitori horeca per calibrare logistica e listini regionali stagionali.
        </div>
      </AdmCard>

      {/* ═════ SEZIONE: COMPOSIZIONE ALIMENTARE ═════ */}
      <SectionLabel title="Cosa si mangia" desc="Piatti, ingredienti, macro-nutrienti"/>

      {/* Caveat dati */}
      <div style={{padding:'11px 14px', background:ADM.WARN_SOFT, border:`1px solid #FCD34D`, borderRadius:9, display:'flex', gap:10, alignItems:'flex-start'}}>
        <BuIcons.info size={19} color={ADM.WARN}/>
        <div style={{flex:1, fontSize:13.3, color:'#92400E', lineHeight:1.5}}>
          <strong>Macro-nutrienti e ingredienti</strong> sono derivati su un campione di piatti pre-labellati (~38% del catalogo Byup). Per portarli al 100% serve completare il labeling nutrizionale del menu di ogni locale partner.
        </div>
      </div>

      {/* Top piatti + Top ingredienti */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <AdmCard padding={20}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14, gap:10}}>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Top piatti più ordinati in Italia</div>
            <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>Sparkline = ultimi 12 mesi · Δ% vs 12m fa</div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {topPiattiTrend.map((p, i) => {
              const maxOrd = topPiattiTrend[0].ordini;
              const trendUp = p.trend >= 0;
              return (
                <div key={i}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, alignItems:'center', gap:10}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0, flex:1}}>
                      <span style={{fontSize:12.6, fontWeight:800, color:ADM.MUTED_SOFT, minWidth:14}}>{i+1}</span>
                      <span style={{fontSize:14, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{p.nome}</span>
                      <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>· {p.categoria}</span>
                    </div>
                    <MicroSpark data={p.spark} color={trendUp ? ADM.OK : ADM.DANGER} width={62} height={20}/>
                    <span style={{fontSize:12.6, fontWeight:700, color: trendUp ? ADM.OK : ADM.DANGER, minWidth:38, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{trendUp?'+':''}{p.trend}%</span>
                    <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:700, minWidth:50, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{fmtNum(p.ordini)}</span>
                  </div>
                  <div style={{height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                    <div style={{width:`${(p.ordini/maxOrd)*100}%`, height:'100%', background:`linear-gradient(90deg, ${ADM.PINK}, ${ADM.PINK_DARK})`, borderRadius:99}}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
            <strong style={{color:ADM.OK}}>Spritz Aperol +20%</strong>, <strong style={{color:ADM.OK}}>Tiramisù +15%</strong> e <strong style={{color:ADM.OK}}>Margherita +12%</strong> sono i piatti in maggior crescita anno su anno. <strong style={{color:ADM.DANGER}}>Cacio e Pepe -2%</strong>: unico in calo, da indagare insieme ai locali partner.
          </div>
        </AdmCard>

        <AdmCard padding={20}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14, gap:10}}>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Top ingredienti più ordinati</div>
            <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>Sparkline = ultimi 12 mesi · Δ% vs 12m fa</div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {topIngrTrend.map((ing, i) => {
              const maxOrd = topIngrTrend[0].ord;
              const trendUp = ing.trend >= 0;
              return (
                <div key={i}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, alignItems:'center', gap:10}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0, flex:1}}>
                      <span style={{fontSize:12.6, fontWeight:800, color:ADM.MUTED_SOFT, minWidth:14}}>{i+1}</span>
                      <span style={{fontSize:14, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{ing.n}</span>
                      <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>· {ing.cat}</span>
                    </div>
                    <MicroSpark data={ing.spark} color={trendUp ? ADM.OK : ADM.DANGER} width={62} height={20}/>
                    <span style={{fontSize:12.6, fontWeight:700, color: trendUp ? ADM.OK : ADM.DANGER, minWidth:38, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{trendUp?'+':''}{ing.trend}%</span>
                    <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:700, minWidth:50, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{fmtNum(ing.ord)}</span>
                  </div>
                  <div style={{height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                    <div style={{width:`${(ing.ord/maxOrd)*100}%`, height:'100%', background:`linear-gradient(90deg, ${ADM.OK}, #15803D)`, borderRadius:99}}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
            Forte crescita su <strong style={{color:ADM.OK}}>Avocado +28%</strong> e <strong style={{color:ADM.OK}}>Salmone +22%</strong> — trend health-food in linea col mercato. <strong style={{color:ADM.DANGER}}>Uovo -3%</strong>: lieve calo, da monitorare.
          </div>
        </AdmCard>
      </div>

      {/* Macronutrienti */}
      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, gap:14, flexWrap:'wrap'}}>
          <div style={{minWidth:0, flex:'1 1 300px'}}>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Distribuzione macro-nutrienti · andamento 12 mesi</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>% calorie medie per ordine · come la dieta si manifesta nelle diverse aree geografiche</div>
          </div>
          <div style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Area</span>
            <AdmSelect value={macroRegion} onChange={setMacroRegion} align="right"
              buttonStyle={{borderRadius:8, fontWeight:600}}
              options={FOOD_REGIONS}/>
          </div>
        </div>

        {/* Line chart 12 mesi × 4 macro */}
        {(() => {
          const W = 1200, H = 200, padX = 36, padY = 22;
          const plotW = W - padX*2, plotH = H - padY*2;
          const allVals = macrosTime.flatMap(m => m.series);
          const yLo = Math.max(0, Math.floor(Math.min(...allVals)/5)*5 - 2);
          const yHi = Math.ceil(Math.max(...allVals)/5)*5 + 4;
          const range = yHi - yLo || 1;
          const xFor = (i) => padX + (i/11) * plotW;
          const yFor = (v) => padY + (1 - (v - yLo)/range) * plotH;
          const yTicks = [yLo, Math.round((yLo+yHi)/2), yHi];
          return (
            <div style={{overflow:'hidden', marginBottom:18}}>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:'100%', height:200}}>
                {yTicks.map((t,i) => (
                  <g key={i}>
                    <line x1={padX} x2={W-padX} y1={yFor(t)} y2={yFor(t)} stroke={ADM.BORDER_SOFT} strokeDasharray="3 4"/>
                    <text x={padX-8} y={yFor(t)+4} textAnchor="end" fontSize="11" fill={ADM.MUTED_SOFT} fontWeight="600">{t}%</text>
                  </g>
                ))}
                {foodMonths.map((m,i) => (
                  <text key={i} x={xFor(i)} y={H-4} textAnchor="middle" fontSize="10.5" fill={ADM.MUTED} fontWeight="600">{m}</text>
                ))}
                {macrosTime.map((m, mi) => {
                  const path = m.series.map((v,i) => `${i===0?'M':'L'} ${xFor(i)} ${yFor(v)}`).join(' ');
                  return (
                    <g key={mi}>
                      <path d={path} fill="none" stroke={m.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                      {m.series.map((v,i) => (
                        <circle key={i} cx={xFor(i)} cy={yFor(v)} r={3} fill="#fff" stroke={m.color} strokeWidth="2"/>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })()}

        {/* Composizione attuale + delta */}
        <div style={{display:'flex', height:14, borderRadius:99, overflow:'hidden', marginBottom:18, background:'#F0F1F3'}}>
          {macros.map((m,i) => (
            <div key={i} style={{width:`${m.pct}%`, background:m.color, borderRight: i < macros.length-1 ? '1.5px solid #fff' : 'none'}}/>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
          {macros.map((m,i) => {
            const trendUp = m.trend > 0;
            const trendDn = m.trend < 0;
            const toneColor = trendUp ? ADM.OK : trendDn ? ADM.DANGER : ADM.MUTED;
            return (
              <div key={i} style={{padding:'14px 14px', background:ADM.PANEL_SOFT, borderRadius:9, border:`1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                  <div style={{display:'flex', alignItems:'center', gap:7}}>
                    <span style={{width:10, height:10, borderRadius:3, background:m.color}}/>
                    <span style={{fontSize:13.3, color:ADM.TEXT, fontWeight:700}}>{m.n}</span>
                  </div>
                  {m.trend !== 0 && (
                    <span style={{fontSize:12.6, fontWeight:700, color:toneColor, fontVariantNumeric:'tabular-nums'}}>
                      {trendUp?'+':''}{m.trend}pp
                    </span>
                  )}
                </div>
                <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                  <div style={{fontSize:23.8, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.025em', lineHeight:1}}>{m.pct}%</div>
                  <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>vs {macrosTime[i].series[0]}% un anno fa</div>
                </div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:5, lineHeight:1.4}}>{m.desc}</div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:14, lineHeight:1.5}}>
          {(() => {
            const carb = macros.find(m=>m.n==='Carboidrati');
            const prot = macros.find(m=>m.n==='Proteine');
            const fib  = macros.find(m=>m.n==='Fibre');
            const insightByRegion = {
              'Tutta Italia':'Trend coerente con la crescita di piatti come Poke, Salmone e Avocado.',
              'Nord-Ovest':'Trend health-trend più marcato (Milano/Torino traino) · meno carbo, più proteine e fibre.',
              'Nord-Est':  'Dieta più bilanciata grazie a polenta+risotto+pesce; spostamento moderato verso proteine.',
              'Centro':    'Pasta-heavy storico (carbonara/cacio/amatriciana). Riequilibrio più lento rispetto al Nord.',
              'Sud':       'Carboidrati ai massimi (pizza, pasta, frittura). Riequilibrio appena iniziato; fibre ancora basse.',
              'Isole':     'Forte componente pesce ma carboidrati elevati (pasta, arancini). Fibre tra le più basse d\'Italia.',
            };
            return (
              <>
                <strong style={{color:ADM.TEXT}}>{macroRegion}:</strong>{' '}
                <strong style={{color: carb.trend < 0 ? ADM.DANGER : ADM.OK}}>{carb.trend>=0?'+':''}{carb.trend}pp carboidrati</strong>,{' '}
                <strong style={{color: prot.trend >= 0 ? ADM.OK : ADM.DANGER}}>{prot.trend>=0?'+':''}{prot.trend}pp proteine</strong> e{' '}
                <strong style={{color: fib.trend >= 0 ? ADM.OK : ADM.DANGER}}>{fib.trend>=0?'+':''}{fib.trend}pp fibre</strong> in 12 mesi. {insightByRegion[macroRegion]}
              </>
            );
          })()}
        </div>
      </AdmCard>

    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MERCATO · com'è il settore, non come stiamo noi
// ════════════════════════════════════════════════════════════════════════════
//
// Questi due blocchi stavano in Locali, in mezzo a churn, NRR e LTV. Ma non
// dicono niente su byup: dicono quanto rende un piatto e quanto costa a Milano
// rispetto a Napoli. Sono domande del RISTORATORE, e la tab che le ospitava
// finiva per rispondere a due domande diverse nella stessa pagina — «come
// stiamo andando» e «com'è il mercato».
//
// Stanno qui perché servono lo stesso, ma per un altro mestiere: sono il
// benchmark che portiamo a chi vendiamo e la base per capire dove il prodotto
// può spingere. Non sono KPI di piattaforma e non vanno letti come tali.
function DashMercato() {
  // ── FOOD COST / MARGINALITÀ per categoria ──────────────────────────────
  // Stimato sul ~38% del catalogo Byup con ingredient labeling completato.
  // Food cost % = costo materie prime / prezzo di vendita medio (standard horeca).
  // Industria: pizza 22-28%, primi 20-25%, secondi 30-40%, drinks 12-18%.
  const foodCostCats = [
    { cat:'Pizza',         prezzo:11.50, foodCost:24, ord:48200, color:ADM.PINK },
    { cat:'Primi',         prezzo:12.80, foodCost:22, ord:38400, color:ADM.WARN },
    { cat:'Secondi carne', prezzo:18.40, foodCost:36, ord:22600, color:ADM.DANGER },
    { cat:'Secondi pesce', prezzo:22.80, foodCost:42, ord:14800, color:ADM.INFO },
    { cat:'Antipasti',     prezzo: 8.20, foodCost:28, ord:18200, color:ADM.OK },
    { cat:'Dolci',         prezzo: 6.40, foodCost:21, ord:14200, color:ADM.PURPLE },
    { cat:'Drinks',        prezzo: 7.20, foodCost:16, ord:32800, color:'#0EA5E9' },
  ];
  // Margine lordo % (semplice: prezzo - food cost - 0 altri costi qui)
  // GP = (1 - foodCost%/100)
  const foodCostEnriched = foodCostCats.map(c => ({
    ...c,
    margine: 100 - c.foodCost,
    margineEur: c.prezzo * (100 - c.foodCost)/100,
    ricavi: c.prezzo * c.ord,
  })).sort((a,b) => b.margine - a.margine);


  // ───── Posizionamento prezzi · centinaia di piatti × 8 città × 12 mesi ─
  // Modello: prezzo_T0(piatto, città) = basePrice(piatto) × multCittà[× override
  // del piatto-icona]. La serie 12 mesi applica inflazione lineare per piatto +
  // una piccola componente stagionale. Tutti i dati derivano dal DISH_CATALOG
  // a livello modulo, quindi centinaia di piatti sono già selezionabili.
  const priceMonths = ['Giu 25','Lug 25','Ago 25','Set 25','Ott 25','Nov 25','Dic 25','Gen 26','Feb 26','Mar 26','Apr 26','Mag 26'];
  const priceCities = Object.keys(CITY_PRICE_MULT);
  const priceCityList = ['Tutta Italia', ...priceCities];
  const pricePalette = ['#0F1115', '#FF1F5A', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#EF4444'];
  // Prezzo mensile T+i per piatto×città (Mag 26 = base attuale, cioè i=11)
  const priceSeries = (dish, city) => {
    const base = dishPriceForCity(dish, city);
    const seasonal = DISH_PRICE_SEASONAL[dish] || DISH_PRICE_SEASONAL_DEFAULT;
    const inflTot = DISH_INFLATION[dish] || DISH_INFLATION.default;
    return priceMonths.map((_, i) => {
      const inflAt = inflTot * (i / 11);
      const seasPct = seasonal[i] / 100;
      // Riportiamo i prezzi indietro nel tempo: il mese N=11 = base attuale
      const factor = 1 + seasPct - (inflTot/100) + (inflAt/100);
      return Math.round(base * factor * 100) / 100;
    });
  };
  const [priceRegion, setPriceRegion] = useStateDash('Tutta Italia');
  const [priceSel, setPriceSel] = useStateDash(['Pizza Margherita', 'Carbonara', 'Spritz Aperol']);
  const [priceQuery, setPriceQuery] = useStateDash('');
  const [pricePickerOpen, setPricePickerOpen] = useStateDash(false);
  const priceMaxPick = 10;
  // Series media per regione selezionata (Tutta Italia = media città)
  const priceSeriesByDish = priceSel.map(d => {
    const cities = priceRegion === 'Tutta Italia' ? priceCities : [priceRegion];
    const allSeries = cities.map(c => priceSeries(d, c));
    const avg = Array.from({length:12}, (_, i) => {
      const sum = allSeries.reduce((s, ser) => s + ser[i], 0);
      return Math.round((sum / cities.length) * 100) / 100;
    });
    return { name:d, vals:avg };
  });
  const priceAllVals = priceSeriesByDish.flatMap(d => d.vals);
  const priceTimeMin = priceAllVals.length ? Math.min(...priceAllVals) : 0;
  const priceTimeMax = priceAllVals.length ? Math.max(...priceAllVals) : 20;
  // Per ogni piatto selezionato: snapshot città al mese corrente (Mag 26 = ultimo)
  const priceCitySnapshot = (dish) => {
    return priceCities
      .map(c => ({ city: c, price: priceSeries(dish, c)[11] }))
      .sort((a,b) => b.price - a.price);
  };
  const priceFiltered = DISH_CATALOG.filter(d => {
    const q = priceQuery.trim().toLowerCase();
    if (!q) return true;
    return d.n.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q);
  });
  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:20}}>
      <SectionLabel first title="Economia del menu"
        desc="Food cost e marginalità stimati sul catalogo della rete · quanto rende un piatto a chi lo vende"/>


      <AdmCard padding={0}>
        <div style={{padding:'14px 22px 12px', borderBottom:`1px solid ${ADM.BORDER}`}}>
          <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Food cost & marginalità per categoria</div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Margine lordo stimato · proxy del valore di un marketplace fornitori</div>
          <div style={{fontSize:12, color:ADM.MUTED_SOFT, marginTop:7, display:'flex', alignItems:'center', gap:6}}>
            <BuIcons.info size={13} color={ADM.MUTED_SOFT}/>
            <span>Stima su <strong style={{color:ADM.MUTED, fontWeight:700}}>38% del catalogo</strong> · food-cost di settore come riferimento (±2-3 pt di accuratezza)</span>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1.4fr 0.9fr 0.9fr 1.3fr 1fr', columnGap:18, padding:'12px 22px', background:ADM.PANEL_SOFT, fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${ADM.BORDER}`}}>
          <div>Categoria</div>
          <div style={{textAlign:'right'}}>Prezzo vendita</div>
          <div style={{textAlign:'right'}}>Food cost</div>
          <div>Margine lordo</div>
          <div style={{textAlign:'right'}}>Ordini / mese</div>
        </div>
        {foodCostEnriched.map((c, i) => {
          const marginTone = c.margine >= 80 ? ADM.OK : c.margine >= 70 ? ADM.WARN : ADM.DANGER;
          return (
            <div key={c.cat} style={{
              display:'grid', gridTemplateColumns:'1.4fr 0.9fr 0.9fr 1.3fr 1fr', columnGap:18,
              padding:'14px 22px', alignItems:'center',
              borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
            }}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{width:8, height:30, borderRadius:3, background:marginTone, flexShrink:0}}/>
                <div>
                  <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>{c.cat}</div>
                  <div style={{fontSize:12.6, color:ADM.MUTED}}>Ricavi/mese {fmtEur(Math.round(c.ricavi))}</div>
                </div>
              </div>
              <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, textAlign:'right', fontFamily:'ui-monospace, monospace'}}>{fmtEur(c.prezzo)}</div>
              <div style={{fontSize:14.4, fontWeight:700, color:ADM.DANGER, textAlign:'right', fontFamily:'ui-monospace, monospace'}}>{c.foodCost}%</div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{flex:1, height:8, background:'#F4F5F7', borderRadius:99, overflow:'hidden', maxWidth:180}}>
                  <div style={{width:`${c.margine}%`, height:'100%', background:`linear-gradient(90deg, ${marginTone}, ${marginTone}DD)`, borderRadius:99}}/>
                </div>
                <span style={{fontSize:14.4, fontWeight:800, color:marginTone, minWidth:42, textAlign:'right', fontFamily:'ui-monospace, monospace'}}>{c.margine}%</span>
              </div>
              <div style={{fontSize:14.4, color:ADM.TEXT, fontWeight:600, textAlign:'right', fontFamily:'ui-monospace, monospace'}}>{fmtNum(c.ord)}</div>
            </div>
          );
        })}
        <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT, fontSize:13.3, color:ADM.MUTED, lineHeight:1.5}}>
          <strong style={{color:ADM.TEXT}}>Insight:</strong> Drinks ha il margine lordo più alto (84%) ma volume medio basso · Pizza è il <strong>sweet spot</strong> con margine 76% e oltre 48k ordini/mese · Secondi di pesce sono i meno marginali (58%) ma a prezzo unitario più alto. Drive opportunità marketplace fornitori: chi rifornisce gli ingredienti chiave delle prime due categorie controlla il 70% del valore.
        </div>
      </AdmCard>

      <SectionLabel title="Posizionamento prezzi per città" desc="Listino medio dei locali partner · benchmark territoriale"/>

      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, gap:14, flexWrap:'wrap'}}>
          <div style={{minWidth:0, flex:'1 1 300px'}}>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Prezzo medio per città · andamento 12 mesi</div>
            <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Prezzo medio del piatto sui menù dei locali partner. Confronta fino a {priceMaxPick} piatti e osserva il trend nel tempo.</div>
          </div>
          {/* Region selector */}
          <div style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Area</span>
            <AdmSelect value={priceRegion} onChange={setPriceRegion} align="right"
              buttonStyle={{borderRadius:8, fontWeight:600}}
              options={priceCityList}/>
          </div>
        </div>

        {/* Multi-select piatti — searchable, max 10 su catalogo completo */}
        <div style={{marginBottom:18}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
            <span style={{fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Piatti da confrontare</span>
            <span style={{fontSize:13, color:ADM.MUTED_SOFT, fontWeight:600}}>{priceSel.length} / {priceMaxPick}</span>
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6, padding:'8px 8px', border:`1px solid ${ADM.BORDER}`, borderRadius:9, background:'#fff', minHeight:42, alignItems:'center', cursor:'text', position:'relative'}} onClick={()=>setPricePickerOpen(true)}>
            {priceSel.map((name, i) => {
              const c = pricePalette[i % pricePalette.length];
              return (
                <span key={name} style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px 4px 10px', background:`${c}14`, border:`1px solid ${c}40`, borderRadius:99, fontSize:13.3, fontWeight:600, color:ADM.TEXT}}>
                  <span style={{width:8, height:8, borderRadius:'50%', background:c}}/>
                  {name}
                  <button onClick={(e)=>{e.stopPropagation(); if (priceSel.length > 1) setPriceSel(priceSel.filter(x=>x!==name));}} style={{background:'transparent', border:'none', padding:0, margin:'0 0 0 2px', cursor:'pointer', color:ADM.MUTED, fontSize:15.1, lineHeight:1, fontFamily:'inherit', width:16, height:16, display:'inline-grid', placeItems:'center'}} aria-label={`Rimuovi ${name}`}>×</button>
                </span>
              );
            })}
            <input
              type="text"
              value={priceQuery}
              onChange={(e)=>{setPriceQuery(e.target.value); setPricePickerOpen(true);}}
              onFocus={()=>setPricePickerOpen(true)}
              onBlur={()=>setTimeout(()=>setPricePickerOpen(false), 180)}
              placeholder={priceSel.length === 0 ? 'Cerca tra centinaia di piatti…' : priceSel.length >= priceMaxPick ? `Massimo ${priceMaxPick} piatti — rimuovine uno per aggiungerne altri` : 'Aggiungi piatto…'}
              disabled={priceSel.length >= priceMaxPick}
              style={{flex:'1 1 160px', minWidth:140, border:'none', outline:'none', fontSize:13.7, color:ADM.TEXT, fontFamily:'inherit', padding:'4px 6px', background:'transparent'}}
            />
            {pricePickerOpen && (
              <div style={{position:'absolute', top:'100%', left:0, right:0, marginTop:6, background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:9, boxShadow:'0 8px 24px rgba(15,17,21,0.10)', maxHeight:280, overflowY:'auto', zIndex:30}}>
                {priceFiltered.length === 0 ? (
                  <div style={{padding:'12px 14px', fontSize:13.7, color:ADM.MUTED}}>Nessun piatto corrisponde a "{priceQuery}"</div>
                ) : (() => {
                  const byCat = priceFiltered.reduce((acc, d) => { (acc[d.cat] = acc[d.cat] || []).push(d); return acc; }, {});
                  return Object.entries(byCat).map(([cat, items]) => (
                    <div key={cat}>
                      <div style={{padding:'8px 14px 4px', fontSize:12.6, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em', background:ADM.PANEL_SOFT, position:'sticky', top:0}}>{cat}</div>
                      {items.map(d => {
                        const selected = priceSel.includes(d.n);
                        const disabled = !selected && priceSel.length >= priceMaxPick;
                        return (
                          <button
                            key={d.n}
                            onMouseDown={(e)=>e.preventDefault()}
                            onClick={()=>{
                              if (selected) { if (priceSel.length > 1) setPriceSel(priceSel.filter(x=>x!==d.n)); }
                              else if (!disabled) setPriceSel([...priceSel, d.n]);
                            }}
                            disabled={disabled}
                            style={{
                              width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10,
                              padding:'8px 14px', border:'none', background: selected ? ADM.PINK_BG_SOFT : 'transparent',
                              cursor: disabled ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                              opacity: disabled ? 0.4 : 1, color: ADM.TEXT, fontSize:13.7, fontWeight: selected ? 700 : 500,
                            }}>
                            <span style={{width:14, height:14, borderRadius:4, border:`1.5px solid ${selected ? ADM.PINK_DARK : ADM.BORDER}`, background: selected ? ADM.PINK_DARK : '#fff', display:'inline-grid', placeItems:'center', color:'#fff', fontSize:12.2, fontWeight:800}}>{selected?'✓':''}</span>
                            <span style={{flex:1}}>{d.n}</span>
                            <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{fmtEur(dishBasePrice(d.n).toFixed(2))}</span>
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Line chart 12 mesi × N piatti */}
        {(() => {
          if (priceSeriesByDish.length === 0) return null;
          const W = 1200, H = 220, padX = 48, padY = 26;
          const plotW = W - padX*2, plotH = H - padY*2;
          const yLo = Math.max(0, Math.floor(priceTimeMin*0.92));
          const yHi = Math.ceil(priceTimeMax*1.06);
          const range = yHi - yLo || 1;
          const xFor = (i) => padX + (i/11) * plotW;
          const yFor = (v) => padY + (1 - (v - yLo)/range) * plotH;
          const yTicks = [yLo, (yLo+yHi)/2, yHi].map(v => Math.round(v*10)/10);
          return (
            <div style={{overflow:'hidden', marginBottom:18}}>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:'100%', height:240}}>
                {yTicks.map((t,i) => (
                  <g key={i}>
                    <line x1={padX} x2={W-padX} y1={yFor(t)} y2={yFor(t)} stroke={ADM.BORDER_SOFT} strokeDasharray="3 4"/>
                    <text x={padX-8} y={yFor(t)+4} textAnchor="end" fontSize="11" fill={ADM.MUTED_SOFT} fontWeight="600">€ {t.toFixed(t<10?1:0)}</text>
                  </g>
                ))}
                {priceMonths.map((m, i) => (
                  <text key={i} x={xFor(i)} y={H-6} textAnchor="middle" fontSize="10.5" fill={ADM.MUTED} fontWeight="600">{m}</text>
                ))}
                {priceSeriesByDish.map((d, di) => {
                  const c = pricePalette[di % pricePalette.length];
                  const path = d.vals.map((v,i) => `${i===0?'M':'L'} ${xFor(i)} ${yFor(v)}`).join(' ');
                  return (
                    <g key={d.name}>
                      <path d={path} fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                      {d.vals.map((v,i) => (
                        <circle key={i} cx={xFor(i)} cy={yFor(v)} r={3.2} fill="#fff" stroke={c} strokeWidth="2"/>
                      ))}
                    </g>
                  );
                })}
              </svg>
              <div style={{display:'flex', flexWrap:'wrap', gap:'6px 16px', marginTop:10, justifyContent:'center'}}>
                {priceSeriesByDish.map((d, di) => {
                  const c = pricePalette[di % pricePalette.length];
                  const first = d.vals[0], last = d.vals[11];
                  const deltaPct = ((last - first) / first) * 100;
                  return (
                    <span key={d.name} style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:13.3, fontWeight:600, color:ADM.TEXT}}>
                      <span style={{width:16, height:3, borderRadius:2, background:c}}/>
                      {d.name}
                      <span style={{fontSize:12.6, color: deltaPct >= 1 ? ADM.DANGER : deltaPct <= -1 ? ADM.OK : ADM.MUTED, fontWeight:700, fontVariantNumeric:'tabular-nums'}}>
                        {deltaPct>=0?'+':''}{deltaPct.toFixed(1)}% / 12m
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Per ogni piatto selezionato: snapshot città (Mag 26) */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {priceSel.map((dish, di) => {
            const c = pricePalette[di % pricePalette.length];
            const snap = priceCitySnapshot(dish);
            const mn = snap[snap.length-1].price;
            const mx = snap[0].price;
            const avg = snap.reduce((s,r)=>s+r.price,0) / snap.length;
            const varPct = ((mx - mn) / mn) * 100;
            return (
              <div key={dish} style={{padding:'14px 16px', background:'#fff', border:`1px solid ${ADM.BORDER_SOFT}`, borderLeft:`3px solid ${c}`, borderRadius:9}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:12}}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <span style={{width:9, height:9, borderRadius:'50%', background:c}}/>
                    <span style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.005em'}}>{dish}</span>
                  </div>
                  <div style={{display:'flex', gap:14, alignItems:'baseline', fontSize:13.3, color:ADM.MUTED}}>
                    <span>Più bassa <strong style={{color:ADM.OK}}>{fmtEur(mn)}</strong> {snap[snap.length-1].city}</span>
                    <span>Media <strong style={{color:ADM.TEXT}}>{fmtEur(avg.toFixed(2))}</strong></span>
                    <span>Più alta <strong style={{color:ADM.DANGER}}>{fmtEur(mx)}</strong> {snap[0].city}</span>
                    <span>Spread <strong style={{color:ADM.PINK_DARK}}>+{Math.round(varPct)}%</strong></span>
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:6}}>
                  {snap.map((r, i) => {
                    const ratio = (r.price - mn) / (mx - mn || 1);
                    const tone = ratio > 0.66 ? ADM.DANGER : ratio > 0.33 ? ADM.WARN : ADM.OK;
                    const delta = ((r.price - avg) / avg) * 100;
                    return (
                      <div key={r.city} style={{display:'flex', alignItems:'center', gap:10}}>
                        <span style={{fontSize:12.2, fontWeight:800, color:ADM.MUTED_SOFT, width:14, textAlign:'right'}}>{i+1}</span>
                        <span style={{fontSize:13.3, fontWeight:600, color:ADM.TEXT, width:78}}>{r.city}</span>
                        <div style={{flex:1, height:7, background:ADM.PANEL_SOFT, borderRadius:99, overflow:'hidden'}}>
                          <div style={{width:`${20 + ratio*80}%`, height:'100%', background:`linear-gradient(90deg, ${tone}AA, ${tone})`, borderRadius:99}}/>
                        </div>
                        <span style={{fontSize:13.7, fontWeight:800, color:ADM.TEXT, width:54, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{fmtEur(r.price)}</span>
                        <span style={{fontSize:12.6, fontWeight:700, color: delta > 5 ? ADM.DANGER : delta < -5 ? ADM.OK : ADM.MUTED, width:46, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{delta >= 0 ? '+' : ''}{delta.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:16, lineHeight:1.5}}>
          <strong style={{color:ADM.TEXT}}>Come leggere:</strong> il grafico in alto mostra il prezzo medio nel tempo per i piatti selezionati (Giu 25 → Mag 26). Cambia <strong style={{color:ADM.TEXT}}>area</strong> per vedere la curva di una singola città. Sotto, per ogni piatto, lo snapshot per città al mese corrente (Mag 26) con spread vs media. <strong>Dato vendibile</strong> a brand alimentari, consulenti di pricing e media.
        </div>
      </AdmCard>

      {/* Il menu come dato · admin-mercato.jsx. Sta in coda perché è l'unica
          parte di questa tab che non è benchmark di settore ma misura nostra:
          la carta di ogni locale letta in forma strutturata, e le sette cose
          che ne scendono. */}
      {window.MercatoMenuDato ? <MercatoMenuDato/> : null}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CAMERIERI · ristrutturata con la prospettiva da data scientist
// Coverage, ratio, retention, benchmark, trend per azione, heatmap settimanale.
// ════════════════════════════════════════════════════════════════════════════
function DashCamerieri({ filtri }) {
  // Il segmento della barra arriva fin qui: la popolazione di partenza è la
  // lista filtrata, e tutto quello che si conta sui locali — squadre, uso
  // del gestionale, volumi delle azioni — si conta su quella. Restano di
  // rete i blocchi che dai locali non derivano (tempi di servizio per tipo,
  // heatmap), e lo dichiarano sulla loro card.
  const locSegmento = window.anFiltra ? anFiltra(LOCALI, filtri) : LOCALI;
  const idsSegmento = new Set(locSegmento.map(l => l.id));

  // ── 1. Coverage · locali che HANNO configurato lo staff vs senza
  const liveLocali = locSegmento.filter(l => l.stato === 'active' || l.stato === 'inactive' || l.stato === 'skipped');

  // ── TEMPO MEDIO SERVIZIO · da ordine confermato a chiusura conto ────────
  // Industria horeca: pizzeria 25-45 min, trattoria 50-90 min, ristorante 70-120 min
  const serviceByType = [
    { tipo:'Pizzeria',   media:38, median:34, p75:52,  n: 9, color:ADM.PINK },
    { tipo:'Trattoria',  media:68, median:62, p75: 86, n:11, color:ADM.WARN },
    { tipo:'Osteria',    media:74, median:70, p75: 94, n: 7, color:ADM.DANGER },
    { tipo:'Ristorante', media:92, median:88, p75:118, n:12, color:ADM.PURPLE },
    { tipo:'Bistrot',    media:54, median:50, p75: 72, n: 6, color:ADM.INFO },
    { tipo:'Pub',        media:46, median:42, p75: 60, n: 3, color:ADM.OK },
  ];
  const serviceOverall = Math.round(
    serviceByType.reduce((s,t) => s + t.media*t.n, 0) / serviceByType.reduce((s,t)=>s+t.n,0)
  );
  // Distribuzione tempo servizio (% locali per fascia minuti)
  const serviceDist = [
    { range:'< 30 min',  pct: 8, label:'Fast' },
    { range:'30-45',     pct:18, label:'Veloce' },
    { range:'45-60',     pct:22, label:'Standard' },
    { range:'60-90',     pct:28, label:'Medio' },
    { range:'90-120',    pct:16, label:'Lento' },
    { range:'> 120 min', pct: 8, label:'Critico' },
  ];
  const totLiveLocali = liveLocali.length;
  // chi ha lo staff collegato: il passo «staff» dell'imbuto, la stessa regola di STAFF_CONFIGURATO
  const configurati = liveLocali.filter(STAFF_CONFIGURATO);
  const senzaStaff = liveLocali.filter(l => !configurati.includes(l));
  const coverageRate = totLiveLocali > 0 ? Math.round((configurati.length / totLiveLocali) * 100) : 0;
  // Media e mediana si contano sulle SQUADRE dei locali, una per una. Prima
  // era il totale dei camerieri diviso i locali configurati — due popolazioni
  // diverse, un totale di piattaforma sopra un sottoinsieme — e usciva 73,6
  // dipendenti a locale. La «mediana» era quel numero arrotondato: due volte
  // lo stesso dato spacciato per due statistiche che si confermano a vicenda.
  const squadre = STAFF_PER_LOCALE.filter(s => s.n > 0 && idsSegmento.has(s.localeId)).map(s => s.n).sort((a, b) => a - b);
  const ratioMedio = squadre.length ? squadre.reduce((s, n) => s + n, 0) / squadre.length : 0;
  const ratioMediana = squadre.length
    ? (squadre.length % 2
        ? squadre[(squadre.length - 1) / 2]
        : (squadre[squadre.length / 2 - 1] + squadre[squadre.length / 2]) / 2)
    : 0;
  // I contatori dello staff si ricontano sul segmento — STAFF_METRICS è la
  // fotografia di rete, e sotto filtro mentirebbe. Le quote (in turno oggi,
  // nuovi del mese) sono le stesse della fotografia. Le sparkline si
  // rigenerano con gli stessi semi e parametri di TS: senza filtro escono
  // identiche, col filtro raccontano gli stessi locali del numero sopra.
  const totCamerieri = squadre.reduce((s, n) => s + n, 0);
  const activeOggi = Math.round(totCamerieri * 0.33);
  const nuovi30g = Math.round(totCamerieri * 0.06);
  const tsStaffTot = genDaily(118, 90, totCamerieri, 0.012, 0, 0.005);
  const tsStaffActive = genDaily(110, 90, activeOggi, 0.008, 0.22, 0.05);

  // ── 2. Quota di staff che lavora in un giorno ───────────────────────────
  // Non è ritenzione: in sala si fanno i turni, e un part-time che lavora tre
  // sere su sette non è un dipendente perso. Il riferimento del 30-40% è una
  // regola di buon senso sui turni, non un dato di mercato verificato: sta
  // scritto perché serve una soglia, non perché qualcuno l'abbia misurato.
  const activeRate = totCamerieri ? Math.round(activeOggi / totCamerieri * 100) : 0;
  const benchTone = activeRate >= 30 ? 'OK' : activeRate >= 20 ? 'WARN' : 'DANGER';
  const benchText = activeRate >= 30 ? 'Compatibile con i turni di una sala: un terzo dello staff lavora in un giorno qualsiasi' :
                    activeRate >= 20 ? 'Sotto quello che i turni spiegherebbero: una parte dello staff non entra più' :
                    'Molto sotto: gran parte degli account staff è ferma, e va capito se sono persone che non lavorano più lì';

  // ── 3. Locali con staff inattivo · staff registrato ma non lavora (segnale di abbandono)
  // assunzione data-side: locali inactive con staff configurato + alcuni active con lastLogin alto
  const staffAbbandono = liveLocali.filter(l => {
    if (!configurati.includes(l)) return false;
    const daysIdle = Math.floor((Date.now() - new Date(l.lastLogin).getTime()) / 86400000);
    return daysIdle > 21; // inattivo da 3+ settimane
  });

  // ── 4. Azioni con trend (WoW) · ogni azione ha una mini-serie generata
  //
  // I volumi non sono scritti a mano: si derivano dagli ordini che i locali
  // processano davvero in un mese, perché è quello che i camerieri toccano.
  // Scritti a mano dicevano 124.800 «aggiunte articolo» al mese su una
  // piattaforma che di ordini ne fa tredicimila e mezzo — un numero che
  // sopravvive solo finché nessuno lo divide per un altro.
  const ordiniMeseSegmento = locSegmento.reduce((s, l) => s + (l.ordiniMese || 0), 0);
  const ordiniAlTavolo = Math.round(ordiniMeseSegmento * 0.55);
  const azione = (n, usi, trend, seme, drift, weekend, noise) =>
    ({ nome: n, usi, trend, spark: genDaily(seme, 30, Math.max(1, Math.round(usi / 30)), drift, weekend, noise) });
  const topActions = [
    // Un ordine al tavolo si apre una volta e si salda una volta; gli articoli
    // sono tre e mezzo a ordine, ed è per questo che stanno in cima.
    azione('Aggiunta articolo all\'ordine', Math.round(ordiniAlTavolo * 3.5), +5.4, 202, 0.010, 0.22, 0.04),
    azione('Apertura tavolo', ordiniAlTavolo, +8.2, 201, 0.012, 0.18, 0.05),
    azione('Saldo conto al tavolo', Math.round(ordiniAlTavolo * 0.92), +6.8, 203, 0.011, 0.16, 0.05),
    azione('Stampa scontrino', Math.round(ordiniAlTavolo * 0.58), +2.1, 204, 0.005, 0.15, 0.04),
    azione('Spostamento tavolo / unione', Math.round(ordiniAlTavolo * 0.08), +12.4, 205, 0.018, 0.12, 0.07),
    azione('Trasferimento staff su altro turno', Math.round(totCamerieri * 1.2), -3.2, 206, -0.005, 0, 0.10),
  ];

  // ── 5. Heatmap giorno × fascia · pattern di utilizzo settimanale
  // matrice 7 (giorni) × 4 (fasce: pranzo / pomeriggio / cena / dopocena)
  const heatRand = pseudoRandSeed(301);
  const heatmap = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map((g, gi) => {
    const isWeekend = gi >= 5;
    return {
      giorno: g,
      fasce: [
        { f:'12-15', v: Math.round((isWeekend ? 92 : 70) + heatRand()*30) },
        { f:'15-19', v: Math.round((isWeekend ? 35 : 18) + heatRand()*20) },
        { f:'19-23', v: Math.round((isWeekend ? 100 : 78) + heatRand()*15) },
        { f:'23-02', v: Math.round((isWeekend ? 28 : 8)  + heatRand()*15) },
      ],
    };
  });
  const heatMax = Math.max(...heatmap.flatMap(d => d.fasce.map(f => f.v)));

  const totW = woW(tsStaffActive);
  const totRegW = moM(tsStaffTot);

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:20}}>

      {/* Come arriva la comanda in cucina: è la scala della digitalizzazione,
          e sta in cima perché spiega quasi tutti i numeri sotto. */}
      <SectionLabel first title="Dispositivi e ruoli" desc="Con cosa lavorano davvero: monitor in cucina, comande stampate, o niente"/>
      {window.AnDispositivi ? <AnDispositivi filtri={filtri}/> : null}


      {/* ═══════════ Andamento — la rete staff in sintesi ═══════════ */}
      <SectionLabel title="Andamento" desc="La rete staff dei locali in sintesi" first/>

      {/* Riga 1 · KPI principali con trend e benchmark */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        {/* Il «+N ultimi 30gg» ora è il flusso dei nuovi registrati. Prima era
            la differenza fra due somme di trenta giorni di una serie di
            LIVELLI: su uno stock quel conto vale trenta volte la crescita
            vera, e infatti dichiarava +1.900 nuovi su 1.840 totali. */}
        <SparkStat label="Staff registrati" value={fmtNum(totCamerieri)}
          sub={`+${fmtNum(nuovi30g)} ultimi 30gg`}
          accent="INK" icon="users"
          trend={totRegW.delta} trendLabel="vs 30gg" spark={tsStaffTot.slice(-30)}/>
        <SparkStat label="Attivi oggi" value={fmtNum(activeOggi)}
          sub={`${activeRate}% del totale · ${benchText.split('·')[0]}`}
          accent="INK" icon="check"
          trend={totW.delta} trendLabel="vs 7gg" spark={tsStaffActive.slice(-30)}/>
        <SparkStat label="Locali con staff" value={`${coverageRate}%`}
          sub={`${configurati.length} su ${totLiveLocali} live · ${senzaStaff.length} ancora senza`}
          accent="INK" icon="store"
          trend={+2.1} trendLabel="vs mese prec."/>
        <SparkStat label="Staff per locale" value={ratioMedio.toFixed(1).replace('.', ',')}
          sub={`Media sulle squadre di ${squadre.length} locali · mediana ${String(ratioMediana).replace('.', ',')} · il più grande ne ha ${squadre[squadre.length - 1] || 0}`}
          accent="INK" icon="users"/>
      </div>

      {/* I soldi della sala, aggregati DAGLI STESSI numeri delle schede staff
          (scontrinoMedio e manciaMedia dei singoli camerieri), con la mediana
          come metro: la scheda di un cameriere e questa riga leggono la
          stessa fonte, e non possono raccontare due sale diverse. */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:14}}>
        {(() => {
          const cams = STAFF.filter(s => s.scontrinoMedio != null && (s.locali || []).some(l => idsSegmento.has(l.id)));
          const media = (campo) => cams.length ? cams.reduce((a, s) => a + s[campo], 0) / cams.length : null;
          return (
            <React.Fragment>
              <SparkStat label="Scontrino medio cameriere" value={camEur2(media('scontrinoMedio'))}
                sub={`Per ordine preso al tavolo · media su ${fmtNum(cams.length)} camerieri · mediana ${camEur2(CAM_MEDIANE.scontrino)}`}
                accent="INK" icon="receipt"/>
              <SparkStat label="Mancia media cameriere" value={camEur2(media('manciaMedia'))}
                sub={`Per conto chiuso · media su ${fmtNum(cams.length)} camerieri · mediana ${camEur2(CAM_MEDIANE.mancia)}`}
                accent="INK" icon="receipt"/>
            </React.Fragment>
          );
        })()}
      </div>

      {/* Riga 2 · Benchmark detail + abbandono */}
      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14}}>
        <AdmCard padding={20}>
          <div style={{display:'flex', alignItems:'flex-start', gap:14, marginBottom:14}}>
            <div style={{width:42, height:42, borderRadius:10, background:ADM[benchTone+'_SOFT'], color:ADM[benchTone], display:'grid', placeItems:'center', flexShrink:0}}>
              <BuIcons.shield size={23}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Tasso di attivazione staff · giornaliero</div>
              <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:3, lineHeight:1.5}}>
                {benchText}
              </div>
            </div>
          </div>
          {/* Range visivo con benchmark band */}
          <div style={{position:'relative', height:32, marginBottom:14}}>
            <div style={{position:'absolute', inset:0, background:'#F4F5F7', borderRadius:6}}/>
            {/* benchmark band 30-40% */}
            <div style={{position:'absolute', left:'30%', width:'10%', top:0, bottom:0, background:`${ADM.OK}22`, borderLeft:`1px dashed ${ADM.OK}`, borderRight:`1px dashed ${ADM.OK}`}}/>
            <div style={{position:'absolute', left:'30%', top:-16, fontSize:13, color:ADM.OK, fontWeight:700, letterSpacing:'0.05em'}}>BENCHMARK 30–40%</div>
            {/* current marker */}
            <div style={{position:'absolute', left:`calc(${activeRate}% - 2px)`, top:-4, bottom:-4, width:4, background:ADM[benchTone], borderRadius:2, boxShadow:`0 0 0 2px #fff, 0 0 8px ${ADM[benchTone]}66`}}/>
            <div style={{position:'absolute', left:`${activeRate}%`, transform:'translateX(-50%)', bottom:-22, fontSize:13, fontWeight:800, color:ADM[benchTone]}}>{activeRate}%</div>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12.6, color:ADM.MUTED_SOFT, fontWeight:600, fontFamily:'ui-monospace, monospace', marginTop:18}}>
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </AdmCard>

        <AdmCard padding={20}>
          <div style={{display:'flex', alignItems:'flex-start', gap:13}}>
            <div style={{width:42, height:42, borderRadius:10, background:staffAbbandono.length > 0 ? ADM.DANGER_SOFT : ADM.OK_SOFT, color:staffAbbandono.length > 0 ? ADM.DANGER : ADM.OK, display:'grid', placeItems:'center', flexShrink:0}}>
              <BuIcons.alertTriangle size={23}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em'}}>Possibile abbandono</div>
              <div style={{fontSize:25.2, fontWeight:800, color: staffAbbandono.length > 0 ? ADM.DANGER : ADM.OK, marginTop:4, letterSpacing:'-0.025em', lineHeight:1}}>{staffAbbandono.length}</div>
              <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:5, lineHeight:1.45}}>
                {staffAbbandono.length > 0
                  ? `Locali con staff registrato ma inattivo da oltre 21 giorni · candidati a churn`
                  : 'Tutti i locali con staff attivo · nessun segnale di abbandono'}
              </div>
            </div>
          </div>
          {staffAbbandono.length > 0 && (
            <div style={{marginTop:12, paddingTop:12, borderTop:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', flexDirection:'column', gap:6}}>
              {staffAbbandono.slice(0, 3).map((l, i) => {
                const days = Math.floor((Date.now() - new Date(l.lastLogin).getTime()) / 86400000);
                return (
                  <div key={l.id} style={{display:'flex', alignItems:'center', gap:8, fontSize:13.3}}>
                    <span style={{width:5, height:5, borderRadius:'50%', background:ADM.DANGER}}/>
                    <span style={{color:ADM.TEXT, fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{l.nome}</span>
                    <span style={{color:ADM.DANGER, fontWeight:700, fontFamily:'ui-monospace, monospace'}}>{days}gg</span>
                  </div>
                );
              })}
              {staffAbbandono.length > 3 && (
                <div style={{fontSize:12.6, color:ADM.MUTED, fontStyle:'italic', marginTop:2}}>e altri {staffAbbandono.length - 3}…</div>
              )}
            </div>
          )}
        </AdmCard>
      </div>

      {/* ═══════════ La sala usa il prodotto? ═══════════ */}
      {/* Contare i camerieri registrati non dice niente: quello che fa fallire
          un'adozione, quasi sempre, è la sala che non apre l'app — e il
          titolare ci mette settimane ad accorgersene. Questo blocco mette
          l'adozione digitale del locale accanto allo stato della sua sala:
          dove i QR sono fermi, quasi sempre è ferma anche lei. */}
      <SectionLabel title="La sala usa il prodotto?"
        desc="Camerieri che aprono davvero il gestionale, locale per locale · è il primo posto in cui un'adozione muore"/>
      {(() => {
        // Anche l'uso della sala si legge sul segmento filtrato: STAFF_USO è
        // per locale, e la barra dichiara «in questa vista».
        const staffUso = STAFF_USO.filter(x => idsSegmento.has(x.localeId));
        const conSquadra = staffUso.filter(x => x.squadra > 0);
        const attiviTot = conSquadra.reduce((a, x) => a + x.attivi, 0);
        const squadraTot = conSquadra.reduce((a, x) => a + x.squadra, 0);
        const pctRete = squadraTot ? Math.round(attiviTot / squadraTot * 100) : 0;
        // I locali sotto la soglia di adozione sono gli stessi che il blocco
        // «da attivare» conta in Locali — tutti, anche quelli senza nemmeno un
        // cameriere registrato, che sono il caso peggiore e vanno visti.
        const sotto = staffUso.filter(x => x.qr != null && x.qr < 5)
          .sort((a, b) => (a.squadra ? a.pct : -1) - (b.squadra ? b.pct : -1));
        const sottoConSquadra = sotto.filter(x => x.squadra > 0);
        const sottoSenzaSquadra = sotto.filter(x => x.squadra === 0);
        const sopra = conSquadra.filter(x => x.qr != null && x.qr >= 15);
        const media = (arr) => arr.length ? Math.round(arr.reduce((a, x) => a + x.pct, 0) / arr.length) : 0;
        const azioni = (arr) => arr.length ? Math.round(arr.reduce((a, x) => a + x.azioniTurno, 0) / arr.length) : 0;
        return (
          <React.Fragment>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:14}}>
              <SparkStat label="Camerieri che usano il gestionale" value={`${pctRete}%`}
                sub={`${attiviTot} su ${squadraTot} registrati hanno aperto il gestionale in settimana`}
                accent="INK" icon="users"/>
              <SparkStat label="Sala ferma dove i QR sono fermi" value={`${media(sottoConSquadra)}%`}
                sub={`Nei ${sotto.length} locali sotto la soglia · ${azioni(sottoConSquadra)} azioni per turno${sottoSenzaSquadra.length ? ` · ${sottoSenzaSquadra.length} non hanno nemmeno un cameriere registrato` : ''}`}
                accent="INK" icon="store"/>
              <SparkStat label="Sala viva dove i QR girano" value={`${media(sopra)}%`}
                sub={`Nei ${sopra.length} locali sopra il 15% di adozione · ${azioni(sopra)} azioni per turno`}
                accent="INK" icon="check"/>
            </div>

            <AdmCard padding={0} style={{overflow:'hidden'}}>
              <div style={{padding:'13px 20px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
                fontSize:11.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.04em'}}>
                Dove la sala si è fermata · dal peggiore
              </div>
              <div className="adm-scroll" style={{maxHeight:320, overflowY:'auto'}}>
                {sotto.slice(0, 12).map((x, i2) => (
                  <div key={x.localeId} style={{display:'grid',
                    gridTemplateColumns:'minmax(0,1fr) 150px 150px 130px', alignItems:'center', gap:12,
                    padding:'10px 20px', borderTop: i2 ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                    <span style={{minWidth:0}}>
                      <span style={{display:'block', fontSize:13.6, fontWeight:600, color:ADM.TEXT,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{x.nome}</span>
                      <span style={{display:'block', fontSize:11.8, color:ADM.MUTED_LIGHT, marginTop:1}}>{x.citta}</span>
                    </span>
                    <span style={{display:'flex', alignItems:'center', gap:9}}>
                      <span style={{flex:1, height:6, borderRadius:99, background:ADM.NEUTRAL_SOFT, overflow:'hidden'}}>
                        <span style={{display:'block', width:`${x.pct}%`, height:'100%', borderRadius:99,
                          background: x.pct < 30 ? ADM.DANGER : ADM.WARN}}/>
                      </span>
                      <span style={{fontSize:12.8, fontWeight:700, color:ADM.TEXT, width:36, textAlign:'right'}}>{x.pct}%</span>
                    </span>
                    <span style={{fontSize:12.8, color:ADM.MUTED}}>
                      {x.squadra === 0
                        ? <b style={{color:ADM.DANGER}}>Nessun cameriere registrato</b>
                        : <React.Fragment><b style={{color:ADM.TEXT}}>{x.attivi}</b> su {x.squadra} in sala · {x.azioniTurno} azioni/turno</React.Fragment>}
                    </span>
                    <span style={{fontSize:12.4, color:ADM.MUTED_LIGHT, textAlign:'right'}}>
                      QR al {x.qr == null ? '—' : `${x.qr.toFixed(1)}%`}
                    </span>
                  </div>
                ))}
                {sotto.length === 0 && <AdmEmpty icon="users" title="Nessun locale con la sala ferma"
                  desc="Tutti i locali sotto adozione hanno comunque lo staff che lavora"/>}
              </div>
              <div style={{padding:'12px 20px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
                fontSize:13, color:ADM.MUTED, lineHeight:1.5}}>
                Nei locali che non adottano, in sala apre il gestionale il <b style={{color:ADM.TEXT}}>{media(sottoConSquadra)}%</b> dei
                camerieri contro il <b style={{color:ADM.TEXT}}>{media(sopra)}%</b> di quelli che girano.
                Prima di rifare formazione al titolare, conviene guardare chi c'è in sala il sabato sera.
              </div>
            </AdmCard>
          </React.Fragment>
        );
      })()}

      {(() => { const vStaff = (() => {
        const d = VALUTAZIONE_STAFF.distribuzione;
        const n = d.reduce((a, x) => a + x.n, 0);
        return { n, media: n ? d.reduce((a, x) => a + x.voto * x.n, 0) / n : 0 };
      })(); return (<React.Fragment>
      {/* Il voto sta in Servizio Clienti insieme agli altri due, perché il
          valore è il confronto fra i tre mestieri. Qui ne resta il numero:
          chi apre questa tab se lo aspetta, e non deve andarlo a cercare. */}
      <AdmCard padding={0} style={{overflow:'hidden'}}>
        <div style={{padding:'13px 20px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
          <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.04em'}}>Valutazione di Byup Staff</span>
          <span style={{fontSize:22, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em'}}>
            {vStaff.media.toFixed(1).replace('.', ',')}
          </span>
          <span style={{fontSize:13, color:ADM.MUTED_SOFT}}>/ 5 su {fmtNum(vStaff.n)} risposte</span>
          <span style={{flex:1}}/>
          <span style={{fontSize:12.6, color:ADM.MUTED_LIGHT}}>
            Distribuzione e commenti in Analisi Dati → Servizio Clienti
          </span>
        </div>
      </AdmCard>
</React.Fragment>); })()}

      {/* ═══════════ Tempo medio di servizio ═══════════ */}
      {/* Stava in Locali, fra il churn e il food cost. È invece l'ESITO del
          lavoro in sala: quanto ci mette un tavolo dall'ordine confermato al
          conto chiuso misura proprio quello che i due blocchi qui sopra
          descrivono — chi c'è in sala, e quanto usa il gestionale. */}
      <SectionLabel title="Tempo medio di servizio"
        desc="Dall'ordine confermato alla chiusura conto · il risultato di come lavora la sala · su tutta la rete: il filtro non tocca questo blocco"/>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:14}}>
        <AdmCard padding={20}>
          <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Distribuzione locali</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginBottom:14}}>Per fascia di tempo medio</div>
          <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:18}}>
            <div style={{fontSize:32.4, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1}}>{serviceOverall}</div>
            <div style={{fontSize:14.4, color:ADM.MUTED, fontWeight:600}}>min media piattaforma</div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:9}}>
            {serviceDist.map((d,i) => {
              const tone = i < 2 ? ADM.OK : i < 4 ? ADM.WARN : ADM.DANGER;
              return (
                <div key={i}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                    <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:600}}>{d.range} <span style={{color:ADM.MUTED, fontWeight:500}}>· {d.label}</span></span>
                    <span style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>{d.pct}%</span>
                  </div>
                  <div style={{height:6, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                    <div style={{width:`${d.pct*3.3}%`, height:'100%', background:tone, borderRadius:99}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </AdmCard>

        <AdmCard padding={20}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
            <div>
              <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Per tipo locale</div>
              <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Mediana · P75 · campione di locali</div>
            </div>
            <div style={{fontSize:13, color:ADM.MUTED_SOFT, fontWeight:600}}>min</div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {serviceByType.map((t,i) => {
              const maxV = Math.max(...serviceByType.map(x=>x.p75));
              return (
                <div key={i}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                    <span style={{fontSize:14, color:ADM.TEXT, fontWeight:700}}>{t.tipo}</span>
                    <span style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>n={t.n}</span>
                  </div>
                  {/* Box-plot-ish: line min-max, dot mediana, marker P75 */}
                  <div style={{position:'relative', height:24, background:'#F4F5F7', borderRadius:8, overflow:'hidden'}}>
                    <div style={{
                      position:'absolute', left:0, top:0, bottom:0,
                      width:`${(t.median/maxV)*100}%`,
                      background:ADM.INK,
                    }}/>
                    <div style={{
                      position:'absolute', left:`${(t.p75/maxV)*100}%`,
                      top:'50%', transform:'translate(-50%, -50%)',
                      width:3, height:18, background:'#0F1115', borderRadius:1, opacity:0.4,
                    }}/>
                    <div style={{position:'absolute', left:`calc(${(t.median/maxV)*100}% - 4px)`, top:'50%', transform:'translateY(-50%)', width:8, height:8, borderRadius:'50%', background:'#fff', border:`2px solid ${ADM.INK}`}}/>
                    <span style={{position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', fontSize:13, fontWeight:800, color:'#fff', letterSpacing:'-0.01em', textShadow:'0 0 4px rgba(0,0,0,0.4)'}}>{t.median} min</span>
                    <span style={{position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', fontSize:12.6, fontWeight:700, color:ADM.MUTED}}>P75 {t.p75}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:16, lineHeight:1.5}}>
            <strong style={{color:ADM.TEXT}}>Pizzeria è il tipo più efficiente</strong> (38 min media), Ristorante il più lento (92 min). I locali con tempi oltre 90 min hanno satisfaction più bassa del 18%. <strong>Dato vendibile</strong> come punto di riferimento di settore (oggi assente sul mercato IT).
          </div>
        </AdmCard>
      </div>

      {/* ═══════════ Attività operativa ═══════════ */}
      <SectionLabel title="Attività operativa" desc="Quando e come lo staff usa il gestionale"/>

      {/* Riga 3 · Heatmap settimanale · pattern di utilizzo */}
      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, flexWrap:'wrap', gap:10}}>
          <div>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Distribuzione attività staff</div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:2}}>Azioni eseguite per giorno × fascia oraria · ultime 4 settimane · tutta la rete, il filtro non la segmenta</div>
          </div>
          <div style={{display:'inline-flex', alignItems:'center', gap:7, fontSize:13, color:ADM.MUTED, fontWeight:600}}>
            <span>Low</span>
            <span style={{display:'inline-flex', gap:2}}>
              {[0.15, 0.35, 0.55, 0.75, 0.95].map((o, i) => (
                <span key={i} style={{width:14, height:10, background: o > 0.8 ? ADM.PINK : `rgba(49,53,61,${(o*0.5).toFixed(2)})`, borderRadius:2}}/>
              ))}
            </span>
            <span>High</span>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'48px repeat(7, minmax(0,1fr))', gap:6, alignItems:'center'}}>
          <div/>
          {heatmap.map(d => (
            <div key={d.giorno} style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textAlign:'center', letterSpacing:'0.04em', textTransform:'uppercase'}}>{d.giorno}</div>
          ))}
          {heatmap[0].fasce.map((_, fi) => (
            <React.Fragment key={fi}>
              <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600, textAlign:'right', fontFamily:'ui-monospace, monospace'}}>{heatmap[0].fasce[fi].f}</div>
              {heatmap.map((d, di) => {
                const v = d.fasce[fi].v;
                // Alpha solo sul fondo (non sull'intero div: il testo resta opaco).
                const ratio = v / heatMax; const hot = ratio > 0.9; const a = 0.05 + ratio * 0.42;
                return (
                  <div key={di} title={`${d.giorno} ${d.fasce[fi].f}: ${v}% intensità`}
                    style={{
                      height:34, borderRadius:7,
                      background: hot ? ADM.PINK : `rgba(49,53,61,${a.toFixed(2)})`,
                      display:'grid', placeItems:'center',
                      transition:'transform 0.12s', cursor:'help',
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.04)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}>
                    <span style={{fontSize:12.6, color: (hot || a > 0.32) ? '#fff' : ADM.TEXT, fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{v}</span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{marginTop:14, paddingTop:12, borderTop:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', gap:18, fontSize:13.3, color:ADM.MUTED, flexWrap:'wrap'}}>
          <span><strong style={{color:ADM.TEXT}}>Picco:</strong> Sab/Dom 19–23 · cena weekend</span>
          <span><strong style={{color:ADM.TEXT}}>Min:</strong> Lun-Mar 15–19 · pomeriggio infrasettimanale</span>
          <span><strong style={{color:ADM.TEXT}}>Insight:</strong> staffare con priorità weekend serali</span>
        </div>
      </AdmCard>

      {/* Riga 4 · Azioni più frequenti con trend e sparkline */}
      <AdmCard padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, flexWrap:'wrap', gap:10}}>
          <div>
            <div style={{fontSize:15.1, fontWeight:700, color:ADM.TEXT}}>Azioni più frequenti</div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:2}}>Ordinate per volume · ultimi 30 giorni + trend WoW</div>
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>{fmtNum(topActions.reduce((s,a)=>s+a.usi, 0))} azioni totali</div>
        </div>
        <div style={{display:'flex', flexDirection:'column'}}>
          {topActions.map((a,i,arr)=>{
            const pctOfMax = (a.usi / topActions[0].usi) * 100;
            return (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'24px 1fr 100px 100px 60px',
                gap:12, alignItems:'center',
                padding:'12px 0',
                borderBottom: i === arr.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
              }}>
                <div style={{fontSize:13, color:ADM.MUTED_SOFT, fontWeight:700, textAlign:'right'}}>{i+1}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:14.4, color:ADM.TEXT, fontWeight:600, marginBottom:5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.nome}</div>
                  <div style={{height:4, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                    <div style={{width:`${pctOfMax}%`, height:'100%', background:ADM.INK, borderRadius:99}}/>
                  </div>
                </div>
                <div style={{textAlign:'right', fontSize:14.4, color:ADM.TEXT, fontWeight:700, fontFamily:'ui-monospace, monospace'}}>{fmtNum(a.usi)}</div>
                <div style={{display:'flex', justifyContent:'flex-end'}}>
                  <MicroSpark data={a.spark} color={ADM.INK} width={84} height={20}/>
                </div>
                <div style={{textAlign:'right'}}>
                  <TrendBadge delta={a.trend} hideLabel size="sm"/>
                </div>
              </div>
            );
          })}
        </div>
      </AdmCard>
    </div>
  );
}

// ---------- Revenue chart (riusata in tab Locali) ----------
function RevenueSection() {
  const [periodo, setPeriodo] = useStateDash('12m');
  const [anno, setAnno] = useStateDash(2025);

  const data = useMemoDash(() => {
    if (periodo === '6m') return MONTHLY_REVENUE.slice(-6);
    if (periodo === '12m') return MONTHLY_REVENUE.slice(-12);
    if (periodo === 'anno') return MONTHLY_REVENUE.filter(m => m.anno === anno);
    return MONTHLY_REVENUE;
  }, [periodo, anno]);

  const totSub = data.reduce((s, x) => s + x.sub, 0);
  const totExtra = data.reduce((s, x) => s + x.extra, 0);
  const maxVal = Math.max(...data.map(x => x.sub + x.extra), 1);

  const histSub = periodo === 'tot' ? TOTAL_REVENUE_HISTORICAL.sub : totSub;
  const histExtra = periodo === 'tot' ? TOTAL_REVENUE_HISTORICAL.extra : totExtra;

  return (
    <AdmCard padding={22}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:18, marginBottom:18, flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Ricavi nel periodo</div>
          <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:2}}>
            {periodo === 'tot' ? `Da ${TOTAL_REVENUE_HISTORICAL.meseAvvio} ad oggi` :
             periodo === '6m' ? 'Ultimi 6 mesi' :
             periodo === '12m' ? 'Ultimi 12 mesi' : `Anno ${anno}`}
          </div>
        </div>

        <div style={{display:'flex', gap:18, alignItems:'center'}}>
          <Legend color={ADM.INK} label="Abbonamenti" val={fmtEur(histSub)}/>
          <Legend color={ADM.INK_SOFT} label="Extra ordini" val={fmtEur(histExtra)}/>
          <div style={{paddingLeft:14, borderLeft:`1px solid ${ADM.BORDER}`}}>
            <div style={{fontSize:13, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em'}}>Totale</div>
            <div style={{fontSize:22.3, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', marginTop:2}}>{fmtEur(histSub+histExtra)}</div>
          </div>
        </div>

        <div style={{display:'flex', gap:6}}>
          {[{id:'6m', label:'6m'},{id:'12m', label:'12m'},{id:'anno', label:`${anno}`},{id:'tot', label:'Dall\'inizio'}].map(p => (
            <button key={p.id} className="adm-pill" onClick={()=>setPeriodo(p.id)} style={{
              padding:'6px 11px',
              background: periodo===p.id ? ADM.TEXT : '#fff',
              color: periodo===p.id ? '#fff' : ADM.MUTED,
              border: periodo===p.id ? 'none' : `1px solid ${ADM.BORDER}`,
              borderRadius:7, fontSize:13.3, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Gerarchia mono-hue: abbonamenti coral pieno, extra coral tenue (stessa
          famiglia, intensità diversa). Griglia leggera per la scala; i mesi
          passati sono attenuati, l'ultimo è pieno e porta il valore. */}
      <div style={{position:'relative', height: 196, paddingTop:18}}>
        {[1, 2/3, 1/3].map((f, gi) => (
          <div key={gi} style={{position:'absolute', left:0, right:0, bottom: 24 + (196-24-18) * f, borderTop:`1px dashed ${ADM.BORDER_SOFT}`, zIndex:0}}>
            <span style={{position:'absolute', left:0, top:-16, fontSize:11, color:ADM.MUTED_LIGHT, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{fmtEur(Math.round(maxVal * f))}</span>
          </div>
        ))}
        <div style={{position:'relative', display:'flex', alignItems:'flex-end', gap:10, height:'100%', zIndex:1}}>
          {data.map((m, i) => {
            const hSub = (m.sub / maxVal) * 100;
            const hExtra = (m.extra / maxVal) * 100;
            const last = i === data.length - 1;
            return (
              <div key={i} data-tip={`${m.mese}\nAbbonamenti: ${fmtEur(m.sub)}\nExtra: ${fmtEur(m.extra)}\nTotale: ${fmtEur(m.sub + m.extra)}`} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', cursor:'help', minWidth:0}}>
                <div style={{flex:1, width:'100%', maxWidth:40, display:'flex', flexDirection:'column', justifyContent:'flex-end', opacity: last ? 1 : 0.62, position:'relative'}}>
                  {last && (
                    <span style={{position:'absolute', top:-17, left:'50%', transform:'translateX(-50%)', fontSize:11.5, fontWeight:800, color:ADM.TEXT, whiteSpace:'nowrap'}}>{fmtEur(m.sub + m.extra)}</span>
                  )}
                  <div style={{width:'100%', height: `${hExtra}%`, background:ADM.INK_SOFT, borderRadius:'5px 5px 0 0', minHeight: m.extra > 0 ? 2 : 0}}/>
                  <div style={{width:'100%', height: `${hSub}%`, background: ADM.INK, minHeight: 2, borderRadius: m.extra > 0 ? 0 : '5px 5px 0 0'}}/>
                </div>
                <div style={{fontSize:12, color: last ? ADM.TEXT : ADM.MUTED_SOFT, fontWeight: last ? 700 : 500, whiteSpace:'nowrap'}}>{m.mese}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AdmCard>
  );
}

function Legend({ color, label, val }) {
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{fontSize:13, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em'}}>{label}</div>
      <div style={{fontSize:18, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.02em', marginTop:2, display:'flex', alignItems:'center', gap:7}}>
        <span style={{width:10, height:10, background:color, borderRadius:3}}/>
        {val}
      </div>
    </div>
  );
}

// ---------- Screens card (with sub-tabs) ----------
function ScreensCard() {
  const [expanded, setExpanded] = useStateDash(null);
  return (
    <AdmCard padding={20}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
        <div>
          <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Schermate più usate</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>Clicca per vedere le tab interne</div>
        </div>
        <span style={{fontSize:12.6, color:ADM.MUTED_SOFT}}>% locali che la visita</span>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {SCREENS_USAGE.map((s, i) => {
          const isOpen = expanded === i;
          const hasTabs = s.tabs && s.tabs.length > 0;
          return (
            <div key={i}>
              <button onClick={()=> hasTabs && setExpanded(isOpen ? null : i)} style={{
                width:'100%', background:'transparent', border:'none', padding:'4px 0',
                cursor: hasTabs ? 'pointer' : 'default', fontFamily:'inherit', textAlign:'left',
              }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5}}>
                  <span style={{display:'flex', alignItems:'center', gap:6, fontSize:14, color:ADM.TEXT, fontWeight:500}}>
                    {hasTabs ? <span style={{display:'inline-flex', color:ADM.MUTED, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition:'transform 0.15s'}}><BuIcons.chevronRight size={16}/></span> : <span style={{width:11}}/>}
                    {s.nome}
                  </span>
                  <span style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600}}>{fmtNum(s.visite)} · {s.pct}%</span>
                </div>
                <div style={{height:5, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${s.pct}%`, height:'100%', background:`linear-gradient(90deg, ${ADM.PINK}, ${ADM.PINK_DARK})`, borderRadius:99}}/>
                </div>
              </button>
              {isOpen && hasTabs && (
                <div style={{padding:'10px 0 6px 22px', display:'flex', flexDirection:'column', gap:7, borderLeft:`2px solid ${ADM.PINK_SOFT}`, marginLeft:6, marginTop:6}}>
                  {s.tabs.map((t, ti) => (
                    <div key={ti} style={{paddingLeft:10}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3}}>
                        <span style={{fontSize:13.3, color:ADM.TEXT}}>{t.nome}</span>
                        <span style={{fontSize:13, color:ADM.MUTED, fontWeight:600}}>{t.pct}%</span>
                      </div>
                      <div style={{height:3, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                        <div style={{width:`${t.pct}%`, height:'100%', background:ADM.PURPLE, borderRadius:99}}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdmCard>
  );
}


window.AdmDashboard = AdmDashboard;
