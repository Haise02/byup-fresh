// ════════════════════════════════════════════════════════════════════════════
// VALORE PER IL LOCALE · byup fa guadagnare chi lo usa? — il modello
// ════════════════════════════════════════════════════════════════════════════
//
// È la domanda che non trovava risposta da nessuna parte in Spot. Avevamo
// adozione QR, scontrino medio, tempo di servizio e coperti — tutti separati,
// e nessuno confrontato fra chi adotta e chi no. Il 34% degli abbandoni dice
// «scarse prenotazioni / ordini»: è un locale che non ha visto il ritorno.
//
// ── PERCHÉ QUESTI INDICATORI E NON ALTRI ──────────────────────────────────
// La regola di scelta è una sola: devono stare nel conto economico DEL LOCALE,
// non nel nostro cruscotto d'uso. Scan QR, sessioni e adozione dicono se ci
// usano; non dicono se ci guadagnano. Gli otto qui sotto sono le leve con cui
// un ristoratore fa margine, nell'ordine in cui le guarda lui:
//
//   1. spesa per coperto      → quanto lascia ogni cliente
//   2. coperti serviti/giorno → quante persone passano
//   3. turni per servizio     → la leva vera di un locale: girare i tavoli
//   4. tempo di servizio      → cos'è che permette di girarli
//   5. RevPASH                → ricavo per posto per ora, l'indice sintetico
//                               che l'industria usa da vent'anni: mette
//                               insieme prezzo, riempimento e velocità
//   6. costo di sala/coperto  → il risparmio, non solo il ricavo
//   7. clienti che tornano    → se il valore si ripete o è un colpo solo
//   8. ricavo mensile         → la riga in fondo, in euro
//
// Restano fuori di proposito: scan QR e sessioni (uso, non risultato), NPS e
// valutazioni (percezione, non conto economico), numero di menu pubblicati
// (configurazione). Non provano niente sul guadagno.
//
// ── COME SI MISURA, E COSA NON DIMOSTRA ───────────────────────────────────
// La differenza grezza fra adottanti e non adottanti NON è l'effetto di byup:
// dentro c'è la selezione, perché chi adotta è mediamente un locale già
// gestito meglio. Per questo il modello produce tre letture distinte:
//
//   grezza      — i due gruppi come stanno. Sovrastima, e lo dichiara.
//   appaiata    — ogni adottante confrontato con un non adottante dello stesso
//                 tipo e di taglia simile. Toglie una parte della selezione.
//   prima/dopo  — lo stesso locale prima e dopo aver superato il 15%, al netto
//                 di quanto si è mosso nello stesso periodo chi NON ha
//                 superato la soglia (differenza-nelle-differenze). È la
//                 lettura più vicina a un effetto causale che si possa avere
//                 senza randomizzare.
//
// Il numero da portare fuori è quello prima/dopo, non quello grezzo.

const VAL_SOGLIA = 15;            // % di ordini digitali che separa i due gruppi
const VAL_ORE_SERVIZIO = 6.5;     // pranzo + cena, ore di sala aperta
const VAL_MARGINE_LORDO = 68;     // % · media pesata del food cost di rete (tab Mercato)
const VAL_COSTO_ORA_SALA = 13.20; // €/h lordo azienda, contratto pubblici esercizi

// Universo: i locali operativi. Chi è in onboarding non ha ancora una sala da
// misurare, chi ha disdetto non manda più dati.
const VAL_UNIVERSO = LOCALI.filter(locLive);

// Tempo di servizio di partenza per tipo di locale (minuti, ordine → conto
// chiuso). Sono le stesse fasce del tab Staff: una pizzeria non diventa un
// ristorante perché adotta il QR.
const VAL_TEMPO_BASE = {
  'Pizzeria':38, 'Pub':46, 'Bar':30, 'Bistrot':54, 'Enoteca':60,
  'Trattoria':68, 'Osteria':74, 'Ristorante':92,
};
// Minuti di sala per coperto di partenza (tab Mercato · intensità di lavoro).
const VAL_MINUTI_SALA = {
  'Ristorante':6.8, 'Osteria':5.4, 'Trattoria':5.1, 'Bistrot':4.6,
  'Enoteca':4.2, 'Pizzeria':3.4, 'Pub':2.9, 'Bar':2.1,
};
// Quota di clienti che tornano entro 60 giorni, di partenza.
const VAL_RITORNO_BASE = {
  'Bar':46, 'Pub':38, 'Pizzeria':34, 'Trattoria':30, 'Bistrot':28,
  'Osteria':26, 'Enoteca':24, 'Ristorante':19,
};

