// Sezione Contatti — locali, staff e utenti app in un'unica rubrica.
//
// Tre voci di menu (Locali · Staff · Utenti App) sono diventate una: chi
// amministra la piattaforma cerca UNA persona — «di chi è questa mail?» — e
// non deve sapere in anticipo in quale delle tre liste vive. La lista porta
// le quattro colonne che identificano un contatto (email, tipologia, stadio,
// città); tutto il resto sta nel dettaglio, che resta QUELLO
// GIUSTO per ciascun tipo: il drawer del locale, la scheda dello staff, la
// scheda dell'utente app. Le vecchie pagine di sezione sono state
// RIMOSSE: restano i loro file per dataset e schede (STAFF, i drawer), e le
// rotte vecchie vengono tradotte qui da admin-app.

const { useState: useStateCnt, useMemo: useMemoCnt, useEffect: useEffectCnt } = React;

// Le tre tipologie, con la veste che le distingue in lista. Lo staff è TEAL
// e non blu: blu e viola a colpo d'occhio si confondevano con Utente App, e
// la tipologia è la colonna che si scandisce per colore. «Utente Staff»
// rima con «Utente App»: sono entrambi utenti, di due prodotti diversi.
// Solo parola e colore, niente icona: nella pillola l'icona ripeteva quello
// che la parola già dice, e la colonna deve scorrere pulita.
const CNT_TIPI = {
  locale: { label: 'Locale',       color: 'PINK'   },
  staff:  { label: 'Utente Staff', color: 'TEAL'   },
  utente: { label: 'Utente App',   color: 'PURPLE' },
};

// ─── Stadio commerciale ──────────────────────────────────────────────────────
// La TAPPA DEL RAPPORTO, senza i piani dentro (quelli sono una colonna a
// parte): dal lead al cliente che torna, fino al piano annullato e
// all'eliminazione. È una scala dei LOCALI — un utente app non ha un ciclo
// commerciale con byup — con una sola eccezione: «Eliminato» vale per
// chiunque sia stato cancellato, staff compreso. Qui la VESTE (etichetta,
// colore, rango per l'ordinamento); il valore lo dà hubStadio, sotto.
const CNT_CICLO = {
  lead:           { label: 'Lead',             color: 'INFO',         rango: 0 },
  iscritto:       { label: 'Iscritto',         color: 'PLAN_STARTER', rango: 1 },
  onboarding:     { label: 'In onboarding',    color: 'WARN',         rango: 2 },
  // L'attivo non è uno stadio solo: chi sta sul piano gratuito e chi paga
  // sono due rapporti commerciali diversi — per il modello a fasce di Fresh
  // è LA distinzione, e la scala la deve dire.
  clienteFree:    { label: 'Cliente Free',     color: 'TEAL',         rango: 3 },
  clientePagante: { label: 'Cliente Pagante',  color: 'OK',           rango: 4 },
  // Returning è il RIENTRATO, e SCADE: aveva annullato ed è tornato — l'esito
  // del win-back — ma lo stadio dura i primi 90 giorni dal rientro (la stessa
  // finestra della coda win-back), poi ci si laurea in Cliente Free o
  // Pagante. Un rientrato di tre anni fa è solo un cliente; il fatto
  // permanente sta nella proprietà «Rientrato il», non nel badge.
  returning:      { label: 'Returning',        color: 'PURPLE',       rango: 5 },
  annullato:      { label: 'Piano annullato',  color: 'DANGER',       rango: 6 },
  eliminato:      { label: 'Eliminato',        color: 'PLAN_FREE',    rango: 7 },
};

// ─── Stadio commerciale (P-43 · D-34) ───────────────────────────────────────
// Si CALCOLA, non si salva: un valore memorizzato diverge dal fatto che
// pretende di riassumere. Funzione pura sul contatto, letta a ogni render
// dalla colonna, dai filtri, dagli elenchi, dai workflow e dalla card in
// Analisi Dati (la proprietà `ciclo` di hub-data la porta come `leggi`) — la
// definizione sta qui e in nessun altro posto. Nessun workflow la scrive:
// una proprietà che si legge da un'altra fonte non è un'azione.
//   lead             il contatto non ha locali (creato a mano, nessun
//                    record in LOCALI dietro)
//   stadi intermedi  dal ciclo di vita del locale (lifecycle_status):
//                    iscritto non avviato → Iscritto, in onboarding →
//                    In onboarding. Chi ha saltato la configurazione
//                    completa OPERA, e quindi è già un cliente
//   clienteFree      locale operativo sul piano Gratuito
//   clientePagante   locale operativo su un piano diverso dal Gratuito
//   returning        entro 90 giorni dal rientro («Rientrato il»), poi ci
//                    si laurea in Free o Pagante
//   annullato        il rapporto è finito: ciclo di vita «churned», che sia
//                    disdetta del locale o risoluzione di Byup
//   eliminato        contatto cancellato (locale, staff o utente app: il
//                    flag `eliminato` sul record)
// Il provvedimento di Byup (platform_status) NON entra qui: un sospeso resta
// un cliente, e lo dice il fascicolo — vedi P-44.
function hubStadio(c) {
  if (!c) return null;
  if (c.ref && c.ref.eliminato) return 'eliminato';
  if (c.tipo !== 'locale') return null;
  const l = c.ref && c.ref.stato ? c.ref : null;
  if (!l) return 'lead';
  if (l.stato === 'pending') return 'iscritto';
  if (l.stato === 'onboarding') return 'onboarding';
  if (l.stato === 'churned') return 'annullato';
  if (c.rientrato && (Date.now() - new Date(c.rientrato).getTime()) / 86400000 <= 90) return 'returning';
  return l.piano === 'free' ? 'clienteFree' : 'clientePagante';
}
window.hubStadio = hubStadio;

// ─── Piano ──────────────────────────────────────────────────────────────────
// La colonna dei piani, separata dallo stadio: per i locali il piano
// Fresh (coi colori che i piani hanno già in tutto Hubble), per gli utenti app
// il piano dell'app (Base/Pro), per lo staff niente — un trattino.
const CNT_PIANI = {
  free:     { label: 'Gratuito', color: 'PLAN_FREE',     rango: 0 },
  starter:  { label: 'Starter',  color: 'PLAN_STARTER',  rango: 1 },
  plus:     { label: 'Plus',     color: 'PLAN_PLUS',     rango: 2 },
  business: { label: 'Business', color: 'PLAN_BUSINESS', rango: 3 },
  base:     { label: 'Base',     color: 'PLAN_FREE',     rango: 4 },
  pro:      { label: 'Pro',      color: 'PURPLE',        rango: 5 },
};

