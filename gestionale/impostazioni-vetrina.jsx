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
  const preview = <VetrinaMiniPreview tags={tags} social={social} categoria={categoria}
    focusSection={sub === 'profilo' ? 'info' : sub === 'aspetto' ? 'gallery' : 'faq'}/>;

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
  // Cibo: le categorie che gli utenti cercano nelle app food. Massimo 4,
  // stessa logica dell'atmosfera (chips brand + shake al superamento).
  const FOOD_TAGS = ['Pizza','Sushi','Pasta','Hamburger','Carne','Pesce','Poke','Ramen',
    'Vegano','Vegetariano','Senza glutine','Dolci','Gelato','Brunch','Aperitivo',
    'Cinese','Indiano','Messicano','Kebab','Frittura'];
  const [foodTags, setFoodTags] = React.useState(['Pasta']);
  const [foodLimitHit, setFoodLimitHit] = React.useState(false);
  const toggleFood = (t) => {
    if (foodTags.includes(t)) { setFoodTags(f => f.filter(x => x !== t)); onChange && onChange(); return; }
    if (foodTags.length >= 4) {
      setFoodLimitHit(true);
      clearTimeout(toggleFood._t);
      toggleFood._t = setTimeout(() => setFoodLimitHit(false), 1500);
      return;
    }
    setFoodTags(f => [...f, t]);
    onChange && onChange();
  };
  // Popup certificazioni: null | {mode:'new'} | {mode:'rifiutata', name, reason}
  const [certModal, setCertModal] = React.useState(null);
  // Sedi collegate: attiva | attesa (in attesa di conferma del proprietario).
  const [sedi, setSedi] = React.useState([
    { name: 'Sede principale', addr: 'Via Roma 13, Roma', status: 'attiva',
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=70&auto=format&fit=crop' },
    { name: 'Sede Parioli', addr: 'Viale Parioli 23, Roma', status: 'attesa',
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=70&auto=format&fit=crop' },
  ]);
  const [sedeModal, setSedeModal] = React.useState(false);
  // Conferma prima di rimuovere una sede o annullare una richiesta.
  const [confirmSede, setConfirmSede] = React.useState(null);
  const addSede = (v) => {
    setSedi(s => [...s, { name: v.name, addr: v.addr, status: 'attesa', photo: v.photo }]);
    onChange && onChange();
  };
  const removeSede = (name) => setSedi(s => s.filter(x => x.name !== name));
  // Orari: standard per tutti i giorni aperti + personalizzazioni per giorno
  // (turni multipli) configurate dal popup "Personalizza orari".
  const [stdHours, setStdHours] = React.useState(['09:00', '23:00']);
  const [customHours, setCustomHours] = React.useState(null); // null | {Lun: [['12:00','15:00'], …], …}
  const [hoursModal, setHoursModal] = React.useState(false);
  const fmtH = (h) => (h || '').replace(':00', '');
  const dayLabel = (d) => {
    const turns = customHours && customHours[d];
    if (!turns || !turns.length) return `${fmtH(stdHours[0])}–${fmtH(stdHours[1])}`;
    if (turns.length > 1) return `${turns.length} turni`;
    return `${fmtH(turns[0][0])}–${fmtH(turns[0][1])}`;
  };

  return (
    <div>
      <ImpCard title="Locale" sub="Dettagli utili che i clienti vedono sulla vetrina del tuo locale">
        {/* Due colonne: campi a sinistra, servizi e accessibilità a destra —
            la card resta compatta invece di allungarsi in verticale. */}
        <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 18, alignItems: 'start'}}>
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

          {/* Servizi e accessibilità: pannello distinto (fondo tenue + bordo)
              — la separazione dalle colonne dei campi è una zona, non una
              hairline che si perdeva. */}
          <div style={{
            minWidth: 0, background: '#F3F5F7',
            border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 12,
            padding: '14px 16px',
          }}>
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

      <ImpCard title="Orari di apertura" sub="Scegli i giorni e un orario standard. I clienti vedranno questi orari sulla vetrina">
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
                transition: 'border-color 150ms ease, background 150ms ease',
              }}>
                <div style={{fontSize:13, fontWeight:700, color: open ? PN.PINK_DARK : PN.MUTED, marginBottom: 4}}>{d}</div>
                <div style={{fontSize:12.5, color: open ? PN.TEXT : PN.MUTED, fontWeight: 600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                  {open ? dayLabel(d) : 'Chiuso'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Orario standard + accesso alla personalizzazione per giorno */}
        <div style={{
          display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap',
          padding: '10px 12px', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
          background: '#FAFBFC',
        }}>
          <span style={{fontSize:14, fontWeight:700}}>Orario standard</span>
          <span style={{fontSize:13, color:PN.MUTED}}>per tutti i giorni aperti</span>
          <span style={{flex:1}}/>
          <ImpButton variant="primary" onClick={() => setHoursModal(true)} style={{padding:'7px 13px', fontSize: 13.5, marginRight: 10}}>
            Personalizza orari
          </ImpButton>
          <ImpInput value={stdHours[0]} style={{width:74, padding:'7px 10px'}}
            onChange={e => { setStdHours([e.target.value, stdHours[1]]); onChange(); }}/>
          <span style={{color:PN.MUTED}}>—</span>
          <ImpInput value={stdHours[1]} style={{width:74, padding:'7px 10px'}}
            onChange={e => { setStdHours([stdHours[0], e.target.value]); onChange(); }}/>
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

        {/* Cibo: cosa si mangia da te — massimo 4 categorie */}
        <div style={{
          fontSize: 13.5, fontWeight: 600, margin: '16px 0 10px',
          color: foodLimitHit ? PN.PINK : PN.MUTED,
          animation: foodLimitHit ? 'tag-limit-shake 380ms ease' : 'none',
          transition: 'color 150ms ease',
        }}>
          Cibo · puoi selezionarne massimo 4
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap: 7}}>
          {FOOD_TAGS.map(t => {
            const on = foodTags.includes(t);
            return (
              <button key={t} onClick={() => toggleFood(t)} style={{
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

      <CollapsibleCard title="Sedi" sub="Le sedi collegate al tuo locale">
        {/* Card compatte + tile 'Aggiungi sede': l'azione vive nella griglia,
            niente CTA nel header. Rimuovi per le attive, Annulla per quelle
            in attesa; nessun Modifica. */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap: 10}}>
          {sedi.map(s => <SedeCard key={s.name} sede={s} onRemove={() => setConfirmSede(s)}/>)}
          <AddSedeTile onClick={() => setSedeModal(true)}/>
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
      {sedeModal && (
        <SedeSearchModal
          existing={sedi.map(s => s.name)}
          onClose={() => setSedeModal(false)}
          onAdd={(v) => { addSede(v); setSedeModal(false); }}/>
      )}
      {confirmSede && (
        <SedeConfirmModal
          sede={confirmSede}
          onClose={() => setConfirmSede(null)}
          onConfirm={() => { removeSede(confirmSede.name); setConfirmSede(null); }}/>
      )}
      {hoursModal && (
        <OrariCustomModal
          days={days.filter(d => openDays[d])}
          initial={customHours}
          std={stdHours}
          onClose={() => setHoursModal(false)}
          onSave={(sched) => { setCustomHours(sched); setHoursModal(false); onChange && onChange(); }}/>
      )}
    </div>
  );
}

// Popup "Personalizza orari": turni reali per giorno — aggiungi o rimuovi
// turni, poi salva la configurazione o annulla. Gli orari salvati sono
// quelli mostrati ai clienti sulla vetrina.
function OrariCustomModal({ days, initial, std, onClose, onSave }) {
  const [draft, setDraft] = React.useState(() => {
    const base = {};
    days.forEach(d => {
      base[d] = ((initial && initial[d]) ? initial[d] : [std]).map(t => [...t]);
    });
    return base;
  });
  const setTurn = (d, i, j, val) => setDraft(dr => ({
    ...dr,
    [d]: dr[d].map((t, k) => k === i ? t.map((v, l) => l === j ? val : v) : t),
  }));
  const addTurn = (d) => setDraft(dr => dr[d].length >= 3 ? dr : ({...dr, [d]: [...dr[d], ['19:00', '23:00']]}));
  const removeTurn = (d, i) => setDraft(dr => ({...dr, [d]: dr[d].filter((_, k) => k !== i)}));

  // Date speciali di chiusura: singole date o periodi (dal–al).
  const [specials, setSpecials] = React.useState([
    { id: 's1', from: '2026-12-25', to: '2026-12-30' },
  ]);
  const [addingDate, setAddingDate] = React.useState(false);
  const [newFrom, setNewFrom] = React.useState('');
  const [newTo, setNewTo] = React.useState('');
  const fmtDay = (iso) => {
    const d = new Date(`${iso}T00:00`);
    return isNaN(d) ? iso : d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).replace('.', '');
  };
  const fmtSpecial = (s) => {
    if (!s.to || s.to === s.from) return fmtDay(s.from);
    const sameMonth = s.from.slice(0, 7) === s.to.slice(0, 7);
    return sameMonth
      ? `${new Date(`${s.from}T00:00`).getDate()}–${fmtDay(s.to)}`
      : `${fmtDay(s.from)} – ${fmtDay(s.to)}`;
  };
  const addSpecial = () => {
    if (!newFrom) return;
    const to = newTo && newTo > newFrom ? newTo : null;
    setSpecials(sp => [...sp, { id: `s${Date.now()}`, from: newFrom, to }]);
    setNewFrom(''); setNewTo(''); setAddingDate(false);
  };
  const removeSpecial = (id) => setSpecials(sp => sp.filter(s => s.id !== id));

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(15, 17, 21, 0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cert-overlay-in 180ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 540, maxWidth: 'calc(100% - 48px)',
        background: PN.WHITE, borderRadius: 16,
        boxShadow: '0 30px 70px -20px rgba(15, 17, 21, 0.35)',
        padding: '20px 22px',
        animation: 'cert-modal-pop 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>Personalizza orari</div>
            <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>
              Turni per ogni giorno di apertura. I clienti li vedranno sulla vetrina.
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            border: 'none', background: '#F4F5F7', color: PN.TEXT,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}><PnI.X size={13}/></button>
        </div>

        <div className="pn-scroll" style={{maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, paddingRight: 4}}>
          {days.map(d => (
            <div key={d} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr', gap: 12, alignItems: 'start',
              padding: '10px 12px', border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
            }}>
              <span style={{fontSize: 14.5, fontWeight: 700, paddingTop: 7}}>{d}</span>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                {draft[d].map((t, i) => (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <span style={{fontSize: 12, color: PN.MUTED, fontWeight: 600, width: 46, flexShrink: 0}}>
                      {draft[d].length > 1 ? `Turno ${i + 1}` : 'Orario'}
                    </span>
                    <ImpInput value={t[0]} onChange={e => setTurn(d, i, 0, e.target.value)} style={{width: 72, padding: '6px 9px'}}/>
                    <span style={{color: PN.MUTED}}>—</span>
                    <ImpInput value={t[1]} onChange={e => setTurn(d, i, 1, e.target.value)} style={{width: 72, padding: '6px 9px'}}/>
                    {draft[d].length > 1 && (
                      <button onClick={() => removeTurn(d, i)} title="Rimuovi turno" style={{
                        width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                        border: 'none', background: '#F4F5F7', color: PN.RED,
                        cursor: 'pointer', display: 'grid', placeItems: 'center',
                      }}><PnI.X size={11}/></button>
                    )}
                  </div>
                ))}
                {draft[d].length < 3 && (
                  <button onClick={() => addTurn(d)} style={{
                    alignSelf: 'flex-start', background: 'transparent', border: 'none',
                    padding: '2px 0', color: PN.PINK, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>+ Aggiungi fascia oraria</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Date speciali: chiusure singole o per periodo, aggiunte da qui */}
        <div style={{marginBottom: 14, paddingTop: 12, borderTop: `1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{fontSize: 14, fontWeight: 700, marginBottom: 3}}>Date speciali</div>
          <div style={{fontSize: 12.5, color: PN.MUTED, marginBottom: 8}}>
            Giorni o periodi di chiusura straordinaria: sulla vetrina il locale risulterà chiuso.
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'stretch'}}>
            {specials.map(s => (
              <div key={s.id} style={{
                padding: '7px 8px 7px 12px', border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 9,
                fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, background: PN.WHITE,
              }}>
                <span><b>{fmtSpecial(s)}</b> · Chiuso</span>
                <SpecialDateX title="Elimina data speciale" onClick={() => removeSpecial(s.id)}/>
              </div>
            ))}
            {!addingDate && (
              <button onClick={() => setAddingDate(true)} style={{
                padding: '8px 14px', border: `1.5px dashed ${PN.BORDER}`, borderRadius: 9,
                background: 'transparent', color: PN.MUTED, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color 150ms ease, color 150ms ease, background 150ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = PN.PINK; e.currentTarget.style.color = PN.PINK_DARK; e.currentTarget.style.background = PN.PINK_SOFT; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.background = 'transparent'; }}
              >+ Aggiungi data</button>
            )}
          </div>
          {addingDate && (
            <div style={{
              marginTop: 8, padding: '10px 12px',
              border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 9, background: '#FAFBFC',
              display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap',
            }}>
              <div>
                <div style={{fontSize: 12, fontWeight: 600, color: PN.MUTED, marginBottom: 4}}>Dal</div>
                <ImpInput type="date" value={newFrom} onChange={e => setNewFrom(e.target.value)}
                  style={{width: 148, padding: '7px 10px', fontSize: 14}}/>
              </div>
              <div>
                <div style={{fontSize: 12, fontWeight: 600, color: PN.MUTED, marginBottom: 4}}>Al · facoltativo</div>
                <ImpInput type="date" value={newTo} min={newFrom || undefined} onChange={e => setNewTo(e.target.value)}
                  style={{width: 148, padding: '7px 10px', fontSize: 14}}/>
              </div>
              <span style={{flex: 1}}/>
              <ImpButton variant="ghost" style={{padding: '7px 12px', fontSize: 13.5}}
                onClick={() => { setAddingDate(false); setNewFrom(''); setNewTo(''); }}>Annulla</ImpButton>
              <ImpButton variant="primary" disabled={!newFrom} style={{padding: '7px 14px', fontSize: 13.5}}
                onClick={addSpecial}>Aggiungi</ImpButton>
            </div>
          )}
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
          <ImpButton variant="primary" onClick={() => onSave(draft)}>Salva configurazione</ImpButton>
        </div>
        <style>{`
          @keyframes cert-overlay-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
}

// La × delle date speciali: si accende di rosso in hover, si comprime al
// click e rimuove la chiusura.
function SpecialDateX({ onClick, title }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: 22, height: 22, borderRadius: 6, border: 'none', flexShrink: 0,
        background: hover ? PN.RED_SOFT : 'transparent',
        color: hover ? PN.RED : PN.MUTED,
        cursor: 'pointer', display: 'grid', placeItems: 'center',
        transform: pressed ? 'scale(0.82)' : hover ? 'scale(1.1)' : 'scale(1)',
        transition: 'background 130ms ease, color 130ms ease, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}>
      <PnI.X size={11}/>
    </button>
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
  cake:      (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 20.5v-6.3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6.3"/><path d="M3.5 20.5h17"/><path d="M5 16.2c1.2 1 2.2 1 3.4 0s2.4-1 3.6 0 2.4 1 3.6 0 2.2-1 3.4 0"/><path d="M8 12.2V10M12 12.2V10M16 12.2V10"/><path d="M8 7.6v.1M12 7.6v.1M16 7.6v.1"/></svg>,
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
    { label: 'Compleanni',           icon: 'cake',   desc: 'Torta, allestimento e festeggiati' },
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

// ─── Sedi: card compatta, tile aggiungi e popup di ricerca ──────────────────

function SedeCard({ sede, onRemove }) {
  const attesa = sede.status === 'attesa';
  return (
    /* Foto orizzontale in testa + ombra: la card si stacca dal fondo invece
       di confondersi nel bianco. */
    <div style={{
      border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 12,
      background: PN.WHITE, overflow: 'hidden',
      boxShadow: '0 4px 14px rgba(15, 17, 21, 0.08), 0 1px 3px rgba(15, 17, 21, 0.05)',
      display: 'flex', flexDirection: 'column', minWidth: 0,
    }}>
      <div style={{height: 76, background: '#EDEAE4', flexShrink: 0}}>
        <img src={sede.photo} alt="" loading="lazy"
          style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}/>
      </div>
      <div style={{flex: 1, minWidth: 0, padding: '9px 11px 8px', display: 'flex', flexDirection: 'column'}}>
        {/* Badge di stato a fianco del nome, sulla stessa riga */}
        <div style={{display: 'flex', alignItems: 'center', gap: 6, minWidth: 0}}>
          <span style={{fontSize: 13.5, fontWeight: 700, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{sede.name}</span>
          {attesa ? (
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: PN.MUTED, background: '#F4F5F7', padding: '1.5px 7px', borderRadius: 999, flexShrink: 0}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={PN.MUTED} strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
              In attesa
            </span>
          ) : (
            <span style={{fontSize: 10.5, fontWeight: 700, color: PN.GREEN, background: PN.GREEN_SOFT, padding: '1.5px 7px', borderRadius: 999, flexShrink: 0}}>● Attiva</span>
          )}
        </div>
        <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{sede.addr}</div>
        <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'flex-end'}}>
          <button onClick={onRemove} style={{
            background: 'transparent', border: 'none', padding: '3px 4px',
            fontSize: 12.5, fontWeight: 600, color: PN.RED,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{attesa ? 'Annulla' : 'Rimuovi'}</button>
        </div>
      </div>
    </div>
  );
}

function AddSedeTile({ onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        border: `2px dashed ${hover ? PN.PINK : PN.BORDER}`,
        borderRadius: 12, background: hover ? PN.PINK_SOFT : 'transparent',
        cursor: 'pointer', fontFamily: 'inherit', minHeight: 96,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        color: hover ? PN.PINK_DARK : PN.MUTED,
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'border-color 150ms ease, background 150ms ease, color 150ms ease, transform 180ms ease',
      }}>
      <PnI.Plus size={16}/>
      <span style={{fontSize: 13.5, fontWeight: 700}}>Aggiungi sede</span>
    </button>
  );
}

// Conferma rimozione/annullamento sede: nessuna azione distruttiva senza
// un passaggio esplicito.
function SedeConfirmModal({ sede, onClose, onConfirm }) {
  const attesa = sede.status === 'attesa';
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 85,
      background: 'rgba(15, 17, 21, 0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cert-overlay-in 180ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 380, maxWidth: 'calc(100% - 48px)',
        background: PN.WHITE, borderRadius: 16,
        boxShadow: '0 30px 70px -20px rgba(15, 17, 21, 0.35)',
        padding: '22px 22px 18px', textAlign: 'center',
        animation: 'cert-modal-pop 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
          background: PN.RED_SOFT, color: PN.RED,
          display: 'grid', placeItems: 'center',
        }}>
          {attesa ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6.5 7l1 13h9l1-13"/></svg>
          )}
        </div>
        <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>
          {attesa ? 'Annullare la richiesta?' : 'Rimuovere la sede?'}
        </div>
        <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 6, lineHeight: 1.5}}>
          {attesa
            ? <>La richiesta di collegamento per <b style={{color: PN.TEXT}}>{sede.name}</b> verrà annullata e il proprietario non riceverà più l'email di conferma.</>
            : <><b style={{color: PN.TEXT}}>{sede.name}</b> non comparirà più tra le sedi collegate sulla tua vetrina.</>}
        </div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16}}>
          <ImpButton variant="ghost" onClick={onClose}>Indietro</ImpButton>
          <ImpButton variant="primary" onClick={onConfirm}>
            {attesa ? 'Sì, annulla richiesta' : 'Sì, rimuovi'}
          </ImpButton>
        </div>
        <style>{`
          @keyframes cert-overlay-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
}

// Anagrafica dei locali cercabili nel popup (mock del registro byup).
const SEDE_DIRECTORY = [
  { name: 'Cacio e Pepe · Trastevere', addr: 'Via della Lungaretta 10, Roma',
    photo: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400&q=70&auto=format&fit=crop' },
  { name: 'Cacio e Pepe · Prati', addr: 'Via dei Gracchi 56, Roma',
    photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=70&auto=format&fit=crop' },
  { name: 'Osteria del Ponte', addr: 'Lungotevere degli Anguillara 3, Roma',
    photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70&auto=format&fit=crop' },
  { name: 'Trattoria Lucia', addr: 'Via della Scala 23, Roma',
    photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=70&auto=format&fit=crop' },
  { name: 'Al Settembrini', addr: 'Via Luigi Settembrini 25, Roma',
    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=70&auto=format&fit=crop' },
  { name: 'Da Michele', addr: 'Via Sforza Cesarini 6, Roma',
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70&auto=format&fit=crop' },
];

// Popup aggiungi sede: cerca il locale → seleziona (spunta) → conferma con
// avviso email al proprietario → la sede entra "In attesa".
function SedeSearchModal({ existing = [], onClose, onAdd }) {
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(null);
  const [phase, setPhase] = React.useState('search'); // 'search' | 'confirm'
  const results = SEDE_DIRECTORY
    .filter(v => !existing.includes(v.name))
    .filter(v => !q.trim() || v.name.toLowerCase().includes(q.toLowerCase()) || v.addr.toLowerCase().includes(q.toLowerCase()));
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
        {phase === 'search' ? (
          <>
            <div style={{display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14}}>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>Aggiungi sede</div>
                <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>Cerca il locale nel registro byup e collegalo come sede.</div>
              </div>
              <button onClick={onClose} style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                border: 'none', background: '#F4F5F7', color: PN.TEXT,
                cursor: 'pointer', display: 'grid', placeItems: 'center',
              }}><PnI.X size={13}/></button>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', background: '#F4F5F7', borderRadius: 10, marginBottom: 10,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PN.MUTED} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
              <input autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="Cerca il nome del locale…"
                style={{flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 14.5}}/>
            </div>

            <div style={{maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14}}>
              {results.map(v => {
                const on = sel && sel.name === v.name;
                return (
                  <button key={v.name} onClick={() => setSel(on ? null : v)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                    padding: '9px 10px', borderRadius: 10, fontFamily: 'inherit', cursor: 'pointer',
                    border: `1.5px solid ${on ? PN.PINK : PN.BORDER_SOFT}`,
                    background: on ? PN.PINK_SOFT : PN.WHITE,
                    transition: 'border-color 150ms ease, background 150ms ease',
                  }}>
                    <img src={v.photo} alt="" loading="lazy" style={{width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: '#EDEAE4'}}/>
                    <span style={{flex: 1, minWidth: 0}}>
                      <span style={{display: 'block', fontSize: 14, fontWeight: 700, color: PN.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{v.name}</span>
                      <span style={{display: 'block', fontSize: 12.5, color: PN.MUTED, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{v.addr}</span>
                    </span>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: on ? PN.PINK : 'transparent',
                      border: on ? 'none' : `1.5px solid ${PN.BORDER}`,
                      display: 'grid', placeItems: 'center',
                    }}>
                      {on && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </span>
                  </button>
                );
              })}
              {results.length === 0 && (
                <div style={{padding: '18px 0', textAlign: 'center', fontSize: 13.5, color: PN.MUTED}}>
                  Nessun locale trovato per “{q}”.
                </div>
              )}
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
              <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
              <ImpButton variant="primary" onClick={() => sel && setPhase('confirm')} disabled={!sel}>Aggiungi sede</ImpButton>
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 12, margin: '4px auto 12px',
              background: PN.PINK_BG_SOFT, color: PN.PINK_DARK,
              display: 'grid', placeItems: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/></svg>
            </div>
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, textAlign: 'center'}}>Confermi il collegamento?</div>
            <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 6, lineHeight: 1.5, textAlign: 'center'}}>
              Invieremo un'email al profilo proprietario di <b style={{color: PN.TEXT}}>{sel.name}</b> per
              autorizzare il collegamento. La sede resterà <b style={{color: PN.TEXT}}>in attesa</b> finché
              non verrà confermata.
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16}}>
              <ImpButton variant="ghost" onClick={() => setPhase('search')}>Indietro</ImpButton>
              <ImpButton variant="primary" onClick={() => onAdd(sel)}>Conferma e invia</ImpButton>
            </div>
          </>
        )}
        <style>{`
          @keyframes cert-overlay-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
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
  // Feedback loop: idle → sending (spinner) → done (check) → chiusura.
  const [phase, setPhase] = React.useState('idle');
  const send = () => {
    if (!tipo || phase !== 'idle') return;
    setPhase('sending');
    setTimeout(() => {
      setPhase('done');
      setTimeout(onClose, 1000);
    }, 900);
  };
  if (phase === 'done') {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 80,
        background: 'rgba(15, 17, 21, 0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 300, background: PN.WHITE, borderRadius: 16, padding: '28px 22px',
          textAlign: 'center', boxShadow: '0 30px 70px -20px rgba(15, 17, 21, 0.35)',
          animation: 'cert-modal-pop 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', margin: '0 auto 12px',
            background: '#DCFCE7', display: 'grid', placeItems: 'center',
            animation: 'cert-check-pop 380ms cubic-bezier(0.34, 1.6, 0.64, 1)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>Certificazione inviata</div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 4}}>
            {tipo} · in verifica, ti avvisiamo noi.
          </div>
        </div>
        <style>{`
          @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
          @keyframes cert-check-pop { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
        `}</style>
      </div>
    );
  }
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
              {rejected ? `Ricarica certificazione · ${ctx.name}` : 'Carica certificazione'}
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
          <ImpButton variant="primary" onClick={send} disabled={!tipo || phase === 'sending'}>
            {phase === 'sending' ? (
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                <span style={{
                  width: 13, height: 13, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.45)', borderTopColor: '#fff',
                  animation: 'cert-spin 700ms linear infinite', display: 'inline-block',
                }}/>
                Invio…
              </span>
            ) : (rejected ? 'Invia di nuovo' : 'Carica')}
          </ImpButton>
        </div>
        <style>{`@keyframes cert-spin { to { transform: rotate(360deg); } }`}</style>
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
  const GALLERY_MAX = 5;
  const [photos, setPhotos] = React.useState([
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=70&auto=format&fit=crop',
  ]);
  const [logo, setLogo] = React.useState(null);
  const [uploadModal, setUploadModal] = React.useState(null); // null | 'gallery' | 'logo'
  // Limite 5 foto: il sesto tentativo accende e scuote la riga-guida (come i tag).
  const [galleryLimitHit, setGalleryLimitHit] = React.useState(false);
  const hitLimit = () => {
    setGalleryLimitHit(true);
    clearTimeout(hitLimit._t);
    hitLimit._t = setTimeout(() => setGalleryLimitHit(false), 1500);
  };
  const openGalleryUpload = () => {
    if (photos.length >= GALLERY_MAX) { hitLimit(); return; }
    setUploadModal('gallery');
  };
  const addPhoto = (src) => {
    setPhotos(p => p.length >= GALLERY_MAX ? p : [...p, src]);
    setUploadModal(null);
    onChange && onChange();
  };
  const removePhoto = (i) => { setPhotos(p => p.filter((_, j) => j !== i)); onChange && onChange(); };

  return (
    <div>
      {/* Un'unica sezione "Immagini": logo a sinistra (colonna stretta, è un
          elemento quadrato) e galleria a destra — niente più card "Aspetto"
          omonima dello step. */}
      <ImpCard title="Immagini" sub="Logo e foto del locale: appariranno sulla vetrina">
        {/* Logo come striscia-profilo in alto (cerchio, testo, azione a
            destra), galleria a tutta larghezza sotto: niente colonna
            semivuota accanto alle foto. */}
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          {logo ? (
            <LogoCircle src={logo} size={96}
              onReplace={() => setUploadModal('logo')}
              onRemove={() => { setLogo(null); onChange && onChange(); }}/>
          ) : (
            <LogoDropCircle size={96} onClick={() => setUploadModal('logo')}/>
          )}
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 14.5, fontWeight: 600}}>Logo del locale</div>
            <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 3}}>
              PNG o JPG quadrato · 512×512px. Comparirà accanto al nome sulla vetrina.
            </div>
          </div>
          {logo && (
            <ImpButton variant="ghost" onClick={() => setUploadModal('logo')}>Sostituisci</ImpButton>
          )}
        </div>

        {/* Galleria — pannello tinto a tutta larghezza */}
        <div style={{
          marginTop: 16, background: '#F3F5F7',
          border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 12,
          padding: '14px 16px',
        }}>
          <div style={{fontSize: 14, fontWeight: 600, marginBottom: 3}}>Galleria fotografica</div>
          <div style={{fontSize: 12, color: PN.MUTED, marginBottom: 10}}>JPG o PNG · consigliato 1600×1200px</div>
          {/* Riga-guida col limite: si accende e scuote al sesto tentativo */}
          <div style={{
            fontSize: 13, fontWeight: 600, marginBottom: 10,
            color: galleryLimitHit ? PN.RED : PN.MUTED,
            animation: galleryLimitHit ? 'tag-limit-shake 380ms ease' : 'none',
            transition: 'color 150ms ease',
          }}>
            Massimo 5 immagini · {photos.length}/5 caricate
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap: 10}}>
            {photos.map((src, i) => (
              <div key={i} style={{aspectRatio: '4/3'}}>
                <PhotoTile src={src} radius={10} title="Elimina foto"
                  onRemove={() => removePhoto(i)}/>
              </div>
            ))}
            {/* Sempre presente, anche a galleria piena: al limite il click
                scuote la riga-guida invece di aprire il caricamento. */}
            <AddPhotoTile onClick={openGalleryUpload}/>
          </div>
        </div>
        <style>{`@keyframes tag-limit-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); } 40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); } 80% { transform: translateX(3px); }
        }`}</style>
      </ImpCard>

      {uploadModal && (
        <MediaUploadModal
          kind={uploadModal}
          onClose={() => setUploadModal(null)}
          onPick={(src) => uploadModal === 'logo'
            ? (setLogo(src), setUploadModal(null), onChange && onChange())
            : addPhoto(src)}/>
      )}
    </div>
  );
}

