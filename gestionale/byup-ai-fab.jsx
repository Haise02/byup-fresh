// byup — il bollino del byuppino AI
//
// La faccina del byuppino che sta in basso a destra su tutte le schermate
// della console tranne due: il Supporto, dove il posto è già occupato dalla
// chat dell'assistenza, e la Panoramica, dove il byuppino c'è già in persona
// — è il suo widget. Il bollino non apre più una chat propria: porta LÀ.
// Un assistente solo, una casa sola: la chat che viveva qui dentro diceva le
// stesse cose del widget in un pannello diverso, ed è stata tolta.
//
// Si monta da solo: basta caricare questo file dopo l'app della pagina, non
// serve toccare i componenti. Si aggancia dentro `.frame` e non al body,
// perché il frame ha uno `zoom` che scala tutta la UI — un elemento `fixed`
// fuori dal frame resterebbe della misura sbagliata e fuori dai bordi.

// ─── Tinte ────────────────────────────────────────────────────────────────
// La palette aurora del gestionale: corallo, rosa, lavanda. È la stessa che
// gira attorno alle card dei piani, ed è il registro con cui qui dentro si
// dice "questa cosa è speciale".
const AI_GRAD = 'linear-gradient(135deg, #FF5A5F 0%, #F472B6 52%, #A78BFA 100%)';

// ─── Animazioni ───────────────────────────────────────────────────────────
// Iniettate una volta sola: sono keyframe, e in stile inline non esistono.
(function () {
  if (typeof document === 'undefined' || document.getElementById('bu-ai-fx')) return;
  const st = document.createElement('style');
  st.id = 'bu-ai-fx';
  st.textContent = `
    /* Il respiro del bollino a riposo: un alone che si allarga e svanisce,
       lento e appena visibile. Serve a farlo notare senza chiamare. */
    @keyframes bu-ai-pulse {
      0%   { transform: scale(1);   opacity: 0.55; }
      70%  { transform: scale(1.7); opacity: 0; }
      100% { transform: scale(1.7); opacity: 0; }
    }
    /* Le scintille del clic: partono dal centro, volano verso fuori lungo
       l'angolo che ognuna riceve, e si spengono. Crescono nel primo quarto e
       poi calano: partendo già rimpicciolite restavano puntini da un pixel. */
    @keyframes bu-ai-spark {
      0%   { transform: rotate(var(--a)) translateX(4px) scale(0);    opacity: 0; }
      22%  { transform: rotate(var(--a)) translateX(calc(var(--d) * 0.34)) scale(1); opacity: 1; }
      100% { transform: rotate(var(--a)) translateX(var(--d)) scale(0.25); opacity: 0; }
    }
    /* Il gradiente dell'hover scorre lentissimo: dà l'idea che sotto ci
       sia qualcosa di vivo, senza diventare una discoteca. */
    @keyframes bu-ai-shift {
      0%, 100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
  `;
  document.head.appendChild(st);
})();

// ─── Posizione del bollino ────────────────────────────────────────────────
const FAB = 72, MARG = 12, POS_KEY = 'byup.ai.fab.pos';
const fra = (v, min, max) => Math.max(min, Math.min(max, v));

// Il frame scala tutta la console con `zoom`, quindi un pixel di schermo NON
// è un pixel di frame: senza dividere per il fattore, il bollino scapperebbe
// dal puntatore appena la finestra non è alta esattamente 900.
const zoomDi = (frame) => {
  const dichiarata = parseFloat(frame.style.width);
  const vera = frame.getBoundingClientRect().width;
  return dichiarata > 0 && vera > 0 ? vera / dichiarata : 1;
};

// Agganciato a un bordo il bollino si ritira quasi tutto fuori dal frame —
// che ha overflow hidden e fa da forbice — e resta uno spicchio: abbastanza
// per ricordarti che c'è, poco per darti fastidio mentre lavori. Torna dentro
// da solo appena ci passi sopra.
const BORDO = 46;      // quanto vicino a un bordo per considerarlo agganciato
const SPORGE = 0.58;   // quanta parte del bollino esce dal frame da agganciato

