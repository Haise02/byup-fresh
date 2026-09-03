// ════════════════════════════════════════════════════════════════════════════
// MERCATO · IL MENU COME DATO
// ════════════════════════════════════════════════════════════════════════════
//
// Tutto quello che sta qui dentro nasce da una cosa sola: byup vede la CARTA di
// ogni locale in forma strutturata — voce per voce, prezzo per prezzo, e ogni
// volta che cambia. Da quel fatto scendono sette misure che oggi in Italia,
// fuori casa, o sono stimate o non esistono:
//
//   1. distribuzione ponderata delle marche a menu  (oggi: stimata dai sell-in)
//   2. elasticità vera al prezzo                    (oggi: non misurata)
//   3. tasso di attacco bevanda↔piatto              (oggi: non misurato)
//   4. rotazione delle carte e trend d'ingrediente  (oggi: panel retail, in ritardo)
//   5. intensità di lavoro per coperto              (oggi: non misurata)
//   6. demografia d'impresa in anticipo             (oggi: registri, mesi dopo)
//   7. indice prezzi dei menu in tempo reale        (oggi: ISTAT, a T+15gg)
//
// REGOLA DI ONESTÀ, valida per tutto il file: questi numeri descrivono la RETE
// BYUP, non l'Italia. Con trentuno carte osservate non si proietta un mercato
// da 195.000 imprese, e ogni sezione lo scrive dove si legge. Il valore non è
// la proiezione di oggi: è che la misura esiste e cresce con la rete.

// ── L'universo osservabile ────────────────────────────────────────────────
// La carta digitalizzata ce l'ha chi ha finito l'onboarding: attivi e inattivi.
// Chi è in setup non ha ancora caricato niente, e chi ha disdetto non aggiorna
// più. È lo stesso perimetro di LOC.live, non una popolazione inventata qui.
const MKT_LOCALI = LOCALI.filter(locLive);
const MKT_ORDINI_TOT = MKT_LOCALI.reduce((s, l) => s + l.ordiniMese, 0);
// Voci di menu per locale: una carta vera sta fra le 40 e le 120 voci.
// Le voci di carta di partenza per categoria (codici delle venue_category):
// era una catena di ternari con Trattoria, Osteria e Bistrot nel default.
// Sta PRIMA di chi la usa: il modulo la legge al caricamento.
const MKT_VOCI_BASE = {
  'pizzeria':46, 'bar':38, 'ristorante':88, 'enoteca':74, 'bistrot':62,
  'giapponese':70, 'carne_griglia':58, 'cucina_etnica':66,
};
const MKT_VOCI_PER_LOCALE = (l) => {
  const r = pseudoRand(l.id.charCodeAt(3) * 31 + l.nome.length);
  const base = MKT_VOCI_BASE[l.tipo] ?? 62;
  return Math.round(base * (0.82 + r() * 0.5));
};
const MKT_VOCI_TOT = MKT_LOCALI.reduce((s, l) => s + MKT_VOCI_PER_LOCALE(l), 0);
// Le voci bevanda sono ~28% di una carta, ed è lì che sta la marca: nessuno
// scrive «Barilla» accanto alla carbonara, ma «Spritz Aperol» sì.
const MKT_VOCI_BEVANDA = Math.round(MKT_VOCI_TOT * 0.28);

