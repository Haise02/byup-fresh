// byup-fit — la geometria del frame e la scala dell'interfaccia.
//
// Script SEMPLICE (niente Babel, niente React): sta nell'<head> di ogni pagina
// del gestionale, subito dopo pn-device.js, e deve girare PRIMA di tutto il
// resto — lo skeleton di boot delle pagine legge già da qui la misura giusta,
// così la barra laterale nasce della larghezza che avrà e non salta al mount.
//
// Sostituisce il blocco `fit()` che stava duplicato in fondo a undici HTML.
//
// ─── Come funziona l'ingrandimento ──────────────────────────────────────────
// Tutta la UI del gestionale vive dentro un `.frame` scalato da una sola
// proprietà `zoom`. L'ingrandimento NON si ottiene riscrivendo i px: si
// ottiene alzando quel `zoom` e RIDUCENDO la tela logica di conseguenza.
//
//   zoom        = zoom_di_base × fattore_di_scala
//   tela logica = (viewport − margine) / zoom
//
// A 2,5× ogni `fontSize: 15` diventa 37,5 px fisici, ogni bottone da 36 px
// diventa 90, ombre e filetti crescono con loro. Zero px da riscrivere: il
// costo si sposta tutto sul fatto che la tela logica si stringe, e i layout
// devono rifluire. Quella parte la governano `data-bp` e `statStretto()`.
//
// ─── Due modi di stare nella finestra ───────────────────────────────────────
// · tela fissa  — il desktop di sempre: design 1440×900, zoom guidato
//                 dall'altezza, larghezza logica fluida.
// · fluido      — telefono, tablet (pn-device marca `data-pn-native`) e i
//                 monitor a parete (`data-byup-fluid`): il frame riempie la
//                 finestra e il solo zoom è quello scelto dall'utente. Su un
//                 KDS a muro ingrandire vuol dire card più grandi e MENO card
//                 in vista, che è esattamente l'adattamento che serve lì.
//
// ─── Dove vive la preferenza ────────────────────────────────────────────────
// In `localStorage`, quindi **per dispositivo e non per account**: è una scelta
// deliberata. Lo stesso account gira sul tablet del KDS in cucina, sul
// portatile di chi tiene i conti e sulla cassa in sala, e non c'è ragione per
// cui la scala scelta davanti a un monitor a due metri debba seguire la stessa
// persona su un portatile da 13". La preferenza è dello schermo, non di chi
// guarda. Se un giorno servirà anche un default d'account, sarà un valore
// iniziale che questo sovrascrive, mai il contrario.
(function () {
  var DESIGN_H  = 900;   // l'altezza di design del gestionale
  var MARGIN    = 24;    // il respiro fisico attorno al frame, in px di schermo
  var MIN_W_LOG = 320;   // il limite di reflow di WCAG 1.4.10 (era 1280)
  var MIN_H_LOG = 320;
  var KEY = 'byup_ui_scale';

  // I tre livelli. Vivono qui e non in byup-a11y.jsx perché il fit gira prima
  // di Babel: byup-a11y li ripubblica per chi arriva dopo.
  var SCALES = { normale: 1, grande: 1.75, massima: 2.5 };

  // ─── Breakpoint sulla TELA LOGICA, non sul viewport ───────────────────────
  // Le media query CSS misurano la finestra, non il frame scalato: dentro uno
  // `zoom` sono cieche (verificato: `max-width:900` su finestra 1200 con zoom 3
  // non scatta). Le container query invece leggono il logico e funzionano, ma
  // misurano il contenitore; qui gli stili sono quasi tutti inline, quindi la
  // strada è questa misura pubblicata in JS.
  //   lg ≥ 1100 · md 760–1099 · sm 480–759 · xs < 480
  function bpOf(w) {
    return w >= 1100 ? 'lg' : w >= 760 ? 'md' : w >= 480 ? 'sm' : 'xs';
  }

  function readScaleId() {
    var v;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    return SCALES[v] ? v : 'normale';
  }

  // Stato pubblicato: lo leggono pn-device (per `statStretto`), byup-a11y (per
  // l'hook React) e lo skeleton di boot delle pagine.
  var S = { scaleId: 'normale', scale: 1, zoom: 1, w: 0, h: 0, bp: 'lg', fluid: false };

  function viewport() {
    var d = document.documentElement;
    return {
      w: (d && d.clientWidth)  || window.innerWidth,
      h: (d && d.clientHeight) || window.innerHeight,
    };
  }

  // Le pagine senza `.frame` — il Login, lo schermo di collegamento della
  // cucina — non hanno niente da scalare: la loro tela logica è la finestra, e
  // devono dire `bp` sulla finestra, non su una tela di design che non esiste.
  // Lo dichiarano con `data-byup-noframe` sull'<html>, e NON si deduce dalla
  // presenza del frame nel DOM: il frame lo monta React dopo Babel, quindi fra
  // `DOMContentLoaded` e il mount ci sarebbe una finestra di qualche decimo di
  // secondo in cui ogni pagina sembra senza frame. È esattamente il momento in
  // cui React fa il primo render, e i layout che chiedono `statStretto()` si
  // sentivano rispondere «tela 1920, larga» su una tela che è 646.
  function hasFrame() {
    return !document.documentElement.hasAttribute('data-byup-noframe');
  }

  function isFluid() {
    var d = document.documentElement;
    if (!d) return false;
    // `data-pn-native`: telefono e tablet, deciso da pn-device.js.
    // `data-byup-fluid`: i monitor a parete (byup_KDS.html), che non hanno mai
    // avuto una tela di design e non devono averne una adesso.
    return d.hasAttribute('data-pn-native') || d.hasAttribute('data-byup-fluid');
  }

  // La geometria è una funzione PURA di (viewport, modo, scala): si può
  // calcolare prima che il frame esista, ed è per questo che lo skeleton di
  // boot può già nascere della misura giusta.
  function geometry() {
    var vp = viewport();
    var scaleId = readScaleId();
    var scale = SCALES[scaleId] || 1;
    var fluid = isFluid();
    if (!hasFrame()) {
      return { scaleId: scaleId, scale: scale, zoom: 1, w: vp.w, h: vp.h, bp: bpOf(vp.w), fluid: fluid };
    }
    // Lo spazio fisico che il frame può occupare.
    var availW = fluid ? vp.w : vp.w - MARGIN;
    var availH = fluid ? vp.h : vp.h - MARGIN;
    var z = fluid ? scale
                  : Math.max(0.4, Math.min(2.2 * scale, ((vp.h - MARGIN) / DESIGN_H) * scale));

    // ── Il tetto: la scala non può chiedere più di quanto lo schermo dia ────
    // Sotto i 320 px logici non si riflette più niente, e un frame più grande
    // della finestra verrebbe TAGLIATO dall'overflow — cioè contenuto perso,
    // che è esattamente quello che 1.4.4 vieta. Quindi lo zoom si ferma dove
    // la tela arriverebbe al minimo: su un telefono da 390 px «Molto grande»
    // vale 1,22× e non 2,5×, e l'utente ottiene tutto l'ingrandimento che quel
    // vetro può davvero dare, senza perdere una riga.
    var zMax = Math.min(availW / MIN_W_LOG, availH / MIN_H_LOG);
    if (z > zMax) z = zMax;

    return {
      scaleId: scaleId, scale: scale, zoom: z,
      w: availW / z, h: availH / z,
      bp: bpOf(availW / z), fluid: fluid,
    };
  }

  // Il frame non deve MAI far scorrere la pagina che lo contiene: lo scroll
  // avviene dentro le aree di contenuto. Il margine è dichiarato in px logici,
  // quindi va diviso per lo zoom perché a schermo ne risultino sempre MARGIN/2
  // per lato — altrimenti a 2,9× un margine da 24 diventerebbe 70 e il frame
  // non ci starebbe più.
  var cur = { el: null, zoom: null, w: null, h: null, m: null };

  function apply(g) {
    var frame = document.querySelector('.frame');
    if (!frame) { cur.el = null; return; }
    var m = g.fluid ? '0px' : (MARGIN / 2 / g.zoom) + 'px auto';
    if (frame !== cur.el || g.zoom !== cur.zoom) frame.style.zoom = g.zoom;
    if (frame !== cur.el || g.w !== cur.w) frame.style.width = g.w + 'px';
    if (frame !== cur.el || g.h !== cur.h) frame.style.height = g.h + 'px';
    if (frame !== cur.el || m !== cur.m) frame.style.margin = m;
    frame.setAttribute('data-bp', g.bp);
    cur = { el: frame, zoom: g.zoom, w: g.w, h: g.h, m: m };
    document.documentElement.setAttribute('data-byup-fit', '');
  }

  function publish(g) {
    var changed = g.bp !== S.bp || g.scaleId !== S.scaleId;
    S = g;
    window.BYUP_FIT = S;
    var d = document.documentElement;
    if (d) {
      d.setAttribute('data-bp', g.bp);
      d.setAttribute('data-scale', g.scaleId);
      // L'altezza e la larghezza VERE della finestra in px logici: i pochi
      // punti che hanno bisogno di `vh`/`vw` devono usare queste, perché
      // dentro uno `zoom` le unità di viewport non vengono scalate e a 2,9×
      // un `92vh` vale quasi tre schermate (misurato).
      d.style.setProperty('--pn-vh', Math.round(g.h) + 'px');
      d.style.setProperty('--pn-vw', Math.round(g.w) + 'px');
    }
    return changed;
  }

  function fit() {
    var g = geometry();
    var bpChanged = publish(g);
    apply(g);
    window.dispatchEvent(new CustomEvent('byup:fit', { detail: {
      scaleId: g.scaleId, scale: g.scale, zoom: g.zoom, w: g.w, h: g.h, bp: g.bp,
    } }));
    // I ventitré file che usano STG/STMIN/STSCROLL ascoltano `pn-device-change`
    // da prima che esistesse la scala: quando la tela logica cambia banda —
    // per un resize o per un cambio di scala — devono rirenderizzare anche se
    // la classe di dispositivo è rimasta la stessa. L'evento parte da qui
    // perché pn-device, sul resize, gira PRIMA del fit e leggerebbe una tela
    // vecchia. Non c'è ricorsione: al giro successivo il breakpoint coincide.
    if (bpChanged) window.dispatchEvent(new Event('pn-device-change'));
  }

  // ─── Riduci animazioni ────────────────────────────────────────────────────
  // EN 301 549 §11.7 dice che il software segue le preferenze di piattaforma
  // dell'utente «salvo override esplicito dell'utente»: quindi si parte da
  // `prefers-reduced-motion` del sistema, e da lì in poi comanda la scelta
  // fatta qui dentro, che resta scritta. Tre stati e non due: «auto» non è
  // «acceso», è «come dice il sistema», e distinguerli serve a non inchiodare
  // la preferenza al primo che apre la pagina su un computer configurato bene.
  var KEY_MOTO = 'byup_riduci_moto';

  function sistemaRiduce() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch (e) { return false; }
  }

  function readMoto() {
    var v;
    try { v = localStorage.getItem(KEY_MOTO); } catch (e) {}
    return (v === 'si' || v === 'no') ? v : 'auto';
  }

  function motoRidotto() {
    var v = readMoto();
    return v === 'si' || (v === 'auto' && sistemaRiduce());
  }

  function applicaMoto() {
    var d = document.documentElement;
    if (!d) return;
    if (motoRidotto()) d.setAttribute('data-byup-moto', 'ridotto');
    else d.removeAttribute('data-byup-moto');
  }

  // Il MECCANISMO resta ed è vivo: `applicaMoto` gira all'avvio e a ogni cambio
  // della preferenza di sistema, quindi `prefers-reduced-motion` spegne le 56
  // animazioni infinite del gestionale senza che nessuno debba chiedere nulla.
  // Quello che NON c'è (ancora) è il comando nel prodotto per decidere
  // diversamente: rimandato il 13 settembre 2026. Finché non c'è, `byupSetMoto`
  // non lo chiama nessuno — è la presa a cui quel comando si attaccherà, e
  // sta qui perché toglierla e riscriverla non aggiunge niente.
  window.byupGetMoto = readMoto;                 // 'auto' | 'si' | 'no'
  window.byupMotoRidotto = motoRidotto;          // che cosa ne risulta davvero
  window.byupSistemaRiduce = sistemaRiduce;
  window.byupSetMoto = function (v) {
    if (v !== 'auto' && v !== 'si' && v !== 'no') return false;
    try { localStorage.setItem(KEY_MOTO, v); } catch (e) {}
    applicaMoto();
    window.dispatchEvent(new CustomEvent('byup:moto', { detail: { valore: v, ridotto: motoRidotto() } }));
    return true;
  };

  // ─── Se lo schermo suggerisce che servirebbe più grande ───────────────────
  // Non si impone niente: si PROPONE, una volta sola, e solo a chi non ha mai
  // scelto. I due segnali sono quelli che un browser lascia vedere: un fattore
  // di scala del sistema non intero (l'utente ha già ingrandito tutto a livello
  // di sistema operativo) e una finestra così bassa che il gestionale si
  // rimpicciolirebbe sotto la sua misura di disegno.
  window.byupScalaMaiScelta = function () {
    try { return localStorage.getItem(KEY) == null; } catch (e) { return false; }
  };
  window.byupSuggerisceGrande = function () {
    if (!window.byupScalaMaiScelta()) return false;
    var dpr = window.devicePixelRatio || 1;
    var sistemaIngrandito = Math.abs(dpr - Math.round(dpr)) > 0.05;
    var vp = viewport();
    var zoomBase = (vp.h - MARGIN) / DESIGN_H;
    return sistemaIngrandito || zoomBase < 0.92;
  };

  // ─── API ──────────────────────────────────────────────────────────────────
  window.BYUP_SCALES = SCALES;
  window.byupGetScaleId = readScaleId;
  window.byupGetScale = function () { return SCALES[readScaleId()] || 1; };
  window.byupFit = fit;
  // La tela logica, per chi deve decidere un layout. Prima che il fit giri
  // (script in testa, ordine dei file) si ripiega sul viewport, che è la
  // risposta giusta a scala 1.
  window.byupLogicalW = function () { return S.w || viewport().w; };
  window.byupLogicalH = function () { return S.h || viewport().h; };
  window.byupBp = function () { return S.bp; };

  // Applicazione immediata, senza ricaricare e senza perdere lo stato: cambia
  // solo la geometria del frame, React non viene rimontato.
  window.byupSetScale = function (id) {
    if (!SCALES[id]) return false;
    try { localStorage.setItem(KEY, id); } catch (e) {}
    // `fit()` si accorge da solo che la scala è cambiata ed emette anche
    // `pn-device-change`, così i layout adattivi rirenderizzano.
    fit();
    return true;
  };

  // ─── Avvio ────────────────────────────────────────────────────────────────
  // Il frame è ancorato alla finestra: lo scroll avviene DENTRO le aree di
  // contenuto, mai sulla pagina che lo contiene (WCAG 1.4.10 — niente scorrimento
  // in due dimensioni). La regola sta qui, insieme a chi mette l'attributo, così
  // vale anche sulle pagine che non caricano pn-device.js.
  (function () {
    var st = document.createElement('style');
    st.id = 'byup-fit-style';
    st.textContent = [
      'html[data-byup-fit], html[data-byup-fit] body { overflow: hidden; }',
      // Riduci animazioni: si spegne il MOVIMENTO, non il feedback. I colori
      // e gli stati restano, le transizioni diventano istantanee, e la
      // compressione al click dei bottoni non c'è più — era l'unica cosa che
      // si muoveva sotto il dito a ogni singolo tocco.
      'html[data-byup-moto="ridotto"] *,',
      'html[data-byup-moto="ridotto"] *::before,',
      'html[data-byup-moto="ridotto"] *::after {',
      '  animation-duration: 0.001ms !important;',
      '  animation-iteration-count: 1 !important;',
      '  transition-duration: 0.001ms !important;',
      '  scroll-behavior: auto !important;',
      '}',
      'html[data-byup-moto="ridotto"] button:active:not(:disabled) { transform: none !important; }',
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  })();

  applicaMoto();
  // Se l'utente non ha mai scelto, la preferenza di sistema può cambiare a
  // pagina aperta (il tema «riduci movimento» di macOS si accende da una
  // scorciatoia): si segue.
  try {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) mq.addEventListener('change', applicaMoto);
    else if (mq.addListener) mq.addListener(applicaMoto);
  } catch (e) {}

  fit();
  window.addEventListener('resize', fit);
  // pn-device cambia `data-pn-native` passando fra telefono, tablet e desktop:
  // il modo cambia, la geometria va rifatta.
  window.addEventListener('pn-device-change', fit);
  // Il frame lo monta React dopo la compilazione Babel (asincrona, da CDN): al
  // primo load può non esistere ancora, e i retry a tempo fisso perdevano la
  // gara su rete lenta. L'observer applica il fit appena il frame compare, e
  // a ogni remount.
  function watch() {
    var root = document.getElementById('root') || document.body;
    if (!root) return;
    new MutationObserver(fit).observe(root, { childList: true, subtree: true });
    fit();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
})();
