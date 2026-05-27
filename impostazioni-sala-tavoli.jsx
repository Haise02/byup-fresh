// Impostazioni → Sala e tavoli (v4: undo, dialog conferma, sort numerico, skeleton, AI import, touch)

// Sort numerico-aware: "Tavolo 2" prima di "Tavolo 10"
function naturalCompare(a, b) {
  return String(a).localeCompare(String(b), 'it', { numeric: true, sensitivity: 'base' });
}

const TAVOLI_INIT = Array.from({length: 8}).map((_, i) => ({
  id: i + 1,
  name: `Tavolo ${i+1}`,
  alias: '',
  coperti: [2,4,2,6,4,2,4,8][i],
  disabled: i === 1, // tavolo 2 disattivato
  shape: ['round','square','rect','round','square','round','rect','rect'][i],
  pos: [
    {x:1.5,y:1},{x:3.5,y:1},{x:5.5,y:1},{x:7.5,y:1},
    {x:1.5,y:3.5},{x:3.5,y:3.5},{x:5.5,y:3.5},{x:7.5,y:3.5},
  ][i],
}));

const FURNITURE_INIT = [
  { id: 'f1', label: 'Cucina', x: 0.3, y: 4.5, w: 2, h: 1.3, color: '#7c2436', kind: 'furniture' },
  { id: 'f2', label: 'Bagno', x: 8, y: 4.5, w: 1.5, h: 1.2, color: '#85B8CB', kind: 'furniture' },
  { id: 'f3', label: 'Bar', x: 3.5, y: 4.7, w: 2.5, h: 0.8, color: '#8B5A3C', kind: 'furniture' },
];

const SHAPES = [
  { id: 'round', label: 'Tondo', icon: '○' },
  { id: 'square', label: 'Quadrato', icon: '☐' },
  { id: 'rect', label: 'Rettangolare', icon: '▭' },
];

function TavoloShape({ shape, size = 36, active = true, coperti }) {
  const fill = active ? PN.PINK_SOFT : '#F4F5F7';
  const border = active ? PN.PINK : PN.BORDER;
  const text = active ? PN.PINK_DARK : PN.MUTED;
  const common = { background: fill, border: `2px solid ${border}`, color: text, display:'grid', placeItems:'center', fontSize: 11, fontWeight: 800 };
  if (shape === 'round') return <div style={{...common, width: size, height: size, borderRadius: '50%'}}>{coperti}</div>;
  if (shape === 'rect') return <div style={{...common, width: size * 1.5, height: size * 0.7, borderRadius: 6}}>{coperti}</div>;
  return <div style={{...common, width: size, height: size, borderRadius: 6}}>{coperti}</div>;
}
window.TavoloShape = TavoloShape;

