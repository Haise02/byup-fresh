// Comunicazioni — inbox unificata Byup Spot
// Email-like: mittente (titolare locale) · ristorante · oggetto · tag · piano · tempo
// Richieste di certificazione alimentare: oggetto standard + allegati (no testo, no select locale)

const { useState: useStateCom, useMemo: useMemoCom } = React;

const MY_ID = 'support1';

const CERT_OGGETTO = 'Richiesta certificazione alimentare';

// ─── Costruzione dataset unificato ──────────────────────────────────────────
// Tutte le comunicazioni arrivano dal titolare di un locale.
// Le richieste di cert sono "standardizzate": oggetto fisso, no body, solo allegati.
const COMUNICAZIONI = (() => {
  const fromCert = CERTIFICAZIONI.map(c => {
    const locale = LOCALI.find(l => l.id === c.localeId);
    const stato = c.stato === 'pending' ? 'nuova'
               : c.stato === 'approvata' ? 'approvata'
               : c.stato === 'rifiutata' ? 'rifiutata' : 'nuova';
    return {
      id: c.id,
      certRequest: true,
      certTipo: c.tipo,
      localeId: c.localeId,
      senderName: locale?.titolare || '—',
      senderEmail: locale?.email || '',
      oggetto: CERT_OGGETTO,
      desc: '',
      allegati: [{ name: c.file, size: c.size, kind: 'pdf' }],
      data: c.dataInvio,
      stato,
      tags: [],
      assignedTo: c.revisedBy || null,
      motivo: c.motivo,
      revisedAt: c.revisedAt,
      revisedBy: c.revisedBy,
      scadenzaCert: c.scadenzaCert,
    };
  });

  const fromSeg = SEGNALAZIONI
    .filter(s => s.fonte !== 'app_user')
    .map(s => {
      const locale = LOCALI.find(l => l.id === s.localeId);
      const stato = s.stato === 'nuova' ? 'nuova' : s.stato === 'in_corso' ? 'in_corso' : 'risolta';
      return {
        id: s.id,
        certRequest: false,
        localeId: s.localeId,
        senderName: locale?.titolare || '—',
        senderEmail: locale?.email || '',
        oggetto: s.oggetto,
        desc: `Buongiorno,\n\n${s.desc}\n\nRimango in attesa di un vostro riscontro.\n\nGrazie,\n${locale?.titolare || ''}`,
        allegati: s.allegati ? Array.from({length: s.allegati}).map((_,i) => ({ name: `Screenshot_${i+1}.png`, size: '420 KB', kind: 'image' })) : [],
        data: s.data,
        stato,
        tags: [],
        assignedTo: s.assignedTo || null,
        resolvedBy: s.risoltaDa,
        resolvedAt: s.risoltaIl,
      };
    });

  const extras = [
    { id:'M101', localeId:'L1005', oggetto:'Posso anticipare l\'orario di apertura sulla mia scheda Byup?', desc:'Buongiorno,\n\nda lunedì prossimo inizieremo i pranzi alle 12:00 invece che alle 12:30. Riuscite ad aggiornare gli orari di apertura sul nostro profilo Byup? Grazie mille.\n\nA presto,', data:new Date(Date.now() - 35*60000) },
    { id:'M102', localeId:'L1012', oggetto:'Come riattivo le notifiche di prenotazione?', desc:'Salve,\n\ndopo l\'ultimo aggiornamento dell\'app non mi arrivano più le notifiche delle nuove prenotazioni. Ho controllato le impostazioni del telefono e sembrano a posto. Mi potete aiutare?\n\nGrazie.', data:new Date(Date.now() - 2.5*3600000) },
    { id:'M103', localeId:'L1020', oggetto:'Vorrei programmare una demo del piano Plus', desc:'Buongiorno,\n\nstiamo valutando il passaggio al piano Plus. Possiamo fissare una call di 20 minuti per capire bene cosa cambia rispetto allo Starter e quali funzionalità aggiuntive avremmo a disposizione?\n\nDisponibilità preferita: pomeriggio dopo le 16.\n\nGrazie,', data:new Date(Date.now() - 18*3600000), tags:['lead-upgrade'] },
    { id:'M104', localeId:'L1029', oggetto:'Errore export contabilità maggio', desc:'Buongiorno,\n\nquando provo a esportare la contabilità di maggio dal gestionale, mi compare "errore 502" e il file non si scarica. Sto preparando i documenti per il commercialista.\n\nUrgente, grazie.', data:new Date(Date.now() - 8*3600000), tags:['contabilita'] },
    { id:'M105', localeId:'L1034', oggetto:'Aggiornamento stickers QR per la sala', desc:'Salve,\n\nabbiamo cambiato la disposizione dei tavoli e mi servirebbero nuovi sticker QR aggiornati con i nuovi numeri tavolo. Come posso richiederli?\n\nGrazie!', data:new Date(Date.now() - 26*3600000) },
    { id:'M106', localeId:'L1041', oggetto:'Recensione offensiva da rimuovere', desc:'Buongiorno,\n\nieri sera abbiamo ricevuto una recensione contenente insulti personali al titolare. Vi chiedo gentilmente di valutarne la rimozione secondo le linee guida della community Byup. Allego screenshot.\n\nGrazie.', data:new Date(Date.now() - 4*3600000), allegati:[{name:'recensione_screenshot.png', size:'620 KB', kind:'image'}] },
    { id:'M107', localeId:'L1006', oggetto:'Confermo risoluzione problema stampante', desc:'Confermo che, dopo aver seguito i passaggi indicati dal vostro tecnico, la stampante adesso stampa regolarmente. Grazie per la rapidità.\n\nA presto.', data:new Date(Date.now() - 86400000*4), stato:'risolta' },
  ];
  const extraItems = extras.map(e => {
    const locale = LOCALI.find(l => l.id === e.localeId);
    return {
      id: e.id,
      certRequest: false,
      localeId: e.localeId,
      senderName: locale?.titolare || '—',
      senderEmail: locale?.email || '',
      oggetto: e.oggetto,
      desc: e.desc + (locale ? `\n\n${locale.titolare}\n${locale.nome}` : ''),
      allegati: e.allegati || [],
      data: e.data,
      stato: e.stato || 'nuova',
      tags: e.tags || [],
      assignedTo: null,
    };
  });

  return [...fromCert, ...fromSeg, ...extraItems].sort((a,b) => b.data - a.data);
})();

