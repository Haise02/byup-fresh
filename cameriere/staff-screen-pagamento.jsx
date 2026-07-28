// byup Staff — Conto del tavolo (sola consultazione)

const { useState: useStateP } = React;

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
                            background: ST.RED_SOFT, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}><I.Trash s={14} c={ST.RED}/></button>
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
                      background: ST.RED_SOFT, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><I.Trash s={15} c={ST.RED}/></button>
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

Object.assign(window, { ScreenPagamentoSplit });
