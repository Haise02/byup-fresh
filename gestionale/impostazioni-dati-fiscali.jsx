// Impostazioni → Dati fiscali locale (anagrafica per scontrini + collegamento
// all'Agenzia delle Entrate — le credenziali Fisconline con cui trasmette il canale)

// ─── Collegamento all'Agenzia delle Entrate (PT §12.2) ─────────────────────
// Il canale "documento commerciale online" (via OpenAPI) trasmette con le
// credenziali Fisconline dell'esercente, e la password scade ogni novanta
// giorni: quando scade, gli scontrini smettono di partire. Tre presidi:
//   1. promemoria progressivo prima della scadenza (14, 7 e 3 giorni);
//   2. avviso bloccante alla scadenza — qui e in Contabilità → Cassa — con le
//      istruzioni nell'ordine giusto: PRIMA si cambia la password sul sito
//      dell'Agenzia, POI la si inserisce in Byup;
//   3. verifica immediata all'inserimento, con una chiamata di prova al canale.
// Il canale espone anche l'evento di richiamata `receipt-credentials`: in
// produzione va sottoscritto come innesco del promemoria. È roba di backend:
// nel prototipo resta documentato qui, non si simula.
// Lo stato vive in localStorage — stessa chiave letta dalla Cassa per l'avviso
// bloccante. Senza nulla di salvato l'ultimo rinnovo è di novanta giorni fa
// (derivato a runtime, mai date a mano): la password risulta scaduta oggi e il
// giro completo — scaduta → rinnovo → verifica → attiva — si prova da qui.
const ADE_CRED_KEY = 'byup_ade_cred';
const ADE_CRED_VITA = 90;             // vita della password Fisconline, in giorni
const ADE_CRED_SOGLIE = [14, 7, 3];   // i gradini del promemoria progressivo

function adeCredStato() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(ADE_CRED_KEY)); } catch (e) {}
  const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
  const rinnovo = s && s.rinnovo ? new Date(s.rinnovo + 'T00:00:00') : (() => {
    const d = new Date(oggi); d.setDate(d.getDate() - ADE_CRED_VITA); return d;
  })();
  const scadenza = new Date(rinnovo); scadenza.setDate(scadenza.getDate() + ADE_CRED_VITA);
  const giorni = Math.round((scadenza - oggi) / 86400000);
  return {
    giorni,
    scadenza: scadenza.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }),
    verificata: (s && s.verificata) || null,
    stato: giorni <= 0 ? 'scaduta' : (giorni <= ADE_CRED_SOGLIE[0] ? 'promemoria' : 'ok'),
  };
}

// Per la società gli scontrini li trasmette l'incaricato di Byup: qui non c'è
// niente da inserire, solo da sapere — chi è, quando Byup ha rinnovato la sua
// password e quando la rinnoverà. Il registro è byup_incaricati (tokens), lo
// scrive Hubble. Se la password è scaduta gli scontrini non partono, come per
// la ditta, ma la cura è di Byup: al locale si dice, non si chiede.
function AdeIncaricatoCard() {
  const [, forza] = React.useState(0);
  React.useEffect(() => {
    const ri = () => forza(x => x + 1);
    window.addEventListener('byup-incaricati-change', ri);
    return () => window.removeEventListener('byup-incaricati-change', ri);
  }, []);
  const locale = window.byupReadLocale ? byupReadLocale() : { id: 'cp' };
  const inc = window.pnIncaricatoDelLocale ? pnIncaricatoDelLocale(locale.id) : null;
  if (!inc) return null;
  const st = pnIncaricatoStato(inc);
  const scaduta = st.stato === 'scaduta';
  const promemoria = st.stato === 'promemoria';
  const colore = scaduta ? '#991B1B' : promemoria ? PN.AMBER : PN.GREEN;
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 14, padding: '14px 18px', borderRadius: 12, marginBottom: 18,
      background: scaduta ? '#FEF2F2' : promemoria ? PN.AMBER_SOFT : '#F0FDF4',
      border: `1.5px solid ${scaduta ? '#FECACA' : promemoria ? '#FCD34D' : PN.GREEN_SOFT}`,
    }}>
      <div style={{width: 40, height: 40, borderRadius: 10, background: scaduta ? PN.RED : promemoria ? PN.AMBER : PN.GREEN, display:'grid', placeItems:'center', flexShrink: 0}}>
        {scaduta || promemoria ? <BuIcons.alert size={18} color={PN.WHITE}/> : BuIcons.check({size: 18, color: PN.WHITE})}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 16, fontWeight: 700, color: colore}}>
          {scaduta ? 'La password dell\'incaricato è scaduta: gli scontrini non partono'
            : promemoria ? `Gli scontrini li trasmette Byup · la password dell'incaricato scade tra ${st.giorni} giorni`
            : 'Gli scontrini li trasmette Byup, con il suo incaricato'}
        </div>
        <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2, lineHeight: 1.5}}>
          Incaricato <b style={{color: PN.TEXT}}>{inc.nome}</b> · {inc.ruolo} · password rinnovata il {st.rinnovoTesto}, vale fino al {st.scadenza}.
          {scaduta ? ' Byup la sta rinnovando: non devi fare nulla. Se dura più di un\'ora, scrivi al Supporto.'
            : ' La rinnova Byup prima della scadenza: tu non devi fare nulla.'}
        </div>
      </div>
    </div>
  );
}

