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

  const fmtPrice = (n) => {
    if (n === 0) return '0';
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(2).replace('.', ',');
  };

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
      <AcCard title="Cambia piano" subtitle="Passa a un piano superiore quando hai bisogno di più ordini, più menu o più membri dello staff.">
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12}}>
          {ACC_PIANI.map(p => <PianoCard key={p.id} p={p} fmtPrice={fmtPrice}/>)}
        </div>
      </AcCard>

      {/* Pacchetti ordini extra */}
      <AcCard
        title="Pacchetti ordini extra"
        subtitle="Acquista pacchetti di ordini per gestire picchi occasionali senza passare al piano superiore. Si sommano agli ordini inclusi nel tuo piano."
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
                <div style={{fontSize: 13, fontWeight: 600, color: PN.TEXT}}>{p.nome}</div>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 6}}>
                  <span style={{fontSize: 22, fontWeight: 600, color: PN.PINK_DARK, lineHeight: 1}}>
                    +{p.ordini.toLocaleString('it-IT')}
                  </span>
                  <span style={{fontSize: 12, fontWeight: 600, color: PN.MUTED}}>ordini</span>
                </div>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2}}>
                  <span style={{fontSize: 18, fontWeight: 600, color: PN.TEXT}}>€{fmtPrice(p.prezzo)}</span>
                  <span style={{fontSize: 11, color: PN.MUTED}}>una tantum + IVA</span>
                </div>
                <div style={{fontSize: 11, color: PN.MUTED}}>
                  {fmtPrice(Math.round((p.prezzo / p.ordini) * 100) / 100)} € per ordine
                </div>
                <button style={{
                  marginTop: 6, padding: '9px 12px', borderRadius: 999,
                  background: isPopular ? PN.BTN_BRAND : PN.BTN_DARK,
                  color: PN.WHITE,
                  border: isPopular ? '1px solid rgba(180, 30, 35, 0.40)' : '1px solid rgba(0, 0, 0, 0.32)',
                  fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: isPopular ? `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.18)` : PN.INSET_HIGHLIGHT_DARK,
                }}>Acquista</button>
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
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 14,
      background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      border: '1px solid rgba(16, 185, 129, 0.32)',
      padding: '20px 22px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: 200,
    }}>
      <div style={{
        position: 'absolute', right: -40, top: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.10)',
      }}/>
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: '#10B981', color: PN.WHITE,
          display: 'grid', placeItems: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
        }}>
          <PnI.Money size={22} color="#fff"/>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 11, color: '#065F46', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5}}>
            Risparmiato questo mese
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4}}>
            <span style={{fontSize: 30, fontWeight: 600, color: '#065F46', lineHeight: 1, letterSpacing: '-0.02em'}}>
              {fmtPrice(euroRisparmiati)} €
            </span>
          </div>
          <div style={{fontSize: 12.5, color: '#047857', marginTop: 2, fontWeight: 500}}>
            {ordiniRisparmiati.toLocaleString('it-IT')} ordini non conteggiati
          </div>
        </div>
      </div>
      <div style={{position: 'relative', fontSize: 12.5, color: '#047857', marginTop: 14, lineHeight: 1.45}}>
        Gli ordini effettuati direttamente dai clienti tramite app pesano <strong>0,5 invece di 1</strong>: più adotti il self-ordering, più risparmi.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Card "Utilizzo ordini" — barra + breakdown POS / App
// ─────────────────────────────────────────────────────────────────────────

