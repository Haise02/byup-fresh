// Economix — il motore. Nessun numero futuro è scritto: tutto è calcolato.
//
// PERCHÉ NON UN MODELLO DI SERIE STORICA. ARIMA e simili proiettano la curva
// dei ricavi senza sapere perché sale, e su tredici punti sono rumore travestito
// da statistica. Il modello guidato dai driver fa l'opposto: proietta la cosa
// che genera tutto — i locali attivi — e poi ogni riga diventa una formula. Si
// può difendere riga per riga, ed è l'unica proprietà che conta quando qualcuno
// chiede "e questo numero da dove esce".

// ─── Regressione lineare ai minimi quadrati ────────────────────────────────
// Restituisce anche r²: se la retta spiega male i dati va detto, non nascosto.
function ecoRegressione(y) {
  const n = y.length;
  if (n < 2) return { a:0, b: y[0] || 0, r2:0 };
  const sx = (n - 1) * n / 2;
  const sy = y.reduce((s, v) => s + v, 0);
  const sxx = y.reduce((s, _, i) => s + i * i, 0);
  const sxy = y.reduce((s, v, i) => s + i * v, 0);
  const den = n * sxx - sx * sx;
  const a = den === 0 ? 0 : (n * sxy - sx * sy) / den;   // pendenza
  const b = (sy - a * sx) / n;                            // intercetta
  const media = sy / n;
  const ssTot = y.reduce((s, v) => s + (v - media) ** 2, 0);
  const ssRes = y.reduce((s, v, i) => s + (v - (a * i + b)) ** 2, 0);
  return { a, b, r2: ssTot === 0 ? 1 : 1 - ssRes / ssTot };
}

// ─── Le leve del modello ───────────────────────────────────────────────────
// Ricavate dallo storico, ma tutte modificabili: è il punto della schermata.
function ecoLeveIniziali() {
  const st = ECO_STORICO.filter(m => !m.corrente);          // il mese in corso è parziale
  const regNuovi = ecoRegressione(st.map(m => m.nuoviLocali));
  const ultimo = st[st.length - 1];
  const churnMedio = st.slice(-6).reduce((s, m) => s + m.churn / Math.max(1, m.localiAttivi), 0) / 6;
  return {
    nuoviLocaliMese: Math.max(0, Math.round((regNuovi.a * st.length + regNuovi.b) * 10) / 10),
    churnMensile: Math.round(churnMedio * 1000) / 10,      // %
    ordiniPerLocale: ultimo.ordiniPerLocale,
    quotaApp: Math.round(ultimo.quotaApp * 100),           // %
    utentiPerLocale: Math.round(ultimo.utentiApp / ultimo.localiAttivi),
    _r2: regNuovi.r2,
  };
}

// ─── Proiezione dei driver fino a fine anno ────────────────────────────────
function ecoProiettaDriver(leve) {
  const st = ECO_STORICO;
  const corrente = st[st.length - 1];
  const out = [];
  let attivi = corrente.localiAttivi;
  const anno = ECO_OGGI.getFullYear();
  for (let m = ECO_OGGI.getMonth(); m <= 11; m++) {
    const d = new Date(anno, m, 1);
    const primo = m === ECO_OGGI.getMonth();
    if (!primo) {
      attivi = Math.max(1, Math.round(attivi * (1 - leve.churnMensile / 100) + leve.nuoviLocaliMese));
    }
    const transazioni = Math.round(attivi * leve.ordiniPerLocale);
    const qa = leve.quotaApp / 100;
    out.push({
      mese: ecoEtichettaMese(d), data:d, primo,
      localiAttivi: attivi,
      nuoviLocali: primo ? corrente.nuoviLocali : leve.nuoviLocaliMese,
      transazioni,
      transazioniPesate: Math.round(transazioni * (qa * 0.5 + (1 - qa) * 1.0)),
      utentiApp: Math.round(attivi * leve.utentiPerLocale),
      fisso: 1,
    });
  }
  return out;
}

// ─── Costo di un servizio in un mese ───────────────────────────────────────
const ecoConsumo = (s, d) => (d[s.driver] || 0) * s.perUnita;
const ecoCostoServizio = (s, d) => ecoConsumo(s, d) * s.prezzo;

