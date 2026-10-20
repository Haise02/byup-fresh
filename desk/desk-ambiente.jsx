// Desk · Ambiente — il posto dove il team di byup lavora insieme.
//
// Prima il team parlava su un'app, teneva le attività su un'altra e faceva le
// riunioni su una terza; il CRM, cioè il motivo per cui tutti e tre esistono,
// stava in una quarta. Ambiente mette le tre cose dentro Desk, in versione
// ristretta: solo quello che un team di una decina di persone usa davvero.
//
//   · dai software di CHAT  — canali, messaggi diretti, thread, menzioni,
//                             reazioni, messaggi fissati, file, huddle;
//   · dai software di ATTIVITÀ — attività con stato, assegnatari, scadenza,
//                             priorità e checklist, in lista o in bacheca;
//   · dai software di RIUNIONE — agenda della settimana, riunione video con
//                             microfono, camera, schermo, mano alzata e chat.
//
// E una cosa che fuori da Desk non si può fare: un messaggio, un'attività o una
// riunione si COLLEGANO a un contatto del CRM, e da lì si apre la sua scheda.
// Un messaggio diventa un'attività con un gesto, senza ricopiarlo.
//
// È un prototipo: niente si salva e niente parte davvero. Lo stato vive in un
// piccolo store di modulo (DK_STORE) e non nella pagina, perché il pulsante
// della barra laterale deve contare i non letti anche quando Ambiente è chiuso,
// e un messaggio scritto non deve sparire cambiando sezione.
//
// Nomi: tutto quello che sta al primo livello comincia con dk/Dk/DK_. Gli script
// della pagina condividono lo stesso spazio globale, e un omonimo con un altro
// file è un errore che il controllo statico non perdona.

const { useState: useStateDk, useEffect: useEffectDk, useRef: useRefDk, useMemo: useMemoDk } = React;

// ═══════════════════════════════════════════════════════════════════════════
// Il tempo — tutto è relativo ad adesso, così la demo non invecchia
// ═══════════════════════════════════════════════════════════════════════════
const DK_ORA = Date.now();
// Minuti fa (o fra, se negativo), arrotondati ai cinque per avere orari puliti
// nelle riunioni; i messaggi restano al minuto.
const dkFa = (min) => new Date(DK_ORA - min * 60000);
const dkTra5 = (min) => { const d = new Date(DK_ORA + min * 60000); d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0); return d; };
const dkGiorno = (giorni, h, m) => { const d = new Date(DK_ORA); d.setDate(d.getDate() + giorni); d.setHours(h, m || 0, 0, 0); return d; };
const dkStessoGiorno = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dkOra = (d) => d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
function dkEtichettaGiorno(d) {
  const oggi = new Date(DK_ORA);
  const ieri = new Date(DK_ORA); ieri.setDate(ieri.getDate() - 1);
  const domani = new Date(DK_ORA); domani.setDate(domani.getDate() + 1);
  if (dkStessoGiorno(d, oggi)) return 'Oggi';
  if (dkStessoGiorno(d, ieri)) return 'Ieri';
  if (dkStessoGiorno(d, domani)) return 'Domani';
  const s = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function dkFaQuanto(d) {
  const min = Math.round((DK_ORA - d.getTime()) / 60000);
  if (min < 1) return 'adesso';
  if (min < 60) return min + ' min fa';
  const h = Math.floor(min / 60);
  if (h < 24) return h + ' h fa';
  return dkEtichettaGiorno(d).toLowerCase();
}
// La scadenza dice sempre la cosa che serve: se è passata, se è oggi, se è vicina.
function dkScadenza(d) {
  if (!d) return { testo: 'Senza scadenza', tono: 'muto' };
  const oggi = new Date(DK_ORA); oggi.setHours(0, 0, 0, 0);
  const g = new Date(d); g.setHours(0, 0, 0, 0);
  const diff = Math.round((g - oggi) / 86400000);
  if (diff < 0) return { testo: diff === -1 ? 'In ritardo · ieri' : 'In ritardo · ' + (-diff) + ' giorni', tono: 'ritardo' };
  if (diff === 0) return { testo: 'Oggi', tono: 'oggi' };
  if (diff === 1) return { testo: 'Domani', tono: 'vicina' };
  return { testo: d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }), tono: diff <= 3 ? 'vicina' : 'normale' };
}

// ═══════════════════════════════════════════════════════════════════════════
// Le persone — il team è TEAM di admin-data, una fonte sola
// ═══════════════════════════════════════════════════════════════════════════
const DK_PRESENZE = {
  online:   { label: 'Disponibile',    colore: '#16A34A' },
  riunione: { label: 'In riunione',    colore: '#C2710C' },
  occupato: { label: 'Non disturbare', colore: '#DC2626' },
  assente:  { label: 'Assente',        colore: '#B4B4BA' },
};
// Lo stato di ciascuno nel mock. Laura è «in riunione» perché la riunione del
// lancio è in corso adesso, ed è lei che la tiene: le due cose si devono dire.
const DK_PRESENZA_DI = {
  admin0: 'online', admin1: 'riunione', admin2: 'assente', support1: 'online', support2: 'online',
  mkt1: 'riunione', mkt2: 'assente', mkt3: 'assente', support3: 'occupato',
};
const DK_NOTA_DI = {
  admin1: 'Allineamento lancio fino alle ' + dkOra(dkTra5(35)),
  admin2: 'In ferie fino a lunedì',
  support3: 'Sulle chiamate, scrivetemi qui',
  mkt1: 'Allineamento lancio',
};
let DK_PERSONE_CACHE = null;
function dkPersone() {
  if (DK_PERSONE_CACHE) return DK_PERSONE_CACHE;
  const team = (typeof TEAM !== 'undefined' ? TEAM : []).filter(t => t.attivo);
  DK_PERSONE_CACHE = team.map(t => ({
    id: t.id,
    nome: t.isYou ? (t.nomeCompleto || 'Tu') : t.nome,
    ini: t.isYou ? (t.nomeCompleto || 'Tu').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() : t.avatar,
    bg: t.avatarBg,
    ruolo: typeof admLabelRuolo === 'function' ? admLabelRuolo(t.ruolo) : t.ruolo,
    io: !!t.isYou,
    nota: DK_NOTA_DI[t.id] || '',
  }));
  return DK_PERSONE_CACHE;
}
const DK_IO = 'admin0';
const dkPersona = (id) => dkPersone().find(p => p.id === id) || null;
const dkAgente = (id) => (typeof HUB_AGENTI !== 'undefined' ? HUB_AGENTI : []).find(a => a.id === id) || null;
const dkNome = (id) => { const p = dkPersona(id); if (p) return p.nome; const a = dkAgente(id); return a ? a.nome : 'Qualcuno'; };
const dkNomeBreve = (id) => { const p = dkPersona(id); if (p) return p.io ? 'Tu' : p.nome.split(' ')[0]; const a = dkAgente(id); return a ? a.nome : 'Qualcuno'; };
const dkLocale = (id) => (typeof LOCALI !== 'undefined' ? LOCALI : []).find(l => l.id === id) || null;

// ═══════════════════════════════════════════════════════════════════════════
// Il vocabolario delle attività
// ═══════════════════════════════════════════════════════════════════════════
const DK_STATI = [
  { id: 'da_fare',   label: 'Da fare',      colore: '#6E6E73', soft: '#F1F2F4' },
  { id: 'in_corso',  label: 'In corso',     colore: '#2563EB', soft: '#E8EFFB' },
  { id: 'revisione', label: 'In revisione', colore: '#C2710C', soft: '#FAF1DC' },
  { id: 'fatto',     label: 'Fatto',        colore: '#16A34A', soft: '#E4F4EA' },
];
const dkStato = (id) => DK_STATI.find(s => s.id === id) || DK_STATI[0];
const DK_PRIORITA = [
  { id: 'urgente', label: 'Urgente', colore: '#DC2626' },
  { id: 'alta',    label: 'Alta',    colore: '#C2710C' },
  { id: 'normale', label: 'Normale', colore: '#2563EB' },
  { id: 'bassa',   label: 'Bassa',   colore: '#8A8A90' },
];
const dkPriorita = (id) => DK_PRIORITA.find(p => p.id === id) || DK_PRIORITA[2];
const DK_REAZIONI_RAPIDE = ['👍', '✅', '👀', '🙏', '🎉', '🔥', '😂', '❤️'];

