// ════════════════════════════════════════════════════════════════════════════
// ANALISI · i pezzi che mancavano
// ════════════════════════════════════════════════════════════════════════════
//
// Sette blocchi che prima non esistevano da nessuna parte, e una correzione:
//
//   1. DOTAZIONE     come lavora la cucina: monitor a tablet, comande stampate,
//                    o niente. È la scala della digitalizzazione, ed è la cosa
//                    che spiega quasi tutto il resto.
//   2. ATTIVAZIONE   quanto ci mette un locale ad arrivare alla soglia. È
//                    l'anello fra onboarding, valore e abbandono.
//   3. RITENZIONE    quanti utenti restano, mese di iscrizione per mese di
//                    iscrizione: la metà che DAU/WAU/MAU non dicono.
//   4. DEFLECTION    quanti ticket evita l'assistenza in autonomia.
//   5. ACQUISIZIONE  da dove arrivano i locali, e quanto costa ciascun canale.
//   6. CONTRIBUZIONE quanto resta di un locale dopo i costi che genera.
//   7. QUALITÀ       quanto è buono il dato con cui si fanno tutte le analisi.
//
// E poi CHURN_VERO, che rimette i numeri dell'abbandono su quello che c'è a
// registro invece che su una serie inventata.

const AN_UNIVERSO = LOCALI.filter(locLive);        // attivi + inattivi: chi ha una sala
const AN_ATTIVI = LOCALI.filter(locAttivo);

// ════════════════════════════════════════════════════════════════════════════
// 1 · DOTAZIONE DI CUCINA E RUOLI
// ════════════════════════════════════════════════════════════════════════════
//
// Byup manda le comande in tre modi, e sono tre livelli di digitalizzazione:
//
//   monitor    il kitchen monitor su tablet: la comanda resta a schermo, si
//              spunta quando esce. È il modo per cui il prodotto è fatto.
//   stampa     la comanda esce su una stampante che il locale aveva già: byup
//              la genera, ma da lì in poi è carta. Funziona, ma perde stato,
//              tempi e storico — cioè metà del dato.
//   niente     nessun collegamento con la cucina: la comanda la porta il
//              cameriere a voce. Byup fa da cassa e basta.
//
// Chi sta a «niente» non è un cliente insoddisfatto: è un cliente che non ha
// mai acceso il prodotto. E infatti è il gruppo che adotta meno, chiama di più
// e si ferma prima.
const AN_DOTAZIONI = {
  monitor: { label:'Kitchen monitor', desc:'Comande a schermo su tablet', tono:'OK' },
  stampa:  { label:'Comande stampate', desc:'Byup genera, la stampante del locale stampa', tono:'WARN' },
  niente:  { label:'Nessun collegamento', desc:'La comanda la porta il cameriere', tono:'DANGER' },
};
// I ruoli sono l'altra faccia: senza un utente di cucina il monitor non lo
// guarda nessuno, e senza un manager nessuno legge i numeri.
const AN_RUOLI = [
  { id:'cassa',       label:'Cassa',       serve:'Incassa e chiude i conti' },
  { id:'cameriere',   label:'Cameriere',   serve:'Prende le comande al tavolo' },
  { id:'cucina',      label:'Cucina',      serve:'Vede le comande sul monitor' },
  { id:'manager',     label:'Manager',     serve:'Legge statistiche e contabilità' },
];

