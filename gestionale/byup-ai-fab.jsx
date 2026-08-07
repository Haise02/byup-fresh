// byup — assistente IA fluttuante
//
// Il bollino col segno byup che sta in basso a destra su tutte le schermate
// della console tranne il Supporto, dove il posto è già occupato dalla chat
// dell'assistenza e due bolle nello stesso angolo si coprirebbero.
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
const AI_GRAD_SOFT = 'linear-gradient(135deg, #FFF1F2 0%, #FDF2F8 50%, #F5F3FF 100%)';

// ─── Icone ────────────────────────────────────────────────────────────────
// Disegnate qui invece di pescarle da BuIcons: quel file è caricato solo da
// due delle sette pagine che montano il bollino, e sulle altre cinque
// l'assistente sarebbe morto al primo render.
// Niente spread sulle props né rest nel destructuring: in questo gestionale
// gli script non sono isolati e gli helper che Babel genera per quelle forme
// hanno già fatto sparire delle icone in passato. Props passate a mano.
function _AiSvg({ size, color, children }) {
  return (
    <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{display:'block', flexShrink: 0}}>{children}</svg>
  );
}
const AiIco = {
  x:     ({ size, color }) => <_AiSvg size={size} color={color}><path d="M18 6 6 18M6 6l12 12"/></_AiSvg>,
  check: ({ size, color }) => <_AiSvg size={size} color={color}><path d="m20 6-11 11-5-5"/></_AiSvg>,
  send:  ({ size, color }) => <_AiSvg size={size} color={color}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></_AiSvg>,
};

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
    /* Il pannello esce dall'angolo del bollino, non dal nulla. */
    @keyframes bu-ai-open {
      from { opacity: 0; transform: translateY(16px) scale(0.94); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes bu-ai-bubble {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    /* La mascotte ondeggia piano, come se stesse salutando davvero. */
    @keyframes bu-ai-float {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50%      { transform: translateY(-6px) rotate(2deg); }
    }
    @keyframes bu-ai-blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
    /* Il suggerimento nel campo entra da sotto in dissolvenza: il cambio
       secco fra un esempio e l'altro si legge come uno sfarfallio. */
    @keyframes bu-ai-hint {
      from { opacity: 0; transform: translateY(calc(-50% + 6px)); }
      to   { opacity: 1; transform: translateY(-50%); }
    }
    /* Il gradiente della testata scorre lentissimo: dà l'idea che sotto ci
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

const leggiPos = () => {
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY));
    return p && isFinite(p.x) && isFinite(p.y) ? p : null;   // `lato` può mancare: è opzionale
  } catch (e) { return null; }
};

// ─── Il bollino ───────────────────────────────────────────────────────────
function BuAiFab() {
  const [aperto, setAperto] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [scintille, setScintille] = React.useState(0);   // rimonta il burst a ogni clic
  // `null` = mai spostato: resta ancorato in basso a destra e segue il frame
  // quando la finestra cambia. Dopo il primo trascinamento diventa una
  // coppia di coordinate, e da lì comanda l'utente.
  const [pos, setPos] = React.useState(leggiPos);
  const [trascino, setTrascino] = React.useState(false);
  const [box, setBox] = React.useState(null);   // dov'è il bollino, in coordinate del frame
  const wrapRef = React.useRef(null);
  const mossoRef = React.useRef(false);

  // Dove sta il bollino e quanto è grande il frame: serve al pannello per
  // capire da che lato aprirsi. È una misura a richiesta, non uno stato che
  // si aggiorna da solo: tenerla in un effetto di layout che scriveva `box` a
  // ogni commit faceva ripartire il render, il render rimisurava, e col
  // bollino agganciato il giro non si chiudeva più.
  const misuraOra = React.useCallback(() => {
    const wrap = wrapRef.current;
    const frame = wrap && wrap.closest('.frame');
    if (!frame) return null;
    const z = zoomDi(frame);
    const fr = frame.getBoundingClientRect();
    // Il rettangolo del CONTENITORE, non del bottone: in hover il bottone ha
    // uno scale, e un transform sposta il rettangolo senza spostare il layout.
    const r = wrap.getBoundingClientRect();
    return {
      x: (r.left - fr.left) / z, y: (r.top - fr.top) / z,
      fw: fr.width / z, fh: fr.height / z,
    };
  }, []);

  React.useEffect(() => {
    const onResize = () => {
      // Il pannello, se è aperto, va riposizionato: il bollino si è mosso.
      setBox(b => (b ? misuraOra() : b));
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
  }, [misuraOra]);

  // Agganciato e nessuno lo sta guardando: è il solo momento in cui si
  // ritira. Col pannello aperto, sotto il dito o col mouse sopra torna
  // sempre tutto dentro.
  const ritirato = !!(pos && pos.lato) && !hover && !trascino && !aperto;

  const apri = () => {
    setHover(false);   // col pannello aperto il bollino torna a misura
    if (aperto) { setAperto(false); setBox(null); return; }
    // Si misura qui, una volta: da dove si apre il pannello dipende da dov'è
    // il bollino adesso.
    setBox(misuraOra());
    // Prima le scintille, poi il pannello: aprendoli insieme la finestra
    // coprirebbe metà del volo e il clic sembrerebbe non aver fatto niente.
    setScintille(n => n + 1);
    setTimeout(() => setAperto(true), 200);
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
      // L'apertura NON si fa qui: la lasciamo al `click` che arriva subito
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
    <>
      {aperto && <BuAiChat box={box} onClose={() => { setAperto(false); setBox(null); }}/>}

      {/* Sopra il pannello, non sotto: le scintille devono passargli davanti. */}
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
        {!aperto && !hover && !ritirato && (
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
            apri();
          }}
          onMouseEnter={() => !aperto && !trascino && setHover(true)}
          onMouseLeave={() => setHover(false)}
          title="Chiedi all'assistente byup — trascinalo dove preferisci, al bordo si scosta"
          aria-label="Apri l'assistente byup"
          data-no-fx
          style={{
            position:'relative',
            width: 72, height: 72, borderRadius:'50%',
            touchAction:'none',   // senza, su touch lo scroll ruba il gesto
            border: `1px solid ${hover ? 'transparent' : 'rgba(15,17,21,0.06)'}`,
            // A riposo è bianco col segno corallo; al passaggio si accende
            // col gradiente e il segno diventa bianco.
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
              : 'transform 260ms cubic-bezier(0.34, 1.4, 0.64, 1), background 220ms ease, box-shadow 260ms ease, border-color 220ms ease',
            cursor: trascino ? 'grabbing' : 'pointer', padding: 0,
            display:'grid', placeItems:'center',
            animation: hover ? 'bu-ai-shift 4s ease infinite' : 'none',
          }}>
          {/* I due segni stanno sovrapposti e si scambiano in dissolvenza:
              cambiare `src` a metà transizione farebbe uno sfarfallio. */}
          <span style={{position:'relative', width: 34, height: 34, display:'block'}}>
            <img src="Fresh-mark.png" alt="" style={{
              position:'absolute', inset: 0, width:'100%', height:'100%',
              objectFit:'contain',
              opacity: hover ? 0 : 1, transition:'opacity 200ms ease',
            }}/>
            <img src="Fresh-mark.png" alt="" style={{
              position:'absolute', inset: 0, width:'100%', height:'100%',
              objectFit:'contain', filter:'brightness(0) invert(1)',
              opacity: hover ? 1 : 0, transition:'opacity 200ms ease',
            }}/>
          </span>
        </button>
      </div>
      </div>
    </>
  );
}

