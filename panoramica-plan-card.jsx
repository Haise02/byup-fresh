// Plan card — dismissable banner showing current plan + upgrade CTA

function PnPlanCard({ dismissed, onDismiss, onOpenPlans }) {
  if (dismissed) return null;

  return (
    <div style={{
      display:'grid',
      gridTemplateColumns: '1fr auto',
      gap: 24,
      alignItems:'center',
      padding: '18px 22px',
      background: 'linear-gradient(135deg, #FFF6FA 0%, #FFEDF3 100%)',
      border: `1px solid ${PN.PINK_SOFT}`,
      borderRadius: 14,
      position:'relative',
    }}>
      <button onClick={onDismiss} style={{
        position:'absolute', top: 10, right: 10,
        width: 26, height: 26, borderRadius: 6,
        background:'transparent', border:'none',
        cursor:'pointer', color: PN.MUTED,
        display:'grid', placeItems:'center',
      }}>
        <PnI.X size={14}/>
      </button>

      <div style={{display:'flex', alignItems:'center', gap: 18}}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: 'linear-gradient(135deg, #FF5A5F, #E04347)',
          display:'grid', placeItems:'center',
          color: PN.WHITE,
          flexShrink: 0,
        }}>
          <PnI.Sparkle size={26} color={PN.WHITE}/>
        </div>
        <div>
          <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 4}}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: PN.PINK_DARK, background: PN.WHITE,
              padding: '3px 8px', borderRadius: 6,
              letterSpacing: 0.5, textTransform:'uppercase',
              border:`1px solid ${PN.PINK_SOFT}`,
            }}>Piano Starter</span>
            <span style={{fontSize:12, color: PN.MUTED}}>· 14 giorni di prova rimanenti</span>
          </div>
          <div style={{fontSize:15, fontWeight: 700, color: PN.TEXT, marginBottom: 2}}>
            Sblocca prenotazioni illimitate e analytics avanzate
          </div>
          <div style={{fontSize:13, color: PN.MUTED}}>
            Stai usando <strong style={{color:PN.TEXT, fontWeight:600}}>67 / 100</strong> prenotazioni del mese · Pro a partire da <strong style={{color:PN.TEXT, fontWeight:600}}>€39/mese</strong>
          </div>
        </div>
      </div>

      <div style={{display:'flex', gap: 10}}>
        <button style={{
          padding:'10px 16px', background:'transparent', color: PN.TEXT,
          border:`1px solid ${PN.BORDER}`, borderRadius: 10,
          fontWeight: 600, fontSize: 13, fontFamily:'inherit', cursor:'pointer',
        }}>Confronta piani</button>
        <button onClick={onOpenPlans} style={{
          padding:'10px 18px', background: PN.PINK, color: PN.WHITE,
          border:'none', borderRadius: 10,
          fontWeight: 700, fontSize: 13, fontFamily:'inherit', cursor:'pointer',
          boxShadow:'0 2px 8px rgba(233,30,99,0.3)',
        }}>Passa a Pro</button>
      </div>
    </div>
  );
}

