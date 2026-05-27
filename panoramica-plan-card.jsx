// Plan card — dismissable banner showing current plan + upgrade CTA

// ─────────────────────────────────────────────────────────────────────────
// PianoEmoji — SVG custom per ogni piano Byup. 24×24, fill colorato.
// Progressione coloristica = "scala del piano":
//   Free      → verde menta  (germoglio: primi passi)
//   Starter   → coral Byup   (pizza: piatto base popolare)
//   Plus      → pink-dark    (ciotola pasta: menu completo)
//   Business  → wine + chef  (cappello chef: professionalità top)
// Prop `monochrome` (es. "#fff"): rende tutto in un solo colore, per usi
// su background scuri o badge inverted.
// Esposto su window.PianoEmoji → disponibile in tutte le pagine dashboard
// (panoramica-plan-card.jsx è caricato in ogni HTML via la sidebar).
// ─────────────────────────────────────────────────────────────────────────
function PianoEmoji({ planId, size = 24, monochrome }) {
  const px = size;
  const mono = monochrome;

  if (planId === 'free') {
    return (
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21 V13" stroke={mono || '#0F1115'} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 14 C9 13 6 11 5.5 8 C5.3 6.5 6.5 6 8 6.3 C10.5 7 12 9 12 14 Z"
              fill={mono || '#34D399'}
              stroke={mono ? 'none' : '#10B981'} strokeWidth="0.6"/>
        <path d="M12 14 C15 13 18 11 18.5 8 C18.7 6.5 17.5 6 16 6.3 C13.5 7 12 9 12 14 Z"
              fill={mono || '#10B981'}
              stroke={mono ? 'none' : '#059669'} strokeWidth="0.6"/>
        <path d="M8 7.5 L11.2 13 M16 7.5 L12.8 13"
              stroke={mono ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.45)'}
              strokeWidth="0.8" strokeLinecap="round"/>
      </svg>
    );
  }

  if (planId === 'starter') {
    return (
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6 Q12 4 20 6 L12 22 Z"
              fill={mono || '#F4C57E'}
              stroke={mono ? 'none' : '#C9924C'} strokeWidth="0.8" strokeLinejoin="round"/>
        <path d="M5.4 7 Q12 5.4 18.6 7 L12 20 Z"
              fill={mono || '#FF6066'}/>
        <circle cx="9.5" cy="11" r="1.4" fill={mono ? 'rgba(255,255,255,0.65)' : '#8B2025'}/>
        <circle cx="14.2" cy="10.7" r="1.4" fill={mono ? 'rgba(255,255,255,0.65)' : '#8B2025'}/>
        <circle cx="12" cy="15.5" r="1.4" fill={mono ? 'rgba(255,255,255,0.65)' : '#8B2025'}/>
      </svg>
    );
  }

  if (planId === 'plus') {
    return (
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 13 Q12 23 21 13 Z"
              fill={mono || '#BE185D'}
              stroke={mono ? 'none' : '#8B0E45'} strokeWidth="0.8" strokeLinejoin="round"/>
        <ellipse cx="12" cy="13" rx="9" ry="1.4" fill="none"
              stroke={mono ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.55)'} strokeWidth="0.8"/>
        <path d="M5 11 Q8 8 11 11 T17 11 T19 12"
              stroke={mono || '#FBBF24'} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M6 9 Q9 6 12 9 T18 9"
              stroke={mono || '#F59E0B'} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M9 4 Q10 3 9 2 M15 4 Q14 3 15 2"
              stroke={mono ? 'rgba(255,255,255,0.4)' : 'rgba(190, 24, 93, 0.35)'}
              strokeWidth="0.8" strokeLinecap="round"/>
      </svg>
    );
  }

  if (planId === 'business') {
    return (
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 14 Q3 11 4.5 9 Q4 6 7 6 Q8 4 10.5 5 Q12 3 13.5 5 Q16 4 17 6 Q20 6 19.5 9 Q21 11 19 14 Z"
              fill={mono || '#FAFAFA'}
              stroke={mono ? 'none' : '#7C2D3C'} strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M8.5 8.5 V13.5 M12 7 V13.5 M15.5 8.5 V13.5"
              stroke={mono ? 'rgba(0,0,0,0.2)' : 'rgba(124, 45, 60, 0.30)'}
              strokeWidth="0.8" strokeLinecap="round"/>
        <rect x="5" y="14" width="14" height="3.5" rx="1.2"
              fill={mono || '#7C2D3C'}
              stroke={mono ? 'none' : '#4A1525'} strokeWidth="0.6"/>
        <circle cx="12" cy="15.75" r="0.7" fill={mono ? 'rgba(255,255,255,0.5)' : '#FFC8B0'}/>
      </svg>
    );
  }

  return (
    <svg width={px} height={px} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill={mono || '#D1D5DB'}/>
    </svg>
  );
}

