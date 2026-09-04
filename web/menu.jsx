// byup — Menu locale + Divisione + Home con ordine attivo
const { useState, useRef, useEffect } = React;

const PINK = '#E32459';
const PINK_DARK = '#B81C47';
const WINE = '#8B1A3A';     // for menu screen accent
const TEXT = '#1a1a1a';
const MUTED = '#6b6b6b';
const BORDER = '#e5e5e5';
const BG_GRAY = '#f5f5f5';
const BG_PAGE = '#f7f5f3';

// ─── Icons ─────────────────────────────────────────────────
const I = {
  Plus: ({ size = 16, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Minus: ({ size = 16, color = TEXT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Trash: ({ size = 20, color = TEXT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  ),
  Pin: ({ size = 16, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
  ),
  ChevDown: ({ size = 16, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
  ),
  Back: ({ size = 22, color = TEXT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  Check: ({ size = 16, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
  ),
};

// ─── Allergens ─────────────────────────────────────────────
const ALLERGENS = {
  glutine:    { label: 'Glutine',     color: '#c8a87a', icon: '🌾' },
  pesce:      { label: 'Pesce',       color: '#d96a52', icon: '🐟' },
  uova:       { label: 'Uova',        color: '#f0c14b', icon: '🥚' },
  lattosio:   { label: 'Lattosio',    color: '#f5c2c7', icon: '🥛' },
  crostacei:  { label: 'Crostacei',   color: '#e88a5a', icon: '🦐' },
  fruttaguscio: { label: 'Frutta a guscio', color: '#a07050', icon: '🥜' },
  soia:       { label: 'Soia',        color: '#9ec27a', icon: '🌱' },
  arachidi:   { label: 'Arachidi',    color: '#c89860', icon: '🥜' },
  sedano:     { label: 'Sedano',      color: '#7ec98a', icon: '🥬' },
  senape:     { label: 'Senape',      color: '#e8c850', icon: '🌶' },
  sesamo:     { label: 'Sesamo',      color: '#d4b06a', icon: '⚪' },
  solfiti:    { label: 'Solfiti',     color: '#b07ac0', icon: '🍇' },
  lupini:     { label: 'Lupini',      color: '#f0b878', icon: '🫘' },
  molluschi:  { label: 'Molluschi',   color: '#7aa8c8', icon: '🐚' },
};

function AllergenDots({ ids }) {
  const [openId, setOpenId] = useState(null);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, position: 'relative' }}>
      {ids.map(id => {
        const a = ALLERGENS[id]; if (!a) return null;
        const isOpen = openId === id;
        return (
          <span key={id} style={{ position: 'relative' }}>
            <span role="button" tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setOpenId(isOpen ? null : id); }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: 999,
                background: '#f5f0ec', border: '1px solid #e8e0d8',
                cursor: 'pointer', fontSize: 11, lineHeight: 1,
              }}>{a.icon}</span>
            {isOpen && (
              <span style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                background: '#1a1a1a', color: '#fff', fontSize: 11, fontWeight: 600,
                padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap',
                zIndex: 5, animation: 'fade 0.15s ease',
              }}>
                {a.label}
                <span style={{
                  position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                  width: 6, height: 6, background: '#1a1a1a',
                }}/>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

// ─── Dish placeholder image (uses DishArt) ─────────────────
function DishPhoto({ kind }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    }}>
      <DishArt kind={kind || 'default'}/>
    </div>
  );
}

// ─── Dish data (module-level so DishDetail can read it too) ────────
const DISHES_BY_CAT = {
  'Antipasti': [
    { id: 'a1', name: "Fritto all'Italiana", price: 20, kind: 'fritto', photo: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=70&auto=format&fit=crop',
      desc: 'Fritto misto all italiana che include suppli, fiore di zucca fritto e olive all ascolana',
      longDesc: "Fritto misto all'italiana che include supplì di riso al pomodoro, fiore di zucca ripieno di mozzarella e alici, olive all'ascolana ripiene di carne. Servito con maionese fatta in casa.",
      prep: 12, allergens: ['glutine','uova','lattosio'], tone: 'a',
      ingredients: ['Supplì di riso', 'Fiore di zucca', "Olive all'ascolana", 'Maionese'],
      extras: [{ id: 'e1', name: 'Maionese extra', price: 1.5 }, { id: 'e2', name: 'Salsa tartara', price: 2 }],
      variants: [], cal: 720, macros: { carbo: 48, grassi: 42, prot: 18, fibre: 6 } },
    { id: 'a2', name: 'Impepata di cozze', price: 18, kind: 'cozze', photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=70&auto=format&fit=crop',
      desc: 'Impepata di cozze nostrane, fresche di giornata, origine Italia.',
      longDesc: 'Cozze nostrane fresche di giornata cotte con aglio, olio extravergine, prezzemolo e pepe nero macinato. Servite con crostini di pane casereccio tostato.',
      prep: 18, allergens: ['pesce','crostacei','glutine','lattosio'], tone: 'b',
      ingredients: ['Aglio', 'Prezzemolo', 'Pepe nero', 'Crostini'],
      extras: [{ id: 'e1', name: 'Crostini extra', price: 2 }, { id: 'e2', name: 'Limone bio', price: 0.5 }],
      variants: [{ id: 'piccante', label: 'Piccantezza', options: ['Normale', 'Piccante', 'Molto piccante'] }],
      cal: 380, macros: { carbo: 22, grassi: 12, prot: 35, fibre: 4 } },
    { id: 'a3', name: 'Tagliere misto', price: 12, kind: 'tagliere', photo: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=70&auto=format&fit=crop',
      desc: 'Tagliere misto di salumi e formaggi tra cui pecorino sardo, taleggio, prosciutto parma.',
      longDesc: 'Selezione di salumi e formaggi del territorio: pecorino sardo DOP, taleggio, prosciutto di Parma 24 mesi, salame finocchiona, mortadella IGP. Accompagnato da miele di acacia, marmellata di fichi e pane casereccio.',
      prep: 8, allergens: ['lattosio','glutine','fruttaguscio'], tone: 'c',
      ingredients: ['Pecorino', 'Taleggio', 'Prosciutto', 'Salame', 'Miele', 'Marmellata'],
      extras: [{ id: 'e1', name: 'Miele extra', price: 1 }, { id: 'e2', name: 'Marmellata di fichi', price: 1.5 }],
      variants: [], cal: 540, macros: { carbo: 18, grassi: 38, prot: 28, fibre: 3 } },
    { id: 'a4', name: 'Burrata pugliese', price: 14, kind: 'default', photo: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&q=70&auto=format&fit=crop',
      desc: 'Burrata fresca di Andria con pomodorini confit e basilico.',
      longDesc: 'Burrata di Andria da 250g su letto di pomodorini confit al forno con basilico fresco, olio EVO Puglia e fleur de sel. Servita con crostini di pane pugliese.',
      prep: 5, allergens: ['lattosio','glutine'], tone: 'a',
      ingredients: ['Burrata', 'Pomodorini', 'Basilico', 'Olio EVO'],
      extras: [{ id: 'e1', name: 'Crostini extra', price: 2 }],
      variants: [], cal: 380, macros: { carbo: 10, grassi: 30, prot: 14, fibre: 2 } },
    { id: 'a5', name: 'Carpaccio di manzo', price: 17, kind: 'default', photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70&auto=format&fit=crop',
      desc: 'Fettine di manzo crude, rucola, scaglie di grana e limone.',
      longDesc: 'Carpaccio di fassona piemontese battuta al coltello, condita con olio EVO, succo di limone, rucola selvatica, scaglie di grana padano DOP 24 mesi e pepe rosa.',
      prep: 8, allergens: ['lattosio'], tone: 'b',
      ingredients: ['Fassona', 'Rucola', 'Grana padano', 'Limone', 'Pepe rosa'],
      extras: [{ id: 'e1', name: 'Grana extra', price: 2 }],
      variants: [], cal: 290, macros: { carbo: 2, grassi: 18, prot: 30, fibre: 1 } },
    { id: 'a6', name: 'Bruschette al pomodoro', price: 8, kind: 'default', photo: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=70&auto=format&fit=crop',
      desc: 'Pane casereccio tostato, pomodoro fresco, aglio e olio EVO.',
      longDesc: 'Bruschette di pane casereccio tostato a legna, strofinato con aglio, condite con pomodoro fresco di stagione, basilico, olio extravergine di oliva e sale grosso.',
      prep: 6, allergens: ['glutine'], tone: 'c',
      ingredients: ['Pane casereccio', 'Pomodoro', 'Aglio', 'Basilico', 'Olio EVO'],
      extras: [], variants: [], cal: 220, macros: { carbo: 32, grassi: 8, prot: 6, fibre: 3 } },
  ],
  'Primi piatti': [
    { id: 'p1', name: 'Cacio e pepe', price: 14, kind: 'pasta', photo: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=70&auto=format&fit=crop',
      desc: 'Tonnarelli, pecorino romano DOP, pepe nero macinato fresco.',
      longDesc: 'Tonnarelli freschi fatti in casa, mantecati con pecorino romano DOP stagionato 12 mesi e pepe nero del Sarawak macinato al momento. Una delle 4 paste classiche romane.',
      prep: 14, allergens: ['glutine','lattosio','uova'], tone: 'a',
      ingredients: ['Pecorino romano', 'Pepe nero', 'Tonnarelli'],
      extras: [{ id: 'e1', name: 'Pepe extra', price: 0 }, { id: 'e2', name: 'Pecorino in più', price: 2 }, { id: 'e3', name: 'Tartufo nero', price: 8 }],
      variants: [{ id: 'cottura', label: 'Cottura pasta', options: ['Al dente', 'Al punto', 'Ben cotta'] }],
      cal: 650, macros: { carbo: 78, grassi: 22, prot: 24, fibre: 4 } },
    { id: 'p2', name: 'Carbonara', price: 15, kind: 'carbonara', photo: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=70&auto=format&fit=crop',
      desc: 'Spaghettoni, guanciale, pecorino, uovo. La ricetta originale.',
      longDesc: "Spaghettoni di Gragnano IGP, guanciale di Amatrice croccante, tuorlo d'uovo fresco, pecorino romano DOP, pepe nero. Mantecata al momento, senza panna.",
      prep: 15, allergens: ['glutine','uova','lattosio'], tone: 'b',
      ingredients: ['Guanciale', 'Pecorino', 'Uovo', 'Pepe', 'Spaghettoni'],
      extras: [{ id: 'e1', name: 'Guanciale extra', price: 3 }, { id: 'e2', name: 'Pecorino extra', price: 2 }],
      variants: [{ id: 'cottura', label: 'Cottura pasta', options: ['Al dente', 'Al punto'] }],
      cal: 720, macros: { carbo: 72, grassi: 32, prot: 28, fibre: 3 } },
    { id: 'p3', name: 'Amatriciana', price: 14, kind: 'pasta', photo: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=70&auto=format&fit=crop',
      desc: 'Rigatoni, guanciale croccante, pomodoro San Marzano, pecorino.',
      longDesc: 'Rigatoni di Gragnano IGP con sugo di pomodoro San Marzano DOP, guanciale di Amatrice croccante, cipolla di Tropea e pecorino romano DOP. Ricetta tradizionale.',
      prep: 16, allergens: ['glutine','lattosio'], tone: 'a',
      ingredients: ['Guanciale', 'Pomodoro San Marzano', 'Pecorino', 'Cipolla'],
      extras: [{ id: 'e1', name: 'Guanciale extra', price: 3 }, { id: 'e2', name: 'Piccante', price: 0 }],
      variants: [{ id: 'cottura', label: 'Cottura pasta', options: ['Al dente', 'Al punto'] }],
      cal: 680, macros: { carbo: 74, grassi: 24, prot: 22, fibre: 5 } },
    { id: 'p4', name: 'Risotto al tartufo', price: 22, kind: 'default', photo: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=70&auto=format&fit=crop',
      desc: 'Riso Carnaroli, tartufo nero di Norcia, parmigiano, burro di malga.',
      longDesc: 'Risotto mantecato con riso Carnaroli Riserva San Massimo, tartufo nero pregiato di Norcia, parmigiano reggiano 36 mesi e burro di malga. Finito con lamelle di tartufo fresco.',
      prep: 20, allergens: ['lattosio'], tone: 'b',
      ingredients: ['Riso Carnaroli', 'Tartufo nero', 'Parmigiano', 'Burro di malga'],
      extras: [{ id: 'e1', name: 'Tartufo extra', price: 6 }],
      variants: [], cal: 580, macros: { carbo: 68, grassi: 24, prot: 16, fibre: 2 } },
    { id: 'p5', name: 'Gricia', price: 14, kind: 'pasta', photo: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=70&auto=format&fit=crop',
      desc: 'Rigatoni, guanciale, pecorino romano. La cacio e pepe con guanciale.',
      longDesc: 'Rigatoni con guanciale di Amatrice croccante mantecati con pecorino romano DOP e pepe nero. La cosiddetta "amatriciana in bianco", antesignana della carbonara.',
      prep: 14, allergens: ['glutine','lattosio'], tone: 'c',
      ingredients: ['Guanciale', 'Pecorino', 'Pepe nero', 'Rigatoni'],
      extras: [{ id: 'e1', name: 'Guanciale extra', price: 3 }],
      variants: [{ id: 'cottura', label: 'Cottura pasta', options: ['Al dente', 'Al punto'] }],
      cal: 690, macros: { carbo: 70, grassi: 28, prot: 26, fibre: 3 } },
    { id: 'p6', name: 'Gnocchi al sugo', price: 13, kind: 'default', photo: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=70&auto=format&fit=crop',
      desc: 'Gnocchi di patate fatti in casa, sugo di pomodoro e basilico fresco.',
      longDesc: 'Gnocchi di patate fatti a mano ogni mattina, conditi con sugo di pomodoro fresco al basilico, olio EVO e una spolverata di parmigiano reggiano.',
      prep: 12, allergens: ['glutine','uova','lattosio'], tone: 'a',
      ingredients: ['Patate', 'Farina', 'Pomodoro', 'Basilico', 'Parmigiano'],
      extras: [{ id: 'e1', name: 'Parmigiano extra', price: 2 }],
      variants: [], cal: 520, macros: { carbo: 82, grassi: 12, prot: 14, fibre: 4 } },
  ],
  'Secondi piatti': [
    { id: 's1', name: 'Saltimbocca alla romana', price: 22, kind: 'secondo', photo: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=70&auto=format&fit=crop',
      desc: 'Vitello, prosciutto crudo, salvia. Mantecato al burro.',
      longDesc: 'Fettine di vitello sottili avvolte in prosciutto crudo di Parma e foglia di salvia fresca. Cotte in padella e sfumate con vino bianco, mantecate al burro.',
      prep: 22, allergens: ['lattosio','glutine'], tone: 'c',
      ingredients: ['Prosciutto crudo', 'Salvia', 'Burro', 'Vino bianco'],
      extras: [{ id: 'e1', name: 'Patate al rosmarino', price: 4 }, { id: 'e2', name: 'Insalata mista', price: 5 }],
      variants: [{ id: 'cottura', label: 'Cottura', options: ['Al sangue', 'Media', 'Ben cotta'], required: true }],
      cal: 580, macros: { carbo: 8, grassi: 32, prot: 52, fibre: 1 } },
    { id: 's2', name: 'Abbacchio alla cacciatora', price: 26, kind: 'default', photo: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=70&auto=format&fit=crop',
      desc: 'Agnello romano in umido con aceto, rosmarino e aglio.',
      longDesc: 'Abbacchio laziale in umido con aceto di vino bianco, rosmarino, aglio, capperi e acciughe. Ricetta della tradizione romana, servito con pane casereccio.',
      prep: 35, allergens: ['pesce','glutine'], tone: 'a',
      ingredients: ['Abbacchio', 'Rosmarino', 'Aglio', 'Aceto', 'Capperi'],
      extras: [{ id: 'e1', name: 'Pane casereccio', price: 2 }],
      variants: [], cal: 620, macros: { carbo: 6, grassi: 38, prot: 58, fibre: 2 } },
    { id: 's3', name: 'Baccalà in pastella', price: 18, kind: 'default', photo: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=400&q=70&auto=format&fit=crop',
      desc: 'Filetto di baccalà fritto in pastella leggera, limone.',
      longDesc: 'Filetto di baccalà norvegese dissalato 48 ore, avvolto in pastella di farina di riso e birra artigianale. Fritto a 180°C, servito con spicchio di limone e salsa verde.',
      prep: 18, allergens: ['pesce','glutine','uova'], tone: 'b',
      ingredients: ['Baccalà', 'Farina di riso', 'Birra', 'Limone'],
      extras: [{ id: 'e1', name: 'Salsa verde', price: 1.5 }],
      variants: [], cal: 490, macros: { carbo: 28, grassi: 22, prot: 42, fibre: 1 } },
    { id: 's4', name: 'Coda alla vaccinara', price: 24, kind: 'default', photo: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=70&auto=format&fit=crop',
      desc: 'Coda di manzo brasata con sedano, pomodoro e cacao amaro.',
      longDesc: "Classico della cucina romana povera: coda di manzo brasata lentamente per 4 ore con sedano, pomodoro, uvetta, pinoli e cacao amaro. Ricetta del '900 romano.",
      prep: 240, allergens: ['fruttaguscio'], tone: 'c',
      ingredients: ['Coda di manzo', 'Sedano', 'Pomodoro', 'Uvetta', 'Cacao'],
      extras: [], variants: [], cal: 740, macros: { carbo: 22, grassi: 42, prot: 60, fibre: 5 } },
    { id: 's5', name: 'Pollo alla romana', price: 19, kind: 'default', photo: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&q=70&auto=format&fit=crop',
      desc: 'Petto di pollo con peperoni, pomodoro, vino bianco e rosmarino.',
      longDesc: 'Pollo ruspante della campagna romana in umido con peperoni gialli e rossi, pomodoro pelato, vino bianco secco, rosmarino e aglio. Cottura lenta a tegame coperto.',
      prep: 40, allergens: [], tone: 'a',
      ingredients: ['Pollo ruspante', 'Peperoni', 'Pomodoro', 'Vino bianco', 'Rosmarino'],
      extras: [{ id: 'e1', name: 'Pane casereccio', price: 2 }],
      variants: [], cal: 460, macros: { carbo: 14, grassi: 18, prot: 52, fibre: 4 } },
    { id: 's6', name: 'Filetto di manzo', price: 32, kind: 'default', photo: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=70&auto=format&fit=crop',
      desc: 'Filetto di chianina 200g, riduzione al Barolo, patate arrosto.',
      longDesc: 'Filetto di chianina IGP 200g cotto alla griglia, servito con riduzione al Barolo, rosmarino e patate arrosto. Selezionato dal nostro macellaio di fiducia.',
      prep: 25, allergens: ['lattosio'], tone: 'b',
      ingredients: ['Filetto chianina', 'Barolo', 'Patate', 'Rosmarino'],
      extras: [{ id: 'e1', name: 'Salsa al pepe verde', price: 2 }, { id: 'e2', name: 'Insalata mista', price: 5 }],
      variants: [{ id: 'cottura', label: 'Cottura', options: ['Al sangue', 'Media', 'Ben cotta'], required: true }],
      cal: 520, macros: { carbo: 18, grassi: 22, prot: 60, fibre: 3 } },
  ],
  'Dolci': [
    { id: 'd1', name: 'Tiramisù della casa', price: 8, kind: 'dolce', photo: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=70&auto=format&fit=crop',
      desc: 'Mascarpone, savoiardi, caffè espresso, cacao.',
      longDesc: 'Tiramisù fatto in casa con mascarpone montato a mano, savoiardi inzuppati nel caffè espresso appena fatto, spolverata di cacao amaro Valrhona.',
      prep: 5, allergens: ['glutine','uova','lattosio'], tone: 'a',
      ingredients: ['Mascarpone', 'Savoiardi', 'Caffè', 'Cacao'],
      extras: [{ id: 'e1', name: 'Cacao extra', price: 0 }],
      variants: [], cal: 420, macros: { carbo: 38, grassi: 24, prot: 8, fibre: 1 } },
    { id: 'd2', name: 'Panna cotta ai frutti di bosco', price: 7, kind: 'dolce', photo: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=70&auto=format&fit=crop',
      desc: 'Panna cotta cremosa con coulis di frutti di bosco freschi.',
      longDesc: 'Panna cotta preparata con panna fresca, vaniglia del Madagascar e coulis di mirtilli, lamponi e more fresche. Senza glutine.',
      prep: 5, allergens: ['lattosio'], tone: 'b',
      ingredients: ['Panna fresca', 'Vaniglia', 'Frutti di bosco'],
      extras: [], variants: [], cal: 340, macros: { carbo: 28, grassi: 22, prot: 4, fibre: 3 } },
    { id: 'd3', name: 'Torta della nonna', price: 8, kind: 'dolce', photo: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&q=70&auto=format&fit=crop',
      desc: 'Pasta frolla, crema pasticciera, pinoli e zucchero a velo.',
      longDesc: 'Crostata di pasta frolla fatta in casa, ripiena di crema pasticciera alla vaniglia, ricoperta di pinoli tostati e zucchero a velo. Ricetta della tradizione toscana.',
      prep: 5, allergens: ['glutine','uova','lattosio','fruttaguscio'], tone: 'c',
      ingredients: ['Pasta frolla', 'Crema pasticciera', 'Pinoli', 'Zucchero a velo'],
      extras: [], variants: [], cal: 480, macros: { carbo: 52, grassi: 26, prot: 8, fibre: 2 } },
    { id: 'd4', name: 'Cannolo siciliano', price: 6, kind: 'dolce', photo: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=70&auto=format&fit=crop',
      desc: 'Scorza croccante, ricotta di pecora, gocce di cioccolato fondente.',
      longDesc: "Cannolo siciliano artigianale con scorza fritta croccante, ripiena al momento con ricotta di pecora setacciata, gocce di cioccolato fondente e scorza d'arancia candita.",
      prep: 3, allergens: ['glutine','lattosio','uova'], tone: 'a',
      ingredients: ['Ricotta di pecora', 'Cioccolato fondente', 'Arancia candita'],
      extras: [], variants: [], cal: 310, macros: { carbo: 34, grassi: 16, prot: 8, fibre: 1 } },
    { id: 'd5', name: 'Crème brûlée', price: 8, kind: 'dolce', photo: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=70&auto=format&fit=crop',
      desc: 'Crema alla vaniglia con crosta caramellata al momento.',
      longDesc: 'Crema pasticciera arricchita con tuorli freschi e vaniglia Bourbon del Madagascar. Copertura di zucchero di canna caramellata al cannello al momento del servizio.',
      prep: 5, allergens: ['uova','lattosio'], tone: 'b',
      ingredients: ['Panna fresca', 'Tuorli', 'Vaniglia', 'Zucchero di canna'],
      extras: [], variants: [], cal: 390, macros: { carbo: 30, grassi: 26, prot: 6, fibre: 0 } },
    { id: 'd6', name: 'Gelato artigianale', price: 5, kind: 'dolce', photo: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=70&auto=format&fit=crop',
      desc: 'Due gusti a scelta: cioccolato fondente, pistacchio, fragola, fior di latte.',
      longDesc: 'Gelato artigianale prodotto ogni giorno con latte fresco intero e ingredienti selezionati. Disponibile in coppetta o cono.',
      prep: 2, allergens: ['lattosio','fruttaguscio'], tone: 'c',
      ingredients: ['Latte fresco', 'Zucchero', 'Ingredienti freschi di stagione'],
      extras: [], variants: [{ id: 'gusto', label: 'Gusti', options: ['Cioccolato fondente', 'Pistacchio', 'Fragola', 'Fior di latte'], required: true }],
      cal: 260, macros: { carbo: 34, grassi: 12, prot: 5, fibre: 1 } },
  ],
  'Bevande': [
    { id: 'b1', name: 'Acqua naturale 75cl', price: 3, kind: 'acqua', photo: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=70&auto=format&fit=crop',
      desc: 'Acqua minerale naturale, bottiglia di vetro.',
      longDesc: 'Acqua oligominerale naturale in bottiglia di vetro da 75cl.',
      prep: 1, allergens: [], tone: 'a', ingredients: [], extras: [], variants: [], cal: 0, macros: { carbo: 0, grassi: 0, prot: 0, fibre: 0 } },
    { id: 'b2', name: 'Vino della casa 0.5L', price: 12, kind: 'vino', photo: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=70&auto=format&fit=crop',
      desc: 'Rosso o bianco. Selezione del sommelier.',
      longDesc: 'Caraffa da 0.5L di vino della casa, selezionato dal nostro sommelier. Rosso corposo del Lazio o bianco fresco dei Castelli Romani.',
      prep: 2, allergens: [], tone: 'b', ingredients: [],
      extras: [],
      variants: [{ id: 'tipo', label: 'Tipo di vino', options: ['Rosso', 'Bianco'], required: true }],
      cal: 320, macros: { carbo: 12, grassi: 0, prot: 0, fibre: 0 } },
    { id: 'b3', name: 'Birra artigianale 33cl', price: 6, kind: 'default', photo: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=70&auto=format&fit=crop',
      desc: 'Selezione di birre artigianali laziali. Chiedi al cameriere.',
      longDesc: 'Selezione rotante di birre artigianali del Lazio e dintorni. IPA, Lager, Ambrata o Weiss. Il cameriere ti illustrerà le birre disponibili del giorno.',
      prep: 2, allergens: ['glutine'], tone: 'c', ingredients: [], extras: [],
      variants: [{ id: 'tipo', label: 'Tipo', options: ['IPA', 'Lager', 'Ambrata', 'Weiss'], required: true }],
      cal: 150, macros: { carbo: 14, grassi: 0, prot: 2, fibre: 0 } },
    { id: 'b4', name: 'Succo di frutta 20cl', price: 4, kind: 'default', photo: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=70&auto=format&fit=crop',
      desc: 'Succo di frutta fresco, senza zuccheri aggiunti.',
      longDesc: 'Succo di frutta estratto a freddo, senza zuccheri aggiunti né conservanti. Disponibile: arancia, mela, carota-zenzero, ananas.',
      prep: 3, allergens: [], tone: 'a', ingredients: [],
      extras: [],
      variants: [{ id: 'gusto', label: 'Gusto', options: ['Arancia', 'Mela', 'Carota-zenzero', 'Ananas'], required: true }],
      cal: 90, macros: { carbo: 22, grassi: 0, prot: 1, fibre: 1 } },
    { id: 'b5', name: 'Caffè espresso', price: 2, kind: 'default', photo: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=70&auto=format&fit=crop',
      desc: 'Miscela arabica 100%, tostatura artigianale.',
      longDesc: 'Caffè espresso con miscela di arabica 100% selezionata dal nostro torrefattore di fiducia. Disponibile anche macchiato, ristretto o lungo.',
      prep: 2, allergens: [], tone: 'b', ingredients: [],
      extras: [],
      variants: [{ id: 'tipo', label: 'Tipo', options: ['Normale', 'Macchiato', 'Ristretto', 'Lungo'] }],
      cal: 5, macros: { carbo: 1, grassi: 0, prot: 0, fibre: 0 } },
    { id: 'b6', name: 'Acqua frizzante 75cl', price: 3, kind: 'acqua', photo: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=70&auto=format&fit=crop',
      desc: 'Acqua minerale frizzante, bottiglia di vetro.',
      longDesc: 'Acqua minerale effervescente naturale in bottiglia di vetro da 75cl.',
      prep: 1, allergens: [], tone: 'c', ingredients: [], extras: [], variants: [], cal: 0, macros: { carbo: 0, grassi: 0, prot: 0, fibre: 0 } },
  ],
};
const ALL_DISHES = Object.values(DISHES_BY_CAT).flat();
const findDish = (id) => ALL_DISHES.find(d => d.id === id);

// ─── App-only gate (web app) ───────────────────────────────
// Alcune funzioni (filtri avanzati, pagamento) sono riservate all'app nativa.
// Qualsiasi punto del codice apre il popup chiamando openAppOnly().
function openAppOnly() {
  try { window.dispatchEvent(new CustomEvent('byup:apponly')); } catch {}
}

function AppOnlySheet({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000,
      display: 'flex', alignItems: 'flex-end', animation: 'fade 0.2s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: '#fff',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '14px 22px 30px', textAlign: 'center',
        animation: 'slideUp 0.28s cubic-bezier(.2,.9,.3,1.1)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e0e0e0', margin: '0 auto 18px' }}/>
        <div style={{ fontSize: 46, marginBottom: 10 }}>📱</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: TEXT, letterSpacing: -0.4, marginBottom: 8 }}>
          Disponibile nell'app
        </div>
        <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, marginBottom: 22, padding: '0 6px' }}>
          Questa funzionalità è riservata agli utenti dell'app byup. Scaricala
          per usarla e per gestire i tuoi ordini ovunque.
        </div>
        <a href="https://byup.app/download" target="_blank" rel="noopener noreferrer" onClick={onClose} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', height: 54, borderRadius: 999,
          background: WINE, color: '#fff', textDecoration: 'none',
          fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit',
          boxShadow: `0 4px 14px ${WINE}40`,
        }}>
          Scarica l'app
        </a>
        <button onClick={onClose} style={{
          marginTop: 12, background: 'transparent', border: 'none',
          color: MUTED, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
          cursor: 'pointer', padding: '6px 12px',
        }}>
          Continua sul web
        </button>
      </div>
    </div>
  );
}

