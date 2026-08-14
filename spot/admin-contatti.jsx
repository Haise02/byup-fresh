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
  }));

  return rows;
})();

function AdmContattiPage({ search, openContatto }) {
  const [tipo, setTipo] = useStateCnt('tutti');
  // Si filtra per DOVE: regione e città — la geografia è la domanda vera di
  // chi lavora la rubrica («chi abbiamo a Roma?»).
  const [regione, setRegione] = useStateCnt('all');
  const [citta, setCitta] = useStateCnt('all');
  // L'ordinamento vive nelle INTESTAZIONI: si clicca la cima di una colonna e
  // la lista si ordina su quel campo; un secondo click inverte il verso.
  // A riposo è una rubrica: nomi in ordine alfabetico.
  const [sort, setSort] = useStateCnt({ campo: 'nome', verso: 'asc' });
  const [localSearch, setLocalSearch] = useStateCnt('');
  // {tipo, ref}: quale drawer aprire lo decide la tipologia — il dettaglio
  // giusto per ciascuno, non un dettaglio unico appiattito sui tre.
  const [selected, setSelected] = useStateCnt(null);

  // Apertura diretta dalla ricerca globale, dalla Dashboard, dalle notifiche:
  // le vecchie rotte (locali/camerieri/utenti) atterrano qui già tradotte.
  useEffectCnt(() => {
    if (openContatto) setSelected(openContatto);
  }, [openContatto && openContatto.ref && openContatto.ref.id]);

  const effectiveSearch = (localSearch || search || '').trim();

  const filtered = useMemoCnt(() => {
    let r = CONTATTI;
    if (tipo !== 'tutti')    r = r.filter(c => c.tipo === tipo);
    if (regione !== 'all')   r = r.filter(c => c.regione === regione);
    if (citta !== 'all')     r = r.filter(c => c.citta === citta);
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
      nome:  (a, b) => a.nome.localeCompare(b.nome),
      email: (a, b) => String(a.email || '').localeCompare(String(b.email || '')),
      tipo:  (a, b) => CNT_TIPI[a.tipo].label.localeCompare(CNT_TIPI[b.tipo].label),
      ciclo: (a, b) => rangoCiclo(a) - rangoCiclo(b),
      citta: (a, b) => a.citta.localeCompare(b.citta),
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
  }, [tipo, regione, citta, effectiveSearch, sort]);

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

  // Click sull'intestazione: nuova colonna → verso crescente (i testi dalla
  // A, il ciclo di vita dal lead in su); stessa colonna → il verso si inverte.
  const ordina = (campo) => setSort(s => s.campo === campo
    ? { campo, verso: s.verso === 'asc' ? 'desc' : 'asc' }
    : { campo, verso: 'asc' });

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

          <FilterDropdown label="Regione" value={regione} onChange={setRegione} options={[
            { value: 'all', label: 'Tutte le regioni' },
            ...regioni.map(r => ({ value: r, label: r })),
          ]}/>
          <FilterDropdown label="Città" value={citta} onChange={setCitta} options={[
            { value: 'all', label: 'Tutte le città' },
            ...cittaList.map(x => ({ value: x, label: x })),
          ]}/>
          <div style={{flex: 1}}/>
          <span style={{fontSize: 13.7, color: ADM.MUTED}}>{filtered.length} risultati</span>
        </div>

        {/* Le quattro colonne della rubrica — email, tipologia, ciclo di
            vita, città — più l'identità in testa: una lista di sole email
            si legge col dizionario in mano. Ogni cima di colonna È il comando
            di ordinamento su quel campo. Lo stato (Attivo/Inattivo) e la data
            di iscrizione vivono nel dettaglio, non qui. */}
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,2.2fr) minmax(0,2fr) 1.25fr 1.15fr 1.05fr 60px',
            gap: 0,
            padding: '10px 18px',
            borderBottom: `1px solid ${ADM.BORDER}`,
            alignItems: 'center',
          }}>
            <CntIntestazione campo="nome"  label="Contatto"           sort={sort} onSort={ordina}/>
            <CntIntestazione campo="email" label="Email"              sort={sort} onSort={ordina}/>
            <CntIntestazione campo="tipo"  label="Tipologia contatto" sort={sort} onSort={ordina}/>
            <CntIntestazione campo="ciclo" label="Ciclo di vita"      sort={sort} onSort={ordina}/>
            <CntIntestazione campo="citta" label="Città"              sort={sort} onSort={ordina}/>
            <div></div>
          </div>
          <div>
            {filtered.length === 0 && <AdmEmpty title="Nessun contatto trovato" desc="Modifica i filtri o cancella la ricerca"/>}
            {filtered.map((c, i) => (
              <ContattoRow key={c.key} contatto={c} striped={i % 2 === 1}
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

// La cima della colonna è un pulsante: si clicca e la lista si ordina su quel
// campo, si riclicca e si inverte. L'icona c'è SEMPRE — è lei a dire che la
// cima si può cliccare: sulle colonne a riposo è il doppio verso (⇅) in
// grigio tenue, sull'attiva diventa la freccia corallo che punta nel verso
// della lista. Stesso ingombro nei due stati: al cambio niente si sposta.
function CntIntestazione({ campo, label, sort, onSort }) {
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
      title={'Ordina per ' + label.toLowerCase()}
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

function ContattoRow({ contatto: c, onClick, striped }) {
  const [hover, setHover] = useStateCnt(false);
  const tipoDef = CNT_TIPI[c.tipo];
  const cicloDef = c.ciclo ? CNT_CICLO[c.ciclo] : null;
  const device = c.tipo === 'staff' && c.ref.ruolo === 'dispositivo';
  return (
    <div onClick={onClick} className="adm-row-open"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,2.2fr) minmax(0,2fr) 1.25fr 1.15fr 1.05fr 60px',
        gap: 0,
        padding: '12px 18px',
        borderBottom: `1px solid ${ADM.BORDER_SOFT}`,
        background: hover ? ADM.ROW_HOVER : (striped ? ADM.ROW_STRIPE : 'transparent'),
        cursor: 'pointer',
        alignItems: 'center',
        transition: 'background 0.08s',
      }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 11, minWidth: 0}}>
        {device
          ? <div style={{width: 34, height: 34, borderRadius: 8, background: ADM.NEUTRAL_SOFT, color: ADM.NEUTRAL, display: 'grid', placeItems: 'center', flexShrink: 0}}><BuIcons.monitor size={21}/></div>
          : <AdmAvatar name={c.nome} size={36} bg={`hsl(${(c.ref.id.charCodeAt(1) + c.ref.id.charCodeAt(c.ref.id.length - 1)) * 5 % 360}, 42%, 55%)`}/>}
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 14.4, fontWeight: 600, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: device ? 'ui-monospace,monospace' : 'inherit'}}>{c.nome}</div>
        </div>
      </div>

      {/* Un corpo solo per tutte le celle di testo della riga (13.7/500, il
          font della pagina): l'email in monospazio più piccola faceva sembrare
          la colonna di un'altra tabella. */}
      <div style={{minWidth: 0}}>
        {c.email
          ? <span style={{fontSize: 13.7, fontWeight: 500, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'}}>{c.email}</span>
          : <span style={{fontSize: 13.7, color: ADM.MUTED_LIGHT}}>—</span>}
      </div>

      <div><CntPillola color={tipoDef.color}>{tipoDef.label}</CntPillola></div>

      <div>
        {/* Il gradino commerciale, nella stessa pillola della tipologia. Lo
            staff non ne ha uno: trattino, non un gradino inventato. */}
        {cicloDef
          ? <CntPillola color={cicloDef.color}>{cicloDef.label}</CntPillola>
          : <span style={{fontSize: 13.7, color: ADM.MUTED_LIGHT}}>—</span>}
      </div>

      <div>
        <div style={{fontSize: 13.7, color: ADM.TEXT, fontWeight: 500}}>{c.citta}</div>
      </div>

      <div style={{textAlign: 'right', color: ADM.MUTED}}>
        <span className="adm-row-chev"><BuIcons.chevronRight size={20}/></span>
      </div>
    </div>
  );
}

window.AdmContattiPage = AdmContattiPage;
