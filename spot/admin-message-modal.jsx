// Modale invio messaggio clusterizzabile: scegli destinatari, canale, contenuto

const { useState: useStateMsg } = React;

function MessageModal({ open, onClose, audienceType, presetIds = [], audienceLabel }) {
  const [channels, setChannels] = useStateMsg({ push: true, email: true, in_app: false, sms: false });
  const [title, setTitle] = useStateMsg('');
  const [body, setBody] = useStateMsg('');
  const [cta, setCta] = useStateMsg('');
  const [schedule, setSchedule] = useStateMsg('now');
  const [step, setStep] = useStateMsg(1);
  const [audience, setAudience] = useStateMsg({
    type: audienceType || 'utenti', // 'locali' | 'utenti'
    presetIds,
    fasciaEta: 'all',
    sesso: 'all',
    regione: 'all',
    utilizzo: 'all',
    stato: 'all',
    piano: 'all',
  });

  if (!open) return null;

  const recipients = audience.type === 'utenti'
    ? UTENTI.filter(u =>
        (audience.presetIds.length === 0 || audience.presetIds.includes(u.id)) &&
        (audience.sesso==='all' || u.sesso===audience.sesso) &&
        (audience.regione==='all' || u.regione===audience.regione) &&
        (audience.utilizzo==='all' || u.utilizzo===audience.utilizzo)
      )
    : LOCALI.filter(l =>
        (audience.presetIds.length === 0 || audience.presetIds.includes(l.id)) &&
        (audience.stato==='all' || l.stato===audience.stato) &&
        (audience.piano==='all' || l.piano===audience.piano) &&
        (audience.regione==='all' || l.regione===audience.regione)
      );
  const total = audience.type === 'utenti' ? recipients.length * 312 : recipients.length;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:60,
      background:'rgba(15,17,21,0.55)',
      display:'grid', placeItems:'center', padding:24,
      animation:'fadeIn 0.15s ease',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'min(1080px, 100%)',
        maxHeight: '92vh',
        background:'#fff',
        borderRadius:14,
        boxShadow:'0 20px 60px rgba(0,0,0,0.25)',
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:36, height:36, borderRadius:9, background:ADM.PINK_BG_SOFT, color:ADM.PINK, display:'grid', placeItems:'center'}}>
            <BuIcons.megaphone size={22}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16.2, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Invia messaggio</div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:2}}>
              Step {step} di 3 · {step===1 ? 'Destinatari' : step===2 ? 'Contenuto & canali' : 'Riepilogo & invio'}
            </div>
          </div>
          <AdmIconBtn icon="x" onClick={onClose}/>
        </div>

        <div style={{flex:1, overflow:'auto', display:'grid', gridTemplateColumns:'1fr 360px'}}>
          {/* Main */}
          <div style={{padding:'22px 26px', borderRight:`1px solid ${ADM.BORDER}`}}>
            {step === 1 && (
              <>
                <SectionTitle>Tipo di destinatario</SectionTitle>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:22}}>
                  <AudienceCard
                    icon="users" label="Utenti app"
                    desc="Clienti che usano l'app per ordinare e prenotare"
                    selected={audience.type==='utenti'}
                    onClick={()=>setAudience({...audience, type:'utenti', presetIds:[]})}
                  />
                  <AudienceCard
                    icon="store" label="Locali"
                    desc="Ristoranti / titolari sul gestionale"
                    selected={audience.type==='locali'}
                    onClick={()=>setAudience({...audience, type:'locali', presetIds:[]})}
                  />
                </div>

                {audience.presetIds.length > 0 && (
                  <div style={{padding:'12px 14px', background:ADM.INFO_SOFT, border:`1px solid #BFDBFE`, borderRadius:8, marginBottom:18, fontSize:14, color:'#1E40AF', display:'flex', alignItems:'center', gap:8}}>
                    <BuIcons.filter size={18}/>
                    Stai partendo da un <strong>filtro pre-selezionato</strong> di {audience.presetIds.length} {audience.type}. Puoi affinare ulteriormente sotto.
                    <button onClick={()=>setAudience({...audience, presetIds:[]})} style={{marginLeft:'auto', background:'none', border:'none', color:ADM.INFO, fontSize:13.7, fontWeight:600, cursor:'pointer', textDecoration:'underline'}}>Rimuovi</button>
                  </div>
                )}

                <SectionTitle>Affina con filtri</SectionTitle>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:22}}>
                  <FormField label="Regione">
                    <FilterDropdown label="" value={audience.regione} onChange={v=>setAudience({...audience, regione:v})} options={[{value:'all',label:'Tutte le regioni'},...REGIONI.map(r=>({value:r,label:r}))]}/>
                  </FormField>
                  {audience.type === 'utenti' ? (
                    <>
                      <FormField label="Sesso">
                        <FilterDropdown label="" value={audience.sesso} onChange={v=>setAudience({...audience, sesso:v})} options={[{value:'all',label:'Indifferente'},{value:'F',label:'Donne'},{value:'M',label:'Uomini'}]}/>
                      </FormField>
                      <FormField label="Utilizzo app">
                        <FilterDropdown label="" value={audience.utilizzo} onChange={v=>setAudience({...audience, utilizzo:v})} options={[
                          {value:'all',         label:'Qualsiasi'},
                          {value:'estr_attivo', label:'Estremamente attivo (>1/sett.)'},
                          {value:'molto_att',   label:'Molto attivo (>1/mese)'},
                          {value:'attivo',      label:'Attivo (1/mese)'},
                          {value:'distratto',   label:'Distratto (no uso ult. settimana)'},
                          {value:'non_attivo',  label:'Non attivo (no uso ult. mese)'},
                          {value:'perso',       label:'Perso (no uso 2 mesi)'},
                        ]}/>
                      </FormField>
                      <FormField label="Fascia d'età">
                        <FilterDropdown label="" value={audience.fasciaEta} onChange={v=>setAudience({...audience, fasciaEta:v})} options={[{value:'all',label:'Tutte le età'},{value:'18-25',label:'18-25'},{value:'26-35',label:'26-35'},{value:'36-45',label:'36-45'},{value:'46-60',label:'46-60'},{value:'61-99',label:'60+'}]}/>
                      </FormField>
                    </>
                  ) : (
                    <>
                      <FormField label="Stato locale">
                        <FilterDropdown label="" value={audience.stato} onChange={v=>setAudience({...audience, stato:v})} options={[{value:'all',label:'Tutti'},{value:'active',label:'Attivi'},{value:'onboarding',label:'In onboarding'},{value:'inactive',label:'Inattivi'},{value:'churned',label:'Disdetti'}]}/>
                      </FormField>
                      <FormField label="Piano">
                        <FilterDropdown label="" value={audience.piano} onChange={v=>setAudience({...audience, piano:v})} options={[{value:'all',label:'Tutti i piani'},...PIANI.map(p=>({value:p.id,label:p.label}))]}/>
                      </FormField>
                    </>
                  )}
                </div>

                <div style={{padding:'16px 18px', background:`linear-gradient(135deg, ${ADM.PINK_BG_SOFT}, #fff)`, border:`1px solid ${ADM.BORDER}`, borderRadius:10}}>
                  <div style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4}}>Destinatari stimati</div>
                  <div style={{fontSize:28.1, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', display:'flex', alignItems:'baseline', gap:8}}>
                    {fmtNum(total)}
                    <span style={{fontSize:14.4, fontWeight:500, color:ADM.MUTED}}>{audience.type === 'utenti' ? 'utenti' : 'locali'}</span>
                  </div>
                  <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:4}}>
                    {audience.type === 'utenti' && total > 0 && `Su ${fmtNum(UTENTI.length * 312)} totali — ${Math.round(total/(UTENTI.length*312)*100)}% della base`}
                    {audience.type === 'locali' && total > 0 && `Su ${LOCALI.length} totali`}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <SectionTitle>Canali</SectionTitle>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:22}}>
                  <ChannelToggle icon="bell" label="Push notification" desc={audience.type==='utenti' ? 'App utente' : 'App gestionale'} active={channels.push} onClick={()=>setChannels({...channels, push:!channels.push})}/>
                  <ChannelToggle icon="mail" label="Email" desc="Newsletter / transazionale" active={channels.email} onClick={()=>setChannels({...channels, email:!channels.email})}/>
                  <ChannelToggle icon="phone" label="In-app banner" desc="Mostrato nella home" active={channels.in_app} onClick={()=>setChannels({...channels, in_app:!channels.in_app})}/>
                  <ChannelToggle icon="chat" label="SMS" desc="A pagamento · €0.04/sms" active={channels.sms} onClick={()=>setChannels({...channels, sms:!channels.sms})}/>
                </div>

                <SectionTitle>Contenuto</SectionTitle>
                <FormField label="Titolo" hint={`${title.length}/60`}>
                  <input value={title} onChange={e=>setTitle(e.target.value.slice(0,60))} placeholder="Es. Aggiornamento importante del gestionale" style={inputStyle}/>
                </FormField>
                <FormField label="Messaggio" hint={`${body.length}/500`}>
                  <textarea value={body} onChange={e=>setBody(e.target.value.slice(0,500))} placeholder="Scrivi il contenuto. Puoi usare {{nome}} per personalizzare." style={{...inputStyle, minHeight:120, resize:'vertical'}}/>
                </FormField>
                <FormField label="Call to action (opzionale)" hint="Lasciare vuoto per nessun bottone">
                  <input value={cta} onChange={e=>setCta(e.target.value)} placeholder='Es. "Vedi i dettagli" → /aggiornamenti' style={inputStyle}/>
                </FormField>

                <SectionTitle>Pianificazione</SectionTitle>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                  <ScheduleCard icon="send" label="Invia ora" desc="Consegnato entro 2 minuti" active={schedule==='now'} onClick={()=>setSchedule('now')}/>
                  <ScheduleCard icon="clock" label="Pianifica" desc="Imposta data e ora" active={schedule==='later'} onClick={()=>setSchedule('later')}/>
                </div>
                {schedule === 'later' && (
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}>
                    <FormField label="Data"><input type="date" defaultValue="2025-11-22" style={inputStyle}/></FormField>
                    <FormField label="Ora"><input type="time" defaultValue="10:00" style={inputStyle}/></FormField>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <SectionTitle>Riepilogo prima dell'invio</SectionTitle>
                <AdmCard padding={18}>
                  <ReviewRow label="Destinatari" value={`${fmtNum(total)} ${audience.type === 'utenti' ? 'utenti' : 'locali'}`}/>
                  <ReviewRow label="Filtri attivi" value={[
                    audience.regione !== 'all' && `Regione: ${audience.regione}`,
                    audience.sesso !== 'all' && `Sesso: ${audience.sesso}`,
                    audience.utilizzo !== 'all' && `Utilizzo: ${(window.UTILIZZO_CLUSTER && window.UTILIZZO_CLUSTER[audience.utilizzo]?.label) || audience.utilizzo}`,
                    audience.stato !== 'all' && `Stato: ${audience.stato}`,
                    audience.piano !== 'all' && `Piano: ${audience.piano}`,
                  ].filter(Boolean).join(' · ') || 'Nessuno (tutti)'}/>
                  <ReviewRow label="Canali" value={Object.entries(channels).filter(([_,v])=>v).map(([k])=>({push:'Push',email:'Email',in_app:'In-app',sms:'SMS'})[k]).join(', ') || 'Nessuno'}/>
                  <ReviewRow label="Quando" value={schedule==='now' ? 'Invio immediato' : '22 nov 2025, 10:00'}/>
                  <ReviewRow label="Costo stimato" value={channels.sms ? fmtEur(total * 0.04) : 'Gratuito'} last/>
                </AdmCard>

                {channels.sms && (
                  <div style={{marginTop:14, padding:'12px 14px', background:ADM.WARN_SOFT, border:`1px solid #FCD34D`, borderRadius:8, fontSize:14, color:'#92400E', display:'flex', gap:10, alignItems:'flex-start'}}>
                    <BuIcons.alertTriangle size={19} color={ADM.WARN}/>
                    <div>L'invio SMS comporta un costo di <strong>{fmtEur(total * 0.04)}</strong> ({fmtEur(0.04)} × {fmtNum(total)} SMS). Verrà addebitato sul wallet aziendale.</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Preview */}
          <div style={{padding:'22px 22px', background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:12}}>
            <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>Anteprima</div>
            <PhonePreview channels={channels} title={title} body={body} cta={cta} audience={audience}/>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:'14px 22px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:10, background:'#fff'}}>
          <div style={{fontSize:13.7, color:ADM.MUTED}}>Bozza salvata automaticamente</div>
          <div style={{flex:1}}/>
          {step > 1 && <AdmButton variant="ghost" size="sm" onClick={()=>setStep(step-1)}>Indietro</AdmButton>}
          <AdmButton variant="secondary" size="sm" onClick={onClose}>Annulla</AdmButton>
          {step < 3
            ? <AdmButton variant="primary" size="sm" icon="chevronRight" onClick={()=>setStep(step+1)}>Continua</AdmButton>
            : <AdmButton variant="primary" size="sm" icon="send" onClick={onClose}>{schedule==='now' ? `Invia a ${fmtNum(total)} destinatari` : 'Pianifica invio'}</AdmButton>}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'9px 12px',
  border:`1px solid ${ADM.BORDER}`, borderRadius:7,
  fontSize:14.4, fontFamily:'inherit', color:ADM.TEXT,
  outline:'none', boxSizing:'border-box',
};

function SectionTitle({ children }) {
  return <div style={{fontSize:13, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:11, marginTop:6}}>{children}</div>;
}

function FormField({ label, hint, children }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
        <label style={{fontSize:13.3, fontWeight:600, color:ADM.TEXT}}>{label}</label>
        {hint && <span style={{fontSize:13, color:ADM.MUTED_SOFT}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function AudienceCard({ icon, label, desc, selected, onClick }) {
  const Icon = BuIcons[icon];
  return (
    <button onClick={onClick} style={{
      padding:'14px 16px', textAlign:'left',
      background: selected ? ADM.PINK_BG_SOFT : '#fff',
      border: `2px solid ${selected ? ADM.PINK : ADM.BORDER}`,
      borderRadius:10, cursor:'pointer', fontFamily:'inherit',
      display:'flex', gap:12, alignItems:'flex-start',
    }}>
      <div style={{width:34, height:34, borderRadius:8, background: selected ? ADM.PINK : '#F0F1F3', color: selected ? '#fff' : ADM.MUTED, display:'grid', placeItems:'center', flexShrink:0}}>
        <Icon size={20}/>
      </div>
      <div>
        <div style={{fontSize:14.8, fontWeight:600, color:ADM.TEXT}}>{label}</div>
        <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2, lineHeight:1.4}}>{desc}</div>
      </div>
    </button>
  );
}

function ChannelToggle({ icon, label, desc, active, onClick }) {
  const Icon = BuIcons[icon];
  return (
    <button onClick={onClick} style={{
      padding:'12px 14px', textAlign:'left',
      background: active ? '#fff' : ADM.PANEL_SOFT,
      border:`1.5px solid ${active ? ADM.PINK : ADM.BORDER}`,
      borderRadius:10, cursor:'pointer', fontFamily:'inherit',
      display:'flex', alignItems:'center', gap:11,
    }}>
      <div style={{width:30, height:30, borderRadius:7, background: active ? ADM.PINK_BG_SOFT : '#fff', color: active ? ADM.PINK : ADM.MUTED, display:'grid', placeItems:'center', flexShrink:0}}>
        <Icon size={19}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>{label}</div>
        <div style={{fontSize:13, color:ADM.MUTED, marginTop:1}}>{desc}</div>
      </div>
      <div style={{
        width:18, height:18, borderRadius:5,
        background: active ? ADM.PINK : '#fff',
        border: `1.5px solid ${active ? ADM.PINK : ADM.BORDER}`,
        display:'grid', placeItems:'center', color:'#fff',
      }}>{active && <BuIcons.check size={16}/>}</div>
    </button>
  );
}

function ScheduleCard({ icon, label, desc, active, onClick }) {
  const Icon = BuIcons[icon];
  return (
    <button onClick={onClick} style={{
      padding:'12px 14px', textAlign:'left',
      background: active ? ADM.PINK_BG_SOFT : '#fff',
      border:`1.5px solid ${active ? ADM.PINK : ADM.BORDER}`,
      borderRadius:10, cursor:'pointer', fontFamily:'inherit',
      display:'flex', alignItems:'center', gap:10,
    }}>
      <Icon size={20} color={active ? ADM.PINK : ADM.MUTED}/>
      <div>
        <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>{label}</div>
        <div style={{fontSize:13, color:ADM.MUTED, marginTop:1}}>{desc}</div>
      </div>
    </button>
  );
}

function ReviewRow({ label, value, last }) {
  return (
    <div style={{display:'flex', padding:'10px 0', borderBottom: last ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
      <div style={{width:140, fontSize:13.7, color:ADM.MUTED, fontWeight:500}}>{label}</div>
      <div style={{flex:1, fontSize:14, color:ADM.TEXT, fontWeight:500}}>{value}</div>
    </div>
  );
}

function PhonePreview({ channels, title, body, cta, audience }) {
  const sampleName = audience.type === 'utenti' ? 'Marta' : 'Trattoria del Borgo';
  const renderedTitle = (title || 'Titolo del messaggio').replace(/\{\{nome\}\}/g, sampleName);
  const renderedBody = (body || 'Il contenuto del messaggio apparirà qui. Puoi vedere come si vedrà su ogni canale che hai attivato.').replace(/\{\{nome\}\}/g, sampleName);

  return (
    <>
      {channels.push && (
        <PreviewCard kind="push">
          <div style={{
            background:'#fff', borderRadius:12, padding:'10px 12px',
            boxShadow:'0 2px 12px rgba(0,0,0,0.08)',
            display:'flex', gap:10,
          }}>
            <div style={{width:30, height:30, borderRadius:7, background:ADM.PINK, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}>
              <BuIcons.utensils size={19}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'#666', marginBottom:2}}>
                <span style={{fontWeight:600}}>{audience.type==='utenti' ? 'BYUP' : 'BYUP SPOT'}</span>
                <span>ora</span>
              </div>
              <div style={{fontSize:13.3, fontWeight:700, color:'#000', lineHeight:1.3}}>{renderedTitle}</div>
              <div style={{fontSize:12.6, color:'#444', marginTop:2, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{renderedBody}</div>
            </div>
          </div>
        </PreviewCard>
      )}
      {channels.email && (
        <PreviewCard kind="email">
          <div style={{background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:8, overflow:'hidden'}}>
            <div style={{padding:'10px 14px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, fontSize:12.2, color:ADM.MUTED}}>
              <div><strong>Da:</strong> byup &lt;hello@byup.it&gt;</div>
              <div style={{marginTop:2}}><strong>Oggetto:</strong> {renderedTitle}</div>
            </div>
            <div style={{padding:'16px', fontSize:13.3, color:ADM.TEXT, lineHeight:1.5}}>
              <div style={{fontSize:14.4, fontWeight:700, marginBottom:8}}>Ciao {sampleName},</div>
              <div>{renderedBody}</div>
              {cta && (
                <div style={{marginTop:14}}>
                  <button style={{padding:'8px 14px', background:ADM.PINK, color:'#fff', border:'none', borderRadius:7, fontSize:13, fontWeight:600}}>{cta.split('→')[0].trim() || 'Vedi di più'}</button>
                </div>
              )}
            </div>
          </div>
        </PreviewCard>
      )}
      {channels.in_app && (
        <PreviewCard kind="in_app">
          <div style={{
            background:`linear-gradient(135deg, ${ADM.PINK}, ${ADM.PINK_DARK})`,
            color:'#fff', padding:'14px 16px', borderRadius:10, position:'relative',
          }}>
            <div style={{fontSize:11.5, fontWeight:700, opacity:0.8, textTransform:'uppercase', letterSpacing:'0.06em'}}>Novità</div>
            <div style={{fontSize:14.4, fontWeight:700, marginTop:4, lineHeight:1.3}}>{renderedTitle}</div>
            <div style={{fontSize:13, marginTop:4, opacity:0.92, lineHeight:1.4}}>{renderedBody.slice(0,120)}{renderedBody.length>120?'…':''}</div>
            {cta && <div style={{marginTop:8, fontSize:13, fontWeight:600, textDecoration:'underline'}}>{cta.split('→')[0].trim() || 'Scopri'} →</div>}
          </div>
        </PreviewCard>
      )}
      {channels.sms && (
        <PreviewCard kind="sms">
          <div style={{background:'#E5F0FF', padding:'10px 12px', borderRadius:12, borderTopLeftRadius:4, fontSize:13.3, color:'#000', lineHeight:1.4}}>
            <strong>byup:</strong> {renderedBody.slice(0,140)}{renderedBody.length>140?'…':''}
          </div>
        </PreviewCard>
      )}
      {!channels.push && !channels.email && !channels.in_app && !channels.sms && (
        <div style={{padding:'40px 20px', textAlign:'center', color:ADM.MUTED_SOFT, fontSize:13.7}}>
          Seleziona almeno un canale per vedere l'anteprima.
        </div>
      )}
    </>
  );
}

function PreviewCard({ kind, children }) {
  const labels = { push: 'Push notification', email: 'Email', in_app: 'In-app banner', sms: 'SMS' };
  return (
    <div>
      <div style={{fontSize:12.2, color:ADM.MUTED_SOFT, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6}}>{labels[kind]}</div>
      {children}
    </div>
  );
}

window.MessageModal = MessageModal;
