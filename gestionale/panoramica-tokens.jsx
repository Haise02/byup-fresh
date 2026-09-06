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
  // banner in onboarding, la tessera in Integrazioni, il POS mobile e
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
// un #06C167 ammorbidito non è più il verde di Uber Eats.
// Le piattaforme predisposte sono TRE (P-119 · D-106): Glovo, Deliveroo e
// Uber Eats, le cui specifiche sono in raccolta dal 3 settembre 2026. Just
// Eat è uscita dal prodotto e dal modello: la sua documentazione non è
// acquisibile, e ciò che non è riscontrabile non si progetta. L'add-on resta
// spento nell'MVP: nel prototipo il contrassegno è la lingua visiva già
// pronta per quando gli accordi ci saranno.
// ─── Allergeni: il dizionario unico dei quattordici (P-24 · D-27; P-109) ───
// Allegato II del Reg. UE 1169/2011. La fonte VERA è il dizionario di
// piattaforma (`allergens` del modello); questa è la copia del bundle
// gestionale, e l'identificativo è il CODICE del modello (gluten, milk,
// nuts…), lo stesso `code` che porta il dizionario dell'app
// (app/byup-app-kit.jsx). Da P-109 nel gestionale l'elenco è UNO: le
// prenotazioni, i piatti del menù e la scheda del tavolo parlano con questi
// codici, e i due elenchi che prima divergevano (`latte` contro `lattosio`,
// `frutta-guscio` contro `fruttaguscio`) sopravvivono solo come alias per i
// dati già scritti. L'etichetta è quella di legge, per esteso («Latte», non
// «Lattosio»). Mai testo libero: l'allergene viaggia solo come codice, e
// mai nello stesso testo del nome di una persona (art. 9 GDPR).
const PN_ALLERGENI = [
  { id: 'gluten',      label: 'Glutine',         hint: 'Pane, pasta, dolci',           color: '#c8a87a', icon: '🌾', alias: ['glutine'] },
  { id: 'crustaceans', label: 'Crostacei',       hint: 'Gamberi, scampi, granchio',    color: '#e88a5a', icon: '🦐', alias: ['crostacei'] },
  { id: 'eggs',        label: 'Uova',            hint: 'Frittate, dolci, salse',       color: '#f0c14b', icon: '🥚', alias: ['uova'] },
  { id: 'fish',        label: 'Pesce',           hint: 'Acciughe, salse di pesce',     color: '#d96a52', icon: '🐟', alias: ['pesce'] },
  { id: 'peanuts',     label: 'Arachidi',        hint: 'Creme, salse, fritti',         color: '#c89860', icon: '🥜', alias: ['arachidi'] },
  { id: 'soybeans',    label: 'Soia',            hint: 'Tofu, tempeh, salsa di soia',  color: '#9ec27a', icon: '🌱', alias: ['soia'] },
  { id: 'milk',        label: 'Latte',           hint: 'Latte, formaggi, burro',       color: '#f5c2c7', icon: '🥛', alias: ['latte', 'lattosio'] },
  { id: 'nuts',        label: 'Frutta a guscio', hint: 'Noci, nocciole, mandorle',     color: '#a07050', icon: '🥜', alias: ['frutta-guscio', 'fruttaguscio'] },
  { id: 'celery',      label: 'Sedano',          hint: 'Brodi, soffritti',             color: '#7ec98a', icon: '🥬', alias: ['sedano'] },
  { id: 'mustard',     label: 'Senape',          hint: 'Salse, marinature',            color: '#e8c850', icon: '🌶', alias: ['senape'] },
  { id: 'sesame',      label: 'Sesamo',          hint: 'Pane, hummus, condimenti',     color: '#d4b06a', icon: '⚪', alias: ['sesamo'] },
  { id: 'sulphites',   label: 'Solfiti',         hint: 'Vino, frutta secca, conserve', color: '#b07ac0', icon: '🍇', alias: ['solfiti'] },
  { id: 'lupin',       label: 'Lupini',          hint: 'Farine, sostituti vegetali',   color: '#f0b878', icon: '🫘', alias: ['lupini'] },
  { id: 'molluscs',    label: 'Molluschi',       hint: 'Cozze, vongole, calamari',     color: '#7aa8c8', icon: '🐚', alias: ['molluschi'] },
];
PN_ALLERGENI.forEach(a => { a.code = a.id; });
window.PN_ALLERGENI = PN_ALLERGENI;
// La mappa risponde al codice e agli alias: i dati scritti prima di P-109
// (`glutine`, `lattosio`, `frutta-guscio`) trovano la stessa voce.
window.PN_ALLERGENI_MAP = PN_ALLERGENI.reduce((m, a) => { m[a.id] = a; (a.alias || []).forEach(x => { m[x] = a; }); return m; }, {});
window.pnAllergene = (x) => window.PN_ALLERGENI_MAP[x] || null;
window.pnAllergeneLabel = (x) => { const a = window.pnAllergene(x); return a ? a.label : String(x || ''); };

// ─── Tipologia dell'articolo (P-108 · D-105, che rivede D-16) ──────────────
// Chi batte un articolo fuori menù, e chi compila un piatto del menù, non
// sceglie un'aliquota né un profilo IVA: dichiara CHE COSA vende, fra cinque
// tipologie di un dizionario di piattaforma (item_kinds del modello,
// governato da Hubble, qui mockato), e il profilo IVA discende dalla
// tipologia e dal modo di consumo dell'ordine — al banco o al tavolo
// (somministrazione, voce 121 Tab. A parte III DPR 633/72: tutto al 10%)
// oppure da asporto (cessione: la legge elenca i prodotti uno per uno).
// Le cinque voci sono raggruppamenti nostri, non categorie di legge: per
// questo il dizionario è di piattaforma e lo cura Hubble, che corregge o
// arricchisce la spiegazione senza rilascio, e non si chiede al ristoratore
// di interpretare la tabella. La prima è la proposta per tutti (P-126: la
// preselezione di sede non esiste) e chi batte la cambia con un tocco.
// Sulla riga d'ordine si congela il profilo (vat_rate_profiles, ERD v11)
// risolto da tipologia × modo; al cambio di modo si ricalcola da solo. La
// formulazione precedente (P-11) chiedeva l'aliquota e la ricavava da due
// spunte con una regola sbagliata per acqua e birra.
// DIZIONARIO GOVERNATO DA HUBBLE (P-164 · D-112; ridisegno del 6 settembre
// 2026). Le voci vivono in un registro condiviso sullo stesso dominio
// (byup_tipologie_articolo) che Hubble scrive in Piattaforma → «Aliquote degli
// articoli» e il gestionale LEGGE: ogni voce ha un nome, una descrizione,
// un'aliquota per il consumo sul posto e una da asporto. Niente altro nel
// prototipo: i fondamenti di legge stanno nei documenti. Se la legge cambia,
// l'operatore cambia i numeri o divide una voce — un giorno il pane sta al 4%,
// un altro è una voce a sé — e i nomi di prima (PN_TIPOLOGIE_ARTICOLO,
// PN_TIPOLOGIA_DEFAULT, pnTipologia…) leggono dal registro, così chi crea un
// articolo propone queste voci, in quest'ordine, con questa descrizione.
// Sulla riga d'ordine si congela il profilo risolto da voce × modo
// (vat_rate_profiles): cambia il numero, cambia il profilo, e la riga scritta
// prima resta col suo. Quello che qui sotto è una costante è il SEME.
const PN_TIPOLOGIE_SEME = [
  { id: 'piatti_preparati', ordine: 1, label: 'Piatti, panini, caffè, dolci e pasticceria', spiegazione: 'Quello che il locale prepara o serve.', locale: { aliquota: 10 }, asporto: { aliquota: 10 }, valida_dal: '2026-01-01', valida_al: null },
  { id: 'acqua_birra', ordine: 2, label: 'Acqua e birra', spiegazione: 'Anche in bottiglia o lattina sigillata.', locale: { aliquota: 10 }, asporto: { aliquota: 10 }, valida_dal: '2026-01-01', valida_al: null },
  { id: 'bibite_alcolici_confezionati', ordine: 3, label: 'Bibite, vino, alcolici, dolciumi confezionati', spiegazione: 'Bibite gassate, vino, superalcolici, cioccolato e dolciumi in confezione.', locale: { aliquota: 10 }, asporto: { aliquota: 22 }, valida_dal: '2026-01-01', valida_al: null },
  { id: 'alimentari_base', ordine: 4, label: 'Pane, pasta, latte, formaggi, frutta e verdura', spiegazione: 'Alimentari di base venduti così come sono: pane comune, latte fresco, frutta e ortaggi freschi o surgelati. Non ci stanno dolci da forno, latte zuccherato, frutta e verdura conservate o candite.', locale: { aliquota: 10 }, asporto: { aliquota: 4 }, valida_dal: '2026-01-01', valida_al: null },
  { id: 'non_alimentari', ordine: 5, label: 'Oggetti non alimentari', spiegazione: 'Gadget, tazze, magliette e tutto ciò che non si mangia né si beve.', locale: { aliquota: 22 }, asporto: { aliquota: 22 }, valida_dal: '2026-01-01', valida_al: null },
];
const PN_TIPOLOGIE_KEY = 'byup_tipologie_articolo';
const pnOggiIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const pnInVigore = (x, g) => (!x.valida_dal || x.valida_dal <= g) && (!x.valida_al || x.valida_al > g);
// Il numero di un lato. Le forme scritte prima del ridisegno (un trattamento
// puntato, con un cambio programmato) si leggono ancora, risolte al numero.
const pnLatoAliquota = (ref, trattamenti, g) => {
  if (ref && ref.aliquota != null && isFinite(Number(ref.aliquota))) return Number(ref.aliquota);
  const profilo = ref && ref.prossimo && ref.prossimo.dal <= g ? ref.prossimo.profilo : (ref ? ref.profilo : null);
  const t = (trattamenti || []).find(x => x.id === profilo);
  return t && isFinite(Number(t.aliquota)) ? Number(t.aliquota) : 10;
};
window.byupReadTipologieRegistro = function () {
  try {
    const s = localStorage.getItem(PN_TIPOLOGIE_KEY);
    if (s) { const v = JSON.parse(s); if (v && Array.isArray(v.tipologie)) {
      const g = pnOggiIso();
      return { versione: v.versione || 0, tipologie: v.tipologie.map(t => ({ ...t, locale: { aliquota: pnLatoAliquota(t.locale, v.trattamenti, g) }, asporto: { aliquota: pnLatoAliquota(t.asporto, v.trattamenti, g) } })) };
    } }
  } catch (e) {}
  return { tipologie: PN_TIPOLOGIE_SEME, versione: 0 };
};
// Le voci in vigore oggi, nell'ordine di Hubble, con i due numeri e il
// profilo che la riga d'ordine congela (voce × modo × aliquota).
window.pnTipologie = function () {
  const g = pnOggiIso(); const reg = window.byupReadTipologieRegistro();
  const lato = (t, k) => { const a = Number((t[k] || {}).aliquota); const al = isFinite(a) ? a : 10; return { aliquota: al, profilo: `${t.id}:${k}:${al}` }; };
  return reg.tipologie.filter(t => pnInVigore(t, g)).slice().sort((a, b) => (a.ordine || 0) - (b.ordine || 0))
    .map(t => ({ ...t, locale: lato(t, 'locale'), asporto: lato(t, 'asporto') }));
};
Object.defineProperty(window, 'PN_TIPOLOGIE_ARTICOLO', { get: () => window.pnTipologie(), configurable: true });
Object.defineProperty(window, 'PN_TIPOLOGIA_DEFAULT', { get: () => (window.pnTipologie()[0] || {}).id, configurable: true });
// La voce di un articolo, con la prima come riserva: per un articolo la cui
// voce è stata tolta, o creato prima del registro, vale la prima.
window.pnTipologia = (id) => { const l = window.pnTipologie(); return l.find(t => t.id === id) || l[0]; };
// Il profilo che si congela sulla riga: voce × modo dell'ordine.
window.pnTipologiaProfilo = (id, asporto) => { const t = window.pnTipologia(id); return asporto ? t.asporto : t.locale; };
window.pnTipologiaAliquota = (id, asporto) => window.pnTipologiaProfilo(id, asporto).aliquota;
// La spiegazione sotto il campo: la descrizione e i due numeri, così chi
// batte vede l'effetto senza saperlo a memoria.
window.pnTipologiaSpiegazione = (id) => {
  const t = window.pnTipologia(id);
  return t.locale.aliquota === t.asporto.aliquota
    ? `${t.spiegazione} IVA ${t.locale.aliquota}% in ogni caso.`
    : `${t.spiegazione} Al banco o al tavolo ${t.locale.aliquota}% · da asporto ${t.asporto.aliquota}%.`;
};
// La voce a partire da un profilo congelato (righe scritte prima): si cerca
// anche fra le voci tolte, perché una riga vecchia le indica.
window.pnTipologiaDiProfilo = (profiloId) => {
  const id = String(profiloId || '').split(':')[0];
  return window.byupReadTipologieRegistro().tipologie.find(t => t.id === id) || null;
};