function ImpSalaTavoli() {
  const [sale, setSale] = React.useState([
    {id:1, name:'Sala principale', active: true, tavoli: TAVOLI_INIT, furniture: FURNITURE_INIT, groups: []},
    {id:2, name:'Saletta riservata', active: false, tavoli: [], furniture: [], groups: []},
    {id:3, name:'Terrazza estiva', active: false, tavoli: [], furniture: [], groups: []},
  ]);
  const [activeId, setActiveId] = React.useState(1);
  const [editSala, setEditSala] = React.useState(null); // {id?, name, active} per nuova/edit
  const [salaMenu, setSalaMenu] = React.useState(null);
  const [view, setView] = React.useState('lista');
  const [selected, setSelected] = React.useState(new Set());
  const [qrModal, setQrModal] = React.useState(null);
  const [creatingTable, setCreatingTable] = React.useState(null); // tavolo appena creato (popover)
  const [editingTable, setEditingTable] = React.useState(null);
  const [openMenu, setOpenMenu] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [filterStato, setFilterStato] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('name');
  const [toast, setToast] = React.useState(null); // { msg, undo }
  const [confirmDialog, setConfirmDialog] = React.useState(null); // { title, msg, danger, onConfirm }
  const [importModal, setImportModal] = React.useState(false);
  const [isLoadingSala, setIsLoadingSala] = React.useState(false);

  const active = sale.find(s => s.id === activeId);
  const tavoli = active?.tavoli || [];
  const furniture = active?.furniture || [];
  const groups = active?.groups || [];

  // helpers per aggiornare la sala attiva
  const patchActive = React.useCallback((patch) => {
    setSale(prev => prev.map(s => s.id === activeId ? {...s, ...(typeof patch === 'function' ? patch(s) : patch)} : s));
  }, [activeId]);
  const setTavoli = (updater) => patchActive(s => ({ tavoli: typeof updater === 'function' ? updater(s.tavoli) : updater }));
  const setFurniture = (updater) => patchActive(s => ({ furniture: typeof updater === 'function' ? updater(s.furniture) : updater }));
  const setGroups = (updater) => patchActive(s => ({ groups: typeof updater === 'function' ? updater(s.groups) : updater }));

  // Skeleton al cambio sala
  const switchSala = (id) => {
    if (id === activeId) return;
    setIsLoadingSala(true);
    setActiveId(id);
    setSelected(new Set());
    setSearch('');
    setFilterStato('all');
    setTimeout(() => setIsLoadingSala(false), 350);
  };

  // Toast con undo (auto-dismiss 5s)
  const showToast = (msg, undo) => {
    setToast({ msg, undo, id: Date.now() });
  };
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast?.id]);

  // Esc chiude menù e dialog
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setSalaMenu(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    if (openMenu === null) return;
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenu]);

  React.useEffect(() => {
    if (salaMenu === null) return;
    const close = () => setSalaMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [salaMenu]);

  const toggleSelect = (id) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  // Validazione nome duplicato
  const isNameDup = (name, excludeId) => tavoli.some(t => t.id !== excludeId && t.name.trim().toLowerCase() === name.trim().toLowerCase());

  const updateTavolo = (id, patch) => setTavoli(prev => prev.map(t => t.id === id ? {...t, ...patch} : t));

  const deleteTavolo = (id) => {
    const t = tavoli.find(x => x.id === id);
    if (!t) return;
    const snapshot = { tavoli: [...tavoli], groups: [...groups] };
    setTavoli(prev => prev.filter(x => x.id !== id));
    setGroups(prev => prev.map(g => ({...g, tableIds: g.tableIds.filter(x => x !== id)})).filter(g => g.tableIds.length > 1));
    showToast(`"${t.name}" eliminato`, () => {
      setTavoli(snapshot.tavoli);
      setGroups(snapshot.groups);
    });
  };

  const duplicaTavolo = (id) => {
    const t = tavoli.find(x => x.id === id);
    const newId = Math.max(0, ...tavoli.map(x => x.id)) + 1;
    // Trova nome unico
    let baseName = `Tavolo ${newId}`;
    let i = newId;
    while (isNameDup(baseName, null)) { i++; baseName = `Tavolo ${i}`; }
    setTavoli(prev => [...prev, {...t, id: newId, name: baseName, pos: {x: Math.min(9, t.pos.x + 0.7), y: t.pos.y}}]);
  };

  const createTable = (pos) => {
    const newId = Math.max(0, ...tavoli.map(x => x.id)) + 1;
    let baseName = `Tavolo ${newId}`;
    let i = newId;
    while (isNameDup(baseName, null)) { i++; baseName = `Tavolo ${i}`; }
    const newT = { id: newId, name: baseName, alias: '', coperti: 4, shape: 'round', disabled: false, pos };
    setTavoli(prev => [...prev, newT]);
    setCreatingTable(newId);
  };

  const createFurniture = (item) => {
    const newId = `f${Date.now()}`;
    setFurniture(prev => [...prev, {...item, id: newId}]);
  };

  const deleteFurniture = (id) => {
    const f = furniture.find(x => x.id === id);
    if (!f) return;
    const snapshot = [...furniture];
    setFurniture(prev => prev.filter(x => x.id !== id));
    showToast(`"${f.label || 'Elemento'}" eliminato`, () => setFurniture(snapshot));
  };

  const mergeTables = (idDragged, idTarget) => {
    // Fondi i due tavoli in uno solo: tieni il target (resta dov'è), somma coperti, elimina il dragged
    const dragged = tavoli.find(t => t.id === idDragged);
    const target = tavoli.find(t => t.id === idTarget);
    if (!dragged || !target) return;
    const merged = {
      ...target,
      coperti: (target.coperti || 0) + (dragged.coperti || 0),
      // se uno dei due era rect (rettangolare), mantienilo (rappresenta tavolo lungo unito)
      shape: target.shape === 'rect' || dragged.shape === 'rect' ? 'rect' : target.shape,
    };
    setTavoli(prev => prev.filter(t => t.id !== idDragged).map(t => t.id === idTarget ? merged : t));
    showToast(`"${dragged.name}" unito a "${target.name}" (${merged.coperti} coperti)`, () => {
      // undo: ripristina entrambi
      setTavoli(prev => {
        const restored = prev.map(t => t.id === idTarget ? target : t);
        return [...restored, dragged];
      });
    });
  };
  const ungroupTables = (gid) => setGroups(prev => prev.filter(g => g.id !== gid));

  // Filter + sort lista
  let visible = [...tavoli];
  if (search) visible = visible.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || (t.alias||'').toLowerCase().includes(search.toLowerCase()));
  if (filterStato === 'attivi') visible = visible.filter(t => !t.disabled);
  if (filterStato === 'fuoriuso') visible = visible.filter(t => t.disabled);
  if (sortBy === 'name') visible.sort((a,b) => naturalCompare(a.name, b.name));
  else if (sortBy === 'coperti-asc') visible.sort((a,b) => a.coperti - b.coperti);
  else if (sortBy === 'coperti-desc') visible.sort((a,b) => b.coperti - a.coperti);
  const isFiltering = search || filterStato !== 'all';

  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr', gap: 16}}>
      <aside>
        <ImpCard aurora title="Le tue sale" sub="Crea sale separate per gestire spazi diversi" action={
          <button
            onClick={() => setEditSala({ name: '', active: true })}
            title="Nuova sala"
            style={{
              width:30, height:30, borderRadius:8, border:'none',
              background: PN.TEXT, color: PN.WHITE, cursor:'pointer',
              display:'grid', placeItems:'center',
            }}><PnI.Plus size={14}/></button>
        }>
          <div style={{display:'flex', flexDirection:'column', gap: 8}}>
            {sale.map(s => {
              const isOpen = s.id === activeId;
              // Counter real-time dai dati della singola sala
              const sCount = (s.tavoli || []).length;
              const sCop = (s.tavoli || []).filter(t => !t.disabled).reduce((a,t) => a+t.coperti, 0);
              const menuOpen = salaMenu === s.id;
              return (
                <div key={s.id} style={{position:'relative'}}>
                  <div onClick={() => switchSala(s.id)} style={{
                    display:'block', padding: '12px 14px',
                    border: `1.5px solid ${isOpen ? PN.PINK : PN.BORDER_SOFT}`,
                    background: isOpen ? PN.PINK_SOFT : PN.WHITE,
                    borderRadius: 10, textAlign:'left',
                    cursor:'pointer', width:'100%',
                    transition:'border-color 0.15s, background 0.15s',
                  }}>
                    <div style={{display:'flex', alignItems:'center', gap: 6, marginBottom: 4}}>
                      <span style={{fontSize:13.5, fontWeight:700, flex:1, color: isOpen ? PN.PINK_DARK : PN.TEXT}}>{s.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSale(prev => prev.map(x => x.id === s.id ? {...x, active: !x.active} : x));
                        }}
                        title={s.active ? 'Clicca per disattivare' : 'Clicca per attivare'}
                        style={{
                          fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5,
                          padding:'3px 8px', borderRadius: 4,
                          background: s.active ? PN.GREEN_SOFT : '#EEF0F3',
                          color: s.active ? PN.GREEN : PN.MUTED,
                          border:'none', cursor:'pointer', fontFamily:'inherit',
                          transition:'opacity 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >{s.active ? 'ATTIVA' : 'DISATTIVA'}</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSalaMenu(menuOpen ? null : s.id); }}
                        style={{
                          width: 22, height: 22, borderRadius: 5,
                          background: menuOpen ? PN.WHITE : 'transparent',
                          border:'none', cursor:'pointer',
                          color: PN.MUTED, fontSize: 14,
                          display:'grid', placeItems:'center',
                        }}>⋯</button>
                    </div>
                    <div style={{fontSize:11.5, color:PN.MUTED}}>
                      {sCount > 0 ? `${sCount} ${sCount === 1 ? 'tavolo' : 'tavoli'} · ${sCop} coperti` : 'Nessun tavolo configurato'}
                    </div>
                  </div>
                  {menuOpen && (
                    <div onClick={e => e.stopPropagation()} style={{
                      position:'absolute', top: 38, right: 10, zIndex: 20,
                      minWidth: 170, background: PN.WHITE,
                      border: `1px solid ${PN.BORDER}`, borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: 6,
                    }}>
                      <MenuItem icon={<BuIcons.edit size={14}/>} onClick={() => { setEditSala({...s}); setSalaMenu(null); }}>Rinomina</MenuItem>
                      <MenuItem icon={s.active ? <BuIcons.pause size={14}/> : <BuIcons.check size={14}/>} onClick={() => {
                        setSale(prev => prev.map(x => x.id === s.id ? {...x, active: !x.active} : x));
                        setSalaMenu(null);
                      }}>{s.active ? 'Disattiva' : 'Attiva'}</MenuItem>
                      <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
                      <MenuItem icon={<BuIcons.trash size={14}/>} danger onClick={() => {
                        setSalaMenu(null);
                        if (sale.length <= 1) {
                          setConfirmDialog({
                            title: 'Impossibile eliminare',
                            msg: 'Devi avere almeno una sala attiva.',
                            singleAction: 'Ho capito',
                            onConfirm: () => setConfirmDialog(null),
                          });
                          return;
                        }
                        setConfirmDialog({
                          title: `Elimina "${s.name}"?`,
                          msg: sCount > 0 ? `Verranno eliminati anche ${sCount} ${sCount === 1 ? 'tavolo' : 'tavoli'} e tutto l'arredo configurato. Quest'azione non può essere annullata.` : `La sala verrà eliminata definitivamente.`,
                          danger: true,
                          confirmLabel: 'Elimina sala',
                          onConfirm: () => {
                            setSale(prev => prev.filter(x => x.id !== s.id));
                            if (activeId === s.id) setActiveId(sale.find(x => x.id !== s.id).id);
                            setConfirmDialog(null);
                          },
                        });
                      }}>Elimina</MenuItem>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ImpCard>

        <div style={{marginTop: 12, display:'flex', flexDirection:'column', alignItems:'stretch', gap: 6}}>
          <BuAiButton
            variant="dashed"
            size="md"
            fullWidth
            onClick={() => setImportModal(true)}
          >
            Importa planimetria con AI
          </BuAiButton>
          <div style={{fontSize: 11, color: PN.MUTED, textAlign:'center', lineHeight: 1.45, marginTop: 2}}>
            Carica una foto o un PDF della tua sala e l'AI riconoscerà tavoli e disposizione
          </div>
        </div>
      </aside>

      <main>
        <ImpCard
          title={active?.name}
          sub={`${tavoli.filter(t => !t.disabled).length}/${tavoli.length} tavoli operativi · ${tavoli.filter(t => !t.disabled).reduce((a,t) => a+t.coperti, 0)} coperti`}
          action={
            <div style={{display:'flex', gap: 8, alignItems:'center'}}>
              <div style={{display:'flex', background:'#F4F5F7', padding:3, borderRadius:8, gap:2}}>
                {[
                  {id:'mappa', label:'Mappa', icon: <BuIcons.grid size={12}/>},
                  {id:'lista', label:'Lista', icon: <BuIcons.list size={12}/>},
                ].map(v => (
                  <button key={v.id} onClick={() => setView(v.id)} style={{
                    padding:'6px 12px', borderRadius: 6,
                    background: view===v.id ? PN.WHITE : 'transparent',
                    border:'none',
                    color: view===v.id ? PN.TEXT : PN.MUTED,
                    fontSize: 12, fontWeight: 600,
                    cursor:'pointer', fontFamily:'inherit',
                    boxShadow: view===v.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    display:'inline-flex', alignItems:'center', gap: 5,
                  }}><span style={{display:'inline-flex'}}>{v.icon}</span>{v.label}</button>
                ))}
              </div>
              <ImpButton variant="ghost" icon={<BuIcons.download size={13}/>} onClick={() => setQrModal({mode: 'all', tavoli})}>QR sala</ImpButton>
            </div>
          }
        >
          {view === 'lista' && (
            <>
              <div style={{display:'flex', gap: 8, marginBottom: 14, flexWrap:'wrap'}}>
                <div style={{position:'relative', flex: '1 1 240px', minWidth: 200}}>
                  <span style={{position:'absolute', left: 11, top:'50%', transform:'translateY(-50%)', display:'inline-flex', color: PN.MUTED}}><BuIcons.search size={13}/></span>
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cerca tavolo per nome o alias…"
                    style={{
                      width:'100%', padding:'9px 12px 9px 34px',
                      border:`1px solid ${PN.BORDER}`, borderRadius: 8,
                      fontSize: 13, fontFamily:'inherit', outline:'none',
                    }}
                  />
                </div>
                <select value={filterStato} onChange={e => setFilterStato(e.target.value)} style={{
                  padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 8,
                  fontSize: 13, fontFamily:'inherit', background: PN.WHITE, cursor:'pointer',
                }}>
                  <option value="all">Tutti gli stati</option>
                  <option value="attivi">Solo attivi</option>
                  <option value="fuoriuso">Solo disattivati</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                  padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 8,
                  fontSize: 13, fontFamily:'inherit', background: PN.WHITE, cursor:'pointer',
                }}>
                  <option value="name">Ordine: numero ↑</option>
                  <option value="coperti-asc">Coperti ↑</option>
                  <option value="coperti-desc">Coperti ↓</option>
                </select>
                <ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={() => {
                  // Crea tavolo a posizione di default e apri popover
                  const center = { x: 4, y: 2.5 };
                  const newId = Math.max(0, ...tavoli.map(x => x.id)) + 1;
                  setTavoli(prev => [...prev, { id: newId, name: `Tavolo ${newId}`, alias: '', coperti: 4, shape: 'round', disabled: false, pos: center }]);
                  setCreatingTable(newId);
                }}>
                  Aggiungi tavolo
                </ImpButton>
              </div>

              {selected.size > 0 && (() => {
                const sel = tavoli.filter(t => selected.has(t.id));
                const someActive = sel.some(t => !t.disabled);
                return (
                <div style={{
                  display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap',
                  padding:'10px 14px', marginBottom: 14,
                  background: PN.PINK_SOFT, border: `1px solid ${PN.PINK}`, borderRadius: 9,
                }}>
                  <span style={{fontSize: 13, fontWeight: 700, color: PN.PINK_DARK}}>
                    {selected.size} {selected.size===1?'tavolo selezionato':'tavoli selezionati'}
                  </span>
                  <span style={{flex:1}}/>
                  <ImpButton variant="ghost" icon={<BuIcons.download size={13}/>} onClick={() => setQrModal({mode: 'bulk', tavoli: sel})}>Scarica QR</ImpButton>
                  <ImpButton variant="ghost" icon={someActive ? <BuIcons.pause size={13}/> : <BuIcons.check size={13}/>} onClick={() => {
                    selected.forEach(id => updateTavolo(id, { disabled: someActive }));
                  }}>
                    {someActive ? 'Disattiva' : 'Riattiva'}
                  </ImpButton>
                  <button onClick={() => setSelected(new Set())} style={{background:'transparent', border:'none', color: PN.MUTED, padding: 6, cursor:'pointer'}}>
                    <PnI.X size={14}/>
                  </button>
                </div>
                );
              })()}

              {visible.length === 0 ? (
                <div style={{padding: '50px 20px', textAlign:'center', border:`1.5px dashed ${PN.BORDER}`, borderRadius: 12, background:'#FAFBFC'}}>
                  <div style={{display:'inline-flex', marginBottom: 10, color: PN.MUTED_SOFT}}>{isFiltering ? <BuIcons.search size={36}/> : <BuIcons.table size={36}/>}</div>
                  <div style={{fontSize: 15, fontWeight: 700, marginBottom: 6}}>
                    {isFiltering ? 'Nessun tavolo trovato' : 'Nessun tavolo in questa sala'}
                  </div>
                  <div style={{fontSize: 12.5, color: PN.MUTED, marginBottom: 16}}>
                    {isFiltering ? 'Prova a modificare i filtri.' : 'Vai sulla mappa per posizionare il primo tavolo.'}
                  </div>
                  {isFiltering
                    ? <ImpButton variant="ghost" onClick={() => { setSearch(''); setFilterStato('all'); }}>Resetta filtri</ImpButton>
                    : <ImpButton variant="primary" onClick={() => setView('mappa')}>Vai alla mappa</ImpButton>}
                </div>
              ) : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10}}>
                  {visible.map(t => (
                    <TableCard
                      key={t.id} t={t}
                      selected={selected.has(t.id)}
                      menuOpen={openMenu === t.id}
                      onSelect={() => toggleSelect(t.id)}
                      onUpdate={(patch) => updateTavolo(t.id, patch)}
                      onMenuToggle={(e) => { e.stopPropagation(); setOpenMenu(openMenu === t.id ? null : t.id); }}
                      onEdit={() => { setEditingTable(t.id); setOpenMenu(null); }}
                      onDuplicate={() => { duplicaTavolo(t.id); setOpenMenu(null); }}
                      onQR={() => { setQrModal({mode: 'single', tavoli: [t]}); setOpenMenu(null); }}
                      onDisable={() => { updateTavolo(t.id, {disabled: !t.disabled}); setOpenMenu(null); }}
                      onDelete={() => {
                        setOpenMenu(null);
                        setConfirmDialog({
                          title: `Elimina "${t.name}"?`,
                          msg: 'Il tavolo verrà rimosso da questa sala. Potrai annullare per qualche secondo dopo la conferma.',
                          danger: true,
                          confirmLabel: 'Elimina tavolo',
                          onConfirm: () => { deleteTavolo(t.id); setConfirmDialog(null); },
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {view === 'mappa' && (
            isLoadingSala ? <SalaSkeleton/> :
            <FloorPlan
              tavoli={tavoli}
              furniture={furniture}
              groups={groups}
              selected={selected}
              onCreateTable={createTable}
              onCreateFurniture={createFurniture}
              onMoveTable={(id, pos) => updateTavolo(id, {pos})}
              onMoveFurniture={(id, pos) => setFurniture(prev => prev.map(f => f.id === id ? {...f, ...pos} : f))}
              onResizeFurniture={(id, dim) => setFurniture(prev => prev.map(f => f.id === id ? {...f, ...dim} : f))}
              onRotateFurniture={(id) => setFurniture(prev => prev.map(f => f.id === id ? {...f, w: f.h, h: f.w} : f))}
              onDeleteFurniture={deleteFurniture}
              onMergeTables={mergeTables}
              onUngroupTables={ungroupTables}
              onSelectTable={toggleSelect}
              onEditTable={(id) => setEditingTable(id)}
            />
          )}
        </ImpCard>
      </main>

      {qrModal && <QRModal data={qrModal} onClose={() => setQrModal(null)}/>}
      {editSala && (
        <SalaModal
          sala={editSala}
          onSave={(data) => {
            if (data.id) {
              setSale(prev => prev.map(x => x.id === data.id ? {...x, ...data} : x));
            } else {
              const newId = Math.max(0, ...sale.map(x => x.id)) + 1;
              setSale(prev => [...prev, {...data, id: newId, tavoli: [], furniture: [], groups: []}]);
              switchSala(newId);
            }
            setEditSala(null);
          }}
          onClose={() => setEditSala(null)}
        />
      )}
      {creatingTable !== null && (
        <TablePopover
          tavolo={tavoli.find(t => t.id === creatingTable)}
          isNew
          isNameDup={(n) => isNameDup(n, creatingTable)}
          onUpdate={(patch) => updateTavolo(creatingTable, patch)}
          onClose={() => setCreatingTable(null)}
          onDelete={() => { deleteTavolo(creatingTable); setCreatingTable(null); }}
        />
      )}
      {editingTable !== null && (
        <TablePopover
          tavolo={tavoli.find(t => t.id === editingTable)}
          isNameDup={(n) => isNameDup(n, editingTable)}
          onUpdate={(patch) => updateTavolo(editingTable, patch)}
          onClose={() => setEditingTable(null)}
          onDelete={() => {
            const t = tavoli.find(x => x.id === editingTable);
            setConfirmDialog({
              title: 'Eliminare il tavolo?',
              message: `"${t?.name}" verrà rimosso dalla mappa.`,
              icon: <BuIcons.trash size={18}/>,
              danger: true,
              confirmLabel: 'Elimina tavolo',
              onConfirm: () => { deleteTavolo(editingTable); setEditingTable(null); setConfirmDialog(null); },
            });
          }}
        />
      )}
      {confirmDialog && <ConfirmDialog {...confirmDialog} onClose={() => setConfirmDialog(null)}/>}
      {importModal && <ImportPlanModal
        onClose={() => setImportModal(false)}
        onImport={(generated) => {
          patchActive(s => ({ tavoli: generated.tavoli, furniture: generated.furniture, groups: [] }));
          setImportModal(false);
          showToast('Planimetria generata da AI', null);
        }}
      />}
      {toast && <UndoToast toast={toast} onUndo={() => { toast.undo?.(); setToast(null); }} onClose={() => setToast(null)}/>}
    </div>
  );
}

function TableCard({ t, selected, menuOpen, onSelect, onUpdate, onMenuToggle, onEdit, onDuplicate, onQR, onDisable, onDelete }) {
  return (
    <div style={{
      padding: '12px 14px', position:'relative',
      border:`1.5px solid ${selected ? PN.PINK : PN.BORDER_SOFT}`,
      borderRadius: 10,
      background: selected ? PN.PINK_SOFT : PN.WHITE,
      opacity: t.disabled ? 0.78 : 1,
      zIndex: menuOpen ? 50 : 1,
      transition: 'opacity 0.2s, border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
    }}
    onMouseEnter={e => { if (!menuOpen) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(63,20,36,0.06)'; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 10}}>
        <input type="checkbox" checked={selected} onChange={onSelect} style={{accentColor: PN.PINK, cursor:'pointer'}}/>
        <span style={{fontSize:13.5, fontWeight:700, flex:1}}>{t.name}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDisable(); }}
          title={t.disabled ? 'Clicca per attivare' : 'Clicca per disattivare'}
          style={{
            fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5,
            padding:'3px 8px', borderRadius: 4,
            background: t.disabled ? '#EEF0F3' : PN.GREEN_SOFT,
            color: t.disabled ? PN.MUTED : PN.GREEN,
            border:'none', cursor:'pointer', fontFamily:'inherit',
            transition:'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >{t.disabled ? 'DISATTIVATO' : 'ATTIVO'}</button>
        <button onClick={onMenuToggle} style={{
          width: 28, height: 28, borderRadius: 6,
          background: menuOpen ? '#F4F5F7' : 'transparent',
          border:'none', cursor:'pointer', color: PN.MUTED,
          display:'grid', placeItems:'center', fontSize: 16,
        }}>⋯</button>
        {menuOpen && (
          <div onClick={e => e.stopPropagation()} style={{
            position:'absolute', top: 38, right: 12, zIndex: 100,
            minWidth: 180, background: PN.WHITE,
            border: `1px solid ${PN.BORDER}`, borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 6,
          }}>
            <MenuItem icon={<BuIcons.edit size={14}/>} onClick={onEdit}>Modifica</MenuItem>
            <MenuItem icon={<BuIcons.copy size={14}/>} onClick={onDuplicate}>Duplica</MenuItem>
            <MenuItem icon={<BuIcons.download size={14}/>} onClick={onQR}>Scarica QR</MenuItem>
            <MenuItem icon={t.disabled ? <BuIcons.check size={14}/> : <BuIcons.pause size={14}/>} onClick={onDisable}>
              {t.disabled ? 'Riattiva' : 'Disattiva'}
            </MenuItem>
            <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
            <MenuItem icon={<BuIcons.trash size={14}/>} danger onClick={onDelete}>Elimina</MenuItem>
          </div>
        )}
      </div>

      <div style={{display:'flex', alignItems:'center', gap: 12}}>
        {/* Coperti stepper */}
        <div style={{flex: 1}}>
          <div style={{fontSize: 10.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 4}}>Coperti</div>
          <div style={{display:'inline-flex', alignItems:'center', gap: 0, border:`1px solid ${PN.BORDER}`, borderRadius: 7, overflow:'hidden'}}>
            <button onClick={() => onUpdate({coperti: Math.max(1, t.coperti - 1)})} style={{
              width: 28, height: 28, border:'none', background: PN.WHITE,
              cursor:'pointer', fontSize: 14, color: PN.TEXT,
            }}>−</button>
            <span style={{
              minWidth: 32, textAlign:'center', fontSize: 13.5, fontWeight: 700,
              borderLeft:`1px solid ${PN.BORDER}`, borderRight:`1px solid ${PN.BORDER}`,
              padding:'4px 0',
            }}>{t.coperti}</span>
            <button onClick={() => onUpdate({coperti: Math.min(20, t.coperti + 1)})} style={{
              width: 28, height: 28, border:'none', background: PN.WHITE,
              cursor:'pointer', fontSize: 14, color: PN.TEXT,
            }}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, children, danger, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap: 9, width:'100%',
      padding:'8px 10px', background:'transparent', border:'none',
      borderRadius: 7, fontSize: 13, fontFamily:'inherit',
      color: danger ? PN.PINK_DARK : PN.TEXT,
      cursor:'pointer', textAlign:'left',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? PN.PINK_SOFT : '#F4F5F7'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width: 16, color: 'currentColor'}}>{icon}</span>
      {children}
    </button>
  );
}

function TablePopover({ tavolo, isNew, isNameDup, onUpdate, onClose, onDelete }) {
  if (!tavolo) return null;
  const dup = isNameDup && tavolo.name.trim() && isNameDup(tavolo.name);
  const empty = !tavolo.name.trim();
  const invalid = dup || empty;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(0,0,0,0.5)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16, width: 420, maxWidth:'100%',
      }}>
        <div style={{padding:'18px 20px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, position:'relative'}}>
          <div style={{fontSize: 16, fontWeight: 800}}>
            {isNew ? <span style={{display:'inline-flex', alignItems:'center', gap: 8}}><BuIcons.sparkle size={16} color={PN.PINK_DARK}/> Nuovo tavolo posizionato</span> : `Modifica ${tavolo.name}`}
          </div>
          <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>
            {isNew ? 'Configura forma, coperti e nome del tavolo' : 'Aggiorna le impostazioni del tavolo'}
          </div>
          <button onClick={onClose} style={{
            position:'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: 8,
            background:'#F4F5F7', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={13}/></button>
        </div>

        <div style={{padding:'18px 20px'}}>
          <ImpField label="Nome">
            <input
              value={tavolo.name} onChange={e => onUpdate({name: e.target.value})}
              autoFocus={isNew}
              style={{width:'100%', padding:'10px 12px', border:`1px solid ${dup ? PN.PINK_DARK : PN.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', outline:'none'}}
            />
            {dup && <div style={{fontSize:11.5, color: PN.PINK_DARK, marginTop: 5, fontWeight: 600, display:'inline-flex', alignItems:'center', gap: 5}}><BuIcons.alert size={12}/> Esiste già un tavolo con questo nome</div>}
            {empty && <div style={{fontSize:11.5, color: PN.MUTED, marginTop: 5}}>Il nome è obbligatorio</div>}
          </ImpField>

          <div style={{fontSize: 12, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>Forma</div>
          <div style={{display:'flex', gap: 8, marginBottom: 16}}>
            {SHAPES.map(s => {
              const on = tavolo.shape === s.id;
              return (
                <button key={s.id} onClick={() => onUpdate({shape: s.id})} style={{
                  flex: 1, padding: '14px 8px',
                  border:`1.5px solid ${on ? PN.PINK : PN.BORDER_SOFT}`,
                  background: on ? PN.PINK_SOFT : PN.WHITE,
                  borderRadius: 10, cursor:'pointer', fontFamily:'inherit',
                  display:'flex', flexDirection:'column', alignItems:'center', gap: 6,
                }}>
                  <span style={{fontSize: 22, color: on ? PN.PINK_DARK : PN.TEXT}}>{s.icon}</span>
                  <span style={{fontSize: 11.5, fontWeight: 700, color: on ? PN.PINK_DARK : PN.TEXT}}>{s.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{fontSize: 12, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>Coperti</div>
          <div style={{display:'flex', gap: 6, marginBottom: 8, flexWrap:'wrap'}}>
            {[2,4,6,8,10,12].map(n => {
              const on = tavolo.coperti === n;
              return (
                <button key={n} onClick={() => onUpdate({coperti: n})} style={{
                  flex: '1 1 0', minWidth: 50, padding: '10px 0',
                  border:`1.5px solid ${on ? PN.PINK : PN.BORDER_SOFT}`,
                  background: on ? PN.PINK : PN.WHITE,
                  color: on ? PN.WHITE : PN.TEXT,
                  borderRadius: 8, fontSize: 14, fontWeight: 700,
                  cursor:'pointer', fontFamily:'inherit',
                }}>{n}</button>
              );
            })}
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 12, color: PN.MUTED}}>
            Custom:
            <input type="number" min="1" max="30" value={tavolo.coperti} onChange={e => onUpdate({coperti: parseInt(e.target.value) || 1})} style={{
              width: 60, padding:'6px 8px', textAlign:'center',
              border:`1px solid ${PN.BORDER}`, borderRadius: 6,
              fontSize: 13, fontWeight: 700, fontFamily:'inherit', outline:'none',
            }}/>
          </div>
        </div>

        <div style={{padding:'14px 20px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 8, justifyContent: onDelete ? 'space-between' : 'flex-end'}}>
          {onDelete && <ImpButton variant="ghost" icon={<BuIcons.trash size={13}/>} onClick={onDelete} style={{color: PN.PINK_DARK}}>Elimina</ImpButton>}
          <ImpButton variant="primary" onClick={() => !invalid && onClose()} disabled={invalid}>{isNew ? 'Conferma e crea' : 'Salva'}</ImpButton>
        </div>
      </div>
    </div>
  );
}

function QRModal({ data, onClose }) {
  const [format, setFormat] = React.useState('pdf');
  const isMulti = data.tavoli.length > 1;
  const formats = [
    { id: 'pdf', label: 'PDF stampabile', icon: <BuIcons.doc size={18}/>, desc: 'Un foglio con tutti i QR pronto da stampare' },
    { id: 'png-zip', label: 'PNG singoli (zip)', icon: <BuIcons.image size={18}/>, desc: "Un'immagine PNG per ogni tavolo" },
  ];
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(0,0,0,0.5)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16, padding: 24,
        width: isMulti ? 640 : 420, maxHeight: '85vh', overflow:'auto',
      }}>
        <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 18}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 16, fontWeight: 800}}>
              {data.mode === 'all' ? 'QR di tutti i tavoli' : isMulti ? `QR di ${data.tavoli.length} tavoli` : data.tavoli[0].name}
            </div>
            <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>I clienti scansionano il QR per vedere il menù del tavolo</div>
          </div>
          <button onClick={onClose} style={{width: 32, height: 32, borderRadius: 8, background: '#F4F5F7', border:'none', cursor:'pointer', display:'grid', placeItems:'center'}}>
            <PnI.X size={14}/>
          </button>
        </div>
        <div style={{display:'grid', gap: 12, gridTemplateColumns: isMulti ? 'repeat(3, 1fr)' : '1fr', marginBottom: 20}}>
          {data.tavoli.slice(0, 6).map(t => (
            <div key={t.id} style={{padding: 14, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 12, textAlign:'center'}}>
              <div style={{fontSize: 12, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>{t.name}</div>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 8,
                background: `repeating-conic-gradient(${PN.TEXT} 0% 25%, transparent 0% 50%) 0 0/${isMulti ? 8 : 14}px ${isMulti ? 8 : 14}px`,
                border:`1px solid ${PN.BORDER}`, margin:'0 auto',
              }}/>
              <div style={{fontSize: 11, color: PN.MUTED, marginTop: 8}}>{t.coperti} coperti</div>
            </div>
          ))}
        </div>
        <div style={{fontSize: 12, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>Formato</div>
        <div style={{display:'flex', flexDirection:'column', gap: 6, marginBottom: 18}}>
          {formats.map(f => {
            const on = format === f.id;
            return (
              <label key={f.id} style={{
                display:'flex', alignItems:'center', gap: 11,
                padding: '10px 12px',
                border: `1.5px solid ${on ? PN.PINK : PN.BORDER_SOFT}`,
                background: on ? PN.PINK_SOFT : PN.WHITE,
                borderRadius: 9, cursor:'pointer',
              }}>
                <input type="radio" name="qr-format" checked={on} onChange={() => setFormat(f.id)} style={{accentColor: PN.PINK}}/>
                <span style={{fontSize: 18}}>{f.icon}</span>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 13, fontWeight: 700, color: on ? PN.PINK_DARK : PN.TEXT}}>{f.label}</div>
                  <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 1}}>{f.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
        <div style={{display:'flex', gap: 10, justifyContent:'flex-end'}}>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
          <ImpButton variant="primary" icon={<BuIcons.download size={13}/>} onClick={onClose}>Scarica</ImpButton>
        </div>
      </div>
    </div>
  );
}

function SalaModal({ sala, onSave, onClose }) {
  const [name, setName] = React.useState(sala.name || '');
  const [active, setActive] = React.useState(sala.active ?? true);
  const isNew = !sala.id;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(0,0,0,0.5)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16, width: 420, maxWidth:'100%',
      }}>
        <div style={{padding:'18px 20px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, position:'relative'}}>
          <div style={{fontSize: 16, fontWeight: 800}}>{isNew ? 'Nuova sala' : 'Modifica sala'}</div>
          <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>
            {isNew ? 'Crea uno spazio separato (es. dehors, terrazza, sala VIP)' : 'Aggiorna nome e stato della sala'}
          </div>
          <button onClick={onClose} style={{
            position:'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: 8,
            background:'#F4F5F7', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={13}/></button>
        </div>
        <div style={{padding:'18px 20px'}}>
          <ImpField label="Nome sala">
            <input
              value={name} onChange={e => setName(e.target.value)} autoFocus
              placeholder="Es. Terrazza, Sala VIP, Dehors..."
              style={{width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', outline:'none'}}
            />
          </ImpField>
          <label style={{display:'flex', alignItems:'center', gap: 10, padding: 12, background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 9, cursor:'pointer'}}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{accentColor: PN.PINK}}/>
            <div style={{flex:1}}>
              <div style={{fontSize: 13, fontWeight: 700}}>Sala attiva</div>
              <div style={{fontSize: 11.5, color: PN.MUTED}}>Le sale disattive non sono prenotabili dai clienti</div>
            </div>
          </label>
        </div>
        <div style={{padding:'14px 20px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 8, justifyContent:'flex-end'}}>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
          <ImpButton variant="primary" onClick={() => name.trim() && onSave({...sala, name: name.trim(), active})}>
            {isNew ? 'Crea sala' : 'Salva'}
          </ImpButton>
        </div>
      </div>
    </div>
  );
}

// ─────────── Toast con Undo ───────────
function UndoToast({ toast, onUndo, onClose }) {
  return (
    <div style={{
      position:'fixed', bottom: 24, left: '50%', transform:'translateX(-50%)',
      zIndex: 200,
      background: PN.TEXT, color: PN.WHITE,
      padding:'12px 16px', borderRadius: 10,
      boxShadow:'0 12px 32px rgba(0,0,0,0.25)',
      display:'flex', alignItems:'center', gap: 14,
      fontSize: 13, fontWeight: 600,
      animation: 'toastIn 0.25s ease-out',
    }}>
      <span style={{display:'inline-flex'}}><BuIcons.check size={14} color="#fff"/></span>
      <span>{toast.msg}</span>
      {toast.undo && (
        <button onClick={onUndo} style={{
          background: 'transparent', border: `1px solid rgba(255,255,255,0.3)`,
          color: PN.WHITE, padding: '5px 12px', borderRadius: 6,
          fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        }}>Annulla</button>
      )}
      <button onClick={onClose} style={{
        background:'transparent', border:'none', color: 'rgba(255,255,255,0.6)',
        cursor:'pointer', fontSize: 16, padding: 0, marginLeft: 4,
      }}>×</button>
    </div>
  );
}

// ─────────── Confirm Dialog ───────────
function ConfirmDialog({ title, msg, danger, confirmLabel, singleAction, onConfirm, onClose }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(0,0,0,0.5)',
      display:'grid', placeItems:'center', zIndex: 150, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16, width: 400, maxWidth:'100%',
        animation:'dialogIn 0.2s ease-out',
      }}>
        <div style={{padding: '24px 24px 16px'}}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: danger ? PN.PINK_SOFT : PN.SIDE_BG,
            color: danger ? PN.PINK_DARK : PN.MUTED,
            display:'grid', placeItems:'center',
            marginBottom: 14,
          }}>{danger ? <BuIcons.alert size={20}/> : <BuIcons.info size={20}/>}</div>
          <div style={{fontSize: 17, fontWeight: 800, color: PN.TEXT, marginBottom: 6}}>{title}</div>
          <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.5}}>{msg}</div>
        </div>
        <div style={{padding: '14px 24px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 10, justifyContent:'flex-end'}}>
          {singleAction ? (
            <ImpButton variant="primary" onClick={onConfirm}>{singleAction}</ImpButton>
          ) : (
            <>
              <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
              <button onClick={onConfirm} style={{
                padding: '9px 16px', borderRadius: 8,
                background: danger ? PN.PINK_DARK : PN.PINK,
                color: PN.WHITE, border: 'none', cursor:'pointer',
                fontSize: 13, fontWeight: 700, fontFamily:'inherit',
              }}>{confirmLabel || 'Conferma'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────── Skeleton cambio sala ───────────
function SalaSkeleton() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'200px 1fr', gap: 14}}>
      <div style={{height: 380, background:'#F4F5F7', borderRadius: 12, animation:'skelPulse 1.2s ease-in-out infinite'}}/>
      <div style={{height: 380, background:'#F4F5F7', borderRadius: 12, animation:'skelPulse 1.2s ease-in-out infinite'}}/>
    </div>
  );
}

// ─────────── Import planimetria con AI ───────────
function ImportPlanModal({ onClose, onImport }) {
  const [step, setStep] = React.useState('upload'); // upload, processing, preview
  const [fileName, setFileName] = React.useState('');
  const [progress, setProgress] = React.useState(0);
  const [progressLabel, setProgressLabel] = React.useState('');
  const fileRef = React.useRef(null);

  const startProcessing = (name) => {
    setFileName(name);
    setStep('processing');
    setProgress(0);
    const steps = [
      { p: 25, label: 'Analisi della planimetria…' },
      { p: 50, label: 'Riconoscimento muri e divisori…' },
      { p: 75, label: 'Identificazione tavoli e arredo…' },
      { p: 100, label: 'Generazione layout finale…' },
    ];
    let i = 0;
    const tick = () => {
      if (i >= steps.length) {
        setTimeout(() => setStep('preview'), 400);
        return;
      }
      setProgress(steps[i].p);
      setProgressLabel(steps[i].label);
      i++;
      setTimeout(tick, 700);
    };
    tick();
  };

  // Mock generato dall'AI
  const generated = {
    tavoli: [
      { id: 101, name: 'T1', alias:'', coperti: 2, shape: 'round', disabled: false, pos: {x: 1, y: 1} },
      { id: 102, name: 'T2', alias:'', coperti: 4, shape: 'square', disabled: false, pos: {x: 3, y: 1} },
      { id: 103, name: 'T3', alias:'', coperti: 4, shape: 'square', disabled: false, pos: {x: 5, y: 1} },
      { id: 104, name: 'T4', alias:'', coperti: 6, shape: 'rect', disabled: false, pos: {x: 7, y: 1} },
      { id: 105, name: 'T5', alias:'', coperti: 2, shape: 'round', disabled: false, pos: {x: 1.5, y: 3} },
      { id: 106, name: 'T6', alias:'', coperti: 4, shape: 'round', disabled: false, pos: {x: 3.5, y: 3} },
      { id: 107, name: 'T7', alias:'', coperti: 4, shape: 'square', disabled: false, pos: {x: 5.5, y: 3} },
      { id: 108, name: 'T8', alias:'', coperti: 8, shape: 'rect', disabled: false, pos: {x: 7.5, y: 3} },
    ],
    furniture: [
      { id: 'fai-1', kind: 'kitchen', label:'Cucina', x: 0.2, y: 4.4, w: 2.5, h: 1.4, color:'#7c2436', textColor:'#FFF' },
      { id: 'fai-2', kind: 'bathroom', label:'Bagno', x: 8.2, y: 4.6, w: 1.4, h: 1.2, color:'#85B8CB', textColor:'#FFF' },
      { id: 'fai-3', kind: 'wall', label:'Muro', x: 0, y: 2.2, w: 4, h: 0.18, color:'#3F1424', textColor:'#FFF' },
      { id: 'fai-4', kind: 'door', label:'Porta', x: 4.3, y: 2.2, w: 1.2, h: 0.18, color:'#C5A878', textColor:'#FFF' },
    ],
  };

  return (
    <div onClick={step !== 'processing' ? onClose : undefined} style={{
      position:'fixed', inset: 0, background:'rgba(0,0,0,0.55)',
      display:'grid', placeItems:'center', zIndex: 120, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 18, width: 560, maxWidth:'100%',
        overflow:'hidden', animation:'dialogIn 0.25s ease-out',
      }}>
        <div style={{
          padding: '20px 24px',
          background: `linear-gradient(135deg, ${PN.PINK_SOFT}, ${PN.PINK_LIGHT || '#FCE7EE'})`,
          borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          position:'relative',
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 4}}>
            <span style={{
              fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6,
              padding:'3px 8px', background: PN.PINK_DARK, color: PN.WHITE, borderRadius: 4,
            }}><BuIcons.sparkle size={11} color={PN.WHITE}/> AI</span>
            <span style={{fontSize: 11.5, fontWeight: 600, color: PN.PINK_DARK}}>Generazione automatica</span>
          </div>
          <div style={{fontSize: 18, fontWeight: 800, color: PN.PINK_DARK, marginBottom: 4}}>Importa la tua planimetria</div>
          <div style={{fontSize: 13, color: PN.PINK_DARK, opacity: 0.85}}>
            Carica un PDF, una foto o un disegno della tua sala. L'AI riconoscerà tavoli, muri e arredo automaticamente.
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} style={{
              position:'absolute', top: 14, right: 14,
              width: 30, height: 30, borderRadius: 8,
              background:'rgba(255,255,255,0.8)', border:'none', cursor:'pointer',
              display:'grid', placeItems:'center',
            }}><PnI.X size={13}/></button>
          )}
        </div>

        {step === 'upload' && (
          <div style={{padding: 24}}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border:`2px dashed ${PN.PINK}`, borderRadius: 12,
                padding: '36px 20px', textAlign:'center',
                cursor:'pointer', background: '#FFFAFB',
                transition:'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = PN.PINK_SOFT}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFAFB'}
            >
              <div style={{display:'inline-flex', marginBottom: 10, color: PN.MUTED_SOFT}}><BuIcons.upload size={36}/></div>
              <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Trascina o seleziona un file</div>
              <div style={{fontSize: 12, color: PN.MUTED}}>PDF, JPG, PNG · max 10MB</div>
              <input
                ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                style={{display:'none'}}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) startProcessing(f.name);
                }}
              />
            </div>
            <div style={{marginTop: 16, padding: 14, background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10}}>
              <div style={{fontSize: 12, fontWeight: 700, color: PN.TEXT, marginBottom: 6, display:'inline-flex', alignItems:'center', gap: 6}}><BuIcons.bulb size={13} color={PN.AMBER}/> Per risultati ottimali</div>
              <ul style={{margin: 0, paddingLeft: 18, fontSize: 12, color: PN.MUTED, lineHeight: 1.7}}>
                <li>Pianta vista dall'alto, con muri e tavoli ben visibili</li>
                <li>Numera o etichetta i tavoli se possibile (T1, T2…)</li>
                <li>Indica le aree (cucina, bagni) con un'etichetta</li>
              </ul>
            </div>
            <div style={{marginTop: 14, fontSize: 11.5, color: PN.MUTED, textAlign:'center'}}>
              Esempi: planimetria architetto, foto schizzo a mano, screenshot da CAD…
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div style={{padding: '40px 32px'}}>
            <div style={{textAlign:'center', marginBottom: 24}}>
              <div style={{
                width: 72, height: 72, margin: '0 auto 16px',
                borderRadius: '50%', background: PN.PINK_SOFT,
                display:'grid', placeItems:'center',
                animation:'pulse 1.5s ease-in-out infinite',
              }}>
                <span style={{display:'inline-flex'}}><BuIcons.sparkle size={32} color={PN.PINK}/></span>
              </div>
              <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>L'AI sta analizzando…</div>
              <div style={{fontSize: 12, color: PN.MUTED}}>{fileName}</div>
            </div>
            <div style={{
              height: 8, background: '#F4F5F7', borderRadius: 4, overflow:'hidden', marginBottom: 10,
            }}>
              <div style={{
                height:'100%', width: `${progress}%`,
                background: `linear-gradient(90deg, ${PN.PINK}, ${PN.PINK_DARK})`,
                borderRadius: 4, transition: 'width 0.5s ease-out',
              }}/>
            </div>
            <div style={{fontSize: 12, color: PN.PINK_DARK, fontWeight: 600, textAlign:'center'}}>
              {progressLabel}
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div style={{padding: 24}}>
            <div style={{
              padding: 12, marginBottom: 16,
              background: PN.GREEN_SOFT, border: `1px solid ${PN.GREEN}`, borderRadius: 9,
              display:'flex', alignItems:'center', gap: 10,
            }}>
              <span style={{display:'inline-flex'}}><BuIcons.check size={18} color={PN.GREEN}/></span>
              <div style={{flex:1}}>
                <div style={{fontSize: 13, fontWeight: 700, color: PN.GREEN}}>Layout generato</div>
                <div style={{fontSize: 12, color: PN.GREEN}}>
                  Riconosciuti <b>{generated.tavoli.length} tavoli</b> ({generated.tavoli.reduce((a,t)=>a+t.coperti,0)} coperti) e <b>{generated.furniture.length} elementi</b> di arredo
                </div>
              </div>
            </div>
            <div style={{
              padding: 14, background:'#FBF8F4', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
              display:'flex', alignItems:'center', gap: 12, marginBottom: 16,
            }}>
              <div style={{display:'inline-flex', color: PN.MUTED}}><BuIcons.info size={20}/></div>
              <div style={{flex: 1, fontSize: 12.5, color: PN.MUTED, lineHeight: 1.5}}>
                Il layout sostituirà l'attuale configurazione di questa sala. Potrai modificare manualmente tutto dopo l'import.
              </div>
            </div>
            <div style={{display:'flex', gap: 10, justifyContent:'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setStep('upload')}>Carica un altro file</ImpButton>
              <ImpButton variant="primary" icon={<BuIcons.check size={13}/>} onClick={() => onImport(generated)}>Applica layout</ImpButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Animations
if (typeof document !== 'undefined' && !document.getElementById('sala-anims')) {
  const s = document.createElement('style');
  s.id = 'sala-anims';
  s.textContent = `
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    @keyframes dialogIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes skelPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
  `;
  document.head.appendChild(s);
}

window.ImpSalaTavoli = ImpSalaTavoli;
