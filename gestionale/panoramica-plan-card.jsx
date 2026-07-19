// Plan card — dismissable banner showing current plan + upgrade CTA

// ─────────────────────────────────────────────────────────────────────────
// PianoEmoji — SVG custom per ogni piano Byup. 24×24, fill colorato.
// Progressione coloristica = "scala del piano":
//   Free      → verde menta  (germoglio: primi passi)
//   Starter   → ambra dorata (boccale di birra: locale serale/pub)
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
        {/* Manico */}
        <path d="M16.5 10.5 H18.4 C19.8 10.5 20.5 11.3 20.5 12.6 V15.4 C20.5 16.7 19.8 17.5 18.4 17.5 H16.5"
              fill="none"
              stroke={mono || '#C9924C'} strokeWidth="1.6" strokeLinecap="round"/>
        {/* Corpo del boccale con la birra */}
        <path d="M6 8.5 H17 V19 C17 20.1 16.1 21 15 21 H8 C6.9 21 6 20.1 6 19 Z"
              fill={mono || '#F4B942'}
              stroke={mono ? 'none' : '#C9924C'} strokeWidth="0.8" strokeLinejoin="round"/>
        {/* Schiuma */}
        <path d="M5.2 8.5 C4.6 6.6 6 5.2 7.6 5.7 C8 4 10 3.3 11.4 4.3 C12.6 3.2 14.8 3.6 15.4 5.2 C17 4.9 18.3 6.4 17.7 8.5 Z"
              fill={mono || '#FFF7ED'}
              stroke={mono ? 'none' : '#E8D5B5'} strokeWidth="0.6" strokeLinejoin="round"/>
        {/* Bollicine */}
        <circle cx="9" cy="13" r="1" fill={mono ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.75)'}/>
        <circle cx="13" cy="15.5" r="0.8" fill={mono ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.75)'}/>
        <circle cx="11" cy="18" r="0.7" fill={mono ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.75)'}/>
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