const PN_PARTNER = {
  glovo:     { sigla:'G',  nome:'Glovo',     bg:'#FFC244', ink:'#0A1929' },
  deliveroo: { sigla:'D',  nome:'Deliveroo', bg:'#00CCBC', ink:'#0A1929' },
  ubereats:  { sigla:'UE', nome:'Uber Eats', bg:'#06C167', ink:'#0A1929' },
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
// come filtri sui locali (specifica dei flussi 14.2), e un filtro usato
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
// La sidebar condivisa (panoramica-sidebar.jsx) costruisce le sue voci da qui
// (P-135): la voce di un'area non concessa non compare, nemmeno spenta. Il
// cancello dentro la pagina resta, per chi arriva da un rimando diretto.
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

// ─── Il cambio di SOGGETTO FISCALE (P-117 · D-104, che rivede D-52) ────────
// L'account è della PERSONA, e nasce quando crea un locale — cioè un soggetto
// fiscale con le sue sedi. Il titolare non è un tipo di account: è il ruolo
// che quella persona ha su quel soggetto. Perciò nel prodotto non esiste
// un'operazione di «cambio del titolare» né di «passaggio del locale»: chi ha
// l'account modifica i propri recapiti e il proprio nome dal profilo, e ogni
// modifica scrive un evento nel registro delle attività (audit_events, qui
// byup_audit_events) con il valore precedente e quello nuovo. Nient'altro.
// La conseguenza è accettata (D-104): la storia delle operazioni resta
// attribuita all'ACCOUNT e non alla persona fisica del momento; ciò che il
// registro dice è quando e in che cosa l'account è cambiato.
//
// Quello che cambia davvero, quando cambia il contribuente, è il SOGGETTO
// FISCALE, e si cambia in Dati fiscali: nuovi dati con il precedente
// conservato nella storia (i documenti già emessi portano la P.IVA di
// allora), delega riconferita e revocata, credenziali nuove con la
// trasmissione di prova, nuovo conto Stripe, censimento dei POS rifatto e —
// alla fine — la RIACCETTAZIONE dei termini a nome del nuovo soggetto, senza
// la quale il cambiamento non è concluso: è un nuovo soggetto giuridico, e il
// contratto lo firma lui. Nel modello è restaurant_holder_changes ridotto al
// solo change_type `legal_entity`, con lo stato `terms_reaccepted` fra
// `delegations_renewed` e `completed`.
// Nessuna verifica dell'identità è chiesta da Byup: chi cambia i recapiti è
// autenticato, e sul fiscale l'identità la prova l'Agenzia con lo SPID di chi
// conferisce la delega, e Stripe con la verifica del nuovo soggetto.
// Registro condiviso: lo scrivono Dati fiscali e Account, lo legge Hubble in
// sola lettura (scheda del locale).
const PN_SOGGETTO_KEY = 'byup_soggetto_change';
const PN_SOGGETTO_CAUSALI = [
  { id: 'trasformazione_societaria', label: 'Trasformazione societaria' },
  { id: 'cessione_attivita',         label: "Cessione d'attività" },
  { id: 'subentro',                  label: 'Subentro' },
  { id: 'altro',                     label: 'Altro' },
];
// I passi, nell'ordine in cui si compiono. `terms_reaccepted` è l'ultimo
// prima della conclusione: il cambiamento non è concluso finché il nuovo
// soggetto non ha firmato.
const PN_SOGGETTO_PASSI = [
  { id: 'fiscal_updated',       label: 'Dati fiscali aggiornati' },
  { id: 'delegations_renewed',  label: 'Delega riconferita e revocata' },
  { id: 'credentials_verified', label: 'Credenziali del canale e prova di trasmissione' },
  { id: 'stripe_connected',     label: 'Conto Stripe del nuovo soggetto' },
  { id: 'pos_recensiti',        label: 'POS comunicati di nuovo all\'Agenzia' },
  { id: 'terms_reaccepted',     label: 'Termini riaccettati dal nuovo soggetto' },
];
window.PN_SOGGETTO_CAUSALI = PN_SOGGETTO_CAUSALI;
window.PN_SOGGETTO_PASSI = PN_SOGGETTO_PASSI;
window.byupReadSoggettoChange = function () {
  try { const s = localStorage.getItem(PN_SOGGETTO_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
};
window.byupWriteSoggettoChange = function (c) {
  try { if (c) localStorage.setItem(PN_SOGGETTO_KEY, JSON.stringify(c)); else localStorage.removeItem(PN_SOGGETTO_KEY); } catch (e) {}
  window.dispatchEvent(new Event('byup-soggetto-change'));
};
// Segna un passo. Quando ci sono tutti — riaccettazione compresa — il
// cambiamento si conclude da solo.
window.byupSoggettoAvanza = function (passo) {
  const c = window.byupReadSoggettoChange(); if (!c) return null;
  c.steps[passo] = new Date().toISOString();
  c.status = passo;
  if (PN_SOGGETTO_PASSI.every(p => c.steps[p.id])) {
    c.steps.completed = c.steps.completed || new Date().toISOString();
    c.status = 'completed';
  }
  window.byupWriteSoggettoChange(c);
  return c;
};
window.byupSoggettoInCorso = function () {
  const c = window.byupReadSoggettoChange();
  return (c && c.status !== 'completed') ? c : null;
};

// ─── Il registro delle attività dell'account (P-117 · D-104) ───────────────
// I cambi di recapito e di nome non sono cambiamenti di titolarità: sono
// eventi, e si registrano come tali con il valore precedente e quello nuovo
// (audit_events del modello). Li scrive Account, li legge Hubble.
const PN_AUDIT_KEY = 'byup_audit_events';
const PN_AUDIT_TIPI = {
  email_changed: 'ha cambiato l\'email',
  phone_changed: 'ha cambiato il telefono',
  name_changed:  'ha cambiato il nome',
  // Il titolare reimposta l'accesso del proprio personale (P-172 · D-121).
  access_reset_sent: 'ha reimpostato l\'accesso di',
};
window.PN_AUDIT_TIPI = PN_AUDIT_TIPI;
window.byupReadAuditEventi = function () {
  try { const s = localStorage.getItem(PN_AUDIT_KEY); return s ? JSON.parse(s) : []; } catch (e) { return []; }
};
window.byupScriviAuditEvento = function (type, from, to, by) {
  const ev = { at: new Date().toISOString(), type, from, to, by: by || ((window.PN_UTENTE && PN_UTENTE.nome) || 'Mario Rossi') };
  const lista = [ev, ...window.byupReadAuditEventi()].slice(0, 50);
  try { localStorage.setItem(PN_AUDIT_KEY, JSON.stringify(lista)); } catch (e) {}
  window.dispatchEvent(new Event('byup-audit-change'));
  return ev;
};

// ─── I SOGGETTI FISCALI DI QUESTO ACCOUNT ──────────────────────────────────
// L'account è della PERSONA; il contratto lega il SOGGETTO FISCALE. Sono due
// cose diverse, e da qui discende tutto: un titolare con tre locali può avere
// un soggetto solo con tre sedi, oppure tre soggetti; chi ha ceduto l'attività
// resta con l'account e senza soggetti.
// Perciò una nuova versione dei Termini non si accetta «una volta»: si accetta
// UNA VOLTA PER SOGGETTO, perché è il soggetto a essere parte del contratto.
// Quello che non deve succedere è farlo fare in tre posti in tre momenti: si
// legge una volta, si conferma una volta, e si registrano N accettazioni
// distinte — un gesto, N record.
// Non si firma per un soggetto che non si rappresenta: chi è collaboratore lo
// vede in elenco, spento, con scritto perché.
// CODA REGISTRATA, già nota: il mock dei ruoli in Profilo → I tuoi locali usa
// Owner/Manager mentre il gestionale usa Titolare/Cassa/Cameriere. Qui vale il
// secondo; l'allineamento del mock è una coda sua.
const PN_SOGGETTI = [
  { id: 'sf-cp', denominazione: 'Cacio e Pepe S.r.l.', piva: 'IT12345678901', forma: 'societa', ruolo: 'titolare',
    sedi: [{ id: 'cp', nome: 'Cacio e Pepe', citta: 'Roma · Trastevere' }, { id: 'co', nome: 'Cacio e Pepe · Ostiense', citta: 'Roma · Ostiense' }] },
  { id: 'sf-tb', denominazione: 'Borgo Ristorazione S.n.c.', piva: 'IT09876543210', forma: 'societa', ruolo: 'titolare',
    sedi: [{ id: 'tb', nome: 'Trattoria del Borgo', citta: 'Frascati · RM' }] },
  { id: 'sf-lm', denominazione: 'La Marina S.a.s.', piva: 'IT05566778899', forma: 'societa', ruolo: 'collaboratore',
    sedi: [{ id: 'lm', nome: 'Bar La Marina', citta: 'Ostia · RM' }] },
];
window.PN_SOGGETTI = PN_SOGGETTI;
// ─── Le sedi di un ristorante (P-153 · D-110 emendata) ──────────────────────
// Una seconda sede dello STESSO soggetto fiscale è nell'MVP e si crea dal
// Profilo: eredita partita IVA, delega, conto Stripe, menù e regime (che è
// per sede, venue_fiscal_regimes, e la nuova prende quello della prima), e
// riparte dal passo «Sala e tavoli». La sede è figlia del ristorante (venues):
// nel Profilo il ristorante resta una voce sola e le sue sedi stanno sotto.
// Le sedi create vivono in un registro condiviso (byup_sedi) così
// sopravvivono al ricaricamento e la barra laterale mostra un locale che
// «I tuoi locali» conosce. Il confine dei dati è per sede dal primo giorno:
// questo è del backend, e qui si vede solo nel fatto che ogni sede ha il suo
// identificativo.
const PN_SEDI_KEY = 'byup_sedi';
window.byupReadSedi = function () {
  try { const s = localStorage.getItem(PN_SEDI_KEY); if (s) { const v = JSON.parse(s); if (Array.isArray(v)) return v; } } catch (e) {}
  return [];
};
window.byupAggiungiSede = function (sede) {
  const lista = window.byupReadSedi().filter(x => x.id !== sede.id);
  lista.push({ ...sede, creata: new Date().toISOString() });
  try { localStorage.setItem(PN_SEDI_KEY, JSON.stringify(lista)); } catch (e) {}
  window.dispatchEvent(new Event('byup-sedi-change'));
};
// Tutte le sedi di un soggetto: quelle del seme più quelle create.
window.byupSediDi = function (soggettoId) {
  const s = PN_SOGGETTI.find(x => x.id === soggettoId);
  const seme = s ? s.sedi.map(sd => ({ ...sd, ristoranteId: s.id })) : [];
  return [...seme, ...window.byupReadSedi().filter(x => x.ristoranteId === soggettoId)];
};
// Quelli che questa persona rappresenta: gli unici per cui può firmare.
window.byupSoggettiRappresentati = () => PN_SOGGETTI.filter(s => s.ruolo === 'titolare');

// Il registro delle accettazioni, per soggetto e per documento. Ogni riga
// congela la versione e l'impronta: è la prova di QUALE testo quel soggetto
// abbia accettato, indipendente dalle modifiche successive del documento
// pubblicato (consent_events.document_hash).
const PN_TERMINI_KEY = 'byup_termini_accettati';
window.byupReadAccettazioni = function () {
  try { const s = localStorage.getItem(PN_TERMINI_KEY); return s ? JSON.parse(s) : []; } catch (e) { return []; }
};
window.byupScriviAccettazioni = function (righe) {
  try { localStorage.setItem(PN_TERMINI_KEY, JSON.stringify(righe)); } catch (e) {}
  window.dispatchEvent(new Event('byup-termini-change'));
};
window.byupAccettazioneDi = function (soggettoId, codice) {
  return window.byupReadAccettazioni()
    .filter(a => a.soggettoId === soggettoId && a.codice === codice)
    .sort((a, b) => new Date(b.quando) - new Date(a.quando))[0] || null;
};
// I soggetti che devono ancora accettare QUESTA versione. Chi non la
// rappresenta non compare: non c'è niente che possa firmare.
window.byupSoggettiDaFirmare = function (codice, versione) {
  return window.byupSoggettiRappresentati().filter(s => {
    const a = window.byupAccettazioneDi(s.id, codice);
    return !a || a.versione !== versione;
  });
};
// Un gesto, N record: si scrive una riga per soggetto, con la sua ora.
window.byupFirmaTermini = function (soggettiIds, doc) {
  const ora = new Date().toISOString();
  const nuove = (soggettiIds || []).map(id => {
    const s = PN_SOGGETTI.find(x => x.id === id) || {};
    return { soggettoId: id, soggetto: s.denominazione, piva: s.piva,
      codice: doc.codice, versione: doc.versione, impronta: doc.impronta,
      quando: ora, chi: (window.PN_UTENTE && PN_UTENTE.nome) || 'Mario Rossi', modo: 'esplicita' };
  });
  if (!nuove.length) return [];
  window.byupScriviAccettazioni([...nuove, ...window.byupReadAccettazioni()]);
  return nuove;
};

// ─── L'esercente in testa ai documenti ─────────────────────────────────────
// Le cinque righe che il layout dell'Agenzia vuole in cima al documento
// commerciale — insegna, partita IVA, via, città — servono anche al pre-conto
// e al documento di cortesia, che quella testata la ripetono. Stavano solo
// nello stato della schermata Dati fiscali, che vive nella pagina
// Impostazioni: la stampa parte dalla Sala, e lì quello stato non c'è.
// Quindi la verità sta qui, e Dati fiscali ci si appoggia.
const PN_ESERCENTE = {
  insegna: 'Cacio e Pepe',
  piva: 'IT12345678901',
  indirizzo: 'Via dei Giubbonari 27',
  citta: 'Roma', cap: '00197', prov: 'RM',
};
window.PN_ESERCENTE = PN_ESERCENTE;
// La sede si può correggere da Dati anagrafici (P-171): quello che si salva
// vive nel registro byup_esercente sopra il seme, e chi legge la sede — la
// testata dei documenti, la regola regionale del coperto — la legge da qui.
const PN_ESERCENTE_KEY = 'byup_esercente';
window.byupReadEsercente = function () {
  try { const s = localStorage.getItem(PN_ESERCENTE_KEY); return Object.assign({ ...PN_ESERCENTE }, s ? JSON.parse(s) : {}); }
  catch (e) { return { ...PN_ESERCENTE }; }
};
window.byupWriteEsercente = function (patch) {
  const v = Object.assign({}, window.byupReadEsercente(), patch || {});
  const solo = {}; Object.keys(PN_ESERCENTE).forEach(k => { solo[k] = v[k]; });
  try { localStorage.setItem(PN_ESERCENTE_KEY, JSON.stringify(solo)); } catch (e) {}
  window.dispatchEvent(new Event('byup-esercente-change'));
  // La sede è cambiata: se la regione nuova vieta la qualificazione in uso,
  // la voce di coperto o servizio si sospende (P-171, punto 4).
  if (window.byupCopertoVerifica) window.byupCopertoVerifica();
  return solo;
};

// ─── Censimento dei POS all'Agenzia delle Entrate (P-105 · FISC-03) ────────
// Art. 1 co. 74-77 L. 207/2024 e Provv. AdE 424470/2025: ogni strumento di
// pagamento elettronico va COLLEGATO dall'esercente allo strumento con cui
// certifica i corrispettivi — qui la procedura web «Documento Commerciale on
// line» del canale (openapi_channel), non un registratore. Con quella
// procedura il collegamento non è delegabile (FAQ AdE n. 4): lo fa lui dal
// suo accesso al portale, e Byup può solo preparargli i dati esatti, i passi
// in ordine e il promemoria. Per questo lo stato è sempre DICHIARATO, mai
// verificato: l'Agenzia non dà ritorno e Byup non censisce al posto suo.
//
// Due nature: il POS virtuale — uno per sede, nasce quando l'onboarding
// Stripe si completa — e i lettori Tap to Pay, uno per ogni smartphone
// collegato a Byup Staff (Android compreso: le FAQ AdE n. 14 mettono i
// SoftPOS fra gli strumenti fisici senza distinguere il sistema).
//
// La finestra della comunicazione va dal sesto all'ultimo giorno del secondo
// mese successivo a quello di attivazione dello strumento (Provv. AdE
// 31/10/2025 n. 424470, punto 3.2), e ogni variazione — modifica o
// dismissione — la riapre dalla data della variazione (punto 3.3). Per gli
// strumenti già in uso a gennaio 2026 vale il PRIMO ADEMPIMENTO (punto 3.1,
// P-150): quarantacinque giorni dalla messa a disposizione del servizio web,
// che è del 5 marzo 2026, termine 20 aprile 2026 — senza questa regola uno
// strumento attivato nel 2024 riceveva una finestra nel 2024, cioè una data
// impossibile mostrata come scadenza. Il promemoria insiste perché la
// comunicazione omessa o tardiva è sanzionata (art. 11 co. 5 D.Lgs.
// 471/1997), e non si spegne finché la riga non è dichiarata.
//
// Registro in localStorage (byup_pos_censimento): una riga per strumento, con
// i nomi di devices.fiscal_link_status — not_linked, pending_census, linked,
// varied, unlinked — sotto le tre etichette italiane. census_transmitted_at
// è il momento dell'autodichiarazione. Il seme si calcola a runtime; quello
// che si salva sono solo le righe toccate, fuse sul seme per id, così il
// bundle dell'onboarding (che non carica questo file) può scrivere la sua
// riga senza portarsi dietro le altre.
const PN_POS_KEY = 'byup_pos_censimento';
const PN_POS_STATI = {
  not_linked:     { label: 'Da comunicare', tono: 'attesa' },
  pending_census: { label: 'Da comunicare', tono: 'attesa' },
  linked:         { label: 'Dichiarato',    tono: 'ok' },
  varied:         { label: 'Da aggiornare', tono: 'attesa' },
  unlinked:       { label: 'Da aggiornare', tono: 'attesa' },
};
const PN_POS_NATURE = {
  virtual:    { label: 'POS virtuale',       tipoPos: 'Online' },
  tap_to_pay: { label: 'Lettore Tap to Pay', tipoPos: 'Fisico' },
};
// L'acquirer è uno solo per tutta la piattaforma, e i suoi dati sono quelli
// della prassi Stripe (scheda del 27/03/2026): denominazione, codice fiscale
// italiano, sede estera. Il contratto di convenzionamento è l'identificativo
// dell'account connesso — acct_ più sedici caratteri — che nel resto del
// gestionale sta mascherato e si svela solo nel foglio.
const PN_POS_ACQUIRER = {
  denominazione: 'Stripe Technology Europe, Limited',
  cf: '97979220155',
  estero: true,
};
const PN_POS_ACCOUNT = 'acct_1P7Kx9QcRfTwdE3v';
// I tre semi coprono i tre stati: il lettore dichiarato, il lettore mai
// comunicato con la finestra scaduta da tempo, il POS virtuale appena nato
// con la finestra davanti. Nome e persona dei lettori sono la copia di
// BYUP_PAY_DEVICES (impostazioni-integrazioni.jsx, altro ordine di
// caricamento): i seriali sono verosimili e dichiarati tali — quello vero si
// legge dall'interfaccia Stripe, Terminal → Lettori.
const pnPosSeme = () => [
  { id: 'pos-virtuale', nature: 'virtual', name: 'POS virtuale · Stripe', identifier: PN_POS_ACCOUNT,
    activated_at: pnGiorniDaOggi(-20), fiscal_link_status: 'pending_census', census_transmitted_at: null, census_declared_by: null, varied_at: null },
  { id: 'bp-01', nature: 'tap_to_pay', name: 'iPhone 14 Pro', os: 'iOS 17.4', user: 'Marco Silvestri', identifier: 'TTPI-4K7M2Q9XZ3',
    activated_at: '2024-03-12', fiscal_link_status: 'linked', census_transmitted_at: '2026-04-09T11:20:00', census_declared_by: 'Marco Silvestri', varied_at: null },
  { id: 'bp-02', nature: 'tap_to_pay', name: 'Samsung Galaxy S23', os: 'Android 14', user: 'Sara Conti', identifier: 'TTPA-8R2N6V4LC1',
    activated_at: '2024-04-05', fiscal_link_status: 'pending_census', census_transmitted_at: null, census_declared_by: null, varied_at: null },
];
window.PN_POS_STATI = PN_POS_STATI;
window.PN_POS_NATURE = PN_POS_NATURE;
window.PN_POS_ACQUIRER = PN_POS_ACQUIRER;
window.PN_POS_ACCOUNT = PN_POS_ACCOUNT;
window.byupReadPosCensimento = function () {
  let salvate = {};
  try { const s = localStorage.getItem(PN_POS_KEY); if (s) JSON.parse(s).forEach(r => { salvate[r.id] = r; }); } catch (e) {}
  // Il POS virtuale nasce col collegamento Stripe e non un minuto prima: se
  // Stripe non è collegato, quello strumento non esiste e non c'è nulla da
  // comunicare all'Agenzia. Nasce in byupStripeCollega, con la data di oggi.
  let stripeGiu = false;
  try { stripeGiu = window.byupReadStripe && window.byupReadStripe().status === 'pending'; } catch (e) {}
  const seme = pnPosSeme().filter(r => !(stripeGiu && r.id === 'pos-virtuale' && !salvate[r.id]));
  const lista = seme.map(r => salvate[r.id] ? { ...r, ...salvate[r.id] } : r);
  Object.values(salvate).forEach(r => { if (!seme.some(s => s.id === r.id)) lista.push(r); });
  return lista;
};
window.byupWritePosCensimento = function (lista) {
  try { localStorage.setItem(PN_POS_KEY, JSON.stringify(lista)); } catch (e) {}
  window.dispatchEvent(new Event('byup-pos-censimento'));
};
// L'autodichiarazione: data, ora e chi l'ha resa. È l'unica chiusura.
window.byupPosDichiara = function (id, autore) {
  const lista = window.byupReadPosCensimento();
  const r = lista.find(x => x.id === id); if (!r) return lista;
  r.fiscal_link_status = 'linked';
  r.census_transmitted_at = new Date().toISOString();
  r.census_declared_by = autore || PN_UTENTE.nome;
  window.byupWritePosCensimento(lista);
  return lista;
};
// La variazione: 'varied' se lo strumento cambia, 'unlinked' se si dismette.
// In entrambi i casi la finestra riparte dalla data di oggi.
window.byupPosVaria = function (id, stato) {
  const lista = window.byupReadPosCensimento();
  const r = lista.find(x => x.id === id); if (!r) return lista;
  r.fiscal_link_status = stato === 'unlinked' ? 'unlinked' : 'varied';
  r.varied_at = pnOggiISO();
  window.byupWritePosCensimento(lista);
  return lista;
};
// Ripristino di demo: la riga torna a «da comunicare» senza dichiarazione.
window.byupPosRitira = function (id) {
  const lista = window.byupReadPosCensimento();
  const r = lista.find(x => x.id === id); if (!r) return lista;
  r.fiscal_link_status = 'pending_census';
  r.census_transmitted_at = null; r.census_declared_by = null;
  window.byupWritePosCensimento(lista);
  return lista;
};
// La finestra: dal 6 all'ultimo giorno del secondo mese successivo a quello
// dell'evento — attivazione, o variazione se c'è stata (punto 3.2). Per lo
// strumento attivato entro il 31 gennaio 2026 e mai variato vale il primo
// adempimento (punto 3.1): dal 5 marzo al 20 aprile 2026.
const PN_POS_PRIMO_ADEMPIMENTO = { contrattoEntro: '2026-01-31', inizio: '2026-03-05', fine: '2026-04-20' };
window.PN_POS_PRIMO_ADEMPIMENTO = PN_POS_PRIMO_ADEMPIMENTO;
window.pnPosFinestra = function (r) {
  const evento = r.varied_at || r.activated_at;
  if (!r.varied_at && evento && evento <= PN_POS_PRIMO_ADEMPIMENTO.contrattoEntro) {
    return { inizio: new Date(`${PN_POS_PRIMO_ADEMPIMENTO.inizio}T00:00:00`), fine: new Date(`${PN_POS_PRIMO_ADEMPIMENTO.fine}T00:00:00`), transitoria: true };
  }
  const rif = new Date(`${evento}T00:00:00`);
  const inizio = new Date(rif.getFullYear(), rif.getMonth() + 2, 6);
  const fine = new Date(rif.getFullYear(), rif.getMonth() + 3, 0);
  return { inizio, fine, transitoria: false };
};
const pnPosData = (d, anno) => d.toLocaleDateString('it-IT', anno ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' });
// Il promemoria a gradini. fase: 'ok' (dichiarato) · 'lontana' (la finestra
// non è ancora aperta) · 'aperta' · 'ultimi' (sette giorni o meno) ·
// 'scaduta'. Il testo è quello che si legge ovunque lo strumento compaia.
window.pnPosPromemoria = function (r) {
  if (r.fiscal_link_status === 'linked') {
    const q = r.census_transmitted_at ? new Date(r.census_transmitted_at) : null;
    return { fase: 'ok', giorni: null, testo: q ? `Dichiarato il ${pnPosData(q, true)}${r.census_declared_by ? ` da ${r.census_declared_by}` : ''}` : 'Dichiarato' };
  }
  const { inizio, fine } = window.pnPosFinestra(r);
  const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
  const stessoAnno = fine.getFullYear() === oggi.getFullYear();
  const verbo = (r.fiscal_link_status === 'varied' || r.fiscal_link_status === 'unlinked') ? 'Da aggiornare' : 'Da comunicare';
  if (oggi < inizio) {
    return { fase: 'lontana', giorni: Math.round((inizio - oggi) / 86400000), testo: `${verbo} dal ${inizio.getDate()} al ${pnPosData(fine, !stessoAnno)}` };
  }
  const giorni = Math.round((fine - oggi) / 86400000);
  if (giorni >= 0) {
    const fase = giorni <= 7 ? 'ultimi' : 'aperta';
    const resto = giorni === 0 ? 'scade oggi' : giorni === 1 ? 'manca 1 giorno' : `mancano ${giorni} giorni`;
    return { fase, giorni, testo: `${verbo} entro il ${pnPosData(fine, !stessoAnno)} · ${resto}` };
  }
  const oltre = -giorni;
  return { fase: 'scaduta', giorni, testo: oltre <= 60 ? `Finestra scaduta da ${oltre} giorn${oltre === 1 ? 'o' : 'i'}` : `Finestra scaduta il ${pnPosData(fine, true)}` };
};
// La riga più urgente fra quelle non dichiarate: è quella che il promemoria
// mette in testa, in Dati fiscali e in Personale.
window.pnPosUrgente = function (lista) {
  const ordine = { scaduta: 0, ultimi: 1, aperta: 2, lontana: 3, ok: 4 };
  return (lista || window.byupReadPosCensimento())
    .map(r => ({ r, p: window.pnPosPromemoria(r) }))
    .sort((a, b) => ordine[a.p.fase] - ordine[b.p.fase])[0] || null;
};

// ─── Collegamento Stripe: lo stato condiviso (D-52 · P-130) ────────────────
// I QUATTRO STATI SONO QUELLI DEL MODELLO, e sono i quattro di Stripe
// (restaurants.stripe_connect_status):
//   pending    — il conto è aperto, Stripe non ha ancora finito di verificarlo
//   active     — tutto funziona
//   restricted — Stripe ha limitato il conto: manca qualcosa, e finché non
//                arriva blocca gli incassi oppure i versamenti
//   disabled   — il conto non è più utilizzabile
// Prima il prototipo ne usava tre inventati — `da_collegare`, `connected`,
// `da_ricollegare` — e non sapeva rappresentare il conto LIMITATO, che nella
// realtà è la situazione più frequente: Stripe apre il conto, il locale
// comincia a lavorare, e dopo qualche giorno chiede un documento in più.
// Del conto Stripe il modello conserva soltanto l'identificativo e lo stato:
// i documenti che Stripe chiede al ristoratore non li raccogliamo e non li
// conserviamo noi, mai. Per questo il conto limitato è una fascia informativa
// più un pulsante che porta su Stripe, e non una schermata da compilare.
// QUALE delle due cose sia ferma — gli incassi o i versamenti — cambia da
// un'ora all'altra e lo sa solo Stripe: si chiede sul momento e non si salva,
// altrimenti il dato salvato diventerebbe una bugia il giorno dopo.
//
// L'account connesso è intestato al soggetto fiscale: se il soggetto cambia,
// l'account non è più suo. Il cambio di soggetto (Dati fiscali) porta lo stato
// a `disabled` e chiede un nuovo onboarding Stripe con la sua verifica; fino
// ad allora niente pagamenti. Il ricollegamento fa nascere un POS virtuale
// nuovo: il censimento si riapre (byupPosVaria 'varied', P-105).
// Il collegamento non si chiede più nell'onboarding (4 settembre 2026): il
// locale atterra nel gestionale e la notifica glielo chiede lì. Perciò il
// valore di partenza, senza niente di salvato, è `pending`.
const PN_STRIPE_KEY = 'byup_stripe';
// I tre nomi inventati che il prototipo usava prima di P-130: i registri già
// scritti in un browser si allineano da soli.
const PN_STRIPE_VECCHI = { da_collegare: 'pending', connected: 'active', da_ricollegare: 'disabled' };
window.PN_STRIPE_STATI = {
  pending:    { label: 'Da collegare', tono: 'attesa' },
  active:     { label: 'Connesso',     tono: 'ok' },
  restricted: { label: 'Limitato',     tono: 'attesa' },
  disabled:   { label: 'Disabilitato', tono: 'errore' },
};
// Che cosa Stripe ha fermato, quando il conto è limitato. Non si salva: è la
// scelta del mock, e chi la legge lo dice a schermo.
window.PN_STRIPE_LIMITI = {
  payouts: 'Continui a incassare, ma i versamenti sul tuo conto sono fermi finché non completi la verifica su Stripe.',
  charges: 'Non puoi più incassare con la carta finché non completi la verifica su Stripe.',
};
window.byupReadStripe = function () {
  try {
    const s = localStorage.getItem(PN_STRIPE_KEY);
    if (!s) return { status: 'pending' };
    const v = JSON.parse(s) || {};
    return Object.assign({}, v, { status: PN_STRIPE_VECCHI[v.status] || v.status || 'pending' });
  } catch (e) { return { status: 'pending' }; }
};
window.byupWriteStripe = function (v) {
  try { if (v) localStorage.setItem(PN_STRIPE_KEY, JSON.stringify(v)); else localStorage.removeItem(PN_STRIPE_KEY); } catch (e) {}
  window.dispatchEvent(new Event('byup-stripe-change'));
};
// Il primo collegamento: l'onboarding Stripe del soggetto, con la verifica
// d'identità che fa Stripe. Da qui NASCE il POS virtuale (P-105) — lo
// strumento nasce col suo collegamento, non prima — e con lui la finestra
// della comunicazione all'Agenzia.
window.byupStripeCollega = function () {
  // La lista si legge PRIMA di scrivere lo stato: dopo, il seme rimetterebbe
  // dentro un POS virtuale nato venti giorni fa, e questo nasce adesso.
  const lista = window.byupReadPosCensimento();
  window.byupWriteStripe({ status: 'active', collegato_il: new Date().toISOString() });
  const oggi = new Date().toISOString().slice(0, 10);
  if (!lista.some(r => r.id === 'pos-virtuale')) {
    lista.unshift({ id: 'pos-virtuale', nature: 'virtual', name: 'POS virtuale · Stripe', identifier: PN_POS_ACCOUNT,
      activated_at: oggi, fiscal_link_status: 'pending_census', census_transmitted_at: null, census_declared_by: null, varied_at: null });
    window.byupWritePosCensimento(lista);
  }
  const c = window.byupSoggettoInCorso ? window.byupSoggettoInCorso() : null;
  if (c && !c.steps.stripe_connected) window.byupSoggettoAvanza('stripe_connected');
};
window.byupStripeDisabilita = function (motivo) {
  window.byupWriteStripe({ status: 'disabled', motivo: motivo || 'cambio_soggetto', since: new Date().toISOString() });
};
// Il conto limitato. `limite` è 'payouts' (incassi sì, versamenti fermi) o
// 'charges' (niente più carte): nel prototipo lo scegliamo noi, perché senza
// Stripe vero non c'è modo di saperlo, e la fascia lo dichiara.
window.byupStripeLimita = function (limite) {
  const v = window.byupReadStripe();
  window.byupWriteStripe(Object.assign({}, v, { status: 'restricted', limite: limite === 'charges' ? 'charges' : 'payouts', since: new Date().toISOString() }));
};
// Ricollegare è l'onboarding Stripe del nuovo soggetto, con la sua verifica
// dell'identità: non ce n'è un'altra, e non si simula un bottone a parte —
// Byup non verifica identità (D-104). Se un cambio di soggetto è in corso,
// questo è il passo `stripe_connected`.
window.byupStripeRicollega = function () {
  window.byupWriteStripe({ status: 'active' });
  if (window.byupPosVaria) window.byupPosVaria('pos-virtuale', 'varied');
  const c = window.byupSoggettoInCorso ? window.byupSoggettoInCorso() : null;
  if (c && !c.steps.stripe_connected) window.byupSoggettoAvanza('stripe_connected');
};

// ─── L'altezza VERA della finestra, dentro il frame zoomato ─────────────────
// Le pagine del gestionale stanno in un .frame con lo zoom proporzionale
// (design 1440×900): un popup limitato a 100vh dentro quel frame viene
// scalato dallo zoom e sfora la finestra. --pn-vh è l'altezza della finestra
// divisa per lo zoom: i popup si limitano a calc(var(--pn-vh) - margine) e
// al massimo scorrono dentro. Aggiornata al caricamento, al resize e poco
// dopo, perché lo zoom lo applica lo script della pagina.
(function () {
  const agg = () => {
    const f = document.querySelector('.frame');
    const z = f ? (parseFloat(getComputedStyle(f).zoom) || 1) : 1;
    document.documentElement.style.setProperty('--pn-vh', Math.round(window.innerHeight / z) + 'px');
  };
  window.addEventListener('resize', agg);
  // Babel compila dopo il load: quell'evento è già passato. Si riprova a
  // scadenze fisse e si osserva il .frame, il cui stile cambia quando lo
  // script della pagina applica lo zoom.
  agg(); setTimeout(agg, 250); setTimeout(agg, 1200);
  const f = document.querySelector('.frame');
  if (f && window.MutationObserver) new MutationObserver(agg).observe(f, { attributes: true, attributeFilter: ['style'] });
})();

// ─── Chi trasmette gli scontrini: la forma del locale e le credenziali ──────
// La procedura del documento commerciale online «è disponibile esclusivamente
// per l'operatore» e, «nel caso in cui quest'ultimo sia una società, può
// essere utilizzata da operatori incaricati» (specifiche corrispettivi §2.9).
// L'INCARICATO È DELLA SOCIETÀ, NON DI BYUP (D-103, P-116): è una persona
// fisica che la società nomina dal proprio profilo sul portale dell'Agenzia
// (Profilo → Incarichi → Gestisci incarichi come gestore → Aggiungi
// incaricato, con il suo codice fiscale, poi Gestisci servizi) e che accede
// con le proprie credenziali personali scegliendo la società come utenza di
// lavoro. Chi sia quella persona lo decide la società: in pratica il titolare
// o il rappresentante legale.
// Quindi le credenziali dell'Agenzia sono SEMPRE dell'esercente: del titolare
// per la ditta individuale, dell'incaricato per società ed enti. Byup non
// nomina incaricati propri e non rinnova credenziali per conto di nessuno: la
// figura dell'incaricato di Byup, costruita il 3 settembre 2026 senza
// decisione, è ritirata e resta annotata come alternativa sospesa, da
// riaprire solo dopo il parere del consulente fiscale (D-40) e solo se la
// rotazione a novanta giorni si rivelasse un problema operativo prima del
// ponte sulla Soluzione Software, che le credenziali le elimina. Metterci una
// persona di Byup creava una responsabilità fiscale personale verso centinaia
// di società, dipendeva da quella persona e non copriva le ditte individuali.
//
// Le forme sono TRE (D-103): il professionista esce — chi somministra
// alimenti esercita un'impresa (art. 4 DPR 633/72, art. 2195 c.c.) e il
// rapporto FIPE 2026 non conosce la categoria — e l'ente resta per l'uno per
// cento delle forme collettive, con i campi della società e nessun percorso
// proprio. La forma del locale, in produzione, è il legal_form dei dati
// fiscali. Nel prototipo si legge da UN POSTO SOLO (P-152): il registro
// condiviso del locale (byup_locale_attivo, panoramica-sidebar.jsx), lo
// stesso che tiene il nome che tutte le pagine leggono. Dati fiscali ci
// scrive quando la forma cambia; la Cassa, le notifiche e chiunque la chieda
// leggono da qui. Prima la Cassa leggeva una costante fissa «societa» e
// Dati fiscali il proprio stato: cambiando la forma le due schermate
// raccontavano due locali diversi. Ripiego se il registro non la porta: la
// S.r.l. del mock.
const PN_FORMA_RIPIEGO = 'societa';   // 'ditta_individuale' | 'societa' | 'ente'
const PN_FORME = ['ditta_individuale', 'societa', 'ente'];
// Quello che l'onboarding ha raccolto nel passo dell'anagrafica (P-151):
// forma, partita IVA, codice fiscale e dati di nascita del titolare. Dati
// fiscali parte da qui, così nessuno riscrive quello che ha appena scritto.
window.byupReadAnagraficaOnboarding = function () {
  try { const s = localStorage.getItem('byup_anagrafica_onboarding'); if (s) { const v = JSON.parse(s); if (v && typeof v === 'object') return v; } } catch (e) {}
  return null;
};
window.byupReadForma = function () {
  try { const l = window.byupReadLocale ? window.byupReadLocale() : null; if (l && PN_FORME.includes(l.forma)) return l.forma; } catch (e) {}
  const onb = window.byupReadAnagraficaOnboarding();
  if (onb && PN_FORME.includes(onb.legalForm)) return onb.legalForm;
  return PN_FORMA_RIPIEGO;
};
window.byupWriteForma = function (forma) {
  if (!PN_FORME.includes(forma) || !window.byupReadLocale) return;
  const l = window.byupReadLocale();
  if (l.forma === forma) return;
  window.byupWriteLocale({ ...l, forma });
  window.dispatchEvent(new Event('byup-forma-change'));
};
window.pnFormaCollettiva = (forma) => (forma || window.byupReadForma()) !== 'ditta_individuale';

// L'incaricato nominato dalla società sul portale: nome, cognome, codice
// fiscale e data della nomina (restaurant_fiscal_data.ade_operator_name e
// ade_operator_tax_code). Lo dichiara l'esercente in Dati fiscali; Hubble lo
// legge in sola lettura nella scheda del locale, per l'assistenza, e non
// compie alcun atto di nomina. Registro condiviso sullo stesso dominio.
const PN_INCARICATO_KEY = 'byup_ade_incaricato';
const pnIncaricatoSeme = () => ({ nome: 'Paola', cognome: 'Conti', cf: 'CNTPLA80E50H501V', nominato_il: pnGiorniDaOggi(-60) });
window.byupReadIncaricato = function () {
  try { const s = localStorage.getItem(PN_INCARICATO_KEY); return s ? Object.assign(pnIncaricatoSeme(), JSON.parse(s)) : pnIncaricatoSeme(); }
  catch (e) { return pnIncaricatoSeme(); }
};
window.byupWriteIncaricato = function (v) {
  try { if (v) localStorage.setItem(PN_INCARICATO_KEY, JSON.stringify(v)); else localStorage.removeItem(PN_INCARICATO_KEY); } catch (e) {}
  window.dispatchEvent(new Event('byup-ade-incaricato-change'));
};
// Chi rinnova la password, secondo la forma: il titolare o l'incaricato.
window.pnAdeChiRinnova = function (forma) {
  if (!window.pnFormaCollettiva(forma)) return { ruolo: 'titolare', nome: (window.PN_UTENTE && PN_UTENTE.nome) || 'il titolare' };
  const i = window.byupReadIncaricato();
  return { ruolo: 'incaricato', nome: `${i.nome} ${i.cognome}`.trim(), cf: i.cf, nominato_il: i.nominato_il };
};

// ─── Lo stato di collegamento delle piattaforme di consegna (P-157) ─────────
// Un posto solo: prima il foglio del collegamento diceva «Collegamento
// completato» in uno stato suo e la tessera del catalogo restava
// «Predisposta», e le due parti della stessa pagina raccontavano due cose.
// Registro sullo stesso dominio (venue_delivery_integrations nel modello):
// la tessera legge da qui, il foglio scrive qui, e riaprendolo si riparte
// dall'esito. L'add-on resta spento nell'MVP: il collegamento è predisposto
// con dati di esempio, e le tessere continuano a dirlo.
const PN_DELIVERY_KEY = 'byup_delivery_collegamenti';
window.byupReadDeliveryCollegamenti = function () {
  try { const s = localStorage.getItem(PN_DELIVERY_KEY); if (s) { const v = JSON.parse(s); if (v && typeof v === 'object') return v; } } catch (e) {}
  return {};
};
window.byupCollegaDelivery = function (id, dettaglio) {
  const v = window.byupReadDeliveryCollegamenti();
  v[id] = { quando: new Date().toISOString(), dettaglio: dettaglio || '' };
  try { localStorage.setItem(PN_DELIVERY_KEY, JSON.stringify(v)); } catch (e) {}
  window.dispatchEvent(new Event('byup-delivery-change'));
};
window.byupScollegaDelivery = function (id) {
  const v = window.byupReadDeliveryCollegamenti(); delete v[id];
  try { localStorage.setItem(PN_DELIVERY_KEY, JSON.stringify(v)); } catch (e) {}
  window.dispatchEvent(new Event('byup-delivery-change'));
};


// ─── Orari del locale e ultima comanda della cucina (P-167 · D-117) ─────────
// Il locale ha gli orari di apertura (Vetrina → Orari di apertura, registro
// byup_orari) e la cucina ha la sua ULTIMA COMANDA (Impostazioni → Menù e
// cucina → Servizio, registro byup_ultima_comanda): un orario per giorno,
// «uguale alla chiusura» come predefinito. La mezzanotte si gestisce come la
// chiusura del locale: un orario prima dell'apertura appartiene al giorno
// prima. L'orologio è quello italiano, o quello finto di `?ora=HH:MM`
// (sessionStorage byup_ora_demo), che serve a provare la cucina chiusa senza
// aspettare la notte. D-117: l'ultima comanda è una promessa ai clienti, non
// un lucchetto per chi sta in sala — app e webapp fermano l'aggiunta dei piatti
// non eccettuati, Sala e cameriere inviano con un avviso.
if (!window.byupCucinaInfo) {
  const ORARI_KEY = 'byup_orari', UC_KEY = 'byup_ultima_comanda';
  const GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  // Il seme è quello della Vetrina: aperto dal lunedì al sabato, 09:00–23:00.
  const ORARI_SEME = { openDays: { Lun: true, Mar: true, Mer: true, Gio: true, Ven: true, Sab: true }, stdHours: ['09:00', '23:00'], customHours: null };
  const leggi = (k, fb) => { try { const s = localStorage.getItem(k); return s ? Object.assign({}, fb, JSON.parse(s)) : Object.assign({}, fb); } catch (e) { return Object.assign({}, fb); } };
  window.byupReadOrari = () => leggi(ORARI_KEY, ORARI_SEME);
  window.byupWriteOrari = (v) => { try { localStorage.setItem(ORARI_KEY, JSON.stringify(v)); } catch (e) {} try { window.dispatchEvent(new Event('byup-orari-change')); } catch (e) {} };
  window.byupReadUltimaComanda = () => leggi(UC_KEY, { modo: 'chiusura', orari: {} });
  window.byupWriteUltimaComanda = (v) => { try { localStorage.setItem(UC_KEY, JSON.stringify(v)); } catch (e) {} try { window.dispatchEvent(new Event('byup-ultima-comanda-change')); } catch (e) {} };
  const toMin = (hhmm) => { const [h, m] = String(hhmm || '00:00').split(':').map(n => parseInt(n, 10) || 0); return h * 60 + m; };
  const pad = (n) => String(n).padStart(2, '0');
  // L'ora e il giorno italiani, o quelli finti.
  window.byupOraDemo = () => {
    try {
      const q = new URLSearchParams(window.location.search).get('ora');
      if (q && /^\d{1,2}:\d{2}$/.test(q)) sessionStorage.setItem('byup_ora_demo', q);
      const d = sessionStorage.getItem('byup_ora_demo'); if (d) return d;
    } catch (e) {}
    try {
      const p = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const g = (t) => (p.find(x => x.type === t) || {}).value || '00';
      return `${pad(parseInt(g('hour'), 10) % 24)}:${g('minute')}`;
    } catch (e) { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
  };
  // Gli orari di un giorno (0 = domenica): aperto?, apre, chiude — dal primo
  // all'ultimo turno se il giorno è personalizzato.
  window.byupOrariDelGiorno = (idx) => {
    const o = window.byupReadOrari(); const g = GIORNI[((idx % 7) + 7) % 7];
    if (!o.openDays || !o.openDays[g]) return { giorno: g, aperto: false };
    const turni = o.customHours && o.customHours[g] && o.customHours[g].length ? o.customHours[g] : [o.stdHours || ORARI_SEME.stdHours];
    return { giorno: g, aperto: true, apre: turni[0][0], chiude: turni[turni.length - 1][1] };
  };
  window.byupCucinaInfo = () => {
    const ora = window.byupOraDemo(); const m = toMin(ora);
    const oggiIdx = new Date().getDay();
    // Minuti trascorsi dall'apertura, contando oltre la mezzanotte se serve.
    const dopo = (apre, t) => (toMin(t) - toMin(apre) + 1440) % 1440;
    const valuta = (idx) => {
      const g = window.byupOrariDelGiorno(idx); if (!g.aperto) return null;
      const durata = g.chiude === g.apre ? 1440 : dopo(g.apre, g.chiude);
      const uc = window.byupReadUltimaComanda();
      const ultima = uc.modo === 'orario' && uc.orari && uc.orari[g.giorno] ? uc.orari[g.giorno] : g.chiude;
      const trascorso = dopo(g.apre, ora);
      return { giorno: g.giorno, apre: g.apre, chiude: g.chiude, ultimaComanda: ultima, localeAperto: trascorso < durata, cucinaAperta: trascorso < Math.min(durata, dopo(g.apre, ultima) || durata) };
    };
    let v = valuta(oggiIdx);
    // Prima dell'apertura di oggi può valere ancora la giornata di ieri, se
    // chiudeva dopo mezzanotte.
    if ((!v || !v.localeAperto) ) { const ieri = valuta(oggiIdx - 1); if (ieri && toMin(ieri.chiude) <= toMin(ieri.apre) && ieri.localeAperto && m < toMin(ieri.chiude)) v = ieri; }
    if (!v) { const g = window.byupOrariDelGiorno(oggiIdx); return { ora, giorno: g.giorno, localeAperto: false, cucinaAperta: false, apre: null, chiude: null, ultimaComanda: null, chiusoOggi: true }; }
    return Object.assign({ ora, chiusoOggi: false }, v);
  };
  // Il locale della demo, quello del menù: per gli altri della scoperta non
  // conosciamo la cucina e non si inventa.
  window.byupAvvisoCucinaChiusa = () => { const i = window.byupCucinaInfo(); return !i.cucinaAperta && i.ultimaComanda ? `Cucina chiusa dalle ${i.ultimaComanda}: avvisa la cucina che la comanda è partita lo stesso` : null; };
  // A locale chiuso (P-169 · D-117 completata, SFA 3.3 e 11.6) il menù si
  // consulta ma non si ordina, e il QR non apre alcuna sessione: la riga che
  // lo spiega ad app e webapp nasce qui. null = locale aperto. Il personale
  // non ha questo blocco: chi è dentro il locale invia.
  window.byupLocaleChiusoMessaggio = () => {
    const i = window.byupCucinaInfo();
    if (i.localeAperto) return null;
    return i.chiusoOggi ? 'Oggi il locale è chiuso: il menù si consulta, si ordina quando è aperto.'
      : `Il locale è chiuso, apre alle ${i.apre}: il menù si consulta, si ordina quando è aperto.`;
  };
  window.byupCucinaChiusaPer = (nome) => { if (!/settembrini|maria grazia/i.test(String(nome || ''))) return false; const i = window.byupCucinaInfo(); return i.localeAperto && !i.cucinaAperta; };
}

// ─── I canali del cliente: il segno «dal QR» e i limiti (P-168 · D-118) ─────
// Quando la sessione del tavolo nasce da una scansione del QR — dall'app o
// dalla webapp — e non dal personale, la sala lo sa da un segno discreto,
// perché quasi tutti quei tavoli sono clienti veri. Il tavolo che ha superato
// un limite, o la cui rete non è della città del locale, porta «da verificare».
// I limiti fermano il volume, non il cliente onesto: un invio respinto dice
// sempre l'attesa residua, mai un errore muto. Nessun cancello del pagamento
// sulla sala, nessuna verifica d'identità, nessun ban sul dispositivo, nessun
// blocco per indirizzo di rete. I nomi sono quelli del modello:
// orders.source_surface vale staff_web | webapp_guest | byup_app.
// Registri sullo stesso dominio: byup_limiti (i tre parametri, che Hubble
// governa), byup_tavoli_qr (i tavoli aperti da un cliente), byup_invii (la
// storia recente per tavolo e per dispositivo), byup_limiti_rifiuti (quante
// volte al giorno, per limite: quante, non chi). Rete di prova: ?rete=fuori.
if (!window.byupInvioConsentito) {
  const LIM_KEY = 'byup_limiti', TQR_KEY = 'byup_tavoli_qr', INV_KEY = 'byup_invii', RIF_KEY = 'byup_limiti_rifiuti', DISP_KEY = 'byup_dispositivo';
  const LIMITI_SEME = { invii: { n: 3, minuti: 2 }, righe: 30, tavoli: { n: 5, minuti: 60 } };
  const SESSIONE_MS = 6 * 60 * 60 * 1000; // un tavolo aperto da un cliente si dimentica dopo sei ore
  const leggi = (k, seme) => { try { const v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : seme; } catch (e) { return seme; } };
  const scrivi = (k, v, evento) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} try { window.dispatchEvent(new Event(evento)); } catch (e) {} };
  const oggi = () => new Date().toISOString().slice(0, 10);
  const num = (t) => String(t == null ? '' : t).replace(/\D+/g, '') || String(t);
  window.byupReadLimiti = () => {
    const v = leggi(LIM_KEY, {});
    return {
      invii: { n: Math.max(1, parseInt(v.invii && v.invii.n, 10) || LIMITI_SEME.invii.n), minuti: Math.max(1, parseInt(v.invii && v.invii.minuti, 10) || LIMITI_SEME.invii.minuti) },
      righe: Math.max(1, parseInt(v.righe, 10) || LIMITI_SEME.righe),
      tavoli: { n: Math.max(1, parseInt(v.tavoli && v.tavoli.n, 10) || LIMITI_SEME.tavoli.n), minuti: Math.max(1, parseInt(v.tavoli && v.tavoli.minuti, 10) || LIMITI_SEME.tavoli.minuti) },
    };
  };
  window.byupWriteLimiti = (l) => scrivi(LIM_KEY, Object.assign({}, window.byupReadLimiti(), l || {}), 'byup-limiti-change');
  window.byupDispositivoId = () => {
    let id = null; try { id = localStorage.getItem(DISP_KEY); } catch (e) {}
    if (!id) { id = 'd_' + Math.random().toString(36).slice(2, 10); try { localStorage.setItem(DISP_KEY, id); } catch (e) {} }
    return id;
  };
  window.byupReteFuoriCitta = () => {
    try {
      const q = new URLSearchParams(window.location.search).get('rete');
      if (q) sessionStorage.setItem('byup_rete_demo', q);
      return sessionStorage.getItem('byup_rete_demo') === 'fuori';
    } catch (e) { return false; }
  };
  // I tavoli aperti da un cliente: { [numero]: { source_surface, opened_at, verifica } }
  window.byupReadTavoliQr = () => {
    const t = leggi(TQR_KEY, {}), ora = Date.now(), out = {};
    Object.keys(t).forEach(k => { const e = t[k]; if (e && e.opened_at && ora - Date.parse(e.opened_at) < SESSIONE_MS) out[k] = e; });
    return out;
  };
  window.byupSegnaTavoloQr = (tavolo, source_surface) => {
    const t = window.byupReadTavoliQr(), k = num(tavolo);
    if (!t[k]) t[k] = { source_surface: source_surface || 'webapp_guest', opened_at: new Date().toISOString(), verifica: null };
    if (!t[k].verifica && window.byupReteFuoriCitta()) t[k].verifica = 'rete';
    scrivi(TQR_KEY, t, 'byup-tavoli-qr-change');
    return t[k];
  };
  window.byupSegnaDaVerificare = (tavolo, motivo) => {
    const t = window.byupReadTavoliQr(), k = num(tavolo);
    if (!t[k]) t[k] = { source_surface: 'webapp_guest', opened_at: new Date().toISOString(), verifica: null };
    t[k].verifica = motivo || 'limite';
    scrivi(TQR_KEY, t, 'byup-tavoli-qr-change');
  };
  window.byupChiudiTavoloQr = (tavolo) => { const t = window.byupReadTavoliQr(); delete t[num(tavolo)]; scrivi(TQR_KEY, t, 'byup-tavoli-qr-change'); };
  window.byupTavoloQr = (tavolo) => window.byupReadTavoliQr()[num(tavolo)] || null;
  // Il segno che la sala disegna: il registro vince, il seme del mockup
  // (source_surface e verifica sul tavolo o sulla sorgente) vale quando il
  // registro tace. null = tavolo aperto dal personale, niente da disegnare.
  window.byupSegnoCanale = (tavolo, seme) => {
    const e = window.byupTavoloQr(tavolo) || (seme && seme.source_surface && seme.source_surface !== 'staff_web' ? seme : null);
    if (!e) return null;
    if (e.verifica) return { livello: 'verifica', testo: 'da verificare', motivo: e.verifica, source_surface: e.source_surface };
    return { livello: 'qr', testo: 'dal QR', source_surface: e.source_surface };
  };
  // I rifiuti del giorno, per limite: { invii, righe, tavoli }
  window.byupReadRifiuti = (giorno) => { const r = leggi(RIF_KEY, {}); return Object.assign({ invii: 0, righe: 0, tavoli: 0 }, r[giorno || oggi()] || {}); };
  const contaRifiuto = (limite) => { const r = leggi(RIF_KEY, {}), g = oggi(); r[g] = r[g] || {}; r[g][limite] = (r[g][limite] || 0) + 1; scrivi(RIF_KEY, r, 'byup-limiti-rifiuti-change'); };
  // L'invio di una comanda da un canale del cliente: passa, oppure dice quanto
  // aspettare. Tre limiti: invii per tavolo nella finestra, righe per invio,
  // tavoli diversi per dispositivo nell'ora. Il rifiuto segna il tavolo.
  window.byupInvioConsentito = (tavolo, righe) => {
    const L = window.byupReadLimiti(), ora = Date.now(), k = num(tavolo), disp = window.byupDispositivoId();
    const inv = leggi(INV_KEY, {}); inv.tavoli = inv.tavoli || {}; inv.dispositivi = inv.dispositivi || {};
    const rifiuta = (limite, messaggio) => { contaRifiuto(limite); window.byupSegnaDaVerificare(k, 'limite'); return { ok: false, limite, messaggio }; };
    if ((righe || 0) > L.righe) return rifiuta('righe', `Sono troppe righe per un invio solo: al massimo ${L.righe}. Manda quello che c'è, il resto in un invio dopo.`);
    const finestra = L.invii.minuti * 60000;
    const recenti = (inv.tavoli[k] || []).filter(ts => ora - ts < finestra).sort((a, b) => a - b);
    if (recenti.length >= L.invii.n) {
      const attesa = Math.max(1, Math.ceil((recenti[0] + finestra - ora) / 1000));
      return rifiuta('invii', attesa >= 90 ? `Aspetta ${Math.ceil(attesa / 60)} minuti prima di inviare ancora.` : `Aspetta ${attesa} secondi prima di inviare ancora.`);
    }
    const finestra2 = L.tavoli.minuti * 60000, miei = inv.dispositivi[disp] || {};
    const altri = Object.keys(miei).filter(t2 => t2 !== k && ora - miei[t2] < finestra2);
    if (!miei[k] && altri.length >= L.tavoli.n) {
      const attesa = Math.max(1, Math.ceil(Math.min.apply(null, altri.map(t2 => miei[t2] + finestra2 - ora)) / 60000));
      return rifiuta('tavoli', `Da questo telefono hai già ordinato a ${L.tavoli.n} tavoli nell'ultima ora: aspetta ${attesa} minuti prima di un tavolo nuovo.`);
    }
    recenti.push(ora); inv.tavoli[k] = recenti; miei[k] = ora; inv.dispositivi[disp] = miei;
    scrivi(INV_KEY, inv, 'byup-invii-change');
    return { ok: true };
  };
}

// ─── La valutazione del locale, in un posto solo (P-157) ────────────────────
// La media delle recensioni Byup e il loro numero (venue_profiles.avg_rating,
// review_count) si leggono da un registro condiviso sullo stesso dominio, come
// il nome del locale: la Panoramica, l'anteprima della vetrina in Impostazioni,
// la vetrina della webapp e la scheda del locale nell'app mostrano lo STESSO
// dato. Prima erano tre copie scritte a mano che dicevano tre numeri, e la
// vetrina è proprio la schermata che dovrebbe mostrare al ristoratore quello
// che vede il cliente. Il seme è quello di Statistiche (STAT_CLIENTI.fonti
// .byup: 312 recensioni, media 4,6). Le stelle seguono il numero: piene fino
// alla parte intera, mezza se il resto è almeno un quarto.
const PN_VALUTAZIONE_KEY = 'byup_valutazione';
const PN_VALUTAZIONE_SEME = { media: 4.6, n: 312, settimana: 8 };
window.byupReadValutazione = function () {
  try { const s = localStorage.getItem(PN_VALUTAZIONE_KEY); if (s) { const v = JSON.parse(s); if (v && isFinite(v.media)) return Object.assign({}, PN_VALUTAZIONE_SEME, v); } } catch (e) {}
  return { ...PN_VALUTAZIONE_SEME };
};
window.byupWriteValutazione = function (v) {
  try { localStorage.setItem(PN_VALUTAZIONE_KEY, JSON.stringify(v)); } catch (e) {}
  window.dispatchEvent(new Event('byup-valutazione-change'));
};
window.byupStelle = function (media) {
  const m = Number(media) || 0, intera = Math.floor(m), resto = m - intera;
  return [1, 2, 3, 4, 5].map(n => n <= intera ? 'piena' : (n === intera + 1 && resto >= 0.25) ? 'mezza' : 'vuota');
};

// ─── Lo stato delle credenziali dell'Agenzia, in un posto solo (P-120) ──────
// La password Fisconline scade ogni novanta giorni e, alla scadenza senza
// rinnovo, «l'emissione si ferma» (progetto tecnico §12.2): non esiste una via
// di riserva, e un avviso che non ferma l'emissione lascia il locale a
// incassare senza scontrino. Perciò lo stato vive QUI, e lo leggono tutti: la
// scheda di Dati fiscali (tre gradini), la fascia in Contabilità → Cassa (dal
// PRIMO gradino, non a scadenza avvenuta), le notifiche, e la guardia nei
// QUATTRO punti dove nasce un documento — il saldo del conto in sala, la
// vendita diretta, e le due schermate d'incasso dell'App Staff.
// Vale per tutte le forme giuridiche: cambia solo la persona che rinnova.
const PN_ADE_CRED_KEY = 'byup_ade_cred';
const PN_ADE_CRED_VITA = 90;            // vita della password, in giorni
const PN_ADE_CRED_SOGLIE = [14, 7, 3];  // i gradini del promemoria progressivo
window.PN_ADE_CRED_KEY = PN_ADE_CRED_KEY;
window.PN_ADE_CRED_VITA = PN_ADE_CRED_VITA;
window.PN_ADE_CRED_SOGLIE = PN_ADE_CRED_SOGLIE;
// Senza nulla di salvato l'ultimo rinnovo è di novanta giorni fa (derivato a
// runtime, mai date a mano): la password risulta scaduta oggi e il giro
// completo — scaduta, blocco, rinnovo, verifica, sblocco — si prova da subito.
window.byupAdeCredStato = function () {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(PN_ADE_CRED_KEY)); } catch (e) {}
  const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
  const rinnovo = s && s.rinnovo ? new Date(s.rinnovo + 'T00:00:00')
    : (() => { const d = new Date(oggi); d.setDate(d.getDate() - PN_ADE_CRED_VITA); return d; })();
  const scadenza = new Date(rinnovo); scadenza.setDate(scadenza.getDate() + PN_ADE_CRED_VITA);
  const giorni = Math.round((scadenza - oggi) / 86400000);
  // Il gradino è il primo che si è superato: 14, 7, 3, poi la scadenza.
  const gradino = giorni <= 0 ? 0 : PN_ADE_CRED_SOGLIE.find(g => giorni <= g) || null;
  return {
    giorni, gradino,
    scaduta: giorni <= 0,
    stato: giorni <= 0 ? 'scaduta' : gradino ? 'promemoria' : 'ok',
    scadenza: scadenza.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }),
    verificata: (s && s.verificata) || null,
    rinnovo: s && s.rinnovo ? s.rinnovo : null,
  };
};
window.byupAdeCredRinnova = function () {
  const d = new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const ts = `${d.toLocaleDateString('it-IT')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  try { localStorage.setItem(PN_ADE_CRED_KEY, JSON.stringify({ rinnovo: iso, verificata: ts })); } catch (e) {}
  window.dispatchEvent(new Event('byup-ade-cred-change'));
};
// La guardia dei quattro punti di emissione: se torna qualcosa, il documento
// non può nascere e il testo dice che cosa fare e chi deve farlo.
window.byupAdeCredBlocco = function (forma) {
  const st = window.byupAdeCredStato();
  if (!st.scaduta) return null;
  const chi = window.pnAdeChiRinnova(forma);
  return {
    titolo: 'Le credenziali dell\'Agenzia sono scadute',
    testo: chi.ruolo === 'titolare'
      ? 'Rinnova la password sul sito dell\'Agenzia e poi inseriscila in Dati fiscali. Fino ad allora lo scontrino non può partire.'
      : `La password è di ${chi.nome}, la persona che il locale ha nominato incaricata sul portale: la rinnova lei sul sito dell\'Agenzia, poi si inserisce in Dati fiscali. Fino ad allora lo scontrino non può partire.`,
    chi,
    href: 'byup Impostazioni.html?page=fiscali',
  };
};

