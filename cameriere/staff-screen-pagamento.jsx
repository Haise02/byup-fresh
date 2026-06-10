// byup Staff — Pagamento (split + tap-to-pay + ricevuta)

const { useState: useStateP, useEffect: useEffectP } = React;

// ═══════════════════════════════════════════════════════════
// PAGAMENTO STEP 1 — Selezione cosa pagare (split)
// UX rivista: header compatto, selezione clienti con dropdown,
// totale e CTA pinnati in basso.
// ═══════════════════════════════════════════════════════════
function ScreenPagamentoSplit({ nav, openModal, tavoloId }) {
  const t = TAVOLI.find(x => x.id === tavoloId) || TAVOLI[0];
  const ordini = ORDINE_T23;
  const totale = ordini.reduce((s, o) => s + o.prezzo * o.qty, 0);

  const [sel, setSel] = useStateP({});
  const [expanded, setExpanded] = useStateP({});

  const { n: selN, total: selTotal } = (() => {
    let n = 0, total = 0;
    ordini.forEach(o => { if (sel[o.id]) { n++; total += o.prezzo * o.qty; } });
    return { n, total };
  })();

  const allSelected = ordini.length > 0 && ordini.every(o => sel[o.id]);

  const toggleAll = () => {
    if (allSelected) setSel({});
    else setSel(Object.fromEntries(ordini.map(o => [o.id, true])));
  };

  // Totale per cliente
  const totalForCliente = (c) => c.piatti.reduce((s, oid) => {
    const o = ordini.find(x => x.id === oid);
    return s + (o ? o.prezzo * o.qty : 0);
  }, 0);

  // Stato selezione di un cliente: 'all' | 'some' | 'none'
  const clienteSelState = (c) => {
    if (c.piatti.length === 0) return 'none';
    const sels = c.piatti.filter(oid => sel[oid]);
    if (sels.length === 0) return 'none';
    if (sels.length === c.piatti.length) return 'all';
    return 'some';
  };

  const toggleCliente = (c) => {
    const state = clienteSelState(c);
    const next = { ...sel };
    if (state === 'all') c.piatti.forEach(oid => { delete next[oid]; });
    else c.piatti.forEach(oid => { next[oid] = true; });
    setSel(next);
  };

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 160 }}>
      {/* Header compatto */}
      <div style={{ background: '#fff', padding: 'calc(16px + env(safe-area-inset-top)) 16px 16px', borderBottom: `1px solid ${ST.BORDER_SOFT}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Close s={18}/></button>
          <div style={{ flex: 1, textAlign:'center', minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Tavolo {t.n} · Conto €{totale}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ST.TEXT, marginTop: 2 }}>
              Cosa pagano?
            </div>
          </div>
          <div style={{ width: 40 }}/>
        </div>
      </div>

      {/* ORDINI CLIENTI */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>
          Ordini clienti
        </div>
        <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
          {CLIENTI_T23.filter(c => c.piatti.length > 0 || !c.id.startsWith('g')).map((c, i, arr) => {
            const state = clienteSelState(c);
            const exp = expanded[c.id];
            const cTot = totalForCliente(c);
            return (
              <div key={c.id} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${ST.BORDER_SOFT}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px' }}>
                  {/* Checkbox cliente (tri-state) */}
                  <span onClick={() => toggleCliente(c)} style={{
                    width: 24, height: 24, borderRadius: 7,
                    border: `2px solid ${state !== 'none' ? ST.PINK_DARK : ST.MUTED_3}`,
                    background: state === 'all' ? ST.PINK_DARK
                              : state === 'some' ? ST.PINK_SOFT
                              : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}>
                    {state === 'all' && <I.Check s={14} c="#fff"/>}
                    {state === 'some' && <span style={{ width: 10, height: 2, background: ST.PINK_DARK, borderRadius: 1 }}/>}
                  </span>

                  {/* Avatar/iniziale */}
                  <div style={{
                    width: 34, height: 34, borderRadius: ST.R_PILL,
                    background: `linear-gradient(135deg, ${ST.PINK} 0%, ${ST.PINK_DARK} 100%)`,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>{c.nome[0]}</div>

                  <div style={{ flex: 1, cursor: 'pointer' }}
                       onClick={() => setExpanded({ ...expanded, [c.id]: !exp })}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ST.TEXT }}>{c.nome}</div>
                    <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>
                      {c.piatti.length} piatti · €{cTot}
                    </div>
                  </div>

                  <button onClick={() => setExpanded({ ...expanded, [c.id]: !exp })} style={{
                    width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: exp ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms',
                  }}><I.ChevDown s={16} c={ST.MUTED}/></button>
                </div>

                {/* Dropdown piatti del cliente — selezione singola */}
                {exp && (
                  <div style={{ background: ST.SURF, padding: '6px 14px 12px 60px' }}>
                    {c.piatti.length === 0 && (
                      <div style={{ fontSize: 12, color: ST.MUTED, padding: '8px 0' }}>
                        Nessun piatto associato
                      </div>
                    )}
                    {c.piatti.map(oid => {
                      const o = ordini.find(x => x.id === oid);
                      if (!o) return null;
                      const checked = !!sel[oid];
                      return (
                        <div key={oid} onClick={() => setSel({ ...sel, [oid]: !checked })} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                          borderTop: `1px solid ${ST.BORDER_SOFT}`, cursor: 'pointer',
                        }}>
                          <span style={{
                            width: 20, height: 20, borderRadius: 6,
                            border: `2px solid ${checked ? ST.PINK_DARK : ST.MUTED_3}`,
                            background: checked ? ST.PINK_DARK : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>{checked && <I.Check s={11} c="#fff"/>}</span>
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

      {/* ORDINI TAVOLO */}
      <div style={{ padding: '18px 16px 0' }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 4px 8px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Ordini tavolo
          </div>
          <button onClick={toggleAll} style={{
            background: 'transparent', border: 'none',
            color: ST.PINK_DARK, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily:'inherit', padding: 0,
          }}>
            {allSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
          </button>
        </div>
        <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
          {ordini.map((o, i) => (
            <div key={o.id} onClick={() => setSel({ ...sel, [o.id]: !sel[o.id] })} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderBottom: i < ordini.length - 1 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
              cursor: 'pointer',
              background: sel[o.id] ? ST.PINK_BG : '#fff',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                border: `2px solid ${sel[o.id] ? ST.PINK_DARK : ST.MUTED_3}`,
                background: sel[o.id] ? ST.PINK_DARK : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{sel[o.id] && <I.Check s={12} c="#fff"/>}</span>
              <span style={{ width: 28, fontSize: 12, fontWeight: 800, color: ST.MUTED }}>{o.qty}×</span>
              <span style={{ flex: 1, fontSize: 13.5, color: ST.TEXT, fontWeight: 600 }}>{o.nome}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: ST.TEXT }}>€{o.prezzo * o.qty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA — Prosegui */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 34, zIndex: 30,
        padding: '14px 16px',
        background: 'linear-gradient(180deg, transparent 0%, #fff 30%)',
      }}>
        <div style={{
          background: '#fff', borderRadius: ST.R_LG, padding: 14,
          boxShadow: ST.SH_LG, border: `1px solid ${ST.BORDER_SOFT}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'baseline', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: ST.MUTED, fontWeight: 600 }}>Da incassare</div>
              <div style={{ fontSize: 11, color: ST.MUTED_2, marginTop: 2 }}>
                {selN === 0 ? 'Nessun piatto' : `${selN} piatto${selN > 1 ? 'i' : ''} su ${ordini.length}`}
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.4 }}>€{selTotal.toFixed(2)}</div>
          </div>
          <button
            onClick={() => nav.push({ s: 'pagamento-carta', tavoloId, importo: selTotal })}
            disabled={selN === 0}
            style={{
              width: '100%', height: 52, borderRadius: ST.R_PILL, border: 'none',
              background: selN === 0 ? ST.MUTED_3 : ST.PINK_DARK, color: '#fff',
              fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              cursor: selN === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: selN === 0 ? 'none' : ST.SH_FAB,
            }}
          ><I.Card s={18} c="#fff"/> Tap to Pay · €{selTotal.toFixed(2)}</button>
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
          <div style={{ fontSize: 10.5, color: ST.MUTED }}>Tavolo {t?.n} · {STAFF_USER.nome}</div>
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

Object.assign(window, { ScreenPagamentoSplit, ScreenPagamentoMetodo, ScreenPagamentoCarta, ScreenPagamentoQR });
