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
// Il gradino COMMERCIALE del contatto, come su un CRM — non la salute del
// rapporto (quella è lo Stato, Attivo/Inattivo, e vive nel dettaglio). Per un
// locale la scala va dal lead al piano pagato; per un utente app è il piano
// dell'app; lo staff un ciclo di vita commerciale non ce l'ha — trattino.
// `rango` è l'ordine della scala quando si clicca la cima della colonna.
const CNT_CICLO = {
  lead:       { label: 'Lead',           color: 'INFO',          rango: 0 },
  onboarding: { label: 'In onboarding',  color: 'WARN',          rango: 1 },
  free:       { label: 'Piano Gratuito', color: 'PLAN_FREE',     rango: 2 },
  starter:    { label: 'Piano Starter',  color: 'PLAN_STARTER',  rango: 3 },
  plus:       { label: 'Piano Plus',     color: 'PLAN_PLUS',     rango: 4 },
  business:   { label: 'Piano Business', color: 'PLAN_BUSINESS', rango: 5 },
  base:       { label: 'Base',           color: 'PLAN_FREE',     rango: 6 },
  pro:        { label: 'Pro',            color: 'PURPLE',        rango: 7 },
};

// ─── Le colonne ─────────────────────────────────────────────────────────────
// Il catalogo delle SEI colonne possibili. Quali si vedono e in che ordine lo
// decide chi guarda («Modifica colonne» + trascinamento delle intestazioni),
// e la scelta resta in localStorage. «Contatto» è fissa: una rubrica senza
// l'identità non è una lista, è un foglio di celle.
const CNT_COLONNE = {
  nome:     { label: 'Contatto',           w: 'minmax(0,2.2fr)', fissa: true },
  email:    { label: 'Email',              w: 'minmax(0,2fr)' },
  tipo:     { label: 'Tipologia contatto', w: '1.25fr' },
  ciclo:    { label: 'Ciclo di vita',      w: '1.15fr' },
  citta:    { label: 'Città',              w: '1.05fr' },
  iscritto: { label: 'Data iscrizione',    w: '1.1fr' },
};
const CNT_COLONNE_DEFAULT = ['nome', 'email', 'tipo', 'ciclo', 'citta'];
const CNT_COLONNE_KEY = 'adm_contatti_colonne';

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
    // La scala commerciale: chi si è appena affacciato è un lead, chi sta
    // configurando è in onboarding, chi lavora ha il suo piano — anche se
    // oggi è fermo: il piano resta il suo gradino, la salute la dice lo
    // Stato nel dettaglio.
    ciclo: l.stato === 'pending' ? 'lead'
      : (l.stato === 'onboarding' || l.stato === 'skipped') ? 'onboarding'
      : l.piano,
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
      // Lo staff non ha un ciclo di vita commerciale: non compra niente da
      // byup. In colonna è un trattino, non un gradino inventato.
      ciclo: null,
      iscritto: s.dataAssunzione,
    });
  });

  UTENTI.forEach(u => rows.push({
    key: 'utn-' + u.id, tipo: 'utente', ref: u,
    nome: u.nome,
    cerca: u.citta + ' ' + u.regione,
    citta: u.citta, regione: u.regione,
    email: u.email,
    // Il piano dell'app. Il mock non lo porta: lo si deriva stabile dalle
    // ULTIME cifre dell'id (le prime sono uguali per tutti, 'U20…'), circa un
    // utente su sette è Pro — abbastanza da vederli in lista.
    ciclo: (u.id.charCodeAt(3) * 3 + u.id.charCodeAt(4)) % 7 === 0 ? 'pro' : 'base',
    iscritto: u.dataRegistrazione,
  }));

  return rows;
})();

