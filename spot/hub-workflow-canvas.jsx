// Hubble · Workflow — il canvas ad albero.
//
// Un workflow si legge dall'alto in basso come una ricetta, finché non
// incontra una CONDIZIONE: lì la colonna si apre in più corsie affiancate, una
// per ramo, e ogni corsia continua per conto suo — anche con altre condizioni
// dentro. È un albero disegnato in verticale, non un grafo libero: un grafo
// libero è più potente e diventa illeggibile alla quinta scatola.
//
// La cosa che conta davvero è che un ramo dice QUANDO si prende. Ha dei
// criteri — le stesse frasi proprietà/operatore/valore dei filtri — e una
// congiunzione: TUTTE vere (E) oppure ne basta UNA (O). L'ultimo ramo è
// «altrimenti»: tocca a lui quello che non è finito da nessun'altra parte, e
// non ha criteri perché la sua regola è proprio non averne.

const { useState: useStateWc, useRef: useRefWc } = React;

// ─── Il percorso di un nodo nell'albero ─────────────────────────────────────
// Un indirizzo tipo [2, 'r3', 1] vuol dire: nodo 2 del tronco, ramo r3, nodo 1
// di quel ramo. Serve per modificare in profondità senza mutare niente.
function wcLeggi(nodi, path) {
  let lista = nodi, nodo = null;
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    if (typeof p === 'number') { nodo = lista[p]; lista = null; }
    else { const r = (nodo.rami || []).find(x => x.id === p); if (!r) return null; lista = r.nodi; nodo = r; }
  }
  return nodo;
}
function wcMappa(nodi, path, fn) {
  if (path.length === 0) return fn(nodi);
  const [testa, ...resto] = path;
  if (typeof testa === 'number') {
    return nodi.map((n, i) => i !== testa ? n
      : (resto.length === 0 ? fn(n) : Object.assign({}, n, {
          rami: (n.rami || []).map(r => r.id !== resto[0] ? r
            : Object.assign({}, r, resto.length === 1 ? fn(r) : { nodi: wcMappa(r.nodi, resto.slice(1), fn) })),
        })));
  }
  return nodi;
}
const wcUguali = (a, b) => a && b && a.length === b.length && a.every((x, i) => x === b[i]);

// ─── Il nodo disegnato ──────────────────────────────────────────────────────
function WcNodo({ nodo, path, selezionato, onClick, primo }) {
  const d = HUB_WF_NODI[nodo.tipo] || HUB_WF_NODI.script;
  const Ic = BuIcons[d.icona];
  const tinta = ADM[d.color] || ADM.INK;
  const soft = ADM[d.color + '_SOFT'] || ADM.NEUTRAL_SOFT;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {!primo && <span aria-hidden="true" style={{ width: 2, height: 18, background: ADM.BORDER }}/>}
      <button onClick={(e) => { e.stopPropagation(); onClick(path); }} className="hub-card" style={{
        width: '100%', maxWidth: 400, display: 'flex', alignItems: 'flex-start', gap: 11,
        padding: '11px 13px', textAlign: 'left', fontFamily: 'inherit',
        border: `1.5px solid ${selezionato ? ADM.PINK : ADM.BORDER}`,
        borderRadius: 12, background: '#fff',
        boxShadow: selezionato ? `0 10px 26px -12px ${ADM.HUB_GLOW}` : ADM.CARD_SHADOW,
      }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', background: soft, color: tinta }}>
          <Ic size={15}/>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 10.8, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: tinta }}>{d.label}</span>
          <span style={{ display: 'block', fontSize: 13.6, fontWeight: 600, color: ADM.TEXT, marginTop: 2, lineHeight: 1.4 }}>{nodo.testo || '—'}</span>
        </span>
      </button>
    </div>
  );
}