// Tile-foto: in hover la foto si ingrandisce con ombra; il cestino a cavallo
// dell'angolo si accende di rosso in hover e si comprime al click.
function PhotoTile({ src, onRemove, radius = 10, title = 'Elimina' }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{position: 'relative', width: '100%', height: '100%'}}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: radius,
        transform: hover ? 'scale(1.045)' : 'scale(1)',
        boxShadow: hover ? '0 12px 26px rgba(15, 17, 21, 0.20)' : 'none',
        transition: 'transform 200ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 200ms ease',
        zIndex: hover ? 2 : 1,
      }}>
        <MediaThumb src={src} radius={radius}/>
      </div>
      <TrashBadge title={title} onClick={onRemove}/>
    </div>
  );
}

// Logo circolare: com'è sulla vetrina, appena più grande. Si ingrandisce in
// hover come le foto; il cestino sta a cavallo del bordo del cerchio.
function LogoCircle({ src, onReplace, onRemove, size = 128 }) {
  const [hover, setHover] = React.useState(false);
  const [dim, setDim] = React.useState(null);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0}}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{position: 'relative', width: size, height: size}}>
        <div onClick={onReplace} title="Sostituisci logo" style={{
          position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
          border: `1px solid ${PN.BORDER_SOFT}`, cursor: 'pointer',
          transform: hover ? 'scale(1.05)' : 'scale(1)',
          boxShadow: hover ? '0 14px 30px rgba(15, 17, 21, 0.22)' : '0 4px 14px rgba(15, 17, 21, 0.10)',
          transition: 'transform 200ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 200ms ease',
        }}>
          <img src={src} alt="" onLoad={e => setDim([e.target.naturalWidth, e.target.naturalHeight])}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#EDEAE4'}}/>
        </div>
        <TrashBadge title="Rimuovi logo" onClick={onRemove} pos={{top: 2, right: 2}}/>
      </div>
      {dim && (
        <div style={{fontSize: 11.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.3}}>
          {dim[0]}×{dim[1]}px
        </div>
      )}
    </div>
  );
}

