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
const ACC_PIANI = [
  {
    id: 'free', nome: 'Free', prezzo: 0, periodo: 'gratis',
    ordiniInclusi: 550,
    ordineExtra: 0.45,
    menu: '1 menu digitale',
    staff: '1 membro dello staff',
    supporto: 'Chat bot · Tutorial · Ticket email',
    feat: [
      '550 ordini inclusi/mese',
      '+0,45 € + IVA per ordine extra',
      '1 menu digitale',
      '1 membro dello staff',
      'Supporto: chat bot, tutorial, ticket email',
    ],
  },
  {
    id: 'starter', nome: 'Starter', prezzo: 46.99, periodo: '/mese + IVA', current: true,
    ordiniInclusi: 1850,
    ordineExtra: 0.34,
    menu: '3 menu digitali',
    staff: 'Fino a 3 membri dello staff',
    supporto: 'Chat bot · Tutorial · Ticket email',
    feat: [
      '1.850 ordini inclusi/mese',
      '+0,34 € + IVA per ordine extra',
      'Fino a 3 menu digitali',
      'Fino a 3 membri dello staff',
      'Supporto: chat bot, tutorial, ticket email',
    ],
  },
  {
    id: 'plus', nome: 'Plus', prezzo: 134.99, periodo: '/mese + IVA',
    ordiniInclusi: 7500,
    ordineExtra: 0.23,
    menu: 'Menu illimitati',
    staff: 'Staff illimitato',
    supporto: 'Tutto Starter + supporto telefonico 24/7 · richiamata entro 30 min',
    highlight: true,
    feat: [
      '7.500 ordini inclusi/mese',
      '+0,23 € + IVA per ordine extra',
      'Menu digitali illimitati',
      'Membri dello staff illimitati',
      'Supporto telefonico 24/7 con richiamata entro 30 min',
    ],
  },
  {
    id: 'business', nome: 'Business', prezzo: 250, periodo: '/mese + IVA',
    ordiniInclusi: 15000,
    ordineExtra: 0.12,
    menu: 'Menu illimitati',
    staff: 'Staff illimitato',
    supporto: 'Tutto Plus + canale prioritario',
    feat: [
      '15.000 ordini inclusi/mese',
      '+0,12 € + IVA per ordine extra',
      'Menu digitali illimitati',
      'Membri dello staff illimitati',
      'Supporto telefonico 24/7 con richiamata entro 30 min · canale prioritario',
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

window.ACC_DATI = ACC_DATI;
window.ACC_PIANI = ACC_PIANI;
window.ACC_PACCHETTI = ACC_PACCHETTI;
window.ACC_FATTURE = ACC_FATTURE;
window.ACC_SESSIONI = ACC_SESSIONI;
