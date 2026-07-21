// Impostazioni → Menù e cucina (rifatto: piatti per categoria, allergeni icone, filtri chip)

const PHOTO_MOCK_BG = ['#F4D9A0', '#D0E8F4', '#E5D9F2'];

const ALLERGENS = [
  { id: 'glutine', name: 'Glutine', icon: '🌾', color: '#D97706' },
  { id: 'latte', name: 'Latte', icon: '🥛', color: '#0EA5E9' },
  { id: 'uova', name: 'Uova', icon: '🥚', color: '#F59E0B' },
  { id: 'pesce', name: 'Pesce', icon: '🐟', color: '#0891B2' },
  { id: 'crostacei', name: 'Crostacei', icon: '🦐', color: '#EA580C' },
  { id: 'molluschi', name: 'Molluschi', icon: '🦪', color: '#0369A1' },
  { id: 'frutta-guscio', name: 'Frutta a guscio', icon: '🥜', color: '#92400E' },
  { id: 'arachidi', name: 'Arachidi', icon: '🥜', color: '#A16207' },
  { id: 'soia', name: 'Soia', icon: '🌱', color: '#65A30D' },
  { id: 'lupini', name: 'Lupini', icon: '🫘', color: '#B45309' },
  { id: 'sedano', name: 'Sedano', icon: '🥬', color: '#16A34A' },
  { id: 'senape', name: 'Senape', icon: '🌾', color: '#CA8A04' },
  { id: 'sesamo', name: 'Sesamo', icon: '🌰', color: '#78350F' },
  { id: 'solfiti', name: 'Solfiti', icon: '🍷', color: '#7C2D12' },
];

// Importi proposti per il servizio, per modalità. Lo 0 è "nessun servizio" e
// c'è in entrambe: toglierlo obbligherebbe a passare da un'altra impostazione
// solo per rinunciarci.
const SERVIZIO_OPZIONI = {
  fisso:       [0, 1.5, 2, 2.5, 3],
  percentuale: [0, 5, 10, 12, 15],
};

function AllergenIcon({ id, size = 18 }) {
  const a = ALLERGENS.find(x => x.id === id);
  if (!a) return null;
  return (
    <span title={a.name} style={{
      width: size, height: size, borderRadius: '50%',
      background: a.color + '22', color: a.color,
      display:'inline-grid', placeItems:'center',
      fontSize: size * 0.55, fontWeight: 700,
      border: `1.5px solid ${a.color}55`,
    }}>{a.name[0]}</span>
  );
}
window.ALLERGENS = ALLERGENS;
window.AllergenIcon = AllergenIcon;

function ImpMenuCucina() {
  const [sub, setSub] = React.useState('menu');
  const subs = [
    { id: 'menu', label: 'Menù' },
    { id: 'libreria', label: 'Piatti' },
    { id: 'ingredienti', label: 'Ingredienti' },
  ];

  return (
    <div>
      <ImpSubTabs tabs={subs} active={sub} onChange={setSub}/>
      {sub === 'menu' && <MCMenuComposer/>}
      {sub === 'libreria' && <MCLibreria/>}
      {sub === 'ingredienti' && <MCIngredienti/>}
    </div>
  );
}

// ─── MENU COMPOSER: selettore menù + composizione ─────────────────────────────

// LIBRERIA piatti: SENZA prezzo, SENZA stato. Solo dati "ricetta".
const DISH_LIBRARY = [
  { id:'a1', name: 'Bruschetta al pomodoro', desc: 'Pane casereccio tostato, pomodoro fresco, basilico, aglio', cat: 'Antipasti', allergens: ['glutine'] },
  { id:'a2', name: 'Burrata con crudo', desc: 'Burrata pugliese, prosciutto crudo di Parma 24 mesi', cat: 'Antipasti', allergens: ['latte'] },
  { id:'a3', name: 'Tagliere salumi e formaggi', desc: 'Selezione di salumi e formaggi locali con marmellate', cat: 'Antipasti', allergens: ['latte','frutta-guscio'] },
  { id:'p1', name: 'Carbonara', desc: 'Tonnarelli, guanciale, pecorino, uovo, pepe nero', cat: 'Primi', allergens: ['glutine','uova','latte'] },
  { id:'p2', name: 'Cacio e Pepe', desc: 'Tonnarelli, pecorino romano DOP, pepe nero macinato fresco', cat: 'Primi', allergens: ['glutine','latte'] },
  { id:'p3', name: 'Amatriciana', desc: 'Bucatini, guanciale, pomodoro San Marzano, pecorino', cat: 'Primi', allergens: ['glutine','latte'] },
  { id:'s1', name: 'Tagliata di manzo', desc: 'Controfiletto di scottona, rucola, scaglie di grana', cat: 'Secondi', allergens: ['latte'] },
  { id:'s2', name: 'Branzino al forno', desc: 'Branzino in crosta di sale, patate al rosmarino', cat: 'Secondi', allergens: ['pesce'] },
  { id:'d1', name: 'Tiramisù della casa', desc: 'Ricetta tradizionale con savoiardi e mascarpone', cat: 'Dolci', allergens: ['glutine','uova','latte'] },
  { id:'d2', name: 'Panna cotta ai frutti di bosco', desc: 'Coulis di lamponi e mirtilli', cat: 'Dolci', allergens: ['latte'] },
];

const CAT_ICON = { 'Antipasti':'food-salad', 'Primi':'food-pasta', 'Secondi':'food-steak', 'Contorni':'food-vegetables', 'Dolci':'food-dessert', 'Bevande':'drink-juice' };

// Ogni MENÙ ha le proprie categorie, e in ogni categoria i piatti hanno PREZZO e ATTIVO/DISATTIVATO per quel menù.
const MENUS_INIT = [
  { id:'pranzo', name:'Menù pranzo', active:true, schedule:'Lun–Ven · 12:00–15:00', categories: [
      { name:'Antipasti', items:[ {dishId:'a1', price:6.50, active:true} ] },
      { name:'Primi',     items:[ {dishId:'p1', price:13.00, active:true}, {dishId:'p2', price:12.00, active:true}, {dishId:'p3', price:13.00, active:true} ] },
      { name:'Dolci',     items:[ {dishId:'d1', price:6.50, active:true} ] },
  ]},
  { id:'cena', name:'Menù cena', active:false, schedule:'Tutti i giorni · 19:00–23:00', categories: [
      { name:'Antipasti', items:[ {dishId:'a1', price:7.00, active:true}, {dishId:'a2', price:12.00, active:true, highlight:true}, {dishId:'a3', price:15.00, active:false} ] },
      { name:'Primi',     items:[ {dishId:'p1', price:14.00, active:true, highlight:true}, {dishId:'p2', price:13.00, active:true}, {dishId:'p3', price:14.00, active:true} ] },
      { name:'Secondi',   items:[ {dishId:'s1', price:22.00, active:true, highlight:true}, {dishId:'s2', price:24.00, active:true, isNew:true} ] },
      { name:'Dolci',     items:[ {dishId:'d1', price:7.00, active:true}, {dishId:'d2', price:6.50, active:true, isNew:true} ] },
  ]},
  { id:'bambini', name:'Menù bambini', active:false, schedule:'Sempre disponibile · €12 fisso', categories: [
      { name:'Primi', items:[ {dishId:'p2', price:8.00, active:true}, {dishId:'p3', price:8.00, active:true} ] },
      { name:'Dolci', items:[ {dishId:'d2', price:4.00, active:true} ] },
  ]},
  { id:'estivo', name:'Menù estivo', active:false, schedule:'Da Giugno a Settembre', categories: [] },
];

function MCLibreria() {
  const [library, setLibrary] = React.useState(DISH_LIBRARY);
  const [menus] = React.useState(MENUS_INIT);
  const [filters, setFilters] = React.useState({ category: 'all', allergens: [], unused: false });

  const upsertLibraryDish = (d) => setLibrary(prev => {
    const i = prev.findIndex(x => x.id === d.id);
    if (i >= 0) { const next = [...prev]; next[i] = {...next[i], ...d}; return next; }
    return [...prev, d];
  });
  const removeLibraryDish = (id) => setLibrary(prev => prev.filter(x => x.id !== id));

  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr', gap: 16}}>
      <aside>
        <LibrarySidebar library={library} menus={menus} filters={filters} setFilters={setFilters}/>
      </aside>
      <main>
        <DishLibraryView
          library={library}
          menus={menus}
          filters={filters}
          onUpsertLibraryDish={upsertLibraryDish}
          onRemoveLibraryDish={removeLibraryDish}
        />
      </main>
    </div>
  );
}