// Variante MINI per menu contratto: resta leggibile solo il dato chiave
// (77%) su chip coral; il click riespande il menu (onExpand).
function PnSidebarPlanCardMini({ onExpand }) {
  const ordiniInclusi = 1850;
  const ordiniCassa   = 980;
  const utentiApp     = 880;
  const ordiniUsati   = ordiniCassa + utentiApp * 0.5;
  const pct = Math.min(100, Math.round((ordiniUsati / ordiniInclusi) * 100));
  return (
    <button
      onClick={onExpand}
      title={`Piano Starter · ${pct}% ordini usati — clicca per espandere il menu`}
      style={{
        width: '100%', padding: '10px 2px', margin: '14px 0 10px',
        borderRadius: 10, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #FF5A5F 0%, #E04347 55%, #B53338 100%)',
        boxShadow: '0 8px 22px -10px rgba(181, 51, 56, 0.55), 0 2px 6px -2px rgba(181, 51, 56, 0.25)',
        color: '#F5F5F7', fontFamily: 'inherit',
        display: 'grid', placeItems: 'center',
        transition: 'filter 150ms ease-out, transform 150ms ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <span style={{
        fontSize: 14.5, fontWeight: 700, lineHeight: 1,
        letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
      }}>{pct}%</span>
    </button>
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

  // Su fondo coral la semantica verde/ambra si perde: la barra è bianca,
  // il segnale d'allarme resta nel numero grande.
  const fillColor = 'rgba(255, 255, 255, 0.95)';

  // Plan card in coral brand — stesso gradiente del logo byup Fresh.
  // Visibile in ogni sidebar dashboard (~13 pagine).
  return (
    <div
      style={{
        margin: '14px 0 10px',
        padding: '14px 14px 12px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #FF5A5F 0%, #E04347 55%, #B53338 100%)',
        boxShadow: '0 8px 22px -10px rgba(181, 51, 56, 0.55), 0 2px 6px -2px rgba(181, 51, 56, 0.25)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
      {/* Piano label — niente più "Xg al rinnovo" come da richiesta.
          PianoEmoji monochrome bianco a fianco del nome → identità visiva
          del tier rapida senza distogliere dall'85% color brand. */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        <PianoEmoji planId="starter" size={16} monochrome="rgba(255,255,255,0.95)"/>
        Piano Starter
      </div>

      {/* Dato protagonista — percentuale + barra + tooltip on hover.
          L'hover copre TUTTO il blocco (anche "77% ordini usati"), non solo
          la barra: stessa informazione, area di scoperta più generosa. */}
      <div
        onMouseEnter={() => setBarHover(true)}
        onMouseLeave={() => setBarHover(false)}
        style={{cursor: 'help'}}
      >
        <div style={{display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6}}>
          <span style={{
            fontSize: 24, fontWeight: 600, color: '#F5F5F7',
            letterSpacing: '-0.02em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{pct}%</span>
          <span style={{fontSize: 13, color: 'rgba(255,255,255,0.60)'}}>ordini usati</span>
        </div>

        {/* Track + fill — il tooltip resta ancorato alla barra */}
        <div style={{position: 'relative'}}>
          <div style={{
            height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.28)',
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
              fontSize: 12.5, lineHeight: 1.5, fontWeight: 400,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.12), ' +
                'inset 0 0 0 1px rgba(255,255,255,0.08), ' +
                '0 12px 32px -8px rgba(0,0,0,0.50)',
              zIndex: 50, textAlign: 'left', letterSpacing: 0,
            }}>
              <div style={{fontWeight: 600, marginBottom: 4}}>
                {ordiniUsati.toLocaleString('it-IT', {useGrouping: true})} di {ordiniInclusi.toLocaleString('it-IT', {useGrouping: true})} ordini
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8}}>
                <span style={{opacity: 0.75}}>Cassa · {ordiniCassa.toLocaleString('it-IT', {useGrouping: true})} × 1</span>
                <span>{ordiniCassa.toLocaleString('it-IT', {useGrouping: true})}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8}}>
                <span style={{opacity: 0.75}}>App · {utentiApp.toLocaleString('it-IT', {useGrouping: true})} × 0,5</span>
                <span>{ordiniApp.toLocaleString('it-IT', {useGrouping: true})}</span>
              </div>
              <div style={{height: 1, background: 'rgba(255,255,255,0.15)', margin: '6px 0'}}/>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, fontWeight: 600}}>
                <span>Ne restano</span>
                <span>{(ordiniInclusi - ordiniUsati).toLocaleString('it-IT', {useGrouping: true})}</span>
              </div>
              <div style={{marginTop: 6, color: '#86EFAC', fontSize: 12}}>
                Risparmiati <b>{ordiniRisparmiati.toLocaleString('it-IT', {useGrouping: true})}</b> ordini grazie ai pagamenti app
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA "Passa a Plus" → "Ottienilo ora" on hover.
          Bianco pieno su coral, testo brand scuro. Niente bevel né shimmer. */}
      <button
        onClick={handleOpen}
        onMouseEnter={() => setCtaHover(true)}
        onMouseLeave={() => setCtaHover(false)}
        style={{
          padding: '9px 12px',
          background: ctaHover ? '#FFF1EF' : '#FFFFFF',
          color: '#B53338',
          border: 'none',
          borderRadius: 9,
          fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 2px 8px -2px rgba(90, 15, 20, 0.30)',
          transition: 'background 180ms ease-out',
          position: 'relative',
        }}
      >
        <span style={{position:'relative', zIndex: 3}}>{ctaHover ? 'Ottienilo ora' : 'Passa a Plus'}</span>
        <span style={{
          fontSize: 16, lineHeight: 1,
          transform: ctaHover ? 'translateX(2px)' : 'translateX(0)',
          transition: 'transform 180ms ease-out',
          position: 'relative', zIndex: 3,
        }}>→</span>
      </button>
    </div>
  );
}

window.PnSidebarPlanCard = PnSidebarPlanCard;
window.PnSidebarPlanCardMini = PnSidebarPlanCardMini;
