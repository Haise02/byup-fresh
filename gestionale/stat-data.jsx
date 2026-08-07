// Statistiche — dati realistici

const STAT_PRENOTAZIONI = {
  // `trend`: 14 settimane per le sparkline delle card KPI. La durata è in
  // minuti — la linea vuole numeri, l'etichetta resta '1h 50m'.
  kpi: {
    coperti: { val: 1150, delta: 12.5,
      trend: [980, 1010, 995, 1040, 1025, 1070, 1050, 1090, 1075, 1110, 1095, 1130, 1120, 1150] },
    occupazione: { val: 79, delta: 12.5,
      trend: [68, 70, 69, 71, 70.5, 73, 72, 74, 73.5, 76, 75, 77.5, 78, 79] },
    perTavolo: { val: 2.4, delta: 5.2,
      trend: [2.2, 2.25, 2.2, 2.3, 2.25, 2.3, 2.28, 2.35, 2.3, 2.38, 2.34, 2.4, 2.37, 2.4] },
    durata: { val: '1h 50m', delta: -3.1,
      trend: [118, 116, 117, 114, 115, 112, 113, 111, 112, 109, 110, 108, 111, 110] },
  },
  fasceOccupazione: [
    { ora:'12:00', tavoli: 14, max: 20 },
    { ora:'13:00', tavoli: 16, max: 20 },
    { ora:'14:00', tavoli: 12, max: 20 },
    { ora:'19:00', tavoli: 10, max: 20 },
    { ora:'20:00', tavoli: 18, max: 20 },
    { ora:'21:00', tavoli: 19, max: 20 },
    { ora:'22:00', tavoli: 13, max: 20 },
  ],
  stato: {
    totale: 543,
    cancellate: { n: 39, pct: 7.2 },
    noShow: { n: 18, pct: 3.3 },
    confermate: { n: 432, pct: 79.6 },
    inAttesa: { n: 54, pct: 9.9 },
  },
  // Niente `target`: il riferimento non è più una soglia decisa a tavolino ma
  // la media del periodo, che si calcola da questi stessi valori.
  copertiGiorno: [
    { d:'Lun', val: 18 },
    { d:'Mar', val: 32 },
    { d:'Mer', val: 21 },
    { d:'Gio', val: 38 },
    { d:'Ven', val: 14 },
    { d:'Sab', val: 28 },
    { d:'Dom', val: 22 },
  ],
  // Palette warm: rosso → arancione → ambra → ocra. Niente nero / verde.
  // 4 tonalità distinguibili che parlano col brand magenta senza imitarlo.
  distribuzione: [
    { label:'Tavoli da 2',  pct: 38.4, color:'#B53338' }, // rosso scuro
    { label:'Tavoli da 4',  pct: 28.7, color:'#FF5A5F' }, // brand
    { label:'Tavoli da 6',  pct: 18.9, color:'#F59E0B' }, // ambra
    { label:'Tavoli da 8+', pct: 14.0, color:'#FDBA74' }, // arancio chiaro
  ],
};

