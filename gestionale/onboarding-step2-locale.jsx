// Step 2 — Il tuo locale: anagrafica + P.IVA, un passo solo.
//
// Sub-step "Fiscale" rimosso: SDI/PEC sono completati nelle impostazioni
// post-onboarding. Sub-step "Pagamenti" rimosso (4 settembre 2026): Stripe si
// collega dal gestionale, in Integrazioni, e la notifica lo chiede
// appena si atterra. Con lui sono uscite le due schede fiscali — chi trasmette
// gli scontrini e le attivazioni con la delega — che ora vivono in
// Impostazioni → Dati fiscali, dove la seconda notifica dell'atterraggio
// porta. Motivo unico per tutte e tre: sono atti che si compiono su altri siti
// (la verifica di Stripe, la nomina sul portale, la delega con SPID), e
// metterli sulla porta d'ingresso voleva dire non far entrare nessuno. Qui il soggetto giuridico minimo è forma giuridica + P.IVA
// e — per la ditta individuale — il codice fiscale del
// titolare, che NON è la P.IVA (P-86), con i suoi dati di nascita (P-151,
// D-80: «i dati richiesti dalla comunicazione del gestore di piattaforma si
// chiedono in quel momento, non dopo»). Il resto dell'anagrafica per forma
// (registro imprese) sta in Impostazioni → Dati fiscali, che ripete la stessa
// enumerazione di legal_form (ERD v11) e legge da qui quello che è già stato
// scritto (byup_anagrafica_onboarding), senza farlo riscrivere.
// Sub-step "Carte e digital wallet" (Apple/Google Pay) rimosso: sono attivi via Stripe
// senza dover comunicare nulla all'utente in fase di onboarding.

