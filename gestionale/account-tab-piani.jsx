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

  // Modale downgrade a Gratuito: confronto col piano attuale + recap delle perdite
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

  // CTA del piano attuale → sezione "Ordini aggiuntivi" qui sotto.
  // Il contenitore che scrolla non e' window ma il .pn-scroll di account-app,
  // quindi si usa scrollIntoView (che risale al primo antenato scrollabile)
  // e non un calcolo su window.scrollTo, che non muoverebbe nulla.
  const ordiniExtraRef = React.useRef(null);
  const scrollToOrdiniExtra = () => {
    ordiniExtraRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  // Deep-link ?invita=1 (dalla scorciatoia in Panoramica e da ⌘K): apre
  // direttamente il popup. In pagina l'invito è una riga sola: chi arriva da
  // fuori vuole il codice, non trovare la riga e cliccarla.
  const [invitaModal, setInvitaModal] = React.useState(() => {
    try { return new URLSearchParams(window.location.search).get('invita') === '1'; } catch (e) { return false; }
  });

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
          — sfondo, testi, spunte, CTA — avviene di scatto, tutto nello
          stesso frame.

          Perche' niente transizione sui colori: lo sfondo e' un gradient, e il
          gradient NON si interpola (misurato: a 120ms era gia' al valore
          finale). Mettere una transizione sul solo `color` faceva quindi
          arrivare il testo ~240ms dopo lo sfondo — la card diventava rossa con
          le scritte ancora scure, e si leggeva come un ritardo. O si anima
          tutto o niente: siccome lo sfondo non puo', non anima nessuno. */}
      <style>{`
        .acc-plan-card {
          transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 200ms ease;
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

        /* CTA ghost dei pacchetti. Niente brightness in hover: sul bianco
           sbiancava anche il bordo, che spariva proprio mentre il bottone
           chiedeva attenzione. Qui il bordo vive nella classe (non inline,
           altrimenti vincerebbe sempre lui) e in hover si SCURISCE. */
        .acc-pack-btn {
          background: #fff;
          color: #0F1115;
          border: 1px solid #D3D8DE;
          transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1),
                      border-color 140ms ease, box-shadow 140ms ease;
        }
        .acc-pack-btn:hover {
          transform: translateY(-1px) scale(1.03);
          border-color: #9AA1AB;
          box-shadow: 0 2px 8px rgba(15,17,21,0.10);
        }
        .acc-pack-btn:active { transform: translateY(0) scale(0.96); }

        /* Bordo aurora che gira attorno alla card in hover.
           Il ring e' uno pseudo-elemento a inset -2px riempito da gradient
           conici mascherati a cornice (mask xor), cosi' il colore non copre
           il contenuto. L'angolo e' una custom property registrata
           (@property) — senza registrazione un angolo in un gradient NON si
           interpola e l'animazione non parte. Dove @property non c'e', il
           ring resta fermo ma acceso: degrada, non sparisce.
           v3 (feedback utente: niente arcobaleno, "polvere di stelle"):
           solo palette aurora — corallo, rosa, lavanda. Quattro layer sulla
           stessa cornice: una cometa principale con coda lunga e testa
           bianca, una scia lavanda sul lato opposto, e due giri di
           scintille (repeating-conic con tick sottili) che ruotano a
           velocita' diverse, uno in senso contrario — il luccichio non e'
           mai in fase e la cornice sembra brace di fuoco d'artificio.
           I moltiplicatori degli angoli non sono liberi: perche' il loop
           0→360 chiuda senza scatto, la rotazione totale di ogni layer deve
           essere multipla del proprio periodo (1.6×360 = 576 = 32×18deg;
           2×360 = 720 = 24×30deg). */
        @property --acc-aurora-ang {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes acc-aurora-spin {
          to { --acc-aurora-ang: 360deg; }
        }
        .acc-plan-aurora::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2.5px;
          background:
            repeating-conic-gradient(
              from calc(var(--acc-aurora-ang) * -1.6),
              rgba(255, 255, 255, 0) 0deg 17.4deg,
              rgba(255, 214, 231, 0.80) 17.4deg 18deg
            ),
            repeating-conic-gradient(
              from calc(var(--acc-aurora-ang) * 2 + 7deg),
              rgba(255, 255, 255, 0) 0deg 29.2deg,
              rgba(226, 217, 255, 0.70) 29.2deg 30deg
            ),
            conic-gradient(
              from calc(var(--acc-aurora-ang) + 180deg),
              transparent 0deg 300deg,
              rgba(167, 139, 250, 0.55) 340deg,
              rgba(240, 234, 255, 0.90) 356deg,
              transparent 357deg 360deg
            ),
            conic-gradient(
              from var(--acc-aurora-ang),
              transparent 0deg 150deg,
              rgba(167, 139, 250, 0.20) 210deg,
              rgba(244, 114, 182, 0.45) 275deg,
              rgba(255, 90, 95, 0.85) 330deg,
              #FFE9F2 352deg,
              #FFFFFF 356deg,
              transparent 357deg 360deg
            );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          opacity: 0;
          transition: opacity 200ms ease;
          pointer-events: none;
        }
        .acc-plan-aurora:hover::before {
          opacity: 1;
          animation: acc-aurora-spin 2.6s linear infinite;
          /* Doppio alone rosa+lavanda: e' il glow della scintilla, non un
             bordo — segue solo i punti accesi grazie al drop-shadow. */
          filter: saturate(1.15)
                  drop-shadow(0 0 5px rgba(244, 114, 182, 0.55))
                  drop-shadow(0 0 12px rgba(167, 139, 250, 0.45));
        }
        @media (prefers-reduced-motion: reduce) {
          .acc-plan-aurora:hover::before { animation: none; }
          .acc-plan-card { transition: none; }
        }
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

      {/* Porta un ristorante — il pezzo di marketing della pagina, costruito
          sull'immagine di riferimento: promessa e tre ragioni a sinistra, il
          regalo coi coriandoli in mezzo (SVG, niente asset), e a destra la
          carta bianca del premio con la CTA in gradiente. Il premio è il piano
          più alto del listino: è la carta "il più conveniente". */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto 258px',
        alignItems: 'center', gap: 16,
        padding: '18px 22px', borderRadius: 20,
        background:
          'radial-gradient(circle at 8% 0%, rgba(255, 200, 210, 0.55) 0%, transparent 55%), ' +
          'linear-gradient(100deg, #FFE9EC 0%, #FBEFF3 40%, #F7F1FB 74%, #F4F0FC 100%)',
        border: '1px solid rgba(190, 175, 220, 0.28)',
      }}>
        {/* ─── Promessa e ragioni ───────────────────────────────────────── */}
        <div style={{minWidth: 0}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
            <span style={{
              width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
              background: PN.PINK_DARK, color: PN.WHITE,
              display: 'grid', placeItems: 'center',
              boxShadow: '0 4px 10px rgba(224, 67, 71, 0.30)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="8.2" r="3.4"/>
                <path d="M2.6 19.4c0-3.5 2.9-5.5 6.4-5.5s6.4 2 6.4 5.5z"/>
                <circle cx="17.2" cy="9.2" r="2.6"/>
                <path d="M16 14.2c3 .1 5.4 1.7 5.4 4.4h-4.6"/>
              </svg>
            </span>
            <div style={{minWidth: 0}}>
              <div style={{fontSize: 26, fontWeight: 800, color: PN.TEXT, letterSpacing: -0.7, lineHeight: 1.12, whiteSpace: 'nowrap'}}>
                Porta un ristorante su{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #FF5A5F 10%, #7C3AED 95%)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', color: 'transparent',
                }}>byup</span>
              </div>
              <div style={{fontSize: 14.5, fontWeight: 600, color: '#3F4350', marginTop: 3, whiteSpace: 'nowrap'}}>
                Quando attiva un abbonamento, 2 mesi gratis a testa.
              </div>
            </div>
          </div>

          {/* Le tre obiezioni che uno si fa prima di invitare qualcuno: è
              complicato? ci guadagno? quante volte posso? */}
          <div style={{display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 18}}>
            {[
              ['È semplice',    'Invita con un link'],
              ['È vantaggioso', 'Voi 2 risparmiate'],
              ['È illimitato',  'Invita quanti vuoi'],
            ].map(([titolo, sotto]) => (
              <div key={titolo} style={{display: 'flex', alignItems: 'flex-start', gap: 9}}>
                <span style={{
                  width: 23, height: 23, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: PN.WHITE, color: '#DB2777',
                  border: '1.5px solid rgba(219, 39, 119, 0.40)',
                  boxShadow: '0 1px 3px rgba(219, 39, 119, 0.12)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                </span>
                <span>
                  <span style={{display: 'block', fontSize: 14, fontWeight: 800, color: PN.TEXT, lineHeight: 1.25, whiteSpace: 'nowrap'}}>{titolo}</span>
                  <span style={{display: 'block', fontSize: 13, color: PN.MUTED, marginTop: 1, whiteSpace: 'nowrap'}}>{sotto}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Freccia e regalo ─────────────────────────────────────────── */}
        <AcRegaloIllustrazione/>

        {/* ─── La carta del premio ──────────────────────────────────────── */}
        <div style={{
          background: PN.WHITE, borderRadius: 18,
          border: '1px solid rgba(190, 175, 220, 0.30)',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.10), 0 1px 2px rgba(15,17,21,0.05)',
          padding: '16px 18px',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: PN.TEXT,
            letterSpacing: 0.9, textTransform: 'uppercase',
          }}>Il più conveniente</div>
          <div style={{fontSize: 20, fontWeight: 800, color: PN.TEXT, letterSpacing: -0.4, marginTop: 8, lineHeight: 1.22}}>
            Ottieni gratuitamente
          </div>
          <div style={{
            fontSize: 20, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.22,
            background: 'linear-gradient(90deg, #DB2777 5%, #7C3AED 90%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
          }}>
            {ACC_REFERRAL.ordiniPerInvito.toLocaleString('it-IT', {useGrouping: true})} ordini senza scadenza
          </div>
          <button onClick={() => setInvitaModal(true)} style={{
            width: '100%', marginTop: 16,
            padding: '12px 16px', borderRadius: 999,
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'linear-gradient(100deg, #FF5A5F 0%, #A78BFA 100%)',
            color: PN.WHITE, border: '1px solid rgba(124, 58, 237, 0.30)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 16px rgba(167,139,250,0.45)',
          }}>
            Ottieni Gratuitamente
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13"/><path d="m12.5 5.5 6.5 6.5-6.5 6.5"/></svg>
          </button>
        </div>
      </div>

      {/* Cambia piano: la decisione successiva naturale dopo aver
          visto risparmio + utilizzo. */}
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

        {/* Gratuito escluso dalla griglia: il downgrade non merita la stessa
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
              onCta={p.current
                ? scrollToOrdiniExtra
                : () => showDemoToast(`Il passaggio al piano ${p.nome} sarà disponibile al lancio`)}
            />
          ))}
        </div>

        {/* Piano Gratuito — downgrade come nota secondaria, non come card.
            Il click apre il modale di confronto, non il cambio diretto. */}
        <div style={{marginTop: 16, textAlign: 'center', fontSize: 13.5, color: PN.MUTED, lineHeight: 1.5}}>
          Vuoi rinunciare ai vantaggi del tuo piano attuale? Valuta il piano <strong style={{color: PN.TEXT}}>Gratuito</strong>:{' '}{freePlan.ordiniInclusi.toLocaleString('it-IT', {useGrouping: true})} ordini/mese, poi {fmtPrice(freePlan.ordineExtra)} € a ordine.{' '}
          <button
            onClick={() => setFreeModal(true)}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: PN.PINK_DARK, fontWeight: 600, fontSize: 13.5,
              cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
            }}>Passa al piano Gratuito</button>
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
          showDemoToast('Il passaggio al piano Gratuito sarà disponibile al lancio');
        }}
      />

      {invitaModal && (
        <InvitaRistoranteModal current={current} onClose={() => setInvitaModal(false)}/>
      )}

      {/* Pacchetti ordini extra — bersaglio del CTA "Voglio più ordini".
          scrollMarginTop tiene il titolo staccato dal bordo alto dopo lo scroll. */}
      <div ref={ordiniExtraRef} id="ordini-aggiuntivi" style={{scrollMarginTop: 16}}>
      <AcCard
        title={
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'}}>
            Più ordini con lo stesso piano
            {/* Chip nel linguaggio di IL PIÙ SCELTO: bianco, bordo lavanda,
                testo in gradient — l'accento aurora cita, non urla. */}
            <span style={{
              padding: '3px 10px', borderRadius: 6, letterSpacing: 0.5,
              background: PN.WHITE, border: '1px solid rgba(167, 139, 250, 0.45)',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.14)',
            }}>
              <span style={{fontSize: 12, fontWeight: 700, ...AURORA_TEXT_GRADIENT}}>SENZA SCADENZA</span>
            </span>
          </span>
        }
        subtitle="Aggiungi ordini per gestire i picchi senza cambiare piano: si sommano a quelli già inclusi."
      >
        {/* I pacchetti sono un gradino SOTTO i piani nella gerarchia della
            pagina: card bianche (l'aurora e' la firma dei piani), tipografia
            piu' piccola, ombra piu' leggera, niente ring in hover, CTA ghost.
            Restano nella famiglia solo il numero in gradient (piu' piccolo)
            e il badge del piu' scelto. */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12}}>
          {ACC_PACCHETTI.map((p) => {
            // Badge dai dati (campo etichetta), non dalla posizione nell'array
            const isBest = p.etichetta.includes('miglior valore');
            const isPopular = p.etichetta.includes('più scelto');
            return (
              <div key={p.id} className="acc-plan-card" style={{
                padding: 14, borderRadius: 12,
                // BORDER pieno, non hairline: su card bianca dentro AcCard
                // bianca il bordo e' l'unico confine, e deve vedersi.
                border: `1px solid ${PN.BORDER}`,
                background: PN.WHITE,
                boxShadow: '0 2px 5px rgba(15,17,21,0.06), 0 12px 26px -10px rgba(15,17,21,0.16)',
                display: 'flex', flexDirection: 'column', gap: 7,
                position: 'relative',
              }}>
                {isPopular && <BadgePiuScelto/>}
                {/* Verde soft, non pieno: sul gradino secondario anche i badge
                    abbassano la voce. */}
                {isBest && <PianoBadge bg={PN.GREEN_SOFT} fg={PN.GREEN} label="MIGLIOR VALORE"/>}
                <div style={{fontSize: 14.5, fontWeight: 600, color: PN.TEXT}}>{p.nome}</div>
                <div>
                  <span style={{display: 'inline-flex', alignItems: 'baseline', gap: 5, ...AURORA_TEXT_GRADIENT}}>
                    <span style={{fontSize: 20, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em'}}>
                      +{p.ordini.toLocaleString('it-IT', {useGrouping: true})}
                    </span>
                    <span style={{fontSize: 13, fontWeight: 600}}>ordini</span>
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 1}}>
                  <span style={{fontSize: 17, fontWeight: 600, color: PN.TEXT}}>€{fmtPrice(p.prezzo)}</span>
                  <span style={{fontSize: 12.5, color: PN.MUTED}}>pagamento unico + IVA</span>
                </div>
                <div style={{fontSize: 12.5, color: PN.MUTED}}>
                  {fmtPrice(Math.round((p.prezzo / p.ordini) * 100) / 100)} € a ordine
                </div>
                <button
                  onClick={() => showDemoToast(`L'acquisto del ${p.nome} sarà disponibile al lancio`)}
                  className="acc-pack-btn"
                  style={{
                  marginTop: 5, padding: '8px 12px', borderRadius: 999,
                  fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Acquista ora</button>
              </div>
            );
          })}
        </div>
      </AcCard>
      </div>

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

