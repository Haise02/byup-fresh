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
  // La data di nascita è di una PERSONA: un locale non compie gli anni, e fra
  // le persone non ce l'hanno tutte — chi si è iscritto prima che il campo
  // esistesse, chi non l'ha voluta dare. Che manchi davvero a qualcuno non è
  // un dettaglio dei mock: il trigger compleanno esiste anche per dire, prima
  // di accendersi, a quanti di quelli scelti la data c'è per davvero.
  { id: 'nascita',  label: 'Data di nascita',     gruppo: 'contatto', tipo: 'data',   sistema: true, colonna: { w: '1.15fr' },
    nota: 'Solo per le persone: i locali non ce l\'hanno. Vuota per chi non l\'ha mai data' },
  { id: 'tipo',     label: 'Tipologia contatto',  gruppo: 'contatto', tipo: 'elenco', sistema: true, colonna: { w: '1.2fr' },
    opzioni: [{ value: 'locale', label: 'Locale' }, { value: 'staff', label: 'Utente Staff' }, { value: 'utente', label: 'Utente App' }] },
  { id: 'ciclo',    label: 'Ciclo di vita',       gruppo: 'contatto', tipo: 'elenco', sistema: true, colonna: { w: '1.15fr' },
    opzioni: [{ value: 'lead', label: 'Lead' }, { value: 'onboarding', label: 'In onboarding' }, { value: 'clienteFree', label: 'Cliente Free' }, { value: 'clientePagante', label: 'Cliente Pagante' }, { value: 'returning', label: 'Returning' }, { value: 'annullato', label: 'Piano annullato' }, { value: 'eliminato', label: 'Eliminato' }] },
  // Un utente bannato non deve essere invisibile in rubrica: la restrizione
  // attiva (dal registro di Utenti app) è una proprietà come le altre — la
  // si mette in colonna e ci si filtra sopra.
  { id: 'restrizione', label: 'Restrizione',      gruppo: 'contatto', tipo: 'elenco', sistema: true, colonna: { w: '1.05fr' },
    opzioni: [{ value: 'ban', label: 'Bannato' }, { value: 'shadowban', label: 'Shadowban' }],
    // Nessun campo copiato sulla riga: si interroga il registro A OGNI lettura,
    // perché ban e revoche si decidono altrove (moderazione, scheda utente, il
    // registro stesso) e la colonna non può smentire il badge che le sta
    // accanto. Il ban vince sullo shadowban quando convivono.
    leggi: (c) => c.tipo !== 'utente' || !c.ref ? null
      : admRestrizioneAttiva(c.ref.id, 'ban') ? 'ban'
      : admRestrizioneAttiva(c.ref.id, 'shadowban') ? 'shadowban' : null,
    nota: 'Solo per gli utenti app: shadowban o ban attivi nel registro restrizioni' },
  { id: 'iscritto', label: 'Data di creazione',   gruppo: 'contatto', tipo: 'data',   sistema: true, colonna: { w: '1.15fr' } },
  // Il fatto permanente del win-back: lo stadio Returning scade a 90 giorni,
  // la data del rientro resta qui — filtrabile da rubrica ed elenchi come
  // ogni altra proprietà. Vuota = mai annullato e rientrato.
  { id: 'rientrato', label: 'Rientrato il',       gruppo: 'contatto', tipo: 'data',   sistema: true, colonna: { w: '1.15fr' } },
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
  // Nato per il toggle consenso dei passi push nei workflow: la nota promette
  // di controllare una proprietà, e la proprietà deve esistere nel registro —
  // come colonna e come filtro — non solo come etichetta.
  { id: 'consensoPush', label: 'Consenso push',   gruppo: 'marketing', tipo: 'bool', colonna: { w: '0.95fr' } },
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
  // Una proprietà può portare un lettore suo (`leggi`): il valore vive in
  // un'altra fonte — la restrizione sta nel registro — e copiarlo sulla riga
  // al load significava mostrare per sempre la fotografia del primo render.
  const p = HUB_PROP[propId];
  if (p && p.leggi) return p.leggi(c);
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
// `>>` in JavaScript lavora su interi CON SEGNO: su un seme grande il
// risultato è negativo, e `negativo % lunghezza` è negativo — l'indice cade
// fuori dall'array e si prende `undefined`. Qui si normalizza una volta per
// tutte, così nessun chiamante deve ricordarsene.
const hubIdx = (n, len) => len > 0 ? ((Math.trunc(n) % len) + len) % len : 0;
const hubScegli = (seme, arr) => arr[hubIdx(seme, arr.length)];

const HUB_REFERRAL = ['Gambero Rosso', 'Fiera Host Milano', 'Passaparola cliente', 'Campagna Meta Q2', 'Newsletter TheFork', 'Agente Sud', 'Google Ads brand', ''];
const HUB_FORM_NOMI = ['Richiedi una demo', 'Scarica il listino', 'Iscrizione newsletter', 'Prova gratuita 14 giorni', 'Contattaci'];
const HUB_OWNER = ['Marco Rinaldi', 'Giulia Ferrari', 'Davide Neri', 'Chiara Rossi'];

