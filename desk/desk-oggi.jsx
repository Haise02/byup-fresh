// Desk — Oggi, la pagina d'ingresso (20 ottobre 2026)
//
// Si entra in Desk da qui. La pagina risponde a tre domande, nell'ordine in
// cui uno se le fa la mattina: come stiamo andando (i numeri in fila, il
// grafico dei ricavi), cosa devo seguire oggi (le schede colorate: le mie
// attività, le chiamate da fare, i locali fermi), e cosa succede nel team
// (Ambiente). In mezzo Byuppino, che ha già letto i dati e dice cosa ha
// notato: «Mostrami» porta dove serve, «Approfondisci» apre la chat.
//
// Tutti i numeri si leggono dalle STESSE fonti delle pagine che aprono —
// MRR_ORA, LOCALI, COMUNICAZIONI, RICHIAMATE, lo store di Ambiente — così
// Oggi non può dire un numero diverso da quello che si trova un clic dopo.

const { useState: useStateOg, useMemo: useMemoOg } = React;

const OG_FASI = [
  { id: 'registered', label: 'Iscritti',  colore: '#DCBAD7', ink: '#492844' },
  { id: 'onboarding', label: 'In avvio',  colore: '#E9C46A', ink: '#5A4512' },
  { id: 'active',     label: 'Attivi',    colore: '#492844', ink: '#fff' },
  { id: 'dormant',    label: 'Dormienti', colore: '#FF1F5A', ink: '#fff' },
  { id: 'churned',    label: 'Persi',     colore: '#1D1520', ink: '#fff' },
];

// Le tinte delle schede «da seguire»: piene, come le card di una trattativa.
const OG_TINTE = [
  { bg: '#1D1520', fg: '#fff', sub: 'rgba(255,255,255,0.62)', cerchio: 'rgba(255,255,255,0.12)' },
  { bg: '#FF1F5A', fg: '#fff', sub: 'rgba(255,255,255,0.78)', cerchio: 'rgba(255,255,255,0.18)' },
  { bg: '#492844', fg: '#fff', sub: 'rgba(255,255,255,0.66)', cerchio: 'rgba(255,255,255,0.14)' },
  { bg: '#DCBAD7', fg: '#2A1626', sub: 'rgba(42,22,38,0.62)',  cerchio: 'rgba(255,255,255,0.55)' },
  { bg: '#1D1520', fg: '#fff', sub: 'rgba(255,255,255,0.62)', cerchio: 'rgba(255,255,255,0.12)' },
  { bg: '#FFFFFF', fg: '#1D1520', sub: '#6E6470',             cerchio: '#F3EEF0' },
];

function ogSaluto() {
  const h = new Date().getHours();
  return h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera';
}
function ogOra(d) { return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); }
function ogQuando(d) {
  const oggi = new Date(); const dom = new Date(); dom.setDate(oggi.getDate() + 1);
  const stesso = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (d.getTime() < Date.now() && !stesso(d, oggi)) return 'Scaduta ' + d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  if (stesso(d, oggi)) return 'Oggi · ' + ogOra(d);
  if (stesso(d, dom)) return 'Domani · ' + ogOra(d);
  return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
}
const ogEuro = (n) => '€ ' + new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(Math.round(n));

// I numeri della giornata, letti dalle fonti delle pagine.
function ogNumeri() {
  const mesi = MONTHLY_REVENUE.map(m => ({ mese: m.mese, v: m.sub + m.extra }));
  const ora = mesi[mesi.length - 1].v, prima = mesi[mesi.length - 2].v;
  const attivi = LOCALI.filter(l => l.stato === 'active').length;
  const nuovi = LOCALI.filter(l => l.dataIscrizione && (Date.now() - new Date(l.dataIscrizione).getTime()) < 30 * 864e5).length;
  const ticket = COMUNICAZIONI.filter(c => c.stato === 'nuova' || c.stato === 'in_corso');
  const chiamate = RICHIAMATE.filter(r => r.stato === 'attesa').sort((a, b) => new Date(a.entro) - new Date(b.entro));
  return {
    mesi, mrr: MRR_ORA.totale, delta: prima ? (ora - prima) / prima * 100 : 0,
    attivi, iscritti: LOCALI.length, nuovi,
    ticket: ticket.length, ticketAlti: ticket.filter(c => c.priorita === 'alta').length,
    chiamate,
    dormienti: LOCALI.filter(l => l.stato === 'dormant'),
    fermi: LOCALI.filter(l => l.stato === 'onboarding' && l.stoppedAt),
  };
}

