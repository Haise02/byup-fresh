// byup-a11y — il lato React della scala d'interfaccia, e l'anello di focus.
//
// Va caricato per PRIMO fra i .jsx, subito dopo panoramica-tokens.jsx, in ogni
// pagina del gestionale. Non dipende da `PN`: il Login non carica i token e
// deve avere lo stesso anello di focus di tutto il resto.
//
// Il motore della scala sta in byup-fit.js (JS puro, nell'<head>), perché il
// fit deve girare prima di Babel. Qui c'è quello che serve a React: l'hook
// useA11y(), il contesto, le etichette in italiano dei tre livelli.

// ─── I tre livelli ──────────────────────────────────────────────────────────
// Etichettati in italiano e SENZA percentuali: «175%» non dice niente a chi
// non sa cos'è uno zoom. La percentuale resta qui per chi legge il codice, non
// va mai a schermo.
const BYUP_SCALE_INFO = [
  { id: 'normale', nome: 'Normale',     fattore: 1,    descrizione: 'La dimensione di sempre.' },
  { id: 'grande',  nome: 'Grande',      fattore: 1.75, descrizione: 'Testi e pulsanti più grandi. Nelle schermate si vede meno roba per volta.' },
  { id: 'massima', nome: 'Molto grande', fattore: 2.5, descrizione: 'Il massimo ingrandimento. Pensato per chi fatica a leggere da vicino.' },
];

// byup-fit.js le pubblica già; qui si garantisce che ci siano anche se questo
// file venisse caricato da solo.
if (!window.BYUP_SCALES) {
  window.BYUP_SCALES = { normale: 1, grande: 1.75, massima: 2.5 };
}

// ─── L'anello di focus, definito una volta per tutta l'app ──────────────────
// Il gestionale ha 108 `outline: 'none'` inline sugli input, senza nessuna
// regola di sostituzione: oggi, a qualunque scala, non è navigabile da tastiera
// in modo visibile (WCAG 2.4.7). Una regola in un foglio di stile con
// `!important` vince sullo stile inline che non ce l'ha, quindi questa li
// riprende tutti senza toccarne uno.
//
// Contrasti misurati: #0F1115 su bianco 18,90:1 e su #F5F6F8 17,47:1; sul
// vetro scuro del sunset serve l'inverso — #FFE0DD su #15171C fa 14,48:1.
// La variabile `--byup-focus` è il punto in cui una superficie scura dichiara
// il proprio anello chiaro, senza che questa regola sappia nulla di lei.
(function () {
  if (document.getElementById('byup-a11y-style')) return;
  const st = document.createElement('style');
  st.id = 'byup-a11y-style';
  st.textContent = `
:root { --byup-focus: #0F1115; --byup-focus-halo: rgba(255,255,255,0.92); }
[data-byup-dark], .byup-dark { --byup-focus: #FFE0DD; --byup-focus-halo: rgba(15,17,21,0.85); }

/* Tutto quello che può prendere il fuoco, non un elenco di tag: Chrome rende
   focalizzabili anche le AREE CHE SCORRONO — è come chi naviga da tastiera le
   fa scorrere — e su quelle disegnava il suo filo di mezzo pixel. Adesso hanno
   lo stesso anello di tutto il resto. */
:where(*):focus-visible {
  outline: 3px solid var(--byup-focus) !important;
  outline-offset: 2px !important;
  /* L'alone tiene l'anello leggibile anche quando l'elemento a fuoco tocca una
     superficie dello stesso tono: due bordi, mai uno solo. */
  box-shadow: 0 0 0 2px var(--byup-focus-halo) !important;
  z-index: 3;
}
/* Il mouse non deve vedere niente di tutto questo: :focus-visible già lo
   esclude, ma Safari mette comunque il suo anello sul :focus da click. */
:where(a[href], button, input, select, textarea, summary, [tabindex]):focus:not(:focus-visible) {
  outline: none;
}
/* 2.4.11 — l'elemento a fuoco non può finire sotto una testata o una barra
   appiccicosa quando lo scroll lo raggiunge da tastiera. */
* { scroll-margin: 16px; }

/* ── 2.5.8: nessun bersaglio sotto i 24 x 24 px ────────────────────────────
   Una regola sola invece di ventiquattro modifiche sparse. Le proprieta'
   min-width e min-height LIMITANO la misura usata, quindi vincono sullo stile
   inline che dichiara width:18px: non serve !important e non serve toccare i
   punti uno per uno. Cresce l'AREA del bersaglio; l'icona dentro, che e' un
   figlio con la sua misura, resta quella che era.
   Il selettore :where() azzera la specificita': qualunque regola che voglia
   fare diversamente in futuro vince senza combattere.
   NOTA: qui dentro non possono esserci apici inversi, perche' questo blocco e'
   un template literal e li' dentro chiuderebbero la stringa. */
:where(button, summary, [role="button"], [role="switch"], [role="tab"], [role="menuitem"],
       input:not([type="hidden"]), select, textarea) {
  min-width: 24px;
  min-height: 24px;
}
`;
  (document.head || document.documentElement).appendChild(st);
})();

