// Impostazioni → Sala e tavoli (v4: undo, dialog conferma, sort numerico, skeleton, AI import, touch)

// Sort numerico-aware: "Tav.2" prima di "Tav.10"
function naturalCompare(a, b) {
  return String(a).localeCompare(String(b), 'it', { numeric: true, sensitivity: 'base' });
}

// I nomi tavolo seguono il formato "Tav.N" e sono univoci a livello globale (across sale).
// Il prossimo nome riempie il primo numero mancante crescente.
function nextGlobalTavoloNames(sale, count = 1) {
  const used = new Set();
  (sale || []).forEach(s => (s.tavoli || []).forEach(t => {
    const m = String(t.name || '').match(/^Tav(?:olo)?\.?\s*(\d+)$/i);
    if (m) used.add(parseInt(m[1], 10));
  }));
  const names = [];
  let n = 1;
  while (names.length < count) {
    while (used.has(n)) n++;
    used.add(n);
    names.push(`Tav.${n}`);
  }
  return names;
}
function nextGlobalTavoloName(sale) {
  return nextGlobalTavoloNames(sale, 1)[0];
}

const TAVOLI_INIT = Array.from({length: 8}).map((_, i) => ({
  id: i + 1,
  name: `Tav.${i+1}`,
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
  { id: 'f1', label: 'Cucina', x: 0.3, y: 4.5, w: 2, h: 1.3, color: '#E04347', kind: 'furniture' },
  { id: 'f2', label: 'Bagno', x: 8, y: 4.5, w: 1.5, h: 1.2, color: '#9CA3AF', kind: 'furniture' },
];

// ─── Dimensione sala → griglia mappa + capienza tavoli ───
const M_PER_CELL = 1.2;     // 1 cella della mappa ≈ 1,2 m
const MQ_PER_TAVOLO = 5;    // spazio medio per tavolo (tavolo + sedie + passaggio)
const DEF_W = 12, DEF_D = 7.2; // sala di default ≈ griglia 10×6
const salaGrid = (s) => ({
  cols: Math.max(4, Math.min(20, Math.round((s?.widthM || DEF_W) / M_PER_CELL))),
  rows: Math.max(3, Math.min(14, Math.round((s?.depthM || DEF_D) / M_PER_CELL))),
});
const salaMaxTavoli = (s) =>
  Math.max(1, Math.floor(((s?.widthM || DEF_W) * (s?.depthM || DEF_D)) / MQ_PER_TAVOLO));

function TavoloShape({ shape, size = 36, active = true, coperti }) {
  const fill = active ? PN.PINK_SOFT : '#F4F5F7';
  const border = active ? PN.PINK : PN.BORDER;
  const text = active ? PN.PINK_DARK : PN.MUTED;
  const common = { background: fill, border: `2px solid ${border}`, color: text, display:'grid', placeItems:'center', fontSize: 13, fontWeight: 800 };
  if (shape === 'round') return <div style={{...common, width: size, height: size, borderRadius: '50%'}}>{coperti}</div>;
  if (shape === 'rect') return <div style={{...common, width: size * 1.5, height: size * 0.7, borderRadius: 6}}>{coperti}</div>;
  return <div style={{...common, width: size, height: size, borderRadius: 6}}>{coperti}</div>;
}
window.TavoloShape = TavoloShape;

function ImpSalaTavoli() {
  const [sale, setSale] = React.useState([
    {id:1, name:'Sala principale', active: true, widthM: 12, depthM: 7.2, tavoli: TAVOLI_INIT, furniture: FURNITURE_INIT, groups: []},
    {id:2, name:'Saletta riservata', active: false, widthM: 6, depthM: 4.8, tavoli: [], furniture: [], groups: []},
    {id:3, name:'Terrazza estiva', active: false, widthM: 9, depthM: 6, tavoli: [], furniture: [], groups: []},
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
  const [bulkMoveOpen, setBulkMoveOpen] = React.useState(false);
  const [draggingIds, setDraggingIds] = React.useState([]);
  const [dragOverSalaId, setDragOverSalaId] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [filterStato, setFilterStato] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('name');
  const [toast, setToast] = React.useState(null); // { msg, undo }
  const [confirmDialog, setConfirmDialog] = React.useState(null); // { title, msg, danger, onConfirm }
  const [importModal, setImportModal] = React.useState(false);
  const [disattivaModal, setDisattivaModal] = React.useState(false); // conferma spegnimento modulo sala
  const [isLoadingSala, setIsLoadingSala] = React.useState(false);

  // Moduli attivi (sincronizzati con localStorage condiviso tra pagine —
  // helper byupRead/WriteModules in panoramica-sidebar.jsx). Il toggle qui è
  // speculare a quello della tab Operazioni: stessa chiave, stessa notifica.
  const readMods = () => (window.byupReadModules ? window.byupReadModules() : {sala:true, prenotazioni:true});
  const [modules, setModules] = React.useState(readMods);
  React.useEffect(() => {
    const update = () => setModules(readMods());
    window.addEventListener('byup-modules-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('byup-modules-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);
  const setModule = (key, val) => {
    const next = {...readMods(), [key]: val};
    setModules(next);
    if (window.byupWriteModules) window.byupWriteModules(next);
  };

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
        setBulkMoveOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    if (!bulkMoveOpen) return;
    const close = () => setBulkMoveOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [bulkMoveOpen]);

  // Se la selezione si svuota, chiudi il dropdown
  React.useEffect(() => { if (selected.size === 0) setBulkMoveOpen(false); }, [selected]);

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
    const name = nextGlobalTavoloName(sale);
    setTavoli(prev => [...prev, {...t, id: newId, name, pos: {x: Math.min(9, t.pos.x + 0.7), y: t.pos.y}}]);
  };

  // Sposta più tavoli dalla sala attiva a un'altra sala (bulk)
  const bulkMoveTavoli = (ids, targetSalaId) => {
    if (targetSalaId === activeId || !ids || ids.length === 0) return;
    const target = sale.find(s => s.id === targetSalaId);
    if (!target) return;
    const movingTavoli = tavoli.filter(t => ids.includes(t.id));
    if (movingTavoli.length === 0) return;
    const snapshot = sale.map(s => ({
      ...s, tavoli: [...(s.tavoli || [])], groups: [...(s.groups || [])],
    }));
    // Nomi globalmente univoci: il tavolo conserva il suo nome
    const targetWorking = [...(target.tavoli || [])];
    let nextId = targetWorking.length ? Math.max(...targetWorking.map(x => x.id)) + 1 : 1;
    const newEntries = movingTavoli.map(t => ({...t, id: nextId++}));
    setSale(prev => prev.map(s => {
      if (s.id === activeId) {
        return {
          ...s,
          tavoli: s.tavoli.filter(x => !ids.includes(x.id)),
          groups: (s.groups || [])
            .map(g => ({...g, tableIds: g.tableIds.filter(x => !ids.includes(x))}))
            .filter(g => g.tableIds.length > 1),
        };
      }
      if (s.id === targetSalaId) {
        return {...s, tavoli: [...(s.tavoli || []), ...newEntries]};
      }
      return s;
    }));
    setSelected(new Set());
    const count = movingTavoli.length;
    showToast(`${count} ${count === 1 ? 'tavolo spostato' : 'tavoli spostati'} in "${target.name}"`, () => setSale(snapshot));
  };

  // Sposta un tavolo dalla sala attiva a un'altra sala
  const moveTavolo = (id, targetSalaId) => {
    if (targetSalaId === activeId) return;
    const t = tavoli.find(x => x.id === id);
    const target = sale.find(s => s.id === targetSalaId);
    if (!t || !target) return;
    const snapshot = sale.map(s => ({
      ...s,
      tavoli: [...(s.tavoli || [])],
      groups: [...(s.groups || [])],
    }));
    // ID univoco nella sala destinazione (i nomi sono già globalmente univoci)
    const targetIds = (target.tavoli || []).map(x => x.id);
    const newId = targetIds.length ? Math.max(...targetIds) + 1 : 1;
    setSale(prev => prev.map(s => {
      if (s.id === activeId) {
        return {
          ...s,
          tavoli: s.tavoli.filter(x => x.id !== id),
          groups: (s.groups || [])
            .map(g => ({...g, tableIds: g.tableIds.filter(x => x !== id)}))
            .filter(g => g.tableIds.length > 1),
        };
      }
      if (s.id === targetSalaId) {
        return {...s, tavoli: [...(s.tavoli || []), {...t, id: newId}]};
      }
      return s;
    }));
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
    showToast(`"${t.name}" spostato in "${target.name}"`, () => setSale(snapshot));
  };

  // Drag & drop tavoli → sala (sidebar)
  const handleTavoloDragStart = (tavoloId) => {
    const ids = selected.has(tavoloId) && selected.size > 1 ? [...selected] : [tavoloId];
    setDraggingIds(ids);
  };
  const handleTavoloDragEnd = () => {
    setDraggingIds([]);
    setDragOverSalaId(null);
  };
  const handleSalaDrop = (targetSalaId) => {
    if (!draggingIds.length || targetSalaId === activeId) {
      handleTavoloDragEnd();
      return;
    }
    if (draggingIds.length === 1) moveTavolo(draggingIds[0], targetSalaId);
    else bulkMoveTavoli(draggingIds, targetSalaId);
    handleTavoloDragEnd();
  };

  const createTable = (pos) => {
    const max = salaMaxTavoli(active);
    if (tavoli.length >= max) {
      setConfirmDialog({
        title: 'Spazio esaurito',
        msg: `Questa sala (${active?.widthM || DEF_W}×${active?.depthM || DEF_D} m) può contenere al massimo ${max} tavoli. Ingrandisci la sala per aggiungerne altri.`,
        confirmLabel: 'Modifica sala',
        onConfirm: () => { setConfirmDialog(null); setEditSala({...active}); },
        cancelLabel: 'Ho capito',
      });
      return;
    }
    const newId = Math.max(0, ...tavoli.map(x => x.id)) + 1;
    const name = nextGlobalTavoloName(sale);
    const newT = { id: newId, name, alias: '', coperti: 4, shape: 'square', disabled: false, pos };
    setTavoli(prev => [...prev, newT]);
    setCreatingTable(newId);
  };

  // Duplica N tavoli con la stessa configurazione (posti/forma) accanto al tavolo iniziale.
  const createMoreTavoli = (count, config, basePos) => {
    if (!count || count < 1) return;
    const names = nextGlobalTavoloNames(sale, count);
    const baseId = Math.max(0, ...tavoli.map(x => x.id));
    const newTavoli = names.map((name, i) => ({
      id: baseId + 1 + i,
      name,
      alias: '',
      coperti: config.coperti,
      shape: config.shape || 'square',
      disabled: false,
      pos: {
        x: Math.min(9, (basePos?.x ?? 4) + (i + 1) * 0.7),
        y: basePos?.y ?? 2.5,
      },
    }));
    setTavoli(prev => [...prev, ...newTavoli]);
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
    // Unisci due tavoli in un gruppo: entrambi restano visibili sulla mappa,
    // FloorPlan disegna una cornice tratteggiata "Unione · N cop" attorno a loro.
    const dragged = tavoli.find(t => t.id === idDragged);
    const target = tavoli.find(t => t.id === idTarget);
    if (!dragged || !target) return;
    // Se uno dei due è già in un gruppo, estendi quel gruppo invece di crearne uno nuovo.
    const existing = groups.find(g => g.tableIds.includes(idDragged) || g.tableIds.includes(idTarget));
    const snapshot = [...groups];
    if (existing) {
      const merged = { ...existing, tableIds: Array.from(new Set([...existing.tableIds, idDragged, idTarget])) };
      setGroups(prev => prev.map(g => g.id === existing.id ? merged : g));
    } else {
      const newGid = (groups.reduce((m,g) => Math.max(m, g.id || 0), 0) || 0) + 1;
      setGroups(prev => [...prev, { id: newGid, tableIds: [idTarget, idDragged] }]);
    }
    const totalCop = (target.coperti || 0) + (dragged.coperti || 0);
    showToast(`"${dragged.name}" unito a "${target.name}" (${totalCop} posti)`, () => {
      setGroups(snapshot);
      setTavoli(prev => prev.map(t => t.id === idDragged ? dragged : t));
    });
  };
  const ungroupTables = (gid) => setGroups(prev => prev.filter(g => g.id !== gid));

  const removeFromGroup = (tableId) => {
    const group = groups.find(g => g.tableIds.includes(tableId));
    if (!group) return;
    const remaining = group.tableIds.filter(id => id !== tableId);
    if (remaining.length <= 1) {
      setGroups(prev => prev.filter(g => g.id !== group.id));
    } else {
      setGroups(prev => prev.map(g => g.id === group.id ? {...g, tableIds: remaining} : g));
    }
    setEditingTable(null);
  };

  // Filter + sort lista
  let visible = [...tavoli];
  if (search) visible = visible.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || (t.alias||'').toLowerCase().includes(search.toLowerCase()));
  if (filterStato === 'attivi') visible = visible.filter(t => !t.disabled);
  if (filterStato === 'fuoriuso') visible = visible.filter(t => t.disabled);
  if (sortBy === 'name') visible.sort((a,b) => naturalCompare(a.name, b.name));
  else if (sortBy === 'coperti-asc') visible.sort((a,b) => a.coperti - b.coperti);
  else if (sortBy === 'coperti-desc') visible.sort((a,b) => b.coperti - a.coperti);
  const isFiltering = search || filterStato !== 'all';

  // Configurazione sale/tavoli — renderizzata solo quando il modulo Sala è
  // attivo (vedi return in fondo): da spenta resta solo la card di riattivazione.
  const configGrid = (
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
              const isDragTarget = draggingIds.length > 0 && s.id !== activeId;
              const isDragOver = isDragTarget && dragOverSalaId === s.id;
              return (
                <div key={s.id} style={{position:'relative'}}>
                  <div
                    onClick={() => switchSala(s.id)}
                    onDragOver={(e) => {
                      if (!isDragTarget) return;
                      e.preventDefault();
                      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                      if (dragOverSalaId !== s.id) setDragOverSalaId(s.id);
                    }}
                    onDragLeave={(e) => {
                      if (!isDragTarget) return;
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setDragOverSalaId(prev => prev === s.id ? null : prev);
                      }
                    }}
                    onDrop={(e) => {
                      if (!isDragTarget) return;
                      e.preventDefault();
                      handleSalaDrop(s.id);
                    }}
                    style={{
                      display:'block', padding: '12px 14px', position:'relative',
                      border: `1.5px solid ${isDragOver ? PN.PINK_DARK : (isOpen ? PN.PINK : PN.BORDER_SOFT)}`,
                      background: isDragOver ? PN.PINK_SOFT : (isOpen ? PN.PINK_SOFT : PN.WHITE),
                      borderRadius: 10, textAlign:'left',
                      cursor:'pointer', width:'100%',
                      transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isDragOver ? `0 0 0 3px ${PN.PINK_SOFT}, 0 6px 18px rgba(220, 38, 100, 0.18)` : 'none',
                      transition:'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
                      animation: isDragTarget && !isDragOver ? 'salaDropPulse 1.6s ease-in-out infinite' : 'none',
                    }}
                  >
                    <div style={{display:'flex', alignItems:'center', gap: 6, marginBottom: 4}}>
                      <span style={{fontSize:15.5, fontWeight:700, flex:1, color: isOpen ? PN.PINK_DARK : PN.TEXT}}>{s.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSale(prev => prev.map(x => x.id === s.id ? {...x, active: !x.active} : x));
                        }}
                        title={s.active ? 'Clicca per disattivare' : 'Clicca per attivare'}
                        style={{
                          display:'inline-flex', alignItems:'center', gap:5,
                          padding:'2px 8px', borderRadius:999,
                          border:'none', cursor:'pointer', fontFamily:'inherit',
                          fontSize:12.5, fontWeight:700, letterSpacing:0.3,
                          background: s.active ? PN.GREEN_SOFT : '#F1F3F5',
                          color: s.active ? PN.GREEN : PN.MUTED,
                          transition:'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = s.active ? '#D6F0DC' : '#E5E7EB'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = s.active ? PN.GREEN_SOFT : '#F1F3F5'; }}
                      >
                        <span style={{
                          width:6, height:6, borderRadius:'50%',
                          background: s.active ? PN.GREEN : '#9CA3AF',
                        }}/>
                        {s.active ? 'ATTIVA' : 'INATTIVA'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSalaMenu(menuOpen ? null : s.id); }}
                        style={{
                          width: 22, height: 22, borderRadius: 5,
                          background: menuOpen ? PN.WHITE : 'transparent',
                          border:'none', cursor:'pointer',
                          color: PN.MUTED, fontSize: 16,
                          display:'grid', placeItems:'center',
                        }}>⋯</button>
                    </div>
                    <div style={{fontSize:13.5, color:PN.MUTED, display:'flex', alignItems:'center', gap:6}}>
                      {sCount > 0 ? (
                        <>
                          <span>{sCount} {sCount === 1 ? 'tavolo' : 'tavoli'}</span>
                          <span style={{color: PN.BORDER}}>·</span>
                          <span
                            title={`${sCop} ${sCop === 1 ? 'posto' : 'posti'}`}
                            style={{display:'inline-flex', alignItems:'center', gap:3}}
                          >
                            <BuIcons.chair size={11}/>
                            {sCop}
                          </span>
                        </>
                      ) : 'Nessun tavolo'}
                    </div>
                    {isDragOver && (
                      <div style={{
                        position:'absolute', inset:0, borderRadius: 10,
                        background: 'linear-gradient(135deg, rgba(245, 200, 220, 0.55), rgba(220, 38, 100, 0.18))',
                        display:'flex', alignItems:'center', justifyContent:'center', gap: 6,
                        fontSize: 14, fontWeight: 800, color: PN.PINK_DARK,
                        letterSpacing: 0.4, textTransform: 'uppercase',
                        pointerEvents: 'none',
                        animation: 'dropHintIn .14s ease-out',
                      }}>
                        <span style={{display:'inline-flex'}}><BuIcons.send size={14}/></span>
                        Sposta {draggingIds.length} {draggingIds.length === 1 ? 'tavolo qui' : 'tavoli qui'}
                      </div>
                    )}
                  </div>
                  {menuOpen && (
                    <div onClick={e => e.stopPropagation()} style={{
                      position:'absolute', top: 38, right: 10, zIndex: 20,
                      minWidth: 170, background: PN.WHITE,
                      border: `1px solid ${PN.BORDER}`, borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: 6,
                    }}>
                      <MenuItem icon={<BuIcons.edit size={14}/>} onClick={() => { setEditSala({...s}); setSalaMenu(null); }}>Modifica sala</MenuItem>
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
          <AiUploadCta onClick={() => setImportModal(true)}>
            Importa planimetria con AI
          </AiUploadCta>
          <div style={{fontSize: 13, color: PN.MUTED, textAlign:'center', lineHeight: 1.45, marginTop: 2}}>
            Carica una foto o un PDF della tua sala e l'AI riconoscerà tavoli e disposizione
          </div>
        </div>
      </aside>

      <main>
        <ImpCard
          aurora
          title={active?.name}
          sub={(() => {
            const op = tavoli.filter(t => !t.disabled);
            const cop = op.reduce((a, t) => a + t.coperti, 0);
            return (
              <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                <span>{op.length}/{tavoli.length} tavoli attivi</span>
                <span style={{color: PN.BORDER}}>·</span>
                <span
                  title={`${cop} ${cop === 1 ? 'posto' : 'posti'}`}
                  style={{display:'inline-flex', alignItems:'center', gap:3}}
                >
                  <BuIcons.chair size={12}/>
                  {cop}
                </span>
              </span>
            );
          })()}
          action={
            <div style={{display:'flex', gap: 8, alignItems:'center'}}>
              <div style={{display:'flex', background:'#F4F5F7', padding:3, borderRadius:8, gap:2}}>
                {[
                  {id:'lista', label:'Lista', icon: <BuIcons.list size={12}/>},
                  {id:'mappa', label:'Mappa', icon: <BuIcons.grid size={12}/>},
                ].map(v => (
                  <button key={v.id} onClick={() => setView(v.id)} style={{
                    padding:'6px 12px', borderRadius: 6,
                    background: view===v.id ? PN.WHITE : 'transparent',
                    border:'none',
                    color: view===v.id ? PN.TEXT : PN.MUTED,
                    fontSize: 14, fontWeight: 600,
                    cursor:'pointer', fontFamily:'inherit',
                    boxShadow: view===v.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    display:'inline-flex', alignItems:'center', gap: 5,
                  }}><span style={{display:'inline-flex'}}>{v.icon}</span>{v.label}</button>
                ))}
              </div>
            </div>
          }
        >
          {view === 'lista' && (
            <>
              {tavoli.length > 0 && (
                <div style={{display:'flex', gap: 8, marginBottom: 14, flexWrap:'wrap'}}>
                  <div style={{position:'relative', flex: '1 1 240px', minWidth: 200}}>
                    <span style={{position:'absolute', left: 11, top:'50%', transform:'translateY(-50%)', display:'inline-flex', color: PN.MUTED}}><BuIcons.search size={13}/></span>
                    <input
                      value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Cerca tavolo per nome o alias…"
                      style={{
                        width:'100%', padding:'9px 12px 9px 34px',
                        border:`1px solid ${PN.BORDER}`, borderRadius: 8,
                        fontSize: 15, fontFamily:'inherit', outline:'none',
                      }}
                    />
                  </div>
                  <select value={filterStato} onChange={e => setFilterStato(e.target.value)} style={{
                    padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 8,
                    fontSize: 15, fontFamily:'inherit', background: PN.WHITE, cursor:'pointer',
                  }}>
                    <option value="all">Tutti gli stati</option>
                    <option value="attivi">Attivi</option>
                    <option value="fuoriuso">Inattivi</option>
                  </select>
                  <ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={() => {
                    // Crea tavolo a posizione di default e apri popover
                    const center = { x: 4, y: 2.5 };
                    const newId = Math.max(0, ...tavoli.map(x => x.id)) + 1;
                    setTavoli(prev => [...prev, { id: newId, name: nextGlobalTavoloName(sale), alias: '', coperti: 4, shape: 'square', disabled: false, pos: center }]);
                    setCreatingTable(newId);
                  }}>
                    Aggiungi tavolo
                  </ImpButton>
                </div>
              )}

              {selected.size > 0 && (() => {
                const sel = tavoli.filter(t => selected.has(t.id));
                const someActive = sel.some(t => !t.disabled);
                return (
                <div style={{
                  display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap',
                  padding:'10px 14px', marginBottom: 14,
                  background: PN.PINK_SOFT, border: `1px solid ${PN.PINK}`, borderRadius: 9,
                }}>
                  <span style={{fontSize: 15, fontWeight: 700, color: PN.PINK_DARK}}>
                    {selected.size} {selected.size===1?'tavolo selezionato':'tavoli selezionati'}
                  </span>
                  <span style={{flex:1}}/>
                  <ImpButton variant="ghost" icon={<BuIcons.download size={13}/>} onClick={() => setQrModal({mode: 'bulk', tavoli: sel})}>Scarica QR</ImpButton>
                  <div style={{position:'relative'}} onClick={e => e.stopPropagation()}>
                    <ImpButton
                      variant="ghost"
                      icon={<BuIcons.send size={13}/>}
                      onClick={() => setBulkMoveOpen(v => !v)}
                    >Sposta</ImpButton>
                    {bulkMoveOpen && (() => {
                      const otherSale = sale.filter(s => s.id !== activeId);
                      return (
                        <div style={{
                          position:'absolute', top:'calc(100% + 6px)', right: 0, zIndex: 60,
                          minWidth: 240, background: PN.WHITE,
                          border: `1px solid ${PN.BORDER}`, borderRadius: 10,
                          boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 6,
                          animation: 'tcMenuIn .16s cubic-bezier(.2,.8,.2,1)',
                          transformOrigin: 'top right',
                        }}>
                          <div style={{padding:'6px 10px 4px', fontSize:12.5, fontWeight:700, color: PN.MUTED, letterSpacing:0.4, textTransform:'uppercase'}}>
                            Sposta {selected.size} {selected.size === 1 ? 'tavolo in' : 'tavoli in'}
                          </div>
                          {otherSale.length === 0 ? (
                            <div style={{padding:'8px 10px', fontSize:13.5, color: PN.MUTED, fontStyle:'italic'}}>
                              Nessun'altra sala disponibile
                            </div>
                          ) : otherSale.map((s, i) => (
                            <button
                              key={s.id}
                              onClick={() => { bulkMoveTavoli([...selected], s.id); setBulkMoveOpen(false); }}
                              style={{
                                display:'flex', alignItems:'center', gap:8, width:'100%',
                                padding:'8px 10px', border:'none', background:'transparent',
                                cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                                borderRadius:6, color: PN.TEXT, fontSize:15, fontWeight:600,
                                transition:'background .12s',
                                animation: `tcSubItemIn .22s ${i * 30}ms both cubic-bezier(.2,.8,.2,1)`,
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = PN.PINK_SOFT}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <span style={{display:'inline-flex', color: PN.MUTED}}>
                                <BuIcons.storefront size={13}/>
                              </span>
                              <span style={{flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.name}</span>
                              <span style={{
                                fontSize:11.5, fontWeight:700, letterSpacing:0.3,
                                padding:'1px 6px', borderRadius:999,
                                background: s.active ? PN.GREEN_SOFT : '#F1F3F5',
                                color: s.active ? PN.GREEN : PN.MUTED,
                              }}>{s.active ? 'ATTIVA' : 'INATTIVA'}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
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
                isFiltering ? (
                  <div style={{padding: '50px 20px', textAlign:'center', border:`1.5px dashed ${PN.BORDER}`, borderRadius: 12, background:'#FAFBFC'}}>
                    <div style={{display:'inline-flex', marginBottom: 10, color: PN.MUTED_SOFT}}><BuIcons.search size={36}/></div>
                    <div style={{fontSize: 17, fontWeight: 700, marginBottom: 6}}>Nessun tavolo trovato</div>
                    <div style={{fontSize: 14.5, color: PN.MUTED, marginBottom: 16}}>Prova a modificare i filtri.</div>
                    <ImpButton variant="ghost" onClick={() => { setSearch(''); setFilterStato('all'); }}>Resetta filtri</ImpButton>
                  </div>
                ) : (
                  <div style={{padding: '60px 20px', textAlign:'center'}}>
                    <div style={{display:'inline-flex', marginBottom: 12, color: PN.MUTED_SOFT}}><BuIcons.table size={40}/></div>
                    <div style={{fontSize: 16, fontWeight: 600, color: PN.MUTED, marginBottom: 16}}>Nessun tavolo in questa sala</div>
                    <ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={() => {
                      const center = { x: 4, y: 2.5 };
                      const newId = Math.max(0, ...tavoli.map(x => x.id)) + 1;
                      setTavoli(prev => [...prev, { id: newId, name: nextGlobalTavoloName(sale), alias: '', coperti: 4, shape: 'square', disabled: false, pos: center }]);
                      setCreatingTable(newId);
                    }}>
                      Aggiungi tavolo
                    </ImpButton>
                  </div>
                )
              ) : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10}}>
                  {visible.map(t => (
                    <TableCard
                      key={t.id} t={t}
                      sale={sale}
                      activeSalaId={activeId}
                      selected={selected.has(t.id)}
                      menuOpen={openMenu === t.id}
                      isDragging={draggingIds.includes(t.id)}
                      anyDragging={draggingIds.length > 0}
                      onSelect={() => toggleSelect(t.id)}
                      onUpdate={(patch) => updateTavolo(t.id, patch)}
                      onMenuToggle={(e) => { e.stopPropagation(); setOpenMenu(openMenu === t.id ? null : t.id); }}
                      onMove={(targetId) => { moveTavolo(t.id, targetId); setOpenMenu(null); }}
                      onDragStart={() => handleTavoloDragStart(t.id)}
                      onDragEnd={handleTavoloDragEnd}
                      onDuplicate={() => { duplicaTavolo(t.id); setOpenMenu(null); }}
                      onQR={() => { setQrModal({mode: 'single', tavoli: [t]}); setOpenMenu(null); }}
                      onDisable={() => { updateTavolo(t.id, {disabled: !t.disabled}); setOpenMenu(null); }}
                      onDelete={() => {
                        setOpenMenu(null);
                        setConfirmDialog({
                          title: `Elimina "${t.name}"?`,
                          msg: "Sei sicuro? Ciò comporterà l'eliminazione del Qr Code associato",
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
            <>
            <FloorPlan
              cols={salaGrid(active).cols}
              rows={salaGrid(active).rows}
              tavoli={tavoli}
              furniture={furniture}
              groups={groups}
              selected={selected}
              onCreateTable={createTable}
              onCreateFurniture={createFurniture}
              onMoveTable={(id, pos) => updateTavolo(id, {pos})}
              onBulkMoveTables={(updates) => setTavoli(prev => prev.map(t => updates[t.id] ? {...t, pos: updates[t.id]} : t))}
              onMoveFurniture={(id, pos) => setFurniture(prev => prev.map(f => f.id === id ? {...f, ...pos} : f))}
              onResizeFurniture={(id, dim) => setFurniture(prev => prev.map(f => f.id === id ? {...f, ...dim} : f))}
              onRotateFurniture={(id) => setFurniture(prev => prev.map(f => f.id === id ? {...f, w: f.h, h: f.w} : f))}
              onDeleteFurniture={deleteFurniture}
              onMergeTables={mergeTables}
              onUngroupTables={ungroupTables}
              onSelectTable={toggleSelect}
              onEditTable={(id) => setEditingTable(id)}
            />
            </>
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
          onUpdate={(patch) => updateTavolo(creatingTable, patch)}
          onCreateMore={(count) => {
            const t = tavoli.find(x => x.id === creatingTable);
            if (t) createMoreTavoli(count, {coperti: t.coperti, shape: t.shape}, t.pos);
          }}
          onClose={() => setCreatingTable(null)}
          onDelete={() => { deleteTavolo(creatingTable); setCreatingTable(null); }}
        />
      )}
      {editingTable !== null && (
        <TablePopover
          tavolo={tavoli.find(t => t.id === editingTable)}
          onUpdate={(patch) => updateTavolo(editingTable, patch)}
          onClose={() => setEditingTable(null)}
          groupInfo={groups.find(g => g.tableIds.includes(editingTable))}
          onRemoveFromGroup={() => removeFromGroup(editingTable)}
          onDelete={() => {
            const t = tavoli.find(x => x.id === editingTable);
            setConfirmDialog({
              title: 'Eliminare il tavolo?',
              msg: "Sei sicuro? Ciò comporterà l'eliminazione del Qr Code associato",
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

  return (
    <div>
      {/* Toggle modulo Sala — speculare alla tab Operazioni
          (stessa chiave localStorage, stesso pattern pill + ImpToggle).
          Qui vive la "riattivazione" promessa dall'onboarding solo-asporto.
          Il toggle Prenotazioni vive solo in Operazioni. */}
      <ImpModuloSalaCard active={modules.sala} onToggle={(v) => {
        // Spegnere elimina tavoli e QR: passa sempre dal popup di conferma
        if (!v) { setDisattivaModal(true); return; }
        setModule('sala', true);
      }}/>

      {modules.sala && configGrid}

      {disattivaModal && <DisattivaSalaModal
        tavoli={sale.flatMap(s => s.tavoli || [])}
        onClose={() => setDisattivaModal(false)}
        onConfirmed={() => {
          setSale(prev => prev.map(s => ({...s, tavoli: [], groups: []})));
          setSelected(new Set());
          setModule('sala', false);
          setDisattivaModal(false);
        }}
      />}
    </div>
  );
}

// ─── Card modulo — toggle di (ri)attivazione Sala ───
// Pattern identico alle sezioni della tab Operazioni (impostazioni-menu-cucina):
// header con pill Attivo/Non attivo + ImpToggle, body con empty-state tratteggiato
// quando il modulo è spento. Le impostazioni complete restano in Operazioni.

function ImpModuleStatusPill({ active }) {
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, letterSpacing: 0.4,
      padding: '3px 9px', borderRadius: 999,
      background: active ? PN.GREEN_SOFT : '#F4F5F7',
      color: active ? PN.GREEN : PN.MUTED,
      textTransform: 'uppercase',
    }}>
      {active ? 'Attivo' : 'Non attivo'}
    </span>
  );
}

function ImpModuloSalaCard({ active, onToggle }) {
  return (
    <ImpCard
      title="Sala e tavoli"
      sub={active
        ? "Il modulo è attivo: la sezione Sala è visibile nel gestionale"
        : "Attiva per configurare sale, tavoli e mappa del locale"
      }
      action={
        <div style={{display:'flex', alignItems:'center', gap: 10}}>
          <ImpModuleStatusPill active={active}/>
          <ImpToggle checked={active} onChange={() => onToggle(!active)}/>
        </div>
      }
    >
      {active ? (
        <div style={{fontSize: 14, color: PN.MUTED, lineHeight: 1.5}}>
          Configura qui sotto sale, tavoli e mappa. Il flusso ordini in cucina e il coperto
          si impostano nella tab <strong style={{color: PN.TEXT}}>Operazioni</strong>.
        </div>
      ) : (
        <div style={{
          padding: '28px 20px', textAlign:'center',
          background:'#FAFBFC', borderRadius: 11,
          border: `1px dashed ${PN.BORDER}`,
        }}>
          <div style={{
            width: 48, height: 48, margin:'0 auto 10px',
            borderRadius: 12, background: PN.WHITE,
            border: `1px solid ${PN.BORDER}`,
            display:'grid', placeItems:'center', color: PN.MUTED,
          }}>
            <PnI.Plate size={22}/>
          </div>
          <div style={{fontSize: 15.5, fontWeight: 700, marginBottom: 4}}>Sala disattivata</div>
          <div style={{fontSize: 14, color: PN.MUTED, marginBottom: 14, maxWidth: 360, margin:'0 auto 14px'}}>
            Attivando la sala potrai configurare sale, tavoli e mappa del locale.
            La sezione Sala tornerà visibile nel gestionale.
          </div>
          <ImpButton variant="primary" onClick={() => onToggle(true)}>Attiva sala</ImpButton>
        </div>
      )}
    </ImpCard>
  );
}

function TableCard({ t, sale, activeSalaId, selected, menuOpen, isDragging, anyDragging, onSelect, onUpdate, onMenuToggle, onMove, onDragStart, onDragEnd, onDuplicate, onQR, onDisable, onDelete }) {
  const [moveSubOpen, setMoveSubOpen] = React.useState(false);
  const [moving, setMoving] = React.useState(false);

  // Chiudi il submenu se il menu padre si richiude
  React.useEffect(() => { if (!menuOpen) setMoveSubOpen(false); }, [menuOpen]);

  const otherSale = (sale || []).filter(s => s.id !== activeSalaId);

  const triggerMove = (targetSalaId) => {
    setMoving(true);
    // attendi la fine dell'animazione di uscita prima di rimuovere dal DOM
    setTimeout(() => onMove(targetSalaId), 240);
  };

  return (
    <div
      draggable={!moving}
      onDragStart={(e) => {
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          // Dato simbolico — la logica vera passa via state nel parent
          try { e.dataTransfer.setData('text/plain', String(t.id)); } catch {}
        }
        onDragStart?.();
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={() => { if (!moving) onSelect(); }}
      role="button" tabIndex={0} aria-pressed={selected}
      onKeyDown={e => { if (!moving && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); onSelect(); } }}
      style={{
        padding: '12px 14px', position:'relative',
        border:`1.5px solid ${selected ? PN.PINK : PN.BORDER_SOFT}`,
        borderRadius: 10,
        background: selected ? PN.PINK_SOFT : PN.WHITE,
        opacity: moving ? 0 : (isDragging ? 0.45 : (t.disabled ? 0.78 : 1)),
        transform: moving
          ? 'translateX(24px) scale(0.94)'
          : (isDragging ? 'scale(0.97) rotate(-1.2deg)' : 'none'),
        pointerEvents: moving ? 'none' : 'auto',
        zIndex: menuOpen ? 50 : (isDragging ? 40 : 1),
        cursor: moving ? 'default' : (anyDragging ? 'grabbing' : 'grab'),
        userSelect: 'none',
        boxShadow: isDragging ? '0 14px 32px rgba(63,20,36,0.18)' : 'none',
        transition: 'opacity 0.18s ease, transform 0.18s cubic-bezier(.4,0,.2,1), border-color 0.15s, background 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (!menuOpen && !moving && !anyDragging) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(63,20,36,0.06)'; }}}
      onMouseLeave={e => { if (!moving && !isDragging) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}}
    >
      <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 10}}>
        <span style={{fontSize:15.5, fontWeight:700}}>{t.name}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDisable(); }}
          title={t.disabled ? 'Clicca per attivare' : 'Clicca per disattivare'}
          style={{
            display:'inline-flex', alignItems:'center', gap:5,
            padding:'2px 8px', borderRadius:999,
            border:'none', cursor:'pointer', fontFamily:'inherit',
            fontSize:12.5, fontWeight:700, letterSpacing:0.3,
            background: t.disabled ? '#F1F3F5' : PN.GREEN_SOFT,
            color: t.disabled ? PN.MUTED : PN.GREEN,
            transition:'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = t.disabled ? '#E5E7EB' : '#D6F0DC'; }}
          onMouseLeave={e => { e.currentTarget.style.background = t.disabled ? '#F1F3F5' : PN.GREEN_SOFT; }}
        >
          <span style={{
            width:6, height:6, borderRadius:'50%',
            background: t.disabled ? '#9CA3AF' : PN.GREEN,
          }}/>
          {t.disabled ? 'INATTIVO' : 'ATTIVO'}
        </button>
        <button onClick={onMenuToggle} style={{
          marginLeft:'auto',
          width: 28, height: 28, borderRadius: 6,
          background: menuOpen ? '#F4F5F7' : 'transparent',
          border:'none', cursor:'pointer', color: PN.MUTED,
          display:'grid', placeItems:'center', fontSize: 18,
        }}>⋯</button>
        {menuOpen && (
          <div onClick={e => e.stopPropagation()} style={{
            position:'absolute', top: 38, right: 12, zIndex: 100,
            minWidth: 200, background: PN.WHITE,
            border: `1px solid ${PN.BORDER}`, borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 6,
            animation: 'tcMenuIn .16s cubic-bezier(.2,.8,.2,1)',
            transformOrigin: 'top right',
          }}>
            <MenuItem
              icon={<BuIcons.send size={14}/>}
              onClick={() => setMoveSubOpen(v => !v)}
            >
              <span style={{display:'flex', alignItems:'center', gap:6, width:'100%'}}>
                <span style={{flex:1}}>Sposta in altra sala</span>
                <span style={{
                  display:'inline-flex', color: PN.MUTED,
                  transform: moveSubOpen ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform .18s cubic-bezier(.4,0,.2,1)',
                }}>
                  <BuIcons.chevronRight size={12}/>
                </span>
              </span>
            </MenuItem>
            {moveSubOpen && (
              <div style={{
                margin: '2px 0 4px',
                padding: 4,
                background: '#FAFBFC',
                border: `1px solid ${PN.BORDER_SOFT}`,
                borderRadius: 8,
                overflow: 'hidden',
                animation: 'tcSubIn .18s cubic-bezier(.2,.8,.2,1)',
                transformOrigin: 'top',
              }}>
                {otherSale.length === 0 ? (
                  <div style={{padding:'8px 10px', fontSize:13.5, color: PN.MUTED, fontStyle:'italic'}}>
                    Nessun'altra sala disponibile
                  </div>
                ) : otherSale.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => triggerMove(s.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:8, width:'100%',
                      padding:'7px 10px', border:'none', background:'transparent',
                      cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                      borderRadius:6, color: PN.TEXT, fontSize:14.5, fontWeight:600,
                      transition:'background .12s',
                      animation: `tcSubItemIn .22s ${i * 30}ms both cubic-bezier(.2,.8,.2,1)`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = PN.PINK_SOFT}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{display:'inline-flex', color: PN.MUTED}}>
                      <BuIcons.storefront size={13}/>
                    </span>
                    <span style={{flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.name}</span>
                    <span style={{
                      fontSize:11.5, fontWeight:700, letterSpacing:0.3,
                      padding:'1px 6px', borderRadius:999,
                      background: s.active ? PN.GREEN_SOFT : '#F1F3F5',
                      color: s.active ? PN.GREEN : PN.MUTED,
                    }}>{s.active ? 'ATTIVA' : 'INATTIVA'}</span>
                  </button>
                ))}
              </div>
            )}
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
        {/* Posti stepper */}
        <div style={{flex: 1}}>
          <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 4}}>Posti</div>
          <div onClick={e => e.stopPropagation()} style={{display:'inline-flex', alignItems:'center', gap: 0, border:`1px solid ${PN.BORDER}`, borderRadius: 7, overflow:'hidden'}}>
            <button onClick={(e) => { e.stopPropagation(); onUpdate({coperti: Math.max(1, t.coperti - 1)}); }} style={{
              width: 28, height: 28, border:'none', background: PN.WHITE,
              cursor:'pointer', fontSize: 16, color: PN.TEXT,
            }}>−</button>
            <span style={{
              minWidth: 32, textAlign:'center', fontSize: 15.5, fontWeight: 700,
              borderLeft:`1px solid ${PN.BORDER}`, borderRight:`1px solid ${PN.BORDER}`,
              padding:'4px 0',
            }}>{t.coperti}</span>
            <button onClick={(e) => { e.stopPropagation(); onUpdate({coperti: Math.min(20, t.coperti + 1)}); }} style={{
              width: 28, height: 28, border:'none', background: PN.WHITE,
              cursor:'pointer', fontSize: 16, color: PN.TEXT,
            }}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TablePopover({ tavolo, isNew, onUpdate, onCreateMore, onClose, onDelete, groupInfo, onRemoveFromGroup }) {
  const [quantity, setQuantity] = React.useState(1);
  const [customOpen, setCustomOpen] = React.useState(false);
  if (!tavolo) return null;
  const unionLabel = groupInfo ? `Tav.${[...groupInfo.tableIds].sort((a,b) => a-b).join('-')}` : null;
  const handleConfirm = () => {
    if (isNew && quantity > 1 && onCreateMore) onCreateMore(quantity - 1);
    onClose();
  };
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, width: 420, maxWidth:'100%',
      }}>
        <div style={{padding:'18px 20px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, position:'relative'}}>
          <div style={{fontSize: 17, fontWeight: 700}}>
            {isNew ? <span style={{display:'inline-flex', alignItems:'center', gap: 8}}><BuIcons.sparkle size={16} color={PN.PINK_DARK}/> Nuovo tavolo posizionato</span> : `Modifica ${tavolo.name}`}
          </div>
          <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>
            {isNew ? 'Configura forma, posti e nome del tavolo' : 'Aggiorna le impostazioni del tavolo'}
          </div>
          <button onClick={onClose} style={{
            position:'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: 8,
            background:'#F4F5F7', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}><PnI.X size={13}/></button>
        </div>

        <div style={{padding:'18px 20px'}}>
          {groupInfo && (
            <div style={{
              display:'flex', alignItems:'center', gap: 10,
              padding:'10px 12px', marginBottom: 16,
              background: PN.PINK_SOFT, border:`1px solid ${PN.PINK}`, borderRadius: 9,
            }}>
              <div style={{flex: 1}}>
                <div style={{fontSize: 14, fontWeight: 700, color: PN.PINK_DARK}}>Parte dell'unione {unionLabel}</div>
                <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>Clicca per rimuovere solo questo tavolo</div>
              </div>
              <button
                onClick={onRemoveFromGroup}
                style={{
                  padding:'6px 12px', borderRadius: 7, whiteSpace:'nowrap',
                  background: PN.WHITE, color: PN.PINK_DARK,
                  border:`1.5px solid ${PN.PINK}`,
                  fontSize: 14, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}
              >Dividi</button>
            </div>
          )}
          <ImpField label="Nome">
            <div style={{
              width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius:8,
              fontSize:15.5, fontFamily:'inherit', background:'#FAFBFC', color: PN.TEXT,
              display:'flex', alignItems:'center', gap:8,
            }}>
              <span style={{flex:1, fontWeight:700}}>{tavolo.name}</span>
              <span style={{fontSize:13, color: PN.MUTED, fontStyle:'italic'}}>assegnato automaticamente</span>
            </div>
          </ImpField>

          <div style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>Posti</div>
          {(() => {
            const presets = [2,4,6,8,10,12];
            const isCustom = !presets.includes(tavolo.coperti);
            const showCustom = customOpen || isCustom;
            return (
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 6, marginBottom: 8}}>
                {presets.map(n => {
                  const on = tavolo.coperti === n;
                  return (
                    <button key={n} onClick={() => { setCustomOpen(false); onUpdate({coperti: n}); }} style={{
                      padding: '10px 0',
                      border:`1.5px solid ${on ? PN.PINK : PN.BORDER_SOFT}`,
                      background: on ? PN.PINK : PN.WHITE,
                      color: on ? PN.WHITE : PN.TEXT,
                      borderRadius: 8, fontSize: 16, fontWeight: 700,
                      cursor:'pointer', fontFamily:'inherit',
                      transition: 'background .12s, border-color .12s, color .12s',
                    }}>{n}</button>
                  );
                })}
                {/* Altro — collapsed: solo etichetta cliccabile / expanded: stepper integrato */}
                {showCustom ? (
                  <div style={{
                    gridColumn: 'span 2',
                    display:'flex', alignItems:'stretch',
                    border:`1.5px solid ${PN.PINK}`,
                    background: PN.PINK_SOFT,
                    borderRadius: 8, overflow:'hidden',
                    animation: 'tcMenuIn .16s cubic-bezier(.2,.8,.2,1)',
                    transformOrigin: 'center',
                  }}>
                    <span style={{
                      display:'inline-flex', alignItems:'center', paddingLeft: 10, paddingRight: 8,
                      fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
                      color: PN.PINK_DARK, whiteSpace: 'nowrap',
                    }}>Personalizzato</span>
                    <button
                      onClick={() => onUpdate({coperti: Math.max(1, tavolo.coperti - 1)})}
                      title="Diminuisci"
                      style={{
                        width: 26, border:'none', background:'transparent',
                        cursor:'pointer', fontSize: 17, color: PN.PINK_DARK,
                        fontFamily:'inherit',
                      }}
                    >−</button>
                    <input
                      type="text" inputMode="numeric"
                      autoFocus={customOpen && !isCustom}
                      value={tavolo.coperti}
                      onChange={e => {
                        const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                        onUpdate({coperti: isNaN(n) ? 1 : Math.max(1, Math.min(30, n))});
                      }}
                      onFocus={e => e.target.select()}
                      style={{
                        flex: 1, minWidth: 0, width: '100%', padding: '8px 0',
                        border:'none', background:'transparent',
                        fontSize: 17, fontWeight: 800,
                        color: PN.PINK_DARK,
                        textAlign:'center', outline:'none', fontFamily:'inherit',
                      }}
                    />
                    <button
                      onClick={() => onUpdate({coperti: Math.min(30, tavolo.coperti + 1)})}
                      title="Aumenta"
                      style={{
                        width: 26, border:'none', background:'transparent',
                        cursor:'pointer', fontSize: 17, color: PN.PINK_DARK,
                        fontFamily:'inherit',
                      }}
                    >+</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCustomOpen(true)}
                    style={{
                      gridColumn: 'span 2', padding: '10px 0',
                      border:`1.5px dashed ${PN.BORDER}`,
                      background: PN.WHITE,
                      color: PN.MUTED,
                      borderRadius: 8, fontSize: 15, fontWeight: 700,
                      letterSpacing: 0.3, textTransform: 'uppercase',
                      cursor:'pointer', fontFamily:'inherit',
                      transition: 'background .12s, border-color .12s, color .12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = PN.PINK_DARK; e.currentTarget.style.color = PN.PINK_DARK; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.color = PN.MUTED; }}
                  >
                    Personalizzato…
                  </button>
                )}
              </div>
            );
          })()}

          {isNew && (
            <div style={{
              marginTop: 18, padding: '12px 14px',
              background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, marginBottom: 2}}>Quanti tavoli creare</div>
                <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.4}}>Tutti con {tavolo.coperti} {tavolo.coperti === 1 ? 'posto' : 'posti'}, nomi assegnati automaticamente</div>
              </div>
              <div style={{display:'inline-flex', alignItems:'center', border:`1px solid ${PN.BORDER}`, borderRadius: 8, overflow:'hidden', flexShrink: 0}}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} style={{
                  width: 32, height: 34, border:'none', background: PN.WHITE,
                  cursor: quantity <= 1 ? 'default' : 'pointer',
                  opacity: quantity <= 1 ? 0.4 : 1,
                  fontSize: 18, color: PN.TEXT, fontFamily:'inherit',
                }}>−</button>
                <span style={{
                  minWidth: 38, textAlign:'center', fontSize: 16, fontWeight: 700,
                  borderLeft:`1px solid ${PN.BORDER}`, borderRight:`1px solid ${PN.BORDER}`,
                  padding:'6px 0',
                }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(20, q + 1))} disabled={quantity >= 20} style={{
                  width: 32, height: 34, border:'none', background: PN.WHITE,
                  cursor: quantity >= 20 ? 'default' : 'pointer',
                  opacity: quantity >= 20 ? 0.4 : 1,
                  fontSize: 18, color: PN.TEXT, fontFamily:'inherit',
                }}>+</button>
              </div>
            </div>
          )}
        </div>

        <div style={{padding:'14px 20px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 8, justifyContent: (!isNew && onDelete) ? 'space-between' : 'flex-end'}}>
          {!isNew && onDelete && <ImpButton variant="ghost" icon={<BuIcons.trash size={13}/>} onClick={onDelete} style={{color: PN.PINK_DARK}}>Elimina</ImpButton>}
          <ImpButton variant="primary" onClick={handleConfirm}>
            {isNew ? (quantity > 1 ? `Crea ${quantity} tavoli` : 'Crea tavolo') : 'Salva'}
          </ImpButton>
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
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, padding: 24,
        width: isMulti ? 480 : 420, maxHeight: '85vh', overflow:'auto',
      }}>
        <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 18}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 17, fontWeight: 700}}>
              {data.mode === 'all' ? 'QR di tutti i tavoli' : isMulti ? `QR di ${data.tavoli.length} tavoli` : data.tavoli[0].name}
            </div>
            <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>I clienti scansionano il QR per vedere il menù del tavolo</div>
          </div>
          <button onClick={onClose} style={{width: 32, height: 32, borderRadius: 8, background: '#F4F5F7', border:'none', cursor:'pointer', display:'grid', placeItems:'center'}}>
            <PnI.X size={14}/>
          </button>
        </div>
        <div style={{display:'grid', gap: 12, gridTemplateColumns: isMulti ? 'repeat(3, 1fr)' : '1fr', marginBottom: 20}}>
          {data.tavoli.slice(0, 6).map(t => (
            <div key={t.id} style={{padding: 14, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 12, textAlign:'center'}}>
              <div style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>{t.name}</div>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 8,
                background: `repeating-conic-gradient(${PN.TEXT} 0% 25%, transparent 0% 50%) 0 0/${isMulti ? 8 : 14}px ${isMulti ? 8 : 14}px`,
                border:`1px solid ${PN.BORDER}`, margin:'0 auto',
              }}/>
              <div
                title={`${t.coperti} ${t.coperti === 1 ? 'posto' : 'posti'}`}
                style={{fontSize: 13, color: PN.MUTED, marginTop: 8, display:'inline-flex', alignItems:'center', gap:3}}
              >
                <BuIcons.chair size={11}/>{t.coperti}
              </div>
            </div>
          ))}
        </div>
        <div style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>Formato</div>
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
                <span style={{fontSize: 20}}>{f.icon}</span>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 15, fontWeight: 700, color: on ? PN.PINK_DARK : PN.TEXT}}>{f.label}</div>
                  <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>{f.desc}</div>
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
  const [widthM, setWidthM] = React.useState(sala.widthM ?? 12);
  const [depthM, setDepthM] = React.useState(sala.depthM ?? 7.2);
  const isNew = !sala.id;
  const w = parseFloat(String(widthM).replace(',', '.')) || 0;
  const d = parseFloat(String(depthM).replace(',', '.')) || 0;
  const maxTavoli = Math.max(1, Math.floor((w * d) / 5));
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, width: 420, maxWidth:'100%',
      }}>
        <div style={{padding:'18px 20px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, position:'relative'}}>
          <div style={{fontSize: 17, fontWeight: 700}}>{isNew ? 'Nuova sala' : 'Modifica sala'}</div>
          <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>
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
              style={{width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:15.5, fontFamily:'inherit', outline:'none', background:'rgba(255,255,255,0.8)'}}
            />
          </ImpField>
          <div style={{display:'flex', gap: 12, marginBottom: 4}}>
            <ImpField label="Larghezza (m)">
              <input
                type="number" step="0.1" min="1" value={widthM} onChange={e => setWidthM(e.target.value)}
                style={{width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:15.5, fontFamily:'inherit', outline:'none', background:'rgba(255,255,255,0.8)'}}
              />
            </ImpField>
            <ImpField label="Profondità (m)">
              <input
                type="number" step="0.1" min="1" value={depthM} onChange={e => setDepthM(e.target.value)}
                style={{width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:15.5, fontFamily:'inherit', outline:'none', background:'rgba(255,255,255,0.8)'}}
              />
            </ImpField>
          </div>
          <div style={{fontSize: 13.5, color: PN.MUTED, margin:'2px 0 14px', display:'flex', alignItems:'center', gap: 6}}>
            <BuIcons.bulb size={13} color={PN.AMBER}/>
            Superficie {(w * d).toFixed(1)} m² · capienza stimata <strong style={{color: PN.TEXT}}>{maxTavoli} tavoli</strong>
          </div>
          <label style={{display:'flex', alignItems:'center', gap: 10, padding: 12, background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 9, cursor:'pointer'}}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{accentColor: PN.PINK}}/>
            <div style={{flex:1}}>
              <div style={{fontSize: 15, fontWeight: 700}}>Sala attiva</div>
              <div style={{fontSize: 13.5, color: PN.MUTED}}>Le sale disattivate non appaiono nell'app e non accettano ordini</div>
            </div>
          </label>
        </div>
        <div style={{padding:'14px 20px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 8, justifyContent:'flex-end'}}>
          <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
          <ImpButton variant="primary" onClick={() => name.trim() && onSave({...sala, name: name.trim(), active, widthM: w || 12, depthM: d || 7.2})}>
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
      fontSize: 15, fontWeight: 600,
      animation: 'toastIn 0.25s ease-out',
    }}>
      <span style={{display:'inline-flex'}}><BuIcons.check size={14} color="#fff"/></span>
      <span>{toast.msg}</span>
      {toast.undo && (
        <button onClick={onUndo} style={{
          background: 'transparent', border: `1px solid rgba(255,255,255,0.3)`,
          color: PN.WHITE, padding: '5px 12px', borderRadius: 6,
          fontSize: 14, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        }}>Annulla</button>
      )}
      <button onClick={onClose} style={{
        background:'transparent', border:'none', color: 'rgba(255,255,255,0.6)',
        cursor:'pointer', fontSize: 18, padding: 0, marginLeft: 4,
      }}>×</button>
    </div>
  );
}

// ─────────── Confirm Dialog ───────────
function ConfirmDialog({ title, msg, danger, confirmLabel, cancelLabel, singleAction, onConfirm, onClose }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 150, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, width: 400, maxWidth:'100%',
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
          <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>{title}</div>
          <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.5}}>{msg}</div>
        </div>
        <div style={{padding: '14px 24px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 10, justifyContent:'flex-end'}}>
          {singleAction ? (
            <ImpButton variant="primary" onClick={onConfirm}>{singleAction}</ImpButton>
          ) : (
            <>
              <ImpButton variant="ghost" onClick={onClose}>{cancelLabel || 'Annulla'}</ImpButton>
              <button onClick={onConfirm} style={{
                padding: '9px 16px', borderRadius: 8,
                background: danger ? PN.PINK_DARK : PN.PINK,
                color: PN.WHITE, border: 'none', cursor:'pointer',
                fontSize: 15, fontWeight: 700, fontFamily:'inherit',
              }}>{confirmLabel || 'Conferma'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────── Disattivazione sala: conferma con anteprima eliminazione ───────────
// Il popup elenca i tavoli esistenti; alla conferma le card si dissolvono in
// cenere (deriva verso l'alto a destra + particelle, stile "snap" di Thanos) e
// solo a fine animazione tavoli e QR vengono eliminati davvero da tutte le sale.
function DisattivaSalaModal({ tavoli, onClose, onConfirmed }) {
  const [burning, setBurning] = React.useState(false);
  const shown = tavoli.slice(0, 12); // anteprima: max 12 card
  const extra = tavoli.length - shown.length;

  // Particelle di cenere per card, generate una sola volta al mount
  const ashes = React.useMemo(() => shown.map((_, i) =>
    Array.from({length: 14}).map((_, j) => ({
      left: 6 + Math.random() * 84,
      top: 6 + Math.random() * 80,
      size: 2 + Math.random() * 3.5,
      dx: `${14 + Math.random() * 48}px`,
      dy: `${-(24 + Math.random() * 60)}px`,
      rot: `${-45 + Math.random() * 90}deg`,
      delay: i * 90 + Math.random() * 260,
      color: ['#AEB4BE', '#CDD1D8', '#8E959F', PN.PINK][j % 4],
    }))
  ), []);

  const confirm = () => {
    if (burning) return;
    if (!shown.length) { onConfirmed(); return; }
    setBurning(true);
    setTimeout(onConfirmed, 950 + shown.length * 90 + 400);
  };

  return (
    <div onClick={burning ? undefined : onClose} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 150, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, width: 540, maxWidth:'100%',
        animation:'dialogIn 0.2s ease-out',
      }}>
        <div style={{padding: '24px 24px 16px'}}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: PN.PINK_SOFT, color: PN.PINK_DARK,
            display:'grid', placeItems:'center', marginBottom: 14,
          }}><BuIcons.alert size={20}/></div>
          <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>
            Disattivare la sala?
          </div>
          <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.5}}>
            {tavoli.length > 0 ? (
              <>Disattivando la sala verranno <strong style={{color: PN.TEXT}}>eliminati
              definitivamente {tavoli.length} {tavoli.length === 1 ? 'tavolo' : 'tavoli'}</strong> e
              i relativi QR code. Riattivando la sala dovrai ricrearli da zero.</>
            ) : (
              'La sezione Sala non sarà più visibile nel gestionale. Potrai riattivarla in ogni momento.'
            )}
          </div>
        </div>

        {shown.length > 0 && (
          <div style={{padding: '4px 24px 18px'}}>
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10,
              padding: 14, borderRadius: 14,
              background:'#FAFBFC', border:`1px dashed ${PN.BORDER}`,
            }}>
              {shown.map((t, i) => (
                <div key={t.id} style={{position:'relative'}}>
                  {/* La card svanisce; le particelle sono fuori dal nodo animato
                      per non ereditarne opacità e blur */}
                  <div style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap: 5,
                    padding:'10px 6px', borderRadius: 10,
                    background: PN.WHITE, border:`1px solid ${PN.BORDER_SOFT}`,
                    animation: burning ? `salaAshCard 950ms ease-in ${i * 90}ms forwards` : 'none',
                  }}>
                    <TavoloShape shape={t.shape} size={28} active={!t.disabled} coperti={t.coperti}/>
                    <div style={{fontSize: 12, fontWeight: 700, color: PN.TEXT}}>{t.name}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 0.4, color: PN.MUTED,
                      border:`1px solid ${PN.BORDER}`, borderRadius: 5, padding:'1px 5px',
                    }}>QR</div>
                  </div>
                  {burning && ashes[i].map((p, j) => (
                    <span key={j} style={{
                      position:'absolute', left:`${p.left}%`, top:`${p.top}%`,
                      width: p.size, height: p.size, borderRadius: 2,
                      background: p.color, opacity: 0, pointerEvents:'none',
                      '--ash-dx': p.dx, '--ash-dy': p.dy, '--ash-rot': p.rot,
                      animation:`salaAshParticle 1100ms ease-out ${p.delay}ms forwards`,
                    }}/>
                  ))}
                </div>
              ))}
            </div>
            {extra > 0 && (
              <div style={{fontSize: 13, color: PN.MUTED, marginTop: 8, textAlign:'center'}}>
                …e altri {extra} tavoli
              </div>
            )}
          </div>
        )}

        <div style={{padding: '14px 24px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 10, justifyContent:'flex-end'}}>
          <ImpButton variant="ghost" onClick={onClose} disabled={burning}>Annulla</ImpButton>
          <button onClick={confirm} disabled={burning} style={{
            padding: '9px 16px', borderRadius: 8,
            background: PN.PINK_DARK, color: PN.WHITE,
            border:'none', cursor: burning ? 'default' : 'pointer',
            fontSize: 15, fontWeight: 700, fontFamily:'inherit',
            opacity: burning ? 0.7 : 1,
          }}>{burning ? 'Eliminazione…' : 'Disattiva ed elimina'}</button>
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
      { id: 106, name: 'T6', alias:'', coperti: 4, shape: 'square', disabled: false, pos: {x: 3.5, y: 3} },
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
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 120, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, width: 560, maxWidth:'100%',
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
              fontSize: 12.5, fontWeight: 800, letterSpacing: 0.6,
              padding:'3px 8px', background: PN.PINK_DARK, color: PN.WHITE, borderRadius: 4,
            }}><BuIcons.sparkle size={11} color={PN.WHITE}/> AI</span>
            <span style={{fontSize: 13.5, fontWeight: 600, color: PN.PINK_DARK}}>Generazione automatica</span>
          </div>
          <div style={{fontSize: 20, fontWeight: 800, color: PN.PINK_DARK, marginBottom: 4}}>Importa la tua planimetria</div>
          <div style={{fontSize: 15, color: PN.PINK_DARK, opacity: 0.85}}>
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
              <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Trascina o seleziona un file</div>
              <div style={{fontSize: 14, color: PN.MUTED}}>PDF, JPG, PNG · max 10MB</div>
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
              <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, marginBottom: 6, display:'inline-flex', alignItems:'center', gap: 6}}><BuIcons.bulb size={13} color={PN.AMBER}/> Per risultati ottimali</div>
              <ul style={{margin: 0, paddingLeft: 18, fontSize: 14, color: PN.MUTED, lineHeight: 1.7}}>
                <li>Pianta vista dall'alto, con muri e tavoli ben visibili</li>
                <li>Numera o etichetta i tavoli se possibile (T1, T2…)</li>
                <li>Indica le aree (cucina, bagni) con un'etichetta</li>
              </ul>
            </div>
            <div style={{marginTop: 14, fontSize: 13.5, color: PN.MUTED, textAlign:'center'}}>
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
              <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>L'AI sta analizzando…</div>
              <div style={{fontSize: 14, color: PN.MUTED}}>{fileName}</div>
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
            <div style={{fontSize: 14, color: PN.PINK_DARK, fontWeight: 600, textAlign:'center'}}>
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
                <div style={{fontSize: 15, fontWeight: 700, color: PN.GREEN}}>Layout generato</div>
                <div style={{fontSize: 14, color: PN.GREEN, display:'inline-flex', alignItems:'center', gap:4, flexWrap:'wrap'}}>
                  <span>Riconosciuti <b>{generated.tavoli.length} tavoli</b></span>
                  {(() => {
                    const cop = generated.tavoli.reduce((a,t)=>a+t.coperti,0);
                    return (
                      <span
                        title={`${cop} ${cop === 1 ? 'posto' : 'posti'}`}
                        style={{display:'inline-flex', alignItems:'center', gap:3}}
                      >
                        (<BuIcons.chair size={11}/>{cop})
                      </span>
                    );
                  })()}
                  <span>e <b>{generated.furniture.length} elementi</b> di arredo</span>
                </div>
              </div>
            </div>
            <div style={{
              padding: 14, background:'#FBF8F4', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
              display:'flex', alignItems:'center', gap: 12, marginBottom: 16,
            }}>
              <div style={{display:'inline-flex', color: PN.MUTED}}><BuIcons.info size={20}/></div>
              <div style={{flex: 1, fontSize: 14.5, color: PN.MUTED, lineHeight: 1.5}}>
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
    @keyframes tcMenuIn { from { opacity: 0; transform: translateY(-4px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes tcSubIn { from { opacity: 0; transform: translateY(-4px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 400px; } }
    @keyframes tcSubItemIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes salaDropPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 100, 0.0); } 50% { box-shadow: 0 0 0 4px rgba(220, 38, 100, 0.12); } }
    @keyframes dropHintIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
    @keyframes salaAshCard { 0% { opacity: 1; transform: none; filter: none; } 25% { opacity: 0.96; } 100% { opacity: 0; transform: translate(26px, -34px) rotate(6deg) scale(0.88); filter: blur(5px); } }
    @keyframes salaAshParticle { 0% { opacity: 0; transform: none; } 15% { opacity: 0.9; } 100% { opacity: 0; transform: translate(var(--ash-dx), var(--ash-dy)) rotate(var(--ash-rot)); } }
  `;
  document.head.appendChild(s);
}

window.ImpSalaTavoli = ImpSalaTavoli;
