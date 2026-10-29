// ═══════════════════════════════════════════════════════════════════════
// Panorama · flussi: Promuovi in un tap, procedura guidata (anche in
// modalità «correggi»), ricarica, dettaglio campagna, asta della push,
// posto nella notifica in app, benvenuto e regole, avvisi.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useEffect, useMemo, useRef } = React;
  const { Icon, Btn, IconBtn, Pill, Phase, Seg, Chips, Switch, Range, Meter, Money, Card, Note, Modal, Drawer, Thumb, StatusPill, KV, cx } = Pano;
  const DATA = Pano.DATA;
  const act = Pano.act;

  // ─── Promuovi in un tap ─────────────────────────────────────────────────
  // È una scorciatoia, non una campagna: mette un piatto o un evento in cima
  // alla tua vetrina, a prezzo fisso. Gli spazi dell'app dove i locali si
  // contendono la visibilità (ricerca, eventi, offerte, notifiche) passano sempre
  // dalla procedura completa, «Nuova campagna».
  function QuickPromote({ kind: k0 = 'piatto', pickId, days: d0 }) {
    const wallet = Pano.useStore((s) => s.wallet);
    const V = DATA.VETRINA;
    const first = (k) => (k === 'evento' ? V.eventi : V.piatti)[0];
    const [kind, setKind] = useState(k0);
    const [pick, setPick] = useState(() => [...V.piatti, ...V.eventi].find((x) => x.id === pickId) || first(k0));
    const [days, setDays] = useState(d0 || (k0 === 'evento' ? (pick.daysTo || 7) : 3));
    const [phase, setPhase] = useState('form'); // form | sending | done
    const list = kind === 'evento' ? V.eventi : V.piatti;
    const durate = kind === 'evento'
      ? [{ id: pick.daysTo || 7, label: `Fino all’evento · ${pick.daysTo || 7} giorni` }, { id: 3, label: '3 giorni' }]
      : [{ id: 1, label: 'Oggi' }, { id: 3, label: '3 giorni' }, { id: 7, label: '1 settimana' }];
    const f = Pano.forecastVetrina(days);
    const low = f.cost > wallet.balance;
    const end = Pano.addDays(Pano.TODAY, days - 1);
    const switchKind = (k) => { const p = first(k); setKind(k); setPick(p); setDays(k === 'evento' ? (p.daysTo || 7) : 3); };
    const choose = (p) => { setPick(p); if (p.kind === 'evento') setDays(p.daysTo || 7); };
    const send = () => {
      setPhase('sending');
      setTimeout(() => {
        const id = act.vetrinaPromote({ pick, days });
        setPhase('done');
        Pano.toast(`${pick.title} è in cima alla vetrina`, { undo: () => act.removeCampaign(id) });
      }, 700);
    };
    const preview = <Pano.PhoneCrop screen="vetrina" creative={{ title: pick.title, pick }} from={-11} h={720} fade="bottom" max={0.62} label={`Anteprima: ${pick.title} in evidenza nella vetrina di Cacio e Pepe`} />;
    if (phase === 'done') {
      return (
        <Modal onClose={act.close} title="È in vetrina" icon="checkCircle" sub="Chi apre Cacio e Pepe nell'app lo trova per primo, sopra a tutto il resto.">
          <div className="row" style={{ gap: 14, padding: 14, borderRadius: 18, background: 'var(--card-2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
            <Thumb img={pick.img} bg={pick.bg} size="lg" />
            <div className="col" style={{ gap: 3 }}>
              <b>{pick.title}</b>
              <span className="t-small">In evidenza nella vetrina · {days === 1 ? 'solo oggi' : `${days} giorni, fino al ${Pano.fmtDay(end)}`}</span>
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            {[['In cima alla tua vetrina', 'adesso', 'ok'], ['Prezzo fisso', `${Pano.eur(DATA.VETRINA_DAY)} al giorno, scalati dal wallet a fine giornata`, 'ok'], ['Si spegne da sola', days === 1 ? 'stanotte' : `il ${Pano.fmtDay(end)} a mezzanotte`, 'wait']].map(([x, y, st]) => (
              <div key={x} className={cx('check-row', st)}><Icon n={st === 'ok' ? 'checkCircle' : 'clock'} /><span><b>{x}</b> · <span className="t-muted">{y}</span></span></div>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <Btn kind="secondary" onClick={() => { act.go('campagne'); }}>Vedi le campagne</Btn>
            <Btn kind="primary" onClick={act.close}>Fatto</Btn>
          </div>
        </Modal>
      );
    }
    return (
      <Modal onClose={act.close} size="wide" title="Promuovi in un tap" icon="sparkle" sub="Metti un piatto o un evento in cima alla tua vetrina: lo vede chi apre Cacio e Pepe nell'app. Prezzo fisso, niente aste."
        foot={<>
          <Btn kind="ghost" icon="megaphone" onClick={() => act.open('wizard')}>Per farti vedere in tutta l'app: Nuova campagna</Btn>
          <span className="spacer" />
          <Btn kind="primary" size="lg" icon="store" disabled={phase === 'sending' || low} onClick={send}>{phase === 'sending' ? 'Un attimo…' : `Metti in vetrina · ${Pano.eur(f.cost)}`}</Btn>
        </>}>
        <div className="qp">
          <div className="qp-form">
            <div className="field">
              <span className="lbl">Cosa metti in evidenza</span>
              <Seg value={kind} onChange={switchKind} options={[{ id: 'piatto', label: 'Un piatto', icon: 'cutlery' }, { id: 'evento', label: 'Un evento', icon: 'ticket' }]} label="Piatto o evento" />
            </div>
            <div className="col" style={{ gap: 8 }} role="radiogroup" aria-label={kind === 'evento' ? 'Evento' : 'Piatto'}>
              {list.map((p) => (
                <PickRow key={p.id} on={pick.id === p.id} onClick={() => choose(p)} img={p.img} bg={p.bg} t={p.title}
                  s={p.kind === 'evento' ? `${p.when} · dagli eventi di Fresh` : `${Pano.eur(p.price)} · ${p.note}`} />
              ))}
            </div>
            <div className="field">
              <span className="lbl">Per quanto</span>
              <Chips value={days} onChange={setDays} options={durate} />
            </div>
            <div className="note iride qp-fc">
              <Pano.ByuppinoFace size={40} />
              <div>
                <b>{Pano.n(f.visitsLo)}–{Pano.n(f.visitsHi)} persone apriranno la tua vetrina</b>
                <div className="t-small" style={{ marginTop: 2 }}>Prevedo {f.tapsLo}–{f.tapsHi} tocchi sulla scheda e da {f.convLo} a {f.convHi} {kind === 'evento' ? 'prenotazioni' : 'ordini o prenotazioni'}.</div>
              </div>
            </div>
            <div className="row between wrap qp-sum">
              <span className="t-muted"><Icon n="wallet" size={15} />{Pano.eur(DATA.VETRINA_DAY)} al giorno · dal wallet a fine giornata</span>
              <span className="num">Saldo {Pano.eur(wallet.balance, true)}</span>
            </div>
            {low && <Note tone="warn">Il saldo non basta. <button type="button" className="t-strong" style={{ textDecoration: 'underline' }} onClick={() => act.open('ricarica')}>Ricarica il wallet</button></Note>}
          </div>
          <div className="qp-prev">
            {preview}
            <span className="t-small qp-cap">Così la vede chi apre Cacio e Pepe nell'app</span>
          </div>
        </div>
      </Modal>
    );
  }

  // ─── Procedura guidata (nuova campagna o correzione) ────────────────────
  const STEPS = [
    { id: 'obiettivo', t: 'Obiettivo' },
    { id: 'cosa', t: 'Cosa promuovi' },
    { id: 'dove', t: 'Dove' },
    { id: 'pubblico', t: 'Pubblico' },
    { id: 'budget', t: 'Budget e durata' },
    { id: 'annuncio', t: 'Annuncio' },
    { id: 'riepilogo', t: 'Riepilogo' },
  ];
  const BANNED = /(migliore|il più buono|unic[oa] a roma|numero uno|!!)/i;

  function Wizard({ fixId, goal: g0, budget: b0, placement: p0 }) {
    const camps = Pano.useStore((s) => s.campaigns);
    const wallet = Pano.useStore((s) => s.wallet);
    const fixing = fixId ? camps.find((c) => c.id === fixId) : null;
    const [step, setStep] = useState(fixing ? 5 : 0);
    const [done, setDone] = useState(false);
    const [st, setSt] = useState(() => fixing ? {
      goal: fixing.goal, template: null, subjectKind: fixing.subject.kind, subjectId: fixing.subject.offerId || fixing.subject.eventId || 'locale', placement: fixing.type,
      audience: fixing.audience, radius: fixing.radiusKm, tastes: ['romana'], budgetMode: fixing.budgetDay ? 'giorno' : 'totale', budget: fixing.budgetDay || fixing.budgetTot || 15, duration: '1g',
      creative: Object.assign({}, fixing.creative), variant: 0, payResult: false,
    } : {
      goal: g0 || 'prenotazioni', template: null, subjectKind: 'locale', subjectId: 'locale', placement: p0 || 'ricerca', audience: ['vicini', 'nuovi'], radius: 1.5, tastes: ['romana'],
      budgetMode: 'giorno', budget: b0 && b0 < 60 ? b0 : 12, duration: '7g', creative: null, variant: 0, payResult: false,
    });
    const set = (patch) => setSt((s) => Object.assign({}, s, patch));
    // le tre versioni dell'annuncio preparate da Byuppino
    const subject = useMemo(() => {
      if (st.subjectKind === 'evento') return DATA.EVENTI.find((e) => e.id === st.subjectId) || DATA.EVENTI[0];
      if (st.subjectKind === 'offerta') return DATA.OFFERTE.find((o) => o.id === st.subjectId) || DATA.OFFERTE[0];
      if (st.subjectKind === 'piatto') return DATA.MENU.find((m) => m.id === st.subjectId) || DATA.MENU[0];
      return { title: 'Cacio e Pepe', img: Pano.IMG.carbonara, bg: Pano.BG.pesca };
    }, [st.subjectKind, st.subjectId]);
    const variants = useMemo(() => {
      const t = subject.title || subject.name || 'Cacio e Pepe';
      const tpl = st.template;
      const extra = tpl === 'compleanno' ? 'Festeggia da noi: dolce della casa per il festeggiato.' : tpl === 'derby' ? 'Partita sul maxischermo, tagliere e birra a 15 €.' : tpl === 'aperitivo' ? 'Spritz e taglierino dalle 18 alle 20.' : tpl === 'natale' ? 'Menù di Natale su prenotazione.' : tpl === 'capodanno' ? 'Cenone di Capodanno: pochi tavoli rimasti.' : null;
      return [
        { title: t, text: extra || 'Pasta tirata a mano ogni mattina. Prenota in due tocchi.', img: subject.img || Pano.IMG.carbonara, bg: subject.bg || Pano.BG.pesca, cta: 'Prenota' },
        { title: st.subjectKind === 'locale' ? 'Carbonara come a casa' : t, text: extra || 'A due passi da te, in piazza. Tavoli anche fuori.', img: Pano.IMG.carbonara, bg: Pano.BG.crema, cta: 'Prenota' },
        { title: st.subjectKind === 'locale' ? 'Cena a Trastevere' : t, text: extra || 'Tagliere romano e calice di Cesanese, la sera.', img: Pano.IMG.tagliere, bg: Pano.BG.lilla, cta: 'Scopri' },
      ];
    }, [subject, st.template, st.subjectKind]);
    const cr = st.creative || variants[st.variant];
    const setCr = (patch) => set({ creative: Object.assign({}, cr, patch) });

    // controlli automatici sui contenuti
    const checks = [
      { ok: !cr.banner, t: cr.banner ? 'La foto ha una scritta sopra: toglila' : 'Foto senza scritte sopra', field: 'img' },
      { ok: !BANNED.test(cr.title + ' ' + cr.text), t: BANNED.test(cr.title + ' ' + cr.text) ? 'Togli i superlativi e i punti esclamativi doppi' : 'Niente superlativi non verificabili', field: 'text' },
      { ok: !/12 ?€|€ ?12/.test(cr.text), t: /12 ?€|€ ?12/.test(cr.text) ? 'Il prezzo di 12 € non è nel menù di Fresh (lo spritz costa 9 €)' : 'Prezzi coerenti con il menù di Fresh', field: 'text' },
      { ok: cr.title.length <= 32 && cr.title.length > 2, t: 'Titolo fino a 32 caratteri', field: 'title' },
      { ok: true, t: 'Etichetta «Sponsorizzato» aggiunta da byup', field: null },
    ];
    const allOk = checks.every((c) => c.ok);
    const days = st.duration === '1g' ? 1 : st.duration === '3g' ? 3 : st.duration === '7g' ? 7 : st.duration === '14g' ? 14 : 8;
    const total = st.budgetMode === 'giorno' ? st.budget * days : st.budget;
    const f = Pano.forecast(st.goal, total, days);
    const T = DATA.TIPI[st.placement] || DATA.TIPI.ricerca;
    const ready = [true, true, !!st.placement, st.audience.length > 0, st.budget > 0, allOk, allOk];

    const submit = () => {
      const isRev = /derby|roma|lazio|partita/i.test(cr.title + ' ' + cr.text) || st.subjectId === 'e1';
      const status = isRev ? 'revisione' : 'attiva';
      if (fixing) {
        act.updateCampaign(fixing.id, { status: 'revisione', creative: Object.assign({}, cr, { banner: null }), review: { at: new Date(), why: 'Correzioni ricevute: byup ricontrolla a mano.', eta: 'di solito entro 4 ore' }, log: [...fixing.log, { at: new Date(), t: 'Corretta e rinviata in revisione' }] });
        Pano.toast('Inviata di nuovo a byup per la revisione');
      } else {
        act.addCampaign({
          id: 'w' + Date.now(), name: cr.title, type: st.placement, status, goal: st.goal, subject: { kind: st.subjectKind, title: subject.title || subject.name || 'Il locale' },
          start: Pano.TODAY, end: Pano.addDays(Pano.TODAY, days - 1), budgetDay: st.budgetMode === 'giorno' ? st.budget : null, budgetTot: st.budgetMode === 'totale' ? st.budget : null, spent: 0,
          reach: 0, taps: 0, bookings: 0, covers: 0, revenue: 0, audience: st.audience, radiusKm: st.radius, creative: cr,
          review: isRev ? { at: new Date(), why: 'Cita una partita: i marchi delle squadre si controllano a mano.', eta: 'di solito entro 4 ore' } : null,
          log: [{ at: new Date(), t: isRev ? 'Inviata · in revisione a mano' : 'Inviata · controllo automatico superato' }],
        });
      }
      setDone(true);
    };

    const S = STEPS[step];
    const body = (() => {
      if (S.id === 'obiettivo') return (
        <>
          <Head n={1} t="Cosa vuoi ottenere?" s="L'obiettivo decide dove e quando mostrare l'annuncio." />
          <div className="opt-grid">
            {DATA.OBIETTIVI.map((o) => (
              <button key={o.id} type="button" className={cx('opt', st.goal === o.id && 'on')} disabled={o.phase !== 'mvp'} onClick={() => set({ goal: o.id })} aria-pressed={st.goal === o.id}>
                <span className="opt-ico"><Icon n={o.icon} /></span>
                <span className="opt-t">{o.label}</span>
                <span className="opt-d">{o.desc}</span>
                {o.phase !== 'mvp' ? <span className="opt-tag"><Phase f={o.phase} /></span> : st.goal === o.id && <span className="opt-check"><Icon n="check" strokeWidth={3} /></span>}
              </button>
            ))}
          </div>
          <div className="field">
            <span className="lbl">Parti da un'occasione <span className="hint">facoltativo</span></span>
            <Chips value={st.template} onChange={(v) => set({ template: st.template === v ? null : v, creative: null })} options={DATA.TEMPLATE} />
          </div>
        </>
      );
      if (S.id === 'cosa') return (
        <>
          <Head n={2} t="Cosa promuovi?" s="Eventi, offerte e piatti arrivano già da Fresh, con foto e prezzi." />
          <Seg value={st.subjectKind} onChange={(k) => set({ subjectKind: k, subjectId: k === 'locale' ? 'locale' : k === 'evento' ? 'e2' : k === 'offerta' ? 'o2' : 'm1', creative: null })} options={[{ id: 'locale', label: 'Il locale', icon: 'store' }, { id: 'evento', label: 'Un evento', icon: 'ticket' }, { id: 'offerta', label: 'Un’offerta', icon: 'tag' }, { id: 'piatto', label: 'Un piatto', icon: 'cutlery', title: 'Fase 2' }]} />
          {st.subjectKind === 'locale' && <Note tone="iride" icon="store">Promuovi <b>Cacio e Pepe · Trastevere</b> con le foto e la descrizione della vetrina di Fresh.</Note>}
          {st.subjectKind === 'evento' && <div className="col" style={{ gap: 8 }}>{DATA.EVENTI.map((e) => <PickRow key={e.id} on={st.subjectId === e.id} onClick={() => set({ subjectId: e.id, creative: null })} img={e.img} bg={e.bg} t={e.title} s={Pano.cap(Pano.fmtDayLong(e.when)) + ' · ' + String(e.when.getHours()).padStart(2, '0') + ':' + String(e.when.getMinutes()).padStart(2, '0')} />)}</div>}
          {st.subjectKind === 'offerta' && <div className="col" style={{ gap: 8 }}>{DATA.OFFERTE.map((o) => <PickRow key={o.id} on={st.subjectId === o.id} onClick={() => set({ subjectId: o.id, creative: null })} img={o.img} bg={o.bg} t={o.title} s="Offerta salvata in Fresh" />)}</div>}
          {st.subjectKind === 'piatto' && (
            <>
              <Note tone="info" icon="lock">«Piatto in evidenza» arriva nella <b>Fase 2</b>. Intanto puoi usare la foto di un piatto nell'annuncio del locale.</Note>
              <div className="opt-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', opacity: 0.6 }}>
                {DATA.MENU.slice(0, 6).map((m) => <div key={m.id} className="opt" style={{ cursor: 'default' }}><div style={{ height: 70, borderRadius: 12, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src={m.img} alt="" style={{ width: '70%' }} /></div><span className="opt-t" style={{ fontSize: 13 }}>{m.name}</span><span className="opt-d">{Pano.eur(m.price)}</span></div>)}
              </div>
            </>
          )}
        </>
      );
      if (S.id === 'dove') return (
        <>
          <Head n={3} t="Dove compare?" s="Ogni posto ha il suo prezzo. Sempre con l'etichetta «Sponsorizzato»." />
          <div className="opt-grid">
            {['ricerca', 'evento', 'offerta', 'perte', 'mappa', 'piatto'].map((k) => {
              const t = DATA.TIPI[k];
              const dis = t.phase !== 'mvp';
              return (
                <button key={k} type="button" className={cx('opt', st.placement === k && 'on')} disabled={dis} onClick={() => set({ placement: k })} aria-pressed={st.placement === k}>
                  <span className="opt-ico"><Icon n={t.icon} /></span>
                  <span className="opt-t">{t.label}</span>
                  <span className="opt-d">{t.desc}</span>
                  <span className="row" style={{ gap: 6, marginTop: 2, flexWrap: 'wrap' }}><Pill size="sm">{t.price}</Pill>{t.quality && <Pill size="sm" tone="good" icon="check">{t.quality}</Pill>}</span>
                  {dis ? <span className="opt-tag"><Phase f={t.phase} /></span> : st.placement === k && <span className="opt-check"><Icon n="check" strokeWidth={3} /></span>}
                </button>
              );
            })}
          </div>
          <Note tone="iride" icon="push"><b>Le notifiche non stanno qui.</b> La push sul telefono si vince all’asta in <button type="button" className="t-strong" style={{ textDecoration: 'underline' }} onClick={() => act.go('push')}>Push</button>; il messaggio nella Posta dell’app si prenota a prezzo fisso in <button type="button" className="t-strong" style={{ textDecoration: 'underline' }} onClick={() => act.go('inapp')}>In app</button>.</Note>
        </>
      );
      if (S.id === 'pubblico') {
        const size = Math.round((st.audience.includes('vicini') ? 4200 * st.radius : 0) + (st.audience.includes('nuovi') ? 2600 : 0) + (st.audience.includes('clienti') ? 1180 : 0) + (st.audience.includes('gusti') ? 900 * st.tastes.length : 0));
        return (
          <>
            <Head n={4} t="A chi lo mostriamo?" s="Scegli il tipo di pubblico: non vedrai mai chi sono le persone." />
            <Chips multi value={st.audience} onChange={(v) => set({ audience: v })} options={[{ id: 'vicini', label: 'Vicini', icon: 'pin' }, { id: 'nuovi', label: 'Nuovi clienti', icon: 'userPlus' }, { id: 'clienti', label: 'Già clienti', icon: 'repeat' }, { id: 'gusti', label: 'Per gusti', icon: 'heart' }]} />
            {st.audience.includes('vicini') && (
              <div className="field">
                <label htmlFor="wz-raggio">Raggio <span className="num">{Pano.n1(st.radius)} km</span></label>
                <Range id="wz-raggio" min={0.5} max={3} step={0.1} value={st.radius} onChange={(v) => set({ radius: v })} />
              </div>
            )}
            {st.audience.includes('gusti') && <Chips multi value={st.tastes} onChange={(v) => set({ tastes: v })} options={[{ id: 'romana', label: 'Cucina romana' }, { id: 'pasta', label: 'Pasta fresca' }, { id: 'vino', label: 'Vino' }, { id: 'aperitivo', label: 'Aperitivo' }, { id: 'dolci', label: 'Dolci' }]} />}
            <div className="card soft" style={{ padding: 18 }}>
              <div className="row between wrap">
                <div className="col" style={{ gap: 2 }}><span className="t-small">Persone che possono vederlo</span><span className="big md">≈ {Pano.n(size)}</span></div>
                <Pill tone="good" icon="shield">Anonimo · nessun dato esportabile</Pill>
              </div>
            </div>
            <Note icon="lock">byup mostra l'annuncio alle persone giuste. Tu vedi solo numeri aggregati: niente nomi, email o telefoni, e nessuna esportazione.</Note>
          </>
        );
      }
      if (S.id === 'budget') return (
        <>
          <Head n={5} t="Quanto e per quanto?" s="Paghi solo i tocchi sull'annuncio, dal wallet, entro i limiti che hai impostato." />
          <Seg value={st.budgetMode} onChange={(v) => set({ budgetMode: v, budget: v === 'giorno' ? 12 : 80 })} options={[{ id: 'giorno', label: 'Al giorno' }, { id: 'totale', label: 'Totale' }]} />
          <div className="field">
            <label htmlFor="wz-budget">{st.budgetMode === 'giorno' ? 'Budget giornaliero' : 'Budget totale'} <span className="num">{Pano.eur(st.budget)}</span></label>
            <Range id="wz-budget" min={st.budgetMode === 'giorno' ? 5 : 20} max={st.budgetMode === 'giorno' ? 60 : 400} step={1} value={st.budget} onChange={(v) => set({ budget: v })} />
            {st.budgetMode === 'giorno' && st.budget > wallet.limits.day && <span className="hint t-warn">Supera il tuo limite giornaliero di {Pano.eur(wallet.limits.day)}: si fermerà al limite.</span>}
          </div>
          <div className="field">
            <span className="lbl">Durata</span>
            <Chips value={st.duration} onChange={(v) => set({ duration: v })} options={[{ id: '1g', label: 'Solo oggi' }, { id: '3g', label: '3 giorni' }, { id: '7g', label: '7 giorni' }, { id: '14g', label: '14 giorni' }, { id: 'fine', label: 'Fino al 31 ottobre' }]} />
          </div>
          <div className="card soft" style={{ padding: 16 }}>
            <div className="t-micro" style={{ marginBottom: 10 }}>Prezzo a tocco · listino per fascia</div>
            <div className="col" style={{ gap: 6 }}>
              <KV k="Pranzo nei giorni feriali" v="€ 0,30" />
              <KV k="Sera nei giorni feriali" v="€ 0,40" />
              <KV k="Venerdì e sabato sera, weekend" v="€ 0,55" />
            </div>
            <p className="t-small" style={{ marginTop: 10 }}>Il prezzo dinamico e l'asta completa arrivano nella Fase 3.</p>
          </div>
          <div className="row between" style={{ padding: '4px 2px' }}>
            <div className="col" style={{ gap: 2 }}><b>Paga solo a risultato</b><span className="t-small">Paghi per prenotazione o coperto, non per tocco.</span></div>
            <div className="row" style={{ gap: 10 }}><Phase f="f2" /><Switch on={false} disabled label="Paga solo a risultato" /></div>
          </div>
        </>
      );
      if (S.id === 'annuncio') return (
        <>
          <Head n={6} t={fixing ? 'Correggi l’annuncio' : 'L’annuncio'} s={fixing ? 'Byup ha segnato cosa sistemare. I controlli diventano verdi mentre scrivi.' : 'Byuppino ha preparato tre versioni con le tue foto e il menù di Fresh. Scegline una e ritocca.'} />
          {fixing && fixing.review && fixing.review.reasons && (
            <Note tone="bad" icon="alertCircle">
              <b>Le note di byup</b>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>{fixing.review.reasons.map((r, i) => <li key={i}>{r.t}</li>)}</ul>
            </Note>
          )}
          {!fixing && (
            <div className="opt-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
              {variants.map((v, i) => (
                <button key={i} type="button" className={cx('cre', !st.creative && st.variant === i && 'on')} onClick={() => set({ variant: i, creative: null })} aria-pressed={!st.creative && st.variant === i}>
                  <span className="cre-img" style={{ background: v.bg }}><img src={v.img} alt="" /></span>
                  <span className="cre-t">{v.title}</span>
                  <span className="cre-d">{v.text}</span>
                </button>
              ))}
            </div>
          )}
          <div className="field">
            <label htmlFor="wz-titolo">Titolo <span className={cx('counter', cr.title.length > 32 && 'over')}>{cr.title.length}/32</span></label>
            <input id="wz-titolo" className={cx('input', !checks[3].ok && 'err')} value={cr.title} onChange={(e) => setCr({ title: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="wz-testo">Testo <span className={cx('counter', cr.text.length > 90 && 'over')}>{cr.text.length}/90</span></label>
            <textarea id="wz-testo" className={cx('textarea', (!checks[1].ok || !checks[2].ok) && 'err')} value={cr.text} onChange={(e) => setCr({ text: e.target.value })} />
          </div>
          <div className="field">
            <span className="lbl">Foto <span className="hint">dalla galleria di Fresh</span></span>
            <div className="row wrap" style={{ gap: 8 }}>
              {cr.banner && (
                <button type="button" className="thumb lg" style={{ background: cr.bg, boxShadow: 'inset 0 0 0 2px var(--bad)' }} onClick={() => setCr({ banner: null })} aria-label="Togli la scritta dalla foto">
                  <img src={cr.img} alt="" /><span style={{ position: 'absolute', fontFamily: 'var(--font-app-display)', fontWeight: 600, fontSize: 18, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>{cr.banner}</span>
                </button>
              )}
              {DATA.MENU.slice(0, 8).map((m) => (
                <button key={m.id} type="button" className="thumb lg" style={{ background: m.bg, boxShadow: !cr.banner && cr.img === m.img ? 'inset 0 0 0 2px var(--ink)' : 'inset 0 0 0 1px var(--line)' }} onClick={() => setCr({ img: m.img, bg: m.bg, banner: null })} aria-label={'Usa la foto: ' + m.name}>
                  <img src={m.img} alt="" />
                </button>
              ))}
            </div>
            {cr.banner && <span className="hint t-bad">Tocca la foto bordata di rosso per togliere la scritta, oppure scegline un'altra.</span>}
          </div>
          <div className="field">
            <span className="lbl">Pulsante</span>
            <Chips value={cr.cta} onChange={(v) => setCr({ cta: v })} options={[{ id: 'Prenota', label: 'Prenota' }, { id: 'Scopri', label: 'Scopri' }, { id: 'Vedi l’offerta', label: 'Vedi l’offerta' }]} />
          </div>
          <div className="card soft" style={{ padding: 16 }}>
            <div className="t-micro" style={{ marginBottom: 10 }}>Controllo automatico</div>
            <div className="col" style={{ gap: 8 }}>{checks.map((c, i) => <div key={i} className={cx('check-row', c.ok ? 'ok' : 'ko')}><Icon n={c.ok ? 'checkCircle' : 'alertCircle'} /><span>{c.t}</span></div>)}</div>
          </div>
        </>
      );
      return (
        <>
          <Head n={7} t="Riepilogo" s="Controlla e invia. Il controllo automatico dura pochi secondi; la revisione a mano solo se serve." />
          <div className="card" style={{ padding: 18 }}>
            <div className="col" style={{ gap: 10 }}>
              <KV k="Obiettivo" v={(DATA.OBIETTIVI.find((o) => o.id === st.goal) || {}).label} />
              <KV k="Cosa" v={subject.title || subject.name || 'Il locale'} />
              <KV k="Dove" v={T.label} />
              <KV k="Pubblico" v={st.audience.map((a) => ({ vicini: `Vicini (${Pano.n1(st.radius)} km)`, nuovi: 'Nuovi clienti', clienti: 'Già clienti', gusti: 'Per gusti' }[a])).join(', ')} />
              <KV k="Budget" v={st.budgetMode === 'giorno' ? `${Pano.eur(st.budget)} al giorno · ${days} ${days === 1 ? 'giorno' : 'giorni'}` : `${Pano.eur(st.budget)} in totale`} />
              <div className="hr" />
              <KV k="Spesa massima" v={Pano.eur(total)} strong />
              <KV k="Saldo del wallet" v={Pano.eur(wallet.balance, true)} />
            </div>
          </div>
          <div className="note iride" style={{ alignItems: 'center' }}>
            <Pano.ByuppinoFace size={44} />
            <div><b style={{ fontSize: 15 }}>Prevedo da {f.coversLo} a {f.coversHi} coperti</b><div className="t-small">{Pano.n(f.reachLo)}–{Pano.n(f.reachHi)} persone raggiunte · incasso stimato {Pano.eur(f.revenueLo)}–{Pano.eur(f.revenueHi)}</div></div>
          </div>
          {total > wallet.balance && <Note tone="warn">La spesa massima supera il saldo: quando finisce, la campagna si ferma. <button type="button" className="t-strong" style={{ textDecoration: 'underline' }} onClick={() => act.open('ricarica')}>Ricarica</button> o attiva la ricarica automatica.</Note>}
        </>
      );
    })();

    if (done) {
      return (
        <div className="wiz" role="dialog" aria-modal="true" aria-label="Campagna inviata" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="col" style={{ alignItems: 'center', textAlign: 'center', gap: 16, maxWidth: 520, padding: 24 }}>
            <img src={Pano.IMG.byuppino} alt="" style={{ width: 190, filter: 'drop-shadow(0 20px 30px rgba(90,60,160,.3))' }} />
            <h2 className="t-display">{fixing ? 'Rinviata a byup' : 'Inviata'}</h2>
            <p className="t-body" style={{ color: 'var(--muted)' }}>{fixing ? 'Le correzioni sono arrivate. Ti avvisiamo qui e in Fresh appena è approvata.' : 'Il controllo automatico è in corso. Se tutto è in regola è online tra pochi minuti; se cita marchi o squadre la guarda una persona di byup.'}</p>
            <div className="row" style={{ gap: 10 }}>
              <Btn kind="secondary" onClick={() => act.go('campagne')}>Vai alle campagne</Btn>
              <Btn kind="primary" onClick={act.close}>Fatto</Btn>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="wiz" role="dialog" aria-modal="true" aria-label={fixing ? 'Correggi la campagna' : 'Nuova campagna'}>
        <nav className="wiz-rail" aria-label="Passi">
          <div className="row between" style={{ marginBottom: 14, padding: '0 4px' }}>
            <div className="col" style={{ gap: 2 }}>
              <span className="t-micro">{fixing ? 'Correzione' : 'Nuova campagna'}</span>
              <b style={{ fontSize: 16 }}>{fixing ? fixing.name : 'Procedura guidata'}</b>
            </div>
          </div>
          {STEPS.map((s, i) => (
            <button key={s.id} type="button" className={cx('wiz-step', i === step && 'cur', i < step && 'done')} onClick={() => setStep(i)} disabled={i > step && !ready.slice(0, i).every(Boolean)}>
              <span className="sn">{i < step ? <Icon n="check" strokeWidth={3} /> : i + 1}</span>
              <span className="ss">{s.t}<small>{stepSummary(s.id, st, subject, T)}</small></span>
            </button>
          ))}
          <div className="spacer" />
          <Note tone="iride" icon="info" style={{ fontSize: 12.5 }}>Le bozze si salvano da sole. Puoi chiudere e riprendere da Campagne.</Note>
        </nav>
        <main className="wiz-main">
          <div className="wiz-main-inner">{body}</div>
          <div className="wiz-foot">
            <Btn kind="ghost" icon="x" onClick={act.close}>Chiudi</Btn>
            <span className="spacer" />
            {step > 0 && <Btn kind="secondary" icon="arrowL" onClick={() => setStep(step - 1)}>Indietro</Btn>}
            {step < STEPS.length - 1
              ? <Btn kind="primary" iconRight="arrowR" disabled={!ready[step]} onClick={() => setStep(step + 1)}>Avanti</Btn>
              : <Btn kind="primary" icon="send" disabled={!allOk} onClick={submit}>{fixing ? 'Rinvia a byup' : 'Invia a byup'}</Btn>}
          </div>
        </main>
        <aside className="wiz-side" aria-label="Anteprima">
          <span className="t-micro" style={{ alignSelf: 'flex-start' }}>Come appare nell'app</span>
          <Pano.Phone screen={Pano.screenFor(st.placement)} creative={cr} size="sm" />
          <div className="forecast">
            <span className="t-micro">Stima</span>
            <div className="fr"><span>Coperti in più</span><b>{f.coversLo}–{f.coversHi}</b></div>
            <div className="fr"><span>Persone raggiunte</span><b>{Pano.n(f.reachLo)}–{Pano.n(f.reachHi)}</b></div>
            <div className="fr"><span>Spesa massima</span><b>{Pano.eur(total)}</b></div>
            <div className="fr"><span>Incasso stimato</span><b>{Pano.eur(f.revenueLo)}–{Pano.eur(f.revenueHi)}</b></div>
          </div>
        </aside>
      </div>
    );
  }
  function stepSummary(id, st, subject, T) {
    if (id === 'obiettivo') return (DATA.OBIETTIVI.find((o) => o.id === st.goal) || {}).label;
    if (id === 'cosa') return subject.title || subject.name || 'Il locale';
    if (id === 'dove') return T.label;
    if (id === 'pubblico') return st.audience.length + (st.audience.length === 1 ? ' gruppo' : ' gruppi');
    if (id === 'budget') return Pano.eur(st.budget) + (st.budgetMode === 'giorno' ? ' al giorno' : ' in totale');
    if (id === 'annuncio') return 'Controlli automatici';
    return 'Invia a byup';
  }
  function Head({ n, t, s }) {
    return (
      <div className="col" style={{ gap: 8 }}>
        <span className="t-micro">Passo {n} di 7</span>
        <h2 className="t-display" style={{ fontSize: 30 }}>{t}</h2>
        <p className="t-body" style={{ color: 'var(--muted)' }}>{s}</p>
      </div>
    );
  }
  function PickRow({ on, onClick, img, bg, t, s }) {
    return (
      <button type="button" className={cx('slot-row', on && 'on')} style={{ gridTemplateColumns: '54px 1fr auto' }} onClick={onClick} aria-pressed={on}>
        <Thumb img={img} bg={bg} />
        <span className="col" style={{ gap: 2, textAlign: 'left' }}><b>{t}</b><span className="t-small">{s}</span></span>
        {on ? <Icon n="checkCircle" size={20} /> : <span />}
      </button>
    );
  }

  // ─── Ricarica del wallet ────────────────────────────────────────────────
  function Recharge({ first }) {
    const wallet = Pano.useStore((s) => s.wallet);
    const [sel, setSel] = useState(200);
    const [custom, setCustom] = useState('');
    const [method, setMethod] = useState('card');
    const [auto, setAuto] = useState(wallet.auto.on);
    const [phase, setPhase] = useState('form');
    const opt = DATA.RICARICHE.find((r) => r.v === sel);
    const amount = sel === 'altro' ? Math.max(0, Number(String(custom).replace(',', '.')) || 0) : sel;
    const bonus = sel === 'altro' ? (amount >= 500 ? Math.round(amount * 0.15) : amount >= 200 ? Math.round(amount * 0.1) : amount >= 100 ? Math.round(amount * 0.05) : 0) : opt.bonus;
    const go = () => {
      setPhase('pay');
      setTimeout(() => {
        act.recharge(amount, bonus, method === 'sepa' ? 'Ricarica con bonifico SEPA' : 'Ricarica con carta');
        act.wallet({ auto: Object.assign({}, wallet.auto, { on: auto }) });
        setPhase('done');
      }, 1200);
    };
    if (phase === 'done') {
      return (
        <Modal onClose={act.close} title="Ricarica fatta" icon="checkCircle">
          <div className="col" style={{ alignItems: 'center', gap: 8, padding: '8px 0 4px' }}>
            <span className="t-small">Nuovo saldo</span>
            <Money v={Pano.store.get().wallet.balance} size="xl" dec />
            {bonus > 0 && <Pill tone="good" icon="gift">+{Pano.eur(bonus)} di bonus inclusi</Pill>}
          </div>
          <Note tone="info">La ricevuta è nei movimenti del wallet. {auto ? `La ricarica automatica è attiva: sotto ${Pano.eur(wallet.auto.under)} ricarichiamo ${Pano.eur(wallet.auto.amount)}.` : ''}</Note>
          <div className="row" style={{ justifyContent: 'flex-end' }}><Btn kind="primary" onClick={act.close}>Fatto</Btn></div>
        </Modal>
      );
    }
    return (
      <Modal onClose={act.close} title={first ? 'Primo caricamento del wallet' : 'Ricarica il wallet'} icon="wallet" sub="I crediti servono per tutti i posizionamenti. Più ricarichi, più bonus ricevi."
        foot={<>
          <span className="col" style={{ gap: 0, marginRight: 'auto' }}><span className="t-small">Paghi {Pano.eur(amount)}</span><b className="num">Ricevi {Pano.eur(amount + bonus)} di crediti</b></span>
          <Btn kind="primary" size="lg" icon="card" disabled={!amount || phase === 'pay'} onClick={go}>{phase === 'pay' ? 'Pagamento…' : `Ricarica ${Pano.eur(amount)}`}</Btn>
        </>}>
        <div className="opt-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
          {DATA.RICARICHE.map((r) => (
            <button key={r.v} type="button" className={cx('opt', sel === r.v && 'on')} onClick={() => setSel(r.v)} aria-pressed={sel === r.v}>
              <span className="big sm"><span className="cur">€</span>{r.v}</span>
              <span className="opt-d">{r.bonus ? <>ricevi <b style={{ color: 'var(--ink)' }}>{Pano.eur(r.v + r.bonus)}</b> · +{Math.round((r.bonus / r.v) * 100)}%</> : 'nessun bonus'}</span>
              {r.best && <span className="opt-tag"><Pill tone="iride" size="sm">Più scelta</Pill></span>}
            </button>
          ))}
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button type="button" className={cx('chip', sel === 'altro' && 'on')} onClick={() => setSel('altro')}>Altro importo</button>
          {sel === 'altro' && <input className="input" style={{ maxWidth: 160 }} inputMode="decimal" placeholder="€ 0" value={custom} onChange={(e) => setCustom(e.target.value)} aria-label="Importo" autoFocus />}
        </div>
        <div className="field">
          <span className="lbl">Metodo</span>
          <div className="col" style={{ gap: 8 }}>
            {[['card', 'card', `${wallet.method.brand} •••• ${wallet.method.last4}`, `scade ${wallet.method.exp} · istantaneo`], ['sepa', 'receipt', 'Bonifico SEPA', '2–3 giorni lavorativi'], ['new', 'plus', 'Un’altra carta', 'tramite Stripe']].map(([id, ic, t, s]) => (
              <button key={id} type="button" className={cx('slot-row', method === id && 'on')} style={{ gridTemplateColumns: '34px 1fr auto' }} onClick={() => setMethod(id)} aria-pressed={method === id}>
                <span className="pos"><Icon n={ic} size={16} /></span>
                <span className="col" style={{ gap: 1, textAlign: 'left' }}><b>{t}</b><span className="t-small">{s}</span></span>
                {method === id ? <Icon n="checkCircle" size={20} /> : <span />}
              </button>
            ))}
          </div>
        </div>
        <div className="row between" style={{ padding: '2px 2px' }}>
          <div className="col" style={{ gap: 2 }}><b>Ricarica automatica</b><span className="t-small">Sotto {Pano.eur(wallet.auto.under)} ricarichiamo {Pano.eur(wallet.auto.amount)} (+{Pano.eur(20)} di bonus).</span></div>
          <Switch on={auto} onChange={setAuto} label="Ricarica automatica" />
        </div>
      </Modal>
    );
  }

  // ─── Dettaglio campagna ─────────────────────────────────────────────────
  function CampaignDrawer({ id }) {
    const c = Pano.useStore((s) => s.campaigns.find((x) => x.id === id));
    if (!c) return null;
    const T = DATA.TIPI[c.type] || DATA.TIPI.ricerca;
    const roas = c.spent ? c.revenue / c.spent : 0;
    const cap = Pano.campCap(c);
    const share = c.spent / Math.max(1, DATA.S30.tot.spent);
    const days = DATA.S30.days.map((d) => Object.assign({}, d, { revenue: d.revenue * (c.revenue / Math.max(1, DATA.S30.tot.revenue)), spent: d.spent * share, full: d.full ? { revenue: d.full.revenue * share } : null }));
    const toggle = () => act.toggleCampaign(c.id);
    const fmtDate = (d) => (d ? `${d.getDate()} ${Pano.MM[d.getMonth()]}` : '—');
    return (
      <Drawer onClose={act.close} wide label={c.name}
        head={
          <div className="row" style={{ gap: 14, minWidth: 0 }}>
            <Pano.CampToggle c={c} withLabel stacked />
            <Thumb img={c.creative.img} bg={c.creative.bg} size="lg" />
            <div className="col" style={{ gap: 6, minWidth: 0 }}>
              <h2 className="t-title" style={{ fontSize: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</h2>
              <div className="row wrap" style={{ gap: 6 }}><StatusPill s={c.status} /><Pill size="sm" icon={T.icon}>{T.label}</Pill><span className="t-small">{fmtDate(c.start)} → {fmtDate(c.end)}</span></div>
            </div>
          </div>
        }
        foot={<>
          <Btn kind="ghost" icon="copy" onClick={() => { act.addCampaign(Object.assign({}, c, { id: 'd' + Date.now(), name: c.name + ' (copia)', status: 'bozza', spent: 0, reach: 0, taps: 0, bookings: 0, covers: 0, revenue: 0, log: [{ at: new Date(), t: 'Duplicata' }] })); Pano.toast('Copia salvata nelle bozze'); }}>Duplica</Btn>
          <span className="spacer" />
          {c.status === 'correggere' && <Btn kind="primary" icon="edit" onClick={() => act.open('wizard', { fixId: c.id })}>Correggi e rinvia</Btn>}
          {(c.status === 'attiva' || c.status === 'pausa') && <Btn kind={c.status === 'attiva' ? 'secondary' : 'primary'} icon={c.status === 'attiva' ? 'pause' : 'play'} onClick={toggle}>{c.status === 'attiva' ? 'Metti in pausa' : 'Riprendi'}</Btn>}
          {c.status === 'bozza' && <Btn kind="primary" icon="edit" onClick={() => act.open('wizard', {})}>Continua</Btn>}
          {c.status !== 'correggere' && c.status !== 'bozza' && <Btn kind="secondary" icon="edit" onClick={() => Pano.toast('Modifica: apre la procedura con i dati della campagna')}>Modifica</Btn>}
        </>}>
        {c.status === 'correggere' && c.review && (
          <Note tone="bad" icon="alertCircle">
            <b>Byup ha chiesto una correzione</b> · {c.review.at.getDate()} {Pano.MM[c.review.at.getMonth()]} alle {String(c.review.at.getHours()).padStart(2, '0')}:{String(c.review.at.getMinutes()).padStart(2, '0')}
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>{c.review.reasons.map((r, i) => <li key={i}>{r.t}</li>)}</ul>
          </Note>
        )}
        {c.status === 'revisione' && c.review && (
          <Note tone="warn" icon="hourglass">
            <b>In revisione a mano da byup</b> · {c.review.eta}. {c.review.why}
            <div className="row wrap" style={{ gap: 18, marginTop: 10 }}>
              {[['Inviata', true], ['Controllo automatico', true], ['Revisione', 'now'], ['Online', false]].map(([t, s]) => (
                <span key={t} className="row" style={{ gap: 6, fontSize: 12.5, fontWeight: 700, opacity: s ? 1 : 0.55 }}><Icon n={s === true ? 'checkCircle' : s === 'now' ? 'hourglass' : 'clock'} size={15} />{t}</span>
              ))}
            </div>
          </Note>
        )}
        {c.status === 'programmata' && <Note tone="info" icon="calendar">Approvata. Parte {Pano.fmtDayLong(c.start)} e resta in evidenza fino all'evento.</Note>}
        {c.status === 'pausa' && <Note icon="pause">{c.paused || 'In pausa.'} Non spende nulla finché non la riprendi.</Note>}
        {c.status === 'bozza' && <Note icon="edit">Bozza salvata: mancano budget e annuncio.</Note>}

        {c.spent > 0 && (
          <>
            <div className="grid" style={{ gap: 12 }}>
              <div className="card tight c-3 c-xs-3"><div className="stat"><span className="lbl">Speso</span><Money v={c.spent} size="sm" />{cap > 0 && <Meter v={c.spent / cap} thin label="Budget usato" />}<span className="t-small">{cap > 0 ? `su ${Pano.eur(cap)}` : 'nessun tetto'}</span></div></div>
              <div className="card tight c-3 c-xs-3"><div className="stat"><span className="lbl">Incassato</span><Money v={c.revenue} size="sm" /><span className="t-small">attribuito alla campagna</span></div></div>
              <div className="card tight c-3 c-xs-3"><div className="stat"><span className="lbl">ROAS</span><span className="big sm">{Pano.n1(roas)}<span className="dec">×</span></span><span className="t-small">ogni euro ne ha portati {Pano.n2(roas)}</span></div></div>
              <div className="card tight c-3 c-xs-3"><div className="stat"><span className="lbl">Costo per coperto</span><Money v={c.spent / Math.max(1, c.covers)} size="sm" dec /><span className="t-small">{Pano.n(c.covers)} coperti</span></div></div>
            </div>
            <Card title="Incasso e spesa al giorno" icon="chart" actions={<div className="legend"><span><i style={{ background: 'var(--s1)' }} />Incassato</span><span><i style={{ background: 'var(--s2)' }} />Speso</span></div>}>
              <Pano.DailyChart days={days} height={200} />
            </Card>
            <div className="grid" style={{ gap: 12 }}>
              <Card className="c-7" title="Dal vedere al sedersi" icon="filter">
                <Pano.Funnel steps={[{ k: 'Raggiunti', v: c.reach }, { k: 'Tocchi', v: c.taps }, { k: 'Prenotazioni', v: c.bookings }, { k: 'Coperti', v: c.covers, note: `${Pano.n1(c.covers / Math.max(1, c.bookings))} a prenotazione` }]} />
              </Card>
              <Card className="c-5" title="Come appare" icon="phone">
                <div style={{ display: 'flex', justifyContent: 'center' }}><Pano.Phone screen={Pano.screenFor(c.type)} creative={c.creative} size="sm" /></div>
              </Card>
            </div>
          </>
        )}
        {c.spent === 0 && (
          <div className="grid" style={{ gap: 12 }}>
            <Card className="c-6" title="Come appare" icon="phone"><div style={{ display: 'flex', justifyContent: 'center' }}><Pano.Phone screen={Pano.screenFor(c.type)} creative={c.creative} size="sm" /></div></Card>
            <Card className="c-6" title="Impostazioni" icon="gear">
              <div className="col" style={{ gap: 10 }}>
                {c.type === 'vetrina' ? (<>
                  <KV k="Dove" v="In cima alla tua vetrina" />
                  <KV k="Cosa" v={c.subject.title} />
                  <KV k="Prezzo" v={`${Pano.eur(c.budgetDay)} al giorno · fisso`} />
                  <KV k="Si spegne" v={`il ${fmtDate(c.end)} a mezzanotte`} />
                </>) : (<>
                  <KV k="Obiettivo" v={(DATA.OBIETTIVI.find((o) => o.id === c.goal) || {}).label} />
                  <KV k="Pubblico" v={c.audience.map((a) => ({ vicini: 'Vicini', nuovi: 'Nuovi clienti', clienti: 'Già clienti', gusti: 'Per gusti' }[a])).join(', ')} />
                  <KV k="Raggio" v={`${Pano.n1(c.radiusKm)} km`} />
                  <KV k="Budget" v={c.budgetDay ? `${Pano.eur(c.budgetDay)} al giorno` : c.budgetTot ? `${Pano.eur(c.budgetTot)} in totale` : '—'} />
                </>)}
              </div>
            </Card>
          </div>
        )}
        {c.keywords && <Card title="Ricerche dove compari" icon="search"><div className="chips">{c.keywords.map((k) => <span key={k} className="chip" style={{ cursor: 'default' }}>«{k}»</span>)}</div></Card>}
        <Card title="Storico" icon="history">
          <div className="list">{c.log.slice().reverse().map((l, i) => <div key={i} className="list-row"><Icon n="history" size={16} style={{ color: 'var(--muted)' }} /><span style={{ flex: 1 }}>{l.t}</span><span className="t-small num">{l.at.getDate()} {Pano.MM[l.at.getMonth()]} · {String(l.at.getHours()).padStart(2, '0')}:{String(l.at.getMinutes()).padStart(2, '0')}</span></div>)}</div>
        </Card>
        <Note icon="info">Come contiamo: un coperto è della campagna quando una persona tocca l'annuncio e poi prenota od ordina con byup entro 7 giorni, e il conto passa da Fresh.</Note>
      </Drawer>
    );
  }

  // ─── Push: l'asta di una casella ────────────────────────────────────────
  // I tre posti della push si vincono all'asta (busta chiusa, offerta × qualità,
  // secondo prezzo, chiusura 15 minuti prima dell'invio). Nel prototipo la chiusura
  // si simula. La notifica in app ha il suo cassetto (PostaDrawer, sotto).
  const weekOf = (c) => (c.day <= 1 ? 0 : 1); // oggi è sabato: sabato e domenica sono questa settimana
  // le push della stessa settimana già vinte o in gara (il tetto è 2 a locale)
  Pano.pushWeek = (all, cell) => all.filter((c) => c.id !== cell.id && weekOf(c) === weekOf(cell) && (c.auction.status === 'chiusa' ? !!(c.auction.result && c.auction.result.me) : !!c.auction.my));
  // ─── Asta della push, come un gioco ─────────────────────────────────────
  // Non si ragiona in euro ma in posti. Il podio sono i tre posti della push:
  // tocchi il gradino che vuoi e Panorama ti dice quanto serve per salirci (la
  // soglia: il minimo per stare davanti a chi c'è adesso). Poi scegli lo scudo,
  // cioè quanto metti in più sopra la soglia per non farti scavalcare: col
  // secondo prezzo lo usi solo se qualcuno alza, altrimenti paghi la soglia.
  // In gara: vedi il tuo posto, la forza dello scudo e sali di un gradino in un tocco.
  const SCUDI = [
    { id: 'leggero', label: 'Leggero', add: 0.5 },
    { id: 'medio', label: 'Medio', add: 1.5 },
    { id: 'forte', label: 'Forte', add: 4 },
  ];
  const scudoDi = (m) => (m >= 4 ? { lv: 3, t: 'forte' } : m >= 1.5 ? { lv: 2, t: 'medio' } : m >= 0.5 ? { lv: 1, t: 'leggero' } : { lv: 0, t: 'senza scudo' });
  const AVVISI_ASTA = new Set(['0-cena', '6-cena']); // «avvisami se mi scavalcano», per asta
  const shortWho = (w) => (w.me ? 'Tu' : w.who.replace(/^(Pizzeria|Sushi|Vineria|Gelateria|Trattoria) /, ''));
  function PodEnvIco() {
    return <svg viewBox="0 0 15 11" aria-hidden="true"><rect x=".7" y=".7" width="13.6" height="9.6" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M1.2 1.4 7.5 6l6.3-4.6" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>;
  }
  // le soglie dei tre gradini: l'offerta minima per arrivare al posto k (o meglio)
  function useSoglie(a) {
    return useMemo(() => {
      const out = { 1: null, 2: null, 3: null };
      [3, 2, 1].forEach((k) => {
        for (let b = a.reserve; b <= 250; b += 0.5) { const r = Pano.settleAuction(a, b); if (r.me && r.me.pos <= k) { out[k] = b; break; } }
      });
      return out;
    }, [a]);
  }
  function quandoChiude(cell) {
    const [h, m] = cell.auction.closeAt.split(':').map(Number);
    const t = new Date(cell.d); t.setHours(h, m, 0, 0);
    const min = Math.round((t - Pano.TODAY) / 60000);
    if (min <= 0) return 'chiusa';
    if (min < 60) return `tra ${min} min`;
    const ore = Math.floor(min / 60);
    if (ore < 24) return `tra ${ore} h ${min % 60} min`;
    return `tra ${Math.floor(ore / 24)} g ${ore % 24} h`;
  }
  // il podio grande: tre gradini (2 · 1 · 3) e la panchina
  function AucPodio({ win, soglie, pos, closed, onPick, offers, meOut, hop }) {
    const list = win || [];
    const others = Math.max(0, (offers || 0) - list.length - (meOut ? 1 : 0));
    return (
      <div className="auc-podwrap">
        <div className="auc-pod" role={onPick ? 'group' : undefined} aria-label="I tre posti della push">
          {[2, 1, 3].map((k) => {
            const w = list.find((y) => y.pos === k);
            const kind = !w ? 'free' : w.me ? 'av-ring me' : closed ? 'sold' : 'env';
            const s = soglie && soglie[k];
            const Tag = onPick ? 'button' : 'div';
            return (
              <Tag key={k} type={onPick ? 'button' : undefined} className={cx('st', 'p' + k, pos === k && 'on')} disabled={onPick ? s == null : undefined}
                onClick={onPick ? () => onPick(k) : undefined} aria-label={onPick ? `${k}° posto${s != null ? `, da ${Pano.eur(s)}` : ''}` : undefined}>
                <i key={w && w.me ? 'me' + hop : 'x'} className={cx('tk', kind)}>{w && w.me ? 'CP' : kind === 'env' ? <PodEnvIco /> : null}</i>
                <b>{k}°</b>
                {closed ? <small>{w ? shortWho(w) : 'libero'}</small> : <small>{s != null ? `da ${Pano.eur(s)}` : 'fuori portata'}</small>}
              </Tag>
            );
          })}
        </div>
        <div className="auc-bench">
          {meOut && <i className="tk av-ring me" key={'b' + hop}>CP</i>}
          <span>{meOut ? 'Sei in panchina' : 'In panchina'}{others ? ` · ${others} ${others === 1 ? 'locale' : 'locali'}` : meOut ? '' : ': nessuno'}</span>
          {Array.from({ length: Math.min(others, 6) }, (_, i) => <i key={i} className={cx('tk', closed ? 'sold' : 'env')}>{closed ? null : <PodEnvIco />}</i>)}
        </div>
      </div>
    );
  }
  function AucTimeline({ cell }) {
    const a = cell.auction;
    return (
      <div className="card soft auc-tlbox">
        <b className="auc-tl-t">Come va l’asta</b>
        <ol className="auc-tl">
          <li className="now"><i /><div><b>Adesso · offri a busta chiusa</b><span>Nessuno vede le offerte degli altri, e tu non vedi le loro: vedi solo quanto serve per ogni gradino. Puoi cambiare o ritirare l’offerta fino alle {a.closeAt}.</span></div><em>chiude {quandoChiude(cell)}</em></li>
          <li><i /><div><b>{a.closeAt} · si aprono le buste</b><span>Sale più in alto chi ha offerta × qualità più alta: la qualità del tuo locale vale ×{Pano.n2(DATA.QUALITA)} (voto 4,6, foto, tocchi). Una trattoria per push.</span></div></li>
          <li><i /><div><b>{cell.time} · parte la notifica</b><span>byup la manda a chi è in zona, con i tre locali del podio. Paghi solo se ci sei, e solo quanto basta per stare davanti a chi ti segue.</span></div></li>
        </ol>
      </div>
    );
  }
  function AucBuy({ cell, F, closed }) {
    const past = DATA.PUSH_PAST.find((p) => (closed ? p.today && p.fascia === cell.fascia : p.fascia === cell.fascia)) || (closed ? null : DATA.PUSH_PAST[0]);
    return (
      <div className="card soft auc-buy">
        <div className="auc-buy-h">
          <span className="auc-ico"><Icon n="push" /></span>
          <div className="col" style={{ gap: 3, minWidth: 0 }}>
            <b>{closed ? 'Com’è andata la push' : 'Cosa compri: il tuo nome nella notifica'}</b>
            <span className="t-small">{closed ? `Arrivata a ≈ ${Pano.n(cell.reach)} persone in zona, alle ${cell.time}.` : `Arriva a ≈ ${Pano.n(cell.reach)} persone a Trastevere, ${Pano.fmtDayLong(cell.d)} alle ${cell.time}, anche ad app chiusa. Dentro ci sono tre locali, uno per categoria: i tre gradini del podio.`}</span>
          </div>
        </div>
        {past && (
          <div className="auc-kpis">
            <div className="lead"><b>{past.pos}° · {Pano.eur(past.price, true)}</b><span>{closed ? 'il tuo posto e quanto hai pagato' : `la tua ultima push a ${F.label.toLowerCase()}, ${Pano.fmtDay(past.d)}`}</span></div>
            <div><b>{Pano.n(past.taps)}</b><span>tocchi</span></div>
            <div><b>{Pano.n(past.covers)}</b><span>coperti</span></div>
            <div><b>{Pano.eur(past.revenue)}</b><span>incasso</span></div>
          </div>
        )}
      </div>
    );
  }

  function SlotDrawer({ cellId }) {
    const cell = Pano.useStore((s) => s.digest.find((c) => c.id === cellId));
    const all = Pano.useStore((s) => s.digest);
    const wallet = Pano.useStore((s) => s.wallet);
    const [view, setView] = useState('push');
    const [bid, setBid] = useState(null);
    const [shield, setShield] = useState('medio');
    const [target, setTarget] = useState(3);
    const [alertOn, setAlertOn] = useState(() => !cell || !cell.auction.my || AVVISI_ASTA.has(cellId));
    const [hop, setHop] = useState(0);
    const a = cell ? cell.auction : null;
    const soglie = useSoglie(a || { reserve: 0, rivals: [] });
    if (!cell) return null;
    const F = DATA.FASCE.find((f) => f.id === cell.fascia);
    const x = Pano.cellState(cell);
    const closed = x.closed;
    const title = `Push ${F.label} · ${Pano.fmtDay(cell.d)} · ${cell.time}`;
    // tetto: ogni locale vince al massimo 2 push a settimana (vinte o in gara)
    const week = Pano.pushWeek(all, cell);
    const capped = !a.my && week.length >= DATA.TETTO_PUSH;
    const base = Pano.settleAuction(a, null);
    const addOf = (id) => (SCUDI.find((s) => s.id === id) || SCUDI[1]).add;
    const defVal = soglie[3] != null ? soglie[3] + addOf('medio') : Math.max(base.need, a.reserve);
    const editing = !a.my || bid != null;
    const val = bid != null ? bid : a.my ? a.my.max : defVal;
    const est = Pano.settleAuction(a, val);
    const pos = est.me ? est.me.pos : null;
    // lo scudo difende il gradino scelto (con lo scudo puoi già stare più in alto)
    const tgt = pos ? (shield && soglie[target] != null && target >= pos ? target : pos) : null;
    const margin = tgt ? val - soglie[tgt] : 0;
    const sc = scudoDi(margin);
    const canPay = val - (a.my ? a.my.max : 0) <= wallet.balance;
    const bump = () => setHop((h) => h + 1);
    const pick = (k) => { setTarget(k); const id = shield || 'medio'; setShield(id); setBid(soglie[k] + addOf(id)); bump(); };
    const pickShield = (id) => { setShield(id); const k = soglie[target] != null ? target : 3; if (soglie[k] != null) setBid(soglie[k] + addOf(id)); bump(); };
    const step = (d) => { setShield(null); setBid(Math.max(a.reserve, Math.round((val + d) * 2) / 2)); bump(); };
    const place = () => {
      const had = a.my && a.my.max;
      if (alertOn) AVVISI_ASTA.add(cell.id); else AVVISI_ASTA.delete(cell.id);
      act.placeBid(cell.id, val);
      setBid(null);
      Pano.toast(`${pos ? `Sei ${pos}° · ` : ''}offerta massima ${Pano.eur(val)}, bloccata fino alle ${a.closeAt}${alertOn ? ' · ti avvisiamo se ti scavalcano' : ''}`, { undo: () => (had ? act.placeBid(cell.id, had) : act.withdrawBid(cell.id)) });
    };
    // in gara: un tocco per salire di gradino (soglia del gradino + scudo medio)
    const climbTo = (k) => soglie[k] != null ? soglie[k] + addOf('medio') : null;
    const climb = (k) => {
      const had = a.my.max, to = climbTo(k);
      if (to == null || to - had > wallet.balance) { Pano.toast('Il saldo del wallet non basta per salire'); return; }
      act.placeBid(cell.id, to); bump();
      Pano.toast(`Sei salito al ${k}° · offerta massima ${Pano.eur(to)}`, { undo: () => act.placeBid(cell.id, had) });
    };
    const withdraw = () => { const had = a.my.max; act.withdrawBid(cell.id); setBid(null); Pano.toast('Offerta ritirata · importo sbloccato', { undo: () => act.placeBid(cell.id, had) }); };
    const simulate = () => { const r = act.closeAuction(cell.id); Pano.toast(r.me ? `Asta chiusa: ${r.me.pos}° posto, pagati ${Pano.eur(r.me.paid, true)}` : 'Asta chiusa: questa volta non sei entrato'); };
    const winners = closed && a.result ? a.result.win : null;
    const curPos = x.me ? x.me.pos : null;
    const curMargin = a.my && curPos ? a.my.max - (soglie[curPos] != null ? soglie[curPos] : a.my.max) : 0;
    const curSc = scudoDi(curMargin);
    const rivalT = editing ? est.rivalTrattoria : x.res.rivalTrattoria;
    return (
      <Drawer onClose={act.close} title={title} sub={`Trastevere · raggio 1,2 km · ≈ ${Pano.n(cell.reach)} persone · la manda byup`}>
        <div className={cx('auc-st', closed ? 'closed' : 'open')}>
          <i />
          <b>{closed ? `Asta chiusa · push inviata alle ${cell.time}` : `Asta aperta · chiude alle ${a.closeAt}`}</b>
          <span>{a.rivals.length + (a.my ? 1 : 0)} offerte in busta · base {Pano.eur(a.reserve)}</span>
        </div>
        {closed ? (
          <>
            {x.me
              ? <Note tone="good" icon="checkCircle"><b>Sei salito sul podio: {x.me.pos}° posto</b> · pagati {Pano.eur(x.me.paid, true)} con il secondo prezzo{a.my ? `; la tua offerta massima era ${Pano.eur(a.my.max)} e il resto è tornato nel wallet` : ''}.</Note>
              : a.my ? <Note tone="warn" icon="alert"><b>Questa volta sei rimasto in panchina.</b> {a.result && a.result.cut ? 'Chi è salito aveva offerta × qualità più alta della tua.' : ''} L’offerta massima è tornata nel wallet.</Note>
                : <Note icon="info">Asta chiusa senza la tua offerta.</Note>}
            <div className="auc-game">
              <AucPodio win={winners} closed pos={curPos} offers={x.res.offers} meOut={!!a.my && !x.me} hop={hop} />
            </div>
            <AucBuy cell={cell} F={F} closed />
          </>
        ) : capped ? (
          <>
            <Note tone="warn" icon="ban"><b>Tetto raggiunto.</b> Questa settimana hai già {week.length} push tra vinte e in gara: ogni locale ne vince al massimo {DATA.TETTO_PUSH}, così le push restano varie. Da lunedì puoi offrire di nuovo; intanto c’è la <button type="button" className="t-strong" style={{ textDecoration: 'underline' }} onClick={() => act.go('inapp')}>notifica in app</button>, a prezzo fisso.</Note>
            <AucBuy cell={cell} F={F} />
          </>
        ) : (
          <>
            <AucBuy cell={cell} F={F} />
            {rivalT && <Note tone="warn" icon="store"><b>C’è un’altra trattoria in gara.</b> Nella push ne entra una sola: per salire sul podio devi starle davanti, per questo le soglie sono più alte.</Note>}
            {editing ? (
              <div className="auc-game">
                <div className="auc-sec"><b><span className="auc-n">1</span>Scegli il tuo posto</b><span className="t-small">Tocca un gradino: sotto c’è quanto serve per salirci adesso.</span></div>
                <AucPodio win={est.win} soglie={soglie} pos={pos} onPick={pick} offers={est.offers} meOut={!pos} hop={hop} />
                <div className="auc-sec"><b><span className="auc-n">2</span>Metti lo scudo</b><span className="t-small">Quanto metti in più sopra la soglia per non farti scavalcare. Se nessuno alza non lo usi: paghi solo la soglia.</span></div>
                <Seg className="auc-scudi" value={shield || 'mano'} onChange={pickShield} options={SCUDI.map((s) => ({ id: s.id, icon: 'shield', label: <span className="sc"><b>{s.label}</b><small>+{Pano.eur(s.add, true)}</small></span> }))} label="Lo scudo" />
                <div className="auc-conto">
                  <div><span>Offri al massimo</span>
                    <div className="auc-step">
                      <IconBtn icon="minus" label="Meno 50 centesimi" size="sm" onClick={() => step(-0.5)} />
                      <b className="num">{Pano.eur(val)}</b>
                      <IconBtn icon="plus" label="Più 50 centesimi" size="sm" onClick={() => step(0.5)} />
                    </div>
                  </div>
                  <div className={cx(pos ? 'ok' : 'ko')}><span>{pos ? 'Paghi circa' : 'Per salire servono'}</span><b className="num">{pos ? Pano.eur(est.me.paid, true) : Pano.eur(est.need)}</b></div>
                </div>
                <div className={cx('auc-est', pos ? 'ok' : 'ko')}>
                  {pos ? <>{sc.lv ? <>Punti al <b>{tgt}°</b> con <b>scudo {sc.t}</b> (+{Pano.eur(margin, true)} sopra la soglia)</> : <>Punti al <b>{tgt}°</b> <b>senza scudo</b>: basta poco per scavalcarti</>}{pos < tgt ? <>, e oggi saresti già <b>{pos}°</b></> : null}. Se nessuno alza paghi <b>{Pano.eur(est.me.paid, true)}</b>; se qualcuno prova a scavalcarti, resti su fino a {Pano.eur(val)}.</>
                    : <>Con {Pano.eur(val)} resti in panchina: tocca il 3° gradino per salire, servono almeno <b>{Pano.eur(est.need)}</b>.</>}
                </div>
                <div className="auc-alert"><Icon n="bell" /><span>Avvisami se qualcuno mi scavalca</span><Switch on={alertOn} onChange={setAlertOn} label="Avvisami se qualcuno mi scavalca" /></div>
                <div className="row wrap" style={{ gap: 8 }}>
                  <Btn kind="primary" icon="push" disabled={!canPay} onClick={place}>{pos ? `${a.my ? 'Aggiorna' : 'Prendi il'} ${pos}° posto · massimo ${Pano.eur(val)}` : `Fai l’offerta · massimo ${Pano.eur(val)}`}</Btn>
                  {bid != null && a.my && <Btn kind="ghost" onClick={() => { setBid(null); setShield('medio'); }}>Annulla</Btn>}
                </div>
                <span className="t-small">{canPay ? `Il massimo resta bloccato nel wallet fino alle ${a.closeAt}; se resti in panchina torna subito disponibile. Disponibile ${Pano.eur(wallet.balance, true)}.` : 'Il saldo del wallet non basta per questa offerta.'}</span>
              </div>
            ) : (
              <div className="auc-game">
                <div className="row between wrap" style={{ gap: 8 }}>
                  <b className="auc-me">{curPos ? `Sei in gara: ${curPos}° posto` : 'Sei in panchina'}</b>
                  <span className="t-small">offerta massima <b className="t-strong">{Pano.eur(a.my.max)}</b></span>
                </div>
                <AucPodio win={x.res.win} soglie={soglie} pos={curPos} onPick={(k) => (curPos && k >= curPos ? null : climb(k))} offers={x.res.offers} meOut={!curPos} hop={hop} />
                {curPos ? (
                  <div className="auc-shield"><Icon n="shield" /><span><b>Scudo {curSc.t}</b>{curMargin > 0 ? ` · +${Pano.eur(curMargin, true)} sopra la soglia del ${curPos}°` : ' · basta poco per scavalcarti'}</span><span className="bars" aria-hidden="true">{[1, 2, 3].map((l) => <i key={l} className={cx(l <= curSc.lv && 'on')} />)}</span></div>
                ) : null}
                <div className="auc-conto">
                  <div><span>Offri al massimo</span><b className="num">{Pano.eur(a.my.max)}</b></div>
                  <div className={cx(curPos ? 'ok' : 'ko')}><span>{curPos ? 'Oggi pagheresti' : 'Per salire servono'}</span><b className="num">{curPos ? Pano.eur(x.me.paid, true) : Pano.eur(x.res.need)}</b></div>
                </div>
                {(curPos !== 1) && (
                  <div className="auc-climb">
                    {[3, 2, 1].filter((k) => (curPos ? k < curPos : true) && climbTo(k) != null).map((k) => (
                      <Btn key={k} kind={k === (curPos ? curPos - 1 : 3) ? 'primary' : 'secondary'} size="sm" icon="up" onClick={() => climb(k)}>{curPos ? `Sali al ${k}°` : k === 3 ? 'Sali sul podio' : `Vai al ${k}°`} · massimo {Pano.eur(climbTo(k))}</Btn>
                    ))}
                  </div>
                )}
                {AVVISI_ASTA.has(cell.id) && <span className="t-small auc-alerton"><Icon n="bell" size={14} />Avviso attivo: se qualcuno ti scavalca te lo diciamo, e puoi risalire in un tocco.</span>}
                <div className="row wrap" style={{ gap: 8 }}>
                  <Btn kind="secondary" size="sm" icon="edit" onClick={() => { setBid(a.my.max); setShield(null); setTarget(curPos || 3); }}>Cambia offerta</Btn>
                  <Btn kind="ghost" size="sm" icon="x" onClick={withdraw}>Ritira</Btn>
                  <span className="spacer" />
                  <Btn kind="ghost" size="sm" icon="clock" onClick={simulate}>Simula la chiusura</Btn>
                </div>
              </div>
            )}
            <AucTimeline cell={cell} />
          </>
        )}
        <Seg value={view} onChange={setView} options={[{ id: 'push', label: 'La notifica', icon: 'push' }, { id: 'lista', label: 'Aperta', icon: 'phone' }]} label="Anteprima della push" />
        {view === 'push'
          ? <Pano.PhoneCrop key="push" screen="push" from={430} h={414} fade="top" label="La push sullo schermo bloccato, da vicino" />
          : <Pano.PhoneCrop key="lista" screen="lista" from={-11} h={560} fade="bottom" label="La lista che si apre dalla push, da vicino" />}
        <Note icon="info">Tu non mandi la push: la manda byup, una per zona e per fascia. Le notifiche editoriali di byup sono a parte e non si comprano.</Note>
      </Drawer>
    );
  }

  // ─── Notifica in app: un posto nella Posta, a prezzo fisso ──────────────
  // Il messaggio è del locale (due righe, controllate come le altre creatività);
  // arriva alle 11:00 o alle 17:00 nella Posta di chi è in zona, linguetta «Promo
  // per te». Un posto al giorno per locale.
  const POSTA_MSG = [
    { id: 'm1', label: 'Carbonara stasera', text: 'Stasera carbonara tirata a mano e un tavolo per te alle 21. Prenota in due tocchi.' },
    { id: 'm2', label: 'Pranzo a 12 €', text: 'Pranzo a 12 €: cacio e pepe e acqua, a 350 m da te. Prenota in due tocchi.' },
    { id: 'm3', label: 'Halloween', text: 'Sabato 31 Halloween in trattoria: menù a 35 € e dolcetto per chi viene in maschera.' },
  ];
  const AUD_POSTA = [
    { id: 'zona', label: 'Tutta la zona', icon: 'pin', k: 1 },
    { id: 'nuovi', label: 'Mai venuti', icon: 'userPlus', k: 0.72 },
    { id: 'clienti', label: 'Già clienti', icon: 'repeat', k: 0.17, prof: true },
    { id: 'gusti', label: 'Per gusti', icon: 'heart', k: 0.44, prof: true },
  ];
  Pano.AUD_POSTA = AUD_POSTA;
  function PostaDrawer({ dayId, pos: p0 }) {
    const day = Pano.useStore((s) => s.posta.find((x) => x.id === dayId));
    const wallet = Pano.useStore((s) => s.wallet);
    const freeFirst = day ? day.places.find((p) => !p.sold) : null;
    const [pos, setPos] = useState(day && p0 && !day.places[p0 - 1].sold ? p0 : freeFirst ? freeFirst.pos : null);
    const [msg, setMsg] = useState(POSTA_MSG[0].text);
    const [when, setWhen] = useState('sera');
    const [aud, setAud] = useState('zona');
    if (!day) return null;
    const mine = day.places.find((p) => p.mine);
    const place = day.places.find((p) => p.pos === pos);
    const A = AUD_POSTA.find((x) => x.id === (mine ? mine.aud : aud)) || AUD_POSTA[0];
    const O = DATA.POSTA_ORE.find((o) => o.id === (mine ? mine.when : when)) || DATA.POSTA_ORE[0];
    const reach = Math.round((day.reach * A.k) / 10) * 10;
    const text = mine ? mine.msg : msg;
    const canPay = place && place.price <= wallet.balance;
    const book = () => {
      const price = act.bookPosta(day.id, pos, { msg: msg.trim(), when, aud });
      Pano.toast(`Prenotato il ${pos}° posto nella Posta · ${Pano.eur(price)}`, { undo: () => act.unbookPosta(day.id, pos, true) });
    };
    return (
      <Drawer onClose={act.close} title={`Notifica in app · ${Pano.fmtDay(day.d)}`} sub={`Trastevere · ≈ ${Pano.n(Math.round(day.reach / 10) * 10)} persone in zona con le promo accese · nella Posta, «Promo per te»`}>
        {mine ? (
          <>
            <Note tone="iride" icon="inbox"><b>Il tuo posto: {mine.pos}°, alle {O.time}</b> · {Pano.eur(mine.price)} bloccati nel wallet, addebitati all’invio. Puoi annullare fino al giorno prima.</Note>
            <div className="card soft" style={{ padding: 16 }}>
              <div className="col" style={{ gap: 8 }}>
                <span className="t-small">Il messaggio</span>
                <b style={{ fontSize: 15, lineHeight: 1.4 }}>«{mine.msg}»</b>
                <KV k="A chi arriva" v={`${A.label} · ≈ ${Pano.n(reach)} persone`} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="col" style={{ gap: 8 }} role="radiogroup" aria-label="Posto nella Posta">
              {day.places.map((p) => (
                <button key={p.pos} type="button" role="radio" aria-checked={pos === p.pos} className={cx('slot-row', pos === p.pos && 'on')} disabled={p.sold} onClick={() => setPos(p.pos)}>
                  <span className="pos">{p.pos}</span>
                  <span className="col" style={{ gap: 1, textAlign: 'left' }}><b>{p.sold ? `Preso · ${p.cat}` : 'Libero'}</b><span className="t-small">{Pano.cap(Pano.POS_LBL[p.pos - 1])}</span></span>
                  <span className="pr">{Pano.eur(p.price)}</span>
                </button>
              ))}
            </div>
            <div className="field">
              <label className="lbl" htmlFor="pq-msg">Il messaggio <span className="hint num">{msg.length}/120</span></label>
              <textarea id="pq-msg" className="textarea" rows={3} maxLength={120} value={msg} onChange={(e) => setMsg(e.target.value)} />
              <Chips value={(POSTA_MSG.find((m) => m.text === msg) || {}).id} onChange={(id) => setMsg(POSTA_MSG.find((m) => m.id === id).text)} options={POSTA_MSG.map((m) => ({ id: m.id, label: m.label }))} />
              <span className="hint">Al massimo due righe. Piatti e prezzi si controllano sul menù di Fresh, come per le altre creatività.</span>
            </div>
            <div className="field">
              <span className="lbl">Quando arriva</span>
              <Chips value={when} onChange={setWhen} options={DATA.POSTA_ORE.map((o) => ({ id: o.id, label: `${o.time} · ${o.label.toLowerCase()}`, icon: o.icon }))} />
            </div>
            <div className="field">
              <span className="lbl">A chi arriva</span>
              <Chips value={aud} onChange={setAud} options={AUD_POSTA.map((x) => ({ id: x.id, label: x.label, icon: x.icon }))} />
              <span className="hint">≈ {Pano.n(reach)} persone{A.prof ? ', solo tra chi ha acceso anche la profilazione' : ''}. Non vedrai mai chi sono.</span>
            </div>
          </>
        )}
        <Pano.PhoneCrop screen="posta" creative={{ text }} from={52} h={400} fade="bottom" label="La Posta dell’app con il tuo messaggio, da vicino" />
        <Note icon="info">Non suona e non va sullo schermo bloccato: la legge chi apre l’app. Per arrivare sul telefono c’è la <button type="button" className="t-strong" style={{ textDecoration: 'underline' }} onClick={() => act.go('push')}>push</button>, all’asta.</Note>
        {!mine && place && !place.sold && (
          <div style={{ position: 'sticky', bottom: -22, margin: '0 -22px -22px', padding: '14px 22px', background: 'var(--card)', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="col" style={{ gap: 0 }}><span className="t-small">{pos}° posto · alle {O.time} · bloccato fino all’invio</span><b className="num" style={{ fontSize: 18 }}>{Pano.eur(place.price)}</b></span>
            <span className="spacer" />
            <Btn kind="primary" size="lg" icon="check" disabled={!canPay || !msg.trim()} onClick={book}>Prenota il {pos}° posto</Btn>
          </div>
        )}
        {mine && <div className="row" style={{ justifyContent: 'flex-end' }}><Btn kind="danger" icon="x" onClick={() => { act.unbookPosta(day.id, mine.pos); Pano.toast('Prenotazione annullata · importo sbloccato'); }}>Annulla la prenotazione</Btn></div>}
      </Drawer>
    );
  }

  // ─── Primo accesso: benvenuto, regole, wallet ───────────────────────────
  function Onboarding() {
    const [step, setStep] = useState(0);
    const [ok, setOk] = useState(false);
    const [amt, setAmt] = useState(200);
    const finish = () => {
      const r = DATA.RICARICHE.find((x) => x.v === amt);
      act.recharge(amt, r.bonus, 'Primo caricamento');
      Pano.store.set({ access: 'approvato' });
      act.close();
      act.go('panorama');
      Pano.toast('Benvenuto in Panorama');
    };
    return (
      <Modal onClose={act.close} size="wide" noClose={false} label="Primo accesso a Panorama">
        <div className="row" style={{ gap: 8, marginTop: -6 }}>{[0, 1, 2].map((i) => <span key={i} style={{ flex: 1, height: 5, borderRadius: 99, background: i <= step ? 'var(--ink)' : 'var(--paper-2)' }} />)}</div>
        {step === 0 && (
          <div className="row top wrap" style={{ gap: 24, alignItems: 'center' }}>
            <img src={Pano.IMG.byuppino} alt="Byuppino" style={{ width: 210, flexShrink: 0, filter: 'drop-shadow(0 20px 30px rgba(90,60,160,.3))' }} />
            <div className="col" style={{ gap: 12, flex: 1, minWidth: 240 }}>
              <span className="t-micro">Accesso approvato</span>
              <h2 className="t-display">Benvenuto in Panorama, Mario</h2>
              <p className="t-body" style={{ color: 'var(--muted)' }}>Da qui compri visibilità dentro l'app byup, la controlli e vedi quanto ti rende. Stesso account di Fresh.</p>
              {[['eye', 'Vedi chi raggiungi', 'Persone, tocchi, prenotazioni e coperti, giorno per giorno.'], ['sparkle', 'Promuovi in un tap', 'Un piatto o un evento in cima alla tua vetrina, in un tocco.'], ['shield', 'Tutto anonimo', 'Niente contatti da esportare, niente dati personali.']].map(([ic, t, s]) => (
                <div key={t} className="row top" style={{ gap: 12 }}><span className="card-head" style={{ margin: 0 }}><span className="ico"><Icon n={ic} /></span></span><div className="col" style={{ gap: 1 }}><b>{t}</b><span className="t-small">{s}</span></div></div>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <>
            <span className="t-micro">Passo 2 di 3</span>
            <h2 className="t-title">Le regole dei contenuti</h2>
            <p className="t-body" style={{ color: 'var(--muted)' }}>Servono a tenere l'app pulita per chi la usa. Il controllo è automatico; byup guarda a mano solo quando qualcosa viene segnalato.</p>
            <div className="grid" style={{ gap: 10 }}>
              {DATA.REGOLE.map((r) => (
                <div key={r.t} className="card soft tight c-6"><div className="row top" style={{ gap: 12 }}><Icon n={r.icon} size={18} /><div className="col" style={{ gap: 2 }}><b style={{ fontSize: 13.5 }}>{r.t}</b><span className="t-small">{r.s}</span></div></div></div>
              ))}
            </div>
            <label className="row" style={{ gap: 10, cursor: 'pointer', fontWeight: 600 }} htmlFor="ob-ok">
              <input id="ob-ok" type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--ink)' }} />
              Ho letto e accetto le regole dei contenuti
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <span className="t-micro">Passo 3 di 3</span>
            <h2 className="t-title">Carica il wallet</h2>
            <p className="t-body" style={{ color: 'var(--muted)' }}>Panorama funziona a crediti prepagati: niente sorprese in fattura. Il bonus cresce con la ricarica.</p>
            <div className="opt-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))' }}>
              {DATA.RICARICHE.map((r) => (
                <button key={r.v} type="button" className={cx('opt', amt === r.v && 'on')} onClick={() => setAmt(r.v)} aria-pressed={amt === r.v}>
                  <span className="big sm"><span className="cur">€</span>{r.v}</span>
                  <span className="opt-d">{r.bonus ? `ricevi ${Pano.eur(r.v + r.bonus)}` : 'nessun bonus'}</span>
                </button>
              ))}
            </div>
            <Note icon="card">Paghi con la carta già usata per Fresh: <b>Visa •••• 4242</b>.</Note>
          </>
        )}
        <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
          {step > 0 && <Btn kind="secondary" onClick={() => setStep(step - 1)}>Indietro</Btn>}
          {step < 2 ? <Btn kind="primary" iconRight="arrowR" disabled={step === 1 && !ok} onClick={() => setStep(step + 1)}>{step === 0 ? 'Iniziamo' : 'Accetto e continuo'}</Btn>
            : <Btn kind="primary" icon="wallet" onClick={finish}>Carica {Pano.eur(amt)} ed entra</Btn>}
        </div>
      </Modal>
    );
  }

  // ─── Avvisi (campanella) ────────────────────────────────────────────────
  function AlertsList({ onPick }) {
    return (
      <div className="col" style={{ gap: 2 }}>
        <div className="menu-label row between"><span className="t-micro">Avvisi</span><span className="t-small">4 nuovi</span></div>
        {DATA.AVVISI.map((a) => (
          <button key={a.id} type="button" className="menu-item" style={{ alignItems: 'flex-start' }} onClick={() => { onPick && onPick(); if (a.go.kind === 'route') act.go(a.go.id); else act.open('campagna', { id: a.go.id }); }}>
            <span className={cx('pill', a.tone)} style={{ width: 30, height: 30, padding: 0, justifyContent: 'center', flexShrink: 0 }}><Icon n={a.icon} /></span>
            <span className="col" style={{ gap: 1, minWidth: 0 }}><b style={{ color: 'var(--ink)', fontSize: 13.5 }}>{a.t}</b><span className="sub">{a.s}</span></span>
            <span className="t-small num" style={{ marginLeft: 'auto', flexShrink: 0 }}>{a.at}</span>
          </button>
        ))}
      </div>
    );
  }

  // ─── Host degli strati ──────────────────────────────────────────────────
  function Overlays() {
    const o = Pano.useStore((s) => s.overlay);
    if (!o) return null;
    const p = o.props || {};
    if (o.kind === 'promuovi') return <QuickPromote {...p} />;
    if (o.kind === 'wizard') return <Wizard {...p} />;
    if (o.kind === 'ricarica') return <Recharge {...p} />;
    if (o.kind === 'campagna') return <CampaignDrawer {...p} />;
    if (o.kind === 'slot') return <SlotDrawer {...p} />;
    if (o.kind === 'posta') return <PostaDrawer {...p} />;
    if (o.kind === 'onboarding') return <Onboarding {...p} />;
    return null;
  }

  Object.assign(Pano, { Overlays, AlertsList, QuickPromote, Wizard, Recharge, CampaignDrawer, SlotDrawer, Onboarding });
})();
