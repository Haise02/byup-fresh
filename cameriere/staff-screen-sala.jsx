// byup Staff — Sala (lista tavoli unica) + Profilo

const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

// ─── Logica di stato condivisa fra lista e card ──────────────
// Prenotazioni con graduated disclosure (3 livelli), per non mettere rumore con
// info non ancora azionabili:
//  · imminente (≤ arrivoImminente): "Prenotato · In arrivo" — ora è suo, si prepara.
//  · preavviso (≥ preavvisoArrivo): tavolo LIBERO con prenotazione ANCORA lontana
//    (1h30+): avviso "prenot. tra X" così si sa che il posto è già impegnato dopo.
//  · vicino ma non imminente (tra arrivoImminente e preavvisoArrivo): Libero pulito,
//    niente label — manca poco e diventerà "In arrivo" a breve, non serve rumore.
const prenotInWindow   = (t) => t.stato === 'prenotato' && minutiPrenotazione(t) <= STAFF_SETTINGS.arrivoImminente;
const prenotComeLibero = (t) => t.stato === 'prenotato' && minutiPrenotazione(t) >  STAFF_SETTINGS.arrivoImminente;
// Preavviso sul libero SOLO quando alla prenotazione manca almeno preavvisoArrivo
// (1h30): sotto questa soglia il libero non mostra nulla sulla prenotazione.
const prenotPreavviso  = (t) => prenotComeLibero(t) && minutiPrenotazione(t) >= STAFF_SETTINGS.preavvisoArrivo;
// Disponibile a sedere subito: libero vero, da-pulire, o prenotato non imminente.
const tavoloLibero = (t) => t.stato === 'libero' || t.stato === 'da-pulire' || prenotComeLibero(t);

// Ritardo sulla prenotazione (minuti oltre l'orario). Oltre la tolleranza è un
// no-show: il tavolo resta bloccato e va deciso il da farsi. Prima, è "in ritardo".
const ritardoPrenot = (t) => (t.stato === 'prenotato' && t.prenotazione?.ritardo) || 0;
const isNoShow  = (t) => ritardoPrenot(t) >= STAFF_SETTINGS.tolleranzaNoShow;
const inRitardo = (t) => ritardoPrenot(t) > 0 && !isNoShow(t);
const haDaInviare = (t) => t.daInviare > 0;
// Comanda da prendere: seduti da un po' ma ancora senza ordini → azione operativa.
const daComandare = (t) => t.stato === 'occupato' && !(t.ordini > 0) && (t.sedutiDa || 0) >= STAFF_SETTINGS.attesaComanda;

// Urgenza: blocchi per macro-stato, leggibili a colpo d'occhio. Più basso = più
// in alto. Dentro ogni blocco l'ordine è per numero di tavolo (vedi sort), così
// gli occupati scorrono 1,2,3… senza spezzarsi. L'eventuale azione (consegna,
// invio, comanda) resta visibile nella meta della card, non cambia l'ordine.
//   0  occupato     → servizio in corso
//   1  da pulire    → liberare il tavolo (spesso proprio per chi arriva)
//   2  prenotato presente → in arrivo / in ritardo / no-show: gestire l'arrivo
//   3  libero / lontano   → pronto all'uso
const urgenzaTavolo = (t) => {
  if (t.stato === 'occupato') return 0;
  if (t.stato === 'da-pulire') return 1;
  if (isNoShow(t) || inRitardo(t) || prenotInWindow(t)) return 2;
  return 3;
};

