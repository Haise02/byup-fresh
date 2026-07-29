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

    const pianoIdx = Math.floor(r() * 4);
    const piano = (stato === 'pending') ? 'free' : PIANI[pianoIdx].id;
    const extras = stato === 'active' && r() > 0.5 ? Math.floor(r() * 60) + 10 : 0;
    const ordiniGiorno = stato === 'active' ? Math.floor(r() * 25) + 5 :
                        stato === 'skipped' ? Math.floor(r() * 15) :
                        stato === 'inactive' ? Math.floor(r() * 3) : 0;
    const prenotazioniGiorno = stato === 'active' ? Math.floor(r() * 40) + 5 :
                              stato === 'skipped' ? Math.floor(r() * 10) : 0;

    const baseDate = new Date(2025, 8, 1); // 1 sett 2025
    const iscrizioneOffset = Math.floor(r() * 220);
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
    const ordini = Math.floor(r() * 80);
    const prenotazioni = Math.floor(r() * 30);
    const localiPref = Math.floor(r() * 12);
    const regOffset = Math.floor(r() * 365);
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
      spesaTotale: ordini * (20 + Math.floor(r() * 30)),
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
  { id: 'dashboard',      label: 'Dashboard',              desc: 'Accesso alla dashboard principale' },
  { id: 'locali',         label: 'Gestione Locali e staff', desc: 'Visualizza e modifica locali e camerieri' },
  { id: 'utenti',         label: 'Gestione utenti',        desc: 'Visualizza e modifica gli utenti app' },
  { id: 'segnalazioni',   label: 'Segnalazioni',           desc: 'Gestisce ticket e segnalazioni' },
  { id: 'certificazioni', label: 'Certificazioni',         desc: 'Revisiona le certificazioni alimentari' },
  { id: 'messaggi',       label: 'Messaggi & Broadcast',   desc: 'Invia comunicazioni agli utenti' },
  // Economix e Conformita mancavano dalla matrice pur essendo due sezioni intere
  // dell'applicazione: finche non c'erano, «7 aree su 7» voleva dire accesso a
  // tutto mentre due sezioni restavano fuori dal conteggio.
  { id: 'economix',       label: 'Economix',               desc: 'Costi, conto economico, cassa e stato patrimoniale' },
  { id: 'conformita',     label: 'Conformità',             desc: 'Adempimenti, rischi, fornitori, incidenti e audit' },
  { id: 'sicurezza',      label: 'Sicurezza e sistemi',    desc: 'Membri del team, riesame degli accessi, audit log e diagnostica' },
  { id: 'hr',             label: 'Risorse Umane',          desc: 'Registro della formazione del personale' },
  { id: 'team',           label: 'Impostazioni piattaforma', desc: 'Configurazione tecnica e parametri della piattaforma' },
];

const RUOLI = {
  super_admin: { label: 'Super Admin', desc: 'Accesso totale, può gestire il team', color: 'DANGER',    permessi: ['dashboard','locali','utenti','segnalazioni','certificazioni','messaggi','economix','conformita','sicurezza','hr','team'] },
  support:     { label: 'Support',    desc: 'Segnalazioni e certificazioni', color: 'INFO',            permessi: ['dashboard','locali','utenti','segnalazioni','certificazioni'] },
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
  hr:          { label: 'HR',         desc: 'Risorse umane e formazione del personale', color: 'AMBER',  permessi: ['dashboard','hr'] },
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
  // uscitaIl: la registra HR in Risorse Umane, la legge ICT nell'elenco accessi.
  // E' l'unico dato che attraversa il confine fra le due sezioni.
  { id: 'mkt2', nome: 'Marco Galli', email: 'm.galli@byup.it', ruolo: 'marketing', avatar: 'MG', avatarBg: '#B45309', lastActive: new Date(Date.now() - 86400000 * 7), addedBy: 'Tu', due_fa: true, attivo: true, addedOn: new Date('2025-02-03'), uscitaIl: new Date(Date.now() + 86400000 * 12) },
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
const RIESAME_CADENZA_MESI = 3;

// Campagna in corso: aperta il 1 lug, scade il 31. Gli esiti si accumulano qui
// mentre il revisore lavora; la campagna si chiude solo quando sono tutti decisi.
const RIESAME_CORRENTE = {
  id: 'RA-2026-Q3',
  periodo: 'Q3 2026',
  apertaIl: new Date('2026-07-01T09:00:00'),
  scadenza: new Date('2026-07-31T23:59:59'),
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
const FEATURES_USAGE = [
  { nome: 'Apertura tavolo',                  modulo: 'Sala',           usi: 38420, pct: 96, trend: +4 },
  { nome: 'Aggiunta articolo all\'ordine',     modulo: 'Sala / Cucina',  usi: 124800, pct: 95, trend: +7 },
  { nome: 'Saldo conto al tavolo',            modulo: 'Sala',           usi: 31250, pct: 92, trend: +5 },
  { nome: 'Stampa scontrino',                 modulo: 'Cassa',          usi: 28910, pct: 89, trend: +2 },
  { nome: 'Modifica menu (piatto)',           modulo: 'Impostazioni',   usi: 9420,  pct: 71, trend: +12 },
  { nome: 'Conferma prenotazione',            modulo: 'Sala',           usi: 8870,  pct: 68, trend: +9 },
  { nome: 'Spostamento tavolo / unione',      modulo: 'Sala',           usi: 6210,  pct: 52, trend: +3 },
  { nome: 'Importazione menu da PDF',         modulo: 'Onboarding',     usi: 412,   pct: 48, trend: +24 },
  { nome: 'Export IVA mensile',               modulo: 'Contabilità',    usi: 2840,  pct: 38, trend: +6 },
  { nome: 'Invito staff (link)',              modulo: 'Personale',      usi: 1180,  pct: 31, trend: +8 },
  { nome: 'Apertura ticket supporto',         modulo: 'Supporto',       usi: 612,   pct: 22, trend: -3 },
  { nome: 'Pubblica menu su vetrina',         modulo: 'Vetrina',        usi: 348,   pct: 18, trend: +15 },
];

// Revenue mensile (ultimi 13 mesi) — separato subscription vs extras
// Order: dec 2024 → dec 2025
const MONTHLY_REVENUE = [
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

// Totale storico (somma di tutti i mesi dall'inizio piattaforma)
const TOTAL_REVENUE_HISTORICAL = {
  sub: 38420,    // somma cumulata abbonamenti da gen 2024
  extra: 6480,   // somma cumulata extras
  meseAvvio: 'Gen 2024',
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
window.TOTAL_REVENUE_HISTORICAL = TOTAL_REVENUE_HISTORICAL;
window.RIESAME_CADENZA_MESI = RIESAME_CADENZA_MESI;
window.RIESAME_CORRENTE = RIESAME_CORRENTE;
window.RIESAMI_CHIUSI = RIESAMI_CHIUSI;
