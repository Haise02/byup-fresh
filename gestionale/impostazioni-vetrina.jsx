// Impostazioni → Vetrina (rifatta: 3 sub-tab, completamento, calendario sintetico, sedi card)

function ImpVetrina() {
  const [sub, setSub] = React.useState('profilo');
  const [dirty, setDirty] = React.useState(false);
  const [tags, setTags] = React.useState(['Elegante','Tradizionale']);
  const [social, setSocial] = React.useState(['ig']);
  const [categoria, setCategoria] = React.useState('Ristorante');

  const subs = [
    { id: 'profilo', label: 'Profilo' },
    { id: 'aspetto', label: 'Aspetto' },
    { id: 'pubblico', label: 'Social e FAQ' },
  ];

  const markDirty = () => setDirty(true);
  const preview = <VetrinaMiniPreview tags={tags} social={social} categoria={categoria}/>;

  // Completamento profilo (semplice mock)
  const completion = [
    { label: 'Informazioni base', done: true },
    { label: 'Orari di apertura', done: true },
    { label: 'Logo del locale', done: true },
    { label: 'Galleria foto', done: false },
    { label: 'Tag e categorie', done: true },
    { label: 'FAQ', done: false },
    { label: 'Social', done: false },
  ];
  const doneCount = completion.filter(c => c.done).length;
  const pct = Math.round((doneCount / completion.length) * 100);

  return (
    <div>
      <VetrinaCompletion items={completion} pct={pct}/>
      <ImpSubTabs tabs={subs} active={sub} onChange={setSub}/>
      <ImpWithPreview
        preview={preview}
        dirty={dirty}
        onPublish={() => setDirty(false)}
      >
        {sub === 'profilo' && <VetrinaProfilo
          tags={tags} setTags={t => {setTags(t); markDirty();}}
          categoria={categoria} setCategoria={c => {setCategoria(c); markDirty();}}
          onChange={markDirty}/>}
        {sub === 'aspetto' && <VetrinaAspetto onChange={markDirty}/>}
        {sub === 'pubblico' && <VetrinaPubblico social={social} setSocial={s => {setSocial(s); markDirty();}} onChange={markDirty}/>}
      </ImpWithPreview>
    </div>
  );
}

// ─── Indicatore completamento ────────────────────────────────────────────────

function VetrinaCompletion({ items, pct }) {
  const ringStyle = {
    background: `conic-gradient(${PN.PINK} ${pct*3.6}deg, #F4F5F7 0)`,
  };
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 18,
      padding: '14px 18px',
      background: PN.WHITE,
      border:`1px solid ${PN.BORDER_SOFT}`,
      borderRadius: 12,
      marginBottom: 18,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius:'50%',
        ...ringStyle,
        display:'grid', placeItems:'center', flexShrink: 0,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius:'50%',
          background: PN.WHITE,
          display:'grid', placeItems:'center',
          fontSize: 15, fontWeight: 800, color: PN.TEXT,
        }}>{pct}%</div>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>Vetrina pronta al {pct}%</div>
        <div style={{display:'flex', flexWrap:'wrap', gap: 6, marginTop: 6}}>
          {items.map((c, i) => (
            <span key={i} style={{
              fontSize: 13, fontWeight: 600,
              padding:'3px 9px', borderRadius: 999,
              background: c.done ? PN.GREEN_SOFT : '#F4F5F7',
              color: c.done ? PN.GREEN : PN.MUTED,
            }}>{c.done ? `✓ ${c.label}` : `${c.label} · Da completare`}</span>
          ))}
        </div>
      </div>
      {/* Pulsante "Pubblica vetrina" rimosso: l'azione vive ora come PublishButton
          sopra il phone preview (vedi ImpWithPreview). Il banner qui è solo
          progress-info, non chiama all'azione. */}
    </div>
  );
}

// ─── Profilo (info + categorie + tag + sedi) ────────────────────────────────

