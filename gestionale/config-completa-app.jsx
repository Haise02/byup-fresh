// Config completa — post-onboarding wizard per vetrina + personale.
// Impaginazione allineata alla reference: header arioso su fondo pagina,
// stepper in card con progress line, form a sinistra in card con tab
// contate, anteprima vetrina sticky a destra con checklist di
// completamento, barra azioni in fondo. Niente sidebar: questa pagina fa
// ancora parte dell'onboarding, il gestionale vero si apre in Panoramica.
// Le funzionalità restano quelle delle Impostazioni: VetrinaProfilo /
// VetrinaAspetto / VetrinaPubblico, ImpPersonale, anteprima + pubblica.

function ConfigCompletaApp() {
  // Tre step: Informazioni (profilo vetrina) → Aspetto (foto, social e FAQ)
  // → Personale.
  const [step, setStep] = React.useState(() => {
    try {
      const s = new URLSearchParams(window.location.search).get('step');
      if (['informazioni', 'aspetto', 'personale'].includes(s)) return s;
    } catch (e) {}
    return 'informazioni';
  });

  // Stato vetrina — lo stesso di ImpVetrina nelle Impostazioni.
  const [dirty, setDirty] = React.useState(false);
  const [tags, setTags] = React.useState(['Elegante','Tradizionale']);
  const [social, setSocial] = React.useState(['ig']);
  const [categoria, setCategoria] = React.useState('Ristorante');
  const markDirty = () => setDirty(true);

  // Team dello step Personale: vive qui perché lo leggono sia il form a
  // sinistra sia la rail destra (panoramica team + checklist).
  const [team, setTeam] = React.useState(() => window.PERSONALE_TEAM_INITIAL || []);


  // Checklist di completamento (vive nella colonna anteprima, come nella
  // reference; prima era un banner sopra i form).
  const completion = [
    { label: 'Informazioni base',  sub: 'Nome, contatti e indirizzo',      done: true },
    { label: 'Orari di apertura',  sub: 'Quando i clienti ti trovano',     done: true },
    { label: 'Logo del locale',    sub: 'Il volto della tua vetrina',      done: true },
    { label: 'Galleria foto',      sub: 'Mostra il tuo locale al meglio',  done: false },
    { label: 'Tag e categorie',    sub: 'Racconta che atmosfera offri',    done: true },
    { label: 'FAQ',                sub: 'Rispondi alle domande frequenti', done: false },
    { label: 'Social',             sub: 'Aggiungi sito e Instagram',       done: false },
  ];

  const goPanoramica = () => { window.location.href = 'byup Panoramica.html'; };

  // Feedback loop: toast di conferma alla pubblicazione della vetrina.
  const [toast, setToast] = React.useState(null);
  const publish = () => {
    setDirty(false);
    setToast('Vetrina aggiornata ✓');
    setTimeout(() => setToast(null), 2400);
  };
  // Peak-End: la chiusura del flusso è un momento positivo, non un redirect
  // secco — overlay celebrativo breve, poi la Panoramica.
  const [finishing, setFinishing] = React.useState(false);
  const complete = () => {
    if (finishing) return;
    setFinishing(true);
    setTimeout(goPanoramica, 1300);
  };
  const donePct = Math.round(completion.filter(c => c.done).length / completion.length * 100);

  return (
    <div style={{display:'flex', flex:1, minHeight:0, background: PN.BG}}>
      {/* ─── Colonna sinistra: contenuto che scrolla + barra azioni fissa ── */}
      <div style={{flex:1, minWidth: 0, display:'flex', flexDirection:'column'}}>
      {/* Fascia alta LOCKATA: header, stepper e completamento restano fissi,
          sotto scorre solo il form. Fluido: niente max-width. */}
      <div style={{padding: '24px 28px 0', flexShrink: 0}}>

          {/* ─── Header ─────────────────────────────────────────────── */}
          <div style={{marginBottom: 22}}>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 24}}>
              <div style={{flex:1, minWidth:0}}>
                <h1 style={{
                  fontWeight: 600, fontSize: 30, margin: 0,
                  letterSpacing: '-0.02em', color: PN.TEXT,
                }}>
                  Completa la tua presenza su byup.
                </h1>
              </div>
              <ApBtn variant="neutral" onClick={goPanoramica} style={{flexShrink: 0}}>
                Salta e continua dopo →
              </ApBtn>
            </div>
            {/* Sottotitolo su UNA riga: a tutta larghezza sotto la riga del
                titolo, corpo compatto perché la frase intera ci stia. */}
            <p style={{
              fontSize: 13.5, color: PN.MUTED, margin: '8px 0 0', lineHeight: 1.5,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {step === 'personale'
                ? 'Invita il tuo team ora o in un secondo momento dalle Impostazioni.'
                : 'Aggiungi le foto, descrivi l\'atmosfera del locale e invita il tuo staff. Puoi compilare adesso o tornare qui in un secondo momento dalle Impostazioni.'}
            </p>
          </div>

          {/* ─── Stepper card con progress line ─────────────────────── */}
          <div style={{
            background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
            borderRadius: 14, overflow: 'hidden', marginBottom: 20,
            boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
          }}>
            <div style={{height: 3, background: '#F1F2F5'}}>
              <div style={{
                height: '100%',
                width: step === 'informazioni' ? '33%' : step === 'aspetto' ? '66%' : '100%',
                background: `linear-gradient(90deg, ${PN.PINK}, #FF7A7E)`,
                transition: 'width 320ms ease',
              }}/>
            </div>
            <div style={{display:'flex', alignItems:'center', padding: '14px 20px', gap: 12}}>
              <CfgStep num="1" label="Informazioni" sub="Chi sei e che atmosfera offri"
                active={step === 'informazioni'} done={step !== 'informazioni'}
                onClick={() => setStep('informazioni')}/>
              <div style={{flex: 1}}/>
              <CfgStep num="2" label="Aspetto" sub="Foto, social e FAQ"
                active={step === 'aspetto'} done={step === 'personale'}
                onClick={() => setStep('aspetto')}/>
              <div style={{flex: 1}}/>
              <CfgStep num="3" label="Personale" sub="Invita il tuo staff"
                active={step === 'personale'} done={false}
                onClick={() => setStep('personale')}/>
              <div style={{flex: 2}}/>
            </div>
          </div>

          {/* Completamento — chips orizzontali sopra il form (il blocco che
              prima stava sotto il telefono vive qui, a sinistra). */}
          {step !== 'personale' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
              borderRadius: 14, padding: '12px 16px', marginBottom: 20,
              boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
            }}>
              <span style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginRight: 2}}>
                Completamento
              </span>
              {/* Progresso in forma standard: barra + percento. Verde, non
                  brand: il progresso è "riuscita", il coral resta alle azioni. */}
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, marginRight: 6}}>
                <span style={{width: 90, height: 6, borderRadius: 999, background: '#F1F2F5', overflow: 'hidden'}}>
                  <span style={{display: 'block', height: '100%', width: `${donePct}%`, borderRadius: 999, background: 'linear-gradient(90deg, #16A34A, #22C55E)', transition: 'width 400ms ease'}}/>
                </span>
                <span style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>{donePct}%</span>
              </span>
              {completion.map((c, i) => (
                <span key={i} title={c.sub} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600,
                  padding: '4px 11px', borderRadius: 999,
                  background: c.done ? '#DCFCE7' : '#F4F5F7',
                  color: c.done ? '#15803D' : PN.MUTED,
                }}>
                  {c.done ? '✓' : '○'} {c.label}
                </span>
              ))}
            </div>
          )}
      </div>

      <main className="pn-scroll" style={{flex:1, minHeight: 0, overflow:'auto'}}>
        <div style={{padding: '2px 28px 20px'}}>

          {/* ─── Step 1 · Informazioni: profilo della vetrina ─────────── */}
          {step === 'informazioni' && (
              <section style={{
                background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
                borderRadius: 14, padding: '20px 22px',
                boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
                minWidth: 0,
              }}>
                <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing: '-0.01em'}}>
                  Informazioni
                </div>
                <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3, marginBottom: 16}}>
                  Compila solo ciò che serve per far capire ai clienti chi sei e che atmosfera offre il locale.
                </div>

                <VetrinaProfilo
                  tags={tags} setTags={t => {setTags(t); markDirty();}}
                  categoria={categoria} setCategoria={c => {setCategoria(c); markDirty();}}
                  onChange={markDirty}/>

                <div style={{
                  display:'flex', alignItems:'center', gap: 8, marginTop: 14,
                  fontSize: 13, color: PN.MUTED,
                }}>
                  <PnI.Eye size={13}/> Potrai modificare tutto in seguito dalle Impostazioni.
                </div>
              </section>
          )}

          {/* ─── Step 2 · Aspetto: foto + social e FAQ ────────────────── */}
          {step === 'aspetto' && (
              <section style={{
                background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
                borderRadius: 14, padding: '20px 22px',
                boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
                minWidth: 0,
              }}>
                <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing: '-0.01em'}}>
                  Aspetto
                </div>
                <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3, marginBottom: 16}}>
                  Il volto della vetrina: foto, stile, social e domande frequenti.
                </div>

                {/* Tab fuse: foto e stile, poi social e FAQ, in un'unica pagina */}
                <VetrinaAspetto onChange={markDirty}/>
                <VetrinaPubblico social={social} setSocial={s => {setSocial(s); markDirty();}} onChange={markDirty}/>

                <div style={{
                  display:'flex', alignItems:'center', gap: 8, marginTop: 14,
                  fontSize: 13, color: PN.MUTED,
                }}>
                  <PnI.Eye size={13}/> Potrai modificare tutto in seguito dalle Impostazioni.
                </div>
              </section>
          )}

          {/* ─── Step 3 · Personale: ruoli, invito rapido, inviti e accessi */}
          {step === 'personale' && (
            <section style={{
              background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
              borderRadius: 14, padding: '20px 22px',
              boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
            }}>
              <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing: '-0.01em'}}>
                Personale
              </div>
              <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3, marginBottom: 16}}>
                Invita solo chi serve davvero per partire. Potrai modificare ruoli e permessi in seguito.
              </div>
              <PersonaleStep team={team} setTeam={setTeam}/>
            </section>
          )}

        </div>
      </main>

      {/* ─── Barra azioni — fissa al fondo della colonna, fuori dallo scroll */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 32px',
        background: PN.WHITE, borderTop: `1px solid ${PN.BORDER_SOFT}`,
        flexShrink: 0,
      }}>
        {step === 'informazioni'
          ? <ApBtn variant="neutral" onClick={() => { window.location.href = 'byup Restaurant Onboarding.html?step=4'; }}>← Torna alla configurazione base</ApBtn>
          : step === 'aspetto'
            ? <ApBtn variant="neutral" onClick={() => setStep('informazioni')}>← Indietro</ApBtn>
            : <ApBtn variant="neutral" onClick={() => setStep('aspetto')}>← Indietro</ApBtn>}
        {step === 'informazioni'
          ? <ApBtn variant="brand" onClick={() => setStep('aspetto')}>Continua →</ApBtn>
          : step === 'aspetto'
            ? <ApBtn variant="brand" onClick={() => { publish(); setStep('personale'); }}>Pubblica modifiche e procedi →</ApBtn>
            : <ApBtn variant="brand" onClick={complete}>Inizia ora →</ApBtn>}
      </div>

      {/* Toast di conferma pubblicazione */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 76, left: '50%', transform: 'translateX(-50%)',
          background: '#16A34A', color: '#fff',
          padding: '10px 18px', borderRadius: 999,
          fontSize: 14, fontWeight: 700, zIndex: 60,
          boxShadow: '0 10px 26px rgba(22, 163, 74, 0.35)',
          animation: 'cfg-toast-in 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
        }}>{toast}</div>
      )}
      </div>

      {/* Peak-End: overlay celebrativo alla chiusura del flusso */}
      {finishing && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 90,
          background: 'rgba(255, 255, 255, 0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'cfg-fade-in 200ms ease-out',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6A6F, #FF5A5F)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 16px 40px rgba(255, 90, 95, 0.40)',
            animation: 'cfg-check-pop 460ms cubic-bezier(0.34, 1.6, 0.64, 1)',
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{fontSize: 22, fontWeight: 700, color: PN.TEXT, marginTop: 18, letterSpacing: '-0.01em'}}>
            La tua presenza su byup è pronta.
          </div>
          <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 6}}>
            Ti portiamo in Panoramica…
          </div>
        </div>
      )}

      <style>{`
        @keyframes cfg-toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes cfg-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cfg-check-pop { 0% { transform: scale(0); } 60% { transform: scale(1.14); } 100% { transform: scale(1); } }
      `}</style>

      {/* ─── Rail destra dello step Personale: guida all'invito subito
          visibile, poi numeri del team e checklist. Fissa, scrolla da sé. */}
      {step === 'personale' && (
        <aside style={{
          width: 340, flexShrink: 0,
          padding: '18px 18px 18px 0',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <div className="pn-scroll" style={{flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12}}>
            <StaffInviteGuide/>
            <StaffTeamStats team={team}/>
            <StaffChecklist team={team}/>
          </div>
        </aside>
      )}

      {/* ─── Rail destra FISSA: solo il telefono, grande — non scrolla ──── */}
      {step !== 'personale' && (
        <aside style={{
          width: 396, flexShrink: 0,
          padding: '18px 18px 18px 0',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <div style={{
            ...PN.GLASS_LIGHT,
            borderRadius: 14, padding: '14px 14px 14px',
            flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, marginBottom: 10, flexShrink: 0}}>
              Cosa vedranno i clienti
            </div>

            {/* Telefono: larghezza calibrata perché header + phone + banner
                chiudano nei 900px del canvas. */}
            <div style={{width: 300, margin: '0 auto', flexShrink: 0}}>
              <VetrinaMiniPreview tags={tags} social={social} categoria={categoria}
                focusSection={step === 'informazioni' ? 'info' : 'gallery'}/>
            </div>

            {/* Banner piano Plus: click → Piani e abbonamenti */}
            <a href="byup Profilo.html?tab=piani" title="Sblocca la vetrina esclusiva di Byup"
              style={{display: 'block', width: 300, margin: '12px auto 0', flexShrink: 0}}>
              <img src="banner-vetrina-plus.jpg" alt="Differenziati da tutti: sblocca la vetrina esclusiva di Byup, dal piano Plus"
                style={{
                  width: '100%', display: 'block', borderRadius: 12,
                  boxShadow: '0 8px 22px rgba(200, 60, 40, 0.28)',
                  cursor: 'pointer',
                  transition: 'transform 200ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 14px 30px rgba(200, 60, 40, 0.38)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(200, 60, 40, 0.28)'; }}/>
            </a>
          </div>
        </aside>
      )}
    </div>
  );
}

// Step del wizard — cerchio numerato + label con sotto-titolo.
function CfgStep({num, label, sub, active, done, onClick}) {
  const tone = done ? '#16A34A' : active ? PN.PINK : PN.MUTED;
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap: 12,
      padding: '4px 6px', border:'none', background:'transparent',
      cursor:'pointer', fontFamily:'inherit', textAlign:'left',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius:'50%', flexShrink: 0,
        background: done ? '#DCFCE7' : active ? PN.PINK : '#F4F5F7',
        color: done ? '#16A34A' : active ? '#fff' : PN.MUTED,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: 14.5, fontWeight: 700,
        boxShadow: active ? '0 2px 8px rgba(255, 90, 95, 0.35)' : 'none',
      }}>{done ? '✓' : num}</div>
      <div>
        <div style={{fontSize: 14.5, fontWeight: 700, color: active || done ? PN.TEXT : PN.MUTED}}>{label}</div>
        <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 1}}>{sub}</div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ApBtn — bottone Apple-style (gradient sottile + inset highlight + border alpha).
