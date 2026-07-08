// byup — Menu locale + Divisione + Home con ordine attivo
const { useState, useRef, useEffect } = React;

// Tema letto al caricamento pagina (le pagine sono file separati: ogni pagina
// legge byup.themeMode e sceglie la palette → dark coerente cross-page).
const __BYUP_DARK = (() => {
  try {
    const m = localStorage.getItem('byup.themeMode') || 'light';
    if (m === 'dark') return true;
    if (m === 'auto') return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return false;
  } catch { return false; }
})();
const PINK = '#E32459';
const PINK_DARK = '#B81C47';
const WINE = __BYUP_DARK ? '#ef6389' : '#8B1A3A';     // accento menu (più chiaro in dark per contrasto)
const WINE_DARK = '#5a1a2e';
const TEXT = __BYUP_DARK ? '#f6ece9' : '#1c0f15';
const MUTED = __BYUP_DARK ? 'rgba(246,236,233,.58)' : '#6d5a61';
const BORDER = __BYUP_DARK ? 'rgba(246,236,233,.13)' : '#eddfda';
const BG_GRAY = __BYUP_DARK ? '#262229' : '#f7ece8';
const BG_PAGE = __BYUP_DARK ? '#161514' : '#FBF4F1';
const SURF = __BYUP_DARK ? '#211f22' : '#fff';        // superfici card (bianco→dark)
const TINT = __BYUP_DARK ? '#2b272c' : '#f6f1ea';     // superficie tenue (righe riepilogo, chip)
const MUTESURF = __BYUP_DARK ? '#39333b' : '#e7e1d8'; // superficie muta (avatar/disabled)
const BADGE = __BYUP_DARK ? '#7a2f4a' : '#7a1c3e';    // badge/avatar wine (più chiaro in dark)

// ─── Firma CTA byup — gradiente coral + glow + sheen, usato sui money-CTA
//    di ordine e pagamento per legarli all'identità della Home. ───
const CTA_GRAD = 'linear-gradient(122deg, #E32459 0%, #B81C47 100%)';
const CTA_GLOW = '0 16px 34px -12px rgba(227,36,89,.62), inset 0 1px 0 rgba(255,255,255,.30)';
const CTA_DEAD = '#e9cfd8';

// Navigazione verso l'app Home: dentro la SPA usa il router globale
// (__byupNav, nessun reload); da pagina separata fa deep-link classico.
const __goApp = (page) => {
  const nav = window.__byupNav;
  if (nav) {
    if (!page) nav.home();
    else if (page === 'venue' && nav.venue) nav.venue();
    else nav.go(page);
  } else {
    window.location.href = page ? ('byup Home.html?page=' + page) : 'byup Home.html';
  }
};

// ─── Icons ─────────────────────────────────────────────────
const I = {
  QR: ({ size = 24, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
      <rect x="4" y="4" width="9" height="9"/><rect x="19" y="4" width="9" height="9"/><rect x="4" y="19" width="9" height="9"/>
      <rect x="7" y="7" width="3" height="3" fill={color}/><rect x="22" y="7" width="3" height="3" fill={color}/>
      <rect x="7" y="22" width="3" height="3" fill={color}/><rect x="19" y="19" width="3" height="3" fill={color}/>
      <rect x="25" y="25" width="3" height="3" fill={color}/><rect x="19" y="25" width="3" height="3" fill={color}/><rect x="25" y="19" width="3" height="3" fill={color}/>
    </svg>
  ),
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
  Cal: ({ size = 16, color = TEXT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>
  ),
  Clock: ({ size = 16, color = TEXT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
  ),
  People: ({ size = 16, color = TEXT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.8"/><path d="M14 20c0-2.5 2-4 4-4s3 1 3 3"/></svg>
  ),
  ChevDown: ({ size = 16, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
  ),
  ChevUp: ({ size = 16, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15"/></svg>
  ),
  Back: ({ size = 22, color = TEXT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  Check: ({ size = 16, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
  ),
  Home: ({ size = 24, color = TEXT, fill = 'none' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11 L12 4 L20 11 L20 20 L14 20 L14 14 L10 14 L10 20 L4 20 Z"/></svg>
  ),
  User: ({ size = 24, color = TEXT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21"/></svg>
  ),
  Refresh: ({ size = 18, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.5 15a9 9 0 11-2.1-9.4L23 10"/></svg>
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

function AllergenDots({ ids, onTap, max }) {
  const [openId, setOpenId] = useState(null);
  const shown = max ? ids.slice(0, max) : ids;
  const extra = max ? Math.max(0, ids.length - max) : 0;
  return (
    <div style={{ display: 'flex', gap: 6, rowGap: 6, flexWrap: 'wrap', position: 'relative', minWidth: 0 }}>
      {shown.map(id => {
        const a = ALLERGENS[id]; if (!a) return null;
        const isOpen = openId === id;
        return (
          <span key={id} style={{ position: 'relative' }}>
            <span role="button" tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setOpenId(isOpen ? null : id); }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: 999,
                background: TINT, border: '1px solid #e8e0d8',
                cursor: 'pointer', fontSize: 11, lineHeight: 1,
              }}>{a.icon}</span>
            {isOpen && (
              <span style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                background: BADGE, color: '#fff', fontSize: 11, fontWeight: 600,
                padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap',
                zIndex: 5, animation: 'fade 0.15s ease',
              }}>
                {a.label}
                <span style={{
                  position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                  width: 6, height: 6, background: BADGE,
                }}/>
              </span>
            )}
          </span>
        );
      })}
      {extra > 0 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          height: 22, minWidth: 22, padding: '0 6px', borderRadius: 999,
          background: TINT, border: '1px solid #e8e0d8',
          fontSize: 10.5, fontWeight: 700, color: MUTED, lineHeight: 1, flexShrink: 0,
        }}>+{extra}</span>
      )}
    </div>
  );
}

// ─── Dish placeholder image (uses DishArt) ─────────────────
function DishPhoto({ tone = 'a', bestSeller, label, kind, hideBadge = false }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    }}>
      <DishArt kind={kind || 'default'}/>
      {bestSeller && !hideBadge && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: BADGE, color: '#fff',
          fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
          padding: '4px 8px', borderRadius: 999,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>★ BEST SELLER</div>
      )}
    </div>
  );
}

// ─── Dish data (module-level so DishDetail can read it too) ────────
const DISHES_BY_CAT = {
  'Antipasti': [
    { id: 'a1', name: "Fritto all'Italiana", price: 20, kind: 'fritto', photo: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=70&auto=format&fit=crop',
      desc: 'Fritto misto all italiana che include suppli, fiore di zucca fritto e olive all ascolana',
      longDesc: "Fritto misto all'italiana che include supplì di riso al pomodoro, fiore di zucca ripieno di mozzarella e alici, olive all'ascolana ripiene di carne. Servito con maionese fatta in casa.",
      prep: 12, allergens: ['glutine','uova','lattosio'], bestSeller: true, tone: 'a',
      ingredients: ['Supplì di riso', 'Fiore di zucca', "Olive all'ascolana", 'Maionese'],
      extras: [{ id: 'e1', name: 'Maionese extra', price: 1.5 }, { id: 'e2', name: 'Salsa tartara', price: 2 }],
      variants: [], cal: 720, macros: { carbo: 48, grassi: 42, prot: 18, fibre: 6 } },
    { id: 'a2', name: 'Impepata di cozze', price: 18, kind: 'cozze', photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=70&auto=format&fit=crop',
      desc: 'Impepata di cozze nostrane, fresche di giornata, origine Italia.',
      longDesc: 'Cozze nostrane fresche di giornata cotte con aglio, olio extravergine, prezzemolo e pepe nero macinato. Servite con crostini di pane casereccio tostato.',
      prep: 18, allergens: ['pesce','crostacei','glutine','lattosio'], bestSeller: true, tone: 'b',
      ingredients: ['Aglio', 'Prezzemolo', 'Pepe nero', 'Crostini'],
      extras: [{ id: 'e1', name: 'Crostini extra', price: 2 }, { id: 'e2', name: 'Limone bio', price: 0.5 }],
      variants: [{ id: 'piccante', label: 'Piccantezza', options: ['Normale', 'Piccante', 'Molto piccante'] }],
      cal: 380, macros: { carbo: 22, grassi: 12, prot: 35, fibre: 4 } },
    { id: 'a3', name: 'Tagliere misto', price: 12, kind: 'tagliere', photo: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=70&auto=format&fit=crop',
      desc: 'Tagliere misto di salumi e formaggi tra cui pecorino sardo, taleggio, prosciutto parma.',
      longDesc: 'Selezione di salumi e formaggi del territorio: pecorino sardo DOP, taleggio, prosciutto di Parma 24 mesi, salame finocchiona, mortadella IGP. Accompagnato da miele di acacia, marmellata di fichi e pane casereccio.',
      prep: 8, allergens: ['lattosio','glutine','fruttaguscio'], bestSeller: true, tone: 'c',
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
      prep: 6, allergens: ['glutine'], bestSeller: true, tone: 'c',
      ingredients: ['Pane casereccio', 'Pomodoro', 'Aglio', 'Basilico', 'Olio EVO'],
      extras: [], variants: [], cal: 220, macros: { carbo: 32, grassi: 8, prot: 6, fibre: 3 } },
  ],
  'Primi piatti': [
    { id: 'p1', name: 'Cacio e pepe', price: 14, kind: 'pasta', photo: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=70&auto=format&fit=crop',
      desc: 'Tonnarelli, pecorino romano DOP, pepe nero macinato fresco.',
      longDesc: 'Tonnarelli freschi fatti in casa, mantecati con pecorino romano DOP stagionato 12 mesi e pepe nero del Sarawak macinato al momento. Una delle 4 paste classiche romane.',
      prep: 14, allergens: ['glutine','lattosio','uova'], bestSeller: true, tone: 'a',
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
      prep: 20, allergens: ['lattosio'], bestSeller: true, tone: 'b',
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
      variants: [{ id: 'cottura', label: 'Cottura', options: ['Al sangue', 'Media', 'Ben cotta'] }],
      cal: 580, macros: { carbo: 8, grassi: 32, prot: 52, fibre: 1 } },
    { id: 's2', name: 'Abbacchio alla cacciatora', price: 26, kind: 'default', photo: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=70&auto=format&fit=crop',
      desc: 'Agnello romano in umido con aceto, rosmarino e aglio.',
      longDesc: 'Abbacchio laziale in umido con aceto di vino bianco, rosmarino, aglio, capperi e acciughe. Ricetta della tradizione romana, servito con pane casereccio.',
      prep: 35, allergens: ['pesce','glutine'], bestSeller: true, tone: 'a',
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
      variants: [{ id: 'cottura', label: 'Cottura', options: ['Al sangue', 'Media', 'Ben cotta'] }],
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
      prep: 5, allergens: ['glutine','uova','lattosio','fruttaguscio'], bestSeller: true, tone: 'c',
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
      extras: [], variants: [{ id: 'gusto', label: 'Gusti', options: ['Cioccolato fondente', 'Pistacchio', 'Fragola', 'Fior di latte'] }],
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
      variants: [{ id: 'tipo', label: 'Tipo di vino', options: ['Rosso', 'Bianco'] }],
      cal: 320, macros: { carbo: 12, grassi: 0, prot: 0, fibre: 0 } },
    { id: 'b3', name: 'Birra artigianale 33cl', price: 6, kind: 'default', photo: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=70&auto=format&fit=crop',
      desc: 'Selezione di birre artigianali laziali. Chiedi al cameriere.',
      longDesc: 'Selezione rotante di birre artigianali del Lazio e dintorni. IPA, Lager, Ambrata o Weiss. Il cameriere ti illustrerà le birre disponibili del giorno.',
      prep: 2, allergens: ['glutine'], tone: 'c', ingredients: [], extras: [],
      variants: [{ id: 'tipo', label: 'Tipo', options: ['IPA', 'Lager', 'Ambrata', 'Weiss'] }],
      cal: 150, macros: { carbo: 14, grassi: 0, prot: 2, fibre: 0 } },
    { id: 'b4', name: 'Succo di frutta 20cl', price: 4, kind: 'default', photo: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=70&auto=format&fit=crop',
      desc: 'Succo di frutta fresco, senza zuccheri aggiunti.',
      longDesc: 'Succo di frutta estratto a freddo, senza zuccheri aggiunti né conservanti. Disponibile: arancia, mela, carota-zenzero, ananas.',
      prep: 3, allergens: [], tone: 'a', ingredients: [],
      extras: [],
      variants: [{ id: 'gusto', label: 'Gusto', options: ['Arancia', 'Mela', 'Carota-zenzero', 'Ananas'] }],
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

// ─── MODE SHEET (scansiona QR vs Take Away) ───────────────
function ModeSheet({ onClose, onScanQR, onTakeaway, cartCount, cartTotal }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90,
      display: 'flex', alignItems: 'flex-end',
      animation: 'fade 0.2s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: SURF,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '14px 22px 30px',
        animation: 'slideUp 0.28s cubic-bezier(.2,.9,.3,1.1)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e0e0e0', margin: '0 auto 14px' }}/>
        <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4 }}>
          Come vuoi gestire l'ordine?
        </div>
        <div style={{ fontSize: 13.5, color: MUTED, marginTop: 6, marginBottom: 18 }}>
          {cartCount} {cartCount === 1 ? 'piatto' : 'piatti'} · {cartTotal}€
        </div>

        {/* Option: Scansiona QR (al tavolo) */}
        <button onClick={onScanQR} style={{
          width: '100%', background: SURF,
          border: `1.5px solid ${BORDER}`, borderRadius: 18,
          padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 14,
          textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
          marginBottom: 12,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: BADGE,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <I.QR size={26} color="#fff"/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: TEXT, marginBottom: 2 }}>
              Sono al ristorante
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.35 }}>
              Inquadra il QR del tavolo per inviare l'ordine in cucina
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
        </button>

        {/* Option: Take Away */}
        <button onClick={onTakeaway} style={{
          width: '100%', background: SURF,
          border: `1.5px solid ${BORDER}`, borderRadius: 18,
          padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 14,
          textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #FF8A4C 0%, #FF6B35 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 L18 2 L20 6 L4 6 Z"/>
              <path d="M5 6 L5 20 a 2 2 0 0 0 2 2 L17 22 a 2 2 0 0 0 2 -2 L19 6"/>
              <line x1="10" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: TEXT, marginBottom: 2 }}>
              Take Away
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.35 }}>
              Paga ora e scegli l'orario per ritirare al locale
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
        </button>

        <div style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 18, lineHeight: 1.4 }}>
          Per ordinare al tavolo serve il QR code esposto nel locale
        </div>
      </div>
    </div>
  );
}

// ─── MENU SCREEN ───────────────────────────────────────────
// Banda di categoria — full-bleed, icona kawaii che entra con spring, titolo Fredoka.
const CAT_ART = {
  'Antipasti':      ['assets/cat-aperitivo.png', '#fae3de'],
  'Primi piatti':   ['assets/cat-pizza.png',     '#FCE9EE'],
  'Secondi piatti': ['assets/cat-burger.png',    '#FEF0E3'],
  'Dolci':          ['assets/cat-dolce.png',     '#F9E3EE'],
  'Bevande':        ['assets/cat-vino.png',      '#f4e5ef'],
};
// Divisore-capitolo editoriale: numero-fantasma, dots di avanzamento sezione,
// icona kawaii che entra in spring, sottolineatura brand che si "disegna".
// L'insieme dà un senso di progressione → invoglia a scorrere fino in fondo.
function CatBand({ name, count, index = 0, total = 5 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [img, tint] = CAT_ART[name] || CAT_ART['Antipasti'];
  const num = String(index + 1).padStart(2, '0');
  return (
    <div ref={ref} style={{
      margin: '32px -18px 18px', padding: '24px 18px 20px', position: 'relative', overflow: 'hidden',
      background: `linear-gradient(115deg, ${tint} 0%, rgba(255,255,255,0) 82%)`,
    }}>
      {/* numero-capitolo fantasma */}
      <div aria-hidden style={{
        position: 'absolute', left: 8, top: -20, fontFamily: "'Fredoka', sans-serif",
        fontSize: 104, fontWeight: 600, lineHeight: 1, color: PINK, letterSpacing: -5,
        opacity: inView ? 0.09 : 0, transform: inView ? 'none' : 'translateY(12px)',
        transition: 'opacity 640ms ease, transform 640ms ease', pointerEvents: 'none',
      }}>{num}</div>

      {/* icona kawaii della categoria */}
      <img src={img} width="82" alt="" aria-hidden style={{
        position: 'absolute', right: 12, top: '50%',
        transform: inView ? 'translateY(-50%) rotate(8deg)' : 'translateY(-20%) rotate(-8deg) scale(.6)',
        opacity: inView ? 1 : 0,
        transition: 'transform 680ms cubic-bezier(.34,1.45,.64,1), opacity 420ms ease',
        filter: 'drop-shadow(0 10px 16px rgba(77,18,46,.18))',
        animation: inView ? 'bkBob 3.6s .8s ease-in-out infinite' : 'none',
        pointerEvents: 'none', zIndex: 1,
      }}/>

      {/* label sezione + dots di avanzamento */}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7,
        opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(8px)',
        transition: 'opacity 500ms ease, transform 500ms ease',
      }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: PINK, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          Sezione {index + 1}<span style={{ color: MUTED, fontWeight: 700 }}>/{total}</span>
        </span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: i === index ? 16 : 5, height: 5, borderRadius: 999,
              background: i === index ? PINK : (i < index ? '#e79fb4' : '#e6d2d9'),
              transition: 'width 420ms ease, background 420ms ease',
            }}/>
          ))}
        </div>
      </div>

      {/* titolo Fredoka */}
      <div style={{
        position: 'relative', fontFamily: "'Fredoka', sans-serif", fontSize: 27, fontWeight: 600, color: TEXT, lineHeight: 1.05,
        transform: inView ? 'none' : 'translateY(18px)', opacity: inView ? 1 : 0,
        transition: 'transform 540ms cubic-bezier(.22,.9,.35,1), opacity 440ms ease',
      }}>{name}</div>

      {/* count */}
      <div style={{
        position: 'relative', fontSize: 11.5, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, marginTop: 5,
        opacity: inView ? 1 : 0, transition: 'opacity 520ms 200ms ease',
      }}>{count} {count === 1 ? 'piatto' : 'piatti'} · scorri e gusta</div>

      {/* sottolineatura brand che si disegna */}
      <div aria-hidden style={{
        height: 3, width: 48, borderRadius: 999, marginTop: 11,
        background: `linear-gradient(90deg, ${PINK}, ${PINK_DARK})`,
        transformOrigin: 'left', transform: inView ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 560ms 120ms cubic-bezier(.22,.9,.35,1)',
      }}/>
    </div>
  );
}