// Sparkline del trend di risparmio — PICCOLA, in linea accanto al dato: un
// accenno di trend, non una fascia. Costruzione come WSparkline (cubic Bezier,
// control point a metà segmento), statica, con due punti evidenziati. I valori
// sono un trend illustrativo su 8 settimane: non c'è ancora storico a backend.
// height:auto + preserveAspectRatio meet + non-scaling-stroke → resta piccola,
// linea crisp e pallini tondi.
function RisparmioSpark({width = 130, height = 48, color = '#10B981'}) {
  const data = [48, 42, 56, 64, 74, 74, 86, 100]; // lieve flessione iniziale → salita fino al picco
  const PAD_X = 5, PAD_T = 7, PAD_B = 5;
  const n = data.length;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = PAD_X + (i / (n - 1)) * (width - PAD_X * 2);
    const y = PAD_T + (1 - (v - min) / range) * (height - PAD_T - PAD_B);
    return [x, y];
  });
  let line = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const cx = (x1 + x2) / 2;
    line += ` C ${cx.toFixed(2)} ${y1.toFixed(2)}, ${cx.toFixed(2)} ${y2.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
  const area = line + ` L ${(width - PAD_X).toFixed(2)} ${height} L ${PAD_X.toFixed(2)} ${height} Z`;
  const dots = [pts[5], pts[n - 1]]; // spalla (~71%) + picco finale
  const gid = 'risp-spark-grad';
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
         style={{width: '100%', height: 'auto', display: 'block', overflow: 'visible'}} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
      {dots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="#fff"/>
          <circle cx={x} cy={y} r="2.5" fill={color}/>
        </g>
      ))}
    </svg>
  );
}

function RisparmioCard({euroRisparmiati, ordiniRisparmiati, fmtPrice}) {
  // Card "Risparmio" (semantica emerald = soldi risparmiati, eccezione
  // documentata al sistema W1/L2/D3). Layout allineato al mock: card chiara,
  // icona tonda col $, trend sparkline in alto a destra, e la spiegazione
  // "0,5 invece di 1" in un riquadro dedicato con icona sparkle. La coppia con
  // UtilizzoCard resta chiara+scura, quindi lo schiarimento non la rompe.
  const EMERALD = '#10B981';
  return (
    <div className="glass-lift-hover" style={{
      position: 'relative',
      overflow: 'hidden',
      padding: '15px 17px',
      borderRadius: 14,
      minHeight: 168,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      gap: 11,
      background:
        'linear-gradient(180deg, rgba(240,253,248,0.92) 0%, rgba(255,255,255,0.98) 58%), ' +
        '#FFFFFF',
      border: 'none',
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.90), ' +
        'inset 0 0 0 1px rgba(16, 185, 129, 0.16), ' +
        '0 8px 24px -10px rgba(16, 185, 129, 0.20), ' +
        '0 2px 6px -2px rgba(15, 17, 21, 0.05)',
      color: '#064E3B',
    }}>
      {/* Dato chiave + sparkline piccola in linea, centrato verticalmente.
          Il grafico è un accenno di trend accanto al numero, non una fascia. */}
      <div style={{flex: 1, display: 'flex', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, width: '100%'}}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
            color: '#fff',
            display: 'grid', placeItems: 'center', flexShrink: 0,
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.40), inset 0 1px 0 rgba(255,255,255,0.35)',
          }}>
            <PnI.Money size={24} color="#fff"/>
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 13.5, color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7}}>
              Risparmiato questo mese
            </div>
            <div style={{fontSize: 44, fontWeight: 700, color: '#064E3B', lineHeight: 1.05, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginTop: 3, whiteSpace: 'nowrap'}}>
              {fmtPrice(euroRisparmiati)} €
            </div>
            <div style={{fontSize: 15.5, color: '#6B8578', marginTop: 3, fontWeight: 500}}>
              {ordiniRisparmiati.toLocaleString('it-IT', {useGrouping: true})} ordini a metà prezzo
            </div>
          </div>
          <div style={{flex: '0 1 120px', minWidth: 56, alignSelf: 'center'}}>
            <RisparmioSpark color={EMERALD}/>
          </div>
        </div>
      </div>

      {/* Callout: perché si risparmia — nota separata con icona sparkle */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '9px 12px', borderRadius: 10,
        background: 'rgba(16, 185, 129, 0.06)',
        border: '1px solid rgba(16, 185, 129, 0.16)',
      }}>
        <div style={{flexShrink: 0, marginTop: 1, lineHeight: 0}}>
          <PnI.Sparkle size={15} color={EMERALD}/>
        </div>
        <div style={{fontSize: 13, color: '#0F5132', lineHeight: 1.4}}>
          Gli ordini fatti dai clienti tramite app vengono contati come <strong style={{color: '#047857', fontWeight: 700}}>0,5 invece di 1</strong>: più i clienti ordinano da soli e meno paghi.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Card "Utilizzo ordini" — barra + breakdown POS / App
// ─────────────────────────────────────────────────────────────────────────

// Tile icona coral morbida — riquadro tinta brand con icona coral. Riusato da
// header e dai due box POS/App.
function UsoIconTile({children, size = 32, radius = 9}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: 'rgba(255, 90, 95, 0.10)',
      display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>{children}</div>
  );
}

// Freccia sottile 880 → 440 (conversione ordini app). Coral, stroke coerente
// con le icone PnI.
function UsoArrow({color}) {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke={color}
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 7h13"/><path d="M11 2.5l5 4.5-5 4.5"/>
    </svg>
  );
}

function UtilizzoCard({ordiniPos, ordiniApp, ordiniUsati, current, pct, fmtPrice}) {
  // Card "Utilizzo ordini" — riscritta chiara/coral come da mock (prima era una
  // D3 sunset glass scura). La coppia con RisparmioCard resta coerente: emerald
  // chiara (soldi) a sinistra, coral chiara (utilizzo/brand) a destra. Il coral
  // qui è tema, non stato d'allarme — la soglia amber >=90% resta l'unico segnale
  // di "quasi pieno".
  const CORAL = '#FF5A5F';        // brand — fill barra, badge, tile icone
  const CORAL_TEXT = '#E5484D';   // coral leggermente più profondo, per testo su bianco
  const disponibili = current.ordiniInclusi - ordiniUsati;
  const ordiniAppPesati = Math.round(ordiniApp * 0.5);

  // Rinnovo: calcolato a runtime (primo del mese prossimo) così non si cabla una
  // data che invecchia. Formato esteso it-IT → "1 agosto 2026".
  const rin = new Date();
  const rinnovo = new Date(rin.getFullYear(), rin.getMonth() + 1, 1)
    .toLocaleDateString('it-IT', {day: 'numeric', month: 'long', year: 'numeric'});

  const nfmt = (n) => n.toLocaleString('it-IT', {useGrouping: true});
  const barColor = pct >= 90 ? '#F59E0B' : CORAL;

  const label = {fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5};
  const boxNum = {fontSize: 20, fontWeight: 700, color: PN.TEXT, lineHeight: 1, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'};
  const boxSub = {fontSize: 11, marginTop: 3, lineHeight: 1.25};

  return (
    <div className="glass-lift-hover" style={{
      position: 'relative',
      overflow: 'hidden',
      padding: '15px 17px',
      borderRadius: 14,
      minHeight: 168,
      display: 'flex', flexDirection: 'column',
      background:
        'linear-gradient(180deg, rgba(255,246,246,0.92) 0%, rgba(255,255,255,0.98) 55%), ' +
        '#FFFFFF',
      border: 'none',
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.90), ' +
        'inset 0 0 0 1px rgba(255, 90, 95, 0.15), ' +
        '0 8px 24px -10px rgba(255, 90, 95, 0.20), ' +
        '0 2px 6px -2px rgba(15, 17, 21, 0.05)',
      color: PN.TEXT,
    }}>
      {/* Header: icona · (label + pill rinnovo) · sottotitolo piano.
          Il sottotitolo sta su riga propria a tutta larghezza — così non si
          spezza in modo brutto competendo con la pill. */}
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 11}}>
        <UsoIconTile size={38} radius={10}>
          <PnI.Stats size={19} color={CORAL}/>
        </UsoIconTile>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', rowGap: 6}}>
            <div style={{...label, fontSize: 12.5, color: CORAL_TEXT}}>Utilizzo ordini</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '4px 9px', borderRadius: 999,
              background: '#fff', border: '1px solid #E7E9ED',
              fontSize: 12, fontWeight: 600, color: PN.TEXT,
              boxShadow: '0 1px 2px rgba(15,17,21,0.04)',
            }}>
              <PnI.Calendar size={13} color={PN.MUTED}/>
              Si rinnova il {rinnovo}
            </div>
          </div>
          <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2}}>
            Piano {current.nome} · {fmtPrice(current.prezzo)}€ {current.periodo}
          </div>
        </div>
      </div>

      {/* Big number */}
      <div style={{display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 10}}>
        <span style={{fontSize: 27, fontWeight: 700, color: PN.TEXT, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>
          {nfmt(ordiniUsati)}
        </span>
        <span style={{fontSize: 14, color: PN.MUTED, fontWeight: 500}}>
          / {nfmt(current.ordiniInclusi)} inclusi
        </span>
      </div>

      {/* Progress */}
      <div style={{height: 8, background: '#EDEFF2', borderRadius: 99, overflow: 'hidden', marginTop: 9}}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${barColor} 0%, #FF7A6B 100%)`,
          borderRadius: 99,
          transition: 'width 400ms',
          boxShadow: `0 0 8px ${pct >= 90 ? 'rgba(245,158,11,0.45)' : 'rgba(255,90,95,0.45)'}`,
        }}/>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12.5, color: PN.MUTED}}>
        <span><strong style={{color: CORAL_TEXT, fontWeight: 700}}>{pct}%</strong> utilizzato</span>
        <span>{nfmt(disponibili)} ancora disponibili</span>
      </div>

      {/* Breakdown POS vs App */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 11}}>
        {/* Da cassa — neutro */}
        <div style={{padding: '10px 12px', borderRadius: 11, background: '#FBFBFC', border: '1px solid #ECEEF1'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <UsoIconTile size={26} radius={8}><PnI.Receipt size={13} color={CORAL}/></UsoIconTile>
            <span style={{...label, fontSize: 11, letterSpacing: 0.3, color: PN.TEXT}}>Da cassa (POS)</span>
          </div>
          <div style={{...boxNum, marginTop: 8}}>{nfmt(ordiniPos)}</div>
          <div style={{...boxSub, color: PN.MUTED}}>conteggiati al 100%</div>
        </div>

        {/* Da app clienti — coral, conversione ×0,5. Badge inline (non
            assoluto) così non finisce mai sopra la label. */}
        <div style={{padding: '10px 12px', borderRadius: 11, background: 'rgba(255, 90, 95, 0.06)', border: '1px solid rgba(255, 90, 95, 0.22)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <UsoIconTile size={26} radius={8}><PnI.Smartphone size={13} color={CORAL}/></UsoIconTile>
            <span style={{...label, fontSize: 11, letterSpacing: 0.3, color: CORAL_TEXT, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Da app clienti</span>
            <span style={{
              flexShrink: 0,
              fontSize: 10, fontWeight: 700, color: '#fff',
              padding: '2px 6px', borderRadius: 6, background: CORAL,
              boxShadow: '0 1px 3px rgba(255,90,95,0.4)',
            }}>−50%</span>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8}}>
            <div style={{minWidth: 0}}>
              <div style={boxNum}>{nfmt(ordiniApp)}</div>
              <div style={{...boxSub, color: PN.MUTED, whiteSpace: 'nowrap'}}>grezzi</div>
            </div>
            <div style={{flexShrink: 0, height: 20, display: 'flex', alignItems: 'center'}}>
              <UsoArrow color={CORAL}/>
            </div>
            <div style={{minWidth: 0}}>
              <div style={{...boxNum, color: CORAL_TEXT}}>{nfmt(ordiniAppPesati)}</div>
              <div style={{...boxSub, color: CORAL_TEXT, whiteSpace: 'nowrap'}}>conteggiati</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: costo ordine extra. marginTop auto → resta a filo in basso
          anche quando la card si stira all'altezza della Risparmio accanto. */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12,
        marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #EEF0F2',
      }}>
        <div style={{fontSize: 12.5, color: PN.MUTED, flexShrink: 0}}>
          Costo per ordine extra <strong style={{color: CORAL_TEXT, fontWeight: 700, fontSize: 13.5}}>{fmtPrice(current.ordineExtra)}€ + IVA</strong>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PianoCard — card di un piano (Gratuito/Starter/Plus/Business). Highlight = filled BRAND.
// PianoEmoji è definito in panoramica-plan-card.jsx → window.PianoEmoji
// (caricato in ogni pagina dashboard, condiviso col sidebar plan card).
// ─────────────────────────────────────────────────────────────────────────

// Totale annuo come importo di fattura: sempre 2 decimali e migliaia separate.
// useGrouping esplicito perche' l'it-IT NON raggruppa i numeri a 4 cifre
// (1619,88 e' corretto come numero, ma per un importo si scrive 1.619,88).
const fmtTotaleAnnuo = (n) => new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true,
}).format(n);

