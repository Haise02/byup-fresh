// Cucina — Tab "Storico ordini" — lista densa + accordion inline + day groups

function CucinaStorico() {
  const [search, setSearch]     = React.useState('');
  const [range,  setRange]      = React.useState('Ultimi 7 giorni');
  const [tipo,   setTipo]       = React.useState('Tutti');
  const [stat,   setStat]       = React.useState('Tutte');
  const [openIds, setOpenIds]   = React.useState(() => new Set());
  const [limit, setLimit]       = React.useState(40);

  const ranges = ['Oggi','Ieri','Ultimi 7 giorni','Questo mese'];
  const tipi   = ['Tutti','Sala','Asporto'];
  const stazioni = ['Tutte','Pizza','Primi','Secondi','Contorni','Bevande'];

  function toggle(id) {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // filter
  const allowedDayKeys = (() => {
    if (range === 'Oggi') return new Set(['oggi']);
    if (range === 'Ieri') return new Set(['ieri']);
    return new Set(['oggi','ieri','dom','sab']);
  })();

  const filtered = CUC_STORICO.filter(o => {
    if (!allowedDayKeys.has(o.day.dayKey)) return false;
    if (tipo === 'Sala' && o.kind !== 'sala') return false;
    if (tipo === 'Asporto' && o.kind !== 'asporto') return false;
    if (stat !== 'Tutte' && !o.stations.includes(stat)) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = [
        '#' + o.num,
        o.customer || '',
        o.cameriere,
        ...o.items.map(i => i.name),
        o.kind === 'sala' ? `t${o.table} tavolo ${o.table}` : 'asporto',
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const limited = filtered.slice(0, limit);

  // group by day for headers
  const groups = [];
  limited.forEach(o => {
    const last = groups[groups.length - 1];
    if (last && last.day.dayKey === o.day.dayKey) last.orders.push(o);
    else groups.push({ day: o.day, orders: [o] });
  });

  // totals per day for header (use full filtered count, not just visible)
  const dayTotals = {};
  filtered.forEach(o => {
    const k = o.day.dayKey;
    if (!dayTotals[k]) dayTotals[k] = { count: 0, sum: 0 };
    dayTotals[k].count++;
    dayTotals[k].sum += o.total;
  });

  function resetFilters() {
    setSearch(''); setRange('Ultimi 7 giorni'); setTipo('Tutti'); setStat('Tutte');
  }

  return (
    <div style={{
      background: PN.WHITE, borderRadius: 14,
      border: `1px solid ${PN.BORDER_SOFT}`,
      padding: 22,
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14, marginBottom: 16, flexWrap:'wrap'}}>
        <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>Storico ordini</div>
        <div style={{fontSize: 12, color: PN.MUTED}}>
          {filtered.length} ordini
        </div>
      </div>

      <div style={{display:'flex', gap: 10, marginBottom: 16, flexWrap:'wrap'}}>
        <div style={{flex: '1 1 280px', minWidth: 260}}>
          <PnSearchInput value={search} onChange={setSearch} placeholder="Cerca ordine, piatto, cliente, tavolo…"/>
        </div>
        <CuFilterDropdown label={range} options={ranges} onPick={setRange}/>
        <CuFilterDropdown label={tipo === 'Tutti' ? 'Tipo' : tipo} options={tipi} onPick={setTipo}/>
        <CuFilterDropdown label={stat === 'Tutte' ? 'Postazione' : stat} options={stazioni} onPick={setStat}/>
      </div>

      {/* Table header */}
      <div style={{
        display:'grid',
        gridTemplateColumns: '90px 1fr 110px 110px 100px 110px 24px',
        padding: '10px 14px',
        background: PN.BG,
        borderRadius: '10px 10px 0 0',
        border: `1px solid ${PN.BORDER_SOFT}`,
        borderBottom: 'none',
        fontSize: 11, fontWeight: 700, color: PN.MUTED,
        textTransform: 'uppercase', letterSpacing: 0.4,
        gap: 8,
      }}>
        <span>Ordine</span>
        <span>Tavolo / cliente</span>
        <span>Inserito</span>
        <span>Pronto</span>
        <span>Durata</span>
        <span>Piatti</span>
        <span/>
      </div>

      <div style={{
        border: `1px solid ${PN.BORDER_SOFT}`, borderTop: 'none',
        borderRadius: '0 0 10px 10px', overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <div style={{padding:'48px 16px', textAlign:'center'}}>
            <div style={{fontSize: 14, fontWeight: 600, color: PN.TEXT, marginBottom: 6}}>
              Nessun ordine corrisponde ai filtri
            </div>
            <div style={{fontSize: 12.5, color: PN.MUTED, marginBottom: 14}}>
              Prova a cambiare il periodo o i criteri di ricerca
            </div>
            <button onClick={resetFilters} style={{
              padding:'8px 16px', borderRadius: 999,
              background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
              fontSize: 13, fontWeight: 600, color: PN.TEXT,
              cursor:'pointer', fontFamily:'inherit',
            }}>Reset filtri</button>
          </div>
        ) : (
          <>
            {groups.map((g, gi) => (
              <React.Fragment key={g.day.dayKey}>
                <div style={{
                  display:'flex', alignItems:'baseline', gap: 10,
                  padding: '14px 14px 8px',
                  background: PN.WHITE,
                  borderTop: gi > 0 ? `1px solid ${PN.BORDER_SOFT}` : 'none',
                  position: 'sticky', top: 0, zIndex: 1,
                  flexWrap:'wrap',
                }}>
                  <span style={{fontSize: 12, fontWeight: 700, color: PN.TEXT, textTransform:'uppercase', letterSpacing: 0.5}}>
                    {g.day.label}
                  </span>
                  <span style={{fontSize: 12, color: PN.MUTED}}>{g.day.date}</span>
                  <span style={{flex: 1, minWidth: 0}}/>
                  <span style={{fontSize: 11.5, color: PN.MUTED, whiteSpace:'nowrap'}}>
                    {dayTotals[g.day.dayKey].count} ordini
                  </span>
                </div>
                {g.orders.map(o => (
                  <CuStoricoRow
                    key={o.num} order={o}
                    open={openIds.has(o.num)}
                    onToggle={() => toggle(o.num)}
                  />
                ))}
              </React.Fragment>
            ))}
            {limit < filtered.length && (
              <div style={{padding: '14px 16px', borderTop: `1px solid ${PN.BORDER_SOFT}`, textAlign:'center'}}>
                <button onClick={() => setLimit(l => l + 40)} style={{
                  padding:'8px 18px', borderRadius: 999,
                  background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
                  fontSize: 13, fontWeight: 600, color: PN.TEXT,
                  cursor:'pointer', fontFamily:'inherit',
                }}>Carica altri {Math.min(40, filtered.length - limit)} ordini</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Row ────────────────────────────────────────────────────
function CuStoricoRow({ order, open, onToggle }) {
  const isAnnullato = order.status === 'annullato';
  const isRiaperto  = order.status === 'riaperto';
  const piatti = order.items.reduce((s, i) => s + i.qty, 0);
  const ident = order.kind === 'sala'
    ? <span style={{fontSize: 13, fontWeight: 700, color: PN.TEXT}}>T{order.table}</span>
    : (
      <span style={{display:'inline-flex', alignItems:'center', gap: 6, minWidth: 0}}>
        <span style={{
          fontSize: 9.5, fontWeight: 700, padding:'2px 6px', borderRadius: 5,
          background: PN.BLUE_SOFT, color: PN.BLUE,
          textTransform:'uppercase', letterSpacing: 0.4, flexShrink: 0,
        }}>ASP</span>
        <span style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          {order.customer}
        </span>
      </span>
    );

  return (
    <div style={{borderTop: `1px solid ${PN.BORDER_SOFT}`}}>
      <div
        onClick={onToggle}
        style={{
          display:'grid',
          gridTemplateColumns: '90px 1fr 110px 110px 100px 110px 24px',
          padding: '12px 14px', alignItems: 'center',
          fontSize: 13, color: PN.TEXT,
          cursor: 'pointer',
          background: open ? '#FFF7FA' : PN.WHITE,
          borderLeft: open ? `3px solid ${PN.PINK_DARK}` : '3px solid transparent',
          gap: 8,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#FAFBFC'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = PN.WHITE; }}
      >
        <span style={{display:'inline-flex', alignItems:'center', gap: 6}}>
          <span style={{fontWeight: 700}}>#{order.num}</span>
          {isAnnullato && <CuStatusDot color={PN.RED} title="Annullato"/>}
          {isRiaperto  && <CuStatusDot color={PN.AMBER} title="Riaperto"/>}
        </span>
        <span style={{minWidth: 0}}>{ident}</span>
        <span style={{color: PN.MUTED}}>{order.start}</span>
        <span style={{color: PN.MUTED}}>{order.ready}</span>
        <span style={{
          color: order.cookMin > 25 ? PN.RED : order.cookMin > 18 ? PN.AMBER : PN.MUTED,
          fontWeight: order.cookMin > 18 ? 700 : 500,
        }}>{order.cookMin} min</span>
        <span style={{color: PN.MUTED}}>{piatti} {piatti === 1 ? 'piatto' : 'piatti'}</span>
        <span style={{
          color: PN.MUTED, fontSize: 14,
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
          textAlign: 'center',
        }}>›</span>
      </div>

      {open && <CuStoricoDetail order={order}/>}
    </div>
  );
}

function CuStatusDot({ color, title }) {
  return (
    <span title={title} style={{
      width: 7, height: 7, borderRadius:'50%', background: color, display: 'inline-block',
    }}/>
  );
}

// ─── Inline detail ─────────────────────────────────────────
function CuStoricoDetail({ order }) {
  return (
    <div style={{
      padding: '4px 16px 18px 30px',
      background: '#FFF7FA',
      borderLeft: `3px solid ${PN.PINK_DARK}`,
    }}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 18, paddingTop: 8}}>
        {/* Items */}
        <div>
          <div style={{fontSize: 11, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 8}}>
            Piatti
          </div>
          <div style={{display:'flex', flexDirection:'column', gap: 6}}>
            {order.items.map((it, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'flex-start', gap: 10,
                padding: '8px 12px', background: PN.WHITE, borderRadius: 8,
                border: `1px solid ${PN.BORDER_SOFT}`,
              }}>
                <span style={{
                  minWidth: 24, height: 24, borderRadius: 6,
                  background: PN.BG, color: PN.TEXT,
                  fontWeight: 700, fontSize: 11.5,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  flexShrink: 0,
                }}>{it.qty}×</span>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 13, fontWeight: 600, color: PN.TEXT}}>{it.name}</div>
                  {it.note && (
                    <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 2}}>{it.note}</div>
                  )}
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 600, color: PN.MUTED, background: PN.BG,
                  padding:'2px 7px', borderRadius: 999, textTransform:'uppercase', letterSpacing: 0.3,
                  flexShrink: 0,
                }}>{it.station}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Meta + actions */}
        <div>
          <div style={{fontSize: 11, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 8}}>
            Dettagli
          </div>
          <div style={{
            background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 8,
            padding: 14, display:'flex', flexDirection:'column', gap: 10, marginBottom: 14,
          }}>
            <CuDetailRow label="Inserito"  value={order.start}/>
            <CuDetailRow label="Pronto"    value={order.ready}/>
            <CuDetailRow label="Servito"   value={order.served}/>
            <CuDetailRow label="Durata"    value={`${order.cookMin} minuti`}/>
            <CuDetailRow label="Cameriere" value={order.cameriere}/>
            <CuDetailRow label="Postazioni" value={order.stations.join(', ')}/>
            <CuDetailRow label="Stato"
              value={
                <span style={{
                  fontSize: 11.5, fontWeight: 700, padding:'2px 8px', borderRadius: 999,
                  background: order.status === 'annullato' ? PN.RED_SOFT
                            : order.status === 'riaperto'  ? PN.AMBER_SOFT
                            : PN.GREEN_SOFT,
                  color: order.status === 'annullato' ? PN.RED
                       : order.status === 'riaperto'  ? PN.AMBER
                       : PN.GREEN,
                  textTransform:'capitalize',
                }}>{order.status}</span>
              }
            />
          </div>

          <div style={{display:'flex', gap: 8, flexWrap:'wrap'}}>
            <button style={{
              padding:'8px 14px', borderRadius: 999,
              background: PN.TEXT, color: PN.WHITE, border: 'none',
              fontSize: 12.5, fontWeight: 600, cursor:'pointer', fontFamily: 'inherit',
            }}>Riapri in cucina</button>
            <button style={{
              padding:'8px 14px', borderRadius: 999,
              background: PN.WHITE, color: PN.TEXT, border: `1px solid ${PN.BORDER}`,
              fontSize: 12.5, fontWeight: 600, cursor:'pointer', fontFamily: 'inherit',
            }}>Duplica</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CuDetailRow({ label, value }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12}}>
      <span style={{fontSize: 12, color: PN.MUTED, fontWeight: 500, flexShrink: 0}}>{label}</span>
      <span style={{fontSize: 12.5, color: PN.TEXT, fontWeight: 600, textAlign:'right', minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{value}</span>
    </div>
  );
}

// ─── Filter dropdown (preserved from old version) ──────────
function CuFilterDropdown({ label, options, onPick }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={() => setOpen(o => !o)} style={{
        padding:'10px 14px', borderRadius: 10,
        border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
        fontSize: 13, color: PN.TEXT, fontWeight: 500,
        cursor:'pointer', fontFamily:'inherit',
        display:'flex', alignItems:'center', gap: 8,
        minWidth: 140,
      }}>
        <span style={{flex:1, textAlign:'left'}}>{label}</span>
        <span style={{color: PN.MUTED}}>▾</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', right: 0,
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          minWidth: 160, zIndex: 10,
          padding: 4,
        }}>
          {options.map(o => (
            <button key={o} onClick={() => { onPick(o); setOpen(false); }} style={{
              display:'block', width:'100%', textAlign:'left',
              padding:'8px 10px', borderRadius: 6,
              background:'transparent', border:'none',
              fontSize: 13, color: PN.TEXT, cursor:'pointer',
              fontFamily:'inherit',
            }}
              onMouseEnter={e => e.currentTarget.style.background = PN.PINK_SOFT}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

window.CucinaStorico = CucinaStorico;
