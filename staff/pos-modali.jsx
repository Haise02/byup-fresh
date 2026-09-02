// Byup Staff — Modali (bottom sheet): ricevuta, dettaglio transazione

const { useState: useStateM } = React;

function Sheet({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(15,17,21,0.45)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fadeIn 180ms ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: '#fff',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '10px 20px 36px', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
        animation: 'sheetUp 240ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: ST.MUTED_3, margin: '0 auto 18px' }}/>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}

function POSModals({ modal, closeModal }) {
  if (!modal) return null;

  // ── Invia ricevuta ──────────────────────────────────────────
  if (modal.kind === 'ricevuta') {
    return <RicevutaSheet modal={modal} closeModal={closeModal}/>;
  }

  // ── Dettaglio transazione ───────────────────────────────────
  if (modal.kind === 'dettaglio-tx') {
    return <DettaglioSheet modal={modal} closeModal={closeModal}/>;
  }

  // ── Permessi primo accesso ──────────────────────────────────
  if (modal.kind === 'permessi') {
    return <PermessiSheet modal={modal} closeModal={closeModal}/>;
  }

  // ── Pagina legale (da Profilo) ──────────────────────────────
  if (modal.kind === 'legal') {
    return <LegalModal which={modal.which} closeModal={closeModal}/>;
  }

  // ── Conferma disattivazione Face ID ─────────────────────────
  if (modal.kind === 'faceid-off') {
    return (
      <SystemAlert
        titolo="Disattivare il Face ID?"
        messaggio="Al prossimo accesso dovrai inserire la password. Puoi riattivarlo quando vuoi dal Profilo."
        azioni={[
          { label: 'Annulla', onClick: closeModal },
          { label: 'Disattiva', bold: true, onClick: () => { modal.onConfirm(); closeModal(); } },
        ]}
      />
    );
  }

  // ── Conferma uscita dall'app (logout) ───────────────────────
  if (modal.kind === 'logout') {
    return (
      <SystemAlert
        titolo="Uscire da Byup Staff?"
        messaggio="Dovrai accedere di nuovo per incassare. Vuoi davvero uscire?"
        azioni={[
          { label: 'Annulla', onClick: closeModal },
          { label: 'Esci', bold: true, onClick: () => { modal.onConfirm(); closeModal(); } },
        ]}
      />
    );
  }

  // ── Conferma annullamento conto (rimanda al gestionale) ──────
  if (modal.kind === 'annulla-conto') {
    return (
      <SystemAlert
        titolo={`Vuoi modificare l'importo del tavolo ${modal.tavolo}?`}
        messaggio="Il conto verrà rimosso dalla coda di incasso e rimandato al gestionale per la correzione."
        azioni={[
          { label: 'Indietro', onClick: closeModal },
          { label: 'Rimanda al gestionale', bold: true, onClick: () => { modal.onConfirm(); closeModal(); } },
        ]}
      />
    );
  }

  return null;
}

// Wrapper per aprire le pagine legali come schermata, con switch Termini↔Privacy
function LegalModal({ which, closeModal }) {
  const [w, setW] = useStateM(which);
  return <LegalPage which={w} onBack={closeModal} onOther={setW}/>;
}

// ── Permessi primo accesso: popup di sistema in sequenza ──────
function PermessiSheet({ modal, closeModal }) {
  const [step, setStep] = useStateM(0);          // 0=tap, 1=pos, (2=faceid)
  const [legal, setLegal] = useStateM(null);     // null | 'termini' | 'privacy'

  // Al primo accesso proponiamo anche lo sblocco con Face ID.
  const askFaceId = !!(modal && modal.askFaceId);
  // Prima di tutto la presa d'atto sulle statistiche di servizio (P-35 ·
  // D-30): si legge al primo accesso, prima di Tap to Pay, e si registra in
  // consent_events come staff_metrics_notice. Non è un permesso di sistema e
  // non è un consenso: è un'informazione che si dichiara di aver ricevuto.
  const noticeDone = !!(modal && modal.noticeDone);
  const ORDINE = [...(noticeDone ? [] : ['notice']), 'tap', 'pos', ...(askFaceId ? ['faceid'] : [])];

  // passa al permesso successivo; finiti i prompt, chiude (sei nell'app)
  const avanti = () => {
    if (step + 1 >= ORDINE.length) closeModal();
    else setStep(step + 1);
  };

  // Pagina legale a schermo intero → torna all'alert corrente
  if (legal) {
    return <LegalPage which={legal} onBack={() => setLegal(null)} onOther={setLegal}/>;
  }

  const id = ORDINE[step];
  if (id === 'notice') {
    return <LegalPage which="statistiche" onLetto={() => { modal.markNotice && modal.markNotice(); avanti(); }}/>;
  }
  let cfg;
  if (id === 'tap') {
    cfg = {
      titolo: 'Configura Tap to Pay su iPhone',
      messaggio: 'Accetta i Termini di Tap to Pay su iPhone di Apple per incassare con carta.',
      azioni: [
        { label: 'Leggi i termini', onClick: () => setLegal('termini') },
        { label: 'Annulla', onClick: avanti },
        { label: 'Accetta', bold: true, onClick: avanti },
      ],
    };
  } else if (id === 'pos') {
    cfg = {
      titolo: 'Consentire a «byup» di usare la posizione?',
      messaggio: "La posizione è usata per verificare il paese e prevenire le frodi durante i pagamenti.",
      azioni: [
        { label: "Consenti mentre usi l'app", bold: true, onClick: avanti },
        { label: 'Consenti una volta', onClick: avanti },
        { label: 'Non consentire', onClick: avanti },
      ],
    };
  } else {
    cfg = {
      titolo: 'Vuoi sbloccare con il Face ID?',
      messaggio: 'La prossima volta potrai accedere a Byup Staff con il riconoscimento del volto, senza inserire la password. Puoi gestirlo dal Profilo.',
      azioni: [
        { label: 'Non ora', onClick: () => { modal.markAsked && modal.markAsked(); avanti(); } },
        { label: 'Attiva Face ID', bold: true, onClick: () => { modal.enableFaceId && modal.enableFaceId(); modal.markAsked && modal.markAsked(); avanti(); } },
      ],
    };
  }

  return <SystemAlert {...cfg}/>;
}

// ── Mini-alert di sistema stile iOS ───────────────────────────
function SystemAlert({ titolo, messaggio, azioni }) {
  const stacked = azioni.length > 2;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 130, background: 'rgba(0,0,0,0.28)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeIn 150ms ease',
    }}>
      <div style={{
        width: 272, borderRadius: 14, overflow: 'hidden',
        background: 'rgba(248,248,248,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        fontFamily: '-apple-system, system-ui', boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
      }}>
        <div style={{ padding: '19px 16px 15px', textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#000', marginBottom: messaggio ? 4 : 0 }}>{titolo}</div>
          {messaggio && <div style={{ fontSize: 13, color: '#000', lineHeight: 1.35 }}>{messaggio}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', borderTop: '0.5px solid rgba(0,0,0,0.22)' }}>
          {azioni.map((a, i) => (
            <button key={i} onClick={a.onClick} style={{
              flex: stacked ? '0 0 auto' : 1, width: stacked ? '100%' : 'auto',
              height: 44, minHeight: 44, border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 17, color: '#007AFF', fontWeight: a.bold ? 600 : 400,
              borderTop: stacked && i > 0 ? '0.5px solid rgba(0,0,0,0.22)' : 'none',
              borderLeft: !stacked && i > 0 ? '0.5px solid rgba(0,0,0,0.22)' : 'none',
            }}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Pagina legale a schermo intero ────────────────────────────
// `which` può essere anche 'statistiche': l'informazione sulle statistiche di
// servizio (PN_STAFF_NOTICE, testo unico coi bundle di sala), con `onLetto` al
// primo accesso — un solo pulsante «Ho letto», mai «Accetta», e nessun
// indietro: non c'è niente dietro — e in sola lettura dal Profilo.
function LegalPage({ which, onBack, onOther, onLetto }) {
  const termini = which === 'termini';
  const avviso = which === 'statistiche';
  const N = avviso ? window.PN_STAFF_NOTICE : null;
  const titolo = avviso ? N.titolo : termini ? 'Termini di servizio' : 'Informativa sulla privacy';
  const para = avviso ? N.blocchi.map(b => [b.t, b.p]) : termini ? [
    ['1. Servizio', "Byup Staff consente agli esercenti registrati su Byup Fresh di incassare pagamenti con carta tramite Tap to Pay su iPhone, tecnologia fornita da Apple e processata da Stripe."],
    ['2. Requisiti', "Per usare il servizio devi avere un account attivo del tuo locale, un iPhone compatibile e accettare i Termini di Tap to Pay su iPhone di Apple."],
    ['3. Pagamenti e accrediti', "Le transazioni sono regolate e accreditate da Stripe sull'IBAN indicato nel tuo account. byup non detiene fondi."],
    ['4. Uso corretto', "Ti impegni a incassare solo importi dovuti per beni e servizi effettivamente forniti dal tuo locale, nel rispetto delle regole dei circuiti di pagamento."],
    ['5. Responsabilità', "byup fornisce l'app 'così com'è'. La disponibilità del servizio dipende anche da Apple e Stripe."],
  ] : [
    ['Titolare', "Il titolare del trattamento è byup, contattabile all'indirizzo presente su byup.it."],
    ['Dati trattati', "Trattiamo dati dell'account (email, locale), dati delle transazioni (importo, esito, ultime 4 cifre della carta) e la posizione del dispositivo al momento del pagamento."],
    ['Posizione', "La posizione è richiesta da Apple e Stripe esclusivamente per verificare il paese di utilizzo e prevenire le frodi. Non viene usata per tracciamento pubblicitario."],
    ['Finalità', "I dati servono a erogare il servizio di incasso, prevenire frodi e adempiere agli obblighi di legge (antiriciclaggio, fiscali)."],
    ['Conservazione e diritti', "I dati sono conservati per il tempo previsto dalla legge. Puoi esercitare i tuoi diritti (accesso, rettifica, cancellazione) dal gestionale o scrivendo a byup."],
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 110, background: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '54px 16px 14px',
        borderBottom: `1px solid ${ST.BORDER_SOFT}`, flexShrink: 0,
      }}>
        {!onLetto && <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none', background: ST.SURF_ALT,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.Back s={20}/></button>}
        <div style={{ fontSize: 17, fontWeight: 800, color: ST.TEXT }}>{titolo}</div>
      </div>

      {/* Contenuto scrollabile */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 40px' }}>
        <div style={{ fontSize: 11.5, color: ST.MUTED_2, marginBottom: 16 }}>Ultimo aggiornamento · 06/2026</div>
        {avviso && (
          <div style={{ fontSize: 14, fontWeight: 600, color: ST.TEXT, lineHeight: 1.55, marginBottom: 18, padding: '12px 14px', background: ST.SURF_ALT, borderRadius: ST.R_MD }}>
            {N.intro}
          </div>
        )}
        {para.map(([h, t], i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: ST.TEXT, marginBottom: 5 }}>{h}</div>
            <div style={{ fontSize: 13.5, color: ST.TEXT_SOFT, lineHeight: 1.55 }}>{t}</div>
          </div>
        ))}
        {avviso && (
          <div style={{ fontSize: 13.5, color: ST.TEXT_SOFT, lineHeight: 1.55, marginBottom: 14 }}>{N.chiusura}</div>
        )}
        {onOther && !avviso && (
          <button onClick={() => onOther(termini ? 'privacy' : 'termini')} style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit',
            color: ST.PINK_DARK, fontSize: 13.5, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3,
          }}>
            {termini ? "Leggi l'Informativa sulla privacy" : 'Leggi i Termini di servizio'}
          </button>
        )}
        <div style={{ fontSize: 12, color: ST.MUTED_2, marginTop: 14, lineHeight: 1.5 }}>
          Documento di esempio a scopo dimostrativo.
        </div>
      </div>

      {onLetto && (
        <div style={{ padding: '12px 20px calc(24px + env(safe-area-inset-bottom))', borderTop: `1px solid ${ST.BORDER_SOFT}`, background: '#fff', flexShrink: 0 }}>
          <button onClick={onLetto} style={{
            width: '100%', height: 52, borderRadius: ST.R_PILL, border: 'none',
            background: ST.TEXT, color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{N.bottone}</button>
        </div>
      )}
    </div>
  );
}

// ── Sheet dettaglio: dettaglio → conferma rimborso → avviato ──
function DettaglioSheet({ modal, closeModal }) {
  const t = modal.tx;
  const [view, setView] = useStateM('detail');   // 'detail' | 'confirm' | 'done' | 'ricevuta'
  const cfg = txConfig(t.stato);

  // Invio ricevuta: stesso flusso (SMS / Email) del pagamento
  if (view === 'ricevuta') {
    return <RicevutaSheet modal={{ importo: t.importo }} closeModal={closeModal}/>;
  }

  const Riga = ({ k, v }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${ST.BORDER_SOFT}` }}>
      <span style={{ fontSize: 13, color: ST.MUTED }}>{k}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: ST.TEXT }}>{v}</span>
    </div>
  );

  // Step 2 — conferma rimborso
  if (view === 'confirm') {
    return (
      <Sheet onClose={closeModal}>
        <div style={{ textAlign: 'center', padding: '4px 0 6px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: ST.R_PILL, background: ST.FAIL_BG,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}><I.Refresh s={26} c={ST.FAIL}/></div>
          <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT }}>Rimborsare {eur(t.importo)}?</div>
          <div style={{ fontSize: 13.5, color: ST.MUTED, marginTop: 8, lineHeight: 1.5, padding: '0 8px' }}>
            L'importo sarà riaccreditato sulla carta del cliente
            {t.last4 !== '——' ? ` ${t.brand} ·•${t.last4}` : ''} <b>entro 24 ore</b>. L'operazione non è reversibile.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <Btn variant="danger" size="lg" full onClick={() => { t.stato = 'refund'; setView('done'); }}>
            Conferma rimborso
          </Btn>
          <Btn variant="ghost" size="md" full onClick={() => setView('detail')}>Annulla</Btn>
        </div>
      </Sheet>
    );
  }

  // Step 3 — rimborso avviato
  if (view === 'done') {
    return (
      <Sheet onClose={closeModal}>
        <InviatoOk
          titolo="Rimborso avviato"
          sotto={`${eur(t.importo)} sarà rimborsato al cliente entro 24 ore`}
          onClose={closeModal}
        />
      </Sheet>
    );
  }

  // Step 1 — dettaglio
  return (
    <Sheet onClose={closeModal}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <Chip color={cfg.color} bg={cfg.bg} style={{ marginBottom: 10 }}>{cfg.label}</Chip>
        <div style={{ fontSize: 38, fontWeight: 800, color: ST.TEXT, letterSpacing: -1 }}>
          {t.stato === 'refund' ? '−' : ''}{eur(t.importo)}
        </div>
        <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 4 }}>{t.data} · {t.ora}</div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <Riga k="Metodo" v="Tap to Pay"/>
        <Riga k="Carta" v={t.last4 !== '——' ? `${t.brand} ·•${t.last4}` : t.brand}/>
        <Riga k="ID transazione" v={t.id}/>
        <Riga k="Esercente" v={MERCHANT.nome}/>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="secondary" size="lg" full onClick={() => setView('ricevuta')}>
          <I.Receipt s={17} c={ST.TEXT}/> Ricevuta
        </Btn>
        {t.stato === 'ok' && (
          <Btn variant="danger" size="lg" full onClick={() => setView('confirm')}>
            <I.Refresh s={16} c="#DC2626"/> Rimborsa
          </Btn>
        )}
      </div>
    </Sheet>
  );
}

// ── Campo input contatto (telefono / email) ───────────────────
function ContactInput({ canale, value, onChange, onSubmit }) {
  const isSms = canale === 'sms';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1.5px solid ${ST.BORDER}`, borderRadius: ST.R_MD, padding: '4px 14px', marginBottom: 16 }}>
      {isSms ? <I.Phone s={18} c={ST.MUTED}/> : <I.Mail s={18} c={ST.MUTED}/>}
      <input
        autoFocus
        type={isSms ? 'tel' : 'email'}
        inputMode={isSms ? 'tel' : 'email'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onSubmit(); }}
        placeholder={isSms ? '+39 333 1234567' : 'cliente@email.it'}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 15, fontFamily: 'inherit', color: ST.TEXT, padding: '12px 0',
        }}
      />
    </div>
  );
}