// ═══════════════════════════════════════════════════════════════════════════
// Il mock di partenza
// ═══════════════════════════════════════════════════════════════════════════
function dkStatoIniziale() {
  const canali = [
    { id: 'generale',   nome: 'generale',          tema: 'Annunci e cose che riguardano tutti', nonLetti: 0, menzioni: 0 },
    { id: 'lancio',     nome: 'lancio-1-dicembre', tema: 'Dal primo dicembre, in tutta Italia: tutto quello che manca', nonLetti: 4, menzioni: 1 },
    { id: 'assistenza', nome: 'assistenza',        tema: 'Escalation, turni e ticket che scottano', nonLetti: 3, menzioni: 0 },
    { id: 'fresh',      nome: 'prodotto-fresh',    tema: 'Cosa ci dicono i locali su Fresh, e cosa cambiamo', nonLetti: 2, menzioni: 0 },
    { id: 'marketing',  nome: 'marketing',         tema: 'Campagne, contenuti e numeri', nonLetti: 0, menzioni: 0 },
    { id: 'vendite',    nome: 'vendite',           tema: 'Demo, trattative e locali nuovi', nonLetti: 0, menzioni: 0 },
    { id: 'direzione',  nome: 'direzione',         tema: 'Soci e responsabili', privato: true, nonLetti: 0, menzioni: 0 },
  ];
  const diretti = [
    { id: 'dm-sara',   con: ['support1'],          nonLetti: 2, menzioni: 2 },
    { id: 'dm-laura',  con: ['admin1'],            nonLetti: 0, menzioni: 0 },
    { id: 'dm-paola',  con: ['mkt1'],              nonLetti: 0, menzioni: 0 },
    { id: 'dm-nicola', con: ['support3'],          nonLetti: 0, menzioni: 0 },
    { id: 'dm-gruppo', con: ['admin1', 'mkt1'],    nonLetti: 0, menzioni: 0 },
  ];
  // Le attività. Ognuna vive in un canale; alcune sono legate a un contatto.
  const attivita = [
    { id: 'T-112', titolo: 'Pubblicare la pagina /prodotti su byup.it', stato: 'revisione', priorita: 'alta', chi: ['admin0'], scadenza: dkGiorno(2, 18), canale: 'lancio',
      desc: 'Bozza su Framer pronta: mancano le due CTA collegate alla lista d\'attesa e il controllo dei prezzi annuali.',
      checklist: [{ t: 'Testi e immagini', ok: true }, { t: 'CTA verso la lista d\'attesa', ok: false }, { t: 'Prezzi annuali ricontrollati', ok: false }, { t: 'Publish', ok: false }],
      commenti: [{ da: 'mkt1', t: dkFa(95), testo: 'Le immagini sono quelle definitive, ho tolto le due sgranate.' }] },
    { id: 'T-101', titolo: 'Chiudere i testi della landing di lancio', stato: 'in_corso', priorita: 'alta', chi: ['mkt1'], scadenza: dkGiorno(1, 18), canale: 'lancio',
      desc: 'Claim: «Dal primo dicembre, in tutta Italia». Tono diretto, niente inglesismi.',
      checklist: [{ t: 'Hero', ok: true }, { t: 'Sezione conto diviso', ok: true }, { t: 'FAQ', ok: true }, { t: 'Prezzi', ok: false }, { t: 'Rilettura', ok: false }],
      commenti: [] },
    { id: 'T-102', titolo: 'Richiamare Trattoria della Nonna: onboarding fermo al passo 2', stato: 'da_fare', priorita: 'urgente', chi: ['support1'], scadenza: dkGiorno(0, 17), canale: 'assistenza', contatto: 'L1005',
      desc: 'Fermi sui dati fiscali da quattro giorni. Probabile dubbio sul regime: chiedere se hanno il commercialista in linea.',
      checklist: [{ t: 'Chiamata', ok: false }, { t: 'Nota nella scheda', ok: false }], commenti: [] },
    { id: 'T-105', titolo: 'Rispondere ai tre ticket fermi da più di 48 ore', stato: 'in_corso', priorita: 'urgente', chi: ['support3'], scadenza: dkGiorno(-1, 18), canale: 'assistenza',
      desc: 'Due sul conto diviso, uno sulla stampante della cucina.', checklist: [{ t: 'Ticket 1', ok: true }, { t: 'Ticket 2', ok: false }, { t: 'Ticket 3', ok: false }], commenti: [] },
    { id: 'T-104', titolo: 'Preparare la demo per Pizzeria Sorbillo', stato: 'da_fare', priorita: 'alta', chi: ['admin0'], scadenza: dkGiorno(1, 11), canale: 'vendite', contatto: 'L1007',
      desc: 'Due sale, molto asporto. Mostrare Sala, Cucina e il conto diviso dall\'app.',
      checklist: [{ t: 'Menù di prova caricato', ok: true }, { t: 'Piantina con le due sale', ok: false }, { t: 'Scaletta di 20 minuti', ok: false }], commenti: [] },
    { id: 'T-103', titolo: 'Spot 60 s: tagli da 15 s per i social', stato: 'revisione', priorita: 'normale', chi: ['mkt1', 'admin0'], scadenza: dkGiorno(3, 12), canale: 'marketing',
      desc: 'Tre tagli dal master v5.1: conto diviso, cucina, lancio.', checklist: [{ t: 'Taglio conto diviso', ok: true }, { t: 'Taglio cucina', ok: true }, { t: 'Taglio lancio', ok: false }], commenti: [] },
    { id: 'T-106', titolo: 'Go-live: stampanti dei locali pilota collegate al server', stato: 'da_fare', priorita: 'alta', chi: ['admin1'], scadenza: dkGiorno(5, 12), canale: 'fresh',
      desc: 'Comande e pre-conto escono dalle stampanti che interrogano il nostro server. Verificare i tre locali pilota.', checklist: [{ t: 'Locale 1', ok: false }, { t: 'Locale 2', ok: false }, { t: 'Locale 3', ok: false }], commenti: [] },
    { id: 'T-109', titolo: 'Raccogliere il feedback dei locali beta sul conto diviso', stato: 'in_corso', priorita: 'normale', chi: ['support1'], scadenza: dkGiorno(2, 18), canale: 'fresh',
      desc: 'Cinque chiamate brevi, tre domande sempre uguali.', checklist: [{ t: '5 chiamate', ok: false }, { t: 'Sintesi in #prodotto-fresh', ok: false }], commenti: [] },
    { id: 'T-107', titolo: 'Newsletter di novembre ai locali in lista d\'attesa', stato: 'revisione', priorita: 'normale', chi: ['mkt1'], scadenza: dkGiorno(4, 10), canale: 'marketing', checklist: [], commenti: [], desc: '' },
    { id: 'T-108', titolo: 'Aggiornare le FAQ su pagamenti e commissioni', stato: 'da_fare', priorita: 'normale', chi: ['support2'], scadenza: dkGiorno(6, 18), canale: 'assistenza', checklist: [], commenti: [], desc: '' },
    { id: 'T-111', titolo: 'Brief del marketplace fornitori (Hubble)', stato: 'da_fare', priorita: 'bassa', chi: ['admin0', 'admin1'], scadenza: dkGiorno(10, 18), canale: 'direzione',
      desc: 'I locali collegano il magazzino e trovano in automatico la rete dei fornitori. Prima bozza di perimetro.', checklist: [], commenti: [] },
    { id: 'T-110', titolo: 'Firma del contratto con Bistrot Aurora', stato: 'fatto', priorita: 'alta', chi: ['admin0'], scadenza: dkGiorno(-1, 12), canale: 'vendite', contatto: 'L1004', checklist: [{ t: 'Firma', ok: true }], commenti: [], desc: '' },
  ];
  const riunioni = [
    { id: 'R-1', titolo: 'Stand-up assistenza', inizio: dkTra5(-150), durata: 15, chi: ['support1', 'support2', 'support3', 'admin0'], canale: 'assistenza', ricorrente: 'Lun–ven' },
    { id: 'R-2', titolo: 'Allineamento lancio 1° dicembre', inizio: dkTra5(-10), durata: 45, chi: ['admin1', 'mkt1', 'admin0'], canale: 'lancio' },
    { id: 'R-4', titolo: 'Revisione campagne di novembre', inizio: dkTra5(130), durata: 30, chi: ['mkt1', 'mkt2', 'admin0'], canale: 'marketing' },
    { id: 'R-3', titolo: 'Demo Fresh con Pizzeria Sorbillo', inizio: dkGiorno(1, 11), durata: 30, chi: ['admin0', 'support1'], canale: 'vendite', contatto: 'L1007', esterni: 'Chiara Greco (titolare)' },
    { id: 'R-6', titolo: '1:1 Sara · Marco', inizio: dkGiorno(2, 16), durata: 30, chi: ['support1', 'admin0'], canale: null },
    { id: 'R-7', titolo: 'Prodotto: cosa entra nella 1.1', inizio: dkGiorno(3, 10), durata: 60, chi: ['admin1', 'support1', 'admin0', 'support3'], canale: 'fresh' },
    { id: 'R-5', titolo: 'Weekly del team', inizio: dkGiorno(-1, 10), durata: 45, chi: ['admin0', 'admin1', 'support1', 'support2', 'mkt1', 'support3'], canale: 'generale', ricorrente: 'Ogni settimana' },
  ];
  const m = (id, da, t, testo, extra) => Object.assign({ id, da, t, testo, reazioni: [], risposte: [] }, extra || {});
  const messaggi = {
    generale: [
      m('g1', 'admin0', dkGiorno(-1, 9, 4), 'Buongiorno a tutti. Da oggi la console si chiama **Desk**: stesso posto, stessi dati, nome nuovo. Hubble passa al marketplace dei fornitori.', { reazioni: [{ e: '🎉', chi: ['admin1', 'support1', 'mkt1', 'support2'] }, { e: '👀', chi: ['support3'] }], fissato: true,
        risposte: [m('g1r1', 'support1', dkGiorno(-1, 9, 12), 'Finalmente un nome che si capisce al primo colpo 😄'), m('g1r2', 'admin1', dkGiorno(-1, 9, 20), 'Il marketplace lo raccontiamo in #direzione quando il brief è pronto.')] }),
      m('g2', 'mkt1', dkGiorno(-1, 15, 40), 'Lo spot v5.1 è il master. I file sono qui, per i tagli usate solo questo.', { allegati: [{ nome: 'byup-fresh-spot-v5.1.mp4', tipo: 'video', peso: '27,8 MB' }] }),
      m('g3', 'support2', dkFa(180), 'Ricordo che venerdì le FAQ su pagamenti e commissioni vanno online: se avete domande ricorrenti dai locali scrivetele nell\'attività.', { attivita: 'T-108' }),
    ],
    lancio: [
      m('l1', 'admin1', dkGiorno(-1, 11, 2), 'Punto della situazione per il **1° dicembre**: landing, spot, newsletter e la pagina /prodotti. Tutto il resto aspetta gennaio.', { fissato: true, reazioni: [{ e: '👍', chi: ['admin0', 'mkt1'] }] }),
      m('l2', 'mkt1', dkGiorno(-1, 16, 25), 'Testi della landing all\'80%. Manca la parte prezzi: aspetto conferma sugli annuali.', { attivita: 'T-101' }),
      m('l3', 'AG-003', dkFa(150), 'Ho preparato tre varianti di oggetto per la newsletter di lancio. La più promettente per storico: «Dal 1° dicembre il conto si divide da solo».', { agente: true, reazioni: [{ e: '🔥', chi: ['mkt1'] }] }),
      m('l4', 'mkt1', dkFa(42), '@[admin0] mi confermi i prezzi annuali per Starter e Plus? Li metto in pagina appena mi dici.', {
        risposte: [m('l4r1', 'admin1', dkFa(30), 'Sono quelli del listino in Impostazioni → Piattaforma, non cambiano.')] }),
      m('l5', 'admin1', dkFa(12), 'Riunione di allineamento iniziata, chi può si unisca.', { riunione: 'R-2' }),
    ],
    assistenza: [
      m('a1', 'AG-001', dkGiorno(-1, 8, 40), 'Non riesco a smistare i ticket nuovi: la chiave del fornitore ha superato la quota mensile. Le ultime 12 esecuzioni non sono partite.', { agente: true, reazioni: [{ e: '👀', chi: ['support3'] }] }),
      m('a2', 'support3', dkGiorno(-1, 9, 5), 'Li smisto io a mano finché non si sblocca. Tre sono fermi da più di 48 ore, li prendo in carico.', { attivita: 'T-105' }),
      m('a3', 'support1', dkFa(75), '**Trattoria della Nonna** è ferma al passo 2 dell\'onboarding da quattro giorni. La richiamo io nel pomeriggio.', { contatto: 'L1005', attivita: 'T-102',
        risposte: [m('a3r1', 'support2', dkFa(60), 'Se è il regime fiscale, la guida nuova è in Assistenza → Guide.'), m('a3r2', 'support1', dkFa(55), 'Perfetto, la mando prima di chiamare.')] }),
      m('a4', 'support2', dkFa(20), 'Pizzeria Da Michele chiede se il coperto si può nascondere dal pre-conto. Qualcuno sa se è previsto?', { contatto: 'L1002' }),
      m('a5', 'support3', dkFa(8), 'Turno di sabato: io mattina, @[support2] pomeriggio. Ok?', { reazioni: [{ e: '✅', chi: ['support2'] }] }),
    ],
    fresh: [
      m('f1', 'support1', dkGiorno(-1, 14, 10), 'Dai primi tre locali beta: il conto diviso piace, ma vogliono vedere chi ha già pagato **senza** aprire il tavolo.', { reazioni: [{ e: '💡', chi: ['admin1'] }],
        risposte: [m('f1r1', 'admin1', dkGiorno(-1, 14, 30), 'Ha senso: un pallino sul tavolo in Sala. Lo metto nella 1.1.')] }),
      m('f2', 'admin1', dkFa(90), 'Checklist per il go-live delle stampanti nei locali pilota. Comande e pre-conto escono dal nostro server, il browser è solo il ripiego per i documenti.', { attivita: 'T-106', allegati: [{ nome: 'go-live-stampanti.pdf', tipo: 'pdf', peso: '412 KB' }] }),
      m('f3', 'AG-005', dkFa(35), '4 locali a rischio questa settimana: 2 non ordinano da 21 giorni, 1 ha aperto 3 ticket in una settimana, 1 ha disattivato il delivery.', { agente: true }),
    ],
    marketing: [
      m('k1', 'mkt1', dkGiorno(-2, 10, 0), 'Calendario editoriale di novembre caricato. Una settimana sul conto diviso, una sulla cucina, due sul lancio.', { allegati: [{ nome: 'calendario-novembre.xlsx', tipo: 'xls', peso: '58 KB' }], reazioni: [{ e: '👍', chi: ['admin0', 'mkt2'] }] }),
      m('k2', 'mkt1', dkFa(240), 'Tagli dello spot pronti per la revisione: conto diviso e cucina. Il terzo arriva domani.', { attivita: 'T-103', allegati: [{ nome: 'taglio-conto-diviso.mp4', tipo: 'video', peso: '6,1 MB' }, { nome: 'taglio-cucina.mp4', tipo: 'video', peso: '5,7 MB' }] }),
    ],
    vendite: [
      m('v1', 'admin0', dkGiorno(-1, 12, 15), 'Bistrot Aurora ha firmato 🎉 Piano Plus annuale.', { contatto: 'L1004', attivita: 'T-110', reazioni: [{ e: '🎉', chi: ['admin1', 'support1', 'mkt1', 'support2', 'support3'] }] }),
      m('v2', 'support1', dkFa(130), 'Demo con Pizzeria Sorbillo fissata per domani alle 11. Vengo anch\'io per la parte sala.', { contatto: 'L1007', riunione: 'R-3' }),
    ],
    direzione: [
      m('d1', 'admin1', dkGiorno(-2, 18, 30), 'Per il marketplace dei fornitori (Hubble) serve un brief di una pagina prima di parlarne con chiunque: perimetro, chi paga, cosa si collega al magazzino.', { attivita: 'T-111' }),
    ],
    'dm-sara': [
      m('s1', 'support1', dkFa(65), 'Ciao! Domani alla demo con Sorbillo parto io con la sala e tu chiudi con i prezzi?'),
      m('s2', 'support1', dkFa(64), 'E @[admin0] ti ho lasciato una nota sulla scheda della Trattoria della Nonna, dacci un occhio quando puoi.', { contatto: 'L1005' }),
    ],
    'dm-laura': [
      m('la1', 'admin0', dkGiorno(-1, 18, 2), 'Il brief del marketplace lo scriviamo insieme giovedì?'),
      m('la2', 'admin1', dkGiorno(-1, 18, 15), 'Sì, blocco un\'ora. Porto i numeri dei fornitori che ci hanno già scritto.'),
    ],
    'dm-paola': [
      m('p1', 'mkt1', dkGiorno(-1, 17, 40), 'Ti mando le tre varianti dell\'oggetto appena l\'agente le rifinisce.'),
      m('p2', 'admin0', dkGiorno(-1, 17, 44), 'Perfetto, grazie.'),
    ],
    'dm-nicola': [
      m('n1', 'support3', dkGiorno(-1, 9, 30), 'Il primo filtro dei ticket è fermo per la quota: chi rinnova la chiave?'),
      m('n2', 'admin0', dkGiorno(-1, 9, 42), 'Me ne occupo io oggi.'),
    ],
    'dm-gruppo': [
      m('gr1', 'admin1', dkGiorno(-2, 11, 0), 'Qui teniamo le cose del lancio che non servono a tutto il canale.'),
    ],
  };
  return {
    canali, diretti, attivita, riunioni, messaggi,
    vista: 'oggi',              // 'oggi' | 'attivita' | 'riunioni' | 'conv:<id>' | 'cerca'
    presenza: 'online',
    huddle: null,               // { conv, inizio, muto }
    chiamata: null,             // { riunione, inizio, muto, camera, schermo, mano, chat }
    contatore: 200,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Lo store — un oggetto di modulo e chi lo ascolta
// ═══════════════════════════════════════════════════════════════════════════
const DK_STORE = { stato: null, ascolta: new Set() };
function dkLeggi() { if (!DK_STORE.stato) DK_STORE.stato = dkStatoIniziale(); return DK_STORE.stato; }
function dkAggiorna(fn) {
  const prima = dkLeggi();
  DK_STORE.stato = Object.assign({}, prima, fn(prima));
  DK_STORE.ascolta.forEach(f => f());
}
function dkUsaStore() {
  const [, setN] = useStateDk(0);
  useEffectDk(() => {
    const f = () => setN(n => n + 1);
    DK_STORE.ascolta.add(f);
    return () => { DK_STORE.ascolta.delete(f); };
  }, []);
  return dkLeggi();
}
const dkNuovoId = (pre) => { const s = dkLeggi(); s.contatore += 1; return pre + s.contatore; };

// Il riepilogo che serve al pulsante della barra laterale.
function dkRiepilogo() {
  const s = dkLeggi();
  const conv = s.canali.concat(s.diretti);
  const nonLetti = conv.reduce((a, c) => a + (c.nonLetti || 0), 0);
  const menzioni = conv.reduce((a, c) => a + (c.menzioni || 0), 0);
  const online = dkPersone().filter(p => !p.io && (DK_PRESENZA_DI[p.id] === 'online' || DK_PRESENZA_DI[p.id] === 'riunione')).length;
  const live = s.riunioni.find(r => dkRiunioneInCorso(r)) || null;
  const mie = s.attivita.filter(a => a.chi.includes(DK_IO) && a.stato !== 'fatto').length;
  return { nonLetti, menzioni, online, live, mie };
}
const dkRiunioneInCorso = (r) => r.inizio.getTime() <= DK_ORA && DK_ORA < r.inizio.getTime() + r.durata * 60000;

// Le azioni. Tutte passano da dkAggiorna, nessuna tocca lo stato a mano.
function dkApri(vista) {
  dkAggiorna(s => {
    if (!vista.startsWith('conv:')) return { vista };
    const id = vista.slice(5);
    const azzera = (l) => l.map(c => c.id === id ? Object.assign({}, c, { nonLetti: 0, menzioni: 0 }) : c);
    return { vista, canali: azzera(s.canali), diretti: azzera(s.diretti) };
  });
}
function dkScrivi(conv, testo, extra) {
  const id = dkNuovoId('m');
  dkAggiorna(s => ({ messaggi: Object.assign({}, s.messaggi, {
    [conv]: (s.messaggi[conv] || []).concat([Object.assign({ id, da: DK_IO, t: new Date(), testo, reazioni: [], risposte: [] }, extra || {})]),
  }) }));
  return id;
}
function dkModificaMessaggio(conv, id, fn) {
  dkAggiorna(s => ({ messaggi: Object.assign({}, s.messaggi, {
    [conv]: (s.messaggi[conv] || []).map(x => x.id === id ? Object.assign({}, x, fn(x)) : x),
  }) }));
}
function dkReagisci(conv, id, e, risposta) {
  const tocca = (x) => {
    const r = x.reazioni || [];
    const c = r.find(y => y.e === e);
    let nuove;
    if (!c) nuove = r.concat([{ e, chi: [DK_IO] }]);
    else if (c.chi.includes(DK_IO)) nuove = r.map(y => y.e === e ? { e, chi: y.chi.filter(q => q !== DK_IO) } : y).filter(y => y.chi.length);
    else nuove = r.map(y => y.e === e ? { e, chi: y.chi.concat([DK_IO]) } : y);
    return { reazioni: nuove };
  };
  if (risposta) dkModificaMessaggio(conv, id, x => ({ risposte: x.risposte.map(rr => rr.id === risposta ? Object.assign({}, rr, tocca(rr)) : rr) }));
  else dkModificaMessaggio(conv, id, tocca);
}
function dkRispondi(conv, id, testo) {
  const rid = dkNuovoId('r');
  dkModificaMessaggio(conv, id, x => ({ risposte: x.risposte.concat([{ id: rid, da: DK_IO, t: new Date(), testo, reazioni: [], risposte: [] }]) }));
}
function dkSalvaAttivita(a) {
  dkAggiorna(s => ({ attivita: s.attivita.some(x => x.id === a.id) ? s.attivita.map(x => x.id === a.id ? a : x) : [a].concat(s.attivita) }));
}
function dkCambiaAttivita(id, campi) {
  dkAggiorna(s => ({ attivita: s.attivita.map(x => x.id === id ? Object.assign({}, x, campi) : x) }));
}
// Il testo che si scrive con «@Nome Cognome» diventa un token @[id]: così la
// menzione resta legata alla persona anche se il nome cambia.
function dkCodificaMenzioni(testo) {
  let out = testo;
  dkPersone().slice().sort((a, b) => b.nome.length - a.nome.length).forEach(p => {
    out = out.split('@' + p.nome).join('@[' + p.id + ']');
  });
  return out;
}
const dkMenzionaMe = (testo) => (testo || '').includes('@[' + DK_IO + ']');

// ═══════════════════════════════════════════════════════════════════════════
// Lo stile della pagina
// ═══════════════════════════════════════════════════════════════════════════
const DK_CSS = `
.dk-riga { transition: background 0.12s ease, color 0.12s ease; }
.dk-riga:hover:not(.is-attiva) { background: rgba(73,40,68,0.07) !important; }
.dk-msg { position: relative; transition: background 0.1s ease; }
.dk-msg:hover { background: #FAF7FA; }
.dk-msg:hover .dk-ora-grp { color: #A1A1A8 !important; }
.dk-msg.is-mia-menzione { background: #FFF6F8; }
.dk-msg.is-mia-menzione:hover { background: #FFEFF3; }
.dk-msg .dk-strumenti { opacity: 0; pointer-events: none; transform: translateY(2px); transition: opacity 0.12s ease, transform 0.12s ease; }
.dk-msg:hover .dk-strumenti, .dk-msg .dk-strumenti.is-aperti { opacity: 1; pointer-events: auto; transform: translateY(0); }
.dk-strumento { transition: background 0.1s ease, color 0.1s ease; }
.dk-strumento:hover { background: #F4EAF2 !important; color: #492844 !important; }
.dk-reazione { transition: background 0.1s ease, border-color 0.1s ease, transform 0.12s cubic-bezier(0.34,1.56,0.64,1); }
.dk-reazione:hover { border-color: #DCBAD7 !important; }
.dk-reazione:active { transform: scale(0.9); }
.dk-card { transition: border-color 0.14s ease, box-shadow 0.14s ease, transform 0.14s ease; cursor: pointer; }
.dk-card:hover { border-color: #DCBAD7 !important; box-shadow: 0 10px 24px -14px rgba(73,40,68,0.35) !important; transform: translateY(-1px); }
.dk-tab { transition: color 0.12s ease, border-color 0.12s ease; }
.dk-tab:hover { color: #492844 !important; }
.dk-check { transition: transform 0.14s cubic-bezier(0.34,1.56,0.64,1); }
.dk-check:active { transform: scale(0.85); }
@keyframes dkParla { 0% { box-shadow: 0 0 0 0 rgba(220,186,215,0.75); } 70% { box-shadow: 0 0 0 12px rgba(220,186,215,0); } 100% { box-shadow: 0 0 0 0 rgba(220,186,215,0); } }
@keyframes dkLive { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
@keyframes dkSu { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
@keyframes dkEntra { from { opacity: 0; transform: scale(0.985) } to { opacity: 1; transform: scale(1) } }
.dk-colonna-bacheca.is-sopra { background: #F4EAF2 !important; outline: 2px dashed #DCBAD7; outline-offset: -4px; }
@media (prefers-reduced-motion: reduce) {
  .dk-msg .dk-strumenti, .dk-card, .dk-reazione { transition: none !important; }
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// I pezzi piccoli
// ═══════════════════════════════════════════════════════════════════════════
function DkAvatar({ id, size = 34, presenza, bordo }) {
  const p = dkPersona(id);
  // Tonde, come in tutta la console dal 20 ottobre.
  const raggio = '50%';
  if (!p) {
    const a = dkAgente(id);
    return (
      <span title={a ? a.nome + ' · agente' : ''} style={{
        width: size, height: size, borderRadius: raggio, flexShrink: 0, display: 'inline-grid', placeItems: 'center',
        background: a && a.stato === 'errore' ? ADM.DANGER_SOFT : ADM.HUB_VIOLA_SOFT,
        color: a && a.stato === 'errore' ? ADM.DANGER : ADM.HUB_VIOLA_DARK,
        boxShadow: bordo ? '0 0 0 2px ' + bordo : 'none',
      }}><BuIcons.sparkFill size={Math.round(size * 0.52)}/></span>
    );
  }
  // `presenza` può essere uno stato preciso (la mia, dalla colonna) o solo
  // `true` = «mostra il pallino»: per me si legge dallo store, per gli altri
  // dalla tabella del mock. Uno stato sconosciuto non disegna niente.
  const voluto = presenza === true ? (p.io ? dkLeggi().presenza : DK_PRESENZA_DI[p.id]) : presenza ? (p.io ? presenza : DK_PRESENZA_DI[p.id]) : null;
  const stato = voluto && DK_PRESENZE[voluto] ? voluto : null;
  return (
    <span title={p.nome} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <span style={{
        width: size, height: size, borderRadius: raggio, display: 'grid', placeItems: 'center',
        background: p.bg, color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.38), letterSpacing: '0.01em',
        boxShadow: bordo ? '0 0 0 2px ' + bordo : 'none',
      }}>{p.ini}</span>
      {stato && (
        <span style={{
          position: 'absolute', right: -2, bottom: -2, width: Math.max(9, Math.round(size * 0.3)), height: Math.max(9, Math.round(size * 0.3)),
          borderRadius: '50%', background: DK_PRESENZE[stato].colore, boxShadow: '0 0 0 2px ' + (bordo || '#fff'),
        }}/>
      )}
    </span>
  );
}

function DkPila({ ids, size = 22, max = 4, bordo = '#fff' }) {
  const vis = ids.slice(0, max);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {vis.map((id, i) => (
        <span key={id} style={{ marginLeft: i === 0 ? 0 : -Math.round(size * 0.3), display: 'inline-flex' }}>
          <DkAvatar id={id} size={size} bordo={bordo}/>
        </span>
      ))}
      {ids.length > max && (
        <span style={{
          marginLeft: -Math.round(size * 0.3), height: size, minWidth: size, padding: '0 5px', borderRadius: 99,
          background: ADM.NEUTRAL_SOFT, color: ADM.MUTED, fontSize: Math.round(size * 0.44), fontWeight: 700,
          display: 'inline-grid', placeItems: 'center', boxShadow: '0 0 0 2px ' + bordo,
        }}>+{ids.length - max}</span>
      )}
    </span>
  );
}

function DkPillolaStato({ stato, piccola }) {
  const s = dkStato(stato);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: piccola ? '2px 8px' : '3px 10px', borderRadius: 999,
      background: s.soft, color: s.colore, fontSize: piccola ? 11.5 : 12.4, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.colore }}/>
      {s.label}
    </span>
  );
}

function DkScadenza({ data, piccola }) {
  const sc = dkScadenza(data);
  const colore = sc.tono === 'ritardo' ? ADM.DANGER : sc.tono === 'oggi' ? ADM.PINK_DARK : sc.tono === 'vicina' ? ADM.WARN : ADM.MUTED;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: piccola ? 12 : 12.8, fontWeight: sc.tono === 'normale' || sc.tono === 'muto' ? 500 : 700, color: colore, whiteSpace: 'nowrap' }}>
      <BuIcons.calendar size={piccola ? 12 : 13}/>{sc.testo}
    </span>
  );
}

function DkBandiera({ priorita }) {
  const p = dkPriorita(priorita);
  return (
    <span title={'Priorità ' + p.label.toLowerCase()} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.2, fontWeight: 600, color: p.colore }}>
      <BuIcons.flag size={13}/>{p.label}
    </span>
  );
}

// Il chip di un contatto del CRM: è il ponte fra Ambiente e il resto di Desk.
function DkContatto({ id, compatto }) {
  const l = dkLocale(id);
  if (!l) return null;
  return (
    <button onClick={(e) => { e.stopPropagation(); if (window.hubVai) window.hubVai('locali', { openLocale: l }); }}
      title="Apri la scheda del contatto" className="dk-card"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: compatto ? '3px 9px 3px 4px' : '6px 12px 6px 6px',
        borderRadius: 999, border: `1px solid ${ADM.BORDER}`, background: '#fff', fontFamily: 'inherit', cursor: 'pointer', maxWidth: '100%',
      }}>
      <span style={{ width: compatto ? 20 : 24, height: compatto ? 20 : 24, borderRadius: '50%', background: ADM.PINK_SOFT, color: ADM.PINK, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <BuIcons.storeFill size={compatto ? 11 : 13}/>
      </span>
      <span style={{ fontSize: compatto ? 12.2 : 13, fontWeight: 700, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.nome}</span>
      {!compatto && <span style={{ fontSize: 12.2, color: ADM.MUTED, whiteSpace: 'nowrap' }}>· {l.citta}</span>}
      <BuIcons.arrowRight size={compatto ? 11 : 12} color={ADM.MUTED_SOFT}/>
    </button>
  );
}

// Il testo di un messaggio: **grassetto**, `codice`, @[id] e gli a capo.
function DkTesto({ testo }) {
  const parti = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|@\[[a-zA-Z0-9-]+\])/g;
  let ultimo = 0; let mm; let k = 0;
  const s = testo || '';
  while ((mm = re.exec(s)) !== null) {
    if (mm.index > ultimo) parti.push(s.slice(ultimo, mm.index));
    const tok = mm[0];
    if (tok.startsWith('**')) parti.push(<b key={k++} style={{ fontWeight: 700 }}>{tok.slice(2, -2)}</b>);
    else if (tok.startsWith('`')) parti.push(<code key={k++} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.88em', background: ADM.NEUTRAL_SOFT, padding: '1px 5px', borderRadius: 5 }}>{tok.slice(1, -1)}</code>);
    else {
      const id = tok.slice(2, -1);
      const io = id === DK_IO;
      parti.push(
        <span key={k++} style={{
          background: io ? ADM.PINK_SOFT : ADM.DESK_LILLA_SOFT, color: io ? ADM.PINK_DARK : ADM.DESK_PRUGNA,
          fontWeight: 700, padding: '0 4px', borderRadius: 5,
        }}>@{dkNome(id)}</span>
      );
    }
    ultimo = mm.index + tok.length;
  }
  if (ultimo < s.length) parti.push(s.slice(ultimo));
  return <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{parti}</span>;
}