function AdeCredenzialiCard() {
  const [, forza] = React.useState(0);
  const cred = adeCredStato();
  const [pwd, setPwd] = React.useState('');
  const [fase, setFase] = React.useState('idle');   // idle | verifica | errore
  const [tentativi, setTentativi] = React.useState(0);

  // "Verifica e salva" non si fida sulla parola: fa una chiamata di prova al
  // canale, come la verifica della delega nell'onboarding. Il primo giro
  // finisce in errore — è il caso vero: chi incolla la vecchia password, o non
  // l'ha ancora cambiata sul sito dell'Agenzia, deve saperlo subito e non al
  // primo scontrino rifiutato.
  const verifica = () => {
    if (!pwd.trim() || fase === 'verifica') return;
    setFase('verifica');
    const t = tentativi + 1;
    setTentativi(t);
    setTimeout(() => {
      if (t === 1) { setFase('errore'); return; }
      const d = new Date();
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const ts = `${d.toLocaleDateString('it-IT')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      try { localStorage.setItem(ADE_CRED_KEY, JSON.stringify({ rinnovo: iso, verificata: ts })); } catch (e) {}
      setPwd(''); setFase('idle');
      forza(x => x + 1);
    }, 1600);
  };

  // Collegamento attivo: la card si fa quieta e dice solo le due cose utili —
  // fino a quando vale, e che il promemoria arriverà da solo.
  if (cred.stato === 'ok') {
    return (
      <div style={{
        display:'flex', alignItems:'center', gap: 14,
        padding: '14px 18px',
        background: '#F0FDF4', border: `1.5px solid ${PN.GREEN_SOFT}`,
        borderRadius: 12, marginBottom: 18,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: PN.GREEN,
          display:'grid', placeItems:'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PN.WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>
          </svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:16, fontWeight:700, color: PN.GREEN}}>
            Collegamento all'Agenzia delle Entrate attivo
          </div>
          <div style={{fontSize:14, color: PN.MUTED, marginTop: 2}}>
            Password Fisconline verificata{cred.verificata ? ` il ${cred.verificata}` : ''} con una trasmissione di prova · scade il {cred.scadenza} (tra {cred.giorni} giorni). Ti avvisiamo qui e in cassa a 14, 7 e 3 giorni dalla scadenza.
          </div>
        </div>
      </div>
    );
  }

  const scaduta = cred.stato === 'scaduta';
  const C_TITLE = scaduta ? '#991B1B' : PN.AMBER;
  return (
    <div style={{
      padding: '16px 18px',
      background: scaduta ? '#FEF2F2' : PN.AMBER_SOFT,
      border: `1.5px solid ${scaduta ? '#FECACA' : '#FCD34D'}`,
      borderRadius: 12, marginBottom: 18,
    }}>
      <style>{`@keyframes adeCredSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{display:'flex', alignItems:'flex-start', gap: 14}}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: scaduta ? PN.RED : PN.AMBER, color: PN.WHITE,
          display:'grid', placeItems:'center', flexShrink: 0,
        }}><BuIcons.alert size={18} color={PN.WHITE}/></div>
        <div style={{flex:1, minWidth: 0}}>
          <div style={{fontSize:16, fontWeight:700, color: C_TITLE}}>
            {scaduta
              ? 'La password Fisconline è scaduta: gli scontrini non partono'
              : cred.giorni === 1
                ? 'La password Fisconline scade domani'
                : `La password Fisconline scade tra ${cred.giorni} giorni`}
          </div>
          <div style={{fontSize:14, color: PN.MUTED, marginTop: 2, lineHeight: 1.5}}>
            {scaduta
              ? 'La trasmissione all\'Agenzia usa le tue credenziali Fisconline, e la password scade ogni novanta giorni: da quando è scaduta ogni invio viene rifiutato. Rinnovala con i due passi qui sotto, nell\'ordine.'
              : `Scade il ${cred.scadenza}. La trasmissione all'Agenzia usa le tue credenziali Fisconline: rinnovala prima, con i due passi qui sotto nell'ordine, o gli scontrini smetteranno di partire.`}
          </div>

          {/* I due passi: l'ordine è il contenuto. La password nuova nasce sul
              portale dell'Agenzia; qui si inserisce solo dopo. */}
          <div style={{marginTop: 12, display:'flex', flexDirection:'column', gap: 8}}>
            <div style={{display:'flex', gap: 10, alignItems:'baseline'}}>
              <span style={{
                width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                background: C_TITLE, color: PN.WHITE,
                display:'inline-grid', placeItems:'center', fontSize: 12, fontWeight: 700,
                transform:'translateY(3px)',
              }}>1</span>
              <span style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
                Cambia la password nell'<a href="https://www.agenziaentrate.gov.it/portale/area-riservata" target="_blank" rel="noopener" style={{color: C_TITLE, fontWeight: 600}}>area riservata dell'Agenzia delle Entrate</a> (Fisconline).
              </span>
            </div>
            <div style={{display:'flex', gap: 10, alignItems:'baseline'}}>
              <span style={{
                width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                background: C_TITLE, color: PN.WHITE,
                display:'inline-grid', placeItems:'center', fontSize: 12, fontWeight: 700,
                transform:'translateY(3px)',
              }}>2</span>
              <span style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
                Inserisci qui la nuova password: alla conferma facciamo subito una trasmissione di prova per verificarla.
              </span>
            </div>
          </div>

          <div style={{display:'flex', gap: 10, alignItems:'flex-end', marginTop: 14, flexWrap:'wrap'}}>
            <div style={{flex:'1 1 220px', maxWidth: 320}}>
              <ImpField label="Nuova password Fisconline" style={{marginBottom: 0}}>
                <ImpInput type="password" value={pwd} placeholder="••••••••••"
                  onChange={e => { setPwd(e.target.value); if (fase === 'errore') setFase('idle'); }}/>
              </ImpField>
            </div>
            <button onClick={verifica} className="pn-btn-feedback" style={{
              padding:'10px 22px', borderRadius: 999,
              background: '#1A1A1A', color: PN.WHITE,
              border:'none', cursor: fase === 'verifica' ? 'default' : 'pointer', fontFamily:'inherit',
              fontSize: 15, fontWeight: 600,
              display:'inline-flex', alignItems:'center', gap: 8,
              opacity: pwd.trim() || fase === 'verifica' ? 1 : 0.45,
            }}>
              {fase === 'verifica' && (
                <span style={{
                  width: 12, height: 12, borderRadius: 999, flexShrink: 0,
                  border: '1.5px solid rgba(255,255,255,0.35)', borderTopColor: PN.WHITE,
                  animation: 'adeCredSpin 0.7s linear infinite',
                }}/>
              )}
              {fase === 'verifica' ? 'Trasmissione di prova…' : 'Verifica e salva'}
            </button>
          </div>

          {fase === 'errore' && (
            <div style={{
              marginTop: 10, padding: '10px 13px',
              background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.22)',
              borderRadius: 9, fontSize: 13.5, color: '#991B1B', lineHeight: 1.5,
            }}>
              <b style={{fontWeight: 700}}>La trasmissione di prova è stata rifiutata: la password non risulta valida.</b>{' '}
              Ricontrolla di averla cambiata prima sul sito dell'Agenzia e di averla copiata per intero, poi riprova.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Forma giuridica (P-86 · ERD v11, tenant_identity FISC-01) ─────────────
// legal_form ammette quattro valori: societa, ditta_individuale,
// professionista, ente — e i campi seguono la forma. Per ditta individuale e
// professionista sono obbligatori i dati della persona fisica: nome, cognome,
// data di nascita, luogo di nascita in DUE campi (comune + Stato, ISO 3166-1
// alpha-2) e codice fiscale del titolare, distinto dalla P.IVA; la parte
// societaria resta nulla. Per societa valgono denominazione e sede coi campi
// attuali (REA, CCIAA, capitale sociale con la sua valuta, socio unico). Per
// ente: denominazione e sede; REA e CCIAA facoltativi; niente capitale
// sociale né socio unico. La data di nascita è raccolta su obbligo legale e
// NON è riutilizzabile per altre finalità: non esce da questa schermata.
// L'onboarding ripete l'enumerazione in piccolo (onboarding-step2-locale.jsx):
// pagine diverse, una definizione a testa.
const FORME_GIURIDICHE = [
  { id: 'societa',           label: 'Società' },
  { id: 'ditta_individuale', label: 'Ditta individuale' },
  { id: 'ente',              label: 'Ente' },
];
// Lo Stato di nascita è ISO alpha-2: nel prototipo bastano i più ricorrenti.
const STATI_NASCITA = [
  ['IT','Italia'], ['RO','Romania'], ['AL','Albania'], ['MA','Marocco'],
  ['CN','Cina'], ['EG','Egitto'], ['BD','Bangladesh'], ['PE','Perù'],
  ['UA','Ucraina'], ['DE','Germania'], ['FR','Francia'], ['ES','Spagna'],
];

// ─── Il banner del cambio di titolarità (P-62 · D-52) ──────────────────────
// Legge il registro condiviso (byup_holder_change, panoramica-tokens.jsx).
// Se c'è un cambiamento con catena fiscale e identità verificata, chiede di
// aggiornare i dati fiscali; segnando la tappa la P.IVA precedente si
// CONSERVA accanto alla nuova, mai sovrascritta: i documenti già emessi la
// portano e devono restare leggibili. Per holder_person cambia solo il
// legale rappresentante, il soggetto resta. Coda registrata: la P.IVA di
// fatturazione dell'account (ACC_DATI) non si aggiorna da qui.
// ─── Collegamento POS all'Agenzia delle Entrate (P-105 · FISC-03) ──────────
// Il registro, la finestra, gli stati e il perché stanno in
// panoramica-tokens.jsx (byup_pos_censimento). Qui c'è l'assistente: l'elenco
// degli strumenti con lo stato e il promemoria, e per ciascuno il foglio
// precompilato — i campi coi nomi e nell'ordine del portale, un tasto di
// copia per valore — i passi in ordine, e la chiusura, che è una spunta:
// «Ho completato la comunicazione», con data e autore. È un'autodichiarazione
// e resta tale: «dichiarato», mai «verificato».
//
// Nel foglio non c'è l'indirizzo della sede: il Manuale del portale lo chiede
// per il registratore telematico, ma con la procedura «Documento Commerciale
// on line» il collegamento associa lo strumento alla procedura e nient'altro
// (nota v0.14). Lo strumento di certificazione da scegliere sul portale è
// quella procedura, che è il canale con cui Byup trasmette (openapi_channel).
const POS_PORTALE = 'https://ivaservizi.agenziaentrate.gov.it/portale/';
// Il passo zero è un prerequisito, non un passo: il menù «Collegamento
// dispositivi – POS» compare solo a chi è accreditato come esercente
// (FAQ AdE n. 28), e la delega data a Byup non lo sostituisce — accredita
// l'intermediario, non lui.
const POS_PASSO_ZERO = 'Prima di tutto devi essere accreditato come esercente su Fatture e Corrispettivi (Corrispettivi → Gestore ed Esercente → Accreditati). Senza, il menù del collegamento non compare. La delega che hai dato a Byup non basta: riguarda l\'intermediario, non il tuo accreditamento.';
const POS_PASSI = [
  'Accedi a Fatture e Corrispettivi con SPID, CIE o CNS.',
  'Vai su Corrispettivi e scegli «Vai a Corrispettivi».',
  'Nel riquadro Gestore ed Esercente scegli «Accedi ai servizi».',
  'Nel menù a sinistra apri «Collegamento dispositivi – POS», poi «Gestione collegamenti».',
  'Come strumento di certificazione scegli la procedura web «Documento Commerciale on line»: è il canale con cui Byup trasmette i tuoi scontrini, non un registratore.',
  'Se lo strumento non è in elenco scegli «Aggiungi nuovo POS»: cerca l\'acquirer col codice fiscale qui sotto, e se non c\'è usa «Aggiungi nuovo Acquirer». Incolla i campi del foglio, nell\'ordine in cui li trovi, e salva.',
  'Scegli «Collega». Poi torna qui e segna che l\'hai fatto.',
];

// Il foglio, campo per campo, coi nomi esatti del portale. Per il POS
// virtuale il Terminal id è dichiarato aperto: la prassi Stripe lo dice
// «non applicabile», il modulo del portale lo segna obbligatorio, e le fonti
// non dicono cosa metterci.
function posFoglio(r) {
  const nat = PN_POS_NATURE[r.nature] || PN_POS_NATURE.tap_to_pay;
  const virtuale = r.nature === 'virtual';
  return [
    { campo: 'Tipo POS', valore: nat.tipoPos, copia: true },
    virtuale
      ? { campo: 'Terminal id', valore: 'Non applicabile a un POS online', copia: false, aperto: true,
          nota: 'Così dice la prassi Stripe (marzo 2026). Il modulo del portale lo segna però obbligatorio: cosa inserire è un punto aperto, e te lo diciamo invece di inventarlo.' }
      : { campo: 'Terminal id', valore: r.identifier, copia: true, mono: true,
          nota: `Numero di serie del lettore, letto dall'interfaccia Stripe (Terminal → Lettori) con l'intestazione dell'account ${PN_POS_ACCOUNT}.` },
    { campo: 'Acquirer Italiano/Estero', valore: PN_POS_ACQUIRER.estero ? 'Estero' : 'Italiano', copia: true },
    { campo: 'CF Acquirer', valore: PN_POS_ACQUIRER.cf, copia: true, mono: true },
    { campo: 'Denominazione Acquirer', valore: PN_POS_ACQUIRER.denominazione, copia: true },
    { campo: 'Numero contratto di convenzionamento', valore: PN_POS_ACCOUNT, copia: true, mono: true,
      nota: 'È l\'identificativo del tuo account Stripe connesso. Altrove nel gestionale lo vedi mascherato: qui è per intero perché va incollato così.' },
  ];
}

const POS_TONI = {
  ok:      { colore: PN.GREEN, sfondo: PN.GREEN_SOFT, bordo: PN.GREEN_SOFT },
  lontana: { colore: PN.MUTED, sfondo: '#F1F3F5',     bordo: PN.BORDER_SOFT },
  aperta:  { colore: PN.AMBER, sfondo: PN.AMBER_SOFT, bordo: '#FCD34D' },
  ultimi:  { colore: PN.AMBER, sfondo: PN.AMBER_SOFT, bordo: '#FCD34D' },
  scaduta: { colore: '#991B1B', sfondo: '#FEF2F2',    bordo: '#FECACA' },
};

function PosCopia({ valore }) {
  const [fatto, setFatto] = React.useState(false);
  const copia = () => {
    const scrivi = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(valore) : Promise.reject();
    scrivi.catch(() => {}).then(() => { setFatto(true); setTimeout(() => setFatto(false), 1600); });
  };
  return (
    <button onClick={copia} className="pn-btn-feedback" style={{
      display:'inline-flex', alignItems:'center', gap: 5, flexShrink: 0,
      padding:'5px 10px', borderRadius: 8, cursor:'pointer', fontFamily:'inherit',
      background: fatto ? PN.GREEN_SOFT : PN.WHITE, color: fatto ? PN.GREEN : PN.TEXT,
      border: `1px solid ${fatto ? PN.GREEN_SOFT : PN.BORDER}`, fontSize: 13, fontWeight: 600,
    }}>
      {fatto ? BuIcons.check({size: 13, color:'currentColor'}) : BuIcons.copy({size: 13, color:'currentColor'})}
      {fatto ? 'Copiato' : 'Copia'}
    </button>
  );
}

function PosStrumento({ r, aperto, onApri }) {
  const p = pnPosPromemoria(r);
  const tono = POS_TONI[p.fase];
  const stato = PN_POS_STATI[r.fiscal_link_status] || PN_POS_STATI.pending_census;
  const nat = PN_POS_NATURE[r.nature] || PN_POS_NATURE.tap_to_pay;
  const virtuale = r.nature === 'virtual';
  const dichiarato = r.fiscal_link_status === 'linked';
  const dismesso = r.fiscal_link_status === 'unlinked';
  const foglio = posFoglio(r);
  const oraLocale = () => { const d = new Date(); return `${d.toLocaleDateString('it-IT')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
  void oraLocale;
  return (
    <div style={{ border: `1px solid ${aperto ? PN.BORDER : PN.BORDER_SOFT}`, borderRadius: 12, background: PN.WHITE, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap: 14, padding: '13px 16px' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11, flexShrink: 0,
          background: virtuale ? '#635BFF' : '#F4F5F7', color: virtuale ? PN.WHITE : PN.TEXT,
          display:'grid', placeItems:'center', fontSize: virtuale ? 20 : 22, fontWeight: 800,
          opacity: dismesso ? 0.6 : 1,
        }}>{virtuale ? 'S' : '📱'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8, flexWrap:'wrap' }}>
            <span style={{ fontSize: 15.5, fontWeight: 700, color: PN.TEXT }}>{r.name}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: PN.MUTED, padding:'1px 7px', borderRadius: 999, background: '#F4F5F7' }}>{nat.label}</span>
            {dismesso && <span style={{ fontSize: 12.5, fontWeight: 600, color: PN.MUTED }}>scollegato da Byup Staff</span>}
          </div>
          <div style={{ fontSize: 13.5, color: PN.MUTED, marginTop: 2, fontFamily: 'ui-monospace, Menlo, monospace' }}>
            {virtuale ? 'acct_••••dE3v' : r.identifier}{r.user ? <span style={{ fontFamily:'inherit' }}> · {r.user}</span> : ''}
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink: 0 }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap: 5, padding:'3px 10px', borderRadius: 999,
            background: tono.sfondo, color: tono.colore, fontSize: 13, fontWeight: 700,
          }}>
            <span style={{ width: 6, height: 6, borderRadius:'50%', background: tono.colore }}/>
            {stato.label}
          </span>
          <div style={{ fontSize: 13, color: p.fase === 'ok' || p.fase === 'lontana' ? PN.MUTED : tono.colore, marginTop: 4, fontWeight: p.fase === 'scaduta' || p.fase === 'ultimi' ? 700 : 500 }}>{p.testo}</div>
        </div>
        <ImpButton variant="ghost" onClick={onApri} style={{ flexShrink: 0 }}>{aperto ? 'Chiudi' : (dichiarato ? 'Rivedi il foglio' : 'Apri il foglio')}</ImpButton>
      </div>

      {aperto && (
        <div style={{ borderTop: `1px solid ${PN.BORDER_SOFT}`, padding: '16px 16px 18px', background: '#FAFBFC' }}>
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0, 1fr) minmax(0, 1fr)', gap: 18, alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: PN.TEXT, marginBottom: 8 }}>Il foglio da incollare</div>
              <div style={{ border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, background: PN.WHITE }}>
                {foglio.map((f, i) => (
                  <div key={f.campo} style={{ padding: '10px 12px', borderTop: i ? `1px solid ${PN.BORDER_SOFT}` : 'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: PN.MUTED }}>{f.campo}</div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: f.aperto ? PN.AMBER : PN.TEXT, fontFamily: f.mono ? 'ui-monospace, Menlo, monospace' : 'inherit', wordBreak:'break-all' }}>{f.valore}</div>
                      </div>
                      {f.copia && <PosCopia valore={f.valore}/>}
                    </div>
                    {f.nota && <div style={{ fontSize: 13, color: f.aperto ? PN.AMBER : PN.MUTED, marginTop: 4, lineHeight: 1.45 }}>{f.nota}</div>}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: PN.MUTED, marginTop: 8, lineHeight: 1.45 }}>
                Nessun indirizzo della sede: con la procedura Documento Commerciale on line il collegamento associa lo strumento alla procedura e nient'altro.
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: PN.TEXT, marginBottom: 8 }}>Come si fa, sul portale</div>
              <div style={{ padding: '10px 12px', borderRadius: 10, background: PN.AMBER_SOFT, border: '1px solid #FCD34D', fontSize: 13.5, color: PN.TEXT, lineHeight: 1.45, marginBottom: 10 }}>
                <b>Passo zero.</b> {POS_PASSO_ZERO}
              </div>
              <ol style={{ margin: 0, paddingLeft: 20, display:'flex', flexDirection:'column', gap: 6 }}>
                {POS_PASSI.map((t, i) => <li key={i} style={{ fontSize: 14, color: PN.TEXT, lineHeight: 1.45 }}>{t}</li>)}
              </ol>
              <a href={POS_PORTALE} target="_blank" rel="noopener" style={{ display:'inline-flex', alignItems:'center', gap: 6, marginTop: 10, fontSize: 14, fontWeight: 600, color: PN.PINK_DARK, textDecoration:'none' }}>
                {BuIcons.link({size: 13, color:'currentColor'})} Apri Fatture e Corrispettivi
              </a>
            </div>
          </div>

          {/* La chiusura. Una spunta, un'autodichiarazione: Byup non la
              verifica e non la fa al posto suo. Togliere la spunta serve alla
              demo, per rifare il giro. */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${PN.BORDER_SOFT}`, display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap' }}>
            <label style={{ display:'inline-flex', alignItems:'center', gap: 9, fontSize: 15, fontWeight: 600, color: PN.TEXT, cursor:'pointer' }}>
              <input type="checkbox" checked={dichiarato}
                onChange={e => e.target.checked ? byupPosDichiara(r.id, PN_UTENTE.nome) : byupPosRitira(r.id)}
                style={{ width: 17, height: 17, accentColor: PN.PINK_DARK }}/>
              Ho completato la comunicazione
            </label>
            <span style={{ fontSize: 13.5, color: PN.MUTED }}>
              {dichiarato ? p.testo : 'È una tua dichiarazione: Byup la registra con data e nome, non la verifica e non la fa al posto tuo.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PosCensimentoCard() {
  const [lista, setLista] = React.useState(() => byupReadPosCensimento());
  const [aperto, setAperto] = React.useState(() => {
    try { return new URLSearchParams(window.location.search).get('strumento') || null; } catch (e) { return null; }
  });
  React.useEffect(() => {
    const agg = () => setLista(byupReadPosCensimento());
    window.addEventListener('byup-pos-censimento', agg);
    window.addEventListener('storage', agg);
    // Il rimando da Personale porta anche quale strumento aprire.
    const go = (e) => { const d = e.detail; if (d && typeof d === 'object' && d.strumento) setAperto(d.strumento); };
    window.addEventListener('byup-imp-goto', go);
    return () => { window.removeEventListener('byup-pos-censimento', agg); window.removeEventListener('storage', agg); window.removeEventListener('byup-imp-goto', go); };
  }, []);

  const scadute = lista.filter(r => pnPosPromemoria(r).fase === 'scaduta');
  const urgente = pnPosUrgente(lista);
  const fase = urgente ? urgente.p.fase : 'ok';
  const tono = POS_TONI[fase];
  // La striscia in testa parla solo quando c'è una scadenza aperta o
  // scaduta: «nessuna scadenza» e «tutto dichiarato» li dicono le righe.
  const striscia = fase === 'aperta' || fase === 'ultimi' || fase === 'scaduta';
  const testata = fase === 'ok'
    ? 'Tutti gli strumenti sono dichiarati all\'Agenzia. Se ne colleghi uno nuovo, o ne scolleghi uno, te lo diciamo qui.'
    : fase === 'scaduta'
      ? `${scadute.length === 1 ? `${urgente.r.name} ha` : `${scadute.length} strumenti hanno`} la comunicazione in ritardo: la finestra è scaduta, e la comunicazione omessa o tardiva è sanzionata.`
      : fase === 'ultimi'
        ? `La finestra di ${urgente.r.name} si chiude tra pochi giorni: ${urgente.p.testo.toLowerCase()}.`
        : fase === 'aperta'
          ? `La finestra è aperta: ${urgente.r.name}, ${urgente.p.testo.toLowerCase()}.`
          : `Nessuna scadenza aperta. ${urgente.r.name}: ${urgente.p.testo.toLowerCase()}.`;

  return (
    <ImpCard anchor="pos-censimento"
      title="Collegamento POS all'Agenzia delle Entrate"
      sub="Ogni strumento con cui incassi va collegato, dal tuo accesso al portale, alla procedura con cui Byup trasmette i tuoi scontrini. Byup non può farlo al posto tuo: prepara i dati esatti da incollare, i passi in ordine e il promemoria. Tu dichiari di averlo fatto.">
      {striscia && (
        <div style={{
          display:'flex', alignItems:'center', gap: 12, padding: '12px 14px', borderRadius: 11, marginBottom: 14,
          background: tono.sfondo, border: `1.5px solid ${tono.bordo}`,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: tono.colore, color: PN.WHITE, display:'grid', placeItems:'center', flexShrink: 0 }}>
            <BuIcons.alert size={16} color={PN.WHITE}/>
          </div>
          <div style={{ fontSize: 14.5, color: tono.colore, fontWeight: fase === 'scaduta' || fase === 'ultimi' ? 700 : 500, lineHeight: 1.45 }}>{testata}</div>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
        {lista.map(r => <PosStrumento key={r.id} r={r} aperto={aperto === r.id} onApri={() => setAperto(aperto === r.id ? null : r.id)}/>)}
      </div>
      <div style={{ fontSize: 13, color: PN.MUTED, marginTop: 12, lineHeight: 1.45 }}>
        La finestra va dal 6 all'ultimo giorno del secondo mese successivo a quello in cui lo strumento si attiva, e si riapre a ogni variazione: un lettore che cambia, uno che scolleghi. Il POS virtuale nasce col collegamento a Stripe; un lettore nasce con ogni smartphone collegato a Byup Staff.
      </div>
    </ImpCard>
  );
}

// Il campo che non si scrive: P.IVA e ragione sociale sono il soggetto
// fiscale, e il soggetto non cambia digitando — cambia col foglio «Cambia
// soggetto fiscale», che apre il percorso di titolarità (P-62 · D-52).
function ImpCampoBloccato({ label, value, hint }) {
  return (
    <ImpField label={label} hint={hint}>
      <div style={{
        display:'flex', alignItems:'center', gap: 8,
        padding:'10px 12px', borderRadius: 9, border:`1px solid ${PN.BORDER_SOFT}`,
        background:'#F7F8FA', color: PN.TEXT, fontSize: 15.5, fontWeight: 500,
      }}>
        <span style={{flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{value || '—'}</span>
        <span style={{color: PN.MUTED, display:'inline-flex'}}>{BuIcons.lock({size: 14, color:'currentColor'})}</span>
      </div>
    </ImpField>
  );
}

// Validazione formale, e solo quella: IT più undici cifre. Non c'è nessuna
// «verifica AdE» — quella che stava qui prima si accendeva alla tredicesima
// lettera, e diceva una cosa falsa.
const pivaFormale = (v) => /^IT\d{11}$/.test((v || '').replace(/\s/g, '').toUpperCase());

// ─── Il foglio del soggetto fiscale (P-62 · D-52) ──────────────────────────
// Anagrafica e dati per fatturazione in un foglio solo, adattati alla forma
// giuridica. Se cambiano P.IVA o forma è un cambio di soggetto (legal_entity):
// il «Sicuro?» avverte, alla conferma i dati cambiano, Stripe si disabilita,
// i POS tornano da comunicare e si apre «Delega, Stripe e POS». Chi
// rappresenta il locale non si chiede qui: il titolare si cambia da Account,
// e quel cambio passa da questo stesso foglio per aggiornare l'anagrafica.
function ImpSoggettoFoglio({ data, onClose, onSalva, onApplica, onDopo }) {
  // Tutti i campi della card, prefilled: il foglio è l'unico editore dei dati
  // anagrafici. La catena fiscale non si sceglie e non si chiede: nasce se
  // cambiano P.IVA o forma giuridica — cioè il contribuente — e allora il
  // foglio pone l'unica domanda, «resta la stessa persona?». Se cambiano
  // solo insegna, regime, ATECO o i dati della persona, è un salvataggio.
  const [f, setF] = React.useState(() => ({
    legalForm: data.legalForm, ragione: data.ragione, piva: data.piva, cf: data.cf,
    ownerNome: data.ownerNome, ownerCognome: data.ownerCognome, ownerNascita: data.ownerNascita,
    ownerComuneNascita: data.ownerComuneNascita, ownerStatoNascita: data.ownerStatoNascita, ownerCf: data.ownerCf,
    insegna: data.insegna, regime: data.regime, ateco: data.ateco,
  }));
  const setC = (k) => (e) => setF(x => ({ ...x, [k]: e.target.value }));
  // I dati per fatturazione sono del soggetto, non del locale: REA e camera
  // di commercio sono l'iscrizione di QUELLA società, PEC e SDI il suo
  // recapito fiscale, la sede legale la sua. Se il soggetto cambia si
  // svuotano invece di ereditarsi — il REA della S.r.l. sulla S.p.A. sarebbe
  // un dato falso che sembra vero — e si compilano qui, per il nuovo.
  const FATT_VUOTI = { rea: '', cciaa: '', capitaleSociale: '', socioUnico: false, inLiquidazione: false, sdi: '', pec: '', sedeIndirizzo: '', sedeCap: '', sedeCitta: '', sedeProv: '', sedeNazione: 'IT' };
  const fattDaDati = () => ({ rea: data.rea, cciaa: data.cciaa, capitaleSociale: data.capitaleSociale, socioUnico: !!data.socioUnico, inLiquidazione: !!data.inLiquidazione, sdi: data.sdi, pec: data.pec, sedeIndirizzo: data.sedeIndirizzo, sedeCap: data.sedeCap, sedeCitta: data.sedeCitta, sedeProv: data.sedeProv, sedeNazione: data.sedeNazione || 'IT' });
  const [fatt, setFatt] = React.useState(fattDaDati);
  const setB = (k, check) => (e) => setFatt(x => ({ ...x, [k]: check ? e.target.checked : e.target.value }));
  const [chiedi, setChiedi] = React.useState(false);   // il «Sicuro?» prima del cambio
  // Il cambio del TITOLARE (da Account) passa da qui prima di tutto: i dati
  // anagrafici e per fatturazione si aggiornano al nuovo rappresentante, e
  // al salvataggio si apre «Delega e Stripe». Per la persona fisica nome e
  // cognome arrivano già compilati con chi entra.
  const c0 = window.byupReadHolderChange ? byupReadHolderChange() : null;
  const titolareInCorso = !!(c0 && c0.entrante && !c0.soggetto && c0.status !== 'refused' && c0.status !== 'completed');
  React.useEffect(() => {
    if (!titolareInCorso || !(f.legalForm === 'ditta_individuale')) return;
    const [nome, ...resto] = (c0.entrante.nome || '').split(' ');
    setF(x => ({ ...x, ownerNome: nome || x.ownerNome, ownerCognome: resto.join(' ') || x.ownerCognome, ownerCf: '' }));
  }, []);

  const persona = f.legalForm === 'ditta_individuale';
  const ente = f.legalForm === 'ente';
  const pivaPulita = (f.piva || '').replace(/\s/g, '').toUpperCase();
  const pivaOk = pivaFormale(pivaPulita);
  const cambiaSoggetto = pivaPulita !== data.piva || f.legalForm !== data.legalForm;
  React.useEffect(() => { setFatt(cambiaSoggetto ? FATT_VUOTI : fattDaDati()); }, [cambiaSoggetto]);
  const denominazione = persona ? `${f.ownerNome} ${f.ownerCognome}`.trim() : (f.ragione || '').trim();
  const pronto = pivaOk && denominazione;

  // Un cambio di soggetto non parte senza il «Sicuro?»: l'account Stripe è
  // intestato al soggetto di oggi e si disabilita, la delega va rifatta, e
  // fino ad allora niente scontrini né pagamenti. Il salvataggio semplice no.
  const avvia = () => {
    if (!pronto) return;
    const campi = { ...f, ...fatt, piva: pivaPulita };
    if (!cambiaSoggetto) {
      onSalva(campi);
      if (titolareInCorso) {
        // L'anagrafica è confermata: la tappa dei dati, se il tipo la
        // prevede, è fatta; poi tocca a delega e Stripe.
        const c = byupReadHolderChange(); c.steps.anagrafica_confermata = new Date().toISOString(); byupWriteHolderChange(c);
        if (pnHolderTappe(c.change_type, c.legal_form).includes('fiscal_updated') && !c.steps.fiscal_updated) byupHolderAvanza('fiscal_updated');
        onClose(); onDopo(); return;
      }
      onClose(); return;
    }
    setChiedi(true);
  };
  // Alla conferma i dati cambiano subito (tappa fiscal_updated) e Stripe si
  // disabilita; questo foglio si chiude e si apre quello dopo, «Delega e
  // Stripe» (ImpDopoSoggettoModal), con le due cose che restano.
  const avviaDavvero = () => {
    const campi = { ...f, ...fatt, piva: pivaPulita };
    setChiedi(false);
    byupStripeDisabilita('cambio_soggetto');
    // Il censimento dei POS è dell'esercente: il nuovo soggetto comunica di
    // nuovo tutti i suoi strumenti all'Agenzia (P-105, finestra riaperta).
    if (window.byupReadPosCensimento) byupReadPosCensimento().forEach(r => byupPosVaria(r.id, 'varied'));
    const now = new Date().toISOString();
    const record = {
      id: 'hc-' + Date.now(), change_type: 'legal_entity', fiscal_chain_impacted: true,
      legal_form: f.legalForm,
      status: 'proposed', proposed_by: 'Mario Rossi', created_at: now,
      steps: { proposed: now },
      entrante: null,
      soggetto: {
        prima: { denominazione: data.legalForm === 'ditta_individuale' ? `${data.ownerNome} ${data.ownerCognome}` : data.ragione, piva: data.piva },
        dopo: { denominazione, piva: pivaPulita, forma: f.legalForm, campi },
      },
    };
    byupWriteHolderChange(record);
    onApplica(record);
    byupHolderAvanza('fiscal_updated');
    onClose();
    onDopo();
  };

  // Compatto: tre colonne, campi bassi, intestazione stretta — il foglio deve
  // stare in una schermata senza scorrere, anche su un portatile.
  const LAB = { ...MODAL_LABEL, marginBottom: 4, fontSize: 12 };
  const INP = { ...MODAL_INPUT, padding: '8px 10px', fontSize: 14 };
  const campo = (label, k, extra = {}) => (
    <div style={{minWidth: 0}}>
      <div style={LAB}>{label}</div>
      <input value={f[k] || ''} onChange={setC(k)} {...extra} style={{...INP, ...(extra.style || {})}}/>
    </div>
  );
  const tre = { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 10 };
  const due = { display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 };

  return (
    <div onClick={onClose} style={{position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)', display:'grid', placeItems:'center', zIndex: 150, padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 1040, maxHeight:'calc(var(--pn-vh, 100vh) - 40px)', display:'flex', flexDirection:'column', position:'relative'}}>
        <div style={{...MODAL_HEAD, padding: '18px 24px 14px'}}>
          <div style={{...MODAL_TITLE, fontSize: 21}}>{titolareInCorso ? 'Cambia il titolare' : 'Cambia soggetto fiscale'}</div>
          <div style={{...MODAL_SUB, fontSize: 13.5, marginTop: 2}}>
            {titolareInCorso
              ? `Da ${c0.proposed_by || 'Mario Rossi'} a ${c0.entrante.nome}. Aggiorna qui i dati anagrafici e per fatturazione del locale: al salvataggio si passa a delega, Stripe e POS.`
              : 'Anagrafica e dati per fatturazione, insieme: la forma giuridica decide quali esistono. Se cambiano partita IVA o forma, cambia il soggetto fiscale: la P.IVA di oggi resta come precedente sui documenti già emessi.'}
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>

        <div className="pn-scroll" style={{...MODAL_BODY, padding: '16px 24px', overflowY:'auto', display:'flex', flexDirection:'column', gap: 10}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 22, alignItems:'start'}}>
            {/* Colonna 1: i dati anagrafici, adattati alla forma. */}
            <div style={{display:'flex', flexDirection:'column', gap: 10, minWidth: 0}}>
              <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>Dati anagrafici</div>
              <div style={due}>
                <div style={{minWidth: 0}}>
                  <div style={LAB}>Forma giuridica</div>
                  <select value={f.legalForm} onChange={setC('legalForm')} style={INP}>
                    {FORME_GIURIDICHE.map(x => <option key={x.id} value={x.id} disabled={x.id === 'ente'}>{x.id === 'ente' ? 'Ente o cooperativa · con la Soluzione Software' : x.label}</option>)}
                  </select>
                </div>
                {persona ? campo('Nome del titolare', 'ownerNome') : campo(ente ? 'Denominazione' : 'Ragione sociale', 'ragione')}
              </div>
              {persona ? (
                <React.Fragment>
                  <div style={due}>{campo('Cognome del titolare', 'ownerCognome')}{campo('Data di nascita', 'ownerNascita', { type: 'date' })}</div>
                  <div style={due}>
                    {campo('Comune di nascita', 'ownerComuneNascita')}
                    <div style={{minWidth: 0}}>
                      <div style={LAB}>Stato di nascita</div>
                      <select value={f.ownerStatoNascita} onChange={setC('ownerStatoNascita')} style={INP}>
                        {STATI_NASCITA.map(([cod, nome]) => <option key={cod} value={cod}>{nome} ({cod})</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={due}>
                    {campo('Codice fiscale del titolare', 'ownerCf', { style: { fontFamily:'ui-monospace, Menlo, monospace', letterSpacing: 0.5 } })}
                    <div style={{minWidth: 0}}>
                      <div style={LAB}>Partita IVA</div>
                      <input value={f.piva || ''} onChange={setC('piva')} placeholder="IT seguito da 11 cifre" style={{...INP, fontFamily:'ui-monospace, Menlo, monospace'}}/>
                    </div>
                  </div>
                </React.Fragment>
              ) : (
                <div style={due}>
                  <div style={{minWidth: 0}}>
                    <div style={LAB}>Partita IVA</div>
                    <input value={f.piva || ''} onChange={setC('piva')} placeholder="IT seguito da 11 cifre" style={{...INP, fontFamily:'ui-monospace, Menlo, monospace'}}/>
                  </div>
                  {campo('Codice fiscale', 'cf')}
                </div>
              )}
              <div style={due}>{campo('Insegna', 'insegna')}{campo('Codice ATECO', 'ateco')}</div>
              <div style={due}>
                <div style={{minWidth: 0}}>
                  <div style={LAB}>Regime fiscale</div>
                  <select value={f.regime} onChange={setC('regime')} style={INP}>
                    <option>Ordinario</option><option>Forfettario</option><option>Semplificato</option>
                  </select>
                </div>
                <div style={{alignSelf:'end', fontSize: 12.5, color: f.piva && !pivaOk ? PN.AMBER : PN.MUTED, lineHeight: 1.4, paddingBottom: 2}}>
                  {f.piva ? (pivaOk ? 'P.IVA: formato valido · nessuna verifica presso l\'Agenzia' : 'P.IVA: formato non valido, IT e undici cifre') : 'P.IVA: IT e undici cifre'}
                  {data.pivaPrecedente ? ` · precedente ${data.pivaPrecedente}, conservata` : ''}
                </div>
              </div>
            </div>

            {/* Colonna 2: i dati per fatturazione, del soggetto. Vuoti se il
                soggetto cambia: sono i suoi, non quelli di chi c'era prima. */}
            <div style={{display:'flex', flexDirection:'column', gap: 10, minWidth: 0}}>
              <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>
                Dati per fatturazione{cambiaSoggetto && <span style={{color: PN.AMBER, fontWeight: 600}}> · del nuovo soggetto, da compilare</span>}
              </div>
              {!persona && (
                <React.Fragment>
                  <div style={due}>
                    <div style={{minWidth: 0}}><div style={LAB}>Numero REA</div><input value={fatt.rea || ''} onChange={setB('rea')} style={INP}/></div>
                    <div style={{minWidth: 0}}><div style={LAB}>CCIAA{ente ? ' (facoltativa)' : ''}</div><input value={fatt.cciaa || ''} onChange={setB('cciaa')} style={INP}/></div>
                  </div>
                  <div style={due}>
                    {f.legalForm === 'societa'
                      ? <div style={{minWidth: 0}}><div style={LAB}>Capitale sociale (€)</div><input value={fatt.capitaleSociale || ''} onChange={setB('capitaleSociale')} style={INP}/></div>
                      : <div/>}
                    <div style={{display:'flex', gap: 14, alignItems:'center', alignSelf:'end', paddingBottom: 6, fontSize: 13.5}}>
                      {f.legalForm === 'societa' && <label style={{display:'inline-flex', alignItems:'center', gap: 6, cursor:'pointer'}}><input type="checkbox" checked={!!fatt.socioUnico} onChange={setB('socioUnico', true)} style={{accentColor: PN.PINK}}/>Socio unico</label>}
                      <label style={{display:'inline-flex', alignItems:'center', gap: 6, cursor:'pointer'}}><input type="checkbox" checked={!!fatt.inLiquidazione} onChange={setB('inLiquidazione', true)} style={{accentColor: PN.PINK}}/>In liquidazione</label>
                    </div>
                  </div>
                </React.Fragment>
              )}
              <div style={due}>
                <div style={{minWidth: 0}}><div style={LAB}>PEC</div><input value={fatt.pec || ''} onChange={setB('pec')} style={INP}/></div>
                <div style={{minWidth: 0}}>
                  <div style={LAB}>Codice destinatario</div>
                  <div style={{...INP, background:'#F7F8FA', color: PN.MUTED, fontFamily:'ui-monospace, Menlo, monospace', letterSpacing: 0.5}}>{window.PN_CODICE_DESTINATARIO}</div>
                  <div style={{fontSize: 12, color: PN.MUTED, marginTop: 3}}>È del canale, non del soggetto: si registra sul portale, non si scrive qui.</div>
                </div>
              </div>
              <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, marginTop: 2}}>{persona ? 'Domicilio fiscale' : 'Sede legale'}</div>
              <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 10}}>
                <div style={{minWidth: 0}}><div style={LAB}>Indirizzo e civico</div><input value={fatt.sedeIndirizzo || ''} onChange={setB('sedeIndirizzo')} style={INP}/></div>
                <div style={{minWidth: 0}}><div style={LAB}>CAP</div><input value={fatt.sedeCap || ''} onChange={setB('sedeCap')} style={INP}/></div>
              </div>
              <div style={tre}>
                <div style={{minWidth: 0}}><div style={LAB}>Città</div><input value={fatt.sedeCitta || ''} onChange={setB('sedeCitta')} style={INP}/></div>
                <div style={{minWidth: 0}}><div style={LAB}>Provincia</div><input value={fatt.sedeProv || ''} onChange={setB('sedeProv')} style={INP}/></div>
                <div style={{minWidth: 0}}>
                  <div style={LAB}>Nazione</div>
                  <select value={fatt.sedeNazione || 'IT'} onChange={setB('sedeNazione')} style={INP}>
                    <option value="IT">Italia (IT)</option><option value="SM">San Marino (SM)</option><option value="VA">Città del Vaticano (VA)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          {cambiaSoggetto && (
            <div style={{paddingTop: 8, borderTop: `1px solid ${PN.BORDER_SOFT}`}}>
              <div style={{fontSize: 13.5, color: PN.TEXT, lineHeight: 1.45}}>
                <b>Cambia il soggetto fiscale.</b> Da {data.legalForm === 'ditta_individuale' ? `${data.ownerNome} ${data.ownerCognome}` : data.ragione} ({data.piva}) a {denominazione || '…'} ({pivaPulita || '…'}): Stripe si disabilita, la delega va riconferita, i POS vanno comunicati di nuovo. Chi rappresenta il locale resta lo stesso: il titolare si cambia da Account.
              </div>
            </div>
          )}
        </div>

        {chiedi && (
          <div onClick={() => setChiedi(false)} style={{position:'absolute', inset: 0, background:'rgba(15,17,21,0.38)', display:'grid', placeItems:'center', zIndex: 5, borderRadius: 'inherit', padding: 20}}>
            <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 520, padding: '22px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.28)'}}>
              <div style={{fontSize: 21, fontWeight: 800, letterSpacing: -0.4, color: PN.TEXT}}>Sicuro?</div>
              <div style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.55, marginTop: 8}}>
                Il tuo collegamento a Stripe viene disabilitato e anche le deleghe dovranno essere rifatte: finché non le rifai non potrai emettere scontrini né ricevere pagamenti. Anche i POS andranno comunicati di nuovo all'Agenzia dal nuovo soggetto.
              </div>
              <div style={{fontSize: 13.5, color: PN.MUTED, lineHeight: 1.5, marginTop: 6}}>
                L'account Stripe è intestato a {data.legalForm === 'ditta_individuale' ? `${data.ownerNome} ${data.ownerCognome}` : data.ragione}: il nuovo soggetto ne apre uno suo, con la verifica di Stripe, da POS e integrazioni.
              </div>
              <div style={{display:'flex', gap: 10, justifyContent:'flex-end', marginTop: 18}}>
                <button onClick={() => setChiedi(false)} style={{padding:'9px 16px', borderRadius: 999, border:`1px solid ${PN.BORDER}`, background: PN.WHITE, fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
                <ImpButton variant="danger" onClick={avviaDavvero}>Sì, cambia il soggetto</ImpButton>
              </div>
            </div>
          </div>
        )}
        <div style={{...MODAL_FOOT, padding: '12px 24px'}}>
          <button onClick={onClose} style={{padding:'9px 16px', borderRadius: 999, border:`1px solid ${PN.BORDER}`, background: PN.WHITE, fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
          <span style={{flex: 1}}/>
          <button onClick={avvia} disabled={!pronto} style={{padding:'9px 18px', borderRadius: 999, border:'1px solid rgba(0,0,0,0.32)', background: pronto ? PN.BTN_DARK : '#EFEFF1', color: pronto ? PN.WHITE : '#9CA3AF', fontSize: 14, fontWeight: 700, cursor: pronto ? 'pointer' : 'not-allowed', fontFamily:'inherit'}}>
            {cambiaSoggetto ? 'Avvia il cambiamento' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Il riconferimento della delega (P-62 · D-52, P-49 · D-40) ─────────────
// Si apre da solo dopo la conferma del nuovo soggetto, e da Account per il
// cambio di persona: chi rappresenta il soggetto riconferisce la delega con
// il proprio SPID. Stessa procedura della card dell'onboarding
// (onboarding-step2-locale.jsx, altro bundle: CF, servizi e tap sono copie
// verbatim, con gli stessi nomi). Il controllo non si fida sulla parola: il
// primo giro finisce in «non trovata», col perché nell'ordine in cui si
// sbaglia. Quando la delega è attiva la tappa delegations_renewed è fatta:
// la vecchia delega non si chiede di revocarla — il portale ammette due
// delegati e, se i posti sono pieni, lo dice lui fra le cause.
const ADE_CF_BYUP = '15927340015';
const ADE_PORTALE = 'https://www.agenziaentrate.gov.it/portale/area-riservata';
const ADE_SERVIZI = [
  'Fatturazione elettronica e conservazione delle fatture elettroniche',
  'Accreditamento e censimento dispositivi',
];
const ADE_PASSI = [
  'Accedi con SPID',
  'Vai su Profilo → Deleghe',
  'Apri Delega unica → Aggiungi delegato',
  'Incolla il CF di Byup',
  `Spunta «${ADE_SERVIZI[0]}»`,
  `Spunta «${ADE_SERVIZI[1]}»`,
  'Conferma',
];
const ADE_CAUSE = [
  <React.Fragment>Il delegato è esattamente <b>{ADE_CF_BYUP}</b>.</React.Fragment>,
  <React.Fragment>Sono spuntati <b>entrambi</b> i servizi: «{ADE_SERVIZI[0]}» e «{ADE_SERVIZI[1]}». Con uno solo la delega c'è, ma non basta.</React.Fragment>,
  'La delega è confermata, non lasciata a metà.',
  <React.Fragment><b>Hai già due delegati?</b> Il portale ne ammette due: se i posti sono occupati la nuova non entra, e ne va revocata una — quella di chi esce.</React.Fragment>,
  'La delega può metterci qualche minuto a comparire: riprova.',
];

function ImpDelegaRiconfermaModal({ onClose }) {
  const [, forza] = React.useState(0);
  React.useEffect(() => {
    const ri = () => forza(x => x + 1);
    window.addEventListener('byup-holder-change', ri);
    return () => window.removeEventListener('byup-holder-change', ri);
  }, []);
  const c = window.byupReadHolderChange ? byupReadHolderChange() : null;
  const [stato, setStato] = React.useState('attesa');   // attesa | verifica | errore | attivo
  const [tentativi, setTentativi] = React.useState(0);
  const fatta = !!(c && c.steps && c.steps.delegations_renewed);
  React.useEffect(() => {
    if (c && !fatta && stato === 'attivo') byupHolderAvanza('delegations_renewed');
  }, [stato]);
  if (!c) return null;
  const chi = c.entrante ? c.entrante.nome : 'Mario Rossi';
  const perChi = c.soggetto ? c.soggetto.dopo.denominazione : 'Cacio e Pepe S.r.l.';
  const verifica = () => {
    setStato('verifica');
    const t = tentativi + 1; setTentativi(t);
    setTimeout(() => setStato(t === 1 ? 'errore' : 'attivo'), 1600);
  };
  return (
    <div onClick={onClose} style={{position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)', display:'grid', placeItems:'center', zIndex: 160, padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 680, maxHeight:'calc(var(--pn-vh, 100vh) * 0.92)', display:'flex', flexDirection:'column'}}>
        <div style={MODAL_HEAD}>
          <div style={MODAL_TITLE}>Riconferisci la delega all'Agenzia</div>
          <div style={MODAL_SUB}>
            La delega è conferita da una persona per conto di un contribuente: cambiato {c.soggetto ? 'il soggetto' : 'chi lo rappresenta'}, va rifatta.
            La dà <b style={{color: PN.TEXT}}>{chi}</b> per <b style={{color: PN.TEXT}}>{perChi}</b>, dal proprio accesso al portale.
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>
        <div className="pn-scroll" style={{...MODAL_BODY, overflowY:'auto', display:'flex', flexDirection:'column', gap: 12}}>
          {fatta ? (
            <div style={{padding:'12px 14px', borderRadius: 10, background: PN.GREEN_SOFT, fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
              <b style={{color: PN.GREEN}}>Delega riconferita.</b> {c.status === 'completed' ? <>Il cambiamento è concluso: lo vedi in <a href="byup Profilo.html" style={{color: PN.PINK_DARK, fontWeight: 600}}>Account</a>.</> : 'Resta Stripe da ricollegare.'}
            </div>
          ) : (
            <React.Fragment>
              <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap', padding:'11px 13px', borderRadius: 10, background:'#F7F8FA', border:`1px solid ${PN.BORDER_SOFT}`}}>
                <div style={{flex: 1, minWidth: 140}}>
                  <div style={MODAL_LABEL}>Codice fiscale di Byup</div>
                  <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, fontFamily:'ui-monospace, Menlo, monospace', letterSpacing: 0.5, userSelect:'all'}}>{ADE_CF_BYUP}</div>
                </div>
                <PosCopia valore={ADE_CF_BYUP}/>
                <a href={ADE_PORTALE} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex', alignItems:'center', gap: 6, padding:'6px 12px', borderRadius: 8, background: PN.BTN_DARK, color: PN.WHITE, fontSize: 13.5, fontWeight: 600, textDecoration:'none'}}>
                  Apri il portale {BuIcons.link({size: 12, color:'currentColor'})}
                </a>
              </div>
              <div>
                <div style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>Come si fa, in {ADE_PASSI.length} tap</div>
                <ol style={{margin: 0, paddingLeft: 20, display:'flex', flexDirection:'column', gap: 4}}>
                  {ADE_PASSI.map((p, i) => <li key={i} style={{fontSize: 14, color: PN.TEXT, lineHeight: 1.45}}>{p}</li>)}
                </ol>
              </div>
              <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap', paddingTop: 10, borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
                <div style={{flex: 1, minWidth: 220}}>
                  <div style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT}}>Controllo</div>
                  <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>
                    {stato === 'attivo' ? 'Delega trovata: entrambi i servizi risultano delegati a Byup.'
                      : stato === 'verifica' ? 'Sto controllando la delega presso l\'Agenzia…'
                      : 'Quando hai confermato sul portale, premi Fatto: controlliamo la delega.'}
                  </div>
                </div>
                {stato !== 'attivo' && <ImpButton variant="primary" disabled={stato === 'verifica'} onClick={verifica}>{stato === 'errore' ? 'Riprova' : 'Fatto'}</ImpButton>}
              </div>
              {stato === 'errore' && (
                <div style={{padding:'11px 13px', borderRadius: 10, background:'#FEF2F2', border:'1px solid #FECACA', fontSize: 14, color: PN.TEXT, lineHeight: 1.5}}>
                  <b style={{color: PN.RED}}>Delega non trovata.</b> Ricontrolla, in quest'ordine:
                  <ol style={{margin:'6px 0 0', paddingLeft: 20, display:'flex', flexDirection:'column', gap: 3}}>{ADE_CAUSE.map((x, i) => <li key={i}>{x}</li>)}</ol>
                </div>
              )}
            </React.Fragment>
          )}
        </div>
        <div style={{...MODAL_FOOT, justifyContent:'flex-end'}}>
          <ImpButton variant="ghost" onClick={onClose}>{fatta ? 'Chiudi' : 'Più tardi'}</ImpButton>
        </div>
      </div>
    </div>
  );
}


// ─── Il popup dopo il cambio di soggetto: «Delega e Stripe» ────────────────
// Si apre da solo alla conferma del «Sicuro?», e si riapre dal banner finché
// il cambiamento non è concluso. Due righe, le due cose che restano: la
// delega, riconferita con lo SPID da chi rappresenta il nuovo soggetto; e
// Stripe, dove il nuovo soggetto apre il suo account — la verifica
// dell'identità è quella (byupStripeRicollega segna verified). Il foglio
// della delega si apre sopra, e questo resta sotto ad aggiornarsi.
function ImpDopoSoggettoModal({ onClose, onDelega, onPos }) {
  const [, forza] = React.useState(0);
  const [stripe, setStripe] = React.useState(() => window.byupReadStripe ? byupReadStripe() : { status: 'connected' });
  const [ricollegando, setRicollegando] = React.useState(false);
  React.useEffect(() => {
    const ri = () => forza(x => x + 1);
    const rs = () => setStripe(byupReadStripe());
    window.addEventListener('byup-holder-change', ri);
    window.addEventListener('byup-stripe-change', rs);
    window.addEventListener('byup-pos-censimento', ri);
    return () => { window.removeEventListener('byup-holder-change', ri); window.removeEventListener('byup-stripe-change', rs); window.removeEventListener('byup-pos-censimento', ri); };
  }, []);
  const c = window.byupReadHolderChange ? byupReadHolderChange() : null;
  const inCorso = c && c.fiscal_chain_impacted && c.status !== 'refused';
  const titolare = !!(inCorso && c.entrante && !c.soggetto);
  // Chi entra accetta e verifica la sua identità dal suo telefono: qui non c'è
  // nulla da premere, nel prototipo si simula da sola.
  React.useEffect(() => {
    if (!inCorso || !c.entrante) return;
    const tappe = pnHolderTappe(c.change_type, c.legal_form);
    const prossima = tappe.find(t => !c.steps[t]);
    if (prossima === 'accepted' || (prossima === 'verified' && titolare)) {
      const t = setTimeout(() => byupHolderAvanza(prossima), 2200);
      return () => clearTimeout(t);
    }
  }, [inCorso && c.id, inCorso && !!c.steps.accepted, inCorso && !!c.steps.verified]);
  if (!inCorso) return null;
  const ricollega = () => { setRicollegando(true); setTimeout(() => { setRicollegando(false); byupStripeRicollega(); }, 1800); };
  // Per il cambio del titolare Stripe non si ricollega: il soggetto è lo
  // stesso, cambia il rappresentante, e Stripe lo verifica.
  const aggiornaRappresentante = () => { setRicollegando(true); setTimeout(() => { setRicollegando(false); const x = byupReadHolderChange(); x.steps.stripe_updated = new Date().toISOString(); byupWriteHolderChange(x); }, 1800); };
  const attesaAccettazione = !!c.entrante && !c.steps.accepted;
  const delegaOk = !!c.steps.delegations_renewed;
  const stripeOk = titolare ? !!c.steps.stripe_updated : (stripe.status === 'connected' && !!c.steps.verified);
  // Il censimento dei POS non è una tappa del modello ma è dovuto lo stesso:
  // il nuovo esercente comunica di nuovo i suoi strumenti (P-105). Stesso
  // popup per il cambio del titolare: la riga dei POS dice lo stato vero del
  // censimento, che il nuovo titolare eredita e chiude a suo nome.
  const posLista = window.byupReadPosCensimento ? byupReadPosCensimento() : [];
  const posOk = posLista.every(r => r.fiscal_link_status === 'linked');
  const concluso = c.status === 'completed' && (titolare ? !!c.steps.stripe_updated : true);
  const riga = (titolo, sotto, ok, azione) => (
    <div style={{display:'flex', alignItems:'center', gap: 12, padding:'12px 14px', borderRadius: 10, border:`1px solid ${ok ? PN.GREEN_SOFT : PN.BORDER_SOFT}`, background: ok ? PN.GREEN_SOFT : PN.WHITE}}>
      <span style={{width: 12, height: 12, borderRadius: 999, flexShrink: 0, background: ok ? PN.GREEN : 'transparent', border:`2px solid ${ok ? PN.GREEN : PN.PINK_DARK}`}}/>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT}}>{titolo}</div>
        <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>{sotto}</div>
      </div>
      {!ok && azione}
    </div>
  );
  return (
    <div onClick={onClose} style={{position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)', display:'grid', placeItems:'center', zIndex: 150, padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 680}}>
        <div style={{...MODAL_HEAD, padding: '18px 24px 14px'}}>
          <div style={{...MODAL_TITLE, fontSize: 21}}>Delega, Stripe e POS</div>
          <div style={{...MODAL_SUB, fontSize: 13.5, marginTop: 2}}>
            {titolare
              ? <>Il titolare cambia: da {c.proposed_by || 'Mario Rossi'} a {c.entrante.nome}, stesso soggetto fiscale. Restano tre cose da rifare, a nome di chi entra.</>
              : <>Il soggetto fiscale è cambiato: da {c.soggetto.prima.denominazione} ({c.soggetto.prima.piva}) a {c.soggetto.dopo.denominazione} ({c.soggetto.dopo.piva}), con la P.IVA precedente conservata sui documenti già emessi. Restano tre cose da rifare.</>}
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>
        <div style={{...MODAL_BODY, padding: '16px 24px', display:'flex', flexDirection:'column', gap: 10}}>
          {attesaAccettazione && (
            <div style={{fontSize: 14, color: PN.TEXT, lineHeight: 1.5, padding:'10px 13px', borderRadius: 10, background: PN.AMBER_SOFT}}>
              In attesa che {c.entrante.nome} accetti l'invito con la sua casella e la sua identità: poi tocca a lui.
            </div>
          )}
          {riga('Delega all\'Agenzia', 'La riconferisce chi rappresenta il nuovo soggetto, con il proprio SPID. Finché manca, niente scontrini.', delegaOk,
            <ImpButton variant="primary" disabled={attesaAccettazione} onClick={onDelega}>Riconferisci la delega</ImpButton>)}
          {titolare
            ? riga('Stripe', 'Chi entra si registra come rappresentante dell\'account connesso: la verifica dell\'identità la fa Stripe.', stripeOk,
                <ImpButton variant="primary" disabled={attesaAccettazione || ricollegando} onClick={aggiornaRappresentante}>{ricollegando ? 'Aggiornamento in corso…' : 'Aggiorna su Stripe'}</ImpButton>)
            : riga('Stripe', 'Il nuovo soggetto apre il suo account: la verifica dell\'identità la fa Stripe. Finché manca, niente pagamenti.', stripeOk,
                <ImpButton variant="primary" disabled={attesaAccettazione || ricollegando} onClick={ricollega}>{ricollegando ? 'Collegamento in corso…' : 'Ricollega Stripe'}</ImpButton>)}
          {riga('POS all\'Agenzia', `Il nuovo soggetto comunica di nuovo i suoi strumenti dal proprio accesso al portale: ${posLista.filter(r => r.fiscal_link_status !== 'linked').length || 'nessuno'} da aggiornare. Il foglio precompilato è qui sotto.`, posOk,
            <ImpButton variant="primary" disabled={attesaAccettazione} onClick={() => { onClose(); onPos(); }}>Vai al collegamento POS</ImpButton>)}
          {concluso && <div style={{fontSize: 14, color: PN.GREEN, fontWeight: 700}}>Cambiamento concluso{posOk ? '.' : ': resta il collegamento dei POS.'}</div>}
          {attesaAccettazione && null}
        </div>
        <div style={{...MODAL_FOOT, padding: '12px 24px', justifyContent:'flex-end'}}>
          <ImpButton variant="ghost" onClick={onClose}>{concluso ? 'Chiudi' : 'Più tardi'}</ImpButton>
        </div>
      </div>
    </div>
  );
}


// ─── La riga del soggetto fiscale, in cima alla pagina ─────────────────────
// Chi è il soggetto adesso, e l'unico gesto che lo cambia: «Cambia soggetto
// fiscale», qui a destra e in nessun altro posto. Con un cambiamento in
// corso la riga dice cosa resta e lo stesso pulsante apre «Delega, Stripe e
// POS» invece del foglio dei dati.
function ImpSoggettoRiga({ data, passo, onCambia }) {
  const [c, setC] = React.useState(() => window.byupReadHolderChange ? byupReadHolderChange() : null);
  const [stripe, setStripe] = React.useState(() => window.byupReadStripe ? byupReadStripe() : { status: 'connected' });
  React.useEffect(() => {
    const ri = () => setC(byupReadHolderChange());
    const rs = () => setStripe(byupReadStripe());
    window.addEventListener('byup-holder-change', ri);
    window.addEventListener('byup-stripe-change', rs);
    return () => { window.removeEventListener('byup-holder-change', ri); window.removeEventListener('byup-stripe-change', rs); };
  }, []);
  const persona = data.legalForm === 'ditta_individuale';
  const nome = persona ? `${data.ownerNome} ${data.ownerCognome}`.trim() : data.ragione;
  const inCorso = !!(c && c.fiscal_chain_impacted && c.status !== 'refused' && c.status !== 'completed');
  const titolare = !!(inCorso && c.entrante && !c.soggetto);
  const resta = inCorso ? [
    titolare && !c.steps.anagrafica_confermata && 'l\'anagrafica',
    !c.steps.delegations_renewed && 'la delega',
    (titolare ? !c.steps.stripe_updated : !(stripe.status === 'connected' && c.steps.verified)) && 'Stripe',
  ].filter(Boolean) : [];
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap',
      padding: '12px 18px', marginBottom: 18, borderRadius: 12,
      background: inCorso ? PN.AMBER_SOFT : PN.WHITE, border: `1.5px solid ${inCorso ? '#FCD34D' : PN.BORDER_SOFT}`,
    }}>
      <div style={{flex: 1, minWidth: 260}}>
        <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase'}}>Soggetto fiscale</div>
        <div style={{fontSize: 15.5, color: PN.TEXT, marginTop: 2}}>
          <b>{nome || '—'}</b> · P.IVA {data.piva || '—'}
          {data.pivaPrecedente && <span style={{color: PN.MUTED}}> · precedente {data.pivaPrecedente}, conservata sui documenti già emessi</span>}
        </div>
        {inCorso && (
          <div style={{fontSize: 13.5, color: PN.AMBER, fontWeight: 600, marginTop: 2}}>
            {titolare ? `Cambio del titolare in corso: da ${c.proposed_by || 'Mario Rossi'} a ${c.entrante.nome}` : 'Cambio in corso'}{resta.length ? ` · restano ${resta.join(', ')}` : ''}{!c.steps.delegations_renewed ? ' · niente scontrini finché manca la delega' : ''}{!titolare && !(stripe.status === 'connected' && c.steps.verified) ? ' · niente pagamenti finché manca Stripe' : ''}
          </div>
        )}
      </div>
      <ImpButton variant="primary" onClick={onCambia}>{passo === 'anagrafica' ? 'Aggiorna l\'anagrafica' : passo === 'dopo' ? 'Delega, Stripe e POS' : 'Cambia soggetto fiscale'}</ImpButton>
    </div>
  );
}


function ImpDatiFiscali() {
  const [data, setData] = React.useState({
    // Anagrafica — il mock è una società: i campi del titolare qui sotto si
    // vedono cambiando forma, precompilati con una persona plausibile.
    legalForm: 'societa',
    ragione: 'Cacio e Pepe S.r.l.',
    insegna: 'Cacio e Pepe',
    piva: 'IT12345678901',
    cf: '12345678901',
    regime: 'Ordinario',
    ateco: '56.10.11',
    // Titolare (solo ditta individuale e professionista)
    ownerNome: 'Mario',
    ownerCognome: 'Rossi',
    ownerNascita: '1978-03-21',
    ownerComuneNascita: 'Roma',
    ownerStatoNascita: 'IT',
    ownerCf: 'RSSMRA78C21H501X',
    // Sede operativa (stampata sullo scontrino)
    indirizzo: 'Via dei Giubbonari 27',
    citta: 'Roma', cap: '00197', prov: 'RM',
    // Dati per fatturazione
    rea: 'RM-1234567',
    cciaa: 'Roma',
    capitaleSociale: '10.000,00',
    socioUnico: false,
    inLiquidazione: false,
    sdi: 'PIC7CPS',   // il codice destinatario del canale: si riceve attraverso di esso
    pec: 'fatture@pec.cacioepepe.it',
    sedeIndirizzo: 'Via dei Giubbonari 27',
    sedeCitta: 'Roma',
    sedeCap: '00197',
    sedeProv: 'RM',
    sedeNazione: 'IT',
  });

  const [dirty, setDirty] = React.useState(false);
  const set = (k, v) => { setData(d => ({...d, [k]: v})); setDirty(true); };
  // «Delega e Stripe»: si apre alla conferma del cambio di soggetto, e da
  // Account (?cambio=) o dal banner finché il cambiamento non è concluso.
  // Cosa apre il gesto, con un cambiamento in corso: per il cambio del
  // titolare prima l'anagrafica (il foglio), poi «Delega e Stripe»; per il
  // cambio di soggetto direttamente «Delega, Stripe e POS».
  const cambioInCorso = () => { const c = window.byupReadHolderChange ? byupReadHolderChange() : null; return (c && c.fiscal_chain_impacted && c.status !== 'refused' && c.status !== 'completed') ? c : null; };
  const passoDelCambio = () => { const c = cambioInCorso(); if (!c) return 'nuovo'; if (c.entrante && !c.soggetto && !c.steps.anagrafica_confermata) return 'anagrafica'; return 'dopo'; };
  const apri = () => { const p = passoDelCambio(); if (p === 'dopo') setDopoOpen(true); else setSoggettoOpen(true); };
  const [ricezione, setRicezione] = React.useState(() => window.byupReadRicezione ? byupReadRicezione() : null);
  React.useEffect(() => {
    const ri = () => setRicezione(byupReadRicezione());
    window.addEventListener('byup-ricezione-change', ri);
    return () => window.removeEventListener('byup-ricezione-change', ri);
  }, []);
  const [soggettoOpen, setSoggettoOpen] = React.useState(() => {
    try { return !!new URLSearchParams(window.location.search).get('cambio') && passoDelCambio() === 'anagrafica'; } catch (e) { return false; }
  });
  const [dopoOpen, setDopoOpen] = React.useState(() => {
    try { return !!new URLSearchParams(window.location.search).get('cambio') && passoDelCambio() === 'dopo'; } catch (e) { return false; }
  });
  // Il collegamento Stripe (registro byup_stripe, panoramica-tokens): il cambio
  // di soggetto lo disabilita, e da qui si ricollega — onboarding Stripe
  // simulato. Col ricollegamento nasce un POS virtuale nuovo (P-105).
  const [stripe, setStripe] = React.useState(() => window.byupReadStripe ? byupReadStripe() : { status: 'connected' });
  const [ricollegando, setRicollegando] = React.useState(false);
  React.useEffect(() => {
    const ri = () => setStripe(byupReadStripe());
    window.addEventListener('byup-stripe-change', ri);
    return () => window.removeEventListener('byup-stripe-change', ri);
  }, []);
  const ricollega = () => { setRicollegando(true); setTimeout(() => { setRicollegando(false); byupStripeRicollega(); }, 1800); };
  // Il foglio della delega: si apre da solo dopo la conferma del soggetto, dal
  // banner, e dal rimando di Account (?delega=1) per il cambio di persona.
  const [delegaOpen, setDelegaOpen] = React.useState(() => {
    try { return new URLSearchParams(window.location.search).get('delega') === '1'; } catch (e) { return false; }
  });
  // La tappa fiscal_updated applica il cambiamento ai dati di questa
  // schermata: il nuovo soggetto (forma, denominazione, P.IVA — la
  // precedente resta conservata) o il nuovo titolare sui campi della persona.
  const applica = (c) => {
    if (c.soggetto) {
      const dopo = c.soggetto.dopo;
      setData(d => ({ ...d, ...(dopo.campi || {}), legalForm: dopo.forma || d.legalForm, pivaPrecedente: d.piva, piva: dopo.piva }));
    } else if (c.entrante) {
      const [nome, ...resto] = (c.entrante.nome || '').split(' ');
      setData(d => ({ ...d, ownerNome: nome || d.ownerNome, ownerCognome: resto.join(' ') || d.ownerCognome, ownerCf: '' }));
    }
  };

  // Atterraggio sulla card del collegamento POS quando ci si arriva da un
  // rimando: si accende e si porta in vista, come i chip della checklist.
  React.useEffect(() => {
    let card = null;
    try { card = new URLSearchParams(window.location.search).get('card'); } catch (e) {}
    if (card !== 'pos') return;
    const t = setTimeout(() => {
      const el = window.impAccendiSezione && window.impAccendiSezione('pos-censimento');
      if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 200);
    return () => clearTimeout(t);
  }, []);

  const persona = data.legalForm === 'ditta_individuale';
  const societa = data.legalForm === 'societa';
  const ente    = data.legalForm === 'ente';

  // L'obbligatorietà segue la forma: alla persona fisica servono i suoi dati,
  // alla società la denominazione. Il resto è uguale per tutti.
  const fields = [
    ...(persona ? [
      { id: 'ownerNome',    label: 'Nome del titolare' },
      { id: 'ownerCognome', label: 'Cognome del titolare' },
      { id: 'ownerCf',      label: 'Codice fiscale del titolare' },
    ] : [
      { id: 'ragione', label: ente ? 'Denominazione' : 'Ragione sociale' },
    ]),
    { id: 'piva', label: 'Partita IVA' },
    { id: 'insegna', label: 'Insegna' },
    { id: 'indirizzo', label: 'Indirizzo sede operativa' },
  ];
  const missing = fields.filter(f => !data[f.id]);
  const isComplete = missing.length === 0;

  const selectStyle = {
    width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
    borderRadius:9, fontSize:15.5, background:PN.WHITE, fontFamily:'inherit',
  };

  return (
    <div>
      {/* Status banner — solo quando manca qualcosa: la conferma che è tutto
          a posto era rumore, l'assenza del banner dice la stessa cosa. */}
      {!isComplete && (
        <div style={{
          display:'flex', alignItems:'center', gap: 14,
          padding: '14px 18px',
          background: PN.AMBER_SOFT,
          border: '1.5px solid #FCD34D',
          borderRadius: 12,
          marginBottom: 18,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: PN.AMBER, color: PN.WHITE,
            display:'grid', placeItems:'center',
            flexShrink: 0,
          }}><BuIcons.alert size={18} color={PN.WHITE}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:16, fontWeight:700, color: PN.AMBER}}>
              {`${missing.length} ${missing.length===1?'campo mancante':'campi mancanti'} per emettere scontrini conformi`}
            </div>
            <div style={{fontSize:14, color: PN.MUTED, marginTop: 2}}>
              Mancano: {missing.map(m => m.label).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Cambio di titolarità in corso (P-62): la tappa fiscal_updated si fa
          qui e torna in Account come fatta. */}
      <ImpSoggettoRiga data={data} passo={passoDelCambio()} onCambia={apri}/>
      {soggettoOpen && (
        <ImpSoggettoFoglio data={data} onClose={() => setSoggettoOpen(false)} onApplica={applica} onDopo={() => setDopoOpen(true)}
          onSalva={(campi) => setData(d => ({ ...d, ...campi }))}/>
      )}
      {dopoOpen && <ImpDopoSoggettoModal onClose={() => setDopoOpen(false)} onDelega={() => setDelegaOpen(true)}
        onPos={() => setTimeout(() => { const el = window.impAccendiSezione && window.impAccendiSezione('pos-censimento'); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 120)}/>}
      {delegaOpen && <ImpDelegaRiconfermaModal onClose={() => setDelegaOpen(false)}/>}

      {/* Collegamento all'Agenzia: promemoria progressivo, blocco a scadenza,
          verifica all'inserimento — il perché e il come stanno nel commento
          in testa al file. */}
      {persona ? <AdeCredenzialiCard/> : <AdeIncaricatoCard/>}

      {/* Collegamento dei POS all'Agenzia (P-105): il vicino di casa delle
          credenziali — stessa area, stesso linguaggio. Deep link
          ?page=fiscali&card=pos[&strumento=id] dai rimandi di Personale,
          dell'onboarding e di POS e integrazioni. */}
      <PosCensimentoCard/>

      {/* 2-column layout: form a sx, anteprima scontrino a dx */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap: 18, alignItems:'flex-start'}}>
        <div>
          {/* Anagrafica e sede fianco a fianco: sono due meta dello stesso
              gesto — chi sei e dove stampi — e in colonna costringevano a
              scorrere per vedere la seconda. Le righe interne sono ripensate
              per la mezza larghezza: un campo pieno per riga, le coppie solo
              dove i valori sono corti. height 100% pareggia le altezze. */}
          <div style={{display:'grid', gridTemplateColumns:'minmax(0, 1fr) minmax(0, 1fr)', gap: 16, alignItems:'stretch', marginBottom: 16}}>
            {/* Dati anagrafici: tutti in sola lettura. Si modificano insieme,
                dal foglio in fondo — che mostra tutti i campi, adattati alla
                forma giuridica — e non uno per uno, perché un campo alla volta
                lasciava cambiare la P.IVA come se fosse un'insegna. Il foglio
                distingue da solo: se cambiano P.IVA o forma è un cambio di
                soggetto fiscale (P-62 · D-52), altrimenti un salvataggio. */}
            <ImpCard title="Dati anagrafici" sub="La forma giuridica decide quali dati fiscali esistono; si modificano tutti insieme, da «Cambia soggetto fiscale» in cima" style={{marginBottom: 0, height: '100%'}}>
              <ImpCampoBloccato label="Forma giuridica" value={(FORME_GIURIDICHE.find(f => f.id === data.legalForm) || {}).label}/>
              {persona ? (
                <React.Fragment>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
                    <ImpCampoBloccato label="Nome del titolare" value={data.ownerNome}/>
                    <ImpCampoBloccato label="Cognome del titolare" value={data.ownerCognome}/>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap: 14}}>
                    <ImpCampoBloccato label="Data di nascita" value={data.ownerNascita ? new Date(`${data.ownerNascita}T00:00`).toLocaleDateString('it-IT') : ''} hint="Richiesta per legge: usata solo qui"/>
                    <ImpCampoBloccato label="Comune di nascita" value={data.ownerComuneNascita}/>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
                    <ImpCampoBloccato label="Stato di nascita" value={((STATI_NASCITA.find(([cod]) => cod === data.ownerStatoNascita) || [])[1]) || data.ownerStatoNascita}/>
                    <ImpCampoBloccato label="Codice fiscale del titolare" value={data.ownerCf} hint="16 caratteri, diverso dalla P.IVA"/>
                  </div>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <ImpCampoBloccato label={ente ? 'Denominazione' : 'Ragione sociale'} value={data.ragione} hint={ente ? 'Come risulta da statuto' : 'Come risulta a registro imprese'}/>
                  <ImpCampoBloccato label="Codice fiscale" value={data.cf}/>
                </React.Fragment>
              )}
              <ImpCampoBloccato label="Partita IVA" value={data.piva} hint={data.pivaPrecedente ? `Precedente ${data.pivaPrecedente}, conservata sui documenti già emessi` : undefined}/>
              <ImpCampoBloccato label="Insegna" value={data.insegna} hint="Stampata in cima allo scontrino"/>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
                <ImpCampoBloccato label="Regime fiscale" value={data.regime}/>
                <ImpCampoBloccato label="Codice ATECO" value={data.ateco}/>
              </div>
            </ImpCard>

            <ImpCard title="Sede operativa" sub="Indirizzo stampato in cima allo scontrino" style={{marginBottom: 0, height: '100%'}}>
              <ImpField label="Indirizzo">
                <ImpInput value={data.indirizzo} onChange={e => set('indirizzo', e.target.value)}/>
              </ImpField>
              <ImpField label="Città">
                <ImpInput value={data.citta} onChange={e => set('citta', e.target.value)}/>
              </ImpField>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
                <ImpField label="CAP">
                  <ImpInput value={data.cap} onChange={e => set('cap', e.target.value)}/>
                </ImpField>
                <ImpField label="Provincia">
                  <ImpInput value={data.prov} onChange={e => set('prov', e.target.value)}/>
                </ImpField>
              </div>
            </ImpCard>
          </div>

          <ImpCard
            title="Dati fatturazione"
            sub="Del soggetto fiscale, in sola lettura: cambiano con lui, dal foglio in Dati anagrafici"
          >
            {/* Tutto in sola lettura, come i dati anagrafici: sono dati del
                SOGGETTO — REA e camera di commercio la sua iscrizione, PEC e
                SDI il suo recapito, la sede legale la sua — e si modificano
                insieme, dal foglio «Cambia soggetto fiscale» qui accanto.
                La parte di registro imprese esiste solo per società ed enti
                (P-86); per la persona la sede legale è il domicilio fiscale. */}
            {!persona && (
              <React.Fragment>
                <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, marginTop: 4, marginBottom: 10}}>Camera di Commercio</div>
                <div style={{display:'grid', gridTemplateColumns: societa ? '1fr 1fr 1fr' : '1fr 1fr', gap: 14}}>
                  <ImpCampoBloccato label="Numero REA" value={data.rea} hint={ente ? 'Facoltativo: solo se l\'ente è a registro imprese' : undefined}/>
                  <ImpCampoBloccato label="CCIAA" value={data.cciaa} hint={ente ? 'Facoltativa' : undefined}/>
                  {societa && <ImpCampoBloccato label="Capitale sociale (€)" value={data.capitaleSociale} hint="Solo società di capitali"/>}
                </div>
                <div style={{display:'flex', gap: 18, marginTop: 2, marginBottom: 6, fontSize: 14, color: PN.MUTED}}>
                  {societa && <span>{data.socioUnico ? '☑' : '☐'} Socio unico</span>}
                  <span>{data.inLiquidazione ? '☑' : '☐'} In liquidazione</span>
                </div>
              </React.Fragment>
            )}
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, marginTop: persona ? 4 : 18, marginBottom: 10}}>Fatturazione elettronica</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
              <ImpCampoBloccato label="PEC" value={data.pec}/>
              <ImpCampoBloccato label="Codice destinatario per ricevere" value={window.PN_CODICE_DESTINATARIO} hint="Del canale: i fornitori ti fatturano qui"/>
            </div>
            {/* La registrazione dell'indirizzo telematico è un atto
                dell'esercente sul portale, delegabile solo agli intermediari
                abilitati: qui si dichiara, come nell'onboarding (riga 4). */}
            <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap', marginTop: -6, marginBottom: 6, fontSize: 13.5}}>
              {ricezione
                ? <span style={{color: PN.GREEN, fontWeight: 600}}>Codice destinatario registrato sul portale · dichiarato il {new Date(ricezione.dichiarata_at).toLocaleDateString('it-IT')}</span>
                : <label style={{display:'inline-flex', alignItems:'center', gap: 8, color: PN.TEXT, cursor:'pointer'}}>
                    <input type="checkbox" checked={false} onChange={() => byupWriteRicezione({ dichiarata_at: new Date().toISOString(), dichiarata_da: PN_UTENTE.nome })} style={{accentColor: PN.PINK_DARK}}/>
                    Ho registrato il codice destinatario sul portale dell'Agenzia (Fatturazione elettronica → Registrazione dell'indirizzo telematico)
                  </label>}
            </div>
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, marginTop: 18, marginBottom: 10}}>{persona ? 'Domicilio fiscale' : 'Sede legale'}</div>
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14}}>
              <ImpCampoBloccato label="Indirizzo e civico" value={data.sedeIndirizzo}/>
              <ImpCampoBloccato label="CAP" value={data.sedeCap}/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14}}>
              <ImpCampoBloccato label="Città" value={data.sedeCitta}/>
              <ImpCampoBloccato label="Provincia" value={data.sedeProv}/>
              <ImpCampoBloccato label="Nazione" value={({ IT: 'Italia (IT)', SM: 'San Marino (SM)', VA: 'Città del Vaticano (VA)' })[data.sedeNazione] || data.sedeNazione}/>
            </div>
            <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 4}}>Sono dati del soggetto fiscale: si modificano da «Cambia soggetto fiscale», in cima alla pagina.</div>
          </ImpCard>

          {/* ─── Accredito degli incassi (P-87 · D-80, PAG-01) ──────────────
              Banca, IBAN e SWIFT non si chiedono più: l'accredito passa dal
              conto connesso del prestatore di pagamento (payout_account_ref)
              e l'IBAN non compare MAI in chiaro — è l'invariante che tiene
              Byup fuori dalla catena dei fondi. Con i campi è caduta anche la
              nota «su fattura compare un solo IBAN»: la fattura porta la
              modalità di pagamento, non le coordinate. Il riferimento
              mascherato è lo stesso che POS e integrazioni mostra sulla riga
              Stripe: una fonte sola. */}
          <ImpCard title="Accredito degli incassi" sub="Il conto dei versamenti è quello connesso a Stripe: qui si legge, si cambia da Stripe" style={{marginBottom: 16}}>
            {stripe.status !== 'connected' && (
              <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap', padding:'12px 14px', borderRadius: 11, background:'#FEF2F2', border:'1.5px solid #FECACA', marginBottom: 14}}>
                <div style={{width: 34, height: 34, borderRadius: 9, background: PN.RED, color: PN.WHITE, display:'grid', placeItems:'center', flexShrink: 0}}><BuIcons.alert size={16} color={PN.WHITE}/></div>
                <div style={{flex: 1, minWidth: 240, fontSize: 14, color: PN.TEXT, lineHeight: 1.5}}>
                  <b style={{color: '#991B1B'}}>Collegamento a Stripe disabilitato.</b> Il soggetto fiscale è cambiato e l'account era intestato a quello precedente: serve un nuovo collegamento, con la verifica di Stripe. Fino ad allora non ricevi pagamenti.
                </div>
                <ImpButton variant="primary" disabled={ricollegando} onClick={ricollega}>{ricollegando ? 'Collegamento in corso…' : 'Ricollega Stripe'}</ImpButton>
              </div>
            )}
            <div style={{display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap', opacity: stripe.status === 'connected' ? 1 : 0.55}}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background:'#635BFF',
                display:'grid', placeItems:'center', flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M11.6 8.7c-.7 0-1.1.2-1.1.7 0 .5.5.7 1.6 1.1 1.7.6 2.6 1.4 2.6 2.9 0 1.7-1.3 2.7-3.4 2.7-1.2 0-2.4-.3-3.3-.7v-2c.9.5 1.9.8 2.9.8.7 0 1.2-.2 1.2-.7 0-.6-.5-.8-1.6-1.2-1.6-.6-2.6-1.4-2.6-2.8 0-1.6 1.3-2.6 3.3-2.6 1 0 2 .2 2.9.6v1.9c-.8-.4-1.7-.7-2.5-.7z"/>
                </svg>
              </div>
              <div style={{flex: 1, minWidth: 200}}>
                <div style={{display:'flex', alignItems:'center', gap: 8, flexWrap:'wrap'}}>
                  <span style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>Conto connesso Stripe</span>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap: 5,
                    padding:'2px 9px', borderRadius: 999,
                    background: stripe.status === 'connected' ? '#D1FAE5' : '#FEE2E2', color: stripe.status === 'connected' ? '#065F46' : '#991B1B',
                    fontSize: 12.5, fontWeight: 700,
                  }}>
                    <span style={{width: 6, height: 6, borderRadius:'50%', background: stripe.status === 'connected' ? '#059669' : PN.RED}}/>
                    {stripe.status === 'connected' ? 'Attivo' : 'Disabilitato'}
                  </span>
                </div>
                <div style={{fontSize: 14, color: PN.MUTED, marginTop: 3, fontFamily:'ui-monospace, monospace', letterSpacing: 0.3}}>
                  acct_••••dE3v · Banca Intesa Sanpaolo · IT ••••3456
                </div>
                <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>
                  Accredito automatico giornaliero sul tuo conto
                </div>
              </div>
              <button className="pn-btn-feedback"
                onClick={() => {}}
                title="Il conto di accredito si cambia su Stripe, non qui"
                style={{
                  padding:'9px 18px', borderRadius: 999,
                  background: PN.WHITE, color: PN.TEXT,
                  border:`1px solid ${PN.BORDER}`, cursor:'pointer', fontFamily:'inherit',
                  fontSize: 14.5, fontWeight: 600, flexShrink: 0,
                  display:'inline-flex', alignItems:'center', gap: 7,
                }}>
                Gestisci su Stripe
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>
              </button>
            </div>
          </ImpCard>

        </div>

        {/* Anteprima scontrino, con sotto la regola del documento: nasce
            digitale e va all'Agenzia da solo; la carta è solo cortesia. */}
        <aside style={{position:'sticky', top: 0}}>
          <ScontrinoPreview data={data}/>
          <div style={{
            marginTop: 14, padding: '12px 14px',
            background: PN.BLUE_SOFT, borderRadius: 12,
            display:'flex', gap: 10, alignItems:'flex-start',
          }}>
            <span style={{fontSize: 18, lineHeight: 1.2}}>ℹ️</span>
            <div style={{fontSize: 13.5, color:'#1E40AF', lineHeight: 1.5}}>
              La ricevuta fiscale viene comunicata all'Agenzia delle Entrate digitalmente e può essere condivisa tramite email o numero di telefono: puoi però stampare uno scontrino di cortesia se te lo chiedono.
            </div>
          </div>
        </aside>
      </div>

      <ImpSaveBar dirty={dirty} onCancel={() => setDirty(false)} onSave={() => setDirty(false)}/>
    </div>
  );
}