// Dropzone circolare del logo quando non c'è ancora: stessa sagoma del logo
// che comparirà, così l'occhio sa già cosa aspettarsi.
function LogoDropCircle({ onClick, size = 128 }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        border: `2px dashed ${hover ? PN.PINK : PN.BORDER}`,
        background: hover ? PN.PINK_SOFT : '#FAFBFC',
        display: 'grid', placeItems: 'center', cursor: 'pointer', textAlign: 'center',
        color: hover ? PN.PINK_DARK : PN.MUTED, fontSize: 12, fontWeight: 600,
        transform: hover ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 200ms cubic-bezier(0.34, 1.45, 0.64, 1), border-color 150ms ease, background 150ms ease, color 150ms ease',
      }}>
      <div>
        <PnI.Plus size={16} color={hover ? PN.PINK_DARK : PN.MUTED}/>
        <div style={{marginTop: 3, fontSize: 11.5}}>Aggiungi logo</div>
      </div>
    </div>
  );
}

// Tile "Aggiungi" della galleria: sempre visibile, si ingrandisce in hover
// come le foto e si comprime al click.
function AddPhotoTile({ onClick }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        aspectRatio: '4/3', borderRadius: 10,
        border: `2px dashed ${hover ? PN.PINK : PN.BORDER}`,
        background: hover ? PN.PINK_SOFT : PN.WHITE,
        display: 'grid', placeItems: 'center',
        color: hover ? PN.PINK_DARK : PN.MUTED, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transform: pressed ? 'scale(0.96)' : hover ? 'scale(1.045)' : 'scale(1)',
        boxShadow: hover ? '0 12px 26px rgba(15, 17, 21, 0.14)' : 'none',
        transition: 'transform 200ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 200ms ease, border-color 150ms ease, background 150ms ease, color 150ms ease',
      }}>
      <div style={{textAlign: 'center'}}>
        <PnI.Plus size={18} color={hover ? PN.PINK_DARK : PN.MUTED}/>
        <div style={{marginTop: 4}}>Aggiungi</div>
      </div>
    </div>
  );
}