const latoVicino = (x, y, fw, fh) => {
  const d = [
    ['sinistra', x], ['destra', fw - (x + FAB)],
    ['alto', y], ['basso', fh - (y + FAB)],
  ].sort((a, b) => a[1] - b[1])[0];
  return d[1] <= BORDO ? d[0] : null;
};

// Di quanto si sposta fuori, e da che parte.
const scostamento = (lato) => ({
  sinistra: `translateX(-${SPORGE * 100}%)`,
  destra:   `translateX(${SPORGE * 100}%)`,
  alto:     `translateY(-${SPORGE * 100}%)`,
  basso:    `translateY(${SPORGE * 100}%)`,
}[lato] || '');

// Il segno sta al centro del bollino, e a bollino scostato il centro è fuori
// dal frame: resterebbe invisibile. Il contenuto si rifà avanti della metà di
// quel che sporge, così finisce in mezzo alla mezzaluna che si vede.
const RIENTRO = Math.round(SPORGE * FAB / 2);
const rientroIcona = (lato) => ({
  sinistra: `translateX(${RIENTRO}px)`,
  destra:   `translateX(-${RIENTRO}px)`,
  alto:     `translateY(${RIENTRO}px)`,
  basso:    `translateY(-${RIENTRO}px)`,
}[lato] || '');

// La freccia punta verso l'interno: da agganciato non dice "sono il
// byuppino", dice "tirami di qua". La faccina la si è già vista prima.
const VERSO_DENTRO = {
  sinistra: 'M9 6l6 6-6 6',
  destra:   'M15 6l-6 6 6 6',
  alto:     'M6 9l6 6 6-6',
  basso:    'M6 15l6-6 6 6',
};

const leggiPos = () => {
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY));
    return p && isFinite(p.x) && isFinite(p.y) ? p : null;   // `lato` può mancare: è opzionale
  } catch (e) { return null; }
};