function MenuScreen({ state, setState, goTo }) {
  const tabs = ['Antipasti', 'Primi piatti', 'Secondi piatti', 'Dolci', 'Bevande'];
  // Tab di navigazione: "Byup" è una voce extra (non una categoria di piatti)
  // che punta alla sezione "I più ordinati" in cima alla lista.
  const navTabs = ['Byup', ...tabs];
  const CAT_ICONS = { 'Antipasti': '🥖', 'Primi piatti': '🍝', 'Secondi piatti': '🥩', 'Dolci': '🍰', 'Bevande': '🍷' };
  const [tab, setTab] = useState('Byup');
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
    navTabs.forEach(t => { const el = sectionRefs.current[t]; if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Scroll alla sezione quando si clicca una tab.
  // Uso getBoundingClientRect perché offsetTop è relativo all'offsetParent
  // (non al contenitore di scroll) e includerebbe l'altezza dell'header,
  // facendo scrollare troppo in basso e nascondendo il titolo della categoria.
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
  const [dietFilter, setDietFilter] = useState(null); // 'veg' | 'vegan' | 'gf' | 'spicy' | null
  const [allergenFilters, setAllergenFilters] = useState({}); // {glutine: true, ...} = NASCONDI piatti con questi
  const [allergenSheetOpen, setAllergenSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState('collapsed'); // 'collapsed' | 'expanded'
  const [sheetTab, setSheetTab] = useState('piatti'); // 'piatti' | 'divisione'
  const [confirm, setConfirm] = useState(false);
  const [modeSheetOpen, setModeSheetOpen] = useState(false);
  // Prompt coperti: appare al primo ingresso al tavolo (non da Vetrina), una sola volta
  const [copertiSheetOpen, setCopertiSheetOpen] = useState(false);
  // Sheet "Al tavolo": stessa usata in Payment / Home — lista commensali + share link
  const [guestsOpen, setGuestsOpen] = useState(false);
  useEffect(() => {
    if (!fromVenue && !state.copertiSelected) {
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

  // Piatti "Per te" — stessa logica della sezione "In base ai tuoi gusti".
  // Calcolata qui una volta sola così il badge è riusabile anche nelle card.
  const perTeIds = (() => {
    const top4 = new Set(ALL_DISHES.filter(d => d.bestSeller).slice(0, 4).map(d => d.id));
    const dietMatch = (d) => {
      if (!dietFilter) return true;
      if (dietFilter === 'veg') return !d.allergens.includes('pesce');
      if (dietFilter === 'vegan') return !d.allergens.includes('lattosio') && !d.allergens.includes('uova') && !d.allergens.includes('pesce') && !d.allergens.includes('crostacei');
      if (dietFilter === 'gf') return !d.allergens.includes('glutine');
      return true;
    };
    const picks = ALL_DISHES.filter(d => {
      if (top4.has(d.id)) return false;
      for (const id of Object.keys(allergenFilters)) {
        if (allergenFilters[id] && d.allergens.includes(id)) return false;
      }
      return dietMatch(d);
    }).slice(0, 6);
    return new Set(picks.map(d => d.id));
  })();

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
  const setQty = (lineId, q) => setState(s => ({
    ...s, cart: q <= 0 ? s.cart.filter(i => i.lineId !== lineId) : s.cart.map(i => i.lineId === lineId ? { ...i, qty: q } : i),
  }));
  const clearCart = () => setState(s => ({ ...s, cart: [] }));

  const handleSubmit = () => {
    // Se hai già un takeaway in corso → cumula come takeaway, niente sheet
    if (state.takeawayOrder) {
      startTakeaway();
      return;
    }
    // Sei dalla Vetrina → chiedi sempre se ordini al tavolo o take away
    if (fromVenue) {
      setModeSheetOpen(true);
      return;
    }
    submitTableOrder();
  };

  const submitTableOrder = () => {
    setConfirm(true);
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
        if (s.activeOrder) {
          const merged = [...s.activeOrder.items, ...newItems];
          const newTotal = merged.reduce((sum, i) => sum + i.price * i.qty, 0);
          return {
            ...s,
            activeOrder: { ...s.activeOrder, items: merged, total: newTotal },
            cart: [],
          };
        }
        return {
          ...s,
          activeOrder: {
            venue: 'Ristorante Maria Grazia',
            table: 'Tavolo 23',
            items: newItems,
            total: cartTotal,
            startedAt: new Date(),
            covers: 4,
            guests: [
              { id: 'me', name: 'Tu', initial: 'T', isMe: true, isApp: true },
              { id: 'g1', name: 'Marco', initial: 'M', isApp: true },
              { id: 'g2', name: 'Ospite', initial: '?', isGuest: true },
              { id: 'g3', name: 'Ospite', initial: '?', isGuest: true },
            ],
            // table-wide items added by waiter or other guests
            tableItems: [],
          },
          cart: [],
        };
      });
      setConfirm(false);
      goTo('home');
    }, 1500);
  };

  const startTakeaway = () => {
    setModeSheetOpen(false);
    // pass cart contents as ctx to takeaway picker
    goTo('takeaway', null);
  };
  const startScanQR = () => {
    setModeSheetOpen(false);
    // simulate scan → flusso al tavolo (carica anche tavolo+coperti)
    submitTableOrder();
  };

  return (
    <div data-screen-label="Menu locale" style={{
      width: '100%', height: '100%', background: BG_PAGE, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {(() => { const K = window.ByupKit; return K ? <K.MascotMoment absolute pose="chef" pageKey="menu" message="Fame? Inizia da qui 👨‍🍳" bottom={128} size={122}/> : null; })()}
      {/* Floating back button — sempre visibile */}
      <button onClick={() => {
        try { sessionStorage.removeItem('byup_menu_from'); } catch {}
        if (fromVenue) __goApp('venue');
        else __goApp();
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

      {/* Top: sticky header (search + tabs + filtri attivi) */}
      <div style={{ background: BG_PAGE, position: 'relative', zIndex: 5 }}>
        {/* Search + filtri */}
        <div style={{ padding: '60px 16px 0 64px', display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            background: SURF, borderRadius: 999, padding: '9px 14px',
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
          {(() => {
            const count = Object.values(allergenFilters).filter(Boolean).length + (dietFilter ? 1 : 0);
            return (
              <button onClick={() => setAllergenSheetOpen(true)} style={{
                position: 'relative', width: 38, height: 38, borderRadius: 999, flexShrink: 0,
                background: count > 0 ? WINE : SURF, border: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={count > 0 ? '#fff' : TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
                  <circle cx="18" cy="12" r="2.5" fill={count > 0 ? '#fff' : 'none'}/>
                  <circle cx="14" cy="18" r="2.5" fill={count > 0 ? '#fff' : 'none'}/>
                </svg>
                {count > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
                    background: BADGE, color: '#fff',
                    fontSize: 10.5, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{count}</span>
                )}
              </button>
            );
          })()}
        </div>

        {/* Riga 3: tabs categorie */}
        <div ref={tabBarRef} className="hscroll" style={{
          display: 'flex', gap: 4, padding: '12px 16px 0',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {navTabs.map(t => {
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

        {/* Riga 4 (condizionale): pillole filtri attivi rimovibili */}
        {(dietFilter || Object.values(allergenFilters).some(Boolean)) && (
          <div className="hscroll" style={{
            display: 'flex', gap: 6, padding: '10px 16px 4px',
            overflowX: 'auto', scrollbarWidth: 'none', borderTop: `1px solid ${BORDER}`,
          }}>
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 600, alignSelf: 'center', flexShrink: 0, paddingRight: 4, paddingTop: 2 }}>Filtri:</span>
            {dietFilter && (() => {
              const dietLabels = { veg: '🌱 Vegetariano', vegan: '🥗 Vegano', gf: '🌾 Senza glutine' };
              return (
                <button onClick={() => setDietFilter(null)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, flex: '0 0 auto',
                  background: WINE, color: '#fff', border: 'none',
                  padding: '5px 8px 5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}>
                  {dietLabels[dietFilter]}
                  <span style={{ opacity: 0.85, fontSize: 14, lineHeight: 1, marginLeft: 2 }}>×</span>
                </button>
              );
            })()}
            {Object.entries(allergenFilters).filter(([_, on]) => on).map(([id]) => (
              <button key={id} onClick={() => setAllergenFilters(f => { const n = {...f}; delete n[id]; return n; })} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, flex: '0 0 auto',
                background: BADGE, color: '#fff', border: 'none',
                padding: '5px 8px 5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>
                Senza {ALLERGENS[id]?.label?.toLowerCase() || id}
                <span style={{ opacity: 0.85, fontSize: 14, lineHeight: 1, marginLeft: 2 }}>×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable list */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 0 240px' }}>

        {/* Hero image — scorre via */}
        {!searchQ && (
          <div onClick={() => { try { sessionStorage.removeItem('byup_menu_from'); } catch {} __goApp('venue'); }} style={{ position: 'relative', height: 180, overflow: 'hidden', marginBottom: 20, cursor: 'pointer' }}>
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
                {!fromVenue && (() => {
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
                              background: (g.isApp || g.isWebApp) ? BADGE : '#c4b89f',
                              color: '#fff',
                              border: '2px solid rgba(255,255,255,0.55)', marginLeft: -8,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9.5, fontWeight: 700,
                            }}>{g.initial || '?'}</div>
                          ))}
                          {guests.length > 3 && (
                            <div style={{
                              width: 24, height: 24, borderRadius: 999,
                              background: MUTESURF, color: '#fff',
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

        {/* I più ordinati — sempre visibile se non c'è ricerca attiva */}
        {!searchQ && (() => {
          const tops = ALL_DISHES.filter(d => d.bestSeller).slice(0, 4);
          if (!tops.length) return null;
          return (
            <div ref={el => sectionRefs.current['Byup'] = el} data-cat="Byup" style={{ marginBottom: 26, marginLeft: -18, marginRight: -18 }}>
              <div style={{ padding: '0 18px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4 }}>I più ordinati</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>I piatti più amati di oggi</div>
              </div>
              <div className="hscroll" style={{ display: 'flex', gap: 12, padding: '4px 18px 6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {tops.map((d, i) => {
                  const qty = cart.filter(i => i.dishId === d.id).reduce((s, i) => s + i.qty, 0);
                  return (
                    <div key={d.id} onClick={() => goTo('dish', { dishId: d.id })} style={{
                      flex: '0 0 auto', width: 180, background: SURF, borderRadius: 16,
                      overflow: 'hidden', cursor: 'pointer', position: 'relative',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                      <div style={{ height: 130, position: 'relative' }}>
                        {d.photo ? (
                          <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        ) : (
                          <DishPhoto tone={d.tone} kind={d.kind} hideBadge label={d.name.split(' ')[0].toLowerCase()}/>
                        )}
                        <div style={{
                          position: 'absolute', top: 8, left: 8,
                          background: BADGE, color: '#fff',
                          fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
                          padding: '4px 8px', borderRadius: 999,
                        }}>★ TOP</div>
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 6 }}>
                          <div style={{ fontSize: 13.5, color: TEXT, fontWeight: 700, whiteSpace: 'nowrap' }}>{d.price}€</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); addDish(d.id); }} style={{
                          marginTop: 8, width: '100%', height: 32, borderRadius: 8,
                          border: 'none', background: qty > 0 ? WINE : BADGE,
                          color: '#fff', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                        }}>
                          {qty > 0 ? `Nel carrello · ${qty}` : 'Aggiungi'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* In base ai tuoi gusti — suggerimenti personalizzati (no ricerca attiva) */}
        {!searchQ && (() => {
          const top4 = new Set(ALL_DISHES.filter(d => d.bestSeller).slice(0, 4).map(d => d.id));
          const dietMatch = (d) => {
            if (!dietFilter) return true;
            if (dietFilter === 'veg') return !d.allergens.includes('pesce');
            if (dietFilter === 'vegan') return !d.allergens.includes('lattosio') && !d.allergens.includes('uova') && !d.allergens.includes('pesce') && !d.allergens.includes('crostacei');
            if (dietFilter === 'gf') return !d.allergens.includes('glutine');
            return true;
          };
          const picks = ALL_DISHES.filter(d => {
            if (top4.has(d.id)) return false; // non duplicare "I più ordinati"
            for (const id of Object.keys(allergenFilters)) {
              if (allergenFilters[id] && d.allergens.includes(id)) return false;
            }
            return dietMatch(d);
          }).slice(0, 6);
          if (picks.length < 2) return null;
          const hasPrefs = dietFilter || Object.values(allergenFilters).some(Boolean);
          const dietLabels = { veg: 'vegetariana', vegan: 'vegana', gf: 'senza glutine' };
          const subtitle = dietFilter
            ? `Scelti per la tua dieta ${dietLabels[dietFilter] || ''}`.trim()
            : (Object.values(allergenFilters).some(Boolean)
              ? 'Senza gli allergeni che eviti'
              : 'Una selezione pensata per te');
          return (
            <div style={{ marginBottom: 26, marginLeft: -18, marginRight: -18 }}>
              <div style={{ padding: '0 18px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4 }}>In base ai tuoi gusti</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{subtitle}</div>
              </div>
              <div className="hscroll" style={{ display: 'flex', gap: 12, padding: '4px 18px 6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {picks.map((d) => {
                  const qty = cart.filter(i => i.dishId === d.id).reduce((s, i) => s + i.qty, 0);
                  return (
                    <div key={d.id} onClick={() => goTo('dish', { dishId: d.id, perTe: true })} style={{
                      flex: '0 0 auto', width: 180, background: SURF, borderRadius: 16,
                      overflow: 'hidden', cursor: 'pointer', position: 'relative',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                      <div style={{ height: 130, position: 'relative' }}>
                        {d.photo ? (
                          <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        ) : (
                          <DishPhoto tone={d.tone} kind={d.kind} hideBadge label={d.name.split(' ')[0].toLowerCase()}/>
                        )}
                        <div style={{
                          position: 'absolute', top: 8, left: 8,
                          background: WINE, color: '#fff',
                          fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
                          padding: '4px 8px', borderRadius: 999,
                        }}>✨ PER TE</div>
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 6 }}>
                          <div style={{ fontSize: 13.5, color: TEXT, fontWeight: 700, whiteSpace: 'nowrap' }}>{d.price}€</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); addDish(d.id); }} style={{
                          marginTop: 8, width: '100%', height: 32, borderRadius: 8,
                          border: 'none', background: qty > 0 ? WINE : BADGE,
                          color: '#fff', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                        }}>
                          {qty > 0 ? `Nel carrello · ${qty}` : 'Aggiungi'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Tutte le categorie in sequenza */}
        </div>{/* end padding wrapper */}
        {tabs.map((catName, catIdx) => {
          const catDishes = (DISHES_BY_CAT[catName] || []).filter(d => {
            if (searchQ && !d.name.toLowerCase().includes(searchQ.toLowerCase()) && !d.desc.toLowerCase().includes(searchQ.toLowerCase())) return false;
            for (const id of Object.keys(allergenFilters)) {
              if (allergenFilters[id] && d.allergens.includes(id)) return false;
            }
            return true;
          });
          const dietMatch = (d) => {
            if (!dietFilter) return false;
            if (dietFilter === 'veg') return !d.allergens.includes('pesce');
            if (dietFilter === 'vegan') return !d.allergens.includes('lattosio') && !d.allergens.includes('uova') && !d.allergens.includes('pesce') && !d.allergens.includes('crostacei');
            if (dietFilter === 'gf') return !d.allergens.includes('glutine');
            return false;
          };
          const sorted = dietFilter
            ? [...catDishes].sort((a, b) => (dietMatch(b) ? 1 : 0) - (dietMatch(a) ? 1 : 0))
            : catDishes;
          if (!sorted.length) return null;
          return (
            <div key={catName} ref={el => sectionRefs.current[catName] = el} data-cat={catName} style={{ marginBottom: 8, padding: '0 18px' }}>
              <CatBand name={catName} count={sorted.length} index={catIdx} total={tabs.length}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {sorted.map((d, idx) => {
                  const isFirst = idx === 0;
                  const prevMatch = idx > 0 && dietMatch(sorted[idx - 1]);
                  const showDivider = dietFilter && !dietMatch(d) && prevMatch;
                  const qty = cart.filter(i => i.dishId === d.id).reduce((s, i) => s + i.qty, 0);
                  return (
                    <React.Fragment key={d.id}>
                      {showDivider && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
                          <div style={{ flex: 1, height: 1, background: TINT }}/>
                          <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>Altri piatti</span>
                          <div style={{ flex: 1, height: 1, background: TINT }}/>
                        </div>
                      )}
                    <div onClick={() => goTo('dish', { dishId: d.id })} style={{
                      background: SURF, borderRadius: 18, padding: 14, height: 166, overflow: 'hidden',
                      display: 'flex', gap: 14, cursor: 'pointer',
                      boxShadow: qty > 0 ? `0 4px 16px rgba(90,26,46,0.14)` : '0 1px 4px rgba(0,0,0,0.05)',
                      border: qty > 0 ? `1.5px solid ${WINE}` : '1.5px solid transparent',
                      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                    }}>
                      {/* Immagine a sinistra — riempie tutta l'altezza della card */}
                      <div style={{ width: 130, height: '100%', borderRadius: 14, overflow: 'hidden', background: '#eee', flexShrink: 0, position: 'relative' }}>
                        {d.photo ? (
                          <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        ) : (
                          <DishPhoto tone={d.tone} bestSeller={false} kind={d.kind} hideBadge label={d.name.split(' ')[0].toLowerCase()}/>
                        )}
                        {/* Badge come overlay sulla foto */}
                        {(d.bestSeller || (perTeIds.has(d.id) && !d.bestSeller) || (dietFilter && dietMatch(d))) && (
                          <div style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {d.bestSeller && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: BADGE, padding: '3px 8px', borderRadius: 999, letterSpacing: 0.4, textTransform: 'uppercase', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>★ TOP</span>}
                            {perTeIds.has(d.id) && !d.bestSeller && !(dietFilter && dietMatch(d)) && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: WINE, padding: '3px 8px', borderRadius: 999, letterSpacing: 0.4, textTransform: 'uppercase', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>✨ Per te</span>}
                            {dietFilter && dietMatch(d) && (() => {
                              const labels = { veg: '🌱 Veg', vegan: '🌿 Vegan', gf: '🌾 Senza glutine' };
                              return <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#1a7a3c', padding: '3px 8px', borderRadius: 999, letterSpacing: 0.3, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{labels[dietFilter]}</span>;
                            })()}
                          </div>
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
                          <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, flexShrink: 0 }}>{d.price}€</div>
                          <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                            {qty === 0 ? (
                              <button onClick={(e) => { e.stopPropagation(); addDish(d.id); }} style={{
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
                                <button onClick={(e) => { e.stopPropagation(); addDish(d.id); }} style={{ width: 24, height: 24, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><I.Plus color="#fff" size={12}/></button>
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
      </div>

      {/* Bottom sheet — order */}
      <OrderSheet
        state={state} setState={setState}
        cartCount={cartCount} cartTotal={cartTotal}
        mode={sheetMode} setMode={setSheetMode}
        sheetTab={sheetTab} setSheetTab={setSheetTab}
        dishes={dishes} setQty={setQty} clearCart={clearCart}
        onSubmit={handleSubmit}
        goTo={goTo}
      />

      {/* Confirm overlay */}
      {confirm && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 80,
          background: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          animation: 'fade 0.2s ease',
        }}>
          <div style={{
            background: SURF, borderRadius: 24, padding: '28px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            animation: 'pop 0.3s cubic-bezier(.2,.9,.3,1.3)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999, background: PINK,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <I.Check size={32} color="#fff"/>
            </div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 19, fontWeight: 600, color: TEXT, marginTop: 4 }}>Ordine inviato!</div>
            <div style={{ fontSize: 13, color: MUTED, textAlign: 'center', maxWidth: 200 }}>
              Lo trovi sulla home pronto per essere ritirato
            </div>
          </div>
        </div>
      )}

      {/* Mode sheet: scansiona QR / take away */}
      {modeSheetOpen && (
        <ModeSheet
          onClose={() => setModeSheetOpen(false)}
          onScanQR={startScanQR}
          onTakeaway={startTakeaway}
          cartCount={cartCount}
          cartTotal={cartTotal}
        />
      )}

      {/* Coperti prompt sheet — elegante, una sola volta */}
      {copertiSheetOpen && (
        <div onClick={skipCoperti} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 45,
          display: 'flex', alignItems: 'flex-end',
          animation: 'fade 0.22s ease',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: SURF, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '10px 22px 32px',
            animation: 'slideUp 0.32s cubic-bezier(.2,.9,.3,1.05)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          }}>
            <div style={{ width: 38, height: 4, background: MUTESURF, borderRadius: 999, margin: '4px auto 18px' }}/>

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
                  background: SURF, cursor: 'pointer', fontFamily: 'inherit',
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

      {/* Allergen filter sheet */}
      {allergenSheetOpen && (
        <div onClick={() => setAllergenSheetOpen(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: SURF, borderTopLeftRadius: 22, borderTopRightRadius: 22,
            padding: '12px 22px 24px', maxHeight: '80%', overflowY: 'auto',
          }}>
            <div style={{ width: 38, height: 4, background: MUTESURF, borderRadius: 999, margin: '4px auto 14px' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: -0.2, whiteSpace: 'nowrap' }}>Filtra allergeni</div>
              {Object.values(allergenFilters).some(Boolean) && (
                <button onClick={() => setAllergenFilters({})} style={{
                  background: 'none', border: 'none', color: PINK, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', padding: 0,
                }}>Reset</button>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>
              Filtra il menu in base alle tue preferenze e a ciò che vuoi evitare.
            </div>

            {/* Diet preferences */}
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Preferenze alimentari</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
              {[
                { id: null, label: 'Tutti' },
                { id: 'veg', label: '🌱 Vegetariano' },
                { id: 'vegan', label: '🥗 Vegano' },
                { id: 'gf', label: '🌾 Senza glutine' },
              ].map(f => (
                <button key={f.id || 'all'} onClick={() => setDietFilter(f.id)} style={{
                  background: dietFilter === f.id ? WINE : SURF,
                  color: dietFilter === f.id ? '#fff' : TEXT,
                  border: dietFilter === f.id ? `1px solid ${WINE}` : `1px solid ${BORDER}`,
                  padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}>{f.label}</button>
              ))}
            </div>

            {/* Allergens */}
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Evita allergeni</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {Object.entries(ALLERGENS).map(([id, a]) => {
                const on = !!allergenFilters[id];
                return (
                  <button key={id} onClick={() => setAllergenFilters(f => {
                    const n = { ...f };
                    if (n[id]) delete n[id]; else n[id] = true;
                    return n;
                  })} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 12px', borderRadius: 12,
                    border: on ? `1.5px solid ${WINE}` : `1.5px solid ${BORDER}`,
                    background: on ? TINT : SURF,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 999, background: a.color, flexShrink: 0,
                      border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                    }}/>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: TEXT }}>{a.label}</span>
                    {on && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WINE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setAllergenSheetOpen(false)} style={{
              width: '100%', height: 50, borderRadius: 999, border: 'none',
              background: WINE, color: '#fff', marginTop: 18,
              fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            }}>
              Applica filtri
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order bottom sheet (collapsed/expanded) ───────────────
function OrderSheet({ state, setState, cartCount, cartTotal, mode, setMode, sheetTab, setSheetTab, dishes, setQty, clearCart, onSubmit, goTo }) {
  const expanded = mode === 'expanded';
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
      background: SURF, borderTopLeftRadius: 28, borderTopRightRadius: 28,
      boxShadow: '0 -6px 24px rgba(0,0,0,0.1)',
      maxHeight: expanded ? '78%' : 'auto',
      transition: 'max-height 0.3s ease',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* drag handle */}
      <div onClick={() => setMode(expanded ? 'collapsed' : 'expanded')} style={{
        cursor: 'pointer', padding: '10px 0 6px', display: 'flex', justifyContent: 'center',
      }}>
        <div style={{ width: 50, height: 5, background: WINE, borderRadius: 999, opacity: 0.7 }}/>
      </div>

      {!expanded ? (
        <div style={{ padding: '4px 22px 22px' }}>
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
            width: '100%', height: 52, borderRadius: 999, border: 'none',
            background: cartCount === 0 ? CTA_DEAD : CTA_GRAD, color: '#fff',
            fontSize: 15, fontWeight: 800, fontFamily: 'inherit', letterSpacing: '.01em',
            boxShadow: cartCount === 0 ? 'none' : CTA_GLOW,
            cursor: cartCount === 0 ? 'not-allowed' : 'pointer',
            transition: 'transform 150ms cubic-bezier(.34,1.45,.64,1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <span>Invio ordine</span>
            {cartTotal > 0 && <span style={{ opacity: 0.9 }}>· {cartTotal}€</span>}
          </button>
        </div>
      ) : (
        <>
          {/* Header: contatore + totale + cestino */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 14px' }}>
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
                {cartItems.map(it => (
                  <div key={it.lineId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                    background: BG_GRAY, borderRadius: 12, padding: '10px 12px',
                  }}>
                    <div onClick={() => goTo('dish', { dishId: it.id, lineId: it.lineId })} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{it.name}</div>
                      {it.summary && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                          {it.summary.split(', ').map((tag, i) => (
                            <span key={i} style={{
                              fontSize: 11, fontWeight: 600, color: WINE,
                              background: TINT, padding: '2px 7px', borderRadius: 999,
                            }}>{tag}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: 12.5, color: WINE, fontWeight: 700, marginTop: 5 }}>{it.unitPrice.toFixed(2)}€</div>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: SURF, borderRadius: 999, padding: '3px 6px',
                    }}>
                      <button onClick={() => setQty(it.lineId, it.qty - 1)} style={qtyBtn}><I.Minus size={13}/></button>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 14, textAlign: 'center' }}>{it.qty}</span>
                      <button onClick={() => setQty(it.lineId, it.qty + 1)} style={qtyBtn}><I.Plus size={13} color={TEXT}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dividi piatti — toggle azione secondaria */}
            {cartItems.length > 0 && (
              <button onClick={() => setSheetTab(t => t === 'divisione' ? 'piatti' : 'divisione')} style={{
                width: '100%', marginTop: 14, padding: '10px',
                background: 'transparent', border: `1px solid ${BORDER}`,
                borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 600, color: MUTED,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/>
                </svg>
                Dividi piatti tra i commensali
              </button>
            )}

            {/* Vista divisione (se attiva) */}
            {sheetTab === 'divisione' && cartItems.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cartItems.flatMap(it => Array.from({ length: it.qty }, (_, idx) => ({ ...it, idx }))).map((it, i) => {
                    const splitKey = `${it.lineId}-${it.idx}`;
                    const split = state.splits?.[splitKey];
                    const splitLabel = split
                      ? (split.kind === 'me' ? 'Per me' : split.kind === 'tavolo' ? 'Tavolo' : `${(split.people?.length || 0) + 1} pers.`)
                      : 'Per me';
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT }}>
                            {it.name}{it.qty > 1 && <span style={{ color: MUTED, fontSize: 11, marginLeft: 5 }}>porz. {it.idx + 1}/{it.qty}</span>}
                          </div>
                          {it.summary && <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{it.summary}</div>}
                        </div>
                        <button onClick={() => goTo('split', { item: it, splitKey })} style={{
                          height: 32, padding: '0 12px', borderRadius: 999,
                          border: `1.5px solid ${WINE}`, background: split ? WINE : TINT,
                          fontSize: 12, fontWeight: 700, color: split ? '#fff' : WINE,
                          fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {!split && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={WINE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>}
                          {splitLabel}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '0 22px 20px' }}>
            <button onClick={onSubmit} disabled={cartCount === 0} style={{
              width: '100%', height: 52, borderRadius: 999, border: 'none',
              background: cartCount === 0 ? CTA_DEAD : CTA_GRAD,
              color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: 'inherit',
              letterSpacing: '.01em',
              boxShadow: cartCount === 0 ? 'none' : CTA_GLOW,
              cursor: cartCount === 0 ? 'not-allowed' : 'pointer',
              transition: 'transform 150ms cubic-bezier(.34,1.45,.64,1)',
            }}>Ordina ora · {cartTotal.toFixed(2)}€</button>
          </div>
        </>
      )}
    </div>
  );
}

const qtyBtn = {
  width: 28, height: 28, borderRadius: 999, border: 'none', background: SURF,
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

// ─── SPLIT SCREEN ──────────────────────────────────────────
function SplitScreen({ state, setState, ctx, goBack }) {
  const item = ctx?.item;
  const splitKey = ctx?.splitKey;
  const initial = state.splits?.[splitKey] || { kind: 'me', people: [] };
  const [kind, setKind] = useState(initial.kind);
  const [people, setPeople] = useState(initial.people);

  const defaultParticipants = [
    { id: 'me', name: 'Tu', initials: 'T', isMe: true },
    { id: 'p1', name: 'Marco', initials: 'M' },
    { id: 'p2', name: 'Margherita', initials: 'Mg' },
    { id: 'p3', name: 'Roberto', initials: 'R' },
    { id: 'p4', name: 'Ospite 1', initials: 'O', isGuest: true },
  ];
  const participants = state.participants || defaultParticipants;

  const togglePerson = (id) => {
    if (id === 'me') return; // me always included
    setPeople(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  // Aggiunge un nuovo ospite alla lista partecipanti e lo seleziona
  const addParticipant = () => {
    const ospitiNum = participants.filter(p => p.isGuest).length + 1;
    const newP = {
      id: `p-og-${Date.now()}`,
      name: `Ospite ${ospitiNum}`,
      initials: '?',
      isGuest: true,
    };
    setState(s => ({
      ...s,
      participants: [...(s.participants || defaultParticipants), newP],
    }));
    // Includi nuovo ospite anche se la modalità è "diviso"
    setPeople(p => [...p, newP.id]);
  };

  const save = () => {
    const split = { kind, people: kind === 'diviso' ? people : [] };
    setState(s => ({ ...s, splits: { ...(s.splits || {}), [splitKey]: split } }));
    goBack();
  };

  const splitCount = kind === 'tavolo'
    ? participants.length
    : kind === 'diviso'
      ? people.length + 1
      : 1;
  const perPerson = item ? (item.price / splitCount).toFixed(2) : 0;

  return (
    <div data-screen-label="Divisione piatto" style={{
      width: '100%', height: '100%', background: BG_PAGE, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {(() => { const K = window.ByupKit; return K ? <K.MascotMoment absolute pose="happy" pageKey="split" message="Dividi con un tap. Restate amici." bottom={110} size={118}/> : null; })()}
      {/* Header */}
      <div style={{
        padding: '60px 22px 14px', display: 'flex', alignItems: 'center', gap: 12,
        background: SURF, borderBottom: `1px solid ${BORDER}`,
      }}>
        <button onClick={goBack} style={{
          width: 36, height: 36, borderRadius: 999, background: BG_GRAY,
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><I.Back size={20}/></button>
        <div>
          <div style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>Dividi il piatto</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>{item?.name || 'Piatto'}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 140px' }}>
        {/* Mode selector */}
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Modalità
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <ModeCard active={kind === 'me'} onClick={() => setKind('me')}
            title="Per me" desc="Pago io tutto il piatto" emoji={<img src="assets/mascot-confident.png" width="30" alt=""/>}/>
          <ModeCard active={kind === 'diviso'} onClick={() => setKind('diviso')}
            title="Diviso" desc="Scegli con chi dividere il piatto" emoji={<img src="assets/mascot-happy.png" width="30" alt=""/>}/>
          <ModeCard active={kind === 'tavolo'} onClick={() => setKind('tavolo')}
            title="Tavolo intero" desc={`Diviso tra tutti i ${participants.length} commensali`} emoji={<img src="assets/mascot-waiter.png" width="30" alt=""/>}/>
        </div>

        {/* Participants picker (only for 'diviso') */}
        {kind === 'diviso' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Con chi dividi?
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>
              Tu sei sempre incluso · {people.length + 1} {people.length + 1 === 1 ? 'persona' : 'persone'} selezionate
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {participants.map(p => {
                const sel = p.isMe || people.includes(p.id);
                return (
                  <div key={p.id} onClick={() => togglePerson(p.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 14,
                    background: sel ? SURF : SURF,
                    border: `1.5px solid ${sel ? WINE : BORDER}`,
                    cursor: p.isMe ? 'default' : 'pointer',
                    opacity: p.isMe ? 0.85 : 1,
                  }}>
                    <Avatar name={p.name} initials={p.initials} guest={p.isGuest}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: MUTED }}>
                        {p.isMe ? 'Sempre incluso' : p.isGuest ? 'Ospite (non loggato)' : 'Tramite app'}
                      </div>
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: 999,
                      border: `2px solid ${sel ? WINE : '#d0d0d0'}`,
                      background: sel ? WINE : SURF,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {sel && <I.Check size={14} color="#fff"/>}
                    </div>
                  </div>
                );
              })}
              <button onClick={addParticipant} style={{
                width: '100%', padding: '12px 14px', borderRadius: 14,
                background: SURF, border: `1.5px dashed ${BORDER}`,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 12,
                color: TEXT, fontSize: 14, fontWeight: 700,
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 999, background: TINT,
                  color: WINE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700,
                }}>+</span>
                <span>Aggiungi ospite</span>
                <span style={{ marginLeft: 'auto', fontSize: 11.5, color: MUTED, fontWeight: 500 }}>
                  senza app
                </span>
              </button>
            </div>
          </>
        )}

        {kind === 'tavolo' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Tavolo · {participants.length} persone
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex' }}>
                {participants.map((p, i) => (
                  <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                    <Avatar name={p.name} initials={p.initials} guest={p.isGuest} size={42}/>
                  </div>
                ))}
              </div>
              <button onClick={addParticipant} title="Aggiungi ospite" style={{
                width: 42, height: 42, borderRadius: 999,
                background: SURF, border: `1.5px dashed ${BORDER}`,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: WINE, fontSize: 22, fontWeight: 700, padding: 0, lineHeight: 1,
              }}>+</button>
            </div>
          </>
        )}

        {/* Summary */}
        {item && (
          <div style={{
            marginTop: 24, padding: 16, borderRadius: 16,
            background: SURF, border: `1.5px solid ${BORDER}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: MUTED, marginBottom: 6 }}>
              <span>Prezzo piatto</span><span>{item.price}€</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: MUTED, marginBottom: 10 }}>
              <span>Diviso per</span><span>{splitCount} {splitCount === 1 ? 'persona' : 'persone'}</span>
            </div>
            <div style={{ height: 1, background: BORDER, margin: '4px 0 10px' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: TEXT }}>
              <span>La tua quota</span><span>{perPerson}€</span>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 22px 22px', background: SURF, borderTop: `1px solid ${BORDER}`,
      }}>
        <button onClick={save} style={{
          width: '100%', height: 52, borderRadius: 999, border: 'none',
          background: WINE, color: '#fff', fontSize: 15, fontWeight: 700,
          fontFamily: 'inherit', cursor: 'pointer',
        }}>Conferma divisione</button>
      </div>
    </div>
  );
}

function ModeCard({ active, onClick, title, desc, emoji }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderRadius: 16,
      background: active ? SURF : SURF,
      border: `1.5px solid ${active ? WINE : BORDER}`,
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      width: '100%', position: 'relative',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
        background: active ? TINT : BG_GRAY,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, transition: 'background 0.18s',
      }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{title}</div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 999,
        border: `2px solid ${active ? WINE : '#d0d0d0'}`,
        background: active ? WINE : SURF,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <I.Check size={13} color="#fff"/>}
      </div>
    </button>
  );
}

function Avatar({ name, initials, guest, size = 38 }) {
  const colors = ['#7a4458','#4a6580','#5a7a45','#80654a','#65457a'];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: guest ? '#aaa' : colors[idx],
      color: '#fff', fontSize: size * 0.38, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      border: '2px solid #fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    }}>{initials}</div>
  );
}

// ─── HOME with active order card ───────────────────────────
function HomeScreen({ state, setState, goTo }) {
  const order = state.activeOrder;
  const takeaway = state.takeawayOrder;
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [taExpanded, setTaExpanded] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const covers = order?.covers || (order?.guests?.length || 1);
  const loggedIn = (order?.guests || []).filter(g => g.isApp || g.isWebApp).length;

  const HS = window.HomeSections;
  const [activeCat, setActiveCat] = useState(null);
  const [quickFilters, setQuickFilters] = useState({ openNow: false, near: false, promo: false, top: false });

  const topBar = (
    <div style={{ padding: '12px 12px 0' }}>
      {takeaway ? (
        <TakeawayCard
          order={takeaway}
          expanded={taExpanded}
          setExpanded={setTaExpanded}
          onReorder={() => goTo('menu')}
        />
      ) : order ? (
        <ActiveOrderCard order={order} expanded={orderExpanded} setExpanded={setOrderExpanded}
          goTo={goTo} setState={setState} onOpenGuests={() => setGuestsOpen(true)}/>
      ) : null}
    </div>
  );

  return (
    <div data-screen-label="Home con ordine attivo" style={{
      width: '100%', height: '100%', background: SURF, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 60, paddingBottom: 110 }}>
        {HS ? (
          <HS
            topBar={topBar}
            activeCat={activeCat} setActiveCat={setActiveCat}
            quickFilters={quickFilters} setQuickFilters={setQuickFilters}
            onMap={() => __goApp('map')}
            onPosta={() => __goApp('posta')}
            onSearch={() => __goApp('search')}
            onFilters={() => __goApp()}
            onCardClick={() => __goApp()}
          />
        ) : (
          <>
            {before}
            <div style={{ padding: '40px 22px', textAlign: 'center', color: MUTED }}>
              Caricamento Home…
            </div>
          </>
        )}
      </div>

      {/* Shared bottom tab bar (with QR for re-scanning the menu) */}
      {(() => { const B = window.BottomTabBar; return B ? <B active="home" onHome={() => __goApp()} onProfile={() => __goApp('profile')} onQR={() => goTo('menu')}/> : null; })()}

      {guestsOpen && order && (
        <GuestsSheet
          order={order}
          loggedIn={loggedIn}
          covers={covers}
          onClose={() => setGuestsOpen(false)}
          onAddGuest={() => addGuestToOrder(setState)}
          onRemoveGuest={(id) => removeGuestFromOrder(setState, id)}/>
      )}
    </div>
  );
}

function ActiveOrderCard({ order, expanded, setExpanded, goTo, setState, onOpenGuests }) {
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

  // Stato saldi: filtra item già pagati o già presi da altri loggati
  const paidLineIds = order.paidLineIds || {};
  const isPaidOrClaimed = (i) => !!paidLineIds[i.lineId] || !!i.claimedBy;
  const unpaidItems = order.items.filter(i => !isPaidOrClaimed(i));
  const myPaidLineIds = Object.entries(paidLineIds).filter(([_, by]) => by === 'me').map(([id]) => id);
  const postPay = myPaidLineIds.length > 0;
  const allSettled = unpaidItems.length === 0;
  const unpaidTotal = unpaidItems.reduce((s, i) => s + i.price * i.qty, 0);
  const title = postPay ? 'Da saldare al tavolo' : 'Il tuo ordine';

  return (
    <div style={{
      borderRadius: 22, overflow: 'hidden',
      background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 80%)`,
      color: '#fff', position: 'relative',
      boxShadow: '0 8px 24px rgba(194,24,91,0.35)',
      transition: 'all 0.3s',
    }}>
      {/* sheen */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 220, height: 220,
        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 60%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ padding: '14px 16px 14px', position: 'relative' }}>
        {/* Top row: date/time on left, covers + chevron on right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11.5, opacity: 0.9, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
            {fmtTime(order.startedAt)}
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
              {covers} coperti
            </button>
            <button onClick={() => setExpanded(!expanded)} style={{
              width: 30, height: 30, borderRadius: 999, background: 'rgba(255,255,255,0.18)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(6px)',
            }}>
              {expanded ? <I.ChevDown size={16}/> : <I.ChevUp size={16}/>}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, opacity: 0.9, fontWeight: 500 }}>
            <I.Pin size={13} color="#fff"/> {order.table}
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2, letterSpacing: -0.3 }}>{order.venue}</div>
        </div>

        {/* Status pill quando hai già pagato la tua parte */}
        {postPay && (
          <div style={{
            marginTop: 10, padding: '7px 11px', borderRadius: 999,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11.5, fontWeight: 700, letterSpacing: 0.2,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Hai saldato la tua parte
          </div>
        )}

        {expanded ? (
          <>
            <div style={{
              fontSize: 13, opacity: 0.95, marginTop: 10, lineHeight: 1.4,
            }}>
              {postPay
                ? <>Sono rimasti {unpaidItems.length} piatti senza pagatore. Possono essere saldati da chiunque al tavolo.</>
                : <>Clicca su <span style={{ fontWeight: 700 }}>"Paga ora"</span> per saldare il conto.</>}
            </div>

            <div style={{
              marginTop: 12, padding: '12px 14px', borderRadius: 14,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', opacity: 0.85, marginBottom: 8 }}>
                {title}
              </div>
              {unpaidItems.length === 0 ? (
                <div style={{ fontSize: 13, opacity: 0.95, padding: '4px 0' }}>
                  Tutto saldato.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {unpaidItems.map((i, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, fontSize: 13 }}>
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ opacity: 0.75, fontWeight: 600 }}>{i.qty}×</span> {i.name}
                      </span>
                      <span style={{ fontWeight: 600, opacity: 0.95, flexShrink: 0 }}>{(i.price * i.qty).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', margin: '10px 0' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14 }}>
                <span style={{ fontWeight: 700 }}>{postPay ? 'Da pagare ancora' : 'Totale'}</span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{(postPay ? unpaidTotal : order.total).toFixed(2)}€</span>
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
              <button onClick={() => goTo('pay')} disabled={allSettled} style={{
                flex: 1.2, height: 42, borderRadius: 999, border: 'none',
                background: allSettled ? 'rgba(255,255,255,0.15)' : '#fff',
                color: allSettled ? '#fff' : PINK_DARK,
                fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', cursor: allSettled ? 'default' : 'pointer',
                opacity: allSettled ? 0.6 : 1,
              }}>{postPay ? 'Salda il resto' : 'Paga ora'}</button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => goTo('menu')} style={{
              flex: 1, height: 38, borderRadius: 999,
              border: '1.5px solid rgba(255,255,255,0.55)',
              background: 'transparent', color: '#fff', fontSize: 13.5, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            }}>Ordina ancora</button>
            <button onClick={() => goTo('pay')} disabled={allSettled} style={{
              flex: 1, height: 38, borderRadius: 999, border: 'none',
              background: allSettled ? 'rgba(255,255,255,0.15)' : '#fff',
              color: allSettled ? '#fff' : PINK_DARK,
              fontSize: 13.5, fontWeight: 700,
              fontFamily: 'inherit', cursor: allSettled ? 'default' : 'pointer',
              opacity: allSettled ? 0.6 : 1,
            }}>{postPay ? 'Salda il resto' : 'Paga ora'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAKEAWAY CARD on Home ─────────────────────────────────
function TakeawayCard({ order, expanded, setExpanded, onReorder }) {
  const fmtPickup = order?.pickupTime || '—';
  const itemCount = order?.items?.reduce((s, i) => s + i.qty, 0) || 0;
  const previewItems = order?.items?.slice(0, 2) || [];
  const moreCount = (order?.items?.length || 0) - 2;
  const code = order?.pickupCode || '0000';

  return (
    <div style={{
      borderRadius: 22, overflow: 'hidden',
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
      color: '#fff', position: 'relative',
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    }}>
      {/* sheen */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
        background: 'radial-gradient(circle, rgba(255,138,76,0.32), transparent 65%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ padding: '14px 16px', position: 'relative' }}>
        {/* Top row: badge + chevron */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,138,76,0.25)', color: '#FFD4B8',
            border: '1px solid rgba(255,138,76,0.4)',
            padding: '4px 10px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFD4B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 L18 2 L20 6 L4 6 Z"/>
              <path d="M5 6 L5 20 a 2 2 0 0 0 2 2 L17 22 a 2 2 0 0 0 2 -2 L19 6"/>
            </svg>
            Take Away
          </div>
          <button onClick={() => setExpanded(!expanded)} style={{
            width: 30, height: 30, borderRadius: 999, background: 'rgba(255,255,255,0.12)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            {expanded ? <I.ChevDown size={16}/> : <I.ChevUp size={16}/>}
          </button>
        </div>

        {/* Title block: pickup time + venue */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12.5, opacity: 0.7, fontWeight: 500 }}>Ritiro alle</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.05, marginTop: 2 }}>
            {fmtPickup}
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            da {order?.venue || 'Ristorante'}
          </div>
        </div>

        {expanded && (
          <>
            {/* Codice ritiro - PROMINENTE */}
            <div style={{
              marginTop: 16,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(255,138,76,0.22) 0%, rgba(255,107,53,0.15) 100%)',
              border: '1px solid rgba(255,138,76,0.35)',
              padding: '14px 16px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#FFD4B8', marginBottom: 6 }}>
                Codice ritiro
              </div>
              <div style={{
                fontSize: 40, fontWeight: 900, letterSpacing: 8,
                color: '#fff', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                lineHeight: 1, marginBottom: 8,
              }}>
                {code}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                Quando arrivi, comunica questo codice all'addetto per ritirare il tuo ordine.
              </div>
            </div>

            {/* Recap ordine */}
            <div style={{
              marginTop: 12, padding: '12px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.08)',
              fontSize: 12.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 6, opacity: 0.95, lineHeight: 1.3 }}>
                <span>{itemCount} {itemCount === 1 ? 'piatto' : 'piatti'} · pagati</span>
                <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{order?.total || 0}€</span>
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.7, lineHeight: 1.5, wordBreak: 'break-word' }}>
                {previewItems.map(i => `${i.qty}x ${i.name}`).join(' · ')}
                {moreCount > 0 && ` · +${moreCount} altri`}
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={onReorder} style={{
            width: '100%', height: 42, borderRadius: 999, border: 'none',
            background: SURF, color: BADGE,
            fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          }}>Ordina ancora</button>
        </div>
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
        width: '100%', background: SURF, color: TEXT,
        borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '14px 22px 28px',
        animation: 'slideUp 0.25s cubic-bezier(.2,.9,.3,1)',
        maxHeight: '85%', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: '#e5e0d8', borderRadius: 999, margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.3 }}>Al tavolo</div>
            <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span><span style={{ fontWeight: 800, color: TEXT }}>{totalCoperti}</span> {totalCoperti === 1 ? 'coperto' : 'coperti'}</span>
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
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: MUTESURF }}/>
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
                background: g.isGuest ? MUTESURF : (g.isMe ? PINK : BADGE),
                color: g.isGuest ? MUTED : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
              }}>{g.initial}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>
                  {g.name}{g.isMe && <span style={{ fontSize: 11, color: PINK, marginLeft: 6, fontWeight: 600 }}>(tu)</span>}
                </div>
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>
                  {g.isApp ? "✓ ha l'app" : (g.isWebApp ? '✓ da webapp' : 'ospite — non loggato')}
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
            background: SURF, border: `1.5px dashed ${BORDER}`,
            borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: TEXT, fontSize: 13.5, fontWeight: 700,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 999, background: TINT,
              color: WINE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
            }}>+</span>
            Aggiungi ospite senza app
          </button>
        )}

        {/* Card invito — link al tavolo da condividere */}
        <div style={{
          marginTop: 14, padding: 14, background: TINT, borderRadius: 14,
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
            background: SURF, padding: '6px 6px 6px 12px', borderRadius: 999,
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
          background: BADGE, color: '#fff', marginTop: 14,
          fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
        }}>Chiudi</button>
      </div>
    </div>
  );
}

// ─── ROOT (router) ─────────────────────────────────────────
function DishDetailScreen({ state, setState, ctx, goBack }) {
  const dish = findDish(ctx?.dishId);
  // Se arrivo dal carrello con un lineId, sto MODIFICANDO quella riga
  // (precompilo e aggiorno in place), non aggiungendone una nuova.
  const editLine = ctx?.lineId ? (state.cart || []).find(i => i.lineId === ctx.lineId) : null;
  const isEdit = !!editLine;
  const [expanded, setExpanded] = useState(false);
  const [extras, setExtras] = useState(editLine?.extras || {});
  const [removed, setRemoved] = useState(editLine?.removed || {}); // ingredient -> true
  const [variants, setVariants] = useState(editLine?.variants || {});
  const [nutriOpen, setNutriOpen] = useState(true);
  // Default 1: in aggiunta è la quantità di partenza; in modifica è il MINIMO
  // di "a quante porzioni applicare le modifiche" (la riga ha editLine.qty porzioni).
  const [qty, setQty] = useState(1);

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
  const unitTotal = dish.price + extrasTotal;
  const total = unitTotal * qty;
  const addToCart = () => {
    if (isEdit) {
      const n = editLine.qty;
      const m = qty; // porzioni a cui applico questa personalizzazione (1..n)
      if (m >= n) {
        // Applica a TUTTE → aggiorna la riga in place (mantiene la posizione)
        setState(s => ({ ...s, cart: s.cart.map(i => i.lineId === editLine.lineId ? { ...i, qty: n, variants, extras, removed } : i) }));
      } else {
        // FORK: m porzioni con la nuova personalizzazione, le altre (n−m) restano
        setState(s => {
          let cart = s.cart.map(i => i.lineId === editLine.lineId ? { ...i, qty: n - m } : i);
          const same = (i) =>
            i.dishId === dish.id &&
            JSON.stringify(i.variants || {}) === JSON.stringify(variants) &&
            JSON.stringify(i.extras || {}) === JSON.stringify(extras) &&
            JSON.stringify(i.removed || {}) === JSON.stringify(removed);
          const idx = cart.findIndex(same); // include la riga ridotta → "nessun cambio" si rifonde (no-op)
          if (idx >= 0) cart = cart.map((i, k) => k === idx ? { ...i, qty: i.qty + m } : i);
          else cart = [...cart, { lineId: dish.id + '-' + Date.now(), dishId: dish.id, qty: m, variants, extras, removed }];
          return { ...s, cart };
        });
      }
    } else {
      const lineId = dish.id + '-' + Date.now();
      setState(s => ({ ...s, cart: [...s.cart, { lineId, dishId: dish.id, qty, variants, extras, removed }] }));
    }
    goBack();
  };

  const findPlain = (cart, id) => cart.find(i => i.dishId === id && !Object.keys(i.variants||{}).length && !Object.keys(i.extras||{}).length && !Object.keys(i.removed||{}).length);
  const addDish = (id) => setState(s => {
    const existing = findPlain(s.cart, id);
    if (existing) return { ...s, cart: s.cart.map(i => i.lineId === existing.lineId ? { ...i, qty: i.qty + 1 } : i) };
    return { ...s, cart: [...s.cart, { lineId: id + '-' + Date.now(), dishId: id, qty: 1, variants: {}, extras: {}, removed: {} }] };
  });
  const removeDish = (id) => setState(s => {
    const existing = findPlain(s.cart, id);
    if (!existing) return s;
    if (existing.qty <= 1) return { ...s, cart: s.cart.filter(i => i.lineId !== existing.lineId) };
    return { ...s, cart: s.cart.map(i => i.lineId === existing.lineId ? { ...i, qty: i.qty - 1 } : i) };
  });

  const macroBars = [
    { label: 'Carboidrati', val: dish.macros.carbo, max: 100, color: '#5cc16e' },
    { label: 'Grassi',      val: dish.macros.grassi, max: 60, color: '#f0a050' },
    { label: 'Proteine',    val: dish.macros.prot,   max: 60, color: '#9968c4' },
    { label: 'Fibre',       val: dish.macros.fibre,  max: 25, color: '#e64984' },
  ];

  return (
    <div data-screen-label="Dettaglio piatto" style={{
      width: '100%', height: '100%', background: BG_PAGE, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Back button — fisso sopra tutto */}
      <div style={{ position: 'absolute', top: 56, left: 16, zIndex: 50 }}>
        <button onClick={goBack} style={{
          width: 42, height: 42, borderRadius: 999, background: SURF,
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
            <DishPhoto tone={dish.tone} bestSeller={false} kind={dish.kind} hideBadge label={dish.name.split(' ')[0].toLowerCase()}/>
          )}
          {/* gradient bottom for legibility */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 80,
            background: 'linear-gradient(180deg, transparent, rgba(250,250,247,0.95))',
          }}/>
          {dish.bestSeller && (
            <div style={{
              position: 'absolute', top: 60, right: 16, zIndex: 5,
              background: BADGE, color: '#fff',
              fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
              padding: '7px 11px', borderRadius: 999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}>★ TOP</div>
          )}
          {ctx?.perTe && !dish.bestSeller && (
            <div style={{
              position: 'absolute', top: 60, right: 16, zIndex: 5,
              background: WINE, color: '#fff',
              fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
              padding: '7px 11px', borderRadius: 999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}>✨ PER TE</div>
          )}
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
                    background: out ? TINT : SURF,
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
                        background: SURF, display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, marginBottom: 14, letterSpacing: -0.2 }}>{v.label}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {v.options.map(opt => {
                const sel = variants[v.id] === opt;
                return (
                  <button key={opt} onClick={() => setVariants(vv => ({ ...vv, [v.id]: opt }))}
                    style={{
                      padding: '10px 16px', borderRadius: 999,
                      border: sel ? `1.5px solid ${WINE}` : `1.5px solid ${BORDER}`,
                      background: sel ? WINE : SURF,
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
              borderRadius: 18, background: SURF, padding: 16,
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
                      <div style={{ height: 6, background: TINT, borderRadius: 999, overflow: 'hidden' }}>
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

        {/* Spesso ordinato con */}
        {(() => {
          const others = ALL_DISHES.filter(d => d.id !== dish.id).slice(0, 4);
          if (!others.length) return null;
          return (
            <div style={{ padding: '28px 0 0' }}>
              <div style={{ padding: '0 22px', marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: -0.2 }}>Spesso ordinato con</div>
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>Gli altri clienti hanno aggiunto anche</div>
              </div>
              <div className="hscroll" style={{ display: 'flex', gap: 10, padding: '0 22px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {others.map(d => {
                  const plain = state.cart.find(i => i.dishId === d.id && !Object.keys(i.variants||{}).length && !Object.keys(i.extras||{}).length && !Object.keys(i.removed||{}).length);
                  const qty = plain ? plain.qty : 0;
                  const inCart = qty > 0;
                  const stepBtn = {
                    width: 28, height: 28, borderRadius: 999, border: 'none', background: TINT,
                    color: WINE, fontSize: 18, fontWeight: 700, lineHeight: 1, fontFamily: 'inherit',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  };
                  return (
                    <div key={d.id} onClick={inCart ? undefined : () => addDish(d.id)} style={{
                      flex: '0 0 auto', width: 130, borderRadius: 14,
                      overflow: 'hidden', cursor: inCart ? 'default' : 'pointer', position: 'relative',
                      boxShadow: inCart ? `0 2px 10px rgba(90,26,46,0.22)` : '0 1px 4px rgba(0,0,0,0.05)',
                      border: inCart ? `2px solid ${WINE}` : '2px solid transparent',
                      background: inCart ? TINT : SURF,
                      transition: 'all 0.18s',
                    }}>
                      <div style={{ height: 90, overflow: 'hidden', position: 'relative' }}>
                        {d.photo ? (
                          <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: inCart ? 0.85 : 1 }}/>
                        ) : (
                          <DishPhoto tone={d.tone} kind={d.kind} hideBadge label={d.name.split(' ')[0].toLowerCase()}/>
                        )}
                        {inCart && (
                          <div style={{
                            position: 'absolute', top: 6, right: 6,
                            width: 22, height: 22, borderRadius: 999,
                            background: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '8px 10px 10px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: inCart ? WINE : TEXT, lineHeight: 1.2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                        {inCart ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
                            <button onClick={(e) => { e.stopPropagation(); removeDish(d.id); }} title={qty <= 1 ? 'Rimuovi' : 'Riduci'} style={stepBtn}>−</button>
                            <span style={{ fontSize: 14, fontWeight: 800, color: WINE }}>{qty}</span>
                            <button onClick={(e) => { e.stopPropagation(); addDish(d.id); }} title="Aggiungi" style={stepBtn}>+</button>
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: MUTED, fontWeight: 400, marginTop: 3 }}>Tocca per aggiungere</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Il selettore "a quante porzioni applicare le modifiche" vive ora
            nella barra CTA in basso (vedi sotto). */}
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 22px 22px', background: SURF, borderTop: `1px solid ${BORDER}`,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Domanda — solo in modifica di una riga con più porzioni */}
        {isEdit && editLine.qty > 1 && (
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, textAlign: 'center' }}>
            A quante porzioni applicare le modifiche?
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Stepper quantità — in AGGIUNTA (qty libera) */}
          {!isEdit && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, height: 56, flex: '0 0 auto',
              borderRadius: 999, border: `1px solid ${BORDER}`, padding: '0 6px', background: SURF,
            }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} style={{
                width: 38, height: 38, borderRadius: 999, border: 'none', background: TINT,
                color: TEXT, fontSize: 22, fontWeight: 700, lineHeight: 1, fontFamily: 'inherit',
                cursor: qty <= 1 ? 'default' : 'pointer', opacity: qty <= 1 ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>−</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontSize: 16, fontWeight: 800, color: TEXT }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{
                width: 38, height: 38, borderRadius: 999, border: 'none', background: TINT,
                color: TEXT, fontSize: 22, fontWeight: 700, lineHeight: 1, fontFamily: 'inherit',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
          )}
          {/* Stepper "X di N" — in MODIFICA di una riga con più porzioni */}
          {isEdit && editLine.qty > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, height: 56, flex: '0 0 auto',
              borderRadius: 999, border: `1px solid ${BORDER}`, padding: '0 8px', background: SURF,
            }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} style={{
                width: 38, height: 38, borderRadius: 999, border: 'none', background: TINT,
                color: TEXT, fontSize: 22, fontWeight: 700, lineHeight: 1, fontFamily: 'inherit',
                cursor: qty <= 1 ? 'default' : 'pointer', opacity: qty <= 1 ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>−</button>
              <span style={{ minWidth: 48, textAlign: 'center', fontSize: 15, fontWeight: 800, color: TEXT, whiteSpace: 'nowrap' }}>{qty} di {editLine.qty}</span>
              <button onClick={() => setQty(q => Math.min(editLine.qty, q + 1))} disabled={qty >= editLine.qty} style={{
                width: 38, height: 38, borderRadius: 999, border: 'none', background: TINT,
                color: TEXT, fontSize: 22, fontWeight: 700, lineHeight: 1, fontFamily: 'inherit',
                cursor: qty >= editLine.qty ? 'default' : 'pointer', opacity: qty >= editLine.qty ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
          )}
          <button onClick={addToCart} style={{
            flex: 1, height: 56, borderRadius: 999, border: 'none',
            background: WINE, color: '#fff',
            fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: isEdit ? 'center' : 'space-between', padding: '0 24px',
            boxShadow: `0 4px 16px ${WINE}40`,
          }}>
            <span>{isEdit ? 'Aggiorna ordine' : "Aggiungi all'ordine"}</span>
            {!isEdit && <span>{total.toFixed(total % 1 === 0 ? 0 : 2)}€</span>}
          </button>
        </div>
      </div>

    </div>
  );
}

// ─── PAYMENT FLOW ──────────────────────────────────────────
// Metodo di pagamento selezionato (id → etichetta mostrata nel riepilogo)
function payMethodName(id) {
  switch (id) {
    case 'paypal': return 'PayPal';
    case 'klarna': return 'Klarna';
    case 'card': return 'Carta · Visa •••• 4242';
    default: return 'Apple Pay · Visa •••• 4242';
  }
}

// Saldo del tavolo a importi parziali: `order.settled` = { lineId: importo già pagato }.
// Una riga è saldata quando l'importo pagato copre il suo totale. Le righe in
// `paidLineIds` (stato iniziale) valgono come saldate per intero.
function seedSettled(order) {
  const base = {};
  Object.keys(order.paidLineIds || {}).forEach(id => {
    const it = order.items.find(x => x.lineId === id);
    base[id] = it ? it.price * it.qty : 0;
  });
  return { ...base, ...(order.settled || {}) };
}
function lineRemaining(order, it, settled = seedSettled(order)) {
  return Math.max(0, it.price * it.qty - (settled[it.lineId] || 0));
}
function tableRemaining(order) {
  const settled = seedSettled(order);
  return order.items.reduce((s, it) => s + lineRemaining(order, it, settled), 0);
}
function applyPayments(setState, payments) {
  setState(s => {
    const ord = s.activeOrder;
    if (!ord) return s;
    const settled = seedSettled(ord);
    payments.forEach(({ lineId, amount }) => {
      const it = ord.items.find(x => x.lineId === lineId);
      const lt = it ? it.price * it.qty : 0;
      settled[lineId] = Math.min(lt, (settled[lineId] || 0) + amount);
    });
    const paidLineIds = { ...(ord.paidLineIds || {}) };
    ord.items.forEach(it => {
      const lt = it.price * it.qty;
      if ((settled[it.lineId] || 0) >= lt - 0.001 && !paidLineIds[it.lineId]) paidLineIds[it.lineId] = 'me';
    });
    return { ...s, activeOrder: { ...ord, settled, paidLineIds } };
  });
}

function PaymentScreen({ state, setState, goTo, goBack }) {
  const order = state.activeOrder;
  if (!order) return <div style={{padding: 80, textAlign: 'center', color: MUTED}}>Nessun ordine attivo.</div>;

  // mode: 'mine' (la mia parte) | 'all' (tutto il tavolo) — di default 'mine',
  // 'all' si attiva tappando la CTA secondaria "Paga per tutto il tavolo"
  const [mode, setMode] = useState('mine');
  // selectedExtras: lineId -> true (piatti di altri che voglio pagare io)
  const [selectedExtras, setSelectedExtras] = useState(state.payingExtras || {});
  // open accordion per owner
  const [openOwners, setOpenOwners] = useState({});
  // mancia: percentuale (0 | 0.05 | 0.1) oppure arrotondamento all'euro
  // successivo (tipRound). Mutuamente esclusivi.
  const [tipPct, setTipPct] = useState(0); // 0, 0.05, 0.10
  const [tipRound, setTipRound] = useState(false);
  // overlay di caricamento durante il pagamento
  const [paying, setPaying] = useState(false);
  const [splitInfo, setSplitInfo] = useState(null);
  const [confirmRejectSplit, setConfirmRejectSplit] = useState(null);
  // Recap collassabile: tap sull'handle in alto al pannello di pagamento per nascondere
  // dettagli (subtotale, mancia, metodo) e mostrare solo la CTA "Paga ora".
  const [recapCollapsed, setRecapCollapsed] = useState(false);
  // Sheet "Al tavolo": apre la lista commensali con badge ✓ ha l'app / ospite
  const [guestsOpen, setGuestsOpen] = useState(false);

  const rejectSplit = (item) => {
    // Rimuove "me" da splitWith e cambia ownerId al proponente (primo dei splitWith)
    setState(s => {
      if (!s.activeOrder) return s;
      const newItems = s.activeOrder.items.map(i => {
        if (i.lineId !== item.lineId) return i;
        const proposerId = (i.splitWith || [])[0] || i.ownerId;
        return { ...i, ownerId: proposerId, splitWith: [] };
      });
      return { ...s, activeOrder: { ...s.activeOrder, items: newItems } };
    });
    setSplitInfo(null);
    setConfirmRejectSplit(null);
  };

  const paidLineIds = order.paidLineIds || {};
  const isPaid = (lineId) => !!paidLineIds[lineId];
  // Lock real-time: righe che qualcuno sta pagando adesso. Congelate: non apribili,
  // non selezionabili, finché il pagamento in corso non si conclude o il lock scade.
  const lockedLineIds = order.lockedLineIds || {};
  const isLocked = (lineId) => !!lockedLineIds[lineId];
  // Metodo di pagamento scelto (modificabile da "Cambia" → PayMethodScreen)
  const payMethod = state.payMethod || 'apple';

  // Piatti del tavolo (aggiunti dal cameriere). Mostro solo quelli ancora aperti.
  // Il "+" aggiunge il piatto a "Aggiunti al tuo conto" via selectedExtras (come per
  // i piatti offerti agli altri): un'unica lista di ciò che pago io.
  const tableItems = order.items.filter(i => i.ownerId === 'table' && !isPaid(i.lineId));
  const [tableOpen, setTableOpen] = useState(false);
  // Una volta che un piatto del tavolo è aggiunto al mio conto sparisce da qui e vive
  // solo in "Aggiunti al tuo conto" (un oggetto, un posto).
  const tablePending = tableItems.filter(i => !selectedExtras[i.lineId]);
  const tablePendingTotal = tablePending.reduce((s, i) => s + i.price * i.qty, 0);
  // Piatti del tavolo ancora da assegnare (né presi da altri, né in pagamento)
  const tableUnclaimed = tablePending.filter(i => !i.claimedBy && !isLocked(i.lineId)).length;

  // Stili condivisi dei pulsanti tondi +/− (coerenti in tutte le sezioni):
  // "+" = contorno vino su bianco; "−"/attivo = pieno vino.
  const addBtnStyle = {
    width: 32, height: 32, borderRadius: 999, flexShrink: 0,
    border: `1.5px solid ${WINE}`, background: SURF, color: WINE,
    fontSize: 20, fontWeight: 500, lineHeight: 1, cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const removeBtnStyle = { ...addBtnStyle, border: 'none', background: WINE, color: '#fff' };

  // Divisione dei soli piatti presi dal tavolo (in "Aggiunti al tuo conto").
  //   tableSplits: lineId -> { kind: 'table' }                → in parti uguali tra tutti i commensali
  //                          { kind: 'split', people: [ids] }  → tra me + commensali scelti
  //   assente → lo pago io per intero
  const [tableSplits, setTableSplits] = useState({});
  // splitDish: bozza del popup di divisione { lineId, kind: 'me'|'table'|'split', people: [ids] }
  const [splitDish, setSplitDish] = useState(null);
  const otherGuests = (order.guests || []).filter(g => g.id !== 'me');
  const tableCount = Math.max(1, (order.guests || []).length);
  const openSplitDish = (item) => {
    const cur = tableSplits[item.lineId];
    setSplitDish({ lineId: item.lineId, kind: cur?.kind || 'me', people: cur?.people || [] });
  };
  const confirmSplitDish = () => {
    setTableSplits(s => {
      const n = { ...s };
      if (splitDish.kind === 'me' || (splitDish.kind === 'split' && splitDish.people.length === 0)) {
        delete n[splitDish.lineId]; // pago io per intero
      } else {
        n[splitDish.lineId] = splitDish.kind === 'table'
          ? { kind: 'table' }
          : { kind: 'split', people: splitDish.people };
      }
      return n;
    });
    setSplitDish(null);
  };

  // In caso di rientro post-pagamento parziale: escludo i miei piatti già saldati
  const myItems = order.items.filter(i => i.ownerId === 'me' && !isPaid(i.lineId));
  const otherItems = order.items.filter(i => i.ownerId !== 'me' && i.ownerId !== 'table');

  // Group other items by ownerId (no più table — gestito automaticamente)
  const groupByOwner = {};
  otherItems.forEach(i => {
    if (!groupByOwner[i.ownerId]) groupByOwner[i.ownerId] = [];
    groupByOwner[i.ownerId].push(i);
  });

  const ownerLabel = (oid) => {
    if (oid === 'table') return 'Per il tavolo';
    const g = order.guests.find(x => x.id === oid);
    if (!g) return 'Sconosciuto';
    return g.isGuest ? g.name : g.name;
  };
  const ownerSub = (oid) => {
    if (oid === 'table') return 'Aggiunto dal cameriere';
    const g = order.guests.find(x => x.id === oid);
    if (!g) return '';
    return g.isApp ? "✓ ha l'app" : 'ospite — non loggato';
  };

  const toggleOwner = (oid) => setOpenOwners(o => ({ ...o, [oid]: !o[oid] }));
  const toggleExtra = (lineId) => setSelectedExtras(s => {
    const n = { ...s };
    if (n[lineId]) {
      delete n[lineId];
      // tolto dal conto: scordo l'eventuale divisione impostata
      setTableSplits(ts => { if (!ts[lineId]) return ts; const m = { ...ts }; delete m[lineId]; return m; });
    } else n[lineId] = true;
    return n;
  });
  const addAllOwner = (oid) => {
    setSelectedExtras(s => {
      const n = { ...s };
      // Salta i piatti già pagati o congelati da un pagamento in corso
      (groupByOwner[oid] || []).forEach(i => { if (!isPaid(i.lineId) && !isLocked(i.lineId)) n[i.lineId] = true; });
      return n;
    });
  };

  const myShareOf = (it) => {
    const splitN = (it.splitWith?.length || 0) + 1;
    return (it.price * it.qty) / splitN;
  };
  const myDishesTotal = myItems.reduce((s, i) => s + myShareOf(i), 0);
  const extraItems = order.items.filter(i => selectedExtras[i.lineId]);
  // Quota che pago io di un piatto aggiunto: intero, salvo i piatti del tavolo divisi.
  const extraShareFor = (it) => {
    const lineTotal = it.price * it.qty;
    if (it.ownerId !== 'table') return lineTotal;
    const sp = tableSplits[it.lineId];
    if (!sp) return lineTotal;
    if (sp.kind === 'table') return lineTotal / tableCount;
    if (sp.kind === 'split') return lineTotal / ((sp.people?.length || 0) + 1);
    return lineTotal;
  };
  const extraTotal = extraItems.reduce((s, i) => s + extraShareFor(i), 0);
  const tableTotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);

  // coperto: 2€ per persona; in 'mine' paghi solo il tuo, in 'all' paghi per tutti.
  // Su rientro post-pagamento parziale il mio coperto è già saldato.
  const COVER = 2;
  const covers = order.covers || (order.guests?.length || 1);
  const myCoverPaid = Object.values(paidLineIds).some(by => by === 'me');
  const myCover = myCoverPaid ? 0 : COVER;
  const allCovers = COVER * covers;

  const subtotal = mode === 'mine' ? (myDishesTotal + extraTotal) : tableTotal;
  const cover = mode === 'mine' ? myCover : allCovers;
  const baseForTip = subtotal + cover;
  // Arrotondamento "salva-mancia": porta il totale alla cifra tonda in euro
  // successiva, la differenza diventa mancia. 0 se la base è già tonda.
  const baseRounded = Math.round(baseForTip * 100) / 100;
  const roundUpTip = Math.round((Math.ceil(baseRounded) - baseRounded) * 100) / 100;
  const tipAmount = tipRound ? roundUpTip : baseForTip * tipPct;
  const total = baseForTip + tipAmount;

  const proceed = () => {
    // Costruisco i pagamenti per-riga con l'importo effettivo (quota), non l'intero.
    const settled = seedSettled(order);
    const payments = [];
    if (mode === 'all') {
      order.items.forEach(it => {
        const rem = lineRemaining(order, it, settled);
        if (rem > 0.001) payments.push({ lineId: it.lineId, amount: rem });
      });
    } else {
      myItems.forEach(it => payments.push({ lineId: it.lineId, amount: myShareOf(it) }));
      extraItems.forEach(it => payments.push({ lineId: it.lineId, amount: extraShareFor(it) }));
    }
    const remBefore = tableRemaining(order);
    const paidNow = payments.reduce((s, p) => s + p.amount, 0);
    applyPayments(setState, payments);
    setState(s => ({
      ...s,
      payingExtras: selectedExtras,
      payTotal: total,
      payMode: mode,
      payTip: tipAmount,
      payCover: cover,
    }));
    // Se il saldo del tavolo è azzerato → successo; altrimenti vai alla schermata saldo.
    goTo(remBefore - paidNow <= 0.01 ? 'success' : 'balance');
  };

  // "Paga ora": niente conferma "stai offrendo", mostra il caricamento (5s) e procede.
  const payNow = () => {
    if (paying || total <= 0) return;
    setPaying(true);
    setTimeout(() => { proceed(); }, 5000);
  };

  return (
    <div data-screen-label="Pagamento" style={{
      width: '100%', height: '100%', background: BG_PAGE, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header fisso: back + titolo + avatar, sempre visibile anche scrollando */}
      <div style={{
        flexShrink: 0, paddingTop: 60, background: BG_PAGE,
        position: 'relative', zIndex: 5, boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      }}>
        {/* Header con back + titolo */}
        <div style={{ padding: '8px 22px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={goBack} style={{
            width: 40, height: 40, borderRadius: 999, background: SURF,
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0,
          }}><I.Back size={18}/></button>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4, lineHeight: 1.1 }}>Il tuo conto</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{order.table} · {order.venue}</div>
          </div>
        </div>

        {/* Strip coperti — tap per vedere chi è loggato */}
        <div style={{ padding: '18px 22px 16px' }}>
          <button onClick={() => setGuestsOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'transparent', border: 'none', padding: 0,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
              {(order.guests || []).slice(0, 4).map((g, i) => (
                <div key={g.id} style={{
                  width: 30, height: 30, borderRadius: 999,
                  background: (g.isApp || g.isWebApp) ? BADGE : '#ebe3d6',
                  color: (g.isApp || g.isWebApp) ? '#fff' : MUTED,
                  border: '2.5px solid #FBF4F1', marginLeft: -10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11.5, fontWeight: 700,
                }}>{g.initial || '?'}</div>
              ))}
              {(order.guests?.length || 0) > 4 && (
                <div style={{
                  width: 30, height: 30, borderRadius: 999, background: MUTESURF,
                  border: '2.5px solid #FBF4F1', marginLeft: -10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: MUTED,
                }}>+{order.guests.length - 4}</div>
              )}
            </div>
            <div style={{ fontSize: 13, color: MUTED, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span><span style={{ fontWeight: 700, color: TEXT }}>{(order.guests?.length || 0)}</span> al tavolo</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Contenuto scrollabile */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 280 }}>
        {/* I miei piatti — nascosta in rientro post-pagamento quando non c'è nulla di mio rimasto */}
        {!(mode === 'mine' && myItems.length === 0 && extraItems.length === 0 && tableItems.length > 0) && (
        <div style={{ padding: '24px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4 }}>
              {mode === 'all' ? 'Tutto il tavolo' : 'I miei piatti'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>
              {(mode === 'all' ? tableTotal : myDishesTotal).toFixed(2)}€
            </div>
          </div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>
            {mode === 'all'
              ? 'Stai offrendo tu il conto. Bel gesto.'
              : (myItems.length === 0 && myCoverPaid
                ? 'Hai già saldato i tuoi piatti.'
                : `${myItems.length} ${myItems.length === 1 ? 'piatto che hai ordinato' : 'piatti che hai ordinato'}.`)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(mode === 'all' ? order.items : myItems).map(it => {
              const paid = isPaid(it.lineId);
              const splitN = (it.splitWith?.length || 0) + 1;
              const isShared = splitN > 1;
              const myShare = isShared ? (it.price * it.qty) / splitN : it.price * it.qty;
              const sharedNames = isShared
                ? (it.splitWith || []).map(gid => order.guests.find(g => g.id === gid)?.name?.split(' ')[0] || '?').join(', ')
                : '';
              return (
                <div key={it.lineId} style={{
                  background: paid ? TINT : SURF, borderRadius: 14, padding: '14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: paid ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                  border: paid ? '1px solid #d4e9dc' : '1px solid transparent',
                }}>
                  {paid && (
                    <div style={{
                      width: 24, height: 24, borderRadius: 999, background: '#1c8c5b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: paid ? MUTED : TEXT }}>{it.name}</div>
                    {isShared && !paid && mode === 'mine' && (
                      <div
                        onClick={(e) => { e.stopPropagation(); setSplitInfo({ item: it, names: sharedNames, splitN, myShare }); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: TINT, color: WINE,
                          padding: '3px 9px', borderRadius: 999,
                          fontSize: 11, fontWeight: 700, marginTop: 4,
                          letterSpacing: 0.2, cursor: 'pointer',
                        }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Diviso in {splitN}
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 1, opacity: 0.7 }}>
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="16" x2="12" y2="12"/>
                          <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                      </div>
                    )}
                    {!isShared && paid && (
                      <div style={{ fontSize: 12, color: '#1c8c5b', marginTop: 3, fontWeight: 700 }}>
                        ✓ già pagato
                      </div>
                    )}
                    {!isShared && !paid && it.qty > 1 && (
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
                        {it.qty}× · {it.price}€ cad.
                      </div>
                    )}
                    {isShared && paid && (
                      <div style={{ fontSize: 12, color: '#1c8c5b', marginTop: 3, fontWeight: 700 }}>
                        ✓ già pagato
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: paid ? MUTED : TEXT }}>
                      {(mode === 'mine' ? myShare : it.price * it.qty).toFixed(2)}€
                    </div>
                    {isShared && mode === 'mine' && !paid && (
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 1, fontWeight: 500 }}>
                        ({(it.price * it.qty).toFixed(0)}€ tot)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {myItems.length === 0 && tableItems.length === 0 && (
              <div style={{
                background: SURF, borderRadius: 14, padding: '28px 18px',
                fontSize: 13.5, color: MUTED, textAlign: 'center',
              }}>
                <div style={{ fontSize: 30, color: '#1c8c5b', marginBottom: 6 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Niente da pagare</div>
                <div>Non hai piatti tuoi sul conto.</div>
              </div>
            )}
                {extraItems.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 14, marginBottom: 4 }}>
                      Aggiunti al tuo conto
                    </div>
                    {extraItems.map(it => {
                      const isTable = it.ownerId === 'table';
                      const sp = isTable ? tableSplits[it.lineId] : null;
                      const lineTotal = it.price * it.qty;
                      const share = extraShareFor(it);
                      const splitLabel = !sp ? 'Dividi'
                        : sp.kind === 'table' ? 'Diviso col tavolo'
                        : `Diviso in ${(sp.people?.length || 0) + 1}`;
                      return (
                      <div key={'x-'+it.lineId} style={{
                        background: SURF, borderRadius: 14, padding: '14px',
                        border: `1px solid ${WINE}30`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{it.name}</div>
                          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                            {isTable ? 'Dal tavolo' : `Da ${ownerLabel(it.ownerId)}`} · {lineTotal.toFixed(2)}€
                            {sp && <span style={{ color: WINE, fontWeight: 700 }}> · tua quota {share.toFixed(2)}€</span>}
                          </div>
                          {isTable && (
                            <button onClick={() => openSplitDish(it)} style={{
                              marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '5px 10px', borderRadius: 999,
                              background: sp ? WINE : SURF,
                              border: `1.5px solid ${WINE}`,
                              color: sp ? '#fff' : WINE,
                              fontSize: 11.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                              </svg>
                              {splitLabel}
                            </button>
                          )}
                        </div>
                        <button onClick={() => toggleExtra(it.lineId)} aria-label="Togli dal mio conto" style={removeBtnStyle}>−</button>
                      </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
            )}

            {/* Ordini del tavolo — piatti aggiunti dal cameriere, da assegnare */}
            {mode === 'mine' && tablePending.length > 0 && (
              <div style={{ padding: '28px 22px 0' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4, marginBottom: 4 }}>
                  Ordini del tavolo
                </div>
                <div style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>
                  Tocca <span style={{ fontWeight: 700, color: WINE }}>+</span> sui piatti che vuoi pagare tu.
                </div>
                <div style={{
                  background: SURF, borderRadius: 14, overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div onClick={() => setTableOpen(o => !o)} style={{
                    padding: '14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 999,
                      background: TINT, color: WINE,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7h18M5 7v12h14V7M9 11v4M15 11v4"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
                        Aggiunti dal cameriere
                      </div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>
                        {tablePendingTotal.toFixed(2)}€ totali
                      </div>
                    </div>
                    {tableUnclaimed > 0 && !tableOpen && (
                      <div style={{
                        background: WINE, color: '#fff',
                        fontSize: 11, fontWeight: 800, padding: '3px 8px',
                        borderRadius: 999, marginRight: 4,
                      }}>{tableUnclaimed}</div>
                    )}
                    <div style={{ transform: tableOpen ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                      <I.ChevDown color={MUTED} size={16}/>
                    </div>
                  </div>
                  {tableOpen && (
                    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {tablePending.map(it => {
                          const claimedByOther = it.claimedBy && order.guests.find(g => g.id === it.claimedBy);
                          const locked = isLocked(it.lineId);
                          const disabled = claimedByOther || locked;

                          return (
                            <div key={it.lineId} style={{
                              background: disabled ? TINT : SURF,
                              borderRadius: 14, padding: '14px',
                              border: `1px solid ${BORDER}`,
                              boxShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                              opacity: disabled ? 0.7 : 1,
                              display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{it.name}</div>
                                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                                  {claimedByOther
                                    ? `Già preso da ${claimedByOther.name.split(' ')[0]}`
                                    : locked
                                    ? 'In pagamento…'
                                    : `${it.price.toFixed(2)}€`}
                                </div>
                              </div>
                              {claimedByOther ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c8c5b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              ) : locked ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                              ) : (
                                <button onClick={() => toggleExtra(it.lineId)} aria-label="Aggiungi al mio conto" style={addBtnStyle}>+</button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Aggiungi al mio conto */}
            {mode === 'mine' && Object.keys(groupByOwner).length > 0 && (
              <div style={{ padding: '28px 22px 0' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4, marginBottom: 4 }}>
                  Offri agli altri
                </div>
                <div style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>
                  Vuoi offrire qualcosa? Scegli i piatti degli altri che paghi tu.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(groupByOwner).map(([oid, items]) => {
                    const open = !!openOwners[oid];
                    const unpaidItems = items.filter(i => !isPaid(i.lineId));
                    // openItems: piatti su cui posso agire (non pagati, non in pagamento)
                    const openItems = unpaidItems.filter(i => !isLocked(i.lineId));
                    const allPaid = unpaidItems.length === 0;
                    // allLocked: tutto il resto del suo ordine è in pagamento adesso → bloccato
                    const allLocked = !allPaid && openItems.length === 0;
                    const frozen = allPaid || allLocked; // accordion non apribile
                    const allSelected = openItems.length > 0 && openItems.every(i => selectedExtras[i.lineId]);
                    const selectedCount = items.filter(i => selectedExtras[i.lineId] && !isPaid(i.lineId)).length;
                    const openTotal = openItems.reduce((s, i) => s + i.price * i.qty, 0);
                    const guest = order.guests.find(g => g.id === oid);
                    return (
                      <div key={oid} style={{
                        background: SURF, borderRadius: 14, overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        opacity: frozen ? 0.7 : 1,
                      }}>
                        <div onClick={() => !frozen && toggleOwner(oid)} style={{
                          padding: '14px', display: 'flex', alignItems: 'center', gap: 12,
                          cursor: frozen ? 'default' : 'pointer',
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 999,
                            background: oid === 'table' ? TINT : (guest?.isGuest ? '#ebe3d6' : BADGE),
                            color: oid === 'table' ? WINE : (guest?.isGuest ? MUTED : '#fff'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, position: 'relative',
                          }}>
                            {oid === 'table' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 7h18M5 7v12h14V7M9 11v4M15 11v4"/>
                              </svg>
                            ) : (guest?.initial || '?')}
                            {allPaid && (
                              <div style={{
                                position: 'absolute', bottom: -3, right: -3,
                                width: 16, height: 16, borderRadius: 999,
                                background: '#1c8c5b', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid #fff',
                              }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </div>
                            )}
                            {allLocked && (
                              <div style={{
                                position: 'absolute', bottom: -3, right: -3,
                                width: 16, height: 16, borderRadius: 999,
                                background: MUTED, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid #fff',
                              }}>
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{ownerLabel(oid)}</div>
                            <div style={{ fontSize: 12, color: allPaid ? '#1c8c5b' : MUTED, marginTop: 1, fontWeight: allPaid ? 700 : 500 }}>
                              {allPaid
                                ? 'Ha già pagato la sua parte'
                                : allLocked
                                ? 'Sta pagando la sua parte…'
                                : selectedCount > 0
                                ? `${selectedCount}/${openItems.length} aggiunti · ${items.filter(i => selectedExtras[i.lineId] && !isPaid(i.lineId)).reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}€`
                                : `${openItems.length} piatti · ${openTotal.toFixed(2)}€`}
                            </div>
                          </div>
                          {!frozen && (
                            <div style={{ transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                              <I.ChevDown color={MUTED} size={16}/>
                            </div>
                          )}
                        </div>
                        {open && !frozen && (
                          <div style={{ padding: '0 14px 14px' }}>
                            <button onClick={() => addAllOwner(oid)} disabled={allSelected} style={{
                              width: '100%', padding: '8px 12px', borderRadius: 999,
                              background: allSelected ? '#ebe3d6' : WINE,
                              color: allSelected ? MUTED : '#fff',
                              border: 'none', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit',
                              cursor: allSelected ? 'default' : 'pointer', marginBottom: 8,
                            }}>{allSelected ? 'Già tutti aggiunti' : `Offri tutto (${openTotal.toFixed(2)}€)`}</button>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              {items.map(i => {
                                const paid = isPaid(i.lineId);
                                const locked = !paid && isLocked(i.lineId);
                                const sel = !!selectedExtras[i.lineId];
                                return (
                                  <div key={i.lineId} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 0', borderTop: `1px solid ${BORDER}`,
                                    opacity: paid || locked ? 0.5 : 1,
                                  }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, textDecoration: paid ? 'line-through' : 'none' }}>{i.name}</div>
                                      <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>
                                        {paid ? '✓ già pagato' : locked ? 'In pagamento…' : `${i.price}€${i.qty > 1 ? ` × ${i.qty}` : ''}`}
                                      </div>
                                    </div>
                                    {paid ? null : locked ? (
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: 7 }}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                      </svg>
                                    ) : (
                                      <button onClick={() => toggleExtra(i.lineId)} aria-label={sel ? 'Togli dal mio conto' : 'Aggiungi al mio conto'} style={sel ? removeBtnStyle : addBtnStyle}>{sel ? '−' : '+'}</button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Offri tutto il tavolo */}
            {mode === 'mine' && otherItems.length > 0 && (
              <div style={{ padding: '24px 22px 0' }}>
                <button onClick={() => setMode('all')} style={{
                  width: '100%', background: SURF, borderRadius: 14,
                  padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 14,
                  border: `1.5px dashed ${WINE}40`, cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: TINT, color: WINE,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: -0.2 }}>
                      Offri tutto il tavolo
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>
                      Paghi tu il conto intero per tutti
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: WINE }}>
                      {tableTotal.toFixed(2)}€
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2, fontWeight: 600 }}>→</div>
                  </div>
                </button>
              </div>
            )}

            {/* Torna a "la mia parte" se in mode all */}
            {mode === 'all' && (
              <div style={{ padding: '20px 22px 0', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setMode('mine')} style={{
                  padding: '10px 20px', background: SURF, border: `1.5px solid ${BORDER}`,
                  borderRadius: 999, fontSize: 13, color: TEXT, fontWeight: 600, fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Torna a "La mia parte"
                </button>
              </div>
            )}
      </div>

      {/* Receipt sticky bottom */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: SURF, borderTop: `1px solid ${BORDER}`,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}>
        {/* Handle per collassare/espandere il pannello */}
        <button onClick={() => setRecapCollapsed(c => !c)} style={{
          width: '100%', padding: '8px 0 6px', background: 'transparent',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }} aria-label={recapCollapsed ? 'Mostra dettagli' : 'Nascondi dettagli'}>
          <span style={{
            width: 40, height: 4, borderRadius: 999, background: '#d8d2c4',
          }}/>
          {recapCollapsed && (
            <span style={{ fontSize: 10.5, color: MUTED, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>
              Mostra dettagli
            </span>
          )}
        </button>

        {/* Recap integrato con mancia inline */}
        {!recapCollapsed && (
        <>
        <div style={{ padding: '6px 16px 8px', fontSize: 13 }}>
          {(mode === 'all' || subtotal > 0) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: MUTED, marginBottom: 6 }}>
              <span>{mode === 'all' ? 'Tutto il tavolo' : (extraTotal > 0 ? 'I miei piatti + offerti' : 'I miei piatti')}</span>
              <span style={{ fontWeight: 600, color: TEXT }}>{subtotal.toFixed(2)}€</span>
            </div>
          )}
          {cover > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: MUTED, marginBottom: 6 }}>
              <span>Coperto{mode === 'all' ? ` × ${covers}` : ''}</span>
              <span style={{ fontWeight: 600, color: TEXT }}>{cover.toFixed(2)}€</span>
            </div>
          )}

          {/* Mancia inline */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
            <span style={{ color: MUTED, flexShrink: 0 }}>Mancia</span>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0, justifyContent: 'flex-end' }}>
              {[
                { id: 0, label: '—' },
                { id: 0.05, label: '5%' },
                { id: 0.10, label: '10%' },
                { id: 'round', label: 'Arrotonda' },
              ].map(t => {
                const active = t.id === 'round' ? tipRound : (tipPct === t.id && !tipRound);
                return (
                  <button key={t.id} title={t.id === 'round' ? 'Arrotonda all\'euro' : undefined} onClick={() => {
                    if (t.id === 'round') { setTipRound(true); setTipPct(0); }
                    else { setTipPct(t.id); setTipRound(false); }
                  }} style={{
                    minWidth: 36, height: 28, padding: '0 10px', borderRadius: 999,
                    background: active ? WINE : TINT,
                    color: active ? '#fff' : TEXT,
                    border: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>{t.id === 'round' && active ? `+${roundUpTip.toFixed(2)}€` : t.label}</button>
                );
              })}
            </div>
            <span style={{ fontWeight: 600, color: tipAmount > 0 ? TEXT : MUTED, minWidth: 50, textAlign: 'right' }}>
              {tipAmount > 0 ? `${tipAmount.toFixed(2)}€` : '—'}
            </span>
          </div>
        </div>

        {/* Metodo di pagamento inline — legge il metodo selezionato */}
        <div onClick={() => goTo('paymethod')} style={{
          margin: '0 16px 8px', padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
          background: TINT, borderRadius: 12, cursor: 'pointer',
        }}>
          <div style={{
            width: 44, height: 28, borderRadius: 6, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: payMethod === 'apple' ? '#000' : (payMethod === 'klarna' ? '#ffb3c7' : SURF),
            border: (payMethod === 'apple' || payMethod === 'klarna') ? 'none' : `1px solid ${BORDER}`, gap: 2,
          }}>
            {payMethod === 'apple' && <>
              <svg width="11" height="14" viewBox="0 0 170 170" fill="#fff">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.443 3.599 12.227 3.599 1.334 0 5.868-1.416 13.55-4.239 7.265-2.618 13.397-3.702 18.418-3.275 13.604 1.098 23.819 6.461 30.61 16.122-12.165 7.371-18.183 17.694-18.064 30.939.109 10.32 3.86 18.91 11.232 25.722 3.34 3.17 7.07 5.62 11.222 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.281 7.041c0 8.1-2.96 15.66-8.86 22.66-7.12 8.32-15.732 13.13-25.071 12.37-.119-.97-.188-1.99-.188-3.06 0-7.78 3.386-16.1 9.4-22.91 3.002-3.45 6.82-6.32 11.45-8.61 4.62-2.25 8.99-3.5 13.1-3.71.12 1.09.17 2.18.17 3.26z"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: -0.2 }}>Pay</span>
            </>}
            {payMethod === 'paypal' && <PaypalIcon size={18}/>}
            {payMethod === 'klarna' && <KlarnaIcon size={18}/>}
            {payMethod === 'card' && <CardIcon size={18}/>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 500, lineHeight: 1 }}>Paghi con</div>
            <div style={{ fontSize: 13, color: TEXT, fontWeight: 700, marginTop: 2 }}>{payMethodName(payMethod)}</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: WINE }}>Cambia</span>
        </div>
        </>
        )}

        {/* CTA con totale */}
        <div style={{ padding: '4px 16px 8px' }}>
          <button onClick={payNow} disabled={total <= 0 || paying} style={{
            width: '100%', height: 54, borderRadius: 999, border: 'none',
            background: total <= 0 ? CTA_DEAD : CTA_GRAD, color: '#fff',
            fontSize: 15, fontWeight: 800, fontFamily: 'inherit', letterSpacing: '.01em',
            cursor: total <= 0 ? 'default' : 'pointer',
            boxShadow: total <= 0 ? 'none' : CTA_GLOW,
            transition: 'transform 150ms cubic-bezier(.34,1.45,.64,1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 22px',
          }}>
            <span>{mode === 'all' ? 'Paga per il tavolo' : 'Paga ora'}</span>
            <span style={{ fontSize: 17, fontWeight: 800 }}>{total.toFixed(2)}€</span>
          </button>
        </div>
      </div>

      {/* Sheet "Al tavolo" — chi è loggato e chi è ospite */}
      {guestsOpen && (
        <GuestsSheet
          order={order}
          loggedIn={(order.guests || []).filter(g => g.isApp || g.isWebApp).length}
          covers={order.covers || (order.guests?.length || 1)}
          onClose={() => setGuestsOpen(false)}
          onAddGuest={() => addGuestToOrder(setState)}
          onRemoveGuest={(id) => removeGuestFromOrder(setState, id)}/>
      )}

      {/* Popup divisione di un piatto preso dal tavolo */}
      {splitDish && (() => {
        const item = order.items.find(i => i.lineId === splitDish.lineId);
        if (!item) return null;
        const lineTotal = item.price * item.qty;
        const n = splitDish.kind === 'table' ? tableCount
          : splitDish.kind === 'split' ? splitDish.people.length + 1 : 1;
        const per = lineTotal / n;
        const setKind = (kind) => setSplitDish(d => ({ ...d, kind }));
        const togglePerson = (gid) => setSplitDish(d => {
          const people = d.people.includes(gid) ? d.people.filter(x => x !== gid) : [...d.people, gid];
          return { ...d, people, kind: 'split' };
        });
        const Opt = ({ kind, title, desc }) => {
          const active = splitDish.kind === kind;
          return (
            <button onClick={() => setKind(kind)} style={{
              width: '100%', padding: '13px 14px', borderRadius: 14, textAlign: 'left',
              background: SURF, border: `1.5px solid ${active ? WINE : BORDER}`,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                border: `2px solid ${active ? WINE : '#d0d0d0'}`,
                background: active ? WINE : SURF,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{active && <I.Check size={13} color="#fff"/>}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{title}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>{desc}</div>
              </div>
            </button>
          );
        };
        return (
          <div onClick={() => setSplitDish(null)} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: SURF, borderTopLeftRadius: 22, borderTopRightRadius: 22,
              width: '100%', maxWidth: 430, padding: '10px 22px 28px',
              maxHeight: '88%', overflowY: 'auto',
            }}>
              <div style={{ width: 36, height: 4, borderRadius: 999, background: MUTESURF, margin: '4px auto 16px' }}/>
              <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>{item.name}</div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>
                {lineTotal.toFixed(2)}€ · come lo dividi?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Opt kind="me" title="Lo pago io" desc="Tutto il piatto sul tuo conto"/>
                <Opt kind="table" title="In parti uguali tra tutti" desc={`${tableCount} commensali`}/>
                <Opt kind="split" title="Con alcuni commensali" desc="Scegli con chi dividere"/>
              </div>

              {splitDish.kind === 'split' && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>
                    Tu sei sempre incluso · {splitDish.people.length + 1} {splitDish.people.length + 1 === 1 ? 'persona' : 'persone'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {otherGuests.map(g => {
                      const sel = splitDish.people.includes(g.id);
                      return (
                        <button key={g.id} onClick={() => togglePerson(g.id)} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 12px', borderRadius: 999,
                          background: sel ? WINE : TINT, color: sel ? '#fff' : TEXT,
                          border: `1.5px solid ${sel ? WINE : BORDER}`,
                          fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                        }}>
                          {sel && <I.Check size={12} color="#fff"/>}
                          {g.name.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: TINT, borderRadius: 12,
                margin: '18px 0 14px',
              }}>
                <span style={{ fontSize: 13, color: MUTED }}>La tua quota</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>{per.toFixed(2)}€</span>
              </div>
              <button onClick={confirmSplitDish} style={{
                width: '100%', height: 50, borderRadius: 999, border: 'none',
                background: WINE, color: '#fff', fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer',
              }}>Conferma</button>
            </div>
          </div>
        );
      })()}

      {/* Split info sheet */}
      {splitInfo && (
        <div onClick={() => setSplitInfo(null)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 100,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: SURF, borderTopLeftRadius: 22, borderTopRightRadius: 22,
            width: '100%', maxWidth: 430, padding: '20px 22px 28px',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: MUTESURF, margin: '0 auto 16px' }}/>
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: -0.3, marginBottom: 4 }}>
              {splitInfo.item.name}
            </div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>
              Diviso tra {splitInfo.splitN} persone
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                { id: 'me', name: 'Tu', isMe: true },
                ...((splitInfo.item.splitWith || []).map(gid => order.guests.find(g => g.id === gid)).filter(Boolean)),
              ].map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: TINT, borderRadius: 12,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 999,
                    background: p.isMe ? PINK_DARK : (p.isGuest ? '#ebe3d6' : BADGE),
                    color: p.isMe ? '#fff' : (p.isGuest ? MUTED : '#fff'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                  }}>{p.isMe ? 'T' : (p.initial || '?')}</div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: TEXT }}>
                    {p.name}{p.isMe ? ' (tu)' : ''}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>
                    {splitInfo.myShare.toFixed(2)}€
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 12px', background: TINT, borderRadius: 12,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 12.5, color: MUTED }}>Totale piatto</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>
                {(splitInfo.item.price * splitInfo.item.qty).toFixed(2)}€
              </span>
            </div>
            <button onClick={() => setConfirmRejectSplit(splitInfo.item)} style={{
              width: '100%', padding: '12px', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13.5, fontWeight: 600, color: '#c44',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Rifiuta la divisione
            </button>
          </div>
        </div>
      )}

      {/* Confirm reject split */}
      {confirmRejectSplit && (
        <div onClick={() => setConfirmRejectSplit(null)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 110, animation: 'fade 0.2s ease',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: SURF, borderTopLeftRadius: 22, borderTopRightRadius: 22,
            width: '100%', maxWidth: 430, padding: '10px 22px 32px',
            animation: 'slideUp 0.28s cubic-bezier(.2,.9,.3,1.05)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: MUTESURF, margin: '4px auto 18px' }}/>
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: -0.3, marginBottom: 8 }}>
              Rifiuti la divisione?
            </div>
            <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5, marginBottom: 22 }}>
              "{confirmRejectSplit.name}" tornerà a essere a carico di chi l'ha ordinato. Tu non lo pagherai.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => rejectSplit(confirmRejectSplit)} style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: '#c44', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 15, fontWeight: 700, color: '#fff',
              }}>Sì, rifiuta</button>
              <button onClick={() => setConfirmRejectSplit(null)} style={{
                width: '100%', padding: '14px', borderRadius: 14,
                border: '1.5px solid #E0DADC', background: SURF,
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 15, fontWeight: 600, color: TEXT,
              }}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm sheet "stai offrendo" */}
      {/* Overlay di caricamento durante il pagamento (~5s) */}
      {paying && (
        <div style={{
          position: 'absolute', inset: 0, background: WINE, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 20, animation: 'fade 0.2s ease',
        }}>
          <svg width="48" height="48" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="5"/>
            <path d="M25 5 a20 20 0 0 1 20 20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite"/>
            </path>
          </svg>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.2 }}>Pagamento in corso…</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Non chiudere l'app</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAYMENT METHOD ────────────────────────────────────────
function PayMethodScreen({ state, setState, goTo, goBack, ctx }) {
  const isTakeaway = ctx?.mode === 'takeaway';
  const total = isTakeaway ? (state.pendingTakeaway?.total || 0) : (state.payTotal || 0);
  const [method, setMethod] = useState(isTakeaway ? 'apple' : (state.payMethod || 'apple'));

  // Dine-in: questa schermata NON paga, conferma solo il metodo e torna al conto.
  const confirmMethod = () => {
    setState(s => ({ ...s, payMethod: method }));
    goBack();
  };

  const methods = [
    { id: 'apple', name: 'Apple Pay', icon: <ApplePayIcon/>, sub: '' },
    { id: 'paypal', name: 'PayPal', icon: <PaypalIcon/>, sub: '' },
    { id: 'klarna', name: 'Paga con Klarna', icon: <KlarnaIcon/>, sub: '' },
    { id: 'card', name: 'Carta di credito', icon: <CardIcon/>, sub: 'Aggiungi carta' },
  ];

  const proceed = () => {
    if (isTakeaway) {
      // Crea takeaway order, svuota pending, e torna direttamente alla home (no success/recensione)
      setState(s => {
        const pending = s.pendingTakeaway || {};
        const existing = s.takeawayOrder;
        let merged;
        if (existing) {
          // Cumula nel takeaway esistente: mantieni codice, aggiorna orario, fonde piatti
          const items = [...(existing.items || [])];
          (pending.items || []).forEach(ni => {
            const e = items.find(m => m.id === ni.id && m.ownerId === 'me');
            if (e) e.qty += ni.qty;
            else items.push({ ...ni, lineId: `ta-${Date.now()}-${ni.id}` });
          });
          const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
          merged = {
            ...existing,
            items,
            total,
            pickupTime: pending.pickupTime || existing.pickupTime,
            paidAt: new Date(),
          };
        } else {
          merged = {
            ...pending,
            paidAt: new Date(),
            status: 'preparing',
            pickupCode: String(Math.floor(1000 + Math.random() * 9000)),
          };
        }
        return {
          ...s,
          takeawayOrder: merged,
          pendingTakeaway: null,
          cart: [],
        };
      });
      goTo('home');
    }
    // dine-in: il pagamento NON avviene qui (vedi confirmMethod)
  };

  return (
    <div data-screen-label="Metodo pagamento" style={{
      width: '100%', height: '100%', background: BG_PAGE, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 60, paddingBottom: 130 }}>
        <div style={{ padding: '8px 22px 0' }}>
          <button onClick={goBack} style={{
            width: 40, height: 40, borderRadius: 999, background: SURF,
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}><I.Back size={18}/></button>
        </div>
        <div style={{ padding: '22px 22px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4, marginBottom: 18 }}>
            Seleziona metodo<br/>di pagamento
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {methods.map(m => {
              const sel = method === m.id;
              // "Aggiungi carta" → Profilo › Pagamenti con il form "Aggiungi metodo" già aperto
              const onPick = m.id === 'card'
                ? () => __goApp('profile')
                : () => setMethod(m.id);
              return (
                <button key={m.id} onClick={onPick} style={{
                  background: sel ? TINT : SURF, borderRadius: 14, padding: '14px 16px',
                  border: sel ? `2px solid ${PINK}` : `1.5px solid ${BORDER}`,
                  boxShadow: sel ? '0 10px 24px -14px rgba(227,36,89,.5)' : 'none',
                  transition: 'border-color 160ms ease, background 160ms ease, box-shadow 160ms ease',
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: m.id === 'klarna' ? '#ffb3c7' : SURF,
                    border: m.id === 'klarna' ? 'none' : 'none',
                  }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT }}>{m.name}</div>
                    {m.sub && <div style={{ fontSize: 12, color: WINE, marginTop: 2, fontWeight: 600 }}>{m.sub}</div>}
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: 999,
                    border: sel ? `6px solid ${PINK}` : `1.5px solid ${BORDER}`,
                    background: sel ? SURF : 'transparent',
                    boxSizing: 'border-box',
                    transition: 'border-color 160ms ease',
                  }}/>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 22px 22px', background: SURF, borderTop: `1px solid ${BORDER}`,
      }}>
        {isTakeaway ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Totale</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: WINE }}>{total.toFixed(2)}€</span>
            </div>
            <button onClick={proceed} style={{
              width: '100%', height: 52, borderRadius: 999, border: 'none',
              background: CTA_GRAD, color: '#fff', boxShadow: CTA_GLOW,
              fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer',
              letterSpacing: '.01em', transition: 'transform 150ms cubic-bezier(.34,1.45,.64,1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {method === 'apple' && <><ApplePayIcon size={20} color="#fff"/> Pay</>}
              {method === 'paypal' && <>Paga con PayPal</>}
              {method === 'klarna' && <>Continua con Klarna</>}
              {method === 'card' && <>Paga con carta</>}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12.5, color: MUTED, textAlign: 'center', marginBottom: 12 }}>
              Pagherai con <span style={{ fontWeight: 700, color: TEXT }}>{payMethodName(method)}</span> · il pagamento avviene dal conto
            </div>
            <button onClick={confirmMethod} style={{
              width: '100%', height: 52, borderRadius: 999, border: 'none',
              background: CTA_GRAD, color: '#fff', boxShadow: CTA_GLOW,
              fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer',
              letterSpacing: '.01em', transition: 'transform 150ms cubic-bezier(.34,1.45,.64,1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <I.Check size={17} color="#fff"/> Conferma metodo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SALDO DEL TAVOLO ──────────────────────────────────────
// Dopo un pagamento parziale: mostra quanto manca al tavolo e i piatti ancora
// scoperti; permette di saldarne altri (per intero, divisi, o per il tavolo).
function BalanceScreen({ state, setState, goTo }) {
  const order = state.activeOrder;
  if (!order) return <div style={{ padding: 80, textAlign: 'center', color: MUTED }}>Nessun ordine attivo.</div>;

  const lockedLineIds = order.lockedLineIds || {};
  const isLocked = (id) => !!lockedLineIds[id];
  const settled = seedSettled(order);
  const tableCount = Math.max(1, (order.guests || []).length);
  const otherGuests = (order.guests || []).filter(g => g.id !== 'me');

  // I miei piatti li ho già saldati nella schermata precedente → non compaiono qui.
  // Resta da saldare ciò che è del tavolo o di altri commensali.
  const pendingAll = order.items.filter(it => it.ownerId !== 'me' && lineRemaining(order, it, settled) > 0.01);
  // Ordine: prima il tavolo, poi i commensali (ordine guests); i lockati sempre in fondo.
  const rank = (it) => {
    if (isLocked(it.lineId)) return 1000;
    if (it.ownerId === 'table') return -1;
    const idx = (order.guests || []).findIndex(g => g.id === it.ownerId);
    return idx < 0 ? 900 : idx;
  };
  const pending = [...pendingAll].sort((a, b) => rank(a) - rank(b));
  const openPending = pendingAll.filter(it => !isLocked(it.lineId));
  const lockedPending = pendingAll.filter(it => isLocked(it.lineId));
  const remaining = pendingAll.reduce((s, it) => s + lineRemaining(order, it, settled), 0);

  const [open, setOpen] = useState(true);
  const [sel, setSel] = useState({});
  const [revealed, setRevealed] = useState(null);
  const [mode, setMode] = useState('me'); // 'me' | 'split' | 'table'
  const [people, setPeople] = useState([]);
  const [paying, setPaying] = useState(false);

  const selItems = openPending.filter(it => sel[it.lineId]);
  const shareFor = (it) => {
    if (mode === 'table') return (it.price * it.qty) / tableCount;
    if (mode === 'split') return (it.price * it.qty) / (people.length + 1);
    return lineRemaining(order, it, settled);
  };
  const payAmount = selItems.reduce((s, it) => s + shareFor(it), 0);

  const allSel = openPending.length > 0 && openPending.every(it => sel[it.lineId]);
  const toggleAll = () => setSel(allSel ? {} : Object.fromEntries(openPending.map(it => [it.lineId, true])));

  const ownerOf = (it) => {
    if (it.ownerId === 'table') return { table: true, name: 'Al tavolo' };
    const g = (order.guests || []).find(x => x.id === it.ownerId);
    if (!g) return { name: '?', initial: '?' };
    return { me: g.isMe, guest: g.isGuest, name: g.isMe ? 'Tu' : g.name, initial: g.initial || '?' };
  };

  const toggleSel = (it) => {
    setSel(s => { const n = { ...s }; if (n[it.lineId]) delete n[it.lineId]; else n[it.lineId] = true; return n; });
  };
  const togglePerson = (gid) => {
    setMode('split');
    setPeople(p => p.includes(gid) ? p.filter(x => x !== gid) : [...p, gid]);
  };

  const pay = () => {
    if (paying || selItems.length === 0 || payAmount <= 0) return;
    setPaying(true);
    const payments = selItems.map(it => ({ lineId: it.lineId, amount: shareFor(it) }));
    const paidNow = payments.reduce((s, p) => s + p.amount, 0);
    const openRem = openPending.reduce((s, it) => s + lineRemaining(order, it, settled), 0);
    // Se chiudo tutto ciò su cui posso agire, i piatti ancora "in pagamento" da altri
    // si concludono in parallelo → il tavolo va a zero.
    const willClose = openRem - paidNow <= 0.01;
    if (willClose) lockedPending.forEach(it => payments.push({ lineId: it.lineId, amount: lineRemaining(order, it, settled) }));
    setTimeout(() => {
      applyPayments(setState, payments);
      setState(s => ({ ...s, payTotal: paidNow }));
      if (willClose) goTo('success');
      else { setSel({}); setPeople([]); setMode('me'); setPaying(false); }
    }, 5000);
  };

  const Avatar = ({ o }) => o.table ? (
    <div style={{
      height: 30, padding: '0 10px', borderRadius: 999, background: TINT, color: WINE,
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 800, flexShrink: 0,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h18M5 7v12h14V7M9 11v4M15 11v4"/>
      </svg>
      Al tavolo
    </div>
  ) : (
    <div style={{
      width: 30, height: 30, borderRadius: 999, flexShrink: 0,
      background: o.me ? WINE : (o.guest ? '#ebe3d6' : BADGE),
      color: o.me ? '#fff' : (o.guest ? MUTED : '#fff'),
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
    }}>{o.me ? 'T' : o.initial}</div>
  );

  const segBtn = (id, label) => (
    <button onClick={() => setMode(id)} style={{
      flex: 1, padding: '9px 4px', borderRadius: 10, fontFamily: 'inherit',
      background: mode === id ? WINE : TINT, color: mode === id ? '#fff' : TEXT,
      border: `1.5px solid ${mode === id ? WINE : BORDER}`,
      fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
    }}>{label}</button>
  );

  return (
    <div data-screen-label="Saldo del tavolo" style={{
      width: '100%', height: '100%', background: BG_PAGE, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header fisso */}
      <div style={{ flexShrink: 0, paddingTop: 60, background: BG_PAGE, position: 'relative', zIndex: 5, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '8px 22px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => goTo('home')} style={{
            width: 40, height: 40, borderRadius: 999, background: SURF,
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0,
          }}><I.Back size={18}/></button>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4, lineHeight: 1.1 }}>Saldo del tavolo</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{order.table} · {order.venue}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', paddingBottom: selItems.length > 0 ? 250 : 120 }}>
        {/* Esito pagamento + saldo residuo */}
        <div style={{
          background: SURF, borderRadius: 18, padding: '22px 20px', textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 18,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 999, background: '#e8f5ec', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7a3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 14 }}>Pagamento riuscito</div>
          <div style={{ fontSize: 12.5, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Manca al tavolo</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: TEXT, letterSpacing: -1, lineHeight: 1.1, margin: '2px 0 4px' }}>
            {remaining.toFixed(2)}€
          </div>
          <div style={{ fontSize: 13, color: MUTED }}>
            {pending.length} {pending.length === 1 ? 'articolo ancora da saldare' : 'articoli ancora da saldare'}
          </div>
        </div>

        {/* Accordion piatti da saldare */}
        <div style={{ background: SURF, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div onClick={() => setOpen(o => !o)} style={{
            padding: '16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>Piatti da saldare</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>Tocca per selezionare cosa pagare</div>
            </div>
            <div style={{ transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
              <I.ChevDown color={MUTED} size={18}/>
            </div>
          </div>
          {open && (
            <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {openPending.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 2px 0' }}>
                  <button onClick={toggleAll} style={{
                    background: 'none', border: 'none', color: WINE, fontFamily: 'inherit',
                    fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0,
                  }}>{allSel ? 'Deseleziona tutti' : 'Seleziona tutti'}</button>
                </div>
              )}
              {pending.map(it => {
                const o = ownerOf(it);
                const locked = isLocked(it.lineId);
                const checked = !!sel[it.lineId];
                const rem = lineRemaining(order, it, settled);
                const partial = rem < it.price * it.qty - 0.001;
                const splitNames = (it.splitWith || [])
                  .map(id => (order.guests || []).find(g => g.id === id))
                  .filter(Boolean).map(g => g.isMe ? 'Tu' : g.name);
                const payer = locked ? (order.guests || []).find(g => g.id === lockedLineIds[it.lineId]) : null;
                return (
                  <div key={it.lineId} onClick={locked ? undefined : () => toggleSel(it)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 12, background: locked ? MUTESURF : (checked ? TINT : TINT),
                    border: `1.5px solid ${checked && !locked ? WINE : BORDER}`,
                    opacity: locked ? 0.65 : 1, cursor: locked ? 'default' : 'pointer',
                  }}>
                    {locked ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    ) : (
                      <div style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                        border: `2px solid ${checked ? WINE : '#d0c8cc'}`, background: checked ? WINE : SURF,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{checked && <I.Check size={13} color="#fff"/>}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                      <div style={{ fontSize: 12, color: locked ? MUTED : TEXT, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {locked
                          ? `${payer ? (payer.isMe ? 'Tu' : payer.name) : 'Qualcuno'} sta pagando…`
                          : <><b>{rem.toFixed(2)}€</b>{partial ? ' rimasti' : ''}{splitNames.length ? ` · diviso con ${splitNames.join(', ')}` : ''}</>}
                      </div>
                    </div>
                    {revealed === it.lineId && !o.table && (
                      <div style={{
                        fontSize: 11.5, fontWeight: 700, color: '#fff', background: BADGE,
                        padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap',
                      }}>{o.name}</div>
                    )}
                    <div onClick={(e) => { e.stopPropagation(); if (!o.table) setRevealed(r => r === it.lineId ? null : it.lineId); }}>
                      <Avatar o={o}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Barra di pagamento per la selezione */}
      {selItems.length > 0 && !paying && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: SURF, borderTop: `1px solid ${BORDER}`,
          padding: '14px 18px 22px', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>
            {selItems.length} {selItems.length === 1 ? 'piatto selezionato' : 'piatti selezionati'} · come paghi?
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {segBtn('me', 'Pago io')}
            {segBtn('split', 'Dividi con…')}
            {segBtn('table', 'Per il tavolo')}
          </div>
          {mode === 'split' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {otherGuests.map(g => {
                const on = people.includes(g.id);
                return (
                  <button key={g.id} onClick={() => togglePerson(g.id)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 999,
                    background: on ? WINE : TINT, color: on ? '#fff' : TEXT,
                    border: `1.5px solid ${on ? WINE : BORDER}`, fontSize: 12, fontWeight: 700,
                    fontFamily: 'inherit', cursor: 'pointer',
                  }}>{on && <I.Check size={11} color="#fff"/>}{g.name.split(' ')[0]}</button>
                );
              })}
            </div>
          )}
          {mode === 'table' && (
            <div style={{ fontSize: 11.5, color: MUTED }}>Diviso per {tableCount} commensali — paghi la tua quota.</div>
          )}
          <button onClick={pay} style={{
            width: '100%', height: 52, borderRadius: 999, border: 'none',
            background: WINE, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer', boxShadow: `0 4px 14px ${WINE}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px',
          }}>
            <span>Paga</span>
            <span style={{ fontSize: 17, fontWeight: 800 }}>{payAmount.toFixed(2)}€</span>
          </button>
        </div>
      )}

      {/* Overlay di caricamento (~5s) */}
      {paying && (
        <div style={{
          position: 'absolute', inset: 0, background: WINE, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 20, animation: 'fade 0.2s ease',
        }}>
          <svg width="48" height="48" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="5"/>
            <path d="M25 5 a20 20 0 0 1 20 20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite"/>
            </path>
          </svg>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.2 }}>Pagamento in corso…</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Non chiudere l'app</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUCCESS + RATING ──────────────────────────────────────
function SuccessScreen({ state, setState, goTo, ctx }) {
  const isTakeaway = ctx?.mode === 'takeaway';
  const [rating, setRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [aspects, setAspects] = useState([]); // ids selezionati
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const venue = isTakeaway
    ? (state.takeawayOrder?.venue || 'Ristorante Maria Grazia')
    : (state.activeOrder?.venue || 'Ristorante Maria Grazia');
  const pickupTime = state.takeawayOrder?.pickupTime;

  // Aspetti adattati al contesto E al rating (positivi se ≥4, negativi se ≤2)
  const isNegative = rating > 0 && rating <= 2;
  const isMid = rating === 3;
  const ASPECTS_POSITIVE = isTakeaway
    ? [
        { id: 'cibo', label: 'Cibo', emoji: '🍝' },
        { id: 'qualita', label: 'Qualità/prezzo', emoji: '💸' },
        { id: 'tempi', label: 'Tempi rapidi', emoji: '⚡' },
        { id: 'packaging', label: 'Packaging', emoji: '📦' },
        { id: 'cortesia', label: 'Cortesia', emoji: '🙋' },
      ]
    : [
        { id: 'cibo', label: 'Cibo', emoji: '🍝' },
        { id: 'servizio', label: 'Servizio', emoji: '🙋' },
        { id: 'locale', label: 'Locale', emoji: '🏛️' },
        { id: 'qualita', label: 'Qualità/prezzo', emoji: '💸' },
        { id: 'atmosfera', label: 'Atmosfera', emoji: '✨' },
      ];

  const ASPECTS_NEGATIVE = isTakeaway
    ? [
        { id: 'cibo_neg', label: 'Cibo', emoji: '🍽️' },
        { id: 'qualita_neg', label: 'Prezzo alto', emoji: '💸' },
        { id: 'tempi_neg', label: 'Attesa lunga', emoji: '⏳' },
        { id: 'packaging_neg', label: 'Packaging', emoji: '📦' },
        { id: 'ordine_sbagliato', label: 'Ordine sbagliato', emoji: '⚠️' },
        { id: 'cortesia_neg', label: 'Personale', emoji: '🙅' },
      ]
    : [
        { id: 'cibo_neg', label: 'Cibo', emoji: '🍽️' },
        { id: 'servizio_neg', label: 'Servizio', emoji: '🙅' },
        { id: 'attesa_neg', label: 'Attesa lunga', emoji: '⏳' },
        { id: 'pulizia_neg', label: 'Pulizia', emoji: '🧼' },
        { id: 'rumore', label: 'Rumore', emoji: '🔊' },
        { id: 'qualita_neg', label: 'Prezzo alto', emoji: '💸' },
      ];

  const ASPECTS = isNegative ? ASPECTS_NEGATIVE : ASPECTS_POSITIVE;

  const setRatingClean = (n) => {
    // se cambia la polarità (positivo ↔ negativo) reset chip
    const wasNeg = rating > 0 && rating <= 2;
    const willBeNeg = n > 0 && n <= 2;
    if (wasNeg !== willBeNeg) setAspects([]);
    setRating(n);
  };
  const toggleAspect = (id) => {
    setAspects(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // in produzione: invio recensione al backend (ordine + rating/aspetti/commento)
  };

  const visualRating = hoverStar || rating;

  // BRANCH TAKEAWAY — layout invariato
  if (isTakeaway) {
    return (
      <div data-screen-label="Pagamento riuscito" style={{
        width: '100%', height: '100%', background: BG_PAGE, position: 'relative',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '52px 22px 180px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999, background: '#e8f5ec',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1a7a3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: TEXT, lineHeight: 1.2, letterSpacing: -0.5, marginBottom: 6 }}>
              Ordine confermato!
            </div>
            <div style={{ fontSize: 13.5, color: MUTED, marginTop: 4, lineHeight: 1.45, maxWidth: 290 }}>
              Ritira il tuo ordine alle <b style={{color: TEXT}}>{pickupTime}</b> da {venue}
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 110,
          padding: '0 22px', display: 'flex', gap: 10,
        }}>
          <a href="byup Menu.html?takeaway=1" style={{
            flex: 1, height: 50, borderRadius: 999, border: 'none',
            background: WINE, color: '#fff',
            fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
          }}>Vai alla home</a>
        </div>
        {(() => { const B = window.BottomTabBar; return B ? <B active="home" onHome={() => __goApp()} onProfile={() => __goApp('profile')} showQR={false}/> : null; })()}
      </div>
    );
  }

  // BRANCH DINE-IN — layout ridisegnato
  const paidAmount = state.payTotal || 0;
  const commensali = (state.activeOrder?.guests || []).filter(g => !g.isMe);
  // Sta scrivendo una recensione → la CTA primaria è "Invia recensione",
  // quindi "Torna alla home" passa in secondo piano (evita due bottoni gemelli).
  const reviewing = rating > 0 && !submitted;

  return (
    <div data-screen-label="Pagamento riuscito" style={{
      width: '100%', height: '100%', background: BG_PAGE, position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '84px 22px 176px' }}>

        {/* Hero: success + importo come momento */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            {(() => { const K = window.ByupKit; return K ? <K.Confetti count={30}/> : null; })()}
            <img src="assets/mascot-wink.png" width="132" alt="" style={{
              animation: 'bkMascotIn 700ms cubic-bezier(.34,1.45,.64,1) backwards, bkBob 2.6s .8s ease-in-out infinite',
              filter: 'drop-shadow(0 16px 26px rgba(77,18,46,.3))',
            }}/>
          </div>

          {/* Peak-end: la "fine" si chiude sulla gratitudine, non sul conto.
              L'importo (fonte di "pain of paying") resta visibile ma sobrio. */}
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 30, fontWeight: 600, color: TEXT, lineHeight: 1.15 }}>
            Fatto. Goditi la serata.
          </div>
          <div style={{ fontSize: 14.5, color: MUTED, marginTop: 10, lineHeight: 1.45, maxWidth: 290 }}>
            Hai pagato <b style={{ color: TEXT }}>{paidAmount.toFixed(2)}€</b> a <b style={{ color: TEXT }}>{venue}</b>
          </div>
          {/* Porta allo Storico ordini (Home app) con l'ordine appena pagato
              espanso. Cross-app: lo storico vive nel Profilo della Vetrina. */}
          <button onClick={() => { __goApp('profile'); }} style={{
            background: 'transparent', border: 'none', color: WINE,
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            marginTop: 12, padding: '4px 8px',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>Vedi scontrino <span style={{ fontSize: 15, lineHeight: 1 }}>›</span></button>

          {commensali.length > 0 && (
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>
                Alla prossima
              </div>
              <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                {commensali.slice(0, 5).map((g, i) => (
                  <div key={g.id || i} style={{
                    width: 34, height: 34, borderRadius: 999,
                    background: (g.isApp || g.isWebApp) ? BADGE : '#c4b89f',
                    color: '#fff',
                    border: '2.5px solid #FBF4F1', marginLeft: -10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12.5, fontWeight: 700,
                  }}>{g.initial || '?'}</div>
                ))}
                {commensali.length > 5 && (
                  <div style={{
                    width: 34, height: 34, borderRadius: 999, background: MUTESURF,
                    color: MUTED, border: '2.5px solid #FBF4F1', marginLeft: -10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>+{commensali.length - 5}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recensione — stelle inline, niente card */}
        {!submitted && (
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: 700 }}>
              Lascia una valutazione
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}
              onMouseLeave={() => setHoverStar(0)}>
              {[1,2,3,4,5].map(n => {
                const filled = n <= visualRating;
                return (
                  <button key={n}
                    onClick={() => setRatingClean(n)}
                    onMouseEnter={() => setHoverStar(n)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer', padding: 2,
                      transition: 'transform 0.15s',
                      transform: filled ? 'scale(1.05)' : 'scale(1)',
                    }}>
                    {/* Stessa resa delle stelle in vetrina (VenueOriginal):
                        tessera arrotondata PINK + stella bianca. */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: filled ? PINK : TINT,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.12s',
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: TEXT, minHeight: 18, marginTop: 8 }}>
              {visualRating === 0 ? '\u00A0' :
               visualRating === 1 ? 'Pessima' :
               visualRating === 2 ? 'Sotto le attese' :
               visualRating === 3 ? 'Nella media' :
               visualRating === 4 ? 'Molto bene' : 'Eccellente!'}
            </div>

            {rating > 0 && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10, textAlign: 'center' }}>
                  {isNegative ? "Cosa non ha funzionato?" :
                   isMid       ? "Cosa potrebbe migliorare?" :
                                 "Cosa hai apprezzato?"}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
                  {ASPECTS.map(a => {
                    const sel = aspects.includes(a.id);
                    const accent = isNegative ? '#C0392B' : WINE;
                    return (
                      <button key={a.id} onClick={() => toggleAspect(a.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 12px', borderRadius: 999,
                        border: sel ? `1.5px solid ${accent}` : '1.5px solid #e6e0d8',
                        background: sel ? `${accent}10` : '#fff',
                        color: sel ? accent : TEXT,
                        fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                        <span style={{ fontSize: 14 }}>{a.emoji}</span>
                        {a.label}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={isNegative
                    ? "Raccontaci cos'è andato storto…"
                    : isMid
                    ? "Cosa miglioreresti?"
                    : "Aggiungi un commento…"}
                  maxLength={300}
                  style={{
                    width: '100%', minHeight: 64, resize: 'none', marginTop: 14,
                    padding: '12px 14px', borderRadius: 14,
                    border: '1.5px solid #e6e0d8', background: SURF,
                    fontSize: 13.5, fontFamily: 'inherit', color: TEXT,
                    outline: 'none', boxSizing: 'border-box', lineHeight: 1.4,
                  }}/>

                <button onClick={handleSubmit} style={{
                  width: '100%', height: 46, borderRadius: 999, border: 'none',
                  background: WINE, color: '#fff',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                  marginTop: 12,
                }}>Invia recensione</button>
              </div>
            )}
          </div>
        )}

        {submitted && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 999,
              background: 'linear-gradient(135deg, #FFD96B 0%, #FFB800 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, letterSpacing: -0.2 }}>
              Grazie per la recensione!
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom — sfondo sfumato così il contenuto non ci passa dietro.
          "Torna alla home" è primaria solo quando NON si sta recensendo; durante
          la recensione la primaria è "Invia recensione" e qui resta secondaria. */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '22px 22px 26px',
        background: 'linear-gradient(to top, #fafaf7 60%, rgba(250,250,247,0))',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <a href="byup Home.html" onClick={(e) => { if (window.__byupNav) { e.preventDefault(); __goApp(); } }} style={{
          width: '100%', height: 54, borderRadius: 999,
          border: reviewing ? `1.5px solid ${WINE}55` : 'none',
          background: reviewing ? 'transparent' : WINE,
          color: reviewing ? WINE : '#fff',
          fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
          boxShadow: reviewing ? 'none' : `0 4px 14px ${WINE}40`,
        }}>{reviewing ? 'Salta e torna alla home' : 'Torna alla home'}</a>
      </div>
    </div>
  );
}

// Payment method icons
function ApplePayIcon({ size = 22, color = '#000' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.05 12.04c-.03-2.79 2.28-4.13 2.39-4.2-1.3-1.91-3.34-2.17-4.06-2.2-1.73-.18-3.37 1.02-4.25 1.02-.88 0-2.23-.99-3.66-.97-1.88.03-3.62 1.09-4.59 2.78-1.96 3.4-.5 8.42 1.41 11.18.93 1.35 2.04 2.86 3.49 2.81 1.4-.06 1.93-.91 3.62-.91s2.17.91 3.65.88c1.51-.03 2.46-1.37 3.39-2.73 1.07-1.56 1.51-3.08 1.54-3.16-.03-.01-2.95-1.13-2.93-4.51zM14.6 4.4c.78-.94 1.3-2.25 1.16-3.55-1.12.05-2.48.74-3.28 1.69-.72.83-1.35 2.16-1.18 3.43 1.25.1 2.52-.63 3.3-1.57z"/>
    </svg>
  );
}
function PaypalIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M7.05 18.5h2.1l.7-4.4h2.5c3.4 0 5.7-2 6.2-5.2.3-1.9-.4-3.5-1.9-4.4-.9-.5-2.1-.7-3.6-.7H7.5L5 18.5h2.05z" fill="#003087"/>
      <path d="M9.85 14.1l.7-4.4h2.5c3.4 0 5.7-1.4 6.2-4.6 0-.2.1-.4.1-.5-.6-.3-1.4-.5-2.4-.5h-5.3l-2.6 16.5h3.2l.6-3.7h-2.5l-.5-2.8z" fill="#0070ba"/>
      <path d="M9.85 14.1l.5 2.8h2.5l-.6 3.7h-2.1l.7-4.4-1 .9z" fill="#001c64"/>
    </svg>
  );
}
function KlarnaIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <text x="12" y="16" fontSize="9" fontWeight="800" textAnchor="middle" fill="#000" fontFamily="Arial Black, sans-serif">K.</text>
    </svg>
  );
}
function CardIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2.5"/>
      <line x1="2" y1="11" x2="22" y2="11"/>
    </svg>
  );
}

// ─── TAKEAWAY SCREEN (scelta orario ritiro) ────────────────
function TakeawayScreen({ state, setState, goTo, goBack }) {
  const items = Object.entries(state.cart || {})
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      let dish = null;
      Object.values(DISHES_BY_CAT).forEach(arr => {
        const d = arr.find(x => x.id === id);
        if (d) dish = d;
      });
      return dish ? { ...dish, qty } : null;
    })
    .filter(Boolean);

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const serviceFee = 0;
  const total = subtotal + serviceFee;

  // Slot orari ogni 15 min, da +30min a +2h
  const now = new Date();
  const baseMin = Math.ceil((now.getMinutes() + 30) / 15) * 15;
  const slots = [];
  for (let i = 0; i < 8; i++) {
    const t = new Date(now);
    t.setMinutes(baseMin + i * 15);
    t.setSeconds(0);
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  const [pickupTime, setPickupTime] = useState(slots[1]);

  const onContinue = () => {
    // Salva ctx takeaway in state e vai al pagamento
    setState(s => ({
      ...s,
      pendingTakeaway: {
        venue: 'Ristorante Maria Grazia',
        items: items.map((it, i) => ({
          lineId: `ta-${i}`, id: it.id, name: it.name, qty: it.qty, price: it.price, ownerId: 'me',
        })),
        total,
        pickupTime,
      },
    }));
    goTo('paymethod', { mode: 'takeaway' });
  };

  return (
    <div style={{ background: SURF, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Status bar spacer */}
      <div style={{ height: 54 }}/>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 14px', gap: 10 }}>
        <button onClick={goBack} style={{
          width: 38, height: 38, borderRadius: 999, background: BG_GRAY, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        }}><I.Back size={20} color={TEXT}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Take Away</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>Quando vieni a ritirare?</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 22px 22px' }}>
        {/* Locale info */}
        <div style={{
          background: TINT, borderRadius: 18, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #FF8A4C 0%, #FF6B35 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 L18 2 L20 6 L4 6 Z"/>
              <path d="M5 6 L5 20 a 2 2 0 0 0 2 2 L17 22 a 2 2 0 0 0 2 -2 L19 6"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, letterSpacing: -0.2 }}>Ristorante Maria Grazia</div>
            <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>Via del Corso 47 · Roma</div>
          </div>
        </div>

        {/* Slot orari */}
        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12, letterSpacing: -0.2 }}>
          Scegli l'orario di ritiro
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22,
        }}>
          {slots.map(t => (
            <button key={t} onClick={() => setPickupTime(t)} style={{
              padding: '12px 4px', borderRadius: 14,
              border: `1.5px solid ${pickupTime === t ? WINE : BORDER}`,
              background: pickupTime === t ? WINE : SURF,
              color: pickupTime === t ? '#fff' : TEXT,
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              cursor: 'pointer', letterSpacing: -0.1,
            }}>{t}</button>
          ))}
        </div>

        {/* Recap ordine */}
        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 10, letterSpacing: -0.2 }}>Il tuo ordine</div>
        <div style={{ background: BG_GRAY, borderRadius: 18, padding: 14, marginBottom: 18 }}>
          {items.map(it => (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
            }}>
              <div style={{
                minWidth: 26, height: 26, borderRadius: 8, background: SURF,
                fontSize: 13, fontWeight: 700, color: TEXT,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{it.qty}×</div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{it.price * it.qty}€</div>
            </div>
          ))}
          <div style={{ height: 1, background: '#e8e0e3', margin: '10px 0' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: MUTED, marginBottom: 4 }}>
            <span>Subtotale</span><span>{subtotal}€</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: MUTED, marginBottom: 8 }}>
            <span>Costo servizio</span><span>{serviceFee === 0 ? 'Gratis' : `${serviceFee}€`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: -0.2 }}>
            <span>Totale</span><span>{total}€</span>
          </div>
        </div>
      </div>

      {/* CTA fissa in basso */}
      <div style={{
        padding: '12px 22px 18px', borderTop: `1px solid ${BORDER}`,
        background: SURF,
      }}>
        <button onClick={onContinue} style={{
          width: '100%', height: 54, borderRadius: 999, border: 'none',
          background: WINE, color: '#fff',
          fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          letterSpacing: -0.2,
        }}>
          <span>Paga e prenota ritiro</span>
          <span style={{ opacity: 0.85 }}>· {total}€</span>
        </button>
      </div>
    </div>
  );
}

function MenuApp({ initial = null }) {
  // demo: ?takeaway=1 preimposta un ordine takeaway già pagato
  const isTakeawayDemo = (() => {
    try { return new URLSearchParams(window.location.search).get('takeaway') === '1'; }
    catch { return false; }
  })();
  const demoTakeaway = isTakeawayDemo ? {
    venue: 'Ristorante Maria Grazia',
    items: [
      { lineId: 'ta-1', id: 'p1', name: 'Cacio e pepe', qty: 1, price: 14, ownerId: 'me' },
      { lineId: 'ta-2', id: 'b2', name: 'Vino della casa', qty: 1, price: 12, ownerId: 'me' },
    ],
    total: 26,
    pickupTime: (() => {
      const t = new Date();
      t.setMinutes(t.getMinutes() + 45);
      const m = Math.floor(t.getMinutes() / 15) * 15;
      t.setMinutes(m); t.setSeconds(0);
      return `${String(t.getHours()).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    })(),
    paidAt: new Date(),
    status: 'preparing',
    pickupCode: '4729',
  } : null;

  const [state, setState] = useState({
    cart: [],
    splits: {},
    takeawayOrder: demoTakeaway,
    activeOrder: {
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
        { lineId: 'g3-1', id: 'p3', name: 'Amatriciana', qty: 1, price: 14, ownerId: 'g3', splitWith: ['g2'] },
        { lineId: 'g3-2', id: 's6', name: 'Filetto di manzo', qty: 1, price: 32, ownerId: 'g3' },
        { lineId: 'g3-3', id: 'b3', name: 'Birra artigianale 33cl', qty: 1, price: 6, ownerId: 'g3' },
        // tavolo / aggiunti dal cameriere — piatti tutti singoli (qty 1)
        { lineId: 't-1a', id: 'b1', name: 'Acqua naturale 75cl', qty: 1, price: 3, ownerId: 'table' },
        { lineId: 't-1b', id: 'b1', name: 'Acqua naturale 75cl', qty: 1, price: 3, ownerId: 'table' },
        { lineId: 't-2', id: 'b6', name: 'Acqua frizzante 75cl', qty: 1, price: 3, ownerId: 'table' },
        { lineId: 't-3', id: 'b2', name: 'Vino della casa 75cl', qty: 1, price: 14, ownerId: 'table' },
        { lineId: 't-4', id: 'a4', name: 'Bruschetta mista', qty: 1, price: 8, ownerId: 'table', claimedBy: 'g1' },
        { lineId: 't-5a', id: 'd2', name: 'Caffè', qty: 1, price: 1.5, ownerId: 'table' },
        { lineId: 't-5b', id: 'd2', name: 'Caffè', qty: 1, price: 1.5, ownerId: 'table' },
        { lineId: 't-5c', id: 'd2', name: 'Caffè', qty: 1, price: 1.5, ownerId: 'table' },
        { lineId: 't-5d', id: 'd2', name: 'Caffè', qty: 1, price: 1.5, ownerId: 'table' },
      ],
      // stato live: Marco (g1) ha già pagato i suoi piatti
      paidLineIds: { 'g1-1': 'g1', 'g1-2': 'g1', 'g1-3': 'g1' },
      // lock real-time: chi sta pagando ora congela righe (non apribili/selezionabili).
      // Ospite 1 (g2) sta saldando tutto il suo ordine; di Ospite 2 (g3) il Filetto.
      lockedLineIds: { 'g2-1': 'g2', 'g2-2': 'g2', 'g2-3': 'g2', 'g2-4': 'g2', 'g3-2': 'g3' },
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
    const valid = ['menu','home','pay','paymethod','balance','success','takeaway'];
    if (initial && valid.includes(initial)) return { name: initial, ctx: null };
    try {
      const h = (window.location.hash || '').replace('#','');
      if (valid.includes(h)) return { name: h, ctx: null };
    } catch {}
    if (isTakeawayDemo) return { name: 'home', ctx: null };
    return { name: 'menu', ctx: null };
  });
  const goTo = (name, ctx = null) => setRoute({ name, ctx });

  let screen;
  if (route.name === 'menu') {
    screen = <MenuScreen state={state} setState={setState} goTo={goTo}/>;
  } else if (route.name === 'split') {
    screen = <SplitScreen state={state} setState={setState} ctx={route.ctx} goBack={() => goTo('menu')}/>;
  } else if (route.name === 'dish') {
    screen = <DishDetailScreen state={state} setState={setState} ctx={route.ctx} goBack={() => goTo('menu')}/>;
  } else if (route.name === 'home') {
    screen = <HomeScreen state={state} setState={setState} goTo={goTo}/>;
  } else if (route.name === 'pay') {
    screen = <PaymentScreen state={state} setState={setState} goTo={goTo} goBack={() => goTo('home')}/>;
  } else if (route.name === 'paymethod') {
    screen = <PayMethodScreen state={state} setState={setState} goTo={goTo} goBack={() => goTo('pay')} ctx={route.ctx}/>;
  } else if (route.name === 'balance') {
    screen = <BalanceScreen state={state} setState={setState} goTo={goTo}/>;
  } else if (route.name === 'success') {
    screen = <SuccessScreen state={state} setState={setState} goTo={goTo} ctx={route.ctx}/>;
  } else if (route.name === 'takeaway') {
    screen = <TakeawayScreen state={state} setState={setState} goTo={goTo} goBack={() => goTo('menu')}/>;
  }

  return screen;
}

function Root() {
  return (
    <div style={{
      minHeight: '100vh', background: '#ececec',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 20px', gap: 28, flexWrap: 'wrap',
    }}>
      <IOSDevice width={402} height={874}>
        <MenuApp/>
      </IOSDevice>
    </div>
  );
}

window.MenuApp = MenuApp;

/* Mount solo nella pagina menu (byup Menu.html). Dentro la SPA Home,
   MenuApp è renderizzato da app.jsx come pagina 'menu' — prototipo unico. */
const __menuRoot = document.getElementById('menu-root');
if (__menuRoot) ReactDOM.createRoot(__menuRoot).render(<Root/>);