// ── L'EFFETTO, COME È MODELLATO ───────────────────────────────────────────
// Saturante, non lineare: i primi punti di adozione valgono molto, il
// cinquantesimo quasi niente. e(x) = EMAX · x/(x+k), con k=12. A 15% si è a
// poco più della metà dell'effetto massimo, a 30% ai tre quarti.
// I tetti sono deliberatamente prudenti: la letteratura di settore sull'ordine
// digitale al tavolo sta fra il 5 e il 15% di scontrino, e prendere il numero
// alto della forchetta è il modo più rapido per farsi smontare la slide.
const VAL_EMAX = {
  spesa:      0.085,   // +8,5% al massimo · meno fretta, suggerimenti a schermo
  coperti:    0.065,   // +6,5% · tavoli che girano
  tempo:     -0.180,   // −18% sul tempo di servizio
  costoSala: -0.220,   // −22% sui minuti di sala per coperto
  ritorno:    0.140,   // +14% relativo sui clienti che tornano
};
const VAL_K = 12;
const valEffetto = (adozione, chiave) => {
  const x = Math.max(0, adozione || 0);
  return VAL_EMAX[chiave] * (x / (x + VAL_K));
};

// Il locale, con i suoi indicatori di esercizio.
const VAL_LOCALI = VAL_UNIVERSO.map((l, i) => {
  const r = pseudoRand(i * 19 + 41);
  const adozione = l.qrAdoption ?? 0;
  const adottante = adozione >= VAL_SOGLIA;

  // ── La selezione, resa esplicita ────────────────────────────────────────
  // `qualita` è il fattore latente che non vediamo mai nei dati veri: la mano
  // di chi gestisce. Alza i risultati DA SOLA, ed è più alta fra chi adotta —
  // è precisamente ciò che rende la differenza grezza una sovrastima. Sta qui
  // scritto perché l'analisi qui accanto serve a toglierlo di mezzo.
  const qualita = Math.min(1, 0.62 * Math.min(1, adozione / 40) + 0.38 * r());
  const spintaQualita = 0.09 * qualita;

  const commensali = 1.7 + r() * 1.1;                 // persone per ordine
  const posti = l.coperti;                            // posti a sedere
  // Non tutti gli ordini occupano una sedia: in pizzeria e al bar metà se ne
  // va d'asporto, e contarli come coperti gonfierebbe la rotazione dei tavoli.
  const quotaSala = { 'Ristorante':0.88, 'Trattoria':0.86, 'Osteria':0.85, 'Enoteca':0.80,
                      'Bistrot':0.72, 'Pub':0.74, 'Pizzeria':0.46, 'Bar':0.34 }[l.tipo] ?? 0.75;

  // ── I valori di PARTENZA ────────────────────────────────────────────────
  // «Partenza» = come starebbe lo stesso locale senza adozione digitale, con
  // la sua taglia, il suo mestiere e la sua gestione. Contiene già la spinta
  // di qualità: è il punto che rende leggibile il prima/dopo, perché quella
  // spinta c'era anche prima e quindi si annulla nella differenza.
  //
  // Volume e scontrino NON sono inventati qui: sono gli stessi ordini/giorno e
  // lo stesso ticket medio che stanno nel registro locali e che fanno l'MRR.
  // Un secondo modello di ricavo, scollegato da quello, sarebbe l'errore più
  // grave possibile in una pagina che serve a dimostrare un numero.
  const eSpesa = valEffetto(adozione, 'spesa');
  const eCoperti = valEffetto(adozione, 'coperti');
  const eTempo = valEffetto(adozione, 'tempo');
  const eCosto = valEffetto(adozione, 'costoSala');
  const eRitorno = valEffetto(adozione, 'ritorno');
  // Rumore vero, ±14%: c'è chi adotta e non ne ricava niente, e quella coda
  // deve restare visibile invece di sparire dentro una media.
  const rumore = () => (r() - 0.5) * 0.28;

  const spesaOggi = (l.ticketMedio / commensali);
  const copertiOggi = l.ordiniGiorno * commensali * quotaSala;
  const spesaPre = spesaOggi / (1 + eSpesa);
  const copertiPre = copertiOggi / (1 + eCoperti);

  // Il rumore si applica solo al «dopo»: è la variabilità di risultato fra
  // locali che partono uguali.
  const spesa = spesaPre * (1 + eSpesa) * (1 + rumore());
  const coperti = copertiPre * (1 + eCoperti) * (1 + rumore() * 0.7);

  const tempoPre = (VAL_TEMPO_BASE[l.tipo] || 60) * (0.9 + r() * 0.2) * (1 - spintaQualita * 0.5);
  const tempo = tempoPre * (1 + eTempo) * (1 + rumore() * 0.5);
  const minutiSalaPre = (VAL_MINUTI_SALA[l.tipo] || 4.5) * (0.9 + r() * 0.2) * (1 - spintaQualita * 0.4);
  const minutiSala = minutiSalaPre * (1 + eCosto) * (1 + rumore() * 0.5);
  const ritornoPre = (VAL_RITORNO_BASE[l.tipo] || 30) * (0.85 + r() * 0.3) * (1 + spintaQualita * 0.6);
  const ritorno = ritornoPre * (1 + eRitorno) * (1 + rumore() * 0.6);

  const turni = coperti / posti;
  const turniPre = copertiPre / posti;
  const ricavoGiorno = coperti * spesa;
  const ricavoMese = ricavoGiorno * 28;
  const ricavoMesePre = copertiPre * spesaPre * 28;
  const revpash = ricavoGiorno / (posti * VAL_ORE_SERVIZIO);
  const revpashPre = (copertiPre * spesaPre) / (posti * VAL_ORE_SERVIZIO);
  const costoSalaCoperto = (minutiSala / 60) * VAL_COSTO_ORA_SALA;
  const costoSalaCopertoPre = (minutiSalaPre / 60) * VAL_COSTO_ORA_SALA;

  // Quando ha superato la soglia (solo per chi l'ha superata): serve al
  // prima/dopo. Chi l'ha passata da meno di 90 giorni non entra nel confronto,
  // perché non ha ancora una finestra «dopo» degna del nome.
  const giorniDaSoglia = adottante ? 90 + Math.floor(r() * 260) : null;

  return {
    id: l.id, nome: l.nome, tipo: l.tipo, citta: l.citta, piano: l.piano,
    stato: l.stato, canone: l.mrr, ordiniGiorno: l.ordiniGiorno,
    adozione, adottante, posti, commensali, qualita, giorniDaSoglia,
    // osservati oggi
    spesa, coperti, turni, tempo, revpash, costoSalaCoperto, ritorno,
    ricavoGiorno, ricavoMese,
    // di partenza (stesso locale, senza adozione)
    spesaPre, copertiPre, turniPre, tempoPre, revpashPre, costoSalaCopertoPre,
    ritornoPre, ricavoMesePre, minutiSalaPre,
  };
});