// ── Schermata di conferma invio ───────────────────────────────
function InviatoOk({ titolo, sotto, onClose }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: ST.R_PILL, background: ST.OK_BG,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
      }}><I.Check s={32} c={ST.OK}/></div>
      <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT }}>{titolo}</div>
      <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 4 }}>{sotto}</div>
      <Btn variant="primary" size="lg" full style={{ marginTop: 20 }} onClick={onClose}>Fine</Btn>
    </div>
  );
}

// ── Sheet ricevuta: scegli canale → inserisci contatto → invia ─
function RicevutaSheet({ modal, closeModal }) {
  const [canale, setCanale] = useStateM(null);   // null | 'sms' | 'email'
  const [valore, setValore] = useStateM('');
  const [sent, setSent] = useStateM(false);

  // Step 3 — conferma
  if (sent) {
    return (
      <Sheet onClose={closeModal}>
        <InviatoOk
          titolo="Ricevuta inviata"
          sotto={`Inviata a ${valore} per ${eur(modal.importo)}`}
          onClose={closeModal}
        />
      </Sheet>
    );
  }

  // Step 2 — inserimento contatto
  if (canale) {
    const isSms = canale === 'sms';
    return (
      <Sheet onClose={closeModal}>
        <button onClick={() => { setCanale(null); setValore(''); }} style={{
          display: 'flex', alignItems: 'center', gap: 4, background: 'transparent',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, marginBottom: 12,
          color: ST.MUTED, fontSize: 13, fontWeight: 600,
        }}><I.Back s={16} c={ST.MUTED}/> Indietro</button>
        <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT, marginBottom: 4 }}>
          {isSms ? 'Numero di telefono' : 'Indirizzo email'}
        </div>
        <div style={{ fontSize: 13, color: ST.MUTED, marginBottom: 16 }}>
          Ricevuta di {eur(modal.importo)} {isSms ? 'via SMS' : 'via email'}
        </div>
        <ContactInput canale={canale} value={valore} onChange={setValore} onSubmit={() => setSent(true)}/>
        <Btn variant="primary" size="lg" full disabled={!valore.trim()} onClick={() => setSent(true)}>
          Invia ricevuta
        </Btn>
      </Sheet>
    );
  }

  // Step 1 — scelta canale
  return (
    <Sheet onClose={closeModal}>
      <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT, marginBottom: 4 }}>Invia ricevuta</div>
      <div style={{ fontSize: 13, color: ST.MUTED, marginBottom: 18 }}>
        Pagamento di {eur(modal.importo)} riuscito
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Btn variant="secondary" size="lg" full onClick={() => setCanale('sms')}>
          <I.Phone s={18} c={ST.TEXT}/> Invia via SMS
        </Btn>
        <Btn variant="secondary" size="lg" full onClick={() => setCanale('email')}>
          <I.Mail s={18} c={ST.TEXT}/> Invia via email
        </Btn>
        <Btn variant="ghost" size="md" full onClick={closeModal}>Senza ricevuta</Btn>
      </div>
    </Sheet>
  );
}

Object.assign(window, { POSModals, Sheet });
