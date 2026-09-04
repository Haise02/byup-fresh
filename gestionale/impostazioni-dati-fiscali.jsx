// Impostazioni → Dati fiscali locale (anagrafica per scontrini + collegamento
// all'Agenzia delle Entrate — le credenziali Fisconline con cui trasmette il canale)

// ─── Collegamento all'Agenzia delle Entrate (PT §12.2 · P-104 · P-116 · P-120)
// Il canale «documento commerciale online» (via OpenAPI) trasmette con le
// credenziali Fisconline DELL'ESERCENTE — sempre, per tutte le forme (D-103):
// del titolare per la ditta individuale, della persona che il locale ha
// nominato incaricata sul portale per società ed enti (specifiche
// corrispettivi §2.9). Byup non nomina incaricati propri e non rinnova
// credenziali per conto di nessuno.
// La password scade ogni novanta giorni, e alla scadenza senza rinnovo
// «l'emissione si ferma» (PT §12.2). Quattro presidi:
//   1. promemoria progressivo a 14, 7 e 3 giorni — tre gradini veri, non uno;
//   2. la fascia in Contabilità → Cassa dal PRIMO gradino, non a scadenza;
//   3. il BLOCCO nei quattro punti dove nasce un documento (saldo del conto,
//      vendita diretta, le due schermate d'incasso dell'App Staff): il
//      pulsante si spegne e dice chi deve rinnovare;
//   4. verifica immediata all'inserimento, con una trasmissione di prova, che
//      sblocca da sé i quattro punti.
// Il canale espone anche l'evento di richiamata `receipt-credentials`: in
// produzione va sottoscritto come innesco del promemoria. È roba di backend:
// nel prototipo resta documentato qui, non si simula.
// Lo stato e i gradini vivono in panoramica-tokens.jsx (byupAdeCredStato),
// perché li leggono sei schermate su tre bundle: qui c'è la scheda.
const ADE_CRED_SOGLIE = window.PN_ADE_CRED_SOGLIE || [14, 7, 3];
const adeCredStato = () => window.byupAdeCredStato();