// Mesh aurora delle card upgrade — stesso wash di AcCard aurora
// (account-tab-dati.jsx), ma piu' tenue: qui il fondo deve reggere una lista di
// testo, non fare da superficie decorativa.
// Il regalo della fascia invito: il pacco neon (referral-regalo-neon.png),
// mostrato INTERO — niente ritaglio stretto sul pacco. L'immagine ha un fondo
// grigio a vignetta: la maschera radiale è tarata perché il pacco e il suo
// alone restino pienamente opachi e a sfumare siano solo i bordi grigi, così
// sul fondo aurora della fascia non compare il rettangolo.
function AcRegaloIllustrazione() {
  const maschera = 'radial-gradient(ellipse 50% 50% at 50% 50%, black 74%, transparent 98%)';
  return (
    <div style={{position: 'relative', width: 190, height: 184, flexShrink: 0}}>
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        WebkitMaskImage: maschera, maskImage: maschera,
      }}>
        {/* Il pacco nel file sta a ~51% / 49%: l'immagine è ancorata lì e
            scalata quel tanto che il regalo intero, alone compreso, stia
            dentro la zona opaca della maschera. */}
        <img src="referral-regalo-neon.png" alt="" style={{
          position: 'absolute', width: 420,
          left: '50%', top: '50%',
          transform: 'translate(-50.8%, -49.3%)',
        }}/>
      </div>
    </div>
  );
}

