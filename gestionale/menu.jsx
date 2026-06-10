// byup — Menu locale + Divisione + Home con ordine attivo
const { useState, useRef, useEffect } = React;

const PINK = '#FF5A5F';
const PINK_DARK = '#E04347';
const WINE = '#5a1a2e';     // for menu screen accent (matches mockup)
const WINE_DARK = '#3d0f1f';
const TEXT = '#1a1a1a';
const MUTED = '#6b6b6b';
const BORDER = '#e5e5e5';
const BG_GRAY = '#f5f5f5';
const BG_PAGE = '#f7f5f3';

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
  glutine:    { label: 'Glutine',     color: '#c8a87a' },
  pesce:      { label: 'Pesce',       color: '#d96a52' },
  uova:       { label: 'Uova',        color: '#f0c14b' },
  lattosio:   { label: 'Lattosio',    color: '#f5c2c7' },
  crostacei:  { label: 'Crostacei',   color: '#e88a5a' },
  fruttaguscio: { label: 'Frutta a guscio', color: '#a07050' },
  soia:       { label: 'Soia',        color: '#9ec27a' },
  arachidi:   { label: 'Arachidi',    color: '#c89860' },
  sedano:     { label: 'Sedano',      color: '#7ec98a' },
  senape:     { label: 'Senape',      color: '#e8c850' },
  sesamo:     { label: 'Sesamo',      color: '#d4b06a' },
  solfiti:    { label: 'Solfiti',     color: '#b07ac0' },
  lupini:     { label: 'Lupini',      color: '#f0b878' },
  molluschi:  { label: 'Molluschi',   color: '#7aa8c8' },
};

