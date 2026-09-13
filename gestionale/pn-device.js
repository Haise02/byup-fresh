// pn-device — classificazione del dispositivo e gate del telefono.
// Script SEMPLICE (niente Babel, niente React): sta nell'<head> di ogni pagina
// del gestionale e decide PRIMA del primo paint che cosa può fare questo
// schermo. Tre classi:
//   phone   — lato corto sotto i 600px, in qualunque orientamento: un telefono
//             ruotato resta un telefono, un iPad mini (768) no.
//   tablet  — non-phone con finestra sotto i 1280px. Un iPad Pro 12,9" in
//             orizzontale (1366) è desktop: lo zoom a 0,95 è già a misura.
//   desktop — il resto: design fisso 1440×900 con lo zoom proporzionale.
//
// Dal telefono il gestionale offre SOLO Panoramica e Statistiche (più il
// login per arrivarci): ogni altra pagina mostra il gate qui sotto, lo
// speculare del «Pensata per lo smartphone» della webapp consumer.
//
// `data-pn-native` sull'<html> dice che QUESTA pagina, su QUESTO schermo, usa
// il layout fluido: il frame riempie la finestra invece di tenere la tela di
// design 1440×900. Le pagine non ancora adattate al tablet NON sono in
// TABLET_NATIVE e tengono la tela di sempre: si migra una pagina per volta,
// senza degradare le altre.
// Misura su window (non su screen): si prova ridimensionando la finestra e si
// verifica in headless con --window-size.
//
// ── Chi fa che cosa, dal 13 settembre 2026 ─────────────────────────────────
// Questo file classifica lo SCHERMO (fisico) e decide il gate del telefono.
// La GEOMETRIA del frame — larghezza, altezza, zoom, margine — è di
// byup-fit.js, che la tiene coerente con la scala d'interfaccia scelta
// dall'utente (Normale · Grande · Molto grande). I due si parlano con
// `data-pn-native` in andata e con `window.byupLogicalW()` al ritorno: il
// predicato «stretto» qui sotto misura la TELA LOGICA, non la finestra,
// altrimenti a scala alta non scatterebbe mai.
(function () {
  var PHONE_SHORT_MAX = 600;
  var TABLET_W_MAX = 1280;

  // Il nome file della pagina corrente, spazi decodificati.
  var page = decodeURIComponent((location.pathname.split('/').pop() || 'index.html'));

  var PHONE_OK = [
    'byup Panoramica.html',
    'byup Statistiche.html',
    'byup Login.html',
    'index.html',
  ];
  // Cresce una pagina per volta, man mano che i layout nativi da tablet
  // vengono costruiti (fase 1: le pagine operative).
  var TABLET_NATIVE = [
    'byup Panoramica.html',
    'byup Statistiche.html',
    'byup Login.html',
    'byup Sala.html',
    'byup Cucina.html',
    'byup Cucina KDS v2.html',
    'byup Contabilita.html',
    'byup Impostazioni.html',
    'byup Profilo.html',
    'byup Configurazione Completa.html',
    'byup Supporto.html',
    'byup Restaurant Onboarding.html',
  ];

  function classify() {
    var w = window.innerWidth, h = window.innerHeight;
    if (Math.min(w, h) < PHONE_SHORT_MAX) return 'phone';
    if (w < TABLET_W_MAX) return 'tablet';
    return 'desktop';
  }

  // ── CSS: frame fluido dove il layout è nativo, frame nascosto sotto il gate.
  // La GEOMETRIA (width, height, zoom, margin) è di byup-fit.js, che la scrive
  // inline e la tiene coerente con la scala scelta dall'utente: qui restano
  // senza `!important` come rete di sicurezza, così se il fit non gira il frame
  // è comunque fluido, e quando gira vince lui. Il vecchio `!important` serviva
  // a coprire lo stile inline stantio del blocco zoom di pagina; quel blocco
  // non esiste più e il fit riscrive sempre entrambi i modi.
  var css = [
    'html[data-pn-native] body { display: block !important; min-height: 100svh; }',
    'html[data-pn-native] .frame {',
    '  width: 100%; height: 100svh; margin: 0;',
    '  border-radius: 0 !important; box-shadow: none !important;',
    '}',
    'html[data-pn-gate] .frame, html[data-pn-gate] #root { display: none !important; }',
    '#pn-gate a { -webkit-tap-highlight-color: transparent; }',
    // Il navigatore demo degli step (onboarding): in alto a destra si
    // sovrappone alle etichette dell'header quando lo schermo si stringe —
    // nel layout nativo scende in basso a sinistra, dove non copre nulla.
    'html[data-pn-native] .stage-controls { top: auto !important; bottom: 14px !important; right: auto !important; left: 14px !important; }',
  ].join('\n');
  var style = document.createElement('style');
  style.id = 'pn-device-style';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // ── Il gate del telefono. Tinte dai token PN (panoramica-tokens.jsx), qui a
  // mano perché questo file parte prima di React e di Babel.
  function buildGate() {
    var el = document.createElement('div');
    el.id = 'pn-gate';
    el.setAttribute('role', 'main');
    el.style.cssText =
      'position:fixed;inset:0;z-index:9999;overflow:auto;' +
      'background:radial-gradient(120% 90% at 50% -10%, #FFF1EF 0%, #F5F6F8 55%, #F5F6F8 100%);' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;color:#0F1115;' +
      'padding:32px 24px;text-align:center;-webkit-font-smoothing:antialiased;';
    el.innerHTML =
      '<div style="max-width:420px;display:flex;flex-direction:column;align-items:center;">' +
        '<div style="width:74px;height:74px;border-radius:22px;background:#fff;' +
          'border:1px solid rgba(15,17,21,0.06);display:flex;align-items:center;justify-content:center;' +
          'box-shadow:0 1px 2px rgba(15,17,21,0.04), 0 12px 32px -12px rgba(255,90,95,0.35);margin-bottom:22px;">' +
          '<img src="Fresh-mark.png" alt="" style="width:40px;height:40px;object-fit:contain;display:block;"/>' +
        '</div>' +
        '<h1 style="font-size:25px;font-weight:800;letter-spacing:-0.5px;margin:0 0 10px;line-height:1.2;">' +
          'Qui serve più spazio</h1>' +
        '<p style="font-size:15.5px;font-weight:500;color:#6B7280;line-height:1.55;margin:0 0 26px;">' +
          'Questa sezione del gestionale è pensata per tablet e computer. ' +
          'Dal telefono hai la Panoramica e le Statistiche del tuo locale.</p>' +
        '<div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:300px;">' +
          '<a href="byup Panoramica.html" style="display:flex;align-items:center;justify-content:center;gap:8px;' +
            'padding:14px 18px;border-radius:999px;text-decoration:none;' +
            'background:linear-gradient(180deg,#2A2D36 0%,#15171C 100%);color:#fff;' +
            'font-size:15.5px;font-weight:700;box-shadow:inset 0 1px 0 rgba(255,255,255,0.10);">' +
            'Vai alla Panoramica</a>' +
          '<a href="byup Statistiche.html" style="display:flex;align-items:center;justify-content:center;gap:8px;' +
            'padding:14px 18px;border-radius:999px;text-decoration:none;' +
            'background:linear-gradient(180deg,#FFFFFF 0%,#F5F5F7 100%);color:#0F1115;' +
            'border:1px solid rgba(15,17,21,0.10);font-size:15.5px;font-weight:700;' +
            'box-shadow:inset 0 1px 0 rgba(255,255,255,0.65);">' +
            'Apri le Statistiche</a>' +
        '</div>' +
        '<p style="font-size:13px;font-weight:600;color:#9CA3AF;margin:24px 0 0;">' +
          'Da tablet e computer trovi tutto il gestionale.</p>' +
      '</div>';
    return el;
  }

  function syncGate(device) {
    var blocked = device === 'phone' && PHONE_OK.indexOf(page) === -1;
    var gate = document.getElementById('pn-gate');
    if (blocked) {
      document.documentElement.setAttribute('data-pn-gate', '');
      if (!gate && document.body) document.body.appendChild(buildGate());
    } else {
      document.documentElement.removeAttribute('data-pn-gate');
      if (gate) gate.remove();
    }
  }

  var lastBand = null;
  function apply() {
    var d = classify();
    var el = document.documentElement;
    var native =
      (d === 'phone' && PHONE_OK.indexOf(page) !== -1) ||
      (d === 'tablet' && TABLET_NATIVE.indexOf(page) !== -1);
    var changed = el.getAttribute('data-pn-device') !== d;
    // La banda «stretto/largo» (900px di TELA LOGICA) cambia anche RESTANDO
    // nella stessa classe — la rotazione di un iPad, o un cambio di scala su
    // desktop — e i layout che la leggono devono rirenderizzare. Quando a
    // cambiare è la sola scala se ne accorge byup-fit, che emette lui l'evento.
    var band = (window.byupLogicalW ? window.byupLogicalW() : window.innerWidth) < 900 ? 'narrow' : 'wide';
    var bandChanged = lastBand !== null && band !== lastBand;
    lastBand = band;
    el.setAttribute('data-pn-device', d);
    if (native) el.setAttribute('data-pn-native', '');
    else el.removeAttribute('data-pn-native');
    syncGate(d);
    if (changed || bandChanged) window.dispatchEvent(new Event('pn-device-change'));
  }

  // ── Predicato «stretto» e helper dei layout adattivi ──────────────────────
  // Telefono, oppure tela logica sotto i 900px: anche con le sidebar a
  // barretta le griglie a tre colonne lì non respirano. Vivono QUI e non nei
  // token perché questo è l'unico file caricato da ogni pagina del gestionale
  // — l'onboarding, per dirne una, i token non li carica affatto.
  // STG impila i layout di pagina; STMIN + STSCROLL fanno scorrere le TABELLE
  // nel loro contenitore, colonne intatte. Mai overflow-x sul corpo intero di
  // una card: l'overflow-y diventa clip (regola CSS) e taglia le legende.
  //
  // ── La misura è la TELA LOGICA, non la finestra (13 settembre 2026) ───────
  // Prima qui c'era `window.innerWidth`, cioè la finestra fisica. Funzionava
  // finché lo zoom del frame restava intorno a 1: da quando l'utente può
  // portarlo a 1,75× e 2,5× le due misure divergono di un fattore tre — su un
  // monitor da 1920 a scala massima la finestra è sempre 1920 mentre la tela
  // dentro cui i componenti vivono è 646. Con la vecchia misura una tabella a
  // sette colonne che sull'iPad in verticale scorre correttamente, ingrandita
  // al 250% su un desktop si schiacciava: il predicato non scattava mai.
  // Adesso `statStretto` legge la tela logica (byup-fit.js), quindi TUTTI i
  // layout stretti già costruiti per il tablet si accendono anche a scala
  // alta, senza toccare i ventitré file che usano questi helper.
  //
  // La CLASSIFICAZIONE invece resta fisica, ed è giusto così: un telefono è un
  // telefono a qualunque zoom, e il gate «Qui serve più spazio» non deve
  // comparire a chi ingrandisce il gestionale su un portatile.
  window.statPhone = function () { return classify() === 'phone'; };
  window.statStretto = function () {
    if (classify() === 'phone') return true;
    var w = window.byupLogicalW ? window.byupLogicalW() : window.innerWidth;
    return w < 900;
  };
  window.STG = function (desk, mobile) {
    return window.statStretto() ? (mobile === undefined ? '1fr' : mobile) : desk;
  };
  window.STMIN = function (px) { return window.statStretto() ? { minWidth: px } : null; };
  window.STSCROLL = function () {
    return window.statStretto() ? { overflowX: 'auto', WebkitOverflowScrolling: 'touch' } : null;
  };

  window.PnDevice = {
    get: classify,
    isPhone: function () { return classify() === 'phone'; },
    isTablet: function () { return classify() === 'tablet'; },
    // Hook React: si usa DENTRO i componenti (React esiste a quel punto,
    // questo file parte molto prima). Rirenderizza al cambio di classe.
    use: function () {
      var pair = React.useState(classify());
      React.useEffect(function () {
        var f = function () { pair[1](classify()); };
        window.addEventListener('pn-device-change', f);
        return function () { window.removeEventListener('pn-device-change', f); };
      }, []);
      return pair[0];
    },
    PHONE_OK: PHONE_OK,
    TABLET_NATIVE: TABLET_NATIVE,
  };

  apply();
  window.addEventListener('resize', apply);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  }
})();