const AURORA_CARD_BG =
  'radial-gradient(circle at 18% 12%, rgba(255, 217, 231, 0.60) 0%, transparent 62%), ' +
  'radial-gradient(circle at 88% 22%, rgba(226, 217, 255, 0.55) 0%, transparent 60%), ' +
  'radial-gradient(circle at 55% 100%, rgba(255, 237, 216, 0.55) 0%, transparent 65%), ' +
  'linear-gradient(135deg, #FFF8F6 0%, #FBF8FF 100%)';

// "Aurora attiva" — l'accento della pagina e' il gradient coral→lavanda del
// badge IL PIU' SCELTO, esteso a CTA e dato chiave. Un solo accento, tre usi.

// CTA di upgrade/acquisto: mai nera — il gradient del badge come bottone.
const AURORA_CTA_STYLE = {
  background: 'linear-gradient(120deg, #FF5A5F 0%, #A78BFA 100%)',
  color: PN.WHITE,
  border: '1px solid rgba(124, 58, 237, 0.35)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.30), 0 2px 8px rgba(167,139,250,0.35)',
};

// Dato chiave (ordini/mese, +N ordini): testo in gradient magenta→viola.
// background-clip:text clippa il fill al glifo — i figli non devono avere
// background propri, e il colore vero e' il gradient, non `color`.
const AURORA_TEXT_GRADIENT = {
  background: 'linear-gradient(90deg, #DB2777, #7C3AED)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

// ─────────────────────────────────────────────────────────────────────────
// INVITA UN RISTORANTE — referral fra locali
// ─────────────────────────────────────────────────────────────────────────
// Due mesi gratis a testa: a chi invita e a chi arriva. In pagina è una riga
// sola — un'occasione, non una decisione da prendere adesso; qui dentro c'è
// tutto quello che serve per passare l'invito a qualcuno.
//
// Layout dal riferimento grafico: promessa in alto («2 mesi GRATIS!»), le due
// facce dello scambio affiancate — cosa ricevi tu, cosa riceve l'amico — col
// regalo sulla linea tratteggiata che le unisce, e in basso il LINK personale
// con «Copia» e i canali di condivisione. Il gesto principale è il link (che
// contiene il codice): si incolla in chat; il codice da dettare al telefono
// viaggia dentro il messaggio condiviso.

// Tondo dei piani nelle card dell'invito: un colore per piano, e dentro il
// segno del piano.
const ACC_INVITO_LETTERA_BG = {
  free: '#9AA1AB',
  starter: 'linear-gradient(135deg, #F59E0B, #F97316)',
  plus: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  business: 'linear-gradient(135deg, #DB2777, #7C3AED)',
};

function AcInvitoLettera({ piano }) {
  return (
    <div aria-hidden="true" style={{
      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
      background: ACC_INVITO_LETTERA_BG[piano.id] || PN.TEXT,
      display: 'grid', placeItems: 'center',
      color: PN.WHITE,
      boxShadow: '0 4px 10px rgba(15,17,21,0.16)',
    }}>
      {/* Il segno del piano, non la sua iniziale: il boccale dello Starter è
          quello che si vede nella sidebar tutti i giorni, una «S» non è di
          nessuno. Monocromatico bianco perché il tondo è già colorato. */}
      <PianoEmoji planId={piano.id} size={26} monochrome="#fff"/>
    </div>
  );
}

// «2 mesi di <Piano>» + eventuale condizione sotto: la riga base di entrambe
// le card. Il nome del piano è in gradient aurora, come i dati chiave della
// pagina.
function AcInvitoRiga({ piano, caption }) {
  const mesi = ACC_REFERRAL.mesiPerLato;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 13}}>
      <AcInvitoLettera piano={piano}/>
      <div style={{textAlign: 'left', minWidth: 0}}>
        <div style={{fontSize: 15, fontWeight: 600, color: PN.TEXT}}>{mesi} mesi di</div>
        <div style={{fontSize: 26, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.15, ...AURORA_TEXT_GRADIENT}}>
          {piano.nome}
        </div>
        {caption && (
          <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2, lineHeight: 1.35}}>{caption}</div>
        )}
      </div>
    </div>
  );
}

