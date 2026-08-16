// Sala — Tab Tavoli (table grid + actions, redesign narrativo)

const SALA_STATE_META = {
  libero:    { dot: PN.GREEN,   label: 'Libero',     bg: PN.WHITE,                 border: PN.BORDER_SOFT },
  prenotato: { dot: '#3B82F6',  label: 'Prenotato',  bg: '#EFF6FF',                border: '#BFDBFE' },
  occupato:  { dot: PN.AMBER,   label: 'Occupato',   bg: PN.WHITE,                 border: PN.BORDER_SOFT },
  dapulire:  { dot: PN.RED,     label: 'Da pulire',  bg: '#FEF2F2',                border: '#FECACA' },
};

function SalaTavoli({ onOpenAdd, onOpenConti, onOpenPay, onToggleFocus, focus }) {
  const [search, setSearch] = React.useState('');
  const [room, setRoom] = React.useState('Sala principale');
  const [filter, setFilter] = React.useState('Tutti');
  const filters = ['Tutti','Liberi','Prenotati','Occupati','Da pulire'];
  const filterMap = { 'Tutti': null, 'Liberi':'libero', 'Prenotati':'prenotato', 'Occupati':'occupato', 'Da pulire':'dapulire' };

  const visibili = SALA_TAVOLI.filter(t => {
    const matchState = !filterMap[filter] || t.state === filterMap[filter];
    if (!search.trim()) return matchState;
    const q = search.toLowerCase();
    const inId = String(t.id).includes(q);
    const inParty = (t.party || '').toLowerCase().includes(q);
    const inNext = (t.nextReservation?.name || '').toLowerCase().includes(q);
    return matchState && (inId || inParty || inNext);
  });

  return (
    <div>
      {/* KPI bar */}
      <SalaKpiBar/>

      {/* Filtri */}
      <div style={{
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_SOFT}`,
        padding: 14, marginBottom: 16,
      }}>
        <div style={{display:'flex', gap: 10, alignItems:'center', flexWrap:'nowrap'}}>
          <div style={{flex:'0 1 220px', minWidth: 160}}>
            <PnSearchInput value={search} onChange={setSearch} placeholder="Cerca tavolo"/>
          </div>
          <SaSelect value={room} onChange={setRoom} options={['Sala principale','Sala terrazza','Privé']}/>
          <div style={{display:'flex', gap: 6, flexShrink: 0}}>
            {filters.map(f => {
              const on = filter === f;
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding:'7px 14px', borderRadius: 999,
                  border: on ? 'none' : `1px solid ${PN.BORDER}`,
                  background: on ? PN.PINK_DARK : PN.WHITE,
                  color: on ? PN.WHITE : PN.TEXT,
                  fontSize: 12.5, fontWeight: 600,
                  cursor:'pointer', fontFamily:'inherit',
                }}>{f}</button>
              );
            })}
          </div>
          <button onClick={onOpenConti} style={{
            marginLeft:'auto',
            padding: '9px 18px', borderRadius: 999,
            background: PN.TEXT, color: PN.WHITE, border: 'none',
            fontSize: 13, fontWeight: 600, cursor:'pointer',
            fontFamily: 'inherit', whiteSpace:'nowrap',
          }}>Conti aperti</button>
          {onToggleFocus && (
            <button onClick={onToggleFocus} style={{
              padding: '9px 14px', borderRadius: 999,
              background: PN.WHITE, color: PN.TEXT,
              border: `1px solid ${PN.BORDER}`,
              fontSize: 13, fontWeight: 600,
              cursor:'pointer', fontFamily:'inherit',
              display:'inline-flex', alignItems:'center', gap: 6,
              whiteSpace:'nowrap',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
              </svg>
              Schermo intero
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 14}}>
        {visibili.map((t) => (
          <SalaTavoloCard
            key={t.id} t={t}
            onAdd={() => onOpenAdd(t)}
            onPay={() => onOpenPay(t)}
          />
        ))}
        {visibili.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            padding: 60, textAlign:'center',
            color: PN.MUTED, fontSize: 14,
            background: PN.WHITE, borderRadius: 14,
            border: `1px dashed ${PN.BORDER}`,
          }}>Nessun tavolo trovato.</div>
        )}
      </div>
    </div>
  );
}

function SalaKpiBar() {
  const k = SALA_KPI;
  const items = [
    { label: 'Tavoli totali', value: k.totale },
    { label: 'Occupati ora', value: `${k.occupati}/${k.totale}`, accent: PN.AMBER },
    { label: 'Ospiti byup', value: k.ospitByup, accent: PN.PINK_DARK },
    { label: 'Prenotazioni stasera', value: k.prenotazioniStasera },
    { label: 'Incassi oggi', value: `€${k.incassoOggi.toLocaleString('it-IT')}`, accent: PN.GREEN },
  ];
  return (
    <div style={{
      display:'grid', gridTemplateColumns:`repeat(${items.length}, 1fr)`,
      gap: 10, marginBottom: 16,
    }}>
      {items.map((it,i) => (
        <div key={i} style={{
          background: PN.WHITE, borderRadius: 12,
          border: `1px solid ${PN.BORDER_SOFT}`,
          padding: '14px 16px',
        }}>
          <div style={{fontSize: 11.5, color: PN.MUTED, fontWeight: 600, letterSpacing: 0.3, textTransform:'uppercase'}}>{it.label}</div>
          <div style={{fontSize: 22, fontWeight: 800, color: it.accent || PN.TEXT, marginTop: 4, letterSpacing: -0.4}}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function SalaTavoloCard({ t, onAdd, onPay }) {
  const [menu, setMenu] = React.useState(false);
  const meta = SALA_STATE_META[t.state];

  // CTA contestuali
  const ctas = (() => {
    if (t.state === 'libero') {
      return t.nextReservation
        ? [{ label: 'Apri tavolo', primary: true, onClick: onAdd }, { label: 'Vedi prenotazione', onClick: () => {} }]
        : [{ label: 'Apri tavolo', primary: true, onClick: onAdd }];
    }
    if (t.state === 'prenotato') {
      return [{ label: 'Segna arrivato', primary: true, onClick: onAdd }, { label: 'Dettagli', onClick: () => {} }];
    }
    if (t.state === 'occupato') {
      return [{ label: 'Aggiungi articolo', onClick: onAdd }, { label: 'Conto', primary: true, onClick: onPay }];
    }
    if (t.state === 'dapulire') {
      return [{ label: 'Riapri tavolo', primary: true, onClick: onAdd }];
    }
    return [];
  })();

  return (
    <div style={{
      background: meta.bg, borderRadius: 12,
      border: `1px solid ${meta.border}`,
      padding: 14, position:'relative',
      display:'flex', flexDirection:'column', gap: 10,
      minHeight: 175,
    }}>
      {/* Header: numero + capienza/coperti/byup + menu */}
      <div style={{display:'flex', alignItems:'center', gap: 8}}>
        <span style={{fontSize: 15.5, fontWeight: 800, color: PN.TEXT}}>Tavolo {t.id}</span>
        <span style={{fontSize: 12, color: PN.MUTED, fontWeight: 600}}>· {t.posti} posti</span>
        <span style={{flex:1}}/>

        {t.state === 'occupato' && (
          <span title={`${t.coperti} ospiti seduti`} style={{
            display:'flex', alignItems:'center', gap: 4,
            fontSize: 12, fontWeight: 700, color: PN.TEXT,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {t.coperti}
          </span>
        )}

        {t.byup > 0 && (
          <span title={`${t.byup} connessi via byup`} style={{
            display:'flex', alignItems:'center', gap: 4,
            fontSize: 11.5, fontWeight: 700, color: PN.PINK_DARK,
            background: '#FCE7F3', padding: '3px 8px', borderRadius: 999,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>
            {t.byup} byup
          </span>
        )}

        <button onClick={() => setMenu(m => !m)} style={{
          background:'transparent', border:'none', cursor:'pointer',
          padding: 4, color: PN.MUTED,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>
          </svg>
        </button>

        {menu && (
          <div style={{
            position:'absolute', top: 36, right: 12,
            background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            minWidth: 160, zIndex: 5, padding: 4,
          }}>
            {[
              {l:'Sposta tavolo'},
              {l:'Modifica coperti'},
              {l:'Stampa conto'},
              {l:'Libera tavolo', danger:true},
            ].map((m,i) => (
              <button key={i} onClick={() => setMenu(false)} style={{
                display:'block', width:'100%', textAlign:'left',
                padding:'8px 10px', borderRadius: 6,
                background:'transparent', border:'none',
                fontSize: 13, fontWeight: 500,
                color: m.danger ? PN.RED : PN.TEXT, cursor:'pointer',
                fontFamily:'inherit',
              }}
                onMouseEnter={e => e.currentTarget.style.background = PN.PINK_SOFT}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{m.l}</button>
            ))}
          </div>
        )}
      </div>

      {/* Body narrativo per stato */}
      <div style={{flex:1, display:'flex', flexDirection:'column', gap: 6}}>
        {t.state === 'libero' && (
          <>
            <div style={{fontSize: 13, color: PN.MUTED}}>{meta.label}</div>
            {t.nextReservation && (
              <div style={{fontSize: 12.5, color: PN.TEXT}}>
                Prenotato <b>{t.nextReservation.time}</b> · {t.nextReservation.name} ({t.nextReservation.posti}p)
              </div>
            )}
          </>
        )}

        {t.state === 'prenotato' && t.nextReservation && (
          <>
            <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>
              {t.nextReservation.time} · {t.nextReservation.name}
            </div>
            <div style={{fontSize: 12, color: PN.MUTED}}>
              {t.nextReservation.posti} posti · arriva tra {t.nextReservation.inMin} min
            </div>
          </>
        )}

        {t.state === 'occupato' && (
          <>
            <div style={{fontSize: 15, fontWeight: 800, color: PN.TEXT, lineHeight: 1.2}}>
              {t.party || 'Walk-in'}
            </div>
            <div style={{fontSize: 12, color: PN.MUTED}}>
              In tavolo da {t.sittingMin}'{t.kitchen && ` · ${t.kitchen}`}
            </div>
            <div style={{fontSize: 18, fontWeight: 800, color: PN.PINK_DARK, marginTop: 4, letterSpacing: -0.4}}>
              €{t.conto.toFixed(2)}
            </div>
            {t.note && (
              <div style={{
                fontSize: 11.5, color: '#92400E',
                background: '#FEF3C7', padding: '4px 8px', borderRadius: 6,
                marginTop: 2, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <PnI.Alert size={11} color="#92400E"/> {t.note}
              </div>
            )}
          </>
        )}

        {t.state === 'dapulire' && (
          <>
            <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>
              Tavolo da pulire
            </div>
            <div style={{fontSize: 12, color: PN.MUTED}}>
              Liberato {t.freedMinAgo} min fa
              {t.nextReservation && ` · prossima ${t.nextReservation.time}`}
            </div>
          </>
        )}
      </div>

      {/* CTA contestuali */}
      <div style={{display:'grid', gridTemplateColumns: ctas.length === 1 ? '1fr' : '1fr 1fr', gap: 8}}>
        {ctas.map((c, i) => (
          <button key={i} onClick={c.onClick} style={{
            padding:'9px 12px',
            background: c.primary ? PN.TEXT : PN.WHITE,
            color: c.primary ? PN.WHITE : PN.TEXT,
            border: c.primary ? 'none' : `1px solid ${PN.BORDER}`,
            borderRadius: 999, fontSize: 12.5, fontWeight: 600,
            cursor:'pointer', fontFamily:'inherit',
          }}>{c.label}</button>
        ))}
      </div>
    </div>
  );
}

function SaSelect({ value, onChange, options }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{position:'relative'}}>
      <button onClick={() => setOpen(o => !o)} style={{
        padding:'9px 14px', borderRadius: 8,
        border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
        fontSize: 13, color: PN.TEXT, fontWeight: 600,
        cursor:'pointer', fontFamily:'inherit',
        display:'flex', alignItems:'center', gap: 8,
        minWidth: 170,
      }}>
        <span style={{flex:1, textAlign:'left'}}>{value}</span>
        <span style={{color: PN.MUTED}}>▾</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left: 0,
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          minWidth: 170, zIndex: 10, padding: 4,
        }}>
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{
              display:'block', width:'100%', textAlign:'left',
              padding:'7px 10px', borderRadius: 6,
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

window.SalaTavoli = SalaTavoli;
window.SaSelect = SaSelect;
