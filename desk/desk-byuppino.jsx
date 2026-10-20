// Desk — Byuppino, l'assistente (20 ottobre 2026)
//
// Byuppino è la mascotte di byup con le cuffie da assistenza: in Desk è
// l'assistente a cui si chiedono le cose in italiano normale — «quanti locali
// Business a Milano?», «chi devo richiamare?» — e a cui si fanno FARE le cose:
// creare e assegnare un'attività, scrivere in un canale di Ambiente, fissare
// una riunione, chiudere un ticket, aprire la scheda di un locale.
//
// Come lavora, in questo prototipo:
//   · LEGGE le stesse fonti delle pagine (LOCALI, UTENTI, STAFF, TEAM,
//     COMUNICAZIONI, RICHIAMATE, MRR_ORA, MONTHLY_REVENUE, HUB_MAIL,
//     HUB_WORKFLOW, HUB_AGENTI e lo store di Ambiente): un numero detto da
//     Byuppino è il numero che si trova un clic dopo.
//   · Capisce con un motore di intenti scritto a mano (bpCapisci): verbi,
//     nomi di persone, locali, città, piani, canali e date in parole
//     («domani alle 15», «venerdì»). Nel prodotto vero al posto del motore c'è
//     un modello linguistico con gli stessi strumenti; l'interfaccia non
//     cambia — ed è l'interfaccia che qui si sta decidendo.
//   · Non fa niente di nascosto: ogni azione che cambia i dati diventa prima
//     una PROPOSTA (cosa farà, con i campi in chiaro) e parte solo con
//     «Conferma». Fatta, arriva l'avviso in basso con «Annulla».
//
// Si apre dal personaggio in basso a destra, dalla sua faccia nella barra in
// alto, dalla barra nera a sinistra o con ⌘J; window.byuppinoApri(testo,
// invia) lo apre da qualunque pagina, già con la domanda scritta.

const { useState: useStateBp, useEffect: useEffectBp, useRef: useRefBp } = React;

// ═══════════════════════════════════════════════════════════════════════════
// Lo store della conversazione
// ═══════════════════════════════════════════════════════════════════════════
const BP_STORE = { s: { aperto: false, messaggi: [], pensando: false, bozza: '', attesa: null, salutato: false }, ascolta: new Set() };
function bpStato() { return BP_STORE.s; }
function bpAggiorna(campi) { BP_STORE.s = Object.assign({}, BP_STORE.s, typeof campi === 'function' ? campi(BP_STORE.s) : campi); BP_STORE.ascolta.forEach(f => f()); }
function bpUsaStore() {
  const [, setN] = useStateBp(0);
  useEffectBp(() => { const f = () => setN(n => n + 1); BP_STORE.ascolta.add(f); return () => { BP_STORE.ascolta.delete(f); }; }, []);
  return BP_STORE.s;
}
let BP_CONTA = 0;
const bpId = () => 'bp' + (++BP_CONTA);

function byuppinoApri(testo, invia) {
  bpAggiorna({ aperto: true, bozza: testo && !invia ? testo : BP_STORE.s.bozza });
  if (testo && invia) setTimeout(() => bpInvia(testo), 120);
  setTimeout(() => { const t = document.querySelector('.bp-input'); if (t) { t.focus(); const v = t.value; t.setSelectionRange(v.length, v.length); } }, 80);
}
window.byuppinoApri = byuppinoApri;

