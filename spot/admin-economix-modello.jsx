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

// Il consenso esiste solo su PSD2: su CAMT non c'e nulla da rinnovare, ed e la
// ragione principale per preferirlo. La funzione resta perche il modello deve
// poter esprimere entrambi i canali.
function ecoGiorniConsenso(conn) {
  if (!conn.consensoScadeIl) return null;
  return Math.ceil((conn.consensoScadeIl.getTime() - Date.now()) / 86400000);
}

// Da quanti giorni non arriva il rendiconto. E' il guasto tipico di CAMT: non
// un permesso scaduto ma un file che smette di essere depositato, e il sintomo
// e identico — la cassa resta ferma su un saldo vecchio.
function ecoRitardoRendiconto(conn) {
  if (!conn || conn.metodo !== 'camt' || !conn.ultimaLettura) return 0;
  const gg = Math.floor((Date.now() - conn.ultimaLettura.getTime()) / 86400000);
  return Math.max(0, gg);
}
const ecoBanca = () => ECO_CONNESSIONI.find(c => c.cassa) || null;

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

// ─── Ammortamenti ─────────────────────────────────────────────────────────
// Il fondo e la quota di un cespite a un dato mese. Si accumula in avanti invece
// di moltiplicare i mesi trascorsi per la quota, perche due regole lo renderebbero
// sbagliato: il primo esercizio va a META aliquota — qualunque sia il mese
// d'acquisto — e l'ammortamento si ferma quando il fondo raggiunge il costo, non
// un euro oltre.
function ecoAmmortamento(c, fino) {
  let fondo = 0, quota = 0;
  const stop = new Date(fino.getFullYear(), fino.getMonth(), 1);
  const d = new Date(c.data.getFullYear(), c.data.getMonth(), 1);
  while (d <= stop) {
    const primoEsercizio = d.getFullYear() === c.data.getFullYear();
    const teorica = primoEsercizio
      ? c.costo * (c.aliquota / 100) * 0.5 / (12 - c.data.getMonth())
      : c.costo * (c.aliquota / 100) / 12;
    quota = Math.max(0, Math.min(teorica, c.costo - fondo));
    fondo += quota;
    d.setMonth(d.getMonth() + 1);
  }
  return { fondo, quota, residuo: c.costo - fondo };
}
const ecoAmmortamentoMese = (d) => ECO_CESPITI.reduce((t, c) => t + ecoAmmortamento(c, d).quota, 0);
// Esborso del mese d'acquisto: e cassa, non costo. Sono due voci diverse dello
// stesso fatto, ed e per questo che stanno in due funzioni diverse.
const ecoCespitiDelMese = (d) => ECO_CESPITI.reduce((t, c) =>
  t + (c.data.getFullYear() === d.getFullYear() && c.data.getMonth() === d.getMonth() ? c.costo : 0), 0);
function ecoCespitiAlla(d) {
  return ECO_CESPITI.reduce((a, c) => {
    if (new Date(c.data.getFullYear(), c.data.getMonth(), 1) > new Date(d.getFullYear(), d.getMonth(), 1)) return a;
    const am = ecoAmmortamento(c, d);
    a.costo += c.costo; a.fondo += am.fondo; a.netto += am.residuo;
    return a;
  }, { costo:0, fondo:0, netto:0 });
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
  const ammortamenti = mesi.reduce((t, d) =>
    t + ecoAmmortamentoMese(new Date(d.data.getFullYear(), d.data.getMonth(), 1)), 0);
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
  const ivaAcquisti = ecoIvaAcquisti(dataM);
  return { m, incassi, uscite, ivaVendite, ivaAcquisti, ivaNetta: ivaVendite - ivaAcquisti,
    netto: incassi - uscite };
}

// Proiezione della cassa: saldo di partenza, poi mese per mese entrate meno
// uscite meno IVA versata. Il numero che conta e uno solo — quando finisce.
// Il mese chiude un periodo IVA? E il mese in cui si versa quello chiuso prima?
const ecoUltimoMesePeriodo = (d, regime) =>
  regime === 'mensile' ? true : d.getMonth() % 3 === 2;
const ecoMeseDiVersamento = (d, regime) => regime === 'mensile'
  ? true : [2, 4, 7, 10].indexOf(d.getMonth()) !== -1;