// ─── Lo stato, per React ────────────────────────────────────────────────────
// `byup:fit` è l'unico evento: lo emette byup-fit.js a ogni ricalcolo, cioè a
// ogni resize, a ogni cambio di scala e a ogni remount del frame.
function byupA11yState() {
  const f = window.BYUP_FIT || {};
  return {
    scaleId: f.scaleId || 'normale',
    scale:   f.scale   || 1,
    w:       f.w       || window.innerWidth,
    h:       f.h       || window.innerHeight,
    bp:      f.bp      || 'lg',
  };
}

const BYUP_A11Y = React.createContext(null);

// Il Provider è facoltativo: l'hook funziona anche senza, perché le pagine del
// gestionale sono tredici radici React separate e non hanno un albero comune.
// Dove una pagina lo monta, i suoi figli leggono un solo abbonamento invece di
// uno per componente.
function ByupA11yProvider({ children }) {
  const v = useA11yLive();
  return <BYUP_A11Y.Provider value={v}>{children}</BYUP_A11Y.Provider>;
}

function useA11yLive() {
  const [s, setS] = React.useState(byupA11yState);
  React.useEffect(() => {
    const f = () => setS(prev => {
      const n = byupA11yState();
      // Il resize emette in continuo: si rirenderizza solo se cambia qualcosa
      // che un layout guarda davvero.
      if (n.bp === prev.bp && n.scaleId === prev.scaleId &&
          Math.round(n.w) === Math.round(prev.w) && Math.round(n.h) === Math.round(prev.h)) return prev;
      return n;
    });
    window.addEventListener('byup:fit', f);
    f();
    return () => window.removeEventListener('byup:fit', f);
  }, []);
  return {
    ...s,
    setScale: (id) => window.byupSetScale && window.byupSetScale(id),
  };
}

// `{ scaleId, scale, setScale, w, h, bp }` — w e h sono la TELA LOGICA, cioè
// lo spazio vero che il layout ha a disposizione, non la finestra.
function useA11y() {
  const ctx = React.useContext(BYUP_A11Y);
  const live = useA11yLive();
  return ctx || live;
}

// ─── Trappola di focus, per tutto ciò che si apre sopra la pagina ───────────
// Cassetto della barra laterale, finestre, fogli: mentre sono aperti il focus
// non deve poter uscire da lì, `Esc` deve chiudere, e alla chiusura il focus
// torna dove l'utente l'aveva lasciato. Senza il ritorno, chi naviga da
// tastiera riparte dall'inizio del documento a ogni chiusura.
const BYUP_FOCUSABILI = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', 'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function byupFocusabili(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(BYUP_FOCUSABILI))
    .filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
}