const DK_TIPI_FILE = {
  pdf:   { colore: '#DC2626', soft: '#FBE9E9', label: 'PDF' },
  xls:   { colore: '#16A34A', soft: '#E4F4EA', label: 'Foglio' },
  doc:   { colore: '#2563EB', soft: '#E8EFFB', label: 'Documento' },
  img:   { colore: '#0D9488', soft: '#D7EFEC', label: 'Immagine' },
  video: { colore: '#5B34D6', soft: '#E7E3FB', label: 'Video' },
  altro: { colore: '#6E6E73', soft: '#F1F2F4', label: 'File' },
};
function dkTipoDaNome(nome) {
  const est = (nome.split('.').pop() || '').toLowerCase();
  if (est === 'pdf') return 'pdf';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(est)) return 'xls';
  if (['doc', 'docx', 'txt', 'md', 'pages'].includes(est)) return 'doc';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic'].includes(est)) return 'img';
  if (['mp4', 'mov', 'webm', 'm4v'].includes(est)) return 'video';
  return 'altro';
}
function dkPeso(byte) {
  if (byte < 1024) return byte + ' B';
  if (byte < 1024 * 1024) return Math.round(byte / 1024) + ' KB';
  return (byte / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
}
function DkFile({ f, largo }) {
  const t = DK_TIPI_FILE[f.tipo] || DK_TIPI_FILE.altro;
  const Ic = f.tipo === 'video' ? BuIcons.video : f.tipo === 'img' ? BuIcons.image : BuIcons.file;
  return (
    <div className="dk-card" style={{
      display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px 9px 9px', width: largo ? '100%' : 300, maxWidth: '100%',
      border: `1px solid ${ADM.BORDER}`, borderRadius: 12, background: '#fff', boxSizing: 'border-box',
    }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: t.soft, color: t.colore, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ic size={19}/></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13.4, fontWeight: 700, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.nome}</span>
        <span style={{ display: 'block', fontSize: 12, color: ADM.MUTED, marginTop: 1 }}>{t.label} · {f.peso}</span>
      </span>
      <BuIcons.download size={16} color={ADM.MUTED_SOFT}/>
    </div>
  );
}

function DkCardAttivita({ a, onApri }) {
  if (!a) return null;
  const fatti = (a.checklist || []).filter(c => c.ok).length;
  return (
    <div className="dk-card" onClick={() => onApri(a.id)} style={{
      width: 420, maxWidth: '100%', boxSizing: 'border-box', border: `1px solid ${ADM.BORDER}`, borderLeft: `3px solid ${dkStato(a.stato).colore}`,
      borderRadius: 12, background: '#fff', padding: '10px 13px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <BuIcons.checkSquare size={14} color={ADM.DESK_PRUGNA}/>
        <span style={{ fontSize: 11.2, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.DESK_PRUGNA_CHIARO }}>Attività · {a.id}</span>
        <span style={{ flex: 1 }}/>
        <DkPillolaStato stato={a.stato} piccola/>
      </div>
      <div style={{ fontSize: 14.2, fontWeight: 700, color: ADM.TEXT, lineHeight: 1.35, textDecoration: a.stato === 'fatto' ? 'line-through' : 'none' }}>{a.titolo}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
        <DkPila ids={a.chi} size={20}/>
        <DkScadenza data={a.scadenza} piccola/>
        {(a.checklist || []).length > 0 && <span style={{ fontSize: 12, color: ADM.MUTED, fontWeight: 600 }}>{fatti}/{a.checklist.length}</span>}
      </div>
    </div>
  );
}

function DkCardRiunione({ r, onEntra }) {
  if (!r) return null;
  const live = dkRiunioneInCorso(r);
  const finita = DK_ORA >= r.inizio.getTime() + r.durata * 60000;
  return (
    <div style={{
      width: 420, maxWidth: '100%', boxSizing: 'border-box', borderRadius: 12, padding: '11px 13px',
      background: live ? ADM.DESK_PRUGNA : '#fff', color: live ? '#fff' : ADM.TEXT,
      border: live ? 'none' : `1px solid ${ADM.BORDER}`, display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', flexShrink: 0, background: live ? 'rgba(255,255,255,0.14)' : ADM.DESK_LILLA_SOFT, color: live ? '#fff' : ADM.DESK_PRUGNA }}>
        <BuIcons.video size={19}/>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.2, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: live ? ADM.DESK_LILLA : ADM.MUTED_SOFT }}>
          {live && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF4A6E', animation: 'dkLive 1.4s ease-in-out infinite' }}/>}
          {live ? 'Riunione in corso' : finita ? 'Riunione terminata' : 'Riunione · ' + dkEtichettaGiorno(r.inizio) + ' alle ' + dkOra(r.inizio)}
        </span>
        <span style={{ display: 'block', fontSize: 14.2, fontWeight: 700, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.titolo}</span>
      </span>
      <DkPila ids={r.chi} size={22} bordo={live ? ADM.DESK_PRUGNA : '#fff'}/>
      {!finita && (
        <button onClick={() => onEntra(r)} style={{
          padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.2, fontWeight: 700,
          background: live ? '#fff' : ADM.DESK_PRUGNA, color: live ? ADM.DESK_PRUGNA : '#fff', flexShrink: 0,
        }}>{live ? 'Partecipa' : 'Apri'}</button>
      )}
    </div>
  );
}

// Un bottone quadrato della testata.
function DkTasto({ icona, titolo, onClick, acceso, badge, testo }) {
  const Ic = BuIcons[icona];
  return (
    <button onClick={onClick} title={titolo} className="dk-strumento" style={{
      height: 34, minWidth: 34, padding: testo ? '0 12px' : 0, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
      border: `1px solid ${acceso ? ADM.DESK_LILLA : ADM.BORDER}`, background: acceso ? ADM.DESK_LILLA_SOFT : '#fff',
      color: acceso ? ADM.DESK_PRUGNA : ADM.MUTED, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      fontSize: 13.2, fontWeight: 700, position: 'relative',
    }}>
      <Ic size={17}/>{testo}
      {badge > 0 && <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 99, background: ADM.DESK_PRUGNA, color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{badge}</span>}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// La colonna di Ambiente
// ═══════════════════════════════════════════════════════════════════════════
function DkRigaColonna({ attiva, onClick, icona, testo, badge, menzioni, grassetto, avatar, live, privato }) {
  const Ic = icona ? BuIcons[icona] : null;
  return (
    <button onClick={onClick} className={'dk-riga' + (attiva ? ' is-attiva' : '')} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: avatar ? '5px 9px' : '7px 9px', borderRadius: 8,
      border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      background: attiva ? ADM.DESK_PRUGNA : 'transparent', color: attiva ? '#fff' : (grassetto ? ADM.TEXT : '#4A4A50'),
    }}>
      {avatar || (Ic && <span style={{ display: 'inline-flex', color: attiva ? ADM.DESK_LILLA : ADM.DESK_PRUGNA_CHIARO, opacity: grassetto || attiva ? 1 : 0.85 }}><Ic size={16}/></span>)}
      <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: grassetto || attiva ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.005em' }}>{testo}</span>
      {privato && <BuIcons.lock size={12} color={attiva ? ADM.DESK_LILLA : ADM.MUTED_SOFT}/>}
      {live && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4A6E', animation: 'dkLive 1.4s ease-in-out infinite' }}/>}
      {menzioni > 0 ? (
        <span style={{ minWidth: 19, height: 19, padding: '0 6px', borderRadius: 99, background: ADM.PINK, color: '#fff', fontSize: 11.2, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{menzioni}</span>
      ) : badge > 0 ? (
        <span style={{ fontSize: 11.8, fontWeight: 700, color: attiva ? ADM.DESK_LILLA : ADM.MUTED }}>{badge}</span>
      ) : null}
    </button>
  );
}

function DkTitoloSezione({ testo, onPiu, titoloPiu }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 9px 5px' }}>
      <span style={{ flex: 1, fontSize: 11.2, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.DESK_PRUGNA_CHIARO }}>{testo}</span>
      {onPiu && (
        <button onClick={onPiu} title={titoloPiu} className="dk-strumento" style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: 'transparent', color: ADM.DESK_PRUGNA_CHIARO, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <BuIcons.plus size={14}/>
        </button>
      )}
    </div>
  );
}

function DkColonna({ s, onNuovoCanale, onNuovoDiretto, cerca, setCerca }) {
  const [menuPresenza, setMenuPresenza] = useStateDk(false);
  const mie = s.attivita.filter(a => a.chi.includes(DK_IO) && a.stato !== 'fatto');
  const menzioniTot = s.canali.concat(s.diretti).reduce((x, c) => x + (c.menzioni || 0), 0);
  const live = s.riunioni.some(dkRiunioneInCorso);
  const io = dkPersona(DK_IO);
  return (
    <div style={{
      width: 252, flexShrink: 0, height: '100%', background: ADM.DESK_LILLA_BG, borderRight: `1px solid #EFE3EC`,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* La testata della colonna: lo spazio di lavoro e la mia presenza */}
      <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid #EFE3EC', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: ADM.DESK_LILLA, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <img src="desk-mark.png" alt="" style={{ height: 21, width: 'auto' }}/>
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: ADM.DESK_PRUGNA, letterSpacing: '-0.02em' }}>Ambiente</span>
            <span style={{ display: 'block', fontSize: 12, color: ADM.DESK_PRUGNA_CHIARO, marginTop: 1 }}>Team byup · {dkPersone().length} persone</span>
          </span>
        </div>
        <button onClick={() => setMenuPresenza(m => !m)} className="dk-riga" style={{
          marginTop: 11, width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', borderRadius: 9,
          border: '1px solid #EADCE6', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}>
          <DkAvatar id={DK_IO} size={24} presenza={s.presenza}/>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: ADM.TEXT }}>{io ? io.nome : 'Tu'}</span>
            <span style={{ display: 'block', fontSize: 11.6, color: DK_PRESENZE[s.presenza].colore, fontWeight: 700 }}>{DK_PRESENZE[s.presenza].label}</span>
          </span>
          <BuIcons.chevronDown size={14} color={ADM.MUTED_SOFT}/>
        </button>
        {menuPresenza && (
          <React.Fragment>
            <div onClick={() => setMenuPresenza(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
            <div style={{
              position: 'absolute', left: 14, right: 14, top: 'calc(100% - 4px)', zIndex: 41, background: '#fff', borderRadius: 12,
              border: `1px solid ${ADM.BORDER}`, boxShadow: '0 20px 48px -16px rgba(15,17,21,0.28)', padding: 6, animation: 'hubFlyIn 0.14s ease',
            }}>
              {Object.keys(DK_PRESENZE).map(k => (
                <button key={k} onClick={() => { dkAggiorna(() => ({ presenza: k })); setMenuPresenza(false); }} className="adm-actionrow" style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 8, border: 'none',
                  background: s.presenza === k ? ADM.DESK_LILLA_SOFT : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: DK_PRESENZE[k].colore }}/>
                  <span style={{ flex: 1, fontSize: 13.4, fontWeight: 600, color: ADM.TEXT }}>{DK_PRESENZE[k].label}</span>
                  {s.presenza === k && <BuIcons.check size={14} color={ADM.DESK_PRUGNA}/>}
                </button>
              ))}
            </div>
          </React.Fragment>
        )}
      </div>

      {/* La ricerca: messaggi, attività e riunioni, in un posto solo */}
      <div style={{ padding: '10px 12px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 10px', height: 34, borderRadius: 9, background: '#fff', border: '1px solid #EADCE6' }}>
          <BuIcons.search size={14} color={ADM.MUTED_SOFT}/>
          <input value={cerca} onChange={e => { setCerca(e.target.value); if (e.target.value.trim().length >= 2) dkAggiorna(() => ({ vista: 'cerca' })); }}
            placeholder="Cerca in Ambiente" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.2, fontFamily: 'inherit', color: ADM.TEXT, boxShadow: 'none' }}/>
          {cerca && <button onClick={() => { setCerca(''); dkApri('oggi'); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'grid', color: ADM.MUTED_SOFT }}><BuIcons.x size={13}/></button>}
        </div>
      </div>

      <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '6px 10px 16px' }}>
        <DkRigaColonna icona="inbox" testo="Per te" attiva={s.vista === 'oggi'} onClick={() => dkApri('oggi')} menzioni={menzioniTot} grassetto={menzioniTot > 0}/>
        <DkRigaColonna icona="checkSquare" testo="Attività" attiva={s.vista === 'attivita'} onClick={() => dkApri('attivita')} badge={mie.length}/>
        <DkRigaColonna icona="video" testo="Riunioni" attiva={s.vista === 'riunioni'} onClick={() => dkApri('riunioni')} live={live}/>

        <DkTitoloSezione testo="Canali" onPiu={onNuovoCanale} titoloPiu="Nuovo canale"/>
        {s.canali.map(c => (
          <DkRigaColonna key={c.id} icona="hash" testo={c.nome} privato={c.privato}
            attiva={s.vista === 'conv:' + c.id} onClick={() => dkApri('conv:' + c.id)}
            grassetto={c.nonLetti > 0} badge={c.nonLetti} menzioni={c.menzioni}
            live={!!s.huddle && s.huddle.conv === c.id}/>
        ))}

        <DkTitoloSezione testo="Messaggi diretti" onPiu={onNuovoDiretto} titoloPiu="Nuovo messaggio diretto"/>
        {s.diretti.map(d => {
          const gruppo = d.con.length > 1;
          return (
            <DkRigaColonna key={d.id} attiva={s.vista === 'conv:' + d.id} onClick={() => dkApri('conv:' + d.id)}
              testo={d.con.map(id => gruppo ? dkNomeBreve(id) : dkNome(id)).join(', ')}
              grassetto={d.nonLetti > 0} badge={d.nonLetti} menzioni={d.menzioni}
              avatar={gruppo
                ? <span style={{ width: 24, height: 24, borderRadius: 7, background: s.vista === 'conv:' + d.id ? 'rgba(255,255,255,0.18)' : ADM.DESK_LILLA_SOFT, color: s.vista === 'conv:' + d.id ? '#fff' : ADM.DESK_PRUGNA, display: 'grid', placeItems: 'center', fontSize: 11.5, fontWeight: 800, flexShrink: 0 }}>{d.con.length}</span>
                : <DkAvatar id={d.con[0]} size={24} presenza bordo={s.vista === 'conv:' + d.id ? ADM.DESK_PRUGNA : ADM.DESK_LILLA_BG}/>}/>
          );
        })}

        {/* Gli agenti scrivono nei canali come colleghi: qui un rimando alla
            loro pagina, non una seconda lista da tenere allineata. */}
        <DkTitoloSezione testo="Agenti"/>
        <DkRigaColonna icona="sparkFill" testo="La squadra degli agenti" onClick={() => window.hubVai && window.hubVai('agent')}/>
      </div>
      {s.huddle && <DkHuddle s={s}/>}
    </div>
  );
}

// Un riquadro della pagina Per te: titolo con l'icona in lilla, corpo che scorre.
function DkRiquadro({ titolo, icona, conta, children, azione }) {
  const Ic = BuIcons[icona];
  return (
    <div style={{ background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 16, boxShadow: ADM.CARD_SHADOW, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 16px 10px' }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: ADM.DESK_LILLA_SOFT, color: ADM.DESK_PRUGNA, display: 'grid', placeItems: 'center' }}><Ic size={15}/></span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.015em' }}>{titolo}</span>
        {conta !== undefined && <span style={{ fontSize: 12.4, fontWeight: 700, color: ADM.MUTED }}>{conta}</span>}
        {azione}
      </div>
      <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '0 8px 10px' }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Per te — la pagina d'ingresso
// ═══════════════════════════════════════════════════════════════════════════
function DkOggi({ s, onApriAttivita, onEntra }) {
  const io = dkPersona(DK_IO);
  const h = new Date(DK_ORA).getHours();
  const saluto = h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera';
  // Le menzioni: messaggi (e risposte) che mi nominano, i più recenti in cima.
  const menzioni = [];
  s.canali.concat(s.diretti).forEach(c => {
    (s.messaggi[c.id] || []).forEach(x => {
      if (x.da !== DK_IO && dkMenzionaMe(x.testo)) menzioni.push({ conv: c, m: x });
      (x.risposte || []).forEach(r => { if (r.da !== DK_IO && dkMenzionaMe(r.testo)) menzioni.push({ conv: c, m: r, padre: x }); });
    });
  });
  menzioni.sort((a, b) => b.m.t - a.m.t);
  const mie = s.attivita.filter(a => a.chi.includes(DK_IO) && a.stato !== 'fatto').sort((a, b) => (a.scadenza || 0) - (b.scadenza || 0));
  const agenda = s.riunioni.filter(r => r.chi.includes(DK_IO) && r.inizio.getTime() + r.durata * 60000 > DK_ORA).sort((a, b) => a.inizio - b.inizio).slice(0, 5);
  const nonLetti = s.canali.concat(s.diretti).reduce((a, c) => a + (c.nonLetti || 0), 0);
  const inRitardo = mie.filter(a => dkScadenza(a.scadenza).tono === 'ritardo' || dkScadenza(a.scadenza).tono === 'oggi').length;
  const prossima = agenda[0];
  const nomeConv = (c) => c.nome ? '#' + c.nome : c.con.map(dkNome).join(', ');



  return (
    <div className="hub-scroll" style={{ height: '100%', padding: '26px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18, animation: 'dkEntra 0.18s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.4, fontWeight: 700, color: ADM.DESK_PRUGNA_CHIARO, textTransform: 'capitalize' }}>{new Date(DK_ORA).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.03em', marginTop: 3 }}>{saluto}, {io ? io.nome.split(' ')[0] : ''}</div>
        </div>
      </div>

      {/* I quattro numeri: valore grande, etichetta piccola */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        {[
          { v: menzioni.length, l: 'Menzioni per te', sotto: menzioni.length ? 'da leggere' : 'nessuna', tono: menzioni.length ? ADM.PINK_DARK : ADM.TEXT, onClick: null },
          { v: nonLetti, l: 'Messaggi non letti', sotto: 'in ' + s.canali.concat(s.diretti).filter(c => c.nonLetti > 0).length + ' conversazioni', tono: ADM.TEXT },
          { v: mie.length, l: 'Attività tue aperte', sotto: inRitardo ? inRitardo + ' in scadenza o in ritardo' : 'niente in ritardo', tono: inRitardo ? ADM.WARN : ADM.TEXT, onClick: () => dkApri('attivita') },
          { v: prossima ? dkOra(prossima.inizio) : '—', l: 'Prossima riunione', sotto: prossima ? (dkRiunioneInCorso(prossima) ? 'in corso · ' : '') + prossima.titolo : 'niente in agenda', tono: prossima && dkRiunioneInCorso(prossima) ? ADM.DESK_PRUGNA : ADM.TEXT, onClick: () => dkApri('riunioni') },
        ].map((t, i) => (
          <div key={i} onClick={t.onClick || undefined} className={t.onClick ? 'dk-card' : undefined} style={{ background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 14, padding: '14px 16px', boxShadow: ADM.CARD_SHADOW, minWidth: 0 }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.035em', color: t.tono, lineHeight: 1 }}>{t.v}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: ADM.TEXT, marginTop: 8 }}>{t.l}</div>
            <div style={{ fontSize: 12.2, color: ADM.MUTED, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.sotto}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 360, display: 'grid', gridTemplateColumns: '1.15fr 1fr 0.95fr', gap: 14 }}>
        <DkRiquadro titolo="Ti hanno menzionato" icona="at" conta={menzioni.length}>
          {menzioni.length === 0 && <div style={{ padding: '24px 10px', fontSize: 13.4, color: ADM.MUTED, textAlign: 'center' }}>Nessuna menzione: sei in pari.</div>}
          {menzioni.map((x, i) => (
            <button key={i} onClick={() => dkApri('conv:' + x.conv.id)} className="adm-actionrow" style={{
              width: '100%', display: 'flex', gap: 10, padding: '10px 9px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }}>
              <DkAvatar id={x.m.da} size={32}/>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 13.6, fontWeight: 700, color: ADM.TEXT }}>{dkNome(x.m.da)}</span>
                  <span style={{ fontSize: 12, color: ADM.MUTED }}>in {nomeConv(x.conv)}{x.padre ? ' · thread' : ''}</span>
                  <span style={{ flex: 1 }}/>
                  <span style={{ fontSize: 11.8, color: ADM.MUTED_SOFT, whiteSpace: 'nowrap' }}>{dkFaQuanto(x.m.t)}</span>
                </span>
                <span style={{ fontSize: 13.4, color: '#3A3A40', marginTop: 3, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}><DkTesto testo={x.m.testo}/></span>
              </span>
            </button>
          ))}
        </DkRiquadro>

        <DkRiquadro titolo="Le tue attività" icona="checkSquare" conta={mie.length}
          azione={<button onClick={() => dkApri('attivita')} className="adm-textlink" style={{ border: 'none', background: 'transparent', color: ADM.DESK_PRUGNA, fontWeight: 700, fontSize: 12.6, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 8 }}>Tutte</button>}>
          {mie.map(a => (
            <div key={a.id} className="adm-actionrow" onClick={() => onApriAttivita(a.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 9px', borderRadius: 10, cursor: 'pointer' }}>
              <DkSpunta fatta={a.stato === 'fatto'} onClick={(e) => { e.stopPropagation(); dkCambiaAttivita(a.id, { stato: a.stato === 'fatto' ? 'da_fare' : 'fatto' }); }}/>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.6, fontWeight: 600, color: ADM.TEXT, lineHeight: 1.35 }}>{a.titolo}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                  <DkScadenza data={a.scadenza} piccola/>
                  <span style={{ fontSize: 12, color: ADM.MUTED }}>#{(s.canali.find(c => c.id === a.canale) || {}).nome}</span>
                </span>
              </span>
            </div>
          ))}
        </DkRiquadro>

        <DkRiquadro titolo="La tua agenda" icona="calendar" conta={agenda.length}>
          {agenda.map(r => {
            const live = dkRiunioneInCorso(r);
            return (
              <div key={r.id} style={{ display: 'flex', gap: 11, padding: '10px 9px', borderRadius: 10, background: live ? ADM.DESK_LILLA_SOFT : 'transparent', marginBottom: 2 }}>
                <span style={{ width: 46, flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: live ? ADM.DESK_PRUGNA : ADM.TEXT, letterSpacing: '-0.02em' }}>{dkOra(r.inizio)}</span>
                  <span style={{ display: 'block', fontSize: 11.4, color: ADM.MUTED, marginTop: 1 }}>{dkStessoGiorno(r.inizio, new Date(DK_ORA)) ? r.durata + ' min' : dkEtichettaGiorno(r.inizio).split(' ')[0]}</span>
                </span>
                <span style={{ width: 3, borderRadius: 2, background: live ? ADM.DESK_PRUGNA : ADM.DESK_LILLA, flexShrink: 0 }}/>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.6, fontWeight: 700, color: ADM.TEXT, lineHeight: 1.3 }}>{r.titolo}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <DkPila ids={r.chi} size={20} bordo={live ? ADM.DESK_LILLA_SOFT : '#fff'}/>
                    <span style={{ flex: 1 }}/>
                    {live
                      ? <button onClick={() => onEntra(r)} style={{ padding: '5px 11px', borderRadius: 8, border: 'none', background: ADM.DESK_PRUGNA, color: '#fff', fontSize: 12.4, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Partecipa</button>
                      : r.contatto ? <span style={{ minWidth: 0, maxWidth: 150, overflow: 'hidden', display: 'inline-flex' }}><DkContatto id={r.contatto} compatto/></span> : null}
                  </span>
                </span>
              </div>
            );
          })}
        </DkRiquadro>
      </div>
    </div>
  );
}

function DkSpunta({ fatta, onClick, size = 18 }) {
  return (
    <button onClick={onClick} className="dk-check" title={fatta ? 'Riapri' : 'Segna come fatta'} style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0, marginTop: 1, cursor: 'pointer', padding: 0,
      border: fatta ? 'none' : `1.6px solid ${ADM.MUTED_LIGHT}`, background: fatta ? ADM.OK : '#fff',
      display: 'grid', placeItems: 'center', color: '#fff',
    }}>{fatta && <BuIcons.check size={size - 6} strokeWidth={3}/>}</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// La conversazione — canale o messaggio diretto
// ═══════════════════════════════════════════════════════════════════════════
function DkMessaggio({ conv, x, prec, onThread, onAttivita, onApriAttivita, onEntra, nelThread, padreId, s }) {
  const [emoji, setEmoji] = useStateDk(false);
  const raggruppa = prec && prec.da === x.da && !prec.sistema && !x.sistema && (x.t - prec.t) < 5 * 60000 && !nelThread;
  const agente = !dkPersona(x.da);
  if (x.sistema) {
    const IcSis = BuIcons[x.icona || 'info'];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '8px 20px', fontSize: 12.6, color: ADM.MUTED }}>
        <IcSis size={13}/>
        <span><b style={{ color: ADM.TEXT, fontWeight: 700 }}>{dkNome(x.da)}</b> {x.testo}</span>
        <span style={{ color: ADM.MUTED_SOFT }}>· {dkOra(x.t)}</span>
      </div>
    );
  }
  const attivita = x.attivita ? s.attivita.find(a => a.id === x.attivita) : null;
  const riunione = x.riunione ? s.riunioni.find(r => r.id === x.riunione) : null;
  const risposte = x.risposte || [];
  const mia = dkMenzionaMe(x.testo) && x.da !== DK_IO;
  return (
    <div className={'dk-msg' + (mia ? ' is-mia-menzione' : '')} style={{ display: 'flex', gap: 11, padding: raggruppa ? '2px 22px 3px' : '9px 22px 4px' }}>
      <div style={{ width: 36, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        {raggruppa
          ? <span className="dk-ora-grp" style={{ fontSize: 10.5, color: 'transparent', paddingTop: 4 }}>{dkOra(x.t)}</span>
          : <DkAvatar id={x.da} size={36}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {!raggruppa && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14.4, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.01em' }}>{dkNome(x.da)}</span>
            {agente && <span style={{ fontSize: 10.8, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: ADM.HUB_VIOLA_DARK, background: ADM.HUB_VIOLA_SOFT, padding: '1px 6px', borderRadius: 5 }}>Agente</span>}
            <span style={{ fontSize: 12, color: ADM.MUTED_SOFT }}>{dkOra(x.t)}</span>
            {x.fissato && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.6, fontWeight: 700, color: ADM.WARN }}><BuIcons.pin size={11}/>Fissato</span>}
          </div>
        )}
        <div style={{ fontSize: 14.4, color: '#24262B', lineHeight: 1.55 }}><DkTesto testo={x.testo}/></div>

        {(x.allegati || []).length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>{x.allegati.map((f, i) => <DkFile key={i} f={f}/>)}</div>
        )}
        {x.contatto && <div style={{ marginTop: 8 }}><DkContatto id={x.contatto}/></div>}
        {attivita && <div style={{ marginTop: 8 }}><DkCardAttivita a={attivita} onApri={onApriAttivita}/></div>}
        {riunione && <div style={{ marginTop: 8 }}><DkCardRiunione r={riunione} onEntra={onEntra}/></div>}

        {(x.reazioni || []).length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7 }}>
            {x.reazioni.map(r => {
              const mio = r.chi.includes(DK_IO);
              return (
                <button key={r.e} className="dk-reazione" onClick={() => dkReagisci(conv, padreId || x.id, r.e, padreId ? x.id : null)}
                  title={r.chi.map(dkNomeBreve).join(', ')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', height: 26, borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1px solid ${mio ? ADM.DESK_LILLA : ADM.BORDER}`, background: mio ? ADM.DESK_LILLA_SOFT : '#fff',
                    fontSize: 12.6, fontWeight: 700, color: mio ? ADM.DESK_PRUGNA : ADM.MUTED,
                  }}><span style={{ fontSize: 14 }}>{r.e}</span>{r.chi.length}</button>
              );
            })}
          </div>
        )}

        {!nelThread && risposte.length > 0 && (
          <button onClick={() => onThread(x.id)} className="dk-riga" style={{
            marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px 4px 4px', borderRadius: 8,
            border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <DkPila ids={Array.from(new Set(risposte.map(r => r.da)))} size={20} max={3}/>
            <span style={{ fontSize: 13, fontWeight: 800, color: ADM.DESK_PRUGNA }}>{risposte.length} {risposte.length === 1 ? 'risposta' : 'risposte'}</span>
            <span style={{ fontSize: 12.2, color: ADM.MUTED }}>ultima {dkFaQuanto(risposte[risposte.length - 1].t)}</span>
          </button>
        )}
      </div>

      {/* La barra degli strumenti compare al passaggio del mouse */}
      <div className={'dk-strumenti' + (emoji ? ' is-aperti' : '')} style={{
        position: 'absolute', right: 18, top: -14, display: 'flex', alignItems: 'center', gap: 1, padding: 3,
        background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 10, boxShadow: '0 8px 20px -10px rgba(15,17,21,0.25)', zIndex: 3,
      }}>
        {['👍', '✅', '👀'].map(e => (
          <button key={e} className="dk-strumento" onClick={() => dkReagisci(conv, padreId || x.id, e, padreId ? x.id : null)} title={'Reagisci ' + e} style={{ width: 30, height: 28, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15 }}>{e}</button>
        ))}
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <button className="dk-strumento" onClick={() => setEmoji(v => !v)} title="Altre reazioni" style={{ width: 30, height: 28, borderRadius: 7, border: 'none', background: emoji ? ADM.DESK_LILLA_SOFT : 'transparent', color: ADM.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><BuIcons.smile size={16}/></button>
          {emoji && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', display: 'grid', gridTemplateColumns: 'repeat(4, 34px)', gap: 2, padding: 6, background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 12, boxShadow: '0 18px 40px -16px rgba(15,17,21,0.3)', zIndex: 5 }}>
              {DK_REAZIONI_RAPIDE.map(e => (
                <button key={e} className="dk-strumento" onClick={() => { dkReagisci(conv, padreId || x.id, e, padreId ? x.id : null); setEmoji(false); }} style={{ width: 34, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 17 }}>{e}</button>
              ))}
            </div>
          )}
        </span>
        {!nelThread && <button className="dk-strumento" onClick={() => onThread(x.id)} title="Rispondi nel thread" style={{ width: 30, height: 28, borderRadius: 7, border: 'none', background: 'transparent', color: ADM.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><BuIcons.reply size={16}/></button>}
        {!nelThread && !x.attivita && <button className="dk-strumento" onClick={() => onAttivita(x)} title="Crea un'attività da questo messaggio" style={{ width: 30, height: 28, borderRadius: 7, border: 'none', background: 'transparent', color: ADM.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><BuIcons.checkSquare size={16}/></button>}
        {!nelThread && <button className="dk-strumento" onClick={() => dkModificaMessaggio(conv, x.id, m => ({ fissato: !m.fissato }))} title={x.fissato ? 'Togli dai fissati' : 'Fissa nel canale'} style={{ width: 30, height: 28, borderRadius: 7, border: 'none', background: 'transparent', color: x.fissato ? ADM.WARN : ADM.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><BuIcons.pin size={15}/></button>}
      </div>
    </div>
  );
}

// Il compositore: testo, @menzioni, emoji, allegati veri (il file si sceglie
// davvero, ma nel prototipo non parte: resta il nome e il peso).
function DkCompositore({ segnaposto, onInvia, compatto, extra }) {
  const [testo, setTesto] = useStateDk('');
  const [allegati, setAllegati] = useStateDk([]);
  const [emoji, setEmoji] = useStateDk(false);
  const [menzione, setMenzione] = useStateDk(null); // testo dopo la @
  const ref = useRefDk(null);
  const fileRef = useRefDk(null);
  const candidati = menzione !== null
    ? dkPersone().filter(p => !p.io && p.nome.toLowerCase().includes(menzione.toLowerCase())).slice(0, 6)
    : [];
  const aggiorna = (v) => {
    setTesto(v);
    const el = ref.current;
    const pos = el ? el.selectionStart : v.length;
    const prima = v.slice(0, pos);
    const mm = prima.match(/@([A-Za-zÀ-ÿ]*)$/);
    setMenzione(mm ? mm[1] : null);
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(160, el.scrollHeight) + 'px'; }
  };
  const scegli = (p) => {
    const el = ref.current;
    const pos = el ? el.selectionStart : testo.length;
    const prima = testo.slice(0, pos).replace(/@([A-Za-zÀ-ÿ]*)$/, '@' + p.nome + ' ');
    const nuovo = prima + testo.slice(pos);
    setTesto(nuovo); setMenzione(null);
    setTimeout(() => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = prima.length; } }, 0);
  };
  const invia = () => {
    if (!testo.trim() && !allegati.length) return;
    onInvia(dkCodificaMenzioni(testo.trim()), allegati);
    setTesto(''); setAllegati([]); setMenzione(null);
    if (ref.current) ref.current.style.height = 'auto';
  };
  const avvolgi = (seg) => {
    const el = ref.current; if (!el) return;
    const a = el.selectionStart; const b = el.selectionEnd;
    const sel = testo.slice(a, b) || 'testo';
    const nuovo = testo.slice(0, a) + seg + sel + seg + testo.slice(b);
    setTesto(nuovo);
    setTimeout(() => { el.focus(); el.selectionStart = a + seg.length; el.selectionEnd = a + seg.length + sel.length; }, 0);
  };
  const tastoStile = { width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', color: ADM.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center' };
  return (
    <div style={{ position: 'relative' }}>
      {candidati.length > 0 && (
        <div style={{ position: 'absolute', left: 0, bottom: 'calc(100% + 6px)', width: 300, background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 12, boxShadow: '0 20px 44px -16px rgba(15,17,21,0.3)', padding: 5, zIndex: 6, animation: 'dkSu 0.12s ease' }}>
          <div style={{ padding: '5px 8px 4px', fontSize: 11, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>Menziona</div>
          {candidati.map(p => (
            <button key={p.id} onMouseDown={(e) => { e.preventDefault(); scegli(p); }} className="adm-actionrow" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <DkAvatar id={p.id} size={24} presenza/>
              <span style={{ flex: 1, fontSize: 13.4, fontWeight: 700, color: ADM.TEXT }}>{p.nome}</span>
              <span style={{ fontSize: 11.8, color: ADM.MUTED }}>{p.ruolo}</span>
            </button>
          ))}
        </div>
      )}
      <div style={{ border: `1px solid ${ADM.BORDER}`, borderRadius: 14, background: '#fff', boxShadow: '0 1px 2px rgba(15,17,21,0.04)' }}>
        {!compatto && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 1, padding: '5px 7px 0' }}>
            <button className="dk-strumento" onClick={() => avvolgi('**')} title="Grassetto" style={tastoStile}><BuIcons.bold size={15}/></button>
            <button className="dk-strumento" onClick={() => avvolgi('`')} title="Codice" style={tastoStile}><BuIcons.code size={15}/></button>
            <span style={{ width: 1, height: 16, background: ADM.BORDER, margin: '0 4px' }}/>
            <button className="dk-strumento" onClick={() => { aggiorna(testo + (testo && !testo.endsWith(' ') ? ' @' : '@')); setTimeout(() => ref.current && ref.current.focus(), 0); }} title="Menziona qualcuno" style={tastoStile}><BuIcons.at size={15}/></button>
          </div>
        )}
        <textarea ref={ref} value={testo} rows={1} placeholder={segnaposto}
          onChange={e => aggiorna(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (candidati.length) scegli(candidati[0]); else invia();
            }
            if (e.key === 'Escape') setMenzione(null);
          }}
          style={{
            display: 'block', width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', resize: 'none', boxShadow: 'none',
            padding: compatto ? '10px 12px 4px' : '6px 13px 4px', fontSize: 14.4, lineHeight: 1.5, fontFamily: 'inherit', color: ADM.TEXT,
            background: 'transparent', minHeight: compatto ? 38 : 42, maxHeight: 160,
          }}/>
        {allegati.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '4px 10px' }}>
            {allegati.map((f, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 9px', borderRadius: 8, background: ADM.NEUTRAL_SOFT, fontSize: 12.4, fontWeight: 600, color: ADM.TEXT }}>
                <BuIcons.paperclip size={12}/>{f.nome}<span style={{ color: ADM.MUTED, fontWeight: 500 }}>{f.peso}</span>
                <button onClick={() => setAllegati(a => a.filter((_, j) => j !== i))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: ADM.MUTED, display: 'grid' }}><BuIcons.x size={12}/></button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '4px 7px 7px' }}>
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => {
            const nuovi = Array.from(e.target.files || []).map(f => ({ nome: f.name, tipo: dkTipoDaNome(f.name), peso: dkPeso(f.size) }));
            setAllegati(a => a.concat(nuovi)); e.target.value = '';
          }}/>
          <button className="dk-strumento" onClick={() => fileRef.current && fileRef.current.click()} title="Allega un file" style={tastoStile}><BuIcons.paperclip size={16}/></button>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <button className="dk-strumento" onClick={() => setEmoji(v => !v)} title="Emoji" style={tastoStile}><BuIcons.smile size={16}/></button>
            {emoji && (
              <div style={{ position: 'absolute', left: 0, bottom: 'calc(100% + 6px)', display: 'grid', gridTemplateColumns: 'repeat(4, 34px)', gap: 2, padding: 6, background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 12, boxShadow: '0 18px 40px -16px rgba(15,17,21,0.3)', zIndex: 6 }}>
                {DK_REAZIONI_RAPIDE.map(e => (
                  <button key={e} className="dk-strumento" onClick={() => { setTesto(t => t + e); setEmoji(false); if (ref.current) ref.current.focus(); }} style={{ width: 34, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 17 }}>{e}</button>
                ))}
              </div>
            )}
          </span>
          {extra}
          <span style={{ flex: 1 }}/>
          {!compatto && <span style={{ fontSize: 11.6, color: ADM.MUTED_SOFT, marginRight: 8 }}>Invio per mandare · Maiusc+Invio a capo</span>}
          <button onClick={invia} disabled={!testo.trim() && !allegati.length} title="Invia" style={{
            height: 32, padding: '0 12px', borderRadius: 9, border: 'none', cursor: testo.trim() || allegati.length ? 'pointer' : 'default',
            background: testo.trim() || allegati.length ? ADM.DESK_PRUGNA : ADM.NEUTRAL_SOFT, color: testo.trim() || allegati.length ? '#fff' : ADM.MUTED_LIGHT,
            display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, transition: 'background 0.14s ease',
          }}><BuIcons.send size={14}/>{compatto ? '' : 'Invia'}</button>
        </div>
      </div>
    </div>
  );
}

function DkThread({ s, conv, id, onChiudi, onApriAttivita, onEntra }) {
  const x = (s.messaggi[conv] || []).find(m => m.id === id);
  const fondo = useRefDk(null);
  const n = x ? x.risposte.length : 0;
  useEffectDk(() => { if (fondo.current) fondo.current.scrollTop = fondo.current.scrollHeight; }, [n, id]);
  if (!x) return null;
  const c = s.canali.find(cc => cc.id === conv);
  return (
    <div style={{ width: 360, flexShrink: 0, height: '100%', borderLeft: `1px solid ${ADM.BORDER}`, background: '#fff', display: 'flex', flexDirection: 'column', animation: 'hubPannelloIn 0.2s cubic-bezier(0.32,0.72,0,1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${ADM.BORDER}` }}>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 15.5, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.015em' }}>Thread</span>
          <span style={{ display: 'block', fontSize: 12.2, color: ADM.MUTED }}>{c ? '#' + c.nome : 'Messaggio diretto'}</span>
        </span>
        <button onClick={onChiudi} title="Chiudi" className="adm-iconbtn" style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: ADM.NEUTRAL_SOFT, color: ADM.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><BuIcons.x size={16}/></button>
      </div>
      <div ref={fondo} className="hub-scroll" style={{ flex: 1, minHeight: 0, paddingTop: 8 }}>
        <DkMessaggio conv={conv} x={x} s={s} nelThread onApriAttivita={onApriAttivita} onEntra={onEntra} onThread={() => {}} onAttivita={() => {}}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 22px' }}>
          <span style={{ fontSize: 12.2, fontWeight: 700, color: ADM.MUTED }}>{n} {n === 1 ? 'risposta' : 'risposte'}</span>
          <span style={{ flex: 1, height: 1, background: ADM.BORDER_SOFT }}/>
        </div>
        {x.risposte.map((r, i) => (
          <DkMessaggio key={r.id} conv={conv} x={r} prec={i > 0 ? x.risposte[i - 1] : null} s={s} nelThread padreId={x.id} onApriAttivita={onApriAttivita} onEntra={onEntra} onThread={() => {}} onAttivita={() => {}}/>
        ))}
        <div style={{ height: 10 }}/>
      </div>
      <div style={{ padding: '10px 14px 14px' }}>
        <DkCompositore compatto segnaposto="Rispondi…" onInvia={(t) => dkRispondi(conv, x.id, t)}/>
      </div>
    </div>
  );
}

function DkConversazione({ s, convId, onApriAttivita, onNuovaAttivita, onEntra, onRiunione }) {
  const canale = s.canali.find(c => c.id === convId);
  const diretto = s.diretti.find(d => d.id === convId);
  const [tab, setTab] = useStateDk('messaggi');
  const [thread, setThread] = useStateDk(null);
  const fondo = useRefDk(null);
  const lista = s.messaggi[convId] || [];
  useEffectDk(() => { setTab('messaggi'); setThread(null); }, [convId]);
  useEffectDk(() => { if (fondo.current && tab === 'messaggi') fondo.current.scrollTop = fondo.current.scrollHeight; }, [convId, lista.length, tab]);
  if (!canale && !diretto) return null;
  const membri = canale ? (canale.privato ? ['admin0', 'admin1'] : dkPersone().map(p => p.id)) : diretto.con.concat([DK_IO]);
  const titolo = canale ? canale.nome : diretto.con.map(dkNome).join(', ');
  const tema = canale ? canale.tema : (diretto.con.length === 1 ? (dkPersona(diretto.con[0]) || {}).ruolo + (DK_NOTA_DI[diretto.con[0]] ? ' · ' + DK_NOTA_DI[diretto.con[0]] : '') : 'Conversazione di gruppo');
  const attivita = s.attivita.filter(a => a.canale === convId);
  const fissati = lista.filter(m => m.fissato);
  const file = [];
  lista.forEach(m => (m.allegati || []).forEach(f => file.push({ f, m })));
  const huddleQui = s.huddle && s.huddle.conv === convId;

  const tabs = [
    { id: 'messaggi', label: 'Messaggi' },
    canale && { id: 'attivita', label: 'Attività', n: attivita.filter(a => a.stato !== 'fatto').length },
    { id: 'file', label: 'File', n: file.length },
    { id: 'fissati', label: 'Fissati', n: fissati.length },
  ].filter(Boolean);

  // Separatori di giorno fra i messaggi.
  const righe = [];
  lista.forEach((m, i) => {
    const p = lista[i - 1];
    if (!p || !dkStessoGiorno(p.t, m.t)) righe.push({ giorno: m.t, key: 'giorno-' + i });
    righe.push({ m, prec: p && dkStessoGiorno(p.t, m.t) ? p : null, key: m.id });
  });

  return (
    <div style={{ display: 'flex', height: '100%', minWidth: 0, flex: 1 }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* Testata */}
        <div style={{ padding: '14px 22px 0', borderBottom: `1px solid ${ADM.BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {canale
              ? <span style={{ width: 36, height: 36, borderRadius: 10, background: ADM.DESK_LILLA_SOFT, color: ADM.DESK_PRUGNA, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{canale.privato ? <BuIcons.lock size={17}/> : <BuIcons.hash size={18}/>}</span>
              : diretto.con.length === 1 ? <DkAvatar id={diretto.con[0]} size={36} presenza/> : <DkPila ids={diretto.con} size={30}/>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17.5, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titolo}</div>
              <div style={{ fontSize: 12.8, color: ADM.MUTED, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tema}</div>
            </div>
            <span title={membri.length + ' membri'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginRight: 4 }}>
              <DkPila ids={membri} size={24} max={4}/>
            </span>
            <DkTasto icona="headphones" titolo={huddleQui ? 'Esci dalla huddle' : 'Avvia una huddle: solo voce, senza appuntamento'} acceso={huddleQui}
              onClick={() => {
                if (huddleQui) { dkAggiorna(() => ({ huddle: null })); return; }
                dkAggiorna(() => ({ huddle: { conv: convId, inizio: Date.now(), muto: false } }));
                dkScrivi(convId, 'ha avviato una huddle', { sistema: true, icona: 'headphones' });
              }}/>
            <DkTasto icona="video" testo="Riunione" titolo="Avvia subito una riunione video con il canale" onClick={() => onRiunione(convId, titolo)}/>
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className="dk-tab" style={{
                padding: '8px 1px 10px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                borderBottom: `2px solid ${tab === t.id ? ADM.DESK_PRUGNA : 'transparent'}`, marginBottom: -1,
                fontSize: 13.6, fontWeight: tab === t.id ? 800 : 600, color: tab === t.id ? ADM.DESK_PRUGNA : ADM.MUTED,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>{t.label}{t.n > 0 && <span style={{ fontSize: 11.4, fontWeight: 800, padding: '1px 6px', borderRadius: 99, background: tab === t.id ? ADM.DESK_LILLA_SOFT : ADM.NEUTRAL_SOFT, color: tab === t.id ? ADM.DESK_PRUGNA : ADM.MUTED }}>{t.n}</span>}</button>
            ))}
          </div>
        </div>

        {tab === 'messaggi' && (
          <React.Fragment>
            <div ref={fondo} className="hub-scroll" style={{ flex: 1, minHeight: 0, paddingBottom: 10 }}>
              {/* L'inizio della conversazione: dice dove sei */}
              <div style={{ padding: '26px 22px 10px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.025em' }}>{canale ? (canale.privato ? '🔒 ' : '#') + canale.nome : titolo}</div>
                <div style={{ fontSize: 13.4, color: ADM.MUTED, marginTop: 4, maxWidth: 560, lineHeight: 1.5 }}>
                  {canale ? 'Questo è l\'inizio di #' + canale.nome + '. ' + canale.tema + '.' : 'Questa è la vostra conversazione diretta. Solo voi la vedete.'}
                </div>
              </div>
              {righe.map(r => r.giorno ? (
                <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px 4px' }}>
                  <span style={{ flex: 1, height: 1, background: ADM.BORDER_SOFT }}/>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ADM.MUTED, padding: '3px 10px', border: `1px solid ${ADM.BORDER}`, borderRadius: 99, background: '#fff' }}>{dkEtichettaGiorno(r.giorno)}</span>
                  <span style={{ flex: 1, height: 1, background: ADM.BORDER_SOFT }}/>
                </div>
              ) : (
                <DkMessaggio key={r.key} conv={convId} x={r.m} prec={r.prec} s={s}
                  onThread={setThread} onAttivita={(m) => onNuovaAttivita(convId, m)} onApriAttivita={onApriAttivita} onEntra={onEntra}/>
              ))}
            </div>
            <div style={{ padding: '6px 20px 16px' }}>
              <DkCompositore segnaposto={'Scrivi ' + (canale ? 'in #' + canale.nome : 'a ' + titolo)}
                onInvia={(t, allegati) => dkScrivi(convId, t, allegati.length ? { allegati } : null)}
                extra={canale && (
                  <button className="dk-strumento" onClick={() => onNuovaAttivita(convId, null)} title="Nuova attività in questo canale" style={{ height: 30, padding: '0 9px', borderRadius: 8, border: 'none', background: 'transparent', color: ADM.MUTED, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 12.6, fontWeight: 700 }}>
                    <BuIcons.checkSquare size={15}/>Attività
                  </button>
                )}/>
            </div>
          </React.Fragment>
        )}

        {tab === 'attivita' && (
          <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '16px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ flex: 1, fontSize: 13.4, color: ADM.MUTED }}>Le attività di #{canale.nome}. Le vedi tutte insieme in <b style={{ color: ADM.TEXT }}>Attività</b>.</span>
              <HubStrumento forte icona="plus" onClick={() => onNuovaAttivita(convId, null)}>Nuova attività</HubStrumento>
            </div>
            <DkListaAttivita s={s} elenco={attivita} onApri={onApriAttivita} senzaCanale/>
          </div>
        )}

        {tab === 'file' && (
          <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '18px 22px' }}>
            {file.length === 0
              ? <HubVuoto icona="paperclip" titolo="Nessun file" desc="I file allegati ai messaggi compaiono qui, in ordine di arrivo."/>
              : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
                  {file.slice().reverse().map((x, i) => (
                    <div key={i}>
                      <DkFile f={x.f} largo/>
                      <div style={{ fontSize: 11.8, color: ADM.MUTED, margin: '5px 4px 0' }}>{dkNome(x.m.da)} · {dkEtichettaGiorno(x.m.t)} alle {dkOra(x.m.t)}</div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {tab === 'fissati' && (
          <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '10px 0' }}>
            {fissati.length === 0
              ? <HubVuoto icona="pin" titolo="Niente di fissato" desc="Fissa un messaggio dalla sua barra (il segnaposto) per ritrovarlo qui: decisioni, link, regole del canale."/>
              : fissati.map(m => <DkMessaggio key={m.id} conv={convId} x={m} s={s} onThread={(id) => { setTab('messaggi'); setThread(id); }} onAttivita={(mm) => onNuovaAttivita(convId, mm)} onApriAttivita={onApriAttivita} onEntra={onEntra}/>)}
          </div>
        )}
      </div>
      {thread && tab !== 'attivita' && <DkThread s={s} conv={convId} id={thread} onChiudi={() => setThread(null)} onApriAttivita={onApriAttivita} onEntra={onEntra}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Attività — lista e bacheca
// ═══════════════════════════════════════════════════════════════════════════
function DkListaAttivita({ s, elenco, onApri, senzaCanale }) {
  const [chiusi, setChiusi] = useStateDk({ fatto: true });
  const col = senzaCanale ? 'minmax(0,1fr) 96px 132px 92px' : 'minmax(0,1fr) 140px 96px 132px 92px';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {DK_STATI.map(st => {
        const righe = elenco.filter(a => a.stato === st.id);
        const chiuso = !!chiusi[st.id];
        return (
          <div key={st.id} style={{ background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            <button onClick={() => setChiusi(c => Object.assign({}, c, { [st.id]: !chiuso }))} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: st.soft, textAlign: 'left',
            }}>
              <span style={{ display: 'inline-flex', color: st.colore, transform: chiuso ? 'rotate(-90deg)' : 'none', transition: 'transform 0.14s ease' }}><BuIcons.chevronDown size={15}/></span>
              <span style={{ fontSize: 13.4, fontWeight: 800, color: st.colore, letterSpacing: '0.01em' }}>{st.label}</span>
              <span style={{ fontSize: 12.4, fontWeight: 700, color: st.colore, opacity: 0.75 }}>{righe.length}</span>
            </button>
            {!chiuso && (
              <div>
                {righe.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: col, gap: 12, padding: '8px 14px 6px 44px', fontSize: 11, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
                    <span>Attività</span>{!senzaCanale && <span>Canale</span>}<span>Assegnata a</span><span>Scadenza</span><span>Priorità</span>
                  </div>
                )}
                {righe.map((a, i) => {
                  const fatti = (a.checklist || []).filter(c => c.ok).length;
                  return (
                    <div key={a.id} onClick={() => onApri(a.id)} className="adm-row-open" style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', cursor: 'pointer',
                      borderBottom: i === righe.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
                    }}>
                      <DkSpunta fatta={a.stato === 'fatto'} onClick={(e) => { e.stopPropagation(); dkCambiaAttivita(a.id, { stato: a.stato === 'fatto' ? 'da_fare' : 'fatto' }); }}/>
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: col, gap: 12, alignItems: 'center', minWidth: 0 }}>
                        <span style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13.8, fontWeight: 600, color: a.stato === 'fatto' ? ADM.MUTED : ADM.TEXT, textDecoration: a.stato === 'fatto' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titolo}</span>
                          {a.contatto && <BuIcons.storeFill size={13} color={ADM.PINK}/>}
                          {(a.checklist || []).length > 0 && <span style={{ fontSize: 11.6, fontWeight: 700, color: ADM.MUTED, flexShrink: 0 }}>{fatti}/{a.checklist.length}</span>}
                        </span>
                        {!senzaCanale && <span style={{ fontSize: 12.6, color: ADM.MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>#{(s.canali.find(c => c.id === a.canale) || {}).nome || '—'}</span>}
                        <span><DkPila ids={a.chi} size={22} max={3}/></span>
                        <span><DkScadenza data={a.scadenza} piccola/></span>
                        <span><DkBandiera priorita={a.priorita}/></span>
                      </div>
                    </div>
                  );
                })}
                {righe.length === 0 && <div style={{ padding: '12px 44px', fontSize: 12.8, color: ADM.MUTED_SOFT }}>Niente qui.</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DkBacheca({ s, elenco, onApri }) {
  const [trascina, setTrascina] = useStateDk(null);
  const [sopra, setSopra] = useStateDk(null);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, alignItems: 'start', minHeight: '100%' }}>
      {DK_STATI.map(st => {
        const righe = elenco.filter(a => a.stato === st.id);
        return (
          <div key={st.id}
            onDragOver={(e) => { e.preventDefault(); if (sopra !== st.id) setSopra(st.id); }}
            onDragLeave={() => setSopra(x => x === st.id ? null : x)}
            onDrop={(e) => { e.preventDefault(); if (trascina) dkCambiaAttivita(trascina, { stato: st.id }); setTrascina(null); setSopra(null); }}
            className={'dk-colonna-bacheca' + (sopra === st.id ? ' is-sopra' : '')}
            style={{ background: '#F4F4F6', borderRadius: 14, padding: 8, minHeight: 200, transition: 'background 0.12s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 10px' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: st.colore }}/>
              <span style={{ fontSize: 13.4, fontWeight: 800, color: ADM.TEXT }}>{st.label}</span>
              <span style={{ fontSize: 12.4, fontWeight: 700, color: ADM.MUTED }}>{righe.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {righe.map(a => {
                const fatti = (a.checklist || []).filter(c => c.ok).length;
                const tot = (a.checklist || []).length;
                return (
                  <div key={a.id} draggable onDragStart={() => setTrascina(a.id)} onDragEnd={() => { setTrascina(null); setSopra(null); }}
                    onClick={() => onApri(a.id)} className="dk-card" style={{
                      background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 12, padding: '11px 12px', boxShadow: '0 1px 2px rgba(15,17,21,0.05)',
                      opacity: trascina === a.id ? 0.45 : 1, cursor: 'grab',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 11.4, fontWeight: 700, color: ADM.MUTED }}>#{(s.canali.find(c => c.id === a.canale) || {}).nome}</span>
                      <span style={{ flex: 1 }}/>
                      <span style={{ display: 'inline-flex', color: dkPriorita(a.priorita).colore }} title={'Priorità ' + dkPriorita(a.priorita).label.toLowerCase()}><BuIcons.flag size={13}/></span>
                    </div>
                    <div style={{ fontSize: 13.8, fontWeight: 700, color: a.stato === 'fatto' ? ADM.MUTED : ADM.TEXT, lineHeight: 1.35, textDecoration: a.stato === 'fatto' ? 'line-through' : 'none' }}>{a.titolo}</div>
                    {a.contatto && <div style={{ marginTop: 8 }}><DkContatto id={a.contatto} compatto/></div>}
                    {tot > 0 && (
                      <div style={{ marginTop: 9, height: 4, borderRadius: 99, background: ADM.NEUTRAL_SOFT, overflow: 'hidden' }}>
                        <div style={{ width: (fatti / tot * 100) + '%', height: '100%', background: st.colore, borderRadius: 99 }}/>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9 }}>
                      <DkPila ids={a.chi} size={20} max={3}/>
                      <span style={{ flex: 1 }}/>
                      <DkScadenza data={a.scadenza} piccola/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DkAttivitaVista({ s, onApri, onNuova }) {
  const [vista, setVista] = useStateDk('lista');
  const [filtro, setFiltro] = useStateDk('tutte');
  const elenco = s.attivita.filter(a => filtro === 'tutte' ? true : filtro === 'mie' ? a.chi.includes(DK_IO) : ['ritardo', 'oggi', 'vicina'].includes(dkScadenza(a.scadenza).tono) && a.stato !== 'fatto');
  const aperte = s.attivita.filter(a => a.stato !== 'fatto').length;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', animation: 'dkEntra 0.18s ease' }}>
      <div style={{ padding: '22px 26px 14px', display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.03em' }}>Attività</div>
          <div style={{ fontSize: 13.6, color: ADM.MUTED, marginTop: 3 }}>{aperte} aperte in tutto il team. Trascina una scheda nella bacheca per cambiarle stato.</div>
        </div>
        <HubSegmenti attivo={filtro} onCambia={setFiltro} voci={[{ id: 'tutte', label: 'Tutte' }, { id: 'mie', label: 'Mie' }, { id: 'scadenza', label: 'In scadenza' }]}/>
        <div style={{ display: 'inline-flex', padding: 3, borderRadius: 10, background: ADM.NEUTRAL_SOFT }}>
          {[{ id: 'lista', icona: 'list', label: 'Lista' }, { id: 'bacheca', icona: 'kanban', label: 'Bacheca' }].map(v => {
            const Ic = BuIcons[v.icona];
            return (
              <button key={v.id} onClick={() => setVista(v.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: vista === v.id ? '#fff' : 'transparent', color: vista === v.id ? ADM.DESK_PRUGNA : ADM.MUTED, fontSize: 13, fontWeight: 700,
                boxShadow: vista === v.id ? '0 1px 3px rgba(15,17,21,0.10)' : 'none',
              }}><Ic size={14}/>{v.label}</button>
            );
          })}
        </div>
        <HubStrumento forte icona="plus" onClick={() => onNuova(null, null)}>Nuova attività</HubStrumento>
      </div>
      <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '0 26px 24px' }}>
        {vista === 'lista' ? <DkListaAttivita s={s} elenco={elenco} onApri={onApri}/> : <DkBacheca s={s} elenco={elenco} onApri={onApri}/>}
      </div>
    </div>
  );
}

// Il dettaglio di un'attività: pannello laterale, si modifica sul posto.
function DkDettaglioAttivita({ s, id, onChiudi }) {
  const a = s.attivita.find(x => x.id === id);
  const [nuovaVoce, setNuovaVoce] = useStateDk('');
  const [commento, setCommento] = useStateDk('');
  if (!a) return null;
  const set = (campi) => dkCambiaAttivita(a.id, campi);
  const canale = s.canali.find(c => c.id === a.canale);
  const fatti = (a.checklist || []).filter(c => c.ok).length;
  const etichetta = (t) => <div style={{ fontSize: 11.2, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 7 }}>{t}</div>;
  const isoData = a.scadenza ? new Date(a.scadenza.getTime() - a.scadenza.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : '';
  return (
    <HubPannello open onClose={onChiudi} larghezza={480} icona="checkSquare" colore="DESK_PRUGNA" titolo={a.id} sotto={canale ? 'In #' + canale.nome : ''}
      footer={<React.Fragment>
        {canale && <HubStrumento icona="hash" onClick={() => { onChiudi(); dkApri('conv:' + a.canale); }}>Apri #{canale.nome}</HubStrumento>}
        <span style={{ flex: 1 }}/>
        <HubStrumento forte={a.stato !== 'fatto'} icona="check" onClick={() => set({ stato: a.stato === 'fatto' ? 'da_fare' : 'fatto' })}>{a.stato === 'fatto' ? 'Riapri' : 'Segna come fatta'}</HubStrumento>
      </React.Fragment>}>
      <textarea value={a.titolo} onChange={e => set({ titolo: e.target.value })} rows={2} style={{
        width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', resize: 'none', boxShadow: 'none', padding: 0,
        fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: ADM.TEXT, fontFamily: 'inherit', lineHeight: 1.3, background: 'transparent',
      }}/>

      <div style={{ marginTop: 12 }}>
        {etichetta('Stato')}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DK_STATI.map(st => (
            <button key={st.id} onClick={() => set({ stato: st.id })} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 99, cursor: 'pointer', fontFamily: 'inherit',
              border: `1.5px solid ${a.stato === st.id ? st.colore : ADM.BORDER}`, background: a.stato === st.id ? st.soft : '#fff',
              color: a.stato === st.id ? st.colore : ADM.MUTED, fontSize: 12.6, fontWeight: 700,
            }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: st.colore }}/>{st.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
        <div>
          {etichetta('Scadenza')}
          <input type="date" value={isoData} onChange={e => { const v = e.target.value; set({ scadenza: v ? new Date(v + 'T18:00') : null }); }} style={Object.assign({}, HUB_INPUT, { height: 36 })}/>
          <div style={{ marginTop: 6 }}><DkScadenza data={a.scadenza} piccola/></div>
        </div>
        <div>
          {etichetta('Priorità')}
          <AdmSelect block value={a.priorita} onChange={(v) => set({ priorita: v })} options={DK_PRIORITA.map(p => ({ value: p.id, label: p.label }))}/>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        {etichetta('Assegnata a')}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {dkPersone().map(p => {
            const dentro = a.chi.includes(p.id);
            return (
              <button key={p.id} onClick={() => set({ chi: dentro ? a.chi.filter(x => x !== p.id) : a.chi.concat([p.id]) })} title={p.nome} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px 3px 3px', borderRadius: 99, cursor: 'pointer', fontFamily: 'inherit',
                border: `1.5px solid ${dentro ? ADM.DESK_PRUGNA : ADM.BORDER}`, background: dentro ? ADM.DESK_LILLA_SOFT : '#fff',
                fontSize: 12.4, fontWeight: 700, color: dentro ? ADM.DESK_PRUGNA : ADM.MUTED, opacity: dentro ? 1 : 0.85,
              }}><DkAvatar id={p.id} size={20}/>{p.io ? 'Tu' : p.nome.split(' ')[0]}</button>
            );
          })}
        </div>
      </div>

      {a.contatto && (
        <div style={{ marginTop: 18 }}>
          {etichetta('Contatto collegato')}
          <DkContatto id={a.contatto}/>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        {etichetta('Descrizione')}
        <HubArea valore={a.desc || ''} onCambia={(v) => set({ desc: v })} righe={3} placeholder="Cosa c'è da sapere per farla"/>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1 }}>{etichetta('Checklist')}</span>
          {(a.checklist || []).length > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: ADM.MUTED, marginBottom: 7 }}>{fatti} di {a.checklist.length}</span>}
        </div>
        {(a.checklist || []).length > 0 && (
          <div style={{ height: 5, borderRadius: 99, background: ADM.NEUTRAL_SOFT, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: (fatti / a.checklist.length * 100) + '%', height: '100%', background: ADM.OK, borderRadius: 99, transition: 'width 0.2s ease' }}/>
          </div>
        )}
        {(a.checklist || []).map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 2px' }}>
            <DkSpunta size={17} fatta={c.ok} onClick={() => set({ checklist: a.checklist.map((x, j) => j === i ? { t: x.t, ok: !x.ok } : x) })}/>
            <span style={{ flex: 1, fontSize: 13.6, color: c.ok ? ADM.MUTED : ADM.TEXT, textDecoration: c.ok ? 'line-through' : 'none' }}>{c.t}</span>
            <button onClick={() => set({ checklist: a.checklist.filter((_, j) => j !== i) })} title="Togli" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: ADM.MUTED_LIGHT, display: 'grid', padding: 2 }}><BuIcons.x size={13}/></button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <HubInput valore={nuovaVoce} onCambia={setNuovaVoce} placeholder="Aggiungi una voce e premi Invio"
            onKeyDown={e => { if (e.key === 'Enter' && nuovaVoce.trim()) { set({ checklist: (a.checklist || []).concat([{ t: nuovaVoce.trim(), ok: false }]) }); setNuovaVoce(''); } }}/>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {etichetta('Commenti')}
        {(a.commenti || []).map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, padding: '6px 0' }}>
            <DkAvatar id={c.da} size={26}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.8 }}><b style={{ color: ADM.TEXT }}>{dkNome(c.da)}</b> <span style={{ color: ADM.MUTED_SOFT }}>· {dkFaQuanto(c.t)}</span></div>
              <div style={{ fontSize: 13.4, color: '#2A2C31', marginTop: 2, lineHeight: 1.45 }}><DkTesto testo={c.testo}/></div>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <HubInput valore={commento} onCambia={setCommento} placeholder="Scrivi un commento"
            onKeyDown={e => { if (e.key === 'Enter' && commento.trim()) { set({ commenti: (a.commenti || []).concat([{ da: DK_IO, t: new Date(), testo: dkCodificaMenzioni(commento.trim()) }]) }); setCommento(''); } }}/>
        </div>
      </div>
    </HubPannello>
  );
}

// La creazione di un'attività — da zero, dal canale o da un messaggio.
function DkNuovaAttivita({ s, conv, messaggio, onChiudi, onCreata }) {
  const testoMsg = messaggio ? messaggio.testo.replace(/@\[([a-zA-Z0-9-]+)\]/g, (_, id) => '@' + dkNome(id)).replace(/\*\*/g, '') : '';
  // Il titolo parte dalla prima frase del messaggio: un'attività si legge in
  // una riga, il resto resta nel messaggio collegato.
  const primaFrase = (testoMsg.match(/^[^.?!\n]*[.?!]?/) || [''])[0].trim();
  const [titolo, setTitolo] = useStateDk(primaFrase.length > 90 ? primaFrase.slice(0, 88) + '…' : primaFrase);
  const [canale, setCanale] = useStateDk(conv && s.canali.some(c => c.id === conv) ? conv : 'generale');
  const [chi, setChi] = useStateDk([messaggio && dkPersona(messaggio.da) && messaggio.da !== DK_IO ? messaggio.da : DK_IO]);
  const [scad, setScad] = useStateDk(() => { const d = new Date(DK_ORA + 2 * 86400000); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); });
  const [prio, setPrio] = useStateDk('normale');
  const [contatto, setContatto] = useStateDk(messaggio && messaggio.contatto ? messaggio.contatto : '');
  const crea = () => {
    if (!titolo.trim()) return;
    const id = dkNuovoId('T-');
    const nuovo = { id, titolo: titolo.trim(), stato: 'da_fare', priorita: prio, chi: chi.length ? chi : [DK_IO], scadenza: scad ? new Date(scad + 'T18:00') : null,
      canale, contatto: contatto || undefined, desc: messaggio ? 'Nata da un messaggio di ' + dkNome(messaggio.da) + ' in #' + ((s.canali.find(c => c.id === conv) || {}).nome || '') + '.' : '', checklist: [], commenti: [] };
    dkSalvaAttivita(nuovo);
    if (messaggio && conv) dkModificaMessaggio(conv, messaggio.id, () => ({ attivita: id }));
    else dkScrivi(canale, 'ha creato un\'attività', { sistema: true, icona: 'checkSquare', attivita: id });
    onCreata(id);
  };
  const locali = (typeof LOCALI !== 'undefined' ? LOCALI : []).slice(0, 40);
  return (
    <HubModale open onClose={onChiudi} larghezza={600} titolo={messaggio ? 'Crea un\'attività dal messaggio' : 'Nuova attività'}
      sotto={messaggio ? 'Il messaggio resta dov\'è e si collega all\'attività: chi lo legge vede a che punto è.' : 'Un\'attività ha un titolo, qualcuno che la fa e una scadenza. Il resto è facoltativo.'}
      footer={<React.Fragment><span style={{ flex: 1 }}/><HubStrumento onClick={onChiudi}>Annulla</HubStrumento><HubStrumento forte icona="check" spento={!titolo.trim()} onClick={crea}>Crea attività</HubStrumento></React.Fragment>}>
      {messaggio && (
        <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 12, background: ADM.DESK_LILLA_BG, border: '1px solid #EFE3EC', marginBottom: 16 }}>
          <DkAvatar id={messaggio.da} size={28}/>
          <div style={{ fontSize: 13.2, color: '#3A3A40', lineHeight: 1.5 }}><b>{dkNome(messaggio.da)}</b> · <DkTesto testo={messaggio.testo}/></div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <HubCampo label="Titolo"><HubInput valore={titolo} onCambia={setTitolo} placeholder="Cosa va fatto" autoFocus/></HubCampo>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <HubCampo label="Canale"><AdmSelect block value={canale} onChange={setCanale} options={s.canali.map(c => ({ value: c.id, label: '#' + c.nome }))}/></HubCampo>
          <HubCampo label="Scadenza"><HubData valore={scad} onCambia={setScad}/></HubCampo>
          <HubCampo label="Priorità"><AdmSelect block value={prio} onChange={setPrio} options={DK_PRIORITA.map(p => ({ value: p.id, label: p.label }))}/></HubCampo>
        </div>
        <HubCampo label="Assegnata a">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {dkPersone().map(p => {
              const dentro = chi.includes(p.id);
              return (
                <button key={p.id} onClick={() => setChi(c => dentro ? c.filter(x => x !== p.id) : c.concat([p.id]))} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px 3px 3px', borderRadius: 99, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${dentro ? ADM.DESK_PRUGNA : ADM.BORDER}`, background: dentro ? ADM.DESK_LILLA_SOFT : '#fff',
                  fontSize: 12.4, fontWeight: 700, color: dentro ? ADM.DESK_PRUGNA : ADM.MUTED,
                }}><DkAvatar id={p.id} size={20}/>{p.io ? 'Tu' : p.nome.split(' ')[0]}</button>
              );
            })}
          </div>
        </HubCampo>
        <HubCampo label="Contatto collegato" nota="Facoltativo. L'attività compare anche nella scheda del contatto.">
          <AdmSelect block value={contatto} onChange={setContatto} options={[{ value: '', label: 'Nessuno' }].concat(locali.map(l => ({ value: l.id, label: l.nome + ' · ' + l.citta })))}/>
        </HubCampo>
      </div>
    </HubModale>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Riunioni — la settimana e la riunione video