function VetrinaProfilo({ tags, setTags, categoria, setCategoria, onChange }) {
  const [services, setServices] = React.useState({'WiFi gratuito': true});
  const [access, setAccess] = React.useState({'Servizio al tavolo': true});
  const days = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
  const [openDays, setOpenDays] = React.useState({Lun:true,Mar:true,Mer:true,Gio:true,Ven:true,Sab:true});
  const allTags = ['Elegante','Luxury','Tradizionale','Moderno','Vivace','Romantico','Rustico','Tranquillo','Conviviale','Minimal'];
  // Tag: massimo 3. Il quarto tentativo accende e scuote la riga-guida.
  const [tagLimitHit, setTagLimitHit] = React.useState(false);
  const toggleTag = (t) => {
    if (tags.includes(t)) { setTags(tags.filter(x => x !== t)); return; }
    if (tags.length >= 3) {
      setTagLimitHit(true);
      clearTimeout(toggleTag._t);
      toggleTag._t = setTimeout(() => setTagLimitHit(false), 1500);
      return;
    }
    setTags([...tags, t]);
  };
  // Popup certificazioni: null | {mode:'new'} | {mode:'rifiutata', name, reason}
  const [certModal, setCertModal] = React.useState(null);

  return (
    <div>
      <ImpCard title="Informazioni pratiche" sub="Dettagli utili che i clienti vedono sulla vetrina">
        {/* Due colonne: campi a sinistra, servizi e accessibilità a destra —
            la card resta compatta invece di allungarsi in verticale. */}
        <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 26, alignItems: 'start'}}>
          <div style={{minWidth: 0}}>
            <ImpField label="Nome locale" hint="Come appare in vetrina, sui link e nelle ricevute">
              <ImpInput placeholder="es. Trattoria del Borgo"/>
            </ImpField>
            <ImpField label="Sito web">
              <ImpInput placeholder="es. nomeristorante.it"/>
            </ImpField>
            <ImpField label="Indirizzo su Google Maps" hint="Incolla il link Google Maps della tua attività">
              <ImpInput placeholder="https://maps.app.goo.gl/..."/>
            </ImpField>
            <ImpField label="Descrizione" hint="Racconta storia, atmosfera e cosa rende unico il locale (consigliato 2–4 frasi)">
              <ImpTextarea placeholder="Es. Trattoria di famiglia dal 1962, cucina romana di tradizione…"/>
            </ImpField>
          </div>

          {/* Servizi e accessibilità: tessere con icona e descrizione,
              selezione con spunta — niente più liste di checkbox. */}
          <div style={{minWidth: 0}}>
            <div style={{fontSize:14, fontWeight:600, marginBottom:8}}>Servizi disponibili</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 14}}>
              {SERVICE_TILES.servizi.map(s => (
                <ServiceTile key={s.label} {...s} on={!!services[s.label]}
                  onToggle={() => {setServices(o => ({...o, [s.label]: !o[s.label]})); onChange();}}/>
              ))}
            </div>
            <div style={{fontSize:14, fontWeight:600, marginBottom:8}}>Accessibilità</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap: 8}}>
              {SERVICE_TILES.accessibilita.map(s => (
                <ServiceTile key={s.label} {...s} on={!!access[s.label]}
                  onToggle={() => {setAccess(o => ({...o, [s.label]: !o[s.label]})); onChange();}}/>
              ))}
            </div>
          </div>
        </div>
      </ImpCard>

      <ImpCard title="Orari di apertura" sub="Configura settimana e date speciali">
        {/* Mini-calendario settimanale visuale */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 6,
          marginBottom: 14,
        }}>
          {days.map(d => {
            const open = !!openDays[d];
            return (
              <button key={d} onClick={() => {setOpenDays(o => ({...o, [d]: !o[d]})); onChange();}} style={{
                padding:'10px 4px', borderRadius: 9,
                border:`1.5px solid ${open ? PN.PINK : PN.BORDER_SOFT}`,
                background: open ? PN.PINK_SOFT : PN.WHITE,
                cursor:'pointer', fontFamily:'inherit',
              }}>
                <div style={{fontSize:13, fontWeight:700, color: open ? PN.PINK_DARK : PN.MUTED, marginBottom: 4}}>{d}</div>
                <div style={{fontSize:12.5, color: open ? PN.TEXT : PN.MUTED, fontWeight: 600}}>
                  {open ? '09–23' : 'Chiuso'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dettaglio orari per giorno */}
        <div style={{display:'flex', flexDirection:'column', gap: 6}}>
          {days.filter(d => openDays[d]).map(d => (
            <div key={d} style={{
              display:'grid', gridTemplateColumns: '60px 1fr',
              alignItems:'center', gap: 12,
              padding: '8px 12px',
              border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 9,
            }}>
              <span style={{fontSize:14.5, fontWeight:700}}>{d}</span>
              <div style={{display:'flex', alignItems:'center', gap: 8}}>
                <ImpInput defaultValue="09:00" style={{width:74, padding:'7px 10px'}}/>
                <span style={{color:PN.MUTED}}>—</span>
                <ImpInput defaultValue="23:00" style={{width:74, padding:'7px 10px'}}/>
                <button style={{
                  background:'transparent', border:'none', color:PN.PINK,
                  fontSize:13.5, fontWeight:600, cursor:'pointer',
                }}>+ Aggiungi turno</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop: 14, paddingTop: 14, borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{fontSize:14.5, fontWeight:700, marginBottom: 8}}>Date speciali</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
            <div style={{
              padding:'9px 12px', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 9,
              fontSize:14.5, display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <span><b>25–30 Dic</b> · Chiuso</span>
              <button style={{background:'transparent', border:'none', color:PN.MUTED, cursor:'pointer'}}>
                <PnI.X size={13}/>
              </button>
            </div>
            <button style={{
              padding:'9px 12px', border:`1.5px dashed ${PN.BORDER}`, borderRadius: 9,
              background:'transparent', color:PN.MUTED, fontSize:14.5, fontWeight:600, cursor:'pointer',
            }}>+ Aggiungi data</button>
          </div>
        </div>
      </ImpCard>

      {/* Categoria: niente aurora, tessere grandi con icona; in hover la
          descrizione di quando scegliere quella categoria. */}
      <ImpCard title="Categoria del locale" sub="Il tuo locale apparirà agli utenti dell'App Byup nella categoria che selezioni">
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10}}>
          {VETRINA_CATS.map(c => (
            <CatTile key={c.name} cat={c} active={categoria === c.name}
              onPick={() => setCategoria(c.name)}/>
          ))}
        </div>
      </ImpCard>

      {/* ─── Avanzate: tag, sedi e certificazioni — contratte di default ── */}
      <div style={{margin: '22px 2px 10px'}}>
        <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.8, textTransform: 'uppercase'}}>Avanzate</div>
        <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>Opzioni per raffinare la vetrina: aprile solo se ti servono.</div>
      </div>

      <CollapsibleCard title="Tag" sub="Il tono del locale in tre parole">
        <div style={{
          fontSize: 13.5, fontWeight: 600, marginBottom: 10,
          color: tagLimitHit ? PN.PINK : PN.MUTED,
          animation: tagLimitHit ? 'tag-limit-shake 380ms ease' : 'none',
          transition: 'color 150ms ease',
        }}>
          Atmosfera · puoi selezionarne massimo 3
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap: 7}}>
          {allTags.map(t => {
            const on = tags.includes(t);
            return (
              <button key={t} onClick={() => toggleTag(t)} style={{
                padding: '6px 12px', borderRadius: 999,
                border:`1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                background: on ? PN.PINK : PN.WHITE,
                color: on ? '#fff' : PN.TEXT,
                fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
              }}>{on ? '✓ ' : '+ '}{t}</button>
            );
          })}
        </div>
        <style>{`@keyframes tag-limit-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); } 40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); } 80% { transform: translateX(3px); }
        }`}</style>
      </CollapsibleCard>

      <CollapsibleCard title="Sedi" sub="Aggiungi sedi secondarie del tuo locale"
        action={<AnimatedAddButton>Aggiungi sede</AnimatedAddButton>}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
          {[
            {name:'Sede principale', addr:'Via Roma 13, Roma', status:'Attiva', sc:PN.GREEN, bg:PN.GREEN_SOFT,
             photo:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=640&q=70&auto=format&fit=crop'},
            {name:'Sede Parioli', addr:'Viale Parioli 23, Roma', status:'In verifica', sc:PN.AMBER, bg:PN.AMBER_SOFT,
             photo:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=640&q=70&auto=format&fit=crop'},
          ].map((s,i) => (
            <div key={i} style={{
              border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 12, overflow:'hidden',
              background: PN.WHITE,
            }}>
              {/* Foto placeholder della sede, con lo stato in overlay */}
              <div style={{height: 96, position:'relative', background:'#EDEAE4'}}>
                <img src={s.photo} alt="" loading="lazy"
                  style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
                <span style={{
                  position:'absolute', top: 8, right: 8,
                  fontSize: 12.5, fontWeight: 700,
                  padding:'3px 9px', borderRadius: 999,
                  background: s.bg, color: s.sc,
                  boxShadow: '0 1px 4px rgba(15,17,21,0.15)',
                }}>● {s.status}</span>
              </div>
              <div style={{padding: '12px 14px'}}>
                <div style={{fontSize: 15.5, fontWeight: 700}}>{s.name}</div>
                <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>{s.addr}</div>
                <div style={{display:'flex', gap: 6, marginTop: 10}}>
                  <ImpButton variant="ghost" style={{flex:1, justifyContent:'center', padding:'6px 10px', fontSize: 13.5}}>Modifica</ImpButton>
                  <button style={{
                    padding:'6px 10px', flex:1,
                    background: PN.PINK_SOFT, color: PN.PINK_DARK,
                    border:'none', borderRadius: 8,
                    fontSize: 13.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                  }}>Rimuovi</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Certificazioni alimentari" sub="Mostrate sulla vetrina dopo approvazione"
        action={<ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={() => setCertModal({mode:'new'})}>Carica certificazione</ImpButton>}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
          {VETRINA_CERTS.map(c => (
            <CertCard key={c.name} cert={c}
              onOpenRejected={() => setCertModal({mode:'rifiutata', name: c.name, reason: c.reason})}/>
          ))}
        </div>
        <div style={{fontSize:13.5, color:PN.MUTED, marginTop:12, lineHeight:1.5}}>
          Enti accettati: AIC, ICEA, WHAD ITALIA, EIA, Rabbinato Centrale di Roma, VEGANOK.
        </div>
      </CollapsibleCard>

      {certModal && <CertUploadModal ctx={certModal} onClose={() => setCertModal(null)}/>}
    </div>
  );
}

// ─── Vetrina-profilo: icone, dati e tessere ─────────────────────────────────

// Icone stroke coerenti (niente emoji): disegnate sul viewBox 24, ereditano
// il colore dal chip che le ospita.
const VIcon = {
  shield:    (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 2.8v5.4c0 4.3-2.9 7.3-7 8.8-4.1-1.5-7-4.5-7-8.8V5.8L12 3z"/><path d="M9.5 12l1.8 1.8 3.4-3.6"/></svg>,
  car:       (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16v-3.2L6 8.2A1.8 1.8 0 0 1 7.7 7h8.6A1.8 1.8 0 0 1 18 8.2l1.5 4.6V16"/><path d="M4.5 12.8h15"/><circle cx="8" cy="16.2" r="1.5"/><circle cx="16" cy="16.2" r="1.5"/></svg>,
  wifi:      (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 9.6a12.4 12.4 0 0 1 16 0"/><path d="M7 13a8.2 8.2 0 0 1 10 0"/><path d="M10 16.3a4.2 4.2 0 0 1 4 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none"/></svg>,
  paw:       (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="6.4" cy="10" r="1.7"/><circle cx="10" cy="6.8" r="1.7"/><circle cx="14" cy="6.8" r="1.7"/><circle cx="17.6" cy="10" r="1.7"/><path d="M12 11c2.9 0 5.3 2.1 5.3 4.4 0 1.6-1.3 2.6-2.8 2.6-.9 0-1.7-.5-2.5-.5s-1.6.5-2.5.5c-1.5 0-2.8-1-2.8-2.6C6.7 13.1 9.1 11 12 11z"/></svg>,
  wheelchair:(s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4.6" r="1.7"/><path d="M12 7.5v4.5h4.4l2.1 5"/><path d="M15.5 17.6a4.6 4.6 0 1 1-5.6-6.4"/></svg>,
  braille:   (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 5.5H9a2.5 2.5 0 0 1 2.5 2.5v10.5A2.5 2.5 0 0 0 9 16H3.5z"/><path d="M20.5 5.5H15a2.5 2.5 0 0 0-2.5 2.5v10.5A2.5 2.5 0 0 1 15 16h5.5z"/></svg>,
  bell:      (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 17a7.5 7.5 0 0 1 15 0z"/><path d="M12 9.5V7.5"/><path d="M10.5 7.5h3"/><path d="M3 20h18"/></svg>,
  forkKnife: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 3v5.5a2 2 0 0 0 4 0V3"/><path d="M8.5 3v18"/><path d="M17.5 3c-1.6 2-2.3 4.2-2.3 6.5 0 2 .9 3 2.3 3V21"/></svg>,
  pizza:     (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4.5c4.5-2 9.5-2 14 0L12 21z"/><path d="M5.8 8.5c4-1.7 8.4-1.7 12.4 0"/><circle cx="10.5" cy="11" r=".9" fill="currentColor" stroke="none"/><circle cx="14" cy="13.5" r=".9" fill="currentColor" stroke="none"/></svg>,
  fish:      (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 12S8.5 7 14 7s7.5 5 7.5 5-2.5 5-7.5 5-8.5-5-8.5-5z"/><path d="M5.5 12L2.5 9v6z"/><circle cx="16.5" cy="10.8" r=".9" fill="currentColor" stroke="none"/></svg>,
  steak:     (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5c1.2 2.8-2.2 3.9-2.2 6.6a4.2 4.2 0 0 0 8.4.4c0-3.4-4-4.5-6.2-7z"/><path d="M6.5 14.5a5.5 5.5 0 1 0 11 .2"/></svg>,
  globe:     (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.6 2.3 3.9 5.2 3.9 8.5s-1.3 6.2-3.9 8.5c-2.6-2.3-3.9-5.2-3.9-8.5s1.3-6.2 3.9-8.5z"/></svg>,
  coffee:    (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8.5h12V14a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 9.5h2.2a2.4 2.4 0 0 1 0 4.8H16"/><path d="M7.5 4.5v1.8M10.5 3.5v2.8M13.5 4.5v1.8"/></svg>,
  cheers:    (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3.5h4l-.8 7a1.6 1.6 0 0 1-3.2 0z"/><path d="M9 12.5V20"/><path d="M6.5 20.5h5"/><path d="M14.5 5.5l4.5 1-2 6.2a1.6 1.6 0 0 1-3-.9z"/><path d="M15.5 13.5l-1 6.5"/></svg>,
  wine:      (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 3.5h9c0 4.8-1.9 7.7-4.5 7.7S7.5 8.3 7.5 3.5z"/><path d="M12 11.2V20"/><path d="M8.5 20.5h7"/><path d="M8 7h8"/></svg>,
  doc:       (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 3h7.5l3.5 3.5V21h-11z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 15.5h6"/></svg>,
  alert:     (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5L21.5 20h-19z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none"/></svg>,
};

// Chip-icona: quadratino arrotondato tinta + icona che ne eredita il colore.
function VIconChip({ name, on, size = 38 }) {
  const I = VIcon[name] || VIcon.doc;
  return (
    <span style={{
      width: size, height: size, borderRadius: Math.round(size * 0.28),
      background: on ? 'rgba(255, 90, 95, 0.14)' : '#F1F2F5',
      color: on ? PN.PINK_DARK : PN.TEXT,
      display: 'inline-grid', placeItems: 'center', flexShrink: 0,
      transition: 'background 150ms ease, color 150ms ease',
    }}>{I(Math.round(size * 0.55))}</span>
  );
}

const SERVICE_TILES = {
  servizi: [
    { label: 'Parcheggio custodito', icon: 'shield', desc: 'Posto auto sorvegliato per i clienti' },
    { label: 'Parcheggio riservato', icon: 'car',    desc: 'Posti dedicati davanti al locale' },
    { label: 'WiFi gratuito',        icon: 'wifi',   desc: 'Rete libera per gli ospiti' },
    { label: 'Animali ammessi',      icon: 'paw',    desc: 'Amici a quattro zampe benvenuti' },
  ],
  accessibilita: [
    { label: 'Rampa per disabili',   icon: 'wheelchair', desc: 'Ingresso senza barriere' },
    { label: 'Menù per non vedenti', icon: 'braille',    desc: 'Disponibile anche in Braille' },
    { label: 'Servizio al tavolo',   icon: 'bell',       desc: 'Il personale serve al tavolo' },
  ],
};

function ServiceTile({ label, icon, desc, on, onToggle }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onToggle}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', textAlign: 'left',
        padding: '14px 14px 12px', borderRadius: 12,
        border: `1.5px solid ${on ? PN.PINK : hover ? PN.BORDER : PN.BORDER_SOFT}`,
        background: on ? PN.PINK_SOFT : PN.WHITE,
        cursor: 'pointer', fontFamily: 'inherit',
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'border-color 150ms ease, background 150ms ease, transform 150ms ease',
      }}>
      {on && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          width: 20, height: 20, borderRadius: '50%',
          background: PN.PINK, display: 'grid', placeItems: 'center',
          boxShadow: '0 2px 6px rgba(255, 90, 95, 0.40)',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      )}
      <div style={{marginBottom: 9}}><VIconChip name={icon} on={on}/></div>
      <div style={{fontSize: 14.5, fontWeight: 700, color: on ? PN.PINK_DARK : PN.TEXT}}>{label}</div>
      <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.35}}>{desc}</div>
    </button>
  );
}

const VETRINA_CATS = [
  { name: 'Ristorante',     icon: 'forkKnife', desc: 'Cucina completa con servizio al tavolo, pranzo e cena' },
  { name: 'Pizzeria',       icon: 'pizza',     desc: 'La pizza al centro del menù, al tavolo o d\'asporto' },
  { name: 'Giapponese',     icon: 'fish',      desc: 'Sushi, ramen e cucina nipponica' },
  { name: 'Carne & Griglia',icon: 'steak',     desc: 'Braceria: tagli, grigliate e affumicati' },
  { name: 'Cucina etnica',  icon: 'globe',     desc: 'Sapori dal mondo: indiano, messicano, mediorientale' },
  { name: 'Bar',            icon: 'coffee',    desc: 'Caffetteria, colazioni e aperitivi veloci' },
  { name: 'Bistrot',        icon: 'cheers',    desc: 'Informale e curato: piatti semplici e buoni vini' },
  { name: 'Enoteca',        icon: 'wine',      desc: 'Vini al calice con taglieri e degustazioni' },
];

function CatTile({ cat, active, onPick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onPick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        minHeight: 122, padding: '14px 12px', borderRadius: 12, textAlign: 'center',
        border: `2px solid ${active ? PN.PINK : hover ? PN.BORDER : PN.BORDER_SOFT}`,
        background: active ? PN.PINK_SOFT : PN.WHITE,
        cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
        transition: 'border-color 150ms ease, background 150ms ease',
      }}>
      <div style={{marginBottom: 8}}><VIconChip name={cat.icon} on={active}/></div>
      <div style={{
        fontSize: 14.5, fontWeight: active ? 700 : 600,
        color: active ? PN.PINK_DARK : PN.TEXT,
      }}>{cat.name}</div>
      {/* Descrizione: appare in hover, lo spazio è riservato (box grandi) */}
      <div style={{
        fontSize: 12, color: PN.MUTED, lineHeight: 1.35, marginTop: 5,
        opacity: hover ? 1 : 0, transition: 'opacity 180ms ease',
      }}>{cat.desc}</div>
    </button>
  );
}

// Bottone "Aggiungi sede" — animato: lift con molla in hover e "+" che ruota.
function AnimatedAddButton({ children, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 16px', borderRadius: 10,
        border: '1px solid rgba(180, 30, 35, 0.40)',
        background: hover
          ? 'linear-gradient(180deg, #FF6E73 0%, #F04A4F 100%)'
          : 'linear-gradient(180deg, #FF6A6F 0%, #FF5A5F 100%)',
        color: '#fff', fontSize: 14.5, fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer',
        transform: hover ? 'translateY(-2px) scale(1.04)' : 'none',
        boxShadow: hover
          ? '0 10px 22px -6px rgba(255, 90, 95, 0.55), inset 0 1px 0 rgba(255,255,255,0.35)'
          : '0 1px 2px rgba(255, 90, 95, 0.18), inset 0 1px 0 rgba(255,255,255,0.35)',
        transition: 'transform 220ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 220ms ease, background 150ms ease',
      }}>
      <span style={{
        display: 'inline-flex',
        transform: hover ? 'rotate(90deg)' : 'none',
        transition: 'transform 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}><PnI.Plus size={13}/></span>
      {children}
    </button>
  );
}

// ─── Certificazioni: card di stato + popup di caricamento ───────────────────

const VETRINA_CERTS = [
  { name: 'Senza glutine', status: 'approvata' },
  { name: 'Biologico',     status: 'attesa',    sent: '12 luglio 2026' },
  { name: 'Halal',         status: 'rifiutata', reason: 'Documento scaduto: il certificato caricato non riporta la data di rinnovo dell\'ente.' },
];

function CertCard({ cert, onOpenRejected }) {
  const [hover, setHover] = React.useState(false);
  const clickable = cert.status === 'rifiutata';
  const S = {
    // Approvata e rifiutata: solo il bordo colorato, dentro bianche.
    approvata: { border: PN.GREEN,       color: PN.GREEN, label: 'Approvata',            bg: PN.WHITE },
    rifiutata: { border: PN.RED,         color: PN.RED,   label: 'Rifiutata · vedi motivo', bg: PN.WHITE },
    // In attesa: grigiastra, con l'icona dell'attesa a destra.
    attesa:    { border: PN.BORDER_SOFT, color: PN.MUTED, label: 'In attesa',            bg: '#F4F5F7' },
  }[cert.status];
  return (
    <div
      onClick={clickable ? onOpenRejected : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: '14px 16px', borderRadius: 12,
        background: S.bg,
        border: `1.5px solid ${S.border}`,
        cursor: clickable ? 'pointer' : 'default',
        transform: hover ? 'scale(1.045)' : 'scale(1)',
        boxShadow: hover ? '0 10px 24px rgba(15, 17, 21, 0.10)' : 'none',
        transition: 'transform 180ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 180ms ease',
        display: 'flex', alignItems: 'center', gap: 10,
        zIndex: hover ? 2 : 1,
      }}>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>{cert.name}</div>
        <div style={{fontSize: 13.5, color: S.color, fontWeight: 600, marginTop: 3}}>{S.label}</div>
      </div>
      {cert.status === 'attesa' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PN.MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
          <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
        </svg>
      )}
      {cert.status === 'attesa' && hover && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          background: PN.TEXT, color: '#fff', fontSize: 12.5, fontWeight: 600,
          padding: '6px 10px', borderRadius: 8, whiteSpace: 'nowrap', zIndex: 6,
          boxShadow: '0 6px 16px rgba(15, 17, 21, 0.25)', pointerEvents: 'none',
        }}>
          Richiesta inviata il {cert.sent}
        </div>
      )}
    </div>
  );
}

const CERT_TYPES = ['Senza glutine', 'Biologico', 'Vegano', 'Halal', 'Kosher'];

function CertUploadModal({ ctx, onClose }) {
  const rejected = ctx.mode === 'rifiutata';
  // Per cosa è la certificazione: dal rifiuto arriva già selezionata.
  const [tipo, setTipo] = React.useState(rejected ? ctx.name : null);
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(15, 17, 21, 0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cert-overlay-in 180ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 480, maxWidth: 'calc(100% - 48px)',
        background: PN.WHITE, borderRadius: 16,
        boxShadow: '0 30px 70px -20px rgba(15, 17, 21, 0.35)',
        padding: '20px 22px',
        animation: 'cert-modal-pop 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>
              {rejected ? `Ricarica certificazione — ${ctx.name}` : 'Carica certificazione'}
            </div>
            <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>
              PDF rilasciato da un ente accettato, max 10MB.
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            border: 'none', background: '#F4F5F7', color: PN.TEXT,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}><PnI.X size={13}/></button>
        </div>

        {rejected && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '11px 13px', borderRadius: 10, marginBottom: 14,
            background: PN.RED_SOFT, border: `1px solid ${PN.RED}44`,
          }}>
            <span style={{color: PN.RED, flexShrink: 0, marginTop: 1}}>{VIcon.alert(16)}</span>
            <div>
              <div style={{fontSize: 13.5, fontWeight: 700, color: PN.RED}}>Motivo del rifiuto</div>
              <div style={{fontSize: 13.5, color: PN.TEXT, marginTop: 2, lineHeight: 1.45}}>{ctx.reason}</div>
            </div>
          </div>
        )}

        {/* Per cosa è la certificazione */}
        <div style={{marginBottom: 14}}>
          <div style={{fontSize: 13.5, fontWeight: 600, color: PN.TEXT, marginBottom: 8}}>
            Per cosa è la certificazione?
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 7}}>
            {CERT_TYPES.map(t => {
              const on = tipo === t;
              return (
                <button key={t} onClick={() => setTipo(t)} style={{
                  padding: '6px 12px', borderRadius: 999,
                  border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                  background: on ? PN.PINK : PN.WHITE,
                  color: on ? '#fff' : PN.TEXT,
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
                }}>{t}</button>
              );
            })}
          </div>
        </div>

        <div style={{
          padding: '24px 16px', border: `2px dashed ${PN.BORDER}`, borderRadius: 12,
          textAlign: 'center', background: '#FAFBFC', marginBottom: 14, cursor: 'pointer',
        }}>
          <div style={{color: PN.MUTED, marginBottom: 6, display: 'flex', justifyContent: 'center'}}>{VIcon.doc(24)}</div>
          <div style={{fontSize: 14.5, fontWeight: 600, color: PN.TEXT}}>Trascina qui il certificato</div>
          <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2}}>oppure clicca per sfogliare</div>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
          <ImpButton variant="primary" onClick={onClose} disabled={!tipo}>
            {rejected ? 'Invia di nuovo' : 'Carica'}
          </ImpButton>
        </div>
      </div>
      <style>{`
        @keyframes cert-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

// ─── Card collassabile (gruppo Avanzate) ────────────────────────────────────

function CollapsibleCard({ title, sub, action, children, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section style={{
      background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
      borderRadius: 14, marginBottom: 12, overflow: 'visible',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '15px 22px', background: 'transparent', border: 'none',
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      }}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>{title}</div>
          {sub && <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>{sub}</div>}
        </div>
        {open && action && <span onClick={e => e.stopPropagation()}>{action}</span>}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PN.MUTED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          style={{flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease'}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          padding: '16px 22px 20px',
          borderTop: `1px solid ${PN.BORDER_SOFT}`,
          animation: 'coll-open 220ms ease',
        }}>
          {children}
        </div>
      )}
      <style>{`@keyframes coll-open { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }`}</style>
    </section>
  );
}

// ─── Aspetto (logo + vetrine + galleria) ────────────────────────────────────

function VetrinaAspetto({ onChange }) {
  return (
    <div>
      <ImpCard aurora title="Logo del tuo locale" sub="PNG o JPG, formato quadrato consigliato, max 5MB">
        <div style={{
          padding: 32, border:`2px dashed ${PN.BORDER}`, borderRadius: 12,
          textAlign:'center', background:'#FAFBFC',
        }}>
          <div style={{fontSize:16, color:PN.MUTED, marginBottom: 12}}>Trascina o clicca per caricare</div>
          <ImpButton variant="ghost">Carica logo</ImpButton>
        </div>
      </ImpCard>

      <ImpCard title="Le tue vetrine" sub="Solo una vetrina può essere pubblicata. Crea vetrine tematiche per occasioni speciali" action={
        <ImpButton variant="ghost" icon={<PnI.Plus size={13}/>}>Nuova</ImpButton>
      }>
        {[
          {name:'Vetrina principale', active: true, sub:'Sempre visibile'},
          {name:'San Valentino', active: false, sub:'Bozza'},
          {name:'Vetrina estate', active: false, sub:'Bozza · ultima modifica 2 mesi fa'},
        ].map((v, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap: 12,
            padding: '14px 16px',
            border:`1.5px solid ${v.active ? PN.PINK : PN.BORDER_SOFT}`,
            background: v.active ? PN.PINK_SOFT : PN.WHITE,
            borderRadius: 10, marginBottom: 8,
          }}>
            <span style={{
              width:18, height:18, borderRadius:'50%',
              border: `1.5px solid ${v.active ? PN.PINK : PN.BORDER}`,
              background: PN.WHITE,
              display:'grid', placeItems:'center',
            }}>
              {v.active && <span style={{width:9, height:9, borderRadius:'50%', background:PN.PINK}}/>}
            </span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:15.5, fontWeight:600}}>{v.name}</div>
              <div style={{fontSize:13, color:PN.MUTED, marginTop:1}}>{v.sub}</div>
            </div>
            {v.active && <span style={{fontSize:13, fontWeight:700, color:PN.PINK_DARK, letterSpacing:0.4}}>PUBBLICATA</span>}
            <ImpButton variant="ghost" style={{padding:'6px 12px', fontSize:14}}>Modifica</ImpButton>
          </div>
        ))}
      </ImpCard>

      <ImpCard aurora title="Galleria fotografica" sub="Foto del locale e dei piatti — consigliate min. 5 foto">
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10}}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              aspectRatio:'1', borderRadius: 10,
              background: `linear-gradient(135deg, hsl(${i*60} 30% 70%), hsl(${i*60+30} 40% 60%))`,
              position:'relative',
            }}>
              <button style={{
                position:'absolute', top:6, right:6,
                width: 24, height:24, borderRadius:6,
                background:'rgba(0,0,0,0.5)', border:'none', color:'#fff',
                cursor:'pointer', display:'grid', placeItems:'center',
              }}><PnI.X size={12}/></button>
            </div>
          ))}
          <div style={{
            aspectRatio:'1', borderRadius: 10,
            border:`2px dashed ${PN.BORDER}`,
            display:'grid', placeItems:'center',
            color: PN.MUTED, fontSize: 13.5, fontWeight: 600, cursor:'pointer',
          }}>
            <div style={{textAlign:'center'}}>
              <PnI.Plus size={20} color={PN.MUTED}/>
              <div style={{marginTop:4}}>Aggiungi</div>
            </div>
          </div>
        </div>
      </ImpCard>
    </div>
  );
}