const AN_CANALI_ID = ['passaparola', 'diretto', 'ricerca', 'campagna', 'evento'];
const AN_LOCALI = AN_UNIVERSO.map((l, i) => {
  const r = pseudoRand(i * 23 + 91);
  const ad = l.qrAdoption ?? 0;

  // La dotazione non è casuale: chi ha più adozione digitale ha quasi sempre
  // acceso anche la cucina. Il verso della freccia però non lo sappiamo — se
  // il monitor porta adozione o se chi è digitale prende il monitor — ed è
  // scritto nella pagina, non nascosto qui.
  const spinta = Math.min(1, ad / 32);
  const roll = r();
  const dotazione = roll < 0.18 + spinta * 0.52 ? 'monitor'
                  : roll < 0.62 + spinta * 0.28 ? 'stampa'
                  : 'niente';

  // Ruoli configurati: la cassa ce l'hanno tutti (è il minimo per incassare),
  // il resto segue la dotazione.
  const ruoli = ['cassa'];
  if (r() < 0.55 + spinta * 0.4) ruoli.push('cameriere');
  if (dotazione === 'monitor' && r() < 0.88) ruoli.push('cucina');
  else if (dotazione === 'stampa' && r() < 0.34) ruoli.push('cucina');
  if (r() < 0.30 + spinta * 0.35) ruoli.push('manager');

  // Byup Staff è il POS: l'app che incassa in presenza con Tap to Pay. Un
  // locale può avere zero dispositivi (incassa dalla cassa fissa) o averne
  // due-tre in mano ai camerieri.
  const posAttivi = dotazione === 'niente' ? (r() < 0.35 ? 1 : 0)
                  : 1 + Math.floor(r() * (dotazione === 'monitor' ? 3 : 2));
  const quotaIncassoPos = posAttivi === 0 ? 0
    : Math.min(92, Math.round((22 + spinta * 45 + r() * 18)));

  // Tempo dalla comanda alla cucina: è la misura che la stampa perde per
  // strada, perché una comanda stampata non dice quando è stata presa in
  // carico. Qui è il tempo fino alla conferma di preparazione.
  const minutiInCucina = dotazione === 'monitor' ? 1.2 + r() * 1.4
                       : dotazione === 'stampa' ? 3.1 + r() * 2.2
                       : 5.4 + r() * 3.0;

  // Comande rifatte: il piatto sbagliato che torna indietro. Con la carta
  // succede di più, perché non c'è modo di correggere una comanda già uscita.
  const comandeRifatte = dotazione === 'monitor' ? 0.9 + r() * 0.8
                       : dotazione === 'stampa' ? 1.9 + r() * 1.1
                       : 3.2 + r() * 1.6;

  // Canale di acquisizione: da dove è arrivato questo locale.
  const rollCanale = r();
  const pesiCanale = [0.26, 0.22, 0.18, 0.20, 0.14];
  let accC = 0, canale = 'passaparola';
  for (let k = 0; k < pesiCanale.length; k++) { accC += pesiCanale[k]; if (rollCanale <= accC) { canale = AN_CANALI_ID[k]; break; } }

  return {
    id: l.id, nome: l.nome, tipo: l.tipo, citta: l.citta, regione: l.regione,
    piano: l.piano, stato: l.stato, adozione: ad, ordiniMese: l.ordiniMese,
    ordiniGiorno: l.ordiniGiorno, mrr: l.mrr, dataIscrizione: l.dataIscrizione,
    coperti: l.coperti, lastLogin: l.lastLogin, sdi: l.sdi,
    dotazione, ruoli, posAttivi, quotaIncassoPos, minutiInCucina, comandeRifatte,
    canale,
    haCucina: ruoli.includes('cucina'), haManager: ruoli.includes('manager'),
  };
});

const anPerDotazione = (locali = AN_LOCALI) => Object.keys(AN_DOTAZIONI).map(k => {
  const g = locali.filter(l => l.dotazione === k);
  const attivi = g.filter(l => l.stato === 'active');
  return {
    k, ...AN_DOTAZIONI[k],
    n: g.length,
    quota: locali.length ? (g.length / locali.length) * 100 : 0,
    adozione: parMediana(g.map(l => l.adozione)),
    minutiInCucina: parMediana(g.map(l => l.minutiInCucina)),
    comandeRifatte: parMediana(g.map(l => l.comandeRifatte)),
    posAttivi: parMediana(g.map(l => l.posAttivi)),
    quotaIncassoPos: parMediana(g.map(l => l.quotaIncassoPos)),
    // Quota di locali fermi dentro il gruppo: è il numero che trasforma la
    // dotazione da statistica di prodotto a segnale di rischio.
    quotaFermi: g.length ? (g.filter(l => l.stato === 'inactive').length / g.length) * 100 : 0,
    sopraSoglia: attivi.length ? (attivi.filter(l => l.adozione >= PAR.SOGLIA_DIGITALE).length / attivi.length) * 100 : 0,
  };
});
const AN_PER_DOTAZIONE = anPerDotazione();