// Montato una sola volta dentro la colonna della web app: ascolta l'evento
// globale e mostra il popup, confinato alla colonna (overflow hidden).
function AppOnlyHost() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener('byup:apponly', h);
    return () => window.removeEventListener('byup:apponly', h);
  }, []);
  return open ? <AppOnlySheet onClose={() => setOpen(false)}/> : null;
}

// ─── MENU SCREEN ───────────────────────────────────────────
function MenuScreen({ state, setState, goTo, takeaway = false }) {
  const tabs = ['Antipasti', 'Primi piatti', 'Secondi piatti', 'Dolci', 'Bevande'];
  const CAT_ICONS = { 'Antipasti': '🥖', 'Primi piatti': '🍝', 'Secondi piatti': '🥩', 'Dolci': '🍰', 'Bevande': '🍷' };
  const [tab, setTab] = useState('Antipasti');
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const tabBarRef = useRef(null);

  // IntersectionObserver: aggiorna la tab attiva mentre si scorre
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setTab(e.target.dataset.cat);
      });
    }, { root, rootMargin: '-10% 0px -80% 0px', threshold: 0 });
    tabs.forEach(t => { const el = sectionRefs.current[t]; if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Scroll alla sezione quando si clicca una tab.
  // Uso la differenza tra i bounding rect: offsetTop sarebbe relativo al div
  // radice (position:relative) e includerebbe l'altezza dell'header sticky,
  // facendo scorrere troppo e nascondendo il titolo sopra il bordo.
  const scrollToTab = (t) => {
    const el = sectionRefs.current[t];
    const root = scrollRef.current;
    if (el && root) {
      const delta = el.getBoundingClientRect().top - root.getBoundingClientRect().top;
      root.scrollTo({ top: root.scrollTop + delta - 12, behavior: 'smooth' });
    }
  };

  // Scroll la tab bar per tenere la tab attiva visibile
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const activeEl = bar.querySelector(`[data-tab="${tab}"]`);
    if (activeEl) activeEl.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [tab]);

  // mode: 'table' (default, came via QR) | 'venue' (came from Vetrina, no table yet)
  // fromVenue: true se l'URL ha ?from=venue OPPURE se il referrer è la vetrina.
  // Una volta determinato, ripuliamo l'URL così un eventuale refresh non resta "incastrato".
  const fromVenue = (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('from') === 'venue') {
        // pulisci il param dall'URL senza ricaricare
        sp.delete('from');
        const q = sp.toString();
        const newUrl = window.location.pathname + (q ? '?' + q : '') + window.location.hash;
        window.history.replaceState(null, '', newUrl);
        sessionStorage.setItem('byup_menu_from', 'venue');
        return true;
      }
      // se siamo già stati segnati come "from venue" in questa sessione, rispetta lo stato
      if (sessionStorage.getItem('byup_menu_from') === 'venue') return true;
      // referrer fallback
      const ref = document.referrer || '';
      if (ref.includes('page=venue') || ref.includes('Vetrina')) {
        sessionStorage.setItem('byup_menu_from', 'venue');
        return true;
      }
    } catch {}
    return false;
  })();
  const [searchQ, setSearchQ] = useState('');
  const [sheetMode, setSheetMode] = useState('collapsed'); // 'collapsed' | 'expanded'
  const [splitPickItem, setSplitPickItem] = useState(null); // piatto per il popup "con chi dividi?" (swipe ←)
  const [confirm, setConfirm] = useState(false);
  // Prompt coperti: appare al primo ingresso al tavolo (non da Vetrina), una sola volta
  const [copertiSheetOpen, setCopertiSheetOpen] = useState(false);
  // Sheet "Al tavolo": stessa usata in Payment / Home — lista commensali + share link
  const [guestsOpen, setGuestsOpen] = useState(false);
  useEffect(() => {
    // All'asporto non c'è un tavolo: niente prompt dei coperti (D-14).
    if (!fromVenue && !takeaway && !state.copertiSelected) {
      const t = setTimeout(() => setCopertiSheetOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);
  const confirmCoperti = (n) => {
    setState(s => ({ ...s, coperti: n, copertiSelected: true }));
    setCopertiSheetOpen(false);
  };
  const skipCoperti = () => {
    setState(s => ({ ...s, copertiSelected: true }));
    setCopertiSheetOpen(false);
  };

  const dishes = DISHES_BY_CAT;

  const cart = state.cart; // array of { lineId, dishId, qty, variants, extras, removed }
  const allDishesFlat = Object.values(dishes).flat();

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => {
    const d = allDishesFlat.find(x => x.id === i.dishId);
    if (!d) return s;
    const extTotal = Object.entries(i.extras || {}).reduce((es, [eid, eq]) => {
      const ex = d.extras?.find(e => e.id === eid);
      return es + (ex ? ex.price * eq : 0);
    }, 0);
    return s + (d.price + extTotal) * i.qty;
  }, 0);

  // Remove one unit from card: prefer plain line, fallback to last line
  const removeDishFromCard = (dishId) => setState(s => {
    const plainLine = s.cart.find(i => i.dishId === dishId && !Object.keys(i.variants||{}).length && !Object.keys(i.extras||{}).length && !Object.keys(i.removed||{}).length);
    const target = plainLine || [...s.cart].reverse().find(i => i.dishId === dishId);
    if (!target) return s;
    if (target.qty <= 1) return { ...s, cart: s.cart.filter(i => i.lineId !== target.lineId) };
    return { ...s, cart: s.cart.map(i => i.lineId === target.lineId ? { ...i, qty: i.qty - 1 } : i) };
  });

  // Quick add (no customization): merge with existing plain line, or create new
  const addDish = (id) => { setState(s => { if (s.cart.length === 0) setSheetMode('expanded'); return s; }); setState(s => {
    const existing = s.cart.find(i => i.dishId === id && !Object.keys(i.variants || {}).length && !Object.keys(i.extras || {}).length && !Object.keys(i.removed || {}).length);
    if (existing) return { ...s, cart: s.cart.map(i => i.lineId === existing.lineId ? { ...i, qty: i.qty + 1 } : i) };
    return { ...s, cart: [...s.cart, { lineId: id + '-' + Date.now(), dishId: id, qty: 1, variants: {}, extras: {}, removed: {} }] };
  }); };
  // Le divisioni sono per unità (`lineId-0`, `lineId-1`, …): calando la
  // quantità le chiavi delle unità sparite vanno buttate, o resterebbero
  // appese e tornerebbero a galla riportando su la quantità.
  const setQty = (lineId, q) => setState(s => {
    const splits = { ...(s.splits || {}) };
    Object.keys(splits).forEach(k => {
      const i = k.lastIndexOf('-');
      if (k.slice(0, i) === lineId && Number(k.slice(i + 1)) >= Math.max(0, q)) delete splits[k];
    });
    return {
      ...s, splits,
      cart: q <= 0 ? s.cart.filter(i => i.lineId !== lineId) : s.cart.map(i => i.lineId === lineId ? { ...i, qty: q } : i),
    };
  });
  const clearCart = () => setState(s => ({ ...s, cart: [] }));

  const handleSubmit = () => {
    if (takeaway) { submitTakeawayOrder(); return; }
    // Al tavolo l'ordine va sempre in cucina.
    // Outbound verso il backend (oggi mock): invio dei piatti alla sessione tavolo.
    window.ByupAPI && window.ByupAPI.addItems({
      sessionId: state.activeOrder && state.activeOrder.id,
      ownerId: 'me',
      lines: state.cart.map(li => ({
        dishId: li.dishId, qty: li.qty, variants: li.variants, extras: li.extras, removed: li.removed,
      })),
    });
    submitTableOrder();
  };

  // L'asporto si compone, non si rimanda (P-01 · D-14): l'ordine nasce qui,
  // identificato dal SOLO codice di ritiro — nessun nome, nessun telefono,
  // nessun account — e va saldato in cassa o dall'app; in cucina parte al
  // saldo. Finzione dichiarata: l'ordine resta in questo bundle. Vendita
  // diretta nel gestionale ha i suoi ordini webapp nel seme (fonte 'webapp',
  // senza nome, con codiceRitiro) e non riceve questo; un registro condiviso
  // in localStorage letto da Vendita diretta è in coda, non qui.
  const submitTakeawayOrder = () => {
    setConfirm(true);
    setTimeout(() => {
      setState(s => {
        const items = s.cart.map(li => {
          const d = Object.values(dishes).flat().find(x => x.id === li.dishId);
          return { lineId: 'me-' + li.lineId, id: li.dishId, name: d?.name, price: d?.price, qty: li.qty, ownerId: 'me',
            variants: li.variants, extras: li.extras, removed: li.removed };
        });
        return { ...s, cart: [], activeOrder: {
          id: genOrderId(),
          code: genRecoveryCode(),          // codice ordine, sei cifre: l'aggancio in app (P-55)
          codiceRitiro: nuovoCodiceRitiro(), // codice di ritiro: l'identità dell'ordine al banco
          type: 'takeaway', stato: 'da_saldare',
          venue: 'Ristorante Maria Grazia',
          items, total: cartTotal, startedAt: new Date(),
        } };
      });
      setConfirm(false);
      goTo('home');
    }, 1500);
  };

  const submitTableOrder = () => {
    setConfirm(true);
    // P-103: il momento in cui la voce di coperto o servizio è stata esposta e
    // confermata finisce sull'ordine (orders.cover_disclosed_at). Su un menù
    // di carta la prova che il cliente poteva conoscerla non esiste; qui
    // esiste, ed è un vantaggio che il prodotto offre all'esercente.
    const coverDisclosedAt = new Date().toISOString();
    setTimeout(() => {
      setState(s => {
        const newItems = s.cart.map(li => {
          const d = Object.values(dishes).flat().find(x => x.id === li.dishId);
          return {
            lineId: 'me-' + li.lineId,
            id: li.dishId, name: d?.name, price: d?.price, qty: li.qty, ownerId: 'me',
            variants: li.variants, extras: li.extras, removed: li.removed,
          };
        });
        // Cumula sull'ordine tavolo esistente, altrimenti ne crea uno nuovo.
        if (s.activeOrder && s.activeOrder.type === 'table') {
          const merged = [...s.activeOrder.items, ...newItems];
          const newTotal = merged.reduce((sum, i) => sum + i.price * i.qty, 0);
          return {
            ...s,
            activeOrder: { ...s.activeOrder, items: merged, total: newTotal, cover_disclosed_at: s.activeOrder.cover_disclosed_at || coverDisclosedAt },
            cart: [],
          };
        }
        return {
          ...s,
          activeOrder: {
            id: genOrderId(),
            code: genRecoveryCode(),
            type: 'table',
            venue: 'Ristorante Maria Grazia',
            table: 'Tavolo 23',
            items: newItems,
            total: cartTotal,
            startedAt: new Date(),
            cover_disclosed_at: coverDisclosedAt,
            covers: 4,
            guests: [
              { id: 'me', name: 'Tu', initial: 'T', isMe: true, isApp: true },
              { id: 'g1', name: 'Marco', initial: 'M', isApp: true },
              { id: 'g2', name: 'Ospite', initial: '?', isGuest: true },
              { id: 'g3', name: 'Ospite', initial: '?', isGuest: true },
            ],
          },
          cart: [],
        };
      });
      setConfirm(false);
      goTo('home');
    }, 1500);
  };


  return (
    <div data-screen-label="Menu locale" style={{
      width: '100%', height: '100%', background: BG_PAGE, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Floating back button — solo se si arriva da una vetrina.
          Come web app, il menu è la schermata radice: niente "indietro". */}
      {fromVenue && (
      <button onClick={() => {
        try { sessionStorage.removeItem('byup_menu_from'); } catch {}
        goTo('venue');
      }} style={{
        position: 'absolute', top: 56, left: 16, zIndex: 20,
        width: 38, height: 38, borderRadius: 999,
        background: 'rgba(255,255,255,0.95)', border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      )}

      {/* Top: sticky header (search + tabs + filtri attivi) */}
      <div style={{ background: BG_PAGE, position: 'relative', zIndex: 5 }}>
        {/* Search + filtri */}
        <div style={{ padding: '60px 16px 0 64px', display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', borderRadius: 999, padding: '9px 14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>
            <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Cerca un piatto, un ingrediente…" style={{
              border: 'none', outline: 'none', flex: 1, fontSize: 13.5, fontFamily: 'inherit', color: TEXT, background: 'transparent',
            }}/>
            {searchQ && (
              <button onClick={() => setSearchQ('')} style={{
                border: 'none', background: 'none', cursor: 'pointer', color: MUTED, fontSize: 14,
              }}>✕</button>
            )}
          </div>
          <button onClick={openAppOnly} style={{
            width: 38, height: 38, borderRadius: 999, flexShrink: 0,
            background: '#fff', border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
              <circle cx="18" cy="12" r="2.5"/>
              <circle cx="14" cy="18" r="2.5"/>
            </svg>
          </button>
        </div>

        {/* Riga 3: tabs categorie */}
        <div ref={tabBarRef} className="hscroll" style={{
          display: 'flex', gap: 4, padding: '12px 16px 0',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {tabs.map(t => {
            const active = t === tab;
            return (
              <button key={t} data-tab={t} onClick={() => scrollToTab(t)} style={{
                background: 'none', border: 'none', padding: '10px 16px 12px', flex: '0 0 auto',
                borderBottom: `2.5px solid ${active ? WINE : 'transparent'}`,
                fontSize: 16, fontWeight: active ? 700 : 500,
                color: active ? WINE : MUTED,
                fontFamily: 'inherit', cursor: 'pointer',
                letterSpacing: -0.1, whiteSpace: 'nowrap',
                transition: 'color 0.18s',
              }}>{t}</button>
            );
          })}
        </div>

      </div>

      {/* Scrollable list */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 0 240px' }}>

        {/* Hero image — scorre via */}
        {!searchQ && (
          <div onClick={() => goTo('venue')} style={{ position: 'relative', height: 180, overflow: 'hidden', marginBottom: 20, cursor: 'pointer' }}>
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=70&auto=format&fit=crop"
              alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.02)' }}/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.75) 100%)' }}/>
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Menu</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.4, lineHeight: 1.1 }}>Al Settembrini</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: '#4ade80' }}/>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Aperto · 12:00 – 23:30</span>
                  </div>
                </div>
                {(() => {
                  const guests = state.activeOrder?.guests || [];
                  const tableN = state.tableNumber || (state.activeOrder?.table?.match(/\d+/)?.[0]) || '23';
                  return (
                    <button
                      onClick={(e) => { e.stopPropagation(); setGuestsOpen(true); }}
                      title="Chi è al tavolo"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        background: 'rgba(255,255,255,0.22)',
                        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.35)',
                        borderRadius: 999, padding: '5px 12px 5px 6px',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                      {guests.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                          {guests.slice(0, 3).map((g, i) => (
                            <div key={g.id || i} style={{
                              width: 24, height: 24, borderRadius: 999,
                              background: (g.isApp || g.isWebApp) ? '#1a1a1a' : '#c4b89f',
                              color: '#fff',
                              border: '2px solid rgba(255,255,255,0.55)', marginLeft: -8,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9.5, fontWeight: 700,
                            }}>{g.initial || '?'}</div>
                          ))}
                          {guests.length > 3 && (
                            <div style={{
                              width: 24, height: 24, borderRadius: 999,
                              background: '#c4b89f', color: '#fff',
                              border: '2px solid rgba(255,255,255,0.55)', marginLeft: -8,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 700,
                            }}>+{guests.length - 3}</div>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.05, paddingRight: 4 }}>
                        <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.78)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Tavolo {tableN}
                        </span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>
                          {guests.length > 0 ? `${guests.length} al tavolo` : 'Invita amici'}
                        </span>
                      </div>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: '0 18px' }}>

        {/* Tutte le categorie in sequenza */}
        </div>{/* end padding wrapper */}
        {tabs.map(catName => {
          const sorted = (DISHES_BY_CAT[catName] || []).filter(d => {
            if (searchQ && !d.name.toLowerCase().includes(searchQ.toLowerCase()) && !d.desc.toLowerCase().includes(searchQ.toLowerCase())) return false;
            return true;
          });
          if (!sorted.length) return null;
          return (
            <div key={catName} ref={el => sectionRefs.current[catName] = el} data-cat={catName} style={{ marginBottom: 8, padding: '0 18px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 24, marginBottom: 18 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4 }}>{catName}</div>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sorted.length} {sorted.length === 1 ? 'piatto' : 'piatti'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {sorted.map((d) => {
                  const qty = cart.filter(i => i.dishId === d.id).reduce((s, i) => s + i.qty, 0);
                  // "+" intelligente: se il piatto ha scelte obbligatorie (es. cottura
                  // carne, gusto), il + apre il personalizza invece di aggiungere alla cieca.
                  const needsChoice = (d.variants || []).some(v => v.required);
                  const quickAdd = (e) => { e.stopPropagation(); needsChoice ? goTo('dish', { dishId: d.id }) : addDish(d.id); };
                  return (
                    <React.Fragment key={d.id}>
                    <div onClick={() => goTo('dish', { dishId: d.id })} style={{
                      background: '#fff', borderRadius: 18, padding: 14,
                      height: 166, overflow: 'hidden',
                      display: 'flex', gap: 14, cursor: 'pointer',
                      boxShadow: qty > 0 ? `0 4px 16px rgba(90,26,46,0.14)` : '0 1px 4px rgba(0,0,0,0.05)',
                      border: qty > 0 ? `1.5px solid ${WINE}` : '1.5px solid transparent',
                      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                    }}>
                      {/* Immagine a sinistra — riempie tutta l'altezza fissa della card */}
                      <div style={{ width: 130, height: '100%', borderRadius: 14, overflow: 'hidden', background: '#eee', flexShrink: 0 }}>
                        {d.photo ? (
                          <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        ) : (
                          <DishPhoto kind={d.kind}/>
                        )}
                      </div>
                      {/* Testo + pulsante a destra */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, lineHeight: 1.25, letterSpacing: -0.2, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.45, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10 }}>
                          {d.desc}
                        </div>
                        {d.allergens.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <AllergenDots ids={d.allergens}/>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{d.price}€</div>
                          <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                            {qty === 0 ? (
                              <button onClick={quickAdd} style={{
                                width: 32, height: 32, borderRadius: 999,
                                background: WINE, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(90,26,46,0.25)',
                              }}>
                                <I.Plus color="#fff" size={16}/>
                              </button>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: WINE, borderRadius: 999, padding: '3px 4px', boxShadow: '0 2px 8px rgba(90,26,46,0.25)' }}>
                                <button onClick={(e) => { e.stopPropagation(); removeDishFromCard(d.id); }} style={{ width: 24, height: 24, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><I.Minus color="#fff" size={12}/></button>
                                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, minWidth: 14, textAlign: 'center' }}>{qty}</span>
                                <button onClick={quickAdd} style={{ width: 24, height: 24, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><I.Plus color="#fff" size={12}/></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}

        <LegalFooter/>
      </div>

      {/* Bottom sheet — order */}
      <OrderSheet
        state={state} setState={setState}
        cartCount={cartCount} cartTotal={cartTotal}
        mode={sheetMode} setMode={setSheetMode}
        dishes={dishes} setQty={setQty} clearCart={clearCart}
        onSubmit={handleSubmit}
        goTo={goTo}
        onPickSplit={setSplitPickItem}
        takeaway={takeaway}
      />

      {/* Popup "con chi dividi?" — aperto dallo swipe ← su un piatto del carrello */}
      {splitPickItem && (
        <SplitPickSheet
          item={splitPickItem}
          participants={state.participants || [
            { id: 'me', name: 'Tu', initials: 'T', isMe: true },
            { id: 'p1', name: 'Marco', initials: 'M' },
            { id: 'p2', name: 'Margherita', initials: 'Mg' },
            { id: 'p3', name: 'Roberto', initials: 'R' },
          ]}
          onConfirm={(ids) => {
            const g = splitPickItem;
            const split = { kind: 'people', people: ids };
            setState(st => {
              const splits = { ...(st.splits || {}) };
              // Una unità, come lo swipe verso il tavolo.
              splits[`${g.lineId}-${g.indici[0]}`] = split;
              return { ...st, splits };
            });
            // Update ottimistico locale + invio al backend (oggi mock): col
            // backend reale il broadcast di sessione aggiorna gli altri.
            window.ByupAPI && window.ByupAPI.updateSplit({
              sessionId: state.activeOrder && state.activeOrder.id,
              lineId: `${g.lineId}-${g.indici[0]}`,
              split,
            });
            setSplitPickItem(null);
          }}
          onClose={() => setSplitPickItem(null)}/>
      )}

      {/* Confirm overlay */}
      {confirm && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 80,
          background: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          animation: 'fade 0.2s ease',
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, padding: '28px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            animation: 'pop 0.3s cubic-bezier(.2,.9,.3,1.3)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999, background: PINK,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <I.Check size={32} color="#fff"/>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginTop: 4 }}>
              {takeaway ? 'Ordine composto!' : 'Ordine inviato!'}
            </div>
            <div style={{ fontSize: 13, color: MUTED, textAlign: 'center', maxWidth: 220 }}>
              {takeaway ? 'Ecco il tuo codice di ritiro e come saldare.' : 'Lo trovi sulla home, è stato inviato al locale.'}
            </div>
          </div>
        </div>
      )}


      {/* Coperti prompt sheet — elegante, una sola volta */}
      {copertiSheetOpen && (
        <div onClick={skipCoperti} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 45,
          display: 'flex', alignItems: 'flex-end',
          animation: 'fade 0.22s ease',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '10px 22px 32px',
            animation: 'slideUp 0.32s cubic-bezier(.2,.9,.3,1.05)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          }}>
            <div style={{ width: 38, height: 4, background: '#e0d8db', borderRadius: 999, margin: '4px auto 18px' }}/>

            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4, marginBottom: 6 }}>
                Quanti siete al tavolo?
              </div>
              <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.45 }}>
                Ci servirà per dividere il conto, se vorrai farlo.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => confirmCoperti(n === 6 ? 6 : n)} style={{
                  height: 64, borderRadius: 14,
                  border: `1.5px solid ${BORDER}`,
                  background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 20, fontWeight: 800, color: TEXT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = WINE; e.currentTarget.style.background = '#fdf6f8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = '#fff'; }}
                >{n === 6 ? '6+' : n}</button>
              ))}
            </div>

            <button onClick={skipCoperti} style={{
              width: '100%', padding: '12px', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13.5, color: MUTED, fontWeight: 500,
            }}>
              Lo deciderò più tardi
            </button>
          </div>
        </div>
      )}

      {/* Sheet "Al tavolo" — stessa usata in Pagamento / Home: lista + share link */}
      {guestsOpen && (() => {
        const order = state.activeOrder || {
          table: state.tableNumber ? `Tavolo ${state.tableNumber}` : 'Tavolo 23',
          guests: [{ id: 'me', name: 'Tu', initial: 'T', isMe: true, isApp: true }],
          covers: state.coperti || 1,
        };
        const guests = order.guests || [];
        return (
          <GuestsSheet
            order={order}
            loggedIn={guests.filter(g => g.isApp || g.isWebApp).length}
            covers={order.covers || guests.length || 1}
            onClose={() => setGuestsOpen(false)}
            onAddGuest={() => addGuestToOrder(setState)}
            onRemoveGuest={(id) => removeGuestFromOrder(setState, id)}/>
        );
      })()}

    </div>
  );
}

// ─── Trascinamento del foglio ordine ───────────────────────
// La fascia si apre tirandola su e si chiude tirandola giù: è il gesto che il
// pollice fa già da solo davanti a un foglio appoggiato in fondo allo schermo.
// Il gesto si risolve DURANTE il movimento e non al rilascio — appena superi
// la soglia il foglio parte, così la risposta arriva mentre il dito è ancora
// giù invece che dopo averlo alzato.
const SOGLIA_TRASCINA = 28;
function useTrascinaFoglio(mode, setMode) {
  const rif = useRef(null);
  const trascinato = useRef(false);
  const inizio = (e) => {
    if (e.button != null && e.button !== 0) return;
    // Premuto su un bottone (cestino, invio ordine): quello non è un
    // trascinamento del foglio, è un comando suo.
    if (e.target.closest && e.target.closest('button')) return;
    rif.current = { y: e.clientY, risolto: false };
    trascinato.current = false;
    // Senza cattura, tirando in fretta il dito esce dalla fascia e i
    // `pointermove` smettono di arrivare a metà gesto.
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const muovi = (e) => {
    const r = rif.current;
    if (!r || r.risolto) return;
    const dy = e.clientY - r.y;
    if (dy <= -SOGLIA_TRASCINA && mode !== 'expanded') { r.risolto = true; trascinato.current = true; setMode('expanded'); }
    else if (dy >= SOGLIA_TRASCINA && mode === 'expanded') { r.risolto = true; trascinato.current = true; setMode('collapsed'); }
  };
  const fine = () => { rif.current = null; };
  // Scorciatoia sulla sola lineetta: toccare la maniglia di un foglio in
  // fondo allo schermo è un gesto che si fa d'istinto, e senza non
  // succedeva niente. Sulla fascia intera no: lì il tocco cadrebbe sopra il
  // contatore e i bottoni, dove non significa "apri". Dopo un trascinamento
  // il click arriva lo stesso e va ignorato, o riaprirebbe quel che hai
  // appena chiuso.
  const tocca = () => {
    if (trascinato.current) { trascinato.current = false; return; }
    setMode(mode === 'expanded' ? 'collapsed' : 'expanded');
  };
  return { presa: { onPointerDown: inizio, onPointerMove: muovi, onPointerUp: fine, onPointerCancel: fine }, tocca };
}

// ─── Order bottom sheet (collapsed/expanded) ───────────────
// ─── Riga piatto con swipe stile chat (stessa regola dell'app consumer) ─────
// → destra: il piatto si divide con TUTTO il tavolo
// ← sinistra: apre il popup "con chi dividi?"
// La riga molleggia al rilascio; oltre soglia scatta l'azione con flash.
function SwipeDishRow({ it, split, onTable, onPick, onUndoUno, onReset, onOpenDish, setQty }) {
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const [flash, setFlash] = useState(null); // 'table' | 'pick'
  const [askUndo, setAskUndo] = useState(false);   // conferma: togliere la divisione fra persone
  const start = useRef(0);
  const active = useRef(false);
  const moved = useRef(false);
  const TH = 78;
  const onDown = (e) => {
    active.current = true; moved.current = false;
    start.current = e.clientX; setDrag(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onMove = (e) => {
    if (!active.current) return;
    let d = e.clientX - start.current;
    if (Math.abs(d) > 6) moved.current = true;
    // resistenza oltre soglia, stile elastico
    if (Math.abs(d) > TH) d = Math.sign(d) * (TH + (Math.abs(d) - TH) * 0.35);
    setDx(d);
  };
  const onUp = () => {
    if (!active.current) return;
    active.current = false; setDrag(false);
    setDx(cur => {
      // Swipe ripetuto nel verso gia' applicato = disfare, non rifare.
      // Col tavolo si annulla subito (nessun dato da perdere); con una
      // divisione fra persone si chiede conferma, perche' si perde la scelta
      // di chi paga cosa.
      const giaTavolo   = split && split.kind === 'tavolo';
      const giaDiviso   = split && split.kind && split.kind !== 'tavolo' && split.kind !== 'me';
      if (cur > TH * 0.92) {
        try { window.ByupKit && window.ByupKit.haptic && window.ByupKit.haptic.light(); } catch {}
        // Anche il ritorno è una unità per volta, come l'andata.
        if (giaTavolo) { setTimeout(onUndoUno, 120); return 0; }
        setFlash('table'); setTimeout(() => setFlash(null), 520);
        setTimeout(onTable, 120);
      } else if (cur < -TH * 0.92) {
        try { window.ByupKit && window.ByupKit.haptic && window.ByupKit.haptic.light(); } catch {}
        if (giaDiviso) { setAskUndo(true); return 0; }
        setTimeout(onPick, 140);
      }
      return 0;
    });
  };
  const prog = Math.min(1, Math.abs(dx) / TH);
  const splitChip = split && split.kind !== 'me'
    ? (split.kind === 'tavolo' ? '🍽 Tavolo' : `⑂ ${(split.people?.length || 0) + 1} pers.`)
    : null;
  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: askUndo ? 'visible' : 'hidden', touchAction: 'pan-y' }}>
      {/* Conferma "togli la divisione": copre la riga stessa, cosi' si vede
          subito di quale piatto si parla. */}
      {askUndo && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4,
          background: 'rgba(255,255,255,0.97)', borderRadius: 12,
          border: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px',
        }}>
          <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>
            Togliere la divisione?
          </span>
          <button onClick={() => { setAskUndo(false); onUndoUno && onUndoUno(); }} style={{
            padding: '6px 12px', borderRadius: 999, border: 'none',
            background: WINE, color: '#fff', fontSize: 12.5, fontWeight: 800,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>Togli</button>
          <button onClick={() => setAskUndo(false)} style={{
            padding: '6px 10px', borderRadius: 999, border: `1px solid ${BORDER}`,
            background: '#fff', color: MUTED, fontSize: 12.5, fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>Annulla</button>
        </div>
      )}
      {/* fondo azione destra (swipe →): tutto il tavolo */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'flex-start', paddingLeft: 16, borderRadius: 12,
        background: 'linear-gradient(90deg, #7fb800, #a4d400)',
        opacity: dx > 0 ? Math.min(1, prog + .25) : 0, transition: drag ? 'none' : 'opacity .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1c2500', fontWeight: 800,
          fontSize: 12.5, transform: `scale(${0.8 + prog * 0.25})`, transformOrigin: 'left center',
          transition: drag ? 'none' : 'transform .3s' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1c2500" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h18M5 7v12h14V7M9 11v4M15 11v4"/>
          </svg>
          Tutto il tavolo
        </div>
      </div>
      {/* fondo azione sinistra (swipe ←): dividi con… */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end', paddingRight: 16, borderRadius: 12,
        background: 'linear-gradient(270deg, #E32459, #B81C47)',
        opacity: dx < 0 ? Math.min(1, prog + .25) : 0, transition: drag ? 'none' : 'opacity .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 800,
          fontSize: 12.5, transform: `scale(${0.8 + prog * 0.25})`, transformOrigin: 'right center',
          transition: drag ? 'none' : 'transform .3s' }}>
          Dividi con…
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
      </div>
      {/* riga in primo piano */}
      <div
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{
          position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          background: flash === 'table' ? '#eaf7cf' : BG_GRAY, borderRadius: 12, padding: '10px 12px',
          transform: `translateX(${dx}px)`,
          transition: drag ? 'none' : 'transform .5s cubic-bezier(.2,1.5,.35,1), background .35s',
          cursor: 'grab',
        }}>
        <div onClick={() => { if (!moved.current) onOpenDish(); }} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
            {splitChip && (
              <button onClick={(e) => { e.stopPropagation(); onReset(); }} title="Torna a 'per me'" style={{
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                fontSize: 10.5, fontWeight: 800, color: split.kind === 'tavolo' ? '#3d5200' : '#fff',
                background: split.kind === 'tavolo' ? '#d9f29b' : WINE,
                padding: '3px 8px', borderRadius: 999,
              }}>{splitChip} ×</button>
            )}
          </div>
          {it.summary && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {it.summary.split(', ').map((tag, i) => (
                <span key={i} style={{
                  fontSize: 11, fontWeight: 600, color: WINE,
                  background: '#f5eef2', padding: '2px 7px', borderRadius: 999,
                }}>{tag}</span>
              ))}
            </div>
          )}
          <div style={{ fontSize: 12.5, color: WINE, fontWeight: 700, marginTop: 5 }}>{it.unitPrice.toFixed(2)}€</div>
        </div>
        {it.frazionata ? (
          <span style={{
            fontSize: 13, fontWeight: 800, color: MUTED, flexShrink: 0,
            background: '#fff', borderRadius: 999, padding: '5px 11px',
          }}>×{it.qty}</span>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fff', borderRadius: 999, padding: '3px 6px',
          }}>
            <button onClick={() => setQty(it.lineId, it.qty - 1)} style={qtyBtn}><I.Minus size={13}/></button>
            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 14, textAlign: 'center', color: TEXT }}>{it.qty}</span>
            <button onClick={() => setQty(it.lineId, it.qty + 1)} style={qtyBtn}><I.Plus size={13} color={TEXT}/></button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sheet "con chi dividi?" aperto dallo swipe ← su un piatto
function SplitPickSheet({ item, participants, onConfirm, onClose }) {
  const [sel, setSel] = useState({});
  const people = participants.filter(pp => !pp.isMe && !pp.isGuest);
  const n = Object.values(sel).filter(Boolean).length;
  const per = item.unitPrice / (n + 1);
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 120,
      display: 'flex', alignItems: 'flex-end', animation: 'fade .2s',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '14px 22px calc(24px + env(safe-area-inset-bottom, 0px))',
        animation: 'slideUp .3s cubic-bezier(.2,1.1,.3,1)',
      }}>
        <div style={{ width: 40, height: 4, background: '#d9d9d9', borderRadius: 999, margin: '0 auto 14px' }}/>
        <div style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>Con chi dividi?</div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 3 }}>
          {item.name} · {item.unitPrice.toFixed(2)}€ — a testa {per.toFixed(2)}€
        </div>
        <div style={{ display: 'flex', gap: 9, marginTop: 16, flexWrap: 'wrap' }}>
          {people.map(pp => {
            const on = !!sel[pp.id];
            return (
              <button key={pp.id} onClick={() => setSel(x => ({ ...x, [pp.id]: !x[pp.id] }))} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 2,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, position: 'relative',
                  background: on ? WINE : '#d9d9d9', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 800,
                  transform: on ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform .25s cubic-bezier(.2,1.6,.4,1), background .2s',
                  boxShadow: on ? '0 8px 18px -8px rgba(139,26,58,.7)' : 'none',
                }}>
                  {pp.initials || pp.name[0]}
                  {on && <span style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18,
                    borderRadius: 999, background: '#7fb800', border: '2px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>}
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: on ? TEXT : MUTED }}>{pp.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
        <button disabled={n === 0} onClick={() => onConfirm(Object.keys(sel).filter(k => sel[k]))} style={{
          width: '100%', height: 48, borderRadius: 999, border: 'none', marginTop: 18,
          background: n === 0 ? '#d8c0c8' : WINE, color: '#fff',
          fontSize: 14.5, fontWeight: 800, fontFamily: 'inherit',
          cursor: n === 0 ? 'not-allowed' : 'pointer',
        }}>{n === 0 ? 'Scegli con chi dividere' : `Dividi in ${n + 1} · ${per.toFixed(2)}€ a testa`}</button>
      </div>
    </div>
  );
}