// Compact version for sidebar — Apple-style con hover progressivo.
// La barra mostra il dettaglio "1420 di 1850" SOLO in hover (tooltip dark).
// CTA "Passa a Plus" cambia copy + colore in hover ("Ottienilo ora").
function PnSidebarPlanCard({ onOpenPlans }) {
  const ordiniInclusi = 1850;
  const ordiniCassa   = 980;
  const utentiApp     = 880;
  const ordiniApp     = utentiApp * 0.5;
  const ordiniUsati   = ordiniCassa + ordiniApp;
  const ordiniRisparmiati = utentiApp - ordiniApp;
  const pct = Math.min(100, Math.round((ordiniUsati / ordiniInclusi) * 100));
  const [barHover, setBarHover] = React.useState(false);
  const [ctaHover, setCtaHover] = React.useState(false);

  const handleOpen = () => {
    if (onOpenPlans) return onOpenPlans();
    window.location.href = 'byup Profilo.html?tab=piani';
  };

  const fillColor = pct >= 90 ? PN.PINK : pct >= 75 ? PN.AMBER : PN.GREEN;

  return (
    <div style={{
      margin: '14px 0 10px',
      padding: '14px 14px 12px',
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER_HAIR}`,
      borderRadius: 12,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 4px 12px rgba(15,17,21,0.03)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Piano label — niente più "Xg al rinnovo" come da richiesta */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: PN.TEXT,
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        Piano Starter
      </div>

      {/* Dato protagonista — percentuale + barra + tooltip on hover */}
      <div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6}}>
          <span style={{
            fontSize: 22, fontWeight: 600, color: PN.TEXT,
            letterSpacing: '-0.02em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{pct}%</span>
          <span style={{fontSize: 11, color: PN.MUTED}}>ordini usati</span>
        </div>

        {/* Track + fill — hover sulla barra mostra dettaglio "1420 di 1850" */}
        <div
          onMouseEnter={() => setBarHover(true)}
          onMouseLeave={() => setBarHover(false)}
          style={{position: 'relative', cursor: 'help'}}
        >
          <div style={{
            height: 6, borderRadius: 999, background: PN.WHITE_FROST,
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: `${pct}%`,
              background: fillColor,
              borderRadius: 999,
              transition: 'box-shadow 200ms ease-out',
              boxShadow: barHover ? `0 0 0 2px ${fillColor}33` : 'none',
            }}/>
          </div>

          {/* Tooltip dark con breakdown — visibile solo on hover sulla barra */}
          {barHover && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
              width: 240, padding: '10px 12px',
              background: '#0F1115', color: '#fff', borderRadius: 8,
              fontSize: 10.5, lineHeight: 1.5, fontWeight: 400,
              boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
              zIndex: 50, textAlign: 'left', letterSpacing: 0,
            }}>
              <div style={{fontWeight: 600, marginBottom: 4}}>
                {ordiniUsati.toLocaleString('it-IT')} di {ordiniInclusi.toLocaleString('it-IT')} ordini
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8}}>
                <span style={{opacity: 0.75}}>Cassa · {ordiniCassa.toLocaleString('it-IT')} × 1</span>
                <span>{ordiniCassa.toLocaleString('it-IT')}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8}}>
                <span style={{opacity: 0.75}}>App · {utentiApp.toLocaleString('it-IT')} × 0,5</span>
                <span>{ordiniApp.toLocaleString('it-IT')}</span>
              </div>
              <div style={{height: 1, background: 'rgba(255,255,255,0.15)', margin: '6px 0'}}/>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, fontWeight: 600}}>
                <span>Ne restano</span>
                <span>{(ordiniInclusi - ordiniUsati).toLocaleString('it-IT')}</span>
              </div>
              <div style={{marginTop: 6, color: '#86EFAC', fontSize: 10}}>
                Risparmiati <b>{ordiniRisparmiati.toLocaleString('it-IT')}</b> ordini grazie ai pagamenti app
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA "Passa a Plus" → "Ottienilo ora" on hover.
          Apple-style: gradient brand → gradient brand più scuro on hover.
          Inset highlight bianco + shadow tinted leggera. */}
      <button
        onClick={handleOpen}
        onMouseEnter={() => setCtaHover(true)}
        onMouseLeave={() => setCtaHover(false)}
        style={{
          padding: '9px 12px',
          background: ctaHover ? PN.BTN_BRAND_PRESS : PN.BTN_BRAND,
          color: PN.WHITE,
          border: '1px solid rgba(180, 30, 35, 0.40)',
          borderRadius: 9,
          fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.22)`,
          transition: 'background 180ms ease-out',
        }}
      >
        {ctaHover ? 'Ottienilo ora' : 'Passa a Plus'}
        <span style={{
          fontSize: 14, lineHeight: 1,
          transform: ctaHover ? 'translateX(2px)' : 'translateX(0)',
          transition: 'transform 180ms ease-out',
        }}>→</span>
      </button>
    </div>
  );
}

window.PnPlanCard = PnPlanCard;
window.PnSidebarPlanCard = PnSidebarPlanCard;