const STAT_ORDINI = {
  kpi: {
    // Lo scontrino medio è passato a STAT_VENDITE: il valore di un ordine è
    // una cosa che si legge accanto a quanto vale un piatto, non accanto a
    // quanti ordini sono stati completati.
    completati: { val: 1320, delta: 12.5, sub:'Ordini conclusi nel periodo',
      trend: [1080, 1110, 1095, 1140, 1125, 1170, 1150, 1195, 1180, 1225, 1210, 1260, 1290, 1320] },
    // Quanti articoli entrano in un ordine è invece una domanda su come si
    // ordina, non su quanto rende: sta qui, accanto agli ordini completati.
    articoli: { val: 3.2, delta: 8.4, sub:'Articoli per ordine medio',
      trend: [2.8, 2.9, 2.85, 3.0, 2.95, 3.05, 3.0, 3.1, 3.05, 3.15, 3.1, 3.2, 3.15, 3.2] },
  },
  // I tre canali sommano ai 1.320 ordini completati qui sopra: sono le tre
  // parti dello stesso totale, non tre conteggi indipendenti.
  sala:    { completati: 708, tempoMedio: '52 min' },
  asporto: { completati: 372, tempoMedio: '14 min' },
  diretta: { completati: 240, tempoMedio: '4 min' },
  // Heatmap: 7 giorni × 8 fasce, ogni cella = ordini medi nel giorno tipico
  heatmap: [
    // 08-09, 09-10, 10-11, 11-12, 12-13, 13-14, 19-20, 20-21
    { ora:'08-09', val:[ 4, 5, 4, 6, 6,12, 8] },
    { ora:'09-10', val:[ 6, 7, 6, 7, 8,18,14] },
    { ora:'10-11', val:[ 3, 4, 3, 5, 5,10, 8] },
    { ora:'11-12', val:[ 8,10, 9,11,14,22,18] },
    { ora:'12-13', val:[28,32,30,34,42,58,52] },
    { ora:'13-14', val:[42,46,44,48,56,72,68] },
    { ora:'19-20', val:[24,28,26,32,46,68,60] },
    { ora:'20-21', val:[38,44,42,48,62,84,78] },
    { ora:'21-22', val:[22,26,24,30,38,52,46] },
  ],
};

const STAFF = [
  { nome:'Marco Esposito', ruolo:'Cameriere', avatar:'ME', avatarBg:'#FF5A5F', scontrino: 38.20, vsTeam: -8.13, ordini: 312, tavoli: 142, tip: 240 },
  { nome:'Sofia Bianchi',  ruolo:'Cameriera', avatar:'SB', avatarBg:'#B53338', scontrino: 52.40, vsTeam: +6.07, ordini: 286, tavoli: 138, tip: 380 },
  { nome:'Luca Conti',     ruolo:'Cameriere', avatar:'LC', avatarBg:'#0F1115', scontrino: 47.80, vsTeam: +1.47, ordini: 264, tavoli: 121, tip: 310 },
  { nome:'Giulia Romano',  ruolo:'Cameriera', avatar:'GR', avatarBg:'#16A34A', scontrino: 49.10, vsTeam: +2.77, ordini: 298, tavoli: 134, tip: 350 },
  { nome:'Davide Russo',   ruolo:'Cameriere', avatar:'DR', avatarBg:'#2563EB', scontrino: 41.90, vsTeam: -4.43, ordini: 245, tavoli: 110, tip: 200 },
  { nome:'Chiara Greco',   ruolo:'Cameriera', avatar:'CG', avatarBg:'#7C3AED', scontrino: 55.20, vsTeam: +8.87, ordini: 274, tavoli: 130, tip: 410 },
  { nome:'Andrea Marino',  ruolo:'Cameriere', avatar:'AM', avatarBg:'#D97706', scontrino: 44.30, vsTeam: -2.03, ordini: 252, tavoli: 115, tip: 220 },
  { nome:'Elena Costa',    ruolo:'Maître',    avatar:'EC', avatarBg:'#E04347', scontrino: 58.60, vsTeam: +12.27,ordini: 198, tavoli: 95,  tip: 460 },
];

