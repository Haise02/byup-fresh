// Mock data layer per Admin Byup — locali, utenti, segnalazioni, certificazioni, team

// ---------- LOCALI ----------
// ─── Imbuto di onboarding (P-45 · D-34) ─────────────────────────────────────
// Si conta ciò che l'utente vede: i quattro passi del percorso rapido del
// gestionale (onboarding-app.jsx) più «Staff collegato», che non è l'invito
// ma il collaboratore che entra davvero. L'elaborazione del menù è un'attesa
// dentro il passo 1 e la verifica dell'identità — la delega sul portale
// dell'Agenzia, con l'identità dell'esercente — è un controllo dentro il
// passo 2: nessuna delle due vale uno slot. Le attivazioni fiscali (delega,
// conservazione, accreditamento: P-48) stanno tutte dentro «Il tuo locale»
// come sotto-passo, e chi si ferma lì è fermo al passo 2 — l'imbuto non ha
// un passo fiscale per regola, non per dimenticanza. L'iscrizione non è un
// passo: è il denominatore.
// Annotazione per il registro: l'«Oggi» di P-45 parlava di sette tappe con
// attese e controlli dentro; il codice ne aveva otto (iscrizione, sei del
// percorso, vetrina e personale) e nessuna era un'attesa. Il conteggio della
// voce descriveva uno stepper che il prototipo non aveva più.
const ONB_STEPS = [
  { id: 'menu',     label: 'Carica menù' },
  { id: 'locale',   label: 'Il tuo locale' },
  { id: 'sala',     label: 'Sale e tavoli' },
  { id: 'verifica', label: 'Verifica menù', avvio: true },
  { id: 'staff',    label: 'Staff collegato', dopoAvvio: true },
];
// I quattro del percorso rapido: fino all'avvio, senza lo staff.
const ONB_RAPIDO = ONB_STEPS.filter(s => !s.dopoAvvio);
// I sotto-passi di «Il tuo locale»: la lista «fermo a» li porta, l'imbuto no.
const ONB_SOTTO = [
  { id: 'informazioni', label: 'Informazioni' },
  { id: 'pagamenti',    label: 'Pagamenti' },
  { id: 'fiscale',      label: 'Attivazioni fiscali' },
];
const onbSottoLabel = (id) => (ONB_SOTTO.find(s => s.id === id) || {}).label || '';
// La configurazione completa (config-completa-app.jsx): tre passi che si
// possono saltare con «Salta e continua dopo», esposti a parte nell'imbuto con
// quanti li hanno saltati fra chi è oltre l'avvio.
const ONB_CONFIG = [
  { id: 'cfgInformazioni', label: 'Informazioni' },
  { id: 'cfgAspetto',      label: 'Aspetto' },
  { id: 'cfgPersonale',    label: 'Personale' },
];
// Quali passi della configurazione completa ha fatto un locale che NON l'ha
// saltata per intero: almeno uno, non per forza tutti — i saltati di ciascun
// passo si contano su chi è oltre l'avvio.
const onbConfigFatti = (r) => {
  const fatti = ONB_CONFIG.filter(() => r() > 0.45).map(s => s.id);
  return fatti.length ? fatti : [ONB_CONFIG[0].id];
};

