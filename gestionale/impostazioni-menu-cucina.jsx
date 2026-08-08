// Impostazioni → Menù e cucina (rifatto: piatti per categoria, allergeni icone, filtri chip)

const PHOTO_MOCK_BG = ['#F4D9A0', '#D0E8F4', '#E5D9F2'];
// Foto segnaposto VERE, non campiture: sono le stesse dei piatti mock della
// vetrina, cosi il prototipo racconta una cucina sola. La tinta pastello
// resta dietro come fondo mentre l'immagine carica.
const PHOTO_MOCK_IMGS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=70&auto=format&fit=crop',
];

const ALLERGENS = [
  { id: 'glutine', name: 'Glutine', icon: '🌾', color: '#D97706' },
  { id: 'latte', name: 'Latte', icon: '🥛', color: '#0EA5E9' },
  { id: 'uova', name: 'Uova', icon: '🥚', color: '#EAB308' },
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
  { id: 'solfiti', name: 'Solfiti', icon: '🍷', color: '#9333EA' },
];

// Importi proposti per il servizio, per modalità. Lo 0 è "nessun servizio" e
// c'è in entrambe: toglierlo obbligherebbe a passare da un'altra impostazione
// solo per rinunciarci.
const SERVIZIO_OPZIONI = {
  fisso:       [0, 1.5, 2, 2.5, 3],
  percentuale: [0, 5, 10, 12, 15],
};

// ─── Segni degli allergeni ───────────────────────────────────────────────────
// Disegnati, non iniziali: «G» e «S» valevano per glutine e per sedano, e in
// griglia non si distinguevano nemmeno guardandoli. Ogni segno è la cosa —
// la spiga, il cartone del latte, il calice — nel colore del suo allergene,
// coi dettagli in bianco perché si leggano anche a 14px.
// Niente emoji: cambiano forma e colore da un sistema all'altro e su Windows
// la metà di questi non esiste.
const ALLERGEN_GLYPHS = {
  // Spiga: chicchi appaiati lungo il culmo.
  glutine: (c) => (
    <g>
      <path d="M12 21.6v-8.4" stroke={c} strokeWidth="1.9" strokeLinecap="round"/>
      <g fill={c}>
        <ellipse cx="12" cy="4.9" rx="1.9" ry="3.1"/>
        <ellipse cx="8.9" cy="8.6" rx="1.85" ry="3" transform="rotate(-32 8.9 8.6)"/>
        <ellipse cx="15.1" cy="8.6" rx="1.85" ry="3" transform="rotate(32 15.1 8.6)"/>
        <ellipse cx="8.9" cy="13.4" rx="1.85" ry="3" transform="rotate(-32 8.9 13.4)"/>
        <ellipse cx="15.1" cy="13.4" rx="1.85" ry="3" transform="rotate(32 15.1 13.4)"/>
      </g>
    </g>
  ),
  // Bicchiere pieno: il cartone, a questa taglia, leggeva come una borsa.
  latte: (c) => (
    <g>
      <path d="M6.7 3.4h10.6l-1.3 16A1.9 1.9 0 0 1 14.1 21.2H9.9A1.9 1.9 0 0 1 8 19.4L6.7 3.4Z" fill={c}/>
      <path d="M7.1 7.3h9.8" stroke="#fff" strokeWidth="1.7" opacity=".85" strokeLinecap="round"/>
    </g>
  ),
  uova: (c) => (
    <g>
      <path d="M12 3.1c3.3 0 6 4.7 6 9 0 4.1-2.7 6.9-6 6.9s-6-2.8-6-6.9c0-4.3 2.7-9 6-9Z" fill={c}/>
      <ellipse cx="9.6" cy="10.2" rx="1.4" ry="2.1" fill="#fff" opacity=".6" transform="rotate(-22 9.6 10.2)"/>
    </g>
  ),
  pesce: (c) => (
    <g fill={c}>
      <path d="M15.8 12c-1.8 3.2-4.7 5.1-8 5.1S3.6 15.2 1.8 12c1.8-3.2 4.7-5.1 8-5.1s6.2 1.9 8 5.1Z"/>
      <path d="M15.3 8.2 21.6 12l-6.3 3.8c.6-1.2.9-2.5.9-3.8s-.3-2.6-.9-3.8Z"/>
      <circle cx="6.3" cy="11" r="1.05" fill="#fff"/>
    </g>
  ),
  // Granchio: corpo, chele e zampe — più riconoscibile del gambero a 14px.
  crostacei: (c) => (
    <g>
      <path d="M8.4 11.2 10.4 13.6M15.6 11.2 13.6 13.6M5.8 16.6 2.9 15.4M5.9 19.2 3.5 20.8M18.2 16.6 21.1 15.4M18.1 19.2 20.5 20.8"
        stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="6.6" cy="9.2" r="2.9" fill={c}/>
      <circle cx="17.4" cy="9.2" r="2.9" fill={c}/>
      <path d="M6.9 9.2 9.4 7.8M6.9 9.2 9.4 10.6M17.1 9.2 14.6 7.8M17.1 9.2 14.6 10.6" stroke="#fff" strokeWidth="1.35" strokeLinecap="round"/>
      <ellipse cx="12" cy="17" rx="6.5" ry="4.3" fill={c}/>
      <circle cx="9.9" cy="15.9" r="1" fill="#fff"/>
      <circle cx="14.1" cy="15.9" r="1" fill="#fff"/>
    </g>
  ),
  // Capasanta: ventaglio con le costole e la cerniera.
  molluschi: (c) => (
    <g>
      <path d="M2.7 9.8q1.85-3.3 3.7 0 1.85-3.3 3.7 0 1.85-3.3 3.7 0 1.85-3.3 3.7 0 1.85-3.3 3.7 0L12 19.4Z" fill={c}/>
      <path d="M12 19 7.1 10.6M12 19l-1.3-8.4M12 19l1.3-8.4M12 19l4.9-8.4" stroke="#fff" strokeWidth="1.1" opacity=".65" strokeLinecap="round"/>
      <rect x="10.3" y="18.4" width="3.4" height="2.4" rx="1.2" fill={c}/>
    </g>
  ),
  // Nocciola: guscio pieno, cupola in trasparenza, picciolo.
  'frutta-guscio': (c) => (
    <g>
      <path d="M12 21.4c-3.9 0-6.9-2.9-6.9-6.7 0-2.5 1.3-4.7 3.3-5.9h7.2c2 1.2 3.3 3.4 3.3 5.9 0 3.8-3 6.7-6.9 6.7Z" fill={c}/>
      <path d="M6.5 8.6c1.3-1.9 3.2-2.9 5.5-2.9s4.2 1 5.5 2.9c-.9 1-2.9 1.6-5.5 1.6s-4.6-.6-5.5-1.6Z" fill="#fff" opacity=".92"/>
      <path d="M12 6.1V3.2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </g>
  ),
  // Arachide: due lobi e la strozzatura.
  arachidi: (c) => (
    <g>
      <g fill={c}>
        <circle cx="8.5" cy="15.5" r="4.6"/>
        <circle cx="15.5" cy="8.5" r="4.6"/>
        <rect x="8.4" y="9.4" width="7.2" height="5.2" rx="2.6" transform="rotate(-45 12 12)"/>
      </g>
      <circle cx="8.5" cy="15.5" r="1.15" fill="#fff" opacity=".55"/>
      <circle cx="15.5" cy="8.5" r="1.15" fill="#fff" opacity=".55"/>
    </g>
  ),
  // Baccello di soia coi tre semi.
  soia: (c) => (
    <g>
      <path d="M5.5 18.5a4.1 4.1 0 0 1 0-5.8l7.2-7.2a4.1 4.1 0 1 1 5.8 5.8l-7.2 7.2a4.1 4.1 0 0 1-5.8 0Z" fill={c}/>
      <g fill="#fff" opacity=".7">
        <circle cx="8.5" cy="15.5" r="1.5"/>
        <circle cx="12" cy="12" r="1.5"/>
        <circle cx="15.5" cy="8.5" r="1.5"/>
      </g>
    </g>
  ),
  // Lupini: tre semi piatti, ognuno col suo ilo.
  lupini: (c) => (
    <g>
      <g fill={c}>
        <ellipse cx="8.4" cy="9.2" rx="4.3" ry="3.4" transform="rotate(-18 8.4 9.2)"/>
        <ellipse cx="15.7" cy="11.4" rx="4.3" ry="3.4" transform="rotate(14 15.7 11.4)"/>
        <ellipse cx="11.3" cy="16.6" rx="4.3" ry="3.4" transform="rotate(-6 11.3 16.6)"/>
      </g>
      <g fill="#fff" opacity=".55">
        <circle cx="6.6" cy="9.6" r=".85"/>
        <circle cx="17.5" cy="11.2" r=".85"/>
        <circle cx="9.6" cy="17" r=".85"/>
      </g>
    </g>
  ),
  // Sedano: le costole del gambo e la corona di foglie.
  sedano: (c) => (
    <g>
      <path d="M12 21.4V11.8M8.4 21.4c-.7-3.4-.3-6.4 1.3-8.8M15.6 21.4c.7-3.4.3-6.4-1.3-8.8"
        stroke={c} strokeWidth="2.3" strokeLinecap="round"/>
      <g fill={c}>
        <circle cx="12" cy="5.6" r="2.5"/>
        <circle cx="8.1" cy="7.5" r="2.2"/>
        <circle cx="15.9" cy="7.5" r="2.2"/>
        <circle cx="9.9" cy="10.2" r="1.9"/>
        <circle cx="14.1" cy="10.2" r="1.9"/>
      </g>
    </g>
  ),
  // Senape: il flacone da tavola.
  senape: (c) => (
    <g>
      <path d="M10.3 5.7h3.4l1.5 2.2c.5.8.8 1.7.8 2.6v8.2a2.4 2.4 0 0 1-2.4 2.4h-3.2A2.4 2.4 0 0 1 8 18.7v-8.2c0-.9.3-1.8.8-2.6l1.5-2.2Z" fill={c}/>
      <rect x="9.8" y="2.7" width="4.4" height="3.2" rx="1.1" fill={c}/>
      <rect x="9.6" y="12.2" width="4.8" height="4.6" rx="1.1" fill="#fff" opacity=".9"/>
    </g>
  ),
  // Semi di sesamo sparsi.
  sesamo: (c) => (
    <g fill={c}>
      <ellipse cx="8" cy="7.4" rx="1.5" ry="2.5" transform="rotate(-28 8 7.4)"/>
      <ellipse cx="15.6" cy="6.6" rx="1.5" ry="2.5" transform="rotate(24 15.6 6.6)"/>
      <ellipse cx="12" cy="12.3" rx="1.5" ry="2.5" transform="rotate(-8 12 12.3)"/>
      <ellipse cx="6.4" cy="15" rx="1.5" ry="2.5" transform="rotate(34 6.4 15)"/>
      <ellipse cx="17.2" cy="14.6" rx="1.5" ry="2.5" transform="rotate(-20 17.2 14.6)"/>
      <ellipse cx="11.6" cy="18.8" rx="1.5" ry="2.5" transform="rotate(14 11.6 18.8)"/>
    </g>
  ),
  // Calice: i solfiti si dichiarano soprattutto sul vino.
  solfiti: (c) => (
    <g>
      <path d="M6.6 3.4h10.8v3.3a5.4 5.4 0 0 1-10.8 0V3.4Z" fill={c}/>
      <path d="M12 12.1v7.1M8.2 20h7.6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6.6 5.6h10.8" stroke="#fff" strokeWidth="1.2" opacity=".55" strokeLinecap="round"/>
    </g>
  ),
};

function AllergenIcon({ id, size = 22 }) {
  const a = ALLERGENS.find(x => x.id === id);
  if (!a) return null;
  const glyph = ALLERGEN_GLYPHS[a.id];
  return (
    <span title={a.name} aria-label={a.name} style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: a.color + '1A',
      // inset invece del border: il bollino resta esattamente `size`, e in
      // fila non balla di un pixel a seconda del box-sizing.
      boxShadow: `inset 0 0 0 1px ${a.color}38`,
      display: 'inline-grid', placeItems: 'center',
    }}>
      {glyph ? (
        <svg width={Math.round(size * 0.66)} height={Math.round(size * 0.66)} viewBox="0 0 24 24" fill="none" style={{display: 'block'}}>
          {glyph(a.color)}
        </svg>
      ) : (
        <span style={{fontSize: size * 0.5, fontWeight: 800, color: a.color}}>{a.name[0]}</span>
      )}
    </span>
  );
}
window.ALLERGEN_GLYPHS = ALLERGEN_GLYPHS;
window.ALLERGENS = ALLERGENS;
window.AllergenIcon = AllergenIcon;

function ImpMenuCucina() {
  // Deep-link: ?sub=menu|libreria|ingredienti apre la sotto-pagina giusta.
  const [sub, setSub] = React.useState(() => {
    try {
      const s = new URLSearchParams(window.location.search).get('sub');
      if (['menu', 'libreria', 'ingredienti'].includes(s)) return s;
    } catch (e) {}
    return 'menu';
  });
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
const DISH_PHOTO = (id) => `https://images.unsplash.com/${id}?w=200&q=70&auto=format&fit=crop`;
const DISH_LIBRARY = [
  { id:'a1', name: 'Bruschetta al pomodoro', desc: 'Pane casereccio tostato, pomodoro fresco, basilico, aglio', cat: 'Antipasti', allergens: ['glutine'], photo: DISH_PHOTO('photo-1572695157366-5e585ab2b69f') , ingredients: [{name:'Pane casereccio',removable:false,allergens:['glutine']},{name:'Pomodoro',removable:false,allergens:[]},{name:'Basilico',removable:true,allergens:[]},{name:'Aglio',removable:true,allergens:[]},{name:'Olio EVO',removable:false,allergens:[]}]},
  { id:'a2', name: 'Burrata con crudo', desc: 'Burrata pugliese, prosciutto crudo di Parma 24 mesi', cat: 'Antipasti', allergens: ['latte'], photo: DISH_PHOTO('photo-1529312266912-b33cfce2eefd') , ingredients: [{name:'Burrata',removable:false,allergens:['latte']},{name:'Prosciutto crudo',removable:false,allergens:[]},{name:'Rucola',removable:true,allergens:[]}]},
  { id:'a3', name: 'Tagliere salumi e formaggi', desc: 'Selezione di salumi e formaggi locali con marmellate', cat: 'Antipasti', allergens: ['latte','frutta-guscio'], photo: DISH_PHOTO('photo-1541529086526-db283c563270') , ingredients: [{name:'Salumi misti',removable:false,allergens:[]},{name:'Formaggi locali',removable:false,allergens:['latte']},{name:'Marmellata',removable:true,allergens:[]},{name:'Noci',removable:true,allergens:['frutta-guscio']}]},
  { id:'p1', name: 'Carbonara', desc: 'Tonnarelli, guanciale, pecorino, uovo, pepe nero', cat: 'Primi', allergens: ['glutine','uova','latte'], photo: DISH_PHOTO('photo-1612874742237-6526221588e3') , ingredients: [{name:'Tonnarelli',removable:false,allergens:['glutine']},{name:'Guanciale',removable:false,allergens:[]},{name:'Pecorino',removable:false,allergens:['latte']},{name:'Uovo',removable:false,allergens:['uova']},{name:'Pepe nero',removable:true,allergens:[]}]},
  { id:'p2', name: 'Cacio e Pepe', desc: 'Tonnarelli, pecorino romano DOP, pepe nero macinato fresco', cat: 'Primi', allergens: ['glutine','latte'], photo: DISH_PHOTO('photo-1608756687911-aa1599ab3bd9') , ingredients: [{name:'Tonnarelli',removable:false,allergens:['glutine']},{name:'Pecorino romano DOP',removable:false,allergens:['latte']},{name:'Pepe nero',removable:true,allergens:[]}]},
  { id:'p3', name: 'Amatriciana', desc: 'Bucatini, guanciale, pomodoro San Marzano, pecorino', cat: 'Primi', allergens: ['glutine','latte'], photo: DISH_PHOTO('photo-1621996346565-e3dbc646d9a9') , ingredients: [{name:'Bucatini',removable:false,allergens:['glutine']},{name:'Guanciale',removable:false,allergens:[]},{name:'Pomodoro San Marzano',removable:false,allergens:[]},{name:'Pecorino',removable:true,allergens:['latte']}]},
  { id:'s1', name: 'Tagliata di manzo', desc: 'Controfiletto di scottona, rucola, scaglie di grana', cat: 'Secondi', allergens: ['latte'], photo: DISH_PHOTO('photo-1600891964092-4316c288032e') , ingredients: [{name:'Controfiletto di scottona',removable:false,allergens:[]},{name:'Rucola',removable:true,allergens:[]},{name:'Scaglie di grana',removable:true,allergens:['latte']},{name:'Olio EVO',removable:false,allergens:[]}]},
  { id:'s2', name: 'Branzino al forno', desc: 'Branzino in crosta di sale, patate al rosmarino', cat: 'Secondi', allergens: ['pesce'], photo: DISH_PHOTO('photo-1467003909585-2f8a72700288') , ingredients: [{name:'Branzino',removable:false,allergens:['pesce']},{name:'Patate',removable:false,allergens:[]},{name:'Rosmarino',removable:true,allergens:[]},{name:'Sale grosso',removable:false,allergens:[]}]},
  { id:'d1', name: 'Tiramisù della casa', desc: 'Ricetta tradizionale con savoiardi e mascarpone', cat: 'Dolci', allergens: ['glutine','uova','latte'], photo: DISH_PHOTO('photo-1571877227200-a0d98ea607e9') , ingredients: [{name:'Savoiardi',removable:false,allergens:['glutine']},{name:'Mascarpone',removable:false,allergens:['latte']},{name:'Uova',removable:false,allergens:['uova']},{name:'Caffè',removable:false,allergens:[]},{name:'Cacao',removable:true,allergens:[]}]},
  { id:'d2', name: 'Panna cotta ai frutti di bosco', desc: 'Coulis di lamponi e mirtilli', cat: 'Dolci', allergens: ['latte'], photo: DISH_PHOTO('photo-1488477181946-6428a0291777') , ingredients: [{name:'Panna fresca',removable:false,allergens:['latte']},{name:'Lamponi',removable:true,allergens:[]},{name:'Mirtilli',removable:true,allergens:[]},{name:'Zucchero',removable:false,allergens:[]}]},
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

// ─── MENU COMPOSER ───────────────────────────────────────────────────────────
// Tre colonne: le categorie del menù, i piatti della categoria scelta, il
// dettaglio del piatto con l'anteprima di come lo vede il cliente. Il menù su
// cui si lavora si sceglie dal selettore in testata: i menù restano più di uno
// (pranzo, cena, bambini…), semplicemente non occupano più una colonna intera.

const CANALI = [
  { id: 'qr',       label: 'Tavolo (QR)',      icona: 'grid' },
  { id: 'delivery', label: 'Asporto/Delivery', icona: 'commerce-delivery' },
  { id: 'pos',      label: 'Cassa (POS)',      icona: 'commerce-register' },
];
const CANALI_IDS = CANALI.map(c => c.id);
// Un piatto senza `channels` è visibile ovunque: i menù già scritti non hanno
// il campo e non devono sparire dai canali per una colonna che prima non c'era.
const canaliDi = (it) => it.channels || CANALI_IDS;
const prezzoCanale = (it, cid) => {
  const o = it.channelPrices ? it.channelPrices[cid] : undefined;
  if (o === undefined || o === null || o === '') return it.price;
  const n = parseFloat(String(o).replace(',', '.'));
  return isNaN(n) ? it.price : n;
};
const eur = (n) => '€ ' + Number(n || 0).toFixed(2).replace('.', ',');
// Codice leggibile del piatto: iniziali della categoria + posizione nel menù.
const codicePiatto = (catName, i) =>
  '#' + String(catName || 'GEN').replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 3).toUpperCase() +
  '-' + String(100 + (i + 1) * 25).padStart(5, '0');

// L'area di lavoro prende l'altezza che resta nello scroller e le tre colonne
// scorrono ognuna per conto suo. Misurata in px di LAYOUT: il frame del
// gestionale ha uno zoom e i vh non lo considerano.
function useAltezzaColonne(ref) {
  const [h, setH] = React.useState(null);
  React.useLayoutEffect(() => {
    const calc = () => {
      const el = ref.current; if (!el) return;
      const sc = el.closest('.pn-scroll'); if (!sc) return;
      const frame = el.closest('.frame');
      const z = frame ? (parseFloat(getComputedStyle(frame).zoom) || 1) : 1;
      const top = (el.getBoundingClientRect().top - sc.getBoundingClientRect().top) / z + sc.scrollTop;
      setH(Math.max(380, Math.round(sc.clientHeight - top - 24)));
    };
    calc();
    const sc = ref.current && ref.current.closest('.pn-scroll');
    const ro = (sc && window.ResizeObserver) ? new ResizeObserver(calc) : null;
    if (ro) ro.observe(sc);
    window.addEventListener('resize', calc);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', calc); };
  }, []);
  return h;
}

// Il fantasma che segue il cursore mentre si trascina un piatto: la sua foto
// e il suo nome in una pillola, non lo screenshot della card intera. Serve a
// capire cosa si sta spostando anche mentre copre l'elenco delle categorie —
// e a non nascondere il bersaglio sotto un rettangolo grande come la card.
function fantasmaPiatto(e, dish) {
  if (!e.dataTransfer || !e.dataTransfer.setDragImage) return;
  const g = document.createElement('div');
  g.style.cssText = [
    'position:fixed', 'top:-1000px', 'left:-1000px', 'pointer-events:none',
    'display:flex', 'align-items:center', 'gap:10px',
    'padding:7px 16px 7px 7px', 'border-radius:999px', 'background:#fff',
    `box-shadow:0 12px 28px -8px rgba(255,90,95,0.6), 0 0 0 2px ${PN.PINK}`,
    "font-family:'Plus Jakarta Sans',system-ui,sans-serif",
    'font-size:15px', 'font-weight:700', `color:${PN.TEXT}`, 'white-space:nowrap',
  ].join(';');
  const foto = document.createElement('span');
  foto.style.cssText = 'width:32px;height:32px;border-radius:50%;flex:0 0 32px;background:#F1F3F5 center/cover no-repeat' +
    (dish.photo ? `;background-image:url("${dish.photo}")` : '');
  g.appendChild(foto);
  g.appendChild(document.createTextNode(dish.name));
  document.body.appendChild(g);
  e.dataTransfer.setDragImage(g, 26, 23);
  // Il browser ne fa una copia subito: il nodo vero può sparire al giro dopo.
  setTimeout(() => { if (g.parentNode) g.parentNode.removeChild(g); }, 0);
}

// Pannello di colonna: testata ferma, corpo che scorre.
function MCPanel({ title, sub, action, children, style, bodyStyle }) {
  return (
    <section style={{
      background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 14,
      display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden',
      boxShadow: PN.CARD_SHADOW, ...style,
    }}>
      {(title || action) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          padding: '13px 16px', borderBottom: `1px solid ${PN.BORDER_SOFT}`,
        }}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>{title}</div>
            {sub && <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>{sub}</div>}
          </div>
          {action}
        </div>
      )}
      <div className="pn-scroll" style={{flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 14px', ...bodyStyle}}>
        {children}
      </div>
    </section>
  );
}