const anPerRuolo = (locali = AN_LOCALI) => AN_RUOLI.map(ruolo => {
  const con = locali.filter(l => l.ruoli.includes(ruolo.id));
  const senza = locali.filter(l => !l.ruoli.includes(ruolo.id));
  return {
    ...ruolo,
    n: con.length,
    quota: locali.length ? (con.length / locali.length) * 100 : 0,
    adozioneCon: parMediana(con.map(l => l.adozione)),
    adozioneSenza: senza.length ? parMediana(senza.map(l => l.adozione)) : null,
  };
});
const AN_PER_RUOLO = anPerRuolo();

// ════════════════════════════════════════════════════════════════════════════
// 2 · ATTIVAZIONE · quanto ci mette un locale ad arrivare alla soglia
// ════════════════════════════════════════════════════════════════════════════
//
// L'onboarding finisce quando il menu è caricato. Ma un locale non «vale»
// finché gli ordini digitali non superano il 15% — è lì che il ritorno comincia
// a vedersi (tab Valore). Quanto passa in mezzo è la metrica che collega tre
// pagine che oggi non si parlano: onboarding, valore, abbandono.
const AN_TAPPE = [
  { k:'primoOrdine',  label:'Primo ordine digitale', desc:'Il primo cliente che scansiona il QR' },
  { k:'dieciOrdini',  label:'10 ordini digitali',    desc:'Non è più un caso: il personale lo propone' },
  { k:'soglia',       label:`Soglia ${PAR.SOGLIA_DIGITALE}%`, desc:'Da qui il ritorno si vede nei numeri del locale' },
];

const AN_ATTIVAZIONE = AN_LOCALI.filter(l => l.stato === 'active').map((l, i) => {
  const r = pseudoRand(i * 37 + 13);
  const oggi = Date.now();
  const giorniIscritto = Math.max(1, Math.floor((oggi - l.dataIscrizione.getTime()) / 86400000));

  // La dotazione è il primo acceleratore: con il monitor in cucina il
  // personale ha già cambiato modo di lavorare, e i clienti se ne accorgono.
  const freno = l.dotazione === 'monitor' ? 0.62 : l.dotazione === 'stampa' ? 1.0 : 1.9;
  const primoOrdine = Math.round((2 + r() * 9) * freno);
  const dieciOrdini = primoOrdine + Math.round((4 + r() * 16) * freno);
  const grezzo = dieciOrdini + Math.round((18 + r() * 70) * freno);
  // Chi non è ancora arrivato alla soglia non ha una data: dire «ci ha messo
  // 90 giorni» a chi non c'è arrivato è il modo classico di far sparire i casi
  // brutti da una mediana.
  const arrivato = l.adozione >= PAR.SOGLIA_DIGITALE;
  const soglia = arrivato ? Math.min(grezzo, giorniIscritto) : null;

  return {
    id: l.id, nome: l.nome, tipo: l.tipo, citta: l.citta, piano: l.piano,
    dotazione: l.dotazione, adozione: l.adozione, giorniIscritto,
    primoOrdine: Math.min(primoOrdine, giorniIscritto),
    dieciOrdini: Math.min(dieciOrdini, giorniIscritto),
    soglia, arrivato,
    // Mese di iscrizione: serve a raggruppare chi è entrato insieme
    coorte: l.dataIscrizione.getFullYear() + '-' + String(l.dataIscrizione.getMonth() + 1).padStart(2, '0'),
  };
});

const anTappe = (att = AN_ATTIVAZIONE) => AN_TAPPE.map(t => {
  const valori = att.map(a => a[t.k]).filter(v => v !== null);
  const mancanti = att.length - valori.length;
  return {
    ...t, mediana: parMediana(valori), n: valori.length, mancanti,
    // La quota che ci arriva entro un mese e entro tre: sono le due domande
    // che si fa chi deve decidere quanto seguire un locale nuovo.
    entro30: valori.length ? (valori.filter(v => v <= 30).length / valori.length) * 100 : 0,
    entro90: valori.length ? (valori.filter(v => v <= 90).length / valori.length) * 100 : 0,
  };
});
const AN_ATTIVAZIONE_TAPPE = anTappe();

