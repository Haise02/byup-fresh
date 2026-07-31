// ════════════════════════════════════════════════════════════════════════════
// VALORE PER IL LOCALE · il modello
// ════════════════════════════════════════════════════════════════════════════
//
// ── IL VINCOLO ────────────────────────────────────────────────────────────
// Di un locale non sappiamo come stava PRIMA di byup: i dati cominciano il
// giorno in cui si iscrive. Ma da quel giorno in poi sappiamo tutto, mese per
// mese — e l'adozione digitale non è un interruttore: parte da zero e sale.
// Sora Lella è passata dal 7% al 42% in sei mesi.
//
// Da qui i due tagli, in ordine di pulizia:
//
//   1. LO STESSO LOCALE CON SÉ STESSO NEL TEMPO
//      I suoi mesi a bassa adozione contro i suoi mesi ad alta. Stessa cucina,
//      stesso quartiere, stesso proprietario, stessa clientela: l'unica cosa
//      cambiata è l'adozione. Poi si toglie l'andamento della rete negli
//      stessi mesi, altrimenti la stagionalità si spaccia per effetto — se il
//      suo scontrino sale dell'8% mentre la rete sale del 2%, il numero è 6.
//
//   2. LO STESSO LOCALE, LA STESSA SERA, DUE CANALI
//      Per il solo scontrino c'è un taglio ancora più pulito: dentro lo stesso
//      servizio, il valore degli ordini via QR e app contro quelli passati dal
//      cameriere. Stessi tavoli, stesso menu, stessa cucina, stessa sera.
//      L'unica variabile è il canale.
//
// Quello che resta fuori, e va detto: il taglio 1 non è un esperimento — nessuno
// ha assegnato l'adozione a caso, e un locale che spinge il digitale magari sta
// migliorando anche altro nello stesso periodo. Il taglio 2 non controlla CHI
// sceglie il QR: un tavolo di sei ragazzi ordina diversamente da una coppia, e
// una parte di quel premio è composizione del tavolo, non canale.

const VAL_SOGLIA = 15;              // % di ordini digitali · soglia commerciale
const VAL_MARGINE_LORDO = 68;       // % · margine lordo medio di rete (tab Mercato)
const VAL_COSTO_ORA_SALA = 13.20;   // €/h lordo azienda, contratto pubblici esercizi
const VAL_MESI = ['Giu','Lug','Ago','Set','Ott','Nov','Dic','Gen','Feb','Mar','Apr','Mag'];

// Solo i locali attivi: gli inattivi non sono un termine di paragone, sono
// locali che hanno smesso di lavorare. Stanno nel blocco sull'abbandono.
const VAL_UNIVERSO = LOCALI.filter(locAttivo);

// ── Le basi per mestiere ──────────────────────────────────────────────────
const VAL_TEMPO_BASE = {
  'Pizzeria':38, 'Pub':46, 'Bar':30, 'Bistrot':54, 'Enoteca':60,
  'Trattoria':68, 'Osteria':74, 'Ristorante':92,
};
const VAL_QUOTA_SALA = {
  'Ristorante':0.88, 'Trattoria':0.86, 'Osteria':0.85, 'Enoteca':0.80,
  'Bistrot':0.72, 'Pub':0.74, 'Pizzeria':0.46, 'Bar':0.34,
};
const VAL_NOSHOW_BASE = {
  'Ristorante':14, 'Enoteca':12, 'Osteria':11, 'Trattoria':10,
  'Bistrot':9, 'Pizzeria':8, 'Pub':7, 'Bar':5,
};

// ── Come l'adozione si lega agli indicatori ───────────────────────────────
// Saturante: i primi punti valgono molto, il cinquantesimo quasi niente.
const VAL_MAX = { spesa:0.120, coperti:0.090, tempo:-0.220, noshow:-0.420 };
const VAL_K = 18;
const valCurva = (adozione, chiave) => {
  const x = Math.max(0, adozione || 0);
  return VAL_MAX[chiave] * (x / (x + VAL_K));
};

