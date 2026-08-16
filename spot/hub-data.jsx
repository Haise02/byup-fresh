// Hubble — il vocabolario del CRM: proprietà, operatori, elenchi, materiali
// di marketing, automazioni e agenti.
//
// Questo file non disegna niente. Dice DI CHE COSA si parla: quali proprietà
// ha un contatto, che domande si possono fare su ciascuna, e come si risponde.
// Contatti, Elenchi, Workflow e il pubblico delle campagne interrogano tutti
// lo stesso motore: un filtro scritto in un posto vale identico in un altro,
// ed è questo a rendere un elenco «attivo» qualcosa di più di una lista.

// ═══════════════════════════════════════════════════════════════════════════
// 1 · GLI OPERATORI, per tipo di proprietà
// ═══════════════════════════════════════════════════════════════════════════
//
// `arg` dice CHE COSA chiedere a chi filtra:
//   'nessuno'  la domanda è completa così com'è (è noto, non è noto)
//   'testo'    un campo di testo libero
//   'numero'   un numero
//   'data'     una data
//   'giorni'   un numero di giorni (negli ultimi N)
//   'scelta'   una voce dell'elenco della proprietà
//   'scelte'   più voci insieme
//   'intervallo' due valori (compreso tra)

const HUB_OPERATORI = {
  testo: [
    { id: 'noto',      label: 'è noto',            arg: 'nessuno' },
    { id: 'nonNoto',   label: 'non è noto',        arg: 'nessuno' },
    { id: 'contiene',  label: 'contiene',          arg: 'testo' },
    { id: 'nonCont',   label: 'non contiene',      arg: 'testo' },
    { id: 'uguale',    label: 'è uguale a',        arg: 'testo' },
    { id: 'diverso',   label: 'è diverso da',      arg: 'testo' },
    { id: 'inizia',    label: 'inizia per',        arg: 'testo' },
    { id: 'finisce',   label: 'finisce per',       arg: 'testo' },
  ],
  elenco: [
    { id: 'unoDi',     label: 'è uno di',          arg: 'scelte' },
    { id: 'nessunoDi', label: 'non è nessuno di',  arg: 'scelte' },
    { id: 'noto',      label: 'è noto',            arg: 'nessuno' },
    { id: 'nonNoto',   label: 'non è noto',        arg: 'nessuno' },
  ],
  multi: [
    { id: 'contieneUno',   label: 'contiene almeno uno di', arg: 'scelte' },
    { id: 'contieneTutti', label: 'contiene tutti',         arg: 'scelte' },
    { id: 'nonCont',       label: 'non contiene',           arg: 'scelte' },
    { id: 'noto',          label: 'è noto',                 arg: 'nessuno' },
    { id: 'nonNoto',       label: 'non è noto',             arg: 'nessuno' },
  ],
  data: [
    { id: 'dopo',      label: 'successiva a',      arg: 'data' },
    { id: 'prima',     label: 'precedente a',      arg: 'data' },
    { id: 'ilGiorno',  label: 'è il giorno',       arg: 'data' },
    { id: 'ultimiGg',  label: 'negli ultimi',      arg: 'giorni' },
    { id: 'traDate',   label: 'compresa tra',      arg: 'intervallo' },
    { id: 'noto',      label: 'è nota',            arg: 'nessuno' },
    { id: 'nonNoto',   label: 'non è nota',        arg: 'nessuno' },
  ],
  numero: [
    { id: 'uguale',    label: 'è uguale a',        arg: 'numero' },
    { id: 'maggiore',  label: 'è maggiore di',     arg: 'numero' },
    { id: 'minore',    label: 'è minore di',       arg: 'numero' },
    { id: 'traNum',    label: 'è compreso tra',    arg: 'intervallo' },
    { id: 'noto',      label: 'è noto',            arg: 'nessuno' },
    { id: 'nonNoto',   label: 'non è noto',        arg: 'nessuno' },
  ],
  bool: [
    { id: 'vero',      label: 'è sì',              arg: 'nessuno' },
    { id: 'falso',     label: 'è no',              arg: 'nessuno' },
    { id: 'noto',      label: 'è noto',            arg: 'nessuno' },
    { id: 'nonNoto',   label: 'non è noto',        arg: 'nessuno' },
  ],
};
HUB_OPERATORI.valuta = HUB_OPERATORI.numero;

// L'etichetta breve che finisce sulla pastiglia del filtro applicato.
function hubDescriviFiltro(f) {
  const p = HUB_PROP[f.prop];
  if (!p) return '';
  const op = (HUB_OPERATORI[p.tipo] || []).find(o => o.id === f.op);
  if (!op) return p.label;
  const v = f.valore;
  const fmtV = () => {
    // Un valore non ancora scritto è «…», non «—»: il filtro è in
    // composizione, non vuoto. Il trattino direbbe che il valore è nullo.
    if (v == null || v === '') return '…';
    if (op.arg === 'data')  return fmtDate(v);
    if (op.arg === 'giorni') return `${v || 0} giorni`;
    if (op.arg === 'scelte') {
      const l = (Array.isArray(v) ? v : []).map(x => hubEtichettaOpzione(p, x));
      return l.length <= 2 ? l.join(' o ') : `${l.length} voci`;
    }
    if (op.arg === 'intervallo') {
      const [a, b] = Array.isArray(v) ? v : [null, null];
      const g = (x) => p.tipo === 'data' ? fmtDate(x) : x;
      return `${g(a) || '…'} e ${g(b) || '…'}`;
    }
    return String(v == null ? '' : v);
  };
  return op.arg === 'nessuno' ? `${p.label} ${op.label}` : `${p.label} ${op.label} ${fmtV()}`;
}

function hubEtichettaOpzione(prop, valore) {
  const o = (prop.opzioni || []).find(x => (x.value !== undefined ? x.value : x) === valore);
  if (!o) return String(valore);
  return o.label !== undefined ? o.label : String(o);
}

// ═══════════════════════════════════════════════════════════════════════════
// 2 · IL CATALOGO DELLE PROPRIETÀ
// ═══════════════════════════════════════════════════════════════════════════
//
// Raggruppate come le si cerca, non come stanno nel database. `sistema: true`
// vuol dire che byup la scrive e nessuno la cancella; le altre le crea il team
// da Impostazioni → Proprietà, e sono quelle che si riempiono da sole con le
// submission dei form e con i workflow (ID campagna, Referral, …).