function ecoProiezioneCassa(mix, leve) {
  const futuri = ecoProiettaDriver(leve);
  const regimeIva = ECO_CASSA.regimeIva;
  // Si parte dalla posizione vera di oggi: il credito gia maturato va consumato
  // prima che riparta un solo euro di versamento.
  let posizioneIva = ecoSaldoIva(mix).saldo;
  let chiusaIva = 0;
  const riacquisti = ecoRiacquisti(futuri);
  let saldo = ECO_CASSA.saldoBanca + ECO_CASSA.saldoContanti;
  const out = [];
  futuri.forEach((d, i) => {
    const ric = ecoRicavi(d, mix);
    const costi = ecoCostiVariabili(d) + ecoFissiDelMese(d.data) + ecoCespitiDelMese(d.data);
    // Gli abbonamenti sono + IVA: il ristoratore la paga a Byup, che la INCASSA
    // e la riversa. Mancava del tutto, e il flusso sottraeva l'IVA versata allo
    // Stato senza mai aggiungere quella riscossa — l'IVA risultava un costo
    // secco quando sulla cassa e neutra, a meno dello sfasamento temporale.
    const ivaIncassata = ric.totale * 0.22;
    // IVA sugli acquisti: dove il costo la porta scritta si usa quella, altrove
    // si stima. I fornitori esteri sono in reverse charge e non danno credito,
    // ed e il motivo per cui la stima non puo essere il 22% pieno.
    const ivaAcquisti = ecoIvaAcquisti(d.data);
    const pagamenti = costi + ivaAcquisti;                  // al fornitore esce il lordo
    // L'IVA esce alle scadenze di liquidazione, non ogni mese, e prima consuma
    // il credito accumulato. Con Byup a credito di quasi undicimila euro,
    // addebitarla mensilmente accorciava l'autonomia di mesi che non esistono.
    posizioneIva += ivaIncassata - ivaAcquisti;
    if (ecoUltimoMesePeriodo(d.data, regimeIva)) { chiusaIva += posizioneIva; posizioneIva = 0; }
    let iva = 0;
    if (ecoMeseDiVersamento(d.data, regimeIva) && chiusaIva > 0) {
      iva = chiusaIva * (1 + (regimeIva === 'trimestrale' ? ECO_CASSA.interessiTrimestrale / 100 : 0));
      chiusaIva = 0;
    }
    const scad = ECO_SCADENZE.filter(x => x.importo && x.quando.getFullYear() === d.data.getFullYear()
      && x.quando.getMonth() === d.data.getMonth()).reduce((t, x) => t + x.importo, 0)
      + riacquisti.filter(r => r.mese === d.mese).reduce((t, r) => t + r.importo, 0);
    const incassi = ric.totale + ivaIncassata;
    const netto = incassi - pagamenti - iva - scad;
    saldo += netto;
    out.push({ d, ricavi:ric.totale, ivaIncassata, incassi, costi, ivaAcquisti, pagamenti,
      iva, scadenze:scad, netto, saldo, i });
  });
  return out;
}

// IVA detraibile del mese: quella dichiarata sulle singole voci, piu una stima
// sul resto. Sui fornitori esteri e zero per costruzione.
function ecoIvaAcquisti(d) {
  let dichiarata = 0, senza = 0;
  ECO_FISSI.forEach(f => {
    if (f.dal && d < new Date(f.dal.getFullYear(), f.dal.getMonth(), 1)) return;
    if (f.a && d > f.a) return;
    const quota = f.periodicita === 'annuale' ? f.importo / 12
      : f.periodicita === 'una-tantum'
        ? (f.dal.getFullYear() === d.getFullYear() && f.dal.getMonth() === d.getMonth() ? f.importo : 0)
        : f.importo;
    if (!quota) return;
    if (f.iva != null) dichiarata += f.iva * (quota / (f.importo || 1));
    else senza += quota;
  });
  // L'IVA su un bene strumentale e detraibile come quella su un servizio: il
  // bene non e un costo, ma la sua IVA e IVA a credito nel mese d'acquisto.
  ECO_CESPITI.forEach(c => {
    if (c.data.getFullYear() === d.getFullYear() && c.data.getMonth() === d.getMonth())
      dichiarata += c.iva || 0;
  });
  return dichiarata + senza * 0.22 * 0.55;
}