// ─── La chat ──────────────────────────────────────────────────────────────
const AI_SALUTO = [
  'Sono l\'intelligenza artificiale di Byup. Posso aiutarti a gestire il tuo locale modificando il menu, Sala e Tavoli e configurando le impostazioni nella sezione "Operazioni".',
  'Posso anche prenotare per conto di un cliente: scrivimi i dati minimi — nome, coperti e orario — e la registro io.',
  'Basta che mi dici quello che vuoi modificare e in pochi secondi ti riporterò la modifica fatta.',
  'Tranquillo, ti chiederò una seconda conferma prima di pubblicare le modifiche.',
];

// Gli esempi girano dentro al campo invece di stare fuori come pillole da
// premere: erano comandi già scritti, e uno che clicca non impara cosa può
// chiedere — esegue una cosa decisa da noi. Qui invece mostrano la FORMA di
// una richiesta, nel punto esatto in cui stai per scriverla, e non occupano
// una riga di pannello. Uno per area, così in un giro si vede tutto il
// perimetro: prenotazioni, menu, sala, impostazioni.
const AI_ESEMPI = [
  'Dimmi cosa vuoi modificare…',
  'Es. prenota per Rossi, 4 coperti alle 21',
  'Es. togli la Carbonara dal menu',
  'Es. unisci i tavoli 4 e 5',
  'Es. attiva l\'asporto',
];

