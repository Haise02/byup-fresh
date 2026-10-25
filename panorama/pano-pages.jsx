// ═══════════════════════════════════════════════════════════════════════
// Panorama · sezioni condivise: Campagne, Notifiche, Pubblico, Risultati,
// Wallet, Accesso. Le tre varianti le vestono con il proprio stile.
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

  // ─── Notifiche (digest di zona) ─────────────────────────────────────────
  // Dal 25 ottobre: i tre posti scritti nella push si vincono all'asta (busta chiusa,
  // secondo prezzo, chiusura 15 minuti prima); il 4° e il 5° stanno nella lista in app,
  // a prezzo fisso. Lo stato di una casella, per la griglia, il cassetto e l'elenco.
  function cellState(c, all) {
    const a = c.auction;
    const closed = a.status === 'chiusa';
    const res = closed ? Object.assign({ offers: a.rivals.length + (a.my ? 1 : 0), need: a.reserve, rivalTrattoria: false }, a.result) : Pano.settleAuction(a, a.my && a.my.max);
    const me = res.me;
    const myList = c.slots.find((x) => x.mine);
    let st, tone, sub;
    if (closed) { st = me ? `Inviato · eri ${me.pos}°` : myList ? `Inviato · in app ${myList.pos}°` : 'Inviato'; tone = 'muted'; sub = me ? `pagati ${Pano.eur(me.paid, true)}` : `${Pano.n(c.reach)} raggiunti`; }
    else if (a.my) { st = me ? `Tua offerta · ${me.pos}°` : 'Tua offerta · fuori'; tone = me ? 'mine' : 'warn'; sub = `max ${Pano.eur(a.my.max)} · chiude ${a.closeAt}`; }
    else if (myList) { st = `In app · ${myList.pos}° posto`; tone = 'mine'; sub = `${Pano.eur(myList.price)} · bloccati`; }
    else if (all && Pano.pushWeek && Pano.pushWeek(all, c).length >= DATA.TETTO_PUSH) { st = 'Tetto raggiunto'; tone = 'muted'; sub = 'già 2 push questa settimana'; }
    else if (res.rivalTrattoria) { st = 'C’è un’altra trattoria'; tone = 'warn'; sub = `servono ${Pano.eur(res.need)}`; }
    else { st = 'Asta aperta'; tone = 'free'; sub = `${res.offers} offerte · da ${Pano.eur(a.reserve)}`; }
    return { closed, res, me, myList, st, tone, sub };
  }
  Pano.cellState = cellState;

  function Notifiche() {
    const cells = Pano.useStore((s) => s.digest);
    const sel = Pano.useStore((s) => (s.overlay && s.overlay.kind === 'slot' ? s.overlay.props.cellId : null));
    const days = Array.from({ length: 7 }, (_, i) => Pano.addDays(Pano.TODAY, i));
    const offerte = cells.filter((c) => c.auction.my && c.auction.status !== 'chiusa');
    const inApp = cells.filter((c) => !c.past && c.slots.some((x) => x.mine));
    return (
      <div className="p-page">
        <PageHead title="Notifiche" sub="Le notifiche le manda solo byup, una per zona e fascia. I tre posti scritti nella push si vincono all’asta, fino a 15 minuti prima dell’invio; il 4° e il 5° stanno nella lista in app, a prezzo fisso."
          actions={<><Pill icon="pin" tone="ink">Trastevere · 1,2 km</Pill><Btn kind="secondary" icon="history" onClick={() => document.getElementById('pn-prenotazioni') && document.getElementById('pn-prenotazioni').scrollIntoView({ behavior: 'smooth' })}>Le tue offerte</Btn></>} />
        <div className="grid">
          {[['bell', 'La push si vince all’asta', 'Busta chiusa: offri il massimo che spenderesti e paghi solo quanto basta per superare chi ti segue.'], ['phone', 'La lista in app a prezzo fisso', 'Il 4° e il 5° posto, nella lista che si apre dalla push. Si prenotano come sempre, da € 5.'], ['shield', 'Uno per categoria, poche a testa', 'Una trattoria per push. Al massimo 2 push sponsorizzate a settimana a persona, e 2 vinte a locale.']].map(([ic, t, d]) => (
            <div key={t} className="card tight c-4"><div className="row top" style={{ gap: 12 }}><span className="card-head" style={{ margin: 0 }}><span className="ico"><Icon n={ic} /></span></span><div className="col" style={{ gap: 2 }}><b>{t}</b><span className="t-small">{d}</span></div></div></div>
          ))}
        </div>
        <Card title="I prossimi 7 giorni" icon="calendar" sub="Tocca una casella: l’asta della push e la lista in app."
          actions={<div className="legend"><span><i className="lg-auc" />Push all’asta</span><span><i style={{ background: 'var(--iride-dot)' }} />Tuo</span><span><i style={{ background: 'var(--line-3)' }} />Preso</span><span><i style={{ background: 'var(--paper-2)', boxShadow: 'inset 0 0 0 1px var(--line-2)' }} />Libero in app</span></div>}>
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
                      <button key={i} type="button" className={cx('dg-cell', x.tone === 'mine' && 'mine', sel === c.id && 'sel')} onClick={() => act.open('slot', { cellId: c.id })} aria-label={`${F.label} ${Pano.fmtDayLong(d)}: ${x.st}, ${x.sub}`}>
                        <span className="slots" aria-hidden="true">
                          {[1, 2, 3].map((k) => { const w = x.res.win.find((y) => y.pos === k); return <i key={k} className={cx('auc', w && w.me && 'mine', x.closed && w && !w.me && 'sold')} />; })}
                          <em />
                          {c.slots.map((sl) => <i key={sl.pos} className={sl.mine ? 'mine' : sl.sold ? 'sold' : ''} />)}
                        </span>
                        <span className="dg-st" style={{ color: x.tone === 'warn' ? 'var(--warn-ink)' : x.tone === 'muted' ? 'var(--muted)' : 'var(--ink)' }}>
                          {x.tone === 'mine' && <Icon n="checkCircle" />}{x.tone === 'warn' && <Icon n="alert" />}{x.tone === 'free' && <Icon n="bell" />}{x.st}
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
          <Card className="c-8" title="Le tue offerte e prenotazioni" icon="history" id="pn-prenotazioni">
            <div className="list">
              {offerte.map((c) => { const x = cellState(c); const F = DATA.FASCE.find((f) => f.id === c.fascia); return (
                <div key={c.id} className="list-row click" onClick={() => act.open('slot', { cellId: c.id })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && act.open('slot', { cellId: c.id })}>
                  <span className="pill iride" style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', fontSize: 14 }}>{x.me ? `${x.me.pos}°` : '—'}</span>
                  <div className="col" style={{ gap: 2, flex: 1 }}><b>Push {F.label} · {Pano.fmtDay(c.d)} · {c.time}</b><span className="t-small">Offerta massima {Pano.eur(c.auction.my.max)} · {x.me ? `oggi saresti ${x.me.pos}° e pagheresti ${Pano.eur(x.me.paid, true)}` : `oggi resteresti fuori: servono ${Pano.eur(x.res.need)}`}</span></div>
                  <Pill tone={x.me ? 'info' : 'warn'} size="sm" icon="clock">Chiude alle {c.auction.closeAt}</Pill>
                </div>
              ); })}
              {inApp.map((c) => { const sl = c.slots.find((y) => y.mine); const F = DATA.FASCE.find((f) => f.id === c.fascia); return (
                <div key={c.id + 'l'} className="list-row click" onClick={() => act.open('slot', { cellId: c.id, tab: 'lista' })} role="button" tabIndex={0}>
                  <span className="pill" style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', fontSize: 14 }}>{sl.pos}°</span>
                  <div className="col" style={{ gap: 2, flex: 1 }}><b>Lista in app · {F.label} · {Pano.fmtDay(c.d)} · {c.time}</b><span className="t-small">≈ {Pano.n(c.reach)} persone · {Pano.eur(sl.price)} bloccati fino all'invio</span></div>
                  <Pill tone="info" size="sm" icon="clock">In arrivo</Pill>
                </div>
              ); })}
              {DATA.BOOKINGS_PAST.map((bk) => { const F = DATA.FASCE.find((f) => f.id === bk.fascia); return (
                <div key={bk.id} className="list-row">
                  <span className="pill" style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', fontSize: 14 }}>{bk.pos}°</span>
                  <div className="col" style={{ gap: 2, flex: 1 }}><b>Digest {F.label} · {Pano.fmtDay(bk.d)}{bk.today ? ' · oggi' : ''}</b><span className="t-small">{Pano.n(bk.reach)} raggiunti · {bk.taps} tocchi · {bk.bookings} prenotazioni · {bk.covers} coperti</span></div>
                  <div className="col" style={{ gap: 2, alignItems: 'flex-end' }}><b className="num">{Pano.eur(bk.revenue)}</b><span className="t-small">spesi {Pano.eur(bk.price, true)} · ROAS {Pano.roas(bk.revenue / bk.price)}</span></div>
                </div>
              ); })}
            </div>
          </Card>
          <div className="col c-4" style={{ gap: 16 }}>
            <section className="card ink" style={{ padding: 22, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 'auto -40px -60px auto', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(252,187,248,.45), transparent 65%)' }} />
              <div className="row between" style={{ position: 'relative' }}><span className="t-micro" style={{ color: 'rgba(255,255,255,.7)' }}>Formato raro</span><span className="row" style={{ gap: 6 }}><Pill size="sm" style={{}} tone="iride">Su approvazione</Pill><Phase f="f2" /></span></div>
              <h3 className="t-title" style={{ color: '#fff', marginTop: 12, position: 'relative' }}>Una notifica solo tua</h3>
              <p className="t-small" style={{ color: 'rgba(255,255,255,.75)', marginTop: 6, position: 'relative' }}>Pochissime a settimana per città, decide byup. Per serate speciali: un concerto, un menù unico. Da € 120.</p>
              <Btn kind="light" size="sm" icon="bell" style={{ marginTop: 14, position: 'relative' }} onClick={() => Pano.toast('Ti avvisiamo quando la notifica dedicata è disponibile')}>Avvisami quando arriva</Btn>
            </section>
            <Card title="Riporta i tuoi clienti" icon="repeat" sub="Raggiungi solo chi è già passato da te, in modo anonimo.">
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
    const byType = ['ricerca', 'digest', 'offerta', 'evento'].map((t) => { const cs = camps.filter((c) => c.type === t); const sp = cs.reduce((a, c) => a + c.spent, 0), rv = cs.reduce((a, c) => a + c.revenue, 0); return { t, sp, rv }; }).filter((x) => x.sp > 0);
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

  // ─── Accesso: gli stati, da Fresh a Panorama ────────────────────────────
  const STATI_ACC = [
    { id: 'non-richiesto', label: 'Non richiesto' }, { id: 'richiesto', label: 'Richiesto' }, { id: 'revisione', label: 'In revisione' }, { id: 'approvato', label: 'Approvato' },
    { id: 'attesa', label: 'Lista d’attesa' }, { id: 'rifiutato', label: 'Rifiutato' }, { id: 'sospeso', label: 'Sospeso' },
  ];
  function FreshCard({ s }) {
    const cta = { 'non-richiesto': ['Richiedi accesso', 'send'], richiesto: ['Richiesta inviata', 'check'], revisione: ['In valutazione', 'hourglass'], approvato: ['Apri Panorama', 'external'], attesa: ['Sei in lista d’attesa', 'clock'], rifiutato: ['Riprova dal 24 novembre', 'clock'], sospeso: ['Accesso sospeso', 'ban'] }[s];
    const text = {
      'non-richiesto': 'Metti Cacio e Pepe in cima all’app byup, quando ti serve. Accesso su richiesta.',
      richiesto: 'Abbiamo ricevuto la richiesta. Ti rispondiamo entro 48 ore, qui e via email.',
      revisione: 'Stiamo guardando come usi Fresh e come va il locale in app.',
      approvato: 'Il tuo accesso è pronto. Si apre in una nuova scheda, con lo stesso account.',
      attesa: 'Trastevere ha già molti locali attivi. Appena si libera posto, sei tra i primi.',
      rifiutato: 'Per ora no: completa il profilo e torna a richiederlo tra un mese.',
      sospeso: 'Le campagne sono in pausa. Il saldo del wallet resta tuo.',
    }[s];
    return (
      <div style={{ borderRadius: 24, background: '#FFFFFF', color: '#1A1A1A', padding: 18, boxShadow: '0 1px 2px rgba(0,0,0,.05), 0 16px 34px -18px rgba(255,31,90,.35), inset 0 0 0 1px rgba(0,0,0,.06)', fontFamily: 'var(--font)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: 999, background: 'radial-gradient(circle, rgba(252,187,248,.6), transparent 70%)' }} />
        <div className="row between" style={{ position: 'relative' }}>
          <img src={Pano.IMG.logoInk} alt="Panorama" style={{ height: 22 }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#FF1F5A', background: 'rgba(255,31,90,.1)', padding: '4px 8px', borderRadius: 99 }}>{s === 'approvato' ? 'NUOVO' : 'SU RICHIESTA'}</span>
        </div>
        <p style={{ margin: '12px 0 14px', fontSize: 14, fontWeight: 600, lineHeight: 1.45, position: 'relative', color: '#3A3A44' }}>{text}</p>
        <button type="button" disabled={s !== 'non-richiesto' && s !== 'approvato'} onClick={() => { if (s === 'non-richiesto') Pano.store.set({ access: 'richiesto' }); if (s === 'approvato') act.open('onboarding'); }}
          style={{ height: 40, padding: '0 16px', borderRadius: 99, background: s === 'non-richiesto' || s === 'approvato' ? '#FF1F5A' : 'rgba(0,0,0,.06)', color: s === 'non-richiesto' || s === 'approvato' ? '#fff' : '#3A3A44', fontWeight: 700, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <Icon n={cta[1]} size={16} />{cta[0]}
        </button>
      </div>
    );
  }
  function Accesso() {
    const s = Pano.useStore((st) => st.access);
    const set = (v) => Pano.store.set({ access: v });
    return (
      <div className="p-page">
        <PageHead eyebrow="Prototipo · stati dell'accesso" title="Accesso a Panorama" sub="Panorama è solo su invito o approvazione: nessun nuovo account, basta Fresh. Scegli uno stato per vedere cosa vede il locale, in Fresh e qui."
          actions={<Btn kind="secondary" icon="sparkle" onClick={() => act.open('onboarding')}>Prova il primo accesso</Btn>} />
        <Seg value={s} onChange={set} options={STATI_ACC} label="Stato dell'accesso" />
        <div className="grid">
          <div className="c-5 col" style={{ gap: 16 }}>
            <span className="t-micro">In Fresh · card nella dashboard</span>
            <FreshCard s={s} />
            <span className="t-micro" style={{ marginTop: 6 }}>In Fresh · scorciatoie</span>
            <div style={{ borderRadius: 22, background: '#fff', color: '#1A1A1A', padding: 14, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }}>
              <div className="row" style={{ gap: 12 }}>
                <Thumb img={Pano.IMG.lasagna} bg={Pano.BG.notte} />
                <div className="col" style={{ gap: 1, flex: 1 }}><b style={{ fontSize: 14 }}>Halloween in trattoria</b><span style={{ fontSize: 12, color: '#6B6B75', fontWeight: 600 }}>Evento · sab 31 ott · 20:00</span></div>
                <button type="button" disabled={s !== 'approvato'} onClick={() => act.open('promuovi', { kind: 'evento', pickId: 'e2' })} style={{ height: 34, padding: '0 12px', borderRadius: 99, background: s === 'approvato' ? '#131316' : 'rgba(0,0,0,.06)', color: s === 'approvato' ? '#fff' : '#8C8B99', fontWeight: 700, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon n="sparkle" size={14} />Promuovi</button>
              </div>
              <div style={{ marginTop: 12, padding: 12, borderRadius: 16, background: 'linear-gradient(100deg,#EEF5FE,#FDEBFB,#EEEEFD)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <Pano.ByuppinoFace size={36} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#2D2D35', lineHeight: 1.4 }}><b>Suggerimento:</b> Halloween è tra una settimana. {s === 'approvato' ? 'Un tocco e va in cima alla tua vetrina.' : 'Con Panorama lo metti in cima alla tua vetrina.'}</span>
              </div>
            </div>
          </div>
          <div className="c-7 col" style={{ gap: 16 }}>
            <span className="t-micro">In Panorama</span>
            {(s === 'non-richiesto' || s === 'richiesto' || s === 'revisione') && (
              <Card title={s === 'non-richiesto' ? 'Cosa guardiamo per darti l’accesso' : s === 'richiesto' ? 'Richiesta ricevuta' : 'Stiamo valutando'} icon={s === 'revisione' ? 'hourglass' : 'checkCircle'}>
                {s !== 'non-richiesto' && (
                  <div className="row wrap" style={{ gap: 18, marginBottom: 16 }}>
                    {[['Richiesta', true], ['Valutazione', s === 'revisione' ? 'now' : false], ['Risposta', false]].map(([t, st]) => <span key={t} className="row" style={{ gap: 6, fontSize: 13, fontWeight: 700, opacity: st ? 1 : 0.5 }}><Icon n={st === true ? 'checkCircle' : st === 'now' ? 'hourglass' : 'clock'} size={16} />{t}</span>)}
                  </div>
                )}
                <div className="col" style={{ gap: 10 }}>
                  {DATA.IDONEITA.map((r) => <div key={r.t} className={cx('check-row', r.ok ? 'ok' : 'ko')}><Icon n={r.ok ? 'checkCircle' : 'alertCircle'} /><span style={{ flex: 1 }}><b>{r.t}</b> · <span className="t-muted">{r.v}</span></span></div>)}
                </div>
                <Note tone="info" style={{ marginTop: 14 }}>Non ci sono soglie segrete da indovinare: più usi Fresh e più il locale va bene in app, prima entri. Il profilo completo aiuta.</Note>
                {s === 'non-richiesto' && <p className="t-small" style={{ marginTop: 12 }}>Si parte dalla card di Panorama nella dashboard di Fresh: tocca «Richiedi accesso».</p>}
                {s !== 'non-richiesto' && (
                  <div className="row wrap" style={{ gap: 10, marginTop: 14 }}>
                    <Btn kind="primary" size="sm" iconRight="arrowR" onClick={() => set(s === 'richiesto' ? 'revisione' : 'approvato')}>{s === 'richiesto' ? 'Avanti: la valuta byup' : 'Avanti: accesso approvato'}</Btn>
                    <span className="t-small">Nel prototipo salti l'attesa di 48 ore.</span>
                  </div>
                )}
              </Card>
            )}
            {s === 'approvato' && (
              <section className="card iride-soft" style={{ padding: 26 }}>
                <div className="row wrap" style={{ gap: 20, alignItems: 'center' }}>
                  <img src={Pano.IMG.byuppino} alt="" style={{ width: 150, filter: 'drop-shadow(0 18px 26px rgba(90,60,160,.3))' }} />
                  <div className="col" style={{ gap: 10, flex: 1, minWidth: 220 }}>
                    <h2 className="t-title">Accesso approvato</h2>
                    <p className="t-body" style={{ color: 'var(--muted)' }}>Tre passi brevi: benvenuto, regole dei contenuti, primo caricamento del wallet.</p>
                    <div><Btn kind="primary" icon="arrowR" onClick={() => act.open('onboarding')}>Inizia</Btn></div>
                  </div>
                </div>
              </section>
            )}
            {s === 'attesa' && (
              <Card title="Sei in lista d'attesa" icon="clock">
                <div className="row wrap" style={{ gap: 24 }}>
                  <div className="col" style={{ gap: 2 }}><span className="t-small">Posizione a Trastevere</span><BigNum v={7} size="lg" suffix="°" /></div>
                  <div className="col" style={{ gap: 6, flex: 1, minWidth: 220 }}>
                    <p className="t-body">Teniamo pochi locali per zona, così gli annunci restano pochi e utili. Quando si libera posto ti avvisiamo in Fresh.</p>
                    <Meter v={0.7} tone="iride" label="Avanzamento in lista" />
                  </div>
                </div>
              </Card>
            )}
            {s === 'rifiutato' && (
              <Card title="Per ora non possiamo attivarlo" icon="alertCircle">
                <div className="col" style={{ gap: 10 }}>
                  {[['Profilo al 92%', 'Manca il menù delle bevande in Fresh.'], ['Poche prenotazioni da byup negli ultimi 30 giorni', 'Ne servono di più per misurare i risultati.']].map(([t, d]) => <div key={t} className="check-row ko"><Icon n="alertCircle" /><span><b>{t}</b> · <span className="t-muted">{d}</span></span></div>)}
                </div>
                <Note tone="info" style={{ marginTop: 14 }}>Puoi richiederlo di nuovo dal <b>24 novembre</b>. Nel frattempo il locale resta visibile in app come sempre.</Note>
              </Card>
            )}
            {s === 'sospeso' && (
              <Card title="Accesso sospeso" icon="ban">
                <Note tone="bad"><b>Motivo:</b> più segnalazioni sull'offerta «Aperitivo 2x1»: il prezzo in app non corrispondeva a quello al tavolo.</Note>
                <div className="col" style={{ gap: 8, marginTop: 14 }}>
                  <KV k="Campagne" v="tutte in pausa" />
                  <KV k="Saldo del wallet" v={Pano.eur(184.2, true) + ' · resta tuo'} />
                  <KV k="Prenotazioni nel digest" v="annullate e rimborsate" />
                </div>
                <div className="row" style={{ marginTop: 16, gap: 10 }}><Btn kind="primary" icon="help">Scrivi all'assistenza byup</Btn></div>
              </Card>
            )}
            <Note icon="info">Le richieste arrivano in <b>Desk</b> con i dati del locale già compilati e un punteggio di idoneità; il team approva, rifiuta o mette in lista d'attesa, e può invitare un locale a mano.</Note>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(Pano, { Campagne, Notifiche, Pubblico, Risultati, Wallet, Accesso });
})();