const HUB_GRUPPI_PROP = [
  { id: 'contatto',    label: 'Informazioni contatto' },
  { id: 'commerciale', label: 'Commerciale' },
  { id: 'geografia',   label: 'Geografia' },
  { id: 'acquisizione',label: 'Acquisizione' },
  { id: 'marketing',   label: 'Marketing' },
  { id: 'attivita',    label: 'Attività' },
];

const HUB_PROPRIETA = [
  // — Informazioni contatto —
  { id: 'nome',     label: 'Nome',                gruppo: 'contatto', tipo: 'testo',  sistema: true, colonna: { w: 'minmax(0,2.2fr)', fissa: true, label: 'Contatto' } },
  { id: 'email',    label: 'Email',               gruppo: 'contatto', tipo: 'testo',  sistema: true, colonna: { w: 'minmax(0,1.9fr)' } },
  { id: 'telefono', label: 'Telefono',            gruppo: 'contatto', tipo: 'testo',  sistema: true, colonna: { w: '1.15fr' } },
  { id: 'tipo',     label: 'Tipologia contatto',  gruppo: 'contatto', tipo: 'elenco', sistema: true, colonna: { w: '1.2fr' },
    opzioni: [{ value: 'locale', label: 'Locale' }, { value: 'staff', label: 'Utente Staff' }, { value: 'utente', label: 'Utente App' }] },
  { id: 'ciclo',    label: 'Ciclo di vita',       gruppo: 'contatto', tipo: 'elenco', sistema: true, colonna: { w: '1.15fr' },
    opzioni: [{ value: 'lead', label: 'Lead' }, { value: 'onboarding', label: 'In onboarding' }, { value: 'returning', label: 'Returning' }, { value: 'annullato', label: 'Piano annullato' }, { value: 'eliminato', label: 'Eliminato' }] },
  // Un utente bannato non deve essere invisibile in rubrica: la restrizione
  // attiva (dal registro di Utenti app) è una proprietà come le altre — la
  // si mette in colonna e ci si filtra sopra.
  { id: 'restrizione', label: 'Restrizione',      gruppo: 'contatto', tipo: 'elenco', sistema: true, colonna: { w: '1.05fr' },
    opzioni: [{ value: 'ban', label: 'Bannato' }, { value: 'shadowban', label: 'Shadowban' }],
    nota: 'Solo per gli utenti app: shadowban o ban attivi nel registro restrizioni' },
  { id: 'iscritto', label: 'Data di creazione',   gruppo: 'contatto', tipo: 'data',   sistema: true, colonna: { w: '1.15fr' } },
  { id: 'idRecord', label: 'ID record',           gruppo: 'contatto', tipo: 'testo',  sistema: true, colonna: { w: '0.85fr' } },

  // — Commerciale —
  { id: 'piano',    label: 'Piano',               gruppo: 'commerciale', tipo: 'elenco', sistema: true, colonna: { w: '0.9fr' },
    opzioni: [{ value: 'free', label: 'Gratuito' }, { value: 'starter', label: 'Starter' }, { value: 'plus', label: 'Plus' }, { value: 'business', label: 'Business' }, { value: 'base', label: 'Base' }, { value: 'pro', label: 'Pro' }] },
  { id: 'valore',   label: 'Valore generato',     gruppo: 'commerciale', tipo: 'valuta', sistema: true, colonna: { w: '1fr' } },
  { id: 'proprietario', label: 'Proprietario del contatto', gruppo: 'commerciale', tipo: 'elenco', colonna: { w: '1.2fr' },
    opzioni: [{ value: 'Marco Rinaldi', label: 'Marco Rinaldi' }, { value: 'Giulia Ferrari', label: 'Giulia Ferrari' }, { value: 'Davide Neri', label: 'Davide Neri' }, { value: 'Chiara Rossi', label: 'Chiara Rossi' }] },

  // — Geografia —
  { id: 'citta',    label: 'Città',               gruppo: 'geografia', tipo: 'elenco', sistema: true, colonna: { w: '0.95fr' }, opzioniDaDati: 'citta' },
  { id: 'regione',  label: 'Regione',             gruppo: 'geografia', tipo: 'elenco', sistema: true, colonna: { w: '1.05fr' }, opzioniDaDati: 'regione' },
  // Un'utenza può essere associata a PIÙ locali — lo staff che gira tra le
  // sedi, il titolare col gruppo: qui stanno tutti, in fila, così «contiene
  // Osteria del Borgo» pesca anche chi ci lavora solo il weekend. Per gli
  // utenti app è un tratto: non sono utenze di nessun locale.
  { id: 'locali',   label: 'Locali associati',    gruppo: 'geografia', tipo: 'testo', sistema: true, colonna: { w: 'minmax(0,1.7fr)' },
    nota: 'Per utenti staff e titolari multi-sede: i locali su cui vale l\'utenza' },

  // — Acquisizione — le proprietà che si compilano da sole
  { id: 'referral', label: 'Referral',            gruppo: 'acquisizione', tipo: 'testo', colonna: { w: '1.1fr' },
    nota: 'Compilata dalla submission dei form e dai workflow' },
  { id: 'campagnaId', label: 'ID campagna',       gruppo: 'acquisizione', tipo: 'testo', colonna: { w: '1.05fr' },
    nota: 'Scritta dal parametro utm_campaign sul primo contatto' },
  { id: 'canale',   label: 'Canale di acquisizione', gruppo: 'acquisizione', tipo: 'elenco', colonna: { w: '1.15fr' },
    opzioni: [{ value: 'organico', label: 'Organico' }, { value: 'passaparola', label: 'Passaparola' }, { value: 'ads', label: 'Campagna a pagamento' }, { value: 'fiera', label: 'Fiera ed eventi' }, { value: 'agente', label: 'Agente sul territorio' }, { value: 'form', label: 'Form sul sito' }] },
  { id: 'primoForm', label: 'Primo form compilato', gruppo: 'acquisizione', tipo: 'elenco', colonna: { w: '1.3fr' }, opzioniDaDati: 'primoForm' },

  // — Marketing —
  { id: 'consensoMail', label: 'Consenso email',  gruppo: 'marketing', tipo: 'bool', colonna: { w: '1fr' } },
  { id: 'consensoSms',  label: 'Consenso SMS',    gruppo: 'marketing', tipo: 'bool', colonna: { w: '0.95fr' } },
  { id: 'interessi',    label: 'Interessi',       gruppo: 'marketing', tipo: 'multi', colonna: { w: '1.4fr' },
    opzioni: [{ value: 'menu', label: 'Menu digitale' }, { value: 'delivery', label: 'Delivery' }, { value: 'prenotazioni', label: 'Prenotazioni' }, { value: 'fidelity', label: 'Fidelity' }, { value: 'cassa', label: 'Cassa e conti' }, { value: 'magazzino', label: 'Magazzino' }] },
  { id: 'ultimaMail',   label: 'Ultima email aperta', gruppo: 'marketing', tipo: 'data', colonna: { w: '1.25fr' } },

  // — Attività —
  { id: 'ultimaAttivita', label: 'Ultima attività', gruppo: 'attivita', tipo: 'data',   sistema: true, colonna: { w: '1.2fr' } },
  { id: 'ordini',         label: 'Ordini totali',   gruppo: 'attivita', tipo: 'numero', sistema: true, colonna: { w: '0.9fr' } },
  { id: 'sessioni',       label: 'Sessioni 30gg',   gruppo: 'attivita', tipo: 'numero', colonna: { w: '0.95fr' } },
];