// Dove mettere il pannello, dato dov'è finito il bollino. Si allinea al bordo
// vicino e si apre sopra se c'è posto, sotto altrimenti: col bollino portato
// in alto a sinistra, aprirlo sempre in basso a destra lo staccherebbe da chi
// l'ha chiamato. Tutto rientra nel frame, che ha overflow hidden e taglierebbe
// quello che esce.
const PAN_W = 384, PAN_H = 620, PAN_GAP = 14;
function posizionaPannello(box) {
  if (!box) return { left: null, stile: {right: 26, bottom: 112}, origine: '100% 100%' };
  const { x, y, fw, fh } = box;
  const aDestra = x + FAB / 2 > fw / 2;
  const left = fra(aDestra ? x + FAB - PAN_W : x, MARG, Math.max(MARG, fw - PAN_W - MARG));
  let top, sopra = true;
  if (y - PAN_GAP - PAN_H >= MARG) top = y - PAN_GAP - PAN_H;
  else if (y + FAB + PAN_GAP + PAN_H <= fh - MARG) { top = y + FAB + PAN_GAP; sopra = false; }
  else top = fra(y + FAB / 2 - PAN_H / 2, MARG, Math.max(MARG, fh - PAN_H - MARG));
  return {
    stile: { left, top },
    origine: `${aDestra ? '100%' : '0%'} ${sopra ? '100%' : '0%'}`,
  };
}