// ─── Il bollino ───────────────────────────────────────────────────────────
function BuAiFab() {
  const [hover, setHover] = React.useState(false);
  const [scintille, setScintille] = React.useState(0);   // rimonta il burst a ogni clic
  // `null` = mai spostato: resta ancorato in basso a destra e segue il frame
  // quando la finestra cambia. Dopo il primo trascinamento diventa una
  // coppia di coordinate, e da lì comanda l'utente.
  const [pos, setPos] = React.useState(leggiPos);
  const [trascino, setTrascino] = React.useState(false);
  const wrapRef = React.useRef(null);
  const mossoRef = React.useRef(false);

  React.useEffect(() => {
    const onResize = () => {
      // Se la finestra si stringe, il bollino spostato a mano potrebbe
      // finire fuori: lo si riporta dentro invece di perderlo.
      setPos(p => {
        const wrap = wrapRef.current, frame = wrap && wrap.closest('.frame');
        if (!p || !frame) return p;
        const z = zoomDi(frame), fr = frame.getBoundingClientRect();
        const fw = fr.width / z, fh = fr.height / z;
        // Agganciato resta agganciato: si riallinea al suo bordo, che con la
        // finestra più stretta si è spostato.
        const q = {
          x: p.lato === 'sinistra' ? 0 : p.lato === 'destra' ? fw - FAB : fra(p.x, MARG, fw - FAB - MARG),
          y: p.lato === 'alto' ? 0 : p.lato === 'basso' ? fh - FAB : fra(p.y, MARG, fh - FAB - MARG),
          lato: p.lato || null,
        };
        return (q.x === p.x && q.y === p.y && q.lato === (p.lato || null)) ? p : q;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Agganciato e nessuno lo sta guardando: è il solo momento in cui si
  // ritira. Sotto il dito o col mouse sopra torna sempre tutto dentro.
  const ritirato = !!(pos && pos.lato) && !hover && !trascino;

  // Niente più chat qui: il byuppino vive nel suo widget in Panoramica, e il
  // bollino è la strada per raggiungerlo dalle altre schermate. Il parametro
  // dice al widget di prendersi il fuoco all'arrivo, così il viaggio finisce
  // dentro la conversazione. Le scintille partono PRIMA di navigare:
  // cambiando pagina subito il clic sembrerebbe non aver fatto niente.
  const vai = () => {
    setHover(false);
    setScintille(n => n + 1);
    setTimeout(() => { window.location.href = 'byup Panoramica.html?byuppino=1'; }, 320);
  };

  // Un solo gesto per due azioni: si apre al rilascio solo se il puntatore
  // non si è mosso più di 4px. Sotto quella soglia è un clic con la mano
  // ferma male, sopra è una volontà di spostare.
  const prendi = (e) => {
    if (e.button != null && e.button !== 0) return;
    const wrap = wrapRef.current;
    const frame = wrap && wrap.closest('.frame');
    if (!frame) return;
    e.preventDefault();
    const z = zoomDi(frame);
    const fr = frame.getBoundingClientRect();
    const r = wrap.getBoundingClientRect();
    // Da agganciato il bollino è mezzo fuori: prenderlo dal punto esatto lo
    // farebbe saltare via del suo scostamento. Si centra sotto il dito.
    const agganciato = pos && pos.lato;
    const offX = agganciato ? FAB / 2 : (e.clientX - r.left) / z;
    const offY = agganciato ? FAB / 2 : (e.clientY - r.top) / z;
    const fw = fr.width / z, fh = fr.height / z;
    const px = e.clientX, py = e.clientY;
    mossoRef.current = false;
    setTrascino(true);
    setHover(false);

    const muovi = (ev) => {
      if (Math.abs(ev.clientX - px) > 4 || Math.abs(ev.clientY - py) > 4) mossoRef.current = true;
      if (!mossoRef.current) return;
      // Durante il trascinamento il margine è più stretto: serve poter
      // arrivare fino al bordo, che è proprio dove ci si aggancia.
      setPos({
        x: fra((ev.clientX - fr.left) / z - offX, 0, fw - FAB),
        y: fra((ev.clientY - fr.top) / z - offY, 0, fh - FAB),
        lato: null,
      });
    };
    const molla = () => {
      window.removeEventListener('pointermove', muovi);
      window.removeEventListener('pointerup', molla);
      window.removeEventListener('pointercancel', molla);
      setTrascino(false);
      // Il viaggio NON parte da qui: lo lasciamo al `click` che arriva subito
      // dopo. Così il bottone continua a rispondere anche a un click che non
      // nasce da un puntatore — tastiera, lettori di schermo, comandi vocali —
      // e non serve duplicare la logica. Dopo un trascinamento quel click
      // arriva lo stesso (il bollino è rimasto sotto il dito) e va ignorato:
      // ci pensa la bandiera `mosso`.
      if (mossoRef.current) {
        setPos(p => {
          if (!p) return p;
          // Lasciato vicino a un bordo si aggancia e ci si allinea: mezzo
          // agganciato, con due pixel di scarto, si leggerebbe come un errore.
          const lato = latoVicino(p.x, p.y, fw, fh);
          const q = {
            x: lato === 'sinistra' ? 0 : lato === 'destra' ? fw - FAB : fra(p.x, MARG, fw - FAB - MARG),
            y: lato === 'alto' ? 0 : lato === 'basso' ? fh - FAB : fra(p.y, MARG, fh - FAB - MARG),
            lato,
          };
          // Il posto scelto vale su tutte le schermate: spostarlo una volta
          // per pagina sarebbe una tortura.
          try { localStorage.setItem(POS_KEY, JSON.stringify(q)); } catch (e) {}
          return q;
        });
      }
    };
    window.addEventListener('pointermove', muovi);
    window.addEventListener('pointerup', molla);
    window.addEventListener('pointercancel', molla);
  };

  return (
      <div ref={wrapRef} style={{
        position:'absolute', zIndex: 72,
        ...(pos ? {left: pos.x, top: pos.y} : {right: 26, bottom: 26}),
      }}>
      <div style={{
        // Lo scostamento sta QUI e non sul contenitore misurato: il
        // trascinamento legge il rettangolo del wrapper, e un transform su
        // quello gli farebbe calcolare la presa nel posto sbagliato.
        transform: ritirato ? scostamento(pos.lato) : 'translate(0, 0)',
        opacity: ritirato ? 0.62 : 1,
        transition:'transform 260ms cubic-bezier(0.34, 1.3, 0.64, 1), opacity 220ms ease',
      }}>
        {/* Le scintille stanno FUORI dal bottone: dentro, lo scale dell'hover
            se le porterebbe dietro e il volo si accorcerebbe. */}
        {scintille > 0 && (
          <div key={scintille} style={{
            position:'absolute', left:'50%', top:'50%',
            width: 0, height: 0, pointerEvents:'none',
          }}>
            {Array.from({length: 12}).map((_, i) => (
              <span key={i} style={{
                position:'absolute', left: -5, top: -5,
                width: 10, height: 10, borderRadius: '50%',
                background: i % 3 === 0 ? '#FF5A5F' : i % 3 === 1 ? '#F472B6' : '#A78BFA',
                boxShadow: '0 0 10px currentColor',
                color: i % 3 === 0 ? 'rgba(255,90,95,0.55)' : i % 3 === 1 ? 'rgba(244,114,182,0.55)' : 'rgba(167,139,250,0.55)',
                '--a': `${i * 30}deg`,
                '--d': `${74 + (i % 4) * 16}px`,
                animation: `bu-ai-spark ${620 + (i % 4) * 110}ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards`,
              }}/>
            ))}
          </div>
        )}

        {/* L'alone che respira. Sparisce in hover — lì il colore ce l'ha già —
            e da agganciato, dove un pulsare al bordo sarebbe esattamente il
            disturbo che l'aggancio serve a togliere. */}
        {!hover && !ritirato && (
          <span style={{
            position:'absolute', inset: 0, borderRadius:'50%',
            background: AI_GRAD, opacity: 0.5,
            animation:'bu-ai-pulse 2800ms ease-out infinite',
            pointerEvents:'none',
          }}/>
        )}

        <button
          onPointerDown={prendi}
          onClick={() => {
            if (mossoRef.current) { mossoRef.current = false; return; }   // era un trascinamento
            vai();
          }}
          onMouseEnter={() => !trascino && setHover(true)}
          onMouseLeave={() => setHover(false)}
          title="Vai dal byuppino AI in Panoramica — trascinalo dove preferisci, al bordo si scosta"
          aria-label="Vai dal byuppino AI in Panoramica"
          data-no-fx
          style={{
            position:'relative',
            width: 72, height: 72, borderRadius:'50%',
            touchAction:'none',   // senza, su touch lo scroll ruba il gesto
            border: `1px solid ${hover ? 'transparent' : 'rgba(15,17,21,0.06)'}`,
            // A riposo è bianco con la faccina; al passaggio si accende col
            // gradiente e la faccina resta nel suo medaglione bianco.
            background: hover ? AI_GRAD : 'linear-gradient(180deg, #FFFFFF 0%, #FDFDFE 100%)',
            backgroundSize: '200% 200%',
            boxShadow: hover
              ? '0 20px 46px rgba(244,114,182,0.42), 0 6px 16px rgba(167,139,250,0.30)'
              : '0 8px 24px rgba(15,17,21,0.14)',
            // Metà in più, come chiesto: 72 → 108. Mentre lo trascini resta a
            // misura e si stacca appena dal foglio: ingrandito, il puntatore
            // finirebbe fuori centro e il bollino sembrerebbe sfuggire.
            // Agganciato, l'hover non gonfia: fa rientrare. Un bollino a metà
            // fuori che si fa una volta e mezzo uscirebbe ancora di più.
            transform: trascino ? 'scale(1.08)'
              : (hover && !(pos && pos.lato)) ? 'scale(1.5)' : 'scale(1)',
            // Niente transizione sul transform durante il trascinamento:
            // il bollino arriverebbe al puntatore con un quarto di secondo
            // di ritardo, come se fosse attaccato con un elastico.
            transition: trascino
              ? 'background 220ms ease, box-shadow 200ms ease'
              : 'transform 260ms cubic-bezier(0.34, 1.4, 0.64, 1), opacity 200ms ease, background 220ms ease, box-shadow 260ms ease, border-color 220ms ease',
            cursor: trascino ? 'grabbing' : 'pointer', padding: 0,
            display:'grid', placeItems:'center',
            animation: hover ? 'bu-ai-shift 4s ease infinite' : 'none',
          }}>
          {/* La faccina e la freccia stanno sovrapposte e si scambiano in
              dissolvenza quando il bollino si aggancia a un bordo. */}
          <span style={{
            position:'relative', width: 44, height: 44, display:'block',
            transform: ritirato ? rientroIcona(pos.lato) : 'translate(0, 0)',
            transition:'transform 260ms cubic-bezier(0.34, 1.3, 0.64, 1)',
          }}>
            {/* La faccina del byuppino AI: la stessa mascotte del widget,
                inquadrata sulla testa. L'immagine è alta il doppio della sua
                larghezza e la testa — ciuffo compreso — sta tutta nel primo
                quadrato, quindi basta `cover` ancorato in cima. Il cerchio
                bianco che la ritaglia a riposo non si vede (bollino bianco su
                bianco) e sull'hover a gradiente diventa il suo medaglione. */}
            <span style={{
              position:'absolute', inset: 0, borderRadius:'50%',
              overflow:'hidden', background:'#fff',
              opacity: ritirato ? 0 : 1, transition:'opacity 200ms ease',
            }}>
              <img src="byuppino-assistente.png?v=2" alt="" style={{
                width:'100%', height:'100%', objectFit:'cover',
                objectPosition:'50% 0%', display:'block',
              }}/>
            </span>
            <span style={{
              position:'absolute', inset: 0, display:'grid', placeItems:'center',
              opacity: ritirato ? 1 : 0, transition:'opacity 200ms ease',
              color: PN.PINK,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                style={{display:'block'}}>
                <path d={VERSO_DENTRO[(pos && pos.lato) || 'destra']}/>
              </svg>
            </span>
          </span>
        </button>
      </div>
      </div>
  );
}

window.BuAiFab = BuAiFab;

// ─── Aggancio ─────────────────────────────────────────────────────────────
// Il frame lo monta React dopo la compilazione Babel, che arriva da CDN: al
// primo giro può non esserci ancora. Stessa soluzione dello script di zoom
// nelle pagine — un observer che aspetta il frame e monta appena compare.
(function () {
  if (typeof document === 'undefined') return;
  // In Panoramica il bollino non si monta: il byuppino è già lì, nel suo
  // widget, e un bollino che porta dove sei già è un bottone rotto. La pagina
  // nemmeno carica questo file; la guardia resta per quando qualcuno copierà
  // la fila degli script da un'altra pagina senza pensarci.
  if (/panoramica/i.test(window.location.pathname)) return;
  let montato = false;
  const monta = () => {
    if (montato) return;
    const frame = document.querySelector('.frame');
    if (!frame) return;
    montato = true;
    const box = document.createElement('div');
    box.id = 'bu-ai-fab-root';
    frame.appendChild(box);
    ReactDOM.createRoot(box).render(<BuAiFab/>);
  };
  new MutationObserver(monta).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  monta();
})();
