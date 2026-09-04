// byup.it/cucina — la pagina che si apre sul monitor della cucina (P-134).
//
// Non è una pagina di accesso: è il collegamento, e basta. Chi è in cucina
// accende lo schermo, scrive un indirizzo corto — che su un televisore si
// digita col telecomando, e ogni carattere in più è un errore in più — e
// trova un QR con sotto lo stesso codice in chiaro. Il QR per chi passa col
// telefono, il codice per chi in quel momento è alla cassa davanti al
// computer. Il QR non contiene un numero da ricopiare: contiene il
// collegamento alla pagina di conferma del gestionale, col codice già dentro.
//
// Il codice dura pochi minuti e lo schermo lo rigenera da solo: un codice che
// resta appeso in cucina tutta la sera è una porta aperta.
//
// Quando il titolare approva, lo schermo lo scopre da sé e passa alla cucina.
// Il collegamento poi non scade più: questo schermo resta acceso
// dall'apertura alla chiusura e nessuno lo guarda per accertarsi che sia
// ancora collegato — lo guarda per sapere cosa cucinare.

const CC_SCHERMO_ID = (() => {
  let id = '';
  try { id = localStorage.getItem('byup_schermo_cucina') || ''; } catch (e) {}
  if (!id) { id = 'sch-' + Math.random().toString(36).slice(2, 9); try { localStorage.setItem('byup_schermo_cucina', id); } catch (e) {} }
  return id;
})();
// Dove porta il QR: la pagina di conferma del gestionale, col codice dentro.
const ccUrlConferma = (code) => {
  try {
    const u = new URL('byup Impostazioni.html', window.location.href);
    u.searchParams.set('page', 'personale');
    u.searchParams.set('collega', code);
    return u.href;
  } catch (e) { return `byup Impostazioni.html?page=personale&collega=${code}`; }
};

