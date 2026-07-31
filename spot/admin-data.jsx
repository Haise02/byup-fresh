// Mock data layer per Admin Byup — locali, utenti, segnalazioni, certificazioni, team

// ---------- LOCALI ----------
// Funnel onboarding (in ordine):
// 6 step obbligatori (1..6, dove verifica_menu = avvio/go-live)
// 2 step opzionali (vetrina, personale) — completabili dopo l'avvio
const ONB_STEPS = [
  { id: 'iscrizione',       label: 'Iscrizione' },
  { id: 'caricamento_menu', label: 'Caricamento menu' },
  { id: 'setup_info',       label: 'Setup informazioni' },
  { id: 'setup_pagamenti',  label: 'Setup pagamenti' },
  { id: 'sala_tavoli',      label: 'Sala e tavoli' },
  { id: 'verifica_menu',    label: 'Verifica menu', avvio: true },
  { id: 'vetrina',          label: 'Vetrina',   optional: true },
  { id: 'personale',        label: 'Personale', optional: true },
];
const ONB_MANDATORY = ONB_STEPS.filter(s => !s.optional);

// Stati locale
// - 'pending'  : iscritto, non ha iniziato
// - 'onboarding': in corso (stoppedAt = step id dove si trova)
// - 'skipped'  : ha saltato l'onboarding, va in panoramica
// - 'active'   : onboarding completo + usa
// - 'inactive' : onboarding completo ma non logga da N giorni
// - 'churned'  : disdetto

const REGIONI = [
  'Lombardia', 'Lazio', 'Campania', 'Sicilia', 'Veneto',
  'Emilia-Romagna', 'Piemonte', 'Puglia', 'Toscana', 'Liguria',
];

// Listino allineato a quello del gestionale (ACC_PIANI in gestionale/account-data.jsx),
// che e la fonte di verita: qui c'erano 49/99/249, li 46,99/134,99/250. `price`
// e il mensile con fatturazione annuale — quello su cui sta la maggior parte
// della base — `priceMensile` il mensile puro.
//
// `ordiniInclusi` non conta ordini grezzi ma TRANSAZIONI PESATE: un pagamento
// in app pesa 0,5, uno in cassa 1,0 (app/Contesto-App.md §C). E la leva piu
// interessante del modello — spingere l'app dimezza la quota consumata.
const PIANI = [
  { id: 'free',     label: 'Gratuito', price: 0,      priceMensile: 0,      ordiniInclusi: 550,   ordineExtra: 0.45, color: 'PLAN_FREE' },
  { id: 'starter',  label: 'Starter',  price: 46.99,  priceMensile: 54.99,  ordiniInclusi: 1850,  ordineExtra: 0.34, color: 'PLAN_STARTER' },
  { id: 'plus',     label: 'Plus',     price: 134.99, priceMensile: 155.99, ordiniInclusi: 7500,  ordineExtra: 0.23, color: 'PLAN_PLUS' },
  { id: 'business', label: 'Business', price: 250,    priceMensile: 290,    ordiniInclusi: 15000, ordineExtra: 0.12, color: 'PLAN_BUSINESS' },
];