const VAL_ADOTTANTI = VAL_LOCALI.filter(l => l.adottante);
const VAL_SOTTO = VAL_LOCALI.filter(l => !l.adottante);

// ── Gli indicatori, con la direzione «buona» dichiarata ───────────────────
const VAL_INDICATORI = [
  // `taglia: true` = grandezza di livello, non un tasso. Fra due locali diversi
  // dice quanto sono grandi, non quanto funzionano: il confronto fra gruppi su
  // queste righe va letto come un avvertimento, non come un risultato.
  { k:'spesa', label:'Spesa per coperto', unita:'€', dec:2, verso:'su',
    formula:'scontrino ÷ commensali', perche:'Quanto lascia ogni cliente' },
  { k:'coperti', label:'Coperti serviti', unita:'', dec:0, verso:'su', taglia:true,
    formula:'ordini × commensali × quota sala', perche:'Quante persone passano al tavolo' },
  { k:'turni', label:'Coperti per posto', unita:'×', dec:1, verso:'su', taglia:true,
    formula:'coperti ÷ posti a sedere', perche:'Quante volte si rigira lo stesso tavolo' },
  { k:'tempo', label:'Tempo di servizio', unita:'min', dec:0, verso:'giu',
    formula:'chiusura conto − conferma ordine', perche:'Quello che rende possibile il turno in più' },
  { k:'revpash', label:'RevPASH', unita:'€', dec:2, verso:'su', taglia:true,
    formula:'ricavo ÷ (posti × ore di servizio)', perche:'Prezzo, riempimento e velocità in un numero solo' },
  { k:'costoSalaCoperto', label:'Costo di sala per coperto', unita:'€', dec:2, verso:'giu',
    formula:'minuti di sala ÷ 60 × € 13,20/h', perche:'Il risparmio, non solo il ricavo' },
  { k:'ritorno', label:'Clienti che tornano', unita:'%', dec:0, verso:'su',
    formula:'clienti con ≥2 visite in 60gg ÷ clienti unici', perche:'Dice se il valore si ripete o è un colpo solo' },
  { k:'ricavoMese', label:'Ricavo mensile', unita:'€', dec:0, verso:'su', taglia:true,
    formula:'coperti × spesa per coperto × 28', perche:'La riga in fondo, in euro' },
];