// ─── Incaricato Fisconline (P-116 · D-103) ─────────────────────────────────
// Per società ed enti il canale usa le credenziali personali di una persona
// fisica che il LOCALE nomina incaricata sul portale dell'Agenzia. Qui si
// dichiara chi è — nome, cognome, codice fiscale e data della nomina, cioè
// ade_operator_name e ade_operator_tax_code del modello — e quali sono le sue
// credenziali: password Fisconline e PIN. Sono la stessa cosa, la persona e le
// sue chiavi, e stanno in una scheda sola: si cambiano insieme perché insieme
// vengono provate.
// NIENTE SI APPLICA SULLA PAROLA: alla conferma parte una trasmissione di
// prova, e finché non passa restano attivi i dati e le credenziali di prima —
// il canale non può ritrovarsi con un nome nuovo e una password che l'Agenzia
// rifiuta. Il primo giro fallisce apposta: è il caso vero di chi incolla la
// password sbagliata, e deve saperlo adesso e non al primo scontrino.
// Byup non è parte della nomina, che si compie sul portale.
function AdeIncaricatoCard({ forma, titolare }) {
  // La ditta individuale non ha un incaricato: le credenziali sono del
  // titolare, e la persona non si sceglie qui — è quella dei dati anagrafici.
  // Cambiano solo le chiavi, e si provano allo stesso modo.
  const persona = forma === 'ditta_individuale';
  const [inc, setInc] = React.useState(() => window.byupReadIncaricato());
  const [cred, setCred] = React.useState(() => adeCredStato());
  const [edit, setEdit] = React.useState(null);      // la bozza, mai applicata prima della prova
  const [fase, setFase] = React.useState('idle');    // idle | verifica | errore
  const [tentativi, setTentativi] = React.useState(0);
  const [salvato, setSalvato] = React.useState(false);
  React.useEffect(() => {
    const ri = () => { setInc(window.byupReadIncaricato()); setCred(adeCredStato()); };
    window.addEventListener('byup-ade-incaricato-change', ri);
    window.addEventListener('byup-ade-cred-change', ri);
    return () => { window.removeEventListener('byup-ade-incaricato-change', ri); window.removeEventListener('byup-ade-cred-change', ri); };
  }, []);
  const chi = persona ? { nome: (titolare && titolare.nome) || '', cognome: (titolare && titolare.cognome) || '', cf: (titolare && titolare.cf) || '', nominato_il: null } : inc;
  const nominato = !!(chi && chi.cf);
  // Credenziali mai provate: il registro non ha un rinnovo: il canale non ha
  // ancora trasmesso nulla, e la scheda lo dice invece di far finta di sì.
  const credProvate = !!cred.rinnovo;
  const apri = () => { setEdit({ nome: chi.nome, cognome: chi.cognome, cf: chi.cf, nominato_il: chi.nominato_il, password: '', pin: '' }); setFase('idle'); setSalvato(false); };
  const cf = ((edit && edit.cf) || '').toUpperCase().trim();
  const valido = !!edit && (persona || (!!(edit.nome || '').trim() && !!(edit.cognome || '').trim() && /^[A-Z0-9]{16}$/.test(cf)))
    && (credProvate || ((edit.password || '').trim() && (edit.pin || '').trim()));

  // La prova. Passata: si scrive l'incaricato e si riparte con novanta giorni
  // di password (byupAdeCredRinnova), che è ciò che sblocca i quattro punti di
  // emissione. Non passata: non si scrive niente.
  const verifica = () => {
    if (!valido || fase === 'verifica') return;
    setFase('verifica');
    const t = tentativi + 1; setTentativi(t);
    setTimeout(() => {
      if (t === 1) { setFase('errore'); return; }
      const d = new Date();
      if (!persona) window.byupWriteIncaricato({ nome: edit.nome.trim(), cognome: edit.cognome.trim(), cf,
        nominato_il: edit.nominato_il || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` });
      window.byupAdeCredRinnova();
      setFase('idle'); setEdit(null); setSalvato(true);
      setTimeout(() => setSalvato(false), 6000);
    }, 1600);
  };
  const data = (iso) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const inp = { width: '100%', padding: '9px 11px', border: `1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 14.5, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' };
  const lab = { fontSize: 12.5, fontWeight: 600, color: PN.MUTED, marginBottom: 4 };
  const campo = (chiave, etichetta, extra) => (
    <div>
      <div style={lab}>{etichetta}</div>
      <input value={(edit && edit[chiave]) || ''} onChange={e => { const v = e.target.value; setEdit(x => ({ ...(x || {}), [chiave]: chiave === 'cf' ? v.toUpperCase() : v })); if (fase === 'errore') setFase('idle'); }} {...(extra || {})}/>
    </div>
  );
  return (
    <ImpCard
      title={persona ? 'Credenziali Fisconline' : 'Incaricato Fisconline'}
      sub={persona
        ? 'Il canale trasmette i tuoi scontrini all\'Agenzia con le tue credenziali Fisconline: la password scade ogni novanta giorni e la rinnovi tu'
        : 'La procedura dell\'Agenzia si usa attraverso una persona incaricata: la nomini tu sul portale, e le credenziali con cui il canale trasmette sono le sue'}
      style={{marginBottom: 18}}>
      <style>{`@keyframes adeIncSpin { to { transform: rotate(360deg); } }`}</style>
      {nominato && !edit ? (
        <div style={{display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap'}}>
          <div style={{width: 40, height: 40, borderRadius: 10, background: credProvate ? PN.GREEN : PN.AMBER, display:'grid', placeItems:'center', flexShrink: 0}}>
            {credProvate ? BuIcons.check({size: 18, color: PN.WHITE}) : <BuIcons.alert size={18} color={PN.WHITE}/>}
          </div>
          <div style={{flex: 1, minWidth: 240}}>
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>{chi.nome} {chi.cognome}</div>
            <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2, lineHeight: 1.5}}>
              Codice fiscale <b style={{color: PN.TEXT, fontFamily:'ui-monospace, Menlo, monospace'}}>{chi.cf}</b>
              {persona ? ' · titolare del locale.' : <> · nominata incaricata sul portale il {data(chi.nominato_il)}.</>}
              {credProvate
                ? <> Password e PIN configurati{cred.verificata ? `, provati il ${cred.verificata}` : ''}: la password vale fino al {cred.scadenza}, e il rinnovo lo compie {persona ? 'il titolare' : 'lei'}.</>
                : <> <b style={{color: PN.AMBER}}>Password e PIN non ancora provati:</b> finché la trasmissione di prova non passa, il canale non trasmette.</>}
            </div>
          </div>
          <ImpButton variant={credProvate ? 'secondary' : 'primary'} onClick={apri}>{credProvate ? 'Modifica' : 'Inserisci le credenziali'}</ImpButton>
        </div>
      ) : (
        <div>
          {!persona && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1.2fr', gap: 12}}>
              {campo('nome', 'Nome', { style: inp })}
              {campo('cognome', 'Cognome', { style: inp })}
              {campo('cf', 'Codice fiscale', { placeholder: '16 caratteri', style: {...inp, fontFamily:'ui-monospace, Menlo, monospace', letterSpacing: 0.5} })}
            </div>
          )}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, marginTop: persona ? 0 : 12}}>
            {campo('password', 'Password Fisconline', { type: 'password', placeholder: credProvate ? 'Lascia vuoto per non cambiarla' : '••••••••••', style: inp })}
            {campo('pin', 'PIN', { type: 'password', placeholder: credProvate ? 'Lascia vuoto per non cambiarlo' : '••••••••••', style: inp })}
          </div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 8, lineHeight: 1.5}}>
            Alla conferma facciamo una trasmissione di prova con questi dati. <b style={{color: PN.TEXT}}>Finché non passa non cambia niente:</b> restano attivi la persona e le credenziali di prima.
          </div>
          <div style={{display:'flex', gap: 10, marginTop: 12, alignItems:'center', flexWrap:'wrap'}}>
            <ImpButton variant="primary" disabled={!valido || fase === 'verifica'} onClick={verifica}>
              {fase === 'verifica' && (
                <span style={{width: 12, height: 12, borderRadius: 999, flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.35)', borderTopColor: PN.WHITE, animation: 'adeIncSpin 0.7s linear infinite'}}/>
              )}
              {fase === 'verifica' ? 'Trasmissione di prova…' : 'Verifica e salva'}
            </ImpButton>
            {nominato && <ImpButton variant="ghost" onClick={() => { setEdit(null); setFase('idle'); }}>Annulla</ImpButton>}
          </div>
          {fase === 'errore' && (
            <div style={{marginTop: 10, padding: '10px 13px', background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.22)', borderRadius: 9, fontSize: 13.5, color: '#991B1B', lineHeight: 1.5}}>
              <b style={{fontWeight: 700}}>La trasmissione di prova è stata rifiutata.</b>{' '}
              Non è cambiato nulla: restano {persona ? 'le credenziali di prima' : 'la persona e le credenziali di prima'}. Ricontrolla {persona ? '' : 'il codice fiscale dell\'incaricato, che l\'incarico sia salvato sul portale, e '}di aver copiato password e PIN per intero.
            </div>
          )}
        </div>
      )}
      {salvato && (
        <div style={{marginTop: 12, padding: '10px 13px', borderRadius: 9, background: '#F0FDF4', border: `1px solid ${PN.GREEN_SOFT}`, fontSize: 13.5, color: '#065F46', lineHeight: 1.5}}>
          Trasmissione di prova riuscita: da adesso il canale trasmette con queste credenziali.
        </div>
      )}
      <div style={{marginTop: 14, padding: '11px 13px', borderRadius: 10, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, fontSize: 13.5, color: PN.MUTED, lineHeight: 1.55, display: persona ? 'none' : 'block'}}>
        <b style={{color: PN.TEXT}}>Come si nomina, sul portale dell'Agenzia.</b> Accedi con l'utenza del locale, vai su <b>Il tuo profilo → Incarichi → Gestisci incarichi come gestore</b>, scegli «Aggiungi incaricato», inserisci il suo codice fiscale e salva; poi, su quell'incaricato, <b>Azioni → Gestisci servizi</b>. Chi sia quella persona lo decidi tu: di norma il titolare o il rappresentante legale. Finché non è nominata, il canale non trasmette. Byup non è parte della nomina e non nomina incaricati propri.
      </div>
    </ImpCard>
  );
}

function AdeCredenzialiCard({ forma }) {
  const [, forza] = React.useState(0);
  React.useEffect(() => {
    const ri = () => forza(x => x + 1);
    window.addEventListener('byup-ade-cred-change', ri);
    window.addEventListener('byup-ade-incaricato-change', ri);
    return () => { window.removeEventListener('byup-ade-cred-change', ri); window.removeEventListener('byup-ade-incaricato-change', ri); };
  }, []);
  const cred = adeCredStato();
  // Chi rinnova: il titolare, o l'incaricato che il locale ha nominato sul
  // portale. Il testo lo nomina, perché chi legge deve sapere se tocca a lui.
  const chi = window.pnAdeChiRinnova ? window.pnAdeChiRinnova(forma) : { ruolo: 'titolare' };
  const incaricato = chi.ruolo === 'incaricato';
  const dilei = incaricato ? `di ${chi.nome}` : 'tue';
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
      // Il rinnovo sblocca da sé i quattro punti di emissione: lo stato è uno
      // solo e l'evento lo dice a tutte le schermate aperte.
      window.byupAdeCredRinnova();
      setPwd(''); setFase('idle');
      forza(x => x + 1);
    }, 1600);
  };

  // Credenziali mai provate: parla la scheda dell'incaricato, che è dove si
  // inseriscono la prima volta. Qui si parla del RINNOVO, e un rinnovo non si
  // chiede a chi non ha ancora messo niente.
  if (!cred.rinnovo) return null;

  // Collegamento attivo: la scheda non dice nulla. Il riepilogo verde —
  // «attivo, verificato il tale giorno, scade fra tanti» — ripeteva quello che
  // la scheda dell'incaricato già dice e occupava la cima della pagina per
  // annunciare che non c'era niente da fare. Qui si parla solo quando c'è da
  // fare qualcosa: dal primo gradino del promemoria in giù.
  if (cred.stato === 'ok') return null;

  const scaduta = cred.stato === 'scaduta';
  // I tre gradini sono TRE, e si vedono: a 14 giorni l'avviso è quieto, a 7
  // diventa ambra piena, a 3 rosso — poi c'è la scadenza, che blocca. Prima
  // c'era un solo stato «da quattordici giorni in giù», e chi lo vedeva la
  // prima volta lo vedeva uguale il giorno prima della scadenza.
  const urgente = cred.gradino === 3;
  const C_TITLE = scaduta ? '#991B1B' : urgente ? '#B91C1C' : PN.AMBER;
  return (
    <div data-ade-cred={cred.stato} data-ade-gradino={cred.gradino == null ? '' : String(cred.gradino)} style={{
      padding: '16px 18px',
      background: scaduta ? '#FEF2F2' : urgente ? '#FFF1F2' : cred.gradino === 7 ? PN.AMBER_SOFT : '#FFFBEB',
      border: `1.5px solid ${scaduta ? '#FECACA' : urgente ? '#FDA4AF' : cred.gradino === 7 ? '#FCD34D' : '#FDE68A'}`,
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
            {incaricato && <span style={{fontWeight: 600, color: PN.MUTED}}> · la rinnova {chi.nome}</span>}
          </div>
          <div style={{fontSize:14, color: PN.MUTED, marginTop: 2, lineHeight: 1.5}}>
            {scaduta
              ? `La trasmissione all'Agenzia usa le credenziali Fisconline ${dilei}, e la password scade ogni novanta giorni: da quando è scaduta ogni invio viene rifiutato e l'emissione è ferma in cassa, in sala e sull'App Staff. Rinnovala con i due passi qui sotto, nell'ordine.`
              : `Scade il ${cred.scadenza}. La trasmissione all'Agenzia usa le credenziali Fisconline ${dilei}: rinnovala prima, con i due passi qui sotto nell'ordine, o alla scadenza l'emissione si ferma.`}
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
                {incaricato ? <><b>{chi.nome}</b> cambia la sua password</> : 'Cambia la password'} nell'<a href="https://www.agenziaentrate.gov.it/portale/area-riservata" target="_blank" rel="noopener" style={{color: C_TITLE, fontWeight: 600}}>area riservata dell'Agenzia delle Entrate</a> (Fisconline).
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

// ─── Forma giuridica (P-116 · D-103 · ERD v11, tenant_identity FISC-01) ────
// legal_form ammette TRE valori: ditta_individuale, societa, ente — e i campi
// seguono la forma. Il professionista è uscito (D-103): chi somministra
// alimenti esercita un'impresa (art. 4 DPR 633/72, art. 2195 c.c.) e il
// rapporto FIPE 2026 non conosce la categoria — le imprese del settore sono
// individuali (46,5%), società di capitale (29,1%), società di persone
// (23,3%) e altre forme collettive (circa 1%). L'ente resta per quell'uno per
// cento, con i campi della società e nessun percorso proprio: non è più «in
// attesa della Soluzione Software».
// Per la ditta individuale sono obbligatori i dati della persona fisica: nome, cognome,
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
  { id: 'ditta_individuale', label: 'Ditta individuale' },
  { id: 'societa',           label: 'Società' },
  { id: 'ente',              label: 'Ente o altra forma collettiva' },
];
// Lo Stato di nascita è ISO alpha-2: nel prototipo bastano i più ricorrenti.
const STATI_NASCITA = [
  ['IT','Italia'], ['RO','Romania'], ['AL','Albania'], ['MA','Marocco'],
  ['CN','Cina'], ['EG','Egitto'], ['BD','Bangladesh'], ['PE','Perù'],
  ['UA','Ucraina'], ['DE','Germania'], ['FR','Francia'], ['ES','Spagna'],
];

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

// Quando non resta niente da fare la card lo dice una volta sola, in calma.
const POS_TUTTO_OK = 'Tutti gli strumenti sono dichiarati all\'Agenzia. Se ne colleghi uno nuovo, o ne scolleghi uno, te lo diciamo qui.';

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
  // Dichiarato è chiuso: la riga esce dall'evidenza e si raccoglie nel gruppo
  // in fondo, che resta contratto finché non lo apri. In evidenza restano
  // solo gli strumenti che aspettano qualcosa da te. Il gruppo si apre da sé
  // soltanto se il rimando da fuori punta a uno strumento già dichiarato:
  // spuntando la comunicazione, invece, la riga deve sparire, non riaprirsi.
  const pnPosGiaFatto = (l, id) => !!id && l.some(r => r.id === id && r.fiscal_link_status === 'linked');
  const [mostraFatti, setMostraFatti] = React.useState(() => pnPosGiaFatto(lista, aperto));
  React.useEffect(() => {
    const agg = () => setLista(byupReadPosCensimento());
    window.addEventListener('byup-pos-censimento', agg);
    window.addEventListener('storage', agg);
    // Il rimando da Personale porta anche quale strumento aprire.
    const go = (e) => {
      const d = e.detail;
      if (!d || typeof d !== 'object' || !d.strumento) return;
      setAperto(d.strumento);
      if (pnPosGiaFatto(byupReadPosCensimento(), d.strumento)) setMostraFatti(true);
    };
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
    ? POS_TUTTO_OK
    : fase === 'scaduta'
      ? `${scadute.length === 1 ? `${urgente.r.name} ha` : `${scadute.length} strumenti hanno`} la comunicazione in ritardo: la finestra è scaduta, e la comunicazione omessa o tardiva è sanzionata.`
      : fase === 'ultimi'
        ? `La finestra di ${urgente.r.name} si chiude tra pochi giorni: ${urgente.p.testo.toLowerCase()}.`
        : fase === 'aperta'
          ? `La finestra è aperta: ${urgente.r.name}, ${urgente.p.testo.toLowerCase()}.`
          : `Nessuna scadenza aperta. ${urgente.r.name}: ${urgente.p.testo.toLowerCase()}.`;

  // I due mucchi: chi aspetta ancora qualcosa da te, e chi è chiuso.
  const daFare = lista.filter(r => r.fiscal_link_status !== 'linked');
  const fatti  = lista.filter(r => r.fiscal_link_status === 'linked');
  const ultimo = fatti
    .filter(r => r.census_transmitted_at)
    .sort((a, b) => String(b.census_transmitted_at).localeCompare(String(a.census_transmitted_at)))[0];
  const ultimaData = ultimo
    ? new Date(ultimo.census_transmitted_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

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
      {daFare.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
          {daFare.map(r => <PosStrumento key={r.id} r={r} aperto={aperto === r.id} onApri={() => setAperto(aperto === r.id ? null : r.id)}/>)}
        </div>
      )}

      {/* Niente da fare: una riga calma, e tutto il resto sta nel gruppo. */}
      {daFare.length === 0 && lista.length > 0 && (
        <div style={{
          display:'flex', alignItems:'center', gap: 12, padding: '12px 14px', borderRadius: 11,
          background: PN.GREEN_SOFT, border: `1px solid ${PN.GREEN_SOFT}`,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: PN.GREEN, color: PN.WHITE, display:'grid', placeItems:'center', flexShrink: 0 }}>
            {BuIcons.check({size: 16, color: PN.WHITE})}
          </div>
          <div style={{ fontSize: 14.5, color: PN.GREEN, fontWeight: 600, lineHeight: 1.45 }}>{POS_TUTTO_OK}</div>
        </div>
      )}

      {/* Il gruppo dei dichiarati: una riga sola, contratta. Si apre se vuoi
          rivedere un foglio o disfare una dichiarazione. */}
      {fatti.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setMostraFatti(!mostraFatti)} className="pn-btn-feedback" style={{
            display:'flex', alignItems:'center', gap: 11, width:'100%', textAlign:'left',
            padding: '10px 14px', borderRadius: 11, cursor:'pointer', fontFamily:'inherit',
            background: '#F7F8FA', border: `1px solid ${PN.BORDER_SOFT}`,
          }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, background: PN.GREEN_SOFT, color: PN.GREEN, display:'grid', placeItems:'center' }}>
              {BuIcons.check({size: 13, color:'currentColor'})}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: PN.TEXT }}>
              {fatti.length === 1 ? '1 strumento già dichiarato' : `${fatti.length} strumenti già dichiarati`}
              {ultimaData && <span style={{ fontWeight: 500, color: PN.MUTED }}> · {fatti.length === 1 ? 'il' : "l'ultimo il"} {ultimaData}</span>}
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: PN.PINK_DARK, flexShrink: 0 }}>{mostraFatti ? 'Nascondi' : 'Mostra'}</span>
            <span style={{ display:'inline-flex', color: PN.MUTED, flexShrink: 0, transform: mostraFatti ? 'rotate(180deg)' : 'none', transition:'transform .16s' }}>
              {BuIcons.chevronDown({size: 13, color:'currentColor'})}
            </span>
          </button>
          {mostraFatti && (
            <div style={{ display:'flex', flexDirection:'column', gap: 8, marginTop: 8 }}>
              {fatti.map(r => <PosStrumento key={r.id} r={r} aperto={aperto === r.id} onApri={() => setAperto(aperto === r.id ? null : r.id)}/>)}
            </div>
          )}
        </div>
      )}
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
// giuridica. Se cambiano P.IVA o forma è un CAMBIO DI SOGGETTO FISCALE
// (P-117 · D-104): il «Sicuro?» avverte, si sceglie la causale, alla conferma
// i dati cambiano con il precedente conservato nella storia, Stripe si
// disabilita, i POS tornano da comunicare e si apre la catena dei passi, che
// si chiude con la riaccettazione dei termini a nome del nuovo soggetto.
// Chi rappresenta il locale non si chiede qui e non si chiede da nessuna
// parte: l'account è della persona, e non esiste un cambio del titolare.
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
  // La causale del cambiamento: la si sceglie da un elenco, perché «perché è
  // cambiato» è un dato del registro (reason) e non una nota libera.
  const [causale, setCausale] = React.useState('trasformazione_societaria');

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
    if (!cambiaSoggetto) { onSalva(campi); onClose(); return; }
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
    // Il record ha i nomi del modello: il precedente si CONSERVA — i
    // documenti già emessi portano quella partita IVA e devono restare
    // leggibili — e la causale distingue trasformazione, cessione e subentro.
    const record = {
      id: 'sc-' + Date.now(), change_type: 'legal_entity', reason: causale,
      previous_vat_number: data.piva,
      previous_tax_identification_number: data.cf || data.ownerCf || null,
      previous_denominazione: data.legalForm === 'ditta_individuale' ? `${data.ownerNome} ${data.ownerCognome}`.trim() : data.ragione,
      nuovo: { legalForm: f.legalForm, denominazione, piva: pivaPulita, campi },
      status: 'fiscal_updated', created_at: now,
      steps: { fiscal_updated: now },
    };
    byupWriteSoggettoChange(record);
    onApplica(record);
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
          <div style={{...MODAL_TITLE, fontSize: 21}}>Cambia soggetto fiscale</div>
          <div style={{...MODAL_SUB, fontSize: 13.5, marginTop: 2}}>
            Anagrafica e dati per fatturazione, insieme: la forma giuridica decide quali esistono. Se cambiano partita IVA o forma, cambia il soggetto fiscale: la P.IVA di oggi resta come precedente sui documenti già emessi.
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
                    {FORME_GIURIDICHE.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
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
                      {/* P-116: per società ed enti le credenziali del canale sono di
                  una persona nominata incaricata sul portale. Chi sia si
                  dichiara qui, sotto la forma: senza, il canale non parte. */}
              {!persona && (
                <div style={{padding: '10px 12px', borderRadius: 10, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, fontSize: 12.5, color: PN.MUTED, lineHeight: 1.45}}>
                  Gli scontrini li trasmette la persona che nomini incaricata sul portale dell'Agenzia: nome, cognome e codice fiscale si dichiarano nella scheda «Chi trasmette gli scontrini», qui sotto in pagina.
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
            <div style={{paddingTop: 8, borderTop: `1px solid ${PN.BORDER_SOFT}`, display:'flex', gap: 16, alignItems:'flex-start', flexWrap:'wrap'}}>
              <div style={{flex: 1, minWidth: 320, fontSize: 13.5, color: PN.TEXT, lineHeight: 1.45}}>
                <b>Cambia il soggetto fiscale.</b> Da {data.legalForm === 'ditta_individuale' ? `${data.ownerNome} ${data.ownerCognome}` : data.ragione} ({data.piva}) a {denominazione || '…'} ({pivaPulita || '…'}): Stripe si disabilita, la delega va riconferita, le credenziali del canale sono del nuovo soggetto, i POS vanno comunicati di nuovo, e alla fine i termini si riaccettano a suo nome — è un nuovo soggetto giuridico, e il contratto lo firma lui.
              </div>
              <div style={{minWidth: 240}}>
                <div style={LAB}>Causale</div>
                <select data-causale value={causale} onChange={e => setCausale(e.target.value)} style={INP}>
                  {(window.PN_SOGGETTO_CAUSALI || []).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {chiedi && (
          <div onClick={() => setChiedi(false)} style={{position:'absolute', inset: 0, background:'rgba(15,17,21,0.38)', display:'grid', placeItems:'center', zIndex: 5, borderRadius: 'inherit', padding: 20}}>
            <div onClick={e => e.stopPropagation()} style={{...MODAL_PANEL, width: 520, padding: '22px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.28)'}}>
              <div style={{fontSize: 21, fontWeight: 800, letterSpacing: -0.4, color: PN.TEXT}}>Sicuro?</div>
              <div style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.55, marginTop: 8}}>
                Il tuo collegamento a Stripe viene disabilitato e anche le deleghe dovranno essere rifatte: finché non le rifai non potrai emettere scontrini né ricevere pagamenti. Anche i POS andranno comunicati di nuovo all'Agenzia dal nuovo soggetto, e alla fine i termini e condizioni vanno riaccettati a nome suo: fino ad allora il cambiamento non è concluso.
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

// ─── «Rinnova la delega» (P-117 · D-104; P-49 · D-40) ──────────────────────
// Due usi, una finestra: si apre da sola dopo la conferma di un nuovo
// soggetto, e si apre a richiesta — dal pulsante «Rinnova la delega» in Dati
// fiscali — quando la delega va rifatta senza che il soggetto cambi, perché è
// cambiata la persona che la conferisce o perché sta per scadere. Chi
// rappresenta il soggetto la riconferisce con il proprio SPID; la precedente
// si revoca, e i due atti si dichiarano con la loro data nel registro delle
// deleghe (ade_delegations: conferimento, revoca, date, responsabile). Stessa procedura della card dell'onboarding
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

// ─── Attivazioni fiscali: la delega, e le due cose che ne discendono ───────
// Erano nell'onboarding e non ci sono più (4 settembre 2026): chiedere la
// delega prima di far entrare qualcuno voleva dire fermarlo sulla porta per un
// atto che si compie su un altro sito, con SPID. Ora il locale entra, e la
// campanella gli chiede di collegarsi: la notifica porta qui.
//   1. la DELEGA è un atto suo sul portale, con la sua identità: Byup non può
//      prenderla al posto suo, può solo rendere indolori i due minuti — il
//      codice fiscale pronto, il portale a un click, i tap in ordine — e poi
//      controllarne l'esito. I servizi delegabili sono due (P-49 · D-40) e si
//      spuntano entrambi: con uno solo la delega c'è ma non basta.
//   2. la CONSERVAZIONE la attiva Byup con la delega, da sola.
//   3. l'ACCREDITAMENTO come esercente lo fa Byup con la delega: da lì il menù
//      del collegamento dei POS compare, e il passo zero di P-105 è compiuto.
// La scheda vive finché serve: quando tutte e tre sono a posto sparisce, come
// il banner dei campi mancanti in cima alla pagina. Un riquadro verde che dice
// «non c'è niente da fare» non è un'informazione, è un ingombro.
function AdeAttivazioniCard() {
  const [reg, setReg] = React.useState(() => window.byupReadDelega());
  const [fase, setFase] = React.useState('idle');     // idle | verifica | errore
  const [tentativi, setTentativi] = React.useState(0);
  React.useEffect(() => {
    const ri = () => setReg(window.byupReadDelega());
    window.addEventListener('byup-ade-delega-change', ri);
    return () => window.removeEventListener('byup-ade-delega-change', ri);
  }, []);
  // Le due attivazioni di Byup partono da sole appena la delega è attiva, una
  // dopo l'altra: nessun pulsante dell'esercente, da nessuna parte.
  React.useEffect(() => {
    if (reg.delega !== 'attiva') return;
    if (reg.conservazione === 'corso') {
      const t = setTimeout(() => window.byupWriteDelega({ ...window.byupReadDelega(), conservazione: 'attiva', accreditamento: 'corso' }), 2200);
      return () => clearTimeout(t);
    }
    if (reg.accreditamento === 'corso') {
      const t = setTimeout(() => window.byupWriteDelega({ ...window.byupReadDelega(), accreditamento: 'attivo' }), 1800);
      return () => clearTimeout(t);
    }
  }, [reg.delega, reg.conservazione, reg.accreditamento]);

  // Il controllo non si fida sulla parola: il primo giro finisce in «non
  // trovata» — chi torna qui dopo trenta secondi la delega non ce l'ha ancora
  // — e la diagnosi dice dove guardare, nell'ordine in cui si sbaglia.
  const controlla = () => {
    if (fase === 'verifica') return;
    setFase('verifica');
    const t = tentativi + 1; setTentativi(t);
    setTimeout(() => {
      if (t === 1) { setFase('errore'); return; }
      setFase('idle');
      window.byupWriteDelega({ ...window.byupReadDelega(), delega: 'attiva', attivata_il: new Date().toISOString(), conservazione: 'corso' });
    }, 1600);
  };

  if (window.byupDelegaCompleta && window.byupDelegaCompleta()) return null;

  const pastiglia = (tono, label) => {
    const T = { attesa: { bg: PN.AMBER_SOFT, fg: '#B45309' }, corso: { bg: '#F4F5F7', fg: PN.MUTED },
      errore: { bg: '#FEE2E2', fg: '#991B1B' }, ok: { bg: PN.GREEN_SOFT, fg: '#065F46' } }[tono];
    return (
      <span style={{display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0, padding:'4px 11px', borderRadius: 999,
        background: T.bg, color: T.fg, fontSize: 13, fontWeight: 700, whiteSpace:'nowrap'}}>
        {tono === 'corso' && <span style={{width: 11, height: 11, borderRadius: 999, border: '1.5px solid rgba(15,17,21,0.18)', borderTopColor: PN.MUTED, animation: 'adeAttSpin 0.7s linear infinite'}}/>}
        {label}
      </span>
    );
  };
  const statoDelega = fase === 'verifica' ? pastiglia('corso', 'Controllo in corso…')
    : fase === 'errore' ? pastiglia('errore', 'Non trovata')
    : reg.delega === 'attiva' ? pastiglia('ok', 'Attiva') : pastiglia('attesa', 'Da dare');
  const statoConserv = reg.conservazione === 'attiva' ? pastiglia('ok', 'Attiva')
    : reg.conservazione === 'corso' ? pastiglia('corso', 'In corso…') : pastiglia('attesa', 'In attesa della delega');
  const statoAccr = reg.accreditamento === 'attivo' ? pastiglia('ok', 'Accreditato')
    : reg.accreditamento === 'corso' ? pastiglia('corso', 'In corso…') : pastiglia('attesa', 'In attesa della delega');

  const riga = (titolo, sotto, stato) => (
    <div style={{display:'flex', alignItems:'flex-start', gap: 12, padding:'11px 0', borderTop: `1px solid ${PN.BORDER_SOFT}`}}>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>{titolo}</div>
        <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>{sotto}</div>
      </div>
      {stato}
    </div>
  );

  return (
    <ImpCard title="Attivazioni fiscali" sub="Tre cose: la delega la dai tu sul portale dell'Agenzia, le altre due le fa Byup con quella delega" style={{marginBottom: 18}}>
      <style>{`@keyframes adeAttSpin { to { transform: rotate(360deg); } }`}</style>
      <div>
        {riga('1 · Delega all\'Agenzia delle Entrate', 'Un atto tuo, sul portale, con il tuo SPID. Byup controlla che sia arrivata. Finché manca, le fatture non partono.', statoDelega)}
        {riga('2 · Conservazione delle fatture elettroniche', 'La attiva Byup appena la delega è attiva. Non devi fare nulla.', statoConserv)}
        {riga('3 · Accreditamento come esercente', 'Lo fa Byup con la delega: da lì ti compare il menù per collegare i POS all\'Agenzia.', statoAccr)}
      </div>

      {reg.delega !== 'attiva' && (
        <React.Fragment>
          <div style={{marginTop: 14, paddingTop: 14, borderTop: `1px solid ${PN.BORDER_SOFT}`}}>
            <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>La delega, in due minuti</div>
            <div style={{fontSize: 14, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
              Due servizi in una delega sola: «{ADE_SERVIZI[0]}», con cui Byup conserva le tue fatture presso l'Agenzia; «{ADE_SERVIZI[1]}», con cui Byup ti accredita come esercente. Servono entrambi, e serve solo il tuo accesso con SPID: le tue credenziali non le chiediamo.
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap', marginTop: 12, padding:'11px 13px', borderRadius: 10, background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`}}>
            <div style={{flex: 1, minWidth: 150}}>
              <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase'}}>Codice fiscale di Byup</div>
              <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, fontFamily:'ui-monospace, Menlo, monospace', letterSpacing: 0.5, userSelect:'all'}}>{ADE_CF_BYUP}</div>
            </div>
            <PosCopia valore={ADE_CF_BYUP}/>
            <a href={ADE_PORTALE} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex', alignItems:'center', gap: 6, padding:'8px 14px', borderRadius: 9, background: PN.TEXT, color: PN.WHITE, fontSize: 14.5, fontWeight: 600, textDecoration:'none'}}>
              Apri il portale
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>
            </a>
          </div>
          <div style={{marginTop: 12, padding:'11px 13px', borderRadius: 10, background: PN.WHITE, border:`1px solid ${PN.BORDER_SOFT}`}}>
            <div style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>Come si fa, in {ADE_PASSI.length} tap</div>
            <ol style={{margin: 0, paddingLeft: 20, display:'flex', flexDirection:'column', gap: 3}}>
              {ADE_PASSI.map((x, i) => <li key={i} style={{fontSize: 14, color: PN.TEXT, lineHeight: 1.45}}>{x}</li>)}
            </ol>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap', marginTop: 12}}>
            <div style={{flex: 1, minWidth: 220, fontSize: 14, color: PN.MUTED, lineHeight: 1.45}}>
              {fase === 'verifica' ? 'Sto controllando la delega presso l\'Agenzia…' : 'Quando hai confermato sul portale, premi Fatto: controlliamo la delega.'}
            </div>
            <ImpButton variant="primary" disabled={fase === 'verifica'} onClick={controlla}>{fase === 'errore' ? 'Riprova' : 'Fatto'}</ImpButton>
          </div>
          {fase === 'errore' && (
            <div style={{marginTop: 10, padding:'11px 13px', borderRadius: 10, background:'rgba(220, 38, 38, 0.06)', border:'1px solid rgba(220, 38, 38, 0.22)', fontSize: 14, color: PN.TEXT, lineHeight: 1.5}}>
              <b style={{color: '#991B1B'}}>Delega non trovata.</b> Ricontrolla, in quest'ordine:
              <ol style={{margin:'6px 0 0', paddingLeft: 20, display:'flex', flexDirection:'column', gap: 3}}>{ADE_CAUSE.map((x, i) => <li key={i}>{x}</li>)}</ol>
            </div>
          )}
        </React.Fragment>
      )}
    </ImpCard>
  );
}

function ImpDelegaRiconfermaModal({ onClose, denominazione }) {
  const [, forza] = React.useState(0);
  React.useEffect(() => {
    const ri = () => forza(x => x + 1);
    window.addEventListener('byup-soggetto-change', ri);
    return () => window.removeEventListener('byup-soggetto-change', ri);
  }, []);
  const c = window.byupSoggettoInCorso ? byupSoggettoInCorso() : null;
  const [stato, setStato] = React.useState('attesa');   // attesa | verifica | errore | attivo
  const [tentativi, setTentativi] = React.useState(0);
  // Senza un cambio di soggetto in corso la finestra vale lo stesso: è il
  // rinnovo a richiesta, e allora non c'è nessuna tappa da segnare.
  const fatta = !!(c && c.steps && c.steps.delegations_renewed);
  React.useEffect(() => {
    if (c && !fatta && stato === 'attivo') byupSoggettoAvanza('delegations_renewed');
  }, [stato]);
  const chi = (window.PN_UTENTE && PN_UTENTE.nome) || 'Mario Rossi';
  const perChi = c ? c.nuovo.denominazione : (denominazione || 'Cacio e Pepe S.r.l.');
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
            La delega è conferita da una persona per conto di un contribuente: quando cambia il soggetto, o quando cambia chi lo rappresenta, va rifatta — e la precedente si revoca.
            La dà <b style={{color: PN.TEXT}}>{chi}</b> per <b style={{color: PN.TEXT}}>{perChi}</b>, dal proprio accesso al portale.
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>
        <div className="pn-scroll" style={{...MODAL_BODY, overflowY:'auto', display:'flex', flexDirection:'column', gap: 12}}>
          {fatta ? (
            <div style={{padding:'12px 14px', borderRadius: 10, background: PN.GREEN_SOFT, fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>
              <b style={{color: PN.GREEN}}>Delega riconferita e precedente revocata.</b> {c && c.status === 'completed' ? 'Il cambiamento di soggetto è concluso.' : c ? 'Restano gli altri passi del cambio di soggetto.' : 'I due atti sono a registro con la loro data.'}
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


// ─── La catena del cambio di soggetto (P-117 · D-104) ──────────────────────
// Si apre da sola alla conferma del «Sicuro?», e si riapre dal banner finché
// il cambiamento non è concluso. Sei passi, con lo stato di ciascuno: i dati
// fiscali (fatti alla conferma), la delega riconferita e revocata, le
// credenziali del canale del nuovo soggetto con la trasmissione di prova, il
// conto Stripe del nuovo soggetto con la sua verifica, il censimento dei POS
// rifatto, e infine la RIACCETTAZIONE dei termini: è un nuovo soggetto
// giuridico, quindi il contratto lo firma lui, con la stessa finestra della
// firma dell'onboarding e la stessa prova (versione e impronta). Finché non è
// firmato, il cambiamento non è concluso.
// I passi 3, 4 e 5 hanno blocchi propri che valgono per conto loro: senza
// credenziali non partono scontrini, senza Stripe non si incassa.
function ImpDopoSoggettoModal({ onClose, onDelega, onPos, onFirma }) {
  const [, forza] = React.useState(0);
  const [stripe, setStripe] = React.useState(() => window.byupReadStripe ? byupReadStripe() : { status: 'connected' });
  const [ricollegando, setRicollegando] = React.useState(false);
  React.useEffect(() => {
    const ri = () => forza(x => x + 1);
    const rs = () => setStripe(byupReadStripe());
    window.addEventListener('byup-soggetto-change', ri);
    window.addEventListener('byup-stripe-change', rs);
    window.addEventListener('byup-pos-censimento', ri);
    window.addEventListener('byup-ade-cred-change', ri);
    return () => { window.removeEventListener('byup-soggetto-change', ri); window.removeEventListener('byup-stripe-change', rs); window.removeEventListener('byup-pos-censimento', ri); window.removeEventListener('byup-ade-cred-change', ri); };
  }, []);
  const c = window.byupReadSoggettoChange ? byupReadSoggettoChange() : null;
  if (!c) return null;
  const ricollega = () => { setRicollegando(true); setTimeout(() => { setRicollegando(false); byupStripeRicollega(); }, 1800); };
  // I POS non sono una tappa del modello ma sono dovuti lo stesso: il nuovo
  // esercente comunica di nuovo i suoi strumenti (P-105). Quando li ha
  // dichiarati tutti, il passo si segna da sé.
  const posLista = window.byupReadPosCensimento ? byupReadPosCensimento() : [];
  const posOk = posLista.length > 0 && posLista.every(r => r.fiscal_link_status === 'linked');
  React.useEffect(() => { if (posOk && !c.steps.pos_recensiti) byupSoggettoAvanza('pos_recensiti'); }, [posOk]);
  // Le credenziali del nuovo soggetto: il passo è fatto quando la password è
  // stata inserita e verificata con la trasmissione di prova (P-104).
  const credOk = window.byupAdeCredStato ? !window.byupAdeCredStato().scaduta : false;
  React.useEffect(() => { if (credOk && !c.steps.credentials_verified) byupSoggettoAvanza('credentials_verified'); }, [credOk]);
  React.useEffect(() => { if (stripe.status === 'connected' && !c.steps.stripe_connected) byupSoggettoAvanza('stripe_connected'); }, [stripe.status]);

  const concluso = c.status === 'completed';
  const fatto = (id) => !!c.steps[id];
  const riga = (id, titolo, sotto, azione) => {
    const ok = fatto(id);
    return (
      <div key={id} data-passo={id} data-fatto={ok ? '1' : '0'} style={{display:'flex', alignItems:'center', gap: 12, padding:'12px 14px', borderRadius: 10, border:`1px solid ${ok ? PN.GREEN_SOFT : PN.BORDER_SOFT}`, background: ok ? PN.GREEN_SOFT : PN.WHITE}}>
        <span style={{width: 12, height: 12, borderRadius: 999, flexShrink: 0, background: ok ? PN.GREEN : 'transparent', border:`2px solid ${ok ? PN.GREEN : PN.PINK_DARK}`}}/>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT}}>{titolo}</div>
          <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>{sotto}</div>
        </div>
        {!ok && azione}
      </div>
    );
  };
  // La firma si sblocca solo quando tutto il resto è a posto: si riaccetta il
  // contratto quando il nuovo soggetto è davvero operativo.
  const prontoPerFirma = ['fiscal_updated', 'delegations_renewed', 'credentials_verified', 'stripe_connected', 'pos_recensiti'].every(fatto);

  return (
    <div onClick={onClose} style={{position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)', display:'grid', placeItems:'center', zIndex: 150, padding: 20}}>
      <div onClick={e => e.stopPropagation()} data-catena-soggetto style={{...MODAL_PANEL, width: 720, maxHeight:'calc(var(--pn-vh, 100vh) * 0.92)', display:'flex', flexDirection:'column'}}>
        <div style={{...MODAL_HEAD, padding: '18px 24px 14px'}}>
          <div style={{...MODAL_TITLE, fontSize: 21}}>Cambio di soggetto fiscale</div>
          <div style={{...MODAL_SUB, fontSize: 13.5, marginTop: 2}}>
            Da {c.previous_denominazione} ({c.previous_vat_number}) a {c.nuovo.denominazione} ({c.nuovo.piva}), con la partita IVA precedente conservata sui documenti già emessi. Causale: {((window.PN_SOGGETTO_CAUSALI || []).find(x => x.id === c.reason) || {}).label || c.reason}.
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>
        <div className="pn-scroll" style={{...MODAL_BODY, padding: '16px 24px', display:'flex', flexDirection:'column', gap: 10, overflowY:'auto'}}>
          {riga('fiscal_updated', 'Dati fiscali aggiornati', `Il nuovo soggetto è ${c.nuovo.denominazione}; il precedente resta nella storia.`, null)}
          {riga('delegations_renewed', 'Delega all\'Agenzia', 'La riconferisce chi rappresenta il nuovo soggetto, con il proprio SPID, e la precedente si revoca. Finché manca, niente scontrini.',
            <ImpButton variant="primary" onClick={onDelega}>Rinnova la delega</ImpButton>)}
          {riga('credentials_verified', 'Credenziali del canale', 'Sono del nuovo soggetto: del titolare, o della persona che nomina incaricata sul portale. Si inseriscono in questa pagina e una trasmissione di prova le verifica.',
            <ImpButton variant="secondary" onClick={() => { onClose(); setTimeout(() => { const el = window.impAccendiSezione && window.impAccendiSezione('ade-credenziali'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 120); }}>Vai alle credenziali</ImpButton>)}
          {riga('stripe_connected', 'Conto Stripe del nuovo soggetto', 'L\'account connesso era intestato al soggetto precedente: il nuovo ne apre uno suo, e la verifica dell\'identità la fa Stripe. Finché manca, niente pagamenti.',
            <ImpButton variant="primary" disabled={ricollegando} onClick={ricollega}>{ricollegando ? 'Collegamento in corso…' : 'Ricollega Stripe'}</ImpButton>)}
          {riga('pos_recensiti', 'POS comunicati all\'Agenzia', `Il censimento è del soggetto e si rifà: ${posLista.filter(r => r.fiscal_link_status !== 'linked').length || 'nessuno'} da comunicare, col foglio precompilato.`,
            <ImpButton variant="primary" onClick={() => { onClose(); onPos(); }}>Vai al collegamento POS</ImpButton>)}
          {riga('terms_reaccepted', 'Termini e condizioni riaccettati', 'È un nuovo soggetto giuridico: il contratto lo firma lui, e l\'accettazione si registra a suo nome con versione e impronta. Senza, il cambiamento non è concluso.',
            <ImpButton variant="primary" disabled={!prontoPerFirma} onClick={onFirma}>{prontoPerFirma ? 'Firma a nome del nuovo soggetto' : 'Prima gli altri passi'}</ImpButton>)}
          {concluso && (
            <div style={{padding:'12px 14px', borderRadius: 10, background: PN.GREEN_SOFT, fontSize: 14, color: PN.TEXT, lineHeight: 1.5}}>
              <b style={{color: PN.GREEN}}>Cambiamento concluso.</b> Il locale opera come {c.nuovo.denominazione}. La storia delle operazioni resta attribuita all'account: quello che il registro dice è quando e in che cosa il soggetto è cambiato.
            </div>
          )}
        </div>
        <div style={{...MODAL_FOOT, padding: '12px 24px', justifyContent:'flex-end'}}>
          <ImpButton variant="ghost" onClick={onClose}>{concluso ? 'Chiudi' : 'Più tardi'}</ImpButton>
        </div>
      </div>
    </div>
  );
}


// ─── La riaccettazione dei termini (P-117 · D-104; P-114) ──────────────────
// Il cambio di soggetto si chiude qui: è un nuovo soggetto giuridico, e il
// contratto lo firma lui. Stessa proiezione di TC-01 dell'onboarding
// (contratto-tc01.jsx), stessa verifica dell'impronta — se il testo caricato
// non è quello dichiarato la firma si blocca e lo dice, perché un contratto
// firmato su un testo che non è quello depositato è un problema che si scopre
// nel momento peggiore — e stessa doppia accettazione, integrale e delle
// clausole ex artt. 1341-1342 c.c. L'accettazione si registra a nome del
// nuovo soggetto con versione e impronta.
function ImpRiaccettaTerminiModal({ onClose, onFirmato }) {
  const c = window.byupReadSoggettoChange ? byupReadSoggettoChange() : null;
  const TC = window.TC01;
  const verifica = window.tc01Verifica ? tc01Verifica() : { ok: false, dichiarata: '—', calcolata: '—' };
  const vessatorie = window.tc01Vessatorie ? tc01Vessatorie() : [];
  const [tutto, setTutto] = React.useState(false);
  const [specifiche, setSpecifiche] = React.useState(false);
  if (!TC || !c) return null;
  const puoFirmare = tutto && specifiche && verifica.ok;
  const firma = () => {
    if (!puoFirmare) return;
    // La prova: chi ha firmato, su quale versione e su quale impronta.
    const c2 = window.byupReadSoggettoChange();
    c2.terms = { codice: TC.codice, versione: TC.versione, impronta: TC.impronta, soggetto: c.nuovo.denominazione, quando: new Date().toISOString() };
    window.byupWriteSoggettoChange(c2);
    onFirmato();
  };
  const riga = { display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5 };
  return (
    <div onClick={onClose} style={{position:'fixed', inset: 0, background:'rgba(15,17,21,0.5)', display:'grid', placeItems:'center', zIndex: 170, padding: 20}}>
      <div onClick={e => e.stopPropagation()} data-riaccetta style={{...MODAL_PANEL, width: 720, maxHeight:'calc(var(--pn-vh, 100vh) * 0.92)', display:'flex', flexDirection:'column'}}>
        <div style={MODAL_HEAD}>
          <div style={MODAL_TITLE}>Riaccetta i termini a nome di {c.nuovo.denominazione}</div>
          <div style={MODAL_SUB}>
            {TC.codice} · v{TC.versione} · impronta {TC.impronta}. Il soggetto che esercita l'attività è cambiato: il contratto si accetta a nome del nuovo, e l'accettazione si registra con versione e impronta.
          </div>
          <button onClick={onClose} style={MODAL_X}><PnI.X size={14}/></button>
        </div>
        <div className="pn-scroll" style={{...MODAL_BODY, overflowY:'auto', display:'flex', flexDirection:'column', gap: 12}}>
          <div style={{maxHeight: 260, overflowY:'auto', padding:'12px 14px', borderRadius: 10, border:`1px solid ${PN.BORDER_SOFT}`, background:'#FAFBFC'}}>
            {TC.clausole.map(cl => (
              <div key={cl.n} style={{marginBottom: 10}}>
                <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>Art. {cl.n} · {cl.h}{cl.vessatoria ? ' ·' : ''}{cl.vessatoria && <span style={{color: PN.PINK_DARK}}> 1341-1342</span>}</div>
                <div style={{fontSize: 13, color: PN.MUTED, lineHeight: 1.5, marginTop: 2}}>{cl.p}</div>
              </div>
            ))}
          </div>
          {!verifica.ok && (
            <div style={{padding:'11px 13px', borderRadius: 10, background:'#FEF2F2', border:'1px solid #FECACA', fontSize: 13.5, color: PN.TEXT, lineHeight: 1.5}}>
              <b style={{color: PN.RED}}>Firma bloccata: il testo non corrisponde alla proiezione di TC-01.</b>{' '}
              Impronta dichiarata {verifica.dichiarata}, calcolata {verifica.calcolata}. La proiezione va rigenerata dal pacchetto legale: non si firma un testo che non è quello depositato.
            </div>
          )}
          <label style={{...riga, cursor:'pointer'}}>
            <input type="checkbox" data-firma-tutto checked={tutto} onChange={e => setTutto(e.target.checked)} style={{marginTop: 3, accentColor: PN.PINK_DARK}}/>
            <span>{c.nuovo.denominazione} ha letto e accetta integralmente i <b>{TC.nome}</b> ({TC.codice} v{TC.versione}) e ha preso visione dell'informativa privacy.</span>
          </label>
          <label style={{...riga, cursor:'pointer'}}>
            <input type="checkbox" data-firma-vessatorie checked={specifiche} onChange={e => setSpecifiche(e.target.checked)} style={{marginTop: 3, accentColor: PN.PINK_DARK}}/>
            <span>Ai sensi degli artt. 1341-1342 c.c. approva specificamente gli articoli {vessatorie.map(x => x.n).join(', ')}.</span>
          </label>
        </div>
        <div style={{...MODAL_FOOT, justifyContent:'flex-end'}}>
          <ImpButton variant="ghost" onClick={onClose}>Più tardi</ImpButton>
          <ImpButton variant="primary" disabled={!puoFirmare} onClick={firma}>Firma e concludi il cambiamento</ImpButton>
        </div>
      </div>
    </div>
  );
}


// ─── La riga del soggetto fiscale, in cima alla pagina (P-117 · D-104) ─────
// Chi è il soggetto adesso, e l'unica azione che il fiscale ha: «Cambia
// soggetto fiscale», per quando cambia il contribuente. «Rinnova la delega»
// non c'è più (4 settembre 2026): una delega valida non si rifà, e quando il
// soggetto cambia la delega si riconferma da sé dentro la catena del cambio —
// che è l'unico momento in cui serve. Con un cambiamento in corso il pulsante
// apre la catena dei passi e la riga dice che cosa manca, con i blocchi che
// valgono per conto proprio.
function ImpSoggettoRiga({ data, onCambia }) {
  const [c, setC] = React.useState(() => window.byupReadSoggettoChange ? byupReadSoggettoChange() : null);
  React.useEffect(() => {
    const ri = () => setC(byupReadSoggettoChange());
    window.addEventListener('byup-soggetto-change', ri);
    return () => window.removeEventListener('byup-soggetto-change', ri);
  }, []);
  const persona = data.legalForm === 'ditta_individuale';
  const nome = persona ? `${data.ownerNome} ${data.ownerCognome}`.trim() : data.ragione;
  const inCorso = !!(c && c.status !== 'completed');
  const manca = inCorso ? (window.PN_SOGGETTO_PASSI || []).filter(p => !c.steps[p.id]) : [];
  return (
    <div data-soggetto-riga style={{
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
            Cambio di soggetto in corso · {manca.length ? `manca ${manca.map(p => p.label.toLowerCase()).join(', ')}` : 'ci siamo'}
            {!c.steps.delegations_renewed ? ' · niente scontrini finché manca la delega' : ''}
            {!c.steps.stripe_connected ? ' · niente pagamenti finché manca Stripe' : ''}
          </div>
        )}
      </div>
      <ImpButton variant="primary" onClick={onCambia}>{inCorso ? 'Riprendi il cambiamento' : 'Cambia soggetto fiscale'}</ImpButton>
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
    // Titolare (solo ditta individuale)
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
  // La catena si apre alla conferma del cambio di soggetto, e si riapre dal
  // banner o da Account (?cambio=) finché il cambiamento non è concluso.
  const cambioInCorso = () => (window.byupSoggettoInCorso ? window.byupSoggettoInCorso() : null);
  const apri = () => { if (cambioInCorso()) setDopoOpen(true); else setSoggettoOpen(true); };
  const [ricezione, setRicezione] = React.useState(() => window.byupReadRicezione ? byupReadRicezione() : null);
  React.useEffect(() => {
    const ri = () => setRicezione(byupReadRicezione());
    window.addEventListener('byup-ricezione-change', ri);
    return () => window.removeEventListener('byup-ricezione-change', ri);
  }, []);
  const [soggettoOpen, setSoggettoOpen] = React.useState(false);
  const [dopoOpen, setDopoOpen] = React.useState(() => {
    try { return !!new URLSearchParams(window.location.search).get('cambio') && !!cambioInCorso(); } catch (e) { return false; }
  });
  // La firma del contratto a nome del nuovo soggetto: stessa finestra
  // dell'onboarding (contratto-tc01.jsx), stessa prova.
  const [firmaOpen, setFirmaOpen] = React.useState(false);
  // L'accredito degli incassi non sta più qui (4 settembre 2026): il conto
  // connesso, il suo stato e il ricollegamento vivono in POS e integrazioni,
  // sulla tessera Stripe, che è dove si collega e si scollega. Averlo in due
  // posti voleva dire tenerne allineati due; qui non ne resta traccia.
  // Il foglio della delega: si apre da solo dopo la conferma del soggetto, dal
  // banner, e dal rimando di Account (?delega=1) per il cambio di persona.
  const [delegaOpen, setDelegaOpen] = React.useState(() => {
    try { return new URLSearchParams(window.location.search).get('delega') === '1'; } catch (e) { return false; }
  });
  // La tappa fiscal_updated applica il cambiamento ai dati di questa
  // schermata: il nuovo soggetto (forma, denominazione, P.IVA — la
  // precedente resta conservata) o il nuovo titolare sui campi della persona.
  const applica = (c) => {
    const n = c.nuovo;
    setData(d => ({ ...d, ...(n.campi || {}), legalForm: n.legalForm || d.legalForm, pivaPrecedente: d.piva, piva: n.piva }));
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

      {/* P-117: il soggetto fiscale e le due azioni che gli appartengono. */}
      <ImpSoggettoRiga data={data} onCambia={apri}/>
      {soggettoOpen && (
        <ImpSoggettoFoglio data={data} onClose={() => setSoggettoOpen(false)} onApplica={applica} onDopo={() => setDopoOpen(true)}
          onSalva={(campi) => setData(d => ({ ...d, ...campi }))}/>
      )}
      {dopoOpen && <ImpDopoSoggettoModal onClose={() => setDopoOpen(false)} onDelega={() => setDelegaOpen(true)}
        onFirma={() => setFirmaOpen(true)}
        onPos={() => setTimeout(() => { const el = window.impAccendiSezione && window.impAccendiSezione('pos-censimento'); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 120)}/>}
      {delegaOpen && <ImpDelegaRiconfermaModal onClose={() => setDelegaOpen(false)} denominazione={persona ? `${data.ownerNome} ${data.ownerCognome}`.trim() : data.ragione}/>}
      {firmaOpen && <ImpRiaccettaTerminiModal onClose={() => setFirmaOpen(false)} onFirmato={() => { setFirmaOpen(false); byupSoggettoAvanza('terms_reaccepted'); setDopoOpen(true); }}/>}

      {/* Collegamento all'Agenzia: promemoria progressivo, blocco a scadenza,
          verifica all'inserimento — il perché e il come stanno nel commento
          in testa al file. */}
      {/* P-116 (D-103): le credenziali sono SEMPRE dell'esercente. Per società
          ed enti si dichiara prima chi è l'incaricato che le detiene, poi c'è
          la stessa scheda delle credenziali che vale per la ditta. */}
      <AdeAttivazioniCard/>
      <AdeIncaricatoCard forma={data.legalForm} titolare={{ nome: data.ownerNome, cognome: data.ownerCognome, cf: data.ownerCf }}/>
      <div data-cfg-anchor="ade-credenziali"><AdeCredenzialiCard forma={data.legalForm}/></div>

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

  // La voce di coperto o servizio col nome e la forma scelti in Impostazioni →
  // Servizio (P-103): non più «COPERTO» cablato, la stessa riga del conto.
  const cop = window.byupCopertoRiga ? window.byupCopertoRiga(31, 2) : null;
  const rows = [
    { desc:'CACIO E PEPE',     q:1, p:14.00 },
    { desc:'CARBONARA',        q:1, p:14.00 },
    { desc:'ACQUA NAT 0.75L',  q:1, p:3.00  },
    ...(cop && cop.attiva ? [cop.forma === 'fissa'
      ? { desc: cop.nome.toUpperCase(), q: 2, p: cop.importo }
      : { desc: `${cop.nome.toUpperCase()} ${cop.aliquota}%`, q: 1, p: cop.valore }] : []),
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