function ScontrinoPreview({ data }) {
  const mono = "ui-monospace, 'SF Mono', 'Roboto Mono', Menlo, monospace";
  const lineRow = (label, val, opts={}) => (
    <div style={{display:'flex', justifyContent:'space-between', fontSize: 12.5, lineHeight: 1.5, ...opts}}>
      <span>{label}</span>
      <span>{val}</span>
    </div>
  );

  const rows = [
    { desc:'CACIO E PEPE',     q:1, p:14.00 },
    { desc:'CARBONARA',        q:1, p:14.00 },
    { desc:'ACQUA NAT 0.75L',  q:1, p:3.00  },
    { desc:'COPERTO',          q:2, p:2.00  },
  ];
  const totale = rows.reduce((s,r) => s + r.p*r.q, 0);
  const imponibile = +(totale / 1.10).toFixed(2);
  const iva = +(totale - imponibile).toFixed(2);

  return (
    <div style={{borderRadius: 14, overflow:'visible'}}>
      {/* Header esterno */}
      <div style={{
        display:'flex', alignItems:'center', gap: 8, marginBottom: 10,
        paddingLeft: 4,
      }}>
        <span style={{fontSize:15, fontWeight:700, flex:1}}>Anteprima scontrino</span>
        <span style={{fontSize:13, color:PN.MUTED}}>Documento commerciale</span>
      </div>

      {/* Receipt: carta termica con bordi stappati */}
      <div style={{
        position:'relative',
        background: '#FDFBF5',
        boxShadow: '0 12px 28px -10px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.06)',
        padding: '20px 18px 14px',
        fontFamily: mono,
        color: '#1F1A14',
        clipPath: 'polygon(0% 8px, 4% 0%, 8% 8px, 12% 0%, 16% 8px, 20% 0%, 24% 8px, 28% 0%, 32% 8px, 36% 0%, 40% 8px, 44% 0%, 48% 8px, 52% 0%, 56% 8px, 60% 0%, 64% 8px, 68% 0%, 72% 8px, 76% 0%, 80% 8px, 84% 0%, 88% 8px, 92% 0%, 96% 8px, 100% 0%, 100% calc(100% - 8px), 96% 100%, 92% calc(100% - 8px), 88% 100%, 84% calc(100% - 8px), 80% 100%, 76% calc(100% - 8px), 72% 100%, 68% calc(100% - 8px), 64% 100%, 60% calc(100% - 8px), 56% 100%, 52% calc(100% - 8px), 48% 100%, 44% calc(100% - 8px), 40% 100%, 36% calc(100% - 8px), 32% 100%, 28% calc(100% - 8px), 24% 100%, 20% calc(100% - 8px), 16% 100%, 12% calc(100% - 8px), 8% 100%, 4% calc(100% - 8px), 0% 100%)',
      }}>
        {/* Header negozio */}
        <div style={{textAlign:'center', marginBottom: 10}}>
          <div style={{
            fontSize: 15, fontWeight: 800, letterSpacing: 1,
            color: data.insegna ? '#1F1A14' : PN.RED,
          }}>
            {(data.insegna || '— manca insegna —').toUpperCase()}
          </div>
          <div style={{fontSize: 12, marginTop: 2}}>{data.indirizzo || '—'}</div>
          <div style={{fontSize: 12}}>{data.cap} {data.citta} ({data.prov})</div>
          <div style={{fontSize: 12, marginTop: 4}}>P.IVA {data.piva || '—'}</div>
        </div>

        <div style={{
          fontSize: 12, letterSpacing: 1.5, textAlign:'center', margin: '4px 0',
          color: '#8A7B5C',
        }}>━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        {/* Doc header */}
        <div style={{textAlign:'center', fontSize: 12.5, fontWeight: 700, margin: '6px 0'}}>
          DOCUMENTO COMMERCIALE
        </div>
        <div style={{textAlign:'center', fontSize: 11.5, marginBottom: 8, opacity: 0.85}}>
          di vendita o prestazione
        </div>

        {/* Linee */}
        <div style={{borderTop:'1px dashed #BFB39A', paddingTop: 6, marginBottom: 6}}>
          {rows.map((r, i) => (
            <div key={i} style={{marginBottom: 3}}>
              <div style={{fontSize: 12.5, lineHeight: 1.3}}>{r.desc}</div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize: 12, color:'#5C5142'}}>
                <span>{r.q} x € {r.p.toFixed(2)}</span>
                <span style={{color:'#1F1A14', fontWeight: 600}}>€ {(r.q*r.p).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Subtotali */}
        <div style={{borderTop:'1px dashed #BFB39A', paddingTop: 6}}>
          {lineRow('SUBTOTALE', `€ ${totale.toFixed(2)}`)}
          {lineRow('di cui imponibile 10%', `€ ${imponibile.toFixed(2)}`, {color:'#5C5142'})}
          {lineRow('di cui IVA 10%', `€ ${iva.toFixed(2)}`, {color:'#5C5142'})}
        </div>

        {/* Totale */}
        <div style={{
          marginTop: 6, paddingTop: 6, borderTop:'2px solid #1F1A14',
          display:'flex', justifyContent:'space-between',
          fontSize: 15, fontWeight: 800,
        }}>
          <span>TOTALE COMPLESSIVO</span>
          <span>€ {totale.toFixed(2)}</span>
        </div>

        {/* Pagamento */}
        <div style={{marginTop: 10}}>
          {lineRow('PAGAMENTO ELETTRONICO', `€ ${totale.toFixed(2)}`, {fontWeight: 700})}
          {lineRow('Resto', '€ 0,00', {color:'#5C5142'})}
        </div>

        {/* Footer fiscale */}
        <div style={{
          marginTop: 12, paddingTop: 8,
          borderTop: '1px dashed #BFB39A',
          fontSize: 11, color: '#5C5142', lineHeight: 1.5,
        }}>
          <div style={{textAlign:'center'}}>06/03/2026  14:32  DOC.N. 0042-0007</div>
          <div style={{textAlign:'center', marginTop: 4, fontSize: 10.5, opacity: 0.85}}>
            Trasmesso ad Agenzia delle Entrate
          </div>
        </div>

        {/* Barcode mock */}
        <div style={{
          marginTop: 10, display:'flex', justifyContent:'center', gap: 1,
          height: 22, alignItems:'center',
        }}>
          {Array.from({length: 38}).map((_,i) => {
            const w = (i % 4 === 0 ? 2 : (i % 3 === 0 ? 1.5 : 1));
            const h = (i % 5 === 0 ? 22 : 18);
            return <span key={i} style={{
              display:'inline-block', width: w, height: h,
              background: '#1F1A14', opacity: i%2 ? 1 : 0.15,
            }}/>;
          })}
        </div>
      </div>

      <div style={{
        textAlign:'center', fontSize: 12.5, color: PN.MUTED,
        marginTop: 10,
      }}>Esempio dimostrativo · cifre non reali</div>
    </div>
  );
}

window.ImpDatiFiscali = ImpDatiFiscali;
