// Config completa — post-onboarding wizard per vetrina + personale.
// Impaginazione allineata alla reference: header arioso su fondo pagina,
// stepper in card con progress line, form a sinistra in card con tab
// contate, anteprima vetrina sticky a destra con checklist di
// completamento, barra azioni in fondo. Niente sidebar: questa pagina fa
// ancora parte dell'onboarding, il gestionale vero si apre in Panoramica.
// Le funzionalità restano quelle delle Impostazioni: VetrinaProfilo /
// VetrinaAspetto / VetrinaPubblico, ImpPersonale, anteprima + pubblica.

function ConfigCompletaApp() {
  // Classe dispositivo: rirenderizza al cambio (rotazione compresa); lo
  // «stretto» decide rail e colonne — vedi panoramica-tokens.
  const pnDevice = window.PnDevice ? window.PnDevice.use() : 'desktop';
  const stretto = window.statStretto ? window.statStretto() : false;
  void pnDevice;

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
  const [dati, aggiorna] = useVetrinaDati();
  const markDirty = () => setDirty(true);

  // Team dello step Personale: vive qui perché lo leggono sia il form a
  // sinistra sia la rail destra (panoramica team + checklist).
  const [team, setTeam] = React.useState(() => window.PERSONALE_TEAM_INITIAL || []);
  const [guidaStaff, setGuidaStaff] = React.useState(false);

  // «Membri e dispositivi» parte alla stessa altezza del box «Personale». La
  // distanza NON e un numero fisso: dipende dall'altezza della fascia in cima,
  // che cambia con lo zoom del frame e con l'andare a capo dei testi. Quindi si
  // misura a ogni cambio di dimensione invece di scriverla.
  const railCardRef = React.useRef(null);
  React.useLayoutEffect(() => {
    if (step !== 'personale') return;
    const allinea = () => {
      const sez = document.querySelector('[data-cfg-personale]');
      const card = railCardRef.current;
      if (!sez || !card) return;
      // Azzerare prima di misurare: senza, la misura include il margine
      // precedente e a ogni passata la card scende ancora.
      card.style.marginTop = '0px';
      // getBoundingClientRect restituisce pixel VISIVI e il frame ha uno zoom:
      // marginTop li vuole di layout, quindi il delta si divide per lo zoom.
      const frame = document.querySelector('.frame');
      const z = frame ? (parseFloat(getComputedStyle(frame).zoom) || 1) : 1;
      const delta = (sez.getBoundingClientRect().top - card.getBoundingClientRect().top) / z;
      card.style.marginTop = Math.max(0, Math.round(delta)) + 'px';
    };
    allinea();
    const colonna = document.querySelector('[data-cfg-personale]');
    const ro = colonna && colonna.parentElement ? new ResizeObserver(allinea) : null;
    if (ro) ro.observe(colonna.parentElement);
    window.addEventListener('resize', allinea);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', allinea); };
  }, [step, team]);


  // Checklist di completamento: ogni voce sa in quale step e sezione vive,
  // così i chip incompleti portano dritti al punto giusto.
  const completion = [
    { label: 'Informazioni base',  sub: 'Nome, contatti e indirizzo',      done: true,  step: 'informazioni', anchor: 'locale' },
    { label: 'Orari di apertura',  sub: 'Quando i clienti ti trovano',     done: true,  step: 'informazioni', anchor: 'orari' },
    { label: 'Logo del locale',    sub: 'Il volto della tua vetrina',      done: true,  step: 'aspetto',      anchor: 'immagini' },
    { label: 'Galleria foto',      sub: 'Mostra il tuo locale al meglio',  done: false, step: 'aspetto',      anchor: 'galleria' },
    { label: 'Tag e categorie',    sub: 'Racconta che atmosfera offri',    done: true,  step: 'informazioni', anchor: 'tag' },
    { label: 'FAQ',                sub: 'Rispondi alle domande frequenti', done: false, step: 'aspetto',      anchor: 'faq' },
    { label: 'Social',             sub: 'Aggiungi sito e Instagram',       done: false, step: 'aspetto',      anchor: 'social' },
  ];

  // Chip incompleto cliccato: cambia step se serve, poi scorre alla sezione
  // (e apre la card collassabile se è quella dei Tag).
  const goToSection = (c) => {
    if (step !== c.step) setStep(c.step);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('cfg-open-collapsible', { detail: c.anchor }));
      const el = impAccendiSezione(c.anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 90);
  };

  const goPanoramica = () => { window.location.href = 'byup Panoramica.html'; };
  // A configurazione conclusa si atterra su Piani e abbonamenti, non in
  // Panoramica: finito l'onboarding la prossima decisione è il piano.
  // «Salta e continua dopo» invece resta sulla Panoramica — chi rimanda la
  // configurazione non è pronto a scegliere un piano.
  const goPiani = () => { window.location.href = 'byup Profilo.html?tab=piani'; };

  // Feedback loop: toast di conferma alla pubblicazione della vetrina.
  const [toast, setToast] = React.useState(null);
  const publish = () => {
    setDirty(false);
    setToast('Vetrina aggiornata ✓');
    setTimeout(() => setToast(null), 2400);
  };
  // Peak-End: la chiusura del flusso è un momento positivo, non un redirect
  // secco — overlay celebrativo breve, poi Piani e abbonamenti.
  const [finishing, setFinishing] = React.useState(false);
  const complete = () => {
    if (finishing) return;
    setFinishing(true);
    setTimeout(goPiani, 1300);
  };
  const donePct = Math.round(completion.filter(c => c.done).length / completion.length * 100);

  // La barra azioni sta FUORI dalla riga: dentro la colonna sinistra si fermava
  // dove comincia la rail, e una barra che si ferma a due terzi sembra un pezzo
  // di pagina, non il fondo della pagina.
  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, minWidth:0, minHeight:0, background: PN.BG}}>
      <ImpAtterraggioStyle/>
      <div style={{display:'flex', flexDirection: stretto ? 'column' : 'row', flex:1, minWidth:0, minHeight:0}}>
      {/* ─── Colonna sinistra: contenuto che scrolla ─────────────────── */}
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
            {/* Tre step su tre colonne uguali: distribuzione uniforme lungo
                tutta la riga, ciascuno nel proprio terzo. */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', alignItems:'center', padding: '14px 20px', gap: 12}}>
              <CfgStep num="1" label="Informazioni" sub="Chi sei e che atmosfera offri"
                active={step === 'informazioni'} done={step !== 'informazioni'}
                onClick={() => setStep('informazioni')}/>
              <CfgStep num="2" label="Aspetto" sub="Foto, stile, social e FAQ"
                active={step === 'aspetto'} done={step === 'personale'}
                onClick={() => setStep('aspetto')}/>
              <CfgStep num="3" label="Personale" sub="Invita il tuo staff"
                active={step === 'personale'} done={false}
                onClick={() => setStep('personale')}/>
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
              {completion.map((c, i) => c.done ? (
                <span key={i} title={c.sub} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600,
                  padding: '4px 11px', borderRadius: 999,
                  background: '#DCFCE7', color: '#15803D',
                }}>
                  ✓ {c.label}
                </span>
              ) : (
                <CompletionChip key={i} c={c} onClick={() => goToSection(c)}/>
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

                <VetrinaProfilo dati={dati} aggiorna={aggiorna} onChange={markDirty}/>

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
                <VetrinaAspetto dati={dati} aggiorna={aggiorna} onChange={markDirty}/>
                <VetrinaPubblico dati={dati} aggiorna={aggiorna} onChange={markDirty}/>

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
            <section data-cfg-personale style={{
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

          {/* Sezione a se, staccata dal fondo grigio: nella stessa card i
              dispositivi sembravano campi del modulo delle persone che
              continuano, e sono un'altra cosa. */}
          {step === 'personale' && (
            <section data-cfg-dispositivo style={{
              background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
              borderRadius: 14, padding: '20px 22px', marginTop: 16,
              boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
            }}>
              <DispositivoStep setTeam={setTeam}/>
            </section>
          )}

        </div>
      </main>

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
            Ti portiamo su Piani e abbonamenti…
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
          width: stretto ? '100%' : 384, flexShrink: 0,
          padding: stretto ? '0 18px 18px' : '18px 18px 18px 0',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <div className="pn-scroll" style={{flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12}}>
            <div ref={railCardRef} data-cfg-membri>
              <MembriDispositivi team={team} setTeam={setTeam}/>
            </div>
            <StaffGuidaLink onApri={() => setGuidaStaff(true)}/>
          </div>
        </aside>
      )}

      {guidaStaff && <StaffGuidaModal onClose={() => setGuidaStaff(false)}/>}

      {/* ─── Rail destra FISSA: solo il telefono, grande — non scrolla ──── */}
      {step !== 'personale' && !stretto && (
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

            {/* Telefono: senza piu il banner sotto, lo spazio della rail e
                tutto suo — riempie la larghezza e l'altezza chiude nei 900px
                del canvas. */}
            <div style={{width: '100%', margin: '0 auto', flexShrink: 0}}>
              <VetrinaMiniPreview tags={dati.tags} social={dati.social} categoria={pnGustoLabel(dati.categoria)} cta={false}
                focusSection={step === 'informazioni' ? 'info' : 'gallery'}/>
            </div>

          </div>
        </aside>
      )}
      </div>

      {/* ─── Barra azioni: larga quanto la finestra, sotto contenuto e rail */}
      <div data-cfg-barra style={{
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
            : <ApBtn variant="brand" onClick={complete}>Salva e concludi →</ApBtn>}
      </div>
    </div>
  );
}

// Step del wizard — cerchio numerato + label con sotto-titolo.
function CfgStep({num, label, sub, active, done, onClick}) {
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

// Chip di completamento incompleto: in hover si ingrandisce e si scurisce,
// al click porta allo step e alla sezione da completare.
function CompletionChip({ c, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick} title={`${c.sub} · vai alla sezione`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
        padding: '4px 11px', borderRadius: 999, border: 'none',
        background: hover ? '#E8EAEE' : '#F4F5F7',
        color: hover ? PN.TEXT : PN.MUTED,
        cursor: 'pointer',
        transform: pressed ? 'scale(0.95)' : hover ? 'scale(1.08)' : 'scale(1)',
        boxShadow: hover ? '0 4px 12px rgba(15, 17, 21, 0.10)' : 'none',
        transition: 'transform 160ms cubic-bezier(0.34, 1.45, 0.64, 1), background 140ms ease, color 140ms ease, box-shadow 160ms ease',
      }}>
      {c.label}
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

// La guida non e piu una card sempre aperta nella rail: e un link e una modale.
// Chi sta invitando il terzo cameriere non ha bisogno di rileggere i passi ogni
// volta, ma chi li cerca deve trovarli senza uscire dallo step.
function StaffGuidaLink({ onApri }) {
  const [hover, setHover] = React.useState(false);
  return (
    // In fondo alla rail e in coral pieno: sopra l'elenco era una riga grigia
    // che si leggeva prima di quello che conta, qui e l'offerta d'aiuto che
    // arriva dopo aver guardato chi c'e — ed e l'unica cosa cliccabile rimasta.
    <div style={{display: 'flex', justifyContent: 'center', paddingTop: 2}}>
      <button onClick={onApri}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          padding: 0, background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
          color: hover ? PN.PINK_DARK : PN.PINK,
          textDecoration: 'underline', textUnderlineOffset: 4, textDecorationThickness: 1.5,
          transition: 'color 150ms ease',
        }}>
        Come creare un membro del team?
      </button>
    </div>
  );
}

