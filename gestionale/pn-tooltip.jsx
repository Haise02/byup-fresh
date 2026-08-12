// Tooltip del gestionale — uno strato solo, per tutte le schermate.
//
// I nomi dei pulsanti e delle icone li diceva il browser, con il suo tooltip di
// sistema: compare dopo un'attesa di mezzo secondo abbondante, in una grafica
// che non è la nostra e che cambia da Mac a Windows. Su un'icona senza
// etichetta — e il gestionale ne ha parecchie — mezzo secondo è il tempo in cui
// si decide di rinunciare e di provare a cliccare per scoprire cosa fa.
//
// Qui compare SUBITO. Il vetro scuro è quello che il gestionale usa già per la
// stessa cosa: il dettaglio della barra nella card del piano e la nota di
// trasparenza dello sparkle AI. Non è un tooltip nuovo, è quello che c'era già,
// portato dove finora parlava il browser.
//
// NON si tocca nessuna chiamata: sono 318 `title` sparsi in 49 file, e una
// sostituzione a tappeto sarebbe stata 318 occasioni di sbagliare per una cosa
// che si risolve in un posto solo. Al primo passaggio del mouse il `title`
// viene tolto all'elemento — è l'unico modo di zittire quello di sistema — e
// messo da parte in `data-pn-tip`, che da lì in poi è la fonte.
//
// Il nome accessibile non si perde per strada: su un elemento senza
// `aria-label` il testo del `title` ci finisce prima che il `title` sparisca.
// Senza, un'icona muta resterebbe muta anche per chi la ascolta.
(function () {
  if (typeof document === 'undefined' || window.__pnTip) return;
  window.__pnTip = true;

  var MOTO_RIDOTTO = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Il vetro scuro della card del piano, un po' più fitto: qui sotto può
  // passarci qualunque cosa, e il nome di un pulsante deve leggersi al primo
  // colpo d'occhio, non al secondo.
  var VETRO = 'rgba(15,17,21,0.88)';

  var DIST = 9;        // stacco dal bersaglio
  var MARGINE = 8;     // aria minima dai bordi della finestra
  var LARGO = 360;     // oltre questa larghezza il bersaglio è una fascia, non
                       // un bottone: il tooltip segue il puntatore, altrimenti
                       // spunterebbe a mezzo schermo di distanza dalla mano.

  var scatola = null, freccia = null, ancora = null, ultimaX = 0, timerVia = 0;

  function costruisci() {
    if (scatola) return;
    scatola = document.createElement('div');
    scatola.setAttribute('role', 'tooltip');
    scatola.style.cssText = [
      'position:fixed', 'left:0', 'top:0', 'z-index:2147483000',
      'pointer-events:none', 'opacity:0', 'visibility:hidden',
      'max-width:280px', 'padding:8px 11px', 'border-radius:10px',
      'box-sizing:border-box',
      'background:' + VETRO,
      '-webkit-backdrop-filter:blur(18px) saturate(180%)',
      'backdrop-filter:blur(18px) saturate(180%)',
      'box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),' +
        'inset 0 0 0 1px rgba(255,255,255,0.08),' +
        '0 12px 32px -8px rgba(0,0,0,0.50)',
      'color:#fff', 'font-family:inherit', 'font-size:13px', 'font-weight:600',
      'line-height:1.35', 'letter-spacing:0', 'text-align:left',
      'white-space:normal', 'text-transform:none',
      'transform-origin:0 0',
    ].join(';');

    var testo = document.createElement('span');
    testo.setAttribute('data-pn-tip-testo', '');
    scatola.appendChild(testo);

    // Triangolo di bordo, non quadrato ruotato: il quadrato è figlio della
    // pastiglia, quindi le si disegna SOPRA, e sul vetro scuro si vedeva il
    // rombo intero invece della punta. Il triangolo sta tutto fuori dal box e
    // non si sovrappone a niente.
    freccia = document.createElement('span');
    freccia.style.cssText = [
      'position:absolute', 'width:0', 'height:0',
      'border-left:6px solid transparent', 'border-right:6px solid transparent',
    ].join(';');
    scatola.appendChild(freccia);

    document.body.appendChild(scatola);
  }

  // Le pagine del gestionale stanno dentro un `.frame` che si scala con la
  // finestra (zoom proporzionale, in fondo a ogni HTML). Il tooltip vive fuori
  // da lì — deve poter sbordare dalla cornice — quindi lo zoom se lo applica da
  // sé, altrimenti su un monitor grande sarebbe l'unica cosa piccola a schermo.
  function zoomDi(nodo) {
    var z = 1;
    for (var n = nodo; n && n.nodeType === 1; n = n.parentElement) {
      var v = parseFloat(getComputedStyle(n).zoom);
      if (v && v !== 1) z *= v;
    }
    return z;
  }

  function testoDi(el) {
    var t = el.getAttribute('title');
    if (t != null) {
      t = t.trim();
      el.removeAttribute('title');
      if (t) {
        el.setAttribute('data-pn-tip', t);
        if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
          el.setAttribute('aria-label', t);
        }
      }
    }
    return (el.getAttribute('data-pn-tip') || '').trim();
  }

  function piazza() {
    if (!ancora || !ancora.isConnected) return nascondi();
    var r = ancora.getBoundingClientRect();
    if (!r.width && !r.height) return nascondi();

    var z = zoomDi(ancora);
    scatola.style.transform = 'scale(' + z + ')';
    var w = scatola.offsetWidth, h = scatola.offsetHeight;
    var lw = w * z, lh = h * z, stacco = DIST * z;

    // Il punto che il tooltip indica: il centro del bersaglio, o il puntatore
    // quando il bersaglio è una fascia larga.
    var mira = r.width > LARGO ? ultimaX : r.left + r.width / 2;
    mira = Math.max(r.left + 12, Math.min(r.right - 12, mira));

    var sotto = r.bottom + stacco + lh <= window.innerHeight - MARGINE
      || r.top - stacco - lh < MARGINE;
    var top = sotto ? r.bottom + stacco : r.top - stacco - lh;
    var left = Math.max(MARGINE, Math.min(window.innerWidth - lw - MARGINE, mira - lw / 2));

    scatola.style.left = left + 'px';
    scatola.style.top = top + 'px';

    // La freccetta resta puntata sul bersaglio anche quando il tooltip è stato
    // spinto contro un bordo: senza, indicherebbe il vuoto accanto.
    var fx = (mira - left) / z;
    freccia.style.left = Math.max(12, Math.min(w - 12, fx)) - 6 + 'px';
    freccia.style.top = sotto ? '-6px' : '';
    freccia.style.bottom = sotto ? '' : '-6px';
    freccia.style.borderTop = sotto ? '0' : '6px solid ' + VETRO;
    freccia.style.borderBottom = sotto ? '6px solid ' + VETRO : '0';
  }

  // COMPARE SENZA DISSOLVENZA. Il punto di tutto questo è che il nome si legga
  // nell'istante in cui il puntatore arriva: anche settanta millisecondi di
  // sfumatura sono settanta millisecondi in cui il testo non è ancora leggibile,
  // ed è esattamente la cosa che si stava togliendo di mezzo. La sfumatura
  // resta in USCITA, dove non fa aspettare nessuno e evita che lo schermo
  // sbatta a ogni movimento del mouse.
  function mostra(el) {
    var t = testoDi(el);
    // Un tooltip che ripete la scritta che sta già sul pulsante è rumore: lo si
    // legge due volte e non aggiunge niente.
    if (!t || (el.textContent || '').trim() === t) return nascondi();
    costruisci();
    clearTimeout(timerVia);
    ancora = el;
    scatola.firstChild.textContent = t;
    scatola.style.transition = 'none';
    scatola.style.visibility = 'visible';
    scatola.style.opacity = '1';
    piazza();
  }

  function nascondi() {
    ancora = null;
    if (!scatola || scatola.style.visibility === 'hidden') return;
    if (MOTO_RIDOTTO) {
      scatola.style.opacity = '0';
      scatola.style.visibility = 'hidden';
      return;
    }
    scatola.style.transition = 'opacity 90ms ease-out';
    scatola.style.opacity = '0';
    // `visibility` scende solo a sfumatura finita: metterla giù subito
    // taglierebbe la sfumatura al primo fotogramma, che è come non averla.
    clearTimeout(timerVia);
    timerVia = setTimeout(function () { scatola.style.visibility = 'hidden'; }, 110);
  }

  function bersaglio(e) {
    var t = e.target;
    if (!t || t.nodeType !== 1 || !t.closest) return null;
    return t.closest('[title], [data-pn-tip]');
  }

  document.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch') return;   // col dito non esiste il passaggio sopra
    ultimaX = e.clientX;
    var el = bersaglio(e);
    if (!el) return nascondi();
    if (el !== ancora) mostra(el);
  }, true);

  document.addEventListener('pointermove', function (e) {
    ultimaX = e.clientX;
    if (ancora && ancora.getBoundingClientRect().width > LARGO) piazza();
  }, true);

  document.addEventListener('pointerout', function (e) {
    if (!ancora) return;
    var v = e.relatedTarget;
    if (!v || !ancora.contains(v)) nascondi();
  }, true);

  // Tastiera: chi arriva col tab ha lo stesso diritto di sapere cosa sta per
  // premere. Stessa grafica, stesso istante.
  document.addEventListener('focusin', function (e) {
    var el = bersaglio(e);
    if (el) mostra(el); else nascondi();
  }, true);
  document.addEventListener('focusout', nascondi, true);

  // Un click può cambiare il nome del bersaglio sotto il puntatore («Evidenzia
  // · tav. 3» → «Togli evidenza · tav. 3»), o portarselo via del tutto. Si
  // rilegge appena finito il giro corrente, quando React ha già riscritto
  // l'attributo: il puntatore è fermo lì sopra e nessun `pointerover` verrà più
  // a rinfrescarlo. Un `setTimeout` e non un `requestAnimationFrame`: i
  // fotogrammi non arrivano in una scheda in secondo piano, questo sì.
  document.addEventListener('click', function () {
    if (!ancora) return;
    var el = ancora;
    setTimeout(function () {
      if (ancora !== el) return;
      if (!el.isConnected) return nascondi();
      // Il `title` che React rimette dopo un cambio di stato torna a essere la
      // fonte: si ripulisce e si rilegge.
      if (el.getAttribute('title') != null) el.removeAttribute('data-pn-tip');
      mostra(el);
    });
  }, true);

  ['scroll', 'wheel'].forEach(function (n) {
    window.addEventListener(n, nascondi, true);
  });
  window.addEventListener('blur', nascondi);
  window.addEventListener('resize', nascondi);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') nascondi();
  }, true);
})();