// 3 varianti: neutral (sfumature di bianco), dark (top→bottom 2A→15), brand (BRAND).
// ─────────────────────────────────────────────────────────────────────────

function ApBtn({variant = 'neutral', onClick, children, style = {}}) {
  const [hover, setHover] = React.useState(false);
  const styles = {
    neutral: {
      bg:    hover ? PN.BTN_NEUTRAL_HOVER : PN.BTN_NEUTRAL,
      color: PN.TEXT,
      border: `1px solid ${PN.BORDER_LIGHT}`,
      shadow: PN.INSET_HIGHLIGHT,
    },
    dark: {
      bg:    hover ? PN.BTN_DARK_HOVER : PN.BTN_DARK,
      color: '#fff',
      border: '1px solid rgba(0, 0, 0, 0.32)',
      shadow: PN.INSET_HIGHLIGHT_DARK,
    },
    brand: {
      bg:    hover ? PN.BTN_BRAND_HOVER : PN.BTN_BRAND,
      color: '#fff',
      border: '1px solid rgba(180, 30, 35, 0.40)',
      shadow: `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 2px rgba(255, 90, 95, 0.18)`,
    },
  }[variant];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: styles.bg, color: styles.color, border: styles.border,
        boxShadow: styles.shadow,
        padding: '10px 20px', borderRadius: 10,
        fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 150ms ease-out, box-shadow 150ms ease-out',
        display: 'flex', alignItems: 'center', gap: 7,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Rail dello step Personale ──────────────────────────────────────────────

// Card bianca compatta della rail.
function RailCard({ children }) {
  return (
    <div style={{
      background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
      borderRadius: 14, padding: '16px 16px 14px', flexShrink: 0,
      boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
    }}>{children}</div>
  );
}

// Guida per i collaboratori: come si accetta l'invito. Deve essere la prima
// cosa che si vede a destra atterrando sullo step.
function StaffInviteGuide() {
  const steps = [
    <>Apri l'email di invito ricevuta da byup.</>,
    <>Clicca sul link di conferma e imposta una password tramite il link che ti verrà dato.</>,
    <>Al termine, clicca sulla CTA <b style={{color: PN.TEXT}}>"Aggiungi Byup Cameriere alla tua Home"</b>.</>,
  ];
  return (
    <RailCard>
      <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Come accettare l'invito staff</div>
      <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2, marginBottom: 14}}>
        Spiega chiaramente ai collaboratori cosa fare per iniziare.
      </div>
      <div>
        {steps.map((s, i) => (
          <div key={i} style={{display: 'flex', gap: 12, position: 'relative', paddingBottom: 14}}>
            {/* Connettore tratteggiato fra i numeri */}
            <span style={{position: 'absolute', left: 12, top: 27, bottom: -1, borderLeft: `1.5px dashed ${PN.BORDER}`}}/>
            <span style={{
              width: 25, height: 25, borderRadius: '50%', flexShrink: 0,
              border: `1.5px solid ${PN.PINK}`, color: PN.PINK, background: PN.WHITE,
              display: 'grid', placeItems: 'center',
              fontSize: 12.5, fontWeight: 700, position: 'relative', zIndex: 1,
            }}>{i + 1}</span>
            <div style={{fontSize: 12.8, lineHeight: 1.5, color: PN.TEXT, paddingTop: 3, minWidth: 0}}>
              {s}
              {i === 2 && (
                <div style={{
                  marginTop: 10, padding: '9px 12px', borderRadius: 10,
                  border: `1.5px solid ${PN.PINK}`, color: PN.PINK,
                  fontSize: 12.5, fontWeight: 700, textAlign: 'center',
                  background: PN.WHITE, cursor: 'default', userSelect: 'none',
                }}>Aggiungi Byup Cameriere alla tua Home</div>
              )}
            </div>
          </div>
        ))}
        <div style={{display: 'flex', gap: 12, alignItems: 'flex-start'}}>
          <span style={{width: 25, flexShrink: 0, display: 'grid', placeItems: 'center', color: PN.MUTED, paddingTop: 2}}>
            {(BuIcons.phone||BuIcons.user)({size: 14, color: 'currentColor'})}
          </span>
          <div style={{fontSize: 12.5, color: PN.MUTED, lineHeight: 1.5}}>
            Consigliato per avere l'accesso rapido dal telefono durante il servizio.
          </div>
        </div>
      </div>
    </RailCard>
  );
}