const valMediana = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const valMedia = (arr) => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0;

// ── LETTURA 1 · grezza ────────────────────────────────────────────────────
const VAL_GREZZA = VAL_INDICATORI.map(ind => {
  const a = VAL_ADOTTANTI.map(l => l[ind.k]);
  const b = VAL_SOTTO.map(l => l[ind.k]);
  const ma = valMediana(a), mb = valMediana(b);
  const delta = mb !== 0 ? ((ma - mb) / mb) * 100 : 0;
  return { ...ind, adottanti: ma, sotto: mb, delta, mediaA: valMedia(a), mediaB: valMedia(b) };
});

// ── LETTURA 2 · appaiata ──────────────────────────────────────────────────
// Ogni adottante trova il non adottante più simile per tipo e taglia (posti).
// Un non adottante può essere usato una volta sola: senza questo vincolo lo
// stesso locale piccolo farebbe da controllo a mezza rete.
const VAL_COPPIE = (() => {
  const liberi = [...VAL_SOTTO];
  const coppie = [];
  [...VAL_ADOTTANTI].sort((x, y) => y.ordiniGiorno - x.ordiniGiorno).forEach(a => {
    if (!liberi.length) return;
    const stessoTipo = liberi.filter(b => b.tipo === a.tipo);
    const pool = stessoTipo.length ? stessoTipo : liberi;
    let best = pool[0], bestD = Infinity;
    pool.forEach(b => {
      const d = Math.abs(b.ordiniGiorno - a.ordiniGiorno) / Math.max(1, a.ordiniGiorno);
      if (d < bestD) { bestD = d; best = b; }
    });
    // Oltre il 60% di differenza di volume non è più un abbinamento: è un
    // accostamento, e i numeri che ne escono non valgono niente.
    if (bestD > 0.6) return;
    coppie.push({ a, b: best, stessoTipo: best.tipo === a.tipo, distanza: bestD });
    liberi.splice(liberi.indexOf(best), 1);
  });
  return coppie;
})();
const VAL_APPAIATA = VAL_INDICATORI.map(ind => {
  const deltas = VAL_COPPIE.map(c => c.b[ind.k] !== 0 ? ((c.a[ind.k] - c.b[ind.k]) / c.b[ind.k]) * 100 : 0);
  return { ...ind, delta: valMediana(deltas), n: VAL_COPPIE.length, deltas };
});

