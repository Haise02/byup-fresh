// Account — Tab Piani e abbonamenti
// Layout: prime 2 card (Risparmio + Utilizzo) affiancate 50/50 → Cambia piano →
// Pacchetti extra → Confronto. Piano consigliato in negativo (filled BRAND).

function AccPianiAbbonamenti() {
  const current = ACC_PIANI.find(p => p.current) || ACC_PIANI[0];
  const ordiniPos = 980;
  const ordiniApp = 880;
  // Stessa formula della sidebar plan card (panoramica-plan-card.jsx):
  // gli ordini app pesano 0,5 → i "risparmiati" sono totale − pesati.
  const ordiniAppPesati = Math.round(ordiniApp * 0.5);            // 440
  const ordiniUsati = ordiniPos + ordiniAppPesati;                // 1420
  const ordiniRisparmiati = ordiniApp - ordiniAppPesati;          // 440
  const euroRisparmiati = Math.round(ordiniRisparmiati * current.ordineExtra * 100) / 100;
  const pct = Math.min(100, Math.round((ordiniUsati / current.ordiniInclusi) * 100));

  const [billing, setBilling] = React.useState('annual');

  // Modale downgrade a Free: confronto col piano attuale + recap delle perdite
  const [freeModal, setFreeModal] = React.useState(false);
  const freePlan = ACC_PIANI.find(p => p.id === 'free');

  // Toast demo: i CTA di questa pagina non hanno ancora un backend — il
  // feedback evita la sensazione di bottone rotto.
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);
  const showDemoToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  const fmtPrice = (n) => {
    if (n === 0) return '0';
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(2).replace('.', ',');
  };

  // Due prezzi di listino distinti, presi dai dati — non piu' derivati da un
  // moltiplicatore. `prezzo` e' il mensile con fatturazione annuale (scontato),
  // `prezzoMensile` e' il mensile puro. Il vecchio +15% dava 54,04 / 155,24 /
  // 287,50, che non sono i prezzi reali (54,99 / 155,99 / 290).
  const billedPrice = (p) => {
    if (p.prezzo === 0) return 0;
    return billing === 'monthly' ? p.prezzoMensile : p.prezzo;
  };

  const billedPeriodo = '/mese + IVA';

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
      {/* Feedback hover per card piani/pacchetti e i loro CTA.
          Si anima SOLO transform (il sollevamento). Il passaggio al negativo
          — sfondo, testi, chip, spunte, CTA — avviene di scatto, tutto nello
          stesso frame.

          Perche' niente transizione sui colori: lo sfondo e' un gradient, e il
          gradient NON si interpola (misurato: a 120ms era gia' al valore
          finale). Mettere una transizione sul solo `color` faceva quindi
          arrivare il testo ~240ms dopo lo sfondo — la card diventava rossa con
          le scritte ancora scure, e si leggeva come un ritardo. O si anima
          tutto o niente: siccome lo sfondo non puo', non anima nessuno. */}
      <style>{`
        .acc-plan-card {
          transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .acc-plan-card:hover {
          transform: translateY(-3px) scale(1.03);
          z-index: 2;
        }
        .acc-plan-btn {
          transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1), filter 140ms ease;
        }
        .acc-plan-btn:hover  { transform: translateY(-1px) scale(1.04); filter: brightness(1.08); }
        .acc-plan-btn:active { transform: translateY(0) scale(0.95); filter: brightness(0.92); }
      `}</style>

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

        {/* Free escluso dalla griglia: il downgrade non merita la stessa
            prominenza degli upgrade — vive nella riga discreta qui sotto. */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12}}>
          {ACC_PIANI.filter(p => p.id !== 'free').map(p => (
            <PianoCard
              key={p.id}
              p={p}
              fmtPrice={fmtPrice}
              displayPrezzo={billedPrice(p)}
              periodo={p.prezzo === 0 ? 'gratis' : billedPeriodo}
              totaleAnnuo={billing === 'annual' && p.prezzo > 0 ? p.prezzo * 12 : undefined}
              onCta={() => showDemoToast(`Il passaggio al piano ${p.nome} sarà disponibile al lancio`)}
            />
          ))}
        </div>

        {/* Piano Free — downgrade come nota secondaria, non come card.
            Il click apre il modale di confronto, non il cambio diretto. */}
        <div style={{marginTop: 16, textAlign: 'center', fontSize: 13.5, color: PN.MUTED, lineHeight: 1.5}}>
          Vuoi rinunciare ai vantaggi del tuo piano attuale? Valuta il piano <strong style={{color: PN.TEXT}}>Free</strong> —
          {' '}{freePlan.ordiniInclusi} ordini/mese, poi {fmtPrice(freePlan.ordineExtra)} € a ordine.{' '}
          <button
            onClick={() => setFreeModal(true)}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: PN.PINK_DARK, fontWeight: 600, fontSize: 13.5,
              cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
            }}>Passa a Free</button>
        </div>
      </AcCard>

      <FreeDowngradeModal
        open={freeModal}
        onClose={() => setFreeModal(false)}
        current={current}
        free={freePlan}
        fmtPrice={fmtPrice}
        onConfirm={() => {
          setFreeModal(false);
          showDemoToast('Il passaggio al piano Free sarà disponibile al lancio');
        }}
      />

      {/* Pacchetti ordini extra */}
      <AcCard
        title="Ordini aggiuntivi"
        subtitle="Aggiungi ordini per gestire i picchi senza cambiare piano: si sommano a quelli già inclusi."
      >
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12}}>
          {ACC_PACCHETTI.map((p) => {
            // Badge dai dati (campo etichetta), non dalla posizione nell'array
            const isBest = p.etichetta.includes('miglior valore');
            const isPopular = p.etichetta.includes('più scelto');
            return (
              <div key={p.id} className="acc-plan-card" style={{
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
                <button
                  onClick={() => showDemoToast(`L'acquisto del ${p.nome} sarà disponibile al lancio`)}
                  className="acc-plan-btn"
                  style={{
                  marginTop: 6, padding: '9px 12px', borderRadius: 999,
                  background: isPopular ? PN.BTN_BRAND : PN.BTN_DARK,
                  color: PN.WHITE,
                  border: isPopular ? '1px solid rgba(180, 30, 35, 0.40)' : '1px solid rgba(0, 0, 0, 0.32)',
                  fontSize: 14.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: isPopular ? `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.18)` : PN.INSET_HIGHLIGHT_DARK,
                }}>Acquista ora</button>
              </div>
            );
          })}
        </div>
      </AcCard>

      {/* Confronto funzionalità — leggibilità migliorata */}
      <ConfrontoTable/>

      {/* Toast demo — feedback per i CTA non ancora collegati al backend */}
      {toast && (
        <div role="status" aria-live="polite" style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15, 17, 21, 0.92)', color: '#fff',
          padding: '11px 20px', borderRadius: 999,
          fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
          boxShadow: '0 12px 32px rgba(15, 17, 21, 0.30)',
          zIndex: 200,
        }}>{toast}</div>
      )}
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

