// ═══════════════════════════════════════════════════════════════════════
// Panorama · Byuppino AI (colonna di destra della home A)
// Il Byuppino di Panorama, collegato di base a quello di Fresh: legge sala,
// prenotazioni e conti e propone una cosa alla volta. Regola (25 ottobre):
// in un tocco fa solo ciò che non tocca gli spazi a contesa dell'app —
// mettere un piatto o un evento in vetrina, pausa e riattiva, ricarica.
// Le campagne sugli spazi dell'app (ricerca, eventi, notifiche…) le prepara
// nella procedura completa: le controlli e le invii tu.
//   «Proposte» — una scheda chiara per volta (cosa, perché, il dato, bottone)
//   «Conversazione» — quando gli scrivi; si torna alle proposte con un tocco
// Nel prototipo è un motore di intenti scritto a mano (come in Desk), non
// un modello: le risposte e le azioni sono vere sullo stato del prototipo.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useRef, useEffect, useMemo } = React;
  const { Icon, Btn, Thumb, cx } = Pano;
  const act = Pano.act;
  const DATA = Pano.DATA;

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function capisci(text) {
    const t = norm(text);
    const has = (...w) => w.some((x) => t.includes(x));
    if (has('riattiva', 'riaccendi', 'riprendi', 'rimetti')) return 'riattiva';
    if (has('pausa', 'ferma', 'spegni', 'deboli', 'stoppa', 'blocca')) return 'pausa';
    if (has('halloween')) return 'halloween';
    if (has('vetrina', 'evidenza', 'carbonara', 'tiramis', 'lasagna', 'piatto')) return 'vetrina';
    if (has('pranz', 'martedi', 'mercoledi')) return 'pranzi';
    if (has('riempi', 'sala', 'posti liberi', 'tavoli liberi', 'stasera', 'promuov', 'campagna')) return 'riempi';
    if (has('ricaric', 'saldo', 'wallet', 'credito')) return 'ricarica';
    if (has('in app', 'nella posta', 'la posta', 'promo per te')) return 'inapp';
    if (has('digest', 'notifica', 'push', 'posto nel', 'asta')) return 'digest';
    if (has('derby', 'partita', 'evento')) return 'evento';
    if (has('settimana', 'come va', 'come sta', 'speso', 'incass', 'roas', 'andamento', 'risultat', 'numeri', 'coperti')) return 'settimana';
    if (has('grazie', 'perfetto', 'ottimo', 'grande')) return 'grazie';
    if (has('ciao', 'ehi', 'buongiorno', 'buonasera', 'salve')) return 'ciao';
    return 'boh';
  }

  // Le azioni in un tocco: solo la vetrina (prezzo fisso, nessuno spazio a contesa)
  const fai = {
    vetrina() {
      const pick = DATA.VETRINA.piatti[0];
      const id = act.vetrinaPromote({ pick, days: 3, by: 'byuppino' });
      Pano.toast('La carbonara è in cima alla vetrina', { undo: () => act.removeCampaign(id) });
      return 'Fatto: è in cima alla vetrina fino a lunedì, a 2 € al giorno.';
    },
    halloween() {
      const pick = DATA.VETRINA.eventi[0];
      const id = act.vetrinaPromote({ pick, days: pick.daysTo, by: 'byuppino' });
      Pano.toast('Halloween è in cima alla vetrina', { undo: () => act.removeCampaign(id) });
      return 'Fatto: resta in cima alla vetrina fino a sabato sera.';
    },
  };
  // Le campagne si preparano nella procedura completa, già compilata
  const prepara = (goal, budget) => () => { act.open('wizard', { goal, budget }); return null; };

  // Le proposte del momento, dai dati di Fresh di stamattina
  function proposte() {
    const f1 = Pano.forecast('riempi', 15), f3 = Pano.forecast('pranzi', 25, 2), fv = Pano.forecastVetrina(3);
    const carb = DATA.VETRINA.piatti[0];
    return [
      { id: 'p1', icon: 'cutlery', title: 'Stasera alle 21:00 hai 14 posti liberi', text: 'Una ricerca in cima dalle 19 alle 22, a chi è entro 1,2 km. Te la preparo già compilata: controlli e la invii tu.',
        viz: { kind: 'meter', l: 'Sala alle 21:00', r: '50 di 64 posti', v: 50 / 64, hi: 4,
          bars: [['19:00', 0.55], ['19:30', 0.7], ['20:00', 0.92], ['20:30', 0.97], ['21:00', 0.78], ['21:30', 0.6], ['22:00', 0.34]] },
        facts: ['15 €', `${f1.coversLo}–${f1.coversHi} coperti in più`, 'solo stasera'],
        go: { label: 'Prepara la campagna', icon: 'arrowR', run: prepara('riempi', 15) }, alt: null },
      { id: 'p2', icon: 'store', title: 'La carbonara è il piatto più ordinato', text: 'Mettila in cima alla tua vetrina fino a lunedì: chi apre Cacio e Pepe la vede per prima. Prezzo fisso, si fa in un tocco.',
        viz: { kind: 'thumb', img: carb.img, bg: carb.bg, l: `Carbonara · ${Pano.eur(carb.price)}`, r: 'ordinata 38 volte da lunedì', hi: 5,
          bars: [['lun', 4 / 11], ['mar', 3 / 11], ['mer', 5 / 11], ['gio', 6 / 11], ['ven', 9 / 11], ['oggi', 1]] },
        facts: ['2 € al giorno', '3 giorni', `${fv.convLo}–${fv.convHi} ordini o prenotazioni`],
        go: { label: 'Fallo tu · 6 €', icon: 'sparkle', run: fai.vetrina },
        alt: { label: 'Scelgo io', run: () => act.open('promuovi', { kind: 'piatto', pickId: 'm1', days: 3 }) } },
      { id: 'p3', icon: 'sun', title: 'Martedì a pranzo sei sotto del 30%', text: 'Ricerca in cima a pranzo, martedì e mercoledì, a chi lavora in zona. Orari e budget li ho già messi io.',
        viz: { kind: 'meter', l: 'Pranzi di martedì', r: '31 coperti, di solito 44', v: 31 / 44, warn: true, hi: 6,
          bars: [['8/9', 45 / 46], ['15/9', 44 / 46], ['22/9', 1], ['29/9', 43 / 46], ['6/10', 44 / 46], ['13/10', 42 / 46], ['20/10', 31 / 46]] },
        facts: ['25 €', `${f3.coversLo}–${f3.coversHi} coperti in più`, 'mar e mer, 12–15'],
        go: { label: 'Prepara la campagna', icon: 'arrowR', run: prepara('pranzi', 25) }, alt: null },
    ];
  }

  // Le risposte della conversazione: testo + azioni (la prima è la conferma)
  function rispondi(intent) {
    const s = Pano.store.get();
    if (intent === 'vetrina') {
      return {
        text: <>Metto la <b>carbonara</b> in cima alla tua vetrina per <b>3 giorni</b>, a <b>2 € al giorno</b>: la vede per prima chi apre Cacio e Pepe. Vado?</>,
        actions: [
          { label: 'Fallo · 6 €', icon: 'sparkle', primary: true, run: fai.vetrina },
          { label: 'Scelgo io', run: () => { act.open('promuovi', { kind: 'piatto', pickId: 'm1', days: 3 }); return 'Ti ho aperto «Promuovi in un tap».'; } },
        ],
      };
    }
    if (intent === 'halloween') {
      return {
        text: <><b>Halloween</b> è già programmato in «Eventi in evidenza» dal 27. Intanto posso metterlo in cima alla tua vetrina fino a sabato: <b>2 € al giorno</b>, 16 € in tutto.</>,
        actions: [
          { label: 'Metti in vetrina · 16 €', icon: 'sparkle', primary: true, run: fai.halloween },
          { label: 'Apri la campagna', run: () => { act.open('campagna', { id: 'c6' }); return 'Ti ho aperto la campagna di Halloween.'; } },
        ],
      };
    }
    if (intent === 'riempi') {
      return {
        text: <>Stasera alle 21 hai <b>14 posti liberi</b>. Per riempirli serve una campagna: <b>ricerca in cima</b> dalle 19 alle 22, a chi è entro 1,2 km, con <b>15 €</b>. Te la preparo nella procedura: la controlli e la invii tu.</>,
        actions: [
          { label: 'Prepara la campagna', icon: 'arrowR', primary: true, run: () => { act.open('wizard', { goal: 'riempi', budget: 15 }); return 'Ti ho aperto la procedura, già compilata.'; } },
          { label: 'Un piatto in vetrina', run: () => { act.open('promuovi', { kind: 'piatto', pickId: 'm1', days: 1 }); return 'Ti ho aperto «Promuovi in un tap».'; } },
        ],
      };
    }
    if (intent === 'pranzi') {
      return {
        text: <>Martedì e mercoledì a pranzo sei sotto del <b>30%</b>. Con <b>25 €</b> di ricerca in cima, dalle 12 alle 15, recuperi una parte dei tavoli. Te la preparo nella procedura?</>,
        actions: [{ label: 'Prepara la campagna', icon: 'arrowR', primary: true, run: () => { act.open('wizard', { goal: 'pranzi', budget: 25 }); return 'Ti ho aperto la procedura, già compilata.'; } }],
      };
    }
    if (intent === 'pausa') {
      const attive = s.campaigns.filter((c) => c.status === 'attiva' && c.spent > 0);
      if (!attive.length) return { text: 'Non hai campagne attive che stanno spendendo: niente da fermare.' };
      const peggiore = attive.slice().sort((a, b) => a.revenue / a.spent - b.revenue / b.spent)[0];
      const r = peggiore.revenue / peggiore.spent;
      return {
        text: <>La più debole è <b>«{peggiore.name}»</b>: ogni euro speso ne riporta <b>{Pano.n1(r)}</b>. {r >= 4 ? 'Va comunque bene, ma se vuoi risparmiare è la prima da fermare.' : 'La fermerei finché non cambiamo foto o orario.'}</>,
        actions: [
          { label: 'Mettila in pausa', icon: 'pause', primary: true, run: () => { act.toggleCampaign(peggiore.id); return 'In pausa. La riattivi dal suo interruttore quando vuoi.'; } },
          { label: 'Apri', run: () => { act.open('campagna', { id: peggiore.id }); return 'Ti ho aperto la campagna.'; } },
        ],
      };
    }
    if (intent === 'riattiva') {
      const ferme = s.campaigns.filter((c) => c.status === 'pausa');
      if (!ferme.length) return { text: 'Non hai campagne in pausa: è tutto acceso.' };
      const c = ferme[0];
      return {
        text: <>«<b>{c.name}</b>» è in pausa{c.paused ? ` (${c.paused.toLowerCase()})` : ''}. La riaccendo con lo stesso budget?</>,
        actions: [{ label: 'Riattiva', icon: 'play', primary: true, run: () => { act.toggleCampaign(c.id); return 'Riattivata.'; } }],
      };
    }
    if (intent === 'ricarica') {
      const w = s.wallet;
      const def = (w.methods || []).find((m) => m.def) || { brand: w.method.brand, last4: w.method.last4 };
      return {
        text: <>Hai <b>{Pano.eur(w.balance, true)}</b>: al ritmo di questa settimana bastano circa 6 giorni. Ricarico <b>100 €</b> (+5 € di bonus) con la {def.brand} •••• {def.last4}?</>,
        actions: [
          { label: 'Ricarica 100 €', icon: 'plus', primary: true, run: () => { act.recharge(100, 5, 'Ricarica chiesta a Byuppino'); Pano.toast('Ricarica di 100 € + 5 € di bonus'); return 'Fatto: +105 € nel wallet.'; } },
          { label: 'Altro importo', run: () => { act.open('ricarica'); return 'Ti ho aperto la ricarica.'; } },
        ],
      };
    }
    if (intent === 'digest') {
      const cell = s.digest.find((c) => c.id === '0-aperitivo');
      if (!cell || cell.auction.status === 'chiusa') return { text: 'Per oggi le aste delle push sono chiuse. Domani a cena c’è ancora tempo: guardale in Push, nella barra in alto.', actions: [{ label: 'Apri Push', run: () => { act.go('push'); return 'Eccoti nelle push.'; } }] };
      const st = Pano.settleAuction(cell.auction, null);
      const week = Pano.pushWeek ? Pano.pushWeek(s.digest, cell) : [];
      if (week.length >= DATA.TETTO_PUSH) {
        const dom = (s.posta || []).find((x) => x.day === 1);
        const lib = dom ? dom.places.filter((x) => !x.sold) : [];
        return {
          text: <>Questa settimana hai già <b>{week.length} push</b> (il pranzo di oggi vinto e la cena in gara): ogni locale ne vince al massimo {DATA.TETTO_PUSH}, quindi all’asta dell’aperitivo non puoi entrare. {lib.length ? <>Nella <b>Posta dell’app</b> di domani invece c’è posto: una notifica in app non suona, ma costa poco, a prezzo fisso da {Pano.eur(Math.min(...lib.map((x) => x.price)))}.</> : 'Da lunedì puoi offrire di nuovo.'}</>,
          actions: lib.length ? [{ label: 'Apri la Posta di domani', icon: 'inbox', primary: true, run: () => { act.open('posta', { dayId: dom.id, pos: lib[0].pos }); return 'Ti ho aperto la notifica in app di domani.'; } }] : [{ label: 'Apri Push', run: () => { act.go('push'); return 'Eccoti nelle push.'; } }],
        };
      }
      return {
        text: <>Per la <b>push dell’aperitivo</b> di oggi (18:30) l’asta è aperta fino alle <b>{cell.auction.closeAt}</b>: {st.offers} offerte, minimo {Pano.eur(cell.auction.reserve)}. Per entrare tra i tre della notifica oggi servono circa <b>{Pano.eur(st.need)}</b>. Te la apro: l’offerta massima la scegli tu.</>,
        actions: [
          { label: 'Apri l’asta delle 18:30', icon: 'push', primary: true, run: () => { act.open('slot', { cellId: cell.id }); return 'Ti ho aperto l’asta delle 18:30.'; } },
          { label: 'Vedi la griglia', run: () => { act.go('push'); return 'Eccoti nelle push.'; } },
        ],
      };
    }
    if (intent === 'inapp') {
      const days = s.posta || [];
      const mine = days.find((x) => x.places.some((p) => p.mine));
      const next = days.find((x) => !x.places.some((p) => p.mine) && x.places.some((p) => !p.sold));
      const free = next ? next.places.filter((p) => !p.sold) : [];
      return {
        text: <>La <b>notifica in app</b> sta nella Posta di chi è in zona, tra le «Promo per te»: non suona, la legge chi apre l’app, e si prenota a prezzo fisso. {mine ? <>Hai già il {mine.places.find((p) => p.mine).pos}° posto {Pano.fmtDay(mine.d)}. </> : null}{next ? <>{Pano.cap(Pano.fmtDay(next.d))} ci sono {free.length} posti liberi, da {Pano.eur(Math.min(...free.map((p) => p.price)))}.</> : 'Questa settimana è tutto preso.'}</>,
        actions: next ? [
          { label: `Prenota ${Pano.fmtDay(next.d)}`, icon: 'inbox', primary: true, run: () => { act.open('posta', { dayId: next.id, pos: free[0].pos }); return `Ti ho aperto la Posta di ${Pano.fmtDay(next.d)}.`; } },
          { label: 'Vedi i 7 giorni', run: () => { act.go('inapp'); return 'Eccoti nelle notifiche in app.'; } },
        ] : [{ label: 'Vedi i 7 giorni', run: () => { act.go('inapp'); return 'Eccoti nelle notifiche in app.'; } }],
      };
    }
    if (intent === 'evento') {
      return {
        text: <>Il <b>derby di domenica</b> fa cercare: 1.800 persone in zona hanno cercato «partita». La tua serata è in revisione da byup (di solito entro 4 ore): appena approvata va in <b>Da scoprire</b>, nella home dell'app.</>,
        actions: [{ label: 'Apri la campagna', primary: true, run: () => { act.open('campagna', { id: 'c3' }); return 'Ti ho aperto la campagna del derby.'; } }],
      };
    }
    if (intent === 'settimana') {
      const w = Pano.weekTotals();
      const roas = w.revenue / Math.max(1, w.spent);
      const d = ((w.covers - w.pCovers) / Math.max(1, w.pCovers)) * 100;
      return {
        text: <>Da lunedì hai speso <b>{Pano.eur(w.spent, false)}</b> e Panorama ti ha portato <b>{Pano.eur(w.revenue, false)}</b> di conti pagati: ogni euro ne ha resi <b>{Pano.n1(roas)}</b>. Coperti: <b>{Pano.n(w.covers)}</b>, {d >= 0 ? '+' : '−'}{Pano.pct(Math.abs(d))} sulla settimana scorsa.</>,
        actions: [{ label: 'Apri Risultati', run: () => { act.go('risultati'); return 'Eccoti in Risultati.'; } }],
      };
    }
    if (intent === 'grazie') return { text: 'Figurati! Se cambia qualcosa in sala te lo dico io.' };
    if (intent === 'ciao') return { text: 'Ciao Mario! Dimmi pure: posso mettere un piatto o un evento in vetrina, prepararti una campagna, dirti come va la settimana, mettere in pausa o riattivare, ricaricare il wallet.' };
    return { text: <>Questo ancora non lo so fare. Posso: mettere <b>un piatto o un evento in vetrina</b>, <b>prepararti una campagna</b>, dirti <b>come va la settimana</b>, <b>mettere in pausa</b> o <b>riattivare</b> campagne, <b>ricaricare</b> il wallet.</> };
  }

  const PROVA = ['Come va la settimana?', 'Carbonara in vetrina'];

  // Il dato che regge la proposta: la sala, il piatto, i pranzi. Se la colonna
  // è alta lo mostra a barre (riempie la scheda), se è bassa con una riga sola.
  function Viz({ v }) {
    const head = v.kind === 'thumb'
      ? <div className="row byai-viz-h"><Thumb img={v.img} bg={v.bg} size="sm" /><span className="col" style={{ gap: 1, minWidth: 0 }}><b>{v.l}</b><span>{v.r}</span></span></div>
      : <span className="row between byai-viz-h"><b>{v.l}</b><span>{v.r}</span></span>;
    return (
      <div className={cx('byai-viz', 'k-' + v.kind)}>
        {head}
        {v.kind !== 'thumb' && <i className={cx('byai-bar', v.warn && 'warn')}><i style={{ width: Math.round(v.v * 100) + '%' }} /></i>}
        <div className="byai-bars" aria-hidden="true">
          {v.bars.map(([k, x], j) => (
            <span key={k} className={cx(j === v.hi && 'hi', j === v.hi && v.warn && 'warn')}><em><i style={{ height: Math.max(6, Math.round(x * 100)) + '%' }} /></em><small>{k}</small></span>
          ))}
        </div>
      </div>
    );
  }

  function ByuppinoAI() {
    const list = useMemo(proposte, []);
    const [i, setI] = useState(0);
    const [done, setDone] = useState({});
    const [mode, setMode] = useState('idee');
    const [msgs, setMsgs] = useState([]);
    const [typing, setTyping] = useState(false);
    const [val, setVal] = useState('');
    const feed = useRef(null);
    useEffect(() => { const el = feed.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }, [msgs.length, typing, mode]);

    const p = list[i];
    const runProp = () => {
      const res = p.go.run();
      if (!res) return;
      const nd = Object.assign({}, done, { [p.id]: res });
      setDone(nd);
      const next = list.findIndex((x) => !nd[x.id]);
      if (next >= 0) setTimeout(() => setI(next), 2600);
    };
    const ask = (text) => {
      if (!text.trim() || typing) return;
      setMode('chat');
      setMsgs((m) => [...m, { id: 'u' + Date.now(), from: 'me', text }]);
      setVal('');
      setTyping(true);
      setTimeout(() => {
        const r = rispondi(capisci(text));
        setTyping(false);
        setMsgs((m) => [...m, Object.assign({ id: 'b' + Date.now(), from: 'byup' }, r)]);
      }, 650 + Math.random() * 450);
    };
    const runAction = (mid, a) => {
      const res = a.run();
      setMsgs((m) => m.map((x) => (x.id === mid ? Object.assign({}, x, { done: res || 'Fatto.' }) : x)));
    };

    return (
      <aside className="byai" aria-label="Byuppino AI">
        <div className="byai-hero byup-hero">
          <div className="byai-name">
            <span className="byai-title">Byuppino <span className="byai-ai">AI</span></span>
            <span className="byai-sub"><span className="live-dot" />Collegato a Fresh</span>
          </div>
          <img src={Pano.IMG.byuppinoAi} alt="Byuppino AI" />
        </div>

        {mode === 'idee' ? (
          <div className="byai-body">
            <div className="byai-head">
              <span className="t-micro">Ti propone · {i + 1} di {list.length}</span>
              <span className="byai-dots" role="tablist" aria-label="Proposte">
                {list.map((x, k) => <button key={x.id} type="button" role="tab" aria-selected={k === i} aria-label={`Proposta ${k + 1}`} className={cx(k === i && 'on', done[x.id] && 'done')} onClick={() => setI(k)} />)}
              </span>
            </div>
            <div className="byai-prop" key={p.id}>
              <div className="byai-prop-t"><span className="sugg-ico"><Icon n={p.icon} /></span><b>{p.title}</b></div>
              <p>{p.text}</p>
              <Viz v={p.viz} />
              <div className="byai-facts">{p.facts.map((f) => <span key={f}>{f}</span>)}</div>
              <div className="byai-actions">
                {done[p.id]
                  ? <span className="byai-done"><Icon n="checkCircle" size={15} />{done[p.id]}</span>
                  : <>
                    <Btn kind="primary" size="sm" icon={p.go.icon} onClick={runProp}>{p.go.label}</Btn>
                    {p.alt && <Btn kind="ghost" size="sm" onClick={p.alt.run}>{p.alt.label}</Btn>}
                  </>}
              </div>
            </div>
            <div className="byai-try">
              <span className="t-small">Chiedi:</span>
              {PROVA.map((t) => <button key={t} type="button" onClick={() => ask(t)}>{t}</button>)}
            </div>
          </div>
        ) : (
          <div className="byai-body chat">
            <div className="byai-head">
              <button type="button" className="byai-back" onClick={() => setMode('idee')}><Icon n="chevL" size={14} />Proposte</button>
              <span className="t-micro">Conversazione</span>
            </div>
            <div className="byai-feed" ref={feed} aria-live="polite">
              {msgs.map((m) => (
                <div key={m.id} className={cx('byai-msg', m.from === 'me' ? 'me' : 'bot')}>
                  <div className="byai-bubble">{m.text}</div>
                  {m.actions && !m.done && (
                    <div className="byai-actions">
                      {m.actions.map((a) => (
                        <Btn key={a.label} kind={a.primary ? 'primary' : 'ghost'} size="xs" icon={a.icon} onClick={() => runAction(m.id, a)}>{a.label}</Btn>
                      ))}
                    </div>
                  )}
                  {m.done && <div className="byai-done"><Icon n="checkCircle" size={14} />{m.done}</div>}
                </div>
              ))}
              {typing && <div className="byai-msg bot"><div className="byai-bubble byai-typing" aria-label="Byuppino sta scrivendo"><i /><i /><i /></div></div>}
            </div>
          </div>
        )}

        <form className="byai-input" onSubmit={(e) => { e.preventDefault(); ask(val); }}>
          <Icon n="sparkle" size={16} />
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Chiedi o fai fare a Byuppino…" aria-label="Scrivi a Byuppino" />
          <button type="submit" className="byai-send" aria-label="Invia" disabled={!val.trim()}><Icon n="arrowR" size={16} /></button>
        </form>
      </aside>
    );
  }

  Object.assign(Pano, { ByuppinoAI });
})();