function BuAiChat({ onClose, box }) {
  const [messaggi, setMessaggi] = React.useState([{ da:'ai', testo: AI_SALUTO }]);
  const [input, setInput] = React.useState('');
  const [scrive, setScrive] = React.useState(false);
  const [esempio, setEsempio] = React.useState(0);
  const [fuoco, setFuoco] = React.useState(false);
  const scrollRef = React.useRef(null);
  const collocazione = posizionaPannello(box);

  // Gli esempi girano solo quando il campo è fermo e vuoto: col cursore
  // dentro, un testo che cambia da solo distrae mentre stai formulando la
  // frase, e a campo pieno non si vede comunque.
  React.useEffect(() => {
    if (fuoco || input) return;
    const t = setInterval(() => setEsempio(i => (i + 1) % AI_ESEMPI.length), 3400);
    return () => clearInterval(t);
  }, [fuoco, input]);

  React.useEffect(() => {
    // Finché c'è solo il saluto si resta in cima: è un testo da leggere
    // dall'inizio, e portarlo in fondo lo mostrava tagliato a metà parola.
    if (messaggi.length < 2 && !scrive) return;
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messaggi, scrive]);

  const manda = (testo) => {
    const t = (testo != null ? testo : input).trim();
    if (!t) return;
    setMessaggi(m => [...m, { da:'io', testo: [t] }]);
    setInput('');
    setScrive(true);
    setTimeout(() => {
      setScrive(false);
      // La seconda conferma non è un dettaglio di copy: il saluto la promette,
      // quindi la risposta la deve chiedere davvero.
      setMessaggi(m => [...m, {
        da:'ai',
        testo: ['Ho preparato la modifica. Ecco cosa cambierà:'],
        conferma: t,
      }]);
    }, 1300);
  };

  return (
    <div style={{
      position:'absolute',
      ...collocazione.stile,
      // Alto quanto serve a far stare il saluto intero: più corto, l'ultimo
      // capoverso restava tagliato a metà riga, ed è proprio quello della
      // doppia conferma. Con gli esempi finiti dentro al campo si è liberata
      // la riga delle pillole, e il pannello è tornato di ottanta più basso.
      width: PAN_W, height: PAN_H, zIndex: 71,
      background: PN.WHITE, borderRadius: 20,
      border:'1px solid rgba(167,139,250,0.18)',
      boxShadow:'0 28px 70px rgba(88, 42, 120, 0.22), 0 8px 22px rgba(15,17,21,0.10)',
      display:'flex', flexDirection:'column', overflow:'hidden',
      fontFamily:'inherit',
      animation:'bu-ai-open 280ms cubic-bezier(0.34, 1.3, 0.64, 1)',
      // Esce dall'angolo dal lato del bollino: spostato in alto a sinistra,
      // un pannello che si apre dal basso a destra sembrerebbe di un altro.
      transformOrigin: collocazione.origine,
    }}>
      {/* Testata — il gradiente aurora e il byuppino che saluta */}
      <div style={{
        position:'relative', padding:'15px 16px 15px 18px',
        background: AI_GRAD, backgroundSize:'200% 200%',
        animation:'bu-ai-shift 9s ease infinite',
        color:'#fff',
        // Non `hidden`: il byuppino deve poter sbordare in basso e affacciarsi
        // sulla conversazione. Il ritaglio agli angoli lo fa già il pannello.
        // Lo zIndex serve perché la conversazione viene dopo nel DOM e
        // altrimenti gli passerebbe sopra i piedi.
        zIndex: 2,
      }}>
        {/* Un velo chiaro in alto: senza, il gradiente sembra una fascia
            stampata invece di una superficie. */}
        <span style={{
          position:'absolute', inset: 0, pointerEvents:'none',
          background:'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%)',
        }}/>
        <div style={{position:'relative', display:'flex', alignItems:'center', gap: 10}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 16, fontWeight: 700, letterSpacing: -0.2}}>byuppino</div>
            <div style={{fontSize: 12.5, opacity: 0.92, marginTop: 1}}>Intelligenza artificiale di byup</div>
          </div>
          {/* La mascotte sborda in basso: sembra affacciata dentro la chat. */}
          <img src="byuppino-wave.png" alt="" style={{
            width: 74, height:'auto', marginBottom: -26, flexShrink: 0,
            filter:'drop-shadow(0 6px 12px rgba(88,42,120,0.28))',
            animation:'bu-ai-float 4.2s ease-in-out infinite',
          }}/>
          <button onClick={onClose} aria-label="Chiudi" data-no-fx style={{
            background:'rgba(255,255,255,0.18)', border:'none', borderRadius:'50%',
            width: 28, height: 28, color:'#fff', cursor:'pointer',
            display:'grid', placeItems:'center', flexShrink: 0, alignSelf:'flex-start',
          }}><AiIco.x size={15} color="#fff"/></button>
        </div>
      </div>

      {/* La via d'uscita verso una persona. Sta qui, in cima e allineata a
          destra, non sopra al campo di scrittura: là era in mezzo agli occhi
          proprio mentre stai per chiedere qualcosa all'assistente, e sembrava
          un invito ad andarsene. È l'ultima spiaggia, deve solo esserci. */}
      <div style={{
        display:'flex', justifyContent:'flex-end',
        padding:'6px 10px 0', background: AI_GRAD_SOFT,
      }}>
        <button
          onClick={() => { window.location.href = 'byup Supporto.html?chat=1'; }}
          data-no-fx
          onMouseEnter={e => { e.currentTarget.style.color = PN.MUTED; }}
          onMouseLeave={e => { e.currentTarget.style.color = PN.MUTED_SOFT; }}
          style={{
            display:'inline-flex', alignItems:'center', gap: 5,
            padding:'4px 6px',
            background:'transparent', border:'none',
            fontSize: 12, fontWeight: 500, color: PN.MUTED_SOFT,
            cursor:'pointer', fontFamily:'inherit',
            transition:'color 140ms ease',
          }}>
          Serve una persona? Contatta l'assistenza
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
        </button>
      </div>

      {/* Conversazione */}
      <div ref={scrollRef} className="pn-scroll" style={{
        flex: 1, overflowY:'auto', padding:'8px 14px 14px',
        background: AI_GRAD_SOFT,
      }}>
        {messaggi.map((m, i) => (
          <div key={i} style={{
            display:'flex', justifyContent: m.da === 'io' ? 'flex-end' : 'flex-start',
            marginBottom: 10, animation:'bu-ai-bubble 260ms ease both',
          }}>
            <div style={{
              maxWidth:'86%',
              background: m.da === 'io' ? AI_GRAD : PN.WHITE,
              color: m.da === 'io' ? '#fff' : PN.TEXT,
              padding:'10px 13px', borderRadius: 14,
              borderBottomRightRadius: m.da === 'io' ? 4 : 14,
              borderBottomLeftRadius: m.da === 'io' ? 14 : 4,
              fontSize: 14.5, lineHeight: 1.5,
              border: m.da === 'io' ? 'none' : '1px solid rgba(167,139,250,0.16)',
              boxShadow: m.da === 'io' ? 'none' : '0 2px 8px rgba(88,42,120,0.06)',
            }}>
              {m.testo.map((p, j) => (
                <p key={j} style={{margin: j === 0 ? 0 : '9px 0 0'}}>{p}</p>
              ))}
              {m.conferma && <BuAiConferma richiesta={m.conferma}/>}
            </div>
          </div>
        ))}

        {scrive && (
          <div style={{display:'flex', justifyContent:'flex-start', marginBottom: 10}}>
            <div style={{
              background: PN.WHITE, border:'1px solid rgba(167,139,250,0.16)',
              padding:'11px 14px', borderRadius: 14, borderBottomLeftRadius: 4,
              display:'flex', gap: 4,
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius:'50%', background:'#A78BFA',
                  animation:`bu-ai-blink 1.2s infinite ${i * 0.18}s`,
                }}/>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Scrittura */}
      <div style={{
        display:'flex', gap: 8, padding: 12,
        background: PN.WHITE,
      }}>
        {/* Il suggerimento è un testo sovrapposto, non l'attributo placeholder:
            quello non si può dissolvere, e cambiarlo di scatto ogni tre secondi
            sotto gli occhi sembra un difetto. */}
        <div style={{position:'relative', flex: 1, minWidth: 0}}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && manda()}
            onFocus={() => setFuoco(true)}
            onBlur={() => setFuoco(false)}
            style={{
              width:'100%',
              border:'1px solid rgba(167,139,250,0.28)', outline:'none',
              borderRadius: 999, padding:'9px 15px',
              fontSize: 14.5, fontFamily:'inherit', background:'#FDFBFF',
            }}
          />
          {!input && (
            <span key={esempio} style={{
              position:'absolute', left: 16, right: 12, top:'50%',
              transform:'translateY(-50%)', pointerEvents:'none',
              fontSize: 14, color: PN.MUTED_SOFT,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              animation:'bu-ai-hint 380ms ease',
            }}>{AI_ESEMPI[esempio]}</span>
          )}
        </div>
        <button onClick={() => manda()} aria-label="Invia" data-no-fx style={{
          width: 38, height: 38, borderRadius:'50%', flexShrink: 0,
          background: AI_GRAD, color:'#fff', border:'none', cursor:'pointer',
          display:'grid', placeItems:'center',
          boxShadow:'0 4px 12px rgba(244,114,182,0.35)',
        }}><AiIco.send size={15} color="#fff"/></button>
      </div>
    </div>
  );
}