// ── 1 · LE MARCHE A CARTA ─────────────────────────────────────────────────
// `pen` = penetrazione attesa nel canale (quota di carte che portano la marca),
// tarata sulle quote note del fuori casa italiano. Non è un dato nostro: è il
// prior da cui parte il sorteggio, che poi il modello declina locale per locale
// in base al tipo di esercizio. Il numero che conta è quello che ne esce
// PONDERATO per volume, ed è la misura che oggi manca al produttore.
const MKT_MARCHE = [
  { n:'Aperol',           gruppo:'Campari Group',   seg:'Aperitivi',  pen:0.74, prezzo:7.00, voce:'Spritz Aperol' },
  { n:'Campari',          gruppo:'Campari Group',   seg:'Aperitivi',  pen:0.46, prezzo:7.50, voce:'Campari Soda / Negroni' },
  { n:'Martini',          gruppo:'Bacardi',         seg:'Aperitivi',  pen:0.38, prezzo:6.50, voce:'Martini / Americano' },
  { n:'Select',           gruppo:'Montenegro',      seg:'Aperitivi',  pen:0.14, prezzo:7.00, voce:'Select Spritz' },
  { n:'Coca-Cola',        gruppo:'Coca-Cola HBC',   seg:'Bibite',     pen:0.88, prezzo:3.50, voce:'Coca-Cola 33cl' },
  { n:'Pepsi',            gruppo:'PepsiCo',         seg:'Bibite',     pen:0.12, prezzo:3.20, voce:'Pepsi 33cl' },
  { n:'Estathé',          gruppo:'Ferrero',         seg:'Bibite',     pen:0.42, prezzo:3.00, voce:'Estathé' },
  { n:'Red Bull',         gruppo:'Red Bull',        seg:'Bibite',     pen:0.24, prezzo:4.50, voce:'Red Bull 25cl' },
  { n:'Schweppes',        gruppo:'Suntory',         seg:'Bibite',     pen:0.48, prezzo:3.50, voce:'Tonica Schweppes' },
  { n:'Fever-Tree',       gruppo:'Fever-Tree',      seg:'Bibite',     pen:0.16, prezzo:5.00, voce:'Tonica Fever-Tree' },
  { n:'S. Pellegrino',    gruppo:'Sanpellegrino',   seg:'Acque',      pen:0.56, prezzo:3.00, voce:'Acqua frizzante 75cl' },
  { n:'Acqua Panna',      gruppo:'Sanpellegrino',   seg:'Acque',      pen:0.44, prezzo:3.00, voce:'Acqua naturale 75cl' },
  { n:'Ferrarelle',       gruppo:'Ferrarelle',      seg:'Acque',      pen:0.30, prezzo:2.80, voce:'Acqua effervescente 75cl' },
  { n:'Levissima',        gruppo:'Sanpellegrino',   seg:'Acque',      pen:0.22, prezzo:2.50, voce:'Acqua naturale 50cl' },
  { n:'Lauretana',        gruppo:'Lauretana',       seg:'Acque',      pen:0.09, prezzo:4.00, voce:'Acqua naturale 75cl' },
  { n:'Birra Moretti',    gruppo:'Heineken IT',     seg:'Birre',      pen:0.54, prezzo:5.00, voce:'Moretti 0,4' },
  { n:'Peroni',           gruppo:'Asahi',           seg:'Birre',      pen:0.44, prezzo:4.50, voce:'Peroni / Nastro Azzurro' },
  { n:'Heineken',         gruppo:'Heineken IT',     seg:'Birre',      pen:0.36, prezzo:5.50, voce:'Heineken 0,4' },
  { n:'Ichnusa',          gruppo:'Heineken IT',     seg:'Birre',      pen:0.24, prezzo:5.00, voce:'Ichnusa non filtrata' },
  { n:'Menabrea',         gruppo:'Forst',           seg:'Birre',      pen:0.16, prezzo:6.00, voce:'Menabrea 0,33' },
  { n:'Baladin',          gruppo:'Baladin',         seg:'Birre',      pen:0.11, prezzo:7.00, voce:'Baladin Nazionale' },
  { n:'Lavazza',          gruppo:'Lavazza',         seg:'Caffè',      pen:0.40, prezzo:1.30, voce:'Caffè espresso' },
  { n:'Illy',             gruppo:'Illy',            seg:'Caffè',      pen:0.24, prezzo:1.50, voce:'Caffè espresso' },
  { n:'Kimbo',            gruppo:'Kimbo',           seg:'Caffè',      pen:0.18, prezzo:1.20, voce:'Caffè espresso' },
];
// Chi porta cosa dipende dal mestiere: un pub ha quattro birre e zero aperitivi
// da banco, un'enoteca il contrario. Senza questo, la distribuzione esce piatta
// e non somiglia a niente.
// Le chiavi sono i codici delle otto venue_category (P-29): Trattoria e
// Osteria confluite in ristorante, il Pub in bar; le tre categorie nuove con
// affinità stimate per prossimità — stime dichiarate, non misure.
const MKT_AFFINITA = {
  'bar':           { Birre:1.2, Aperitivi:1.4, Bibite:1.2, Acque:0.9, 'Caffè':1.5 },
  'pizzeria':      { Birre:1.4, Aperitivi:0.7, Bibite:1.3, Acque:1.2, 'Caffè':1.1 },
  'enoteca':       { Birre:0.5, Aperitivi:1.4, Bibite:0.6, Acque:1.0, 'Caffè':0.8 },
  'ristorante':    { Birre:0.8, Aperitivi:1.0, Bibite:0.9, Acque:1.3, 'Caffè':1.2 },
  'bistrot':       { Birre:0.8, Aperitivi:1.3, Bibite:1.0, Acque:1.1, 'Caffè':1.2 },
  'giapponese':    { Birre:0.9, Aperitivi:0.9, Bibite:1.0, Acque:1.4, 'Caffè':0.6 },
  'carne_griglia': { Birre:1.3, Aperitivi:0.7, Bibite:1.0, Acque:1.1, 'Caffè':1.0 },
  'cucina_etnica': { Birre:1.1, Aperitivi:0.8, Bibite:1.4, Acque:1.0, 'Caffè':0.7 },
};
const mktCityMult = (citta) => CITY_PRICE_MULT[citta] ?? 0.95;