// ─── Pacchetti prepagati: tre nature, un solo oggetto ──────────────────────
// COMPETENZA: costo variabile, matura a ogni trasmissione — gia gestito dal
//   prezzo unitario del taglio in ecoPrezzo.
// CASSA: uscita a blocchi, quando il credito finisce. Il QUANDO non e una data
//   scelta: si calcola dal residuo diviso il consumo.
// PATRIMONIO: il credito non consumato e un ATTIVO — denaro gia uscito che non
//   e ancora diventato costo.
function ecoPrepagati() {
  const out = [];
  Object.keys(ECO_PACCHETTI).forEach(id => {
    const pk = ECO_PACCHETTI[id];
    const s = ECO_SERVIZI.find(x => x.pacchetti === id);
    if (!s) return;
    const t = ecoTaglio(pk, pk.attivo);
    const unit = ecoPrezzoUnitario(t);
    const consumoMese = ecoConsumo(s, ECO_STORICO[ECO_STORICO.length - 1]);
    out.push({ id, pk, s, taglio:t, unit, consumoMese,
      valore: pk.residuo * unit,                                   // attivo a bilancio
      mesiResidui: consumoMese ? pk.residuo / consumoMese : Infinity,
      giorniResidui: consumoMese ? Math.round(pk.residuo / consumoMese * 30) : Infinity });
  });
  return out;
}

// Riacquisti previsti nell'orizzonte: quante volte il credito finisce, e quando.
// E' l'uscita che sorprende, perche non ha un calendario ma un consumo.
function ecoRiacquisti(mesiProiettati) {
  const out = [];
  ecoPrepagati().forEach(p => {
    let residuo = p.pk.residuo;
    mesiProiettati.forEach(d => {
      const consumo = ecoConsumo(p.s, d);
      residuo -= consumo;
      while (residuo < 0) {
        out.push({ mese:d.mese, data:d.data, voce:`Ricarica ${p.pk.fornitore}`,
          importo:p.taglio.prezzo, quantita:p.taglio.quantita, servizio:p.s.nome });
        residuo += p.taglio.quantita;
      }
    });
  });
  return out;
}

// ─── Flussi di cassa a CONSUNTIVO ──────────────────────────────────────────
// La tab Cassa guarda indietro: gli ultimi dodici mesi piu quello in corso. Il
// saldo si ricostruisce ALL'INDIETRO dal saldo di oggi, che e l'unico dato
// certo — quello letto dalla banca. Costruirlo in avanti da un saldo iniziale
// inventato avrebbe dato una curva che non finisce dove finisce la realta.
function ecoFlussiStorici(mix) {
  const mesi = ECO_STORICO.slice(-13);
  const righe = mesi.map((m, i) => {
    const ric = ecoRicavi(m, mix);
    const dataM = new Date(m.data.getFullYear(), m.data.getMonth(), 1);
    const frazione = m.corrente ? ECO_OGGI.getDate() / ecoGiorniNelMese(ECO_OGGI) : 1;
    const ricavi = ric.totale * frazione;
    const ivaIncassata = ricavi * 0.22;
    const costi = (ecoCostiVariabili(m) * frazione) + ecoFissiDelMese(dataM) + ecoCespitiDelMese(dataM);
    const ivaAcquisti = ecoIvaAcquisti(dataM);
    // Le uscite sono tutto cio che esce verso l'esterno: fornitori al lordo e
    // scadenze con calendario proprio. Tenerle in due colonne separate quando
    // una delle due e quasi sempre vuota non aggiungeva niente.
    const altre = ECO_SCADENZE.filter(x => x.importo && x.quando.getFullYear() === m.data.getFullYear()
      && x.quando.getMonth() === m.data.getMonth()).reduce((t, x) => t + x.importo, 0);
    // Il versamento allo Stato e un'uscita come le altre e sta dentro le uscite:
    // tenerlo in una colonna a se obbligava il flusso netto a sottrarre un
    // termine che non si vedeva accanto agli altri due.
    const ivaVersata = ecoIvaVersataNelMese(dataM, mix);
    const pagamenti = costi + ivaAcquisti + altre + ivaVersata;
    // Saldo del mese = IVA a debito meno IVA a credito, i due termini della
    // liquidazione. E quello che MATURA, non quello che esce: si accumula fino
    // alla scadenza del periodo e li diventa cassa. Positivo si deve, negativo
    // e credito da portare avanti — lo stesso segno della scheda Saldo IVA.
    const saldoIva = ivaIncassata - ivaAcquisti;
    const incassi = ricavi + ivaIncassata;
    return { d:m, ricavi, ivaIncassata, incassi, costi, ivaAcquisti, pagamenti,
      ivaVersata, saldoIva, netto: incassi - pagamenti, i };
  });
  // Dal fondo verso l'alto: l'ultimo saldo e quello vero.
  let saldo = ECO_CASSA.saldoBanca + ECO_CASSA.saldoContanti;
  for (let k = righe.length - 1; k >= 0; k--) {
    righe[k].saldo = saldo;
    saldo -= righe[k].netto;
  }
  return righe;
}