function MCMenuComposer() {
  const [library, setLibrary] = React.useState(DISH_LIBRARY);
  const [menus, setMenus] = React.useState(MENUS_INIT);
  const [activeMenuId, setActiveMenuId] = React.useState('pranzo');
  const [creatingMenu, setCreatingMenu] = React.useState(false);
  const [newMenuName, setNewMenuName] = React.useState('');
  const [openMenuDot, setOpenMenuDot] = React.useState(null); // id menu con dropdown aperto
  const [renamingMenuId, setRenamingMenuId] = React.useState(null);
  const [renameVal, setRenameVal] = React.useState('');
  const [confirmDelId, setConfirmDelId] = React.useState(null);
  const [aiUpload, setAiUpload] = React.useState(false);
  const activeMenu = menus.find(m => m.id === activeMenuId);

  const createMenu = () => {
    if (!newMenuName.trim()) return;
    const id = 'm' + Date.now();
    setMenus(prev => [...prev, { id, name: newMenuName.trim(), active: true, categories: [] }]);
    setActiveMenuId(id);
    setNewMenuName(''); setCreatingMenu(false);
  };
  const updateMenu = (id, patch) => setMenus(prev => {
    if ('active' in patch) {
      if (patch.active) return prev.map(m => ({...m, active: m.id === id}));
      return prev.map(m => m.id === id ? {...m, active: false} : m);
    }
    return prev.map(m => m.id === id ? {...m, ...patch} : m);
  });
  const deleteMenu = (id) => {
    setMenus(prev => prev.filter(m => m.id !== id));
    if (activeMenuId === id) {
      const remaining = menus.filter(m => m.id !== id);
      if (remaining.length) setActiveMenuId(remaining[0].id);
    }
    setOpenMenuDot(null);
  };
  const duplicateMenu = (id) => {
    const src = menus.find(m => m.id === id); if (!src) return;
    const newId = 'm' + Date.now();
    setMenus(prev => [...prev, { ...src, id: newId, name: src.name + ' (copia)', active: false }]);
    setOpenMenuDot(null); setActiveMenuId(newId);
  };

  const totalDishesIn = (m) => m.categories.reduce((s,c) => s + c.items.length, 0);

  // Mutators libreria
  const upsertLibraryDish = (d) => setLibrary(prev => {
    const i = prev.findIndex(x => x.id === d.id);
    if (i >= 0) { const next = [...prev]; next[i] = {...next[i], ...d}; return next; }
    return [...prev, d];
  });
  const removeLibraryDish = (id) => {
    setLibrary(prev => prev.filter(x => x.id !== id));
    setMenus(prev => prev.map(m => ({...m, categories: m.categories.map(c => ({...c, items: c.items.filter(it => it.dishId !== id)}))})));
  };

  // Mutators menù attivo
  const updateActiveMenu = (fn) => setMenus(prev => prev.map(m => m.id === activeMenuId ? fn(m) : m));
  const addCategoryToMenu = (catName) => updateActiveMenu(m => ({...m, categories: [...m.categories, {name: catName, items: []}]}));
  const removeCategoryFromMenu = (catName) => updateActiveMenu(m => ({...m, categories: m.categories.filter(c => c.name !== catName)}));
  const renameCategory = (oldName, newName) => updateActiveMenu(m => ({...m, categories: m.categories.map(c => c.name === oldName ? {...c, name: newName} : c)}));
  const addDishToCategory = (catName, dishId, price = 0) => updateActiveMenu(m => ({...m, categories: m.categories.map(c => c.name === catName ? {...c, items: c.items.some(i => i.dishId === dishId) ? c.items : [...c.items, {dishId, price, active: true}]} : c)}));
  const removeDishFromCategory = (catName, dishId) => updateActiveMenu(m => ({...m, categories: m.categories.map(c => c.name === catName ? {...c, items: c.items.filter(i => i.dishId !== dishId)} : c)}));
  const updateMenuItem = (catName, dishId, patch) => updateActiveMenu(m => ({...m, categories: m.categories.map(c => c.name === catName ? {...c, items: c.items.map(i => i.dishId === dishId ? {...i, ...patch} : i)} : c)}));

  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr', gap: 16}}>
      {/* Sidebar */}
      <aside>
        <ImpCard aurora title="I tuoi menù" sub="Crea menù differenti per pranzo, cena, eventi" action={
              <button onClick={() => setCreatingMenu(c => !c)} title="Nuovo menù" style={{
                width:30, height:30, borderRadius:8, border:'none',
                background: creatingMenu ? PN.PINK : PN.TEXT, color: PN.WHITE, cursor:'pointer',
                display:'grid', placeItems:'center', transition:'transform .2s',
                transform: creatingMenu ? 'rotate(45deg)' : 'none',
              }}><PnI.Plus size={14}/></button>
            }>
              <div style={{display:'flex', flexDirection:'column', gap: 8}}>
                {menus.map(m => {
                  const isActive = m.id === activeMenuId;
                  const dotOpen = openMenuDot === m.id;
                  const isRenaming = renamingMenuId === m.id;
                  const isConfirmDel = confirmDelId === m.id;
                  return (
                    <div key={m.id} onClick={() => setActiveMenuId(m.id)} style={{
                      position:'relative',
                      padding: '12px 14px',
                      border: `1.5px solid ${isActive ? PN.PINK : PN.BORDER_SOFT}`,
                      background: isActive ? PN.PINK_SOFT : PN.WHITE,
                      borderRadius: 10, cursor:'pointer',
                      transition:'border-color 0.15s, background 0.15s',
                    }}>
                      <div style={{display:'flex', alignItems:'center', gap: 6, marginBottom: 4}}>
                        {isRenaming ? (
                          <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => { e.stopPropagation(); if (e.key==='Enter' && renameVal.trim()) { updateMenu(m.id,{name:renameVal.trim()}); setRenamingMenuId(null); } if (e.key==='Escape') setRenamingMenuId(null); }}
                            onBlur={() => { if (renameVal.trim()) updateMenu(m.id,{name:renameVal.trim()}); setRenamingMenuId(null); }}
                            style={{flex:1, fontSize:15.5, fontWeight:700, border:'none', outline:`2px solid ${PN.PINK}`, borderRadius:5, padding:'2px 6px', fontFamily:'inherit', background:'transparent', color: PN.PINK_DARK}}
                          />
                        ) : (
                          <span style={{fontSize:15.5, fontWeight:700, flex:1, color: isActive ? PN.PINK_DARK : PN.TEXT}}>{m.name}</span>
                        )}
                        <button onClick={e => { e.stopPropagation(); setOpenMenuDot(dotOpen ? null : m.id); setConfirmDelId(null); }} style={{
                          width:24, height:24, borderRadius:6,
                          background: dotOpen ? '#F4F5F7' : 'transparent', border:'none',
                          cursor:'pointer', color: PN.MUTED,
                          display:'grid', placeItems:'center', fontSize:18,
                        }}>⋯</button>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13.5, color:PN.MUTED}}>
                        <span>{totalDishesIn(m)} {totalDishesIn(m) === 1 ? 'piatto' : 'piatti'}</span>
                        <span style={{color: PN.BORDER}}>·</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            updateMenu(m.id, {active: !m.active});
                          }}
                          title={m.active ? 'Clicca per disattivare' : 'Clicca per attivare'}
                          style={{
                            display:'inline-flex', alignItems:'center', gap:5,
                            padding:'2px 8px', borderRadius:999,
                            border:'none', cursor:'pointer', fontFamily:'inherit',
                            fontSize:12.5, fontWeight:700, letterSpacing:0.3,
                            background: m.active ? PN.GREEN_SOFT : '#F1F3F5',
                            color: m.active ? PN.GREEN : PN.MUTED,
                            transition:'background 0.15s, color 0.15s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = m.active ? '#D6F0DC' : '#E5E7EB';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = m.active ? PN.GREEN_SOFT : '#F1F3F5';
                          }}
                        >
                          <span style={{
                            width:6, height:6, borderRadius:'50%',
                            background: m.active ? PN.GREEN : '#9CA3AF',
                          }}/>
                          {m.active ? 'ATTIVO' : 'INATTIVO'}
                        </button>
                      </div>
                      {dotOpen && (
                        <div onClick={e => e.stopPropagation()} style={{
                          position:'absolute', top:'calc(100% + 4px)', right:0,
                          minWidth:180, background: PN.WHITE,
                          border:`1px solid ${PN.BORDER}`, borderRadius:10,
                          boxShadow:'0 8px 24px rgba(0,0,0,0.10)',
                          padding:5, zIndex:50,
                        }}>
                          <MenuDotItem icon="✏" onClick={() => { setRenameVal(m.name); setRenamingMenuId(m.id); setOpenMenuDot(null); }}>Rinomina</MenuDotItem>
                          <MenuDotItem icon={m.active ? '⏸' : '▶'} onClick={() => {
                            updateMenu(m.id, {active: !m.active});
                            setOpenMenuDot(null);
                          }}>
                            {m.active ? 'Disattiva menù' : 'Attiva menù'}
                          </MenuDotItem>
                          <MenuDotItem icon="⧉" onClick={() => { duplicateMenu(m.id); setOpenMenuDot(null); }}>Duplica</MenuDotItem>
                          {menus.length > 1 && <>
                            <div style={{height:1, background:PN.BORDER_SOFT, margin:'4px 0'}}/>
                            {isConfirmDel ? (
                              <div style={{padding:'6px 8px', display:'flex', gap:5}}>
                                <button onClick={() => setConfirmDelId(null)} style={{flex:1, padding:'5px 0', fontSize:13.5, fontWeight:600, background:'#F4F5F7', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit', color:PN.TEXT}}>Annulla</button>
                                <button onClick={() => { deleteMenu(m.id); setOpenMenuDot(null); setConfirmDelId(null); }} style={{flex:1, padding:'5px 0', fontSize:13.5, fontWeight:700, background:'#DC2626', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit', color:'#fff'}}>Elimina</button>
                              </div>
                            ) : (
                              <MenuDotItem icon="🗑" danger onClick={() => setConfirmDelId(m.id)}>Elimina</MenuDotItem>
                            )}
                          </>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {creatingMenu && (
                  <div style={{
                    padding:'12px 14px', border:`1.5px dashed ${PN.PINK}`, borderRadius: 10,
                    background: PN.PINK_SOFT, animation:'fadeInDown .2s ease-out',
                    display:'flex', flexDirection:'column', gap: 8,
                  }}>
                    <input autoFocus value={newMenuName} onChange={e => setNewMenuName(e.target.value)} placeholder="Nome menù (es. Cena)"
                      onKeyDown={e => { if (e.key === 'Enter') createMenu(); if (e.key === 'Escape') setCreatingMenu(false); }}
                      style={{padding:'7px 10px', border:`1px solid ${PN.BORDER}`, borderRadius:6, fontSize:15, fontFamily:'inherit', outline:'none', fontWeight:600}}/>
                    <div style={{display:'flex', gap: 6, justifyContent:'flex-end'}}>
                      <button onClick={() => { setCreatingMenu(false); setNewMenuName(''); }} style={{padding:'5px 10px', background:'transparent', border:'none', color: PN.MUTED, fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
                      <button onClick={createMenu} disabled={!newMenuName.trim()} style={{padding:'5px 12px', background: newMenuName.trim() ? PN.PINK : '#E5E7EB', color:'#fff', border:'none', borderRadius:6, fontSize:14, fontWeight:700, cursor: newMenuName.trim()?'pointer':'default', fontFamily:'inherit'}}>Crea</button>
                    </div>
                  </div>
                )}
              </div>
            </ImpCard>

            {/* AI shortcut — magenta brand vivace, shimmer permanente, sparkle pulse */}
            <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6}}>
              <AiUploadCta onClick={() => setAiUpload(true)}/>
              <div style={{fontSize: 13, color: PN.MUTED, textAlign: 'center', lineHeight: 1.45, marginTop: 2}}>
                L'AI estrae piatti, prezzi, allergeni
              </div>
            </div>
        </aside>

      {/* Main */}
      <main>
        {activeMenu && (
          <MenuComposeView
            menu={activeMenu}
            library={library}
            menus={menus}
            onAddCategory={addCategoryToMenu}
            onRemoveCategory={removeCategoryFromMenu}
            onRenameCategory={renameCategory}
            onAddDish={addDishToCategory}
            onRemoveDish={removeDishFromCategory}
            onUpdateItem={updateMenuItem}
            onUpsertLibraryDish={upsertLibraryDish}

            activeMenuId={activeMenuId}
          />
        )}
      </main>
      {aiUpload && (
        <AIMenuUploadModal
          onClose={() => setAiUpload(false)}
          onImport={({ menuName, categories, dishes }) => {
            // Aggiungi piatti alla libreria (se non già presenti)
            setLibrary(prev => {
              const next = [...prev];
              dishes.forEach(d => { if (!next.find(x => x.id === d.id)) next.push(d); });
              return next;
            });
            // Crea nuovo menù
            const id = 'm' + Date.now();
            setMenus(prev => [...prev, { id, name: menuName, active: true, categories }]);
            setActiveMenuId(id);
            setAiUpload(false);
          }}
        />
      )}

    </div>
  );
}

function MenuDotItem({ icon, children, danger, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8, width:'100%',
      padding:'7px 10px', background:'transparent', border:'none',
      borderRadius:7, fontSize:15, fontFamily:'inherit',
      color: danger ? '#DC2626' : PN.TEXT,
      cursor:'pointer', textAlign:'left',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? '#FEF2F2' : '#F4F5F7'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{width:16, fontSize:15}}>{icon}</span>{children}
    </button>
  );
}

function MenuComposeView({ menu, library, menus, onAddCategory, onRemoveCategory, onRenameCategory, onAddDish, onRemoveDish, onUpdateItem, onUpsertLibraryDish, onSwitchToLibrary, setSettingsMenuId, activeMenuId }) {
  const [search, setSearch] = React.useState('');
  const [stateFilter, setStateFilter] = React.useState('all');
  const [collapsed, setCollapsed] = React.useState({});
  const [editingDish, setEditingDish] = React.useState(null); // {dishId|null, catName, isNew}
  const [editingPrice, setEditingPrice] = React.useState(null); // {catName, dishId}
  const [picker, setPicker] = React.useState(null); // catName per cui aprire picker libreria
  const [addingCat, setAddingCat] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');

  const dishById = (id) => library.find(d => d.id === id);

  // Compose rows: rows con dati piatto + dati menu-item
  const cats = menu.categories.map(c => ({
    ...c,
    rows: c.items.map(it => ({...it, dish: dishById(it.dishId)})).filter(r => r.dish),
  }));

  const totalDishes = cats.reduce((s,c) => s + c.rows.length, 0);
  const totalActive = cats.reduce((s,c) => s + c.rows.filter(r => r.active).length, 0);
  const totalDisabled = totalDishes - totalActive;

  const matchesSearch = r => !search || r.dish.name.toLowerCase().includes(search.toLowerCase()) || (r.dish.desc||'').toLowerCase().includes(search.toLowerCase());
  const matchesState = r => stateFilter === 'all' || (stateFilter === 'active' && r.active) || (stateFilter === 'disabled' && !r.active);

  const handleAddCategory = () => {
    if (newCatName.trim()) { onAddCategory(newCatName.trim()); setNewCatName(''); setAddingCat(false); }
  };

  return (
    <div>
      <ImpCard
        title={menu.name}
        sub={`${totalDishes} piatti · ${totalActive} attivi${totalDisabled ? ` · ${totalDisabled} disattivati` : ''}`}
        action={
          <span style={{
            fontSize: 12, fontWeight: 800, letterSpacing: 0.5,
            padding:'3px 9px', borderRadius: 5,
            background: menu.active ? PN.GREEN_SOFT : PN.BORDER_SOFT,
            color: menu.active ? PN.GREEN : PN.MUTED,
          }}>{menu.active ? 'ATTIVO' : 'INATTIVO'}</span>
        }
      >
        {/* Toolbar */}
        <div style={{
          display:'flex', gap: 10, alignItems:'center', marginBottom: 16,
          padding: '12px 14px', background:'#FAFBFC',
          border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, flexWrap:'wrap',
        }}>
          <div style={{position:'relative', flex:'1 1 240px', minWidth: 200}}>
            <span style={{position:'absolute', left: 11, top:'50%', transform:'translateY(-50%)', color: PN.MUTED, display: 'flex', alignItems: 'center'}}><PnI.Search size={13} color={PN.MUTED}/></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca nei piatti del menù…" style={{
              width:'100%', padding: '9px 12px 9px 34px',
              border:`1px solid ${PN.BORDER}`, borderRadius: 8,
              fontSize: 15, fontFamily:'inherit', outline:'none', background: PN.WHITE,
            }}/>
          </div>
          <div style={{display:'flex', background: PN.WHITE, padding:3, borderRadius:8, gap:2, border:`1px solid ${PN.BORDER}`}}>
            {[
              {id:'all', label:'Tutti', count: totalDishes},
              {id:'active', label:'Attivi', count: totalActive},
              {id:'disabled', label:'Disattivati', count: totalDisabled},
            ].map(s => (
              <button key={s.id} onClick={() => setStateFilter(s.id)} style={{
                padding:'6px 12px', borderRadius: 6,
                background: stateFilter===s.id ? PN.TEXT : 'transparent',
                color: stateFilter===s.id ? PN.WHITE : PN.MUTED,
                border:'none', fontSize: 14, fontWeight: 600, fontFamily:'inherit',
                cursor:'pointer', display:'inline-flex', alignItems:'center', gap: 6,
              }}>
                {s.label}
                <span style={{fontSize: 12.5, padding:'1px 6px', borderRadius: 999, background: stateFilter===s.id ? 'rgba(255,255,255,0.2)' : PN.BORDER_SOFT}}>{s.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categorie del menù */}
        {cats.map((cat) => {
          const visible = cat.rows.filter(r => matchesSearch(r) && matchesState(r));
          if ((search || stateFilter !== 'all') && visible.length === 0) return null;
          const isCollapsed = collapsed[cat.name];
          return (
            <div key={cat.name} style={{
              border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 12,
              marginBottom: 14, overflow:'hidden', background: PN.WHITE,
            }}>
              <div style={{
                display:'flex', alignItems:'center', gap: 12,
                padding: '14px 18px',
                background: !isCollapsed ? '#FAFBFC' : PN.WHITE,
                borderBottom: !isCollapsed ? `1px solid ${PN.BORDER_SOFT}` : 'none',
              }}>
                <button onClick={() => setCollapsed(o => ({...o, [cat.name]: !o[cat.name]}))} style={{
                  background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap: 12, flex: 1, padding: 0, fontFamily:'inherit', textAlign:'left',
                }}>
                  <span style={{fontSize: 14, color: PN.MUTED, transition:'transform .2s', transform: isCollapsed ? 'rotate(-90deg)' : 'none', display:'inline-block'}}>▼</span>
                  <span style={{color: PN.MUTED, display:'inline-flex'}}>
                    <Icon name={CAT_ICON[cat.name] || 'star'} size={16}/>
                  </span>
                  <span style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>{cat.name}</span>
                  <span style={{fontSize: 14, color: PN.MUTED, fontWeight: 500}}>{visible.length} di {cat.rows.length}</span>
                </button>
                <button onClick={() => { if (confirm(`Rimuovere la categoria "${cat.name}" da questo menù? I piatti restano nella libreria.`)) onRemoveCategory(cat.name); }} title="Rimuovi categoria dal menù" style={{
                  background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer', fontSize: 15, padding: '4px 8px', borderRadius: 6,
                }}>✕</button>
              </div>
              {!isCollapsed && (
                <div>
                  {visible.map((r) => (
                    <DishRow
                      key={r.dishId}
                      dish={r.dish}
                      item={r}
                      onToggleActive={() => onUpdateItem(cat.name, r.dishId, {active: !r.active})}
                      onPriceClick={() => setEditingPrice({catName: cat.name, dishId: r.dishId})}
                      editingPrice={editingPrice && editingPrice.catName===cat.name && editingPrice.dishId===r.dishId}
                      onPriceCommit={(v) => { onUpdateItem(cat.name, r.dishId, {price: v}); setEditingPrice(null); }}
                      onPriceCancel={() => setEditingPrice(null)}
                      onEdit={() => setEditingDish({dishId: r.dishId, catName: cat.name, isNew: false, currentPrice: r.price})}
                      onRemove={() => onRemoveDish(cat.name, r.dishId)}
                    />
                  ))}
                  {visible.length === 0 && cat.rows.length === 0 && (
                    <div style={{padding: '20px 18px', textAlign:'center', color: PN.MUTED, fontSize: 14.5, fontStyle:'italic'}}>Categoria vuota</div>
                  )}
                  {/* Bottone in fondo alla categoria */}
                  <div style={{padding: '12px 18px', borderTop: `1px dashed ${PN.BORDER_SOFT}`, background: '#FCFCFD'}}>
                    <button onClick={() => setPicker(cat.name)} style={{
                      width:'100%', padding:'9px 12px', borderRadius: 8,
                      border: `1.5px dashed ${PN.BORDER}`, background: PN.BG,
                      color: PN.MUTED_SOFT, fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                      display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.MUTED; }}
                    onMouseLeave={e => { e.currentTarget.style.background = PN.BG; e.currentTarget.style.color = PN.MUTED_SOFT; }}
                    >+ Aggiungi piatto</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Nuova categoria */}
        {addingCat ? (
          <div style={{display:'flex', gap: 8, padding: '12px 14px', border:`1.5px solid ${PN.PINK}`, background: PN.PINK_SOFT, borderRadius: 10, marginBottom: 14}}>
            <input autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => { if (e.key==='Enter') handleAddCategory(); if (e.key==='Escape') { setAddingCat(false); setNewCatName(''); } }} placeholder="Nome categoria (es. Antipasti, Pizze, Vini…)" style={{
              flex: 1, padding: '8px 12px', border: `1px solid ${PN.BORDER}`, borderRadius: 7, fontSize: 15, fontFamily:'inherit', outline:'none',
            }}/>
            <button onClick={handleAddCategory} style={{padding:'8px 14px', borderRadius: 7, border:'none', background: PN.TEXT, color: PN.WHITE, fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>Crea</button>
            <button onClick={() => { setAddingCat(false); setNewCatName(''); }} style={{padding:'8px 12px', borderRadius: 7, border:`1px solid ${PN.BORDER}`, background: PN.WHITE, color: PN.MUTED, fontSize: 14.5, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
          </div>
        ) : (
          <button onClick={() => setAddingCat(true)} style={{
            width:'100%', padding: '14px', borderRadius: 10,
            border: `1.5px dashed ${PN.BORDER}`, background:'#FAFBFC',
            color: PN.MUTED, fontSize: 15, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            marginBottom: 14,
          }}>+ Aggiungi categoria</button>
        )}

        {totalDishes === 0 && cats.length === 0 && (
          <div style={{
            padding: '40px 20px', textAlign:'center',
            background:'#FAFBFC', border: `1.5px dashed ${PN.BORDER}`, borderRadius: 12,
            color: PN.MUTED,
          }}>
            <div style={{fontSize: 38, marginBottom: 10}}>🍽</div>
            <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Questo menù è vuoto</div>
            <div style={{fontSize: 14.5, marginBottom: 14}}>Crea una categoria per iniziare ad aggiungere piatti</div>
          </div>
        )}
      </ImpCard>

      {editingDish && (
        <DishEditModal
          {...editingDish}
          dish={editingDish.dishId ? library.find(d => d.id === editingDish.dishId) : null}
          onClose={() => setEditingDish(null)}
          onSave={(d) => {
            const id = d.id || ('new' + Date.now());
            onUpsertLibraryDish({...d, id});
            if (editingDish.isNew && editingDish.catName) {
              onAddDish(editingDish.catName, id, d._initialPrice ?? 0);
            } else if (!editingDish.isNew && editingDish.catName && d._initialPrice !== undefined) {
              onUpdateItem(editingDish.catName, id, {price: d._initialPrice});
            }
            setEditingDish(null);
          }}
        />
      )}

      {picker && (
        <DishLibraryPicker
          library={library}
          excludeIds={(menu.categories.find(c => c.name === picker)?.items || []).map(i => i.dishId)}
          catName={picker}
          menuName={menu.name}
          onClose={() => setPicker(null)}
          onPick={(id, price) => { onAddDish(picker, id, price); }}
          onCreateNew={() => { const cat = picker; setPicker(null); setEditingDish({dishId: null, catName: cat, isNew: true}); }}
        />
      )}
    </div>
  );
}

// ─── Picker libreria: scegli uno o più piatti da aggiungere alla categoria ──
function DishLibraryPicker({ library, excludeIds, catName, menuName, onClose, onPick, onCreateNew }) {
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState({}); // id → price string
  const available = library.filter(d => !excludeIds.includes(d.id) && (!search || d.name.toLowerCase().includes(search.toLowerCase())));
  const togglePick = (id) => setSelected(s => {
    const next = {...s};
    if (next[id] !== undefined) delete next[id]; else next[id] = '';
    return next;
  });
  const setPrice = (id, v) => setSelected(s => ({...s, [id]: v}));
  const confirm = () => {
    Object.entries(selected).forEach(([id, p]) => onPick(id, parseFloat(String(p).replace(',','.')) || 0));
    onClose();
  };
  const count = Object.keys(selected).length;
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex:1000, display:'grid', placeItems:'center', padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{background: PN.WHITE, borderRadius: 22, width: 660, maxWidth:'100%', maxHeight:'88vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(15,17,21,0.22)'}}>

        {/* Header: icona tonda + eyebrow categoria + titolo + sottotitolo */}
        <div style={{padding:'22px 24px 0', display:'flex', alignItems:'flex-start', gap: 14}}>
          <div style={{width: 46, height: 46, borderRadius:'50%', background: PN.PINK_BG_SOFT, display:'grid', placeItems:'center', flexShrink: 0}}>
            <PnI.Plate size={21} color={PN.PINK}/>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:12, color:PN.PINK, textTransform:'uppercase', letterSpacing:0.8, fontWeight:800, marginBottom: 2}}>{catName}</div>
            <div style={{fontSize:18, fontWeight:800, color:PN.TEXT, letterSpacing:-0.2}}>Aggiungi piatti dalla libreria</div>
            <div style={{fontSize:14, color:PN.MUTED, marginTop: 3}}>Scegli i piatti da aggiungere al menù "{menuName}"</div>
          </div>
          <button onClick={onClose} style={{width:32, height:32, borderRadius:9, border:`1px solid ${PN.BORDER}`, background:PN.WHITE, cursor:'pointer', fontSize:16, color:PN.MUTED, display:'grid', placeItems:'center', flexShrink:0}}>✕</button>
        </div>

        {/* Ricerca */}
        <div style={{padding:'16px 24px 0'}}>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center'}}><PnI.Search size={14} color={PN.MUTED}/></span>
            <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca nella libreria…" style={{
              width:'100%', padding:'10px 14px 10px 36px', border:`1px solid ${PN.BORDER}`, borderRadius:10, fontSize:15.5, fontFamily:'inherit', outline:'none', background:PN.WHITE,
            }}/>
          </div>
        </div>

        {/* Card: crea nuovo piatto */}
        <div style={{padding:'14px 24px 0'}}>
          <div onClick={onCreateNew} style={{
            display:'flex', alignItems:'center', gap: 13, padding:'13px 16px', cursor:'pointer',
            background: PN.PINK_BG_SOFT, borderRadius: 12,
          }}>
            <div style={{width: 32, height: 32, borderRadius:'50%', border:`1.5px solid ${PN.PINK}`, color: PN.PINK, display:'grid', placeItems:'center', fontSize: 18, fontWeight: 600, flexShrink: 0, lineHeight: 1}}>+</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:15, fontWeight:700, color: PN.TEXT}}>Crea nuovo piatto</div>
              <div style={{fontSize:13.5, color: PN.MUTED, marginTop: 1}}>Non lo trovi in libreria? Crealo ora: verrà aggiunto subito in "{catName}"</div>
            </div>
            <PnI.ChevronRight size={13} color={PN.PINK}/>
          </div>
        </div>

        {/* Lista piatti */}
        <div style={{flex:1, overflowY:'auto', padding:'10px 14px 12px'}}>
          {available.length === 0 && (
            <div style={{padding:'40px 22px', textAlign:'center', color:PN.MUTED, fontSize: 15}}>Nessun piatto in libreria che corrisponda alla ricerca.</div>
          )}
          {available.map(d => {
            const on = selected[d.id] !== undefined;
            return (
              <div key={d.id} onClick={() => togglePick(d.id)} style={{
                display:'flex', alignItems:'center', gap: 13, padding:'9px 10px', cursor:'pointer',
                background: on ? PN.PINK_BG_SOFT : 'transparent', borderRadius: 12,
                transition:'background .12s',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#FAFBFC'; }}
              onMouseLeave={e => { e.currentTarget.style.background = on ? PN.PINK_BG_SOFT : 'transparent'; }}
              >
                <input type="checkbox" checked={on} readOnly style={{accentColor: PN.PINK, pointerEvents:'none', width: 16, height: 16, flexShrink: 0, margin: 0}}/>
                <div style={{width: 46, height: 46, borderRadius: 10, background:'#F4F5F7', display:'grid', placeItems:'center', flexShrink: 0, color: PN.MUTED_SOFT}}>
                  <Icon name={CAT_ICON[d.cat] || 'star'} size={20}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT}}>{d.name}</div>
                  <div style={{fontSize:13.5, lineHeight:1.4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                    <span style={{fontWeight:700, color:PN.MUTED}}>{d.cat}</span>
                    <span style={{color:PN.MUTED}}> • {d.desc}</span>
                  </div>
                </div>
                {on ? (
                  <div onClick={e => e.stopPropagation()} style={{display:'flex', alignItems:'center', gap:4, background:PN.WHITE, padding:'5px 9px', borderRadius:9, border:`1px solid ${PN.PINK}`, flexShrink:0}}>
                    <span style={{fontSize:14, color:PN.MUTED, fontWeight:700}}>€</span>
                    <input value={selected[d.id]} onChange={e => setPrice(d.id, e.target.value)} placeholder="0,00" style={{
                      width: 52, fontSize:15, fontWeight:700, color:PN.TEXT, border:'none', outline:'none', textAlign:'right', fontFamily:'inherit', background:'transparent',
                    }}/>
                  </div>
                ) : (
                  <div style={{width: 34, height: 34, borderRadius: 9, border:`1px solid ${PN.BORDER}`, background:PN.WHITE, display:'grid', placeItems:'center', fontSize: 17, color: PN.TEXT, flexShrink: 0, lineHeight: 1}}>+</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{padding:'15px 24px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', justifyContent:'space-between', alignItems:'center', gap: 10}}>
          <div style={{fontSize:14.5, color:PN.MUTED}}>{count > 0 ? `${count} piatt${count===1?'o':'i'} selezionat${count===1?'o':'i'}` : 'Seleziona uno o più piatti'}</div>
          <div style={{display:'flex', gap:8}}>
            <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
            <ImpButton variant="pink" onClick={confirm}>Aggiungi al menù</ImpButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function LibrarySidebar({ library, menus, filters, setFilters }) {
  const inMenus = (dishId) => menus.some(m => m.categories.some(c => c.items.some(i => i.dishId === dishId)));
  const counts = {
    all: library.length,
    unused: library.filter(d => !inMenus(d.id)).length,
  };
  const allergenList = ALLERGENS.slice(0, 8);
  const toggleAllergen = (id) => setFilters(f => ({...f, allergens: f.allergens.includes(id) ? f.allergens.filter(a => a !== id) : [...f.allergens, id]}));

  const Section = ({ title, children }) => (
    <div style={{
      background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 12,
      padding: '12px 14px', marginBottom: 10,
    }}>
      {title && <div style={{fontSize: 12.5, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.6, textTransform:'uppercase', marginBottom: 8}}>{title}</div>}
      {children}
    </div>
  );

  return (
    <div>
      <Section title="Senza allergeni">
        <div style={{display:'flex', flexWrap:'wrap', gap: 5}}>
          {allergenList.map(a => {
            const on = filters.allergens.includes(a.id);
            return (
              <button key={a.id} onClick={() => toggleAllergen(a.id)} style={{
                padding: '4px 8px', borderRadius: 5,
                border: `1px solid ${on ? PN.PINK : PN.BORDER}`,
                background: on ? PN.PINK_SOFT : PN.WHITE,
                color: on ? PN.PINK_DARK : PN.MUTED,
                fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                textTransform:'uppercase', letterSpacing: 0.4,
              }}>{a.name}</button>
            );
          })}
        </div>
      </Section>

      <Section>
        <label style={{display:'flex', alignItems:'center', gap: 9, cursor:'pointer'}}>
          <input type="checkbox" checked={filters.unused} onChange={e => setFilters(f => ({...f, unused: e.target.checked}))} style={{accentColor: PN.PINK, margin: 0}}/>
          <span style={{flex:1, fontSize: 14.5, fontWeight: 600, color: PN.TEXT}}>Non in uso</span>
          <span style={{fontSize: 13, color: PN.MUTED, fontWeight: 700}}>{counts.unused}</span>
        </label>
        <div style={{fontSize: 13, color: PN.MUTED, lineHeight: 1.45, marginTop: 6}}>
          Piatti in libreria non aggiunti a nessun menù
        </div>
      </Section>
    </div>
  );
}

function DishLibraryView({ library, menus, filters, onUpsertLibraryDish, onRemoveLibraryDish }) {
  const [search, setSearch] = React.useState('');
  const [editingDish, setEditingDish] = React.useState(null);

  const inMenusFor = (dishId) => menus.filter(m => m.categories.some(c => c.items.some(i => i.dishId === dishId)));
  const filtered = library.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters?.category && filters.category !== 'all' && d.cat !== filters.category) return false;
    if (filters?.allergens?.length && !filters.allergens.every(a => d.allergens?.includes(a))) {
      // mostra solo i piatti SENZA quegli allergeni
      if (filters.allergens.some(a => d.allergens?.includes(a))) return false;
    }
    if (filters?.unused && inMenusFor(d.id).length > 0) return false;
    return true;
  });

  return (
    <ImpCard
      aurora
      title="Libreria piatti"
      sub={`${filtered.length} di ${library.length} piatti · catalogo della cucina`}
      action={
        <ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={() => setEditingDish({dishId: null, isNew: true, fromLibrary: true})}>Nuovo piatto</ImpButton>
      }
    >
      <div style={{position:'relative', marginBottom: 14}}>
        <span style={{position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)', color: PN.MUTED, display: 'flex', alignItems: 'center'}}><PnI.Search size={13} color={PN.MUTED}/></span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca tra tutti i piatti…" style={{
          width:'100%', padding: '10px 12px 10px 38px',
          border:`1px solid ${PN.BORDER}`, borderRadius: 9,
          fontSize: 15.5, fontFamily:'inherit', outline:'none',
        }}/>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 0}}>
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 240px',
          gap: 14, padding: '8px 18px',
          fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
          textTransform:'uppercase', letterSpacing: 0.5,
          borderBottom: `1px solid ${PN.BORDER_SOFT}`,
        }}>
          <div>Piatto</div>
          <div>Presente in</div>
        </div>
        {filtered.map(d => {
          const inMenus = inMenusFor(d.id);
          return (
            <div key={d.id} onClick={() => setEditingDish({dishId: d.id, isNew: false, fromLibrary: true})} style={{
              display:'grid', gridTemplateColumns:'1fr 240px',
              gap: 14, alignItems:'center',
              padding:'12px 18px',
              borderBottom: `1px solid ${PN.BORDER_SOFT}`,
              background: PN.WHITE,
              cursor:'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; }}
            >
              <div>
                <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 2}}>
                  <span style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>{d.name}</span>
                  <span style={{fontSize: 13, color: PN.MUTED}}>· {d.cat}</span>
                </div>
                {d.desc && <div style={{fontSize:14, color:PN.MUTED, lineHeight: 1.4, marginBottom: 4}}>{d.desc}</div>}
                {d.allergens.length > 0 && (
                  <div style={{display:'flex', gap: 4, flexWrap:'wrap', marginTop: 3}}>
                    {d.allergens.slice(0,4).map(a => {
                      const al = ALLERGENS.find(x => x.id === a);
                      return (
                        <span key={a} style={{
                          fontSize: 11.5, color: PN.MUTED, background:'#F4F5F7',
                          padding:'2px 6px', borderRadius: 4,
                          textTransform:'uppercase', letterSpacing: 0.5, fontWeight: 700,
                        }}>{al?.name || a}</span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{display:'flex', gap: 4, flexWrap:'wrap'}}>
                {inMenus.length === 0 ? (
                  <span style={{fontSize: 13, color: PN.MUTED, fontStyle:'italic'}}>In nessun menù</span>
                ) : (
                  inMenus.map(m => (
                    <span key={m.id} style={{
                      fontSize: 12.5, fontWeight: 600,
                      padding:'2px 7px', borderRadius: 4,
                      background: PN.PINK_SOFT, color: PN.PINK_DARK,
                    }}>{m.name.replace('Menù ','')}</span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingDish && (
        <DishEditModal
          {...editingDish}
          dish={editingDish.dishId ? library.find(x => x.id === editingDish.dishId) : null}
          onClose={() => setEditingDish(null)}
          onSave={(d) => { onUpsertLibraryDish({...d, id: d.id || ('new' + Date.now())}); setEditingDish(null); }}
          onDelete={editingDish.dishId ? () => { onRemoveLibraryDish(editingDish.dishId); setEditingDish(null); } : null}
        />
      )}
    </ImpCard>
  );
}

// ─── DishRow: riga ricca ─────────────────────────────────────────────────────
function DishRow({ dish, item, onToggleActive, onPriceClick, editingPrice, onPriceCommit, onPriceCancel, onEdit, onRemove }) {
  const [tmpPrice, setTmpPrice] = React.useState(item.price.toFixed(2));
  React.useEffect(() => { if (editingPrice) setTmpPrice(item.price.toFixed(2)); }, [editingPrice]);

  return (
    <div onClick={!editingPrice ? onEdit : undefined} style={{
      display:'grid', gridTemplateColumns: '20px 1fr auto auto auto auto',
      gap: 14, alignItems:'center',
      padding: '14px 18px',
      background: item.active ? PN.WHITE : '#FAFBFC',
      borderTop: `1px solid ${PN.BORDER_SOFT}`,
      opacity: item.active ? 1 : 0.7,
      transition: 'background .15s',
      cursor: editingPrice ? 'default' : 'pointer',
    }}
    onMouseEnter={e => { if (!editingPrice) e.currentTarget.style.background = item.active ? '#F9FAFB' : '#F4F5F7'; }}
    onMouseLeave={e => { e.currentTarget.style.background = item.active ? PN.WHITE : '#FAFBFC'; }}
    >
      {/* Drag handle */}
      <div style={{color: PN.MUTED, cursor:'grab', fontSize: 16, lineHeight: 1, userSelect:'none'}}>≡</div>

      {/* Nome + descrizione + allergeni */}
      <div style={{minWidth: 0}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 3, flexWrap:'wrap'}}>
          <span style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>{dish.name}</span>
          {item.isNew && (
            <span style={{
              fontSize: 11.5, fontWeight: 800, letterSpacing: 0.4,
              padding:'2px 7px', borderRadius: 4,
              background: PN.GREEN_SOFT, color: PN.GREEN,
            }}>NUOVO</span>
          )}
        </div>
        {dish.desc && (
          <div style={{fontSize: 14.5, color: PN.MUTED, lineHeight: 1.4, marginBottom: 6}}>{dish.desc}</div>
        )}
        {dish.allergens.length > 0 && (
          <div style={{display:'flex', gap: 4, flexWrap:'wrap'}}>
            {dish.allergens.map(a => {
              const al = ALLERGENS.find(x => x.id === a);
              return (
                <span key={a} style={{
                  fontSize: 11.5, color: PN.MUTED, background:'#F4F5F7',
                  padding:'2px 7px', borderRadius: 4,
                  textTransform:'uppercase', letterSpacing: 0.5, fontWeight: 700,
                }}>{al?.name || a}</span>
              );
            })}
          </div>
        )}
      </div>

      {/* Prezzo (inline-edit) */}
      <div onClick={e => { e.stopPropagation(); if (!editingPrice) onPriceClick(); }} style={{
        cursor: editingPrice ? 'text' : 'pointer',
        padding:'4px 10px', borderRadius: 6,
        background: editingPrice ? PN.WHITE : 'transparent',
        border: editingPrice ? `1.5px solid ${PN.PINK}` : '1.5px solid transparent',
        minWidth: 84, textAlign:'right',
      }}
      onMouseEnter={e => { if (!editingPrice) e.currentTarget.style.background = '#F4F5F7'; }}
      onMouseLeave={e => { if (!editingPrice) e.currentTarget.style.background = 'transparent'; }}
      title="Clicca per modificare il prezzo"
      >
        {editingPrice ? (
          <div style={{display:'flex', alignItems:'center', gap: 4}}>
            <span style={{fontSize: 16, fontWeight: 700, color: PN.MUTED}}>€</span>
            <input
              autoFocus
              value={tmpPrice}
              onChange={e => setTmpPrice(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { onPriceCommit(parseFloat(tmpPrice.replace(',','.')) || 0); }
                if (e.key === 'Escape') { onPriceCancel(); }
              }}
              onBlur={() => onPriceCommit(parseFloat(tmpPrice.replace(',','.')) || 0)}
              style={{
                width: 60, fontSize: 16, fontWeight: 700, color: PN.TEXT,
                border:'none', outline:'none', textAlign:'right',
                fontFamily:'inherit', background: 'transparent',
              }}
            />
          </div>
        ) : (
          <span style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>€ {item.price.toFixed(2).replace('.',',')}</span>
        )}
      </div>

      {/* Toggle attivo/disattivato */}
      <button onClick={e => { e.stopPropagation(); onToggleActive(); }} title={item.active ? 'Attivo (clicca per disattivare)' : 'Disattivato (clicca per riattivare)'} style={{
        display:'inline-flex', alignItems:'center', gap: 6,
        padding:'5px 11px', borderRadius: 999,
        border: `1.5px solid ${item.active ? PN.GREEN : PN.BORDER}`,
        background: item.active ? PN.GREEN_SOFT : PN.BORDER_SOFT,
        color: item.active ? PN.GREEN : PN.MUTED,
        fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
        cursor:'pointer', fontFamily:'inherit',
        textTransform:'uppercase',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius:'50%',
          background: item.active ? PN.GREEN : PN.MUTED,
        }}/>
        {item.active ? 'Attivo' : 'Disattivato'}
      </button>

      {/* Rimuovi dal menù */}
      <button onClick={e => { e.stopPropagation(); onRemove(); }} title="Rimuovi dal menù (resta nella libreria)" style={{
        width: 30, height: 30, borderRadius: 7,
        border:'none', background:'transparent', color: PN.MUTED,
        cursor:'pointer', display:'grid', placeItems:'center', fontSize: 16,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = PN.RED_SOFT; e.currentTarget.style.color = PN.RED; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
      >✕</button>
    </div>
  );
}

// ─── NutritionFields AI: stima ingredienti → kcal/macro ──────────────────────
function NutritionFields() {
  const [values, setValues] = React.useState({ kcal: '478', carb: '52', prot: '18', fat: '21' });
  const [regenerating, setRegenerating] = React.useState(false);
  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setValues({ kcal: '482', carb: '54', prot: '17', fat: '22' });
      setRegenerating(false);
    }, 800);
  };
  return (
    <div>
      <div style={{
        marginBottom: 12, padding:'10px 12px', borderRadius: 8,
        background: PN.GREEN_SOFT, display:'flex', alignItems:'center', gap:10,
      }}>
        <span style={{fontSize: 16}}>✨</span>
        <div style={{flex:1, fontSize:15, color: PN.GREEN, fontWeight:600, lineHeight:1.4}}>
          Stimati dall'AI in base agli ingredienti. Modifica i valori se serve, oppure rigenera.
        </div>
        <button onClick={regenerate} disabled={regenerating} style={{
          background: PN.WHITE, color: PN.GREEN, border:`1px solid ${PN.GREEN}`,
          padding:'6px 10px', borderRadius:6, fontSize:15, fontWeight:700,
          cursor: regenerating ? 'default' : 'pointer', fontFamily:'inherit',
          whiteSpace:'nowrap', opacity: regenerating ? 0.7 : 1,
        }}>{regenerating ? 'Calcolo…' : '↻ Rigenera'}</button>
      </div>
      <div style={{fontSize:14.5, fontWeight:700, color:PN.MUTED, letterSpacing:0.3, textTransform:'uppercase', marginBottom:8}}>Per porzione</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8}}>
        {[{l:'Kcal', k:'kcal'},{l:'Carb. (g)', k:'carb'},{l:'Proteine (g)', k:'prot'},{l:'Grassi (g)', k:'fat'}].map(f => (
          <div key={f.k}>
            <input value={values[f.k]} onChange={e => setValues(v => ({...v, [f.k]: e.target.value}))} type="number" style={{
              width:'100%', padding:'10px 8px', border:`1px solid ${PN.BORDER}`,
              borderRadius:8, fontSize:17, fontFamily:'inherit', outline:'none',
              textAlign:'center', fontWeight:700, color: PN.TEXT,
            }}/>
            <div style={{fontSize:14, color:PN.MUTED, textAlign:'center', marginTop:4, fontWeight:600}}>{f.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components per personalizzazioni piatto ────────────────────────────
function CollapseSection({ title, subtitle, icon, open, onToggle, children }) {
  return (
    <div style={{
      border: `1px solid ${open ? PN.BORDER : PN.BORDER_SOFT}`,
      borderRadius: 10, marginBottom: 8, overflow: open ? 'visible' : 'hidden', background:'#fff',
      transition:'border-color .15s',
    }}>
      <button onClick={onToggle} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'12px 14px', background: open ? '#FAFBFC' : '#fff',
        border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
        <div style={{
          width:26, height:26, borderRadius:6,
          background: open ? PN.PINK_SOFT : '#F4F5F7',
          color: open ? PN.PINK_DARK : PN.MUTED,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: 16, fontWeight: 700, flexShrink:0,
        }}>{icon}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:16.5, fontWeight:700, color: PN.TEXT}}>{title}</div>
          <div style={{fontSize:15, color: PN.MUTED, marginTop:1}}>{subtitle}</div>
        </div>
        <span style={{transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition:'transform .2s', color: PN.MUTED, fontSize: 14}}>▼</span>
      </button>
      {open && (
        <div style={{padding:'14px', background:'#fff', borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
          {children}
        </div>
      )}
    </div>
  );
}

function IngredientList({ ingredients, setIngredients }) {
  const [query, setQuery] = React.useState('');
  const [showSuggest, setShowSuggest] = React.useState(false);
  const [expandedIdx, setExpandedIdx] = React.useState(null);
  const [editingQtyIdx, setEditingQtyIdx] = React.useState(null);
  const [db, setDb] = React.useState(() => window.getIngredientDB());
  React.useEffect(() => window.subscribeIngredientDB(() => setDb([...window.getIngredientDB()])), []);

  const usedNames = new Set(ingredients.map(i => i.name.toLowerCase()));
  const dbMatches = db
    .filter(d => !usedNames.has(d.name.toLowerCase()))
    .filter(d => !query || d.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);
  const exactMatch = query.trim() && db.some(d => d.name.toLowerCase() === query.trim().toLowerCase());

  const addExisting = (dbItem) => {
    setIngredients(arr => [...arr, { name: dbItem.name, removable: false, allergens: [...(dbItem.allergens || [])], qty: '', unit: 'g' }]);
    setQuery(''); setShowSuggest(false);
  };
  const addNew = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const found = window.findIngredient(trimmed);
    if (found) { addExisting(found); return; }
    // Ingrediente fuori libreria: se il nome contiene una base nota
    // ("Mozzarella di bufala" → "Mozzarella") ne eredita gli allergeni, che
    // restano poi modificabili a mano come tutti gli altri.
    const inferred = window.inferAllergens(trimmed);
    window.upsertIngredient(trimmed, inferred);
    setIngredients(arr => [...arr, { name: trimmed, removable: false, allergens: inferred, qty: '', unit: 'g' }]);
    setQuery(''); setShowSuggest(false);
  };
  const toggleIngAllergen = (i, aid) => {
    setIngredients(arr => arr.map((x, idx) => {
      if (idx !== i) return x;
      const cur = x.allergens || [];
      const next = cur.includes(aid) ? cur.filter(a => a !== aid) : [...cur, aid];
      window.upsertIngredient(x.name, next);
      return { ...x, allergens: next };
    }));
  };

  return (
    <div>
      {ingredients.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:4, marginBottom:12}}>
          {ingredients.map((ing, i) => {
            const ingAllergens = ing.allergens || [];
            const isExpanded = expandedIdx === i;
            const isEditingQty = editingQtyIdx === i;
            return (
              <div key={i} style={{
                borderRadius: 9,
                border: `1px solid ${isExpanded ? PN.BORDER : PN.BORDER_SOFT}`,
                background: isExpanded ? PN.WHITE : '#FAFBFC',
                overflow: 'hidden',
                transition: 'border-color 150ms, background 150ms',
              }}>
                {/* Main row */}
                <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 10px'}}>
                  <span style={{flex:1, fontSize:15.5, fontWeight:600, color:PN.TEXT, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {ing.name}
                  </span>

                  {/* Qty — chip click-to-edit */}
                  {isEditingQty ? (
                    <div style={{display:'flex', alignItems:'center', gap:3}}>
                      <input autoFocus value={ing.qty || ''}
                        onChange={e => setIngredients(arr => arr.map((x, idx) => idx===i ? {...x, qty: e.target.value.replace(/[^0-9,.]/g,'')} : x))}
                        onBlur={() => setEditingQtyIdx(null)}
                        onKeyDown={e => { if(e.key==='Enter'||e.key==='Escape') setEditingQtyIdx(null); }}
                        placeholder="0"
                        style={{width:44, padding:'3px 6px', border:`1px solid ${PN.PINK}`, borderRadius:5, fontSize:15, fontFamily:'inherit', textAlign:'right', outline:'none'}}
                      />
                      <select value={ing.unit || 'g'}
                        onChange={e => setIngredients(arr => arr.map((x, idx) => idx===i ? {...x, unit: e.target.value} : x))}
                        style={{padding:'3px 4px', border:`1px solid ${PN.BORDER}`, borderRadius:5, fontSize:14.5, fontFamily:'inherit', outline:'none', background:'#fff', cursor:'pointer'}}
                      >
                        {['g','kg','ml','cl','l','pz','q.b.'].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  ) : (
                    <button onClick={() => setEditingQtyIdx(i)} title="Modifica quantità" style={{
                      padding:'3px 8px', borderRadius:5,
                      border:`1px solid ${ing.qty ? PN.BORDER : PN.BORDER_SOFT}`,
                      background: ing.qty ? PN.WHITE : 'transparent',
                      color: ing.qty ? PN.TEXT : PN.MUTED,
                      fontSize:14.5, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap',
                    }}>
                      {ing.qty ? `${ing.qty} ${ing.unit || 'g'}` : '+ qtà'}
                    </button>
                  )}

                  {/* Allergen dots — click to expand panel */}
                  <button onClick={() => setExpandedIdx(isExpanded ? null : i)} title="Gestisci allergeni" style={{
                    display:'inline-flex', alignItems:'center', gap:3,
                    padding: ingAllergens.length ? '3px 6px' : '3px 8px',
                    borderRadius:6,
                    border:`1px solid ${isExpanded ? PN.PINK : (ingAllergens.length ? PN.BORDER : PN.BORDER_SOFT)}`,
                    background: isExpanded ? PN.PINK_SOFT : (ingAllergens.length ? '#FFF6F7' : 'transparent'),
                    color: PN.MUTED, fontSize:14.5, cursor:'pointer', fontFamily:'inherit',
                  }}>
                    {ingAllergens.length > 0 ? (
                      <>
                        {ingAllergens.slice(0,3).map(aid => <window.AllergenIcon key={aid} id={aid} size={13}/>)}
                        {ingAllergens.length > 3 && <span style={{fontSize:13, color:PN.MUTED, fontWeight:700}}>+{ingAllergens.length-3}</span>}
                      </>
                    ) : (
                      <span style={{color: isExpanded ? PN.PINK_DARK : PN.MUTED}}>Allergeni</span>
                    )}
                  </button>

                  {/* Removable toggle — minus-circle = "opzionale/escludibile" */}
                  <button
                    onClick={() => setIngredients(arr => arr.map((x, idx) => idx===i ? {...x, removable: !x.removable} : x))}
                    title={ing.removable ? 'Rimovibile dal cliente — clicca per bloccare' : 'Il cliente non può rimuovere — clicca per abilitare'}
                    style={{
                      width:28, height:28, borderRadius:6, flexShrink:0,
                      border:`1px solid ${ing.removable ? PN.PINK : PN.BORDER_MED}`,
                      background: ing.removable ? PN.PINK_SOFT : '#F4F5F7',
                      color: ing.removable ? PN.PINK_DARK : PN.MUTED,
                      cursor:'pointer', display:'grid', placeItems:'center',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                  </button>

                  {/* Delete */}
                  <button onClick={() => { setIngredients(arr => arr.filter((_, idx) => idx !== i)); if(expandedIdx===i) setExpandedIdx(null); }}
                    style={{width:26, height:26, background:'transparent', border:'none', borderRadius:6, cursor:'pointer', color:PN.MUTED, display:'grid', placeItems:'center', flexShrink:0}}>
                    <Icon name="xmark" size={13}/>
                  </button>
                </div>

                {/* Inline allergen panel */}
                {isExpanded && (
                  <div style={{padding:'10px 12px 12px', borderTop:`1px solid ${PN.BORDER_SOFT}`, background:'#F7F8FA'}}>
                    <div style={{fontSize:13.5, fontWeight:700, color:PN.MUTED, letterSpacing:0.4, textTransform:'uppercase', marginBottom:8}}>
                      Allergeni · {ing.name}
                    </div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
                      {window.ALLERGENS.map(a => {
                        const on = ingAllergens.includes(a.id);
                        return (
                          <button key={a.id} onClick={() => toggleIngAllergen(i, a.id)} style={{
                            display:'inline-flex', alignItems:'center', gap:5,
                            padding:'5px 10px', borderRadius:999,
                            border:`1px solid ${on ? PN.PINK : PN.BORDER_MED}`,
                            background: on ? '#FFF1F4' : '#F4F5F7',
                            color: on ? PN.PINK_DARK : PN.TEXT,
                            fontSize:14.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                          }}>
                            <window.AllergenIcon id={a.id} size={12}/>
                            {a.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {ingredients.some(i => i.removable) && (
            <div style={{display:'flex', alignItems:'center', gap:5, fontSize:13.5, color:PN.MUTED, paddingLeft:2}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color:PN.PINK_DARK, flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Ingrediente rimovibile dal cliente in fase d'ordine
            </div>
          )}
        </div>
      )}
      <div style={{position:'relative'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:8, background:'#fff'}}>
          <Icon name="magnifying-glass" size={14} color={PN.MUTED}/>
          <input value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggest(true); }}
            onFocus={() => setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
            onKeyDown={e => { if (e.key==='Enter') addNew(query); }}
            placeholder="Cerca o aggiungi ingrediente…"
            style={{flex:1, border:'none', outline:'none', fontSize:15.5, fontFamily:'inherit', background:'transparent', color:PN.TEXT}}
          />
          {query.trim() && !exactMatch && (
            <button onMouseDown={() => addNew(query)} style={{
              background: PN.PINK, color:'#fff', border:'none',
              padding:'4px 10px', borderRadius:5, fontSize:14.5, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit', flexShrink:0,
            }}>+ Crea</button>
          )}
        </div>
        {showSuggest && dbMatches.length > 0 && (
          <div style={{position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:`1px solid ${PN.BORDER}`, borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.08)', zIndex:10, maxHeight:240, overflowY:'auto'}}>
            <div style={{padding:'7px 12px', fontSize:13.5, fontWeight:700, color:PN.MUTED, letterSpacing:0.3, textTransform:'uppercase', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>Dal tuo archivio</div>
            {dbMatches.map(s => (
              <button key={s.name} onMouseDown={() => addExisting(s)}
                style={{width:'100%', textAlign:'left', padding:'8px 12px', background:'transparent', border:'none', borderBottom:`1px solid ${PN.BORDER_SOFT}`, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:10}}
                onMouseEnter={e => e.currentTarget.style.background='#FAFBFC'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <Icon name="plus" size={12} color={PN.MUTED}/>
                <span style={{fontSize:15.5, color:PN.TEXT, fontWeight:600, flex:1}}>{s.name}</span>
                {s.allergens && s.allergens.length > 0 && (
                  <div style={{display:'flex', gap:3}}>
                    {s.allergens.slice(0,4).map(aid => <window.AllergenIcon key={aid} id={aid} size={13}/>)}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Il max è per SINGOLA aggiunta: quante volte il cliente può ripeterla sullo
// stesso piatto (l'ordine porta già extras{ extraId: qty }). Vuoto = nessun
// limite, così gli extra creati prima di questo campo restano come sono.
const parseExtraMax = (v) => {
  const n = parseInt(v, 10);
  return n > 0 ? n : null;
};

function ExtrasList({ extras, setExtras }) {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [max, setMax] = React.useState('');
  const add = () => {
    if (!name.trim()) return;
    setExtras(arr => [...arr, { name: name.trim(), price: parseFloat(price) || 0, max: parseExtraMax(max) }]);
    setName(''); setPrice(''); setMax('');
  };
  const setExtraMax = (i, v) => setExtras(arr => arr.map((ex, idx) =>
    idx === i ? { ...ex, max: parseExtraMax(v) } : ex));
  const maxInput = (value, onChange, extraStyle) => (
    <input value={value} onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
      placeholder="∞" inputMode="numeric"
      title="Quante volte il cliente può ripetere questa aggiunta sul piatto. Vuoto = nessun limite."
      style={{border:`1px solid ${PN.BORDER}`, borderRadius:6, fontFamily:'inherit', textAlign:'center', outline:'none', ...extraStyle}}/>
  );
  return (
    <div>
      {extras.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:12}}>
          {extras.map((ex, i) => (
            <div key={i} className="extra-row" style={{
              display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:12, alignItems:'center',
              padding:'10px 10px 10px 14px', background:PN.WHITE,
              border:`1px solid ${PN.BORDER_SOFT}`, borderRadius:10,
              transition:'border-color 150ms ease-out',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = PN.BORDER}
            onMouseLeave={e => e.currentTarget.style.borderColor = PN.BORDER_SOFT}
            >
              <span style={{fontSize:16, color: PN.TEXT, fontWeight:600}}>{ex.name}</span>
              <span style={{
                fontSize:15, fontWeight:700, color: PN.PINK_DARK,
                background: PN.PINK_SOFT, padding:'3px 9px', borderRadius:999,
                fontVariantNumeric:'tabular-nums',
              }}>+ € {ex.price.toFixed(2)}</span>
              <label style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:14, color: PN.MUTED, fontWeight:600}}
                title="Quante volte il cliente può ripetere questa aggiunta. Vuoto = illimitato.">
                max
                {maxInput(ex.max ?? '', v => setExtraMax(i, v), {width:52, padding:'5px 6px', fontSize:15, borderRadius:7, background:PN.WHITE})}
              </label>
              <button onClick={() => setExtras(arr => arr.filter((_, idx) => idx !== i))}
                aria-label={`Rimuovi ${ex.name}`}
                style={{width:28, height:28, background:'transparent', border:'none', borderRadius:7, cursor:'pointer', color: PN.MUTED, display:'grid', placeItems:'center', fontSize:15, transition:'background 150ms ease-out, color 150ms ease-out'}}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = PN.RED; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
      {/* Riga di inserimento: ogni campo ha la sua etichetta e i simboli (€, max)
          stanno in un riquadro a parte. Prima erano prefissi in overlay sopra
          l'input: il cursore ci finiva sopra e non si capiva cosa scrivere. */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 128px 104px auto', gap:10, alignItems:'end',
        padding:12, background:'#F8FAFC', borderRadius:10, border:`1px solid ${PN.BORDER_SOFT}`,
      }}>
        <label style={{display:'block'}}>
          <span style={{display:'block', fontSize:14, fontWeight:600, color:PN.MUTED, marginBottom:5}}>Aggiunta</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="es. Tartufo nero" style={{
            width:'100%', padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:8,
            fontSize:16, fontFamily:'inherit', outline:'none', background:PN.WHITE,
          }}/>
        </label>

        <label style={{display:'block'}}>
          <span style={{display:'block', fontSize:14, fontWeight:600, color:PN.MUTED, marginBottom:5}}>Prezzo</span>
          <div style={{display:'flex', border:`1px solid ${PN.BORDER}`, borderRadius:8, overflow:'hidden', background:PN.WHITE}}>
            <span style={{
              padding:'0 10px', display:'grid', placeItems:'center', flexShrink:0,
              background:'#F4F5F7', borderRight:`1px solid ${PN.BORDER}`,
              fontSize:15, fontWeight:700, color:PN.MUTED,
            }}>+€</span>
            <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9,.]/g,''))} placeholder="4,00" inputMode="decimal" style={{
              width:'100%', minWidth:0, padding:'9px 10px', border:'none', outline:'none',
              fontSize:16, fontFamily:'inherit', textAlign:'right', background:'transparent',
            }}/>
          </div>
        </label>

        <label style={{display:'block'}}>
          <span style={{display:'block', fontSize:14, fontWeight:600, color:PN.MUTED, marginBottom:5}}
            title="Quante volte il cliente può ripetere questa aggiunta. Vuoto = illimitato.">
            Max
          </span>
          <input value={max} onChange={e => setMax(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="illimitato" inputMode="numeric"
            title="Quante volte il cliente può ripetere questa aggiunta. Vuoto = illimitato."
            style={{
              width:'100%', padding:'9px 10px', border:`1px solid ${PN.BORDER}`, borderRadius:8,
              fontSize:15, fontFamily:'inherit', outline:'none', textAlign:'center', background:PN.WHITE,
            }}/>
        </label>

        <button onClick={add} disabled={!name.trim()} style={{
          height:40, padding:'0 18px', borderRadius:8, border:'none',
          background: name.trim() ? PN.PINK : '#E9EBEF',
          color: name.trim() ? '#fff' : PN.MUTED,
          fontSize:16, fontWeight:700, cursor: name.trim() ? 'pointer' : 'default', fontFamily:'inherit',
          transition:'background 150ms ease-out',
        }}>Aggiungi</button>
      </div>
    </div>
  );
}

function VariantsList({ variants, setVariants }) {
  const addGroup = () => setVariants(arr => [...arr, { name:'', options:[''], required:true }]);
  const updateGroup = (i, patch) => setVariants(arr => arr.map((v, idx) => idx===i ? {...v, ...patch} : v));
  const removeGroup = (i) => setVariants(arr => arr.filter((_, idx) => idx !== i));
  return (
    <div>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {variants.map((v, i) => (
          <div key={i} style={{border:`1px solid ${PN.BORDER_SOFT}`, borderRadius:12, overflow:'hidden', background:PN.WHITE}}>
            {/* Header del gruppo su fondo tenue: separa il nome del gruppo
                dalle sue opzioni, che prima erano tutti input uguali in fila */}
            <div style={{
              display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'center',
              padding:'10px 10px 10px 12px', background:'#F8FAFC',
              borderBottom:`1px solid ${PN.BORDER_SOFT}`,
            }}>
              <input value={v.name} onChange={e => updateGroup(i, {name:e.target.value})} placeholder="Nome del gruppo (es. Cottura, Formato, Pane)" style={{padding:'8px 11px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:16, fontFamily:'inherit', outline:'none', fontWeight:600, background:PN.WHITE}}/>
              <button onClick={() => removeGroup(i)} aria-label="Rimuovi gruppo"
                style={{width:30, height:30, background:'transparent', border:'none', borderRadius:7, cursor:'pointer', color: PN.MUTED, display:'grid', placeItems:'center', fontSize:15, transition:'background 150ms ease-out, color 150ms ease-out'}}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = PN.RED; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
              >✕</button>
            </div>
            <div style={{padding:12}}>
            <div style={{display:'flex', flexDirection:'column', gap:5, marginBottom:8}}>
              {v.options.map((opt, oi) => (
                <div key={oi} style={{display:'flex', gap:8, alignItems:'center'}}>
                  {/* pallino: rende evidente che sono alternative di una scelta */}
                  <span aria-hidden="true" style={{
                    width:14, height:14, borderRadius:'50%', flexShrink:0,
                    border:`1.5px solid ${PN.BORDER_HOVER || '#D1D5DB'}`, background:PN.WHITE,
                  }}/>
                  <input value={opt} onChange={e => updateGroup(i, {options: v.options.map((x, idx) => idx===oi ? e.target.value : x)})} placeholder={`Opzione ${oi+1} (es. Al sangue)`} style={{flex:1, padding:'8px 11px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:15.5, fontFamily:'inherit', outline:'none'}}/>
                  {v.options.length > 1 && (
                    <button onClick={() => updateGroup(i, {options: v.options.filter((_, idx) => idx !== oi)})}
                      aria-label={`Rimuovi opzione ${oi+1}`}
                      style={{width:28, height:28, background:'transparent', border:'none', borderRadius:7, cursor:'pointer', color: PN.MUTED, display:'grid', placeItems:'center', fontSize:13, transition:'background 150ms ease-out, color 150ms ease-out'}}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = PN.RED; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
                    >✕</button>
                  )}
                </div>
              ))}
              <button onClick={() => updateGroup(i, {options: [...v.options, '']})} style={{background:'transparent', border:'none', color: PN.PINK_DARK, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5, padding:'4px 0', alignSelf:'flex-start'}}>+ Aggiungi opzione</button>
            </div>
            <label style={{display:'flex', alignItems:'center', gap:7, fontSize:15, color: PN.MUTED, fontWeight:600, cursor:'pointer', paddingTop:8, borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
              <input type="checkbox" checked={v.required} onChange={() => updateGroup(i, {required: !v.required})} style={{margin:0, accentColor: PN.PINK}}/>
              Scelta obbligatoria — il cliente deve sceglierne una prima di aggiungere al carrello
            </label>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addGroup} style={{marginTop: variants.length ? 10 : 0, width:'100%', padding:'10px', background:'transparent', border:`1.5px dashed ${PN.BORDER}`, borderRadius:8, color: PN.MUTED, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, justifyContent:'center'}}>+ Aggiungi gruppo di varianti</button>
    </div>
  );
}

const INGREDIENT_LIBRARY = ['Pomodoro San Marzano','Mozzarella di bufala','Basilico','Olio EVO','Aglio','Cipolla rossa','Guanciale','Pecorino DOP','Parmigiano 24 mesi','Burro','Tonnarelli','Spaghetti','Rigatoni','Pepe nero','Pepe rosa','Salvia','Rosmarino','Pinoli','Vino bianco','Limone'];


// ─── DishEditModal: modal completo (versione onboarding) ──────────────────────
// Titolo di gruppo e card interna del modal piatto: un solo trattamento per
// tutti i blocchi, invece di occhielli grigi e sottotitoli scuri mescolati.
function DishSectionTitle({children}) {
  return (
    <div style={{
      fontSize: 15, fontWeight: 700, color: PN.TEXT,
      letterSpacing: '-0.01em', marginBottom: 2,
    }}>{children}</div>
  );
}

function DishBlock({children, style}) {
  return (
    <div style={{
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER_SOFT}`,
      borderRadius: 12,
      padding: 14,
      ...style,
    }}>{children}</div>
  );
}

// Flag booleano del piatto (prodotto finito / surgelati): stessa forma per
// entrambi, con tooltip opzionale ancorato via portale.
function DishFlag({checked, onChange, label, accent, accentBg, accentBorder, info}) {
  return (
    <label onClick={onChange} style={{
      display:'inline-flex', alignItems:'center', gap:8,
      cursor:'pointer', userSelect:'none',
      padding:'9px 13px', borderRadius:10,
      background: checked ? accentBg : PN.WHITE,
      border:`1px solid ${checked ? accentBorder : PN.BORDER}`,
      transition:'background 150ms ease-out, border-color 150ms ease-out',
    }}>
      <div style={{
        width:16, height:16, borderRadius:4, flexShrink:0,
        border:`1.5px solid ${checked ? accent : '#94A3B8'}`,
        background: checked ? accent : '#fff',
        display:'grid', placeItems:'center',
      }}>
        {checked && <span style={{color:'#fff', fontSize:12, lineHeight:1}}>✓</span>}
      </div>
      <span style={{fontSize:14.5, color: checked ? accent : PN.TEXT, fontWeight:600, whiteSpace:'nowrap'}}>
        {label}
      </span>

      {info && (
        <span
          onClick={e => {
            e.stopPropagation();
            const r = e.currentTarget.getBoundingClientRect();
            info.setOpen(o => o ? null : {x: r.right + 10, y: r.top + r.height / 2});
          }}
          role="button" tabIndex={0} aria-expanded={!!info.open}
          aria-label={`Cos'è: ${label}`}
          style={{display:'inline-flex', flexShrink:0}}
        >
          <span style={{
            width:16, height:16, borderRadius:'50%',
            background: info.open ? '#475569' : '#E2E8F0',
            color: info.open ? '#fff' : '#64748B',
            fontSize:12, fontWeight:700, display:'inline-grid', placeItems:'center', cursor:'pointer',
            transition:'background 150ms ease-out',
          }}>i</span>
        </span>
      )}

      {info && info.open && ReactDOM.createPortal(
        <span onClick={e => e.stopPropagation()} style={{
          position:'fixed', left: info.open.x, top: info.open.y, transform:'translateY(-50%)',
          width:230, background:'#1E293B', color:'#F8FAFC', fontSize:13.5, lineHeight:1.5,
          padding:'9px 11px', borderRadius:9, boxShadow:'0 8px 24px rgba(15,17,21,0.22)',
          zIndex:1200,
        }}>
          <span style={{
            position:'absolute', left:-4, top:'50%', marginTop:-4,
            width:8, height:8, background:'#1E293B', transform:'rotate(45deg)',
          }}/>
          {info.text}
        </span>,
        document.body
      )}
    </label>
  );
}

function DishEditModal({ dish, dishId, isNew, catName, fromLibrary, onClose, onSave, onDelete, currentPrice }) {
  const isEdit = !!dish;
  const [name, setName] = React.useState(dish?.name || '');
  const [desc, setDesc] = React.useState(dish?.desc || '');
  const [cat, setCat] = React.useState(dish?.cat || (catName !== 'Bevande' && CAT_ICON[catName] ? catName : 'Antipasti'));
  const [allergens, setAllergens] = React.useState(dish?.allergens || []);
  const [photos, setPhotos] = React.useState(dish?.photos || []);
  const [openSection, setOpenSection] = React.useState(null);
  const [tipOpen, setTipOpen] = React.useState(null);       // tooltip "Prodotto finito": {x,y} o null

  // Il tooltip si chiude al primo click altrove: aperto, restava sopra a
  // qualsiasi cosa (anche all'anteprima foto) finche' non si ricliccava l'icona.
  React.useEffect(() => {
    if (!tipOpen) return;
    const chiudi = () => setTipOpen(null);
    document.addEventListener('click', chiudi);
    return () => document.removeEventListener('click', chiudi);
  }, [tipOpen]);
  const [preview, setPreview] = React.useState(null);       // indice foto in anteprima
  const [initialPrice, setInitialPrice] = React.useState(
    currentPrice !== undefined ? String(currentPrice.toFixed(2)).replace('.', ',') : ''
  );
  const [foodCost, setFoodCost] = React.useState(dish?.foodCost ? dish.foodCost.toFixed(2) : '');
  const [noPrep, setNoPrep] = React.useState(dish?.noPrep || false);
  const [hasFrozen, setHasFrozen] = React.useState(dish?.hasFrozen || false);
  const [recipeSteps, setRecipeSteps] = React.useState(dish?.recipeSteps || ['', '', '']);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [ingredients, setIngredients] = React.useState(dish?.ingredients || [
    { name:'Tonnarelli', removable:false, allergens:['glutine'] },
    { name:'Pecorino DOP', removable:false, allergens:['latte'] },
    { name:'Pepe nero', removable:true, allergens:[] },
  ]);
  const [extras, setExtras] = React.useState(dish?.extras || []);
  const [variants, setVariants] = React.useState(dish?.variants || []);
  // dietaryTags: array di { name, surcharge } — surcharge opzionale (string per editing)
  const [dietaryTags, setDietaryTags] = React.useState(() => {
    const init = dish?.dietaryTags || [];
    return init.map(t => typeof t === 'string' ? { name: t, surcharge: '' } : t);
  });

  // Allergeni derivati dagli ingredienti — uniti agli allergeni manuali del piatto
  const ingredientAllergens = React.useMemo(() => {
    const s = new Set();
    ingredients.forEach(ing => (ing.allergens || []).forEach(a => s.add(a)));
    return s;
  }, [ingredients]);
  const effectiveAllergens = React.useMemo(() => {
    return Array.from(new Set([...allergens, ...ingredientAllergens]));
  }, [allergens, ingredientAllergens]);
  // Contati per il sottotitolo della sezione: chiusa, deve comunque dire
  // quanti allergeni sono indicati.
  const allergenCount = effectiveAllergens.length;

  const toggleAllergen = id => {
    // Se l'allergene proviene da un ingrediente, non si può togliere manualmente — è derivato
    if (ingredientAllergens.has(id) && !allergens.includes(id)) return;
    setAllergens(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  };
  const toggleTag = t => setDietaryTags(s => {
    const idx = s.findIndex(x => x.name === t);
    if (idx >= 0) return s.filter(x => x.name !== t);
    return [...s, { name: t, surcharge: '' }];
  });
  const setTagSurcharge = (t, val) => setDietaryTags(s => s.map(x => x.name === t ? { ...x, surcharge: val } : x));

  const handleAiFill = () => {
    if (!name.trim()) { alert('Scrivi prima il nome del piatto'); return; }
    setAiLoading(true);
    setTimeout(() => {
      if (!desc) setDesc('Ricetta tradizionale preparata con ingredienti selezionati, cotta al momento.');
      if (allergens.length === 0) setAllergens(['glutine','latte']);
      setRecipeSteps(['Preparare gli ingredienti.', 'Cuocere secondo la ricetta tradizionale.', 'Impiattare e servire.']);
      setAiLoading(false);
    }, 1200);
  };

  const handleSave = () => {
    if (!name.trim()) { alert('Inserisci il nome del piatto'); return; }
    const out = {
      id: dish?.id,
      name: name.trim(),
      desc: desc.trim(),
      cat,
      allergens: effectiveAllergens,
      foodCost: foodCost ? parseFloat(foodCost.replace(',','.')) : null,
      noPrep, hasFrozen, recipeSteps,
      ingredients, extras, variants, dietaryTags,
    };
    if (!fromLibrary && catName) {
      out._initialPrice = parseFloat(String(initialPrice).replace(',','.')) || 0;
    }
    onSave(out);
  };

  const ALL_CATS = ['Antipasti','Primi','Secondi','Contorni','Dolci','Bevande'];

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.50)', zIndex: 1000,
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      display:'grid', placeItems:'center', padding: 24,
    }}>
      {/* 940px su due colonne invece di 560 in colonna singola: le sette sezioni
          del piatto in una colonna sola facevano un modal stretto e lunghissimo,
          da scorrere tutto anche solo per cambiare il prezzo. */}
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG, borderRadius: 20, width: 940, maxWidth:'100%',
        /* 82vh e non 90: il frame del gestionale ha uno zoom > 1 su schermi
           alti, e i vh non lo considerano — a 90 il modal arrivava a filo del
           bordo del viewport. */
        maxHeight: '82vh', display:'flex', flexDirection:'column',
        overflow: 'hidden',
        boxShadow:'0 32px 80px -24px rgba(15,17,21,0.45), 0 2px 8px rgba(15,17,21,0.10)',
      }}>
        {/* Header */}
        <div style={{padding:'18px 24px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:14}}>
          {/* Badge: da' un punto di appoggio al titolo, che da solo galleggiava */}
          <div style={{
            width:40, height:40, borderRadius:11, flexShrink:0,
            background:'linear-gradient(135deg, #FFE3DF, #FFF1E8)',
            display:'grid', placeItems:'center', color: PN.PINK_DARK,
          }}><PnI.Plate size={19}/></div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13.5, color:PN.MUTED, textTransform:'uppercase', letterSpacing:0.6, fontWeight:700, marginBottom:2}}>
              {fromLibrary ? 'Libreria piatti' : (catName || cat)}
            </div>
            <div style={{fontSize:20, fontWeight:700, color:PN.TEXT, lineHeight:1.2, letterSpacing:'-0.01em',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {name.trim() || (isEdit ? 'Modifica piatto' : 'Nuovo piatto')}
            </div>
          </div>
          {/* Senza un nome l'AI non ha su cosa lavorare: il bottone resta
              visibile ma spento, cosi' si capisce che c'e' e cosa lo abilita. */}
          <button onClick={handleAiFill} disabled={aiLoading || !name.trim()}
            title={!name.trim() ? 'Scrivi prima il nome del piatto' : undefined}
            style={{
            flexShrink:0, height:36, padding:'0 14px',
            background: !name.trim() ? '#EEF0F3' : (aiLoading ? '#F5F3FF' : 'linear-gradient(135deg,#7C3AED,#6D28D9)'),
            color: !name.trim() ? PN.MUTED_LIGHT || '#9AA0A6' : (aiLoading ? '#7C3AED' : '#fff'),
            border: !name.trim() ? '1.5px solid #E3E6EA' : (aiLoading ? '1.5px solid #C4B5FD' : 'none'),
            borderRadius:8, cursor: (aiLoading || !name.trim()) ? 'default' : 'pointer',
            display:'inline-flex', alignItems:'center', gap:6,
            fontSize:15, fontWeight:700, fontFamily:'inherit',
            transition:'background 150ms ease-out, color 150ms ease-out',
          }}>
            {aiLoading
              ? <><span>⏳</span> Compilando…</>
              : <><BuAiSparkle size={13} color={!name.trim() ? '#9AA0A6' : '#fff'}/>Auto-compila</>}
          </button>
          <button onClick={onClose} style={{
            flexShrink:0, width:30, height:30, borderRadius:7, border:'none',
            background:'#F4F5F7', cursor:'pointer', fontSize:18, color:PN.MUTED,
          }}>✕</button>
        </div>

        {/* Body — l'identità del piatto è una fascia orizzontale in cima, il
            resto sono sezioni contratte: si apre solo ciò che serve, invece di
            scorrere sette blocchi sempre aperti. */}
        <div style={{padding:'20px 24px 24px', overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:18}}>

          {/* ── FASCIA IDENTITÀ ─────────────────────────────────────── */}
          <div style={{display:'flex', flexDirection:'column', gap:12}}>

            {/* riga 1 — nome, categoria, prezzo */}
            <div style={{display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap'}}>
              <div style={{flex:'1 1 320px', minWidth:0}}>
                <ImpField label="Nome del piatto">
                  <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="es. Spaghetti alle vongole" style={{
                    width:'100%', padding:'12px 14px', border:`1.5px solid ${PN.BORDER}`, borderRadius:10,
                    fontSize:19, fontWeight:600, fontFamily:'inherit', outline:'none', background:PN.WHITE,
                    letterSpacing:'-0.01em',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = PN.PINK}
                  onBlur={e => e.currentTarget.style.borderColor = PN.BORDER}
                  />
                </ImpField>
              </div>
              {!fromLibrary && (
                <ImpField label="Categoria" style={{flex:'0 0 160px'}}>
                  <select value={cat} onChange={e=>setCat(e.target.value)} style={{
                    width:'100%', padding:'12px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:10, fontSize:16, fontFamily:'inherit', outline:'none', background:PN.WHITE,
                  }}>
                    {ALL_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </ImpField>
              )}
              {!fromLibrary && catName && (
                <ImpField label={`Prezzo (€, IVA escl.)`} style={{flex:'0 0 130px'}}>
                  <input value={initialPrice} onChange={e=>setInitialPrice(e.target.value)} placeholder="0,00" style={{
                    width:'100%', padding:'12px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:10, fontSize:16, fontFamily:'inherit', outline:'none',
                  }}/>
                </ImpField>
              )}
              <ImpField label="Food cost" style={{flex:'0 0 110px'}}>
                <input value={foodCost} onChange={e=>setFoodCost(e.target.value)} placeholder="es. 4,50" style={{
                  width:'100%', padding:'12px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:10, fontSize:16, fontFamily:'inherit', outline:'none',
                }}/>
              </ImpField>
            </div>

            {/* riga 2 — descrizione a sinistra, le 3 foto a destra */}
            <div style={{display:'flex', gap:14, alignItems:'flex-start', flexWrap:'wrap'}}>
              <div style={{flex:'1 1 340px', minWidth:0}}>
                <ImpField label="Descrizione breve">
                  <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="Ingredienti principali, breve descrizione…" style={{
                    width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:10, fontSize:16, fontFamily:'inherit', outline:'none', resize:'none', lineHeight:1.5, background:PN.WHITE,
                  }}/>
                </ImpField>
              </div>
              <div style={{flex:'0 0 300px'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
                  <span style={{fontSize:15, fontWeight:600, color:PN.TEXT}}>Foto</span>
                  <span style={{fontSize:14, color:PN.MUTED}}>{photos.length}/3</span>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
                  {[0, 1, 2].map(i => {
                    const piena = i < photos.length;
                    const prossimoLibero = i === photos.length;
                    return piena ? (
                      <div key={i} style={{position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'4/3', background: PHOTO_MOCK_BG[i % PHOTO_MOCK_BG.length]}}>
                        <button onClick={() => setPreview(i)} aria-label={`Apri anteprima foto ${i + 1}`} style={{
                          position:'absolute', inset:0, width:'100%', height:'100%',
                          background:'transparent', border:'none', cursor:'zoom-in', padding:0,
                          transition:'background 150ms ease-out',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,17,21,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        />
                        <button onClick={() => setPhotos(ps => ps.filter((_,idx)=>idx!==i))} aria-label={`Rimuovi foto ${i + 1}`} style={{
                          position:'absolute', top:5, right:5, width:20, height:20,
                          borderRadius:'50%', background:'rgba(0,0,0,0.55)', border:'none',
                          color:'#fff', fontSize:12, cursor:'pointer', display:'grid', placeItems:'center',
                        }}>✕</button>
                      </div>
                    ) : (
                      <button key={i}
                        onClick={() => prossimoLibero && setPhotos(ps => ps.length < 3 ? [...ps, true] : ps)}
                        disabled={!prossimoLibero} aria-label="Aggiungi foto"
                        style={{
                          aspectRatio:'4/3', borderRadius:10, border:`1.5px dashed ${PN.BORDER}`,
                          background:'#FAFBFC', cursor: prossimoLibero ? 'pointer' : 'default',
                          opacity: prossimoLibero ? 1 : 0.55,
                          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, fontFamily:'inherit',
                          transition:'border-color 150ms ease-out, background 150ms ease-out',
                        }}
                        onMouseEnter={e=>{ if (prossimoLibero) { e.currentTarget.style.borderColor=PN.MUTED; e.currentTarget.style.background='#F4F5F7'; } }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor=PN.BORDER; e.currentTarget.style.background='#FAFBFC'; }}
                      >
                        <span style={{fontSize:22, color:PN.MUTED, lineHeight:1}}>+</span>
                        <span style={{fontSize:12.5, color:PN.MUTED, fontWeight:600}}>JPG / PNG</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* riga 3 — i due flag obbligatori, sempre in chiaro e mai dentro un
                collassabile: "surgelati" è una dicitura di legge (D.Lgs. 109/92)
                e nasconderla dietro un accordion la fa dimenticare. */}
            <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
              <DishFlag
                checked={noPrep} onChange={() => setNoPrep(v => !v)}
                label="Prodotto finito" accent="#475569" accentBg="#F1F5F9" accentBorder="#94A3B8"
                info={{
                  open: tipOpen, setOpen: setTipOpen,
                  text: "Es. acqua, vino, birra in lattina. IVA 22% sull'asporto anziché 10%.",
                }}
              />
              <DishFlag
                checked={hasFrozen} onChange={() => setHasFrozen(v => !v)}
                label="Contiene alimenti surgelati" accent="#2563EB" accentBg="#EFF6FF" accentBorder="#60A5FA"
              />
            </div>

            {fromLibrary && (
              <div style={{padding:'9px 12px', borderRadius:9, background:'#F8FAFC', border:`1px solid ${PN.BORDER_SOFT}`, fontSize:15.5, color:PN.MUTED, lineHeight:1.5}}>
                💡 Prezzo e disponibilità si impostano nel singolo menù dove il piatto è inserito.
              </div>
            )}
          </div>

          {/* ── SEZIONI CONTRATTE ───────────────────────────────────── */}
          <div>
            <CollapseSection
              title="Allergeni"
              subtitle={allergenCount === 0 ? 'Nessuno indicato' : `${allergenCount} indicati`}
              icon="!"
              open={openSection === 'allergeni'}
              onToggle={() => setOpenSection(s => s === 'allergeni' ? null : 'allergeni')}
            >
              {ingredientAllergens.size > 0 && (
                <div style={{fontSize:14, color:PN.MUTED, fontStyle:'italic', marginBottom:8}}>
                  <span style={{color:PN.PINK_DARK, fontWeight:700, fontStyle:'normal'}}>•</span> = derivati dagli ingredienti
                </div>
              )}
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {ALLERGENS.map(a => {
                  const fromIng = ingredientAllergens.has(a.id);
                  const fromManual = allergens.includes(a.id);
                  const on = fromIng || fromManual;
                  return (
                    <button key={a.id} onClick={() => toggleAllergen(a.id)} disabled={fromIng && !fromManual} title={fromIng && !fromManual ? 'Derivato dagli ingredienti' : ''} style={{
                      display:'inline-flex', alignItems:'center', gap:5,
                      padding:'6px 11px', borderRadius:999,
                      border: on ? `1.5px solid ${PN.PINK}` : `1px solid ${PN.BORDER}`,
                      background: on ? PN.PINK_SOFT : '#FAFBFC',
                      color: on ? PN.PINK_DARK : PN.MUTED,
                      fontSize:15, fontWeight:600, cursor:(fromIng && !fromManual) ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                      transition:'background 150ms ease-out, border-color 150ms ease-out',
                    }}>
                      <AllergenIcon id={a.id} size={14}/>
                      {a.name}
                      {fromIng && <span style={{color:PN.PINK_DARK, fontSize:14}}>•</span>}
                    </button>
                  );
                })}
              </div>
            </CollapseSection>

            <CollapseSection
              title="Ingredienti"
              subtitle={`${ingredients.length} ingredienti · ${ingredients.filter(i=>i.removable).length} rimuovibili`}
              icon="•"
              open={openSection === 'ingredients'}
              onToggle={() => setOpenSection(s => s === 'ingredients' ? null : 'ingredients')}
            >
              <div style={{fontSize:15, color:PN.MUTED, marginBottom:10, lineHeight:1.45}}>
                Spunta gli ingredienti che il cliente può <strong style={{color:PN.TEXT}}>togliere dal piatto</strong>.
              </div>
              <IngredientList ingredients={ingredients} setIngredients={setIngredients}/>
            </CollapseSection>

            <CollapseSection
              title="Valori nutrizionali"
              subtitle="Mostrati sul menù del cliente"
              icon="◇"
              open={openSection === 'nutrition'}
              onToggle={() => setOpenSection(s => s === 'nutrition' ? null : 'nutrition')}
            >
              <NutritionFields/>
            </CollapseSection>

            {/* Avanzate — non e' una sezione come le altre ma il contenitore di
                tutto cio' che la maggior parte dei piatti non usa: niente card,
                solo una riga di testo con un separatore. */}
            <div style={{marginTop:6}}>
              <div style={{display:'flex', alignItems:'center', gap:12, margin:'6px 0 0'}}>
                <div style={{flex:1, height:1, background:PN.BORDER_SOFT}}/>
                <button
                  onClick={() => setOpenSection(s => s === 'avanzate' ? null : 'avanzate')}
                  aria-expanded={openSection === 'avanzate'}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:7,
                    background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit',
                    padding:'4px 6px', borderRadius:7,
                    fontSize:15, fontWeight:600, color: openSection === 'avanzate' ? PN.TEXT : PN.MUTED,
                    transition:'color 150ms ease-out',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = PN.TEXT}
                  onMouseLeave={e => { if (openSection !== 'avanzate') e.currentTarget.style.color = PN.MUTED; }}
                >
                  {openSection === 'avanzate' ? 'Nascondi opzioni avanzate' : 'Opzioni avanzate'}
                  <span style={{
                    display:'inline-flex', fontSize:11,
                    transform: openSection === 'avanzate' ? 'rotate(180deg)' : 'none',
                    transition:'transform 200ms ease-out',
                  }}>▼</span>
                </button>
                <div style={{flex:1, height:1, background:PN.BORDER_SOFT}}/>
              </div>

              {openSection === 'avanzate' && (
              <div style={{display:'flex', flexDirection:'column', gap:20, paddingTop:16}}>

                {/* Versioni */}
                <div>
                  <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT, marginBottom:8}}>Disponibile anche in versione</div>
                  <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom: dietaryTags.length > 0 ? 10 : 0}}>
                    {['Vegana','Senza glutine','Vegetariana','Senza lattosio','Crudo','Bio','Halal','Kosher','Parve'].map(t => {
                      const on = dietaryTags.some(x => x.name === t);
                      return (
                        <button key={t} onClick={() => toggleTag(t)} style={{
                          padding:'6px 11px', borderRadius:999, fontSize:15, fontWeight:600,
                          border: on ? `1.5px solid ${PN.PINK}` : `1px solid ${PN.BORDER}`,
                          background: on ? PN.PINK_SOFT : '#FAFBFC',
                          color: on ? PN.PINK_DARK : PN.MUTED,
                          cursor:'pointer', fontFamily:'inherit',
                          transition:'background 150ms ease-out, border-color 150ms ease-out',
                        }}>{t}</button>
                      );
                    })}
                  </div>
                  {dietaryTags.length > 0 && (
                    <div style={{background:'#F8FAFC', borderRadius:10, padding:'10px 12px', border:`1px solid ${PN.BORDER_SOFT}`}}>
                      <div style={{fontSize:13, fontWeight:700, color:PN.MUTED, letterSpacing:0.3, textTransform:'uppercase', marginBottom:8}}>Sovrapprezzo per versione (opzionale)</div>
                      <div style={{display:'flex', flexDirection:'column', gap:6}}>
                        {dietaryTags.map(t => (
                          <div key={t.name} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'center', padding:'6px 10px', background:'#fff', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius:8}}>
                            <span style={{fontSize:14.5, color:PN.TEXT, fontWeight:600}}>{t.name}</span>
                            <div style={{display:'flex', alignItems:'center', gap:5}}>
                              <span style={{fontSize:14, color:PN.MUTED, fontWeight:600}}>+€</span>
                              <input value={t.surcharge} onChange={e => setTagSurcharge(t.name, e.target.value.replace(/[^0-9,.]/g,''))} placeholder="0,00"
                                style={{width:64, padding:'5px 8px', border:`1px solid ${PN.BORDER}`, borderRadius:7, fontSize:15.5, fontFamily:'inherit', textAlign:'right', outline:'none'}}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Aggiunte a pagamento */}
                <div>
                  <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT, marginBottom:4}}>Aggiunte a pagamento</div>
                  <div style={{fontSize:15, color:PN.MUTED, marginBottom:10, lineHeight:1.45}}>
                    Extra che il cliente può aggiungere (es. tartufo, doppia mozzarella).
                    Con <strong style={{color:PN.TEXT}}>max</strong> limiti quante volte può ripeterla.
                  </div>
                  <ExtrasList extras={extras} setExtras={setExtras}/>
                </div>

                {/* Varianti */}
                <div>
                  <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT, marginBottom:4}}>Varianti</div>
                  <div style={{fontSize:15, color:PN.MUTED, marginBottom:10, lineHeight:1.45}}>
                    Scelte tra cui il cliente seleziona un'opzione (es. <em>Cottura: al sangue / ben cotta</em>).
                  </div>
                  <VariantsList variants={variants} setVariants={setVariants}/>
                </div>

                {/* Ricetta */}
                <div style={{
                  opacity: noPrep ? 0.45 : 1,
                  pointerEvents: noPrep ? 'none' : 'auto',
                  transition: 'opacity 0.15s',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                    <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT}}>Ricetta — procedimento</div>
                    {noPrep && (
                      <span style={{fontSize:13.5, color:PN.MUTED, fontStyle:'italic', fontWeight:500}}>
                        Non applicabile per prodotti finiti
                      </span>
                    )}
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:5}}>
                    {recipeSteps.map((step, i) => (
                      <div key={i} style={{display:'flex', alignItems:'flex-start', gap:8}}>
                        <span style={{
                          flexShrink:0, width:22, height:22, borderRadius:'50%',
                          background:'#F1F5F9', color:'#64748B', fontSize:14.5, fontWeight:700,
                          display:'grid', placeItems:'center', marginTop:8,
                        }}>{i+1}</span>
                        <textarea value={step} disabled={noPrep}
                          onChange={e => setRecipeSteps(s => s.map((x, idx) => idx===i ? e.target.value : x))}
                          onKeyDown={e => {
                            if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); setRecipeSteps(s => [...s.slice(0,i+1),'', ...s.slice(i+1)]); setTimeout(() => { const el = document.querySelectorAll('.recipe-step'); if(el[i+1]) el[i+1].focus(); },0); }
                            if (e.key==='Backspace' && !step && recipeSteps.length>1) { e.preventDefault(); setRecipeSteps(s => s.filter((_,idx)=>idx!==i)); setTimeout(() => { const el = document.querySelectorAll('.recipe-step'); if(el[i-1]) el[i-1].focus(); },0); }
                          }}
                          placeholder={`Passo ${i+1}…`} rows={1} className="recipe-step"
                          style={{flex:1, padding:'7px 11px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:16, fontFamily:'inherit', outline:'none', resize:'none', lineHeight:1.5, overflow:'hidden', background: step ? PN.WHITE : '#FAFBFC'}}
                          onInput={e => { e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px'; }}
                        />
                        {recipeSteps.length > 1 && (
                          <button onClick={() => setRecipeSteps(s => s.filter((_,idx)=>idx!==i))} disabled={noPrep}
                            style={{flexShrink:0, width:22, height:22, marginTop:8, background:'transparent', border:'none', cursor: noPrep ? 'default' : 'pointer', color:PN.MUTED, fontSize:16, display:'grid', placeItems:'center', borderRadius:4}}
                            onMouseEnter={e=> { if (!noPrep) e.currentTarget.style.color=PN.RED; }}
                            onMouseLeave={e=> { if (!noPrep) e.currentTarget.style.color=PN.MUTED; }}
                          >✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setRecipeSteps(s => [...s,''])} disabled={noPrep} style={{
                    marginTop:8, display:'inline-flex', alignItems:'center', gap:5,
                    padding:'5px 10px', borderRadius:7, border:`1px dashed ${PN.BORDER}`,
                    background:'transparent', color:PN.MUTED, fontSize:15, fontWeight:600, cursor: noPrep ? 'default' : 'pointer', fontFamily:'inherit',
                  }}
                  onMouseEnter={e=>{ if (!noPrep) { e.currentTarget.style.borderColor=PN.TEXT; e.currentTarget.style.color=PN.TEXT; } }}
                  onMouseLeave={e=>{ if (!noPrep) { e.currentTarget.style.borderColor=PN.BORDER; e.currentTarget.style.color=PN.MUTED; } }}
                  >+ Aggiungi passo</button>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Anteprima foto — sopra al modal, si chiude col click sullo sfondo */}
        {preview !== null && (
          <div onClick={() => setPreview(null)} style={{
            position:'fixed', inset:0, zIndex:1100,
            background:'rgba(15,17,21,0.72)',
            backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
            display:'grid', placeItems:'center', padding:40,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width:'min(560px, 100%)', aspectRatio:'4/3', borderRadius:16,
              background: PHOTO_MOCK_BG[preview % PHOTO_MOCK_BG.length],
              boxShadow:'0 32px 80px -20px rgba(0,0,0,0.6)', position:'relative',
            }}>
              <button onClick={() => setPreview(null)} aria-label="Chiudi anteprima" style={{
                position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%',
                background:'rgba(15,17,21,0.55)', border:'none', color:'#fff',
                fontSize:16, cursor:'pointer', display:'grid', placeItems:'center',
              }}>✕</button>
              <div style={{
                position:'absolute', left:0, right:0, bottom:0, padding:'10px 14px',
                background:'linear-gradient(to top, rgba(15,17,21,0.55), transparent)',
                color:'#fff', fontSize:14, fontWeight:600,
                borderBottomLeftRadius:16, borderBottomRightRadius:16,
              }}>
                Foto {preview + 1} di {photos.length}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{padding:'14px 24px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap:8, justifyContent:'space-between', alignItems:'center', background:'#FAFBFC'}}>
          <div>
            {isEdit && onDelete && (
              <button onClick={() => { if (confirm('Eliminare questo piatto dalla libreria? Sarà rimosso anche da tutti i menù.')) onDelete(); }} style={{
                background:'transparent', border:'none', color:PN.RED, fontSize:14.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:5, padding:'6px 0',
              }}>
                <PnI.Trash size={13}/> Elimina piatto
              </button>
            )}
          </div>
          <div style={{display:'flex', gap:8}}>
            <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
            <ImpButton variant="primary" onClick={handleSave}>{isEdit ? 'Salva modifiche' : 'Salva piatto'}</ImpButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ingredienti smart ────────────────────────────────────────────────────────

const INGREDIENTS_INIT = [
  { name: 'Pomodoro',     usedInDishes: ['Bruschetta al pomodoro','Amatriciana','Caprese','Pizza Margherita','Penne arrabbiata','Insalata mista','Tagliata di manzo','Bresaola e rucola'], allergens: [] },
  { name: 'Mozzarella',   usedInDishes: ['Caprese','Pizza Margherita','Burrata con crudo','Parmigiana','Insalata caprese','Pizza diavola'], allergens: ['latte'] },
  { name: 'Basilico',     usedInDishes: ['Bruschetta al pomodoro','Caprese','Pizza Margherita','Pesto alla genovese','Pomodoro e basilico'], allergens: [] },
  { name: 'Guanciale',    usedInDishes: ['Carbonara','Amatriciana','Gricia'], allergens: [] },
  { name: 'Pecorino',     usedInDishes: ['Carbonara','Cacio e Pepe','Amatriciana','Gricia'], allergens: ['latte'] },
  { name: 'Uova',         usedInDishes: ['Carbonara','Tiramisù della casa','Frittata','Pasta all\'uovo','Zabaione','Crème brûlée','Maionese'], allergens: ['uova'] },
  { name: 'Spaghetti',    usedInDishes: ['Carbonara','Spaghetti al pomodoro','Aglio e olio','Vongole'], allergens: ['glutine'] },
  { name: 'Olio EVO',     usedInDishes: ['Bruschetta al pomodoro','Insalata mista','Caprese','Pesto','Aglio e olio','Pinzimonio','Tagliata','Branzino','Verdure grigliate','Bruschetta'], allergens: [] },
  { name: 'Sale',         usedInDishes: ['(usato in molti piatti)'], allergens: [] },
  { name: 'Burro',        usedInDishes: ['Tortellini in brodo','Risotto','Tagliata','Patate al forno','Tiramisù','Crema pasticcera'], allergens: ['latte'] },
  { name: 'Farina 00',    usedInDishes: ['Pizza Margherita','Pasta fresca','Tiramisù','Crema pasticcera','Pane casereccio','Tagliatelle','Lasagne','Pasta all\'uovo','Crostata'], allergens: ['glutine'] },
  { name: 'Vino bianco',  usedInDishes: ['Risotto al vino bianco','Vongole','Branzino al forno','Cozze alla marinara'], allergens: ['solfiti'] },
];

// Libreria condivisa: viene letta sia da MCIngredienti sia da IngredientList nel modal piatto.
// In una vera app sarebbe nel data layer; qui un singleton su window.
if (!window.__ingredientDB) {
  window.__ingredientDB = INGREDIENTS_INIT.map(i => ({ ...i, allergens: [...i.allergens] }));
  window.__ingredientDBSubs = new Set();
  window.subscribeIngredientDB = (fn) => { window.__ingredientDBSubs.add(fn); return () => window.__ingredientDBSubs.delete(fn); };
  window.getIngredientDB = () => window.__ingredientDB;
  window.upsertIngredient = (name, allergens) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const idx = window.__ingredientDB.findIndex(i => i.name.toLowerCase() === lower);
    if (idx >= 0) {
      // Solo se allergens passati ed ingrediente presente: aggiorniamo (merge non disruptivo)
      if (allergens) {
        window.__ingredientDB[idx] = { ...window.__ingredientDB[idx], allergens: [...allergens] };
      }
    } else {
      window.__ingredientDB = [...window.__ingredientDB, { name: trimmed, allergens: allergens ? [...allergens] : [], usedInDishes: [] }];
    }
    window.__ingredientDBSubs.forEach(fn => fn());
  };
  window.findIngredient = (name) => window.__ingredientDB.find(i => i.name.toLowerCase() === name.trim().toLowerCase());

  // Allergeni di un ingrediente che la libreria non conosce alla lettera.
  // "Mozzarella di bufala" non è in libreria, ma contiene "Mozzarella": eredita
  // il suo latte, invece di nascere senza allergeni.
  // Il confine di parola è quello che tiene onesto il match: senza, "Insalata"
  // aggancerebbe "Sale". Nel dubbio non deduce — un allergene mancante si vede,
  // uno inventato no.
  window.inferAllergens = (name) => {
    const norm = s => s.toLowerCase().trim().replace(/\s+/g, ' ');
    const target = norm(name);
    if (!target) return [];
    const exact = window.__ingredientDB.find(i => norm(i.name) === target);
    if (exact) return [...(exact.allergens || [])];
    const out = new Set();
    window.__ingredientDB.forEach(i => {
      const base = norm(i.name);
      if (!base || !(i.allergens || []).length) return;
      const esc = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`(^|\\s)${esc}(\\s|$)`).test(target)) {
        i.allergens.forEach(a => out.add(a));
      }
    });
    return [...out];
  };
}

function MCIngredienti() {
  const [list, setList] = React.useState(() => window.getIngredientDB());
  React.useEffect(() => window.subscribeIngredientDB(() => setList([...window.getIngredientDB()])), []);
  const [search, setSearch] = React.useState('');
  const [allergenFilter, setAllergenFilter] = React.useState([]); // ids
  const [allergenFilterOpen, setAllergenFilterOpen] = React.useState(false);
  const [popoverIdx, setPopoverIdx] = React.useState(null);   // riga su cui è aperto popover "in uso"
  const [editAllergensIdx, setEditAllergensIdx] = React.useState(null);
  const [allergens, setAllergensState] = React.useState(() => list.map(i => i.allergens));

  // form aggiunta inline
  const [adding, setAdding] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newAllergens, setNewAllergens] = React.useState([]);
  const [newAllergensOpen, setNewAllergensOpen] = React.useState(false);
  const newInputRef = React.useRef(null);

  React.useEffect(() => {
    if (adding && newInputRef.current) newInputRef.current.focus();
  }, [adding]);

  const startAdd = () => {
    setAdding(true);
    setNewName('');
    setNewAllergens([]);
  };
  const cancelAdd = () => {
    setAdding(false);
    setNewAllergensOpen(false);
  };
  const confirmAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const newIng = { name, usedInDishes: [], allergens: newAllergens };
    setList(prev => [newIng, ...prev]);
    setAllergensState(prev => [newAllergens, ...prev]);
    setAdding(false);
    setNewName('');
    setNewAllergens([]);
    setNewAllergensOpen(false);
  };
  const toggleNewAllergen = (id) => {
    setNewAllergens(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // close popovers when clicking outside
  React.useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest('[data-ing-popover]') && !e.target.closest('[data-ing-trigger]')) {
        setPopoverIdx(null);
        setEditAllergensIdx(null);
      }
      if (!e.target.closest('[data-allergen-filter]')) setAllergenFilterOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggleFilterAllergen = (id) => {
    setAllergenFilter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleIngredientAllergen = (idx, alId) => {
    setAllergensState(prev => prev.map((arr, i) => i !== idx ? arr : (arr.includes(alId) ? arr.filter(x => x !== alId) : [...arr, alId])));
  };

  let visible = list.map((ing, idx) => ({ ...ing, allergens: allergens[idx], _origIdx: idx }))
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  if (allergenFilter.length) {
    visible = visible.filter(i => allergenFilter.some(a => i.allergens.includes(a)));
  }

  return (
    <ImpCard
      aurora
      title="Ingredienti"
      sub={<span><strong style={{color: PN.TEXT, fontWeight: 700}}>{list.length} ingredienti</strong> · popolati automaticamente dai piatti</span>}
      action={<ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={startAdd}>Aggiungi ingrediente</ImpButton>}
    >
      {/* Toolbar: search + filtro allergeni */}
      <div style={{display:'flex', gap: 10, marginBottom: 14, alignItems:'stretch'}}>
        <div style={{position:'relative', flex: 1}}>
          <span style={{
            position:'absolute', left: 12, top: '50%', transform:'translateY(-50%)',
            color: PN.MUTED, display: 'flex', alignItems: 'center',
          }}><PnI.Search size={14} color={PN.MUTED}/></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca ingrediente…" style={{
            width:'100%', padding:'10px 12px 10px 38px',
            border:`1px solid ${PN.BORDER}`, borderRadius:9,
            fontSize:15.5, fontFamily:'inherit', outline:'none',
          }}/>
        </div>

        <div style={{position:'relative'}} data-allergen-filter>
          <button onClick={() => setAllergenFilterOpen(v => !v)} style={{
            padding: '10px 14px', borderRadius: 9,
            border: `1px solid ${allergenFilter.length ? PN.PINK : PN.BORDER}`,
            background: allergenFilter.length ? PN.PINK_SOFT : PN.WHITE,
            color: allergenFilter.length ? PN.PINK_DARK : PN.TEXT,
            fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            display:'inline-flex', alignItems:'center', gap: 8, whiteSpace:'nowrap',
          }}>
            Allergene
            {allergenFilter.length > 0 && (
              <span style={{
                fontSize: 13, padding:'1px 7px', borderRadius: 999,
                background: PN.PINK, color: PN.WHITE, fontWeight: 700,
              }}>{allergenFilter.length}</span>
            )}
            <PnI.ChevronDown size={12}/>
          </button>
          {allergenFilterOpen && (
            <div style={{
              position:'absolute', top:'calc(100% + 6px)', right: 0, zIndex: 30,
              width: 240, background: PN.WHITE,
              border:`1px solid ${PN.BORDER}`, borderRadius: 10,
              boxShadow:'0 12px 32px rgba(15,15,30,0.12)',
              padding: 6, maxHeight: 320, overflowY:'auto',
            }}>
              {ALLERGENS.map(a => {
                const on = allergenFilter.includes(a.id);
                return (
                  <button key={a.id} onClick={() => toggleFilterAllergen(a.id)} style={{
                    display:'flex', alignItems:'center', gap: 10, width:'100%',
                    padding:'8px 10px', borderRadius: 7,
                    background: on ? PN.PINK_SOFT : 'transparent',
                    border:'none', cursor:'pointer', fontFamily:'inherit',
                    fontSize: 14.5, color: PN.TEXT, textAlign:'left',
                  }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                      background: on ? PN.PINK : PN.WHITE,
                      display:'grid', placeItems:'center',
                      color: PN.WHITE, fontSize: 13,
                    }}>{on && '✓'}</span>
                    {a.name}
                  </button>
                );
              })}
              {allergenFilter.length > 0 && (
                <button onClick={() => setAllergenFilter([])} style={{
                  width:'100%', padding:'8px 10px', marginTop: 4,
                  borderTop: `1px solid ${PN.BORDER_SOFT}`,
                  background:'transparent', border:'none', cursor:'pointer',
                  fontSize: 14, color: PN.MUTED, fontFamily:'inherit',
                }}>Azzera filtri</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Header tabella */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 280px 160px 36px',
        gap: 16, padding: '10px 16px',
        fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
        textTransform:'uppercase', letterSpacing: 0.6,
        borderBottom: `1px solid ${PN.BORDER}`,
        background:'#FAFBFC',
        borderTopLeftRadius: 10, borderTopRightRadius: 10,
      }}>
        <div>Ingrediente</div>
        <div>Allergeni</div>
        <div>In uso</div>
        <div></div>
      </div>

      {/* Righe */}
      <style>{`
        @keyframes ingRowIn {
          from { opacity: 0; transform: translateY(-6px); max-height: 0; padding-top: 0; padding-bottom: 0; }
          to   { opacity: 1; transform: translateY(0);    max-height: 80px; padding-top: 14px; padding-bottom: 14px; }
        }
        .ing-add-row { animation: ingRowIn 240ms cubic-bezier(.2,.7,.2,1); overflow: visible; }
      `}</style>
      <div style={{border: `1px solid ${PN.BORDER_SOFT}`, borderTop:'none', borderRadius:'0 0 10px 10px', overflow:'visible'}}>

      {adding && (
        <div className="ing-add-row" style={{
          display:'grid', gridTemplateColumns:'1fr 280px 160px 36px',
          gap: 16, alignItems:'center',
          padding:'14px 16px',
          background: PN.PINK_SOFT,
          borderBottom: `1px solid ${PN.BORDER_SOFT}`,
          borderLeft: `3px solid ${PN.PINK}`,
        }}>
          <input
            ref={newInputRef}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') cancelAdd(); }}
            placeholder="Nome ingrediente…"
            style={{
              width:'100%', padding:'8px 12px',
              border:`1.5px solid ${PN.PINK}`, borderRadius:7,
              fontSize:16, fontWeight: 700, fontFamily:'inherit', outline:'none',
              background: PN.WHITE, color: PN.TEXT,
            }}
          />
          <div style={{position:'relative'}} data-allergen-filter>
            <button onClick={() => setNewAllergensOpen(v => !v)} style={{
              display:'flex', gap: 4, flexWrap:'wrap', alignItems:'center',
              padding: '6px 10px', borderRadius: 7,
              border:`1.5px dashed ${PN.PINK}`,
              background: PN.WHITE, cursor:'pointer', fontFamily:'inherit',
              minHeight: 32, width:'100%', textAlign:'left',
            }}>
              {newAllergens.length === 0 ? (
                <span style={{fontSize: 14, color: PN.MUTED, fontStyle:'italic'}}>+ allergeni (opzionale)</span>
              ) : newAllergens.map(aId => {
                const al = ALLERGENS.find(x => x.id === aId);
                return (
                  <span key={aId} style={{
                    fontSize: 11.5, fontWeight: 800, padding:'3px 7px', borderRadius: 4,
                    background:'#FEF2E0', color:'#92400E', textTransform:'uppercase', letterSpacing: 0.4,
                  }}>{al?.name || aId}</span>
                );
              })}
            </button>
            {newAllergensOpen && (
              <div data-ing-popover style={{
                position:'absolute', top:'calc(100% + 4px)', left: 0, zIndex: 30,
                width: 220, background: PN.WHITE,
                border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                boxShadow:'0 12px 32px rgba(15,15,30,0.14)',
                padding: 6, maxHeight: 280, overflowY:'auto',
              }}>
                {ALLERGENS.map(a => {
                  const on = newAllergens.includes(a.id);
                  return (
                    <button key={a.id} onClick={() => toggleNewAllergen(a.id)} style={{
                      display:'flex', alignItems:'center', gap: 10, width:'100%',
                      padding:'7px 10px', borderRadius: 7,
                      background: on ? PN.PINK_SOFT : 'transparent',
                      border:'none', cursor:'pointer', fontFamily:'inherit',
                      fontSize: 14.5, color: PN.TEXT, textAlign:'left',
                    }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: 4,
                        border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                        background: on ? PN.PINK : PN.WHITE,
                        display:'grid', placeItems:'center',
                        color: PN.WHITE, fontSize: 13,
                      }}>{on && '✓'}</span>
                      {a.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{display:'flex', gap: 6}}>
            <button onClick={confirmAdd} disabled={!newName.trim()} style={{
              padding:'7px 12px', borderRadius: 7,
              border:'none',
              background: newName.trim() ? PN.PINK : '#E5E7EB',
              color: newName.trim() ? PN.WHITE : PN.MUTED,
              fontSize: 14, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'not-allowed',
              fontFamily:'inherit',
            }}>Aggiungi</button>
            <button onClick={cancelAdd} style={{
              padding:'7px 10px', borderRadius: 7,
              border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
              color: PN.MUTED, fontSize: 14, fontWeight: 600, cursor:'pointer',
              fontFamily:'inherit',
            }}>Annulla</button>
          </div>
          <div></div>
        </div>
      )}

      {visible.map((ing, vIdx) => {
        const idx = ing._origIdx;
        const isPopoverOpen = popoverIdx === idx;
        const isEditingAllergens = editAllergensIdx === idx;
        return (
          <div key={idx} style={{
            display:'grid', gridTemplateColumns:'1fr 280px 160px 36px',
            gap: 16, alignItems:'center',
            padding:'14px 16px',
            background: vIdx % 2 === 0 ? PN.WHITE : '#FAFBFC',
            borderBottom: vIdx === visible.length - 1 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
            transition:'background 120ms',
            position:'relative',
          }}
          onMouseEnter={(e) => { if (!isPopoverOpen && !isEditingAllergens) e.currentTarget.style.background = PN.PINK_SOFT + '55'; }}
          onMouseLeave={(e) => { if (!isPopoverOpen && !isEditingAllergens) e.currentTarget.style.background = vIdx % 2 === 0 ? PN.WHITE : '#FAFBFC'; }}
          >
            <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>{ing.name}</div>

            {/* Allergeni — chip cliccabili */}
            <div style={{position:'relative'}}>
              <button data-ing-trigger onClick={() => { setEditAllergensIdx(isEditingAllergens ? null : idx); setPopoverIdx(null); }} style={{
                display:'flex', gap: 4, flexWrap:'wrap', alignItems:'center',
                padding: '4px 6px', borderRadius: 6,
                border:`1px dashed ${isEditingAllergens ? PN.PINK : 'transparent'}`,
                background:'transparent', cursor:'pointer', fontFamily:'inherit',
                minHeight: 26, width:'100%', textAlign:'left',
              }}>
                {ing.allergens.length === 0 ? (
                  <span style={{fontSize: 13.5, color: PN.MUTED, fontStyle:'italic'}}>+ aggiungi</span>
                ) : ing.allergens.map(aId => {
                  const al = ALLERGENS.find(x => x.id === aId);
                  return (
                    <span key={aId} style={{
                      fontSize: 11.5, fontWeight: 800, padding:'3px 7px', borderRadius: 4,
                      background:'#FEF2E0', color:'#92400E', textTransform:'uppercase', letterSpacing: 0.4,
                    }}>{al?.name || aId}</span>
                  );
                })}
              </button>
              {isEditingAllergens && (
                <div data-ing-popover style={{
                  position:'absolute', top:'calc(100% + 4px)', left: 0, zIndex: 25,
                  width: 220, background: PN.WHITE,
                  border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                  boxShadow:'0 12px 32px rgba(15,15,30,0.14)',
                  padding: 6, maxHeight: 280, overflowY:'auto',
                }}>
                  {ALLERGENS.map(a => {
                    const on = ing.allergens.includes(a.id);
                    return (
                      <button key={a.id} onClick={() => toggleIngredientAllergen(idx, a.id)} style={{
                        display:'flex', alignItems:'center', gap: 10, width:'100%',
                        padding:'7px 10px', borderRadius: 7,
                        background: on ? PN.PINK_SOFT : 'transparent',
                        border:'none', cursor:'pointer', fontFamily:'inherit',
                        fontSize: 14.5, color: PN.TEXT, textAlign:'left',
                      }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: 4,
                          border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                          background: on ? PN.PINK : PN.WHITE,
                          display:'grid', placeItems:'center',
                          color: PN.WHITE, fontSize: 13,
                        }}>{on && '✓'}</span>
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* In uso — cliccabile, popover lista piatti */}
            <div style={{position:'relative'}}>
              {ing.usedInDishes.length === 0 ? (
                <span style={{fontSize: 14.5, color: PN.MUTED, fontStyle:'italic'}}>Non usato</span>
              ) : (
                <button data-ing-trigger onClick={() => { setPopoverIdx(isPopoverOpen ? null : idx); setEditAllergensIdx(null); }} style={{
                  background:'transparent', border:'none', padding: 0, cursor:'pointer',
                  fontFamily:'inherit', fontSize: 15, fontWeight: 600,
                  color: PN.PINK_DARK,
                  display:'inline-flex', alignItems:'center', gap: 4,
                  textDecoration: isPopoverOpen ? 'underline' : 'none',
                }}>
                  in {ing.usedInDishes.length} {ing.usedInDishes.length === 1 ? 'piatto' : 'piatti'}
                  <PnI.ChevronDown size={11} style={{transform: isPopoverOpen ? 'rotate(180deg)' : 'none', transition:'transform 150ms'}}/>
                </button>
              )}
              {isPopoverOpen && (
                <div data-ing-popover style={{
                  position:'absolute', top:'calc(100% + 6px)', left: 0, zIndex: 25,
                  width: 280, background: PN.WHITE,
                  border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                  boxShadow:'0 12px 32px rgba(15,15,30,0.14)',
                  padding: '10px 4px', maxHeight: 280, overflowY:'auto',
                }}>
                  <div style={{
                    padding: '4px 12px 8px', fontSize: 12.5, fontWeight: 700,
                    color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.6,
                    borderBottom: `1px solid ${PN.BORDER_SOFT}`, marginBottom: 4,
                  }}>{ing.name} è in</div>
                  {ing.usedInDishes.map((d, i) => (
                    <div key={i} style={{
                      padding:'7px 12px', fontSize: 14.5, color: PN.TEXT,
                      display:'flex', alignItems:'center', gap: 8,
                    }}>
                      <span style={{
                        width: 4, height: 4, borderRadius: '50%', background: PN.PINK,
                      }}/>
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Azione rimuovi */}
            <button title="Rimuovi" style={{
              width: 30, height: 30, borderRadius: 7,
              border:'none', background:'transparent', cursor:'pointer',
              color: PN.MUTED, display:'grid', placeItems:'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = PN.RED_SOFT; e.currentTarget.style.color = PN.RED; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
            ><PnI.X size={13}/></button>
          </div>
        );
      })}
      {visible.length === 0 && (
        <div style={{padding:'48px 22px', textAlign:'center', color: PN.MUTED, fontSize: 15.5, background: PN.WHITE}}>
          Nessun ingrediente corrisponde ai filtri.
        </div>
      )}
      </div>
    </ImpCard>
  );
}

function PrenotazioniDurata() {
  const OPTS = [45, 60, 75, 90, 105, 120, 135, 150, 180, 210];
  const fmt = m => m < 60 ? `${m} min` : m % 60 === 0 ? `${m/60}h` : `${Math.floor(m/60)}h ${m%60}m`;

  const BUCKETS = [
    { key: '1-2', label: '1-2 coperti' },
    { key: '3-4', label: '3-4 coperti' },
    { key: '5-6', label: '5-6 coperti' },
    { key: '7+',  label: '7+ coperti'  },
  ];

  const [stdDur, setStdDur] = React.useState(90);
  const [advOpen, setAdvOpen] = React.useState(false);
  const [perSize, setPerSize] = React.useState({}); // key → durata override

  const overrides = Object.keys(perSize).length;

  const PillRow = ({ value, onChange }) => (
    <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
      {OPTS.map(o => {
        const on = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            padding:'5px 12px', borderRadius: 999,
            border: `1.5px solid ${on ? PN.TEXT : PN.BORDER_SOFT}`,
            background: on ? PN.TEXT : PN.WHITE,
            color: on ? PN.WHITE : PN.TEXT,
            fontSize: 14, fontWeight: on ? 700 : 500,
            cursor:'pointer', fontFamily:'inherit', transition:'all .12s',
          }}>{fmt(o)}</button>
        );
      })}
    </div>
  );

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 14}}>
      {/* Durata standard */}
      <div>
        <div style={{
          fontSize: 14, fontWeight: 700, color: PN.MUTED,
          letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8,
        }}>Durata media del tavolo</div>
        <PillRow value={stdDur} onChange={setStdDur}/>
      </div>

      {/* Toggle editor avanzato */}
      <div style={{
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
        paddingTop: 12,
      }}>
        <button
          onClick={() => setAdvOpen(o => !o)}
          style={{
            display:'flex', alignItems:'center', gap: 8,
            background:'transparent', border:'none', padding: 0, cursor:'pointer',
            color: PN.TEXT, fontFamily:'inherit', fontSize: 15, fontWeight: 600,
          }}
        >
          <span style={{
            display:'inline-flex', transform: advOpen ? 'rotate(90deg)' : 'none',
            transition:'transform .15s', color: PN.MUTED,
          }}><PnI.ChevronRight size={12}/></span>
          Personalizza per numero di coperti
          {overrides > 0 && (
            <span style={{
              fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3,
              padding:'2px 8px', borderRadius: 999,
              background: PN.PINK_SOFT, color: PN.PINK_DARK,
            }}>{overrides} personalizzat{overrides === 1 ? 'a' : 'e'}</span>
          )}
        </button>

        {advOpen && (
          <div style={{
            marginTop: 10,
            padding: 12, borderRadius: 10,
            background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`,
            display:'flex', flexDirection:'column', gap: 10,
          }}>
            <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.5}}>
              Sovrascrivi la durata standard in base alla dimensione del gruppo. Lascia "Standard" per usare {fmt(stdDur)}.
            </div>
            {BUCKETS.map(b => {
              const effective = perSize[b.key] ?? stdDur;
              const overridden = perSize[b.key] != null;
              return (
                <div key={b.key} style={{
                  display:'flex', alignItems:'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8,
                  background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`,
                }}>
                  <div style={{minWidth: 100, fontSize: 14.5, fontWeight: 700, color: PN.TEXT, display:'flex', alignItems:'center', gap: 6}}>
                    {b.label}
                    {overridden && <span style={{
                      width: 6, height: 6, borderRadius: '50%', background: PN.PINK,
                    }} title="Personalizzato"/>}
                  </div>
                  <div style={{flex: 1, display:'flex', flexWrap:'wrap', gap: 6}}>
                    {OPTS.map(o => {
                      const on = effective === o;
                      return (
                        <button
                          key={o}
                          onClick={() => setPerSize(prev => {
                            const next = {...prev};
                            if (o === stdDur) delete next[b.key];
                            else next[b.key] = o;
                            return next;
                          })}
                          style={{
                            padding:'5px 12px', borderRadius: 999,
                            border: `1.5px solid ${on ? PN.TEXT : PN.BORDER_SOFT}`,
                            background: on ? PN.TEXT : PN.WHITE,
                            color: on ? PN.WHITE : PN.TEXT,
                            fontSize: 14, fontWeight: on ? 700 : 500,
                            cursor:'pointer', fontFamily:'inherit',
                          }}
                        >{fmt(o)}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MCConfigura() {
  const [takeaway, setTakeaway] = React.useState(true);
  const [tkMenu, setTkMenu] = React.useState('asporto');
  const [tkLeadTime, setTkLeadTime] = React.useState(20);
  const [cucina, setCucina] = React.useState('diretto');
  const [timeout, setTimeoutMin] = React.useState(5);
  const [timeoutAction, setTimeoutAction] = React.useState('auto');
  // Servizio: fisso a persona (€) oppure percentuale sul totale del conto.
  // Un valore per modalità, non uno solo: passando da fisso a percentuale e
  // tornando indietro l'importo di prima è ancora lì, e nessuno dei due può
  // essere applicato con l'unità sbagliata.
  const [servizioTipo, setServizioTipo] = React.useState('fisso');
  const [servizioFisso, setServizioFisso] = React.useState(0);
  const [servizioPerc, setServizioPerc] = React.useState(0);
  const servizio = servizioTipo === 'fisso' ? servizioFisso : servizioPerc;
  const setServizio = servizioTipo === 'fisso' ? setServizioFisso : setServizioPerc;
  const servizioContestabile = servizioTipo === 'fisso' && servizio > 0;
  const [showQr, setShowQr] = React.useState(false);
  // Moduli attivi (sincronizzati con localStorage condiviso tra pagine)
  const readMods = () => (window.byupReadModules ? window.byupReadModules() : {sala:true, prenotazioni:true});
  const [modules, setModules] = React.useState(readMods);
  // Sala e Prenotazioni si accendono insieme: il calendario prenotazioni
  // lavora sui tavoli, quindi attivare la sala senza prenotazioni lascerebbe
  // l'utente a metà. Spegnendo la sala si spengono anche le prenotazioni, che
  // restano comunque disattivabili da sole col loro toggle.
  const setModule = (key, val) => {
    const next = {...modules, [key]: val};
    if (key === 'sala') next.prenotazioni = val;
    setModules(next);
    if (window.byupWriteModules) window.byupWriteModules(next);
  };
  // Popup post-attivazione sala: propone di andare a creare la sala o restare qui
  const [salaAttivataPopup, setSalaAttivataPopup] = React.useState(false);

  return (
    <div>
      {/* Avviso sala disattivata — in cima alla tab: molte impostazioni
          di questa pagina dipendono dal modulo Sala e tavoli */}
      {!modules.sala && (
        <div style={{
          display:'flex', alignItems:'center', gap: 14,
          padding: '16px 18px', borderRadius: 12, marginBottom: 18,
          background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
          borderLeft: `3px solid ${PN.AMBER}`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: PN.AMBER_SOFT, color: PN.AMBER,
            display:'grid', placeItems:'center',
          }}>
            <PnI.Plate size={17}/>
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>
              Sembra che tu non abbia una sala
            </div>
            <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>
              Alcune operazioni sono collegate alla sala e ai tavoli: vuoi attivare ora la sala?
            </div>
          </div>
          <ImpButton variant="primary" onClick={() => {
            setModule('sala', true);
            setSalaAttivataPopup(true);
          }} style={{flexShrink: 0}}>
            Attiva ora
          </ImpButton>
        </div>
      )}

      {/* === SEZIONE 1: SALA === */}
      {/* Card senza header: a modulo attivo si parte diretti dal flusso ordini.
          La (dis)attivazione del modulo vive solo nella tab Sala e tavoli;
          da spento qui resta il banner in alto. */}
      {modules.sala && (
      <ImpCard>
        <div style={{display:'flex', flexDirection:'column', gap: 16}}>
        {/* --- Flusso ordini in cucina --- */}
        <div>
          <div style={{fontSize: 15, fontWeight: 700, marginBottom: 4, display:'inline-flex', alignItems:'center', gap: 7}}>
            <PnI.Lightning size={15}/> Flusso ordini in cucina
          </div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginBottom: 12}}>
            Come arrivano gli ordini al cuoco quando il cliente ordina dall'app
          </div>
        {/* Flowchart visivo */}
        <div style={{
          padding: 18,
          background: '#FAFBFC',
          border: `1px solid ${PN.BORDER_SOFT}`,
          borderRadius: 12,
          marginBottom: 16,
        }}>
          <FlowDiagram active={cucina}/>
        </div>

        {/* Selettore */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, marginBottom: 16}}>
          {[
            {id:'diretto', title:'Diretto in cucina', sub:'Più veloce, niente attese', Icon: PnI.Lightning, pros:['Ordini istantanei','La cucina vede in tempo reale','Ideale per alto volume']},
            {id:'cameriere', title:'Passa dal cameriere', sub:'Il cameriere approva, poi invia', Icon: PnI.Person, pros:['Filtro umano sui dettagli','Gestisci personalizzazioni','Ideale per piatti elaborati']},
          ].map(c => {
            const on = cucina === c.id;
            return (
              <button key={c.id} onClick={() => setCucina(c.id)} style={{
                padding: '16px 18px', borderRadius: 12,
                border: `1.5px solid ${on ? PN.TEXT : PN.BORDER_SOFT}`,
                background: on ? '#FAFBFC' : PN.WHITE,
                cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                transition:'border-color .15s, background .15s',
              }}>
                <div style={{display:'flex', alignItems:'flex-start', gap: 12, marginBottom: 10}}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: on ? PN.TEXT : '#F4F5F7',
                    color: on ? PN.WHITE : PN.TEXT,
                    display:'grid', placeItems:'center', flexShrink: 0,
                  }}>
                    <c.Icon size={18}/>
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 16, fontWeight: 800, color: PN.TEXT, letterSpacing:-0.1}}>{c.title}</div>
                    <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>{c.sub}</div>
                  </div>
                  <span style={{
                    width: 18, height: 18, borderRadius:'50%',
                    border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                    background: on ? PN.TEXT : PN.WHITE,
                    display:'grid', placeItems:'center', flexShrink: 0,
                    color: PN.WHITE,
                  }}>{on && <PnI.Check size={10} color={PN.WHITE}/>}</span>
                </div>
                <ul style={{margin: 0, padding: 0, listStyle:'none', fontSize: 13.5, display:'flex', flexDirection:'column', gap: 3}}>
                  {c.pros.map((p,i) => (
                    <li key={i} style={{display:'flex', gap: 7, alignItems:'center', color: PN.TEXT}}>
                      <PnI.Check size={11} color={PN.GREEN}/>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Timeout cameriere — solo se "cameriere" attivo */}
        {cucina === 'cameriere' && (
          <div style={{
            padding: 18, borderRadius: 12,
            background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
            borderLeft: `3px solid ${PN.AMBER}`,
          }}>
            <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 16}}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: PN.AMBER_SOFT, color: PN.AMBER,
                display:'grid', placeItems:'center',
              }}>
                <PnI.Clock size={17} color={PN.AMBER}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>
                  Timeout di approvazione
                </div>
                <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2}}>
                  Quanto aspetta l'ordine prima di una decisione automatica
                </div>
              </div>
            </div>

            <div style={{display:'grid', gap: 14}}>
                <div>
                  <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>
                    Tempo limite
                  </div>
                  <div style={{display:'flex', gap: 6}}>
                    {[2,5,10,15].map(m => {
                      const on = timeout === m;
                      return (
                        <button key={m} onClick={() => setTimeoutMin(m)} style={{
                          flex: 1, padding: '10px 8px', borderRadius: 8,
                          border: `1.5px solid ${on ? PN.AMBER : PN.BORDER}`,
                          background: on ? PN.AMBER_SOFT : PN.WHITE,
                          color: on ? PN.AMBER : PN.TEXT,
                          fontSize: 15, fontWeight: 700,
                          cursor:'pointer', fontFamily:'inherit',
                        }}>
                          <div style={{fontSize: 18, fontWeight: 800, lineHeight: 1}}>{m}</div>
                          <div style={{fontSize: 12, fontWeight: 600, marginTop: 3, opacity: 0.75}}>minuti</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 4}}>
                    Allo scadere, scegli una sola opzione
                  </div>
                  <div style={{fontSize: 13.5, color: PN.MUTED, marginBottom: 10}}>
                    Cosa deve succedere automaticamente all'ordine in attesa
                  </div>
                  <div style={{display:'grid', gap: 8}}>
                    {[
                      {id:'auto', label:'Manda comunque in cucina', desc:"L'ordine procede senza l'approvazione del cameriere. Cliente e cucina non si accorgono del ritardo.", iconKey:'check'},
                      {id:'notify', label:'Avvisa il manager', desc:"L'ordine resta in attesa, il manager riceve una notifica push e decide manualmente se approvare o rifiutare.", iconKey:'alert'},
                    ].map(a => {
                      const on = timeoutAction === a.id;
                      const Icon = BuIcons[a.iconKey];
                      return (
                        <label key={a.id} style={{
                          display:'flex', alignItems:'flex-start', gap: 12,
                          padding: 12, borderRadius: 8,
                          border: `1.5px solid ${on ? PN.AMBER : PN.BORDER}`,
                          background: on ? PN.AMBER_SOFT : PN.WHITE,
                          cursor:'pointer',
                        }}>
                          <input type="radio" name="timeoutAction" checked={on} onChange={() => setTimeoutAction(a.id)} style={{accentColor: PN.AMBER, marginTop: 2, flexShrink: 0}}/>
                          <span style={{
                            display:'inline-flex', alignItems:'center', justifyContent:'center',
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                            background: on ? PN.AMBER : PN.SIDE_BG,
                          }}><Icon size={12} color={on ? PN.WHITE : PN.MUTED}/></span>
                          <div style={{flex:1}}>
                            <div style={{fontSize: 14.5, fontWeight: 700, color: on ? PN.AMBER : PN.TEXT, marginBottom: 2}}>{a.label}</div>
                            <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.45}}>{a.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
          </div>
        )}
          </div>

        {/* --- Servizio --- */}
        <div style={{
          padding: 16, borderRadius: 11,
          border: `1px solid ${PN.BORDER_SOFT}`,
        }}>
          <div style={{fontSize: 15, fontWeight: 700, marginBottom: 10, display:'inline-flex', alignItems:'center', gap: 7}}>
            <PnI.Plate size={15}/> Servizio
          </div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginBottom: 12}}>
            {servizioTipo === 'fisso'
              ? "Importo per persona, applicato solo in sala (non all'asporto)"
              : "Percentuale sul totale del conto, applicata solo in sala (non all'asporto)"}
          </div>

          {/* Tipo — pill chiare: è una scelta di natura, non l'importo.
              Gli importi sotto restano scuri quando attivi, così le due file
              non si confondono. */}
          <div style={{display:'flex', gap: 6, marginBottom: 8}}>
            {[{id:'fisso', label:'Fisso a persona'}, {id:'percentuale', label:'Percentuale sul conto'}].map(m => {
              const on = servizioTipo === m.id;
              return (
                <button key={m.id} onClick={() => setServizioTipo(m.id)} style={{
                  flex: 1, padding:'7px 6px', borderRadius: 999,
                  border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                  background: on ? PN.PINK_SOFT : PN.WHITE,
                  color: on ? PN.PINK_DARK : PN.MUTED,
                  fontSize: 13.5, fontWeight: 700,
                  cursor:'pointer', fontFamily:'inherit',
                }}>{m.label}</button>
              );
            })}
          </div>

          <div style={{display:'flex', gap: 6}}>
            {SERVIZIO_OPZIONI[servizioTipo].map(v => {
              const on = servizio === v;
              return (
                <button key={v} onClick={() => setServizio(v)} style={{
                  flex: 1, padding:'9px 6px', borderRadius: 7,
                  border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                  background: on ? PN.TEXT : PN.WHITE,
                  color: on ? PN.WHITE : PN.TEXT,
                  fontSize: 14.5, fontWeight: 700,
                  cursor:'pointer', fontFamily:'inherit',
                }}>{v === 0 ? '—' : (servizioTipo === 'fisso' ? `€${v.toFixed(2)}` : `${v}%`)}</button>
              );
            })}
          </div>

          {/* L'avviso si accende solo quando la scelta attiva è proprio quella
              contestabile: una quota fissa davvero applicata. A zero, o in
              percentuale, resta una nota informativa. */}
          <div style={{
            marginTop: 12, padding: '9px 11px', borderRadius: 8,
            background: servizioContestabile ? '#FEF6E7' : '#FAFBFC',
            border: `1px solid ${servizioContestabile ? '#F0C36D' : PN.BORDER_SOFT}`,
            fontSize: 12.5, lineHeight: 1.5,
            color: servizioContestabile ? '#8A5A00' : PN.MUTED,
          }}>
            Nel Lazio (L.R. 21/2006) il “coperto” non è ammesso. È consentita la voce
            “servizio”, ma se applicata come quota fissa a persona può essere contestata.{' '}
            <strong style={{color: servizioContestabile ? '#7A4E00' : PN.TEXT}}>
              Consigliato: servizio in percentuale.
            </strong>
          </div>
        </div>
        </div>
      </ImpCard>
      )}

      {/* === SEZIONE 2: PRENOTAZIONI === */}
      <ImpCard
        title="Prenotazioni"
        sub={modules.prenotazioni
          ? "Durata media per servizio — usata come default nel popup di nuova prenotazione"
          : "Attiva per gestire agenda, orari e conferme"
        }
        action={
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: 0.4,
              padding: '3px 9px', borderRadius: 999,
              background: modules.prenotazioni ? PN.GREEN_SOFT : '#F4F5F7',
              color: modules.prenotazioni ? PN.GREEN : PN.MUTED,
              textTransform: 'uppercase',
            }}>
              {modules.prenotazioni ? 'Attivo' : 'Non attivo'}
            </span>
            <ImpToggle checked={modules.prenotazioni} onChange={() => setModule('prenotazioni', !modules.prenotazioni)}/>
          </div>
        }
      >
        {!modules.prenotazioni ? (
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
              {(BuIcons.calendar||BuIcons.user)({size: 22, color:'currentColor'})}
            </div>
            <div style={{fontSize: 15.5, fontWeight: 700, marginBottom: 4}}>Prenotazioni disattivate</div>
            <div style={{fontSize: 14, color: PN.MUTED, marginBottom: 14, maxWidth: 360, margin:'0 auto 14px'}}>
              Attivando le prenotazioni potrai gestire agenda, orari e conferme dei clienti.
            </div>
            <ImpButton variant="primary" onClick={() => setModule('prenotazioni', true)}>Attiva prenotazioni</ImpButton>
          </div>
        ) : (
          <PrenotazioniDurata/>
        )}
      </ImpCard>

      {/* === SEZIONE 3: ASPORTO === */}
      <ImpCard
        title="Asporto"
        sub={takeaway
          ? "I clienti possono ordinare da remoto e ritirare al banco"
          : "Attiva per permettere ai clienti di ordinare da remoto"
        }
        action={
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: 0.4,
              padding: '3px 9px', borderRadius: 999,
              background: takeaway ? PN.GREEN_SOFT : '#F4F5F7',
              color: takeaway ? PN.GREEN : PN.MUTED,
              textTransform: 'uppercase',
            }}>
              {takeaway ? 'Attivo' : 'Non attivo'}
            </span>
            <ImpToggle checked={takeaway} onChange={() => setTakeaway(!takeaway)}/>
          </div>
        }
      >
        {!takeaway ? (
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
              <PnI.Bag size={22}/>
            </div>
            <div style={{fontSize: 15.5, fontWeight: 700, marginBottom: 4}}>Asporto disattivato</div>
            <div style={{fontSize: 14, color: PN.MUTED, marginBottom: 14, maxWidth: 360, margin:'0 auto 14px'}}>
              Attivando l'asporto i clienti potranno ordinare da remoto tramite QR e ritirare al banco. Potrai usare un menù dedicato e definire il tempo minimo di preparazione.
            </div>
            <ImpButton variant="primary" onClick={() => setTakeaway(true)}>Attiva servizio asporto</ImpButton>
          </div>
        ) : (
          <div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14, marginBottom: 14}}>
              <ImpField label="Menù utilizzato per l'asporto" hint="Puoi avere un menù dedicato all'asporto, diverso da quello in sala">
                <select value={tkMenu} onChange={e => setTkMenu(e.target.value)} style={{
                  width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                  borderRadius:9, fontSize:15.5, background:PN.WHITE, fontFamily:'inherit',
                }}>
                  <option value="primavera">Menù primavera</option>
                  <option value="pranzo">Menù pranzo</option>
                  <option value="cena">Menù cena</option>
                  <option value="estivo">Menù estivo</option>
                  <option value="bambini">Menù bambini</option>
                  <option value="degustazione">Menù degustazione</option>
                </select>
              </ImpField>

              <ImpField label="Tempo di preparazione minimo" hint={`I clienti vedono come primo slot l'orario corrente +${tkLeadTime} minuti`}>
                <div style={{display:'flex', alignItems:'center', gap: 10}}>
                  <input type="range" min={5} max={60} step={5} value={tkLeadTime} onChange={e => setTkLeadTime(Number(e.target.value))} style={{flex: 1, accentColor: PN.PINK}}/>
                  <div style={{
                    width: 70, padding:'8px 10px',
                    background: PN.PINK_SOFT, color: PN.PINK_DARK,
                    borderRadius: 7, fontSize: 15, fontWeight: 700, textAlign:'center',
                  }}>{tkLeadTime} min</div>
                </div>
              </ImpField>
            </div>

            <div style={{
              padding: 14, borderRadius: 11,
              background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`,
              display:'flex', alignItems:'center', gap: 14,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 8,
                background: `repeating-conic-gradient(${PN.TEXT} 0% 25%, transparent 0% 50%) 0 0/8px 8px`,
                border: `2px solid ${PN.WHITE}`,
                boxShadow: `0 0 0 1px ${PN.BORDER}`,
                flexShrink: 0,
              }}/>
              <div style={{flex: 1}}>
                <div style={{fontSize: 15.5, fontWeight: 700, marginBottom: 2}}>QR per ordini d'asporto</div>
                <div style={{fontSize: 13.5, color: PN.MUTED}}>
                  Esponi all'esterno o sul menu cartaceo. I clienti scansionano e ordinano da remoto.
                </div>
              </div>
              <ImpButton variant="ghost" onClick={() => setShowQr(true)}>Mostra QR</ImpButton>
              <ImpButton variant="primary"><span style={{display:'inline-flex', alignItems:'center', gap:6}}><PnI.Download size={14} color={PN.WHITE}/> Scarica</span></ImpButton>
            </div>
          </div>
        )}
      </ImpCard>

      {/* QR Modal */}
      {showQr && (
        <div onClick={() => setShowQr(false)} style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG, borderRadius: 20, padding: 28,
            width: 360, position:'relative', textAlign:'center',
          }}>
            <button onClick={() => setShowQr(false)} style={{
              position:'absolute', top: 14, right: 14,
              width: 32, height: 32, borderRadius: 8,
              background:'#F4F5F7', border:'none', cursor:'pointer',
              display:'grid', placeItems:'center',
            }}><PnI.X size={14}/></button>
            <div style={{fontSize: 17, fontWeight: 700, marginBottom: 4}}>QR ordini d'asporto</div>
            <div style={{fontSize: 14, color: PN.MUTED, marginBottom: 16}}>Scansiona per ordinare e ritirare al banco</div>
            <div style={{
              width: 220, height: 220, margin:'0 auto 16px',
              background: `repeating-conic-gradient(${PN.TEXT} 0% 25%, transparent 0% 50%) 0 0/14px 14px`,
              border: `4px solid ${PN.WHITE}`,
              boxShadow: `0 0 0 2px ${PN.BORDER}`,
              borderRadius: 12,
            }}/>
            <div style={{display:'flex', gap: 8}}>
              <ImpButton variant="ghost" style={{flex:1, justifyContent:'center'}}><span style={{display:'inline-flex', alignItems:'center', gap:6}}><PnI.FileText size={14}/> PDF</span></ImpButton>
              <ImpButton variant="primary" style={{flex:1, justifyContent:'center'}}><span style={{display:'inline-flex', alignItems:'center', gap:6}}><PnI.Download size={14} color={PN.WHITE}/> Scarica</span></ImpButton>
            </div>
          </div>
        </div>
      )}

      {/* Popup post-attivazione sala: il modulo è già attivo, si sceglie se
          andare a creare la sala (tab Sala e tavoli) o restare in Operazioni */}
      {salaAttivataPopup && (
        <div onClick={() => setSalaAttivataPopup(false)} style={{
          position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 150, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG, borderRadius: 20, width: 400, maxWidth:'100%',
            animation:'dialogIn 0.2s ease-out', position:'relative',
          }}>
            <button onClick={() => setSalaAttivataPopup(false)} title="Chiudi" style={{
              position:'absolute', top: 16, right: 16,
              width: 32, height: 32, borderRadius:'50%',
              background:'rgba(15,17,21,0.05)', border:'none', cursor:'pointer',
              display:'grid', placeItems:'center', color: PN.MUTED,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div style={{padding: '24px 24px 18px'}}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: PN.GREEN_SOFT, color: PN.GREEN,
                display:'grid', placeItems:'center', marginBottom: 14,
              }}><PnI.Plate size={20}/></div>
              <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>
                Sala attivata
              </div>
              <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.5}}>
                Il modulo Sala e tavoli è ora attivo. Per iniziare a lavorare in sala
                crea la tua prima sala e aggiungi i tavoli.
              </div>
            </div>
            <div style={{padding: '14px 24px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 10, justifyContent:'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setSalaAttivataPopup(false)}>Rimani qui</ImpButton>
              <ImpButton variant="primary" onClick={() => {
                setSalaAttivataPopup(false);
                window.dispatchEvent(new CustomEvent('byup-imp-goto', { detail: 'sala' }));
              }}>Crea una sala</ImpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlowDiagram({ active }) {
  // Cliente → App → (Cameriere →) Cucina
  const Step = ({ icon, label, hi }) => (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center', gap: 6,
      flexShrink: 0,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: hi ? PN.PINK : PN.WHITE,
        color: hi ? PN.WHITE : PN.MUTED,
        border: `2px solid ${hi ? PN.PINK : PN.BORDER}`,
        display:'grid', placeItems:'center',
        boxShadow: hi ? '0 4px 12px rgba(239,79,139,0.25)' : 'none',
      }}>{icon}</div>
      <span style={{fontSize: 13.5, fontWeight: 700, color: hi ? PN.PINK_DARK : PN.MUTED}}>{label}</span>
    </div>
  );

  const Arrow = ({ hi }) => (
    <div style={{
      flex:1, height: 2,
      background: hi ? PN.PINK : PN.BORDER,
      position:'relative', minWidth: 30,
    }}>
      <span style={{
        position:'absolute', right: -6, top:'50%', transform:'translateY(-50%)',
        display:'inline-flex', color: hi ? PN.PINK : PN.BORDER,
      }}><BuIcons.chevronRight size={14}/></span>
    </div>
  );

  return (
    <div>
      <div style={{
        fontSize: 13, fontWeight: 700, color: PN.MUTED,
        letterSpacing: 0.5, textTransform:'uppercase',
        textAlign:'center', marginBottom: 14,
      }}>Anteprima del flusso</div>
      <div style={{
        display:'flex', alignItems:'center', gap: 4,
        maxWidth: 580, margin:'0 auto',
      }}>
        <Step icon={<BuIcons.user size={26} color="#FFF"/>} label="Cliente" hi/>
        <Arrow hi/>
        <Step icon={<BuIcons.phone size={24} color="#FFF"/>} label="App byup" hi/>
        <Arrow hi/>
        {active === 'cameriere' && (
          <>
            <Step icon={<BuIcons.waiter size={26} color="#FFF"/>} label="Cameriere" hi/>
            <Arrow hi/>
          </>
        )}
        <Step icon={<BuIcons.kitchen size={26} color="#FFF"/>} label="Cucina" hi/>
      </div>
      <div style={{
        textAlign:'center', marginTop: 12,
        fontSize: 14, color: PN.MUTED,
      }}>
        {active === 'diretto'
          ? <>Tempo medio dall'ordine alla cucina: <b style={{color: PN.GREEN}}>~3 secondi</b></>
          : <>Tempo medio dall'ordine alla cucina: <b style={{color: '#D97706'}}>~2 minuti</b> (dipende dalla risposta del cameriere)</>
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// AiUploadCta — pulsante "Carica menu (PDF / foto)" magenta brand vivace.
// Sfondo gradient brand soft → tint, sparkle BRAND pulsante, shimmer permanente
// che attraversa il button ogni 3.4s. Border dashed BRAND. Hover: gradient più
// saturo + lift soft. Pattern AI-inspired ma col colore d'identità Byup.
// ─────────────────────────────────────────────────────────────────────────

function AiUploadCta({onClick, children}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        width: '100%',
        padding: '14px 18px',
        border: `1.5px dashed ${PN.PINK}`,
        borderRadius: 12,
        background: hover
          ? 'linear-gradient(135deg, #FFE0DD 0%, #FFD3D0 100%)'
          : 'linear-gradient(135deg, #FFF5F4 0%, #FFE7E4 100%)',
        color: PN.PINK_DARK,
        fontSize: 15.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'background 200ms ease-out, transform 200ms ease-out, box-shadow 200ms ease-out',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hover
          ? '0 8px 20px rgba(255, 90, 95, 0.18), inset 0 1px 0 rgba(255,255,255,0.5)'
          : '0 1px 2px rgba(255, 90, 95, 0.10), inset 0 1px 0 rgba(255,255,255,0.4)',
      }}
    >
      {/* Sparkle BRAND magenta pulsante */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{
        flexShrink: 0,
        animation: 'ai-cta-sparkle 2.2s ease-in-out infinite',
        transformOrigin: 'center',
      }}>
        <path d="M12 2 L13.6 8.4 L20 10 L13.6 11.6 L12 18 L10.4 11.6 L4 10 L10.4 8.4 Z" fill={PN.PINK}/>
        <path d="M19 3 L19.7 5.3 L22 6 L19.7 6.7 L19 9 L18.3 6.7 L16 6 L18.3 5.3 Z" fill={PN.PINK} opacity="0.7"/>
      </svg>
      <span style={{position: 'relative', zIndex: 1}}>{children || 'Carica menu (PDF / foto)'}</span>

      {/* Shimmer overlay — gradient bianco che attraversa il button.
          Loop permanente, lento (3.4s), comunica "qualcosa di magico è qui"
          senza essere AI slop. */}
      <span aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: '40%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent)',
        animation: 'ai-cta-shimmer 3.4s ease-in-out infinite',
        pointerEvents: 'none',
      }}/>
      <style>{`
        @keyframes ai-cta-sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50%      { transform: scale(1.12) rotate(8deg); opacity: 0.85; }
        }
        @keyframes ai-cta-shimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(260%); }
          100% { transform: translateX(260%); }
        }
      `}</style>
    </button>
  );
}

window.ImpMenuCucina = ImpMenuCucina;
window.ImpFlussi = MCConfigura;
window.AiUploadCta = AiUploadCta;

// ─── AI Menu Upload Modal ────────────────────────────────────────────────────
function AIMenuUploadModal({ onClose, onImport }) {
  const [stage, setStage] = React.useState('upload'); // upload | processing | review
  const [file, setFile] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [menuName, setMenuName] = React.useState('Nuovo menù');
  const [extracted, setExtracted] = React.useState(null);
  const [selected, setSelected] = React.useState({}); // catName → Set(dishId)

  const startProcessing = () => {
    setStage('processing');
  };

  const onProcessingDone = () => {
    // Mock: estrae piatti credibili da un menu italiano
    const data = MOCK_EXTRACTED;
    setExtracted(data);
    // Default: tutti selezionati
    const sel = {};
    data.categories.forEach(c => { sel[c.name] = new Set(c.dishes.map(d => d.id)); });
    setSelected(sel);
    setMenuName(data.menuName);
    setStage('review');
  };

  const toggle = (catName, dishId) => setSelected(prev => {
    const next = {...prev};
    const set = new Set(next[catName] || []);
    if (set.has(dishId)) set.delete(dishId); else set.add(dishId);
    next[catName] = set;
    return next;
  });

  const totalSelected = Object.values(selected).reduce((s, set) => s + set.size, 0);

  const confirmImport = () => {
    if (!extracted) return;
    const dishes = [];
    const categories = [];
    extracted.categories.forEach(c => {
      const ids = selected[c.name] || new Set();
      const items = [];
      c.dishes.forEach(d => {
        if (ids.has(d.id)) {
          // libreria
          dishes.push({
            id: d.id, name: d.name, desc: d.desc || '',
            cat: c.name, allergens: d.allergens || [],
            kcal: d.kcal || null, photo: null, available: true,
          });
          // riga menù
          items.push({ dishId: d.id, price: d.price || 0, active: true });
        }
      });
      if (items.length) categories.push({ name: c.name, items });
    });
    onImport({ menuName: menuName.trim() || 'Nuovo menù', categories, dishes });
  };

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset:0, background:'rgba(15,17,21,0.42)', zIndex:1100,
      display:'grid', placeItems:'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16, width: 720, maxWidth:'100%',
        maxHeight:'90%', display:'flex', flexDirection:'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px', borderBottom: `1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:12}}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${PN.PINK}, #B85C8E)`,
            display:'grid', placeItems:'center', color:'#fff', fontSize: 20,
          }}>✨</div>
          <div style={{flex:1}}>
            <div style={{fontSize: 13, color: PN.PINK_DARK, textTransform:'uppercase', letterSpacing: 0.5, fontWeight: 800}}>Importazione AI</div>
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>
              {stage === 'upload' && 'Carica il tuo menu'}
              {stage === 'processing' && 'Stiamo analizzando il menu…'}
              {stage === 'review' && 'Verifica i piatti estratti'}
            </div>
          </div>
          <button onClick={onClose} style={{width:30, height:30, borderRadius:7, border:'none', background:'#F4F5F7', cursor:'pointer', fontSize:18, color:PN.MUTED}}>✕</button>
        </div>

        {/* Body */}
        <div style={{flex:1, overflowY:'auto', padding: stage === 'review' ? 0 : 28}}>
          {stage === 'upload' && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile({ name: 'menu-pranzo.pdf', size: '1.4 MB' }); }}
                onClick={!file ? () => setFile({ name: 'menu-pranzo.pdf', size: '1.4 MB' }) : undefined}
                style={{
                  background: dragOver ? PN.PINK_SOFT : '#FAFBFC',
                  border: `2px dashed ${dragOver ? PN.PINK : PN.BORDER}`,
                  borderRadius: 14, padding: '36px 24px', textAlign:'center',
                  cursor: !file ? 'pointer' : 'default', transition: 'all .2s',
                }}>
                {!file ? (
                  <>
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: PN.PINK_SOFT, color: PN.PINK,
                      display:'grid', placeItems:'center', margin:'0 auto 14px', fontSize: 26,
                    }}>📤</div>
                    <div style={{fontSize: 17, fontWeight: 700, marginBottom: 4, color: PN.TEXT}}>Trascina qui il tuo menu</div>
                    <div style={{fontSize: 15, color: PN.MUTED, marginBottom: 16}}>oppure clicca per selezionare un file</div>
                    <div style={{display:'flex', gap: 8, justifyContent:'center', flexWrap:'wrap'}}>
                      {['📄 PDF', '🖼 Foto', '📷 Scatta foto'].map((opt,i) => (
                        <div key={i} style={{
                          padding:'6px 12px', background: '#fff', border: `1px solid ${PN.BORDER}`,
                          borderRadius: 999, fontSize: 14, color: PN.MUTED, fontWeight: 600,
                        }}>{opt}</div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{display:'flex', alignItems:'center', gap: 12, textAlign:'left'}}>
                    <div style={{
                      width: 40, height: 48, borderRadius: 5,
                      background:'#fef2f2', border:`1.5px solid #DC2626`,
                      display:'grid', placeItems:'center', fontSize: 11, fontWeight: 800, color: '#DC2626',
                    }}>PDF</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>{file.name}</div>
                      <div style={{fontSize: 14, color: PN.MUTED}}>{file.size} · pronto per l'analisi</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{
                      background:'transparent', border:'none', cursor:'pointer', color: PN.MUTED, fontSize: 18,
                    }}>✕</button>
                  </div>
                )}
              </div>

              <div style={{display:'flex', alignItems:'center', gap: 14, margin:'22px 0 14px'}}>
                <div style={{flex:1, height: 1, background: PN.BORDER}}/>
                <span style={{fontSize: 13, color: PN.MUTED, letterSpacing: 1, fontWeight: 700}}>OPPURE</span>
                <div style={{flex:1, height: 1, background: PN.BORDER}}/>
              </div>

              <div style={{
                display:'flex', alignItems:'center', gap: 10,
                background: '#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 12,
                padding: '12px 14px',
              }}>
                <span style={{fontSize: 18}}>🔗</span>
                <input placeholder="https://… (link al sito o PDF online)" style={{
                  flex:1, border:'none', outline:'none', fontSize: 15, fontFamily:'inherit', background:'transparent',
                }}/>
                <button style={{
                  background: PN.TEXT, color:'#fff', border:'none', padding:'8px 14px',
                  borderRadius: 7, fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>Importa</button>
              </div>
            </>
          )}

          {stage === 'processing' && <AIProcessingPanel onDone={onProcessingDone}/>}

          {stage === 'review' && extracted && (
            <AIReviewPanel
              extracted={extracted} selected={selected} onToggle={toggle}
              menuName={menuName} setMenuName={setMenuName}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12}}>
          {stage === 'upload' && (
            <>
              <div style={{fontSize: 13.5, color: PN.MUTED}}>🔒 I tuoi dati sono privati. L'analisi richiede ~10 secondi.</div>
              <div style={{display:'flex', gap: 8}}>
                <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
                <ImpButton variant="primary" onClick={startProcessing} disabled={!file}>✨ Analizza menu</ImpButton>
              </div>
            </>
          )}
          {stage === 'processing' && (
            <>
              <div style={{fontSize: 13.5, color: PN.MUTED}}>L'AI sta leggendo il documento, identificando categorie e prezzi…</div>
              <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
            </>
          )}
          {stage === 'review' && (
            <>
              <div style={{fontSize: 14.5, color: PN.MUTED}}>
                <b style={{color: PN.TEXT}}>{totalSelected}</b> piatti selezionati
                {' · '}deseleziona quelli che non vuoi importare
              </div>
              <div style={{display:'flex', gap: 8}}>
                <ImpButton variant="ghost" onClick={() => setStage('upload')}>← Indietro</ImpButton>
                <ImpButton variant="primary" onClick={confirmImport} disabled={totalSelected === 0}>Crea menù con {totalSelected} piatti</ImpButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI Processing animation ─────────────────────────────────────────────────
function AIProcessingPanel({ onDone }) {
  const tasks = [
    { label: 'Lettura del PDF…', detail: 'Estrazione testo e struttura', duration: 1100 },
    { label: 'Identificazione categorie…', detail: 'Trovate 4 categorie: Antipasti, Primi, Secondi, Dolci', duration: 1200 },
    { label: 'Estrazione piatti e prezzi…', detail: '14 piatti identificati', duration: 1400 },
    { label: 'Analisi allergeni…', detail: 'Glutine, latte, uova, pesce', duration: 1100 },
    { label: 'Generazione descrizioni…', detail: 'Suggerimenti basati sugli ingredienti', duration: 1200 },
    { label: 'Quasi pronto…', detail: 'Ultimo controllo qualità', duration: 700 },
  ];
  const [progress, setProgress] = React.useState(0);
  const [currentTask, setCurrentTask] = React.useState(0);

  React.useEffect(() => {
    if (currentTask >= tasks.length) {
      const t = setTimeout(() => onDone(), 500);
      return () => clearTimeout(t);
    }
    const start = Date.now();
    const dur = tasks[currentTask].duration;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const tp = Math.min(elapsed / dur, 1);
      const overall = ((currentTask + tp) / tasks.length) * 100;
      setProgress(overall);
      if (tp >= 1) { clearInterval(interval); setCurrentTask(c => c + 1); }
    }, 60);
    return () => clearInterval(interval);
  }, [currentTask]);

  const totalDur = tasks.reduce((s,t) => s + t.duration, 0);
  const secondsLeft = Math.max(1, Math.ceil((totalDur - (progress/100) * totalDur) / 1000));

  return (
    <div style={{textAlign:'center', padding:'8px 12px'}}>
      {/* AI orb */}
      <div style={{position:'relative', width: 96, height: 96, margin:'0 auto 22px'}}>
        <div style={{
          position:'absolute', inset:0, borderRadius:'50%',
          background:`conic-gradient(from 0deg, ${PN.PINK}, #8B5CF6, ${PN.PINK})`,
          animation:'aiSpin 2.5s linear infinite',
        }}/>
        <div style={{
          position:'absolute', inset: 6, borderRadius:'50%',
          background: PN.WHITE, display:'grid', placeItems:'center',
          fontSize: 38,
        }}>✨</div>
        <style>{`@keyframes aiSpin { to { transform: rotate(360deg); }} @keyframes aiPulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:.4; transform:scale(.6)} }`}</style>
      </div>

      <div style={{fontSize: 16, color: PN.MUTED, marginBottom: 18}}>
        Pronto in: <b style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{secondsLeft}s</b>
      </div>

      <div style={{
        background: '#FAFBFC', borderRadius: 12, padding: '18px 20px',
        border: `1px solid ${PN.BORDER_SOFT}`, textAlign:'left',
      }}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom: 10}}>
          <span style={{fontSize: 14, fontWeight: 800, color: PN.TEXT}}>AVANZAMENTO</span>
          <span style={{fontSize: 14, fontWeight: 800, color: PN.PINK}}>{Math.round(progress)}%</span>
        </div>
        <div style={{height: 6, background: '#EEF0F3', borderRadius: 999, overflow:'hidden', marginBottom: 18}}>
          <div style={{
            height:'100%', width: `${progress}%`,
            background: `linear-gradient(90deg, ${PN.PINK}, #8B5CF6)`,
            borderRadius: 999, transition: 'width .15s linear',
          }}/>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap: 8}}>
          {tasks.map((t, i) => {
            if (i > currentTask) return null;
            const done = i < currentTask;
            const active = i === currentTask;
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap: 10,
                padding: '7px 10px', borderRadius: 7,
                background: active ? PN.PINK_SOFT : 'transparent',
                opacity: done ? 0.55 : 1, transition: 'all .3s',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius:'50%',
                  background: done ? '#16A34A' : active ? PN.PINK : PN.BORDER,
                  display:'grid', placeItems:'center', flexShrink: 0,
                  color:'#fff', fontSize: 12, fontWeight: 800,
                }}>
                  {done ? '✓' : active ? <div style={{width: 6, height: 6, borderRadius:'50%', background:'#fff', animation:'aiPulse 1s ease-in-out infinite'}}/> : null}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize: 15, fontWeight: active ? 700 : 500, color: PN.TEXT}}>{t.label}</div>
                  {(done || active) && <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>{t.detail}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── AI Review panel ─────────────────────────────────────────────────────────
function AIReviewPanel({ extracted, selected, onToggle, menuName, setMenuName }) {
  return (
    <div>
      {/* Nome menù */}
      <div style={{padding:'18px 22px', borderBottom: `1px solid ${PN.BORDER_SOFT}`, background: '#FAFBFC'}}>
        <div style={{fontSize: 13, color: PN.MUTED, fontWeight: 700, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>Nome del nuovo menù</div>
        <input value={menuName} onChange={e => setMenuName(e.target.value)} style={{
          width:'100%', padding: '10px 12px', border: `1px solid ${PN.BORDER}`, borderRadius: 8,
          fontSize: 17, fontFamily:'inherit', fontWeight: 700, color: PN.TEXT, outline:'none', background: PN.WHITE,
        }}/>
      </div>

      {/* Categorie */}
      {extracted.categories.map(cat => {
        const sel = selected[cat.name] || new Set();
        return (
          <div key={cat.name}>
            <div style={{
              padding: '12px 22px', background: '#F4F5F7',
              borderBottom: `1px solid ${PN.BORDER_SOFT}`,
              fontSize: 13, fontWeight: 800, color: PN.TEXT, letterSpacing: 0.5, textTransform:'uppercase',
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <span>{cat.name}</span>
              <span style={{fontSize: 13, fontWeight: 700, color: PN.MUTED}}>{sel.size} di {cat.dishes.length}</span>
            </div>
            {cat.dishes.map(d => {
              const on = sel.has(d.id);
              return (
                <div key={d.id} onClick={() => onToggle(cat.name, d.id)} style={{
                  display:'flex', alignItems:'center', gap: 12, padding:'12px 22px',
                  cursor:'pointer', background: on ? '#fff' : '#FAFBFC',
                  borderBottom: `1px solid ${PN.BORDER_SOFT}`, opacity: on ? 1 : 0.5,
                }}>
                  <input type="checkbox" checked={on} readOnly style={{accentColor: PN.PINK, pointerEvents:'none'}}/>
                  <div style={{flex:1, minWidth: 0}}>
                    <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, marginBottom: 2}}>{d.name}</div>
                    {d.desc && <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.4, marginBottom: 4}}>{d.desc}</div>}
                    {d.allergens && d.allergens.length > 0 && (
                      <div style={{display:'flex', gap: 4, flexWrap:'wrap'}}>
                        {d.allergens.map(a => (
                          <span key={a} style={{
                            fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 3,
                            background: '#FEF2E0', color: '#92400E', textTransform:'uppercase', letterSpacing: 0.4,
                          }}>{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 800, color: PN.TEXT, fontVariantNumeric:'tabular-nums',
                  }}>€ {d.price?.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Mock data: cosa l'AI ha "estratto" dal menu ─────────────────────────────
const MOCK_EXTRACTED = {
  menuName: 'Menù Pranzo',
  categories: [
    {
      name: 'Antipasti',
      dishes: [
        { id: 'ai-bruschette', name: 'Bruschette miste', desc: 'Pomodorini, olive taggiasche, paté di funghi', allergens: ['glutine'], price: 8.00, kcal: 240 },
        { id: 'ai-tagliere', name: 'Tagliere di salumi e formaggi', desc: 'Selezione di salumi DOP, formaggi e mostarda', allergens: ['latte'], price: 14.00, kcal: 480 },
        { id: 'ai-burrata', name: 'Burrata pugliese con pomodorini', desc: 'Burrata fresca, pomodorini confit, basilico', allergens: ['latte'], price: 12.00, kcal: 320 },
      ],
    },
    {
      name: 'Primi',
      dishes: [
        { id: 'ai-carbonara', name: 'Spaghetti alla carbonara', desc: 'Guanciale croccante, pecorino, uovo', allergens: ['glutine','uova','latte'], price: 13.00, kcal: 720 },
        { id: 'ai-cacio', name: 'Tonnarelli cacio e pepe', desc: 'Pasta fresca, pecorino romano DOP', allergens: ['glutine','latte'], price: 13.00, kcal: 680 },
        { id: 'ai-amatriciana', name: 'Bucatini all\'amatriciana', desc: 'Guanciale, pomodoro, pecorino', allergens: ['glutine','latte'], price: 13.00, kcal: 700 },
        { id: 'ai-gricia', name: 'Rigatoni alla gricia', desc: 'Guanciale e pecorino, senza pomodoro', allergens: ['glutine','latte'], price: 12.00, kcal: 660 },
      ],
    },
    {
      name: 'Secondi',
      dishes: [
        { id: 'ai-saltimbocca', name: 'Saltimbocca alla romana', desc: 'Vitello, prosciutto crudo, salvia, vino bianco', allergens: [], price: 18.00, kcal: 520 },
        { id: 'ai-coda', name: 'Coda alla vaccinara', desc: 'Coda di bue brasata lentamente in sugo di pomodoro', allergens: ['sedano'], price: 19.00, kcal: 640 },
        { id: 'ai-baccala', name: 'Baccalà in guazzetto', desc: 'Baccalà mantecato con olive e pomodorini', allergens: ['pesce'], price: 17.00, kcal: 420 },
      ],
    },
    {
      name: 'Dolci',
      dishes: [
        { id: 'ai-tiramisu', name: 'Tiramisù della casa', desc: 'Ricetta tradizionale con savoiardi e mascarpone', allergens: ['glutine','uova','latte'], price: 7.00, kcal: 380 },
        { id: 'ai-panna', name: 'Panna cotta ai frutti di bosco', desc: 'Panna cotta classica con coulis di frutti rossi', allergens: ['latte'], price: 6.50, kcal: 320 },
        { id: 'ai-cannoli', name: 'Cannoli siciliani', desc: 'Ricotta fresca, scorza d\'arancia candita, pistacchi', allergens: ['glutine','latte','frutta a guscio'], price: 7.00, kcal: 410 },
        { id: 'ai-cassata', name: 'Cassata al forno', desc: 'Pasta frolla, ricotta, canditi, cioccolato', allergens: ['glutine','latte','uova'], price: 7.50, kcal: 460 },
      ],
    },
  ],
};
