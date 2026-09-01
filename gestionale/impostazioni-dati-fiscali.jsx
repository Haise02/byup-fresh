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
    banca: 'Banca Intesa Sanpaolo',
    iban: 'IT60X0542811101000000123456',
    swift: 'BCITITMM',
  });

  const [dirty, setDirty] = React.useState(false);
  const set = (k, v) => { setData(d => ({...d, [k]: v})); setDirty(true); };

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
      {/* Status banner */}
      <div style={{
        display:'flex', alignItems:'center', gap: 14,
        padding: '14px 18px',
        background: isComplete ? '#F0FDF4' : PN.AMBER_SOFT,
        border: `1.5px solid ${isComplete ? PN.GREEN_SOFT : '#FCD34D'}`,
        borderRadius: 12,
        marginBottom: 18,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: isComplete ? PN.GREEN : PN.AMBER,
          color: PN.WHITE,
          display:'grid', placeItems:'center',
          flexShrink: 0,
        }}>{isComplete ? <BuIcons.check size={18} color={PN.WHITE}/> : <BuIcons.alert size={18} color={PN.WHITE}/>}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:16, fontWeight:700, color: isComplete ? PN.GREEN : PN.AMBER}}>
            {isComplete
              ? 'Anagrafica completa. I dati appaiono correttamente sugli scontrini'
              : `${missing.length} ${missing.length===1?'campo mancante':'campi mancanti'} per emettere scontrini conformi`}
          </div>
          <div style={{fontSize:14, color: PN.MUTED, marginTop: 2}}>
            {isComplete
              ? 'Insegna, P.IVA e indirizzo sede vengono stampati in cima al documento commerciale'
              : `Mancano: ${missing.map(m => m.label).join(', ')}`
            }
          </div>
        </div>
      </div>

      {/* Collegamento all'Agenzia: promemoria progressivo, blocco a scadenza,
          verifica all'inserimento — il perché e il come stanno nel commento
          in testa al file. */}
      <AdeCredenzialiCard/>

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
                  <ImpField label="Partita IVA" hint={data.piva.length === 13 ? 'Verificata (AdE)' : 'Inserisci 11 cifre con prefisso IT'} style={{marginTop: 4}}>
                    <div style={{position:'relative'}}>
                      <ImpInput value={data.piva} onChange={e => set('piva', e.target.value)}/>
                      {data.piva.length === 13 && (
                        <span style={{
                          position:'absolute', right: 10, top:'50%', transform:'translateY(-50%)',
                          color: PN.GREEN, display:'inline-flex',
                        }}><BuIcons.check size={14}/></span>
                      )}
                    </div>
                  </ImpField>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <ImpField label={ente ? 'Denominazione' : 'Ragione sociale'} hint={ente ? 'Come risulta da statuto' : 'Come risulta a registro imprese'}>
                    <ImpInput value={data.ragione} onChange={e => set('ragione', e.target.value)}/>
                  </ImpField>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
                    <ImpField label="Partita IVA" hint={data.piva.length === 13 ? 'Verificata (AdE)' : 'Inserisci 11 cifre con prefisso IT'}>
                      <div style={{position:'relative'}}>
                        <ImpInput value={data.piva} onChange={e => set('piva', e.target.value)}/>
                        {data.piva.length === 13 && (
                          <span style={{
                            position:'absolute', right: 10, top:'50%', transform:'translateY(-50%)',
                            color: PN.GREEN, display:'inline-flex',
                          }}><BuIcons.check size={14}/></span>
                        )}
                      </div>
                    </ImpField>
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

            <div style={{
              fontSize: 15.5, fontWeight: 700, color: PN.TEXT,
              marginTop: 22, marginBottom: 10,
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <span>Dati bancari</span>
              <span style={{fontSize: 13, fontWeight: 500, color: PN.MUTED}}>
                Su fattura compare un solo IBAN
              </span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14}}>
              <ImpField label="Banca">
                <ImpInput value={data.banca} onChange={e => set('banca', e.target.value)}/>
              </ImpField>
              <ImpField label="IBAN">
                <ImpInput value={data.iban} onChange={e => set('iban', e.target.value)} style={{fontFamily:'ui-monospace, monospace', letterSpacing: 0.5}}/>
              </ImpField>
              <ImpField label="Codice Swift">
                <ImpInput value={data.swift} onChange={e => set('swift', e.target.value)}/>
              </ImpField>
            </div>

            <div style={{marginTop: 16}}>
              <button style={{
                padding:'10px 22px', borderRadius: 999,
                background: '#1A1A1A', color: PN.WHITE,
                border:'none', cursor:'pointer', fontFamily:'inherit',
                fontSize: 15, fontWeight: 600,
              }}>Modifica dati bancari</button>
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
