// Config completa — post-onboarding wizard per vetrina + personale.
// Impaginazione allineata alla reference: header arioso su fondo pagina,
// stepper in card con progress line, form a sinistra in card con tab
// contate, anteprima vetrina sticky a destra con checklist di
// completamento, barra azioni in fondo. Niente sidebar: questa pagina fa
// ancora parte dell'onboarding, il gestionale vero si apre in Panoramica.
// Le funzionalità restano quelle delle Impostazioni: VetrinaProfilo /
// VetrinaAspetto / VetrinaPubblico, ImpPersonale, anteprima + pubblica.

function ConfigCompletaApp() {
  const [step, setStep] = React.useState('vetrina'); // 'vetrina' | 'personale'

  // Stato vetrina — lo stesso di ImpVetrina nelle Impostazioni.
  const [sub, setSub] = React.useState('profilo');
  const [dirty, setDirty] = React.useState(false);
  const [tags, setTags] = React.useState(['Elegante','Tradizionale']);
  const [social, setSocial] = React.useState(['ig']);
  const [categoria, setCategoria] = React.useState('Ristorante');
  const markDirty = () => setDirty(true);

  // Sub-tab con contatore campi completati (stesso mock del completamento).
  const SUBS = [
    { id: 'profilo',  label: 'Profilo',      done: 3, tot: 3 },
    { id: 'aspetto',  label: 'Aspetto',      done: 1, tot: 2 },
    { id: 'pubblico', label: 'Social e FAQ', done: 0, tot: 2 },
  ];

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

  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      <main className="pn-scroll" style={{flex:1, minWidth: 0, overflow:'auto', background: PN.BG}}>
        <div style={{maxWidth: 1180, margin: '0 auto', padding: '30px 36px 44px'}}>

          {/* ─── Header ─────────────────────────────────────────────── */}
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 24, marginBottom: 22}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: PN.PINK_BG_SOFT, color: PN.PINK_DARK,
                padding: '4px 12px', borderRadius: 999,
                fontSize: 12.5, fontWeight: 600, marginBottom: 12, letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}>
                <span style={{width: 5, height: 5, borderRadius: 999, background: PN.PINK, display: 'inline-block'}}/>
                Configurazione completa · Opzionale
              </div>
              <h1 style={{
                fontWeight: 600, fontSize: 30, margin: '0 0 8px',
                letterSpacing: '-0.02em', color: PN.TEXT,
              }}>
                Completa la tua presenza su byup.
              </h1>
              <p style={{fontSize: 15, color: PN.MUTED, margin: 0, maxWidth: 560, lineHeight: 1.55}}>
                Aggiungi le foto, descrivi l'atmosfera del locale e invita il tuo staff.
                Puoi compilare adesso o tornare qui in un secondo momento dalle Impostazioni.
              </p>
            </div>
            <ApBtn variant="neutral" onClick={goPanoramica} style={{flexShrink: 0}}>
              Salta e vai alla Panoramica →
            </ApBtn>
          </div>

          {/* ─── Stepper card con progress line ─────────────────────── */}
          <div style={{
            background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
            borderRadius: 14, overflow: 'hidden', marginBottom: 20,
            boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
          }}>
            <div style={{height: 3, background: '#F1F2F5'}}>
              <div style={{
                height: '100%', width: step === 'vetrina' ? '50%' : '100%',
                background: `linear-gradient(90deg, ${PN.PINK}, #FF7A7E)`,
                transition: 'width 320ms ease',
              }}/>
            </div>
            <div style={{display:'flex', alignItems:'center', padding: '14px 20px', gap: 12}}>
              <CfgStep num="1" label="Vetrina pubblica" sub="Foto, descrizione, atmosfera"
                active={step === 'vetrina'} done={step !== 'vetrina'}
                onClick={() => setStep('vetrina')}/>
              <div style={{flex: 1}}/>
              <CfgStep num="2" label="Personale" sub="Invita il tuo staff"
                active={step === 'personale'} done={false}
                onClick={() => setStep('personale')}/>
              <div style={{flex: 2}}/>
            </div>
          </div>

          {/* ─── Step 1 · Vetrina: form card + anteprima sticky ─────── */}
          {step === 'vetrina' && (
            <div style={{display:'grid', gridTemplateColumns:'minmax(0, 1fr) 340px', gap: 20, alignItems:'flex-start'}}>
              <section style={{
                background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
                borderRadius: 14, padding: '20px 22px',
                boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
                minWidth: 0,
              }}>
                <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing: '-0.01em'}}>
                  Vetrina pubblica
                </div>
                <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 3, marginBottom: 16}}>
                  Compila solo ciò che serve per far capire ai clienti chi sei e che atmosfera offre il locale.
                </div>

                {/* Tab contate — stessa funzione delle sub-tab Impostazioni */}
                <div style={{display:'flex', gap: 8, marginBottom: 18, flexWrap:'wrap'}}>
                  {SUBS.map(s => {
                    const active = sub === s.id;
                    return (
                      <button key={s.id} onClick={() => setSub(s.id)} style={{
                        display:'flex', alignItems:'center', gap: 8,
                        padding: '9px 14px', borderRadius: 10,
                        border: active ? `1.5px solid ${PN.PINK}` : `1px solid ${PN.BORDER_SOFT}`,
                        background: active ? PN.PINK_BG_SOFT : PN.WHITE,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'border-color 150ms ease, background 150ms ease',
                      }}>
                        <span style={{fontSize: 14, fontWeight: 600, color: active ? PN.PINK_DARK : PN.TEXT}}>
                          {s.label}
                        </span>
                        <span style={{
                          fontSize: 11.5, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                          background: active ? 'rgba(255,255,255,0.75)' : '#F4F5F7',
                          color: s.done === s.tot ? PN.GREEN : PN.MUTED,
                        }}>{s.done}/{s.tot}</span>
                      </button>
                    );
                  })}
                </div>

                {sub === 'profilo' && <VetrinaProfilo
                  tags={tags} setTags={t => {setTags(t); markDirty();}}
                  categoria={categoria} setCategoria={c => {setCategoria(c); markDirty();}}
                  onChange={markDirty}/>}
                {sub === 'aspetto' && <VetrinaAspetto onChange={markDirty}/>}
                {sub === 'pubblico' && <VetrinaPubblico social={social} setSocial={s => {setSocial(s); markDirty();}} onChange={markDirty}/>}

                <div style={{
                  display:'flex', alignItems:'center', gap: 8, marginTop: 14,
                  fontSize: 13, color: PN.MUTED,
                }}>
                  <PnI.Eye size={13}/> Potrai modificare tutto in seguito dalle Impostazioni.
                </div>
              </section>

              {/* Anteprima: publish + phone + checklist. NON sticky: con
                  telefono e checklist supera l'altezza del viewport — da
                  sticky la coda resterebbe irraggiungibile. */}
              <aside style={{
                alignSelf: 'start',
                ...PN.GLASS_LIGHT,
                borderRadius: 14, padding: '14px 14px 16px',
              }}>
                <div style={{marginBottom: 12}}>
                  <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>Anteprima vetrina</div>
                  <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>Cosa vedranno i clienti</div>
                </div>
                <PublishButton dirty={dirty} onPublish={() => setDirty(false)}/>
                <VetrinaMiniPreview tags={tags} social={social} categoria={categoria}/>

                <div style={{
                  marginTop: 14, background: PN.WHITE,
                  border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 12,
                  padding: '4px 14px',
                }}>
                  {completion.map((c, i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap: 10,
                      padding: '9px 0',
                      borderBottom: i < completion.length - 1 ? `1px solid ${PN.BORDER_HAIR}` : 'none',
                    }}>
                      <div style={{flex:1, minWidth: 0}}>
                        <div style={{fontSize: 13.5, fontWeight: 600, color: PN.TEXT}}>{c.label}</div>
                        <div style={{fontSize: 12, color: PN.MUTED, marginTop: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.sub}</div>
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        background: c.done ? PN.PINK : 'transparent',
                        border: c.done ? 'none' : `1.5px solid ${PN.BORDER}`,
                        display:'grid', placeItems:'center',
                      }}>
                        {c.done && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          )}

          {/* ─── Step 2 · Personale: card a tutta larghezza ──────────── */}
          {step === 'personale' && (
            <section style={{
              background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
              borderRadius: 14, padding: '20px 22px',
              boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
            }}>
              <ImpPersonale/>
            </section>
          )}

          {/* ─── Barra azioni ────────────────────────────────────────── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 20, padding: '12px 16px',
            background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
            borderRadius: 14,
            boxShadow: '0 1px 2px rgba(15,17,21,0.03)',
          }}>
            {step === 'personale'
              ? <ApBtn variant="neutral" onClick={() => setStep('vetrina')}>← Indietro</ApBtn>
              : <ApBtn variant="neutral" onClick={goPanoramica}>← Indietro</ApBtn>}
            {step === 'vetrina'
              ? <ApBtn variant="brand" onClick={() => setStep('personale')}>Continua a Personale →</ApBtn>
              : <ApBtn variant="brand" onClick={goPanoramica}>Completa e vai alla Panoramica →</ApBtn>}
          </div>

        </div>
      </main>
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div className="frame" data-screen-label="Configurazione completa">
    <GlassMeshSubstrate/>
    <ConfigCompletaApp/>
  </div>
);