// Helper deterministico
function pseudoRand(seed) {
  let x = seed * 9301 + 49297;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

function buildLocali() {
  const nomi = [
    ['Trattoria del Borgo', 'Milano', 'Lombardia'],
    ['Osteria San Pietro', 'Roma', 'Lazio'],
    ['Pizzeria Da Michele', 'Napoli', 'Campania'],
    ['Ristorante Il Gabbiano', 'Palermo', 'Sicilia'],
    ['Bistrot Aurora', 'Milano', 'Lombardia'],
    ['Trattoria della Nonna', 'Bologna', 'Emilia-Romagna'],
    ['Ristorante Mare e Monti', 'Genova', 'Liguria'],
    ['Pizzeria Sorbillo', 'Napoli', 'Campania'],
    ['Osteria del Vicolo', 'Firenze', 'Toscana'],
    ['Enoteca Vinitalia', 'Torino', 'Piemonte'],
    ['Trattoria Da Cesare', 'Roma', 'Lazio'],
    ['Ristorante La Pergola', 'Milano', 'Lombardia'],
    ['Pizzeria Brandi', 'Napoli', 'Campania'],
    ['Bistrot Verde', 'Venezia', 'Veneto'],
    ['Osteria del Mare', 'Bari', 'Puglia'],
    ['Trattoria Romanesca', 'Roma', 'Lazio'],
    ['Pub The Crown', 'Milano', 'Lombardia'],
    ['Ristorante Fior di Loto', 'Catania', 'Sicilia'],
    ['Pizzeria Il Forno', 'Verona', 'Veneto'],
    ['Osteria del Pescatore', 'Cagliari', 'Sicilia'],
    ['Trattoria Le Logge', 'Siena', 'Toscana'],
    ['Bar Centrale', 'Lecce', 'Puglia'],
    ['Ristorante Antica Bottega', 'Parma', 'Emilia-Romagna'],
    ['Pizzeria 50 Kalò', 'Napoli', 'Campania'],
    ['Trattoria Sora Lella', 'Roma', 'Lazio'],
    ['Osteria Francescana', 'Modena', 'Emilia-Romagna'],
    ['Enoteca Pinchiorri', 'Firenze', 'Toscana'],
    ['Bistrot 99', 'Milano', 'Lombardia'],
    ['Pizzeria Starita', 'Napoli', 'Campania'],
    ['Trattoria Al Cacciatore', 'Bergamo', 'Lombardia'],
    ['Ristorante Don Alfonso', 'Salerno', 'Campania'],
    ['Pub The Hop', 'Bologna', 'Emilia-Romagna'],
    ['Osteria del Sole', 'Bologna', 'Emilia-Romagna'],
    ['Trattoria Da Mario', 'Firenze', 'Toscana'],
    ['Bistrot La Place', 'Torino', 'Piemonte'],
    ['Pizzeria L\'Antica', 'Roma', 'Lazio'],
    ['Ristorante Cracco', 'Milano', 'Lombardia'],
    ['Trattoria Vecchia Bologna', 'Bologna', 'Emilia-Romagna'],
    ['Osteria del Cinghiale', 'Siena', 'Toscana'],
    ['Pizzeria Gino Sorbillo', 'Napoli', 'Campania'],
    ['Bar Pasticceria Marchesi', 'Milano', 'Lombardia'],
    ['Ristorante Piazza Duomo', 'Alba', 'Piemonte'],
    ['Trattoria Le Volpaie', 'Lucca', 'Toscana'],
    ['Pizzeria Concettina ai Tre Santi', 'Napoli', 'Campania'],
    ['Bistrot Notes', 'Milano', 'Lombardia'],
    ['Osteria Antiqua', 'Verona', 'Veneto'],
    ['Trattoria Felicin', 'Cuneo', 'Piemonte'],
    ['Ristorante Casa Vissani', 'Terni', 'Lazio'],
    ['Enoteca Cul de Sac', 'Roma', 'Lazio'],
    ['Pizzeria I Masanielli', 'Caserta', 'Campania'],
  ];

  const tipiByPrefix = {
    'Trattoria': 'Trattoria', 'Osteria': 'Osteria', 'Pizzeria': 'Pizzeria',
    'Ristorante': 'Ristorante', 'Bistrot': 'Bistrot', 'Enoteca': 'Enoteca',
    'Pub': 'Pub', 'Bar': 'Bar',
  };

  return nomi.map((n, i) => {
    const r = pseudoRand(i + 1);
    const prefix = n[0].split(' ')[0];
    const tipo = tipiByPrefix[prefix] || 'Ristorante';

    // Distribuzione stati: 5 pending, 8 onboarding, 4 skipped, 25 active, 6 inactive, 2 churned
    let stato, stoppedAt = null, completedSteps = [];
    if (i < 5) {
      stato = 'pending'; completedSteps = ['iscrizione'];
    } else if (i < 13) {
      // bloccato tra step mandatory 1..5 (caricamento…verifica_menu non incluso)
      stato = 'onboarding';
      const stopIdx = 1 + Math.floor(r() * (ONB_MANDATORY.length - 1)); // 1..5
      stoppedAt = ONB_MANDATORY[stopIdx].id;
      completedSteps = ONB_MANDATORY.slice(0, stopIdx).map(s => s.id);
    } else if (i < 17) {
      stato = 'skipped';
      completedSteps = ['iscrizione'];
    } else if (i < 42) {
      stato = 'active';
      // tutti gli obbligatori + opzionali random
      const opt = ONB_STEPS.filter(s => s.optional).filter(() => r() > 0.4).map(s => s.id);
      completedSteps = [...ONB_MANDATORY.map(s => s.id), ...opt];
    } else if (i < 48) {
      stato = 'inactive';
      const opt = ONB_STEPS.filter(s => s.optional).filter(() => r() > 0.5).map(s => s.id);
      completedSteps = [...ONB_MANDATORY.map(s => s.id), ...opt];
    } else {
      stato = 'churned';
      completedSteps = ONB_MANDATORY.map(s => s.id);
    }

    // ── Volume, e il piano che ne consegue ────────────────────────────────
    //
    // Prima gli ordini erano 5-29 al giorno e il piano un sorteggio: un
    // ristorante da nove coperti al giorno, e un Business assegnato a caso a
    // chi ne fa dodici. Da lì in poi non tornava più niente — le soglie dei
    // piani (550 / 1.850 / 7.500 / 15.000 transazioni) non le sfondava
    // nessuno, e gli ordini che l'app poteva produrre non bastavano a coprire
    // quelli che gli utenti dichiaravano di aver fatto.
    //
    // Ora il volume è quello di locali veri — da una gastronomia che fa otto
    // ordini al giorno a una pizzeria che ne fa duecento — e IL PIANO SEGUE IL
    // VOLUME, che è come funziona un listino a consumo. Chi sfonda la soglia
    // paga gli extra: se ci restasse per sempre pagherebbe più del piano
    // sopra, ed è esattamente la leva commerciale del modello.
    // Distribuzione a coda lunga, come sono i ristoranti veri: tanti piccoli
    // da qualche decina di ordini al giorno, pochi grandi da qualche
    // centinaio. Senza la coda, il piano Business — 15.000 transazioni
    // incluse, cioè cinquecento al giorno — non lo prenderebbe mai nessuno.
    const grandezza = Math.pow(r(), 2.1);      // schiacciata verso il basso
    const ordiniGiorno = stato === 'active' ? Math.round(8 + grandezza * 620) :
                        stato === 'skipped' ? Math.floor(r() * 40) :
                        stato === 'inactive' ? Math.floor(r() * 12) : 0;
    const ordiniMeseStima = ordiniGiorno * 28;
    // Il piano giusto per quel volume…
    const pianoDaVolume = ordiniMeseStima > 7500 ? 'business'
      : ordiniMeseStima > 1850 ? 'plus'
      : ordiniMeseStima > 550 ? 'starter' : 'free';
    // …e un quarto dei locali sta un gradino sotto, perché è cresciuto e non
    // ha ancora cambiato: sono quelli che pagano le eccedenze, cioè i
    // candidati all'upgrade che la Dashboard elenca.
    const idxGiusto = PIANI.findIndex(p => p.id === pianoDaVolume);
    // …ma ci resta solo finché l'eccedenza costa meno di metà del canone che
    // eviterebbe: oltre, il conto lo fa da solo e passa al piano sopra. Senza
    // questo limite uscivano Gratuiti con mille euro al mese di eccedenze,
    // che è una cosa che non esiste.
    const sottoIdx = Math.max(0, idxGiusto - 1);
    const eccedenzaSeSotto = Math.max(0, ordiniMeseStima - PIANI[sottoIdx].ordiniInclusi) * PIANI[sottoIdx].ordineExtra;
    const sottoPiano = r() < 0.55 && idxGiusto > 0 && eccedenzaSeSotto < PIANI[idxGiusto].price * 0.9;
    const piano = (stato === 'pending') ? 'free'
      : PIANI[Math.max(0, idxGiusto - (sottoPiano ? 1 : 0))].id;
    const pianoObj = PIANI.find(p => p.id === piano);
    const prenotazioniGiorno = stato === 'active' ? Math.floor(r() * 40) + 5 :
                              stato === 'skipped' ? Math.floor(r() * 10) : 0;

    // I ricavi partono da dicembre 2024: i locali OPERATIVI devono esistere da
    // prima, altrimenti la coorte a dodici mesi è vuota e la ritenzione non si
    // può nemmeno calcolare.
    //
    // Chi è ancora in onboarding, invece, si è iscritto da poco: un locale non
    // resta fermo alla configurazione per due anni — o la finisce, o sparisce,
    // e a quel punto è un abbandono silenzioso, non un onboarding lungo.
    // Senza questa distinzione la card «Locali da seguire» dichiarava gente
    // ferma da seicento giorni.
    const baseDate = new Date(2024, 9, 1); // 1 ott 2024
    const giorniDaAllora = Math.floor((Date.now() - baseDate.getTime()) / 86400000);
    const iscrizioneOffset = (stato === 'pending' || stato === 'onboarding')
      ? giorniDaAllora - Math.floor(r() * 40)          // ultime sei settimane
      : stato === 'skipped'
        ? giorniDaAllora - Math.floor(r() * 150)       // ultimi cinque mesi
        : Math.floor(r() * Math.max(1, giorniDaAllora - 30));
    const dataIscrizione = new Date(baseDate.getTime() + iscrizioneOffset * 86400000);
    const lastLoginDays = stato === 'inactive' ? 30 + Math.floor(r() * 90) :
                         stato === 'churned' ? 60 + Math.floor(r() * 120) :
                         Math.floor(r() * 7);
    const lastLogin = new Date(Date.now() - lastLoginDays * 86400000);

    // Step timeline
    const stepTimes = {};
    let t = dataIscrizione.getTime();
    ONB_STEPS.forEach(s => {
      if (completedSteps.includes(s.id)) {
        stepTimes[s.id] = new Date(t);
        t += (Math.floor(r() * 30) + 5) * 60000; // 5-35 min step
      }
    });

    // ── Adozione digitale + scan QR
    // qrAdoption (%) = % di ordini del locale che passano dal QR byup.
    // Da questo deriviamo scanQR mese/anno: gli scan sono ~1.5-3.5x rispetto agli
    // ordini-via-QR (non tutti gli scan portano a ordine).
    const qrAdoption = (() => {
      if (stato === 'pending' || stato === 'onboarding') return null;
      if (stato === 'churned') return null;
      if (stato === 'skipped' || stato === 'inactive') {
        const buckets = [0, 0, 0, 0.5, 1.2, 2.8, 4.1, 6.5];
        return buckets[Math.floor(r() * buckets.length)];
      }
      const roll = r();
      if (roll < 0.04) return 0;
      if (roll < 0.18) return +(0.3 + r() * 4.5).toFixed(1);
      if (roll < 0.52) return +(5 + r() * 10).toFixed(1);
      if (roll < 0.86) return +(15 + r() * 15).toFixed(1);
      return +(30.1 + r() * 28).toFixed(1);
    })();
    const ordiniMeseVal = ordiniGiorno * 28 + Math.floor(r() * 50);
    // Gli extra ordini NON sono un numero a caso: sono gli ordini oltre la
    // soglia del piano, al prezzo unitario del piano. Scritti a caso — dieci
    // o settanta euro a metà dei locali attivi — il ricavo da extra non
    // diceva niente su chi sta sfondando il piano, che è invece l'unica
    // storia di crescita raccontabile su venticinque locali.
    const ordiniOltre = Math.max(0, ordiniMeseVal - pianoObj.ordiniInclusi);
    const extras = stato === 'active' ? Math.round(ordiniOltre * pianoObj.ordineExtra) : 0;
    // Chi ha cambiato piano, quando, e in che direzione. Gli upgrade dicono se
    // chi sfonda il piano poi fa il passo; i DOWNGRADE sono l'altra metà della
    // ritenzione del ricavo — un cliente che resta ma paga meno non è churn e
    // non è espansione, è contrazione, e senza quella la NRR non si compone.
    const idxPiano = PIANI.findIndex(p => p.id === piano);
    const dado = r();
    const cambio = stato !== 'active' ? null
      : (dado > 0.62 && idxPiano > 0)
        ? { tipo:'upgrade',   il: new Date(Date.now() - Math.floor(r() * 130) * 86400000), da: PIANI[idxPiano - 1].id }
      : (dado < 0.14 && idxPiano < PIANI.length - 1)
        ? { tipo:'downgrade', il: new Date(Date.now() - Math.floor(r() * 130) * 86400000), da: PIANI[idxPiano + 1].id }
      : null;
    const upgradeIl = cambio && cambio.tipo === 'upgrade' ? cambio.il : null;
    const downgradeIl = cambio && cambio.tipo === 'downgrade' ? cambio.il : null;
    const pianoPrecedente = cambio ? cambio.da : null;
    const ordiniAnnoVal = Math.round(ordiniMeseVal * (11 + r() * 2));
    const scanQRMese = (qrAdoption == null || qrAdoption === 0)
      ? (qrAdoption === 0 ? Math.floor(r() * 4) : 0)
      : Math.round((ordiniMeseVal * qrAdoption / 100) * (7 + r() * 7));
    const scanQRAnno = Math.round(scanQRMese * (11 + r() * 2));

    return {
      id: 'L' + String(1000 + i),
      nome: n[0],
      tipo,
      citta: n[1],
      regione: n[2],
      indirizzo: `Via ${['Roma','Garibaldi','Mazzini','Dante','Verdi','Cavour','Manzoni'][Math.floor(r()*7)]} ${Math.floor(r()*200)+1}`,
      cap: String(10000 + Math.floor(r() * 89999)),
      piva: '0' + String(1000000000 + Math.floor(r() * 8999999999)).slice(0,10),
      cf: 'CF' + String(Math.floor(r()*999999999)).padStart(9,'0'),
      sdi: ['ABCDEFG', 'XCRPN12', 'SUBM70N', 'PEC@email'][Math.floor(r()*4)],
      titolare: ['Marco', 'Giulia', 'Andrea', 'Sofia', 'Luca', 'Elena', 'Paolo', 'Chiara'][i % 8] + ' ' +
                ['Rossi', 'Bianchi', 'Romano', 'Esposito', 'Conti', 'Russo', 'Marino', 'Greco'][i % 8],
      email: 'titolare@' + n[0].toLowerCase().replace(/[^a-z]/g,'') + '.it',
      tel: '+39 ' + (300 + Math.floor(r() * 99)) + ' ' + String(Math.floor(r() * 9999999)).padStart(7,'0'),
      piano,
      extras,
      pagaExtras: extras > 0,
      stato,
      stoppedAt,
      completedSteps,
      stepTimes,
      dataIscrizione,
      lastLogin,
      ordiniGiorno,
      ordiniMese: ordiniMeseVal,
      ordiniInclusi: pianoObj.ordiniInclusi,
      ordiniOltre,
      upgradeIl,
      downgradeIl,
      pianoPrecedente,
      ordiniAnno: ordiniAnnoVal,
      prenotazioniGiorno,
      prenotazioniMese: prenotazioniGiorno * 28,
      prenotazioniAnno: Math.round(prenotazioniGiorno * 28 * (11 + r() * 2)),
      mrr: PIANI.find(p => p.id === piano).price + extras,
      coperti: 20 + Math.floor(r() * 80),
      copertura: Math.floor(60 + r() * 35), // %
      ticketMedio: 18 + Math.floor(r() * 35),
      // Tasso di adozione digitale = % ordini del mese che passano dal QR byup.
      qrAdoption,
      scanQRMese,
      scanQRAnno,
    };
  });
}

const LOCALI = buildLocali();

// ═══════════════════════════════════════════════════════════════════════════
// DEFINIZIONI · cosa vuol dire «attivo» e cosa vuol dire «pagante»
// ═══════════════════════════════════════════════════════════════════════════
//
// Scritte qui una volta sola e usate ovunque, perché sono le stesse parole che
// finiscono nel pitch. Prima ogni card se le ridefiniva per conto suo, e i
// conti non tornavano da nessuna parte: cinquanta locali totali che si
// scomponevano in 25+8+17, ma la barra sotto ne contava 31 fra paganti e
// gratuiti, e lo spaccato per piano copriva il 62% lasciando diciannove locali
// senza collocazione.
//
//   in onboarding   iscritto ma non ancora operativo: non ha finito la
//                   configurazione (pending, fermo a metà, o saltata)
//   attivo          ha finito l'onboarding e lavora: ordini negli ultimi
//                   30 giorni
//   inattivo        ha finito l'onboarding ma non ordina da oltre 30 giorni.
//                   Non è churn: l'abbonamento è ancora acceso
//   churned         ha disdetto. Fuori da ogni base e da ogni ricavo
//
//   live            attivi + inattivi = la base installata, cioè chi ha un
//                   locale configurato su byup. È il denominatore di tutto
//                   quello che riguarda l'uso e i piani
//   pagante         live su un piano diverso dal Gratuito
//
// Le quattro categorie sono esaustive e disgiunte: sommate danno il totale,
// sempre. Se un giorno non tornassero, è una di queste funzioni ad essere
// sbagliata, non la card che le somma.
const locInOnboarding = (l) => l.stato === 'pending' || l.stato === 'onboarding' || l.stato === 'skipped';
const locAttivo       = (l) => l.stato === 'active';
const locInattivo     = (l) => l.stato === 'inactive';
const locChurned      = (l) => l.stato === 'churned';
const locLive         = (l) => locAttivo(l) || locInattivo(l);
const locPagante      = (l) => locLive(l) && l.piano !== 'free';

const LOC = (() => {
  const attivi       = LOCALI.filter(locAttivo);
  const inattivi     = LOCALI.filter(locInattivo);
  const inOnboarding = LOCALI.filter(locInOnboarding);
  const churned      = LOCALI.filter(locChurned);
  const live         = LOCALI.filter(locLive);
  const paganti      = LOCALI.filter(locPagante);
  const gratuiti     = live.filter(l => l.piano === 'free');
  return {
    totali: LOCALI.length,
    attivi, inattivi, inOnboarding, churned, live, paganti, gratuiti,
    // Lo spaccato per piano si conta sulla base installata e copre il 100% di
    // quella: quattro numeri che sommano a `live.length`, Gratuito compreso.
    perPiano: PIANI.map(p => ({
      id: p.id, label: p.label, price: p.price,
      n: live.filter(l => l.piano === p.id).length,
    })),
  };
})();

// ─── MRR · il ricavo che i piani producono davvero ──────────────────────────
//
// Non un numero scritto a mano: la somma dei listini dei locali paganti, più
// gli extra ordini. Con questa base — otto Starter, sette Plus, nove Business
// — l'abbonato vale circa 3.570 €, non 5.520 come diceva la serie storica
// scritta a occhio. Un MRR che non torna col listino è la prima cosa che un
// investitore ricalcola.
const MRR_ORA = (() => {
  const abbonamenti = LOC.paganti.reduce((s, l) => s + (PIANI.find(p => p.id === l.piano) || {}).price, 0);
  const extra = LOC.live.reduce((s, l) => s + (l.extras || 0), 0);
  return {
    abbonamenti: Math.round(abbonamenti),
    extra: Math.round(extra),
    totale: Math.round(abbonamenti + extra),
    // ARPA sui soli paganti: dividere per tutta la base installata darebbe un
    // numero più basso e più bello da guardare, ma descriverebbe un cliente
    // medio che non esiste.
    arpa: LOC.paganti.length ? Math.round(abbonamenti / LOC.paganti.length) : 0,
  };
})();

// ---------- ADOZIONE DIGITALE — fasce ----------
// 5 fasce per il tasso di adozione QR. min/max in %.
// helper bandOf(qrAdoption) → bucket id ('non'|'crit'|'cresc'|'buona'|'champ').
const ADOPTION_BANDS = [
  { id:'non',   label:'Non attivato', range:'0%',      hint:'Non ha messo i QR · problema di onboarding',                          color:'#0F172A', soft:'#E2E8F0', textOn:'#fff', min:0,    max:0    },
  { id:'crit',  label:'Critico',      range:'< 5%',    hint:'I QR ci sono ma non funzionano · posizionamento, formazione, kit',     color:'#DC2626', soft:'#FEE2E2', textOn:'#fff', min:0.01, max:5    },
  { id:'cresc', label:'In crescita',  range:'5–15%',   hint:'Adozione iniziale, normale nei primi mesi · spingere con suggerimenti', color:'#D97706', soft:'#FEF3C7', textOn:'#fff', min:5,    max:15   },
  { id:'buona', label:'Buona',        range:'15–30%',  hint:'Il ristorante ci crede · adozione solida',                              color:'#65A30D', soft:'#ECFCCB', textOn:'#fff', min:15,   max:30   },
  { id:'champ', label:'Campione',     range:'> 30%',   hint:'Caso studio, potenziale testimonial',                                   color:'#15803D', soft:'#DCFCE7', textOn:'#fff', min:30,   max:100  },
];
function bandOf(qrAdoption) {
  if (qrAdoption == null) return null;
  if (qrAdoption === 0) return ADOPTION_BANDS[0];
  if (qrAdoption < 5)   return ADOPTION_BANDS[1];
  if (qrAdoption < 15)  return ADOPTION_BANDS[2];
  if (qrAdoption < 30)  return ADOPTION_BANDS[3];
  return ADOPTION_BANDS[4];
}

// ---------- UTENTI APP ----------
// Quanti ordini al mese può fare un utente registrato, in media: è la quota
// app degli ordini di piattaforma divisa per la base registrata stimata. Non
// è una preferenza di prodotto, è un vincolo di aritmetica — se la si ignora
// gli utenti dichiarano più ordini di quanti il canale ne abbia prodotti.
//
//   quota app   la media degli ultimi 12 mesi del mix canali (dal 4% al 20%)
//   base        UTENTI del campione × 312, la stessa scala della Dashboard
const ORDINI_MESE_PIATTAFORMA = LOCALI
  .filter(l => l.stato === 'active' || l.stato === 'inactive')
  .reduce((s2, l) => s2 + (l.ordiniMese || 0), 0);
const QUOTA_APP_MEDIA_12M = 0.115;
const UTENTI_FREQ_BASE = (ORDINI_MESE_PIATTAFORMA * QUOTA_APP_MEDIA_12M) / (40 * 312);

function buildUtenti() {
  const nomi = [
    'Marco Bianchi','Sofia Greco','Andrea Conti','Giulia Rossi','Luca Romano',
    'Elena Esposito','Paolo Russo','Chiara Marino','Francesco Ricci','Alessia Bruno',
    'Davide Galli','Martina Costa','Stefano Lombardi','Federica Moretti','Matteo Barbieri',
    'Sara Fontana','Tommaso Mancini','Valentina Rizzo','Riccardo Caruso','Beatrice Ferrari',
    'Gabriele Santoro','Aurora Marini','Alessandro De Luca','Giorgia Vitale','Pietro Pellegrini',
    'Camilla Serra','Lorenzo Bianco','Vittoria Palumbo','Edoardo Rinaldi','Ludovica Coppola',
    'Filippo Negri','Bianca Sala','Alberto Giordano','Anna Bellini','Simone Villa',
    'Maria Rosa','Cristian Leone','Greta Battaglia','Diego Caputo','Asia Donati',
  ];
  const citta = [
    ['Milano','Lombardia'],['Roma','Lazio'],['Napoli','Campania'],['Torino','Piemonte'],
    ['Firenze','Toscana'],['Bologna','Emilia-Romagna'],['Genova','Liguria'],['Bari','Puglia'],
    ['Palermo','Sicilia'],['Venezia','Veneto'],
  ];

  return nomi.map((n, i) => {
    const r = pseudoRand(i + 100);
    const sesso = i % 2 === 0 ? 'F' : 'M';
    const eta = 20 + Math.floor(r() * 50);
    const c = citta[i % citta.length];
    const localiPref = Math.floor(r() * 12);
    const regOffset = Math.floor(r() * 365);
    // Gli ordini di un utente sono la sua frequenza mensile per da quanto è
    // iscritto — ma la frequenza non è libera: è vincolata dagli ordini che
    // l'app produce davvero.
    //
    // Il conto che non tornava: 12.480 registrati a due ordini al mese fanno
    // 139.000 ordini via app, mentre col mix di canale (l'app è passata dal
    // 4% al 20% in dodici mesi) l'app ne può aver prodotti sì e no
    // ventimila. Il tetto lo mette il canale, non la voglia dell'utente.
    //
    // Quindi: quota app degli ordini di piattaforma ÷ base registrata = quanti
    // ordini al mese può fare un utente medio. Chi è attivo ne fa di più, chi
    // è fermo zero, e la media resta quella che il canale consente.
    const mesiIscritto = Math.max(1, regOffset / 30);
    // Il moltiplicatore per utente va da un quinto a poco meno del doppio
    // della media: la media di UTENTI_FREQ_BASE deve restare quella, perché è
    // il budget di ordini che il canale app produce.
    const freqMese = UTENTI_FREQ_BASE * (0.2 + r() * 1.7);
    const ordini = Math.round(freqMese * mesiIscritto);

    // Si prenota molto meno di quanto si ordini: una cena su tre, e non da
    // tutti.
    const prenotazioni = Math.round(ordini * (0.12 + r() * 0.3));
    // In quanti locali DIVERSI ha ordinato. È il numero che dice se byup è una
    // rete o venticinque app separate: chi ordina solo dove ha ordinato la
    // prima volta ha scaricato l'app di quel ristorante, non la nostra.
    //
    // La fedeltà a un locale solo dipende da quanto ordina: chi ordina poco
    // torna dove è già stato, chi ordina spesso finisce per provare il locale
    // accanto. Slegare le due cose faceva uscire che i clienti «di rete»
    // ordinano MENO degli altri — il contrario del motivo per cui la rete ci
    // interessa.
    const soloUno = r() < Math.max(0.28, 0.95 - ordini * 0.045);
    // Un locale in più alla volta, con probabilità che cala: la distribuzione
    // vera è decrescente — tanti a uno, meno a due, pochi a cinque — e la
    // formula a radice quadrata saltava proprio il gradino del due, che è
    // quello che conta.
    let quantiLocali = 1;
    while (quantiLocali < 8 && r() < Math.min(0.58, 0.10 + ordini * 0.022)) quantiLocali++;
    const localiOrdinati = ordini === 0 ? 0 : soloUno ? 1 : Math.min(ordini, quantiLocali);
    // distribuzione last session più ampia per coprire tutte le cluster di utilizzo
    const lastSessionDays = Math.floor(r() * 75); // 0..74 giorni
    // categorie utilizzo:
    //  estr_attivo: >1 sett   (lastSession <= 7  e ordini+pren >= 8)
    //  molto_att:   >1 mese   (lastSession <= 30 e ordini+pren >= 4)
    //  attivo:      1/mese    (lastSession <= 30 e ordini+pren >= 1)
    //  distratto:   no uso ult. settimana   (lastSession 8..30 e usi pochi)
    //  non_attivo:  no uso ult. mese        (lastSession 31..60)
    //  perso:       no uso ult. 2 mesi      (lastSession > 60)
    let cluster;
    if (lastSessionDays > 60)        cluster = 'perso';
    else if (lastSessionDays > 30)   cluster = 'non_attivo';
    else if (lastSessionDays > 7 && (ordini + prenotazioni) < 4)  cluster = 'distratto';
    else if (lastSessionDays <= 7 && (ordini + prenotazioni) >= 8) cluster = 'estr_attivo';
    else if (lastSessionDays <= 30 && (ordini + prenotazioni) >= 4) cluster = 'molto_att';
    else cluster = 'attivo';
    const utilizzo = cluster;
    const attivo = lastSessionDays <= 30 && (ordini + prenotazioni) >= 1;
    return {
      id: 'U' + String(2000 + i),
      nome: n,
      iniziali: n.split(' ').map(s => s[0]).join(''),
      sesso, eta,
      citta: c[0], regione: c[1],
      email: n.toLowerCase().replace(/\s/g,'.') + '@email.it',
      tel: '+39 3' + Math.floor(r() * 99) + ' ' + String(Math.floor(r() * 9999999)).padStart(7,'0'),
      dataRegistrazione: new Date(Date.now() - regOffset * 86400000),
      lastSession: new Date(Date.now() - lastSessionDays * 86400000),
      lastSessionDays,
      ordini,
      prenotazioni,
      localiPreferiti: localiPref,
      localiOrdinati,
      // Cross-locale: ha ordinato in almeno due locali diversi.
      crossLocale: localiOrdinati > 1,
      // Scontrino personale attorno ai 32 € dichiarati come media app, non una
      // forbice inventata a parte.
      spesaTotale: ordini * (26 + Math.floor(r() * 13)),
      utilizzo,
      attivo,
    };
  });
}

const UTENTI = buildUtenti();

// Cluster di utilizzo (per filtri messaggio promozionale)
const UTILIZZO_CLUSTER = {
  estr_attivo: { label: 'Estremamente attivo', desc: 'Più di una volta a settimana',  color: 'OK' },
  molto_att:   { label: 'Molto attivo',        desc: 'Più di una volta al mese',      color: 'INFO' },
  attivo:      { label: 'Attivo',              desc: 'Almeno una volta al mese',      color: 'PURPLE' },
  distratto:   { label: 'Distratto',           desc: 'Non usa l\'app da una settimana', color: 'WARN' },
  non_attivo:  { label: 'Non attivo',          desc: 'Non usa l\'app da un mese',     color: 'PLAN_FREE' },
  perso:       { label: 'Perso',               desc: 'Non usa l\'app da più di 2 mesi', color: 'DANGER' },
};

// ---------- SEGNALAZIONI ----------
const SEGNALAZIONI = [
  { id: 'S001', fonte: 'app_user', utenteId: 'U2003', oggetto: 'Non riesco a completare pagamento ordine', desc: 'Quando arrivo al pagamento la pagina si blocca dopo aver inserito la carta. Ho riprovato 3 volte.', stato: 'nuova', priorita: 'alta', data: new Date(Date.now() - 1200000), allegati: 1 },
  { id: 'S002', fonte: 'gestionale', localeId: 'L1018', oggetto: 'Stampante scontrini non risponde', desc: 'La stampante Epson smette di stampare dopo 5-6 ordini. Devo riavviarla ogni volta.', stato: 'in_corso', priorita: 'alta', data: new Date(Date.now() - 5400000), assignedTo: 'support1' },
  { id: 'S003', fonte: 'staff', localeId: 'L1024', oggetto: 'Tablet cameriere si disconnette dalla wifi', desc: 'Ogni 10-15 minuti perdiamo connessione e dobbiamo riavviare l\'app. Succede solo sul tablet della sala 2.', stato: 'nuova', priorita: 'media', data: new Date(Date.now() - 7200000) },
  { id: 'S004', fonte: 'app_user', utenteId: 'U2011', oggetto: 'Recensione non viene pubblicata', desc: 'Ho lasciato una recensione 3 giorni fa, non appare ancora online.', stato: 'in_corso', priorita: 'bassa', data: new Date(Date.now() - 86400000 * 2), assignedTo: 'support2' },
  { id: 'S005', fonte: 'gestionale', localeId: 'L1021', oggetto: 'Dati statistiche non aggiornati', desc: 'La dashboard Statistiche mostra dati di 2 giorni fa.', stato: 'in_corso', priorita: 'media', data: new Date(Date.now() - 14400000) },
  { id: 'S006', fonte: 'staff', localeId: 'L1019', oggetto: 'Non posso modificare ordine dopo invio in cucina', desc: 'Quando l\'ordine è inviato in cucina non posso più aggiungere portate. Vorremmo questa possibilità.', stato: 'nuova', priorita: 'media', data: new Date(Date.now() - 18000000) },
  { id: 'S007', fonte: 'app_user', utenteId: 'U2008', oggetto: 'Prenotazione scomparsa dal mio profilo', desc: 'Avevo una prenotazione confermata per stasera, ora non la trovo più.', stato: 'nuova', priorita: 'alta', data: new Date(Date.now() - 600000) },
  { id: 'S008', fonte: 'gestionale', localeId: 'L1031', oggetto: 'Richiesta nuova funzione: export PDF fatture', desc: 'Vorremmo poter esportare tutte le fatture del mese in un unico PDF.', stato: 'nuova', priorita: 'bassa', data: new Date(Date.now() - 86400000 * 4) },
  { id: 'S009', fonte: 'staff', localeId: 'L1027', oggetto: 'App si chiude improvvisamente sul Samsung A12', desc: 'Crash random durante la presa ordine. Capita 3-4 volte a turno.', stato: 'risolta', priorita: 'alta', data: new Date(Date.now() - 86400000 * 7), risoltaDa: 'support1', risoltaIl: new Date(Date.now() - 86400000 * 5) },
  { id: 'S010', fonte: 'app_user', utenteId: 'U2018', oggetto: 'Codice sconto non funzionante', desc: 'Inserisco BENVENUTO10 e dice "non valido". Sono nuovo utente.', stato: 'risolta', priorita: 'bassa', data: new Date(Date.now() - 86400000 * 10), risoltaDa: 'support2', risoltaIl: new Date(Date.now() - 86400000 * 9) },
  { id: 'S011', fonte: 'gestionale', localeId: 'L1009', oggetto: 'Sincronizzazione menu KO dopo modifica', desc: 'Dopo aver modificato un piatto il menu su staff non si è aggiornato. Solo dopo logout/login.', stato: 'in_corso', priorita: 'media', data: new Date(Date.now() - 28800000), assignedTo: 'support1' },
  { id: 'S012', fonte: 'staff', localeId: 'L1015', oggetto: 'Manca pulsante "richiama cameriere"', desc: 'I tavoli non possono richiamarci dall\'app cliente. Sarebbe utile.', stato: 'nuova', priorita: 'bassa', data: new Date(Date.now() - 86400000) },
];

// ---------- CERTIFICAZIONI ALIMENTARI (food / dietary)
// Solo certificazioni che riguardano regimi alimentari, intolleranze, religioni:
// non documenti commerciali (visura, licenza, SCIA).
const CERT_TIPI = {
  aic:        { label: 'Senza glutine · AIC',          desc: 'Associazione Italiana Celiachia',           ente: 'AIC' },
  halal:      { label: 'Halal',                        desc: 'Conforme alla legge islamica',             ente: 'Halal Italia' },
  kosher:     { label: 'Kosher',                       desc: 'Conforme alle norme dietetiche ebraiche',  ente: 'Rabbinato' },
  vegan_eve:  { label: 'Vegan · V-Label',              desc: 'Menu o piatti 100% vegani',                ente: 'V-Label' },
  vegetarian: { label: 'Vegetariano · V-Label',        desc: 'Menu o piatti vegetariani certificati',    ente: 'V-Label' },
  bio:        { label: 'Biologico',                    desc: 'Materie prime biologiche certificate',     ente: 'ICEA / CCPB' },
  km0:        { label: 'Km0 · Filiera corta',          desc: 'Materie prime locali tracciabili',         ente: 'Coldiretti' },
  dop_igp:    { label: 'DOP / IGP',                    desc: 'Prodotti a denominazione protetta',        ente: 'MIPAAF' },
  lactose:    { label: 'Senza lattosio',               desc: 'Menu sicuro per intolleranti al lattosio', ente: 'Auto-dichiarata' },
};

const CERTIFICAZIONI = [
  { id: 'C001', localeId: 'L1008', tipo: 'aic',        stato: 'pending', dataInvio: new Date(Date.now() - 3600000 * 4),  scadenzaCert: new Date('2027-03-15'), file: 'AIC_attestato_2025.pdf', size: '1.2 MB' },
  { id: 'C002', localeId: 'L1014', tipo: 'halal',      stato: 'pending', dataInvio: new Date(Date.now() - 3600000 * 12), scadenzaCert: new Date('2026-12-30'), file: 'Halal_Italia_cert.pdf', size: '847 KB' },
  { id: 'C003', localeId: 'L1019', tipo: 'vegan_eve',  stato: 'pending', dataInvio: new Date(Date.now() - 86400000),     scadenzaCert: new Date('2027-01-15'), file: 'V-Label_vegan.pdf', size: '1.1 MB' },
  { id: 'C004', localeId: 'L1021', tipo: 'aic',        stato: 'pending', dataInvio: new Date(Date.now() - 86400000 * 2), scadenzaCert: new Date('2026-11-01'), file: 'AIC_2025.pdf', size: '980 KB' },
  { id: 'C005', localeId: 'L1024', tipo: 'bio',        stato: 'pending', dataInvio: new Date(Date.now() - 86400000 * 3), scadenzaCert: new Date('2027-06-20'), file: 'ICEA_bio_2025.pdf', size: '1.7 MB' },
  { id: 'C006', localeId: 'L1027', tipo: 'kosher',     stato: 'pending', dataInvio: new Date(Date.now() - 86400000 * 5), scadenzaCert: new Date('2027-02-10'), file: 'Kosher_attestato.pdf', size: '650 KB' },
  // history (approved / rejected)
  { id: 'C007', localeId: 'L1018', tipo: 'aic',        stato: 'approvata', dataInvio: new Date(Date.now() - 86400000 * 30), revisedAt: new Date(Date.now() - 86400000 * 28), revisedBy: 'admin1', file: 'AIC_2024.pdf', size: '1.1 MB' },
  { id: 'C008', localeId: 'L1031', tipo: 'halal',      stato: 'rifiutata', dataInvio: new Date(Date.now() - 86400000 * 20), revisedAt: new Date(Date.now() - 86400000 * 18), revisedBy: 'admin1', motivo: 'Documento scaduto: la certificazione Halal era valida fino al 31/12/2023. Caricare la versione rinnovata.', file: 'Halal_2023.pdf', size: '420 KB' },
  { id: 'C009', localeId: 'L1019', tipo: 'vegetarian', stato: 'approvata', dataInvio: new Date(Date.now() - 86400000 * 45), revisedAt: new Date(Date.now() - 86400000 * 43), revisedBy: 'admin2', file: 'V-Label_veg.pdf', size: '1.4 MB' },
];

// ---------- TEAM ADMIN ----------
const PERMESSI = [
  { id: 'dashboard',      label: 'Analisi Dati',           desc: 'Accesso alle analisi della piattaforma' },
  { id: 'locali',         label: 'Gestione Locali e staff', desc: 'Visualizza e modifica locali e camerieri' },
  { id: 'utenti',         label: 'Gestione utenti',        desc: 'Visualizza e modifica gli utenti app' },
  { id: 'segnalazioni',   label: 'Ticket',                 desc: 'Gestisce i ticket aperti dai locali: richieste e segnalazioni' },
  // Separato da «segnalazioni» perché è un'altra cosa: qui si chiama un
  // numero entro una scadenza e si pubblica la base di conoscenza, e la
  // pubblicazione è un potere che non si dà a chiunque legga i ticket.
  { id: 'assistenza',     label: 'Chiamate e knowledge base', desc: 'Coda delle chiamate, FAQ e guide pubblicate ai ristoratori' },
  { id: 'certificazioni', label: 'Certificazioni',         desc: 'Revisiona le certificazioni alimentari' },
  { id: 'messaggi',       label: 'Messaggi & Broadcast',   desc: 'Invia comunicazioni agli utenti' },
  // Economix e Conformita mancavano dalla matrice pur essendo due sezioni intere
  // dell'applicazione: finche non c'erano, «7 aree su 7» voleva dire accesso a
  // tutto mentre due sezioni restavano fuori dal conteggio.
  { id: 'economix',       label: 'Economix',               desc: 'Costi, conto economico, cassa e stato patrimoniale' },
  { id: 'conformita',     label: 'Risk Management',        desc: 'Rischi, adempimenti, fornitori, incidenti e audit' },
  { id: 'sicurezza',      label: 'Sicurezza e sistemi',    desc: 'Membri del team, riesame degli accessi, audit log e diagnostica' },
  { id: 'team',           label: 'Impostazioni piattaforma', desc: 'Configurazione tecnica e parametri della piattaforma' },
];

const RUOLI = {
  super_admin: { label: 'Super Admin', desc: 'Accesso totale, può gestire il team', color: 'DANGER',    permessi: ['dashboard','locali','utenti','segnalazioni','assistenza','certificazioni','messaggi','economix','conformita','sicurezza','team'] },
  support:     { label: 'Support',    desc: 'Segnalazioni, richiamate e certificazioni', color: 'INFO', permessi: ['dashboard','locali','utenti','segnalazioni','assistenza','certificazioni'] },
  marketing:   { label: 'Marketing',  desc: 'Campagne e broadcast', color: 'WARN',                      permessi: ['dashboard','messaggi'] },
  // AFC: i conti e i controlli, senza toccare l'operativita. Non ha accesso a
  // locali, utenti e segnalazioni perche non gli servono per il suo lavoro, e
  // dare piu di quanto serve e esattamente cio che la A.5.15 chiede di evitare.
  afc:         { label: 'AFC',        desc: 'Amministrazione, finanza e controllo', color: 'TEAL',      permessi: ['dashboard','economix','conformita'] },
  // ICT tiene account, accessi, tracce e salute dei sistemi: e il perimetro di
  // chi amministra la piattaforma, non di chi la usa.
  // Le impostazioni della piattaforma sono leve commerciali — prezzi, piani,
  // soglie — e restano al solo Super Admin: ICT amministra i sistemi, non decide
  // quanto costa un piano.
  ict:         { label: 'ICT',        desc: 'Sistemi, accessi e diagnostica', color: 'INK',            permessi: ['dashboard','sicurezza'] },
  // Ultimo = ultima colonna nella matrice Ruoli & Permessi. Sola visualizzazione.
  operations:  { label: 'Viewer',     desc: 'Sola visualizzazione della dashboard', color: 'PURPLE',    permessi: ['dashboard'] },
};

const TEAM = [
  // nomeCompleto: "Tu" va bene nella lista del team, ma un'attestazione firmata
  // "Tu" non è evidenza — all'auditor serve il nome della persona.
  { id: 'admin0', nome: 'Tu', nomeCompleto: 'Marco Rinaldi', email: 'me@byup.it', ruolo: 'super_admin', avatar: 'TU', avatarBg: 'linear-gradient(135deg, #FF5A5F, #B53338)', lastActive: new Date(Date.now() - 60000), addedBy: '—', due_fa: true, attivo: true, addedOn: new Date('2024-01-15'), isYou: true },
  { id: 'admin1', nome: 'Laura Bianchi', email: 'l.bianchi@byup.it', ruolo: 'operations', avatar: 'LB', avatarBg: '#7C3AED', lastActive: new Date(Date.now() - 1200000), addedBy: 'Tu', due_fa: true, attivo: true, addedOn: new Date('2024-03-22') },
  { id: 'admin2', nome: 'Davide Romano', email: 'd.romano@byup.it', ruolo: 'operations', avatar: 'DR', avatarBg: '#2563EB', lastActive: new Date(Date.now() - 86400000), addedBy: 'Tu', due_fa: true, attivo: true, addedOn: new Date('2024-05-10') },
  { id: 'support1', nome: 'Sara Conti', email: 's.conti@byup.it', ruolo: 'support', avatar: 'SC', avatarBg: '#16A34A', lastActive: new Date(Date.now() - 180000), addedBy: 'Laura Bianchi', due_fa: true, attivo: true, addedOn: new Date('2024-07-04') },
  { id: 'support2', nome: 'Andrea Verdi', email: 'a.verdi@byup.it', ruolo: 'support', avatar: 'AV', avatarBg: '#D97706', lastActive: new Date(Date.now() - 7200000), addedBy: 'Laura Bianchi', due_fa: true, attivo: true, addedOn: new Date('2024-09-12') },
  { id: 'mkt1', nome: 'Paola Esposito', email: 'p.esposito@byup.it', ruolo: 'marketing', avatar: 'PE', avatarBg: '#D97706', lastActive: new Date(Date.now() - 3600000 * 5), addedBy: 'Tu', due_fa: true, attivo: true, addedOn: new Date('2024-11-20') },
  { id: 'mkt2', nome: 'Marco Galli', email: 'm.galli@byup.it', ruolo: 'marketing', avatar: 'MG', avatarBg: '#B45309', lastActive: new Date(Date.now() - 86400000 * 7), addedBy: 'Tu', due_fa: true, attivo: true, addedOn: new Date('2025-02-03') },
  // I tre casi che un riesame degli accessi deve pescare. Senza, la schermata
  // mostrerebbe sette persone tutte attive oggi e non dimostrerebbe nulla.
  { id: 'mkt3', nome: 'Elena Ricci', email: 'e.ricci@byup.it', ruolo: 'marketing', avatar: 'ER', avatarBg: '#0891B2', lastActive: new Date(Date.now() - 86400000 * 142), addedBy: 'Paola Esposito', due_fa: true, attivo: true, addedOn: new Date('2025-06-10') },
  { id: 'support3', nome: 'Nicola Ferrara', email: 'n.ferrara@byup.it', ruolo: 'support', avatar: 'NF', avatarBg: '#4F46E5', lastActive: new Date(Date.now() - 86400000 * 3), addedBy: 'Sara Conti', due_fa: true, attivo: true, addedOn: new Date('2026-07-08') },
  { id: 'support4', nome: 'Chiara Fumagalli', email: 'c.fumagalli@byup.it', ruolo: 'support', avatar: 'CF', avatarBg: '#9333EA', lastActive: null, addedBy: 'Tu', due_fa: false, attivo: true, pending: true, addedOn: new Date('2026-06-20') },
];

// ─── Riesame periodico dei diritti di accesso (ISO/IEC 27001 A.5.18) ─────────
// Il controllo non è "esiste una lista": è poter dimostrare che a una certa
// data una persona ha guardato chi ha accesso a cosa e ha deciso, e che le
// revoche sono state eseguite. Ambito = solo il team admin di Byup.
//
// La CADENZA non sta qui. Sta nell'adempimento `acc` del Cruscotto di Risk
// Management (admin-conformita-data.jsx), insieme agli altri obblighi
// ricorrenti, ed è lì che si cambia. Averla anche qui voleva dire due numeri da
// tenere allineati a mano: c'era una costante `RIESAME_CADENZA_MESI = 3` che
// nessuno leggeva, e una `scadenza` scritta a mano che non si muoveva se la
// cadenza cambiava. Ora la scadenza si calcola — vedi raScadenza in
// admin-team.jsx — da ultima esecuzione + cadenza, come per ogni altro
// adempimento.
const RIESAME_CORRENTE = {
  id: 'RA-2026-Q3',
  periodo: 'Q3 2026',
  apertaIl: new Date('2026-07-01T09:00:00'),
  revisore: 'Marco Rinaldi',
  stato: 'aperta',
  esiti: [],
};

// Campagne chiuse: sono l'evidenza da mostrare all'auditor. Una volta chiuse
// non si modificano — una correzione è una campagna nuova, mai una riscrittura.
const RIESAMI_CHIUSI = [
  {
    id: 'RA-2026-Q2',
    periodo: 'Q2 2026',
    apertaIl: new Date('2026-04-01T09:00:00'),
    scadenza: new Date('2026-04-30T23:59:59'),
    chiusaIl: new Date('2026-04-14T15:20:00'),
    revisore: 'Marco Rinaldi',
    stato: 'chiusa',
    esiti: [
      { soggettoId:'admin0',   decisione:'confermato', ruoloAllora:'super_admin', chi:"d'ufficio",     quando:new Date('2026-04-14T15:10:00'), motivo:'Super Admin titolare — accesso per definizione del ruolo' },
      { soggettoId:'admin1',   decisione:'confermato', ruoloAllora:'operations',  chi:'Marco Rinaldi', quando:new Date('2026-04-14T15:12:00'), motivo:'' },
      { soggettoId:'admin2',   decisione:'confermato', ruoloAllora:'operations',  chi:'Marco Rinaldi', quando:new Date('2026-04-14T15:13:00'), motivo:'' },
      { soggettoId:'support1', decisione:'confermato', ruoloAllora:'support',     chi:'Marco Rinaldi', quando:new Date('2026-04-14T15:14:00'), motivo:'' },
      // Andrea era Viewer e oggi è Support: il riesame lo deve segnalare.
      { soggettoId:'support2', decisione:'confermato', ruoloAllora:'operations',  chi:'Marco Rinaldi', quando:new Date('2026-04-14T15:15:00'), motivo:'' },
      { soggettoId:'mkt1',     decisione:'confermato', ruoloAllora:'marketing',   chi:'Marco Rinaldi', quando:new Date('2026-04-14T15:17:00'), motivo:'' },
      { soggettoId:'mkt2',     decisione:'confermato', ruoloAllora:'marketing',   chi:'Marco Rinaldi', quando:new Date('2026-04-14T15:18:00'), motivo:'' },
      { soggettoId:'mkt3',     decisione:'confermato', ruoloAllora:'marketing',   chi:'Marco Rinaldi', quando:new Date('2026-04-14T15:20:00'), motivo:'' },
    ],
  },
  {
    id: 'RA-2026-Q1',
    periodo: 'Q1 2026',
    apertaIl: new Date('2026-01-02T09:00:00'),
    scadenza: new Date('2026-01-31T23:59:59'),
    chiusaIl: new Date('2026-01-16T16:42:00'),
    revisore: 'Marco Rinaldi',
    stato: 'chiusa',
    esiti: [
      { soggettoId:'admin0',   decisione:'confermato', ruoloAllora:'super_admin', chi:"d'ufficio",     quando:new Date('2026-01-16T16:30:00'), motivo:'Super Admin titolare — accesso per definizione del ruolo' },
      { soggettoId:'admin1',   decisione:'confermato', ruoloAllora:'operations',  chi:'Marco Rinaldi', quando:new Date('2026-01-16T16:33:00'), motivo:'' },
      { soggettoId:'admin2',   decisione:'confermato', ruoloAllora:'operations',  chi:'Marco Rinaldi', quando:new Date('2026-01-16T16:34:00'), motivo:'' },
      { soggettoId:'support1', decisione:'confermato', ruoloAllora:'support',     chi:'Marco Rinaldi', quando:new Date('2026-01-16T16:35:00'), motivo:'' },
      { soggettoId:'support2', decisione:'confermato', ruoloAllora:'operations',  chi:'Marco Rinaldi', quando:new Date('2026-01-16T16:36:00'), motivo:'' },
      { soggettoId:'mkt1',     decisione:'confermato', ruoloAllora:'marketing',   chi:'Marco Rinaldi', quando:new Date('2026-01-16T16:38:00'), motivo:'' },
      { soggettoId:'mkt2',     decisione:'confermato', ruoloAllora:'marketing',   chi:'Marco Rinaldi', quando:new Date('2026-01-16T16:39:00'), motivo:'' },
      { soggettoId:'mkt3',     decisione:'confermato', ruoloAllora:'marketing',   chi:'Marco Rinaldi', quando:new Date('2026-01-16T16:40:00'), motivo:'' },
      { soggettoId:'exdev1',   decisione:'revocato',   ruoloAllora:'super_admin', chi:'Marco Rinaldi', quando:new Date('2026-01-16T16:41:00'), motivo:'Collaborazione terminata il 30/11/2025 — accesso non più necessario', eseguito:true, nomeStorico:'Tommaso Neri' },
    ],
  },
  {
    id: 'RA-2025-Q4',
    periodo: 'Q4 2025',
    apertaIl: new Date('2025-10-01T09:00:00'),
    scadenza: new Date('2025-10-31T23:59:59'),
    chiusaIl: new Date('2025-10-20T11:05:00'),
    revisore: 'Marco Rinaldi',
    stato: 'chiusa',
    esiti: [
      { soggettoId:'admin0',   decisione:'confermato', ruoloAllora:'super_admin', chi:"d'ufficio",     quando:new Date('2025-10-20T10:58:00'), motivo:'Super Admin titolare — accesso per definizione del ruolo' },
      { soggettoId:'admin1',   decisione:'confermato', ruoloAllora:'operations',  chi:'Marco Rinaldi', quando:new Date('2025-10-20T11:00:00'), motivo:'' },
      { soggettoId:'admin2',   decisione:'confermato', ruoloAllora:'operations',  chi:'Marco Rinaldi', quando:new Date('2025-10-20T11:01:00'), motivo:'' },
      { soggettoId:'support1', decisione:'confermato', ruoloAllora:'support',     chi:'Marco Rinaldi', quando:new Date('2025-10-20T11:02:00'), motivo:'' },
      { soggettoId:'support2', decisione:'confermato', ruoloAllora:'operations',  chi:'Marco Rinaldi', quando:new Date('2025-10-20T11:03:00'), motivo:'' },
      { soggettoId:'mkt1',     decisione:'confermato', ruoloAllora:'marketing',   chi:'Marco Rinaldi', quando:new Date('2025-10-20T11:04:00'), motivo:'' },
      { soggettoId:'mkt2',     decisione:'confermato', ruoloAllora:'marketing',   chi:'Marco Rinaldi', quando:new Date('2025-10-20T11:05:00'), motivo:'' },
      { soggettoId:'exdev1',   decisione:'confermato', ruoloAllora:'super_admin', chi:'Marco Rinaldi', quando:new Date('2025-10-20T11:05:30'), motivo:'', nomeStorico:'Tommaso Neri' },
    ],
  },
];

// ---------- TOP PIATTI / ORDINI / CITTÀ aggregati ----------
const TOP_PIATTI = [
  { nome: 'Pizza Margherita', categoria: 'Pizza', ordini: 12480, locali: 32, trend: +12 },
  { nome: 'Carbonara', categoria: 'Primi', ordini: 8930, locali: 28, trend: +8 },
  { nome: 'Tagliata di Manzo', categoria: 'Secondi', ordini: 6210, locali: 19, trend: +3 },
  { nome: 'Tiramisù', categoria: 'Dolci', ordini: 5870, locali: 35, trend: +15 },
  { nome: 'Cacio e Pepe', categoria: 'Primi', ordini: 4920, locali: 24, trend: -2 },
  { nome: 'Pizza Diavola', categoria: 'Pizza', ordini: 4760, locali: 30, trend: +6 },
  { nome: 'Lasagne al Forno', categoria: 'Primi', ordini: 4120, locali: 21, trend: +4 },
  { nome: 'Spritz Aperol', categoria: 'Drinks', ordini: 3980, locali: 38, trend: +20 },
];

const TOP_CITTA = [
  { citta: 'Milano', locali: 12, ordini: 28430, mrr: 1488 },
  { citta: 'Roma', locali: 9, ordini: 22180, mrr: 1191 },
  { citta: 'Napoli', locali: 7, ordini: 18920, mrr: 893 },
  { citta: 'Bologna', locali: 4, ordini: 9120, mrr: 446 },
  { citta: 'Firenze', locali: 3, ordini: 7340, mrr: 297 },
  { citta: 'Torino', locali: 3, ordini: 6840, mrr: 247 },
];

const SCREENS_USAGE = [
  { nome: 'Panoramica', visite: 18920, pct: 92, tabs: [] },
  { nome: 'Sala & Prenotazioni', visite: 14210, pct: 78, tabs: [
    { nome: 'Tavoli (live)', pct: 88 },
    { nome: 'Calendario prenotazioni', pct: 64 },
    { nome: 'Vendita al tavolo', pct: 71 },
  ] },
  { nome: 'Cucina', visite: 12480, pct: 71, tabs: [
    { nome: 'In preparazione', pct: 95 },
    { nome: 'Storico ordini', pct: 32 },
  ] },
  { nome: 'Statistiche', visite: 9320, pct: 58, tabs: [
    { nome: 'Economici', pct: 74 },
    { nome: 'Ordini', pct: 61 },
    { nome: 'Prenotazioni', pct: 48 },
    { nome: 'Clienti', pct: 41 },
    { nome: 'Staff', pct: 28 },
  ] },
  { nome: 'Impostazioni', visite: 7340, pct: 46, tabs: [
    { nome: 'Menu & cucina', pct: 78 },
    { nome: 'Mappa sala', pct: 52 },
    { nome: 'Tavoli', pct: 45 },
    { nome: 'Vetrina', pct: 38 },
    { nome: 'Personale', pct: 31 },
    { nome: 'Dati fiscali', pct: 22 },
    { nome: 'Integrazioni', pct: 17 },
  ] },
  { nome: 'Contabilità', visite: 4820, pct: 31, tabs: [
    { nome: 'Cassa', pct: 68 },
    { nome: 'Costi', pct: 42 },
    { nome: 'IVA & Export', pct: 35 },
  ] },
  { nome: 'Staff', visite: 3210, pct: 22, tabs: [] },
  { nome: 'Supporto', visite: 2840, pct: 19, tabs: [
    { nome: 'FAQ', pct: 51 },
    { nome: 'Tutorial', pct: 44 },
    { nome: 'Chat con noi', pct: 38 },
    { nome: 'Ticket', pct: 17 },
  ] },
  { nome: 'Account', visite: 1610, pct: 11, tabs: [
    { nome: 'Piani', pct: 62 },
    { nome: 'Fatturazione', pct: 48 },
    { nome: 'Dati', pct: 33 },
    { nome: 'Password', pct: 11 },
  ] },
];

// Funzionalità più usate (cross-screen, azioni discrete)
//
// I volumi si derivano dagli ordini che i locali processano davvero in un
// mese: scritti a mano dicevano 124.800 aggiunte di articolo su una
// piattaforma che di ordini ne fa quindicimila, e la stessa voce nella tab
// Staff ne diceva un altro paio di migliaia. Le due schermate raccontavano
// due aziende diverse.
const FEATURES_USAGE = (() => {
  const ordiniMese = LOCALI
    .filter(l => l.stato === 'active' || l.stato === 'inactive')
    .reduce((s, l) => s + (l.ordiniMese || 0), 0);
  const alTavolo = Math.round(ordiniMese * 0.55);   // la quota presa dal cameriere
  const prenotazioniMese = LOCALI
    .filter(l => l.stato === 'active')
    .reduce((s, l) => s + (l.prenotazioniMese || 0), 0);
  const attivi = LOCALI.filter(l => l.stato === 'active').length;
  return [
    { nome: 'Aggiunta articolo all\'ordine',     modulo: 'Sala / Cucina',  usi: Math.round(alTavolo * 3.5),  pct: 95, trend: +7 },
    { nome: 'Apertura tavolo',                  modulo: 'Sala',           usi: alTavolo,                    pct: 96, trend: +4 },
    { nome: 'Saldo conto al tavolo',            modulo: 'Sala',           usi: Math.round(alTavolo * 0.92), pct: 92, trend: +5 },
    { nome: 'Stampa scontrino',                 modulo: 'Cassa',          usi: Math.round(alTavolo * 0.58), pct: 89, trend: +2 },
    { nome: 'Conferma prenotazione',            modulo: 'Sala',           usi: Math.round(prenotazioniMese * 0.86), pct: 68, trend: +9 },
    { nome: 'Modifica menu (piatto)',           modulo: 'Impostazioni',   usi: Math.round(attivi * 34),     pct: 71, trend: +12 },
    { nome: 'Spostamento tavolo / unione',      modulo: 'Sala',           usi: Math.round(alTavolo * 0.08), pct: 52, trend: +3 },
    { nome: 'Export IVA mensile',               modulo: 'Contabilità',    usi: Math.round(attivi * 1.4),    pct: 38, trend: +6 },
    { nome: 'Invito staff (link)',              modulo: 'Personale',      usi: Math.round(attivi * 2.1),    pct: 31, trend: +8 },
    { nome: 'Apertura ticket supporto',         modulo: 'Supporto',       usi: Math.round(attivi * 1.9),    pct: 22, trend: -3 },
    { nome: 'Pubblica menu su vetrina',         modulo: 'Vetrina',        usi: Math.round(attivi * 0.7),    pct: 18, trend: +15 },
    { nome: 'Importazione menu da PDF',         modulo: 'Onboarding',     usi: Math.round(attivi * 0.5),    pct: 48, trend: +24 },
  ];
})();

// ═══════════════════════════════════════════════════════════════════════════
// AFFIDABILITÀ · il modo in cui si muore davvero
// ═══════════════════════════════════════════════════════════════════════════
//
// byup porta responsabilità fiscale e incassa denaro per conto di altri. Non
// si perde un locale per un CSAT basso: lo si perde il sabato sera in cui
// venti locali non riescono a chiudere un conto, o il giorno in cui i
// corrispettivi non arrivano all'Agenzia e il commercialista chiama.
//
// Cinque numeri, e nessuno è una media annuale: sono tutti sulla finestra in
// cui il danno succede.
//
//   corrispettivi   trasmissioni all'AdE rifiutate. Ogni rifiuto è un
//                   adempimento che salta, e scade
//   pagamenti       transazioni fallite sull'incassato dei locali, e quante
//                   la coda di retry recupera da sola
//   rimborsi        soldi restituiti: quando salgono, qualcosa a monte non
//                   funziona
//   retry           cosa c'è in coda ADESSO e da quanto: una coda che
//                   invecchia è un incidente che sta maturando
//   uptime          nelle DUE fasce che contano — pranzo e cena — non sulle
//                   24 ore, dove le notti tranquille annacquano i minuti giù
//                   del servizio serale
const AFFIDABILITA = (() => {
  const r = pseudoRand(9137);
  const live = LOCALI.filter(l => l.stato === 'active' || l.stato === 'inactive');
  const ordiniMese = live.reduce((s, l) => s + (l.ordiniMese || 0), 0);
  const incassatoMese = live.reduce((s, l) => s + (l.ordiniMese || 0) * (l.ticketMedio || 25), 0);

  // Un corrispettivo per giornata di apertura per locale attivo.
  const trasmessi30g = Math.round(LOCALI.filter(l => l.stato === 'active').length * 27);
  const rifiutati30g = Math.round(trasmessi30g * 0.021);
  const rifiutatiOggi = Math.max(0, Math.round(rifiutati30g / 30 + (r() > 0.5 ? 1 : 0)));

  const transazioni30g = Math.round(ordiniMese * 0.78);   // il resto è contante
  const falliti30g = Math.round(transazioni30g * 0.017);
  const recuperati30g = Math.round(falliti30g * 0.61);

  const rimborsi30g = Math.round(transazioni30g * 0.006);
  const importoRimborsi = Math.round(rimborsi30g * (incassatoMese / Math.max(1, transazioni30g)) * 1.35);

  return {
    corrispettivi: {
      trasmessi30g, rifiutati30g, rifiutatiOggi,
      pct: trasmessi30g ? +(rifiutati30g / trasmessi30g * 100).toFixed(1) : 0,
      localiCoinvolti: Math.min(LOCALI.filter(l => l.stato === 'active').length, Math.round(rifiutati30g * 0.42)),
      // Il rifiuto più vecchio ancora non risolto: è quello che scade prima.
      piuVecchioOre: 31,
      causaPrima: 'Codice ateco assente sul profilo fiscale',
    },
    pagamenti: {
      transazioni30g, falliti30g, recuperati30g,
      pct: transazioni30g ? +(falliti30g / transazioni30g * 100).toFixed(1) : 0,
      importoFallito: Math.round(falliti30g * (incassatoMese / Math.max(1, transazioni30g))),
      pctRecuperati: falliti30g ? Math.round(recuperati30g / falliti30g * 100) : 0,
    },
    rimborsi: {
      n30g: rimborsi30g,
      importo: importoRimborsi,
      pctSuIncassato: incassatoMese ? +(importoRimborsi / incassatoMese * 100).toFixed(2) : 0,
    },
    retry: {
      inCoda: 34,
      piuVecchioMin: 47,
      // Cosa c'è dentro, perché «34 in coda» senza il tipo non dice se è un
      // problema di soldi o di fisco.
      composizione: [
        { tipo: 'Corrispettivi verso AdE', n: 19 },
        { tipo: 'Webhook di pagamento',    n: 11 },
        { tipo: 'Notifiche push',          n: 4 },
      ],
    },
    uptime: {
      globale: 99.94,
      // Pranzo 12:00-14:30 e cena 19:00-23:00: è lì che un minuto giù è un
      // conto che non si chiude con la gente al tavolo.
      picco: 99.61,
      minutiGiuPicco30g: 21,
      minutiGiuTotali30g: 26,
      peggiorGiorno: 'sabato 19:00-23:00',
    },
  };
})();

// Revenue mensile (ultimi 13 mesi) — separato subscription vs extras
// Order: dec 2024 → dec 2025
//
// La FORMA della curva è scritta a mano (la crescita mese su mese), il suo
// LIVELLO no: l'ultimo mese deve valere quello che i locali paganti pagano
// davvero, altrimenti la serie storica e l'anagrafica raccontano due aziende
// diverse. Sotto, la curva viene riscalata su MRR_ORA.
const MONTHLY_REVENUE_FORMA = [
  { mese: 'Dic 24', sub: 2840, extra: 320,  anno: 2024, m: 11 },
  { mese: 'Gen 25', sub: 3120, extra: 410,  anno: 2025, m: 0 },
  { mese: 'Feb 25', sub: 3340, extra: 460,  anno: 2025, m: 1 },
  { mese: 'Mar 25', sub: 3580, extra: 510,  anno: 2025, m: 2 },
  { mese: 'Apr 25', sub: 3820, extra: 580,  anno: 2025, m: 3 },
  { mese: 'Mag 25', sub: 4120, extra: 640,  anno: 2025, m: 4 },
  { mese: 'Giu 25', sub: 4380, extra: 720,  anno: 2025, m: 5 },
  { mese: 'Lug 25', sub: 4640, extra: 810,  anno: 2025, m: 6 },
  { mese: 'Ago 25', sub: 4810, extra: 740,  anno: 2025, m: 7 },
  { mese: 'Set 25', sub: 5020, extra: 880,  anno: 2025, m: 8 },
  { mese: 'Ott 25', sub: 5240, extra: 920,  anno: 2025, m: 9 },
  { mese: 'Nov 25', sub: 5380, extra: 980,  anno: 2025, m: 10 },
  { mese: 'Dic 25', sub: 5520, extra: 1040, anno: 2025, m: 11 },
];

const MONTHLY_REVENUE = (() => {
  const ultimo = MONTHLY_REVENUE_FORMA[MONTHLY_REVENUE_FORMA.length - 1];
  const kSub = ultimo.sub ? MRR_ORA.abbonamenti / ultimo.sub : 1;
  const kExtra = ultimo.extra ? MRR_ORA.extra / ultimo.extra : 1;
  return MONTHLY_REVENUE_FORMA.map(m => ({
    ...m,
    sub: Math.round(m.sub * kSub),
    extra: Math.round(m.extra * kExtra),
  }));
})();

// ═══════════════════════════════════════════════════════════════════════════
// RETE · la prova che i locali non sono venticinque app separate
// ═══════════════════════════════════════════════════════════════════════════
//
// Un utente che ordina solo dove ha ordinato la prima volta ha scaricato
// l'app di quel ristorante. Uno che ordina in un secondo locale ha scaricato
// byup. La differenza fra le due cose è tutto il modello: il flywheel B2B2C
// esiste solo se il consumatore porta byup da un locale all'altro, e questo è
// l'unico numero che lo dice.
const RETE = (() => {
  const conOrdini = UTENTI.filter(u => u.ordini > 0);
  const cross = conOrdini.filter(u => u.crossLocale);
  const distribuzione = [
    { label:'1 locale',    n: conOrdini.filter(u => u.localiOrdinati === 1).length },
    { label:'2 locali',    n: conOrdini.filter(u => u.localiOrdinati === 2).length },
    { label:'3-4 locali',  n: conOrdini.filter(u => u.localiOrdinati >= 3 && u.localiOrdinati <= 4).length },
    { label:'5 o più',     n: conOrdini.filter(u => u.localiOrdinati >= 5).length },
  ];
  const mediaCross = cross.length
    ? cross.reduce((s, u) => s + u.localiOrdinati, 0) / cross.length : 0;
  const ordiniMediCross = cross.length ? cross.reduce((s,u)=>s+u.ordini,0)/cross.length : 0;
  const ordiniMediSolo = (conOrdini.length - cross.length)
    ? conOrdini.filter(u => !u.crossLocale).reduce((s,u)=>s+u.ordini,0) / (conOrdini.length - cross.length) : 0;

  // ── Normalizzato per densità ────────────────────────────────────────────
  //
  // Il tasso complessivo non misura l'effetto rete: misura Milano. Dove
  // abbiamo dodici locali il secondo ordine altrove è meccanicamente
  // possibile, dove ne abbiamo uno è impossibile per costruzione — e un
  // utente di Cuneo che non gira non ci sta dicendo che la rete non funziona,
  // ci sta dicendo che a Cuneo non c'è.
  //
  // È la stessa logica della soglia di densità della discovery: sotto un
  // certo numero di locali nel raggio, la funzione non si accende. Qui sotto
  // un certo numero di locali in città, il numero non si legge.
  const localiPerCitta = {};
  LOCALI.filter(l => l.stato === 'active' || l.stato === 'inactive')
    .forEach(l => { localiPerCitta[l.citta] = (localiPerCitta[l.citta] || 0) + 1; });
  // Le soglie sono quelle che la rete di oggi consente di distinguere: con
  // trenta locali su venti città, «cinque o più» sarebbe una fascia vuota e
  // non direbbe niente. Vanno rialzate appena la rete cresce.
  const FASCE = [
    { id:'densa',  label:'4 o più locali in città', min:4,  max:99 },
    { id:'media',  label:'2-3 locali',              min:2,  max:3  },
    { id:'sottile',label:'1 locale',                min:0,  max:1  },
  ];
  const perDensita = FASCE.map(f => {
    const suoi = conOrdini.filter(u => {
      const n = localiPerCitta[u.citta] || 0;
      return n >= f.min && n <= f.max;
    });
    const suoiCross = suoi.filter(u => u.crossLocale);
    return {
      ...f,
      utenti: suoi.length,
      cross: suoiCross.length,
      pct: suoi.length ? Math.round(suoiCross.length / suoi.length * 100) : null,
      citta: Object.keys(localiPerCitta).filter(c => {
        const n = localiPerCitta[c];
        return n >= f.min && n <= f.max;
      }).length,
    };
  });

  return {
    conOrdini: conOrdini.length,
    cross: cross.length,
    pct: conOrdini.length ? Math.round(cross.length / conOrdini.length * 100) : 0,
    distribuzione,
    mediaCross,
    ordiniMediCross,
    ordiniMediSolo,
    perDensita,
    localiPerCitta,
  };
})();

// ═══════════════════════════════════════════════════════════════════════════
// ESPANSIONE · chi sfonda il piano, e chi poi fa upgrade
// ═══════════════════════════════════════════════════════════════════════════
//
// Su venticinque locali attivi la crescita non la fa l'acquisizione: la fa
// l'espansione dentro la base che c'è. Il ricavo da extra ordini è il segnale
// grezzo — qualcuno sta consumando più di quanto il suo piano includa — e la
// domanda che conta è quanti di quelli passano al piano sopra invece di
// continuare a pagare gli extra a prezzo pieno.
const ESPANSIONE = (() => {
  const live = LOCALI.filter(l => l.stato === 'active' || l.stato === 'inactive');
  const sopraSoglia = live.filter(l => (l.ordiniOltre || 0) > 0)
    .sort((a, b) => (b.ordiniOltre || 0) - (a.ordiniOltre || 0));
  const g90 = Date.now() - 90 * 86400000;
  const upgrade90g = live.filter(l => l.upgradeIl && l.upgradeIl.getTime() >= g90);
  const extraMese = live.reduce((s, l) => s + (l.extras || 0), 0);
  return {
    sopraSoglia,
    nSopraSoglia: sopraSoglia.length,
    pctSopraSoglia: live.length ? Math.round(sopraSoglia.length / live.length * 100) : 0,
    upgrade90g,
    nUpgrade90g: upgrade90g.length,
    // Il tasso di upgrade ha un denominatore preciso: i CANDIDATI del periodo,
    // cioè chi sta sopra soglia adesso più chi ci stava e ha già fatto il
    // passo. Dividere gli upgrade per i soli locali ancora sopra soglia dà
    // percentuali sopra il cento — chi è passato al piano sopra, quasi
    // sempre, sopra soglia non ci sta più.
    candidati: sopraSoglia.length + upgrade90g.length,
    tassoUpgrade: (sopraSoglia.length + upgrade90g.length)
      ? Math.round(upgrade90g.length / (sopraSoglia.length + upgrade90g.length) * 100) : 0,
    extraMese,
    // Quanto varrebbe portarli tutti al piano sopra: il delta di canone, non
    // il canone intero, perché quello che pagano già lo pagano.
    upsidePotenziale: sopraSoglia.reduce((s, l) => {
      const i = PIANI.findIndex(p => p.id === l.piano);
      const sopra = PIANI[Math.min(PIANI.length - 1, i + 1)];
      return s + Math.max(0, sopra.price - PIANI[i].price);
    }, 0),
  };
})();

// ═══════════════════════════════════════════════════════════════════════════
// RITENZIONE DEL RICAVO · NRR e GRR
// ═══════════════════════════════════════════════════════════════════════════
//
// Il churn per piano dice quanti se ne vanno, l'espansione dice quanti
// crescono. Nessuno dei due, da solo, dice se il ricavo della base di ieri
// oggi vale di più o di meno — che è la prima domanda che fa un investitore,
// e la si compone con TRE pezzi, non due:
//
//   espansione    chi è passato al piano sopra (+ delta di canone)
//   contrazione   chi è passato al piano sotto: resta cliente, paga meno.
//                 Non è churn e non è espansione, e senza di lui la NRR non
//                 si può calcolare
//   churn         chi ha disdetto: il canone sparisce
//
//   NRR = (base + espansione − contrazione − churn) / base
//   GRR = (base − contrazione − churn) / base, cioè senza l'aiuto degli
//         upgrade: dice quanto tiene la base da sola
//
// La finestra è 90 giorni, la stessa dei cambi di piano registrati.
const RITENZIONE = (() => {
  const prezzo = (id) => (PIANI.find(p => p.id === id) || {}).price || 0;
  const inclusi = (id) => (PIANI.find(p => p.id === id) || {}).ordiniInclusi || 0;
  const extraUnit = (id) => (PIANI.find(p => p.id === id) || {}).ordineExtra || 0;
  const A12M = Date.now() - 365 * 86400000;

  // Il ricavo di un locale è canone PIÙ eccedenze. Un locale che paga 124 € al
  // mese di extra senza aver cambiato piano è espansione a tutti gli effetti:
  // contarlo solo se firma un upgrade vuol dire non vederlo. Da qui in giù,
  // «ricavo» vuol dire sempre canone + extra.
  //
  // Le eccedenze si contano fino a quanto costerebbe il piano sopra: oltre
  // quella cifra nessuno ci resta — il conto lo fa da solo e cambia piano — e
  // ricostruire un passato con mille euro di eccedenze fabbricherebbe una
  // contrazione che non c'è mai stata.
  const tetto = (piano) => {
    const i = PIANI.findIndex(p => p.id === piano);
    return i >= 0 && i < PIANI.length - 1 ? PIANI[i + 1].price * 0.9 : Infinity;
  };
  const ricavo = (piano, ordiniMese) => prezzo(piano)
    + Math.min(tetto(piano), Math.max(0, ordiniMese - inclusi(piano)) * extraUnit(piano));

  // Dodici mesi, non novanta giorni: su ventotto locali un trimestre contiene
  // due disdette e tre downgrade, e un singolo locale sposta l'indice di tre
  // punti. La finestra annuale è anche quella che chiedono.
  //
  // Lo stato di dodici mesi fa non è archiviato: si ricostruisce da quello che
  // sappiamo — il piano di allora (se il cambio è nell'anno) e il volume di
  // allora, riportato indietro con la crescita degli ordini di piattaforma.
  const CRESCITA_ORDINI_12M = 1.42;
  const statoAllora = (l) => {
    const cambioNellAnno = (l.upgradeIl && l.upgradeIl.getTime() >= A12M)
      || (l.downgradeIl && l.downgradeIl.getTime() >= A12M);
    return {
      piano: cambioNellAnno && l.pianoPrecedente ? l.pianoPrecedente : l.piano,
      ordiniMese: Math.round((l.ordiniMese || 0) / CRESCITA_ORDINI_12M),
    };
  };

  // La coorte: chi era cliente dodici mesi fa. I locali entrati dopo non
  // c'entrano — la ritenzione si misura sulla base di allora, senza l'aiuto
  // dei nuovi.
  const coorte = LOCALI.filter(l => (locLive(l) || locChurned(l))
    && l.dataIscrizione && l.dataIscrizione.getTime() <= A12M);
  const persi = coorte.filter(locChurned);
  const rimasti = coorte.filter(locLive);

  const base = coorte.reduce((s, l) => { const a = statoAllora(l); return s + ricavo(a.piano, a.ordiniMese); }, 0);
  const churn = persi.reduce((s, l) => { const a = statoAllora(l); return s + ricavo(a.piano, a.ordiniMese); }, 0);

  let espansione = 0, contrazione = 0;
  rimasti.forEach(l => {
    const a = statoAllora(l);
    const delta = ricavo(l.piano, l.ordiniMese || 0) - ricavo(a.piano, a.ordiniMese);
    if (delta >= 0) espansione += delta; else contrazione += -delta;
  });

  const oggi = rimasti.reduce((s, l) => s + ricavo(l.piano, l.ordiniMese || 0), 0);
  const cambi = (dir) => rimasti.filter(l => dir === 'up'
    ? (l.upgradeIl && l.upgradeIl.getTime() >= A12M)
    : (l.downgradeIl && l.downgradeIl.getTime() >= A12M)).length;

  return {
    finestra: '12 mesi',
    // Su cosa si calcola, scritto una volta e usato ovunque.
    definizione: 'canone + eccedenze oltre soglia',
    coorte: coorte.length,
    base: Math.round(base),
    espansione: Math.round(espansione),
    contrazione: Math.round(contrazione),
    churn: Math.round(churn),
    oggi: Math.round(oggi),
    nUpgrade: cambi('up'),
    nDowngrade: cambi('down'),
    nChurn: persi.length,
    // Quanta parte dell'espansione arriva dalle eccedenze e non dagli upgrade:
    // è il pezzo che prima non si vedeva.
    espansioneDaExtra: Math.round(rimasti.reduce((s, l) => {
      const a = statoAllora(l);
      const extraOggi = Math.max(0, (l.ordiniMese || 0) - inclusi(l.piano)) * extraUnit(l.piano);
      const extraAllora = Math.max(0, a.ordiniMese - inclusi(a.piano)) * extraUnit(a.piano);
      return s + Math.max(0, extraOggi - extraAllora);
    }, 0)),
    nrr: base ? Math.round((base + espansione - contrazione - churn) / base * 100) : 0,
    grr: base ? Math.round((base - contrazione - churn) / base * 100) : 0,
  };
})();

// Totale storico (somma di tutti i mesi dall'inizio piattaforma)
// Cumulato dall'avvio: si somma la serie, non si scrive a parte. Scritto a
// mano restava fermo mentre la serie si riscalava, e i due numeri finivano per
// smentirsi.
const TOTAL_REVENUE_HISTORICAL = {
  sub: MONTHLY_REVENUE.reduce((s, m) => s + m.sub, 0),
  extra: MONTHLY_REVENUE.reduce((s, m) => s + m.extra, 0),
  meseAvvio: 'Dic 2024',
};

window.ONB_STEPS = ONB_STEPS;
window.REGIONI = REGIONI;
window.PIANI = PIANI;
// ── Dunning (mock): addebiti falliti su 3 locali attivi paganti ──────────
LOCALI.filter(l => l.stato === 'active' && l.piano !== 'free').slice(3, 6).forEach((l, i) => {
  l.pagamentoFallito = {
    motivo: ['Carta scaduta', 'Fondi insufficienti', 'Carta bloccata dall\'emittente'][i % 3],
    tentativi: 1 + (i % 3),
    data: new Date(Date.now() - (2 + i * 3) * 86400000),
  };
});

window.LOCALI = LOCALI;
window.LOC = LOC;
window.MRR_ORA = MRR_ORA;
Object.assign(window, { locAttivo, locInattivo, locInOnboarding, locChurned, locLive, locPagante });
window.UTENTI = UTENTI;
window.UTILIZZO_CLUSTER = UTILIZZO_CLUSTER;
window.SEGNALAZIONI = SEGNALAZIONI;
window.CERTIFICAZIONI = CERTIFICAZIONI;
window.CERT_TIPI = CERT_TIPI;
window.TEAM = TEAM;
window.RUOLI = RUOLI;
window.PERMESSI = PERMESSI;
window.TOP_PIATTI = TOP_PIATTI;
window.TOP_CITTA = TOP_CITTA;
window.SCREENS_USAGE = SCREENS_USAGE;
window.FEATURES_USAGE = FEATURES_USAGE;
window.MONTHLY_REVENUE = MONTHLY_REVENUE;
window.AFFIDABILITA = AFFIDABILITA;
window.RETE = RETE;
window.RITENZIONE = RITENZIONE;
window.ESPANSIONE = ESPANSIONE;
window.TOTAL_REVENUE_HISTORICAL = TOTAL_REVENUE_HISTORICAL;
window.RIESAME_CORRENTE = RIESAME_CORRENTE;
window.RIESAMI_CHIUSI = RIESAMI_CHIUSI;