function OrderSheet({ state, setState, cartCount, cartTotal, mode, setMode, dishes, setQty, clearCart, onSubmit, goTo, onPickSplit, takeaway = false }) {
  // applica la divisione a tutte le porzioni della riga
  // Lo swipe muove UNA unità per volta: due Carbonare sono due pezzi, e
  // mandarne una al tavolo non deve trascinarsi dietro l'altra.
  const spostaUno = (g, sp) => {
    const k = g.indici[0];
    setState(st => {
      const splits = { ...(st.splits || {}) };
      if (sp) splits[`${g.lineId}-${k}`] = sp; else delete splits[`${g.lineId}-${k}`];
      return { ...st, splits };
    });
    // Seam backend (oggi mock): la divisione è real-time anche da webapp,
    // col backend reale il broadcast di sessione aggiorna gli altri.
    window.ByupAPI && window.ByupAPI.updateSplit({
      sessionId: state.activeOrder && state.activeOrder.id,
      lineId: `${g.lineId}-${k}`,
      split: sp || { kind: 'me', people: [] },
    });
  };
  // La × sulla pillola invece riguarda tutta la riga: è l'etichetta di quel
  // gruppo, e toglierla vuol dire "questi non sono più al tavolo".
  const azzeraGruppo = (g) => {
    setState(st => {
      const splits = { ...(st.splits || {}) };
      g.indici.forEach(k => { delete splits[`${g.lineId}-${k}`]; });
      return { ...st, splits };
    });
    g.indici.forEach(k => {
      window.ByupAPI && window.ByupAPI.updateSplit({
        sessionId: state.activeOrder && state.activeOrder.id,
        lineId: `${g.lineId}-${k}`,
        split: { kind: 'me', people: [] },
      });
    });
  };
  // Righe del carrello raggruppate per destinazione. Ogni unità ha la sua
  // (`splits['lineId-2']`), ma tenere una riga per pezzo riempirebbe il
  // carrello di ripetizioni: quelle che vanno nello stesso posto restano
  // insieme, e la riga si sdoppia solo quando le destinazioni divergono.
  const gruppiRiga = (voci, splits) => voci.flatMap(it => {
    const perDestinazione = new Map();
    for (let k = 0; k < it.qty; k++) {
      const sp = (splits || {})[`${it.lineId}-${k}`] || null;
      const chiave = !sp || sp.kind === 'me' ? 'me'
        : sp.kind === 'tavolo' ? 'tavolo'
        : 'con:' + (sp.people || []).slice().sort().join(',');
      if (!perDestinazione.has(chiave)) perDestinazione.set(chiave, { split: sp, indici: [] });
      perDestinazione.get(chiave).indici.push(k);
    }
    const gruppi = Array.from(perDestinazione.values());
    return gruppi.map(g => ({
      ...it, qty: g.indici.length, indici: g.indici, split: g.split,
      // Con la riga spezzata il +/- non ha un bersaglio univoco: toglieresti
      // un pezzo "al tavolo" o uno "per te"? Meglio mostrare solo il conteggio
      // e lasciare che si annulli prima la divisione.
      frazionata: gruppi.length > 1,
    }));
  });
  const expanded = mode === 'expanded';
  const trascina = useTrascinaFoglio(mode, setMode);
  const allDishes = Object.values(dishes).flat();
  const cartItems = state.cart.map(li => {
    const d = allDishes.find(x => x.id === li.dishId);
    if (!d) return null;
    const extTotal = Object.entries(li.extras || {}).reduce((s, [eid, eq]) => {
      const ex = d.extras?.find(e => e.id === eid);
      return s + (ex ? ex.price * eq : 0);
    }, 0);
    const summary = [
      ...Object.entries(li.variants || {}).map(([, v]) => v),
      ...Object.entries(li.extras || {}).filter(([, q]) => q > 0).map(([eid, q]) => {
        const ex = d.extras?.find(e => e.id === eid);
        return ex ? `+${ex.name}${q > 1 ? ' x' + q : ''}` : null;
      }).filter(Boolean),
      ...Object.keys(li.removed || {}).map(ing => `-${ing}`),
    ].join(', ');
    return { ...d, lineId: li.lineId, qty: li.qty, unitPrice: d.price + extTotal, summary };
  }).filter(Boolean);

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30,
      background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
      boxShadow: '0 -6px 24px rgba(0,0,0,0.1)',
      maxHeight: expanded ? '78%' : 'auto',
      transition: 'max-height 0.3s ease',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* drag handle */}
      <div {...trascina.presa} onClick={trascina.tocca} style={{
        cursor: 'grab', padding: '10px 0 6px', display: 'flex', justifyContent: 'center',
        touchAction: 'none',
      }}>
        <div style={{ width: 50, height: 5, background: WINE, borderRadius: 999, opacity: 0.7 }}/>
      </div>

      {!expanded ? (
        // Si trascina TUTTA la fascia, non solo la lineetta: 50×5px sono un
        // bersaglio da mouse, non da pollice, e il dito si appoggia dove legge
        // il contatore. `touchAction: none` serve o il browser interpreta il
        // gesto verticale come uno scroll e se lo prende lui.
        <div {...trascina.presa} style={{ padding: '4px 22px 22px', cursor: 'grab', touchAction: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>
              {cartCount === 0 ? 'Nessun piatto selezionato' : `${cartCount} ${cartCount === 1 ? 'piatto selezionato' : 'piatti selezionati'}`}
            </div>
            {cartCount > 0 && (
              <button onClick={clearCart} style={{
                width: 36, height: 36, borderRadius: 10, background: BG_GRAY,
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}><I.Trash size={18} color={TEXT}/></button>
            )}
          </div>
          <button onClick={onSubmit} disabled={cartCount === 0} style={{
            width: '100%', height: 50, borderRadius: 999, border: 'none',
            background: cartCount === 0 ? '#d8c0c8' : WINE, color: '#fff',
            fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
            cursor: cartCount === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <span>{takeaway ? 'Ordina d\'asporto' : 'Invio ordine'}</span>
            {cartTotal > 0 && <span style={{ opacity: 0.85 }}>· {cartTotal}€</span>}
          </button>
        </div>
      ) : (
        <>
          {/* Header: contatore + totale + cestino.
              Si trascina anche da qui, non solo dalla lineetta: da aperto è
              la fascia che resta ferma sopra la lista, e tirarla giù è il
              gesto naturale per richiudere. La lista sotto NON lo prende,
              o scorrerla chiuderebbe il carrello. */}
          <div {...trascina.presa} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 14px', cursor: 'grab', touchAction: 'none' }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>
                {cartCount === 1 ? '1 piatto' : `${cartCount} piatti`}
              </span>
              <span style={{ fontSize: 13, color: MUTED, marginLeft: 6 }}>nel carrello</span>
            </div>
            {cartCount > 0 && (
              <button onClick={clearCart} style={{
                width: 30, height: 30, borderRadius: 999, background: BG_GRAY,
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}><I.Trash size={14} color={MUTED}/></button>
            )}
          </div>

          {/* Lista piatti */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 16px' }}>
            {cartItems.length === 0 ? (
              <EmptyHint text="Aggiungi piatti dalla lista per vederli qui"/>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {gruppiRiga(cartItems, state.splits).map(g => (
                  <SwipeDishRow key={`${g.lineId}:${g.indici[0]}`} it={g}
                    split={g.split}
                    onTable={takeaway ? undefined : () => spostaUno(g, { kind: 'tavolo', people: [] })}
                    onPick={takeaway ? undefined : () => onPickSplit && onPickSplit(g)}
                    onUndoUno={() => spostaUno(g, null)}
                    onReset={() => azzeraGruppo(g)}
                    onOpenDish={() => goTo('dish', { dishId: g.id, lineId: g.lineId })}
                    setQty={setQty}/>
                ))}
              </div>
            )}
            {cartItems.length > 0 && !takeaway && (
              <div style={{ marginTop: 12, fontSize: 11.5, color: MUTED, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center' }}>
                <span style={{ fontSize: 13 }}>⇄</span>
                trascina un piatto: → tutto il tavolo · ← dividi con qualcuno
              </div>
            )}
          </div>

          <div style={{ padding: '0 22px 20px' }}>
            {/* P-103: la voce di coperto o servizio si vede PRIMA della conferma,
                non come sorpresa in fondo al conto. All'asporto non c'è. */}
            {!takeaway && cartCount > 0 && (() => {
              const r = byupCopertoRiga(cartTotal, 1);
              return r.attiva ? (
                <div data-coperto style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                  padding: '8px 2px 12px', fontSize: 13, color: MUTED }}>
                  <span>{r.etichetta}</span>
                  <span style={{ fontWeight: 700, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{r.forma === 'fissa' ? `${r.importo.toFixed(2)}€ a persona` : `${r.aliquota}%`}</span>
                </div>
              ) : null;
            })()}
            <button onClick={onSubmit} disabled={cartCount === 0} style={{
              width: '100%', height: 50, borderRadius: 999, border: 'none',
              background: cartCount === 0 ? '#d8c0c8' : WINE, color: '#fff',
              fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              cursor: cartCount === 0 ? 'not-allowed' : 'pointer',
            }}>{takeaway ? 'Ordina d\'asporto' : 'Ordina ora'} · {cartTotal.toFixed(2)}€</button>
          </div>
        </>
      )}
    </div>
  );
}

const qtyBtn = {
  width: 28, height: 28, borderRadius: 999, border: 'none', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
};

function EmptyHint({ text }) {
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center', color: MUTED,
      fontSize: 13.5,
    }}>{text}</div>
  );
}

// Genera un ID ordine leggibile (5 char, niente caratteri ambigui 0/O/1/I).
function genOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// Banner promozionale sotto il riepilogo ordine: invita a scaricare l'app
// per pagare la propria parte e saltare la fila. "Scarica l'app" porta agli store.
// big=true (card ordine compressa) → riempie lo spazio con SVG/testo/CTA più grandi.
function DownloadAppPromo({ big, onRecover }) {
  const svg = big ? 132 : 96;
  return (
    <div style={{
      marginTop: 14, padding: big ? '28px 20px' : '20px 18px',
      flex: big ? 1 : '0 0 auto',
      borderRadius: 22, textAlign: 'center',
      background: 'linear-gradient(160deg, #FFF3F7 0%, #FCE9EE 100%)',
      border: `1px solid ${PINK}22`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* SVG divertente: telefono che "salta la fila" con scia e scintille */}
      <svg width={svg} height={svg * 84 / 96} viewBox="0 0 96 84" fill="none" style={{ display: 'block', marginBottom: big ? 20 : 12 }}>
        {/* fila di puntini superata */}
        <circle cx="14" cy="62" r="6" fill="#F4C6D4"/>
        <circle cx="30" cy="62" r="6" fill="#F4C6D4"/>
        <circle cx="46" cy="62" r="6" fill="#EFB1C4"/>
        {/* scia di movimento */}
        <path d="M40 40 H58" stroke={PINK} strokeWidth="3" strokeLinecap="round" opacity="0.35"/>
        <path d="M44 30 H60" stroke={PINK} strokeWidth="3" strokeLinecap="round" opacity="0.25"/>
        {/* telefono che schizza avanti */}
        <g transform="rotate(12 74 38)">
          <rect x="60" y="14" width="34" height="56" rx="9" fill="#fff" stroke={PINK_DARK} strokeWidth="3"/>
          <rect x="66" y="22" width="22" height="30" rx="4" fill={PINK} opacity="0.15"/>
          {/* fulmine = velocità */}
          <path d="M79 24 L70 40 H77 L74 52 L86 34 H78 Z" fill={PINK}/>
          <circle cx="77" cy="62" r="3" fill={PINK_DARK}/>
        </g>
        {/* scintille */}
        <path d="M58 10 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#F5B400"/>
        <circle cx="50" cy="20" r="2.5" fill="#F5B400"/>
        <circle cx="90" cy="8" r="2" fill={PINK}/>
      </svg>

      <div style={{ fontSize: big ? 24 : 16.5, fontWeight: 800, color: TEXT, letterSpacing: -0.4, lineHeight: 1.25, marginBottom: big ? 22 : 14 }}>
        Paga solo la tua parte<br/>e salta la fila!
      </div>

      <button onClick={onRecover} style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: big ? 10 : 8,
        height: big ? 58 : 48, padding: big ? '0 34px' : '0 26px', borderRadius: 999, border: 'none',
        background: WINE, color: '#fff', cursor: 'pointer',
        fontSize: big ? 17.5 : 15, fontWeight: 700, fontFamily: 'inherit',
        boxShadow: `0 4px 14px ${WINE}40`,
      }}>
        <svg width={big ? 20 : 17} height={big ? 20 : 17} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>
        </svg>
        Scarica l'app
      </button>
    </div>
  );
}

// ─── Recupero ordine webapp → app (codice + store) ──────────────────
// Spec: byup-spec-tecnica-recupero-ordine.md. La webapp non incassa: per pagare
// dall'app si recupera l'ordine anonimo. Schermata DIFFERENZIATA per piattaforma:
//  • Android → Install Referrer: scarichi e l'ordine si aggancia da solo. Il codice
//    resta come fallback in secondo piano (Play Store assente, app già installata…).
//  • iOS → niente referrer: il CODICE è protagonista, lo inserisci a mano nell'app.
//  • Altro/sconosciuto → comportamento iOS (codice protagonista) come default sicuro.
function detectPlatform() {
  try {
    const forced = new URLSearchParams(window.location.search).get('os'); // override DEV: ?os=ios|android
    if (forced === 'ios' || forced === 'android') return forced;
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
  } catch {}
  return 'other';
}
function genRecoveryCode() { return String(Math.floor(100000 + Math.random() * 900000)); } // 6 cifre
function fmtCode(c) { return (c || '').replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3'); }

function OrderRecoverySheet({ order, onClose }) {
  const platform = detectPlatform();
  const android = platform === 'android';
  const raw = order?.code || '';
  const [copied, setCopied] = useState(false);
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(raw); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  const storeUrl = android
    ? `https://play.google.com/store/apps/details?id=app.byup&referrer=byup_order_id%3D${raw}`
    : platform === 'ios' ? 'https://apps.apple.com/app/byup' : DOWNLOAD_URL;
  const storeLabel = android ? 'Scarica su Google Play' : platform === 'ios' ? 'Scarica su App Store' : "Scarica l'app";
  const platLabel = android ? '🤖 Android' : platform === 'ios' ? '🍏 iOS' : '🌐 Web';

  const CodeBox = ({ big }) => (
    <button onClick={copyCode} style={{
      width: '100%', marginTop: 4,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: big ? '16px 18px' : '11px 14px', borderRadius: 14,
      border: `1.5px dashed ${WINE}66`, background: '#fbf4f7',
      cursor: 'pointer', fontFamily: 'inherit',
    }}>
      <span style={{ fontSize: big ? 30 : 19, fontWeight: 800, letterSpacing: big ? 5 : 2, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>
        {fmtCode(raw)}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: copied ? '#1a7a3c' : WINE }}>
        {copied ? (
          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7a3c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copiato</>
        ) : (
          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={WINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copia</>
        )}
      </span>
    </button>
  );

  const storeBtn = (
    <a href={storeUrl} target="_blank" rel="noopener noreferrer" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      width: '100%', height: 52, borderRadius: 999, marginTop: 16,
      background: WINE, color: '#fff', textDecoration: 'none',
      fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit', boxShadow: `0 4px 14px ${WINE}40`,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>
      </svg>
      {storeLabel}
    </a>
  );

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60,
      display: 'flex', alignItems: 'flex-end', animation: 'fade 0.2s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '10px 22px 26px', animation: 'slideUp 0.32s cubic-bezier(.2,.9,.3,1.05)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.14)', maxHeight: '88%', overflowY: 'auto',
      }}>
        <div style={{ width: 38, height: 4, background: '#e0d8db', borderRadius: 999, margin: '4px auto 16px' }}/>

        {/* etichetta piattaforma rilevata (utile in demo / chiarezza) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, background: BG_PAGE, padding: '4px 10px', borderRadius: 999, letterSpacing: 0.3 }}>{platLabel}</span>
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: -0.3, textAlign: 'center', marginBottom: 6 }}>
          Paga dall'app byup
        </div>

        {android ? (
          <>
            <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, textAlign: 'center', marginBottom: 4 }}>
              Scaricala dal Play Store: il tuo ordine <b style={{ color: TEXT }}>ti aspetterà già dentro</b>, senza inserire codici.
            </div>
            {storeBtn}
            {/* Fallback: codice in secondo piano (Play Store assente, app già installata, install non da Play) */}
            <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 12.5, color: MUTED, fontWeight: 600, marginBottom: 8 }}>
                Problemi a ritrovare l'ordine? Ecco il tuo codice:
              </div>
              <CodeBox big={false}/>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, textAlign: 'center', marginBottom: 16 }}>
              Scarica l'app e inserisci questo codice per ritrovare il tuo ordine e pagarlo.
            </div>
            <CodeBox big={true}/>
            <div style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              1. Scarica l'app · 2. Aprila e inserisci il codice
            </div>
            {storeBtn}
          </>
        )}

        <button onClick={onClose} style={{
          width: '100%', padding: '14px', marginTop: 10, background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, color: MUTED, fontWeight: 600,
        }}>Lo farò più tardi</button>
      </div>
    </div>
  );
}

