// Account — data

const ACC_DATI = {
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario.rossi@email.com',
  telefono: '+39 333 1234567',
  ruolo: 'Owner',
  ristorante: 'Cantina Pizzeria',
  partitaIva: 'IT12345678901',
  codiceFiscale: 'RSSMRA80A01H501Z',
  indirizzoFatt: 'Via Roma 12, 00100 Roma',
  pec: 'cantinapizzeria@pec.it',
  sdi: 'XXXXXXX',
};

// Piani byup ufficiali — 4 livelli con ordini inclusi, costo extra, supporto, menu, dispositivi
// Nota struttura: `feat` contiene SOLO le voci mostrate come lista puntata
// nelle card — ordini inclusi e costo extra vivono già nel chip dedicato.
// `menuShort`/`staffShort` + i flag `sup*` alimentano la tabella di confronto
// (fonte unica: niente valori duplicati hardcoded nella tabella).
const ACC_PIANI = [
  {
    id: 'free', nome: 'Gratuito', prezzo: 0, prezzoMensile: 0, periodo: 'gratis',
    ordiniInclusi: 550,
    ordineExtra: 0.45,
    menu: '1 menu digitale',
    staff: '1 membro dello staff',
    supporto: 'Chat, tutorial, ticket email',
    menuShort: '1', staffShort: '1',
    supPhone: false, supCallback: false, supPriority: false,
    feat: [
      '1 menu digitale',
      '1 membro dello staff',
      'Supporto: chat, tutorial, ticket email',
    ],
  },
  {
    id: 'starter', nome: 'Starter', prezzo: 46.99, prezzoMensile: 54.99, periodo: '/mese + IVA', current: true,
    ordiniInclusi: 1850,
    ordineExtra: 0.34,
    menu: '3 menu digitali',
    staff: 'Fino a 3 membri dello staff',
    supporto: 'Chat, tutorial, ticket email',
    menuShort: 'Fino a 3', staffShort: 'Fino a 3',
    supPhone: false, supCallback: false, supPriority: false,
    feat: [
      'Fino a 3 menu digitali',
      'Fino a 3 membri dello staff',
      'Supporto: chat, tutorial, ticket email',
    ],
  },
  {
    id: 'plus', nome: 'Plus', prezzo: 134.99, prezzoMensile: 155.99, periodo: '/mese + IVA',
    ordiniInclusi: 7500,
    ordineExtra: 0.23,
    menu: 'Menu illimitati',
    staff: 'Staff illimitato',
    supporto: 'Tutto Starter + telefono Lun–Ven 12–16 e 18–22 · richiamata entro 2 ore',
    highlight: true,
    menuShort: 'Illimitati', staffShort: 'Illimitati',
    // Orario e tempo di richiamata sono la differenza vera fra Plus e
    // Business: nella tabella di confronto vanno scritti, non spuntati.
    supPhone: true, supCallback: true, supPriority: false,
    supOrariShort: 'Lun–Ven 12–16 / 18–22', supSlaShort: 'entro 2 ore',
    feat: [
      'Menu digitali illimitati',
      'Membri dello staff illimitati',
      'Supporto telefonico Lun–Ven (12–16, 18–22) · richiamata entro 2 ore',
    ],
  },
  {
    id: 'business', nome: 'Business', prezzo: 250, prezzoMensile: 290, periodo: '/mese + IVA',
    ordiniInclusi: 15000,
    ordineExtra: 0.12,
    menu: 'Menu illimitati',
    staff: 'Staff illimitato',
    supporto: 'Telefono H24, 7 giorni su 7 · richiamata entro 1 ora · canale prioritario',
    menuShort: 'Illimitati', staffShort: 'Illimitati',
    supPhone: true, supCallback: true, supPriority: true,
    supOrariShort: 'H24 · 7 su 7', supSlaShort: 'entro 1 ora',
    feat: [
      'Menu digitali illimitati',
      'Membri dello staff illimitati',
      'Supporto telefonico H24/7 · richiamata entro 1 ora · canale prioritario',
    ],
  },
];

// Pacchetti di transazioni acquistabili — quantità/prezzi a definire al lancio
const ACC_PACCHETTI = [
  { id:'pack-s', nome:'Pacchetto S', ordini: 500,  prezzo: 39,  etichetta:'Una tantum' },
  { id:'pack-m', nome:'Pacchetto M', ordini: 2000, prezzo: 119, etichetta:'Una tantum · più scelto' },
  { id:'pack-l', nome:'Pacchetto L', ordini: 5000, prezzo: 249, etichetta:'Una tantum · miglior valore' },
];

const ACC_FATTURE = [
  { num: 'INV-2025-0012', data: '01 Dic 2025', importo: 46.99, stato: 'Pagata' },
  { num: 'INV-2025-0011', data: '01 Nov 2025', importo: 46.99, stato: 'Pagata' },
  { num: 'INV-2025-0010', data: '01 Ott 2025', importo: 46.99, stato: 'Pagata' },
  { num: 'INV-2025-0009', data: '01 Set 2025', importo: 46.99, stato: 'Pagata' },
  { num: 'INV-2025-0008', data: '01 Ago 2025', importo: 46.99, stato: 'Pagata' },
  { num: 'INV-2025-0007', data: '01 Lug 2025', importo: 46.99, stato: 'Pagata' },
];

const ACC_SESSIONI = [
  { device: 'MacBook Pro · Chrome', loc: 'Roma, IT', when: 'Ora', current: true },
  { device: 'iPhone 15 · Safari', loc: 'Roma, IT', when: '2h fa' },
  { device: 'iPad · Safari', loc: 'Milano, IT', when: '3 giorni fa' },
];

// ─── Referral fra locali ───────────────────────────────────────────────────
// Ogni ristorante portato vale due mesi gratis a testa: al locale che invita e
// a quello che arriva.
// Delle tre misure che si potrebbero contare — aperture del link, iscritti,
// abbonamenti attivati — al ristoratore ne serve una sola: quante volte il
// premio è scattato davvero. Le altre due sono metriche di campagna, e le
// guarda byup dal suo pannello.
const ACC_REFERRAL = {
  mesiPerLato: 2,
  attivi: 1,                 // ristoranti arrivati che hanno attivato un piano
  pianoAttivato: 'Starter',  // quale piano ha attivato l'ultimo arrivato
};

// Il codice sta sul LOCALE e non sulla persona: se domani cambia il titolare,
// i mesi guadagnati restano al locale che li ha portati. Le due cifre finali
// non sono un anno — sono una firma ricavata dal nome, così due «Da Mario» in
// due città diverse non si ritrovano con lo stesso codice.
function accCodiceInvito(nome) {
  const pulito = (nome || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().replace(/[^A-Z0-9]/g, '')
    .slice(0, 12);
  const base = pulito || 'BYUP';
  let firma = 7;
  for (let i = 0; i < base.length; i++) firma = (firma * 31 + base.charCodeAt(i)) % 100;
  return base + String(firma).padStart(2, '0');
}

window.ACC_DATI = ACC_DATI;
window.ACC_PIANI = ACC_PIANI;
window.ACC_PACCHETTI = ACC_PACCHETTI;
window.ACC_FATTURE = ACC_FATTURE;
window.ACC_SESSIONI = ACC_SESSIONI;
window.ACC_REFERRAL = ACC_REFERRAL;
window.accCodiceInvito = accCodiceInvito;
