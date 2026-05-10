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

  // ─── Walk-in ────────────────────────────────────────────────
  if (modal.kind === 'walk-in') {
    const [n, setN] = useStateMo(2);
    return (
      <ModalShell onClose={closeModal} sheet>
        <SheetHandle/>
        <div style={{ padding: '8px 24px 32px' }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: ST.TEXT, marginBottom: 4 }}>Walk-in</div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginBottom: 20 }}>
            Cliente senza prenotazione. Indica il numero di coperti.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: ST.SURF_ALT, borderRadius: ST.R_MD, marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Coperti</span>
            <Stepper value={n} onChange={setN}/>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
            Tavolo suggerito
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
            {[30, 31, 32, 35, 38].map(t => (
              <button key={t} style={{
                height: 38, padding: '0 14px', borderRadius: ST.R_PILL,
                border: `1.5px solid ${ST.BORDER}`, background: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>Tavolo {t}</button>
            ))}
          </div>
          <Btn variant="primary" full onClick={() => { closeModal(); openModal({ kind: 'success', text: `Walk-in aperto · ${n} coperti` }); }}>Apri tavolo</Btn>
        </div>
      </ModalShell>
    );
  }

  // ─── Tavolo actions menu ────────────────────────────────────
  if (modal.kind === 'tavolo-actions') {
    const items = [
      { i: <I.Edit s={18}/>, l: 'Modifica coperti', d: 'Cambia il numero di persone' },
      { i: <I.Merge s={18}/>, l: 'Unisci tavoli', d: 'Combina con altri tavoli', a: () => { closeModal(); openModal({ kind: 'modifica-tavoli', mode: 'unisci', tavolo: modal.tavolo }); } },
      { i: <I.Split s={18}/>, l: 'Dividi tavolo', d: 'Separa in più tavoli', a: () => { closeModal(); openModal({ kind: 'modifica-tavoli', mode: 'dividi', tavolo: modal.tavolo }); } },
      { i: <I.Note s={18}/>, l: 'Aggiungi nota', d: 'Allergia, occasione, ecc.' },
      { i: <I.User s={18}/>, l: 'Cambia cameriere', d: 'Riassegna a un collega' },
      { i: <I.Close s={18} c="#DC2626"/>, l: 'Libera tavolo', d: 'Chiudi senza pagamento', danger: true },
    ];
    return (
      <ModalShell onClose={closeModal} sheet>
        <SheetHandle/>
        <div style={{ padding: '8px 0 32px' }}>
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: ST.TEXT }}>Tavolo {modal.tavolo?.n}</div>
            <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 2 }}>Azioni rapide</div>
          </div>
          {items.map((it, i) => (
            <div key={i} onClick={it.a} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
              borderTop: `1px solid ${ST.BORDER_SOFT}`,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: ST.R_MD,
                background: it.danger ? '#FEE2E2' : ST.SURF_ALT,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{it.i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: it.danger ? '#DC2626' : ST.TEXT }}>{it.l}</div>
                <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>{it.d}</div>
              </div>
              <I.ChevRight s={14} c={ST.MUTED}/>
            </div>
          ))}
        </div>
      </ModalShell>
    );
  }

  // ─── Modifica tavoli (unisci/dividi) ────────────────────────
  if (modal.kind === 'modifica-tavoli') {
    return <ModificaTavoliModal modal={modal} closeModal={closeModal} openModal={openModal}/>;
  }

  // ─── Filtri menu ────────────────────────────────────────────
  if (modal.kind === 'filtri') {
    return <FiltriModal modal={modal} closeModal={closeModal} openModal={openModal}/>;
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
  if (modal.kind === 'notifiche') {
    const notifs = [
      { i: '🔔', t: 'Tavolo 23 · 2 piatti pronti', d: 'Da consegnare', minFa: 1, color: ST.PINK_DARK },
      { i: '🍷', t: 'Tavolo 18 · Conto richiesto', d: 'Cliente ha chiesto il conto', minFa: 4, color: ST.TEXT },
      { i: '⚠️', t: 'Tavolo 25 · Allergia segnalata', d: 'Lattosio + Frutta secca', minFa: 12, color: ST.ST_BOOKED },
      { i: '✓', t: 'Ordine T23 inviato', d: 'In cucina', minFa: 18, color: ST.MUTED },
    ];
    return (
      <ModalShell onClose={closeModal} sheet>
        <SheetHandle/>
        <div style={{ padding: '8px 0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 16px' }}>
            <div style={{ fontSize: 19, fontWeight: 800 }}>Notifiche</div>
            <button style={{ fontSize: 12, fontWeight: 600, color: ST.PINK_DARK, background: 'none', border: 'none', cursor: 'pointer' }}>Segna tutte come lette</button>
          </div>
          {notifs.map((n, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '14px 24px',
              borderTop: `1px solid ${ST.BORDER_SOFT}`,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: ST.R_MD, background: ST.SURF_ALT,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                flexShrink: 0,
              }}>{n.i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: ST.TEXT, lineHeight: 1.3 }}>{n.t}</div>
                <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 2 }}>{n.d} · {n.minFa}min fa</div>
              </div>
              {i === 0 && <span style={{ width: 8, height: 8, borderRadius: ST.R_PILL, background: ST.PINK_DARK, marginTop: 12 }}/>}
            </div>
          ))}
        </div>
      </ModalShell>
    );
  }

  // ─── Modifica prenotazione ──────────────────────────────────
  if (modal.kind === 'modifica-prenotazione') {
    return (
      <ModalShell onClose={closeModal} sheet>
        <SheetHandle/>
        <div style={{ padding: '8px 24px 32px' }}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>Modifica prenotazione</div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 4, marginBottom: 20 }}>
            Tavolo {modal.tavolo?.n} · {modal.tavolo?.prenotazione?.nome}
          </div>
          <Input label="Nome cliente" value={modal.tavolo?.prenotazione?.nome || ''} onChange={() => {}}/>
          <Input label="Coperti" value={String(modal.tavolo?.coperti)} onChange={() => {}} style={{ marginTop: 12 }}/>
          <Input label="Note" value="" onChange={() => {}} placeholder="Compleanno, allergie, ecc." multiline style={{ marginTop: 12 }}/>
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
          {modal.cart.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderTop: `1px solid ${ST.BORDER_SOFT}`,
            }}>
              <span style={{ width: 28, fontSize: 12, fontWeight: 800, color: ST.MUTED }}>{c.qty}×</span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{c.nome}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>€{(c.prezzo * c.qty).toFixed(2)}</span>
              <button onClick={() => modal.setCart(modal.cart.filter((_, j) => j !== i))} style={{
                width: 28, height: 28, borderRadius: ST.R_PILL, border: 'none', background: 'transparent', cursor: 'pointer',
              }}><I.Trash s={14}/></button>
            </div>
          ))}
          <Btn variant="secondary" full onClick={closeModal} style={{ marginTop: 20 }}>Chiudi</Btn>
        </div>
      </ModalShell>
    );
  }

  return null;
}