// ─── La delega all'Agenzia e le due attivazioni che ne discendono ───────────
// Non si dà più nell'onboarding (4 settembre 2026): il locale entra nel
// gestionale e la campanella gli chiede di collegarsi, la notifica lo porta in
// Dati fiscali, e la delega si dà da lì. La DELEGA è un atto suo sul portale,
// e Byup ne controlla l'esito. La delega NON ferma le fatture (P-170 · D-119):
// partono da OpenAPI senza delega e senza credenziali; con la delega Byup le
// conserva presso l'Agenzia e cura il censimento dei dispositivi. Le due cose
// che seguono — l'ADESIONE alla conservazione e l'ACCREDITAMENTO come
// esercente — sono atti di una persona sul portale, senza interfaccia
// applicativa e senza automatismi: Hubble li segna fatti nel registro delle
// deleghe scrivendo QUESTA chiave (conservazione_il/_da, accreditamento_il/
// _da), oppure li dichiara l'esercente da sé («Faccio da me», o la riga
// guidata dell'accreditamento). delega: attesa | attiva | fai_da_te.
// conservazione: attesa | attiva | dichiarata. accreditamento: attesa |
// attivo | dichiarato. Dichiarato non è verificato, e la scheda lo mostra.
const PN_DELEGA_KEY = 'byup_ade_delega';
const pnDelegaSeme = () => ({ delega: 'attesa', conservazione: 'attesa', accreditamento: 'attesa', attivata_il: null,
  conservazione_il: null, conservazione_da: null, accreditamento_il: null, accreditamento_da: null });
window.byupReadDelega = function () {
  try { const s = localStorage.getItem(PN_DELEGA_KEY); return s ? Object.assign(pnDelegaSeme(), JSON.parse(s)) : pnDelegaSeme(); }
  catch (e) { return pnDelegaSeme(); }
};
window.byupWriteDelega = function (v) {
  try { if (v) localStorage.setItem(PN_DELEGA_KEY, JSON.stringify(v)); else localStorage.removeItem(PN_DELEGA_KEY); } catch (e) {}
  window.dispatchEvent(new Event('byup-ade-delega-change'));
};
// Tutto a posto: la delega c'è e le due attivazioni che ne discendono sono
// concluse. È la condizione che spegne la notifica e fa sparire la scheda.
window.byupDelegaCompleta = function () {
  const d = window.byupReadDelega();
  return d.delega === 'attiva' && d.conservazione === 'attiva' && d.accreditamento === 'attivo';
};

// Niente «codice destinatario del canale» né la sua dichiarazione (P-170 ·
// D-119): il ciclo passivo è fuori dal primo rilascio, e registrare sul
// portale il codice del canale devierebbe le fatture dei fornitori su un
// canale che nessuno legge. Le fatture, comprese le nostre, arrivano al
// recapito del soggetto: PEC o codice destinatario suoi, dal foglio in Dati
// anagrafici.

// ─── Il regime fiscale della sede (P-111 · P-89 · progetto tecnico §4.3) ────
// Due regimi, e non convivono nella stessa sede: il REGIME ATTUALE, dove i
// corrispettivi passano dalla procedura web del documento commerciale online
// e la prova, in un controllo, sono i documenti memorizzati dal sistema
// dell'Agenzia (l'esercente li mostra dal portale Fatture e Corrispettivi con
// le proprie credenziali, come fanno i gestionali che lavorano senza
// registratore telematico); e il regime della SOLUZIONE SOFTWARE, dove esiste
// la console fiscale, che è interfaccia «parte integrante della Soluzione»
// (Specifiche 1.4 §3 lettera b) e vive a un indirizzo proprio.
// Da qui discendono due cose: nel regime attuale la finestra «Verifica
// fiscale» NON si costruisce — il progetto tecnico §4.3 dice che «non è
// richiesta da alcuna fonte» e che le esigenze operative sono coperte dalla
// contabilità del gestionale — e al suo posto la Contabilità dice dove si va
// davvero, cioè al portale; nel regime della Soluzione lo stesso pulsante
// diventa la porta verso la console (P-89 riscritta).
// Nel mock la sede è nel regime attuale. Finché non arriva P-99 (il passaggio
// di regime per sede) questa è una costante, non una configurazione.
const PN_REGIME_SEDE = 'attuale';   // 'attuale' | 'soluzione'
window.PN_REGIME_SEDE = PN_REGIME_SEDE;
window.pnRegimeSoluzione = () => PN_REGIME_SEDE === 'soluzione';
// Il portale dove l'esercente mostra i propri invii in un controllo.
window.PN_PORTALE_FC = 'https://ivaservizi.agenziaentrate.gov.it/portale/';