// ─── Pubblico (FAQ + social) ────────────────────────────────────────────────

function VetrinaPubblico({ social, setSocial, onChange }) {
  const toggleSocial = (k) => setSocial(social.includes(k) ? social.filter(x => x !== k) : [...social, k]);
  const faqs = [
    'Avete prodotti senza glutine?',
    'Fate asporto?',
    'Organizzate feste di compleanno?',
  ];
  return (
    <div>
      <ImpCard title="Domande frequenti" sub="Aiuta i clienti a trovare risposte rapide. Crea, ordina e modifica le FAQ" action={
        <ImpButton variant="primary" icon={<PnI.Plus size={13}/>}>Nuova FAQ</ImpButton>
      }>
        <div style={{display:'flex', flexDirection:'column', gap: 8}}>
          {faqs.map((q,i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap: 12,
              padding: '12px 14px',
              border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
            }}>
              <span style={{color:PN.MUTED, cursor:'grab'}}><PnI.Drag size={14}/></span>
              <span style={{flex:1, fontSize:15.5, fontWeight:600}}>{q}</span>
              <button style={{background:'transparent', border:'none', cursor:'pointer', color:PN.MUTED, padding:6}}>
                <PnI.Edit size={14}/>
              </button>
              <button style={{background:'transparent', border:'none', cursor:'pointer', color:PN.RED, padding:6}}>
                <PnI.X size={14}/>
              </button>
            </div>
          ))}
        </div>
      </ImpCard>

      <ImpCard title="Account social" sub="Collega i tuoi profili. Appariranno sulla vetrina">
        <div style={{
          padding: '14px 16px', border:`1.5px solid ${PN.GREEN_SOFT}`,
          borderRadius: 10, background: '#F0FDF4',
          display:'flex', alignItems:'center', gap: 12, marginBottom: 16,
        }}>
          <div style={{
            width: 36, height:36, borderRadius: 8,
            background:'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            display:'grid', placeItems:'center', color:'#fff', fontSize:17, fontWeight:800,
          }}>IG</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13, fontWeight:700, color:PN.GREEN, letterSpacing:0.4}}>● COLLEGATO</div>
            <div style={{fontSize:15.5, fontWeight:700}}>@ristoranteparadiso</div>
          </div>
          <button style={{background:'transparent', border:'none', color:PN.RED, fontSize:14, fontWeight:600, cursor:'pointer'}}>Scollega</button>
        </div>

        <div style={{fontSize:13.5, fontWeight:600, color:PN.MUTED, marginBottom:8, letterSpacing:0.3, textTransform:'uppercase'}}>Aggiungi altri social</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10}}>
          {[
            {key:'tw', name:'Twitter / X', bg:'#000'},
            {key:'yt', name:'YouTube', bg:'#FF0000'},
            {key:'tt', name:'TikTok', bg:'#000'},
            {key:'li', name:'LinkedIn', bg:'#0A66C2'},
            {key:'fb', name:'Facebook', bg:'#1877F2'},
          ].map(s => {
            const on = social.includes(s.key);
            return (
              <button key={s.key} onClick={() => toggleSocial(s.key)} style={{
                display:'flex', alignItems:'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                border:`1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                background: on ? PN.PINK_SOFT : PN.WHITE,
                cursor:'pointer', fontFamily:'inherit',
              }}>
                <span style={{
                  width:24, height:24, borderRadius:5, background:s.bg,
                  display:'grid', placeItems:'center', color:'#fff', fontSize:13, fontWeight:800,
                }}>{s.name[0]}</span>
                <span style={{fontSize:15, fontWeight:600, flex:1, textAlign:'left'}}>{s.name}</span>
                {on && <span style={{fontSize:13, color:PN.PINK_DARK, fontWeight:700}}>✓</span>}
              </button>
            );
          })}
        </div>
      </ImpCard>
    </div>
  );
}

window.ImpVetrina = ImpVetrina;