// ═══════════════════════════════════════════════════════════════════════════
function DkRiunioniVista({ s, onEntra, onNuova }) {
  // Cinque giorni che partono da ieri: si vede quello che è appena successo,
  // oggi, e i giorni che arrivano. Le frecce spostano la finestra.
  const [spost, setSpost] = useStateDk(0);
  const oggi = new Date(DK_ORA);
  const primo = new Date(oggi); primo.setHours(0, 0, 0, 0); primo.setDate(primo.getDate() - 1 + spost * 5);
  const giorni = [0, 1, 2, 3, 4].map(i => { const d = new Date(primo); d.setDate(d.getDate() + i); return d; });
  const H0 = 8; const H1 = 19; const PX = 58; // pixel per ora: mezz'ora deve contenere un titolo
  const live = s.riunioni.find(dkRiunioneInCorso);
  const prossime = s.riunioni.filter(r => r.inizio.getTime() > DK_ORA).sort((a, b) => a.inizio - b.inizio).slice(0, 4);
  const oraY = ((oggi.getHours() + oggi.getMinutes() / 60) - H0) * PX;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', animation: 'dkEntra 0.18s ease' }}>
      <div style={{ padding: '22px 26px 14px', display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.03em' }}>Riunioni</div>
          <div style={{ fontSize: 13.6, color: ADM.MUTED, marginTop: 3 }}>La settimana del team. Una riunione nasce in un canale e il suo riassunto ci torna quando finisce.</div>
        </div>
        <HubStrumento icona="video" onClick={() => onEntra({ id: 'R-subito', titolo: 'Riunione immediata', inizio: new Date(), durata: 30, chi: [DK_IO], canale: null })}>Riunione immediata</HubStrumento>
        <HubStrumento forte icona="plus" onClick={onNuova}>Pianifica</HubStrumento>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, padding: '0 26px 22px' }}>
        {/* La settimana */}
        <div style={{ background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 16, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '54px repeat(5, minmax(0,1fr))', borderBottom: `1px solid ${ADM.BORDER}` }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <button onClick={() => setSpost(x => x - 1)} title="Giorni prima" className="dk-strumento" style={{ width: 22, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: ADM.MUTED, display: 'grid', placeItems: 'center', padding: 0 }}><BuIcons.chevronLeft size={14}/></button>
              <button onClick={() => setSpost(x => x + 1)} title="Giorni dopo" className="dk-strumento" style={{ width: 22, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: ADM.MUTED, display: 'grid', placeItems: 'center', padding: 0 }}><BuIcons.chevronRight size={14}/></button>
            </span>
            {giorni.map(d => {
              const e = dkStessoGiorno(d, oggi);
              return (
                <div key={d.toISOString()} style={{ padding: '10px 10px 9px', borderLeft: `1px solid ${ADM.BORDER_SOFT}` }}>
                  <span style={{ fontSize: 11.6, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: e ? ADM.DESK_PRUGNA : ADM.MUTED_SOFT }}>{d.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                  <span style={{ marginLeft: 7, display: 'inline-grid', placeItems: 'center', minWidth: 26, height: 26, borderRadius: 8, fontSize: 14, fontWeight: 800, background: e ? ADM.DESK_PRUGNA : 'transparent', color: e ? '#fff' : ADM.TEXT }}>{d.getDate()}</span>
                </div>
              );
            })}
          </div>
          <div className="hub-scroll" style={{ flex: 1, minHeight: 0 }}>
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '54px repeat(5, minmax(0,1fr))', height: (H1 - H0) * PX }}>
              <div style={{ position: 'relative' }}>
                {Array.from({ length: H1 - H0 }).map((_, i) => (
                  <span key={i} style={{ position: 'absolute', top: i * PX - 7, right: 9, fontSize: 11, fontWeight: 600, color: ADM.MUTED_SOFT }}>{i === 0 ? '' : (H0 + i) + ':00'}</span>
                ))}
              </div>
              {giorni.map(d => {
                const e = dkStessoGiorno(d, oggi);
                const delGiorno = s.riunioni.filter(r => dkStessoGiorno(r.inizio, d));
                return (
                  <div key={d.toISOString()} style={{ position: 'relative', borderLeft: `1px solid ${ADM.BORDER_SOFT}`, background: e ? '#FCF9FB' : 'transparent' }}>
                    {Array.from({ length: H1 - H0 }).map((_, i) => <span key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * PX, height: 1, background: ADM.BORDER_SOFT }}/>)}
                    {delGiorno.map(r => {
                      const top = Math.max(0, ((r.inizio.getHours() + r.inizio.getMinutes() / 60) - H0) * PX);
                      const alto = Math.max(24, r.durata / 60 * PX - 3);
                      const lv = dkRiunioneInCorso(r);
                      const finita = DK_ORA >= r.inizio.getTime() + r.durata * 60000;
                      return (
                        <button key={r.id} onClick={() => onEntra(r)} title={r.titolo} className="dk-card" style={{
                          position: 'absolute', left: 4, right: 4, top: top + 1, height: alto, boxSizing: 'border-box', textAlign: 'left',
                          padding: alto > 34 ? '5px 8px' : '3px 8px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', overflow: 'hidden',
                          background: lv ? ADM.DESK_PRUGNA : finita ? '#F4F4F6' : ADM.DESK_LILLA_SOFT, color: lv ? '#fff' : finita ? ADM.MUTED : ADM.DESK_PRUGNA,
                          border: `1px solid ${lv ? ADM.DESK_PRUGNA : finita ? ADM.BORDER : '#E6D2E2'}`, borderLeft: `3px solid ${lv ? ADM.DESK_LILLA : finita ? ADM.MUTED_LIGHT : ADM.DESK_PRUGNA}`,
                        }}>
                          <span style={{ fontSize: 11.8, fontWeight: 800, lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: alto > 50 ? 2 : 1, WebkitBoxOrient: 'vertical' }}>{r.titolo}</span>
                          {alto > 50 && <span style={{ display: 'block', fontSize: 11, opacity: 0.8, marginTop: 2, whiteSpace: 'nowrap' }}>{dkOra(r.inizio)} · {r.durata} min</span>}
                        </button>
                      );
                    })}
                    {e && oraY > 0 && oraY < (H1 - H0) * PX && (
                      <span style={{ position: 'absolute', left: -4, right: 0, top: oraY, height: 2, background: ADM.PINK, zIndex: 2 }}>
                        <span style={{ position: 'absolute', left: -3, top: -4, width: 10, height: 10, borderRadius: '50%', background: ADM.PINK }}/>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* A destra: adesso e dopo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          {live ? (
            <div style={{ borderRadius: 16, padding: 16, background: 'linear-gradient(160deg, #4F2C49 0%, #351C30 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.4, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.DESK_LILLA }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4A6E', animation: 'dkLive 1.4s ease-in-out infinite' }}/>In corso adesso
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, marginTop: 8, letterSpacing: '-0.015em' }}>{live.titolo}</div>
              <div style={{ fontSize: 12.6, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>Iniziata alle {dkOra(live.inizio)} · {live.durata} min{live.canale ? ' · #' + (s.canali.find(c => c.id === live.canale) || {}).nome : ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}>
                <DkPila ids={live.chi} size={26} bordo="#3F2239"/>
                <span style={{ flex: 1 }}/>
                <button onClick={() => onEntra(live)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#fff', color: ADM.DESK_PRUGNA, fontWeight: 800, fontSize: 13.4, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7 }}><BuIcons.video size={15}/>Partecipa</button>
              </div>
            </div>
          ) : null}
          <div style={{ background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 16, padding: '14px 12px 8px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 14.6, fontWeight: 800, color: ADM.TEXT, padding: '0 4px 8px' }}>Prossime</div>
            <div className="hub-scroll" style={{ flex: 1, minHeight: 0 }}>
              {prossime.map(r => (
                <button key={r.id} onClick={() => onEntra(r)} className="adm-actionrow" style={{ width: '100%', display: 'flex', gap: 10, padding: '9px 6px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ width: 44, flexShrink: 0 }}>
                    <span style={{ display: 'block', fontSize: 13.6, fontWeight: 800, color: ADM.TEXT }}>{dkOra(r.inizio)}</span>
                    <span style={{ display: 'block', fontSize: 11.2, color: ADM.MUTED }}>{dkEtichettaGiorno(r.inizio).split(' ')[0]}</span>
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13.4, fontWeight: 700, color: ADM.TEXT, lineHeight: 1.3 }}>{r.titolo}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}><DkPila ids={r.chi} size={18}/>{r.esterni && <span style={{ fontSize: 11.6, color: ADM.MUTED }}>+ {r.esterni}</span>}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DkNuovaRiunione({ s, onChiudi }) {
  const [titolo, setTitolo] = useStateDk('');
  const [giorno, setGiorno] = useStateDk(() => { const d = new Date(DK_ORA + 86400000); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); });
  const [ora, setOra] = useStateDk('10:00');
  const [durata, setDurata] = useStateDk('30');
  const [canale, setCanale] = useStateDk('');
  const [chi, setChi] = useStateDk([DK_IO]);
  const crea = () => {
    if (!titolo.trim()) return;
    const id = dkNuovoId('R-');
    const r = { id, titolo: titolo.trim(), inizio: new Date(giorno + 'T' + ora), durata: Number(durata), chi, canale: canale || null };
    dkAggiorna(st => ({ riunioni: st.riunioni.concat([r]) }));
    if (canale) dkScrivi(canale, 'ha pianificato una riunione', { sistema: true, icona: 'calendar', riunione: id });
    onChiudi();
  };
  return (
    <HubModale open onClose={onChiudi} larghezza={560} titolo="Pianifica una riunione" sotto="Chi è invitato la trova nella sua agenda in Ambiente; se scegli un canale, ci compare anche lì."
      footer={<React.Fragment><span style={{ flex: 1 }}/><HubStrumento onClick={onChiudi}>Annulla</HubStrumento><HubStrumento forte icona="check" spento={!titolo.trim()} onClick={crea}>Pianifica</HubStrumento></React.Fragment>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <HubCampo label="Titolo"><HubInput valore={titolo} onCambia={setTitolo} placeholder="Di cosa si parla" autoFocus/></HubCampo>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 12 }}>
          <HubCampo label="Giorno"><HubData valore={giorno} onCambia={setGiorno}/></HubCampo>
          <HubCampo label="Ora"><AdmSelect block value={ora} onChange={setOra} options={['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'].map(o => ({ value: o, label: o }))}/></HubCampo>
          <HubCampo label="Durata"><AdmSelect block value={durata} onChange={setDurata} options={[['15', '15 min'], ['30', '30 min'], ['45', '45 min'], ['60', '1 ora']].map(([v, l]) => ({ value: v, label: l }))}/></HubCampo>
        </div>
        <HubCampo label="Canale" nota="Facoltativo: la riunione si annuncia lì e il riassunto ci torna alla fine.">
          <AdmSelect block value={canale} onChange={setCanale} options={[{ value: '', label: 'Nessun canale' }].concat(s.canali.map(c => ({ value: c.id, label: '#' + c.nome })))}/>
        </HubCampo>
        <HubCampo label="Partecipanti">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {dkPersone().map(p => {
              const dentro = chi.includes(p.id);
              return (
                <button key={p.id} onClick={() => setChi(c => dentro ? c.filter(x => x !== p.id) : c.concat([p.id]))} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px 3px 3px', borderRadius: 99, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${dentro ? ADM.DESK_PRUGNA : ADM.BORDER}`, background: dentro ? ADM.DESK_LILLA_SOFT : '#fff', fontSize: 12.4, fontWeight: 700, color: dentro ? ADM.DESK_PRUGNA : ADM.MUTED,
                }}><DkAvatar id={p.id} size={20} presenza/>{p.io ? 'Tu' : p.nome.split(' ')[0]}</button>
              );
            })}
          </div>
        </HubCampo>
      </div>
    </HubModale>
  );
}

// Un tasto della barra di controllo della riunione.
function DkControllo({ icona, attivo, rosso, label, onClick }) {
  const Ic = BuIcons[icona];
  return (
    <button onClick={onClick} title={label} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '9px 12px', minWidth: 74, borderRadius: 14,
      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: rosso ? '#E5484D' : attivo ? '#fff' : 'rgba(255,255,255,0.10)', color: rosso ? '#fff' : attivo ? ADM.DESK_PRUGNA : '#fff',
    }}><Ic size={20}/><span style={{ fontSize: 11.4, fontWeight: 700 }}>{label}</span></button>
  );
}

// La riunione video. Copre l'area di Ambiente (non la barra di Desk): si può
// sempre tornare a un'altra sezione senza chiudere la chiamata.
function DkChiamata({ s, onEsci }) {
  const c = s.chiamata;
  const [sec, setSec] = useStateDk(0);
  const [chat, setChat] = useStateDk(false);
  // La chat della riunione del lancio arriva con un messaggio già scritto
  // (la riunione è iniziata prima di te); le altre partono vuote.
  const [msg, setMsg] = useStateDk(() => c && c.riunione.id === 'R-2' ? [{ da: 'admin1', testo: 'Ho condiviso la scaletta in #lancio-1-dicembre', t: dkFa(6) }] : []);
  const [scrivi, setScrivi] = useStateDk('');
  const [parla, setParla] = useStateDk(0);
  useEffectDk(() => {
    const t = setInterval(() => setSec(x => x + 1), 1000);
    const p = setInterval(() => setParla(x => x + 1), 2600);
    return () => { clearInterval(t); clearInterval(p); };
  }, []);
  if (!c) return null;
  const r = c.riunione;
  const presenti = Array.from(new Set(r.chi.concat([DK_IO]))).filter(id => id === DK_IO || DK_PRESENZA_DI[id] !== 'assente' || r.id === 'R-subito');
  const altri = presenti.filter(id => id !== DK_IO);
  const chiParla = altri.length ? altri[parla % altri.length] : null;
  const trascorso = Math.max(0, Math.floor((Date.now() - r.inizio.getTime()) / 1000));
  const t = c.daInizio ? sec : trascorso;
  const mmss = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  const set = (campi) => dkAggiorna(st => ({ chiamata: Object.assign({}, st.chiamata, campi) }));
  const colonne = presenti.length <= 1 ? 1 : presenti.length <= 4 ? 2 : 3;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'radial-gradient(1200px 600px at 50% -10%, #5A3352 0%, #2A1726 55%, #1C0F1A 100%)', display: 'flex', flexDirection: 'column', color: '#fff', animation: 'dkEntra 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 22px' }}>
        <img src="desk-mark-bianco.png" alt="" style={{ height: 22, width: 'auto', opacity: 0.9 }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.015em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.titolo}</div>
          <div style={{ fontSize: 12.2, color: 'rgba(255,255,255,0.62)' }}>{r.canale ? '#' + (s.canali.find(x => x.id === r.canale) || {}).nome + ' · ' : ''}{presenti.length} {presenti.length === 1 ? 'partecipante' : 'partecipanti'}{r.esterni ? ' + ' + r.esterni : ''}</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 99, background: 'rgba(255,255,255,0.10)', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4A6E', animation: 'dkLive 1.4s ease-in-out infinite' }}/>{mmss}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 14, padding: '0 22px' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(' + colonne + ', minmax(0,1fr))', gridAutoRows: '1fr', gap: 12 }}>
          {c.schermo && (
            <div style={{ gridColumn: '1 / -1', borderRadius: 18, background: '#F5F5F7', color: ADM.TEXT, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
              <div style={{ padding: '8px 12px', background: '#E9E9EE', fontSize: 12, fontWeight: 700, color: ADM.MUTED, display: 'flex', alignItems: 'center', gap: 6 }}><BuIcons.monitor size={13}/>Stai condividendo lo schermo · Desk</div>
              <div style={{ flex: 1, display: 'grid', placeItems: 'center', fontSize: 14, color: ADM.MUTED }}>Anteprima della condivisione</div>
            </div>
          )}
          {presenti.map(id => {
            const p = dkPersona(id);
            const io = id === DK_IO;
            const parlando = !io ? id === chiParla : false;
            const muto = io ? c.muto : id === 'mkt2';
            const camera = io ? c.camera : false;
            return (
              <div key={id} style={{
                position: 'relative', borderRadius: 18, minHeight: 0, overflow: 'hidden',
                background: camera ? 'linear-gradient(160deg, #6E4C68, #3E2338)' : 'rgba(255,255,255,0.06)',
                boxShadow: parlando ? 'inset 0 0 0 2px ' + ADM.DESK_LILLA : 'inset 0 0 0 1px rgba(255,255,255,0.06)', transition: 'box-shadow 0.25s ease',
                display: 'grid', placeItems: 'center',
              }}>
                {camera
                  ? <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><BuIcons.video size={15}/>La tua camera</span>
                  : (
                    <span style={{ borderRadius: 30, animation: parlando ? 'dkParla 1.3s ease-out infinite' : 'none' }}>
                      <span style={{ width: 84, height: 84, borderRadius: 26, background: p ? p.bg : '#555', display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 800 }}>{p ? p.ini : '?'}</span>
                    </span>
                  )}
                <span style={{ position: 'absolute', left: 12, bottom: 11, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', fontSize: 12.6, fontWeight: 700 }}>
                  {muto && <BuIcons.micOff size={13}/>}{io ? 'Tu' : (p ? p.nome : '')}{io && c.mano ? ' ✋' : ''}
                </span>
              </div>
            );
          })}
        </div>
        {chat && (
          <div style={{ width: 300, flexShrink: 0, borderRadius: 18, background: 'rgba(255,255,255,0.96)', color: ADM.TEXT, display: 'flex', flexDirection: 'column', minHeight: 0, animation: 'hubPannelloIn 0.2s ease' }}>
            <div style={{ padding: '12px 14px', fontSize: 14.4, fontWeight: 800, borderBottom: `1px solid ${ADM.BORDER}` }}>Chat della riunione</div>
            <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '8px 12px' }}>
              {msg.length === 0 && <div style={{ padding: '18px 6px', fontSize: 12.8, color: ADM.MUTED, textAlign: 'center' }}>I messaggi scritti qui restano a chi partecipa.</div>}
              {msg.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0' }}>
                  <DkAvatar id={m.da} size={24}/>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.4 }}><b>{dkNomeBreve(m.da)}</b> <span style={{ color: ADM.MUTED_SOFT }}>{dkOra(m.t)}</span></div>
                    <div style={{ fontSize: 13.2, lineHeight: 1.45, marginTop: 1 }}>{m.testo}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 10, borderTop: `1px solid ${ADM.BORDER}` }}>
              <HubInput valore={scrivi} onCambia={setScrivi} placeholder="Scrivi a tutti"
                onKeyDown={e => { if (e.key === 'Enter' && scrivi.trim()) { setMsg(x => x.concat([{ da: DK_IO, testo: scrivi.trim(), t: new Date() }])); setScrivi(''); } }}/>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 22px 20px' }}>
        <DkControllo icona={c.muto ? 'micOff' : 'mic'} label={c.muto ? 'Riattiva' : 'Microfono'} attivo={!c.muto} onClick={() => set({ muto: !c.muto })}/>
        <DkControllo icona={c.camera ? 'video' : 'videoOff'} label="Camera" attivo={c.camera} onClick={() => set({ camera: !c.camera })}/>
        <DkControllo icona="monitor" label="Schermo" attivo={c.schermo} onClick={() => set({ schermo: !c.schermo })}/>
        <DkControllo icona="hand" label="Mano" attivo={c.mano} onClick={() => set({ mano: !c.mano })}/>
        <DkControllo icona="chatFill" label="Chat" attivo={chat} onClick={() => setChat(v => !v)}/>
        <span style={{ width: 14 }}/>
        <DkControllo icona="phoneCall" label="Esci" rosso onClick={() => onEsci(t, presenti.length)}/>
      </div>
    </div>
  );
}