// ─── Le regole regionali su coperto e servizio (P-171 · D-120) ──────────────
// regional_charge_rules del modello (v0.25): una riga per regione, con che
// cosa è ammesso e la fonte. La regione della sede si deriva dalla sigla
// della provincia (venues.address_region_code): RM → Lazio. Le righe sono
// quelle del riferimento dei valori: nel Lazio il coperto è vietato in ogni
// somministrazione e il servizio è ammesso se il listino lo mostra prima
// dell'ordine (L.R. 22/2019, art. 75, commi 2-4); in Toscana, Liguria, Marche
// e Molise coperto e servizio valgono alla carta e non nelle formule a prezzo
// fisso; altrove entrambi, esposti prima dell'ordine (R.D. 635/1940, art.
// 180). Le leggi regionali cambiano: la tabella si aggiorna qui.
const PN_REGIONE_DI_PROVINCIA = {
  AG:'Sicilia', AL:'Piemonte', AN:'Marche', AO:'Valle d\'Aosta', AP:'Marche', AQ:'Abruzzo', AR:'Toscana', AT:'Piemonte', AV:'Campania',
  BA:'Puglia', BG:'Lombardia', BI:'Piemonte', BL:'Veneto', BN:'Campania', BO:'Emilia-Romagna', BR:'Puglia', BS:'Lombardia', BT:'Puglia', BZ:'Trentino-Alto Adige',
  CA:'Sardegna', CB:'Molise', CE:'Campania', CH:'Abruzzo', CL:'Sicilia', CN:'Piemonte', CO:'Lombardia', CR:'Lombardia', CS:'Calabria', CT:'Sicilia', CZ:'Calabria',
  EN:'Sicilia', FC:'Emilia-Romagna', FE:'Emilia-Romagna', FG:'Puglia', FI:'Toscana', FM:'Marche', FR:'Lazio', GE:'Liguria', GO:'Friuli-Venezia Giulia', GR:'Toscana',
  IM:'Liguria', IS:'Molise', KR:'Calabria', LC:'Lombardia', LE:'Puglia', LI:'Toscana', LO:'Lombardia', LT:'Lazio', LU:'Toscana',
  MB:'Lombardia', MC:'Marche', ME:'Sicilia', MI:'Lombardia', MN:'Lombardia', MO:'Emilia-Romagna', MS:'Toscana', MT:'Basilicata',
  NA:'Campania', NO:'Piemonte', NU:'Sardegna', OR:'Sardegna', PA:'Sicilia', PC:'Emilia-Romagna', PD:'Veneto', PE:'Abruzzo', PG:'Umbria', PI:'Toscana', PN:'Friuli-Venezia Giulia', PO:'Toscana', PR:'Emilia-Romagna', PT:'Toscana', PU:'Marche', PV:'Lombardia', PZ:'Basilicata',
  RA:'Emilia-Romagna', RC:'Calabria', RE:'Emilia-Romagna', RG:'Sicilia', RI:'Lazio', RM:'Lazio', RN:'Emilia-Romagna', RO:'Veneto',
  SA:'Campania', SI:'Toscana', SO:'Lombardia', SP:'Liguria', SR:'Sicilia', SS:'Sardegna', SU:'Sardegna', SV:'Liguria',
  TA:'Puglia', TE:'Abruzzo', TN:'Trentino-Alto Adige', TO:'Piemonte', TP:'Sicilia', TR:'Umbria', TS:'Friuli-Venezia Giulia', TV:'Veneto',
  UD:'Friuli-Venezia Giulia', VA:'Lombardia', VB:'Piemonte', VC:'Piemonte', VE:'Veneto', VI:'Veneto', VR:'Veneto', VT:'Lazio', VV:'Calabria',
};
const PN_REGOLE_REGIONALI = [
  { regione: 'Lazio',   coperto: false, servizio: true, prezzoFissoVietato: false, listinoPrima: true, fonte: 'L.R. Lazio 22/2019, art. 75',
    nota: 'Nel Lazio il coperto è vietato (L.R. 22/2019, art. 75): la voce si chiama servizio e sta nel menù prima dell\'ordine.' },
  { regione: 'Toscana', coperto: true,  servizio: true, prezzoFissoVietato: true,  listinoPrima: true, fonte: 'L.R. Toscana 62/2018, art. 100',
    nota: 'In Toscana coperto e servizio valgono alla carta e non nelle formule a prezzo fisso (L.R. 62/2018, art. 100).' },
  { regione: 'Liguria', coperto: true,  servizio: true, prezzoFissoVietato: true,  listinoPrima: true, fonte: 'L.R. Liguria 1/2007, art. 114',
    nota: 'In Liguria coperto e servizio valgono alla carta e non nelle formule a prezzo fisso (L.R. 1/2007, art. 114).' },
  { regione: 'Marche',  coperto: true,  servizio: true, prezzoFissoVietato: true,  listinoPrima: true, fonte: 'L.R. Marche 27/2009, art. 68',
    nota: 'Nelle Marche coperto e servizio valgono alla carta e non nelle formule a prezzo fisso (L.R. 27/2009, art. 68).' },
  { regione: 'Molise',  coperto: true,  servizio: true, prezzoFissoVietato: true,  listinoPrima: true, fonte: 'L.R. Molise 4/2021, art. 100',
    nota: 'In Molise coperto e servizio valgono alla carta e non nelle formule a prezzo fisso (L.R. 4/2021, art. 100).' },
  { regione: '*',       coperto: true,  servizio: true, prezzoFissoVietato: false, listinoPrima: true, fonte: 'R.D. 635/1940, art. 180',
    nota: 'Coperto e servizio sono ammessi (R.D. 635/1940, art. 180): il coperto è proposto, non imposto, e la voce sta nel menù prima dell\'ordine.' },
];
window.byupRegioneDaProvincia = (sigla) => PN_REGIONE_DI_PROVINCIA[String(sigla || '').trim().toUpperCase()] || null;
window.byupRegoleRegionali = (regione) => PN_REGOLE_REGIONALI.find(r => r.regione === regione) || PN_REGOLE_REGIONALI.find(r => r.regione === '*');
// La regola della sede del seme, letta dal suo indirizzo.
window.byupRegolaSede = () => {
  const e = window.byupReadEsercente ? window.byupReadEsercente() : {};
  const regione = window.byupRegioneDaProvincia(e.prov);
  return Object.assign({ regione, prov: e.prov }, window.byupRegoleRegionali(regione));
};
window.byupQualificazioniAmmesse = () => { const r = window.byupRegolaSede(); return ['coperto', 'servizio'].filter(q => r[q]); };