// Cestino a badge: bianco a riposo, rosso pieno in hover, si comprime al click.
// `pos` sposta il badge (serve sul logo tondo, dove l'angolo del box è fuori
// dal cerchio).
function TrashBadge({ onClick, title, pos }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: 'absolute', ...(pos || {top: -9, right: -9}), zIndex: 3,
        width: 27, height: 27, borderRadius: '50%',
        background: hover ? PN.RED : PN.WHITE,
        color: hover ? '#fff' : PN.RED,
        border: `1px solid ${hover ? PN.RED : PN.BORDER_LIGHT}`,
        boxShadow: hover ? '0 5px 14px rgba(220, 38, 38, 0.40)' : '0 3px 10px rgba(15, 17, 21, 0.20)',
        transform: pressed ? 'scale(0.82)' : hover ? 'scale(1.12)' : 'scale(1)',
        transition: 'background 130ms ease, color 130ms ease, border-color 130ms ease, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 150ms ease',
        cursor: 'pointer', display: 'grid', placeItems: 'center',
      }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6.5 7l1 13h9l1-13"/><path d="M10 11v5M14 11v5"/>
      </svg>
    </button>
  );
}

// Thumbnail con l'indicazione dei pixel reali (letti a caricamento avvenuto).
function MediaThumb({ src, radius = 10 }) {
  const [dim, setDim] = React.useState(null);
  return (
    <>
      <img src={src} alt="" loading="lazy"
        onLoad={e => setDim([e.target.naturalWidth, e.target.naturalHeight])}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
        style={{width:'100%', height:'100%', objectFit:'cover', display:'block', borderRadius: radius, background:'#EDEAE4'}}/>
      {dim && (
        <span style={{
          position:'absolute', left: 6, bottom: 6,
          fontSize: 10.5, fontWeight: 700, color: '#fff',
          background: 'rgba(15, 17, 21, 0.62)', padding: '2px 7px', borderRadius: 999,
          pointerEvents: 'none', letterSpacing: 0.3,
        }}>{dim[0]}×{dim[1]}px</span>
      )}
    </>
  );
}

