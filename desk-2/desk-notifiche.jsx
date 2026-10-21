// Desk — le notifiche (20 ottobre 2026)
//
// Quando succede qualcosa che ti riguarda — qualcuno ti scrive o ti menziona
// in Ambiente, entra un ticket, scade un passo di vendita, sta per iniziare
// una riunione, un agente trova qualcosa — arriva una NOTIFICA:
//   · un cartellino in basso a destra, che si tocca e porta dove serve, e che
//     se ne va da solo dopo qualche secondo (si ferma se ci passi sopra);
//   · la stessa notifica resta nella CAMPANELLA in alto, con il pallino dei
//     non letti, finché non la apri o segni tutto come letto;
//   · «Non disturbare» spegne i cartellini: le notifiche vanno solo nella
//     campanella.
//
// Il modello di una notifica è quello che il backend vero dovrà mandare:
//   { id, tipo, da, titolo, testo, quando, vai: { rotta, opts, vista } }
// `tipo` decide l'icona e il colore (messaggio, menzione, ticket, sales,
// riunione, agente); `vai` è la destinazione, detta con le stesse rotte di
// window.hubVai (e la vista di Ambiente, se serve). Chiunque può mandarne una
// con window.deskNotifica({...}).
//
// Nel PROTOTIPO le notifiche sono finte: un copione (NT_COPIONE) le fa
// arrivare a tempo dopo l'apertura, e quelle di Ambiente scrivono davvero il
// messaggio nella conversazione, così il clic porta a una chat che lo
// contiene. Una notifica per una conversazione che stai già guardando non
// suona: il messaggio arriva e basta.

const { useState: useStateNt, useEffect: useEffectNt, useRef: useRefNt } = React;

const NT_TIPI = {
  messaggio: { icona: 'chatFill',    colore: '#492844', etichetta: 'Messaggio' },
  menzione:  { icona: 'at',          colore: '#FF1F5A', etichetta: 'Menzione' },
  ticket:    { icona: 'ticketFill',  colore: '#2563EB', etichetta: 'Assistenza' },
  sales:     { icona: 'target',      colore: '#1F5A43', etichetta: 'Sales' },
  riunione:  { icona: 'video',       colore: '#6E4C68', etichetta: 'Riunione' },
  agente:    { icona: 'sparkFill',   colore: '#9209A8', etichetta: 'Agente' },
  sistema:   { icona: 'bellFill',    colore: '#1D1520', etichetta: 'Desk' },
};

// ═══ Lo store ══════════════════════════════════════════════════════════════
const NT_STORE = {
  s: { tutte: [], visibili: [], nonDisturbare: false, aperto: false },
  ascolta: new Set(),
};
function ntAggiorna(fn) { NT_STORE.s = Object.assign({}, NT_STORE.s, fn(NT_STORE.s)); NT_STORE.ascolta.forEach(f => f()); }
function ntUsa() {
  const [, setN] = useStateNt(0);
  useEffectNt(() => { const f = () => setN(x => x + 1); NT_STORE.ascolta.add(f); return () => { NT_STORE.ascolta.delete(f); }; }, []);
  return NT_STORE.s;
}
let NT_CONTA = 0;
function deskNotifica(n) {
  const nota = Object.assign({ id: 'nt' + (++NT_CONTA), quando: new Date(), letta: false, tipo: 'sistema' }, n);
  // Se stai già guardando quello di cui parla, niente cartellino: è già lì.
  const stessaVista = nota.vai && nota.vai.rotta === window.hubRotta && (!nota.vai.vista || (typeof dkLeggi === 'function' && dkLeggi().vista === nota.vai.vista));
  ntAggiorna(s => ({
    tutte: [Object.assign({}, nota, { letta: stessaVista })].concat(s.tutte).slice(0, 40),
    visibili: s.nonDisturbare || stessaVista ? s.visibili : [nota].concat(s.visibili).slice(0, 3),
  }));
  return nota.id;
}
window.deskNotifica = deskNotifica;
function ntChiudi(id) { ntAggiorna(s => ({ visibili: s.visibili.filter(n => n.id !== id) })); }
function ntApri(n) {
  ntAggiorna(s => ({ tutte: s.tutte.map(x => x.id === n.id ? Object.assign({}, x, { letta: true }) : x), visibili: s.visibili.filter(x => x.id !== n.id), aperto: false }));
  if (!n.vai) return;
  if (n.vai.vista && typeof dkApri === 'function') dkApri(n.vai.vista);
  if (window.hubVai) window.hubVai(n.vai.rotta, n.vai.opts || undefined);
}

// ═══ Il copione del prototipo ══════════════════════════════════════════════
// Ogni voce: dopo quanti secondi, e cosa fa arrivare. `prima` scrive il
// messaggio vero nello store di Ambiente (o il ticket nella coda).
function ntScriviIn(conv, da, testo, menzione) {
  if (typeof dkAggiorna !== 'function') return;
  const id = 'nt-m' + Date.now();
  dkAggiorna(s => {
    const guardo = window.hubRotta === 'ambiente' && s.vista === 'conv:' + conv;
    const tocca = (l) => l.map(c => c.id !== conv || guardo ? c : Object.assign({}, c, { nonLetti: (c.nonLetti || 0) + 1, menzioni: (c.menzioni || 0) + (menzione ? 1 : 0) }));
    return {
      messaggi: Object.assign({}, s.messaggi, { [conv]: (s.messaggi[conv] || []).concat([{ id, da, t: new Date(), testo, reazioni: [], risposte: [] }]) }),
      canali: tocca(s.canali), diretti: tocca(s.diretti),
    };
  });
}
const NT_COPIONE = [
  { dopo: 9, fai: () => {
    ntScriviIn('dm-sara', 'support1', 'Marco, la Trattoria della Nonna ha richiamato: passano al Plus se gli facciamo uno sconto sui primi mesi. Gliel\'applichi tu dalla scheda?');
    return { tipo: 'messaggio', da: 'support1', titolo: 'Sara Conti', testo: 'La Trattoria della Nonna passa al Plus se gli facciamo uno sconto sui primi mesi…', vai: { rotta: 'ambiente', vista: 'conv:dm-sara' } };
  } },
  { dopo: 34, fai: () => {
    const id = 'M' + (190 + NT_CONTA);
    if (typeof COMUNICAZIONI !== 'undefined') COMUNICAZIONI.unshift({
      id, certRequest: false, localeId: 'L1012', senderName: 'Luca Conti', senderEmail: 'titolare@pizzeriabrandi.it',
      oggetto: 'Il QR del tavolo 4 apre il menu di un altro locale', desc: 'Buonasera,\n\nstasera due clienti al tavolo 4 hanno scansionato il QR e si sono trovati il menu di un altro ristorante. Gli altri tavoli funzionano. Potete controllare subito? Abbiamo la sala piena.\n\nLuca Conti\nPizzeria Brandi',
      allegati: [], data: new Date(), stato: 'nuova', priorita: 'alta', tags: [], assignedTo: null,
    });
    return { tipo: 'ticket', titolo: 'Nuovo ticket · priorità alta', testo: 'Pizzeria Brandi: «Il QR del tavolo 4 apre il menu di un altro locale»', vai: { rotta: 'comunicazioni', opts: { openComm: id } } };
  } },
  { dopo: 62, fai: () => {
    ntScriviIn('lancio', 'mkt1', 'E @[admin0] la landing è pronta per la tua rilettura: mancano solo i prezzi annuali. Te la lascio qui.', true);
    return { tipo: 'menzione', da: 'mkt1', titolo: 'Paola Esposito ti ha menzionato', testo: 'in #lancio-1-dicembre: «la landing è pronta per la tua rilettura»', vai: { rotta: 'ambiente', vista: 'conv:lancio' } };
  } },
  { dopo: 95, fai: () => ({ tipo: 'sales', titolo: 'Prossimo passo in scadenza', testo: 'Osteria San Pietro: «Rispondere sullo sconto del 10% chiesto», oggi alle 18:00', vai: { rotta: 'sales' } }) },
  { dopo: 130, fai: () => ({ tipo: 'agente', titolo: 'Analista della retention', testo: 'Ho trovato 2 locali nuovi a rischio: Trattoria Felicin e Bistrot Notes non ordinano da 30 giorni.', vai: { rotta: 'agent' } }) },
  { dopo: 170, fai: () => ({ tipo: 'riunione', titolo: 'Tra 5 minuti', testo: 'Revisione campagne di novembre · con Paola e Marco G.', vai: { rotta: 'ambiente', vista: 'riunioni' } }) },
];

// ═══ Il cartellino ═════════════════════════════════════════════════════════
function NtIcona({ n, size = 40 }) {
  const t = NT_TIPI[n.tipo] || NT_TIPI.sistema;
  const persona = n.da && typeof TEAM !== 'undefined' ? TEAM.find(x => x.id === n.da) : null;
  return (
    <span style={{ position: 'relative', flexShrink: 0 }}>
      {persona ? (
        <span style={{ width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', background: persona.avatarBg, color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.36) }}>{persona.isYou ? 'MR' : persona.avatar}</span>
      ) : (
        <span style={{ width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', background: t.colore, color: '#fff' }}>
          {React.createElement(BuIcons[t.icona], { size: Math.round(size * 0.46) })}
        </span>
      )}
      {persona && (
        <span style={{ position: 'absolute', right: -3, bottom: -3, width: 19, height: 19, borderRadius: '50%', background: t.colore, color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px #fff' }}>
          {React.createElement(BuIcons[t.icona], { size: 10 })}
        </span>
      )}
    </span>
  );
}

function NtCartellino({ n }) {
  const [sopra, setSopra] = useStateNt(false);
  useEffectNt(() => {
    if (sopra) return;
    const t = setTimeout(() => ntChiudi(n.id), 8000);
    return () => clearTimeout(t);
  }, [sopra]);
  const t = NT_TIPI[n.tipo] || NT_TIPI.sistema;
  return (
    <div onMouseEnter={() => setSopra(true)} onMouseLeave={() => setSopra(false)} onClick={() => ntApri(n)} className="nt-cartellino" role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') ntApri(n); }}
      style={{
        width: 360, display: 'flex', gap: 12, alignItems: 'flex-start', padding: '13px 12px 13px 14px', borderRadius: 22, cursor: 'pointer',
        background: 'rgba(255,255,255,0.96)', border: '1px solid rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 26px 56px -24px rgba(42,26,40,0.55), 0 0 0 1px rgba(73,40,68,0.05)', animation: 'ntEntra 0.34s cubic-bezier(0.34,1.4,0.64,1)',
      }}>
      <NtIcona n={n}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11.2, fontWeight: 800, color: t.colore, letterSpacing: '0.01em' }}>{t.etichetta}</span>
          <span style={{ fontSize: 11.2, color: ADM.MUTED_SOFT }}>· adesso</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 750, color: ADM.TEXT, letterSpacing: '-0.015em', marginTop: 2 }}>{n.titolo}</div>
        <div style={{ fontSize: 12.8, color: ADM.MUTED, marginTop: 2, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.testo}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 750, color: ADM.TEXT, marginTop: 7 }}>Apri <BuIcons.arrowRight size={12}/></div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); ntChiudi(n.id); }} aria-label="Chiudi" style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(73,40,68,0.06)', color: ADM.MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}><BuIcons.x size={13}/></button>
    </div>
  );
}

// Il copione parte una volta sola per pagina aperta.
let NT_PARTITO = false;
function DeskNotifiche() {
  const s = ntUsa();
  // Con Byuppino aperto (il pannello sta in basso a destra) i cartellini si
  // spostano alla sua sinistra invece di coprirgli la chat.
  const bp = typeof bpUsaStore === 'function' ? bpUsaStore() : null;
  useEffectNt(() => {
    if (NT_PARTITO) return;
    NT_PARTITO = true;
    const timer = NT_COPIONE.map(v => setTimeout(() => { try { deskNotifica(v.fai()); } catch (e) { console.error('[notifiche]', e); } }, v.dopo * 1000));
    return () => timer.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ position: 'absolute', right: bp && bp.aperto ? 456 : 22, bottom: 22, zIndex: 170, display: 'flex', flexDirection: 'column-reverse', gap: 10, pointerEvents: 'none' }}>
      <style>{NT_CSS}</style>
      {s.visibili.map(n => <div key={n.id} style={{ pointerEvents: 'auto' }}><NtCartellino n={n}/></div>)}
    </div>
  );
}

// ═══ La campanella ═════════════════════════════════════════════════════════
function ntTempo(d) {
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  if (m < 1) return 'adesso';
  if (m < 60) return m + ' min fa';
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}
function DeskCampanella() {
  const s = ntUsa();
  const [, setTic] = useStateNt(0);
  useEffectNt(() => { if (!s.aperto) return; const t = setInterval(() => setTic(x => x + 1), 30000); return () => clearInterval(t); }, [s.aperto]);
  const nuove = s.tutte.filter(n => !n.letta).length;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => ntAggiorna(x => ({ aperto: !x.aperto }))} className="desk-cerchio" data-tip="Notifiche" data-tip-pos="below" aria-label={'Notifiche' + (nuove ? ', ' + nuove + ' nuove' : '')}
        style={s.aperto ? { background: ADM.INCHIOSTRO, color: '#fff' } : undefined}>
        <BuIcons.bell size={18} strokeWidth={2}/>
        {nuove > 0 && <span key={nuove} style={{ position: 'absolute', top: -2, right: -2, minWidth: 19, height: 19, padding: '0 5px', borderRadius: 99, boxSizing: 'border-box', background: ADM.PINK, color: '#fff', fontSize: 10.8, fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px #F2EEEC', animation: 'ntPop 0.4s cubic-bezier(0.34,1.6,0.64,1)' }}>{nuove}</span>}
      </button>
      {s.aperto && (
        <React.Fragment>
          <div onClick={() => ntAggiorna(() => ({ aperto: false }))} style={{ position: 'fixed', inset: 0, zIndex: 140 }}/>
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: -60, zIndex: 145, width: 400, maxHeight: 560, display: 'flex', flexDirection: 'column',
            background: 'rgba(255,255,255,0.97)', border: `1px solid ${ADM.GLASS_BORDO}`, borderRadius: 26, backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
            boxShadow: '0 30px 70px -24px rgba(42,26,40,0.45)', animation: 'hubFlyIn 0.15s cubic-bezier(0.34,1.2,0.64,1)', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 10px 18px' }}>
              <span style={{ fontSize: 17, fontWeight: 750, letterSpacing: '-0.025em', flex: 1 }}>Notifiche</span>
              {nuove > 0 && <button onClick={() => ntAggiorna(x => ({ tutte: x.tutte.map(n => Object.assign({}, n, { letta: true })) }))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.6, fontWeight: 700, color: ADM.MUTED }}>Segna tutte come lette</button>}
            </div>
            <div className="hub-scroll" style={{ flex: 1, minHeight: 0, padding: '0 8px 8px' }}>
              {s.tutte.length === 0 && (
                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', margin: '0 auto 10px', display: 'grid', placeItems: 'center', background: '#F3EEF0', color: ADM.MUTED }}><BuIcons.bell size={22}/></div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Tutto tranquillo</div>
                  <div style={{ fontSize: 12.6, color: ADM.MUTED, marginTop: 3 }}>Qui arrivano messaggi, menzioni, ticket e scadenze.</div>
                </div>
              )}
              {s.tutte.map(n => (
                <button key={n.id} onClick={() => ntApri(n)} className="adm-actionrow" style={{
                  display: 'flex', gap: 11, width: '100%', textAlign: 'left', padding: '10px 10px', borderRadius: 18, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: n.letta ? 'transparent' : 'rgba(255,31,90,0.05)', alignItems: 'flex-start',
                }}>
                  <NtIcona n={n} size={36}/>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13.4, fontWeight: n.letta ? 650 : 800, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.titolo}</span>
                      <span style={{ fontSize: 11.2, color: ADM.MUTED_SOFT, whiteSpace: 'nowrap' }}>{ntTempo(n.quando)}</span>
                      {!n.letta && <span style={{ width: 8, height: 8, borderRadius: '50%', background: ADM.PINK, flexShrink: 0 }}/>}
                    </span>
                    <span style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 2, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.testo}</span>
                  </span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderTop: `1px solid ${ADM.BORDER_SOFT}` }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.2, fontWeight: 700 }}>Non disturbare</span>
                <span style={{ display: 'block', fontSize: 11.8, color: ADM.MUTED }}>Niente cartellini: le notifiche restano solo qui</span>
              </span>
              <AdmSwitch checked={s.nonDisturbare} onChange={(v) => ntAggiorna(() => ({ nonDisturbare: v, visibili: v ? [] : NT_STORE.s.visibili }))} size="sm"/>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

const NT_CSS = `
@keyframes ntEntra { from { opacity: 0; transform: translateX(30px) scale(0.96) } to { opacity: 1; transform: none } }
@keyframes ntPop { from { transform: scale(0.4) } to { transform: scale(1) } }
.nt-cartellino { transition: transform 0.16s ease, box-shadow 0.16s ease; }
.nt-cartellino:hover { transform: translateY(-2px); box-shadow: 0 30px 60px -22px rgba(42,26,40,0.6), 0 0 0 1px rgba(73,40,68,0.08) !important; }
@media (prefers-reduced-motion: reduce) { .nt-cartellino { animation: none !important; } }
`;

window.DeskNotifiche = DeskNotifiche;
window.DeskCampanella = DeskCampanella;
