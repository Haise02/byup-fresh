// byup Staff — Da portare (runner: piatti pronti cross-tavolo)

const { useState: useStateO } = React;

// ═══════════════════════════════════════════════════════════
// DA PORTARE — unica vista cross-tavolo: tutto ciò che è pronto da portare,
// sia uscito dalla cucina sia preso in carico dal cameriere ("lo porto io").
// Niente "da inviare"/"in cucina" qui: l'invio vive nel flusso tavolo.
// Una sola azione: Consegna. Ordinati per attesa (chi è pronto da più tempo
// va portato prima, prima che si freddi).
// ═══════════════════════════════════════════════════════════
function ScreenDaPortare({ nav, openModal }) {
  const { attivi } = useTavoli();
  // Articoli che il cameriere ha preso in carico dal tavolo ("lo porto io"):
  // nessuno li prepara, sono disponibili da subito. Stessa lista dei piatti di
  // cucina, ma senza attesa — quindi in fondo: chi si fredda va portato prima.
  const diretti = attivi
    .filter(t => (t.piattiPronti || []).some(p => p.diretto))
    .map(t => ({
      tavolo: t.n, stato: 'pronto', rotta: 'diretto',
      piatti: (t.piattiPronti || [])
        .filter(p => p.diretto)
        .map((p, i) => ({ id: `d-${t.id}-${i}`, nome: p.nome, qty: p.qty })),
    }));
  const pronti = [...diretti, ...CODA_CUCINA.filter(o => o.stato === 'pronto')]
    .sort((a, b) => (b.minutiPronto || 0) - (a.minutiPronto || 0));

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 110 }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: 'calc(20px + env(safe-area-inset-top)) 20px 16px' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Pronti da portare · live
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5, marginTop: 2 }}>
            Da consegnare
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pronti.length === 0 && (
          <div style={{ background: '#fff', borderRadius: ST.R_LG, padding: '48px 24px', textAlign: 'center', boxShadow: ST.SH_SM }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>✨</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: ST.TEXT }}>Niente da consegnare</div>
            <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 4 }}>
              Non c'è niente da portare al momento.
            </div>
          </div>
        )}
        {pronti.map((g, i) => (
          <DaPortareCard key={i} g={g} nav={nav} openModal={openModal}/>
        ))}
      </div>
    </div>
  );
}

// ─── Card runner: un tavolo con i suoi piatti pronti ─────────
function DaPortareCard({ g, nav, openModal }) {
  const [sel, setSel] = useStateO({});
  const totQty = g.piatti.reduce((s, p) => s + p.qty, 0);
  const selCount = Object.values(sel).filter(Boolean).length;
  const isDiretto = g.rotta === 'diretto';
  // Il tempo non è un dato da mostrare sempre: conta solo come ALERT quando un
  // piatto di cucina è pronto da troppo (si fredda). Sotto soglia, niente.
  const SOGLIA_ALERT = 3;
  const inAllarme = !isDiretto && (g.minutiPronto || 0) > SOGLIA_ALERT;

  return (
    <div style={{
      background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden',
      boxShadow: ST.SH_SM, border: `1px solid ${ST.BORDER_SOFT}`,
      borderLeft: `3px solid ${ST.ST_READY}`,
    }}>
      {/* Intestazione: numero + freccetta (tap → dettaglio tavolo). */}
      <div
        onClick={() => nav.push({ s: 'tavolo', id: g.tavolo })}
        style={{ padding: '11px 14px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
      >
        <span style={{ fontSize: 16, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>Tavolo {g.tavolo}</span>
        <I.ChevRight s={16} c={ST.MUTED}/>
      </div>

      {/* Piatti: tap sulla riga per selezionare. Alert tempo solo se in ritardo. */}
      <div style={{ padding: '0 14px 11px' }}>
        {g.piatti.map((p) => {
          const on = !!sel[p.id];
          return (
            <div key={p.id} onClick={() => setSel({ ...sel, [p.id]: !on })} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', margin: '1px -2px', borderRadius: ST.R_SM,
              background: on ? ST.PINK_SOFT : 'transparent', cursor: 'pointer',
            }}>
              <span style={{
                minWidth: 26, height: 24, padding: '0 6px', borderRadius: 6,
                background: on ? ST.PINK_DARK : ST.SURF_ALT, color: on ? '#fff' : ST.TEXT,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11.5, fontWeight: 800, flexShrink: 0,
              }}>{p.qty}×</span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: ST.TEXT }}>{p.nome}</span>
              {inAllarme && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                  fontSize: 11, fontWeight: 800, color: ST.ST_READY,
                }}>
                  <I.Clock s={12} c={ST.ST_READY}/> {g.minutiPronto}min
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Azione unica: Consegna */}
      <div style={{ padding: '0 14px 12px' }}>
        <Btn variant="primary" size="md" full onClick={() => openModal({ kind: 'success', text: 'Consegnato al tavolo' })}>
          {selCount > 0 && selCount < g.piatti.length ? 'Consegna selezionati' : 'Consegna tutti'}
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenDaPortare });
