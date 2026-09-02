// Design tokens for Panoramica

const PN = {
  // canvas
  BG: '#F5F6F8',
  WHITE: '#fff',
  // text
  TEXT: '#0F1115',
  MUTED: '#6B7280',
  MUTED_SOFT: '#9CA3AF',
  MUTED_LIGHT: '#C5C8CE',
  // border
  BORDER: '#E5E7EB',
  BORDER_SOFT: '#F0F2F5',
  // brand — byup official palette (coral red + peach soft + black)
  PINK: '#FF5A5F',
  PINK_DARK: '#E04347',
  PINK_SOFT: '#FFE0DD',
  PINK_BG_SOFT: '#FFF1EF',
  WINE: '#B53338',
  WINE_SOFT: '#FFE0DD',
  // ─── Marchio byup Staff ──────────────────────────────────────────────────
  // Il gradiente del logo: rosa profondo → corallo chiaro in diagonale,
  // lettering crema. Lo portano quattro superfici in tre applicazioni — il
  // banner in onboarding, la tessera in POS e integrazioni, il POS mobile e
  // la webapp cameriere — quindi vive qui, non in una di loro.
  // MARK è lo stesso passaggio a 135°: sulle superfici piccole e quadrate
  // (logo, avatar, badge) la diagonale piena si legge meglio della sbieca.
  // CONTRASTO col bianco, misurato: #E5446E 3,90:1 · #FF9083 2,08:1.
  // Quindi mai testo bianco PICCOLO qui sopra: va bene il marchio, vanno bene
  // i numeri grandi, non va bene una didascalia da 12px.
  GRAD_STAFF:      'linear-gradient(115deg, #E5446E 0%, #F4676F 52%, #FF9083 100%)',
  GRAD_STAFF_MARK: 'linear-gradient(135deg, #E5446E 0%, #FF9083 100%)',
  GRAD_STAFF_FROM: '#E5446E',
  GRAD_STAFF_MID:  '#F4676F',
  GRAD_STAFF_TO:   '#FF9083',
  // La crema del logo: non è bianco puro.
  STAFF_CREAM:     '#FDF3F0',
  // sidebar
  SIDE_BG: '#FAFAFB',
  SIDE_ACTIVE_BG: '#FFE0DD',
  // status
  GREEN: '#16A34A',
  GREEN_SOFT: '#DCFCE7',
  AMBER: '#D97706',
  AMBER_SOFT: '#FEF3C7',
  RED: '#DC2626',
  RED_SOFT: '#FEE2E2',
  BLUE: '#2563EB',
  BLUE_SOFT: '#DBEAFE',
  PURPLE: '#7C3AED',
  PURPLE_SOFT: '#EDE9FE',
  // surfaces
  CARD_SHADOW: '0 1px 2px rgba(15,17,21,0.04), 0 1px 3px rgba(15,17,21,0.06)',
  CARD_SHADOW_HOVER: '0 4px 12px rgba(15,17,21,0.08), 0 2px 4px rgba(15,17,21,0.06)',

  // ─── White shades — sfumature di bianco per evitare bianco-su-bianco piatto.
  // Ispirate a macOS Sonoma. Usare invece di #FFF puro su CTA secondari/superfici.
  WHITE_OFF:    '#FAFBFC',  // canvas off-white già usato come BG
  WHITE_HUSH:   '#F5F5F7',  // Apple light — buttons / surface secondaria
  WHITE_FROST:  '#EFEFF1',  // sfumatura più decisa — separatori, tracks

  // ─── Border alpha levels — Apple-style hairlines (mai opacità piena) ───────
  BORDER_GHOST:  'rgba(15, 17, 21, 0.04)',
  BORDER_HAIR:   'rgba(15, 17, 21, 0.06)',
  BORDER_SOFT_A: 'rgba(15, 17, 21, 0.08)',
  BORDER_LIGHT:  'rgba(15, 17, 21, 0.10)',
  BORDER_MED:    'rgba(15, 17, 21, 0.16)',

  // ─── CTA — gradient sottili dall'alto al basso (pattern macOS) ─────────────
  // Mai un solo colore piatto: il gradient comunica la "lente" del bottone.
  BTN_NEUTRAL:        'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
  BTN_NEUTRAL_HOVER:  'linear-gradient(180deg, #F8F9FB 0%, #EFEFF1 100%)',
  BTN_NEUTRAL_PRESS:  'linear-gradient(180deg, #EFEFF1 0%, #F5F5F7 100%)',
  BTN_BRAND:          'linear-gradient(180deg, #FF6A6F 0%, #FF5A5F 100%)',
  BTN_BRAND_HOVER:    'linear-gradient(180deg, #FF6E73 0%, #F04A4F 100%)',
  BTN_BRAND_PRESS:    'linear-gradient(180deg, #E04347 0%, #D63A3F 100%)',
  BTN_DARK:           'linear-gradient(180deg, #2A2D36 0%, #15171C 100%)',
  BTN_DARK_HOVER:     'linear-gradient(180deg, #353841 0%, #1F2229 100%)',
  // Azioni distruttive: rosso, non il corallo del brand — il brand non deve
  // dire "elimina". Base sul RED dei token, stessa curva verticale degli altri.
  BTN_DANGER:         'linear-gradient(180deg, #E63A3A 0%, #DC2626 100%)',
  BTN_DANGER_HOVER:   'linear-gradient(180deg, #EA4040 0%, #C81F1F 100%)',

  // ─── Inset highlights — il "riflesso vetroso" dei buttons macOS ────────────
  INSET_HIGHLIGHT:        'inset 0 1px 0 rgba(255, 255, 255, 0.65)',
  INSET_HIGHLIGHT_BRAND:  'inset 0 1px 0 rgba(255, 255, 255, 0.30)',
  INSET_HIGHLIGHT_DARK:   'inset 0 1px 0 rgba(255, 255, 255, 0.10)',

  // ─── Liquid glass — Apple Sonoma "ice" tier ───────────────────────
  // 2.1 update: trasparenza ridotta (0.86–0.92) → effetto "blurred ice"
  // più solido e leggibile. Saturation 200% per il "frosty cold" feel.
  // Ammessi: floating panels, dropdown, widget hover, drag preview, modal.
  // Vietati: card standard, content area, canvas piena.

  // ─── Glass 2.3 — molto più impattante ──────────────────────────
  // Trasparenza ABBASSATA (pannelli più trasparenti) + blur AUMENTATO a 40-48px.
  // Saturate 220-240% per il classico vibe iOS/macOS Sonoma "frosted glass".
  // Inset highlight bianco di 1px in cima (light catch della superficie).

  // 2.4 update: aggiunta specular highlight gradient verticale
  // (linear-gradient top→bottom white 45%→10%→0) come backgroundImage,
  // sovrapposta al fill rgba. Senza, il glass era "una superficie con
  // blur" ma senza volume — adesso ha la lente convessa che cattura luce
  // dall'alto. Costo: 0, è solo un layer in più sullo stesso elemento.
  // Il GlassMeshSubstrate di byup-glass.jsx fornisce la materia dietro.

  // Card statica floating (anteprime sticky, banner)
  GLASS_LIGHT: {
    background: 'rgba(255, 255, 255, 0.62)',
    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.10) 35%, rgba(255,255,255,0) 100%)',
    backdropFilter: 'blur(40px) saturate(220%)',
    WebkitBackdropFilter: 'blur(40px) saturate(220%)',
    border: '1px solid rgba(255, 255, 255, 0.40)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.70), 0 16px 36px rgba(15, 17, 21, 0.10), 0 1px 2px rgba(15, 17, 21, 0.04)',
  },
  // Modal e popover — Apple Sonoma "ice" max
  GLASS_STRONG: {
    background: 'rgba(255, 255, 255, 0.68)',
    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0) 100%)',
    backdropFilter: 'blur(48px) saturate(240%)',
    WebkitBackdropFilter: 'blur(48px) saturate(240%)',
    border: '1px solid rgba(255, 255, 255, 0.40)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.80), 0 32px 80px rgba(15, 17, 21, 0.24), 0 2px 6px rgba(15, 17, 21, 0.08)',
  },
  // Sidebar — gradient + blur leggero (bg sotto è il body off-white)
  GLASS_VIBRANT: {
    // La sidebar HA GIÀ il proprio gradient verticale come bg, quindi
    // qui non sommiamo un secondo gradient — sarebbe ridondante.
    background: 'linear-gradient(180deg, rgba(250, 251, 252, 0.85) 0%, rgba(245, 245, 247, 0.85) 100%)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRight: '1px solid rgba(15, 17, 21, 0.06)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.65)',
  },
  // Top header sticky — blur sopra main scrollabile
  GLASS_BAR: {
    background: 'rgba(255, 255, 255, 0.62)',
    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0) 100%)',
    backdropFilter: 'blur(40px) saturate(220%)',
    WebkitBackdropFilter: 'blur(40px) saturate(220%)',
    borderBottom: '1px solid rgba(15, 17, 21, 0.06)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.70)',
  },
  // Dropdown menu — Sonoma "frosted ice"
  GLASS_MENU: {
    background: 'rgba(255, 255, 255, 0.66)',
    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0) 100%)',
    backdropFilter: 'blur(48px) saturate(240%)',
    WebkitBackdropFilter: 'blur(48px) saturate(240%)',
    border: '1px solid rgba(255, 255, 255, 0.40)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 24px 48px rgba(15, 17, 21, 0.22), 0 2px 6px rgba(15, 17, 21, 0.06)',
    borderRadius: 16,
  },
  // Drag preview — molto trasparente per "ghost"
  GLASS_DRAG: {
    background: 'rgba(255, 255, 255, 0.50)',
    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 35%, rgba(255,255,255,0) 100%)',
    backdropFilter: 'blur(32px) saturate(200%)',
    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
    border: '1px solid rgba(255, 255, 255, 0.50)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.80), 0 36px 64px rgba(15, 17, 21, 0.28), 0 4px 12px rgba(15, 17, 21, 0.10)',
  },
};

window.PN = PN;

// Gli helper dei layout adattivi (STG / STMIN / STSCROLL, predicato «stretto»)
// vivono in pn-device.js: è il SOLO file caricato da ogni pagina del
// gestionale — l'onboarding questi token non li carica affatto.


// ─── Feedback universale del cliccabile (regola globale del gestionale) ─────
// TUTTO ciò che è pensato per essere cliccato reagisce al passaggio e al
// click: <button>, <select>, link e qualunque elemento con cursore pointer
// (tab, chip, righe, tile, opzioni). I feedback custom inline restano
// prioritari. Sui contenitori si usano solo ombre/outline: filter e
// transform creerebbero containing block e romperebbero i modali interni.
//
// SUPERFICI TOUCH (cameriere, POS): il dito non ha "passaggio sopra", quindi
// l'hover non esiste come stato — e l'anello che usiamo sul desktop, su mobile
// si vede solo DOPO il tap, dove sembra un bordo di selezione rimasto acceso.
// Una pagina si dichiara touch con window.__BYUP_TOUCH_SURFACE = true PRIMA di
// caricare questo file: riceve solo il feedback di pressione, mai l'hover.
// Le regole hover restano comunque dentro @media (hover: hover), così anche il
// gestionale aperto da tablet non le eredita.
(function () {
  if (typeof document === 'undefined' || document.getElementById('pn-btn-feedback')) return;
  const touch = typeof window !== 'undefined' && window.__BYUP_TOUCH_SURFACE === true;
  const st = document.createElement('style');
  st.id = 'pn-btn-feedback';

  const press = `
    button { transition: transform 120ms ease, filter 140ms ease, box-shadow 150ms ease; }
    button:not(:disabled) { cursor: pointer; }
    button:not(:disabled):active { transform: scale(0.96); filter: brightness(0.90); }
    select:not(:disabled) { cursor: pointer; transition: filter 140ms ease; }
    select:not(:disabled):active { filter: brightness(0.92); }
  `;

  st.textContent = touch ? `
    ${press}
    /* Niente flash grigio di sistema: il feedback lo diamo noi. */
    * { -webkit-tap-highlight-color: transparent; }
    /* Contenitori cliccabili (righe, card, tile): alla pressione si scurisce
       TUTTO il contenitore, figli compresi, così si legge come un oggetto solo.
       Serve il filter proprio per questo: velare solo lo sfondo lasciava i
       bottoni interni bianchi e brillanti sopra una card scurita, e l'occhio
       leggeva "ha reagito il bottone". Niente transform, che su un contenitore
       creerebbe un containing block. */
    [style*="cursor: pointer"]:not(button):not(select):not([data-no-fx]),
    [style*="cursor:pointer"]:not(button):not(select):not([data-no-fx]),
    a[href] {
      transition: filter 120ms ease;
    }
    [style*="cursor: pointer"]:not(button):not(select):not([data-no-fx]):active,
    [style*="cursor:pointer"]:not(button):not(select):not([data-no-fx]):active,
    a[href]:active {
      filter: brightness(0.93);
    }
    /* Se a essere premuto è un bottone DENTRO il contenitore, reagisce solo lui:
       il feedback deve dire cosa hai toccato, non accendere mezza schermata. */
    [style*="cursor: pointer"]:not(button):not(select):not([data-no-fx]):active:has(button:active),
    [style*="cursor:pointer"]:not(button):not(select):not([data-no-fx]):active:has(button:active) {
      filter: none;
    }
  ` : `
    ${press}
    @media (hover: hover) and (pointer: fine) {
      button:not(:disabled):hover { filter: brightness(0.95); box-shadow: 0 3px 10px rgba(15, 17, 21, 0.14); }
      button[style*="background: rgb(15, 17, 21)"]:not(:disabled):hover,
      button[style*="background-color: rgb(15, 17, 21)"]:not(:disabled):hover,
      button[style*="background: rgb(0, 0, 0)"]:not(:disabled):hover,
      button[style*="background-color: rgb(0, 0, 0)"]:not(:disabled):hover,
      button[style*="background: rgb(17, 17, 17)"]:not(:disabled):hover,
      button[style*="rgb(42, 45, 54)"]:not(:disabled):hover,
      button[style*="background: rgb(124, 45, 60)"]:not(:disabled):hover {
        transform: scale(1.05);
      }
      select:not(:disabled):hover { filter: brightness(0.96); }
      [style*="cursor: pointer"]:not(button):not(select):not([data-no-fx]):hover,
      [style*="cursor:pointer"]:not(button):not(select):not([data-no-fx]):hover,
      a[href]:hover {
        box-shadow: 0 0 0 1.5px rgba(15, 17, 21, 0.10), 0 6px 16px rgba(15, 17, 21, 0.08);
      }
    }
    [style*="cursor: pointer"]:not(button):not(select):not([data-no-fx]),
    [style*="cursor:pointer"]:not(button):not(select):not([data-no-fx]),
    a[href] {
      transition: box-shadow 150ms ease;
    }
    [style*="cursor: pointer"]:not(button):not(select):not([data-no-fx]):active,
    [style*="cursor:pointer"]:not(button):not(select):not([data-no-fx]):active,
    a[href]:active {
      box-shadow: 0 0 0 2px rgba(15, 17, 21, 0.16), 0 2px 6px rgba(15, 17, 21, 0.10);
    }
  `;
  document.head.appendChild(st);
})();

// La ricetta del foglio modale, nata in Impostazioni → Sala e tavoli e
// diventata la forma standard delle finestre del gestionale: pannello BIANCO
// (non vetro: sopra a una pagina già chiara il vetro non stacca), testata con
// titolo grosso e filetto, corpo, piede con i bottoni. Sta qui e non nella
// pagina che l'ha inventata perché la usano anche fogli di altre pagine.
const MODAL_PANEL = {
  background: PN.WHITE, borderRadius: 22, width: 540, maxWidth: '100%',
  boxShadow: '0 32px 80px -24px rgba(15, 17, 21, 0.38), 0 0 0 1px rgba(15, 17, 21, 0.05)',
};
const MODAL_HEAD  = { padding: '26px 28px 20px', borderBottom: `1px solid ${PN.BORDER_SOFT}`, position: 'relative' };
const MODAL_TITLE = { fontSize: 25, fontWeight: 800, letterSpacing: -0.5, color: PN.TEXT, paddingRight: 44 };
const MODAL_SUB   = { fontSize: 15, color: PN.MUTED, marginTop: 4, paddingRight: 44 };
const MODAL_BODY  = { padding: '22px 28px' };
const MODAL_FOOT  = { padding: '18px 28px', borderTop: `1px solid ${PN.BORDER_SOFT}`, display: 'flex', gap: 10 };
const MODAL_X     = {
  position: 'absolute', top: 24, right: 24, width: 38, height: 38, borderRadius: 11,
  background: PN.WHITE, border: `1px solid ${PN.BORDER}`, cursor: 'pointer',
  display: 'grid', placeItems: 'center', color: PN.TEXT,
};
const MODAL_LABEL = {
  fontSize: 13, fontWeight: 700, color: PN.MUTED,
  letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
};
const MODAL_INPUT = {
  width: '100%', padding: '13px 14px', border: `1px solid ${PN.BORDER}`, borderRadius: 12,
  fontSize: 16, fontFamily: 'inherit', outline: 'none', background: PN.WHITE, color: PN.TEXT,
};
Object.assign(window, { MODAL_PANEL, MODAL_HEAD, MODAL_TITLE, MODAL_SUB, MODAL_BODY, MODAL_FOOT, MODAL_X, MODAL_LABEL, MODAL_INPUT });

// ─── Tab di sezione — linguaggio unico del gestionale ────────────────────────
// Un solo disegno per «spostati tra le viste di questa sezione»: underline
// rosa 2px, icona 14, attivo in peso 700, hover col velo grigio e
// micro-pressione. Nato in Contabilità, esteso a Statistiche, Profilo e
// Impostazioni — prima ogni sezione aveva il suo (underline nera, pillole,
// underline rosa). Le pillole restano ai FILTRI (ruoli, Mensile/Annuale):
// sono un linguaggio da scelta, non da navigazione.
// Vive qui nei token perché è l'unico file caricato da tutte le pagine.
function PnSectionTab({ id, active, onClick, label, icon, hint }) {
  return (
    <button onClick={() => onClick(id)}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = PN.TEXT; e.currentTarget.style.background = '#F4F5F7'; } }}
      onMouseLeave={e => { e.currentTarget.style.color = active ? PN.TEXT : PN.MUTED; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = ''; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = ''; }}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '11px 18px',
        background: 'transparent', border: 'none',
        borderRadius: '9px 9px 0 0',
        color: active ? PN.TEXT : PN.MUTED,
        fontSize: 15.5, fontWeight: active ? 700 : 500,
        cursor: 'pointer', fontFamily: 'inherit',
        marginBottom: -1,
        borderBottom: `2px solid ${active ? PN.PINK : 'transparent'}`,
        whiteSpace: 'nowrap',
        transition: 'color 140ms ease, background 140ms ease, transform 130ms ease',
      }}>
      {icon && <Icon name={icon} size={14}/>}
      {label}
      {hint && <span style={{fontSize: 13, fontWeight: 500, opacity: 0.6}}>{hint}</span>}
    </button>
  );
}

// La barra piena, per le pagine dove le tab stanno da sole sotto la testata
// (Profilo, Impostazioni). Contabilità e Statistiche montano PnSectionTab
// dentro le loro barre, che affiancano KPI e period picker.
function PnSectionTabs({ tabs, active, onChange }) {
  return (
    <div className="pn-scroll" style={{
      display: 'flex', gap: 4, padding: '4px 32px 0',
      borderBottom: `1px solid ${PN.BORDER}`,
      background: PN.WHITE,
      overflowX: 'auto',
    }}>
      {tabs.map(t => (
        <PnSectionTab key={t.id} id={t.id} active={active === t.id} onClick={onChange} label={t.label} icon={t.icon}/>
      ))}
    </div>
  );
}
Object.assign(window, { PnSectionTab, PnSectionTabs });

// ─── Marchi dei partner delivery (P-03 · D-15) ─────────────────────────────
// LA fonte dei colori piattaforma: il marchio in cucina (KDS2_PARTNER è un
// alias di questo), il contrassegno di provenienza in Vendita diretta e la
// riga di Impostazioni → Integrazioni leggono tutti da qui — se un giorno
// arrivano i loghi veri si sostituiscono QUI e restano una cosa sola. Il
// colore brand è il dispositivo di riconoscimento: pieno, mai pastellato —
// un #FF8000 ammorbidito non è più l'arancio di Just Eat.
// Nota di prodotto: al lancio queste integrazioni NON esistono — dipendono
// dagli accordi con le piattaforme, ed entrano in gioco solo quando le
// integrazioni sono reali. Nel prototipo il contrassegno è la lingua visiva
// già pronta per quel momento.
// ─── Allergeni: il dizionario unico dei quattordici (P-24 · D-27) ──────────
// Allegato II del Reg. UE 1169/2011. La fonte VERA è il dizionario di
// piattaforma (`dietary_labels`/`allergens` del modello); questa è la copia
// del bundle gestionale, coi codici copiati VERBATIM dall'app-kit di P-65
// (app/byup-app-kit.jsx) — id, code e ordine identici, così quando i due
// bundle si unificheranno la corrispondenza sarà già scritta. Nota di
// mappatura: l'id `lattosio` sta sul code `milk`, perché l'allergene di
// legge è il LATTE — l'etichetta parla come parlano le persone, il codice
// come parla la norma. Mai testo libero: l'allergene viaggia solo come
// codice, e mai nello stesso testo del nome di una persona (art. 9 GDPR).
const PN_ALLERGENI = [
  { id: 'glutine',      code: 'gluten',      label: 'Glutine',         hint: 'Pane, pasta, dolci',           color: '#c8a87a', icon: '🌾' },
  { id: 'crostacei',    code: 'crustaceans', label: 'Crostacei',       hint: 'Gamberi, scampi, granchio',    color: '#e88a5a', icon: '🦐' },
  { id: 'uova',         code: 'eggs',        label: 'Uova',            hint: 'Frittate, dolci, salse',       color: '#f0c14b', icon: '🥚' },
  { id: 'pesce',        code: 'fish',        label: 'Pesce',           hint: 'Acciughe, salse di pesce',     color: '#d96a52', icon: '🐟' },
  { id: 'arachidi',     code: 'peanuts',     label: 'Arachidi',        hint: 'Creme, salse, fritti',         color: '#c89860', icon: '🥜' },
  { id: 'soia',         code: 'soybeans',    label: 'Soia',            hint: 'Tofu, tempeh, salsa di soia',  color: '#9ec27a', icon: '🌱' },
  { id: 'lattosio',     code: 'milk',        label: 'Lattosio',        hint: 'Latte, formaggi, burro',       color: '#f5c2c7', icon: '🥛' },
  { id: 'fruttaguscio', code: 'nuts',        label: 'Frutta a guscio', hint: 'Noci, nocciole, mandorle',     color: '#a07050', icon: '🥜' },
  { id: 'sedano',       code: 'celery',      label: 'Sedano',          hint: 'Brodi, soffritti',             color: '#7ec98a', icon: '🥬' },
  { id: 'senape',       code: 'mustard',     label: 'Senape',          hint: 'Salse, marinature',            color: '#e8c850', icon: '🌶' },
  { id: 'sesamo',       code: 'sesame',      label: 'Sesamo',          hint: 'Pane, hummus, condimenti',     color: '#d4b06a', icon: '⚪' },
  { id: 'solfiti',      code: 'sulphites',   label: 'Solfiti',         hint: 'Vino, frutta secca, conserve', color: '#b07ac0', icon: '🍇' },
  { id: 'lupini',       code: 'lupin',       label: 'Lupini',          hint: 'Farine, sostituti vegetali',   color: '#f0b878', icon: '🫘' },
  { id: 'molluschi',    code: 'molluscs',    label: 'Molluschi',       hint: 'Cozze, vongole, calamari',     color: '#7aa8c8', icon: '🐚' },
];
window.PN_ALLERGENI = PN_ALLERGENI;
window.PN_ALLERGENI_MAP = PN_ALLERGENI.reduce((m, a) => { m[a.id] = a; return m; }, {});

// ─── Profili IVA dell'articolo fuori menù (P-11 · D-16) ────────────────────
// Dizionario di piattaforma: governato da Hubble, qui mockato. Le voci si
// etichettano per caso d'uso con la base normativa nell'hint, MAI come
// percentuali nude. L'articolo fuori catalogo non ha nulla da cui derivare
// l'IVA: la dichiara chi lo batte, scegliendo una di queste. La prima è il
// default sempre preselezionato: copre la somministrazione (n. 121, Tab. A
// parte III, DPR 633/72 — nel locale l'aliquota è una per tutto, bevande
// comprese) e i preparati da asporto (L. 178/2020, art. 1 co. 40).
// La voce a 10% è UNA a schermo ma DUE profili nel modello
// (vat_rate_profiles per service_mode, risolti da delivery_mode — ERD v11):
// sulla riga si congela somministrazione_10 nel locale, asporto_preparato_10
// da asporto. Le altre due voci sono un profilo ciascuna.
const PN_IVA_PROFILI = [
  { id: 'dieci', label: 'Somministrato o preparato qui · 10%', aliquota: 10,
    perModo: { locale: 'somministrazione_10', asporto: 'asporto_preparato_10' },
    base: 'Somministrazione (n. 121, Tab. A parte III, DPR 633/72) e cibi preparati da asporto (L. 178/2020, art. 1 co. 40); vi rientrano anche pasticceria, biscotteria e panetteria fine confezionate da asporto (voce 68, Tab. A parte III).' },
  { id: 'asporto_confezionato_22', label: 'Bevande e confezionati al 22%', aliquota: 22,
    base: 'Bibite, alcolici, acqua sigillata; dolciumi e cioccolato in confezioni di pregio.' },
  { id: 'asporto_alimentari_base_4', label: 'Alimentari di base da asporto · 4%', aliquota: 4,
    base: 'Paniere Tab. A parte II, DPR 633/72: pane e panetteria ordinaria, pasta, latte fresco, burro, formaggi, frutta e verdura, olio d\'oliva.' },
];
window.PN_IVA_PROFILI = PN_IVA_PROFILI;
// L'id che si congela sulla riga, risolto dal modo dell'ordine.
window.pnIvaProfiloId = (voce, asporto) =>
  voce.perModo ? voce.perModo[asporto ? 'asporto' : 'locale'] : voce.id;
// La voce del dizionario a partire dall'id congelato (per tag e riproposta).
window.pnIvaVoceDiProfilo = (profiloId) =>
  PN_IVA_PROFILI.find(v => v.id === profiloId
    || (v.perModo && (v.perModo.locale === profiloId || v.perModo.asporto === profiloId)));

const PN_PARTNER = {
  justeat:   { sigla:'JE', nome:'Just Eat',  bg:'#FF8000', ink:'#FFFFFF' },
  glovo:     { sigla:'G',  nome:'Glovo',     bg:'#FFC244', ink:'#0A1929' },
  deliveroo: { sigla:'D',  nome:'Deliveroo', bg:'#00CCBC', ink:'#0A1929' },
};
window.PN_PARTNER = PN_PARTNER;

// ─── Gusti: categorie di locale e tag cibo (P-29 · D-28) ───────────────────
// Dizionario di piattaforma (taste_tags del modello): governato da Hubble,
// qui mockato — la copia del bundle gestionale, come PN_ALLERGENI. Lo stesso
// vocabolario era scritto in tre modi in tre superfici; il dizionario è uno,
// e il gestionale lo LEGGE, non lo scrive. Le voci viaggiano come codici
// stabili: l'etichetta cambia lingua, il codice no.
//   kind venue_category — «che cosa il locale è»: UNA per locale. La lista
//     che fa fede è questa (D-28). Porta icona e descrizione perché a schermo
//     è una tessera con hover, non una riga.
//   kind food_tag — «che cosa vi si mangia»: più d'uno per locale; il limite
//     di quattro è regola di prodotto del gestionale (VETRINA_MAX_TAG_CIBO in
//     impostazioni-vetrina.jsx), non del dizionario.
//   selectable_by_consumer — se il consumatore può spuntarla come gusto sul
//     proprio profilo (P-28 la consumerà). Falso sulle categorie: il gusto è
//     cosa si mangia, non cosa il locale è. Falso sulle tre voci che sulla
//     persona sono un REGIME (vegano, vegetariano, senza glutine): il
//     ristoratore le sceglie per il locale, il consumatore non le spunta mai
//     come gusto — sono is_dietary_regime, dato art. 9 GDPR se dichiarato su
//     di sé (gli id coincidono con REGIMI dell'app-kit, la corrispondenza è
//     già scritta).
// Tensioni segnalate e NON risolte qui, ciascuna nella sua sessione: il
// foglio filtri della discovery nell'app offre Vegetariano/Vegano/Per celiaci
// come filtri sui locali (gestionale/CLAUDE.md riga 50), e un filtro usato
// sempre rivela quanto un gusto dichiarato; Hubble scrive un vocabolario suo
// (Trattoria, Osteria, Pub in admin-data.jsx e nei coefficienti di Valore e
// Mercato) che non combacia con queste otto; la pagina Piattaforma di Hubble
// non ha ancora un posto dove i dizionari si vedano (una pillola «Dizionari»
// accanto a Piani, Pesi e Discovery), e in ogni caso è un altro bundle: ci
// andrà una copia verbatim, come qui per gli allergeni.
const PN_GUSTI = [
  { id:'ristorante',    kind:'venue_category', label:'Ristorante',     icon:'forkKnife', desc:'Cucina completa con servizio al tavolo, pranzo e cena',   selectable_by_consumer:false, is_dietary_regime:false },
  { id:'pizzeria',      kind:'venue_category', label:'Pizzeria',       icon:'pizza',     desc:'La pizza al centro del menù, al tavolo o d\'asporto',      selectable_by_consumer:false, is_dietary_regime:false },
  { id:'giapponese',    kind:'venue_category', label:'Giapponese',     icon:'fish',      desc:'Sushi, ramen e cucina nipponica',                          selectable_by_consumer:false, is_dietary_regime:false },
  { id:'carne_griglia', kind:'venue_category', label:'Carne e Griglia',icon:'steak',     desc:'Braceria: tagli, grigliate e affumicati',                  selectable_by_consumer:false, is_dietary_regime:false },
  { id:'cucina_etnica', kind:'venue_category', label:'Cucina etnica',  icon:'globe',     desc:'Sapori dal mondo: indiano, messicano, mediorientale',      selectable_by_consumer:false, is_dietary_regime:false },
  { id:'bar',           kind:'venue_category', label:'Bar',            icon:'coffee',    desc:'Caffetteria, colazioni e aperitivi veloci',                selectable_by_consumer:false, is_dietary_regime:false },
  { id:'bistrot',       kind:'venue_category', label:'Bistrot',        icon:'cheers',    desc:'Informale e curato: piatti semplici e buoni vini',         selectable_by_consumer:false, is_dietary_regime:false },
  { id:'enoteca',       kind:'venue_category', label:'Enoteca',        icon:'wine',      desc:'Vini al calice con taglieri e degustazioni',               selectable_by_consumer:false, is_dietary_regime:false },

  { id:'pizza',         kind:'food_tag', label:'Pizza',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'sushi',         kind:'food_tag', label:'Sushi',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'pasta',         kind:'food_tag', label:'Pasta',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'hamburger',     kind:'food_tag', label:'Hamburger',     selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'carne',         kind:'food_tag', label:'Carne',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'pesce',         kind:'food_tag', label:'Pesce',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'poke',          kind:'food_tag', label:'Poke',          selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'ramen',         kind:'food_tag', label:'Ramen',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'vegano',        kind:'food_tag', label:'Vegano',        selectable_by_consumer:false, is_dietary_regime:true  },
  { id:'vegetariano',   kind:'food_tag', label:'Vegetariano',   selectable_by_consumer:false, is_dietary_regime:true  },
  { id:'senza_glutine', kind:'food_tag', label:'Senza glutine', selectable_by_consumer:false, is_dietary_regime:true  },
  { id:'dolci',         kind:'food_tag', label:'Dolci',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'gelato',        kind:'food_tag', label:'Gelato',        selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'brunch',        kind:'food_tag', label:'Brunch',        selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'aperitivo',     kind:'food_tag', label:'Aperitivo',     selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'cinese',        kind:'food_tag', label:'Cinese',        selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'indiano',       kind:'food_tag', label:'Indiano',       selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'messicano',     kind:'food_tag', label:'Messicano',     selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'kebab',         kind:'food_tag', label:'Kebab',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'frittura',      kind:'food_tag', label:'Frittura',      selectable_by_consumer:true,  is_dietary_regime:false },
];
window.PN_GUSTI = PN_GUSTI;
window.PN_GUSTI_MAP = PN_GUSTI.reduce((m, g) => { m[g.id] = g; return m; }, {});
window.PN_CATEGORIE_LOCALE = PN_GUSTI.filter(g => g.kind === 'venue_category');
window.PN_TAG_CIBO = PN_GUSTI.filter(g => g.kind === 'food_tag');
// L'etichetta da un codice, per chi mostra e non sceglie (anteprima, vetrina).
window.pnGustoLabel = (id) => (window.PN_GUSTI_MAP[id] || {}).label || '';

// ─── Servizi del locale: dotazioni e modalità di servizio (P-67 · L1-30) ───
// Dizionario di piattaforma (venue_amenities del modello): governato da
// Hubble, qui mockato. Due kind, e la distinzione non è cosmetica: un filtro
// sulla MODALITÀ non deve mai pescare una DOTAZIONE.
//   kind amenity      — cosa il locale ha (wifi, dehors, parcheggio…).
//   kind service_mode — come il locale serve (al tavolo, al banco).
// Semantica della dichiarazione: il locale tiene l'insieme dei codici
// DICHIARATI. Un codice assente vale «non dichiarato», mai «assente» — la
// vetrina non promette che il locale non abbia una dotazione. Per questo a
// schermo non esiste un terzo stato: spento è silenzio, non un no.
// Le voci di prima senza codice sono cadute (Parcheggio custodito, che
// doppiava Parcheggio, e Compleanni, che è un evento e non una dotazione);
// «Rampa per disabili» è diventata la promessa che descrive, accessibile in
// carrozzina, perché la rampa è un mezzo. L'icona è la chiave in VIcon
// (impostazioni-vetrina.jsx).
const PN_SERVIZI = [
  { id:'wifi_gratuito',             kind:'amenity',      label:'WiFi gratuito',             icon:'wifi'       },
  { id:'dehors',                    kind:'amenity',      label:'Dehors',                    icon:'dehors'     },
  { id:'parcheggio',                kind:'amenity',      label:'Parcheggio',                icon:'car'        },
  { id:'accessibile_in_carrozzina', kind:'amenity',      label:'Accessibile in carrozzina', icon:'wheelchair' },
  { id:'animali_ammessi',           kind:'amenity',      label:'Animali ammessi',           icon:'paw'        },
  { id:'menu_non_vedenti',          kind:'amenity',      label:'Menù per non vedenti',      icon:'braille'    },
  { id:'servizio_al_tavolo',        kind:'service_mode', label:'Servizio al tavolo',        icon:'bell'       },
  { id:'al_banco',                  kind:'service_mode', label:'Al banco',                  icon:'banco'      },
];
window.PN_SERVIZI = PN_SERVIZI;
window.PN_SERVIZI_MAP = PN_SERVIZI.reduce((m, v) => { m[v.id] = v; return m; }, {});

// ─── Chi guarda il gestionale (P-33 · D-30) ────────────────────────────────
// Il gestionale non ha un login nel prototipo, e finora nessuna pagina sapeva
// chi la guarda. Questo è l'utente corrente mock: di norma il titolare; per la
// demo `?ruolo=cassa` o `?ruolo=cameriere` lo sostituisce. Le aree per ruolo
// sono la copia dei tre ruoli di sistema di ROLES in impostazioni-personale.jsx
// (altro bundle): un ruolo personalizzato con l'area «statistiche» vede le
// Statistiche come il titolare, la squadra (Cassa, Cameriere) mai.
// Coda registrata, non risolta qui: la sidebar condivisa mostra ancora tutte le
// voci a tutti; nascondere le voci per ruolo è un lavoro su tutte le pagine.
const PN_RUOLI_AREE = {
  titolare:  ['panoramica','sala','vendita','cucina','app','statistiche','contabilita','supporto','impostazioni'],
  cassa:     ['vendita','sala'],
  cameriere: ['app'],
};
const PN_RUOLI_LABEL = { titolare: 'Titolare', cassa: 'Cassa', cameriere: 'Cameriere' };
const PN_UTENTE = (() => {
  let r = 'titolare';
  try { const q = new URLSearchParams(window.location.search).get('ruolo'); if (q && PN_RUOLI_AREE[q]) r = q; } catch (e) {}
  return { nome: 'Mario Rossi', ruolo: r, ruoloLabel: PN_RUOLI_LABEL[r], aree: PN_RUOLI_AREE[r] };
})();
window.PN_UTENTE = PN_UTENTE;
window.pnPuo = (area) => PN_UTENTE.aree.includes(area);