// Gli aspetti che l'app propone dopo il pagamento, copiati da menu.jsx
// (SuccessScreen): il set cambia col voto — sopra le due stelle sono i pregi,
// da due in giù sono i problemi, e l'etichetta cambia di conseguenza («Cibo»
// resta «Cibo», ma «Qualità/prezzo» diventa «Prezzo alto»).
// I `_neg` sono quelli che in Statistiche vale la pena poter filtrare: sono le
// categorie di problema che il cliente ha segnalato lui, non una nostra
// interpretazione del testo.
const STAT_ASPETTI = {
  cibo:             { et:'Cibo',            emoji:'🍝' },
  servizio:         { et:'Servizio',        emoji:'🙋' },
  locale:           { et:'Locale',          emoji:'🏛️' },
  qualita:          { et:'Qualità/prezzo',  emoji:'💸' },
  atmosfera:        { et:'Atmosfera',       emoji:'✨' },
  tempi:            { et:'Tempi rapidi',    emoji:'⚡' },
  packaging:        { et:'Packaging',       emoji:'📦' },
  cortesia:         { et:'Cortesia',        emoji:'🙋' },
  cibo_neg:         { et:'Cibo',            emoji:'🍽️', problema: true },
  servizio_neg:     { et:'Servizio',        emoji:'🙅', problema: true },
  attesa_neg:       { et:'Attesa lunga',    emoji:'⏳', problema: true },
  pulizia_neg:      { et:'Pulizia',         emoji:'🧼', problema: true },
  rumore:           { et:'Rumore',          emoji:'🔊', problema: true },
  qualita_neg:      { et:'Prezzo alto',     emoji:'💸', problema: true },
  ordine_sbagliato: { et:'Ordine sbagliato',emoji:'⚠️', problema: true },
  packaging_neg:    { et:'Packaging',       emoji:'📦', problema: true },
  cortesia_neg:     { et:'Personale',       emoji:'🙅', problema: true },
};

// I motivi per cui un ristoratore può contestare una recensione. Quelli che
// contano davvero in questo mestiere: chi non è mai venuto, chi insulta, chi
// scrive del locale sbagliato, chi ricatta.
const STAT_MOTIVI_SEGNALAZIONE = [
  'Non è mai stato un nostro cliente',
  'Contenuto offensivo o volgare',
  'Si riferisce a un altro locale',
  'Contiene dati personali',
  'Spam o pubblicità',
  'Tentativo di ricatto',
  'Altro motivo',
];