// `ref` è il contenitore; `aperto` lo stato; `onChiudi` viene chiamato da Esc.
// Restituisce il ref da mettere su chi ha aperto, per il ritorno del focus.
function useTrappolaFocus(ref, aperto, onChiudi) {
  const daDove = React.useRef(null);

  React.useEffect(() => {
    if (!aperto) return;
    daDove.current = document.activeElement;
    // Il primo fuoco va dentro: l'elemento stesso se non ha figli a fuoco.
    const t = setTimeout(() => {
      const f = byupFocusabili(ref.current);
      if (f.length) f[0].focus();
      else if (ref.current) { ref.current.setAttribute('tabindex', '-1'); ref.current.focus(); }
    }, 0);

    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onChiudi && onChiudi(); return; }
      if (e.key !== 'Tab') return;
      const f = byupFocusabili(ref.current);
      if (!f.length) return;
      const primo = f[0], ultimo = f[f.length - 1];
      // Il focus è uscito (click altrove, o elementi rimontati): si riporta dentro.
      if (!ref.current || !ref.current.contains(document.activeElement)) {
        e.preventDefault(); primo.focus(); return;
      }
      if (e.shiftKey && document.activeElement === primo) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primo.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey, true); };
  }, [aperto]);

  // Il ritorno: alla chiusura il focus torna a chi aveva aperto. Il rientro è
  // differito perché chi ha aperto può essere stato smontato e rimontato
  // mentre il pannello era aperto — è il caso della barra laterale, dove il
  // pulsante sparisce dentro al cassetto e ricompare quando si chiude.
  const tornaA = React.useRef(null);
  React.useEffect(() => {
    if (aperto) return;
    if (!daDove.current && !tornaA.current) return;
    const t = setTimeout(() => {
      const el = (tornaA.current && document.contains(tornaA.current)) ? tornaA.current
               : (daDove.current && document.contains(daDove.current)) ? daDove.current : null;
      if (el && el.focus) el.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [aperto]);

  return tornaA;
}

// ─── Le finestre, quando la tela non le regge più ───────────────────────────
// Sotto `md` una finestra da 620 px su una tela da 646 non è più una finestra
// posata sopra la pagina: è la pagina, con un bordo inutile intorno e il piede
// spinto fuori vista. `byupPanelPieno()` restituisce l'override da spargere
// DOPO lo stile del pannello — larghezza e altezza piene, angoli a zero — e un
// oggetto vuoto quando c'è spazio, così a scala normale non cambia nulla.
// Si legge da `BYUP_FIT` invece che da un hook perché i pannelli del gestionale
// sono spesso oggetti di stile fuori da un componente.
function byupPanelPieno(extra) {
  const bp = (window.BYUP_FIT && window.BYUP_FIT.bp) || 'lg';
  if (bp !== 'sm' && bp !== 'xs') return null;
  return Object.assign({
    // I pannelli del gestionale sono quasi tutti centrati con top/left 50% e
    // una translate: a tutto schermo vanno riportati all'origine, altrimenti
    // restano spostati di mezza schermata.
    top: 0, left: 0, right: 0, bottom: 0, transform: 'none',
    width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%',
    borderRadius: 0,
    display: 'flex', flexDirection: 'column',
  }, extra || null);
}

// Lo sfondo scuro che sta dietro: a tutto schermo non serve il respiro attorno.
function byupScrimPieno() {
  const bp = (window.BYUP_FIT && window.BYUP_FIT.bp) || 'lg';
  return (bp === 'sm' || bp === 'xs') ? { padding: 0 } : null;
}

// ─── La prima colonna che resta ferma ───────────────────────────────────────
// Le tabelle di dati sono l'eccezione ammessa da 1.4.10: scorrono in orizzontale
// dentro il loro contenitore invece di rifluire, perché l'incolonnamento È il
// significato. La condizione è che restino LEGGIBILI mentre scorrono: se la
// prima colonna — quella che dice di che riga si tratta — se ne va via con le
// altre, a metà scorrimento si guardano numeri senza sapere di chi sono.
// Va messa sulla prima cella dell'intestazione e sulla prima di ogni riga, col
// fondo della riga: `transparent` lascerebbe passare sotto il testo che scorre.
function byupColonnaFerma(sfondo) {
  const bp = (window.BYUP_FIT && window.BYUP_FIT.bp) || 'lg';
  if (bp !== 'sm' && bp !== 'xs') return null;
  return {
    position: 'sticky', left: 0, zIndex: 2,
    background: sfondo || '#fff',
    boxShadow: '1px 0 0 rgba(15, 17, 21, 0.08)',
  };
}

// Scorciatoie per gli stili inline, che qui sono la stragrande maggioranza:
//   BP('riga', 'colonna')          → il secondo valore da `sm` in giù
//   BPX({ lg: 32, md: 20, sm: 12 }) → il valore del breakpoint corrente
function byupBpAtMost(bp, soglia) {
  const ord = { xs: 0, sm: 1, md: 2, lg: 3 };
  return ord[bp] <= ord[soglia];
}

// ─── Le scorciatoie da tastiera ─────────────────────────────────────────────
// Ctrl/Cmd + Alt + «+» e «−» salgono e scendono di un livello. Si installano
// una volta sola per pagina e vivono qui perché devono funzionare OVUNQUE, non
// solo dove c'è la schermata delle impostazioni. La combinazione porta tre
// modificatori apposta: «+» e «−» da soli, o col solo Ctrl, appartengono già
// allo zoom del browser e a chi scrive dentro un campo.
(function () {
  if (window.__byupScorciatoieScala) return;
  window.__byupScorciatoieScala = true;
  const ORDINE = ['normale', 'grande', 'massima'];
  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || !e.altKey) return;
    const k = e.key;
    const su  = k === '+' || k === '=' || k === 'Add' || k === '˘';
    const giu = k === '-' || k === '_' || k === 'Subtract' || k === '–';
    if (!su && !giu) return;
    e.preventDefault();
    const ora = window.byupGetScaleId ? window.byupGetScaleId() : 'normale';
    let i = ORDINE.indexOf(ora); if (i < 0) i = 0;
    const next = ORDINE[Math.max(0, Math.min(ORDINE.length - 1, i + (su ? 1 : -1)))];
    if (next !== ora && window.byupSetScale) window.byupSetScale(next);
  });
})();