// ── L'andamento della rete, mese per mese ─────────────────────────────────
// Stagionalità vera del fuori casa: agosto e dicembre tirano, gennaio e
// febbraio no. Più una deriva di fondo — i listini salgono, i coperti no. È
// esattamente la cosa che va tolta prima di attribuirsi un merito.
const VAL_STAGIONE = {
  spesa:   [1.00, 1.02, 1.05, 0.99, 0.99, 1.00, 1.06, 0.96, 0.97, 0.99, 1.01, 1.02],
  coperti: [1.03, 1.08, 1.12, 0.98, 0.96, 0.97, 1.07, 0.88, 0.90, 0.95, 1.00, 1.04],
  tempo:   [1.01, 1.03, 1.05, 1.00, 0.99, 0.99, 1.04, 0.97, 0.97, 0.99, 1.00, 1.01],
  noshow:  [1.02, 1.05, 1.08, 1.00, 0.98, 0.99, 1.09, 0.94, 0.95, 0.98, 1.00, 1.02],
};
const VAL_DERIVA_ANNO = { spesa: 0.028, coperti: 0.006, tempo: 0.004, noshow: 0.010 };
const valDeriva = (t, k) => 1 + VAL_DERIVA_ANNO[k] * (t / 11);

// ── Il pannello mensile, locale per locale ────────────────────────────────
const VAL_PANEL = VAL_UNIVERSO.map((l, i) => {
  const r = pseudoRand(i * 19 + 41);
  const oggi = l.qrAdoption ?? 0;

  // Il percorso di adozione: si parte bassi e si sale, con un mese di svolta —
  // quello in cui i QR arrivano sui tavoli e il personale comincia a nominarli.
  const partenza = Math.min(oggi * 0.35, 1.5 + r() * 3.5);
  const svolta = 3 + Math.floor(r() * 5);            // fra il quarto e l'ottavo mese
  const pendenza = 0.55 + r() * 0.9;
  const adozioneAl = (t) => {
    const s = 1 / (1 + Math.exp(-pendenza * (t - svolta)));
    const s0 = 1 / (1 + Math.exp(-pendenza * (0 - svolta)));
    const s1 = 1 / (1 + Math.exp(-pendenza * (11 - svolta)));
    const q = (s - s0) / ((s1 - s0) || 1);
    return +(partenza + (oggi - partenza) * q).toFixed(1);
  };

  // Basi del locale, ferme nel tempo: sono la sua cucina e il suo quartiere.
  const commensali = 1.7 + r() * 1.1;
  const spesaBase = l.ticketMedio / commensali;
  const copertiBase = l.ordiniGiorno * commensali * (VAL_QUOTA_SALA[l.tipo] ?? 0.75);
  const tempoBase = (VAL_TEMPO_BASE[l.tipo] || 60) * (0.9 + r() * 0.2);
  const noshowBase = (VAL_NOSHOW_BASE[l.tipo] || 10) * (0.8 + r() * 0.5);
  const rumore = () => 1 + (r() - 0.5) * 0.09;       // rumore mensile, ±4,5%

  const mesi = VAL_MESI.map((nome, t) => {
    const ad = adozioneAl(t);
    return {
      t, nome, adozione: ad,
      spesa:   spesaBase   * (1 + valCurva(ad, 'spesa'))   * VAL_STAGIONE.spesa[t]   * valDeriva(t, 'spesa')   * rumore(),
      coperti: copertiBase * (1 + valCurva(ad, 'coperti')) * VAL_STAGIONE.coperti[t] * valDeriva(t, 'coperti') * rumore(),
      tempo:   tempoBase   * (1 + valCurva(ad, 'tempo'))   * VAL_STAGIONE.tempo[t]   * valDeriva(t, 'tempo')   * rumore(),
      noshow:  noshowBase  * (1 + valCurva(ad, 'noshow'))  * VAL_STAGIONE.noshow[t]  * valDeriva(t, 'noshow')  * rumore(),
    };
  });

  return {
    id: l.id, nome: l.nome, tipo: l.tipo, citta: l.citta, piano: l.piano,
    canone: l.mrr, ordiniGiorno: l.ordiniGiorno, posti: l.coperti,
    adozioneOggi: oggi, commensali, mesi,
  };
});

