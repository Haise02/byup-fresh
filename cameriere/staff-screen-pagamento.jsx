// byup Staff — Pagamento (split + tap-to-pay + ricevuta)

const { useState: useStateP, useEffect: useEffectP } = React;

// ═══════════════════════════════════════════════════════════
// CONTO — vista del conto del tavolo (sola consultazione)
// Il pagamento NON si fa da qui: niente split, niente mancia,
// niente metodi di incasso. Resta la lista voci e la "Modifica"
// per correggere prezzi / cancellare voci.
// ═══════════════════════════════════════════════════════════
function ScreenPagamentoSplit({ nav, openModal, tavoloId }) {
  const t = TAVOLI.find(x => x.id === tavoloId) || TAVOLI[0];
  // Copia locale modificabile degli ordini: prezzo e cancellazione voci sono
  // funzioni secondarie, vivono dietro la modalità "Modifica".
  const [ordini, setOrdini] = useStateP(() => ORDINE_T23.map(o => ({ ...o })));
  const totale = ordini.reduce((s, o) => s + o.prezzo * o.qty, 0);

  const [expanded, setExpanded] = useStateP({});
  const [editMode, setEditMode] = useStateP(false);

  const setPrezzo = (id, val) => setOrdini(prev => prev.map(o => o.id === id ? { ...o, prezzo: val } : o));
  // Quantità editabile in modifica: togli/aggiungi singole unità (min 1; per
  // azzerare la voce c'è il cestino).
  const setQty = (id, q) => setOrdini(prev => prev.map(o => o.id === id ? { ...o, qty: Math.max(1, q) } : o));
  const eliminaVoce = (id) => setOrdini(prev => prev.filter(o => o.id !== id));

  // Totale per cliente
  const totalForCliente = (c) => c.piatti.reduce((s, oid) => {
    const o = ordini.find(x => x.id === oid);
    return s + (o ? o.prezzo * o.qty : 0);
  }, 0);

  // Commensali digitali: tutti insieme, etichettati Guest 1..N (indifferente
  // se app byup o webapp). In editMode i piatti mostrano prezzo editabile +
  // cestino; altrimenti la sola lettura.
  const clientiList = CLIENTI_T23.filter(c => c.piatti.length > 0);

  const ClientiCard = () => clientiList.length === 0 ? null : (
    <div style={{ padding: '14px 16px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>
        Ordini clienti
      </div>
      <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
        {clientiList.map((c, i, arr) => {
          const exp = expanded[c.id];
          const cTot = totalForCliente(c);
          // App byup → nome reale (registrato). Webapp → ospite anonimo "Guest N", in grigio.
          const isByup = c.kind === 'byup';
          const guestNo = clientiList.slice(0, i + 1).filter(x => x.kind !== 'byup').length;
          const label = isByup ? c.nome : `Guest ${guestNo}`;
          return (
            <div key={c.id} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${ST.BORDER_SOFT}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: ST.R_PILL,
                  background: isByup ? `linear-gradient(135deg, ${ST.PINK} 0%, ${ST.PINK_DARK} 100%)` : ST.MUTED_3,
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>{isByup ? c.nome[0] : guestNo}</div>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpanded({ ...expanded, [c.id]: !exp })}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isByup ? ST.TEXT : ST.MUTED }}>{label}</div>
                  <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>{c.piatti.length} piatti · €{cTot}</div>
                </div>
                <button onClick={() => setExpanded({ ...expanded, [c.id]: !exp })} style={{
                  width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: exp ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms',
                }}><I.ChevDown s={16} c={ST.MUTED}/></button>
              </div>

              {exp && (
                <div style={{ background: ST.SURF, padding: '6px 14px 12px 60px' }}>
                  {c.piatti.map(oid => {
                    const o = ordini.find(x => x.id === oid);
                    if (!o) return null;
                    return editMode ? (
                      <div key={oid} style={{ padding: '10px 0', borderTop: `1px solid ${ST.BORDER_SOFT}` }}>
                        {/* Riga 1: nome + cestino */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: ST.TEXT_SOFT, fontWeight: 600 }}>{o.nome}</span>
                          <button onClick={() => eliminaVoce(o.id)} style={{
                            width: 28, height: 28, borderRadius: ST.R_PILL, border: 'none', flexShrink: 0,
                            background: '#FEE2E2', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}><I.Trash s={14} c="#DC2626"/></button>
                        </div>
                        {/* Riga 2: quantità (stepper) + prezzo unitario + subtotale */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                          <Stepper value={o.qty} onChange={q => setQty(o.id, q)}/>
                          <PrezzoInput value={o.prezzo} onChange={v => setPrezzo(o.id, v)}/>
                          <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: ST.TEXT }}>€{(o.prezzo * o.qty).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <div key={oid} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                        borderTop: `1px solid ${ST.BORDER_SOFT}`,
                      }}>
                        <span style={{ width: 26, fontSize: 11.5, color: ST.MUTED, fontWeight: 700 }}>{o.qty}×</span>
                        <span style={{ flex: 1, fontSize: 13, color: ST.TEXT_SOFT, fontWeight: 500 }}>{o.nome}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: ST.TEXT }}>€{o.prezzo * o.qty}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ background: ST.BG, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header compatto — fisso */}
      <div style={{ flexShrink: 0, background: '#fff', padding: 'calc(16px + env(safe-area-inset-top)) 16px 16px', borderBottom: `1px solid ${ST.BORDER_SOFT}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Close s={18}/></button>
          <div style={{ flex: 1, textAlign:'center', minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Tavolo {t.n}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ST.TEXT, marginTop: 2 }}>
              Conto
            </div>
          </div>
          <div style={{ width: 40 }}/>
        </div>
      </div>

      {/* AREA SCORREVOLE — solo le liste scrollano, header e footer restano fissi */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 20 }}>

      {/* Toolbar: solo "Modifica" (correggi prezzi / cancella voci). */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 20px 0' }}>
        <button onClick={() => setEditMode(v => !v)} style={{
          background: 'transparent', border: 'none',
          color: editMode ? ST.PINK_DARK : ST.TEXT, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', padding: 0,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          {editMode ? 'Fatto' : <React.Fragment><I.Edit s={14} c={ST.TEXT}/> Modifica</React.Fragment>}
        </button>
      </div>

      {/* ORDINI CLIENTI — tutti insieme, Guest 1..N */}
      {ClientiCard()}

      {/* ORDINI TAVOLO */}
      <div style={{ padding: '18px 16px 0' }}>
        <div style={{ padding: '0 4px 8px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Ordini tavolo
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
          {ordini.map((o, i) => (
            <div key={o.id} style={{
              padding: '12px 14px',
              borderBottom: i < ordini.length - 1 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
              background: '#fff',
            }}>
              {editMode ? (
                <React.Fragment>
                  {/* Riga 1: nome + cestino */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: ST.TEXT, fontWeight: 600 }}>{o.nome}</span>
                    <button onClick={() => eliminaVoce(o.id)} style={{
                      width: 30, height: 30, borderRadius: ST.R_PILL, border: 'none', flexShrink: 0,
                      background: '#FEE2E2', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><I.Trash s={15} c="#DC2626"/></button>
                  </div>
                  {/* Riga 2: quantità (stepper) + prezzo unitario + subtotale */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <Stepper value={o.qty} onChange={q => setQty(o.id, q)}/>
                    <PrezzoInput value={o.prezzo} onChange={v => setPrezzo(o.id, v)}/>
                    <span style={{ marginLeft: 'auto', fontSize: 13.5, fontWeight: 700, color: ST.TEXT }}>€{(o.prezzo * o.qty).toFixed(2)}</span>
                  </div>
                </React.Fragment>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 28, fontSize: 12, fontWeight: 800, color: ST.MUTED }}>{o.qty}×</span>
                  <span style={{ flex: 1, fontSize: 13.5, color: ST.TEXT, fontWeight: 600 }}>{o.nome}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: ST.TEXT }}>€{o.prezzo * o.qty}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>{/* fine area scorrevole */}

      {/* Footer — totale del conto in sola lettura (nessun incasso da qui). */}
      <div style={{
        flexShrink: 0, zIndex: 30,
        padding: '16px 16px calc(28px + env(safe-area-inset-bottom))',
        background: '#fff', borderTop: `1px solid ${ST.BORDER_SOFT}`, boxShadow: ST.SH_LG,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 12.5, color: ST.MUTED, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Totale conto</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.4 }}>€{totale.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGAMENTO CARTA — Tap to Pay con eventuale PIN
// Step: waiting → reading → pin (opzionale) → success
// ═══════════════════════════════════════════════════════════
function ScreenPagamentoCarta({ nav, openModal, importo, tavoloId }) {
  const [step, setStep] = useStateP('waiting');
  const [pin, setPin] = useStateP('');
  const t = TAVOLI.find(x => x.id === tavoloId);

  // PIN richiesto sopra una certa soglia (mock: > €25)
  const pinRichiesto = (importo || 0) > 25;

  useEffectP(() => {
    if (step === 'waiting') {
      const t1 = setTimeout(() => setStep('reading'), 2400);
      return () => clearTimeout(t1);
    }
    if (step === 'reading') {
      const t2 = setTimeout(() => {
        setStep(pinRichiesto ? 'pin' : 'success');
      }, 1600);
      return () => clearTimeout(t2);
    }
  }, [step, pinRichiesto]);

  // Auto-success quando PIN ha 4 cifre
  useEffectP(() => {
    if (step === 'pin' && pin.length === 4) {
      const tm = setTimeout(() => setStep('success'), 700);
      return () => clearTimeout(tm);
    }
  }, [step, pin]);

  const onPinDigit = (d) => {
    if (d === 'back') setPin(p => p.slice(0, -1));
    else if (pin.length < 4) setPin(p => p + d);
  };

  return (
    <div style={{ background: ST.WINE, minHeight: '100%', color: '#fff', position: 'relative' }}>
      <div style={{ padding: 'calc(16px + env(safe-area-inset-top)) 16px 16px' }}>
        <button onClick={() => nav.pop()} style={{
          width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
          background: 'rgba(255,255,255,0.12)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.Close s={18} c="#fff"/></button>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '8px 24px', textAlign: 'center',
      }}>
        {/* NFC waves (solo in waiting/reading) */}
        {(step === 'waiting' || step === 'reading' || step === 'success') && (
          <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 20 }}>
            {step === 'waiting' && [0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: ST.R_PILL,
                border: '2px solid rgba(255,255,255,0.4)',
                animation: `nfcwave 2s ease-out ${i * 0.6}s infinite`,
              }}/>
            ))}
            <div style={{
              position: 'absolute', inset: 30, borderRadius: ST.R_PILL,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {step === 'success' ? <I.Check s={32} c="#fff"/> : <I.Wifi s={36} c="#fff"/>}
            </div>
          </div>
        )}

        {/* Status text */}
        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          {step === 'waiting' && 'In attesa carta'}
          {step === 'reading' && 'Lettura in corso'}
          {step === 'pin' && 'Inserisci PIN'}
          {step === 'success' && 'Pagamento completato'}
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, opacity: 0.9, lineHeight: 1.4, marginBottom: 18 }}>
          {step === 'waiting' && 'Avvicina la carta al telefono'}
          {step === 'reading' && 'Tieni la carta ferma…'}
          {step === 'pin' && 'Chiedi al cliente di inserire il PIN'}
          {step === 'success' && '✓ Transazione approvata'}
        </div>

        {/* Importo card */}
        <div style={{
          background: 'rgba(255,255,255,0.95)', borderRadius: ST.R_LG,
          padding: '16px 24px', color: ST.TEXT, minWidth: 220,
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: ST.R_MD,
            background: `linear-gradient(135deg, ${ST.PINK} 0%, ${ST.PINK_DARK} 100%)`,
            margin: '0 auto 6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, fontWeight: 800,
          }}>b</div>
          <div style={{ fontSize: 10.5, color: ST.MUTED, fontWeight: 600 }}>Trattoria del Borgo</div>
          <div style={{ fontSize: 10.5, color: ST.MUTED }}>Tavolo {t?.n} · {STAFF_USER.nome} {STAFF_USER.cognome}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5, marginTop: 6 }}>
            €{importo?.toFixed(2)}
          </div>
        </div>

        {/* PIN PAD */}
        {step === 'pin' && (
          <div style={{ marginTop: 20, width: '100%', maxWidth: 280 }}>
            {/* Pin dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 18 }}>
              {[0, 1, 2, 3].map(i => (
                <span key={i} style={{
                  width: 14, height: 14, borderRadius: ST.R_PILL,
                  background: i < pin.length ? '#fff' : 'rgba(255,255,255,0.25)',
                  transition: 'all 200ms',
                  transform: i === pin.length - 1 ? 'scale(1.15)' : 'scale(1)',
                }}/>
              ))}
            </div>
            {/* Keypad */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
            }}>
              {['1','2','3','4','5','6','7','8','9','','0','back'].map((d, i) => {
                if (d === '') return <div key={i}/>;
                const isBack = d === 'back';
                return (
                  <button key={i} onClick={() => onPinDigit(d)} style={{
                    height: 56, borderRadius: ST.R_MD,
                    background: 'rgba(255,255,255,0.12)',
                    border: 'none', color: '#fff',
                    fontSize: 22, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isBack
                      ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l5-5h12a1 1 0 011 1v8a1 1 0 01-1 1H8l-5-5z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
                      : d}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.6, marginTop: 14 }}>
              PIN richiesto per importi superiori a €25
            </div>
          </div>
        )}

        {/* Success actions */}
        {step === 'success' && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
            <button onClick={() => openModal({
              kind: 'invia-ricevuta',
              tavoloN: t?.n,
              importo,
              // Mock: utente che ha usato app
              guest: { hasApp: true, nome: 'Marco', email: 'marco@email.it', tel: '+39 333 1234567' },
            })} style={{
              width: '100%', height: 50, borderRadius: ST.R_PILL,
              background: '#fff', color: ST.WINE, border: 'none',
              fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <I.Receipt s={16} c={ST.WINE}/> Invia ricevuta
            </button>
            <button onClick={() => nav.reset({ s: 'sala' })} style={{
              width: '100%', height: 46, borderRadius: ST.R_PILL,
              background: 'rgba(255,255,255,0.16)', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Torna in sala</button>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 40, padding: '0 16px',
      }}>
        {(step === 'waiting' || step === 'reading') && (
          <button onClick={() => nav.pop()} style={{
            width: '100%', height: 50, borderRadius: ST.R_PILL,
            background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Annulla transazione</button>
        )}
      </div>

      <style>{`@keyframes nfcwave { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGAMENTO CONTANTI — importo ricevuto + resto
// Lean: tagli rapidi (banconote ≥ dovuto) + tastierino, calcolo resto.
// ═══════════════════════════════════════════════════════════
function ScreenPagamentoContanti({ nav, openModal, importo, tavoloId, misto }) {
  const t = TAVOLI.find(x => x.id === tavoloId);
  const due = importo || 0;
  const [ricevuto, setRicevuto] = useStateP(null); // euro interi digitati, o null
  const [daChip, setDaChip] = useStateP(false);    // valore impostato da un taglio
  const [done, setDone] = useStateP(false);

  // MISTO: la cifra che digiti è la quota in contanti; il resto va su carta.
  // Normale: la cifra è il ricevuto, e il resto è il cambio da dare.
  const restoCarta = misto ? +Math.max(0, due - (ricevuto || 0)).toFixed(2) : 0;
  const resto = ricevuto != null ? ricevuto - due : 0;
  const ok = misto ? (ricevuto != null && ricevuto > 0) : (ricevuto != null && ricevuto >= due);

  // Tagli rapidi: in misto le banconote SOTTO il totale (quota parziale), in
  // contanti pieno quelle SOPRA il dovuto (per coprirlo e dare il resto).
  const tagli = misto
    ? [5, 10, 20, 50, 100].filter(v => v < due).slice(-3)
    : [5, 10, 20, 50, 100, 200, 500].filter(v => v > due).slice(0, 3);
  const clamp = (n) => (misto && n > due ? due : n);

  const pickChip = (v) => { setRicevuto(v); setDaChip(true); };
  const onKey = (d) => {
    if (d === 'back') { setDaChip(false); setRicevuto(r => { const s = String(r ?? '').slice(0, -1); return s ? Number(s) : null; }); return; }
    // Dopo un taglio, la prima cifra riparte da capo (deseleziona il chip).
    setRicevuto(r => clamp(daChip ? Number(d) : Number(String(r ?? '') + d)));
    setDaChip(false);
  };

  // Conferma: in misto con resto>0 prosegue al Tap to Pay del saldo; altrimenti
  // (contanti pieno) mostra l'esito con resto + ricevuta.
  const onConferma = () => {
    if (misto && restoCarta > 0) nav.push({ s: 'pagamento-carta', tavoloId, importo: restoCarta });
    else setDone(true);
  };

  return (
    <div style={{ background: ST.BG, minHeight: '100%', position: 'relative', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: 'calc(16px + env(safe-area-inset-top)) 16px 16px', borderBottom: `1px solid ${ST.BORDER_SOFT}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Close s={18}/></button>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {misto ? 'Misto · contanti' : 'Contanti'}{t ? ` · Tavolo ${t.n}` : ''}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ST.TEXT, marginTop: 2 }}>Da incassare €{due.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {done ? (
        /* Esito: resto + azioni */
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
            background: '#E8F1EC', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Check s={32} c={ST.ST_OK || '#5E9C7B'}/></div>
          <div style={{ fontSize: 15, fontWeight: 700, color: ST.MUTED }}>Incasso registrato</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5, marginTop: 8 }}>
            Resto €{resto.toFixed(2)}
          </div>
          <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 6 }}>
            Ricevuti €{(ricevuto || 0).toFixed(2)} · dovuto €{due.toFixed(2)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28, maxWidth: 300, margin: '28px auto 0' }}>
            <Btn variant="primary" full onClick={() => openModal({
              kind: 'invia-ricevuta', tavoloN: t?.n, importo: due,
              guest: { hasApp: true, nome: 'Marco', email: 'marco@email.it', tel: '+39 333 1234567' },
            })}><I.Receipt s={16} c="#fff"/> Invia ricevuta</Btn>
            <Btn variant="secondary" full onClick={() => nav.reset({ s: 'sala' })}>Torna in sala</Btn>
          </div>
        </div>
      ) : (
        <div style={{ padding: '16px' }}>
          {/* Quota contante + (misto) resto su carta / (normale) cambio */}
          <div style={{ background: '#fff', borderRadius: ST.R_LG, padding: 16, boxShadow: ST.SH_SM, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13, color: ST.MUTED, fontWeight: 600 }}>{misto ? 'In contanti' : 'Ricevuto'}</span>
              <span style={{ fontSize: 26, fontWeight: 800, color: ricevuto != null ? ST.TEXT : ST.MUTED_3, letterSpacing: -0.4 }}>
                €{(ricevuto || 0).toFixed(2)}
              </span>
            </div>
            <div style={{ height: 1, background: ST.BORDER_SOFT, margin: '12px 0' }}/>
            {misto ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: ST.MUTED, fontWeight: 600 }}>
                  <I.Card s={15} c={ST.MUTED}/> Resto su carta
                </span>
                <span style={{ fontSize: 20, fontWeight: 800, color: restoCarta > 0 ? ST.PINK_DARK : ST.MUTED_3, letterSpacing: -0.3 }}>
                  €{restoCarta.toFixed(2)}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: ST.MUTED, fontWeight: 600 }}>Resto</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: ok ? ST.PINK_DARK : ST.MUTED_3, letterSpacing: -0.3 }}>
                  €{(ok ? resto : 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Tagli rapidi */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {!misto && <button onClick={() => pickChip(due)} style={chipTaglio(daChip && ricevuto === due)}>Esatto</button>}
            {tagli.map(v => (
              <button key={v} onClick={() => pickChip(v)} style={chipTaglio(daChip && ricevuto === v)}>€{v}</button>
            ))}
          </div>

          {/* Tastierino (euro interi) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {['1','2','3','4','5','6','7','8','9','','0','back'].map((d, i) => {
              if (d === '') return <div key={i}/>;
              return (
                <button key={i} onClick={() => onKey(d)} style={{
                  height: 56, borderRadius: ST.R_MD, background: '#fff',
                  border: `1px solid ${ST.BORDER_SOFT}`, color: ST.TEXT,
                  fontSize: 22, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{d === 'back' ? '⌫' : d}</button>
              );
            })}
          </div>

          <Btn variant="primary" full disabled={!ok} onClick={onConferma}
               style={{ marginTop: 14, height: 52 }}>
            {misto && restoCarta > 0 ? `Continua · €${restoCarta.toFixed(2)} su carta` : 'Conferma incasso'}
          </Btn>
        </div>
      )}
    </div>
  );
}

// Stile chip taglio rapido contanti
function chipTaglio(active) {
  return {
    flex: 1, minWidth: 64, height: 40, borderRadius: ST.R_PILL,
    border: `1.5px solid ${active ? ST.PINK_DARK : ST.BORDER}`,
    background: active ? ST.PINK_SOFT : '#fff',
    color: active ? ST.PINK_DARK : ST.TEXT,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  };
}

// Legacy stubs (in caso di rotte residue dalla vecchia UX)
function ScreenPagamentoMetodo({ nav, importo, tavoloId }) {
  // Salta direttamente a Tap to Pay
  useEffectP(() => { nav.replace({ s: 'pagamento-carta', importo, tavoloId }); }, []);
  return null;
}
function ScreenPagamentoQR({ nav, importo, tavoloId }) {
  useEffectP(() => { nav.replace({ s: 'pagamento-carta', importo, tavoloId }); }, []);
  return null;
}

Object.assign(window, { ScreenPagamentoSplit, ScreenPagamentoMetodo, ScreenPagamentoCarta, ScreenPagamentoQR, ScreenPagamentoContanti });