// La carta di ogni locale: quali marche ci sono e a che prezzo sono scritte.
const MKT_CARTE = (() => {
  return MKT_LOCALI.map((l, li) => {
    const r = pseudoRand(li * 7 + 13);
    const aff = MKT_AFFINITA[l.tipo] || MKT_AFFINITA['ristorante'];
    const righe = [];
    MKT_MARCHE.forEach((m) => {
      const p = Math.min(0.97, m.pen * (aff[m.seg] ?? 1));
      if (r() >= p) return;
      const prezzo = Math.round(m.prezzo * mktCityMult(l.citta) * (0.92 + r() * 0.18) * 2) / 2;
      righe.push({ marca: m.n, seg: m.seg, prezzo });
    });
    // Esclusive di fornitura: la cola è una sola in quasi tutte le carte, ed è
    // un contratto, non un caso. Stesso mestiere per il caffè, che è una
    // macchina in comodato: se ce l'hai, è di una marca sola.
    const cole = righe.filter(x => x.marca === 'Coca-Cola' || x.marca === 'Pepsi');
    if (cole.length > 1) {
      const tieni = r() < 0.88 ? 'Coca-Cola' : 'Pepsi';
      for (let i = righe.length - 1; i >= 0; i--) {
        if ((righe[i].marca === 'Coca-Cola' || righe[i].marca === 'Pepsi') && righe[i].marca !== tieni) righe.splice(i, 1);
      }
    }
    const caffe = righe.filter(x => x.seg === 'Caffè');
    if (caffe.length > 1) {
      const tieni = caffe[Math.floor(r() * caffe.length)].marca;
      for (let i = righe.length - 1; i >= 0; i--) {
        if (righe[i].seg === 'Caffè' && righe[i].marca !== tieni) righe.splice(i, 1);
      }
    }
    return { locale: l, righe };
  });
})();

// L'aggregato per marca: numerica, ponderata, prezzo, movimenti.
const MKT_DISTRIBUZIONE = (() => {
  const N = MKT_CARTE.length;
  return MKT_MARCHE.map((m, mi) => {
    const dentro = MKT_CARTE.filter(c => c.righe.some(x => x.marca === m.n));
    const righe = dentro.map(c => ({ c, riga: c.righe.find(x => x.marca === m.n) }));
    const ordini = dentro.reduce((s, c) => s + c.locale.ordiniMese, 0);
    // Distribuzione PONDERATA: non «in quante carte sono» ma «quanto volume
    // passa dalle carte in cui sono». È la differenza fra essere in venti
    // gastronomie da otto ordini al giorno ed essere in tre pizzerie da
    // duecento — e per il produttore è tutta la differenza del mondo.
    const ponderata = MKT_ORDINI_TOT > 0 ? (ordini / MKT_ORDINI_TOT) * 100 : 0;
    const numerica = N > 0 ? (dentro.length / N) * 100 : 0;
    const prezzi = righe.map(x => x.riga.prezzo);
    const prezzoMedio = prezzi.length
      ? righe.reduce((s, x) => s + x.riga.prezzo * x.c.locale.ordiniMese, 0) / (ordini || 1)
      : 0;
    // Movimenti dell'ultimo trimestre: la carta è un dato vivo, e chi entra o
    // esce da una lista prezzi è esattamente l'evento che il produttore non
    // vede mai.
    const r = pseudoRand(mi * 17 + 5);
    const entrate = Math.floor(r() * (numerica > 40 ? 3 : 2));
    const uscite = Math.floor(r() * 2);
    // Città dove la marca è più presente (quota di carte in quella città)
    const perCitta = {};
    MKT_CARTE.forEach(c => {
      const k = c.locale.citta;
      perCitta[k] = perCitta[k] || { tot: 0, con: 0 };
      perCitta[k].tot++;
      if (c.righe.some(x => x.marca === m.n)) perCitta[k].con++;
    });
    const cittaTop = Object.entries(perCitta)
      .filter(([, v]) => v.tot >= 2)
      .map(([k, v]) => ({ citta: k, pct: Math.round((v.con / v.tot) * 100), n: v.tot }))
      .sort((a, b) => b.pct - a.pct);
    return {
      ...m, locali: dentro.length, su: N,
      numerica, ponderata, ordini,
      prezzoMedio,
      prezzoMin: prezzi.length ? Math.min(...prezzi) : 0,
      prezzoMax: prezzi.length ? Math.max(...prezzi) : 0,
      entrate, uscite, cittaTop,
    };
  }).sort((a, b) => b.ponderata - a.ponderata);
})();
// Quota di segmento: dentro la stessa categoria, chi si prende le carte.
const MKT_SEGMENTI = (() => {
  const segs = [...new Set(MKT_MARCHE.map(m => m.seg))];
  return segs.map(seg => {
    const marche = MKT_DISTRIBUZIONE.filter(m => m.seg === seg);
    const tot = marche.reduce((s, m) => s + m.ponderata, 0);
    const carteConSeg = MKT_CARTE.filter(c => c.righe.some(x => x.seg === seg)).length;
    return {
      seg,
      copertura: MKT_CARTE.length ? Math.round((carteConSeg / MKT_CARTE.length) * 100) : 0,
      marche: marche.map(m => ({ n: m.n, quota: tot > 0 ? (m.ponderata / tot) * 100 : 0, ponderata: m.ponderata })),
    };
  }).sort((a, b) => b.copertura - a.copertura);
})();