const valMediana = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// ── Il salto di ciascuno, e chi è rimasto fermo ───────────────────────────
// Le due fasi si tagliano sui terzili DELL'ADOZIONE DI QUEL LOCALE, non su una
// soglia comune: ogni locale ha la sua storia, e quello che conta è il suo
// salto. Servono almeno quattro mesi per parte e dieci punti di salto,
// altrimenti si confronta rumore con rumore.
const VAL_SALTO_MINIMO = 10;
const VAL_MESI_MINIMI = 4;
const valFasi = (p) => {
  const ord = [...p.mesi].sort((a, b) => a.adozione - b.adozione);
  const q = Math.max(VAL_MESI_MINIMI, Math.round(p.mesi.length / 3));
  const bassi = ord.slice(0, q);
  const alti = ord.slice(-q);
  const adBassa = valMediana(bassi.map(m => m.adozione));
  const adAlta = valMediana(alti.map(m => m.adozione));
  return { bassi, alti, adBassa, adAlta, salto: adAlta - adBassa };
};
const VAL_FASI = VAL_PANEL.map(p => ({ p, ...valFasi(p) }));

// ── Il gruppo di controllo ────────────────────────────────────────────────
// «L'andamento della rete» NON è la mediana di tutti: in dodici mesi quasi
// tutti stanno salendo di adozione, e sottrarre una mediana che contiene lo
// stesso effetto che si vuole misurare lo cancella. Il controllo giusto sono i
// locali che in quei mesi l'adozione NON l'hanno mossa: hanno vissuto la stessa
// stagione, gli stessi rincari e la stessa domanda, ma non hanno fatto il salto.
const VAL_SALTO_FERMO = 5;
const VAL_CONTROLLO = VAL_FASI.filter(f => f.salto < VAL_SALTO_FERMO).map(f => f.p);
const VAL_RETE = VAL_MESI.map((nome, t) => ({
  t, nome,
  spesa: valMediana(VAL_CONTROLLO.map(p => p.mesi[t].spesa)),
  coperti: valMediana(VAL_CONTROLLO.map(p => p.mesi[t].coperti)),
  tempo: valMediana(VAL_CONTROLLO.map(p => p.mesi[t].tempo)),
  noshow: valMediana(VAL_CONTROLLO.map(p => p.mesi[t].noshow)),
}));

// ── Gli indicatori ────────────────────────────────────────────────────────
const VAL_INDICATORI = [
  { k:'spesa', label:'Spesa per coperto', unita:'€', dec:2, verso:'su', perno:true,
    formula:'valore del conto ÷ commensali', perche:'Quanto lascia ogni cliente' },
  { k:'coperti', label:'Coperti al giorno', unita:'', dec:0, verso:'su',
    formula:'ordini al tavolo × commensali', perche:'Quante persone passano davvero' },
  { k:'tempo', label:'Tempo di servizio', unita:'min', dec:0, verso:'giu',
    formula:'chiusura conto − conferma ordine', perche:'Quello che libera il tavolo prima' },
  { k:'noshow', label:'Prenotazioni a vuoto', unita:'%', dec:1, verso:'giu',
    formula:'chi non si presenta ÷ prenotazioni', perche:'Il tavolo tenuto per nessuno' },
];
const VAL_PERNO = VAL_INDICATORI.find(i => i.perno);

// ── TAGLIO 1 · lo stesso locale, mesi bassi contro mesi alti ──────────────
const VAL_STORIE = VAL_FASI.map(f => {
  const { p, bassi, alti, adBassa, adAlta, salto } = f;
  const per = {};
  VAL_INDICATORI.forEach(ind => {
    const suoBasso = valMediana(bassi.map(m => m[ind.k]));
    const suoAlto = valMediana(alti.map(m => m[ind.k]));
    // Il controllo NEGLI STESSI MESI: se un locale ha i mesi alti d'estate e
    // d'estate salgono tutti, quella salita non è merito dell'adozione.
    const cBasso = valMediana(bassi.map(m => VAL_RETE[m.t][ind.k]));
    const cAlto = valMediana(alti.map(m => VAL_RETE[m.t][ind.k]));
    const suo = suoBasso ? ((suoAlto - suoBasso) / suoBasso) * 100 : 0;
    const rete = cBasso ? ((cAlto - cBasso) / cBasso) * 100 : 0;
    per[ind.k] = { basso: suoBasso, alto: suoAlto, suo, rete, netto: suo - rete };
  });
  return { ...p, bassi, alti, adBassa, adAlta, salto, per, valido: salto >= VAL_SALTO_MINIMO };
}).sort((a, b) => b.salto - a.salto);

