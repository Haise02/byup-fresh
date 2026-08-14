// Sezione Contatti — locali, staff e utenti app in un'unica rubrica.
//
// Tre voci di menu (Locali · Staff · Utenti App) sono diventate una: chi
// amministra la piattaforma cerca UNA persona — «di chi è questa mail?» — e
// non deve sapere in anticipo in quale delle tre liste vive. La lista porta
// le quattro colonne che identificano un contatto (email, tipologia, stato,
// data di iscrizione); tutto il resto sta nel dettaglio, che resta QUELLO
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

// Stato unificato su tre gradini. Le tre anagrafi parlano lingue diverse
// (active/pending/churned, «attivo oggi», cluster di utilizzo) ma la domanda
// della rubrica è una sola: questo contatto è vivo, sta arrivando, o è fermo?
// Il vocabolario fine resta nel dettaglio — la lista non lo butta, lo rimanda.
const CNT_STATI = {
  attivo:     { label: 'Attivo',        color: 'OK' },
  onboarding: { label: 'In onboarding', color: 'WARN' },
  inattivo:   { label: 'Inattivo',      color: 'PLAN_FREE' },
};

// Il «maggiore» di uno stato è quanto è vivo il rapporto: attivo, poi in
// arrivo, poi fermo. È l'ordine con cui si legge la colonna quando la si
// ordina, non un giudizio nuovo — la rubrica già filtra su questi tre gradini.
const CNT_STATO_RANGO = { attivo: 0, onboarding: 1, inattivo: 2 };

// Un solo elenco, costruito una volta: i mock non cambiano a runtime.
const CONTATTI = (() => {
  const rows = [];

  LOCALI.forEach(l => rows.push({
    key: 'loc-' + l.id, tipo: 'locale', ref: l,
    nome: l.nome,
    sub: l.tipo + ' · ' + l.citta,
    email: l.email,
    stato: l.stato === 'active' ? 'attivo'
      : (l.stato === 'inactive' || l.stato === 'churned') ? 'inattivo'
      : 'onboarding',
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
      sub: ruolo + ' · ' + s.localeNome,
      email: (device || !dominio) ? null
        : s.nome.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '.') + '@' + dominio,
      // Vivo se s'è visto nell'ultima settimana: «attivo oggi» è un dettaglio
      // da scheda, per la rubrica conta se il rapporto è in piedi.
      stato: (Date.now() - s.lastActive.getTime()) <= 7 * 86400000 ? 'attivo' : 'inattivo',
      iscritto: s.dataAssunzione,
    });
  });

  UTENTI.forEach(u => rows.push({
    key: 'utn-' + u.id, tipo: 'utente', ref: u,
    nome: u.nome,
    sub: u.citta + ' · ' + u.id,
    email: u.email,
    stato: u.attivo ? 'attivo' : 'inattivo',
    iscritto: u.dataRegistrazione,
  }));

  return rows;
})();

