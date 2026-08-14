// Sezione Contatti — locali, staff e utenti app in un'unica rubrica.
//
// Tre voci di menu (Locali · Staff · Utenti App) sono diventate una: chi
// amministra la piattaforma cerca UNA persona — «di chi è questa mail?» — e
// non deve sapere in anticipo in quale delle tre liste vive. La lista porta
// le quattro colonne che identificano un contatto (email, tipologia, ciclo
// di vita, città); tutto il resto sta nel dettaglio, che resta QUELLO
// GIUSTO per ciascun tipo: il drawer del locale, la scheda dello staff, la
// scheda dell'utente app. Le vecchie pagine non sono montate da nessuna
// rotta, ma i loro file restano caricati: lì dentro vivono i loro dataset
// (STAFF, i drawer) e le rotte vecchie vengono tradotte qui da admin-app.

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

// ─── Ciclo di vita ──────────────────────────────────────────────────────────
// La TAPPA DEL RAPPORTO, senza i piani dentro (quelli sono una colonna a
// parte): dal lead al cliente che torna, fino al piano annullato e
// all'eliminazione. È una scala dei LOCALI — un utente app non ha un ciclo
// commerciale con byup — con una sola eccezione: «Eliminato» vale per
// chiunque sia stato cancellato, staff compreso.
// `rango` è l'ordine della scala quando si clicca la cima della colonna.
const CNT_CICLO = {
  lead:       { label: 'Lead',            color: 'INFO',      rango: 0 },
  onboarding: { label: 'In onboarding',   color: 'WARN',      rango: 1 },
  returning:  { label: 'Returning',       color: 'OK',        rango: 2 },
  annullato:  { label: 'Piano annullato', color: 'DANGER',    rango: 3 },
  eliminato:  { label: 'Eliminato',       color: 'PLAN_FREE', rango: 4 },
};