// ─── Liquidazione IVA ──────────────────────────────────────────────────────
// Due periodi contano sempre: quello CHIUSO che sta per essere versato, e
// quello IN MATURAZIONE che si sta accumulando adesso. Mostrarne uno solo
// lascia scoperta meta della domanda.
function ecoTrimestre(d) { return Math.floor(d.getMonth() / 3); }
function ecoScadenzaIva(anno, periodo, regime) {
  if (regime === 'mensile') {
    // entro il 16 del mese successivo
    return new Date(anno, periodo + 1, 16);
  }
  // trimestrale: 16 del secondo mese dopo il trimestre; il quarto slitta a marzo
  if (periodo === 3) return new Date(anno + 1, 2, 16);
  return new Date(anno, periodo * 3 + 4, 16);
}
// Ultimo giorno del periodo. Sul trimestrale non e il mese prima della
// scadenza: la scadenza e il 16 del SECONDO mese dopo, quindi il periodo chiude
// due mesi prima — 3o trimestre, versamento 16 novembre, chiusura 30 settembre.
function ecoFinePeriodoIva(p) {
  if (p.regime === 'mensile') return new Date(p.anno, p.periodo + 1, 0);
  return new Date(p.anno, p.periodo * 3 + 3, 0);
}

function ecoPeriodoIva(anno, periodo, regime, mix) {
  const mesi = ECO_STORICO.filter(m => m.anno === anno && (regime === 'mensile'
    ? m.data.getMonth() === periodo
    : Math.floor(m.data.getMonth() / 3) === periodo));
  let vendite = 0, acquisti = 0;
  mesi.forEach(m => {
    const frazione = m.corrente ? ECO_OGGI.getDate() / ecoGiorniNelMese(ECO_OGGI) : 1;
    vendite += ecoRicavi(m, mix).totale * frazione * 0.22;
    acquisti += ecoIvaAcquisti(new Date(m.data.getFullYear(), m.data.getMonth(), 1));
  });
  const saldo = vendite - acquisti;
  return { anno, periodo, regime, mesi, vendite, acquisti, saldo,
    scadenza: ecoScadenzaIva(anno, periodo, regime),
    etichetta: regime === 'mensile'
      ? `${ECO_MESI[periodo]} ${String(anno).slice(2)}`
      : `${periodo + 1}º trimestre ${anno}` };
}
// L'IVA non esce ogni mese: esce alle scadenze. Sul trimestrale sono quattro
// date l'anno — 16 maggio, agosto, novembre e marzo — e negli altri otto mesi
// dalla cassa non parte un euro di IVA. Il conteggio mensile che c'era prima
// (incassata meno acquisti, ogni mese) non e mai stato un versamento: era il
// maturato, e messo nella colonna della cassa raccontava un'uscita che non
// avveniva.
//
// E i periodi non sono indipendenti: un credito NON si chiede a rimborso ogni
// trimestre, si porta al periodo successivo e abbatte il debito che matura li.
// Senza il riporto un'azienda a credito come Byup — che compra molto piu di
// quanto vende — risultava «da versare» al primo trimestre in cui le vendite
// superano gli acquisti, mentre in realta ha ancora credito da consumare.
function ecoIvaPeriodi(mix) {
  const regime = ECO_CASSA.regimeIva;
  const n = regime === 'mensile' ? 12 : 4;
  const primo = ECO_STORICO[0].data;
  const ultimo = ECO_STORICO[ECO_STORICO.length - 1].data;
  const out = [];
  let credito = 0;                       // positivo = credito verso l'erario
  for (let a = primo.getFullYear(); a <= ultimo.getFullYear() + 1; a++) {
    for (let p = 0; p < n; p++) {
      const per = ecoPeriodoIva(a, p, regime, mix);
      if (!per.mesi.length) continue;
      const netto = per.saldo - credito;
      per.credito = credito;
      per.interessi = regime === 'trimestrale' && netto > 0
        ? netto * ECO_CASSA.interessiTrimestrale / 100 : 0;
      per.dovuto = netto > 0 ? netto + per.interessi : 0;
      per.creditoDopo = netto > 0 ? 0 : -netto;
      per.fine = ecoFinePeriodoIva(per);
      per.chiuso = per.fine < ECO_OGGI;
      credito = per.creditoDopo;
      out.push(per);
    }
  }
  return out;
}