// ─── HOME asporto: riepilogo, codice di ritiro, bivio (P-01 · P-02) ───────
// Il bivio è la sostanza di P-02: le due strade di saldo hanno pari evidenza,
// stessa cella di griglia, stessa altezza, stesso bordo, stessa taglia di
// titolo e testo, stessa icona, nessun «consigliato». Nascondere o sminuire
// la cassa sarebbe un deceptive design pattern (EDPB 03/2022): la via
// dell'app comporta un account, cioè un trattamento in più, e lo si dice.
// Niente DownloadAppPromo qui: romperebbe la parità. I codici sono due con
// ruoli distinti: il codice di ritiro, grande, è l'identità dell'ordine al
// banco (la catena di svNomeConto nel gestionale ripiega su di esso); il
// codice ordine a sei cifre sta nella tessera dell'app per il recupero (P-55).
function TakeawayHome({ order, goTo, onRecover }) {
  const [cassaOpen, setCassaOpen] = useState(false);
  const totale = (order.items || []).reduce((s, i) => s + i.price * i.qty, 0);
  const tessera = {
    display: 'flex', flexDirection: 'column', gap: 8, minHeight: 172,
    padding: '16px 14px', borderRadius: 18, border: `1.5px solid ${WINE}55`, background: '#fff',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  };
  const icona = { width: 34, height: 34, borderRadius: 10, background: '#fbf4f7', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const titolo = { fontSize: 15.5, fontWeight: 800, color: TEXT, letterSpacing: -0.2, lineHeight: 1.2 };
  const testo = { fontSize: 12.5, color: MUTED, lineHeight: 1.45, flex: 1 };
  const azione = { fontSize: 12.5, fontWeight: 700, color: WINE };
  return (
    <div style={{ padding: '60px 16px 40px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>Asporto · {order.venue}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.3, marginTop: 4 }}>Il tuo ordine è composto</div>

      {/* Il codice di ritiro: l'identità dell'ordine, l'unica che serve. */}
      <div data-ritiro style={{ marginTop: 16, padding: '18px 16px', borderRadius: 18, background: '#fbf4f7', border: `1.5px dashed ${WINE}66`, textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>Codice di ritiro</div>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 8, color: TEXT, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{order.codiceRitiro}</div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>Non serve un nome né un telefono: il codice basta.</div>
      </div>

      {/* Riepilogo */}
      <div style={{ marginTop: 14, background: '#fff', borderRadius: 18, border: '1px solid #ece6e3', padding: '12px 14px' }}>
        {(order.items || []).map(i => (
          <div key={i.lineId} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', fontSize: 14, color: TEXT }}>
            <span><b>{i.qty}×</b> {i.name}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{(i.price * i.qty).toFixed(2)}€</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTop: '1px solid #ece6e3', fontSize: 15.5, fontWeight: 800, color: TEXT }}>
          <span>Totale da saldare</span><span>{totale.toFixed(2)}€</span>
        </div>
      </div>

      {/* Il bivio: due tessere di pari peso. */}
      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginTop: 20, marginBottom: 10 }}>Come vuoi saldare?</div>
      <div data-bivio style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'stretch' }}>
        <button data-strada="app" onClick={onRecover} style={tessera}>
          <div style={icona}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          </div>
          <div style={titolo}>Paga dall'app</div>
          <div style={testo}>Serve un account Byup. Scarica l'app e recupera l'ordine col codice {fmtCode(order.code)}: paghi lì e l'ordine parte.</div>
          <div style={azione}>Continua →</div>
        </button>
        <button data-strada="cassa" onClick={() => setCassaOpen(true)} style={tessera}>
          <div style={icona}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 11h18"/><path d="M8 15h3"/></svg>
          </div>
          <div style={titolo}>Paga al ritiro, in cassa</div>
          <div style={testo}>Nessun account. Al banco di' il codice {order.codiceRitiro}: l'ordine parte quando paghi.</div>
          <div style={azione}>Continua →</div>
        </button>
      </div>

      <button onClick={() => goTo('menu')} style={{
        width: '100%', padding: '14px', marginTop: 14, background: 'none', border: 'none',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, color: MUTED, fontWeight: 600,
      }}>Aggiungi altro al menù</button>

      {cassaOpen && (
        <div onClick={() => setCassaOpen(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60,
          display: 'flex', alignItems: 'flex-end', animation: 'fade 0.2s ease',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '10px 22px 26px', animation: 'slideUp 0.32s cubic-bezier(.2,.9,.3,1.05)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.14)', textAlign: 'center',
          }}>
            <div style={{ width: 38, height: 4, background: '#e0d8db', borderRadius: 999, margin: '4px auto 16px' }}/>
            <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>Paga al ritiro, in cassa</div>
            <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, marginTop: 6 }}>Al banco di' questo codice. Salderai lì, e l'ordine parte in cucina quando paghi.</div>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: 10, color: TEXT, margin: '18px 0 6px', fontVariantNumeric: 'tabular-nums' }}>{order.codiceRitiro}</div>
            <div style={{ fontSize: 12.5, color: MUTED }}>Totale da saldare {totale.toFixed(2)}€ · nessun account, nessun dato personale</div>
            <button onClick={() => setCassaOpen(false)} style={{
              width: '100%', padding: '14px', marginTop: 16, background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, color: MUTED, fontWeight: 600,
            }}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HOME with active order card ───────────────────────────
function HomeScreen({ state, setState, goTo }) {
  const order = state.activeOrder;
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [recoverOpen, setRecoverOpen] = useState(false); // sheet recupero ordine (codice + store)
  const covers = order?.covers || (order?.guests?.length || 1);
  const loggedIn = (order?.guests || []).filter(g => g.isApp || g.isWebApp).length;

  return (
    <div data-screen-label="Ordine inviato" style={{
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 60, paddingBottom: 110 }}>
        {/* Web app: solo l'ordine al tavolo (inviato in cucina). Colonna a tutta
            altezza così la promo cresce e riempie lo spazio quando la card è compressa. */}
        <div style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          {order && order.type === 'takeaway' ? (
            <TakeawayHome order={order} goTo={goTo} onRecover={() => setRecoverOpen(true)}/>
          ) : order ? (
            <ActiveOrderCard order={order} expanded={orderExpanded} setExpanded={setOrderExpanded}
              goTo={goTo} setState={setState} onOpenGuests={() => setGuestsOpen(true)}
              onRecover={() => setRecoverOpen(true)}/>
          ) : (
            <div style={{ padding: '40px 22px', textAlign: 'center', color: MUTED }}>
              Nessun ordine attivo.
            </div>
          )}
          {order && order.type !== 'takeaway' && <DownloadAppPromo big={!orderExpanded} onRecover={() => setRecoverOpen(true)}/>}
        </div>
      </div>

      {guestsOpen && order && (
        <GuestsSheet
          order={order}
          loggedIn={loggedIn}
          covers={covers}
          onClose={() => setGuestsOpen(false)}
          onAddGuest={() => addGuestToOrder(setState)}
          onRemoveGuest={(id) => removeGuestFromOrder(setState, id)}/>
      )}

      {recoverOpen && order && (
        <OrderRecoverySheet order={order} onClose={() => setRecoverOpen(false)}/>
      )}
    </div>
  );
}

function ActiveOrderCard({ order, expanded, setExpanded, goTo, setState, onOpenGuests, onRecover }) {
  // Totale calcolato dalle righe, come nell'app: `order.total` è un numero
  // cablato nella demo e non segue i piatti che ci sono davvero. Qui non c'è
  // nessun residuo da scontare — la webapp non incassa, quindi non esistono
  // quote saldate: il totale è tutto da pagare, in cassa o dall'app.
  const totalePiatti = (order.items || []).reduce((s, i) => s + i.price * i.qty, 0);
  // P-103: la voce di coperto o servizio col nome della sede, sui coperti del
  // tavolo — lo stesso totale che vedono l'app e la cassa.
  const copertoRiga = byupCopertoRiga(totalePiatti, order.covers || (order.guests?.length || 1));
  const totaleOrdine = totalePiatti + (copertoRiga.attiva ? copertoRiga.valore : 0);
  const fmtTime = (d) => {
    if (!d) return '';
    const dd = new Date(d);
    const hh = String(dd.getHours()).padStart(2, '0');
    const mm = String(dd.getMinutes()).padStart(2, '0');
    const day = dd.getDate();
    const months = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
    return `${day} ${months[dd.getMonth()]} · ${hh}:${mm}`;
  };
  const covers = order.covers || (order.guests?.length || 1);
  const loggedIn = (order.guests || []).filter(g => g.isApp || g.isWebApp).length;

  // Il pagamento non avviene sul web (solo in cassa o dall'app): la card
  // mostra il riepilogo completo e "Paga ora" apre il popup app-only.
  const title = 'Il tuo ordine';
  // Ordine al tavolo, inviato in cucina.
  const grad = `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 80%)`;
  const shadowCol = 'rgba(194,24,91,0.35)';
  const accentDark = PINK_DARK;

  return (
    <div style={{
      borderRadius: 22, overflow: 'hidden',
      background: grad,
      color: '#fff', position: 'relative',
      boxShadow: `0 8px 24px ${shadowCol}`,
      transition: 'all 0.3s',
    }}>
      {/* sheen */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 220, height: 220,
        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 60%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ padding: '14px 16px 14px', position: 'relative' }}>
        {/* Top row: order id + date/time on left, covers + chevron on right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {order.id && (
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5 }}>
                Ordine #{order.id}
              </div>
            )}
            <div style={{ fontSize: 11.5, opacity: 0.9, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', marginTop: order.id ? 2 : 0 }}>
              {fmtTime(order.startedAt)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={(e) => { e.stopPropagation(); onOpenGuests && onOpenGuests(); }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
              border: 'none', color: '#fff', fontFamily: 'inherit',
              padding: '5px 10px 5px 7px', borderRadius: 999, cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {covers} partecipanti
            </button>
            <button onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
              aria-label={expanded ? 'Comprimi riepilogo' : 'Espandi riepilogo'} style={{
              width: 30, height: 30, borderRadius: 999,
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ display: 'inline-flex', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <I.ChevDown size={16} color="#fff"/>
              </span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14.5, opacity: 0.9, fontWeight: 500 }}>
            <I.Pin size={15} color="#fff"/> {order.table}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 3, letterSpacing: -0.3 }}>{order.venue}</div>
        </div>

        {/* Stato ordine: inviato in cucina */}
        <div style={{
          marginTop: 10, padding: '8px 12px', borderRadius: 12,
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12.5, fontWeight: 700, letterSpacing: 0.2,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Inviato in cucina
        </div>

        {expanded ? (
          <>
            <div style={{
              fontSize: 15, opacity: 0.95, marginTop: 12, lineHeight: 1.45,
            }}>
              Salda il conto in cassa o dall'app byup.
            </div>

            <div style={{
              marginTop: 12, padding: '12px 14px', borderRadius: 14,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', opacity: 0.85, marginBottom: 10 }}>
                {title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {order.items.map((i, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, fontSize: 15.5 }}>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ opacity: 0.75, fontWeight: 600 }}>{i.qty}×</span> {i.name}
                    </span>
                    <span style={{ fontWeight: 600, opacity: 0.95, flexShrink: 0 }}>{(i.price * i.qty).toFixed(2)}€</span>
                  </div>
                ))}
              </div>
              {copertoRiga.attiva && (
                <div data-coperto-conto style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, marginTop: 8, opacity: 0.92 }}>
                  <span>{copertoRiga.dettaglio}</span>
                  <span style={{ fontWeight: 600, flexShrink: 0 }}>{copertoRiga.valore.toFixed(2)}€</span>
                </div>
              )}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', margin: '12px 0' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 16 }}>
                <span style={{ fontWeight: 700 }}>Totale</span>
                <span style={{ fontWeight: 800, fontSize: 19 }}>{totaleOrdine.toFixed(2)}€</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => goTo('menu')} style={{
                flex: 1, height: 42, borderRadius: 999,
                border: '1.5px solid rgba(255,255,255,0.55)',
                background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
              }}>Ordina ancora</button>
              <button onClick={onRecover} style={{
                flex: 1.2, height: 42, borderRadius: 999, border: 'none',
                background: '#fff', color: accentDark,
                fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer',
              }}>Paga ora</button>
            </div>
          </>
        ) : (
          <>
            <div onClick={() => setExpanded(true)} style={{
              marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 13.5, opacity: 0.9, fontWeight: 600 }}>
                {order.items.reduce((s, i) => s + i.qty, 0)} piatti · tocca per i dettagli
              </span>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{totaleOrdine.toFixed(2)}€</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => goTo('menu')} style={{
                flex: 1, height: 38, borderRadius: 999,
                border: '1.5px solid rgba(255,255,255,0.55)',
                background: 'transparent', color: '#fff', fontSize: 13.5, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
              }}>Ordina ancora</button>
              <button onClick={onRecover} style={{
                flex: 1, height: 38, borderRadius: 999, border: 'none',
                background: '#fff', color: accentDark,
                fontSize: 13.5, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer',
              }}>Paga ora</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper riusabili per i tre consumer del GuestsSheet (Payment / Menu / Home)
const addGuestToOrder = (setState) => setState(s => {
  const ao = s.activeOrder;
  if (!ao) return s;
  const guests = ao.guests || [];
  const nextN = guests.filter(g => g.isGuest).length + 1;
  const newGuest = {
    id: `og-${Date.now()}`,
    name: `Ospite ${nextN}`,
    initial: '?',
    isGuest: true,
  };
  return {
    ...s,
    activeOrder: {
      ...ao,
      guests: [...guests, newGuest],
      covers: (ao.covers || guests.length) + 1,
    },
  };
});

const removeGuestFromOrder = (setState, id) => setState(s => {
  const ao = s.activeOrder;
  if (!ao) return s;
  const guests = ao.guests || [];
  const newGuests = guests.filter(g => g.id !== id);
  return {
    ...s,
    activeOrder: {
      ...ao,
      guests: newGuests,
      covers: Math.max(1, (ao.covers || guests.length) - 1),
    },
  };
});

function GuestsSheet({ order, loggedIn, covers, onClose, onAddGuest, onRemoveGuest }) {
  const inviteUrl = `byup.app/t/${(order?.table || 'tavolo').toLowerCase().replace(/\s+/g, '')}-x9k7`;
  const [shareState, setShareState] = useState('idle'); // 'idle' | 'copied'
  const guests = order?.guests || [];
  const appCount = guests.filter(g => g.isApp).length;
  const webappCount = guests.filter(g => g.isWebApp).length;
  const ospitiCount = guests.filter(g => g.isGuest).length;
  const totalCoperti = Math.max(covers || 0, guests.length, 1);
  const handleShare = async () => {
    const fullUrl = 'https://' + inviteUrl;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Unisciti al tavolo su byup', url: fullUrl });
        return;
      }
    } catch { /* utente ha annullato */ }
    try {
      await navigator.clipboard.writeText(fullUrl);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 1800);
    } catch { /* clipboard non disponibile in iframe */
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 1800);
    }
  };
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadeIn 0.2s',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: '#fff', color: TEXT,
        borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '14px 22px 28px',
        animation: 'slideUp 0.25s cubic-bezier(.2,.9,.3,1)',
        maxHeight: '85%', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: '#e5e0d8', borderRadius: 999, margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.3 }}>Al tavolo</div>
            <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span><span style={{ fontWeight: 800, color: TEXT }}>{totalCoperti}</span> {totalCoperti === 1 ? 'partecipante' : 'partecipanti'}</span>
              {appCount > 0 && (
                <>
                  <span style={{ color: '#cfc8b9' }}>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: '#1a7a3a' }}/>
                    <span><span style={{ fontWeight: 700, color: TEXT }}>{appCount}</span> con app</span>
                  </span>
                </>
              )}
              {webappCount > 0 && (
                <>
                  <span style={{ color: '#cfc8b9' }}>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: '#2563eb' }}/>
                    <span><span style={{ fontWeight: 700, color: TEXT }}>{webappCount}</span> da web</span>
                  </span>
                </>
              )}
              {ospitiCount > 0 && (
                <>
                  <span style={{ color: '#cfc8b9' }}>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: '#c4b89f' }}/>
                    <span><span style={{ fontWeight: 700, color: TEXT }}>{ospitiCount}</span> {ospitiCount === 1 ? 'ospite' : 'ospiti'}</span>
                  </span>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', fontSize: 22, color: MUTED,
            cursor: 'pointer', padding: 4,
          }}>×</button>
        </div>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(order.guests || []).map(g => (
            <div key={g.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 4px', borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 999,
                background: g.isGuest ? '#f0ede6' : (g.isMe ? PINK : '#1a1a1a'),
                color: g.isGuest ? MUTED : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
              }}>{g.initial}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>
                  {g.name}{g.isMe && <span style={{ fontSize: 11, color: PINK, marginLeft: 6, fontWeight: 600 }}>(tu)</span>}
                </div>
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>
                  {g.isApp ? "✓ ha l'app" : (g.isWebApp ? '✓ da webapp' : 'ospite · non loggato')}
                </div>
              </div>
              {g.isApp && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700, color: '#1a7a3a',
                  background: '#e8f5ec', padding: '4px 8px', borderRadius: 999,
                }}>APP</span>
              )}
              {g.isWebApp && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700, color: '#1d4ed8',
                  background: '#dbeafe', padding: '4px 8px', borderRadius: 999,
                }}>WEB</span>
              )}
              {g.isGuest && !g.isMe && onRemoveGuest && (
                <button onClick={() => onRemoveGuest(g.id)} title="Rimuovi ospite" style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: MUTED, fontSize: 16, lineHeight: 1, padding: 0,
                }}>×</button>
              )}
            </div>
          ))}
        </div>

        {/* Aggiungi ospite — solo se il consumer fornisce la callback */}
        {onAddGuest && (
          <button onClick={onAddGuest} style={{
            marginTop: 12, width: '100%', padding: '12px 14px',
            background: '#fff', border: `1.5px dashed ${BORDER}`,
            borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: TEXT, fontSize: 13.5, fontWeight: 700,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 999, background: '#f6f1ea',
              color: WINE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
            }}>+</span>
            Aggiungi ospite senza app
          </button>
        )}

        {/* Card invito — link al tavolo da condividere */}
        <div style={{
          marginTop: 14, padding: 14, background: '#faf6ee', borderRadius: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: TEXT, letterSpacing: -0.1 }}>Invita al tavolo</div>
          </div>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.45, marginBottom: 10 }}>
            Condividi questo link con chi non ha scansionato il QR. Si unisce al tavolo senza dover ordinare dal cameriere.
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', padding: '6px 6px 6px 12px', borderRadius: 999,
            border: `1px solid ${BORDER}`,
          }}>
            <span style={{
              flex: 1, fontSize: 12.5, color: TEXT,
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{inviteUrl}</span>
            <button onClick={handleShare} style={{
              background: shareState === 'copied' ? '#1c8c5b' : PINK, color: '#fff',
              border: 'none', padding: '7px 14px', borderRadius: 999,
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: shareState === 'copied' ? 'none' : `0 2px 6px ${PINK}40`,
              transition: 'background 0.2s',
            }}>
              {shareState === 'copied' ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copiato
                </>
              ) : 'Condividi'}
            </button>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: '100%', height: 48, borderRadius: 999, border: 'none',
          background: '#1a1a1a', color: '#fff', marginTop: 14,
          fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
        }}>Chiudi</button>
      </div>
    </div>
  );
}