function UtilizzoCard({ordiniPos, ordiniApp, ordiniUsati, current, pct, fmtPrice}) {
  return (
    <div style={{
      borderRadius: 14, padding: 22,
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER_HAIR}`,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 4px 12px rgba(15,17,21,0.03)',
      display: 'flex', flexDirection: 'column',
      minHeight: 200,
    }}>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10}}>
        <div>
          <div style={{fontSize: 11, color: PN.MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5}}>
            Utilizzo ordini
          </div>
          <div style={{fontSize: 12, color: PN.MUTED, marginTop: 4}}>
            Piano {current.nome} · €{fmtPrice(current.prezzo)}{current.periodo}
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: 10, color: PN.MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Extra/ordine</div>
          <div style={{fontSize: 13, fontWeight: 600, color: PN.TEXT}}>+{fmtPrice(current.ordineExtra)} €</div>
        </div>
      </div>

      <div style={{display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4, marginBottom: 8}}>
        <span style={{fontSize: 26, fontWeight: 600, color: PN.TEXT, lineHeight: 1, letterSpacing: '-0.02em'}}>
          {ordiniUsati.toLocaleString('it-IT')}
        </span>
        <span style={{fontSize: 13, color: PN.MUTED, fontWeight: 500}}>
          / {current.ordiniInclusi.toLocaleString('it-IT')} inclusi
        </span>
      </div>

      <div style={{height: 8, background: PN.WHITE_FROST, borderRadius: 99, overflow: 'hidden'}}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: pct >= 90 ? PN.AMBER : PN.PINK,
          borderRadius: 99,
          transition: 'width 400ms',
        }}/>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: PN.MUTED}}>
        <span>{pct}% utilizzato</span>
        <span>{(current.ordiniInclusi - ordiniUsati).toLocaleString('it-IT')} residui</span>
      </div>

      {/* Breakdown POS vs App — versione compatta inline */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${PN.BORDER_HAIR}`,
      }}>
        <div style={{padding: '8px 10px', background: PN.WHITE_HUSH, borderRadius: 8}}>
          <div style={{fontSize: 10, color: PN.MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Cassa</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2}}>
            <span style={{fontSize: 15, fontWeight: 600, color: PN.TEXT}}>{ordiniPos.toLocaleString('it-IT')}</span>
            <span style={{
              marginLeft: 'auto', fontSize: 9, fontWeight: 600,
              padding: '1px 6px', borderRadius: 4,
              background: PN.WHITE_FROST, color: PN.MUTED,
            }}>×1</span>
          </div>
        </div>
        <div style={{padding: '8px 10px', background: PN.PINK_SOFT, borderRadius: 8}}>
          <div style={{fontSize: 10, color: PN.PINK_DARK, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Da app</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2}}>
            <span style={{fontSize: 15, fontWeight: 600, color: PN.PINK_DARK}}>{ordiniApp.toLocaleString('it-IT')}</span>
            <span style={{
              marginLeft: 'auto', fontSize: 9, fontWeight: 600,
              padding: '1px 6px', borderRadius: 4,
              background: PN.PINK, color: PN.WHITE,
            }}>×0,5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PianoCard — card di un piano (Free/Starter/Plus/Business). Highlight = filled BRAND.
// ─────────────────────────────────────────────────────────────────────────

function PianoCard({p, fmtPrice}) {
  const isCurrent = p.current;
  const isHighlight = p.highlight && !isCurrent;

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

      <div style={{fontSize: 14, fontWeight: 600, color: styles.textColor, marginBottom: 4}}>{p.nome}</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12, flexWrap: 'wrap'}}>
        <span style={{fontSize: 26, fontWeight: 600, color: styles.priceColor, lineHeight: 1, letterSpacing: '-0.02em'}}>€{fmtPrice(p.prezzo)}</span>
        <span style={{fontSize: 11, color: styles.mutedColor}}>{p.periodo}</span>
      </div>

      <div style={{
        padding: '8px 10px', borderRadius: 8,
        background: styles.chipBg, marginBottom: 12,
        fontSize: 11.5,
      }}>
        <div style={{fontWeight: 600, color: styles.chipText}}>{p.ordiniInclusi.toLocaleString('it-IT')} ordini/mese</div>
        <div style={{color: styles.chipText, marginTop: 2, opacity: 0.85}}>
          +{fmtPrice(p.ordineExtra)} €/extra
        </div>
      </div>

      <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14, flex: 1}}>
        {p.feat.slice(2).map((f, i) => (
          <li key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: styles.textColor, lineHeight: 1.4}}>
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
        fontSize: 12.5, fontWeight: 600,
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
      fontSize: 10, fontWeight: 600,
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
    ['Menu digitali',                '1',            '3',             'Illimitati',     'Illimitati'],
    ['Membri dello staff',           '1',            'Fino a 3',      'Illimitati',     'Illimitati'],
    ['Chat bot + tutorial + ticket', '✓',            '✓',             '✓',              '✓'],
    ['Supporto telefonico 24/7',     '—',            '—',             '✓',              '✓'],
    ['Richiamata entro 30 min',      '—',            '—',             '✓',              '✓'],
    ['Canale prioritario',           '—',            '—',             '—',              '✓'],
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
      return <span style={{color: PN.MUTED_LIGHT, fontSize: 14, fontWeight: 500}}>—</span>;
    }
    return <span style={{color: PN.TEXT, fontWeight: 500}}>{c}</span>;
  };

  return (
    <AcCard title="Confronta funzionalità">
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
          fontSize: 11, fontWeight: 600, color: PN.MUTED,
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
            fontSize: 13, color: PN.TEXT,
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