// ─── La proposta del primo avvio (§11.7) ────────────────────────────────────
// Si PROPONE, non si impone: chi non ha mai scelto e sta su uno schermo che
// suggerisce un ingrandimento se lo vede offrire una volta, e se dice di no
// non glielo si chiede più. In DOM puro e non in React perché le pagine del
// gestionale sono tredici radici separate e questo avviso non appartiene a
// nessuna di loro.
(function () {
  const VISTO = 'byup_proposta_scala';
  function mostra() {
    try { if (localStorage.getItem(VISTO)) return; } catch (e) {}
    if (!window.byupSuggerisceGrande || !window.byupSuggerisceGrande()) return;
    const casa = document.querySelector('.frame') || document.body;
    if (!casa || document.getElementById('byup-proposta')) return;
    const chiudi = () => {
      try { localStorage.setItem(VISTO, '1'); } catch (e) {}
      const n = document.getElementById('byup-proposta');
      if (n) n.remove();
    };
    const box = document.createElement('div');
    box.id = 'byup-proposta';
    box.setAttribute('role', 'status');
    box.style.cssText =
      'position:absolute;left:16px;bottom:16px;z-index:320;max-width:340px;' +
      'background:#fff;border:1px solid rgba(15,17,21,0.10);border-radius:14px;' +
      'box-shadow:0 18px 44px -14px rgba(15,17,21,0.32);padding:14px 16px;' +
      "font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#0F1115;";
    box.innerHTML =
      '<div style="font-size:15.5px;font-weight:800;letter-spacing:-0.1px;">Si legge comodo?</div>' +
      '<div style="font-size:14px;color:#6B7280;line-height:1.45;margin:5px 0 12px;">' +
      'Posso ingrandire tutto il gestionale — testi, pulsanti, numeri. Si cambia quando vuoi da Impostazioni.</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button type="button" data-si style="flex:1;min-width:120px;min-height:44px;border:none;border-radius:11px;' +
      'background:linear-gradient(180deg,#2A2D36 0%,#15171C 100%);color:#fff;font:700 15px/1 inherit;cursor:pointer;">Ingrandisci</button>' +
      '<button type="button" data-no style="flex:1;min-width:100px;min-height:44px;border:1px solid rgba(15,17,21,0.12);' +
      'border-radius:11px;background:#fff;color:#0F1115;font:600 15px/1 inherit;cursor:pointer;">No, grazie</button>' +
      '</div>';
    box.querySelector('[data-si]').addEventListener('click', () => {
      if (window.byupSetScale) window.byupSetScale('grande');
      chiudi();
    });
    box.querySelector('[data-no]').addEventListener('click', chiudi);
    casa.appendChild(box);
  }
  // Il frame lo monta React: si aspetta che ci sia.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mostra, 1200));
  else setTimeout(mostra, 1200);
})();

Object.assign(window, {
  BYUP_SCALE_INFO, BYUP_A11Y, ByupA11yProvider, useA11y, byupA11yState, byupBpAtMost,
  byupFocusabili, useTrappolaFocus, byupPanelPieno, byupScrimPieno, byupColonnaFerma,
});
