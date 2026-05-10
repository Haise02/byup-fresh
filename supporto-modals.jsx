// Modali del Supporto: chat widget, email form, scheduler chiamata, tutorial player

// ─── Chat widget ───────────────────────────────────
function SupChatWidget({ open, onClose }) {
  const [messages, setMessages] = React.useState([
    { from:'bot', text:'Ciao! Sono l\'assistente virtuale di byup. Come posso aiutarti oggi?', time:'11:46' },
  ]);
  const [input, setInput] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setMessages(m => [...m, { from:'user', text, time: t }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const lower = text.toLowerCase();
      let reply = 'Capisco, lascia che cerchi una guida che possa aiutarti. Se non trovo una risposta passerò la conversazione a un operatore umano.';
      if (lower.includes('pagament') || lower.includes('stripe')) reply = 'Per i pagamenti vai in Account → Pagamenti e fatturazione. Da lì colleghi Stripe Connect. Le commissioni sono 1,5% (Premium) + Stripe (1,5% + 0,25€). Vuoi che ti apra la guida?';
      else if (lower.includes('menu') || lower.includes('menù') || lower.includes('piatti')) reply = 'Per gestire il menù vai in Cucina → Menù. Puoi aggiungere, modificare o disattivare piatti in tempo reale. Le modifiche sono visibili in vetrina entro 30 secondi.';
      else if (lower.includes('staff') || lower.includes('camerieri') || lower.includes('cuoco')) reply = 'Aggiungi membri dello staff in Account → Staff → Invita membro. Scegli il ruolo (Admin, Cuoco, Cameriere, Sola lettura) e ti invierò l\'invito via email.';
      else if (lower.includes('prenot')) reply = 'Le prenotazioni le gestisci in Sala & Prenotazioni → Calendario. byup invia automaticamente i promemoria al cliente 24h e 2h prima.';
      else if (lower.includes('grazie') || lower.includes('ok')) reply = 'Felice di averti aiutato! Se hai altre domande sono qui.';
      setMessages(m => [...m, { from:'bot', text: reply, time: t }]);
    }, 1100);
  };

  if (!open) return null;
  return (
    <div style={{
      position:'absolute', right: 24, bottom: 24,
      width: 360, height: 480,
      background: PN.WHITE,
      borderRadius: 14,
      boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
      display:'flex', flexDirection:'column',
      overflow:'hidden',
      zIndex: 60,
      fontFamily:'inherit',
    }}>
      {/* Header */}
      <div style={{
        background: PN.PINK,
        color:'#fff',
        padding:'14px 16px',
        display:'flex', alignItems:'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius:'50%',
          background:'rgba(255,255,255,0.18)',
          display:'grid', placeItems:'center',
        }}><BuIcons.chat size={15} color="#fff"/></div>
        <div style={{flex:1}}>
          <div style={{fontSize: 13, fontWeight: 700}}>Assistente byup</div>
          <div style={{fontSize: 11, opacity: 0.85}}>Sempre disponibile</div>
        </div>
        <button onClick={onClose} aria-label="Chiudi" style={{
          background:'transparent', border:'none', color:'#fff',
          cursor:'pointer', padding: 4, lineHeight: 0, display:'grid', placeItems:'center',
        }}><BuIcons.x size={18} color="#fff"/></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="pn-scroll" style={{flex: 1, overflowY:'auto', padding: 14, background:'#fafafa'}}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display:'flex',
            justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 10,
          }}>
            <div style={{
              maxWidth: '78%',
              background: m.from === 'user' ? PN.PINK : '#fff',
              color: m.from === 'user' ? '#fff' : PN.TEXT,
              padding: '8px 12px',
              borderRadius: 12,
              fontSize: 12.5, lineHeight: 1.45,
              border: m.from === 'user' ? 'none' : `1px solid ${PN.BORDER}`,
            }}>
              {m.text}
              <div style={{
                fontSize: 10, opacity: 0.7, marginTop: 3,
                color: m.from === 'user' ? 'rgba(255,255,255,0.85)' : PN.MUTED,
              }}>{m.time}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{display:'flex', justifyContent:'flex-start', marginBottom: 10}}>
            <div style={{background:'#fff', border:`1px solid ${PN.BORDER}`, padding:'10px 14px', borderRadius: 12, fontSize: 12, color: PN.MUTED}}>
              <span style={{display:'inline-block', animation:'sup-blink 1.2s infinite'}}>●</span>
              <span style={{display:'inline-block', animation:'sup-blink 1.2s infinite 0.2s', marginLeft: 3}}>●</span>
              <span style={{display:'inline-block', animation:'sup-blink 1.2s infinite 0.4s', marginLeft: 3}}>●</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{
        display:'flex', gap: 8,
        padding: '8px 12px',
        background:'#fafafa',
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
      }}>
        <button style={{
          flex: 1, padding: '6px 10px',
          background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
          borderRadius: 8, fontSize: 11, fontWeight: 600,
          color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
        }}><BuIcons.user size={13}/> Operatore</button>
        <button style={{
          flex: 1, padding: '6px 10px',
          background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
          borderRadius: 8, fontSize: 11, fontWeight: 600,
          color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
        }}><BuIcons.phone size={13}/> Richiamami</button>
      </div>

      {/* Input */}
      <div style={{
        display:'flex', gap: 8, padding: 12,
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
        background: PN.WHITE,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Scrivi un messaggio…"
          style={{
            flex: 1, border:`1px solid ${PN.BORDER}`, outline:'none',
            borderRadius: 999, padding:'8px 14px',
            fontSize: 12.5, fontFamily:'inherit',
          }}
        />
        <button onClick={send} aria-label="Invia" style={{
          width: 36, height: 36, borderRadius:'50%',
          background: PN.PINK, color:'#fff', border:'none',
          cursor:'pointer',
          display:'grid', placeItems:'center',
        }}><BuIcons.send size={14} color="#fff"/></button>
      </div>
    </div>
  );
}