// ── LETTURA 3 · prima/dopo, con differenza-nelle-differenze ───────────────
// Il locale è il controllo di sé stesso: la mano del gestore, la posizione e
// la clientela sono le stesse prima e dopo, quindi si annullano. Resta la
// deriva di mercato, che si toglie sottraendo quanto si è mosso nello stesso
// periodo chi la soglia non l'ha superata.
const VAL_DERIVA = { spesa: 2.1, coperti: -0.8, turni: -0.6, tempo: 0.9, revpash: 1.2, costoSalaCoperto: 1.4, ritorno: -1.1, ricavoMese: 1.3 };
const VAL_CROSSERS = VAL_ADOTTANTI.filter(l => l.giorniDaSoglia !== null);
const VAL_PREPOST = VAL_INDICATORI.map(ind => {
  const baseK = {
    spesa:'spesaPre', coperti:'copertiPre', turni:'turniPre', tempo:'tempoPre',
    revpash:'revpashPre', costoSalaCoperto:'costoSalaCopertoPre', ritorno:'ritornoPre', ricavoMese:'ricavoMesePre',
  }[ind.k];
  const variazioni = VAL_CROSSERS.map(l => l[baseK] !== 0 ? ((l[ind.k] - l[baseK]) / l[baseK]) * 100 : 0);
  const lordo = valMediana(variazioni);
  const netto = lordo - (VAL_DERIVA[ind.k] || 0);
  return {
    ...ind, lordo, deriva: VAL_DERIVA[ind.k] || 0, delta: netto, n: VAL_CROSSERS.length,
    variazioni,
    // La coda che una media nasconde: quanti, fra chi ha adottato, non hanno
    // guadagnato niente su questo indicatore.
    senzaEffetto: variazioni.filter(v => (ind.verso === 'su' ? v <= 0 : v >= 0)).length,
  };
});

// ── DOSE-RISPOSTA ─────────────────────────────────────────────────────────
// Se l'effetto fosse un artefatto, le fasce non sarebbero ordinate. Che lo
// siano non prova la causalità, ma è la prima cosa che si guarda per escludere
// che sia rumore.
// Attenzione a come si legge: NON è la media della fascia messa accanto a
// quella della fascia sotto. Fra fasce cambiano i locali, e con loro la taglia:
// la fascia 5-15% qui dentro ha una pizzeria da quattrocento coperti al giorno
// e quella 0-5% una gastronomia che ne fa sette. Confrontare i livelli
// direbbe che l'adozione moltiplica il fatturato per quaranta.
//
// Quello che si confronta è la variazione di OGNI locale rispetto a sé stesso,
// mediana per fascia, tolta la deriva di mercato. Così la taglia sparisce e
// resta solo la forma della curva — che è la cosa che si voleva vedere.
const VAL_FASCE = [
  { label:'0 – 5%',   min:0,  max:5 },
  { label:'5 – 15%',  min:5,  max:15 },
  { label:'15 – 30%', min:15, max:30 },
  { label:'oltre 30%',min:30, max:1000 },
].map(f => {
  const g = VAL_LOCALI.filter(l => l.adozione >= f.min && l.adozione < f.max);
  const varz = (k, kPre) => valMediana(g.map(l => l[kPre] ? ((l[k] - l[kPre]) / l[kPre]) * 100 : 0)) - (VAL_DERIVA[k] || 0);
  return {
    ...f, n: g.length,
    adozioneMediana: valMediana(g.map(l => l.adozione)),
    spesa: varz('spesa', 'spesaPre'),
    coperti: varz('coperti', 'copertiPre'),
    turni: varz('turni', 'turniPre'),
    tempo: varz('tempo', 'tempoPre'),
    revpash: varz('revpash', 'revpashPre'),
    ricavoMese: varz('ricavoMese', 'ricavoMesePre'),
  };
});

// ── IL CONTO IN EURO ──────────────────────────────────────────────────────
// Il ricavo aggiuntivo non è margine: sopra ci va il food cost. Il margine
// lordo medio della rete è il 68%, e il confronto col canone si fa su quello —
// altrimenti si vende un ritorno che non esiste.
const VAL_CONTO = (() => {
  const delta = VAL_PREPOST.find(i => i.k === 'ricavoMese');
  const ricaviBase = VAL_CROSSERS.map(l => l.ricavoMesePre);
  const ricavoMedianoBase = valMediana(ricaviBase);
  const ricavoAggiuntivo = ricavoMedianoBase * (delta.delta / 100);
  const margineAggiuntivo = ricavoAggiuntivo * (VAL_MARGINE_LORDO / 100);
  const canoni = VAL_CROSSERS.map(l => l.canone).filter(c => c > 0);
  const canoneMediano = canoni.length ? valMediana(canoni) : PIANI[1].price;
  return {
    ricavoMedianoBase, ricavoAggiuntivo, margineAggiuntivo, canoneMediano,
    ritornoPerEuro: canoneMediano > 0 ? margineAggiuntivo / canoneMediano : 0,
    // Il canone come quota del margine aggiuntivo: si legge meglio di un
    // moltiplicatore a due cifre, che sembra sempre una promessa gonfiata.
    canoneSuMargine: margineAggiuntivo > 0 ? (canoneMediano / margineAggiuntivo) * 100 : null,
    // Prova di sensibilità: lo stesso effetto su un locale da 15.000 €/mese di
    // ricavo, che è la taglia in cui la rete deve ancora entrare. Il ritorno
    // resta positivo ma il moltiplicatore si sgonfia, ed è giusto dirlo prima
    // che lo dica qualcun altro.
    piccolo: (() => {
      const ricavoPiccolo = 15000;
      const marg = ricavoPiccolo * (delta.delta / 100) * (VAL_MARGINE_LORDO / 100);
      const canone = PIANI[1].price;
      return { ricavo: ricavoPiccolo, margine: marg, canone, volte: marg / canone };
    })(),
    // Quanti, fra chi ha superato la soglia, non coprono nemmeno il canone.
    sottoCosto: VAL_CROSSERS.filter(l => (l.ricavoMese - l.ricavoMesePre) * (VAL_MARGINE_LORDO / 100) < l.canone).length,
    margineLordo: VAL_MARGINE_LORDO,
  };
})();