// ─── Le colonne ─────────────────────────────────────────────────────────────
// Non più un catalogo scritto qui: le colonne sono le PROPRIETÀ del contatto
// (hub-data.jsx), le stesse su cui si filtra e su cui si costruisce un elenco.
// Erano due elenchi separati che dicevano quasi le stesse cose, e ogni
// proprietà nuova andava aggiunta due volte — con il rischio, ogni volta, di
// poter filtrare per una cosa che non si può mostrare, o viceversa.
// Quali colonne si vedono e in che ordine lo decide chi guarda («Modifica
// colonne» + trascinamento delle intestazioni), e la scelta resta in
// localStorage. «Contatto» è fissa: una rubrica senza l'identità non è una
// lista, è un foglio di celle. Il `min` è il respiro sotto cui la colonna non
// deve mai finire, ricavato dal suo peso fr: fino a sei colonne non serve,
// dalla settima in su la somma dei minimi dà la larghezza da cui la tabella
// comincia a scorrere in orizzontale invece di strizzarsi.
const CNT_COLONNE = HUB_PROPRIETA.reduce((m, p) => {
  if (p.colonna) m[p.id] = {
    label: p.colonna.label || p.label, w: p.colonna.w, fissa: !!p.colonna.fissa,
    min: Math.round(140 * (parseFloat(String(p.colonna.w).replace(/^minmax\(0,/, '')) || 1)),
  };
  return m;
}, {});
const CNT_COLONNE_DEFAULT = ['nome', 'email', 'tipo', 'ciclo', 'piano', 'citta'];
// v3: le colonne ora escono dal catalogo delle proprietà e ce ne sono molte di
// più — la chiave nuova fa ripartire tutti dal default aggiornato invece di
// lasciarli con una disposizione che non conosce metà del listino.
const CNT_COLONNE_KEY = 'adm_contatti_colonne_v3';

// Il vestito del trascinamento: la barra d'inserimento entra con un mezzo
// scatto (nascere di colpo sembra un glitch), e i puntini-maniglia si vedono
// solo passando sull'intestazione — sono un invito, non un ornamento fisso.
const CNT_CSS = `
@keyframes cntBarraIn { from { transform: scaleY(0.4); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
.cnt-testata .cnt-grip { opacity: 0; transition: opacity 0.12s ease; }
.cnt-testata:hover .cnt-grip { opacity: 1; }
.cnt-scorri { overflow-x: auto; }
.cnt-scorri::-webkit-scrollbar { height: 9px; }
.cnt-scorri::-webkit-scrollbar-track { background: transparent; }
.cnt-scorri::-webkit-scrollbar-thumb { background: #D8DBE2; border-radius: 99px; border: 2px solid #fff; }
.cnt-scorri::-webkit-scrollbar-thumb:hover { background: #C2C6CF; }
`;

// Il browser, da solo, solleva uno screenshot sbiadito del bottone: brutto e
// storto. Qui il fantasma è una pillola disegnata apposta — il nome della
// colonna dentro un cartellino bianco bordato di corallo — montata fuori
// schermo giusto il tempo dello scatto e poi tolta.
function cntFantasma(e, label) {
  try {
    const g = document.createElement('div');
    g.textContent = label;
    g.style.cssText = 'position:fixed;top:-200px;left:-200px;z-index:9999;padding:7px 14px;'
      + 'background:#fff;border:1.5px solid ' + ADM.PINK + ';border-radius:9px;'
      + "font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;font-weight:700;"
      + 'letter-spacing:0.05em;text-transform:uppercase;color:' + ADM.PINK_DARK + ';'
      + 'box-shadow:0 14px 30px -8px rgba(15,17,21,0.35);white-space:nowrap;';
    document.body.appendChild(g);
    e.dataTransfer.setDragImage(g, Math.round(g.offsetWidth / 2), Math.round(g.offsetHeight / 2));
    setTimeout(() => g.remove(), 0);
  } catch (err) {}
}

// Un solo elenco, costruito una volta: i mock non cambiano a runtime.
const CONTATTI = (() => {
  const rows = [];

  // Nessun sottotitolo sotto i nomi, per NESSUNO dei tre tipi: la riga è il
  // nome e le sue quattro colonne, il resto vive nel dettaglio. Quello che il
  // sottotitolo diceva (tipo e città, ruolo e locale, città e ID) resta però
  // RICERCABILE dal campo `cerca`.
  LOCALI.forEach(l => {
    // Il gruppo dell'utenza del titolare: la STESSA fonte della scheda
    // locale e dello staff proprietario (drwLocaliAssociati) — la proprietà
    // «Locali associati» vale anche per i titolari multi-sede, e le tre
    // superfici non possono raccontare tre liste diverse.
    const gruppo = typeof drwLocaliAssociati === 'function' ? drwLocaliAssociati(l) : [];
    // Il rientro dopo un annullamento: nel sistema vero sta nello storico di
    // fatturazione, qui si deriva dal seme dell'id — circa un attivo su sette
    // ha un win-back alle spalle, sparso negli ultimi 10–200 giorni. La DATA
    // è il fatto permanente (proprietà «Rientrato il»); lo stadio Returning
    // lo calcola hubStadio da qui, per i primi 90 giorni.
    const seme = parseInt(l.id.slice(1), 10);
    const rientratoIl = l.stato === 'active' && seme % 7 === 3
      ? new Date(Date.now() - (10 + (seme * 37) % 190) * 86400000)
      : null;
    rows.push({
    key: 'loc-' + l.id, tipo: 'locale', ref: l,
    nome: l.nome,
    cerca: l.tipo + ' ' + l.citta,
    citta: l.citta, regione: l.regione,
    locali: gruppo.length > 1 ? gruppo.map(x => x.nome).join(' · ') : null,
    email: l.email,
    // Nessuno stadio scritto qui: lo calcola hubStadio dal locale (`ref`) e
    // dalla data del rientro, a ogni lettura.
    piano: l.piano,
    iscritto: l.dataIscrizione,
    rientrato: rientratoIl,
    });
  });

  STAFF.forEach(s => {
    const ruolo = (RUOLI_STAFF.find(r => r.id === s.ruolo) || {}).label || s.ruolo;
    const loc = LOCALI.find(l => l.id === s.localeId);
    // Un'utenza staff può essere associata a PIÙ locali (il primo è il
    // principale): la si deve trovare cercando uno qualunque di essi, e la
    // proprietà «Locali associati» li mette in colonna e nei filtri.
    const locali = s.locali || [];
    if ((s.id.charCodeAt(3) * 3 + s.id.charCodeAt(4)) % 9 === 0) s.eliminato = true;
    rows.push({
      key: 'stf-' + s.id, tipo: 'staff', ref: s,
      nome: s.nome,
      cerca: ruolo + ' ' + locali.map(x => x.nome + ' ' + x.citta).join(' '),
      // Lo staff sta dove sta il suo locale PRINCIPALE: città e regione sono
      // le sue; l'elenco completo dei locali vive nella proprietà dedicata.
      citta: s.localeCitta, regione: loc ? loc.regione : '—',
      locali: locali.map(x => x.nome).join(' · ') || null,
      // L'email vive nel mock dello staff (dominio del locale principale, lo
      // stesso da cui scrive il titolare) ed è la stessa che si legge e si
      // corregge nella tab Anagrafica della scheda. I dispositivi un'email
      // non ce l'hanno: sono contatti del locale, non persone — un tratto.
      email: s.email,
      // Lo staff non ha uno stadio commerciale — trattino — con una
      // eccezione: le utenze CANCELLATE dal locale restano in rubrica come
      // «Eliminato». Il flag sta sul record, dove hubStadio lo legge; il mock
      // non lo porta, e qui se ne accende qualcuno, stabile sull'id.
      piano: null,
      iscritto: s.dataAssunzione,
    });
  });

  UTENTI.forEach(u => rows.push({
    key: 'utn-' + u.id, tipo: 'utente', ref: u,
    nome: u.nome,
    cerca: u.citta + ' ' + u.regione,
    citta: u.citta, regione: u.regione,
    email: u.email,
    // L'utente app non ha uno stadio commerciale con byup: trattino, salvo
    // il flag `eliminato` sul record, che hubStadio legge.
    // Nessun campo `restrizione` congelato qui: la proprietà ha il suo lettore
    // vivo sul registro (hub-data.jsx) — una revoca appena fatta deve spegnere
    // la pillola nello stesso istante in cui cala il badge del registro, non
    // al prossimo reload.
    // Il piano dell'app. Il mock non lo porta: lo si deriva stabile dalle
    // ULTIME cifre dell'id (le prime sono uguali per tutti, 'U20…'), circa un
    // utente su sette è Pro — abbastanza da vederli in lista.
    piano: (u.id.charCodeAt(3) * 3 + u.id.charCodeAt(4)) % 7 === 0 ? 'pro' : 'base',
    iscritto: u.dataRegistrazione,
  }));

  // Le proprietà di marketing (referral, canale, consensi, interessi, ultima
  // attività…) non stanno nei mock dell'anagrafica: si derivano qui, stabili
  // sull'id, perché una rubrica che cambia valori a ogni ricarica non si può
  // né leggere né filtrare. Vedi hubArricchisci in hub-data.jsx.
  rows.forEach(hubArricchisci);

  return rows;
})();

function AdmContattiPage({ search, openContatto }) {
  // I filtri sono una LISTA DI FRASI, non una griglia di spunte: proprietà,
  // operatore, valore. «Referral è noto». «Data di creazione successiva al 3
  // luglio 2026». Le spunte sapevano dire una cosa sola — «è una di queste
  // voci» — e per tutto il resto non c'era grammatica.
  // Vivono in un PANNELLO LATERALE, non in una tendina: comporre tre frasi
  // dentro un popover da 250px non si riesce, e da lì i filtri restano in
  // vista mentre la lista si accorcia sotto.
  const [filtri, setFiltri] = useStateCnt([]);
  const [pannelloAperto, setPannelloAperto] = useStateCnt(false);
  const [colonneAperte, setColonneAperte] = useStateCnt(false);
  const [creaAperta, setCreaAperta] = useStateCnt(false);
  const [tabDett, setTabDett] = useStateCnt('scheda');
  // I contatti creati a mano entrano davvero in CONTATTI: `rev` è il segnale
  // che dice alla lista di ricalcolarsi. Un pulsante «Crea» che apre un modulo
  // e poi non lascia traccia è peggio di un pulsante assente.
  const [rev, setRev] = useStateCnt(0);
  // Il registro delle restrizioni (shadowban/ban): il suo ingresso viveva
  // nella vecchia pagina Utenti app; gli utenti ora vivono qui, e qui sta
  // anche il registro.
  const [restrizioniAperte, setRestrizioniAperte] = useStateCnt(false);
  // L'ordinamento vive nelle INTESTAZIONI: si clicca la cima di una colonna e
  // la lista si ordina su quel campo; un secondo click inverte il verso.
  // A riposo è una rubrica: nomi in ordine alfabetico.
  const [sort, setSort] = useStateCnt({ campo: 'nome', verso: 'asc' });
  const [localSearch, setLocalSearch] = useStateCnt('');
  // {tipo, ref}: quale drawer aprire lo decide la tipologia — il dettaglio
  // giusto per ciascuno, non un dettaglio unico appiattito sui tre.
  const [selected, setSelected] = useStateCnt(null);

  // Le colonne visibili, NELL'ORDINE scelto. Si spuntano da «Modifica
  // colonne» e si riordinano trascinando le intestazioni; la disposizione
  // resta in localStorage, perché una tabella riordinata a mano che si
  // rimescola a ogni apertura insegna a non riordinarla più.
  const [colonne, setColonne] = useStateCnt(() => {
    try {
      const s = JSON.parse(localStorage.getItem(CNT_COLONNE_KEY));
      if (Array.isArray(s) && s.includes('nome') && s.every(id => CNT_COLONNE[id])) return s;
    } catch (e) {}
    return CNT_COLONNE_DEFAULT;
  });
  const salvaColonne = (next) => {
    setColonne(next);
    try { localStorage.setItem(CNT_COLONNE_KEY, JSON.stringify(next)); } catch (e) {}
  };
  // Il trascinamento: chi è in volo e su quale intestazione è sospeso
  // (con il lato: prima o dopo la metà della colonna bersaglio). La REF
  // raddoppia lo stato per la logica del drop: gli aggiornamenti di stato
  // possono arrivare in ritardo sull'evento, la ref mai.
  const [trascinata, setTrascinata] = useStateCnt(null);
  const [bersaglio, setBersaglio] = useStateCnt(null);
  const trascinataRef = React.useRef(null);
  // Il lampo di conferma: la colonna appena posata si accende di pesca per
  // mezzo secondo — il drop è riuscito e si vede DOVE è finita.
  const [appenaMossa, setAppenaMossa] = useStateCnt(null);
  const lampoRef = React.useRef(null);
  React.useEffect(() => () => clearTimeout(lampoRef.current), []);
  const segnaMossa = (id) => {
    setAppenaMossa(id);
    clearTimeout(lampoRef.current);
    lampoRef.current = setTimeout(() => setAppenaMossa(null), 650);
  };
  const sposta = (da, a, dopo) => {
    if (!da || da === a) return;
    const senza = colonne.filter(x => x !== da);
    let idx = senza.indexOf(a);
    if (idx < 0) idx = senza.length; else if (dopo) idx += 1;
    senza.splice(idx, 0, da);
    salvaColonne(senza);
  };

  // Apertura diretta dalla ricerca globale, dalla Dashboard, dalle notifiche:
  // le vecchie rotte (locali/camerieri/utenti) atterrano qui già tradotte.
  // La dipendenza è l'OGGETTO, non ref.id: admin-app ne costruisce uno nuovo a
  // ogni navigazione, e riaprire dallo ⌘K lo stesso contatto appena richiuso
  // col breadcrumb deve riaprire il dettaglio — su ref.id la dipendenza non
  // cambiava e il click moriva in silenzio.
  useEffectCnt(() => {
    if (openContatto) setSelected(openContatto);
  }, [openContatto]);

  // Aprendo un contatto si atterra sempre sulla scheda: restare sul diario di
  // quello di prima, con davanti il nome di un altro, è il modo più rapido per
  // leggere la storia sbagliata.
  useEffectCnt(() => { setTabDett('scheda'); }, [selected && selected.ref && selected.ref.id]);

  const effectiveSearch = (localSearch || search || '').trim();

  const filtered = useMemoCnt(() => {
    let r = hubApplica(CONTATTI, filtri, null);
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      r = r.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.cerca || '').toLowerCase().includes(q) ||
        c.ref.id.toLowerCase().includes(q)
      );
    }
    // Un confronto per campo, sempre in verso crescente: il verso lo applica
    // il segno qui sotto.
    // Stadio e piano ordinano per RANGO (lead → eliminato, gratuito →
    // business → base → pro), non per alfabeto.
    const rangoCiclo = (c) => { const v = hubLeggi(c, 'ciclo'); return v ? CNT_CICLO[v].rango : 99; };
    const rangoPiano = (c) => c.piano ? CNT_PIANI[c.piano].rango : 99;
    // Le colonne particolari hanno il loro confronto; per tutte le altre —
    // e ora sono tante, quante le proprietà — decide il TIPO della proprietà:
    // i numeri come numeri, le date come date, il resto in ordine alfabetico.
    const speciali = {
      ciclo: (a, b) => rangoCiclo(a) - rangoCiclo(b),
      piano: (a, b) => rangoPiano(a) - rangoPiano(b),
      tipo:  (a, b) => CNT_TIPI[a.tipo].label.localeCompare(CNT_TIPI[b.tipo].label),
    };
    const prop = HUB_PROP[sort.campo];
    const generico = (a, b) => {
      const va = hubLeggi(a, sort.campo), vb = hubLeggi(b, sort.campo);
      if (prop && (prop.tipo === 'numero' || prop.tipo === 'valuta')) return (Number(va) || 0) - (Number(vb) || 0);
      if (prop && prop.tipo === 'data') return new Date(va || 0) - new Date(vb || 0);
      if (prop && prop.tipo === 'bool') return (va === true ? 1 : 0) - (vb === true ? 1 : 0);
      if (prop && prop.tipo === 'multi') return (Array.isArray(va) ? va.length : 0) - (Array.isArray(vb) ? vb.length : 0);
      return String(va == null ? '' : va).localeCompare(String(vb == null ? '' : vb));
    };
    const cmp = speciali[sort.campo] || generico;
    const segno = sort.verso === 'asc' ? 1 : -1;
    return [...r].sort((a, b) => {
      // I trattini (una proprietà che quel contatto non ha) stanno in fondo IN
      // ENTRAMBI i versi — fuori dal segno: un vuoto non è «prima della A» né
      // «dopo la Z».
      const va = hubLeggi(a, sort.campo), vb = hubLeggi(b, sort.campo);
      const vuotoA = va == null || va === '' || (Array.isArray(va) && !va.length);
      const vuotoB = vb == null || vb === '' || (Array.isArray(vb) && !vb.length);
      if (vuotoA !== vuotoB) return vuotoA ? 1 : -1;
      // A parità (stessa tipologia, stesso stato) comanda il nome: l'ordine
      // deve essere lo stesso a ogni render, o le righe ballano sotto il mouse.
      return segno * cmp(a, b) || a.nome.localeCompare(b.nome);
    });
  }, [filtri, effectiveSearch, sort, rev,
    // La restrizione si legge viva dal registro: al rientro dal registro o da
    // una scheda (i due posti da cui ban e revoche si applicano) la lista va
    // rifiltrata, o «Restrizione è Bannato» terrebbe dentro l'appena graziato.
    restrizioniAperte, selected]);

  // Click sull'intestazione: nuova colonna → il suo verso naturale (i testi
  // dalla A, il ciclo dal lead in su, le date dalla più recente); stessa
  // colonna → il verso si inverte.
  const ordina = (campo) => setSort(s => s.campo === campo
    ? { campo, verso: s.verso === 'asc' ? 'desc' : 'asc' }
    : { campo, verso: campo === 'iscritto' ? 'desc' : 'asc' });

  // Nascondere la colonna su cui si sta ordinando lascerebbe la lista
  // ordinata da un fantasma: si torna all'alfabeto.
  const cambiaColonne = (next) => {
    if (!next.includes(sort.campo)) setSort({ campo: 'nome', verso: 'asc' });
    salvaColonne(next);
  };

  const griglia = colonne.map(id => CNT_COLONNE[id].w).join(' ') + ' 60px';

  // Fino a sei colonne la tabella respira nella larghezza che ha; dalla
  // settima in su non si strizza più — somma i minimi delle colonne accese
  // (più la colonnina della freccia e i bordi di padding) e sotto quella
  // soglia si fa scorrere in orizzontale, testata e righe insieme.
  const minTabella = colonne.length > 6
    ? colonne.reduce((s, id) => s + CNT_COLONNE[id].min, 0) + 60 + 36
    : undefined;

  // ── Il dettaglio: UNA PAGINA, non un popup. Cliccando un contatto la
  //    lista lascia il posto alla sua scheda a tutta finestra, con la barra
  //    per tornare (e il tasto Esc). Il velo con la finestrella centrata
  //    andava bene per sbirciare; una scheda CRM con sei tab è un posto in
  //    cui si LAVORA, e un posto di lavoro merita la pagina intera. ──
  React.useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  if (selected) {
    const chiudi = () => setSelected(null);
    const tipoDef = CNT_TIPI[selected.tipo];
    // La riga della rubrica che corrisponde a questo dettaglio: il drawer
    // conosce il locale/staff/utente, ma le proprietà di marketing e il diario
    // stanno sulla riga, che è quella arricchita.
    const riga = CONTATTI.find(x => x.ref === selected.ref) || selected.riga;
    return (
      <div style={{padding: 28, display: 'flex', flexDirection: 'column', gap: 14}}>
        <style>{CNT_CSS}</style>
        <HubStile/>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <CntTorna onClick={chiudi}/>
          <span style={{fontSize: 13.5, color: ADM.MUTED_LIGHT}}>/</span>
          <span style={{fontSize: 13.5, fontWeight: 700, color: ADM.TEXT}}>{selected.ref.nome}</span>
          <CntPillola color={tipoDef.color}>{tipoDef.label}</CntPillola>
          <div style={{flex: 1}}/>
          {/* Due viste sullo stesso contatto: CHI È (la scheda, diversa per
              tipologia) e CHE COSA È SUCCESSO (il diario, uguale per tutti). */}
          <HubSegmenti attivo={tabDett} onCambia={setTabDett} voci={[
            { id: 'scheda', label: 'Scheda' },
            { id: 'attivita', label: 'Attività', conteggio: riga ? hubAttivita(riga).length : 0 },
          ]}/>
        </div>
        {tabDett === 'scheda' ? (
          // I tre drawer sanno leggere i record di byup — un locale con i suoi
          // addebiti, le sue certificazioni, i suoi passi di onboarding. Un
          // contatto creato QUI quei campi non li ha, e passarglielo lo mandava
          // in errore: per lui (e per chiunque non venga dai mock) la scheda è
          // il listino delle proprietà, che vale per qualunque contatto.
          cntRecordCompleto(selected) ? (
            <AdmCard padding={0} style={{overflow: 'hidden'}}>
              {selected.tipo === 'locale' && <LocaleDrawer pieno locale={selected.ref} onClose={chiudi}/>}
              {selected.tipo === 'staff'  && <StaffDrawer  pieno staff={selected.ref}  onClose={chiudi}/>}
              {selected.tipo === 'utente' && <UtenteDrawer pieno utente={selected.ref} onClose={chiudi} onDiario={() => setTabDett('attivita')}/>}
            </AdmCard>
          ) : <CntSchedaProprieta riga={riga}/>
        ) : (
          // `rev` è già il segnale «i dati dei contatti sono cambiati»: la
          // nota salvata nel diario lo fa salire, così il conteggio sul tab
          // «Attività» qui sopra — che disegna questo componente — si aggiorna
          // insieme al diario e non al prossimo cambio di tab.
          <CntAttivita contatto={riga} onCambiato={() => setRev(r => r + 1)}/>
        )}
      </div>
    );
  }

  return (
    <div style={{padding: 28, display: 'flex', flexDirection: 'column', gap: 16}}>
      <style>{CNT_CSS}</style>
      <HubStile/>

      <HubTestata
        titolo="Contatti"
        sotto="Locali, utenti staff e utenti app in un'unica rubrica. Filtra per qualunque proprietà."
        azioni={
          <React.Fragment>
            {/* P-41 (D-33): il registro si apre da qui, ma il permesso è
                Moderazione — lettura per guardarlo, scrittura dentro per agire. */}
            <HubStrumento icona="shield" badge={RESTRIZIONI.filter(r => !r.revocataIl).length}
              title={hubPuo('moderazione', 'lettura') ? undefined : 'Serve almeno Lettura su Moderazione'}
              onClick={() => { if (hubPuo('moderazione', 'lettura')) setRestrizioniAperte(true); }}>Restrizioni</HubStrumento>
            <HubStrumento forte icona="plus" onClick={() => setCreaAperta(true)}>Nuovo contatto</HubStrumento>
          </React.Fragment>
        }/>

      <AdmCard padding={0}>
        {/* La barra: ricerca a sinistra, gli STRUMENTI a destra — filtri e
            colonne configurano la vista, e i comandi di configurazione
            stanno dal lato dei comandi, non in mezzo alla strada. */}
        <div style={{padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${ADM.BORDER}`, flexWrap: 'wrap'}}>
          <HubRicerca valore={localSearch} onCambia={setLocalSearch} placeholder="Cerca nome, email, locale, ID…"/>
          <div style={{flex: 1}}/>
          <span style={{fontSize: 13.7, color: ADM.MUTED}}>
            <strong style={{color: ADM.TEXT, fontWeight: 700}}>{fmtNum(filtered.length)}</strong> contatti
            {filtri.length > 0 && <span style={{color: ADM.MUTED_SOFT}}> su {fmtNum(CONTATTI.length)}</span>}
          </span>
          <HubStrumento icona="filter" acceso={filtri.length > 0} badge={filtri.length}
            onClick={() => setPannelloAperto(true)}>Filtri</HubStrumento>
          <HubStrumento icona="columns" onClick={() => setColonneAperte(true)}>Modifica colonne</HubStrumento>
        </div>

        {/* I filtri applicati, in chiaro. Un filtro acceso che si vede solo
            aprendo il pannello è un filtro che qualcuno dimenticherà acceso e
            poi giurerà che «mancano dei contatti». */}
        {filtri.length > 0 && (
          <div style={{
            padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap',
            borderBottom: `1px solid ${ADM.BORDER}`, background: ADM.PINK_BG_SOFT,
          }}>
            <span style={{fontSize: 11.5, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.PINK_DARK, marginRight: 2}}>Filtri</span>
            {filtri.map((f, i) => (
              <button key={i} onClick={() => setPannelloAperto(true)}
                title="Apri il pannello per modificarlo"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 5px 4px 10px',
                  borderRadius: 999, border: `1px solid ${ADM.PINK_SOFT}`, background: '#fff',
                  fontSize: 12.8, fontWeight: 600, color: ADM.TEXT, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {hubDescriviFiltro(f)}
                <span onClick={e => { e.stopPropagation(); setFiltri(filtri.filter((_, j) => j !== i)); }}
                  title="Togli questo filtro"
                  style={{
                    width: 17, height: 17, borderRadius: '50%', display: 'grid', placeItems: 'center',
                    background: ADM.PINK_SOFT, color: ADM.PINK_DARK, flexShrink: 0,
                  }}><BuIcons.x size={11}/></span>
              </button>
            ))}
            <button onClick={() => setFiltri([])} style={{
              background: 'transparent', border: 'none', color: ADM.PINK_DARK, fontSize: 12.8,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 6px',
            }}>Azzera tutto</button>
          </div>
        )}

        {/* Le colonne scelte, nell'ordine scelto. Ogni cima di colonna è il
            comando di ordinamento (click) E la maniglia di riordino
            (trascinamento): la si prende per il nome e la si posa dove deve
            stare — la riga sotto indica il lato su cui atterrerà. Oltre le
            sei colonne il blocco scorre in orizzontale dentro la card. */}
        <div className="cnt-scorri">
          <div style={{minWidth: minTabella}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: griglia,
            gap: 0,
            padding: '10px 18px',
            borderBottom: `1px solid ${ADM.BORDER}`,
            alignItems: 'center',
          }}>
            {colonne.map(id => {
              const mira = bersaglio && bersaglio.id === id && trascinata && trascinata !== id;
              // Il decollo e l'atterraggio della colonna: condivisi fra il
              // bottone-intestazione e la maniglia a puntini, che è un fratello
              // dello stesso div e deve avviare LO STESSO volo.
              const iniziaVolo = (e) => {
                trascinataRef.current = id;
                setTrascinata(id);
                try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
                cntFantasma(e, CNT_COLONNE[id].label);
              };
              const fineVolo = () => { trascinataRef.current = null; setTrascinata(null); setBersaglio(null); };
              return (
                <div key={id} className="cnt-testata"
                  onDragOver={e => {
                    e.preventDefault();
                    const r = e.currentTarget.getBoundingClientRect();
                    setBersaglio({ id, dopo: e.clientX > r.left + r.width / 2 });
                  }}
                  onDragLeave={() => setBersaglio(b => (b && b.id === id ? null : b))}
                  onDrop={e => {
                    e.preventDefault();
                    // Il lato si rilegge dal puntatore QUI: fidarsi dello
                    // stato scritto dal dragover significa perdere l'ultimo
                    // spostamento del mouse prima del rilascio. E chi è in
                    // volo lo dice prima il dataTransfer, poi la ref.
                    let da = '';
                    try { da = e.dataTransfer.getData('text/plain'); } catch (err) {}
                    da = da || trascinataRef.current;
                    const r = e.currentTarget.getBoundingClientRect();
                    sposta(da, id, e.clientX > r.left + r.width / 2);
                    if (da && da !== id) segnaMossa(da);
                    trascinataRef.current = null;
                    setTrascinata(null); setBersaglio(null);
                  }}
                  style={{
                    position: 'relative', minWidth: 0, alignSelf: 'stretch',
                    display: 'flex', alignItems: 'center',
                    // In volo la colonna si ATTENUA (qui e giù nelle righe):
                    // si vede che cosa stai spostando. Appena posata, un lampo
                    // pesca che sfuma: il drop è riuscito, ed è finita QUI.
                    opacity: trascinata === id ? 0.35 : 1,
                    borderRadius: 6,
                    background: appenaMossa === id ? ADM.PINK_SOFT : 'transparent',
                    transition: 'opacity 0.15s ease, background 0.55s ease',
                  }}>
                  {/* La maniglia: sei puntini che compaiono al passaggio del
                      mouse, appena fuori dal testo — dicono «mi puoi
                      prendere» senza sporcare la testata a riposo. Draggable
                      in proprio: sta FUORI dal bottone-intestazione, e una
                      maniglia col cursore «grab» da cui il trascinamento non
                      parte è una promessa rotta. */}
                  <span className="cnt-grip" aria-hidden="true" draggable
                    onDragStart={iniziaVolo} onDragEnd={fineVolo}
                    style={{
                    position: 'absolute', left: -13, top: '50%', transform: 'translateY(-50%)',
                    color: ADM.INK_SOFT, display: 'inline-flex', cursor: 'grab',
                  }}>
                    <svg width="9" height="13" viewBox="0 0 9 13" fill="currentColor">
                      <circle cx="2.2" cy="2.4" r="1.25"/><circle cx="6.8" cy="2.4" r="1.25"/>
                      <circle cx="2.2" cy="6.5" r="1.25"/><circle cx="6.8" cy="6.5" r="1.25"/>
                      <circle cx="2.2" cy="10.6" r="1.25"/><circle cx="6.8" cy="10.6" r="1.25"/>
                    </svg>
                  </span>
                  <CntIntestazione campo={id} label={CNT_COLONNE[id].label} sort={sort} onSort={ordina}
                    onDragStart={iniziaVolo} onDragEnd={fineVolo}/>
                  {/* La barra d'atterraggio: piena altezza della testata, con
                      un filo di bagliore — sul lato dove la colonna in volo
                      verrà posata. */}
                  {mira && (
                    <span aria-hidden="true" style={{
                      position: 'absolute', top: -10, bottom: -10,
                      left: bersaglio.dopo ? 'auto' : -2,
                      right: bersaglio.dopo ? -2 : 'auto',
                      width: 3, borderRadius: 99, background: ADM.PINK,
                      boxShadow: '0 0 0 1px #fff, 0 2px 10px rgba(255,31,90,0.55)',
                      animation: 'cntBarraIn 0.12s ease',
                    }}/>
                  )}
                </div>
              );
            })}
            <div></div>
          </div>
          <div>
            {filtered.length === 0 && (
              <HubVuoto icona="filter" titolo="Nessun contatto con questi filtri"
                desc="Allarga una condizione o togline una: il conteggio in cima ti dice quanti ne restano fuori."
                azione={filtri.length > 0 ? <HubStrumento icona="x" onClick={() => setFiltri([])}>Azzera i filtri</HubStrumento> : null}/>
            )}
            {filtered.map((c, i) => (
              <ContattoRow key={c.key} contatto={c} striped={i % 2 === 1}
                colonne={colonne} griglia={griglia} trascinata={trascinata}
                onClick={() => setSelected({ tipo: c.tipo, ref: c.ref })}/>
            ))}
          </div>
          </div>
        </div>
      </AdmCard>

      {/* Il pannello dei filtri: entra da destra e resta lì mentre la lista si
          accorcia sotto. Il conteggio in fondo si aggiorna mentre si compone —
          si vede subito se una condizione ha svuotato tutto. */}
      <HubPannello open={pannelloAperto} onClose={() => setPannelloAperto(false)}
        icona="filter" titolo="Filtra i contatti"
        sotto="Una condizione per riga. Si sommano tutte."
        larghezza={420}
        footer={
          <React.Fragment>
            <HubStrumento onClick={() => setFiltri([])}>Azzera</HubStrumento>
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4}}>
              <span style={{fontSize: 13.4, color: ADM.MUTED}}>
                <strong style={{color: ADM.TEXT, fontWeight: 800}}>{fmtNum(filtered.length)}</strong> contatti
              </span>
            </div>
            <HubStrumento forte icona="check" onClick={() => setPannelloAperto(false)}>Fatto</HubStrumento>
          </React.Fragment>
        }>
        <HubFiltri righe={CONTATTI} includi={filtri} onIncludi={setFiltri}/>
      </HubPannello>

      <HubColonne open={colonneAperte} onClose={() => setColonneAperte(false)}
        colonne={colonne} onSalva={cambiaColonne}/>

      <CntCrea open={creaAperta} onChiudi={() => setCreaAperta(false)}
        onCreato={(riga) => { setRev(r => r + 1); setTabDett('scheda'); setSelected({ tipo: riga.tipo, ref: riga.ref, riga }); }}/>

      {/* Il registro restrizioni: da qui si apre anche la scheda dell'utente
          ristretto, come faceva dalla vecchia pagina Utenti app. */}
      {restrizioniAperte && (
        <AdmRestrizioniModal onClose={() => setRestrizioniAperte(false)}
          onOpenUtente={(u) => setSelected({ tipo: 'utente', ref: u })}/>
      )}
    </div>
  );
}

// «Torna ai contatti»: il pulsante che chiude la pagina di dettaglio. Stesso
// registro degli strumenti della barra — bianco, si scurisce sotto il mouse.
function CntTorna({ onClick }) {
  const [sopra, setSopra] = useStateCnt(false);
  return (
    <button type="button" onClick={onClick} title="Torna alla rubrica"
      onMouseEnter={() => setSopra(true)} onMouseLeave={() => setSopra(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '7px 12px 7px 8px', borderRadius: 8,
        border: `1px solid ${sopra ? ADM.INK_SOFT : ADM.BORDER}`,
        background: sopra ? '#F5F6F8' : '#fff',
        color: ADM.TEXT, fontSize: 13.5, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: sopra ? '0 2px 8px rgba(15,17,21,0.10)' : '0 1px 2px rgba(15,17,21,0.04)',
        transition: 'background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease',
      }}>
      <BuIcons.chevronLeft size={16} color={ADM.MUTED}/>
      Contatti
    </button>
  );
}

// I due componenti che stavano qui — «Aggiungi filtro» a spunte e «Modifica
// colonne» a tendina — sono passati a hub-ui.jsx come HubFiltri e HubColonne,
// e per strada hanno cambiato mestiere: le spunte sapevano dire una cosa sola
// («è una di queste voci»), la tendina sapeva accendere e spegnere ma non
// riordinare. Ora sono un pannello laterale con proprietà/operatore/valore e
// una modale a due liste — e li montano anche gli Elenchi e il pubblico delle
// campagne, che prima non avevano niente di simile.

// La cima della colonna è un pulsante: si clicca e la lista si ordina su quel
// campo, si riclicca e si inverte. L'icona c'è SEMPRE — è lei a dire che la
// cima si può cliccare: sulle colonne a riposo è il doppio verso (⇅) in
// grigio tenue, sull'attiva diventa la freccia corallo che punta nel verso
// della lista. Stesso ingombro nei due stati: al cambio niente si sposta.
function CntIntestazione({ campo, label, sort, onSort, onDragStart, onDragEnd }) {
  const attiva = sort.campo === campo;
  // L'icona scorre IN LINEA col testo e sta INCOLLATA all'ultima parola
  // (nowrap sui due insieme): su una colonna stretta «Tipologia contatto» va
  // a capo tra le parole, mai tra parola e icona — un glifo a mezz'aria
  // sembrava dell'intestazione dopo, o di nessuna.
  const icona = {
    display: 'inline-flex', verticalAlign: 'middle',
    marginLeft: 4, marginTop: -2,
  };
  const parole = label.split(' ');
  const ultima = parole.pop();
  return (
    <button type="button" onClick={() => onSort(campo)}
      // La stessa cima è anche la MANIGLIA: si trascina per riordinare le
      // colonne. Il click d'ordinamento non si confonde col gesto — dopo un
      // trascinamento vero il browser non emette il click.
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title={'Ordina per ' + label.toLowerCase() + ' · trascina per spostare la colonna'}
      style={{
        justifySelf: 'start', minWidth: 0,
        background: 'transparent', border: 'none', padding: 0,
        fontSize: 12.6, fontWeight: 700,
        color: attiva ? ADM.PINK_DARK : ADM.MUTED,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      }}>
      {parole.length > 0 ? parole.join(' ') + ' ' : ''}
      <span style={{whiteSpace: 'nowrap'}}>
      {ultima}
      {attiva ? (
        <span style={Object.assign({}, icona, {
          color: ADM.PINK,
          transform: sort.verso === 'asc' ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.15s ease',
        })}><BuIcons.chevronDown size={14}/></span>
      ) : (
        <span style={Object.assign({}, icona, {color: ADM.MUTED_LIGHT})}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5.4 7 2.4l3 3"/><path d="M4 8.6l3 3 3-3"/>
          </svg>
        </span>
      )}
      </span>
    </button>
  );
}

// La stessa pillola per tipologia e stato: UN corpo solo (13/700, raggio 5).
// Prima lo stato usava AdmBadge, che qui accanto risultava più grande e più
// tondo della pillola gemella: due colonne sorelle con due vesti.
function CntPillola({ color, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 5,
      background: ADM[color + '_SOFT'], color: ADM[color],
      fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// La cella di una colonna, scelta per id: le righe seguono l'ordine e la
// selezione decisi in testata, non un tracciato fisso.
// Un corpo solo per tutte le celle di testo (13.7/500, il font della pagina).
function CntCella({ id, c }) {
  const device = c.tipo === 'staff' && c.ref.ruolo === 'dispositivo';
  const testo = { fontSize: 13.7, fontWeight: 500, color: ADM.TEXT };
  const tratto = <span style={{fontSize: 13.7, color: ADM.MUTED_LIGHT}}>—</span>;

  if (id === 'nome') return (
    <div style={{display: 'flex', alignItems: 'center', gap: 11, minWidth: 0}}>
      {device
        ? <div style={{width: 34, height: 34, borderRadius: 8, background: ADM.NEUTRAL_SOFT, color: ADM.NEUTRAL, display: 'grid', placeItems: 'center', flexShrink: 0}}><BuIcons.monitor size={21}/></div>
        : <AdmAvatar name={c.nome} size={36} bg={`hsl(${(c.ref.id.charCodeAt(1) + c.ref.id.charCodeAt(c.ref.id.length - 1)) * 5 % 360}, 42%, 55%)`}/>}
      <div style={{minWidth: 0}}>
        <div style={{fontSize: 14.4, fontWeight: 600, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: device ? 'ui-monospace,monospace' : 'inherit'}}>{c.nome}</div>
      </div>
    </div>
  );
  if (id === 'email') return (
    <div style={{minWidth: 0}}>
      {c.email
        ? <span style={Object.assign({}, testo, {whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'})}>{c.email}</span>
        : tratto}
    </div>
  );
  if (id === 'tipo') {
    const tipoDef = CNT_TIPI[c.tipo];
    return <div><CntPillola color={tipoDef.color}>{tipoDef.label}</CntPillola></div>;
  }
  if (id === 'ciclo') {
    // La tappa del rapporto, nella stessa pillola della tipologia. Chi non
    // ha uno stadio con byup ha un trattino, non un gradino inventato.
    const stadio = hubLeggi(c, 'ciclo');
    const cicloDef = stadio ? CNT_CICLO[stadio] : null;
    return <div>{cicloDef ? <CntPillola color={cicloDef.color}>{cicloDef.label}</CntPillola> : tratto}</div>;
  }
  if (id === 'piano') {
    const pianoDef = c.piano ? CNT_PIANI[c.piano] : null;
    return <div>{pianoDef ? <CntPillola color={pianoDef.color}>{pianoDef.label}</CntPillola> : tratto}</div>;
  }
  if (id === 'restrizione') {
    // Rosso per il ban, ambra per lo shadowban: la stessa coppia di colori
    // del registro restrizioni. Letta viva via hubLeggi, mai dalla riga.
    const restr = hubLeggi(c, 'restrizione');
    if (!restr) return <div>{tratto}</div>;
    return <div><CntPillola color={restr === 'ban' ? 'DANGER' : 'WARN'}>{restr === 'ban' ? 'Bannato' : 'Shadowban'}</CntPillola></div>;
  }
  // Tutte le altre colonne escono dal catalogo delle proprietà: il TIPO dice
  // come si stampano. Una proprietà nuova aggiunta in hub-data.jsx compare in
  // lista vestita bene, senza toccare questo file.
  const prop = HUB_PROP[id];
  const v = hubLeggi(c, id);
  if (v == null || v === '' || (Array.isArray(v) && !v.length)) return <div>{tratto}</div>;
  if (!prop) return <div style={testo}>{String(v)}</div>;

  switch (prop.tipo) {
    case 'data':
      return <div style={testo}>{fmtDate(v)}</div>;
    case 'valuta':
      return <div style={Object.assign({}, testo, {fontVariantNumeric: 'tabular-nums'})}>{fmtEur(v)}</div>;
    case 'numero':
      return <div style={Object.assign({}, testo, {fontVariantNumeric: 'tabular-nums'})}>{fmtNum(v)}</div>;
    case 'bool':
      return <div><CntPillola color={v ? 'OK' : 'PLAN_FREE'}>{v ? 'Sì' : 'No'}</CntPillola></div>;
    case 'multi': {
      // Due voci per esteso, il resto in un «+n»: la colonna deve restare
      // scorrevole anche su chi ha spuntato tutto.
      const l = v.map(x => hubEtichettaOpzione(prop, x));
      return (
        <div style={{display: 'flex', alignItems: 'center', gap: 4, minWidth: 0}}>
          {l.slice(0, 2).map(x => <CntPillola key={x} color="TEAL">{x}</CntPillola>)}
          {l.length > 2 && <span style={{fontSize: 12.5, fontWeight: 700, color: ADM.MUTED_SOFT}}>+{l.length - 2}</span>}
        </div>
      );
    }
    case 'elenco':
      return <div style={testo}>{hubEtichettaOpzione(prop, v)}</div>;
    default:
      return (
        <div style={{minWidth: 0}}>
          <span style={Object.assign({}, testo, {whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'})}>{String(v)}</span>
        </div>
      );
  }
}

function ContattoRow({ contatto: c, colonne, griglia, trascinata, onClick, striped }) {
  const [hover, setHover] = useStateCnt(false);
  return (
    <div onClick={onClick} className="adm-row-open"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: griglia,
        gap: 0,
        padding: '12px 18px',
        borderBottom: `1px solid ${ADM.BORDER_SOFT}`,
        background: hover ? ADM.ROW_HOVER : (striped ? ADM.ROW_STRIPE : 'transparent'),
        cursor: 'pointer',
        alignItems: 'center',
        transition: 'background 0.08s',
      }}>
      {/* Mentre una colonna è in volo si attenua per TUTTA la sua altezza,
          non solo in testata: si vede l'intera cosa che si sta spostando. */}
      {colonne.map(id => (
        <div key={id} style={{minWidth: 0, opacity: trascinata === id ? 0.3 : 1, transition: 'opacity 0.15s ease'}}>
          <CntCella id={id} c={c}/>
        </div>
      ))}
      <div style={{textAlign: 'right', color: ADM.MUTED}}>
        <span className="adm-row-chev"><BuIcons.chevronRight size={20}/></span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ATTIVITÀ — il diario del contatto
// ═══════════════════════════════════════════════════════════════════════════
//
// Ordine di tempo, dal più recente. Ogni riga dice CHE COSA è successo e —
// quando c'è — su quale link ha cliccato, chi l'ha chiamato, quale workflow
// gliel'ha mandata. I filtri in cima non nascondono: restringono a un canale,
// perché la domanda vera è quasi sempre «gli abbiamo già scritto?» oppure
// «da dove è arrivato?», e sono due letture diverse dello stesso elenco.

// `fmtRelative` guarda solo all'indietro: su una data futura risponde «ora»,
// che su un intervento fissato fra otto giorni è semplicemente falso.
function cntQuando(d) {
  const ms = new Date(d).getTime() - Date.now();
  if (ms <= 60000) return fmtRelative(d);
  const g = Math.round(ms / 86400000);
  if (g >= 1) return 'fra ' + g + (g === 1 ? ' giorno' : ' giorni');
  return 'fra ' + Math.max(1, Math.round(ms / 3600000)) + ' ore';
}

function CntAttivita({ contatto, onCambiato }) {
  const [gruppo, setGruppo] = useStateCnt('tutto');
  const [rev, setRev] = useStateCnt(0);
  const [nota, setNota] = useStateCnt('');
  const [scrivo, setScrivo] = useStateCnt(false);
  const [aperto, setAperto] = useStateCnt(null);

  if (!contatto) return <HubVuoto icona="clock" titolo="Nessun diario per questo contatto"
    desc="Le attività si registrano sui contatti della rubrica."/>;

  const S = useMemoCnt(() => hubSintesi(contatto), [contatto.key, rev]);
  const tutte = S.eventi;
  const eventi = gruppo === 'tutto' ? tutte
    : tutte.filter(e => (HUB_ATT_TIPI[e.tipo] || {}).gruppo === gruppo);

  // Gli episodi, non le righe. È tutta la differenza fra un diario che si
  // legge e un registro che si scorre.
  const episodi = useMemoCnt(() => hubEpisodi(eventi), [eventi]);

  const perGiorno = [];
  episodi.forEach(ep => {
    const g = new Date(ep.ultimo).toDateString();
    const ultimo = perGiorno[perGiorno.length - 1];
    if (ultimo && ultimo.g === g) ultimo.righe.push(ep);
    else perGiorno.push({ g, data: ep.ultimo, righe: [ep] });
  });

  const salvaNota = () => {
    if (!nota.trim()) return;
    hubAggiungiAttivita(contatto, { tipo: 'nota', titolo: 'Nota di Marco Rinaldi', dettaglio: nota.trim() });
    setNota(''); setScrivo(false); setRev(r => r + 1);
    // `rev` qui dentro rinfresca il diario; il conteggio sul tab «Attività»
    // lo disegna il PADRE, e senza questo segnale restava fermo al valore
    // vecchio con la nota già in cima alla lista.
    if (onCambiato) onCambiato();
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
      <CntQuadro S={S} contatto={contatto}/>

      <AdmCard padding={0}>
        {/* Nove gruppi non stanno in un segmentato: quello non va a capo e
            l'ultimo canale finisce fuori dalla card. Chip che si dispongono
            su due righe — costano una riga di altezza e si vedono tutti. */}
        <div style={{padding: '13px 18px', borderBottom: `1px solid ${ADM.BORDER}`, display: 'flex', alignItems: 'flex-start', gap: 10}}>
          <div style={{flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: 5}}>
            {HUB_ATT_GRUPPI.map(g => {
              const n = g.id === 'tutto' ? tutte.length : tutte.filter(e => (HUB_ATT_TIPI[e.tipo] || {}).gruppo === g.id).length;
              if (!n) return null;
              const on = gruppo === g.id;
              return (
                <button key={g.id} onClick={() => setGruppo(g.id)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999,
                  border: `1px solid ${on ? ADM.PINK : ADM.BORDER}`, background: on ? ADM.PINK_BG_SOFT : '#fff',
                  color: on ? ADM.PINK_DARK : ADM.TEXT, cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 12.8, fontWeight: on ? 700 : 600, whiteSpace: 'nowrap',
                }}>
                  {g.label}
                  <span style={{
                    fontSize: 11.2, fontWeight: 800, padding: '0 6px', borderRadius: 99,
                    background: on ? ADM.PINK_SOFT : ADM.NEUTRAL_SOFT, color: on ? ADM.PINK_DARK : ADM.MUTED_SOFT,
                  }}>{n}</span>
                </button>
              );
            })}
          </div>
          <HubStrumento icona="pencil" acceso={scrivo} onClick={() => setScrivo(v => !v)}>Aggiungi una nota</HubStrumento>
        </div>

        {scrivo && (
          <div style={{padding: 16, borderBottom: `1px solid ${ADM.BORDER}`, background: ADM.PANEL_SOFT}}>
            <HubArea valore={nota} onCambia={setNota} righe={3}
              placeholder="Che cosa è successo? es. «Chiamato il titolare, richiamare lunedì dopo le 15»"/>
            <div style={{display: 'flex', gap: 8, marginTop: 10}}>
              <HubStrumento forte icona="check" onClick={salvaNota}>Salva la nota</HubStrumento>
              <HubStrumento onClick={() => { setScrivo(false); setNota(''); }}>Annulla</HubStrumento>
            </div>
          </div>
        )}

        {episodi.length === 0 && <HubVuoto icona="clock" titolo="Niente su questo canale"
          desc="Prova «Tutto»: il contatto potrebbe avere attività di altro tipo."/>}

        <div style={{padding: '2px 0 12px'}}>
          {perGiorno.map(g => (
            <div key={g.g}>
              <div style={{
                position: 'sticky', top: 0, zIndex: 2, background: '#fff',
                padding: '11px 18px 7px', fontSize: 11.4, fontWeight: 800,
                letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT,
                borderBottom: `1px solid ${ADM.BORDER_SOFT}`,
              }}>{fmtDate(g.data)} · {cntQuando(g.data)}</div>
              {g.righe.map(ep => (
                <CntEpisodio key={ep.id} ep={ep} aperto={aperto === ep.id}
                  onApri={() => setAperto(a => a === ep.id ? null : ep.id)}/>
              ))}
            </div>
          ))}
        </div>
      </AdmCard>
    </div>
  );
}

// ─── Il quadro: le sei domande che si fanno prima di leggere ────────────────
//
// Prima qui c'erano quattro numeri sulle email. Erano veri e non rispondevano
// a nessuna delle domande che uno si fa davvero aprendo la scheda di un
// cliente: quando l'abbiamo sentito, ha qualcosa in sospeso, che assistenza
// ha avuto, che cosa ci ha chiesto.

function CntQuadro({ S, contatto }) {
  const t = S.temperatura;
  const cella = (icona, colore, etichetta, valore, sotto, allarme) => {
    const Ic = BuIcons[icona];
    return (
      <div style={{
        padding: 13, borderRadius: 12, background: allarme ? ADM.DANGER_SOFT : '#fff',
        border: `1px solid ${allarme ? '#F3C9C9' : ADM.BORDER}`, minWidth: 0,
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7}}>
          <span style={{
            width: 22, height: 22, borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0,
            background: ADM[colore + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[colore] || ADM.MUTED,
          }}><Ic size={12}/></span>
          <span style={{fontSize: 10.6, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT}}>{etichetta}</span>
        </div>
        <div style={{fontSize: 15.4, fontWeight: 700, color: allarme ? '#8B1A1A' : ADM.TEXT, lineHeight: 1.3, letterSpacing: '-0.01em'}}>{valore}</div>
        {sotto && <div style={{fontSize: 12.2, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45}}>{sotto}</div>}
      </div>
    );
  };

  const uc = S.ultimoContatto;
  const pr = S.prossima;
  const ua = S.ultimaAssistenza;
  const promo = S.promozioni[0];

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {/* La riga che riassume tutto in una frase, col semaforo. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 12,
        background: ADM[t.color + '_SOFT'] || ADM.NEUTRAL_SOFT,
        border: `1px solid ${ADM[t.color] ? ADM[t.color] + '33' : ADM.BORDER}`,
      }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0,
          background: '#fff', color: ADM[t.color] || ADM.MUTED,
        }}><BuIcons.gauge size={17}/></span>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 15, fontWeight: 800, color: ADM[t.color + '_DARK'] || ADM[t.color] || ADM.TEXT, letterSpacing: '-0.015em'}}>{t.label}</div>
          <div style={{fontSize: 12.8, color: ADM.MUTED, marginTop: 1}}>{t.perche}</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0}}>
          {[['Email ricevute', S.inviate], ['Aperte', S.aperte], ['Click', S.click],
            ['Assistenze', S.assistenze.length], ['Ticket', S.ticketTotali]].map(([l, v]) => (
            <div key={l} style={{textAlign: 'right'}}>
              <div style={{fontSize: 17, fontWeight: 800, color: ADM.TEXT, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{v}</div>
              <div style={{fontSize: 10.6, color: ADM.MUTED_SOFT, fontWeight: 700, marginTop: 3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 11}}>
        {cella('headsetFill', 'WARN', 'Ultimo contatto',
          uc ? fmtRelative(uc.quando) : 'Mai',
          uc ? (HUB_ATT_TIPI[uc.tipo] || {}).label + ' · ' + uc.titolo : 'Nessuno del team l\'ha ancora sentito')}

        {cella('calendar', pr ? 'INFO' : 'PLAN_FREE', 'Prossima cosa in programma',
          pr ? cntQuando(pr.quando) : 'Niente in agenda',
          pr ? fmtDate(pr.quando) + ' · ' + pr.titolo : 'Se serve, fissa un intervento o una chiamata')}

        {cella('ticket', S.ticketAperti.length ? 'DANGER' : 'OK', 'Ticket aperti',
          S.ticketAperti.length || 'Nessuno',
          S.ticketAperti.length
            ? S.ticketAperti.map(t2 => t2.titolo).join(', ') + ' — ' + (S.ticketAperti[0].dettaglio || '')
            : `${S.ticketRisolti} risolti su ${S.ticketTotali} aperti in tutto`,
          S.ticketAperti.length >= 2)}

        {cella('lifebuoy', 'TEAL', 'Assistenza ricevuta',
          S.assistenze.length ? S.assistenze.length + (S.assistenze.length === 1 ? ' intervento' : ' interventi') : 'Nessuna',
          ua ? 'L\'ultima ' + fmtRelative(ua.quando) + ' per ' + ((ua.meta && ua.meta.Motivo) || ua.titolo.replace(/^Intervento · /, ''))
             : 'Non ha mai avuto bisogno di un intervento')}
      </div>

      {promo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 11,
          background: ADM.HUB_MAGENTA_SOFT, border: `1px solid #F6C7E6`,
        }}>
          <BuIcons.megaphoneFill size={15} color={ADM.HUB_MAGENTA_DARK}/>
          <span style={{flex: 1, minWidth: 0, fontSize: 13.2, color: ADM.TEXT, lineHeight: 1.45}}>
            <strong style={{fontWeight: 700}}>{promo.titolo}</strong> · {fmtRelative(promo.quando)}
          </span>
          {promo.meta && promo.meta.Stato && (
            <HubPillola size="sm" forte color={promo.meta.Stato === 'Approvata' ? 'OK' : promo.meta.Stato === 'Rifiutata' ? 'DANGER' : 'WARN'}>
              {promo.meta.Stato}
            </HubPillola>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Un episodio ────────────────────────────────────────────────────────────
//
// Una scheda per cosa successa, non per riga di log. «Email inviata», «Email
// aperta», «Click nell'email» erano tre righe a giorni di distanza: adesso
// sono una scheda che dice com'è andata, con i passaggi in una riga sola. Il
// dettaglio completo c'è ancora — si apre cliccando, e serve raramente.

function CntEsito({ ep }) {
  const t = ep.testa.tipo;
  const ha = (x) => ep.seguiti.some(s => s.tipo === x);
  if (t === 'mailInviata') {
    if (ha('mailRimbalzo')) return { l: 'Respinta', c: 'DANGER' };
    if (ha('mailClick'))    return { l: 'Ha cliccato', c: 'OK' };
    if (ha('mailAperta'))   return { l: 'Aperta', c: 'OK' };
    return { l: 'Non aperta', c: 'PLAN_FREE' };
  }
  if (t === 'smsInviato')  return ha('smsClick') ? { l: 'Ha cliccato', c: 'OK' } : { l: 'Consegnato', c: 'PLAN_FREE' };
  if (t === 'pushInviata') return ha('pushAperta') ? { l: 'Aperta', c: 'OK' } : { l: 'Non aperta', c: 'PLAN_FREE' };
  if (t === 'ticket')      return ha('ticketRisolto') ? { l: 'Risolto', c: 'OK' } : { l: 'Ancora aperto', c: 'DANGER' };
  if (t === 'wfEntrato')   return ha('wfUscito') ? { l: 'Completato', c: 'OK' } : { l: 'In corso', c: 'INFO' };
  if (t === 'assistenzaPian') return ha('assistenzaFatta') ? { l: 'Svolta', c: 'OK' } : { l: 'In programma', c: 'INFO' };
  return null;
}

function CntEpisodio({ ep, aperto, onApri }) {
  const e = ep.testa;
  const d = HUB_ATT_TIPI[e.tipo] || { label: e.tipo, icona: 'info', color: 'PLAN_FREE' };
  const Ic = BuIcons[d.icona];
  const esito = CntEsito({ ep });
  const futuro = e.futuro;
  const link = [e, ...ep.seguiti].map(x => x.meta && x.meta.Link).filter(Boolean)[0];

  return (
    <div style={{
      display: 'flex', gap: 13, padding: '11px 18px', position: 'relative',
      background: futuro ? '#F7FAFF' : 'transparent',
    }}>
      <div style={{position: 'relative', flexShrink: 0, width: 30}}>
        <span aria-hidden="true" style={{
          position: 'absolute', left: 15, top: -11, bottom: -11, width: 1.5,
          background: ADM.BORDER, transform: 'translateX(-50%)',
        }}/>
        <span style={{
          position: 'relative', width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center',
          background: ADM[d.color + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[d.color] || ADM.MUTED,
          boxShadow: '0 0 0 3px #fff',
          border: futuro ? `1.5px dashed ${ADM.INFO}` : 'none',
        }}><Ic size={15}/></span>
      </div>

      <div style={{flex: 1, minWidth: 0, paddingTop: 1}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap'}}>
          <span style={{fontSize: 11.2, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: ADM[d.color] || ADM.MUTED}}>{d.label}</span>
          <span style={{fontSize: 14, fontWeight: 600, color: ADM.TEXT}}>{e.titolo}</span>
          {futuro && <HubPillola size="sm" color="INFO" forte>da fare</HubPillola>}
          {esito && <HubPillola size="sm" color={esito.c}>{esito.l}</HubPillola>}
        </div>

        {e.dettaglio && <div style={{fontSize: 13.3, color: ADM.MUTED, marginTop: 3, lineHeight: 1.5}}>{e.dettaglio}</div>}

        {/* La catena dei seguiti: una riga sola con quello che è successo dopo.
            È il pezzo che rende leggibile il diario — «inviata, aperta 3 volte,
            cliccato Vedi i piani» invece di tre righe da cercare fra le altre. */}
        {ep.seguiti.length > 0 && (
          <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 7}}>
            {ep.seguiti.map((s, i) => {
              const sd = HUB_ATT_TIPI[s.tipo] || {};
              const SIc = BuIcons[sd.icona] || BuIcons.check;
              return (
                <React.Fragment key={s.id}>
                  {i > 0 && <BuIcons.chevronRight size={11} color={ADM.MUTED_LIGHT}/>}
                  <span title={s.dettaglio || ''} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999,
                    background: ADM[sd.color + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[sd.color + '_DARK'] || ADM[sd.color] || ADM.MUTED,
                    fontSize: 11.8, fontWeight: 700, maxWidth: 300,
                  }}>
                    <SIc size={11}/>
                    <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {sd.label} · {cntQuando(s.quando)}
                    </span>
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {link && (
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 7, padding: '3px 9px',
            borderRadius: 6, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}`, maxWidth: '100%'}}>
            <BuIcons.link size={11} color={ADM.MUTED_SOFT}/>
            <span style={{fontSize: 12, color: ADM.TEXT, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{link}</span>
          </div>
        )}

        {(e.meta || ep.seguiti.some(s => s.meta || s.dettaglio)) && (
          <button onClick={onApri} style={{
            marginTop: 7, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: ADM.MUTED_SOFT,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            {aperto ? 'Nascondi il dettaglio' : 'Vedi il dettaglio'}
            {aperto ? <BuIcons.chevronUp size={11}/> : <BuIcons.chevronDown size={11}/>}
          </button>
        )}

        {aperto && (
          <div style={{marginTop: 8, padding: 11, borderRadius: 10, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}`}}>
            {[e, ...ep.seguiti].map(x => (
              <div key={x.id} style={{marginBottom: 8}}>
                <div style={{fontSize: 11.6, fontWeight: 800, color: ADM.MUTED_SOFT, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  {(HUB_ATT_TIPI[x.tipo] || {}).label} · {fmtDate(x.quando)} {new Date(x.quando).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}
                </div>
                {x.dettaglio && <div style={{fontSize: 12.8, color: ADM.TEXT, marginTop: 2, lineHeight: 1.5}}>{x.dettaglio}</div>}
                {x.meta && (
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 5}}>
                    {Object.keys(x.meta).map(k => (
                      <span key={k} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 6,
                        background: '#fff', border: `1px solid ${ADM.BORDER}`, fontSize: 11.8, maxWidth: '100%',
                      }}>
                        <span style={{color: ADM.MUTED_SOFT, fontWeight: 700}}>{k}</span>
                        <span style={{color: ADM.TEXT, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{x.meta[k]}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <span style={{fontSize: 12.4, color: ADM.MUTED_SOFT, flexShrink: 0, paddingTop: 3, fontVariantNumeric: 'tabular-nums'}}>
        {new Date(ep.ultimo).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CREA CONTATTO
// ═══════════════════════════════════════════════════════════════════════════
//
// Il contatto creato entra davvero in rubrica: compare in lista, risponde ai
// filtri, finisce negli elenchi attivi di cui soddisfa i criteri e si apre con
// il suo diario. Nel prototipo vive finché non si ricarica la pagina — ma
// finché c'è, si comporta come tutti gli altri.

let cntProgressivo = 0;

function CntCrea({ open, onChiudi, onCreato }) {
  const vuoto = { tipo: 'locale', nome: '', email: '', telefono: '', citta: '', regione: '',
    piano: '', proprietario: 'Marco Rinaldi', referral: '', canale: 'organico',
    consensoMail: true, consensoSms: false };
  const [f, setF] = useStateCnt(vuoto);
  const set = (k, v) => setF(x => Object.assign({}, x, { [k]: v }));
  // Il cambio di tipologia porta via il piano: il campo sparisce dalla UI ma
  // il valore restava nel form, e uno «Utente Staff» nasceva con la pillola
  // «Pro» dell'app. Per l'utente app il default è Base — il suo select non ha
  // una voce vuota. Lo stadio non si sceglie: un contatto nuovo senza un
  // locale dietro è un lead per definizione (hubStadio).
  const setTipo = (k) => setF(x => Object.assign({}, x, { tipo: k, piano: k === 'utente' ? 'base' : '' }));

  useEffectCnt(() => { if (open) setF(vuoto); }, [open]);

  const nomeOk = f.nome.trim().length > 1;
  const mailOk = !f.email || /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(f.email.trim());
  const pronto = nomeOk && mailOk;

  const citta = useMemoCnt(() => [...new Set(CONTATTI.map(c => c.citta))].filter(Boolean).sort(), [open]);

  const crea = () => {
    if (!pronto) return;
    const id = 'NEW' + String(++cntProgressivo).padStart(3, '0');
    const loc = LOCALI.find(l => l.citta === f.citta);
    const riga = hubArricchisci({
      key: 'new-' + id, tipo: f.tipo,
      ref: { id, nome: f.nome.trim() },
      nome: f.nome.trim(),
      cerca: f.citta + ' ' + (f.referral || ''),
      citta: f.citta || '—', regione: f.regione || (loc ? loc.regione : '—'),
      email: f.email.trim() || null,
      piano: f.piano || null,
      iscritto: new Date(),
    });
    // L'arricchimento deriva le proprietà di marketing dall'id; quelle che ha
    // scritto chi crea il contatto vincono sulle derivate.
    Object.assign(riga, {
      telefono: f.telefono.trim() || riga.telefono,
      referral: f.referral.trim() || null,
      canale: f.canale,
      proprietario: f.proprietario,
      consensoMail: f.consensoMail,
      consensoSms: f.consensoSms,
      primoForm: null, campagnaId: null,
      ultimaAttivita: new Date(), ordini: 0, sessioni: 0,
      valore: f.tipo === 'staff' ? null : 0,
    });
    CONTATTI.unshift(riga);
    onCreato(riga);
    onChiudi();
  };

  return (
    <HubModale open={open} onClose={onChiudi} larghezza={640}
      titolo="Nuovo contatto"
      sotto="Il minimo per esistere è il nome. Tutto il resto si può aggiungere dopo, o lasciare che lo scrivano i form e i workflow."
      footer={
        <React.Fragment>
          <span style={{fontSize: 12.8, color: ADM.MUTED}}>
            {pronto ? 'Entra subito in rubrica' : !nomeOk ? 'Serve almeno il nome' : 'L\'email non sembra valida'}
          </span>
          <div style={{flex: 1}}/>
          <HubStrumento onClick={onChiudi}>Annulla</HubStrumento>
          <HubStrumento forte icona="check" onClick={crea}>Crea contatto</HubStrumento>
        </React.Fragment>
      }>
      <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
        <HubCampo label="Tipologia">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8}}>
            {Object.keys(CNT_TIPI).map(k => {
              const on = f.tipo === k;
              return (
                <button key={k} onClick={() => setTipo(k)} style={{
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${on ? ADM.PINK : ADM.BORDER}`,
                  background: on ? ADM.PINK_BG_SOFT : '#fff',
                  color: on ? ADM.PINK_DARK : ADM.TEXT, fontSize: 13.6, fontWeight: 700,
                }}>{CNT_TIPI[k].label}</button>
              );
            })}
          </div>
        </HubCampo>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12}}>
          <HubCampo label={f.tipo === 'locale' ? 'Nome del locale' : 'Nome e cognome'}>
            <HubInput valore={f.nome} onCambia={v => set('nome', v)}
              placeholder={f.tipo === 'locale' ? 'es. Trattoria da Nino' : 'es. Giulia Bianchi'}/>
          </HubCampo>
          <HubCampo label="Email" nota={f.email && !mailOk ? 'Manca la chiocciola o il dominio' : undefined}>
            <HubInput valore={f.email} onCambia={v => set('email', v)} placeholder="nome@dominio.it"/>
          </HubCampo>
          <HubCampo label="Telefono">
            <HubInput valore={f.telefono} onCambia={v => set('telefono', v)} placeholder="+39 …"/>
          </HubCampo>
          <HubCampo label="Città">
            <AdmSelect block value={f.citta} onChange={v => set('citta', v)}
              options={[{ value: '', label: 'Non indicata' }, ...citta.map(c => ({ value: c, label: c }))]}/>
          </HubCampo>
          {f.tipo === 'locale' && (
            <React.Fragment>
              <HubCampo label="Piano">
                <AdmSelect block value={f.piano} onChange={v => set('piano', v)}
                  options={[{ value: '', label: 'Nessuno ancora' },
                    ...['free', 'starter', 'plus', 'business'].map(k => ({ value: k, label: CNT_PIANI[k].label }))]}/>
              </HubCampo>
            </React.Fragment>
          )}
          {f.tipo === 'utente' && (
            <HubCampo label="Piano dell'app">
              <AdmSelect block value={f.piano} onChange={v => set('piano', v)}
                options={[{ value: 'base', label: 'Base' }, { value: 'pro', label: 'Pro' }]}/>
            </HubCampo>
          )}
          <HubCampo label="Proprietario del contatto">
            <AdmSelect block value={f.proprietario} onChange={v => set('proprietario', v)}
              options={(HUB_PROP.proprietario.opzioni || []).map(o => ({ value: o.value, label: o.label }))}/>
          </HubCampo>
          <HubCampo label="Canale di acquisizione">
            <AdmSelect block value={f.canale} onChange={v => set('canale', v)}
              options={(HUB_PROP.canale.opzioni || []).map(o => ({ value: o.value, label: o.label }))}/>
          </HubCampo>
        </div>

        <HubCampo label="Referral" nota="Da chi o da dove arriva. È la proprietà che i form riempiono da soli — qui la scrivi a mano.">
          <HubInput valore={f.referral} onCambia={v => set('referral', v)} placeholder="es. Passaparola cliente"/>
        </HubCampo>

        <div style={{display: 'flex', gap: 22, padding: '12px 14px', borderRadius: 11, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}`}}>
          {[['consensoMail', 'Consenso email'], ['consensoSms', 'Consenso SMS']].map(([k, l]) => (
            <label key={k} style={{display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer'}}>
              <AdmSwitch size="sm" checked={f[k]} onChange={v => set(k, v)}/>
              <span style={{fontSize: 13.4, fontWeight: 600, color: ADM.TEXT}}>{l}</span>
            </label>
          ))}
          <span style={{fontSize: 12.4, color: ADM.MUTED, flex: 1, lineHeight: 1.45, minWidth: 180}}>
            Senza consenso il contatto resta in rubrica e resta contattabile dal supporto: quello che non riceve sono le campagne.
          </span>
        </div>
      </div>
    </HubModale>
  );
}

// Un contatto «completo» è uno dei record che byup già conosce: solo per
// quelli i drawer hanno i dati che si aspettano.
function cntRecordCompleto(sel) {
  if (!sel || !sel.ref) return false;
  if (sel.tipo === 'locale') return LOCALI.indexOf(sel.ref) >= 0;
  if (sel.tipo === 'staff')  return STAFF.indexOf(sel.ref) >= 0;
  if (sel.tipo === 'utente') return (window.UTENTI || []).indexOf(sel.ref) >= 0;
  return false;
}

// La scheda fatta di PROPRIETÀ: gli stessi campi su cui si filtra, raggruppati
// come nel catalogo. Vale per qualunque contatto, anche per uno appena creato
// che non ha ancora una storia dentro byup.
function CntSchedaProprieta({ riga }) {
  // «Scrivigli» apre il client di posta sull'indirizzo del contatto (mailto,
  // senza cambiare pagina) e lo dice per qualche secondo sul bottone stesso:
  // il client si apre in un'altra finestra, e senza la conferma qui dentro il
  // click sembrerebbe caduto nel vuoto. Hook PRIMA dell'uscita anticipata.
  const [scritto, setScritto] = useStateCnt(false);
  const scrittoRef = React.useRef(null);
  useEffectCnt(() => () => clearTimeout(scrittoRef.current), []);
  if (!riga) return null;
  const scrivi = () => {
    window.location.href = 'mailto:' + riga.email;
    setScritto(true);
    clearTimeout(scrittoRef.current);
    scrittoRef.current = setTimeout(() => setScritto(false), 2500);
  };
  const gruppi = HUB_GRUPPI_PROP.map(g => ({
    ...g, voci: HUB_PROPRIETA.filter(p => p.gruppo === g.id && p.id !== 'nome'),
  })).filter(g => g.voci.length);

  const valore = (p) => {
    const v = hubLeggi(riga, p.id);
    if (v == null || v === '' || (Array.isArray(v) && !v.length))
      return <span style={{fontSize: 13.8, color: ADM.MUTED_LIGHT}}>—</span>;
    if (p.tipo === 'data')   return <span style={{fontSize: 13.8, color: ADM.TEXT}}>{fmtDate(v)}</span>;
    if (p.tipo === 'valuta') return <span style={{fontSize: 13.8, color: ADM.TEXT, fontVariantNumeric: 'tabular-nums'}}>{fmtEur(v)}</span>;
    if (p.tipo === 'numero') return <span style={{fontSize: 13.8, color: ADM.TEXT, fontVariantNumeric: 'tabular-nums'}}>{fmtNum(v)}</span>;
    if (p.tipo === 'bool')   return <CntPillola color={v ? 'OK' : 'PLAN_FREE'}>{v ? 'Sì' : 'No'}</CntPillola>;
    if (p.tipo === 'multi')  return (
      <span style={{display: 'inline-flex', flexWrap: 'wrap', gap: 4}}>
        {v.map(x => <CntPillola key={x} color="TEAL">{hubEtichettaOpzione(p, x)}</CntPillola>)}
      </span>
    );
    if (p.id === 'ciclo') return <CntPillola color={CNT_CICLO[v].color}>{CNT_CICLO[v].label}</CntPillola>;
    if (p.id === 'piano') return <CntPillola color={CNT_PIANI[v].color}>{CNT_PIANI[v].label}</CntPillola>;
    if (p.id === 'tipo')  return <CntPillola color={CNT_TIPI[v].color}>{CNT_TIPI[v].label}</CntPillola>;
    if (p.tipo === 'elenco') return <span style={{fontSize: 13.8, color: ADM.TEXT}}>{hubEtichettaOpzione(p, v)}</span>;
    return <span style={{fontSize: 13.8, color: ADM.TEXT, wordBreak: 'break-word'}}>{String(v)}</span>;
  };

  const elenchi = HUB_ELENCHI.filter(e => e.tipo === 'attivo' && hubPassa(riga, e.includi)
    && !(e.escludi && e.escludi.length && hubPassa(riga, e.escludi)));

  return (
    <div style={{display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14, alignItems: 'start'}}>
      <AdmCard padding={0}>
        <div style={{padding: '15px 18px', borderBottom: `1px solid ${ADM.BORDER}`, display: 'flex', alignItems: 'center', gap: 13}}>
          <AdmAvatar name={riga.nome} size={44}
            bg={`hsl(${(riga.ref.id.charCodeAt(1) + riga.ref.id.charCodeAt(riga.ref.id.length - 1)) * 5 % 360}, 42%, 55%)`}/>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 18, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.02em'}}>{riga.nome}</div>
            <div style={{fontSize: 13.2, color: ADM.MUTED, marginTop: 2}}>{riga.email || 'Nessuna email'} · {riga.ref.id}</div>
          </div>
          {/* Senza email non c'è nessuno a cui scrivere: il bottone non
              compare — accanto a «Nessuna email» sarebbe una promessa vuota. */}
          {riga.email && (
            <HubStrumento icona={scritto ? 'check' : 'mail'} acceso={scritto} onClick={scrivi}>
              {scritto ? 'Email aperta nel client' : 'Scrivigli'}
            </HubStrumento>
          )}
        </div>
        <div style={{padding: '4px 18px 16px'}}>
          {gruppi.map(g => (
            <div key={g.id} style={{marginTop: 14}}>
              <div style={{fontSize: 11.2, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 6}}>{g.label}</div>
              {g.voci.map(pr => (
                <div key={pr.id} style={{display: 'flex', gap: 14, padding: '8px 0', borderBottom: `1px solid ${ADM.BORDER_SOFT}`, alignItems: 'flex-start'}}>
                  <span style={{fontSize: 13, color: ADM.MUTED, width: 190, flexShrink: 0, fontWeight: 600}}>{pr.label}</span>
                  <span style={{flex: 1, minWidth: 0}}>{valore(pr)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </AdmCard>

      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        <AdmCard padding={18}>
          <div style={{fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 11}}>Elenchi di cui fa parte</div>
          {elenchi.length === 0 && <div style={{fontSize: 13.2, color: ADM.MUTED, lineHeight: 1.55}}>
            Nessuno, per ora. Gli elenchi attivi lo prenderanno da soli appena risponderà ai loro criteri.
          </div>}
          {elenchi.map(e => (
            <div key={e.id} style={{display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0'}}>
              <span style={{width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', background: ADM.OK_SOFT, color: ADM.OK, flexShrink: 0}}>
                <BuIcons.refresh size={13}/>
              </span>
              <span style={{flex: 1, minWidth: 0, fontSize: 13.4, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{e.nome}</span>
            </div>
          ))}
        </AdmCard>
        <AdmCard padding={18}>
          <div style={{fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, marginBottom: 9}}>Che cosa manca</div>
          <div style={{fontSize: 13.2, color: ADM.MUTED, lineHeight: 1.6}}>
            Questo contatto è nato in Hubble: non ha ancora un record operativo in byup — niente ordini, niente configurazione, niente certificazioni. Quelle schede compaiono da sole quando il locale entra in piattaforma.
          </div>
        </AdmCard>
      </div>
    </div>
  );
}

window.CntSchedaProprieta = CntSchedaProprieta;

window.CntAttivita = CntAttivita;
window.CntCrea = CntCrea;

window.AdmContattiPage = AdmContattiPage;