// ── 2 · ELASTICITÀ ────────────────────────────────────────────────────────
// ε = variazione % della quantità / variazione % del prezzo. È negativa: se
// vale −1,2 vuol dire che a un aumento del 10% la domanda cala del 12%, e che
// quell'aumento fa PERDERE ricavo. La soglia è ε = −1: sopra si guadagna, sotto
// si perde, e nessun ristoratore in Italia oggi sa da che parte sta.
//
// Metodo: si guardano solo i cambi di listino ≥3% su piatti con almeno 60
// ordini/mese nel locale, e si confronta il salto di volume con quello degli
// STESSI piatti nei locali che il prezzo non l'hanno toccato (controllo). È
// quello che toglie di mezzo la stagionalità: se ad agosto cala la carbonara
// cala per tutti, non per chi ha ritoccato il prezzo.
const MKT_ELAST_METODO = { sogliaPrezzo: 3, minOrdini: 60, finestra: 8 };
const MKT_ELASTICITA = (() => {
  // Elasticità di base per piatto: alta dove esiste un prezzo di riferimento in
  // testa al cliente (la margherita), bassa dove il piatto è un'occasione (la
  // fiorentina, il calice al banco).
  const base = [
    { piatto:'Pizza Margherita', cat:'Pizza',    eps:-1.18 },
    { piatto:'Pizza Diavola',    cat:'Pizza',    eps:-1.02 },
    { piatto:'Carbonara',        cat:'Primi',    eps:-0.86 },
    { piatto:'Cacio e Pepe',     cat:'Primi',    eps:-0.79 },
    { piatto:'Poke bowl',        cat:'Street',   eps:-1.34 },
    { piatto:'Burger classico',  cat:'Street',   eps:-1.11 },
    { piatto:'Tagliata di manzo',cat:'Secondi',  eps:-0.52 },
    { piatto:'Bistecca alla Fiorentina', cat:'Secondi', eps:-0.28 },
    { piatto:'Spritz Aperol',    cat:'Drink',    eps:-0.41 },
    { piatto:'Tiramisù',         cat:'Dolci',    eps:-0.63 },
  ];
  // La sensibilità è anche geografica: dove il piatto è identità locale, il
  // prezzo di riferimento è più rigido e il cliente se ne accorge prima.
  const cittaMult = {
    'Napoli':  { Pizza:1.62, default:1.12 },
    'Milano':  { Pizza:0.74, Secondi:0.72, default:0.80 },
    'Roma':    { Primi:1.28, default:1.00 },
    'Firenze': { Secondi:0.68, default:0.92 },
    'Bologna': { default:1.02 },
    'Torino':  { default:0.96 },
    'Bari':    { default:1.18 },
    'Palermo': { default:1.24 },
  };
  return base.map((b, i) => {
    const r = pseudoRand(i * 23 + 3);
    const perCitta = Object.keys(cittaMult).map(c => {
      const m = cittaMult[c][b.cat] ?? cittaMult[c].default;
      const eps = +(b.eps * m).toFixed(2);
      const eventi = 3 + Math.floor(r() * 9);
      // L'intervallo si stringe con gli eventi osservati: con quattro cambi di
      // prezzo non si dichiara la seconda cifra decimale.
      const ic = +(0.42 / Math.sqrt(eventi)).toFixed(2);
      return { citta: c, eps, eventi, ic, locali: 1 + Math.floor(r() * 4) };
    }).sort((a, b2) => a.eps - b2.eps);
    const eventiTot = perCitta.reduce((s, c) => s + c.eventi, 0);
    const epsMedio = +(perCitta.reduce((s, c) => s + c.eps * c.eventi, 0) / eventiTot).toFixed(2);
    return { ...b, perCitta, eventiTot, epsMedio, prezzo: dishBasePrice(b.piatto) };
  });
})();
// Effetto sul ricavo di un ritocco: +Δ% di prezzo con elasticità ε.
const mktEffettoRicavo = (eps, deltaPct) => {
  const p = 1 + deltaPct / 100;
  const q = 1 + (eps * deltaPct) / 100;
  return (p * q - 1) * 100;
};

