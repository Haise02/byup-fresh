// Sala v3 — Tab Tavoli (no timeline, card compatte, mappa+lista)

function SalaV3Tavoli({ tweaks, onOpenAdd, onOpenPay, onAddArticle, cart, onCartChange, onConfirmCart, onToggleFocus, focus, onAdjustCoperti }) {
  const [search, setSearch] = React.useState('');
  const [room, setRoom] = React.useState('Sala principale');
  const [filter, setFilter] = React.useState('Tutti');
  const [view, setView] = React.useState(tweaks.defaultView || 'mappa');
  const [expandedId, setExpandedId] = React.useState(null);

  const counts = React.useMemo(() => ({
    Tutti: SALA_V3_TAVOLI.length,
    Liberi: SALA_V3_TAVOLI.filter(t=>t.state==='libero').length,
    Prenotati: SALA_V3_TAVOLI.filter(t=>t.state==='prenotato').length,
    Occupati: SALA_V3_TAVOLI.filter(t=>t.state==='occupato').length,
    'Da pulire': SALA_V3_TAVOLI.filter(t=>t.state==='dapulire').length,
  }), []);
  const filterMap = { 'Tutti': null, 'Liberi':'libero', 'Prenotati':'prenotato', 'Occupati':'occupato', 'Da pulire':'dapulire' };

  // Conta tavoli con alert (non hanno ordinato da troppo)
  const alerts = SALA_V3_TAVOLI.filter(t => {
    if (t.state !== 'occupato') return null;
    const phase = getOccupiedPhase(t);
    return phase?.tone === 'alert';
  });

  // Match function: chi soddisfa filtro stato + ricerca
  const matchTavolo = (t) => {
    const matchState = !filterMap[filter] || t.state === filterMap[filter];
    if (!search.trim()) return matchState;
    const q = search.toLowerCase();
    const inId = String(t.id).includes(q);
    const inParty = (t.party || '').toLowerCase().includes(q);
    const inNext = (t.nextReservation?.name || '').toLowerCase().includes(q);
    return matchState && (inId || inParty || inNext);
  };
  // Lista: filtra (rimuove i non match — scrollabile)
  const visibili = SALA_V3_TAVOLI.filter(matchTavolo);
  // Mappa: tutti i tavoli sempre visibili (la disposizione fisica è significativa); i non-match sono dimmed
  const dimmedIds = React.useMemo(() => {
    const isFiltering = filterMap[filter] || search.trim();
    if (!isFiltering) return new Set();
    return new Set(SALA_V3_TAVOLI.filter(t => !matchTavolo(t)).map(t => t.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  // KPI cards = filtri della pagina. key allineato al filterMap (Liberi/Prenotati/...)
  // così il click sul KPI setta direttamente il filtro. Toggle off → ritorna a "Tutti".
  const kpiCards = [
    {key: 'Liberi',    label: 'Liberi',    value: counts.Liberi,       accent: '#16A34A', soft: '#DCFCE7', icon: 'M5 13l4 4L19 7'},
    {key: 'Prenotati', label: 'Prenotati', value: counts.Prenotati,    accent: '#3B82F6', soft: '#DBEAFE', icon: 'M3 4h18v18H3z M3 10h18 M8 2v4 M16 2v4'},
    {key: 'Occupati',  label: 'Occupati',  value: counts.Occupati,     accent: '#FF5A5F', soft: '#FFE0DD', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'},
    {key: 'Da pulire', label: 'Da pulire', value: counts['Da pulire'], accent: '#A16207', soft: '#FEF3C7', icon: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'},
  ];
  const totale = counts.Tutti;
  const occPct = totale ? Math.round((counts.Occupati / totale) * 100) : 0;
  const toggleFilter = (key) => setFilter(prev => prev === key ? 'Tutti' : key);

  return (
    <div>
      {/* Banner unico: KPI clickable filtri + view toggle + search + room + focus */}
      <div style={{
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
        padding: 12, marginBottom: 12,
      }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 1fr', gap: 10,
      }}>
        {kpiCards.map(kpi => {
          const isActive = filter === kpi.key;
          return (
          <button
            key={kpi.key}
            onClick={() => toggleFilter(kpi.key)}
            style={{
              background: isActive ? kpi.soft : PN.WHITE, borderRadius: 12,
              border: `1px solid ${isActive ? kpi.accent : PN.BORDER_HAIR}`,
              boxShadow: isActive
                ? `0 8px 20px ${kpi.accent}24, 0 1px 2px rgba(15,17,21,0.04), inset 0 1px 0 rgba(255,255,255,0.5)`
                : '0 1px 0 rgba(15,17,21,0.04), 0 4px 12px rgba(15,17,21,0.03)',
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              transition: 'transform 200ms ease-out, box-shadow 200ms ease-out, background 200ms ease-out, border-color 200ms ease-out',
              transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${kpi.accent}1A, 0 1px 2px rgba(15,17,21,0.04)`; }}}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(15,17,21,0.04), 0 4px 12px rgba(15,17,21,0.03)'; }}}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: isActive ? kpi.accent : kpi.soft,
              color: isActive ? '#fff' : kpi.accent,
              display: 'grid', placeItems: 'center', flexShrink: 0,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
              transition: 'background 200ms ease-out, color 200ms ease-out',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={kpi.icon}/>
              </svg>
            </div>
            <div style={{minWidth: 0, flex: 1}}>
              <div style={{
                fontSize: 11, color: isActive ? kpi.accent : PN.MUTED,
                fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
              }}>{kpi.label}</div>
              <div style={{fontSize: 22, fontWeight: 600, color: PN.TEXT, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginTop: 4}}>
                {kpi.value}
              </div>
            </div>
            {isActive && (
              <span style={{
                position: 'absolute', top: 8, right: 8,
                width: 16, height: 16, borderRadius: 999,
                background: kpi.accent, color: '#fff',
                display: 'grid', placeItems: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
            )}
          </button>
          );
        })}
        {/* Riempimento card — più ampia con barra progresso */}
        <div style={{
          background: 'linear-gradient(135deg, #FFE0DD 0%, #FFF5F4 100%)',
          borderRadius: 12,
          border: `1px solid rgba(255, 90, 95, 0.20)`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(15,17,21,0.04), 0 4px 12px rgba(255, 90, 95, 0.06)',
          padding: '12px 14px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6}}>
            <span style={{fontSize: 11, color: PN.PINK_DARK, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase'}}>Riempimento</span>
            <span style={{
              fontSize: 18, fontWeight: 600, color: PN.PINK_DARK,
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
              marginLeft: 'auto',
            }}>{occPct}%</span>
          </div>
          <div style={{height: 6, background: 'rgba(255, 255, 255, 0.6)', borderRadius: 99, overflow: 'hidden'}}>
            <div style={{
              width: `${occPct}%`, height: '100%',
              background: `linear-gradient(90deg, ${PN.PINK} 0%, ${PN.PINK_DARK} 100%)`,
              borderRadius: 99,
              transition: 'width 600ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}/>
          </div>
          <div style={{fontSize: 11, color: PN.PINK_DARK, opacity: 0.78, marginTop: 4}}>
            {counts.Occupati} occupati su {totale}
          </div>
        </div>
      </div>

      {/* Riga 2 — view toggle + search + room + reset filtro + focus.
          Filter chip duplicati (Tutti / Liberi / Prenotati / ...) RIMOSSI:
          stesso ruolo dei 4 KPI cliccabili sopra. */}
      <div style={{
        paddingTop: 10, marginTop: 10,
        borderTop: `1px solid ${PN.BORDER_HAIR}`,
      }}>
        <div style={{display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap'}}>
          {/* View toggle — Apple segmented con sliding pill */}
          <div style={{
            position: 'relative',
            display: 'inline-grid', gridTemplateColumns: '1fr 1fr',
            padding: 3, borderRadius: 9,
            background: PN.WHITE_FROST,
            boxShadow: 'inset 0 1px 1px rgba(15, 17, 21, 0.04)',
          }}>
            <span style={{
              position: 'absolute',
              top: 3, left: view === 'mappa' ? 3 : 'calc(50% + 0px)',
              width: 'calc(50% - 3px)', height: 'calc(100% - 6px)',
              background: PN.WHITE,
              borderRadius: 7,
              boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,17,21,0.08)',
              transition: 'left 280ms cubic-bezier(0.32, 0.72, 0, 1)',
              pointerEvents: 'none',
            }}/>
            {[{id: 'mappa', label: 'Mappa'}, {id: 'lista', label: 'Lista'}].map(v => {
              const on = view === v.id;
              return (
                <button key={v.id} onClick={() => setView(v.id)} style={{
                  position: 'relative', zIndex: 1,
                  padding: '7px 18px', borderRadius: 7,
                  background: 'transparent',
                  color: on ? PN.TEXT : PN.MUTED,
                  border: 'none', fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'color 200ms ease-out',
                }}>{v.label}</button>
              );
            })}
          </div>

          <div style={{flex: '1 1 240px', minWidth: 200}}>
            <PnSearchInput value={search} onChange={setSearch} placeholder="Cerca tavolo o cliente"/>
          </div>
          <SaSelect value={room} onChange={setRoom} options={['Sala principale','Sala terrazza','Privé']}/>

          {/* Filter chip duplicati RIMOSSI: i filtri sono i 4 KPI cliccabili sopra.
              Resta solo il "Mostra tutti" per resettare il filtro. */}
          {filter !== 'Tutti' && (
            <button onClick={() => setFilter('Tutti')} style={{
              padding: '7px 12px', borderRadius: 8,
              background: PN.WHITE_HUSH, color: PN.TEXT,
              border: `1px solid ${PN.BORDER_HAIR}`,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <PnI.X size={11} color={PN.MUTED}/> Mostra tutti
            </button>
          )}

          {/* Alert globale tavoli senza ordine — rimosso: l'info è gi\u00e0 nelle card via stato implicito */}

          {onToggleFocus && (
            <button onClick={onToggleFocus} style={{
              marginLeft:'auto',
              padding:'7px 12px', borderRadius: 8,
              background:'#fff', color:'#0F1115',
              border:'1px solid #E5E7EB',
              fontSize: 12.5, fontWeight: 600,
              cursor:'pointer', fontFamily:'inherit',
              display:'inline-flex', alignItems:'center', gap: 6,
            }}>
              <SvIconV3 path="M3 7V5a2 2 0 0 1 2-2h2 M17 3h2a2 2 0 0 1 2 2v2 M21 17v2a2 2 0 0 1-2 2h-2 M7 21H5a2 2 0 0 1-2-2v-2"/>
              Schermo intero
            </button>
          )}
        </div>
      </div>
      </div>{/* /banner unico — chiude wrapper KPI + filter row uniti */}

      {/* Vista */}
      {view === 'mappa'
        ? <SalaV3FloorPlan tavoli={SALA_V3_TAVOLI} dimmedIds={dimmedIds} onOpenAdd={onOpenAdd} onOpenPay={onOpenPay}
            onAddArticle={onAddArticle} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
            expandedId={expandedId} setExpandedId={setExpandedId} onAdjustCoperti={onAdjustCoperti}/>
        : <SalaV3ListView tavoli={visibili} onOpenAdd={onOpenAdd} onOpenPay={onOpenPay}
            onAddArticle={onAddArticle} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
            expandedId={expandedId} setExpandedId={setExpandedId} onAdjustCoperti={onAdjustCoperti}/>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// List view — griglia di card compatte
// ─────────────────────────────────────────────────────────
function SalaV3ListView({ tavoli, onOpenAdd, onOpenPay, onAddArticle, cart, onCartChange, onConfirmCart, expandedId, setExpandedId, onAdjustCoperti }) {
  // Sort: alert prima, poi prenotazioni urgenti, poi occupati, poi liberi, poi pulire
  const sorted = [...tavoli].sort((a,b) => {
    const score = (t) => {
      if (t.state === 'occupato') {
        const ph = getOccupiedPhase(t);
        if (ph?.tone === 'alert') return 0;
        if (ph?.tone === 'pink') return 1;
      }
      if (t.state === 'prenotato' && t.nextReservation?.inMin <= 15) return 2;
      if (t.note?.type === 'allergia') return 3;
      if (t.state === 'occupato') return 4;
      if (t.state === 'prenotato') return 5;
      if (t.state === 'dapulire') return 6;
      return 7;
    };
    return score(a) - score(b);
  });

  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10, alignItems:'start'}}>
      {sorted.map(t => (
        <SalaV3Card key={t.id} t={t}
          expanded={expandedId === t.id}
          onToggle={()=>setExpandedId(id => id === t.id ? null : t.id)}
          onAdd={()=>onOpenAdd(t)} onPay={()=>onOpenPay(t)}
          onAddArticle={onAddArticle} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
          onAdjustCoperti={(n) => onAdjustCoperti && onAdjustCoperti(t.id, n)}/>
      ))}
      {sorted.length === 0 && (
        <div style={{
          gridColumn:'1/-1', padding: 50, textAlign:'center',
          color:'#6B7280', fontSize: 14,
          background:'#fff', borderRadius: 12,
          border:'1px dashed #E5E7EB',
        }}>Nessun tavolo trovato.</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Floor plan view
// ─────────────────────────────────────────────────────────
function SalaV3FloorPlan({ tavoli, dimmedIds, onOpenAdd, onOpenPay, onAddArticle, cart, onCartChange, onConfirmCart, expandedId, setExpandedId, onAdjustCoperti }) {
  const isDimmed = (id) => dimmedIds && dimmedIds.has(id);
  const positions = {
    1:{x:1, y:1, shape:'round', size:1.1},  2:{x:3, y:1, shape:'round', size:0.9},
    3:{x:5, y:1, shape:'rect',  size:1.4},  4:{x:8, y:1, shape:'round', size:1.1},
    5:{x:10, y:1, shape:'round', size:0.9},
    6:{x:1, y:3, shape:'round', size:1.1},  7:{x:3, y:3, shape:'rect', size:1.7},
    8:{x:6, y:3, shape:'round', size:0.9},  9:{x:8, y:3, shape:'round', size:1.1},
    10:{x:10, y:3, shape:'rect', size:1.5},
    11:{x:1, y:5, shape:'round', size:1.1}, 12:{x:3, y:5, shape:'round', size:1.1},
    13:{x:5, y:5, shape:'round', size:0.9}, 14:{x:7, y:5, shape:'round', size:1.1},
    15:{x:9, y:5, shape:'rect', size:1.5},
    16:{x:1, y:6.5, shape:'round', size:0.9}, 17:{x:3, y:6.5, shape:'round', size:1.1},
    18:{x:6, y:6.5, shape:'rect', size:1.8},
  };

  const CELL = 75;
  const COLS = 12, ROWS = 8;
  const H = ROWS * CELL;
  const [hovered, setHovered] = React.useState(null);
  const detailedTable = expandedId ? tavoli.find(t=>t.id===expandedId) : (hovered ? tavoli.find(t=>t.id===hovered) : null);

  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12}}>
      {/* Container mappa — design 2.1: bg WHITE + border hairline + shadow doppia */}
      <div style={{
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 20px rgba(15,17,21,0.04)',
        padding: 14,
      }}>
        <div style={{
          position: 'relative',
          width: '100%', height: H * 0.78,
          // Floor: gradient dot pattern morbido invece di griglia rigida
          background: `
            radial-gradient(circle, rgba(15, 17, 21, 0.05) 1px, transparent 1px) 0 0/${CELL*0.78}px ${CELL*0.78}px,
            linear-gradient(180deg, #FAFAF8 0%, #F5F5F2 100%)
          `,
          borderRadius: 12,
          border: `1px solid ${PN.BORDER_HAIR}`,
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(15, 17, 21, 0.04)',
        }}>
          {/* Pareti floor — più sottili, accent BRAND tinted invece del wine */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: 'linear-gradient(90deg, transparent, rgba(255, 90, 95, 0.20), transparent)'}}/>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, transparent, rgba(255, 90, 95, 0.20), transparent)'}}/>

          {/* Badge CUCINA — gradient brand dark con inset highlight */}
          <div style={{
            position: 'absolute', right: 12, top: 12,
            background: 'linear-gradient(180deg, #2A2D36 0%, #15171C 100%)',
            color: '#fff',
            padding: '6px 12px', borderRadius: 8,
            fontSize: 10.5, fontWeight: 600, letterSpacing: 0.4,
            border: '1px solid rgba(0, 0, 0, 0.32)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.10)',
          }}>CUCINA</div>
          {/* Badge BAR — gradient cool */}
          <div style={{
            position: 'absolute', left: 14, bottom: 14,
            background: 'linear-gradient(180deg, #94BCD0 0%, #6FA0BC 100%)',
            color: '#fff',
            padding: '6px 12px', borderRadius: 8,
            fontSize: 10.5, fontWeight: 600, letterSpacing: 0.4,
            border: '1px solid rgba(0, 0, 0, 0.10)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.30)',
          }}>BAR</div>

          {tavoli.map(t => {
            const p = positions[t.id];
            if (!p) return null;
            const meta = SALA_V3_STATE_META[t.state];
            const w = p.shape === 'rect' ? p.size * CELL : p.size * CELL * 0.78;
            const h = p.shape === 'rect' ? p.size * CELL * 0.55 : p.size * CELL * 0.78;
            const left = p.x * CELL * 0.78;
            const top = p.y * CELL * 0.78;
            const phase = t.state === 'occupato' ? getOccupiedPhase(t) : null;
            const isAllergia = t.note?.type === 'allergia';
            const isNoOrderAlert = phase?.id === 'alert';
            const urgent = isNoOrderAlert || isAllergia;
            const ringColor = isNoOrderAlert ? '#DC2626'
              : (isAllergia ? '#DC2626' : meta.dot);

            const dim = isDimmed(t.id);
            const isHovered = hovered === t.id;

            return (
              <div key={t.id}
                onMouseEnter={()=>setHovered(t.id)}
                onMouseLeave={()=>setHovered(null)}
                onClick={() => setExpandedId(t.id)}
                style={{
                  position:'absolute',
                  left, top, width: w, height: h,
                  background: dim ? '#F4F5F7' : (meta.mapBg || meta.bg),
                  border: `2px solid ${dim ? '#E5E7EB' : ringColor}`,
                  borderRadius: p.shape === 'round' ? '50%' : 8,
                  cursor:'pointer',
                  display:'grid', placeItems:'center',
                  boxShadow: isHovered && !dim ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                  transition:'all 0.18s',
                  zIndex: isHovered ? 5 : 1,
                  opacity: dim ? (isHovered ? 0.65 : 0.35) : 1,
                  filter: dim ? 'grayscale(1)' : 'none',
                }}>
                <div style={{textAlign:'center', lineHeight: 1.15}}>
                  <div style={{fontSize: 13, fontWeight: 800, color: dim ? '#9CA3AF' : '#0F1115'}}>{t.id}</div>
                  {!dim && t.state === 'occupato' && t.conto > 0 && (
                    <div style={{fontSize: 9.5, fontWeight: 700, color: meta.accent}}>
                      €{t.conto.toFixed(0)}
                    </div>
                  )}
                  {!dim && t.state === 'occupato' && t.conto === 0 && (
                    <div style={{fontSize: 8.5, fontWeight: 600, color: meta.accent}}>{t.sittingMin}'</div>
                  )}
                  {!dim && t.state === 'libero' && (
                    <div style={{fontSize: 8.5, fontWeight: 600, color:'#16A34A'}}>{t.posti}p</div>
                  )}
                  {!dim && t.state === 'prenotato' && t.nextReservation && (
                    <div style={{fontSize: 8.5, fontWeight: 700, color: meta.accent, fontVariantNumeric:'tabular-nums'}}>{t.nextReservation.time}</div>
                  )}
                  {!dim && t.state === 'dapulire' && (
                    <div style={{fontSize: 8.5, fontWeight: 600, color: meta.accent}}>{t.freedMinAgo}' fa</div>
                  )}
                </div>

                {urgent && !dim && (
                  <div style={{
                    position: 'absolute', top: -8, right: -8,
                    background: '#DC2626', color: '#fff',
                    padding: '3px 5px', borderRadius: 999,
                    whiteSpace: 'nowrap',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <PnI.Alert size={10} color="#fff"/>
                  </div>
                )}

                {!dim && t.note?.type === 'allergia' && (
                  <div title={t.note.text} style={{
                    position: 'absolute', bottom: -6, left: -6,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#FEE2E2', color: '#DC2626',
                    border: '2px solid #fff',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <PnI.Alert size={10} color="#DC2626"/>
                  </div>
                )}
                {!dim && t.note && t.note.type !== 'allergia' && (
                  <div title={t.note.text} style={{
                    position:'absolute', bottom:-6, left:-6,
                    width: 16, height: 16, borderRadius:'50%',
                    background: NOTE_TYPE_META[t.note.type].bg,
                    color: NOTE_TYPE_META[t.note.type].color,
                    border:'1.5px solid #fff',
                    fontSize: 9, fontWeight: 800,
                    display:'grid', placeItems:'center',
                  }}>{NOTE_TYPE_META[t.note.type].icon}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side panel: detail tavolo OR riepilogo stati */}
      <div style={{alignSelf:'start'}}>
        {detailedTable ? (
          <SalaV3Card t={detailedTable}
            expanded={true}
            onToggle={()=>{}}
            onAdd={()=>onOpenAdd(detailedTable)}
            onPay={()=>onOpenPay(detailedTable)}
            onAddArticle={onAddArticle} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
            onAdjustCoperti={(n) => onAdjustCoperti && onAdjustCoperti(detailedTable.id, n)}/>
        ) : (
          <FloorPlanIdlePanel/>
        )}
      </div>
    </div>
  );
}

function FloorPlanIdlePanel() {
  const groups = [
    {state: 'occupato'},
    {state: 'prenotato'},
    {state: 'libero'},
    {state: 'dapulire'},
  ];
  return (
    <div style={{
      background: PN.WHITE, borderRadius: 14,
      border: `1px solid ${PN.BORDER_HAIR}`,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 20px rgba(15,17,21,0.04)',
      padding: 16,
    }}>
      <div style={{fontSize: 11, fontWeight: 600, color: PN.MUTED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 14}}>
        Stati sala
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {groups.map(g => {
          const meta = SALA_V3_STATE_META[g.state];
          const count = SALA_V3_TAVOLI.filter(t => t.state === g.state).length;
          return (
            <div key={g.state} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9,
              background: meta.mapBg || meta.bg,
              border: `1px solid ${meta.dot}1F`,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(2px)'; e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px ${meta.dot}1A`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.4)'; }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: meta.dot,
                boxShadow: `0 0 0 3px ${meta.dot}1F`,
              }}/>
              <span style={{flex: 1, fontSize: 13, fontWeight: 500, color: PN.TEXT}}>{meta.plural || meta.label}</span>
              <span style={{
                fontSize: 15, fontWeight: 600, color: meta.accent,
                fontVariantNumeric: 'tabular-nums',
              }}>{count}</span>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 12, padding: 10, borderRadius: 8,
        background: '#F8F9FB', fontSize: 11, color: '#6B7280', lineHeight: 1.5,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <PnI.Idea size={12} color="#6B7280"/> Click su un tavolo per vedere il dettaglio.
      </div>
    </div>
  );
}

function SvIconV3({ path, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path}/>
    </svg>
  );
}
window.SalaV3Tavoli = SalaV3Tavoli;