// Lettura reale contro stima. Se il fornitore e collegato il consuntivo del mese
// arriva da lui e vale piu della stima; `scarto` e il rapporto fra i due, ed e
// la cosa da guardare: uno scarto grande dice che il prezzo unitario o il
// consumo per unita non sono quelli scritti nel modello.
function ecoLettura(s, d, frazione) {
  const stimaMese = ecoCostoServizio(s, d);
  const c = ecoConnessioneDi(s.id);
  const collegato = !!c && c.stato === 'collegato';
  if (!collegato) return { collegato:false, stimaMese, valoreMese:stimaMese, aOggi:stimaMese * frazione, scarto:null };
  const reale = stimaMese * (s.scarto || 1);
  return { collegato:true, stimaMese, valoreMese:reale, aOggi:reale * frazione,
    scarto: stimaMese ? (reale - stimaMese) / stimaMese * 100 : 0, letto:c.ultimaLettura };
}

// Collega o scollega una credenziale. Collegando, ai servizi che copre viene
// assegnato uno scarto: e cio che accadrebbe leggendo davvero il fornitore,
// perche la stima non azzecca mai il consuntivo al centesimo.
function ecoCollega(conn, attiva) {
  conn.stato = attiva ? 'collegato' : 'scollegato';
  conn.ultimaLettura = attiva ? new Date() : null;
  if (attiva) {
    conn.servizi.forEach((id, k) => {
      const s = ECO_SERVIZI.find(x => x.id === id);
      if (s && !s.scarto) s.scarto = 1 + ((k % 3) - 1) * 0.058 + 0.031;
    });
    const sc = conn.servizi.map(id => (ECO_SERVIZI.find(x => x.id === id) || {}).scarto || 1);
    conn.scartoPct = sc.length ? (sc.reduce((a, b) => a + b, 0) / sc.length - 1) * 100 : null;
  } else {
    conn.scartoPct = null;
  }
}
const ecoAggiorna = (conn) => { conn.ultimaLettura = new Date(); };
const ecoCostiVariabili = (d) => ECO_SERVIZI.reduce((tot, s) => tot + ecoCostoServizio(s, d), 0);

// ─── Costi fissi di competenza di un mese ──────────────────────────────────
// L'una tantum pesa solo sul mese in cui è avvenuta; l'annuale si spalma in
// dodicesimi, altrimenti un mese qualsiasi sembrerebbe disastroso e gli altri
// undici sani.
function ecoFissiDelMese(d) {
  return ECO_FISSI.reduce((tot, f) => {
    if (f.dal && d < new Date(f.dal.getFullYear(), f.dal.getMonth(), 1)) return tot;
    if (f.a && d > f.a) return tot;
    if (f.periodicita === 'mensile')  return tot + f.importo;
    if (f.periodicita === 'annuale')  return tot + f.importo / 12;
    // una tantum: solo nel suo mese
    return tot + (f.dal.getFullYear() === d.getFullYear() && f.dal.getMonth() === d.getMonth() ? f.importo : 0);
  }, 0);
}

// ─── Ricavi di un mese ─────────────────────────────────────────────────────
// Il mix per piano viene dalla base reale dei locali attivi e resta costante
// nella proiezione: ipotizzare che migliori da solo sarebbe la scorciatoia più
// comune per gonfiare un piano.
function ecoMixPiani() {
  const attivi = (typeof LOCALI !== 'undefined' ? LOCALI : []).filter(l => l.stato === 'active');
  const tot = attivi.length || 1;
  return PIANI.map(p => ({ ...p, quota: attivi.filter(l => l.piano === p.id).length / tot }));
}
function ecoRicavi(d, mix) {
  let sub = 0, extra = 0;
  mix.forEach(p => {
    const n = d.localiAttivi * p.quota;
    sub += n * p.price;
    const pesatePerLocale = d.transazioniPesate / Math.max(1, d.localiAttivi);
    const oltre = Math.max(0, pesatePerLocale - p.ordiniInclusi);
    extra += n * oltre * p.ordineExtra;
  });
  return { sub, extra, totale: sub + extra };
}