function AllergenDots({ ids, onTap }) {
  const [openId, setOpenId] = useState(null);
  return (
    <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
      {ids.map(id => {
        const a = ALLERGENS[id]; if (!a) return null;
        const isOpen = openId === id;
        return (
          <span key={id} style={{ position: 'relative' }}>
            <span role="button" tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setOpenId(isOpen ? null : id); }}
              style={{
                display: 'inline-block', width: 18, height: 18, borderRadius: 999,
                background: a.color, border: `1.5px solid ${a.color}`,
                cursor: 'pointer',
              }}/>
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
function DishPhoto({ tone = 'a', bestSeller, label, kind, hideBadge = false }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    }}>
      <DishArt kind={kind || 'default'}/>
      {bestSeller && !hideBadge && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: '#1a1a1a', color: '#fff',
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
      longDesc: 'Fritto misto all’italiana che include supplì di riso al pomodoro, fiore di zucca ripieno di mozzarella e alici, olive all’ascolana ripiene di carne. Servito con maionese fatta in casa.',
      prep: 12, allergens: ['glutine','uova','lattosio'], bestSeller: true, tone: 'a',
      ingredients: ['Supplì di riso', 'Fiore di zucca', 'Olive all’ascolana', 'Maionese'],
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
      longDesc: 'Spaghettoni di Gragnano IGP, guanciale di Amatrice croccante, tuorlo d’uovo fresco, pecorino romano DOP, pepe nero. Mantecata al momento, senza panna.',
      prep: 15, allergens: ['glutine','uova','lattosio'], tone: 'b',
      ingredients: ['Guanciale', 'Pecorino', 'Uovo', 'Pepe', 'Spaghettoni'],
      extras: [{ id: 'e1', name: 'Guanciale extra', price: 3 }, { id: 'e2', name: 'Pecorino extra', price: 2 }],
      variants: [{ id: 'cottura', label: 'Cottura pasta', options: ['Al dente', 'Al punto'] }],
      cal: 720, macros: { carbo: 72, grassi: 32, prot: 28, fibre: 3 } },
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
  ],
  'Dolci': [
    { id: 'd1', name: 'Tiramisù della casa', price: 8, kind: 'dolce', photo: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=70&auto=format&fit=crop',
      desc: 'Mascarpone, savoiardi, caffè espresso, cacao.',
      longDesc: 'Tiramisù fatto in casa con mascarpone montato a mano, savoiardi inzuppati nel caffè espresso appena fatto, spolverata di cacao amaro Valrhona.',
      prep: 5, allergens: ['glutine','uova','lattosio'], tone: 'a',
      ingredients: ['Mascarpone', 'Savoiardi', 'Caffè', 'Cacao'],
      extras: [{ id: 'e1', name: 'Cacao extra', price: 0 }],
      variants: [], cal: 420, macros: { carbo: 38, grassi: 24, prot: 8, fibre: 1 } },
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
        width: '100%', background: '#fff',
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
          width: '100%', background: '#fff',
          border: `1.5px solid ${BORDER}`, borderRadius: 18,
          padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 14,
          textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
          marginBottom: 12,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: '#1a1a1a',
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
          width: '100%', background: '#fff',
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
function MenuScreen({ state, setState, goTo }) {
  const tabs = ['Antipasti', 'Primi piatti', 'Secondi piatti', 'Dolci', 'Bevande'];
  const [tab, setTab] = useState('Antipasti');

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

  const dishes = DISHES_BY_CAT;
  const rawList = dishes[tab] || [];
  const list = rawList.filter(d => {
    if (searchQ && !d.name.toLowerCase().includes(searchQ.toLowerCase()) && !d.desc.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (dietFilter === 'veg' && d.allergens.includes('pesce')) return false;
    if (dietFilter === 'vegan' && (d.allergens.includes('lattosio') || d.allergens.includes('uova') || d.allergens.includes('pesce') || d.allergens.includes('crostacei'))) return false;
    if (dietFilter === 'gf' && d.allergens.includes('glutine')) return false;
    // hide dishes containing any of the user-selected allergens
    for (const id of Object.keys(allergenFilters)) {
      if (allergenFilters[id] && d.allergens.includes(id)) return false;
    }
    return true;
  });

  const cart = state.cart;
  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);
  const cartTotal = Object.entries(cart).reduce((s, [id, qty]) => {
    const dish = Object.values(dishes).flat().find(d => d.id === id);
    return s + (dish ? dish.price * qty : 0);
  }, 0);

  const addDish = (id) => setState(s => ({ ...s, cart: { ...s.cart, [id]: (s.cart[id] || 0) + 1 } }));
  const setQty = (id, q) => setState(s => {
    const c = { ...s.cart };
    if (q <= 0) delete c[id]; else c[id] = q;
    return { ...s, cart: c };
  });
  const clearCart = () => setState(s => ({ ...s, cart: {} }));

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
        const newItems = Object.entries(s.cart).map(([id, qty]) => {
          const d = Object.values(dishes).flat().find(x => x.id === id);
          return {
            lineId: 'me-' + id + '-' + Date.now() + Math.random().toString(36).slice(2,5),
            id, name: d?.name, price: d?.price, qty, ownerId: 'me',
          };
        });
        if (s.activeOrder) {
          // Cumulate
          const merged = [...s.activeOrder.items];
          newItems.forEach(ni => {
            const existing = merged.find(m => m.id === ni.id && m.ownerId === 'me');
            if (existing) existing.qty += ni.qty;
            else merged.push(ni);
          });
          const newTotal = merged.reduce((sum, i) => sum + i.price * i.qty, 0);
          return {
            ...s,
            activeOrder: { ...s.activeOrder, items: merged, total: newTotal },
            cart: {},
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
          cart: {},
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
      {/* Top: app-style header */}
      <div style={{ paddingTop: 50, background: BG_PAGE, position: 'relative', zIndex: 5 }}>
        {/* Riga 1: back · titolo locale · filtri */}
        <div style={{ padding: '6px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => {
            try { sessionStorage.removeItem('byup_menu_from'); } catch {}
            if (fromVenue) window.location.href = 'byup Home.html?page=venue';
            else window.location.href = 'byup Home.html';
          }} style={{
            width: 38, height: 38, borderRadius: 999, background: '#fff', border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, letterSpacing: -0.2, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Al Settembrini</div>
            {state.tableNumber && (
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2, lineHeight: 1.1 }}>
                Tavolo {state.tableNumber} · {state.coperti || 4} coperti
              </div>
            )}
          </div>
          {(() => {
            const count = Object.values(allergenFilters).filter(Boolean).length + (dietFilter ? 1 : 0);
            return (
              <button onClick={() => setAllergenSheetOpen(true)} style={{
                position: 'relative', width: 38, height: 38, borderRadius: 999,
                background: count > 0 ? WINE : '#fff', border: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
                    background: '#1a1a1a', color: '#fff',
                    fontSize: 10.5, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{count}</span>
                )}
              </button>
            );
          })()}
        </div>

        {/* Riga 2: search */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
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
        </div>

        {/* Riga 3: tabs categorie */}
        <div className="hscroll" style={{
          display: 'flex', gap: 4, padding: '12px 16px 0',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {tabs.map(t => {
            const active = t === tab;
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                background: 'none', border: 'none', padding: '8px 14px 10px', flex: '0 0 auto',
                borderBottom: `2px solid ${active ? WINE : 'transparent'}`,
                fontSize: 14.5, fontWeight: active ? 700 : 500,
                color: active ? WINE : MUTED,
                fontFamily: 'inherit', cursor: 'pointer',
                letterSpacing: -0.1, whiteSpace: 'nowrap',
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
                background: '#1a1a1a', color: '#fff', border: 'none',
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 240px' }}>
        {/* I più ordinati — only visible when no search/diet filter and on first cat */}
        {!searchQ && !dietFilter && tab === 'Antipasti' && (() => {
          const tops = ALL_DISHES.filter(d => d.bestSeller).slice(0, 4);
          if (!tops.length) return null;
          return (
            <div style={{ marginBottom: 22, marginLeft: -22, marginRight: -22 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 22px 10px' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>🔥 I più ordinati</div>
                  <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>I piatti più amati di oggi</div>
                </div>
              </div>
              <div className="hscroll" style={{ display: 'flex', gap: 12, padding: '0 22px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {tops.map((d, i) => {
                  const qty = cart[d.id] || 0;
                  return (
                    <div key={d.id} onClick={() => goTo('dish', { dishId: d.id })} style={{
                      flex: '0 0 auto', width: 180, background: '#fff', borderRadius: 16,
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
                          background: '#1a1a1a', color: '#fff',
                          fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
                          padding: '4px 8px', borderRadius: 999,
                        }}>N°{i + 1}</div>
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 6 }}>
                          <div style={{ fontSize: 13.5, color: TEXT, fontWeight: 700, whiteSpace: 'nowrap' }}>{d.price}€</div>
                          {d.cal > 0 && (
                            <div style={{ fontSize: 10.5, color: MUTED, whiteSpace: 'nowrap' }}>{d.cal} kcal</div>
                          )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); addDish(d.id); }} style={{
                          marginTop: 8, width: '100%', height: 32, borderRadius: 8,
                          border: 'none', background: qty > 0 ? WINE : '#1a1a1a',
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: -0.4 }}>{tab}</div>
            <div style={{ fontSize: 14, color: MUTED, marginTop: 2 }}>Seleziona uno o più piatti</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(d => {
            const qty = cart[d.id] || 0;
            return (
              <div key={d.id} onClick={() => goTo('dish', { dishId: d.id })} style={{
                background: '#fff', borderRadius: 18, padding: 14,
                display: 'flex', gap: 14, cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)',
                border: qty > 0 ? `1.5px solid ${WINE}` : '1.5px solid transparent',
                transition: 'border-color 0.2s',
                position: 'relative',
              }}>
                <div style={{ width: 96, height: 96, borderRadius: 14, overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#eee' }}>
                  {d.photo ? (
                    <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  ) : (
                    <DishPhoto tone={d.tone} bestSeller={false} kind={d.kind} hideBadge label={d.name.split(' ')[0].toLowerCase()}/>
                  )}
                  {d.bestSeller && (
                    <div style={{
                      position: 'absolute', bottom: 6, left: 6,
                      background: '#1a1a1a', color: '#fff',
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
                      padding: '3px 7px', borderRadius: 999,
                    }}>★ TOP</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: TEXT, lineHeight: 1.2, letterSpacing: -0.2 }}>{d.name}</div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, flexShrink: 0 }}>{d.price}€</div>
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4, marginBottom: 8,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {d.desc}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    {d.cal > 0 && (
                      <span style={{ fontSize: 11, color: MUTED, whiteSpace: 'nowrap' }}>{d.cal} kcal</span>
                    )}
                  </div>
                  {d.allergens.length > 0 && (
                    <div style={{ marginTop: 'auto' }}>
                      <AllergenDots ids={d.allergens}/>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  {qty === 0 ? (
                    <button onClick={(e) => { e.stopPropagation(); addDish(d.id); }} style={{
                      width: 34, height: 34, borderRadius: 10, background: '#1a1a1a',
                      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}><I.Plus color="#fff"/></button>
                  ) : (
                    <div onClick={(e) => e.stopPropagation()} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: WINE, borderRadius: 10, padding: '4px 4px',
                    }}>
                      <button onClick={(e) => { e.stopPropagation(); setQty(d.id, qty - 1); }} style={{
                        width: 26, height: 26, borderRadius: 7, border: 'none', background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}><I.Minus color="#fff" size={14}/></button>
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, minWidth: 14, textAlign: 'center' }}>{qty}</span>
                      <button onClick={(e) => { e.stopPropagation(); setQty(d.id, qty + 1); }} style={{
                        width: 26, height: 26, borderRadius: 7, border: 'none', background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}><I.Plus color="#fff" size={14}/></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginTop: 4 }}>Ordine inviato!</div>
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

      {/* Allergen filter sheet */}
      {allergenSheetOpen && (
        <div onClick={() => setAllergenSheetOpen(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
            padding: '12px 22px 24px', maxHeight: '80%', overflowY: 'auto',
          }}>
            <div style={{ width: 38, height: 4, background: '#e0d8db', borderRadius: 999, margin: '4px auto 14px' }}/>
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
                  background: dietFilter === f.id ? WINE : '#fff',
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
                    background: on ? '#fcf4f6' : '#fff',
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
              Applica filtri ({list.length} piatti)
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
  const cartItems = Object.entries(state.cart).map(([id, qty]) => {
    const d = allDishes.find(x => x.id === id);
    return d ? { ...d, qty } : null;
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
            width: '100%', height: 50, borderRadius: 999, border: 'none',
            background: cartCount === 0 ? '#d8c0c8' : WINE, color: '#fff',
            fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
            cursor: cartCount === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <span>Invio ordine</span>
            {cartTotal > 0 && <span style={{ opacity: 0.85 }}>· {cartTotal}€</span>}
          </button>
        </div>
      ) : (
        <>
          {/* Tab toggle */}
          <div style={{ padding: '4px 22px 0' }}>
            <div style={{
              display: 'flex', background: BG_GRAY, borderRadius: 999, padding: 4, gap: 0,
            }}>
              {['piatti', 'divisione'].map(t => (
                <button key={t} onClick={() => setSheetTab(t)} style={{
                  flex: 1, height: 38, borderRadius: 999, border: 'none',
                  background: sheetTab === t ? '#fff' : 'transparent',
                  color: sheetTab === t ? TEXT : MUTED,
                  fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                  textTransform: 'capitalize',
                  boxShadow: sheetTab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}>{t === 'piatti' ? 'Piatti' : 'Divisione'}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px 16px' }}>
            {sheetTab === 'piatti' ? (
              cartItems.length === 0 ? (
                <EmptyHint text="Aggiungi piatti dalla lista per vederli qui"/>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {cartItems.map(it => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div onClick={() => goTo('dish', { dishId: it.id })} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT }}>{it.name}</div>
                        <div style={{ fontSize: 12, color: WINE, marginTop: 2 }}>
                          extra: acciughe, olive, capperi,<span style={{ color: PINK }}>...altro</span>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: BG_GRAY, borderRadius: 999, padding: '4px 6px',
                      }}>
                        <button onClick={() => setQty(it.id, it.qty - 1)} style={qtyBtn}>
                          <I.Minus size={14}/>
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.qty + 1)} style={qtyBtn}>
                          <I.Plus size={14} color={TEXT}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              cartItems.length === 0 ? (
                <EmptyHint text="Aggiungi piatti per dividerli"/>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {cartItems.flatMap(it => Array.from({ length: it.qty }, (_, idx) => ({ ...it, idx }))).map((it, i) => {
                    const splitKey = `${it.id}-${it.idx}`;
                    const split = state.splits?.[splitKey];
                    const splitLabel = split
                      ? (split.kind === 'me' ? 'Per me'
                        : split.kind === 'tavolo' ? 'Tavolo'
                        : `${(split.people?.length || 0) + 1} pers.`)
                      : 'Per me';
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div onClick={() => goTo('dish', { dishId: it.id })} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT }}>
                            {it.name}
                            {it.qty > 1 && (
                              <span style={{ color: MUTED, fontSize: 12, fontWeight: 500, marginLeft: 6 }}>
                                · porz. {it.idx + 1}/{it.qty}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: WINE, marginTop: 2 }}>
                            extra: acciughe, olive, capperi,<span style={{ color: PINK }}>...altro</span>
                          </div>
                        </div>
                        <button onClick={() => goTo('split', { item: it, splitKey })} style={{
                          height: 34, padding: '0 18px', borderRadius: 999,
                          border: split ? `1.5px solid ${WINE}` : `1.5px solid ${BORDER}`,
                          background: split ? WINE : '#fff',
                          fontSize: 13, fontWeight: 600,
                          color: split ? '#fff' : TEXT,
                          fontFamily: 'inherit', cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}>{splitLabel}</button>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          <div style={{ padding: '0 22px 20px' }}>
            <button onClick={onSubmit} disabled={cartCount === 0} style={{
              width: '100%', height: 50, borderRadius: 999, border: 'none',
              background: cartCount === 0 ? '#d8c0c8' : WINE, color: '#fff',
              fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              cursor: cartCount === 0 ? 'not-allowed' : 'pointer',
            }}>Ordina ora · {cartTotal}€</button>
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

// ─── SPLIT SCREEN ──────────────────────────────────────────
function SplitScreen({ state, setState, ctx, goBack }) {
  const item = ctx?.item;
  const splitKey = ctx?.splitKey;
  const initial = state.splits?.[splitKey] || { kind: 'me', people: [] };
  const [kind, setKind] = useState(initial.kind);
  const [people, setPeople] = useState(initial.people);

  const participants = state.participants || [
    { id: 'me', name: 'Tu', initials: 'T', isMe: true },
    { id: 'p1', name: 'Marco', initials: 'M' },
    { id: 'p2', name: 'Margherita', initials: 'Mg' },
    { id: 'p3', name: 'Roberto', initials: 'R' },
    { id: 'p4', name: 'Ospite 1', initials: 'O', isGuest: true },
  ];

  const togglePerson = (id) => {
    if (id === 'me') return; // me always included
    setPeople(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
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
      {/* Header */}
      <div style={{
        padding: '60px 22px 14px', display: 'flex', alignItems: 'center', gap: 12,
        background: '#fff', borderBottom: `1px solid ${BORDER}`,
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
            title="Per me" desc="Pago io tutto il piatto" emoji="🙋"/>
          <ModeCard active={kind === 'diviso'} onClick={() => setKind('diviso')}
            title="Diviso" desc="Scegli con chi dividere il piatto" emoji="👥"/>
          <ModeCard active={kind === 'tavolo'} onClick={() => setKind('tavolo')}
            title="Tavolo intero" desc={`Diviso tra tutti i ${participants.length} commensali`} emoji="🍽️"/>
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
                    background: sel ? '#fff' : '#fff',
                    border: `1.5px solid ${sel ? WINE : BORDER}`,
                    cursor: p.isMe ? 'default' : 'pointer',
                    opacity: p.isMe ? 0.85 : 1,
                  }}>
                    <Avatar name={p.name} initials={p.initials} guest={p.isGuest}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: MUTED }}>
                        {p.isMe ? 'Sempre incluso' : p.isGuest ? 'Ospite (web)' : 'Tramite app'}
                      </div>
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: 999,
                      border: `2px solid ${sel ? WINE : '#d0d0d0'}`,
                      background: sel ? WINE : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {sel && <I.Check size={14} color="#fff"/>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {kind === 'tavolo' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Tavolo · {participants.length} persone
            </div>
            <div style={{ display: 'flex', gap: -8, marginBottom: 8 }}>
              {participants.map((p, i) => (
                <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                  <Avatar name={p.name} initials={p.initials} guest={p.isGuest} size={42}/>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary */}
        {item && (
          <div style={{
            marginTop: 24, padding: 16, borderRadius: 16,
            background: '#fff', border: `1.5px solid ${BORDER}`,
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
        padding: '14px 22px 22px', background: '#fff', borderTop: `1px solid ${BORDER}`,
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
      background: active ? '#fff' : '#fff',
      border: `1.5px solid ${active ? WINE : BORDER}`,
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      width: '100%', position: 'relative',
    }}>
      <div style={{ fontSize: 28 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{title}</div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 999,
        border: `2px solid ${active ? WINE : '#d0d0d0'}`,
        background: active ? WINE : '#fff',
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
  const [orderExpanded, setOrderExpanded] = useState(true);
  const [taExpanded, setTaExpanded] = useState(true);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const covers = order?.covers || (order?.guests?.length || 1);
  const loggedIn = (order?.guests || []).filter(g => g.isApp).length;

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
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 60, paddingBottom: 110 }}>
        {HS ? (
          <HS
            topBar={topBar}
            activeCat={activeCat} setActiveCat={setActiveCat}
            quickFilters={quickFilters} setQuickFilters={setQuickFilters}
            onMap={() => { window.location.href = 'byup Home.html?page=map'; }}
            onPosta={() => { window.location.href = 'byup Home.html?page=posta'; }}
            onSearch={() => { window.location.href = 'byup Home.html?page=search'; }}
            onFilters={() => { window.location.href = 'byup Home.html'; }}
            onCardClick={() => { window.location.href = 'byup Home.html'; }}
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

      {/* QR center button (re-scan menu) */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        bottom: 56, zIndex: 25,
      }}>
        <button onClick={() => goTo('menu')} style={{
          width: 60, height: 60, borderRadius: 999, border: '4px solid #fff',
          background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
          boxShadow: '0 6px 18px rgba(233,30,99,0.45), 0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><I.QR size={28}/></button>
      </div>

      {/* Tab bar */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 14, height: 72,
        background: '#fff', borderRadius: 26,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', zIndex: 20,
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <I.Home color={PINK} fill={PINK}/>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: PINK }}>Home</span>
        </div>
        <div style={{ width: 64 }}/>
        <button onClick={() => { window.location.href = 'byup Home.html?page=profile'; }} style={{
          flex: 1, background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
          <I.User color="#999"/>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#999' }}>Profilo</span>
        </button>
      </div>

      {guestsOpen && order && (
        <GuestsSheet order={order} loggedIn={loggedIn} covers={covers} onClose={() => setGuestsOpen(false)}/>
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
  const loggedIn = (order.guests || []).filter(g => g.isApp).length;

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

        {expanded ? (
          <>
            <div style={{
              fontSize: 13, opacity: 0.95, marginTop: 10, lineHeight: 1.4,
            }}>
              Clicca su <span style={{ fontWeight: 700 }}>"Paga ora"</span> e inquadra il qr code sul bancone per ricevere il tuo ordine
            </div>

            <div style={{
              marginTop: 12, padding: '10px 12px', borderRadius: 14,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              fontSize: 12.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, opacity: 0.95 }}>
                <span>{order.items.reduce((s, i) => s + i.qty, 0)} piatti</span>
                <span style={{ fontWeight: 700 }}>{order.total}€</span>
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.85, lineHeight: 1.4 }}>
                {order.items.slice(0, 2).map(i => `${i.qty}x ${i.name}`).join(' · ')}
                {order.items.length > 2 && ` · +${order.items.length - 2} altri`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => goTo('menu')} style={{
                flex: 1, height: 42, borderRadius: 999, border: 'none',
                background: '#fff', color: PINK_DARK, fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer',
              }}>Ordina ancora</button>
              <button onClick={() => goTo('pay')} style={{
                flex: 1.2, height: 42, borderRadius: 999, border: 'none',
                background: PINK_DARK, color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>Paga ora</button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => goTo('menu')} style={{
              flex: 1, height: 38, borderRadius: 999, border: 'none',
              background: '#fff', color: PINK_DARK, fontSize: 13.5, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>Ordina ancora</button>
            <button onClick={() => goTo('pay')} style={{
              flex: 1, height: 38, borderRadius: 999, border: 'none',
              background: PINK_DARK, color: '#fff', fontSize: 13.5, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>Paga ora</button>
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
            background: '#fff', color: '#1a1a1a',
            fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          }}>Ordina ancora</button>
        </div>
      </div>
    </div>
  );
}

// ─── PICKED CONFIRM SHEET ──────────────────────────────────
function PickedConfirmSheet({ order, onClose, onConfirm }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fade 0.2s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: '#fff', color: TEXT,
        borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '14px 22px 26px',
        animation: 'slideUp 0.28s cubic-bezier(.2,.9,.3,1.1)',
      }}>
        <div style={{ width: 38, height: 4, background: '#e0d8db', borderRadius: 999, margin: '4px auto 16px' }}/>

        <div style={{
          width: 56, height: 56, borderRadius: 999,
          background: 'linear-gradient(135deg, #FF8A4C 0%, #FF6B35 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 L18 2 L20 6 L4 6 Z"/>
            <path d="M5 6 L5 20 a 2 2 0 0 0 2 2 L17 22 a 2 2 0 0 0 2 -2 L19 6"/>
          </svg>
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: -0.3, textAlign: 'center', marginBottom: 6 }}>
          Hai ritirato il tuo ordine?
        </div>
        <div style={{ fontSize: 13.5, color: MUTED, textAlign: 'center', marginBottom: 18, lineHeight: 1.4 }}>
          Conferma per chiudere l'ordine. Mostra il QR all'addetto se non l'hai ancora fatto.
        </div>

        <div style={{ background: BG_GRAY, borderRadius: 14, padding: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
            <span style={{ color: MUTED }}>Ritiro previsto</span>
            <span style={{ fontWeight: 700, color: TEXT }}>{order?.pickupTime || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: MUTED }}>Locale</span>
            <span style={{ fontWeight: 700, color: TEXT }}>{order?.venue || '—'}</span>
          </div>
        </div>

        <button onClick={onConfirm} style={{
          width: '100%', height: 50, borderRadius: 999, border: 'none',
          background: WINE, color: '#fff',
          fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          marginBottom: 8,
        }}>Sì, ho ritirato</button>
        <button onClick={onClose} style={{
          width: '100%', height: 46, borderRadius: 999,
          background: 'transparent', color: MUTED, border: 'none',
          fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
        }}>Non ancora</button>
      </div>
    </div>
  );
}

function GuestsSheet({ order, loggedIn, covers, onClose }) {
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
            <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{loggedIn} loggati su {covers} coperti</div>
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
                  {g.isApp ? '✓ ha l’app' : 'ospite — non loggato'}
                </div>
              </div>
              {g.isApp && !g.isMe && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700, color: '#1a7a3a',
                  background: '#e8f5ec', padding: '4px 8px', borderRadius: 999,
                }}>APP</span>
              )}
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 14, padding: 12, background: '#faf6ee',
          borderRadius: 12, fontSize: 12.5, color: MUTED, lineHeight: 1.45,
        }}>
          Gli ospiti senza app sono stati conteggiati dal QR sul tavolo. Possono essere invitati a unirsi tramite link.
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
  const [expanded, setExpanded] = useState(false);
  const [extras, setExtras] = useState({});
  const [removed, setRemoved] = useState({}); // ingredient -> true
  const [variants, setVariants] = useState({});
  const [nutriOpen, setNutriOpen] = useState(true);

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
  const addToCart = () => {
    setState(s => ({ ...s, cart: { ...s.cart, [dish.id]: (s.cart[dish.id] || 0) + 1 } }));
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
          <div style={{ position: 'absolute', top: 56, left: 16, zIndex: 5 }}>
            <button onClick={goBack} style={{
              width: 42, height: 42, borderRadius: 999, background: '#fff',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}><I.Back size={20}/></button>
          </div>
          {dish.bestSeller && (
            <div style={{
              position: 'absolute', top: 60, right: 16, zIndex: 5,
              background: '#1a1a1a', color: '#fff',
              fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
              padding: '7px 11px', borderRadius: 999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}>★ BEST SELLER</div>
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
            <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, marginBottom: 14, letterSpacing: -0.2 }}>{v.label}</div>
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
                {others.map(d => (
                  <div key={d.id} onClick={() => { goBack(); setTimeout(() => { setState(s => s); }, 50); }} style={{
                    flex: '0 0 auto', width: 130, background: '#fff', borderRadius: 14,
                    overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ height: 90, overflow: 'hidden' }}>
                      {d.photo ? (
                        <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      ) : (
                        <DishPhoto tone={d.tone} kind={d.kind} hideBadge label={d.name.split(' ')[0].toLowerCase()}/>
                      )}
                    </div>
                    <div style={{ padding: '8px 10px 10px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, lineHeight: 1.2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: WINE, fontWeight: 700, marginTop: 4 }}>{d.price}€</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 22px 22px', background: '#fff', borderTop: `1px solid ${BORDER}`,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
      }}>
        <button onClick={addToCart} style={{
          width: '100%', height: 56, borderRadius: 999, border: 'none',
          background: WINE, color: '#fff',
          fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
          boxShadow: `0 4px 16px ${WINE}40`,
        }}>
          <span>Aggiungi al piatto</span>
          <span>{total.toFixed(total % 1 === 0 ? 0 : 2)}€</span>
        </button>
      </div>
    </div>
  );
}

// ─── PAYMENT FLOW ──────────────────────────────────────────
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
  // mancia: 0 | 0.05 | 0.1 | custom amount in EUR
  const [tipPct, setTipPct] = useState(0); // 0, 0.05, 0.10
  const [tipCustom, setTipCustom] = useState(null);
  // confirm sheet "stai offrendo a..."
  const [confirmPay, setConfirmPay] = useState(false);
  const [splitInfo, setSplitInfo] = useState(null);

  const paidLineIds = order.paidLineIds || {};
  const isPaid = (lineId) => !!paidLineIds[lineId];

  const myItems = order.items.filter(i => i.ownerId === 'me');
  const otherItems = order.items.filter(i => i.ownerId !== 'me');

  // Group other items by ownerId
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
    return g.isApp ? '✓ ha l’app' : 'ospite — non loggato';
  };

  const toggleOwner = (oid) => setOpenOwners(o => ({ ...o, [oid]: !o[oid] }));
  const toggleExtra = (lineId) => setSelectedExtras(s => {
    const n = { ...s };
    if (n[lineId]) delete n[lineId]; else n[lineId] = true;
    return n;
  });
  const addAllOwner = (oid) => {
    setSelectedExtras(s => {
      const n = { ...s };
      (groupByOwner[oid] || []).forEach(i => { n[i.lineId] = true; });
      return n;
    });
  };

  const myShareOf = (it) => {
    const splitN = (it.splitWith?.length || 0) + 1;
    return (it.price * it.qty) / splitN;
  };
  const myTotal = myItems.reduce((s, i) => s + myShareOf(i), 0);
  const extraItems = order.items.filter(i => selectedExtras[i.lineId]);
  const extraTotal = extraItems.reduce((s, i) => s + i.price * i.qty, 0);
  const tableTotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);

  // coperto: 2€ per persona; in 'mine' paghi solo il tuo, in 'all' paghi per tutti
  const COVER = 2;
  const covers = order.covers || (order.guests?.length || 1);
  const myCover = COVER;
  const allCovers = COVER * covers;

  const subtotal = mode === 'mine' ? (myTotal + extraTotal) : tableTotal;
  const cover = mode === 'mine' ? myCover : allCovers;
  const baseForTip = subtotal + cover;
  const tipAmount = tipCustom != null ? tipCustom : baseForTip * tipPct;
  const total = baseForTip + tipAmount;

  const proceed = () => {
    setState(s => ({ ...s, payingExtras: selectedExtras, payTotal: total, payMode: mode, payTip: tipAmount, payCover: cover }));
    goTo('paymethod');
  };

  return (
    <div data-screen-label="Pagamento" style={{
      width: '100%', height: '100%', background: '#f5f3ee', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 60, paddingBottom: 230 }}>
        {/* Header con back + recap tavolo */}
        <div style={{ padding: '8px 22px 0' }}>
          <button onClick={goBack} style={{
            width: 40, height: 40, borderRadius: 999, background: '#fff',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}><I.Back size={18}/></button>
        </div>

        {/* Recap tavolo */}
        <div style={{ padding: '14px 22px 0' }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: '#faf6ee',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: WINE, flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7h18M5 7v12h14V7M9 11v4M15 11v4"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  {order.table}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: -0.2, marginTop: 1 }}>{order.venue}</div>
              </div>
              {/* avatar coperti */}
              <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                {(order.guests || []).slice(0, 4).map((g, i) => (
                  <div key={g.id} style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: g.isApp ? '#1a1a1a' : (g.isGuest ? '#e8e4dc' : '#1a1a1a'),
                    color: g.isApp || !g.isGuest ? '#fff' : MUTED,
                    border: '2px solid #fff', marginLeft: -8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>{g.initial || '?'}</div>
                ))}
                {(order.guests?.length || 0) > 4 && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 999, background: '#f0ede6',
                    border: '2px solid #fff', marginLeft: -8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10.5, fontWeight: 700, color: MUTED,
                  }}>+{order.guests.length - 4}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* I miei piatti — non-toggleable */}
        <div style={{ padding: '20px 22px 0' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: -0.3, marginBottom: 4 }}>
            {mode === 'all' ? 'Tutto il tavolo' : 'I miei piatti'}
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 12 }}>
            {mode === 'all' ? 'Stai offrendo tu il conto. Bel gesto.' : 'Pagherai i piatti che hai ordinato tu.'}
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
                  background: '#fff', borderRadius: 14, padding: 12,
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  opacity: paid ? 0.55 : 1,
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <DishArt kind={findDish(it.id)?.kind || 'default'}/>
                    {paid && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(28,140,91,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, textDecoration: paid ? 'line-through' : 'none' }}>{it.name}</div>
                    {isShared && !paid && mode === 'mine' && (
                      <div
                        onClick={(e) => { e.stopPropagation(); setSplitInfo({ item: it, names: sharedNames, splitN, myShare }); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: '#faf6ee', color: WINE,
                          padding: '3px 9px', borderRadius: 999,
                          fontSize: 10.5, fontWeight: 700, marginTop: 4,
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
                    {!isShared && (
                      <div style={{ fontSize: 11.5, color: paid ? '#1c8c5b' : MUTED, marginTop: 3, fontWeight: paid ? 700 : 400 }}>
                        {paid ? '✓ già pagato' : (it.qty > 1 ? `${it.qty}× · ${it.price}€ cad.` : `${it.price}€`)}
                      </div>
                    )}
                    {isShared && paid && (
                      <div style={{ fontSize: 11.5, color: '#1c8c5b', marginTop: 3, fontWeight: 700 }}>
                        ✓ già pagato
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: paid ? MUTED : TEXT }}>
                      {(mode === 'mine' ? myShare : it.price * it.qty).toFixed(2)}€
                    </div>
                    {isShared && mode === 'mine' && !paid && (
                      <div style={{ fontSize: 10.5, color: MUTED, marginTop: 1, fontWeight: 500 }}>
                        ({(it.price * it.qty).toFixed(0)}€ tot)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {myItems.length === 0 && (
              <div style={{
                background: '#fff', borderRadius: 14, padding: '28px 18px',
                fontSize: 13.5, color: MUTED, textAlign: 'center',
              }}>
                <div style={{ fontSize: 30, color: '#1c8c5b', marginBottom: 6 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Niente da pagare</div>
                <div>Non hai piatti tuoi sul conto.</div>
              </div>
            )}
                {extraItems.length > 0 && (
                  <>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: WINE, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 8 }}>
                      ✓ Aggiunti al tuo conto
                    </div>
                    {extraItems.map(it => (
                      <div key={'x-'+it.lineId} style={{
                        background: '#fff', borderRadius: 14, padding: 12,
                        display: 'flex', alignItems: 'center', gap: 12,
                        border: `1.5px solid ${WINE}`,
                      }}>
                        <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                          <DishArt kind={findDish(it.id)?.kind || 'default'}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT }}>{it.name}</div>
                          <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                            Da {ownerLabel(it.ownerId)} · {(it.price * it.qty).toFixed(2)}€
                          </div>
                        </div>
                        <button onClick={() => toggleExtra(it.lineId)} style={{
                          width: 28, height: 28, borderRadius: 999, border: 'none',
                          background: WINE, color: '#fff', fontSize: 16, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>−</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Aggiungi al mio conto */}
            {mode === 'mine' && Object.keys(groupByOwner).length > 0 && (
              <div style={{ padding: '24px 22px 0' }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: -0.3, marginBottom: 4 }}>
                  Aggiungi al mio conto
                </div>
                <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 12 }}>
                  Vuoi offrire qualcosa? Scegli i piatti degli altri che paghi tu.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(groupByOwner).map(([oid, items]) => {
                    const open = !!openOwners[oid];
                    const unpaidItems = items.filter(i => !isPaid(i.lineId));
                    const allPaid = unpaidItems.length === 0;
                    const allSelected = unpaidItems.length > 0 && unpaidItems.every(i => selectedExtras[i.lineId]);
                    const selectedCount = items.filter(i => selectedExtras[i.lineId] && !isPaid(i.lineId)).length;
                    const unpaidTotal = unpaidItems.reduce((s, i) => s + i.price * i.qty, 0);
                    const guest = order.guests.find(g => g.id === oid);
                    return (
                      <div key={oid} style={{
                        background: '#fff', borderRadius: 14, overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        opacity: allPaid ? 0.7 : 1,
                      }}>
                        <div onClick={() => !allPaid && toggleOwner(oid)} style={{
                          padding: '14px', display: 'flex', alignItems: 'center', gap: 12,
                          cursor: allPaid ? 'default' : 'pointer',
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 999,
                            background: oid === 'table' ? '#faf6ee' : (guest?.isGuest ? '#e8e4dc' : '#1a1a1a'),
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
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT }}>{ownerLabel(oid)}</div>
                            <div style={{ fontSize: 11.5, color: allPaid ? '#1c8c5b' : MUTED, marginTop: 1, fontWeight: allPaid ? 700 : 500 }}>
                              {allPaid
                                ? 'Ha già pagato la sua parte'
                                : selectedCount > 0
                                ? `${selectedCount}/${unpaidItems.length} aggiunti · ${items.filter(i => selectedExtras[i.lineId] && !isPaid(i.lineId)).reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}€`
                                : `${unpaidItems.length} piatti · ${unpaidTotal.toFixed(2)}€`}
                            </div>
                          </div>
                          {!allPaid && (
                            <div style={{ transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                              <I.ChevDown color={MUTED} size={16}/>
                            </div>
                          )}
                        </div>
                        {open && !allPaid && (
                          <div style={{ padding: '0 14px 14px' }}>
                            <button onClick={() => addAllOwner(oid)} disabled={allSelected} style={{
                              width: '100%', padding: '8px 12px', borderRadius: 999,
                              background: allSelected ? '#f0ede6' : WINE,
                              color: allSelected ? MUTED : '#fff',
                              border: 'none', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit',
                              cursor: allSelected ? 'default' : 'pointer', marginBottom: 8,
                            }}>{allSelected ? 'Già tutti aggiunti' : `Offri tutto (${unpaidTotal.toFixed(2)}€)`}</button>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              {items.map(i => {
                                const paid = isPaid(i.lineId);
                                const sel = !!selectedExtras[i.lineId];
                                return (
                                  <div key={i.lineId} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 0', borderTop: `1px solid ${BORDER}`,
                                    opacity: paid ? 0.5 : 1,
                                  }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, textDecoration: paid ? 'line-through' : 'none' }}>{i.name}</div>
                                      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>
                                        {paid ? '✓ già pagato' : `${i.price}€${i.qty > 1 ? ` × ${i.qty}` : ''}`}
                                      </div>
                                    </div>
                                    {!paid && (
                                      <button onClick={() => toggleExtra(i.lineId)} style={{
                                        width: 30, height: 30, borderRadius: 999, border: 'none',
                                        background: sel ? WINE : '#f0ede6',
                                        color: sel ? '#fff' : TEXT,
                                        cursor: 'pointer', fontSize: 18, fontWeight: 700,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      }}>{sel ? '−' : '+'}</button>
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
                  width: '100%', background: '#fff', borderRadius: 14,
                  padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 14,
                  border: `1.5px dashed ${WINE}40`, cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#faf6ee', color: WINE,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: TEXT, letterSpacing: -0.2 }}>
                      Offri tutto il tavolo
                    </div>
                    <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>
                      Paghi tu il conto intero per tutti
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: WINE }}>
                      {tableTotal.toFixed(2)}€
                    </div>
                    <div style={{ fontSize: 10.5, color: MUTED, marginTop: 2, fontWeight: 600 }}>→</div>
                  </div>
                </button>
              </div>
            )}

            {/* Torna a "la mia parte" se in mode all */}
            {mode === 'all' && (
              <div style={{ padding: '24px 22px 0' }}>
                <button onClick={() => setMode('mine')} style={{
                  width: '100%', background: 'transparent', border: 'none',
                  fontSize: 13, color: MUTED, fontWeight: 600, fontFamily: 'inherit',
                  cursor: 'pointer', padding: '8px',
                }}>← Torna a "La mia parte"</button>
              </div>
            )}
      </div>

      {/* Receipt sticky bottom */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#fff', borderTop: `1px solid ${BORDER}`,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}>
        {/* Mancia chips */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>Mancia per il personale</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 0, label: 'Niente' },
              { id: 0.05, label: '5%' },
              { id: 0.10, label: '10%' },
              { id: 'custom', label: 'Altro' },
            ].map(t => {
              const active = (t.id === 'custom' ? tipCustom != null : tipPct === t.id && tipCustom == null);
              if (t.id === 'custom' && active) {
                return (
                  <div key="custom-input" style={{
                    flex: 1, height: 34, borderRadius: 10,
                    background: TEXT, display: 'flex', alignItems: 'center',
                    padding: '0 10px', gap: 4,
                  }}>
                    <input
                      type="number"
                      autoFocus
                      min="0"
                      step="0.5"
                      value={tipCustom != null ? tipCustom : ''}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        if (e.target.value === '') setTipCustom(0);
                        else if (!isNaN(n) && n >= 0) setTipCustom(n);
                      }}
                      onBlur={() => { if (tipCustom === 0 || tipCustom == null) { setTipCustom(null); } }}
                      style={{
                        flex: 1, minWidth: 0, background: 'transparent', border: 'none',
                        color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                        outline: 'none', textAlign: 'right', padding: 0,
                        appearance: 'textfield', MozAppearance: 'textfield',
                      }}
                      placeholder="0,00"
                    />
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>€</span>
                  </div>
                );
              }
              return (
                <button key={t.id} onClick={() => {
                  if (t.id === 'custom') {
                    setTipCustom(0); setTipPct(0);
                  } else {
                    setTipCustom(null); setTipPct(t.id);
                  }
                }} style={{
                  flex: 1, padding: '8px 6px', borderRadius: 10,
                  background: active ? TEXT : '#f5f3ee',
                  color: active ? '#fff' : TEXT,
                  border: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                  cursor: 'pointer',
                }}>{t.label}</button>
              );
            })}
          </div>
        </div>
        {/* Recap righe */}
        <div style={{ padding: '12px 16px 4px', fontSize: 12.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: MUTED, marginBottom: 4 }}>
            <span>{mode === 'all' ? 'Tutto il tavolo' : (extraTotal > 0 ? 'I miei piatti + offerti' : 'I miei piatti')}</span>
            <span>{subtotal.toFixed(2)}€</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: MUTED, marginBottom: 4 }}>
            <span>Coperto{mode === 'all' ? ` × ${covers}` : ''}</span>
            <span>{cover.toFixed(2)}€</span>
          </div>
          {tipAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: MUTED, marginBottom: 4 }}>
              <span>Mancia</span>
              <span>{tipAmount.toFixed(2)}€</span>
            </div>
          )}
        </div>
        {/* CTA con totale */}
        <div style={{ padding: '4px 16px 8px' }}>
          <button onClick={() => {
            // se sto offrendo a qualcuno → mostra conferma; altrimenti procedi
            if (mode === 'mine' && extraItems.length > 0) setConfirmPay(true);
            else proceed();
          }} disabled={total <= 0} style={{
            width: '100%', height: 54, borderRadius: 999, border: 'none',
            background: total <= 0 ? '#ccc' : WINE, color: '#fff',
            fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
            cursor: total <= 0 ? 'default' : 'pointer',
            boxShadow: total <= 0 ? 'none' : `0 4px 14px ${WINE}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 22px',
          }}>
            <span>{mode === 'all' ? 'Paga per il tavolo' : 'Paga ora'}</span>
            <span style={{ fontSize: 17, fontWeight: 800 }}>{total.toFixed(2)}€</span>
          </button>
        </div>
      </div>

      {/* Split info sheet */}
      {splitInfo && (
        <div onClick={() => setSplitInfo(null)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 100,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
            width: '100%', maxWidth: 430, padding: '20px 22px 28px',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: '#e5e1d6', margin: '0 auto 16px' }}/>
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
                  padding: '10px 12px', background: '#faf8f3', borderRadius: 12,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 999,
                    background: p.isMe ? PINK_DARK : (p.isGuest ? '#e8e4dc' : '#1a1a1a'),
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
              padding: '12px 12px', background: '#faf6ee', borderRadius: 12,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 12.5, color: MUTED }}>Totale piatto</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>
                {(splitInfo.item.price * splitInfo.item.qty).toFixed(2)}€
              </span>
            </div>
            <button onClick={() => setSplitInfo(null)} style={{
              width: '100%', height: 48, borderRadius: 999,
              background: TEXT, color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            }}>Chiudi</button>
          </div>
        </div>
      )}

      {/* Confirm sheet "stai offrendo" */}
      {confirmPay && (
        <div onClick={() => setConfirmPay(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 100,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
            padding: '20px 22px 26px', width: '100%', maxWidth: 420,
          }}>
            <div style={{ width: 40, height: 4, background: '#e0d8c8', borderRadius: 2, margin: '0 auto 14px' }}/>
            <div style={{ fontSize: 19, fontWeight: 800, color: TEXT, letterSpacing: -0.3, marginBottom: 6 }}>
              Stai offrendo {extraItems.length} {extraItems.length === 1 ? 'piatto' : 'piatti'}
            </div>
            <div style={{ fontSize: 13.5, color: MUTED, marginBottom: 14, lineHeight: 1.5 }}>
              Pagherai i tuoi piatti e quelli che hai aggiunto al tuo conto. Gli altri al tavolo non dovranno pagarli.
            </div>
            {/* lista offerti raggruppati per persona */}
            <div style={{
              background: '#faf6ee', borderRadius: 14, padding: 12, marginBottom: 16,
              maxHeight: 200, overflowY: 'auto',
            }}>
              {(() => {
                const byOwner = {};
                extraItems.forEach(i => { (byOwner[i.ownerId] = byOwner[i.ownerId] || []).push(i); });
                return Object.entries(byOwner).map(([oid, items]) => {
                  const t = items.reduce((s, i) => s + i.price * i.qty, 0);
                  return (
                    <div key={oid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{ownerLabel(oid)}</div>
                        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>
                          {items.map(i => i.name).join(', ')}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: WINE, marginLeft: 12 }}>+{t.toFixed(2)}€</div>
                    </div>
                  );
                });
              })()}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmPay(false)} style={{
                flex: 1, height: 50, borderRadius: 999,
                background: '#fff', border: `1px solid ${BORDER}`, color: TEXT,
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              }}>Modifica</button>
              <button onClick={() => { setConfirmPay(false); proceed(); }} style={{
                flex: 1.4, height: 50, borderRadius: 999,
                background: WINE, border: 'none', color: '#fff',
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px',
              }}><span>Conferma</span><span style={{ fontWeight: 800 }}>{total.toFixed(2)}€</span></button>
            </div>
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
  const [method, setMethod] = useState('apple');

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
          cart: {},
        };
      });
      goTo('home');
    } else {
      goTo('success');
    }
  };

  return (
    <div data-screen-label="Metodo pagamento" style={{
      width: '100%', height: '100%', background: '#fafaf7', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 60, paddingBottom: 130 }}>
        <div style={{ padding: '8px 22px 0' }}>
          <button onClick={goBack} style={{
            width: 40, height: 40, borderRadius: 999, background: '#fff',
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
              return (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  background: '#fff', borderRadius: 14, padding: '14px 16px',
                  border: sel ? `2px solid ${TEXT}` : `1.5px solid ${BORDER}`,
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: m.id === 'klarna' ? '#ffb3c7' : '#fff',
                    border: m.id === 'klarna' ? 'none' : 'none',
                  }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT }}>{m.name}</div>
                    {m.sub && <div style={{ fontSize: 12, color: WINE, marginTop: 2, fontWeight: 600 }}>{m.sub}</div>}
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: 999,
                    border: sel ? `6px solid ${TEXT}` : `1.5px solid ${BORDER}`,
                    background: sel ? '#fff' : 'transparent',
                    boxSizing: 'border-box',
                  }}/>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 22px 22px', background: '#fff', borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Totale</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: WINE }}>{total.toFixed(2)}€</span>
        </div>
        <button onClick={proceed} style={{
          width: '100%', height: 52, borderRadius: 999, border: 'none',
          background: '#1a1a1a', color: '#fff',
          fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {method === 'apple' && <><ApplePayIcon size={20} color="#fff"/> Pay</>}
          {method === 'paypal' && <>Paga con PayPal</>}
          {method === 'klarna' && <>Continua con Klarna</>}
          {method === 'card' && <>Paga con carta</>}
        </button>
      </div>
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
    // potremmo salvare in state.lastReceipt.review = {...}
  };

  const reset = () => {
    setState(s => ({ ...s, activeOrder: null, payingExtras: {}, payTotal: 0, lastReceipt: {
      ...(s.activeOrder || {}),
      paid: state.payTotal || 0,
      rating,
      aspects,
      comment,
      paidAt: new Date(),
    } }));
  };

  const visualRating = hoverStar || rating;

  return (
    <div data-screen-label="Pagamento riuscito" style={{
      width: '100%', height: '100%', background: '#fafaf7', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '52px 22px 130px' }}>

        {/* Header success */}
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
            {isTakeaway ? 'Ordine confermato!' : 'Hai pagato con successo'}
          </div>
          <div style={{ fontSize: 13.5, color: MUTED, marginTop: 4, lineHeight: 1.45, maxWidth: 290 }}>
            {isTakeaway
              ? <>Ritira il tuo ordine alle <b style={{color: TEXT}}>{pickupTime}</b> da {venue}</>
              : <>Grazie per aver visitato <b style={{color: TEXT}}>{venue}</b></>
            }
          </div>
        </div>

        {/* Recensione card (solo NON take away) */}
        {!isTakeaway && !submitted && (
          <div style={{
            background: '#fff', borderRadius: 22,
            boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
            border: '1px solid #f0ece5',
            padding: '20px 18px 18px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: -0.3, textAlign: 'center' }}>
              Com'è stata la tua esperienza?
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4, textAlign: 'center' }}>
              La tua recensione aiuta altri come te
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18, marginBottom: 6 }}
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
                    <svg width="38" height="38" viewBox="0 0 24 24"
                      fill={filled ? '#FFB800' : 'none'}
                      stroke={filled ? '#FFB800' : '#d4cfc4'}
                      strokeWidth="1.5" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: TEXT, minHeight: 18 }}>
              {visualRating === 0 ? '\u00A0' :
               visualRating === 1 ? 'Pessima' :
               visualRating === 2 ? 'Sotto le attese' :
               visualRating === 3 ? 'Nella media' :
               visualRating === 4 ? 'Molto bene' : 'Eccellente!'}
            </div>

            {/* Aspects (mostrati solo se rating > 0) */}
            {rating > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginTop: 18, marginBottom: 10 }}>
                  {isNegative ? "Cosa non ha funzionato?" :
                   isMid       ? "Cosa potrebbe migliorare?" :
                                 "Cosa hai apprezzato?"}{' '}
                  <span style={{ color: MUTED, fontWeight: 500, fontSize: 12 }}>(opzionale)</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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

                {/* Comment */}
                <div style={{ marginTop: 16 }}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isNegative
                      ? "Raccontaci cos'è andato storto (opzionale)…"
                      : isMid
                      ? "Cosa miglioreresti? (opzionale)…"
                      : "Aggiungi un commento (opzionale)…"}
                    maxLength={300}
                    style={{
                      width: '100%', minHeight: 70, resize: 'none',
                      padding: '12px 14px', borderRadius: 14,
                      border: '1.5px solid #e6e0d8', background: '#fafaf7',
                      fontSize: 13.5, fontFamily: 'inherit', color: TEXT,
                      outline: 'none', boxSizing: 'border-box', lineHeight: 1.4,
                    }}/>
                  <div style={{ textAlign: 'right', fontSize: 11, color: MUTED, marginTop: 4 }}>
                    {comment.length}/300
                  </div>
                </div>

                <button onClick={handleSubmit} style={{
                  width: '100%', height: 46, borderRadius: 999, border: 'none',
                  background: WINE, color: '#fff',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                  marginTop: 8,
                }}>Invia recensione</button>
              </>
            )}
          </div>
        )}

        {/* Stato submitted: thank you */}
        {!isTakeaway && submitted && (
          <div style={{
            background: '#fff', borderRadius: 22,
            boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
            border: '1px solid #f0ece5',
            padding: '24px 18px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999,
              background: 'linear-gradient(135deg, #FFD96B 0%, #FFB800 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>
              Grazie per la recensione!
            </div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.45 }}>
              Aiuti la community a trovare i locali migliori.
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 80,
        padding: '0 22px',
        display: 'flex', gap: 10,
      }}>
        {isTakeaway ? (
          <a href="byup Menu.html?takeaway=1" style={{
            flex: 1, height: 50, borderRadius: 999, border: 'none',
            background: WINE, color: '#fff',
            fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
          }}>Vai alla home</a>
        ) : (
          <>
            <button onClick={() => { reset(); goTo('receipt'); }} style={{
              flex: 1, height: 50, borderRadius: 999,
              background: '#fff', color: TEXT, border: `1.5px solid ${BORDER}`,
              fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            }}>Visualizza scontrino</button>
            <a href="byup Home.html" style={{
              flex: 1, height: 50, borderRadius: 999, border: 'none',
              background: WINE, color: '#fff',
              fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
            }}>Torna alla home</a>
          </>
        )}
      </div>

      {/* Bottom nav stub */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 64, background: '#fff', borderTop: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        paddingBottom: 6,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <I.Home color={MUTED}/>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: MUTED }}>Home</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <I.User color={MUTED}/>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: MUTED }}>Profilo</span>
        </div>
      </div>
    </div>
  );
}

// ─── RECEIPT ───────────────────────────────────────────────
function ReceiptScreen({ state, goTo, goBack }) {
  const r = state.lastReceipt || {};
  const items = (r.items || []).filter(i => i.ownerId === 'me' || (state.payingExtras && state.payingExtras[i.lineId]));
  const total = r.paid || 0;
  const fmt = (d) => {
    const dd = new Date(d);
    return dd.toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  return (
    <div data-screen-label="Scontrino" style={{
      width: '100%', height: '100%', background: '#f5f3ee', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 60, paddingBottom: 110 }}>
        <div style={{ padding: '8px 22px 0' }}>
          <button onClick={goBack} style={{
            width: 40, height: 40, borderRadius: 999, background: '#fff',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}><I.Back size={18}/></button>
        </div>

        <div style={{ padding: '14px 22px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.4 }}>Scontrino</div>
        </div>

        <div style={{ padding: '18px 22px 0' }}>
          <div style={{
            background: '#fff', borderRadius: 18, padding: 22,
            boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
            position: 'relative',
          }}>
            {/* Top scallop */}
            <div style={{
              position: 'absolute', top: -1, left: 0, right: 0, height: 12,
              background: 'radial-gradient(circle at 12px -2px, transparent 8px, #fff 9px) repeat-x',
              backgroundSize: '24px 12px',
            }}/>

            <div style={{ textAlign: 'center', borderBottom: `1px dashed ${BORDER}`, paddingBottom: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: -0.2 }}>
                {r.venue || 'Ristorante'}
              </div>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4 }}>
                {r.table} · {r.paidAt ? fmt(r.paidAt) : ''}
              </div>
              <div style={{ fontSize: 10.5, color: MUTED, marginTop: 2, letterSpacing: 0.6 }}>
                P.IVA 01234567890
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {items.map(it => (
                <div key={it.lineId} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: TEXT, fontWeight: 600 }}>{it.name}</div>
                    {it.qty > 1 && <div style={{ fontSize: 11, color: MUTED }}>{it.qty} × {it.price}€</div>}
                  </div>
                  <div style={{ color: TEXT, fontWeight: 700, fontFamily: '"SF Mono", Menlo, monospace' }}>
                    {(it.price * it.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px dashed ${BORDER}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: MUTED }}>
                <span>Subtotale</span>
                <span>{(total / 1.10).toFixed(2)}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: MUTED, whiteSpace: 'nowrap' }}>
                <span>IVA 10%</span>
                <span>{(total - total / 1.10).toFixed(2)}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: TEXT, marginTop: 4 }}>
                <span>Totale pagato</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>

            <div style={{
              marginTop: 18, paddingTop: 14, borderTop: `1px dashed ${BORDER}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              {/* Fake barcode */}
              <div style={{
                display: 'flex', gap: 1, height: 44, alignItems: 'center',
              }}>
                {Array.from({ length: 50 }, (_, i) => {
                  const h = 30 + ((i * 7) % 14);
                  const w = (i % 5 === 0) ? 3 : ((i % 3 === 0) ? 2 : 1);
                  return <div key={i} style={{ width: w, height: h, background: TEXT }}/>;
                })}
              </div>
              <div style={{ fontSize: 10, color: MUTED, fontFamily: '"SF Mono", Menlo, monospace', letterSpacing: 1.5 }}>
                MG-{(r.paidAt ? new Date(r.paidAt).getTime() : Date.now()).toString().slice(-10)}
              </div>
            </div>

            {/* Bottom scallop */}
            <div style={{
              position: 'absolute', bottom: -1, left: 0, right: 0, height: 12,
              background: 'radial-gradient(circle at 12px 14px, transparent 8px, #fff 9px) repeat-x',
              backgroundSize: '24px 12px',
            }}/>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 22px 22px', background: '#fff', borderTop: `1px solid ${BORDER}`,
        display: 'flex', gap: 10,
      }}>
        <button onClick={() => alert('Scontrino scaricato in PDF')} style={{
          flex: 1, height: 50, borderRadius: 999,
          background: '#fff', color: TEXT, border: `1.5px solid ${BORDER}`,
          fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Scarica PDF
        </button>
        <a href="byup Home.html" style={{
          flex: 1, height: 50, borderRadius: 999, border: 'none',
          background: WINE, color: '#fff',
          fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
        }}>Home</a>
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
    <div style={{ background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
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
          background: '#fbf6f3', borderRadius: 18, padding: 14,
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
              background: pickupTime === t ? WINE : '#fff',
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
                minWidth: 26, height: 26, borderRadius: 8, background: '#fff',
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
        background: '#fff',
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

function Root() {
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
    cart: {},
    splits: {},
    takeawayOrder: demoTakeaway,
    activeOrder: {
      venue: 'Ristorante Maria Grazia',
      table: 'Tavolo 23',
      items: [
        { lineId: 'me-1', id: 'p1', name: 'Cacio e pepe', qty: 1, price: 14, ownerId: 'me' },
        { lineId: 'me-2', id: 'b2', name: 'Vino della casa', qty: 1, price: 24, ownerId: 'me', splitWith: ['g1'] },
        { lineId: 'g1-1', id: 'p2', name: 'Carbonara', qty: 1, price: 15, ownerId: 'g1' },
        { lineId: 'g1-2', id: 'a3', name: 'Tagliere misto', qty: 1, price: 12, ownerId: 'g1' },
        { lineId: 'g2-1', id: 's1', name: 'Saltimbocca alla romana', qty: 1, price: 22, ownerId: 'g2' },
        { lineId: 'g3-1', id: 'd1', name: 'Tiramisù della casa', qty: 1, price: 8, ownerId: 'g3' },
        // tavolo / aggiunti dal cameriere
        { lineId: 't-1', id: 'b1', name: 'Acqua naturale 75cl', qty: 2, price: 3, ownerId: 'table' },
      ],
      // stato live: Marco (g1) ha già pagato i suoi piatti
      paidLineIds: { 'g1-1': 'g1', 'g1-2': 'g1' },
      total: 89,
      startedAt: new Date(Date.now() - 35 * 60 * 1000),
      covers: 4,
      guests: [
        { id: 'me', name: 'Tu', initial: 'T', isMe: true, isApp: true },
        { id: 'g1', name: 'Marco', initial: 'M', isApp: true },
        { id: 'g2', name: 'Ospite 1', initial: '?', isGuest: true },
        { id: 'g3', name: 'Ospite 2', initial: '?', isGuest: true },
      ],
    },
    participants: null,
    lastReceipt: {
      venue: 'Ristorante Maria Grazia',
      table: 'Tavolo 23',
      items: [
        { lineId: 'me-1', id: 'p1', name: 'Cacio e pepe', qty: 1, price: 14, ownerId: 'me' },
        { lineId: 'me-2', id: 'b2', name: 'Vino della casa', qty: 1, price: 12, ownerId: 'me' },
      ],
      paid: 26,
      paidAt: new Date(),
    },
  });
  const [route, setRoute] = useState(() => {
    const valid = ['menu','home','pay','paymethod','success','receipt','takeaway'];
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
  } else if (route.name === 'success') {
    screen = <SuccessScreen state={state} setState={setState} goTo={goTo} ctx={route.ctx}/>;
  } else if (route.name === 'receipt') {
    screen = <ReceiptScreen state={state} goTo={goTo} goBack={() => goTo('home')}/>;
  } else if (route.name === 'takeaway') {
    screen = <TakeawayScreen state={state} setState={setState} goTo={goTo} goBack={() => goTo('menu')}/>;
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#ececec',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 20px', gap: 28, flexWrap: 'wrap',
    }}>
      <IOSDevice width={402} height={874}>
        {screen}
      </IOSDevice>
      {/* Demo nav for the user to jump between screens */}
      <div className="byup-screen-nav" style={{
        position: 'fixed', top: 20, right: 20, zIndex: 100,
        background: '#fff', borderRadius: 14, padding: 8,
        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', gap: 4,
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, padding: '4px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Schermate</div>
        {[
          { id: 'home-page', label: 'Home', href: 'byup Home.html' },
          { id: 'venue-page', label: 'Vetrina', href: 'byup Home.html?page=venue' },
          { id: 'menu', label: 'Menu' },
          { id: 'takeaway', label: 'Take Away' },
          { id: 'home', label: 'Home + ordine' },
          { id: 'pay', label: 'Pagamento' },
          { id: 'paymethod', label: 'Metodo pagamento' },
          { id: 'success', label: 'Successo' },
          { id: 'receipt', label: 'Scontrino' },
        ].map(s => (
          s.href ? (
            <a key={s.id} href={s.href} style={{
              padding: '6px 12px', fontSize: 12.5, borderRadius: 8,
              background: 'transparent', color: TEXT,
              fontWeight: 600, textAlign: 'left', textDecoration: 'none',
              display: 'block',
            }}>{s.label}</a>
          ) : (
            <button key={s.id} onClick={() => goTo(s.id)} style={{
              padding: '6px 12px', fontSize: 12.5, borderRadius: 8,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: route.name === s.id ? PINK : 'transparent',
              color: route.name === s.id ? '#fff' : TEXT,
              fontWeight: 600, textAlign: 'left',
            }}>{s.label}</button>
          )
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('menu-root')).render(<Root/>);