// ─── Un numero della fila in alto: bolla con l'icona, cifra, pillola ───────
function OgNumero({ icona, valore, pillola, tonoPillola, etichetta, onClick }) {
  const Icona = BuIcons[icona];
  const toni = {
    su:    { bg: '#1F5A43', fg: '#fff' },
    giu:   { bg: '#FF1F5A', fg: '#fff' },
    lilla: { bg: '#DCBAD7', fg: '#492844' },
    sabbia:{ bg: '#F1E3CF', fg: '#6A4B1F' },
  };
  const t = toni[tonoPillola] || toni.lilla;
  return (
    <button onClick={onClick} className="og-numero" style={{
      display: 'flex', alignItems: 'center', gap: 13, padding: '6px 18px 6px 6px', border: 'none', background: 'transparent',
      cursor: onClick ? 'pointer' : 'default', fontFamily: 'inherit', textAlign: 'left', borderRadius: 999, minWidth: 0,
    }}>
      <span style={{ width: 50, height: 50, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.86)', boxShadow: '0 10px 22px -14px rgba(73,40,68,0.55)', color: ADM.TEXT }}>
        <Icona size={21}/>
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.035em', color: ADM.TEXT, lineHeight: 1.05 }}>{valore}</span>
          {pillola && <span style={{ fontSize: 11.6, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: t.bg, color: t.fg, whiteSpace: 'nowrap' }}>{pillola}</span>}
        </span>
        <span style={{ display: 'block', fontSize: 12.8, fontWeight: 600, color: ADM.MUTED, marginTop: 3, whiteSpace: 'nowrap' }}>{etichetta}</span>
      </span>
    </button>
  );
}

// Il cerchio-pulsante degli angoli delle schede (↗, ⋯).
function OgCerchio({ icona = 'arrowUpRight', onClick, chiaro, title }) {
  const Icona = BuIcons[icona];
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} title={title} className="og-cerchio" style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', cursor: 'pointer',
      border: chiaro ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(73,40,68,0.12)',
      background: chiaro ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)', color: chiaro ? '#fff' : ADM.TEXT,
    }}><Icona size={16} strokeWidth={2}/></button>
  );
}

function OgScheda({ children, style, onClick, className }) {
  return (
    <div onClick={onClick} className={'desk-vetro' + (onClick ? ' hub-card' : '') + (className ? ' ' + className : '')} style={Object.assign({
      background: ADM.GLASS, border: `1px solid ${ADM.GLASS_BORDO}`, borderRadius: 26, padding: 22,
      boxShadow: ADM.CARD_SHADOW, minWidth: 0, position: 'relative',
    }, style || {})}>{children}</div>
  );
}