// ─── Statistiche di servizio: l'informazione al personale (P-35 · D-30) ────
// Il testo unico che l'app di incasso (staff/) e quella di sala (cameriere/)
// mostrano al primo accesso, e che il profilo lascia rileggere. È una presa
// d'atto di un'informazione, MAI un consenso: il pulsante dice «Ho letto», il
// testo dice che non è un consenso e che non sostituisce l'informativa del
// datore di lavoro, che è il soggetto obbligato a informare (art. 4 co. 3, L.
// 300/1970). La pressione si registra in consent_events con tipo
// staff_metrics_notice: è il presidio che scala col ricambio del personale,
// dove una conferma resa una volta dal titolare invecchierebbe al primo
// cambio. Vive qui perché i due bundle caricano questo file.
// Coda registrata: il termine di conservazione lato responsabile non è fissato
// da nessun documento in repo; qui la durata rimanda al datore di lavoro.
const PN_STAFF_NOTICE = {
  titolo: 'Statistiche di servizio',
  intro: 'È un\'informazione, non una richiesta di consenso: ti diciamo che cosa il gestionale produce su di te mentre lavori. Non sostituisce l\'informativa del tuo datore di lavoro, che resta il soggetto tenuto a informarti.',
  blocchi: [
    { t: 'Quali dati',
      p: 'Il gestionale calcola, riferiti a te per nome: lo scontrino medio dei conti che chiudi, gli ordini che gestisci, i tavoli che servi e le mance per tavolo che raccogli. Restano fuori lo scostamento di cassa, che è un dato del locale e non della persona, e gli atti di rettifica — resi e annulli — che sono documenti fiscali del locale.' },
    { t: 'Chi li vede',
      p: 'Il titolare del locale e i ruoli a cui abilita l\'area Statistiche del gestionale. Mai i colleghi. Byup li tratta per conto del locale e non li usa per fini propri.' },
    { t: 'Per quali finalità',
      p: 'Organizzare il servizio e valutare la prestazione: tutti i fini connessi al rapporto di lavoro, come prevede l\'art. 4, comma 3, dello Statuto dei lavoratori (L. 300/1970).' },
    { t: 'Per quanto tempo',
      p: 'Per la durata del rapporto di lavoro; i termini successivi li definisce il tuo datore di lavoro nella sua informativa.' },
  ],
  chiusura: 'Premendo «Ho letto» registri solo di aver ricevuto questa informazione: non è un consenso. La ritrovi quando vuoi nel tuo profilo.',
  bottone: 'Ho letto',
};
window.PN_STAFF_NOTICE = PN_STAFF_NOTICE;

// ─── Sistemi di AI e provenienza dei contenuti generati (P-40 · D-32) ──────
// ai_systems_registry e ai_content_provenance del modello, qui mockati. Il
// contrassegno da solo dichiara che un testo è sintetico ma non consente di
// dimostrarlo: la provenienza è un dato, con FK all'aggregato di Hubble, e per
// questo description_ai_provenance_id è obbligatorio quando la marca è vera.
// Decorrenza della marcatura leggibile dalla macchina (art. 50 Reg. UE
// 2024/1689, CRA-10): NON è la costante del 2 dicembre 2026 — quella è la
// scadenza del transitorio per i sistemi immessi PRIMA del 2 agosto 2026 (art.
// 111 co. 4) — ma si legge dalla decorrenza dichiarata per il sistema che ha
// generato il testo, transparency_obligation_from. Byup immette dopo, quindi
// per noi vale dall'immissione: la data qui sotto è quella.
const PN_AI_SISTEMI = [
  { id: 'ais-menu-writer', nome: 'Byup Menu Writer', modello: 'Claude (Anthropic) via API',
    scopo: 'Descrizioni brevi dei piatti su richiesta del ristoratore',
    placed_on_market_at: '2026-09-15', transparency_obligation_from: '2026-09-15' },
];
window.PN_AI_SISTEMI = PN_AI_SISTEMI;
window.PN_AI_SISTEMI_MAP = PN_AI_SISTEMI.reduce((m, x) => { m[x.id] = x; return m; }, {});
// Il contrassegno al consumatore, com'è scritto a schermo: la pillola e la
// nota che si apre dalla «i». Il consumer (app/menu.jsx, altro bundle) ne porta
// la copia verbatim; il record di provenienza lo conserva in disclosure_text,
// così si può dimostrare CHE COSA il consumatore ha letto, non solo che un
// contrassegno c'era.
const PN_AI_DISCLOSURE = {
  badge: '✨ IA',
  testo: 'Descrizione scritta con intelligenza artificiale su richiesta del locale, che l\'ha rivista. Ingredienti e allergeni li dichiara il locale.',
};
window.PN_AI_DISCLOSURE = PN_AI_DISCLOSURE;

// L'aggregato delle provenienze: in produzione vive in Hubble, qui è un
// registro in memoria che cresce a ogni generazione. Una riga per output.
//   entity / content_domain — l'elenco dei content_domain nella nota del
//     modello non nomina la descrizione del menù, ma la FK da menu_items
//     (description_ai_provenance_id) la presuppone: il valore usato,
//     `menu_item_description`, è coerente con l'entità e lo si dichiara qui.
//   marking_method = machine_readable_flag — la marcatura leggibile dalla
//     macchina è il flag nel dato, sul record e sul piatto. Per contenuti che
//     circolano fuori dalla piattaforma da solo non basterebbe (un file che
//     esce perde il dato che lo accompagna); la descrizione vive in base dati
//     e non circola come file, quindi regge.
//   ui_badge_shown / disclosure_text — se la superficie consumer ha mostrato
//     il contrassegno, e il testo esatto della pillola. L'avviso in
//     superficie è un adempimento DISTINTO e non alternativo alla marcatura:
//     il flag dice alla macchina, la pillola dice alla persona, e servono
//     entrambi.
//   human_validated_by / human_validated_at — si valorizzano al SALVATAGGIO
//     del piatto con descrizione generata (pnAiProvenienzaValidata), non alla
//     generazione: per i contenuti del catalogo l'approvazione spetta al
//     ristoratore, che resta responsabile dell'esattezza.
const pnAiProvenienzaBase = (rec) => Object.assign({
  content_domain: 'menu_item_description',
  marking_method: 'machine_readable_flag',
  ui_badge_shown: true,
  disclosure_text: PN_AI_DISCLOSURE.testo,
  human_validated_by: null, human_validated_at: null,
}, rec);
window.PN_AI_PROVENIENZE = [
  pnAiProvenienzaBase({ id: 'prov-0001', system_id: 'ais-menu-writer', entity: 'menu_items.description', entity_id: 'a1',
    generated_at: '2026-09-16T10:12:00Z', human_validated_by: 'Mario Rossi', human_validated_at: '2026-09-16T10:14:30Z' }),
  pnAiProvenienzaBase({ id: 'prov-0002', system_id: 'ais-menu-writer', entity: 'menu_items.description', entity_id: 'p2',
    generated_at: '2026-09-18T15:40:00Z', human_validated_by: 'Mario Rossi', human_validated_at: '2026-09-18T15:41:05Z' }),
];
window.pnAiProvenienza = (entity, entityId, systemId = 'ais-menu-writer') => {
  const rec = pnAiProvenienzaBase({ id: 'prov-' + String(window.PN_AI_PROVENIENZE.length + 1).padStart(4, '0'),
    system_id: systemId, entity, entity_id: entityId, generated_at: new Date().toISOString() });
  window.PN_AI_PROVENIENZE.push(rec);
  return rec;
};
// Al salvataggio del piatto: chi ha rivisto la descrizione generata.
window.pnAiProvenienzaValidata = (provId, nome) => {
  const rec = window.PN_AI_PROVENIENZE.find(r => r.id === provId);
  if (rec) { rec.human_validated_by = nome; rec.human_validated_at = new Date().toISOString(); }
  return rec;
};