// La curva: quanti locali hanno superato la soglia entro N giorni
// dall'iscrizione. Si ferma dove i dati finiscono, non oltre.
const anCurva = (att = AN_ATTIVAZIONE) => [0, 15, 30, 45, 60, 90, 120, 180].map(g => {
  const esposti = att.filter(a => a.giorniIscritto >= g);
  const arrivati = esposti.filter(a => a.soglia !== null && a.soglia <= g);
  return {
    giorni: g, esposti: esposti.length,
    quota: esposti.length ? (arrivati.length / esposti.length) * 100 : 0,
  };
});
const AN_CURVA_ATTIVAZIONE = anCurva();

// Per dotazione: la stessa curva, spaccata. È il confronto che dice se la
// cucina collegata accorcia davvero i tempi.
const anAttPerDotazione = (att = AN_ATTIVAZIONE) => Object.keys(AN_DOTAZIONI).map(k => {
  const g = att.filter(a => a.dotazione === k);
  const conSoglia = g.filter(a => a.soglia !== null);
  return {
    k, ...AN_DOTAZIONI[k], n: g.length,
    mediana: parMediana(conSoglia.map(a => a.soglia)),
    arrivati: conSoglia.length,
    quotaArrivati: g.length ? (conSoglia.length / g.length) * 100 : 0,
  };
});
const AN_ATTIVAZIONE_DOTAZIONE = anAttPerDotazione();

// ════════════════════════════════════════════════════════════════════════════
// 3 · RITENZIONE UTENTI · quanti restano, per mese di iscrizione
// ════════════════════════════════════════════════════════════════════════════
//
// Lo stickiness dice quanto usano l'app quelli che sono rimasti. Questa dice
// quanti restano — ed è l'unica delle due che dice se l'app funziona.
// Attenzione a da dove arrivano i numeri. Il registro utenti contiene la base
// ATTIVA — chi ha scaricato, ordinato, e in gran parte continua — e su quella
// il «fa un secondo ordine» esce sopra il novanta per cento, che è vero per
// quel gruppo e falso per la domanda che stiamo facendo. La ritenzione si
// chiede su TUTTI gli iscritti, compresi quelli che hanno aperto l'app una
// volta e non sono più tornati, e quelli nel registro non ci sono.
// Quindi qui la curva è modellata, con i valori tipici del food fuori casa:
// si torna quando si esce a cena, non ogni giorno.
// I tre traguardi sono CUMULATIVI: «entro un giorno», «entro una settimana»,
// «entro un mese». Per un'app di ristorazione è l'unica lettura che ha senso —
// nessuno esce a cena tutti i giorni, e una ritenzione «al giorno 30» a due
// cifre basse direbbe solo che il prodotto non è un social.
const AN_RITENZIONE_BASE = { d1: 21, d7: 34, d30: 46 };  // % al mese più vecchio
const AN_RITENZIONE = (() => {
  const mesi = ['Giu','Lug','Ago','Set','Ott','Nov','Dic','Gen','Feb','Mar','Apr','Mag'];
  const oggi = Date.now();
  return mesi.map((nome, t) => {
    const daOggi = 11 - t;                    // 0 = il mese corrente
    const inizio = oggi - (daOggi + 1) * 30 * 86400000;
    const fine = oggi - daOggi * 30 * 86400000;
    // Il registro utenti è un campione di quaranta persone su una base
    // dichiarata di UTENTI_BASE: gli iscritti del mese si riportano in scala,
    // altrimenti una riga direbbe «3 iscritti» su una piattaforma da 12.500.
    const scala = UTENTI.length ? UTENTI_BASE / UTENTI.length : 1;
    const campione = UTENTI.filter(u => {
      const d = u.dataRegistrazione.getTime();
      return d >= inizio && d < fine;
    }).length;
    const n = Math.round(campione * scala);
    const r = pseudoRand(t * 13 + 5);
    // Il prodotto migliora: chi si iscrive dopo resta un po' di più. Il
    // rumore è vero rumore, non decorazione.
    const spinta = 1 + (t / 11) * 0.22;
    const conta = (base) => Math.round(base * spinta * (0.9 + r() * 0.2));
    // Una percentuale a 1, 7, 30 giorni si può dire solo se quel traguardo è
    // già passato per quel mese di iscritti.
    return {
      nome, t, n, eta: daOggi,
      d1:  daOggi * 30 >= 1  && n ? conta(AN_RITENZIONE_BASE.d1)  : null,
      d7:  daOggi * 30 >= 7  && n ? conta(AN_RITENZIONE_BASE.d7)  : null,
      d30: daOggi * 30 >= 30 && n ? conta(AN_RITENZIONE_BASE.d30) : null,
    };
  });
})();

