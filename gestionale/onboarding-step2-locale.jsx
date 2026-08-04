// Step 2 — Il tuo locale.
//
// 2 SUB-STEPS NAVIGATI INTERNAMENTE:
//   2a info        — anagrafica + P.IVA
//   2b pagamenti   — Stripe + altri metodi (PayPal/Klarna/Satispay)
//
// Sub-step "Fiscale" rimosso: SDI/PEC/regime fiscale sono completati nelle impostazioni
// post-onboarding. Qui basta P.IVA per costituire il soggetto giuridico minimo.
// Sub-step "Carte e digital wallet" (Apple/Google Pay) rimosso: sono attivi via Stripe
// senza dover comunicare nulla all'utente in fase di onboarding.

function Step2Locale({
  subStep, setSubStep,
  venue, setVenue,
  payments, setPayments,
  onNext, onBack,
}) {
  const v = (k, val) => setVenue(prev => ({...prev, [k]: val}));
  const p = (k, val) => setPayments(prev => ({...prev, [k]: val}));

  const SUBSTEP_TITLES = {
    info:      {title: 'Le informazioni del tuo locale.',
                sub: 'Queste informazioni verranno pubblicate e visualizzate dagli utenti dell’applicazione Byup.',
                note: 'Potrai modificarle in qualsiasi momento dalle Impostazioni.'},
    pagamenti: {title: 'Pagamenti.',
                sub: 'Connetti Stripe e scegli quali metodi di pagamento accettare.',
                note: 'I metodi alternativi restano attivabili anche dopo l’onboarding.'},
  };
  const t = SUBSTEP_TITLES[subStep];

  return (
    <div style={{
      minHeight: '100%',
      background: ONB.BG_SOFT,
      /* bottom 28 e non 32: compensa il padding del footer sticky */
      padding: '32px 80px 28px',
      display: 'flex', alignItems: 'flex-start',
    }}>
      {/* Stessa griglia dello step 1: promessa a sinistra, campi a destra.
          Spostare l'hero fuori dal flusso verticale libera ~140px ed è ciò che
          permette al form di stare nel canvas senza scroll. */}
      <div style={{
        width: '100%', maxWidth: 1240, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 620px',
        /* start, non center: il blocco di testo parte alla stessa quota della
           prima card, così le due colonne condividono la baseline superiore. */
        gap: 72, alignItems: 'start',
      }}>

        {/* ─── Colonna sinistra — contesto ────────────────────────────── */}
        <div>
          <h1 style={{
            fontSize: 40, fontWeight: 600, lineHeight: 1.15,
            letterSpacing: '-0.025em', margin: '0 0 16px', color: ONB.TEXT,
          }}>
            {t.title}
          </h1>
          <p style={{
            fontSize: 18, fontWeight: 400, lineHeight: 1.5,
            color: ONB.MUTED, margin: '0 0 20px', maxWidth: 460,
          }}>
            {t.sub}
          </p>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: 15, lineHeight: 1.45, color: ONB.MUTED, maxWidth: 440,
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: 999, flexShrink: 0, marginTop: 1,
              background: 'rgba(15, 17, 21, 0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, color: ONB.MUTED,
            }}>i</span>
            {t.note}
          </div>

          {/* Il banner "menù in elaborazione" vive qui, in flusso subito sotto
              il blocco di testo, invece che floating su un angolo del frame. */}
          <ProcessingBanner inline/>

          {/* La delega AdE sta in questa colonna e non fra i campi: non è un
              dato da scrivere, è una cosa da fare altrove mentre si compila.
              Qui è sotto gli occhi appena si apre lo step — in colonna coi
              campi finiva sotto il regime fiscale, cioè fuori dal canvas. */}
          {subStep === 'info' && (
            <div style={{marginTop: 20, maxWidth: 520}}>
              <AdeDelegaCard venue={venue} v={v}/>
            </div>
          )}

        </div>

        {/* ─── Colonna destra — campi ─────────────────────────────────── */}
        <div>
          {/* Le due sezioni dello step, sempre visibili e cliccabili: rende
              esplicito che Informazioni e Pagamenti vivono nello stesso step. */}
          <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
            {[['info', '1', 'Informazioni'], ['pagamenti', '2', 'Pagamenti']].map(([id, n, label]) => {
              const active = subStep === id;
              const done = id === 'info' && subStep === 'pagamenti';
              return (
                <button key={id} onClick={() => setSubStep(id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 10,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  background: active ? '#fff' : 'transparent',
                  border: active ? `1.5px solid ${ONB.BRAND}` : '1px solid rgba(15, 17, 21, 0.10)',
                  boxShadow: active ? '0 1px 2px rgba(15, 17, 21, 0.05)' : 'none',
                  transition: 'border-color 150ms ease-out, background 150ms ease-out',
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 600,
                    background: done ? ONB.GREEN : active ? ONB.BRAND : 'rgba(15, 17, 21, 0.06)',
                    color: (done || active) ? '#fff' : ONB.MUTED,
                  }}>
                    {done ? <OnbIcon.Check size={11} color="#fff"/> : n}
                  </span>
                  <span style={{
                    fontSize: 15, fontWeight: 600,
                    color: active ? ONB.TEXT : ONB.MUTED,
                  }}>{label}</span>
                </button>
              );
            })}
          </div>

          {subStep === 'info'      && <SubStepInfo      venue={venue} v={v}/>}
          {subStep === 'pagamenti' && <SubStepPagamenti payments={payments} p={p}/>}

          {/* Footer — 2 pulsanti, gerarchia chiara.
              Sticky: espandendo "Altri metodi" la colonna supera il canvas, e
              senza ancoraggio "Continua" finiva sotto il bordo. Resta agganciato
              al fondo mentre il contenuto scorre dietro. */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            position: 'sticky', bottom: 0, zIndex: 5,
            marginTop: 20, paddingTop: 18, paddingBottom: 4,
            borderTop: '1px solid rgba(15, 17, 21, 0.08)',
            background: ONB.BG_SOFT,
          }}>
            <SecondaryCta onClick={onBack}>
              <OnbIcon.ArrowLeft size={14} color={ONB.TEXT}/>
              Indietro
            </SecondaryCta>
            <PrimaryCta onClick={onNext}>
              Continua
              <OnbIcon.ArrowRight size={14} color="#fff"/>
            </PrimaryCta>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2a INFO LOCALE