function ecoIvaVersataNelMese(d, mix) {
  const per = ecoIvaPeriodi(mix).find(x => x.chiuso
    && x.scadenza.getFullYear() === d.getFullYear() && x.scadenza.getMonth() === d.getMonth());
  return per ? per.dovuto : 0;
}

// Saldo IVA accumulato: la posizione verso l'erario per i periodi non ancora
// versati. Negativo vuol dire credito, e allora non c'e nessuna data di
// pagamento da mostrare — mostrarla sarebbe annunciare un'uscita che non ci sara.
function ecoSaldoIva(mix) {
  const tutti = ecoIvaPeriodi(mix);
  const aperti = tutti.filter(x => x.scadenza >= ECO_OGGI);
  if (!aperti.length) return { saldo:0, aperti:[], prossima:null };
  const saldo = aperti.reduce((t, x) => t + x.saldo, 0) - aperti[0].credito;
  // Due date diverse e servono entrambe: quella in cui esce denaro (puo non
  // esistere, se si e a credito) e la prossima liquidazione comunque, che e
  // l'appuntamento con l'erario anche quando non si versa nulla. Mostrare solo
  // la prima significa non mostrare mai niente a un'azienda a credito.
  return { saldo, aperti, prossimaLiquidazione: aperti[0],
    prossima: aperti.find(x => x.dovuto > 0) || null };
}

