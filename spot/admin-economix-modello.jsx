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
  const tutti = ECO_STORICO.filter(m => !m.corrente);       // il mese in corso è parziale
  // Regressione sugli ULTIMI DODICI mesi chiusi, non su tutta la storia: una
  // retta tirata dall'inizio pesa un anno fa quanto il mese scorso, e su una
  // curva che accelera restituisce una pendenza troppo bassa.
  const st = tutti.slice(-12);
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
// Sui servizi a pacchetto il prezzo unitario non e quello scritto sul servizio:
// e quello del taglio acquistato. Cambiando taglio cambia il costo di ogni riga
// futura, ed e il motivo per cui la scelta del pacchetto sta nel modello.
const ecoPrezzo = (s) => {
  const pk = s.pacchetti && ECO_PACCHETTI[s.pacchetti];
  return pk ? ecoPrezzoUnitario(ecoTaglio(pk, pk.attivo)) : s.prezzo;
};
const ecoCostoServizio = (s, d) => ecoConsumo(s, d) * ecoPrezzo(s);

// Lettura reale contro stima. Se il fornitore e collegato il consuntivo del mese
// arriva da lui e vale piu della stima; `scarto` e il rapporto fra i due, ed e
// la cosa da guardare: uno scarto grande dice che il prezzo unitario o il
// consumo per unita non sono quelli scritti nel modello.
function ecoLettura(s, d, frazione) {
  const stimaMese = ecoCostoServizio(s, d);
  const c = ecoConnessioneDi(s.id);
  const collegato = !!c && c.stato === 'attivo';
  if (!collegato) return { collegato:false, stimaMese, valoreMese:stimaMese, aOggi:stimaMese * frazione, scarto:null };
  const reale = stimaMese * (s.scarto || 1);
  return { collegato:true, stimaMese, valoreMese:reale, aOggi:reale * frazione,
    scarto: stimaMese ? (reale - stimaMese) / stimaMese * 100 : 0, letto:c.ultimaLettura };
}

// Rilettura forzata di una sorgente attiva. E l'unica azione legittima su un
// collegamento dal backoffice: non riconfigura nulla, chiede solo un giro di
// lettura adesso invece che al prossimo ciclo.
const ecoRileggi = (conn) => { conn.ultimaLettura = new Date(); };

// Lettura manuale: e vera immissione di dati, non configurazione, e per questo
// resta un'azione della schermata.
function ecoLetturaManuale(conn, importo) {
  conn.ultimaLettura = new Date();
  conn.importoManuale = importo;
}

// Da quanti giorni una sorgente non risponde. Finche non risponde, le sue righe
// sono stime: il numero di giorni dice quanto e vecchia l'ultima verita.
function ecoGiorniInErrore(conn) {
  if (conn.stato !== 'errore' || !conn.erroreDal) return 0;
  return Math.max(1, Math.round((Date.now() - conn.erroreDal.getTime()) / 86400000));
}

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
  const ammortamenti = 0;
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
// trascorsi è grezza ma onesta: sui costi a consumo il ritmo è quasi costante.
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

// ─── Flussi di cassa ───────────────────────────────────────────────────────
// Un mese di cassa non e un mese di conto economico: gli incassi arrivano con
// pochi giorni di ritardo, i pagamenti con trenta. Su un mese solo la differenza
// e piccola; su una societa che cresce e' esattamente il buco che ti fa mancare
// i soldi mentre il conto economico migliora.
function ecoFlussiMese(m, mix) {
  const ric = ecoRicavi(m, mix);
  const prec = ECO_STORICO[ECO_STORICO.indexOf(m) - 1] || m;
  const dataM = new Date(m.data.getFullYear(), m.data.getMonth(), 1);
  // Incassi: ricavi del mese, con lo sfasamento medio dell'addebito.
  const incassi = ric.totale;
  // Pagamenti: i costi di competenza del mese PRECEDENTE, perche si pagano a 30
  // giorni. I costi a consumo del mese in corso escono il mese prossimo.
  const uscite = ecoCostiVariabili(prec) + ecoFissiDelMese(new Date(prec.data.getFullYear(), prec.data.getMonth(), 1));
  // IVA: a debito sulle vendite, a credito sugli acquisti nazionali. I fornitori
  // esteri sono in reverse charge e non generano credito.
  const ivaVendite = ric.totale * 0.22;
  const ivaAcquisti = ecoFissiDelMese(dataM) * 0.22 * 0.55;   // solo i fornitori italiani
  return { m, incassi, uscite, ivaVendite, ivaAcquisti, ivaNetta: ivaVendite - ivaAcquisti,
    netto: incassi - uscite };
}

