// ═══════════════════════════════════════════════════════════════════════
// Panorama · anteprime nell'app byup. Le schermate sono quelle del
// prototipo dell'app (cartella app/, stessi componenti e misure):
//   ricerca  → «Disponibili adesso», il tuo locale primo della lista
//   perte    → «Stasera per te» (Fase 2)
//   offerta  → home, sezione «In evidenza» (la card vino con la pillola lime)
//   eventi   → home, sezione «Da scoprire» (la card in primo piano)
//   digest   → la lista che si apre dalla notifica di zona
//   push     → la notifica sullo schermo bloccato
//   mappa    → la mappa con il pin e la card in basso (Fase 2)
//   piatto   → una categoria con il piatto in evidenza (Fase 2)
//   vetrina  → la vetrina del locale con un piatto o un evento in evidenza
//              (Promuovi in un tap: non tocca gli spazi a contesa)
// PhoneCrop mostra lo stesso telefono da vicino, a grandezza vera, tagliato
// su una finestra: per leggere davvero la notifica o la lista.
// Il telefono disegna a 390 punti di larghezza, come l'app, e rimpicciolisce
// tutto. L'annuncio porta sempre l'etichetta «Sponsorizzato».
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useLayoutEffect, useRef } = React;
  const cx = Pano.cx;
  const I = Pano.IMG, A = Pano.IMG.app;
  const CORAL = '#E32459', INK = '#1C0F15', MUTED = 'rgba(28,15,21,.56)';

  // ─── Icone dell'app (stessi tracciati di app/app.jsx) ───────────────────
  const sv = (s, vb = '0 0 24 24') => ({ width: s, height: s, viewBox: vb, 'aria-hidden': true });
  const Ic = {
    pin: ({ s = 13, c = MUTED }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.2c4.1-3.9 6.6-7.4 6.6-10.5a6.6 6.6 0 1 0-13.2 0c0 3.1 2.5 6.6 6.6 10.5z" /><circle cx="12" cy="10.5" r="2.3" /></svg>,
    chevD: ({ s = 12, c = 'rgba(28,15,21,.34)' }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
    back: ({ s = 18, c = '#fff' }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
    bell: ({ s = 22, c = INK }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.2a5.9 5.9 0 0 0-5.9 5.9c0 3.2-.75 4.5-1.55 5.5-.5.62-.06 1.6.74 1.6h13.42c.8 0 1.24-.98.74-1.6-.8-1-1.55-2.3-1.55-5.5A5.9 5.9 0 0 0 12 3.2z" /><path d="M10.2 20.3a2 2 0 0 0 3.6 0" /></svg>,
    search: ({ s = 20, c = MUTED }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.4" /><path d="M20.3 20.3l-4-4" /></svg>,
    sliders: ({ s = 20, c = INK }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /><circle cx="9" cy="6" r="2.2" fill="#fff" /><circle cx="15" cy="12" r="2.2" fill="#fff" /><circle cx="8" cy="18" r="2.2" fill="#fff" /></svg>,
    star: ({ s = 12, c = '#FFC839' }) => <svg {...sv(s)} fill={c}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    arrowUR: ({ s = 15, c = CORAL }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="18" x2="18" y2="6" /><polyline points="9 6 18 6 18 15" /></svg>,
    map: ({ s = 16, c = '#fff' }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.3 4.3 5.5 5.6A2.1 2.1 0 0 0 4 7.6v9.5c0 1 1 1.7 1.9 1.3l3-1.1c.5-.2 1.1-.2 1.6 0l3 1.1c.5.2 1.1.2 1.6 0l3.4-1.2a2.1 2.1 0 0 0 1.5-2V5.7c0-1-1-1.7-1.9-1.3l-3 1.1c-.5.2-1.1.2-1.6 0l-3-1.1a2.1 2.1 0 0 0-1.2-.1z" /><path d="M9.6 4.6v12.9M14.4 6.5v12.9" opacity=".5" /></svg>,
    home: ({ s = 24, c = CORAL, fill }) => <svg {...sv(s)} fill={fill || 'none'} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 10.9c0-.95.45-1.85 1.21-2.42l4.5-3.38a3 3 0 0 1 3.58 0l4.5 3.38a3.03 3.03 0 0 1 1.21 2.42v5.6a3.5 3.5 0 0 1-3.5 3.5H8a3.5 3.5 0 0 1-3.5-3.5z" /><path d="M12 15.1v2" stroke={fill ? '#fff' : c} /></svg>,
    user: ({ s = 24, c = 'rgba(77,18,46,.42)' }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8.2" r="3.6" /><path d="M5.3 20.2a6.9 6.9 0 0 1 13.4 0v.9H5.3z" /></svg>,
    qr: ({ s = 28 }) => (
      <svg {...sv(s, '0 0 32 32')} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4.5" y="4.5" width="8.6" height="8.6" rx="2.8" /><rect x="18.9" y="4.5" width="8.6" height="8.6" rx="2.8" /><rect x="4.5" y="18.9" width="8.6" height="8.6" rx="2.8" />
        {[[7.6, 7.6, 2.4], [22, 7.6, 2.4], [7.6, 22, 2.4], [18.9, 18.9, 3.4], [24.1, 18.9, 3.4], [18.9, 24.1, 3.4], [24.1, 24.1, 3.4]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={w} rx={w > 3 ? 1.4 : 1.1} fill="#fff" stroke="none" />)}
      </svg>
    ),
    heart: ({ s = 15 }) => <svg {...sv(s)} fill="rgba(255,255,255,.92)" stroke="rgba(255,255,255,.92)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9-9.5C1.5 7.5 4 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 20 4 22.5 7.5 21 11.5c-2 5-9 9.5-9 9.5z" /></svg>,
    clock: ({ s = 10, c = '#141414' }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l2.8 1.8" /></svg>,
    filter: ({ s = 18, c = INK }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M7 12h10M10 17h4" /></svg>,
    locate: ({ s = 18, c = CORAL }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="2" fill={c} /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></svg>,
    plus: ({ s = 20, c = INK }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
    minus: ({ s = 20, c = INK }) => <svg {...sv(s)} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>,
    contactless: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6.5 8.5a8 8 0 0 1 0 7" /><path d="M9.8 7a11 11 0 0 1 0 10" /><path d="M13.1 5.5a14 14 0 0 1 0 13" /></svg>,
  };

  // ─── Dati: il tuo locale e gli altri della zona ─────────────────────────
  // foto «vere» dell'annuncio: se la creatività ha solo il piatto scontornato, si usa la foto più vicina
  const PHOTO_OF = [[I.carbonara, A.carbonara], [I.tagliere, A.vino], [I.lasagna, A.penne], [I.spritz, A.cocktail], [I.negroni, A.cocktails], [I.vino, A.vino], [I.tiramisu, A.tiramisu], [I.polpo, A.cena], [I.bruschette, A.gente], [I.fritto, A.pub]];
  const photoOf = (c) => (c && c.photo) || ((PHOTO_OF.find((p) => c && p[0] === c.img) || [])[1]) || A.trattoria;
  function meOf(c, venue) {
    const name = (venue && venue.name) || 'Cacio e Pepe';
    const cr = c || {};
    return {
      name, cuisine: 'Trattoria romana', distance: '350 m', rating: 4.6, reviews: 214, price: '€€',
      photo: photoOf(cr), title: cr.title || name, text: cr.text || '', cta: cr.cta || 'Prenota',
      date: cr.date, when: cr.when, discount: cr.discount,
      slots: [{ time: '20:00' }, { time: '20:30' }, { time: '21:00', last: true }],
    };
  }
  const V = {
    settembrini: { name: 'Al Settembrini', cuisine: 'Ristorante', distance: '0.4 km', rating: 4.5, price: '€€€', photo: A.sala, alt: A.salabuia, premium: true, slots: [{ time: '20:30' }, { time: '21:00' }, { time: '21:30' }], hours: '12:30 – 23:00' },
    lucia: { name: 'Trattoria Lucia', cuisine: 'Cucina romana', distance: '0.6 km', rating: 4.8, price: '€€', photo: A.gente, alt: A.trattoria, badge: 'Top rated', slots: [{ time: '21:00' }, { time: '21:30' }, { time: '22:00' }] },
    impronta: { name: 'All’Impronta', cuisine: 'Ristorante creativo', distance: '0.8 km', rating: 4.6, price: '€€€', photo: A.salabuia, alt: A.sala, badge: 'Suggerito per te', hours: '19:00 – 24:00', slots: [{ time: '20:00' }, { time: '20:30' }] },
    lounge: { name: 'Lounge 22', cuisine: 'Cocktail bar', distance: '1.1 km', rating: 4.4, price: '€€', photo: A.cocktails, alt: A.cocktail, hours: '18:00 – 02:00' },
    bluenote: { name: 'Blue Note', cuisine: 'Jazz club', distance: '1.0 km', rating: 4.5, price: '€€€', photo: A.notte, alt: A.pub },
    fiamma: { name: 'Pizzeria La Fiamma', cuisine: 'Pizzeria', distance: '0.5 km', rating: 4.5, price: '€', photo: A.pizza, alt: A.pizza },
    hanami: { name: 'Sushi Hanami', cuisine: 'Sushi', distance: '0.9 km', rating: 4.7, price: '€€', photo: A.sushi, alt: A.sushi },
    moro: { name: 'Vineria Il Moro', cuisine: 'Vineria', distance: '0.7 km', rating: 4.4, price: '€€', photo: A.vino, alt: A.cocktails },
    angelo: { name: 'Osteria dell’Angelo', cuisine: 'Osteria romana', distance: '1.2 km', rating: 4.3, price: '€€', photo: A.cena, alt: A.trattoria },
  };
  // la foto di un altro locale non deve essere uguale alla tua
  const ph = (v, me) => (me && v.photo === me.photo ? v.alt : v.photo);

  // ─── Pezzi comuni ───────────────────────────────────────────────────────
  function Status({ light, time = '19:58' }) {
    return (
      <div className={cx('ap-status', light && 'light')} aria-hidden="true">
        <span className="t">{time}</span>
        <span className="ic">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 11.4 5.7 9a3.3 3.3 0 0 1 4.6 0Z" /><path d="M3.4 6.7a6.6 6.6 0 0 1 9.2 0l-1.2 1.2a4.9 4.9 0 0 0-6.8 0Z" /><path d="M1.1 4.4a9.8 9.8 0 0 1 13.8 0l-1.2 1.2a8.1 8.1 0 0 0-11.4 0Z" /></svg>
          <svg width="27" height="13" viewBox="0 0 27 13" fill="currentColor"><rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="17" height="9" rx="2.4" /><path d="M25 4.6v3.8a2.1 2.1 0 0 0 0-3.8Z" opacity=".45" /></svg>
        </span>
      </div>
    );
  }
  function TabBar() {
    return (
      <div className="ap-tab" aria-hidden="true">
        <div className="ap-tab-fade" />
        <div className="ap-tab-row">
          <div className="ap-isl"><span className="ap-tile" /><span className="ap-tb"><Ic.home fill={CORAL} /></span></div>
          <span className="ap-qr"><Ic.qr /></span>
          <div className="ap-isl"><span className="ap-tb"><Ic.user /></span></div>
        </div>
      </div>
    );
  }
  const Spons = ({ dark }) => <span className={cx('ap-spons', dark && 'dark')}>Sponsorizzato</span>;
  function Section({ title, action, refEl }) {
    return <div className="ap-sec" ref={refEl}><b>{title}</b>{action && <span>{action}</span>}</div>;
  }

  // Card grande dei locali («Disponibili adesso»): foto, pillole, pannello di vetro, orari
  function BigCard({ v, badge, ad, photo }) {
    const hasSlots = v.slots && v.slots.length > 0;
    if (v.premium && !ad) {
      return (
        <div className="ap-prem">
          <div className="ap-prem-img"><img src={photo || v.photo} alt="" /><i />
            <span className="ap-prem-tag"><Ic.star s={10} c="#3d2c00" />Selezione byup</span>
            <span className="ap-prem-rt"><Ic.star s={11} c="#ffe27a" />{v.rating.toFixed(1)}</span>
          </div>
          <div className="ap-prem-body">
            <div className="row1"><b>{v.name}</b><span>{v.price}</span></div>
            <div className="row2">{v.cuisine}<i />{v.distance}</div>
            {hasSlots && <div className="ap-prem-slots">{v.slots.map((s) => <span key={s.time}>{s.time}{s.last && <small>ultimo</small>}</span>)}</div>}
          </div>
        </div>
      );
    }
    return (
      <div className={cx('ap-big', ad && 'ad', !hasSlots && 'noslot')}>
        <img src={photo || v.photo} alt="" />
        <i className="ap-big-shade" />
        {badge && <span className={cx('ap-big-badge', ad && 'ad')}>{badge}</span>}
        <span className="ap-big-rt"><Ic.star s={11} c="#ffb3c4" />{v.rating.toFixed(1)}</span>
        <div className="ap-glass">
          <div className="ap-glass-row">
            <div className="col">
              <b>{v.name}</b>
              <span className="meta"><Ic.pin s={11} c="#ffd3de" />{v.distance}<i />{v.cuisine}<i /><em>{v.price}</em></span>
            </div>
            <span className="ap-go"><Ic.arrowUR /></span>
          </div>
          {hasSlots && <div className="ap-slots">{v.slots.map((s) => <span key={s.time}>{s.time}{s.last && <small>ultimo</small>}</span>)}</div>}
        </div>
      </div>
    );
  }

  // Testata rosa di «Disponibili adesso» (e del digest)
  function Hero({ eyebrow, title, sub, n, map = true }) {
    return (
      <div className="ap-hero">
        <i className="bg" /><i className="shade" />
        <span className="ap-hbtn back"><Ic.back /></span>
        {map && <span className="ap-hbtn map"><Ic.map />Mappa</span>}
        <div className="ap-hero-txt">
          <span className="eb">{eyebrow}</span>
          <b>{title}</b>
          <span className="sub"><span className="dot" />{n} locali<span className="sep">·</span>{sub}</span>
        </div>
      </div>
    );
  }

  // ─── Disponibili adesso / Stasera per te ────────────────────────────────
  function Dispo({ me, kind }) {
    const perte = kind === 'perte';
    const second = perte ? V.lucia : V.settembrini;
    const third = perte ? V.settembrini : V.lucia;
    return (
      <div className="ap ap-flat">
        <div className="ap-col">
          <Hero eyebrow={perte ? 'Stasera' : 'Adesso'} title={perte ? 'Stasera per te' : 'Disponibili adesso'} sub={perte ? 'Tavolo prenotabile subito' : 'Prenotabili entro mezz’ora'} n={4} />
          <div className="ap-list">
            <div className="ap-in" style={{ animationDelay: '.15s' }}><BigCard v={me} ad badge={perte ? 'Sponsorizzato · per te' : 'Sponsorizzato'} /></div>
            <div className="ap-in" style={{ animationDelay: '.27s' }}><BigCard v={second} badge={second.badge} photo={ph(second, me)} /></div>
            <div className="ap-in" style={{ animationDelay: '.39s' }}><BigCard v={third} badge={third.badge} photo={ph(third, me)} /></div>
          </div>
        </div>
        <Status light />
        <TabBar />
      </div>
    );
  }

  // ─── Home: In evidenza e Da scoprire ────────────────────────────────────
  // La home dell'app, uguale; all'apertura scorre da sola fino all'annuncio.
  function Featured({ me, ad }) {
    if (!ad) {
      return (
        <div className="ap-feat">
          <div className="ap-feat-photo"><img src={A.cena} alt="" /><i /></div>
          <div className="ap-feat-txt"><span className="pill">In evidenza</span><b>Giovedì <em>−30%</em> sul menù</b></div>
          <span className="ap-feat-cta">Scopri l’offerta</span>
          <div className="ap-marq"><div><span>✦ Trattoria Lucia ✦ solo questa settimana ✦ posti limitati ✦ Trattoria Lucia ✦ solo questa settimana ✦ posti limitati</span><span>✦ Trattoria Lucia ✦ solo questa settimana ✦ posti limitati ✦ Trattoria Lucia ✦ solo questa settimana ✦ posti limitati</span></div></div>
        </div>
      );
    }
    const t = me.title;
    const k = me.discount && t.indexOf(me.discount) >= 0 ? t.indexOf(me.discount) : -1;
    const title = k >= 0 ? <>{t.slice(0, k)}<em>{me.discount}</em>{t.slice(k + me.discount.length)}</> : t;
    const words = [me.name, me.when || 'solo a Trastevere', 'posti limitati'];
    const line = ('✦ ' + words.join(' ✦ ') + ' ').repeat(2);
    return (
      <div className="ap-feat ad">
        <div className="ap-feat-photo"><img src={me.photo} alt="" /><i /></div>
        <div className="ap-feat-txt">
          <span className="pill">Sponsorizzato</span>
          <b>{title}</b>
          <span className="ap-count"><Ic.clock />scade tra 02:14:08</span>
        </div>
        <span className="ap-feat-cta">{me.cta === 'Prenota' ? 'Scopri l’offerta' : me.cta}</span>
        <div className="ap-marq"><div><span>{line}</span><span>{line}</span></div></div>
      </div>
    );
  }
  function StackCard({ it, side, ad }) {
    const dot = it.tone === 'live' ? '#3ddc7f' : '#ffc839';
    return (
      <div className={cx('ap-stk', side && 'side', ad && 'ad')} style={side ? { '--r': side } : undefined}>
        <img src={it.photo} alt="" />
        <i className="sh" />
        {it.date ? (
          <span className="ap-stk-date"><small>{it.date.month}</small><b>{it.date.day}</b></span>
        ) : it.discount ? <span className="ap-stk-disc">{it.discount}</span> : null}
        <span className={cx('ap-stk-tag', ad && 'ad')}>{ad ? 'Sponsorizzato' : it.date ? 'Evento' : 'Promo'}</span>
        <div className="ap-stk-glass">
          <div className="r1"><b>{it.title}</b><span className="ap-go sm"><Ic.arrowUR s={14} /></span></div>
          <div className="r2"><i style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />{it.status}<em /><Ic.star s={12} />{it.rating}{it.reviews ? ` (${it.reviews})` : ''}</div>
        </div>
      </div>
    );
  }
  function Home({ me, focus }) {
    const sec = useRef({});
    const [y, setY] = useState(0);
    useLayoutEffect(() => {
      const el = sec.current[focus];
      if (!el) return undefined;
      const target = Math.max(0, el.offsetTop - 64);
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { setY(target); return undefined; }
      const t = setTimeout(() => setY(target), 700);
      return () => clearTimeout(t);
    }, [focus]);
    const evento = focus === 'scoprire';
    const mine = { title: me.title, photo: me.photo, date: me.date, discount: me.date ? null : me.discount || '−15%', status: me.when || 'Attiva ora', tone: me.when ? 'soon' : 'live', rating: me.rating.toFixed(1), reviews: me.reviews };
    const jazz = { title: 'Live Jazz', photo: ph(V.bluenote, me), date: { month: 'OTT', day: '24' }, status: 'Stasera · 22:00', tone: 'soon', rating: '4.5', reviews: 78 };
    const aper = { title: 'Aperitivo 2x1', photo: ph(V.lounge, me), discount: '2x1', status: 'Attiva · fino alle 21', tone: 'live', rating: '4.6', reviews: 132 };
    const center = evento ? mine : aper;
    const left = evento ? jazz : jazz;
    const right = evento ? aper : { title: 'Veglione', photo: ph(V.impronta, me), date: { month: 'DIC', day: '31' }, status: 'Il 31 · 20:30', tone: 'soon', rating: '4.8', reviews: 210 };
    const cats = [['Burger', A.catBurger], ['Aperitivo', A.catAperitivo], ['Poke', A.catPoke], ['Panini', A.catPanini], ['Birra', A.catBirra]];
    const favs = [V.settembrini, V.impronta, V.lounge];
    return (
      <div className="ap ap-home">
        <div className="ap-scroll" style={{ transform: `translateY(${-y}px)` }}>
          <div className="ap-head">
            <div className="col">
              <span className="ap-city"><Ic.pin s={12} />Roma<Ic.chevD /></span>
              <b className="ap-hello">Stasera, <em>Giulia</em>?</b>
            </div>
            <span className="ap-bellbtn"><Ic.bell /><i /></span>
          </div>
          <div className="ap-search"><Ic.search /><span>Cerca un locale, un piatto...</span><Ic.sliders /></div>
          <div className="ap-moment">
            <i className="bubble" />
            <span className="on"><img src={A.icOra} alt="" />Ora</span><span>Pranzo</span><span>Cena</span><span>Notte</span>
          </div>
          <div className="ap-offer"><img src={A.offer} alt="" /></div>
          <div className="ap-dots"><i /><i className="on" /><i /><i /><i /></div>
          <div className="ap-intent">
            <span className="ic"><img src={A.icOra} alt="" /></span>
            <div className="col">
              <span className="eb">Adesso</span>
              <b>Tavolo subito</b>
              <span className="row"><small>8 locali liberi vicino a te</small><em><Ic.clock />44:55</em></span>
            </div>
            <span className="cta">Scopri</span>
          </div>
          <Section title="Esplora per categoria" />
          <div className="ap-cats">{cats.map(([l, src]) => <span key={l} className="ap-cat"><i><img src={src} alt="" /></i>{l}</span>)}</div>
          <Section title="In evidenza" refEl={(e) => { sec.current.evidenza = e; }} />
          <Featured me={me} ad={!evento} />
          <Section title="Da scoprire" action="Vedi tutto" refEl={(e) => { sec.current.scoprire = e; }} />
          <div className="ap-stack">
            <StackCard it={left} side={-1} />
            <StackCard it={right} side={1} />
            <StackCard it={center} ad={evento} />
          </div>
          <Section title="I tuoi preferiti" action="Vedi tutti" />
          <div className="ap-favs">
            {favs.map((v) => (
              <div key={v.name} className="ap-fav">
                <div className="img"><img src={ph(v, me)} alt="" />{v.premium && <span className="pr"><Ic.star s={9} c="#3d2c00" />Premium</span>}<span className="hr"><Ic.heart /></span></div>
                <div className="txt"><b>{v.name}</b><span>{v.cuisine}<span>·</span><Ic.pin s={10} />Roma</span><span className="open"><i />Aperto</span><span>{v.hours || '19:00 – 24:00'}</span></div>
              </div>
            ))}
          </div>
          <Section title="Paga in un tap" />
          <div className="ap-pay">
            <div className="r1"><b>byup <em>pay</em></b><Ic.contactless /></div>
            <div className="r2"><i className="chip" /><span>••••  ••••  ••••  <small>byup</small></span></div>
            <div className="r3"><div className="col"><b>La tua carta si sente sola.</b><small>Apple Pay · Carte — 30 secondi e paghi in un tap.</small></div><span className="cta">Configura</span></div>
          </div>
        </div>
        <i className={cx('ap-topfade', y > 0 && 'on')} />
        <Status />
        <TabBar />
      </div>
    );
  }

  // ─── Digest: la lista che si apre dalla notifica ────────────────────────
  function Digest({ me }) {
    const rows = [V.fiamma, Object.assign({}, me, { me: true }), V.hanami, V.moro];
    return (
      <div className="ap ap-flat">
        <div className="ap-col">
          <Hero eyebrow="Digest di zona · 20:00" title="Stasera a Trastevere" sub="uno per cucina · sponsorizzati" n={4} map={false} />
          <div className="ap-list ap-dgl">
            {rows.map((v, i) => (
              <div key={v.name} className={cx('ap-dg', v.me && 'me', 'ap-in')} style={{ animationDelay: 0.12 + i * 0.1 + 's' }}>
                <img src={v.me ? v.photo : ph(v, me)} alt="" />
                <i className="sh" />
                <span className="n">{i + 1}</span>
                <span className="ap-big-rt"><Ic.star s={11} c="#ffb3c4" />{v.rating.toFixed(1)}</span>
                <div className="ap-glass">
                  <div className="ap-glass-row">
                    <div className="col"><b>{v.name}</b><span className="meta"><Ic.pin s={11} c="#ffd3de" />{v.distance}<i />{v.cuisine}<i /><em>{v.price}</em></span></div>
                    <span className="ap-go"><Ic.arrowUR /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Status light />
        <TabBar />
      </div>
    );
  }

  // ─── Schermo bloccato con la notifica di zona ───────────────────────────
  function Lock({ me }) {
    return (
      <div className="ap ap-lock">
        <Status light />
        <div className="ap-lock-top"><span>Sabato 24 ottobre</span><b>19:58</b></div>
        <div className="ap-notif ap-in" style={{ animationDelay: '.5s' }}>
          <span className="app"><Pano.ByupGlyph size={22} /></span>
          <div className="col">
            <div className="h"><b>byup</b><span>adesso</span></div>
            <b className="t">Stasera a Trastevere</b>
            <span className="b">Cena? 3 posti scelti per te: La Fiamma, <b>{me.name}</b>, Sushi Hanami. E altri nell’app.</span>
          </div>
        </div>
        <div className="ap-lock-bot"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2h8l-1 6H9z" /><path d="M9 8v12a3 3 0 0 0 6 0V8" /></svg></span><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg></span></div>
        <i className="ap-homeind" />
      </div>
    );
  }

  // ─── Mappa ──────────────────────────────────────────────────────────────
  function Mappa({ me }) {
    const tray = [Object.assign({}, me, { me: true }), V.settembrini, V.angelo];
    return (
      <div className="ap ap-map">
        <svg className="ap-map-svg" viewBox="0 0 390 833" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="390" height="833" fill="#F4EEE8" />
          <path d="M300 -20 C 250 160, 360 300, 290 470 S 250 700, 320 860" stroke="#C6E2F2" strokeWidth="58" fill="none" />
          <path d="M300 -20 C 250 160, 360 300, 290 470 S 250 700, 320 860" stroke="#B3D8EE" strokeWidth="3" fill="none" opacity=".6" />
          <path d="M-20 600 C 60 560, 120 610, 210 570" stroke="#D9EBCF" strokeWidth="70" fill="none" />
          {[[18, 120, 90, 62], [124, 104, 70, 88], [20, 200, 64, 70], [100, 214, 110, 60], [24, 290, 96, 74], [140, 300, 76, 92], [30, 386, 70, 66], [118, 410, 96, 70], [36, 470, 84, 60], [150, 494, 60, 56], [214, 150, 50, 70], [208, 250, 44, 90], [350, 380, 60, 80], [356, 520, 50, 70], [210, 640, 70, 60], [300, 610, 60, 50]].map((b, i) => <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="10" fill="#EBE2D8" />)}
          {['M0 186 H 260', 'M0 280 C 120 270, 200 290, 270 276', 'M0 376 H 250', 'M106 90 V 560', 'M196 80 C 190 300, 210 480, 200 700', 'M0 460 H 230', 'M0 700 C 120 690, 250 720, 390 700'].map((d, i) => <path key={i} d={d} stroke="#FFFFFF" strokeWidth={i === 4 ? 13 : 9} fill="none" strokeLinecap="round" />)}
          <text x="318" y="300" fill="#7AA9C6" fontSize="12" fontWeight="700" transform="rotate(72 318 300)" fontFamily="Hanken Grotesk, sans-serif" letterSpacing="2">TEVERE</text>
          <text x="40" y="244" fill="#B3A596" fontSize="11" fontWeight="700" fontFamily="Hanken Grotesk, sans-serif" letterSpacing="1.5">TRASTEVERE</text>
        </svg>
        {[[62, 330, 8], [176, 236, 6], [154, 470, 8], [300, 560, 5], [70, 560, 7]].map(([x, y, n], i) => <span key={i} className="ap-cl" style={{ left: x, top: y }}>{n}</span>)}
        <div className="ap-pin" style={{ left: 128, top: 352 }}>
          <i className="pulse" />
          <div className="pill"><img src={me.photo} alt="" /><b>{me.name}</b><em>★{me.rating.toFixed(1)}</em></div>
          <i className="tail" />
        </div>
        <div className="ap-map-top">
          <span className="ap-mback"><Ic.back /></span>
          <span className="ap-msearch"><Ic.search s={16} />Cerca ristorante o zona…</span>
          <span className="ap-mfilt"><Ic.filter /></span>
        </div>
        <div className="ap-mchips"><span className="on">Tutti</span><span>Ristoranti</span><span>Pizzerie</span><span>Bar &amp; Cocktail</span></div>
        <span className="ap-mcount">70 locali</span>
        <div className="ap-mctrl"><span><Ic.locate /></span><span className="z"><Ic.plus /><i /><Ic.minus /></span></div>
        <div className="ap-tray">
          {tray.map((v) => (
            <div key={v.name} className={cx('ap-tcard', v.me && 'me')}>
              <div className="img"><img src={v.me ? v.photo : ph(v, me)} alt="" /><span className="rt"><Ic.star s={10} c="#FFD700" />{v.rating}</span><span className="op">Aperto</span></div>
              <div className="txt">{v.me && <span className="ap-spons-sm">Sponsorizzato</span>}<b>{v.name}</b><span><em>{v.cuisine}</em><strong>Roma</strong></span></div>
            </div>
          ))}
        </div>
        <Status />
        <TabBar />
      </div>
    );
  }

  // ─── Categoria con il piatto in evidenza ────────────────────────────────
  function Piatto({ me }) {
    const others = [
      { name: 'Osteria dell’Angelo', photo: A.penne, rating: '4.3', open: true, meta: '0.6 km · €€' },
      { name: 'Trattoria Lucia', photo: A.gente, rating: '4.8', open: true, meta: '0.8 km · €€' },
      { name: 'Da Enzo al 29', photo: A.cena, rating: '4.7', open: false, meta: '1.1 km · €€' },
      { name: 'La Gricia', photo: A.trattoria, rating: '4.4', open: true, meta: '1.3 km · €' },
    ].map((o) => (o.photo === me.photo ? Object.assign({}, o, { photo: A.salabuia }) : o));
    const Card = ({ v, tall, ad }) => (
      <div className={cx('ap-cc', tall && 'tall', ad && 'ad')}>
        <img src={v.photo} alt="" /><i className="sh" />
        {ad && <span className="ap-cc-sp">Sponsorizzato</span>}
        <span className="ap-cc-rt"><Ic.star s={11} />{v.rating}</span>
        <div className="txt"><b>{v.name}</b><span><i style={{ background: v.open ? '#3ddc7f' : '#ff6b6b' }} />{ad ? v.meta : (v.open ? 'Aperto' : 'Chiuso') + ' · ' + v.meta}</span></div>
      </div>
    );
    const mine = { name: me.title, photo: me.photo, rating: me.rating.toFixed(1), open: true, meta: `${me.name} · € 14` };
    return (
      <div className="ap ap-catscr">
        <i className="ap-blob" />
        <div className="ap-cat-head">
          <span className="ap-cback"><Ic.back c={INK} s={17} /></span>
          <div className="col"><b>Pasta <img src={A.icPasta} alt="" /></b><small>12 locali vicino a te</small></div>
        </div>
        <div className="ap-cat-chips"><span>Aperti ora</span><span>Più vicini</span><span>Top rated</span></div>
        <div className="ap-cat-grid">
          <div className="c"><Card v={mine} tall ad /><Card v={others[1]} /></div>
          <div className="c" style={{ marginTop: 26 }}><Card v={others[0]} /><Card v={others[2]} tall /></div>
        </div>
        <Status />
        <TabBar />
      </div>
    );
  }

  // ─── Vetrina del locale, con il piatto o l'evento in evidenza ───────────
  // Stessa struttura della vetrina dell'app (app/extras.jsx · VenueOriginal):
  // galleria, nome, logo a cavallo, stato, poi la scheda «In evidenza».
  const CHEF = [['Cacio e pepe', A.penne], ['Carbonara', A.carbonara], ['Tiramisù', A.tiramisu], ['Amatriciana', A.cena]];
  function Vetrina({ me, pick }) {
    const p = pick || { kind: 'piatto', title: 'Carbonara', price: 14, photo: A.carbonara, note: 'Il piatto più ordinato della settimana' };
    const chef = CHEF.filter(([n]) => n !== p.title).slice(0, 3);
    return (
      <div className="ap ap-vet">
        <div className="ap-vet-hero">
          <img src={A.sala} alt="" /><i />
          <span className="ap-vet-btn back"><Ic.back s={16} c={INK} /></span>
          <span className="ap-vet-btn heart"><svg {...sv(17)} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9-9.5C1.5 7.5 4 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 20 4 22.5 7.5 21 11.5c-2 5-9 9.5-9 9.5z" /></svg></span>
          <div className="ap-vet-name"><span>Cucina romana</span><b>{me.name}</b></div>
          <span className="ap-vet-logo">CP</span>
        </div>
        <div className="ap-vet-badges"><span className="open">APERTO</span><span className="rt"><Ic.star s={12} c={CORAL} />{me.rating.toFixed(1).replace('.', ',')} · 1.240 recensioni</span></div>
        <div className="ap-vet-addr"><Ic.pin s={13} />Via dei Giubbonari 27 · {me.distance}</div>
        <div className={cx('ap-vet-pin', 'ap-in', p.kind)} style={{ animationDelay: '.25s' }}>
          <div className="ph">
            <img src={p.photo} alt="" />
            {p.kind === 'evento' && p.date && <span className="dt"><small>{p.date.month}</small><b>{p.date.day}</b></span>}
          </div>
          <div className="tx">
            <span className="tag">In evidenza</span>
            <b>{p.title}</b>
            <span className="s">{p.kind === 'evento' ? p.when : p.note}</span>
            <span className="cta"><em>{p.kind === 'evento' ? 'Prenota' : 'Ordina'}</em>{p.price ? <strong>€ {p.price}</strong> : null}</span>
          </div>
        </div>
        <Section title="Chef consiglia" />
        <div className="ap-vet-chef">{chef.map(([n, src]) => <div key={n}><img src={src} alt="" /><b>{n}</b></div>)}</div>
        <div className="ap-vet-bar"><span className="m">Menu</span><span className="b">Prenota un tavolo</span></div>
        <Status light />
      </div>
    );
  }

  function Screen({ screen, c, venue }) {
    const me = meOf(c, venue);
    if (screen === 'push') return <Lock me={me} />;
    if (screen === 'ricerca') return <Dispo me={me} kind="ricerca" />;
    if (screen === 'perte') return <Dispo me={me} kind="perte" />;
    if (screen === 'digest') return <Digest me={me} />;
    if (screen === 'mappa') return <Mappa me={me} />;
    if (screen === 'piatto') return <Piatto me={me} />;
    if (screen === 'vetrina') return <Vetrina me={me} pick={c && c.pick} />;
    return <Home me={me} focus={screen === 'offerta' ? 'evidenza' : 'scoprire'} />;
  }

  const LABELS = { ricerca: '«Disponibili adesso», primo della lista', perte: '«Stasera per te»', offerta: 'home, sezione «In evidenza»', eventi: 'home, sezione «Da scoprire»', digest: 'la lista del digest di zona', push: 'la notifica di zona', mappa: 'la mappa', piatto: 'la categoria con il piatto in evidenza', vetrina: 'la tua vetrina, con quello che metti in evidenza' };
  function Phone({ screen = 'ricerca', creative, size, venue, label }) {
    return (
      <div className={cx('phone', size)} role="img" aria-label={label || `Anteprima nell’app byup: ${LABELS[screen] || ''}`}>
        <div className="phone-screen">
          <div className="ap-fit"><Screen key={screen} screen={screen} c={creative} venue={venue} /></div>
          <div className="phone-island" />
        </div>
      </div>
    );
  }
  // quale schermata per quale posizionamento
  Pano.screenFor = (type) => ({ ricerca: 'ricerca', evento: 'eventi', offerta: 'offerta', push: 'push', digest: 'digest', perte: 'perte', mappa: 'mappa', piatto: 'piatto', vetrina: 'vetrina' }[type] || 'ricerca');
  Pano.Phone = Phone;

  // Il telefono da vicino: lo schermo a grandezza vera (390 punti), tagliato
  // sulla finestra from → from + h (punti dello schermo). Si adatta alla larghezza
  // del contenitore senza superare «max».
  const XL = 412, PAD = 11;
  function PhoneCrop({ screen = 'push', creative, venue, from = 0, h = 400, fade = 'top', max = 1, label, className }) {
    const box = useRef(null);
    const [k, setK] = useState(max);
    useLayoutEffect(() => {
      const el = box.current;
      if (!el) return undefined;
      const fit = () => { const w = el.clientWidth; if (w) setK(Math.min(max, w / XL)); };
      fit();
      if (!window.ResizeObserver) return undefined;
      const ro = new ResizeObserver(fit);
      ro.observe(el);
      return () => ro.disconnect();
    }, [max]);
    return (
      <div ref={box} className={cx('phone-crop', fade && 'fade-' + fade, className)} style={{ height: Math.round(h * k) }} role="img" aria-label={label || `Anteprima nell’app byup: ${LABELS[screen] || ''}`}>
        <div className="phone-crop-in" style={{ transform: `translateY(${Math.round(-(from + PAD) * k)}px) scale(${k})` }}>
          <div className="phone xl">
            <div className="phone-screen">
              <div className="ap-fit"><Screen key={screen} screen={screen} c={creative} venue={venue} /></div>
              <div className="phone-island" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  Pano.PhoneCrop = PhoneCrop;
})();