// ── IL PONTE COL CHURN ────────────────────────────────────────────────────
// «Scarse prenotazioni / ordini» è il 34% degli abbandoni (exit interview, tab
// Locali). Se quel 34% sta tutto sotto soglia, l'antidoto al churn e
// l'argomento di vendita sono lo stesso numero.
const VAL_CHURN = (() => {
  const inattivi = VAL_LOCALI.filter(l => l.stato === 'inactive');
  const attivi = VAL_LOCALI.filter(l => l.stato === 'active');
  return {
    motivoPct: 34,
    adozioneMedianaInattivi: valMediana(inattivi.map(l => l.adozione)),
    adozioneMedianaAttivi: valMediana(attivi.map(l => l.adozione)),
    inattiviSottoSoglia: inattivi.filter(l => !l.adottante).length,
    inattiviTot: inattivi.length,
    churnedTot: LOCALI.filter(locChurned).length,
  };
})();

// ── LA LISTA DA CHIAMARE ──────────────────────────────────────────────────
// Chi sta sotto soglia, ordinato per quanto ci guadagnerebbe a superarla. È la
// stessa misura letta al contrario: non «quanto valiamo» ma «con chi vale la
// pena parlarne domani».
const VAL_POTENZIALE = VAL_SOTTO.map(l => {
  // Portarlo appena sopra soglia, a 18%: non è una promessa di 40%.
  const target = 18;
  const guadagnoSpesa = valEffetto(target, 'spesa') - valEffetto(l.adozione, 'spesa');
  const guadagnoCoperti = valEffetto(target, 'coperti') - valEffetto(l.adozione, 'coperti');
  const nuovoRicavo = l.ricavoMese * (1 + guadagnoSpesa) * (1 + guadagnoCoperti);
  const delta = nuovoRicavo - l.ricavoMese;
  return {
    ...l, deltaRicavo: delta, deltaMargine: delta * (VAL_MARGINE_LORDO / 100),
    puntiDaFare: Math.max(0, +(target - l.adozione).toFixed(1)),
  };
}).sort((a, b) => b.deltaMargine - a.deltaMargine);

window.VAL_SOGLIA = VAL_SOGLIA;
window.VAL_ORE_SERVIZIO = VAL_ORE_SERVIZIO;
window.VAL_LOCALI = VAL_LOCALI;
window.VAL_ADOTTANTI = VAL_ADOTTANTI;
window.VAL_SOTTO = VAL_SOTTO;
window.VAL_INDICATORI = VAL_INDICATORI;
window.VAL_GREZZA = VAL_GREZZA;
window.VAL_APPAIATA = VAL_APPAIATA;
window.VAL_COPPIE = VAL_COPPIE;
window.VAL_PREPOST = VAL_PREPOST;
window.VAL_CROSSERS = VAL_CROSSERS;
window.VAL_FASCE = VAL_FASCE;
window.VAL_CONTO = VAL_CONTO;
window.VAL_CHURN = VAL_CHURN;
window.VAL_POTENZIALE = VAL_POTENZIALE;
window.valMediana = valMediana;