// ─── Una condizione con le sue corsie ───────────────────────────────────────
function WcCondizione({ nodo, path, sel, onSel, onAggiungiRamo }) {
  const rami = nodo.rami || [];
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <WcNodo nodo={nodo} path={path} selezionato={wcUguali(sel, path)} onClick={onSel}/>

      {/* la barra orizzontale da cui scendono le corsie */}
      <span aria-hidden="true" style={{ width: 2, height: 16, background: ADM.BORDER }}/>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, justifyContent: 'center' }}>
        {rami.map((r, i) => {
          const attivo = wcUguali(sel, [...path, r.id]);
          return (
            <div key={r.id} style={{ flex: '0 0 auto', width: 244, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* l'etichetta del ramo: dice il nome E la regola per prenderlo */}
              <button onClick={(e) => { e.stopPropagation(); onSel([...path, r.id]); }} style={{
                width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                border: `1.5px solid ${attivo ? ADM.PINK : r.altrimenti ? ADM.BORDER : ADM.WARN_SOFT}`,
                background: attivo ? ADM.PINK_BG_SOFT : r.altrimenti ? ADM.PANEL_SOFT : '#FFFCF3',
                borderRadius: 11, padding: '9px 11px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: r.criteri && r.criteri.length ? 6 : 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 4,
                    background: r.altrimenti ? ADM.NEUTRAL_SOFT : ADM.WARN_SOFT,
                    color: r.altrimenti ? ADM.MUTED : '#8A5205',
                  }}>{r.altrimenti ? 'ALTRIMENTI' : i === 0 ? 'SE' : 'ALTRIMENTI SE'}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13.2, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
                  {!r.altrimenti && (r.criteri || []).length > 1 && (
                    <span style={{
                      fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 999,
                      background: r.congiunzione === 'O' ? ADM.INFO_SOFT : ADM.OK_SOFT,
                      color: r.congiunzione === 'O' ? ADM.INFO : ADM.OK,
                    }}>{r.congiunzione === 'O' ? 'basta UNA' : 'TUTTE'}</span>
                  )}
                </div>
                {(r.criteri || []).map((c, j) => (
                  <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginTop: 3 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: ADM.MUTED_SOFT, minWidth: 16 }}>
                      {j === 0 ? '' : (r.congiunzione === 'O' ? 'O' : 'E')}
                    </span>
                    <span style={{ fontSize: 12.2, color: ADM.MUTED, lineHeight: 1.4 }}>{hubDescriviFiltro(c)}</span>
                  </div>
                ))}
                {r.altrimenti && <div style={{ fontSize: 12.2, color: ADM.MUTED, lineHeight: 1.4 }}>Tutti quelli che non rientrano sopra.</div>}
              </button>

              <div style={{ width: '100%', paddingTop: 4 }}>
                {(r.nodi || []).map((n, k) => (
                  n.tipo === 'condizione'
                    ? <WcCondizione key={k} nodo={n} path={[...path, r.id, k]} sel={sel} onSel={onSel} onAggiungiRamo={onAggiungiRamo}/>
                    : <WcNodo key={k} nodo={n} path={[...path, r.id, k]} selezionato={wcUguali(sel, [...path, r.id, k])} onClick={onSel}/>
                ))}
                {(r.nodi || []).length === 0 && (
                  <div style={{
                    marginTop: 12, padding: '14px 12px', borderRadius: 11, border: `1px dashed ${ADM.BORDER}`,
                    fontSize: 12.4, color: ADM.MUTED_SOFT, textAlign: 'center', background: '#fff',
                  }}>Ramo vuoto — chi ci finisce esce dal workflow</div>
                )}
              </div>
            </div>
          );
        })}

        <button onClick={(e) => { e.stopPropagation(); onAggiungiRamo(path); }} title="Aggiungi un ramo"
          style={{
            alignSelf: 'flex-start', marginTop: 2, width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            border: `1px dashed ${ADM.BORDER}`, background: '#fff', cursor: 'pointer',
            color: ADM.MUTED, display: 'grid', placeItems: 'center',
          }}><BuIcons.plus size={16}/></button>
      </div>
    </div>
  );
}

// ─── L'ispettore di un ramo: qui si scrive la logica ────────────────────────
function WcIspettoreRamo({ ramo, onCambia, onElimina }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', background: ADM.WARN_SOFT, color: ADM.WARN }}>
          <BuIcons.branch size={14}/>
        </span>
        <span style={{ flex: 1, fontSize: 14.2, fontWeight: 700, color: ADM.TEXT }}>Il ramo</span>
      </div>

      <HubCampo label="Come si chiama" nota="È l'etichetta che si legge sul canvas.">
        <HubInput valore={ramo.label} onCambia={v => onCambia(Object.assign({}, ramo, { label: v }))} placeholder="es. Ha aperto la mail"/>
      </HubCampo>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 11, borderRadius: 10, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}`, cursor: 'pointer' }}>
        <AdmSwitch size="sm" checked={!!ramo.altrimenti} onChange={v => onCambia(Object.assign({}, ramo, { altrimenti: v, criteri: v ? [] : ramo.criteri }))}/>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 13.4, fontWeight: 700, color: ADM.TEXT }}>È il ramo «altrimenti»</span>
          <span style={{ display: 'block', fontSize: 12.2, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>
            Prende tutti quelli che non sono rientrati nei rami sopra. Non ha criteri: la sua regola è non averne.
          </span>
        </span>
      </label>

      {!ramo.altrimenti && (
        <React.Fragment>
          <HubCampo label="Quando si prende questo ramo">
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(120,120,128,0.12)', borderRadius: 9 }}>
              {[{ id: 'E', l: 'Tutte vere' }, { id: 'O', l: 'Ne basta una' }].map(o => {
                const on = (ramo.congiunzione || 'E') === o.id;
                return (
                  <button key={o.id} onClick={() => onCambia(Object.assign({}, ramo, { congiunzione: o.id }))} style={{
                    flex: 1, padding: '6px 8px', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 12.8, fontWeight: 700, background: on ? '#fff' : 'transparent',
                    color: on ? ADM.TEXT : ADM.MUTED,
                    boxShadow: on ? '0 1px 3px rgba(15,17,21,0.10)' : 'none',
                  }}>{o.l}</button>
                );
              })}
            </div>
          </HubCampo>

          {/* Gli stessi identici filtri della rubrica: una condizione di
              workflow e un criterio di elenco sono la stessa frase. */}
          <HubFiltri righe={CONTATTI} includi={ramo.criteri || []}
            onIncludi={v => onCambia(Object.assign({}, ramo, { criteri: v }))}/>
        </React.Fragment>
      )}

      <button onClick={onElimina} style={{
        marginTop: 4, padding: '8px 10px', borderRadius: 9, border: `1px solid ${ADM.BORDER}`,
        background: '#fff', color: ADM.DANGER, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>Elimina il ramo e i suoi passi</button>
    </div>
  );
}

window.WcNodo = WcNodo;
window.WcCondizione = WcCondizione;
window.WcIspettoreRamo = WcIspettoreRamo;
window.wcLeggi = wcLeggi;
window.wcMappa = wcMappa;
window.wcUguali = wcUguali;
