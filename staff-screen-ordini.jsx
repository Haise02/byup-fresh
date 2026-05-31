// byup Staff — Ordini (gestione cucina) + Ordini passati

const { useState: useStateO } = React;

function ScreenOrdini({ nav, openModal }) {
  const [tab, setTab] = useStateO('da-inviare');
  const [catFilter, setCatFilter] = useStateO('tutti');

  const allOrders = CODA_CUCINA;
  const counts = {
    'da-inviare': allOrders.filter(o => o.stato === 'da-inviare').length,
    'attivo': allOrders.filter(o => o.stato === 'attivo').length,
    'pronto': allOrders.filter(o => o.stato === 'pronto').length,
  };
  const filtered = allOrders.filter(o => o.stato === tab);

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 110 }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '64px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Coda cucina · live
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5, marginTop: 2 }}>
              Ordini
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => nav.push({ s: 'ordini-passati' })} style={{
              width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
              background: ST.SURF_ALT, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} title="Ordini passati"><I.Clock s={18}/></button>
            <button onClick={() => openModal({ kind: 'notifiche' })} style={{
              width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
              background: ST.SURF_ALT, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <I.Bell s={18}/>
              <span style={{
                position: 'absolute', top: 8, right: 9, width: 8, height: 8,
                borderRadius: ST.R_PILL, background: ST.PINK_DARK,
                border: '2px solid ' + ST.SURF_ALT,
              }}/>
            </button>
          </div>
        </div>

        {/* Categoria icone (filtro tipo) */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {[
            { id: 'tutti', label: 'Tutti', icon: <I.Tables s={18}/> },
            { id: 'cibo', label: 'Cibo', icon: <span style={{ fontSize: 18 }}>🍝</span> },
            { id: 'bevande', label: 'Bevande', icon: <span style={{ fontSize: 18 }}>🥂</span> },
            { id: 'extra', label: 'Extra', icon: <span style={{ fontSize: 18 }}>+</span> },
          ].map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)} style={{
              flex: 1, height: 54, padding: 6, borderRadius: ST.R_MD,
              border: catFilter === c.id ? `1.5px solid ${ST.TEXT}` : `1px solid ${ST.BORDER_SOFT}`,
              background: catFilter === c.id ? ST.SURF_ALT : '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {c.icon}
              <span style={{ fontSize: 10.5, fontWeight: 600, color: ST.TEXT }}>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {[
            { id: 'da-inviare', label: 'Da inviare', n: counts['da-inviare'], c: ST.PINK_SOFT, cText: ST.PINK_DARK },
            { id: 'attivo', label: 'In cucina', n: counts['attivo'], c: ST.ST_BOOKED_BG, cText: ST.ST_BOOKED },
            { id: 'pronto', label: 'Pronti', n: counts['pronto'], c: ST.ST_READY_BG, cText: ST.ST_READY },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '10px 8px',
              borderRadius: ST.R_MD,
              border: 'none',
              background: tab === t.id ? t.c : ST.SURF_ALT,
              color: tab === t.id ? t.cText : ST.MUTED,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3, lineHeight: 1 }}>{t.n}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.2 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ background: '#fff', borderRadius: ST.R_LG, padding: '40px 24px', textAlign: 'center', boxShadow: ST.SH_SM }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{tab === 'pronto' ? '✨' : tab === 'attivo' ? '⏳' : '📝'}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: ST.TEXT }}>Tutto in regola</div>
            <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 4 }}>
              {tab === 'pronto' && 'Nessun piatto pronto da consegnare.'}
              {tab === 'attivo' && 'Nessun ordine in cucina.'}
              {tab === 'da-inviare' && 'Nessun ordine in attesa di invio.'}
            </div>
          </div>
        )}
        {filtered.map((g, i) => <CodaCard key={i} g={g} tab={tab} openModal={openModal}/>)}
      </div>
    </div>
  );
}