const VAL_STORIE_VALIDE = VAL_STORIE.filter(s => s.valido);
// Il locale da raccontare: il salto più grande fra quelli validi.
const VAL_ESEMPIO = VAL_STORIE_VALIDE[0] || VAL_STORIE[0];

const VAL_ENTRO = VAL_INDICATORI.map(ind => {
  const netti = VAL_STORIE_VALIDE.map(s => s.per[ind.k].netto);
  const suoi = VAL_STORIE_VALIDE.map(s => s.per[ind.k].suo);
  const reti = VAL_STORIE_VALIDE.map(s => s.per[ind.k].rete);
  const concordi = netti.filter(d => (ind.verso === 'su' ? d > 0 : d < 0)).length;
  const n = netti.length;
  const ordinati = [...netti].sort((a, b) => a - b);
  return {
    ...ind,
    suo: valMediana(suoi), rete: valMediana(reti), delta: valMediana(netti),
    n, concordi, netti,
    // Quartili invece di un intervallo di confidenza: con venti locali dice la
    // stessa cosa senza far finta di avere una distribuzione.
    q1: ordinati[Math.floor(n * 0.25)] ?? 0,
    q3: ordinati[Math.ceil(n * 0.75) - 1] ?? 0,
    solido: n > 0 && concordi / n >= 0.7,
  };
});

// ── TAGLIO 2 · lo stesso servizio, due canali ─────────────────────────────
// Il confronto più pulito che abbiamo sullo scontrino: stessa sera, stessi
// tavoli, stesso menu. Il conto si fa a parità di numero di commensali e di
// fascia oraria — un tavolo da sei alle nove non è una coppia a mezzogiorno —
// ma resta dentro CHI sceglie il QR, e quello non lo controlliamo.
const VAL_CANALE = (() => {
  const righe = VAL_PANEL.map((p, i) => {
    const r = pseudoRand(i * 31 + 7);
    // Il premio del canale digitale: il menu con le foto, i suggerimenti, e
    // soprattutto il secondo giro che al cameriere non chiedi.
    const premio = 0.06 + valCurva(p.adozioneOggi, 'spesa') * 0.9 + (r() - 0.5) * 0.05;
    const cameriere = p.mesi[11].spesa * (1 - premio * 0.35);
    const digitale = cameriere * (1 + premio);
    const portateCam = 2.2 + r() * 0.5;
    const portateDig = portateCam * (1 + premio * 0.75);
    return {
      id: p.id, nome: p.nome, tipo: p.tipo, citta: p.citta,
      adozione: p.adozioneOggi, coperti: p.mesi[11].coperti,
      cameriere, digitale, premio: ((digitale - cameriere) / cameriere) * 100,
      portateCam, portateDig,
    };
  }).filter(x => x.adozione >= 2)   // sotto il 2% gli ordini digitali sono troppo pochi
    .sort((a, b) => b.premio - a.premio);
  const premi = righe.map(x => x.premio);
  const ordinati = [...premi].sort((a, b) => a - b);
  return {
    righe,
    mediano: valMediana(premi),
    q1: ordinati[Math.floor(premi.length * 0.25)] ?? 0,
    q3: ordinati[Math.ceil(premi.length * 0.75) - 1] ?? 0,
    concordi: premi.filter(v => v > 0).length,
    n: premi.length,
    portateDelta: valMediana(righe.map(x => ((x.portateDig - x.portateCam) / x.portateCam) * 100)),
    scontrinoCam: valMediana(righe.map(x => x.cameriere)),
    scontrinoDig: valMediana(righe.map(x => x.digitale)),
  };
})();