window.PianoEmoji = PianoEmoji;

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
        <Icon name="xmark" size={14}/>
      </button>

      <div style={{display:'flex', alignItems:'center', gap: 18}}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: 'linear-gradient(135deg, #FF5A5F, #E04347)',
          display:'grid', placeItems:'center',
          color: PN.WHITE,
          flexShrink: 0,
        }}>
          <Icon name="sparkles" size={26} color={PN.WHITE}/>
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

  // Night-theme plan card. Visible in every dashboard sidebar (~13 pages).
  // Gray/nero vero per dare al "promo upgrade" un look premium sobrio
  // (non gridato come il coral). Coral accent discreto per mantenere brand.
  return (
    <GlassDarkBox
      theme="sunset"
      padding="14px 14px 12px"
      borderRadius={12}
      style={{
        margin: '14px 0 10px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
      {/* Piano label — niente più "Xg al rinnovo" come da richiesta.
          PianoEmoji monochrome bianco a fianco del nome → identità visiva
          del tier rapida senza distogliere dall'85% color brand. */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        <PianoEmoji planId="starter" size={16} monochrome="rgba(255,255,255,0.95)"/>
        Piano Starter
      </div>

      {/* Dato protagonista — percentuale + barra + tooltip on hover */}
      <div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6}}>
          <span style={{
            fontSize: 22, fontWeight: 600, color: '#F5F5F7',
            letterSpacing: '-0.02em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{pct}%</span>
          <span style={{fontSize: 11, color: 'rgba(255,255,255,0.60)'}}>ordini usati</span>
        </div>

        {/* Track + fill — hover sulla barra mostra dettaglio "1420 di 1850" */}
        <div
          onMouseEnter={() => setBarHover(true)}
          onMouseLeave={() => setBarHover(false)}
          style={{position: 'relative', cursor: 'help'}}
        >
          <div style={{
            height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.18)',
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

          {/* Tooltip liquid-glass scuro — width 200px ridotta da 240 per stare
              nei 204px utili della sidebar (232 − padding 14×2). Centrata via
              left:50% + translateX. Background semi-trasparente + backdrop blur
              (dark glass) invece del fill opaco nero, così rifrange leggermente
              ciò che sta dietro mantenendo il dark mood. */}
          {barHover && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 10px)',
              left: '50%', transform: 'translateX(-50%)',
              width: 200, maxWidth: '100%',
              padding: '10px 12px',
              background: 'rgba(15, 17, 21, 0.62)',
              backdropFilter: 'blur(18px) saturate(180%)',
              WebkitBackdropFilter: 'blur(18px) saturate(180%)',
              color: '#fff', borderRadius: 10,
              fontSize: 10.5, lineHeight: 1.5, fontWeight: 400,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.12), ' +
                'inset 0 0 0 1px rgba(255,255,255,0.08), ' +
                '0 12px 32px -8px rgba(0,0,0,0.50)',
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
          Su dark-glass: pulsante bianco hard-contrast con testo wine-dark.
          glass-shimmer in loop sull'idle per "vivere" leggermente. */}
      <button
        onClick={handleOpen}
        onMouseEnter={() => setCtaHover(true)}
        onMouseLeave={() => setCtaHover(false)}
        className="glass-shimmer"
        style={{
          padding: '9px 12px',
          background: ctaHover ? '#FFF5F8' : '#FFFFFF',
          color: '#7C2D3C',
          border: '1px solid rgba(255,255,255,0.85)',
          borderRadius: 9,
          fontWeight: 700, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.90), ' +
            '0 4px 10px -4px rgba(20, 6, 12, 0.40)',
          transition: 'background 180ms ease-out',
          position: 'relative',
        }}
      >
        <span style={{position:'relative', zIndex: 3}}>{ctaHover ? 'Ottienilo ora' : 'Passa a Plus'}</span>
        <span style={{
          fontSize: 14, lineHeight: 1,
          transform: ctaHover ? 'translateX(2px)' : 'translateX(0)',
          transition: 'transform 180ms ease-out',
          position: 'relative', zIndex: 3,
        }}>→</span>
      </button>
    </GlassDarkBox>
  );
}

window.PnPlanCard = PnPlanCard;
window.PnSidebarPlanCard = PnSidebarPlanCard;
