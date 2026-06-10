// Byup Staff — Storico transazioni

const { useMemo: useMemoT } = React;

function ScreenTransazioni({ nav, openModal }) {
  // Il POS mostra solo la giornata corrente: a fine giornata la cassa si azzera.
  const oggi = useMemoT(() => TRANSAZIONI.filter(t => t.data === 'Oggi'), []);

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 100 }}>
      {/* Header + incasso oggi */}
      <div style={{ padding: '54px 20px 18px', background: '#fff', borderBottom: `1px solid ${ST.BORDER_SOFT}` }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5 }}>Transazioni</div>
        <div style={{
          marginTop: 14, background: `linear-gradient(135deg, ${ST.PINK} 0%, ${ST.PINK_DARK} 100%)`,
          borderRadius: ST.R_LG, padding: '16px 18px', color: '#fff', boxShadow: ST.SH_FAB,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>Incassato oggi</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.8, marginTop: 2 }}>{eur(INCASSO_OGGI)}</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{N_OGGI} pagamenti riusciti</div>
        </div>
      </div>

      {/* Lista transazioni di oggi */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>
          Oggi
        </div>
        <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
          {oggi.map((t, i) => {
            const cfg = txConfig(t.stato);
            const segno = t.stato === 'refund' ? '−' : '';
            return (
              <div key={t.id} onClick={() => openModal({ kind: 'dettaglio-tx', tx: t })} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px',
                borderBottom: i < oggi.length - 1 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: ST.R_MD, flexShrink: 0,
                  background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <I.Contactless s={20} c={cfg.color}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: ST.TEXT }}>
                    {t.brand}{t.last4 !== '——' ? ` ·•${t.last4}` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 2 }}>
                    Tap to Pay · {t.ora}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 15, fontWeight: 800,
                    color: t.stato === 'fail' ? ST.MUTED_2 : ST.TEXT,
                    textDecoration: t.stato === 'fail' ? 'line-through' : 'none',
                  }}>{segno}{eur(t.importo)}</div>
                  <Chip color={cfg.color} bg={cfg.bg} style={{ marginTop: 3, height: 18, fontSize: 10.5 }}>
                    {cfg.label}
                  </Chip>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota: lo storico esteso è sul gestionale web */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, margin: '20px 16px 0',
        padding: '14px 16px', background: '#fff', borderRadius: ST.R_LG, boxShadow: ST.SH_SM,
      }}>
        <I.Receipt s={18} c={ST.MUTED}/>
        <div style={{ fontSize: 12.5, color: ST.MUTED, lineHeight: 1.5 }}>
          Per il riepilogo d'incasso su un periodo più esteso, vai al gestionale web{' '}
          <b style={{ color: ST.PINK_DARK, fontWeight: 700 }}>Byup Fresh</b>.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenTransazioni });
