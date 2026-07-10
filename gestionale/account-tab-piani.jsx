// Account — Tab Piani e abbonamenti
// Layout: prime 2 card (Risparmio + Utilizzo) affiancate 50/50 → Cambia piano →
// Pacchetti extra → Confronto. Piano consigliato in negativo (filled BRAND).

function AccPianiAbbonamenti() {
  const current = ACC_PIANI.find(p => p.current) || ACC_PIANI[0];
  const ordiniPos = 980;
  const ordiniApp = 880;
  const ordiniUsati = ordiniPos + Math.round(ordiniApp * 0.5);   // 1420
  const ordiniRisparmiati = Math.round(ordiniApp * 0.5);          // 440
  const euroRisparmiati = Math.round(ordiniRisparmiati * current.ordineExtra * 100) / 100;
  const pct = Math.min(100, Math.round((ordiniUsati / current.ordiniInclusi) * 100));

  const [billing, setBilling] = React.useState('annual');

  const fmtPrice = (n) => {
    if (n === 0) return '0';
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(2).replace('.', ',');
  };

  // Prezzi di listino = annuale scontato; il mensile costa il 15% in più.
  const billedPrice = (p) => {
    if (p.prezzo === 0) return 0;
    if (billing === 'monthly') return Math.round(p.prezzo * 1.15 * 100) / 100;
    return p.prezzo;
  };

  const billedPeriodo = '/mese + IVA';

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>

      {/* Riga 1 — Risparmio + Utilizzo: 50/50 stessa riga, allineati alla stessa altezza.
          Gerarchia visiva: 2 card pari grado, immediatamente sotto il navbar. */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch'}}>
        <RisparmioCard
          euroRisparmiati={euroRisparmiati}
          ordiniRisparmiati={ordiniRisparmiati}
          fmtPrice={fmtPrice}
        />
        <UtilizzoCard
          ordiniPos={ordiniPos}
          ordiniApp={ordiniApp}
          ordiniUsati={ordiniUsati}
          current={current}
          pct={pct}
          fmtPrice={fmtPrice}
        />
      </div>

      {/* Riga 2 — Cambia piano: subito sotto le 2 card, è la decisione successiva
          naturale dopo aver visto risparmio + utilizzo. */}
      <AcCard title="Cambia piano" subtitle="Passa a un piano superiore per avere più ordini, più menù e più membri nel tuo team.">

        {/* Toggle mensile / annuale */}
        <div style={{display:'flex', justifyContent:'center', marginBottom: 20}}>
          <div style={{
            display:'inline-flex', alignItems:'center',
            background:'#F3F4F6', borderRadius:999,
            padding: 3, gap: 2,
            border: '1px solid #E5E7EB',
          }}>
            {[
              { key:'monthly', label:'Mensile' },
              { key:'annual',  label:'Annuale', badge:'Risparmia 15%' },
            ].map(({ key, label, badge }) => {
              const active = billing === key;
              return (
                <button
                  key={key}
                  onClick={() => setBilling(key)}
                  style={{
                    display:'flex', alignItems:'center', gap:7,
                    padding:'7px 18px', borderRadius:999, border:'none',
                    background: active ? '#fff' : 'transparent',
                    color: active ? PN.TEXT : PN.MUTED,
                    fontFamily:'inherit', fontSize:15, fontWeight: active ? 700 : 500,
                    cursor:'pointer',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,.10), 0 0 0 1px rgba(0,0,0,.06)' : 'none',
                    transition:'all .15s',
                  }}
                >
                  {label}
                  {badge && (
                    <span style={{
                      fontSize:11.5, fontWeight:700,
                      padding:'2px 8px', borderRadius:999,
                      background: active ? '#DCFCE7' : '#E5E7EB',
                      color: active ? '#15803D' : PN.MUTED,
                      transition:'all .15s',
                    }}>{badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12}}>
          {ACC_PIANI.map(p => (
            <PianoCard
              key={p.id}
              p={p}
              fmtPrice={fmtPrice}
              displayPrezzo={billedPrice(p)}
              periodo={p.prezzo === 0 ? 'gratis' : billedPeriodo}
            />
          ))}
        </div>
      </AcCard>

      {/* Pacchetti ordini extra */}
      <AcCard
        title="Ordini aggiuntivi"
        subtitle="Aggiungi ordini per gestire i picchi senza cambiare piano: si sommano a quelli già inclusi."
      >
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
          {ACC_PACCHETTI.map((p, i) => {
            const isBest = i === 2;
            const isPopular = i === 1;
            return (
              <div key={p.id} style={{
                padding: 16, borderRadius: 12,
                border: isPopular ? `1.5px solid ${PN.PINK}` : `1px solid ${PN.BORDER_HAIR}`,
                background: PN.WHITE,
                boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 4px 12px rgba(15,17,21,0.03)',
                display: 'flex', flexDirection: 'column', gap: 8,
                position: 'relative',
              }}>
                {isPopular && <PianoBadge bg={PN.PINK} fg={PN.WHITE} label="PIÙ SCELTO"/>}
                {isBest && <PianoBadge bg={PN.GREEN} fg={PN.WHITE} label="MIGLIOR VALORE"/>}
                <div style={{fontSize: 15, fontWeight: 600, color: PN.TEXT}}>{p.nome}</div>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 6}}>
                  <span style={{fontSize: 24, fontWeight: 600, color: PN.PINK_DARK, lineHeight: 1}}>
                    +{p.ordini.toLocaleString('it-IT')}
                  </span>
                  <span style={{fontSize: 14, fontWeight: 600, color: PN.MUTED}}>ordini</span>
                </div>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2}}>
                  <span style={{fontSize: 20, fontWeight: 600, color: PN.TEXT}}>€{fmtPrice(p.prezzo)}</span>
                  <span style={{fontSize: 13, color: PN.MUTED}}>pagamento unico + IVA</span>
                </div>
                <div style={{fontSize: 13, color: PN.MUTED}}>
                  {fmtPrice(Math.round((p.prezzo / p.ordini) * 100) / 100)} € a ordine
                </div>
                <button style={{
                  marginTop: 6, padding: '9px 12px', borderRadius: 999,
                  background: isPopular ? PN.BTN_BRAND : PN.BTN_DARK,
                  color: PN.WHITE,
                  border: isPopular ? '1px solid rgba(180, 30, 35, 0.40)' : '1px solid rgba(0, 0, 0, 0.32)',
                  fontSize: 14.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: isPopular ? `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.18)` : PN.INSET_HIGHLIGHT_DARK,
                }}>Aggiungi al piano</button>
              </div>
            );
          })}
        </div>
      </AcCard>

      {/* Confronto funzionalità — leggibilità migliorata */}
      <ConfrontoTable/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Card "Risparmio del mese" — verde tenue, dato d'apertura
// ─────────────────────────────────────────────────────────────────────────

function RisparmioCard({euroRisparmiati, ordiniRisparmiati, fmtPrice}) {
  // Card "Risparmio": ripristinato fondo verde chiaro (era stato passato a coral
  // photo-glass nella vecchia tipizzazione, ma semanticamente il risparmio appartiene
  // alla famiglia emerald — non al coral brand). Glass tinted emerald con inset ring
  // verde e ombra emerald soft. Fuori dal sistema W1/L2/D3 perché è un'eccezione
  // semantica (verde = soldi risparmiati), documentata qui.
  return (
    <div className="glass-lift-hover" style={{
      position: 'relative',
      overflow: 'hidden',
      padding: '20px 22px',
      borderRadius: 14,
      minHeight: 200,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      backgroundImage:
        'linear-gradient(to bottom, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0) 100%), ' +
        'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      border: 'none',
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.85), ' +
        'inset 0 0 0 1px rgba(16, 185, 129, 0.20), ' +
        '0 8px 24px -8px rgba(16, 185, 129, 0.22), ' +
        '0 2px 6px -2px rgba(15, 17, 21, 0.04)',
      color: '#064E3B',
    }}>
      <div style={{
        position: 'absolute', right: -40, top: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.18)',
        zIndex: 0,
      }}/>
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 14, zIndex: 1}}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
          color: '#fff',
          display: 'grid', placeItems: 'center', flexShrink: 0,
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.40), inset 0 1px 0 rgba(255,255,255,0.30)',
        }}>
          <PnI.Money size={22} color="#fff"/>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 13, color: 'rgba(6, 78, 59, 0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5}}>
            Risparmiato questo mese
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4}}>
            <span style={{fontSize: 32, fontWeight: 600, color: '#047857', lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>
              {fmtPrice(euroRisparmiati)} €
            </span>
          </div>
          <div style={{fontSize: 14.5, color: '#065F46', marginTop: 2, fontWeight: 500}}>
            {ordiniRisparmiati.toLocaleString('it-IT')} ordini a metà prezzo
          </div>
        </div>
      </div>
      <div style={{position: 'relative', fontSize: 14.5, color: 'rgba(6, 78, 59, 0.85)', marginTop: 14, lineHeight: 1.45, zIndex: 1}}>
        Gli ordini fatti dai clienti tramite app vengono contati come <strong style={{color: '#047857'}}>0,5 invece di 1</strong>: più i clienti ordinano da soli e meno paghi.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Card "Utilizzo ordini" — barra + breakdown POS / App
// ─────────────────────────────────────────────────────────────────────────

function UtilizzoCard({ordiniPos, ordiniApp, ordiniUsati, current, pct, fmtPrice}) {
  // Sunset-theme (D3): pannello "ordini usati". Sostituito night+coralAccent con
  // sunset puro per allinearsi al sistema 80/10/10 — i due upgrade/utilizzo card
  // del prodotto (sidebar plan card + questo) sono le superfici D3 di riferimento.
  return (
    <GlassDarkBox
      theme="sunset"
      padding={22}
      borderRadius={14}
      style={{
        display: 'flex', flexDirection: 'column',
        minHeight: 200,
      }}>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10}}>
        <div>
          <div style={{fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5}}>
            Utilizzo ordini
          </div>
          <div style={{fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 4}}>
            Piano {current.nome} · €{fmtPrice(current.prezzo)}{current.periodo}
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Costo per ordine extra</div>
          <div style={{fontSize: 15, fontWeight: 600, color: '#F5F5F7'}}>+{fmtPrice(current.ordineExtra)} €</div>
        </div>
      </div>

      <div style={{display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4, marginBottom: 8}}>
        <span style={{fontSize: 28, fontWeight: 600, color: '#F5F5F7', lineHeight: 1, letterSpacing: '-0.02em'}}>
          {ordiniUsati.toLocaleString('it-IT')}
        </span>
        <span style={{fontSize: 15, color: 'rgba(255,255,255,0.60)', fontWeight: 500}}>
          / {current.ordiniInclusi.toLocaleString('it-IT')} inclusi
        </span>
      </div>

      <div style={{height: 8, background: 'rgba(255,255,255,0.10)', borderRadius: 99, overflow: 'hidden'}}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: pct >= 90 ? '#FBBF24' : '#FF6066',
          borderRadius: 99,
          transition: 'width 400ms',
          boxShadow: pct >= 90 ? '0 0 8px rgba(251, 191, 36, 0.5)' : '0 0 8px rgba(255, 96, 102, 0.5)',
        }}/>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.60)'}}>
        <span>{pct}% utilizzato</span>
        <span>{(current.ordiniInclusi - ordiniUsati).toLocaleString('it-IT')} ancora disponibili</span>
      </div>

      {/* Breakdown POS vs App — versione compatta inline (su dark) */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        marginTop: 14, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.12)',
      }}>
        <div style={{padding: '8px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)'}}>
          <div style={{fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Da cassa</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2}}>
            <span style={{fontSize: 17, fontWeight: 600, color: '#F5F5F7'}}>{ordiniPos.toLocaleString('it-IT')}</span>
            <span style={{
              marginLeft: 'auto', fontSize: 11, fontWeight: 600,
              padding: '1px 6px', borderRadius: 4,
              background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)',
            }}>×1</span>
          </div>
        </div>
        <div style={{padding: '8px 10px', background: 'rgba(255, 96, 102, 0.18)', borderRadius: 8, boxShadow: 'inset 0 0 0 1px rgba(255, 96, 102, 0.30)'}}>
          <div style={{fontSize: 12, color: '#FF8B90', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Da app clienti</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2}}>
            <span style={{fontSize: 17, fontWeight: 600, color: '#FFC8B0'}}>{ordiniApp.toLocaleString('it-IT')}</span>
            <span style={{
              marginLeft: 'auto', fontSize: 11, fontWeight: 600,
              padding: '1px 6px', borderRadius: 4,
              background: '#FF6066', color: '#fff',
            }}>×0,5</span>
          </div>
        </div>
      </div>
    </GlassDarkBox>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PianoCard — card di un piano (Free/Starter/Plus/Business). Highlight = filled BRAND.
// PianoEmoji è definito in panoramica-plan-card.jsx → window.PianoEmoji
// (caricato in ogni pagina dashboard, condiviso col sidebar plan card).
// ─────────────────────────────────────────────────────────────────────────

function PianoCard({p, fmtPrice, displayPrezzo, periodo}) {
  const isCurrent = p.current;
  const isHighlight = p.highlight && !isCurrent;
  const prezzoMostrato = displayPrezzo !== undefined ? displayPrezzo : p.prezzo;
  const periodoMostrato = periodo !== undefined ? periodo : p.periodo;

  // Stili per piano consigliato in negativo (filled BRAND, scritte bianche)
  const styles = isHighlight
    ? {
        bg: 'linear-gradient(135deg, #FF6A6F 0%, #E04347 100%)',
        border: `1px solid rgba(180, 30, 35, 0.45)`,
        textColor: PN.WHITE,
        mutedColor: 'rgba(255, 255, 255, 0.78)',
        priceColor: PN.WHITE,
        chipBg: 'rgba(255, 255, 255, 0.20)',
        chipText: PN.WHITE,
        checkColor: '#86EFAC',
        ctaBg: PN.WHITE,
        ctaColor: PN.PINK_DARK,
        ctaBorder: '1px solid rgba(255,255,255,0.4)',
        shadow: '0 8px 24px rgba(255, 90, 95, 0.28), inset 0 1px 0 rgba(255,255,255,0.30)',
      }
    : {
        bg: PN.WHITE,
        border: isCurrent ? `2px solid ${PN.PINK}` : `1px solid ${PN.BORDER_HAIR}`,
        textColor: PN.TEXT,
        mutedColor: PN.MUTED,
        priceColor: PN.TEXT,
        chipBg: PN.PINK_SOFT,
        chipText: PN.PINK_DARK,
        checkColor: PN.GREEN,
        ctaBg: isCurrent ? PN.WHITE : PN.BTN_DARK,
        ctaColor: isCurrent ? PN.MUTED : PN.WHITE,
        ctaBorder: isCurrent ? `1px solid ${PN.BORDER_LIGHT}` : '1px solid rgba(0, 0, 0, 0.32)',
        shadow: '0 1px 0 rgba(15,17,21,0.04), 0 4px 12px rgba(15,17,21,0.03)',
      };

  return (
    <div style={{
      borderRadius: 12, border: styles.border,
      padding: 16, position: 'relative',
      background: styles.bg,
      boxShadow: styles.shadow,
      display: 'flex', flexDirection: 'column',
      color: styles.textColor,
    }}>
      {isCurrent && <PianoBadge bg={PN.PINK} fg={PN.WHITE} label="ATTUALE"/>}
      {isHighlight && <PianoBadge bg={PN.WHITE} fg={PN.PINK_DARK} label="CONSIGLIATO"/>}

      <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
        <PianoEmoji planId={p.id} size={22} monochrome={isHighlight ? '#FFFFFF' : undefined}/>
        <div style={{fontSize: 16, fontWeight: 600, color: styles.textColor}}>{p.nome}</div>
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12, flexWrap: 'wrap'}}>
        <span style={{fontSize: 28, fontWeight: 600, color: styles.priceColor, lineHeight: 1, letterSpacing: '-0.02em'}}>
          {prezzoMostrato === 0 ? 'Gratis' : `€${fmtPrice(prezzoMostrato)}`}
        </span>
        <span style={{fontSize: 13, color: styles.mutedColor}}>{prezzoMostrato === 0 ? '' : periodoMostrato}</span>
      </div>

      <div style={{
        padding: '8px 10px', borderRadius: 8,
        background: styles.chipBg, marginBottom: 12,
        fontSize: 13.5,
      }}>
        <div style={{fontWeight: 600, color: styles.chipText}}>{p.ordiniInclusi.toLocaleString('it-IT')} ordini/mese</div>
        <div style={{color: styles.chipText, marginTop: 2, opacity: 0.85}}>
          +{fmtPrice(p.ordineExtra)} €/extra
        </div>
      </div>

      <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14, flex: 1}}>
        {p.feat.slice(2).map((f, i) => (
          <li key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 14, color: styles.textColor, lineHeight: 1.4}}>
            <span style={{color: styles.checkColor, marginTop: 2, flexShrink: 0}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            {f}
          </li>
        ))}
      </ul>
      <button style={{
        width: '100%',
        padding: '10px 14px', borderRadius: 999,
        background: styles.ctaBg,
        color: styles.ctaColor,
        border: styles.ctaBorder,
        fontSize: 14.5, fontWeight: 600,
        cursor: isCurrent ? 'default' : 'pointer',
        fontFamily: 'inherit',
        boxShadow: isHighlight
          ? '0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
          : (isCurrent ? 'none' : PN.INSET_HIGHLIGHT_DARK),
      }}>
        {isCurrent ? 'Piano attuale' : 'Passa a ' + p.nome}
      </button>
    </div>
  );
}

function PianoBadge({bg, fg, label}) {
  return (
    <div style={{
      position: 'absolute', top: -10, right: 14,
      background: bg, color: fg,
      fontSize: 12, fontWeight: 600,
      padding: '4px 10px', borderRadius: 6, letterSpacing: 0.5,
      boxShadow: '0 2px 6px rgba(15,17,21,0.10)',
    }}>{label}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ConfrontoTable — leggibilità migliorata: header neutro WHITE_OFF, righe
// alternate WHITE/WHITE_HUSH, check verde su pillola GREEN_SOFT, em-dash chiaro.
// ─────────────────────────────────────────────────────────────────────────

function ConfrontoTable() {
  const rows = [
    ['Ordini inclusi/mese',          '550',          '1.850',         '7.500',          '15.000'],
    ['Costo per ordine extra',       '0,45 €+IVA',   '0,34 €+IVA',    '0,23 €+IVA',     '0,12 €+IVA'],
    ['Menù digitali',                '1',            '3',             'Illimitati',     'Illimitati'],
    ['Membri del team',              '1',            'Fino a 3',      'Illimitati',     'Illimitati'],
    ['Assistenza via ticket, chat e guide', '✓',     '✓',             '✓',              '✓'],
    ['Supporto telefonico 24/7',     '—',            '—',             '✓',              '✓'],
    ['Richiamata entro 30 minuti',   '—',            '—',             '✓',              '✓'],
    ['Canale riservato prioritario', '—',            '—',             '—',              '✓'],
  ];

  // Render cella: ✓ → check verde su pillola, — → muted, altro → testo
  const renderCell = (c) => {
    if (c === '✓') {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: 999,
          background: PN.GREEN_SOFT, color: PN.GREEN,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      );
    }
    if (c === '—') {
      return <span style={{color: PN.MUTED_LIGHT, fontSize: 16, fontWeight: 500}}>—</span>;
    }
    return <span style={{color: PN.TEXT, fontWeight: 500}}>{c}</span>;
  };

  return (
    <AcCard title="Confronto tra piani">
      <div style={{
        border: `1px solid ${PN.BORDER_HAIR}`,
        borderRadius: 12, overflow: 'hidden',
        background: PN.WHITE,
      }}>
        {/* Header — neutro WHITE_OFF, NIENTE pink_soft. Tipografia uppercase muted. */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          padding: '14px 18px',
          background: PN.WHITE_OFF,
          borderBottom: `1px solid ${PN.BORDER_HAIR}`,
          fontSize: 13, fontWeight: 600, color: PN.MUTED,
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          <span>Funzionalità</span>
          <span style={{textAlign: 'center'}}>Free</span>
          <span style={{textAlign: 'center'}}>Starter</span>
          <span style={{textAlign: 'center', color: PN.PINK_DARK}}>Plus</span>
          <span style={{textAlign: 'center'}}>Business</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            padding: '14px 18px', alignItems: 'center',
            borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_GHOST}`,
            fontSize: 15, color: PN.TEXT,
            background: i % 2 === 0 ? PN.WHITE : PN.WHITE_OFF,
          }}>
            <span style={{fontWeight: 500, color: PN.TEXT}}>{r[0]}</span>
            {r.slice(1).map((c, j) => (
              <span key={j} style={{textAlign: 'center', display: 'flex', justifyContent: 'center'}}>
                {renderCell(c)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </AcCard>
  );
}

window.AccPianiAbbonamenti = AccPianiAbbonamenti;
