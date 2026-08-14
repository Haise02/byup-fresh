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

// Le tre tipologie, con la veste che le distingue in lista. I colori sono
// quelli che le tre sezioni avevano già addosso nella nav (store/staff/phone).
const CNT_TIPI = {
  locale: { label: 'Locale',     icon: 'storeFill', color: 'PINK'   },
  staff:  { label: 'Staff',      icon: 'staffFill', color: 'INFO'   },
  utente: { label: 'Utente App', icon: 'phoneFill', color: 'PURPLE' },
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
  const [sort, setSort] = useStateCnt('iscrizione_desc');
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
    const sorts = {
      iscrizione_desc: (a, b) => b.iscritto - a.iscritto,
      iscrizione_asc:  (a, b) => a.iscritto - b.iscritto,
      nome_asc:        (a, b) => a.nome.localeCompare(b.nome),
      email_asc:       (a, b) => String(a.email || 'zz').localeCompare(String(b.email || 'zz')),
    };
    return [...r].sort(sorts[sort]);
  }, [tipo, stato, effectiveSearch, sort]);

  const counts = {
    tutti:  CONTATTI.length,
    locale: CONTATTI.filter(c => c.tipo === 'locale').length,
    staff:  CONTATTI.filter(c => c.tipo === 'staff').length,
    utente: CONTATTI.filter(c => c.tipo === 'utente').length,
  };

  const tabsList = [
    { id: 'tutti',  label: 'Tutti',      badge: counts.tutti },
    { id: 'locale', label: 'Locali',     badge: counts.locale },
    { id: 'staff',  label: 'Staff',      badge: counts.staff },
    { id: 'utente', label: 'Utenti App', badge: counts.utente },
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
          <FilterDropdown label="Ordina" value={sort} onChange={setSort} options={[
            { value: 'iscrizione_desc', label: 'Iscrizione più recente' },
            { value: 'iscrizione_asc',  label: 'Iscrizione meno recente' },
            { value: 'nome_asc',        label: 'Nome A→Z' },
            { value: 'email_asc',       label: 'Email A→Z' },
          ]}/>
          <AdmButton variant="secondary" icon="download" size="sm" onClick={downloadCSV}>Scarica CSV</AdmButton>
        </div>

        {/* Le quattro colonne chieste alla rubrica — email, tipologia, stato,
            iscrizione — più l'identità in testa: una lista di sole email
            si legge col dizionario in mano. */}
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,2.2fr) minmax(0,2fr) 1.25fr 1.15fr 1.05fr 60px',
            gap: 0,
            padding: '10px 18px',
            borderBottom: `1px solid ${ADM.BORDER}`,
            fontSize: 12.6, fontWeight: 700, color: ADM.MUTED, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <div>Contatto</div>
            <div>Email</div>
            <div>Tipologia contatto</div>
            <div>Stato</div>
            <div>Data iscrizione</div>
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

function ContattoRow({ contatto: c, onClick, striped }) {
  const [hover, setHover] = useStateCnt(false);
  const tipoDef = CNT_TIPI[c.tipo];
  const statoDef = CNT_STATI[c.stato];
  const TipoIcon = BuIcons[tipoDef.icon];
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
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '3px 9px', borderRadius: 5,
          background: ADM[tipoDef.color + '_SOFT'], color: ADM[tipoDef.color],
          fontSize: 13, fontWeight: 700,
        }}>
          <TipoIcon size={14}/>
          {tipoDef.label}
        </span>
      </div>

      <div>
        {/* Il locale tiene il suo badge di stato, che è più fine dei tre
            gradini (pending, churned…): la rubrica unifica il filtro, non
            appiattisce quello che si vede. */}
        {c.tipo === 'locale'
          ? <AdmStatoBadge stato={c.ref.stato}/>
          : <AdmBadge color={statoDef.color} size="xs">{(c.stato === 'attivo' ? '● ' : '○ ') + statoDef.label}</AdmBadge>}
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