function AcInvitoChip({ label, fg, bg }) {
  return (
    <div style={{
      alignSelf: 'center', background: bg, color: fg,
      fontSize: 11, fontWeight: 800, letterSpacing: 0.7, textTransform: 'uppercase',
      padding: '5px 12px', borderRadius: 999, whiteSpace: 'nowrap',
    }}>{label}</div>
  );
}

// Il regalo fra le due card: lo stesso pacco neon della fascia in pagina
// (referral-regalo-neon.png), intero, col medesimo trucco della maschera
// radiale — sfuma solo la vignetta grigia del file, non il pacco, così qui
// in mezzo non compare il rettangolo.
function AcInvitoRegalo({ size = 118 }) {
  const maschera = 'radial-gradient(ellipse 50% 50% at 50% 50%, black 72%, transparent 96%)';
  return (
    <div style={{
      position: 'absolute', left: '50%', top: '50%',
      transform: 'translate(-50%, -50%)',
      width: size, height: size, overflow: 'hidden',
      WebkitMaskImage: maschera, maskImage: maschera,
    }}>
      {/* Il pacco nel file sta a ~51% / 49%; a width ≈ 2·size il regalo
          intero, alone compreso, resta nella zona opaca della maschera. */}
      <img src="referral-regalo-neon.png" alt="" style={{
        position: 'absolute', width: size * 2.05, left: '50%', top: '50%',
        transform: 'translate(-50.8%, -49.3%)',
      }}/>
    </div>
  );
}