// Totale annuo come importo di fattura: sempre 2 decimali e migliaia separate.
// useGrouping esplicito perche' l'it-IT NON raggruppa i numeri a 4 cifre
// (1619,88 e' corretto come numero, ma per un importo si scrive 1.619,88).
const fmtTotaleAnnuo = (n) => new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true,
}).format(n);

function PianoCard({p, fmtPrice, displayPrezzo, periodo, totaleAnnuo, onCta}) {
  const isCurrent = p.current;
  const [hover, setHover] = React.useState(false);

  // Il negativo non e' piu' fisso sul piano consigliato: e' lo stato di hover
  // di QUALSIASI piano, tranne quello attuale. Passarci sopra col mouse
  // significa "sto valutando questo", ed e' li' che ha senso accenderlo.
  // Il piano attuale resta chiaro: non e' un'opzione da valutare, e' dove sei.
  const isNeg = hover && !isCurrent;

  const prezzoMostrato = displayPrezzo !== undefined ? displayPrezzo : p.prezzo;
  const periodoMostrato = periodo !== undefined ? periodo : p.periodo;

  // Stili del negativo (filled BRAND, scritte bianche).
  // Gradient con coda più scura (#C9363B) e testi secondari a opacità piena:
  // il bianco sul coral chiaro non reggeva il contrasto AA sui corpi piccoli.
  const styles = isNeg
    ? {
        bg: 'linear-gradient(135deg, #F75B60 0%, #C9363B 100%)',
        border: `1px solid rgba(180, 30, 35, 0.45)`,
        textColor: PN.WHITE,
        mutedColor: 'rgba(255, 255, 255, 0.95)',
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
        // Bianco pieno. Ci avevo provato con un gradient bianco-su-bianco per
        // far interpolare il passaggio al negativo, ma misurando si vede che
        // il gradient non si interpola affatto: scattava comunque. Trucco
        // inutile, rimosso — il passaggio e' istantaneo per scelta (vedi il
        // blocco <style> sopra).
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
    <div
      className="acc-plan-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 12, border: styles.border,
        padding: 16, position: 'relative',
        background: styles.bg,
        boxShadow: styles.shadow,
        display: 'flex', flexDirection: 'column',
        color: styles.textColor,
      }}>
      {isCurrent && <PianoBadge bg={PN.PINK} fg={PN.WHITE} label="ATTUALE"/>}
      {/* Il badge resta sul piano consigliato anche a riposo — e' il consiglio,
          non lo stato di hover. Ma si inverte insieme alla card: a riposo scuro
          su bianco (distinto dal rosa di ATTUALE, che convive nella stessa
          griglia), in negativo bianco su rosso. */}
      {p.highlight && !isCurrent && (
        <PianoBadge
          bg={isNeg ? PN.WHITE : PN.TEXT}
          fg={isNeg ? PN.PINK_DARK : PN.WHITE}
          label="CONSIGLIATO"
        />
      )}

      <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
        <PianoEmoji planId={p.id} size={22} monochrome={isNeg ? '#FFFFFF' : undefined}/>
        <div style={{fontSize: 16, fontWeight: 600, color: styles.textColor}}>{p.nome}</div>
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: totaleAnnuo !== undefined ? 2 : 12, flexWrap: 'wrap'}}>
        <span style={{fontSize: 28, fontWeight: 600, color: styles.priceColor, lineHeight: 1, letterSpacing: '-0.02em'}}>
          {prezzoMostrato === 0 ? 'Gratis' : `€${fmtPrice(prezzoMostrato)}`}
        </span>
        <span style={{fontSize: 13, color: styles.mutedColor}}>{prezzoMostrato === 0 ? '' : periodoMostrato}</span>
      </div>

      {/* Col piano annuale il prezzo grande resta il /mese (e' quello che si
          confronta fra piani), ma qui sotto compare quanto si paga davvero in
          una volta: senza, "Annuale" cambiava il numero senza mai dire il totale. */}
      {totaleAnnuo !== undefined && (
        <div style={{fontSize: 12.5, color: styles.mutedColor, marginBottom: 12}}>
          €{fmtTotaleAnnuo(totaleAnnuo)} all'anno + IVA
        </div>
      )}

      <div style={{
        padding: '8px 10px', borderRadius: 8,
        background: styles.chipBg, marginBottom: 12,
        fontSize: 13.5,
      }}>
        <div style={{fontWeight: 600, color: styles.chipText}}>{p.ordiniInclusi.toLocaleString('it-IT')} ordini/mese</div>
        <div style={{color: styles.chipText, marginTop: 2, opacity: isNeg ? 1 : 0.85}}>
          +{fmtPrice(p.ordineExtra)} €/extra
        </div>
      </div>

      {/* feat contiene solo le voci lista (ordini e prezzo extra sono nel chip) */}
      <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14, flex: 1}}>
        {p.feat.map((f, i) => (
          <li key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 14, color: styles.textColor, lineHeight: 1.4}}>
            <span aria-hidden="true" style={{color: styles.checkColor, marginTop: 2, flexShrink: 0}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            {f}
          </li>
        ))}
      </ul>
      <button onClick={isCurrent ? undefined : onCta} className={isCurrent ? undefined : 'acc-plan-btn'} style={{
        width: '100%',
        padding: '10px 14px', borderRadius: 999,
        background: styles.ctaBg,
        color: styles.ctaColor,
        border: styles.ctaBorder,
        fontSize: 14.5, fontWeight: 600,
        cursor: isCurrent ? 'default' : 'pointer',
        fontFamily: 'inherit',
        boxShadow: isNeg
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
// FreeDowngradeModal — si apre da "Passa a Free": confronto fianco a fianco
// col piano attuale (stile mini plan-card) + recap esplicito di cosa si perde.
// La conferma resta demo (toast), come gli altri CTA della pagina.
// ─────────────────────────────────────────────────────────────────────────

function FreeDowngradeModal({ open, onClose, current, free, fmtPrice, onConfirm }) {
  if (!open) return null;

  const ordiniPersi = current.ordiniInclusi - free.ordiniInclusi;
  const losses = [
    `${ordiniPersi.toLocaleString('it-IT')} ordini inclusi in meno al mese (da ${current.ordiniInclusi.toLocaleString('it-IT')} a ${free.ordiniInclusi.toLocaleString('it-IT')})`,
    `Ogni ordine extra costerà di più: da ${fmtPrice(current.ordineExtra)} € a ${fmtPrice(free.ordineExtra)} €`,
    `Menù digitali: da ${current.menuShort.toLowerCase().replace(/^fino a /, '')} a un solo menù`,
    `Membri dello staff: da ${current.staffShort.toLowerCase().replace(/^fino a /, '')} a un solo membro`,
  ];

  // Mini plan-card del confronto (colonna attuale vs colonna Free)
  const MiniPiano = ({ nome, badge, badgeBg, badgeFg, prezzo, righe, bordered }) => (
    <div style={{
      position: 'relative', flex: 1, minWidth: 0,
      border: bordered ? `2px solid ${PN.PINK}` : `1px solid ${PN.BORDER_HAIR}`,
      borderRadius: 12, padding: '18px 16px 14px',
      background: PN.WHITE,
    }}>
      <PianoBadge bg={badgeBg} fg={badgeFg} label={badge}/>
      <div style={{display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6}}>
        <PianoEmoji planId={nome.toLowerCase()} size={20}/>
        <span style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>{nome}</span>
      </div>
      <div style={{fontSize: 21, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.02em', marginBottom: 10}}>{prezzo}</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
        {righe.map((r, i) => (
          <div key={i} style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.4}}>{r}</div>
        ))}
      </div>
    </div>
  );

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'rgba(15, 17, 21, 0.45)',
      display: 'grid', placeItems: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 580, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
        background: '#fff', borderRadius: 16,
        boxShadow: '0 24px 70px rgba(0, 0, 0, 0.28)',
        fontFamily: 'inherit',
      }} className="pn-scroll">
        {/* Header */}
        <div style={{padding: '20px 22px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12}}>
          <div>
            <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT}}>Passare al piano Free?</div>
            <div style={{fontSize: 14, color: PN.MUTED, marginTop: 3}}>
              Ecco cosa cambia rispetto al tuo piano {current.nome}.
            </div>
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: PN.MUTED, fontSize: 20, lineHeight: 1, padding: 4, fontFamily: 'inherit',
          }}>×</button>
        </div>

        {/* Confronto fianco a fianco */}
        <div style={{display: 'flex', gap: 12, padding: '10px 22px 4px'}}>
          <MiniPiano
            nome={current.nome}
            badge="ATTUALE" badgeBg={PN.PINK} badgeFg={PN.WHITE}
            prezzo={`€${fmtPrice(current.prezzo)}${current.periodo}`}
            bordered
            righe={[
              `${current.ordiniInclusi.toLocaleString('it-IT')} ordini/mese`,
              `+${fmtPrice(current.ordineExtra)} € a ordine extra`,
              current.menu,
              current.staff,
            ]}
          />
          <MiniPiano
            nome={free.nome}
            badge="FREE" badgeBg={PN.WHITE_OFF} badgeFg={PN.MUTED}
            prezzo="Gratis"
            righe={[
              `${free.ordiniInclusi.toLocaleString('it-IT')} ordini/mese`,
              `+${fmtPrice(free.ordineExtra)} € a ordine extra`,
              'Un solo menù digitale',
              'Un solo membro dello staff',
            ]}
          />
        </div>

        {/* Recap di cosa si perde */}
        <div style={{padding: '14px 22px 6px'}}>
          <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Cosa perderai passando a Free</div>
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
            padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {losses.map((l, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: '#7F1D1D', lineHeight: 1.45}}>
                <span aria-hidden="true" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 16, height: 16, borderRadius: 999, flexShrink: 0, marginTop: 1,
                  background: '#FECACA', color: '#B91C1C',
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"><path d="M5 12h14"/></svg>
                </span>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Azioni — mantieni (primaria) vs downgrade (secondaria) */}
        <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '16px 22px 20px'}}>
          <button onClick={onConfirm} style={{
            padding: '10px 18px', borderRadius: 999,
            background: 'transparent', color: '#B91C1C',
            border: '1px solid #FECACA',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Passa a Free</button>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: 999,
            background: PN.BTN_DARK, color: PN.WHITE,
            border: '1px solid rgba(0, 0, 0, 0.32)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: PN.INSET_HIGHLIGHT_DARK,
          }}>Mantieni {current.nome}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ConfrontoTable — leggibilità migliorata: header neutro WHITE_OFF, righe