// Popup di caricamento condiviso (logo e galleria): trascina dentro il file
// o sfoglia dalla scrivania. Indica formato e pixel consigliati.
function MediaUploadModal({ kind, onClose, onPick }) {
  const isLogo = kind === 'logo';
  const inputRef = React.useRef(null);
  const [dragOver, setDragOver] = React.useState(false);
  const handleFiles = (files) => {
    const f = files && files[0];
    if (!f || !f.type || !f.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = () => onPick(r.result);
    r.readAsDataURL(f);
  };
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(15, 17, 21, 0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cert-overlay-in 180ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 460, maxWidth: 'calc(100% - 48px)',
        background: PN.WHITE, borderRadius: 16,
        boxShadow: '0 30px 70px -20px rgba(15, 17, 21, 0.35)',
        padding: '20px 22px',
        animation: 'cert-modal-pop 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>
              {isLogo ? 'Carica il logo' : 'Aggiungi foto alla galleria'}
            </div>
            <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>
              {isLogo
                ? 'PNG o JPG quadrato · consigliato 512×512px · max 5MB'
                : 'JPG o PNG · consigliato 1600×1200px · max 10MB'}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            border: 'none', background: '#F4F5F7', color: PN.TEXT,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}><PnI.X size={13}/></button>
        </div>

        <div
          onClick={() => inputRef.current && inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          style={{
            padding: '34px 16px', borderRadius: 12, cursor: 'pointer',
            border: `2px dashed ${dragOver ? PN.PINK : PN.BORDER}`,
            background: dragOver ? PN.PINK_SOFT : '#FAFBFC',
            textAlign: 'center',
            transition: 'border-color 150ms ease, background 150ms ease',
          }}>
          <div style={{color: PN.MUTED, marginBottom: 8, display: 'flex', justifyContent: 'center'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>
            </svg>
          </div>
          <div style={{fontSize: 14.5, fontWeight: 600, color: PN.TEXT}}>
            {dragOver ? 'Rilascia qui per caricare' : 'Trascina qui l\'immagine'}
          </div>
          <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2}}>oppure clicca per sfogliare dalla scrivania</div>
          <input ref={inputRef} type="file" accept="image/*" style={{display: 'none'}}
            onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}/>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 14}}>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
        </div>
        <style>{`
          @keyframes cert-overlay-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
}

// ─── Pubblico (FAQ + social) ────────────────────────────────────────────────

// Social collegabili: per ciascuno i domini accettati per il link della pagina.
const SOCIAL_DEFS = [
  {key:'ig', name:'Instagram',   abbr:'IG', bg:'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    domains:['instagram.com'],           sample:'https://instagram.com/iltuolocale'},
  {key:'tw', name:'Twitter / X', bg:'#000',     domains:['x.com', 'twitter.com'],    sample:'https://x.com/iltuolocale'},
  {key:'yt', name:'YouTube',     bg:'#FF0000',  domains:['youtube.com', 'youtu.be'], sample:'https://youtube.com/@iltuolocale'},
  {key:'tt', name:'TikTok',      bg:'#000',     domains:['tiktok.com'],              sample:'https://tiktok.com/@iltuolocale'},
  {key:'li', name:'LinkedIn',    bg:'#0A66C2',  domains:['linkedin.com'],            sample:'https://linkedin.com/company/iltuolocale'},
  {key:'fb', name:'Facebook',    bg:'#1877F2',  domains:['facebook.com', 'fb.com'],  sample:'https://facebook.com/iltuolocale'},
];

// "@handle" leggibile dal link del profilo (fallback: dominio pulito).
const socialHandle = (url) => {
  try {
    const u = new URL(url);
    const seg = u.pathname.split('/').filter(Boolean).pop();
    return seg ? `@${seg.replace(/^@/, '')}` : u.hostname.replace(/^www\./, '');
  } catch (e) { return url; }
};

function VetrinaPubblico({ social, setSocial, onChange }) {
  // Collegare un social passa dal popup del link; qui i link confermati.
  const [links, setLinks] = React.useState({ ig: 'https://instagram.com/ristoranteparadiso' });
  const [linkModal, setLinkModal] = React.useState(null); // def del social da collegare
  const [unlink, setUnlink] = React.useState(null);       // def del social da scollegare (con conferma)
  const connectSocial = (key, url) => {
    setLinks(l => ({...l, [key]: url}));
    if (!social.includes(key)) setSocial([...social, key]);
    setLinkModal(null);
    onChange && onChange();
  };
  const disconnectSocial = (key) => {
    setLinks(l => { const n = {...l}; delete n[key]; return n; });
    setSocial(social.filter(x => x !== key));
    onChange && onChange();
  };
  // FAQ reali: crea dal popup, riordina col drag, modifica, elimina con conferma.
  const [faqs, setFaqs] = React.useState([
    { id: 'f1', q: 'Avete prodotti senza glutine?', a: 'Sì, abbiamo un menù dedicato preparato in area separata.' },
    { id: 'f2', q: 'Fate asporto?', a: 'Sì, tutti i piatti del menù sono disponibili da asporto.' },
    { id: 'f3', q: 'Organizzate feste di compleanno?', a: 'Certo: menù dedicati e sala riservata, contattaci.' },
  ]);
  const [faqModal, setFaqModal] = React.useState(null);     // null | {mode:'new'} | {mode:'edit', faq}
  const [faqConfirm, setFaqConfirm] = React.useState(null); // faq da eliminare
  const [dragFaq, setDragFaq] = React.useState(null);
  const [overFaq, setOverFaq] = React.useState(null);
  const saveFaq = (draft) => {
    if (draft.id) setFaqs(fs => fs.map(f => f.id === draft.id ? draft : f));
    else setFaqs(fs => [...fs, { ...draft, id: `f${Date.now()}` }]);
    setFaqModal(null);
    onChange && onChange();
  };
  const deleteFaq = (id) => {
    setFaqs(fs => fs.filter(f => f.id !== id));
    setFaqConfirm(null);
    onChange && onChange();
  };
  const reorderFaq = (fromId, toId) => {
    if (!fromId || fromId === toId) return;
    setFaqs(fs => {
      const next = [...fs];
      const from = next.findIndex(f => f.id === fromId);
      const to = next.findIndex(f => f.id === toId);
      if (from < 0 || to < 0) return fs;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    onChange && onChange();
  };
  return (
    <div>
      <ImpCard title="Domande frequenti" sub="Aiuta i clienti a trovare risposte rapide. Crea, ordina e modifica le FAQ" action={
        <ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={() => setFaqModal({mode: 'new'})}>Nuova FAQ</ImpButton>
      }>
        <div style={{display:'flex', flexDirection:'column', gap: 8}}>
          {faqs.map(f => (
            <div key={f.id}
              onDragOver={e => { e.preventDefault(); setOverFaq(f.id); }}
              onDragLeave={() => setOverFaq(o => o === f.id ? null : o)}
              onDrop={() => { reorderFaq(dragFaq, f.id); setDragFaq(null); setOverFaq(null); }}
              style={{
                display:'flex', alignItems:'center', gap: 12,
                padding: '12px 14px',
                border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
                background: PN.WHITE,
                opacity: dragFaq === f.id ? 0.45 : 1,
                outline: overFaq === f.id && dragFaq && dragFaq !== f.id ? `2px dashed ${PN.PINK}` : 'none',
                outlineOffset: 3,
                transition: 'opacity 120ms ease',
              }}>
              {/* Maniglia: da qui si trascina per riordinare */}
              <span draggable
                onDragStart={e => { setDragFaq(f.id); e.dataTransfer.effectAllowed = 'move'; }}
                onDragEnd={() => { setDragFaq(null); setOverFaq(null); }}
                title="Trascina per riordinare"
                style={{color:PN.MUTED, cursor:'grab', display:'inline-flex', padding: 2}}>
                <PnI.Drag size={14}/>
              </span>
              <span style={{flex:1, minWidth: 0, fontSize:15.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{f.q}</span>
              <FaqIconBtn title="Modifica" onClick={() => setFaqModal({mode: 'edit', faq: f})}>
                <PnI.Edit size={14}/>
              </FaqIconBtn>
              <FaqIconBtn title="Elimina" danger onClick={() => setFaqConfirm(f)}>
                <PnI.X size={14}/>
              </FaqIconBtn>
            </div>
          ))}
        </div>
      </ImpCard>

      {faqModal && (
        <FaqModal ctx={faqModal}
          onClose={() => setFaqModal(null)}
          onSave={saveFaq}
          onDelete={(f) => { setFaqModal(null); setFaqConfirm(f); }}/>
      )}
      {faqConfirm && (
        <FaqConfirmModal faq={faqConfirm}
          onClose={() => setFaqConfirm(null)}
          onConfirm={() => deleteFaq(faqConfirm.id)}/>
      )}

      <ImpCard title="Account social" sub="Collega i tuoi profili. Appariranno sulla vetrina">
        {/* Collegati: un box per ogni account effettivamente attivo */}
        {SOCIAL_DEFS.some(s => social.includes(s.key)) ? (
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 16}}>
            {SOCIAL_DEFS.filter(s => social.includes(s.key)).map(s => (
              <div key={s.key} style={{
                padding: '12px 14px', border:`1.5px solid ${PN.GREEN_SOFT}`,
                borderRadius: 12, background: '#F0FDF4', minWidth: 0,
                display:'flex', flexDirection:'column', gap: 8,
              }}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8}}>
                  <div style={{
                    width: 34, height:34, borderRadius: 8, background: s.bg, flexShrink: 0,
                    display:'grid', placeItems:'center', color:'#fff', fontSize: s.abbr ? 14 : 16, fontWeight:800,
                  }}>{s.abbr || s.name[0]}</div>
                  <div style={{fontSize:11.5, fontWeight:700, color:PN.GREEN, letterSpacing:0.4, whiteSpace:'nowrap'}}>● COLLEGATO</div>
                </div>
                <div style={{minWidth: 0}}>
                  <div style={{fontSize:15, fontWeight:700}}>{s.name}</div>
                  <div title={links[s.key]} style={{fontSize:13, color:PN.MUTED, marginTop: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {links[s.key] ? socialHandle(links[s.key]) : 'Profilo collegato'}
                  </div>
                </div>
                <ScollegaBtn onClick={() => setUnlink(s)}
                  style={{alignSelf:'flex-start', padding:'4px 10px', marginLeft:-10, fontSize:13.5}}/>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '12px 14px', border:`1.5px dashed ${PN.BORDER}`, borderRadius: 10,
            fontSize: 13.5, color: PN.MUTED, marginBottom: 16,
          }}>
            Nessun account collegato: aggiungi il primo qui sotto.
          </div>
        )}

        {SOCIAL_DEFS.some(s => !social.includes(s.key)) && (
          <>
            <div style={{fontSize:13.5, fontWeight:600, color:PN.MUTED, marginBottom:8, letterSpacing:0.3, textTransform:'uppercase'}}>Aggiungi altri social</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10}}>
              {SOCIAL_DEFS.filter(s => !social.includes(s.key)).map(s => (
                <SocialAddTile key={s.key} s={s} onClick={() => setLinkModal(s)}/>
              ))}
            </div>
          </>
        )}
      </ImpCard>

      {linkModal && (
        <SocialLinkModal def={linkModal}
          onClose={() => setLinkModal(null)}
          onConnect={connectSocial}/>
      )}
      {unlink && (
        <SocialUnlinkModal def={unlink} link={links[unlink.key]}
          onClose={() => setUnlink(null)}
          onConfirm={() => { disconnectSocial(unlink.key); setUnlink(null); }}/>
      )}
    </div>
  );
}

// Bottone-icona delle righe FAQ: feedback visibile in hover (fondo tinto,
// colore pieno, leggero ingrandimento) e alla pressione (si comprime).
function FaqIconBtn({ title, danger, onClick, children }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: 30, height: 30, borderRadius: 8, border: 'none',
        background: hover ? (danger ? PN.RED_SOFT : '#EEF0F3') : 'transparent',
        color: danger ? PN.RED : (hover ? PN.TEXT : PN.MUTED),
        cursor: 'pointer', display: 'grid', placeItems: 'center',
        transform: pressed ? 'scale(0.88)' : hover ? 'scale(1.08)' : 'scale(1)',
        transition: 'background 130ms ease, color 130ms ease, transform 130ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}>
      {children}
    </button>
  );
}

// Popup FAQ: crea o modifica domanda e risposta. La X in alto chiude
// annullando qualsiasi modifica; in modifica c'è anche Elimina.
function FaqModal({ ctx, onClose, onSave, onDelete }) {
  const editing = ctx.mode === 'edit';
  const [q, setQ] = React.useState(editing ? ctx.faq.q : '');
  const [a, setA] = React.useState(editing ? ctx.faq.a : '');
  const canSave = q.trim().length > 0 && a.trim().length > 0;
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
              {editing ? 'Modifica FAQ' : 'Nuova FAQ'}
            </div>
            <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>
              Domanda e risposta appariranno sulla vetrina del locale.
            </div>
          </div>
          <button onClick={onClose} title="Chiudi senza salvare" style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            border: 'none', background: '#F4F5F7', color: PN.TEXT,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}><PnI.X size={13}/></button>
        </div>

        <div style={{marginBottom: 12}}>
          <div style={{fontSize: 13.5, fontWeight: 600, color: PN.TEXT, marginBottom: 6}}>Domanda</div>
          <ImpInput autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="es. Avete un menù per bambini?"/>
        </div>
        <div style={{marginBottom: 16}}>
          <div style={{fontSize: 13.5, fontWeight: 600, color: PN.TEXT, marginBottom: 6}}>Risposta</div>
          <ImpTextarea value={a} onChange={e => setA(e.target.value)}
            placeholder="Scrivi la risposta che vedranno i clienti…"/>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          {editing && (
            <button onClick={() => onDelete(ctx.faq)} style={{
              background: 'transparent', border: 'none', padding: '6px 4px',
              fontSize: 14, fontWeight: 600, color: PN.RED,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Elimina FAQ</button>
          )}
          <span style={{flex: 1}}/>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
          <ImpButton variant="primary" disabled={!canSave}
            onClick={() => canSave && onSave(editing ? {...ctx.faq, q: q.trim(), a: a.trim()} : {q: q.trim(), a: a.trim()})}>
            {editing ? 'Salva modifiche' : 'Salva FAQ'}
          </ImpButton>
        </div>
        <style>{`
          @keyframes cert-overlay-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
}