const ACC_INVITO_CARD = {
  flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14,
  background: '#FBFAFE', border: '1px solid #ECE7F8', borderRadius: 18,
  padding: '16px 14px 18px',
};

function InvitaRistoranteModal({ current, onClose }) {
  const locale = (typeof window.byupReadLocale === 'function' ? window.byupReadLocale() : null) || { nome: 'Byup' };
  const codice = accCodiceInvito(locale.nome);
  const linkPieno = `https://byup.it/r/${codice}`;
  const mesi = ACC_REFERRAL.mesiPerLato;
  const ordiniInvito = ACC_REFERRAL.ordiniPerInvito;
  const fmtOrdini = (n) => n.toLocaleString('it-IT', {useGrouping: true});

  const starter = ACC_PIANI.find(p => p.id === 'starter');
  // Il controvalore dei 3.500 ordini: quanto costerebbero comprandoli coi
  // pacchetti di transazioni qui sotto, nella combinazione più conveniente
  // che li copre (oggi M + 3×S = 236 €). Derivato da ACC_PACCHETTI, non
  // hardcodato: se i tagli o i prezzi cambiano, il popup si aggiorna da sé.
  const valoreOrdini = (() => {
    const massimo = ordiniInvito + Math.max(...ACC_PACCHETTI.map(p => p.ordini));
    const dp = new Array(massimo + 1).fill(Infinity);
    dp[0] = 0;
    for (let q = 1; q <= massimo; q++) {
      for (const p of ACC_PACCHETTI) {
        if (q >= p.ordini && dp[q - p.ordini] + p.prezzo < dp[q]) dp[q] = dp[q - p.ordini] + p.prezzo;
      }
    }
    let migliore = Infinity;
    for (let q = ordiniInvito; q <= massimo; q++) if (dp[q] < migliore) migliore = dp[q];
    return migliore;
  })();

  const [copiato, setCopiato] = React.useState(false);
  // L'avviso sotto il link compare al primo «Copia» e RESTA: è un'istruzione
  // («passa proprio questo link»), non un feedback — sparire dopo un lampo
  // come il bottone lo ridurrebbe a rumore.
  const [avviso, setAvviso] = React.useState(false);
  const timer = React.useRef(null);
  const copia = () => {
    // writeText restituisce una Promise: senza .catch un rifiuto del browser
    // (pagina non a fuoco, permesso negato) finisce in console come errore non
    // gestito. Il feedback lo diamo comunque.
    try { navigator.clipboard && navigator.clipboard.writeText(linkPieno).catch(() => {}); } catch (e) {}
    setCopiato(true);
    setAvviso(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiato(false), 1800);
  };
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const messaggio = `Ti passo il mio link byup: ${linkPieno} — se attivi un abbonamento hai ${mesi} mesi di Starter gratis. Il codice è ${codice}.`;
  const condividiWhatsApp = () => {
    // WhatsApp è il canale su cui un ristoratore parla con un altro
    // ristoratore: messaggio già scritto, link dentro.
    window.open(`https://wa.me/?text=${encodeURIComponent(messaggio)}`, '_blank', 'noopener');
  };
  const condividiEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(`${mesi} mesi di byup gratis`)}&body=${encodeURIComponent(messaggio)}`;
  };
  const condividiAltro = () => {
    if (navigator.share) {
      navigator.share({ title: 'byup', text: messaggio, url: linkPieno }).catch(() => {});
      return;
    }
    condividiWhatsApp();
  };

  return (
    <AcPayModal onClose={onClose} width={620}>
      {/* Le keyframes del modale vivono nella tab Fatturazione, che qui non è
          montata: senza queste due la finestra comparirebbe di scatto. */}
      <style>{`
        @keyframes acPayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes acPayPop { 0% { opacity: 0; transform: scale(0.92) translateY(10px); } 100% { opacity: 1; transform: none; } }
      `}</style>

      {/* Testata centrata: titolo e promessa. La chiusura galleggia a destra. */}
      <div style={{position: 'relative', padding: '26px 56px 0', textAlign: 'center'}}>
        <div style={{fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: PN.TEXT}}>
          Invita un ristorante
        </div>
        <div style={{fontSize: 15, color: PN.MUTED, marginTop: 10, lineHeight: 1.45}}>
          Tu e il ristorante invitato riceverete
        </div>
        <div style={{fontSize: 26, fontWeight: 800, letterSpacing: -0.4, marginTop: 2, ...AURORA_TEXT_GRADIENT}}>
          un premio a testa!
        </div>
        <button onClick={onClose} aria-label="Chiudi" style={{
          position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: '50%',
          background: PN.WHITE, border: '1px solid rgba(15,17,21,0.10)',
          display: 'grid', placeItems: 'center', color: PN.TEXT, cursor: 'pointer',
        }}><PnI.X size={13}/></button>
      </div>

      {/* Le due facce dello scambio, col regalo sulla tratteggiata in mezzo */}
      <div style={{display: 'flex', alignItems: 'stretch', padding: '20px 26px 0'}}>
        <div style={ACC_INVITO_CARD}>
          <AcInvitoChip label="Tu ricevi" fg="#DB2777" bg="#FDEBF3"/>
          <div style={{textAlign: 'center', margin: 'auto 0', padding: '6px 0'}}>
            <div style={{fontSize: 40, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, ...AURORA_TEXT_GRADIENT}}>
              {fmtOrdini(ordiniInvito)}
            </div>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, marginTop: 2, lineHeight: 1.35}}>
              ordini aggiuntivi senza scadenza
            </div>
            <div style={{display: 'inline-flex', alignItems: 'baseline', gap: 6, marginTop: 8}}>
              <span style={{fontSize: 13, fontWeight: 600, color: PN.TEXT}}>dal valore di:</span>
              <span style={{fontSize: 22, fontWeight: 800, letterSpacing: -0.3, ...AURORA_TEXT_GRADIENT}}>
                {fmtOrdini(valoreOrdini)}€
              </span>
            </div>
          </div>
        </div>

        <div style={{position: 'relative', width: 104, flexShrink: 0}}>
          <div aria-hidden="true" style={{position: 'absolute', left: -10, right: -10, top: '50%', borderTop: '2px dashed #D9D2EE'}}/>
          <AcInvitoRegalo/>
        </div>

        <div style={ACC_INVITO_CARD}>
          <AcInvitoChip label="Il tuo amico riceve" fg="#7C3AED" bg="#EDE7FD"/>
          <div style={{display: 'flex', justifyContent: 'center', margin: 'auto 0', padding: '6px 0'}}>
            <AcInvitoRiga piano={starter} caption="gratuiti"/>
          </div>
        </div>
      </div>

      {/* Il link personale: la cosa da incollare, con «Copia» come gesto pieno */}
      <div style={{
        margin: '18px 26px 0', background: '#F6F6F9', borderRadius: 16,
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 13.5, fontWeight: 800, color: PN.TEXT}}>Il tuo link personale</div>
          <div style={{fontSize: 14, color: PN.MUTED, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {linkPieno}
          </div>
        </div>
        <button onClick={copia} style={{
          padding: '12px 26px', borderRadius: 13, fontSize: 15.5, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 7,
          ...AURORA_CTA_STYLE,
        }}>
          {copiato && <PnI.Check size={14}/>}
          {copiato ? 'Copiato' : 'Copia'}
        </button>
      </div>

      {avviso && (
        <div style={{
          fontSize: 13, fontWeight: 600, color: PN.TEXT, textAlign: 'center',
          padding: '10px 30px 0', animation: 'acPayFade 220ms ease both',
        }}>
          Assicurati che il tuo amico acceda a byup da questo link.
        </div>
      )}

      {/* I canali di condivisione: WhatsApp e mail piene, link e «altro» chiare */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '18px 26px 24px'}}>
        <div style={{fontSize: 13.5, color: PN.MUTED, marginRight: 4}}>Condividi via</div>
        <button onClick={condividiWhatsApp} aria-label="Condividi su WhatsApp" style={{...AcInvitoTondo, background: '#25D366', color: PN.WHITE}}>
          <IconaWhatsApp/>
        </button>
        <button onClick={condividiEmail} aria-label="Condividi via email" style={{...AcInvitoTondo, background: '#EF4444', color: PN.WHITE}}>
          <IconaMail/>
        </button>
        <button onClick={copia} aria-label="Copia il link" style={{...AcInvitoTondo, background: PN.WHITE, border: `1px solid ${PN.BORDER}`, color: PN.TEXT}}>
          <IconaLink/>
        </button>
        <button onClick={condividiAltro} aria-label="Altri modi per condividere" style={{...AcInvitoTondo, background: PN.WHITE, border: `1px solid ${PN.BORDER}`, color: PN.TEXT, fontSize: 17, fontWeight: 700, letterSpacing: 1}}>
          ···
        </button>
      </div>
    </AcPayModal>
  );
}

const AcInvitoTondo = {
  width: 42, height: 42, borderRadius: '50%', border: 'none', flexShrink: 0,
  display: 'grid', placeItems: 'center', cursor: 'pointer', fontFamily: 'inherit',
};

// PnI non ha questi glifi: tre icone inline solo per la fila di condivisione.
function IconaWhatsApp() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" style={{display: 'block'}}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
    </svg>
  );
}

function IconaMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/>
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>
    </svg>
  );
}

function IconaLink() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

function PianoCard({p, fmtPrice, displayPrezzo, periodo, totaleAnnuo, onCta}) {
  const isCurrent = p.current;

  const prezzoMostrato = displayPrezzo !== undefined ? displayPrezzo : p.prezzo;
  const periodoMostrato = periodo !== undefined ? periodo : p.periodo;

  // Ordine della card: icona+nome (headline) → ordini/mese (subheadline) →
  // 3 bullet → prezzo → CTA. Il prezzo sta in fondo, appena sopra il bottone:
  // prima si legge cosa si ottiene, poi quanto costa, poi si clicca.
  //
  // Il vecchio flip in negativo rosso su hover e' stato rimosso: gli upgrade
  // ora sono aurora a riposo e in hover accendono il bordo (vedi .acc-plan-aurora
  // nel blocco <style> in cima). Il piano attuale resta bianco e fermo —
  // non e' un'opzione da valutare, e' dove sei.
  //
  // La subheadline e' in gradient magenta→viola (AURORA_TEXT_GRADIENT), non
  // rosa e non viola piatto: e' lo stesso accento del badge e delle CTA
  // aurora — il dato chiave appartiene alla famiglia dell'accento, non al
  // testo neutro. Entrambi gli estremi del gradient stanno sopra 4,5:1 su
  // bianco (DB2777 4,9:1, 7C3AED 5,6:1) — AA anche nel punto piu' chiaro.
  const styles = isCurrent
    ? {
        bg: PN.WHITE,
        border: `1px solid ${PN.BORDER_HAIR}`,
        shadow: '0 2px 4px rgba(15,17,21,0.05), 0 14px 30px -10px rgba(15,17,21,0.16)',
      }
    : {
        bg: AURORA_CARD_BG,
        border: '1px solid rgba(190, 175, 220, 0.22)',
        shadow: '0 2px 4px rgba(15,17,21,0.05), 0 14px 32px -10px rgba(124, 58, 237, 0.16)',
      };

  return (
    <div
      className={isCurrent ? 'acc-plan-card' : 'acc-plan-card acc-plan-aurora'}
      style={{
        borderRadius: 12, border: styles.border,
        padding: 16, position: 'relative',
        background: styles.bg,
        boxShadow: styles.shadow,
        display: 'flex', flexDirection: 'column',
        color: PN.TEXT,
      }}>
      {/* Piano attuale: etichetta nera, non rosa. Non e' un'offerta da
          spingere — e' uno stato, e va letta come tale. */}
      {isCurrent && <PianoBadge bg={PN.TEXT} fg={PN.WHITE} label="PIANO ATTUALE"/>}
      {p.highlight && !isCurrent && <BadgePiuScelto/>}

      {/* Headline — icona + nome del piano */}
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <PianoEmoji planId={p.id} size={22}/>
        <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>{p.nome}</div>
      </div>

      {/* Subheadline — ordini inclusi nel mese, in gradient aurora */}
      <div style={{marginTop: 6}}>
        <span style={{display: 'inline-flex', alignItems: 'baseline', gap: 6, ...AURORA_TEXT_GRADIENT}}>
          <span style={{fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em'}}>
            {p.ordiniInclusi.toLocaleString('it-IT', {useGrouping: true})}
          </span>
          <span style={{fontSize: 14, fontWeight: 600}}>ordini/mese</span>
        </span>
      </div>
      <div style={{fontSize: 13, color: PN.MUTED, marginTop: 4, marginBottom: 14}}>
        poi {fmtPrice(p.ordineExtra)} € a ordine extra
      </div>

      {/* I tre bullet point */}
      <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14, flex: 1}}>
        {p.feat.map((f, i) => (
          <li key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 14, color: PN.TEXT, lineHeight: 1.4}}>
            <span aria-hidden="true" style={{color: PN.GREEN, marginTop: 2, flexShrink: 0}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* Prezzo — ultimo dato prima della CTA */}
      <div style={{display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap'}}>
        <span style={{fontSize: 22, fontWeight: 700, color: PN.TEXT, lineHeight: 1, letterSpacing: '-0.02em'}}>
          {prezzoMostrato === 0 ? 'Gratis' : `€${fmtPrice(prezzoMostrato)}`}
        </span>
        <span style={{fontSize: 13, color: PN.MUTED}}>{prezzoMostrato === 0 ? '' : periodoMostrato}</span>
      </div>

      {/* Col piano annuale il prezzo grande resta il /mese (e' quello che si
          confronta fra piani), ma qui sotto compare quanto si paga davvero in
          una volta: senza, "Annuale" cambiava il numero senza mai dire il totale. */}
      {totaleAnnuo !== undefined && (
        <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 3}}>
          €{fmtTotaleAnnuo(totaleAnnuo)} all'anno + IVA
        </div>
      )}

      {/* CTA. Sul piano attuale non ha senso "Passa a Starter": l'unico
          upgrade possibile senza cambiare piano sono gli ordini aggiuntivi,
          quindi il bottone porta li'. Gli upgrade non sono piu' neri: la CTA
          e' il gradient aurora del badge (AURORA_CTA_STYLE), stesso accento
          della subheadline. Il piano attuale resta brand rosso. */}
      <button onClick={onCta} className="acc-plan-btn" style={{
        width: '100%', marginTop: 14,
        padding: '10px 14px', borderRadius: 999,
        fontSize: 14.5, fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        ...(isCurrent
          ? {
              background: PN.BTN_BRAND,
              color: PN.WHITE,
              border: '1px solid rgba(180, 30, 35, 0.40)',
              boxShadow: `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.18)`,
            }
          : AURORA_CTA_STYLE),
      }}>
        {isCurrent ? 'Voglio più ordini' : 'Passa a ' + p.nome}
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

// Badge "IL PIU' SCELTO" — chip bianco con testo in gradient e bordo lavanda.
// NON riusa il gradient pieno della CTA: badge e bottone sono elementi
// diversi e non devono leggersi come lo stesso blocco di colore. Il gradient
// pieno resta all'azione; il badge lo cita solo nel testo.
function BadgePiuScelto() {
  return (
    <div style={{
      position: 'absolute', top: -10, right: 14,
      background: PN.WHITE,
      border: '1px solid rgba(167, 139, 250, 0.45)',
      padding: '3px 10px', borderRadius: 6, letterSpacing: 0.5,
      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.14)',
    }}>
      <span style={{fontSize: 12, fontWeight: 700, ...AURORA_TEXT_GRADIENT}}>IL PIÙ SCELTO</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FreeDowngradeModal — si apre da "Passa al piano Gratuito": confronto fianco a fianco
// col piano attuale (stile mini plan-card) + recap esplicito di cosa si perde.
// La conferma resta demo (toast), come gli altri CTA della pagina.
// ─────────────────────────────────────────────────────────────────────────

function FreeDowngradeModal({ open, onClose, current, free, fmtPrice, onConfirm }) {
  if (!open) return null;

  const ordiniPersi = current.ordiniInclusi - free.ordiniInclusi;
  const losses = [
    `${ordiniPersi.toLocaleString('it-IT', {useGrouping: true})} ordini inclusi in meno al mese (da ${current.ordiniInclusi.toLocaleString('it-IT', {useGrouping: true})} a ${free.ordiniInclusi.toLocaleString('it-IT', {useGrouping: true})})`,
    `Ogni ordine extra costerà di più: da ${fmtPrice(current.ordineExtra)} € a ${fmtPrice(free.ordineExtra)} €`,
    `Menù digitali: da ${current.menuShort.toLowerCase().replace(/^fino a /, '')} a un solo menù`,
    `Membri dello staff: da ${current.staffShort.toLowerCase().replace(/^fino a /, '')} a un solo membro`,
  ];

  // Mini plan-card del confronto (colonna attuale vs colonna Gratuito).
  // planId esplicito: l'emoji non puo' derivare dal nome visibile — "Gratuito"
  // non e' l'id tecnico del piano, che resta 'free'.
  const MiniPiano = ({ planId, nome, badge, badgeBg, badgeFg, prezzo, righe, bordered }) => (
    <div style={{
      position: 'relative', flex: 1, minWidth: 0,
      border: `1px solid ${PN.BORDER_HAIR}`,
      boxShadow: bordered ? '0 2px 4px rgba(15,17,21,0.05), 0 10px 24px -10px rgba(15,17,21,0.18)' : 'none',
      borderRadius: 12, padding: '18px 16px 14px',
      background: PN.WHITE,
    }}>
      <PianoBadge bg={badgeBg} fg={badgeFg} label={badge}/>
      <div style={{display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6}}>
        <PianoEmoji planId={planId} size={20}/>
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
        width: 580, maxWidth: '100%', maxHeight: 'calc(var(--pn-vh, 100vh) * 0.9)', overflowY: 'auto',
        background: '#fff', borderRadius: 16,
        boxShadow: '0 24px 70px rgba(0, 0, 0, 0.28)',
        fontFamily: 'inherit',
      }} className="pn-scroll">
        {/* Header */}
        <div style={{padding: '20px 22px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12}}>
          <div>
            <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT}}>Passare al piano Gratuito?</div>
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
            planId={current.id}
            nome={current.nome}
            badge="PIANO ATTUALE" badgeBg={PN.TEXT} badgeFg={PN.WHITE}
            prezzo={`€${fmtPrice(current.prezzo)}${current.periodo}`}
            bordered
            righe={[
              `${current.ordiniInclusi.toLocaleString('it-IT', {useGrouping: true})} ordini/mese`,
              `+${fmtPrice(current.ordineExtra)} € a ordine extra`,
              current.menu,
              current.staff,
            ]}
          />
          <MiniPiano
            planId={free.id}
            nome={free.nome}
            badge="GRATUITO" badgeBg={PN.WHITE_OFF} badgeFg={PN.MUTED}
            prezzo="Gratis"
            righe={[
              `${free.ordiniInclusi.toLocaleString('it-IT', {useGrouping: true})} ordini/mese`,
              `+${fmtPrice(free.ordineExtra)} € a ordine extra`,
              'Un solo menù digitale',
              'Un solo membro dello staff',
            ]}
          />
        </div>

        {/* Recap di cosa si perde */}
        <div style={{padding: '14px 22px 6px'}}>
          <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Cosa perderai passando al piano Gratuito</div>
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
          }}>Passa al piano Gratuito</button>
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
    ['Ordini inclusi/mese',                    ...ACC_PIANI.map(p => p.ordiniInclusi.toLocaleString('it-IT', {useGrouping: true}))],
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
    ['Supporto telefonico',                    ...ACC_PIANI.map(p => p.supPhone ? p.supOrariShort : '—')],
    ['Richiamata garantita',                   ...ACC_PIANI.map(p => p.supCallback ? p.supSlaShort : '—')],
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
        {/* Header — neutro WHITE_OFF. Tutti i titoli uguali: nero, bold,
            maiuscolo, stessa dimensione — niente gerarchie di colore. Il piano
            attuale e' segnalato solo dal chip "attuale" accanto al nome. */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          padding: '14px 18px',
          background: PN.WHITE_OFF,
          borderBottom: `1px solid ${PN.BORDER_HAIR}`,
          fontSize: 13, fontWeight: 700, color: PN.TEXT,
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          <span>Funzionalità</span>
          {ACC_PIANI.map(p => (
            <span key={p.id} style={{
              textAlign: 'center',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {p.nome}
              {p.current && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
                  padding: '1px 6px', borderRadius: 999,
                  background: PN.TEXT, color: PN.WHITE,
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
