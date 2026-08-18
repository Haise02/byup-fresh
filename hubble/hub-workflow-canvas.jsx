// Hubble · Workflow — il canvas ad albero.
//
// Un workflow si legge dall'alto in basso come una ricetta, finché non
// incontra una CONDIZIONE: lì la colonna si apre in più corsie affiancate, una
// per ramo, e ogni corsia continua per conto suo — anche con altre condizioni
// dentro. È un albero disegnato in verticale, non un grafo libero: un grafo
// libero è più potente e diventa illeggibile alla quinta scatola.
//
// La cosa che conta davvero è che un ramo dice QUANDO si prende, e «quando»
// non è solo com'è fatto il contatto: è anche che cosa ha fatto (ha aperto,
// non ha cliccato entro tre giorni, è entrato in un elenco) e com'è andato il
// passo prima. Quella logica sta in `quando` e la si scrive in hub-workflow-
// regole.jsx; qui si disegna. L'ultimo ramo può essere «altrimenti»: prende
// quello che non è rientrato altrove, e non ha regole perché la sua regola è
// non averne.
//
// Il bottone per aggiungere un ramo è SUL CANVAS, in fondo al ventaglio, con
// scritto che cosa fa. Prima era un quadratino con un «+» e nessuno lo trovava:
// la ramificazione è l'operazione centrale di questa pagina, non una preferenza
// nascosta in un ispettore.

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

// Che cosa si legge sotto il titolo di un passo. Per l'attesa non è il testo
// scritto a mano ma la frase generata dalla configurazione: così il canvas non
// può mentire su quanto si aspetta.
function wcSottotitolo(nodo) {
  if (nodo.tipo === 'attesa') {
    const a = hubNodoAttesa(nodo);
    if (a) return hubDescriviAttesa(a);
  }
  return nodo.testo || '—';
}

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
          <span style={{ display: 'block', fontSize: 13.6, fontWeight: 600, color: ADM.TEXT, marginTop: 2, lineHeight: 1.4 }}>{wcSottotitolo(nodo)}</span>
        </span>
      </button>
    </div>
  );
}