// ─── Scadenzario ───────────────────────────────────────────────────────────
// Vista unica di tutto cio che deve uscire: i costi ricorrenti impostati nella
// tab Costi, le una tantum con data futura, le scadenze con calendario proprio
// e le ricariche dei prepagati. Prima erano tre elenchi in tre posti, e nessuno
// rispondeva alla domanda vera — che cosa pago nelle prossime settimane.
const ecoChiave = (id, d) => `${id}@${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function ecoScadenzario(mesiAvanti, mixScad) {
  const out = [];
  const oggi = ECO_OGGI;
  const orizzonte = new Date(oggi.getFullYear(), oggi.getMonth() + (mesiAvanti || 6), 0);
  const dentro = (d) => d <= orizzonte;

  const spingi = (r) => {
    const chiave = r.chiave;
    if (ECO_PAGATI[chiave]) return;                       // gia pagata: fuori dall'elenco
    if (!dentro(r.data)) return;
    r.giorni = Math.ceil((r.data.getTime() - oggi.getTime()) / 86400000);
    out.push(r);
  };

  // 1 — costi ricorrenti e una tantum future, dalla tab Costi
  ECO_FISSI.forEach(f => {
    if (f.periodicita === 'una-tantum') {
      if (f.dal >= new Date(oggi.getFullYear(), oggi.getMonth(), 1)) {
        spingi({ chiave:ecoChiave(f.id, f.dal), voce:f.voce, data:new Date(f.dal),
          importo:f.importo + (f.iva || 0), origine:'una tantum', fornitore:f.fornitore, rif:f, costo:true });
      }
      return;
    }
    const passo = f.periodicita === 'annuale' ? 12 : 1;
    for (let k = 0; k <= (mesiAvanti || 6); k += passo) {
      const d = new Date(oggi.getFullYear(), oggi.getMonth() + k, Math.min(f.dal.getDate(), 28));
      if (d < new Date(oggi.getFullYear(), oggi.getMonth(), 1)) continue;
      if (f.a && d > f.a) continue;
      if (f.periodicita === 'annuale' && d.getMonth() !== f.dal.getMonth()) continue;
      spingi({ chiave:ecoChiave(f.id, d), voce:f.voce, data:d,
        importo:f.importo + (f.iva || 0), origine: f.periodicita === 'annuale' ? 'annuale' : 'mensile',
        fornitore:f.fornitore, rif:f, costo:true });
    }
  });

  // 1b — beni strumentali con data futura: la cassa esce tutta quel giorno
  ECO_CESPITI.forEach(c => {
    if (c.data < new Date(oggi.getFullYear(), oggi.getMonth(), 1)) return;
    spingi({ chiave:ecoChiave(c.id, c.data), voce:c.voce, data:new Date(c.data),
      importo:c.costo + (c.iva || 0), origine:'bene strumentale',
      fornitore:c.fornitore, nota:`Si ammortizza al ${c.aliquota}%`, costo:true });
  });

  // 2 — liquidazioni IVA, calcolate: la data e certa, l'importo lo e solo per i
  // periodi gia chiusi. Su quelli ancora aperti si mostra la data senza inventare
  // un numero, che e esattamente quello che sa chi tiene i conti.
  ecoIvaPeriodi(mixScad).forEach(per => {
    if (per.scadenza < oggi || per.dovuto <= 0) return;   // a credito: non si versa
    spingi({ chiave:`IVA@${per.anno}-${per.periodo}`,
      voce:`Liquidazione IVA · ${per.etichetta}`,
      data:per.scadenza, importo: per.chiuso ? per.dovuto : null, origine:'IVA',
      nota: per.chiuso
        ? `${ecoEur2(per.vendite)} sulle vendite meno ${ecoEur2(per.acquisti)} sugli acquisti${
            per.credito > 0 ? `, meno ${ecoEur2(per.credito)} di credito riportato` : ''}${
            per.interessi ? `, più ${ecoEur2(per.interessi)} di interessi` : ''}`
        : `Il periodo chiude il ${cfFmt(per.fine)}: l'importo si calcola allora. Oggi maturerebbe ${ecoEur2(per.dovuto)}.`,
      costo:false });
  });

  // 3 — scadenze con calendario proprio
  ECO_SCADENZE.forEach(x => {
    spingi({ chiave:ecoChiave(x.id, x.quando), voce:x.voce, data:new Date(x.quando),
      importo:x.importo, origine:x.tipo === 'iva' ? 'IVA' : x.tipo === 'imposte' ? 'imposte' : 'fornitore',
      nota:x.nota, rif:x, costo: x.costo !== false });
  });

  // 4 — ricariche dei prepagati, calcolate dal consumo
  ecoPrepagati().forEach(p => {
    let residuo = p.pk.residuo, k = 0;
    while (k < (mesiAvanti || 6)) {
      const d = new Date(oggi.getFullYear(), oggi.getMonth() + k, 1);
      residuo -= p.consumoMese;
      if (residuo < 0) {
        const giorno = new Date(d.getFullYear(), d.getMonth(), Math.min(28, Math.max(1,
          Math.round(30 * (1 + residuo / p.consumoMese)))));
        spingi({ chiave:ecoChiave(p.id, giorno), voce:`Ricarica ${p.pk.fornitore}`, data:giorno,
          importo:p.taglio.prezzo, origine:'prepagato',
          nota:`${p.taglio.quantita.toLocaleString('it-IT')} ${p.pk.unita}`, rif:p, costo:true });
        residuo += p.taglio.quantita;
      }
      k++;
    }
  });

  return out.sort((a, b) => a.data - b.data);
}

// Segna pagata un'occorrenza. Se e una voce che NON e gia un costo — le
// scadenze con calendario proprio, tipo il rinnovo di una polizza — ne crea
// uno alla data del pagamento. L'IVA e le imposte no: sono uscite di cassa,
// non costi, e metterle nel conto economico sarebbe un errore.
function ecoSegnaPagata(riga) {
  ECO_PAGATI[riga.chiave] = new Date();
  if (riga.costo && riga.origine === 'fornitore' && riga.rif && riga.rif.voce && !riga.rif.periodicita) {
    ECO_FISSI.push({ id:'F-' + String(ECO_FISSI.length + 1).padStart(2, '0'),
      voce:riga.voce, categoria:'Altro', importo:riga.importo || 0, iva:0,
      periodicita:'una-tantum', dal:new Date(), a:null,
      fornitore:riga.fornitore || '—', piva:'', fattura:null });
  }
}