function MCMenuComposer() {
  const [library, setLibrary] = React.useState(DISH_LIBRARY);
  const [menus, setMenus] = React.useState(MENUS_INIT);
  const [activeMenuId, setActiveMenuId] = React.useState('pranzo');
  const [aiUpload, setAiUpload] = React.useState(false);

  // colonna 1 — categorie
  const [activeCat, setActiveCat] = React.useState('Primi');
  const [addingCat, setAddingCat] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  const [renamingCat, setRenamingCat] = React.useState(null);
  const [catMenuOpen, setCatMenuOpen] = React.useState(null);
  const [dragCat, setDragCat] = React.useState(null);
  const [hoverCat, setHoverCat] = React.useState(null);
  const [sopraCat, setSopraCat] = React.useState(null);   // categoria sotto al cursore mentre si trascina
  const [flashCat, setFlashCat] = React.useState(null);   // categoria che ha appena ricevuto un piatto

  // colonna 2 — piatti
  const [view, setView] = React.useState('grid');
  const [sort, setSort] = React.useState('manuale');
  const [search, setSearch] = React.useState('');
  const [stateFilter, setStateFilter] = React.useState('all');
  const [selectMode, setSelectMode] = React.useState(false);
  const [selection, setSelection] = React.useState([]);
  const [picker, setPicker] = React.useState(null);
  const [editingDish, setEditingDish] = React.useState(null);
  const [editingPrice, setEditingPrice] = React.useState(null);
  const [dragDish, setDragDish] = React.useState(null);

  // colonna 3 — dettaglio
  const [detailId, setDetailId] = React.useState(null);

  const gridRef = React.useRef(null);
  const hCol = useAltezzaColonne(gridRef);

  const activeMenu = menus.find(m => m.id === activeMenuId);
  const totalDishesIn = (m) => m.categories.reduce((s, c) => s + c.items.length, 0);

  // Cambiando menù cambia tutto il contesto: categoria, selezione, dettaglio.
  React.useEffect(() => {
    const m = menus.find(x => x.id === activeMenuId);
    const nomi = m ? m.categories.map(c => c.name) : [];
    setActiveCat(c => (nomi.includes(c) ? c : (nomi[0] || null)));
    setSelection([]); setSelectMode(false); setDetailId(null); setEditingPrice(null);
  }, [activeMenuId]);

  // ── mutators: menù ────────────────────────────────────────────────────────
  const createMenu = (nome) => {
    const id = 'm' + Date.now();
    setMenus(prev => [...prev, { id, name: nome, active: true, categories: [] }]);
    setActiveMenuId(id);
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
      const rimasti = menus.filter(m => m.id !== id);
      if (rimasti.length) setActiveMenuId(rimasti[0].id);
    }
  };
  const duplicateMenu = (id) => {
    const src = menus.find(m => m.id === id); if (!src) return;
    const newId = 'm' + Date.now();
    setMenus(prev => [...prev, { ...src, id: newId, name: src.name + ' (copia)', active: false }]);
    setActiveMenuId(newId);
  };

  // ── mutators: libreria ────────────────────────────────────────────────────
  const upsertLibraryDish = (d) => setLibrary(prev => {
    const i = prev.findIndex(x => x.id === d.id);
    if (i >= 0) { const next = [...prev]; next[i] = {...next[i], ...d}; return next; }
    return [...prev, d];
  });

  // ── mutators: menù attivo ─────────────────────────────────────────────────
  const updateActiveMenu = (fn) => setMenus(prev => prev.map(m => m.id === activeMenuId ? fn(m) : m));
  const addCategoryToMenu = (catName) => {
    updateActiveMenu(m => m.categories.some(c => c.name === catName)
      ? m
      : {...m, categories: [...m.categories, {name: catName, items: []}]});
    setActiveCat(catName);
  };
  const removeCategoryFromMenu = (catName) => {
    updateActiveMenu(m => ({...m, categories: m.categories.filter(c => c.name !== catName)}));
    if (activeCat === catName) {
      const rimaste = (activeMenu ? activeMenu.categories : []).filter(c => c.name !== catName);
      setActiveCat(rimaste.length ? rimaste[0].name : null);
    }
    setDetailId(null); setSelection([]);
  };
  const renameCategory = (oldName, newName) => {
    updateActiveMenu(m => ({...m, categories: m.categories.map(c => c.name === oldName ? {...c, name: newName} : c)}));
    if (activeCat === oldName) setActiveCat(newName);
  };
  const addDishToCategory = (catName, dishId, price = 0) => updateActiveMenu(m => ({...m, categories: m.categories.map(c =>
    c.name === catName
      ? {...c, items: c.items.some(i => i.dishId === dishId) ? c.items : [...c.items, {dishId, price, active: true}]}
      : c)}));
  const removeDishFromCategory = (catName, dishId) => {
    updateActiveMenu(m => ({...m, categories: m.categories.map(c =>
      c.name === catName ? {...c, items: c.items.filter(i => i.dishId !== dishId)} : c)}));
    setSelection(s => s.filter(x => x !== dishId));
    setDetailId(d => d === dishId ? null : d);
  };
  const updateMenuItem = (catName, dishId, patch) => updateActiveMenu(m => ({...m, categories: m.categories.map(c =>
    c.name === catName ? {...c, items: c.items.map(i => i.dishId === dishId ? {...i, ...patch} : i)} : c)}));
  const removeLibraryDish = (id) => {
    setLibrary(prev => prev.filter(x => x.id !== id));
    setMenus(prev => prev.map(m => ({...m, categories: m.categories.map(c => ({...c, items: c.items.filter(it => it.dishId !== id)}))})));
    setDetailId(d => d === id ? null : d);
  };

  // ── riordino e spostamenti ────────────────────────────────────────────────
  const reorderCats = (from, to) => updateActiveMenu(m => {
    if (from === to || from == null || to == null) return m;
    const cs = [...m.categories]; const [x] = cs.splice(from, 1); cs.splice(to, 0, x);
    return {...m, categories: cs};
  });
  const reorderDishes = (catName, from, to) => updateActiveMenu(m => ({...m, categories: m.categories.map(c => {
    if (c.name !== catName || from === to) return c;
    const its = [...c.items]; const [x] = its.splice(from, 1); its.splice(to, 0, x);
    return {...c, items: its};
  })}));
  const moveDishToCat = (fromCat, toCat, dishId) => {
    if (fromCat === toCat) return;
    updateActiveMenu(m => {
      const src = m.categories.find(c => c.name === fromCat);
      const it = src && src.items.find(i => i.dishId === dishId);
      if (!it) return m;
      return {...m, categories: m.categories.map(c => {
        if (c.name === fromCat) return {...c, items: c.items.filter(i => i.dishId !== dishId)};
        if (c.name === toCat)   return {...c, items: c.items.some(i => i.dishId === dishId) ? c.items : [...c.items, it]};
        return c;
      })};
    });
  };

  // ── azioni multiple ───────────────────────────────────────────────────────
  const bulkMove = (toCat) => {
    selection.forEach(id => moveDishToCat(activeCat, toCat, id));
    setSelection([]); setSelectMode(false);
  };
  const bulkRemove = () => {
    updateActiveMenu(m => ({...m, categories: m.categories.map(c =>
      c.name === activeCat ? {...c, items: c.items.filter(i => !selection.includes(i.dishId))} : c)}));
    setDetailId(d => selection.includes(d) ? null : d);
    setSelection([]); setSelectMode(false);
  };
  const bulkPrice = (mode, valore) => {
    const v = parseFloat(String(valore).replace(',', '.'));
    if (isNaN(v)) return;
    const nuovoPrezzo = (p0) => {
      let p = p0;
      if (mode === 'set')     p = v;
      if (mode === 'inc-eur') p = p0 + v;
      if (mode === 'dec-eur') p = p0 - v;
      if (mode === 'inc-pct') p = p0 * (1 + v / 100);
      if (mode === 'dec-pct') p = p0 * (1 - v / 100);
      return Math.max(0, Math.round(p * 100) / 100);
    };
    updateActiveMenu(m => ({
      ...m,
      categories: m.categories.map(c => c.name !== activeCat ? c : {
        ...c,
        items: c.items.map(i => selection.includes(i.dishId) ? {...i, price: nuovoPrezzo(i.price)} : i),
      }),
    }));
    setSelection([]); setSelectMode(false);
  };

  // ── righe della categoria aperta ──────────────────────────────────────────
  const cat = activeMenu ? activeMenu.categories.find(c => c.name === activeCat) : null;
  const rowsAll = cat
    ? cat.items.map((it, i) => ({...it, idx: i, dish: library.find(d => d.id === it.dishId)})).filter(r => r.dish)
    : [];
  const q = search.trim().toLowerCase();
  let rows = rowsAll
    .filter(r => !q || r.dish.name.toLowerCase().includes(q) || (r.dish.desc || '').toLowerCase().includes(q))
    .filter(r => stateFilter === 'all' || (stateFilter === 'active' ? r.active : !r.active));
  if (sort === 'nome')        rows = [...rows].sort((a, b) => a.dish.name.localeCompare(b.dish.name));
  if (sort === 'prezzo-asc')  rows = [...rows].sort((a, b) => a.price - b.price);
  if (sort === 'prezzo-desc') rows = [...rows].sort((a, b) => b.price - a.price);

  const attivi = rowsAll.filter(r => r.active).length;
  const detail = rowsAll.find(r => r.dishId === detailId) || null;

  const toggleSel = (id) => setSelection(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // La testata cambia altezza quando compare la barra delle azioni multiple:
  // le colonne si rimisurano sull'evento che già ascoltano.
  const inSelezione = selection.length > 0;
  React.useEffect(() => { window.dispatchEvent(new Event('resize')); }, [inSelezione]);

  React.useEffect(() => {
    if (!catMenuOpen) return;
    const chiudi = () => setCatMenuOpen(null);
    document.addEventListener('mousedown', chiudi);
    return () => document.removeEventListener('mousedown', chiudi);
  }, [catMenuOpen]);

  return (
    <div>
      <style>{`
        @keyframes mcArrivo {
          0%   { transform: scale(1.06); box-shadow: 0 0 0 0 rgba(255,90,95,.55); background: ${PN.PINK_SOFT}; }
          55%  { transform: scale(1); }
          100% { transform: scale(1); box-shadow: 0 0 0 12px rgba(255,90,95,0); }
        }
        @keyframes mcPiuUno {
          0%   { opacity: 0; transform: translateY(4px) scale(.8); }
          25%  { opacity: 1; transform: translateY(-2px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-18px) scale(1); }
        }
        @keyframes mcInVolo {
          0%, 100% { transform: scale(.94) rotate(-1.4deg); }
          50%      { transform: scale(.94) rotate(1.4deg); }
        }
      `}</style>
      {/* Testata: il menù su cui si lavora — oppure, quando ci sono piatti
          selezionati, la barra delle azioni multiple. */}
      {selection.length > 0 ? (
        <MCBulkBar
          count={selection.length}
          categorie={(activeMenu ? activeMenu.categories : []).map(c => c.name).filter(n => n !== activeCat)}
          onClear={() => { setSelection([]); setSelectMode(false); }}
          onMove={bulkMove}
          onPrice={bulkPrice}
          onDelete={bulkRemove}
        />
      ) : (
        <MCMenuSwitcher
          menus={menus}
          activeMenuId={activeMenuId}
          onPick={setActiveMenuId}
          onCreate={createMenu}
          onUpdate={updateMenu}
          onDelete={deleteMenu}
          onDuplicate={duplicateMenu}
          totalDishesIn={totalDishesIn}
          onAiUpload={() => setAiUpload(true)}
        />
      )}

      <div ref={gridRef} style={{
        display: 'grid', gridTemplateColumns: '236px minmax(0, 1fr) 372px',
        gap: 14, height: hCol || undefined, alignItems: 'stretch',
      }}>
        {/* ── Colonna 1: categorie ─────────────────────────────────────── */}
        <MCPanel title="Categorie" bodyStyle={{padding: '10px 10px 12px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
            {(activeMenu ? activeMenu.categories : []).map((c, i) => {
              const on = c.name === activeCat;
              const inRinomina = renamingCat === c.name;
              // Mentre un piatto è in volo la colonna smette di essere un elenco
              // e diventa un tabellone di bersagli: quelle che possono
              // riceverlo si accendono, quella sotto al cursore si riempie.
              const riceve = !!dragDish && dragDish.cat !== c.name;
              const rifiuta = !!dragDish && dragDish.cat === c.name;
              const sopra = sopraCat === c.name && riceve;
              const lineaSopra = dragCat !== null && sopraCat === c.name && dragCat !== i;
              return (
                <div
                  key={c.name}
                  draggable={!inRinomina}
                  onDragStart={e => { setDragCat(i); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragEnd={() => { setDragCat(null); setSopraCat(null); }}
                  onDragOver={e => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = rifiuta ? 'none' : 'move';
                    setSopraCat(s => s === c.name ? s : c.name);
                  }}
                  onDragLeave={() => setSopraCat(s => s === c.name ? null : s)}
                  onDrop={e => {
                    e.preventDefault();
                    setSopraCat(null);
                    if (dragDish) {
                      if (dragDish.cat !== c.name) {
                        moveDishToCat(dragDish.cat, c.name, dragDish.dishId);
                        setFlashCat(c.name);
                        setTimeout(() => setFlashCat(f => f === c.name ? null : f), 1100);
                      }
                      setDragDish(null);
                    } else if (dragCat !== null) { reorderCats(dragCat, i); setDragCat(null); }
                  }}
                  onClick={() => { if (!inRinomina) { setActiveCat(c.name); setDetailId(null); setSelection([]); } }}
                  style={{
                    position: 'relative',
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 10px', borderRadius: 9,
                    cursor: dragDish ? (rifiuta ? 'no-drop' : 'copy') : 'pointer',
                    background: sopra ? PN.PINK : (riceve ? PN.PINK_BG_SOFT : (on ? PN.PINK_SOFT : 'transparent')),
                    color: sopra ? PN.WHITE : (on ? PN.PINK_DARK : PN.TEXT),
                    boxShadow: sopra
                      ? '0 8px 20px -8px rgba(255,90,95,0.65)'
                      : (riceve ? `inset 0 0 0 1.5px ${PN.PINK_SOFT}` : (lineaSopra ? `inset 0 2px 0 ${PN.PINK}` : 'none')),
                    opacity: (dragCat === i || rifiuta) ? 0.42 : 1,
                    transform: sopra ? 'scale(1.035)' : 'none',
                    transition: 'background 160ms ease-out, box-shadow 160ms ease-out, transform 160ms ease-out, opacity 160ms ease-out, color 160ms ease-out',
                    animation: flashCat === c.name ? 'mcArrivo 1s cubic-bezier(.22,.9,.35,1)' : 'none',
                  }}
                  onMouseEnter={e => { setHoverCat(c.name); if (!on && !dragDish) e.currentTarget.style.background = '#F7F8FA'; }}
                  onMouseLeave={e => { setHoverCat(h => h === c.name ? null : h); if (!on && !dragDish) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span title="Trascina per riordinare" style={{color: sopra ? PN.WHITE : (on ? PN.PINK : PN.MUTED_LIGHT), cursor: 'grab', display: 'inline-flex'}}>
                    <PnI.Drag size={12}/>
                  </span>
                  <span style={{display: 'inline-flex', color: sopra ? PN.WHITE : (on ? PN.PINK_DARK : PN.MUTED)}}>
                    <Icon name={CAT_ICON[c.name] || 'star'} size={16}/>
                  </span>
                  {inRinomina ? (
                    <input
                      autoFocus defaultValue={c.name}
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => {
                        e.stopPropagation();
                        if (e.key === 'Enter' && e.target.value.trim()) { renameCategory(c.name, e.target.value.trim()); setRenamingCat(null); }
                        if (e.key === 'Escape') setRenamingCat(null);
                      }}
                      onBlur={e => { if (e.target.value.trim() && e.target.value.trim() !== c.name) renameCategory(c.name, e.target.value.trim()); setRenamingCat(null); }}
                      style={{flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', border: 'none', outline: `2px solid ${PN.PINK}`, borderRadius: 5, padding: '1px 5px', background: PN.WHITE, color: PN.TEXT}}
                    />
                  ) : (
                    <span style={{flex: 1, minWidth: 0, fontSize: 15, fontWeight: on ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{c.name}</span>
                  )}
                  {/* Il conteggio lascia il posto a un «+» quando la categoria
                      sta per ricevere: dice cosa succede lasciando adesso. */}
                  <span style={{position: 'relative', minWidth: 16, textAlign: 'right', flexShrink: 0}}>
                    <span style={{fontSize: 13, fontWeight: 800, color: sopra ? PN.WHITE : (on ? PN.PINK_DARK : PN.MUTED)}}>
                      {sopra ? '+1' : c.items.length}
                    </span>
                    {flashCat === c.name && (
                      <span aria-hidden style={{
                        position: 'absolute', right: 0, top: -2, fontSize: 12.5, fontWeight: 800,
                        color: PN.PINK, pointerEvents: 'none',
                        animation: 'mcPiuUno 1s cubic-bezier(.22,.9,.35,1) forwards',
                      }}>+1</span>
                    )}
                  </span>
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); setCatMenuOpen(o => o === c.name ? null : c.name); }}
                    title="Azioni categoria"
                    style={{
                      width: 20, height: 20, borderRadius: 5, border: 'none', flexShrink: 0,
                      background: catMenuOpen === c.name ? '#EDEFF2' : 'transparent',
                      color: PN.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center',
                      fontSize: 15, lineHeight: 1,
                      // Sta lì solo quando serve: a riposo la colonna resta un elenco pulito.
                      opacity: (hoverCat === c.name || catMenuOpen === c.name) ? 1 : 0,
                      transition: 'opacity 120ms ease-out',
                    }}
                  >⋯</button>
                  {catMenuOpen === c.name && (
                    <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} style={{
                      position: 'absolute', top: 'calc(100% - 2px)', right: 4, zIndex: 60,
                      minWidth: 178, background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
                      borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', padding: 5,
                    }}>
                      <MenuDotItem icon="✏" onClick={() => { setRenamingCat(c.name); setCatMenuOpen(null); }}>Rinomina</MenuDotItem>
                      <MenuDotItem icon="＋" onClick={() => { setActiveCat(c.name); setPicker(c.name); setCatMenuOpen(null); }}>Aggiungi piatto</MenuDotItem>
                      <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
                      <MenuDotItem icon="🗑" danger onClick={() => {
                        setCatMenuOpen(null);
                        if (confirm(`Rimuovere la categoria "${c.name}" da questo menù? I piatti restano nella libreria.`)) removeCategoryFromMenu(c.name);
                      }}>Rimuovi dal menù</MenuDotItem>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {addingCat ? (
            <div style={{marginTop: 10, padding: 10, border: `1.5px solid ${PN.PINK}`, background: PN.PINK_SOFT, borderRadius: 10}}>
              <input
                autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCatName.trim()) { addCategoryToMenu(newCatName.trim()); setNewCatName(''); setAddingCat(false); }
                  if (e.key === 'Escape') { setAddingCat(false); setNewCatName(''); }
                }}
                placeholder="Nome categoria"
                style={{width: '100%', padding: '7px 9px', border: `1px solid ${PN.BORDER}`, borderRadius: 7, fontSize: 14.5, fontFamily: 'inherit', outline: 'none', fontWeight: 600}}
              />
              <div style={{display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8}}>
                <button onClick={() => { setAddingCat(false); setNewCatName(''); }} style={{padding: '5px 9px', background: 'transparent', border: 'none', color: PN.MUTED, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit'}}>Annulla</button>
                <button onClick={() => { if (newCatName.trim()) { addCategoryToMenu(newCatName.trim()); setNewCatName(''); setAddingCat(false); } }}
                  style={{padding: '5px 11px', background: newCatName.trim() ? PN.PINK : '#E5E7EB', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'}}>Crea</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingCat(true)} style={{
              width: '100%', marginTop: 10, padding: '11px 12px', borderRadius: 10,
              border: `1.5px dashed ${PN.PINK_SOFT}`, background: PN.PINK_BG_SOFT,
              color: PN.PINK_DARK, fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background 150ms ease-out',
            }}
            onMouseEnter={e => e.currentTarget.style.background = PN.PINK_SOFT}
            onMouseLeave={e => e.currentTarget.style.background = PN.PINK_BG_SOFT}
            ><PnI.Plus size={12}/> Nuova categoria</button>
          )}

          <div style={{
            marginTop: 10, padding: '10px 12px', borderRadius: 10,
            background: dragDish ? PN.PINK_BG_SOFT : '#F7F8FA',
            color: dragDish ? PN.PINK_DARK : PN.MUTED,
            display: 'flex', alignItems: 'flex-start', gap: 8,
            transition: 'background 160ms ease-out, color 160ms ease-out',
          }}>
            <span style={{marginTop: 2, display: 'inline-flex', color: dragDish ? PN.PINK : PN.MUTED_SOFT}}><PnI.Drag size={12}/></span>
            <div style={{fontSize: 13, lineHeight: 1.4}}>
              {dragDish ? (
                <>
                  <div style={{fontWeight: 700}}>Lascia su una categoria</div>
                  <div style={{fontSize: 12.5, marginTop: 1, opacity: .85}}>«{(library.find(d => d.id === dragDish.dishId) || {}).name}» ci si sposta dentro</div>
                </>
              ) : (
                <>
                  <div style={{fontWeight: 700, color: PN.MUTED}}>Trascina per riordinare</div>
                  <div style={{fontSize: 12.5, marginTop: 1}}>o sposta un piatto tra le categorie</div>
                </>
              )}
            </div>
          </div>
        </MCPanel>

        {/* ── Colonna 2: piatti della categoria ────────────────────────── */}
        <MCPiattiPanel
          menu={activeMenu}
          catName={activeCat}
          rows={rows}
          totali={rowsAll.length}
          attivi={attivi}
          disattivati={rowsAll.length - attivi}
          view={view} setView={setView}
          sort={sort} setSort={setSort}
          search={search} setSearch={setSearch}
          stateFilter={stateFilter} setStateFilter={setStateFilter}
          selectMode={selectMode} setSelectMode={setSelectMode}
          selection={selection} setSelection={setSelection} toggleSel={toggleSel}
          detailId={detailId} setDetailId={setDetailId}
          editingPrice={editingPrice} setEditingPrice={setEditingPrice}
          onUpdateItem={updateMenuItem}
          onRemoveDish={removeDishFromCategory}
          onOpenPicker={() => setPicker(activeCat)}
          onNuovaCategoria={() => setAddingCat(true)}
          dragDish={dragDish} setDragDish={setDragDish}
          onReorder={reorderDishes}
        />

        {/* ── Colonna 3: dettaglio + anteprima ─────────────────────────── */}
        <div className="pn-scroll" style={{display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflowY: 'auto', paddingRight: 2}}>
          {/* Senza un piatto aperto il pannello non c'è: un riquadro che dice
              «scegli un piatto» occupa mezza colonna per non dire niente, e
              l'anteprima sale in cima dove si guarda. */}
          {detail && (
            <MCDettagliPiatto
              key={detail.dishId}
              dish={detail.dish}
              item={detail}
              codice={codicePiatto(activeCat, detail.idx)}
              catName={activeCat}
              categorie={(activeMenu ? activeMenu.categories : []).map(c => c.name)}
              onClose={() => setDetailId(null)}
              onSaveDish={upsertLibraryDish}
              onUpdateItem={(patch) => updateMenuItem(activeCat, detail.dishId, patch)}
              onRemoveFromMenu={() => removeDishFromCategory(activeCat, detail.dishId)}
              onDeleteFromLibrary={() => removeLibraryDish(detail.dishId)}
              onMoveCat={(to) => { moveDishToCat(activeCat, to, detail.dishId); setActiveCat(to); }}
            />
          )}

          <MCAnteprimaMenu
            menu={activeMenu}
            library={library}
            catName={activeCat}
            evidenzia={detailId}
          />
        </div>
      </div>

      {/* ── Modali ───────────────────────────────────────────────────────── */}
      {picker && (
        <DishLibraryPicker
          library={library}
          excludeIds={((activeMenu && activeMenu.categories.find(c => c.name === picker)) ? activeMenu.categories.find(c => c.name === picker).items : []).map(i => i.dishId)}
          catName={picker}
          menuName={activeMenu ? activeMenu.name : ''}
          onClose={() => setPicker(null)}
          onPick={(id, price) => { addDishToCategory(picker, id, price); }}
          onCreateNew={() => { const c = picker; setPicker(null); setEditingDish({dishId: null, catName: c, isNew: true}); }}
        />
      )}

      {editingDish && (
        <DishEditModal
          {...editingDish}
          dish={editingDish.dishId ? library.find(d => d.id === editingDish.dishId) : null}
          onClose={() => setEditingDish(null)}
          onSave={(d) => {
            const id = d.id || ('new' + Date.now());
            upsertLibraryDish({...d, id});
            if (editingDish.isNew && editingDish.catName) addDishToCategory(editingDish.catName, id, d._initialPrice ?? 0);
            else if (!editingDish.isNew && editingDish.catName && d._initialPrice !== undefined) updateMenuItem(editingDish.catName, id, {price: d._initialPrice});
            setEditingDish(null);
          }}
        />
      )}

      {aiUpload && (
        <AIMenuUploadModal
          onClose={() => setAiUpload(false)}
          onImport={({ menuName, categories, dishes }) => {
            setLibrary(prev => {
              const next = [...prev];
              dishes.forEach(d => { if (!next.find(x => x.id === d.id)) next.push(d); });
              return next;
            });
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

// ─── Testata: selettore del menù su cui si lavora ───────────────────────────
function MCMenuSwitcher({ menus, activeMenuId, onPick, onCreate, onUpdate, onDelete, onDuplicate, totalDishesIn, onAiUpload }) {
  const [open, setOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [nuovo, setNuovo] = React.useState('');
  const [renaming, setRenaming] = React.useState(null);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const m = menus.find(x => x.id === activeMenuId);
  const box = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const fuori = (e) => { if (box.current && !box.current.contains(e.target)) { setOpen(false); setConfirmDel(null); } };
    document.addEventListener('mousedown', fuori);
    return () => document.removeEventListener('mousedown', fuori);
  }, [open]);

  if (!m) return null;
  const crea = () => { if (!nuovo.trim()) return; onCreate(nuovo.trim()); setNuovo(''); setCreating(false); setOpen(false); };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
      padding: '10px 14px', background: PN.WHITE,
      border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 12, boxShadow: PN.CARD_SHADOW,
    }}>
      <div ref={box} style={{position: 'relative'}}>
        <button onClick={() => setOpen(o => !o)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          padding: '7px 12px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
          border: `1px solid ${open ? PN.PINK : PN.BORDER}`, background: open ? PN.PINK_BG_SOFT : PN.WHITE,
          transition: 'border-color 150ms ease-out, background 150ms ease-out',
        }}>
          <span style={{display: 'inline-flex', color: PN.PINK}}><Icon name="food-meal" size={16}/></span>
          <span style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>{m.name}</span>
          <span style={{fontSize: 13, color: PN.MUTED}}>{totalDishesIn(m)} piatti</span>
          <span style={{display: 'inline-flex', color: PN.MUTED, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease-out'}}>
            <PnI.ChevronDown size={12}/>
          </span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 80,
            width: 330, background: PN.WHITE, border: `1px solid ${PN.BORDER}`,
            borderRadius: 12, boxShadow: '0 14px 38px rgba(15,17,21,0.14)', padding: 6,
          }}>
            <div style={{fontSize: 12, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', padding: '6px 8px 4px'}}>I tuoi menù</div>
            {menus.map(x => {
              const on = x.id === activeMenuId;
              const inRinomina = renaming === x.id;
              return (
                <div key={x.id} onClick={() => { if (!inRinomina) { onPick(x.id); setOpen(false); } }} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', borderRadius: 9,
                  background: on ? PN.PINK_SOFT : 'transparent', cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#F7F8FA'; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{flex: 1, minWidth: 0}}>
                    {inRinomina ? (
                      <input autoFocus defaultValue={x.name}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter' && e.target.value.trim()) { onUpdate(x.id, {name: e.target.value.trim()}); setRenaming(null); } if (e.key === 'Escape') setRenaming(null); }}
                        onBlur={e => { if (e.target.value.trim()) onUpdate(x.id, {name: e.target.value.trim()}); setRenaming(null); }}
                        style={{width: '100%', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', border: 'none', outline: `2px solid ${PN.PINK}`, borderRadius: 5, padding: '1px 5px', background: PN.WHITE}}
                      />
                    ) : (
                      <div style={{fontSize: 15, fontWeight: 700, color: on ? PN.PINK_DARK : PN.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{x.name}</div>
                    )}
                    <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {totalDishesIn(x)} piatti{x.schedule ? ' · ' + x.schedule : ''}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onUpdate(x.id, {active: !x.active}); }}
                    title={x.active ? 'Clicca per disattivare' : 'Clicca per attivare'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
                      padding: '2px 8px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: 11.5, fontWeight: 800, letterSpacing: 0.3,
                      background: x.active ? PN.GREEN_SOFT : '#F1F3F5', color: x.active ? PN.GREEN : PN.MUTED,
                    }}>
                    <span style={{width: 5, height: 5, borderRadius: '50%', background: x.active ? PN.GREEN : '#9CA3AF'}}/>
                    {x.active ? 'ATTIVO' : 'OFF'}
                  </button>
                  <div style={{display: 'flex', gap: 1, flexShrink: 0}}>
                    <MCMiniAzione title="Rinomina" onClick={e => { e.stopPropagation(); setRenaming(x.id); }}><Icon name="pencil" size={12}/></MCMiniAzione>
                    <MCMiniAzione title="Duplica" onClick={e => { e.stopPropagation(); onDuplicate(x.id); setOpen(false); }}><span style={{fontSize: 13}}>⧉</span></MCMiniAzione>
                    {menus.length > 1 && (
                      <MCMiniAzione title="Elimina" danger onClick={e => { e.stopPropagation(); setConfirmDel(x.id); }}><PnI.Trash size={11}/></MCMiniAzione>
                    )}
                  </div>
                </div>
              );
            })}

            {confirmDel && (
              <div style={{margin: '6px 4px 2px', padding: 9, borderRadius: 9, background: '#FEF2F2', border: '1px solid #FECACA'}}>
                <div style={{fontSize: 13.5, color: PN.TEXT, marginBottom: 8, lineHeight: 1.4}}>
                  Eliminare «{(menus.find(x => x.id === confirmDel) || {}).name}»? I piatti restano nella libreria.
                </div>
                <div style={{display: 'flex', gap: 6}}>
                  <button onClick={() => setConfirmDel(null)} style={{flex: 1, padding: '5px 0', fontSize: 13.5, fontWeight: 600, background: PN.WHITE, border: `1px solid ${PN.BORDER}`, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', color: PN.TEXT}}>Annulla</button>
                  <button onClick={() => { onDelete(confirmDel); setConfirmDel(null); }} style={{flex: 1, padding: '5px 0', fontSize: 13.5, fontWeight: 700, background: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', color: '#fff'}}>Elimina</button>
                </div>
              </div>
            )}

            <div style={{height: 1, background: PN.BORDER_SOFT, margin: '6px 4px'}}/>
            {creating ? (
              <div style={{padding: '4px 4px 2px'}}>
                <input autoFocus value={nuovo} onChange={e => setNuovo(e.target.value)} placeholder="Nome menù (es. Cena)"
                  onKeyDown={e => { if (e.key === 'Enter') crea(); if (e.key === 'Escape') { setCreating(false); setNuovo(''); } }}
                  style={{width: '100%', padding: '7px 10px', border: `1px solid ${PN.BORDER}`, borderRadius: 7, fontSize: 14.5, fontFamily: 'inherit', outline: 'none', fontWeight: 600}}/>
                <div style={{display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 7}}>
                  <button onClick={() => { setCreating(false); setNuovo(''); }} style={{padding: '5px 9px', background: 'transparent', border: 'none', color: PN.MUTED, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit'}}>Annulla</button>
                  <button onClick={crea} disabled={!nuovo.trim()} style={{padding: '5px 12px', background: nuovo.trim() ? PN.PINK : '#E5E7EB', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: nuovo.trim() ? 'pointer' : 'default', fontFamily: 'inherit'}}>Crea</button>
                </div>
              </div>
            ) : (
              <MenuDotItem icon="＋" onClick={() => setCreating(true)}>Nuovo menù</MenuDotItem>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onUpdate(m.id, {active: !m.active})}
        title={m.active ? 'Clicca per disattivare' : 'Clicca per attivare'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
          padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 12, fontWeight: 800, letterSpacing: 0.4,
          background: m.active ? PN.GREEN_SOFT : '#F1F3F5', color: m.active ? PN.GREEN : PN.MUTED,
        }}>
        <span style={{width: 6, height: 6, borderRadius: '50%', background: m.active ? PN.GREEN : '#9CA3AF'}}/>
        {m.active ? 'ATTIVO' : 'DISATTIVATO'}
      </button>
      {m.schedule && <span style={{fontSize: 13.5, color: PN.MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m.schedule}</span>}

      <span style={{flex: 1}}/>

      <div style={{width: 206, flexShrink: 0}}>
        <AiUploadCta onClick={onAiUpload}>
          <span style={{display: 'block', textAlign: 'left', lineHeight: 1.2, whiteSpace: 'nowrap'}}>
            <span style={{display: 'block', fontSize: 14.5}}>Carica menu con AI</span>
            <span style={{display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.75}}>PDF / foto · piatti e prezzi</span>
          </span>
        </AiUploadCta>
      </div>
    </div>
  );
}

function MCMiniAzione({ children, title, danger, onClick }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent',
      cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 12,
      color: danger ? PN.RED : PN.MUTED, fontFamily: 'inherit',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? '#FEF2F2' : '#EDEFF2'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
  );
}

// ─── Barra delle azioni multiple ────────────────────────────────────────────
function MCBulkBar({ count, categorie, onClear, onMove, onPrice, onDelete }) {
  const [aperto, setAperto] = React.useState(null); // 'sposta' | 'prezzo' | 'elimina'
  const [mode, setMode] = React.useState('set');
  const [valore, setValore] = React.useState('');
  const box = React.useRef(null);
  React.useEffect(() => {
    if (!aperto) return;
    const fuori = (e) => { if (box.current && !box.current.contains(e.target)) setAperto(null); };
    document.addEventListener('mousedown', fuori);
    return () => document.removeEventListener('mousedown', fuori);
  }, [aperto]);

  const Azione = ({ id, icona, children, danger }) => (
    <button onClick={() => setAperto(a => a === id ? null : id)} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '8px 14px', borderRadius: 9, fontFamily: 'inherit',
      fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
      border: `1px solid ${aperto === id ? (danger ? PN.RED : PN.TEXT) : PN.BORDER}`,
      background: PN.WHITE, color: danger ? PN.RED : PN.TEXT,
      transition: 'border-color 150ms ease-out, background 150ms ease-out',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? '#FEF2F2' : '#F7F8FA'}
    onMouseLeave={e => e.currentTarget.style.background = PN.WHITE}
    >{icona}{children}</button>
  );

  return (
    <div ref={box} style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
      padding: '10px 14px', background: PN.WHITE,
      border: `1px solid ${PN.PINK_SOFT}`, borderRadius: 12, boxShadow: PN.CARD_SHADOW,
    }}>
      <span style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>
        {count} {count === 1 ? 'piatto selezionato' : 'piatti selezionati'}
      </span>
      <button onClick={onClear} title="Annulla selezione" style={{
        width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent',
        color: PN.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#EDEFF2'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      ><PnI.X size={13}/></button>

      <span style={{width: 1, height: 24, background: PN.BORDER_SOFT, margin: '0 4px'}}/>

      <Azione id="sposta" icona={<PnI.Plus size={13}/>}>Sposta</Azione>
      <Azione id="prezzo" icona={<span style={{fontSize: 14}}>↗</span>}>Modifica prezzo</Azione>
      <Azione id="elimina" danger icona={<PnI.Trash size={13}/>}>Elimina</Azione>

      {aperto === 'sposta' && (
        <div style={{position: 'absolute', top: 'calc(100% + 6px)', left: 190, zIndex: 80, minWidth: 210, background: PN.WHITE, border: `1px solid ${PN.BORDER}`, borderRadius: 11, boxShadow: '0 14px 38px rgba(15,17,21,0.14)', padding: 6}}>
          <div style={{fontSize: 12, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', padding: '6px 8px 4px'}}>Sposta in</div>
          {categorie.length === 0 && <div style={{padding: '8px 10px', fontSize: 14, color: PN.MUTED}}>Non ci sono altre categorie in questo menù.</div>}
          {categorie.map(c => (
            <MenuDotItem key={c} icon={<Icon name={CAT_ICON[c] || 'star'} size={14}/>} onClick={() => { onMove(c); setAperto(null); }}>{c}</MenuDotItem>
          ))}
        </div>
      )}

      {aperto === 'prezzo' && (
        <div style={{position: 'absolute', top: 'calc(100% + 6px)', left: 280, zIndex: 80, width: 280, background: PN.WHITE, border: `1px solid ${PN.BORDER}`, borderRadius: 11, boxShadow: '0 14px 38px rgba(15,17,21,0.14)', padding: 12}}>
          <div style={{fontSize: 12, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8}}>Modifica prezzo</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10}}>
            {[
              {id: 'set', l: 'Imposta a'}, {id: 'inc-pct', l: 'Aumenta %'},
              {id: 'dec-pct', l: 'Riduci %'}, {id: 'inc-eur', l: 'Aumenta €'},
              {id: 'dec-eur', l: 'Riduci €'},
            ].map(o => (
              <button key={o.id} onClick={() => setMode(o.id)} style={{
                padding: '7px 8px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${mode === o.id ? PN.PINK : PN.BORDER}`,
                background: mode === o.id ? PN.PINK_SOFT : PN.WHITE,
                color: mode === o.id ? PN.PINK_DARK : PN.TEXT,
              }}>{o.l}</button>
            ))}
          </div>
          <input autoFocus value={valore} onChange={e => setValore(e.target.value)} placeholder={mode.includes('pct') ? 'es. 10' : 'es. 1,50'}
            onKeyDown={e => { if (e.key === 'Enter') { onPrice(mode, valore); setValore(''); setAperto(null); } }}
            style={{width: '100%', padding: '9px 11px', border: `1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 15, fontFamily: 'inherit', outline: 'none'}}/>
          <div style={{display: 'flex', gap: 7, justifyContent: 'flex-end', marginTop: 10}}>
            <ImpButton variant="ghost" onClick={() => setAperto(null)} style={{padding: '7px 12px', fontSize: 14}}>Annulla</ImpButton>
            <ImpButton variant="pink" onClick={() => { onPrice(mode, valore); setValore(''); setAperto(null); }} style={{padding: '7px 12px', fontSize: 14}}>Applica</ImpButton>
          </div>
        </div>
      )}

      {aperto === 'elimina' && (
        <div style={{position: 'absolute', top: 'calc(100% + 6px)', left: 430, zIndex: 80, width: 290, background: PN.WHITE, border: `1px solid ${PN.BORDER}`, borderRadius: 11, boxShadow: '0 14px 38px rgba(15,17,21,0.14)', padding: 12}}>
          <div style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.45, marginBottom: 10}}>
            Togliere <strong>{count}</strong> {count === 1 ? 'piatto' : 'piatti'} da questo menù? Restano nella libreria.
          </div>
          <div style={{display: 'flex', gap: 7, justifyContent: 'flex-end'}}>
            <ImpButton variant="ghost" onClick={() => setAperto(null)} style={{padding: '7px 12px', fontSize: 14}}>Annulla</ImpButton>
            <ImpButton variant="danger" onClick={() => { onDelete(); setAperto(null); }} style={{padding: '7px 12px', fontSize: 14}}>Togli dal menù</ImpButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Colonna 2: i piatti della categoria aperta ─────────────────────────────
function MCPiattiPanel({
  menu, catName, rows, totali, attivi, disattivati,
  view, setView, sort, setSort, search, setSearch, stateFilter, setStateFilter,
  selectMode, setSelectMode, selection, setSelection, toggleSel,
  detailId, setDetailId, editingPrice, setEditingPrice,
  onUpdateItem, onRemoveDish, onOpenPicker, onNuovaCategoria,
  dragDish, setDragDish, onReorder,
}) {
  const [sortOpen, setSortOpen] = React.useState(false);
  const [cardMenu, setCardMenu] = React.useState(null);
  const sortBox = React.useRef(null);
  React.useEffect(() => {
    if (!sortOpen) return;
    const fuori = (e) => { if (sortBox.current && !sortBox.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('mousedown', fuori);
    return () => document.removeEventListener('mousedown', fuori);
  }, [sortOpen]);

  // Il menù ⋯ di una card si chiude al primo click altrove, come tutti gli altri.
  React.useEffect(() => {
    if (!cardMenu) return;
    const chiudi = () => setCardMenu(null);
    document.addEventListener('mousedown', chiudi);
    return () => document.removeEventListener('mousedown', chiudi);
  }, [cardMenu]);

  const SORTS = [
    {id: 'manuale', l: 'Ordine del menù'},
    {id: 'nome', l: 'Nome A–Z'},
    {id: 'prezzo-asc', l: 'Prezzo crescente'},
    {id: 'prezzo-desc', l: 'Prezzo decrescente'},
  ];

  if (!menu) return <MCPanel title="Piatti"><div style={{color: PN.MUTED, fontSize: 15}}>Nessun menù selezionato.</div></MCPanel>;

  if (!catName) {
    return (
      <MCPanel title={menu.name} sub="Nessuna categoria in questo menù">
        <div style={{padding: '40px 20px', textAlign: 'center', background: '#FAFBFC', border: `1.5px dashed ${PN.BORDER}`, borderRadius: 12, color: PN.MUTED}}>
          <div style={{fontSize: 34, marginBottom: 10}}>🍽</div>
          <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Questo menù è vuoto</div>
          <div style={{fontSize: 14.5, marginBottom: 14}}>Crea una categoria per iniziare ad aggiungere piatti</div>
          <ImpButton variant="pink" icon={<PnI.Plus size={13}/>} onClick={onNuovaCategoria}>Nuova categoria</ImpButton>
        </div>
      </MCPanel>
    );
  }

  const testata = (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0}}>
      <label style={{display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, border: `1px solid ${selectMode ? PN.PINK : PN.BORDER}`, background: selectMode ? PN.PINK_BG_SOFT : PN.WHITE}}>
        <input type="checkbox" checked={selectMode} onChange={e => { setSelectMode(e.target.checked); if (!e.target.checked) setSelection([]); }} style={{accentColor: PN.PINK, margin: 0, width: 15, height: 15}}/>
        <span style={{fontSize: 14, fontWeight: 600, color: selectMode ? PN.PINK_DARK : PN.TEXT}}>Seleziona</span>
      </label>

      <div ref={sortBox} style={{position: 'relative'}}>
        <button onClick={() => setSortOpen(o => !o)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 8,
          border: `1px solid ${sortOpen ? PN.TEXT : PN.BORDER}`, background: PN.WHITE, cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: PN.TEXT,
        }}>
          Ordina <PnI.ChevronDown size={11}/>
        </button>
        {sortOpen && (
          <div style={{position: 'absolute', top: 'calc(100% + 5px)', right: 0, zIndex: 70, minWidth: 190, background: PN.WHITE, border: `1px solid ${PN.BORDER}`, borderRadius: 10, boxShadow: '0 10px 30px rgba(15,17,21,0.13)', padding: 5}}>
            {SORTS.map(s => (
              <MenuDotItem key={s.id} icon={sort === s.id ? <PnI.Check size={13}/> : ' '} onClick={() => { setSort(s.id); setSortOpen(false); }}>{s.l}</MenuDotItem>
            ))}
          </div>
        )}
      </div>

      <div style={{display: 'flex', border: `1px solid ${PN.BORDER}`, borderRadius: 8, overflow: 'hidden'}}>
        {[
          {id: 'grid', title: 'Griglia', svg: <><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/></>},
          {id: 'list', title: 'Elenco', svg: <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>},
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} title={v.title} style={{
            width: 32, height: 30, border: 'none', cursor: 'pointer',
            background: view === v.id ? PN.TEXT : PN.WHITE,
            color: view === v.id ? PN.WHITE : PN.MUTED,
            display: 'grid', placeItems: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{v.svg}</svg>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <MCPanel
      title={<span style={{display: 'inline-flex', alignItems: 'baseline', gap: 9}}>
        <span>{catName}</span>
        <span style={{fontSize: 13.5, fontWeight: 500, color: PN.MUTED}}>{totali} {totali === 1 ? 'piatto' : 'piatti'}{rows.length !== totali ? ` · ${rows.length} in elenco` : ''}</span>
      </span>}
      action={testata}
      bodyStyle={{padding: '12px 16px 16px'}}
    >
      {/* Ricerca + stato: filtri del menù, non dell'intera libreria. */}
      <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 190px', minWidth: 160}}>
          <span style={{position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center'}}><PnI.Search size={12} color={PN.MUTED}/></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca nei piatti del menù…" style={{
            width: '100%', padding: '7px 10px 7px 30px', border: `1px solid ${PN.BORDER}`,
            borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: PN.WHITE,
          }}/>
        </div>
        <div style={{display: 'flex', background: '#F4F5F7', padding: 2, borderRadius: 8, gap: 2}}>
          {[
            {id: 'all', label: 'Tutti', count: totali},
            {id: 'active', label: 'Attivi', count: attivi},
            {id: 'disabled', label: 'Disattivati', count: disattivati},
          ].map(s => (
            <button key={s.id} onClick={() => setStateFilter(s.id)} style={{
              padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: stateFilter === s.id ? PN.WHITE : 'transparent',
              color: stateFilter === s.id ? PN.TEXT : PN.MUTED,
              boxShadow: stateFilter === s.id ? '0 1px 2px rgba(15,17,21,0.08)' : 'none',
              fontSize: 13.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              {s.label}
              <span style={{fontSize: 12, fontWeight: 700, color: stateFilter === s.id ? PN.MUTED : PN.MUTED_SOFT}}>{s.count}</span>
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 && (
        <div style={{padding: '30px 18px', textAlign: 'center', color: PN.MUTED, fontSize: 14.5, background: '#FAFBFC', border: `1px dashed ${PN.BORDER}`, borderRadius: 12, marginBottom: 12}}>
          {totali === 0 ? 'Categoria vuota: aggiungi il primo piatto.' : 'Nessun piatto corrisponde ai filtri.'}
        </div>
      )}

      {view === 'grid' ? (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(164px, 1fr))', gap: 12}}>
          {rows.map(r => (
            <MCDishCard
              key={r.dishId}
              r={r}
              catName={catName}
              selectMode={selectMode}
              selected={selection.includes(r.dishId)}
              aperto={detailId === r.dishId}
              menuAperto={cardMenu === r.dishId}
              onMenu={() => setCardMenu(m => m === r.dishId ? null : r.dishId)}
              onCloseMenu={() => setCardMenu(null)}
              onToggleSel={() => toggleSel(r.dishId)}
              onOpen={() => setDetailId(r.dishId)}
              onToggleActive={() => onUpdateItem(catName, r.dishId, {active: !r.active})}
              editingPrice={editingPrice && editingPrice.dishId === r.dishId}
              onPriceClick={() => setEditingPrice({catName, dishId: r.dishId})}
              onPriceCommit={(v) => { onUpdateItem(catName, r.dishId, {price: v}); setEditingPrice(null); }}
              onPriceCancel={() => setEditingPrice(null)}
              onRemove={() => onRemoveDish(catName, r.dishId)}
              inDrag={!!dragDish && dragDish.dishId === r.dishId}
              onDragStart={(e) => { fantasmaPiatto(e, r.dish); setDragDish({cat: catName, dishId: r.dishId, idx: r.idx}); }}
              onDragEnd={() => setDragDish(null)}
              onDropOn={() => { if (dragDish && dragDish.cat === catName) onReorder(catName, dragDish.idx, r.idx); setDragDish(null); }}
            />
          ))}
          <button onClick={onOpenPicker} style={{
            minHeight: 150, borderRadius: 12, border: `1.5px dashed ${PN.BORDER}`, background: '#FAFBFC',
            color: PN.MUTED, fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'background 150ms ease-out, border-color 150ms ease-out',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = PN.PINK_BG_SOFT; e.currentTarget.style.borderColor = PN.PINK_SOFT; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FAFBFC'; e.currentTarget.style.borderColor = PN.BORDER; }}
          >
            <span style={{width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${PN.BORDER}`, display: 'grid', placeItems: 'center'}}><PnI.Plus size={13}/></span>
            Aggiungi piatto
          </button>
        </div>
      ) : (
        <div style={{border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 12, overflow: 'hidden'}}>
          {rows.map(r => {
            const sel = selection.includes(r.dishId);
            return (
              <div key={r.dishId}
                draggable
                onDragStart={() => setDragDish({cat: catName, dishId: r.dishId, idx: r.idx})}
                onDragEnd={() => setDragDish(null)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (dragDish && dragDish.cat === catName) onReorder(catName, dragDish.idx, r.idx); setDragDish(null); }}
                onClick={selectMode ? (e) => { e.stopPropagation(); toggleSel(r.dishId); } : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  background: sel ? PN.PINK_SOFT : (detailId === r.dishId ? PN.PINK_BG_SOFT : 'transparent'),
                  boxShadow: sel ? `inset 4px 0 0 ${PN.PINK}` : 'none',
                  cursor: selectMode ? 'pointer' : 'default',
                  transition: 'background 160ms ease-out, box-shadow 160ms ease-out',
                }}
              >
                {/* In elenco la spunta è una colonna sua: sulla riga non c'è una
                    foto su cui appoggiarla come nelle card. */}
                {(selectMode || sel) && (
                  <button onClick={e => { e.stopPropagation(); toggleSel(r.dishId); }} title="Seleziona" style={{
                    flexShrink: 0, marginLeft: 12, width: 22, height: 22, borderRadius: 6,
                    border: `1.5px solid ${sel ? PN.PINK : PN.BORDER}`,
                    background: sel ? PN.PINK : PN.WHITE,
                    color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
                    transition: 'background 160ms ease-out, border-color 160ms ease-out',
                  }}>{sel && <PnI.Check size={12}/>}</button>
                )}
                <div style={{flex: 1, minWidth: 0, pointerEvents: selectMode ? 'none' : 'auto'}}>
                  <DishRow
                    dish={r.dish}
                    item={r}
                    selezionato={sel}
                    onToggleActive={() => onUpdateItem(catName, r.dishId, {active: !r.active})}
                    onPriceClick={() => setEditingPrice({catName, dishId: r.dishId})}
                    editingPrice={editingPrice && editingPrice.dishId === r.dishId}
                    onPriceCommit={(v) => { onUpdateItem(catName, r.dishId, {price: v}); setEditingPrice(null); }}
                    onPriceCancel={() => setEditingPrice(null)}
                    onEdit={() => setDetailId(r.dishId)}
                    onRemove={() => onRemoveDish(catName, r.dishId)}
                  />
                </div>
              </div>
            );
          })}
          <button onClick={onOpenPicker} style={{
            width: '100%', padding: '11px 12px', border: 'none', borderTop: `1px dashed ${PN.BORDER_SOFT}`,
            background: '#FCFCFD', color: PN.MUTED, fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>+ Aggiungi piatto</button>
        </div>
      )}
    </MCPanel>
  );
}

// ─── Card piatto (vista griglia) ────────────────────────────────────────────
function MCDishCard({
  r, catName, selectMode, selected, aperto, menuAperto, onMenu, onCloseMenu,
  onToggleSel, onOpen, onToggleActive, editingPrice, onPriceClick, onPriceCommit, onPriceCancel,
  onRemove, onDragStart, onDragEnd, onDropOn, inDrag,
}) {
  const [hover, setHover] = React.useState(false);
  const [tmp, setTmp] = React.useState(r.price.toFixed(2).replace('.', ','));
  React.useEffect(() => { if (editingPrice) setTmp(r.price.toFixed(2).replace('.', ',')); }, [editingPrice]);
  const mostraCheck = selectMode || selected || hover;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e)} onDragEnd={onDragEnd}
      onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onDropOn(); }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={() => { if (selectMode) onToggleSel(); else onOpen(); }}
      style={{
        position: 'relative', borderRadius: 12, overflow: 'visible', cursor: 'pointer',
        background: selected ? PN.PINK_BG_SOFT : PN.WHITE,
        border: `1px solid ${selected ? PN.PINK : (aperto ? PN.PINK : PN.BORDER_SOFT)}`,
        boxShadow: selected
          ? `0 0 0 3px ${PN.PINK}59, 0 10px 22px -10px rgba(255, 90, 95, 0.55)`
          : (aperto
              ? `0 0 0 3px ${PN.PINK}26`
              : (hover ? PN.CARD_SHADOW_HOVER : PN.CARD_SHADOW)),
        // La card che si sta portando via lascia il suo posto come una sagoma
        // tratteggiata: si vede da dove è partita, e la griglia non si richiude
        // sotto al cursore.
        opacity: inDrag ? 0.35 : (r.active ? 1 : 0.72),
        filter: inDrag ? 'grayscale(0.6)' : 'none',
        transform: selected ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow 160ms ease-out, border-color 160ms ease-out, background 160ms ease-out, transform 160ms ease-out, opacity 150ms ease-out',
      }}
    >
      <div style={{position: 'relative', aspectRatio: '16/11', background: '#F4F5F7', borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: 'hidden'}}>
        {r.dish.photo
          ? <img src={r.dish.photo} alt="" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
          : <div style={{width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: PN.MUTED_SOFT}}><Icon name={CAT_ICON[r.dish.cat] || 'star'} size={26}/></div>}

        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(180deg, rgba(255,90,95,0.34) 0%, rgba(255,90,95,0.16) 100%)`,
          opacity: selected ? 1 : 0, transition: 'opacity 160ms ease-out',
        }}/>

        {mostraCheck && (
          <button onClick={e => { e.stopPropagation(); onToggleSel(); }} title="Seleziona" style={{
            position: 'absolute', top: 7, left: 7,
            width: selected ? 25 : 22, height: selected ? 25 : 22, borderRadius: 7,
            border: `1.5px solid ${selected ? PN.PINK : 'rgba(255,255,255,0.9)'}`,
            background: selected ? PN.PINK : 'rgba(255,255,255,0.86)',
            color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
            boxShadow: selected ? '0 2px 8px rgba(255,90,95,0.55)' : '0 1px 4px rgba(0,0,0,0.18)',
            transition: 'width 160ms ease-out, height 160ms ease-out, background 160ms ease-out',
          }}>{selected && <PnI.Check size={14}/>}</button>
        )}

        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onMenu(); }} title="Altre azioni" style={{
          position: 'absolute', top: 7, right: 7, width: 24, height: 24, borderRadius: 7,
          border: 'none', background: 'rgba(255,255,255,0.88)', color: PN.TEXT,
          cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 16, lineHeight: 1,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}>⋯</button>
      </div>

      {/* Fuori dal riquadro della foto: lì dentro l'overflow è tagliato e il
          menù si sarebbe visto a metà. */}
      {menuAperto && (
        <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} style={{
          position: 'absolute', top: 36, right: 6, zIndex: 70, minWidth: 186,
          background: PN.WHITE, border: `1px solid ${PN.BORDER}`, borderRadius: 10,
          boxShadow: '0 10px 30px rgba(15,17,21,0.16)', padding: 5,
        }}>
          <MenuDotItem icon="✎" onClick={() => { onCloseMenu(); onOpen(); }}>Apri dettagli</MenuDotItem>
          <MenuDotItem icon="€" onClick={() => { onCloseMenu(); onPriceClick(); }}>Modifica prezzo</MenuDotItem>
          <MenuDotItem icon={r.active ? '⏸' : '▶'} onClick={() => { onCloseMenu(); onToggleActive(); }}>{r.active ? 'Disattiva nel menù' : 'Attiva nel menù'}</MenuDotItem>
          <div style={{height: 1, background: PN.BORDER_SOFT, margin: '4px 0'}}/>
          <MenuDotItem icon="🗑" danger onClick={() => { onCloseMenu(); onRemove(); }}>Rimuovi dal menù</MenuDotItem>
        </div>
      )}

      <div style={{padding: '9px 11px 11px'}}>
        <div style={{fontSize: 14.5, fontWeight: 700, color: selected ? PN.PINK_DARK : PN.TEXT, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 160ms ease-out'}}>{r.dish.name}</div>

        <div onClick={e => { e.stopPropagation(); if (!editingPrice) onPriceClick(); }} title="Clicca per modificare il prezzo" style={{
          display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 3,
          padding: editingPrice ? '2px 6px' : '2px 0', borderRadius: 6,
          border: editingPrice ? `1.5px solid ${PN.PINK}` : '1.5px solid transparent',
          background: editingPrice ? PN.WHITE : 'transparent', cursor: editingPrice ? 'text' : 'pointer',
        }}>
          {editingPrice ? (
            <>
              <span style={{fontSize: 14.5, fontWeight: 700, color: PN.MUTED}}>€</span>
              <input autoFocus value={tmp} onChange={e => setTmp(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onPriceCommit(parseFloat(tmp.replace(',', '.')) || 0); if (e.key === 'Escape') onPriceCancel(); }}
                onBlur={() => onPriceCommit(parseFloat(tmp.replace(',', '.')) || 0)}
                style={{width: 52, fontSize: 14.5, fontWeight: 700, color: PN.TEXT, border: 'none', outline: 'none', fontFamily: 'inherit', background: 'transparent'}}/>
            </>
          ) : (
            <span style={{fontSize: 14.5, fontWeight: 700, color: selected ? PN.PINK_DARK : PN.TEXT}}>{eur(r.price)}</span>
          )}
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 8}}>
          <div style={{flex: 1, minWidth: 0, display: 'flex', gap: 3, overflow: 'hidden'}}>
            {/* Sopra i quattro si mostra un «+n»: incolonnare i bollini su due
                righe faceva card di altezze diverse nella stessa griglia. */}
            {(() => {
              const tutti = r.dish.allergens || [];
              const mostrati = tutti.length > 4 ? tutti.slice(0, 3) : tutti;
              const resto = tutti.length - mostrati.length;
              return (
                <>
                  {mostrati.map(a => <AllergenIcon key={a} id={a} size={22}/>)}
                  {resto > 0 && (
                    <span title={`Altri ${resto} allergeni`} style={{
                      height: 22, minWidth: 22, padding: '0 5px', borderRadius: 999,
                      background: '#F1F3F5', color: PN.MUTED, fontSize: 11.5, fontWeight: 800,
                      display: 'inline-grid', placeItems: 'center', flexShrink: 0,
                    }}>+{resto}</span>
                  )}
                </>
              );
            })()}
          </div>
          <span onClick={e => e.stopPropagation()} style={{flexShrink: 0}}>
            <ImpToggle checked={r.active} onChange={onToggleActive}/>
          </span>
        </div>
      </div>
    </div>
  );
}

// Voce di un menù a tendina (menù, categorie, azioni di card).
function MenuDotItem({ icon, children, danger, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8, width:'100%',
      padding:'7px 10px', background:'transparent', border:'none',
      borderRadius:7, fontSize:14.5, fontFamily:'inherit',
      color: danger ? '#DC2626' : PN.TEXT,
      cursor:'pointer', textAlign:'left',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? '#FEF2F2' : '#F4F5F7'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:16, flexShrink:0}}>{icon}</span>
      <span style={{flex:1, minWidth:0}}>{children}</span>
    </button>
  );
}


// ─── Colonna 3: dettaglio del piatto ────────────────────────────────────────
// Stesso contenuto della modale piatto, disposto in quattro schede invece che
// in sette blocchi contratti: qui il pannello resta aperto accanto alla
// griglia, e ogni campo va raggiunto senza scorrere tutto il resto.
const MC_INPUT = {
  width: '100%', padding: '8px 10px', border: `1px solid ${PN.BORDER}`, borderRadius: 8,
  fontSize: 14.5, fontFamily: 'inherit', outline: 'none', background: PN.WHITE, color: PN.TEXT,
};

function MCCampo({ label, children, hint, style, right }) {
  return (
    <div style={{marginBottom: 12, ...style}}>
      {(label || right) && (
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5}}>
          <label style={{flex: 1, fontSize: 13, fontWeight: 600, color: PN.MUTED}}>{label}</label>
          {right}
        </div>
      )}
      {children}
      {hint && <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 5, lineHeight: 1.4}}>{hint}</div>}
    </div>
  );
}

// Campo in euro: il simbolo sta dentro al riquadro, non nell'etichetta —
// così il valore si legge come un importo anche a colpo d'occhio.
function MCEuro({ value, onChange, placeholder = '0,00' }) {
  return (
    <div style={{position: 'relative'}}>
      <span style={{
        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
        fontSize: 14, fontWeight: 700, color: PN.MUTED, pointerEvents: 'none',
      }}>€</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{...MC_INPUT, paddingLeft: 24, fontWeight: 700}}/>
    </div>
  );
}

function MCSezione({ title, children, style }) {
  return (
    <div style={{marginBottom: 16, ...style}}>
      <div style={{fontSize: 12, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 9}}>{title}</div>
      {children}
    </div>
  );
}

function MCDettagliPiatto({
  dish, item, codice, catName, categorie,
  onClose, onSaveDish, onUpdateItem, onRemoveFromMenu, onDeleteFromLibrary, onMoveCat,
}) {
  const [tab, setTab] = React.useState('info');
  const [name, setName] = React.useState(dish.name || '');
  const [desc, setDesc] = React.useState(dish.desc || '');
  const [photos, setPhotos] = React.useState(dish.photos || [true]);
  const [foodCost, setFoodCost] = React.useState(dish.foodCost ? String(dish.foodCost.toFixed(2)).replace('.', ',') : '');
  const [allergens, setAllergens] = React.useState(dish.allergens || []);
  const [ingredients, setIngredients] = React.useState(dish.ingredients || []);
  const [extras, setExtras] = React.useState(dish.extras || []);
  const [variants, setVariants] = React.useState(dish.variants || []);
  const [recipeSteps, setRecipeSteps] = React.useState(dish.recipeSteps || ['']);
  const [dietaryTags, setDietaryTags] = React.useState(() =>
    (dish.dietaryTags || []).map(t => typeof t === 'string' ? {name: t, surcharge: ''} : t));
  const [prodottoFinito, setProdottoFinito] = React.useState(dish.prodottoFinito || false);
  const [hasAlcohol, setHasAlcohol] = React.useState(dish.hasAlcohol || false);
  const [hasFrozen, setHasFrozen] = React.useState(dish.hasFrozen || false);
  const [tipOpen, setTipOpen] = React.useState(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [confermaElimina, setConfermaElimina] = React.useState(false);

  // Dati che vivono nel MENÙ, non nella libreria: prezzo, disponibilità,
  // canali su cui il piatto si vede e con che prezzo.
  const [prezzo, setPrezzo] = React.useState(item.price.toFixed(2).replace('.', ','));
  const [attivo, setAttivo] = React.useState(!!item.active);
  const [canali, setCanali] = React.useState(canaliDi(item));
  const [prezziCanale, setPrezziCanale] = React.useState(item.channelPrices || {});

  React.useEffect(() => {
    if (!tipOpen) return;
    const chiudi = () => setTipOpen(null);
    document.addEventListener('click', chiudi);
    return () => document.removeEventListener('click', chiudi);
  }, [tipOpen]);

  const ingredientAllergens = React.useMemo(() => {
    const s = new Set();
    ingredients.forEach(ing => (ing.allergens || []).forEach(a => s.add(a)));
    return s;
  }, [ingredients]);
  const effectiveAllergens = React.useMemo(
    () => Array.from(new Set([...allergens, ...ingredientAllergens])), [allergens, ingredientAllergens]);

  const toggleAllergen = (id) => {
    if (ingredientAllergens.has(id) && !allergens.includes(id)) return;
    setAllergens(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };
  const toggleTag = (t) => setDietaryTags(s => s.some(x => x.name === t) ? s.filter(x => x.name !== t) : [...s, {name: t, surcharge: ''}]);
  const setTagSurcharge = (t, v) => setDietaryTags(s => s.map(x => x.name === t ? {...x, surcharge: v} : x));
  const toggleCanale = (id) => setCanali(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);

  const scriviConAi = () => {
    if (!name.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setDesc('Pane casereccio tostato, pomodoro fresco, basilico, aglio, olio EVO.');
      setAiLoading(false);
    }, 1100);
  };

  const salva = () => {
    if (!name.trim()) { alert('Inserisci il nome del piatto'); return; }
    onSaveDish({
      id: dish.id, name: name.trim(), desc: desc.trim(), cat: dish.cat,
      allergens: effectiveAllergens,
      foodCost: foodCost ? parseFloat(String(foodCost).replace(',', '.')) : null,
      prodottoFinito, hasAlcohol, hasFrozen, recipeSteps,
      ingredients, extras, variants, dietaryTags, photos,
    });
    onUpdateItem({
      price: parseFloat(String(prezzo).replace(',', '.')) || 0,
      active: attivo, channels: canali, channelPrices: prezziCanale,
    });
  };

  const TABS = [
    {id: 'info',      l: 'Informazioni'},
    {id: 'varianti',  l: 'Varianti'},
    {id: 'allergeni', l: 'Allergeni e tag'},
    {id: 'canali',    l: 'Prezzi per canale'},
  ];

  return (
    <section style={{
      background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 14,
      boxShadow: PN.CARD_SHADOW, overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Testata */}
      <div style={{padding: '13px 14px', borderBottom: `1px solid ${PN.BORDER_SOFT}`, display: 'flex', alignItems: 'center', gap: 9}}>
        <div style={{flex: 1, minWidth: 0, fontSize: 16.5, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>Dettagli piatto</div>
        <button onClick={onClose} title="Chiudi" style={{
          width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent',
          color: PN.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#EDEFF2'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        ><PnI.X size={13}/></button>
      </div>

      {/* Identità */}
      <div style={{padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11}}>
        <DishThumb dish={dish} size={52}/>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{name || dish.name}</div>
          <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2}}>ID: {codice}</div>
        </div>
        <span style={{
          flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 0.4,
          background: attivo ? PN.GREEN_SOFT : '#F1F3F5', color: attivo ? PN.GREEN : PN.MUTED,
        }}>
          <span style={{width: 5, height: 5, borderRadius: '50%', background: attivo ? PN.GREEN : '#9CA3AF'}}/>
          {attivo ? 'ATTIVO' : 'OFF'}
        </span>
      </div>

      {/* Schede */}
      <div className="pn-scroll" style={{display: 'flex', gap: 10, padding: '0 13px', borderBottom: `1px solid ${PN.BORDER_SOFT}`, overflowX: 'auto'}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 1px', marginBottom: -1, background: 'transparent', border: 'none',
            borderBottom: `2px solid ${tab === t.id ? PN.PINK : 'transparent'}`,
            color: tab === t.id ? PN.PINK_DARK : PN.MUTED,
            fontSize: 12, fontWeight: tab === t.id ? 700 : 600,
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>{t.l}</button>
        ))}
      </div>

      <div style={{padding: '14px'}}>
        {/* ── INFORMAZIONI ───────────────────────────────────────────── */}
        {tab === 'info' && (
          <div>
            <MCCampo label="Nome piatto" right={<span style={{fontSize: 12, color: PN.MUTED_SOFT, fontWeight: 600}}>{name.length}/80</span>}>
              <input value={name} maxLength={80} onChange={e => setName(e.target.value)} style={MC_INPUT}/>
            </MCCampo>

            <MCCampo label="Descrizione breve" right={<span style={{fontSize: 12, color: PN.MUTED_SOFT, fontWeight: 600}}>{desc.length}/160</span>}>
              <textarea value={desc} maxLength={160} rows={3} onChange={e => setDesc(e.target.value)}
                style={{...MC_INPUT, resize: 'none', lineHeight: 1.45}}/>
            </MCCampo>

            <button onClick={scriviConAi} disabled={aiLoading || !name.trim()} style={{
              width: '100%', marginBottom: 14, padding: '9px 12px', borderRadius: 9,
              border: `1.5px dashed ${name.trim() ? PN.PINK : '#E3E6EA'}`,
              background: name.trim() ? PN.PINK_BG_SOFT : '#F7F8FA',
              color: name.trim() ? PN.PINK_DARK : PN.MUTED_SOFT,
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              cursor: (aiLoading || !name.trim()) ? 'default' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'background 150ms ease-out',
            }}>
              {aiLoading ? <>⏳ Sto scrivendo…</> : <><BuAiSparkle size={12} color={name.trim() ? PN.PINK_DARK : PN.MUTED_SOFT}/> Scrivi descrizione con AI</>}
            </button>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
              <MCCampo label="Prezzo di vendita">
                <MCEuro value={prezzo} onChange={setPrezzo}/>
              </MCCampo>
              <MCCampo label="Costo piatto (food cost)">
                <MCEuro value={foodCost} onChange={setFoodCost}/>
              </MCCampo>
            </div>

            <MCCampo label="Stato">
              <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
                <ImpToggle checked={attivo} onChange={setAttivo}/>
                <span style={{fontSize: 14.5, fontWeight: 600, color: PN.TEXT}}>{attivo ? 'Disponibile' : 'Non disponibile'}</span>
              </div>
            </MCCampo>

            <MCCampo label="Visibile sui canali" hint="Toglilo da un canale per nasconderlo solo lì: il piatto resta nel menù.">
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                {CANALI.map(c => {
                  const on = canali.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => toggleCanale(c.id)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                      border: `1px solid ${on ? PN.GREEN : PN.BORDER}`,
                      background: on ? PN.GREEN_SOFT : PN.WHITE,
                      color: on ? PN.GREEN : PN.MUTED,
                      fontSize: 13, fontWeight: 600,
                      transition: 'background 150ms ease-out, border-color 150ms ease-out',
                    }}>
                      <Icon name={c.icona} size={13}/>
                      {c.label}
                      {on && <PnI.Check size={11}/>}
                    </button>
                  );
                })}
              </div>
            </MCCampo>

            <MCCampo label="Categoria nel menù">
              <select value={catName} onChange={e => onMoveCat(e.target.value)} style={MC_INPUT}>
                {categorie.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </MCCampo>

            <MCCampo label="Foto" right={<span style={{fontSize: 12, color: PN.MUTED_SOFT, fontWeight: 600}}>{photos.length}/3</span>}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7}}>
                {[0, 1, 2].map(i => {
                  const piena = i < photos.length;
                  const libera = i === photos.length;
                  return piena ? (
                    <div key={i} style={{position: 'relative', borderRadius: 9, overflow: 'hidden', aspectRatio: '4/3', background: PHOTO_MOCK_BG[i % PHOTO_MOCK_BG.length]}}>
                      <img src={i === 0 && dish.photo ? dish.photo : PHOTO_MOCK_IMGS[i % PHOTO_MOCK_IMGS.length]} alt="" loading="lazy"
                        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
                      <button onClick={() => setPhotos(ps => ps.filter((_, idx) => idx !== i))} aria-label={`Rimuovi foto ${i + 1}`} style={{
                        position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 11,
                        cursor: 'pointer', display: 'grid', placeItems: 'center',
                      }}>✕</button>
                    </div>
                  ) : (
                    <button key={i} onClick={() => libera && setPhotos(ps => ps.length < 3 ? [...ps, true] : ps)} disabled={!libera} aria-label="Aggiungi foto" style={{
                      aspectRatio: '4/3', borderRadius: 9, border: `1.5px dashed ${PN.BORDER}`, background: '#F4F5F7',
                      cursor: libera ? 'pointer' : 'default', opacity: libera ? 1 : 0.55,
                      display: 'grid', placeItems: 'center', color: PN.MUTED, fontSize: 18, fontFamily: 'inherit',
                    }}>+</button>
                  );
                })}
              </div>
            </MCCampo>

            <MCSezione title="Dichiarazioni">
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 7}}>
                <DishFlag checked={prodottoFinito} onChange={() => setProdottoFinito(v => !v)}
                  label="Prodotto finito" accent="#475569" accentBg="#F1F5F9" accentBorder="#94A3B8"
                  info={{id: 'finito', open: tipOpen, setOpen: setTipOpen, text: "Venduto sigillato, così come arriva. Es. acqua in bottiglietta, birra in lattina, snack confezionati. IVA 22% sull'asporto anziché 10%."}}/>
                <DishFlag checked={hasAlcohol} onChange={() => setHasAlcohol(v => !v)}
                  label="Contiene alcolici" accent="#B45309" accentBg="#FFFBEB" accentBorder="#FCD34D"
                  info={{id: 'alcol', open: tipOpen, setOpen: setTipOpen, text: "Vale anche se lo prepari tu: birra alla spina, vino al calice, cocktail. IVA 22% sull'asporto e vendita vietata ai minori."}}/>
                <DishFlag checked={hasFrozen} onChange={() => setHasFrozen(v => !v)}
                  label="Contiene alimenti surgelati" accent="#2563EB" accentBg="#EFF6FF" accentBorder="#60A5FA"/>
              </div>
            </MCSezione>

            <MCSezione title="Ricetta · procedimento" style={{marginBottom: 0}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                {recipeSteps.map((step, i) => (
                  <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 7}}>
                    <span style={{flexShrink: 0, width: 21, height: 21, borderRadius: '50%', background: PN.PINK_SOFT, color: PN.PINK_DARK, fontSize: 12.5, fontWeight: 800, display: 'grid', placeItems: 'center', marginTop: 6}}>{i + 1}</span>
                    <textarea value={step} rows={1} placeholder={`Passo ${i + 1}…`}
                      onChange={e => setRecipeSteps(s => s.map((x, idx) => idx === i ? e.target.value : x))}
                      style={{...MC_INPUT, resize: 'none', lineHeight: 1.45, background: step ? PN.WHITE : '#FAFBFC'}}/>
                    {recipeSteps.length > 1 && (
                      <button onClick={() => setRecipeSteps(s => s.filter((_, idx) => idx !== i))} aria-label={`Rimuovi passo ${i + 1}`} style={{
                        flexShrink: 0, width: 26, height: 26, marginTop: 4, background: PN.WHITE,
                        border: '1px solid #FECACA', borderRadius: 7, cursor: 'pointer', color: PN.RED,
                        display: 'grid', placeItems: 'center',
                      }}><PnI.Trash size={11}/></button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setRecipeSteps(s => [...s, ''])} style={{
                marginTop: 9, padding: '7px 12px', borderRadius: 8, background: PN.PINK_BG_SOFT,
                border: `1.5px solid ${PN.PINK_SOFT}`, color: PN.PINK_DARK, fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>+ Aggiungi passo</button>
            </MCSezione>
          </div>
        )}

        {/* ── VARIANTI ───────────────────────────────────────────────── */}
        {tab === 'varianti' && (
          <div>
            <MCSezione title="Varianti">
              <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.45, marginBottom: 9}}>
                Scelte tra cui il cliente seleziona un'opzione (es. <em>Cottura: al sangue / ben cotta</em>).
              </div>
              <VariantsList variants={variants} setVariants={setVariants} hideAddButton/>
              <button onClick={() => setVariants(arr => [...arr, {name: '', options: [''], required: true}])} style={{
                marginTop: 9, padding: '7px 12px', borderRadius: 8, background: PN.PINK_BG_SOFT,
                border: `1.5px solid ${PN.PINK_SOFT}`, color: PN.PINK_DARK, fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>+ Aggiungi gruppo di varianti</button>
            </MCSezione>

            <MCSezione title="Aggiunte a pagamento">
              <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.45, marginBottom: 9}}>
                Extra che il cliente può aggiungere (es. tartufo, doppia mozzarella). Con <strong style={{color: PN.TEXT}}>max</strong> limiti quante volte può ripeterla.
              </div>
              <ExtrasList extras={extras} setExtras={setExtras}/>
            </MCSezione>

            <MCSezione title="Disponibile anche in versione" style={{marginBottom: 0}}>
              <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: dietaryTags.length ? 10 : 0}}>
                {[
                  {name: 'Vegana', glyph: '🌱'}, {name: 'Senza glutine', glyph: '🌾'}, {name: 'Vegetariana', glyph: '🥬'},
                  {name: 'Senza lattosio', glyph: '🥛'}, {name: 'Crudo', glyph: '🍣'}, {name: 'Bio', glyph: 'BIO'},
                  {name: 'Halal', glyph: '☪️'}, {name: 'Kosher', glyph: '✡️'}, {name: 'Parve', glyph: 'Ⓟ'},
                ].map(({name: t, glyph}) => {
                  const on = dietaryTags.some(x => x.name === t);
                  return (
                    <label key={t} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: on ? `1.5px solid ${PN.PINK}` : `1px solid ${PN.BORDER_SOFT}`,
                      background: on ? PN.PINK_BG_SOFT : PN.WHITE,
                      color: on ? PN.PINK_DARK : PN.TEXT, cursor: 'pointer', userSelect: 'none',
                    }}>
                      <input type="checkbox" checked={on} onChange={() => toggleTag(t)} style={{margin: 0, accentColor: PN.PINK, width: 14, height: 14}}/>
                      <span style={{fontSize: glyph === 'BIO' ? 9.5 : 13, fontWeight: glyph === 'BIO' ? 800 : 400, color: glyph === 'BIO' ? '#16A34A' : undefined}}>{glyph}</span>
                      {t}
                    </label>
                  );
                })}
              </div>
              {dietaryTags.length > 0 && (
                <div style={{background: '#F8FAFC', borderRadius: 9, padding: '9px 10px', border: `1px solid ${PN.BORDER_SOFT}`}}>
                  <div style={{fontSize: 11.5, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 7}}>Sovrapprezzo per versione (opzionale)</div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
                    {dietaryTags.map(t => (
                      <div key={t.name} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: '#fff', border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 7}}>
                        <span style={{flex: 1, minWidth: 0, fontSize: 13.5, color: PN.TEXT, fontWeight: 600}}>{t.name}</span>
                        <span style={{fontSize: 13, color: PN.MUTED, fontWeight: 600}}>+€</span>
                        <input value={t.surcharge} onChange={e => setTagSurcharge(t.name, e.target.value.replace(/[^0-9,.]/g, ''))} placeholder="0,00"
                          style={{width: 56, padding: '4px 7px', border: `1px solid ${PN.BORDER}`, borderRadius: 6, fontSize: 14, fontFamily: 'inherit', textAlign: 'right', outline: 'none'}}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </MCSezione>
          </div>
        )}

        {/* ── ALLERGENI E TAG ────────────────────────────────────────── */}
        {tab === 'allergeni' && (
          <div>
            <MCSezione title={`Allergeni · ${effectiveAllergens.length} indicati`}>
              {ingredientAllergens.size > 0 && (
                <div style={{fontSize: 13, color: PN.MUTED, fontStyle: 'italic', marginBottom: 8}}>
                  <span style={{color: PN.PINK_DARK, fontWeight: 700, fontStyle: 'normal'}}>•</span> = derivati dagli ingredienti
                </div>
              )}
              <div style={{display: 'flex', gap: 5, flexWrap: 'wrap'}}>
                {ALLERGENS.map(a => {
                  const fromIng = ingredientAllergens.has(a.id);
                  const fromManual = allergens.includes(a.id);
                  const on = fromIng || fromManual;
                  return (
                    <button key={a.id} onClick={() => toggleAllergen(a.id)} disabled={fromIng && !fromManual}
                      title={fromIng && !fromManual ? 'Derivato dagli ingredienti' : ''}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '5px 9px', borderRadius: 999,
                        border: on ? `1.5px solid ${PN.PINK}` : `1px solid ${PN.BORDER}`,
                        background: on ? PN.PINK_SOFT : '#FAFBFC',
                        color: on ? PN.PINK_DARK : PN.MUTED,
                        fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                        cursor: (fromIng && !fromManual) ? 'not-allowed' : 'pointer',
                      }}>
                      <AllergenIcon id={a.id} size={17}/>
                      {a.name}
                      {fromIng && <span style={{color: PN.PINK_DARK, fontSize: 13}}>•</span>}
                    </button>
                  );
                })}
              </div>
            </MCSezione>

            <MCSezione title="Ingredienti">
              <div style={{fontSize: 13.5, color: PN.MUTED, marginBottom: 9, lineHeight: 1.45}}>
                Accendi il <span style={{display: 'inline-grid', placeItems: 'center', width: 18, height: 18, borderRadius: 5, border: `1px solid ${PN.PINK}`, background: PN.PINK_SOFT, color: PN.PINK_DARK, verticalAlign: '-4px', margin: '0 2px'}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </span> di un ingrediente e il cliente potrà <strong style={{color: PN.TEXT}}>toglierlo dal piatto</strong> quando ordina.
              </div>
              <IngredientList ingredients={ingredients} setIngredients={setIngredients}/>
            </MCSezione>

            <MCSezione title="Valori nutrizionali" style={{marginBottom: 0}}>
              <NutritionFields/>
            </MCSezione>
          </div>
        )}

        {/* ── PREZZI PER CANALE ──────────────────────────────────────── */}
        {tab === 'canali' && (
          <div>
            <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.45, marginBottom: 12}}>
              Il prezzo di listino vale ovunque. Scrivi un importo solo dove il canale
              deve costare diversamente — lascialo vuoto per usare quello di listino.
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 11px', borderRadius: 9, background: '#F7F8FA', marginBottom: 12}}>
              <span style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>Prezzo di listino</span>
              <span style={{fontSize: 15, fontWeight: 800, color: PN.TEXT}}>{eur(parseFloat(String(prezzo).replace(',', '.')) || 0)}</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              {CANALI.map(c => {
                const visibile = canali.includes(c.id);
                return (
                  <div key={c.id} style={{
                    border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, padding: '10px 11px',
                    background: visibile ? PN.WHITE : '#FAFBFC', opacity: visibile ? 1 : 0.7,
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                      <span style={{display: 'inline-flex', color: PN.MUTED}}><Icon name={c.icona} size={15}/></span>
                      <span style={{flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: PN.TEXT}}>{c.label}</span>
                      <ImpToggle checked={visibile} onChange={() => toggleCanale(c.id)}/>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <span style={{fontSize: 13, color: PN.MUTED, flex: 1}}>Prezzo su questo canale</span>
                      <div style={{display: 'inline-flex', alignItems: 'center', gap: 4, border: `1px solid ${PN.BORDER}`, borderRadius: 8, padding: '4px 8px', background: PN.WHITE}}>
                        <span style={{fontSize: 13.5, color: PN.MUTED, fontWeight: 700}}>€</span>
                        <input
                          value={prezziCanale[c.id] || ''}
                          onChange={e => setPrezziCanale(p => ({...p, [c.id]: e.target.value}))}
                          placeholder={String((parseFloat(String(prezzo).replace(',', '.')) || 0).toFixed(2)).replace('.', ',')}
                          style={{width: 58, border: 'none', outline: 'none', textAlign: 'right', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', background: 'transparent', color: PN.TEXT}}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Piede */}
      <div style={{padding: '11px 14px', borderTop: `1px solid ${PN.BORDER_SOFT}`, background: '#FCFCFD'}}>
        <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
          <ImpButton variant="ghost" onClick={onClose} style={{padding: '8px 14px', fontSize: 14}}>Annulla</ImpButton>
          <ImpButton variant="pink" onClick={salva} style={{padding: '8px 14px', fontSize: 14}}>Salva modifiche</ImpButton>
        </div>
        <div style={{display: 'flex', gap: 12, marginTop: 10, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
          <button onClick={onRemoveFromMenu} style={{
            background: 'transparent', border: 'none', color: PN.MUTED, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0,
          }}>✕ Rimuovi dal menù</button>
          <button onClick={() => setConfermaElimina(true)} style={{
            background: 'transparent', border: 'none', color: PN.RED, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0,
          }}><PnI.Trash size={11}/> Elimina dalla libreria</button>
        </div>
        {confermaElimina && (
          <div style={{marginTop: 10, padding: 10, borderRadius: 9, background: '#FEF2F2', border: '1px solid #FECACA'}}>
            <div style={{fontSize: 13.5, color: PN.TEXT, lineHeight: 1.45, marginBottom: 9}}>
              «{name || dish.name}» sarà eliminato dalla libreria e <strong>tolto da tutti i menù</strong>. Non si può annullare.
            </div>
            <div style={{display: 'flex', gap: 7, justifyContent: 'flex-end'}}>
              <ImpButton variant="ghost" onClick={() => setConfermaElimina(false)} style={{padding: '6px 11px', fontSize: 13.5}}>Annulla</ImpButton>
              <ImpButton variant="danger" onClick={() => { setConfermaElimina(false); onDeleteFromLibrary(); }} style={{padding: '6px 11px', fontSize: 13.5}}>Sì, elimina</ImpButton>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Anteprima: il menù come lo vede il cliente nell'app byup ───────────────
// Non è un'idea di come potrebbe essere: è la schermata Menu dell'app
// (app/menu.jsx) rifatta uguale — stessa palette, stessa banda di categoria
// col numero-capitolo e l'illustrazione, stesse card 130px di foto a
// sinistra. Il contenuto è disegnato alla larghezza di design dell'app (390px)
// e rimpicciolito con `zoom`: le proporzioni restano quelle vere invece di
// essere reinventate in piccolo, e quello che si vede qui è quello che il
// cliente vedrà davvero.
const APP = {
  PINK: '#E32459', PINK_DARK: '#B81C47', WINE: '#8B1A3A',
  TEXT: '#1c0f15', MUTED: '#6d5a61', BORDER: '#eddfda',
  BG: '#FBF4F1', SURF: '#fff', TINT: '#f6f1ea', BADGE: '#7a1c3e',
};
const APP_FONT = "'Hanken Grotesk', -apple-system, 'SF Pro Text', system-ui, sans-serif";

// Le illustrazioni di categoria sono quelle dell'app, con la loro tinta.
// Le categorie del gestionale sono libere: quelle che non hanno un disegno
// dedicato ricadono sull'aperitivo, come fa l'app stessa.
const APP_CAT_ART = {
  'Antipasti': ['cat-aperitivo.png', '#fae3de'],
  'Primi':     ['icon-pasta.png',    '#FCE9EE'],
  'Secondi':   ['cat-burger.png',    '#FEF0E3'],
  'Contorni':  ['cat-poke.png',      '#EDF4E7'],
  'Dolci':     ['icon-donut.png',    '#F9E3EE'],
  'Bevande':   ['icon-coffee.png',   '#f4e5ef'],
  'Pizze':     ['cat-pizza.png',     '#FEF0E3'],
  'Panini':    ['cat-panini.png',    '#FEF0E3'],
  'Vini':      ['cat-vino.png',      '#f4e5ef'],
  'Birre':     ['cat-birra.png',     '#FDF3E0'],
  'Dessert':   ['cat-torta.png',     '#F9E3EE'],
};
const appCatArt = (n) => APP_CAT_ART[n] || ['cat-aperitivo.png', '#fae3de'];

// Banda di categoria dell'app: numero-capitolo fantasma, illustrazione,
// «Sezione n/tot» coi pallini, titolo in Fredoka, sottolineatura brand.
// Senza IntersectionObserver — qui è sempre a schermo.
function AppCatBand({ name, count, index, total }) {
  const [img, tint] = appCatArt(name);
  return (
    <div style={{
      margin: '32px -18px 18px', padding: '24px 18px 20px', position: 'relative', overflow: 'hidden',
      background: `linear-gradient(115deg, ${tint} 0%, rgba(255,255,255,0) 82%)`,
    }}>
      <div aria-hidden style={{
        position: 'absolute', left: 8, top: -20, fontFamily: "'Fredoka', sans-serif",
        fontSize: 104, fontWeight: 600, lineHeight: 1, color: APP.PINK, letterSpacing: -5,
        opacity: 0.09, pointerEvents: 'none',
      }}>{String(index + 1).padStart(2, '0')}</div>

      <img src={`../app/assets/${img}`} width="82" alt="" aria-hidden style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(8deg)',
        filter: 'drop-shadow(0 10px 16px rgba(77,18,46,.18))', pointerEvents: 'none', zIndex: 1,
      }}/>

      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7}}>
        <span style={{fontSize: 10.5, fontWeight: 800, color: APP.PINK, letterSpacing: 1.2, textTransform: 'uppercase'}}>
          Sezione {index + 1}<span style={{color: APP.MUTED, fontWeight: 700}}>/{total}</span>
        </span>
        <div style={{display: 'flex', gap: 4, alignItems: 'center'}}>
          {Array.from({length: total}).map((_, i) => (
            <div key={i} style={{
              width: i === index ? 16 : 5, height: 5, borderRadius: 999,
              background: i === index ? APP.PINK : (i < index ? '#e79fb4' : '#e6d2d9'),
            }}/>
          ))}
        </div>
      </div>

      <div style={{position: 'relative', fontFamily: "'Fredoka', sans-serif", fontSize: 27, fontWeight: 600, color: APP.TEXT, lineHeight: 1.05}}>{name}</div>
      <div style={{position: 'relative', fontSize: 11.5, color: APP.MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, marginTop: 5}}>
        {count} {count === 1 ? 'piatto' : 'piatti'} · scorri e gusta
      </div>
      <div aria-hidden style={{
        height: 3, width: 48, borderRadius: 999, marginTop: 11,
        background: `linear-gradient(90deg, ${APP.PINK}, ${APP.PINK_DARK})`,
      }}/>
    </div>
  );
}

// Card piatto dell'app: 166px d'altezza, foto 130px a sinistra, nome, due
// righe di descrizione, i bollini degli allergeni, prezzo e il tondo «+».
function AppDishCard({ r, prezzo, evidenziato }) {
  const badges = [];
  if (r.highlight) badges.push(['★ TOP', APP.BADGE]);
  if (r.isNew) badges.push(['NUOVO', APP.WINE]);
  return (
    <div style={{
      background: APP.SURF, borderRadius: 18, padding: 14, height: 166, overflow: 'hidden',
      display: 'flex', gap: 14,
      border: '1.5px solid transparent',
      boxShadow: evidenziato
        ? `0 0 0 2.5px ${APP.WINE}, 0 8px 24px rgba(90,26,46,0.25)`
        : '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'box-shadow .3s ease',
    }}>
      <div style={{width: 130, height: '100%', borderRadius: 14, overflow: 'hidden', background: '#eee', flexShrink: 0, position: 'relative'}}>
        {r.dish.photo
          ? <img src={r.dish.photo} alt="" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
          : <div style={{width: '100%', height: '100%', background: APP.TINT, display: 'grid', placeItems: 'center', color: APP.MUTED}}>
              <Icon name={CAT_ICON[r.dish.cat] || 'star'} size={34}/>
            </div>}
        {badges.length > 0 && (
          <div style={{position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', flexWrap: 'wrap', gap: 5}}>
            {badges.map(([t, bg]) => (
              <span key={t} style={{
                fontSize: 10, fontWeight: 700, color: '#fff', background: bg,
                padding: '3px 8px', borderRadius: 999, letterSpacing: 0.4,
                textTransform: 'uppercase', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
        <div style={{fontSize: 16, fontWeight: 700, color: APP.TEXT, lineHeight: 1.25, letterSpacing: -0.2, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.dish.name}</div>
        <div style={{fontSize: 13, color: APP.MUTED, lineHeight: 1.45, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10}}>
          {r.dish.desc}
        </div>
        {(r.dish.allergens || []).length > 0 && (
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10}}>
            {r.dish.allergens.slice(0, 5).map(a => <AllergenIcon key={a} id={a} size={22}/>)}
          </div>
        )}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10}}>
          <div style={{fontSize: 16, fontWeight: 800, color: APP.TEXT, flexShrink: 0}}>
            {Number(prezzo || 0).toFixed(2).replace('.', ',')}€
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 999, background: APP.WINE, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(90,26,46,0.25)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function MCAnteprimaMenu({ menu, library, catName, evidenzia }) {
  const [canale, setCanale] = React.useState('qr');
  const boxRef = React.useRef(null);
  const scrollRef = React.useRef(null);
  const [w, setW] = React.useState(288);

  React.useEffect(() => {
    const el = boxRef.current; if (!el) return;
    const m = () => { if (el.offsetWidth) setW(el.offsetWidth); };
    m();
    if (!window.ResizeObserver) return;
    const ro = new ResizeObserver(m); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const k = (w - 14) / 390;   // scocca 3+3 + cornice 4+4

  const cats = (menu ? menu.categories : []).map(c => ({
    name: c.name,
    rows: c.items
      .map(it => ({...it, dish: library.find(d => d.id === it.dishId)}))
      .filter(r => r.dish && r.active && canaliDi(r).includes(canale)),
  })).filter(c => c.rows.length > 0);

  const visibili = cats.reduce((s, c) => s + c.rows.length, 0);
  const inMenu = (menu ? menu.categories : []).reduce((s, c) => s + c.items.length, 0);
  const canaleAttivo = CANALI.find(c => c.id === canale) || CANALI[0];

  // L'anteprima segue il lavoro: cambiando categoria a sinistra, il telefono
  // si porta sulla sezione corrispondente.
  React.useEffect(() => {
    const root = scrollRef.current; if (!root || !catName) return;
    const el = root.querySelector(`[data-app-cat="${CSS.escape ? CSS.escape(catName) : catName}"]`);
    if (!el) return;
    // I rect sono px visivi (il frame del gestionale ha uno zoom), scrollTop è
    // px di layout dello scroller: il delta va riportato in scala.
    const frame = root.closest('.frame');
    const z = frame ? (parseFloat(getComputedStyle(frame).zoom) || 1) : 1;
    const delta = (el.getBoundingClientRect().top - root.getBoundingClientRect().top) / z;
    root.scrollTo({top: Math.max(0, root.scrollTop + delta - 6), behavior: 'smooth'});
  }, [catName, canale, evidenzia, k]);

  return (
    <section style={{
      background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 14,
      boxShadow: PN.CARD_SHADOW, overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{padding: '13px 14px', borderBottom: `1px solid ${PN.BORDER_SOFT}`, display: 'flex', alignItems: 'center', gap: 9}}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.2}}>Anteprima menù</div>
          <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2}}>Come lo vede il cliente</div>
        </div>
        <select value={canale} onChange={e => setCanale(e.target.value)} style={{
          padding: '5px 8px', border: `1px solid ${PN.BORDER}`, borderRadius: 8,
          fontSize: 13, fontFamily: 'inherit', outline: 'none', background: PN.WHITE, color: PN.TEXT, fontWeight: 600,
        }}>
          {CANALI.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div style={{padding: '14px 14px 16px', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)'}}>
        <div ref={boxRef} style={{
          width: '100%', maxWidth: 272, aspectRatio: '9/19.4', position: 'relative',
          borderRadius: Math.round(w * 0.155), padding: 3,
          background: 'linear-gradient(150deg, #43464D 0%, #1B1D22 42%, #303338 100%)',
          boxShadow: '0 18px 40px -16px rgba(15,17,21,0.40), inset 0 0 0 1px rgba(255,255,255,0.15)',
        }}>
          <span aria-hidden style={{position: 'absolute', left: -2, top: '15%', width: 3, height: 22, borderRadius: 3, background: '#2A2D33'}}/>
          <span aria-hidden style={{position: 'absolute', left: -2, top: '21%', width: 3, height: 38, borderRadius: 3, background: '#2A2D33'}}/>
          <span aria-hidden style={{position: 'absolute', right: -2, top: '18%', width: 3, height: 52, borderRadius: 3, background: '#2A2D33'}}/>

          <div style={{width: '100%', height: '100%', background: '#0B0C0E', borderRadius: Math.round(w * 0.145), padding: 4}}>
            <div style={{
              width: '100%', height: '100%', borderRadius: Math.round(w * 0.125),
              overflow: 'hidden', position: 'relative', background: APP.BG,
              fontFamily: APP_FONT, color: APP.TEXT,
              display: 'flex', flexDirection: 'column',
            }}>

              {/* Testata dell'app: non scorre, come nel Menu vero */}
              <div style={{zoom: k, width: 390, flexShrink: 0, background: APP.BG, position: 'relative', zIndex: 5}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 26px 0', fontSize: 14, fontWeight: 700}}>
                  <span>9:41</span>
                  <span style={{display: 'inline-flex', alignItems: 'center', gap: 5}}>
                    <svg width="16" height="11" viewBox="0 0 16 11" fill={APP.TEXT}><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.3" y="5" width="3" height="6" rx="1"/><rect x="8.6" y="2.6" width="3" height="8.4" rx="1"/><rect x="12.9" y="0" width="3" height="11" rx="1"/></svg>
                    <span style={{display: 'inline-block', width: 22, height: 11, borderRadius: 3, border: `1.4px solid ${APP.TEXT}`, position: 'relative', opacity: .85}}>
                      <span style={{position: 'absolute', inset: 1.6, width: 12, background: APP.TEXT, borderRadius: 1.4}}/>
                    </span>
                  </span>
                </div>

                <button style={{
                  position: 'absolute', top: 56, left: 16, zIndex: 20,
                  width: 38, height: 38, borderRadius: 999,
                  background: 'rgba(255,255,255,0.95)', border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)', cursor: 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={APP.TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>

                <div style={{padding: '60px 16px 0 64px', display: 'flex', gap: 8}}>
                  <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: APP.SURF, borderRadius: 999, padding: '9px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={APP.MUTED} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
                    <span style={{fontSize: 13.5, color: APP.MUTED}}>Cerca un piatto, un ingrediente…</span>
                  </div>
                  <span style={{width: 38, height: 38, borderRadius: 999, flexShrink: 0, background: APP.SURF, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={APP.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
                      <circle cx="18" cy="12" r="2.5"/><circle cx="14" cy="18" r="2.5"/>
                    </svg>
                  </span>
                </div>

                <div className="mcprev-h" style={{display: 'flex', gap: 4, padding: '12px 16px 0', overflowX: 'auto'}}>
                  {cats.map(c => {
                    const on = c.name === catName;
                    return (
                      <span key={c.name} style={{
                        padding: '10px 16px 12px', flex: '0 0 auto',
                        borderBottom: `2.5px solid ${on ? APP.WINE : 'transparent'}`,
                        fontSize: 16, fontWeight: on ? 700 : 500,
                        color: on ? APP.WINE : APP.MUTED,
                        letterSpacing: -0.1, whiteSpace: 'nowrap',
                      }}>{c.name}</span>
                    );
                  })}
                </div>
              </div>

              {/* Lista che scorre */}
              <div ref={scrollRef} className="mcprev-v" style={{flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden'}}>
                <div style={{zoom: k, width: 390}}>
                  {cats.length === 0 && (
                    <div style={{padding: '90px 34px', textAlign: 'center', color: APP.MUTED, fontSize: 15, lineHeight: 1.55}}>
                      Nessun piatto visibile su questo canale.
                    </div>
                  )}
                  {cats.map((c, i) => (
                    <div key={c.name} data-app-cat={c.name} style={{padding: '0 18px', marginBottom: 8}}>
                      <AppCatBand name={c.name} count={c.rows.length} index={i} total={cats.length}/>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28}}>
                        {c.rows.map(r => (
                          <AppDishCard key={r.dishId} r={r} prezzo={prezzoCanale(r, canale)} evidenziato={evidenzia === r.dishId}/>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{height: 26}}/>
                </div>
              </div>

              <div aria-hidden style={{height: 4, width: Math.round(96 * k), borderRadius: 999, background: 'rgba(15,17,21,0.28)', margin: '0 auto 6px', flexShrink: 0}}/>
            </div>
          </div>
          <style>{`.mcprev-h::-webkit-scrollbar,.mcprev-v::-webkit-scrollbar{display:none}.mcprev-h,.mcprev-v{scrollbar-width:none}`}</style>
        </div>

        <div style={{fontSize: 12.5, color: PN.MUTED, textAlign: 'center', marginTop: 12, lineHeight: 1.45}}>
          {visibili} di {inMenu} piatti visibili su <strong style={{color: PN.TEXT}}>{canaleAttivo.label}</strong>
        </div>
      </div>
    </section>
  );
}

// ─── Thumbnail piatto: foto reale, con fallback sull'icona di categoria ─────
function DishThumb({ dish, size = 46 }) {
  const [err, setErr] = React.useState(false);
  if (!dish.photo || err) return (
    <div style={{width: size, height: size, borderRadius: 10, background:'#F4F5F7', display:'grid', placeItems:'center', flexShrink: 0, color: PN.MUTED_SOFT}}>
      <Icon name={CAT_ICON[dish.cat] || 'star'} size={20}/>
    </div>
  );
  return <img src={dish.photo} alt="" onError={() => setErr(true)} style={{width: size, height: size, borderRadius: 10, objectFit:'cover', flexShrink: 0, display:'block', background:'#F4F5F7'}}/>;
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
      <div onClick={e => e.stopPropagation()} style={{background: PN.WHITE, borderRadius: 22, width: 660, maxWidth:'100%', maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(15,17,21,0.22)'}}>

        {/* Header: icona tonda + eyebrow categoria + titolo + sottotitolo */}
        <div style={{padding:'24px 26px 0', display:'flex', alignItems:'flex-start', gap: 15}}>
          <div style={{width: 52, height: 52, borderRadius:'50%', background: PN.PINK_BG_SOFT, display:'grid', placeItems:'center', flexShrink: 0}}>
            <PnI.Plate size={24} color={PN.PINK}/>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:12.5, color:PN.PINK, textTransform:'uppercase', letterSpacing:0.8, fontWeight:800, marginBottom: 2}}>{catName}</div>
            <div style={{fontSize:20, fontWeight:800, color:PN.TEXT, letterSpacing:-0.2}}>Aggiungi piatti dalla libreria</div>
            <div style={{fontSize:15, color:PN.MUTED, marginTop: 3}}>Scegli i piatti da aggiungere al menù "{menuName}"</div>
          </div>
          <button onClick={onClose} style={{width:34, height:34, borderRadius:9, border:`1px solid ${PN.BORDER}`, background:PN.WHITE, cursor:'pointer', fontSize:17, color:PN.MUTED, display:'grid', placeItems:'center', flexShrink:0}}>✕</button>
        </div>

        {/* Ricerca */}
        <div style={{padding:'16px 26px 0'}}>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center'}}><PnI.Search size={15} color={PN.MUTED}/></span>
            <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca nella libreria…" style={{
              width:'100%', padding:'11px 14px 11px 38px', border:`1px solid ${PN.BORDER}`, borderRadius:10, fontSize:16, fontFamily:'inherit', outline:'none', background:PN.WHITE,
            }}/>
          </div>
        </div>

        {/* Card: crea nuovo piatto */}
        <div style={{padding:'14px 26px 0'}}>
          <div onClick={onCreateNew} style={{
            display:'flex', alignItems:'center', gap: 14, padding:'14px 17px', cursor:'pointer',
            background: PN.PINK_BG_SOFT, borderRadius: 12,
          }}>
            <div style={{width: 36, height: 36, borderRadius:'50%', border:`1.5px solid ${PN.PINK}`, display:'grid', placeItems:'center', flexShrink: 0}}>
              <PnI.Plus size={16} color={PN.PINK}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:16, fontWeight:700, color: PN.TEXT}}>Crea nuovo piatto</div>
              <div style={{fontSize:14.5, color: PN.MUTED, marginTop: 1}}>Non lo trovi in libreria? Crealo ora: verrà aggiunto subito in "{catName}"</div>
            </div>
            <PnI.ChevronRight size={14} color={PN.PINK}/>
          </div>
        </div>

        {/* Lista piatti: altezza fissa = esattamente 6 righe visibili */}
        <div style={{height: 6 * 78 + 22, flexShrink: 1, overflowY:'auto', padding:'10px 16px 12px'}}>
          {available.length === 0 && (
            <div style={{padding:'40px 22px', textAlign:'center', color:PN.MUTED, fontSize: 15}}>Nessun piatto in libreria che corrisponda alla ricerca.</div>
          )}
          {available.map(d => {
            const on = selected[d.id] !== undefined;
            return (
              <div key={d.id} onClick={() => togglePick(d.id)} style={{
                display:'flex', alignItems:'center', gap: 14, height: 78, padding:'0 10px', boxSizing:'border-box', cursor:'pointer',
                background: on ? PN.PINK_BG_SOFT : 'transparent', borderRadius: 12,
                transition:'background .12s',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#FAFBFC'; }}
              onMouseLeave={e => { e.currentTarget.style.background = on ? PN.PINK_BG_SOFT : 'transparent'; }}
              >
                <input type="checkbox" checked={on} readOnly style={{accentColor: PN.PINK, pointerEvents:'none', width: 18, height: 18, flexShrink: 0, margin: 0}}/>
                <DishThumb dish={d} size={58}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:17, fontWeight:700, color:PN.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.name}</div>
                  <div style={{fontSize:14.5, lineHeight:1.4, marginTop:2, color:PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.desc}</div>
                </div>
                {on ? (
                  <div onClick={e => e.stopPropagation()} style={{display:'flex', alignItems:'center', gap:4, background:PN.WHITE, padding:'6px 10px', borderRadius:9, border:`1px solid ${PN.PINK}`, flexShrink:0}}>
                    <span style={{fontSize:15, color:PN.MUTED, fontWeight:700}}>€</span>
                    <input value={selected[d.id]} onChange={e => setPrice(d.id, e.target.value)} placeholder="0,00" style={{
                      width: 56, fontSize:16, fontWeight:700, color:PN.TEXT, border:'none', outline:'none', textAlign:'right', fontFamily:'inherit', background:'transparent',
                    }}/>
                  </div>
                ) : (
                  <div style={{width: 38, height: 38, borderRadius: 10, border:`1px solid ${PN.BORDER}`, background:PN.WHITE, display:'grid', placeItems:'center', fontSize: 19, color: PN.TEXT, flexShrink: 0, lineHeight: 1}}>+</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{padding:'15px 24px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', justifyContent:'space-between', alignItems:'center', gap: 10}}>
          <div style={{fontSize:15, color:PN.MUTED}}>{count > 0 ? `${count} piatt${count===1?'o':'i'} selezionat${count===1?'o':'i'}` : 'Seleziona uno o più piatti'}</div>
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

  // Deep-link "Aggiungi piatto" (Azioni rapide): ?add=1 apre subito il
  // modulo di nuovo piatto.
  React.useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get('add') === '1') {
        setEditingDish({ dishId: null, isNew: true, fromLibrary: true });
      }
    } catch (e) {}
  }, []);

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
                          display:'inline-flex', alignItems:'center', gap: 5,
                          fontSize: 11.5, color: PN.MUTED, background:'#F4F5F7',
                          padding:'2px 8px 2px 3px', borderRadius: 999,
                          textTransform:'uppercase', letterSpacing: 0.5, fontWeight: 700,
                        }}><AllergenIcon id={a} size={16}/>{al?.name || a}</span>
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
function DishRow({ dish, item, onToggleActive, onPriceClick, editingPrice, onPriceCommit, onPriceCancel, onEdit, onRemove, selezionato }) {
  const [tmpPrice, setTmpPrice] = React.useState(item.price.toFixed(2));
  React.useEffect(() => { if (editingPrice) setTmpPrice(item.price.toFixed(2)); }, [editingPrice]);

  return (
    <div onClick={!editingPrice ? onEdit : undefined} style={{
      display:'grid', gridTemplateColumns: '18px minmax(0, 1fr) auto auto auto',
      gap: 10, alignItems:'center',
      padding: '12px 14px',
      // Selezionata: il fondo lo mette la riga contenitore, qui si fa da parte.
      background: selezionato ? 'transparent' : (item.active ? PN.WHITE : '#FAFBFC'),
      borderTop: `1px solid ${PN.BORDER_SOFT}`,
      opacity: item.active ? 1 : 0.7,
      transition: 'background .15s',
      cursor: editingPrice ? 'default' : 'pointer',
    }}
    onMouseEnter={e => { if (!editingPrice && !selezionato) e.currentTarget.style.background = item.active ? '#F9FAFB' : '#F4F5F7'; }}
    onMouseLeave={e => { if (!selezionato) e.currentTarget.style.background = item.active ? PN.WHITE : '#FAFBFC'; }}
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
          <div style={{fontSize: 14, color: PN.MUTED, lineHeight: 1.4, marginBottom: 6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{dish.desc}</div>
        )}
        {dish.allergens.length > 0 && (
          <div style={{display:'flex', gap: 4, flexWrap:'wrap'}}>
            {dish.allergens.map(a => {
              const al = ALLERGENS.find(x => x.id === a);
              return (
                <span key={a} style={{
                  display:'inline-flex', alignItems:'center', gap: 5,
                  fontSize: 11.5, color: PN.MUTED, background:'#F4F5F7',
                  padding:'2px 8px 2px 3px', borderRadius: 999,
                  textTransform:'uppercase', letterSpacing: 0.5, fontWeight: 700,
                }}><AllergenIcon id={a} size={16}/>{al?.name || a}</span>
              );
            })}
          </div>
        )}
      </div>

      {/* Prezzo (inline-edit) */}
      <div onClick={e => { e.stopPropagation(); if (!editingPrice) onPriceClick(); }} style={{
        cursor: editingPrice ? 'text' : 'pointer',
        padding:'4px 8px', borderRadius: 6,
        background: editingPrice ? PN.WHITE : 'transparent',
        border: editingPrice ? `1.5px solid ${PN.PINK}` : '1.5px solid transparent',
        minWidth: 76, textAlign:'right',
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
function CollapseSection({ title, subtitle, icon, iconBg, iconColor, open, onToggle, children }) {
  return (
    <div style={{
      border: `1px solid ${open ? PN.BORDER : PN.BORDER_SOFT}`,
      borderRadius: 12, marginBottom: 10, overflow: open ? 'visible' : 'hidden', background:'#fff',
      transition:'border-color .15s',
    }}>
      <button onClick={onToggle} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'12px 14px', background: open ? '#FAFBFC' : '#fff',
        border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
        <div style={{
          width:32, height:32, borderRadius:9,
          background: iconBg || (open ? PN.PINK_SOFT : '#F4F5F7'),
          color: iconColor || (open ? PN.PINK_DARK : PN.MUTED),
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
                        {ingAllergens.slice(0,3).map(aid => <window.AllergenIcon key={aid} id={aid} size={16}/>)}
                        {ingAllergens.length > 3 && <span style={{fontSize:13, color:PN.MUTED, fontWeight:700}}>+{ingAllergens.length-3}</span>}
                      </>
                    ) : (
                      <span style={{color: isExpanded ? PN.PINK_DARK : PN.MUTED}}>Allergeni</span>
                    )}
                  </button>

                  {/* Removable toggle — minus-circle = "opzionale/escludibile" */}
                  <button
                    onClick={() => setIngredients(arr => arr.map((x, idx) => idx===i ? {...x, removable: !x.removable} : x))}
                    title={ing.removable ? 'Rimovibile dal cliente. Clicca per bloccare' : 'Il cliente non può rimuovere. Clicca per abilitare'}
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
                            <window.AllergenIcon id={a.id} size={16}/>
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
                    {s.allergens.slice(0,4).map(aid => <window.AllergenIcon key={aid} id={aid} size={16}/>)}
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
  // Max di default 3: svuotando il campo diventa illimitato
  const [max, setMax] = React.useState('3');
  const add = () => {
    if (!name.trim()) return;
    setExtras(arr => [...arr, { name: name.trim(), price: parseFloat(price) || 0, max: parseExtraMax(max) }]);
    setName(''); setPrice(''); setMax('3');
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
          height:40, padding:'0 16px', borderRadius:9,
          background: name.trim() ? PN.PINK_BG_SOFT : '#E9EBEF',
          border: name.trim() ? `1.5px solid ${PN.PINK_SOFT}` : '1.5px solid transparent',
          color: name.trim() ? PN.PINK_DARK : PN.MUTED,
          fontSize:16, fontWeight:700, cursor: name.trim() ? 'pointer' : 'default', fontFamily:'inherit',
          transition:'background 150ms ease-out',
        }}
        onMouseEnter={e => { if (name.trim()) e.currentTarget.style.background = PN.PINK_SOFT; }}
        onMouseLeave={e => { if (name.trim()) e.currentTarget.style.background = PN.PINK_BG_SOFT; }}
        >+ Aggiungi</button>
      </div>
    </div>
  );
}

function VariantsList({ variants, setVariants, hideAddButton }) {
  const addGroup = () => setVariants(arr => [...arr, { name:'', options:[''], required:true }]);
  if (variants.length === 0 && hideAddButton) {
    return (
      <div style={{
        display:'flex', alignItems:'flex-start', gap:10,
        padding:'12px 14px', background:'#F8FAFC',
        border:`1px solid ${PN.BORDER_SOFT}`, borderRadius:10,
      }}>
        <span style={{flexShrink:0, marginTop:1, color:PN.MUTED}}><Icon name="status-info" size={15}/></span>
        <div style={{minWidth:0}}>
          <div style={{fontSize:15, fontWeight:700, color:PN.TEXT}}>Nessun gruppo di varianti aggiunto</div>
          <div style={{fontSize:14.5, color:PN.MUTED, marginTop:2, lineHeight:1.45}}>Aggiungi un gruppo per permettere al cliente di scegliere tra diverse opzioni.</div>
        </div>
      </div>
    );
  }
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
      {!hideAddButton && (
        <button onClick={addGroup} style={{marginTop: variants.length ? 10 : 0, width:'100%', padding:'10px', background:'transparent', border:`1.5px dashed ${PN.BORDER}`, borderRadius:8, color: PN.MUTED, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, justifyContent:'center'}}>+ Aggiungi gruppo di varianti</button>
      )}
    </div>
  );
}

// ─── DishEditModal: modal completo (versione onboarding) ──────────────────────
// Card interna del modal piatto: un solo trattamento per tutti i blocchi,
// invece di occhielli grigi e sottotitoli scuri mescolati.
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

// Flag booleano del piatto: stessa forma per tutti e tre, con tooltip
// opzionale ancorato via portale.
//
// Il tooltip aperto e' uno solo per tutta la modale, quindi lo stato porta
// anche l'id di chi l'ha aperto: senza, due flag che condividono lo stesso
// `info.open` si aprirebbero insieme.
function DishFlag({checked, onChange, label, accent, accentBg, accentBorder, info}) {
  const tipAperto = !!(info && info.open && info.open.id === info.id);
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
          // Il chiarimento si legge passando sopra, come ogni tooltip: il
          // click resta neutro (stopPropagation) perche non deve togglare il
          // flag sotto. Focus/blur danno la stessa cosa a chi naviga da
          // tastiera.
          onClick={e => e.stopPropagation()}
          onMouseEnter={e => {
            const r = e.currentTarget.getBoundingClientRect();
            info.setOpen({id: info.id, x: r.right + 10, y: r.top + r.height / 2});
          }}
          onMouseLeave={() => info.setOpen(o => (o && o.id === info.id) ? null : o)}
          onFocus={e => {
            const r = e.currentTarget.getBoundingClientRect();
            info.setOpen({id: info.id, x: r.right + 10, y: r.top + r.height / 2});
          }}
          onBlur={() => info.setOpen(o => (o && o.id === info.id) ? null : o)}
          role="button" tabIndex={0} aria-expanded={tipAperto}
          aria-label={`Cos'è: ${label}`}
          style={{display:'inline-flex', flexShrink:0}}
        >
          <span style={{
            width:16, height:16, borderRadius:'50%',
            background: tipAperto ? '#475569' : '#E2E8F0',
            color: tipAperto ? '#fff' : '#64748B',
            fontSize:12, fontWeight:700, display:'inline-grid', placeItems:'center', cursor:'pointer',
            transition:'background 150ms ease-out',
          }}>i</span>
        </span>
      )}

      {tipAperto && ReactDOM.createPortal(
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
  const [preview, setPreview] = React.useState(null);       // indice foto in anteprima
  const [confirmDelete, setConfirmDelete] = React.useState(false); // popup conferma eliminazione
  const [initialPrice, setInitialPrice] = React.useState(
    currentPrice !== undefined ? String(currentPrice.toFixed(2)).replace('.', ',') : ''
  );
  const [foodCost, setFoodCost] = React.useState(dish?.foodCost ? dish.foodCost.toFixed(2) : '');
  // Tre dichiarazioni indipendenti, tre assi diversi — nessuna dice se il
  // piatto passa dalla cucina, quello lo decidono il flusso ordini e i monitor.
  //   prodottoFinito → come è confezionato (sigillato, nessuna manipolazione)
  //   hasAlcohol     → cosa contiene
  //   hasFrozen      → come è conservato un ingrediente
  // I primi due portano entrambi l'asporto al 22%, ma per ragioni diverse e
  // senza implicarsi: la birra alla spina è alcolica e non è un prodotto finito.
  const [prodottoFinito, setProdottoFinito] = React.useState(dish?.prodottoFinito || false);
  const [hasAlcohol, setHasAlcohol] = React.useState(dish?.hasAlcohol || false);
  const [hasFrozen, setHasFrozen] = React.useState(dish?.hasFrozen || false);
  const [tipOpen, setTipOpen] = React.useState(null); // tooltip aperto: {id,x,y} o null

  // Il tooltip si chiude al primo click altrove: aperto, restava sopra a
  // qualsiasi cosa (anche all'anteprima foto) finché non si ricliccava l'icona.
  React.useEffect(() => {
    if (!tipOpen) return;
    const chiudi = () => setTipOpen(null);
    document.addEventListener('click', chiudi);
    return () => document.removeEventListener('click', chiudi);
  }, [tipOpen]);
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
      prodottoFinito, hasAlcohol, hasFrozen, recipeSteps,
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
        background: PN.WHITE, borderRadius: 22, width: 940, maxWidth:'100%',
        /* 82vh e non 90: il frame del gestionale ha uno zoom > 1 su schermi
           alti, e i vh non lo considerano — a 90 il modal arrivava a filo del
           bordo del viewport. */
        maxHeight: '82vh', display:'flex', flexDirection:'column',
        overflow: 'hidden',
        boxShadow:'0 32px 80px -24px rgba(15,17,21,0.45), 0 2px 8px rgba(15,17,21,0.10)',
      }}>
        {/* Header — stessa gerarchia del picker libreria: icona tonda rosa
            soft, eyebrow categoria in rosso, titolo. */}
        <div style={{padding:'18px 24px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:14}}>
          <div style={{
            width:46, height:46, borderRadius:'50%', flexShrink:0,
            background: PN.PINK_BG_SOFT,
            display:'grid', placeItems:'center',
          }}><PnI.Plate size={21} color={PN.PINK}/></div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:12.5, color:PN.PINK, textTransform:'uppercase', letterSpacing:0.8, fontWeight:800, marginBottom:2}}>
              {fromLibrary ? 'Libreria piatti' : (catName || cat)}
            </div>
            <div style={{fontSize:20, fontWeight:800, color:PN.TEXT, lineHeight:1.2, letterSpacing:'-0.01em',
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
            background: !name.trim() ? '#EEF0F3' : (aiLoading ? PN.PINK_SOFT : PN.PINK_BG_SOFT),
            color: !name.trim() ? PN.MUTED_LIGHT || '#9AA0A6' : PN.PINK_DARK,
            border: !name.trim() ? '1.5px solid #E3E6EA' : `1.5px solid ${PN.PINK_SOFT}`,
            borderRadius:9, cursor: (aiLoading || !name.trim()) ? 'default' : 'pointer',
            display:'inline-flex', alignItems:'center', gap:6,
            fontSize:15, fontWeight:700, fontFamily:'inherit',
            transition:'background 150ms ease-out, color 150ms ease-out',
          }}
          onMouseEnter={e => { if (name.trim() && !aiLoading) e.currentTarget.style.background = PN.PINK_SOFT; }}
          onMouseLeave={e => { if (name.trim() && !aiLoading) e.currentTarget.style.background = PN.PINK_BG_SOFT; }}
          >
            {aiLoading
              ? <><span>⏳</span> Compilando…</>
              : <><BuAiSparkle size={13} color={!name.trim() ? '#9AA0A6' : PN.PINK_DARK}/>Auto-compila</>}
          </button>
          <button onClick={onClose} style={{
            flexShrink:0, width:34, height:34, borderRadius:9, border:`1px solid ${PN.BORDER}`,
            background:PN.WHITE, cursor:'pointer', fontSize:17, color:PN.MUTED,
            display:'grid', placeItems:'center',
          }}>✕</button>
        </div>

        {/* Body — l'identità del piatto è una fascia orizzontale in cima, il
            resto sono sezioni contratte: si apre solo ciò che serve, invece di
            scorrere sette blocchi sempre aperti. */}
        <div style={{padding:'20px 24px 24px', overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:18, background:'#FAFBFC'}}>

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
              {/* IVA inclusa: il ristoratore scrive il prezzo di listino,
                  quello che il cliente paga — lo scorporo e un lavoro del
                  gestionale, non suo. Il food cost accanto resta netto:
                  viene da fatture fornitore B2B. */}
              {!fromLibrary && catName && (
                <ImpField label={`Prezzo (€, IVA incl.)`} style={{flex:'0 0 130px'}}>
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
                  <div style={{position:'relative'}}>
                    <textarea value={desc} maxLength={160} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="Ingredienti principali, breve descrizione…" style={{
                      width:'100%', padding:'10px 12px 26px', border:`1px solid ${PN.BORDER}`, borderRadius:10, fontSize:16, fontFamily:'inherit', outline:'none', resize:'none', lineHeight:1.5, background:PN.WHITE,
                    }}/>
                    <span style={{position:'absolute', right:12, bottom:10, fontSize:12.5, color:PN.MUTED_SOFT, fontWeight:600, pointerEvents:'none'}}>{desc.length}/160</span>
                  </div>
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
                        <img src={PHOTO_MOCK_IMGS[i % PHOTO_MOCK_IMGS.length]} alt="" loading="lazy" style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
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
                          background:'#F4F5F7', cursor: prossimoLibero ? 'pointer' : 'default',
                          opacity: prossimoLibero ? 1 : 0.55,
                          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, fontFamily:'inherit',
                          transition:'border-color 150ms ease-out, background 150ms ease-out',
                        }}
                        onMouseEnter={e=>{ if (prossimoLibero) { e.currentTarget.style.borderColor=PN.MUTED; e.currentTarget.style.background='#EFEFF1'; } }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor=PN.BORDER; e.currentTarget.style.background='#F4F5F7'; }}
                      >
                        <span style={{fontSize:22, color:PN.MUTED, lineHeight:1}}>+</span>
                        <span style={{fontSize:12.5, color:PN.MUTED, fontWeight:600}}>JPG / PNG</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* riga 3 — i tre flag dichiarativi, sempre in chiaro e mai dentro
                un collassabile: "surgelati" è una dicitura di legge (D.Lgs.
                109/92) e nasconderla dietro un accordion la fa dimenticare.
                Nessuno dei tre dice chi prepara il piatto.

                Tre pari grado, non annidati: sono assi indipendenti e ogni
                combinazione esiste davvero. Una birra alla spina è alcolica ma
                NON è un prodotto finito (la spilli), un gelato confezionato è
                finito E surgelato, uno sgroppino è alcolico E surgelato.
                Annidare "alcolici" sotto "finito" prometteva un sottoinsieme
                che non c'è — e non ci sarebbe stata ragione per annidare quello
                e non "surgelati".

                Colori per asse, non decorativi: neutro = come è confezionato,
                ambra = cosa contiene, blu = come è conservato. */}
            <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
              <DishFlag
                checked={prodottoFinito} onChange={() => setProdottoFinito(v => !v)}
                label="Prodotto finito" accent="#475569" accentBg="#F1F5F9" accentBorder="#94A3B8"
                info={{
                  id: 'finito', open: tipOpen, setOpen: setTipOpen,
                  text: "Venduto sigillato, così come arriva. Es. acqua in bottiglietta, birra in lattina, snack confezionati. IVA 22% sull'asporto anziché 10%.",
                }}
              />
              <DishFlag
                checked={hasAlcohol} onChange={() => setHasAlcohol(v => !v)}
                label="Contiene alcolici" accent="#B45309" accentBg="#FFFBEB" accentBorder="#FCD34D"
                info={{
                  id: 'alcol', open: tipOpen, setOpen: setTipOpen,
                  text: "Vale anche se lo prepari tu: birra alla spina, vino al calice, cocktail. IVA 22% sull'asporto e vendita vietata ai minori.",
                }}
              />
              <DishFlag
                checked={hasFrozen} onChange={() => setHasFrozen(v => !v)}
                label="Contiene alimenti surgelati" accent="#2563EB" accentBg="#EFF6FF" accentBorder="#60A5FA"
              />
            </div>

            {fromLibrary && (
              <div style={{padding:'9px 12px', borderRadius:9, background:'#F8FAFC', border:`1px solid ${PN.BORDER_SOFT}`, fontSize:15.5, color:PN.MUTED, lineHeight:1.5}}>
                Prezzo e disponibilità si impostano nel singolo menù dove il piatto è inserito.
              </div>
            )}
          </div>

          {/* ── SEZIONI CONTRATTE ───────────────────────────────────── */}
          <div>
            <CollapseSection
              title="Allergeni"
              subtitle={allergenCount === 0 ? 'Nessuno indicato' : `${allergenCount} indicati`}
              icon={<Icon name="status-warning" size={16}/>}
              iconBg="#FFF4E5" iconColor="#D97706"
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
                      <AllergenIcon id={a.id} size={17}/>
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
              icon={<Icon name="food-vegetables" size={16}/>}
              iconBg="#E9F7EE" iconColor="#16A34A"
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
              icon={<Icon name="chart-bar" size={16}/>}
              iconBg="#EAF2FE" iconColor="#2563EB"
              open={openSection === 'nutrition'}
              onToggle={() => setOpenSection(s => s === 'nutrition' ? null : 'nutrition')}
            >
              <NutritionFields/>
            </CollapseSection>

            {/* Avanzate — non e' una sezione come le altre ma il contenitore di
                tutto cio' che la maggior parte dei piatti non usa: niente card,
                solo una riga di testo con un separatore. */}
            <div style={{marginTop:6}}>
              {/* Link avanzate — testo rosso allineato a sinistra, come nel design */}
              <button
                onClick={() => setOpenSection(s => s === 'avanzate' ? null : 'avanzate')}
                aria-expanded={openSection === 'avanzate'}
                style={{
                  display:'inline-flex', alignItems:'center', gap:7,
                  background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit',
                  padding:'4px 0', margin:'2px 0 0',
                  fontSize:15, fontWeight:700, color: PN.PINK_DARK,
                }}
              >
                {openSection === 'avanzate' ? 'Nascondi opzioni avanzate' : 'Mostra opzioni avanzate'}
                <span style={{
                  display:'inline-flex', fontSize:11,
                  transform: openSection === 'avanzate' ? 'rotate(180deg)' : 'none',
                  transition:'transform 200ms ease-out',
                }}>▼</span>
              </button>

              {openSection === 'avanzate' && (
              <div style={{display:'flex', flexDirection:'column', gap:14, paddingTop:14}}>

                {/* Versioni */}
                <DishBlock>
                  <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT, marginBottom:10}}>Disponibile anche in versione</div>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom: dietaryTags.length > 0 ? 10 : 0}}>
                    {[
                      {name:'Vegana', glyph:'🌱'}, {name:'Senza glutine', glyph:'🌾'}, {name:'Vegetariana', glyph:'🥬'},
                      {name:'Senza lattosio', glyph:'🥛'}, {name:'Crudo', glyph:'🍣'}, {name:'Bio', glyph:'BIO'},
                      {name:'Halal', glyph:'☪️'}, {name:'Kosher', glyph:'✡️'}, {name:'Parve', glyph:'Ⓟ'},
                    ].map(({name: t, glyph}) => {
                      const on = dietaryTags.some(x => x.name === t);
                      return (
                        <label key={t} style={{
                          display:'inline-flex', alignItems:'center', gap:8,
                          padding:'8px 13px', borderRadius:9, fontSize:15, fontWeight:600,
                          border: on ? `1.5px solid ${PN.PINK}` : `1px solid ${PN.BORDER_SOFT}`,
                          background: on ? PN.PINK_BG_SOFT : PN.WHITE,
                          color: on ? PN.PINK_DARK : PN.TEXT,
                          cursor:'pointer', userSelect:'none',
                          transition:'background 150ms ease-out, border-color 150ms ease-out',
                        }}>
                          <input type="checkbox" checked={on} onChange={() => toggleTag(t)} style={{margin:0, accentColor: PN.PINK, width:15, height:15}}/>
                          <span style={{fontSize: glyph === 'BIO' ? 10.5 : 14, fontWeight: glyph === 'BIO' ? 800 : 400, color: glyph === 'BIO' ? '#16A34A' : undefined, letterSpacing: glyph === 'BIO' ? 0.5 : 0}}>{glyph}</span>
                          {t}
                        </label>
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
                </DishBlock>

                {/* Aggiunte a pagamento */}
                <DishBlock>
                  <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT, marginBottom:4}}>Aggiunte a pagamento</div>
                  <div style={{fontSize:15, color:PN.MUTED, marginBottom:10, lineHeight:1.45}}>
                    Extra che il cliente può aggiungere (es. tartufo, doppia mozzarella).
                    Con <strong style={{color:PN.TEXT}}>max</strong> limiti quante volte può ripeterla.
                  </div>
                  <ExtrasList extras={extras} setExtras={setExtras}/>
                </DishBlock>

                {/* Varianti — bottone in alto a destra, come nel design */}
                <DishBlock>
                  <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:10, flexWrap:'wrap'}}>
                    <div style={{flex:'1 1 260px', minWidth:0}}>
                      <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT, marginBottom:4}}>Varianti</div>
                      <div style={{fontSize:15, color:PN.MUTED, lineHeight:1.45}}>
                        Scelte tra cui il cliente seleziona un'opzione (es. <em>Cottura: al sangue / ben cotta</em>).
                      </div>
                    </div>
                    <button onClick={() => setVariants(arr => [...arr, { name:'', options:[''], required:true }])} style={{
                      flexShrink:0, padding:'8px 14px', borderRadius:9,
                      background: PN.PINK_BG_SOFT, border:`1.5px solid ${PN.PINK_SOFT}`,
                      color: PN.PINK_DARK, fontSize:15, fontWeight:700,
                      cursor:'pointer', fontFamily:'inherit',
                      transition:'background 150ms ease-out',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = PN.PINK_SOFT}
                    onMouseLeave={e => e.currentTarget.style.background = PN.PINK_BG_SOFT}
                    >+ Aggiungi gruppo di varianti</button>
                  </div>
                  <VariantsList variants={variants} setVariants={setVariants} hideAddButton/>
                </DishBlock>

                {/* Ricetta — sempre compilabile: non è il flag fiscale a
                    decidere se un prodotto ha un procedimento (uno spritz è
                    una bevanda ed è da preparare). Chi non ne ha una, la
                    lascia vuota. */}
                <DishBlock>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                    <div style={{fontSize:15.5, fontWeight:700, color:PN.TEXT}}>Ricetta · procedimento</div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    {recipeSteps.map((step, i) => (
                      <div key={i} style={{display:'flex', alignItems:'flex-start', gap:8}}>
                        <span aria-hidden="true" style={{
                          flexShrink:0, color:PN.MUTED_LIGHT, fontSize:14, marginTop:9,
                          letterSpacing:-1, userSelect:'none', cursor:'grab', lineHeight:1,
                        }}>⠿</span>
                        <span style={{
                          flexShrink:0, width:24, height:24, borderRadius:'50%',
                          background:PN.PINK_SOFT, color:PN.PINK_DARK, fontSize:14.5, fontWeight:800,
                          display:'grid', placeItems:'center', marginTop:7,
                        }}>{i+1}</span>
                        <textarea value={step}
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
                          <button onClick={() => setRecipeSteps(s => s.filter((_,idx)=>idx!==i))}
                            aria-label={`Rimuovi passo ${i+1}`}
                            style={{flexShrink:0, width:30, height:30, marginTop:4,
                              background:PN.WHITE, border:'1px solid #FECACA', borderRadius:8,
                              cursor:'pointer', color:PN.RED,
                              display:'grid', placeItems:'center',
                              transition:'background 150ms ease-out'}}
                            onMouseEnter={e=> e.currentTarget.style.background='#FEF2F2'}
                            onMouseLeave={e=> e.currentTarget.style.background=PN.WHITE}
                          ><PnI.Trash size={13}/></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setRecipeSteps(s => [...s,''])} style={{
                    marginTop:10, display:'inline-flex', alignItems:'center', gap:5,
                    padding:'8px 14px', borderRadius:9,
                    background: PN.PINK_BG_SOFT, border:`1.5px solid ${PN.PINK_SOFT}`,
                    color:PN.PINK_DARK, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    transition:'background 150ms ease-out',
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.background = PN.PINK_SOFT; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background = PN.PINK_BG_SOFT; }}
                  >+ Aggiungi passo</button>
                </DishBlock>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Conferma eliminazione — sopra al modal */}
        {confirmDelete && (
          <div onClick={() => setConfirmDelete(false)} style={{
            position:'fixed', inset:0, zIndex:1100,
            background:'rgba(15,17,21,0.45)',
            display:'grid', placeItems:'center', padding:24,
            animation:'impOverlayIn 0.18s ease-out',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background:'#fff', borderRadius:14, padding:'24px 24px 20px',
              width:380, maxWidth:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.22)',
              display:'flex', flexDirection:'column', gap:14,
              animation:'impPopIn 0.28s cubic-bezier(0.34, 1.45, 0.64, 1)',
            }}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:36, height:36, borderRadius:10, background:'#FEF2F2',
                  display:'grid', placeItems:'center', flexShrink:0, color:PN.RED}}>
                  <PnI.Trash size={16}/>
                </div>
                <div style={{fontSize:18, fontWeight:700, color:PN.TEXT, letterSpacing:-0.3}}>
                  Eliminare "{name.trim() || 'questo piatto'}"?
                </div>
              </div>
              <div style={{fontSize:15.5, color:PN.MUTED, lineHeight:1.5}}>
                Il piatto sarà eliminato dalla libreria e <strong style={{color:PN.TEXT}}>tolto da tutti i menù</strong> in cui è presente. L'operazione non si può annullare.
              </div>
              <div style={{display:'flex', gap:8}}>
                <button onClick={() => setConfirmDelete(false)} style={{
                  flex:1, padding:'10px 14px', borderRadius:8,
                  background: PN.BTN_NEUTRAL, color: PN.TEXT,
                  border:`1px solid ${PN.BORDER_LIGHT}`,
                  fontSize:15.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  boxShadow: PN.INSET_HIGHLIGHT,
                }}>Annulla</button>
                <button onClick={() => { setConfirmDelete(false); onDelete(); }} style={{
                  flex:1, padding:'10px 14px', borderRadius:8,
                  background:'linear-gradient(180deg, #E5484D 0%, #D93036 100%)', color:'#fff',
                  border:'1px solid rgba(160, 20, 25, 0.45)',
                  fontSize:15.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  boxShadow:'inset 0 1px 0 rgba(255,255,255,0.25)',
                }}>Sì, elimina</button>
              </div>
            </div>
          </div>
        )}

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
              overflow:'hidden',
            }}>
              <img src={PHOTO_MOCK_IMGS[preview % PHOTO_MOCK_IMGS.length]} alt="" style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
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
        <div style={{padding:'14px 24px', borderTop:`1px solid ${PN.BORDER_SOFT}`, display:'flex', gap:8, justifyContent:'space-between', alignItems:'center', background:PN.WHITE}}>
          <div>
            {isEdit && onDelete && (
              <button onClick={() => setConfirmDelete(true)} style={{
                background:'transparent', border:'none', color:PN.MUTED, fontSize:14.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:5, padding:'6px 0',
              }}>
                <PnI.Trash size={13}/> Elimina piatto
              </button>
            )}
          </div>
          <div style={{display:'flex', gap:8}}>
            <ImpButton variant="ghost" onClick={onClose}>Annulla</ImpButton>
            <ImpButton variant="pink" onClick={handleSave}>
              <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
                {isEdit ? 'Salva modifiche' : 'Salva e continua'} <span style={{fontSize:16, lineHeight:1}}>→</span>
              </span>
            </ImpButton>
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
  const readMods = () => (window.byupReadModules ? window.byupReadModules() : {sala:true, prenotazioni:true, asporto:true});
  const [modules, setModules] = React.useState(readMods);
  // Il flag può cambiare da un'altra tab o da un'altra pagina del gestionale
  React.useEffect(() => {
    const update = () => setModules(readMods());
    window.addEventListener('byup-modules-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('byup-modules-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);
  // Asporto: stesso giro degli altri moduli, così Vendita diretta si aggiorna
  // senza ricaricare la pagina.
  const takeaway = modules.asporto !== false;
  const setTakeaway = (val) => setModule('asporto', val);
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
          {/* Titolo + tipo sulla stessa riga: il segmented compatto a destra
              è una scelta di natura, non l'importo. Gli importi sotto restano
              scuri quando attivi, così le due file non si confondono. */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10, flexWrap:'wrap', marginBottom: 8}}>
            <div style={{fontSize: 15, fontWeight: 700, display:'inline-flex', alignItems:'center', gap: 7}}>
              <PnI.Plate size={15}/> Servizio
            </div>
            <div style={{display:'inline-flex', background: PN.WHITE, padding: 3, borderRadius: 999, gap: 2, border:`1px solid ${PN.BORDER}`}}>
              {[{id:'fisso', label:'Fisso a persona'}, {id:'percentuale', label:'Percentuale sul conto'}].map(m => {
                const on = servizioTipo === m.id;
                return (
                  <button key={m.id} onClick={() => setServizioTipo(m.id)} style={{
                    padding:'5px 13px', borderRadius: 999,
                    border:'none',
                    background: on ? PN.PINK_SOFT : 'transparent',
                    color: on ? PN.PINK_DARK : PN.MUTED,
                    fontSize: 13, fontWeight: 700,
                    cursor:'pointer', fontFamily:'inherit',
                    boxShadow: on ? '0 1px 2px rgba(15,17,21,0.06)' : 'none',
                    transition:'background 150ms ease-out, color 150ms ease-out',
                    whiteSpace:'nowrap',
                  }}>{m.label}</button>
                );
              })}
            </div>
          </div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginBottom: 12}}>
            {servizioTipo === 'fisso'
              ? "Importo per persona, applicato solo in sala (non all'asporto)"
              : "Percentuale sul totale del conto, applicata solo in sala (non all'asporto)"}
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
          ? "Durata media per servizio. Usata come default nel popup di nuova prenotazione"
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
              {modules.prenotazioni ? 'Attivo' : 'Disattivato'}
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
              {takeaway ? 'Attivo' : 'Disattivato'}
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
              <QrAsporto size={56}/>
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

      {/* QR Modal — foglio BIANCO (MODAL_PANEL), non vetro: sopra l'overlay
          scuro il glass legge grigio. Stessa ricetta del QR di Byup Pay. */}
      {showQr && (
        <div onClick={() => setShowQr(false)} style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 400, position:'relative'}}>
            <div style={MODAL_HEAD}>
              <div style={{...MODAL_TITLE, fontSize: 22}}>QR ordini d'asporto</div>
              <div style={{...MODAL_SUB, marginTop: 2}}>Scansiona per ordinare e ritirare al banco</div>
              <button onClick={() => setShowQr(false)} aria-label="Chiudi" style={MODAL_X}><PnI.X size={14}/></button>
            </div>
            <div style={{...MODAL_BODY, textAlign:'center'}}>
              <QrAsporto size={230} style={{margin:'0 auto'}}/>
              <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 14, lineHeight: 1.45}}>
                Esponi all'esterno o sul menù cartaceo.
              </div>
            </div>
            <div style={{...MODAL_FOOT, justifyContent:'flex-end'}}>
              <ImpButton variant="ghost"><span style={{display:'inline-flex', alignItems:'center', gap:6}}><PnI.FileText size={14}/> PDF</span></ImpButton>
              <ImpButton variant="primary"><span style={{display:'inline-flex', alignItems:'center', gap:6}}><PnI.Download size={14} color={PN.WHITE}/> Scarica</span></ImpButton>
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
        <Step icon={<Icon name="food-flame" size={26} color="#FFF"/>} label="Cucina" hi/>
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
// AiUploadCta — pulsante "Carica menu con AI (PDF / foto)" magenta brand vivace.
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
      {/* Default su due righe volute: l'azione sopra, il formato sotto in
          tono minore — spezzata dal caso ("…AI (PDF /" a capo) leggeva male. */}
      <span style={{position: 'relative', zIndex: 1}}>{children || (
        <span style={{display: 'block', textAlign: 'left', lineHeight: 1.25}}>
          <span style={{display: 'block'}}>Carica menu con AI</span>
          <span style={{display: 'block', fontSize: 12.5, fontWeight: 600, opacity: 0.75, letterSpacing: 0.2}}>PDF / foto</span>
        </span>
      )}</span>

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
                <ImpButton variant="primary" onClick={startProcessing} disabled={!file}><BuAiSparkle size={14}/> Analizza menu</ImpButton>
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

// ─── QR asporto ─────────────────────────────────────────────────────────────
// Stessa ricetta del QR di Byup Pay (POS e integrazioni): scacchiera, tre
// finder angolari e il marchio byup al centro su tessera bianca. Un solo
// disegno per tutti i QR del gestionale — scala dal francobollo in riga
// (56px) al codice grande del popup.
function QrAsporto({ size = 220, style }) {
  const passo = Math.max(6, Math.round(size / 16));       // passo scacchiera
  const f = Math.round(size * 0.16);                      // lato finder
  const b = Math.max(2, Math.round(f * 0.11));            // tratto finder
  const pad = Math.max(3, Math.round(size * 0.036));
  const logo = Math.round(size * 0.20);
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: `repeating-conic-gradient(${PN.TEXT} 0% 25%, transparent 0% 50%) 0 0/${passo}px ${passo}px`,
      border: `${size > 100 ? 4 : 2}px solid ${PN.WHITE}`,
      boxShadow: `0 0 0 ${size > 100 ? 2 : 1}px ${PN.BORDER}${size > 100 ? ', 0 8px 24px rgba(0,0,0,0.08)' : ''}`,
      borderRadius: Math.round(size * 0.055),
      position: 'relative',
      ...style,
    }}>
      {[{top: pad, left: pad}, {top: pad, right: pad}, {bottom: pad, left: pad}].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos, width: f, height: f,
          border: `${b}px solid ${PN.TEXT}`, background: PN.WHITE,
          borderRadius: Math.max(2, b),
        }}>
          <div style={{position: 'absolute', inset: b, background: PN.TEXT, borderRadius: 1}}/>
        </div>
      ))}
      {/* marchio byup al centro, su tessera bianca */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: logo + Math.round(size * 0.06), height: logo + Math.round(size * 0.06),
        borderRadius: Math.round(logo * 0.3),
        background: PN.WHITE, boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
        display: 'grid', placeItems: 'center',
      }}>
        <PnI.LogoMark size={logo}/>
      </div>
    </div>
  );
}
