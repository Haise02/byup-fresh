// ══════════════════════════════════════════════════════════════════════════
// byup · KDS — board: slot, griglia, paginazione, apertura di una comanda
//
// ── ORDINE POSIZIONALE FISSO, E SLOT CHE NON SI RICICLANO SOTTO IL DITO ──
// Le comande stanno in ordine di ARRIVO, e basta. Non si riordinano mai: non
// per urgenza, non per stato, non per un tick dell'orologio. La priorità la
// comunica il COLORE; la posizione comunica soltanto «da quando è qui».
//
// La ragione è muscolare: dopo dieci minuti di servizio la mano sa che il
// tavolo 23 è il primo in alto a sinistra e ci arriva senza leggere. Una board
// che si riordina per urgenza costringe a rileggere tutto ogni volta che
// qualcosa cambia — cioè in continuazione, cioè proprio quando non c'è tempo.
//
// Quando una comanda viene consegnata, il suo SLOT RESTA VUOTO. Non si
// ricompatta: ricompattare vorrebbe dire far scorrere tutte le card che stanno
// dopo, nel momento esatto in cui l'operatore ha appena premuto un bottone. Lo
// slot vuoto viene poi riusato dalla prima comanda che arriva — e una card che
// COMPARE in un buco non sposta nessuno.
//
// ── NIENTE SCROLL ────────────────────────────────────────────────────────
// Uno schermo appeso non si scrolla: le mani sono occupate e nessuno saprebbe
// dire se sotto c'è dell'altro. Si pagina, con l'indicatore sempre a schermo, e
// ciò che sta fuori pagina viene DICHIARATO — non lasciato a chi si ricorda di
// controllare.
// ══════════════════════════════════════════════════════════════════════════

/**
 * Assegnazione degli slot. PURA: dato lo stato precedente degli slot e le
 * comande aperte, restituisce il nuovo stato. Le comande già a schermo non
 * cambiano mai slot; le nuove prendono il primo buco disponibile.
 */
function kdsAssegnaSlot(precedenti, aperte) {
  const vive = {};
  aperte.forEach(c => { vive[c.id] = true; });
  const slots = precedenti.map(id => (id && vive[id] ? id : null));
  aperte.forEach(c => {
    if (slots.indexOf(c.id) >= 0) return;
    const libero = slots.indexOf(null);
    if (libero >= 0) slots[libero] = c.id; else slots.push(c.id);
  });
  while (slots.length && slots[slots.length - 1] == null) slots.pop();
  return slots;
}

/** Quante comande in ritardo stanno fuori dalla pagina che si sta guardando. */
function kdsFuoriPagina(slots, comande, pagina, ora) {
  const da = pagina * G.SLOT, a = da + G.SLOT;
  let prima = 0, dopo = 0, pronteFuori = 0;
  slots.forEach((id, i) => {
    if (!id || (i >= da && i < a)) return;
    const c = comande.find(x => x.id === id);
    if (!c) return;
    const st = kdsStato(c, ora);
    if (st.fase === 'pronta') { if (st.tonoTimer === 'rosso') pronteFuori += 1; return; }
    if (st.tono !== 'ambra' && st.tono !== 'rosso') return;
    if (i < da) prima += 1; else dopo += 1;
  });
  return { prima, dopo, pronteFuori };
}

// ─── Board ────────────────────────────────────────────────────────────────
function KdsBoard({ S, slots, ora, pagina, onRiga, onPronta, onConsegnata, onVisto, onApri }) {
  const perId = {};
  S.comande.forEach(c => { perId[c.id] = c; });

  // Un tavolo con due comande aperte: la seconda si marca, così nessuno pensa
  // di star guardando la stessa card due volte.
  const primaDelTavolo = {};
  S.comande.filter(kdsAperta)
    .slice().sort((a, b) => a.inviata - b.inviata)
    .forEach(c => { if (primaDelTavolo[c.tavolo] == null) primaDelTavolo[c.tavolo] = c.id; });

  const inPagina = slots.slice(pagina * G.SLOT, (pagina + 1) * G.SLOT);
  const aperte = slots.filter(Boolean).length;

  if (aperte === 0) return <KdsVuoto ora={ora}/>;

  return (
    <div style={{
      flex: 1, minHeight: 0, padding: G.PAD,
      display: 'grid',
      gridTemplateColumns: 'repeat(' + G.COL + ', 1fr)',
      gridTemplateRows: 'repeat(' + G.RIG + ', ' + G.CARD_H + 'px)',
      gap: G.PAD, alignContent: 'start',
    }}>
      {Array.from({ length: G.SLOT }, (_, i) => {
        const id = inPagina[i];
        const c = id ? perId[id] : null;
        // Slot vuoto: NIENTE. Un rettangolo tratteggiato si legge come «qui
        // manca qualcosa» e in cucina quella domanda costa uno sguardo. Lo slot
        // deve solo tenere il posto, non farsi notare.
        if (!c) return <div key={'v' + i}/>;
        return (
          <KdsCard key={c.id} comanda={c} ora={ora}
            secondaDelTavolo={primaDelTavolo[c.tavolo] !== c.id}
            onRiga={onRiga} onPronta={onPronta} onConsegnata={onConsegnata}
            onVisto={onVisto} onApri={() => onApri(c.id)}/>
        );
      })}
    </div>
  );
}