// Conferma eliminazione FAQ: nessuna cancellazione a un solo click.
function FaqConfirmModal({ faq, onClose, onConfirm }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 85,
      background: 'rgba(15, 17, 21, 0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cert-overlay-in 180ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 380, maxWidth: 'calc(100% - 48px)',
        background: PN.WHITE, borderRadius: 16,
        boxShadow: '0 30px 70px -20px rgba(15, 17, 21, 0.35)',
        padding: '22px 22px 18px', textAlign: 'center',
        animation: 'cert-modal-pop 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
          background: PN.RED_SOFT, color: PN.RED,
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6.5 7l1 13h9l1-13"/>
          </svg>
        </div>
        <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Eliminare la FAQ?</div>
        <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 6, lineHeight: 1.5}}>
          «<b style={{color: PN.TEXT}}>{faq.q}</b>» non sarà più visibile sulla vetrina.
        </div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16}}>
          <ImpButton variant="ghost" onClick={onClose}>Indietro</ImpButton>
          <ImpButton variant="primary" onClick={onConfirm}>Sì, elimina</ImpButton>
        </div>
        <style>{`
          @keyframes cert-overlay-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
}

// Tile "Aggiungi social": in hover si accende in tinta brand, si solleva e
// mostra il + di collegamento; si comprime al click.
function SocialAddTile({ s, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button title={`Collega ${s.name}`} onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display:'flex', alignItems:'center', gap: 10, minWidth: 0,
        padding: '10px 12px', borderRadius: 10,
        border:`1.5px solid ${hover ? PN.PINK : PN.BORDER}`,
        background: hover ? PN.PINK_SOFT : PN.WHITE,
        cursor:'pointer', fontFamily:'inherit',
        transform: pressed ? 'scale(0.97)' : hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover ? '0 6px 16px rgba(15, 17, 21, 0.10)' : 'none',
        transition: 'border-color 150ms ease, background 150ms ease, transform 150ms ease, box-shadow 150ms ease',
      }}>
      <span style={{
        width:24, height:24, borderRadius:5, background:s.bg, flexShrink: 0,
        display:'grid', placeItems:'center', color:'#fff', fontSize:13, fontWeight:800,
      }}>{s.abbr || s.name[0]}</span>
      <span style={{flex:1, minWidth: 0, textAlign:'left', fontSize:15, fontWeight:600, color: hover ? PN.PINK_DARK : PN.TEXT, transition:'color 150ms ease'}}>{s.name}</span>
      {hover && <PnI.Plus size={12} color={PN.PINK_DARK}/>}
    </button>
  );
}

// "Scollega": testo rosso con feedback in hover (fondo tinto) e alla pressione.
function ScollegaBtn({ onClick, style }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        padding: '6px 12px', borderRadius: 8, border: 'none', flexShrink: 0,
        background: hover ? PN.RED_SOFT : 'transparent',
        color: PN.RED, fontSize: 14, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transform: pressed ? 'scale(0.94)' : 'none',
        transition: 'background 130ms ease, transform 130ms ease',
        ...style,
      }}>Scollega</button>
  );
}

// Conferma di scollegamento: nessun social si stacca con un solo click.
function SocialUnlinkModal({ def, link, onClose, onConfirm }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 85,
      background: 'rgba(15, 17, 21, 0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cert-overlay-in 180ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 380, maxWidth: 'calc(100% - 48px)',
        background: PN.WHITE, borderRadius: 16,
        boxShadow: '0 30px 70px -20px rgba(15, 17, 21, 0.35)',
        padding: '22px 22px 18px', textAlign: 'center',
        animation: 'cert-modal-pop 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
          background: PN.RED_SOFT, color: PN.RED,
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 15l-3.5 3.5a3.2 3.2 0 0 1-4.5-4.5L4.5 10.5a3.2 3.2 0 0 1 4.5 0" transform="translate(3 -1)"/>
            <path d="M15 9l3.5-3.5a3.2 3.2 0 0 1 4.5 4.5L19.5 13.5a3.2 3.2 0 0 1-4.5 0" transform="translate(-3 1)"/>
            <path d="M4 4l3 3M20 20l-3-3" strokeWidth="1.6"/>
          </svg>
        </div>
        <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Scollegare {def.name}?</div>
        <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 6, lineHeight: 1.5}}>
          <b style={{color: PN.TEXT}}>{link ? socialHandle(link) : 'Il profilo'}</b> non apparirà più sulla vetrina del locale.
        </div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16}}>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
          <ImpButton variant="primary" onClick={onConfirm}>Sì, scollega</ImpButton>
        </div>
        <style>{`
          @keyframes cert-overlay-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
}