const HUB_PROP = HUB_PROPRIETA.reduce((m, p) => { m[p.id] = p; return m; }, {});

// ═══════════════════════════════════════════════════════════════════════════
// 3 · IL MOTORE: leggere una proprietà, valutare un filtro
// ═══════════════════════════════════════════════════════════════════════════

function hubLeggi(c, propId) {
  if (!c) return null;
  if (propId === 'idRecord') return c.ref ? c.ref.id : c.id;
  const v = c[propId];
  return v === undefined ? null : v;
}

const hubVuoto = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);
const hubTesto = (v) => String(v == null ? '' : v).toLowerCase().trim();
const hubGiorno = (d) => {
  if (d == null) return null;
  const t = (d instanceof Date) ? d : new Date(d);
  return isNaN(t) ? null : new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
};

// Un filtro è {prop, op, valore}. Ritorna sempre un booleano: un filtro
// incompleto (operatore che vuole un valore e valore non ancora scritto) non
// deve svuotare la lista mentre lo si sta componendo — passa tutti.
function hubValuta(c, f) {
  const p = HUB_PROP[f.prop];
  if (!p) return true;
  const op = (HUB_OPERATORI[p.tipo] || []).find(o => o.id === f.op);
  if (!op) return true;
  const v = hubLeggi(c, f.prop);
  const a = f.valore;

  if (op.id === 'noto')    return !hubVuoto(v);
  if (op.id === 'nonNoto') return hubVuoto(v);
  if (op.id === 'vero')    return v === true;
  if (op.id === 'falso')   return v === false;

  const argMancante = (op.arg === 'scelte' && (!Array.isArray(a) || !a.length))
    || (op.arg === 'intervallo' && (!Array.isArray(a) || a[0] == null || a[1] == null))
    || (op.arg !== 'scelte' && op.arg !== 'intervallo' && op.arg !== 'nessuno' && (a == null || a === ''));
  if (argMancante) return true;

  switch (op.id) {
    case 'contiene':  return hubTesto(v).includes(hubTesto(a));
    case 'nonCont':   return p.tipo === 'multi'
      ? !(Array.isArray(v) ? v : []).some(x => a.includes(x))
      : !hubTesto(v).includes(hubTesto(a));
    case 'uguale':    return p.tipo === 'numero' || p.tipo === 'valuta' ? Number(v) === Number(a) : hubTesto(v) === hubTesto(a);
    case 'diverso':   return hubTesto(v) !== hubTesto(a);
    case 'inizia':    return hubTesto(v).startsWith(hubTesto(a));
    case 'finisce':   return hubTesto(v).endsWith(hubTesto(a));
    case 'unoDi':     return a.includes(v);
    case 'nessunoDi': return !a.includes(v);
    case 'contieneUno':   return (Array.isArray(v) ? v : []).some(x => a.includes(x));
    case 'contieneTutti': return a.every(x => (Array.isArray(v) ? v : []).includes(x));
    case 'maggiore':  return Number(v) > Number(a);
    case 'minore':    return Number(v) < Number(a);
    case 'traNum':    return Number(v) >= Number(a[0]) && Number(v) <= Number(a[1]);
    case 'dopo':      return hubGiorno(v) != null && hubGiorno(v) > hubGiorno(a);
    case 'prima':     return hubGiorno(v) != null && hubGiorno(v) < hubGiorno(a);
    case 'ilGiorno':  return hubGiorno(v) === hubGiorno(a);
    case 'ultimiGg':  return hubGiorno(v) != null && (Date.now() - new Date(v).getTime()) <= Number(a) * 86400000;
    case 'traDate':   return hubGiorno(v) != null && hubGiorno(v) >= hubGiorno(a[0]) && hubGiorno(v) <= hubGiorno(a[1]);
    default: return true;
  }
}

// I filtri di un gruppo si sommano in AND. Un elenco attivo ha DUE gruppi:
// quelli da includere e quelli da escludere.
const hubPassa = (c, filtri) => (filtri || []).every(f => hubValuta(c, f));
function hubApplica(righe, includi, escludi) {
  return (righe || []).filter(c => hubPassa(c, includi) && !(escludi && escludi.length && hubPassa(c, escludi)));
}

// Le opzioni di una proprietà «a elenco» che le prende dai dati veri: una
// città senza nessuno dentro non deve comparire nella tendina.
function hubOpzioni(prop, righe) {
  if (prop.opzioni) return prop.opzioni;
  if (!prop.opzioniDaDati) return [];
  const set = [...new Set((righe || []).map(r => hubLeggi(r, prop.id)))].filter(x => !hubVuoto(x) && x !== '—');
  return set.sort((a, b) => String(a).localeCompare(String(b))).map(v => ({ value: v, label: String(v) }));
}

// ═══════════════════════════════════════════════════════════════════════════
// 4 · L'ARRICCHIMENTO DEI CONTATTI
// ═══════════════════════════════════════════════════════════════════════════
//
// I mock di byup portano l'anagrafica; le proprietà di marketing no. Qui si
// derivano in modo STABILE dall'id — stesso contatto, stessi valori a ogni
// ricarica — perché una lista che si rimescola a ogni F5 non si può leggere.