// ═══════════════════════════════════════════════════════════════════════════
// Le parole
// ═══════════════════════════════════════════════════════════════════════════
const bpNorm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim();
const BP_VUOTE = new Set('il lo la i gli le un uno una di da del della dei degli delle dello al alla ai agli alle allo nel nella nei negli nelle con su per tra fra a e o in che chi cosa come quanti quante quanto quale quali mi ti ci si me te noi voi loro mio mia miei mie tuo tua suo sua sono sei e ha ho hanno abbiamo apri aprimi mostra mostrami fammi vedere dimmi vai portami scheda cerca trova trovami locale locali utente utenti persona contatto contatti trattoria ristorante pizzeria osteria bar bistrot enoteca caffe cafe pub ok grazie per favore please'.split(' '));
const bpParole = (t) => bpNorm(t).replace(/[^a-z0-9#@:'\s-]/g, ' ').split(/[\s']+/).filter(Boolean);
const bpSignificative = (t) => bpParole(t).filter(w => w.length > 2 && !BP_VUOTE.has(w));
const bpMaiuscola = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
const bpEuro = (n) => '€ ' + new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(Math.round(n));
const bpOra = (d) => d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
function bpGiornoTesto(d) {
  const oggi = new Date(); const dom = new Date(); dom.setDate(oggi.getDate() + 1);
  const stesso = (a, b) => a.toDateString() === b.toDateString();
  const g = stesso(d, oggi) ? 'oggi' : stesso(d, dom) ? 'domani' : d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  return g + ' alle ' + bpOra(d);
}
const bpTeam = () => (typeof TEAM !== 'undefined' ? TEAM : []).filter(t => t.attivo);
const bpNomeTeam = (t) => t.isYou ? 'te' : t.nome;
const bpPiano = (id) => ((typeof PIANI !== 'undefined' ? PIANI : []).find(p => p.id === id) || { label: id }).label;

// Le date in parole: «oggi», «domani alle 15», «venerdì», «tra 3 giorni», «il 25».
const BP_GIORNI = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];
function bpQuando(n, oraDefault) {
  let d = null; let trovato = false;
  const base = new Date(); base.setSeconds(0, 0);
  if (/\bdopodomani\b/.test(n)) { d = new Date(base); d.setDate(d.getDate() + 2); trovato = true; }
  else if (/\bdomani\b/.test(n)) { d = new Date(base); d.setDate(d.getDate() + 1); trovato = true; }
  else if (/\b(oggi|stasera|stamattina|stamani|oggi pomeriggio)\b/.test(n)) { d = new Date(base); trovato = true; }
  const tra = n.match(/\btra (\d+|un|una|due|tre) (giorni|giorno|settimane|settimana)\b/);
  if (!trovato && tra) {
    const num = { un: 1, una: 1, due: 2, tre: 3 }[tra[1]] || parseInt(tra[1], 10);
    d = new Date(base); d.setDate(d.getDate() + num * (tra[2].startsWith('settiman') ? 7 : 1)); trovato = true;
  }
  if (!trovato) {
    BP_GIORNI.forEach((g, i) => {
      if (trovato) return;
      if (new RegExp('\\b' + g + '\\b').test(n)) {
        d = new Date(base); const diff = (i - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + diff); trovato = true;
      }
    });
  }
  const il = n.match(/\b(?:il|entro il) (\d{1,2})\b/);
  if (!trovato && il) { d = new Date(base); const g = parseInt(il[1], 10); if (g < d.getDate()) d.setMonth(d.getMonth() + 1); d.setDate(g); trovato = true; }
  const ora = n.match(/\b(?:alle|ore|per le|entro le)\s+(\d{1,2})(?:[:.](\d{2}))?\b/);
  let h = null, m = 0;
  if (ora) { h = parseInt(ora[1], 10); m = ora[2] ? parseInt(ora[2], 10) : 0; if (h < 8) h += 12; }
  else if (/\bstasera\b/.test(n)) h = 19;
  else if (/\b(stamattina|stamani)\b/.test(n)) h = 11;
  else if (/\bpomeriggio\b/.test(n)) h = 15;
  if (!trovato && h == null) return null;
  if (!d) d = new Date(base);
  d.setHours(h != null ? h : oraDefault, m, 0, 0);
  return d;
}

// Persone del team nominate nel testo (per nome o cognome); «me», «a me».
function bpPersoneNel(n) {
  const trovate = [];
  bpTeam().forEach(t => {
    if (t.isYou) return;
    const parti = bpNorm(t.nome).split(' ');
    if (parti.some(p => p.length > 2 && new RegExp('\\b' + p + '\\b').test(n))) trovate.push(t);
  });
  return trovate;
}

// Canali di Ambiente nominati nel testo: «#generale», «nel canale vendite», «in marketing».
function bpCanaleNel(n) {
  if (typeof dkLeggi !== 'function') return null;
  const s = dkLeggi();
  const hash = n.match(/#([a-z0-9-]+)/);
  if (hash) { const c = s.canali.find(c => c.nome === hash[1] || c.id === hash[1] || c.nome.startsWith(hash[1])); if (c) return c; }
  return s.canali.find(c => new RegExp('\\b(canale|in|su|nel)\\s+#?' + c.nome.split('-')[0] + '\\b').test(n)) || null;
}

// La ricerca nelle persone e nei locali. Il punteggio premia il nome intero
// dentro la domanda, poi le parole distintive in comune («nonna»).
function bpCerca(testo) {
  const n = bpNorm(testo);
  const sig = bpSignificative(testo);
  const punti = (nome) => {
    const nn = bpNorm(nome);
    if (nn.length > 3 && n.includes(nn)) return 10;
    const ws = bpSignificative(nome);
    const comuni = ws.filter(w => sig.includes(w)).length;
    if (!comuni) return 0;
    return comuni * 3 + (comuni === ws.length ? 2 : 0);
  };
  const out = [];
  LOCALI.forEach(l => { const p = punti(l.nome); if (p) out.push({ tipo: 'locale', ref: l, p, titolo: l.nome, sotto: admTipoLabel(l.tipo) + ' · ' + l.citta + ' · ' + bpPiano(l.piano), icona: 'store', apri: { rotta: 'locali', opts: { openLocale: l } } }); });
  LOCALI.forEach(l => { const p = l.titolare ? punti(l.titolare) : 0; if (p >= 5) out.push({ tipo: 'titolare', ref: l, p: p - 1, titolo: l.titolare, sotto: 'Titolare di ' + l.nome + ' · ' + l.citta, icona: 'user', apri: { rotta: 'locali', opts: { openLocale: l } } }); });
  (window.UTENTI || []).forEach(u => { const p = punti(u.nome); if (p >= 5) out.push({ tipo: 'utente', ref: u, p: p - 1, titolo: u.nome, sotto: 'Utente app · ' + u.citta, icona: 'phone', apri: { rotta: 'utenti', opts: { openUtente: u } } }); });
  (typeof STAFF !== 'undefined' ? STAFF : []).forEach(st => { const p = punti(st.nome); if (p >= 5) out.push({ tipo: 'staff', ref: st, p: p - 1, titolo: st.nome, sotto: 'Staff · ' + st.localeNome, icona: 'users', apri: { rotta: 'camerieri', opts: { openStaff: st } } }); });
  return out.sort((a, b) => b.p - a.p);
}

// ═══════════════════════════════════════════════════════════════════════════
// Le sezioni, per «apri…», «portami…»
// ═══════════════════════════════════════════════════════════════════════════
const BP_SEZIONI = [
  { rotta: 'oggi',         nome: 'Oggi',            parole: ['oggi', 'home', 'pagina iniziale', 'inizio'] },
  { rotta: 'dashboard',    nome: 'Analisi',         parole: ['analisi', 'analisi dati', 'dashboard', 'statistiche', 'report'] },
  { rotta: 'contatti',     nome: 'Contatti',        parole: ['contatti', 'rubrica', 'clienti'] },
  { rotta: 'sales',        nome: 'Sales',           parole: ['sales', 'pipeline', 'trattative', 'vendite'] },
  { rotta: 'elenchi',      nome: 'Elenchi',         parole: ['elenchi', 'segmenti', 'liste'] },
  { rotta: 'mkt-mail',     nome: 'Marketing · Mail', parole: ['mail', 'email', 'newsletter', 'marketing', 'campagne'] },
  { rotta: 'mkt-sms',      nome: 'Marketing · SMS', parole: ['sms'] },
  { rotta: 'mkt-posta',    nome: 'Messaggi all\'app', parole: ['messaggi all\'app', 'bacheca', 'push', 'notifiche'] },
  { rotta: 'mkt-form',     nome: 'Marketing · Form', parole: ['form', 'moduli'] },
  { rotta: 'workflow',     nome: 'Workflow',        parole: ['workflow', 'automazioni'] },
  { rotta: 'agent',        nome: 'Agent',           parole: ['agent', 'agenti'] },
  { rotta: 'assistenza',   nome: 'Assistenza',      parole: ['assistenza', 'supporto', 'ticket', 'chiamate'] },
  { rotta: 'ambiente',     nome: 'Ambiente',        parole: ['ambiente', 'chat', 'chat del team'] },
  { rotta: 'impostazioni', nome: 'Impostazioni',    parole: ['impostazioni', 'sicurezza', 'proprieta', 'domini'] },
  { rotta: 'profilo',      nome: 'Il mio profilo',  parole: ['profilo', 'il mio profilo', 'password'] },
];

// I suggerimenti cambiano con la pagina in cui sei.
const BP_SPUNTI = {
  oggi:        ['Cosa devo fare oggi?', 'Com\'è andato il mese?', 'Quali locali rischiamo di perdere?'],
  dashboard:   ['Ricavo del mese', 'Quanti locali attivi ci sono?', 'Locali fermi nell\'avvio'],
  contatti:    ['Quanti locali Business a Milano?', 'Apri Trattoria della Nonna', 'Pizzerie a Napoli'],
  sales:       ['Com\'è messa la pipeline?', 'Apri una trattativa con Osteria Bonelli, piano Business', 'Quali passi sono in ritardo?'],
  elenchi:     ['Quanti locali Plus attivi?', 'Utenti app attivi', 'Apri le mail'],
  'mkt-mail':  ['Com\'è andata l\'ultima mail?', 'Quanti utenti app attivi?', 'Scrivi in #marketing: '],
  'mkt-sms':   ['Com\'è andata l\'ultima mail?', 'Quanti utenti app attivi?'],
  'mkt-posta': ['Quanti utenti app attivi?', 'Com\'è andata l\'ultima mail?'],
  'mkt-form':  ['Quali workflow sono attivi?', 'Com\'è andata l\'ultima mail?'],
  workflow:    ['Quali workflow sono attivi?', 'Cosa hanno trovato gli agenti?'],
  agent:       ['Cosa hanno trovato gli agenti?', 'Quali locali rischiamo di perdere?'],
  assistenza:  ['Quanti ticket aperti?', 'Chi devo richiamare?', 'Segna M101 come risolto'],
  ambiente:    ['Scrivi in #generale: ', 'Fissa una riunione con Laura domani alle 15', 'Le mie attività'],
  impostazioni:['Chi c\'è nel team?', 'Cosa devo fare oggi?'],
  profilo:     ['Cosa devo fare oggi?', 'Chi c\'è nel team?'],
};

// ═══════════════════════════════════════════════════════════════════════════
// Il motore: da una frase a una risposta fatta di pezzi
// ═══════════════════════════════════════════════════════════════════════════
// Pezzi: testo · numero · elenco · azioni · proposta · compiti.
const bpT = (t) => ({ tipo: 'testo', t });
const bpAzioni = (bottoni) => ({ tipo: 'azioni', bottoni });

function bpCapisci(testo, rotta) {
  const n = bpNorm(testo);
  const st = bpStato();

  // Una risposta a una domanda di Byuppino: «Cosa scrivo?» → il testo.
  if (st.attesa && st.attesa.tipo === 'testo-messaggio') {
    bpAggiorna({ attesa: null });
    return bpPropostaMessaggio(st.attesa.conv, st.attesa.etichetta, testo.trim());
  }

  if (!n) return [bpT('Scrivimi pure, anche a parole tue.')];

  if (/^(ciao|ehi|hey|buongiorno|buonasera|salve|we|hola)\b/.test(n) && n.split(' ').length <= 3) {
    return [bpT('Ciao Marco! 👋 Sono qui. Posso leggere i dati di Desk, trovare e aprire le schede, e fare delle cose al posto tuo — sempre chiedendoti conferma prima.'), bpAzioni([
      { label: 'Cosa devo fare oggi?', chiedi: 'Cosa devo fare oggi?' }, { label: 'Com\'è andato il mese?', chiedi: 'Com\'è andato il mese?' },
    ])];
  }
  if (/\b(cosa (sai|puoi) fare|aiuto|help|come funzioni|che fai)\b/.test(n)) return bpCapacita();
  if (/\b(grazie|perfetto|ottimo|grande|top)\b/.test(n) && n.split(' ').length <= 3) return [bpT('Figurati! Se ti serve altro sono qui. 💜')];

  // ── Azioni ───────────────────────────────────────────────────────────────
  if (/\b(crea|creami|apri|aprimi|aggiungi|nuova|nuovo|segna)\b/.test(n) && /\b(trattativ|deal|opportunita)/.test(n) && typeof slCrea === 'function') {
    return bpPropostaTrattativa(testo, n);
  }
  if (/\b(ricordami|promemoria)\b/.test(n) || (/\b(crea|creami|aggiungi|nuova|nuovo|fai|metti|assegna)\b/.test(n) && /\b(attivita|task|compito|to ?do|cosa da fare)\b/.test(n))) {
    return bpPropostaAttivita(testo, n);
  }
  if (/\b(fissa|fissami|pianifica|organizza|programma|prenota|metti in calendario|crea|metti)\b/.test(n) && /\b(riunione|call|meeting|incontro|1:1|videochiamata)\b/.test(n)) {
    return bpPropostaRiunione(testo, n);
  }
  if (/\b(scrivi|manda|invia|posta|pubblica|avvisa|dici|di' a|scrivere)\b/.test(n) && (/#|\bcanale\b|\bin (generale|lancio|assistenza|prodotto|marketing|vendite|direzione)\b/.test(n) || bpPersoneNel(n).length)) {
    return bpIntentoMessaggio(testo, n);
  }
  if (/\b(segna|chiudi|completa|finisci|spunta)\b/.test(n) && /\b(t-\d+|attivita|task)\b/.test(n)) return bpPropostaChiudiAttivita(testo, n);
  if (/\b(segna|chiudi|risolvi|archivia)\b/.test(n) && /\b(ticket|m\d{3}|richiesta)\b/.test(n)) return bpPropostaTicket(testo, n);

  // ── Le mie cose ──────────────────────────────────────────────────────────
  if (/\b(cosa (devo|ho da) fare|le mie attivita|miei task|mie attivita|to ?do\b|da fare oggi|la mia giornata)/.test(n)) return bpMieAttivita();

  // ── Navigazione esplicita ────────────────────────────────────────────────
  const nav = n.match(/^(?:apri|aprimi|vai (?:a|su|in|alla|al|nella|nelle|negli)|portami (?:a|su|in|alla|al|nella|nelle)?|mostrami|fammi vedere)\s+(?:la |il |le |i |gli |l')?(?:pagina |sezione )?(.+)$/);
  if (nav) {
    const resto = nav[1].replace(/[?.!]+$/, '').trim();
    const sez = BP_SEZIONI.find(x => x.parole.includes(resto));
    if (sez) return bpVai(sez.rotta, null, 'Ecco **' + sez.nome + '**.');
    const trovati = bpCerca(resto);
    if (trovati.length && (trovati.length === 1 || trovati[0].p > (trovati[1] ? trovati[1].p : 0))) {
      const t = trovati[0];
      return bpVai(t.apri.rotta, t.apri.opts, 'Ti apro la scheda di **' + t.titolo + '**.', [{ tipo: 'elenco', voci: [t] }]);
    }
    if (trovati.length > 1) return [bpT('Ne ho trovati ' + trovati.length + ', quale apro?'), { tipo: 'elenco', voci: trovati.slice(0, 6) }];
  }

  // ── Domande sui numeri ───────────────────────────────────────────────────
  if (/\b(riassunto|panoramica|come (stiamo|va |andiamo|sta andando)|com'e andat|com'e il mese|andamento|briefing|punto della situazione)/.test(n) && !/\b(mail|campagn|newsletter)\b/.test(n)) return bpRiassunto();
  if (/\b(pipeline|trattativ|sales|deal|vendit|prossimi passi)/.test(n) && typeof slLeggi === 'function') return bpSales();
  if (/\b(ricav|mrr|fatturat|incass|guadagn|entrate|soldi)/.test(n)) return bpRicavi();
  if (/\b(rischi|perder|perdendo|churn|dormient|non ordin|abbandon|inattiv)/.test(n)) return bpRischio();
  if (/\b(onboarding|avvio|fermi|bloccat|a meta)/.test(n) && /\blocal/.test(n)) return bpFermi();
  if (/\b(richiam|chiamat|telefonat)/.test(n)) return bpChiamate();
  if (/\bticket\b/.test(n)) return bpTicket();
  if (/\b(riunion|meeting|call\b|agenda|calendario)/.test(n)) return bpRiunioni();
  if (/\b(ultima mail|campagn|newsletter|apertur|tasso di|mail)/.test(n)) return bpMail();
  if (/\bworkflow|automazion/.test(n)) return bpWorkflow();
  if (/\b(agent|analist)/.test(n)) return bpAgenti();
  if (/\bteam\b|\bcolleghi\b|chi c'e/.test(n)) return bpTeamRisposta();
  if (/\butent/.test(n) && !/\b(local|pizzer|ristorant|trattori|bistrot|enotec|bar\b)/.test(n)) return bpUtenti();
  if (/\b(local|pizzer|ristorant|trattori|bistrot|enotec|bar\b|osteri|quanti|quante)/.test(n)) {
    const r = bpLocaliFiltrati(n);
    if (r) return r;
  }

  // ── Chi è / cerca ────────────────────────────────────────────────────────
  const trovati = bpCerca(testo);
  if (trovati.length) {
    const forte = trovati[0].p >= 5 && (!trovati[1] || trovati[0].p > trovati[1].p);
    if (forte && /\b(apri|scheda|mostra)\b/.test(n)) {
      const t = trovati[0];
      return bpVai(t.apri.rotta, t.apri.opts, 'Ti apro la scheda di **' + t.titolo + '**.', [{ tipo: 'elenco', voci: [t] }]);
    }
    return [bpT(forte ? 'Ho trovato **' + trovati[0].titolo + '**:' : 'Ho trovato questi, dimmi quale ti serve:'), { tipo: 'elenco', voci: trovati.slice(0, forte ? 1 : 6) }];
  }

  return [bpT('Non sono sicuro di aver capito. Prova a chiedermelo così, per esempio:'), bpAzioni(
    (BP_SPUNTI[rotta] || BP_SPUNTI.oggi).filter(x => !x.endsWith(': ')).slice(0, 3).map(q => ({ label: q, chiedi: q })).concat([{ label: 'Cosa sai fare?', chiedi: 'Cosa sai fare?' }]),
  )];
}

function bpVai(rotta, opts, testo, extra) {
  setTimeout(() => window.hubVai && window.hubVai(rotta, opts || undefined), 350);
  return [bpT(testo)].concat(extra || []);
}

function bpCapacita() {
  return [
    bpT('Ecco cosa so fare. Chiedimelo come lo diresti a un collega:'),
    { tipo: 'capacita', voci: [
      { icona: 'chart', t: 'Rispondere sui dati', es: 'Quanti locali Business a Milano?' },
      { icona: 'search', t: 'Trovare e aprire schede', es: 'Apri Trattoria della Nonna' },
      { icona: 'checkSquare', t: 'Creare e assegnare attività', es: 'Ricordami di chiamare Sorbillo domani alle 11' },
      { icona: 'hash', t: 'Scrivere al team', es: 'Scrivi in #lancio: la landing è online' },
      { icona: 'video', t: 'Fissare riunioni', es: 'Fissa una riunione con Laura e Paola venerdì alle 15' },
      { icona: 'ticket', t: 'Chiudere ticket', es: 'Segna M101 come risolto' },
    ] },
    bpT('Prima di cambiare qualcosa ti mostro sempre cosa sto per fare, e puoi annullare.'),
  ];
}

// ─── Numeri ────────────────────────────────────────────────────────────────
function bpDeltaMese() {
  const m = MONTHLY_REVENUE; const a = m[m.length - 1], b = m[m.length - 2];
  const va = a.sub + a.extra, vb = b.sub + b.extra;
  return vb ? (va - vb) / vb * 100 : 0;
}
const bpPc = (v) => (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + '%';

function bpRicavi() {
  const d = bpDeltaMese();
  const ultimi = MONTHLY_REVENUE.slice(-12);
  const media = ultimi.reduce((a, m) => a + m.sub + m.extra, 0) / ultimi.length;
  return [
    { tipo: 'numero', valore: bpEuro(MRR_ORA.totale), etichetta: 'Ricavo ricorrente del mese', pillola: bpPc(d) + ' sul mese prima', tono: d >= 0 ? 'su' : 'giu' },
    bpT(`Sono **${bpEuro(MRR_ORA.abbonamenti)}** di abbonamenti e **${bpEuro(MRR_ORA.extra)}** di ordini oltre piano, con un ricavo medio per locale di ${bpEuro(MRR_ORA.arpa)}. Negli ultimi 12 mesi la media è stata di ${bpEuro(media)} al mese.`),
    bpAzioni([{ label: 'Apri Analisi', icona: 'chart', rotta: 'dashboard' }, { label: 'Chi rischiamo di perdere?', chiedi: 'Quali locali rischiamo di perdere?' }]),
  ];
}

function bpRiassunto() {
  const attivi = LOCALI.filter(l => l.stato === 'active').length;
  const ticket = COMUNICAZIONI.filter(c => c.stato === 'nuova' || c.stato === 'in_corso').length;
  const chiamate = RICHIAMATE.filter(r => r.stato === 'attesa').length;
  const r = typeof dkRiepilogo === 'function' ? dkRiepilogo() : { mie: 0, menzioni: 0 };
  const d = bpDeltaMese();
  return [
    bpT('Ecco il punto di oggi:'),
    { tipo: 'griglia', voci: [
      { v: bpEuro(MRR_ORA.totale), l: 'ricavo del mese', s: bpPc(d), tono: d >= 0 ? 'su' : 'giu' },
      { v: attivi, l: 'locali attivi', s: 'su ' + LOCALI.length },
      { v: ticket, l: 'ticket aperti' },
      { v: chiamate, l: 'chiamate da fare' },
    ] },
    bpT(`Hai **${r.mie} attività** aperte e **${r.menzioni} menzioni** in Ambiente. ${LOCALI.filter(l => l.stato === 'dormant').length} locali non ordinano da più di un mese: è la cosa che guarderei per prima.`),
    bpAzioni([{ label: 'Le mie attività', chiedi: 'Cosa devo fare oggi?' }, { label: 'Locali a rischio', chiedi: 'Quali locali rischiamo di perdere?' }]),
  ];
}

function bpRischio() {
  const dorm = LOCALI.filter(l => l.stato === 'dormant').sort((a, b) => new Date(a.lastLogin) - new Date(b.lastLogin));
  const ag = (window.HUB_AGENTI || []).find(a => /retention/i.test(a.nome));
  const giorni = (l) => Math.round((Date.now() - new Date(l.lastLogin).getTime()) / 864e5);
  return [
    bpT(`**${dorm.length} locali** non entrano e non ordinano da più di un mese. Dal più fermo:`),
    { tipo: 'elenco', voci: dorm.slice(0, 6).map(l => ({ titolo: l.nome, sotto: l.citta + ' · ' + bpPiano(l.piano), destra: giorni(l) + ' gg', icona: 'store', apri: { rotta: 'locali', opts: { openLocale: l } } })) },
    ag ? { tipo: 'citazione', da: ag.nome, t: ag.ultimoEsito } : null,
    bpAzioni([
      { label: 'Crea un\'attività per richiamarli', icona: 'checkSquare', chiedi: 'Crea un\'attività per Sara: richiamare i ' + dorm.length + ' locali dormienti, entro venerdì' },
      { label: 'Apri Contatti', icona: 'users', rotta: 'contatti' },
    ]),
  ].filter(Boolean);
}

function bpFermi() {
  const fermi = LOCALI.filter(l => l.stato === 'onboarding' && l.stoppedAt);
  return [
    bpT(`**${fermi.length} locali** si sono fermati a metà avvio:`),
    { tipo: 'elenco', voci: fermi.slice(0, 6).map(l => ({ titolo: l.nome, sotto: l.citta + ' · ' + (l.completedSteps || []).length + ' passi fatti' + (l.stoppedSub ? ' · fermo su ' + l.stoppedSub : ''), icona: 'store', apri: { rotta: 'locali', opts: { openLocale: l } } })) },
    bpAzioni([{ label: 'Assegna i richiami a Sara', icona: 'checkSquare', chiedi: 'Crea un\'attività per Sara: richiamare i locali fermi nell\'avvio, domani' }]),
  ];
}

function bpChiamate() {
  const att = RICHIAMATE.filter(r => r.stato === 'attesa').sort((a, b) => new Date(a.entro) - new Date(b.entro));
  if (!att.length) return [bpT('Nessuna chiamata in coda. 🎉')];
  return [
    bpT(`Ci sono **${att.length} chiamate** da fare. La prima scade alle **${bpOra(new Date(att[0].entro))}**:`),
    { tipo: 'elenco', voci: att.slice(0, 5).map(r => ({ titolo: r.localeNome, sotto: r.problema, destra: 'entro ' + bpOra(new Date(r.entro)), icona: 'phoneCall', apri: { rotta: 'assistenza', opts: { tab: 'richiamate' } } })) },
    bpAzioni([{ label: 'Apri le chiamate', icona: 'headsetFill', rotta: 'assistenza', opts: { tab: 'richiamate' } }]),
  ];
}

function bpTicket() {
  const aperti = COMUNICAZIONI.filter(c => c.stato === 'nuova' || c.stato === 'in_corso').sort((a, b) => (a.priorita === 'alta' ? -1 : 0) - (b.priorita === 'alta' ? -1 : 0) || new Date(b.data) - new Date(a.data));
  const nuovi = aperti.filter(c => c.stato === 'nuova').length;
  return [
    { tipo: 'numero', valore: aperti.length, etichetta: 'Ticket aperti', pillola: nuovi + ' ancora da prendere', tono: nuovi ? 'giu' : 'lilla' },
    { tipo: 'elenco', voci: aperti.slice(0, 5).map(c => ({ titolo: c.oggetto, sotto: c.id + ' · ' + c.senderName + (c.priorita === 'alta' ? ' · priorità alta' : ''), icona: 'ticket', apri: { rotta: 'comunicazioni', opts: { openComm: c.id } } })) },
    bpAzioni([{ label: 'Apri Assistenza', icona: 'headsetFill', rotta: 'assistenza', opts: { tab: 'ticket' } }]),
  ];
}

function bpRiunioni() {
  if (typeof dkLeggi !== 'function') return [bpT('Ambiente non è caricato.')];
  const s = dkLeggi();
  const ora = Date.now();
  const mie = s.riunioni.filter(r => r.chi.includes('admin0') && r.inizio.getTime() + r.durata * 60000 > ora).sort((a, b) => a.inizio - b.inizio).slice(0, 5);
  return [
    bpT(mie.length ? 'Le tue prossime riunioni:' : 'Non hai riunioni in agenda.'),
    { tipo: 'elenco', voci: mie.map(r => ({ titolo: r.titolo, sotto: (r.inizio.getTime() <= ora ? '🔴 in corso adesso' : bpGiornoTesto(r.inizio)) + ' · ' + r.durata + ' min', icona: 'video', apri: { rotta: 'ambiente', vista: 'riunioni' } })) },
    bpAzioni([{ label: 'Fissane una', icona: 'plus', scrivi: 'Fissa una riunione con ' }]),
  ];
}

function bpMail() {
  const inviate = (window.HUB_MAIL || []).filter(m => m.stato === 'inviata').sort((a, b) => new Date(b.inviata) - new Date(a.inviata));
  const m = inviate[0];
  if (!m) return [bpT('Non trovo mail inviate.')];
  const ap = m.aperte / m.consegnate * 100, cl = m.click / m.consegnate * 100;
  return [
    bpT(`L'ultima campagna è **«${m.nome}»**, inviata il ${new Date(m.inviata).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} a ${m.dest} contatti.`),
    { tipo: 'griglia', voci: [
      { v: ap.toFixed(0) + '%', l: 'aperture', s: m.aperte + ' persone', tono: ap > 40 ? 'su' : 'lilla' },
      { v: cl.toFixed(1).replace('.', ',') + '%', l: 'click', s: m.click + ' click' },
      { v: m.disiscritti, l: 'disiscritti' },
      { v: m.rimbalzi, l: 'rimbalzi' },
    ] },
    bpT(ap > 40 ? 'Sopra la media del settore (circa il 35% per la ristorazione B2B): l\'oggetto ha funzionato.' : 'Un po\' sotto la media: proverei un oggetto più concreto.'),
    bpAzioni([{ label: 'Apri le mail', icona: 'mail', rotta: 'mkt-mail' }]),
  ];
}

function bpWorkflow() {
  const w = window.HUB_WORKFLOW || [];
  return [
    bpT(`Hai **${w.filter(x => x.stato === 'attivo').length} workflow attivi** su ${w.length}:`),
    { tipo: 'elenco', voci: w.map(x => ({ titolo: x.nome, sotto: x.stato === 'attivo' ? (x.inCorso != null ? x.inCorso + ' in corso adesso' : 'attivo') : x.stato, destra: x.stato === 'attivo' ? '●' : '‖', icona: 'flow', apri: { rotta: 'workflow' } })) },
  ];
}

function bpAgenti() {
  const a = window.HUB_AGENTI || [];
  return [
    bpT('Gli agenti e l\'ultima cosa che hanno trovato:'),
    { tipo: 'elenco', voci: a.map(x => ({ titolo: x.nome, sotto: x.ultimoEsito || x.obiettivo, destra: x.stato === 'errore' ? '⚠︎' : '', icona: 'sparkles', apri: { rotta: 'agent' } })) },
  ];
}

function bpTeamRisposta() {
  const t = bpTeam();
  return [
    bpT(`Nel team siete in **${t.length}**:`),
    { tipo: 'elenco', voci: t.map(x => ({ titolo: x.isYou ? (x.nomeCompleto + ' (tu)') : x.nome, sotto: admLabelRuolo(x.ruolo) + ' · ' + x.email, icona: 'user', apri: { rotta: 'ambiente', vista: 'oggi' } })) },
  ];
}

function bpUtenti() {
  const u = window.UTENTI || [];
  const att = u.filter(x => x.attivo).length;
  return [
    { tipo: 'numero', valore: att, etichetta: 'Utenti app attivi, su ' + u.length + ' nel campione', pillola: Math.round(att / u.length * 100) + '% attivi', tono: 'lilla' },
    bpT('Sono quelli che hanno usato l\'app nell\'ultimo mese. Gli altri li trovi in Contatti filtrando per «Utente App».'),
    bpAzioni([{ label: 'Apri Contatti', icona: 'users', rotta: 'contatti' }]),
  ];
}

// «Quanti locali Business a Milano?», «pizzerie a Napoli», «locali attivi»
function bpLocaliFiltrati(n) {
  let l = LOCALI.slice(); const filtri = [];
  const citta = Array.from(new Set(LOCALI.map(x => x.citta))).find(c => new RegExp('\\b' + bpNorm(c) + '\\b').test(n));
  if (citta) { l = l.filter(x => x.citta === citta); filtri.push('a ' + citta); }
  const piani = { gratuit: 'free', free: 'free', starter: 'starter', plus: 'plus', business: 'business' };
  const pk = Object.keys(piani).find(k => new RegExp('\\b' + k).test(n));
  if (pk) { l = l.filter(x => x.piano === piani[pk]); filtri.push('con piano ' + bpPiano(piani[pk])); }
  const tipi = { pizzer: 'pizzeria', ristorant: 'ristorante', bistrot: 'bistrot', enotec: 'enoteca', 'bar': 'bar' };
  const tk = Object.keys(tipi).find(k => new RegExp('\\b' + k).test(n));
  if (tk) { l = l.filter(x => x.tipo === tipi[tk]); }
  const stati = [['attiv', 'active', 'attivi'], ['in avvio', 'onboarding', 'in avvio'], ['onboarding', 'onboarding', 'in avvio'], ['iscritt', 'registered', 'solo iscritti'], ['registrat', 'registered', 'solo iscritti'], ['dormient', 'dormant', 'dormienti'], ['pers', 'churned', 'persi']];
  const sk = stati.find(s => new RegExp('\\b' + s[0]).test(n));
  if (sk) { l = l.filter(x => x.stato === sk[1]); filtri.push(sk[2]); }
  if (!citta && !pk && !tk && !sk && !/\b(quanti|quante|locali)\b/.test(n)) return null;
  const nome = tk ? (tipi[tk] === 'bar' ? 'bar' : tipi[tk] === 'pizzeria' ? 'pizzerie' : tipi[tk] === 'enoteca' ? 'enoteche' : tipi[tk] === 'bistrot' ? 'bistrot' : 'ristoranti') : 'locali';
  if (!l.length) return [bpT(`Nessun ${nome === 'locali' ? 'locale' : nome} ${filtri.join(' ')} in rubrica.`), bpAzioni([{ label: 'Apri Contatti', icona: 'users', rotta: 'contatti' }])];
  const mrr = l.reduce((a, x) => a + (x.mrr || 0), 0);
  return [
    { tipo: 'numero', valore: l.length, etichetta: bpMaiuscola(nome) + (filtri.length ? ' ' + filtri.join(', ') : ' in rubrica'), pillola: mrr ? bpEuro(mrr) + ' al mese' : null, tono: 'lilla' },
    { tipo: 'elenco', voci: l.slice(0, 6).map(x => ({ titolo: x.nome, sotto: x.citta + ' · ' + bpPiano(x.piano) + ' · ' + ({ active: 'attivo', onboarding: 'in avvio', registered: 'iscritto', dormant: 'dormiente', churned: 'perso' }[x.stato] || x.stato), icona: 'store', apri: { rotta: 'locali', opts: { openLocale: x } } })) },
    l.length > 6 ? bpT(`…e altri ${l.length - 6}.`) : null,
    bpAzioni([{ label: 'Mostrami in Contatti', icona: 'eye', rotta: 'contatti' }]),
  ].filter(Boolean);
}

function bpMieAttivita() {
  if (typeof dkLeggi !== 'function') return [bpT('Ambiente non è caricato.')];
  const mie = dkLeggi().attivita.filter(a => a.chi.includes('admin0') && a.stato !== 'fatto').sort((a, b) => a.scadenza - b.scadenza);
  if (!mie.length) return [bpT('Non hai attività aperte. Giornata leggera! ☕')];
  const scadute = mie.filter(a => a.scadenza.getTime() < Date.now()).length;
  return [
    bpT(`Hai **${mie.length} attività** aperte${scadute ? ', ' + scadute + ' già scaduta' + (scadute > 1 ? 'e' : '') : ''}. Spunta quelle che hai finito:`),
    { tipo: 'compiti', ids: mie.slice(0, 6).map(a => a.id) },
    bpAzioni([{ label: 'Aggiungine una', icona: 'plus', scrivi: 'Crea un\'attività: ' }, { label: 'Apri le attività', icona: 'checkSquare', rotta: 'ambiente', vista: 'attivita' }]),
  ];
}

// ─── Sales ─────────────────────────────────────────────────────────────────
function bpSales() {
  const l = slLeggi();
  const n = slNumeri(l);
  const fasi = [['contatto', 'Primo contatto'], ['demo', 'Demo'], ['proposta', 'Proposta'], ['trattativa', 'Trattativa']];
  const nome = (t) => { const x = t.localeId && LOCALI.find(y => y.id === t.localeId); return x ? x.nome : t.prospect; };
  const val = (t) => Math.round(((PIANI.find(p => p.id === t.piano) || {}).price || 0) * 12);
  const passi = l.filter(t => t.passo && fasi.some(f => f[0] === t.fase)).sort((a, b) => a.passo.quando - b.passo.quando).slice(0, 4);
  return [
    { tipo: 'numero', valore: bpEuro(n.pipeline), etichetta: n.aperte + ' trattative aperte, valore all\'anno', pillola: 'ponderata ' + bpEuro(n.ponderata), tono: 'lilla' },
    { tipo: 'griglia', voci: fasi.map(f => { const v = l.filter(t => t.fase === f[0]); return { v: v.length, l: f[1], s: bpEuro(v.reduce((a, t) => a + val(t), 0)) }; }) },
    bpT(n.scaduti ? `**${n.scaduti} passi sono in ritardo.** I prossimi da fare:` : 'I prossimi passi:'),
    { tipo: 'elenco', voci: passi.map(t => ({ titolo: t.passo.testo, sotto: nome(t) + ' · ' + t.id, destra: (t.passo.quando.getTime() < Date.now() - 36e5 ? '⚠︎ ' : '') + t.passo.quando.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }), icona: 'target', apri: { rotta: 'sales' } })) },
    bpAzioni([{ label: 'Apri Sales', icona: 'target', rotta: 'sales' }, { label: 'Nuova trattativa', icona: 'plus', scrivi: 'Apri una trattativa con ' }]),
  ];
}

function bpPropostaTrattativa(testo, n) {
  const loc = bpCerca(testo).filter(x => x.tipo === 'locale' || x.tipo === 'titolare')[0];
  const locale = loc && loc.p >= 5 ? loc.ref : null;
  let prospect = '';
  if (!locale) {
    const m = testo.match(/\b(?:con|per|a|di)\s+(?:il |la |lo |l'|i )?([A-ZÀ-Ý][^,.:;]*?)(?=,|\.|:|;|\s+(?:piano|in fase|fase|entro|domani|oggi|per|a |di )|$)/);
    prospect = m ? m[1].trim() : '';
  }
  if (!locale && !prospect) return [bpT('Con quale locale? Per esempio: «Apri una trattativa con Osteria Bonelli, piano Business».')];
  const piano = /\bbusiness\b/.test(n) ? 'business' : /\bstarter\b/.test(n) ? 'starter' : 'plus';
  const fase = /\bdemo\b/.test(n) ? 'demo' : /\bpropost/.test(n) ? 'proposta' : 'contatto';
  const dp = testo.indexOf(':');
  const passo = dp >= 0 ? bpMaiuscola(BP_RE_DATA.reduce((x, re) => x.replace(re, ' '), testo.slice(dp + 1)).replace(/\s+/g, ' ').trim()) || 'Primo contatto' : fase === 'demo' ? 'Fare la demo' : 'Primo contatto: capire coperti e sale';
  const quando = bpQuando(n, 11) || (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(11, 0, 0, 0); return d; })();
  const nomeP = locale ? locale.nome : prospect;
  const prezzo = Math.round(((PIANI.find(p => p.id === piano) || {}).price || 0) * 12);
  return [
    bpT('Apro questa trattativa in Sales:'),
    { tipo: 'proposta', id: bpId(), stato: 'attesa', icona: 'target', titolo: nomeP, conferma: 'Apri trattativa',
      righe: [['Locale', locale ? locale.nome + ' · in rubrica' : prospect + ' · prospect'], ['Piano', bpPiano(piano) + ' · ' + bpEuro(prezzo) + '/anno'], ['Fase', { contatto: 'Primo contatto', demo: 'Demo', proposta: 'Proposta' }[fase]], ['Prossimo passo', passo + ' · ' + bpGiornoTesto(quando)]],
      esegui: () => {
        const t = slCrea({ localeId: locale ? locale.id : '', prospect, citta: '', piano, fase, fonte: 'Contatto diretto', passo, quando, chi: 'admin0', daByuppino: true });
        return {
          testo: `Trattativa **${t.id}** aperta in Sales.`,
          avviso: 'Trattativa ' + t.id + ' aperta',
          annulla: () => { if (typeof slLeggi === 'function') { const resto = slLeggi().filter(x => x.id !== t.id); window.__slScrivi ? window.__slScrivi(resto) : null; } },
          dopo: [{ label: 'Apri Sales', icona: 'target', rotta: 'sales' }],
        };
      } },
  ];
}

// ─── Le proposte: cosa farò, e il pulsante per farlo ──────────────────────
function bpPrendiTitolo(testo, n, togli) {
  let t = testo;
  const dp = t.indexOf(':');
  if (dp >= 0) t = t.slice(dp + 1);
  else {
    t = t.replace(/^\s*(ricordami di|ricordami che|ricordami|promemoria( per)?|crea(mi)?( una| un)?( nuova| nuovo)? (attivita|attività|task|compito)( per)?|aggiungi( una| un)? (attivita|attività|task|compito)( per)?|nuova (attivita|attività)( per)?)\s*/i, '');
  }
  (togli || []).forEach(re => { t = t.replace(re, ' '); });
  t = t.replace(/\s+/g, ' ').replace(/^[\s,:-]+|[\s,.:-]+$/g, '');
  return bpMaiuscola(t);
}
const BP_RE_DATA = [/\b(entro )?(oggi|domani|dopodomani|stasera|stamattina|stamani)\b/gi, /\b(entro )?(lunedì|lunedi|martedì|martedi|mercoledì|mercoledi|giovedì|giovedi|venerdì|venerdi|sabato|domenica)(?![a-zà-ù])/gi, /\b(alle|ore|per le|entro le)\s+\d{1,2}([:.]\d{2})?\b/gi, /\btra (\d+|un|una|due|tre) (giorni|giorno|settimane|settimana)\b/gi, /\b(entro )?il \d{1,2}\b/gi, /\b(urgente|priorità alta|priorita alta|bassa priorità)\b/gi];

function bpPropostaAttivita(testo, n) {
  const persone = bpPersoneNel(n);
  const chi = persone.length ? persone.map(p => p.id) : ['admin0'];
  const togliPersone = persone.map(p => new RegExp('\\b(per|a|ad|assegnala a|assegnalo a)\\s+' + p.nome.split(' ')[0] + '(\\s+' + (p.nome.split(' ')[1] || '') + ')?\\b', 'gi'));
  const quando = bpQuando(n, 18) || (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(18, 0, 0, 0); return d; })();
  const priorita = /\burgent/.test(n) ? 'urgente' : /\b(alta|importante)\b/.test(n) ? 'alta' : /\bbassa\b/.test(n) ? 'bassa' : 'normale';
  const canale = bpCanaleNel(n);
  const togliCanale = canale ? [new RegExp('\\b(nel canale|in|su)\\s+#?' + canale.nome + '\\b', 'gi'), new RegExp('#' + canale.nome, 'gi')] : [];
  let titolo = bpPrendiTitolo(testo, n, BP_RE_DATA.concat(togliPersone).concat(togliCanale));
  if (!titolo || titolo.length < 3) titolo = 'Nuova attività';
  const can = canale ? canale.id : (/\b(chiam|richiam|ticket|assistenza)/.test(n) ? 'assistenza' : /\b(demo|contratto|vendit|trattativ)/.test(n) ? 'vendite' : /\b(mail|campagn|post|social|newsletter|spot|landing)/.test(n) ? 'marketing' : 'generale');
  const nomeCanale = (dkLeggi().canali.find(c => c.id === can) || { nome: can }).nome;
  const nomi = chi.map(id => { const t = bpTeam().find(x => x.id === id); return t ? (t.isYou ? 'Te' : t.nome) : id; }).join(', ');
  return [
    bpT('Ecco l\'attività che creo:'),
    { tipo: 'proposta', id: bpId(), stato: 'attesa', icona: 'checkSquare', titolo, conferma: 'Crea attività',
      righe: [['Assegnata a', nomi], ['Scadenza', bpGiornoTesto(quando)], ['Priorità', bpMaiuscola(priorita)], ['Canale', '#' + nomeCanale]],
      esegui: () => {
        const id = dkNuovoId('T-');
        dkSalvaAttivita({ id, titolo, stato: 'da_fare', priorita, chi, scadenza: quando, canale: can, desc: 'Creata da Byuppino su richiesta di Marco.', checklist: [], commenti: [] });
        return {
          testo: `Fatto: **${id}** è in #${nomeCanale}${chi.includes('admin0') ? '' : ' e ' + nomi + ' riceve la notifica'}.`,
          avviso: 'Attività ' + id + ' creata',
          annulla: () => dkAggiorna(s => ({ attivita: s.attivita.filter(a => a.id !== id) })),
          dopo: [{ label: 'Apri le attività', icona: 'checkSquare', rotta: 'ambiente', vista: 'attivita' }],
        };
      } },
  ];
}

function bpIntentoMessaggio(testo, n) {
  const s = dkLeggi();
  const canale = bpCanaleNel(n);
  let conv = null, etichetta = '';
  if (canale) { conv = canale.id; etichetta = '#' + canale.nome; }
  else {
    const p = bpPersoneNel(n)[0];
    const dm = p && s.diretti.find(d => d.con.length === 1 && d.con[0] === p.id);
    if (dm) { conv = dm.id; etichetta = p.nome; }
    else if (p) return [bpT(`Non hai ancora una chat diretta con ${p.nome}. Apri Ambiente e scrivile da lì, oppure scrivo in #generale menzionandola?`), bpAzioni([{ label: 'Sì, in #generale', scrivi: 'Scrivi in #generale: @' + p.nome + ' ' }])];
  }
  if (!conv) return [bpT('In quale canale scrivo? Per esempio: «Scrivi in #lancio: la landing è online».')];
  const m = testo.match(/[:«"“](.+?)[»"”]?\s*$/);
  const corpo = m ? m[1].trim() : '';
  if (!corpo) {
    bpAggiorna({ attesa: { tipo: 'testo-messaggio', conv, etichetta } });
    return [bpT(`Cosa scrivo in **${etichetta}**?`)];
  }
  return bpPropostaMessaggio(conv, etichetta, corpo);
}

function bpPropostaMessaggio(conv, etichetta, corpo) {
  const testoFinale = typeof dkCodificaMenzioni === 'function' ? dkCodificaMenzioni(corpo) : corpo;
  return [
    bpT(`Ecco il messaggio per **${etichetta}**:`),
    { tipo: 'proposta', id: bpId(), stato: 'attesa', icona: 'send', titolo: corpo, citazione: true, conferma: 'Invia',
      righe: [['Dove', etichetta], ['Da', 'Marco Rinaldi (tu)']],
      esegui: () => {
        const id = dkScrivi(conv, testoFinale);
        return {
          testo: `Inviato in **${etichetta}**.`,
          avviso: 'Messaggio inviato in ' + etichetta,
          annulla: () => dkAggiorna(s => ({ messaggi: Object.assign({}, s.messaggi, { [conv]: (s.messaggi[conv] || []).filter(x => x.id !== id) }) })),
          dopo: [{ label: 'Apri la conversazione', icona: 'chat', rotta: 'ambiente', vista: 'conv:' + conv }],
        };
      } },
  ];
}

function bpPropostaRiunione(testo, n) {
  const persone = bpPersoneNel(n);
  const chi = ['admin0'].concat(persone.map(p => p.id));
  const quando = bpQuando(n, 10) || (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d; })();
  const durata = /\b(un'ora|1 ora|un ora|60 min)/.test(n) ? 60 : /\b(un quarto d'ora|15 min)/.test(n) ? 15 : /\b45 min/.test(n) ? 45 : 30;
  const canale = bpCanaleNel(n);
  const su = testo.match(/\b(?:su|per parlare di|per|sul|sulla|sui)\s+(?:il |la |lo |i |le )?([^,.;]+?)(?:\s+(?:con|domani|oggi|dopodomani|lunedì|martedì|mercoledì|giovedì|venerdì|alle|il)\b|$)/i);
  const dp = testo.indexOf(':');
  let titolo = dp >= 0 ? bpMaiuscola(testo.slice(dp + 1).trim()) : su && su[1].length > 3 && !bpPersoneNel(bpNorm(su[1])).length ? bpMaiuscola(su[1].trim()) : (persone.length ? 'Riunione con ' + persone.map(p => p.nome.split(' ')[0]).join(' e ') : 'Riunione');
  const nomi = persone.length ? persone.map(p => p.nome).join(', ') : 'solo tu';
  return [
    bpT('Fisso questa riunione e mando l\'invito:'),
    { tipo: 'proposta', id: bpId(), stato: 'attesa', icona: 'video', titolo, conferma: 'Fissa e invita',
      righe: [['Quando', bpGiornoTesto(quando)], ['Durata', durata + ' minuti'], ['Con', nomi], ['Canale', canale ? '#' + canale.nome : '—']],
      esegui: () => {
        const id = dkNuovoId('R-');
        dkAggiorna(st => ({ riunioni: st.riunioni.concat([{ id, titolo, inizio: quando, durata, chi, canale: canale ? canale.id : null }]) }));
        return {
          testo: `Fissata per **${bpGiornoTesto(quando)}**${persone.length ? '; ' + persone.map(p => p.nome.split(' ')[0]).join(' e ') + ' hanno l\'invito' : ''}.`,
          avviso: 'Riunione fissata · ' + bpGiornoTesto(quando),
          annulla: () => dkAggiorna(st => ({ riunioni: st.riunioni.filter(r => r.id !== id) })),
          dopo: [{ label: 'Apri le riunioni', icona: 'video', rotta: 'ambiente', vista: 'riunioni' }],
        };
      } },
  ];
}

function bpPropostaChiudiAttivita(testo, n) {
  const s = dkLeggi();
  const idm = n.match(/\bt-(\d+)\b/);
  let a = idm ? s.attivita.find(x => x.id.toLowerCase() === 't-' + idm[1]) : null;
  if (!a) {
    const sig = bpSignificative(testo).filter(w => !['segna', 'chiudi', 'completa', 'fatta', 'fatto', 'attivita', 'task', 'come'].includes(w));
    a = s.attivita.filter(x => x.stato !== 'fatto').map(x => ({ x, p: bpSignificative(x.titolo).filter(w => sig.includes(w)).length })).filter(o => o.p).sort((p, q) => q.p - p.p).map(o => o.x)[0];
  }
  if (!a) return [bpT('Quale attività? Dimmi il codice (es. T-104) o un pezzo del titolo.'), bpAzioni([{ label: 'Le mie attività', chiedi: 'Le mie attività' }])];
  if (a.stato === 'fatto') return [bpT(`**${a.id}** è già fatta.`)];
  const prima = a.stato;
  return [
    { tipo: 'proposta', id: bpId(), stato: 'attesa', icona: 'checkCircle', titolo: a.titolo, conferma: 'Segna come fatta',
      righe: [['Attività', a.id], ['Stato adesso', ({ da_fare: 'Da fare', in_corso: 'In corso', revisione: 'In revisione' }[prima] || prima)]],
      esegui: () => {
        dkCambiaAttivita(a.id, { stato: 'fatto' });
        return { testo: `**${a.id}** è fatta. 🎉`, avviso: a.id + ' segnata come fatta', annulla: () => dkCambiaAttivita(a.id, { stato: prima }) };
      } },
  ];
}

function bpPropostaTicket(testo, n) {
  const idm = n.match(/\bm(\d{3})\b/);
  let c = idm ? COMUNICAZIONI.find(x => x.id.toLowerCase() === 'm' + idm[1]) : null;
  if (!c) {
    const sig = bpSignificative(testo).filter(w => !['segna', 'chiudi', 'risolvi', 'risolto', 'ticket', 'come', 'archivia'].includes(w));
    c = COMUNICAZIONI.filter(x => x.stato === 'nuova' || x.stato === 'in_corso').find(x => sig.some(w => bpNorm(x.senderName + ' ' + x.oggetto).includes(w)));
  }
  if (!c) return [bpT('Quale ticket? Dimmi il codice (es. M101) o il nome di chi l\'ha aperto.'), bpAzioni([{ label: 'Ticket aperti', chiedi: 'Quanti ticket aperti?' }])];
  if (c.stato === 'risolta') return [bpT(`Il ticket **${c.id}** è già risolto.`)];
  const prima = c.stato;
  return [
    { tipo: 'proposta', id: bpId(), stato: 'attesa', icona: 'ticket', titolo: c.oggetto, conferma: 'Segna come risolto',
      righe: [['Ticket', c.id], ['Da', c.senderName], ['Stato adesso', prima === 'nuova' ? 'Nuovo' : 'In corso']],
      esegui: () => {
        c.stato = 'risolta';
        return { testo: `Ticket **${c.id}** risolto. ${c.senderName} riceve la mail di chiusura.`, avviso: 'Ticket ' + c.id + ' risolto', annulla: () => { c.stato = prima; },
          dopo: [{ label: 'Apri il ticket', icona: 'ticket', rotta: 'comunicazioni', opts: { openComm: c.id } }] };
      } },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// Il giro di una domanda
// ═══════════════════════════════════════════════════════════════════════════
function bpInvia(testo) {
  const t = String(testo || '').trim();
  if (!t || bpStato().pensando) return;
  bpAggiorna(s => ({ messaggi: s.messaggi.concat([{ id: bpId(), da: 'tu', testo: t }]), bozza: '', pensando: true }));
  const attesa = 520 + Math.min(700, t.length * 9);
  setTimeout(() => {
    let parti;
    try { parti = bpCapisci(t, window.hubRotta || 'oggi'); }
    catch (e) { console.error('[Byuppino]', e); parti = [bpT('Ops, qui mi sono inceppato. Riprova con parole diverse?')]; }
    bpAggiorna(s => ({ messaggi: s.messaggi.concat([{ id: bpId(), da: 'bp', parti }]), pensando: false }));
  }, attesa);
}

function bpEseguiProposta(msgId, idx) {
  const s = bpStato();
  const msg = s.messaggi.find(m => m.id === msgId); if (!msg) return;
  const p = msg.parti[idx]; if (!p || p.stato !== 'attesa') return;
  const esito = p.esegui();
  const aggiorna = (stato) => bpAggiorna(st => ({ messaggi: st.messaggi.map(m => m.id !== msgId ? m : Object.assign({}, m, { parti: m.parti.map((q, i) => i === idx ? Object.assign({}, q, { stato }) : q) })) }));
  aggiorna('fatta');
  const annulla = () => { esito.annulla && esito.annulla(); aggiorna('annullata'); bpAggiorna(st => ({ messaggi: st.messaggi.concat([{ id: bpId(), da: 'bp', parti: [bpT('Annullato, ho rimesso tutto com\'era.')] }]) })); };
  bpAggiorna(st => ({ messaggi: st.messaggi.concat([{ id: bpId(), da: 'bp', parti: [bpT('✓ ' + esito.testo)].concat(esito.dopo ? [bpAzioni(esito.dopo)] : []) }]) }));
  if (window.deskAvviso) window.deskAvviso({ testo: esito.avviso || 'Fatto', annulla: esito.annulla ? annulla : null });
}
function bpScartaProposta(msgId, idx) {
  bpAggiorna(st => ({ messaggi: st.messaggi.map(m => m.id !== msgId ? m : Object.assign({}, m, { parti: m.parti.map((q, i) => i === idx ? Object.assign({}, q, { stato: 'scartata' }) : q) })) }));
  bpAggiorna(st => ({ messaggi: st.messaggi.concat([{ id: bpId(), da: 'bp', parti: [bpT('Ok, lascio stare. Vuoi cambiarla? Riscrivimela come la vuoi.')] }]) }));
}

function bpAzione(b) {
  if (b.chiedi) return bpInvia(b.chiedi);
  if (b.scrivi) return byuppinoApri(b.scrivi);
  if (b.vista && typeof dkApri === 'function') dkApri(b.vista);
  if (b.rotta && window.hubVai) window.hubVai(b.rotta, b.opts || undefined);
}

// ═══════════════════════════════════════════════════════════════════════════
// La faccia
// ═══════════════════════════════════════════════════════════════════════════
function BpRicco({ t }) {
  // **grassetto** e a capo; niente altro markdown.
  const righe = String(t).split('\n');
  return (
    <React.Fragment>
      {righe.map((r, i) => (
        <React.Fragment key={i}>
          {r.split(/(\*\*[^*]+\*\*)/g).map((x, j) => x.startsWith('**') ? <b key={j} style={{ fontWeight: 750 }}>{x.slice(2, -2)}</b> : <React.Fragment key={j}>{x}</React.Fragment>)}
          {i < righe.length - 1 && <br/>}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}

const BP_TONI = { su: { bg: '#1F5A43', fg: '#fff' }, giu: { bg: '#FF1F5A', fg: '#fff' }, lilla: { bg: '#DCBAD7', fg: '#492844' } };

function BpPezzo({ p, msgId, idx }) {
  if (!p) return null;
  if (p.tipo === 'testo') return <div className="bp-bolla"><BpRicco t={p.t}/></div>;
  if (p.tipo === 'numero') {
    const t = BP_TONI[p.tono] || BP_TONI.lilla;
    return (
      <div className="bp-scheda" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1 }}>{p.valore}</span>
          {p.pillola && <span style={{ fontSize: 11.4, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: t.bg, color: t.fg }}>{p.pillola}</span>}
        </div>
        <div style={{ fontSize: 12.6, fontWeight: 600, color: ADM.MUTED, marginTop: 5 }}>{p.etichetta}</div>
      </div>
    );
  }
  if (p.tipo === 'griglia') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {p.voci.map((v, i) => {
          const t = v.tono ? (BP_TONI[v.tono] || BP_TONI.lilla) : null;
          return (
            <div key={i} className="bp-scheda" style={{ padding: '11px 13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.035em' }}>{v.v}</span>
                {v.s && <span style={{ fontSize: 10.8, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: t ? t.bg : 'rgba(73,40,68,0.07)', color: t ? t.fg : ADM.MUTED }}>{v.s}</span>}
              </div>
              <div style={{ fontSize: 11.8, color: ADM.MUTED, fontWeight: 600, marginTop: 3 }}>{v.l}</div>
            </div>
          );
        })}
      </div>
    );
  }
  if (p.tipo === 'citazione') {
    return (
      <div className="bp-scheda" style={{ padding: '11px 13px', borderLeft: '3px solid ' + ADM.HUB_VIOLA }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.6, fontWeight: 800, color: ADM.HUB_VIOLA_DARK }}><BuIcons.sparkFill size={12}/>{p.da}</div>
        <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 4, color: ADM.TEXT }}>{p.t}</div>
      </div>
    );
  }
  if (p.tipo === 'capacita') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {p.voci.map(v => (
          <button key={v.t} onClick={() => byuppinoApri(v.es)} className="bp-scheda bp-tocca" style={{ padding: '11px 12px', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 5px 12px -8px rgba(73,40,68,0.6)', color: ADM.DESK_PRUGNA }}>{React.createElement(BuIcons[v.icona], { size: 14 })}</span>
            <span style={{ display: 'block', fontSize: 12.8, fontWeight: 750, marginTop: 8, color: ADM.TEXT, lineHeight: 1.25 }}>{v.t}</span>
            <span style={{ display: 'block', fontSize: 11.4, color: ADM.MUTED, marginTop: 3, lineHeight: 1.35 }}>«{v.es}»</span>
          </button>
        ))}
      </div>
    );
  }
  if (p.tipo === 'elenco') {
    if (!p.voci.length) return null;
    return (
      <div className="bp-scheda" style={{ padding: 5 }}>
        {p.voci.map((v, i) => (
          <button key={i} onClick={() => v.apri && bpAzione(v.apri)} className="bp-riga" style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '8px 9px', borderRadius: 14,
            border: 'none', background: 'transparent', cursor: v.apri ? 'pointer' : 'default', fontFamily: 'inherit',
          }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: '#fff', boxShadow: '0 5px 12px -8px rgba(73,40,68,0.55)', color: ADM.TEXT }}>
              {React.createElement(BuIcons[v.icona || 'dot'], { size: 15 })}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.2, fontWeight: 700, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.titolo}</span>
              <span style={{ display: 'block', fontSize: 11.6, color: ADM.MUTED, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.sotto}</span>
            </span>
            {v.destra && <span style={{ fontSize: 11.6, fontWeight: 750, color: ADM.MUTED, whiteSpace: 'nowrap' }}>{v.destra}</span>}
            {v.apri && <span className="bp-chev" style={{ display: 'inline-flex', color: ADM.MUTED_LIGHT }}><BuIcons.chevronRight size={15}/></span>}
          </button>
        ))}
      </div>
    );
  }
  if (p.tipo === 'azioni') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {p.bottoni.map((b, i) => (
          <button key={i} onClick={() => bpAzione(b)} className="bp-chip" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
            border: '1px solid rgba(73,40,68,0.14)', background: '#fff', color: ADM.TEXT, fontSize: 12.6, fontWeight: 700,
          }}>
            {b.icona ? React.createElement(BuIcons[b.icona], { size: 13 }) : <BuIcons.sparkles size={13}/>}{b.label}
          </button>
        ))}
      </div>
    );
  }
  if (p.tipo === 'compiti') return <BpCompiti ids={p.ids}/>;
  if (p.tipo === 'proposta') return <BpProposta p={p} msgId={msgId} idx={idx}/>;
  return null;
}

