// ══════════════════════════════════════════════════════════════════════════
// byup · KDS — indicatore, riga, card comanda
//
// ── ZONA LETTURA ≠ ZONA AZIONE ───────────────────────────────────────────
// Il testo del piatto è INERTE: ci si appoggia sopra il dito, lo si segue, lo
// si rilegge, e non succede niente. L'azione sta a sinistra, in un quadrato da
// 64 px che non contiene testo da leggere.
//
// Non è eleganza: in cucina si tocca lo schermo col dorso della mano, col
// gomito, con un guanto bagnato, mentre si legge. Se leggere e agire
// condividono la stessa superficie, prima o poi un piatto risulta pronto senza
// che nessuno l'abbia fatto — e nessuno se ne accorge.
// ══════════════════════════════════════════════════════════════════════════

// ─── Glifi ────────────────────────────────────────────────────────────────
// Quattro, uno per stato, più il triangolo dell'allergene. Tratto spesso: a due
// metri un'icona sottile diventa una macchia grigia e la forma — che qui porta
// informazione — sparisce.
function KdsGlifo({ tipo, size = 30, colore }) {
  const s = { width: size, height: size, display: 'block' };
  if (tipo === 'spunta') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={colore} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>);
  if (tipo === 'triangolo') return (
    <svg style={s} viewBox="0 0 24 24" fill={colore}><path d="M12 3.2 22.4 21H1.6z"/></svg>);
  if (tipo === 'quadrato') return (
    <svg style={s} viewBox="0 0 24 24" fill={colore}><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/></svg>);
  // «in corso»: metà esatta, non un cerchio che gira. Una rotazione perpetua su
  // un monitor sempre acceso è rumore, e a due metri dice solo «sta caricando».
  if (tipo === 'mezzo') return (
    <svg style={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={colore} strokeWidth="2.6"/><path d="M12 3a9 9 0 0 1 0 18z" fill={colore}/></svg>);
  if (tipo === 'stop') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={colore} strokeWidth="3.2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="6.5" y1="17.5" x2="17.5" y2="6.5"/></svg>);
  if (tipo === 'allergene') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={colore} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13.5"/><line x1="12" y1="17.2" x2="12" y2="17.2"/></svg>);
  return (
    <svg style={s} viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" stroke={colore} strokeWidth="2.8"/></svg>);
}

// ─── Bottone ──────────────────────────────────────────────────────────────
function KdsBottone({ children, onClick, grande, colore, pieno, flex, titolo, disabilitato }) {
  const h = grande ? 64 : 52;
  return (
    <button type="button" onClick={onClick} disabled={disabilitato} title={titolo}
      style={{
        height: h, flex: flex ? 1 : 'none', padding: '0 18px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        borderRadius: 11,
        background: pieno ? colore : 'transparent',
        border: '2px solid ' + (colore || K.BORDO_ALTO),
        color: pieno ? K.SU_PIENO : (colore || K.TESTO_2),
        fontFamily: 'inherit', fontSize: grande ? 20 : 16, fontWeight: 800,
        letterSpacing: '-0.01em', whiteSpace: 'nowrap',
        cursor: disabilitato ? 'default' : 'pointer', opacity: disabilitato ? 0.4 : 1,
      }}>
      {children}
    </button>
  );
}

// ─── Riga ─────────────────────────────────────────────────────────────────
// Altezza calcolata, non misurata: la card deve sapere PRIMA di disegnare
// quante righe ci stanno. Misurare avrebbe voluto dire disegnare, accorgersene
// e ridisegnare — cioè un salto visibile su uno schermo che deve stare fermo.
// 64: è l'altezza del bersaglio, quindi è anche il minimo della riga.
const KDS_RIGA_H = 64;
// ~21 caratteri per riga nella colonna del nome: oltre, il nome va a capo e la
// riga cresce. Senza questo conto «Spaghetti aglio e olio» faceva sbordare la
// card di una ventina di pixel, e a sbordare era l'ultima riga di piatti.
const KDS_NOME_CHAR = 21;
function kdsAltezzaRiga(r) {
  let h = KDS_RIGA_H;
  if ((r.varianti && r.varianti.length) || r.annullata) h += 22;
  if (r.prodotto.length > KDS_NOME_CHAR) h += 28;
  return h;
}

/**
 * Un allergene si segnala sulla riga SOLO se il tavolo ha dichiarato proprio
 * quello. Il piatto porta i suoi allergeni dal catalogo
 * (`menu_item_allergens`), e sono quasi tutti: una carbonara ha uova, latte e
 * glutine, e mettere il triangolo su ogni riga insegna a non guardarlo più.
 * Quello che deve fermare la mano è l'incrocio — «questo tavolo ha dichiarato
 * glutine, e QUESTO piatto ne contiene» — e capita raramente, che è
 * esattamente ciò che lo rende leggibile.
 */
const kdsIncrocio = (riga, allergieTavolo) =>
  (riga.allergeni || []).filter(a => (allergieTavolo || []).indexOf(a) >= 0);

function KdsRiga({ riga, comandaId, allergieTavolo, onTocca }) {
  const ann = riga.annullata;
  const incrocio = kdsIncrocio(riga, allergieTavolo);
  const glifo = ann ? 'stop' : riga.stato === 'pronto' ? 'spunta' : riga.stato === 'in_corso' ? 'mezzo' : 'vuoto';
  const col = ann ? K.ROSSO : riga.stato === 'pronto' ? K.VERDE : riga.stato === 'in_corso' ? K.AMBRA : K.NEUTRO;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minHeight: KDS_RIGA_H }}>
      {/* zona d'AZIONE — 64×64, nessun testo dentro */}
      <button type="button" disabled={ann}
        onClick={e => { e.stopPropagation(); onTocca(comandaId, riga.id); }}
        aria-label={ann ? 'Riga annullata' : 'Avanza ' + riga.prodotto}
        style={{
          width: G.BERSAGLIO, height: G.BERSAGLIO, flexShrink: 0, padding: 0,
          display: 'grid', placeItems: 'center', borderRadius: 12,
          background: riga.stato === 'pronto' && !ann ? 'rgba(22,101,52,0.12)' : 'transparent',
          border: '2px solid ' + (riga.stato === 'pronto' && !ann ? K.VERDE : K.BORDO_ALTO),
          cursor: ann ? 'default' : 'pointer', opacity: ann ? 0.5 : 1,
        }}>
        <KdsGlifo tipo={glifo} colore={col} size={30}/>
      </button>

      {/* zona di LETTURA — inerte */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={Object.assign({}, T.qty, { color: ann ? K.TESTO_3 : K.TESTO_2, minWidth: 40 })}>
            {riga.qty}
          </span>
          <span style={Object.assign({}, T.piatto, {
            flex: 1, color: ann ? K.TESTO_3 : K.TESTO,
            textDecoration: ann ? 'line-through' : 'none',
          })}>{riga.prodotto}</span>
          {incrocio.length > 0 && !ann && (
            <span style={{
              flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 9px', borderRadius: 7, background: K.ALLERGENE,
            }}>
              <KdsGlifo tipo="allergene" colore={K.SU_PIENO} size={15}/>
              <span style={Object.assign({}, T.etich, { color: K.SU_PIENO, fontSize: 12.5 })}>
                {incrocio.join(' · ')}
              </span>
            </span>
          )}
        </div>

        {ann ? (
          <div style={Object.assign({}, T.etich, { color: K.ROSSO, marginTop: 7 })}>annullato — non produrre</div>
        ) : riga.varianti.length > 0 && (
          <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800, color: K.AMBRA, lineHeight: 1.1 }}>
            {riga.varianti.join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card comanda ─────────────────────────────────────────────────────────
// Slot fisso nella griglia. Non si muove mai: né quando diventa rossa, né
// quando diventa pronta, né quando qualcuno la tocca.
function KdsCard({ comanda: c, ora, secondaDelTavolo, onRiga, onPronta, onConsegnata, onVisto, onApri }) {
  const st = kdsStato(c, ora);
  const col = KDS_COLORE[st.tono];
  const conta = kdsConta(c);
  const daVedere = kdsDaVedere(c);

  // ── Quante righe ci stanno. Le altezze sono quelle reali, misurate: sbagliarle
  // di dieci pixel vuol dire o una card che sborda o una riga in meno del
  // necessario. Ogni blocco che compare toglie spazio alle righe, ed è giusto —
  // allergie e annullamenti si leggono PRIMA dei piatti.
  const PAD = 14, GAP = 8;
  const H_HEAD = 52, H_CTX = 40, H_ANN = 56, H_FOOT = 58, H_ALTRO = 24;
  const ctx = c.allergie.length > 0 || c.nota;
  const blocchi = [H_HEAD];
  if (ctx) blocchi.push(H_CTX);
  if (daVedere.length) blocchi.push(H_ANN);
  blocchi.push(H_FOOT);
  const disp = G.CARD_H - PAD * 2 - GAP * blocchi.length - blocchi.reduce((s, h) => s + h, 0);

  // Le righe annullate vanno per ULTIME, non per prime: non sono lavoro, e la
  // banda rossa qui sopra le sta già nominando. Metterle in cima significava
  // stampare due volte la stessa cosa e spingere fuori i piatti da cuocere —
  // che è l'unica informazione per cui la card esiste. Dopo il «Visto» la banda
  // se ne va e la riga barrata torna in elenco, dove resta a memoria.
  const ordine = c.righe.map((r, i) => ({ r, i }))
    .sort((a, b) => (a.r.annullata ? 1 : 0) - (b.r.annullata ? 1 : 0) || (a.i - b.i));
  const scelte = [];
  let usato = 0;
  for (let k = 0; k < ordine.length; k += 1) {
    const h = kdsAltezzaRiga(ordine[k].r);
    const restano = ordine.length - k - 1;
    if (scelte.length && usato + h > disp - (restano > 0 ? H_ALTRO : 0)) break;
    usato += h; scelte.push(ordine[k]);
  }
  const righe = scelte.sort((a, b) => a.i - b.i).map(x => x.r);
  const fuori = c.righe.length - righe.length;

  return (
    <div onClick={onApri} data-no-fx style={{
      height: G.CARD_H, display: 'flex', flexDirection: 'column',
      background: K.CARD, borderRadius: 16,
      border: '1px solid ' + K.BORDO,
      borderLeft: KDS_BINARIO[st.tono] + 'px solid ' + col,
      // Il non-ritirato oltre il limite è l'unico caso in cui due segnali
      // convivono: la card resta verde e prende un anello rosso attorno.
      outline: st.tonoTimer === 'rosso' && st.fase === 'pronta' ? '3px solid ' + K.ROSSO : 'none',
      outlineOffset: -1,
      padding: PAD, gap: GAP, cursor: 'pointer', overflow: 'hidden',
    }}>

      {/* testata: tavolo, orario d'invio, timer. Niente altro. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: H_HEAD, flexShrink: 0 }}>
        <span style={Object.assign({}, T.tavolo, { color: K.TESTO })}>{c.tavolo}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={Object.assign({}, T.etich, { color: K.TESTO_3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>
            {c.sala} · {c.coperti} cop.
          </div>
          <div style={Object.assign({}, T.corpo, { color: K.TESTO_2, marginTop: 5 })}>
            {kdsOrario(c.inviata)}
            {secondaDelTavolo && <span style={{ color: K.AMBRA, fontWeight: 800 }}> · 2ª comanda</span>}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0,
          padding: st.tonoTimer === 'neutro' ? 0 : '9px 12px', borderRadius: 10,
          background: st.tonoTimer === 'neutro' || st.tonoTimer === 'verde' ? 'transparent' : KDS_COLORE[st.tonoTimer],
        }}>
          <span style={Object.assign({}, T.etich, {
            color: st.tonoTimer === 'neutro' || st.tonoTimer === 'verde' ? K.TESTO_3 : 'rgba(255,255,255,0.75)',
          })}>{st.etichetta}</span>
          <span style={Object.assign({}, T.timer, {
            color: st.tonoTimer === 'neutro' ? K.TESTO
              : st.tonoTimer === 'verde' ? K.VERDE : K.SU_PIENO,
          })}>
            {st.formato === 'secondi' ? kdsMinSec(st.ms) : kdsPrimi(st.ms)}
          </span>
        </div>
      </div>

      {/* Contesto del TAVOLO — viene dall'ordine (`note_type`, `service_notes`),
          non dal piatto, ed è identico su tutte le comande di quel tavolo.
          Allergeni e nota stanno sulla STESSA riga perché sono la stessa cosa
          per chi guarda: «di questo tavolo devi sapere anche questo». Restano
          distinguibili dal colore e dalla forma — pastiglia magenta col
          triangolo per l'allergene, testo ambra per la nota — e una riga in meno
          è una riga di piatti in più, che è la sola cosa che la card deve dare. */}
      {ctx && (
        <div style={{
          height: H_CTX, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 12px', borderRadius: 10, background: K.RIGA,
        }}>
          {c.allergie.length > 0 && (
            <span style={{
              flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 9px', borderRadius: 7,
              background: K.ALLERGENE_BG, border: '1.5px solid ' + K.ALLERGENE,
            }}>
              <KdsGlifo tipo="allergene" colore={K.ALLERGENE} size={16}/>
              <span style={Object.assign({}, T.etich, { color: K.ALLERGENE, fontSize: 13 })}>
                {c.allergie.join(' · ')}
              </span>
            </span>
          )}
          {c.nota && (
            <span style={{
              flex: 1, minWidth: 0, fontSize: 16, fontWeight: 700, color: K.AMBRA,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{c.nota}</span>
          )}
        </div>
      )}

      {/* Annullamento dopo l'invio: non sparisce a tempo, si chiude solo
          dichiarando di averlo visto. */}
      {daVedere.length > 0 && (
        <div style={{
          height: H_ANN, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 8px 0 12px', borderRadius: 10,
          background: 'rgba(220,38,38,0.10)', border: '2px solid ' + K.ROSSO,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={Object.assign({}, T.etich, { color: K.ROSSO })}>annullato dalla sala</div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: K.TESTO, marginTop: 5,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{daVedere.map(r => r.qty + ' ' + r.prodotto).join(', ')}</div>
          </div>
          <KdsBottone colore={K.ROSSO} pieno onClick={e => { e.stopPropagation(); onVisto(c.id); }}>
            Visto
          </KdsBottone>
        </div>
      )}

      {/* righe */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {righe.map(r => (
          <KdsRiga key={r.id} riga={r} comandaId={c.id} allergieTavolo={c.allergie} onTocca={onRiga}/>
        ))}
        {fuori > 0 && (
          <div style={{
            marginTop: 'auto', height: H_ALTRO, flexShrink: 0,
            display: 'flex', alignItems: 'center',
          }}>
            <span style={Object.assign({}, T.etich, { color: K.AMBRA })}>
              + {fuori} {fuori === 1 ? 'riga' : 'righe'} — tocca per aprire
            </span>
          </div>
        )}
      </div>

      {/* Un solo bottone. Quale, lo decide la fase. */}
      <div style={{ height: H_FOOT, flexShrink: 0, display: 'flex' }}>
        {st.fase === 'pronta' ? (
          <KdsBottone grande flex pieno colore={K.VERDE}
            onClick={e => { e.stopPropagation(); onConsegnata(c.id); }}>
            Consegnata
          </KdsBottone>
        ) : (
          <KdsBottone grande flex
            colore={conta.pronte === conta.totale && conta.totale > 0 ? K.VERDE : K.BORDO_ALTO}
            pieno={conta.pronte === conta.totale && conta.totale > 0}
            onClick={e => { e.stopPropagation(); onPronta(c.id); }}>
            Comanda pronta
            <span style={{ fontSize: 15, fontWeight: 700, opacity: 0.75 }}>
              {conta.pronte}/{conta.totale}
            </span>
          </KdsBottone>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { KdsGlifo, KdsBottone, KdsRiga, KdsCard, kdsAltezzaRiga, KDS_RIGA_H });