// ═════════════════════════════════════════════════════════════════════════════
function AdmComunicazioniPage() {
  const [items, setItems] = useStateCom(COMUNICAZIONI);
  const [view, setView] = useStateCom('open');
  const [search, setSearch] = useStateCom('');
  const [selectedId, setSelectedId] = useStateCom(items[0]?.id || null);

  const cAll      = items.length;
  const cOpen     = items.filter(i => i.stato === 'nuova' || i.stato === 'in_corso').length;
  const cCert     = items.filter(i => i.certRequest && i.stato === 'nuova').length;
  const cMine     = items.filter(i => i.assignedTo === MY_ID && (i.stato === 'nuova' || i.stato === 'in_corso')).length;
  const cResolved = items.filter(i => i.stato === 'risolta' || i.stato === 'approvata' || i.stato === 'rifiutata').length;

  const aperte = items.filter(i => i.stato === 'nuova' || i.stato === 'in_corso');
  const attesaMediaH = aperte.length === 0 ? 0
    : Math.round(aperte.reduce((acc, i) => acc + (Date.now() - i.data.getTime()), 0) / aperte.length / 3600000);
  const oldest = aperte.reduce((o, i) => !o || i.data < o.data ? i : o, null);
  const oldestH = oldest ? Math.floor((Date.now() - oldest.data.getTime()) / 3600000) : 0;

  const filtered = useMemoCom(() => {
    let r = items;
    if (view === 'open')     r = r.filter(i => i.stato === 'nuova' || i.stato === 'in_corso');
    if (view === 'cert')     r = r.filter(i => i.certRequest && i.stato === 'nuova');
    if (view === 'mine')     r = r.filter(i => i.assignedTo === MY_ID && (i.stato === 'nuova' || i.stato === 'in_corso'));
    if (view === 'resolved') r = r.filter(i => i.stato === 'risolta' || i.stato === 'approvata' || i.stato === 'rifiutata');
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(i => {
        const locale = LOCALI.find(l => l.id === i.localeId);
        return i.oggetto.toLowerCase().includes(q)
          || (i.desc && i.desc.toLowerCase().includes(q))
          || i.senderName.toLowerCase().includes(q)
          || (locale?.nome.toLowerCase().includes(q));
      });
    }
    return [...r].sort((a,b) => b.data - a.data);
  }, [items, view, search]);

  const selected = items.find(i => i.id === selectedId) || filtered[0];

  const updateItem = (id, patch) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  };
  const addTag = (id, tag) => {
    const t = tag.trim().replace(/^#/, '');
    if (!t) return;
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (i.tags.includes(t)) return i;
      return { ...i, tags: [...i.tags, t] };
    }));
  };
  const removeTag = (id, tag) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, tags: i.tags.filter(x => x !== tag) } : i));
  };

  const views = [
    { id:'open',     label:'Aperte',         count:cOpen },
    { id:'cert',     label:'Da approvare',   count:cCert,     accent:'WARN' },
    { id:'mine',     label:'Mie',            count:cMine },
    { id:'resolved', label:'Concluse',       count:cResolved },
    { id:'all',      label:'Tutte',          count:cAll },
  ];

  const unreadOpen   = items.filter(i => i.stato === 'nuova').length;
  const over48Open   = aperte.filter(i => (Date.now() - i.data.getTime()) > 48*3600000).length;
  const certUrgent   = items.filter(i => i.certRequest && i.stato === 'nuova' && (Date.now() - i.data.getTime()) > 24*3600000).length;
  const mineUnread   = items.filter(i => i.assignedTo === MY_ID && i.stato === 'nuova').length;
  const resolvedWeek = items.filter(i => (i.stato === 'risolta' || i.stato === 'approvata' || i.stato === 'rifiutata') && i.resolvedAt && (Date.now() - new Date(i.resolvedAt).getTime()) < 7*86400000).length;

  const setViewToggle = (next) => setView(view === next ? 'all' : next);

  return (
    <div style={{height:'100%', display:'flex', flexDirection:'column', background:ADM.PANEL_SOFT}}>
      {/* Filter cards (KPI + filtro in unico componente) */}
      <div style={{background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`, padding:'20px 32px 18px', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14, gap:14}}>
          <div style={{fontSize:13.3, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Filtra per</div>
          <button onClick={()=>setView('all')} style={{
            display:'inline-flex', alignItems:'center', gap:6,
            padding:'4px 10px',
            background: view === 'all' ? ADM.PANEL_SOFT : 'transparent',
            color: view === 'all' ? ADM.TEXT : ADM.MUTED,
            border:`1px solid ${view === 'all' ? ADM.MUTED_LIGHT : ADM.BORDER}`,
            borderRadius:99,
            fontSize:13.3, fontWeight: view === 'all' ? 700 : 600,
            fontFamily:'inherit', cursor:'pointer', letterSpacing:'-0.005em',
            transition:'all 0.14s ease',
          }}>
            <BuIcons.list size={16}/>
            Tutte
            <span style={{color: view === 'all' ? ADM.MUTED : ADM.MUTED_SOFT, fontWeight:600}}>{cAll}</span>
          </button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:12}}>
          <FilterCard
            icon="chat" tone="PINK"
            label="Aperte" value={cOpen}
            hint={over48Open > 0 ? `${over48Open} oltre 48h` : `${unreadOpen} non lette`}
            hintTone={over48Open > 0 ? 'danger' : null}
            active={view === 'open'}
            onClick={()=>setViewToggle('open')}
          />
          <FilterCard
            icon="shield" tone="WARN"
            label="Da approvare" value={cCert}
            hint={cCert === 0 ? 'Niente in coda' : `${CERT_TIPI ? 'Certificazioni alimentari' : ''}${certUrgent > 0 ? ` · ${certUrgent} urgenti` : ''}`}
            hintTone={certUrgent > 0 ? 'warn' : (cCert === 0 ? 'ok' : null)}
            active={view === 'cert'}
            onClick={()=>setViewToggle('cert')}
          />
          <FilterCard
            icon="user" tone="PURPLE"
            label="Assegnate a me" value={cMine}
            hint={cMine === 0 ? 'Niente in lavorazione' : `${mineUnread} non aperte`}
            hintTone={mineUnread > 0 ? 'warn' : (cMine === 0 ? 'ok' : null)}
            active={view === 'mine'}
            onClick={()=>setViewToggle('mine')}
          />
          <FilterCard
            icon="check" tone="OK"
            label="Concluse" value={cResolved}
            hint={resolvedWeek > 0 ? `${resolvedWeek} negli ultimi 7 g` : 'Storico'}
            active={view === 'resolved'}
            onClick={()=>setViewToggle('resolved')}
          />
        </div>
        {/* Aging strip — micro-info che era nella vecchia card "Più vecchia" */}
        {cOpen > 0 && (
          <div style={{marginTop:12, display:'flex', alignItems:'center', gap:8, fontSize:13.3, color:ADM.MUTED, fontWeight:500}}>
            <BuIcons.clock size={16} color={ADM.MUTED_SOFT}/>
            <span>Più vecchia aperta da <strong style={{color: oldestH > 48 ? ADM.DANGER : ADM.TEXT, fontWeight:700}}>{oldestH}h</strong> · attesa media <strong style={{color:ADM.TEXT, fontWeight:700}}>{attesaMediaH}h</strong></span>
          </div>
        )}
      </div>

      <div style={{flex:1, display:'flex', minHeight:0}}>
        {/* Lista */}
        <div style={{width:440, flexShrink:0, borderRight:`1px solid ${ADM.BORDER}`, background:'#fff', display:'flex', flexDirection:'column', minHeight:0}}>
          {/* Search bar */}
          <div style={{padding:'14px 16px 10px', borderBottom:`1px solid ${ADM.BORDER}`}}>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED_SOFT, pointerEvents:'none'}}><BuIcons.search size={18}/></span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca mittente, locale, oggetto…" style={{
                width:'100%', padding:'8px 12px 8px 32px',
                border:'none', borderRadius:8,
                fontSize:14, fontFamily:'inherit', outline:'none',
                background:ADM.PANEL_SOFT, boxSizing:'border-box',
                color:ADM.TEXT,
              }}/>
            </div>
          </div>

          <div style={{padding:'10px 18px 8px', fontSize:13.3, color:ADM.MUTED, fontWeight:500, display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <span>
              {filtered.length} {filtered.length === 1 ? 'comunicazione' : 'comunicazioni'}
              {view !== 'all' && <span style={{color:ADM.MUTED_SOFT}}> · filtro: <strong style={{color:ADM.TEXT, fontWeight:600}}>{views.find(v=>v.id===view)?.label || 'Tutte'}</strong></span>}
            </span>
            {filtered.some(i=>i.stato==='nuova') && (
              <span style={{color:ADM.PINK, fontWeight:600}}>{filtered.filter(i=>i.stato==='nuova').length} non lette</span>
            )}
          </div>
          <div style={{flex:1, overflowY:'auto'}}>
            {filtered.length === 0 && <AdmEmpty title="Nessuna comunicazione" desc="Cambia vista o cancella la ricerca"/>}
            {filtered.map(i => (
              <InboxItem key={i.id} item={i} active={selected?.id===i.id} onClick={()=>setSelectedId(i.id)}/>
            ))}
          </div>
        </div>

        {/* Dettaglio */}
        <div style={{flex:1, display:'flex', flexDirection:'column', background:ADM.PANEL_SOFT, overflow:'hidden', minWidth:0}}>
          {selected
            ? <Thread item={selected} onUpdate={(patch)=>updateItem(selected.id, patch)} onAddTag={(t)=>addTag(selected.id, t)} onRemoveTag={(t)=>removeTag(selected.id, t)}/>
            : <AdmEmpty title="Seleziona una comunicazione" desc="Dalla lista a sinistra"/>}
        </div>
      </div>
    </div>
  );
}

// ─── Filter card cliccabile — KPI + filtro in unico componente ──────────────
function FilterCard({ icon, tone, label, value, hint, hintTone, active, onClick }) {
  const Icon = BuIcons[icon];
  const [hover, setHover] = React.useState(false);
  const hintColor = hintTone === 'danger' ? ADM.DANGER
                  : hintTone === 'warn'   ? ADM.WARN
                  : hintTone === 'ok'     ? ADM.OK
                  : ADM.MUTED;
  const hintDot = hintTone === 'danger' ? ADM.DANGER
                : hintTone === 'warn'   ? ADM.WARN
                : hintTone === 'ok'     ? ADM.OK
                : ADM.MUTED_LIGHT;

  // Bordo / sfondo / ring dipendono da active. Active = lift + tinta tono.
  return (
    <button
      onClick={onClick}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        textAlign:'left',
        position:'relative',
        display:'flex', flexDirection:'column', gap:10,
        padding:'14px 16px',
        background: active ? '#fff' : (hover ? '#FBFBFC' : '#fff'),
        border:`1.5px solid ${active ? ADM.PINK : (hover ? ADM.MUTED_LIGHT : ADM.BORDER)}`,
        borderRadius:14,
        minWidth:0, fontFamily:'inherit', cursor:'pointer',
        boxShadow: active
          ? `0 0 0 4px ${ADM.PINK_BG_SOFT}, 0 6px 16px -8px ${ADM.PINK}50`
          : hover ? '0 4px 12px -6px rgba(15,17,21,0.10)' : '0 1px 2px rgba(15,17,21,0.03)',
        transform: active ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'border-color 0.14s ease, box-shadow 0.18s ease, transform 0.14s ease, background 0.12s ease',
      }}>
      {/* check angolare quando attivo */}
      {active && (
        <div style={{
          position:'absolute', top:10, right:10,
          width:18, height:18, borderRadius:'50%',
          background:ADM.PINK, color:'#fff',
          display:'grid', placeItems:'center',
          boxShadow:`0 2px 6px -2px ${ADM.PINK}80`,
        }}>
          <BuIcons.check size={15}/>
        </div>
      )}

      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{
          width:30, height:30, borderRadius:9,
          background: active ? ADM.PINK : ADM.NEUTRAL_SOFT,
          color: active ? '#fff' : ADM.NEUTRAL,
          display:'grid', placeItems:'center', flexShrink:0,
          transition:'background 0.14s ease, color 0.14s ease',
        }}>
          <Icon size={19}/>
        </div>
        <span style={{fontSize:14, fontWeight:700, color: active ? ADM.TEXT : ADM.MUTED, letterSpacing:'-0.005em'}}>{label}</span>
      </div>

      <div style={{
        fontSize:29.5, fontWeight:800,
        color: active ? ADM.PINK : ADM.TEXT,
        letterSpacing:'-0.035em', lineHeight:1,
        fontVariantNumeric:'tabular-nums',
      }}>{value}</div>

      {hint && (
        <div style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:13.3, color:hintColor, fontWeight:500, letterSpacing:'-0.005em'}}>
          <span style={{width:6, height:6, borderRadius:'50%', background:hintDot, flexShrink:0}}/>
          {hint}
        </div>
      )}
    </button>
  );
}

// ─── Item della lista ───────────────────────────────────────────────────────
function InboxItem({ item, active, onClick }) {
  const locale = LOCALI.find(l => l.id === item.localeId);
  const piano = locale ? PIANI.find(p => p.id === locale.piano) : null;
  const isUnread = item.stato === 'nuova';
  const [hover, setHover] = React.useState(false);

  const ageH = (Date.now() - item.data.getTime()) / 3600000;
  const railColor = (item.stato === 'risolta' || item.stato === 'approvata' || item.stato === 'rifiutata') ? 'transparent'
                  : item.certRequest && ageH > 24 ? ADM.WARN
                  : ageH > 48 ? ADM.DANGER
                  : 'transparent';

  // Per le cert, niente preview (è standard); per le altre la prima riga del corpo
  const preview = item.certRequest
    ? (locale ? `${item.allegati.length} ${item.allegati.length === 1 ? 'allegato' : 'allegati'} · ${CERT_TIPI[item.certTipo]?.label || item.certTipo}` : '')
    : (item.desc.split('\n').filter(Boolean)[0] || '');

  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        padding:'14px 16px 14px 18px',
        borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
        background: active ? ADM.PINK_BG_SOFT : (hover ? '#FAFBFC' : 'transparent'),
        cursor:'pointer', position:'relative',
        transition:'background 0.1s',
      }}>
      <div style={{position:'absolute', left:0, top:10, bottom:10, width:3, borderRadius:'0 2px 2px 0', background: active ? ADM.PINK : railColor}}/>

      <div style={{display:'flex', gap:11}}>
        <AdmAvatar name={item.senderName} size={37} bg={`hsl(${(item.localeId?.charCodeAt(1)||0)*17 % 360}, 38%, 52%)`}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:2}}>
            <span style={{fontSize:14.4, fontWeight: isUnread ? 700 : 600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', minWidth:0, flexShrink:1}}>
              {item.senderName}
            </span>
            <div style={{flex:1}}/>
            {isUnread && <span style={{width:7, height:7, background:ADM.PINK, borderRadius:'50%', flexShrink:0}}/>}
            <span style={{fontSize:13, color:ADM.MUTED_SOFT, whiteSpace:'nowrap', flexShrink:0}}>{fmtRelative(item.data)}</span>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:5}}>
            <span style={{fontSize:13.3, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', minWidth:0, flexShrink:1}}>{locale?.nome || '—'}</span>
            {piano && <PlanPill piano={piano}/>}
          </div>

          <div style={{fontSize:14.8, fontWeight: isUnread ? 700 : 500, color:ADM.TEXT, marginBottom:4, lineHeight:1.35, letterSpacing:'-0.005em', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{item.oggetto}</div>
          {preview && (
            <div style={{fontSize:13.3, color:ADM.MUTED, marginBottom:8, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{preview}</div>
          )}

          <div style={{display:'flex', alignItems:'center', gap:5, flexWrap:'wrap'}}>
            {item.certRequest && <CertTag/>}
            {item.tags.slice(0, 3).map(t => <CustomTag key={t} label={t}/>)}
            {item.tags.length > 3 && <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>+{item.tags.length - 3}</span>}
            <div style={{flex:1}}/>
            {item.allegati.length > 0 && (
              <span style={{fontSize:12.6, color:ADM.MUTED, display:'inline-flex', alignItems:'center', gap:3}}>
                <BuIcons.paperclip size={15}/>{item.allegati.length}
              </span>
            )}
            {item.stato === 'in_corso' && <StatoChip stato="in_corso"/>}
            {item.stato === 'approvata' && <StatoChip stato="approvata"/>}
            {item.stato === 'rifiutata' && <StatoChip stato="rifiutata"/>}
            {item.stato === 'risolta' && <StatoChip stato="risolta"/>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Atoms tag/badge ────────────────────────────────────────────────────────
function CertTag() {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'2px 8px', borderRadius:5,
      background:ADM.WARN_SOFT, color:'#92400E',
      fontSize:12.6, fontWeight:700,
      letterSpacing:'-0.005em',
    }}>
      <BuIcons.shield size={14}/>
      Certificazione alimentare
    </span>
  );
}

function CustomTag({ label, onRemove }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'2px 8px', borderRadius:5,
      background:'#EEF1F5', color:ADM.TEXT,
      fontSize:12.6, fontWeight:600,
      letterSpacing:'-0.005em',
    }}>
      #{label}
      {onRemove && (
        <button onClick={(e)=>{e.stopPropagation(); onRemove();}} style={{
          marginLeft:2, padding:0, width:12, height:12, borderRadius:'50%',
          background:'transparent', color:ADM.MUTED, border:'none', cursor:'pointer',
          display:'grid', placeItems:'center', fontFamily:'inherit',
        }}>
          <BuIcons.x size={14}/>
        </button>
      )}
    </span>
  );
}

function PlanPill({ piano }) {
  return (
    <span style={{
      padding:'1px 6px', borderRadius:4,
      background:ADM[piano.color+'_SOFT'], color:ADM[piano.color],
      fontSize:13, fontWeight:700, letterSpacing:'0.02em', textTransform:'uppercase',
    }}>{piano.label}</span>
  );
}

function StatoChip({ stato }) {
  const map = {
    in_corso:   { label: 'In lavorazione', color: 'WARN' },
    risolta:    { label: 'Risolta',        color: 'OK'   },
    approvata:  { label: 'Approvata',      color: 'OK'   },
    rifiutata:  { label: 'Rifiutata',      color: 'DANGER' },
  };
  const s = map[stato];
  if (!s) return null;
  return (
    <span style={{
      padding:'1.5px 7px', borderRadius:4,
      background:ADM[s.color+'_SOFT'], color:ADM[s.color],
      fontSize:13, fontWeight:700, letterSpacing:'0.02em', textTransform:'uppercase',
    }}>{s.label}</span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
function Thread({ item, onUpdate, onAddTag, onRemoveTag }) {
  const locale = LOCALI.find(l => l.id === item.localeId);
  const piano = locale ? PIANI.find(p => p.id === locale.piano) : null;
  const [reply, setReply] = useStateCom('');
  const [showInternal, setShowInternal] = useStateCom(false);
  const [tagInput, setTagInput] = useStateCom('');
  const [rejectMode, setRejectMode] = useStateCom(false);
  const [rejectReason, setRejectReason] = useStateCom('');

  React.useEffect(() => {
    setReply(''); setShowInternal(false); setTagInput('');
    setRejectMode(false); setRejectReason('');
  }, [item.id]);

  const submitTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    onAddTag(t);
    setTagInput('');
  };

  const approveCert = () => onUpdate({ stato: 'approvata', revisedBy: MY_ID, revisedAt: new Date() });
  const rejectCert = () => {
    if (!rejectReason.trim()) return;
    onUpdate({ stato: 'rifiutata', revisedBy: MY_ID, revisedAt: new Date(), motivo: rejectReason.trim() });
    setRejectMode(false);
  };

  const takeOver = () => onUpdate({ assignedTo: MY_ID, stato: item.stato === 'nuova' ? 'in_corso' : item.stato });

  const ageH = Math.floor((Date.now() - item.data.getTime()) / 3600000);
  const isAssignedToMe = item.assignedTo === MY_ID;
  const assignedTeam = item.assignedTo ? TEAM.find(t => t.id === item.assignedTo) : null;
  const canSelfAssign = !item.assignedTo && (item.stato === 'nuova' || item.stato === 'in_corso');
  const canTakeOver   = item.assignedTo && !isAssignedToMe && (item.stato === 'nuova' || item.stato === 'in_corso');
  const certTipo = item.certRequest ? CERT_TIPI[item.certTipo] : null;

  return (
    <>
      {/* Header */}
      <div style={{padding:'18px 32px 16px', background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
        {/* Riga 1: stato/chip + assegnazione CTA */}
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap'}}>
          {item.certRequest && <CertTag/>}
          {item.stato === 'in_corso' && <StatoChip stato="in_corso"/>}
          {item.stato === 'approvata' && <StatoChip stato="approvata"/>}
          {item.stato === 'rifiutata' && <StatoChip stato="rifiutata"/>}
          {item.stato === 'risolta' && <StatoChip stato="risolta"/>}
          <span style={{fontSize:13, color:ADM.MUTED, fontFamily:'ui-monospace,monospace', marginLeft:2}}>{item.id}</span>
          <div style={{flex:1}}/>
          {/* Assegnazione */}
          {isAssignedToMe && (
            <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:ADM.PINK_BG_SOFT, color:ADM.PINK_DARK, borderRadius:99, fontSize:13.3, fontWeight:700, letterSpacing:'-0.005em'}}>
              <BuIcons.check size={16}/> Assegnata a te
            </span>
          )}
          {canSelfAssign && (
            <button onClick={takeOver} style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'5px 11px',
              background:'#fff', color:ADM.TEXT,
              border:`1px solid ${ADM.BORDER}`, borderRadius:8,
              fontSize:13.3, fontWeight:600, fontFamily:'inherit', cursor:'pointer',
              letterSpacing:'-0.005em',
              transition:'all 0.14s ease',
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background = ADM.PANEL_SOFT; e.currentTarget.style.borderColor = ADM.MUTED_LIGHT; }}
              onMouseLeave={e=>{ e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = ADM.BORDER; }}>
              <BuIcons.user size={16}/> Prendi in carico
            </button>
          )}
          {canTakeOver && (
            <span style={{display:'inline-flex', alignItems:'center', gap:8, fontSize:13.3, color:ADM.MUTED}}>
              <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                <AdmAvatar name={assignedTeam?.nome || ''} size={23}/>
                <span>{assignedTeam?.nome?.split(' ')[0]}</span>
              </span>
              <button onClick={takeOver} style={{
                padding:'4px 9px', background:'transparent', color:ADM.PINK,
                border:`1px solid ${ADM.PINK}40`, borderRadius:7,
                fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer', letterSpacing:'-0.005em',
              }}>Subentra</button>
            </span>
          )}
        </div>

        {/* Oggetto */}
        <div style={{fontSize:19.4, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.015em', lineHeight:1.25, marginBottom:8}}>{item.oggetto}</div>

        {/* Identity row */}
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', fontSize:14, color:ADM.MUTED}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <AdmAvatar name={item.senderName} size={27} bg={`hsl(${(item.localeId?.charCodeAt(1)||0)*17 % 360}, 38%, 52%)`}/>
            <span style={{color:ADM.TEXT, fontWeight:600}}>{item.senderName}</span>
            <span style={{color:ADM.MUTED_SOFT, fontSize:13.3}}>&lt;{item.senderEmail}&gt;</span>
          </div>
          <span style={{color:ADM.MUTED_LIGHT}}>·</span>
          <span><strong style={{color:ADM.TEXT, fontWeight:600}}>{locale?.nome || '—'}</strong> · {locale?.citta || '—'}</span>
          {piano && <><span style={{color:ADM.MUTED_LIGHT}}>·</span><PlanPill piano={piano}/></>}
          <span style={{color:ADM.MUTED_LIGHT}}>·</span>
          <span>Arrivata {fmtDateTime(item.data)} <span style={{color:ADM.MUTED_SOFT}}>({fmtRelative(item.data)})</span></span>
          {ageH > 48 && (item.stato === 'nuova' || item.stato === 'in_corso') && (
            <span style={{color:ADM.DANGER, fontWeight:600}}>· in attesa da {ageH}h</span>
          )}
        </div>
      </div>

      {/* Body scrollable */}
      <div style={{flex:1, overflowY:'auto', padding:'22px 32px', display:'flex', flexDirection:'column', gap:18}}>
        <div style={{maxWidth:920, width:'100%', alignSelf:'center', display:'flex', flexDirection:'column', gap:14}}>

          {/* TAG bar — sopra il testo dell'email */}
          <TagBar
            tags={item.tags}
            input={tagInput}
            onInput={setTagInput}
            onAdd={submitTag}
            onRemove={onRemoveTag}
          />

          {/* Email body o card cert */}
          {item.certRequest ? (
            <CertCard
              certTipo={certTipo}
              scadenza={item.scadenzaCert}
              senderName={item.senderName}
              senderEmail={item.senderEmail}
              localeId={item.localeId}
              localeName={locale?.nome}
              data={item.data}
              allegati={item.allegati}
            />
          ) : (
            <EmailBody item={item} locale={locale}/>
          )}

          {/* Azioni cert */}
          {item.certRequest && item.stato === 'nuova' && (
            <div style={{
              background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12,
              padding:'16px 18px',
              boxShadow:'0 1px 2px rgba(15,17,21,0.03)',
            }}>
              {!rejectMode && (
                <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
                  <button onClick={approveCert} style={{
                    flex:'1 1 300px',
                    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
                    padding:'12px 18px',
                    background:'linear-gradient(135deg, #16A34A, #15803D)',
                    color:'#fff', border:'none', borderRadius:10,
                    fontSize:14.4, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
                    boxShadow:'0 4px 14px -4px rgba(22,163,74,0.5)',
                    letterSpacing:'-0.005em',
                  }}>
                    <BuIcons.check size={19}/>
                    Approva richiesta di certificazione alimentare
                  </button>
                  <button onClick={()=>setRejectMode(true)} style={{
                    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
                    padding:'12px 18px',
                    background:'#fff', color:ADM.DANGER,
                    border:`1px solid ${ADM.DANGER}40`, borderRadius:10,
                    fontSize:14.4, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
                    letterSpacing:'-0.005em',
                  }}>
                    <BuIcons.x size={19}/>
                    Rifiuta con motivazione
                  </button>
                </div>
              )}
              {rejectMode && (
                <div>
                  <div style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>Motivazione del rifiuto</div>
                  <textarea
                    value={rejectReason}
                    onChange={e=>setRejectReason(e.target.value)}
                    placeholder="Es. documento non leggibile, certificazione scaduta, ente non riconosciuto…"
                    style={{
                      width:'100%', minHeight:90, padding:'10px 12px',
                      border:`1px solid ${ADM.BORDER}`, borderRadius:8,
                      fontSize:14.4, fontFamily:'inherit', color:ADM.TEXT,
                      background:'#fff', outline:'none', resize:'vertical', boxSizing:'border-box',
                      marginBottom:12,
                    }}
                  />
                  <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                    <AdmButton variant="ghost" size="md" onClick={()=>{ setRejectMode(false); setRejectReason(''); }}>Annulla</AdmButton>
                    <AdmButton variant="primary" size="md" icon="x" disabled={!rejectReason.trim()} onClick={rejectCert}>Invia rifiuto</AdmButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Esito cert già processata */}
          {item.certRequest && item.stato === 'approvata' && (
            <div style={{padding:'14px 16px', background:ADM.OK_SOFT, border:`1px solid #BBF7D0`, borderRadius:10, display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:32, height:32, borderRadius:8, background:ADM.OK, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.check size={21}/></div>
              <div style={{flex:1, fontSize:14.4, color:'#065F46'}}>
                <strong>Certificazione approvata</strong>
                {item.revisedBy && <> da {TEAM.find(t=>t.id===item.revisedBy)?.nome || item.revisedBy}</>}
                {item.revisedAt && <> · {fmtDate(item.revisedAt)}</>}
              </div>
            </div>
          )}
          {item.certRequest && item.stato === 'rifiutata' && (
            <div style={{padding:'14px 16px', background:ADM.DANGER_SOFT, border:`1px solid ${ADM.DANGER}40`, borderRadius:10, display:'flex', alignItems:'flex-start', gap:10}}>
              <div style={{width:32, height:32, borderRadius:8, background:ADM.DANGER, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.x size={21}/></div>
              <div style={{flex:1, fontSize:14.4, color:'#7F1D1D'}}>
                <div style={{fontWeight:700, marginBottom:3}}>Certificazione rifiutata
                  {item.revisedBy && <> da {TEAM.find(t=>t.id===item.revisedBy)?.nome || item.revisedBy}</>}
                  {item.revisedAt && <> · {fmtDate(item.revisedAt)}</>}
                </div>
                {item.motivo && <div style={{lineHeight:1.5}}>{item.motivo}</div>}
              </div>
            </div>
          )}

          {/* Non-cert risolta */}
          {!item.certRequest && item.stato === 'risolta' && (
            <div style={{padding:'14px 16px', background:ADM.OK_SOFT, border:`1px solid #BBF7D0`, borderRadius:10, display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:32, height:32, borderRadius:8, background:ADM.OK, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.check size={21}/></div>
              <div style={{flex:1, fontSize:14.4, color:'#065F46'}}>
                <strong>Risolta</strong>
                {item.resolvedBy && <> da {TEAM.find(t=>t.id===item.resolvedBy)?.nome || item.resolvedBy}</>}
                {item.resolvedAt && <> · {fmtDate(item.resolvedAt)}</>}
              </div>
              <AdmButton variant="ghost" size="sm" onClick={()=>onUpdate({ stato:'nuova', resolvedBy:null, resolvedAt:null })}>Riapri</AdmButton>
            </div>
          )}
        </div>
      </div>

      {/* Composer (solo per email non-cert e non risolte) */}
      {!item.certRequest && item.stato !== 'risolta' && (
        <div style={{flexShrink:0, padding:'14px 32px 18px', background:'#fff', borderTop:`1px solid ${ADM.BORDER}`}}>
          <div style={{display:'flex', gap:6, marginBottom:10}}>
            <ComposerTab active={!showInternal} onClick={()=>setShowInternal(false)} label={`Rispondi a ${item.senderName.split(' ')[0]}`} icon="send"/>
            <ComposerTab active={showInternal} onClick={()=>setShowInternal(true)} label="Nota interna" icon="bell" accent="WARN"/>
          </div>

          <div style={{
            border:`1.5px solid ${showInternal ? '#FCD34D' : ADM.BORDER}`,
            borderRadius:10,
            background: showInternal ? '#FFFDF7' : '#fff',
            transition:'all 0.15s',
          }}>
            <textarea
              value={reply}
              onChange={e=>setReply(e.target.value)}
              placeholder={showInternal ? 'Nota visibile solo al team byup…' : `Rispondi a ${item.senderName.split(' ')[0]}…`}
              style={{
                width:'100%', minHeight:80, padding:'12px 14px',
                border:'none', borderRadius:10,
                background:'transparent',
                fontSize:14.4, fontFamily:'inherit', color:ADM.TEXT,
                resize:'vertical', outline:'none', boxSizing:'border-box',
              }}
            />
            <div style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'8px 12px',
              borderTop:`1px solid ${showInternal ? '#FCD34D40' : ADM.BORDER_SOFT}`,
              flexWrap:'wrap',
            }}>
              <AdmIconBtn icon="paperclip" label="Allega file"/>
              <AdmIconBtn icon="image" label="Inserisci immagine"/>
              <div style={{flex:1}}/>
              <AdmButton variant="ghost" size="sm" icon="check" onClick={()=>{ onUpdate({ stato:'risolta', resolvedBy: MY_ID, resolvedAt: new Date() }); }}>
                Marca come risolta
              </AdmButton>
              {(() => {
                const ReplyIcon = BuIcons[showInternal ? 'bell' : 'send'];
                const handleSend = () => {
                  if (!reply.trim()) return;
                  if (!showInternal) onUpdate({ stato:'in_corso', assignedTo: item.assignedTo || MY_ID });
                  setReply('');
                };
                return (
                  <button onClick={handleSend} disabled={!reply.trim()} style={{
                    display:'inline-flex', alignItems:'center', gap:6,
                    padding:'8px 14px',
                    background: !reply.trim() ? '#E5E7EB' :
                                showInternal ? ADM.WARN :
                                'linear-gradient(135deg, #FF5A5F, #E04347)',
                    color:'#fff', border:'none', borderRadius:8,
                    fontSize:14, fontWeight:700,
                    cursor: !reply.trim() ? 'not-allowed' : 'pointer',
                    fontFamily:'inherit', letterSpacing:'-0.005em',
                    whiteSpace:'nowrap',
                    boxShadow: !reply.trim() ? 'none' :
                               showInternal ? `0 4px 12px -4px ${ADM.WARN}80` :
                               '0 4px 12px -4px rgba(255,90,95,0.55)',
                    transition:'all 0.15s',
                  }}>
                    <ReplyIcon size={17}/>
                    {showInternal ? 'Aggiungi nota' : 'Invia risposta'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Tag bar (sopra il testo) ───────────────────────────────────────────────
function TagBar({ tags, input, onInput, onAdd, onRemove }) {
  return (
    <div style={{
      background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:10,
      padding:'10px 14px',
      display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
    }}>
      <span style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Tag</span>
      {tags.length === 0 && <span style={{fontSize:13.3, color:ADM.MUTED_SOFT}}>Nessuno</span>}
      {tags.map(t => <CustomTag key={t} label={t} onRemove={()=>onRemove(t)}/>)}
      <input
        value={input}
        onChange={e=>onInput(e.target.value)}
        onKeyDown={e=>{
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); onAdd(); }
          if (e.key === 'Backspace' && input === '' && tags.length > 0) {
            onRemove(tags[tags.length - 1]);
          }
        }}
        placeholder="aggiungi tag (Invio)"
        style={{
          flex:'1 1 140px', minWidth:120,
          padding:'4px 6px',
          border:'none', background:'transparent',
          fontSize:13.7, fontFamily:'inherit', color:ADM.TEXT, outline:'none',
        }}
      />
    </div>
  );
}

// ─── Email body card ────────────────────────────────────────────────────────
function EmailBody({ item, locale }) {
  return (
    <div style={{display:'flex', gap:14}}>
      <AdmAvatar name={item.senderName} size={41} bg={`hsl(${(item.localeId?.charCodeAt(1)||0)*17 % 360}, 38%, 52%)`}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:6, flexWrap:'wrap'}}>
          <span style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>{item.senderName}</span>
          <span style={{fontSize:13.3, color:ADM.MUTED}}>Titolare di {locale?.nome || '—'}</span>
          <span style={{fontSize:13, color:ADM.MUTED_SOFT}}>· {fmtRelative(item.data)}</span>
        </div>
        <div style={{
          padding:'14px 16px',
          background:'#fff',
          border:`1px solid ${ADM.BORDER}`,
          borderRadius:10,
          fontSize:14.8, color:ADM.TEXT, lineHeight:1.6,
          whiteSpace:'pre-wrap',
        }}>{item.desc}</div>
        {item.allegati.length > 0 && (
          <div style={{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}}>
            {item.allegati.map((a, i) => <Attachment key={i} a={a}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cert request card (standardizzata, solo allegati) ──────────────────────
function CertCard({ certTipo, scadenza, senderName, senderEmail, localeId, localeName, data, allegati }) {
  return (
    <div style={{
      background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12,
      overflow:'hidden',
      boxShadow:'0 1px 2px rgba(15,17,21,0.04)',
    }}>
      {/* Header riassunto */}
      <div style={{padding:'16px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:14}}>
        <div style={{width:38, height:38, borderRadius:10, background:ADM.WARN_SOFT, color:ADM.WARN, display:'grid', placeItems:'center', flexShrink:0}}>
          <BuIcons.shield size={23}/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.005em'}}>
            {certTipo?.label || '—'}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>
            Ente {certTipo?.ente || '—'}
            {scadenza && <> · scadenza {fmtDate(scadenza)}</>}
            <> · inviata {fmtRelative(data)}</>
          </div>
        </div>
      </div>

      {/* Locale di riferimento (non selezionabile: è del mittente) */}
      <div style={{padding:'14px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <div>
          <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>Locale</div>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{localeName || '—'}</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:1, fontFamily:'ui-monospace,monospace'}}>{localeId}</div>
        </div>
        <div>
          <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>Profilo</div>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{senderName}</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:1}}>{senderEmail}</div>
        </div>
      </div>

      {/* Allegati */}
      <div style={{padding:'14px 18px'}}>
        <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10}}>
          {allegati.length === 1 ? 'Documento allegato' : `${allegati.length} documenti allegati`}
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {allegati.map((a, i) => <Attachment key={i} a={a}/>)}
        </div>
      </div>
    </div>
  );
}

function ComposerTab({ active, onClick, label, icon, accent }) {
  const Icon = BuIcons[icon];
  const c = accent ? ADM[accent] : ADM.PINK;
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'6px 11px',
      background: active ? (accent ? `${c}1A` : ADM.PINK_BG_SOFT) : 'transparent',
      color: active ? c : ADM.MUTED,
      border:`1px solid ${active ? c : ADM.BORDER}`,
      borderRadius:7, fontSize:13.3, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
      transition:'all 0.15s',
    }}>
      <Icon size={16}/>
      {label}
    </button>
  );
}

function Attachment({ a }) {
  const isPdf = a.kind === 'pdf' || /\.pdf$/i.test(a.name);
  const Icon = BuIcons[isPdf ? 'filePdf' : 'image'];
  const color = isPdf ? ADM.DANGER : ADM.PURPLE;
  return (
    <button style={{
      display:'inline-flex', alignItems:'center', gap:10,
      padding:'9px 14px',
      background:'#fff',
      border:`1px solid ${ADM.BORDER}`,
      borderRadius:9,
      fontFamily:'inherit', cursor:'pointer',
      transition:'all 0.15s',
      textAlign:'left',
    }}>
      <div style={{
        width:30, height:30, borderRadius:7,
        background:`${color}1A`, color,
        display:'grid', placeItems:'center', flexShrink:0,
      }}>
        <Icon size={19}/>
      </div>
      <div style={{minWidth:0}}>
        <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT, letterSpacing:'-0.005em'}}>{a.name}</div>
        <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:1}}>{a.size}</div>
      </div>
      <BuIcons.download size={18} color={ADM.MUTED}/>
    </button>
  );
}

window.AdmComunicazioniPage = AdmComunicazioniPage;