// ─── Imposte ───────────────────────────────────────────────────────────────
// Le perdite pregresse assorbono l'imponibile prima delle aliquote. Nei primi
// tre esercizi si usano al 100%, dopo fino all'80% del reddito: la differenza
// non è teorica, decide se l'imposta è zero o no.
function ecoImposte(utileAnteImposte, regime) {
  if (utileAnteImposte <= 0) {
    return { imponibile:0, usoPerdite:0, ires:0, irap:0, totale:0, perditeResidue: regime.perditePregresse - utileAnteImposte };
  }
  const tetto = regime.primiTreEsercizi ? utileAnteImposte : utileAnteImposte * 0.8;
  const usoPerdite = Math.min(regime.perditePregresse, tetto);
  const imponibile = utileAnteImposte - usoPerdite;
  const ires = imponibile * regime.ires / 100;
  // L'IRAP ha una base imponibile sua e non ammette le perdite IRES: qui è
  // approssimata sul risultato ante imposte, ed è dichiarato.
  const irap = Math.max(0, utileAnteImposte) * regime.irap / 100;
  return { imponibile, usoPerdite, ires, irap, totale: ires + irap,
    perditeResidue: regime.perditePregresse - usoPerdite };
}

// ─── Conto economico riclassificato a margine di contribuzione ─────────────
// È la forma giusta per un SaaS: separa ciò che cresce col volume da ciò che
// resta comunque, e il margine di contribuzione dice se ogni locale in più
// porta o brucia denaro.
function ecoContoEconomico(mesi, mix, regime) {
  const r = mesi.reduce((acc, d) => {
    const ric = ecoRicavi(d, mix);
    acc.sub += ric.sub; acc.extra += ric.extra;
    acc.variabili += ecoCostiVariabili(d);
    acc.fissi += ecoFissiDelMese(d.data);
    return acc;
  }, { sub:0, extra:0, variabili:0, fissi:0 });

  const ricavi = r.sub + r.extra;
  const margineContribuzione = ricavi - r.variabili;
  const ebitda = margineContribuzione - r.fissi;
  const ammortamenti = 0;                       // nessun cespite capitalizzato
  const ebit = ebitda - ammortamenti;
  const oneriFinanziari = 0;
  const ante = ebit - oneriFinanziari;
  const imposte = ecoImposte(ante, regime);
  return {
    sub:r.sub, extra:r.extra, ricavi,
    variabili:r.variabili, margineContribuzione,
    mcPercento: ricavi ? margineContribuzione / ricavi * 100 : 0,
    fissi:r.fissi, ebitda, ebitdaPercento: ricavi ? ebitda / ricavi * 100 : 0,
    ammortamenti, ebit, oneriFinanziari, ante, imposte, netto: ante - imposte.totale,
  };
}

// ─── Il mese in corso, mentre si spende ────────────────────────────────────
// Consuntivo a oggi e proiezione a fine mese. La proiezione lineare sui giorni
// trascorsi è grezza ma onesta: sui costi a consumo il ritmo è quasi costante,
// e presentarla come più precisa di così sarebbe falso.
function ecoMeseCorrente(mix) {
  const d = ECO_STORICO[ECO_STORICO.length - 1];
  const giorni = ecoGiorniNelMese(ECO_OGGI);
  const trascorsi = ECO_OGGI.getDate();
  const frazione = trascorsi / giorni;
  const righe = ECO_SERVIZI.map(s => {
    const l = ecoLettura(s, d, frazione);
    return { s, l, aOggi:l.aOggi, fineMese:l.valoreMese, consumoPieno: ecoConsumo(s, d) };
  });
  const variabiliOggi = righe.reduce((t, r) => t + r.aOggi, 0);
  const variabiliFine = righe.reduce((t, r) => t + r.fineMese, 0);
  const fissi = ecoFissiDelMese(new Date(ECO_OGGI.getFullYear(), ECO_OGGI.getMonth(), 1));
  const ric = ecoRicavi(d, mix);
  return { d, giorni, trascorsi, frazione, righe, variabiliOggi, variabiliFine,
    fissi, ricavi:ric, bruciatoOggi: variabiliOggi + fissi * frazione,
    bruciatoFine: variabiliFine + fissi };
}

window.ecoRegressione = ecoRegressione;
window.ecoLeveIniziali = ecoLeveIniziali;
window.ecoProiettaDriver = ecoProiettaDriver;
window.ecoConsumo = ecoConsumo;
window.ecoLettura = ecoLettura;
window.ecoCollega = ecoCollega;
window.ecoAggiorna = ecoAggiorna;
window.ecoCostoServizio = ecoCostoServizio;
window.ecoCostiVariabili = ecoCostiVariabili;
window.ecoFissiDelMese = ecoFissiDelMese;
window.ecoMixPiani = ecoMixPiani;
window.ecoRicavi = ecoRicavi;
window.ecoImposte = ecoImposte;
window.ecoContoEconomico = ecoContoEconomico;
window.ecoMeseCorrente = ecoMeseCorrente;