// ═══════════════════════════════════════════════════════════
// SALA — lista tavoli unica (colore = stato, filtri come scorciatoia)
// ═══════════════════════════════════════════════════════════
function ScreenSala({ nav, openModal }) {
  const [filtro, setFiltro] = useStateS('tutti'); // 'tutti' | 'liberi' | 'dainviare'
  const [q, setQ] = useStateS('');
  const [cercaAperta, setCercaAperta] = useStateS(false); // ricerca compatta (lente) ↔ barra piena
  const [salaSel, setSalaSel] = useStateS(SALE[0]);

  const matches = (t) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    if (String(t.n).includes(needle)) return true;
    if (t.prenotazione?.nome?.toLowerCase().includes(needle)) return true;
    if (t.cameriere?.toLowerCase().includes(needle)) return true;
    return false;
  };

  // Tavoli dallo store condiviso: le azioni si riflettono ovunque. Occupati e
  // liberi confluiscono in un'unica lista — la posizione non cambia con lo stato.
  const { attivi: tavoliAttivi, liberi: tavoliLiberi, store } = useTavoli();

  // Filtri-scorciatoia: "Liberi" (dove siedo un walk-in) e "Da inviare" (cosa
  // mandare in cucina, a colpo d'occhio). Le viste panoramiche restano sul desktop.
  const passaFiltro = (t) =>
    filtro === 'liberi' ? tavoloLibero(t)
    : filtro === 'dainviare' ? haDaInviare(t)
    : true;

  const tavoli = [...tavoliAttivi, ...tavoliLiberi]
    .filter(matches)
    .filter(passaFiltro)
    .sort((a, b) => {
      const d = urgenzaTavolo(a) - urgenzaTavolo(b);
      if (d !== 0) return d;
      // Solo i prenotati: in ordine di arrivo (chi arriva prima sta sopra).
      if (a.stato === 'prenotato' && b.stato === 'prenotato')
        return minutiPrenotazione(a) - minutiPrenotazione(b);
      // Tutti gli altri blocchi: per numero di tavolo crescente. Posizione
      // prevedibile, la lista non "salta" mentre guardi lo schermo.
      return String(a.n).localeCompare(String(b.n), undefined, { numeric: true });
    });

  const tuttiTavoli = [...tavoliAttivi, ...tavoliLiberi];
  const contaLiberi = tuttiTavoli.filter(tavoloLibero).length;
  const contaDaInviare = tuttiTavoli.filter(haDaInviare).length;

  return (
    <div style={{ background: ST.BG, minHeight: '100%' }}>
      {/* Header — sticky: rimane visibile durante lo scroll */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: 'calc(20px + env(safe-area-inset-top)) 20px 0', background: '#fff',
        borderBottom: `1px solid ${ST.BORDER_SOFT}`,
      }}>
        {/* Nome sala corrente + freccia cambio sala (select) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={() => openModal({ kind: 'scelta-sala', sale: SALE, salaCorrente: salaSel, onCambia: setSalaSel })} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5 }}>{salaSel.nome}</span>
            <I.ChevDown s={18} c={ST.MUTED}/>
          </button>
        </div>

        {/* Riga unica — ricerca compatta (lente) + QR + scorciatoie con contatore.
            La lente espande la barra a tutta riga; i chip rientrano quando cerchi.
            Tap di nuovo su un filtro = torna a "Tutti". */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, height: 38 }}>
          {cercaAperta ? (
            /* Ricerca espansa: barra piena su tutta la riga, con chiusura a sinistra */
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              background: ST.SURF_ALT, borderRadius: ST.R_PILL, padding: '0 14px', height: 38,
            }}>
              <I.Search s={15} c={ST.MUTED}/>
              <input
                autoFocus
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Cerca tavolo o nome…"
                style={{
                  flex: 1, border: 'none', outline: 'none', minWidth: 0,
                  background: 'transparent', fontSize: 13.5,
                  fontFamily: 'inherit', color: ST.TEXT,
                }}/>
              <button onClick={() => { setQ(''); setCercaAperta(false); }} style={{
                width: 22, height: 22, borderRadius: ST.R_PILL, border: 'none',
                background: 'rgba(0,0,0,0.08)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><I.Close s={11}/></button>
            </div>
          ) : (
            <>
              {/* Lente compatta: tap → espande la ricerca. Pallino se filtro attivo. */}
              <button onClick={() => setCercaAperta(true)} style={{
                position: 'relative',
                width: 38, height: 38, flexShrink: 0, borderRadius: ST.R_PILL,
                border: q.trim() ? `1.5px solid ${ST.PINK}` : 'none',
                background: ST.SURF_ALT, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <I.Search s={16} c={q.trim() ? ST.PINK_DARK : ST.MUTED}/>
              </button>

              {/* QR: scansiona → dritto al tavolo */}
              <button onClick={() => openModal({ kind: 'qr-scan' })} style={{
                width: 38, height: 38, flexShrink: 0, borderRadius: ST.R_PILL, border: 'none',
                background: ST.TEXT, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><I.QR s={18} c="#fff"/></button>

              {/* Scorciatoie con contatore, allineate a destra */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                {[
                  { id: 'liberi', label: 'Liberi', count: contaLiberi, on: ST.PINK, onBg: ST.PINK_SOFT, onText: ST.PINK_DARK },
                  { id: 'dainviare', label: 'Da inviare', count: contaDaInviare, on: ST.AMBER, onBg: ST.AMBER_SOFT, onText: ST.AMBER },
                ].map(f => {
                  const active = filtro === f.id;
                  return (
                    <button key={f.id} onClick={() => setFiltro(active ? 'tutti' : f.id)} style={{
                      height: 38, padding: '0 12px', borderRadius: ST.R_PILL,
                      border: `1.5px solid ${active ? f.on : ST.BORDER}`,
                      background: active ? f.onBg : '#fff', cursor: 'pointer', fontFamily: 'inherit',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: active ? f.onText : ST.TEXT }}>{f.label}</span>
                      <span style={{
                        fontSize: 11.5, fontWeight: 800, minWidth: 18, height: 18, padding: '0 5px', borderRadius: ST.R_PILL,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: active ? f.on : ST.SURF_ALT, color: active ? '#fff' : ST.MUTED,
                      }}>{f.count}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lista unica — ordinata per urgenza, posizione stabile */}
      <div style={{
        padding: '14px 16px 110px', display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {tavoli.length === 0 && (
          <div style={{padding:'40px 20px', textAlign:'center', color: ST.MUTED, fontSize: 13.5}}>
            {q ? `Nessun tavolo trovato per "${q}"` : 'Nessun tavolo in questa vista'}
          </div>
        )}

        {tavoli.map(t => (
          <TavoloCard
            key={`${t.stato}-${t.id}`}
            t={t}
            onOpen={() => nav.push({ s: 'tavolo', id: t.id })}
            onAttiva={(opts) => openModal({ kind: 'attiva-tavolo', tavolo: t, ...opts })}
            onLibera={() => openModal({ kind: 'conferma-cancella-prenotazione', tavolo: t, noShow: isNoShow(t) })}
            onChiudi={() => openModal({ kind: 'conferma-libera', tavolo: t })}
            onPulito={() => store.segnaPulito(t.id)}
            onInvia={(indici) => { store.inviaCucinaItems(t.id, indici); openModal({ kind: 'send-success' }); }}
            onAddOrder={() => nav.push({ s: 'menu', tavoloId: t.id })}
            onPaga={() => nav.push({ s: 'pagamento-split', id: t.id })}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Card tavolo UNICA ──────────────────────────────────────
// Un solo livello: accento colorato a sinistra = stato, numero + meta, e una
// sola CTA per stato. Niente pallino (ridondante con l'accento), niente banner
// (l'info sta nella meta), niente "…": le azioni di servizio vivono nel
// dettaglio del tavolo. Il "pronti" resta solo come piccolo badge segnale.
function TavoloCard({ t, onOpen, onAttiva, onLibera, onChiudi, onPulito, onInvia, onAddOrder, onPaga }) {
  const [aperto, setAperto] = useStateS(false);   // pannello "da inviare" espanso
  const [inviaSel, setInviaSel] = useStateS({});  // selezione articoli da inviare (default: tutti)

  const daInviareT = haDaInviare(t);
  const isOccupato = t.stato === 'occupato';
  const isDaPulire = t.stato === 'da-pulire';
  const isLibero = t.stato === 'libero';
  const noShow = isNoShow(t);              // prenotato non presentato (oltre tolleranza)
  const ritardo = inRitardo(t);            // prenotato in ritardo (entro tolleranza)
  const ritMin = ritardoPrenot(t);
  const inWindow = prenotInWindow(t) && !noShow && !ritardo; // in arrivo, ancora in orario
  const comeLibero = prenotComeLibero(t);  // prenotato lontano: di fatto libero (walk-in)
  const items = t.daInviareItems || [];

  // Tassello = IDENTITÀ del tavolo: il numero per i singoli, la composizione
  // completa (es. 45+46) per gli uniti. Così la riga forte resta libera per il
  // fatto primario (nome prenotazione / conteggio) e l'unito si legge come un
  // singolo. Il "+" segnala già il gruppo: niente icona-merge separata.
  const nMostra = String(t.n);
  const partiN = nMostra.split('+');
  // Fino a 2 tavoli la coppia intera entra nel tassello (es. 45+46). Da 3 in su
  // non c'è spazio: si mostra il PRIMARIO + un badge "+N" (es. 53 ·⁺²); la
  // composizione completa vive nell'hub. Scala a qualsiasi numero di tavoli.
  const tantiUniti = partiN.length >= 3;
  const tileMain = tantiUniti ? partiN[0] : nMostra;
  const nLen = tileMain.length;

  // Saldato: ha consumato e il conto è a zero → è ancora un tavolo OCCUPATO,
  // solo da liberare. Lo trattiamo COME occupato (tessera neutra, riga "N
  // coperti"); a dirlo sono il sub "Saldato · da liberare", l'icona ✓ e la CTA
  // "Libera". Non è un'eccezione accesa. (richiede ordini>0: appena seduti, saldo
  // 0 ma non è saldato).
  const saldato = isOccupato && t.ordini > 0 && !(t.saldo > 0);
  const senzaComanda = isOccupato && daComandare(t);
  // Eccezioni "accese" (tessera piena) = ciò che richiede attenzione SUBITO. La
  // prenotazione resta viola in tutti gli stati (in arrivo / in ritardo / no-show):
  // a escalare sono testo ("In ritardo") e icona Alert, non la tinta della card.
  const loud = senzaComanda || noShow || ritardo;
  // Tassello "pieno" (sfondo nel tono, numero bianco): le eccezioni accese e il
  // saldato. Per il saldato è SOLO il tassello a scurirsi (stessa logica del
  // prenotato in ritardo), non l'intera card — basta a farlo notare a colpo d'occhio.
  const tileFilled = loud || saldato;

  // Tono = colore di stato (bordo + icona), con override per le eccezioni accese.
  // Le prenotazioni restano SEMPRE viola (in arrivo / in ritardo / no-show): è la
  // tinta dello stato, l'urgenza la dicono testo e icona Alert, non il colore.
  const tone = noShow ? statoConfig('prenotato').color
    : ritardo ? statoConfig('prenotato').color
    : senzaComanda ? ST.AMBER
    : saldato ? statoConfig('occupato').color
    : comeLibero ? statoConfig('libero').color
    : statoConfig(t.stato).color;
  // Sfondo tenue dello stesso stato, per tingere il tassello anche quando NON è
  // un'eccezione accesa: ogni tavolo porta il suo colore, lo stato si legge subito.
  const toneBg = noShow ? statoConfig('prenotato').bg
    : ritardo ? statoConfig('prenotato').bg
    : senzaComanda ? ST.AMBER_SOFT
    : saldato ? statoConfig('occupato').bg
    : comeLibero ? statoConfig('libero').bg
    : statoConfig(t.stato).bg;

  // PRINCIPIO: colore = stato, l'icona dà il senso del NUMERO, le parole solo se
  // aggiungono qualcosa. La riga FORTE è l'identità primaria della card:
  //  · tavolo unito → la COMPOSIZIONE (es. 45+46): è ciò che lo identifica;
  //  · occupato/saldato/libero → il CONTEGGIO sedute (numero) con l'icona accanto;
  //  · prenotazione/azione → lo STATO ("In arrivo", "Senza comanda", "Da pulire").
  // Il conteggio coperti, quando NON è già la riga forte (prenotazioni, e i tavoli
  // uniti dove la forte è la composizione), scende nel SUB con la sua icona — così
  // è sempre visibile senza ripetere la parola "coperti"/"posti".
  let head, headKind = 'label', copertiSub = null;
  const subParts = [];
  if (saldato)           { head = `${t.coperti}`; headKind = 'count'; subParts.push('Saldato'); }
  else if (senzaComanda) { head = 'Senza comanda'; subParts.push(`seduti da ${t.sedutiDa}'`); }
  else if (isOccupato)   { head = `${t.coperti}`; headKind = 'count'; if (t.saldo > 0) subParts.push(`€${t.saldo}`); }
  // Prenotazioni — 3 fatti puliti: CHI (nome, riga forte) · QUANTI (👥 nel sub) ·
  // QUANDO (tempo esplicito nel sub). Lo STATO lo dicono colore (viola) e icona
  // (🕐 in arrivo, ⚠️ ritardo/no-show): niente etichetta-di-stato ridondante.
  else if (noShow)       { head = t.prenotazione.nome; copertiSub = t.coperti; subParts.push(`ritardo ${ritMin}'`); }
  else if (ritardo)      { head = t.prenotazione.nome; copertiSub = t.coperti; subParts.push(`ritardo ${ritMin}'`); }
  else if (inWindow)     { head = t.prenotazione.nome; copertiSub = t.coperti; subParts.push(`tra ${t.prenotazione.quando}`); }
  else if (comeLibero)   { head = `${t.coperti}`; headKind = 'count'; if (prenotPreavviso(t)) subParts.push(`prenot. tra ${t.prenotazione.quando}`); }
  else if (isDaPulire)   { head = 'Da pulire'; }
  else                   { head = `${t.coperti}`; headKind = 'count'; } // libero
  // L'unito NON cambia più head/sub: la composizione è nel tassello, quindi la
  // card si comporta come un singolo (nome o conteggio sulla riga forte).
  const sub = subParts.join(' · ');

  // Icona pre-attentiva (canale a11y, leggibile in controluce), colorata dal tono.
  // Non si mostra sui tavoli uniti: la riga forte è la composizione e il tassello
  // porta già l'icona-gruppo (niente doppione). Saldato resta OCCUPATO → 👥 (non
  // la spunta: "Saldato" lo dice il sub e il tassello pieno).
  const StateIcon = (noShow || senzaComanda || ritardo) ? I.Alert
    : isOccupato ? I.Users
    : isDaPulire ? I.Refresh
    : inWindow ? I.Clock
    : I.Chair; // libero / prenotato lontano
  // Icona del conteggio nel sub: 👥 per chi è/sta per sedersi, 🪑 per i liberi.
  const CopIcon = (isLibero || comeLibero || isDaPulire) ? I.Chair : I.Users;
  // Icona nella riga forte solo quando NON è un nome-di-prenotazione: lì il tassello
  // (tinta/pieno) dice già lo stato e l'icona davanti al nome lo disallineerebbe.
  const showHeadIcon = !(inWindow || ritardo || noShow);

  // Azioni: UNA sola, contestuale = la mossa più probabile dello stato. Solo i
  // prenotati attivi tengono i due esiti (Attiva / Cancella) finché il foglio
  // prenotazione non li assorbe. Aggiungi/Sposta/Modifica vivono nell'hub (tap).
  let actions = [];
  if (isDaPulire) actions = [{ label: 'Pulito', onClick: onPulito, variant: 'secondary', icon: <I.Check s={15} c={ST.TEXT}/> }];
  else if (isOccupato) actions = [
    // CTA primaria dell'occupato = aggiungere alla comanda, l'azione RICORRENTE
    // del servizio: "Comanda" se non hanno ancora ordinato, "Aggiungi" poi. Il
    // Conto NON è in card — è azione di fine pasto, vive nell'hub (tap sulla card).
    saldato
      ? { label: 'Libera', onClick: onChiudi, variant: 'danger', icon: <I.Close s={14} c={ST.RED}/> }
      : { label: (t.ordini > 0 ? 'Aggiungi' : 'Comanda'), onClick: onAddOrder, variant: 'secondary', icon: <I.Plus s={15} c={ST.TEXT}/> },
  ];
  else if (comeLibero) actions = [{ label: 'Attiva', onClick: () => onAttiva({ walkIn: true }), variant: 'secondary', icon: <I.Walk s={15} c={ST.TEXT}/> }];
  else if (isLibero) actions = [{ label: 'Attiva', onClick: () => onAttiva(), variant: 'secondary', icon: <I.Walk s={15} c={ST.TEXT}/> }];
  else actions = [ // prenotato: una sola CTA. "Cancella prenotazione" vive nell'hub (tap sulla card).
    { label: 'Attiva', onClick: () => onAttiva(), variant: 'secondary', icon: <I.Walk s={15} c={ST.TEXT}/> },
  ];
  const cta = actions[0];

  const tileFont = nLen <= 2 ? 19 : nLen <= 3 ? 16 : nLen <= 5 ? 12.5 : 10.5;

  // Tap sul corpo apre SEMPRE l'hub del tavolo (dettaglio + gestione), come per
  // l'occupato: lì vivono modifica/unisci/sposta/disgiungi e le CTA Attiva /
  // Cancella prenotazione. Da-pulire non ha hub (solo il bottone "Pulito").
  const bodyTap = isDaPulire ? undefined : onOpen;

  return (
    <div style={{
      background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden',
      boxShadow: ST.SH_SM, border: `1px solid ${ST.BORDER_SOFT}`,
      borderLeft: `5px solid ${tone}`,
    }}>
      {/* Riga principale: tassello numero + situazione + azione singola.
          Il tap vive QUI, su tutta la riga: il bersaglio è la card intera, non
          due isole separate. L'unica eccezione è il bottone d'azione, che ferma
          la propagazione perché porta altrove. */}
      {/* Lo sfondo bianco sta QUI e non solo sulla card: la riga è ciò che si
          preme, e per scurirsi alla pressione deve avere una superficie propria.
          Senza, il feedback scuriva solo i figli — cioè il bottone — lasciando
          il bianco intatto, e sembrava che a reagire fosse "Aggiungi". */}
      <div onClick={bodyTap} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
        background: '#fff',
        cursor: bodyTap ? 'pointer' : 'default',
      }}>
        {/* Tassello numero: tinto del colore di stato (sfondo tenue + numero nel
            tono) così lo stato si legge a colpo d'occhio. Si riempie pieno del tono
            (numero bianco) per le eccezioni accese (senza comanda / ritardo / no-show). */}
        <div style={{
          position: 'relative',
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: tileFilled ? tone : toneBg,
          color: tileFilled ? '#fff' : tone,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: tileFont, fontWeight: 800, letterSpacing: -0.3,
        }}>
          {/* Tassello = identità tavolo. Per 3+ tavoli il numero primario è centrato
              e il "+N" è una pill agganciata FUORI dall'angolo (come una notifica):
              porta l'icona-tavoli accanto al numero per dire che il "+N" sono TAVOLI. */}
          {tantiUniti ? tileMain : nMostra}
          {tantiUniti && (
            <span style={{
              position: 'absolute', top: -7, right: -9,
              display: 'inline-flex', alignItems: 'center', gap: 2,
              fontSize: 10, fontWeight: 800, lineHeight: '14px',
              height: 14, padding: '0 4px',
              borderRadius: 9, background: tone, color: '#fff',
              border: '2px solid #fff',
            }}>
              +{partiN.length - 1}<I.Joined s={11} c="#fff"/>
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Riga forte: icona (tono) + la SITUAZIONE che guida la mossa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {showHeadIcon && <StateIcon s={14} c={tone}/>}
            <span style={{
              fontSize: 14, fontWeight: 800, letterSpacing: -0.1,
              color: ST.TEXT,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{head}</span>
          </div>
          {/* Riga debole: dettaglio di supporto. Va a capo invece di troncare, così
              info corte ma importanti (es. "Saldato · da liberare", "prenot. tra X")
              non perdono pezzi accanto al bottone. La riga forte resta su una riga. */}
          {(copertiSub != null || sub) && (
            <div style={{
              fontSize: 12, color: ST.MUTED, fontWeight: 600, marginTop: 2, lineHeight: 1.3,
              display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
            }}>
              {copertiSub != null && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <CopIcon s={12} c={ST.MUTED}/>{copertiSub}
                </span>
              )}
              {sub && <span>{copertiSub != null ? `· ${sub}` : sub}</span>}
            </div>
          )}
        </div>

        {/* Azione: una sola (bersaglio comodo, md); due impilate solo sui prenotati */}
        {actions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'stretch' }}>
            {actions.map((a, i) => (
              <Btn key={i} variant={a.variant} size={actions.length === 1 ? 'md' : 'sm'} onClick={(e) => { e.stopPropagation(); a.onClick(); }} style={{ fontWeight: 700 }}>
                {a.icon}{a.label}
              </Btn>
            ))}
          </div>
        )}
      </div>

      {/* Striscia "Da inviare": indipendente da "Aggiungi", in fondo alla card */}
      {daInviareT && (
        <button onClick={() => setAperto(o => !o)} style={{
          width: '100%', border: 'none', borderTop: `1px solid ${ST.BORDER_SOFT}`,
          background: aperto ? ST.AMBER_SOFT : ST.SURF, cursor: 'pointer', fontFamily: 'inherit',
          padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: ST.AMBER }}>
            <I.Receipt s={14} c={ST.AMBER}/> Da inviare {t.daInviare}
          </span>
          <I.ChevDown s={15} c={ST.AMBER} style={{ transform: aperto ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 180ms' }}/>
        </button>
      )}

      {/* Pannello espanso: stessa logica di "Da portare" — tap sulla riga per
          selezionare; nessuna selezione = invia tutti. Senza lasciare la Sala. */}
      {daInviareT && aperto && (() => {
        const selCount = items.filter((_, i) => inviaSel[i]).length;
        const toggle = (i) => setInviaSel({ ...inviaSel, [i]: !inviaSel[i] });
        const invia = () => {
          const idx = selCount > 0 ? items.map((_, i) => i).filter(i => inviaSel[i]) : items.map((_, i) => i);
          onInvia(idx); setAperto(false); setInviaSel({});
        };
        return (
          <div style={{
            borderTop: `1px solid ${ST.BORDER_SOFT}`, background: ST.SURF,
            padding: '8px 14px 12px',
          }}>
            {items.map((p, i) => {
              const on = !!inviaSel[i];
              return (
                <div key={i} onClick={() => toggle(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 10px', margin: '0 -4px', borderRadius: ST.R_SM,
                  background: on ? ST.AMBER_SOFT : 'transparent', cursor: 'pointer',
                }}>
                  <span style={{
                    minWidth: 26, height: 22, padding: '0 6px', borderRadius: 6,
                    background: on ? ST.AMBER : '#fff', color: on ? '#fff' : ST.TEXT,
                    border: `1px solid ${on ? ST.AMBER : ST.BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{p.qty}×</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: on ? 800 : 600, color: ST.TEXT }}>{p.nome}</span>
                </div>
              );
            })}
            <button onClick={invia} style={{
              marginTop: 10, width: '100%', height: 42, borderRadius: ST.R_PILL, border: 'none',
              background: ST.AMBER, color: '#fff',
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <I.Receipt s={16} c="#fff"/> {selCount > 0 && selCount < items.length ? 'Invia selezionati' : 'Invia tutti'}
            </button>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILO
// ═══════════════════════════════════════════════════════════
function ScreenProfilo({ nav }) {
  // Locale attivo + switch: se il cameriere è abilitato a più locali, sotto il
  // ruolo c'è il locale corrente, tappabile per cambiarlo.
  const [locale, setLocale] = useStateS(STAFF_USER.locale);
  const [localePicker, setLocalePicker] = useStateS(false);
  const locali = STAFF_USER.locali || [STAFF_USER.locale];
  const multiLocale = locali.length > 1;
  const scegliLocale = (l) => { setLocale(l); STAFF_USER.locale = l; setLocalePicker(false); };

  // Solo voci che corrispondono a funzioni reali del prodotto (cross-check
  // con il profilo del desktop sala / Byup Staff POS).
  const sections = [
    { title: 'Account', items: [
      { i: <I.Settings s={18}/>, l: 'Gestione account', go: 'account' },
      { i: <I.Refresh s={18}/>, l: 'Ripeti onboarding' },
    ]},
    { title: 'Regolamenti', items: [
      { i: <I.Note s={18}/>, l: 'Termini e condizioni' },
      { i: <I.Note s={18}/>, l: 'Privacy policy' },
    ]},
    { title: '', items: [
      { i: <I.Logout s={18} c={ST.RED}/>, l: 'Logout', danger: true },
    ]},
  ];

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 110 }}>
      <div style={{ padding: 'calc(20px + env(safe-area-inset-top)) 20px 24px', background: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>
          Profilo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <div style={{
            width: 64, height: 64, borderRadius: ST.R_PILL,
            background: `linear-gradient(135deg, ${ST.PINK} 0%, ${ST.PINK_DARK} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff',
            boxShadow: ST.SH_MD,
          }}>MR</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>{STAFF_USER.nome} {STAFF_USER.cognome}</div>
            <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 2 }}>
              {STAFF_USER.ruolo}
            </div>
            {/* Locale attivo, sotto il ruolo. Con più locali è un chip tappabile
                che apre la scelta; con uno solo è semplice testo. */}
            {multiLocale ? (
              <button onClick={() => setLocalePicker(v => !v)} style={{
                marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: ST.R_PILL,
                background: ST.SURF_ALT, border: `1px solid ${ST.BORDER_SOFT}`,
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12.5, fontWeight: 700, color: ST.TEXT, maxWidth: '100%',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locale}</span>
                <I.ChevDown s={13} c={ST.MUTED} style={{ flexShrink: 0, transform: localePicker ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }}/>
              </button>
            ) : (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: ST.TEXT, marginTop: 6 }}>{locale}</div>
            )}
          </div>
        </div>

        {/* Picker locale: elenco dei locali abilitati, spunta su quello attivo. */}
        {multiLocale && localePicker && (
          <div style={{ marginTop: 14, border: `1px solid ${ST.BORDER_SOFT}`, borderRadius: ST.R_LG, overflow: 'hidden' }}>
            {locali.map((l, i) => {
              const attivo = l === locale;
              return (
                <button key={l} onClick={() => scegliLocale(l)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '13px 14px', background: attivo ? ST.PINK_SOFT : '#fff',
                  border: 'none', borderTop: i > 0 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: attivo ? 700 : 500, color: attivo ? ST.PINK_DARK : ST.TEXT }}>{l}</span>
                  {attivo && <I.Check s={16} c={ST.PINK_DARK}/>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {sections.map((sec, i) => (
        <div key={i} style={{ marginTop: 24 }}>
          {sec.title && <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px 8px' }}>
            {sec.title}
          </div>}
          <div style={{ background: '#fff', borderRadius: 0 }}>
            {sec.items.map((it, j) => (
              <div key={j} onClick={it.go ? () => nav.push({ s: it.go }) : undefined} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px',
                borderTop: j === 0 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
                borderBottom: `1px solid ${ST.BORDER_SOFT}`,
                cursor: 'pointer',
              }}>
                <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.i}</div>
                <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: it.danger ? ST.RED : ST.TEXT }}>
                  {it.l}
                  {it.d && <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 2, fontWeight: 400 }}>{it.d}</div>}
                </div>
                {!it.danger && <I.ChevRight s={16} c={ST.MUTED_2}/>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 11, color: ST.MUTED_2 }}>
        byup Staff · v1.0.0
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// GESTIONE ACCOUNT — dati cameriere modificabili + modifica password
// ═══════════════════════════════════════════════════════════
function ScreenGestioneAccount({ nav }) {
  const [nome, setNome] = useStateS(STAFF_USER.nome);
  const [cognome, setCognome] = useStateS(STAFF_USER.cognome);
  const [email, setEmail] = useStateS(STAFF_USER.email);
  const [salvato, setSalvato] = useStateS(false);

  const dirty = nome.trim() !== STAFF_USER.nome || cognome.trim() !== STAFF_USER.cognome || email.trim() !== STAFF_USER.email;

  const salva = () => {
    if (!nome.trim() || !cognome.trim() || !email.trim()) return;
    STAFF_USER.nome = nome.trim();
    STAFF_USER.cognome = cognome.trim();
    STAFF_USER.email = email.trim();
    setSalvato(true);
    setTimeout(() => setSalvato(false), 2200);
  };

  const fld = { width: '100%', boxSizing: 'border-box', height: 52, background: '#fff', border: `1px solid ${ST.BORDER}`, borderRadius: ST.R_LG, padding: '0 14px', color: ST.TEXT, fontSize: 15.5, fontFamily: 'inherit', outline: 'none' };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: ST.TEXT, margin: '18px 0 8px' };
  const ro = { ...fld, display: 'flex', alignItems: 'center', background: ST.SURF_ALT, color: ST.MUTED, border: `1px solid ${ST.BORDER_SOFT}` };

  return (
    <div style={{ background: ST.BG, minHeight: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
      <div style={{ background: '#fff', padding: 'calc(16px + env(safe-area-inset-top)) 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Back s={18}/></button>
          <div style={{ fontSize: 19, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>Gestione account</div>
        </div>
      </div>

      <div style={{ padding: '8px 20px 32px' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>Nome</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" style={fld}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>Cognome</label>
            <input value={cognome} onChange={e => setCognome(e.target.value)} placeholder="Cognome" style={fld}/>
          </div>
        </div>

        <label style={lbl}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@esempio.it" style={fld}/>

        <label style={lbl}>Ruolo</label>
        <div style={ro}>{STAFF_USER.ruolo}</div>

        <button onClick={() => nav.push({ s: 'account-password' })} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12, marginTop: 22,
          padding: '14px 14px', background: '#fff', border: `1px solid ${ST.BORDER_SOFT}`,
          borderRadius: ST.R_LG, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}>
          <div style={{ width: 32, display: 'flex', justifyContent: 'center' }}><I.Settings s={18}/></div>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: ST.TEXT }}>Modifica password</span>
          <I.ChevRight s={16} c={ST.MUTED_2}/>
        </button>

        {salvato && (
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: ST.ST_FREE }}>
            <I.Check s={16} c={ST.ST_FREE}/> Modifiche salvate
          </div>
        )}

        <button onClick={salva} disabled={!dirty} style={{
          marginTop: salvato ? 14 : 28, height: 56, width: '100%', borderRadius: ST.R_PILL, border: 'none',
          background: dirty ? ST.PINK_DARK : ST.MUTED_3, color: '#fff', fontSize: 16, fontWeight: 700,
          fontFamily: 'inherit', cursor: dirty ? 'pointer' : 'default', boxShadow: dirty ? ST.SH_FAB : 'none',
        }}>Salva modifiche</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MODIFICA PASSWORD — attuale → nuova → conferma → esito
// ═══════════════════════════════════════════════════════════
function ScreenAccountPassword({ nav }) {
  const [attuale, setAttuale] = useStateS('');
  const [nuova, setNuova] = useStateS('');
  const [conferma, setConferma] = useStateS('');
  const [salvato, setSalvato] = useStateS(false);
  const [errore, setErrore] = useStateS('');

  const salva = () => {
    if (!attuale) return setErrore('Inserisci la password attuale');
    if (nuova.length < 8) return setErrore('La nuova password deve avere almeno 8 caratteri');
    if (nuova === attuale) return setErrore('La nuova password deve essere diversa da quella attuale');
    if (nuova !== conferma) return setErrore('Le due password non coincidono');
    setErrore('');
    setSalvato(true);
  };

  const fld = { width: '100%', boxSizing: 'border-box', height: 52, background: '#fff', border: `1px solid ${ST.BORDER}`, borderRadius: ST.R_LG, padding: '0 14px', color: ST.TEXT, fontSize: 15.5, fontFamily: 'inherit', outline: 'none' };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: ST.TEXT, margin: '18px 0 8px' };

  return (
    <div style={{ background: ST.BG, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', padding: 'calc(16px + env(safe-area-inset-top)) 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Back s={18}/></button>
          <div style={{ fontSize: 19, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>Modifica password</div>
        </div>
      </div>

      {salvato ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 32px 80px' }}>
          <div style={{
            width: 76, height: 76, borderRadius: ST.R_PILL, background: ST.PINK_SOFT,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}><I.Check s={36} c={ST.PINK_DARK}/></div>
          <div style={{ fontSize: 22, fontWeight: 800, color: ST.TEXT, marginBottom: 8 }}>Password aggiornata</div>
          <div style={{ fontSize: 14.5, color: ST.MUTED, lineHeight: 1.5, maxWidth: 280 }}>
            La tua password è stata modificata. Usala al prossimo accesso.
          </div>
          <button onClick={() => nav.pop()} style={{
            marginTop: 28, height: 52, width: '100%', maxWidth: 300, borderRadius: ST.R_PILL, border: 'none',
            background: ST.PINK_DARK, color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer', boxShadow: ST.SH_FAB,
          }}>Fatto</button>
        </div>
      ) : (
        <div style={{ padding: '8px 20px 32px' }}>
          <p style={{ fontSize: 14.5, color: ST.MUTED, lineHeight: 1.5, margin: '4px 0 8px' }}>
            Scegli una nuova password di almeno 8 caratteri.
          </p>

          <label style={lbl}>Password attuale</label>
          <input type="password" value={attuale} onChange={e => setAttuale(e.target.value)} placeholder="Inserisci la password attuale" style={fld}/>

          <label style={lbl}>Nuova password</label>
          <input type="password" value={nuova} onChange={e => setNuova(e.target.value)} placeholder="Almeno 8 caratteri" style={fld}/>

          <label style={lbl}>Conferma nuova password</label>
          <input type="password" value={conferma} onChange={e => setConferma(e.target.value)} placeholder="Ripeti la nuova password" onKeyDown={e => { if (e.key === 'Enter') salva(); }} style={fld}/>

          {errore && <div style={{ marginTop: 14, fontSize: 13.5, fontWeight: 600, color: ST.RED }}>{errore}</div>}

          <button onClick={salva} style={{
            marginTop: 24, height: 56, width: '100%', borderRadius: ST.R_PILL, border: 'none',
            background: ST.PINK_DARK, color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer', boxShadow: ST.SH_FAB,
          }}>Aggiorna password</button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ScreenSala, ScreenProfilo, ScreenGestioneAccount, ScreenAccountPassword });
