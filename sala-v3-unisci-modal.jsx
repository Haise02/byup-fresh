// Sala v3 — Modal "Modifica Tavolo" (unisci + split) + Modal "Sposta tavolo"
// Accessibili dal menu 3 puntini delle card tavolo.

function SalaV3UnisciModal({ tavolo, onClose, onConfirm, onDetach, onSetCoperti }) {
  // Tavoli candidati da AGGIUNGERE all'unione (selezionati ma non ancora confermati)
  const [selected, setSelected] = React.useState(new Set());
  // Tavoli già uniti che vengono MANTENUTI (init: tutti). Deselezionare uno → verrà staccato al conferma.
  const [keptMerged, setKeptMerged] = React.useState(new Set());
  const [search, setSearch] = React.useState('');
  const [coperti, setCoperti] = React.useState(1);
  const [bypassFilter, setBypassFilter] = React.useState(new Set());

  const all = window.SALA_V3_TAVOLI || [];

  React.useEffect(() => {
    if (tavolo) {
      const preselect = window.SALA_V3_UNISCI_PRESELECT;
      if (preselect != null) {
        delete window.SALA_V3_UNISCI_PRESELECT;
        const ids = Array.isArray(preselect) ? preselect : [preselect];
        setBypassFilter(new Set(ids));
        setSelected(new Set(ids));
      } else {
        setBypassFilter(new Set());
        setSelected(new Set());
      }
      setSearch('');
      setKeptMerged(new Set(tavolo.mergedTables || []));
      setCoperti(tavolo.posti || 1);
    }
  }, [tavolo?.id]);

  if (!tavolo) return null;

  // Solo i tavoli LIBERI e DA PULIRE possono essere uniti.
  const candidates = all.filter(t => {
    if (t.id === tavolo.id) return false;
    const bypass = bypassFilter.has(t.id);
    if (!bypass && (t.state !== 'libero' && t.state !== 'dapulire')) return false;
    if (!bypass && t.mergedWith) return false;
    if (!bypass && t.mergedTables && t.mergedTables.length > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const inId = String(t.id).includes(q);
      const inName = (t.nextReservation?.name || '').toLowerCase().includes(q);
      if (!inId && !inName) return false;
    }
    return true;
  });

  const isMerged = !!(tavolo.mergedTables && tavolo.mergedTables.length > 0);
  const toDetach = isMerged ? (tavolo.mergedTables || []).filter(id => !keptMerged.has(id)) : [];
  const toAdd = Array.from(selected);
  const keptMergedTavoli = all.filter(t => keptMerged.has(t.id));
  const addTavoli = all.filter(t => selected.has(t.id));

  // Posti totali = posti(source) + posti(merged mantenuti) + posti(nuovi da aggiungere)
  const totalPosti = (tavolo.posti || 0)
    + keptMergedTavoli.reduce((s, t) => s + (t.posti || 0), 0)
    + addTavoli.reduce((s, t) => s + (t.posti || 0), 0);
  const clampedCoperti = Math.min(20, Math.max(1, coperti));

  const unionLabels = [
    `Tav.${tavolo.id}`,
    ...keptMergedTavoli.map(t => `Tav.${t.id}`),
    ...addTavoli.map(t => `Tav.${t.id}`),
  ];
  const summaryLabel = unionLabels.join(' + ');

  // Almeno 1 tavolo selezionato per chiudere — il source è sempre presente quindi vero.
  const canConfirm = true;

  function toggleAdd(id) {
    setSelected(s => {
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id); else ns.add(id);
      return ns;
    });
  }
  function toggleKept(id) {
    setKeptMerged(s => {
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id); else ns.add(id);
      return ns;
    });
  }

  function handleConfirm() {
    if (!canConfirm) return;
    // 1) Stacca i tavoli deselezionati
    if (toDetach.length > 0 && onDetach) {
      toDetach.forEach(id => onDetach(tavolo, id));
    }
    // 2) Aggiungi i nuovi tavoli
    if (toAdd.length > 0 && onConfirm) {
      onConfirm(tavolo, toAdd);
    }
    // 3) Aggiorna posti (capacità massima) se cambiato
    if (onSetCoperti && clampedCoperti !== (tavolo.posti || 1)) {
      onSetCoperti(tavolo, clampedCoperti);
    }
    onClose && onClose();
  }

  return (
    <>
      <div onClick={onClose} style={{
        position:'absolute', inset:0, background:'rgba(15,17,21,0.55)', zIndex:60,
      }}/>
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width: 620, maxWidth:'94%', height: 600, maxHeight:'92%',
        background:'#fff', borderRadius: 16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex: 61, display:'flex', flexDirection:'column', overflow:'hidden',
        fontFamily:'inherit',
      }}>
        {/* HEADER */}
        <div style={{
          padding:'18px 22px 14px', borderBottom:'1px solid #F0F2F5', flexShrink:0,
        }}>
          <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:18, fontWeight:800, color:'#0F1115', letterSpacing:'-0.02em'}}>
                Modifica Tav.{[tavolo.id, ...(tavolo.mergedTables || [])].sort((a, b) => a - b).join('-')}
              </div>
              <div style={{fontSize:13, color:'#6B7280', marginTop:4}}>
                Unisci o separa tavoli, e personalizza i coperti
              </div>
            </div>
            <button onClick={onClose} aria-label="Chiudi" style={{
              width:32, height:32, borderRadius:8,
              background:'#F1F2F5', border:'none', cursor:'pointer',
              fontSize:18, color:'#6B7280', fontFamily:'inherit',
              flexShrink:0,
            }}>×</button>
          </div>

          {/* Search */}
          <div style={{marginTop:14, position:'relative'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{
              position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none',
            }}>
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca tavolo…"
              style={{
                width:'100%', padding:'9px 12px 9px 34px',
                border:'1px solid #E5E7EB', borderRadius:10,
                fontSize:13, color:'#0F1115', outline:'none',
                fontFamily:'inherit', background:'#fff',
                boxSizing:'border-box',
              }}
            />
          </div>
        </div>

        {/* SEZIONE COMPOSIZIONE — sempre visibile, mostra source + merged toggleabili */}
        <div style={{
          padding:'14px 22px 0',
          flexShrink:0,
        }}>
          <div style={{
            fontSize:10.5, fontWeight:800, color:'#6B7280',
            letterSpacing:0.6, textTransform:'uppercase', marginBottom:8,
          }}>
            Composto da
          </div>
          <div style={{
            display:'flex', flexWrap:'wrap', gap:8,
            padding:'10px 12px', borderRadius:10,
            background:'#FFF7ED', border:'1px solid #FED7AA',
          }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'5px 10px', borderRadius:8,
              background:'#fff', border:'1px solid #FDBA74',
              fontSize:12, fontWeight:700, color:'#9A3412',
            }}>
              Tav.{tavolo.id}
              <span style={{fontSize:10, color:'#9A3412', opacity:0.7, fontWeight:600}}>principale</span>
            </div>
            {(tavolo.mergedTables || []).map(id => {
              const kept = keptMerged.has(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleKept(id)}
                  title={kept ? 'Clicca per rimuoverlo dall\'unione' : 'Clicca per ripristinarlo nell\'unione'}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:6,
                    padding:'5px 6px 5px 10px', borderRadius:8,
                    background: kept ? '#fff' : '#F1F2F5',
                    border: kept ? '1px solid #FDBA74' : '1px dashed #9CA3AF',
                    fontSize:12, fontWeight:700,
                    color: kept ? '#9A3412' : '#6B7280',
                    textDecoration: kept ? 'none' : 'line-through',
                    cursor:'pointer', fontFamily:'inherit',
                    transition:'background 120ms, border-color 120ms, color 120ms',
                  }}>
                  Tav.{id}
                  <span style={{
                    width:18, height:18, borderRadius:'50%',
                    background: kept ? '#FED7AA' : 'transparent',
                    color: kept ? '#9A3412' : '#9CA3AF',
                    fontSize:13, fontWeight:800, lineHeight:1,
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                    textDecoration:'none',
                  }}>×</span>
                </button>
              );
            })}
            {addTavoli.map(t => (
              <button
                key={`add-${t.id}`}
                onClick={() => toggleAdd(t.id)}
                title="Clicca per togliere dall'unione"
                style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  padding:'5px 6px 5px 10px', borderRadius:8,
                  background:'#fff', border:'1px solid #16A34A',
                  fontSize:12, fontWeight:700, color:'#15803D',
                  cursor:'pointer', fontFamily:'inherit',
                }}>
                Tav.{t.id}
                <span style={{
                  width:18, height:18, borderRadius:'50%',
                  background:'#DCFCE7', color:'#15803D',
                  fontSize:13, fontWeight:800, lineHeight:1,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                }}>×</span>
              </button>
            ))}
          </div>
        </div>

        {/* TITOLO sezione aggiungi */}
        <div style={{
          padding:'14px 22px 8px', flexShrink:0,
          fontSize:10.5, fontWeight:800, color:'#6B7280',
          letterSpacing:0.6, textTransform:'uppercase',
        }}>
          Aggiungi tavoli
        </div>

        {/* GRIGLIA TAVOLI */}
        <div className="pn-scroll" style={{
          flex:1, overflow:'auto', padding:'0 22px 18px',
        }}>
          {candidates.length === 0 ? (
            <div style={{
              padding:'48px 20px', textAlign:'center', color:'#9CA3AF', fontSize:13,
            }}>
              {search.trim() ? 'Nessun tavolo corrisponde alla ricerca.' : 'Nessun tavolo libero o da pulire disponibile.'}
            </div>
          ) : (
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10,
            }}>
              {candidates.map(t => {
                const isSelected = selected.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleAdd(t.id)}
                    style={{
                      position:'relative',
                      padding:'14px 12px',
                      background: isSelected ? '#FFF5F5' : '#fff',
                      border: `1.5px solid ${isSelected ? '#E04347' : '#E5E7EB'}`,
                      borderRadius:10,
                      cursor:'pointer', fontFamily:'inherit',
                      textAlign:'left',
                      transition:'background 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out',
                      boxShadow: isSelected ? '0 4px 12px rgba(224,67,71,0.12)' : 'none',
                      display:'flex', flexDirection:'column', gap:6,
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#D1D5DB'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  >
                    {isSelected && (
                      <div style={{
                        position:'absolute', top:8, right:8,
                        width:20, height:20, borderRadius:'50%',
                        background:'#E04347', color:'#fff',
                        display:'grid', placeItems:'center',
                        boxShadow:'0 1px 3px rgba(224,67,71,0.3)',
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13 L9 17 L19 7"/>
                        </svg>
                      </div>
                    )}
                    <div style={{fontSize:16, fontWeight:800, color:'#0F1115', letterSpacing:'-0.01em', paddingRight:24}}>
                      Tav.{t.id}
                    </div>
                    <div style={{fontSize:11.5, color:'#6B7280', fontWeight:500}}>
                      {t.posti} posti
                    </div>
                    {t.state === 'dapulire' && (
                      <div style={{
                        marginTop:2, fontSize:10, fontWeight:700,
                        color:'#374151', background:'#F3F4F6',
                        padding:'3px 7px', borderRadius:4,
                        alignSelf:'flex-start',
                        letterSpacing:0.2,
                      }}>Da pulire</div>
                    )}
                    {t.state === 'libero' && t.nextReservation && t.nextReservation.time && (
                      <div style={{
                        marginTop:2, fontSize:10, fontWeight:700,
                        color:'#92400E', background:'#FEF3C7',
                        padding:'3px 7px', borderRadius:4,
                        alignSelf:'flex-start',
                        letterSpacing:0.2,
                      }}>
                        Prenotato alle {t.nextReservation.time}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COPERTI STEPPER — sotto l'aggiunta tavoli */}
        <div style={{padding:'0 22px 14px', flexShrink:0}}>
          <div style={{
            fontSize:10.5, fontWeight:800, color:'#6B7280',
            letterSpacing:0.6, textTransform:'uppercase', marginBottom:8,
          }}>
            Capacità massima
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'10px 14px', borderRadius:10,
            background:'#FAFBFC', border:'1px solid #E5E7EB',
          }}>
            <button
              onClick={() => setCoperti(c => Math.max(1, c - 1))}
              disabled={clampedCoperti <= 1}
              style={{
                width:32, height:32, borderRadius:8,
                border:'1px solid #E5E7EB',
                background: clampedCoperti <= 1 ? '#F4F5F7' : '#fff',
                color: clampedCoperti <= 1 ? '#D1D5DB' : '#0F1115',
                fontSize:18, fontWeight:700,
                cursor: clampedCoperti <= 1 ? 'default' : 'pointer',
                fontFamily:'inherit',
                display:'grid', placeItems:'center',
              }}>−</button>
            <div style={{
              minWidth:40, textAlign:'center',
              fontSize:20, fontWeight:800, color:'#0F1115',
              fontVariantNumeric:'tabular-nums',
            }}>{clampedCoperti}</div>
            <button
              onClick={() => setCoperti(c => Math.min(20, c + 1))}
              disabled={clampedCoperti >= 20}
              style={{
                width:32, height:32, borderRadius:8,
                border:'1px solid #E5E7EB',
                background: clampedCoperti >= 20 ? '#F4F5F7' : '#fff',
                color: clampedCoperti >= 20 ? '#D1D5DB' : '#0F1115',
                fontSize:18, fontWeight:700,
                cursor: clampedCoperti >= 20 ? 'default' : 'pointer',
                fontFamily:'inherit',
                display:'grid', placeItems:'center',
              }}>+</button>
          </div>
        </div>

        {/* BANNER RIEPILOGATIVO + CTA */}
        <div style={{
          padding:'14px 22px 16px', borderTop:'1px solid #F0F2F5',
          background:'#FAFBFC', flexShrink:0,
        }}>
          <div style={{
            padding:'10px 12px', borderRadius:8,
            background:'#fff', border:'1px solid #E5E7EB',
            display:'flex', alignItems:'center', gap:6,
            fontSize:13, fontWeight:700, color:'#0F1115',
            flexWrap:'wrap',
          }}>
            <span style={{fontVariantNumeric:'tabular-nums'}}>{summaryLabel}</span>
            <span style={{color:'#9CA3AF', margin:'0 4px'}}>→</span>
            <span style={{fontVariantNumeric:'tabular-nums'}}>{clampedCoperti} posti</span>
          </div>
          <div style={{fontSize:11, color:'#9CA3AF', margin:'8px 2px 12px', lineHeight:1.4}}>
            I tavoli torneranno alla configurazione originale quando vengono liberati.
          </div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={onClose} style={{
              flex:1, padding:'11px 14px',
              background:'#fff', color:'#0F1115',
              border:'1px solid #E5E7EB', borderRadius:10,
              fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>Annulla</button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                flex:1, padding:'11px 14px',
                background: canConfirm ? '#0F1115' : '#E5E7EB',
                color: canConfirm ? '#fff' : '#9CA3AF',
                border:'none', borderRadius:10,
                fontSize:13, fontWeight:700,
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                transition:'background 150ms ease-out, color 150ms ease-out',
              }}>
              Conferma
              <span style={{opacity:0.7}}>→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SalaV3CopertiModal({ tavolo, onClose, onSave }) {
  const initial = tavolo?.coperti || tavolo?.posti || 1;
  const [coperti, setCoperti] = React.useState(initial);

  React.useEffect(() => {
    if (tavolo) setCoperti(tavolo.coperti || tavolo.posti || 1);
  }, [tavolo?.id]);

  if (!tavolo) return null;

  const maxPosti = tavolo.posti || 20;

  return (
    <>
      <div onClick={onClose} style={{
        position:'absolute', inset:0, background:'rgba(15,17,21,0.45)', zIndex:60,
      }}/>
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width: 360, background:'#fff', borderRadius:16,
        boxShadow:'0 20px 60px rgba(0,0,0,0.22)',
        zIndex:61, padding:'22px 22px 18px',
        fontFamily:'inherit',
      }}>
        <div style={{fontSize:17, fontWeight:800, color:'#0F1115', marginBottom:6, letterSpacing:'-0.02em'}}>
          Modifica coperti — Tav.{tavolo.id}
        </div>
        <div style={{fontSize:12, color:'#9CA3AF', marginBottom:18}}>
          Capacità tavolo: {maxPosti} posti
        </div>

        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:16,
          padding:'16px 0', marginBottom:18,
          background:'#FAFBFC', borderRadius:12,
        }}>
          <button
            onClick={() => setCoperti(c => Math.max(1, c - 1))}
            disabled={coperti <= 1}
            style={{
              width:44, height:44, borderRadius:10,
              border:'1px solid #E5E7EB',
              background: coperti <= 1 ? '#F4F5F7' : '#fff',
              color: coperti <= 1 ? '#D1D5DB' : '#0F1115',
              fontSize:22, fontWeight:700,
              cursor: coperti <= 1 ? 'default' : 'pointer',
              fontFamily:'inherit',
              display:'grid', placeItems:'center',
            }}>−</button>
          <div style={{
            minWidth:64, textAlign:'center',
            fontSize:34, fontWeight:800, color:'#0F1115',
            fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1,
          }}>
            {coperti}
          </div>
          <button
            onClick={() => setCoperti(c => Math.min(maxPosti, c + 1))}
            disabled={coperti >= maxPosti}
            style={{
              width:44, height:44, borderRadius:10,
              border:'1px solid #E5E7EB',
              background: coperti >= maxPosti ? '#F4F5F7' : '#fff',
              color: coperti >= maxPosti ? '#D1D5DB' : '#0F1115',
              fontSize:22, fontWeight:700,
              cursor: coperti >= maxPosti ? 'default' : 'pointer',
              fontFamily:'inherit',
              display:'grid', placeItems:'center',
            }}>+</button>
        </div>

        <div style={{display:'flex', gap:8}}>
          <button onClick={onClose} style={{
            flex:1, padding:'11px 14px',
            background:'#fff', color:'#0F1115',
            border:'1px solid #E5E7EB', borderRadius:10,
            fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
          }}>Annulla</button>
          <button onClick={() => onSave && onSave(coperti)} style={{
            flex:1, padding:'11px 14px',
            background:'#0F1115', color:'#fff', border:'none',
            borderRadius:10, fontSize:13, fontWeight:700,
            cursor:'pointer', fontFamily:'inherit',
          }}>Salva</button>
        </div>
      </div>
    </>
  );
}

function SalaV3SpostaModal({ tavolo, onClose, onConfirm }) {
  const [selectedId, setSelectedId] = React.useState(null);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (tavolo) {
      setSelectedId(null);
      setSearch('');
    }
  }, [tavolo?.id]);

  if (!tavolo) return null;

  const all = window.SALA_V3_TAVOLI || [];
  // Tutti gli altri tavoli "principali" (non uniti come secondari)
  const candidates = all.filter(t => {
    if (t.id === tavolo.id) return false;
    if (t.mergedWith) return false; // i tavoli uniti come secondari non sono target validi
    if (search.trim()) {
      const q = search.toLowerCase();
      const inId = String(t.id).includes(q);
      const inParty = (t.party || '').toLowerCase().includes(q);
      const inNext = (t.nextReservation?.name || '').toLowerCase().includes(q);
      if (!inId && !inParty && !inNext) return false;
    }
    return true;
  });

  const target = selectedId != null ? all.find(t => t.id === selectedId) : null;

  function tavLabel(t) {
    return `Tav.${[t.id, ...(t.mergedTables || [])].sort((a, b) => a - b).join('-')}`;
  }

  function stateDescription(t) {
    if (t.state === 'libero') return t.nextReservation ? `Libero · prenotazione alle ${t.nextReservation.time}` : 'Libero';
    if (t.state === 'prenotato') return `Prenotato · ${t.nextReservation?.time || ''}`;
    if (t.state === 'occupato') return t.party ? `Occupato · ${t.party}` : 'Occupato';
    if (t.state === 'dapulire') return 'Da pulire';
    return t.state;
  }

  function handleConfirm() {
    if (selectedId == null) return;
    onConfirm && onConfirm(tavolo, selectedId);
  }

  return (
    <>
      <div onClick={onClose} style={{
        position:'absolute', inset:0, background:'rgba(15,17,21,0.55)', zIndex:60,
      }}/>
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width: 580, maxWidth:'94%', height: 580, maxHeight:'92%',
        background:'#fff', borderRadius: 16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex: 61, display:'flex', flexDirection:'column', overflow:'hidden',
        fontFamily:'inherit',
      }}>
        {/* HEADER */}
        <div style={{padding:'18px 22px 14px', borderBottom:'1px solid #F0F2F5', flexShrink:0}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:18, fontWeight:800, color:'#0F1115', letterSpacing:'-0.02em'}}>
                Sposta {tavLabel(tavolo)}
              </div>
              <div style={{fontSize:13, color:'#6B7280', marginTop:4}}>
                Scegli il tavolo con cui scambiare {tavolo.party ? `"${tavolo.party}"` : 'i dati'}
              </div>
            </div>
            <button onClick={onClose} aria-label="Chiudi" style={{
              width:32, height:32, borderRadius:8,
              background:'#F1F2F5', border:'none', cursor:'pointer',
              fontSize:18, color:'#6B7280', fontFamily:'inherit', flexShrink:0,
            }}>×</button>
          </div>

          {/* Search */}
          <div style={{marginTop:14, position:'relative'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{
              position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none',
            }}>
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca tavolo o cliente…"
              style={{
                width:'100%', padding:'9px 12px 9px 34px',
                border:'1px solid #E5E7EB', borderRadius:10,
                fontSize:13, color:'#0F1115', outline:'none',
                fontFamily:'inherit', background:'#fff', boxSizing:'border-box',
              }}
            />
          </div>
        </div>

        {/* LISTA TAVOLI — singola selezione */}
        <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'12px 22px 18px'}}>
          {candidates.length === 0 ? (
            <div style={{padding:'48px 20px', textAlign:'center', color:'#9CA3AF', fontSize:13}}>
              Nessun tavolo disponibile.
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {candidates.map(t => {
                const isSelected = selectedId === t.id;
                const meta = window.SALA_V3_STATE_META?.[t.state] || {dot:'#9CA3AF'};
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding:'10px 12px', borderRadius:10,
                      background: isSelected ? '#FFF5F5' : '#fff',
                      border: `1.5px solid ${isSelected ? '#E04347' : '#E5E7EB'}`,
                      cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                      transition:'background 150ms ease-out, border-color 150ms ease-out',
                    }}
                  >
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: meta.dot, flexShrink: 0,
                    }}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:14, fontWeight:800, color:'#0F1115'}}>{tavLabel(t)}</div>
                      <div style={{fontSize:11.5, color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                        {stateDescription(t)}
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{
                        width:18, height:18, borderRadius:'50%',
                        background:'#E04347', color:'#fff',
                        display:'grid', placeItems:'center', flexShrink: 0,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13 L9 17 L19 7"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SUMMARY + CTA */}
        <div style={{padding:'14px 22px 16px', borderTop:'1px solid #F0F2F5', background:'#FAFBFC', flexShrink:0}}>
          {target && (
            <div style={{
              padding:'10px 12px', borderRadius:8,
              background:'#fff', border:'1px solid #E5E7EB',
              fontSize:13, fontWeight:700, color:'#0F1115', marginBottom:10,
              display:'flex', alignItems:'center', gap:6, flexWrap:'wrap',
            }}>
              <span>{tavLabel(tavolo)}</span>
              <span style={{color:'#9CA3AF'}}>↔</span>
              <span>{tavLabel(target)}</span>
            </div>
          )}
          <div style={{display:'flex', gap:8}}>
            <button onClick={onClose} style={{
              flex:1, padding:'11px 14px',
              background:'#fff', color:'#0F1115',
              border:'1px solid #E5E7EB', borderRadius:10,
              fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>Annulla</button>
            <button
              onClick={handleConfirm}
              disabled={selectedId == null}
              style={{
                flex:1, padding:'11px 14px',
                background: selectedId == null ? '#E5E7EB' : '#0F1115',
                color: selectedId == null ? '#9CA3AF' : '#fff',
                border:'none', borderRadius:10,
                fontSize:13, fontWeight:700,
                cursor: selectedId == null ? 'not-allowed' : 'pointer',
                fontFamily:'inherit',
              }}>Sposta</button>
          </div>
        </div>
      </div>
    </>
  );
}

window.SalaV3UnisciModal = SalaV3UnisciModal;
window.SalaV3CopertiModal = SalaV3CopertiModal;
window.SalaV3SpostaModal = SalaV3SpostaModal;
