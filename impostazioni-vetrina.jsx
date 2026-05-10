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
    { id: 'pubblico', label: 'Pubblico' },
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
          fontSize: 13, fontWeight: 800, color: PN.TEXT,
        }}>{pct}%</div>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>Vetrina pronta al {pct}%</div>
        <div style={{display:'flex', flexWrap:'wrap', gap: 6, marginTop: 6}}>
          {items.map((c, i) => (
            <span key={i} style={{
              fontSize: 11, fontWeight: 600,
              padding:'3px 9px', borderRadius: 999,
              background: c.done ? PN.GREEN_SOFT : '#F4F5F7',
              color: c.done ? PN.GREEN : PN.MUTED,
            }}>{c.done ? '✓' : '○'} {c.label}</span>
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
  const [services, setServices] = React.useState({Parcheggio:true});
  const [access, setAccess] = React.useState({});
  const days = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
  const [openDays, setOpenDays] = React.useState({Lun:true,Mar:true,Mer:true,Gio:true,Ven:true,Sab:true});
  const cats = ['Ristorante','Pizzeria','Giapponese','Carne & Griglia','Cucina etnica','Bar','Bistrot','Enoteca'];
  const allTags = ['Elegante','Luxury','Tradizionale','Moderno','Vivace','Romantico','Rustico','Tranquillo','Conviviale','Minimal'];
  const targets = ['Coppie','Famiglie','Gruppi','Business','Turisti','Aperitivo','Eventi privati','Compleanni'];
  const [activeTargets, setActiveTargets] = React.useState({Coppie:true, Famiglie:true});
  const toggleTag = (t) => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);

  return (
    <div>
      <ImpCard title="Informazioni pratiche" sub="Dettagli utili che i clienti vedono sulla vetrina">
        <ImpField label="Nome locale" hint="Come appare in vetrina, sui link e nelle ricevute">
          <ImpInput placeholder="es. Trattoria del Borgo"/>
        </ImpField>
        <ImpField label="Sito web">
          <ImpInput placeholder="es. nomeristorante.it"/>
        </ImpField>
        <ImpField label="Posizione GPS (Google Maps)" hint="Incolla il link Google Maps della tua attività">
          <ImpInput placeholder="https://maps.app.goo.gl/..."/>
        </ImpField>
        <ImpField label="Descrizione" hint="Racconta storia, atmosfera e cosa rende unico il locale (consigliato 2–4 frasi)">
          <ImpTextarea placeholder="Es. Trattoria di famiglia dal 1962, cucina romana di tradizione…"/>
        </ImpField>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 24, paddingTop: 4}}>
          <div>
            <div style={{fontSize:12, fontWeight:600, marginBottom:4}}>Servizi disponibili</div>
            <div style={{display:'flex', flexDirection:'column'}}>
              {['Parcheggio custodito','Parcheggio riservato','WiFi gratuito','Animali ammessi'].map(s => (
                <ImpCheckbox key={s} label={s} checked={!!services[s]} onChange={() => {setServices(o => ({...o, [s]: !o[s]})); onChange();}}/>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:12, fontWeight:600, marginBottom:4}}>Accessibilità</div>
            <div style={{display:'flex', flexDirection:'column'}}>
              {['Rampa per disabili','Menù per non vedenti','Assistenza ai tavoli','Servizio al tavolo'].map(s => (
                <ImpCheckbox key={s} label={s} checked={!!access[s]} onChange={() => {setAccess(o => ({...o, [s]: !o[s]})); onChange();}}/>
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
                <div style={{fontSize:11, fontWeight:700, color: open ? PN.PINK_DARK : PN.MUTED, marginBottom: 4}}>{d}</div>
                <div style={{fontSize:10.5, color: open ? PN.TEXT : PN.MUTED, fontWeight: 600}}>
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
              <span style={{fontSize:12.5, fontWeight:700}}>{d}</span>
              <div style={{display:'flex', alignItems:'center', gap: 8}}>
                <ImpInput defaultValue="09:00" style={{width:74, padding:'7px 10px'}}/>
                <span style={{color:PN.MUTED}}>—</span>
                <ImpInput defaultValue="23:00" style={{width:74, padding:'7px 10px'}}/>
                <button style={{
                  background:'transparent', border:'none', color:PN.PINK,
                  fontSize:11.5, fontWeight:600, cursor:'pointer',
                }}>+ Aggiungi turno</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop: 14, paddingTop: 14, borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{fontSize:12.5, fontWeight:700, marginBottom: 8}}>Date speciali</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
            <div style={{
              padding:'9px 12px', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 9,
              fontSize:12.5, display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <span><b>25–30 Dic</b> · Chiuso</span>
              <button style={{background:'transparent', border:'none', color:PN.MUTED, cursor:'pointer'}}>
                <PnI.X size={13}/>
              </button>
            </div>
            <button style={{
              padding:'9px 12px', border:`1.5px dashed ${PN.BORDER}`, borderRadius: 9,
              background:'transparent', color:PN.MUTED, fontSize:12.5, fontWeight:600, cursor:'pointer',
            }}>+ Aggiungi data</button>
          </div>
        </div>
      </ImpCard>

      <ImpCard title="Categoria del locale" sub="Scegli la categoria che descrive meglio il tuo locale">
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10}}>
          {cats.map(c => (
            <button key={c} onClick={() => setCategoria(c)} style={{
              padding: '14px 12px',
              border:`2px solid ${categoria===c ? PN.PINK : PN.BORDER_SOFT}`,
              borderRadius: 10, background: categoria===c ? PN.PINK_SOFT : PN.WHITE,
              color: categoria===c ? PN.PINK_DARK : PN.TEXT,
              fontSize: 13, fontWeight: categoria===c ? 700 : 500,
              cursor:'pointer', fontFamily:'inherit', textAlign:'center',
            }}>{c}</button>
          ))}
        </div>
      </ImpCard>

      <ImpCard title="Tag" sub="Scegli uno o più tag per farti trovare più velocemente dai clienti">
        <div style={{fontSize:11.5, fontWeight:600, color:PN.MUTED, marginBottom:8, letterSpacing:0.3, textTransform:'uppercase'}}>Atmosfera</div>
        <div style={{display:'flex', flexWrap:'wrap', gap: 7, marginBottom: 16}}>
          {allTags.map(t => {
            const on = tags.includes(t);
            return (
              <button key={t} onClick={() => toggleTag(t)} style={{
                padding: '6px 12px', borderRadius: 999,
                border:`1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                background: on ? PN.TEXT : PN.WHITE,
                color: on ? PN.WHITE : PN.TEXT,
                fontSize: 12, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              }}>{on ? '✓ ' : '+ '}{t}</button>
            );
          })}
        </div>
        <div style={{fontSize:11.5, fontWeight:600, color:PN.MUTED, marginBottom:8, letterSpacing:0.3, textTransform:'uppercase'}}>Target & occasione</div>
        <div style={{display:'flex', flexWrap:'wrap', gap: 7}}>
          {targets.map(t => (
            <button key={t} onClick={() => setActiveTargets(o => ({...o, [t]: !o[t]}))} style={{
              padding: '6px 12px', borderRadius: 999,
              border:`1.5px solid ${activeTargets[t] ? PN.TEXT : PN.BORDER}`,
              background: activeTargets[t] ? PN.TEXT : PN.WHITE,
              color: activeTargets[t] ? PN.WHITE : PN.TEXT,
              fontSize: 12, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            }}>{activeTargets[t] ? '✓ ' : '+ '}{t}</button>
          ))}
        </div>
      </ImpCard>

      <ImpCard title="Sedi" sub="Aggiungi sedi secondarie del tuo locale" action={
        <ImpButton variant="primary" icon={<PnI.Plus size={13}/>}>Aggiungi sede</ImpButton>
      }>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
          {[
            {name:'Sede principale', addr:'Via Roma 13, Roma', status:'Attiva', sc:PN.GREEN, bg:PN.GREEN_SOFT, c:'#7B3F2A'},
            {name:'Sede Parioli', addr:'Viale Parioli 23, Roma', status:'In attesa', sc:PN.AMBER, bg:PN.AMBER_SOFT, c:'#D2691E'},
          ].map((s,i) => (
            <div key={i} style={{
              border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 12, overflow:'hidden',
              background: PN.WHITE,
            }}>
              <div style={{
                height: 70, background: `linear-gradient(135deg, ${s.c}, #B8743A)`,
                position:'relative',
              }}>
                <span style={{
                  position:'absolute', top: 8, right: 8,
                  fontSize: 10.5, fontWeight: 700,
                  padding:'3px 9px', borderRadius: 999,
                  background: s.bg, color: s.sc,
                }}>● {s.status}</span>
              </div>
              <div style={{padding: '12px 14px'}}>
                <div style={{fontSize: 13.5, fontWeight: 700}}>{s.name}</div>
                <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 2}}>{s.addr}</div>
                <div style={{display:'flex', gap: 6, marginTop: 10}}>
                  <ImpButton variant="ghost" style={{flex:1, justifyContent:'center', padding:'6px 10px', fontSize: 11.5}}>Modifica</ImpButton>
                  <button style={{
                    padding:'6px 10px', flex:1,
                    background: PN.PINK_SOFT, color: PN.PINK_DARK,
                    border:'none', borderRadius: 8,
                    fontSize: 11.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                  }}>Rimuovi</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ImpCard>

      <ImpCard title="Certificazioni alimentari" sub="Mostrate sulla vetrina dopo approvazione" action={
        <ImpButton variant="primary" icon={<PnI.Plus size={13}/>}>Carica certificazione</ImpButton>
      }>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
          {[
            {name:'Senza glutine', status:'Approvata', color:PN.GREEN, bg:PN.GREEN_SOFT},
            {name:'Biologico', status:'In attesa', color:PN.AMBER, bg:PN.AMBER_SOFT},
            {name:'Halal', status:'Rifiutata', color:PN.RED, bg:PN.RED_SOFT},
          ].map(c => (
            <div key={c.name} style={{
              padding: '14px 16px', borderRadius: 10,
              background: c.bg, border:`1px solid ${PN.BORDER_SOFT}`,
            }}>
              <div style={{fontSize:13.5, fontWeight:700}}>{c.name}</div>
              <div style={{fontSize:12, color:c.color, fontWeight:600, marginTop:3}}>● {c.status}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:11.5, color:PN.MUTED, marginTop:12, lineHeight:1.5}}>
          Enti accettati: AIC, ICEA, WHAD ITALIA, EIA, Rabbinato Centrale di Roma, VEGANOK.
        </div>
      </ImpCard>
    </div>
  );
}

// ─── Aspetto (logo + vetrine + galleria) ────────────────────────────────────

function VetrinaAspetto({ onChange }) {
  return (
    <div>
      <ImpCard title="Logo del ristorante" sub="PNG o JPG, formato quadrato consigliato, max 5MB">
        <div style={{
          padding: 32, border:`2px dashed ${PN.BORDER}`, borderRadius: 12,
          textAlign:'center', background:'#FAFBFC',
        }}>
          <div style={{fontSize:14, color:PN.MUTED, marginBottom: 12}}>Trascina o clicca per caricare</div>
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
              <div style={{fontSize:13.5, fontWeight:600}}>{v.name}</div>
              <div style={{fontSize:11, color:PN.MUTED, marginTop:1}}>{v.sub}</div>
            </div>
            {v.active && <span style={{fontSize:11, fontWeight:700, color:PN.PINK_DARK, letterSpacing:0.4}}>PUBBLICATA</span>}
            <ImpButton variant="ghost" style={{padding:'6px 12px', fontSize:12}}>Modifica</ImpButton>
          </div>
        ))}
      </ImpCard>

      <ImpCard title="Galleria fotografica" sub="Foto del locale e dei piatti — consigliate min. 5 foto">
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
            color: PN.MUTED, fontSize: 11.5, fontWeight: 600, cursor:'pointer',
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
              <span style={{flex:1, fontSize:13.5, fontWeight:600}}>{q}</span>
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
            display:'grid', placeItems:'center', color:'#fff', fontSize:15, fontWeight:800,
          }}>IG</div>
          <div style={{flex:1}}>
            <div style={{fontSize:11, fontWeight:700, color:PN.GREEN, letterSpacing:0.4}}>● COLLEGATO</div>
            <div style={{fontSize:13.5, fontWeight:700}}>@ristoranteparadiso</div>
          </div>
          <button style={{background:'transparent', border:'none', color:PN.RED, fontSize:12, fontWeight:600, cursor:'pointer'}}>Scollega</button>
        </div>

        <div style={{fontSize:11.5, fontWeight:600, color:PN.MUTED, marginBottom:8, letterSpacing:0.3, textTransform:'uppercase'}}>Aggiungi altri social</div>
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
                  display:'grid', placeItems:'center', color:'#fff', fontSize:11, fontWeight:800,
                }}>{s.name[0]}</span>
                <span style={{fontSize:13, fontWeight:600, flex:1, textAlign:'left'}}>{s.name}</span>
                {on && <span style={{fontSize:11, color:PN.PINK_DARK, fontWeight:700}}>✓</span>}
              </button>
            );
          })}
        </div>
      </ImpCard>
    </div>
  );
}

window.ImpVetrina = ImpVetrina;
