// ═══════════════════════════════════════════════════════════════════════
// Panorama · le home (la B «Notte» è stata tolta il 24 ottobre)
//   A · Atlante  — prima fila: il mondo della A al 70% (con il contatore e la
//                  zona) + Byuppino AI al 30%; sotto widget chiari che
//                  riempiono il riquadro, ognuno dice di cosa parla
//   C · Diorama  — bento chiaro e giocoso, l'isola pastello + Byuppino
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useEffect, useRef } = React;
  const { Icon, Btn, Pill, Phase, Delta, Switch, Money, BigNum, Card, Thumb, StatusPill, cx } = Pano;
  const DATA = Pano.DATA;
  const act = Pano.act;

  const greeting = () => { const h = new Date().getHours(); return h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera'; };
  const weekTotals = () => {
    const cur = DATA.WEEK.cur.filter((d) => !d.future), prev = DATA.WEEK.prev.slice(0, cur.length);
    const s = (a, k) => a.reduce((x, d) => x + d[k], 0);
    return { spent: s(cur, 'spent'), revenue: s(cur, 'revenue'), covers: s(cur, 'covers'), pRevenue: s(prev, 'revenue'), pCovers: s(prev, 'covers'), pSpent: s(prev, 'spent') };
  };
  Pano.weekTotals = weekTotals;

  // ─── pezzi condivisi delle home ─────────────────────────────────────────
  function Suggestions({ dark, compact }) {
    return (
      <div className="col" style={{ gap: 10 }}>
        {DATA.SUGGERIMENTI.map((s) => (
          <div key={s.id} className={cx('sugg', dark && 'dark')}>
            <div className="row top" style={{ gap: 12 }}>
              <span className="sugg-ico"><Icon n={s.icon} /></span>
              <div className="col" style={{ gap: 4, minWidth: 0, flex: 1 }}>
                <b className="sugg-t">{s.title}</b>
                {!compact && <span className="sugg-d">{Pano.suggText(s)}</span>}
                <div className="row" style={{ gap: 8, marginTop: 6 }}>
                  <Btn kind={dark ? 'light' : 'primary'} size="xs" icon={s.action.kind === 'promuovi' ? 'sparkle' : 'arrowR'} onClick={() => (s.action.kind === 'wizard' ? act.open('wizard', { goal: s.action.goal, budget: s.action.budget }) : s.action.kind === 'promuovi' ? act.open('promuovi', s.action) : act.open('campagna', { id: s.action.id }))}>{s.cta}</Btn>
                  <Btn kind={dark ? 'glass' : 'ghost'} size="xs" onClick={() => Pano.toast('Te lo ricordo domani')}>Più tardi</Btn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  Pano.Suggestions = Suggestions;

  // Campagne accese adesso, con l'interruttore sempre a portata
  function ActiveCampaigns({ limit = 5 }) {
    const camps = Pano.useStore((s) => s.campaigns);
    const list = camps.filter((c) => ['attiva', 'pausa', 'revisione', 'correggere', 'programmata'].includes(c.status)).slice(0, limit);
    return (
      <div className="list">
        {list.map((c) => {
          const cap = Pano.campCap(c);
          return (
            <div key={c.id} className={cx('list-row click camp-row', c.status === 'pausa' && 'is-paused')} onClick={() => act.open('campagna', { id: c.id })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && act.open('campagna', { id: c.id })}>
              <Pano.CampToggle c={c} />
              <Thumb img={c.creative.img} bg={c.creative.bg} />
              <div className="col" style={{ gap: 5, flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</b>
                <div className="row wrap" style={{ gap: 8 }}><StatusPill s={c.status} /><span className="t-small">{DATA.TIPI[c.type].label}{c.next ? ' · ' + c.next : ''}</span></div>
              </div>
              <div className="hide-xs camp-budget"><Pano.BudgetRing spent={c.spent} cap={cap} /></div>
              <div className="col" style={{ gap: 2, alignItems: 'flex-end', width: 72 }}>
                {c.spent ? <><b className="num">{Pano.roas(c.revenue / c.spent)}</b><span className="t-small">ROAS</span></> : c.status === 'correggere' ? <Btn kind="primary" size="xs" onClick={(e) => { e.stopPropagation(); act.open('wizard', { fixId: c.id }); }}>Correggi</Btn> : <span className="t-small">—</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  Pano.ActiveCampaigns = ActiveCampaigns;

  function CalendarList({ days }) {
    const KI = { digest: 'push', ricerca: 'search', evento: 'ticket', offerta: 'zap' };
    return (
      <div className="col" style={{ gap: 4 }}>
        {(days ? DATA.CALENDARIO.slice(0, days) : DATA.CALENDARIO).map((g) => {
          const d = Pano.addDays(Pano.TODAY, g.d);
          return (
            <div key={g.d} className="cal-day">
              <div className="cal-date"><span>{g.d === 0 ? 'oggi' : Pano.GG[d.getDay()]}</span><b>{d.getDate()}</b></div>
              <div className="col" style={{ gap: 6, flex: 1, minWidth: 0 }}>
                {g.items.map((it, i) => (
                  <div key={i} className={cx('cal-item', it.kind, it.warn && 'warn', it.bad && 'bad')}>
                    <Icon n={KI[it.kind]} size={14} />
                    <span className="cal-t">{it.t}</span>
                    <span className="cal-s">{it.s}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  Pano.CalendarList = CalendarList;

  // Riquadro «hai speso / ti ha portato»: il messaggio principale, spiegato
  function SpendTile({ compact }) {
    const w = weekTotals();
    const roas = w.revenue / Math.max(1, w.spent);
    const dRev = ((w.revenue - w.pRevenue) / w.pRevenue) * 100;
    const [go, setGo] = useState(false);
    useEffect(() => { const t = setTimeout(() => setGo(true), 120); return () => clearTimeout(t); }, []);
    const spentPart = Math.max(0.035, w.spent / (w.spent + w.revenue));
    return (
      <div className="stat spend fit">
        <div className="tl-head">
          <span className="tl-ico"><Icon n="euro" /></span>
          <div className="col" style={{ gap: 2, minWidth: 0 }}>
            <b className="tl-title">Questa settimana</b>
            {!compact && <span className="tl-sub">Quanto hai speso in Panorama e quanto ti è tornato</span>}
          </div>
          <span className="pill sm iride tl-aside">ROAS {Pano.roas(roas)}</span>
        </div>
        <div className="spend-nums">
          <div className="col" style={{ gap: 2 }}><span className="t-small spend-k"><i className="out" />Hai speso</span><Money v={w.spent} size="md" dec={false} count /></div>
          <span className="spend-arrow" aria-hidden="true"><Icon n="arrowR" size={18} /></span>
          <div className="col" style={{ gap: 2 }}><span className="t-small spend-k"><i className="in" />Ti ha portato</span><Money v={w.revenue} size="md" dec={false} count /></div>
        </div>
        <div className="spend-bar" role="img" aria-label={`Su ${Pano.eur(w.spent + w.revenue, false)} di movimento, ${Pano.eur(w.spent, false)} di spesa e ${Pano.eur(w.revenue, false)} di incasso`}>
          <i className="out" style={{ width: go ? spentPart * 100 + '%' : '0%' }} />
          <i className="in" style={{ width: go ? (1 - spentPart) * 100 + '%' : '0%' }} />
        </div>
        <p className="spend-say">Ogni euro speso te ne ha riportati <b className="num">{Pano.n1(roas)}</b></p>
        <div className="foot"><Delta v={dRev} /><span>di incasso sugli stessi giorni della settimana scorsa</span></div>
      </div>
    );
  }
  Pano.SpendTile = SpendTile;

  // Wallet come quello della barra della C (gradient vivo), più grande e pieno:
  // saldo, anello del limite del mese (come l'anello del wallet in alto), ricarica automatica
  function WalletRing({ v, alert }) {
    const size = 92, sw = 9, r = (size - sw) / 2, c = 2 * Math.PI * r;
    const [go, setGo] = useState(false);
    useEffect(() => { const t = setTimeout(() => setGo(true), 160); return () => clearTimeout(t); }, []);
    const a = ((alert * 360 - 90) * Math.PI) / 180;
    const pct = Math.round(Pano.clamp(v, 0, 1) * 100);
    return (
      <div className="a-wring" role="img" aria-label={`Usato il ${pct}% del limite di ottobre`}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle className="trk" cx={size / 2} cy={size / 2} r={r} strokeWidth={sw} fill="none" />
          <circle className="arc" cx={size / 2} cy={size / 2} r={r} strokeWidth={sw} fill="none" strokeLinecap="round"
            strokeDasharray={`${go ? c * Pano.clamp(v, 0, 1) : 0} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          <circle className="tick" cx={size / 2 + r * Math.cos(a)} cy={size / 2 + r * Math.sin(a)} r="2.4" />
        </svg>
        <span className="a-wring-c"><b className="num">{pct}%</b><small>del limite</small></span>
      </div>
    );
  }
  function WalletCard() {
    const w = Pano.useStore((s) => s.wallet);
    const use = w.spentMonth / w.limits.month;
    const days = Math.max(1, Math.round(w.balance / 31));
    return (
      <div className="a-wallet dio-wallet" role="button" tabIndex={0} onClick={() => act.go('wallet')} onKeyDown={(e) => e.key === 'Enter' && act.go('wallet')} aria-label={`Wallet: ${Pano.eur(w.balance, true)}`}>
        <span className="row between"><span className="t-micro">Wallet · crediti Panorama</span><img src={Pano.IMG.markInk} alt="" style={{ width: 16 }} /></span>
        <div className="a-wallet-mid">
          <div className="col" style={{ gap: 4, minWidth: 0 }}>
            <span className="t-small">Saldo disponibile</span>
            <Money v={w.balance} size="md" dec count />
            <span className="t-small">di cui {Pano.eur(w.bonus, true)} di bonus</span>
          </div>
          <WalletRing v={use} alert={w.alertAt} />
        </div>
        <div className="a-wallet-info">
          <span><Icon n="bolt" size={14} />{w.auto.on ? `Ricarica automatica sotto ${Pano.eur(w.auto.under)}` : 'Ricarica automatica spenta'}</span>
          <span>circa {days} giorni al ritmo di questa settimana</span>
        </div>
        <span className="row a-wallet-actions">
          <button type="button" className="a-wallet-btn" onClick={(e) => { e.stopPropagation(); act.open('ricarica'); }}><Icon n="plus" size={15} />Ricarica</button>
          <button type="button" className="a-wallet-btn ghost" onClick={(e) => { e.stopPropagation(); act.go('wallet'); }}>Movimenti<Icon n="arrowR" size={14} /></button>
        </span>
      </div>
    );
  }
  Pano.WalletCard = WalletCard;

  // Metodo di pagamento: le carte impilate, si scorrono, si sceglie la predefinita
  const BRAND = { Visa: 'VISA', Mastercard: 'mastercard', SEPA: 'SEPA' };
  function PayFace({ m, front }) {
    return (
      <div className={cx('pay-face', 'tone-' + m.tone, front && 'front')}>
        <div className="row between">
          <span className={cx('pay-brand', 'b-' + m.brand.toLowerCase())}>{BRAND[m.brand] || m.brand}</span>
          <span className={cx('pay-st', m.status === 'attiva' ? 'ok' : 'ko')}><i />{m.status === 'attiva' ? 'Attiva' : 'Sospesa'}</span>
        </div>
        {m.kind === 'carta' ? <span className="pay-chip" aria-hidden="true" /> : <span className="pay-bank"><Icon n="receipt" size={16} />Addebito sul conto</span>}
        <div className="pay-num">{m.kind === 'sepa' ? m.iban : `•••• •••• •••• ${m.last4}`}</div>
        <div className="row between pay-foot"><span>{m.holder}</span><span>{m.exp ? `scade ${m.exp}` : 'nessuna scadenza'}</span></div>
      </div>
    );
  }
  function PayStack({ full }) {
    const w = Pano.useStore((s) => s.wallet);
    const methods = w.methods || [];
    const n = methods.length;
    const [i, setI] = useState(() => Math.max(0, methods.findIndex((m) => m.def)));
    const [dx, setDx] = useState(0);
    const hold = useRef(0);     // fino a quando non gira da sola (dopo un tocco o uno swipe)
    const over = useRef(false); // col puntatore sopra resta ferma
    const drag = useRef(null);
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    useEffect(() => {
      if (still || n < 2) return undefined;
      const t = setInterval(() => {
        if (over.current || drag.current || Date.now() < hold.current || document.hidden) return;
        setI((x) => (x + 1) % n);
      }, 1500);
      return () => clearInterval(t);
    }, [n]);
    if (!n) return null;
    const go = (d) => { hold.current = Date.now() + 5000; setI((x) => (x + d + n) % n); };
    const cur = methods[i % n];
    const down = (e) => { drag.current = { x: e.clientX, id: e.pointerId }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) { /* niente */ } };
    const move = (e) => { if (drag.current) setDx(Math.max(-90, Math.min(90, e.clientX - drag.current.x))); };
    const up = (e) => {
      const d = drag.current; drag.current = null;
      if (!d) return;
      const delta = e.clientX - d.x;
      setDx(0);
      go(delta > 28 ? -1 : 1); // swipe a destra = indietro; a sinistra o tocco = avanti
    };
    const name = cur.kind === 'sepa' ? 'SEPA · bonifico' : `${cur.brand} •••• ${cur.last4}`;
    const note = cur.status === 'sospesa' ? cur.note : cur.def ? (cur.from ? 'La stessa di Fresh: paghi le ricariche con questa' : 'Paghi le ricariche con questa') : cur.note || 'Pronta da usare';
    const fix = () => { act.wallet((ww) => ({ methods: ww.methods.map((m) => (m.id === cur.id ? Object.assign({}, m, { status: 'attiva', note: 'Aggiornata adesso' }) : m)) })); Pano.toast(`${cur.brand} •••• ${cur.last4} di nuovo attiva`); };
    const use = () => { act.setDefaultMethod(cur.id); Pano.toast(`Ricariche con ${cur.kind === 'sepa' ? 'il conto SEPA' : cur.brand + ' •••• ' + cur.last4}`); };
    return (
      <div className={cx('stat paystack', full && 'full')} onPointerEnter={() => { over.current = true; }} onPointerLeave={() => { over.current = false; }}>
        {!full && (
          <div className="tl-head">
            <span className="tl-ico"><Icon n="card" /></span>
            <div className="col" style={{ gap: 2, minWidth: 0 }}>
              <b className="tl-title">Metodo di pagamento</b>
              <span className="tl-sub">Con cosa paghi le ricariche</span>
            </div>
            <button type="button" className="tl-link" onClick={() => { act.go('wallet'); setTimeout(() => { const el = document.getElementById('metodi'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120); }}>Gestisci<Icon n="arrowR" size={14} /></button>
          </div>
        )}
        <div className="pay-deck" role="button" tabIndex={0} aria-label={`Carta ${i + 1} di ${n}: ${name}, ${cur.status}. Tocca o scorri per cambiarla`}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; setDx(0); }}
          onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') go(-1); }}>
          {methods.map((m, j) => {
            const k = (j - (i % n) + n) % n; // 0 = davanti; l'ordine nel DOM non cambia, così le carte scivolano
            const st = { '--k': k, zIndex: n - k };
            if (k === 0 && dx) Object.assign(st, { transform: `translateX(${dx}px) rotate(${dx / 30}deg)`, transition: 'none' });
            return <div key={m.id} className={cx('pay-slot', 'k' + k)} style={st} aria-hidden={k !== 0}><PayFace m={m} front={k === 0} /></div>;
          })}
        </div>
        <div className="pay-info">
          <div className="pay-l1"><b>{name}</b>{cur.def && <span className="pay-def">predefinita</span>}</div>
          <span className="pay-l2">{note}</span>
        </div>
        <div className="pay-act">
          {cur.status === 'sospesa'
            ? <Btn kind="primary" size="sm" icon="repeat" onClick={fix}>Aggiorna la carta</Btn>
            : cur.def ? <span className="pay-ok"><Icon n="checkCircle" size={15} />Usata per le ricariche</span>
              : <Btn kind="secondary" size="sm" icon="check" onClick={use}>Usa per le ricariche</Btn>}
          {full && <Btn kind="ghost" size="sm" icon="plus" onClick={() => Pano.toast('Aggiungi metodo: carta o conto, con verifica della banca')}>Aggiungi</Btn>}
          <span className="pay-dots" aria-hidden="true">{methods.map((m, k) => <i key={m.id} className={k === i % n ? 'on' : ''} />)}</span>
        </div>
      </div>
    );
  }
  Pano.PayStack = PayStack;

  function WalletTile() {
    const w = Pano.useStore((s) => s.wallet);
    const use = w.spentMonth / w.limits.month;
    return (
      <div className="stat">
        <span className="lbl"><Icon n="wallet" />Wallet</span>
        <Money v={w.balance} size="md" dec />
        <Pano.Meter v={use} tone={use >= w.alertAt ? 'warn' : ''} ticks={[w.alertAt]} thin label="Limite mensile usato" />
        <div className="foot" style={{ justifyContent: 'space-between' }}><span>{Pano.pct(use * 100)} del limite di ottobre</span><Btn kind="secondary" size="xs" icon="plus" onClick={() => act.open('ricarica')}>Ricarica</Btn></div>
      </div>
    );
  }
  Pano.WalletTile = WalletTile;

  function CoversTile({ compact }) {
    const w = weekTotals();
    const spark = DATA.S30.days.slice(-14).map((d) => d.covers);
    return (
      <div className="stat covers fit">
        {compact ? <span className="lbl"><Icon n="cutlery" />Coperti da Panorama</span> : (
          <div className="tl-head">
            <span className="tl-ico"><Icon n="cutlery" /></span>
            <div className="col" style={{ gap: 2, minWidth: 0 }}>
              <b className="tl-title">Coperti portati</b>
              <span className="tl-sub">Persone a tavola grazie ai tuoi annunci, da lunedì</span>
            </div>
          </div>
        )}
        <div className="row between" style={{ alignItems: 'flex-end' }}><BigNum v={w.covers} size="md" count /><Delta v={((w.covers - w.pCovers) / w.pCovers) * 100} /></div>
        {compact ? <Pano.Spark data={spark} height={46} label="Coperti negli ultimi 14 giorni" live />
          : <div className="spark-fill"><Pano.Spark data={spark} height={60} label="Coperti negli ultimi 14 giorni" live fill /></div>}
        <div className="foot"><span>{Pano.eur(w.spent / Math.max(1, w.covers), true)} di pubblicità per coperto · ultimi 14 giorni nel grafico</span></div>
      </div>
    );
  }
  Pano.CoversTile = CoversTile;

  // Incasso giorno per giorno, con il riassunto in testa (che cosa sto guardando)
  function WeekCard({ className }) {
    const w = weekTotals();
    const dRev = ((w.revenue - w.pRevenue) / w.pRevenue) * 100;
    const today = DATA.WEEK.cur.find((d) => d.partial);
    return (
      <Card className={cx('week-card', className)} title="Incasso portato da Panorama, giorno per giorno" icon="chart" sub="Conti pagati in Fresh da chi è arrivato con un annuncio: questa settimana contro la scorsa">
        <div className="week-sum">
          <div className="col" style={{ gap: 2 }}><span className="t-small">Da lunedì</span><Money v={w.revenue} size="md" dec={false} count /></div>
          <div className="col" style={{ gap: 2 }}><span className="t-small">Stessi giorni, settimana scorsa</span><Money v={w.pRevenue} size="sm" dec={false} className="t-muted" /></div>
          <div className="col" style={{ gap: 4 }}><span className="t-small">Differenza</span><Delta v={dRev} /></div>
          {today && <div className="col" style={{ gap: 2, marginLeft: 'auto', textAlign: 'right' }}><span className="t-small"><span className="live-dot" style={{ display: 'inline-block', marginRight: 6, verticalAlign: '1px' }} />Oggi, fin qui</span><b className="num" style={{ fontSize: 18 }}>{Pano.eur(today.revenue, false)} <span className="t-small">di {Pano.eur(today.forecast, false)} stimati</span></b></div>}
        </div>
        <div className="legend week-legend"><span><i style={{ background: 'var(--s1)' }} />Questa settimana</span><span><i style={{ background: 'var(--s0)' }} />Settimana scorsa</span><span><i className="hatch" />Stima di oggi e di domani</span></div>
        <div className="week-plot"><Pano.WeekChart cur={DATA.WEEK.cur} prev={DATA.WEEK.prev} height={220} fill /></div>
      </Card>
    );
  }

  function ComingSoon({ className }) {
    return (
      <Card className={cx('soon-card', className)} title="In arrivo" icon="rocket" sub="Funzioni della Fase 2: le vedi, ma non sono ancora accese" actions={<Phase f="f2" />}>
        <div className="col" style={{ gap: 12 }}>
          <div className="soon-row">
            <div className="col" style={{ gap: 2, flex: 1 }}><b>Autopilota</b><span className="t-small">Dai a Byuppino un budget al mese: decide lui quando e dove spenderlo, guardando sala, prenotazioni e meteo in Fresh.</span></div>
            <Switch on={false} disabled label="Autopilota" />
          </div>
          <div className="soon-row">
            <div className="col" style={{ gap: 2, flex: 1 }}><b>Riempi-sala automatico</b><span className="t-small">Se alle 18 hai più di 15 posti liberi per la sera, parte da sola una promo da 15 € in ricerca. Con un tetto al mese.</span></div>
            <Switch on={false} disabled label="Riempi-sala automatico" />
          </div>
        </div>
        <p className="t-small soon-foot"><img src={Pano.IMG.byuppinoViso} alt="" />Quando si accendono te lo dice Byuppino. Restano sempre spegnibili e con un tetto di spesa.</p>
      </Card>
    );
  }

  // ─── Cosa puoi comprare (spostato dalle Campagne a Panorama il 25 ottobre)
  // Nove spazi in una griglia piena 3 × 3: le campagne, poi push all'asta, lista in
  // app e vetrina, poi la Fase 2. Ogni spazio ha il suo scorcio vero dell'app, così
  // si distinguono a colpo d'occhio; quelli della Fase 2 si vedono ma non si comprano
  // ancora. I fornitori di Hubble non stanno qui: non li compra il locale.
  const SHOP = [
    { k: 'ricerca', screen: 'ricerca', from: 236, tint: 'lilla', cta: 'Crea', go: () => act.open('wizard', { placement: 'ricerca' }) },
    { k: 'evento', screen: 'eventi', from: 44, tint: 'notte', cta: 'Crea', go: () => act.open('wizard', { placement: 'evento', goal: 'evento' }) },
    { k: 'offerta', screen: 'offerta', from: 44, tint: 'pesca', cta: 'Crea', go: () => act.open('wizard', { placement: 'offerta', goal: 'offerta' }) },
    { k: 'push', screen: 'push', from: 520, tint: 'rosa', cta: 'Fai un’offerta', go: () => act.go('notifiche') },
    { k: 'digest', screen: 'digest', from: 150, tint: 'lilla', cta: 'Prenota', go: () => act.go('notifiche') },
    { k: 'vetrina', screen: 'vetrina', from: 250, tint: 'crema', cta: 'In un tap', go: () => act.open('promuovi') },
    { k: 'perte', screen: 'perte', from: 236, tint: 'menta' },
    { k: 'mappa', screen: 'mappa', from: 300, tint: 'ghiaccio' },
    { k: 'piatto', screen: 'piatto', from: 150, tint: 'pesca' },
  ];

  function ShopGrid({ className }) {
    return (
      <Card className={cx('shop-card', className)} title="Cosa puoi comprare" icon="grid" sub="Gli spazi nell'app byup, ognuno dove lo vedono i clienti: quelli di oggi e quelli della Fase 2."
        actions={<span className="row" style={{ gap: 8 }}><span className="shop-live"><i />Disponibile</span><Phase f="f2" /></span>}>
        <div className="shop-grid">
          {SHOP.map((it) => {
            const t = DATA.TIPI[it.k];
            const live = t.phase === 'mvp';
            return (
              <button key={it.k} type="button" className={cx('shop-tile', 'tint-' + it.tint, !live && 'soon')}
                onClick={live ? it.go : () => Pano.toast(`${t.label}: arriva con la Fase 2`)} aria-label={`${t.label}: ${t.desc} ${t.price}.${live ? '' : ' In arrivo con la Fase 2.'}`}>
                <span className="shop-vis" aria-hidden="true">
                  <Pano.PhoneCrop screen={it.screen} from={it.from} h={330} fade="both" max={0.5} label="" />
                  <span className="shop-ico"><Icon n={t.icon} /></span>
                </span>
                <span className="shop-txt">
                  <span className="shop-t"><b>{t.label}</b>{live ? <span className="shop-live"><i />Disponibile</span> : <Phase f={t.phase} />}</span>
                  <span className="shop-d">{t.desc}</span>
                  <span className="shop-foot"><span className="shop-price">{t.price}</span>{live && <span className="shop-go">{it.cta}<Icon n="arrowR" size={14} /></span>}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    );
  }
  Pano.ShopGrid = ShopGrid;

  // ─── A · Atlante ────────────────────────────────────────────────────────
  function HomeAtlante() {
    return (
      <div className="p-page a-home">
        <h1 className="sr-only">Panorama · Cacio e Pepe, Trastevere</h1>
        <div className="a-hero">
          <div className="a-world">
            <Pano.WorldView variant="atlante" mode="card">
              <div className="w-title">
                <span className="eyebrow"><span className="now"><i />Adesso · {Pano.hhmm()}</span>Il tuo panorama</span>
                <h2>Trastevere,<br />in questo momento</h2>
                <p>Chi vede Cacio e Pepe in app, chi tocca l'annuncio e chi sta arrivando. Trascina per girare la zona.</p>
              </div>
              <div className="w-right a-wright">
                <DioCount />
                <Pano.ZonePanel mini />
              </div>
              <div className="w-controls"><Pano.TimeSeg /><Pano.DigestButton /></div>
              <Pano.Tools />
              <Pano.DigestDone />
            </Pano.WorldView>
          </div>
          <Pano.ByuppinoAI />
        </div>
        <div className="grid a-tiles">
          <section className="a-tile-wallet"><WalletCard /></section>
          <section className="card"><PayStack /></section>
          <section className="card"><SpendTile /></section>
          <section className="card"><CoversTile /></section>
        </div>
        <div className="grid">
          <Card className="c-8 c-md-12" title="Campagne in corso" icon="megaphone" sub="Quello che hai acceso nell'app byup · l'interruttore la mette in pausa o la riaccende" actions={<Btn kind="ghost" size="sm" iconRight="arrowR" onClick={() => act.go('campagne')}>Tutte</Btn>}>
            <ActiveCampaigns limit={6} />
          </Card>
          <Card className="c-4 c-md-12 a-cal" title="In calendario" icon="calendar" sub="Cosa parte nei prossimi giorni" actions={<Btn kind="ghost" size="sm" iconRight="arrowR" onClick={() => act.go('notifiche')}>Digest</Btn>}>
            <div className="a-cal-scroll"><CalendarList /></div>
          </Card>
        </div>
        <div className="grid">
          <WeekCard className="c-8 c-md-12" />
          <ComingSoon className="c-4 c-md-12" />
        </div>
        <ShopGrid />
      </div>
    );
  }

  // ─── C · Diorama ────────────────────────────────────────────────────────
  function HomeDiorama() {
    return (
      <div className="p-page">
        <div className="bento">
          <div className="bn-world">
            <Pano.WorldView variant="diorama" mode="card" labelSet="mini">
              <div className="dio-wtop">
                <span className="dio-chip"><span className="live-dot" />Trastevere in miniatura · {Pano.hhmm()}</span>
                <DioCount />
              </div>
              <div className="w-controls"><Pano.TimeSeg compact /><Pano.DigestButton label="Simula il digest" /></div>
              <Pano.DigestDone />
            </Pano.WorldView>
          </div>
          <aside className="bn-byup">
            <div className="byup-hero">
              <img src={Pano.IMG.byuppino} alt="Byuppino" />
            </div>
            <div className="bubble">Ciao Mario! Ho letto i dati di Fresh di stamattina. <b>Tre idee</b> per riempire meglio la settimana:</div>
            <Suggestions />
            <div className="row between" style={{ padding: '6px 4px 0' }}>
              <div className="col" style={{ gap: 1 }}><b style={{ fontSize: 13.5 }}>Autopilota</b><span className="t-small">decide Byuppino, con un tetto al mese</span></div>
              <span className="row" style={{ gap: 8 }}><Phase f="f2" /><Switch on={false} disabled label="Autopilota" /></span>
            </div>
          </aside>
          <section className="card bn-tile tile-pink"><SpendTile compact /></section>
          <section className="card bn-tile tile-lav"><WalletTile /></section>
          <section className="card bn-tile tile-ice"><CoversTile compact /></section>
          <Card className="bn-chart" title="Questa settimana contro la scorsa" icon="chart" actions={<div className="legend"><span><i style={{ background: 'var(--s1)' }} />Questa</span><span><i style={{ background: 'var(--s0)' }} />Scorsa</span><span><i className="hatch" />Stima</span></div>}>
            <Pano.WeekChart cur={DATA.WEEK.cur} prev={DATA.WEEK.prev} height={210} />
          </Card>
          <Card className="bn-cal" title="In calendario" icon="calendar"><CalendarList /></Card>
          <Card className="bn-camps" title="Campagne in corso" icon="megaphone" actions={<Btn kind="ghost" size="sm" iconRight="arrowR" onClick={() => act.go('campagne')}>Tutte</Btn>}><ActiveCampaigns /></Card>
        </div>
      </div>
    );
  }
  function DioCount() {
    const n = Pano.useLiveNumbers();
    return (
      <div className="dio-count">
        <span className="t-micro">Persone raggiunte oggi</span>
        <b>{Pano.n(n.reached)}</b>
        <span className="t-small">{Pano.n(n.taps)} tocchi · {Pano.n(n.covers)} coperti</span>
      </div>
    );
  }

  Object.assign(Pano, { HomeAtlante, HomeDiorama, greeting });
})();