// ─── Il grafico dei ricavi: una curva morbida, la media tratteggiata ───────
function ogCurva(punti) {
  if (punti.length < 2) return '';
  let d = 'M' + punti[0][0] + ',' + punti[0][1];
  for (let i = 0; i < punti.length - 1; i++) {
    const p0 = punti[Math.max(0, i - 1)], p1 = punti[i], p2 = punti[i + 1], p3 = punti[Math.min(punti.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ' C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2[0] + ',' + p2[1];
  }
  return d;
}

function OgRicavi({ mesi, onApri }) {
  const [periodo, setPeriodo] = useStateOg(12);
  const [sopra, setSopra] = useStateOg(null);
  const serie = mesi.slice(-periodo);
  const W = 720, H = 210, PL = 44, PR = 12, PT = 14, PB = 28;
  const vmax = Math.max.apply(null, serie.map(m => m.v)), vmin = Math.min.apply(null, serie.map(m => m.v));
  const max = vmax + (vmax - vmin) * 0.35 + 50;
  const min = Math.max(0, Math.floor((vmin - (vmax - vmin) * 0.45 - 50) / 250) * 250);
  const x = (i) => PL + (serie.length === 1 ? 0 : i * (W - PL - PR) / (serie.length - 1));
  const y = (v) => PT + (1 - (v - min) / (max - min)) * (H - PT - PB);
  const punti = serie.map((m, i) => [Math.round(x(i) * 10) / 10, Math.round(y(m.v) * 10) / 10]);
  const linea = ogCurva(punti);
  const area = linea + ' L' + punti[punti.length - 1][0] + ',' + (H - PB) + ' L' + punti[0][0] + ',' + (H - PB) + ' Z';
  const media = serie.reduce((a, m) => a + m.v, 0) / serie.length;
  const totale = serie.reduce((a, m) => a + m.v, 0);
  const tacche = [0, 0.5, 1].map(f => Math.round((min + f * (max - min)) / 250) * 250);
  return (
    <OgScheda style={{ gridColumn: 'span 2', padding: '20px 22px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.02em', flex: 1 }}>Ricavi</div>
        <div style={{ display: 'inline-flex', padding: 4, borderRadius: 999, background: 'rgba(73,40,68,0.07)' }}>
          {[6, 12].map(p => (
            <button key={p} onClick={() => setPeriodo(p)} style={{
              padding: '6px 13px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.8, fontWeight: 700,
              background: periodo === p ? '#fff' : 'transparent', color: periodo === p ? ADM.TEXT : ADM.MUTED,
              boxShadow: periodo === p ? '0 4px 12px -6px rgba(73,40,68,0.4)' : 'none',
            }}>{p}M</button>
          ))}
        </div>
        <OgCerchio onClick={onApri} title="Apri Analisi"/>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
        <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.045em' }}>{ogEuro(totale)}</span>
        <span style={{ fontSize: 13.2, color: ADM.MUTED }}>negli ultimi {periodo} mesi · media <b style={{ color: ADM.TEXT }}>{ogEuro(media)}</b> al mese</span>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12.2, color: ADM.MUTED, fontWeight: 600 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: ADM.PINK }}/>Abbonamenti + ordini oltre piano</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, borderTop: '2px dashed ' + ADM.TEXT }}/>Media del periodo</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', marginTop: 6, overflow: 'visible' }} onMouseLeave={() => setSopra(null)}>
        <defs>
          <linearGradient id="ogArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF1F5A" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#FF1F5A" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {tacche.map(t => (
          <g key={t}>
            <line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} stroke="rgba(73,40,68,0.08)"/>
            <text x={PL - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#8D838F" fontWeight="600">{t >= 1000 ? '€' + (t / 1000).toFixed(2).replace(/0$/, '').replace('.', ',') + 'k' : '€' + t}</text>
          </g>
        ))}
        <line x1={PL} x2={W - PR} y1={y(media)} y2={y(media)} stroke="#1D1520" strokeWidth="1.6" strokeDasharray="6 6" opacity="0.75"/>
        <path d={area} fill="url(#ogArea)"/>
        <path d={linea} fill="none" stroke="#FF1F5A" strokeWidth="2.6" strokeLinecap="round"/>
        {serie.map((m, i) => (
          <g key={m.mese}>
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill={sopra === i ? '#1D1520' : '#8D838F'} fontWeight={sopra === i ? 800 : 600}>{m.mese.split(' ')[0]}</text>
            <rect x={x(i) - (W - PL - PR) / serie.length / 2} y={PT} width={(W - PL - PR) / serie.length} height={H - PT - PB} fill="transparent" onMouseEnter={() => setSopra(i)}/>
          </g>
        ))}
        {sopra != null && (
          <g pointerEvents="none">
            <line x1={x(sopra)} x2={x(sopra)} y1={PT} y2={H - PB} stroke="rgba(29,21,32,0.25)"/>
            <circle cx={x(sopra)} cy={y(serie[sopra].v)} r="5.5" fill="#fff" stroke="#FF1F5A" strokeWidth="2.6"/>
            <g transform={`translate(${Math.min(W - 120, Math.max(PL, x(sopra) - 56))}, ${Math.max(0, y(serie[sopra].v) - 46)})`}>
              <rect width="112" height="32" rx="16" fill="#1D1520"/>
              <text x="56" y="21" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff">{serie[sopra].mese} · {ogEuro(serie[sopra].v)}</text>
            </g>
          </g>
        )}
      </svg>
    </OgScheda>
  );
}

