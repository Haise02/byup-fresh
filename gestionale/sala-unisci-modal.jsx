// Sala — Modali tavolo:
// - SalaModificaModal: hub unico Sposta / Dividi / Unisci con CTA dinamica,
//   aperta dal pulsante "Modifica" della card tavolo.
// - SalaUnisciModal / SalaSpostaModal: modali legacy ancora usate dai flussi
//   della mappa (drag-merge, preselezione).

function SalaUnisciModal({ tavolo, onClose, onConfirm, onDetach, onSetCoperti }) {
  // Tavoli candidati da AGGIUNGERE all'unione (selezionati ma non ancora confermati)
  const [selected, setSelected] = React.useState(new Set());
  // Tavoli già uniti che vengono MANTENUTI (init: tutti). Deselezionare uno → verrà staccato al conferma.
  const [keptMerged, setKeptMerged] = React.useState(new Set());
  const [search, setSearch] = React.useState('');
  const [coperti, setCoperti] = React.useState(1);
  const [bypassFilter, setBypassFilter] = React.useState(new Set());

  const all = window.SALA_TAVOLI || [];

  React.useEffect(() => {
    if (tavolo) {
      const preselect = window.SALA_UNISCI_PRESELECT;
      if (preselect != null) {
        delete window.SALA_UNISCI_PRESELECT;
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
    `Tavolo ${tavolo.id}`,
    ...keptMergedTavoli.map(t => `Tavolo ${t.id}`),
    ...addTavoli.map(t => `Tavolo ${t.id}`),
  ];
  const summaryLabel = unionLabels.join(' + ');

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
              <div style={{fontSize:22, fontWeight:800, color:'#0F1115', letterSpacing:'-0.02em'}}>
                Modifica Tavolo {[tavolo.id, ...(tavolo.mergedTables || [])].sort((a, b) => a - b).join('-')}
              </div>
              <div style={{fontSize:17, color:'#6B7280', marginTop:4}}>
                Unisci o separa tavoli, e personalizza i coperti
              </div>
            </div>
            <button onClick={onClose} aria-label="Chiudi" style={{
              width:32, height:32, borderRadius:8,
              background:'#F1F2F5', border:'none', cursor:'pointer',
              fontSize:22, color:'#6B7280', fontFamily:'inherit',
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
                fontSize:17, color:'#0F1115', outline:'none',
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
            fontSize:14.5, fontWeight:800, color:'#6B7280',
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
              fontSize:16, fontWeight:700, color:'#9A3412',
            }}>
              Tavolo {tavolo.id}
              <span style={{fontSize:14, color:'#9A3412', opacity:0.7, fontWeight:600}}>principale</span>
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
                    fontSize:16, fontWeight:700,
                    color: kept ? '#9A3412' : '#6B7280',
                    textDecoration: kept ? 'none' : 'line-through',
                    cursor:'pointer', fontFamily:'inherit',
                    transition:'background 120ms, border-color 120ms, color 120ms',
                  }}>
                  Tavolo {id}
                  <span style={{
                    width:18, height:18, borderRadius:'50%',
                    background: kept ? '#FED7AA' : 'transparent',
                    color: kept ? '#9A3412' : '#9CA3AF',
                    fontSize:17, fontWeight:800, lineHeight:1,
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
                  fontSize:16, fontWeight:700, color:'#15803D',
                  cursor:'pointer', fontFamily:'inherit',
                }}>
                Tavolo {t.id}
                <span style={{
                  width:18, height:18, borderRadius:'50%',
                  background:'#DCFCE7', color:'#15803D',
                  fontSize:17, fontWeight:800, lineHeight:1,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                }}>×</span>
              </button>
            ))}
          </div>
        </div>

        {/* TITOLO sezione aggiungi */}
        <div style={{
          padding:'14px 22px 8px', flexShrink:0,
          fontSize:14.5, fontWeight:800, color:'#6B7280',
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
              padding:'48px 20px', textAlign:'center', color:'#9CA3AF', fontSize:17,
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
                    <div style={{fontSize:20, fontWeight:800, color:'#0F1115', letterSpacing:'-0.01em', paddingRight:24}}>
                      Tavolo {t.id}
                    </div>
                    <div style={{fontSize:15.5, color:'#6B7280', fontWeight:500}}>
                      {t.posti} posti
                    </div>
                    {t.state === 'dapulire' && (
                      <div style={{
                        marginTop:2, fontSize:14, fontWeight:700,
                        color:'#374151', background:'#F3F4F6',
                        padding:'3px 7px', borderRadius:4,
                        alignSelf:'flex-start',
                        letterSpacing:0.2,
                      }}>Da pulire</div>
                    )}
                    {t.state === 'libero' && t.nextReservation && t.nextReservation.time && (
                      <div style={{
                        marginTop:2, fontSize:14, fontWeight:700,
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
            fontSize:14.5, fontWeight:800, color:'#6B7280',
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
                fontSize:22, fontWeight:700,
                cursor: clampedCoperti <= 1 ? 'default' : 'pointer',
                fontFamily:'inherit',
                display:'grid', placeItems:'center',
              }}>−</button>
            <div style={{
              minWidth:40, textAlign:'center',
              fontSize:24, fontWeight:800, color:'#0F1115',
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
                fontSize:22, fontWeight:700,
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
            fontSize:17, fontWeight:700, color:'#0F1115',
            flexWrap:'wrap',
          }}>
            <span style={{fontVariantNumeric:'tabular-nums'}}>{summaryLabel}</span>
            <span style={{color:'#9CA3AF', margin:'0 4px'}}>→</span>
            <span style={{fontVariantNumeric:'tabular-nums'}}>{clampedCoperti} posti</span>
          </div>
          <div style={{fontSize:15, color:'#9CA3AF', margin:'8px 2px 12px', lineHeight:1.4}}>
            I tavoli torneranno alla configurazione originale quando vengono liberati.
          </div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={onClose} style={{
              flex:1, padding:'11px 14px',
              background:'#fff', color:'#0F1115',
              border:'1px solid #E5E7EB', borderRadius:10,
              fontSize:17, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>Annulla</button>
            <button
              onClick={handleConfirm}
              style={{
                flex:1, padding:'11px 14px',
                background:'#0F1115', color:'#fff',
                border:'none', borderRadius:10,
                fontSize:17, fontWeight:700,
                cursor:'pointer', fontFamily:'inherit',
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

function SalaSpostaModal({ tavolo, onClose, onConfirm }) {
  const [selectedId, setSelectedId] = React.useState(null);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (tavolo) {
      setSelectedId(null);
      setSearch('');
    }
  }, [tavolo?.id]);

  if (!tavolo) return null;

  const all = window.SALA_TAVOLI || [];
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
    return `Tavolo ${[t.id, ...(t.mergedTables || [])].sort((a, b) => a - b).join('-')}`;
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
              <div style={{fontSize:22, fontWeight:800, color:'#0F1115', letterSpacing:'-0.02em'}}>
                Sposta {tavLabel(tavolo)}
              </div>
              <div style={{fontSize:17, color:'#6B7280', marginTop:4}}>
                Scegli il tavolo con cui scambiare {tavolo.party ? `"${tavolo.party}"` : 'i dati'}
              </div>
            </div>
            <button onClick={onClose} aria-label="Chiudi" style={{
              width:32, height:32, borderRadius:8,
              background:'#F1F2F5', border:'none', cursor:'pointer',
              fontSize:22, color:'#6B7280', fontFamily:'inherit', flexShrink:0,
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
                fontSize:17, color:'#0F1115', outline:'none',
                fontFamily:'inherit', background:'#fff', boxSizing:'border-box',
              }}
            />
          </div>
        </div>

        {/* LISTA TAVOLI — singola selezione */}
        <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'12px 22px 18px'}}>
          {candidates.length === 0 ? (
            <div style={{padding:'48px 20px', textAlign:'center', color:'#9CA3AF', fontSize:17}}>
              Nessun tavolo disponibile.
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {candidates.map(t => {
                const isSelected = selectedId === t.id;
                const meta = window.SALA_STATE_META?.[t.state] || {dot:'#9CA3AF'};
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
                      <div style={{fontSize:18, fontWeight:800, color:'#0F1115'}}>{tavLabel(t)}</div>
                      <div style={{fontSize:15.5, color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
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
              fontSize:17, fontWeight:700, color:'#0F1115', marginBottom:10,
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
              fontSize:17, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>Annulla</button>
            <button
              onClick={handleConfirm}
              disabled={selectedId == null}
              style={{
                flex:1, padding:'11px 14px',
                background: selectedId == null ? '#E5E7EB' : '#0F1115',
                color: selectedId == null ? '#9CA3AF' : '#fff',
                border:'none', borderRadius:10,
                fontSize:17, fontWeight:700,
                cursor: selectedId == null ? 'not-allowed' : 'pointer',
                fontFamily:'inherit',
              }}>Sposta</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SalaModificaModal — hub unico per le operazioni sul tavolo.
// Tre operazioni selezionabili in alto (Sposta / Dividi / Unisci); il contenuto
// e la CTA in basso cambiano dinamicamente con l'operazione e la selezione.
function SalaModificaModal({ tavolo, onClose, onSposta, onUnisciConfirm, onDetach, onLibera, onNoShow }) {
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
  const unisciCandidates = all.filter(t =>
    t.id !== tavolo.id
    && (t.state === 'libero' || t.state === 'dapulire')
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
                {search.trim() ? 'Nessun tavolo corrisponde alla ricerca.' : 'Nessun tavolo libero o da pulire disponibile.'}
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

window.SalaUnisciModal = SalaUnisciModal;
window.SalaSpostaModal = SalaSpostaModal;
window.SalaModificaModal = SalaModificaModal;
