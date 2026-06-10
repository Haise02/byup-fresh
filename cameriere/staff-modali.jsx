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

// ─── Attiva tavolo — componente proprio per evitare hook in if-block ──
function AttivaTavoloModal({ modal, closeModal, openModal }) {
  const t = modal.tavolo;
  const isPrenotato = t?.stato === 'prenotato';
  const capacita = t?.coperti || 2;
  const [n, setN] = useStateMo(isPrenotato ? (t?.prenotazione?.coperti || capacita) : capacita);
  const [mergesel, setMergesel] = useStateMo({});

  const liberiDisp = TavoliStore.getLiberi().filter(x => x.stato === 'libero' && x.id !== t?.id);
  const supera = n > capacita;
  // chiavi = numeri tavolo (String), così combaciano con TavoliStore.unisci
  const mergeNums = Object.entries(mergesel).filter(([, v]) => v).map(([k]) => k);
  const mergeCount = mergeNums.length;
  const label = mergeCount > 0
    ? `Unisci ${mergeCount + 1} tavoli e attiva`
    : `Attiva tavolo${t ? ` ${t.n}` : ''}`;

  const onConferma = () => {
    if (mergeCount > 0 && t) TavoliStore.unisci(t.id, mergeNums);
    closeModal();
    openModal({ kind: 'success', text: `Tavolo${t ? ` ${t.n}` : ''} attivato · ${n} persone` });
  };

  return (
    <ModalShell onClose={closeModal} sheet>
      <SheetHandle/>
      <div style={{ padding: '8px 24px 32px' }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: ST.TEXT }}>Attiva tavolo</div>
        {t && (
          <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 3, marginBottom: 20 }}>
            Tavolo {t.n}{isPrenotato ? ` · ${t.prenotazione.nome}` : ''}
          </div>
        )}

        {/* Stepper persone */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: ST.SURF_ALT, borderRadius: ST.R_MD, marginBottom: 16,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Persone</div>
            {t && <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>Posti tavolo: {capacita}</div>}
          </div>
          <Stepper value={n} onChange={setN}/>
        </div>

        {/* Suggerimento unione — appare solo se persone > posti tavolo */}
        {supera && liberiDisp.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: '#FEF3C7', borderRadius: ST.R_MD, marginBottom: 12,
              border: '1px solid #FCD34D',
            }}>
              <I.Alert s={15} c="#D97706"/>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#92400E', lineHeight: 1.4 }}>
                Il tavolo ha {capacita} posti. Seleziona tavoli da unire per {n} persone.
              </span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
              Tavoli liberi disponibili
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {liberiDisp.map(lt => {
                const sel = !!mergesel[String(lt.n)];
                return (
                  <button key={lt.id}
                    onClick={() => setMergesel(p => ({ ...p, [String(lt.n)]: !p[String(lt.n)] }))}
                    style={{
                      height: 38, padding: '0 14px', borderRadius: ST.R_PILL,
                      border: `1.5px solid ${sel ? ST.PINK_DARK : ST.BORDER}`,
                      background: sel ? ST.PINK_SOFT : '#fff',
                      color: sel ? ST.PINK_DARK : ST.TEXT,
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    }}>T {lt.n} · {lt.coperti}p</button>
                );
              })}
            </div>
          </div>
        )}

        <Btn variant="primary" full onClick={onConferma}>{label}</Btn>
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

  // ─── Attiva tavolo ──────────────────────────────────────────
  if (modal.kind === 'attiva-tavolo') {
    return <AttivaTavoloModal modal={modal} closeModal={closeModal} openModal={openModal}/>;
  }

  // ─── Tavolo actions menu ────────────────────────────────────
  if (modal.kind === 'tavolo-actions') {
    const items = [
      { i: <I.Edit s={18}/>, l: 'Modifica tavolo', d: 'Coperti, unisci o disgiungi tavoli', a: () => { closeModal(); openModal({ kind: 'modifica-tavolo', tavolo: modal.tavolo }); } },
      { i: <I.User s={18}/>, l: 'Cambia cameriere', d: 'Riassegna a un collega' },
      { i: <I.Close s={18} c="#DC2626"/>, l: 'Libera tavolo', d: 'Chiudi senza pagamento', danger: true, a: () => { closeModal(); openModal({ kind: 'conferma-libera', tavolo: modal.tavolo }); } },
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

  // ─── Azioni rapide card Liberi ──────────────────────────────
  if (modal.kind === 'libero-actions') {
    const t = modal.tavolo;
    const items = t.stato === 'prenotato' ? [
      { i: <I.Edit s={18}/>, l: 'Modifica prenotazione', d: 'Aggiorna dati o cambia orario',
        a: () => { closeModal(); openModal({ kind: 'modifica-prenotazione', tavolo: t }); } },
      { i: <I.Close s={18} c="#DC2626"/>, l: 'No show', d: 'La prenotazione non si è presentata',
        danger: true, a: () => { closeModal(); openModal({ kind: 'conferma-no-show', tavolo: t }); } },
    ] : [
      { i: <I.Merge s={18}/>, l: 'Modifica tavolo', d: 'Unisci o disgiungi tavoli',
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

  // ─── Conferma: no show prenotazione ────────────────────────
  if (modal.kind === 'conferma-no-show') {
    const t = modal.tavolo || {};
    return (
      <ModalShell onClose={closeModal}>
        <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I.Alert s={28} c="#DC2626"/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT }}>Segnare come no show?</div>
          <div style={{ fontSize: 13.5, color: ST.MUTED, marginTop: 8, lineHeight: 1.5 }}>
            La prenotazione di <strong style={{ color: ST.TEXT }}>{t.prenotazione?.nome}</strong> per il Tavolo {t.n} verrà rimossa e il tavolo sarà liberato.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <Btn variant="secondary" full onClick={closeModal}>Annulla</Btn>
            <Btn variant="danger" full onClick={() => {
              TavoliStore.noShow(t.id);
              closeModal();
              openModal({ kind: 'success', text: `No show · Tavolo ${t.n} liberato` });
            }}>Sì, no show</Btn>
          </div>
        </div>
      </ModalShell>
    );
  }

  // ─── Conferma: libera tavolo (chiusura forzata prima del saldo) ─
  if (modal.kind === 'conferma-libera') {
    const t = modal.tavolo || {};
    return (
      <ModalShell onClose={closeModal}>
        <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I.Alert s={28} c="#DC2626"/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT }}>Forzare la chiusura?</div>
          <div style={{ fontSize: 13.5, color: ST.MUTED, marginTop: 8, lineHeight: 1.5 }}>
            Il Tavolo {t.n} non è ancora stato saldato. Vuoi davvero chiuderlo
            senza pagamento? Passerà nello stato “Da pulire”.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <Btn variant="secondary" full onClick={closeModal}>Annulla</Btn>
            <Btn variant="danger" full onClick={() => {
              TavoliStore.liberaTavolo(t.id);
              closeModal();
              nav.reset({ s: 'sala' });
              openModal({ kind: 'success', text: `Tavolo ${t.n} chiuso · ora è Da pulire` });
            }}>Sì, chiudi</Btn>
          </div>
        </div>
      </ModalShell>
    );
  }

  // ─── Modifica tavolo (unificato: coperti + unisci + disgiungi) ─
  if (modal.kind === 'modifica-tavolo') {
    return <ModificaTavoloUnifModal modal={modal} closeModal={closeModal} openModal={openModal}/>;
  }
  // Backward compat
  if (modal.kind === 'modifica-tavoli') {
    return <ModificaTavoliModal modal={modal} closeModal={closeModal} openModal={openModal}/>;
  }

  // ─── Receipt: dove inviare ricevuta ─────────────────────────
  if (modal.kind === 'invia-ricevuta') {
    return <InviaRicevutaModal modal={modal} closeModal={closeModal} openModal={openModal} nav={nav}/>;
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
                    border: `1.5px solid ${sel ? '#7C3AED' : ST.BORDER}`,
                    background: sel ? '#EDE9FE' : '#fff',
                    color: sel ? '#6D28D9' : ST.TEXT,
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                  }}>{tag}</button>
                );
              })}
              {customTags.map(tag => (
                <button key={tag} onClick={() => setTags(prev => prev.filter(t => t !== tag))} style={{
                  height: 32, padding: '0 12px', borderRadius: ST.R_PILL,
                  border: '1.5px solid #7C3AED', background: '#EDE9FE', color: '#6D28D9',
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
                background: newTag.trim() ? '#7C3AED' : ST.MUTED_3, color: '#fff',
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

// ─── Modifica tavolo UNIFICATO ──────────────────────────────
function ModificaTavoloUnifModal({ modal, closeModal, openModal }) {
  const tavolo = modal.tavolo || {};
  // Dai Liberi i coperti si modificano già inline sulla card: qui la modale
  // serve solo a unire/disgiungere, quindi il tab "Coperti" viene nascosto.
  const isLibero = modal.scope === 'libero';
  // Determina se è un tavolo "composto" (es. 25-32) leggendo il numero
  const isComposto = String(tavolo.n || '').includes('-');
  const partiTavolo = isComposto
    ? String(tavolo.n).split('-').map(s => s.trim())
    : [String(tavolo.n)];

  const [tab, setTab] = useStateMo(isComposto ? 'disgiungi' : isLibero ? 'unisci' : 'coperti');
  const [coperti, setCoperti] = useStateMo(tavolo.coperti || 4);
  const [unisciSel, setUnisciSel] = useStateMo({});
  const [qUnisci, setQUnisci] = useStateMo('');
  const [disgiuntiSel, setDisgiuntiSel] = useStateMo(
    Object.fromEntries(partiTavolo.map(p => [p, false]))
  );

  const tabs = [
    !isLibero && { id: 'coperti', label: 'Coperti', icon: <I.Users s={14}/> },
    { id: 'unisci', label: 'Unisci', icon: <I.Merge s={14}/> },
    isComposto && { id: 'disgiungi', label: 'Disgiungi', icon: <I.Split s={14}/> },
  ].filter(Boolean);

  // Tavoli liberi da unire
  const tavoliLiberi = [27, 28, 29, 32, 33, 34, 35, 36, 38, 39]
    .filter(n => !TAVOLI.some(x => String(x.n) === String(n)) && !partiTavolo.includes(String(n)));
  const tavoliLiberiFiltrati = tavoliLiberi.filter(n => String(n).includes(qUnisci.trim()));

  const unisciCount = Object.values(unisciSel).filter(Boolean).length;
  const disgiuntiCount = Object.values(disgiuntiSel).filter(Boolean).length;

  return (
    <ModalShell onClose={closeModal} sheet>
      <SheetHandle/>
      <div style={{ padding: '8px 0 24px' }}>
        <div style={{ padding: '0 20px 8px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {isComposto ? `Tavolo ${tavolo.n}` : `Tavolo ${tavolo.n}`}
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2 }}>Modifica tavolo</div>
          <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 4, lineHeight: 1.45 }}>
            {isComposto
              ? `Tavolo composto da ${partiTavolo.length} tavoli. Puoi ${isLibero ? '' : 'cambiare i coperti, '}unirne altri o disgiungere.`
              : isLibero
                ? 'Unisci questo tavolo ad altri per accogliere un gruppo più grande.'
                : 'Cambia i coperti oppure unisci a un altro tavolo.'}
          </div>
        </div>

        {/* Segmented control */}
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
              {tavoliLiberiFiltrati.map(n => (
                <div key={n} onClick={()=>setUnisciSel({...unisciSel, [n]: !unisciSel[n]})} style={{
                  padding:'14px 8px', borderRadius: ST.R_MD,
                  border: `1.5px solid ${unisciSel[n] ? ST.PINK_DARK : ST.BORDER}`,
                  background: unisciSel[n] ? ST.PINK_SOFT : '#fff',
                  cursor:'pointer', textAlign:'center', position:'relative',
                }}>
                  {unisciSel[n] && (
                    <span style={{position:'absolute', top:6, right:6, width:18, height:18, borderRadius: ST.R_PILL, background: ST.PINK_DARK, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <I.Check s={10} c="#fff"/>
                    </span>
                  )}
                  <div style={{fontSize:14, fontWeight:700, color: unisciSel[n] ? ST.PINK_DARK : ST.TEXT}}>T {n}</div>
                  <div style={{fontSize:10.5, color:ST.MUTED, marginTop:2}}>libero</div>
                </div>
              ))}
            </div>
            {tavoliLiberiFiltrati.length === 0 && (
              <div style={{ textAlign:'center', padding:'8px 0 16px', color: ST.MUTED, fontSize:13 }}>
                Nessun tavolo libero per “{qUnisci}”.
              </div>
            )}
            {unisciCount > 0 && (
              <div style={{
                padding:'10px 14px', background: ST.PINK_BG, borderRadius: ST.R_MD,
                marginBottom:14, fontSize:12.5, color: ST.PINK_DARK, fontWeight:600,
                display:'flex', alignItems:'center', gap:8,
              }}>
                <I.Merge s={14} c={ST.PINK_DARK}/>
                Nuovo tavolo: T{tavolo.n}-{Object.entries(unisciSel).filter(([_,v])=>v).map(([k])=>k).join('-')}
              </div>
            )}
            <Btn variant="primary" full disabled={unisciCount === 0}
              onClick={()=>{
                TavoliStore.unisci(tavolo.id, Object.entries(unisciSel).filter(([_,v])=>v).map(([k])=>k));
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
              {partiTavolo.map(p => (
                <div key={p} onClick={()=>setDisgiuntiSel({...disgiuntiSel, [p]: !disgiuntiSel[p]})} style={{
                  padding:'14px 16px', borderRadius: ST.R_MD,
                  border:`1.5px solid ${disgiuntiSel[p] ? ST.PINK_DARK : ST.BORDER}`,
                  background: disgiuntiSel[p] ? ST.PINK_SOFT : '#fff',
                  cursor:'pointer',
                  display:'flex', alignItems:'center', gap:12,
                }}>
                  <span style={{
                    width:22, height:22, borderRadius:6,
                    border:`2px solid ${disgiuntiSel[p] ? ST.PINK_DARK : ST.MUTED_3}`,
                    background: disgiuntiSel[p] ? ST.PINK_DARK : '#fff',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>{disgiuntiSel[p] && <I.Check s={12} c="#fff"/>}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14, fontWeight:700, color: disgiuntiSel[p] ? ST.PINK_DARK : ST.TEXT}}>Tavolo {p}</div>
                    <div style={{fontSize:11.5, color: ST.MUTED, marginTop:2}}>{disgiuntiSel[p] ? 'Diventerà un tavolo separato' : 'Resta nel gruppo'}</div>
                  </div>
                </div>
              ))}
            </div>
            <Btn variant="primary" full disabled={disgiuntiCount === 0 || disgiuntiCount === partiTavolo.length}
              onClick={()=>{
                TavoliStore.dividi(tavolo.id, Object.entries(disgiuntiSel).filter(([_,v])=>v).map(([k])=>k));
                closeModal(); openModal({kind:'success', text:`Tavolo disgiunto in ${disgiuntiCount + 1} parti`});
              }}
            >{disgiuntiCount === 0 ? 'Seleziona almeno un tavolo' : `Disgiungi ${disgiuntiCount} tavolo${disgiuntiCount > 1 ? 'i' : ''}`}</Btn>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─── Invia Ricevuta: email/SMS/stampa cortesia ──────────────
function InviaRicevutaModal({ modal, closeModal, openModal, nav }) {
  // Mock: se il cliente ha usato l'app, recupera contatti
  const guest = modal.guest; // { hasApp, email, tel, nome }
  const [metodo, setMetodo] = useStateMo(guest?.hasApp ? 'email' : null);
  const [email, setEmail] = useStateMo(guest?.email || '');
  const [tel, setTel] = useStateMo(guest?.tel || '');

  const canSubmit = (
    (metodo === 'email' && email.includes('@')) ||
    (metodo === 'sms' && tel.length >= 6) ||
    metodo === 'stampa'
  );

  return (
    <ModalShell onClose={closeModal} sheet>
      <SheetHandle/>
      <div style={{padding:'8px 24px 28px'}}>
        <div style={{fontSize:11, fontWeight:700, color:ST.MUTED, letterSpacing:0.5, textTransform:'uppercase'}}>
          Tavolo {modal.tavoloN} · €{modal.importo?.toFixed(2)}
        </div>
        <div style={{fontSize:19, fontWeight:800, marginTop:2}}>Invia ricevuta</div>

        {guest?.hasApp && (
          <div style={{
            marginTop: 14, padding:'10px 12px',
            background: ST.ST_BUSY_BG, borderRadius: ST.R_MD,
            display:'flex', alignItems:'center', gap:10,
            border: `1px solid ${ST.ST_BUSY}33`,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: ST.R_PILL,
              background: ST.ST_BUSY, color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><I.Check s={14} c="#fff"/></div>
            <div style={{flex:1, fontSize:12, color: ST.TEXT}}>
              <span style={{fontWeight:700}}>{guest.nome}</span> usa l'app byup —
              recapiti precompilati
            </div>
          </div>
        )}

        <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:18}}>
          <ReceiptOption
            id="email" label="Per email"
            sub={guest?.hasApp ? `→ ${guest.email}` : 'Inserisci email cliente'}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={metodo==='email' ? ST.PINK_DARK : ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>}
            active={metodo === 'email'} onClick={()=>setMetodo('email')}/>
          <ReceiptOption
            id="sms" label="Per SMS"
            sub={guest?.hasApp ? `→ ${guest.tel}` : 'Inserisci numero cellulare'}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={metodo==='sms' ? ST.PINK_DARK : ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>}
            active={metodo === 'sms'} onClick={()=>setMetodo('sms')}/>
          <ReceiptOption
            id="stampa" label="Scontrino di cortesia"
            sub="Stampa subito in cassa"
            icon={<I.Receipt s={20} c={metodo==='stampa' ? ST.PINK_DARK : ST.TEXT}/>}
            active={metodo === 'stampa'} onClick={()=>setMetodo('stampa')}/>
        </div>

        {/* Campo precompilato modificabile */}
        {metodo === 'email' && !guest?.hasApp && (
          <input
            value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="cliente@email.it" type="email"
            style={{
              marginTop:14, width:'100%', height:44,
              padding:'0 14px', borderRadius: ST.R_MD,
              border:`1.5px solid ${ST.BORDER}`, background: ST.SURF,
              fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
            }}/>
        )}
        {metodo === 'sms' && !guest?.hasApp && (
          <input
            value={tel} onChange={e=>setTel(e.target.value)}
            placeholder="+39 333 1234567" type="tel"
            style={{
              marginTop:14, width:'100%', height:44,
              padding:'0 14px', borderRadius: ST.R_MD,
              border:`1.5px solid ${ST.BORDER}`, background: ST.SURF,
              fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
            }}/>
        )}

        <div style={{display:'flex', gap:8, marginTop:20}}>
          <Btn variant="secondary" full onClick={closeModal}>Salta</Btn>
          <Btn variant="primary" full disabled={!canSubmit}
            onClick={()=>{
              closeModal();
              const msg = metodo === 'email' ? `Ricevuta inviata a ${email}`
                        : metodo === 'sms'   ? `Ricevuta inviata a ${tel}`
                        : 'Scontrino di cortesia inviato in cassa';
              openModal({kind:'success', text: msg});
            }}
          >{metodo === 'stampa' ? 'Stampa scontrino' : 'Invia ricevuta'}</Btn>
        </div>
      </div>
    </ModalShell>
  );
}

function ReceiptOption({ label, sub, icon, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', display:'flex', alignItems:'center', gap:14,
      padding:'14px 16px', borderRadius: ST.R_MD,
      border:`1.5px solid ${active ? ST.PINK_DARK : ST.BORDER}`,
      background: active ? ST.PINK_BG : '#fff',
      cursor:'pointer', fontFamily:'inherit', textAlign:'left',
    }}>
      <div style={{
        width:42, height:42, borderRadius: ST.R_MD,
        background: active ? ST.PINK_SOFT : ST.SURF_ALT,
        display:'flex', alignItems:'center', justifyContent:'center',
        flexShrink:0,
      }}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14, fontWeight:700, color: active ? ST.PINK_DARK : ST.TEXT}}>{label}</div>
        <div style={{fontSize:12, color: ST.MUTED, marginTop:2}}>{sub}</div>
      </div>
      <span style={{
        width:22, height:22, borderRadius: ST.R_PILL,
        border:`2px solid ${active ? ST.PINK_DARK : ST.MUTED_3}`,
        background: active ? ST.PINK_DARK : '#fff',
        display:'flex', alignItems:'center', justifyContent:'center',
        flexShrink:0,
      }}>{active && <span style={{width:8, height:8, borderRadius: ST.R_PILL, background:'#fff'}}/>}</span>
    </button>
  );
}

Object.assign(window, { StaffModals, ModalShell });