function Step2Locale({
  venue, setVenue,
  onNext, onBack,
}) {
  const v = (k, val) => setVenue(prev => ({...prev, [k]: val}));

  // Il cancello del passo (P-151): «Continua» si accende solo quando le
  // condizioni del passo sono soddisfatte — forma giuridica, nome e partita
  // IVA per tutti; per la ditta individuale anche codice fiscale e dati di
  // nascita del titolare. Prima non era condizionato in nessun caso, e un
  // onboarding che lascia entrare senza consegna un locale che sembra pronto
  // e non lo è: il problema si manifesta al primo incasso, davanti a un cliente.
  const pieno = (x) => String(x || '').trim().length > 0;
  // Un onboarding vergine crea SEMPRE un soggetto fiscale nuovo (P-153): la
  // partita IVA è unica per ristorante nel modello. Se la partita IVA esiste
  // già, non si prosegue: si dice che il soggetto esiste e si rimanda a
  // crearla come seconda sede da dentro il profilo. L'elenco è la copia dei
  // soggetti del seme (PN_SOGGETTI in panoramica-tokens.jsx, altro bundle).
  const ONB_PIVA_ESISTENTI = { '12345678901': 'Cacio e Pepe S.r.l.', '09876543210': 'Borgo Ristorazione S.n.c.', '05566778899': 'La Marina S.a.s.' };
  const pivaPulita = String(venue.piva || '').toUpperCase().replace(/^IT/, '').replace(/\s/g, '');
  const soggettoEsistente = ONB_PIVA_ESISTENTI[pivaPulita] || null;
  const pronto = !soggettoEsistente && pieno(venue.legalForm) && pieno(venue.name) && pieno(venue.piva) &&
    (venue.legalForm !== 'ditta_individuale' ||
      (pieno(venue.titolareCf) && pieno(venue.titolareNascita) && pieno(venue.titolareComuneNascita) && pieno(venue.titolareStatoNascita)));
  // Quello che è stato scritto qui lo ritrova Dati fiscali (altro bundle):
  // stessi nomi, un registro condiviso, nessun secondo modulo da compilare.
  const avanti = () => {
    if (!pronto) return;
    try {
      localStorage.setItem('byup_anagrafica_onboarding', JSON.stringify({
        legalForm: venue.legalForm, societaTipo: venue.societaTipo, name: venue.name, piva: venue.piva,
        titolareCf: venue.titolareCf, titolareNascita: venue.titolareNascita,
        titolareComuneNascita: venue.titolareComuneNascita, titolareStatoNascita: venue.titolareStatoNascita,
        address: venue.address, civico: venue.civico, cap: venue.cap, city: venue.city, phone: venue.phone, regime: venue.regime,
        scritto_il: new Date().toISOString(),
      }));
    } catch (e) {}
    onNext();
  };

  // Un passo solo: le informazioni. La sezione «Pagamenti» non c'è più (4
  // settembre 2026) — il collegamento con Stripe passa dalla verifica
  // d'identità di Stripe, e chiederla prima di far entrare qualcuno voleva
  // dire non farlo entrare: si collega dal gestionale, da Integrazioni,
  // e la prima notifica dell'atterraggio lo chiede.
  const t = {title: 'Le informazioni del tuo locale.',
             sub: 'Queste informazioni verranno pubblicate e visualizzate dagli utenti dell’applicazione Byup.',
             note: 'Potrai modificarle in qualsiasi momento dalle Impostazioni.'};

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
        display: 'grid', gridTemplateColumns: STG('minmax(0, 1fr) 620px'),
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

        </div>

        {/* ─── Colonna destra — campi ─────────────────────────────────── */}
        <div>
          <SubStepInfo venue={venue} v={v} pronto={pronto}/>
          {soggettoEsistente && (
            <div data-piva-esistente style={{marginTop: 12, padding: '12px 14px', borderRadius: 12, background: '#FFFBEB', border: '1px solid #FCD34D', fontSize: 14.5, color: '#92400E', lineHeight: 1.5}}>
              <b>Questa partita IVA è già su Byup: {soggettoEsistente}.</b> Un soggetto fiscale non si crea due volte. Se stai aprendo
              una seconda sede dello stesso locale, si crea da dentro il profilo già creato — <a href="byup Profilo.html" style={{color: '#92400E', fontWeight: 700}}>Profilo → I tuoi locali → Aggiungi locale → Crea la sede</a> —
              e riparte da menù, sala e tavoli, perché la parte fiscale c'è già.
            </div>
          )}

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
            <PrimaryCta onClick={avanti} disabled={!pronto}>
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

function SubStepInfo({venue, v, pronto}) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {/* Anagrafica del locale: W1 white classic standard. Era marcata "glass"
          (alias di aurora L2) in passato — riportata a default per richiesta. */}
      <OnbCard>
        <OnbSectionHeader
          title="Anagrafica del locale"
          subtitle="Forma giuridica, P.IVA e dove si trova il locale."
        />
        {/* La forma giuridica è la PRIMA domanda (P-86): decide quali dati
            fiscali esistono. Qui cambia solo il minimo — il CF del titolare
            per le persone fisiche — i campi completi per forma stanno in
            Impostazioni → Dati fiscali. */}
        <div style={{marginBottom: 16}}>
          <div style={{fontSize: 15, fontWeight: 600, color: ONB.TEXT, marginBottom: 9}}>
            Forma giuridica
          </div>
          <FormaGiuridicaGroup value={venue.legalForm} onChange={(x) => v('legalForm', x)}/>
          {/* Dentro la società, persone o capitali: cambia solo i dati per
              fatturazione (capitale sociale e socio unico esistono solo per
              le società di capitali), e si chiede qui per non chiederlo dopo. */}
          {venue.legalForm === 'societa' && (
            <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}>
              {[{id: 'capitali', label: 'Società di capitali (S.r.l., S.p.A.)'}, {id: 'persone', label: 'Società di persone (S.n.c., S.a.s.)'}].map(o => {
                const sel = (venue.societaTipo || 'capitali') === o.id;
                return (
                  <label key={o.id} style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, cursor: 'pointer', background: sel ? ONB.BRAND_TINT : '#fff', border: `1px solid ${sel ? 'rgba(255, 90, 95, 0.35)' : 'rgba(15, 17, 21, 0.10)'}`}}>
                    <input type="radio" name="societa-tipo" checked={sel} onChange={() => v('societaTipo', o.id)} style={{margin: 0, accentColor: ONB.BRAND}}/>
                    <span style={{fontSize: 14, fontWeight: sel ? 600 : 500, color: sel ? ONB.TEXT : ONB.MUTED}}>{o.label}</span>
                  </label>
                );
              })}
            </div>
          )}
          {venue.legalForm === 'ente' && (
            <div style={{marginTop: 10, padding: '10px 13px', borderRadius: 10, background: ONB.BG, border: '1px solid rgba(15, 17, 21, 0.08)', fontSize: 14.5, color: ONB.MUTED, lineHeight: 1.5}}>
              {/* P-116 (D-103): l'ente non è più «in attesa». Ha i campi della
                  società e nessun percorso proprio: cooperative, consorzi,
                  associazioni e circoli con partita IVA. */}
              Cooperative, consorzi, associazioni e circoli con partita IVA: i dati richiesti sono quelli della società, e gli scontrini si trasmettono allo stesso modo, con le credenziali della persona che nomini incaricata sul portale. Qui bastano nome e partita IVA; la nomina dell'incaricato e la delega si completano dopo l'ingresso, in Impostazioni → Dati fiscali, e senza il canale non si emette.
            </div>
          )}
        </div>
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
          {/* Il CF della persona, distinto dalla P.IVA: è il dato che prima
              nasceva sbagliato. Solo per la ditta individuale. */}
          {venue.legalForm === 'ditta_individuale' && (
            <>
              <div style={{gridColumn: 'span 12'}}>
                <OnbField label="Codice fiscale del titolare"
                  value={venue.titolareCf}
                  onChange={(x) => v('titolareCf', x.toUpperCase())}
                  placeholder="RSSMRA78C21H501X"/>
              </div>
              {/* I dati di nascita del titolare (P-151, D-80): li chiede la
                  comunicazione del gestore di piattaforma, e si chiedono
                  insieme al codice fiscale, una volta sola. Stessi nomi di
                  Dati fiscali. */}
              <div style={{gridColumn: 'span 4'}}>
                <OnbField label="Data di nascita" type="date"
                  value={venue.titolareNascita} onChange={(x) => v('titolareNascita', x)}
                  placeholder="1978-03-21"/>
              </div>
              <div style={{gridColumn: 'span 4'}}>
                <OnbField label="Comune di nascita"
                  value={venue.titolareComuneNascita} onChange={(x) => v('titolareComuneNascita', x)}
                  placeholder="Roma"/>
              </div>
              <div style={{gridColumn: 'span 4'}}>
                <OnbField label="Stato di nascita"
                  value={venue.titolareStatoNascita} onChange={(x) => v('titolareStatoNascita', x.toUpperCase().slice(0, 2))}
                  placeholder="IT"/>
              </div>
            </>
          )}
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
        {/* Il regime sta dentro la stessa card e non in una sua: è un attributo
            dell'anagrafica come la P.IVA, non un capitolo a parte. Una riga di
            opzioni, senza le descrizioni che spiegavano l'IVA — chi compila il
            proprio regime lo sa già, e quel testo costava tre righe di canvas. */}
        <div style={{marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(15, 17, 21, 0.07)'}}>
          <div style={{fontSize: 15, fontWeight: 600, color: ONB.TEXT, marginBottom: 9}}>
            Seleziona regime fiscale
          </div>
          <RegimeRadioGroup value={venue.regime} onChange={(x) => v('regime', x)}/>
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

      {/* Qui non si chiede più nulla che si compia altrove (4 settembre
          2026): gli scontrini e le attivazioni fiscali — la nomina
          dell'incaricato sul portale, la delega con SPID — tenevano il locale
          fermo sulla porta, e ora glieli chiede la campanella una volta
          entrato, con la notifica che porta in Dati fiscali. Anche la tessera
          «Scarica Byup Staff» se n'è andata: sta in Impostazioni → Personale,
          accanto a «Collega un dispositivo», che è il gesto che la
          presuppone. */}
    </div>
  );
}
// Le attivazioni fiscali — delega all'Agenzia, conservazione,
// accreditamento come esercente — non si chiedono più qui (4 settembre
// 2026): la delega è un atto dell'esercente sul portale, con SPID, e
// tenerlo fermo sulla porta finché non l'aveva data voleva dire non farlo
// entrare. Ora la scheda vive in Impostazioni → Dati fiscali
// (AdeAttivazioniCard), dove la porta la notifica dell'atterraggio, e con
// lei ci sono il codice fiscale di Byup, i tap sul portale e il controllo.

