// Impostazioni → Menù e cucina (rifatto: piatti per categoria, allergeni icone, filtri chip)

const ALLERGENS = [
  { id: 'glutine', name: 'Glutine', icon: '🌾', color: '#D97706' },
  { id: 'latte', name: 'Latte', icon: '🥛', color: '#0EA5E9' },
  { id: 'uova', name: 'Uova', icon: '🥚', color: '#F59E0B' },
  { id: 'pesce', name: 'Pesce', icon: '🐟', color: '#0891B2' },
  { id: 'crostacei', name: 'Crostacei', icon: '🦐', color: '#EA580C' },
  { id: 'frutta-guscio', name: 'Frutta a guscio', icon: '🥜', color: '#92400E' },
  { id: 'arachidi', name: 'Arachidi', icon: '🥜', color: '#A16207' },
  { id: 'soia', name: 'Soia', icon: '🌱', color: '#65A30D' },
  { id: 'sedano', name: 'Sedano', icon: '🥬', color: '#16A34A' },
  { id: 'senape', name: 'Senape', icon: '🌾', color: '#CA8A04' },
  { id: 'sesamo', name: 'Sesamo', icon: '🌰', color: '#78350F' },
  { id: 'solfiti', name: 'Solfiti', icon: '🍷', color: '#7C2D12' },
];

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
    { id: 'menu', label: 'Menù & piatti' },
    { id: 'ingredienti', label: 'Ingredienti' },
  ];

  return (
    <div>
      <ImpSubTabs tabs={subs} active={sub} onChange={setSub}/>
      {sub === 'menu' && <MCMenuComposer/>}
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

const CAT_EMOJI = { 'Antipasti':'🥗', 'Primi':'🍝', 'Secondi':'🥩', 'Contorni':'🥦', 'Dolci':'🍰', 'Bevande':'🥤' };

// Mapping categoria → icona SF Regular Filled (registry SfIcons).
// Usata in header categoria + chip selector. Fallback `food-meal` per categorie
// custom create dall'utente (es. "Burger" → meal generico).
const CAT_ICON = {
  'Antipasti': 'food-salad',
  'Primi':     'food-pasta',
  'Secondi':   'food-steak',
  'Contorni':  'food-vegetables',
  'Dolci':     'food-dessert',
  'Bevande':   'drink-juice',
  'Pizze':     'food-pizza',
  'Pizza':     'food-pizza',
  'Hamburger': 'food-hamburger',
  'Burger':    'food-hamburger',
  'Sushi':     'food-sushi',
  'Insalate':  'food-salad',
  'Zuppe':     'food-soup',
  'Frutta':    'food-vegetables',
  'Gelati':    'food-ice-cream',
  'Caffetteria':'drink-coffee',
  'Caffè':     'drink-coffee',
  'Tè':        'drink-tea',
  'Cocktail':  'drink-cocktail',
  'Vini':      'drink-wine',
  'Birre':     'drink-beer',
  'Champagne': 'drink-champagne',
  'Acqua':     'drink-water-bottle',
};
const catIcon = (name) => CAT_ICON[name] || 'food-meal';

// Euristica: deriva l'icona food/drink dal NOME del piatto (case-insensitive).
// Se non matcha nessun pattern, fallback alla icona della sua categoria.
// Non perfetta — pensata per dare ritmo visivo alla lista, non per essere semantica.
function dishIcon(dish) {
  if (!dish) return 'food-meal';
  if (dish.icon) return dish.icon;
  const n = (dish.name || '').toLowerCase();

  // ── Drinks (controllo prima per evitare match generici come "tè") ──
  if (/cocktail|spritz|negroni|mojito|margarita|martini|gin\b|tonic|aperol|campari|whisk|rum\b|vodka|tequila|bellini|kir/.test(n)) return 'drink-cocktail';
  if (/prosecco|champagne|spumant/.test(n)) return 'drink-champagne';
  if (/vino|barolo|chianti|brunello|merlot|cabernet|sangiovese|nebbiolo|primitivo|montepulciano|valpolicella|barbera/.test(n)) return 'drink-wine';
  if (/birra|beer|lager|ipa\b|pils|stout|weiss|weizen|porter|ale\b/.test(n)) return 'drink-beer';
  if (/caff[èe]|cappuccino|espresso|moka|americano|caffelatte|macchiato|ristretto/.test(n)) return 'drink-coffee';
  if (/^t[èe]\b|thè|chai|matcha|tisana|infuso/.test(n)) return 'drink-tea';
  if (/acqua|naturale|frizzante|gassat/.test(n)) return 'drink-water-bottle';
  if (/milkshake|frapp|smoothie|frullato/.test(n)) return 'drink-milkshake';
  if (/coca|cola|fanta|sprite|chinotto|cedrata|aranciat|gazos|spuma|succo|spremut|limonata/.test(n)) return 'drink-juice';

  // ── Food (specifico → generico) ──
  if (/pizza|margherita|capricciosa|diavola|quattro stagioni|marinara|napoletana/.test(n)) return 'food-pizza';
  if (/hamburger|cheeseburger|burger\b/.test(n)) return 'food-hamburger';
  if (/panino|sandwich|toast|club\b|tramezzino|piadina/.test(n)) return 'food-sandwich';
  if (/taco|burrito|fajita|quesadilla|nachos/.test(n)) return 'food-taco';
  if (/sushi|nigiri|sashimi|maki|temaki|uramaki|ramen|udon|yakisoba/.test(n)) return 'food-sushi';
  if (/zuppa|minestra|brodo|crema |vellutata|passat/.test(n)) return 'food-soup';
  if (/gelato|sorbetto|granita|semifredd|stracciatella/.test(n)) return 'food-ice-cream';
  if (/tiramis|panna cotta|torta|cheesecake|crostata|mousse|tartufo|profiterol|crepe|cr[êe]p|brul[ée]|cannol|babà|sfogliat/.test(n)) return 'food-dessert';
  if (/carbonara|amatriciana|cacio e pepe|pasta|spaghett|lasagn|gnocch|tagliatell|tonnarell|bucatin|risott|paella|raviol|tortellin|fettuccin|penne|fusilli|orecchiett|cannellon/.test(n)) return 'food-pasta';
  if (/bistecca|tagliata|filetto|controfiletto|costata|fiorentin|hamburger|scaloppin|cotolett|arrost|maial|vitell|pollo|guancia|brasato|stinco|salsiccia|tartare di carne/.test(n)) return 'food-steak';
  if (/salmone|tonno|orata|branzino|merluzz|gambero|seppia|polpo|calamar|vongol|cozz|sgombr|pesc[eo]|tartare di tonno|tartare di sal/.test(n)) return 'food-seafood';
  if (/insalata|bruschetta|caprese|carpaccio|tartare(?! di)|burrata|tagliere|caprino/.test(n)) return 'food-salad';
  if (/verdur|patat|spinac|broccol|melanzan|zucchin|carota|fungh|grigliat|asparagi|carciof|peperon/.test(n)) return 'food-vegetables';

  // Fallback per categoria
  return catIcon(dish.cat);
}

// Ogni MENÙ ha le proprie categorie, e in ogni categoria i piatti hanno PREZZO e ATTIVO/DISATTIVATO per quel menù.
const MENUS_INIT = [
  { id:'pranzo', name:'Menù pranzo', active:true, schedule:'Lun–Ven · 12:00–15:00', categories: [
      { name:'Antipasti', items:[ {dishId:'a1', price:6.50, active:true} ] },
      { name:'Primi',     items:[ {dishId:'p1', price:13.00, active:true}, {dishId:'p2', price:12.00, active:true}, {dishId:'p3', price:13.00, active:true} ] },
      { name:'Dolci',     items:[ {dishId:'d1', price:6.50, active:true} ] },
  ]},
  { id:'cena', name:'Menù cena', active:true, schedule:'Tutti i giorni · 19:00–23:00', categories: [
      { name:'Antipasti', items:[ {dishId:'a1', price:7.00, active:true}, {dishId:'a2', price:12.00, active:true, highlight:true}, {dishId:'a3', price:15.00, active:false} ] },
      { name:'Primi',     items:[ {dishId:'p1', price:14.00, active:true, highlight:true}, {dishId:'p2', price:13.00, active:true}, {dishId:'p3', price:14.00, active:true} ] },
      { name:'Secondi',   items:[ {dishId:'s1', price:22.00, active:true, highlight:true}, {dishId:'s2', price:24.00, active:true, isNew:true} ] },
      { name:'Dolci',     items:[ {dishId:'d1', price:7.00, active:true}, {dishId:'d2', price:6.50, active:true, isNew:true} ] },
  ]},
  { id:'bambini', name:'Menù bambini', active:true, schedule:'Sempre disponibile · €12 fisso', categories: [
      { name:'Primi', items:[ {dishId:'p2', price:8.00, active:true}, {dishId:'p3', price:8.00, active:true} ] },
      { name:'Dolci', items:[ {dishId:'d2', price:4.00, active:true} ] },
  ]},
  { id:'estivo', name:'Menù estivo', active:false, schedule:'Da Giugno a Settembre', categories: [] },
];

function MCMenuComposer() {
  const [library, setLibrary] = React.useState(DISH_LIBRARY);
  const [menus, setMenus] = React.useState(MENUS_INIT);
  const [activeMenuId, setActiveMenuId] = React.useState('pranzo');
  const [view, setView] = React.useState('compose'); // compose | library
  const [creatingMenu, setCreatingMenu] = React.useState(false);
  const [newMenuName, setNewMenuName] = React.useState('');
  const [settingsMenuId, setSettingsMenuId] = React.useState(null);
  const [aiUpload, setAiUpload] = React.useState(false);
  const [libraryFilters, setLibraryFilters] = React.useState({ category: 'all', allergens: [], unused: false });
  const activeMenu = menus.find(m => m.id === activeMenuId);

  const createMenu = () => {
    if (!newMenuName.trim()) return;
    const id = 'm' + Date.now();
    setMenus(prev => [...prev, { id, name: newMenuName.trim(), active: true, categories: [] }]);
    setActiveMenuId(id); setView('compose');
    setNewMenuName(''); setCreatingMenu(false);
  };
  const updateMenu = (id, patch) => setMenus(prev => prev.map(m => m.id === id ? {...m, ...patch} : m));
  const deleteMenu = (id) => {
    setMenus(prev => prev.filter(m => m.id !== id));
    if (activeMenuId === id) {
      const remaining = menus.filter(m => m.id !== id);
      if (remaining.length) setActiveMenuId(remaining[0].id);
    }
    setSettingsMenuId(null);
  };
  const duplicateMenu = (id) => {
    const src = menus.find(m => m.id === id); if (!src) return;
    const newId = 'm' + Date.now();
    setMenus(prev => [...prev, { ...src, id: newId, name: src.name + ' (copia)', active: false }]);
    setSettingsMenuId(null); setActiveMenuId(newId);
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
        {/* Tab switcher: Menù / Libreria piatti — Apple segmented control style.
            Pillola di selezione che SCORRE fra le 2 posizioni con cubic-bezier
            spring (no jump). La box dietro è il "track" con inset shadow soft. */}
        <div style={{
          position: 'relative',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          padding: 3, background: PN.WHITE_FROST,
          borderRadius: 9,
          marginBottom: 12,
          boxShadow: 'inset 0 1px 1px rgba(15, 17, 21, 0.04)',
        }}>
          {/* Slider pill — animata con left/transition fluida */}
          <span style={{
            position: 'absolute',
            top: 3, left: view === 'compose' ? 3 : 'calc(50% + 0px)',
            width: 'calc(50% - 3px)', height: 'calc(100% - 6px)',
            background: PN.WHITE,
            borderRadius: 7,
            boxShadow: '0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 1px 2px rgba(15, 17, 21, 0.08), 0 0 0 0.5px rgba(15, 17, 21, 0.04)',
            transition: 'left 280ms cubic-bezier(0.32, 0.72, 0, 1)',
            pointerEvents: 'none',
          }}/>
          {[
            { id: 'compose', label: 'Menù' },
            { id: 'library', label: 'Libreria piatti' },
          ].map(t => {
            const on = view === t.id;
            return (
              <button key={t.id} onClick={() => setView(t.id)} style={{
                position: 'relative', zIndex: 1,
                padding: '8px 10px', border: 'none',
                background: 'transparent',
                color: on ? PN.TEXT : PN.MUTED,
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'color 200ms ease-out',
                borderRadius: 7,
              }}>{t.label}</button>
            );
          })}
        </div>

        {view === 'compose' && (
          <>
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
                  const isOpen = m.id === activeMenuId;
                  return (
                    <div key={m.id} onClick={() => setActiveMenuId(m.id)} style={{
                      position:'relative',
                      padding: '12px 14px',
                      border: `1.5px solid ${isOpen ? PN.PINK : PN.BORDER_SOFT}`,
                      background: isOpen ? PN.PINK_SOFT : PN.WHITE,
                      borderRadius: 10, cursor:'pointer',
                      transition:'border-color 0.15s, background 0.15s',
                    }}>
                      <div style={{display:'flex', alignItems:'center', gap: 6, marginBottom: 4}}>
                        <span style={{fontSize:13.5, fontWeight:700, flex:1, color: isOpen ? PN.PINK_DARK : PN.TEXT}}>{m.name}</span>
                        <span style={{
                          fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5,
                          padding:'2px 7px', borderRadius: 4,
                          background: m.active ? PN.GREEN_SOFT : '#EEF0F3',
                          color: m.active ? PN.GREEN : PN.MUTED,
                        }}>{m.active ? 'ATTIVO' : 'INATTIVO'}</span>
                      </div>
                      <div style={{fontSize:11.5, color:PN.MUTED, lineHeight: 1.4}}>
                        {totalDishesIn(m)} {totalDishesIn(m) === 1 ? 'piatto' : 'piatti'}
                      </div>
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
                      style={{padding:'7px 10px', border:`1px solid ${PN.BORDER}`, borderRadius:6, fontSize:13, fontFamily:'inherit', outline:'none', fontWeight:600}}/>
                    <div style={{display:'flex', gap: 6, justifyContent:'flex-end'}}>
                      <button onClick={() => { setCreatingMenu(false); setNewMenuName(''); }} style={{padding:'5px 10px', background:'transparent', border:'none', color: PN.MUTED, fontSize:12, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
                      <button onClick={createMenu} disabled={!newMenuName.trim()} style={{padding:'5px 12px', background: newMenuName.trim() ? PN.PINK : '#E5E7EB', color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:700, cursor: newMenuName.trim()?'pointer':'default', fontFamily:'inherit'}}>Crea</button>
                    </div>
                  </div>
                )}
              </div>
            </ImpCard>

            {/* AI shortcut — magenta brand vivace, shimmer permanente, sparkle pulse */}
            <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6}}>
              <AiUploadCta onClick={() => setAiUpload(true)}/>
              <div style={{fontSize: 11, color: PN.MUTED, textAlign: 'center', lineHeight: 1.45, marginTop: 2}}>
                L'AI estrae piatti, prezzi, allergeni
              </div>
            </div>
          </>
        )}

        {view === 'library' && (
          <LibrarySidebar library={library} menus={menus} filters={libraryFilters} setFilters={setLibraryFilters}/>
        )}
      </aside>

      {/* Main */}
      <main>
        {view === 'compose' && activeMenu && (
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
            onSwitchToLibrary={() => setView('library')}
            setSettingsMenuId={setSettingsMenuId}
            activeMenuId={activeMenuId}
          />
        )}
        {view === 'library' && (
          <DishLibraryView
            library={library}
            menus={menus}
            filters={libraryFilters}
            onUpsertLibraryDish={upsertLibraryDish}
            onRemoveLibraryDish={removeLibraryDish}
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
            setView('compose');
            setAiUpload(false);
          }}
        />
      )}
      {settingsMenuId && (
        <MenuSettingsPanel
          menu={menus.find(m => m.id === settingsMenuId)}
          onClose={() => setSettingsMenuId(null)}
          onUpdate={(patch) => updateMenu(settingsMenuId, patch)}
          onDuplicate={() => duplicateMenu(settingsMenuId)}
          onDelete={() => deleteMenu(settingsMenuId)}
          canDelete={menus.length > 1}
        />
      )}
    </div>
  );
}