function AdmContattiPage({ search, openContatto }) {
  const [tipo, setTipo] = useStateCnt('tutti');
  // Si filtra per DOVE: regione e città — la geografia è la domanda vera di
  // chi lavora la rubrica («chi abbiamo a Roma?»). I filtri sono a SPUNTA e
  // multipli («Puglia e Campania insieme»), scelti dal pannello del pulsante
  // «Aggiungi filtro»: dentro una dimensione le spunte si sommano in OR, tra
  // dimensioni si intersecano in AND. Nessuna spunta = nessun filtro.
  const [fRegioni, setFRegioni] = useStateCnt([]);
  const [fCitta, setFCitta] = useStateCnt([]);
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
    let r = CONTATTI;
    if (tipo !== 'tutti')    r = r.filter(c => c.tipo === tipo);
    if (fRegioni.length)     r = r.filter(c => fRegioni.includes(c.regione));
    if (fCitta.length)       r = r.filter(c => fCitta.includes(c.citta));
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
    // Il ciclo di vita ordina per RANGO (lead → business, base → pro), non
    // per alfabeto; lo staff senza ciclo finisce in fondo in entrambi i versi
    // — un trattino non sta né prima né dopo un gradino.
    const rangoCiclo = (c) => c.ciclo ? CNT_CICLO[c.ciclo].rango : 99;
    const confronta = {
      nome:     (a, b) => a.nome.localeCompare(b.nome),
      email:    (a, b) => String(a.email || '').localeCompare(String(b.email || '')),
      tipo:     (a, b) => CNT_TIPI[a.tipo].label.localeCompare(CNT_TIPI[b.tipo].label),
      ciclo:    (a, b) => rangoCiclo(a) - rangoCiclo(b),
      citta:    (a, b) => a.citta.localeCompare(b.citta),
      iscritto: (a, b) => a.iscritto - b.iscritto,
    };
    const cmp = confronta[sort.campo] || confronta.nome;
    const segno = sort.verso === 'asc' ? 1 : -1;
    return [...r].sort((a, b) => {
      // I trattini (email dei dispositivi, ciclo dello staff) stanno in fondo
      // IN ENTRAMBI i versi — fuori dal segno: un trattino non è «prima
      // della A» né «dopo la Z».
      if (sort.campo === 'email' && (a.email == null) !== (b.email == null)) {
        return a.email == null ? 1 : -1;
      }
      if (sort.campo === 'ciclo' && (a.ciclo == null) !== (b.ciclo == null)) {
        return a.ciclo == null ? 1 : -1;
      }
      // A parità (stessa tipologia, stesso stato) comanda il nome: l'ordine
      // deve essere lo stesso a ogni render, o le righe ballano sotto il mouse.
      return segno * cmp(a, b) || a.nome.localeCompare(b.nome);
    });
  }, [tipo, fRegioni, fCitta, effectiveSearch, sort]);

  // Le due geografie escono dai contatti che ci sono davvero: una regione
  // senza nessuno non deve comparire nella tendina.
  const regioni = useMemoCnt(() => [...new Set(CONTATTI.map(c => c.regione))].filter(r => r && r !== '—').sort((a, b) => a.localeCompare(b)), []);
  const cittaList = useMemoCnt(() => [...new Set(CONTATTI.map(c => c.citta))].filter(Boolean).sort((a, b) => a.localeCompare(b)), []);

  const counts = {
    tutti:  CONTATTI.length,
    locale: CONTATTI.filter(c => c.tipo === 'locale').length,
    staff:  CONTATTI.filter(c => c.tipo === 'staff').length,
    utente: CONTATTI.filter(c => c.tipo === 'utente').length,
  };

  const tabsList = [
    { id: 'tutti',  label: 'Tutti',        badge: counts.tutti },
    { id: 'locale', label: 'Locali',       badge: counts.locale },
    { id: 'staff',  label: 'Utenti Staff', badge: counts.staff },
    { id: 'utente', label: 'Utenti App',   badge: counts.utente },
  ];

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

  return (
    <div style={{padding: 28, display: 'flex', flexDirection: 'column', gap: 16}}>
      <AdmCard padding={0}>
        <AdmTabBar tabs={tabsList} active={tipo} onChange={setTipo}/>

        <div style={{padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${ADM.BORDER}`, flexWrap: 'wrap'}}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
            <span style={{position: 'absolute', left: 10, color: ADM.MUTED, pointerEvents: 'none', display: 'inline-flex'}}>
              <BuIcons.search size={18}/>
            </span>
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Cerca nome, email, locale, ID…"
              style={{
                padding: '7px 12px 7px 30px',
                border: `1px solid ${ADM.BORDER}`, borderRadius: 7,
                fontSize: 14, fontFamily: 'inherit',
                width: 280, color: ADM.TEXT, background: '#fff',
                outline: 'none',
              }}
            />
            {localSearch && (
              <button onClick={() => setLocalSearch('')} style={{
                position: 'absolute', right: 6, background: 'transparent', border: 'none', cursor: 'pointer',
                color: ADM.MUTED, padding: 4, display: 'inline-flex', borderRadius: 4,
              }}><BuIcons.x size={17}/></button>
            )}
          </div>

          <CntFiltri
            gruppi={[
              { id: 'regione', titolo: 'Regione', voci: regioni,   scelte: fRegioni, cambia: setFRegioni },
              { id: 'citta',   titolo: 'Città',   voci: cittaList, scelte: fCitta,   cambia: setFCitta },
            ]}/>
          <div style={{flex: 1}}/>
          <span style={{fontSize: 13.7, color: ADM.MUTED}}>{filtered.length} risultati</span>
          <CntColonne colonne={colonne} onCambia={cambiaColonne}/>
        </div>

        {/* Le colonne scelte, nell'ordine scelto. Ogni cima di colonna è il
            comando di ordinamento (click) E la maniglia di riordino
            (trascinamento): la si prende per il nome e la si posa dove deve
            stare — la riga sotto indica il lato su cui atterrerà. */}
        <div>
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
                <div key={id}
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
                    const r = e.currentTarget.getBoundingClientRect();
                    sposta(da || trascinataRef.current, id, e.clientX > r.left + r.width / 2);
                    trascinataRef.current = null;
                    setTrascinata(null); setBersaglio(null);
                  }}
                  style={{
                    minWidth: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'center',
                    opacity: trascinata === id ? 0.35 : 1,
                    // La riga corallo sul bordo dice DOVE atterra la colonna
                    // in volo: prima o dopo questa, secondo la metà su cui
                    // sta il puntatore.
                    boxShadow: mira
                      ? `inset ${bersaglio.dopo ? '-2px' : '2px'} 0 0 ${ADM.PINK}`
                      : 'none',
                  }}>
                  <CntIntestazione campo={id} label={CNT_COLONNE[id].label} sort={sort} onSort={ordina}
                    onDragStart={(e) => {
                      trascinataRef.current = id;
                      setTrascinata(id);
                      try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
                    }}
                    onDragEnd={() => { trascinataRef.current = null; setTrascinata(null); setBersaglio(null); }}/>
                </div>
              );
            })}
            <div></div>
          </div>
          <div>
            {filtered.length === 0 && <AdmEmpty title="Nessun contatto trovato" desc="Modifica i filtri o cancella la ricerca"/>}
            {filtered.map((c, i) => (
              <ContattoRow key={c.key} contatto={c} striped={i % 2 === 1}
                colonne={colonne} griglia={griglia}
                onClick={() => setSelected({ tipo: c.tipo, ref: c.ref })}/>
            ))}
          </div>
        </div>
      </AdmCard>

      {/* Il dettaglio pertinente per ciascuno: il drawer del locale, la
          scheda dello staff, la scheda dell'utente app — gli stessi di
          quando erano tre sezioni, nessuna informazione persa per strada. */}
      {selected && selected.tipo === 'locale' && <LocaleDrawer locale={selected.ref} onClose={() => setSelected(null)}/>}
      {selected && selected.tipo === 'staff'  && <StaffDrawer  staff={selected.ref}  onClose={() => setSelected(null)}/>}
      {selected && selected.tipo === 'utente' && <UtenteDrawer utente={selected.ref} onClose={() => setSelected(null)}/>}
    </div>
  );
}

// ─── Aggiungi filtro ────────────────────────────────────────────────────────
// UN pulsante al posto della fila di tendine: si apre un pannello con i
// filtri a SPUNTA, raggruppati per dimensione (Regione, Città), e si spunta
// quello che serve — anche più voci insieme. Il conto dei filtri applicati
// sta sul pulsante, nel tondino corallo in alto a destra: la barra non deve
// crescere di una tendina per ogni dimensione nuova, e un filtro acceso non
// deve mai essere invisibile.
function CntFiltri({ gruppi }) {
  const [aperto, setAperto] = useStateCnt(false);
  const [sopra, setSopra] = useStateCnt(null);
  const totale = gruppi.reduce((s, g) => s + g.scelte.length, 0);

  React.useEffect(() => {
    if (!aperto) return;
    const chiudi = () => setAperto(false);
    const onKey = (e) => { if (e.key === 'Escape') setAperto(false); };
    window.addEventListener('pointerdown', chiudi);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', chiudi);
      window.removeEventListener('keydown', onKey);
    };
  }, [aperto]);

  const spunta = (g, voce) => g.cambia(
    g.scelte.includes(voce) ? g.scelte.filter(v => v !== voce) : [...g.scelte, voce]
  );

  return (
    <div style={{position: 'relative', display: 'inline-flex'}} onPointerDown={e => e.stopPropagation()}>
      <button type="button" onClick={() => setAperto(a => !a)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '7px 12px',
          border: `1px solid ${totale ? ADM.PINK : ADM.BORDER}`, borderRadius: 7,
          fontSize: 13.7, fontWeight: totale ? 600 : 500,
          color: totale ? ADM.PINK_DARK : ADM.TEXT,
          background: totale ? ADM.PINK_BG_SOFT : '#fff',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
        <BuIcons.filter size={15} color={totale ? ADM.PINK : ADM.MUTED}/>
        Aggiungi filtro
        {/* Il conto dei filtri accesi, sull'angolo come i badge della nav:
            si vede anche da lontano che la lista NON è tutta la rubrica. */}
        {totale > 0 && (
          <span style={{
            position: 'absolute', top: -7, right: -7,
            minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
            background: ADM.PINK, color: '#fff',
            fontSize: 11.5, fontWeight: 800, lineHeight: 1,
            display: 'grid', placeItems: 'center',
            boxShadow: '0 0 0 2px #fff',
          }}>{totale}</span>
        )}
      </button>

      {aperto && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 120,
          width: 250, padding: 6, borderRadius: 12,
          background: '#fff', border: `1px solid ${ADM.BORDER}`,
          boxShadow: '0 18px 44px -10px rgba(15,17,21,0.22)',
          maxHeight: 400, overflowY: 'auto',
        }}>
          {gruppi.map(g => (
            <div key={g.id}>
              <div style={{
                padding: '9px 10px 5px',
                fontSize: 11, fontWeight: 700, color: ADM.MUTED_SOFT,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{g.titolo}</div>
              {g.voci.map(voce => {
                const acceso = g.scelte.includes(voce);
                const chiave = g.id + '|' + voce;
                return (
                  <button key={voce} type="button"
                    onClick={() => spunta(g, voce)}
                    onMouseEnter={() => setSopra(chiave)}
                    onMouseLeave={() => setSopra(s => (s === chiave ? null : s))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      width: '100%', textAlign: 'left',
                      padding: '7px 10px', borderRadius: 8, border: 'none',
                      background: sopra === chiave ? ADM.NEUTRAL_SOFT : 'transparent',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background 0.1s ease',
                    }}>
                    {/* La spunta: quadratino vuoto a riposo, corallo pieno con
                        il segno quando è accesa. */}
                    <span style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${acceso ? ADM.PINK : ADM.BORDER}`,
                      background: acceso ? ADM.PINK : '#fff',
                      display: 'grid', placeItems: 'center',
                      transition: 'background 0.1s ease, border-color 0.1s ease',
                    }}>
                      {acceso && <BuIcons.check size={11} color="#fff"/>}
                    </span>
                    <span style={{
                      flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', fontSize: 13.5,
                      fontWeight: acceso ? 600 : 500,
                      color: acceso ? ADM.TEXT : ADM.TEXT,
                    }}>{voce}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* La via d'uscita da tutti i filtri insieme: c'è solo quando ce
              n'è almeno uno — a pannello pulito non promette niente. */}
          {totale > 0 && (
            <button type="button"
              onClick={() => gruppi.forEach(g => g.cambia([]))}
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                marginTop: 6, padding: '8px 10px', borderRadius: 8,
                border: 'none', background: ADM.PINK_BG_SOFT,
                color: ADM.PINK_DARK, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Azzera filtri ({totale})</button>
          )}
        </div>
      )}
    </div>
  );
}

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
    // Il gradino commerciale, nella stessa pillola della tipologia. Lo
    // staff non ne ha uno: trattino, non un gradino inventato.
    const cicloDef = c.ciclo ? CNT_CICLO[c.ciclo] : null;
    return <div>{cicloDef ? <CntPillola color={cicloDef.color}>{cicloDef.label}</CntPillola> : tratto}</div>;
  }
  if (id === 'iscritto') return <div style={testo}>{fmtDate(c.iscritto)}</div>;
  return <div style={testo}>{c.citta}</div>;
}