// Regime fiscale — tre opzioni in riga, etichetta e basta. Le descrizioni
// ("IVA al 10% sui pasti…") spiegavano una cosa che chi ha un locale conosce
// già, e costavano più spazio della scelta stessa.
// Enumerazione di legal_form (ERD v11, FISC-01) ridotta a ciò che esiste nel
// nostro settore, e sono TRE forme (D-103): chi somministra è un'impresa
// iscritta al Registro delle imprese, quindi ditta individuale, società, o
// ente e altra forma collettiva — sotto cui stanno cooperative, consorzi,
// associazioni e circoli con partita IVA (FIPE, Rapporto Ristorazione 2026:
// imprese individuali 46,5%, società 52,4%, altre forme 1,1%). Il libero
// professionista non c'è: partita IVA senza impresa, fatture e non scontrini.
// L'ente non è più rimandato alla Soluzione Software: ha i campi della società
// e nessun percorso proprio. L'etichetta è «Ente o altra forma collettiva» e
// non «Ente o cooperativa» (P-116), perché la seconda ne nomina uno solo e fa
// pensare che gli altri non rientrino. Stessa definizione in Impostazioni →
// Dati fiscali.
function FormaGiuridicaGroup({value, onChange}) {
  const options = [
    {id: 'ditta_individuale', label: 'Ditta individuale'},
    {id: 'societa',           label: 'Società'},
    {id: 'ente',              label: 'Ente o altra forma collettiva'},
  ];
  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <label key={o.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 999, cursor: 'pointer',
            background: selected ? ONB.BRAND_TINT : '#fff',
            border: `1px solid ${selected ? 'rgba(255, 90, 95, 0.35)' : 'rgba(15, 17, 21, 0.10)'}`,
            transition: 'background 150ms ease-out, border-color 150ms ease-out',
          }}>
            <input type="radio" name="forma-giuridica"
              checked={selected} onChange={() => onChange(o.id)}
              style={{margin: 0, accentColor: ONB.BRAND}}/>
            <span style={{
              fontSize: 15, fontWeight: selected ? 600 : 500,
              color: selected ? ONB.TEXT : ONB.MUTED, lineHeight: 1.2,
            }}>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function RegimeRadioGroup({value, onChange}) {
  const options = [
    {id: 'ordinario',   label: 'Ordinario'},
    {id: 'forfettario', label: 'Forfettario'},
    {id: 'agricolo',    label: 'Agricolo / Speciale'},
  ];
  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <label key={o.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 999, cursor: 'pointer',
            background: selected ? ONB.BRAND_TINT : '#fff',
            border: `1px solid ${selected ? 'rgba(255, 90, 95, 0.35)' : 'rgba(15, 17, 21, 0.10)'}`,
            transition: 'background 150ms ease-out, border-color 150ms ease-out',
          }}>
            <input type="radio" name="regime"
              checked={selected} onChange={() => onChange(o.id)}
              style={{margin: 0, accentColor: ONB.BRAND}}/>
            <span style={{
              fontSize: 15, fontWeight: selected ? 600 : 500,
              color: selected ? ONB.TEXT : ONB.MUTED, lineHeight: 1.2,
            }}>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}
// La tessera «Scarica Byup Staff» — il marchio, la mascotte e il QR — non
// vive più qui: sta in Impostazioni → Personale (PersStaffPromo), dove c'è
// «Collega un dispositivo». Con lei se ne sono andati la palette scritta a
// mano e il QR in SVG, che non avevano altri usi in questa pagina.


window.Step2Locale = Step2Locale;