// I passi sono scritti al RISTORATORE, non al collaboratore: e lui che ha aperto
// la guida, ed e lui che deve far succedere le tre cose.
function StaffGuidaModal({ onClose }) {
  const steps = [
    <>Inserisci nome, cognome, email e ruolo. Fai click su <b style={{color: PN.TEXT}}>"Invita"</b>.</>,
    <>Fai aprire l'email e cliccare sul link di conferma all'invitato.</>,
    <>Una volta configurata la password fai fare click su <b style={{color: PN.TEXT}}>"Aggiungi Byup Cameriere alla tua Home"</b>.</>,
  ];
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)',
      display: 'grid', placeItems: 'center', zIndex: 200, padding: 20,
      backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 460, maxWidth: '92%', background: PN.WHITE, borderRadius: 16,
        padding: '22px 24px 20px', boxShadow: '0 24px 64px rgba(15,17,21,0.30)',
      }}>
        <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Come accettare l'invito staff</div>
        <div style={{fontSize: 13, color: PN.MUTED, marginTop: 3, marginBottom: 18}}>
          Spiega chiaramente ai collaboratori cosa fare per iniziare.
        </div>
        <div>
          {steps.map((s, i) => (
            <div key={i} style={{display: 'flex', gap: 12, position: 'relative', paddingBottom: 16}}>
              {/* Connettore tratteggiato fra i numeri, tranne dopo l'ultimo */}
              {i < steps.length - 1 && (
                <span style={{position: 'absolute', left: 12, top: 27, bottom: -1, borderLeft: `1.5px dashed ${PN.BORDER}`}}/>
              )}
              <span style={{
                width: 25, height: 25, borderRadius: '50%', flexShrink: 0,
                border: `1.5px solid ${PN.PINK}`, color: PN.PINK, background: PN.WHITE,
                display: 'grid', placeItems: 'center',
                fontSize: 12.5, fontWeight: 700, position: 'relative', zIndex: 1,
              }}>{i + 1}</span>
              <div style={{fontSize: 13.4, lineHeight: 1.55, color: PN.TEXT, paddingTop: 3, minWidth: 0}}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{
          padding: '12px 14px', borderRadius: 11, background: PN.PINK_BG_SOFT || '#FFF1EF',
          border: `1px solid ${PN.PINK_SOFT}`, fontSize: 13.2, fontWeight: 700,
          color: PN.PINK_DARK, lineHeight: 1.45,
        }}>
          Controlla che tutti abbiano aggiunto Byup Cameriere alla Home del proprio dispositivo!
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 16}}>
          <ImpButton variant="primary" onClick={onClose}>Ho capito</ImpButton>
        </div>
      </div>
    </div>
  );
}

