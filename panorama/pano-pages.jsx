// ═══════════════════════════════════════════════════════════════════════
// Panorama · sezioni condivise: Campagne, Notifiche push, Notifiche in app,
// Pubblico, Risultati, Wallet. L'accesso si chiede da Fresh, non da qui.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useMemo } = React;
  const { Icon, Btn, IconBtn, Pill, Phase, Delta, Seg, Chips, Switch, Range, Meter, Money, BigNum, Card, Note, Empty, Thumb, StatusPill, KV, cx } = Pano;
  const DATA = Pano.DATA;
  const act = Pano.act;
  const fmtD = (d) => (d ? `${d.getDate()} ${Pano.MM[d.getMonth()]}` : '—');

  function PageHead({ title, sub, actions, eyebrow }) {
    return (
      <header className="p-head">
        <div className="p-head-text">
          {eyebrow && <span className="t-micro">{eyebrow}</span>}
          <h1 className="t-display">{title}</h1>
          {sub && <p className="t-body">{sub}</p>}
        </div>
        {actions && <div className="p-head-actions">{actions}</div>}
      </header>
    );
  }
  Pano.PageHead = PageHead;

  function StatCard({ label, icon, children, foot, className, tone }) {
    return (
      <div className={cx('card stat-card', className)} style={tone === 'bad' ? { boxShadow: 'var(--shadow-1), inset 0 0 0 1.5px color-mix(in srgb, var(--bad) 40%, transparent)' } : undefined}>
        <div className="stat">
          <span className="lbl">{icon && <Icon n={icon} />}{label}</span>
          {children}
          {foot && <div className="foot">{foot}</div>}
        </div>
      </div>
    );
  }
  Pano.StatCard = StatCard;

  // ─── Campagne ───────────────────────────────────────────────────────────
  // Il periodo sta sotto lo stato («fino al 31 ott», «dal 27 ott»): una colonna in meno
  function quando(c) {
    if (!c.start) return 'senza date';
    const today = Pano.TODAY;
    if (c.status === 'conclusa') return `finita il ${fmtD(c.end)}`;
    if (c.start > today) return `dal ${fmtD(c.start)}`;
    if (c.end && Pano.sameDay(c.start, c.end)) return Pano.sameDay(c.start, today) ? 'solo oggi' : fmtD(c.start);
    return c.end ? `fino al ${fmtD(c.end)}` : `dal ${fmtD(c.start)}`;
  }
  const periodo = (c) => (c.start ? `${fmtD(c.start)} → ${fmtD(c.end)}` : 'Bozza senza date');
  Pano.quando = quando;

  function Campagne() {
    const camps = Pano.useStore((s) => s.campaigns);
    const [f, setF] = useState('tutte');
    const mobile = Pano.useMedia('(max-width: 760px)');
    const count = (k) => camps.filter((c) => c.status === k).length;
    const list = f === 'tutte' ? camps : camps.filter((c) => c.status === f);
    const spent30 = camps.reduce((a, c) => a + c.spent, 0);
    const rev30 = camps.reduce((a, c) => a + c.revenue, 0);
    const opts = [
      { id: 'tutte', label: 'Tutte' }, { id: 'attiva', label: 'Attive' }, { id: 'revisione', label: 'In revisione' },
      { id: 'correggere', label: 'Da correggere' }, { id: 'programmata', label: 'Programmate' }, { id: 'pausa', label: 'In pausa' },
      { id: 'conclusa', label: 'Concluse' }, { id: 'bozza', label: 'Bozze' },
    ];
    const fix = count('correggere');
    return (
      <div className="p-page">
        <PageHead title="Campagne" sub="Tutto quello che hai acceso nell'app byup: cosa sta girando, cosa aspetta byup e cosa va sistemato."
          actions={<Btn kind="primary" icon="plus" onClick={() => act.open('wizard')}>Nuova campagna</Btn>} />
        <div className="card camp-sum" role="group" aria-label="Riepilogo delle campagne">
          <button type="button" className={cx('cs', f === 'attiva' && 'on')} onClick={() => setF(f === 'attiva' ? 'tutte' : 'attiva')}>
            <span className="cs-ico"><Icon n="play" /></span><b className="num">{count('attiva')}</b><span className="cs-t">attive adesso<small>accese nell'app</small></span>
          </button>
          <button type="button" className={cx('cs', f === 'revisione' && 'on')} onClick={() => setF(f === 'revisione' ? 'tutte' : 'revisione')}>
            <span className="cs-ico"><Icon n="hourglass" /></span><b className="num">{count('revisione')}</b><span className="cs-t">in revisione<small>di solito entro 4 ore</small></span>
          </button>
          <button type="button" className={cx('cs', fix && 'bad', f === 'correggere' && 'on')} onClick={() => setF(f === 'correggere' ? 'tutte' : 'correggere')}>
            <span className="cs-ico"><Icon n="alertCircle" /></span><b className="num">{fix}</b><span className="cs-t">da correggere<small>{fix ? 'vedi cosa sistemare' : 'tutto in regola'}</small></span>
          </button>
          <div className="cs money">
            <span className="cs-ico"><Icon n="euro" /></span><b className="num">{Pano.eur(spent30, false)}</b><span className="cs-t">spesi in 30 giorni<small>incassato {Pano.eur(rev30)} · ROAS {Pano.roas(rev30 / Math.max(1, spent30))}</small></span>
          </div>
        </div>
        <Card flush>
          <div style={{ padding: '16px 18px 6px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Seg value={f} onChange={setF} options={opts} label="Filtra per stato" />
          </div>
          {list.length === 0 ? (
            <Empty icon="megaphone" title="Nessuna campagna qui" text="Quando ne avrai una in questo stato la trovi in questa lista." action={<Btn kind="secondary" size="sm" onClick={() => setF('tutte')}>Mostra tutte</Btn>} />
          ) : mobile ? (
            <div className="list" style={{ padding: '4px 18px 12px' }}>
              {list.map((c) => (
                <div key={c.id} className="list-row click" onClick={() => act.open('campagna', { id: c.id })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && act.open('campagna', { id: c.id })}>
                  <Pano.CampToggle c={c} />
                  <Thumb img={c.creative.img} bg={c.creative.bg} />
                  <div className="col" style={{ gap: 4, flex: 1 }}>
                    <b style={{ fontSize: 14 }}>{c.name}</b>
                    <div className="row wrap" style={{ gap: 6 }}><StatusPill s={c.status} /><span className="t-small">{DATA.TIPI[c.type].short} · {quando(c)}</span></div>
                  </div>
                  <div className="col" style={{ gap: 2, alignItems: 'flex-end' }}>
                    <b className="num">{c.revenue ? Pano.eur(c.revenue) : '—'}</b>
                    <span className="t-small">{c.spent ? 'ROAS ' + Pano.roas(c.revenue / c.spent) : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-wrap" style={{ margin: 0, padding: '0 12px 8px' }}>
              <table className="table camp-table">
                <thead><tr><th style={{ width: 64 }}>Accesa</th><th>Campagna</th><th style={{ width: 150 }}>Stato</th><th style={{ width: 150 }}>Budget</th><th className="r">Raggiunti</th><th className="r">Coperti</th><th className="r">Incasso</th><th className="r">ROAS</th><th aria-label="Azioni" style={{ width: 92 }} /></tr></thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c.id} className="click" onClick={() => act.open('campagna', { id: c.id })}>
                      <td onClick={(e) => e.stopPropagation()}><Pano.CampToggle c={c} /></td>
                      <td><div className="row" style={{ gap: 12 }}><Thumb img={c.creative.img} bg={c.creative.bg} /><div className="col" style={{ gap: 2, minWidth: 0 }}><b className="ct-name">{c.name}</b><span className="t-small ct-type"><Icon n={DATA.TIPI[c.type].icon} size={13} />{DATA.TIPI[c.type].label}{c.next ? ' · ' + c.next : ''}</span></div></div></td>
                      <td><div className="col" style={{ gap: 5, alignItems: 'flex-start' }} title={periodo(c)}><StatusPill s={c.status} /><span className="t-small ct-when">{quando(c)}</span></div></td>
                      <td><Pano.BudgetRing spent={c.spent} cap={Pano.campCap(c)} /></td>
                      <td className="r">{c.reach ? Pano.n(c.reach) : '—'}</td>
                      <td className="r">{c.covers ? Pano.n(c.covers) : '—'}</td>
                      <td className="r t-strong">{c.revenue ? Pano.eur(c.revenue) : '—'}</td>
                      <td className="r">{c.spent ? <Pill size="sm" tone={c.revenue / c.spent > 6 ? 'good' : ''}>{Pano.roas(c.revenue / c.spent)}</Pill> : '—'}</td>
                      <td className="r" onClick={(e) => e.stopPropagation()}>
                        {c.status === 'correggere' && <Btn kind="primary" size="xs" icon="edit" onClick={() => act.open('wizard', { fixId: c.id })}>Correggi</Btn>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ─── Notifiche: due schermate (Nilo, 25 ottobre) ────────────────────────
  // La push arriva sul telefono di chi è in zona, anche ad app chiusa: la manda byup
  // per zona e fascia con tre locali dentro, e i tre posti si vincono all'asta (busta
  // chiusa, secondo prezzo, chiusura 15 minuti prima dell'invio). La notifica in app
  // sta dentro l'app, nella Posta («Promo per te»): non suona, la legge chi apre l'app
  // e si prenota a prezzo fisso. Due prodotti diversi, due schermate.

  // Lo stato di una casella della push, per la griglia, il cassetto e l'elenco
  function cellState(c, all) {
    const a = c.auction;
    const closed = a.status === 'chiusa';
    const res = closed ? Object.assign({ offers: a.rivals.length + (a.my ? 1 : 0), need: a.reserve, rivalTrattoria: false }, a.result) : Pano.settleAuction(a, a.my && a.my.max);
    const me = res.me;
    let st, tone, sub;
    if (closed) { st = me ? `Inviata · eri ${me.pos}°` : 'Inviata'; tone = 'muted'; sub = me ? `pagati ${Pano.eur(me.paid, true)}` : `${Pano.n(c.reach)} raggiunti`; }
    else if (a.my) { st = me ? `Tua offerta · ${me.pos}°` : 'Tua offerta · fuori'; tone = me ? 'mine' : 'warn'; sub = `max ${Pano.eur(a.my.max)} · chiude ${a.closeAt}`; }
    else if (all && Pano.pushWeek && Pano.pushWeek(all, c).length >= DATA.TETTO_PUSH) { st = 'Tetto raggiunto'; tone = 'muted'; sub = 'già 2 push questa settimana'; }
    else if (res.rivalTrattoria) { st = 'C’è un’altra trattoria'; tone = 'warn'; sub = `servono ${Pano.eur(res.need)}`; }
    else { st = 'Asta aperta'; tone = 'free'; sub = `${res.offers} offerte · da ${Pano.eur(a.reserve)}`; }
    return { closed, res, me, st, tone, sub };
  }
  Pano.cellState = cellState;

  // Pezzi comuni: come funziona, in tre punti, e il rimando all'altra notifica
  function HowCard({ items, other }) {
    return (
      <Card className="c-7 c-md-12 nt-how" title="Come funziona" icon="info">
        <ol className="nt-steps">
          {items.map(([ic, t, d]) => (
            <li key={t}><span className="nt-ico"><Icon n={ic} /></span><span className="col" style={{ gap: 3 }}><b>{t}</b><span className="t-small">{d}</span></span></li>
          ))}
        </ol>
        {other}
      </Card>
    );
  }
  function OtherLink({ to, icon, t, d }) {
    return (
      <button type="button" className="nt-other" onClick={() => act.go(to)}>
        <span className="nt-ico"><Icon n={icon} /></span>
        <span className="col" style={{ gap: 2, textAlign: 'left', flex: 1, minWidth: 0 }}><b>{t}</b><span className="t-small">{d}</span></span>
        <Icon n="arrowR" />
      </button>
    );
  }

  // ─── Notifiche push (all'asta) ──────────────────────────────────────────
  function NotifichePush() {
    const cells = Pano.useStore((s) => s.digest);
    const sel = Pano.useStore((s) => (s.overlay && s.overlay.kind === 'slot' ? s.overlay.props.cellId : null));
    const [view, setView] = useState('push');
    const days = Array.from({ length: 7 }, (_, i) => Pano.addDays(Pano.TODAY, i));
    const offerte = cells.filter((c) => c.auction.my && c.auction.status !== 'chiusa');
    // questa settimana (sabato e domenica): le push vinte o in gara contano per il tetto
    const week = cells.filter((c) => c.day <= 1 && (c.auction.status === 'chiusa' ? !!(c.auction.result && c.auction.result.me) : !!c.auction.my));
    return (
      <div className="p-page">
        <PageHead title="Notifiche push" sub="La notifica che arriva sul telefono di chi è in zona, anche con l’app chiusa. La manda byup tre volte al giorno, con tre locali dentro: i tre posti si vincono all’asta."
          actions={<Pill icon="pin" tone="ink">Trastevere · 1,2 km</Pill>} />
        <div className="grid">
          <Card className="c-5 c-md-12 nt-prev" title="Sul telefono" icon="push" sub={view === 'push' ? 'Sullo schermo bloccato, con il suono' : 'Toccandola si apre la lista dei tre'}
            actions={<Seg value={view} onChange={setView} options={[{ id: 'push', label: 'La notifica' }, { id: 'lista', label: 'Aperta' }]} label="Anteprima della push" />}>
            {view === 'push'
              ? <Pano.PhoneCrop key="push" screen="push" from={430} h={400} fade="top" label="La push sullo schermo bloccato, da vicino" />
              : <Pano.PhoneCrop key="lista" screen="lista" from={-11} h={400} fade="bottom" label="La lista che si apre dalla push, da vicino" />}
          </Card>
          <HowCard
            items={[
              ['push', 'Arriva sul telefono, anche ad app chiusa', 'La manda byup a chi è in zona alle 12:15, alle 18:30 e alle 20:00, con il nome di tre locali. Il testo lo scrive byup.'],
              ['euro', 'I tre posti si vincono all’asta', 'Offri il massimo che spenderesti, a busta chiusa, fino a 15 minuti prima dell’invio. Conta offerta × qualità del locale, e paghi solo quanto basta per superare chi ti segue.'],
              ['shield', 'Poche e varie', `Prezzo minimo ${Pano.eur(DATA.PER_MILLE, true)} ogni 1.000 persone raggiunte. Una trattoria per push, ${DATA.TETTO_PUSH} vinte a settimana per locale, al massimo 2 sponsorizzate a settimana per persona.`],
            ]}
            other={<OtherLink to="inapp" icon="inbox" t="Vuoi farti leggere senza suonare?" d="La notifica in app sta nella Posta dell’app, a prezzo fisso." />} />
        </div>
        <Card title="I prossimi 7 giorni" icon="calendar" sub="Tocca una casella per fare un’offerta. I tre trattini sono i tre posti della push."
          actions={<div className="legend"><span><i style={{ background: 'var(--iride-dot)' }} />Tu</span><span><i style={{ background: 'var(--line-3)' }} />Altri locali</span><span><i className="lg-auc" />Ancora in gara</span></div>}>
          <div style={{ overflowX: 'auto', margin: '0 -22px', padding: '0 22px 4px' }}>
            <div className="dg">
              <span />
              {days.map((d, i) => <div key={i} className={cx('dg-head', i === 0 && 'today')}><span>{i === 0 ? 'oggi' : Pano.GG[d.getDay()]}</span><b>{d.getDate()} {Pano.MM[d.getMonth()]}</b></div>)}
              {DATA.FASCE.map((F) => (
                <React.Fragment key={F.id}>
                  <div className="dg-row-lbl"><b><Icon n={F.icon} size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />{F.label}</b><small>alle {F.time}</small></div>
                  {days.map((d, i) => {
                    const c = cells.find((x) => x.id === `${i}-${F.id}`);
                    const x = cellState(c, cells);
                    return (
                      <button key={i} type="button" className={cx('dg-cell', x.tone === 'mine' && 'mine', sel === c.id && 'sel')} onClick={() => act.open('slot', { cellId: c.id })} aria-label={`Push ${F.label} ${Pano.fmtDayLong(d)}: ${x.st}, ${x.sub}`}>
                        <span className="slots" aria-hidden="true">
                          {[1, 2, 3].map((k) => { const w = x.res.win.find((y) => y.pos === k); return <i key={k} className={cx('auc', w && w.me && 'mine', x.closed && w && !w.me && 'sold')} />; })}
                        </span>
                        <span className="dg-st" style={{ color: x.tone === 'warn' ? 'var(--warn-ink)' : x.tone === 'muted' ? 'var(--muted)' : 'var(--ink)' }}>
                          {x.tone === 'mine' && <Icon n="checkCircle" />}{x.tone === 'warn' && <Icon n="alert" />}{x.tone === 'free' && <Icon n="push" />}{x.st}
                        </span>
                        <span className="dg-pr">{x.sub}</span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Card>
        <div className="grid">
          <Card className="c-8 c-md-12" title="Le tue offerte" icon="history" sub="Le aste aperte e le push già partite, con quello che hanno portato.">
            <div className="list">
              {offerte.map((c) => { const x = cellState(c); const F = DATA.FASCE.find((f) => f.id === c.fascia); return (
                <div key={c.id} className="list-row click" onClick={() => act.open('slot', { cellId: c.id })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && act.open('slot', { cellId: c.id })}>
                  <span className="pill iride" style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', fontSize: 14 }}>{x.me ? `${x.me.pos}°` : '—'}</span>
                  <div className="col" style={{ gap: 2, flex: 1 }}><b>Push {F.label} · {Pano.fmtDay(c.d)} · {c.time}</b><span className="t-small">Offerta massima {Pano.eur(c.auction.my.max)} · {x.me ? `oggi saresti ${x.me.pos}° e pagheresti ${Pano.eur(x.me.paid, true)}` : `oggi resteresti fuori: servono ${Pano.eur(x.res.need)}`}</span></div>
                  <Pill tone={x.me ? 'info' : 'warn'} size="sm" icon="clock">Chiude alle {c.auction.closeAt}</Pill>
                </div>
              ); })}
              {DATA.PUSH_PAST.map((bk) => { const F = DATA.FASCE.find((f) => f.id === bk.fascia); return (
                <div key={bk.id} className="list-row">
                  <span className="pill" style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', fontSize: 14 }}>{bk.pos}°</span>
                  <div className="col" style={{ gap: 2, flex: 1 }}><b>Push {F.label} · {Pano.fmtDay(bk.d)}{bk.today ? ' · oggi' : ''}</b><span className="t-small">{Pano.n(bk.reach)} raggiunti · {bk.taps} tocchi · {bk.bookings} prenotazioni · {bk.covers} coperti</span></div>
                  <div className="col" style={{ gap: 2, alignItems: 'flex-end' }}><b className="num">{Pano.eur(bk.revenue)}</b><span className="t-small">spesi {Pano.eur(bk.price, true)} · ROAS {Pano.roas(bk.revenue / bk.price)}</span></div>
                </div>
              ); })}
            </div>
          </Card>
          <div className="col c-4 c-md-12 nt-side">
            <section className="card ink" style={{ padding: 22, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 'auto -40px -60px auto', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(252,187,248,.45), transparent 65%)' }} />
              <div className="row between" style={{ position: 'relative' }}><span className="t-micro" style={{ color: 'rgba(255,255,255,.7)' }}>Formato raro</span><span className="row" style={{ gap: 6 }}><Pill size="sm" tone="iride">Su approvazione</Pill><Phase f="f2" /></span></div>
              <h3 className="t-title" style={{ color: '#fff', marginTop: 12, position: 'relative' }}>Una push solo tua</h3>
              <p className="t-small" style={{ color: 'rgba(255,255,255,.75)', marginTop: 6, position: 'relative' }}>Pochissime a settimana per città, decide byup. Per serate speciali: un concerto, un menù unico. Da € 120.</p>
              <Btn kind="light" size="sm" icon="bell" style={{ marginTop: 14, position: 'relative' }} onClick={() => Pano.toast('Ti avvisiamo quando la push dedicata è disponibile')}>Avvisami quando arriva</Btn>
            </section>
            <Card className="nt-fill" title="Il tetto della settimana" icon="shield" sub={`Ogni locale vince al massimo ${DATA.TETTO_PUSH} push a settimana, così restano varie.`}>
              <div className="col" style={{ gap: 12 }}>
                <div className="row between" style={{ alignItems: 'baseline' }}><span className="t-small">Questa settimana</span><b className="num" style={{ fontSize: 20 }}>{week.length} di {DATA.TETTO_PUSH}</b></div>
                <Meter v={week.length / DATA.TETTO_PUSH} label="Push di questa settimana" />
                <div className="col" style={{ gap: 6 }}>
                  {week.map((c) => { const x = cellState(c); const F = DATA.FASCE.find((f) => f.id === c.fascia); return (
                    <div key={c.id} className="row" style={{ gap: 8 }}><Icon n={x.closed ? 'checkCircle' : 'clock'} size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} /><span className="t-small" style={{ color: 'var(--ink)' }}><b>{F.label} · {c.day === 0 ? 'oggi' : Pano.fmtDay(c.d)}</b> · {x.closed ? (x.me ? `vinta, ${x.me.pos}°` : 'inviata') : x.me ? `in gara, ${x.me.pos}°` : 'in gara, fuori'}</span></div>
                  ); })}
                </div>
                <span className="t-small">{week.length >= DATA.TETTO_PUSH ? 'Per le altre aste di questa settimana non puoi offrire: da lunedì si riparte.' : 'Puoi ancora offrire per un’altra push questa settimana.'}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── Notifiche in app (nella Posta, a prezzo fisso) ─────────────────────
  const POS_LBL = ['in cima alla Posta', 'subito sotto', 'a metà lista', 'in fondo'];
  Pano.POS_LBL = POS_LBL;
  function NotificheInApp() {
    const days = Pano.useStore((s) => s.posta);
    const sel = Pano.useStore((s) => (s.overlay && s.overlay.kind === 'posta' ? s.overlay.props : null));
    const mine = days.reduce((a, d) => a.concat(d.places.filter((p) => p.mine).map((p) => ({ d, p }))), []);
    const ora = (w) => (DATA.POSTA_ORE.find((o) => o.id === w) || DATA.POSTA_ORE[0]).time;
    return (
      <div className="p-page">
        <PageHead title="Notifiche in app" sub="Il tuo messaggio dentro l’app byup, nella Posta di chi è in zona, tra le «Promo per te». Non suona e non va sullo schermo bloccato: lo legge chi apre l’app. Quattro posti al giorno, a prezzo fisso."
          actions={<Pill icon="pin" tone="ink">Trastevere · 1,2 km</Pill>} />
        <div className="grid">
          <Card className="c-5 c-md-12 nt-prev" title="Nella Posta dell’app" icon="inbox" sub="Si apre dalla campanella, in alto nella home">
            <Pano.PhoneCrop screen="posta" from={52} h={400} fade="bottom" label="La Posta dell’app con il tuo messaggio, da vicino" />
          </Card>
          <HowCard
            items={[
              ['inbox', 'Sta nella Posta, non sullo schermo', 'Nella home di byup la campanella si accende; nella Posta, linguetta «Promo per te», il tuo messaggio compare con l’etichetta «Sponsorizzato». Niente suono.'],
              ['tag', 'Prezzo fisso, si prenota', 'Quattro posti al giorno per zona, il primo in cima. Scegli il giorno, il posto e se arriva alle 11:00 o alle 17:00. L’importo resta bloccato nel wallet fino all’invio; annulli fino al giorno prima.'],
              ['shield', 'Solo a chi ha acceso le promo', 'La vede solo chi in zona ha acceso le promo nell’app. «Già clienti» e «Per gusti» arrivano solo a chi ha acceso anche la profilazione.'],
            ]}
            other={<OtherLink to="push" icon="push" t="Vuoi arrivare sul telefono, anche ad app chiusa?" d="La push si vince all’asta, tre posti per volta." />} />
        </div>
        <Card title="I prossimi 7 giorni" icon="calendar" sub="Tocca un posto libero per prenotarlo. Si prenota fino al giorno prima."
          actions={<div className="legend"><span><i style={{ background: 'var(--iride-dot)' }} />Tuo</span><span><i style={{ background: 'var(--line-3)' }} />Preso</span><span><i className="lg-auc" />Libero</span></div>}>
          <div style={{ overflowX: 'auto', margin: '0 -22px', padding: '0 22px 4px' }}>
            <div className="dg pg">
              <span />
              {days.map((x) => <div key={x.id} className="dg-head"><span>{x.day === 1 ? 'domani' : Pano.GG[x.d.getDay()]}</span><b>{x.d.getDate()} {Pano.MM[x.d.getMonth()]}</b></div>)}
              {[1, 2, 3, 4].map((pos) => (
                <React.Fragment key={pos}>
                  <div className="dg-row-lbl"><b>{pos}° posto</b><small>{POS_LBL[pos - 1]}</small></div>
                  {days.map((x) => {
                    const p = x.places[pos - 1];
                    const taken = p.sold && !p.mine;
                    const on = sel && sel.dayId === x.id && sel.pos === pos;
                    return (
                      <button key={x.id} type="button" className={cx('pg-cell', p.mine && 'mine', taken && 'sold', on && 'sel')} disabled={taken} onClick={() => act.open('posta', { dayId: x.id, pos })}
                        aria-label={`Notifica in app ${Pano.fmtDayLong(x.d)}, ${pos}° posto: ${p.mine ? 'tuo' : taken ? 'preso' : 'libero'}, ${Pano.eur(p.price)}`}>
                        <span className="pg-st">{p.mine ? <><Icon n="checkCircle" />Tuo · {ora(p.when)}</> : taken ? `Preso · ${p.cat}` : 'Libero'}</span>
                        <b className="pg-pr num">{Pano.eur(p.price)}</b>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Card>
        <div className="grid">
          <Card className="c-8 c-md-12" title="Le tue notifiche in app" icon="history" sub="Quelle prenotate e quelle già arrivate, con quello che hanno portato.">
            <div className="list">
              {mine.map(({ d, p }) => (
                <div key={d.id} className="list-row click" onClick={() => act.open('posta', { dayId: d.id, pos: p.pos })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && act.open('posta', { dayId: d.id, pos: p.pos })}>
                  <span className="pill iride" style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', fontSize: 14 }}>{p.pos}°</span>
                  <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}><b>In app · {Pano.fmtDay(d.d)} · alle {ora(p.when)}</b><span className="t-small nt-msg">«{p.msg}»</span></div>
                  <Pill tone="info" size="sm" icon="clock">{Pano.eur(p.price)} bloccati</Pill>
                </div>
              ))}
              {DATA.POSTA_PAST.map((q) => (
                <div key={q.id} className="list-row">
                  <span className="pill" style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', fontSize: 14 }}>{q.pos}°</span>
                  <div className="col" style={{ gap: 2, flex: 1 }}><b>In app · {Pano.fmtDay(q.d)} · alle {String(q.d.getHours()).padStart(2, '0')}:00</b><span className="t-small">letta da {Pano.n(q.reads)} · {q.taps} tocchi · {q.bookings} prenotazioni · {q.covers} coperti</span></div>
                  <div className="col" style={{ gap: 2, alignItems: 'flex-end' }}><b className="num">{Pano.eur(q.revenue)}</b><span className="t-small">spesi {Pano.eur(q.price, true)} · ROAS {Pano.roas(q.revenue / q.price)}</span></div>
                </div>
              ))}
            </div>
          </Card>
          <div className="col c-4 c-md-12 nt-side">
            <Card title="Chi la vede" icon="users" sub="Solo chi in zona ha acceso le promo nell’app.">
              <div className="col" style={{ gap: 10 }}>
                <div className="row between" style={{ alignItems: 'flex-end' }}>
                  <div className="col" style={{ gap: 2 }}><BigNum v={4300} size="sm" /><span className="t-small">ogni giorno, in zona</span></div>
                  <div className="col" style={{ gap: 2, alignItems: 'flex-end' }}><b className="num" style={{ fontSize: 18 }}>1 su 3</b><span className="t-small">la apre</span></div>
                </div>
                <Meter v={0.35} label="Quanti aprono la Posta" />
                <span className="t-small">«Già clienti» e «Per gusti» arrivano solo a chi ha acceso anche la profilazione: circa 2.600 persone.</span>
              </div>
            </Card>
            <Card className="nt-fill" title="Riporta i tuoi clienti" icon="repeat" sub="Con «Già clienti» il messaggio arriva solo a chi è già passato da te, in modo anonimo.">
              <div className="row between"><div className="col" style={{ gap: 2 }}><BigNum v={420} size="sm" /><span className="t-small">non tornano da 60 giorni</span></div><Btn kind="secondary" size="sm" iconRight="arrowR" onClick={() => act.go('pubblico')}>Pubblico</Btn></div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pubblico anonimo ───────────────────────────────────────────────────
  function Pubblico() {
    return (
      <div className="p-page">
        <PageHead title="Pubblico" sub="Gruppi anonimi costruiti da byup con i dati di Fresh e dell'app. Scegli il gruppo, byup mostra l'annuncio: tu vedi solo i numeri."
          actions={<Pill tone="good" icon="shield">Niente nomi, email o telefoni · nessuna esportazione</Pill>} />
        <div className="grid">
          <div className="c-8 col" style={{ gap: 16 }}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {DATA.AUDIENCES.map((a) => (
                <section key={a.id} className="card" style={a.tooSmall ? { background: 'var(--card-2)' } : undefined}>
                  <div className="row between top">
                    <span className="card-head" style={{ margin: 0 }}><span className="ico"><Icon n={a.icon} /></span></span>
                    {a.tooSmall ? <Pill size="sm" icon="lock">Troppo piccolo</Pill> : <Delta v={a.trend} label={`${a.trend}% nell'ultimo mese`} />}
                  </div>
                  <h3 className="t-h3" style={{ marginTop: 12 }}>{a.name}</h3>
                  <p className="t-small" style={{ marginTop: 4, minHeight: 36 }}>{a.desc}</p>
                  <div className="row between" style={{ marginTop: 12, alignItems: 'flex-end' }}>
                    <div className="col" style={{ gap: 2 }}><BigNum v={a.size} size="sm" /><span className="t-small">persone</span></div>
                    {!a.tooSmall && (
                      <div className="col" style={{ gap: 4, width: 110 }} aria-label={`Pranzo ${Math.round(a.mix[0] * 100)}%, cena ${Math.round(a.mix[1] * 100)}%`}>
                        <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', gap: 2 }}><span style={{ flex: a.mix[0] || 0.001, background: 'var(--s3)' }} /><span style={{ flex: a.mix[1] || 0.001, background: 'var(--s1)' }} /></div>
                        <span className="t-small" style={{ fontSize: 11 }}>pranzo {Math.round(a.mix[0] * 100)}% · cena {Math.round(a.mix[1] * 100)}%</span>
                      </div>
                    )}
                  </div>
                  {a.tooSmall ? <Note style={{ marginTop: 12, fontSize: 12.5 }} icon="lock">Sotto le {DATA.MIN_AUDIENCE} persone un gruppo non si usa: resterebbe riconoscibile.</Note>
                    : <Btn kind="secondary" size="sm" block style={{ marginTop: 14 }} iconRight="arrowR" onClick={() => act.open('wizard', { goal: a.id === 'a6' ? 'pranzi' : 'prenotazioni', budget: 25 })}>{a.action}</Btn>}
                </section>
              ))}
              <section className="card soft" style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                <div className="row between"><span className="card-head" style={{ margin: 0 }}><span className="ico"><Icon n="plus" /></span></span><Phase f="f2" /></div>
                <h3 className="t-h3">Un gruppo su misura</h3>
                <p className="t-small">Combina gusti, orari e frequenza. Arriva con la seconda fase, sempre sopra le {DATA.MIN_AUDIENCE} persone.</p>
              </section>
            </div>
          </div>
          <div className="c-4 col" style={{ gap: 16 }}>
            <Card title="Come resta anonimo" icon="shield">
              <div className="col" style={{ gap: 12 }}>
                {[['Tu scegli il gruppo', 'byup decide a chi mostrare l’annuncio dentro quel gruppo.'], ['Vedi solo totali', 'Persone raggiunte, tocchi, prenotazioni, coperti. Mai le persone.'], ['Niente esportazioni', 'Nessun elenco da scaricare, nessun collegamento con WhatsApp o newsletter.'], ['Gruppi grandi', `Sotto le ${DATA.MIN_AUDIENCE} persone un gruppo non si può usare.`]].map(([t, s], i) => (
                  <div key={t} className="row top" style={{ gap: 12 }}><span className="pill" style={{ width: 26, height: 26, padding: 0, justifyContent: 'center' }}>{i + 1}</span><div className="col" style={{ gap: 1 }}><b style={{ fontSize: 13.5 }}>{t}</b><span className="t-small">{s}</span></div></div>
                ))}
              </div>
            </Card>
            <Card title="Da dove arrivano i numeri" icon="info">
              <div className="col" style={{ gap: 8 }}>
                <KV k="Conti pagati in Fresh" v="ultimi 90 giorni" />
                <KV k="Prenotazioni e ordini byup" v="ultimi 90 giorni" />
                <KV k="Ricerche e salvataggi in app" v="in zona" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── Risultati ──────────────────────────────────────────────────────────
  function Risultati() {
    const [per, setPer] = useState('30');
    const all = DATA.S30.days;
    const days = per === '7' ? all.slice(-7) : all;
    const k = per === 'prev' ? 0.86 : 1;
    const sum = (key) => days.reduce((a, d) => a + d[key], 0) * k;
    const spent = sum('spent'), revenue = sum('revenue'), covers = sum('covers'), reach = sum('reach'), taps = sum('taps'), bookings = sum('bookings');
    const roas = revenue / Math.max(1, spent);
    const camps = Pano.useStore((s) => s.campaigns).filter((c) => c.spent > 0);
    const byType = ['ricerca', 'push', 'inapp', 'offerta', 'evento'].map((t) => { const cs = camps.filter((c) => c.type === t); const sp = cs.reduce((a, c) => a + c.spent, 0), rv = cs.reduce((a, c) => a + c.revenue, 0); return { t, sp, rv }; }).filter((x) => x.sp > 0);
    const hm = [[3.2, 4.1, 6.8], [2.9, 3.6, 7.4], [3.4, 4.4, 8.1], [3.8, 5.2, 10.6], [4.1, 6.9, 11.4], [4.6, 7.8, 12.2], [6.2, 4.9, 8.8]];
    return (
      <div className="p-page">
        <PageHead title="Risultati" sub="Quanto hai speso, quanto ti è tornato, e dove rendi di più. Contati sui conti veri di Fresh."
          actions={<Seg value={per} onChange={setPer} options={[{ id: '7', label: '7 giorni' }, { id: '30', label: '30 giorni' }, { id: 'prev', label: 'Mese scorso' }]} label="Periodo" />} />
        <section className="card iride-soft" style={{ padding: 26 }}>
          <div className="row between wrap" style={{ gap: 20 }}>
            <div className="col" style={{ gap: 10, maxWidth: 760 }}>
              <span className="t-micro">{per === '7' ? 'Ultimi 7 giorni' : per === '30' ? 'Ultimi 30 giorni' : 'Settembre'}</span>
              <h2 className="t-display" style={{ fontSize: 'clamp(26px, 3.4vw, 42px)', lineHeight: 1.1 }}>Hai speso <span style={{ color: 'var(--s2)' }}>{Pano.eur(spent, true)}</span> e hai incassato <span style={{ color: 'var(--s1)' }}>{Pano.eur(revenue, false)}</span>.</h2>
              <p className="t-body" style={{ color: 'var(--muted)' }}>Ogni euro speso in Panorama ne ha portati <b style={{ color: 'var(--ink)' }}>{Pano.n2(roas)}</b> di conto pagato.</p>
            </div>
            <div className="col" style={{ alignItems: 'flex-end', gap: 6 }}>
              <span className="t-small">ROAS</span>
              <span className="big xl">{Pano.n1(roas)}<span className="dec">×</span></span>
              <Delta v={per === 'prev' ? -4 : 12} label="rispetto al periodo prima" />
            </div>
          </div>
        </section>
        <div className="grid">
          <StatCard className="c-3" label="Persone raggiunte" icon="eye" foot={<Delta v={9} />}><BigNum v={reach} size="md" /></StatCard>
          <StatCard className="c-3" label="Tocchi sull'annuncio" icon="tap" foot={<span>{Pano.pct((taps / reach) * 100, 1)} di chi lo vede</span>}><BigNum v={taps} size="md" /></StatCard>
          <StatCard className="c-3" label="Coperti" icon="cutlery" foot={<span>{Pano.n(bookings)} prenotazioni</span>}><BigNum v={covers} size="md" /></StatCard>
          <StatCard className="c-3" label="Costo per coperto" icon="euro" foot={<Delta v={-8} invert />}><Money v={spent / Math.max(1, covers)} size="md" dec /></StatCard>
        </div>
        <Card title="Incassato e speso, giorno per giorno" icon="chart" actions={<div className="legend"><span><i style={{ background: 'var(--s1)' }} />Incassato</span><span><i style={{ background: 'var(--s2)' }} />Speso</span></div>}>
          <Pano.DailyChart days={days} />
        </Card>
        <div className="grid">
          <Card className="c-6" title="Dal vedere al sedersi" icon="filter"><Pano.Funnel steps={[{ k: 'Raggiunti', v: reach }, { k: 'Tocchi', v: taps }, { k: 'Prenotazioni', v: bookings }, { k: 'Coperti', v: covers, note: `${Pano.n1(covers / Math.max(1, bookings))} a prenotazione` }]} /></Card>
          <Card className="c-6" title="Dove rendi di più" icon="grid" sub="ROAS per posizionamento">
            <Pano.HBars items={byType.map((x) => ({ k: DATA.TIPI[x.t].short, icon: DATA.TIPI[x.t].icon, v: x.rv / x.sp }))} fmt={(v) => Pano.roas(v)} />
            <div className="hr" style={{ margin: '16px 0' }} />
            <div className="col" style={{ gap: 6 }}>{byType.map((x) => <KV key={x.t} k={DATA.TIPI[x.t].label} v={`${Pano.eur(x.sp)} → ${Pano.eur(x.rv)}`} />)}</div>
          </Card>
        </div>
        <div className="grid">
          <Card className="c-7" title="Quando rendi di più" icon="clock" sub="ROAS medio per giorno e fascia, ultimi 30 giorni">
            <Pano.Heatmap rows={['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']} cols={['Pranzo', 'Aperitivo', 'Cena']} values={hm} fmt={(v) => Pano.n1(v) + '×'} label="ROAS per giorno e fascia" />
            <Note tone="iride" icon="sparkle" style={{ marginTop: 14 }}><b>Byuppino:</b> venerdì e sabato sera rendono più del doppio del pranzo feriale. Sposta lì una parte del budget del martedì.</Note>
          </Card>
          <Card className="c-5" title="Le campagne che rendono" icon="megaphone">
            <div className="list">
              {camps.slice().sort((a, b) => b.revenue / b.spent - a.revenue / a.spent).map((c) => (
                <div key={c.id} className="list-row click" onClick={() => act.open('campagna', { id: c.id })} role="button" tabIndex={0}>
                  <Thumb img={c.creative.img} bg={c.creative.bg} />
                  <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}><b style={{ fontSize: 13.5 }}>{c.name}</b><span className="t-small">{Pano.eur(c.spent)} → {Pano.eur(c.revenue)}</span></div>
                  <Pill size="sm" tone={c.revenue / c.spent > 6 ? 'good' : ''}>{Pano.roas(c.revenue / c.spent)}</Pill>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Note icon="info"><b>Come contiamo.</b> Un coperto è di Panorama quando una persona tocca un annuncio e poi prenota od ordina con byup entro 7 giorni, e il conto passa da Fresh. L'incasso è quello del conto pagato, non una stima.</Note>
      </div>
    );
  }

  // ─── Wallet ─────────────────────────────────────────────────────────────
  // Bento pulito su due colonne: wallet e limiti in alto, alla pari; sotto, a
  // sinistra ricarica automatica (con i bonus dentro) e metodi di pagamento, a
  // destra i movimenti, alti quanto le due schede accanto (scorrono dentro).
  function Wallet() {
    const w = Pano.useStore((s) => s.wallet);
    const [limits, setLimits] = useState(false);
    const monthUse = w.spentMonth / w.limits.month;
    const kindTone = { ricarica: 'good', bonus: 'iride', rimborso: 'info', addebito: '', blocco: 'warn', sblocco: 'info' };
    const kindLabel = { ricarica: 'Ricarica', bonus: 'Bonus', rimborso: 'Rimborso', addebito: 'Addebito', blocco: 'Bloccato', sblocco: 'Sbloccato' };
    const days = Math.max(1, Math.round(w.balance / 31));
    const R = DATA.RICARICHE;
    const tier = R.find((r) => r.v === w.auto.amount) || R[2];
    const setAuto = (patch, msg) => { act.wallet({ auto: Object.assign({}, w.auto, patch) }); if (msg) Pano.toast(msg); };
    return (
      <div className="p-page">
        <PageHead title="Wallet" sub="Crediti prepagati per tutto Panorama. Ricarichi quando vuoi: più ricarichi, più bonus."
          actions={<Btn kind="primary" icon="plus" onClick={() => act.open('ricarica')}>Ricarica</Btn>} />
        <div className="wl-bento">
          <div className="wcard wl-card">
            <div className="row between"><img className="wmark" src={Pano.IMG.markInk} alt="" /><span className="wsmall">Crediti Panorama</span></div>
            <div className="col" style={{ gap: 4, marginTop: 'auto' }}>
              <span className="wsmall">Saldo disponibile</span>
              <Money v={w.balance} size="xl" dec className="wbal" />
              <span className="wsmall">di cui {Pano.eur(w.bonus, true)} di bonus · circa {days} giorni al ritmo attuale</span>
            </div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <Btn kind="primary" size="sm" icon="plus" onClick={() => act.open('ricarica')}>Ricarica</Btn>
              <span className="pill" style={{ background: 'rgba(255,255,255,.6)', boxShadow: 'none', color: '#1B1730' }}><Icon n="gift" />{tier.bonus ? `Con ${Pano.eur(tier.v)} ricevi +${Pano.eur(tier.bonus)}` : 'Bonus da 100 € in su'}</span>
            </div>
          </div>
          <Card className="wl-lim" title="Limiti di spesa" icon="shield" actions={<Btn kind="ghost" size="sm" icon="edit" onClick={() => setLimits(!limits)}>{limits ? 'Fatto' : 'Modifica'}</Btn>}>
            <div className="col" style={{ gap: 18 }}>
              <div className="col" style={{ gap: 8 }}>
                <div className="row between"><b>Oggi</b><span className="num t-small"><b className="t-strong">{Pano.eur(w.spentToday, true)}</b> di {Pano.eur(w.limits.day)}</span></div>
                <Meter v={w.spentToday / w.limits.day} label="Limite giornaliero usato" />
                {limits && <Range min={10} max={120} value={w.limits.day} onChange={(v) => act.wallet({ limits: Object.assign({}, w.limits, { day: v }) })} label="Limite giornaliero" />}
              </div>
              <div className="col" style={{ gap: 8 }}>
                <div className="row between"><b>Ottobre</b><span className="num t-small"><b className="t-strong">{Pano.eur(w.spentMonth, true)}</b> di {Pano.eur(w.limits.month)}</span></div>
                <Meter v={monthUse} tone={monthUse >= w.alertAt ? 'warn' : ''} ticks={[w.alertAt]} label="Limite mensile usato" />
                {limits && <Range min={200} max={3000} step={50} value={w.limits.month} onChange={(v) => act.wallet({ limits: Object.assign({}, w.limits, { month: v }) })} label="Limite mensile" />}
              </div>
              {monthUse >= w.alertAt && <Note tone="warn"><b>Hai usato il {Pano.pct(monthUse * 100)} del limite di ottobre.</b> Restano {Pano.eur(w.limits.month - w.spentMonth, true)}: arrivato al limite, le campagne si fermano fino a novembre.</Note>}
            </div>
          </Card>
          <Card className="wl-auto" title="Ricarica automatica" icon="bolt" sub={w.auto.on ? `Attiva · quando il saldo scende sotto ${Pano.eur(w.auto.under)}` : 'Spenta · ricarichi tu quando vuoi'}
            actions={<Switch on={w.auto.on} onChange={(v) => setAuto({ on: v }, v ? 'Ricarica automatica attiva' : 'Ricarica automatica spenta')} label="Ricarica automatica" />}>
            <span className="t-small wl-auto-q">Quanto ricarichiamo, con il bonus già dentro:</span>
            <div className="wl-tiers" role="radiogroup" aria-label="Importo della ricarica automatica">
              {R.map((r) => (
                <button key={r.v} type="button" role="radio" aria-checked={w.auto.amount === r.v} className={cx('wl-tier', w.auto.amount === r.v && 'on')} disabled={!w.auto.on}
                  onClick={() => setAuto({ amount: r.v }, `Ricarica automatica da ${Pano.eur(r.v)}${r.bonus ? ` con +${Pano.eur(r.bonus)} di bonus` : ''}`)}>
                  <b>{Pano.eur(r.v)}</b>
                  <span className={cx('wl-bonus', r.bonus && 'yes')}>{r.bonus ? `+${Pano.eur(r.bonus)}` : 'senza bonus'}</span>
                </button>
              ))}
            </div>
            <span className="t-small wl-auto-f"><Icon n="gift" size={14} />Lo stesso bonus vale anche quando ricarichi a mano.</span>
          </Card>
          <Card className="wl-methods" id="metodi" title="Metodi di pagamento" icon="card" sub="Con cosa paghi le ricariche · scorrono da sole, o trascinale">
            <Pano.PayStack full />
          </Card>
          <Card className="wl-mov" title="Movimenti" icon="receipt" sub="Gli addebiti delle campagne si chiudono a fine giornata.">
            <div className="wl-mov-scroll">
              <table className="table">
                <thead><tr><th>Data</th><th>Descrizione</th><th>Tipo</th><th className="r">Importo</th></tr></thead>
                <tbody>
                  {w.movements.map((m) => (
                    <tr key={m.id}>
                      <td className="t-muted" style={{ whiteSpace: 'nowrap' }}>{m.at.getDate()} {Pano.MM[m.at.getMonth()]} · {String(m.at.getHours()).padStart(2, '0')}:{String(m.at.getMinutes()).padStart(2, '0')}</td>
                      <td style={{ fontWeight: 600 }}>{m.t}</td>
                      <td><Pill size="sm" tone={kindTone[m.kind]}>{kindLabel[m.kind]}</Pill></td>
                      <td className="r" style={{ fontWeight: 800, color: m.v > 0 ? 'var(--good-ink)' : 'var(--ink)', whiteSpace: 'nowrap' }}>{Pano.eurSigned(m.v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  Object.assign(Pano, { Campagne, NotifichePush, NotificheInApp, Pubblico, Risultati, Wallet });
})();