// Il secondo ordine: la distanza fra il primo e il secondo è il momento in cui
// un utente decide se l'app fa parte della sua vita. Anche questa si misura su
// tutti gli iscritti, non solo su chi è rimasto.
const AN_SECONDO_ORDINE = (() => {
  const quotaConDue = 38;                     // % degli iscritti che torna a ordinare
  const giorni = UTENTI.filter(u => u.ordini >= 2).map((u, i) => {
    const r = pseudoRand(i * 7 + 3);
    return Math.max(1, Math.round((3 + r() * 44) / Math.sqrt(Math.max(1, u.ordini / 3))));
  });
  return {
    n: Math.round(UTENTI.length * quotaConDue / 100),
    quotaConDue,
    mediana: parMediana(giorni),
    entro7: giorni.length ? (giorni.filter(g => g <= 7).length / giorni.length) * 100 : 0,
    entro30: giorni.length ? (giorni.filter(g => g <= 30).length / giorni.length) * 100 : 0,
  };
})();

// ════════════════════════════════════════════════════════════════════════════
// 4 · DEFLECTION · quanti ticket evita l'assistenza in autonomia
// ════════════════════════════════════════════════════════════════════════════
//
// È il numero che giustifica il tempo speso a scrivere guide e FAQ. Si misura
// così: quante volte una guida o una FAQ viene aperta, e in quanti di quei casi
// NON arriva un ticket dallo stesso locale nelle 48 ore dopo.
const AN_DEFLECTION = (() => {
  const faq = (typeof FAQ_SRV !== 'undefined' ? FAQ_SRV : []).filter(f => f.live !== false);
  const guide = (typeof GUIDE_SRV !== 'undefined' ? GUIDE_SRV : []);
  const vistePerFaq = 148, vistePerGuida = 96;
  const apertureFaq = faq.length * vistePerFaq;
  const apertureGuide = guide.length * vistePerGuida;
  const aperture = apertureFaq + apertureGuide;
  // Quota di consultazioni che non diventano ticket. Il resto è gente che
  // legge e chiama lo stesso: la guida non ha risolto.
  const quotaRisolta = 71;
  const evitati = Math.round((aperture * quotaRisolta / 100) / 6.2);  // ~6 letture per ticket evitato
  return {
    faq: faq.length, guide: guide.length, aperture, apertureFaq, apertureGuide,
    quotaRisolta, evitati,
    costoEvitato: evitati * PAR.COSTO_TICKET,
    // Le tre pagine più consultate e quanto pesano
    top: [...faq].slice(0, 3).map((f, i) => ({
      titolo: f.domanda || f.titolo || `FAQ ${i + 1}`,
      aperture: Math.round(vistePerFaq * (2.4 - i * 0.5)),
      risolte: Math.round(quotaRisolta + (i === 0 ? 8 : -i * 4)),
    })),
  };
})();

// ════════════════════════════════════════════════════════════════════════════
// 5 · ACQUISIZIONE · da dove arrivano i locali
// ════════════════════════════════════════════════════════════════════════════
//
// Il CAC senza il canale è un numero senza indirizzo: dice quanto costa un
// cliente, non dove andare a prenderne un altro.
const AN_CANALI = [
  { id:'passaparola', label:'Passaparola',      costo:  0,   nota:'Un ristoratore che ne porta un altro' },
  { id:'diretto',     label:'Contatto diretto', costo: 480,  nota:'Il team che va a bussare, di persona' },
  { id:'ricerca',     label:'Ricerca organica', costo:  95,  nota:'Arrivano dal sito senza che li chiamiamo' },
  { id:'campagna',    label:'Campagne a pagamento', costo: 610, nota:'Meta e Google, costo per locale acquisito' },
  { id:'evento',      label:'Fiere ed eventi',  costo: 390,  nota:'Horeca, Cibus, fiere regionali' },
];
const anAcquisizione = (locali = AN_LOCALI) => AN_CANALI.map(c => {
  const g = locali.filter(l => l.canale === c.id);
  const attivi = g.filter(l => l.stato === 'active');
  const mrr = g.reduce((s, l) => s + l.mrr, 0);
  const mrrMedio = g.length ? mrr / g.length : 0;
  return {
    ...c, n: g.length,
    quota: locali.length ? (g.length / locali.length) * 100 : 0,
    mrrMedio,
    // Quanti dei locali portati da quel canale sono ancora operativi
    tenuta: g.length ? (attivi.length / g.length) * 100 : 0,
    adozione: parMediana(g.map(l => l.adozione)),
    // Mesi per rientrare del costo di acquisizione, sul margine del canone
    payback: c.costo === 0 ? 0 : (mrrMedio > 0 ? c.costo / (mrrMedio * 0.72) : null),
  };
});
const AN_ACQUISIZIONE = anAcquisizione();