// ── 3 · ABBINAMENTO (tasso di attacco) ────────────────────────────────────
// «Attacco» = su cento scontrini che contengono quel piatto, quanti contengono
// anche quella bevanda. Il `lift` dice se è un abbinamento vero o solo un
// prodotto che vende tanto ovunque: lift 1,0 = coincidenza, 1,8 = il piatto
// TIRA la bevanda. Per il produttore è la mappa di dove spingere; per noi è
// dove il gestionale può suggerire l'upsell al cameriere.
const MKT_ATTACCO = (() => {
  const coppie = [
    { piatto:'Pizza Margherita', bev:'Birra Moretti',  attach:44, base:26 },
    { piatto:'Pizza Diavola',    bev:'Birra Moretti',  attach:48, base:26 },
    { piatto:'Pizza Margherita', bev:'Coca-Cola',      attach:31, base:22 },
    { piatto:'Burger classico',  bev:'Coca-Cola',      attach:52, base:22 },
    { piatto:'Burger gourmet',   bev:'Baladin',        attach:24, base: 6 },
    { piatto:'Tagliere salumi e formaggi', bev:'Aperol', attach:39, base:17 },
    { piatto:'Bruschette miste', bev:'Aperol',         attach:46, base:17 },
    { piatto:'Polpo alla griglia', bev:'S. Pellegrino',attach:34, base:24 },
    { piatto:'Carbonara',        bev:'Vino rosso della casa', attach:29, base:19 },
    { piatto:'Bistecca alla Fiorentina', bev:'Vino rosso della casa', attach:58, base:19 },
    { piatto:'Sushi mix',        bev:'Heineken',       attach:27, base:14 },
    { piatto:'Poke bowl',        bev:'Levissima',      attach:21, base: 9 },
    { piatto:'Tiramisù',         bev:'Lavazza',        attach:41, base:23 },
    { piatto:'Cannoli siciliani',bev:'Lavazza',        attach:44, base:23 },
    { piatto:'Tacos',            bev:'Red Bull',       attach: 9, base: 5 },
  ];
  return coppie.map(c => ({
    ...c,
    lift: +(c.attach / c.base).toFixed(2),
    // Quanto vale spostare l'attacco al livello del quartile alto della rete:
    // è la stessa cifra che il produttore userebbe per giustificare una
    // promozione, e che noi useremmo per giustificare un suggerimento a schermo.
    upside: Math.max(0, Math.round((Math.min(72, c.attach * 1.35) - c.attach))),
  })).sort((a, b) => b.lift - a.lift);
})();
// Il valore economico dell'upsell, sul volume vero della rete.
const MKT_UPSELL = (() => {
  const scontrinoBevanda = 4.6;         // prezzo medio di una bevanda a carta
  const ordiniMese = MKT_ORDINI_TOT;
  const coperturaCoppie = 0.42;         // quota di ordini che contiene uno dei piatti mappati
  const puntiRecuperabili = MKT_ATTACCO.reduce((s, c) => s + c.upside, 0) / MKT_ATTACCO.length;
  const ordiniInteressati = ordiniMese * coperturaCoppie;
  const bevandeInPiu = ordiniInteressati * (puntiRecuperabili / 100);
  return {
    scontrinoBevanda, puntiRecuperabili: +puntiRecuperabili.toFixed(1),
    bevandeInPiu: Math.round(bevandeInPiu),
    valoreMese: Math.round(bevandeInPiu * scontrinoBevanda),
    valoreAnno: Math.round(bevandeInPiu * scontrinoBevanda * 12),
  };
})();