// Eliminare un costo non vuol dire cancellarne la storia. Una voce periodica si
// CHIUDE alla data da cui non vale piu: i mesi gia passati l'hanno avuta davvero,
// e toglierla anche da li riscriverebbe consuntivi gia chiusi — compresi quelli
// su cui e stato calcolato un risultato d'esercizio.
// Solo le una tantum, che hanno una sola occorrenza, si rimuovono del tutto.
function ecoEliminaCosto(costo, daQuando) {
  const k = ECO_FISSI.indexOf(costo);
  if (k < 0) return { modo:'assente' };
  const inizio = new Date(costo.dal.getFullYear(), costo.dal.getMonth(), 1);
  const da = new Date(daQuando.getFullYear(), daQuando.getMonth(), 1);
  if (costo.periodicita === 'una-tantum' || da <= inizio) {
    ECO_FISSI.splice(k, 1);
    return { modo:'rimossa' };
  }
  // Ultimo giorno del mese precedente: da li in poi la voce non compare piu.
  costo.a = new Date(da.getFullYear(), da.getMonth(), 0, 23, 59);
  return { modo:'chiusa', a:costo.a };
}

// Quante occorrenze spariscono e quante restano, dato il punto da cui si taglia.
function ecoImpattoEliminazione(costo, daQuando) {
  const conta = (filtro) => ECO_STORICO.filter(m => {
    const dm = new Date(m.data.getFullYear(), m.data.getMonth(), 1);
    if (dm < new Date(costo.dal.getFullYear(), costo.dal.getMonth(), 1)) return false;
    if (costo.a && dm > costo.a) return false;
    if (costo.periodicita === 'una-tantum')
      return costo.dal.getFullYear() === dm.getFullYear() && costo.dal.getMonth() === dm.getMonth();
    return filtro(dm);
  }).length;
  const da = new Date(daQuando.getFullYear(), daQuando.getMonth(), 1);
  return { restano: conta(dm => dm < da), spariscono: conta(dm => dm >= da) };
}

// Autonomia. DUE letture, e non sono intercambiabili:
//  - col ricavo: cassa diviso il bruciato NETTO (costi meno incassi). E la
//    definizione standard, e risponde a "quanto dura se le cose vanno come
//    previsto".
//  - senza ricavo: cassa diviso i soli costi. E lo scenario di tensione, e
//    risponde a "quanto durerei se i ricavi si fermassero domani".
// Su una societa ancora sotto il pareggio le due divergono molto, e mostrarne
// una sola lascia credere che sia l'unica.
// L'autonomia e UNA divisione, e va detta per intero. La cassa non si consuma
// con le uscite: si consuma con la DIFFERENZA fra uscite e incassi — se entra
// quanto esce non finisce mai, e dividere per le sole uscite darebbe una data
// di morte a un'azienda in pareggio. Il caso «senza incassi» e lo stesso conto
// col secondo termine azzerato, ed e per questo che condivide il divisore:
// due «uscite medie» diverse nella stessa frase sarebbero sembrate un errore.
//
// Il calcolo E la formula mostrata a schermo. Tenere un metodo piu fine dentro
// e scriverne uno piu semplice fuori vuol dire pubblicare un numero che non si
// puo rifare — e un numero che non si puo rifare non si puo nemmeno contestare.
function ecoAutonomia(cassa, saldoOggi) {
  if (!cassa.length) return { mesi:Infinity, senzaIncassi:Infinity, usciteMedie:0, incassiMedi:0, brucia:0 };
  const n = cassa.length;
  const usciteMedie = cassa.reduce((t, x) => t + x.pagamenti + x.iva + x.scadenze, 0) / n;
  const incassiMedi = cassa.reduce((t, x) => t + x.incassi, 0) / n;
  const brucia = usciteMedie - incassiMedi;
  return {
    mesi: brucia > 0 ? saldoOggi / brucia : Infinity,
    senzaIncassi: usciteMedie > 0 ? saldoOggi / usciteMedie : Infinity,
    usciteMedie, incassiMedi, brucia,
  };
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
  // La posizione IVA e una sola e ha un segno: debito se si deve versare,
  // credito se si e comprato piu di quanto si e venduto. Prima qui c'era la
  // differenza del solo ultimo mese, che non e ne l'uno ne l'altro — e teneva
  // fuori dal bilancio quasi undicimila euro di credito davvero maturati.
  const posizioneIva = ecoSaldoIva(mix).saldo;
  const ivaDebito = Math.max(0, posizioneIva);
  const ivaCredito = Math.max(0, -posizioneIva);
  const cesp = ecoCespitiAlla(ultimo.data);
  const immobilizzazioni = P.immobiliMateriali + P.fondoAmmortamento + cesp.netto;
  const prepagato = ecoPrepagati().reduce((t, p) => t + p.valore, 0);

  const attivo = [
    { v:'Immobilizzazioni materiali', n:immobilizzazioni,
      sub:`${ecoEur(P.immobiliMateriali + cesp.costo)} al costo, ${ecoEur(-P.fondoAmmortamento + cesp.fondo)} ammortizzati` },
    { v:'Crediti verso clienti', n:crediti, sub:`abbonamenti fatturati e non ancora incassati, ${ECO_CASSA.giorniIncasso} giorni medi` },
    { v:'Crediti tributari', n:P.creditiTributari + ivaCredito,
      sub: ivaCredito > 0
        ? `${ecoEur(P.creditiTributari)} di credito d’imposta più ${ecoEur(ivaCredito)} di credito IVA da riportare`
        : 'credito d’imposta maturato' },
    { v:'Servizi prepagati non consumati', n:prepagato,
      sub:'credito acquistato e non ancora usato: denaro già uscito che non è ancora costo' },
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
    { v:'Debiti tributari', n:ivaDebito, gruppo:'deb',
      sub: ivaDebito > 0 ? 'IVA da versare alla prossima liquidazione' : 'nessuna IVA da versare: la posizione è a credito' },
    { v:'Debiti verso banche', n:P.debitiBanche, gruppo:'deb' },
  ];
  const totPassivo = passivo.reduce((t, x) => t + x.n, 0);

  return { attivo, passivo, totAttivo, totPassivo, pn, perditePortateANuovo, prepagato,
    sbilancio: totAttivo - totPassivo,
    ce, cassa, crediti, debitiFornitori, ivaDebito, ivaCredito, immobilizzazioni };
}