// Popup di collegamento social: chiede il link della pagina e verifica che il
// dominio corrisponda al social scelto prima di collegarlo.
function SocialLinkModal({ def, onClose, onConnect }) {
  const [url, setUrl] = React.useState('');
  const [error, setError] = React.useState(null);
  const [shake, setShake] = React.useState(0);
  const submit = () => {
    const v = url.trim();
    if (!v) return;
    const full = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    let host = '';
    try { host = new URL(full).hostname.toLowerCase().replace(/^www\./, ''); } catch (e) { host = ''; }
    if (!host || !host.includes('.')) {
      setError('Questo non sembra un link valido. Incolla l\'indirizzo completo della pagina.');
      setShake(s => s + 1);
      return;
    }
    const ok = def.domains.some(d => host === d || host.endsWith(`.${d}`));
    if (!ok) {
      setError(`Il link non corrisponde a ${def.name}: serve un indirizzo ${def.domains[0]}.`);
      setShake(s => s + 1);
      return;
    }
    onConnect(def.key, full);
  };
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(15, 17, 21, 0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cert-overlay-in 180ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 460, maxWidth: 'calc(100% - 48px)',
        background: PN.WHITE, borderRadius: 16,
        boxShadow: '0 30px 70px -20px rgba(15, 17, 21, 0.35)',
        padding: '20px 22px',
        animation: 'cert-modal-pop 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      }}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14}}>
          <span style={{
            width: 36, height: 36, borderRadius: 9, background: def.bg, flexShrink: 0,
            display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16, fontWeight: 800,
          }}>{def.name[0]}</span>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>
              Collega {def.name}
            </div>
            <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>
              Incolla il link della tua pagina. Apparirà sulla vetrina del locale.
            </div>
          </div>
          <button onClick={onClose} title="Chiudi senza collegare" style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            border: 'none', background: '#F4F5F7', color: PN.TEXT,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}><PnI.X size={13}/></button>
        </div>

        <div style={{marginBottom: 16}}>
          <div style={{fontSize: 13.5, fontWeight: 600, color: PN.TEXT, marginBottom: 6}}>Link della pagina</div>
          <ImpInput autoFocus value={url}
            onChange={e => { setUrl(e.target.value); setError(null); }}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            placeholder={def.sample}
            style={error ? {borderColor: PN.RED, background: '#FFF7F7'} : undefined}/>
          {error && (
            <div key={shake} style={{
              fontSize: 13, fontWeight: 600, color: PN.RED, marginTop: 8,
              animation: 'tag-limit-shake 380ms ease',
            }}>{error}</div>
          )}
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
          <ImpButton variant="primary" disabled={!url.trim()} onClick={submit}>Collega profilo</ImpButton>
        </div>
        <style>{`
          @keyframes cert-overlay-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cert-modal-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
          @keyframes tag-limit-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-5px); } 40% { transform: translateX(5px); }
            60% { transform: translateX(-3px); } 80% { transform: translateX(3px); }
          }
        `}</style>
      </div>
    </div>
  );
}

window.ImpVetrina = ImpVetrina;