// ── IL CONTO IN EURO ──────────────────────────────────────────────────────
const VAL_CONTO = (() => {
  const spesa = VAL_ENTRO.find(i => i.k === 'spesa');
  const coperti = VAL_ENTRO.find(i => i.k === 'coperti');
  // Nel conto entrano SOLO le voci che reggono: se i coperti si muovono ma la
  // metà dei locali va dall'altra parte, quel pezzo di ricavo non si mette in
  // una slide. Si scrive che c'è e che non tiene.
  const componenti = [spesa, coperti].filter(c => c.solido);
  const esclusi = [spesa, coperti].filter(c => !c.solido);
  const moltiplicatore = componenti.reduce((m, c) => m * (1 + c.delta / 100), 1);

  const copertiMese = valMediana(VAL_PANEL.map(p => p.mesi[11].coperti)) * 28;
  const spesaOggi = valMediana(VAL_PANEL.map(p => p.mesi[11].spesa));
  const ricavoMese = copertiMese * spesaOggi;
  const deltaRicavo = ricavoMese * (moltiplicatore - 1);
  const margine = deltaRicavo * (VAL_MARGINE_LORDO / 100);
  const canoneMediano = valMediana(VAL_PANEL.map(p => p.canone).filter(c => c > 0)) || PIANI[1].price;
  return {
    copertiMese, spesaOggi, ricavoMese, deltaRicavo, margine, moltiplicatore,
    componenti: componenti.map(c => ({ label: c.label, delta: c.delta })),
    esclusi: esclusi.map(c => ({ label: c.label, delta: c.delta, concordi: c.concordi, n: c.n })),
    canoneMediano, volte: canoneMediano ? margine / canoneMediano : 0,
    margineLordo: VAL_MARGINE_LORDO,
    locali: VAL_STORIE_VALIDE.length, totali: VAL_PANEL.length,
    concordi: spesa.concordi, n: spesa.n,
    piccolo: (() => {
      const cop = 100 * 28;
      const d = cop * spesaOggi * (moltiplicatore - 1);
      const m = d * (VAL_MARGINE_LORDO / 100);
      return { coperti: 100, margine: m, canone: PIANI[1].price, volte: m / PIANI[1].price };
    })(),
  };
})();

// ── IL LEGAME CON L'ABBANDONO ─────────────────────────────────────────────
const VAL_CHURN = (() => {
  const ad = (l) => l.qrAdoption ?? 0;
  const inattivi = LOCALI.filter(locInattivo);
  const attivi = LOCALI.filter(locAttivo);
  return {
    motivoPct: 34,
    adozioneMedianaAttivi: valMediana(attivi.map(ad)),
    adozioneMedianaInattivi: valMediana(inattivi.map(ad)),
    inattiviSottoSoglia: inattivi.filter(l => ad(l) < VAL_SOGLIA).length,
    inattiviTot: inattivi.length,
    churnedTot: LOCALI.filter(locChurned).length,
  };
})();

// ── CON CHI PARLARNE ──────────────────────────────────────────────────────
// Chi non ha ancora fatto il salto, ordinato per quanto varrebbe il salto sul
// suo volume. È una proiezione, ed è scritta come tale.
const VAL_POTENZIALE = VAL_PANEL
  .filter(p => p.adozioneOggi < VAL_SOGLIA)
  .map(p => {
    const ricavoMese = p.mesi[11].coperti * 28 * p.mesi[11].spesa;
    const delta = ricavoMese * (VAL_CONTO.moltiplicatore - 1);
    return {
      ...p, ricavoMese, deltaRicavo: delta, deltaMargine: delta * (VAL_MARGINE_LORDO / 100),
      puntiDaFare: Math.max(0, +(VAL_SOGLIA + 3 - p.adozioneOggi).toFixed(1)),
    };
  })
  .sort((a, b) => b.deltaMargine - a.deltaMargine);

window.VAL_SOGLIA = VAL_SOGLIA;
window.VAL_MESI = VAL_MESI;
window.VAL_PANEL = VAL_PANEL;
window.VAL_RETE = VAL_RETE;
window.VAL_INDICATORI = VAL_INDICATORI;
window.VAL_PERNO = VAL_PERNO;
window.VAL_STORIE = VAL_STORIE;
window.VAL_STORIE_VALIDE = VAL_STORIE_VALIDE;
window.VAL_ESEMPIO = VAL_ESEMPIO;
window.VAL_ENTRO = VAL_ENTRO;
window.VAL_CANALE = VAL_CANALE;
window.VAL_CONTO = VAL_CONTO;
window.VAL_CHURN = VAL_CHURN;
window.VAL_POTENZIALE = VAL_POTENZIALE;
window.VAL_SALTO_MINIMO = VAL_SALTO_MINIMO;
window.VAL_CONTROLLO = VAL_CONTROLLO;
window.VAL_SALTO_FERMO = VAL_SALTO_FERMO;
window.valMediana = valMediana;