function BpCompiti({ ids }) {
  if (typeof dkUsaStore === 'function') dkUsaStore();
  const s = dkLeggi();
  const voci = ids.map(id => s.attivita.find(a => a.id === id)).filter(Boolean);
  return (
    <div className="bp-scheda" style={{ padding: 5 }}>
      {voci.map(a => {
        const fatto = a.stato === 'fatto';
        const scaduta = !fatto && a.scadenza.getTime() < Date.now();
        return (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 9px', borderRadius: 14 }}>
            <button onClick={() => {
              const prima = a.stato;
              dkCambiaAttivita(a.id, { stato: fatto ? 'da_fare' : 'fatto' });
              if (!fatto && window.deskAvviso) window.deskAvviso({ testo: a.id + ' fatta', annulla: () => dkCambiaAttivita(a.id, { stato: prima }) });
            }} aria-label={fatto ? 'Riapri' : 'Segna come fatta'} style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', display: 'grid', placeItems: 'center',
              border: fatto ? 'none' : '2px solid rgba(73,40,68,0.25)', background: fatto ? '#1F5A43' : '#fff', color: '#fff', transition: 'background 0.15s ease',
            }}>{fatto && <BuIcons.check size={13} strokeWidth={3}/>}</button>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.2, fontWeight: 650, color: fatto ? ADM.MUTED_SOFT : ADM.TEXT, textDecoration: fatto ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titolo}</span>
              <span style={{ display: 'block', fontSize: 11.6, color: scaduta ? ADM.DANGER : ADM.MUTED, fontWeight: scaduta ? 700 : 500, marginTop: 1 }}>{a.id} · {scaduta ? 'scaduta ' : ''}{bpGiornoTesto(a.scadenza)}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BpProposta({ p, msgId, idx }) {
  const Icona = BuIcons[p.icona || 'sparkles'];
  const chiusa = p.stato !== 'attesa';
  return (
    <div className="bp-scheda" style={{ padding: 0, overflow: 'hidden', opacity: p.stato === 'scartata' || p.stato === 'annullata' ? 0.55 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '13px 14px 10px' }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: ADM.INCHIOSTRO, color: '#fff' }}><Icona size={15}/></span>
        <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.35, color: ADM.TEXT, paddingTop: 5, fontStyle: p.citazione ? 'normal' : 'normal' }}>
          {p.citazione ? <span style={{ display: 'block', padding: '8px 11px', borderRadius: '4px 14px 14px 14px', background: '#F6EEF4', fontWeight: 550 }}>{p.titolo}</span> : p.titolo}
        </div>
      </div>
      <div style={{ padding: '0 14px 10px 56px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {p.righe.map(r => (
          <div key={r[0]} style={{ display: 'flex', gap: 8, fontSize: 12.4 }}>
            <span style={{ width: 82, flexShrink: 0, color: ADM.MUTED_SOFT, fontWeight: 600 }}>{r[0]}</span>
            <span style={{ color: ADM.TEXT, fontWeight: 650, minWidth: 0 }}>{r[1]}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '10px 12px 12px', borderTop: '1px solid rgba(73,40,68,0.07)', background: 'rgba(255,255,255,0.5)' }}>
        {!chiusa ? (
          <React.Fragment>
            <button onClick={() => bpEseguiProposta(msgId, idx)} className="bp-chip" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 750, background: ADM.INCHIOSTRO, color: '#fff' }}>
              <BuIcons.check size={14} strokeWidth={2.4}/>{p.conferma}
            </button>
            <button onClick={() => bpScartaProposta(msgId, idx)} className="bp-chip" style={{ padding: '9px 14px', borderRadius: 999, border: '1px solid rgba(73,40,68,0.14)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, background: '#fff', color: ADM.TEXT }}>Lascia stare</button>
          </React.Fragment>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.6, fontWeight: 750, color: p.stato === 'fatta' ? '#1F5A43' : ADM.MUTED, padding: '4px 4px' }}>
            {p.stato === 'fatta' ? <React.Fragment><BuIcons.checkCircle size={15}/>Fatto</React.Fragment> : p.stato === 'annullata' ? <React.Fragment><BuIcons.undo size={14}/>Annullato</React.Fragment> : 'Lasciato stare'}
          </span>
        )}
      </div>
    </div>
  );
}