// ─── Coperto e servizio (P-103) ─────────────────────────────────────────────
// Due scelte indipendenti: la QUALIFICAZIONE (coperto o servizio) e la FORMA
// (fissa a persona o percentuale sul totale). Nessuna fonte lega le due
// dimensioni, quindi il prodotto non le lega: esistono coperto a persona,
// servizio a percentuale, ma anche coperto a percentuale e servizio a persona.
// LA CIFRA DI PARTENZA È ZERO, e la sceglie il ristorante. Il default propone
// la FORMA — coperto fisso a persona, perché è ciò che fa il mercato (FIPE
// 2023: coperto nell'80% dei ristoranti, media 2,90 €, servizio nel 4,9%) —
// ma non l'importo: un locale che non applica il coperto non deve trovarselo
// addosso, e uno che lo applica non deve trovarsi una cifra che non ha scelto
// su un conto vero. A zero la voce è SPENTA: non compare al cliente, non entra
// nel conto, non finisce sullo scontrino. Dove un regolamento comunale vieti
// il coperto ammettendo il servizio, la stessa cifra è lecita sotto un nome e
// illecita sotto l'altro, e la qualificazione si cambia qui. Si applica solo
// in sala, non all'asporto.
// Registro in localStorage (byup_coperto), letto dal conto in sala, dal
// campione di scontrino e — sullo stesso dominio — da app e webapp, che ne
// tengono una copia guardata con lo stesso default. Nel modello: la voce si
// espone prima della conferma e il momento finisce in orders.cover_disclosed_at.
const PN_COPERTO_KEY = 'byup_coperto';
// Il predefinito segue la regione della sede (P-171 · D-120): dove il
// coperto è vietato, la voce nasce «servizio». Sospesa = la sede è passata
// in una regione che vieta la qualificazione in uso: la voce non si rinomina
// da sola, tace, e la scheda Servizio chiede di reimpostarla.
const pnCopertoDefault = () => ({ qualificazione: (window.byupRegolaSede && !window.byupRegolaSede().coperto) ? 'servizio' : 'coperto', forma: 'fissa', importo: 0, aliquota: 0, sospesa: false });
const PN_COPERTO_NOMI = { coperto: 'Coperto', servizio: 'Servizio' };
window.byupReadCoperto = function () {
  try { const s = localStorage.getItem(PN_COPERTO_KEY); return s ? Object.assign(pnCopertoDefault(), JSON.parse(s)) : pnCopertoDefault(); }
  catch (e) { return pnCopertoDefault(); }
};
window.byupWriteCoperto = function (v) {
  try { localStorage.setItem(PN_COPERTO_KEY, JSON.stringify(v)); } catch (e) {}
  window.dispatchEvent(new Event('byup-coperto-change'));
};
// Il controllo contro la regola della sede: se la qualificazione in uso non è
// ammessa la voce si sospende; se lo è, la sospensione cade. App e webapp
// leggono la sospensione dal registro, e la voce non compare.
window.byupCopertoVerifica = function () {
  const c = window.byupReadCoperto(); const r = window.byupRegolaSede();
  const sospesa = !r[c.qualificazione];
  if (!!c.sospesa !== sospesa) window.byupWriteCoperto({ ...c, sospesa });
  return sospesa;
};
// La riga come la vede il cliente prima di confermare e come finisce sul
// conto: nome, forma, importo o aliquota, e il valore su un subtotale per N
// coperti. Importo o aliquota a zero = voce spenta.
window.byupCopertoRiga = function (subtotale, coperti, cfg) {
  const c = cfg || window.byupReadCoperto();
  const nome = PN_COPERTO_NOMI[c.qualificazione] || 'Coperto';
  if (c.sospesa) return { nome, attiva: false, sospesa: true, forma: c.forma, importo: Number(c.importo) || 0, aliquota: Number(c.aliquota) || 0, etichetta: '', dettaglio: '', valore: 0 };
  if (c.forma === 'percentuale') {
    const aliquota = Number(c.aliquota) || 0;
    return { nome, attiva: aliquota > 0, forma: 'percentuale', aliquota,
      etichetta: `${nome} · ${aliquota}% sul totale`, dettaglio: `${nome} ${aliquota}%`,
      valore: Math.round((subtotale || 0) * aliquota) / 100 };
  }
  const importo = Number(c.importo) || 0;
  const n = Math.max(1, coperti || 1);
  return { nome, attiva: importo > 0, forma: 'fissa', importo,
    etichetta: `${nome} · ${importo.toFixed(2).replace('.', ',')} € a persona`, dettaglio: `${nome} × ${n}`,
    valore: Math.round(importo * n * 100) / 100 };
};

