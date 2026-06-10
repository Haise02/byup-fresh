// Byup Staff — Incassa: selezione conto aperto → dettaglio → carta

// ═══════════════════════════════════════════════════════════
// CODA DI INCASSO — conti inviati dal gestionale, scegli quale incassare
// ═══════════════════════════════════════════════════════════
function ScreenIncassa({ nav, contiPagati = [], contiRimandati = [] }) {
  const conti = CODA_INCASSO.filter(c => !contiPagati.includes(c.id) && !contiRimandati.includes(c.id));

  return (
    <div style={{ background: ST.BG, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header: esercente */}
      <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo size={34} radius={ST.R_MD}/>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: ST.TEXT, lineHeight: 1 }}>{MERCHANT.nome}</div>
          <div style={{ fontSize: 11, color: ST.MUTED, marginTop: 2 }}>{MERCHANT.operatore}</div>
        </div>
      </div>

      {/* Titolo sezione */}
      <div style={{ padding: '14px 20px 6px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5 }}>
          Coda di incasso
        </div>
        <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 2 }}>
          {conti.length} {conti.length === 1 ? 'conto in coda' : 'conti in coda'} · seleziona quale incassare
        </div>
      </div>

      {/* Lista conti */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 96px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {conti.length === 0 && (
          <div style={{ textAlign: 'center', color: ST.MUTED, fontSize: 14, padding: '48px 16px' }}>
            <I.Check s={32} c={ST.MUTED_3}/>
            <div style={{ marginTop: 10, fontWeight: 600 }}>Coda vuota</div>
            <div style={{ fontSize: 12.5, marginTop: 2 }}>Nessun conto inviato all'incasso dal gestionale</div>
          </div>
        )}
        {conti.map(c => {
          // Conto preso in carico da un altro dispositivo: visibile ma bloccato,
          // non selezionabile per l'incasso (mock statico del lock).
          const bloccato = c.inPagamentoAltrove;
          return (
            <button
              key={c.id}
              disabled={bloccato}
              onClick={bloccato ? undefined : () => nav.push({ s: 'conto', conto: c })}
              style={{
                width: '100%', textAlign: 'left', fontFamily: 'inherit',
                cursor: bloccato ? 'not-allowed' : 'pointer',
                background: bloccato ? ST.SURF_ALT : '#fff',
                border: `1px solid ${ST.BORDER_SOFT}`, borderRadius: ST.R_LG,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: bloccato ? 'none' : ST.SH_SM,
                opacity: bloccato ? 0.75 : 1,
              }}
            >
              {/* Chip numero tavolo */}
              <div style={{
                width: 52, height: 52, borderRadius: ST.R_MD, flexShrink: 0,
                background: bloccato ? ST.MUTED_3 : ST.PINK_SOFT,
                color: bloccato ? ST.MUTED : ST.PINK_DARK,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', opacity: 0.8 }}>Tav</span>
                <span style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{c.tavolo}</span>
              </div>

              {/* Info conto */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {bloccato ? (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: ST.MUTED, fontSize: 12.5, fontWeight: 700, lineHeight: 1.3,
                  }}>
                    <I.Lock s={14} c={ST.MUTED}/> In pagamento su un altro dispositivo
                  </div>
                ) : (
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: ST.TEXT }}>Inviato {c.inviato}</div>
                )}
              </div>

              {bloccato ? (
                /* importo attenuato, nessun chevron: il conto non è selezionabile */
                <div style={{ fontSize: 16, fontWeight: 800, color: ST.MUTED_2, fontVariantNumeric: 'tabular-nums' }}>
                  {eur(c.importo)}
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT, fontVariantNumeric: 'tabular-nums' }}>
                      {eur(c.importo)}
                    </div>
                  </div>
                  <I.ChevRight s={18} c={ST.MUTED_3}/>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DETTAGLIO CONTO — importo del tavolo scelto → carta
// ═══════════════════════════════════════════════════════════
function ScreenConto({ nav, conto, rimandaConto, openModal, showToast }) {
  const importo = conto.importo;

  const chiediAnnulla = () => openModal({
    kind: 'annulla-conto',
    tavolo: conto.tavolo,
    onConfirm: () => {
      rimandaConto(conto.id);
      nav.pop();
      showToast(`Conto del tavolo ${conto.tavolo} rimandato al gestionale`);
    },
  });

  return (
    <div style={{ background: ST.BG, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con back + azione "Annulla" (a destra, lontana dalla CTA in basso) */}
      <div style={{ padding: '54px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => nav.pop()} style={{
          width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
          background: ST.SURF_ALT, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.Back s={20}/></button>
        <div style={{ flex: 1, fontSize: 18, fontWeight: 800, color: ST.TEXT }}>Tavolo {conto.tavolo}</div>
        <button onClick={chiediAnnulla} style={{
          minHeight: 40, padding: '8px 12px', borderRadius: ST.R_PILL, border: 'none',
          background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
          color: ST.TEXT_SOFT, fontSize: 15, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}><I.Close s={16} c={ST.TEXT_SOFT}/> Annulla</button>
      </div>

      {/* Display importo da incassare */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ST.MUTED, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
          Importo da incassare
        </div>
        <div style={{
          fontSize: 56, fontWeight: 800, letterSpacing: -1.5,
          color: ST.TEXT, fontVariantNumeric: 'tabular-nums',
        }}>
          {eur(importo)}
        </div>
        <div style={{
          marginTop: 16, padding: '8px 16px', borderRadius: ST.R_PILL,
          background: ST.PINK_SOFT, color: ST.PINK_DARK,
          fontSize: 13, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <I.Receipt s={15} c={ST.PINK_DARK}/> Saldo conto tavolo {conto.tavolo}
        </div>
      </div>

      {/* CTA Incassa → dritto alla carta (paddingBottom lascia spazio alla bottom nav) */}
      <div style={{ padding: '6px 16px 96px' }}>
        <button
          onClick={() => nav.push({ s: 'tap', importo, contoId: conto.id })}
          style={{
            width: '100%', height: 56, borderRadius: ST.R_PILL, border: 'none',
            background: ST.PINK_DARK, color: '#fff',
            fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: ST.SH_FAB,
          }}
        >
          <I.Contactless s={20} c="#fff"/> Incassa con carta {eur(importo)}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenIncassa, ScreenConto });