function BpMessaggio({ m }) {
  if (m.da === 'tu') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'bpEntra 0.22s ease' }}>
        <div style={{ maxWidth: '82%', padding: '10px 14px', borderRadius: '20px 20px 6px 20px', background: ADM.INCHIOSTRO, color: '#fff', fontSize: 13.8, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{m.testo}</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', animation: 'bpEntra 0.26s ease' }}>
      <img src="byuppino-viso.webp" alt="" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#EBD7E8', marginTop: 2 }}/>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {m.parti.map((p, i) => <BpPezzo key={i} p={p} msgId={m.id} idx={i}/>)}
      </div>
    </div>
  );
}

function BpVuoto({ rotta }) {
  const h = new Date().getHours();
  const saluto = h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera';
  return (
    <div style={{ padding: '8px 4px 4px', animation: 'bpEntra 0.3s ease' }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.08, color: ADM.TEXT }}>{saluto} Marco!<br/><span style={{ color: ADM.DESK_PRUGNA }}>Cosa facciamo?</span></div>
      <div style={{ fontSize: 13.2, color: ADM.MUTED, marginTop: 8, lineHeight: 1.5 }}>Leggo i dati di Desk, trovo le schede e faccio le cose al posto tuo. Prima di cambiare qualcosa ti chiedo sempre conferma.</div>
      <div style={{ marginTop: 14 }}>
        <BpPezzo p={bpCapacita()[1]}/>
      </div>
    </div>
  );
}