window.ecoGiorniConsenso = ecoGiorniConsenso;
window.ecoRitardoRendiconto = ecoRitardoRendiconto;
window.ecoBanca = ecoBanca;
window.ecoPrepagati = ecoPrepagati;
window.ecoRiacquisti = ecoRiacquisti;
window.ecoIvaAcquisti = ecoIvaAcquisti;
window.ecoAmmortamento = ecoAmmortamento;
window.ecoAmmortamentoMese = ecoAmmortamentoMese;
window.ecoCespitiDelMese = ecoCespitiDelMese;
window.ecoCespitiAlla = ecoCespitiAlla;
window.ecoFlussiStorici = ecoFlussiStorici;
window.ecoFinePeriodoIva = ecoFinePeriodoIva;
window.ecoIvaPeriodi = ecoIvaPeriodi;
window.ecoIvaVersataNelMese = ecoIvaVersataNelMese;
window.ecoSaldoIva = ecoSaldoIva;
window.ecoFlussiMese = ecoFlussiMese;
window.ecoProiezioneCassa = ecoProiezioneCassa;
window.ecoScadenzario = ecoScadenzario;
window.ecoSegnaPagata = ecoSegnaPagata;
window.ecoEliminaCosto = ecoEliminaCosto;
window.ecoImpattoEliminazione = ecoImpattoEliminazione;
window.ecoAutonomia = ecoAutonomia;
window.ecoStatoPatrimoniale = ecoStatoPatrimoniale;
window.ecoRegressione = ecoRegressione;
window.ecoLeveIniziali = ecoLeveIniziali;
window.ecoProiettaDriver = ecoProiettaDriver;
window.ecoConsumo = ecoConsumo;
window.ecoPrezzo = ecoPrezzo;
window.ecoLettura = ecoLettura;
window.ecoGiorniInErrore = ecoGiorniInErrore;
window.ecoCostoServizio = ecoCostoServizio;
window.ecoCostiVariabili = ecoCostiVariabili;
window.ecoFissiDelMese = ecoFissiDelMese;
window.ecoMixPiani = ecoMixPiani;
window.ecoRicavi = ecoRicavi;
window.ecoImposte = ecoImposte;
window.ecoContoEconomico = ecoContoEconomico;
window.ecoMeseCorrente = ecoMeseCorrente;
