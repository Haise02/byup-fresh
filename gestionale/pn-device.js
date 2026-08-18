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
// il layout fluido: il CSS iniettato scioglie il frame 1440×900 e il blocco
// zoom della pagina si mette da parte. Le pagine non ancora adattate al
// tablet NON sono in TABLET_NATIVE e tengono lo zoom di sempre: si migra una
// pagina per volta, senza degradare le altre.
// Misura su window (non su screen): si prova ridimensionando la finestra e si
// verifica in headless con --window-size.
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
  ];

  function classify() {
    var w = window.innerWidth, h = window.innerHeight;
    if (Math.min(w, h) < PHONE_SHORT_MAX) return 'phone';
    if (w < TABLET_W_MAX) return 'tablet';
    return 'desktop';
  }

  // ── CSS: frame fluido dove il layout è nativo, frame nascosto sotto il gate.
  // !important per vincere sul width/zoom inline che il blocco zoom può aver
  // già scritto prima di un resize.
  var css = [
    'html[data-pn-native] body { display: block !important; min-height: 100svh; }',
    'html[data-pn-native] .frame {',
    '  width: 100% !important; height: 100svh !important;',
    '  margin: 0 !important; border-radius: 0 !important; box-shadow: none !important;',
    '  zoom: 1 !important;',
    '}',
    'html[data-pn-gate] .frame, html[data-pn-gate] #root { display: none !important; }',
    '#pn-gate a { -webkit-tap-highlight-color: transparent; }',
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
    // La banda «stretto/largo» (900px) cambia anche RESTANDO tablet — la
    // rotazione di un iPad — e i layout che la leggono devono rirenderizzare.
    var band = window.innerWidth < 900 ? 'narrow' : 'wide';
    var bandChanged = lastBand !== null && band !== lastBand;
    lastBand = band;
    el.setAttribute('data-pn-device', d);
    if (native) el.setAttribute('data-pn-native', '');
    else el.removeAttribute('data-pn-native');
    syncGate(d);
    if (changed || bandChanged) window.dispatchEvent(new Event('pn-device-change'));
  }

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