// Numeri del team, derivati dall'elenco reale dello step.
function StaffTeamStats({ team }) {
  const stats = [
    { icon: 'users',  n: team.length, label: 'accessi totali' },
    { icon: 'mail',   n: team.filter(m => m.status === 'invited').length, label: 'inviti attivi' },
    { icon: 'shield', n: new Set(team.map(m => m.role)).size, label: 'ruoli configurati' },
  ];
  return (
    <RailCard>
      <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Panoramica team</div>
      <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2, marginBottom: 12}}>Configurazione rapida</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {stats.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
            padding: '9px 12px',
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              border: `1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE, color: '#475569',
              display: 'grid', placeItems: 'center',
            }}>{(BuIcons[s.icon]||BuIcons.user)({size: 15, color: 'currentColor'})}</span>
            <div>
              <div style={{fontSize: 17, fontWeight: 800, color: PN.TEXT, lineHeight: 1.1}}>{s.n}</div>
              <div style={{fontSize: 12, color: PN.MUTED, marginTop: 1}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </RailCard>
  );
}

// Checklist della configurazione del personale, derivata dall'elenco reale.
function StaffChecklist({ team }) {
  const nManager = team.filter(m => m.role === 'Manager').length;
  const nStaff = team.filter(m => m.kind === 'person' && m.role !== 'Manager').length;
  const items = [
    { label: 'Aggiungi almeno un manager',
      sub: nManager > 0 ? `Hai aggiunto ${nManager} manager` : 'Serve almeno un manager',
      done: nManager > 0 },
    { label: 'Invita camerieri o staff',
      sub: nStaff > 0 ? `Hai invitato ${nStaff} ${nStaff === 1 ? 'membro' : 'membri'}` : 'Invita chi lavora in sala',
      done: nStaff > 0 },
    { label: 'Configura i ruoli principali',
      sub: 'Completa per ottimizzare i permessi',
      done: nManager > 0 && team.some(m => m.role === 'Cameriere') && team.some(m => m.role === 'Cucina') },
  ];
  return (
    <RailCard>
      <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, marginBottom: 12}}>Checklist configurazione</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {items.map((it, i) => (
          <div key={i} style={{display: 'flex', gap: 10, alignItems: 'flex-start'}}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: it.done ? '#16A34A' : PN.WHITE,
              border: it.done ? 'none' : `1.5px solid ${PN.BORDER}`,
              display: 'grid', placeItems: 'center',
            }}>
              {it.done && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </span>
            <div style={{minWidth: 0}}>
              <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT, lineHeight: 1.35}}>{it.label}</div>
              <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.4}}>{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </RailCard>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div className="frame" data-screen-label="Configurazione completa">
    <GlassMeshSubstrate/>
    <ConfigCompletaApp/>
  </div>
);