function BpAssistente({ rotta }) {
  const s = bpUsaStore();
  const [benvenuto, setBenvenuto] = useStateBp(false);
  const lista = useRefBp(null);
  const input = useRefBp(null);

  // ⌘J apre e chiude, Esc chiude.
  useEffectBp(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); bpAggiorna(st => ({ aperto: !st.aperto })); }
      else if (e.key === 'Escape' && bpStato().aperto) bpAggiorna({ aperto: false });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // Il fumetto di benvenuto, una volta: compare dopo un attimo e se ne va.
  useEffectBp(() => {
    if (bpStato().salutato) return;
    const a = setTimeout(() => setBenvenuto(true), 1400);
    const b = setTimeout(() => { setBenvenuto(false); bpAggiorna({ salutato: true }); }, 9000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  useEffectBp(() => { if (lista.current) lista.current.scrollTop = lista.current.scrollHeight; }, [s.messaggi.length, s.pensando, s.aperto]);
  useEffectBp(() => {
    const t = input.current; if (!t) return;
    t.style.height = 'auto'; t.style.height = Math.min(110, t.scrollHeight) + 'px';
  }, [s.bozza, s.aperto]);

  const spunti = BP_SPUNTI[rotta] || BP_SPUNTI.oggi;

  if (!s.aperto) {
    return (
      // Byuppino abita sotto la barra nera, nella colonna di sinistra: lì non
      // copre mai un pulsante della pagina (a destra stanno «Chiama», «Invia»…).
      <div className="bp-lanciatore" style={{ position: 'absolute', left: 12, bottom: 62, zIndex: 120, display: 'flex', alignItems: 'flex-end' }}>
        {benvenuto && (
          <div onClick={() => byuppinoApri()} style={{
            position: 'absolute', left: 70, bottom: 46, width: 236, padding: '12px 14px', borderRadius: '20px 20px 20px 6px', cursor: 'pointer',
            background: '#fff', boxShadow: '0 22px 44px -20px rgba(42,26,40,0.5)', fontSize: 13.2, lineHeight: 1.45, color: ADM.TEXT, animation: 'bpFumetto 0.4s cubic-bezier(0.34,1.5,0.64,1)',
          }}>
            <b style={{ fontWeight: 750 }}>Ciao Marco!</b> Sono Byuppino. Chiedimi dei numeri, o dimmi cosa fare: ci penso io.
          </div>
        )}
        <button onClick={() => byuppinoApri()} aria-label="Apri Byuppino" className="bp-personaggio" style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'block' }}>
          <img src="byuppino.webp" alt="Byuppino" style={{ height: 92, display: 'block', filter: 'drop-shadow(0 12px 14px rgba(42,26,40,0.3))' }}/>
        </button>
      </div>
    );
  }

  return (
    <div className="bp-pannello" style={{
      position: 'absolute', right: 20, bottom: 20, top: 92, width: 420, zIndex: 130, display: 'flex', flexDirection: 'column',
      borderRadius: 30, background: 'rgba(252,249,248,0.94)', border: '1px solid rgba(255,255,255,0.9)',
      backdropFilter: 'blur(26px) saturate(150%)', WebkitBackdropFilter: 'blur(26px) saturate(150%)',
      boxShadow: '0 40px 90px -30px rgba(42,26,40,0.55), 0 0 0 1px rgba(73,40,68,0.05)', animation: 'bpApri 0.32s cubic-bezier(0.32,0.72,0,1)',
    }}>
      <style>{BP_CSS}</style>
      {/* La testata: Byuppino in carne e cuffie, che si affaccia sul bordo */}
      <div style={{ position: 'relative', padding: '16px 14px 12px 18px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: '1px solid rgba(73,40,68,0.07)' }}>
        <span style={{ position: 'relative', flexShrink: 0 }}>
          <img src="byuppino-viso.webp" alt="" style={{ width: 44, height: 44, borderRadius: '50%', display: 'block', background: '#EBD7E8', boxShadow: '0 0 0 3px #fff' }}/>
          <span style={{ position: 'absolute', right: 0, bottom: 0, width: 11, height: 11, borderRadius: '50%', background: '#2FB37C', boxShadow: '0 0 0 2px #fff' }}/>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16.5, fontWeight: 750, letterSpacing: '-0.025em', color: ADM.TEXT }}>Byuppino</div>
          <div style={{ fontSize: 12, color: ADM.MUTED, marginTop: 1 }}>{s.pensando ? 'sta pensando…' : 'Il tuo assistente in Desk'}</div>
        </div>
        {s.messaggi.length > 0 && (
          <button onClick={() => bpAggiorna({ messaggi: [], attesa: null })} className="desk-cerchio" title="Nuova conversazione" style={{ width: 36, height: 36 }}><BuIcons.refresh size={15}/></button>
        )}
        <button onClick={() => bpAggiorna({ aperto: false })} className="desk-cerchio" title="Chiudi · Esc" style={{ width: 36, height: 36 }}><BuIcons.x size={16}/></button>
      </div>

      <div ref={lista} className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '16px 16px 10px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {s.messaggi.length === 0 && <BpVuoto rotta={rotta}/>}
        {s.messaggi.map(m => <BpMessaggio key={m.id} m={m}/>)}
        {s.pensando && (
          <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            <img src="byuppino-viso.webp" alt="" className="bp-pensa-viso" style={{ width: 30, height: 30, borderRadius: '50%', background: '#EBD7E8' }}/>
            <div className="bp-bolla" style={{ display: 'inline-flex', gap: 4, padding: '12px 14px' }}>
              <i className="bp-punto"/><i className="bp-punto" style={{ animationDelay: '0.15s' }}/><i className="bp-punto" style={{ animationDelay: '0.3s' }}/>
            </div>
          </div>
        )}
      </div>

      {/* I suggerimenti di questa pagina, finché non si scrive */}
      {!s.bozza && !s.pensando && (
        <div style={{ display: 'flex', gap: 6, padding: '0 14px 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {spunti.map(q => (
            <button key={q} onClick={() => q.endsWith(': ') || q.endsWith(' ') ? byuppinoApri(q) : bpInvia(q)} className="bp-chip" style={{
              flexShrink: 0, padding: '7px 12px', borderRadius: 999, border: '1px solid rgba(73,40,68,0.12)', background: 'rgba(255,255,255,0.85)',
              fontFamily: 'inherit', fontSize: 12.4, fontWeight: 650, color: ADM.TEXT, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{q.trim()}</button>
          ))}
        </div>
      )}

      <div style={{ padding: '4px 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '6px 6px 6px 16px', borderRadius: 26, background: '#fff', border: '1px solid rgba(73,40,68,0.12)', boxShadow: '0 12px 28px -20px rgba(73,40,68,0.6)' }}>
          <textarea ref={input} className="bp-input" rows={1} value={s.bozza}
            onChange={e => bpAggiorna({ bozza: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); bpInvia(s.bozza); } }}
            placeholder={s.attesa ? 'Scrivi il messaggio…' : 'Chiedi o di\' cosa fare…'}
            style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.45, padding: '8px 0', color: ADM.TEXT, maxHeight: 110 }}/>
          <button onClick={() => bpInvia(s.bozza)} disabled={!s.bozza.trim() || s.pensando} aria-label="Invia" style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0, cursor: s.bozza.trim() ? 'pointer' : 'default', display: 'grid', placeItems: 'center',
            background: s.bozza.trim() ? ADM.PINK : 'rgba(73,40,68,0.08)', color: s.bozza.trim() ? '#fff' : ADM.MUTED_SOFT, transition: 'background 0.15s ease',
            boxShadow: s.bozza.trim() ? '0 10px 20px -10px rgba(255,31,90,0.8)' : 'none',
          }}><BuIcons.send size={17} strokeWidth={2}/></button>
        </div>
        <div style={{ fontSize: 10.8, color: ADM.MUTED_SOFT, textAlign: 'center', marginTop: 7 }}>Byuppino legge i dati di Desk · ogni modifica la confermi tu · ⌘J</div>
      </div>
    </div>
  );
}