// ─── ROOT (router) ─────────────────────────────────────────
function DishDetailScreen({ state, setState, ctx, goBack }) {
  const dish = findDish(ctx?.dishId);
  // Modalità modifica: aperti da una riga del carrello (ctx.lineId) → si edita
  // SOLO quella riga, pre-compilando le sue scelte. Il counter qty regola quante
  // unità di quella riga; confermando si aggiorna la riga, non se ne crea una nuova.
  const editing = ctx?.lineId ? state.cart.find(i => i.lineId === ctx.lineId) : null;
  // In modifica il counter NON cambia la quantità della riga: sceglie a quante
  // unità (1..maxApply) applicare la personalizzazione. maxApply = qty della riga.
  const maxApply = editing ? editing.qty : Infinity;
  const [expanded, setExpanded] = useState(false);
  const [extras, setExtras] = useState(() => ({ ...(editing?.extras || {}) }));
  const [removed, setRemoved] = useState(() => ({ ...(editing?.removed || {}) })); // ingredient -> true
  const [variants, setVariants] = useState(() => ({ ...(editing?.variants || {}) }));
  const [nutriOpen, setNutriOpen] = useState(true);
  const [qty, setQty] = useState(() => editing?.qty || 1);

  if (!dish) {
    return <div style={{ padding: 80, textAlign: 'center', color: MUTED }}>Piatto non trovato.</div>;
  }

  const setExtra = (id, q) => setExtras(e => {
    const n = { ...e };
    if (q <= 0) delete n[id]; else n[id] = q;
    return n;
  });
  const toggleRemove = (ing) => setRemoved(r => {
    const n = { ...r };
    if (n[ing]) delete n[ing]; else n[ing] = true;
    return n;
  });
  const extrasTotal = Object.entries(extras).reduce((s, [id, q]) => {
    const ex = dish.extras.find(x => x.id === id);
    return s + (ex ? ex.price * q : 0);
  }, 0);
  const total = dish.price + extrasTotal;
  // Varianti obbligatorie ancora da scegliere: bloccano l'aggiunta all'ordine.
  const missingRequired = (dish.variants || []).filter(v => v.required && !variants[v.id]);
  const canAdd = missingRequired.length === 0;
  const addToCart = () => {
    if (!canAdd) return;
    if (editing) {
      // applyN = a quante unità della riga applicare questa personalizzazione.
      const applyN = Math.min(Math.max(1, qty), editing.qty);
      if (applyN >= editing.qty) {
        // tutte le unità → aggiorno la riga in place (quantità invariata).
        setState(s => ({ ...s, cart: s.cart.map(i => i.lineId === editing.lineId ? { ...i, variants, extras, removed } : i) }));
      } else {
        // sottoinsieme → la riga si divide: le unità modificate diventano una
        // riga nuova, le restanti tengono la personalizzazione originale.
        const newLineId = dish.id + '-' + Date.now();
        setState(s => ({ ...s, cart: s.cart.flatMap(i =>
          i.lineId !== editing.lineId ? [i] : [
            { ...i, qty: i.qty - applyN },
            { lineId: newLineId, dishId: dish.id, qty: applyN, variants, extras, removed },
          ]
        ) }));
      }
    } else {
      const lineId = dish.id + '-' + Date.now();
      setState(s => ({ ...s, cart: [...s.cart, { lineId, dishId: dish.id, qty, variants, extras, removed }] }));
    }
    goBack();
  };

  const macroBars = [
    { label: 'Carboidrati', val: dish.macros.carbo, max: 100, color: '#5cc16e' },
    { label: 'Grassi',      val: dish.macros.grassi, max: 60, color: '#f0a050' },
    { label: 'Proteine',    val: dish.macros.prot,   max: 60, color: '#9968c4' },
    { label: 'Fibre',       val: dish.macros.fibre,  max: 25, color: '#e64984' },
  ];

  return (
    <div data-screen-label="Dettaglio piatto" style={{
      width: '100%', height: '100%', background: '#fafaf7', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Back button — fisso sopra tutto */}
      <div style={{ position: 'absolute', top: 56, left: 16, zIndex: 50 }}>
        <button onClick={goBack} style={{
          width: 42, height: 42, borderRadius: 999, background: '#fff',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}><I.Back size={20}/></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
        {/* Hero photo */}
        <div style={{ width: '100%', height: 320, position: 'relative', overflow: 'hidden', background: '#eee' }}>
          {dish.photo ? (
            <img src={dish.photo} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          ) : (
            <DishPhoto kind={dish.kind}/>
          )}
          {/* gradient bottom for legibility */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 80,
            background: 'linear-gradient(180deg, transparent, rgba(250,250,247,0.95))',
          }}/>
        </div>

        {/* Title + price */}
        <div style={{ padding: '4px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: -0.5 }}>{dish.name}</div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: '#fff',
              background: WINE, padding: '6px 12px', borderRadius: 999,
              flexShrink: 0,
            }}>{dish.price}€</div>
          </div>
          <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, marginTop: 10 }}>
            {expanded ? dish.longDesc : (
              <>
                {dish.desc.slice(0, 75)}{dish.desc.length > 75 ? '...' : ''}{' '}
                <span onClick={() => setExpanded(true)} style={{ color: PINK, fontWeight: 600, cursor: 'pointer' }}>altro</span>
              </>
            )}
            {expanded && (
              <span onClick={() => setExpanded(false)} style={{ color: PINK, fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}> meno</span>
            )}
          </div>
          {dish.allergens.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <span style={{ fontSize: 11.5, color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Allergeni</span>
              <AllergenDots ids={dish.allergens}/>
            </div>
          )}
        </div>

        {/* Remove ingredients */}
        {dish.ingredients.length > 0 && (
          <div style={{ padding: '24px 22px 0' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, marginBottom: 4, letterSpacing: -0.2 }}>Personalizza</div>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 14 }}>Tocca un ingrediente per toglierlo</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {dish.ingredients.map(ing => {
                const out = !!removed[ing];
                return (
                  <button key={ing} onClick={() => toggleRemove(ing)} style={{
                    padding: '8px 14px', borderRadius: 999,
                    border: out ? `1.5px solid #d0d0d0` : `1.5px solid ${WINE}`,
                    background: out ? '#f5f5f5' : '#fff',
                    color: out ? '#999' : TEXT,
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    textDecoration: out ? 'line-through' : 'none',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {!out && <span style={{ color: WINE, fontSize: 14, fontWeight: 700 }}>✓</span>}
                    {out && <span style={{ color: '#999', fontSize: 14, fontWeight: 700 }}>×</span>}
                    {ing}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Extras */}
        {dish.extras.length > 0 && (
          <div style={{ padding: '28px 22px 0' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, marginBottom: 14, letterSpacing: -0.2 }}>Aggiungi</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {dish.extras.map(ex => {
                const q = extras[ex.id] || 0;
                return (
                  <div key={ex.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                    padding: '12px 0', borderBottom: `1px solid ${BORDER}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: TEXT }}>{ex.name}</div>
                      <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{ex.price === 0 ? 'gratis' : `+${ex.price}€`}</div>
                    </div>
                    {q === 0 ? (
                      <button onClick={() => setExtra(ex.id, 1)} style={{
                        width: 32, height: 32, borderRadius: 999, border: `1.5px solid ${BORDER}`,
                        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}><I.Plus size={14} color={TEXT}/></button>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: WINE, borderRadius: 999, padding: '4px 6px',
                      }}>
                        <button onClick={() => setExtra(ex.id, q - 1)} style={{
                          width: 26, height: 26, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}><I.Minus size={14} color="#fff"/></button>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', minWidth: 14, textAlign: 'center' }}>{q}</span>
                        <button onClick={() => setExtra(ex.id, q + 1)} style={{
                          width: 26, height: 26, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}><I.Plus size={14} color="#fff"/></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Variants */}
        {dish.variants.length > 0 && dish.variants.map(v => (
          <div key={v.id} style={{ padding: '28px 22px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: -0.2 }}>{v.label}</span>
              {v.required && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                  color: variants[v.id] ? '#1a7a3c' : WINE,
                  background: variants[v.id] ? '#e8f5ec' : '#fbeef1',
                  padding: '3px 8px', borderRadius: 999,
                }}>{variants[v.id] ? 'Scelto ✓' : 'Obbligatorio'}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {v.options.map(opt => {
                const sel = variants[v.id] === opt;
                return (
                  <button key={opt} onClick={() => setVariants(vv => ({ ...vv, [v.id]: opt }))}
                    style={{
                      padding: '10px 16px', borderRadius: 999,
                      border: sel ? `1.5px solid ${WINE}` : `1.5px solid ${BORDER}`,
                      background: sel ? WINE : '#fff',
                      color: sel ? '#fff' : TEXT,
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    }}>{opt}</button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Nutritional values */}
        {dish.cal > 0 && (
          <div style={{ padding: '32px 22px 0' }}>
            <div style={{
              borderRadius: 18, background: '#fff', padding: 16,
              border: `1px solid ${BORDER}`, position: 'relative',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                position: 'absolute', top: -10, left: 14,
                background: PINK, color: '#fff', fontSize: 10, fontWeight: 800,
                padding: '4px 9px', borderRadius: 999, letterSpacing: 0.5,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>✨ IA</div>
              <div onClick={() => setNutriOpen(!nutriOpen)} style={{
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, #f7d774, #e89c3a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Valori nutrizionali</div>
                  <div style={{ fontSize: 12.5, color: MUTED, marginTop: 1 }}>{dish.cal} Kcal a porzione</div>
                </div>
                <div style={{ transform: nutriOpen ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                  <I.ChevDown color={TEXT} size={18}/>
                </div>
              </div>
              {nutriOpen && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {macroBars.map(m => (
                    <div key={m.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: TEXT, fontWeight: 500 }}>{m.label}</span>
                        <span style={{ color: TEXT, fontWeight: 700 }}>{m.val}g</span>
                      </div>
                      <div style={{ height: 6, background: '#f0ede8', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (m.val / m.max) * 100)}%`,
                          height: '100%', background: m.color, borderRadius: 999, transition: 'width 0.4s',
                        }}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Bottom CTA: stepper quantità + aggiungi all'ordine */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 22px 22px', background: '#fff', borderTop: `1px solid ${BORDER}`,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
      }}>
        {/* In modifica con più porzioni: il counter sceglie a quante applicare */}
        {editing && editing.qty > 1 && (
          <div style={{ fontSize: 12.5, color: MUTED, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
            A quante porzioni applicare le modifiche?
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Quantità (in modifica: "N di M") */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0,
          height: 56, background: '#f4f1ea', borderRadius: 999, padding: '0 6px',
        }}>
          <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} style={{
            width: 38, height: 38, borderRadius: 999, border: 'none',
            background: qty <= 1 ? 'transparent' : '#fff', cursor: qty <= 1 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: qty <= 1 ? 0.35 : 1, transition: 'all 0.15s',
          }} aria-label="Diminuisci"><I.Minus size={16}/></button>
          <span style={{ minWidth: editing && editing.qty > 1 ? 52 : 26, textAlign: 'center', fontSize: 17, fontWeight: 800, color: TEXT, whiteSpace: 'nowrap' }}>
            {editing && editing.qty > 1 ? `${qty} di ${editing.qty}` : qty}
          </span>
          <button onClick={() => setQty(q => Math.min(maxApply, q + 1))} disabled={qty >= maxApply} style={{
            width: 38, height: 38, borderRadius: 999, border: 'none',
            background: qty >= maxApply ? 'transparent' : WINE, cursor: qty >= maxApply ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: qty >= maxApply ? 0.35 : 1, transition: 'all 0.15s',
          }} aria-label="Aumenta"><I.Plus size={16} color={qty >= maxApply ? TEXT : '#fff'}/></button>
        </div>
        {/* Aggiungi all'ordine — disattivato finché le scelte obbligatorie mancano */}
        <button onClick={addToCart} disabled={!canAdd} style={{
          flex: 1, height: 56, borderRadius: 999, border: 'none',
          background: canAdd ? WINE : '#d8d2cc', color: '#fff',
          fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: canAdd ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px',
          boxShadow: canAdd ? `0 4px 16px ${WINE}40` : 'none', transition: 'background 0.18s',
        }}>
          {canAdd ? (
            editing ? (
              <span style={{ width: '100%', textAlign: 'center' }}>{qty < editing.qty ? `Applica a ${qty}` : 'Aggiorna ordine'}</span>
            ) : (
              <>
                <span>{qty > 1 ? `Aggiungi ${qty}` : "Aggiungi all'ordine"}</span>
                <span>{(total * qty).toFixed((total * qty) % 1 === 0 ? 0 : 2)}€</span>
              </>
            )
          ) : (
            <span style={{ width: '100%', textAlign: 'center' }}>Scegli: {missingRequired.map(v => v.label).join(', ')}</span>
          )}
        </button>
        </div>
      </div>
    </div>
  );
}


// ─── Asporto da webapp (D-14 · P-01) ───────────────────────────────
// Chi entra con il QR del menu d'asporto (?takeaway=1, o la modalità del
// simulatore) ordina dal browser: stesso menù, stesso carrello, e a fine
// composizione il codice di ritiro e il bivio di saldo (app o cassa, pari
// evidenza — P-02). Prima c'era TakeawayRedirect, il solo invito a
// scaricare l'app: superato.
const DOWNLOAD_URL = 'https://byup.app/download';

function isTakeawayEntry() {
  try {
    if (new URLSearchParams(window.location.search).get('takeaway') === '1') return true;
    if (sessionStorage.getItem('byup_menu_mode') === 'asporto') return true;
  } catch {}
  return false;
}
// Codice di ritiro: alfabeto senza I/O/0/1, va dettato a voce al banco. Copia
// guardata di nuovoCodiceRitiro in gestionale/sala-vendita-diretta.jsx: è la
// stessa forma che Vendita diretta si aspetta e che svNomeConto grida.
function nuovoCodiceRitiro() {
  return Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
}

// ─── Coperto e servizio (P-103) ─────────────────────────────────────
// Copia guardata di byupReadCoperto / byupCopertoRiga (gestionale/panoramica-
// tokens.jsx): stesso registro byup_coperto sullo stesso dominio, stesso
// default (coperto, fisso a persona, e importo ZERO: la cifra la sceglie il
// ristorante, e a zero la voce è spenta e non compare), stessa riga. La voce si mostra
// PRIMA della conferma dell'ordine al tavolo, col nome scelto dall'esercente e
// l'importo o l'aliquota (art. 180 R.D. 635/1940: le tariffe devono essere
// conoscibili prima), e il conto la ripete con lo stesso nome e lo stesso
// totale dell'app e della cassa. All'asporto non c'è.
function byupCopertoLeggi() {
  const DEF = { qualificazione: 'coperto', forma: 'fissa', importo: 0, aliquota: 0 };
  try { const s = localStorage.getItem('byup_coperto'); return s ? Object.assign({}, DEF, JSON.parse(s)) : { ...DEF }; } catch { return { ...DEF }; }
}
function byupCopertoRiga(subtotale, coperti, cfg) {
  const c = cfg || byupCopertoLeggi();
  const nome = c.qualificazione === 'servizio' ? 'Servizio' : 'Coperto';
  if (c.forma === 'percentuale') {
    const aliquota = Number(c.aliquota) || 0;
    return { nome, attiva: aliquota > 0, forma: 'percentuale', aliquota, etichetta: `${nome} · ${aliquota}% sul totale`, dettaglio: `${nome} ${aliquota}%`, valore: Math.round((subtotale || 0) * aliquota) / 100 };
  }
  const importo = Number(c.importo) || 0; const n = Math.max(1, coperti || 1);
  return { nome, attiva: importo > 0, forma: 'fissa', importo, etichetta: `${nome} · ${importo.toFixed(2).replace('.', ',')} € a persona`, dettaglio: `${nome} × ${n}`, valore: Math.round(importo * n * 100) / 100 };
}

function Root() {
  // Asporto (?takeaway=1): si ordina dal browser (D-14); l'ordine non ha una
  // sessione tavolo, quindi niente sottoscrizione real-time.
  const takeaway = isTakeawayEntry();

  const [state, setState] = useState({
    cart: [],
    splits: {},
    activeOrder: {
      id: '7K2P9',
      code: '483912',         // codice recupero ordine (6 cifre) per l'aggancio in app
      type: 'table',          // webapp = solo ordine al tavolo, inviato in cucina
      venue: 'Ristorante Maria Grazia',
      table: 'Tavolo 23',
      items: [
        // io
        { lineId: 'me-1', id: 'p1', name: 'Cacio e pepe', qty: 1, price: 14, ownerId: 'me' },
        { lineId: 'me-2', id: 'b2', name: 'Vino della casa', qty: 1, price: 24, ownerId: 'me', splitWith: ['g1'] },
        // Marco (g1) — ha già pagato
        { lineId: 'g1-1', id: 'p2', name: 'Carbonara', qty: 1, price: 15, ownerId: 'g1' },
        { lineId: 'g1-2', id: 'a3', name: 'Tagliere misto', qty: 1, price: 12, ownerId: 'g1' },
        { lineId: 'g1-3', id: 'd1', name: 'Tiramisù della casa', qty: 1, price: 8, ownerId: 'g1' },
        // Ospite 1 (g2)
        { lineId: 'g2-1', id: 's1', name: 'Saltimbocca alla romana', qty: 1, price: 22, ownerId: 'g2' },
        { lineId: 'g2-2', id: 'a1', name: "Fritto all'Italiana", qty: 1, price: 20, ownerId: 'g2' },
        { lineId: 'g2-3', id: 'p4', name: 'Risotto al tartufo', qty: 1, price: 22, ownerId: 'g2' },
        { lineId: 'g2-4', id: 'd5', name: 'Crème brûlée', qty: 1, price: 8, ownerId: 'g2' },
        // Ospite 2 (g3)
        { lineId: 'g3-1', id: 'p3', name: 'Amatriciana', qty: 1, price: 14, ownerId: 'g3' },
        { lineId: 'g3-2', id: 's6', name: 'Filetto di manzo', qty: 1, price: 32, ownerId: 'g3' },
        { lineId: 'g3-3', id: 'b3', name: 'Birra artigianale 33cl', qty: 1, price: 6, ownerId: 'g3' },
        // tavolo / aggiunti dal cameriere
        { lineId: 't-1', id: 'b1', name: 'Acqua naturale 75cl', qty: 2, price: 3, ownerId: 'table', suggested: 'share' },
        { lineId: 't-2', id: 'b6', name: 'Acqua frizzante 75cl', qty: 1, price: 3, ownerId: 'table', suggested: 'share' },
        { lineId: 't-3', id: 'b2', name: 'Vino della casa 75cl', qty: 1, price: 14, ownerId: 'table', suggested: 'share' },
        { lineId: 't-4', id: 'a4', name: 'Bruschetta mista', qty: 1, price: 8, ownerId: 'table', claimedBy: 'g1' },
        { lineId: 't-5', id: 'd2', name: 'Caffè', qty: 4, price: 1.5, ownerId: 'table' },
      ],
      total: 209,
      startedAt: new Date(Date.now() - 35 * 60 * 1000),
      covers: 4,
      guests: [
        { id: 'me', name: 'Tu', initial: 'T', isMe: true, isApp: true },
        { id: 'g1', name: 'Marco', initial: 'M', isApp: true },
        { id: 'g2', name: 'Giulia', initial: 'G', isWebApp: true },
        { id: 'g3', name: 'Ospite 1', initial: '?', isGuest: true },
      ],
    },
    participants: null,
  });
  const [route, setRoute] = useState(() => {
    const valid = ['menu','venue','home'];
    try {
      const h = (window.location.hash || '').replace('#','');
      if (valid.includes(h)) return { name: h, ctx: null };
    } catch {}
    return { name: 'menu', ctx: null };
  });
  const goTo = (name, ctx = null) => setRoute({ name, ctx });

  // Real-time: sottoscrizione agli aggiornamenti della sessione tavolo. Oggi è un
  // no-op (il mock non emette), ma è il punto in cui il backend pusherà gli update
  // condivisi — piatti/claim/divisioni degli altri ospiti e saldo che scende per
  // pagamenti da app/cassa. Vedi byup-contratto-backend-webapp.md.
  useEffect(() => {
    const sid = state.activeOrder && state.activeOrder.id;
    if (!window.ByupAPI || takeaway || !sid) return;
    return window.ByupAPI.subscribe(sid, (session) => {
      setState(s => ({ ...s, activeOrder: { ...s.activeOrder, ...session } }));
    });
  }, [state.activeOrder && state.activeOrder.id, takeaway]);

  let screen;
  if (route.name === 'menu') {
    screen = <MenuScreen state={state} setState={setState} goTo={goTo} takeaway={takeaway}/>;
  } else if (route.name === 'venue') {
    const VS = window.VenueScreen;
    // Tornando al menu DALLA vetrina si è in modalità "sfoglio, nessun tavolo":
    // segno il flag così il menu mostra il pulsante indietro (vedi fromVenue).
    const goToMenuFromVenue = () => {
      try { sessionStorage.setItem('byup_menu_from', 'venue'); } catch {}
      goTo('menu');
    };
    screen = VS
      ? <VS
          venue={{ name: 'Al Settembrini', lat: 41.9065, lng: 12.4642 }}
          onBack={goToMenuFromVenue}
          onMenu={goToMenuFromVenue}
          onBook={openAppOnly}
          onMap={openAppOnly}/>
      : <MenuScreen state={state} setState={setState} goTo={goTo}/>;
  } else if (route.name === 'dish') {
    screen = <DishDetailScreen state={state} setState={setState} ctx={route.ctx} goBack={() => goTo('menu')}/>;
  } else if (route.name === 'home') {
    screen = <HomeScreen state={state} setState={setState} goTo={goTo}/>;
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fff',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      gap: 28, flexWrap: 'wrap',
    }}>
      {/* Web app: niente cornice iOS. Solo telefoni arrivano qui (tablet/desktop
          sono fermati dal gate in index.html), quindi l'app riempie tutta la
          larghezza dello schermo — anche in orizzontale, senza margini. */}
      <div style={{
        width: '100%', height: '100vh',
        background: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        {screen}
        <AppOnlyHost/>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('menu-root')).render(<Root/>);