function MenuSettingsPanel({ menu, onClose, onUpdate, onDuplicate, onDelete, canDelete }) {
  if (!menu) return null;
  const [confirmDel, setConfirmDel] = React.useState(false);
  return (
    <div onClick={onClose} style={{
      position:'absolute', inset:0, background:'rgba(0,0,0,0.32)', zIndex: 1000,
      display:'flex', justifyContent:'flex-end', animation:'fadeIn .15s ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 420, maxWidth:'94vw', height:'100vh', background: PN.WHITE,
        boxShadow:'-8px 0 32px rgba(0,0,0,0.12)', overflowY:'auto',
        animation:'slideInRight .22s ease-out',
      }}>
        <div style={{padding:'18px 22px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', gap: 10}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 11, color: PN.MUTED, fontWeight: 700, letterSpacing: 0.4, textTransform:'uppercase'}}>Impostazioni menù</div>
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>{menu.name}</div>
          </div>
          <button onClick={onClose} style={{width:30, height:30, border:'none', background:'transparent', color: PN.MUTED, fontSize: 18, cursor:'pointer'}}>✕</button>
        </div>
        <div style={{padding: 22, display:'flex', flexDirection:'column', gap: 18}}>
          <ImpField label="Nome menù">
            <input value={menu.name} onChange={e => onUpdate({name: e.target.value})} style={{
              width:'100%', padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', outline:'none',
            }}/>
          </ImpField>
          <div style={{padding:'12px 14px', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, display:'flex', alignItems:'center', gap: 12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13, fontWeight:700, color: PN.TEXT}}>Menù attivo</div>
              <div style={{fontSize:11.5, color: PN.MUTED, marginTop:2}}>Visibile ai clienti quando rientra negli orari</div>
            </div>
            <label style={{position:'relative', width:42, height:24, cursor:'pointer'}}>
              <input type="checkbox" checked={menu.active} onChange={e => onUpdate({active: e.target.checked})} style={{opacity:0, position:'absolute', inset:0, cursor:'pointer'}}/>
              <span style={{position:'absolute', inset:0, background: menu.active ? PN.PINK : '#D1D5DB', borderRadius: 999, transition:'background .15s'}}/>
              <span style={{position:'absolute', top:2, left: menu.active ? 20 : 2, width:20, height:20, background:'#fff', borderRadius:'50%', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left .15s'}}/>
            </label>
          </div>
          <div style={{padding: 14, border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, background:'#FAFBFC'}}>
            <div style={{fontSize:13, fontWeight:700, color: PN.TEXT, marginBottom: 10}}>Azioni</div>
            <button onClick={onDuplicate} style={{
              width:'100%', padding:'9px 12px', border:`1px solid ${PN.BORDER_LIGHT}`, background: PN.WHITE,
              color: PN.TEXT, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit', marginBottom: 8, textAlign:'left',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <PnI.Copy size={14} color={PN.MUTED}/> Duplica menù
            </button>
          </div>
          {canDelete && (
            <div style={{padding: 14, border:`1px solid #FECACA`, borderRadius: 10, background:'#FEF2F2'}}>
              <div style={{fontSize:13, fontWeight:700, color:'#B91C1C', marginBottom: 4}}>⚠ Zona pericolosa</div>
              <div style={{fontSize:11.5, color:'#991B1B', marginBottom: 10, lineHeight:1.5}}>L'eliminazione del menù rimuove tutti i piatti che contiene (la libreria resta intatta).</div>
              {!confirmDel ? (
                <button onClick={() => setConfirmDel(true)} style={{
                  padding:'8px 14px', border:`1px solid #DC2626`, background:'#fff',
                  color:'#DC2626', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>Elimina menù</button>
              ) : (
                <div style={{display:'flex', gap:6}}>
                  <button onClick={() => setConfirmDel(false)} style={{padding:'8px 12px', border:`1px solid ${PN.BORDER}`, background: PN.WHITE, color: PN.TEXT, borderRadius: 8, fontSize: 12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
                  <button onClick={onDelete} style={{padding:'8px 14px', background:'#DC2626', color:'#fff', border:'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>Conferma elimina</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideInRight {from{transform:translateX(100%)} to{transform:translateX(0)}} @keyframes fadeIn {from{opacity:0} to{opacity:1}} @keyframes fadeInDown {from{opacity:0; transform:translateY(-6px)} to{opacity:1; transform:none}}`}</style>
    </div>
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
          <div style={{display: 'flex', gap: 8}}>
            {/* Settings — icon-only button. Niente copy "Impostazioni menù",
                niente gradient: il context dell'icona basta.
                Stile coerente con altri 36×36 icon buttons del gestionale. */}
            <button
              onClick={() => setSettingsMenuId(activeMenuId)}
              aria-label="Impostazioni menù"
              title="Impostazioni menù"
              style={{
                width: 36, height: 36, borderRadius: 9,
                background: PN.WHITE, color: PN.MUTED,
                border: `1px solid ${PN.BORDER_LIGHT}`,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'grid', placeItems: 'center',
                transition: 'background 150ms ease-out, color 150ms ease-out',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.TEXT; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = PN.WHITE;       e.currentTarget.style.color = PN.MUTED; }}
            >
              {/* Gear glyph SVG inline — 1.6 stroke, currentColor */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
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
              fontSize: 13, fontFamily:'inherit', outline:'none', background: PN.WHITE,
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
                border:'none', fontSize: 12, fontWeight: 600, fontFamily:'inherit',
                cursor:'pointer', display:'inline-flex', alignItems:'center', gap: 6,
              }}>
                {s.label}
                <span style={{fontSize: 10.5, padding:'1px 6px', borderRadius: 999, background: stateFilter===s.id ? 'rgba(255,255,255,0.2)' : '#EEF0F3'}}>{s.count}</span>
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
                  <span style={{fontSize: 12, color: PN.MUTED, transition:'transform .2s', transform: isCollapsed ? 'rotate(-90deg)' : 'none', display:'inline-block'}}>▼</span>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: PN.PINK_SOFT, color: PN.PINK_DARK,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <Icon name={catIcon(cat.name)} size={16}/>
                  </span>
                  <span style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>{cat.name}</span>
                  <span style={{fontSize: 12, color: PN.MUTED, fontWeight: 500}}>{visible.length} di {cat.rows.length}</span>
                </button>
                <button onClick={() => { if (confirm(`Rimuovere la categoria "${cat.name}" da questo menù? I piatti restano nella libreria.`)) onRemoveCategory(cat.name); }} title="Rimuovi categoria dal menù" style={{
                  background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer', fontSize: 13, padding: '4px 8px', borderRadius: 6,
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
                      onEdit={() => setEditingDish({dishId: r.dishId, catName: cat.name, isNew: false})}
                      onRemove={() => onRemoveDish(cat.name, r.dishId)}
                    />
                  ))}
                  {visible.length === 0 && cat.rows.length === 0 && (
                    <div style={{padding: '20px 18px', textAlign:'center', color: PN.MUTED, fontSize: 12.5, fontStyle:'italic'}}>Categoria vuota</div>
                  )}
                  {/* Bottone in fondo alla categoria */}
                  <div style={{padding: '12px 18px', borderTop: `1px dashed ${PN.BORDER_SOFT}`, background: '#FCFCFD'}}>
                    <button onClick={() => setPicker(cat.name)} style={{
                      width:'100%', padding:'9px 12px', borderRadius: 8,
                      border: `1.5px dashed ${PN.PINK}`, background: PN.PINK_SOFT,
                      color: PN.PINK_DARK, fontSize: 12.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                      display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
                    }}>+ Aggiungi piatto</button>
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
              flex: 1, padding: '8px 12px', border: `1px solid ${PN.BORDER}`, borderRadius: 7, fontSize: 13, fontFamily:'inherit', outline:'none',
            }}/>
            <button onClick={handleAddCategory} style={{padding:'8px 14px', borderRadius: 7, border:'none', background: PN.TEXT, color: PN.WHITE, fontSize: 12.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>Crea</button>
            <button onClick={() => { setAddingCat(false); setNewCatName(''); }} style={{padding:'8px 12px', borderRadius: 7, border:`1px solid ${PN.BORDER}`, background: PN.WHITE, color: PN.MUTED, fontSize: 12.5, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
          </div>
        ) : (
          <button onClick={() => setAddingCat(true)} style={{
            width:'100%', padding: '14px', borderRadius: 10,
            border: `1.5px dashed ${PN.BORDER}`, background:'#FAFBFC',
            color: PN.MUTED, fontSize: 13, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            marginBottom: 14,
          }}>+ Aggiungi nuova categoria a questo menù</button>
        )}

        {totalDishes === 0 && cats.length === 0 && (
          <div style={{
            padding: '40px 20px', textAlign:'center',
            background:'#FAFBFC', border: `1.5px dashed ${PN.BORDER}`, borderRadius: 12,
            color: PN.MUTED,
          }}>
            <div style={{display:'flex', justifyContent:'center', marginBottom: 10, color: PN.MUTED_LIGHT}}>
              <Icon name="food-meal" size={48}/>
            </div>
            <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Questo menù è vuoto</div>
            <div style={{fontSize: 12.5, marginBottom: 14}}>Crea una categoria per iniziare ad aggiungere piatti</div>
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
            // Se isNew o piatto nuovo: lo aggiungo anche alla categoria del menu corrente
            if (editingDish.isNew && editingDish.catName) {
              onAddDish(editingDish.catName, id, d._initialPrice ?? 0);
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
          onClose={() => setPicker(null)}
          onPick={(id, price) => { onAddDish(picker, id, price); }}
          onCreateNew={() => { const cat = picker; setPicker(null); setEditingDish({dishId: null, catName: cat, isNew: true}); }}
        />
      )}
    </div>
  );
}

// ─── Picker libreria: scegli uno o più piatti da aggiungere alla categoria ──
function DishLibraryPicker({ library, excludeIds, catName, onClose, onPick, onCreateNew }) {
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
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(20,20,20,0.45)', zIndex:1000, display:'grid', placeItems:'center', padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{background: PN.WHITE, borderRadius: 14, width: 640, maxWidth:'100%', maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,0.25)', overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom: `1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11, color:PN.MUTED, textTransform:'uppercase', letterSpacing:0.4, fontWeight:700}}>{catName}</div>
            <div style={{fontSize:16, fontWeight:700, color:PN.TEXT}}>Aggiungi piatti dalla libreria</div>
          </div>
          <button onClick={onClose} style={{width:30, height:30, borderRadius:7, border:'none', background:'#F4F5F7', cursor:'pointer', fontSize:16, color:PN.MUTED}}>✕</button>
        </div>
        <div style={{padding:'14px 22px', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:PN.MUTED, display: 'flex', alignItems: 'center'}}><PnI.Search size={13} color={PN.MUTED}/></span>
            <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca nella libreria…" style={{
              width:'100%', padding:'9px 12px 9px 34px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:13.5, fontFamily:'inherit', outline:'none',
            }}/>
          </div>
        </div>
        <div style={{flex:1, overflowY:'auto', padding: 0}}>
          {/* Sticky: crea nuovo piatto */}
          <div onClick={onCreateNew} style={{
            position:'sticky', top: 0, zIndex: 2,
            display:'flex', alignItems:'center', gap: 12, padding:'12px 22px', cursor:'pointer',
            background: PN.PINK_SOFT, borderBottom: `1.5px dashed ${PN.PINK}`,
          }}>
            <div style={{width: 28, height: 28, borderRadius: 7, background: PN.PINK, color: PN.WHITE, display:'grid', placeItems:'center', fontSize: 16, fontWeight: 700}}>+</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13.5, fontWeight:700, color: PN.PINK_DARK}}>Crea nuovo piatto</div>
              <div style={{fontSize:11.5, color: PN.PINK_DARK, opacity: 0.75}}>Non lo trovi in libreria? Crealo ora — verrà aggiunto subito a "{catName}"</div>
            </div>
            <span style={{fontSize: 14, color: PN.PINK_DARK}}>→</span>
          </div>
          {available.length === 0 && (
            <div style={{padding:'40px 22px', textAlign:'center', color:PN.MUTED, fontSize: 13}}>Nessun piatto in libreria che corrisponda alla ricerca.</div>
          )}
          {available.map(d => {
            const on = selected[d.id] !== undefined;
            return (
              <div key={d.id} onClick={() => togglePick(d.id)} style={{
                display:'flex', alignItems:'center', gap: 12, padding:'10px 22px', cursor:'pointer',
                background: on ? PN.PINK_SOFT : 'transparent',
                borderBottom: `1px solid ${PN.BORDER_SOFT}`,
              }}>
                <input type="checkbox" checked={on} readOnly style={{accentColor: PN.PINK, pointerEvents:'none'}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13.5, fontWeight:700, color:PN.TEXT}}>{d.name}</div>
                  <div style={{fontSize:11.5, color:PN.MUTED, lineHeight:1.4}}>{d.cat} · {d.desc?.slice(0,60)}{d.desc?.length>60?'…':''}</div>
                </div>
                {on && (
                  <div onClick={e => e.stopPropagation()} style={{display:'flex', alignItems:'center', gap:4, background:PN.WHITE, padding:'4px 8px', borderRadius:6, border:`1px solid ${PN.PINK}`}}>
                    <span style={{fontSize:12.5, color:PN.MUTED, fontWeight:700}}>€</span>
                    <input value={selected[d.id]} onChange={e => setPrice(d.id, e.target.value)} placeholder="0,00" style={{
                      width: 56, fontSize:13, fontWeight:700, color:PN.TEXT, border:'none', outline:'none', textAlign:'right', fontFamily:'inherit', background:'transparent',
                    }}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:12.5, color:PN.MUTED}}>{count > 0 ? `${count} piatt${count===1?'o':'i'} selezionat${count===1?'o':'i'}` : 'Seleziona uno o più piatti'}</div>
          <div style={{display:'flex', gap:8}}>
            <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
            <ImpButton variant="primary" onClick={confirm}>Aggiungi al menù</ImpButton>
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
      {title && <div style={{fontSize: 10.5, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.6, textTransform:'uppercase', marginBottom: 8}}>{title}</div>}
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
                fontSize: 10, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                textTransform:'uppercase', letterSpacing: 0.4,
              }}>{a.name}</button>
            );
          })}
        </div>
      </Section>

      <Section>
        <label style={{display:'flex', alignItems:'center', gap: 9, cursor:'pointer'}}>
          <input type="checkbox" checked={filters.unused} onChange={e => setFilters(f => ({...f, unused: e.target.checked}))} style={{accentColor: PN.PINK, margin: 0}}/>
          <span style={{flex:1, fontSize: 12.5, fontWeight: 600, color: PN.TEXT}}>Non in uso</span>
          <span style={{fontSize: 11, color: PN.MUTED, fontWeight: 700}}>{counts.unused}</span>
        </label>
        <div style={{fontSize: 11, color: PN.MUTED, lineHeight: 1.45, marginTop: 6}}>
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
      title="Libreria piatti"
      sub={`${filtered.length} di ${library.length} piatti · catalogo della cucina (senza prezzo né stato)`}
      action={
        <ImpButton variant="primary" icon={<PnI.Plus size={13}/>} onClick={() => setEditingDish({dishId: null, isNew: true, fromLibrary: true})}>Nuovo piatto</ImpButton>
      }
    >
      <div style={{position:'relative', marginBottom: 14}}>
        <span style={{position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)', color: PN.MUTED, display: 'flex', alignItems: 'center'}}><PnI.Search size={13} color={PN.MUTED}/></span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca tra tutti i piatti…" style={{
          width:'100%', padding: '10px 12px 10px 38px',
          border:`1px solid ${PN.BORDER}`, borderRadius: 9,
          fontSize: 13.5, fontFamily:'inherit', outline:'none',
        }}/>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 0}}>
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 240px 32px',
          gap: 14, padding: '8px 18px',
          fontSize: 10.5, fontWeight: 700, color: PN.MUTED,
          textTransform:'uppercase', letterSpacing: 0.5,
          borderBottom: `1px solid ${PN.BORDER_SOFT}`,
        }}>
          <div>Piatto</div>
          <div>Presente in</div>
          <div></div>
        </div>
        {filtered.map(d => {
          const inMenus = inMenusFor(d.id);
          return (
            <div key={d.id} style={{
              display:'grid', gridTemplateColumns:'1fr 240px 32px',
              gap: 14, alignItems:'center',
              padding:'12px 18px',
              borderBottom: `1px solid ${PN.BORDER_SOFT}`,
              background: PN.WHITE,
            }}>
              <div>
                <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 2}}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: PN.PINK_SOFT, color: PN.PINK_DARK,
                    display: 'inline-grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <Icon name={dishIcon(d)} size={13}/>
                  </span>
                  <span style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>{d.name}</span>
                  <span style={{fontSize: 11, color: PN.MUTED}}>· {d.cat}</span>
                </div>
                {d.desc && <div style={{fontSize:12, color:PN.MUTED, lineHeight: 1.4, marginBottom: 4}}>{d.desc}</div>}
                {d.allergens.length > 0 && (
                  <div style={{display:'flex', gap: 4, flexWrap:'wrap', marginTop: 3}}>
                    {d.allergens.slice(0,4).map(a => {
                      const al = ALLERGENS.find(x => x.id === a);
                      return (
                        <span key={a} style={{
                          fontSize: 9.5, color: PN.MUTED, background:'#F4F5F7',
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
                  <span style={{fontSize: 11, color: PN.MUTED, fontStyle:'italic'}}>In nessun menù</span>
                ) : (
                  inMenus.map(m => (
                    <span key={m.id} style={{
                      fontSize: 10.5, fontWeight: 600,
                      padding:'2px 7px', borderRadius: 4,
                      background: PN.PINK_SOFT, color: PN.PINK_DARK,
                    }}>{m.name.replace('Menù ','')}</span>
                  ))
                )}
              </div>
              <button onClick={() => setEditingDish({dishId: d.id, isNew: false, fromLibrary: true})} style={{
                width: 28, height: 28, borderRadius: 6, border:'none',
                background:'transparent', color: PN.MUTED, cursor:'pointer',
                display:'grid', placeItems:'center',
              }}><PnI.Edit size={13}/></button>
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
    <div style={{
      display:'grid', gridTemplateColumns: '20px 1fr auto auto auto auto',
      gap: 14, alignItems:'center',
      padding: '14px 18px',
      background: item.active ? PN.WHITE : '#FAFBFC',
      borderTop: `1px solid ${PN.BORDER_SOFT}`,
      opacity: item.active ? 1 : 0.7,
      transition: 'background .15s',
    }}>
      {/* Drag handle */}
      <div style={{color: PN.MUTED, cursor:'grab', fontSize: 14, lineHeight: 1, userSelect:'none'}}>≡</div>

      {/* Nome + descrizione + allergeni */}
      <div style={{minWidth: 0}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 3, flexWrap:'wrap'}}>
          <span style={{
            width: 22, height: 22, borderRadius: 6,
            background: PN.PINK_SOFT, color: PN.PINK_DARK,
            display: 'inline-grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon name={dishIcon(dish)} size={13}/>
          </span>
          <span style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>{dish.name}</span>
          {item.highlight && (
            <span style={{
              fontSize: 9.5, fontWeight: 800, letterSpacing: 0.4,
              padding:'2px 7px', borderRadius: 4,
              background: PN.PINK_SOFT, color: PN.PINK_DARK,
            }}>★ IN EVIDENZA</span>
          )}
          {item.isNew && (
            <span style={{
              fontSize: 9.5, fontWeight: 800, letterSpacing: 0.4,
              padding:'2px 7px', borderRadius: 4,
              background: PN.GREEN_SOFT, color: PN.GREEN,
            }}>NUOVO</span>
          )}
        </div>
        {dish.desc && (
          <div style={{fontSize: 12.5, color: PN.MUTED, lineHeight: 1.4, marginBottom: 6}}>{dish.desc}</div>
        )}
        {dish.allergens.length > 0 && (
          <div style={{display:'flex', gap: 4, flexWrap:'wrap'}}>
            {dish.allergens.map(a => {
              const al = ALLERGENS.find(x => x.id === a);
              return (
                <span key={a} style={{
                  fontSize: 9.5, color: PN.MUTED, background:'#F4F5F7',
                  padding:'2px 7px', borderRadius: 4,
                  textTransform:'uppercase', letterSpacing: 0.5, fontWeight: 700,
                }}>{al?.name || a}</span>
              );
            })}
          </div>
        )}
      </div>

      {/* Prezzo (inline-edit) */}
      <div onClick={!editingPrice ? onPriceClick : undefined} style={{
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
            <span style={{fontSize: 14, fontWeight: 700, color: PN.MUTED}}>€</span>
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
                width: 60, fontSize: 14, fontWeight: 700, color: PN.TEXT,
                border:'none', outline:'none', textAlign:'right',
                fontFamily:'inherit', background: 'transparent',
              }}
            />
          </div>
        ) : (
          <span style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>€ {item.price.toFixed(2).replace('.',',')}</span>
        )}
      </div>

      {/* Toggle attivo/disattivato */}
      <button onClick={onToggleActive} title={item.active ? 'Attivo (clicca per disattivare)' : 'Disattivato (clicca per riattivare)'} style={{
        display:'inline-flex', alignItems:'center', gap: 6,
        padding:'5px 11px', borderRadius: 999,
        border: `1.5px solid ${item.active ? PN.GREEN : '#D1D5DB'}`,
        background: item.active ? PN.GREEN_SOFT : '#F4F5F7',
        color: item.active ? PN.GREEN : PN.MUTED,
        fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
        cursor:'pointer', fontFamily:'inherit',
        textTransform:'uppercase',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius:'50%',
          background: item.active ? PN.GREEN : PN.MUTED,
        }}/>
        {item.active ? 'Attivo' : 'Disattivato'}
      </button>

      {/* Edit pencil */}
      <button onClick={onEdit} title="Modifica piatto" style={{
        width: 30, height: 30, borderRadius: 7,
        border:'none', background:'transparent', color: PN.MUTED,
        cursor:'pointer', display:'grid', placeItems:'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.color = PN.TEXT; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
      ><PnI.Edit size={13}/></button>

      {/* Rimuovi dal menù */}
      <button onClick={onRemove} title="Rimuovi dal menù (resta nella libreria)" style={{
        width: 30, height: 30, borderRadius: 7,
        border:'none', background:'transparent', color: PN.MUTED,
        cursor:'pointer', display:'grid', placeItems:'center', fontSize: 14,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = PN.RED_SOFT; e.currentTarget.style.color = PN.RED; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
      >✕</button>
    </div>
  );
}

// ─── Allergen multi-picker ────────────────────────────────────────────────────
function AllergenMultiPicker({ selected, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const toggle = id => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else onChange([...selected, id]);
  };
  return (
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={() => setOpen(o => !o)} style={{
        padding:'7px 12px', borderRadius: 8,
        border: `1px solid ${selected.length > 0 ? PN.PINK : PN.BORDER}`,
        background: selected.length > 0 ? PN.PINK_SOFT : PN.WHITE,
        color: selected.length > 0 ? PN.PINK_DARK : PN.TEXT,
        fontSize: 12.5, fontWeight: 600, fontFamily:'inherit',
        cursor:'pointer', display:'inline-flex', alignItems:'center', gap: 6,
      }}>
        <span>Senza allergeni</span>
        {selected.length > 0 && (
          <span style={{
            fontSize: 10.5, padding:'1px 6px', borderRadius: 999,
            background: PN.PINK, color: PN.WHITE, fontWeight: 700,
          }}>{selected.length}</span>
        )}
        <span style={{fontSize: 10}}>▾</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 30,
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
          borderRadius: 10, boxShadow:'0 12px 32px rgba(0,0,0,0.12)',
          padding: 8, minWidth: 240,
        }}>
          <div style={{fontSize: 11, fontWeight: 700, color: PN.MUTED, padding:'6px 8px', textTransform:'uppercase', letterSpacing: 0.4}}>Filtra escludendo</div>
          {ALLERGENS.map(a => {
            const on = selected.includes(a.id);
            return (
              <button key={a.id} onClick={() => toggle(a.id)} style={{
                display:'flex', alignItems:'center', gap: 9, width:'100%',
                padding:'7px 8px', background: on ? PN.PINK_SOFT : 'transparent',
                border:'none', borderRadius: 6, fontSize: 13, color: PN.TEXT,
                cursor:'pointer', fontFamily:'inherit', textAlign:'left',
              }}>
                <input type="checkbox" checked={on} readOnly style={{accentColor: PN.PINK, pointerEvents:'none'}}/>
                <AllergenIcon id={a.id} size={16}/>
                <span style={{flex: 1}}>{a.name}</span>
              </button>
            );
          })}
          {selected.length > 0 && (
            <button onClick={() => onChange([])} style={{
              width:'100%', padding:'7px 8px', marginTop: 4,
              background:'transparent', border:`1px solid ${PN.BORDER}`,
              borderRadius: 6, fontSize: 12, color: PN.MUTED,
              cursor:'pointer', fontFamily:'inherit',
            }}>Pulisci filtri</button>
          )}
        </div>
      )}
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
        <span style={{fontSize: 14}}>✨</span>
        <div style={{flex:1, fontSize:12, color: PN.GREEN, fontWeight:600, lineHeight:1.4}}>
          Stimati dall'AI in base agli ingredienti. Modifica i valori se serve, oppure rigenera.
        </div>
        <button onClick={regenerate} disabled={regenerating} style={{
          background: PN.WHITE, color: PN.GREEN, border:`1px solid ${PN.GREEN}`,
          padding:'6px 10px', borderRadius:6, fontSize:11.5, fontWeight:700,
          cursor: regenerating ? 'default' : 'pointer', fontFamily:'inherit',
          whiteSpace:'nowrap', opacity: regenerating ? 0.7 : 1,
        }}>{regenerating ? 'Calcolo…' : '↻ Rigenera'}</button>
      </div>
      <div style={{fontSize:11, fontWeight:700, color:PN.MUTED, letterSpacing:0.3, textTransform:'uppercase', marginBottom:8}}>Per porzione</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8}}>
        {[{l:'Kcal', k:'kcal'},{l:'Carb. (g)', k:'carb'},{l:'Proteine (g)', k:'prot'},{l:'Grassi (g)', k:'fat'}].map(f => (
          <div key={f.k}>
            <input value={values[f.k]} onChange={e => setValues(v => ({...v, [f.k]: e.target.value}))} type="number" style={{
              width:'100%', padding:'10px 8px', border:`1px solid ${PN.BORDER}`,
              borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none',
              textAlign:'center', fontWeight:700, color: PN.TEXT,
            }}/>
            <div style={{fontSize:10.5, color:PN.MUTED, textAlign:'center', marginTop:4, fontWeight:600}}>{f.l}</div>
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
          fontSize: 14, fontWeight: 700, flexShrink:0,
        }}>{icon}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13.5, fontWeight:700, color: PN.TEXT}}>{title}</div>
          <div style={{fontSize:11.5, color: PN.MUTED, marginTop:1}}>{subtitle}</div>
        </div>
        <span style={{transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition:'transform .2s', color: PN.MUTED, fontSize: 12}}>▼</span>
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
  const [allergenOpenIdx, setAllergenOpenIdx] = React.useState(null);
  const [db, setDb] = React.useState(() => window.getIngredientDB());
  React.useEffect(() => window.subscribeIngredientDB(() => setDb([...window.getIngredientDB()])), []);

  const usedNames = new Set(ingredients.map(i => i.name.toLowerCase()));
  const dbMatches = db
    .filter(d => !usedNames.has(d.name.toLowerCase()))
    .filter(d => !query || d.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);
  const exactMatch = query.trim() && db.some(d => d.name.toLowerCase() === query.trim().toLowerCase());

  const addExisting = (dbItem) => {
    setIngredients(arr => [...arr, { name: dbItem.name, removable: false, allergens: [...(dbItem.allergens || [])] }]);
    setQuery('');
    setShowSuggest(false);
  };
  const addNew = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const found = window.findIngredient(trimmed);
    if (found) { addExisting(found); return; }
    window.upsertIngredient(trimmed, []);
    setIngredients(arr => [...arr, { name: trimmed, removable: false, allergens: [] }]);
    setQuery('');
    setShowSuggest(false);
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
      <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom: ingredients.length ? 12 : 0}}>
        {ingredients.map((ing, i) => {
          const ingAllergens = ing.allergens || [];
          const popOpen = allergenOpenIdx === i;
          return (
            <div key={i} style={{background:'#FAFBFC', borderRadius:8, position:'relative'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:10, alignItems:'center', padding:'8px 10px 8px 12px'}}>
                <div style={{minWidth:0, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                  <span style={{fontSize:13, color: PN.TEXT, fontWeight:600}}>{ing.name}</span>
                  {ingAllergens.map(aid => {
                    const al = window.ALLERGENS.find(x => x.id === aid);
                    if (!al) return null;
                    return (
                      <span key={aid} title={al.name} style={{display:'inline-flex', alignItems:'center', gap:3, padding:'2px 7px', borderRadius:999, background:'#fff', border:`1px solid ${PN.BORDER}`, fontSize:10.5, color: PN.TEXT, fontWeight:600}}>
                        <window.AllergenIcon id={aid} size={11}/>
                        {al.name}
                      </span>
                    );
                  })}
                </div>
                <button onClick={() => setAllergenOpenIdx(popOpen ? null : i)} style={{display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', background: popOpen ? PN.PINK : (ingAllergens.length ? '#FFF1F4' : '#fff'), color: popOpen ? '#fff' : (ingAllergens.length ? PN.PINK_DARK : PN.MUTED), border:`1px solid ${popOpen ? PN.PINK : (ingAllergens.length ? PN.PINK : PN.BORDER)}`, borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap'}}>
                  <span style={{fontSize:12, lineHeight:1}}>⚠</span>
                  {ingAllergens.length > 0 ? `${ingAllergens.length}` : 'Allergeni'}
                </button>
                <label style={{display:'flex', alignItems:'center', gap:6, fontSize:11.5, color: ing.removable ? PN.PINK_DARK : PN.MUTED, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap'}}>
                  <input type="checkbox" checked={ing.removable} onChange={() => setIngredients(arr => arr.map((x, idx) => idx===i ? {...x, removable: !x.removable} : x))} style={{margin:0, accentColor: PN.PINK}}/>
                  Cliente può togliere
                </label>
                <button onClick={() => setIngredients(arr => arr.filter((_, idx) => idx !== i))} style={{width:26, height:26, background:'transparent', border:'none', borderRadius:6, cursor:'pointer', color: PN.MUTED, display:'grid', placeItems:'center', fontSize:13}}>✕</button>
              </div>
              {popOpen && (
                <div style={{position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:`1px solid ${PN.BORDER}`, borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,0.14)', zIndex:30, padding:14}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
                    <div style={{fontSize:11, fontWeight:700, color: PN.MUTED, letterSpacing:0.4, textTransform:'uppercase'}}>Allergeni di "{ing.name}"</div>
                    <button onClick={() => setAllergenOpenIdx(null)} style={{background:'transparent', border:'none', cursor:'pointer', color: PN.MUTED, fontSize:14, padding:0, lineHeight:1}}>✕</button>
                  </div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                    {window.ALLERGENS.map(a => {
                      const on = ingAllergens.includes(a.id);
                      return (
                        <button key={a.id} onClick={() => toggleIngAllergen(i, a.id)} style={{
                          display:'inline-flex', alignItems:'center', gap:5,
                          padding:'5px 10px', borderRadius:999,
                          border:`1px solid ${on ? PN.PINK : PN.BORDER}`,
                          background: on ? '#FFF1F4' : '#fff',
                          color: on ? PN.PINK_DARK : PN.TEXT,
                          fontSize:11.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                        }}>
                          <window.AllergenIcon id={a.id} size={12}/>
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{fontSize:10.5, color: PN.MUTED, marginTop:10, lineHeight:1.45, paddingTop:10, borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
                    Gli allergeni del piatto si aggiornano automaticamente. Il tuo archivio ingredienti memorizza queste informazioni per riusarle in altri piatti.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{position:'relative'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:8, background:'#fff'}}>
          <span style={{color: PN.MUTED, display: 'flex', alignItems: 'center'}}><PnI.Search size={12} color={PN.MUTED}/></span>
          <input value={query} onChange={e => { setQuery(e.target.value); setShowSuggest(true); }} onFocus={() => setShowSuggest(true)} onBlur={() => setTimeout(() => setShowSuggest(false), 200)} onKeyDown={e => { if (e.key==='Enter') addNew(query); }} placeholder="Cerca o crea un ingrediente…" style={{flex:1, border:'none', outline:'none', fontSize:13, fontFamily:'inherit', background:'transparent'}}/>
          {query.trim() && !exactMatch && <button onMouseDown={() => addNew(query)} style={{background: PN.PINK, color:'#fff', border:'none', padding:'4px 10px', borderRadius:5, fontSize:11.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>+ Crea nuovo</button>}
        </div>
        {showSuggest && dbMatches.length > 0 && (
          <div style={{position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:`1px solid ${PN.BORDER}`, borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.08)', zIndex:10, maxHeight:260, overflowY:'auto'}}>
            <div style={{padding:'8px 12px', fontSize:10.5, fontWeight:700, color: PN.MUTED, letterSpacing:0.3, textTransform:'uppercase', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>Dal tuo archivio ingredienti</div>
            {dbMatches.map(s => (
              <button key={s.name} onMouseDown={() => addExisting(s)} style={{width:'100%', textAlign:'left', padding:'8px 12px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
                <span style={{color: PN.MUTED, fontSize:11, lineHeight:1}}>+</span>
                <span style={{fontSize:13, color: PN.TEXT, fontWeight:600, flex:1}}>{s.name}</span>
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

function ExtrasList({ extras, setExtras }) {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const add = () => {
    if (!name.trim()) return;
    setExtras(arr => [...arr, { name: name.trim(), price: parseFloat(price) || 0 }]);
    setName(''); setPrice('');
  };
  return (
    <div>
      {extras.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:12}}>
          {extras.map((ex, i) => (
            <div key={i} style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:10, alignItems:'center', padding:'8px 10px 8px 12px', background:'#FAFBFC', borderRadius:8}}>
              <span style={{fontSize:13, color: PN.TEXT, fontWeight:600}}>{ex.name}</span>
              <span style={{fontSize:13, fontWeight:700, color: PN.PINK_DARK}}>+ € {ex.price.toFixed(2)}</span>
              <button onClick={() => setExtras(arr => arr.filter((_, idx) => idx !== i))} style={{width:26, height:26, background:'transparent', border:'none', borderRadius:6, cursor:'pointer', color: PN.MUTED, display:'grid', placeItems:'center', fontSize:13}}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{display:'grid', gridTemplateColumns:'1fr 100px auto', gap:8}}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="es. Tartufo nero" style={{padding:'8px 12px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none'}}/>
        <div style={{position:'relative'}}>
          <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:13, color: PN.MUTED, fontWeight:600}}>+€</span>
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="4,00" style={{width:'100%', padding:'8px 12px 8px 30px', border:`1px solid ${PN.BORDER}`, borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none'}}/>
        </div>
        <button onClick={add} style={{background: name.trim() ? PN.PINK : '#F4F5F7', color: name.trim() ? '#fff' : PN.MUTED, border:'none', padding:'0 14px', borderRadius:8, fontSize:12.5, fontWeight:700, cursor: name.trim()?'pointer':'default', fontFamily:'inherit'}}>Aggiungi</button>
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
          <div key={i} style={{border:`1px solid ${PN.BORDER}`, borderRadius:8, padding:12}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'center', marginBottom:10}}>
              <input value={v.name} onChange={e => updateGroup(i, {name:e.target.value})} placeholder="Nome del gruppo (es. Cottura, Formato, Pane)" style={{padding:'7px 10px', border:`1px solid ${PN.BORDER}`, borderRadius:6, fontSize:13, fontFamily:'inherit', outline:'none', fontWeight:600}}/>
              <button onClick={() => removeGroup(i)} style={{width:30, height:30, background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius:6, cursor:'pointer', color: PN.MUTED, display:'grid', placeItems:'center', fontSize:13}}>✕</button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:5, marginBottom:8}}>
              {v.options.map((opt, oi) => (
                <div key={oi} style={{display:'flex', gap:6}}>
                  <input value={opt} onChange={e => updateGroup(i, {options: v.options.map((x, idx) => idx===oi ? e.target.value : x)})} placeholder={`Opzione ${oi+1} (es. Al sangue)`} style={{flex:1, padding:'6px 10px', border:`1px solid ${PN.BORDER}`, borderRadius:6, fontSize:12.5, fontFamily:'inherit', outline:'none'}}/>
                  {v.options.length > 1 && (
                    <button onClick={() => updateGroup(i, {options: v.options.filter((_, idx) => idx !== oi)})} style={{width:28, height:28, background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius:6, cursor:'pointer', color: PN.MUTED, display:'grid', placeItems:'center', fontSize:11}}>✕</button>
                  )}
                </div>
              ))}
              <button onClick={() => updateGroup(i, {options: [...v.options, '']})} style={{background:'transparent', border:'none', color: PN.PINK_DARK, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5, padding:'4px 0', alignSelf:'flex-start'}}>+ Aggiungi opzione</button>
            </div>
            <label style={{display:'flex', alignItems:'center', gap:7, fontSize:11.5, color: PN.MUTED, fontWeight:600, cursor:'pointer', paddingTop:8, borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
              <input type="checkbox" checked={v.required} onChange={() => updateGroup(i, {required: !v.required})} style={{margin:0, accentColor: PN.PINK}}/>
              Scelta obbligatoria — il cliente deve sceglierne una prima di aggiungere al carrello
            </label>
          </div>
        ))}
      </div>
      <button onClick={addGroup} style={{marginTop: variants.length ? 10 : 0, width:'100%', padding:'10px', background:'transparent', border:`1.5px dashed ${PN.BORDER}`, borderRadius:8, color: PN.MUTED, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, justifyContent:'center'}}>+ Aggiungi gruppo di varianti</button>
    </div>
  );
}

const INGREDIENT_LIBRARY = ['Pomodoro San Marzano','Mozzarella di bufala','Basilico','Olio EVO','Aglio','Cipolla rossa','Guanciale','Pecorino DOP','Parmigiano 24 mesi','Burro','Tonnarelli','Spaghetti','Rigatoni','Pepe nero','Pepe rosa','Salvia','Rosmarino','Pinoli','Vino bianco','Limone'];

const DIETARY_TAGS = ['Vegetariano','Vegano','Senza glutine','Senza lattosio','Piccante','Crudo','Bio','Locale'];

// ─── DishEditModal: modal completo (versione onboarding) ──────────────────────
function DishEditModal({ dish, dishId, isNew, catName, fromLibrary, onClose, onSave, onDelete }) {
  const isEdit = !!dish;
  const [name, setName] = React.useState(dish?.name || '');
  const [desc, setDesc] = React.useState(dish?.desc || '');
  const [cat, setCat] = React.useState(dish?.cat || (catName !== 'Bevande' && CAT_EMOJI[catName] ? catName : 'Antipasti'));
  const [allergens, setAllergens] = React.useState(dish?.allergens || []);
  const [photo, setPhoto] = React.useState(false);
  const [openSection, setOpenSection] = React.useState(null);
  const [initialPrice, setInitialPrice] = React.useState('');
  const [foodCost, setFoodCost] = React.useState(dish?.foodCost ? dish.foodCost.toFixed(2) : '');
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

  const handleSave = () => {
    if (!name.trim()) { alert('Inserisci il nome del piatto'); return; }
    const out = {
      id: dish?.id,
      name: name.trim(),
      desc: desc.trim(),
      cat,
      allergens: effectiveAllergens,
      foodCost: foodCost ? parseFloat(foodCost.replace(',','.')) : null,
      ingredients, extras, variants, dietaryTags,
    };
    if (isNew && !fromLibrary) {
      out._initialPrice = parseFloat(initialPrice.replace(',','.')) || 0;
    }
    onSave(out);
  };

  const ALL_CATS = ['Antipasti','Primi','Secondi','Contorni','Dolci','Bevande'];

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(20,20,20,0.45)', zIndex: 1000,
      display:'grid', placeItems:'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 14, width: 640, maxWidth:'100%',
        maxHeight: '90vh', display:'flex', flexDirection:'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px', borderBottom: `1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', gap: 10}}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 11, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.4, fontWeight: 700}}>
              {fromLibrary ? 'Libreria piatti' : (catName || cat)}
            </div>
            <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>{isEdit ? 'Modifica piatto' : 'Nuovo piatto'}</div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 7, border: 'none',
            background: '#F4F5F7', cursor: 'pointer', fontSize: 16, color: PN.MUTED,
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{padding: 22, display:'flex', flexDirection:'column', gap: 16, overflowY:'auto', flex:1}}>
          {/* Foto */}
          <div>
            <label style={{fontSize:11, fontWeight:700, color:PN.MUTED, letterSpacing:0.4, textTransform:'uppercase', marginBottom:6, display:'block'}}>Foto del piatto</label>
            {photo ? (
              <div style={{display:'flex', alignItems:'center', gap:14, padding:10, border:`1px solid ${PN.BORDER}`, borderRadius:10}}>
                <div style={{width:72, height:72, borderRadius:8, background:'#F4D9A0', flexShrink:0}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:600, color:PN.TEXT}}>foto-piatto.jpg</div>
                  <div style={{fontSize:11.5, color:PN.MUTED}}>1.4 MB · 1200×800</div>
                </div>
                <button onClick={()=>setPhoto(false)} style={{background:'transparent', border:'none', color: PN.RED, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Rimuovi</button>
              </div>
            ) : (
              <button onClick={()=>setPhoto(true)} style={{
                width:'100%', padding:'18px', borderRadius:10, border:`1.5px dashed ${PN.BORDER}`, background:'#FAFBFC',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10, cursor:'pointer', fontFamily:'inherit',
              }}>
                <span style={{fontSize:16, color: PN.MUTED}}>+</span>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:13, fontWeight:600, color:PN.TEXT}}>Aggiungi foto</div>
                  <div style={{fontSize:11.5, color:PN.MUTED}}>Trascina qui o clicca · JPG/PNG · max 5MB</div>
                </div>
              </button>
            )}
          </div>

          {/* Campi base */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
            <ImpField label="Nome del piatto" style={{gridColumn:'1 / -1'}}>
              <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="es. Spaghetti alle vongole" style={{
                width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 13.5, fontFamily:'inherit', outline:'none',
              }}/>
            </ImpField>
            <ImpField label="Descrizione" style={{gridColumn:'1 / -1'}}>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2} placeholder="Ingredienti principali, breve descrizione…" style={{
                width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 13.5, fontFamily:'inherit', outline:'none', resize:'vertical',
              }}/>
            </ImpField>
            {!fromLibrary && (
              <ImpField label="Categoria">
                <select value={cat} onChange={e=>setCat(e.target.value)} style={{
                  width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 13.5, fontFamily:'inherit', outline:'none', background: PN.WHITE,
                }}>
                  {ALL_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </ImpField>
            )}
            {/* Prezzo solo se piatto NUOVO aggiunto al menù; nella libreria non c'è */}
            {isNew && !fromLibrary && (
              <ImpField label={`Prezzo per ${catName ? `"${catName}"` : 'il menù'} (€)`}>
                <input value={initialPrice} onChange={e=>setInitialPrice(e.target.value)} placeholder="0,00" style={{
                  width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 13.5, fontFamily:'inherit', outline:'none',
                }}/>
              </ImpField>
            )}
          </div>

          {/* Banner libreria */}
          {fromLibrary && (
            <div style={{padding:'10px 12px', borderRadius:8, background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`, fontSize:12, color:PN.MUTED, lineHeight: 1.5}}>
              💡 La libreria contiene la "ricetta" del piatto. Il <strong style={{color: PN.TEXT}}>prezzo</strong> e la <strong style={{color: PN.TEXT}}>disponibilità</strong> si impostano nel singolo menù dove il piatto è inserito.
            </div>
          )}

          {/* Allergeni */}
          <div>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8, gap:10, flexWrap:'wrap'}}>
              <label style={{fontSize:11, fontWeight:700, color:PN.MUTED, letterSpacing:0.4, textTransform:'uppercase'}}>Allergeni del piatto</label>
              {ingredientAllergens.size > 0 && (
                <span style={{fontSize:10.5, color: PN.MUTED, fontStyle:'italic'}}>
                  Quelli con <span style={{color: PN.PINK_DARK, fontWeight:700, fontStyle:'normal'}}>•</span> sono derivati dagli ingredienti
                </span>
              )}
            </div>
            <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
              {ALLERGENS.map(a => {
                const fromIng = ingredientAllergens.has(a.id);
                const fromManual = allergens.includes(a.id);
                const on = fromIng || fromManual;
                return (
                  <button key={a.id} onClick={() => toggleAllergen(a.id)} disabled={fromIng && !fromManual} title={fromIng && !fromManual ? "Derivato dagli ingredienti — modifica gli ingredienti per cambiarlo" : ""} style={{
                    display:'inline-flex', alignItems:'center', gap: 5,
                    padding:'6px 12px', borderRadius: 999,
                    border: on ? `1.5px solid ${PN.PINK}` : `1.5px solid ${PN.BORDER}`,
                    background: on ? PN.PINK_SOFT : PN.WHITE,
                    color: on ? PN.PINK_DARK : PN.MUTED,
                    fontSize: 12, fontWeight: 600, cursor: (fromIng && !fromManual) ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                    opacity: 1, position:'relative',
                  }}>
                    <AllergenIcon id={a.id} size={14}/>
                    {a.name}
                    {fromIng && <span style={{color: PN.PINK_DARK, fontSize: 14, lineHeight: 1, marginLeft:1}}>•</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Banner AI */}
          <div style={{padding:'12px 14px', background: PN.PINK_SOFT, borderRadius:10, display:'flex', alignItems:'center', gap:10}}>
            <span style={{fontSize:14}}>✨</span>
            <div style={{flex:1, fontSize:13, color: PN.PINK_DARK, fontWeight:600}}>
              Lascia che l'AI scriva descrizione, allergeni e valori nutrizionali per te.
            </div>
            <button style={{background: PN.PINK_DARK, color:'#fff', border:'none', padding:'7px 12px', borderRadius:6, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Auto-compila</button>
          </div>

          {/* Food cost */}
          <ImpField label="Food cost (opzionale)">
            <input value={foodCost} onChange={e => setFoodCost(e.target.value)} placeholder="es. 4,50" style={{
              width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 13.5, fontFamily:'inherit', outline:'none',
            }}/>
            <div style={{fontSize:11, color: PN.MUTED, marginTop:4}}>Per le tue analytics di marginalità</div>
          </ImpField>

          {/* Personalizzazioni cliente */}
          <div>
            <div style={{fontSize:13.5, fontWeight:700, color: PN.TEXT, marginBottom:4}}>Personalizzazioni cliente</div>
            <div style={{fontSize:12.5, color: PN.MUTED, marginBottom:12, lineHeight:1.5}}>Cosa può modificare il cliente quando ordina dal menu digitale.</div>
            <CollapseSection
              title="Ingredienti"
              subtitle={`${ingredients.length} ingredienti · ${ingredients.filter(i=>i.removable).length} rimuovibili`}
              icon="•"
              open={openSection === 'ingredients'}
              onToggle={() => setOpenSection(s => s === 'ingredients' ? null : 'ingredients')}
            >
              <div style={{fontSize:11.5, color: PN.MUTED, marginBottom:10, lineHeight:1.45}}>
                Spunta gli ingredienti che il cliente può <strong style={{color: PN.TEXT}}>togliere dal piatto</strong>.
              </div>
              <IngredientList ingredients={ingredients} setIngredients={setIngredients} library={INGREDIENT_LIBRARY}/>
            </CollapseSection>
            <CollapseSection
              title="Aggiunte a pagamento"
              subtitle={extras.length === 0 ? 'Nessuna' : `${extras.length} extra · ingredienti opzionali`}
              icon="+"
              open={openSection === 'extras'}
              onToggle={() => setOpenSection(s => s === 'extras' ? null : 'extras')}
            >
              <div style={{fontSize:11.5, color: PN.MUTED, marginBottom:10, lineHeight:1.45}}>
                Extra che il cliente può aggiungere al piatto, con prezzo (es. tartufo, doppia mozzarella).
              </div>
              <ExtrasList extras={extras} setExtras={setExtras}/>
            </CollapseSection>
            <CollapseSection
              title="Varianti del piatto"
              subtitle={variants.length === 0 ? 'Nessuna' : `${variants.length} ${variants.length === 1 ? 'gruppo' : 'gruppi'} · cottura, formato…`}
              icon="◐"
              open={openSection === 'variants'}
              onToggle={() => setOpenSection(s => s === 'variants' ? null : 'variants')}
            >
              <div style={{fontSize:11.5, color: PN.MUTED, marginBottom:10, lineHeight:1.45}}>
                Scelte tra cui il cliente sceglie un'opzione (es. <em>Cottura: al sangue / media / ben cotta</em>).
              </div>
              <VariantsList variants={variants} setVariants={setVariants}/>
            </CollapseSection>
          </div>

          {/* Informazioni aggiuntive */}
          <div>
            <div style={{fontSize:13.5, fontWeight:700, color: PN.TEXT, marginBottom:4}}>Informazioni aggiuntive</div>
            <div style={{fontSize:12.5, color: PN.MUTED, marginBottom:12, lineHeight:1.5}}>Dati visibili al cliente sul menu, utili per allergie e diete.</div>
            <CollapseSection
              title="Tag dietetici"
              subtitle={dietaryTags.length === 0 ? 'Nessuno' : dietaryTags.map(t => t.surcharge ? `${t.name} +€${t.surcharge}` : t.name).join(' · ')}
              icon="◇"
              open={openSection === 'tags'}
              onToggle={() => setOpenSection(s => s === 'tags' ? null : 'tags')}
            >
              <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom: dietaryTags.length ? 14 : 0}}>
                {DIETARY_TAGS.map(t => {
                  const on = dietaryTags.some(x => x.name === t);
                  return (
                    <button key={t} onClick={() => toggleTag(t)} style={{
                      padding:'6px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                      border: on ? `1.5px solid ${PN.PINK}` : `1.5px solid ${PN.BORDER}`,
                      background: on ? PN.PINK_SOFT : '#fff',
                      color: on ? PN.PINK_DARK : PN.MUTED,
                      cursor:'pointer', fontFamily:'inherit',
                    }}>{t}</button>
                  );
                })}
              </div>
              {dietaryTags.length > 0 && (
                <div style={{background:'#FAFBFC', borderRadius:10, padding:12, border:`1px solid ${PN.BORDER_SOFT}`}}>
                  <div style={{fontSize:11, fontWeight:700, color: PN.MUTED, letterSpacing:0.4, textTransform:'uppercase', marginBottom:4}}>Sovrapprezzo per variante</div>
                  <div style={{fontSize:11.5, color: PN.MUTED, marginBottom:10, lineHeight:1.5}}>Se questa variante ha un costo aggiuntivo (es. pasta senza glutine, latte vegetale), aggiungi qui il supplemento. Il cliente lo vedrà al momento dell'ordine.</div>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    {dietaryTags.map(t => (
                      <div key={t.name} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'center', padding:'6px 10px', background:'#fff', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius:8}}>
                        <span style={{fontSize:13, color: PN.TEXT, fontWeight:600}}>{t.name}</span>
                        <div style={{display:'flex', alignItems:'center', gap:6}}>
                          <span style={{fontSize:12, color: PN.MUTED, fontWeight:600}}>+€</span>
                          <input
                            value={t.surcharge}
                            onChange={e => setTagSurcharge(t.name, e.target.value.replace(/[^0-9,.]/g, ''))}
                            placeholder="0,00"
                            style={{width:64, padding:'5px 8px', border:`1px solid ${PN.BORDER}`, borderRadius:6, fontSize:12.5, fontFamily:'inherit', textAlign:'right', outline:'none'}}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapseSection>
          </div>

          {/* Valori nutrizionali (collassabile) */}
          <div style={{border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, overflow:'hidden'}}>
            <button onClick={() => setOpenSection(s => s === 'nutrition' ? null : 'nutrition')} style={{
              width:'100%', padding:'12px 14px', background: openSection === 'nutrition' ? '#FAFBFC' : PN.WHITE,
              border:'none', borderBottom: openSection === 'nutrition' ? `1px solid ${PN.BORDER_SOFT}` : 'none',
              cursor:'pointer', fontFamily:'inherit', textAlign:'left',
              display:'flex', alignItems:'center', gap: 10,
            }}>
              <span style={{fontSize: 11, color: PN.MUTED, transition:'transform .2s', transform: openSection === 'nutrition' ? 'none' : 'rotate(-90deg)'}}>▼</span>
              <div style={{flex:1}}>
                <div style={{fontSize: 13, fontWeight: 700, color: PN.TEXT}}>Valori nutrizionali</div>
                <div style={{fontSize: 11.5, color: PN.MUTED}}>Kcal, carb., proteine, grassi · stimati dall'AI</div>
              </div>
            </button>
            {openSection === 'nutrition' && (
              <div style={{padding: 14}}><NutritionFields/></div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 8, justifyContent:'space-between', alignItems:'center'}}>
          <div>
            {isEdit && onDelete && (
              <button onClick={() => { if (confirm('Eliminare questo piatto dalla libreria? Sarà rimosso anche da tutti i menù.')) onDelete(); }} style={{
                background:'transparent', border:'none', color: PN.RED, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:6, padding:'8px 0',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <PnI.Trash size={14}/> Elimina piatto
              </button>
            )}
          </div>
          <div style={{display:'flex', gap: 8}}>
            <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
            <ImpButton variant="primary" onClick={handleSave}>{isEdit ? 'Salva modifiche' : 'Crea piatto'}</ImpButton>
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
            fontSize:13.5, fontFamily:'inherit', outline:'none',
          }}/>
        </div>

        <div style={{position:'relative'}} data-allergen-filter>
          <button onClick={() => setAllergenFilterOpen(v => !v)} style={{
            padding: '10px 14px', borderRadius: 9,
            border: `1px solid ${allergenFilter.length ? PN.PINK : PN.BORDER}`,
            background: allergenFilter.length ? PN.PINK_SOFT : PN.WHITE,
            color: allergenFilter.length ? PN.PINK_DARK : PN.TEXT,
            fontSize: 12.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            display:'inline-flex', alignItems:'center', gap: 8, whiteSpace:'nowrap',
          }}>
            Allergene
            {allergenFilter.length > 0 && (
              <span style={{
                fontSize: 11, padding:'1px 7px', borderRadius: 999,
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
                    fontSize: 12.5, color: PN.TEXT, textAlign:'left',
                  }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                      background: on ? PN.PINK : PN.WHITE,
                      display:'grid', placeItems:'center',
                      color: PN.WHITE, fontSize: 11,
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
                  fontSize: 12, color: PN.MUTED, fontFamily:'inherit',
                }}>Cancella filtri</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Header tabella */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 280px 160px 36px',
        gap: 16, padding: '10px 16px',
        fontSize: 10.5, fontWeight: 700, color: PN.MUTED,
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
              fontSize:14, fontWeight: 700, fontFamily:'inherit', outline:'none',
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
                <span style={{fontSize: 12, color: PN.MUTED, fontStyle:'italic'}}>+ allergeni (opzionale)</span>
              ) : newAllergens.map(aId => {
                const al = ALLERGENS.find(x => x.id === aId);
                return (
                  <span key={aId} style={{
                    fontSize: 9.5, fontWeight: 800, padding:'3px 7px', borderRadius: 4,
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
                      fontSize: 12.5, color: PN.TEXT, textAlign:'left',
                    }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: 4,
                        border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                        background: on ? PN.PINK : PN.WHITE,
                        display:'grid', placeItems:'center',
                        color: PN.WHITE, fontSize: 11,
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
              fontSize: 12, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'not-allowed',
              fontFamily:'inherit',
            }}>Aggiungi</button>
            <button onClick={cancelAdd} style={{
              padding:'7px 10px', borderRadius: 7,
              border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
              color: PN.MUTED, fontSize: 12, fontWeight: 600, cursor:'pointer',
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
            <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>{ing.name}</div>

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
                  <span style={{fontSize: 11.5, color: PN.MUTED, fontStyle:'italic'}}>+ aggiungi</span>
                ) : ing.allergens.map(aId => {
                  const al = ALLERGENS.find(x => x.id === aId);
                  return (
                    <span key={aId} style={{
                      fontSize: 9.5, fontWeight: 800, padding:'3px 7px', borderRadius: 4,
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
                        fontSize: 12.5, color: PN.TEXT, textAlign:'left',
                      }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: 4,
                          border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                          background: on ? PN.PINK : PN.WHITE,
                          display:'grid', placeItems:'center',
                          color: PN.WHITE, fontSize: 11,
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
                <span style={{fontSize: 12.5, color: PN.MUTED, fontStyle:'italic'}}>Non usato</span>
              ) : (
                <button data-ing-trigger onClick={() => { setPopoverIdx(isPopoverOpen ? null : idx); setEditAllergensIdx(null); }} style={{
                  background:'transparent', border:'none', padding: 0, cursor:'pointer',
                  fontFamily:'inherit', fontSize: 13, fontWeight: 600,
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
                    padding: '4px 12px 8px', fontSize: 10.5, fontWeight: 700,
                    color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.6,
                    borderBottom: `1px solid ${PN.BORDER_SOFT}`, marginBottom: 4,
                  }}>{ing.name} è in</div>
                  {ing.usedInDishes.map((d, i) => (
                    <div key={i} style={{
                      padding:'7px 12px', fontSize: 12.5, color: PN.TEXT,
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
        <div style={{padding:'48px 22px', textAlign:'center', color: PN.MUTED, fontSize: 13.5, background: PN.WHITE}}>
          Nessun ingrediente corrisponde ai filtri.
        </div>
      )}
      </div>
    </ImpCard>
  );
}

function MCConfigura() {
  const [takeaway, setTakeaway] = React.useState(true);
  const [tkMenu, setTkMenu] = React.useState('asporto');
  const [tkLeadTime, setTkLeadTime] = React.useState(20);
  const [cucina, setCucina] = React.useState('diretto');
  const [timeout, setTimeoutMin] = React.useState(5);
  const [timeoutAction, setTimeoutAction] = React.useState('auto');
  const [coperto, setCoperto] = React.useState(2);
  const [copertoObb, setCopertoObb] = React.useState(true);
  const [tipDefault, setTipDefault] = React.useState(5);
  const [showQr, setShowQr] = React.useState(false);

  return (
    <div>
      {/* === SEZIONE 1: FLUSSO ORDINI === */}
      <ImpCard title="Flusso ordini in cucina" sub="Come arrivano gli ordini al cuoco quando il cliente ordina dall'app">
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
            {id:'diretto', title:'Diretto in cucina', sub:'Più veloce, niente attese', Icon: PnI.Lightning, pros:['Ordini istantanei','Cucina vede in tempo reale','Ideale per alto volume']},
            {id:'cameriere', title:'Passa dal cameriere', sub:'Cameriere approva poi invia', Icon: PnI.Person, pros:['Filtro umano sui dettagli','Gestisci personalizzazioni','Ideale per piatti elaborati']},
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
                    <div style={{fontSize: 14, fontWeight: 800, color: PN.TEXT, letterSpacing:-0.1}}>{c.title}</div>
                    <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 1}}>{c.sub}</div>
                  </div>
                  <span style={{
                    width: 18, height: 18, borderRadius:'50%',
                    border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                    background: on ? PN.TEXT : PN.WHITE,
                    display:'grid', placeItems:'center', flexShrink: 0,
                    color: PN.WHITE,
                  }}>{on && <PnI.Check size={10} color={PN.WHITE}/>}</span>
                </div>
                <ul style={{margin: 0, padding: 0, listStyle:'none', fontSize: 11.5, display:'flex', flexDirection:'column', gap: 3}}>
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
                <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>
                  Timeout di approvazione
                </div>
                <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>
                  Quanto aspetta l'ordine prima di una decisione automatica
                </div>
              </div>
            </div>

            <div style={{display:'grid', gap: 14}}>
                <div>
                  <div style={{fontSize: 11, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>
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
                          fontSize: 13, fontWeight: 700,
                          cursor:'pointer', fontFamily:'inherit',
                        }}>
                          <div style={{fontSize: 16, fontWeight: 800, lineHeight: 1}}>{m}</div>
                          <div style={{fontSize: 10, fontWeight: 600, marginTop: 3, opacity: 0.75}}>minuti</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{fontSize: 11, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 4}}>
                    Allo scadere, scegli una sola opzione
                  </div>
                  <div style={{fontSize: 11.5, color: PN.MUTED, marginBottom: 10}}>
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
                            <div style={{fontSize: 12.5, fontWeight: 700, color: on ? PN.AMBER : PN.TEXT, marginBottom: 2}}>{a.label}</div>
                            <div style={{fontSize: 11.5, color: PN.MUTED, lineHeight: 1.45}}>{a.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
          </div>
        )}
      </ImpCard>

      {/* === SEZIONE 3: SERVIZIO ASPORTO === */}
      <ImpCard
        title="Servizio asporto"
        sub={takeaway
          ? "I clienti possono ordinare da remoto e ritirare al banco"
          : "Attiva per permettere ai clienti di ordinare da remoto"
        }
        action={
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
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
            <div style={{fontSize: 13.5, fontWeight: 700, marginBottom: 4}}>Asporto disattivato</div>
            <div style={{fontSize: 12, color: PN.MUTED, marginBottom: 14, maxWidth: 360, margin:'0 auto 14px'}}>
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
                  borderRadius:9, fontSize:13.5, background:PN.WHITE, fontFamily:'inherit',
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
                    borderRadius: 7, fontSize: 13, fontWeight: 700, textAlign:'center',
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
                <div style={{fontSize: 13.5, fontWeight: 700, marginBottom: 2}}>QR per ordini d'asporto</div>
                <div style={{fontSize: 11.5, color: PN.MUTED}}>
                  Esponi all'esterno o sul menu cartaceo. I clienti scansionano e ordinano da remoto.
                </div>
              </div>
              <ImpButton variant="ghost" onClick={() => setShowQr(true)}>Mostra QR</ImpButton>
              <ImpButton variant="primary"><span style={{display:'inline-flex', alignItems:'center', gap:6}}><PnI.Download size={14} color={PN.WHITE}/> Scarica</span></ImpButton>
            </div>
          </div>
        )}
      </ImpCard>

      {/* === SEZIONE 4: COPERTO E MANCIA === */}
      <ImpCard title="Coperto e mancia" sub="Default applicati al conto del cliente">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
          {/* Coperto */}
          <div style={{
            padding: 16, borderRadius: 11,
            border: `1px solid ${PN.BORDER_SOFT}`,
          }}>
            <div style={{fontSize: 13, fontWeight: 700, marginBottom: 10, display:'inline-flex', alignItems:'center', gap: 7}}>
              <PnI.Plate size={15}/> Coperto
            </div>
            <div style={{fontSize: 11.5, color: PN.MUTED, marginBottom: 12}}>
              Importo per persona, applicato solo al servizio in sala (non all'asporto)
            </div>
            <div style={{display:'flex', gap: 6, marginBottom: 12}}>
              {[0, 1.5, 2, 2.5, 3].map(v => {
                const on = coperto === v;
                return (
                  <button key={v} onClick={() => setCoperto(v)} style={{
                    flex: 1, padding:'9px 6px', borderRadius: 7,
                    border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                    background: on ? PN.TEXT : PN.WHITE,
                    color: on ? PN.WHITE : PN.TEXT,
                    fontSize: 12.5, fontWeight: 700,
                    cursor:'pointer', fontFamily:'inherit',
                  }}>{v === 0 ? '—' : `€${v.toFixed(2)}`}</button>
                );
              })}
            </div>
            <label style={{display:'flex', alignItems:'center', gap: 8, fontSize: 12, color: PN.TEXT, cursor:'pointer'}}>
              <input type="checkbox" checked={copertoObb} onChange={() => setCopertoObb(!copertoObb)} style={{accentColor: PN.PINK}}/>
              Obbligatorio (non rimovibile dal cliente)
            </label>
          </div>

          {/* Mancia */}
          <div style={{
            padding: 16, borderRadius: 11,
            border: `1px solid ${PN.BORDER_SOFT}`,
          }}>
            <div style={{fontSize: 13, fontWeight: 700, marginBottom: 10, display:'inline-flex', alignItems:'center', gap: 7}}>
              <PnI.Coin size={15}/> Mancia suggerita
            </div>
            <div style={{fontSize: 11.5, color: PN.MUTED, marginBottom: 12}}>
              Default mostrato al cliente in fase di pagamento (può sempre modificarla)
            </div>
            <div style={{display:'flex', gap: 6, marginBottom: 12}}>
              {[0, 5, 10, 15].map(v => {
                const on = tipDefault === v;
                return (
                  <button key={v} onClick={() => setTipDefault(v)} style={{
                    flex: 1, padding:'9px 6px', borderRadius: 7,
                    border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                    background: on ? PN.TEXT : PN.WHITE,
                    color: on ? PN.WHITE : PN.TEXT,
                    fontSize: 12.5, fontWeight: 700,
                    cursor:'pointer', fontFamily:'inherit',
                  }}>{v === 0 ? 'Niente' : `${v}%`}</button>
                );
              })}
            </div>
            <div style={{
              padding:'8px 10px', background:'#FAFBFC',
              borderRadius: 7, fontSize: 11.5, color: PN.MUTED,
            }}>
              Su un conto da € 50 → suggerimento <b style={{color: PN.TEXT}}>€ {(50 * tipDefault / 100).toFixed(2)}</b>
            </div>
          </div>
        </div>
      </ImpCard>

      {/* QR Modal */}
      {showQr && (
        <div onClick={() => setShowQr(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
          display:'grid', placeItems:'center', zIndex: 100,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: PN.WHITE, borderRadius: 16, padding: 28,
            width: 360, position:'relative', textAlign:'center',
          }}>
            <button onClick={() => setShowQr(false)} style={{
              position:'absolute', top: 14, right: 14,
              width: 32, height: 32, borderRadius: 8,
              background:'#F4F5F7', border:'none', cursor:'pointer',
              display:'grid', placeItems:'center',
            }}><PnI.X size={14}/></button>
            <div style={{fontSize: 16, fontWeight: 800, marginBottom: 4}}>QR ordini d'asporto</div>
            <div style={{fontSize: 12, color: PN.MUTED, marginBottom: 16}}>Scansiona per ordinare e ritirare al banco</div>
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
      <span style={{fontSize: 11.5, fontWeight: 700, color: hi ? PN.PINK_DARK : PN.MUTED}}>{label}</span>
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
        fontSize: 11, fontWeight: 700, color: PN.MUTED,
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
        fontSize: 12, color: PN.MUTED,
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

function AiUploadCta({onClick}) {
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
        fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
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
      <span style={{position: 'relative', zIndex: 1}}>Carica menu (PDF / foto)</span>

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
      position:'absolute', inset:0, background:'rgba(20,20,20,0.55)', zIndex:1100,
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
            display:'grid', placeItems:'center', color:'#fff', fontSize: 18,
          }}>✨</div>
          <div style={{flex:1}}>
            <div style={{fontSize: 11, color: PN.PINK_DARK, textTransform:'uppercase', letterSpacing: 0.5, fontWeight: 800}}>Importazione AI</div>
            <div style={{fontSize: 16, fontWeight: 800, color: PN.TEXT}}>
              {stage === 'upload' && 'Carica il tuo menu'}
              {stage === 'processing' && 'Stiamo analizzando il menu…'}
              {stage === 'review' && 'Verifica i piatti estratti'}
            </div>
          </div>
          <button onClick={onClose} style={{width:30, height:30, borderRadius:7, border:'none', background:'#F4F5F7', cursor:'pointer', fontSize:16, color:PN.MUTED}}>✕</button>
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
                      display:'grid', placeItems:'center', margin:'0 auto 14px', fontSize: 24,
                    }}>📤</div>
                    <div style={{fontSize: 15, fontWeight: 700, marginBottom: 4, color: PN.TEXT}}>Trascina qui il tuo menu</div>
                    <div style={{fontSize: 13, color: PN.MUTED, marginBottom: 16}}>oppure clicca per selezionare un file</div>
                    <div style={{display:'flex', gap: 8, justifyContent:'center', flexWrap:'wrap'}}>
                      {['📄 PDF', '🖼 Foto', '📷 Scatta foto'].map((opt,i) => (
                        <div key={i} style={{
                          padding:'6px 12px', background: '#fff', border: `1px solid ${PN.BORDER}`,
                          borderRadius: 999, fontSize: 12, color: PN.MUTED, fontWeight: 600,
                        }}>{opt}</div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{display:'flex', alignItems:'center', gap: 12, textAlign:'left'}}>
                    <div style={{
                      width: 40, height: 48, borderRadius: 5,
                      background:'#fef2f2', border:`1.5px solid #DC2626`,
                      display:'grid', placeItems:'center', fontSize: 9, fontWeight: 800, color: '#DC2626',
                    }}>PDF</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>{file.name}</div>
                      <div style={{fontSize: 12, color: PN.MUTED}}>{file.size} · pronto per l'analisi</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{
                      background:'transparent', border:'none', cursor:'pointer', color: PN.MUTED, fontSize: 16,
                    }}>✕</button>
                  </div>
                )}
              </div>

              <div style={{display:'flex', alignItems:'center', gap: 14, margin:'22px 0 14px'}}>
                <div style={{flex:1, height: 1, background: PN.BORDER}}/>
                <span style={{fontSize: 11, color: PN.MUTED, letterSpacing: 1, fontWeight: 700}}>OPPURE</span>
                <div style={{flex:1, height: 1, background: PN.BORDER}}/>
              </div>

              <div style={{
                display:'flex', alignItems:'center', gap: 10,
                background: '#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 12,
                padding: '12px 14px',
              }}>
                <span style={{fontSize: 16}}>🔗</span>
                <input placeholder="https://… (link al sito o PDF online)" style={{
                  flex:1, border:'none', outline:'none', fontSize: 13, fontFamily:'inherit', background:'transparent',
                }}/>
                <button style={{
                  background: PN.TEXT, color:'#fff', border:'none', padding:'8px 14px',
                  borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
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
              <div style={{fontSize: 11.5, color: PN.MUTED}}>🔒 I tuoi dati sono privati. L'analisi richiede ~10 secondi.</div>
              <div style={{display:'flex', gap: 8}}>
                <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
                <ImpButton variant="primary" onClick={startProcessing} disabled={!file}>✨ Analizza menu</ImpButton>
              </div>
            </>
          )}
          {stage === 'processing' && (
            <>
              <div style={{fontSize: 11.5, color: PN.MUTED}}>L'AI sta leggendo il documento, identificando categorie e prezzi…</div>
              <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
            </>
          )}
          {stage === 'review' && (
            <>
              <div style={{fontSize: 12.5, color: PN.MUTED}}>
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
          fontSize: 36,
        }}>✨</div>
        <style>{`@keyframes aiSpin { to { transform: rotate(360deg); }} @keyframes aiPulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:.4; transform:scale(.6)} }`}</style>
      </div>

      <div style={{fontSize: 14, color: PN.MUTED, marginBottom: 18}}>
        Pronto in: <b style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{secondsLeft}s</b>
      </div>

      <div style={{
        background: '#FAFBFC', borderRadius: 12, padding: '18px 20px',
        border: `1px solid ${PN.BORDER_SOFT}`, textAlign:'left',
      }}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom: 10}}>
          <span style={{fontSize: 12, fontWeight: 800, color: PN.TEXT}}>AVANZAMENTO</span>
          <span style={{fontSize: 12, fontWeight: 800, color: PN.PINK}}>{Math.round(progress)}%</span>
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
                  color:'#fff', fontSize: 10, fontWeight: 800,
                }}>
                  {done ? '✓' : active ? <div style={{width: 6, height: 6, borderRadius:'50%', background:'#fff', animation:'aiPulse 1s ease-in-out infinite'}}/> : null}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize: 13, fontWeight: active ? 700 : 500, color: PN.TEXT}}>{t.label}</div>
                  {(done || active) && <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 1}}>{t.detail}</div>}
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
        <div style={{fontSize: 11, color: PN.MUTED, fontWeight: 700, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>Nome del nuovo menù</div>
        <input value={menuName} onChange={e => setMenuName(e.target.value)} style={{
          width:'100%', padding: '10px 12px', border: `1px solid ${PN.BORDER}`, borderRadius: 8,
          fontSize: 15, fontFamily:'inherit', fontWeight: 700, color: PN.TEXT, outline:'none', background: PN.WHITE,
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
              fontSize: 11, fontWeight: 800, color: PN.TEXT, letterSpacing: 0.5, textTransform:'uppercase',
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <span>{cat.name}</span>
              <span style={{fontSize: 11, fontWeight: 700, color: PN.MUTED}}>{sel.size} di {cat.dishes.length}</span>
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
                    <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT, marginBottom: 2}}>{d.name}</div>
                    {d.desc && <div style={{fontSize: 11.5, color: PN.MUTED, lineHeight: 1.4, marginBottom: 4}}>{d.desc}</div>}
                    {d.allergens && d.allergens.length > 0 && (
                      <div style={{display:'flex', gap: 4, flexWrap:'wrap'}}>
                        {d.allergens.map(a => (
                          <span key={a} style={{
                            fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 3,
                            background: '#FEF2E0', color: '#92400E', textTransform:'uppercase', letterSpacing: 0.4,
                          }}>{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 800, color: PN.TEXT, fontVariantNumeric:'tabular-nums',
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