// ─── Ciclo di vita del locale (P-44 · D-34) ─────────────────────────────────
// `stato` è il lifecycle_status: DOVE il locale è arrivato. Non dice cosa
// Byup ha deciso su di lui — quello è il provvedimento (admProvvedimento, in
// fondo al file) — e nel fascicolo i due campi si leggono separati.
//   pending     iscritto non avviato: ha un'utenza, nessun passo fatto
//   onboarding  nel percorso rapido, fermo a un passo (stoppedAt) e, se è
//               «Il tuo locale», a un sotto-passo (stoppedSub)
//   skipped     opera avendo saltato la configurazione completa: percorso
//               rapido finito, «Salta e continua dopo» dalla Panoramica, e non
//               è più tornato. Annotazione per il registro: fino al 2026-09-03
//               «skipped» voleva dire aver saltato l'intero onboarding, cosa
//               che il gestionale non permette — si salta solo la
//               configurazione completa, e i mock avevano locali che
//               ordinavano senza menù né pagamenti
//   active      onboarding completo, ordini negli ultimi 30 giorni
//   inactive    onboarding completo, nessun ordine da oltre 30 giorni;
//               l'abbonamento è acceso. Regola di P-46: le chiusure
//               straordinarie (venue_closures) non contano come inattività —
//               un locale chiuso per ferie non è un locale fermo
//   churned     ha disdetto (art. 5): fine del rapporto per scelta sua
const LOC_CICLO_VITA = {
  pending:    { label: 'Iscritto non avviato', color: 'INFO' },
  onboarding: { label: 'In onboarding',        color: 'WARN' },
  skipped:    { label: 'Onboarding saltato',   color: 'TEAL' },
  active:     { label: 'Attivo',               color: 'OK' },
  inactive:   { label: 'Inattivo',             color: 'PLAN_FREE' },
  churned:    { label: 'Disdetto',             color: 'DANGER' },
};

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
    // Le estrazioni di `r` prima del volume sono le STESSE di prima, per
    // numero (una per chi è fermo, due per attivi e inattivi): così piano e
    // volume di ogni locale restano dove stavano. Il resto dei passi si tira
    // da un secondo generatore.
    const r2 = pseudoRand(1000 + i);
    // I passi della configurazione completa da un solo numero: i tre bit
    // bassi, e almeno uno acceso.
    const cfgDaSeme = (x) => {
      const bits = Math.floor(x * 1000);
      const fatti = ONB_CONFIG.filter((s, k) => (bits >> k) & 1).map(s => s.id);
      return fatti.length ? fatti : [ONB_CONFIG[0].id];
    };
    const rapido = ONB_RAPIDO.map(s => s.id);
    let stato, stoppedAt = null, stoppedSub = null, completedSteps = [];
    if (i < 5) {
      stato = 'pending';
    } else if (i < 13) {
      // fermo a uno dei quattro passi del percorso rapido; se è «Il tuo
      // locale», anche a quale sotto-passo
      stato = 'onboarding';
      const stopIdx = Math.floor(r() * ONB_RAPIDO.length); // 0..3
      stoppedAt = ONB_RAPIDO[stopIdx].id;
      stoppedSub = stoppedAt === 'locale' ? ONB_SOTTO[Math.floor(r2() * ONB_SOTTO.length)].id : null;
      completedSteps = rapido.slice(0, stopIdx);
    } else if (i < 17) {
      // percorso rapido finito, configurazione completa saltata per intero;
      // lo staff c'è di rado — chi salta la configurazione salta il Personale
      stato = 'skipped';
      completedSteps = [...rapido, ...(r2() > 0.7 ? ['staff'] : [])];
    } else if (i < 42) {
      stato = 'active';
      // staff quasi sempre, e ALMENO un passo della configurazione completa:
      // senza, sarebbe uno skipped
      const conStaff = r() > 0.2, cfg = r();
      completedSteps = [...rapido, ...(conStaff ? ['staff'] : []), ...cfgDaSeme(cfg)];
    } else if (i < 48) {
      stato = 'inactive';
      const conStaff = r() > 0.4, cfg = r();
      completedSteps = [...rapido, ...(conStaff ? ['staff'] : []), ...cfgDaSeme(cfg)];
    } else {
      // ha lavorato, poi ha disdetto: la configurazione l'aveva fatta
      stato = 'churned';
      completedSteps = [...rapido, 'staff', ...onbConfigFatti(r2)];
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
    // Il primo passo non è istantaneo: anche «Carica menù» dista qualche
    // minuto dall'iscrizione, come ogni passo dal precedente.
    let t = dataIscrizione.getTime() + (Math.floor(r2() * 30) + 5) * 60000;
    [...ONB_STEPS, ...ONB_CONFIG].forEach(s => {
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
      stoppedSub,
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
//   in onboarding   iscritto ma con la configurazione non finita: non avviato
//                   (pending), fermo a un passo del percorso rapido, o con la
//                   configurazione completa saltata (skipped — opera, ma la
//                   pagina che ha saltato fa ancora parte dell'onboarding)
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
// L'accesso si descrive per AREA, non per funzione: ogni voce della console è
// una riga, e la cella di un ruolo su un'area vale nessuno / lettura /
// scrittura. Tredici aree, dodici assegnabili più Piattaforma riservata.
// Annotazione per il registro: P-42 diceva «tredici aree con Elenchi» quando
// le righe della matrice erano undici (contava le voci del menu con i quattro
// canali di Marketing, o anticipava le due righe di D-33); P-54 diceva undici,
// vero fino a P-41: con moderazione e conformità sono tredici.
// Il booleano di prima aveva prodotto ruoli-diritto (Viewer, cioè
// «sola lettura» travestito da ruolo) e aree spaccate in due (Ticket separato
// dalla pubblicazione delle guide) solo per dire «legge ma non scrive»: la
// distinzione ora la dice la cella, con la stessa grammatica a tre stati dei
// consensi.
const AREE = [
  // Analisi Dati non ha una scrittura: sono dati che la piattaforma raccoglie
  // da sola, e una cella «Scrittura» qui sarebbe una promessa senza oggetto.
  { id: 'analisi',    label: 'Analisi Dati',        desc: 'Le sette letture: locali, valore, utenti, mercato', soloLettura: true },
  { id: 'contatti',   label: 'Contatti',            desc: 'La rubrica e le schede: locali, staff, utenti app' },
  // P-41 (D-33): le Restrizioni non si abilitano più con l'anagrafica. Chi
  // consulta la rubrica non deve poter sospendere un account: il registro si
  // apre dalla rubrica ma chiede questo permesso — lettura per guardarlo,
  // scrittura per applicare o rimuovere una restrizione. Annotazione per il
  // registro: l'«Oggi» di P-41 descriveva la matrice (la descrizione
  // dell'area diceva «restrizioni»), non un'applicazione ai gesti, che il
  // prototipo non aveva mai avuto: hubPuo nasce qui.
  { id: 'moderazione', label: 'Moderazione',        desc: 'Restrizioni agli utenti app: shadowban e ban, con motivi e revoche' },
  { id: 'elenchi',    label: 'Elenchi',             desc: 'Segmenti attivi e liste statiche' },
  { id: 'proprieta',  label: 'Proprietà',           desc: 'Il catalogo dei campi del contatto, di sistema e personalizzati' },
  { id: 'marketing',  label: 'Marketing',           desc: 'Mail, SMS, push e form: materiali, invii e statistiche' },
  { id: 'workflow',   label: 'Workflow',            desc: 'Le automazioni. Attivarne una richiede Scrittura sulle aree che tocca' },
  { id: 'agent',      label: 'Agent',               desc: 'La squadra degli agenti e l\'Ambiente in cui lavorano' },
  { id: 'assistenza', label: 'Assistenza',          desc: 'Ticket, chiamate, FAQ e guide. Scrittura = rispondere e pubblicare' },
  // P-41 (D-33): le certificazioni alimentari si approvano e si rifiutano dal
  // ticket, ma il permesso è questo, non quello dei ticket.
  { id: 'conformita', label: 'Conformità',          desc: 'Certificazioni alimentari dei locali: approvare e rifiutare' },
  { id: 'domini',     label: 'Domini e mittenti',   desc: 'Domini di invio, indirizzi, numeri SMS' },
  { id: 'sicurezza',  label: 'Sicurezza e sistemi', desc: 'Membri del team, accessi, audit log e diagnostica' },
  // Piattaforma è RISERVATA: leve commerciali (prezzi, piani, soglie) del solo
  // Super Admin. Non è una cella su «Nessuno»: non compare proprio — né nella
  // matrice dei preset né quando si regolano i permessi di un account.
  { id: 'piattaforma', label: 'Piattaforma',        desc: 'Piani e prezzi, peso ordini, discovery', riservata: true },
];

// Come si veste una cella, ovunque la si mostri.
const LIVELLI = {
  nessuno:   { label: 'Nessuno',   color: 'PLAN_FREE' },
  lettura:   { label: 'Lettura',   color: 'INFO' },
  scrittura: { label: 'Scrittura', color: 'OK' },
};

// I preset. Un ruolo È una riga di livelli per area; alla creazione di un
// account si parte da un preset e si può regolare ogni cella (il risultato è
// un account «Personalizzato», con i livelli suoi). Il Super Admin governa la
// piattaforma e GUARDA il lavoro operativo senza toccarlo: è voluto — le
// scritture operative appartengono ai mestieri. Le azioni pesanti
// (sospensioni, rimborsi, broadcast) non hanno righe separate: sono Scrittura
// sull'area, col motivo obbligatorio dove la console già lo chiede.
const RUOLI = {
  super_admin: { label: 'Super Admin', desc: 'Governa piattaforma e sistemi; il lavoro operativo lo guarda, non lo tocca', color: 'DANGER',
    livelli: { analisi: 'lettura', contatti: 'lettura', moderazione: 'lettura', elenchi: 'lettura', proprieta: 'scrittura', marketing: 'lettura', workflow: 'lettura', agent: 'scrittura', assistenza: 'lettura', conformita: 'lettura', domini: 'scrittura', sicurezza: 'scrittura', piattaforma: 'scrittura' } },
  support:     { label: 'Support',    desc: 'Contatti, assistenza e le liste e automazioni del suo lavoro', color: 'INFO',
    livelli: { analisi: 'lettura', contatti: 'scrittura', moderazione: 'scrittura', elenchi: 'scrittura', proprieta: 'lettura', marketing: 'nessuno', workflow: 'scrittura', agent: 'scrittura', assistenza: 'scrittura', conformita: 'scrittura', domini: 'nessuno', sicurezza: 'nessuno' } },
  marketing:   { label: 'Marketing',  desc: 'Campagne, elenchi, proprietà e domini di invio; i contatti li consulta', color: 'WARN',
    livelli: { analisi: 'lettura', contatti: 'lettura', moderazione: 'nessuno', elenchi: 'scrittura', proprieta: 'scrittura', marketing: 'scrittura', workflow: 'scrittura', agent: 'lettura', assistenza: 'lettura', conformita: 'nessuno', domini: 'scrittura', sicurezza: 'nessuno' } },
  // Non un preset: il vestito degli account regolati cella per cella. I
  // livelli veri stanno sul membro (permessiCustom), non qui.
  custom:      { label: 'Personalizzato', desc: 'Parte da un preset, regolato area per area', color: 'PURPLE', personalizzato: true },
};

// I livelli veri di un membro: preset o personalizzato che sia. Tutto ciò che
// legge un permesso passa da qui — una fonte per ogni fatto. I ruoli storici
// (ICT, Viewer) e il peso dei livelli sono morti con il riesame (P-56, D-44):
// li nominavano solo le attestazioni chiuse.
const admLivelliDi = (ruolo, membro) => {
  if (ruolo === 'custom') return (membro && membro.permessiCustom) || {};
  const r = RUOLI[ruolo];
  return (r && r.livelli) || {};
};
const admLabelRuolo = (ruolo) => (RUOLI[ruolo] && RUOLI[ruolo].label) || ruolo;

// ─── hubPuo: il permesso di chi è collegato (P-41 · D-33) ────────────────────
// Una funzione sola, che i punti d'uso chiedono prima di un gesto: le
// Restrizioni e i ban chiedono scrittura su Moderazione, approvare o
// rifiutare una certificazione chiede scrittura su Conformità. Le funzioni
// restano dove si aprono; cambia chi può usarle. Chi è collegato è il membro
// con isYou; `?ruolo=support|marketing|super_admin` impersona un preset per
// la demo, così lo stato negato si vede senza cambiare account.
const hubUtenteCorrente = () => {
  const me = TEAM.find(t => t.isYou) || {};
  let demo = null;
  try { demo = new URLSearchParams(window.location.search).get('ruolo'); } catch (e) {}
  if (demo && RUOLI[demo] && !RUOLI[demo].personalizzato) return { ...me, ruolo: demo, demo: true };
  return me;
};
const hubPuo = (area, livello) => {
  const me = hubUtenteCorrente();
  const l = admLivelliDi(me.ruolo, me)[area] || 'nessuno';
  return livello === 'scrittura' ? l === 'scrittura' : (l === 'scrittura' || l === 'lettura');
};
window.hubUtenteCorrente = hubUtenteCorrente;
window.hubPuo = hubPuo;

const TEAM = [
  // nomeCompleto: "Tu" va bene nella lista del team, ma un'attestazione firmata
  // "Tu" non è evidenza — all'auditor serve il nome della persona.
  { id: 'admin0', nome: 'Tu', nomeCompleto: 'Marco Rinaldi', email: 'me@byup.it', ruolo: 'super_admin', avatar: 'TU', avatarBg: 'linear-gradient(135deg, #FF1F5A, #9E0B3C)', lastActive: new Date(Date.now() - 60000), addedBy: '—', due_fa: true, attivo: true, addedOn: new Date('2024-01-15'), isYou: true },
  // Laura è l'account PERSONALIZZATO del mock: era Viewer, e con la morte di
  // quel ruolo i suoi permessi sono diventati celle regolate a mano — partita
  // dal preset Support, le è rimasta la scrittura sulla sola Assistenza. Il
  // pannello deve DIMOSTRARE la personalizzazione, non raccontarla.
  { id: 'admin1', nome: 'Laura Bianchi', email: 'l.bianchi@byup.it', ruolo: 'custom',
    permessiCustom: { analisi: 'lettura', contatti: 'lettura', moderazione: 'nessuno', elenchi: 'lettura', proprieta: 'nessuno', marketing: 'nessuno', workflow: 'lettura', agent: 'lettura', assistenza: 'scrittura', conformita: 'nessuno', domini: 'nessuno', sicurezza: 'nessuno' },
    avatar: 'LB', avatarBg: '#5B34D6', lastActive: new Date(Date.now() - 1200000), addedBy: 'Tu', due_fa: true, attivo: true, addedOn: new Date('2024-03-22') },
  { id: 'admin2', nome: 'Davide Romano', email: 'd.romano@byup.it', ruolo: 'support', avatar: 'DR', avatarBg: '#2563EB', lastActive: new Date(Date.now() - 86400000), addedBy: 'Tu', due_fa: true, attivo: true, addedOn: new Date('2024-05-10') },
  { id: 'support1', nome: 'Sara Conti', email: 's.conti@byup.it', ruolo: 'support', avatar: 'SC', avatarBg: '#16A34A', lastActive: new Date(Date.now() - 180000), addedBy: 'Laura Bianchi', due_fa: true, attivo: true, addedOn: new Date('2024-07-04') },
  { id: 'support2', nome: 'Andrea Verdi', email: 'a.verdi@byup.it', ruolo: 'support', avatar: 'AV', avatarBg: '#D97706', lastActive: new Date(Date.now() - 7200000), addedBy: 'Laura Bianchi', due_fa: true, attivo: true, addedOn: new Date('2024-09-12') },
  { id: 'mkt1', nome: 'Paola Esposito', email: 'p.esposito@byup.it', ruolo: 'marketing', avatar: 'PE', avatarBg: '#D97706', lastActive: new Date(Date.now() - 3600000 * 5), addedBy: 'Tu', due_fa: true, attivo: true, addedOn: new Date('2024-11-20') },
  { id: 'mkt2', nome: 'Marco Galli', email: 'm.galli@byup.it', ruolo: 'marketing', avatar: 'MG', avatarBg: '#B45309', lastActive: new Date(Date.now() - 86400000 * 7), addedBy: 'Tu', due_fa: true, attivo: true, addedOn: new Date('2025-02-03') },
  // Due persone che non entrano da mesi: la scheda Accessi le mostra come
  // sono, e il riesame su foglio (D-44) le pesca dall'ultimo accesso.
  { id: 'mkt3', nome: 'Elena Ricci', email: 'e.ricci@byup.it', ruolo: 'marketing', avatar: 'ER', avatarBg: '#0891B2', lastActive: new Date(Date.now() - 86400000 * 142), addedBy: 'Paola Esposito', due_fa: true, attivo: true, addedOn: new Date('2025-06-10') },
  { id: 'support3', nome: 'Nicola Ferrara', email: 'n.ferrara@byup.it', ruolo: 'support', avatar: 'NF', avatarBg: '#4F46E5', lastActive: new Date(Date.now() - 86400000 * 3), addedBy: 'Sara Conti', due_fa: true, attivo: true, addedOn: new Date('2026-07-08') },
];

// ─── Inviti non ancora accettati ────────────────────────────────────────────
// Chi non ha accettato NON è nel team: non ha una password, non ha una sessione,
// non ha ancora accesso a niente. Stava in TEAM con `pending: true` e finiva
// nell'elenco degli accessi come «Mai acceduto», dove non c'entra — quella
// scheda mostra chi ha accesso, non chi potrebbe averlo. Vive qui, e qui
// il numero che conta è da quanto l'invito è fermo: un invito vecchio con
// permessi già assegnati è una porta socchiusa che nessuno sta guardando.
const INVITI_PENDENTI = [
  { nome:'Sara Greco',       email:'sara.greco@byup.it', ruolo:'support',
    inviato:new Date(Date.now() - 86400000 * 2),  scade:new Date(Date.now() + 86400000 * 5) },
  { nome:'Davide Conti',     email:'davide.c@byup.it',   ruolo:'support',
    inviato:new Date(Date.now() - 86400000 * 4),  scade:new Date(Date.now() + 86400000 * 3) },
  // Invitata il 20 giu e mai accettato: alla scadenza l'invito si è annullato da
  // solo, quindi non compare più fra quelli in attesa. Resta nei dati perché il
  // filtro che lo esclude è la regola, e va vista funzionare.
  { nome:'Chiara Fumagalli', email:'c.fumagalli@byup.it', ruolo:'support',
    inviato:new Date('2026-06-20'),               scade:new Date('2026-06-27') },
];

// Il riesame periodico dei diritti di accesso (ISO/IEC 27001 A.5.18) non vive
// più qui: si svolge fuori dal prodotto, su foglio di calcolo (D-44, P-56).
// Dentro il prodotto si concedono e si revocano accessi, e nient'altro; le
// campagne mock (RIESAME_CORRENTE, RIESAMI_CHIUSI) sono morte con esso.
// Il rito è descritto in Riesame-Accessi.md.

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

// Le città si contano dal registro, non a mano: scritte qui a parte, questa
// classifica contraddiceva quella della mappa (AnMappa) che le conta da
// LOCALI, due card della stessa tab con numeri diversi. Esclusi i churned,
// come fa la mappa: chi ha disdetto non è più «dove siamo». Gli ordini sono
// MENSILI, la stessa unità delle card che li mostrano.
const TOP_CITTA = (() => {
  const per = {};
  LOCALI.filter(l => l.stato !== 'churned').forEach(l => {
    const c = per[l.citta] || (per[l.citta] = { citta: l.citta, locali: 0, ordini: 0, mrr: 0 });
    c.locali += 1;
    c.ordini += l.ordiniMese || 0;
    c.mrr += l.mrr || 0;
  });
  return Object.values(per)
    .sort((a, b) => b.locali - a.locali || b.ordini - a.ordini)
    .slice(0, 6);
})();

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

// ═══════════════════════════════════════════════════════════════════════════
// CONTRATTI · il fascicolo contrattuale dei contatti
// ═══════════════════════════════════════════════════════════════════════════
//
// Non un archivio di PDF: l'evidenza che si esibisce in un contenzioso o a un
// auditor P2B — che cosa il contatto aveva accettato, in quale versione, e se
// il preavviso dovuto è stato dato nei termini.
//
// ⚠ RICOSTRUZIONI: i documenti reali sono TC-01 v0.24 (pubblicata il
// 03/09/2026, la versione corrente: è quella che l'onboarding proietta e fa
// firmare, contratto-tc01.jsx), DPA-01 v0.9 e INF-02 v0.5 del 04/08/2026;
// la TC-01 v0.23 del 20/08/2026 e la v0.22 restano come storia. Tutte le versioni PRECEDENTI
// (v0.20/v0.21, v0.8, v0.4), le loro date e le righe «cosa è cambiato» sono
// invenzioni di comodo del mock: servono a far esistere lo storico, non
// documentano nulla di reale.

// Le date di pubblicazione sono fatti di calendario, non offset da oggi: qui
// niente ri-ancoraggio. Mese 1-based per leggerle come si scrivono.
const ctrData = (g, m, y, h, min) => new Date(y, m - 1, g, h || 10, min || 0);

const DOCUMENTI = [
  // L'ordine di prevalenza è dell'art. 1 TC-01 — (1) Piano, (2) TC, (3) DPA —
  // ed è un numero esplicito, non l'ordine dell'array: è una regola
  // contrattuale, non una coincidenza di scrittura. Le informative non sono
  // nell'elenco dell'art. 1: si RICEVONO, non si accettano (flag
  // `informativa`), e vanno rese in una sezione a parte, senza finestre.
  { codice:'PIANO',  nome:'Condizioni particolari di attivazione', destinatario:'locale', prevalenza:1, particolare:true },
  { codice:'TC-01',  nome:'Termini e Condizioni di servizio',      destinatario:'locale', prevalenza:2, versioni:[
    { v:'0.20', pubblicata:ctrData(6,10,2025),  efficace:ctrData(5,11,2025), peggiorativa:false,
      cambiamento:'Prima versione a catalogo (ricostruzione).' },
    // La peggiorativa sta QUI, nel passato, e non sulla corrente: se fosse la
    // v0.22, ogni locale non ancora allineato avrebbe una finestra di recesso
    // aperta e il banner urlerebbe su mezza rubrica.
    { v:'0.21', pubblicata:ctrData(9,2,2026),   efficace:ctrData(11,3,2026), peggiorativa:true,
      cambiamento:'Ridotti i massimali di responsabilità; finestra di contestazione degli addebiti da 60 a 30 giorni.' },
    { v:'0.22', pubblicata:ctrData(4,8,2026),   efficace:ctrData(3,9,2026),  peggiorativa:false,
      cambiamento:'Recepito il canale Ticket dell\'assistenza; chiarito il calcolo delle transazioni pesate. Nessuna modifica economica.' },
    // La corrente (P-83): pubblicata prima di oggi ed efficace dopo, così le
    // accettazioni del mock cadono dopo la pubblicazione e mai nel futuro.
    { v:'0.23', pubblicata:ctrData(20,8,2026),  efficace:ctrData(19,9,2026), peggiorativa:false,
      cambiamento:'Riparto dei ruoli privacy fra Byup e locale (titolare autonomo per i clienti della Byup App, responsabile secondo DPA-01 per il resto); trasparenza P2B; obblighi informativi fiscali; divieto di maggiorazioni per strumento di pagamento; cambio di fornitore; prezzo riscritto su comande pesate e coefficienti del piano. Nessuna modifica economica.' },
    // La corrente: l'art. 12 dice il mandato a trasmettere e ricevere tramite
    // il canale, chi trasmette i corrispettivi secondo la forma (credenziali
    // dell'esercente o incaricato di Byup), l'accreditamento con la delega.
    { v:'0.24', pubblicata:ctrData(3,9,2026),   efficace:ctrData(3,10,2026), peggiorativa:false,
      cambiamento:'Art. 12: mandato a trasmettere corrispettivi e fatture e a ricevere le fatture passive tramite il fornitore del canale; per le società i corrispettivi con l\'incaricato indicato da Byup, rinnovo a cura di Byup; accreditamento come esercente in forza della delega. Nessuna modifica economica.' },
  ]},
  { codice:'DPA-01', nome:'Accordo sul trattamento dati (art. 28)', destinatario:'locale', prevalenza:3, versioni:[
    { v:'0.8', pubblicata:ctrData(19,1,2026), efficace:ctrData(18,2,2026), peggiorativa:false,
      cambiamento:'Prima versione a catalogo (ricostruzione).' },
    { v:'0.9', pubblicata:ctrData(4,8,2026),  efficace:ctrData(3,9,2026),  peggiorativa:false,
      cambiamento:'Aggiornato l\'elenco dei sub-responsabili e i termini di notifica delle violazioni.' },
  ]},
  // Per un'informativa l'efficacia coincide con la pubblicazione: non c'è
  // preavviso da attendere né recesso da esercitare.
  { codice:'INF-02', nome:'Informativa privacy business', destinatario:'locale', prevalenza:4, informativa:true, versioni:[
    { v:'0.4', pubblicata:ctrData(2,3,2026), efficace:ctrData(2,3,2026), peggiorativa:false,
      cambiamento:'Prima versione a catalogo (ricostruzione).' },
    { v:'0.5', pubblicata:ctrData(4,8,2026), efficace:ctrData(4,8,2026), peggiorativa:false,
      cambiamento:'Aggiornata la sezione sui tempi di conservazione.' },
  ]},
  // Staff e utenti app: catalogati ORA perché il componente riceva l'elenco
  // giusto per tipo, popolati quando le loro tab arriveranno. Versione unica
  // corrente: lo storico di questi non è ancora stato ricostruito.
  { codice:'TOS-02', nome:'Termini di servizio utente staff', destinatario:'staff',  prevalenza:1, versioni:[
    { v:'0.7', pubblicata:ctrData(4,8,2026), efficace:ctrData(3,9,2026), peggiorativa:false, cambiamento:'Versione corrente.' } ]},
  { codice:'TOS-01', nome:'Termini di servizio utente app',   destinatario:'utente', prevalenza:1, versioni:[
    { v:'1.1', pubblicata:ctrData(4,8,2026), efficace:ctrData(3,9,2026), peggiorativa:false, cambiamento:'Versione corrente.' } ]},
  { codice:'INF-01', nome:'Informativa privacy consumer', destinatario:'utente', prevalenza:2, informativa:true, versioni:[
    { v:'0.6', pubblicata:ctrData(4,8,2026), efficace:ctrData(4,8,2026), peggiorativa:false, cambiamento:'Versione corrente.' } ]},
];

// Il set pertinente per tipo di contatto. Lo staff ha un contratto DIRETTO
// con Byup, indipendente dal locale che lo associa; l'utente app aggiunge i
// consensi facoltativi, che però vivono già nelle proprietà del CRM.
const CONTRATTI_PER_TIPO = {
  locale: ['PIANO', 'TC-01', 'DPA-01', 'INF-02'],
  staff:  ['TOS-02', 'INF-02'],
  utente: ['TOS-01', 'INF-01'],
};

// I casi limite vivono su id FISSI, non sul caso del seme: devono esserci a
// ogni ricarica e potersi nominare in una demo. Gli id sono agganciati al
// build deterministico di LOCALI di oggi (L1017-23 attivi, L1044-46
// inattivi): se la distribuzione degli stati cambia, questi vanno rivisti.
const CTR_CASI = {
  fermoSenzaPreavviso:  'L1021', // fermo a v0.21 e MAI notificato della v0.22: il buco è nostro
  tacitaSuPeggiorativa: 'L1023', // mai cliccato la v0.21 peggiorativa: solo uso successivo (art. 15)
  scadutoSenzaRisposta: 'L1046', // preavviso v0.21 scaduto; dall'11/03 solo token dispositivo (KDS),
                                 // e un token non è una persona: niente tacita
  sospesoMorosita:      'L1045', // diffida 12/08, sospeso 27/08 (art. 4): la risoluzione è avanti
  sospensioneRevocata:  'L1044', // rischio sicurezza, immediata (art. 13) e poi revocata
  risoltoMorosita:      'L1049', // diffida, sospensione e RISOLUZIONE di Byup (art. 4): il cessato
  limitatoContenuti:    'L1030', // una funzione tolta con motivo (art. 13), il resto prosegue
  subOpposto:           'L1022', // opposizione documentata a un sub-responsabile (art. 5 DPA)
  subRecesso:           'L1017', // recesso LIMITATO ai servizi interessati, non churn
  listinoOltreFoi:      'L1020', // aumento sopra l'indice FOI, accettato: il recesso c'era e non è stato usato
};

const { ACCETTAZIONI, PREAVVISI, SOSPENSIONI } = (() => {
  const acc = [], pre = [], sosp = [];
  const seme = (id) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h; };
  const ip = (s) => '93.' + (40 + s % 20) + '.' + ((s >> 3) % 200) + '.' + (10 + ((s >> 7) % 240));
  // L'orario si FISSA (9-18), non si somma: un'accettazione alle 03:08 non
  // si è mai vista e in un'evidenza si noterebbe.
  const ORA = (d, s) => { const x = new Date(d); x.setHours(9 + s % 10, s % 60, 0, 0); return x; };
  // Chi agisce «in nome e per conto dell'Esercente dichiarando di averne i
  // poteri» (art. 3): quasi sempre il titolare; ogni tanto un responsabile
  // delegato, perché il campo `ruolo` deve dimostrare di esistere.
  const RESP = ['Davide Neri', 'Martina Villa', 'Stefano Gatti'];
  const persona = (l, s) => (s % 7 === 0)
    ? { nome: RESP[s % RESP.length], ruolo: 'Responsabile delegato' }
    : { nome: l.titolare, ruolo: 'Titolare' };

  const tc  = DOCUMENTI.find(d => d.codice === 'TC-01').versioni;
  const dpa = DOCUMENTI.find(d => d.codice === 'DPA-01').versioni;
  const inf = DOCUMENTI.find(d => d.codice === 'INF-02').versioni;

  LOCALI.forEach(l => {
    // Un pending non ha firmato niente: il suo fascicolo è legittimamente vuoto.
    if (l.stato === 'pending') return;
    const s = seme(l.id);
    const p = persona(l, s);
    const firma = (codice, v, quando, superficie, tipo) => acc.push({
      soggettoId: l.id, codice, v, tipo: tipo || 'esplicita', quando,
      nome: p.nome, ruolo: p.ruolo, email: l.email, ip: ip(s), superficie,
    });

    // All'attivazione si firma il pacchetto intero: Piano, TC e DPA nella
    // versione allora corrente, informativa in presa visione. Per gli iscritti
    // PRIMA del catalogo, la prima firma a registro è la versione più vecchia
    // ricostruita, alla sua efficacia.
    const dopo = (vv) => l.dataIscrizione.getTime() >= vv.pubblicata.getTime();
    const tcFirma  = [...tc].reverse().find(dopo)  || null;
    const dpaFirma = [...dpa].reverse().find(dopo) || null;
    const infFirma = [...inf].reverse().find(dopo) || null;
    const tIscr = ORA(l.dataIscrizione, s);
    firma('PIANO', l.piano, tIscr, 'onboarding');
    firma('TC-01',  (tcFirma  || tc[0]).v,  tcFirma  ? tIscr : ORA(tc[0].efficace, s),  tcFirma  ? 'onboarding' : 'gestionale');
    firma('DPA-01', (dpaFirma || dpa[0]).v, dpaFirma ? tIscr : ORA(dpa[0].efficace, s), dpaFirma ? 'onboarding' : 'gestionale');
    firma('INF-02', (infFirma || inf[0]).v, infFirma ? tIscr : ORA(inf[0].efficace, s), infFirma ? 'onboarding' : 'gestionale', 'presa-visione');

    // Ogni versione successiva alla firma apre un preavviso di 30 giorni
    // (art. 15). L'esito «scaduto senza risposta» NON si scrive: si deriva
    // dall'orologio, così la schermata non mente mai rispetto a oggi. Un
    // churned riceve i preavvisi partiti PRIMA della cessazione — mentre era
    // vivo il contratto correva anche per lui.
    const transizione = (codice, vv, chain) => {
      const cessato = l.stato === 'churned' ? new Date(l.lastLogin.getTime() + 30 * 86400000) : null;
      if (cessato && vv.pubblicata.getTime() > cessato.getTime()) return;
      const base = chain === 'tc' ? (tcFirma || tc[0]) : (dpaFirma || dpa[0]);
      if (vv.v <= base.v) return;                      // versione di firma (o precedente): nessuna transizione
      if (codice === 'TC-01' && vv.v === '0.22' && l.id === CTR_CASI.fermoSenzaPreavviso) return; // il buco di notifica
      const daAccettare = !(
        (vv.v === '0.21' && (l.id === CTR_CASI.tacitaSuPeggiorativa || l.id === CTR_CASI.scadutoSenzaRisposta)) ||
        // Finestra ancora aperta: ha già cliccato solo un attivo su cinque.
        // Un inattivo non clicca niente — non entra proprio.
        (vv.efficace.getTime() > Date.now() && (s % 5 !== 0 || l.stato !== 'active'))
      );
      pre.push({
        soggettoId: l.id, tipo: 'termini', codice, v: vv.v, sub: null,
        inviato: vv.pubblicata, efficace: vv.efficace,
        esito: daAccettare ? 'accettato' : 'in-corso', nota: null,
      });
      if (daAccettare) {
        // Il click arriva qualche giorno dopo la comunicazione — mai nel
        // futuro: un'evidenza datata domani non è un'evidenza.
        const t = Math.min(vv.pubblicata.getTime() + (2 + s % 18) * 86400000, Date.now() - 86400000);
        acc.push({ soggettoId: l.id, codice, v: vv.v, tipo: 'esplicita', quando: ORA(new Date(t), s),
          nome: p.nome, ruolo: p.ruolo, email: l.email, ip: ip(s), superficie: 'gestionale' });
      }
    };
    tc.forEach(vv => transizione('TC-01', vv, 'tc'));
    dpa.forEach(vv => transizione('DPA-01', vv, 'dpa'));
    // L'informativa nuova non apre finestre: chi rientra dopo la
    // pubblicazione la prende in visione al primo accesso.
    if (infFirma && infFirma.v < inf[inf.length - 1].v && l.stato === 'active' && s % 3 !== 0) {
      firma('INF-02', inf[inf.length - 1].v, ORA(ctrData(5 + s % 9, 8, 2026), s), 'gestionale', 'presa-visione');
    }
  });

  // La tacita dell'art. 15 non ha una persona — è ESATTAMENTE ciò che la
  // rende più debole: manca la dichiarazione di poteri dell'art. 3. Restano
  // come evidenza il primo uso autenticato successivo all'efficacia, la
  // superficie e l'IP di quell'uso.
  acc.push({ soggettoId: CTR_CASI.tacitaSuPeggiorativa, codice: 'TC-01', v: '0.21',
    tipo: 'tacita', quando: ctrData(14, 3, 2026, 11, 12),
    nome: null, ruolo: null, email: null, ip: '93.51.114.86', superficie: 'gestionale' });

  // Preavvisi fuori serie: sub-responsabili (art. 5 DPA) e listino (art. 4).
  pre.push(
    { soggettoId: CTR_CASI.subOpposto, tipo: 'sub-responsabile', codice: 'DPA-01', v: null,
      sub: 'CDN media assets — nuovo sub-responsabile hosting', inviato: ctrData(15, 6, 2026), efficace: ctrData(15, 7, 2026),
      esito: 'opposto', nota: 'Opposizione documentata: il locale richiede hosting in territorio UE con certificazione ISO 27001, il fornitore proposto non la esibisce.' },
    { soggettoId: CTR_CASI.subRecesso, tipo: 'sub-responsabile', codice: 'DPA-01', v: null,
      sub: 'CDN media assets — nuovo sub-responsabile hosting', inviato: ctrData(15, 6, 2026), efficace: ctrData(15, 7, 2026),
      esito: 'recesso', nota: 'Nessuna alternativa disponibile: recesso limitato al modulo media (art. 5 DPA), il resto del servizio prosegue.' },
    { soggettoId: CTR_CASI.listinoOltreFoi, tipo: 'listino', codice: 'PIANO', v: null, sub: null,
      inviato: ctrData(10, 6, 2026), efficace: ctrData(10, 7, 2026), oltreFoi: true,
      esito: 'accettato', nota: null },
  );

  // Sospensioni: la morosità segue la cadenza dell'art. 4 (diffida → 15gg →
  // sospensione → 15gg → risoluzione); gli altri motivi dell'art. 13 sono
  // «con effetto immediato e dandone comunicazione» — niente diffida.
  // È il registro dei PROVVEDIMENTI (admProvvedimento, sotto): ogni riga è
  // una decisione di Byup con le sue date — diffida, limitata, sospesa,
  // risolta — e la revoca la chiude. La diffida da sola non è un
  // provvedimento: è il preavviso dell'art. 4, e il campo resta «Nessuno».
  sosp.push(
    { soggettoId: CTR_CASI.sospesoMorosita, motivo: 'morosita',
      nota: 'Tre canoni consecutivi insoluti dopo il fallimento dei riaddebiti automatici.',
      diffida: ctrData(12, 8, 2026), sospesa: ctrData(27, 8, 2026), decisaDa: 'Giulia Romano', revoca: null },
    { soggettoId: CTR_CASI.risoltoMorosita, motivo: 'morosita',
      nota: 'Nessun pagamento nei quindici giorni di sospensione: contratto risolto (art. 4). Restano le finestre del DPA.',
      diffida: ctrData(2, 6, 2026), sospesa: ctrData(17, 6, 2026), risolta: ctrData(2, 7, 2026), decisaDa: 'Giulia Romano', revoca: null },
    { soggettoId: CTR_CASI.limitatoContenuti, motivo: 'uso-illecito',
      nota: 'Foto dei piatti e descrizioni copiate dalla vetrina di un altro locale: la vetrina esce dalla scoperta finché non le sostituisce. Ordini, cassa e prenotazioni continuano.',
      ambito: 'Vetrina nella scoperta dell\'app',
      diffida: null, limitata: ctrData(25, 8, 2026), sospesa: null, decisaDa: 'Marco Rinaldi', revoca: null },
    { soggettoId: CTR_CASI.sospensioneRevocata, motivo: 'rischio-sicurezza',
      nota: 'Credenziali del titolare comparse in un data breach di terzi: accesso congelato in via cautelativa.',
      diffida: null, sospesa: ctrData(10, 5, 2026), decisaDa: 'Marco Rinaldi',
      revoca: { quando: ctrData(18, 5, 2026), who: 'Marco Rinaldi', nota: 'Password ruotata e 2FA attivata: rischio rientrato.' } },
  );

  return { ACCETTAZIONI: acc, PREAVVISI: pre, SOSPENSIONI: sosp };
})();

// ─── Provvedimento di Byup (P-44 · D-34) ────────────────────────────────────
// platform_status: COSA BYUP HA DECISO sul locale, separato dal ciclo di vita
// (dove il locale è arrivato, LOC_CICLO_VITA). Si calcola dal registro delle
// decisioni, non si salva: quattro valori del modello.
//   none      nessuna decisione viva. Anche con una diffida in corso: la
//             diffida è una riga di registro, il preavviso dell'art. 4, non
//             un provvedimento — la sospensione scatta dopo, se scatta
//   limitato  una funzione tolta con motivo (art. 13), il resto prosegue
//   sospeso   servizio sospeso (art. 4 per morosità, art. 13 gli altri)
//   cessato   contratto RISOLTO da Byup, quindici giorni dopo la sospensione
//             (art. 4). La disdetta del locale (art. 5) NON sta qui: è il
//             ciclo di vita «churned», e il provvedimento resta none
// Una revoca chiude la riga e si torna a none. Fra più righe vive vince la
// più grave.
const ADM_PROVVEDIMENTI = {
  none:     { label: 'Nessuno',  color: 'OK' },
  limitato: { label: 'Limitato', color: 'WARN' },
  sospeso:  { label: 'Sospeso',  color: 'DANGER' },
  cessato:  { label: 'Cessato',  color: 'INK' },
};
function admProvvedimentoRiga(l) {
  const vive = SOSPENSIONI.filter(x => x.soggettoId === l.id && !x.revoca);
  return vive.find(x => x.risolta) || vive.find(x => x.sospesa) || vive.find(x => x.limitata) || vive[0] || null;
}
function admProvvedimento(l) {
  const r = admProvvedimentoRiga(l);
  if (!r) return 'none';
  if (r.risolta) return 'cessato';
  if (r.sospesa) return 'sospeso';
  if (r.limitata) return 'limitato';
  return 'none';
}

// La cessazione: se Byup ha risolto, è la data della risoluzione; altrimenti
// la disdetta del locale, che parte quando smette di usare il servizio ma ha
// effetto al rinnovo, 30 giorni dopo (art. 5). Da qui partono i due contatori
// del DPA (art. 11): esportazione 60 giorni, backup estinti in 35.
function ctrCessazione(l) {
  const r = admProvvedimentoRiga(l);
  if (r && r.risolta) return r.risolta;
  return l.stato === 'churned' ? new Date(l.lastLogin.getTime() + 30 * 86400000) : null;
}

// ─── Le leve di Piattaforma che il codice legge (P-69 · D-58) ───────────────
// Le leve di PlatformConfig vivevano nello stato del componente, illeggibili
// da fuori. Qui sta la copia che gli altri punti leggono, e Piattaforma la
// scrive al salvataggio. Il precedente è QUOTA_SALA in PAR, che però è codice
// senza interfaccia. Il tetto è per accredito, in unità (comande).
const HUB_LEVE = { accreditoTetto: 500 };

// ─── Accrediti di unità (P-69 · D-58) ───────────────────────────────────────
// L'unità è la comanda, il singolo invio (D-12): si accreditano unità, non
// «ordini extra». Ogni accredito è una riga con causale da elenco chiuso e
// nota sul caso singolo; sotto il tetto l'operatore conferma e la riga nasce
// confermata, sopra resta in attesa e la approva un Super Admin DIVERSO da
// chi l'ha disposta — il quattr'occhi lo fa il codice sul membro collegato
// (admAccreditoPuoApprovare), non la disciplina. Il rifiuto ha un motivo.
// Ogni atto va in audit col tipo Fatturazione.
const ACC_CAUSALI = [
  { value: 'disservizio', label: 'Disservizio della piattaforma', nota: 'Incidente riconosciuto: le unità perse o doppie durante il guasto' },
  { value: 'conteggio',   label: 'Errore di conteggio',            nota: 'Unità contate due volte o sul canale sbagliato' },
  { value: 'commerciale', label: 'Concessione commerciale',        nota: 'Accordo preso dal commerciale di zona' },
  { value: 'onboarding',  label: 'Avvio assistito',                nota: 'Prova estesa concordata in onboarding' },
  { value: 'reclamo',     label: 'Definizione di un reclamo',      nota: 'Chiude un reclamo del locale con un accredito' },
];
const accCausaleLabel = (v) => (ACC_CAUSALI.find(c => c.value === v) || { label: v }).label;
const ACC_STATI = {
  confermato: { label: 'Confermato',               color: 'OK' },
  in_attesa:  { label: 'In attesa del Super Admin', color: 'WARN' },
  approvato:  { label: 'Approvato',                color: 'OK' },
  rifiutato:  { label: 'Rifiutato',                color: 'DANGER' },
};
// Due semi in attesa, apposta: uno disposto da Sara Conti, che Marco (chi è
// collegato) può approvare; uno disposto da Marco stesso, che Marco NON può
// approvare — è la dimostrazione del quattr'occhi. Il terzo, sotto il tetto,
// è nato confermato.
const ACCREDITI = [
  { id: 'AC-0031', localeId: 'L1030', unita: 800, causale: 'disservizio', nota: 'Stampa comande ferma per 40 minuti il 28/08: le comande reinviate a mano sono state contate due volte.',
    dispostoDa: 'support1', dispostoIl: ctrData(29, 8, 2026, 11, 20), stato: 'in_attesa', approvatoDa: null, approvatoIl: null, motivoRifiuto: null },
  { id: 'AC-0032', localeId: 'L1018', unita: 650, causale: 'commerciale', nota: 'Accordo con il titolare per il passaggio a Business: primo mese con 650 unità in più.',
    dispostoDa: 'admin0', dispostoIl: ctrData(1, 9, 2026, 16, 5), stato: 'in_attesa', approvatoDa: null, approvatoIl: null, motivoRifiuto: null },
  { id: 'AC-0030', localeId: 'L1030', unita: 120, causale: 'conteggio', nota: 'Dodici comande dell\'app conteggiate col peso della cassa il 20/08.',
    dispostoDa: 'support2', dispostoIl: ctrData(21, 8, 2026, 9, 40), stato: 'confermato', approvatoDa: null, approvatoIl: null, motivoRifiuto: null },
];
const admNomeMembro = (id) => { const m = (typeof TEAM !== 'undefined' ? TEAM : []).find(t => t.id === id); return m ? (m.nomeCompleto || m.nome) : id; };
// Il quattr'occhi: Super Admin, e non chi ha disposto. Ritorna il motivo del
// no, così il pulsante spiega invece di sparire.
function admAccreditoPuoApprovare(a) {
  const me = hubUtenteCorrente();
  if (a.stato !== 'in_attesa') return { ok: false, perche: 'Già deciso' };
  if (me.ruolo !== 'super_admin') return { ok: false, perche: 'Approva solo un Super Admin' };
  if (me.id === a.dispostoDa) return { ok: false, perche: 'L\'hai disposto tu: approva un altro Super Admin' };
  return { ok: true, perche: null };
}
function admAccreditoDecidi(a, esito, motivo) {
  const me = hubUtenteCorrente();
  const l = LOCALI.find(x => x.id === a.localeId) || { nome: a.localeId };
  a.stato = esito; a.approvatoDa = me.id; a.approvatoIl = new Date(); a.motivoRifiuto = esito === 'rifiutato' ? (motivo || null) : null;
  AUDIT_EVENTS.unshift({ who: me.nomeCompleto || me.nome, action: esito === 'approvato' ? 'ha approvato l\'accredito di' : 'ha rifiutato l\'accredito di',
    target: `${a.unita} unità · ${l.nome} · ${accCausaleLabel(a.causale)}${esito === 'rifiutato' && motivo ? ' · ' + motivo : ''}`,
    icon: esito === 'approvato' ? 'check' : 'x', color: esito === 'approvato' ? 'OK' : 'DANGER', tipo: 'fatturazione', when: new Date() });
}
let accProgressivo = 33;
function admAccreditoDisponi(l, unita, causale, nota) {
  const me = hubUtenteCorrente();
  const sopra = unita > HUB_LEVE.accreditoTetto;
  const a = { id: 'AC-' + String(accProgressivo++).padStart(4, '0'), localeId: l.id, unita, causale, nota,
    dispostoDa: me.id, dispostoIl: new Date(), stato: sopra ? 'in_attesa' : 'confermato', approvatoDa: null, approvatoIl: null, motivoRifiuto: null };
  ACCREDITI.unshift(a);
  AUDIT_EVENTS.unshift({ who: me.nomeCompleto || me.nome, action: sopra ? 'ha disposto un accredito in attesa per' : 'ha accreditato',
    target: `${unita} unità · ${l.nome} · ${accCausaleLabel(causale)}`, icon: 'plus', color: sopra ? 'WARN' : 'OK', tipo: 'fatturazione', when: new Date() });
  return a;
}

// ─── Vetrina speciale (P-63 · D-51) ─────────────────────────────────────────
// È una sola, è nostra, e gli atti si registrano: una riga per atto, con il
// motivo da elenco, la scadenza quando c'è e — sul merito — la fotografia dei
// numeri che l'hanno motivata, congelata sull'atto perché il merito di allora
// resti leggibile quando i numeri saranno cambiati. La revoca non cancella:
// chiude la riga (`chiusa`), come le connessioni API e i provvedimenti. La
// scadenza chiude da sola: vetAttiva la esclude, lo storico la dice «scaduta».
const VET_MOTIVI = [
  { value: 'merito',        label: 'Merito',        nota: 'Numeri sopra la media: la fotografia li congela sull\'atto' },
  { value: 'lancio',        label: 'Lancio',        nota: 'Locale appena aperto o appena entrato' },
  { value: 'partnership',   label: 'Partnership',   nota: 'Accordo commerciale con il locale' },
  { value: 'compensazione', label: 'Compensazione', nota: 'Ristoro dopo un disservizio' },
];
const vetMotivoLabel = (v) => (VET_MOTIVI.find(m => m.value === v) || { label: v }).label;
// I tre numeri del merito: ordini al mese, adozione QR, prenotazioni al mese.
// Niente media recensioni: Hubble non ha un voto per locale (il voto vive
// solo nell'app, seminato lì) — contraddizione registrata.
const vetFotografia = (l) => ({ ordiniMese: l.ordiniMese, qrAdoption: l.qrAdoption, prenotazioniMese: l.prenotazioniMese });
const VETRINE = (() => {
  const merito = LOCALI.find(l => l.id === 'L1018');
  return [
    { id: 'VT-0007', localeId: 'L1018', dal: ctrData(10, 8, 2026, 10, 0), al: ctrData(10, 11, 2026, 10, 0), motivo: 'merito',
      nota: 'Tornato dopo il win-back con i numeri migliori della sua città.', decisaDa: 'Marco Rinaldi',
      // I numeri di allora, non quelli di oggi: la fotografia si scatta sull'atto.
      fotografia: merito ? { ordiniMese: Math.round(merito.ordiniMese * 0.91), qrAdoption: merito.qrAdoption, prenotazioniMese: Math.round(merito.prenotazioniMese * 0.88) } : null,
      chiusa: null },
    { id: 'VT-0004', localeId: 'L1025', dal: ctrData(3, 3, 2026, 9, 0), al: null, motivo: 'lancio',
      nota: 'Apertura della seconda sala: quindici giorni in evidenza concordati col titolare.', decisaDa: 'Paola Esposito',
      fotografia: null,
      chiusa: { quando: ctrData(19, 3, 2026, 9, 0), who: 'Paola Esposito', nota: 'Periodo di lancio concluso come concordato.' } },
  ];
})();
let vetProgressivo = 8;
const vetAttiva = (l) => VETRINE.find(v => v.localeId === l.id && !v.chiusa && (!v.al || v.al.getTime() > Date.now())) || null;
const vetStorico = (l) => VETRINE.filter(v => v.localeId === l.id).slice().sort((a, b) => b.dal - a.dal);

// ─── Decisioni di moderazione (P-71 · L4-01) ────────────────────────────────
// Anche il «no» è una decisione: removed, warning e no_action, tutte con
// motivo da elenco chiuso più nota, e l'esito si comunica al segnalante (art.
// 16 par. 5 DSA) — una segnalazione respinta è una decisione dovuta a chi ha
// segnalato, non l'assenza di una decisione. Nel prototipo la comunicazione
// si rappresenta (destinatario, momento, anteprima), non si finge di inviarla.
const MOD_MOTIVI = [
  { value: 'insulti',        label: 'Insulti o linguaggio d\'odio' },
  { value: 'dati_terzi',     label: 'Dati personali di terzi' },
  { value: 'non_pertinente', label: 'Contenuto non pertinente al locale' },
  { value: 'conflitto',      label: 'Promozione o conflitto commerciale' },
  { value: 'nessuna',        label: 'Nessuna violazione delle linee guida' },
];
const modMotivoLabel = (v) => (MOD_MOTIVI.find(m => m.value === v) || { label: v }).label;
const MOD_ESITI = {
  removed:   { label: 'Recensione rimossa' },
  warning:   { label: 'Autore avvisato, recensione mantenuta' },
  no_action: { label: 'Recensione mantenuta' },
};
const MOD_DECISIONI = [];

window.HUB_LEVE = HUB_LEVE;
window.ACC_CAUSALI = ACC_CAUSALI;
window.ACC_STATI = ACC_STATI;
window.ACCREDITI = ACCREDITI;
window.accCausaleLabel = accCausaleLabel;
window.admNomeMembro = admNomeMembro;
window.admAccreditoPuoApprovare = admAccreditoPuoApprovare;
window.admAccreditoDecidi = admAccreditoDecidi;
window.admAccreditoDisponi = admAccreditoDisponi;
window.VET_MOTIVI = VET_MOTIVI;
window.VETRINE = VETRINE;
window.vetMotivoLabel = vetMotivoLabel;
window.vetFotografia = vetFotografia;
window.vetAttiva = vetAttiva;
window.vetStorico = vetStorico;
window.MOD_MOTIVI = MOD_MOTIVI;
window.MOD_ESITI = MOD_ESITI;
window.MOD_DECISIONI = MOD_DECISIONI;
window.modMotivoLabel = modMotivoLabel;
window.ONB_STEPS = ONB_STEPS;
window.ONB_RAPIDO = ONB_RAPIDO;
window.ONB_SOTTO = ONB_SOTTO;
window.ONB_CONFIG = ONB_CONFIG;
window.onbSottoLabel = onbSottoLabel;
window.LOC_CICLO_VITA = LOC_CICLO_VITA;
window.ADM_PROVVEDIMENTI = ADM_PROVVEDIMENTI;
window.admProvvedimento = admProvvedimento;
window.admProvvedimentoRiga = admProvvedimentoRiga;
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
window.SEGNALAZIONI = SEGNALAZIONI;
window.CERTIFICAZIONI = CERTIFICAZIONI;
window.CERT_TIPI = CERT_TIPI;
window.TEAM = TEAM;
window.INVITI_PENDENTI = INVITI_PENDENTI;
window.RUOLI = RUOLI;
window.AREE = AREE;
window.LIVELLI = LIVELLI;
window.admLivelliDi = admLivelliDi;
window.admLabelRuolo = admLabelRuolo;
window.TOP_PIATTI = TOP_PIATTI;
window.TOP_CITTA = TOP_CITTA;
window.SCREENS_USAGE = SCREENS_USAGE;
window.MONTHLY_REVENUE = MONTHLY_REVENUE;
window.AFFIDABILITA = AFFIDABILITA;
window.RETE = RETE;
window.RITENZIONE = RITENZIONE;
window.ESPANSIONE = ESPANSIONE;
window.TOTAL_REVENUE_HISTORICAL = TOTAL_REVENUE_HISTORICAL;
window.DOCUMENTI = DOCUMENTI;
window.CONTRATTI_PER_TIPO = CONTRATTI_PER_TIPO;
window.CTR_CASI = CTR_CASI;
window.ACCETTAZIONI = ACCETTAZIONI;
window.PREAVVISI = PREAVVISI;
window.SOSPENSIONI = SOSPENSIONI;
window.ctrCessazione = ctrCessazione;
