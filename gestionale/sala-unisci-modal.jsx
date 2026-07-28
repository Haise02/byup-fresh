// Sala — Modali tavolo:
// - SalaModificaModal: hub unico Sposta / Dividi / Unisci con CTA dinamica,
//   aperta dal pulsante "Modifica" della card tavolo.

// ─────────────────────────────────────────────────────────────────────────────
// SalaModificaModal — hub unico per le operazioni sul tavolo.
// Tre operazioni selezionabili in alto (Sposta / Dividi / Unisci); il contenuto
// e la CTA in basso cambiano dinamicamente con l'operazione e la selezione.
function SalaModificaModal({ tavolo, onClose, onSposta, onUnisciConfirm, onDetach, onLibera, onNoShow, onAdjustCoperti }) {
  const [op, setOp] = React.useState('sposta');
  const [spostaId, setSpostaId] = React.useState(null);   // sposta: destinazione singola
  const [daUnire, setDaUnire] = React.useState(new Set()); // unisci: tavoli da aggiungere
  const [daStaccare, setDaStaccare] = React.useState(new Set()); // dividi: uniti da separare
  const [search, setSearch] = React.useState('');

  const all = window.SALA_TAVOLI || [];
  const merged = tavolo ? (tavolo.mergedTables || []) : [];
  const isMerged = merged.length > 0;

  React.useEffect(() => {
    if (tavolo) {
      setOp('sposta');
      setSpostaId(null);
      setDaUnire(new Set());
      setDaStaccare(new Set());
      setSearch('');
    }
  }, [tavolo?.id]);

  if (!tavolo) return null;

  function tavLabel(t) {
    return `Tavolo ${[t.id, ...(t.mergedTables || [])].sort((a, b) => a - b).join('-')}`;
  }
  function stateDescription(t) {
    if (t.state === 'libero') return t.nextReservation ? `Libero · prenotazione alle ${t.nextReservation.time}` : 'Libero';
    if (t.state === 'prenotato') return `Prenotato · ${t.nextReservation?.time || ''}`;
    if (t.state === 'occupato') return t.party ? `Occupato · ${t.party}` : 'Occupato';
    if (t.state === 'dapulire') return 'Da pulire';
    return t.state;
  }
  const matchSearch = (t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return String(t.id).includes(q)
      || (t.party || '').toLowerCase().includes(q)
      || (t.nextReservation?.name || '').toLowerCase().includes(q);
  };

  // Candidati per operazione
  const spostaCandidates = all.filter(t => t.id !== tavolo.id && !t.mergedWith && matchSearch(t));
  // Unisci: anche occupati o prenotati, come nel drag-merge sulla mappa
  // (il conto dei tavoli occupati confluisce nel conto unico del gruppo).
  const unisciCandidates = all.filter(t =>
    t.id !== tavolo.id
    && !t.mergedWith && !(t.mergedTables && t.mergedTables.length > 0)
    && matchSearch(t));
  const dividiCandidates = merged.map(id => all.find(t => t.id === id)).filter(Boolean);

  const toggleSet = (setter) => (id) => setter(s => {
    const ns = new Set(s);
    if (ns.has(id)) ns.delete(id); else ns.add(id);
    return ns;
  });
  const toggleUnire = toggleSet(setDaUnire);
  const toggleStacca = toggleSet(setDaStaccare);

  // Azioni di stato (ex menu 3 puntini) — mostrate in basso a sinistra
  const occupatoSaldato = tavolo.state === 'occupato' && (tavolo.contoSaldato || (tavolo.daIncassare === 0 && tavolo.conto > 0));
  const isLate = tavolo.state === 'prenotato' && tavolo.minutiAllaPrenotazione != null && tavolo.minutiAllaPrenotazione < 0;
  const stateAction = (tavolo.state === 'occupato' && !occupatoSaldato)
    ? { label:'Libera tavolo', onClick: () => { onClose && onClose(); onLibera && onLibera(tavolo); } }
    : (tavolo.state === 'prenotato'
      ? (isLate
        ? { label:'Segna come non presentato', onClick: () => { onClose && onClose(); onNoShow && onNoShow(tavolo); } }
        : { label:'Annulla prenotazione', onClick: () => { onClose && onClose(); } })
      : null);

  // CTA dinamica per operazione + selezione
  const cta = (() => {
    if (op === 'sposta') {
      if (spostaId == null) return { label:'Scegli il tavolo di destinazione', disabled:true };
      return { label:`Sposta a Tavolo ${spostaId}`, onClick: () => { onSposta && onSposta(tavolo, spostaId); onClose && onClose(); } };
    }
    if (op === 'unisci') {
      if (daUnire.size === 0) return { label:'Seleziona i tavoli da unire', disabled:true };
      return {
        label:`Unisci ${daUnire.size} tavol${daUnire.size === 1 ? 'o' : 'i'}`,
        onClick: () => { onUnisciConfirm && onUnisciConfirm(tavolo, Array.from(daUnire)); onClose && onClose(); },
      };
    }
    // dividi
    if (daStaccare.size === 0) return { label:'Seleziona i tavoli da separare', disabled:true };
    const tutto = daStaccare.size === merged.length;
    return {
      label: tutto ? 'Dividi tutto il gruppo' : `Separa ${daStaccare.size} tavol${daStaccare.size === 1 ? 'o' : 'i'}`,
      onClick: () => { Array.from(daStaccare).forEach(id => onDetach && onDetach(tavolo, id)); onClose && onClose(); },
    };
  })();

  const OPS = [
    { id:'sposta', label:'Sposta', desc:'Su un altro tavolo',
      icon:<><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="M16 13l4 4-4 4"/><path d="M20 17H4"/></> },
    { id:'dividi', label:'Dividi', desc: isMerged ? 'Separa i tavoli uniti' : 'Solo per tavoli uniti', disabled: !isMerged,
      icon:<><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/></> },
    { id:'unisci', label:'Unisci', desc:'Con altri tavoli',
      icon:<><rect x="3" y="3" width="12" height="12" rx="2"/><rect x="9" y="9" width="12" height="12" rx="2"/></> },
  ];

  // Card selezionabile riusata da tutte le liste
  const pickRow = (t, isSelected, onPick, subLabel) => {
    const meta = window.SALA_STATE_META?.[t.state] || {dot:'#9CA3AF'};
    return (
      <button key={t.id} onClick={() => onPick(t.id)} style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'10px 12px', borderRadius:10,
        background: isSelected ? '#FFF5F5' : '#fff',
        border: `1.5px solid ${isSelected ? '#E04347' : '#E5E7EB'}`,
        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
        transition:'background 150ms ease-out, border-color 150ms ease-out',
      }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#D1D5DB'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#E5E7EB'; }}>
        <span style={{width:10, height:10, borderRadius:'50%', background: meta.dot, flexShrink:0}}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:18, fontWeight:800, color:'#0F1115'}}>Tavolo {t.id}</div>
          <div style={{fontSize:15.5, color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {subLabel || stateDescription(t)}
          </div>
        </div>
        <span style={{
          width:20, height:20, borderRadius:'50%', flexShrink:0,
          background: isSelected ? '#E04347' : 'transparent',
          border: isSelected ? 'none' : '1.5px solid #D1D5DB',
          color:'#fff', display:'grid', placeItems:'center',
        }}>
          {isSelected && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13 L9 17 L19 7"/>
            </svg>
          )}
        </span>
      </button>
    );
  };

  return (
    <>
      <div onClick={onClose} style={{
        position:'absolute', inset:0, background:'rgba(15,17,21,0.55)', zIndex:60,
      }}/>
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width: 620, maxWidth:'94%', height: 620, maxHeight:'92%',
        background:'#fff', borderRadius: 16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex: 61, display:'flex', flexDirection:'column', overflow:'hidden',
        fontFamily:'inherit',
      }}>
        {/* HEADER */}
        <div style={{padding:'18px 22px 14px', borderBottom:'1px solid #F0F2F5', flexShrink:0}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:22, fontWeight:800, color:'#0F1115', letterSpacing:'-0.02em'}}>
                Modifica {tavLabel(tavolo)}
              </div>
              <div style={{fontSize:17, color:'#6B7280', marginTop:4}}>
                Sposta, dividi o unisci il tavolo
              </div>
            </div>
            <button onClick={onClose} aria-label="Chiudi" style={{
              width:32, height:32, borderRadius:8,
              background:'#F1F2F5', border:'none', cursor:'pointer',
              fontSize:22, color:'#6B7280', fontFamily:'inherit', flexShrink:0,
            }}>×</button>
          </div>

          {/* COPERTI SEDUTI — modifica rapida anche da qui, stessa azione
              del tap sul dato nella card (clamp 1..posti) */}
          {tavolo.state === 'occupato' && !!tavolo.coperti && typeof onAdjustCoperti === 'function' && (() => {
            const c = tavolo.coperti;
            const maxP = tavolo.posti || c;
            const stepBtn = (enabled) => ({
              width: 30, height: 30, borderRadius: 8,
              border:'1px solid #E5E7EB', background: enabled ? '#FFFFFF' : '#FAFBFC',
              cursor: enabled ? 'pointer' : 'default',
              fontSize: 19, fontWeight: 600, color: enabled ? '#0F1115' : '#D1D5DB',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontFamily:'inherit', padding: 0,
            });
            return (
              <div style={{
                marginTop: 12, padding:'8px 12px', borderRadius: 10,
                border:'1px solid #E5E7EB', background:'#FAFBFC',
                display:'flex', alignItems:'center', gap: 10,
              }}>
                <span style={{fontSize:15.5, fontWeight:700, color:'#374151'}}>Coperti seduti</span>
                <span style={{fontSize:13.5, color:'#9CA3AF', fontWeight:500}}>max {maxP} posti</span>
                <span style={{flex:1}}/>
                <button disabled={c <= 1} onClick={() => c > 1 && onAdjustCoperti(c - 1)} style={stepBtn(c > 1)}>−</button>
                <span style={{minWidth: 24, textAlign:'center', fontSize: 17, fontWeight: 700, color:'#0F1115', fontVariantNumeric:'tabular-nums'}}>{c}</span>
                <button disabled={c >= maxP} onClick={() => c < maxP && onAdjustCoperti(c + 1)} style={stepBtn(c < maxP)}>+</button>
              </div>
            );
          })()}

          {/* SELETTORE OPERAZIONE */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, marginTop:14}}>
            {OPS.map(o => {
              const on = op === o.id;
              return (
                <button key={o.id} disabled={o.disabled}
                  onClick={() => { if (!o.disabled) setOp(o.id); }}
                  title={o.disabled ? 'Disponibile solo per tavoli uniti' : undefined}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'flex-start', gap:3,
                    padding:'10px 12px', borderRadius:10, textAlign:'left',
                    border: `1.5px solid ${on ? '#0F1115' : '#E5E7EB'}`,
                    background: on ? '#FAFBFC' : '#fff',
                    opacity: o.disabled ? 0.45 : 1,
                    cursor: o.disabled ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                    transition:'border-color 150ms ease-out, background 150ms ease-out',
                  }}
                  onMouseEnter={e => { if (!on && !o.disabled) e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={e => { if (!on && !o.disabled) e.currentTarget.style.borderColor = '#E5E7EB'; }}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:7}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={on ? '#0F1115' : '#6B7280'}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{o.icon}</svg>
                    <span style={{fontSize:16.5, fontWeight:800, color:'#0F1115'}}>{o.label}</span>
                  </span>
                  <span style={{fontSize:13.5, color:'#6B7280', fontWeight:500}}>{o.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Search — solo dove serve scegliere tra molti tavoli */}
          {op !== 'dividi' && (
            <div style={{marginTop:12, position:'relative'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{
                position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none',
              }}>
                <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={op === 'sposta' ? 'Cerca tavolo o cliente…' : 'Cerca tavolo…'}
                style={{
                  width:'100%', padding:'9px 12px 9px 34px',
                  border:'1px solid #E5E7EB', borderRadius:10,
                  fontSize:17, color:'#0F1115', outline:'none',
                  fontFamily:'inherit', background:'#fff', boxSizing:'border-box',
                }}
              />
            </div>
          )}
        </div>

        {/* CONTENUTO PER OPERAZIONE */}
        <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'12px 22px 18px'}}>
          {op === 'sposta' && (
            spostaCandidates.length === 0 ? (
              <div style={{padding:'48px 20px', textAlign:'center', color:'#9CA3AF', fontSize:17}}>
                Nessun tavolo disponibile.
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                <div style={{fontSize:14.5, fontWeight:800, color:'#6B7280', letterSpacing:0.6, textTransform:'uppercase', marginBottom:4}}>
                  Dove vuoi spostarlo?
                </div>
                {spostaCandidates.map(t => pickRow(t, spostaId === t.id, (id) => setSpostaId(cur => cur === id ? null : id)))}
              </div>
            )
          )}

          {op === 'unisci' && (
            unisciCandidates.length === 0 ? (
              <div style={{padding:'48px 20px', textAlign:'center', color:'#9CA3AF', fontSize:17}}>
                {search.trim() ? 'Nessun tavolo corrisponde alla ricerca.' : 'Nessun tavolo disponibile.'}
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                <div style={{fontSize:14.5, fontWeight:800, color:'#6B7280', letterSpacing:0.6, textTransform:'uppercase', marginBottom:4}}>
                  Quali tavoli vuoi unire a {tavLabel(tavolo)}?
                </div>
                {unisciCandidates.map(t => pickRow(t, daUnire.has(t.id), toggleUnire, `${t.posti} posti · ${stateDescription(t)}`))}
              </div>
            )
          )}

          {op === 'dividi' && (
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              <div style={{display:'flex', alignItems:'center', marginBottom:4}}>
                <div style={{flex:1, fontSize:14.5, fontWeight:800, color:'#6B7280', letterSpacing:0.6, textTransform:'uppercase'}}>
                  Quali tavoli vuoi separare?
                </div>
                <button onClick={() => setDaStaccare(daStaccare.size === merged.length ? new Set() : new Set(merged))} style={{
                  background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit',
                  fontSize:15, fontWeight:700, color:'#0F1115', textDecoration:'underline', padding:0,
                }}>
                  {daStaccare.size === merged.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
                </button>
              </div>
              {dividiCandidates.map(t => pickRow(t, daStaccare.has(t.id), toggleStacca, `${t.posti} posti · unito a Tavolo ${tavolo.id}`))}
              <div style={{fontSize:15, color:'#9CA3AF', marginTop:6, lineHeight:1.4}}>
                I tavoli separati tornano liberi e alla configurazione originale.
              </div>
            </div>
          )}
        </div>

        {/* FOOTER — azione di stato a sinistra + CTA dinamica */}
        <div style={{
          padding:'14px 22px 16px', borderTop:'1px solid #F0F2F5',
          background:'#FAFBFC', flexShrink:0,
          display:'flex', alignItems:'center', gap:10,
        }}>
          {stateAction && (
            <button onClick={stateAction.onClick} style={{
              background:'#fff', border:'1px solid #FCA5A5', borderRadius:10,
              cursor:'pointer', fontFamily:'inherit',
              fontSize:15.5, fontWeight:700, color:'#DC2626', padding:'10px 14px',
              whiteSpace:'nowrap',
              transition:'background 150ms ease-out, border-color 150ms ease-out',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#F87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
            >{stateAction.label}</button>
          )}
          <span style={{flex:1}}/>
          <button
            onClick={() => { if (!cta.disabled && cta.onClick) cta.onClick(); }}
            disabled={cta.disabled}
            style={{
              minWidth: 280, padding:'11px 18px',
              background: cta.disabled ? '#E5E7EB' : '#0F1115',
              color: cta.disabled ? '#9CA3AF' : '#fff',
              border:'none', borderRadius:10,
              fontSize:17, fontWeight:700,
              cursor: cta.disabled ? 'not-allowed' : 'pointer',
              fontFamily:'inherit',
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
              transition:'background 150ms ease-out, color 150ms ease-out',
            }}>
            {cta.label}
            {!cta.disabled && <span style={{opacity:0.7}}>→</span>}
          </button>
        </div>
      </div>
    </>
  );
}

window.SalaModificaModal = SalaModificaModal;