// ── 4 · ROTAZIONE DELLE CARTE ─────────────────────────────────────────────
// Ogni modifica di menu è un evento con una data. La rotazione dice quanto si
// muove una carta in un trimestre; gli ingredienti in ingresso dicono cosa sta
// entrando nel gusto collettivo — e lo dicono PRIMA del carrello della spesa,
// perché fuori casa si prova, a casa si ricompra.
const MKT_ROTAZIONE = (() => {
  // Per codice di categoria; le voci si leggono da MKT_VOCI_BASE invece di
  // essere ricopiate. Le tre categorie che i mock non hanno restano in
  // tabella e spariscono dalla lista con «presenti».
  const perTipo = [
    { tipo:'bistrot',       pct:24 },
    { tipo:'giapponese',    pct:21 },
    { tipo:'ristorante',    pct:19 },
    { tipo:'cucina_etnica', pct:16 },
    { tipo:'bar',           pct:15 },
    { tipo:'carne_griglia', pct:13 },
    { tipo:'enoteca',       pct:11 },
    { tipo:'pizzeria',      pct: 7 },
  ].map(t => ({ ...t, voci: MKT_VOCI_BASE[t.tipo] }));
  const presenti = perTipo.filter(t => MKT_LOCALI.some(l => l.tipo === t.tipo));
  const media = presenti.length
    ? presenti.reduce((s, t) => s + t.pct * t.voci, 0) / presenti.reduce((s, t) => s + t.voci, 0)
    : 0;
  return { perTipo: presenti, media: +media.toFixed(1) };
})();
// Diffusione di un ingrediente: in quante carte sta, trimestre per trimestre.
const MKT_INGREDIENTI = [
  { n:'Pistacchio di Bronte', serie:[4, 7, 12, 19, 26], stato:'in salita' },
  { n:'’Nduja',          serie:[9, 12, 14, 17, 21], stato:'in salita' },
  { n:'Tahina',               serie:[1, 2, 4, 7, 11],   stato:'in salita' },
  { n:'Kimchi',               serie:[0, 1, 3, 5, 8],    stato:'in salita' },
  { n:'Datterino giallo',     serie:[6, 9, 13, 16, 18], stato:'in salita' },
  { n:'Guanciale',            serie:[22, 23, 23, 24, 24], stato:'stabile' },
  { n:'Farina di grillo',     serie:[3, 4, 3, 2, 1],    stato:'in uscita' },
  { n:'Riccio di mare',       serie:[5, 5, 4, 3, 3],    stato:'in uscita' },
];
const MKT_TRIMESTRI = ['T2 25', 'T3 25', 'T4 25', 'T1 26', 'T2 26'];