// alternate WHITE/WHITE_HUSH, check verde su pillola GREEN_SOFT, em-dash chiaro.
// ─────────────────────────────────────────────────────────────────────────

function ConfrontoTable() {
  // Righe generate da ACC_PIANI: un solo posto da aggiornare quando cambiano
  // prezzi o limiti (prima erano stringhe duplicate hardcoded qui).
  const fmt = (n) => n.toFixed(2).replace('.', ',');
  const rows = [
    ['Ordini inclusi/mese',                    ...ACC_PIANI.map(p => p.ordiniInclusi.toLocaleString('it-IT'))],
    ['Costo per ordine extra',                 ...ACC_PIANI.map(p => `${fmt(p.ordineExtra)} €+IVA`)],
    ['Menù digitali',                          ...ACC_PIANI.map(p => p.menuShort)],
    [
      // Parentesi in peso/corpo ridotto: annotazione, non parte del nome riga
      <React.Fragment key="disp">
        Dispositivi collegabili{' '}
        <span style={{fontWeight: 400, fontSize: 13, color: PN.MUTED}}>(staff, kitchen monitor)</span>
      </React.Fragment>,
      ...ACC_PIANI.map(p => p.staffShort),
    ],
    ['Assistenza via chat, tutorial e ticket', ...ACC_PIANI.map(() => '✓')],
    ['Supporto telefonico 24/7',               ...ACC_PIANI.map(p => p.supPhone ? '✓' : '—')],
    ['Richiamata entro 30 minuti',             ...ACC_PIANI.map(p => p.supCallback ? '✓' : '—')],
    ['Canale riservato prioritario',           ...ACC_PIANI.map(p => p.supPriority ? '✓' : '—')],
  ];

  // Render cella: ✓ → check verde su pillola, — → muted, altro → testo.
  // aria-label su ✓/— : sono simboli puri, senza label lo screen reader tace.
  const renderCell = (c) => {
    if (c === '✓') {
      return (
        <span role="img" aria-label="Incluso" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: 999,
          background: PN.GREEN_SOFT, color: PN.GREEN,
        }}>
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      );
    }
    if (c === '—') {
      return <span role="img" aria-label="Non incluso" style={{color: PN.MUTED_LIGHT, fontSize: 16, fontWeight: 500}}>—</span>;
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
        {/* Header — neutro WHITE_OFF, NIENTE pink_soft. Tipografia uppercase muted.
            Il piano attuale è segnalato col chip "attuale"; il consigliato in rosa. */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          padding: '14px 18px',
          background: PN.WHITE_OFF,
          borderBottom: `1px solid ${PN.BORDER_HAIR}`,
          fontSize: 13, fontWeight: 600, color: PN.MUTED,
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          <span>Funzionalità</span>
          {ACC_PIANI.map(p => (
            <span key={p.id} style={{
              textAlign: 'center',
              color: p.highlight ? PN.PINK_DARK : (p.current ? PN.TEXT : PN.MUTED),
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {p.nome}
              {p.current && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
                  padding: '1px 6px', borderRadius: 999,
                  background: PN.PINK_SOFT, color: PN.PINK_DARK,
                  textTransform: 'none',
                }}>attuale</span>
              )}
            </span>
          ))}
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