function CodaCard({ g, tab, openModal }) {
  const [open, setOpen] = useStateO(true);
  const [sel, setSel] = useStateO({});
  const totalQty = g.piatti.reduce((s, p) => s + p.qty, 0);
  const selCount = Object.values(sel).filter(Boolean).length;

  const cfg = {
    'da-inviare': { c: ST.PINK_DARK, label: 'da inviare', actionLabel: 'Invia', actionVar: 'pink' },
    'attivo': { c: ST.ST_BOOKED, label: `da ${g.minutiInCucina}min`, actionLabel: 'Annulla', actionVar: 'danger' },
    'pronto': { c: ST.ST_READY, label: `pronto da ${g.minutiPronto}min`, actionLabel: 'Consegna', actionVar: 'pink' },
  }[tab];

  return (
    <div style={{
      background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden',
      boxShadow: ST.SH_SM,
      border: tab === 'pronto' ? `1.5px solid ${cfg.c}` : `1px solid ${ST.BORDER_SOFT}`,
    }}>
      <div onClick={() => setOpen(!open)} style={{
        padding: '14px 14px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: ST.R_MD,
            background: tab === 'pronto' ? ST.ST_READY_BG : ST.SURF_ALT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: tab === 'pronto' ? ST.ST_READY : ST.TEXT,
          }}>T{g.tavolo}</div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: ST.TEXT }}>
              Tavolo {g.tavolo}
            </div>
            <div style={{ fontSize: 11.5, color: cfg.c, fontWeight: 700, marginTop: 2, letterSpacing: 0.3 }}>
              {totalQty} piatt{totalQty === 1 ? 'o' : 'i'} · {cfg.label}
            </div>
          </div>
        </div>
        <I.ChevDown s={16} c={ST.MUTED} style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 200ms' }}/>
      </div>

      {open && (
        <>
          <div style={{ padding: '4px 14px 12px' }}>
            {g.piatti.map((p, i) => (
              <div key={p.id} onClick={() => setSel({ ...sel, [p.id]: !sel[p.id] })} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderTop: i === 0 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
                borderBottom: `1px solid ${ST.BORDER_SOFT}`,
                cursor: 'pointer',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `2px solid ${sel[p.id] ? ST.PINK_DARK : ST.MUTED_3}`,
                  background: sel[p.id] ? ST.PINK_DARK : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {sel[p.id] && <I.Check s={12} c="#fff"/>}
                </span>
                <span style={{
                  width: 28, height: 24, borderRadius: 6, background: ST.SURF_ALT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>{p.qty}×</span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: ST.TEXT }}>{p.nome}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, padding: '0 14px 14px' }}>
            {tab === 'pronto' && (
              <>
                <Btn variant="danger" size="md" full onClick={() => {}}>Annulla</Btn>
                <Btn variant="primary" size="md" full onClick={() => openModal({ kind: 'success', text: 'Piatti consegnati al tavolo' })}>
                  {selCount > 0 ? `Consegna ${selCount}` : 'Consegna tutti'}
                </Btn>
              </>
            )}
            {tab === 'attivo' && (
              <>
                <Btn variant="danger" size="md" full onClick={() => {}}>Annulla</Btn>
                <Btn variant="secondary" size="md" full onClick={() => openModal({ kind: 'success', text: 'Avviso inviato in cucina' })}>Sollecita</Btn>
              </>
            )}
            {tab === 'da-inviare' && (
              <>
                <Btn variant="danger" size="md" full onClick={() => {}}>Annulla</Btn>
                <Btn variant="primary" size="md" full onClick={() => openModal({ kind: 'success', text: 'Ordine inviato alla cucina' })}>Invia ordine</Btn>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Ordini passati ─────────────────────────────────────────
function ScreenOrdiniPassati({ nav, openModal }) {
  const past = [
    { id: 'p1', tavolo: 23, piatti: ['Carbonara', 'Carbonara', 'Tiramisù'], when: 'Ieri 21:35', tot: 48 },
    { id: 'p2', tavolo: 12, piatti: ['Aperol Spritz', 'Aperol Spritz', 'Olive'], when: 'Ieri 19:50', tot: 22 },
    { id: 'p3', tavolo: 8,  piatti: ['Branzino', 'Cacio e pepe'], when: 'Lun 21:10', tot: 56 },
  ];
  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 110 }}>
      <div style={{ background: '#fff', padding: '54px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Back s={18}/></button>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.3 }}>Ordini passati</div>
        </div>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {past.map(p => (
          <div key={p.id} style={{
            background: '#fff', borderRadius: ST.R_LG, padding: 14,
            boxShadow: ST.SH_SM,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>Tavolo {p.tavolo}</div>
                <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>{p.when}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>€{p.tot}</div>
            </div>
            <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 8, lineHeight: 1.5 }}>
              {p.piatti.join(' · ')}
            </div>
            <button onClick={() => openModal({ kind: 'success', text: 'Ordine ripetuto' })} style={{
              marginTop: 10, height: 36, padding: '0 14px', borderRadius: ST.R_PILL,
              border: `1.5px solid ${ST.BORDER}`, background: '#fff',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Ripeti ordine</button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenOrdini, ScreenOrdiniPassati });