// La data di nascita del contatto. Se l'anagrafica ce l'ha già (utenti app e
// staff ce l'hanno nella loro scheda) è quella e non se ne discute; se non ce
// l'ha, si deriva stabile dall'id e si SCRIVE anche sull'anagrafica, perché la
// scheda del contatto e la rubrica non possono mostrare due date diverse della
// stessa persona.
function hubNascitaDi(c, s) {
  if (c.tipo === 'locale') return null;
  const gia = c.ref && c.ref.dataNascita;
  if (gia) { const d = new Date(gia); if (!isNaN(d)) return d; }
  if (s % 4 === 0) { if (c.ref && c.ref.dataNascita === undefined) c.ref.dataNascita = null; return null; }
  // 15–66 anni: qualche minorenne c'è, e ci deve essere — l'app si apre a 14
  // anni, e chi non è maggiorenne non riceve automazioni di marketing.
  const eta = 15 + (s % 52);
  const d = new Date(new Date().getFullYear() - eta, s % 12, 1 + ((s >>> 3) % 28));
  if (c.ref && c.ref.dataNascita === undefined) {
    c.ref.dataNascita = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  return d;
}

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
    canale: hubScegli(s >>> 3, ['organico', 'passaparola', 'ads', 'fiera', 'agente', 'form']),
    primoForm: (s % 3 === 0) ? hubScegli(s >>> 5, HUB_FORM_NOMI) : null,
    proprietario: hubScegli(s >>> 7, HUB_OWNER),
    consensoMail: s % 5 !== 0,
    consensoSms: s % 3 === 0,
    consensoPush: s % 4 === 0,
    interessi: interessiPool.filter((_, i) => ((s >> i) & 1) === 1).slice(0, nInt + 1),
    ultimaMail: (s % 4 === 0) ? null : giorni(s % 90),
    nascita: hubNascitaDi(c, s),
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
    includi: [ { prop: 'tipo', op: 'unoDi', valore: ['locale'] }, { prop: 'piano', op: 'unoDi', valore: ['plus', 'business'] }, { prop: 'ciclo', op: 'unoDi', valore: ['clientePagante', 'returning'] } ],
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

// I passi, raggruppati per mestiere: chi costruisce un'automazione pensa
// «adesso gli scrivo» oppure «adesso segno una cosa», non scorre una lista
// piatta di undici voci in ordine di quando le abbiamo implementate.
const HUB_WF_FAMIGLIE = [
  { id: 'comunica',   label: 'Parlagli',        desc: 'Manda qualcosa al contatto' },
  { id: 'dati',       label: 'Segna qualcosa',  desc: 'Cambia lo stato nel CRM' },
  { id: 'intelligenza', label: 'Fai ragionare', desc: 'Chiedi a un agente' },
  { id: 'controllo',  label: 'Decidi e aspetta', desc: 'Rami e tempi' },
  { id: 'tecnici',    label: 'Esci da Hubble',  desc: 'Codice e sistemi esterni' },
];

const HUB_WF_NODI = {
  trigger:    { label: 'Innesco',        icona: 'bolt',        color: 'HUB_VIOLA', famiglia: 'controllo' },
  attesa:     { label: 'Attendi',        icona: 'hourglass',   color: 'INFO',      famiglia: 'controllo' },
  condizione: { label: 'Se / allora',    icona: 'split',       color: 'WARN',      famiglia: 'controllo' },
  mail:       { label: 'Invia email',    icona: 'mail',        color: 'HUB_MAGENTA', famiglia: 'comunica' },
  sms:        { label: 'Invia SMS',      icona: 'smartphone',  color: 'HUB_MAGENTA', famiglia: 'comunica' },
  push:       { label: 'Invia push',     icona: 'bell',        color: 'HUB_MAGENTA', famiglia: 'comunica' },
  proprieta:  { label: 'Scrivi proprietà', icona: 'tag',       color: 'TEAL',      famiglia: 'dati' },
  elenco:     { label: 'Aggiungi a elenco', icona: 'layers',   color: 'TEAL',      famiglia: 'dati' },
  agente:     { label: 'Chiedi a un agente', icona: 'sparkles', color: 'HUB_VIOLA', famiglia: 'intelligenza' },
  script:     { label: 'Script custom',  icona: 'code',        color: 'INK',       famiglia: 'tecnici' },
  webhook:    { label: 'Chiama un webhook', icona: 'externalLink', color: 'INK',    famiglia: 'tecnici' },
  fine:       { label: 'Fine',           icona: 'check',       color: 'PLAN_FREE', famiglia: 'controllo' },
};

// Un workflow è un ALBERO, non una lista. Una condizione apre più rami, ogni
// ramo ha le sue condizioni e i suoi passi, e i passi dentro un ramo possono
// aprire altre condizioni. Prima i rami erano una stringa appiccicata al passo
// («ramo: No»): bastava per disegnarli, non per dire QUANDO si prende un ramo
// invece di un altro.
//
// Ogni ramo porta `criteri` — le stesse frasi proprietà/operatore/valore dei
// filtri — e una `congiunzione` che dice se devono essere vere TUTTE (E) o
// ne basta UNA (O). L'ultimo ramo può essere `altrimenti`: si prende quando
// nessuno degli altri ha risposto, e non ha criteri perché è la sua
// definizione a essere «tutto il resto».
//
// I passi sono SCISSI per mestiere — comunicazione, dati, intelligenza,
// tecnici — perché «invia una mail» e «chiama un webhook» finiscono nello
// stesso elenco solo se quell'elenco non lo deve leggere nessuno.

const HUB_WORKFLOW = [
  { id: 'WF-006', nome: 'Onboarding nuovo locale', origine: 'custom', stato: 'attivo',
    descrizione: 'Dalla prova gratuita al primo ordine: mail, controlli e una mano se si blocca.',
    iscritti: 1284, inCorso: 96, completati: 1102, autore: 'Marco Rinaldi', modificato: new Date(2026, 6, 30),
    nodi: [
      { tipo: 'trigger', testo: 'Submission form «Prova gratuita 14 giorni»' },
      { tipo: 'mail', testo: 'Conferma iscrizione' },
      { tipo: 'attesa', testo: '2 giorni', attesa: { modo: 'durata', n: 2, unita: 'giorni' } },
      { tipo: 'condizione', testo: 'Ha completato la configurazione?', rami: [
        { id: 'r1', label: 'Sì, ed è un piano alto',
          quando: { tipo: 'regole', congiunzione: 'E', gruppi: [
            { id: 'g1', congiunzione: 'E', regole: [
              { genere: 'proprieta', prop: 'ciclo', op: 'unoDi', valore: ['clientePagante'] },
              { genere: 'proprieta', prop: 'piano', op: 'unoDi', valore: ['plus', 'business'] },
            ] },
          ] },
          nodi: [
            { tipo: 'proprieta', testo: 'Ciclo di vita → Cliente Pagante' },
            { tipo: 'elenco', testo: 'Locali Plus e Business attivi' },
            { tipo: 'push', testo: 'Avvisa il commerciale di zona' },
          ] },
        { id: 'r2', label: 'Sì, piano gratuito',
          quando: { tipo: 'regole', congiunzione: 'E', gruppi: [
            { id: 'g1', congiunzione: 'E', regole: [
              { genere: 'proprieta', prop: 'ciclo', op: 'unoDi', valore: ['clienteFree'] },
            ] },
          ] },
          nodi: [
            { tipo: 'proprieta', testo: 'Ciclo di vita → Cliente Free' },
            { tipo: 'mail', testo: 'Delivery: come funziona' },
          ] },
        { id: 'r3', label: 'Non ancora', altrimenti: true,
          quando: { tipo: 'altrimenti', congiunzione: 'E', gruppi: [] },
          nodi: [
            { tipo: 'mail', testo: 'Ti serve una mano?' },
            { tipo: 'attesa', testo: '3 giorni', attesa: { modo: 'evento', n: 3, unita: 'giorni',
              evento: { evento: 'mailAperta', rif: 'ML-009', negato: false },
              tetto: { n: 3, unita: 'giorni' } } },
            { tipo: 'condizione', testo: 'Adesso ha configurato?', rami: [
              { id: 'r3a', label: 'Sì',
                quando: { tipo: 'regole', congiunzione: 'E', gruppi: [
                  { id: 'g1', congiunzione: 'E', regole: [
                    { genere: 'proprieta', prop: 'ciclo', op: 'unoDi', valore: ['clienteFree', 'clientePagante'] },
                  ] },
                ] },
                nodi: [ { tipo: 'proprieta', testo: 'Ciclo di vita → Cliente Free' } ] },
              { id: 'r3b', label: 'No', altrimenti: true,
                quando: { tipo: 'altrimenti', congiunzione: 'E', gruppi: [] },
                nodi: [ { tipo: 'script', testo: 'Apri un ticket al commerciale: onboarding fermo da 5 giorni' } ] },
            ] },
          ] },
      ] },
      { tipo: 'fine', testo: '' },
    ] },

  { id: 'WF-005', nome: 'Win-back 3 passi', origine: 'custom', stato: 'sospeso',
    descrizione: 'Tre contatti in tre settimane a chi ha annullato, poi si smette.',
    iscritti: 214, inCorso: 0, completati: 198, autore: 'Giulia Ferrari', modificato: new Date(2026, 5, 12),
    nodi: [
      { tipo: 'trigger', testo: 'Entra nell\'elenco «Piano annullato negli ultimi 90 giorni»' },
      { tipo: 'mail', testo: 'Win-back · ci manchi' },
      { tipo: 'attesa', testo: '7 giorni', attesa: { modo: 'evento', n: 7, unita: 'giorni',
        evento: { evento: 'mailCliccata', rif: 'ML-011', negato: false }, tetto: { n: 7, unita: 'giorni' } } },
      { tipo: 'condizione', testo: 'Come ha reagito?', rami: [
        // L'esempio che il vecchio motore non sapeva scrivere: «ha aperto ma
        // non ha cliccato» sono due eventi, uno negato, sulla stessa mail —
        // OPPURE, in alternativa, il canale SMS aperto.
        { id: 'w1', label: 'Ha aperto ma non ha cliccato',
          quando: { tipo: 'regole', congiunzione: 'O', gruppi: [
            { id: 'g1', congiunzione: 'E', regole: [
              { genere: 'evento', evento: 'mailAperta',   rif: 'ML-011', negato: false, finestra: { n: 7, unita: 'giorni' } },
              { genere: 'evento', evento: 'mailCliccata', rif: 'ML-011', negato: true,  finestra: { n: 7, unita: 'giorni' } },
            ] },
            { id: 'g2', congiunzione: 'E', regole: [
              { genere: 'proprieta', prop: 'consensoSms', op: 'vero', valore: null },
              { genere: 'esito', esito: 'consegnata' },
            ] },
          ] },
          nodi: [ { tipo: 'sms', testo: 'Win-back · ultimo passo' } ] },
        { id: 'w2', label: 'Nessun segnale', altrimenti: true,
          quando: { tipo: 'altrimenti', congiunzione: 'E', gruppi: [] },
          nodi: [ { tipo: 'proprieta', testo: 'Esito win-back → nessuna risposta' } ] },
      ] },
      { tipo: 'fine', testo: '' },
    ] },

  { id: 'WF-004', nome: 'Qualifica lead', origine: 'custom', stato: 'attivo',
    descrizione: 'Un agente legge il sito del locale e propone il piano giusto al commerciale.',
    iscritti: 640, inCorso: 23, completati: 601, autore: 'Davide Neri', modificato: new Date(2026, 7, 8),
    nodi: [
      { tipo: 'trigger', testo: 'Entra nell\'elenco «Lead senza referral noto»' },
      { tipo: 'agente', testo: 'Ricercatore di mercato → stima coperti e scontrino' },
      { tipo: 'proprieta', testo: 'Piano consigliato ← risposta dell\'agente' },
      { tipo: 'condizione', testo: 'Quanto vale questo lead?', rami: [
        { id: 'q1', label: 'Grande: Business o molti ordini',
          quando: { tipo: 'regole', congiunzione: 'E', gruppi: [
            { id: 'g1', congiunzione: 'O', regole: [
              { genere: 'proprieta', prop: 'piano', op: 'unoDi', valore: ['business'] },
              { genere: 'proprieta', prop: 'ordini', op: 'maggiore', valore: 200 },
            ] },
            { id: 'g2', congiunzione: 'E', regole: [
              { genere: 'esito', esito: 'agenteOk' },
            ] },
          ] },
          nodi: [
            { tipo: 'push', testo: 'Avvisa il commerciale di zona' },
            { tipo: 'proprieta', testo: 'Priorità → alta' },
          ] },
        { id: 'q2', label: 'Medio, ma raggiungibile',
          quando: { tipo: 'regole', congiunzione: 'E', gruppi: [
            { id: 'g1', congiunzione: 'E', regole: [
              { genere: 'proprieta', prop: 'email', op: 'noto', valore: null },
              { genere: 'proprieta', prop: 'consensoMail', op: 'vero', valore: null },
              { genere: 'evento', evento: 'paginaVista', rif: '/prezzi', negato: false, finestra: { n: 14, unita: 'giorni' } },
            ] },
          ] },
          nodi: [ { tipo: 'mail', testo: 'Novità di primavera · rilascio 4.2' } ] },
        { id: 'q3', label: 'Da rilavorare', altrimenti: true,
          quando: { tipo: 'altrimenti', congiunzione: 'E', gruppi: [] },
          nodi: [ { tipo: 'elenco', testo: 'Lead da riqualificare' } ] },
      ] },
      { tipo: 'fine', testo: '' },
    ] },

  { id: 'WF-003', nome: 'Certificazioni in scadenza', origine: 'custom', stato: 'attivo',
    descrizione: 'Quindici giorni prima della scadenza avvisa il titolare, poi il supporto.',
    iscritti: 480, inCorso: 41, completati: 402, autore: 'Chiara Rossi', modificato: new Date(2026, 4, 26),
    nodi: [
      { tipo: 'trigger', testo: 'Certificazione a 15 giorni dalla scadenza' },
      { tipo: 'push', testo: 'Documento in scadenza' },
      { tipo: 'attesa', testo: '10 giorni', attesa: { modo: 'durata', n: 10, unita: 'giorni' } },
      { tipo: 'condizione', testo: 'Documento caricato?', rami: [
        { id: 'c1', label: 'Sì',
          quando: { tipo: 'regole', congiunzione: 'E', gruppi: [
            { id: 'g1', congiunzione: 'O', regole: [
              { genere: 'evento', evento: 'formInviato', rif: 'FR-004', negato: false, finestra: { n: 10, unita: 'giorni' } },
              { genere: 'proprieta', prop: 'ciclo', op: 'unoDi', valore: ['clienteFree', 'clientePagante', 'returning'] },
            ] },
          ] },
          nodi: [ { tipo: 'proprieta', testo: 'Certificazione → in regola' } ] },
        { id: 'c2', label: 'No', altrimenti: true,
          quando: { tipo: 'altrimenti', congiunzione: 'E', gruppi: [] },
          nodi: [
            { tipo: 'script', testo: 'Apri un ticket al supporto' },
            { tipo: 'webhook', testo: 'POST /haccp/blocca-servizi' },
          ] },
      ] },
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

// Quanti passi ha davvero un workflow, rami compresi.
function hubContaNodi(nodi) {
  return (nodi || []).reduce((n, x) =>
    n + 1 + (x.rami || []).reduce((m, r) => m + hubContaNodi(r.nodi), 0), 0);
}

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
window.hubIdx = hubIdx;
window.HUB_ELENCHI = HUB_ELENCHI;
window.HUB_CARTELLE = HUB_CARTELLE;
window.HUB_STATI_INVIO = HUB_STATI_INVIO;
window.HUB_MAIL = HUB_MAIL;
window.HUB_SMS = HUB_SMS;
window.HUB_PUSH = HUB_PUSH;
window.HUB_FORM = HUB_FORM;
window.HUB_WF_NODI = HUB_WF_NODI;
window.HUB_WF_FAMIGLIE = HUB_WF_FAMIGLIE;
window.hubContaNodi = hubContaNodi;
window.HUB_WORKFLOW = HUB_WORKFLOW;
window.HUB_AGENTI = HUB_AGENTI;
window.HUB_AGENTI_MODELLI = HUB_AGENTI_MODELLI;
window.HUB_DOMINI = HUB_DOMINI;
window.HUB_MITTENTI = HUB_MITTENTI;
window.HUB_NUMERI = HUB_NUMERI;

// ═══════════════════════════════════════════════════════════════════════════
// 10 · IL DIARIO DI UN CONTATTO
// ═══════════════════════════════════════════════════════════════════════════
//
// Tutto quello che è successo fra noi e questa persona, in ordine di tempo:
// le mail che le abbiamo mandato e se le ha aperte, su quale link ha
// cliccato, gli SMS e le push, i form che ha compilato, i workflow in cui è
// entrata, le proprietà che sono cambiate e chi le ha cambiate, le telefonate,
// i ticket, le note scritte a mano.
//
// È la schermata che dice se un contatto è vivo. Un CRM che sa dirti l'email
// di qualcuno ma non se gli hai già scritto tre volte questa settimana non
// serve a niente — e serve a meno di niente quando due persone del team gli
// scrivono lo stesso giorno senza saperlo.

const HUB_ATT_TIPI = {
  mailInviata:   { label: 'Email inviata',       icona: 'mailFill',    color: 'HUB_MAGENTA', gruppo: 'email' },
  mailAperta:    { label: 'Email aperta',        icona: 'eye',         color: 'OK',          gruppo: 'email' },
  mailClick:     { label: 'Click nell\'email',   icona: 'cursorClick', color: 'HUB_MAGENTA', gruppo: 'email' },
  mailRimbalzo:  { label: 'Email respinta',      icona: 'alertTriangle', color: 'DANGER',    gruppo: 'email' },
  mailDisiscr:   { label: 'Disiscrizione',       icona: 'x',           color: 'DANGER',      gruppo: 'email' },
  smsInviato:    { label: 'SMS inviato',         icona: 'smsFill',     color: 'HUB_MAGENTA', gruppo: 'messaggi' },
  smsClick:      { label: 'Click nell\'SMS',     icona: 'cursorClick', color: 'HUB_MAGENTA', gruppo: 'messaggi' },
  pushInviata:   { label: 'Push inviata',        icona: 'bellFill',    color: 'PURPLE',      gruppo: 'messaggi' },
  pushAperta:    { label: 'Push aperta',         icona: 'eye',         color: 'OK',          gruppo: 'messaggi' },
  form:          { label: 'Form compilato',      icona: 'formFill',    color: 'TEAL',        gruppo: 'form' },
  pagina:        { label: 'Pagina vista',        icona: 'globe',       color: 'PLAN_FREE',   gruppo: 'form' },
  wfEntrato:     { label: 'Entrato in workflow', icona: 'flowFill',    color: 'HUB_VIOLA',   gruppo: 'automazioni' },
  wfUscito:      { label: 'Workflow completato', icona: 'check',       color: 'HUB_VIOLA',   gruppo: 'automazioni' },
  elencoEntrato: { label: 'Aggiunto a un elenco',icona: 'listFill',    color: 'INFO',        gruppo: 'automazioni' },
  elencoUscito:  { label: 'Uscito da un elenco', icona: 'listFill',    color: 'PLAN_FREE',   gruppo: 'automazioni' },
  proprieta:     { label: 'Proprietà cambiata',  icona: 'tagFill',     color: 'INFO',        gruppo: 'sistema' },
  chiamata:      { label: 'Telefonata',          icona: 'headsetFill', color: 'WARN',        gruppo: 'persone' },
  nota:          { label: 'Nota',                icona: 'pencil',      color: 'INK',         gruppo: 'persone' },
  accesso:       { label: 'Accesso',             icona: 'user',        color: 'PLAN_FREE',   gruppo: 'sistema' },
  creato:        { label: 'Contatto creato',     icona: 'plus',        color: 'OK',          gruppo: 'sistema' },

  // Assistenza: il ticket non è un evento solo. Si apre, magari si risolve, e
  // fra i due c'è chi ci ha lavorato. Tenerli separati faceva tre righe
  // scollegate a distanza di giorni, e per capire com'era finita bisognava
  // leggere tutto il diario.
  ticket:        { label: 'Ticket aperto',       icona: 'ticket',      color: 'WARN',        gruppo: 'assistenza' },
  ticketRisolto: { label: 'Ticket risolto',      icona: 'check',       color: 'OK',          gruppo: 'assistenza' },
  assistenzaPian:{ label: 'Assistenza pianificata', icona: 'calendar', color: 'INFO',        gruppo: 'assistenza' },
  assistenzaFatta:{ label: 'Assistenza svolta',  icona: 'lifebuoy',    color: 'TEAL',        gruppo: 'assistenza' },

  // Commerciale: quello che il contatto CHIEDE, non quello che gli mandiamo.
  promozione:    { label: 'Promozione richiesta', icona: 'megaphoneFill', color: 'HUB_MAGENTA', gruppo: 'commerciale' },
  preventivo:    { label: 'Preventivo',          icona: 'filePdf',     color: 'INFO',        gruppo: 'commerciale' },
  ordine:        { label: 'Ordine',              icona: 'receipt',     color: 'OK',          gruppo: 'commerciale' },
  rinnovo:       { label: 'Rinnovo del piano',   icona: 'refresh',     color: 'OK',          gruppo: 'commerciale' },
  appuntamento:  { label: 'Appuntamento',        icona: 'calendar',    color: 'HUB_VIOLA',   gruppo: 'persone' },
};

const HUB_ATT_GRUPPI = [
  { id: 'tutto',       label: 'Tutto' },
  { id: 'email',       label: 'Email' },
  { id: 'messaggi',    label: 'SMS e push' },
  { id: 'form',        label: 'Form e pagine' },
  { id: 'assistenza',  label: 'Assistenza' },
  { id: 'commerciale', label: 'Commerciale' },
  { id: 'automazioni', label: 'Automazioni' },
  { id: 'persone',     label: 'Note e chiamate' },
  { id: 'sistema',     label: 'Sistema' },
];

// Quello che un evento «chiude». Serve a legare fra loro le righe che
// raccontano la stessa cosa — un invio e le sue aperture, un ticket e la sua
// risoluzione — così il diario si legge per episodi e non per righe.
const HUB_ATT_SEGUITI = {
  mailAperta: 'mailInviata', mailClick: 'mailInviata', mailRimbalzo: 'mailInviata',
  smsClick: 'smsInviato', pushAperta: 'pushInviata',
  wfUscito: 'wfEntrato', ticketRisolto: 'ticket', assistenzaFatta: 'assistenzaPian',
};

const HUB_LINK_TRACCIATI = [
  { url: 'byup.it/prenotazioni', testo: 'Scopri come funziona' },
  { url: 'byup.it/prezzi', testo: 'Vedi i piani' },
  { url: 'app.byup.it/onboarding', testo: 'Completa la configurazione' },
  { url: 'byup.it/delivery', testo: 'Il delivery senza commissioni' },
  { url: 'byup.it/demo', testo: 'Prenota una demo' },
  { url: 'byup.it/guide/kds', testo: 'Guida al KDS' },
];
const HUB_PAGINE = ['byup.it/prezzi', 'byup.it/prenotazioni', 'byup.it/demo', 'byup.it/chi-siamo', 'byup.it/delivery'];
const HUB_OPERATORI_TEAM = ['Marco Rinaldi', 'Giulia Ferrari', 'Davide Neri', 'Chiara Rossi'];

// Il diario si costruisce una volta per contatto e resta in cache: rigenerarlo
// a ogni render farebbe ballare le date sotto gli occhi di chi legge.
const HUB_ATT_CACHE = {};

function hubAttivita(c) {
  if (!c) return [];
  const chiave = c.key || (c.ref && c.ref.id) || c.nome;
  if (HUB_ATT_CACHE[chiave]) return HUB_ATT_CACHE[chiave];

  const s = hubSeme(chiave);
  const ev = [];
  let n = 0;
  const rnd = (i) => (((s >>> (i % 20)) ^ (s * (i + 3))) >>> 0);
  const quando = (giorniFa, ora) => new Date(Date.now() - giorniFa * 86400000 - (ora || 0) * 3600000);
  // `futuro` marca le cose ancora da fare — un intervento fissato, un
  // appuntamento. Senza, il filtro «niente nel futuro» le buttava via, ed è
  // proprio l'informazione che serve prima di richiamare qualcuno.
  const push = (giorniFa, ora, tipo, titolo, dettaglio, meta, futuro) =>
    ev.push({ id: chiave + '-' + (++n), tipo, quando: quando(giorniFa, ora), titolo, dettaglio, meta: meta || null, futuro: !!futuro });

  // ── la nascita del contatto ──
  const eta = Math.max(3, Math.round((Date.now() - new Date(c.iscritto || Date.now()).getTime()) / 86400000));
  push(eta, 9, 'creato', 'Contatto creato in Hubble',
    c.primoForm ? `Dalla submission del form «${c.primoForm}»` : c.canale ? `Origine: ${hubEtichettaOpzione(HUB_PROP.canale, c.canale)}` : 'Inserito manualmente',
    c.referral ? { Referral: c.referral } : null);

  if (c.primoForm) {
    push(eta, 9, 'form', `Ha compilato «${c.primoForm}»`, 'Su byup.it',
      Object.assign({ Nome: c.nome }, c.email ? { Email: c.email } : {}, c.referral ? { 'Come ci hai conosciuto': c.referral } : {}));
    push(eta, 10, 'pagina', 'Ha visitato ' + hubScegli(s, HUB_PAGINE), 'Prima del form, stessa sessione');
  }

  // ── la storia delle campagne: ogni invio può essere aperto e cliccato ──
  const campagne = HUB_MAIL.filter(m => m.consegnate > 0);
  campagne.forEach((m, i) => {
    const r = rnd(i);
    const giorni = Math.max(1, Math.round(eta * 0.8) - i * 11 - (r % 5));
    if (giorni > eta) return;
    push(giorni, 9, 'mailInviata', m.nome, `Oggetto: «${m.oggetto}» · da ${m.mittenteMail}`);
    // Il tasso di apertura della campagna decide se questo contatto l'ha
    // aperta: i numeri del singolo devono tornare con quelli dell'invio.
    const apre = (r % 100) < Math.round(m.aperte / m.consegnate * 100);
    if (apre) {
      push(giorni, 8, 'mailAperta', m.nome, 'Aperta ' + ((r >>> 3) % 3 + 1) + ' volte · ' + (r % 2 ? 'iPhone · Mail' : 'Mac · Gmail'));
      const clicca = ((r >>> 5) % 100) < Math.round(m.click / Math.max(1, m.aperte) * 100);
      if (clicca) {
        const l = HUB_LINK_TRACCIATI[hubIdx(r >>> 7, HUB_LINK_TRACCIATI.length)];
        push(giorni, 7.5, 'mailClick', m.nome, `Ha cliccato «${l.testo}»`, { Link: l.url });
        if ((r >>> 9) % 3 === 0) push(giorni, 7.4, 'pagina', 'Ha visitato ' + l.url, 'Arrivato dal link della campagna');
      }
    }
    if ((r >>> 11) % 40 === 0) push(giorni, 9, 'mailRimbalzo', m.nome, 'Casella piena — riprovato 2 volte');
  });

  if (c.consensoMail === false) push(Math.round(eta * 0.35), 11, 'mailDisiscr', 'Si è disiscritto dalle comunicazioni',
    'Dal piè di pagina di una campagna. Da qui non riceve più email di marketing.');

  // ── SMS e push ──
  if (c.consensoSms) {
    const r = rnd(31);
    push(Math.max(2, Math.round(eta * 0.2)), 11, 'smsInviato', 'Promemoria rinnovo Plus', '1 segmento · consegnato');
    if (r % 3 === 0) push(Math.max(2, Math.round(eta * 0.2)), 10.8, 'smsClick', 'Promemoria rinnovo Plus', 'Ha aperto il link accorciato', { Link: 'byup.it/r/8fk2' });
  }
  if (c.tipo === 'utente' || c.tipo === 'locale') {
    const r = rnd(47);
    const p = HUB_PUSH[hubIdx(r, HUB_PUSH.length)];
    if (p.titolo) {
      push(Math.max(1, r % Math.max(4, eta - 1)), 18, 'pushInviata', p.nome, p.titolo + ' — ' + p.corpo.slice(0, 60));
      if (r % 2 === 0) push(Math.max(1, r % Math.max(4, eta - 1)), 17.7, 'pushAperta', p.nome, 'Ha toccato la notifica');
    }
  }

  // ── automazioni ed elenchi ──
  HUB_ELENCHI.filter(e => e.tipo === 'attivo').forEach((e, i) => {
    if (!hubPassa(c, e.includi)) return;
    const g = Math.max(1, Math.round(eta * 0.6) - i * 7);
    push(g, 12, 'elencoEntrato', e.nome, 'Ha iniziato a rispondere ai criteri dell\'elenco');
  });
  HUB_WORKFLOW.filter(w => w.stato === 'attivo').slice(0, 2).forEach((w, i) => {
    const r = rnd(60 + i);
    if (r % 3 !== 0) return;
    const g = Math.max(1, Math.round(eta * 0.5) - i * 9);
    push(g, 12, 'wfEntrato', w.nome, 'Iscritto all\'automazione');
    if (r % 2 === 0) push(Math.max(0, g - 3), 12, 'wfUscito', w.nome, 'Percorso completato');
  });

  // ── proprietà che cambiano ──
  if (c.ciclo && c.ciclo !== 'lead') {
    push(Math.round(eta * 0.55), 14, 'proprieta', 'Ciclo di vita',
      'Da «Lead» a «' + hubEtichettaOpzione(HUB_PROP.ciclo, c.ciclo) + '»',
      { Chi: 'Workflow · Onboarding nuovo locale' });
  }
  if (c.campagnaId) {
    push(eta, 9, 'proprieta', 'ID campagna', 'Impostata a «' + c.campagnaId + '»', { Chi: 'Submission form' });
  }
  if (c.proprietario) {
    push(Math.round(eta * 0.9), 10, 'proprieta', 'Proprietario del contatto',
      'Assegnato a ' + c.proprietario, { Chi: 'Assegnazione automatica per zona' });
  }

  // ── persone: chiamate, note, ticket ──
  const r2 = rnd(91);
  if (c.tipo === 'locale') {
    push(Math.max(1, r2 % Math.max(3, Math.round(eta * 0.3))), 15, 'chiamata',
      'Chiamata in uscita · ' + (4 + r2 % 9) + ' min',
      hubScegli(r2, ['Presentato il piano Plus, richiamare fra due settimane.',
        'Voleva capire il delivery. Mandato il listino.',
        'Non risponde. Lasciato messaggio in segreteria.',
        'Tutto bene, nessuna richiesta aperta.']),
      { Operatore: hubScegli(r2 >>> 3, HUB_OPERATORI_TEAM) });
    if (r2 % 4 === 0) push(Math.max(1, (r2 >>> 5) % Math.max(3, Math.round(eta * 0.25))), 16, 'nota',
      'Nota di ' + hubScegli(r2 >>> 7, HUB_OPERATORI_TEAM),
      hubScegli(r2 >>> 9, ['Il titolare preferisce essere contattato dopo le 15.',
        'Ha due sedi, la seconda apre a primavera.',
        'Attenzione: fattura intestata alla società, non al locale.']));
  }
  // ── assistenza: ticket, interventi svolti, interventi in programma ──
  //
  // È la parte che mancava del tutto. «Ha aperto un ticket» senza sapere se è
  // stato chiuso, e per che cosa, non serve a chi deve chiamare quel locale:
  // la prima domanda che gli farà è proprio «com'è finita quella volta lì».
  const rA = rnd(101);
  const MOTIVI = ['stampante delle comande', 'aggiornamento del gestionale', 'formazione sul KDS',
    'configurazione del delivery', 'lettore di carte', 'sincronizzazione del menu'];
  const TECNICI = ['Chiara Rossi', 'Davide Neri', 'Luca Bianchi'];

  const nTicket = rA % 4;                       // da 0 a 3 ticket nella storia
  for (let i = 0; i < nTicket; i++) {
    const r = rnd(110 + i);
    const g = Math.max(1, Math.round(eta * 0.7) - i * 19 - (r % 9));
    if (g > eta) continue;
    const num = 2100 + ((r + i * 37) % 400);
    const motivo = hubScegli(r + i, MOTIVI);
    push(g, 11, 'ticket', 'Ticket #' + num, 'Per ' + motivo,
      { Canale: hubScegli(r >>> 3, ['Email', 'Telefono', 'Chat nel gestionale']), Priorità: (r % 5 === 0 ? 'Alta' : 'Normale') });
    // Non tutti si chiudono: quelli aperti sono il numero che conta in cima.
    if ((r >>> 5) % 4 !== 0) {
      push(Math.max(0, g - 1 - (r % 3)), 15, 'ticketRisolto', 'Ticket #' + num,
        hubScegli(r >>> 7, ['Risolto da remoto, nessun ricambio.', 'Sostituito il cavo, chiuso in giornata.',
          'Era una impostazione: spiegata al titolare.', 'Rientrato dopo l\'aggiornamento.']),
        { 'Ticket': '#' + num, Chi: hubScegli(r >>> 9, TECNICI), 'Tempo di chiusura': (1 + r % 3) + ' giorni' });
    }
  }

  const nAss = (rA >>> 4) % 3;                  // interventi già svolti
  for (let i = 0; i < nAss; i++) {
    const r = rnd(130 + i);
    const g = Math.max(1, Math.round(eta * 0.45) - i * 27 - (r % 6));
    if (g > eta) continue;
    push(g, 14, 'assistenzaFatta', 'Intervento · ' + hubScegli(r + i, MOTIVI),
      ((r % 2) ? 'Da remoto' : 'In sede') + ' · ' + (25 + r % 70) + ' minuti · esito positivo',
      { Tecnico: hubScegli(r >>> 3, TECNICI), Motivo: hubScegli(r + i, MOTIVI) });
  }

  // Una in programma, nel futuro: è la riga che dice «non richiamarlo, ha già
  // un appuntamento». Il diario la mostra in cima, marcata come da fare.
  if (rA % 3 === 0) {
    const fra = 2 + (rA >>> 6) % 9;
    push(-fra, 10, 'assistenzaPian', 'Assistenza in programma · ' + hubScegli(rA >>> 8, MOTIVI),
      'Fissata con ' + hubScegli(rA >>> 10, TECNICI) + ' · ' + ((rA % 2) ? 'da remoto' : 'in sede'),
      { Quando: 'fra ' + fra + ' giorni' }, true);
  }

  // ── commerciale: quello che ha chiesto lui ──
  const rC = rnd(151);
  if (rC % 3 !== 2) {
    push(Math.max(1, Math.round(eta * 0.3) - (rC % 5)), 13, 'promozione',
      'Ha chiesto la promozione «' + hubScegli(rC, ['Secondo mese gratis', 'Sconto 20% sul Plus annuale', 'Setup gratuito', 'Delivery senza canone per 3 mesi']) + '»',
      hubScegli(rC >>> 3, ['Richiesta dal gestionale, in attesa di approvazione.',
        'Chiesta al telefono al commerciale di zona.', 'Arrivata dal form «Richiedi una demo».']),
      { Stato: hubScegli(rC >>> 5, ['In attesa', 'Approvata', 'Rifiutata']) });
  }
  if (c.piano && c.piano !== 'free' && (rC >>> 7) % 2 === 0) {
    push(Math.max(1, Math.round(eta * 0.15)), 9, 'rinnovo', 'Piano ' + hubEtichettaOpzione(HUB_PROP.piano, c.piano) + ' rinnovato',
      'Rinnovo automatico andato a buon fine.', { Importo: '€' + (49 + (rC % 120)) + '/mese' });
  }
  if ((rC >>> 9) % 4 === 0) {
    push(Math.max(1, Math.round(eta * 0.25)), 16, 'preventivo', 'Preventivo inviato',
      'Passaggio a ' + hubScegli(rC >>> 11, ['Plus', 'Business']) + ' con due postazioni in più.',
      { Valore: '€' + (900 + (rC % 2600)), Validità: '30 giorni' });
  }

  // ── accessi ──
  if (c.ultimaAttivita) push(Math.max(0, Math.round((Date.now() - new Date(c.ultimaAttivita).getTime()) / 86400000)), 9,
    'accesso', 'Ultimo accesso', c.tipo === 'utente' ? 'App byup · iPhone' : 'Gestionale · Chrome su Mac');

  // Due paletti, e sono di buon senso: niente nel futuro, e niente PRIMA che
  // il contatto esistesse. Il secondo serve davvero — un contatto creato
  // stamattina si ritrovava sei campagne ricevute la settimana scorsa, perché
  // le date degli eventi si calcolano all'indietro dalla sua età.
  const nascita = ev.find(e => e.tipo === 'creato');
  const daQuando = nascita ? nascita.quando.getTime() : 0;
  const out = ev
    .filter(e => (e.futuro || e.quando <= new Date()) && (e.tipo === 'creato' || e.quando.getTime() >= daQuando - 3600000))
    .sort((a, b) => b.quando - a.quando);
  HUB_ATT_CACHE[chiave] = out;
  return out;
}

// ─── La sintesi del diario ──────────────────────────────────────────────────
//
// Le sei domande che uno si fa PRIMA di leggere il diario: quando l'abbiamo
// sentito l'ultima volta e come, che cosa ha in programma, quanti ticket ha
// aperti, che assistenza ha ricevuto e per che cosa, che cosa ha chiesto, e
// se le nostre email le apre o le ignora. Stanno qui e non nella schermata
// perché sono un fatto sul contatto, non una decisione di grafica.
const HUB_ATT_CONTATTO = ['chiamata', 'assistenzaFatta', 'ticket', 'nota', 'appuntamento'];

function hubSintesi(c) {
  const ev = hubAttivita(c);
  const ora = Date.now();
  const passati = ev.filter(e => !e.futuro);
  const conta = (t) => passati.filter(e => e.tipo === t).length;

  const ultimoContatto = passati.find(e => HUB_ATT_CONTATTO.includes(e.tipo)) || null;
  const prossima = ev.filter(e => e.futuro).sort((a, b) => a.quando - b.quando)[0] || null;

  const aperti = passati.filter(e => e.tipo === 'ticket');
  const risolti = passati.filter(e => e.tipo === 'ticketRisolto');
  const risoltiNum = new Set(risolti.map(e => e.titolo));
  const ticketAperti = aperti.filter(t => !risoltiNum.has(t.titolo));

  const assistenze = passati.filter(e => e.tipo === 'assistenzaFatta');
  const promozioni = passati.filter(e => e.tipo === 'promozione');

  const inviate = conta('mailInviata'), aperte = conta('mailAperta'), click = conta('mailClick');

  return {
    eventi: ev,
    ultimoContatto,
    giorniDaUltimo: ultimoContatto ? Math.round((ora - ultimoContatto.quando) / 86400000) : null,
    prossima,
    ticketAperti, ticketTotali: aperti.length, ticketRisolti: risolti.length,
    assistenze, ultimaAssistenza: assistenze[0] || null,
    promozioni,
    inviate, aperte, click,
    // Quanto è «vivo». Non è un punteggio predittivo: è un semaforo che
    // riassume tre segnali che si guarderebbero comunque a mano.
    temperatura: (() => {
      const recente = ultimoContatto && (ora - ultimoContatto.quando) < 30 * 86400000;
      const apre = inviate > 0 && aperte / inviate >= 0.4;
      if (ticketAperti.length >= 2) return { id: 'attenzione', label: 'Da guardare', color: 'DANGER', perche: `${ticketAperti.length} ticket ancora aperti` };
      if (recente && apre) return { id: 'caldo', label: 'Attivo', color: 'OK', perche: 'Sentito di recente e apre le email' };
      if (apre) return { id: 'tiepido', label: 'Reattivo', color: 'INFO', perche: 'Apre le email, ma non lo sentiamo da un po\'' };
      if (recente) return { id: 'tiepido', label: 'Seguito', color: 'INFO', perche: 'Contattato di recente' };
      return { id: 'freddo', label: 'Silenzioso', color: 'PLAN_FREE', perche: inviate ? 'Non apre le email e non lo sentiamo' : 'Nessun contatto finora' };
    })(),
  };
}

// Il diario per EPISODI: le righe che raccontano la stessa cosa diventano una
// scheda sola. Un invio con le sue aperture e i suoi click era tre righe
// sparse su tre giorni diversi; ora è una scheda che dice come è andata.
function hubEpisodi(eventi) {
  const per = {};
  const out = [];
  // Si va dal più vecchio al più recente, così l'evento «capostipite» esiste
  // già quando arriva il suo seguito.
  [...eventi].sort((a, b) => a.quando - b.quando).forEach(e => {
    const radice = HUB_ATT_SEGUITI[e.tipo];
    const chiave = (radice || e.tipo) + '|' + e.titolo;
    if (radice && per[chiave]) { per[chiave].seguiti.push(e); return; }
    if (radice) {
      // Il seguito è arrivato senza il suo capostipite (succede: la campagna
      // è più vecchia del contatto). Diventa lui la testa dell'episodio.
      const ep = { id: e.id, testa: e, seguiti: [], quando: e.quando };
      per[chiave] = ep; out.push(ep);
      return;
    }
    const ep = { id: e.id, testa: e, seguiti: [], quando: e.quando };
    per[chiave] = ep; out.push(ep);
  });
  // La scheda si data sull'ultima cosa successa: un'email aperta ieri è
  // «ieri», non «tre settimane fa quando è partita».
  out.forEach(ep => { ep.ultimo = ep.seguiti.length ? ep.seguiti[ep.seguiti.length - 1].quando : ep.testa.quando; });
  return out.sort((a, b) => b.ultimo - a.ultimo);
}

// Le note scritte a mano si aggiungono in testa e restano per la sessione.
function hubAggiungiAttivita(c, ev) {
  const chiave = c.key || (c.ref && c.ref.id) || c.nome;
  const lista = hubAttivita(c);
  HUB_ATT_CACHE[chiave] = [Object.assign({ id: chiave + '-m' + Date.now(), quando: new Date() }, ev), ...lista];
  return HUB_ATT_CACHE[chiave];
}

window.HUB_ATT_TIPI = HUB_ATT_TIPI;
window.HUB_ATT_GRUPPI = HUB_ATT_GRUPPI;
window.HUB_ATT_SEGUITI = HUB_ATT_SEGUITI;
window.hubAttivita = hubAttivita;
window.hubAggiungiAttivita = hubAggiungiAttivita;
window.hubSintesi = hubSintesi;
window.hubEpisodi = hubEpisodi;

// ═══════════════════════════════════════════════════════════════════════════
// 11 · LA LOGICA DEI RAMI E DELLE ATTESE
// ═══════════════════════════════════════════════════════════════════════════
//
// Un ramo di workflow non si sceglie solo per com'È un contatto, ma per quello
// che HA FATTO: ha aperto la mail, non ha cliccato entro tre giorni, ha aperto
// un ticket, è entrato in un elenco. Prima si potevano scrivere solo condizioni
// sulle proprietà, e con quelle un ramo «ha aperto la mail?» non si esprime.
//
// Una condizione di ramo è fatta di GRUPPI, e ogni gruppo di REGOLE. Dentro un
// gruppo le regole si legano con E oppure con O; fra i gruppi vale la stessa
// scelta, fatta a parte. Due livelli bastano per scrivere (A e B) oppure
// (C e D) — che è il 99% di quello che serve — e si continuano a leggere.

const HUB_WF_EVENTI = {
  mailAperta:   { label: 'ha aperto l\'email',        rif: 'mail',  icona: 'eye' },
  mailCliccata: { label: 'ha cliccato nell\'email',   rif: 'mail',  icona: 'cursorClick', conLink: true },
  mailRimbalzo: { label: 'ha fatto rimbalzare l\'email', rif: 'mail', icona: 'alertTriangle' },
  disiscritto:  { label: 'si è disiscritto',          rif: null,    icona: 'x' },
  smsCliccato:  { label: 'ha cliccato nell\'SMS',     rif: 'sms',   icona: 'cursorClick' },
  pushAperta:   { label: 'ha aperto la notifica',     rif: 'push',  icona: 'bell' },
  formInviato:  { label: 'ha compilato il form',      rif: 'form',  icona: 'formFill' },
  paginaVista:  { label: 'ha visitato la pagina',     rif: 'url',   icona: 'globe' },
  ticketAperto: { label: 'ha aperto un ticket',       rif: null,    icona: 'ticket' },
  chiamato:     { label: 'è stato chiamato',          rif: null,    icona: 'headsetFill' },
  ordine:       { label: 'ha fatto un ordine',        rif: null,    icona: 'receipt' },
  entrataElenco:{ label: 'è entrato nell\'elenco',    rif: 'elenco',icona: 'listFill' },
  propCambiata: { label: 'ha cambiato la proprietà',  rif: 'prop',  icona: 'tagFill' },
};

// Gli esiti del passo immediatamente precedente: sono l'altra domanda che un
// ramo fa spesso — «la mail è partita davvero?», «l'agente ha risposto?».
const HUB_WF_ESITI = {
  consegnata:  { label: 'il messaggio è stato consegnato' },
  rimbalzata:  { label: 'il messaggio è rimbalzato' },
  saltato:     { label: 'il passo è stato saltato (niente consenso)' },
  agenteOk:    { label: 'l\'agente ha prodotto una risposta' },
  agenteKo:    { label: 'l\'agente non ha concluso' },
  erroreTec:   { label: 'c\'è stato un errore tecnico' },
};

const HUB_UNITA = [
  { id: 'minuti', label: 'minuti' }, { id: 'ore', label: 'ore' },
  { id: 'giorni', label: 'giorni' }, { id: 'settimane', label: 'settimane' },
];
const HUB_GIORNI = [
  { id: 'lun', label: 'lunedì' }, { id: 'mar', label: 'martedì' }, { id: 'mer', label: 'mercoledì' },
  { id: 'gio', label: 'giovedì' }, { id: 'ven', label: 'venerdì' }, { id: 'sab', label: 'sabato' }, { id: 'dom', label: 'domenica' },
];

// I modi di aspettare. «Un ritardo» non è una cosa sola: c'è il ritardo fisso,
// l'appuntamento a una data, il «lunedì mattina» che serve per non far partire
// una campagna di sabato sera, e l'attesa di un evento con un tetto — che è la
// più utile di tutte, perché lega il tempo a quello che fa il contatto.
const HUB_ATTESA_MODI = {
  durata:    { label: 'Per un tempo fisso',      desc: 'Es. due giorni dopo il passo prima.', icona: 'hourglass' },
  data:      { label: 'Fino a una data',         desc: 'Un appuntamento preciso sul calendario.', icona: 'calendar' },
  giornoOra: { label: 'Fino a un giorno e ora',  desc: 'Il prossimo lunedì alle 9. Serve a non spedire di notte.', icona: 'clock' },
  evento:    { label: 'Finché non succede…',     desc: 'Aspetta che il contatto faccia qualcosa, con un tetto di tempo.', icona: 'target' },
  finestra:  { label: 'Solo in certe ore',       desc: 'Trattiene il passo fuori dalla finestra e lo rilascia dentro.', icona: 'sliders' },
};

function hubAttesaVuota() {
  return { modo: 'durata', n: 2, unita: 'giorni', data: null, giorno: 'lun', ora: '09:00',
    evento: { evento: 'mailAperta', rif: null, negato: false },
    tetto: { n: 3, unita: 'giorni' },
    finestra: { giorni: ['lun', 'mar', 'mer', 'gio', 'ven'], da: '09:00', a: '18:00' } };
}

// Un'attesa scritta a mano nei mock dichiara solo il modo che le serve:
// `{modo:'durata', n:2}` non ha né tetto né finestra. Chiunque la legga deve
// poter contare su tutti i campi — altrimenti basta cambiare modo nell'editor
// per leggere `a.tetto.n` su un `undefined` e portarsi giù la pagina.
// Il completamento sta QUI e non in ogni lettore: uno solo si dimentica.
function hubAttesaPiena(a) {
  const base = hubAttesaVuota();
  if (!a) return base;
  return Object.assign(base, a, {
    evento:   Object.assign({}, base.evento, a.evento || {}),
    tetto:    Object.assign({}, base.tetto, a.tetto || {}),
    finestra: Object.assign({}, base.finestra, a.finestra || {}),
  });
}

// L'attesa scritta come la si direbbe: è il testo che finisce sulla scatola nel
// canvas, e deve bastare a capire il passo senza aprirlo.
function hubDescriviAttesa(attesa) {
  if (!attesa) return '—';
  const a = hubAttesaPiena(attesa);
  const u = (n, unita) => `${n} ${(HUB_UNITA.find(x => x.id === unita) || {}).label || unita}`;
  switch (a.modo) {
    case 'durata':    return `Aspetta ${u(a.n, a.unita)}`;
    case 'data':      return a.data ? `Aspetta fino al ${fmtDate(a.data)}` : 'Aspetta fino a una data da scegliere';
    case 'giornoOra': return `Aspetta il prossimo ${(HUB_GIORNI.find(g => g.id === a.giorno) || {}).label} alle ${a.ora}`;
    case 'evento':    return `Aspetta finché ${hubDescriviEvento(a.evento)} · al massimo ${u(a.tetto.n, a.tetto.unita)}`;
    case 'finestra':  return `Rilascia ${a.finestra.giorni.length === 5 ? 'nei giorni feriali' : a.finestra.giorni.join('/')} fra le ${a.finestra.da} e le ${a.finestra.a}`;
    default: return '—';
  }
}

// L'id non è il nome. «ha aperto l'email ML-011» è vero e non dice niente: chi
// legge il canvas conosce «Report mensile ai titolari», non il codice.
function hubNomeRif(genere, id) {
  if (!id) return null;
  const cat = { mail: HUB_MAIL, sms: HUB_SMS, push: HUB_PUSH, form: HUB_FORM, elenco: HUB_ELENCHI }[genere];
  if (cat) { const x = cat.find(v => v.id === id); return x ? x.nome : id; }
  if (genere === 'prop') { const p = HUB_PROP[id]; return p ? p.label : id; }
  return id;
}

function hubDescriviEvento(e) {
  if (!e) return '—';
  const d = HUB_WF_EVENTI[e.evento];
  if (!d) return '—';
  let s = (e.negato ? 'NON ' : '') + d.label;
  if (e.rif) s += ' «' + hubNomeRif(d.rif, e.rif) + '»';
  if (e.link) s += ' sul link ' + e.link;
  if (e.finestra && e.finestra.n) s += ` entro ${e.finestra.n} ${(HUB_UNITA.find(x => x.id === e.finestra.unita) || {}).label || e.finestra.unita}`;
  return s;
}

// Una regola sola, in italiano.
function hubDescriviRegola(r) {
  if (!r) return '—';
  if (r.genere === 'proprieta') return hubDescriviFiltro(r);
  if (r.genere === 'evento')    return hubDescriviEvento(r);
  if (r.genere === 'elenco') {
    const e = HUB_ELENCHI.find(x => x.id === r.elencoId);
    return (r.dentro === false ? 'non è ' : 'è ') + 'nell\'elenco «' + (e ? e.nome : '—') + '»';
  }
  if (r.genere === 'esito') return (HUB_WF_ESITI[r.esito] || {}).label || '—';
  return '—';
}

// La condizione intera. Con un gruppo solo si legge come un elenco di regole;
// con più gruppi si mettono le parentesi, perché senza non si capisce più.
function hubDescriviQuando(q) {
  if (!q || q.tipo === 'altrimenti') return 'Tutti quelli che non rientrano nei rami sopra';
  const gruppi = (q.gruppi || []).filter(g => (g.regole || []).length);
  if (!gruppi.length) return 'Nessuna condizione — ci passano tutti';
  const frasi = gruppi.map(g => (g.regole || []).map(hubDescriviRegola)
    .join(g.congiunzione === 'O' ? ' oppure ' : ' e '));
  if (frasi.length === 1) return frasi[0];
  return frasi.map(f => '(' + f + ')').join(q.congiunzione === 'O' ? ' oppure ' : ' e ');
}

function hubQuandoVuoto() {
  return { tipo: 'regole', congiunzione: 'E', gruppi: [{ id: 'g1', congiunzione: 'E', regole: [] }] };
}
function hubRegolaVuota(genere) {
  if (genere === 'evento')  return { genere: 'evento', evento: 'mailAperta', rif: null, negato: false, finestra: { n: 3, unita: 'giorni' } };
  if (genere === 'elenco')  return { genere: 'elenco', elencoId: (HUB_ELENCHI[0] || {}).id, dentro: true };
  if (genere === 'esito')   return { genere: 'esito', esito: 'consegnata' };
  return { genere: 'proprieta', prop: 'ciclo', op: 'unoDi', valore: [] };
}

// Quante regole ha in tutto una condizione: serve al canvas per dire se un ramo
// è configurato o è ancora vuoto.
function hubConteggioRegole(q) {
  return !q || q.tipo === 'altrimenti' ? 0 : (q.gruppi || []).reduce((n, g) => n + (g.regole || []).length, 0);
}

// I rami vecchi avevano `criteri` + `congiunzione` e sapevano parlare solo di
// proprietà. Si leggono ancora: qui diventano un `quando` con un gruppo solo.
// Vale la pena tenerlo anche a mock aggiornati — è la garanzia che un ramo
// scritto prima non sparisca dal canvas senza dire niente.
function hubRamoQuando(r) {
  if (!r) return hubQuandoVuoto();
  if (r.quando) return r.quando;
  if (r.altrimenti) return { tipo: 'altrimenti', congiunzione: 'E', gruppi: [] };
  return { tipo: 'regole', congiunzione: 'E', gruppi: [{ id: 'g1', congiunzione: r.congiunzione || 'E',
    regole: (r.criteri || []).map(c => Object.assign({ genere: 'proprieta' }, c)) }] };
}

// L'attesa scritta nei mock come stringa («2 giorni») resta leggibile: si
// prova a capirla, e se non ci si riesce si mostra com'è.
function hubNodoAttesa(n) {
  if (n && n.attesa) return hubAttesaPiena(n.attesa);
  const m = /^\s*(\d+)\s*(minut|or|giorn|settiman)/i.exec((n && n.testo) || '');
  if (!m) return null;
  const u = { minut: 'minuti', or: 'ore', giorn: 'giorni', settiman: 'settimane' }[m[2].toLowerCase()];
  return Object.assign(hubAttesaVuota(), { modo: 'durata', n: parseInt(m[1], 10), unita: u });
}

window.HUB_WF_EVENTI = HUB_WF_EVENTI;
window.HUB_WF_ESITI = HUB_WF_ESITI;
window.HUB_UNITA = HUB_UNITA;
window.HUB_GIORNI = HUB_GIORNI;
window.HUB_ATTESA_MODI = HUB_ATTESA_MODI;
window.hubAttesaVuota = hubAttesaVuota;
window.hubAttesaPiena = hubAttesaPiena;
window.hubDescriviAttesa = hubDescriviAttesa;
window.hubDescriviEvento = hubDescriviEvento;
window.hubDescriviRegola = hubDescriviRegola;
window.hubDescriviQuando = hubDescriviQuando;
window.hubQuandoVuoto = hubQuandoVuoto;
window.hubRegolaVuota = hubRegolaVuota;
window.hubConteggioRegole = hubConteggioRegole;
window.hubRamoQuando = hubRamoQuando;
window.hubNomeRif = hubNomeRif;
window.hubNodoAttesa = hubNodoAttesa;

// ─── Il compleanno come innesco ─────────────────────────────────────────────
//
// È la ricorrenza più tipica di un CRM e l'unica in cui il dato che fa partire
// l'automazione è un dato personale delicato. Da qui due regole che non sono
// di stile:
//   · la data di nascita fa da SVEGLIA e basta — non entra mai nella scelta di
//     che cosa mandare, perché profilare qualcuno per età è un'altra cosa dal
//     ricordarsi di fargli gli auguri;
//   · chi è in regime protettivo (minorenne: l'app si apre a 14 anni) resta
//     fuori a prescindere dal consenso, che a quell'età non basta da solo.
// Il consenso vero si guarda al momento dell'invio, come per ogni altro passo:
// qui si conta chi POTREBBE ricevere, non si decide chi riceve.

function hubEta(nascita) {
  const d = nascita instanceof Date ? nascita : (nascita ? new Date(nascita) : null);
  if (!d || isNaN(d)) return null;
  const oggi = new Date();
  let a = oggi.getFullYear() - d.getFullYear();
  const m = oggi.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && oggi.getDate() < d.getDate())) a--;
  return a;
}
const hubRegimeProtettivo = (c) => {
  const e = hubEta(hubLeggi(c, 'nascita'));
  return e != null && e < 18;
};
const HUB_CONSENSI_MKT = ['consensoMail', 'consensoSms', 'consensoPush'];
const hubHaConsensoMkt = (c) => HUB_CONSENSI_MKT.some(k => hubLeggi(c, k) === true);

// Un contatto è dentro un elenco ATTIVO se passa i suoi filtri: è la stessa
// definizione che usa la pagina Elenchi. Gli statici hanno membri importati,
// che nel prototipo non esistono come righe: si dicono zero invece di
// inventarsi un numero.
function hubDentroElenco(c, id) {
  const e = HUB_ELENCHI.find(x => x.id === id);
  if (!e || e.tipo === 'statico') return false;
  return hubPassa(c, e.includi) && !(e.escludi && e.escludi.length && hubPassa(c, e.escludi));
}

// Valutare una condizione SU UN CONTATTO. Vale per le regole che parlano di
// com'è fatto il contatto — proprietà ed elenchi: gli eventi e gli esiti sono
// fatti di un percorso già iniziato e su un innesco non hanno senso, quindi
// non filtrano (passano tutti) invece di far sparire tutti.
function hubValutaRegolaContatto(c, r) {
  if (!r) return true;
  if (r.genere === 'proprieta') return hubValuta(c, r);
  if (r.genere === 'elenco') return r.dentro === false ? !hubDentroElenco(c, r.elencoId) : hubDentroElenco(c, r.elencoId);
  return true;
}
function hubValutaQuandoContatto(c, q) {
  const gruppi = ((q && q.gruppi) || []).filter(g => (g.regole || []).length);
  if (!gruppi.length) return true;
  const dentro = (g) => (g.congiunzione === 'O'
    ? g.regole.some(r => hubValutaRegolaContatto(c, r))
    : g.regole.every(r => hubValutaRegolaContatto(c, r)));
  return (q.congiunzione === 'O') ? gruppi.some(dentro) : gruppi.every(dentro);
}

function hubCompleannoVuoto() {
  // `tipi` nasce VUOTO di proposito: un compleanno mandato a un prospect
  // commerciale non è una variante, è un destinatario sbagliato. Chi costruisce
  // l'automazione dichiara il pubblico, e non esiste un «tutti» di default.
  return { anticipo: 0, tipi: [], quando: hubQuandoVuoto() };
}
const hubCompleannoPieno = (x) => Object.assign(hubCompleannoVuoto(), x || {});

function hubDescriviCompleanno(cfg) {
  const c = hubCompleannoPieno(cfg);
  const n = parseInt(c.anticipo, 10) || 0;
  const q = n > 0 ? (n === 1 ? '1 giorno prima' : n + ' giorni prima') : 'il giorno stesso';
  return 'Compleanno del contatto · ' + q;
}

// Quanti sono, dei contatti scelti, quelli che il compleanno lo hanno davvero.
// Serve PRIMA di accendere: un'automazione che gira su 4.000 contatti e ne
// tocca 30 è una cosa da sapere adesso, non dal primo report.
function hubContaCompleanno(cfg) {
  const c = hubCompleannoPieno(cfg);
  if (!c.tipi.length) return null;
  const righe = (typeof CONTATTI !== 'undefined' ? CONTATTI : []);
  const dentro = righe.filter(x => c.tipi.indexOf(x.tipo) !== -1 && hubValutaQuandoContatto(x, c.quando));
  const conNascita = dentro.filter(x => !hubVuoto(hubLeggi(x, 'nascita')));
  const protetti = conNascita.filter(hubRegimeProtettivo);
  const raggiungibili = conNascita.filter(x => !hubRegimeProtettivo(x) && hubHaConsensoMkt(x));
  return {
    dentro: dentro.length,
    conNascita: conNascita.length,
    protetti: protetti.length,
    raggiungibili: raggiungibili.length,
  };
}

window.hubEta = hubEta;
window.hubRegimeProtettivo = hubRegimeProtettivo;
window.hubHaConsensoMkt = hubHaConsensoMkt;
window.hubDentroElenco = hubDentroElenco;
window.hubValutaRegolaContatto = hubValutaRegolaContatto;
window.hubValutaQuandoContatto = hubValutaQuandoContatto;
window.hubCompleannoVuoto = hubCompleannoVuoto;
window.hubCompleannoPieno = hubCompleannoPieno;
window.hubDescriviCompleanno = hubDescriviCompleanno;
window.hubContaCompleanno = hubContaCompleanno;

// ═══════════════════════════════════════════════════════════════════════════
// 12 · L'AMBIENTE DEGLI AGENTI
// ═══════════════════════════════════════════════════════════════════════════
//
// Un agente da solo è un impiegato bravo che non parla con nessuno. Il salto
// non è farne di più: è dargli un posto dove lavorare insieme agli altri.
//
// La tentazione facile sarebbe far chiamare un agente dall'altro. Non si fa,
// e per un motivo pratico: cinque agenti che si chiamano a vicenda sono venti
// collegamenti da tenere aggiornati, e il primo che cambia formato rompe tre
// catene in silenzio. Qui gli agenti NON si chiamano. Ci sono quattro
// meccanismi, e sono la parte inventata di questa pagina:
//
//  1 · LA LAVAGNA — un agente non manda niente a nessuno: SCRIVE una nota su
//      un argomento. Chi è iscritto a quell'argomento si sveglia. Aggiungere
//      un agente è iscriverlo, non ricablare gli altri.
//
//  2 · IL PATTO — ogni consegna dichiara che cosa passa e che cosa si aspetta
//      indietro. Se la nota non ha i campi promessi la consegna FALLISCE e si
//      vede; senza patto passerebbe una nota mezza vuota e il secondo agente
//      lavorerebbe su niente, producendo una risposta plausibile e sbagliata.
//
//  3 · IL SECONDO PARERE — prima di scrivere nel CRM o di far uscire qualcosa
//      verso un cliente, un secondo agente deve essere d'accordo. Se non lo è,
//      non decide la maggioranza: sale a una persona.
//
//  4 · IL TETTO — ogni catena ha un budget al giorno e una profondità massima.
//      È la differenza fra un ambiente e un ciclo infinito che costa.
//
// E poi la CODA: i compiti non si assegnano tutti subito. Stanno in una coda
// con una priorità, un agente ne prende uno per volta, e se sbaglia due volte
// il compito passa a una persona invece di essere ritentato per sempre.

const HUB_AMB_ARGOMENTI = [
  { id: 'rischio',    label: 'Locali a rischio',    icona: 'alertTriangle', color: 'DANGER',
    desc: 'Segnali di abbandono: ordini fermi, ticket in salita, servizi spenti.' },
  { id: 'qualifica',  label: 'Lead da qualificare', icona: 'target', color: 'INFO',
    desc: 'Lead nuovi con abbastanza contesto per stimare il piano giusto.' },
  { id: 'materiali',  label: 'Materiali pronti',    icona: 'pencil', color: 'HUB_MAGENTA',
    desc: 'Oggetti, testi e varianti scritti e in attesa di revisione.' },
  { id: 'assistenza', label: 'Assistenza',          icona: 'lifebuoy', color: 'TEAL',
    desc: 'Ticket smistati, risposte proposte, casi che tornano.' },
  { id: 'anomalie',   label: 'Anomalie',            icona: 'bolt', color: 'WARN',
    desc: 'Numeri che non tornano: quote, costi, code, tempi di risposta.' },
];

const HUB_AMB_RUOLI = {
  esecutore: { label: 'Esegue',      desc: 'Fa il lavoro e scrive la nota.',            color: 'HUB_VIOLA' },
  revisore:  { label: 'Rivede',      desc: 'Deve essere d\'accordo prima che esca.',    color: 'INFO' },
  arbitro:   { label: 'Decide',      desc: 'Sceglie fra proposte in disaccordo.',       color: 'WARN' },
  persona:   { label: 'Una persona', desc: 'Il punto in cui l\'ambiente si ferma e chiede.', color: 'OK' },
};

// Le catene: chi passa a chi, su quale argomento, con quale patto.
const HUB_AMB_CATENE = [
  { id: 'CT-001', nome: 'Dal segnale alla telefonata', stato: 'attiva', argomento: 'rischio',
    descrizione: 'Quando un locale mostra segnali di abbandono, l\'ambiente prepara la chiamata invece di aprire un ticket generico.',
    girati: 214, conclusi: 186, aPersona: 22, costoGiorno: 4.20, tetto: 12, profondita: 3,
    tappe: [
      { agente: 'AG-005', ruolo: 'esecutore', fa: 'Trova i locali a rischio e scrive perché',
        patto: ['locale', 'motivo', 'gravità 1-5'] },
      { agente: 'AG-004', ruolo: 'esecutore', fa: 'Aggiunge il contesto commerciale: piano, storico, margine',
        patto: ['piano attuale', 'valore annuo', 'occasione'] },
      { agente: 'AG-003', ruolo: 'esecutore', fa: 'Scrive la traccia della telefonata e due alternative',
        patto: ['apertura', 'obiezioni previste', 'offerta'] },
      { agente: null, ruolo: 'persona', fa: 'Il commerciale di zona conferma e chiama', patto: [] },
    ] },
  { id: 'CT-002', nome: 'Lead nuovo, piano proposto', stato: 'attiva', argomento: 'qualifica',
    descrizione: 'Il lead entra, viene stimato, e la proposta passa da una revisione prima di toccare il CRM.',
    girati: 640, conclusi: 601, aPersona: 14, costoGiorno: 6.80, tetto: 15, profondita: 2,
    tappe: [
      { agente: 'AG-004', ruolo: 'esecutore', fa: 'Stima coperti e scontrino dal sito e dalle recensioni',
        patto: ['coperti', 'scontrino', 'confidenza'] },
      { agente: 'AG-005', ruolo: 'revisore', fa: 'Controlla la stima contro i locali simili che già abbiamo',
        patto: ['d\'accordo sì/no', 'scarto rispetto ai simili'] },
      { agente: null, ruolo: 'persona', fa: 'Se i due non concordano, decide il commerciale', patto: [] },
    ] },
  { id: 'CT-003', nome: 'Campagna scritta e rivista', stato: 'in prova', argomento: 'materiali',
    descrizione: 'Tre varianti scritte, una scelta con i numeri dello storico, e il testo non esce senza una persona.',
    // 71 conclusi + 18 saliti = 89 giri: sono esiti alternativi, e una catena
    // in prova è proprio quella che sale spesso.
    girati: 89, conclusi: 71, aPersona: 18, costoGiorno: 2.10, tetto: 8, profondita: 2,
    tappe: [
      { agente: 'AG-003', ruolo: 'esecutore', fa: 'Scrive oggetto e anteprima in tre varianti', patto: ['3 varianti', 'per chi'] },
      { agente: 'AG-002', ruolo: 'arbitro', fa: 'Sceglie la variante più promettente sullo storico', patto: ['variante scelta', 'perché'] },
      { agente: null, ruolo: 'persona', fa: 'Marketing approva prima dell\'invio', patto: [] },
    ] },
  { id: 'CT-004', nome: 'Ticket smistato e risposto', stato: 'ferma', argomento: 'assistenza',
    descrizione: 'Ferma da quando la chiave del fornitore ha superato la quota: i compiti si accumulano in coda.',
    girati: 1902, conclusi: 1743, aPersona: 159, costoGiorno: 0, tetto: 20, profondita: 2,
    tappe: [
      { agente: 'AG-001', ruolo: 'esecutore', fa: 'Legge il ticket, lo assegna e propone una risposta', patto: ['reparto', 'urgenza', 'bozza'] },
      { agente: null, ruolo: 'persona', fa: 'Chi è di turno manda o riscrive', patto: [] },
    ] },
];

// Le note sulla lavagna: quello che gli agenti si sono detti, in ordine.
const HUB_AMB_NOTE = [
  { id: 'NT-011', argomento: 'rischio', agente: 'AG-005', quando: new Date(Date.now() - 900000),
    titolo: '4 locali a rischio questa mattina',
    corpo: 'Osteria del Borgo non ordina da 21 giorni; Pizzeria Aurora ha aperto 3 ticket in una settimana; altri 2 hanno spento il delivery.',
    campi: { gravità: '4 su 5', locali: 4 }, letta: ['AG-004'], catena: 'CT-001' },
  { id: 'NT-010', argomento: 'rischio', agente: 'AG-004', quando: new Date(Date.now() - 780000),
    titolo: 'Contesto commerciale dei 4',
    corpo: 'Due sono Plus da oltre due anni: valore annuo sopra i €4.000 ciascuno. Uno è in prova e non è mai partito.',
    campi: { 'valore a rischio': '€11.400', occasione: 'rinnovo fra 40 giorni' }, letta: ['AG-003'], catena: 'CT-001' },
  { id: 'NT-009', argomento: 'materiali', agente: 'AG-003', quando: new Date(Date.now() - 690000),
    titolo: 'Traccia telefonata · 3 aperture',
    corpo: 'Apertura consigliata: partire dal calo ordini senza nominarlo come problema. Due alternative se risponde il titolare o se risponde il personale di sala.',
    campi: { varianti: 3, tono: 'diretto, non allarmista' }, letta: [], catena: 'CT-001' },
  { id: 'NT-008', argomento: 'anomalie', agente: 'AG-001', quando: new Date(Date.now() - 3600000),
    titolo: 'Quota del fornitore superata',
    corpo: 'Le ultime 12 esecuzioni non sono partite. La catena «Ticket smistato» è ferma e la coda sta crescendo.',
    // «In coda» dice lo stesso numero della scheda Coda — una fonte per ogni
    // fatto. E letta è vuota: ad Anomalie non è iscritta nessuna catena, e il
    // fatto che nessuno si svegli è quello che rende l'allarme un allarme.
    campi: { 'esecuzioni perse': 12, 'in coda': 2 }, letta: [], catena: 'CT-004', allarme: true },
  { id: 'NT-007', argomento: 'qualifica', agente: 'AG-004', quando: new Date(Date.now() - 5400000),
    titolo: 'Trattoria da Nino · stima',
    corpo: '60 coperti stimati, scontrino medio €28. Il sito ha menu e prenotazioni ma nessun delivery.',
    campi: { coperti: 60, scontrino: '€28', confidenza: 'media' }, letta: ['AG-005'], catena: 'CT-002' },
  { id: 'NT-006', argomento: 'qualifica', agente: 'AG-005', quando: new Date(Date.now() - 5100000),
    titolo: 'Non sono d\'accordo sulla stima',
    corpo: 'I locali simili per zona e coperti stanno sotto i €22 di scontrino. La stima di €28 mi sembra alta del 25%: propongo Standard e non Plus.',
    campi: { 'd\'accordo': 'no', scarto: '+25%' }, letta: [], catena: 'CT-002', disaccordo: true },
];

// La coda: i compiti che aspettano, quelli presi, quelli finiti a una persona.
const HUB_AMB_COMPITI = [
  { id: 'CP-031', titolo: 'Ticket #4821 · cassa non chiude', catena: 'CT-004', stato: 'coda', priorita: 'alta',
    creato: new Date(Date.now() - 3300000), agente: null, tentativi: 0, nota: 'In attesa: la catena è ferma.' },
  { id: 'CP-030', titolo: 'Ticket #4820 · stampante comande', catena: 'CT-004', stato: 'coda', priorita: 'media',
    creato: new Date(Date.now() - 3200000), agente: null, tentativi: 0, nota: 'In attesa: la catena è ferma.' },
  { id: 'CP-029', titolo: 'Osteria del Borgo · preparare la chiamata', catena: 'CT-001', stato: 'preso', priorita: 'alta',
    creato: new Date(Date.now() - 900000), agente: 'AG-003', tentativi: 1, nota: 'Sta scrivendo la traccia.' },
  { id: 'CP-028', titolo: 'Trattoria da Nino · piano consigliato', catena: 'CT-002', stato: 'persona', priorita: 'alta',
    creato: new Date(Date.now() - 5400000), agente: null, tentativi: 2, nota: 'I due agenti non concordano: Plus contro Standard.' },
  { id: 'CP-027', titolo: 'Pizzeria Aurora · contesto commerciale', catena: 'CT-001', stato: 'fatto', priorita: 'media',
    creato: new Date(Date.now() - 1500000), agente: 'AG-004', tentativi: 1, nota: 'Nota NT-010 sulla lavagna.' },
  { id: 'CP-026', titolo: 'Report settimanale · bozza', catena: 'CT-003', stato: 'fatto', priorita: 'bassa',
    creato: new Date(Date.now() - 172800000), agente: 'AG-002', tentativi: 1, nota: 'Consegnato lunedì.' },
];

const HUB_AMB_STATI_COMPITO = {
  coda:    { label: 'In coda',      color: 'PLAN_FREE', icona: 'hourglass' },
  preso:   { label: 'Preso',        color: 'INFO',      icona: 'play' },
  fatto:   { label: 'Fatto',        color: 'OK',        icona: 'check' },
  persona: { label: 'A una persona', color: 'WARN',     icona: 'user' },
};

// Il registro: che cosa è successo davvero, in ordine di tempo. Un ambiente
// senza registro è un gruppo di agenti che si accusano a vicenda.
const HUB_AMB_TRACCIA = [
  { t: new Date(Date.now() - 900000),  chi: 'AG-005', cosa: 'scrive',   dettaglio: 'Nota «4 locali a rischio questa mattina» su Locali a rischio', catena: 'CT-001' },
  { t: new Date(Date.now() - 880000),  chi: 'AG-004', cosa: 'sveglia',  dettaglio: 'Iscritto a Locali a rischio — si sveglia per la nota NT-011', catena: 'CT-001' },
  { t: new Date(Date.now() - 800000),  chi: 'AG-004', cosa: 'legge',    dettaglio: 'Contatti, Ordini, Fatturazione', catena: 'CT-001' },
  { t: new Date(Date.now() - 780000),  chi: 'AG-004', cosa: 'scrive',   dettaglio: 'Nota «Contesto commerciale dei 4»', catena: 'CT-001' },
  { t: new Date(Date.now() - 700000),  chi: 'AG-003', cosa: 'sveglia',  dettaglio: 'Consegna accettata: il patto chiedeva piano, valore, occasione — ci sono tutti', catena: 'CT-001' },
  { t: new Date(Date.now() - 690000),  chi: 'AG-003', cosa: 'scrive',   dettaglio: 'Nota «Traccia telefonata · 3 aperture»', catena: 'CT-001' },
  { t: new Date(Date.now() - 660000),  chi: null,     cosa: 'persona',  dettaglio: 'La catena si ferma: tocca al commerciale di zona confermare', catena: 'CT-001' },
  { t: new Date(Date.now() - 5100000), chi: 'AG-005', cosa: 'disaccordo', dettaglio: 'Non conferma la stima di AG-004: scarto del 25% sui locali simili', catena: 'CT-002' },
  { t: new Date(Date.now() - 5080000), chi: null,     cosa: 'persona',  dettaglio: 'Nessun arbitro configurato: il compito CP-028 sale a una persona', catena: 'CT-002' },
  { t: new Date(Date.now() - 3600000), chi: 'AG-001', cosa: 'errore',   dettaglio: 'Quota del fornitore superata — catena ferma, 2 compiti in coda', catena: 'CT-004' },
];

const HUB_AMB_AZIONI = {
  scrive:     { label: 'scrive',        icona: 'pencil',        color: 'HUB_VIOLA' },
  sveglia:    { label: 'si sveglia',    icona: 'bolt',          color: 'INFO' },
  legge:      { label: 'legge',         icona: 'eye',           color: 'PLAN_FREE' },
  persona:    { label: 'a una persona', icona: 'user',          color: 'WARN' },
  disaccordo: { label: 'non è d\'accordo', icona: 'alertTriangle', color: 'WARN' },
  errore:     { label: 'errore',        icona: 'x',             color: 'DANGER' },
};

const HUB_AMB_STATI_CATENA = {
  attiva:    { label: 'Attiva',   color: 'OK' },
  'in prova':{ label: 'In prova', color: 'INFO' },
  ferma:     { label: 'Ferma',    color: 'DANGER' },
};

// Le regole dell'ambiente: valgono per tutte le catene, e sono il motivo per
// cui un ambiente si può lasciare acceso di notte.
const HUB_AMB_GUARDIE = [
  { id: 'scritture', label: 'Niente scritture sul CRM senza una persona', acceso: true,
    desc: 'Gli agenti propongono; la proprietà del contatto la cambia qualcuno che se ne prende la responsabilità.' },
  { id: 'uscita',    label: 'Niente messaggi al cliente senza approvazione', acceso: true,
    desc: 'Un agente può scrivere una mail, non spedirla.' },
  { id: 'profondita',label: 'Al massimo 3 passaggi per catena', acceso: true,
    desc: 'Oltre il terzo passaggio l\'ambiente si ferma: è quasi sempre un giro su sé stesso.' },
  { id: 'tetto',     label: 'Tetto di spesa giornaliero per catena', acceso: true,
    desc: 'Raggiunto il tetto la catena si mette in pausa e lo dice, invece di continuare a costare.' },
  { id: 'silenzio',  label: 'Segnala le catene mute da 24 ore', acceso: false,
    desc: 'Una catena che non produce niente è rotta o inutile: in entrambi i casi va guardata.' },
];

window.HUB_AMB_ARGOMENTI = HUB_AMB_ARGOMENTI;
window.HUB_AMB_RUOLI = HUB_AMB_RUOLI;
window.HUB_AMB_CATENE = HUB_AMB_CATENE;
window.HUB_AMB_NOTE = HUB_AMB_NOTE;
window.HUB_AMB_COMPITI = HUB_AMB_COMPITI;
window.HUB_AMB_STATI_COMPITO = HUB_AMB_STATI_COMPITO;
window.HUB_AMB_TRACCIA = HUB_AMB_TRACCIA;
window.HUB_AMB_AZIONI = HUB_AMB_AZIONI;
window.HUB_AMB_STATI_CATENA = HUB_AMB_STATI_CATENA;
window.HUB_AMB_GUARDIE = HUB_AMB_GUARDIE;