// ─── Modifica tavoli ────────────────────────────────────────
function ModificaTavoliModal({ modal, closeModal, openModal }) {
  const [sel, setSel] = useStateMo({});
  const tavoli = TAVOLI.concat([{ id: 27, n: 27 }, { id: 28, n: 28 }, { id: 29, n: 29 }, { id: 32, n: 32 }, { id: 33, n: 33 }, { id: 34, n: 34 }, { id: 35, n: 35 }, { id: 36, n: 36 }]).filter(x => x.id !== modal.tavolo?.id).slice(0, 12);
  const selCount = Object.values(sel).filter(Boolean).length;

  return (
    <ModalShell onClose={closeModal} sheet>
      <SheetHandle/>
      <div style={{ padding: '8px 0 24px' }}>
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>Modifica tavoli</div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2 }}>
            {modal.mode === 'unisci' ? 'Unisci tavoli' : 'Dividi tavolo'}
          </div>
          <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 4 }}>
            {modal.mode === 'unisci' ? 'Seleziona i tavoli da unire al tavolo corrente' : 'Seleziona i tavoli su cui dividere il tavolo corrente'}
          </div>
        </div>

        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Tavolo corrente</div>
          <div style={{
            background: ST.PINK_SOFT, padding: 14, borderRadius: ST.R_MD,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: ST.TEXT }}>Tavolo {modal.tavolo?.n}</div>
            {modal.mode === 'dividi' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11.5, color: ST.MUTED }}>Coperti</span>
                <Stepper value={modal.tavolo?.coperti || 4} onChange={() => {}}/>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Tavoli disponibili ({tavoli.length})
          </div>
        </div>

        <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {tavoli.map(t => {
            const occupato = TAVOLI.some(x => x.id === t.id);
            return (
              <div key={t.id} onClick={() => !occupato && setSel({ ...sel, [t.id]: !sel[t.id] })} style={{
                position: 'relative',
                padding: 12, borderRadius: ST.R_MD,
                border: `1.5px solid ${sel[t.id] ? ST.PINK_DARK : ST.BORDER}`,
                background: sel[t.id] ? ST.PINK_SOFT : '#fff',
                opacity: occupato ? 0.55 : 1,
                cursor: occupato ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {occupato && (
                  <span style={{ position: 'absolute', top: 4, left: 4, fontSize: 9, color: ST.ST_BOOKED, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', padding: '1px 5px', background: ST.ST_BOOKED_BG, borderRadius: ST.R_PILL }}>Occupato</span>
                )}
                <span style={{ fontSize: 14, fontWeight: 700, marginTop: occupato ? 8 : 0 }}>N {t.n}</span>
                <span style={{
                  width: 20, height: 20, borderRadius: 5,
                  border: `2px solid ${sel[t.id] ? ST.PINK_DARK : ST.MUTED_3}`,
                  background: sel[t.id] ? ST.PINK_DARK : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{sel[t.id] && <I.Check s={11} c="#fff"/>}</span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <Btn
            variant="primary" full
            disabled={selCount === 0}
            onClick={() => {
              if (selCount > 6 && modal.mode === 'dividi') {
                closeModal();
                openModal({ kind: 'error', text: 'Numero di coperti superiore alla capienza dei tavoli selezionati.' });
              } else {
                closeModal();
                openModal({ kind: 'success', text: modal.mode === 'unisci' ? `${selCount + 1} tavoli uniti` : `Tavolo diviso su ${selCount} tavoli` });
              }
            }}
          >{modal.mode === 'unisci' ? 'Unisci' : 'Dividi'}</Btn>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Filtri menu ────────────────────────────────────────────
function FiltriModal({ modal, closeModal }) {
  const [active, setActive] = useStateMo({ portate: ['Primo'], tipi: ['Pasta'] });
  const isBev = modal.cat === 'bevande';
  const sections = isBev ? [
    { title: 'Tipo di bevanda', opts: ['Acqua','Vino','Birra','Cocktail','Superalcolici'] },
    { title: 'Acqua', opts: ['Naturale','Frizzante','Leggermente gassata'] },
    { title: 'Vino', opts: ['Bianco','Rosso','Naturale','Bollicine'] },
    { title: 'Tipo di alcolici', opts: ['Superalcolici','Analcolici','Aperitivi'] },
  ] : [
    { title: 'Portata piatto', opts: ['Antipasto','Primo','Secondo','Dolce'] },
    { title: 'Tipo piatto', opts: ['Pasta','Carne','Pesce','Latticini','Crostacei'] },
    { title: 'Filtri rapidi', opts: ['Senza glutine','Vegetariano','Vegano','Senza lattosio'] },
  ];

  return (
    <ModalShell onClose={closeModal} sheet>
      <SheetHandle/>
      <div style={{ padding: '8px 0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 16px' }}>
          <button onClick={closeModal} style={{ fontSize: 13, fontWeight: 600, color: ST.PINK_DARK, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Filtra per tipologia</div>
          <button onClick={closeModal} style={{ width: 28, height: 28, borderRadius: ST.R_PILL, border: 'none', background: ST.SURF_ALT, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Close s={14}/></button>
        </div>
        {sections.map(sec => (
          <div key={sec.title} style={{ padding: '0 24px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
              {sec.title}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sec.opts.map(o => (
                <button key={o} style={{
                  height: 34, padding: '0 14px', borderRadius: ST.R_PILL,
                  border: `1.5px solid ${ST.BORDER}`, background: '#fff',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>{o}</button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ padding: '0 24px' }}>
          <Btn variant="primary" full onClick={closeModal}>Filtra</Btn>
        </div>
      </div>
    </ModalShell>
  );
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
      background: '#16A34A',
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
      background: '#DC2626',
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

Object.assign(window, { StaffModals, ModalShell });