// ─────────────────────────────────────────────────────────────────────────

function SubStepInfo({venue, v}) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {/* Anagrafica del locale: W1 white classic standard. Era marcata "glass"
          (alias di aurora L2) in passato — riportata a default per richiesta. */}
      <OnbCard>
        <OnbSectionHeader
          title="Anagrafica del locale"
          subtitle="Nome, P.IVA e dove si trova il locale."
        />
        {/* Grid 12-col: composizione "indirizzo / civico / cap / città" su una sola
            riga visiva (80/20/20/40) — pattern italiano standard di un form indirizzi.
            Su 720px container abbiamo abbastanza spazio per tenerli in linea. */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16}}>
          <div style={{gridColumn: 'span 7'}}>
            <OnbField label="Nome del locale"
              value={venue.name} onChange={(x) => v('name', x)}
              placeholder="es. Cacio e Pepe"/>
          </div>
          <div style={{gridColumn: 'span 5'}}>
            <OnbField label="Partita IVA"
              value={venue.piva} onChange={(x) => v('piva', x)}
              placeholder="IT00000000000"/>
          </div>
          <div style={{gridColumn: 'span 8'}}>
            <OnbField label="Indirizzo"
              value={venue.address} onChange={(x) => v('address', x)}
              placeholder="Via dei Giubbonari"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="Civico"
              value={venue.civico} onChange={(x) => v('civico', x)}
              placeholder="27"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="CAP"
              value={venue.cap} onChange={(x) => v('cap', x)}
              placeholder="00186"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="Città"
              value={venue.city} onChange={(x) => v('city', x)}
              placeholder="Roma"/>
          </div>
          <div style={{gridColumn: 'span 4'}}>
            <OnbField label="Telefono" type="tel"
              value={venue.phone} onChange={(x) => v('phone', x)}
              placeholder="06 1234 5678"/>
          </div>
          {/* Il capo che riceve l'invito. Senza questo campo il codice che un
              locale (o un cliente dall'app) condivide non ha dove atterrare:
              si promette un premio e non si dà modo di riscuoterlo.
              Sta qui, opzionale e in fondo, perché non deve rallentare chi
              arriva da solo. */}
          <div style={{gridColumn: 'span 8'}}>
            <OnbField label="Codice invito" optional
              value={venue.codiceInvito}
              onChange={(x) => v('codiceInvito', x.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="es. DAMARIO07"/>
          </div>
        </div>
        {venue.codiceInvito && venue.codiceInvito.length >= 4 && (
          <div style={{
            marginTop: 12, padding: '10px 13px', borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: 15, color: ONB.TEXT, lineHeight: 1.45,
          }}>
            Con questo codice hai <b>2 mesi gratis</b> quando attivi un abbonamento —
            e due vanno a chi te l'ha passato.
          </div>
        )}
      </OnbCard>

      <OnbCard>
        <OnbSectionHeader
          title="Regime fiscale"
          subtitle="Per applicare correttamente IVA ed esenzioni in fattura."
        />
        <RegimeRadioGroup value={venue.regime} onChange={(x) => v('regime', x)}/>
      </OnbCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Delega AdE — l'unico pezzo dell'onboarding che si fa fuori da qui.
//
// Byup trasmette i corrispettivi al posto del locale, e per farlo serve una
// delega che solo il titolare può dare, sul portale dell'Agenzia, con la sua
// identità. Non possiamo prendere la delega noi: possiamo solo rendere
// indolori i due minuti in cui la dà — il codice fiscale pronto da incollare,
// il portale a un click, i tap da fare scritti in ordine, e un modo per
// sapere se ha funzionato senza aspettare il primo scontrino vero.
// ─────────────────────────────────────────────────────────────────────────

const ADE_CF_BYUP = '15927340015';
const ADE_PORTALE = 'https://www.agenziaentrate.gov.it/portale/area-riservata';

// I tap sul portale, in ordine. Scritti come li vede lui sullo schermo:
// se l'etichetta qui non è la stessa che legge lì, la guida non serve.
const ADE_PASSI = [
  'Accedi con SPID',
  'Vai su Profilo → Deleghe',
  'Apri Delega unica → Aggiungi delegato',
  'Incolla il CF di Byup e spunta «Consultazione dei corrispettivi telematici»',
  'Conferma',
];

function AdeDelegaCard({venue, v}) {
  const stato = venue.adeStato || 'attesa';   // attesa | verifica | errore | attivo
  const [copiato, setCopiato] = React.useState(false);

  const copiaCF = () => {
    const scrivi = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(ADE_CF_BYUP)
      : Promise.reject();
    scrivi.catch(() => {
      // Clipboard negata (http, permessi): il codice resta selezionabile a mano
    }).then(() => {
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2000);
    });
  };

  // "Fatto" non si fida sulla parola: prova a trasmettere davvero. Il primo
  // giro finisce in errore — è il caso vero, chi torna qui dopo trenta secondi
  // la delega non ce l'ha ancora — e la diagnosi dice cosa ricontrollare
  // invece di ripetere "non ha funzionato".
  const verifica = () => {
    v('adeStato', 'verifica');
    const tentativo = (venue.adeTentativi || 0) + 1;
    v('adeTentativi', tentativo);
    setTimeout(() => v('adeStato', tentativo === 1 ? 'errore' : 'attivo'), 1600);
  };

  const BADGE = {
    attesa:   {label: 'In attesa di delega', bg: 'rgba(217, 119, 6, 0.10)',  fg: ONB.AMBER},
    verifica: {label: 'Verifica in corso…',  bg: 'rgba(15, 17, 21, 0.05)',   fg: ONB.MUTED},
    errore:   {label: 'Errore',              bg: 'rgba(220, 38, 38, 0.10)',  fg: ONB.RED},
    attivo:   {label: 'Attivo',              bg: ONB.GREEN_SOFT,             fg: ONB.GREEN},
  }[stato];

  return (
    <OnbCard>
      {/* proc-spin vive dentro l'overlay di elaborazione, che qui non c'è:
          il giro del verificatore se lo porta da sé. */}
      <style>{`@keyframes ade-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16}}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 18, fontWeight: 600, color: ONB.TEXT, letterSpacing: '-0.01em', lineHeight: 1.4}}>
            Autorizza Byup presso l'Agenzia delle Entrate
          </div>
          <div style={{fontSize: 15, color: ONB.MUTED, marginTop: 4, lineHeight: 1.45}}>
            Serve perché Byup trasmetta i corrispettivi per te.
            {' '}<b style={{color: ONB.TEXT, fontWeight: 600}}>Circa 2 minuti</b>, serve solo l'accesso con SPID.
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
          padding: '5px 11px', borderRadius: 999,
          background: BADGE.bg, color: BADGE.fg,
          fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          {stato === 'attivo' && <OnbIcon.Check size={11} color={ONB.GREEN}/>}
          {stato === 'verifica' && (
            <span style={{
              width: 11, height: 11, borderRadius: 999, flexShrink: 0,
              border: `1.5px solid rgba(15,17,21,0.18)`, borderTopColor: ONB.MUTED,
              animation: 'ade-spin 0.7s linear infinite',
            }}/>
          )}
          {BADGE.label}
        </span>
      </div>

      {/* Il CF è la cosa che deve finire negli appunti: sta per intero, in
          monospazio, con il tasto attaccato. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        padding: '11px 13px', borderRadius: 10,
        background: ONB.BG, border: '1px solid rgba(15, 17, 21, 0.06)',
      }}>
        <div style={{flex: 1, minWidth: 132}}>
          <div style={{fontSize: 13, fontWeight: 600, color: ONB.MUTED, letterSpacing: '0.04em', textTransform: 'uppercase'}}>
            Codice fiscale di Byup
          </div>
          <div style={{
            fontSize: 18.5, fontWeight: 600, color: ONB.TEXT, marginTop: 2,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.04em',
            userSelect: 'all',
          }}>{ADE_CF_BYUP}</div>
        </div>
        <button onClick={copiaCF} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
          padding: '8px 13px', borderRadius: 9,
          background: '#fff', color: copiato ? ONB.GREEN : ONB.TEXT,
          border: `1px solid ${copiato ? 'rgba(22, 163, 74, 0.35)' : 'rgba(15, 17, 21, 0.12)'}`,
          fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'color 150ms ease-out, border-color 150ms ease-out',
        }}>
          {copiato ? (
            <React.Fragment><OnbIcon.Check size={12} color={ONB.GREEN}/>Copiato</React.Fragment>
          ) : (
            <React.Fragment>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/>
              </svg>
              Copia
            </React.Fragment>
          )}
        </button>
        <a href={ADE_PORTALE} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
          padding: '8px 13px', borderRadius: 9,
          background: ONB.ACTION_SECONDARY, color: '#fff',
          fontSize: 15, fontWeight: 600, textDecoration: 'none', fontFamily: 'inherit',
        }}>
          Apri il portale
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>
          </svg>
        </a>
      </div>

      {/* Guida contestuale: i tap da fare sul portale, in ordine. Sta aperta
          finché la delega non è attiva — è lì che serve — e si richiude da sé
          quando non c'è più niente da seguire. */}
      <details style={{marginTop: 12}}>
        <summary style={{
          fontSize: 15, fontWeight: 600, color: ONB.TEXT,
          cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <OnbIcon.ChevronDown size={12} color={ONB.MUTED}/>
          Come si fa, in 5 tap
        </summary>
        <ol style={{
          margin: '9px 0 0', padding: 0, listStyle: 'none',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {ADE_PASSI.map((passo, i) => (
            <li key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: ONB.TEXT, lineHeight: 1.45}}>
              <span style={{
                width: 21, height: 21, borderRadius: 999, flexShrink: 0, marginTop: 1,
                background: ONB.BRAND_TINT, color: ONB.BRAND_DARK,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600,
              }}>{i + 1}</span>
              <span>{passo}</span>
            </li>
          ))}
        </ol>
      </details>

      {/* Verifica — chiude il giro: la delega o c'è o non c'è, e lo si sa qui
          e ora invece che al primo scontrino di sabato sera. */}
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(15, 17, 21, 0.08)',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{flex: 1, minWidth: 220}}>
          <div style={{fontSize: 16, fontWeight: 600, color: ONB.TEXT}}>Verifica</div>
          <div style={{fontSize: 14.5, color: ONB.MUTED, marginTop: 2, lineHeight: 1.45}}>
            {stato === 'attivo'
              ? 'Delega trovata: la trasmissione di prova è andata a buon fine.'
              : stato === 'verifica'
                ? 'Sto inviando una trasmissione di prova all\'Agenzia…'
                : 'Quando hai confermato sul portale, premi Fatto: proviamo una trasmissione.'}
          </div>
        </div>
        {stato !== 'attivo' && (
          <button onClick={verifica} disabled={stato === 'verifica'} style={{
            padding: '10px 20px', borderRadius: 9, flexShrink: 0,
            background: stato === 'verifica' ? 'rgba(15, 17, 21, 0.06)' : ONB.ACTION_PRIMARY,
            color: stato === 'verifica' ? ONB.MUTED : '#fff',
            border: 'none', fontSize: 15, fontWeight: 600,
            cursor: stato === 'verifica' ? 'default' : 'pointer', fontFamily: 'inherit',
          }}>
            {stato === 'errore' ? 'Riprova' : 'Fatto'}
          </button>
        )}
      </div>

      {/* La diagnosi dice dove guardare: "non ha funzionato" da solo rimanda
          al portale senza sapere cosa cercare. */}
      {stato === 'errore' && (
        <div style={{
          marginTop: 10, padding: '11px 13px', borderRadius: 10,
          background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.22)',
          fontSize: 14.5, color: ONB.TEXT, lineHeight: 1.5,
        }}>
          <b style={{fontWeight: 600, color: ONB.RED}}>Delega non trovata.</b>{' '}
          Controlla che il delegato sia <b style={{fontWeight: 600}}>{ADE_CF_BYUP}</b> e che la spunta sia su
          {' '}<b style={{fontWeight: 600}}>«Consultazione dei corrispettivi telematici»</b>: su un altro
          servizio la delega c'è, ma non vale qui.
        </div>
      )}

      {stato === 'attivo' && (
        <div style={{
          marginTop: 10, padding: '11px 13px', borderRadius: 10,
          background: 'rgba(22, 163, 74, 0.07)', border: '1px solid rgba(22, 163, 74, 0.25)',
          fontSize: 14.5, color: ONB.TEXT, lineHeight: 1.5,
        }}>
          Byup può trasmettere i corrispettivi per te. Puoi revocare la delega dal portale
          dell'Agenzia quando vuoi.
        </div>
      )}
    </OnbCard>
  );
}

// Regime fiscale — 3 radio card affiancate. Tre opzioni semanticamente diverse
// (ordinario / forfettario / agricolo) → radio card con descrizione spiega la
// scelta meglio di un dropdown muto.
// Affiancate e non impilate: in colonna costavano ~100px di altezza in più ed
// erano l'unico blocco che mandava il sub-step "info" fuori dal canvas.
function RegimeRadioGroup({value, onChange}) {
  const options = [
    {id: 'ordinario',   label: 'Ordinario',          desc: 'IVA al 10% sui pasti, 22% sulle bevande alcoliche.'},
    {id: 'forfettario', label: 'Forfettario',        desc: 'No IVA in fattura, coefficiente di redditività dedicato.'},
    {id: 'agricolo',    label: 'Agricolo / Speciale', desc: 'Per agriturismo o attività agricole connesse.'},
  ];
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10}}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <label key={o.id}
            className={selected ? 'aurora-soft-bg' : ''}
            style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '14px 14px',
            ...(selected ? {} : {background: '#fff'}),
            border: `1px solid ${selected ? 'rgba(255, 90, 95, 0.30)' : 'rgba(15, 17, 21, 0.08)'}`,
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 150ms ease-out',
          }}>
            <input type="radio" name="regime"
              checked={selected} onChange={() => onChange(o.id)}
              style={{margin: 0, marginTop: 3, accentColor: ONB.BRAND}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 16, fontWeight: 500, color: ONB.TEXT, lineHeight: 1.35}}>
                {o.label}
              </div>
              <div style={{fontSize: 14, color: ONB.MUTED, marginTop: 3, lineHeight: 1.4}}>
                {o.desc}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2b PAGAMENTI
// ─────────────────────────────────────────────────────────────────────────

function SubStepPagamenti({payments, p}) {
  // Solo metodi alternativi a Stripe: il POS Stripe da solo copre carte + Apple/Google Pay
  // automaticamente, quindi non serve un toggle dedicato per quelle wallet. Default OFF
  // perché PayPal/Klarna/Satispay richiedono ognuno setup proprio.
  const [methods, setMethods] = React.useState({
    paypal: false, klarna: false, satispay: false,
  });
  const toggle = (k) => setMethods(m => ({...m, [k]: !m[k]}));

  // Contratta di default: nessuno dei tre metodi è necessario per completare
  // l'onboarding, quindi la sezione parte chiusa e non compete con Stripe —
  // che è l'unica azione richiesta in questo sub-step.
  const [openMethods, setOpenMethods] = React.useState(false);
  const activeCount = Object.values(methods).filter(Boolean).length;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
      <OnbCard>
        <OnbSectionHeader
          number="1"
          title="Piattaforma POS"
          subtitle="Per accettare pagamenti dai clienti al tavolo e dall’app. Commissioni standard Stripe: 1,5% + 0,25 € per transazione (Europa)."
        />
        <StripeConnectRow
          status={payments.stripeStatus}
          onConnect={() => p('stripeStatus', 'connected')}
          onDisconnect={() => p('stripeStatus', 'disconnected')}
        />
      </OnbCard>

      <OnbCard>
        <button
          type="button"
          onClick={() => setOpenMethods(o => !o)}
          aria-expanded={openMethods}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            width: '100%', padding: 0, margin: 0,
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'left',
            marginBottom: openMethods ? 16 : 0,
          }}
        >
          <div style={{
            width: 24, height: 24, borderRadius: 999,
            background: ONB.BRAND_TINT, color: ONB.BRAND_DARK,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 600, flexShrink: 0,
          }}>2</div>

          <div style={{flex: 1, minWidth: 0}}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 18, fontWeight: 600, color: ONB.TEXT,
              letterSpacing: '-0.01em', lineHeight: 1.4,
            }}>
              Altri metodi
              {/* Il conteggio è l'unico modo di sapere cosa c'è dentro senza
                  aprire: senza, una sezione chiusa nasconde anche il proprio stato. */}
              <span style={{
                fontSize: 14, fontWeight: 600,
                padding: '1px 8px', borderRadius: 999,
                background: activeCount ? ONB.GREEN_SOFT : 'rgba(15, 17, 21, 0.06)',
                color: activeCount ? ONB.GREEN : ONB.MUTED,
              }}>
                {activeCount ? `${activeCount} ${activeCount === 1 ? 'attivo' : 'attivi'}` : 'nessuno'}
              </span>
            </div>
            <div style={{
              fontSize: 15, fontWeight: 400, color: ONB.MUTED,
              marginTop: 2, lineHeight: 1.4,
            }}>
              PayPal, Klarna e Satispay — attivabili anche dopo l’onboarding.
            </div>
          </div>

          <span style={{
            flexShrink: 0, marginTop: 4,
            display: 'flex',
            transform: openMethods ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms ease-out',
          }}>
            <OnbIcon.ChevronDown size={16} color={ONB.MUTED}/>
          </span>
        </button>

        {openMethods && (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <MethodRow
              provider="paypal" label="PayPal"
              desc="Conto PayPal o carta via PayPal · commissione 2,5% + 0,35 €"
              checked={methods.paypal} onToggle={() => toggle('paypal')}
            />
            <MethodRow
              provider="klarna" label="Klarna"
              desc="Pagamento dilazionato fino a 30 giorni · zero rischio per il locale"
              checked={methods.klarna} onToggle={() => toggle('klarna')}
            />
            <MethodRow
              provider="satispay" label="Satispay"
              desc="App di pagamento senza commissioni"
              checked={methods.satispay} onToggle={() => toggle('satispay')}
            />
          </div>
        )}
      </OnbCard>

      <StaffAppPromo/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Promo "byup Staff" — il POS mobile. Callout tinto brand e senza numero:
// non è un passo da completare come 1 e 2, è un suggerimento che l'utente può
// ignorare senza restare indietro.
// ─────────────────────────────────────────────────────────────────────────

// Palette del marchio byup Staff (dal logo): rosso → arancio, lettering crema.
const STAFF = {
  RED:    '#FF3B2E',
  MID:    '#FF6A3D',
  ORANGE: '#FF9B52',
  CREAM:  '#FFF2E7',
};

function StaffAppPromo() {
  // TODO: sostituire con gli URL reali delle schede store di byup Staff.
  const STORE_LINKS = {play: '#', app: '#'};

  const storeLink = {
    color: STAFF.CREAM, fontWeight: 700, textDecoration: 'underline',
    textUnderlineOffset: 2, cursor: 'pointer',
  };

  return (
    /* Palette del marchio byup Staff: gradiente rosso→arancio in diagonale e
       lettering crema. È l'unico blocco pieno della schermata — è anche l'unico
       che non chiede di completare un passo, ma di portarsi via qualcosa. */
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '18px 20px 0', borderRadius: 14,
      overflow: 'hidden',   /* la mascotte poggia sul bordo inferiore */
      background: `linear-gradient(115deg, ${STAFF.RED} 0%, ${STAFF.MID} 52%, ${STAFF.ORANGE} 100%)`,
      boxShadow: '0 12px 32px -14px rgba(255, 76, 45, 0.55)',
    }}>
      {/* Mascotte — poggia sul bordo inferiore del box (overflow:hidden la
          taglia netta a filo). Se il file manca si toglie da sola e il box
          resta impaginato, senza riquadro rotto in mezzo alla card. */}
      <img
        /* ?v=2 — il primo deploy referenziava questo file prima che esistesse:
           i client che hanno visitato allora si sono cachati il 404 (i .png
           hanno max-age 86400 in vercel.json) e continuavano a non vedere la
           mascotte. Cambiare l'URL aggira la cache negativa. */
        src="mascot-staff.png?v=2"
        alt="La mascotte di Byup Staff con l'app aperta sul telefono"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
        style={{
          width: 152, alignSelf: 'flex-end', flexShrink: 0,
          marginBottom: -14,
          filter: 'drop-shadow(0 10px 20px rgba(120, 20, 0, 0.30))',
        }}
      />

      <div style={{flex: 1, minWidth: 0, paddingBottom: 18}}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: STAFF.CREAM,
          letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 6,
        }}>
          Scarica Byup Staff
        </div>
        <div style={{fontSize: 16, color: STAFF.CREAM, opacity: 0.92, lineHeight: 1.45}}>
          Il nuovo POS totalmente digitale e gratuito, utilizzabile
          su ogni dispositivo mobile.
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: 15, fontWeight: 600, color: STAFF.CREAM, marginTop: 12,
        }}>
          <OnbIcon.Camera size={15} color={STAFF.CREAM}/>
          Inquadra il QR code per scaricare l’applicazione
        </div>
        <div style={{
          fontSize: 15, color: STAFF.CREAM, opacity: 0.92, lineHeight: 1.45, marginTop: 4,
        }}>
          oppure vai su <a href={STORE_LINKS.play} style={storeLink}>Play Store</a>
          {' '}o <a href={STORE_LINKS.app} style={storeLink}>App Store</a>
        </div>
      </div>

      <div style={{paddingBottom: 18, flexShrink: 0}}>
        <QrMock size={108}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// QR decorativo in SVG — moduli e finder arrotondati, trama deterministica.
// Sostituisce il repeating-conic-gradient a scacchiera: quello era una griglia
// regolare e si leggeva come una texture, non come un codice.
// Nel prototipo non c'è un URL reale da codificare, e un QR dichiaratamente
// finto è preferibile a uno scansionabile che porterebbe altrove.
// ─────────────────────────────────────────────────────────────────────────

function QrMock({size = 132}) {
  const N = 25;                          // moduli per lato
  const cell = size / N;
  const r = cell * 0.34;                 // raggio: moduli a "pillola", non quadrati
  const FG = '#17181C';

  const inFinder = (row, col) =>
    (row < 8 && col < 8) || (row < 8 && col >= N - 8) || (row >= N - 8 && col < 8);
  // Riquadro centrale lasciato libero per il logo
  const inLogo = (row, col) =>
    row >= N / 2 - 3 && row <= N / 2 + 2 && col >= N / 2 - 3 && col <= N / 2 + 2;

  // Rumore deterministico: stessa trama a ogni render, nessun Math.random
  const acceso = (row, col) => {
    const h = Math.sin(row * 12.9898 + col * 78.233) * 43758.5453;
    return (h - Math.floor(h)) > 0.47;
  };

  const moduli = [];
  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      if (inFinder(row, col) || inLogo(row, col) || !acceso(row, col)) continue;
      moduli.push(
        <rect key={`${row}-${col}`}
          x={col * cell + cell * 0.1} y={row * cell + cell * 0.1}
          width={cell * 0.8} height={cell * 0.8}
          rx={r} fill={FG}/>
      );
    }
  }

  const Finder = ({row, col}) => (
    <g transform={`translate(${col * cell}, ${row * cell})`}>
      <rect x={cell * 0.35} y={cell * 0.35} width={cell * 6.3} height={cell * 6.3}
        rx={cell * 2} fill="none" stroke={FG} strokeWidth={cell * 0.95}/>
      <rect x={cell * 2.1} y={cell * 2.1} width={cell * 2.8} height={cell * 2.8}
        rx={cell * 1} fill={FG}/>
    </g>
  );

  return (
    <div aria-label="QR code per scaricare Byup Staff" role="img" style={{
      width: size + 20, height: size + 20, flexShrink: 0,
      background: STAFF.CREAM,
      borderRadius: 14, padding: 10,
      boxShadow: '0 8px 20px -10px rgba(120, 20, 0, 0.45)',
      position: 'relative',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display: 'block'}}>
        {moduli}
        <Finder row={0} col={0}/>
        <Finder row={0} col={N - 7}/>
        <Finder row={N - 7} col={0}/>
      </svg>
      {/* Logo al centro, nel riquadro lasciato libero dai moduli */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 0.26, height: size * 0.26,
        borderRadius: size * 0.075,
        background: `linear-gradient(135deg, ${STAFF.RED}, ${STAFF.ORANGE})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `${Math.round(size * 0.028)}px solid ${STAFF.CREAM}`,
      }}>
        {/* Marchio byup in panna al centro del codice — img inline e non
            PnI.MarkWhite: questa pagina non carica panoramica-icons. */}
        <img src="Fresh-mark.png" alt="" style={{
          width: size * 0.15, height: size * 0.15, objectFit: 'contain',
          filter: 'brightness(0) invert(1)', opacity: 0.97,
          display: 'block', pointerEvents: 'none',
        }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PaymentBrandIcon — 24×24 SVG inline per ogni provider.
// I path sono semplificazioni dei marchi ufficiali con i colori brand reali.
// Fallback (provider non riconosciuto) = monogram neutro così il render
// non si rompe mai anche se passa un provider futuro non supportato.
// ─────────────────────────────────────────────────────────────────────────

function PaymentBrandIcon({provider, size = 24}) {
  const wrap = {width: size, height: size, borderRadius: 6, flexShrink: 0, overflow: 'hidden'};

  if (provider === 'stripe') {
    return (
      <div style={{...wrap, background: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
          <path d="M11.6 8.7c-.7 0-1.1.2-1.1.7 0 .5.5.7 1.6 1.1 1.7.6 2.6 1.4 2.6 2.9 0 1.7-1.3 2.7-3.4 2.7-1.2 0-2.4-.3-3.3-.7v-2c.9.5 1.9.8 2.9.8.7 0 1.2-.2 1.2-.7 0-.6-.5-.8-1.6-1.2-1.6-.6-2.6-1.4-2.6-2.8 0-1.6 1.3-2.6 3.3-2.6 1 0 2 .2 2.9.6v1.9c-.8-.4-1.7-.7-2.5-.7z"/>
        </svg>
      </div>
    );
  }
  if (provider === 'applepay') {
    return (
      <div style={{...wrap, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      </div>
    );
  }
  if (provider === 'googlepay') {
    return (
      <div style={{...wrap, background: '#fff', border: '1px solid rgba(15,17,21,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {/* Glifo Google G ufficiale a 4 colori, leggermente ridotto per centrarlo nel 24×24 */}
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
    );
  }
  if (provider === 'paypal') {
    // PayPal: due "P" sovrapposte (logo classico). Sfondo blu primario #003087,
    // P davanti bianca, P retro azzurra #009CDE — i tre colori del marchio ufficiale.
    return (
      <div style={{...wrap, background: '#003087', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M7 4h7.5c2.4 0 4 1.3 3.6 3.7-.4 2.6-2.2 4-5 4h-3l-1 5.3H6L7 4z" fill="#009CDE"/>
          <path d="M9.5 7h6c2 0 3.2 1.1 2.8 3.2-.4 2.4-1.9 3.5-4.4 3.5H12L11.2 18H9L9.5 7z" fill="#fff"/>
        </svg>
      </div>
    );
  }
  if (provider === 'klarna') {
    // Klarna: monogramma "K" stilizzato tipo wordmark recente — su fondo "smoothie pink"
    // ufficiale del brand 2018+ (#FFA8CD). Glyph nero per massimo contrasto.
    return (
      <div style={{...wrap, background: '#FFA8CD', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4 V20"/>
          <path d="M7 12 L15 4"/>
          <path d="M7 12 L17 20"/>
        </svg>
      </div>
    );
  }
  if (provider === 'satispay') {
    // Satispay: "S" curva bianca su fondo rosso brand (#FF3131 — versione corrente).
    // Lo stroke 2px replica il peso ottico del wordmark Satispay.
    return (
      <div style={{...wrap, background: '#FF3131', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 7c-1.5-1.2-3.4-1.8-5.2-1.8-2.8 0-4.7 1.4-4.7 3.4 0 1.7 1.4 2.5 4 2.9 3 .6 4.9 1.4 4.9 3.7 0 2.2-1.9 3.6-5.2 3.6-2 0-3.9-.5-5.4-1.5"/>
        </svg>
      </div>
    );
  }
  // Fallback testuale neutro — non si rompe se passa un provider non gestito
  return (
    <div style={{...wrap, background: ONB.BG, border: '1px solid rgba(15,17,21,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <span style={{fontSize: 13, fontWeight: 600, color: ONB.MUTED}}>{provider?.[0]?.toUpperCase() || '?'}</span>
    </div>
  );
}

// MethodRow — riga full-width per i metodi opzionali (PayPal/Klarna/Satispay).
// Layout list con border-bottom: pattern Stripe/Linear per le option list dense.
function MethodRow({provider, label, desc, checked, onToggle}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 0',
      borderBottom: '1px solid rgba(15, 17, 21, 0.04)',
      cursor: 'pointer',
    }}>
      <PaymentBrandIcon provider={provider}/>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 16, fontWeight: 500, color: ONB.TEXT, lineHeight: 1.4}}>
          {label}
        </div>
        <div style={{fontSize: 15, fontWeight: 400, color: ONB.MUTED, lineHeight: 1.4, marginTop: 2}}>
          {desc}
        </div>
      </div>
      <Checkbox checked={checked} onChange={onToggle}/>
    </label>
  );
}

function StripeConnectRow({status, onConnect, onDisconnect}) {
  const connected = status === 'connected';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: 16,
      background: connected ? '#F8FBF9' : ONB.BG_SOFT,
      border: `1px solid ${connected ? 'rgba(22, 163, 74, 0.16)' : 'rgba(15, 17, 21, 0.08)'}`,
      borderRadius: 8,
    }}>
      {/* Stripe brand mark — semplice, color official */}
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: '#635BFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{fontSize: 20, fontWeight: 600, color: '#fff'}}>S</span>
      </div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 16, fontWeight: 600, color: ONB.TEXT, lineHeight: 1.4}}>
          Stripe
        </div>
        <div style={{fontSize: 15, fontWeight: 400, color: ONB.MUTED, lineHeight: 1.4, marginTop: 2}}>
          {connected
            ? 'Connesso · acct_••••dE3v'
            : 'Collega per accettare da subito carte e pagamenti digitali.'}
        </div>
      </div>
      {connected ? (
        <button onClick={onDisconnect} style={{
          height: 36, padding: '0 14px',
          background: 'transparent', border: 'none',
          color: ONB.MUTED, fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
          cursor: 'pointer', borderRadius: 6,
        }}>
          Disconnetti
        </button>
      ) : (
        <button onClick={onConnect} style={{
          height: 36, padding: '0 16px',
          background: ONB.ACTION_SECONDARY, color: '#fff',
          border: 'none', borderRadius: 8,
          fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'background 150ms ease-out',
        }}>
          Connetti
          <OnbIcon.ArrowRight size={11} color="#fff"/>
        </button>
      )}
    </div>
  );
}

function Checkbox({checked, onChange}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 18, height: 18, borderRadius: 4,
        background: checked ? ONB.ACTION_SECONDARY : '#fff',
        border: `1.5px solid ${checked ? ONB.ACTION_SECONDARY : 'rgba(15, 17, 21, 0.18)'}`,
        cursor: 'pointer', padding: 0, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms ease-out',
      }}
    >
      {checked && <OnbIcon.Check size={11} color="#fff"/>}
    </button>
  );
}

window.Step2Locale = Step2Locale;
