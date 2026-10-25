// ═══════════════════════════════════════════════════════════════════════
// Panorama · grafici (SVG a mano). Regole: barre ≤ 24 px con punta tonda
// da 4 px, griglia sottile continua, un solo asse, legenda dalle 2 serie
// in su, testo nei colori del testo, tooltip al passaggio e al focus.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useRef, useLayoutEffect, useEffect } = React;
  const { cx } = Pano;

  // Misura la larghezza del contenitore (i grafici disegnano a misura)
  function useWidth(ref, fallback = 600) {
    const [w, setW] = useState(fallback);
    useLayoutEffect(() => {
      if (!ref.current) return;
      const el = ref.current;
      const set = () => setW(Math.max(200, el.clientWidth));
      set();
      const ro = new ResizeObserver(set);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);
    return w;
  }
  Pano.useWidth = useWidth;
  // Altezza del contenitore, per i grafici che riempiono la card (niente spazio vuoto sotto)
  function useHeight(ref, on, fallback) {
    const [h, setH] = useState(fallback);
    useLayoutEffect(() => {
      if (!on || !ref.current) return;
      const el = ref.current;
      const set = () => setH(Math.max(fallback, Math.floor(el.clientHeight)));
      set();
      const ro = new ResizeObserver(set);
      ro.observe(el);
      return () => ro.disconnect();
    }, [on]);
    return on ? h : fallback;
  }

  function niceMax(v, steps = 4) {
    if (v <= 0) return 1;
    const raw = v / steps;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
    return step * steps;
  }
  // Barra con punta arrotondata (4 px) e base quadrata
  function barPath(x, y, w, h, r = 4) {
    if (h <= 0) return '';
    const rr = Math.min(r, w / 2, h);
    return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
  }
  Pano.barPath = barPath;

  function Tip({ x, y, title, rows, show }) {
    if (!show) return null;
    return (
      <div className="tip" style={{ left: x, top: y }}>
        {title && <div className="tt">{title}</div>}
        {rows.map((r, i) => (
          <div className="tr" key={i}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{r.color && <i className="key" style={{ background: r.color, opacity: r.dim ? 0.6 : 1 }} />}{r.label}</span>
            <b>{r.value}</b>
          </div>
        ))}
      </div>
    );
  }
  Pano.Tip = Tip;

  // ─── Settimana: questa vs scorsa (colonne affiancate) ───────────────────
  // «fill»: il grafico prende tutta l'altezza libera della card. Le barre salgono
  // all'apertura (una dopo l'altra); oggi resta vivo: la stima tratteggiata scorre
  // e un punto pulsa in cima a quanto incassato fin qui.
  function WeekChart({ cur, prev, height = 230, money = true, fill }) {
    const ref = useRef(null);
    const W = useWidth(ref);
    const H = useHeight(ref, !!fill, height);
    const [hi, setHi] = useState(-1);
    const padL = 46, padR = 8, padT = 14, padB = 30;
    const vals = cur.map((d) => Math.max(d.revenue, d.forecast || 0)).concat(prev.map((d) => d.revenue));
    const max = niceMax(Math.max(...vals) * 1.05);
    const iw = W - padL - padR, ih = H - padT - padB;
    const band = iw / cur.length;
    const bw = Math.min(22, (band - 14) / 2);
    const y = (v) => padT + ih - (v / max) * ih;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * max);
    const fmt = (v) => (money ? Pano.eur(v, false) : Pano.n(v));
    const uid = useRef('h' + Math.random().toString(36).slice(2, 8)).current;
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return (
      <div className={cx('chart', fill && 'chart-fill')} ref={ref} onMouseLeave={() => setHi(-1)}>
        <svg viewBox={`0 0 ${W} ${H}`} height={H} role="img" aria-label="Incasso generato per giorno, questa settimana e la settimana scorsa">
          <defs>
            <pattern id={uid} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
              <rect width="6" height="6" fill="var(--s1-wash)" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--s1)" strokeWidth="2" opacity="0.55" />
              {!still && <animate attributeName="x" from="0" to="6" dur="1.4s" repeatCount="indefinite" />}
            </pattern>
          </defs>
          {ticks.map((t, i) => (
            <g key={i}>
              <line className={i === 0 ? 'base' : 'gl'} x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />
              <text className="ax" x={padL - 8} y={y(t) + 4} textAnchor="end">{Pano.compact(t)}</text>
            </g>
          ))}
          <g className={cx('grow', hi >= 0 && 'dim')}>
            {cur.map((d, i) => {
              const x0 = padL + band * i + (band - (bw * 2 + 2)) / 2;
              const p = prev[i];
              const fc = d.forecast && !d.future ? d.forecast : null;
              return (
                <g key={i} style={{ '--i': i }}>
                  <path className={cx('bar', hi === i && 'hot')} d={barPath(x0, y(p.revenue), bw, y(0) - y(p.revenue))} fill="var(--s0)" />
                  {d.future ? (
                    <path className={cx('bar', hi === i && 'hot')} d={barPath(x0 + bw + 2, y(d.forecast), bw, y(0) - y(d.forecast))} fill={`url(#${uid})`} />
                  ) : (
                    <>
                      {fc && <path className={cx('bar', hi === i && 'hot')} d={barPath(x0 + bw + 2, y(fc), bw, y(d.revenue) - y(fc))} fill={`url(#${uid})`} />}
                      <path className={cx('bar', hi === i && 'hot')} d={fc ? `M${x0 + bw + 2},${y(0)}V${y(d.revenue)}H${x0 + bw * 2 + 2}V${y(0)}Z` : barPath(x0 + bw + 2, y(d.revenue), bw, y(0) - y(d.revenue))} fill="var(--s1)" />
                    </>
                  )}
                  {d.partial && <circle className="live-pt" cx={x0 + bw * 1.5 + 2} cy={y(d.revenue)} r="4" />}
                  <text className={cx('ax', d.partial && 'now')} x={padL + band * i + band / 2} y={H - 8} textAnchor="middle">{d.partial ? 'oggi' : Pano.GG[d.d.getDay()]}</text>
                  <rect className="hit" x={padL + band * i} y={padT} width={band} height={ih} tabIndex={0}
                    aria-label={`${Pano.fmtDayLong(d.d)}: ${fmt(d.future ? 0 : d.revenue)} questa settimana, ${fmt(p.revenue)} la scorsa`}
                    onMouseEnter={() => setHi(i)} onFocus={() => setHi(i)} onBlur={() => setHi(-1)} />
                </g>
              );
            })}
          </g>
        </svg>
        {hi >= 0 && (() => {
          const d = cur[hi], p = prev[hi];
          const rows = d.future
            ? [{ label: 'Previsione', value: fmt(d.forecast), color: 'var(--s1)', dim: true }, { label: 'Settimana scorsa', value: fmt(p.revenue), color: 'var(--s0)' }]
            : [{ label: d.partial ? 'Fin qui' : 'Questa settimana', value: fmt(d.revenue), color: 'var(--s1)' }].concat(d.partial ? [{ label: 'A fine giornata (stima)', value: fmt(d.forecast), color: 'var(--s1)', dim: true }] : []).concat([{ label: 'Settimana scorsa', value: fmt(p.revenue), color: 'var(--s0)' }]);
          return <Tip show x={padL + band * hi + band / 2} y={y(Math.max(d.revenue, d.forecast || 0, p.revenue))} title={Pano.cap(Pano.fmtDayLong(d.d))} rows={rows} />;
        })()}
      </div>
    );
  }

  // ─── Incasso e spesa per giorno (30 giorni) ─────────────────────────────
  function DailyChart({ days, height = 240 }) {
    const ref = useRef(null);
    const W = useWidth(ref, 800);
    const [hi, setHi] = useState(-1);
    const padL = 46, padR = 8, padT = 12, padB = 30;
    const H = height, iw = W - padL - padR, ih = H - padT - padB;
    const max = niceMax(Math.max(...days.map((d) => Math.max(d.revenue, d.partial ? d.full.revenue : 0))) * 1.05);
    const band = iw / days.length;
    const bw = Math.max(3, Math.min(12, (band - 4) / 2));
    const y = (v) => padT + ih - (v / max) * ih;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * max);
    return (
      <div className="chart" ref={ref} onMouseLeave={() => setHi(-1)}>
        <svg viewBox={`0 0 ${W} ${H}`} height={H} role="img" aria-label="Incasso generato e spesa per giorno, ultimi 30 giorni">
          {ticks.map((t, i) => (
            <g key={i}>
              <line className={i === 0 ? 'base' : 'gl'} x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />
              <text className="ax" x={padL - 8} y={y(t) + 4} textAnchor="end">{Pano.compact(t)}</text>
            </g>
          ))}
          {hi >= 0 && <line x1={padL + band * hi + band / 2} x2={padL + band * hi + band / 2} y1={padT} y2={y(0)} stroke="var(--line-3)" strokeWidth="1" />}
          <g className={hi >= 0 ? 'dim' : ''}>
            {days.map((d, i) => {
              const x0 = padL + band * i + (band - (bw * 2 + 2)) / 2;
              return (
                <g key={i}>
                  <path className={cx('bar', hi === i && 'hot')} d={barPath(x0, y(d.revenue), bw, y(0) - y(d.revenue), Math.min(4, bw / 2))} fill="var(--s1)" />
                  <path className={cx('bar', hi === i && 'hot')} d={barPath(x0 + bw + 2, y(d.spent), bw, y(0) - y(d.spent), Math.min(4, bw / 2))} fill="var(--s2)" />
                  {(i % (days.length > 20 ? 5 : 1) === 0 || d.partial) && <text className={cx('ax', d.partial && 'now')} x={padL + band * i + band / 2} y={H - 8} textAnchor="middle">{d.partial ? 'oggi' : `${d.d.getDate()} ${Pano.MM[d.d.getMonth()]}`}</text>}
                  <rect className="hit" x={padL + band * i} y={padT} width={band} height={ih} tabIndex={0}
                    aria-label={`${Pano.fmtDayLong(d.d)}: incasso ${Pano.eur(d.revenue, false)}, speso ${Pano.eur(d.spent, true)}`}
                    onMouseEnter={() => setHi(i)} onFocus={() => setHi(i)} onBlur={() => setHi(-1)} />
                </g>
              );
            })}
          </g>
        </svg>
        {hi >= 0 && (() => {
          const d = days[hi];
          return <Tip show x={padL + band * hi + band / 2} y={y(d.revenue)} title={Pano.cap(Pano.fmtDayLong(d.d)) + (d.partial ? ' · fin qui' : '')}
            rows={[{ label: 'Incassato', value: Pano.eur(d.revenue, false), color: 'var(--s1)' }, { label: 'Speso', value: Pano.eur(d.spent, true), color: 'var(--s2)' }, { label: 'ROAS', value: Pano.roas(d.revenue / Math.max(0.01, d.spent)) }]} />;
        })()}
      </div>
    );
  }

  // ─── Sparkline per i riquadri numerici ──────────────────────────────────
  // «live»: la linea si disegna all'apertura e l'ultimo punto (oggi) pulsa sempre.
  function Spark({ data, height = 44, color = 'var(--s1)', label, live, fill }) {
    const ref = useRef(null);
    const W = useWidth(ref, 160);
    const H = useHeight(ref, !!fill, height), pad = 6;
    const max = Math.max(...data), min = Math.min(...data);
    const x = (i) => pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = (v) => pad + (H - pad * 2) * (1 - (v - min) / Math.max(1e-6, max - min));
    const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    const area = line + `L${x(data.length - 1)},${H}L${x(0)},${H}Z`;
    const lx = x(data.length - 1), ly = y(data[data.length - 1]);
    return (
      <div className={cx('chart', 'spark', live && 'live', fill && 'chart-fill')} ref={ref} style={fill ? undefined : { height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} height={H} role="img" aria-label={label}>
          <path className="sp-area" d={area} fill={color} opacity="0.1" />
          <path className="sp-line" d={line} pathLength="1" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {live && <circle className="sp-halo" cx={lx} cy={ly} r="9" fill={color} />}
          <circle className="sp-pt" cx={lx} cy={ly} r="4" fill={color} stroke="var(--card)" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // ─── Imbuto: raggiunti → tocchi → prenotazioni → coperti ────────────────
  function Funnel({ steps }) {
    const max = steps[0].v;
    const ramp = ['var(--s1)', 'color-mix(in srgb, var(--s1) 80%, var(--card))', 'color-mix(in srgb, var(--s1) 62%, var(--card))', 'color-mix(in srgb, var(--s1) 46%, var(--card))'];
    return (
      <div className="col" style={{ gap: 12 }} role="list" aria-label="Imbuto dei risultati">
        {steps.map((s, i) => {
          const w = Math.max(0.035, Math.sqrt(s.v / max));
          const conv = i ? (s.v / steps[i - 1].v) * 100 : null;
          return (
            <div key={s.k} role="listitem" style={{ display: 'grid', gridTemplateColumns: 'minmax(96px, 150px) 1fr auto', gap: 14, alignItems: 'center' }}>
              <div className="col" style={{ gap: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{s.k}</span>
                {s.note ? <span className="t-small">{s.note}</span> : conv != null && <span className="t-small">{Pano.pct(conv, conv < 10 ? 1 : 0)} del passo prima</span>}
              </div>
              <div style={{ height: 30, borderRadius: 10, background: 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: '0 auto 0 0', width: w * 100 + '%', background: ramp[i] || ramp[3], borderRadius: 10 }} />
              </div>
              <span className="num" style={{ fontSize: 15, fontWeight: 800, minWidth: 64, textAlign: 'right' }}>{s.fmt ? s.fmt(s.v) : Pano.n(s.v)}</span>
            </div>
          );
        })}
        <p className="t-small">Larghezze in scala di radice quadrata, per vedere anche i passi piccoli.</p>
      </div>
    );
  }

  // ─── Mappa di calore: quando rendi di più ───────────────────────────────
  function Heatmap({ rows, cols, values, fmt, label }) {
    const [hi, setHi] = useState(null);
    const flat = values.flat();
    const max = Math.max(...flat), min = Math.min(...flat);
    const steps = ['var(--s1-soft)', 'color-mix(in srgb, var(--s1) 22%, var(--card))', 'color-mix(in srgb, var(--s1) 40%, var(--card))', 'color-mix(in srgb, var(--s1) 62%, var(--card))', 'color-mix(in srgb, var(--s1) 82%, var(--card))', 'var(--s1)'];
    const col = (v) => steps[Math.min(steps.length - 1, Math.floor(((v - min) / Math.max(1e-6, max - min)) * (steps.length - 0.01)))];
    const dark = (v) => (v - min) / Math.max(1e-6, max - min) > 0.62;
    return (
      <div className="col" style={{ gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `86px repeat(${cols.length}, minmax(0,1fr))`, gap: 6, position: 'relative' }} role="table" aria-label={label}>
          <span />
          {cols.map((c) => <span key={c} className="t-micro" style={{ textAlign: 'center' }} role="columnheader">{c}</span>)}
          {rows.map((r, i) => (
            <React.Fragment key={r}>
              <span style={{ fontSize: 12.5, fontWeight: 700, alignSelf: 'center' }} role="rowheader">{r}</span>
              {cols.map((c, j) => {
                const v = values[i][j];
                return (
                  <button key={c} type="button" className="hm-cell" role="cell" aria-label={`${r}, ${c}: ${fmt(v)}`}
                    onMouseEnter={() => setHi([i, j])} onMouseLeave={() => setHi(null)} onFocus={() => setHi([i, j])} onBlur={() => setHi(null)}
                    style={{ height: 38, borderRadius: 10, background: col(v), color: dark(v) ? '#fff' : 'var(--ink-2)', fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums', boxShadow: hi && hi[0] === i && hi[1] === j ? 'inset 0 0 0 2px var(--ink)' : 'none' }}>
                    {fmt(v)}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
          <span className="t-small">meno</span>
          {steps.map((s, i) => <i key={i} style={{ width: 22, height: 10, borderRadius: 3, background: s, display: 'inline-block' }} />)}
          <span className="t-small">di più</span>
        </div>
      </div>
    );
  }

  // ─── Barre orizzontali (una serie, etichetta in punta) ──────────────────
  function HBars({ items, fmt, color = 'var(--s1)' }) {
    const max = Math.max(...items.map((i) => i.v));
    return (
      <div className="col" style={{ gap: 12 }}>
        {items.map((it) => (
          <div key={it.k} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px, 128px) 1fr auto', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>{it.icon && <Pano.Icon n={it.icon} size={15} />}{it.k}</span>
            <div style={{ height: 12, borderRadius: 99, background: 'var(--paper-2)', overflow: 'hidden' }}>
              <div style={{ width: (it.v / max) * 100 + '%', height: '100%', borderRadius: 99, background: color }} />
            </div>
            <span className="num" style={{ fontSize: 13, fontWeight: 800, minWidth: 58, textAlign: 'right' }}>{fmt(it.v)}</span>
          </div>
        ))}
      </div>
    );
  }

  Object.assign(Pano, { WeekChart, DailyChart, Spark, Funnel, Heatmap, HBars, niceMax });
})();