// ── 5 · INTENSITÀ DI LAVORO PER COPERTO ───────────────────────────────────
// Quante azioni servono per servire un coperto: aperture conto, comande,
// modifiche, invii in cucina, incassi. Non è un dato di soddisfazione, è un
// dato di COSTO — e nessuno ce l'ha, perché nessuno registra il gesto del
// cameriere con un timestamp. Noi sì, perché passa dal gestionale.
const MKT_INTENSITA = (() => {
  // I minuti di sala per coperto si leggono da PAR.MINUTI_SALA: erano una
  // terza copia della stessa tabella.
  const perTipo = [
    { tipo:'ristorante',    azioni:11.4 },
    { tipo:'giapponese',    azioni: 9.5 },
    { tipo:'carne_griglia', azioni: 8.6 },
    { tipo:'cucina_etnica', azioni: 8.2 },
    { tipo:'bistrot',       azioni: 7.9 },
    { tipo:'enoteca',       azioni: 7.2 },
    { tipo:'pizzeria',      azioni: 6.3 },
    { tipo:'bar',           azioni: 3.8 },
  ].map(t => ({ ...t, minuti: PAR.MINUTI_SALA[t.tipo], coperti:0 }));
  const conDati = perTipo.map(t => {
    const gruppo = MKT_LOCALI.filter(l => l.tipo === t.tipo);
    return { ...t, locali: gruppo.length, coperti: gruppo.reduce((s, l) => s + l.coperti, 0) };
  }).filter(t => t.locali > 0);
  const azioniMedie = conDati.reduce((s, t) => s + t.azioni * t.coperti, 0) / (conDati.reduce((s, t) => s + t.coperti, 0) || 1);
  const minutiMedi = conDati.reduce((s, t) => s + t.minuti * t.coperti, 0) / (conDati.reduce((s, t) => s + t.coperti, 0) || 1);
  // Il costo del lavoro di sala per coperto: 13,20 €/h lordo azienda è la
  // tariffa media di un cameriere a contratto pubblici esercizi.
  const COSTO_ORA = 13.20;
  return {
    perTipo: conDati.sort((a, b) => b.azioni - a.azioni),
    azioniMedie: +azioniMedie.toFixed(1),
    minutiMedi: +minutiMedi.toFixed(1),
    costoOra: COSTO_ORA,
    costoCoperto: +((minutiMedi / 60) * COSTO_ORA).toFixed(2),
    // La quota di azioni che l'ordine da app toglie di mezzo: è la stessa cosa
    // che il listino sconta pesando 0,5 l'ordine in app.
    risparmioApp: 38,
  };
})();

// ── 6 · DEMOGRAFIA D'IMPRESA ──────────────────────────────────────────────
// Un locale non chiude di colpo: prima smette di aggiornare la carta, poi cala
// di volume, poi il titolare entra sempre meno. Il registro imprese quella
// storia la scrive alla fine, mesi dopo. Noi la vediamo mentre succede.
const MKT_SPEGNIMENTO = (() => {
  const oggi = Date.now();
  const righe = MKT_LOCALI.map((l, i) => {
    const r = pseudoRand(i * 11 + 29);
    const giorniLogin = Math.floor((oggi - l.lastLogin.getTime()) / 86400000);
    const giorniMenu = Math.floor(r() * (l.stato === 'inactive' ? 210 : 90));
    // Il calo di volume: gli inattivi lo hanno per definizione, gli attivi lo
    // pescano dalla coda di chi sta scendendo.
    const caloOrdini = l.stato === 'inactive'
      ? -(28 + Math.floor(r() * 45))
      : -Math.floor(r() * 34);
    // Punteggio: quattro segnali, ognuno con la sua soglia. Non è un modello
    // addestrato — è una regola dichiarata, e va letta come tale.
    const s1 = giorniLogin >= 30 ? 30 : giorniLogin >= 14 ? 16 : 0;
    const s2 = giorniMenu >= 120 ? 25 : giorniMenu >= 60 ? 12 : 0;
    const s3 = caloOrdini <= -40 ? 30 : caloOrdini <= -20 ? 15 : 0;
    const s4 = (l.qrAdoption ?? 0) < 2 ? 10 : 0;
    const score = s1 + s2 + s3 + s4;
    return {
      id: l.id, nome: l.nome, citta: l.citta, tipo: l.tipo, stato: l.stato,
      giorniLogin, giorniMenu, caloOrdini, score,
      livello: score >= 65 ? 'spento' : score >= 40 ? 'in calo' : score >= 20 ? 'da guardare' : 'regolare',
    };
  }).sort((a, b) => b.score - a.score);
  const conta = (lv) => righe.filter(r => r.livello === lv).length;
  return {
    righe,
    critici: righe.filter(r => r.score >= 40),
    conteggi: { spento: conta('spento'), calo: conta('in calo'), guardare: conta('da guardare'), regolare: conta('regolare') },
    // ONESTÀ: il vantaggio sul registro è una promessa, non una misura. Le
    // chiusure vere osservate finora sono due, e con due casi non si dichiara
    // una media — si dichiara che il segnale c'era.
    validazione: { chiusureOsservate: LOCALI.filter(locChurned).length, anticipoOsservatoMesi: [4, 7] },
  };
})();