const BP_CSS = `
textarea.bp-input:focus, textarea.bp-input:focus-visible { outline: none !important; border-color: transparent !important; box-shadow: none !important; }
.bp-bolla { align-self: flex-start; max-width: 100%; padding: 10px 13px; border-radius: 6px 20px 20px 20px; background: #fff; color: #1D1520; font-size: 13.8px; line-height: 1.5; box-shadow: 0 8px 20px -16px rgba(73,40,68,0.6); }
.bp-scheda { border-radius: 18px; background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.95); box-shadow: 0 10px 24px -18px rgba(73,40,68,0.55); }
.bp-tocca { transition: transform 0.14s ease, box-shadow 0.14s ease; }
.bp-tocca:hover { transform: translateY(-2px); box-shadow: 0 16px 28px -18px rgba(73,40,68,0.6); }
.bp-riga { transition: background 0.12s ease; }
.bp-riga:hover { background: rgba(73,40,68,0.05) !important; }
.bp-riga:hover .bp-chev { color: #1D1520 !important; }
.bp-chip { transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease; }
.bp-chip:hover { transform: translateY(-1px); border-color: rgba(73,40,68,0.3) !important; }
.bp-punto { width: 7px; height: 7px; border-radius: 50%; background: #492844; display: inline-block; animation: bpPunto 1s ease-in-out infinite; }
@keyframes bpPunto { 0%,100% { opacity: 0.25; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-3px) } }
@keyframes bpEntra { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes bpApri { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: none } }
.bp-pensa-viso { animation: bpDondola 1.2s ease-in-out infinite; }
@keyframes bpDondola { 0%,100% { transform: rotate(-6deg) } 50% { transform: rotate(6deg) } }
`;