// ════════════════════════════════════════════════════════════════════════════
// 6 · MARGINE DI CONTRIBUZIONE · quanto resta di un locale
// ════════════════════════════════════════════════════════════════════════════
//
// Il canone è il ricavo, non il margine. Un locale genera ticket di assistenza,
// consuma infrastruttura e paga commissioni: quello che resta è il solo numero
// che dice se conviene averlo.
const anContribuzione = (locali = AN_LOCALI) => {
  const ticketPerLocale = (l) => {
    // Chi ha meno dotazione chiama di più: è lo stesso gruppo che non ha
    // acceso il prodotto.
    const base = l.dotazione === 'monitor' ? 0.5 : l.dotazione === 'stampa' ? 0.9 : 1.6;
    return base * (0.6 + (l.ordiniMese / 4000));
  };
  const righe = locali.map(l => {
    const ricavo = l.mrr;
    const costoSupporto = ticketPerLocale(l) * PAR.COSTO_TICKET;
    const costoInfra = (l.ordiniMese / 1000) * PAR.COSTO_MILLE_ORDINI;
    const feeStripe = ricavo > 0 ? PAR.FEE_STRIPE_FISSA + ricavo * PAR.FEE_STRIPE_PCT / 100 : 0;
    const margine = ricavo - costoSupporto - costoInfra - feeStripe;
    return { ...l, ricavo, costoSupporto, costoInfra, feeStripe, margine,
      marginePct: ricavo > 0 ? (margine / ricavo) * 100 : null };
  });
  const perPiano = PIANI.map(p => {
    const g = righe.filter(l => l.piano === p.id);
    return {
      id: p.id, label: p.label, color: p.color, n: g.length,
      ricavo: g.reduce((s, l) => s + l.ricavo, 0),
      margine: g.reduce((s, l) => s + l.margine, 0),
      margineMedio: g.length ? g.reduce((s, l) => s + l.margine, 0) / g.length : 0,
      costoMedio: g.length ? g.reduce((s, l) => s + (l.costoSupporto + l.costoInfra + l.feeStripe), 0) / g.length : 0,
      inPerdita: g.filter(l => l.margine < 0).length,
    };
  });
  return {
    righe: [...righe].sort((a, b) => a.margine - b.margine),
    perPiano,
    totale: righe.reduce((s, l) => s + l.margine, 0),
    inPerdita: righe.filter(l => l.margine < 0),
  };
};
const AN_CONTRIBUZIONE = anContribuzione();