// ─── Byuppino ha notato ────────────────────────────────────────────────────
function OgByuppino({ n, onNav }) {
  const chiedi = (q) => window.byuppinoApri && window.byuppinoApri(q, true);
  const spunti = [
    n.dormienti.length > 0 && { t: `${n.dormienti.length} locali non ordinano da più di un mese`, s: n.dormienti.slice(0, 2).map(l => l.nome).join(', ') + (n.dormienti.length > 2 ? '…' : ''),
      mostra: () => onNav('contatti'), q: 'Quali locali rischiamo di perdere?' },
    n.fermi.length > 0 && { t: `${n.fermi.length} locali fermi a metà avvio`, s: 'Il più vecchio è ' + n.fermi[0].nome,
      mostra: () => onNav('locali', { openLocale: n.fermi[0] }), q: 'Quali locali sono fermi nell\'onboarding?' },
    n.chiamate.length > 0 && { t: `${n.chiamate.length} chiamate da fare`, s: 'La prima entro le ' + ogOra(new Date(n.chiamate[0].entro)) + ' · ' + n.chiamate[0].localeNome,
      mostra: () => onNav('assistenza', { tab: 'richiamate' }), q: 'Chi devo richiamare?' },
  ].filter(Boolean);
  return (
    <div style={{
      position: 'relative', borderRadius: 26, padding: '20px 20px 18px', minWidth: 0, overflow: 'hidden', color: '#fff',
      background: 'radial-gradient(120% 90% at 100% 0%, #6E3E66 0%, rgba(110,62,102,0) 55%), linear-gradient(160deg, #4A2945 0%, #2C1729 100%)',
      boxShadow: '0 30px 60px -30px rgba(42,22,38,0.8)',
    }}>
      <img src="byuppino.webp" alt="" className="og-byuppino" style={{ position: 'absolute', right: -14, top: -6, height: 150, pointerEvents: 'none', filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.35))' }}/>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 6px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', fontSize: 11.8, fontWeight: 700 }}>
        <BuIcons.sparkles size={13} strokeWidth={2}/> Byuppino ha letto i dati
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.12, marginTop: 12, maxWidth: 200 }}>Tre cose da guardare, oggi</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        {spunti.map((x, i) => (
          <div key={i} style={{ padding: '11px 12px', borderRadius: 18, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 13.6, fontWeight: 700, lineHeight: 1.3 }}>{x.t}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.s}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
              <button onClick={x.mostra} className="og-chip-scura" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 999, border: 'none', background: '#fff', color: '#2C1729', fontFamily: 'inherit', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                <BuIcons.eye size={13}/> Mostrami
              </button>
              <button onClick={() => chiedi(x.q)} className="og-chip-scura" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', background: 'transparent', color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <BuIcons.sparkles size={13}/> Approfondisci
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Una scheda «da seguire» ───────────────────────────────────────────────
function OgDaSeguire({ x, tinta, onClick }) {
  return (
    <div onClick={onClick} className="og-tessera" style={{
      background: tinta.bg, color: tinta.fg, borderRadius: 22, padding: '15px 15px 14px 17px', minHeight: 148,
      display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative',
      boxShadow: tinta.bg === '#FFFFFF' ? ADM.CARD_SHADOW : '0 18px 34px -22px rgba(29,21,32,0.7)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: tinta.sub, display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {x.caldo && <span style={{ width: 7, height: 7, borderRadius: '50%', background: tinta.bg === '#FF1F5A' ? '#fff' : '#FF4A6E', flexShrink: 0 }}/>}
          {x.quando}
        </span>
        <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', background: tinta.cerchio, flexShrink: 0 }}>
          {React.createElement(BuIcons[x.icona], { size: 15 })}
        </span>
      </div>
      <div style={{ fontSize: 15.6, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.22, marginTop: 9, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{x.titolo}</div>
      <div style={{ fontSize: 12.4, color: tinta.sub, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.sotto}</div>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 10 }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 19, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{x.valore}</span>
          <span style={{ display: 'block', fontSize: 11.6, color: tinta.sub, marginTop: 4 }}>{x.nota}</span>
        </span>
        {x.chi && typeof DkPila === 'function' && <DkPila ids={x.chi} size={24} max={3} bordo={tinta.bg}/>}
      </div>
    </div>
  );
}

function ogDaSeguire(n, onNav) {
  const s = typeof dkLeggi === 'function' ? dkLeggi() : { attivita: [] };
  const prio = { urgente: 'Urgente', alta: 'Alta', normale: 'Normale', bassa: 'Bassa' };
  const mie = s.attivita.filter(a => a.chi.includes('admin0') && a.stato !== 'fatto').sort((a, b) => a.scadenza - b.scadenza).slice(0, 3).map(a => ({
    id: a.id, icona: 'checkSquare', quando: ogQuando(a.scadenza), caldo: a.scadenza.getTime() < Date.now() + 864e5,
    titolo: a.titolo, sotto: '#' + ((s.canali || []).find(c => c.id === a.canale) || { nome: a.canale }).nome,
    valore: prio[a.priorita] || a.priorita, nota: (a.checklist || []).length ? (a.checklist.filter(c => c.ok).length + ' di ' + a.checklist.length + ' passi') : 'Attività ' + a.id,
    chi: a.chi, apri: () => { if (typeof dkApri === 'function') dkApri('attivita'); onNav('ambiente'); },
  }));
  const chiamate = n.chiamate.slice(0, 2).map(r => ({
    id: r.id, icona: 'phoneCall', quando: 'Richiamare entro le ' + ogOra(new Date(r.entro)), caldo: true,
    titolo: r.problema, sotto: r.localeNome + ' · ' + r.titolare,
    valore: r.tel, nota: (SRV_CATEGORIE[r.categoria] || { label: r.categoria }).label + ' · ' + ((PIANI.find(p => p.id === r.piano) || {}).label || ''),
    apri: () => onNav('assistenza', { tab: 'richiamate' }),
  }));
  const fermo = n.fermi.slice(0, 1).map(l => ({
    id: l.id, icona: 'store', quando: 'Avvio fermo', caldo: false,
    titolo: l.nome + ' si è fermato a metà configurazione', sotto: l.citta + ' · ' + l.titolare,
    valore: (l.completedSteps || []).length + ' passi fatti', nota: 'Piano ' + ((PIANI.find(p => p.id === l.piano) || {}).label || l.piano),
    apri: () => onNav('locali', { openLocale: l }),
  }));
  return mie.concat(chiamate).concat(fermo).slice(0, 6);
}

// ─── Locali per fase: i blocchi colorati ───────────────────────────────────
function OgFasi({ onNav }) {
  const conti = OG_FASI.map(f => Object.assign({}, f, { n: LOCALI.filter(l => l.stato === f.id).length }));
  const tot = conti.reduce((a, f) => a + f.n, 0);
  return (
    <OgScheda style={{ gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.02em', flex: 1 }}>Locali per fase</div>
        <OgCerchio onClick={() => onNav('contatti')} title="Apri Contatti"/>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
        <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.045em' }}>{tot}</span>
        <span style={{ fontSize: 13.2, color: ADM.MUTED }}>locali in rubrica · {Math.round(conti[2].n / tot * 100)}% attivi</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 16, height: 58 }}>
        {conti.filter(f => f.n > 0).map(f => (
          <div key={f.id} title={f.label + ': ' + f.n} style={{ flex: f.n, minWidth: 44, borderRadius: 16, background: f.colore, color: f.ink, display: 'flex', alignItems: 'flex-end', padding: '0 0 9px 12px', fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em' }}>{f.n}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
        {conti.map(f => (
          <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.8, fontWeight: 600, color: ADM.MUTED }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: f.colore, boxShadow: f.id === 'registered' ? 'inset 0 0 0 1px rgba(73,40,68,0.2)' : 'none' }}/>{f.label} <b style={{ color: ADM.TEXT }}>{f.n}</b>
          </span>
        ))}
      </div>
    </OgScheda>
  );
}

// ─── Il team adesso (Ambiente) ─────────────────────────────────────────────
function OgTeam({ onNav }) {
  if (typeof dkUsaStore === 'function') dkUsaStore();
  const r = typeof dkRiepilogo === 'function' ? dkRiepilogo() : { menzioni: 0, nonLetti: 0, live: null, mie: 0 };
  const online = typeof dkPersone === 'function' ? dkPersone().filter(p => !p.io && DK_PRESENZA_DI[p.id] !== 'assente').map(p => p.id) : [];
  const vai = (vista) => { if (typeof dkApri === 'function') dkApri(vista); onNav('ambiente'); };
  return (
    <div style={{
      borderRadius: 26, padding: 22, color: '#2A1626', minWidth: 0, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #E7CFE3 0%, #DCBAD7 100%)', boxShadow: '0 26px 50px -30px rgba(73,40,68,0.6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <BuIcons.ambienteFill size={20} color="#492844"/>
        <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: '-0.02em', flex: 1, color: '#492844' }}>Il team, adesso</div>
        <OgCerchio onClick={() => vai('oggi')} title="Apri Ambiente"/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        {typeof DkPila === 'function' && <DkPila ids={online} size={32} max={5} bordo="#E2C5DD"/>}
        <span style={{ fontSize: 13, fontWeight: 700, color: '#6E4C68' }}>{online.length} online</span>
      </div>
      {r.live ? (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 18, background: 'rgba(255,255,255,0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.8, fontWeight: 800, color: '#C40B45' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF1F5A', animation: 'dkLive 1.4s ease-in-out infinite' }}/>Riunione in corso
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 5, lineHeight: 1.25 }}>{r.live.titolo}</div>
          <button onClick={() => vai('riunioni')} style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', background: '#492844', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 13 }}>
            <BuIcons.video size={15}/> Entra
          </button>
        </div>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        <button onClick={() => vai('oggi')} style={{ textAlign: 'left', padding: '11px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.45)', fontFamily: 'inherit', color: '#2A1626' }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>@{r.menzioni}</div>
          <div style={{ fontSize: 11.8, fontWeight: 700, color: '#6E4C68' }}>menzioni · {r.nonLetti} da leggere</div>
        </button>
        <button onClick={() => vai('attivita')} style={{ textAlign: 'left', padding: '11px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.45)', fontFamily: 'inherit', color: '#2A1626' }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>{r.mie}</div>
          <div style={{ fontSize: 11.8, fontWeight: 700, color: '#6E4C68' }}>attività tue aperte</div>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
function DeskOggiPage({ onNav }) {
  if (typeof dkUsaStore === 'function') dkUsaStore();
  const n = useMemoOg(ogNumeri, []);
  const daSeguire = ogDaSeguire(n, onNav);
  const oggi = (() => { const t = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }); return t.charAt(0).toUpperCase() + t.slice(1); })();
  const pc = (v) => (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + '%';
  return (
    <div style={{ padding: '10px 28px 48px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <style>{OG_CSS}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.2, fontWeight: 700, color: ADM.MUTED }}>{oggi}</div>
          <div className="desk-titolo" style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1.0, marginTop: 6 }}>{ogSaluto()},<br/>Marco</div>
        </div>
        <button onClick={() => window.byuppinoApri && window.byuppinoApri()} className="og-chiedi" style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '6px 18px 6px 6px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.85)',
          background: 'rgba(255,255,255,0.72)', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 14px 30px -20px rgba(73,40,68,0.7)',
        }}>
          <img src="byuppino-viso.webp" alt="" style={{ width: 40, height: 40, borderRadius: '50%', background: '#EBD7E8' }}/>
          <span style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: ADM.TEXT }}>Chiedi a Byuppino</span>
            <span style={{ display: 'block', fontSize: 12, color: ADM.MUTED }}>«Quanti locali Business a Milano?»</span>
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <OgNumero icona="money" valore={ogEuro(n.mrr)} pillola={pc(n.delta) + ' sul mese'} tonoPillola={n.delta >= 0 ? 'su' : 'giu'} etichetta="Ricavo ricorrente del mese" onClick={() => onNav('dashboard')}/>
        <OgNumero icona="store" valore={n.attivi} pillola={'+' + n.nuovi + ' nuovi'} tonoPillola="lilla" etichetta={'Locali attivi, su ' + n.iscritti + ' in rubrica'} onClick={() => onNav('contatti')}/>
        <OgNumero icona="ticket" valore={n.ticket} pillola={n.ticketAlti + ' priorità alta'} tonoPillola={n.ticketAlti ? 'giu' : 'lilla'} etichetta="Ticket aperti" onClick={() => onNav('assistenza', { tab: 'ticket' })}/>
        <OgNumero icona="phoneCall" valore={n.chiamate.length} pillola={n.chiamate[0] ? 'entro le ' + ogOra(new Date(n.chiamate[0].entro)) : null} tonoPillola="sabbia" etichetta="Chiamate da fare" onClick={() => onNav('assistenza', { tab: 'richiamate' })}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, alignItems: 'start' }}>
        <OgRicavi mesi={n.mesi} onApri={() => onNav('dashboard')}/>
        <OgByuppino n={n} onNav={onNav}/>

        <OgScheda style={{ gridColumn: 'span 3', padding: '18px 18px 18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.02em', flex: 1 }}>Da seguire oggi</div>
            <span style={{ fontSize: 12.6, color: ADM.MUTED, fontWeight: 600 }}>le tue attività, le chiamate in coda, i locali fermi</span>
            <OgCerchio icona="plus" onClick={() => window.byuppinoApri && window.byuppinoApri('Crea un\'attività: ')} title="Nuova attività"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {daSeguire.map((x, i) => <OgDaSeguire key={x.id} x={x} tinta={OG_TINTE[i % OG_TINTE.length]} onClick={x.apri}/>)}
          </div>
        </OgScheda>

        <OgFasi onNav={onNav}/>
        <OgTeam onNav={onNav}/>
      </div>
    </div>
  );
}

const OG_CSS = `
.og-numero { transition: background 0.15s ease; }
.og-numero:hover { background: rgba(255,255,255,0.55) !important; }
.og-tessera { transition: transform 0.18s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.18s ease; }
.og-tessera:hover { transform: translateY(-3px); }
.og-tessera:active { transform: translateY(0) scale(0.99); }
.og-cerchio { transition: background 0.14s ease, transform 0.14s ease; }
.og-cerchio:hover { background: #fff !important; transform: rotate(-8deg); }
.og-chiedi { transition: transform 0.16s ease, background 0.16s ease; }
.og-chiedi:hover { background: #fff !important; transform: translateY(-1px); }
.og-chip-scura { transition: transform 0.12s ease, opacity 0.12s ease; }
.og-chip-scura:hover { transform: translateY(-1px); }
@keyframes ogGalleggia { 0%,100% { transform: translateY(0) rotate(-2deg) } 50% { transform: translateY(-5px) rotate(1deg) } }
.og-byuppino { animation: ogGalleggia 5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .og-byuppino { animation: none; } }
`;

window.DeskOggiPage = DeskOggiPage;