// ─── Email modal ───────────────────────────────────
function SupEmailModal({ open, onClose }) {
  const [subject, setSubject] = React.useState('');
  const [category, setCategory] = React.useState('tecnico');
  const [body, setBody] = React.useState('');
  const [sent, setSent] = React.useState(false);

  if (!open) return null;
  const send = () => {
    if (!subject.trim() || !body.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setSubject(''); setBody(''); onClose(); }, 1800);
  };
  return (
    <SupBackdrop onClose={onClose}>
      <div style={{
        background: PN.WHITE, borderRadius: 16, width: 540,
        boxShadow:'0 24px 60px rgba(0,0,0,0.18)', overflow:'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Contatta il supporto via email</div>
            <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>Risposta entro 4 ore lavorative</div>
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={{background:'transparent', border:'none', cursor:'pointer', padding: 4, display:'grid', placeItems:'center'}}><BuIcons.x size={18} color={PN.MUTED}/></button>
        </div>

        {sent ? (
          <div style={{padding: 40, textAlign:'center'}}>
            <div style={{width: 56, height: 56, borderRadius:'50%', background: PN.GREEN_SOFT, color: PN.GREEN, display:'inline-grid', placeItems:'center', marginBottom: 14}}><BuIcons.mail size={26}/></div>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>Richiesta inviata!</div>
            <div style={{fontSize: 12.5, color: PN.MUTED}}>Riceverai una risposta su <strong>admin@esempio.com</strong> entro 4 ore.</div>
          </div>
        ) : (
          <div style={{padding: 20}}>
            <SupField label="Categoria">
              <select value={category} onChange={e => setCategory(e.target.value)} style={{
                width:'100%', padding:'9px 12px',
                border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                fontSize: 13, fontFamily:'inherit', outline:'none',
                background: PN.WHITE,
              }}>
                <option value="tecnico">Problema tecnico</option>
                <option value="pagamenti">Pagamenti e fatturazione</option>
                <option value="account">Account e sicurezza</option>
                <option value="menu">Menù e ordini</option>
                <option value="commerciale">Vendite / Commerciale</option>
                <option value="altro">Altro</option>
              </select>
            </SupField>
            <SupField label="Oggetto">
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Es. Errore al pagamento con Stripe"
                style={{width:'100%', padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, fontSize: 13, fontFamily:'inherit', outline:'none'}}/>
            </SupField>
            <SupField label="Descrivi il problema">
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="Includi dettagli utili: orario, dispositivo, passi per riprodurre…"
                style={{width:'100%', padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, fontSize: 13, fontFamily:'inherit', outline:'none', resize:'vertical'}}/>
            </SupField>
            <div style={{display:'flex', alignItems:'center', gap: 6, fontSize: 11.5, color: PN.MUTED, marginBottom: 16}}>
              <BuIcons.paperclip size={13}/> Trascina qui i file per allegarli (max 10 MB)
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap: 8}}>
              <button onClick={onClose} style={{padding:'9px 16px', background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
              <button onClick={send} disabled={!subject.trim() || !body.trim()} style={{
                padding:'9px 18px',
                background: (!subject.trim() || !body.trim()) ? '#f0a8c0' : PN.PINK,
                color:'#fff', border:'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700, fontFamily:'inherit',
                cursor: (!subject.trim() || !body.trim()) ? 'not-allowed' : 'pointer',
              }}>Invia richiesta</button>
            </div>
          </div>
        )}
      </div>
    </SupBackdrop>
  );
}

// ─── Scheduler chiamata ───────────────────────────
function SupCallScheduler({ open, onClose }) {
  const [phone, setPhone] = React.useState('');
  const [when, setWhen] = React.useState('30min');
  const [topic, setTopic] = React.useState('');
  const [sent, setSent] = React.useState(false);

  if (!open) return null;
  const submit = () => {
    if (!phone.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setPhone(''); setTopic(''); onClose(); }, 1800);
  };
  const slots = [
    { id:'30min', label:'Entro 30 min', desc:'Operatore disponibile ora' },
    { id:'2h', label:'Entro 2 ore', desc:'Quando ti è più comodo' },
    { id:'oggi', label:'Oggi pomeriggio', desc:'Tra le 14:00 e le 18:00' },
    { id:'domani', label:'Domani mattina', desc:'Tra le 9:00 e le 12:00' },
  ];

  return (
    <SupBackdrop onClose={onClose}>
      <div style={{background: PN.WHITE, borderRadius: 16, width: 480, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.18)'}} onClick={e => e.stopPropagation()}>
        <div style={{padding:'18px 20px', background: PN.PINK, color:'#fff'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap: 12}}>
              <div style={{width: 36, height: 36, borderRadius:'50%', background:'rgba(255,255,255,0.18)', display:'grid', placeItems:'center'}}><BuIcons.phone size={17} color="#fff"/></div>
              <div>
                <div style={{fontSize: 15, fontWeight: 700}}>Prenota una chiamata</div>
                <div style={{fontSize: 12, opacity: 0.9, marginTop: 2}}>Ti chiamiamo noi quando preferisci</div>
              </div>
            </div>
            <button onClick={onClose} aria-label="Chiudi" style={{background:'transparent', border:'none', cursor:'pointer', padding: 4, display:'grid', placeItems:'center'}}><BuIcons.x size={18} color="#fff"/></button>
          </div>
        </div>

        {sent ? (
          <div style={{padding: 36, textAlign:'center'}}>
            <div style={{width: 56, height: 56, borderRadius:'50%', background: PN.GREEN_SOFT, color: PN.GREEN, display:'inline-grid', placeItems:'center', marginBottom: 14}}><BuIcons.check size={28}/></div>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>Chiamata prenotata!</div>
            <div style={{fontSize: 12.5, color: PN.MUTED}}>Ti chiameremo al numero <strong>{phone}</strong> entro la fascia oraria scelta.</div>
          </div>
        ) : (
          <div style={{padding: 20}}>
            <SupField label="Numero di telefono">
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+39 333 1234567"
                style={{width:'100%', padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, fontSize: 13, fontFamily:'inherit', outline:'none'}}/>
            </SupField>
            <SupField label="Quando ti chiamiamo?">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
                {slots.map(s => (
                  <button key={s.id} onClick={() => setWhen(s.id)} style={{
                    padding: '10px 12px',
                    background: when === s.id ? PN.PINK_BG_SOFT : PN.WHITE,
                    border: `1px solid ${when === s.id ? PN.PINK : PN.BORDER}`,
                    borderRadius: 10, textAlign:'left',
                    cursor:'pointer', fontFamily:'inherit',
                  }}>
                    <div style={{fontSize: 13, fontWeight: 600, color: when === s.id ? PN.PINK_DARK : PN.TEXT}}>{s.label}</div>
                    <div style={{fontSize: 11, color: PN.MUTED, marginTop: 2}}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </SupField>
            <SupField label="Argomento (opzionale)">
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Es. Configurazione Stripe"
                style={{width:'100%', padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, fontSize: 13, fontFamily:'inherit', outline:'none'}}/>
            </SupField>
            <div style={{display:'flex', justifyContent:'flex-end', gap: 8, marginTop: 8}}>
              <button onClick={onClose} style={{padding:'9px 16px', background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
              <button onClick={submit} disabled={!phone.trim()} style={{
                padding:'9px 18px',
                background: !phone.trim() ? '#f0a8c0' : PN.PINK,
                color:'#fff', border:'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700, fontFamily:'inherit',
                cursor: !phone.trim() ? 'not-allowed' : 'pointer',
              }}>Conferma</button>
            </div>
          </div>
        )}
      </div>
    </SupBackdrop>
  );
}

// ─── Tutorial player ──────────────────────────────
function SupTutorialPlayer({ tutorial, onClose }) {
  if (!tutorial) return null;
  return (
    <SupBackdrop onClose={onClose}>
      <div style={{background: PN.WHITE, borderRadius: 16, width: 720, maxHeight: '88vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
        <div style={{padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div>
            <div style={{fontSize: 11, fontWeight: 600, color: PN.PINK, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 2}}>{tutorial.catTitle}</div>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>{tutorial.title}</div>
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={{background:'transparent', border:'none', cursor:'pointer', padding: 4, display:'grid', placeItems:'center'}}><BuIcons.x size={18} color={PN.MUTED}/></button>
        </div>

        {/* Video placeholder */}
        <div style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, #1f2937, #111827)',
          display:'grid', placeItems:'center', position:'relative',
        }}>
          <button aria-label="Riproduci" style={{
            width: 64, height: 64, borderRadius:'50%',
            background:'rgba(255,255,255,0.95)',
            border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
            color: PN.TEXT, paddingLeft: 4,
            boxShadow:'0 8px 24px rgba(0,0,0,0.3)',
          }}><BuIcons.play size={26} color={PN.TEXT}/></button>
          <div style={{position:'absolute', bottom: 12, left: 16, right: 16, display:'flex', alignItems:'center', gap: 10}}>
            <div style={{flex: 1, height: 3, background:'rgba(255,255,255,0.3)', borderRadius: 2, overflow:'hidden'}}>
              <div style={{width: '12%', height:'100%', background: PN.PINK}}/>
            </div>
            <div style={{fontSize: 11, color:'rgba(255,255,255,0.85)', fontWeight: 600}}>0:00 / {tutorial.mins}:00</div>
          </div>
        </div>

        {/* Body */}
        <div className="pn-scroll" style={{flex: 1, overflowY:'auto', padding: '18px 22px 22px'}}>
          <div style={{display:'flex', alignItems:'center', gap: 16, marginBottom: 16, fontSize: 12, color: PN.MUTED}}>
            <span style={{display:'inline-flex', alignItems:'center', gap: 5}}><BuIcons.monitor size={13}/> {tutorial.mins} min video</span>
            <span style={{display:'inline-flex', alignItems:'center', gap: 5}}><BuIcons.doc size={13}/> {tutorial.read} min lettura</span>
            <span style={{display:'inline-flex', alignItems:'center', gap: 5}}><BuIcons.eye size={13}/> 1.2k visualizzazioni</span>
          </div>

          <p style={{fontSize: 13, lineHeight: 1.6, color: PN.TEXT, margin:'0 0 14px'}}>{tutorial.desc}</p>

          <h3 style={{fontSize: 13, fontWeight: 700, color: PN.TEXT, margin:'18px 0 8px'}}>In questa guida</h3>
          <ul style={{margin: 0, paddingLeft: 20, fontSize: 12.5, color: PN.MUTED, lineHeight: 1.7}}>
            <li>Introduzione e prerequisiti</li>
            <li>Configurazione passo passo</li>
            <li>Personalizzazioni avanzate</li>
            <li>Risoluzione problemi comuni</li>
            <li>Best practice consigliate</li>
          </ul>

          <div style={{
            marginTop: 20, padding: 14,
            background: PN.AMBER_SOFT, border:`1px solid ${PN.AMBER}33`,
            borderRadius: 10,
          }}>
            <div style={{fontSize: 12, fontWeight: 700, color: PN.AMBER, marginBottom: 4, display:'inline-flex', alignItems:'center', gap: 6}}><BuIcons.bulb size={13}/> Hai bisogno di aiuto?</div>
            <div style={{fontSize: 12, color: PN.AMBER, lineHeight: 1.5}}>
              Se questa guida non risolve il tuo problema, puoi contattare il supporto via chat o email — risposta entro 4 ore.
            </div>
          </div>
        </div>
      </div>
    </SupBackdrop>
  );
}

// ─── Helpers ───────────────────────────────────────
function SupBackdrop({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0,
      background:'rgba(15,23,42,0.42)',
      display:'grid', placeItems:'center',
      zIndex: 50,
      padding: 24,
    }}>{children}</div>
  );
}
function SupField({ label, children }) {
  return (
    <div style={{marginBottom: 14}}>
      <div style={{fontSize: 12, fontWeight: 600, color: PN.TEXT, marginBottom: 6}}>{label}</div>
      {children}
    </div>
  );
}

window.SupChatWidget = SupChatWidget;
window.SupEmailModal = SupEmailModal;
window.SupCallScheduler = SupCallScheduler;
window.SupTutorialPlayer = SupTutorialPlayer;