// ─── Piano ──────────────────────────────────────────────────────────────────
// La colonna dei piani, separata dal ciclo di vita: per i locali il piano
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
  LOCALI.forEach(l => rows.push({
    key: 'loc-' + l.id, tipo: 'locale', ref: l,
    nome: l.nome,
    cerca: l.tipo + ' ' + l.citta,
    citta: l.citta, regione: l.regione,
    email: l.email,
    // La tappa del rapporto: chi si è affacciato è un lead, chi configura è
    // in onboarding, chi lavora è un cliente che torna; chi si è fermato ha
    // annullato il piano, chi se n'è andato del tutto è eliminato.
    ciclo: l.stato === 'pending' ? 'lead'
      : (l.stato === 'onboarding' || l.stato === 'skipped') ? 'onboarding'
      : l.stato === 'active' ? 'returning'
      : l.stato === 'churned' ? 'eliminato'
      : 'annullato',
    piano: l.piano,
    iscritto: l.dataIscrizione,
  }));

  STAFF.forEach(s => {
    const device = s.ruolo === 'dispositivo';
    const ruolo = (RUOLI_STAFF.find(r => r.id === s.ruolo) || {}).label || s.ruolo;
    // L'email dello staff vive sul dominio del suo locale, lo stesso da cui
    // scrive il titolare: il mock non la porta e qui la si deriva, come fa
    // il locale stesso. I dispositivi un'email non ce l'hanno: sono contatti
    // del locale, non persone, e la colonna lo dice con un tratto.
    const loc = LOCALI.find(l => l.id === s.localeId);
    const dominio = loc && loc.email ? loc.email.split('@')[1] : null;
    rows.push({
      key: 'stf-' + s.id, tipo: 'staff', ref: s,
      nome: s.nome,
      cerca: ruolo + ' ' + s.localeNome + ' ' + s.localeCitta,
      // Lo staff sta dove sta il suo locale: città e regione sono le sue.
      citta: s.localeCitta, regione: loc ? loc.regione : '—',
      email: (device || !dominio) ? null
        : s.nome.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '.') + '@' + dominio,
      // Lo staff non ha un ciclo di vita commerciale — trattino — con una
      // eccezione: le utenze CANCELLATE dal locale restano in rubrica come
      // «Eliminato». Il mock non porta il flag: qualcuna, stabile sull'id.
      ciclo: (s.id.charCodeAt(3) * 3 + s.id.charCodeAt(4)) % 9 === 0 ? 'eliminato' : null,
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
    // L'utente app non ha un ciclo di vita commerciale con byup: trattino.
    ciclo: null,
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
  useEffectCnt(() => {
    if (openContatto) setSelected(openContatto);
  }, [openContatto && openContatto.ref && openContatto.ref.id]);

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
    // Ciclo di vita e piano ordinano per RANGO (lead → eliminato, gratuito →
    // business → base → pro), non per alfabeto.
    const rangoCiclo = (c) => c.ciclo ? CNT_CICLO[c.ciclo].rango : 99;
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
  }, [filtri, effectiveSearch, sort]);

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
    return (
      <div style={{padding: 28, display: 'flex', flexDirection: 'column', gap: 14}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <CntTorna onClick={chiudi}/>
          <span style={{fontSize: 13.5, color: ADM.MUTED_LIGHT}}>/</span>
          <span style={{fontSize: 13.5, fontWeight: 700, color: ADM.TEXT}}>{selected.ref.nome}</span>
          <CntPillola color={tipoDef.color}>{tipoDef.label}</CntPillola>
        </div>
        <AdmCard padding={0} style={{overflow: 'hidden'}}>
          {selected.tipo === 'locale' && <LocaleDrawer pieno locale={selected.ref} onClose={chiudi}/>}
          {selected.tipo === 'staff'  && <StaffDrawer  pieno staff={selected.ref}  onClose={chiudi}/>}
          {selected.tipo === 'utente' && <UtenteDrawer pieno utente={selected.ref} onClose={chiudi}/>}
        </AdmCard>
      </div>
    );
  }

  return (
    <div style={{padding: 28, display: 'flex', flexDirection: 'column', gap: 16}}>
      <style>{CNT_CSS}</style>
      <HubStile/>

      <HubTestata
        occhiello="CRM · Rubrica"
        titolo="Contatti"
        sotto="Locali, utenti staff e utenti app in un'unica rubrica. Filtra per qualunque proprietà."
        azioni={<HubStrumento forte icona="plus">Nuovo contatto</HubStrumento>}/>

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
                      prendere» senza sporcare la testata a riposo. */}
                  <span className="cnt-grip" aria-hidden="true" style={{
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
                    onDragStart={(e) => {
                      trascinataRef.current = id;
                      setTrascinata(id);
                      try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
                      cntFantasma(e, CNT_COLONNE[id].label);
                    }}
                    onDragEnd={() => { trascinataRef.current = null; setTrascinata(null); setBersaglio(null); }}/>
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

// ─── Il pulsante-strumento ──────────────────────────────────────────────────
// Il guscio comune di «Aggiungi filtro» e «Modifica colonne»: bianco a
// riposo, si scurisce sotto il mouse e si abbassa di un pixel alla pressione;
// da ACCESO (filtri attivi) veste il corallo. Il feedback vive in JS perché
// il fondo è uno stile inline e una classe :hover non lo batterebbe.
function CntStrumento({ icona, acceso, badge, onClick, children }) {
  const [sopra, setSopra] = useStateCnt(false);
  const [premuto, setPremuto] = useStateCnt(false);
  const Icona = BuIcons[icona];
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setSopra(true)}
      onMouseLeave={() => { setSopra(false); setPremuto(false); }}
      onMouseDown={() => setPremuto(true)}
      onMouseUp={() => setPremuto(false)}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 13px',
        border: `1px solid ${acceso ? ADM.PINK : sopra ? ADM.INK_SOFT : ADM.BORDER}`,
        borderRadius: 8,
        fontSize: 13.7, fontWeight: 600,
        color: acceso ? ADM.PINK_DARK : ADM.TEXT,
        background: acceso
          ? (sopra ? '#FFCBD8' : ADM.PINK_BG_SOFT)
          : (sopra ? '#F5F6F8' : '#fff'),
        boxShadow: premuto ? 'none'
          : sopra ? '0 2px 8px rgba(15,17,21,0.10)'
          : '0 1px 2px rgba(15,17,21,0.04)',
        transform: premuto ? 'translateY(1px)' : 'none',
        cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
        transition: 'background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease, transform 0.05s ease',
      }}>
      <Icona size={15} color={acceso ? ADM.PINK : sopra ? ADM.TEXT : ADM.MUTED}/>
      {children}
      {/* Il conto dei filtri accesi, sull'angolo come i badge della nav. */}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: -7, right: -7,
          minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
          background: ADM.PINK, color: '#fff',
          fontSize: 11.5, fontWeight: 800, lineHeight: 1,
          display: 'grid', placeItems: 'center',
          boxShadow: '0 0 0 2px #fff',
        }}>{badge}</span>
      )}
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
    // ha un ciclo di vita con byup ha un trattino, non un gradino inventato.
    const cicloDef = c.ciclo ? CNT_CICLO[c.ciclo] : null;
    return <div>{cicloDef ? <CntPillola color={cicloDef.color}>{cicloDef.label}</CntPillola> : tratto}</div>;
  }
  if (id === 'piano') {
    const pianoDef = c.piano ? CNT_PIANI[c.piano] : null;
    return <div>{pianoDef ? <CntPillola color={pianoDef.color}>{pianoDef.label}</CntPillola> : tratto}</div>;
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

window.AdmContattiPage = AdmContattiPage;
