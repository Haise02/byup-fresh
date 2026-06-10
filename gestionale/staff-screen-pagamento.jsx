// byup Staff — Pagamento (split + carta + QR consumer)

const { useState: useStateP, useEffect: useEffectP } = React;

// ═══════════════════════════════════════════════════════════
// PAGAMENTO STEP 1 — Selezione cosa pagare (split)
// ═══════════════════════════════════════════════════════════
function ScreenPagamentoSplit({ nav, openModal, tavoloId }) {
  const t = TAVOLI.find(x => x.id === tavoloId) || TAVOLI[0];
  const ordini = ORDINE_T23;
  const totale = ordini.reduce((s, o) => s + o.prezzo * o.qty, 0);

  const [sel, setSel] = useStateP({});
  const [expanded, setExpanded] = useStateP({});

  // Calcola totale selezionato
  const calcSel = () => {
    let n = 0;
    let total = 0;
    ordini.forEach(o => {
      if (sel[o.id]) {
        n++;
        total += o.prezzo * o.qty;
      }
    });
    return { n, total };
  };
  const { n: selN, total: selTotal } = calcSel();
  const allSelected = ordini.every(o => sel[o.id]);

  const toggleAll = () => {
    if (allSelected) setSel({});
    else setSel(Object.fromEntries(ordini.map(o => [o.id, true])));
  };

  // Group cliente CLIENTI_T23
  const totalForCliente = (c) => c.piatti.reduce((s, oid) => {
    const o = ordini.find(x => x.id === oid);
    return s + (o ? o.prezzo * o.qty : 0);
  }, 0);

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 130 }}>
      <div style={{ background: '#fff', padding: '54px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Close s={18}/></button>
          <button onClick={toggleAll} style={{
            height: 36, padding: '0 14px', borderRadius: ST.R_PILL,
            border: `1.5px solid ${ST.BORDER}`, background: '#fff',
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>{allSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}</button>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Tavolo {t.n} · Totale conto €{totale}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.4, marginTop: 4 }}>
          Cosa devono pagare?
        </div>
        <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 6, lineHeight: 1.5 }}>
          Seleziona i piatti da incassare, oppure dividi per cliente.
        </div>
      </div>

      {/* Per cliente */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>
          Per cliente
        </div>
        <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
          {CLIENTI_T23.map((c, i) => {
            const cTot = totalForCliente(c);
            const exp = expanded[c.id];
            return (
              <div key={c.id} style={{ borderBottom: i < CLIENTI_T23.length - 1 ? `1px solid ${ST.BORDER_SOFT}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                  <span onClick={() => {
                    const next = { ...sel };
                    c.piatti.forEach(oid => { next[oid] = !sel[c.piatti[0]]; });
                    setSel(next);
                  }} style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: `2px solid ${c.piatti.length > 0 && c.piatti.every(oid => sel[oid]) ? ST.PINK_DARK : ST.MUTED_3}`,
                    background: c.piatti.length > 0 && c.piatti.every(oid => sel[oid]) ? ST.PINK_DARK : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}>
                    {c.piatti.length > 0 && c.piatti.every(oid => sel[oid]) && <I.Check s={12} c="#fff"/>}
                  </span>
                  <div style={{ flex: 1 }} onClick={() => setExpanded({ ...expanded, [c.id]: !exp })}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ST.TEXT }}>
                      {c.id.startsWith('g') ? c.nome : `Piatti di ${c.nome}`}
                    </div>
                    {!exp && (
                      <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>
                        {c.piatti.length === 0 ? 'Nessun piatto' : `${c.piatti.length} piatti · €${cTot}`}
                      </div>
                    )}
                  </div>
                  <I.ChevDown s={14} c={ST.MUTED} style={{ transform: exp ? 'rotate(0)' : 'rotate(-90deg)', cursor: 'pointer' }} onClick={() => setExpanded({ ...expanded, [c.id]: !exp })}/>
                </div>
                {exp && (
                  <div style={{ padding: '0 14px 12px 46px' }}>
                    {c.piatti.length === 0 && (
                      <div style={{ fontSize: 12, color: ST.MUTED, padding: '4px 0 8px' }}>
                        Nessun piatto associato
                      </div>
                    )}
                    {c.piatti.map(oid => {
                      const o = ordini.find(x => x.id === oid);
                      if (!o) return null;
                      return (
                        <div key={oid} onClick={() => setSel({ ...sel, [oid]: !sel[oid] })} style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                          borderTop: `1px solid ${ST.BORDER_SOFT}`, cursor: 'pointer',
                        }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: 5,
                            border: `2px solid ${sel[oid] ? ST.PINK_DARK : ST.MUTED_3}`,
                            background: sel[oid] ? ST.PINK_DARK : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>{sel[oid] && <I.Check s={10} c="#fff"/>}</span>
                          <span style={{ flex: 1, fontSize: 12.5, color: ST.TEXT_SOFT }}>{o.qty}× {o.nome}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: ST.TEXT }}>€{o.prezzo * o.qty}</span>
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

      {/* Ordini aggiunti (extra non assegnati) */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>
          Tutti i piatti
        </div>
        <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
          {ordini.map((o, i) => (
            <div key={o.id} onClick={() => setSel({ ...sel, [o.id]: !sel[o.id] })} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderBottom: i < ordini.length - 1 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
              cursor: 'pointer',
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

      {/* Bottom */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 34, zIndex: 30,
        padding: '14px 16px',
        background: 'linear-gradient(180deg, transparent 0%, #fff 30%)',
      }}>
        <div style={{
          background: '#fff', borderRadius: ST.R_LG, padding: 12,
          boxShadow: ST.SH_LG, border: `1px solid ${ST.BORDER_SOFT}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: ST.MUTED }}>{selN} piatto/i selezionati</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>€{selTotal}</div>
          </div>
          <button onClick={() => nav.push({ s: 'pagamento-metodo', tavoloId, importo: selTotal })} disabled={selN === 0} style={{
            width: '100%', height: 50, borderRadius: ST.R_PILL, border: 'none',
            background: selN === 0 ? ST.MUTED_3 : ST.PINK_DARK, color: '#fff',
            fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit',
            cursor: selN === 0 ? 'not-allowed' : 'pointer',
          }}>Prosegui al pagamento</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGAMENTO STEP 2 — Scelta metodo
// ═══════════════════════════════════════════════════════════
function ScreenPagamentoMetodo({ nav, importo, tavoloId }) {
  const t = TAVOLI.find(x => x.id === tavoloId);
  const metodi = [
    { id: 'tap', icon: <I.Card s={22} c={ST.TEXT}/>, label: 'Carta · Tap to Pay', sub: 'Avvicina la carta al telefono', go: 'pagamento-carta', primary: true },
    { id: 'qr', icon: <I.QR s={22} c={ST.TEXT}/>, label: 'App byup cliente', sub: 'Mostra QR code da scansionare', go: 'pagamento-qr' },
    { id: 'cash', icon: <span style={{ fontSize: 22 }}>💵</span>, label: 'Contanti', sub: 'Registra pagamento manuale', go: 'pagamento-contanti' },
  ];

  return (
    <div style={{ background: ST.BG, minHeight: '100%' }}>
      <div style={{ background: '#fff', padding: '54px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Back s={18}/></button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Tavolo {t?.n} · Da incassare
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5, marginTop: 2 }}>
              €{importo?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 4px 4px' }}>
          Metodo di pagamento
        </div>
        {metodi.map(m => (
          <button key={m.id} onClick={() => nav.push({ s: m.go, importo, tavoloId })} style={{
            background: '#fff', borderRadius: ST.R_LG,
            padding: 16, border: m.primary ? `1.5px solid ${ST.PINK_DARK}` : `1px solid ${ST.BORDER_SOFT}`,
            boxShadow: m.primary ? ST.SH_MD : ST.SH_SM,
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            position: 'relative',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: ST.R_MD,
              background: m.primary ? ST.PINK_SOFT : ST.SURF_ALT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: ST.TEXT }}>{m.label}</div>
              <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 2 }}>{m.sub}</div>
            </div>
            {m.primary && (
              <span style={{
                position: 'absolute', top: 14, right: 14,
                fontSize: 10, fontWeight: 800, color: ST.PINK_DARK,
                padding: '2px 7px', background: ST.PINK_SOFT, borderRadius: ST.R_PILL,
                letterSpacing: 0.4,
              }}>SUGGERITO</span>
            )}
            <I.ChevRight s={16} c={ST.MUTED}/>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGAMENTO CARTA — Tap to Pay
// ═══════════════════════════════════════════════════════════
function ScreenPagamentoCarta({ nav, openModal, importo, tavoloId }) {
  const [step, setStep] = useStateP('waiting'); // waiting | reading | success
  const t = TAVOLI.find(x => x.id === tavoloId);

  useEffectP(() => {
    if (step === 'waiting') {
      const t1 = setTimeout(() => setStep('reading'), 2400);
      return () => clearTimeout(t1);
    }
    if (step === 'reading') {
      const t2 = setTimeout(() => setStep('success'), 1600);
      return () => clearTimeout(t2);
    }
  }, [step]);

  return (
    <div style={{ background: ST.WINE, minHeight: '100%', color: '#fff', position: 'relative' }}>
      <div style={{ padding: '54px 16px 16px' }}>
        <button onClick={() => nav.pop()} style={{
          width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
          background: 'rgba(255,255,255,0.12)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.Close s={18} c="#fff"/></button>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px 24px', textAlign: 'center', minHeight: 'calc(100% - 250px)',
      }}>
        {/* NFC waves */}
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
            {step === 'success'
              ? <I.Check s={32} c="#fff"/>
              : <I.Wifi s={36} c="#fff"/>}
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          {step === 'waiting' && 'In attesa carta'}
          {step === 'reading' && 'Lettura in corso'}
          {step === 'success' && 'Pagamento completato'}
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, opacity: 0.9, lineHeight: 1.4, marginBottom: 24 }}>
          {step === 'waiting' && 'Avvicina la carta al telefono'}
          {step === 'reading' && 'Tieni la carta ferma…'}
          {step === 'success' && '✓ Transazione approvata'}
        </div>

        {/* Importo card */}
        <div style={{
          background: 'rgba(255,255,255,0.95)', borderRadius: ST.R_LG,
          padding: '20px 28px', color: ST.TEXT, minWidth: 240,
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: ST.R_MD,
            background: `linear-gradient(135deg, ${ST.PINK} 0%, ${ST.PINK_DARK} 100%)`,
            margin: '0 auto 8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 22, fontWeight: 800,
          }}>b</div>
          <div style={{ fontSize: 11, color: ST.MUTED, fontWeight: 600 }}>Trattoria del Borgo</div>
          <div style={{ fontSize: 11, color: ST.MUTED }}>Tavolo {t?.n} · {STAFF_USER.nome}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5, marginTop: 8 }}>
            €{importo?.toFixed(2)}
          </div>
        </div>

        {step === 'success' && (
          <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
            <button onClick={() => nav.reset({ s: 'sala' })} style={{
              padding: '12px 20px', borderRadius: ST.R_PILL,
              background: '#fff', color: ST.WINE, border: 'none',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>Torna in sala</button>
            <button onClick={() => openModal({ kind: 'success', text: 'Ricevuta inviata' })} style={{
              padding: '12px 20px', borderRadius: ST.R_PILL,
              background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Invia ricevuta</button>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 60, padding: '0 16px',
      }}>
        {step !== 'success' && (
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

// QR per app cliente
function ScreenPagamentoQR({ nav, importo, tavoloId }) {
  const t = TAVOLI.find(x => x.id === tavoloId);
  return (
    <div style={{ background: ST.BG, minHeight: '100%' }}>
      <div style={{ background: '#fff', padding: '54px 16px 16px' }}>
        <button onClick={() => nav.pop()} style={{
          width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
          background: ST.SURF_ALT, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.Back s={18}/></button>
      </div>
      <div style={{ padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Tavolo {t?.n} · Importo
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.6, marginTop: 4 }}>
          €{importo?.toFixed(2)}
        </div>

        <div style={{
          margin: '32px auto', width: 220, height: 220,
          background: '#fff', borderRadius: ST.R_LG,
          padding: 20, boxShadow: ST.SH_LG,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Mock QR */}
          <svg viewBox="0 0 32 32" width="180" height="180">
            {Array.from({ length: 24 }).map((_, i) => {
              const r = Math.floor(i / 4);
              const c = i % 4;
              return null;
            })}
            {/* random-looking pattern */}
            <rect width="32" height="32" fill="#fff"/>
            <rect x="0" y="0" width="9" height="9" fill="#0F1115"/>
            <rect x="2" y="2" width="5" height="5" fill="#fff"/>
            <rect x="3" y="3" width="3" height="3" fill="#0F1115"/>
            <rect x="23" y="0" width="9" height="9" fill="#0F1115"/>
            <rect x="25" y="2" width="5" height="5" fill="#fff"/>
            <rect x="26" y="3" width="3" height="3" fill="#0F1115"/>
            <rect x="0" y="23" width="9" height="9" fill="#0F1115"/>
            <rect x="2" y="25" width="5" height="5" fill="#fff"/>
            <rect x="3" y="26" width="3" height="3" fill="#0F1115"/>
            {/* random dots */}
            {[10,12,14,16,18,20,11,13,15,17,19,21].map((x,i)=>[10,11,12,14,15,17,18,20,22,24,26].map((y,j)=>{
              const seed=(x*7+y*13)%5;
              return seed<2?<rect key={`${i}-${j}`} x={x} y={y} width="1" height="1" fill="#0F1115"/>:null;
            }))}
            {/* center logo */}
            <rect x="13" y="13" width="6" height="6" fill="#fff"/>
            <rect x="14" y="14" width="4" height="4" fill={ST.PINK_DARK}/>
          </svg>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: ST.TEXT }}>
          Scansiona con app byup
        </div>
        <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 4, lineHeight: 1.5 }}>
          Il cliente apre la sua app byup e inquadra il QR per pagare in autonomia.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenPagamentoSplit, ScreenPagamentoMetodo, ScreenPagamentoCarta, ScreenPagamentoQR });