// La seconda conferma promessa dal saluto: finché non si preme Pubblica non
// esce niente, e una volta deciso i bottoni spariscono — non si annulla una
// pubblicazione già fatta da qui.
function BuAiConferma({ richiesta }) {
  const [esito, setEsito] = React.useState(null);

  if (esito) return (
    <div style={{
      marginTop: 10, padding:'9px 11px', borderRadius: 10,
      background: esito === 'ok' ? PN.GREEN_SOFT : '#F3F4F6',
      color: esito === 'ok' ? PN.GREEN : PN.MUTED,
      fontSize: 13.5, fontWeight: 600,
      display:'flex', alignItems:'center', gap: 7,
    }}>
      {esito === 'ok' ? <AiIco.check size={14}/> : <AiIco.x size={14}/>}
      {esito === 'ok' ? 'Modifica pubblicata' : 'Modifica annullata'}
    </div>
  );

  return (
    <>
      <div style={{
        marginTop: 9, padding:'9px 11px', borderRadius: 10,
        background:'#FBF9FF', border:'1px solid rgba(167,139,250,0.24)',
        fontSize: 13.5, color: PN.TEXT, lineHeight: 1.45,
      }}>{richiesta}</div>
      <div style={{fontSize: 12.5, color: PN.MUTED, margin:'9px 0 8px'}}>
        Non pubblico niente finché non me lo confermi.
      </div>
      <div style={{display:'flex', gap: 7}}>
        <button onClick={() => setEsito('ok')} data-no-fx style={{
          flex: 1, padding:'8px 12px', borderRadius: 9,
          background: AI_GRAD, color:'#fff', border:'none',
          fontSize: 13.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        }}>Pubblica</button>
        <button onClick={() => setEsito('no')} data-no-fx style={{
          flex: 1, padding:'8px 12px', borderRadius: 9,
          background: PN.WHITE, color: PN.TEXT, border:`1px solid ${PN.BORDER}`,
          fontSize: 13.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
        }}>Annulla</button>
      </div>
    </>
  );
}

window.BuAiFab = BuAiFab;

// ─── Aggancio ─────────────────────────────────────────────────────────────
// Il frame lo monta React dopo la compilazione Babel, che arriva da CDN: al
// primo giro può non esserci ancora. Stessa soluzione dello script di zoom
// nelle pagine — un observer che aspetta il frame e monta appena compare.
(function () {
  if (typeof document === 'undefined') return;
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