function hubSeme(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
const hubScegli = (seme, arr) => arr[seme % arr.length];

const HUB_REFERRAL = ['Gambero Rosso', 'Fiera Host Milano', 'Passaparola cliente', 'Campagna Meta Q2', 'Newsletter TheFork', 'Agente Sud', 'Google Ads brand', ''];
const HUB_FORM_NOMI = ['Richiedi una demo', 'Scarica il listino', 'Iscrizione newsletter', 'Prova gratuita 14 giorni', 'Contattaci'];
const HUB_OWNER = ['Marco Rinaldi', 'Giulia Ferrari', 'Davide Neri', 'Chiara Rossi'];

function hubArricchisci(c) {
  const s = hubSeme(c.key || (c.ref && c.ref.id) || c.nome || 'x');
  const giorni = (n) => new Date(Date.now() - n * 86400000);
  const ref = hubScegli(s, HUB_REFERRAL);
  const interessiPool = ['menu', 'delivery', 'prenotazioni', 'fidelity', 'cassa', 'magazzino'];
  const nInt = s % 4;
  return Object.assign(c, {
    telefono: (s % 11 === 0) ? null : '+39 3' + String(20 + (s % 60)) + ' ' + String(1000000 + (s % 8999999)).slice(0, 7),
    referral: ref || null,
    campagnaId: ref ? ('CMP-' + (2026 + (s % 2)) + '-' + String(100 + (s % 400))) : null,
    canale: hubScegli(s >> 3, ['organico', 'passaparola', 'ads', 'fiera', 'agente', 'form']),
    primoForm: (s % 3 === 0) ? hubScegli(s >> 5, HUB_FORM_NOMI) : null,
    proprietario: hubScegli(s >> 7, HUB_OWNER),
    consensoMail: s % 5 !== 0,
    consensoSms: s % 3 === 0,
    interessi: interessiPool.filter((_, i) => ((s >> i) & 1) === 1).slice(0, nInt + 1),
    ultimaMail: (s % 4 === 0) ? null : giorni(s % 90),
    ultimaAttivita: giorni(s % 45),
    ordini: c.tipo === 'staff' ? null : (s % 320),
    sessioni: s % 60,
    valore: c.tipo === 'locale' ? 240 + (s % 4200) : c.tipo === 'utente' ? (s % 700) : null,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 5 · ELENCHI — segmenti attivi e liste statiche
// ═══════════════════════════════════════════════════════════════════════════

const HUB_ELENCHI = [
  { id: 'EL-001', nome: 'Locali Plus e Business attivi', tipo: 'attivo', cartella: 'Commerciale',
    descrizione: 'Base installata dei piani alti — il pubblico degli annunci di prodotto.',
    autore: 'Marco Rinaldi', creato: new Date(2026, 2, 12), aggiornato: new Date(Date.now() - 1800000),
    usatoIn: ['Novità di primavera', 'Workflow · Upsell Business'],
    includi: [ { prop: 'tipo', op: 'unoDi', valore: ['locale'] }, { prop: 'piano', op: 'unoDi', valore: ['plus', 'business'] }, { prop: 'ciclo', op: 'unoDi', valore: ['returning'] } ],
    escludi: [] },
  { id: 'EL-002', nome: 'Lead senza referral noto', tipo: 'attivo', cartella: 'Acquisizione',
    descrizione: 'Chi è entrato senza che sappiamo da dove: da chiamare e da qualificare.',
    autore: 'Giulia Ferrari', creato: new Date(2026, 4, 3), aggiornato: new Date(Date.now() - 5400000),
    usatoIn: ['Workflow · Qualifica lead'],
    includi: [ { prop: 'ciclo', op: 'unoDi', valore: ['lead'] }, { prop: 'referral', op: 'nonNoto', valore: null } ],
    escludi: [] },
  { id: 'EL-003', nome: 'Iscritti dopo il 3 luglio 2026', tipo: 'attivo', cartella: 'Acquisizione',
    descrizione: 'Tutti i contatti entrati nel database dopo il lancio del nuovo sito.',
    autore: 'Marco Rinaldi', creato: new Date(2026, 6, 4), aggiornato: new Date(Date.now() - 900000),
    usatoIn: ['Benvenuto in byup'],
    includi: [ { prop: 'iscritto', op: 'dopo', valore: new Date(2026, 6, 3) } ],
    escludi: [ { prop: 'consensoMail', op: 'falso', valore: null } ] },
  { id: 'EL-004', nome: 'Utenti App Pro molto attivi', tipo: 'attivo', cartella: 'Prodotto',
    descrizione: 'Chi paga il Pro e lo usa davvero: il campione per i test delle novità.',
    autore: 'Davide Neri', creato: new Date(2026, 3, 21), aggiornato: new Date(Date.now() - 3600000),
    usatoIn: ['Push · Beta prenotazioni'],
    includi: [ { prop: 'tipo', op: 'unoDi', valore: ['utente'] }, { prop: 'piano', op: 'unoDi', valore: ['pro'] }, { prop: 'sessioni', op: 'maggiore', valore: 25 } ],
    escludi: [] },
  { id: 'EL-005', nome: 'Fiera Host 2026 — contatti raccolti', tipo: 'statico', cartella: 'Eventi',
    descrizione: 'Importata dal foglio dei badge scansionati allo stand.',
    autore: 'Chiara Rossi', creato: new Date(2026, 9, 20), aggiornato: new Date(2026, 9, 22),
    usatoIn: ['Follow-up fiera'], origine: 'Import CSV · badge-host-2026.csv',
    membriFissi: 42, includi: [], escludi: [] },
  { id: 'EL-006', nome: 'Piano annullato negli ultimi 90 giorni', tipo: 'attivo', cartella: 'Retention',
    descrizione: 'La coda del win-back: si svuota da sola quando qualcuno rientra.',
    autore: 'Giulia Ferrari', creato: new Date(2026, 5, 8), aggiornato: new Date(Date.now() - 7200000),
    usatoIn: ['Workflow · Win-back 3 passi'],
    includi: [ { prop: 'ciclo', op: 'unoDi', valore: ['annullato'] }, { prop: 'ultimaAttivita', op: 'ultimiGg', valore: 90 } ],
    escludi: [] },
  { id: 'EL-007', nome: 'Interessati al Delivery', tipo: 'attivo', cartella: 'Prodotto',
    descrizione: 'Chi ha spuntato Delivery in un form o in un sondaggio.',
    autore: 'Marco Rinaldi', creato: new Date(2026, 1, 30), aggiornato: new Date(Date.now() - 10800000),
    usatoIn: ['Delivery: come funziona'],
    includi: [ { prop: 'interessi', op: 'contieneUno', valore: ['delivery'] }, { prop: 'consensoMail', op: 'vero', valore: null } ],
    escludi: [ { prop: 'ciclo', op: 'unoDi', valore: ['eliminato'] } ] },
  { id: 'EL-008', nome: 'Staff da formare — nuovi assunti', tipo: 'statico', cartella: 'Operazioni',
    descrizione: 'Aggiunti a mano dai titolari che hanno chiesto la formazione.',
    autore: 'Chiara Rossi', creato: new Date(2026, 7, 2), aggiornato: new Date(2026, 7, 14),
    usatoIn: [], origine: 'Aggiunti manualmente dalla rubrica',
    membriFissi: 17, includi: [], escludi: [] },
];

const HUB_CARTELLE = ['Commerciale', 'Acquisizione', 'Prodotto', 'Retention', 'Eventi', 'Operazioni'];

// ═══════════════════════════════════════════════════════════════════════════
// 6 · MARKETING — mail, SMS, push, form
// ═══════════════════════════════════════════════════════════════════════════

const HUB_STATI_INVIO = {
  bozza:       { label: 'Bozza',        color: 'PLAN_FREE' },
  programmata: { label: 'Programmata',  color: 'INFO' },
  inCorso:     { label: 'In invio',     color: 'WARN' },
  inviata:     { label: 'Inviata',      color: 'OK' },
  automatica:  { label: 'Automatica',   color: 'PURPLE' },
  sospesa:     { label: 'Sospesa',      color: 'DANGER' },
};

const HUB_MAIL = [
  { id: 'ML-014', nome: 'Novità di primavera · rilascio 4.2', tipo: 'normale', stato: 'inviata',
    oggetto: 'Le prenotazioni ora si gestiscono da sole', anteprima: 'Tre cose nuove che ti tolgono lavoro dalle mani',
    mittente: 'byup', mittenteMail: 'novita@byup.it', pubblico: 'EL-001', inviata: new Date(2026, 6, 28, 9, 30),
    dest: 412, consegnate: 405, aperte: 231, click: 88, disiscritti: 3, rimbalzi: 7 },
  { id: 'ML-013', nome: 'Delivery: come funziona', tipo: 'normale', stato: 'inviata',
    oggetto: 'Il delivery senza commissioni, spiegato in 2 minuti', anteprima: 'Quanto costa, come si attiva, cosa cambia in cucina',
    mittente: 'byup', mittenteMail: 'prodotto@byup.it', pubblico: 'EL-007', inviata: new Date(2026, 6, 14, 10, 0),
    dest: 268, consegnate: 264, aperte: 171, click: 74, disiscritti: 1, rimbalzi: 4 },
  { id: 'ML-012', nome: 'Follow-up fiera Host', tipo: 'normale', stato: 'programmata',
    oggetto: 'Ci siamo conosciuti a Host — riprendiamo da lì?', anteprima: 'Il listino e la demo che ti avevo promesso',
    mittente: 'Chiara di byup', mittenteMail: 'chiara@byup.it', pubblico: 'EL-005', programmata: new Date(2026, 7, 19, 8, 45),
    dest: 42, consegnate: 0, aperte: 0, click: 0, disiscritti: 0, rimbalzi: 0 },
  { id: 'ML-011', nome: 'Report mensile ai titolari', tipo: 'normale', stato: 'bozza',
    oggetto: 'Il tuo luglio in numeri', anteprima: 'Incassi, coperti, piatti più venduti',
    mittente: 'byup', mittenteMail: 'report@byup.it', pubblico: null,
    dest: 0, consegnate: 0, aperte: 0, click: 0, disiscritti: 0, rimbalzi: 0 },
  { id: 'ML-010', nome: 'Conferma iscrizione', tipo: 'automatica', stato: 'automatica',
    oggetto: 'Ci siamo: il tuo account byup è attivo', anteprima: 'Da qui si comincia — tre passi e sei operativo',
    mittente: 'byup', mittenteMail: 'ciao@byup.it', trigger: 'Submission form · Prova gratuita 14 giorni',
    dest: 1284, consegnate: 1271, aperte: 1044, click: 612, disiscritti: 4, rimbalzi: 13 },
  { id: 'ML-009', nome: 'Ritardo nella verifica dei documenti', tipo: 'automatica', stato: 'automatica',
    oggetto: 'Stiamo ancora controllando i tuoi documenti', anteprima: 'Ci vuole un giorno in più, nessun problema da parte tua',
    mittente: 'byup', mittenteMail: 'onboarding@byup.it', trigger: 'Workflow · Onboarding — ramo «verifica oltre 48h»',
    dest: 96, consegnate: 95, aperte: 79, click: 21, disiscritti: 0, rimbalzi: 1 },
  { id: 'ML-008', nome: 'Grazie per averci scritto', tipo: 'automatica', stato: 'automatica',
    oggetto: 'Abbiamo ricevuto il tuo messaggio', anteprima: 'Ti rispondiamo entro un giorno lavorativo',
    mittente: 'byup', mittenteMail: 'ciao@byup.it', trigger: 'Submission form · Contattaci',
    dest: 743, consegnate: 740, aperte: 502, click: 96, disiscritti: 2, rimbalzi: 3 },
  { id: 'ML-007', nome: 'Win-back · ci manchi', tipo: 'automatica', stato: 'sospesa',
    oggetto: 'Torniamo a lavorare insieme?', anteprima: 'Due mesi di Plus offerti da noi',
    mittente: 'byup', mittenteMail: 'ciao@byup.it', trigger: 'Workflow · Win-back 3 passi — passo 1',
    dest: 214, consegnate: 210, aperte: 61, click: 18, disiscritti: 9, rimbalzi: 4 },
];

const HUB_SMS = [
  { id: 'SM-006', nome: 'Promemoria rinnovo Plus', stato: 'inviata', testo: 'Ciao {{nome}}, il tuo piano byup Plus si rinnova domani. Serve una mano? Rispondi a questo SMS.',
    numero: 'byup', pubblico: 'EL-001', inviata: new Date(2026, 6, 30, 11, 0), dest: 412, consegnati: 404, click: 63, costo: 28.84 },
  { id: 'SM-005', nome: 'Stand Host — passa a trovarci', stato: 'inviata', testo: 'Siamo al pad. 4 stand C21 fino a domenica. Ti offriamo il caffè e ti mostriamo il nuovo KDS. byup',
    numero: 'byup', pubblico: 'EL-005', inviata: new Date(2026, 9, 21, 8, 30), dest: 42, consegnati: 42, click: 19, costo: 2.94 },
  { id: 'SM-004', nome: 'Manutenzione notturna', stato: 'programmata', testo: 'Stanotte dalle 2 alle 3 byup sarà in manutenzione. Le casse continuano a funzionare offline.',
    numero: 'byup', pubblico: 'EL-001', programmata: new Date(2026, 7, 16, 18, 0), dest: 412, consegnati: 0, click: 0, costo: 28.84 },
  { id: 'SM-003', nome: 'Codice di verifica', stato: 'automatica', testo: 'Il tuo codice byup è {{codice}}. Scade tra 10 minuti.',
    numero: 'byup', trigger: 'Workflow · Accesso con OTP', dest: 8420, consegnati: 8377, click: 0, costo: 589.40 },
  { id: 'SM-002', nome: 'Win-back · ultimo passo', stato: 'sospesa', testo: 'Ci manchi. Due mesi di Plus offerti se torni entro il 31. byup',
    numero: 'byup', trigger: 'Workflow · Win-back 3 passi — passo 3', dest: 118, consegnati: 115, click: 12, costo: 8.26 },
  { id: 'SM-001', nome: 'Bozza · novità cassa', stato: 'bozza', testo: '', numero: 'byup', dest: 0, consegnati: 0, click: 0, costo: 0 },
];

const HUB_PUSH = [
  { id: 'PS-009', nome: 'Beta prenotazioni', stato: 'inviata', dove: 'app', titolo: 'Sei tra i primi',
    corpo: 'Le prenotazioni intelligenti sono in prova sul tuo account. Provale e dicci com\'è.',
    pubblico: 'EL-004', inviata: new Date(2026, 6, 25, 18, 30), dest: 1840, ricevute: 1712, aperte: 604 },
  { id: 'PS-008', nome: 'Menu della settimana', stato: 'inviata', dove: 'app', titolo: 'C\'è il nuovo menu',
    corpo: 'Tre piatti nuovi da Osteria del Borgo, a 900 metri da te.',
    pubblico: null, inviata: new Date(2026, 6, 22, 12, 0), dest: 12400, ricevute: 11380, aperte: 3120 },
  { id: 'PS-007', nome: 'Cassa da chiudere', stato: 'automatica', dove: 'gestionale', titolo: 'Cassa ancora aperta',
    corpo: 'Il turno è finito da un\'ora e la cassa non è stata chiusa.',
    trigger: 'Workflow · Chiusura turno', dest: 3120, ricevute: 3090, aperte: 2740 },
  { id: 'PS-006', nome: 'Documento in scadenza', stato: 'automatica', dove: 'gestionale', titolo: 'HACCP in scadenza',
    corpo: 'Il piano HACCP scade tra 15 giorni. Caricane uno aggiornato.',
    trigger: 'Workflow · Certificazioni', dest: 480, ricevute: 476, aperte: 401 },
  { id: 'PS-005', nome: 'Rilascio 4.3 — bozza', stato: 'bozza', dove: 'gestionale', titolo: '', corpo: '', dest: 0, ricevute: 0, aperte: 0 },
];

const HUB_FORM = [
  { id: 'FR-005', nome: 'Richiedi una demo', stato: 'pubblicato', pagina: 'byup.it/demo',
    campi: 5, viste: 4820, submission: 386, tasso: 8.0, creato: new Date(2026, 1, 14),
    automazione: { mail: 'ML-010', redirect: 'byup.it/grazie', proprieta: 'referral' } },
  { id: 'FR-004', nome: 'Prova gratuita 14 giorni', stato: 'pubblicato', pagina: 'byup.it/prova',
    campi: 7, viste: 9140, submission: 1284, tasso: 14.0, creato: new Date(2025, 10, 3),
    automazione: { mail: 'ML-010', redirect: 'app.byup.it/onboarding', proprieta: 'campagnaId' } },
  { id: 'FR-003', nome: 'Iscrizione newsletter', stato: 'pubblicato', pagina: 'byup.it (piè di pagina)',
    campi: 2, viste: 22400, submission: 1907, tasso: 8.5, creato: new Date(2025, 8, 19),
    automazione: { mail: null, redirect: null, proprieta: null } },
  { id: 'FR-002', nome: 'Contattaci', stato: 'pubblicato', pagina: 'byup.it/contatti',
    campi: 4, viste: 6310, submission: 743, tasso: 11.8, creato: new Date(2025, 5, 2),
    automazione: { mail: 'ML-008', redirect: null, proprieta: null } },
  { id: 'FR-001', nome: 'Scarica il listino', stato: 'bozza', pagina: '—',
    campi: 3, viste: 0, submission: 0, tasso: 0, creato: new Date(2026, 7, 6),
    automazione: { mail: null, redirect: null, proprieta: 'referral' } },
];

// ═══════════════════════════════════════════════════════════════════════════
// 7 · WORKFLOW
// ═══════════════════════════════════════════════════════════════════════════

const HUB_WF_NODI = {
  trigger:    { label: 'Innesco',        icona: 'bolt',        color: 'HUB_VIOLA' },
  attesa:     { label: 'Attendi',        icona: 'hourglass',   color: 'INFO' },
  condizione: { label: 'Se / allora',    icona: 'split',       color: 'WARN' },
  mail:       { label: 'Invia email',    icona: 'mail',        color: 'HUB_MAGENTA' },
  sms:        { label: 'Invia SMS',      icona: 'smartphone',  color: 'HUB_MAGENTA' },
  push:       { label: 'Invia push',     icona: 'bell',        color: 'HUB_MAGENTA' },
  proprieta:  { label: 'Scrivi proprietà', icona: 'tag',       color: 'TEAL' },
  elenco:     { label: 'Aggiungi a elenco', icona: 'layers',   color: 'TEAL' },
  agente:     { label: 'Chiedi a un agente', icona: 'sparkles', color: 'HUB_VIOLA' },
  script:     { label: 'Script custom',  icona: 'code',        color: 'INK' },
  webhook:    { label: 'Chiama un webhook', icona: 'externalLink', color: 'INK' },
  fine:       { label: 'Fine',           icona: 'check',       color: 'PLAN_FREE' },
};

const HUB_WORKFLOW = [
  { id: 'WF-006', nome: 'Onboarding nuovo locale', origine: 'custom', stato: 'attivo',
    descrizione: 'Dalla prova gratuita al primo ordine: mail, controlli e una mano se si blocca.',
    iscritti: 1284, inCorso: 96, completati: 1102, autore: 'Marco Rinaldi', modificato: new Date(2026, 6, 30),
    nodi: [
      { tipo: 'trigger', testo: 'Submission form «Prova gratuita 14 giorni»' },
      { tipo: 'mail', testo: 'Conferma iscrizione' },
      { tipo: 'attesa', testo: '2 giorni' },
      { tipo: 'condizione', testo: 'Ha completato la configurazione?', rami: ['Sì', 'No'] },
      { tipo: 'mail', testo: 'Ti serve una mano?', ramo: 'No' },
      { tipo: 'proprieta', testo: 'Ciclo di vita → In onboarding' },
      { tipo: 'fine', testo: '' },
    ] },
  { id: 'WF-005', nome: 'Win-back 3 passi', origine: 'custom', stato: 'sospeso',
    descrizione: 'Tre contatti in tre settimane a chi ha annullato, poi si smette.',
    iscritti: 214, inCorso: 0, completati: 198, autore: 'Giulia Ferrari', modificato: new Date(2026, 5, 12),
    nodi: [
      { tipo: 'trigger', testo: 'Entra nell\'elenco «Piano annullato negli ultimi 90 giorni»' },
      { tipo: 'mail', testo: 'Win-back · ci manchi' },
      { tipo: 'attesa', testo: '7 giorni' },
      { tipo: 'condizione', testo: 'Ha aperto la mail?', rami: ['Sì', 'No'] },
      { tipo: 'sms', testo: 'Win-back · ultimo passo', ramo: 'No' },
      { tipo: 'fine', testo: '' },
    ] },
  { id: 'WF-004', nome: 'Qualifica lead', origine: 'custom', stato: 'attivo',
    descrizione: 'Un agente legge il sito del locale e propone il piano giusto al commerciale.',
    iscritti: 640, inCorso: 23, completati: 601, autore: 'Davide Neri', modificato: new Date(2026, 7, 8),
    nodi: [
      { tipo: 'trigger', testo: 'Entra nell\'elenco «Lead senza referral noto»' },
      { tipo: 'agente', testo: 'Ricercatore di mercato → stima coperti e scontrino' },
      { tipo: 'proprieta', testo: 'Piano consigliato ← risposta dell\'agente' },
      { tipo: 'condizione', testo: 'Piano consigliato = Business?', rami: ['Sì', 'No'] },
      { tipo: 'push', testo: 'Avvisa il commerciale di zona', ramo: 'Sì' },
      { tipo: 'fine', testo: '' },
    ] },
  { id: 'WF-003', nome: 'Certificazioni in scadenza', origine: 'custom', stato: 'attivo',
    descrizione: 'Quindici giorni prima della scadenza avvisa il titolare, poi il supporto.',
    iscritti: 480, inCorso: 41, completati: 402, autore: 'Chiara Rossi', modificato: new Date(2026, 4, 26),
    nodi: [
      { tipo: 'trigger', testo: 'Certificazione a 15 giorni dalla scadenza' },
      { tipo: 'push', testo: 'Documento in scadenza' },
      { tipo: 'attesa', testo: '10 giorni' },
      { tipo: 'condizione', testo: 'Documento caricato?', rami: ['Sì', 'No'] },
      { tipo: 'script', testo: 'Apri un ticket al supporto', ramo: 'No' },
      { tipo: 'fine', testo: '' },
    ] },
  { id: 'WF-002', nome: 'Form «Richiedi una demo»', origine: 'form', formId: 'FR-005', stato: 'attivo',
    descrizione: 'Il workflow semplice creato insieme al form: ringrazia e assegna.',
    iscritti: 386, inCorso: 2, completati: 384, autore: 'Automatico', modificato: new Date(2026, 1, 14),
    nodi: [
      { tipo: 'trigger', testo: 'Submission form «Richiedi una demo»' },
      { tipo: 'mail', testo: 'Conferma iscrizione' },
      { tipo: 'proprieta', testo: 'Referral ← campo «Come ci hai conosciuto»' },
      { tipo: 'fine', testo: '' },
    ] },
  { id: 'WF-001', nome: 'Form «Contattaci»', origine: 'form', formId: 'FR-002', stato: 'attivo',
    descrizione: 'Ringrazia chi scrive e mette il messaggio in coda al supporto.',
    iscritti: 743, inCorso: 5, completati: 738, autore: 'Automatico', modificato: new Date(2025, 5, 2),
    nodi: [
      { tipo: 'trigger', testo: 'Submission form «Contattaci»' },
      { tipo: 'mail', testo: 'Grazie per averci scritto' },
      { tipo: 'script', testo: 'Apri un ticket in Assistenza' },
      { tipo: 'fine', testo: '' },
    ] },
];

// ═══════════════════════════════════════════════════════════════════════════
// 8 · AGENT
// ═══════════════════════════════════════════════════════════════════════════

const HUB_AGENTI = [
  { id: 'AG-005', nome: 'Analista della retention', ruolo: 'Sorveglia i dati', stato: 'attivo',
    obiettivo: 'Trova i locali che stanno per andarsene prima che lo facciano, e dimmi perché.',
    fonti: ['Contatti', 'Ordini', 'Ticket di assistenza'], modello: 'Ragionamento esteso',
    innesco: 'Ogni giorno alle 7:00', esecuzioni: 214, esiti: 38, ultimoGiro: new Date(Date.now() - 5400000),
    ultimoEsito: '4 locali a rischio: 2 non ordinano da 21 giorni, 1 ha aperto 3 ticket in una settimana, 1 ha disattivato il delivery.' },
  { id: 'AG-004', nome: 'Ricercatore di mercato', ruolo: 'Arricchisce i contatti', stato: 'attivo',
    obiettivo: 'Per ogni lead nuovo, stima coperti e scontrino medio dal sito e dalle recensioni, e consiglia il piano.',
    fonti: ['Contatti', 'Web'], modello: 'Veloce',
    innesco: 'Quando entra un lead', esecuzioni: 640, esiti: 601, ultimoGiro: new Date(Date.now() - 900000),
    ultimoEsito: 'Trattoria da Nino · 60 coperti stimati, scontrino €28 → piano consigliato: Plus.' },
  { id: 'AG-003', nome: 'Redattore delle campagne', ruolo: 'Produce materiali', stato: 'attivo',
    obiettivo: 'Scrivi oggetto e anteprima per ogni bozza di email, in tre varianti da testare.',
    fonti: ['Marketing', 'Storico invii'], modello: 'Creativo',
    innesco: 'A richiesta, dalla bozza', esecuzioni: 89, esiti: 89, ultimoGiro: new Date(Date.now() - 172800000),
    ultimoEsito: '3 varianti per «Report mensile ai titolari». La più promettente per storico: «Il tuo luglio in numeri».' },
  { id: 'AG-002', nome: 'Report della settimana', ruolo: 'Fa reportistica', stato: 'inattivo',
    obiettivo: 'Ogni lunedì manda al team una pagina sola: cosa è cambiato e cosa guardare.',
    fonti: ['Analisi Dati', 'Marketing', 'Assistenza'], modello: 'Ragionamento esteso',
    innesco: 'Lunedì alle 8:00', esecuzioni: 32, esiti: 32, ultimoGiro: new Date(2026, 6, 27, 8, 0),
    ultimoEsito: 'Sospeso dal 3 agosto — in attesa dei nuovi indicatori di Analisi Dati.' },
  { id: 'AG-001', nome: 'Primo filtro dei ticket', ruolo: 'Smista il lavoro', stato: 'errore',
    obiettivo: 'Leggi ogni ticket nuovo, assegnalo alla persona giusta e proponi una risposta.',
    fonti: ['Assistenza', 'FAQ', 'Guide'], modello: 'Veloce',
    innesco: 'Quando arriva un ticket', esecuzioni: 1902, esiti: 1743, ultimoGiro: new Date(Date.now() - 3600000),
    ultimoEsito: 'Errore: la chiave del fornitore ha superato la quota mensile. Le ultime 12 esecuzioni non sono partite.' },
];

const HUB_AGENTI_MODELLI = [
  { id: 'veloce',  label: 'Veloce',              desc: 'Risposte rapide su compiti definiti. Il più economico.' },
  { id: 'esteso',  label: 'Ragionamento esteso', desc: 'Ragiona a più passi, incrocia più fonti. Più lento e più caro.' },
  { id: 'creativo',label: 'Creativo',            desc: 'Per testi, varianti e proposte. Meno adatto ai numeri.' },
];

// ═══════════════════════════════════════════════════════════════════════════
// 9 · DOMINI, MITTENTI, NUMERI
// ═══════════════════════════════════════════════════════════════════════════

const HUB_DOMINI = [
  { id: 'DM-1', dominio: 'byup.it', uso: 'Email di marketing e transazionali', stato: 'verificato',
    spf: true, dkim: true, dmarc: true, verificato: new Date(2025, 3, 12), reputazione: 98 },
  { id: 'DM-2', dominio: 'mail.byup.it', uso: 'Sottodominio dedicato agli invii massivi', stato: 'verificato',
    spf: true, dkim: true, dmarc: true, verificato: new Date(2025, 8, 2), reputazione: 96 },
  { id: 'DM-3', dominio: 'link.byup.it', uso: 'Tracciamento dei click', stato: 'verificato',
    spf: false, dkim: true, dmarc: true, verificato: new Date(2025, 8, 2), reputazione: 99 },
  { id: 'DM-4', dominio: 'hubble.byup.it', uso: 'Pagine dei form e landing', stato: 'in attesa',
    spf: true, dkim: false, dmarc: false, verificato: null, reputazione: null },
];

const HUB_MITTENTI = [
  { id: 'MT-1', nome: 'byup', indirizzo: 'ciao@byup.it', dominio: 'byup.it', stato: 'verificato', predefinito: true },
  { id: 'MT-2', nome: 'byup', indirizzo: 'novita@byup.it', dominio: 'byup.it', stato: 'verificato' },
  { id: 'MT-3', nome: 'byup', indirizzo: 'report@byup.it', dominio: 'mail.byup.it', stato: 'verificato' },
  { id: 'MT-4', nome: 'byup Onboarding', indirizzo: 'onboarding@byup.it', dominio: 'byup.it', stato: 'verificato' },
  { id: 'MT-5', nome: 'Chiara di byup', indirizzo: 'chiara@byup.it', dominio: 'byup.it', stato: 'verificato' },
  { id: 'MT-6', nome: 'byup Prodotto', indirizzo: 'prodotto@byup.it', dominio: 'byup.it', stato: 'in attesa' },
];

const HUB_NUMERI = [
  { id: 'NM-1', etichetta: 'byup', tipo: 'Mittente alfanumerico', paesi: 'Italia', stato: 'attivo', usato: 9114 },
  { id: 'NM-2', etichetta: '+39 351 000 4477', tipo: 'Numero con risposta', paesi: 'Italia', stato: 'attivo', usato: 312 },
  { id: 'NM-3', etichetta: 'byupOTP', tipo: 'Mittente alfanumerico', paesi: 'Italia, San Marino', stato: 'in attesa', usato: 0 },
];

window.HUB_OPERATORI = HUB_OPERATORI;
window.HUB_PROPRIETA = HUB_PROPRIETA;
window.HUB_PROP = HUB_PROP;
window.HUB_GRUPPI_PROP = HUB_GRUPPI_PROP;
window.hubLeggi = hubLeggi;
window.hubValuta = hubValuta;
window.hubPassa = hubPassa;
window.hubApplica = hubApplica;
window.hubOpzioni = hubOpzioni;
window.hubDescriviFiltro = hubDescriviFiltro;
window.hubEtichettaOpzione = hubEtichettaOpzione;
window.hubArricchisci = hubArricchisci;
window.hubSeme = hubSeme;
window.HUB_ELENCHI = HUB_ELENCHI;
window.HUB_CARTELLE = HUB_CARTELLE;
window.HUB_STATI_INVIO = HUB_STATI_INVIO;
window.HUB_MAIL = HUB_MAIL;
window.HUB_SMS = HUB_SMS;
window.HUB_PUSH = HUB_PUSH;
window.HUB_FORM = HUB_FORM;
window.HUB_WF_NODI = HUB_WF_NODI;
window.HUB_WORKFLOW = HUB_WORKFLOW;
window.HUB_AGENTI = HUB_AGENTI;
window.HUB_AGENTI_MODELLI = HUB_AGENTI_MODELLI;
window.HUB_DOMINI = HUB_DOMINI;
window.HUB_MITTENTI = HUB_MITTENTI;
window.HUB_NUMERI = HUB_NUMERI;