function AdmContattiPage({ search, openContatto }) {
  const [tipo, setTipo] = useStateCnt('tutti');
  const [stato, setStato] = useStateCnt('all');
  // L'ordinamento vive nelle INTESTAZIONI: si clicca la cima di una colonna e
  // la lista si ordina su quel campo; un secondo click inverte il verso. Il
  // menu «Ordina» che stava qui accanto diceva le stesse cose in un posto
  // meno ovvio, ed è stato assorbito dalle colonne.
  const [sort, setSort] = useStateCnt({ campo: 'iscritto', verso: 'desc' });
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
    if (tipo !== 'tutti')  r = r.filter(c => c.tipo === tipo);
    if (stato !== 'all')   r = r.filter(c => c.stato === stato);
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      r = r.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        c.sub.toLowerCase().includes(q) ||
        c.ref.id.toLowerCase().includes(q)
      );
    }
    // Un confronto per campo, sempre in verso crescente: il verso lo applica
    // il segno qui sotto.
    const confronta = {
      nome:     (a, b) => a.nome.localeCompare(b.nome),
      email:    (a, b) => String(a.email || '').localeCompare(String(b.email || '')),
      tipo:     (a, b) => CNT_TIPI[a.tipo].label.localeCompare(CNT_TIPI[b.tipo].label),
      stato:    (a, b) => CNT_STATO_RANGO[a.stato] - CNT_STATO_RANGO[b.stato],
      iscritto: (a, b) => a.iscritto - b.iscritto,
    };
    const cmp = confronta[sort.campo] || confronta.iscritto;
    const segno = sort.verso === 'asc' ? 1 : -1;
    return [...r].sort((a, b) => {
      // Le email mancanti (dispositivi) stanno in fondo IN ENTRAMBI i versi —
      // fuori dal segno: un trattino non è «prima della A» né «dopo la Z».
      if (sort.campo === 'email' && (a.email == null) !== (b.email == null)) {
        return a.email == null ? 1 : -1;
      }
      // A parità (stessa tipologia, stesso stato) comanda il nome: l'ordine
      // deve essere lo stesso a ogni render, o le righe ballano sotto il mouse.
      return segno * cmp(a, b) || a.nome.localeCompare(b.nome);
    });
  }, [tipo, stato, effectiveSearch, sort]);

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

  // CSV della vista filtrata: le quattro colonne della rubrica più l'identità.
  const downloadCSV = () => {
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v);
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const fmt = (d) => d ? new Date(d).toISOString().slice(0, 10) : '';
    const head = ['Nome', 'ID', 'Email', 'Tipologia contatto', 'Stato', 'Data iscrizione'];
    const rows = filtered.map(c => [
      c.nome, c.ref.id, c.email || '', CNT_TIPI[c.tipo].label, CNT_STATI[c.stato].label, fmt(c.iscritto),
    ].map(esc).join(';'));
    const csv = '\uFEFF' + head.map(esc).join(';') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `byup-contatti-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Click sull'intestazione: nuova colonna → parte dal suo verso naturale
  // (le date dalla più recente, i testi dalla A, gli stati dal più vivo);
  // stessa colonna → il verso si inverte.
  const ordina = (campo) => setSort(s => s.campo === campo
    ? { campo, verso: s.verso === 'asc' ? 'desc' : 'asc' }
    : { campo, verso: campo === 'iscritto' ? 'desc' : 'asc' });

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

          <FilterDropdown label="Stato" value={stato} onChange={setStato} options={[
            { value: 'all', label: 'Tutti gli stati' },
            { value: 'attivo', label: 'Attivi' },
            { value: 'onboarding', label: 'In onboarding' },
            { value: 'inattivo', label: 'Inattivi' },
          ]}/>
          <div style={{flex: 1}}/>
          <span style={{fontSize: 13.7, color: ADM.MUTED}}>{filtered.length} risultati</span>
          <AdmButton variant="secondary" icon="download" size="sm" onClick={downloadCSV}>Scarica CSV</AdmButton>
        </div>

        {/* Le quattro colonne chieste alla rubrica — email, tipologia, stato,
            iscrizione — più l'identità in testa: una lista di sole email
            si legge col dizionario in mano. Ogni cima di colonna È il comando
            di ordinamento su quel campo. */}
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,2.2fr) minmax(0,2fr) 1.25fr 1.15fr 1.05fr 60px',
            gap: 0,
            padding: '10px 18px',
            borderBottom: `1px solid ${ADM.BORDER}`,
            alignItems: 'center',
          }}>
            <CntIntestazione campo="nome"     label="Contatto"           sort={sort} onSort={ordina}/>
            <CntIntestazione campo="email"    label="Email"              sort={sort} onSort={ordina}/>
            <CntIntestazione campo="tipo"     label="Tipologia contatto" sort={sort} onSort={ordina}/>
            <CntIntestazione campo="stato"    label="Stato"              sort={sort} onSort={ordina}/>
            <CntIntestazione campo="iscritto" label="Data iscrizione"    sort={sort} onSort={ordina}/>
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

function ContattoRow({ contatto: c, onClick, striped }) {
  const [hover, setHover] = useStateCnt(false);
  const tipoDef = CNT_TIPI[c.tipo];
  const statoDef = CNT_STATI[c.stato];
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
          <div style={{fontSize: 13, color: ADM.MUTED, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.sub}</div>
        </div>
      </div>

      <div style={{minWidth: 0}}>
        {c.email
          ? <span style={{fontSize: 12.8, color: ADM.TEXT, fontFamily: 'ui-monospace,monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'}}>{c.email}</span>
          : <span style={{fontSize: 13, color: ADM.MUTED_LIGHT}}>—</span>}
      </div>

      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '3px 9px', borderRadius: 5,
          background: ADM[tipoDef.color + '_SOFT'], color: ADM[tipoDef.color],
          fontSize: 13, fontWeight: 700,
        }}>
          {tipoDef.label}
        </span>
      </div>

      <div>
        {/* UN SOLO layout di stato per tutti e tre i tipi: stessa pillola,
            stessi tre gradini, solo la parola — il colore dice già il tono, e
            il pallino era un secondo segnale per la stessa cosa. Prima il
            locale portava il suo badge fine (Iscritto, Onboarding saltato…):
            quel vocabolario resta nel drawer. */}
        <AdmBadge color={statoDef.color} size="xs">{statoDef.label}</AdmBadge>
      </div>

      <div>
        <div style={{fontSize: 13.7, color: ADM.TEXT, fontWeight: 500}}>{fmtDate(c.iscritto)}</div>
      </div>

      <div style={{textAlign: 'right', color: ADM.MUTED}}>
        <span className="adm-row-chev"><BuIcons.chevronRight size={20}/></span>
      </div>
    </div>
  );
}

window.AdmContattiPage = AdmContattiPage;