function ContattoRow({ contatto: c, colonne, griglia, onClick, striped }) {
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
      {colonne.map(id => <CntCella key={id} id={id} c={c}/>)}
      <div style={{textAlign: 'right', color: ADM.MUTED}}>
        <span className="adm-row-chev"><BuIcons.chevronRight size={20}/></span>
      </div>
    </div>
  );
}

// ─── Modifica colonne ───────────────────────────────────────────────────────
// Il catalogo delle sei colonne con le spunte: cosa si vede lo decide chi
// guarda. «Contatto» resta accesa e basta — è l'identità della riga. Le
// colonne riaccese entrano in coda; il posto giusto glielo si dà poi
// trascinando la sua intestazione.
function CntColonne({ colonne, onCambia }) {
  const [aperto, setAperto] = useStateCnt(false);
  const [sopra, setSopra] = useStateCnt(null);

  React.useEffect(() => {
    if (!aperto) return;
    const chiudi = () => setAperto(false);
    const onKey = (e) => { if (e.key === 'Escape') setAperto(false); };
    window.addEventListener('pointerdown', chiudi);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', chiudi);
      window.removeEventListener('keydown', onKey);
    };
  }, [aperto]);

  const commuta = (id) => {
    if (CNT_COLONNE[id].fissa) return;
    onCambia(colonne.includes(id) ? colonne.filter(x => x !== id) : [...colonne, id]);
  };

  return (
    <div style={{position: 'relative', display: 'inline-flex'}} onPointerDown={e => e.stopPropagation()}>
      <button type="button" onClick={() => setAperto(a => !a)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '7px 12px',
          border: `1px solid ${ADM.BORDER}`, borderRadius: 7,
          fontSize: 13.7, fontWeight: 500, color: ADM.TEXT,
          background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
        }}>
        <BuIcons.table size={15} color={ADM.MUTED}/>
        Modifica colonne
      </button>

      {aperto && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 120,
          width: 240, padding: 6, borderRadius: 12,
          background: '#fff', border: `1px solid ${ADM.BORDER}`,
          boxShadow: '0 18px 44px -10px rgba(15,17,21,0.22)',
        }}>
          {Object.keys(CNT_COLONNE).map(id => {
            const def = CNT_COLONNE[id];
            const accesa = colonne.includes(id);
            return (
              <button key={id} type="button"
                onClick={() => commuta(id)}
                onMouseEnter={() => setSopra(id)}
                onMouseLeave={() => setSopra(s => (s === id ? null : s))}
                disabled={def.fissa}
                title={def.fissa ? 'L\'identità del contatto non si nasconde' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  width: '100%', textAlign: 'left',
                  padding: '7px 10px', borderRadius: 8, border: 'none',
                  background: sopra === id && !def.fissa ? ADM.NEUTRAL_SOFT : 'transparent',
                  cursor: def.fissa ? 'default' : 'pointer', fontFamily: 'inherit',
                  opacity: def.fissa ? 0.55 : 1,
                  transition: 'background 0.1s ease',
                }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${accesa ? ADM.PINK : ADM.BORDER}`,
                  background: accesa ? ADM.PINK : '#fff',
                  display: 'grid', placeItems: 'center',
                }}>
                  {accesa && <BuIcons.check size={11} color="#fff"/>}
                </span>
                <span style={{flex: 1, fontSize: 13.5, fontWeight: accesa ? 600 : 500, color: ADM.TEXT}}>{def.label}</span>
              </button>
            );
          })}
          <div style={{
            margin: '6px 4px 4px', padding: '8px 6px 2px',
            borderTop: `1px solid ${ADM.BORDER_SOFT}`,
            fontSize: 11.8, color: ADM.MUTED_SOFT, lineHeight: 1.45,
          }}>Trascina le intestazioni per riordinare le colonne</div>
        </div>
      )}
    </div>
  );
}

window.AdmContattiPage = AdmContattiPage;