// ─── L'etichetta di un ramo, sul canvas ─────────────────────────────────────
//
// Deve dire tre cose in poco spazio: quando tocca a lui (SE / ALTRIMENTI SE /
// ALTRIMENTI), come si chiama, e la regola scritta in italiano. La regola non è
// un dettaglio da ispettore: se il canvas non la mostra, per capire il bivio
// bisogna cliccare ogni ramo uno per uno.
function WcEtichettaRamo({ ramo, indice, attivo, onClick }) {
  const q = hubRamoQuando(ramo);
  const alt = q.tipo === 'altrimenti' || ramo.altrimenti;
  const n = hubConteggioRegole(q);
  const gruppi = (q.gruppi || []).filter(g => (g.regole || []).length);
  const vuoto = !alt && n === 0;

  const tinta = alt ? ADM.MUTED : vuoto ? ADM.DANGER : '#8A5205';
  const bordo = attivo ? ADM.PINK : alt ? ADM.BORDER : vuoto ? ADM.DANGER_SOFT : ADM.WARN_SOFT;
  const fondo = attivo ? ADM.PINK_BG_SOFT : alt ? ADM.PANEL_SOFT : vuoto ? '#FFF5F5' : '#FFFCF3';

  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
      border: `1.5px solid ${bordo}`, background: fondo, borderRadius: 11, padding: '9px 11px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 4, flexShrink: 0,
          background: alt ? ADM.NEUTRAL_SOFT : vuoto ? ADM.DANGER_SOFT : ADM.WARN_SOFT, color: tinta,
        }}>{alt ? 'ALTRIMENTI' : indice === 0 ? 'SE' : 'ALTRIMENTI SE'}</span>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.2, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ramo.label}</span>
      </div>

      {alt ? (
        <div style={{ fontSize: 12.2, color: ADM.MUTED, lineHeight: 1.45 }}>Tutti quelli che non rientrano sopra.</div>
      ) : vuoto ? (
        <div style={{ fontSize: 12.2, color: ADM.DANGER, lineHeight: 1.45, fontWeight: 600 }}>Nessuna regola — ci passano tutti. Clicca per scriverle.</div>
      ) : (
        // I gruppi restano visibili come gruppi: appiattirli in un elenco di
        // frasi fa sparire proprio la differenza fra «A e (B o C)» e «(A e B) o C».
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {gruppi.map((g, gi) => (
            <React.Fragment key={g.id || gi}>
              {gi > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ flex: 1, height: 1, background: ADM.BORDER }}/>
                  <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em', color: (q.congiunzione === 'O') ? ADM.INFO : ADM.OK }}>
                    {q.congiunzione === 'O' ? 'OPPURE' : 'E ANCHE'}
                  </span>
                  <span style={{ flex: 1, height: 1, background: ADM.BORDER }}/>
                </div>
              )}
              <div style={{
                borderLeft: gruppi.length > 1 ? `2px solid ${ADM.BORDER}` : 'none',
                paddingLeft: gruppi.length > 1 ? 7 : 0,
              }}>
                {(g.regole || []).map((r, j) => (
                  <div key={j} style={{ display: 'flex', gap: 5, alignItems: 'baseline', marginTop: j === 0 ? 0 : 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: ADM.MUTED_SOFT, minWidth: 13, flexShrink: 0 }}>
                      {j === 0 ? '' : (g.congiunzione === 'O' ? 'O' : 'E')}
                    </span>
                    <span style={{ fontSize: 12, color: ADM.MUTED, lineHeight: 1.4 }}>{hubDescriviRegola(r)}</span>
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </button>
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
        {rami.map((r, i) => (
          <div key={r.id} style={{ flex: '0 0 auto', width: 252, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <WcEtichettaRamo ramo={r} indice={i} attivo={wcUguali(sel, [...path, r.id])}
              onClick={(e) => { e.stopPropagation(); onSel([...path, r.id]); }}/>

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
        ))}

        {/* Il bottone che apre un ramo nuovo: largo quanto una corsia, con
            un'etichetta. È l'azione principale del canvas — nascosta dentro un
            quadratino da 38px non la trovava nessuno. */}
        <button onClick={(e) => { e.stopPropagation(); onAggiungiRamo(path); }} className="hub-card" style={{
          flex: '0 0 auto', alignSelf: 'flex-start', width: 148, padding: '14px 10px',
          borderRadius: 11, border: `1.5px dashed ${ADM.HUB_VIOLA}`, background: '#fff', cursor: 'pointer',
          fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', background: ADM.HUB_VIOLA_SOFT, color: ADM.HUB_VIOLA_DARK }}>
            <BuIcons.split size={14}/>
          </span>
          <span style={{ fontSize: 12.6, fontWeight: 800, color: ADM.HUB_VIOLA_DARK }}>Aggiungi un ramo</span>
          <span style={{ fontSize: 11.2, color: ADM.MUTED, lineHeight: 1.35, textAlign: 'center' }}>Un altro caso, con le sue regole</span>
        </button>
      </div>
    </div>
  );
}

// ─── L'ispettore di un ramo: qui si scrive la logica ────────────────────────
function WcIspettoreRamo({ ramo, onCambia, onElimina }) {
  const q = hubRamoQuando(ramo);
  const alt = q.tipo === 'altrimenti';
  const n = hubConteggioRegole(q);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', background: ADM.WARN_SOFT, color: ADM.WARN }}>
          <BuIcons.branch size={14}/>
        </span>
        <span style={{ flex: 1, fontSize: 14.2, fontWeight: 700, color: ADM.TEXT }}>Il ramo</span>
        {!alt && <HubPillola color={n ? 'OK' : 'DANGER'} size="sm">{n ? `${n} regole` : 'nessuna regola'}</HubPillola>}
      </div>

      <HubCampo label="Come si chiama" nota="È l'etichetta che si legge sul canvas.">
        <HubInput valore={ramo.label} onCambia={v => onCambia(Object.assign({}, ramo, { label: v }))} placeholder="es. Ha aperto la mail"/>
      </HubCampo>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 11, borderRadius: 10, background: ADM.PANEL_SOFT, border: `1px solid ${ADM.BORDER}`, cursor: 'pointer' }}>
        <AdmSwitch size="sm" checked={alt} onChange={v => onCambia(Object.assign({}, ramo, {
          altrimenti: v,
          quando: v ? { tipo: 'altrimenti', congiunzione: 'E', gruppi: [] }
                    : Object.assign({}, hubQuandoVuoto(), { gruppi: (q.gruppi && q.gruppi.length) ? q.gruppi : hubQuandoVuoto().gruppi }),
        }))}/>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 13.4, fontWeight: 700, color: ADM.TEXT }}>È il ramo «altrimenti»</span>
          <span style={{ display: 'block', fontSize: 12.2, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>
            Prende tutti quelli che non sono rientrati nei rami sopra. Non ha regole: la sua regola è non averne.
          </span>
        </span>
      </label>

      {!alt && (
        <HubCampo label="Quando si prende questo ramo"
          nota="Proprietà del contatto, cose che ha fatto, elenchi, esito del passo prima. Nei gruppi si mescolano E e OPPURE.">
          <WrQuando quando={q} righe={CONTATTI} onCambia={nq => onCambia(Object.assign({}, ramo, { quando: nq }))}/>
        </HubCampo>
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
window.WcEtichettaRamo = WcEtichettaRamo;
window.WcIspettoreRamo = WcIspettoreRamo;
window.wcLeggi = wcLeggi;
window.wcMappa = wcMappa;
window.wcUguali = wcUguali;
window.wcSottotitolo = wcSottotitolo;