// Il personaggio in basso: dondola piano, al passaggio del mouse si alza.
const BP_CSS_LANCIATORE = `
.bp-personaggio img { transform-origin: 50% 100%; animation: bpRespira 4.8s ease-in-out infinite; transition: transform 0.25s cubic-bezier(0.34,1.5,0.64,1); }
.bp-personaggio:hover img { animation-play-state: paused; transform: translateY(-10px) rotate(-3deg) scale(1.04); }
@keyframes bpRespira { 0%,100% { transform: translateY(8px) rotate(-1.5deg) } 50% { transform: translateY(2px) rotate(1.5deg) } }
@keyframes bpFumetto { from { opacity: 0; transform: translateX(-8px) scale(0.9); transform-origin: 0% 100% } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .bp-personaggio img, .bp-pensa-viso, .bp-punto { animation: none !important; } }
`;
function DeskByuppinoStile() { return <style>{BP_CSS_LANCIATORE}</style>; }

function DeskByuppino({ rotta }) {
  return (
    <React.Fragment>
      <DeskByuppinoStile/>
      <BpAssistente rotta={rotta}/>
    </React.Fragment>
  );
}

window.DeskByuppino = DeskByuppino;
window.bpCapisci = bpCapisci;
window.bpInvia = bpInvia;
