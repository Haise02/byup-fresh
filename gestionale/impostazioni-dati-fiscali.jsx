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
  { id: 'professionista',    label: 'Professionista' },
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
      <div style={{
        display:'flex', alignItems:'center', gap: 12, padding: '12px 14px', borderRadius: 11, marginBottom: 14,
        background: tono.sfondo, border: `1.5px solid ${tono.bordo}`,
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: tono.colore, color: PN.WHITE, display:'grid', placeItems:'center', flexShrink: 0 }}>
          {fase === 'ok' ? BuIcons.check({size: 16, color: PN.WHITE}) : <BuIcons.alert size={16} color={PN.WHITE}/>}
        </div>
        <div style={{ fontSize: 14.5, color: fase === 'ok' || fase === 'lontana' ? PN.TEXT : tono.colore, fontWeight: fase === 'scaduta' || fase === 'ultimi' ? 700 : 500, lineHeight: 1.45 }}>{testata}</div>
      </div>
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

// ─── Il foglio del nuovo soggetto (P-62 · D-52, legal_entity | both) ───────
// La porta del soggetto fiscale è qui, non in Account: si chiedono i dati del
// nuovo soggetto e una sola domanda, «resta la stessa persona?», che decide
// fra legal_entity e both — e nel secondo caso la casella di chi entra. Il
// foglio non si chiude col gesto: offre lì la verifica dell'identità e la
// tappa dei dati, così chi ha iniziato qui non viene rimandato altrove. Le
// deleghe restano nell'onboarding, come per tutti i casi con catena.
function ImpSoggettoFoglio({ cambio, forma, ragione, piva, onClose, onApplica }) {
  const [nuovaForma, setNuovaForma] = React.useState(forma);
  const [denominazione, setDenominazione] = React.useState('');
  const [nuovaPiva, setNuovaPiva] = React.useState('');
  const [stessa, setStessa] = React.useState(null);   // true | false | null
  const [entNome, setEntNome] = React.useState('Giulia Bianchi');
  const [entEmail, setEntEmail] = React.useState('giulia.bianchi@example.it');
  const [verificando, setVerificando] = React.useState(false);
  const [, forza] = React.useState(0);
  React.useEffect(() => {
    const ri = () => forza(x => x + 1);
    window.addEventListener('byup-holder-change', ri);
    return () => window.removeEventListener('byup-holder-change', ri);
  }, []);

  const personaForma = nuovaForma === 'ditta_individuale' || nuovaForma === 'professionista';
  const pivaOk = pivaFormale(nuovaPiva);
  const pronto = denominazione.trim() && pivaOk && stessa !== null && (stessa || entEmail.includes('@'));

  const avvia = () => {
    if (!pronto) return;
    const now = new Date().toISOString();
    byupWriteHolderChange({
      id: 'hc-' + Date.now(), change_type: stessa ? 'legal_entity' : 'both', fiscal_chain_impacted: true,
      legal_form: nuovaForma,
      status: 'proposed', proposed_by: 'Mario Rossi', created_at: now,
      steps: { proposed: now },
      entrante: stessa ? null : { nome: entNome.trim() || 'Giulia Bianchi', email: entEmail.trim() },
      soggetto: {
        prima: { denominazione: ragione, piva },
        dopo: { denominazione: denominazione.trim(), piva: nuovaPiva.replace(/\s/g, '').toUpperCase(), forma: nuovaForma },
      },
    });
  };

  const c = cambio || (window.byupReadHolderChange ? byupReadHolderChange() : null);
  const inCorso = c && c.soggetto && c.status !== 'refused';
  const tappe = inCorso ? pnHolderTappe(c.change_type, c.legal_form) : [];
  const prossima = inCorso ? tappe.find(t => !c.steps[t]) : null;
  const verifica = () => { setVerificando(true); setTimeout(() => { setVerificando(false); byupHolderAvanza('verified'); }, 1400); };
  const conferma = () => { onApplica(c); byupHolderAvanza('fiscal_updated'); };

  const tile = (on, titolo, sotto, onClick) => (
    <button onClick={onClick} style={{
      flex: 1, textAlign:'left', padding:'11px 13px', borderRadius: 11, cursor:'pointer', fontFamily:'inherit',
      border:`1.5px solid ${on ? PN.PINK : PN.BORDER}`, background: on ? PN.PINK_SOFT : PN.WHITE,
    }}>
      <div style={{fontSize: 14.5, fontWeight: 700, color: on ? PN.PINK_DARK : PN.TEXT}}>{titolo}</div>
      <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2, lineHeight: 1.4}}>{sotto}</div>
    </button>
  );

  return (
    <div onClick={onClose} style={{position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)', display:'grid', placeItems:'center', zIndex: 150, padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 640, maxHeight:'92vh', display:'flex', flexDirection:'column'}}>
        <div style={MODAL_HEAD}>
          <div style={MODAL_TITLE}>Cambia soggetto fiscale</div>
          <div style={MODAL_SUB}>
            {inCorso
              ? `Da ${c.soggetto.prima.denominazione} (${c.soggetto.prima.piva}) a ${c.soggetto.dopo.denominazione} (${c.soggetto.dopo.piva})`
              : `Oggi il locale è di ${ragione} · P.IVA ${piva}. La P.IVA di oggi non si cancella: resta come precedente sui documenti già emessi.`}
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>

        {!inCorso ? (
          <div className="pn-scroll" style={{...MODAL_BODY, overflowY:'auto', display:'flex', flexDirection:'column', gap: 12}}>
            <div>
              <div style={MODAL_LABEL}>Forma giuridica del nuovo soggetto</div>
              <select value={nuovaForma} onChange={e => setNuovaForma(e.target.value)} style={{...MODAL_INPUT}}>
                {FORME_GIURIDICHE.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <div style={MODAL_LABEL}>{personaForma ? 'Nome e cognome del titolare' : nuovaForma === 'ente' ? 'Denominazione' : 'Ragione sociale'}</div>
              <input value={denominazione} onChange={e => setDenominazione(e.target.value)} placeholder={personaForma ? 'Es. Mario Rossi' : 'Es. Cacio e Pepe S.p.A.'} style={MODAL_INPUT}/>
            </div>
            <div>
              <div style={MODAL_LABEL}>Partita IVA</div>
              <input value={nuovaPiva} onChange={e => setNuovaPiva(e.target.value)} placeholder="IT seguito da 11 cifre" style={{...MODAL_INPUT, fontFamily:'ui-monospace, Menlo, monospace'}}/>
              <div style={{fontSize: 12.5, color: nuovaPiva && !pivaOk ? PN.AMBER : PN.MUTED, marginTop: 4}}>
                {nuovaPiva ? (pivaOk ? 'Formato valido' : 'Formato non valido: IT e undici cifre') : 'Solo controllo del formato: nessuna verifica presso l\'Agenzia'}
              </div>
            </div>
            <div>
              <div style={MODAL_LABEL}>Resta la stessa persona?</div>
              <div style={{display:'flex', gap: 8}}>
                {tile(stessa === true, 'Sì, resto io', 'Cambia solo il soggetto: la delega va riconferita per il nuovo contribuente.', () => setStessa(true))}
                {tile(stessa === false, 'No, cambia anche la persona', 'È una cessione: chi entra accetta con la sua casella e riconferisce la delega.', () => setStessa(false))}
              </div>
            </div>
            {stessa === false && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10}}>
                <div>
                  <div style={MODAL_LABEL}>Chi entra</div>
                  <input value={entNome} onChange={e => setEntNome(e.target.value)} style={MODAL_INPUT}/>
                </div>
                <div>
                  <div style={MODAL_LABEL}>La sua casella di posta</div>
                  <input type="email" value={entEmail} onChange={e => setEntEmail(e.target.value)} style={MODAL_INPUT}/>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="pn-scroll" style={{...MODAL_BODY, overflowY:'auto', display:'flex', flexDirection:'column', gap: 12}}>
            {/* Le tappe che si fanno QUI, nell'ordine del modello: chi entra
                accetta (solo nella cessione), l'identità si verifica, i dati
                si confermano. Le deleghe stanno nell'onboarding. */}
            {PN_HOLDER_STATI.filter(st => tappe.includes(st.id) && st.id !== 'completed').map(st => {
              const fatta = !!c.steps[st.id];
              const tocca = st.id === prossima;
              return (
                <div key={st.id} style={{display:'flex', alignItems:'center', gap: 12, padding:'10px 12px', borderRadius: 10, border:`1px solid ${tocca ? PN.PINK : PN.BORDER_SOFT}`, background: fatta ? PN.GREEN_SOFT : PN.WHITE}}>
                  <span style={{width: 12, height: 12, borderRadius: 999, flexShrink: 0, background: fatta ? PN.GREEN : 'transparent', border:`2px solid ${fatta ? PN.GREEN : tocca ? PN.PINK_DARK : PN.BORDER}`}}/>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT}}>{st.label}</div>
                    {st.id === 'fiscal_updated' && fatta && <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2}}>P.IVA precedente {c.soggetto.prima.piva} conservata: i documenti già emessi la portano.</div>}
                    {st.id === 'delegations_renewed' && !fatta && <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2}}>Chi rappresenta il nuovo soggetto la riconferisce con il proprio SPID: si fa dalla card della delega.</div>}
                  </div>
                  {tocca && st.id === 'accepted' && <ImpButton variant="primary" onClick={() => byupHolderAvanza('accepted')}>Simula l'accettazione di {c.entrante.nome} (demo)</ImpButton>}
                  {tocca && st.id === 'verified' && (verificando ? <span style={{fontSize: 13.5, color: PN.MUTED}}>Verifica in corso…</span> : <ImpButton variant="primary" onClick={verifica}>Verifica l'identità</ImpButton>)}
                  {tocca && st.id === 'fiscal_updated' && <ImpButton variant="primary" onClick={conferma}>Conferma i dati del nuovo soggetto</ImpButton>}
                  {tocca && st.id === 'delegations_renewed' && <a href={`byup Restaurant Onboarding.html?step=2&cambio=${c.id}`} style={{fontSize: 14, fontWeight: 700, color: PN.PINK_DARK, textDecoration:'none', whiteSpace:'nowrap'}}>Riconferisci la delega →</a>}
                </div>
              );
            })}
          </div>
        )}

        <div style={MODAL_FOOT}>
          <button onClick={onClose} style={{padding:'10px 16px', borderRadius: 999, border:`1px solid ${PN.BORDER}`, background: PN.WHITE, fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit'}}>{inCorso ? 'Chiudi' : 'Annulla'}</button>
          <span style={{flex: 1}}/>
          {!inCorso && (
            <button onClick={avvia} disabled={!pronto} style={{padding:'10px 18px', borderRadius: 999, border:'1px solid rgba(0,0,0,0.32)', background: pronto ? PN.BTN_DARK : '#EFEFF1', color: pronto ? PN.WHITE : '#9CA3AF', fontSize: 14, fontWeight: 700, cursor: pronto ? 'pointer' : 'not-allowed', fontFamily:'inherit'}}>
              Avvia il cambiamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Il banner del cambiamento in corso. Per il soggetto rimanda al foglio, dove
// si fanno le tappe; per la persona la tappa dei dati segue la forma: si fa
// sui campi del titolare (ditta individuale, professionista) o è saltata
// (società, ente) e il banner lo dice senza offrire nulla.
function ImpCambioTitolaritaBanner({ onApriFoglio, onApplica }) {
  const [cambio, setCambio] = React.useState(() => window.byupReadHolderChange ? byupReadHolderChange() : null);
  React.useEffect(() => {
    const ri = () => setCambio(byupReadHolderChange());
    window.addEventListener('byup-holder-change', ri);
    return () => window.removeEventListener('byup-holder-change', ri);
  }, []);
  if (!cambio || !cambio.fiscal_chain_impacted || cambio.status === 'refused') return null;
  const conSoggetto = !!cambio.soggetto;
  const tappe = pnHolderTappe(cambio.change_type, cambio.legal_form);
  const serveDati = tappe.includes('fiscal_updated');
  const fatta = !!cambio.steps.fiscal_updated;
  const pronta = !!cambio.steps.verified && !fatta;
  const segna = () => { onApplica(cambio); byupHolderAvanza('fiscal_updated'); };
  return (
    <ImpCard title="Cambio di titolarità in corso" sub={conSoggetto
      ? `Da ${cambio.soggetto.prima.denominazione} (${cambio.soggetto.prima.piva}) a ${cambio.soggetto.dopo.denominazione} (${cambio.soggetto.dopo.piva})`
      : `Cambia il legale rappresentante: da Mario Rossi a ${cambio.entrante.nome}. Il soggetto fiscale resta.`}
      style={{marginBottom: 18, borderColor: fatta || !serveDati ? PN.GREEN_SOFT : '#FCD34D'}}>
      {conSoggetto ? (
        <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap'}}>
          <div style={{flex: 1, minWidth: 260, fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
            {fatta
              ? <><b style={{color: PN.GREEN}}>Dati fiscali aggiornati.</b> P.IVA precedente <b>{cambio.soggetto.prima.piva}</b> conservata: i documenti già emessi la portano e restano leggibili. Restano le deleghe.</>
              : 'Le tappe si fanno nel foglio: identità, dati del nuovo soggetto, poi le deleghe.'}
          </div>
          <ImpButton variant={fatta ? 'ghost' : 'primary'} onClick={onApriFoglio}>{fatta ? 'Rivedi il foglio' : 'Continua nel foglio'}</ImpButton>
        </div>
      ) : !serveDati ? (
        <div style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
          I dati di questa schermata non cambiano: per una società o un ente il legale rappresentante non è un dato fiscale del locale, e la tappa è saltata.
          Il passaggio si compie con le deleghe, che {cambio.entrante.nome} riconferisce con il proprio SPID.
          {' '}<a href="byup Profilo.html" style={{color: PN.PINK_DARK, fontWeight: 600}}>Segui il cambiamento in Account</a>.
        </div>
      ) : fatta ? (
        <div style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
          <b style={{color: PN.GREEN}}>Dati fiscali aggiornati.</b>
          {' '}<a href="byup Profilo.html" style={{color: PN.PINK_DARK, fontWeight: 600}}>Torna all'Account</a> per le deleghe.
        </div>
      ) : pronta ? (
        <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap'}}>
          <div style={{flex: 1, minWidth: 260, fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
            Aggiorna i dati del titolare qui sotto: nome, cognome e codice fiscale di {cambio.entrante.nome}. Nel prototipo il pulsante li compila con il mock e segna la tappa.
          </div>
          <ImpButton variant="primary" onClick={segna}>Segna i dati fiscali come aggiornati</ImpButton>
        </div>
      ) : (
        <div style={{fontSize: 14.5, color: PN.MUTED}}>Prima serve la verifica dell'identità in Account: poi si aggiornano i dati qui.</div>
      )}
    </ImpCard>
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
    sdi: 'ABC1234',
    pec: 'fatture@pec.cacioepepe.it',
    sedeIndirizzo: 'Via dei Giubbonari 27',
    sedeCitta: 'Roma',
    sedeCap: '00197',
    sedeProv: 'RM',
    sedeNazione: 'IT',
  });

  const [dirty, setDirty] = React.useState(false);
  const set = (k, v) => { setData(d => ({...d, [k]: v})); setDirty(true); };
  const [soggettoOpen, setSoggettoOpen] = React.useState(false);
  // La tappa fiscal_updated applica il cambiamento ai dati di questa
  // schermata: il nuovo soggetto (forma, denominazione, P.IVA — la
  // precedente resta conservata) o il nuovo titolare sui campi della persona.
  const applica = (c) => {
    if (c.soggetto) {
      const dopo = c.soggetto.dopo;
      const persona = dopo.forma === 'ditta_individuale' || dopo.forma === 'professionista';
      const [nome, ...resto] = (dopo.denominazione || '').split(' ');
      setData(d => ({ ...d, legalForm: dopo.forma || d.legalForm, pivaPrecedente: d.piva, piva: dopo.piva,
        ...(persona ? { ownerNome: nome || d.ownerNome, ownerCognome: resto.join(' ') || d.ownerCognome } : { ragione: dopo.denominazione }) }));
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

  const persona = data.legalForm === 'ditta_individuale' || data.legalForm === 'professionista';
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
      <ImpCambioTitolaritaBanner onApriFoglio={() => setSoggettoOpen(true)} onApplica={applica}/>
      {soggettoOpen && (
        <ImpSoggettoFoglio forma={data.legalForm} ragione={societa || ente ? data.ragione : `${data.ownerNome} ${data.ownerCognome}`} piva={data.piva}
          onClose={() => setSoggettoOpen(false)} onApplica={applica}/>
      )}

      {/* Collegamento all'Agenzia: promemoria progressivo, blocco a scadenza,
          verifica all'inserimento — il perché e il come stanno nel commento
          in testa al file. */}
      <AdeCredenzialiCard/>

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
            <ImpCard title="Dati anagrafici" sub="La forma giuridica decide quali dati fiscali esistono" style={{marginBottom: 0, height: '100%'}}>
              {/* La forma è la PRIMA domanda: tutto il resto della schermata
                  discende da qui. Prima si chiedeva a chiunque ragione
                  sociale, REA e capitale, e la ditta individuale — la forma
                  più diffusa del settore — riempiva campi che non ha. */}
              <ImpField label="Forma giuridica" hint={
                persona ? 'Contano i dati della persona: niente ragione sociale né registro imprese'
                : ente ? 'Denominazione e sede; REA e CCIAA solo se l\'ente li ha'
                : 'Denominazione e dati di registro imprese'
              }>
                <select value={data.legalForm} onChange={e => set('legalForm', e.target.value)} style={selectStyle}>
                  {FORME_GIURIDICHE.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </ImpField>
              {persona ? (
                <React.Fragment>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
                    <ImpField label="Nome del titolare">
                      <ImpInput value={data.ownerNome} onChange={e => set('ownerNome', e.target.value)}/>
                    </ImpField>
                    <ImpField label="Cognome del titolare">
                      <ImpInput value={data.ownerCognome} onChange={e => set('ownerCognome', e.target.value)}/>
                    </ImpField>
                  </div>
                  {/* Il luogo di nascita sono DUE campi — comune e Stato — come
                      nel modello. La data è raccolta su obbligo legale: si usa
                      qui e basta, nessun'altra schermata la legge. Righe da
                      due: la card è a mezza larghezza, in tre si strozzano. */}
                  {/* minmax(0,1fr): l'input date ha una larghezza intrinseca
                      che con `1fr` puro si prende la colonna e strozza il
                      comune accanto. */}
                  <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap: 14, marginTop: 4}}>
                    <ImpField label="Data di nascita" hint="Richiesta per legge: usata solo qui">
                      <ImpInput type="date" value={data.ownerNascita} onChange={e => set('ownerNascita', e.target.value)}/>
                    </ImpField>
                    <ImpField label="Comune di nascita">
                      <ImpInput value={data.ownerComuneNascita} onChange={e => set('ownerComuneNascita', e.target.value)}/>
                    </ImpField>
                  </div>
                  {/* Il CF della persona NON è la P.IVA: è esattamente il dato
                      che prima nasceva sbagliato. Qui il campo aziendale
                      sparisce: per la persona fisica sono la stessa cosa. */}
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14, marginTop: 4}}>
                    <ImpField label="Stato di nascita">
                      <select value={data.ownerStatoNascita} onChange={e => set('ownerStatoNascita', e.target.value)} style={selectStyle}>
                        {STATI_NASCITA.map(([cod, nome]) => <option key={cod} value={cod}>{nome} ({cod})</option>)}
                      </select>
                    </ImpField>
                    <ImpField label="Codice fiscale del titolare" hint="16 caratteri, diverso dalla P.IVA">
                      <ImpInput value={data.ownerCf} onChange={e => set('ownerCf', e.target.value.toUpperCase())} style={{fontFamily:'ui-monospace, monospace', letterSpacing: 0.5}}/>
                    </ImpField>
                  </div>
                  <div style={{marginTop: 4}}>
                    <ImpCampoBloccato label="Partita IVA" value={data.piva} hint={data.pivaPrecedente ? `Precedente ${data.pivaPrecedente}, conservata sui documenti già emessi` : 'È il soggetto fiscale: non si modifica, si cambia'}/>
                    <ImpButton variant="ghost" onClick={() => setSoggettoOpen(true)} style={{marginTop: -6}}>Cambia soggetto fiscale</ImpButton>
                  </div>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {/* Ragione sociale e P.IVA sono il soggetto fiscale: non si
                      scrivono, si cambiano col foglio (P-62 · D-52). */}
                  <ImpCampoBloccato label={ente ? 'Denominazione' : 'Ragione sociale'} value={data.ragione} hint={ente ? 'Come risulta da statuto' : 'Come risulta a registro imprese'}/>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
                    <div>
                      <ImpCampoBloccato label="Partita IVA" value={data.piva} hint={data.pivaPrecedente ? `Precedente ${data.pivaPrecedente}, conservata sui documenti già emessi` : 'È il soggetto fiscale: non si modifica, si cambia'}/>
                      <ImpButton variant="ghost" onClick={() => setSoggettoOpen(true)} style={{marginTop: -6}}>Cambia soggetto fiscale</ImpButton>
                    </div>
                    <ImpField label="Codice fiscale">
                      <ImpInput value={data.cf} onChange={e => set('cf', e.target.value)}/>
                    </ImpField>
                  </div>
                </React.Fragment>
              )}
              <ImpField label="Insegna" hint="Stampata in cima allo scontrino" style={{marginTop: 4}}>
                <ImpInput value={data.insegna} onChange={e => set('insegna', e.target.value)}/>
              </ImpField>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14, marginTop: 4}}>
                <ImpField label="Regime fiscale">
                  <select value={data.regime} onChange={e => set('regime', e.target.value)} style={selectStyle}>
                    <option>Ordinario</option>
                    <option>Forfettario</option>
                    <option>Semplificato</option>
                  </select>
                </ImpField>
                <ImpField label="Codice ATECO">
                  <ImpInput value={data.ateco} onChange={e => set('ateco', e.target.value)}/>
                </ImpField>
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
            sub="Informazioni fiscali e amministrative. Utili anche se collegherai un servizio esterno (es. Aruba)"
          >
            {/* Niente più Ragione sociale né ATECO qui: stavano già nella
                card anagrafica, e due campi per lo stesso dato sono due
                occasioni di divergere. La fonte è una. */}

            {/* La parte di registro imprese esiste solo per società ed enti:
                la persona fisica non ha né REA né capitale, e chieder-
                glieli era esattamente il difetto di P-86. Per l'ente REA e
                CCIAA restano ma facoltativi; capitale e socio unico sono
                solo delle società. */}
            {!persona && (
              <React.Fragment>
                <div style={{
                  fontSize: 15.5, fontWeight: 700, color: PN.TEXT,
                  marginTop: 4, marginBottom: 10,
                }}>Camera di Commercio</div>
                <div style={{display:'grid', gridTemplateColumns: societa ? '1fr 1fr 1fr' : '1fr 1fr', gap: 14}}>
                  <ImpField label="Numero REA" hint={ente ? 'Facoltativo: solo se l\'ente è a registro imprese' : undefined}>
                    <ImpInput value={data.rea} onChange={e => set('rea', e.target.value)}/>
                  </ImpField>
                  <ImpField label="CCIAA" hint={ente ? 'Facoltativa' : undefined}>
                    <ImpInput value={data.cciaa} onChange={e => set('cciaa', e.target.value)}/>
                  </ImpField>
                  {societa && (
                    <ImpField label="Capitale sociale (€)" hint="Solo società di capitali">
                      <ImpInput value={data.capitaleSociale} onChange={e => set('capitaleSociale', e.target.value)}/>
                    </ImpField>
                  )}
                </div>
                <div style={{display:'flex', gap: 18, marginTop: 10}}>
                  {societa && (
                    <label style={{display:'inline-flex', alignItems:'center', gap: 8, cursor:'pointer', fontSize: 14.5}}>
                      <input type="checkbox" checked={data.socioUnico} onChange={e => set('socioUnico', e.target.checked)} style={{accentColor: PN.PINK, width: 14, height: 14}}/>
                      Socio unico
                    </label>
                  )}
                  <label style={{display:'inline-flex', alignItems:'center', gap: 8, cursor:'pointer', fontSize: 14.5}}>
                    <input type="checkbox" checked={data.inLiquidazione} onChange={e => set('inLiquidazione', e.target.checked)} style={{accentColor: PN.PINK, width: 14, height: 14}}/>
                    In liquidazione
                  </label>
                </div>
              </React.Fragment>
            )}

            <div style={{
              fontSize: 15.5, fontWeight: 700, color: PN.TEXT,
              marginTop: persona ? 4 : 22, marginBottom: 10,
            }}>SDI e fatturazione elettronica</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
              <ImpField label="Codice Destinatario SDI">
                <ImpInput value={data.sdi} onChange={e => set('sdi', e.target.value)} style={{fontFamily:'ui-monospace, monospace', letterSpacing: 0.5}}/>
              </ImpField>
              <ImpField label="PEC per invio SDI">
                <ImpInput value={data.pec} onChange={e => set('pec', e.target.value)}/>
              </ImpField>
            </div>

            {/* Per la persona fisica la "sede legale" non esiste: il suo
                equivalente è il domicilio fiscale. Stessi campi, nome giusto. */}
            <div style={{
              fontSize: 15.5, fontWeight: 700, color: PN.TEXT,
              marginTop: 22, marginBottom: 10,
            }}>{persona ? 'Domicilio fiscale' : 'Sede legale'}</div>
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14}}>
              <ImpField label="Indirizzo e civico">
                <ImpInput value={data.sedeIndirizzo} onChange={e => set('sedeIndirizzo', e.target.value)}/>
              </ImpField>
              <ImpField label="CAP">
                <ImpInput value={data.sedeCap} onChange={e => set('sedeCap', e.target.value)}/>
              </ImpField>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14, marginTop: 4}}>
              <ImpField label="Città">
                <ImpInput value={data.sedeCitta} onChange={e => set('sedeCitta', e.target.value)}/>
              </ImpField>
              <ImpField label="Provincia">
                <ImpInput value={data.sedeProv} onChange={e => set('sedeProv', e.target.value)}/>
              </ImpField>
              <ImpField label="Nazione">
                <select value={data.sedeNazione} onChange={e => set('sedeNazione', e.target.value)} style={{
                  width:'100%', padding:'10px 12px', border:`1px solid ${PN.BORDER}`,
                  borderRadius:9, fontSize:15.5, background:PN.WHITE, fontFamily:'inherit',
                }}>
                  <option value="IT">Italia (IT)</option>
                  <option value="SM">San Marino (SM)</option>
                  <option value="VA">Città del Vaticano (VA)</option>
                </select>
              </ImpField>
            </div>

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
            <div style={{display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap'}}>
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
                    background:'#D1FAE5', color:'#065F46',
                    fontSize: 12.5, fontWeight: 700,
                  }}>
                    <span style={{width: 6, height: 6, borderRadius:'50%', background:'#059669'}}/>
                    Attivo
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

          {/* Info: scontrino digitale gestito da byup tramite POS */}
          <div style={{
            padding: '14px 16px',
            background: PN.BLUE_SOFT, borderRadius: 12,
            display:'flex', gap: 12, alignItems:'flex-start',
          }}>
            <span style={{fontSize: 20}}>ℹ️</span>
            <div style={{fontSize: 14, color:'#1E40AF', lineHeight: 1.5}}>
              <b>Lo scontrino è 100% digitale</b>: puoi però stampare uno scontrino di cortesia se te lo chiedono.
            </div>
          </div>

        </div>

        {/* Anteprima scontrino */}
        <aside style={{position:'sticky', top: 0}}>
          <ScontrinoPreview data={data}/>
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