// ─── Chiusure straordinarie del locale (P-46 · D-34) ───────────────────────
// venue_closures del modello: starts_on e ends_on con l'ULTIMO GIORNO COMPRESO
// (la chiusura di un giorno solo li ha uguali), reason facoltativo — testo
// breve destinato alla vetrina, nessun dato personale: «ferie», «lavori», mai
// nomi o circostanze. Erano solo interfaccia dentro il popup degli orari e si
// perdevano alla chiusura; ora si persistono (localStorage, pattern di casa)
// e raggiungono la vetrina — l'anteprima nelle Impostazioni e la scheda
// consumer — e le prenotazioni, dove i giorni coperti si vedono e non si
// scelgono.
// SECONDO SCOPO, che qui si commenta e NON si implementa: il modello dà alla
// tabella anche il compito di «non contare le ferie come inattività» — è il
// ciclo di vita del locale in Hubble (D-34; admin-data.jsx, stato `inactive`
// per chi non logga da N giorni). Chi costruirà quel calcolo legge le
// chiusure da qui e non conta i giorni coperti.
// SPECIFICA MANCANTE, non risolta qui: una chiusura che copre prenotazioni
// già prese. L'operatore va fermato al salvataggio col conteggio delle
// prenotazioni coinvolte, e il cliente va avvisato sulla sua prenotazione con
// l'invito a contattare il locale — il flusso (chi decide, quale notifica,
// che cosa resta) va scritto nella SFA. Il prototipo oggi non lo mostra.
// Il seme è ancorato all'oggi reale a ogni caricamento (una chiusura fra tre
// giorni, per tre giorni) più le festività di fine anno; in localStorage
// finiscono solo le aggiunte e le rimozioni dell'utente, così il seme non
// invecchia.
const pnISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const pnOggiISO = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return pnISO(d); };
const pnGiorniDaOggi = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return pnISO(d); };
const PN_CHIUSURE_SEME = (() => {
  const oggi = new Date();
  const anno = (oggi.getMonth() === 11 && oggi.getDate() > 30) ? oggi.getFullYear() + 1 : oggi.getFullYear();
  return [
    { id: 'cl-ferie',     starts_on: pnGiorniDaOggi(3), ends_on: pnGiorniDaOggi(5), reason: 'Ferie' },
    { id: 'cl-festivita', starts_on: `${anno}-12-25`,   ends_on: `${anno}-12-30`,   reason: 'Festività' },
  ];
})();
const PN_CHIUSURE_KEY = 'byup_chiusure';
window.byupReadChiusure = function () {
  let delta = { aggiunte: [], rimossi: [] };
  try { const s = localStorage.getItem(PN_CHIUSURE_KEY); if (s) delta = Object.assign(delta, JSON.parse(s)); } catch (e) {}
  return PN_CHIUSURE_SEME.filter(c => !delta.rimossi.includes(c.id)).concat(delta.aggiunte)
    .sort((a, b) => a.starts_on < b.starts_on ? -1 : 1);
};
window.byupWriteChiusure = function (lista) {
  const semi = PN_CHIUSURE_SEME.map(c => c.id);
  const delta = {
    aggiunte: lista.filter(c => !semi.includes(c.id)),
    rimossi: semi.filter(id => !lista.some(c => c.id === id)),
  };
  try { localStorage.setItem(PN_CHIUSURE_KEY, JSON.stringify(delta)); } catch (e) {}
  window.dispatchEvent(new Event('byup-chiusure-change'));
};
// La chiusura che copre un giorno (ISO), o null.
window.pnChiusuraDelGiorno = (iso, lista) =>
  (lista || window.byupReadChiusure()).find(c => c.starts_on <= iso && iso <= c.ends_on) || null;
// La prossima chiusura non ancora finita (quella in corso compresa), o null.
window.pnProssimaChiusura = (lista) => {
  const oggi = pnOggiISO();
  return (lista || window.byupReadChiusure()).find(c => c.ends_on >= oggi) || null;
};
// «gio 5 set»
window.pnGiornoBreve = (iso) => new Date(`${iso}T00:00`).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
// Il primo giorno aperto da una data in poi (per il selettore di prenotazione).
window.pnPrimoGiornoAperto = (iso, lista) => {
  const l = lista || window.byupReadChiusure();
  let d = new Date(`${iso}T00:00`);
  for (let i = 0; i < 120; i++) { const k = pnISO(d); if (!window.pnChiusuraDelGiorno(k, l)) return k; d.setDate(d.getDate() + 1); }
  return iso;
};
// La frase per la vetrina: oggi coperto → «Chiuso oggi · Ferie» o «Chiuso
// fino a sab 7 set · Ferie»; chiusura futura → «Chiuso gio 5 set · Ferie» o
// «Chiuso dal gio 5 al sab 7 set · Ferie». Il motivo solo se c'è.
window.pnChiusuraTesto = (c) => {
  if (!c) return '';
  const oggi = pnOggiISO();
  const motivo = c.reason ? ` · ${c.reason}` : '';
  const singola = c.starts_on === c.ends_on;
  if (c.starts_on <= oggi && oggi <= c.ends_on) {
    return (singola || c.ends_on === oggi ? 'Chiuso oggi' : `Chiuso fino a ${window.pnGiornoBreve(c.ends_on)}`) + motivo;
  }
  return (singola ? `Chiuso ${window.pnGiornoBreve(c.starts_on)}`
    : `Chiuso dal ${window.pnGiornoBreve(c.starts_on)} al ${window.pnGiornoBreve(c.ends_on)}`) + motivo;
};
window.pnOggiISO = pnOggiISO;