// Chi c'e finora. Sta nella rail e non sotto il modulo perche e il RISULTATO di
// quello che si sta facendo a sinistra: si guarda con la coda dell'occhio mentre
// si invita, non si scorre come una tabella.
//
// Un'azione sola per riga, scritta e non nascosta in un menu: durante la
// configurazione le cose che servono sono due — disfare un invito sbagliato e
// togliere qualcuno aggiunto per errore — e un menu a tre puntini per due voci
// e un clic in piu per niente.
function MembriDispositivi({ team, setTeam }) {
  const rimuovi = (id) => setTeam(t => t.filter(m => m.id !== id));
  return (
    <RailCard>
      <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, marginBottom: 12}}>Membri e dispositivi</div>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {team.map((m, i) => {
          const invitato = m.status === 'invited';
          const iniziali = m.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0',
              borderTop: i ? `1px solid ${PN.BORDER_SOFT}` : 'none',
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: '#F1F3F5', color: '#475569',
                display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
              }}>
                {m.kind === 'device' ? (BuIcons.monitor||BuIcons.phone)({size: 15, color: 'currentColor'}) : iniziali}
              </span>
              <span style={{minWidth: 0, flex: 1}}>
                <span style={{display: 'block', fontSize: 13.6, fontWeight: 700, color: PN.TEXT,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{m.name}</span>
                <span style={{display: 'block', fontSize: 12.4, color: PN.MUTED,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{m.role}</span>
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 7px', borderRadius: 999, flexShrink: 0,
                background: invitato ? PN.AMBER_SOFT : PN.GREEN_SOFT,
                color: invitato ? '#92400E' : '#15803D', whiteSpace: 'nowrap',
              }}>{invitato ? 'Invito inviato' : 'Attivo'}</span>
              <button onClick={() => rimuovi(m.id)} className="pn-btn-feedback" style={{
                padding: 0, background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: PN.PINK,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{invitato ? 'Annulla invito' : 'Rimuovi'}</button>
            </div>
          );
        })}
        {team.length === 0 && (
          <div style={{fontSize: 12.8, color: PN.MUTED, padding: '6px 0'}}>
            Nessuno ancora: invita qualcuno o collega un dispositivo.
          </div>
        )}
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