// Proiezione della cassa: saldo di partenza, poi mese per mese entrate meno
// uscite meno IVA versata. Il numero che conta e uno solo — quando finisce.
function ecoProiezioneCassa(mix, leve) {
  const futuri = ecoProiettaDriver(leve);
  let saldo = ECO_CASSA.saldoBanca + ECO_CASSA.saldoContanti;
  const out = [];
  futuri.forEach((d, i) => {
    const ric = ecoRicavi(d, mix);
    const costi = ecoCostiVariabili(d) + ecoFissiDelMese(d.data);
    // L'IVA si versa il 16 del mese successivo al trimestre: qui approssimata
    // in dodicesimi mensili, e dichiarato.
    const iva = Math.max(0, ric.totale * 0.22 - costi * 0.22 * 0.55);
    const scad = ECO_SCADENZE.filter(x => x.importo && x.quando.getFullYear() === d.data.getFullYear()
      && x.quando.getMonth() === d.data.getMonth()).reduce((t, x) => t + x.importo, 0);
    const netto = ric.totale - costi - iva - scad;
    saldo += netto;
    out.push({ d, ricavi:ric.totale, costi, iva, scadenze:scad, netto, saldo, i });
  });
  return out;
}

// Autonomia: quanti mesi prima che la cassa finisca al ritmo attuale.
function ecoRunway(cassa) {
  const negativo = cassa.find(x => x.saldo <= 0);
  if (!negativo) {
    const ultimo = cassa[cassa.length - 1];
    const bruciaMedio = cassa.reduce((t, x) => t + Math.min(0, x.netto), 0) / cassa.length;
    return { mesi: bruciaMedio < 0 ? ultimo.saldo / -bruciaMedio + cassa.length : Infinity,
      oltre: true, saldoFine: ultimo.saldo };
  }
  return { mesi: negativo.i, oltre: false, quando: negativo.d.mese, saldoFine: negativo.saldo };
}

