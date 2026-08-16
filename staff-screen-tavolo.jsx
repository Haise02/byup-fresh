// byup Staff — Tavolo Detail (hub di un singolo tavolo)

const { useState: useStateT } = React;

function ScreenTavolo({ nav, openModal, tavoloId }) {
  const t = TAVOLI.find(x => x.id === tavoloId) || TAVOLI[0];
  const [tab, setTab] = useStateT('corrente');
  const ordineCorrente = ORDINE_T23; // mock — usa lo stesso ordine demo
  const totale = ordineCorrente.reduce((s, o) => s + o.prezzo * o.qty, 0);
  const cfg = statoConfig(t.stato);

  // Raggruppa per categoria
  const grouped = ordineCorrente.reduce((acc, o) => {
    (acc[o.cat] = acc[o.cat] || []).push(o);
    return acc;
  }, {});

  const proSeq = [
    { id: 'consegnato', label: 'Consegnati', n: ordineCorrente.filter(o => o.stato === 'consegnato').length },
    { id: 'pronto',     label: 'Pronti',     n: ordineCorrente.filter(o => o.stato === 'pronto').length, alert: true },
    { id: 'cucina',     label: 'In cucina',  n: ordineCorrente.filter(o => o.stato === 'cucina').length },
  ];

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '54px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Back s={18}/></button>
          <button onClick={() => openModal({ kind: 'tavolo-actions', tavolo: t })} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.More s={20}/></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: cfg.bg, color: cfg.color, borderRadius: ST.R_PILL, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
              <StatusDot stato={t.stato} size={6}/> {cfg.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.6, color: ST.TEXT, lineHeight: 1 }}>
              Tavolo {t.n}
            </div>
            <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><I.Users s={13} c={ST.MUTED}/> {t.coperti} coperti</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><I.Clock s={13} c={ST.MUTED}/> {t.sedutiDa} min</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.6, lineHeight: 1 }}>
              €{totale}
            </div>
            <div style={{ fontSize: 10.5, color: ST.MUTED, marginTop: 4, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Totale conto
            </div>
          </div>
        </div>

        {/* Allergie + note alert */}
        {(t.allergie?.length > 0 || t.note) && (
          <div style={{
            marginTop: 16, padding: 12,
            background: t.allergie?.length > 0 ? '#FEF7E6' : ST.SURF_ALT,
            borderRadius: ST.R_MD,
            borderLeft: t.allergie?.length > 0 ? `3px solid ${ST.ST_BOOKED}` : `3px solid ${ST.MUTED_2}`,
          }}>
            {t.allergie?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: ST.ST_BOOKED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <I.Alert s={12} c={ST.ST_BOOKED}/> Allergie segnalate
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {t.allergie.map(a => (
                    <span key={a} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: ST.R_PILL,
                      background: ALLERGENI[a]?.bg, color: ALLERGENI[a]?.color,
                      fontSize: 12, fontWeight: 700,
                    }}>
                      <span>{ALLERGENI[a]?.icon}</span> {ALLERGENI[a]?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {t.note && (
              <div style={{ fontSize: 12.5, color: ST.TEXT_SOFT, marginTop: t.allergie?.length > 0 ? 8 : 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <I.Note s={13} c={ST.MUTED}/> {t.note}
              </div>
            )}
          </div>
        )}

        {/* Progress portate */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {proSeq.map((p, i) => (
            <div key={p.id} style={{
              flex: 1, padding: '10px 12px',
              background: p.alert && p.n > 0 ? ST.ST_READY_BG : ST.SURF_ALT,
              borderRadius: ST.R_MD,
              border: p.alert && p.n > 0 ? `1.5px solid ${ST.ST_READY}` : 'none',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: p.alert && p.n > 0 ? ST.ST_READY : ST.TEXT, letterSpacing: -0.3, lineHeight: 1 }}>
                {p.n}
              </div>
              <div style={{ fontSize: 10.5, color: ST.MUTED, marginTop: 4, fontWeight: 600, letterSpacing: 0.2 }}>
                {p.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${ST.BORDER_SOFT}`, background: '#fff' }}>
        {[
          { id: 'corrente', label: 'Ordine corrente' },
          { id: 'storico', label: 'Storico' },
        ].map(x => (
          <button key={x.id} onClick={() => setTab(x.id)} style={{
            flex: 1, height: 46, border: 'none', background: 'transparent',
            fontSize: 13.5, fontWeight: tab === x.id ? 700 : 600,
            color: tab === x.id ? ST.PINK_DARK : ST.MUTED,
            borderBottom: tab === x.id ? `2.5px solid ${ST.PINK_DARK}` : '2.5px solid transparent',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{x.label}</button>
        ))}
      </div>

      {/* Lista piatti raggruppati per categoria */}
      <div style={{ padding: '12px 16px 0' }}>
        {Object.keys(grouped).map(catId => {
          const catLabel = CATEGORIE.find(c => c.id === catId)?.label || catId;
          return (
            <div key={catId} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 8px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  {catLabel}
                </div>
                <div style={{ fontSize: 11, color: ST.MUTED_2 }}>
                  {grouped[catId].length} piatt{grouped[catId].length === 1 ? 'o' : 'i'}
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
                {grouped[catId].map((o, j) => (
                  <OrdineRow key={o.id} o={o} last={j === grouped[catId].length - 1}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating bottom toolbar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 34, zIndex: 30,
        padding: '12px 16px', background: 'linear-gradient(180deg, transparent 0%, #fff 30%)',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => nav.push({ s: 'menu', tavoloId: t.id })} style={{
            flex: 1, height: 52, borderRadius: ST.R_PILL, border: 'none',
            background: ST.TEXT, color: '#fff',
            fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: ST.SH_MD,
          }}>
            <I.Plus s={18} c="#fff"/> Aggiungi articolo
          </button>
          <button onClick={() => nav.push({ s: 'pagamento-split', id: t.id })} style={{
            flex: 1, height: 52, borderRadius: ST.R_PILL, border: 'none',
            background: ST.PINK_DARK, color: '#fff',
            fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: ST.SH_FAB,
          }}>
            <I.Receipt s={18} c="#fff"/> Conto
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdineRow({ o, last }) {
  const stCfg = {
    consegnato: { c: ST.MUTED, label: 'Consegnato', icon: '✓' },
    pronto: { c: ST.ST_READY, label: 'Pronto da servire', icon: '●' },
    cucina: { c: ST.ST_BOOKED, label: 'In cucina', icon: '◐' },
  }[o.stato] || { c: ST.MUTED, label: o.stato };

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${ST.BORDER_SOFT}`,
      opacity: o.stato === 'consegnato' ? 0.7 : 1,
    }}>
      {/* qty badge */}
      <div style={{
        width: 28, height: 28, borderRadius: ST.R_SM,
        background: ST.SURF_ALT, color: ST.TEXT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, flexShrink: 0,
      }}>{o.qty}×</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: ST.TEXT, lineHeight: 1.3 }}>
          {o.nome}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, color: stCfg.c,
          }}>
            <span>{stCfg.icon}</span> {stCfg.label}
          </span>
          {o.minutiFa != null && o.stato !== 'consegnato' && (
            <span style={{ fontSize: 11, color: ST.MUTED }}>· {o.minutiFa}min fa</span>
          )}
          {o.cottura && <span style={{ fontSize: 11, color: ST.MUTED }}>· {o.cottura}</span>}
        </div>
        {o.note && (
          <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 4, fontStyle: 'italic' }}>
            «{o.note}»
          </div>
        )}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: ST.TEXT, flexShrink: 0 }}>
        €{o.prezzo * o.qty}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenTavolo });
