// Hubble — i pezzi condivisi: modale, pannello laterale, filtri, colonne,
// testate di pagina, riquadri e tabelle.
//
// Contatti, Elenchi, Marketing, Workflow e Agent montano tutti questi stessi
// componenti. Il pannello dei filtri in particolare è UNO SOLO: quello che si
// compone nella rubrica è lo stesso oggetto che definisce un elenco attivo e
// lo stesso che sceglie il pubblico di una campagna. Tre schermate diverse,
// una grammatica sola.

const { useState: useStateHub, useMemo: useMemoHub, useEffect: useEffectHub, useRef: useRefHub } = React;

// ═══════════════════════════════════════════════════════════════════════════
// Il foglio di stile di Hubble — iniettato una volta sola da HubStile
// ═══════════════════════════════════════════════════════════════════════════
const HUB_CSS = `
@keyframes hubVeloIn   { from { opacity: 0 } to { opacity: 1 } }
@keyframes hubPannelloIn { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes hubModaleIn { from { opacity: 0; transform: translateY(12px) scale(0.975) } to { opacity: 1; transform: translateY(0) scale(1) } }
@keyframes hubFlyIn    { from { opacity: 0; transform: translateY(-6px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
@keyframes hubLampo    { 0% { box-shadow: 0 0 0 0 rgba(237,25,153,0.40) } 100% { box-shadow: 0 0 0 14px rgba(237,25,153,0) } }
@keyframes hubScorri   { from { background-position: 0% 50% } to { background-position: 200% 50% } }
@keyframes hubPulsa    { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }

/* Il nome del marchio: il gradiente Hubble ritagliato dentro le lettere. */
.hub-marchio {
  background: linear-gradient(100deg, #FF1F5A 0%, #ED1999 52%, #D410F1 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}

/* Riga di lista cliccabile — la freccia si accende e scivola. */
.hub-riga { transition: background-image 0.12s ease; cursor: pointer; }
.hub-riga:hover { background-image: linear-gradient(rgba(15,17,21,0.036), rgba(15,17,21,0.036)) !important; }
.hub-riga:active { background-image: linear-gradient(rgba(15,17,21,0.08), rgba(15,17,21,0.08)) !important; transition-duration: 0s; }
.hub-riga .hub-chev { transition: color 0.15s ease, transform 0.15s ease; display: inline-flex; }
.hub-riga:hover .hub-chev { color: #FF1F5A; transform: translateX(3px); }

/* Card cliccabile con il lift rosa. */
.hub-card { transition: box-shadow 0.18s ease, transform 0.18s cubic-bezier(0.34,1.2,0.64,1), border-color 0.18s ease; cursor: pointer; }
.hub-card:hover { transform: translateY(-2px); border-color: #FFA9BF !important; box-shadow: 0 14px 30px -14px rgba(255,31,90,0.30), 0 2px 6px -2px rgba(15,17,21,0.05) !important; }
.hub-card:active { transform: translateY(0) scale(0.993); }

/* La maniglia di trascinamento compare al passaggio del mouse. */
.hub-drag .hub-grip { opacity: 0; transition: opacity 0.12s ease; }
.hub-drag:hover .hub-grip { opacity: 1; }

/* Barre di scorrimento dei pannelli, più discrete di quelle di pagina. */
.hub-scroll { overflow-y: auto; scrollbar-width: thin; }
.hub-scroll::-webkit-scrollbar { width: 7px; }
.hub-scroll::-webkit-scrollbar-thumb { background: rgba(60,60,67,0.16); border-radius: 99px; }

@media (prefers-reduced-motion: reduce) {
  .hub-card, .hub-riga, .hub-riga .hub-chev { transition: none !important; }
}
`;

function HubStile() {
  return <style>{HUB_CSS}</style>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Primitive
// ═══════════════════════════════════════════════════════════════════════════

// La pillola di Hubble: un corpo solo per stati, tipologie ed etichette.
function HubPillola({ color = 'PLAN_FREE', children, forte, size = 'md' }) {
  const c = ADM[color] || color;
  const soft = ADM[color + '_SOFT'] || 'rgba(15,17,21,0.06)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '2px 7px' : '3px 9px', borderRadius: 5,
      background: forte ? c : soft, color: forte ? '#fff' : c,
      fontSize: size === 'sm' ? 12 : 13, fontWeight: 700, whiteSpace: 'nowrap',
      // Una pillola dentro una cella stretta deve accorciarsi, non sfondare
      // nella colonna accanto: «Workflow · Win-back 3 passi» finiva sopra il
      // nome di chi l'aveva creato.
      maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block',
      lineHeight: size === 'sm' ? '16px' : '18px', verticalAlign: 'middle',
    }}>{children}</span>
  );
}

// Pastiglia di stato con il pallino: dove il colore da solo non basta.
function HubStato({ stato, mappa }) {
  const d = (mappa || {})[stato] || { label: stato, color: 'PLAN_FREE' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: ADM[d.color] || d.color, flexShrink: 0 }}/>
      <span style={{ fontSize: 13.7, fontWeight: 600, color: ADM.TEXT }}>{d.label}</span>
    </span>
  );
}

// Il pulsante-strumento della barra: bianco a riposo, si scurisce sotto il
// mouse, veste il rosa da acceso. Il feedback vive in JS perché il fondo è uno
// stile inline e una classe :hover non lo batterebbe.
function HubStrumento({ icona, acceso, badge, onClick, children, forte, title }) {
  const [sopra, setSopra] = useStateHub(false);
  const [premuto, setPremuto] = useStateHub(false);
  const Icona = icona ? BuIcons[icona] : null;
  return (
    <button type="button" onClick={onClick} title={title}
      onMouseEnter={() => setSopra(true)}
      onMouseLeave={() => { setSopra(false); setPremuto(false); }}
      onMouseDown={() => setPremuto(true)} onMouseUp={() => setPremuto(false)}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 13px', borderRadius: 8,
        border: `1px solid ${forte ? 'transparent' : acceso ? ADM.PINK : sopra ? ADM.INK_SOFT : ADM.BORDER}`,
        fontSize: 13.7, fontWeight: 600,
        color: forte ? '#fff' : acceso ? ADM.PINK_DARK : ADM.TEXT,
        background: forte ? (sopra ? 'linear-gradient(180deg,#FF3A6C 0%,#E2144E 100%)' : 'linear-gradient(180deg,#FF1F5A 0%,#D4104A 100%)')
          : acceso ? (sopra ? ADM.PINK_HOVER : ADM.PINK_BG_SOFT)
          : (sopra ? '#F5F6F8' : '#fff'),
        boxShadow: premuto ? 'none'
          : forte ? '0 4px 14px -5px rgba(255,31,90,0.55), 0 1px 0 rgba(255,255,255,0.22) inset'
          : sopra ? '0 2px 8px rgba(15,17,21,0.10)' : '0 1px 2px rgba(15,17,21,0.04)',
        transform: premuto ? 'translateY(1px)' : 'none',
        cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
        transition: 'background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease, transform 0.05s ease',
      }}>
      {Icona && <Icona size={15} color={forte ? '#fff' : acceso ? ADM.PINK : sopra ? ADM.TEXT : ADM.MUTED}/>}
      {children}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: -7, right: -7, minWidth: 18, height: 18, padding: '0 5px',
          borderRadius: 999, background: ADM.PINK, color: '#fff', fontSize: 11.5, fontWeight: 800,
          lineHeight: 1, display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px #fff',
        }}>{badge}</span>
      )}
    </button>
  );
}

// Campo di ricerca con la lente e la croce per svuotare.
function HubRicerca({ valore, onCambia, placeholder = 'Cerca…', larghezza = 280 }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: 10, color: ADM.MUTED, pointerEvents: 'none', display: 'inline-flex' }}>
        <BuIcons.search size={17}/>
      </span>
      <input value={valore} onChange={e => onCambia(e.target.value)} placeholder={placeholder}
        style={{
          padding: '7px 28px 7px 31px', border: `1px solid ${ADM.BORDER}`, borderRadius: 8,
          fontSize: 14, fontFamily: 'inherit', width: larghezza, color: ADM.TEXT,
          background: '#fff', outline: 'none', boxSizing: 'border-box',
        }}/>
      {valore && (
        <button onClick={() => onCambia('')} title="Svuota" style={{
          position: 'absolute', right: 5, background: 'transparent', border: 'none', cursor: 'pointer',
          color: ADM.MUTED, padding: 4, display: 'inline-flex', borderRadius: 4,
        }}><BuIcons.x size={16}/></button>
      )}
    </div>
  );
}

// Testata di pagina: occhiello, titolo, riga di spiegazione, azioni a destra.
function HubTestata({ occhiello, titolo, sotto, azioni, colore = 'PINK' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        {occhiello && (
          <div style={{
            fontSize: 11.5, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase',
            color: ADM[colore + '_DARK'] || ADM[colore] || ADM.MUTED, marginBottom: 5,
          }}>{occhiello}</div>
        )}
        <div style={{ fontSize: 24, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.025em', lineHeight: 1.15 }}>{titolo}</div>
        {sotto && <div style={{ fontSize: 14.2, color: ADM.MUTED, marginTop: 5, maxWidth: 720, lineHeight: 1.5 }}>{sotto}</div>}
      </div>
      {azioni && <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, paddingTop: 4 }}>{azioni}</div>}
    </div>
  );
}

// Riquadro con un numero solo. `tono` colora il numero, non lo sfondo: una
// fila di riquadri colorati è una fila che non si legge.
function HubTile({ etichetta, valore, sotto, tono, icona, onClick }) {
  const Icona = icona ? BuIcons[icona] : null;
  return (
    <div className={onClick ? 'hub-card' : undefined} onClick={onClick} style={{
      background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 12,
      padding: '14px 16px', boxShadow: ADM.CARD_SHADOW, minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        {Icona && <Icona size={14} color={ADM.MUTED_SOFT}/>}
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: ADM.MUTED_SOFT, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etichetta}</div>
      </div>
      <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-0.03em', color: tono ? (ADM[tono] || tono) : ADM.TEXT, lineHeight: 1.05 }}>{valore}</div>
      {sotto && <div style={{ fontSize: 12.8, color: ADM.MUTED, marginTop: 5, lineHeight: 1.4 }}>{sotto}</div>}
    </div>
  );
}

function HubVuoto({ icona = 'search', titolo, desc, azione }) {
  const Icona = BuIcons[icona];
  return (
    <div style={{ padding: '52px 32px', textAlign: 'center' }}>
      <div style={{
        display: 'inline-grid', placeItems: 'center', width: 52, height: 52, borderRadius: 14,
        background: ADM.HUB_GRAD_SOFT, color: ADM.HUB_MAGENTA_DARK, marginBottom: 14,
      }}><Icona size={26}/></div>
      <div style={{ fontSize: 16, fontWeight: 700, color: ADM.TEXT, marginBottom: 5 }}>{titolo}</div>
      <div style={{ fontSize: 14, color: ADM.MUTED, maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>{desc}</div>
      {azione && <div style={{ marginTop: 16 }}>{azione}</div>}
    </div>
  );
}

// Controllo segmentato: due o tre viste della stessa lista.
function HubSegmenti({ voci, attivo, onCambia }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2, padding: 3, background: 'rgba(120,120,128,0.12)', borderRadius: 10 }}>
      {voci.map(v => {
        const on = attivo === v.id;
        return (
          <button key={v.id} onClick={() => onCambia(v.id)} style={{
            padding: '6px 13px', background: on ? '#fff' : 'transparent', border: 'none', borderRadius: 8,
            color: on ? ADM.TEXT : ADM.MUTED, fontWeight: 600, fontSize: 13.6, cursor: 'pointer',
            fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: on ? '0 1px 3px rgba(15,17,21,0.10), 0 1px 0 rgba(255,255,255,0.5) inset' : 'none',
            transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
          }}>
            {v.label}
            {v.conteggio != null && (
              <span style={{
                fontSize: 11.8, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                background: on ? ADM.PINK_SOFT : 'rgba(120,120,128,0.18)', color: on ? ADM.PINK_DARK : ADM.MUTED,
              }}>{v.conteggio}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Contenitori: modale centrale e pannello laterale
// ═══════════════════════════════════════════════════════════════════════════

function HubModale({ open, onClose, titolo, sotto, larghezza = 720, altezza, footer, children, padding = 22 }) {
  useEffectHub(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,17,21,0.42)',
      backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32,
      animation: 'hubVeloIn 0.14s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: larghezza, maxWidth: '100%', maxHeight: '86vh', height: altezza,
        background: '#fff', borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 40px 90px -20px rgba(15,17,21,0.42), 0 0 0 1px rgba(15,17,21,0.06)',
        display: 'flex', flexDirection: 'column', animation: 'hubModaleIn 0.2s cubic-bezier(0.34,1.24,0.64,1)',
      }}>
        <div style={{
          padding: '17px 22px', borderBottom: `1px solid ${ADM.BORDER}`,
          display: 'flex', alignItems: 'flex-start', gap: 14, flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17.5, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.015em' }}>{titolo}</div>
            {sotto && <div style={{ fontSize: 13.4, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>{sotto}</div>}
          </div>
          <button onClick={onClose} title="Chiudi" className="adm-iconbtn" style={{
            width: 30, height: 30, borderRadius: 8, border: 'none', background: ADM.NEUTRAL_SOFT,
            color: ADM.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
          }}><BuIcons.x size={17}/></button>
        </div>
        <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding }}>{children}</div>
        {footer && (
          <div style={{
            padding: '13px 22px', borderTop: `1px solid ${ADM.BORDER}`, background: ADM.PANEL_SOFT,
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

// Il pannello laterale: entra da destra, a piena altezza della finestra.
// I filtri stanno QUI e non in una tendina — comporre «Data di creazione ·
// successiva a · 3 luglio» dentro un popover da 250px è un lavoro che non si
// riesce a fare, e i filtri restano in vista mentre la lista si accorcia.
function HubPannello({ open, onClose, titolo, sotto, larghezza = 400, footer, children, icona, colore = 'PINK' }) {
  useEffectHub(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const Icona = icona ? BuIcons[icona] : null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 190, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,17,21,0.32)', animation: 'hubVeloIn 0.14s ease' }}/>
      <div style={{
        position: 'relative', width: larghezza, maxWidth: '92vw', height: '100%',
        background: '#fff', borderLeft: `1px solid ${ADM.BORDER}`,
        boxShadow: '-24px 0 60px -20px rgba(15,17,21,0.28)',
        display: 'flex', flexDirection: 'column',
        animation: 'hubPannelloIn 0.22s cubic-bezier(0.32,0.72,0,1)',
      }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${ADM.BORDER}`, display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
          {Icona && (
            <span style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center',
              background: ADM[colore + '_SOFT'] || ADM.PINK_SOFT, color: ADM[colore] || ADM.PINK,
            }}><Icona size={17}/></span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16.5, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.015em' }}>{titolo}</div>
            {sotto && <div style={{ fontSize: 13, color: ADM.MUTED, marginTop: 2, lineHeight: 1.45 }}>{sotto}</div>}
          </div>
          <button onClick={onClose} title="Chiudi" className="adm-iconbtn" style={{
            width: 30, height: 30, borderRadius: 8, border: 'none', background: ADM.NEUTRAL_SOFT,
            color: ADM.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
          }}><BuIcons.x size={17}/></button>
        </div>
        <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: 16 }}>{children}</div>
        {footer && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${ADM.BORDER}`, background: ADM.PANEL_SOFT, display: 'flex', gap: 9, flexShrink: 0 }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Campi
// ═══════════════════════════════════════════════════════════════════════════

const HUB_INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '8px 11px',
  border: `1px solid ${ADM.BORDER}`, borderRadius: 8, background: '#fff',
  fontSize: 13.8, fontFamily: 'inherit', color: ADM.TEXT, outline: 'none',
};

function HubCampo({ label, nota, children, larghezza }) {
  return (
    <div style={{ minWidth: 0, width: larghezza }}>
      {label && <label style={{ display: 'block', fontSize: 12.6, fontWeight: 700, color: ADM.MUTED, marginBottom: 6, letterSpacing: '-0.005em' }}>{label}</label>}
      {children}
      {nota && <div style={{ fontSize: 12, color: ADM.MUTED_SOFT, marginTop: 5, lineHeight: 1.45 }}>{nota}</div>}
    </div>
  );
}

function HubInput({ valore, onCambia, placeholder, tipo = 'text', style }) {
  return <input type={tipo} value={valore == null ? '' : valore} placeholder={placeholder}
    onChange={e => onCambia(tipo === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
    style={Object.assign({}, HUB_INPUT, style)}/>;
}

function HubArea({ valore, onCambia, placeholder, righe = 4, style }) {
  return <textarea value={valore || ''} placeholder={placeholder} rows={righe}
    onChange={e => onCambia(e.target.value)}
    style={Object.assign({}, HUB_INPUT, { resize: 'vertical', lineHeight: 1.5 }, style)}/>;
}

// Data: `value` è un Date, l'input parla in ISO. La conversione sta qui una
// volta sola invece che in ogni chiamante.
function HubData({ valore, onCambia, style }) {
  const iso = valore ? new Date(valore).toISOString().slice(0, 10) : '';
  return <input type="date" value={iso}
    onChange={e => onCambia(e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
    style={Object.assign({}, HUB_INPUT, style)}/>;
}

// Scelta multipla a spunte dentro un popover: l'operatore «è uno di» vuole
// più voci, e una tendina a scelta singola non le sa dire.
function HubScelteMultiple({ opzioni, scelte, onCambia, placeholder = 'Scegli…' }) {
  const [aperto, setAperto] = useStateHub(false);
  const [q, setQ] = useStateHub('');
  const [sopra, setSopra] = useStateHub(null);
  // Verso d'apertura: a ridosso del fondo della finestra la tendina si apre
  // VERSO L'ALTO — aperta in giù finiva sotto la piega dello scroll e si
  // vedeva solo il campo «Cerca…», con l'elenco invisibile.
  const [verso, setVerso] = useStateHub('giu');
  const box = React.useRef(null);
  const sel = Array.isArray(scelte) ? scelte : [];
  const commuta = () => {
    if (!aperto && box.current) {
      const r = box.current.getBoundingClientRect();
      const spazioSotto = window.innerHeight - r.bottom;
      setVerso(spazioSotto < 290 && r.top > spazioSotto ? 'su' : 'giu');
    }
    setAperto(a => !a);
  };

  useEffectHub(() => {
    if (!aperto) return;
    const chiudi = () => setAperto(false);
    const onKey = (e) => { if (e.key === 'Escape') setAperto(false); };
    window.addEventListener('pointerdown', chiudi);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('pointerdown', chiudi); window.removeEventListener('keydown', onKey); };
  }, [aperto]);

  const vis = opzioni.filter(o => String(o.label).toLowerCase().includes(q.toLowerCase()));
  const etichetta = sel.length === 0 ? placeholder
    : sel.length === 1 ? (opzioni.find(o => o.value === sel[0]) || {}).label || String(sel[0])
    : `${sel.length} voci scelte`;

  return (
    <div ref={box} style={{ position: 'relative' }} onPointerDown={e => e.stopPropagation()}>
      <button type="button" onClick={commuta} style={Object.assign({}, HUB_INPUT, {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        cursor: 'pointer', textAlign: 'left', fontWeight: sel.length ? 600 : 400,
        color: sel.length ? ADM.TEXT : ADM.MUTED_SOFT,
      })}>
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etichetta}</span>
        <span style={{ display: 'inline-flex', color: ADM.MUTED, flexShrink: 0, transform: aperto ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
          <BuIcons.chevronDown size={15}/>
        </span>
      </button>
      {aperto && (
        <div style={{
          position: 'absolute', left: 0, right: 0, zIndex: 220,
          top: verso === 'su' ? 'auto' : 'calc(100% + 5px)',
          bottom: verso === 'su' ? 'calc(100% + 5px)' : 'auto',
          background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 11, padding: 6,
          boxShadow: '0 20px 46px -12px rgba(15,17,21,0.26)', maxHeight: 260, display: 'flex', flexDirection: 'column',
          animation: 'hubFlyIn 0.13s ease',
        }}>
          {opzioni.length > 7 && (
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca…"
              style={Object.assign({}, HUB_INPUT, { marginBottom: 5, padding: '6px 9px', fontSize: 13 })}/>
          )}
          <div className="hub-scroll" style={{ flex: 1, minHeight: 0 }}>
            {vis.length === 0 && <div style={{ padding: '12px 10px', fontSize: 13, color: ADM.MUTED, textAlign: 'center' }}>Nessuna voce</div>}
            {vis.map(o => {
              const on = sel.includes(o.value);
              return (
                <button key={String(o.value)} type="button"
                  onClick={() => onCambia(on ? sel.filter(x => x !== o.value) : [...sel, o.value])}
                  onMouseEnter={() => setSopra(o.value)} onMouseLeave={() => setSopra(s => s === o.value ? null : s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                    padding: '7px 9px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: sopra === o.value ? ADM.NEUTRAL_SOFT : 'transparent', transition: 'background 0.1s ease',
                  }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0, display: 'grid', placeItems: 'center',
                    border: `1.5px solid ${on ? ADM.PINK : ADM.BORDER}`, background: on ? ADM.PINK : '#fff',
                  }}>{on && <BuIcons.check size={11} color="#fff"/>}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13.4, fontWeight: on ? 600 : 500, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// IL PANNELLO DEI FILTRI
// ═══════════════════════════════════════════════════════════════════════════
//
// Un filtro è una frase di tre parole: PROPRIETÀ · OPERATORE · VALORE.
//   «Referral · è noto»                        → chi ha un referral, qualunque
//   «Data di creazione · successiva a · 3 lug» → chi è entrato dopo quel giorno
// Il terzo pezzo cambia forma con la proprietà: testo libero, numero, data,
// spunte sull'elenco delle voci possibili. Il pannello non chiede mai di
// scrivere a mano un valore che può offrire.

// Il campo del VALORE di un filtro, da solo. Sta fuori dalla card perché lo
// stesso identico campo serve anche alle regole di un ramo di workflow: la
// domanda «che valore?» dipende solo da proprietà e operatore, non da dove la
// si sta scrivendo. Duplicarlo voleva dire due elenchi di `case` da tenere
// allineati a mano, e uno dei due sarebbe rimasto indietro.
function HubValore({ prop, op, valore, onCambia, righe }) {
  const p = typeof prop === 'string' ? HUB_PROP[prop] : prop;
  const opzioni = useMemoHub(() => (p ? hubOpzioni(p, righe) : []), [p && p.id, righe]);
  if (!p || !op) return null;
  const parte = (i, v) => {
    const a = Array.isArray(valore) ? [...valore] : [null, null];
    a[i] = v; onCambia(a);
  };
  switch (op.arg) {
    case 'nessuno': return null;
    case 'testo':   return <HubInput valore={valore} onCambia={onCambia} placeholder="Scrivi il testo…"/>;
    case 'numero':  return <HubInput tipo="number" valore={valore} onCambia={onCambia} placeholder="0"/>;
    case 'data':    return <HubData valore={valore} onCambia={onCambia}/>;
    case 'giorni':  return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <HubInput tipo="number" valore={valore} onCambia={onCambia} placeholder="30" style={{ width: 92 }}/>
        <span style={{ fontSize: 13.4, color: ADM.MUTED, fontWeight: 600 }}>giorni</span>
      </div>
    );
    case 'scelte':  return <HubScelteMultiple opzioni={opzioni} scelte={valore} onCambia={onCambia}/>;
    case 'intervallo': {
      const [a, b] = Array.isArray(valore) ? valore : [null, null];
      const C = p.tipo === 'data' ? HubData : HubInput;
      const extra = p.tipo === 'data' ? {} : { tipo: 'number' };
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}><C {...extra} valore={a} onCambia={v => parte(0, v)} placeholder="da"/></div>
          <span style={{ fontSize: 13, color: ADM.MUTED_SOFT, fontWeight: 700 }}>e</span>
          <div style={{ flex: 1, minWidth: 0 }}><C {...extra} valore={b} onCambia={v => parte(1, v)} placeholder="a"/></div>
        </div>
      );
    }
    default: return null;
  }
}

// Cambiando operatore il valore vecchio spesso non ha più senso (un testo
// dentro «è uno di», una data dentro «contiene»): si riparte pulito, tranne
// quando la forma dell'argomento è la stessa.
function hubValoreIniziale(op, opPrec, valorePrec) {
  if (opPrec && op && op.arg === opPrec.arg) return valorePrec;
  return op.arg === 'scelte' ? [] : op.arg === 'intervallo' ? [null, null] : null;
}

function HubFiltroCard({ filtro, righe, onCambia, onElimina, indice }) {
  const p = HUB_PROP[filtro.prop];
  if (!p) return null;
  const operatori = HUB_OPERATORI[p.tipo] || [];
  const op = operatori.find(o => o.id === filtro.op) || operatori[0];
  const valore = (v) => onCambia(Object.assign({}, filtro, { valore: v }));
  const campoValore = () => <HubValore prop={p} op={op} valore={filtro.valore} onCambia={valore} righe={righe}/>;

  return (
    // NIENTE overflow:hidden qui: dentro la card vivono due tendine a
    // posizionamento assoluto (l'operatore e le scelte del valore), e il
    // clip le decapitava al bordo — si vedeva il campo «Cerca…» e l'elenco
    // delle voci restava invisibile. Gli angoli della testata si arrotondano
    // da soli, senza chiedere alla card di tagliare i figli.
    <div style={{
      border: `1px solid ${ADM.BORDER}`, borderRadius: 11, background: '#fff',
      boxShadow: '0 1px 2px rgba(15,17,21,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px 9px 12px',
        background: ADM.PANEL_SOFT, borderBottom: `1px solid ${ADM.BORDER_SOFT}`,
        borderRadius: '10px 10px 0 0',
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 800, color: ADM.MUTED_SOFT, letterSpacing: '0.08em',
          background: '#fff', border: `1px solid ${ADM.BORDER}`, borderRadius: 5, padding: '1px 5px', flexShrink: 0,
        }}>{indice === 0 ? 'DOVE' : 'E'}</span>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.7, fontWeight: 700, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
        <button onClick={onElimina} title="Togli questo filtro" className="adm-iconbtn" style={{
          width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent',
          color: ADM.MUTED_SOFT, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
        }}><BuIcons.x size={15}/></button>
      </div>
      <div style={{ padding: 11, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <AdmSelect block value={op.id} onChange={id => {
          const nuovo = operatori.find(o => o.id === id);
          onCambia(Object.assign({}, filtro, { op: id, valore: hubValoreIniziale(nuovo, op, filtro.valore) }));
        }} options={operatori.map(o => ({ value: o.id, label: o.label }))}/>
        {campoValore()}
      </div>
    </div>
  );
}

// Il listino delle proprietà: raggruppate, con la ricerca in cima. È la stessa
// tendina che si apre da «Aggiungi filtro» e da «Aggiungi colonna».
function HubSceltaProprieta({ onScegli, escludi = [], altezza = 300, autoFocus = true }) {
  const [q, setQ] = useStateHub('');
  const [sopra, setSopra] = useStateHub(null);
  const query = q.trim().toLowerCase();
  const gruppi = HUB_GRUPPI_PROP.map(g => ({
    ...g,
    voci: HUB_PROPRIETA.filter(p => p.gruppo === g.id && !escludi.includes(p.id)
      && (!query || p.label.toLowerCase().includes(query) || g.label.toLowerCase().includes(query))),
  })).filter(g => g.voci.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <input autoFocus={autoFocus} value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca una proprietà…"
        style={Object.assign({}, HUB_INPUT, { marginBottom: 7 })}/>
      <div className="hub-scroll" style={{ maxHeight: altezza, minHeight: 0 }}>
        {gruppi.length === 0 && <div style={{ padding: '18px 10px', fontSize: 13.4, color: ADM.MUTED, textAlign: 'center' }}>Nessuna proprietà per «{q}»</div>}
        {gruppi.map(g => (
          <div key={g.id}>
            <div style={{ padding: '9px 8px 4px', fontSize: 10.8, fontWeight: 800, color: ADM.MUTED_SOFT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{g.label}</div>
            {g.voci.map(p => (
              <button key={p.id} type="button" onClick={() => onScegli(p)}
                onMouseEnter={() => setSopra(p.id)} onMouseLeave={() => setSopra(s => s === p.id ? null : s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                  padding: '8px 9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: sopra === p.id ? ADM.NEUTRAL_SOFT : 'transparent', transition: 'background 0.1s ease',
                }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.6, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
                  {p.nota && <span style={{ display: 'block', fontSize: 11.8, color: ADM.MUTED_SOFT, marginTop: 1 }}>{p.nota}</span>}
                </span>
                {!p.sistema && <HubPillola color="HUB_VIOLA" size="sm">personalizzata</HubPillola>}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Il pannello intero. `escludi` accende la seconda lista — quella che TOGLIE
// contatti dal risultato — e serve agli elenchi attivi, dove «includi e
// escludi nello stesso elenco» è la regola, non l'eccezione.
function HubFiltri({ righe, includi, escludi, onIncludi, onEscludi, conEscludi }) {
  const [scelta, setScelta] = useStateHub(null); // 'includi' | 'escludi'

  const aggiungi = (dove, p) => {
    const op = (HUB_OPERATORI[p.tipo] || [])[0];
    const nuovo = { prop: p.id, op: op.id, valore: op.arg === 'scelte' ? [] : op.arg === 'intervallo' ? [null, null] : null };
    (dove === 'includi' ? onIncludi : onEscludi)([...(dove === 'includi' ? includi : escludi), nuovo]);
    setScelta(null);
  };

  const blocco = (dove, lista, set, titolo, spiega, colore) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: 2, background: ADM[colore], flexShrink: 0 }}/>
        <span style={{ fontSize: 12.6, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.005em' }}>{titolo}</span>
        {lista.length > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 800, color: ADM.MUTED_SOFT, background: ADM.NEUTRAL_SOFT, borderRadius: 99, padding: '1px 7px' }}>{lista.length}</span>
        )}
      </div>
      <div style={{ fontSize: 12.2, color: ADM.MUTED, marginBottom: 10, lineHeight: 1.45 }}>{spiega}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {lista.map((f, i) => (
          <HubFiltroCard key={dove + i} filtro={f} righe={righe} indice={i}
            onCambia={n => set(lista.map((x, j) => j === i ? n : x))}
            onElimina={() => set(lista.filter((_, j) => j !== i))}/>
        ))}
      </div>
      {scelta === dove ? (
        <div style={{
          marginTop: 9, padding: 9, border: `1px solid ${ADM.PINK}`, borderRadius: 11,
          background: '#fff', boxShadow: `0 10px 26px -12px ${ADM.HUB_GLOW}`,
        }}>
          <HubSceltaProprieta onScegli={p => aggiungi(dove, p)} altezza={240}/>
          <button onClick={() => setScelta(null)} style={{
            marginTop: 7, width: '100%', padding: '7px 10px', borderRadius: 8, border: 'none',
            background: ADM.NEUTRAL_SOFT, color: ADM.MUTED, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Annulla</button>
        </div>
      ) : (
        <button onClick={() => setScelta(dove)} style={{
          marginTop: 9, width: '100%', padding: '9px 10px', borderRadius: 9,
          border: `1px dashed ${ADM.BORDER}`, background: ADM.PANEL_SOFT, color: ADM.TEXT,
          fontSize: 13.4, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          <BuIcons.plus size={15} color={ADM.MUTED}/> Aggiungi filtro
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {blocco('includi', includi, onIncludi, 'Includi i contatti che…',
        'Tutte le condizioni devono essere vere insieme.', 'OK')}
      {conEscludi && blocco('escludi', escludi || [], onEscludi, 'Togli i contatti che…',
        'Chi soddisfa tutte queste condizioni esce dal risultato, anche se rientrava sopra.', 'DANGER')}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODIFICA COLONNE
// ═══════════════════════════════════════════════════════════════════════════
//
// Due liste affiancate: a sinistra il catalogo di tutto quello che si può
// mostrare, a destra le colonne scelte NELL'ORDINE in cui appariranno, che si
// riordinano trascinandole. La tendina di prima sapeva accendere e spegnere
// ma non sapeva dire «questa prima di quella», e l'ordine è metà del lavoro.

function HubColonne({ open, onClose, colonne, onSalva, fissa = 'nome' }) {
  const [sel, setSel] = useStateHub(colonne);
  const [q, setQ] = useStateHub('');
  const [presa, setPresa] = useStateHub(null);
  const [mira, setMira] = useStateHub(null);
  const presaRef = useRefHub(null);

  useEffectHub(() => { if (open) { setSel(colonne); setQ(''); } }, [open]);
  if (!open) return null;

  const query = q.trim().toLowerCase();
  const gruppi = HUB_GRUPPI_PROP.map(g => ({
    ...g,
    voci: HUB_PROPRIETA.filter(p => p.gruppo === g.id && p.colonna && (!query || p.label.toLowerCase().includes(query))),
  })).filter(g => g.voci.length);

  const commuta = (id) => {
    if (id === fissa) return;
    setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };
  const sposta = (da, a, dopo) => {
    if (!da || da === a) return;
    setSel(s => {
      const senza = s.filter(x => x !== da);
      let i = senza.indexOf(a);
      if (i < 0) i = senza.length; else if (dopo) i += 1;
      senza.splice(i, 0, da);
      return senza;
    });
  };

  return (
    <HubModale open={open} onClose={onClose} larghezza={860} altezza="72vh" padding={0}
      titolo="Modifica colonne"
      sotto="Scegli che cosa mostrare e in che ordine. Trascina le colonne scelte per spostarle."
      footer={
        <React.Fragment>
          <button onClick={() => setSel([fissa, 'email', 'tipo', 'ciclo', 'piano', 'citta'])} style={{
            background: 'transparent', border: 'none', color: ADM.MUTED, fontSize: 13.4, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', padding: '6px 4px',
          }}>Ripristina le colonne di partenza</button>
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 13, color: ADM.MUTED, marginRight: 4 }}>{sel.length} colonne</span>
          <HubStrumento onClick={onClose}>Annulla</HubStrumento>
          <HubStrumento forte icona="check" onClick={() => { onSalva(sel); onClose(); }}>Applica</HubStrumento>
        </React.Fragment>
      }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', minHeight: 0 }}>
        {/* Catalogo */}
        <div style={{ borderRight: `1px solid ${ADM.BORDER}`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '13px 16px 10px', borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca una proprietà…" style={HUB_INPUT}/>
          </div>
          <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '4px 10px 12px' }}>
            {gruppi.map(g => (
              <div key={g.id}>
                <div style={{ padding: '11px 6px 4px', fontSize: 10.8, fontWeight: 800, color: ADM.MUTED_SOFT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{g.label}</div>
                {g.voci.map(p => {
                  const on = sel.includes(p.id);
                  const bloccata = p.id === fissa;
                  return (
                    <label key={p.id} title={bloccata ? 'L\'identità del contatto non si nasconde' : undefined}
                      onClick={() => commuta(p.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 8,
                        cursor: bloccata ? 'default' : 'pointer', opacity: bloccata ? 0.5 : 1,
                        background: on ? ADM.PINK_BG_SOFT : 'transparent',
                      }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0, display: 'grid', placeItems: 'center',
                        border: `1.5px solid ${on ? ADM.PINK : ADM.BORDER}`, background: on ? ADM.PINK : '#fff',
                      }}>{on && <BuIcons.check size={11} color="#fff"/>}</span>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13.6, fontWeight: on ? 600 : 500, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(p.colonna && p.colonna.label) || p.label}</span>
                      {!p.sistema && <HubPillola color="HUB_VIOLA" size="sm">personalizzata</HubPillola>}
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Colonne scelte, in ordine */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: ADM.PANEL_SOFT }}>
          <div style={{ padding: '15px 16px 11px', borderBottom: `1px solid ${ADM.BORDER_SOFT}`, fontSize: 12.6, fontWeight: 800, color: ADM.TEXT, letterSpacing: '-0.005em' }}>
            Colonne mostrate, da sinistra a destra
          </div>
          <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '10px 12px 16px' }}>
            {sel.map(id => {
              const p = HUB_PROP[id];
              if (!p) return null;
              const bloccata = id === fissa;
              const bersaglio = mira && mira.id === id && presa && presa !== id;
              return (
                <div key={id} className="hub-drag"
                  onDragOver={e => { e.preventDefault(); const r = e.currentTarget.getBoundingClientRect(); setMira({ id, dopo: e.clientY > r.top + r.height / 2 }); }}
                  onDragLeave={() => setMira(m => m && m.id === id ? null : m)}
                  onDrop={e => {
                    e.preventDefault();
                    let da = ''; try { da = e.dataTransfer.getData('text/plain'); } catch (err) {}
                    da = da || presaRef.current;
                    const r = e.currentTarget.getBoundingClientRect();
                    sposta(da, id, e.clientY > r.top + r.height / 2);
                    presaRef.current = null; setPresa(null); setMira(null);
                  }}
                  draggable={!bloccata}
                  onDragStart={e => {
                    presaRef.current = id; setPresa(id);
                    try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
                  }}
                  onDragEnd={() => { presaRef.current = null; setPresa(null); setMira(null); }}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 10px', marginBottom: 6, borderRadius: 9,
                    background: '#fff', border: `1px solid ${ADM.BORDER}`,
                    boxShadow: '0 1px 2px rgba(15,17,21,0.04)',
                    opacity: presa === id ? 0.35 : 1,
                    cursor: bloccata ? 'default' : 'grab',
                    transition: 'opacity 0.15s ease',
                  }}>
                  {bersaglio && (
                    <span aria-hidden="true" style={{
                      position: 'absolute', left: 4, right: 4, height: 3, borderRadius: 99, background: ADM.PINK,
                      top: mira.dopo ? 'auto' : -5, bottom: mira.dopo ? -5 : 'auto',
                      boxShadow: '0 0 0 1px #fff, 0 2px 10px rgba(255,31,90,0.55)',
                    }}/>
                  )}
                  <span className="hub-grip" style={{ color: ADM.INK_SOFT, display: 'inline-flex', flexShrink: 0, opacity: bloccata ? 0 : undefined }}>
                    <BuIcons.gripDots size={15}/>
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13.6, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(p.colonna && p.colonna.label) || p.label}</span>
                  {bloccata
                    ? <span style={{ fontSize: 11.5, color: ADM.MUTED_SOFT, fontWeight: 600, flexShrink: 0 }}>sempre visibile</span>
                    : <button onClick={() => commuta(id)} title="Togli la colonna" className="adm-iconbtn" style={{
                        width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent',
                        color: ADM.MUTED_SOFT, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
                      }}><BuIcons.x size={15}/></button>}
                </div>
              );
            })}
            {sel.length <= 1 && (
              <div style={{ padding: '18px 10px', fontSize: 13, color: ADM.MUTED, textAlign: 'center', lineHeight: 1.5 }}>
                Spunta le proprietà a sinistra: compaiono qui, e da qui si mettono in ordine.
              </div>
            )}
          </div>
        </div>
      </div>
    </HubModale>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tabella generica: intestazioni, righe, riga vuota
// ═══════════════════════════════════════════════════════════════════════════

function HubTabella({ colonne, righe, chiave, cella, onRiga, vuoto, sort, onSort }) {
  const griglia = colonne.map(c => c.w || '1fr').join(' ') + (onRiga ? ' 44px' : '');
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: griglia, columnGap: 16, padding: '10px 18px',
        borderBottom: `1px solid ${ADM.BORDER}`, alignItems: 'center', background: ADM.PANEL_SOFT,
      }}>
        {colonne.map(c => {
          const attiva = sort && sort.campo === c.id;
          const cliccabile = !!onSort && c.ordinabile !== false;
          return (
            <div key={c.id} style={{ minWidth: 0, overflow: 'hidden', textAlign: c.destra ? 'right' : 'left' }}>
              <button type="button" disabled={!cliccabile} onClick={() => cliccabile && onSort(c.id)}
                style={{
                  background: 'transparent', border: 'none', padding: 0, fontFamily: 'inherit',
                  fontSize: 11.6, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase',
                  color: attiva ? ADM.PINK_DARK : ADM.MUTED_SOFT,
                  cursor: cliccabile ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                {c.label}
                {attiva && (
                  <span style={{ display: 'inline-flex', color: ADM.PINK, transform: sort.verso === 'asc' ? 'rotate(180deg)' : 'none' }}>
                    <BuIcons.chevronDown size={13}/>
                  </span>
                )}
              </button>
            </div>
          );
        })}
        {onRiga && <div/>}
      </div>
      {righe.length === 0 && vuoto}
      {righe.map((r, i) => (
        <div key={chiave(r)} className={onRiga ? 'hub-riga' : undefined} onClick={onRiga ? () => onRiga(r) : undefined}
          style={{
            display: 'grid', gridTemplateColumns: griglia, columnGap: 16, padding: '12px 18px',
            borderBottom: `1px solid ${ADM.BORDER_SOFT}`, alignItems: 'center',
            background: i % 2 === 1 ? ADM.ROW_STRIPE : 'transparent',
          }}>
          {colonne.map(c => (
            <div key={c.id} style={{ minWidth: 0, overflow: 'hidden', textAlign: c.destra ? 'right' : 'left' }}>{cella(c.id, r)}</div>
          ))}
          {onRiga && (
            <div style={{ textAlign: 'right', color: ADM.MUTED }}>
              <span className="hub-chev"><BuIcons.chevronRight size={19}/></span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Barra di avanzamento sottile con etichetta a destra.
function HubBarra({ valore, max, color = 'PINK', altezza = 6 }) {
  const pc = max > 0 ? Math.min(100, (valore / max) * 100) : 0;
  return (
    <div style={{ width: '100%', height: altezza, borderRadius: 99, background: ADM.NEUTRAL_SOFT, overflow: 'hidden' }}>
      <div style={{ width: pc + '%', height: '100%', borderRadius: 99, background: ADM[color] || color, transition: 'width 0.4s cubic-bezier(0.32,0.72,0,1)' }}/>
    </div>
  );
}

// Riga d'intestazione di un blocco dentro una pagina.
function HubSezione({ titolo, sotto, azioni, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 11 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ADM.MUTED_SOFT }}>{titolo}</div>
          {sotto && <div style={{ fontSize: 13.4, color: ADM.MUTED, marginTop: 4 }}>{sotto}</div>}
        </div>
        {azioni}
      </div>
      {children}
    </div>
  );
}

window.HubStile = HubStile;
window.HubPillola = HubPillola;
window.HubStato = HubStato;
window.HubStrumento = HubStrumento;
window.HubRicerca = HubRicerca;
window.HubTestata = HubTestata;
window.HubTile = HubTile;
window.HubVuoto = HubVuoto;
window.HubSegmenti = HubSegmenti;
window.HubModale = HubModale;
window.HubPannello = HubPannello;
window.HubCampo = HubCampo;
window.HubInput = HubInput;
window.HubArea = HubArea;
window.HubData = HubData;
window.HubScelteMultiple = HubScelteMultiple;
window.HubFiltri = HubFiltri;
window.HubFiltroCard = HubFiltroCard;
window.HubValore = HubValore;
window.hubValoreIniziale = hubValoreIniziale;
window.HubSceltaProprieta = HubSceltaProprieta;
window.HubColonne = HubColonne;
window.HubTabella = HubTabella;
window.HubBarra = HubBarra;
window.HubSezione = HubSezione;
window.HUB_INPUT = HUB_INPUT;
