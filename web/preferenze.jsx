// Centro delle preferenze (P-193 · D-153)
//
// Ci si arriva dal «Disiscriviti» in fondo a un'email o dal rimando di un SMS,
// senza fare accesso: il collegamento porta con sé il recapito (nel prodotto
// firmato e a scadenza; qui è un parametro, ?r=…). Chi apre questa pagina di
// solito vuole una cosa sola — smettere — e gliela si mette davanti, non in
// fondo a un modulo. Le altre scelte servono a chi invece vuole restare
// ricevendo meno: sono poche, in italiano, e non nominano mai un'automazione.
const { useState } = React;

const PREF_KEY = 'byup_preferenze_contatto';

const leggiPreferenze = () => {
  try { const s = localStorage.getItem(PREF_KEY); return s ? JSON.parse(s) : null; }
  catch (e) { return null; }
};
const scriviPreferenze = (v) => {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(v)); } catch (e) {}
};

// Il recapito arriva dal collegamento. Senza, la pagina non finge di sapere
// chi sei: lo dice, e resta consultabile.
function recapitoDalLink() {
  try {
    const r = new URLSearchParams(window.location.search).get('r');
    if (r) return r;
  } catch (e) {}
  return null;
}

function Interruttore({ acceso, onCambia, titolo, nota }) {
  return (
    <div className="riga">
      <div className="testo">
        <div className="titolo">{titolo}</div>
        {nota && <div className="nota">{nota}</div>}
      </div>
      <button className="sw" role="switch" aria-checked={acceso ? 'true' : 'false'}
        aria-label={titolo} onClick={() => onCambia(!acceso)}><i/></button>
    </div>
  );
}

const FREQUENZE = [
  { id: 'sempre',      label: 'Quando c\'è qualcosa' },
  { id: 'settimanale', label: 'Al massimo una a settimana' },
  { id: 'mensile',     label: 'Al massimo una al mese' },
];

function CentroPreferenze() {
  const recapito = recapitoDalLink();
  const salvate = leggiPreferenze();
  const [p, setP] = useState(salvate || {
    novita: true, promozioni: true,
    email: true, sms: false, push: true,
    frequenza: 'sempre',
  });
  const [stop, setStop] = useState(!!(salvate && salvate.stop));
  const [fatto, setFatto] = useState(null); // null | 'salvato' | 'stop'

  const set = (k, v) => { setP(x => ({ ...x, [k]: v })); setFatto(null); };
  const salva = () => {
    scriviPreferenze({ ...p, stop: false });
    setStop(false);
    setFatto('salvato');
  };
  const fermaTutto = () => {
    scriviPreferenze({ novita: false, promozioni: false, email: false, sms: false, push: false, frequenza: p.frequenza, stop: true });
    setStop(true);
    setFatto('stop');
  };

  return (
    <React.Fragment>
      <div className="marchio"><span>byup</span></div>
      <h1>Le tue preferenze</h1>
      <p className="sotto">
        {recapito
          ? <>Decidi che cosa ricevere all'indirizzo <span className="recapito">{recapito}</span>. Le modifiche valgono da subito.</>
          : <>Decidi che cosa ricevere da byup. Apri questa pagina dal collegamento in fondo a una nostra email per riconoscere il tuo recapito.</>}
      </p>

      {stop && (
        <div className="esito" style={{ background: '#FDECEA', color: '#B3261E' }}>
          Non ti scriviamo più su questo recapito. Se cambi idea, riaccendi qui sotto quello che vuoi ricevere e salva.
        </div>
      )}

      <div className="card">
        <h2>Che cosa ricevi</h2>
        <Interruttore acceso={p.novita} onCambia={v => set('novita', v)}
          titolo="Novità" nota="Quello che cambia nell'app e nei locali che segui."/>
        <Interruttore acceso={p.promozioni} onCambia={v => set('promozioni', v)}
          titolo="Promozioni" nota="Offerte dei locali e iniziative byup."/>
      </div>

      <div className="card">
        <h2>Dove</h2>
        <Interruttore acceso={p.email} onCambia={v => set('email', v)} titolo="Email"/>
        <Interruttore acceso={p.sms} onCambia={v => set('sms', v)} titolo="SMS"/>
        <Interruttore acceso={p.push} onCambia={v => set('push', v)} titolo="Notifiche sul telefono" nota="Solo se hai l'app installata."/>
      </div>

      <div className="card">
        <h2>Quanto spesso</h2>
        <div className="freq">
          {FREQUENZE.map(f => (
            <button key={f.id} aria-pressed={p.frequenza === f.id ? 'true' : 'false'}
              onClick={() => set('frequenza', f.id)}>{f.label}</button>
          ))}
        </div>
      </div>

      <button className="salva" onClick={salva} disabled={fatto === 'salvato'}>
        {fatto === 'salvato' ? '✓ Preferenze salvate' : 'Salva le preferenze'}
      </button>

      {/* La richiesta più frequente, con la sua evidenza: chi arriva qui per
          smettere non deve cercare. Non è nascosto in una riga di testo. */}
      <button className="stop" onClick={fermaTutto} aria-pressed={stop ? 'true' : 'false'}>
        Non voglio più ricevere niente
      </button>

      {fatto === 'stop' && (
        <div className="esito">
          Fatto: da adesso questo recapito non riceve più nulla, da nessuna campagna.
        </div>
      )}

      <div className="piede">
        Le comunicazioni di servizio — un ordine, una prenotazione, una ricevuta — arrivano comunque:
        non sono marketing e non si spengono da qui.
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CentroPreferenze/>);