// ─── Stato patrimoniale ────────────────────────────────────────────────────
// Attivo e passivo devono quadrare. Se non quadrano c'e un errore, e mostrarlo
// vale piu che nasconderlo con una voce di sbilancio.
function ecoStatoPatrimoniale(mix) {
  const P = ECO_PATRIMONIO;
  const anno = ECO_OGGI.getFullYear();
  const mesi = ECO_STORICO.filter(m => m.anno === anno);
  const ce = ecoContoEconomico(mesi, mix, ECO_REGIME);
  // Perdite portate a nuovo = somma dei risultati degli esercizi chiusi.
  const anniPrec = [...new Set(ECO_STORICO.map(m => m.anno))].filter(a => a < anno);
  const perditePortateANuovo = anniPrec.reduce((t, a) =>
    t + ecoContoEconomico(ECO_STORICO.filter(m => m.anno === a), mix, ECO_REGIME).netto, 0);
  const ultimo = ECO_STORICO[ECO_STORICO.length - 1];
  const ric = ecoRicavi(ultimo, mix);

  const cassa = ECO_CASSA.saldoBanca + ECO_CASSA.saldoContanti;
  // Crediti verso clienti: il fatturato non ancora incassato, cioe i giorni di
  // sfasamento sull'ultimo mese.
  const crediti = ric.totale * (ECO_CASSA.giorniIncasso / 30);
  // Debiti verso fornitori: i costi dell'ultimo mese non ancora pagati.
  const costiMese = ecoCostiVariabili(ultimo) + ecoFissiDelMese(new Date(ultimo.data.getFullYear(), ultimo.data.getMonth(), 1));
  const debitiFornitori = costiMese * (ECO_CASSA.giorniPagamento / 30);
  const ivaDebito = Math.max(0, ric.totale * 0.22 - costiMese * 0.22 * 0.55);
  const immobilizzazioni = P.immobiliMateriali + P.fondoAmmortamento;

  const attivo = [
    { v:'Immobilizzazioni materiali', n:immobilizzazioni, sub:`${ecoEur(P.immobiliMateriali)} al costo, ${ecoEur(-P.fondoAmmortamento)} ammortizzati` },
    { v:'Crediti verso clienti', n:crediti, sub:`abbonamenti fatturati e non ancora incassati, ${ECO_CASSA.giorniIncasso} giorni medi` },
    { v:'Crediti tributari', n:P.creditiTributari, sub:'credito d’imposta maturato' },
    { v:'Disponibilità liquide', n:cassa, sub:`banca ${ecoEur(ECO_CASSA.saldoBanca)}` },
  ];
  const totAttivo = attivo.reduce((t, x) => t + x.n, 0);

  const pn = P.capitaleSociale + P.riserve + P.versamentiSoci + perditePortateANuovo + ce.netto;
  const passivo = [
    { v:'Capitale sociale', n:P.capitaleSociale, gruppo:'pn' },
    { v:'Versamenti dei soci in conto capitale', n:P.versamentiSoci, gruppo:'pn' },
    { v:'Perdite portate a nuovo', n:perditePortateANuovo, gruppo:'pn',
      sub: anniPrec.length ? `risultati di ${anniPrec.join(', ')}, calcolati` : 'nessun esercizio precedente' },
    { v:`Risultato dell’esercizio ${anno}`, n:ce.netto, gruppo:'pn', sub:'consuntivo da gennaio a oggi' },
    { v:'Debiti verso fornitori', n:debitiFornitori, gruppo:'deb', sub:`${ECO_CASSA.giorniPagamento} giorni medi di pagamento` },
    { v:'Debiti tributari', n:ivaDebito, gruppo:'deb', sub:'IVA da versare' },
    { v:'Debiti verso banche', n:P.debitiBanche, gruppo:'deb' },
  ];
  const totPassivo = passivo.reduce((t, x) => t + x.n, 0);

  return { attivo, passivo, totAttivo, totPassivo, pn, perditePortateANuovo,
    sbilancio: totAttivo - totPassivo,
    ce, cassa, crediti, debitiFornitori, ivaDebito, immobilizzazioni };
}

window.ecoFlussiMese = ecoFlussiMese;
window.ecoProiezioneCassa = ecoProiezioneCassa;
window.ecoRunway = ecoRunway;
window.ecoStatoPatrimoniale = ecoStatoPatrimoniale;
window.ecoRegressione = ecoRegressione;
window.ecoLeveIniziali = ecoLeveIniziali;
window.ecoProiettaDriver = ecoProiettaDriver;
window.ecoConsumo = ecoConsumo;
window.ecoPrezzo = ecoPrezzo;
window.ecoLettura = ecoLettura;
window.ecoRileggi = ecoRileggi;
window.ecoLetturaManuale = ecoLetturaManuale;
window.ecoGiorniInErrore = ecoGiorniInErrore;
window.ecoCostoServizio = ecoCostoServizio;
window.ecoCostiVariabili = ecoCostiVariabili;
window.ecoFissiDelMese = ecoFissiDelMese;
window.ecoMixPiani = ecoMixPiani;
window.ecoRicavi = ecoRicavi;
window.ecoImposte = ecoImposte;
window.ecoContoEconomico = ecoContoEconomico;
window.ecoMeseCorrente = ecoMeseCorrente;