// ─── Nessuna comanda ──────────────────────────────────────────────────────
// Uno schermo nero e muto, alle 11:30, è indistinguibile da uno schermo rotto:
// deve dire che sta funzionando e che ora è.
function KdsVuoto({ ora }) {
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: G.PAD }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 104, fontWeight: 800, color: K.TESTO_2, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {kdsOrario(ora)}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: K.TESTO, marginTop: 20 }}>
          Nessuna comanda in cucina
        </div>
        <div style={Object.assign({}, T.corpo, { color: K.TESTO_3, marginTop: 10, fontSize: 19 })}>
          Il monitor è collegato e in ascolto.
        </div>
      </div>
    </div>
  );
}

// ─── Segnalatore di bordo ─────────────────────────────────────────────────
// Ciò che è fuori schermo va dichiarato, non intuito.
function KdsSegnalatore({ slots, comande, pagina, ora }) {
  const f = kdsFuoriPagina(slots, comande, pagina, ora);
  const voci = [];
  if (f.prima) voci.push({ k: 'p', t: '← ' + f.prima + ' in ritardo', c: K.ROSSO });
  if (f.dopo) voci.push({ k: 'd', t: f.dopo + ' in ritardo →', c: K.ROSSO });
  if (f.pronteFuori) voci.push({ k: 'r', t: f.pronteFuori + ' pronte non ritirate, fuori pagina', c: K.VERDE });
  if (!voci.length) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {voci.map(v => (
        <span key={v.k} style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '9px 13px', borderRadius: 9,
          background: v.c, color: K.SU_PIENO,
        }}>
          <span style={Object.assign({}, T.etich, { color: K.SU_PIENO, fontSize: 13 })}>{v.t}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Comanda aperta ───────────────────────────────────────────────────────
// L'unica sovrapposizione dello schermo, e serve a una cosa sola: leggere per
// intero quello che la card ha dovuto comprimere. Nessuna funzione vive solo
// qui — si può ignorare per tutto il servizio senza perdere niente.
function KdsApertura({ comanda: c, ora, onChiudi, onRiga, onPronta, onConsegnata }) {
  const st = kdsStato(c, ora);
  const conta = kdsConta(c);
  return (
    <div onClick={onChiudi} style={{
      position: 'absolute', inset: 0, zIndex: 85,
      background: 'rgba(5,7,10,0.82)', display: 'grid', placeItems: 'center', padding: 48,
    }}>
      <div onClick={e => e.stopPropagation()} data-no-fx style={{
        width: 900, maxHeight: '100%', background: K.CARD,
        borderRadius: 18, border: '1px solid ' + K.BORDO_ALTO,
        borderLeft: '20px solid ' + KDS_COLORE[st.tono],
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px', borderBottom: '1px solid ' + K.BORDO }}>
          <span style={Object.assign({}, T.tavolo, { color: K.TESTO })}>{c.tavolo}</span>
          <div style={{ flex: 1 }}>
            <div style={Object.assign({}, T.etich, { color: K.TESTO_3 })}>{c.sala} · {c.coperti} coperti</div>
            <div style={Object.assign({}, T.corpo, { color: K.TESTO_2, marginTop: 5 })}>
              inviata alle {kdsOrario(c.inviata)}
              {c.pronta && ' · pronta alle ' + kdsOrario(c.pronta)}
            </div>
          </div>
          <span style={Object.assign({}, T.timer, { color: KDS_COLORE[st.tonoTimer] })}>
            {st.formato === 'secondi' ? kdsMinSec(st.ms) : kdsPrimi(st.ms)}
          </span>
          <KdsBottone onClick={onChiudi}>Chiudi</KdsBottone>
        </div>

        <div className="kds-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24 }}>
          {c.allergie.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 14,
              borderRadius: 10, background: K.ALLERGENE_BG, border: '1.5px solid ' + K.ALLERGENE,
            }}>
              <KdsGlifo tipo="allergene" colore={K.ALLERGENE} size={22}/>
              <span style={Object.assign({}, T.etich, { color: K.ALLERGENE, fontSize: 15 })}>
                {c.allergie.join(' · ')}
              </span>
            </div>
          )}
          {/* Qui la nota sta per intero: è il posto che esiste per questo. */}
          {c.nota && (
            <div style={{
              padding: '12px 14px', marginBottom: 18, borderRadius: 10,
              background: 'rgba(180,83,9,0.10)', borderLeft: '4px solid ' + K.AMBRA,
              fontSize: 19, fontWeight: 700, color: K.TESTO, lineHeight: 1.4, whiteSpace: 'pre-wrap',
            }}>{c.nota}</div>
          )}
          {c.righe.map(r => (
            <div key={r.id} style={{ borderTop: '1px solid ' + K.BORDO, padding: '6px 0' }}>
              <KdsRiga riga={r} comandaId={c.id} allergieTavolo={c.allergie} onTocca={onRiga}/>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid ' + K.BORDO, display: 'flex' }}>
          {st.fase === 'pronta' ? (
            <KdsBottone grande flex pieno colore={K.VERDE} onClick={() => { onConsegnata(c.id); onChiudi(); }}>
              Consegnata
            </KdsBottone>
          ) : (
            <KdsBottone grande flex
              colore={conta.pronte === conta.totale && conta.totale > 0 ? K.VERDE : K.BORDO_ALTO}
              pieno={conta.pronte === conta.totale && conta.totale > 0}
              onClick={() => { onPronta(c.id); onChiudi(); }}>
              Comanda pronta
              <span style={{ fontSize: 15, fontWeight: 700, opacity: 0.75 }}>{conta.pronte}/{conta.totale}</span>
            </KdsBottone>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { kdsAssegnaSlot, kdsFuoriPagina, KdsBoard, KdsVuoto, KdsSegnalatore, KdsApertura });
