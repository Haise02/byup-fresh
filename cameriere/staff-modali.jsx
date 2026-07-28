// byup Staff — Modali (overlay)

const { useState: useStateMo, useEffect: useEffectMo } = React;

function ModalShell({ onClose, children, sheet }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(15,17,21,0.5)',
      display: 'flex', alignItems: sheet ? 'flex-end' : 'center', justifyContent: 'center',
      animation: 'fadeIn 200ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff',
        borderRadius: sheet ? '20px 20px 0 0' : ST.R_XL,
        width: sheet ? '100%' : 'calc(100% - 40px)',
        maxWidth: 380, maxHeight: '90%', overflow: 'auto',
        animation: sheet ? 'slideUp 280ms cubic-bezier(.2,.8,.2,1)' : 'popIn 200ms ease-out',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>{children}</div>
      <style>{`
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }
        @keyframes popIn { from {opacity:0; transform: scale(.94)} to {opacity:1; transform: scale(1)} }
        @keyframes slideUp { from {transform: translateY(100%)} to {transform: translateY(0)} }
      `}</style>
    </div>
  );
}

// ─── Scanner QR — overlay scuro, stile app utente finale ──────
// Il cameriere inquadra il QR sul tavolo e atterra dritto nel suo dettaglio.
// Mock: dopo la "lettura" naviga al tavolo (tap = chiudi senza scansionare).
function QrScanModal({ closeModal, nav }) {
  const vaiAlTavolo = () => { closeModal(); nav.push({ s: 'tavolo', id: 23 }); };
  // Lettura simulata: dopo un attimo "trova" il QR e apre il tavolo.
  useEffectMo(() => {
    const id = setTimeout(vaiAlTavolo, 1800);
    return () => clearTimeout(id);
  }, []);

  return (
    <div onClick={closeModal} style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.92)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      animation: 'fadeIn 200ms ease-out',
    }}>
      <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 600, letterSpacing: 1.5, marginBottom: 8, opacity: 0.7 }}>
        BYUP · SCANNER TAVOLO
      </div>
      <div style={{ color: '#fff', fontSize: 21, fontWeight: 700, marginBottom: 28 }}>
        Inquadra il QR sul tavolo
      </div>
      {/* Mirino con angoli + linea di scansione */}
      <div style={{
        width: 240, height: 240, borderRadius: 24, position: 'relative',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}>
        {[[0,0],[0,1],[1,0],[1,1]].map(([y, x], i) => (
          <div key={i} style={{
            position: 'absolute',
            top: y ? 'auto' : 12, bottom: y ? 12 : 'auto',
            left: x ? 'auto' : 12, right: x ? 12 : 'auto',
            width: 32, height: 32,
            borderTop: !y ? `3px solid ${ST.PINK}` : 'none',
            borderBottom: y ? `3px solid ${ST.PINK}` : 'none',
            borderLeft: !x ? `3px solid ${ST.PINK}` : 'none',
            borderRight: x ? `3px solid ${ST.PINK}` : 'none',
            borderRadius: !y && !x ? '12px 0 0 0' : y && !x ? '0 0 0 12px' : !y && x ? '0 12px 0 0' : '0 0 12px 0',
          }}/>
        ))}
        <div style={{
          position: 'absolute', left: 24, right: 24, height: 2,
          background: `linear-gradient(90deg, transparent, ${ST.PINK}, transparent)`,
          boxShadow: `0 0 12px ${ST.PINK}`,
          animation: 'scanline 2.2s ease-in-out infinite',
        }}/>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 22 }}>
        Lettura del QR del tavolo…
      </div>
      <style>{`
        @keyframes scanline { 0%,100% { top: 24px } 50% { top: 214px } }
      `}</style>
    </div>
  );
}

// ─── Attiva tavolo — componente proprio per evitare hook in if-block ──
function AttivaTavoloModal({ modal, closeModal, openModal }) {
  const t = modal.tavolo;
  // walkIn: il tavolo è prenotato ma ancora lontano (oltre la durata base), quindi
  // trattato come libero. Si siede un walk-in, NON l'ospite della prenotazione →
  // niente prefill dei coperti prenotati, ma un avviso che la prenotazione esiste.
  const walkIn = !!modal.walkIn;
  const ospitePrenotato = t?.stato === 'prenotato' && !walkIn; // attivo per l'ospite atteso
  const capacita = t?.coperti || 2;
  const [n, setN] = useStateMo(ospitePrenotato ? (t?.prenotazione?.coperti || capacita) : capacita);

  // Attivare = una sola decisione: quante persone si siedono. Unisci / sposta /
  // disgiungi non vivono più qui ma nell'hub del tavolo (tap sulla card), così
  // questa modale resta una conferma rapida con un unico controllo.
  const personeTxt = `${n} ${n === 1 ? 'persona' : 'persone'}`;
  const parti = String(t?.n || '').split('+').map(s => s.trim());
  const isComposto = parti.length > 1;

  const onConferma = () => {
    closeModal();
    openModal({ kind: 'success', text: `Tavolo${t ? ` ${t.n}` : ''} attivato · ${n} persone` });
  };

  return (
    <ModalShell onClose={closeModal} sheet>
      <SheetHandle/>
      <div style={{ padding: '4px 24px 32px', textAlign: 'center' }}>
        {/* Intestazione: il tavolo è il soggetto; se è già un gruppo, l'icona-merge lo dice */}
        <div style={{ fontSize: 22, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.4, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {isComposto && <I.Joined s={20} c={ST.TEXT}/>}Tavolo {t?.n}
        </div>
        <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 4 }}>
          {ospitePrenotato ? t.prenotazione.nome : `Libero · ${capacita} posti`}
        </div>

        {/* Avviso walk-in: il tavolo ha una prenotazione più tardi */}
        {walkIn && t?.prenotazione && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, textAlign: 'left',
            padding: '10px 14px', marginTop: 16,
            background: ST.PURPLE_SOFT, borderRadius: ST.R_MD, border: `1px solid ${statoConfig('prenotato').ring}`,
          }}>
            <I.Alert s={15} c={ST.PURPLE}/>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: ST.PURPLE, lineHeight: 1.4 }}>
              Prenotato da {t.prenotazione.nome} tra {t.prenotazione.quando}. Stai sedendo un walk-in: liberalo in tempo.
            </span>
          </div>
        )}

        {/* Persone — l'unico controllo: ampio e arioso */}
        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 28 }}>
          Persone
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <Stepper value={n} onChange={setN}/>
        </div>

        {/* CTA primaria: solo verbo + persone. */}
        <Btn variant="primary" full onClick={onConferma} style={{ marginTop: 28 }}>
          <I.Walk s={16} c="#fff"/>Attiva · {personeTxt}
        </Btn>
      </div>
    </ModalShell>
  );
}

