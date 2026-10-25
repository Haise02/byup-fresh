// ═══════════════════════════════════════════════════════════════════════
// Panorama · UI — mattoncini condivisi
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = window.Pano;
  const { useState, useEffect, useRef, useLayoutEffect } = React;
  const { Icon, cx } = Pano;

  function Btn({ kind = 'secondary', size, icon, iconRight, children, className, block, ...rest }) {
    return (
      <button type="button" className={cx('btn', kind, size, block && 'block', className)} {...rest}>
        {icon && <Icon n={icon} />}
        {children}
        {iconRight && <Icon n={iconRight} />}
      </button>
    );
  }

  function IconBtn({ icon, label, size, flat, dot, className, ...rest }) {
    return (
      <button type="button" className={cx('p-iconbtn', size, flat && 'flat', className)} aria-label={label} title={label} {...rest}>
        <Icon n={icon} />
        {dot && <span className="dot" />}
      </button>
    );
  }

  function Pill({ tone, icon, size, children, className, dot, title }) {
    return (
      <span className={cx('pill', tone, size, className)} title={title}>
        {dot && <span className="dot" />}
        {icon && <Icon n={icon} />}
        {children}
      </span>
    );
  }

  // MVP / Fase 2 / Fase 3: dice a colpo d'occhio cosa esiste al lancio
  function Phase({ f = 'mvp', size = 'sm' }) {
    if (f === 'mvp') return <span className={cx('pill mvp', size)}>MVP</span>;
    if (f === 'f2') return <span className={cx('pill phase f2', size)} title="Arriva nella seconda fase">Fase 2</span>;
    return <span className={cx('pill phase f3', size)} title="Arriva nella terza fase">Fase 3</span>;
  }

  // Variazione: verde se migliora, rosso se peggiora (invert per i costi)
  function Delta({ v, invert, suffix = '%', digits = 0, label }) {
    const good = invert ? v < 0 : v > 0;
    const cls = Math.abs(v) < 0.05 ? 'flat' : good ? 'up' : 'down';
    const txt = (v > 0 ? '+' : v < 0 ? '−' : '') + (digits ? Pano.n1(Math.abs(v)) : Pano.n(Math.abs(v))) + suffix;
    return (
      <span className={cx('delta', cls)} aria-label={label || `variazione ${txt}`}>
        <Icon n={v >= 0 ? 'up' : 'down'} strokeWidth={2.4} />
        {txt}
      </span>
    );
  }

  function Seg({ options, value, onChange, ink, className, label }) {
    return (
      <div className={cx('seg', ink && 'ink', className)} role="tablist" aria-label={label}>
        {options.map((o) => (
          <button key={o.id} type="button" role="tab" aria-selected={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)} disabled={o.disabled} title={o.title}>
            {o.icon && <Icon n={o.icon} />}
            {o.label}
            {o.n != null && <span className="n">{o.n}</span>}
          </button>
        ))}
      </div>
    );
  }

  function Chips({ options, value, onChange, multi, className }) {
    const isOn = (id) => (multi ? (value || []).includes(id) : value === id);
    const toggle = (id) => {
      if (!multi) return onChange(id);
      const cur = value || [];
      onChange(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
    };
    return (
      <div className={cx('chips', className)}>
        {options.map((o) => (
          <button key={o.id} type="button" className={cx('chip', isOn(o.id) && 'on')} onClick={() => toggle(o.id)} disabled={o.disabled} aria-pressed={isOn(o.id)} title={o.title}>
            {o.icon && <Icon n={o.icon} />}
            {o.label}
            {o.sub && <small>{o.sub}</small>}
          </button>
        ))}
      </div>
    );
  }

  function Switch({ on, onChange, disabled, label, id }) {
    return (
      <button type="button" id={id} role="switch" aria-checked={!!on} aria-label={label} disabled={disabled} className={cx('switch', on && 'on')} onClick={() => onChange && onChange(!on)} />
    );
  }

  // Interruttore di una campagna, sempre presente nelle liste: accende e spegne
  // (attiva/programmata ↔ in pausa); negli altri stati è spento e dice perché.
  const PERCHE = {
    revisione: 'In revisione: si accende da sola quando byup la approva',
    correggere: 'Da correggere: sistemala e si accende dopo il controllo',
    bozza: 'Bozza: completala per accenderla',
    conclusa: 'Conclusa',
  };
  function CampToggle({ c, withLabel, stacked }) {
    const can = c.status === 'attiva' || c.status === 'pausa' || c.status === 'programmata';
    const on = c.status === 'attiva' || c.status === 'programmata';
    const tip = can ? (on ? 'Metti in pausa' : 'Riattiva') : PERCHE[c.status] || '';
    const lbl = withLabel && <span className="ct-lbl">{on ? 'Accesa' : can ? 'In pausa' : 'Spenta'}</span>;
    return (
      <span className={cx('camp-toggle', !can && 'off', stacked && 'stacked')} title={tip} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        {!stacked && lbl}
        <Switch on={on} disabled={!can} onChange={() => Pano.act.toggleCampaign(c.id)} label={`${c.name}: ${tip}`} />
        {stacked && lbl}
      </span>
    );
  }

  // Budget di una campagna: l'anello (come quello del wallet in alto) e, accanto,
  // quanto è stato speso e su quanto. Sopra il 90% l'anello diventa arancio.
  function BudgetRing({ spent, cap, size = 34 }) {
    if (!cap) return <span className="t-small">—</span>;
    const v = Math.min(1, Math.max(0, spent / cap));
    const sw = 4.5, r = (size - sw) / 2, c = 2 * Math.PI * r, m = size / 2;
    return (
      <span className={cx('bring', v > 0.9 && 'hi')} role="img" aria-label={`Spesi ${Pano.eur(spent, false)} di ${Pano.eur(cap, false)}`}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle className="trk" cx={m} cy={m} r={r} strokeWidth={sw} fill="none" />
          {v > 0.004 && <circle className="arc" cx={m} cy={m} r={r} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={`${c * v} ${c}`} transform={`rotate(-90 ${m} ${m})`} />}
        </svg>
        <span className="bring-t"><b className="num">{Pano.eur(spent, false)}</b><small>di {Pano.eur(cap, false)}</small></span>
      </span>
    );
  }

  function Range({ min, max, step = 1, value, onChange, id, label }) {
    const p = ((value - min) / (max - min)) * 100;
    return (
      <input id={id} aria-label={label} className="range" type="range" min={min} max={max} step={step} value={value}
        style={{ '--p': p + '%' }} onChange={(e) => onChange(Number(e.target.value))} />
    );
  }

  function Meter({ v, tone, thin, ticks, label }) {
    return (
      <div className={cx('meter', tone, thin && 'thin')} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} aria-label={label}>
        <i style={{ width: Pano.clamp(v, 0, 1) * 100 + '%' }} />
        {(ticks || []).map((t) => <span key={t} className="tick" style={{ left: t * 100 + '%' }} />)}
      </div>
    );
  }

  // Numero grande «€ 1.940,50» con decimali piccoli
  // Numeri che salgono all'apertura (widget di analisi «vivi»)
  function useCountUp(target, on, dur = 900) {
    const [val, setVal] = useState(on ? 0 : target);
    const from = useRef(on ? 0 : target);
    useEffect(() => {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!on || reduce) { setVal(target); from.current = target; return undefined; }
      const a = from.current, t0 = performance.now();
      let raf = 0;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        setVal(a + (target - a) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) raf = requestAnimationFrame(step); else from.current = target;
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [target, on]);
    return val;
  }
  Pano.useCountUp = useCountUp;

  function Money({ v: target, size, cur = true, dec, className, count }) {
    const v = useCountUp(target, !!count);
    const showDec = dec === undefined ? Math.abs(target % 1) > 0.004 : dec;
    const parts = Pano.splitMoney(v);
    return (
      <span className={cx('big', size, className)}>
        {cur && <span className="cur">€</span>}
        <span>{showDec ? parts.int : Pano.n(v)}</span>
        {showDec && <span className="dec">{parts.dec}</span>}
      </span>
    );
  }
  function BigNum({ v: target, size, suffix, className, digits, count }) {
    const v = useCountUp(target, !!count);
    return (
      <span className={cx('big', size, className)}>
        <span>{digits ? Pano.n1(v) : Pano.n(v)}</span>
        {suffix && <span className="dec">{suffix}</span>}
      </span>
    );
  }

  function Card({ title, icon, sub, actions, children, className, tight, flush, style, as, id }) {
    const Tag = as || 'section';
    return (
      <Tag className={cx('card', tight && 'tight', flush && 'flush', className)} style={style} id={id}>
        {(title || actions) && (
          <div className="card-head">
            <div className="ttl">
              {icon && <span className="ico"><Icon n={icon} /></span>}
              <div className="col" style={{ gap: 2 }}>
                {title && <h3 className="t-h3">{title}</h3>}
                {sub && <p className="t-small">{sub}</p>}
              </div>
            </div>
            {actions && <div className="row" style={{ gap: 8 }}>{actions}</div>}
          </div>
        )}
        {children}
      </Tag>
    );
  }

  function Note({ tone, icon, children, className, style }) {
    const ic = icon || (tone === 'good' ? 'checkCircle' : tone === 'warn' ? 'alert' : tone === 'bad' ? 'alertCircle' : 'info');
    return (
      <div className={cx('note', tone, className)} style={style} role={tone === 'bad' ? 'alert' : undefined}>
        <Icon n={ic} />
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    );
  }

  function Empty({ icon = 'inbox', title, text, action }) {
    return (
      <div className="empty">
        <span className="em-ico"><Icon n={icon} /></span>
        <h4>{title}</h4>
        {text && <p className="t-small" style={{ maxWidth: 340 }}>{text}</p>}
        {action}
      </div>
    );
  }

  function Thumb({ img, bg, size, alt = '' }) {
    return (
      <span className={cx('thumb', size)} style={bg ? { background: bg } : undefined}>
        {img && <img src={img} alt={alt} loading="lazy" />}
      </span>
    );
  }

  // Stati della campagna: forma + colore + parola
  const STATI = {
    attiva: { label: 'Attiva', tone: 'good', icon: 'play' },
    revisione: { label: 'In revisione', tone: 'warn', icon: 'hourglass' },
    correggere: { label: 'Da correggere', tone: 'bad', icon: 'alertCircle' },
    programmata: { label: 'Programmata', tone: 'info', icon: 'calendar' },
    pausa: { label: 'In pausa', tone: '', icon: 'pause' },
    conclusa: { label: 'Conclusa', tone: '', icon: 'check' },
    bozza: { label: 'Bozza', tone: 'phase', icon: 'edit' },
    sospesa: { label: 'Sospesa da byup', tone: 'bad', icon: 'ban' },
  };
  Pano.STATI = STATI;
  function StatusPill({ s, size = 'sm' }) {
    const m = STATI[s] || STATI.bozza;
    return <Pill tone={m.tone} icon={m.icon} size={size}>{m.label}</Pill>;
  }

  // Anello del wallet nella barra in alto
  function Ring({ v, size = 32, stroke = 4, track = 'var(--paper-2)', color }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    return (
      <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id="ringIride" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F8A6F1" /><stop offset="0.5" stopColor="#B9A5F6" /><stop offset="1" stopColor="#8F99F0" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || 'url(#ringIride)'} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${c * Pano.clamp(v, 0, 1)} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
    );
  }

  // ─── Strati ─────────────────────────────────────────────────────────────
  function useLockScroll(active) {
    useEffect(() => {
      if (!active) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [active]);
  }

  function Drawer({ onClose, title, sub, head, children, foot, wide, label }) {
    useLockScroll(true);
    Pano.useEscape(onClose, true);
    const ref = useRef(null);
    useEffect(() => { ref.current && ref.current.focus(); }, []);
    return (
      <>
        <div className="scrim" onClick={onClose} />
        <aside className={cx('drawer', wide && 'wide')} role="dialog" aria-modal="true" aria-label={label || (typeof title === 'string' ? title : 'Dettaglio')} tabIndex={-1} ref={ref}>
          <div className="drawer-head">
            {head || (
              <div className="col" style={{ gap: 2, minWidth: 0 }}>
                <h2 className="t-title" style={{ fontSize: 19 }}>{title}</h2>
                {sub && <p className="t-small">{sub}</p>}
              </div>
            )}
            <IconBtn icon="x" label="Chiudi" size="sm" className="x-btn" onClick={onClose} />
          </div>
          <div className="drawer-body">{children}</div>
          {foot && <div className="drawer-foot">{foot}</div>}
        </aside>
      </>
    );
  }

  function Modal({ onClose, title, sub, icon, children, foot, size, label, noClose }) {
    useLockScroll(true);
    Pano.useEscape(onClose, !noClose);
    const ref = useRef(null);
    useEffect(() => { ref.current && ref.current.focus(); }, []);
    return (
      <>
        <div className="scrim" onClick={noClose ? undefined : onClose} />
        <div className="modal-wrap" onClick={(e) => { if (e.target === e.currentTarget && !noClose) onClose(); }}>
          <div className={cx('modal', size)} role="dialog" aria-modal="true" aria-label={label || (typeof title === 'string' ? title : 'Finestra')} tabIndex={-1} ref={ref}>
            {(title || !noClose) && (
              <div className="modal-head">
                {icon && <span className="card-head" style={{ margin: 0 }}><span className="ico" style={{ width: 44, height: 44, borderRadius: 16, background: 'var(--iride-tint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px var(--line)' }}><Icon n={icon} size={20} /></span></span>}
                <div className="col" style={{ gap: 4, minWidth: 0, flex: 1 }}>
                  {title && <h2 className="t-title">{title}</h2>}
                  {sub && <p className="t-small" style={{ fontSize: 13.5 }}>{sub}</p>}
                </div>
                {!noClose && <IconBtn icon="x" label="Chiudi" size="sm" onClick={onClose} />}
              </div>
            )}
            <div className="modal-body">{children}</div>
            {foot && <div className="modal-foot">{foot}</div>}
          </div>
        </div>
      </>
    );
  }

  // Menu a comparsa ancorato a un bottone
  function Popover({ open, onClose, children, align = 'right', width, style }) {
    const ref = useRef(null);
    Pano.useOutside(ref, () => onClose && onClose(), open);
    if (!open) return null;
    return (
      <div ref={ref} className="popover" style={Object.assign({ top: 'calc(100% + 8px)', [align]: 0, width }, style)} role="menu">
        {children}
      </div>
    );
  }

  function Toasts() {
    const toasts = Pano.useStore((s) => s.toasts || []);
    return (
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <Icon n={t.icon} className="ok" />
            <span>{t.text}</span>
            {t.undo ? (
              <button type="button" onClick={() => { t.undo(); Pano.store.set((s) => ({ toasts: s.toasts.filter((x) => x.id !== t.id) })); }}>Annulla</button>
            ) : <span style={{ width: 6 }} />}
          </div>
        ))}
      </div>
    );
  }

  // Suggerimento al passaggio (icone «i»)
  function Hint({ text, children }) {
    const [o, setO] = useState(false);
    return (
      <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setO(true)} onMouseLeave={() => setO(false)} onFocus={() => setO(true)} onBlur={() => setO(false)}>
        {children || <button type="button" aria-label={text} style={{ display: 'inline-flex', color: 'var(--muted)' }}><Icon n="info" size={15} /></button>}
        {o && <span className="tip" style={{ left: '50%', top: 0, whiteSpace: 'normal', width: 240, fontWeight: 500, lineHeight: 1.45 }}>{text}</span>}
      </span>
    );
  }

  function Avatar({ name, size = 34, img, bg }) {
    const ini = (name || '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    return (
      <span className={!bg && !img ? 'av-ring' : undefined} style={{ width: size, height: size, borderRadius: 999, background: bg || undefined, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 800, color: bg ? '#2B2340' : 'var(--ink)', flexShrink: 0, overflow: img ? 'hidden' : undefined }}>
        {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ini}
      </span>
    );
  }

  function ByuppinoFace({ size = 40, ring }) {
    return (
      <span style={{ width: size, height: size, borderRadius: 999, overflow: 'hidden', flexShrink: 0, display: 'inline-flex', boxShadow: ring ? '0 0 0 2px var(--card), 0 0 0 3.5px #C9A8F5' : undefined, background: 'linear-gradient(135deg,#9FD0F7,#E9A6F1,#8E93F2)' }}>
        <img src={Pano.IMG.byuppinoViso} alt="Byuppino" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </span>
    );
  }

  // Riga «etichetta → valore»
  function KV({ k, v, strong }) {
    return (
      <div className="row between" style={{ fontSize: 13.5, gap: 16 }}>
        <span className="t-muted" style={{ fontWeight: 600 }}>{k}</span>
        <span className={cx('num', strong && 't-strong')} style={{ fontWeight: strong ? 800 : 700, textAlign: 'right' }}>{v}</span>
      </div>
    );
  }

  Object.assign(Pano, {
    BudgetRing,
    Btn, IconBtn, Pill, Phase, Delta, Seg, Chips, Switch, CampToggle, Range, Meter, Money, BigNum, Card, Note, Empty, Thumb,
    StatusPill, Ring, Drawer, Modal, Popover, Toasts, Hint, Avatar, ByuppinoFace, KV,
  });
})();