// QR decorativo: la trama è deterministica (nessun Math.random, la stessa a
// ogni render) e cambia col codice, così a occhio si vede che il codice si è
// rigenerato. Non è scansionabile e non finge di esserlo — sotto c'è il
// codice in chiaro, che è la strada che funziona sempre.
function CcQr({ code, size = 260 }) {
  const N = 27;
  const cell = size / N;
  const seme = String(code || '').split('').reduce((s, c) => s + c.charCodeAt(0), 7);
  const inFinder = (r, c) => (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
  const acceso = (r, c) => {
    const h = Math.sin(r * 12.9898 + c * 78.233 + seme) * 43758.5453;
    return (h - Math.floor(h)) > 0.47;
  };
  const moduli = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (inFinder(r, c) || !acceso(r, c)) continue;
    moduli.push(<rect key={`${r}-${c}`} x={c * cell + cell * 0.1} y={r * cell + cell * 0.1}
      width={cell * 0.8} height={cell * 0.8} rx={cell * 0.3} fill="#0F1115"/>);
  }
  const Finder = ({ r, c }) => (
    <g transform={`translate(${c * cell}, ${r * cell})`}>
      <rect x={cell * 0.35} y={cell * 0.35} width={cell * 6.3} height={cell * 6.3} rx={cell * 1.9} fill="none" stroke="#0F1115" strokeWidth={cell * 0.9}/>
      <rect x={cell * 2} y={cell * 2} width={cell * 3} height={cell * 3} rx={cell} fill="#0F1115"/>
    </g>
  );
  return (
    <div style={{background: '#fff', borderRadius: 18, padding: 16, lineHeight: 0}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Codice di collegamento ${code}`}>
        {moduli}
        <Finder r={0} c={0}/><Finder r={0} c={N - 7}/><Finder r={N - 7} c={0}/>
      </svg>
    </div>
  );
}

function CucinaCollega() {
  const [stato, setStato] = React.useState(() => window.byupMonitorStato(CC_SCHERMO_ID) || window.byupMonitorAnnuncia(CC_SCHERMO_ID));
  const [resta, setResta] = React.useState(0);

  React.useEffect(() => {
    const battito = () => {
      const s = window.byupMonitorStato(CC_SCHERMO_ID);
      // Nessuna richiesta viva: o non c'è mai stata, o il codice è scaduto e
      // se ne genera un altro. Se il collegamento è stato revocato, si
      // ricomincia da qui — è il caso 3.5 di P-134, e non richiede a nessuno
      // di accorgersene.
      if (!s) { setStato(window.byupMonitorAnnuncia(CC_SCHERMO_ID)); return; }
      setStato(s);
      setResta(s.stato === 'attesa' ? Math.max(0, Math.round((s.scade_at - Date.now()) / 1000)) : 0);
    };
    battito();
    const t = setInterval(battito, 1000);
    window.addEventListener('storage', battito);
    window.addEventListener('byup-monitor-richieste', battito);
    return () => { clearInterval(t); window.removeEventListener('storage', battito); window.removeEventListener('byup-monitor-richieste', battito); };
  }, []);

  if (stato && stato.stato === 'approvato') {
    const m = stato.monitor || {};
    return (
      <div data-cucina-collega="approvato" style={{textAlign: 'center', maxWidth: 720}}>
        <div style={{width: 84, height: 84, borderRadius: '50%', background: '#16A34A', margin: '0 auto 22px', display: 'grid', placeItems: 'center'}}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
        </div>
        <div style={{fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: -0.8}}>Collegato</div>
        <div style={{fontSize: 'clamp(17px, 2vw, 22px)', color: '#9CA3AF', marginTop: 10, lineHeight: 1.5}}>
          Questo schermo è <b style={{color: '#F5F6F8'}}>{m.nome}</b>, con la visualizzazione {m.vista === 'pub' ? 'Pub' : 'Ristorante'}.
          Resta collegato finché non lo disconnetti dal gestionale.
        </div>
        <a href="byup Cucina KDS v2.html" style={{
          display: 'inline-flex', marginTop: 28, padding: '16px 30px', borderRadius: 14,
          background: '#F5F6F8', color: '#0F1115', fontSize: 20, fontWeight: 700, textDecoration: 'none',
        }}>Apri la cucina</a>
      </div>
    );
  }

  const code = stato ? stato.code : '';
  return (
    <div data-cucina-collega="attesa" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, maxWidth: 860}}>
      <div style={{textAlign: 'center'}}>
        <div style={{fontSize: 'clamp(26px, 3.6vw, 40px)', fontWeight: 800, letterSpacing: -0.8}}>Collega questo schermo</div>
        <div style={{fontSize: 'clamp(16px, 1.9vw, 21px)', color: '#9CA3AF', marginTop: 10, lineHeight: 1.5}}>
          Inquadra il codice con il telefono, oppure scrivi il codice qui sotto nel gestionale, in Impostazioni → Personale.
        </div>
      </div>

      <CcQr code={code} size={260}/>

      <div style={{textAlign: 'center'}}>
        <div style={{
          fontSize: 'clamp(48px, 9vw, 104px)', fontWeight: 800, letterSpacing: 'clamp(6px, 1.4vw, 16px)',
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', lineHeight: 1,
        }}>{code}</div>
        <div style={{fontSize: 'clamp(14px, 1.6vw, 18px)', color: '#6B7280', marginTop: 14}}>
          {/* Il codice scade, e si vede: chi lo sta dettando al telefono deve
              sapere se sta ancora dettando quello giusto. */}
          Il codice cambia fra {Math.floor(resta / 60)}:{String(resta % 60).padStart(2, '0')} · lo approva il titolare
        </div>
      </div>

      <div style={{fontSize: 'clamp(12px, 1.3vw, 15px)', color: '#4B5563', textAlign: 'center', maxWidth: 620, lineHeight: 1.6}}>
        Il collegamento vale per questo schermo e dura finché non lo togli dal gestionale.
        Prototipo: le due pagine si parlano dentro questo browser — {ccUrlConferma(code).split('?')[0].split('/').pop()}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CucinaCollega/>);