// La huddle: una scheda in fondo alla colonna, finché non esci — sempre in
// vista, ma mai sopra a quello che stai scrivendo.
function DkHuddle({ s }) {
  const h = s.huddle;
  const [, setTick] = useStateDk(0);
  useEffectDk(() => { const t = setInterval(() => setTick(x => x + 1), 1000); return () => clearInterval(t); }, []);
  if (!h) return null;
  const c = s.canali.find(x => x.id === h.conv) || s.diretti.find(x => x.id === h.conv);
  const sec = Math.floor((Date.now() - h.inizio) / 1000);
  const ospiti = h.conv === 'marketing' ? ['mkt1'] : h.conv === 'assistenza' ? ['support2'] : [];
  return (
    <div style={{ margin: '0 10px 12px', padding: '11px 11px 10px', borderRadius: 14, background: ADM.DESK_PRUGNA, color: '#fff', boxShadow: '0 14px 30px -16px rgba(53,28,48,0.8)', animation: 'dkSu 0.18s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', animation: 'dkLive 1.6s ease-in-out infinite', flexShrink: 0 }}/>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 12.8, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Huddle in {c && c.nome ? '#' + c.nome : 'conversazione'}</span>
          <span style={{ display: 'block', fontSize: 11.4, color: 'rgba(255,255,255,0.7)', fontVariantNumeric: 'tabular-nums' }}>{String(Math.floor(sec / 60)).padStart(2, '0')}:{String(sec % 60).padStart(2, '0')} · {1 + ospiti.length} {ospiti.length ? 'persone' : 'persona'}</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9 }}>
        <DkPila ids={[DK_IO].concat(ospiti)} size={24} bordo={ADM.DESK_PRUGNA}/>
        <span style={{ flex: 1 }}/>
        <button onClick={() => dkAggiorna(st => ({ huddle: Object.assign({}, st.huddle, { muto: !st.huddle.muto }) }))} title={h.muto ? 'Riattiva il microfono' : 'Silenzia'} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer', background: h.muto ? '#fff' : 'rgba(255,255,255,0.12)', color: h.muto ? ADM.DESK_PRUGNA : '#fff', display: 'grid', placeItems: 'center' }}>
          {h.muto ? <BuIcons.micOff size={15}/> : <BuIcons.mic size={15}/>}
        </button>
        <button onClick={() => dkAggiorna(() => ({ huddle: null }))} style={{ height: 32, padding: '0 12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: '#E5484D', color: '#fff', fontWeight: 800, fontSize: 12.4, fontFamily: 'inherit' }}>Esci</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// La ricerca
// ═══════════════════════════════════════════════════════════════════════════
function DkRisultati({ s, q, onApriAttivita }) {
  const qq = q.trim().toLowerCase();
  const leggibile = (t) => (t || '').replace(/@\[([a-zA-Z0-9-]+)\]/g, (_, id) => '@' + dkNome(id)).toLowerCase();
  const messaggi = [];
  s.canali.concat(s.diretti).forEach(c => (s.messaggi[c.id] || []).forEach(m => {
    if (!m.sistema && (leggibile(m.testo).includes(qq) || dkNome(m.da).toLowerCase().includes(qq))) messaggi.push({ c, m });
  }));
  const attivita = s.attivita.filter(a => (a.titolo + ' ' + (a.desc || '')).toLowerCase().includes(qq));
  const riunioni = s.riunioni.filter(r => r.titolo.toLowerCase().includes(qq));
  return (
    <div className="hub-scroll" style={{ height: '100%', padding: '24px 26px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.025em' }}>Risultati per «{q}»</div>
      <div style={{ fontSize: 13.4, color: ADM.MUTED, marginTop: 3, marginBottom: 18 }}>{messaggi.length} messaggi · {attivita.length} attività · {riunioni.length} riunioni</div>
      {attivita.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11.4, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 8 }}>Attività</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{attivita.map(a => <DkCardAttivita key={a.id} a={a} onApri={onApriAttivita}/>)}</div>
        </div>
      )}
      {messaggi.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11.4, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 8 }}>Messaggi</div>
          <div style={{ background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            {messaggi.map((x, i) => (
              <button key={i} onClick={() => dkApri('conv:' + x.c.id)} className="adm-actionrow" style={{ width: '100%', display: 'flex', gap: 10, padding: '11px 14px', border: 'none', borderBottom: i === messaggi.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <DkAvatar id={x.m.da} size={30}/>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 12.6 }}><b style={{ color: ADM.TEXT }}>{dkNome(x.m.da)}</b> <span style={{ color: ADM.MUTED }}>in {x.c.nome ? '#' + x.c.nome : x.c.con.map(dkNome).join(', ')} · {dkEtichettaGiorno(x.m.t)} {dkOra(x.m.t)}</span></span>
                  <span style={{ display: 'block', fontSize: 13.4, color: '#2A2C31', marginTop: 2, lineHeight: 1.45 }}><DkTesto testo={x.m.testo}/></span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {riunioni.length > 0 && (
        <div>
          <div style={{ fontSize: 11.4, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 8 }}>Riunioni</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{riunioni.map(r => <DkCardRiunione key={r.id} r={r} onEntra={() => dkApri('riunioni')}/>)}</div>
        </div>
      )}
      {!messaggi.length && !attivita.length && !riunioni.length && <HubVuoto icona="search" titolo="Niente trovato" desc="Prova con un nome, una parola del messaggio o il titolo di un'attività."/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// La pagina
// ═══════════════════════════════════════════════════════════════════════════
function DkAmbientePage() {
  const s = dkUsaStore();
  const [attivitaAperta, setAttivitaAperta] = useStateDk(null);
  const [nuovaAttivita, setNuovaAttivita] = useStateDk(null); // { conv, messaggio }
  const [nuovaRiunione, setNuovaRiunione] = useStateDk(false);
  const [nuovoCanale, setNuovoCanale] = useStateDk(false);
  const [nuovoDiretto, setNuovoDiretto] = useStateDk(false);
  const [cerca, setCerca] = useStateDk('');
  const [nc, setNc] = useStateDk({ nome: '', tema: '', privato: false });

  const entra = (r) => dkAggiorna(() => ({ chiamata: { riunione: r, muto: false, camera: false, schermo: false, mano: false, daInizio: !dkRiunioneInCorso(r) || r.id === 'R-subito' } }));
  const esci = (secondi, n) => {
    const r = s.chiamata && s.chiamata.riunione;
    dkAggiorna(() => ({ chiamata: null }));
    if (r && r.canale) dkScrivi(r.canale, 'ha lasciato la riunione «' + r.titolo + '» · ' + Math.max(1, Math.round(secondi / 60)) + ' min, ' + n + ' partecipanti', { sistema: true, icona: 'video' });
  };
  const riunioneCanale = (convId, titolo) => {
    const membri = convId.startsWith('dm-') ? ((s.diretti.find(d => d.id === convId) || {}).con || []) : ['admin1', 'support1'];
    const r = { id: dkNuovoId('R-'), titolo: 'Riunione · ' + (convId.startsWith('dm-') ? titolo : '#' + titolo), inizio: new Date(), durata: 30, chi: [DK_IO].concat(membri), canale: convId.startsWith('dm-') ? null : convId };
    dkAggiorna(st => ({ riunioni: st.riunioni.concat([r]) }));
    if (r.canale) dkScrivi(convId, 'ha avviato una riunione', { sistema: true, icona: 'video', riunione: r.id });
    dkAggiorna(() => ({ chiamata: { riunione: r, muto: false, camera: false, schermo: false, mano: false, daInizio: true } }));
  };
  const convId = s.vista.startsWith('conv:') ? s.vista.slice(5) : null;

  return (
    <div style={{ height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: ADM.PANEL_SOFT }}>
      <style>{DK_CSS}</style>
      <DkColonna s={s} cerca={cerca} setCerca={setCerca} onNuovoCanale={() => setNuovoCanale(true)} onNuovoDiretto={() => setNuovoDiretto(true)}/>
      <div style={{ flex: 1, minWidth: 0, height: '100%', position: 'relative', display: 'flex' }}>
        {s.vista === 'oggi' && <DkOggi s={s} onApriAttivita={setAttivitaAperta} onEntra={entra}/>}
        {s.vista === 'attivita' && <div style={{ flex: 1, minWidth: 0 }}><DkAttivitaVista s={s} onApri={setAttivitaAperta} onNuova={(conv, m) => setNuovaAttivita({ conv, messaggio: m })}/></div>}
        {s.vista === 'riunioni' && <div style={{ flex: 1, minWidth: 0 }}><DkRiunioniVista s={s} onEntra={entra} onNuova={() => setNuovaRiunione(true)}/></div>}
        {s.vista === 'cerca' && <div style={{ flex: 1, minWidth: 0 }}>{cerca.trim().length >= 2 ? <DkRisultati s={s} q={cerca} onApriAttivita={setAttivitaAperta}/> : <HubVuoto icona="search" titolo="Cerca in Ambiente" desc="Messaggi, attività e riunioni: scrivi almeno due lettere."/>}</div>}
        {convId && <DkConversazione key={convId} s={s} convId={convId} onApriAttivita={setAttivitaAperta} onNuovaAttivita={(conv, m) => setNuovaAttivita({ conv, messaggio: m })} onEntra={entra} onRiunione={riunioneCanale}/>}
      </div>
      {s.chiamata && <DkChiamata key={s.chiamata.riunione.id} s={s} onEsci={esci}/>}

      {attivitaAperta && <DkDettaglioAttivita s={s} id={attivitaAperta} onChiudi={() => setAttivitaAperta(null)}/>}
      {nuovaAttivita && <DkNuovaAttivita s={s} conv={nuovaAttivita.conv} messaggio={nuovaAttivita.messaggio} onChiudi={() => setNuovaAttivita(null)} onCreata={(id) => { setNuovaAttivita(null); setAttivitaAperta(id); }}/>}
      {nuovaRiunione && <DkNuovaRiunione s={s} onChiudi={() => setNuovaRiunione(false)}/>}

      <HubModale open={nuovoCanale} onClose={() => setNuovoCanale(false)} larghezza={520} titolo="Nuovo canale" sotto="Un canale è un argomento, non un gruppo di persone: chi ci entra trova la storia intera."
        footer={<React.Fragment><span style={{ flex: 1 }}/><HubStrumento onClick={() => setNuovoCanale(false)}>Annulla</HubStrumento>
          <HubStrumento forte icona="check" spento={!nc.nome.trim()} onClick={() => {
            const nome = nc.nome.trim().toLowerCase().replace(/[^a-z0-9àèéìòù]+/g, '-').replace(/^-|-$/g, '');
            const id = 'c-' + nome;
            dkAggiorna(st => ({ canali: st.canali.concat([{ id, nome, tema: nc.tema.trim() || 'Nessuna descrizione', privato: nc.privato, nonLetti: 0, menzioni: 0 }]), messaggi: Object.assign({}, st.messaggi, { [id]: [] }) }));
            dkScrivi(id, 'ha creato il canale', { sistema: true, icona: 'hash' });
            dkApri('conv:' + id); setNuovoCanale(false); setNc({ nome: '', tema: '', privato: false });
          }}>Crea canale</HubStrumento></React.Fragment>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <HubCampo label="Nome" nota="Minuscole e trattini: si scrive come si cerca."><HubInput valore={nc.nome} onCambia={(v) => setNc(Object.assign({}, nc, { nome: v }))} placeholder="es. fornitori" autoFocus/></HubCampo>
          <HubCampo label="Di cosa si parla"><HubInput valore={nc.tema} onCambia={(v) => setNc(Object.assign({}, nc, { tema: v }))} placeholder="Una riga che dice a cosa serve"/></HubCampo>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <AdmSwitch checked={nc.privato} onChange={(v) => setNc(Object.assign({}, nc, { privato: v }))}/>
            <span>
              <span style={{ display: 'block', fontSize: 13.8, fontWeight: 700, color: ADM.TEXT }}>Canale privato</span>
              <span style={{ display: 'block', fontSize: 12.6, color: ADM.MUTED }}>Lo vede solo chi viene invitato.</span>
            </span>
          </label>
        </div>
      </HubModale>

      <HubModale open={nuovoDiretto} onClose={() => setNuovoDiretto(false)} larghezza={460} titolo="Nuovo messaggio diretto" sotto="Scegli con chi parlare.">
        {dkPersone().filter(p => !p.io).map(p => (
          <button key={p.id} className="adm-actionrow" onClick={() => {
            const esiste = s.diretti.find(d => d.con.length === 1 && d.con[0] === p.id);
            const id = esiste ? esiste.id : 'dm-' + p.id;
            if (!esiste) dkAggiorna(st => ({ diretti: st.diretti.concat([{ id, con: [p.id], nonLetti: 0, menzioni: 0 }]), messaggi: Object.assign({}, st.messaggi, { [id]: [] }) }));
            dkApri('conv:' + id); setNuovoDiretto(false);
          }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 8px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <DkAvatar id={p.id} size={32} presenza/>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: ADM.TEXT }}>{p.nome}</span>
              <span style={{ display: 'block', fontSize: 12.2, color: ADM.MUTED }}>{p.ruolo}{p.nota ? ' · ' + p.nota : ''}</span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: DK_PRESENZE[DK_PRESENZA_DI[p.id]].colore }}>{DK_PRESENZE[DK_PRESENZA_DI[p.id]].label}</span>
          </button>
        ))}
      </HubModale>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Il pulsante grande della barra laterale di Desk
// ═══════════════════════════════════════════════════════════════════════════
// Sta sopra la nav, da solo, perché non è una sezione del CRM: è il posto dove
// il team sta tutto il giorno. Prugna su lilla come il logo; acceso diventa
// prugna pieno. Dice le tre cose che fanno decidere se aprirlo: quanti messaggi
// aspettano, chi c'è, e se c'è una riunione in corso.
function DkAmbienteBottone({ attivo, compresso, onClick }) {
  dkUsaStore();
  const r = dkRiepilogo();
  const online = dkPersone().filter(p => !p.io && DK_PRESENZA_DI[p.id] !== 'assente').map(p => p.id);
  if (compresso) {
    return (
      <button onClick={onClick} title="Ambiente" style={{
        position: 'relative', width: 48, height: 48, margin: '0 auto 12px', borderRadius: 14, border: 'none', cursor: 'pointer',
        background: attivo ? ADM.DESK_PRUGNA : ADM.DESK_LILLA, color: attivo ? '#fff' : ADM.DESK_PRUGNA, display: 'grid', placeItems: 'center',
        boxShadow: attivo ? '0 10px 22px -10px rgba(53,28,48,0.7)' : 'none',
      }}>
        <BuIcons.ambienteFill size={24}/>
        {(r.menzioni > 0 || r.nonLetti > 0) && <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 99, background: ADM.PINK, color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px #F7F8FA' }}>{r.menzioni || r.nonLetti}</span>}
      </button>
    );
  }
  return (
    <button onClick={onClick} className="dk-ambiente-btn" style={{
      width: '100%', textAlign: 'left', padding: '13px 13px 12px', marginBottom: 14, borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: attivo ? 'linear-gradient(150deg, #5A3352 0%, #492844 55%, #3A1F35 100%)' : ADM.DESK_LILLA,
      color: attivo ? '#fff' : ADM.DESK_PRUGNA, position: 'relative', overflow: 'hidden',
      boxShadow: attivo ? '0 14px 28px -14px rgba(53,28,48,0.75)' : 'inset 0 0 0 1px rgba(73,40,68,0.06)',
      transition: 'background 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{
          position: 'relative', width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'grid', placeItems: 'center',
          background: attivo ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.55)', color: attivo ? '#fff' : ADM.DESK_PRUGNA,
        }}>
          <BuIcons.ambienteFill size={24}/>
          {(r.menzioni > 0 || r.nonLetti > 0) && (
            <span style={{
              position: 'absolute', top: -6, right: -8, minWidth: 20, height: 20, padding: '0 6px', borderRadius: 99, boxSizing: 'border-box',
              background: r.menzioni ? ADM.PINK : ADM.DESK_PRUGNA, color: '#fff', fontSize: 11.2, fontWeight: 800, display: 'grid', placeItems: 'center',
              boxShadow: '0 0 0 2px ' + (attivo ? '#4E2B48' : ADM.DESK_LILLA),
            }}>{r.menzioni ? '@' + r.menzioni : r.nonLetti}</span>
          )}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 18, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Ambiente</span>
          <span style={{ display: 'block', fontSize: 12.2, fontWeight: 600, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: attivo ? 'rgba(255,255,255,0.72)' : ADM.DESK_PRUGNA_CHIARO }}>Chat, attività e riunioni</span>
        </span>
        <BuIcons.chevronRight size={16} color={attivo ? 'rgba(255,255,255,0.6)' : ADM.DESK_PRUGNA_CHIARO}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11, paddingTop: 10, borderTop: `1px solid ${attivo ? 'rgba(255,255,255,0.14)' : 'rgba(73,40,68,0.12)'}` }}>
        <DkPila ids={online} size={22} max={4} bordo={attivo ? '#4E2B48' : ADM.DESK_LILLA}/>
        <span style={{ flex: 1, minWidth: 0, fontSize: 11.8, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: attivo ? 'rgba(255,255,255,0.8)' : ADM.DESK_PRUGNA_CHIARO }}>
          {r.live ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF4A6E', animation: 'dkLive 1.4s ease-in-out infinite' }}/>Riunione in corso</span> : online.length + ' online'}
        </span>
      </div>
    </button>
  );
}


// La pillola di Ambiente nella barra in alto (dal 20 ottobre 2026): lilla,
// grande, con chi c'è, le menzioni e la riunione in corso. Accesa diventa
// prugna. È il pulsante «bello grande» di prima, sdraiato nella barra.
function DkAmbientePillola({ attivo, onClick }) {
  dkUsaStore();
  const r = dkRiepilogo();
  const online = dkPersone().filter(p => !p.io && DK_PRESENZA_DI[p.id] !== 'assente').map(p => p.id);
  const fondo = attivo ? ADM.DESK_PRUGNA : ADM.DESK_LILLA;
  return (
    <button onClick={onClick} className="dk-ambiente-btn" title="Ambiente · chat, attività e riunioni" style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '5px 14px 5px 5px', height: 46, borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: attivo ? 'linear-gradient(150deg, #5A3352 0%, #492844 55%, #3A1F35 100%)' : ADM.DESK_LILLA,
      color: attivo ? '#fff' : ADM.DESK_PRUGNA, position: 'relative',
      boxShadow: attivo ? '0 14px 28px -14px rgba(53,28,48,0.75)' : '0 10px 22px -16px rgba(73,40,68,0.6), inset 0 0 0 1px rgba(255,255,255,0.35)',
      transition: 'background 0.18s ease, box-shadow 0.18s ease',
    }}>
      <span style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: attivo ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.7)' }}>
        <BuIcons.ambienteFill size={20}/>
        {(r.menzioni > 0 || r.nonLetti > 0) && (
          <span style={{
            position: 'absolute', top: -5, right: -7, minWidth: 19, height: 19, padding: '0 5px', borderRadius: 99, boxSizing: 'border-box',
            background: r.menzioni ? ADM.PINK : ADM.DESK_PRUGNA, color: '#fff', fontSize: 10.8, fontWeight: 800, display: 'grid', placeItems: 'center',
            boxShadow: '0 0 0 2px ' + (attivo ? '#4E2B48' : ADM.DESK_LILLA),
          }}>{r.menzioni ? '@' + r.menzioni : r.nonLetti}</span>
        )}
      </span>
      <span style={{ textAlign: 'left', lineHeight: 1.1 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>Ambiente</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.4, fontWeight: 700, marginTop: 2, whiteSpace: 'nowrap', color: attivo ? 'rgba(255,255,255,0.75)' : ADM.DESK_PRUGNA_CHIARO }}>
          {r.live ? <React.Fragment><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4A6E', animation: 'dkLive 1.4s ease-in-out infinite' }}/>Riunione in corso</React.Fragment> : online.length + ' online'}
        </span>
      </span>
      <DkPila ids={online} size={24} max={3} bordo={fondo}/>
    </button>
  );
}
window.DkAmbientePillola = DkAmbientePillola;

window.DkAmbientePage = DkAmbientePage;
window.DkAmbienteBottone = DkAmbienteBottone;
window.dkRiepilogo = dkRiepilogo;
window.dkApri = dkApri;