const STAT_CLIENTI = {
  // L'ultima rilevazione di ogni andamento coincide col valore accanto: una
  // linea che finisce altrove racconterebbe un'altra storia dal numero.
  unici: { val: 1240, delta: 12, trend: [1020, 1080, 1050, 1120, 1160, 1200, 1240] },
  abituali: { val: 487, delta: 8, trend: [420, 435, 430, 450, 462, 475, 487] },
  rating: 4.5,
  recensioni: 543,
  // Le recensioni arrivano da due parti, e non sono la stessa cosa. Quelle
  // byup nascono da un ordine pagato qui dentro — si sa che quella persona c'è
  // stata e cosa ha mangiato — quelle Google le lascia chiunque abbia un
  // account Google. La media pesata delle due dà il 4,5 di sopra:
  // (312 × 4,6 + 231 × 4,4) / 543.
  fonti: {
    byup:   { n: 312, media: 4.6 },
    google: { n: 231, media: 4.4 },
  },
  // Stessa forma delle recensioni nell'app: dopo il pagamento il cliente dà le
  // stelle e tocca gli aspetti, e l'app cambia il set a seconda del voto —
  // sopra le due stelle sono i pregi, sotto sono i problemi (menu.jsx,
  // SuccessScreen). Il commento è facoltativo, gli aspetti quasi mai.
  // Qui in più la provenienza e, per le byup, il piatto dell'ordine da cui la
  // recensione nasce: è quello che Google non può avere — e infatti le
  // recensioni Google non hanno né aspetti né piatto.
  feedback: [
    { autore:'Giulia M.',  iniziale:'G', bg:'#FF5A5F', stelle: 5, quando:'2 giorni fa',    fonte:'byup',   piatto:'Carbonara',    aspetti:['cibo','atmosfera'],           testo:'Atmosfera incredibile e cucina autentica. La carbonara è la migliore che abbia mangiato a Roma.' },
    { autore:'Roberto S.', iniziale:'R', bg:'#6B7280', stelle: 1, quando:'3 giorni fa',    fonte:'google',                                                                testo:'Passato davanti, sembra il solito posto per turisti. Non mi ispira per niente.' },
    { autore:'Marco R.',   iniziale:'M', bg:'#2563EB', stelle: 5, quando:'4 giorni fa',    fonte:'google',                                                                testo:'Servizio impeccabile, il vino consigliato dal cameriere era perfetto per il piatto.' },
    { autore:'Chiara B.',  iniziale:'C', bg:'#7C3AED', stelle: 2, quando:'5 giorni fa',    fonte:'byup',   piatto:'Saltimbocca',  aspetti:['attesa_neg','servizio_neg'],  testo:'Il piatto era buono ma abbiamo aspettato quaranta minuti e nessuno è venuto a dirci nulla.' },
    { autore:'Alessio R.', iniziale:'A', bg:'#0F1115', stelle: 2, quando:'6 giorni fa',    fonte:'byup',   piatto:'Bruschetta',   aspetti:['pulizia_neg','rumore'],       testo:'Tavolo appiccicoso e musica altissima, peccato perché si mangia bene.' },
    { autore:'Sara D.',    iniziale:'S', bg:'#D97706', stelle: 4, quando:'1 settimana fa', fonte:'byup',   piatto:'Amatriciana',  aspetti:['cibo','servizio'],            testo:'Ottima esperienza, tornerò con gli amici. Solo un po\' di attesa all\'arrivo, ma ne è valsa la pena.' },
    { autore:'Luca P.',    iniziale:'L', bg:'#16A34A', stelle: 5, quando:'1 settimana fa', fonte:'byup',   piatto:'Cacio e Pepe', aspetti:['servizio','qualita'],         testo:'Ordinare e pagare dal tavolo è una svolta: il sabato sera zero attesa per il conto.' },
    { autore:'Federico A.',iniziale:'F', bg:'#B53338', stelle: 1, quando:'1 settimana fa', fonte:'byup',   piatto:'Pesce spada',  aspetti:['cibo_neg','qualita_neg'],     testo:'Pesce non freschissimo e ventotto euro. Non ci torno.' },
    { autore:'Anna V.',    iniziale:'A', bg:'#2563EB', stelle: 4, quando:'2 settimane fa', fonte:'google',                                                                testo:'Bel posto, prezzi onesti. Prenotate il fine settimana perché si riempie.' },
    { autore:'Elena F.',   iniziale:'E', bg:'#E04347', stelle: 3, quando:'2 settimane fa', fonte:'google',                                                                testo:'Cucina buona ma locale molto rumoroso la sera, si fatica a parlare al tavolo.' },
    { autore:'Martina L.', iniziale:'M', bg:'#7C3AED', stelle: 2, quando:'2 settimane fa', fonte:'byup',   piatto:'Carbonara',    aspetti:['attesa_neg','cibo_neg'],      testo:'Carbonara arrivata tiepida dopo mezz\'ora. Il locale però è carino.' },
    { autore:'Davide N.',  iniziale:'D', bg:'#16A34A', stelle: 5, quando:'3 settimane fa', fonte:'byup',   piatto:'Tiramisù',     aspetti:['cibo','locale'],              testo:'Tiramisù da manuale e conto diviso in due tap. Consigliatissimo.' },
  ],
  starBreakdown: [
    { stars: 5, count: 320 },
    { stars: 4, count: 142 },
    { stars: 3, count: 48 },
    { stars: 2, count: 21 },
    { stars: 1, count: 12 },
  ],
  ratingTrend: [4.2,4.3,4.4,4.4,4.3,4.5,4.6,4.5,4.6,4.7,4.6,4.8],
  // Quante ne sono arrivate mese per mese. Sommano a 543, cioè al totale che
  // la card mostra in grande: il volume e la media sono lo stesso mucchio di
  // recensioni guardato in due modi, e non devono poter divergere.
  recensioniMese: [28, 32, 35, 41, 38, 44, 52, 61, 47, 55, 49, 61],
  ciclo: [
    { stato:'Prima visita',           n: 433, pct: 35, delta: 12.5 },
    { stato:'Ritorno entro 30 giorni', n: 320, pct: 26, delta: 10.0 },
    { stato:'Ritorno entro 90 giorni', n: 210, pct: 17, delta: 5.0 },
    { stato:'3+ visite ultimi 90gg',   n: 180, pct: 14, delta: 15.0 },
    { stato:'6+ visite ultimi 90gg',   n: 97,  pct:  8, delta: 7.5 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FUORI DA QUI · cosa ordinano i tuoi clienti negli altri locali byup
//
// È il dato che un gestionale da solo non può avere: lo sa la rete, perché la
// stessa persona ordina col suo account anche altrove. Serve a una domanda
// sola — cosa cercano i miei clienti che da me non trovano — e per questo ogni
// riga dice se quel prodotto è nel tuo menù o no.
//
// Aggregato e anonimo per costruzione: si contano le persone, non si nominano,
// e le voci sotto la soglia minima non escono (sotto i 5 clienti un dato non è
// una tendenza, è una persona riconoscibile).
const STAT_FUORI = {
  sogliaMinima: 5,
  clientiTracciati: 486,      // tuoi clienti che ordinano anche in altri locali
  quotaSulTotale: 39,         // % sui clienti unici del periodo
  localiZona: 14,             // locali byup entro 3 km che concorrono al dato
  raggioKm: 3,
  prodotti: [
    { nome:'Tagliere di salumi e formaggi', cat:'Antipasti',     clienti: 96, ordini: 143, prezzo: 14.00, tuo: false },
    { nome:'Tartare di manzo',              cat:'Antipasti',     clienti: 71, ordini:  88, prezzo: 16.00, tuo: false },
    { nome:'Cacio e pepe',                  cat:'Primi piatti',  clienti: 68, ordini: 121, prezzo: 12.00, tuo: true  },
    { nome:'Pizza margherita',              cat:'Pizze',         clienti: 64, ordini: 190, prezzo:  8.50, tuo: true  },
    { nome:'Poke bowl',                     cat:'Piatti unici',  clienti: 58, ordini:  96, prezzo: 13.50, tuo: false },
    { nome:'Hamburger di chianina',         cat:'Secondi piatti',clienti: 52, ordini:  74, prezzo: 15.00, tuo: false },
    { nome:'Spritz',                        cat:'Bar',           clienti: 49, ordini: 168, prezzo:  6.50, tuo: true  },
    { nome:'Tiramisù',                      cat:'Dolci',         clienti: 41, ordini:  59, prezzo:  6.00, tuo: true  },
    { nome:'Carbonara di mare',             cat:'Primi piatti',  clienti: 33, ordini:  44, prezzo: 16.00, tuo: false },
    { nome:'Birra artigianale alla spina',  cat:'Bar',           clienti: 29, ordini:  91, prezzo:  6.00, tuo: false },
  ],
};

const STAT_ECONOMICI = {
  ricavi: { val: 86420, delta: 12.5 },
  costi:  { val: 52180, delta: -4.2 },
  utile:  { val: 34240, delta: 18.7 },
  origine: {
    sala:     [4200, 4500, 4800, 5400, 5100, 5800, 5400, 4900, 6200, 5800, 6100, 6400],
    asporto:  [2400, 2600, 2800, 3200, 3000, 3400, 3200, 2900, 3700, 3400, 3600, 3800],
    diretta:  [ 800,  900, 1000, 1200, 1100, 1300, 1200, 1100, 1400, 1300, 1350, 1450],
  },
  totaleRicavi: { byup: 36120, contanti: 21240, carte: 29060 },
  fatturatoTrend: [42500, 48200, 52000, 56800, 51400, 58200, 54800, 49600, 64200, 58800, 62400, 65800],
  // Costi mese per mese: crescono meno dei ricavi, ed è il motivo per cui
  // l'utile sale (+18,7%) più del fatturato (+12,5%).
  costiTrend:     [26800, 29400, 31200, 33900, 31800, 34600, 33200, 30800, 37400, 35200, 36800, 38400],
  costiBreakdown: [
    { cat:'Stipendi',     fissi: 100, var: 0,   tot: 18400, delta: 0.5 },
    { cat:'Materie prime', fissi: 0,  var: 100, tot: 14200, delta: 8.2 },
    { cat:'Utenze',       fissi: 70, var: 30,  tot: 4800,  delta: -2.1 },
    { cat:'F&B beverage', fissi: 30, var: 70,  tot: 6400,  delta: 5.4 },
    { cat:'Locale & affitto', fissi: 100, var: 0, tot: 5000, delta: 0 },
    { cat:'Attrezzature & ammortamento', fissi: 90, var: 10, tot: 1800, delta: -8.0 },
    { cat:'Altro',        fissi: 50, var: 50,  tot: 1580,  delta: 3.2 },
  ],
};

// Miniature dei piatti: 80px bastano per un bollino da 34, e il doppio per
// gli schermi retina. Nome distinto da DISH_PHOTO di Impostazioni, che è un
// altro global const e in questo gestionale gli script non sono isolati.
const STAT_FOTO = (id) => `https://images.unsplash.com/${id}?w=80&h=80&q=70&auto=format&fit=crop`;

const STAT_VENDITE = {
  // `trend`: 14 settimane, servono alle sparkline delle card KPI. Salgono
  // tutte perché tutti e quattro i delta sono positivi: una linea che scende
  // sotto un "+8,4%" si legge come un errore.
  kpi: {
    margine:  { val: 62, delta: 4.1, sub:'Margine medio (%)',
      trend: [58, 59, 58.5, 60, 59.5, 60.5, 60, 61, 60.5, 61.5, 61, 62.5, 61.5, 62] },
    venduti:  { val: 13560, delta: 12.5, sub:'Articoli totali venduti',
      trend: [11400, 11800, 11600, 12100, 11900, 12400, 12200, 12700, 12500, 13000, 12800, 13300, 13100, 13560] },
    // Il valore non sta qui: si ricava dai ricavi del periodo diviso gli
    // articoli venduti, così non può divergere dai numeri accanto se un
    // domani qualcuno tocca solo uno dei due.
    scontrino: { val: 45.50, delta: 12.5, sub:'Valore medio di un ordine',
      trend: [39.5, 40.4, 40.0, 41.3, 40.8, 42.0, 41.5, 42.8, 42.3, 43.6, 43.0, 44.4, 43.8, 45.5] },
    ricavoPiatto: { delta: 6.7, sub:'Ricavi diviso articoli venduti',
      trend: [5.6, 5.75, 5.7, 5.9, 5.85, 6.0, 5.95, 6.1, 6.05, 6.2, 6.15, 6.3, 6.25, 6.37] },
  },
  scontrinoTrend: { // 12 mesi, 3 canali
    direta:  [4500, 4800, 5200, 6100, 5500, 6800, 6300, 5800, 7200, 6400, 7000, 7300],
    asporto: [2600, 2800, 3100, 3700, 3300, 4100, 3800, 3500, 4400, 3900, 4250, 4500],
    delivery:[ 800,  900, 1100, 1500, 1300, 1800, 1700, 1500, 2100, 1900, 2050, 2300],
  },
  // `deltaMargine`: quanto è cambiato il margine di quel piatto rispetto al
  // mese scorso. Serve alla card del piatto più redditizio, che senza
  // direbbe solo dov'è arrivato e non da dove viene.
  // Le foto sono le stesse della libreria piatti in Impostazioni → Menù, così
  // il prototipo racconta una cucina sola. Dove il piatto lì non esiste
  // (coda alla vaccinara, trippa, carciofi) si presta quella della stessa
  // categoria: sono segnaposto, e i veri scatti arrivano dal menù del locale.
  piatti: [
    { nome:'Cacio e Pepe',   cat:'Primi',     foto: STAT_FOTO('photo-1608756687911-aa1599ab3bd9'), costo: 4.20, ricavo: 14.00, margine: 9.80, n: 412, costiTot: 1730.4, ricavoTot: 5768, marginePct: 70, deltaMargine: 3.1 },
    { nome:'Carbonara',      cat:'Primi',     foto: STAT_FOTO('photo-1612874742237-6526221588e3'), costo: 4.80, ricavo: 15.00, margine: 10.20, n: 386, costiTot: 1852.8, ricavoTot: 5790, marginePct: 68, deltaMargine: -1.2 },
    { nome:'Amatriciana',    cat:'Primi',     foto: STAT_FOTO('photo-1621996346565-e3dbc646d9a9'), costo: 4.50, ricavo: 14.50, margine: 10.00, n: 342, costiTot: 1539.0, ricavoTot: 4959, marginePct: 69, deltaMargine: 2.4 },
    { nome:'Saltimbocca',    cat:'Secondi',   foto: STAT_FOTO('photo-1600891964092-4316c288032e'), costo: 7.20, ricavo: 22.00, margine: 14.80, n: 198, costiTot: 1425.6, ricavoTot: 4356, marginePct: 67, deltaMargine: 1.1 },
    { nome:'Coda alla vaccinara', cat:'Secondi', foto: STAT_FOTO('photo-1541529086526-db283c563270'), costo: 8.90, ricavo: 24.00, margine: 15.10, n: 142, costiTot: 1263.8, ricavoTot: 3408, marginePct: 63, deltaMargine: -2.8 },
    { nome:'Trippa',         cat:'Secondi',   foto: STAT_FOTO('photo-1600891964092-4316c288032e'), costo: 5.40, ricavo: 16.00, margine: 10.60, n: 124, costiTot: 669.6,  ricavoTot: 1984, marginePct: 66, deltaMargine: 0.6 },
    { nome:'Tiramisù',       cat:'Dolci',     foto: STAT_FOTO('photo-1571877227200-a0d98ea607e9'), costo: 2.10, ricavo: 8.00,  margine: 5.90,  n: 386, costiTot: 810.6,  ricavoTot: 3088, marginePct: 74, deltaMargine: 4.2 },
    { nome:'Pesce spada',    cat:'Secondi',   foto: STAT_FOTO('photo-1467003909585-2f8a72700288'), costo: 12.40,ricavo: 28.00, margine: 15.60, n: 98,  costiTot: 1215.2, ricavoTot: 2744, marginePct: 56, deltaMargine: -3.4 },
    { nome:'Carciofi alla giudia', cat:'Antipasti', foto: STAT_FOTO('photo-1529312266912-b33cfce2eefd'), costo: 3.20, ricavo: 9.00, margine: 5.80, n: 264, costiTot: 844.8, ricavoTot: 2376, marginePct: 64, deltaMargine: 1.9 },
    { nome:'Bruschetta',     cat:'Antipasti', foto: STAT_FOTO('photo-1572695157366-5e585ab2b69f'), costo: 1.40, ricavo: 6.00,  margine: 4.60,  n: 312, costiTot: 436.8,  ricavoTot: 1872, marginePct: 77, deltaMargine: 8.0 },
  ],
};

const STAT_APP = {
  // Ogni passaggio si porta il suo andamento — sette rilevazioni, l'ultima
  // uguale al valore accanto — e il confronto col periodo prima. Stavano nelle
  // card KPI sopra il funnel, che però ripetevano primo e ultimo passaggio:
  // qui il numero e la sua direzione stanno nello stesso posto.
  funnel: [
    { label:'Visualizzazioni vetrina', sub:'Chi apre la pagina del locale',        val: 10000, pct: 100, delta: 14.2, trend: [8200, 8600, 8500, 9100, 9400, 9700, 10000] },
    { label:'Visualizzazioni menu',    sub:'Chi arriva a sfogliare i piatti',      val: 7500,  pct: 75,  delta: 11.5, trend: [6100, 6400, 6350, 6800, 7000, 7250, 7500] },
    { label:'Carrello creato',         sub:'Chi mette almeno un piatto nel carrello', val: 4200, pct: 42, delta: 8.1, trend: [3500, 3650, 3600, 3850, 3950, 4080, 4200] },
    { label:'Pagamento completato',    sub:'Chi arriva in fondo e paga',           val: 2900,  pct: 29,  delta: 9.6,  trend: [2450, 2560, 2520, 2680, 2740, 2830, 2900] },
  ],
  // Quello che succede dopo l'ultimo passaggio: un pagamento andato a buon fine
  // può tornare indietro. Non è un quinto scalino del funnel — non è gente che
  // si perde per strada, è denaro restituito — quindi sta a parte, in fondo.
  rimborsi: { n: 34, valore: 1180, delta: -0.4 },
  // `apri`: quante volte il piatto è stato toccato per aprirne la scheda, da
  // app o webapp. Sta fra la vista in elenco e l'ordine, ma non è un passaggio
  // obbligato — dall'elenco si aggiunge anche senza aprire, ed è per questo
  // che l'acqua ha 2.640 ordini e appena 380 schede aperte: nessuno legge la
  // descrizione dell'acqua naturale. Il pesce spada fa il contrario, 720
  // curiosi e 280 ordini: lì a fermare è il prezzo, non la voglia.
  // `mod`: ordini in cui il piatto è stato personalizzato — un ingrediente
  // aggiunto o tolto — quindi non può superare gli ordini. È la voce che dice
  // se il menù è scritto giusto: la carbonara la ordinano 1.380 volte e la
  // toccano 486, quasi sempre per il pecorino o il guanciale; l'acqua, che non
  // si modifica, sta a zero.
  conversionePiatti: [
    { piatto:'Acqua naturale',      view: 3200, apri:  380, mod:   0, ord: 2640, conv: 82.5 },
    { piatto:'Cacio e Pepe',        view: 2800, apri: 1980, mod: 412, ord: 1450, conv: 51.8 },
    { piatto:'Carbonara',           view: 2640, apri: 1870, mod: 486, ord: 1380, conv: 52.3 },
    { piatto:'Amatriciana',         view: 2380, apri: 1640, mod: 318, ord: 1190, conv: 50.0 },
    { piatto:'Tiramisù',            view: 1820, apri: 1460, mod:  96, ord: 1310, conv: 72.0 },
    { piatto:'Bruschetta',          view: 1640, apri: 1180, mod: 214, ord: 980,  conv: 59.8 },
    { piatto:'Saltimbocca',         view: 1420, apri: 1040, mod: 132, ord: 580,  conv: 40.8 },
    { piatto:'Carciofi alla giudia', view: 1280, apri:  890, mod:  88, ord: 720,  conv: 56.3 },
    { piatto:'Pesce spada',         view: 920,  apri:  720, mod:  64, ord: 280,  conv: 30.4 },
    { piatto:'Coda alla vaccinara', view: 720,  apri:  560, mod:  42, ord: 240,  conv: 33.3 },
  ],
};

window.STAT_PRENOTAZIONI = STAT_PRENOTAZIONI;
window.STAT_ORDINI = STAT_ORDINI;
window.STAFF = STAFF;
window.STAT_CLIENTI = STAT_CLIENTI;
window.STAT_ASPETTI = STAT_ASPETTI;
window.STAT_MOTIVI_SEGNALAZIONE = STAT_MOTIVI_SEGNALAZIONE;
window.STAT_FUORI = STAT_FUORI;
window.STAT_ECONOMICI = STAT_ECONOMICI;
window.STAT_VENDITE = STAT_VENDITE;
window.STAT_APP = STAT_APP;