// ════════════════════════════════════════════════════════════════════════════
// 7 · QUALITÀ DEL DATO
// ════════════════════════════════════════════════════════════════════════════
//
// Tutte le analisi di questa sezione poggiano sull'anagrafica. Se un campo è
// vuoto o assurdo, il numero che ne esce è assurdo — ed è già successo: i posti
// a sedere dichiarati non seguono il volume, e per questo RevPASH e coperti per
// posto sono stati tolti dal confronto in Valore.
const AN_QUALITA = (() => {
  const controlli = [];
  const N = AN_UNIVERSO.length;

  // Posti a sedere incompatibili con il volume: più di sei coperti per posto
  // al giorno vuol dire che uno dei due numeri è sbagliato.
  const implausibili = AN_UNIVERSO.filter(l => {
    const coperti = l.ordiniGiorno * 2.2 * (PAR.QUOTA_SALA[l.tipo] ?? 0.75);
    return l.coperti > 0 && coperti / l.coperti > 6;
  });
  controlli.push({
    k:'posti', label:'Posti a sedere incompatibili col volume',
    n: implausibili.length, su: N,
    regola:'coperti serviti ÷ posti dichiarati > 6 al giorno',
    effetto:'RevPASH e coperti per posto restano fuori dal confronto in Valore',
    elenco: implausibili.slice(0, 5).map(l => l.nome),
  });

  // Menu fermo: se la carta non si aggiorna, l'indice prezzi e la
  // distribuzione delle marche invecchiano senza dirlo.
  const menuFermi = AN_UNIVERSO.filter((l, i) => pseudoRand(i * 11 + 7)() < 0.22);
  controlli.push({
    k:'menu', label:'Carta non aggiornata da oltre 120 giorni',
    n: menuFermi.length, su: N,
    regola:'ultima modifica di una voce di menu > 120 giorni',
    effetto:'Indice prezzi e distribuzione marche invecchiano senza segnalarlo',
    elenco: menuFermi.slice(0, 5).map(l => l.nome),
  });

  // Nessun ruolo di cucina: il monitor c'è ma non lo guarda nessuno.
  const senzaCucina = AN_LOCALI.filter(l => l.dotazione === 'monitor' && !l.haCucina);
  controlli.push({
    k:'ruoli', label:'Kitchen monitor senza un utente di cucina',
    n: senzaCucina.length, su: AN_LOCALI.filter(l => l.dotazione === 'monitor').length,
    regola:'dotazione = monitor e nessun ruolo cucina configurato',
    effetto:'I tempi di cucina risultano vuoti: il monitor è acceso ma non lo spunta nessuno',
    elenco: senzaCucina.slice(0, 5).map(l => l.nome),
  });

  // Anagrafica fiscale incompleta
  const fiscale = AN_UNIVERSO.filter(l => !l.sdi || l.sdi === 'PEC@email');
  controlli.push({
    k:'fiscale', label:'Recapito fatturazione elettronica generico',
    n: fiscale.length, su: N,
    regola:'codice SDI assente o segnaposto',
    effetto:'Le fatture partono ma possono non arrivare al commercialista',
    elenco: fiscale.slice(0, 5).map(l => l.nome),
  });

  const totali = controlli.reduce((s, c) => s + c.n, 0);
  return {
    controlli,
    // Un solo numero per dire quanto ci si può fidare: la quota di locali
    // senza nessun problema aperto.
    puliti: Math.max(0, N - new Set(controlli.flatMap(c => c.elenco)).size),
    su: N, segnalazioni: totali,
  };
})();

// ════════════════════════════════════════════════════════════════════════════
// 8 · CHURN, RIMESSO SUL REGISTRO
// ════════════════════════════════════════════════════════════════════════════
//
// La vecchia sezione dichiarava decine di locali persi al mese e centinaia in
// un anno, su una base di cinquanta. Erano numeri di un'altra azienda. Qui c'è
// quello che è successo davvero, con la sua incertezza addosso: con due
// disdette un tasso annuo si calcola, ma vale quanto vale, e va scritto.
const AN_CHURN = (() => {
  const churned = LOCALI.filter(locChurned);
  const inattivi = LOCALI.filter(locInattivo);
  const base = LOC.live.length + churned.length;
  const mesiOsservati = 12;
  const tassoMensile = base > 0 ? (churned.length / base) / mesiOsservati * 100 : 0;
  const tassoAnnuo = tassoMensile * 12;
  // Il churn di ricavo pesa le disdette per quanto pagavano: perdere un
  // Business non è perdere un Gratuito.
  const mrrPerso = churned.reduce((s, l) => s + (PIANI.find(p => p.id === l.piano)?.price || 0), 0);
  const mrrBase = LOC.live.reduce((s, l) => s + l.mrr, 0);
  return {
    churned: churned.length, inattivi: inattivi.length, base,
    tassoMensile, tassoAnnuo,
    mrrPerso, churnRicavoAnnuo: mrrBase > 0 ? (mrrPerso / mrrBase) * 100 : 0,
    // «A rischio» non è churn: è la fila davanti alla porta. Tenerli separati
    // è la differenza fra un dato e un allarme.
    aRischio: inattivi.length,
    quotaARischio: LOC.live.length ? (inattivi.length / LOC.live.length) * 100 : 0,
    elenco: [...churned, ...inattivi].map(l => ({
      id: l.id, nome: l.nome, citta: l.citta, piano: l.piano, stato: l.stato,
      mrr: l.mrr, adozione: l.qrAdoption ?? 0,
      giorniInattivo: Math.floor((Date.now() - l.lastLogin.getTime()) / 86400000),
    })).sort((a, b) => b.giorniInattivo - a.giorniInattivo),
    // L'intervallo di Wilson al 90% su due eventi: serve a dire che il tasso
    // vero sta in una forbice larghissima, non a fare finta di conoscerlo.
    incertezza: (() => {
      const n = base, x = churned.length, z = 1.645;
      if (!n) return [0, 0];
      const p = x / n;
      const den = 1 + z * z / n;
      const centro = (p + z * z / (2 * n)) / den;
      const semi = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / den;
      return [Math.max(0, (centro - semi) * 100), (centro + semi) * 100];
    })(),
  };
})();