// Personalizza piatto come BOTTOM SHEET: scorre su sopra il menu (fluido, leggero,
// mantiene il contesto) invece di una schermata piena. Aggiunge via modal.onAdd.
function PiattoSheet({ modal, closeModal }) {
  const piatto = PIATTI.find(p => p.id === modal.piattoId) || PIATTI[0];
  const [qty, setQty] = useStateMo(1);
  const [extras, setExtras] = useStateMo({});
  const [cottura, setCottura] = useStateMo(piatto.cottura?.[0] || piatto.livello?.[0]);
  const [note, setNote] = useStateMo('');
  const [showFull, setShowFull] = useStateMo(false);
  const aggiungi = () => {
    modal.onAdd({ piattoId: piatto.id, nome: piatto.nome, prezzo: piatto.prezzo, qty, extras: Object.entries(extras).filter(([_, v]) => v > 0), note, cottura });
    closeModal();
  };
  return (
    <ModalShell onClose={closeModal} sheet>
      {/* Foto con chiusura (fallback gradiente se manca) */}
      <div style={{ position: 'relative', width: '100%', height: 190 }}>
        <DishImage name={piatto.nome} img={piatto.img}/>
        <button onClick={closeModal} style={{
          position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: ST.R_PILL,
          background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: ST.SH_SM,
        }}><I.Close s={16}/></button>
      </div>

      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.4, lineHeight: 1.2 }}>{piatto.nome}</div>
            {piatto.allergeni.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                {piatto.allergeni.map(a => <AllergeneIcon key={a} id={a} size={20}/>)}
              </div>
            )}
          </div>
          <div style={{ fontSize: 21, fontWeight: 800, color: ST.TEXT }}>€{piatto.prezzo}</div>
        </div>

        <div style={{ fontSize: 13.5, color: ST.MUTED, marginTop: 12, lineHeight: 1.55 }}>
          {showFull ? piatto.descr : piatto.descr.slice(0, 90) + (piatto.descr.length > 90 ? '…' : '')}
          {piatto.descr.length > 90 && (
            <span onClick={() => setShowFull(!showFull)} style={{ color: ST.PINK_DARK, fontWeight: 700, marginLeft: 4, cursor: 'pointer' }}>
              {showFull ? 'nascondi' : 'altro'}
            </span>
          )}
        </div>

        {piatto.extras?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Aggiunte</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {piatto.extras.map((e, i) => (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0',
                  borderTop: i === 0 ? `1px solid ${ST.BORDER_SOFT}` : 'none', borderBottom: `1px solid ${ST.BORDER_SOFT}`,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{e.nome}</div>
                    <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 2 }}>€{e.prezzo}</div>
                  </div>
                  <Stepper value={extras[e.id] || 0} onChange={v => setExtras({ ...extras, [e.id]: v })} min={0}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {(piatto.cottura || piatto.livello) && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
              {piatto.cottura ? 'Cottura' : 'Intensità'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(piatto.cottura || piatto.livello).map(opt => {
                const sel = cottura === opt;
                return (
                  <button key={opt} onClick={() => setCottura(opt)} style={{
                    flex: 1, height: 44, borderRadius: ST.R_MD,
                    border: `1.5px solid ${sel ? ST.PINK_DARK : ST.BORDER}`,
                    background: sel ? ST.PINK_SOFT : '#fff', color: sel ? ST.PINK_DARK : ST.TEXT,
                    fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                  }}>{opt}</button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Note per la cucina</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Es. Senza glutine, poco sale..." rows={2}
            style={{ width: '100%', padding: 12, borderRadius: ST.R_MD, border: `1.5px solid ${ST.BORDER}`, background: ST.SURF, fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none' }}/>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: ST.TEXT }}>Quanti aggiungerne?</div>
          <Stepper value={qty} onChange={setQty}/>
        </div>
      </div>

      {/* CTA ancorata in fondo allo sheet */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#fff', borderTop: `1px solid ${ST.BORDER_SOFT}`,
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
      }}>
        <button onClick={aggiungi} style={{
          width: '100%', height: 52, borderRadius: ST.R_PILL, border: 'none',
          background: ST.PINK_DARK, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span>Aggiungi {qty > 1 ? `${qty} ` : ''}all'ordine</span>
        </button>
      </div>
    </ModalShell>
  );
}

function StaffModals({ modal, closeModal, openModal, nav }) {
  if (!modal) return null;

  // ─── Conferma presenza ──────────────────────────────────────
  if (modal.kind === 'conferma-presenza') {
    const [n, setN] = useStateMo(modal.tavolo?.coperti || 4);
    return (
      <ModalShell onClose={closeModal}>
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: ST.TEXT, marginBottom: 6 }}>Conferma presenza</div>
          <div style={{ fontSize: 13.5, color: ST.MUTED, lineHeight: 1.5, marginBottom: 20 }}>
            Tavolo {modal.tavolo?.n} · {modal.tavolo?.prenotazione?.nome}. Conferma il numero effettivo di coperti.
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 14, background: ST.SURF_ALT, borderRadius: ST.R_MD, marginBottom: 24,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Coperti</span>
            <Stepper value={n} onChange={setN}/>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" full onClick={closeModal}>Annulla</Btn>
            <Btn variant="primary" full onClick={() => { closeModal(); openModal({ kind: 'success', text: `Tavolo ${modal.tavolo?.n} aperto · ${n} coperti` }); }}>Conferma</Btn>
          </div>
        </div>
      </ModalShell>
    );
  }

  // ─── Scansione QR → dritto al tavolo ────────────────────────
  if (modal.kind === 'qr-scan') {
    return <QrScanModal closeModal={closeModal} nav={nav}/>;
  }

  // ─── Attiva tavolo ──────────────────────────────────────────
  if (modal.kind === 'piatto') {
    return <PiattoSheet modal={modal} closeModal={closeModal}/>;
  }

  if (modal.kind === 'attiva-tavolo') {
    return <AttivaTavoloModal modal={modal} closeModal={closeModal} openModal={openModal}/>;
  }

  // ─── Azioni rapide card Liberi ──────────────────────────────
  if (modal.kind === 'libero-actions') {
    const t = modal.tavolo;
    const items = t.stato === 'prenotato' ? [
      { i: <I.Edit s={18}/>, l: 'Modifica prenotazione', d: 'Aggiorna dati o cambia orario',
        a: () => { closeModal(); openModal({ kind: 'modifica-prenotazione', tavolo: t }); } },
      { i: <I.Close s={18} c={ST.RED}/>, l: 'Cancella prenotazione', d: 'Annulla e libera il tavolo',
        danger: true, a: () => { closeModal(); openModal({ kind: 'conferma-cancella-prenotazione', tavolo: t, noShow: (t.prenotazione?.ritardo || 0) >= STAFF_SETTINGS.tolleranzaNoShow }); } },
    ] : [
      { i: <I.Merge s={18}/>, l: 'Modifica tavolo', d: 'Unisci o dividi tavoli',
        a: () => { closeModal(); openModal({ kind: 'modifica-tavolo', tavolo: t, scope: 'libero' }); } },
    ];
    return (
      <ModalShell onClose={closeModal} sheet>
        <SheetHandle/>
        <div style={{ padding: '8px 0 32px' }}>
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: ST.TEXT }}>Tavolo {t.n}</div>
            <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 2 }}>Azioni rapide</div>
          </div>
          {items.map((it, i) => (
            <div key={i} onClick={it.a} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
              borderTop: `1px solid ${ST.BORDER_SOFT}`, cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: ST.R_MD, flexShrink: 0,
                background: it.danger ? ST.RED_SOFT : ST.SURF_ALT,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{it.i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: it.danger ? ST.RED : ST.TEXT }}>{it.l}</div>
                <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>{it.d}</div>
              </div>
              <I.ChevRight s={14} c={ST.MUTED}/>
            </div>
          ))}
        </div>
      </ModalShell>
    );
  }

  // ─── Scelta sala ────────────────────────────────────────────
  if (modal.kind === 'scelta-sala') {
    return (
      <ModalShell onClose={closeModal} sheet>
        <SheetHandle/>
        <div style={{ padding: '8px 0 32px' }}>
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: ST.TEXT }}>Cambia sala</div>
            <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 2 }}>Seleziona la sala da gestire</div>
          </div>
          {modal.sale.map((s) => {
            const sel = s.id === modal.salaCorrente.id;
            return (
              <div key={s.id} onClick={() => { modal.onCambia(s); closeModal(); }} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
                borderTop: `1px solid ${ST.BORDER_SOFT}`, cursor: 'pointer',
                background: sel ? ST.PINK_SOFT : '#fff',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: ST.R_MD, flexShrink: 0,
                  background: sel ? ST.PINK_DARK : ST.SURF_ALT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <I.Tables s={18} c={sel ? '#fff' : ST.MUTED}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: sel ? ST.PINK_DARK : ST.TEXT }}>{s.nome}</div>
                  <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>{s.desc}</div>
                </div>
                {sel && <I.Check s={18} c={ST.PINK_DARK}/>}
              </div>
            );
          })}
        </div>
      </ModalShell>
    );
  }

  // ─── Conferma: rimuovi prenotazione (cancellazione o no-show) ───
  if (modal.kind === 'conferma-cancella-prenotazione') {
    const t = modal.tavolo || {};
    return (
      <ModalShell onClose={closeModal}>
        <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: ST.RED_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I.Alert s={28} c={ST.RED}/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT }}>Cancellare la prenotazione?</div>
          <div style={{ fontSize: 13.5, color: ST.MUTED, marginTop: 8, lineHeight: 1.5 }}>
            La prenotazione di <strong style={{ color: ST.TEXT }}>{t.prenotazione?.nome}</strong> per il Tavolo {t.n} verrà annullata e il tavolo tornerà libero.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <Btn variant="secondary" full onClick={closeModal}>Annulla</Btn>
            <Btn variant="danger" full onClick={() => {
              // Stesso gesto per il cameriere; il gestionale classifica da sé:
              // oltre la tolleranza è un no-show, prima è una cancellazione.
              (modal.noShow ? TavoliStore.noShow : TavoliStore.cancellaPrenotazione)(t.id);
              closeModal();
              openModal({ kind: 'success', text: `Prenotazione rimossa · Tavolo ${t.n} libero` });
            }}>Sì, cancella</Btn>
          </div>
        </div>
      </ModalShell>
    );
  }

  // ─── Conferma: libera tavolo (chiusura forzata prima del saldo) ─
  if (modal.kind === 'conferma-libera') {
    const t = modal.tavolo || {};
    // Tavolo SALDATO (conto a zero, già pagato) → liberare è una mossa di routine
    // di fine pasto: copy calmo e neutro. Tavolo NON saldato → si chiude SENZA
    // incassare: copy d'allarme (rosso) che lo dice chiaro.
    const saldato = !(t.saldo > 0);
    return (
      <ModalShell onClose={closeModal}>
        <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: saldato ? ST.GREEN_SOFT : ST.RED_SOFT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {saldato ? <I.Refresh s={28} c={ST.GREEN}/> : <I.Alert s={28} c={ST.RED}/>}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT }}>
            {saldato ? 'Liberare il tavolo?' : 'Forzare la chiusura?'}
          </div>
          <div style={{ fontSize: 13.5, color: ST.MUTED, marginTop: 8, lineHeight: 1.5 }}>
            {saldato
              ? <>Il Tavolo {t.n} è saldato. Vuoi liberarlo? Passerà nello stato “Da pulire”.</>
              : <>Il Tavolo {t.n} non è ancora stato saldato. Vuoi davvero chiuderlo senza pagamento? Passerà nello stato “Da pulire”.</>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <Btn variant="secondary" full onClick={closeModal}>Annulla</Btn>
            <Btn variant={saldato ? 'primary' : 'danger'} full onClick={() => {
              TavoliStore.liberaTavolo(t.id);
              closeModal();
              nav.reset({ s: 'sala' });
              openModal({ kind: 'success', text: `Tavolo ${t.n} ${saldato ? 'liberato' : 'chiuso'} · ora è Da pulire` });
            }}>{saldato ? 'Sì, libera' : 'Sì, chiudi'}</Btn>
          </div>
        </div>
      </ModalShell>
    );
  }

  // ─── Conferma: unione a un gruppo OCCUPATO (clienti seduti) ────
  if (modal.kind === 'conferma-unione') {
    const t = modal.tavolo || {};
    const numeri = modal.numeri || [];
    const occupati = numeri.filter(k => TavoliStore.getAttivi().some(a => String(a.n) === k));
    return (
      <ModalShell onClose={closeModal}>
        <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: ST.AMBER_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I.Alert s={28} c={ST.AMBER}/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT }}>Unire a un tavolo in servizio?</div>
          <div style={{ fontSize: 13.5, color: ST.MUTED, marginTop: 8, lineHeight: 1.5 }}>
            Stai aggiungendo il Tavolo {t.n} a {occupati.length > 1 ? 'gruppi occupati' : `un gruppo occupato (${occupati.join(', ')})`}.
            I clienti già seduti restano e il conto diventerà unico.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <Btn variant="secondary" full onClick={closeModal}>Annulla</Btn>
            <Btn variant="primary" full onClick={() => {
              TavoliStore.unisci(t.id, numeri);
              closeModal();
              openModal({ kind: 'success', text: `${numeri.length + 1} tavoli uniti` });
            }}>Sì, unisci</Btn>
          </div>
        </div>
      </ModalShell>
    );
  }

  // ─── Modifica tavolo (unificato: coperti + unisci + disgiungi) ─
  if (modal.kind === 'modifica-tavolo') {
    return <ModificaTavoloUnifModal modal={modal} closeModal={closeModal} openModal={openModal}/>;
  }

  // ─── Piatto custom ──────────────────────────────────────────
  if (modal.kind === 'piatto-custom') {
    const [nome, setNome] = useStateMo('');
    const [prezzo, setPrezzo] = useStateMo('');
    const [note, setNote] = useStateMo('');
    return (
      <ModalShell onClose={closeModal} sheet>
        <SheetHandle/>
        <div style={{ padding: '8px 24px 32px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>Antipasti</div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4, marginBottom: 16 }}>Piatto personalizzato</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Nome piatto" value={nome} onChange={setNome} placeholder="Inserisci nome"/>
            <Input label="Prezzo" value={prezzo} onChange={setPrezzo} placeholder="0.00 €"/>
            <Input label="Note per la cucina" value={note} onChange={setNote} placeholder="Scrivi note per la cucina…" multiline/>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" full onClick={closeModal}>Annulla</Btn>
            <Btn variant="primary" full onClick={() => { closeModal(); openModal({ kind: 'success', text: 'Piatto custom aggiunto' }); }}>Aggiungi</Btn>
          </div>
        </div>
      </ModalShell>
    );
  }

  // ─── Send success ───────────────────────────────────────────
  if (modal.kind === 'send-success') {
    useEffectMo(() => {
      const t = setTimeout(() => { closeModal(); nav.reset({ s: 'sala' }); }, 1600);
      return () => clearTimeout(t);
    }, []);
    return (
      <ModalShell onClose={() => {}}>
        <div style={{ padding: '32px 32px 28px', textAlign: 'center' }}>
          <CircleCheck/>
          <div style={{ fontSize: 16, fontWeight: 800, color: ST.TEXT, marginTop: 16 }}>Operazione completata</div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 6 }}>L'ordine è stato inviato alla cucina</div>
        </div>
      </ModalShell>
    );
  }

  // ─── Generic success ────────────────────────────────────────
  if (modal.kind === 'success') {
    useEffectMo(() => {
      const t = setTimeout(closeModal, 1500);
      return () => clearTimeout(t);
    }, []);
    return (
      <ModalShell onClose={() => {}}>
        <div style={{ padding: '32px 32px 28px', textAlign: 'center' }}>
          <CircleCheck/>
          <div style={{ fontSize: 16, fontWeight: 800, color: ST.TEXT, marginTop: 16 }}>Operazione completata</div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 6 }}>{modal.text || 'Tutto ok'}</div>
        </div>
      </ModalShell>
    );
  }

  // ─── Generic error ──────────────────────────────────────────
  if (modal.kind === 'error') {
    return (
      <ModalShell onClose={closeModal}>
        <div style={{ padding: '32px 32px 24px', textAlign: 'center' }}>
          <CircleError/>
          <div style={{ fontSize: 16, fontWeight: 800, color: ST.TEXT, marginTop: 16 }}>Errore</div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 6, lineHeight: 1.5 }}>{modal.text || 'Riprova'}</div>
          <Btn variant="primary" full onClick={closeModal} style={{ marginTop: 20 }}>Riprova</Btn>
        </div>
      </ModalShell>
    );
  }

  // ─── Notifiche drawer ───────────────────────────────────────
  // ─── Modifica prenotazione ──────────────────────────────────
  if (modal.kind === 'modifica-prenotazione') {
    const DEFAULT_TAGS = ['Anniversario', 'Azienda', 'Compleanno'];
    const [nome, setNome] = useStateMo(modal.tavolo?.prenotazione?.nome || '');
    const [tel, setTel] = useStateMo(modal.tavolo?.prenotazione?.tel || '');
    const [tags, setTags] = useStateMo(modal.tavolo?.prenotazione?.tags || []);
    const [allergeni, setAllergeni] = useStateMo(modal.tavolo?.prenotazione?.allergeni || []);
    const [note, setNote] = useStateMo(modal.tavolo?.prenotazione?.note || '');
    const [newTag, setNewTag] = useStateMo('');

    const toggleTag = (tag) =>
      setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    const toggleAllergene = (id) =>
      setAllergeni(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    const addCustom = () => {
      const t = newTag.trim();
      if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
      setNewTag('');
    };
    const customTags = tags.filter(t => !DEFAULT_TAGS.includes(t));

    return (
      <ModalShell onClose={closeModal} sheet>
        <SheetHandle/>
        <div style={{ padding: '8px 24px 32px' }}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>Modifica prenotazione</div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 4, marginBottom: 20 }}>
            Tavolo {modal.tavolo?.n} · {modal.tavolo?.prenotazione?.nome}
          </div>
          <Input label="Nome cliente" value={nome} onChange={setNome}/>
          <Input label="Telefono" value={tel} onChange={setTel} placeholder="+39 …" style={{ marginTop: 12 }}/>

          {/* Tag */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Tag evento</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DEFAULT_TAGS.map(tag => {
                const sel = tags.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)} style={{
                    height: 32, padding: '0 14px', borderRadius: ST.R_PILL,
                    border: `1.5px solid ${sel ? ST.PURPLE : ST.BORDER}`,
                    background: sel ? ST.PURPLE_SOFT : '#fff',
                    color: sel ? statoConfig('prenotato').color : ST.TEXT,
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                  }}>{tag}</button>
                );
              })}
              {customTags.map(tag => (
                <button key={tag} onClick={() => setTags(prev => prev.filter(t => t !== tag))} style={{
                  height: 32, padding: '0 12px', borderRadius: ST.R_PILL,
                  border: `1.5px solid ${ST.PURPLE}`, background: ST.PURPLE_SOFT, color: statoConfig('prenotato').color,
                  fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  {tag} <span style={{ fontSize: 10, opacity: 0.7 }}>✕</span>
                </button>
              ))}
            </div>
            {/* Tag custom */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                placeholder="Tag personalizzato…"
                style={{
                  flex: 1, height: 36, padding: '0 12px', borderRadius: ST.R_PILL,
                  border: `1.5px solid ${ST.BORDER}`, outline: 'none',
                  fontSize: 13, fontFamily: 'inherit', color: ST.TEXT, background: '#fff',
                }}
              />
              <button onClick={addCustom} disabled={!newTag.trim()} style={{
                height: 36, padding: '0 14px', borderRadius: ST.R_PILL, border: 'none',
                background: newTag.trim() ? ST.PURPLE : ST.MUTED_3, color: '#fff',
                fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                cursor: newTag.trim() ? 'pointer' : 'default',
              }}>Aggiungi</button>
            </div>
          </div>

          {/* Allergeni */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Allergeni</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(ALLERGENI).map(([id, a]) => {
                const sel = allergeni.includes(id);
                return (
                  <button key={id} onClick={() => toggleAllergene(id)} style={{
                    height: 34, padding: '0 12px', borderRadius: ST.R_PILL,
                    border: `1.5px solid ${sel ? a.color : ST.BORDER}`,
                    background: sel ? a.bg : '#fff',
                    color: sel ? a.color : ST.TEXT,
                    fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    transition: 'all 120ms',
                  }}>
                    <span style={{ fontSize: 14 }}>{a.icon}</span> {a.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Note</div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Richieste speciali, note per il personale…"
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: ST.R_MD,
                border: `1.5px solid ${ST.BORDER}`, outline: 'none',
                fontSize: 13.5, fontFamily: 'inherit', color: ST.TEXT,
                resize: 'none', boxSizing: 'border-box', lineHeight: 1.5,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <Btn variant="danger" full onClick={() => { closeModal(); openModal({ kind: 'success', text: 'Prenotazione cancellata' }); }}>Cancella</Btn>
            <Btn variant="primary" full onClick={() => { closeModal(); openModal({ kind: 'success', text: 'Prenotazione aggiornata' }); }}>Salva</Btn>
          </div>
        </div>
      </ModalShell>
    );
  }

  // ─── Cart detail (review carrello) ──────────────────────────
  if (modal.kind === 'cart-detail') {
    return (
      <ModalShell onClose={closeModal} sheet>
        <SheetHandle/>
        <div style={{ padding: '8px 24px 32px' }}>
          <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Riepilogo ordine</div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginBottom: 16 }}>{modal.cart.length} articol{modal.cart.length === 1 ? 'o' : 'i'}</div>
          {modal.cart.map((c, i) => {
            // Personalizzazione agganciata alla riga: cottura, aggiunte (nome dal
            // catalogo), note. Quantità e prezzo unitario sono editabili qui: lo
            // stepper toglie/aggiunge singole unità, il cestino rimuove la riga.
            const piatto = PIATTI.find(p => p.id === c.piattoId);
            const dettagli = [];
            if (c.cottura) dettagli.push(c.cottura);
            (c.extras || []).forEach(([eid, cnt]) => {
              const ex = piatto?.extras?.find(e => e.id === eid);
              if (ex) dettagli.push(`${cnt > 1 ? cnt + '× ' : ''}${ex.nome}`);
            });
            if (c.note) dettagli.push(`“${c.note}”`);
            const setQty = (q) => modal.setCart(modal.cart.map((x, j) => j === i ? { ...x, qty: Math.max(1, q) } : x));
            const setPrezzo = (v) => modal.setCart(modal.cart.map((x, j) => j === i ? { ...x, prezzo: v } : x));
            return (
              <div key={i} style={{ padding: '10px 0', borderTop: `1px solid ${ST.BORDER_SOFT}` }}>
                {/* Riga 1: nome + dettagli + subtotale + cestino */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.nome}</div>
                    {dettagli.length > 0 && (
                      <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2, lineHeight: 1.4 }}>{dettagli.join(' · ')}</div>
                    )}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, paddingTop: 1 }}>€{(c.prezzo * c.qty).toFixed(2)}</span>
                  <button onClick={() => modal.setCart(modal.cart.filter((_, j) => j !== i))} style={{
                    width: 28, height: 28, borderRadius: ST.R_PILL, border: 'none', background: 'transparent', cursor: 'pointer',
                  }}><I.Trash s={14}/></button>
                </div>
                {/* Riga 2: quantità (stepper) + prezzo unitario editabile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <Stepper value={c.qty} onChange={setQty}/>
                  <PrezzoInput value={c.prezzo} onChange={setPrezzo}/>
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" full onClick={closeModal}>Chiudi</Btn>
            <Btn variant="primary" full onClick={() => openModal({ kind: 'send-success', tavoloId: modal.tavoloId })}>Crea ordine</Btn>
          </div>
        </div>
      </ModalShell>
    );
  }

  return null;
}

// ─── Helpers ────────────────────────────────────────────────
function SheetHandle() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: ST.MUTED_3 }}/>
    </div>
  );
}

function CircleCheck() {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: ST.R_PILL,
      background: ST.GREEN,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      animation: 'popIn 220ms ease-out',
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 12 10 18 20 6"/>
      </svg>
    </div>
  );
}

function CircleError() {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: ST.R_PILL,
      background: ST.RED,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      animation: 'popIn 220ms ease-out',
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, multiline, style }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{
          width: '100%', padding: 12, borderRadius: ST.R_MD,
          border: `1.5px solid ${ST.BORDER}`, background: ST.SURF,
          fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none',
        }}/>
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
          width: '100%', height: 44, padding: '0 14px', borderRadius: ST.R_MD,
          border: `1.5px solid ${ST.BORDER}`, background: ST.SURF,
          fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
        }}/>
      )}
    </div>
  );
}

// ─── Modifica tavolo UNIFICATO ──────────────────────────────
function ModificaTavoloUnifModal({ modal, closeModal, openModal }) {
  const tavolo = modal.tavolo || {};
  // Dai Liberi i coperti si modificano già inline sulla card: qui la modale
  // serve solo a unire/disgiungere, quindi il tab "Coperti" viene nascosto.
  const isLibero = modal.scope === 'libero';
  // Determina se è un tavolo "composto" (es. 25+32) leggendo il numero
  const isComposto = String(tavolo.n || '').includes('+');
  const partiTavolo = isComposto
    ? String(tavolo.n).split('+').map(s => s.trim())
    : [String(tavolo.n)];

  // `only`: apre direttamente un singolo pannello (es. 'sposta'), senza il
  // segmented control. Usato dal dettaglio tavolo, dove le azioni stanno in chiaro.
  const only = modal.only || null;
  const [tab, setTab] = useStateMo(only || (isComposto ? 'disgiungi' : isLibero ? 'unisci' : 'coperti'));
  const [coperti, setCoperti] = useStateMo(tavolo.coperti || 4);
  const [unisciSel, setUnisciSel] = useStateMo({});
  const [qUnisci, setQUnisci] = useStateMo('');
  const [spostaSel, setSpostaSel] = useStateMo({}); // tavoli destinazione (multi-selezione)
  const [qSposta, setQSposta] = useStateMo('');
  const [disgiuntiSel, setDisgiuntiSel] = useStateMo(
    Object.fromEntries(partiTavolo.map(p => [p, false]))
  );

  const tabs = [
    !isLibero && { id: 'coperti', label: 'Coperti', icon: <I.Users s={14}/> },
    !isLibero && { id: 'sposta', label: 'Sposta', icon: <I.Walk s={14}/> },
    { id: 'unisci', label: 'Unisci', icon: <I.Merge s={14}/> },
    isComposto && { id: 'disgiungi', label: 'Dividi', icon: <I.Split s={14}/> },
  ].filter(Boolean);

  // Tavoli liberi da unire
  const tavoliLiberi = [27, 28, 29, 32, 33, 34, 35, 36, 38, 39]
    .filter(n => !TAVOLI.some(x => String(x.n) === String(n)) && !partiTavolo.includes(String(n)));
  // Prenotazioni in arrivo su tavoli ora liberi (mock): per lo spostamento conta
  // sapere se un tavolo è "impegnato più tardi", non che sia libero adesso.
  const PRENOT_LIBERI = { 29: '45\'', 36: '1h 20\'', 38: '2h' };
  // Posti (capienza) dei tavoli del picker — mostrati su Unisci e Sposta per
  // scegliere in base allo spazio. Default 2 se non mappato.
  const POSTI_LIBERI = { 27: 2, 28: 2, 29: 4, 32: 6, 33: 2, 34: 4, 35: 4, 36: 2, 38: 6, 39: 4 };
  const postiOf = (n) => POSTI_LIBERI[n] || 2;
  const tavoliLiberiFiltrati = tavoliLiberi.filter(n => String(n).includes(qUnisci.trim()));

  // Gruppi LIBERI già uniti (es. 33+34 libero): sono comunque tavoli liberi, quindi
  // NON una sezione a parte — entrano fra i "Tavoli liberi", solo composti.
  const gruppiLiberi = TavoliStore.getLiberi()
    .filter(g => String(g.n).includes('+') && g.stato === 'libero' && String(g.n) !== String(tavolo.n))
    .filter(g => String(g.n).includes(qUnisci.trim()));
  // Tavoli OCCUPATI (in servizio), TUTTI — singoli e gruppi: caso speciale →
  // sezione a parte, e unirvisi chiede conferma (clienti seduti, conto unico).
  const tavoliOccupati = TavoliStore.getAttivi()
    .filter(g => String(g.n) !== String(tavolo.n))
    .filter(g => String(g.n).includes(qUnisci.trim()));

  const unisciCount = Object.values(unisciSel).filter(Boolean).length;
  const disgiuntiCount = Object.values(disgiuntiSel).filter(Boolean).length;
  const spostaNumeri = Object.entries(spostaSel).filter(([_, v]) => v).map(([k]) => k);
  const spostaCount = spostaNumeri.length;

  // Card candidato UNICA, condivisa da Unisci e Sposta: stesso look ovunque.
  // count + icona (🪑 posti per i liberi, 👥 coperti per gli occupati) e, se il
  // tavolo è impegnato a breve, la riga "prenot. tra X".
  const pickCell = ({ k, label, count, coperti = false, pren, sel, onClick }) => (
    <div key={k} onClick={onClick} style={{
      padding:'12px 8px', borderRadius: ST.R_MD,
      border: `1.5px solid ${sel ? ST.PINK_DARK : pren ? 'rgba(124, 58, 237, 0.38)' : ST.BORDER}`,
      background: sel ? ST.PINK_SOFT : '#fff',
      cursor:'pointer', textAlign:'center', position:'relative',
    }}>
      {sel && (
        <span style={{position:'absolute', top:6, right:6, width:18, height:18, borderRadius: ST.R_PILL, background: ST.PINK_DARK, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <I.Check s={10} c="#fff"/>
        </span>
      )}
      <div style={{fontSize:14, fontWeight:700, color: sel ? ST.PINK_DARK : ST.TEXT}}>{label}</div>
      <div style={{fontSize:10.5, color:ST.MUTED, marginTop:3, display:'inline-flex', alignItems:'center', gap:3}}>
        {coperti ? <I.Users s={11} c={ST.MUTED}/> : <I.Chair s={11} c={ST.MUTED}/>}{count}
      </div>
      {pren && <div style={{fontSize:10, color: statoConfig('prenotato').color, fontWeight:700, marginTop:2}}>prenot. tra {pren}</div>}
    </div>
  );

  return (
    <ModalShell onClose={closeModal} sheet>
      <SheetHandle/>
      <div style={{ padding: '8px 0 24px' }}>
        <div style={{ padding: '0 20px 8px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {isComposto ? `Tavolo ${tavolo.n}` : `Tavolo ${tavolo.n}`}
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2 }}>
            {only === 'sposta' ? (isLibero ? 'Sposta prenotazione' : 'Sposta tavolo')
              : only === 'unisci' ? 'Unisci tavolo'
              : only === 'disgiungi' ? 'Dividi tavolo'
              : 'Modifica tavolo'}
          </div>
          {!only && (
            <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 4, lineHeight: 1.45 }}>
              {isComposto
                ? `Tavolo composto da ${partiTavolo.length} tavoli. Puoi ${isLibero ? '' : 'cambiare i coperti, '}unirne altri o dividere.`
                : isLibero
                  ? 'Unisci questo tavolo ad altri per accogliere un gruppo più grande.'
                  : 'Cambia i coperti oppure unisci a un altro tavolo.'}
            </div>
          )}
        </div>

        {/* Segmented control — nascosto quando si apre un singolo pannello (only) */}
        {!only && (
          <div style={{
            margin: '12px 20px 16px',
            display:'flex', background: ST.SURF_ALT,
            borderRadius: ST.R_PILL, padding: 3,
          }}>
            {tabs.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                flex:1, height: 36, border:'none',
                background: tab === t.id ? '#fff' : 'transparent',
                borderRadius: ST.R_PILL,
                boxShadow: tab === t.id ? ST.SH_SM : 'none',
                fontSize:12.5, fontWeight: tab === t.id ? 700 : 600,
                color: tab === t.id ? ST.TEXT : ST.MUTED,
                cursor:'pointer', fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
              }}>{t.icon} {t.label}</button>
            ))}
          </div>
        )}
        {only && <div style={{ height: 8 }}/>}

        {/* COPERTI */}
        {tab === 'coperti' && (
          <div style={{padding:'0 20px'}}>
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:16, background: ST.SURF_ALT, borderRadius: ST.R_MD, marginBottom:14,
            }}>
              <div>
                <div style={{fontSize:14, fontWeight:700}}>Numero coperti</div>
                <div style={{fontSize:11.5, color: ST.MUTED, marginTop:2}}>Attuali: {tavolo.coperti}</div>
              </div>
              <Stepper value={coperti} onChange={setCoperti}/>
            </div>
            <Btn variant="primary" full disabled={coperti === tavolo.coperti}
              onClick={()=>{ TavoliStore.setCoperti(tavolo.id, coperti); closeModal(); openModal({kind:'success', text:`Coperti aggiornati a ${coperti}`}); }}
            >Salva coperti</Btn>
          </div>
        )}

        {/* SPOSTA — porta clienti/prenotazione su uno o PIÙ tavoli liberi (multi-selezione) */}
        {tab === 'sposta' && (
          <div style={{padding:'0 20px'}}>
            {/* Search bar: cerca un tavolo per numero */}
            <div style={{
              display:'flex', alignItems:'center', gap:8, height:42, padding:'0 14px',
              background: ST.SURF_ALT, borderRadius: ST.R_PILL, marginBottom:12,
            }}>
              <I.Search s={16} c={ST.MUTED}/>
              <input value={qSposta} onChange={e=>setQSposta(e.target.value)} autoFocus
                placeholder="Cerca tavolo per numero…"
                style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:14, fontFamily:'inherit', color: ST.TEXT }}/>
              {qSposta && (
                <button onClick={()=>setQSposta('')} style={{
                  width:24, height:24, borderRadius: ST.R_PILL, border:'none',
                  background:'rgba(0,0,0,0.08)', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}><I.Close s={12}/></button>
              )}
            </div>
            <div style={{fontSize:10.5, fontWeight:700, color:ST.MUTED, letterSpacing:0.5, textTransform:'uppercase', marginBottom:8}}>
              Tavoli liberi
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16}}>
              {tavoliLiberi.filter(n => String(n).includes(qSposta.trim())).map(n => pickCell({
                k: n, label: `T ${n}`, count: postiOf(n), pren: PRENOT_LIBERI[n],
                sel: !!spostaSel[n], onClick: () => setSpostaSel({...spostaSel, [n]: !spostaSel[n]}),
              }))}
            </div>
            {tavoliLiberi.filter(n => String(n).includes(qSposta.trim())).length === 0 && (
              <div style={{ textAlign:'center', padding:'8px 0 16px', color: ST.MUTED, fontSize:13 }}>
                Nessun tavolo libero per “{qSposta}”.
              </div>
            )}
            {/* Più tavoli selezionati → la destinazione è il gruppo unito (es. 29+36). */}
            {spostaCount > 1 && (
              <div style={{
                padding:'10px 14px', background: ST.PINK_BG, borderRadius: ST.R_MD,
                marginBottom:14, fontSize:12.5, color: ST.PINK_DARK, fontWeight:600,
                display:'flex', alignItems:'center', gap:8,
              }}>
                <I.Joined s={15} c={ST.PINK_DARK}/>
                Destinazione · tavolo unito {spostaNumeri.join('+')}
              </div>
            )}
            <Btn variant="primary" full disabled={spostaCount === 0}
              onClick={()=>{
                const dest = spostaNumeri.join('+');
                TavoliStore.spostaTavolo(tavolo.id, dest);
                closeModal(); openModal({kind:'success', text: isLibero ? `Prenotazione spostata al Tavolo ${dest}` : `Clienti spostati al Tavolo ${dest}`});
              }}
            >{spostaCount === 0 ? 'Seleziona un tavolo' : spostaCount === 1 ? `Sposta al Tavolo ${spostaNumeri[0]}` : `Sposta su ${spostaCount} tavoli`}</Btn>
          </div>
        )}

        {/* UNISCI */}
        {tab === 'unisci' && (
          <div style={{padding:'0 20px'}}>
            {/* Search bar: cerca un tavolo per numero */}
            <div style={{
              display:'flex', alignItems:'center', gap:8, height:42, padding:'0 14px',
              background: ST.SURF_ALT, borderRadius: ST.R_PILL, marginBottom:12,
            }}>
              <I.Search s={16} c={ST.MUTED}/>
              <input value={qUnisci} onChange={e=>setQUnisci(e.target.value)} autoFocus
                placeholder="Cerca tavolo per numero…"
                style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:14, fontFamily:'inherit', color: ST.TEXT }}/>
              {qUnisci && (
                <button onClick={()=>setQUnisci('')} style={{
                  width:24, height:24, borderRadius: ST.R_PILL, border:'none',
                  background:'rgba(0,0,0,0.08)', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}><I.Close s={12}/></button>
              )}
            </div>
            <div style={{fontSize:10.5, fontWeight:700, color:ST.MUTED, letterSpacing:0.5, textTransform:'uppercase', marginBottom:8}}>
              Tavoli liberi
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16}}>
              {/* Singoli liberi + gruppi liberi (es. 33+34): sono comunque liberi → stessa
                  griglia. Niente etichetta "libero" (lo dice la sezione): solo "T n", e
                  🪑 posti per i gruppi o "prenot. tra X" se il tavolo è impegnato a breve. */}
              {[
                ...tavoliLiberiFiltrati.map(n => ({ key:String(n), num:n, posti: postiOf(n), pren: PRENOT_LIBERI[n] })),
                ...gruppiLiberi.map(g => ({ key:String(g.n), num:g.n, posti:g.coperti })),
              ].map(c => pickCell({
                k: c.key, label: `T ${c.num}`, count: c.posti, pren: c.pren,
                sel: !!unisciSel[c.key], onClick: () => setUnisciSel({...unisciSel, [c.key]: !unisciSel[c.key]}),
              }))}
            </div>
            {tavoliLiberiFiltrati.length === 0 && gruppiLiberi.length === 0 && (
              <div style={{ textAlign:'center', padding:'8px 0 16px', color: ST.MUTED, fontSize:13 }}>
                Nessun tavolo libero per “{qUnisci}”.
              </div>
            )}
            {/* Tavoli OCCUPATI (tutti, singoli e gruppi): caso speciale (clienti seduti)
                → sezione a parte; unirsi qui chiede conferma. "In servizio" lo dice la
                sezione: nelle card solo "T n" e 👥 coperti. */}
            {tavoliOccupati.length > 0 && (
              <>
                <div style={{fontSize:10.5, fontWeight:700, color:ST.MUTED, letterSpacing:0.5, textTransform:'uppercase', marginBottom:8}}>
                  Tavoli occupati
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16}}>
                  {tavoliOccupati.map(g => pickCell({
                    k: g.id, label: `T ${g.n}`, count: g.coperti, coperti: true,
                    sel: !!unisciSel[String(g.n)], onClick: () => setUnisciSel({...unisciSel, [String(g.n)]: !unisciSel[String(g.n)]}),
                  }))}
                </div>
              </>
            )}
            {unisciCount > 0 && (
              <div style={{
                padding:'10px 14px', background: ST.PINK_BG, borderRadius: ST.R_MD,
                marginBottom:14, fontSize:12.5, color: ST.PINK_DARK, fontWeight:600,
                display:'flex', alignItems:'center', gap:8,
              }}>
                <I.Joined s={15} c={ST.PINK_DARK}/>
                Tavolo unito · {tavolo.n}+{Object.entries(unisciSel).filter(([_,v])=>v).map(([k])=>k).join('+')}
              </div>
            )}
            <Btn variant="primary" full disabled={unisciCount === 0}
              onClick={()=>{
                const numeri = Object.entries(unisciSel).filter(([_,v])=>v).map(([k])=>k);
                // Unirsi a un gruppo OCCUPATO tocca un tavolo in servizio → conferma.
                const conOccupati = numeri.some(k => TavoliStore.getAttivi().some(a => String(a.n) === k));
                if (conOccupati) { openModal({ kind:'conferma-unione', tavolo, numeri }); return; }
                TavoliStore.unisci(tavolo.id, numeri);
                closeModal(); openModal({kind:'success', text:`${unisciCount + 1} tavoli uniti`});
              }}
            >{unisciCount === 0 ? 'Seleziona almeno un tavolo' : `Unisci ${unisciCount + 1} tavoli`}</Btn>
          </div>
        )}

        {/* DISGIUNGI */}
        {tab === 'disgiungi' && (
          <div style={{padding:'0 20px'}}>
            <div style={{fontSize:12.5, color:ST.MUTED, marginBottom:14, lineHeight:1.45}}>
              Seleziona i tavoli da separare dal gruppo. I tavoli rimanenti continueranno ad operare insieme.
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:16}}>
              {partiTavolo.map((p, i) => {
                // Su un gruppo ATTIVO il primo tavolo è il base: porta la comanda
                // e l'id del gruppo, quindi non è staccabile. Sui liberi tutto è
                // separabile (il gruppo si ri-ancora, vedi TavoliStore.dividi).
                const lockBase = i === 0 && !isLibero;
                const sel = !!disgiuntiSel[p];
                return (
                <div key={p} onClick={lockBase ? undefined : ()=>setDisgiuntiSel({...disgiuntiSel, [p]: !disgiuntiSel[p]})} style={{
                  padding:'14px 16px', borderRadius: ST.R_MD,
                  border:`1.5px solid ${sel ? ST.PINK_DARK : ST.BORDER}`,
                  background: lockBase ? ST.SURF : sel ? ST.PINK_SOFT : '#fff',
                  cursor: lockBase ? 'default' : 'pointer',
                  opacity: lockBase ? 0.6 : 1,
                  display:'flex', alignItems:'center', gap:12,
                }}>
                  <span style={{
                    width:22, height:22, borderRadius:6,
                    border:`2px solid ${sel ? ST.PINK_DARK : ST.MUTED_3}`,
                    background: sel ? ST.PINK_DARK : '#fff',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>{sel && <I.Check s={12} c="#fff"/>}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14, fontWeight:700, color: sel ? ST.PINK_DARK : ST.TEXT}}>Tavolo {p}</div>
                    <div style={{fontSize:11.5, color: ST.MUTED, marginTop:2}}>{lockBase ? 'Tavolo base · porta il conto, resta nel gruppo' : sel ? 'Diventerà un tavolo separato' : 'Resta nel gruppo'}</div>
                  </div>
                </div>
                );
              })}
            </div>
            <Btn variant="primary" full disabled={disgiuntiCount === 0 || disgiuntiCount === partiTavolo.length}
              onClick={()=>{
                TavoliStore.dividi(tavolo.id, Object.entries(disgiuntiSel).filter(([_,v])=>v).map(([k])=>k));
                closeModal(); openModal({kind:'success', text:`Tavolo diviso in ${disgiuntiCount + 1} parti`});
              }}
            >{disgiuntiCount === 0 ? 'Seleziona almeno un tavolo' : `Dividi ${disgiuntiCount} tavol${disgiuntiCount > 1 ? 'i' : 'o'}`}</Btn>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

Object.assign(window, { StaffModals, ModalShell });