// ── 7 · INDICE PREZZI DEI MENU ────────────────────────────────────────────
// Un paniere di piatti pesato sui volumi veri della rete, ricalcolato ogni
// volta che un locale tocca il listino. ISTAT lo stesso numero lo pubblica per
// i «servizi di ristorazione» a metà del mese dopo, su un campione di
// rilevatori. Il nostro è continuo e ha dentro il prezzo scritto, non
// dichiarato.
const MKT_INDICE = (() => {
  const mesi = ['Giu 25','Lug 25','Ago 25','Set 25','Ott 25','Nov 25','Dic 25','Gen 26','Feb 26','Mar 26','Apr 26','Mag 26'];
  // Pesi del paniere = quota di ordini per categoria (gli stessi volumi che
  // stanno nella tabella food cost).
  const pesi = { Pizza:0.26, Primi:0.21, Secondi:0.14, Antipasti:0.10, Street:0.09, Dolci:0.08, Drink:0.12 };
  const catDi = (n) => (DISH_LOOKUP[n] || {}).cat || 'Primi';
  const serie = mesi.map((_, i) => {
    let num = 0, den = 0;
    DISH_CATALOG.forEach(d => {
      const peso = pesi[catDi(d.n)] ?? 0.1;
      const infl = DISH_INFLATION[d.n] || DISH_INFLATION.default;
      const stag = (DISH_PRICE_SEASONAL[d.n] || DISH_PRICE_SEASONAL_DEFAULT)[i] / 100;
      // Indice ricostruito all'indietro: il mese 11 è oggi (=100 + inflazione
      // dell'anno), il mese 0 è la base.
      const val = 100 * (1 + (infl / 100) * (i / 11) + stag);
      num += val * peso; den += peso;
    });
    return +(num / den).toFixed(2);
  });
  const oggi = serie[11], baseAnno = serie[0];
  const annuo = +(((oggi - baseAnno) / baseAnno) * 100).toFixed(2);
  // ISTAT, serie pubblicata: stessa direzione, meno reattiva, e ferma al mese
  // scorso. Il confronto serve a mostrare il ritardo, non a dire chi ha ragione.
  const istat = serie.map((v, i) => +(100 + (v - 100) * 0.82).toFixed(2));
  const istatAnnuo = +(((istat[11] - istat[0]) / istat[0]) * 100).toFixed(2);
  const perCategoria = Object.keys(pesi).map(cat => {
    const piatti = DISH_CATALOG.filter(d => d.cat === cat);
    const inf = piatti.reduce((s, d) => s + (DISH_INFLATION[d.n] || DISH_INFLATION.default), 0) / (piatti.length || 1);
    return { cat, annuo: +inf.toFixed(1), peso: Math.round((pesi[cat] ?? 0) * 100) };
  }).sort((a, b) => b.annuo - a.annuo);
  const perCitta = Object.keys(CITY_PRICE_MULT).map(c => {
    const r = pseudoRand(c.length * 13 + c.charCodeAt(0));
    return { citta: c, annuo: +(annuo * (0.72 + r() * 0.62)).toFixed(1), livello: CITY_PRICE_MULT[c] };
  }).sort((a, b) => b.annuo - a.annuo);
  return { mesi, serie, istat, annuo, istatAnnuo, perCategoria, perCitta, ritardoIstatGiorni: 15,
    // Quante volte al mese il paniere si aggiorna da solo: ogni modifica di
    // listino è un ricalcolo.
    modificheMese: Math.round(MKT_LOCALI.length * 3.4) };
})();

window.MKT_LOCALI = MKT_LOCALI;
window.MKT_ORDINI_TOT = MKT_ORDINI_TOT;
window.MKT_VOCI_TOT = MKT_VOCI_TOT;
window.MKT_VOCI_BEVANDA = MKT_VOCI_BEVANDA;
window.MKT_MARCHE = MKT_MARCHE;
window.MKT_CARTE = MKT_CARTE;
window.MKT_DISTRIBUZIONE = MKT_DISTRIBUZIONE;
window.MKT_SEGMENTI = MKT_SEGMENTI;
window.MKT_ELASTICITA = MKT_ELASTICITA;
window.MKT_ELAST_METODO = MKT_ELAST_METODO;
window.mktEffettoRicavo = mktEffettoRicavo;
window.MKT_ATTACCO = MKT_ATTACCO;
window.MKT_UPSELL = MKT_UPSELL;
window.MKT_ROTAZIONE = MKT_ROTAZIONE;
window.MKT_INGREDIENTI = MKT_INGREDIENTI;
window.MKT_TRIMESTRI = MKT_TRIMESTRI;
window.MKT_INTENSITA = MKT_INTENSITA;
window.MKT_SPEGNIMENTO = MKT_SPEGNIMENTO;
window.MKT_INDICE = MKT_INDICE;