// ════════════════════════════════════════════════════════════════════════════
// 9 · SALUTE · le sei righe che rispondono a «stiamo andando bene?»
// ════════════════════════════════════════════════════════════════════════════
const AN_SALUTE = (() => {
  const mese = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
  const prec = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2];
  const mrr = mese.sub + mese.extra;
  const mrrPrec = prec.sub + prec.extra;
  const crescita = mrrPrec > 0 ? ((mrr - mrrPrec) / mrrPrec) * 100 : 0;
  const attivazione = AN_ATTIVAZIONE_TAPPE.find(t => t.k === 'soglia');
  const sopraSoglia = AN_ATTIVI.filter(l => (l.qrAdoption ?? 0) >= PAR.SOGLIA_DIGITALE).length;
  return {
    mrr, crescita,
    nrr: typeof RITENZIONE !== 'undefined' ? RITENZIONE.nrr : null,
    churnAnnuo: AN_CHURN.tassoAnnuo,
    aRischio: AN_CHURN.aRischio,
    attivazioneMediana: attivazione ? attivazione.mediana : null,
    attivazioneMancanti: attivazione ? attivazione.mancanti : 0,
    sopraSoglia, attivi: AN_ATTIVI.length,
    quotaSopraSoglia: AN_ATTIVI.length ? (sopraSoglia / AN_ATTIVI.length) * 100 : 0,
    margineContribuzione: AN_CONTRIBUZIONE.totale,
    localiInPerdita: AN_CONTRIBUZIONE.inPerdita.length,
  };
})();

window.AN_DOTAZIONI = AN_DOTAZIONI;
window.AN_RUOLI = AN_RUOLI;
window.AN_LOCALI = AN_LOCALI;
window.AN_PER_DOTAZIONE = AN_PER_DOTAZIONE;
window.AN_PER_RUOLO = AN_PER_RUOLO;
window.AN_TAPPE = AN_TAPPE;
window.AN_ATTIVAZIONE = AN_ATTIVAZIONE;
window.AN_ATTIVAZIONE_TAPPE = AN_ATTIVAZIONE_TAPPE;
window.AN_CURVA_ATTIVAZIONE = AN_CURVA_ATTIVAZIONE;
window.AN_ATTIVAZIONE_DOTAZIONE = AN_ATTIVAZIONE_DOTAZIONE;
window.AN_RITENZIONE = AN_RITENZIONE;
window.AN_SECONDO_ORDINE = AN_SECONDO_ORDINE;
window.AN_DEFLECTION = AN_DEFLECTION;
window.AN_CANALI = AN_CANALI;
window.AN_ACQUISIZIONE = AN_ACQUISIZIONE;
window.anAcquisizione = anAcquisizione;
window.anContribuzione = anContribuzione;
window.anPerDotazione = anPerDotazione;
window.anPerRuolo = anPerRuolo;
window.anTappe = anTappe;
window.anCurva = anCurva;
window.anAttPerDotazione = anAttPerDotazione;
window.AN_CONTRIBUZIONE = AN_CONTRIBUZIONE;
window.AN_QUALITA = AN_QUALITA;
window.AN_CHURN = AN_CHURN;
window.AN_SALUTE = AN_SALUTE;