// ─── I buoni pasto (P-173 · D-124) ──────────────────────────────────────────
// Il buono non è denaro: è un credito verso l'emittente, e la cassa lo tiene
// distinto dal contante. In cassa si registra QUELLO CHE SI È ACCETTATO —
// emittente, numero dei titoli, valore facciale, formato, riferimento
// dell'autorizzazione (payment_meal_vouchers) — e i vincoli di legge si
// impongono e si spiegano: al massimo OTTO titoli per transazione, sempre per
// l'intero valore facciale, senza resto (Allegato II.17 al D.Lgs. 36/2023,
// art. 4). Byup NON valida il buono: la verifica passa dallo strumento
// dell'emittente, e la finestra lo dice. Le convenzioni si dichiarano in
// Impostazioni → Integrazioni (venue_meal_voucher_agreements: emittente,
// codice esercente, sconto pattuito — dal 2026 non oltre il cinque per cento
// —, giorni di rimborso, decadenza): finché non ce n'è una, la tessera in
// cassa non compare. Il riepilogo per emittente e periodo
// (meal_voucher_settlements) sta in Contabilità e serve a riscontrare la
// prefattura dell'emittente e a comunicargli il numero della fattura: nessun
// pulsante la emette, non è del primo rilascio. Registri sullo stesso
// dominio: byup_buoni_convenzioni, byup_buoni_accettazioni,
// byup_buoni_riepiloghi.
const PN_BUONI_EMITTENTI = [ // meal_voucher_issuers: l'anagrafe comune, tenuta da Byup
  { id: 'edenred',    name: 'Edenred Italia',     brand: 'Ticket Restaurant', invoices_on_behalf: true },
  { id: 'pluxee',     name: 'Pluxee Italia',      brand: 'Pluxee',            invoices_on_behalf: true },
  { id: 'pellegrini', name: 'Pellegrini',         brand: 'Pellegrini Card',   invoices_on_behalf: true },
  { id: 'upday',      name: 'Up Day',             brand: 'Day',               invoices_on_behalf: true },
  { id: 'repas',      name: 'Repas Lunch Coupon', brand: 'Lunch Coupon',      invoices_on_behalf: true },
];
const PN_BUONI_MAX_TITOLI = 8;      // art. 4, co. 1, lett. d): non cumulabili oltre otto
const PN_BUONI_SCONTO_MAX = 5;      // art. 37 L. 193/2024: dal 2026 lo sconto non supera il cinque per cento
const PN_BUONI_FORMATI = [{ id: 'paper', label: 'Cartaceo' }, { id: 'electronic', label: 'Elettronico' }, { id: 'digital', label: 'Digitale' }];
const PN_BUONI_STATI = { open: 'Aperto', closed: 'Chiuso', invoiced: 'Fatturato', paid: 'Incassato', disputed: 'Contestato' };
const PN_BUONI_CONV_KEY = 'byup_buoni_convenzioni', PN_BUONI_ACC_KEY = 'byup_buoni_accettazioni', PN_BUONI_RIEP_KEY = 'byup_buoni_riepiloghi';
const pnBuoniLeggi = (k) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
const pnBuoniScrivi = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} window.dispatchEvent(new Event('byup-buoni-change')); };
const pnR2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
Object.assign(window, { PN_BUONI_EMITTENTI, PN_BUONI_MAX_TITOLI, PN_BUONI_SCONTO_MAX, PN_BUONI_FORMATI, PN_BUONI_STATI });
window.byupBuoniEmittente = (id) => PN_BUONI_EMITTENTI.find(e => e.id === id) || { id, name: id, brand: id };
window.byupReadConvenzioniBuoni = () => pnBuoniLeggi(PN_BUONI_CONV_KEY) || [];
window.byupWriteConvenzioniBuoni = (l) => pnBuoniScrivi(PN_BUONI_CONV_KEY, l);
window.byupAggiungiConvenzioneBuoni = (c) => {
  const l = window.byupReadConvenzioniBuoni(); const id = 'conv-' + Date.now();
  l.push(Object.assign({ id, valid_from: new Date().toISOString().slice(0, 10), valid_to: null }, c));
  window.byupWriteConvenzioniBuoni(l); return id;
};
// La convenzione superata resta, con la data di fine: il riepilogo di un
// periodo passato si ricostruisce con lo sconto di allora.
window.byupTerminaConvenzioneBuoni = (id) => window.byupWriteConvenzioniBuoni(window.byupReadConvenzioniBuoni().map(c => c.id === id ? { ...c, valid_to: new Date().toISOString().slice(0, 10) } : c));
window.byupBuoniAttivi = () => { const oggi = new Date().toISOString().slice(0, 10); return window.byupReadConvenzioniBuoni().filter(c => !c.valid_to || c.valid_to >= oggi); };
window.byupConvenzioneBuoni = (issuer_id) => window.byupBuoniAttivi().find(c => c.issuer_id === issuer_id) || null;
// Il seme delle accettazioni: nei giorni dei conti del seme di Contabilità,
// così la chiusura di cassa ha la sua colonna. Compare solo per gli emittenti
// con una convenzione, perché senza convenzione nessun buono si accetta.
const PN_BUONI_SEME = [
  { id: 'acc-s1', issuer_id: 'edenred', voucher_count: 2, face_value: 8, total_face_value: 16, voucher_format: 'electronic', authorization_ref: 'ED-4471-0091', at: '2025-11-14T13:10:00', conto: 'Tavolo 4' },
  { id: 'acc-s2', issuer_id: 'edenred', voucher_count: 1, face_value: 8, total_face_value: 8,  voucher_format: 'digital',    authorization_ref: '',             at: '2025-11-15T13:25:00', conto: 'Banco' },
  { id: 'acc-s3', issuer_id: 'pluxee',  voucher_count: 3, face_value: 7, total_face_value: 21, voucher_format: 'paper',      authorization_ref: '',             at: '2025-11-15T14:05:00', conto: 'Tavolo 9' },
  { id: 'acc-s4', issuer_id: 'edenred', voucher_count: 4, face_value: 8, total_face_value: 32, voucher_format: 'electronic', authorization_ref: 'ED-4471-0132', at: '2025-11-16T13:40:00', conto: 'Tavolo 12' },
  { id: 'acc-s5', issuer_id: 'pluxee',  voucher_count: 2, face_value: 7, total_face_value: 14, voucher_format: 'electronic', authorization_ref: 'PX-88-2210',   at: '2025-11-16T12:50:00', conto: 'Banco' },
];
window.byupBuoniAccettazioni = () => {
  const conv = new Set(window.byupReadConvenzioniBuoni().map(c => c.issuer_id));
  return [...PN_BUONI_SEME.filter(a => conv.has(a.issuer_id)), ...(pnBuoniLeggi(PN_BUONI_ACC_KEY) || [])];
};
window.byupBuoniRegistraAccettazione = (a) => {
  const l = pnBuoniLeggi(PN_BUONI_ACC_KEY) || []; const conv = window.byupConvenzioneBuoni(a.issuer_id);
  const rec = Object.assign({ id: 'acc-' + Date.now(), at: new Date().toISOString(), agreement_id: conv ? conv.id : null }, a, { total_face_value: pnR2(a.voucher_count * a.face_value) });
  l.push(rec); pnBuoniScrivi(PN_BUONI_ACC_KEY, l); return rec;
};
// Il valore facciale proposto: l'ultimo usato con quell'emittente.
window.byupBuoniUltimoFacciale = (issuer_id) => { const l = window.byupBuoniAccettazioni().filter(a => a.issuer_id === issuer_id).sort((x, y) => String(x.at).localeCompare(String(y.at))); return l.length ? l[l.length - 1].face_value : 8; };
window.byupBuoniTotale = (v) => pnR2((parseInt(v && v.voucher_count, 10) || 0) * (Number(v && v.face_value) || 0));
// Valido = c'è l'emittente, i titoli stanno fra uno e otto, il facciale è
// positivo e, se i buoni superano il dovuto, il cliente ha confermato che
// perde la differenza.
window.byupBuoniValido = (v, dovuto) => {
  const n = parseInt(v && v.voucher_count, 10) || 0, f = Number(v && v.face_value) || 0;
  if (!v || !v.issuer_id || n < 1 || n > PN_BUONI_MAX_TITOLI || f <= 0) return false;
  return !(pnR2(n * f) > (dovuto || 0) + 0.004 && !v.eccedenza_ok);
};
// Il riepilogo di un mese, una riga per emittente (meal_voucher_settlements):
// titoli, facciale, sconto della convenzione, netto atteso, stato e fattura.
window.byupBuoniRiepilogo = (mese) => {
  const acc = window.byupBuoniAccettazioni().filter(a => String(a.at).slice(0, 7) === mese);
  const riep = pnBuoniLeggi(PN_BUONI_RIEP_KEY) || {}; const perEm = {};
  acc.forEach(a => { const r = perEm[a.issuer_id] || (perEm[a.issuer_id] = { issuer_id: a.issuer_id, voucher_count: 0, total_face_value: 0 }); r.voucher_count += a.voucher_count; r.total_face_value += a.total_face_value; });
  return Object.values(perEm).map(r => {
    const c = window.byupReadConvenzioniBuoni().find(x => x.issuer_id === r.issuer_id);
    const sconto = c ? (Number(c.discount_percent) || 0) : null;
    const scontoEur = sconto == null ? null : pnR2(r.total_face_value * sconto / 100);
    const s = riep[mese + '|' + r.issuer_id] || {};
    return Object.assign({}, r, { total_face_value: pnR2(r.total_face_value), discount_percent: sconto, sconto: scontoEur, expected_net: scontoEur == null ? null : pnR2(r.total_face_value - scontoEur),
      status: s.status || 'open', invoice_number: s.invoice_number || '', invoice_date: s.invoice_date || '' });
  }).sort((a, b) => b.total_face_value - a.total_face_value);
};
window.byupBuoniRiepilogoScrivi = (mese, issuer_id, patch) => { const riep = pnBuoniLeggi(PN_BUONI_RIEP_KEY) || {}; const k = mese + '|' + issuer_id; riep[k] = Object.assign({}, riep[k] || {}, patch); pnBuoniScrivi(PN_BUONI_RIEP_KEY, riep); };
window.byupBuoniMesi = () => [...new Set(window.byupBuoniAccettazioni().map(a => String(a.at).slice(0, 7)))].sort().reverse();

// La finestra dei buoni in cassa: la usano la Sala e la Vendita diretta, con
// gli stessi campi e le stesse parole. `valore` = { issuer_id, voucher_count,
// face_value, voucher_format, authorization_ref, eccedenza_ok }.
window.PnBuoniPasto = function PnBuoniPasto({ dovuto, valore, onChange }) {
  const conv = window.byupBuoniAttivi();
  const v = valore || {};
  const set = (patch) => onChange(Object.assign({}, v, patch));
  React.useEffect(() => {
    if (!v.issuer_id && conv.length) onChange({ issuer_id: conv[0].issuer_id, voucher_count: 1, face_value: window.byupBuoniUltimoFacciale(conv[0].issuer_id), voucher_format: 'electronic', authorization_ref: '', eccedenza_ok: false });
  }, []);
  const n = parseInt(v.voucher_count, 10) || 0;
  const facciale = Number(v.face_value) || 0;
  const totale = pnR2(n * facciale);
  const eccede = totale > (dovuto || 0) + 0.004;
  const resta = Math.max(0, pnR2((dovuto || 0) - totale));
  const eur = (x) => `€ ${pnR2(x).toFixed(2).replace('.', ',')}`;
  const LAB = { fontSize: 12.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 };
  const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${PN.BORDER}`, borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: PN.TEXT, background: PN.WHITE, boxSizing: 'border-box', outline: 'none' };
  const BTN = (on) => ({ padding: '8px 12px', borderRadius: 999, border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`, background: on ? PN.TEXT : PN.WHITE, color: on ? PN.WHITE : PN.TEXT, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' });
  const cambiaEmittente = (id) => set({ issuer_id: id, face_value: window.byupBuoniUltimoFacciale(id) });
  return (
    <div data-buoni-pasto style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
        <div>
          <div style={LAB}>Emittente</div>
          <select value={v.issuer_id || ''} onChange={e => cambiaEmittente(e.target.value)} style={INP}>
            {conv.map(c => { const e = window.byupBuoniEmittente(c.issuer_id); return <option key={c.id} value={c.issuer_id}>{e.brand}{e.brand !== e.name ? ` · ${e.name}` : ''}</option>; })}
          </select>
        </div>
        <div>
          <div style={LAB}>Numero dei titoli</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button type="button" onClick={() => set({ voucher_count: Math.max(1, n - 1) })} style={{ ...BTN(false), padding: '8px 13px' }}>−</button>
            <input type="number" min="1" max={PN_BUONI_MAX_TITOLI} step="1" value={v.voucher_count || ''} onChange={e => set({ voucher_count: Math.max(1, Math.min(PN_BUONI_MAX_TITOLI, parseInt(e.target.value, 10) || 1)) })} style={{ ...INP, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}/>
            <button type="button" data-buoni-piu disabled={n >= PN_BUONI_MAX_TITOLI} onClick={() => set({ voucher_count: Math.min(PN_BUONI_MAX_TITOLI, n + 1) })} style={{ ...BTN(false), padding: '8px 13px', opacity: n >= PN_BUONI_MAX_TITOLI ? 0.45 : 1 }}>+</button>
          </div>
          <div style={{ fontSize: 12.5, color: n >= PN_BUONI_MAX_TITOLI ? '#B45309' : PN.MUTED, marginTop: 5, lineHeight: 1.4 }}>Al massimo {PN_BUONI_MAX_TITOLI}: oltre otto buoni per transazione la legge non consente.</div>
        </div>
        <div>
          <div style={LAB}>Valore facciale</div>
          <input type="number" min="0" step="0.5" value={v.face_value ?? ''} onChange={e => set({ face_value: e.target.value })} style={{ ...INP, fontVariantNumeric: 'tabular-nums' }}/>
          <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 5, lineHeight: 1.4 }}>Del singolo titolo, per intero: il buono non si fraziona.</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: 12 }}>
        <div>
          <div style={LAB}>Formato</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PN_BUONI_FORMATI.map(f => <button key={f.id} type="button" data-formato={f.id} onClick={() => set({ voucher_format: f.id })} style={BTN((v.voucher_format || 'electronic') === f.id)}>{f.label}</button>)}
          </div>
        </div>
        <div>
          <div style={LAB}>Riferimento autorizzazione <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>· facoltativo</span></div>
          <input value={v.authorization_ref || ''} onChange={e => set({ authorization_ref: e.target.value })} placeholder="Il codice restituito dal terminale o dall'app dell'emittente" style={{ ...INP, fontSize: 14.5 }}/>
        </div>
      </div>
      {(v.voucher_format || 'electronic') === 'paper' && (
        <div data-avviso-cartaceo style={{ padding: '10px 13px', borderRadius: 10, background: PN.AMBER_SOFT, color: '#92400E', fontSize: 14, lineHeight: 1.45 }}>
          <b>Valida il buono prima di ritirarlo:</b> se risulta già speso altrove il rimborso non arriva. Il cliente vi appone data e firma, tu il timbro.
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '11px 13px', borderRadius: 10, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}` }}>
        <span style={{ fontSize: 14, color: PN.MUTED }}>{n} × {eur(facciale)} =</span>
        <span data-buoni-totale style={{ fontSize: 20, fontWeight: 800, color: PN.TEXT, fontVariantNumeric: 'tabular-nums' }}>{eur(totale)}</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontSize: 14, color: PN.MUTED }}>dovuto {eur(dovuto || 0)}</span>
      </div>
      {eccede && (
        <div data-avviso-eccedenza style={{ padding: '11px 13px', borderRadius: 10, background: '#FEE2E2', border: '1px solid rgba(185, 28, 28, 0.25)', color: '#991B1B', fontSize: 14, lineHeight: 1.45 }}>
          <b>I buoni valgono {eur(totale)} e il dovuto è {eur(dovuto || 0)}: i buoni non danno resto, il cliente perde la differenza</b> di {eur(totale - (dovuto || 0))}.
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer', color: PN.TEXT }}>
            <input type="checkbox" checked={!!v.eccedenza_ok} onChange={e => set({ eccedenza_ok: e.target.checked })} style={{ accentColor: '#B91C1C' }}/>
            Il cliente lo sa e conferma
          </label>
        </div>
      )}
      {!eccede && resta > 0.004 && n > 0 && (
        <div data-avviso-residuo style={{ fontSize: 14, color: PN.MUTED, lineHeight: 1.45 }}>Restano <b style={{ color: PN.TEXT }}>{eur(resta)}</b>: il residuo resta aperto e si chiude con un'altra tessera in questa finestra.</div>
      )}
      <div style={{ fontSize: 12.5, color: PN.MUTED_SOFT || PN.MUTED, lineHeight: 1.45 }}>La validità del buono la verifica lo strumento dell'emittente. Qui si registra soltanto quello che hai accettato.</div>
    </div>
  );
};

