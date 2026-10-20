// Desk — Sales: le trattative (20 ottobre 2026)
//
// byup non ha un team commerciale: le trattative le segue chi capita, quasi
// sempre Marco. Sales serve a una cosa sola, TENERE TRACCIA — chi stiamo
// sentendo, a che punto siamo, quanto vale, qual è la prossima cosa da fare e
// quando. Niente previsioni per venditore, niente quote, niente provvigioni.
//
// Una trattativa passa per quattro fasi aperte e finisce vinta o persa:
//   Primo contatto → Demo → Proposta → Trattativa → Vinta / Persa
// Ogni fase ha una probabilità fissa (10, 30, 50, 75%), che serve solo a dare
// il valore «ponderato» della pipeline. Il valore è l'abbonamento annuo del
// piano a cui si punta, letto da PIANI (il listino di Desk): cambia il piano,
// cambia il valore — nessun numero scritto a mano che poi diverge.
//
// La trattativa è legata a un locale della rubrica quando c'è (si apre la sua
// scheda); i locali che non hanno ancora un account restano «prospect», col
// solo nome. Vinta, il locale non nasce da qui: nasce quando il titolare si
// iscrive, come sempre.
//
// La pagina: numeri in alto, la BACHECA (si trascinano le schede da una fase
// all'altra; le chiuse si lasciano cadere su Vinta o Persa) o l'ELENCO, e il
// pannello della trattativa con fase, valore, prossimo passo e diario.
// Byuppino legge lo stesso store (slLeggi) e sa creare una trattativa.

const { useState: useStateSl, useEffect: useEffectSl } = React;

const SL_FASI = [
  { id: 'contatto',   label: 'Primo contatto', prob: 10,  colore: '#DCBAD7', ink: '#492844' },
  { id: 'demo',       label: 'Demo',           prob: 30,  colore: '#E9C46A', ink: '#5A4512' },
  { id: 'proposta',   label: 'Proposta',       prob: 50,  colore: '#492844', ink: '#fff' },
  { id: 'trattativa', label: 'Trattativa',     prob: 75,  colore: '#FF1F5A', ink: '#fff' },
  { id: 'vinta',      label: 'Vinta',          prob: 100, colore: '#1F5A43', ink: '#fff' },
  { id: 'persa',      label: 'Persa',          prob: 0,   colore: '#1D1520', ink: '#fff' },
];
const SL_APERTE = ['contatto', 'demo', 'proposta', 'trattativa'];
const SL_FONTI = ['Form «Richiedi una demo»', 'Sito', 'Passaparola', 'Fiera Host 2026', 'Contatto diretto', 'Già cliente (upgrade)'];
const SL_MOTIVI_PERSA = ['Prezzo', 'Resta col gestionale che ha', 'Non è il momento', 'Non risponde più', 'Altro'];
const slFase = (id) => SL_FASI.find(f => f.id === id) || SL_FASI[0];
const slPianoDi = (id) => (typeof PIANI !== 'undefined' ? PIANI : []).find(p => p.id === id) || { id, label: id, price: 0 };
// Il valore di una trattativa: l'abbonamento di un anno al piano scelto.
const slValore = (t) => Math.round(slPianoDi(t.piano).price * 12);
const slEuro = (n) => '€ ' + new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(Math.round(n));
const slLocale = (id) => (typeof LOCALI !== 'undefined' ? LOCALI : []).find(l => l.id === id) || null;
const slNome = (t) => { const l = t.localeId && slLocale(t.localeId); return l ? l.nome : t.prospect; };
const slCitta = (t) => { const l = t.localeId && slLocale(t.localeId); return l ? l.citta : t.citta; };
const slOra = Date.now();
const slGiorno = (g, h, m) => { const d = new Date(slOra); d.setDate(d.getDate() + g); d.setHours(h || 18, m || 0, 0, 0); return d; };
function slQuando(d) {
  if (!d) return '—';
  const oggi = new Date(); const dom = new Date(); dom.setDate(oggi.getDate() + 1); const ieri = new Date(); ieri.setDate(oggi.getDate() - 1);
  const ora = d.getHours() || d.getMinutes() ? ' · ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
  if (d.toDateString() === oggi.toDateString()) return 'Oggi' + ora;
  if (d.toDateString() === dom.toDateString()) return 'Domani' + ora;
  if (d.toDateString() === ieri.toDateString()) return 'Ieri' + ora;
  return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
}
const slScaduto = (t) => SL_APERTE.includes(t.fase) && t.passo && t.passo.quando && t.passo.quando.getTime() < Date.now() - 36e5;

// ═══ Lo store ══════════════════════════════════════════════════════════════
function slIniziali() {
  const n = (id, giorniFa, testo, da) => ({ id, t: slGiorno(-giorniFa, 10 + (id.length % 7), 0), testo, da: da || 'admin0' });
  return [
    { id: 'D-318', prospect: 'Osteria Bonelli', citta: 'Roma', referente: 'Daniele Bonelli · titolare', titolo: 'Osteria Bonelli', piano: 'plus', fase: 'contatto', fonte: 'Form «Richiedi una demo»', chi: 'admin0', creata: slGiorno(0, 9), chiusura: slGiorno(30),
      passo: { testo: 'Prima chiamata: capire coperti e sale', quando: slGiorno(0, 17, 30) },
      diario: [n('a', 0, 'Ha compilato il form della demo: 70 coperti, due sale, molto asporto il weekend.')] },
    { id: 'D-317', prospect: 'Caffè Gambrinus', citta: 'Napoli', referente: 'Ufficio acquisti', titolo: 'Caffè Gambrinus', piano: 'starter', fase: 'contatto', fonte: 'Fiera Host 2026', chi: 'admin0', creata: slGiorno(-6), chiusura: slGiorno(45),
      passo: { testo: 'Mandare la presentazione e il listino', quando: slGiorno(1, 12) },
      diario: [n('a', 6, 'Conosciuti allo stand di Host: interessati soprattutto al conto diviso al tavolo.')] },
    { id: 'D-316', localeId: 'L1010', titolo: 'Trattoria Da Cesare · Starter', piano: 'starter', fase: 'contatto', fonte: 'Sito', chi: 'support1', creata: slGiorno(-3), chiusura: slGiorno(20),
      passo: { testo: 'Chiamare: è iscritta al Gratuito, ha 90 coperti', quando: slGiorno(2, 11) },
      diario: [n('a', 3, 'Iscritta dal sito al piano Gratuito, configurazione a metà. Coperti oltre il limite del piano.', 'support1')] },
    { id: 'D-315', localeId: 'L1007', titolo: 'Pizzeria Sorbillo · Plus', piano: 'plus', fase: 'demo', fonte: 'Passaparola', chi: 'admin0', creata: slGiorno(-12), chiusura: slGiorno(14),
      passo: { testo: 'Demo Fresh: Sala, Cucina e conto diviso', quando: slGiorno(1, 11) },
      diario: [n('a', 12, 'Ci ha presentati Pizzeria Starita.'), n('b', 4, 'Fissata la demo con Chiara Greco. Due sale, molto asporto: mostrare la Cucina.')] },
    { id: 'D-314', localeId: 'L1011', titolo: 'Ristorante La Pergola · Business', piano: 'business', fase: 'demo', fonte: 'Contatto diretto', chi: 'admin0', creata: slGiorno(-9), chiusura: slGiorno(25),
      passo: { testo: 'Demo con lo chef e il maître', quando: slGiorno(3, 15) },
      diario: [n('a', 9, 'Scritto io a Sofia Esposito dopo il pezzo su Gambero Rosso.'), n('b', 2, 'Vogliono vedere prenotazioni e sala insieme.')] },
    { id: 'D-312', localeId: 'L1003', titolo: 'Ristorante Il Gabbiano · Plus', piano: 'plus', fase: 'proposta', fonte: 'Form «Richiedi una demo»', chi: 'admin0', creata: slGiorno(-21), chiusura: slGiorno(5),
      passo: { testo: 'Richiamare per la risposta alla proposta', quando: slGiorno(-1, 16) },
      diario: [n('a', 21, 'Demo fatta: è piaciuto il KDS.'), n('b', 3, 'Proposta mandata: Plus annuale, prima configurazione la facciamo noi.')] },
    { id: 'D-311', localeId: 'L1026', titolo: 'Enoteca Pinchiorri · upgrade a Business', piano: 'business', fase: 'proposta', fonte: 'Già cliente (upgrade)', chi: 'admin1', creata: slGiorno(-8), chiusura: slGiorno(12),
      passo: { testo: 'Mandare il confronto dei costi Plus / Business', quando: slGiorno(2, 10) },
      diario: [n('a', 8, 'Superano gli ordini inclusi nel Plus da tre mesi: conviene il Business.', 'admin1')] },
    { id: 'D-310', localeId: 'L1001', titolo: 'Osteria San Pietro · Business', piano: 'business', fase: 'trattativa', fonte: 'Passaparola', chi: 'admin0', creata: slGiorno(-30), chiusura: slGiorno(3),
      passo: { testo: 'Rispondere sullo sconto del 10% chiesto', quando: slGiorno(0, 18) },
      diario: [n('a', 30, 'Prima chiamata: tre locali in arrivo nel 2027.'), n('b', 10, 'Proposta Business mandata.'), n('c', 2, 'Chiedono il 10% di sconto sul primo anno.')] },
    { id: 'D-309', localeId: 'L1002', titolo: 'Pizzeria Da Michele · Business', piano: 'business', fase: 'trattativa', fonte: 'Contatto diretto', chi: 'admin0', creata: slGiorno(-26), chiusura: slGiorno(9),
      passo: { testo: 'Sentire il commercialista sul contratto', quando: slGiorno(2, 15) },
      diario: [n('a', 26, 'Tre sedi, una a Napoli e due in apertura.'), n('b', 5, 'Contratto in revisione dal loro commercialista.')] },
    { id: 'D-305', localeId: 'L1004', titolo: 'Bistrot Aurora · Plus', piano: 'plus', fase: 'vinta', fonte: 'Form «Richiedi una demo»', chi: 'admin0', creata: slGiorno(-34), chiusura: slGiorno(-1), chiusaIl: slGiorno(-1, 12),
      passo: null, diario: [n('a', 34, 'Demo richiesta dal form.'), n('b', 1, 'Contratto firmato. 🎉')] },
    { id: 'D-304', localeId: 'L1028', titolo: 'Pizzeria Starita · Business', piano: 'business', fase: 'vinta', fonte: 'Fiera Host 2026', chi: 'admin0', creata: slGiorno(-48), chiusura: slGiorno(-12), chiusaIl: slGiorno(-12, 11),
      passo: null, diario: [n('a', 12, 'Firmato il Business annuale.')] },
    { id: 'D-302', localeId: 'L1021', titolo: 'Bar Centrale · Plus', piano: 'plus', fase: 'vinta', fonte: 'Sito', chi: 'admin1', creata: slGiorno(-60), chiusura: slGiorno(-25), chiusaIl: slGiorno(-25, 16),
      passo: null, diario: [n('a', 25, 'Passati dal Gratuito al Plus.', 'admin1')] },
    { id: 'D-306', localeId: 'L1048', titolo: 'Enoteca Cul de Sac · Starter', piano: 'starter', fase: 'persa', motivo: 'Resta col gestionale che ha', fonte: 'Sito', chi: 'admin0', creata: slGiorno(-40), chiusura: slGiorno(-9), chiusaIl: slGiorno(-9, 10),
      passo: null, diario: [n('a', 9, 'Restano col gestionale attuale fino a fine contratto: ricontattare a giugno.')] },
    { id: 'D-303', prospect: 'Ristorante Sora Lella', citta: 'Roma', titolo: 'Ristorante Sora Lella', piano: 'plus', fase: 'persa', motivo: 'Prezzo', fonte: 'Contatto diretto', chi: 'admin0', creata: slGiorno(-55), chiusura: slGiorno(-20), chiusaIl: slGiorno(-20, 10),
      passo: null, diario: [n('a', 20, 'Troppo per adesso: rivedere col listino 2027.')] },
  ];
}
const SL_STORE = { trattative: null, ascolta: new Set(), conta: 318 };
function slLeggi() { if (!SL_STORE.trattative) SL_STORE.trattative = slIniziali(); return SL_STORE.trattative; }
function slScrivi(lista) { SL_STORE.trattative = lista; SL_STORE.ascolta.forEach(f => f()); }
function slAggiorna(id, campi) { slScrivi(slLeggi().map(t => t.id === id ? Object.assign({}, t, typeof campi === 'function' ? campi(t) : campi) : t)); }
function slNuovoId() { SL_STORE.conta += 1; return 'D-' + SL_STORE.conta; }
function slUsaStore() {
  const [, setN] = useStateSl(0);
  useEffectSl(() => { const f = () => setN(x => x + 1); SL_STORE.ascolta.add(f); return () => { SL_STORE.ascolta.delete(f); }; }, []);
  return slLeggi();
}
function slNota(id, testo) {
  slAggiorna(id, t => ({ diario: t.diario.concat([{ id: 'n' + Date.now(), t: new Date(), testo, da: 'admin0' }]) }));
}
// Cambiare fase: le chiuse prendono la data di chiusura; il diario lo annota.
function slSposta(id, fase, motivo) {
  const prima = slLeggi().find(t => t.id === id);
  if (!prima || prima.fase === fase) return;
  slAggiorna(id, t => ({
    fase, motivo: fase === 'persa' ? (motivo || t.motivo || 'Altro') : null,
    chiusaIl: fase === 'vinta' || fase === 'persa' ? new Date() : null,
    passo: fase === 'vinta' || fase === 'persa' ? null : t.passo,
    diario: t.diario.concat([{ id: 'f' + Date.now(), t: new Date(), da: 'admin0', testo: 'Fase: ' + slFase(t.fase).label + ' → ' + slFase(fase).label + (fase === 'persa' && motivo ? ' (' + motivo + ')' : '') }]),
  }));
  if (window.deskAvviso) window.deskAvviso({
    testo: slNome(prima) + ' → ' + slFase(fase).label + (fase === 'vinta' ? ' 🎉' : ''),
    annulla: () => slScrivi(slLeggi().map(t => t.id === id ? prima : t)),
  });
}
function slNumeri(lista) {
  const aperte = lista.filter(t => SL_APERTE.includes(t.fase));
  const mese = new Date(); mese.setDate(1); mese.setHours(0, 0, 0, 0);
  const novanta = Date.now() - 90 * 864e5;
  const chiuse90 = lista.filter(t => t.chiusaIl && t.chiusaIl.getTime() > novanta);
  const vinte90 = chiuse90.filter(t => t.fase === 'vinta');
  return {
    aperte: aperte.length,
    pipeline: aperte.reduce((a, t) => a + slValore(t), 0),
    ponderata: aperte.reduce((a, t) => a + slValore(t) * slFase(t.fase).prob / 100, 0),
    vinteMese: lista.filter(t => t.fase === 'vinta' && t.chiusaIl && t.chiusaIl >= mese),
    tasso: chiuse90.length ? Math.round(vinte90.length / chiuse90.length * 100) : 0,
    chiuse90: chiuse90.length,
    scaduti: aperte.filter(slScaduto).length,
  };
}

// ═══ Pezzi ═════════════════════════════════════════════════════════════════
function SlAvatar({ id, size = 26, bordo }) {
  const t = (typeof TEAM !== 'undefined' ? TEAM : []).find(x => x.id === id);
  const ini = !t ? '?' : t.isYou ? 'MR' : t.avatar;
  return (
    <span title={t ? (t.isYou ? 'Tu' : t.nome) : ''} style={{
      width: size, height: size, borderRadius: '50%', display: 'inline-grid', placeItems: 'center', flexShrink: 0,
      background: t ? t.avatarBg : ADM.NEUTRAL_SOFT, color: '#fff', fontSize: Math.round(size * 0.38), fontWeight: 700,
      boxShadow: bordo ? '0 0 0 2px ' + bordo : 'none',
    }}>{ini}</span>
  );
}

function SlPillolaFase({ fase, piccola }) {
  const f = slFase(fase);
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: piccola ? '2px 9px' : '4px 11px', borderRadius: 999, background: f.colore, color: f.ink, fontSize: piccola ? 11.6 : 12.4, fontWeight: 750, whiteSpace: 'nowrap' }}>{f.label}</span>;
}

function SlScheda({ t, onApri, trascina, onTrascina }) {
  const scaduto = slScaduto(t);
  const chiusa = !SL_APERTE.includes(t.fase);
  return (
    <div draggable={!chiusa} onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); e.dataTransfer.effectAllowed = 'move'; onTrascina(t.id); }}
      onDragEnd={() => onTrascina(null)} onClick={() => onApri(t.id)} className="sl-scheda"
      style={{
        background: '#fff', borderRadius: 18, padding: '12px 13px 11px', cursor: chiusa ? 'pointer' : 'grab',
        boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 10px 22px -18px rgba(73,40,68,0.6)', border: '1px solid rgba(73,40,68,0.06)',
        opacity: trascina === t.id ? 0.45 : 1,
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.015em', color: ADM.TEXT, lineHeight: 1.25 }}>{slNome(t)}</div>
          <div style={{ fontSize: 11.8, color: ADM.MUTED, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {slCitta(t)} · {t.localeId ? 'in rubrica' : 'prospect'}{t.fonte === 'Già cliente (upgrade)' ? ' · upgrade' : ''}
          </div>
        </div>
        <SlAvatar id={t.chi} size={24}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 9 }}>
        <span style={{ fontSize: 18, fontWeight: 750, letterSpacing: '-0.03em', color: ADM.TEXT }}>{slEuro(slValore(t))}</span>
        <span style={{ fontSize: 11.6, color: ADM.MUTED_SOFT, fontWeight: 600 }}>/anno · {slPianoDi(t.piano).label}</span>
      </div>
      {t.passo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9, padding: '6px 9px', borderRadius: 12, background: scaduto ? '#FFE8EE' : '#F6F1F3' }}>
          <BuIcons.arrowRight size={12} color={scaduto ? '#C40B45' : ADM.MUTED}/>
          <span style={{ flex: 1, minWidth: 0, fontSize: 11.8, fontWeight: 650, color: scaduto ? '#C40B45' : ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.passo.testo}</span>
          <span style={{ fontSize: 11, fontWeight: 750, color: scaduto ? '#C40B45' : ADM.MUTED, whiteSpace: 'nowrap' }}>{slQuando(t.passo.quando)}</span>
        </div>
      )}
      {chiusa && (
        <div style={{ fontSize: 11.6, color: ADM.MUTED, marginTop: 8 }}>{t.fase === 'vinta' ? 'Vinta' : 'Persa · ' + (t.motivo || '')} · {slQuando(t.chiusaIl)}</div>
      )}
    </div>
  );
}

function SlColonna({ fase, voci, onApri, trascina, onTrascina, onLascia }) {
  const f = slFase(fase);
  const [sopra, setSopra] = useStateSl(false);
  const tot = voci.reduce((a, t) => a + slValore(t), 0);
  return (
    <div onDragOver={(e) => { e.preventDefault(); if (!sopra) setSopra(true); }} onDragLeave={() => setSopra(false)}
      onDrop={(e) => { e.preventDefault(); setSopra(false); const id = e.dataTransfer.getData('text/plain'); if (id) onLascia(id, fase); }}
      style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRadius: 24, padding: 10,
        background: sopra ? 'rgba(73,40,68,0.10)' : 'rgba(255,255,255,0.42)', border: '1px solid ' + (sopra ? 'rgba(73,40,68,0.25)' : 'rgba(255,255,255,0.75)'),
        transition: 'background 0.12s ease, border-color 0.12s ease',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 10px' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: f.colore, boxShadow: f.id === 'contatto' ? 'inset 0 0 0 1px rgba(73,40,68,0.25)' : 'none' }}/>
        <span style={{ fontSize: 14, fontWeight: 750, letterSpacing: '-0.015em' }}>{f.label}</span>
        <span style={{ fontSize: 11.6, fontWeight: 750, color: ADM.MUTED, background: 'rgba(255,255,255,0.8)', padding: '1px 8px', borderRadius: 999 }}>{voci.length}</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, fontWeight: 700, color: ADM.MUTED }}>{slEuro(tot)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 60 }}>
        {voci.map(t => <SlScheda key={t.id} t={t} onApri={onApri} trascina={trascina} onTrascina={onTrascina}/>)}
        {voci.length === 0 && <div style={{ fontSize: 12.4, color: ADM.MUTED_SOFT, textAlign: 'center', padding: '18px 8px', border: '1.5px dashed rgba(73,40,68,0.14)', borderRadius: 16 }}>Trascina qui una trattativa</div>}
      </div>
      <div style={{ fontSize: 11.2, color: ADM.MUTED_SOFT, fontWeight: 600, textAlign: 'center', marginTop: 8 }}>probabilità {f.prob}%</div>
    </div>
  );
}

// Le chiuse: due bersagli per lasciar cadere, e l'elenco delle ultime.
function SlChiuse({ voci, onApri, trascina, onTrascina, onLascia }) {
  const [sopra, setSopra] = useStateSl(null);
  const bersaglio = (fase) => {
    const f = slFase(fase);
    const on = sopra === fase;
    return (
      <div onDragOver={(e) => { e.preventDefault(); if (sopra !== fase) setSopra(fase); }} onDragLeave={() => setSopra(null)}
        onDrop={(e) => { e.preventDefault(); setSopra(null); const id = e.dataTransfer.getData('text/plain'); if (id) onLascia(id, fase); }}
        style={{
          flex: 1, borderRadius: 16, padding: '12px 10px', textAlign: 'center', fontSize: 13, fontWeight: 750,
          background: on ? f.colore : trascina ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)', color: on ? '#fff' : f.colore,
          border: '1.5px dashed ' + (trascina ? f.colore : 'rgba(73,40,68,0.12)'), transition: 'background 0.12s ease',
        }}>
        {fase === 'vinta' ? '🎉 Vinta' : 'Persa'}
      </div>
    );
  };
  const recenti = voci.slice().sort((a, b) => (b.chiusaIl || 0) - (a.chiusaIl || 0)).slice(0, 5);
  return (
    <div style={{ width: 236, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRadius: 24, padding: 10, background: 'rgba(255,255,255,0.42)', border: '1px solid rgba(255,255,255,0.75)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 10px' }}>
        <span style={{ fontSize: 14, fontWeight: 750, letterSpacing: '-0.015em' }}>Chiuse</span>
        <span style={{ fontSize: 11.6, fontWeight: 750, color: ADM.MUTED, background: 'rgba(255,255,255,0.8)', padding: '1px 8px', borderRadius: 999 }}>{voci.length}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>{bersaglio('vinta')}{bersaglio('persa')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {recenti.map(t => (
          <button key={t.id} onClick={() => onApri(t.id)} className="sl-riga" style={{
            display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '8px 10px', borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.75)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: slFase(t.fase).colore, flexShrink: 0 }}/>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 12.6, fontWeight: 700, color: ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slNome(t)}</span>
              <span style={{ display: 'block', fontSize: 11, color: ADM.MUTED }}>{t.fase === 'vinta' ? slEuro(slValore(t)) + '/anno' : t.motivo} · {slQuando(t.chiusaIl)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Il pannello della trattativa ──────────────────────────────────────────
function SlDettaglio({ id, onClose, chiediPerdita }) {
  const lista = slUsaStore();
  const t = lista.find(x => x.id === id);
  const [nota, setNota] = useStateSl('');
  const [passo, setPasso] = useStateSl(null);
  const [perdi, setPerdi] = useStateSl(false);
  useEffectSl(() => { setPasso(null); setNota(''); setPerdi(!!chiediPerdita); }, [id, chiediPerdita]);
  if (!t) return null;
  const aperta = SL_APERTE.includes(t.fase);
  const locale = t.localeId && slLocale(t.localeId);
  const team = (typeof TEAM !== 'undefined' ? TEAM : []).filter(x => x.attivo);
  const campo = (etichetta, figlio) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
      <span style={{ width: 110, flexShrink: 0, fontSize: 12.6, color: ADM.MUTED, fontWeight: 600 }}>{etichetta}</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13.6, fontWeight: 650, color: ADM.TEXT }}>{figlio}</span>
    </div>
  );
  return (
    <HubPannello open={true} onClose={onClose} larghezza={470} icona="target" colore="DESK_PRUGNA"
      titolo={slNome(t)} sotto={t.id + ' · ' + slCitta(t) + (t.referente ? ' · ' + t.referente : locale ? ' · ' + locale.titolare : '')}
      footer={aperta ? (
        <React.Fragment>
          <AdmButton variant="success" size="md" icon="check" onClick={() => slSposta(t.id, 'vinta')}>Vinta</AdmButton>
          <AdmButton variant="ghost" size="md" onClick={() => setPerdi(p => !p)}>Persa…</AdmButton>
          <div style={{ flex: 1 }}/>
          {locale && <AdmButton variant="ghost" size="md" icon="store" onClick={() => { onClose(); window.hubVai && window.hubVai('locali', { openLocale: locale }); }}>Scheda del locale</AdmButton>}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <AdmButton variant="ghost" size="md" icon="refresh" onClick={() => slSposta(t.id, 'trattativa')}>Riapri</AdmButton>
          <div style={{ flex: 1 }}/>
          {locale && <AdmButton variant="ghost" size="md" icon="store" onClick={() => { onClose(); window.hubVai && window.hubVai('locali', { openLocale: locale }); }}>Scheda del locale</AdmButton>}
        </React.Fragment>
      )}>
      {/* Le fasi: si tocca quella dove la trattativa è arrivata */}
      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'rgba(73,40,68,0.06)' }}>
        {SL_APERTE.map((f, i) => {
          const idx = SL_APERTE.indexOf(t.fase);
          const fatta = !aperta ? t.fase === 'vinta' : i <= idx;
          const qui = t.fase === f;
          return (
            <button key={f} onClick={() => slSposta(t.id, f)} style={{
              flex: 1, padding: '7px 4px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: qui ? 800 : 650,
              background: qui ? ADM.INCHIOSTRO : fatta ? '#fff' : 'transparent', color: qui ? '#fff' : fatta ? ADM.TEXT : ADM.MUTED,
              boxShadow: fatta && !qui ? '0 4px 10px -8px rgba(73,40,68,0.6)' : 'none',
            }}>{slFase(f).label}</button>
          );
        })}
      </div>
      {!aperta && <div style={{ marginTop: 10 }}><SlPillolaFase fase={t.fase}/> <span style={{ fontSize: 12.6, color: ADM.MUTED, marginLeft: 6 }}>{slQuando(t.chiusaIl)}{t.motivo ? ' · ' + t.motivo : ''}</span></div>}
      {perdi && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 16, background: '#F6F1F3' }}>
          <div style={{ fontSize: 12.6, fontWeight: 700, marginBottom: 8 }}>Perché è persa?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SL_MOTIVI_PERSA.map(m => <button key={m} onClick={() => { if (t.fase === 'persa') slAggiorna(t.id, { motivo: m }); else slSposta(t.id, 'persa', m); setPerdi(false); }} style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(73,40,68,0.14)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.4, fontWeight: 650 }}>{m}</button>)}
          </div>
        </div>
      )}

      {/* Il valore: si sceglie il piano, il numero lo dà il listino */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 750, letterSpacing: '-0.045em', lineHeight: 1 }}>{slEuro(slValore(t))}</div>
          <div style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 5 }}>all'anno · ponderato {slEuro(slValore(t) * slFase(t.fase).prob / 100)} ({slFase(t.fase).prob}%)</div>
        </div>
        <AdmSelect value={t.piano} onChange={(v) => slAggiorna(t.id, { piano: v })} align="right"
          options={(typeof PIANI !== 'undefined' ? PIANI : []).filter(p => p.price > 0).map(p => ({ value: p.id, label: 'Piano ' + p.label }))}/>
      </div>

      {/* Il prossimo passo: la cosa che conta di più */}
      {aperta && (
        <div style={{ marginTop: 18, padding: 14, borderRadius: 18, background: slScaduto(t) ? '#FFE8EE' : '#fff', border: '1px solid ' + (slScaduto(t) ? '#FFC2D2' : 'rgba(73,40,68,0.08)') }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.4, fontWeight: 800, color: slScaduto(t) ? '#C40B45' : ADM.MUTED }}>{slScaduto(t) ? 'Prossimo passo · in ritardo' : 'Prossimo passo'}</span>
            <span style={{ flex: 1 }}/>
            {t.passo && !passo && <button onClick={() => setPasso({ testo: t.passo.testo, quando: t.passo.quando })} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.4, fontWeight: 700, color: ADM.MUTED }}>Modifica</button>}
          </div>
          {passo || !t.passo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <HubInput valore={(passo || {}).testo || ''} onCambia={(v) => setPasso(Object.assign({}, passo || {}, { testo: v }))} placeholder="Es. Richiamare per la risposta" autoFocus={!!passo}/>
              <div style={{ display: 'flex', gap: 8 }}>
                <HubData valore={(passo || {}).quando || null} onCambia={(d) => setPasso(Object.assign({}, passo || {}, { quando: d }))} style={{ flex: 1 }}/>
                <AdmButton variant="primary" size="md" disabled={!passo || !passo.testo} onClick={() => {
                  slAggiorna(t.id, x => ({ passo: { testo: passo.testo, quando: passo.quando || slGiorno(1) }, diario: x.diario.concat([{ id: 'p' + Date.now(), t: new Date(), da: 'admin0', testo: 'Prossimo passo: ' + passo.testo }]) }));
                  setPasso(null);
                }}>Salva</AdmButton>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{t.passo.testo}</div>
                <div style={{ fontSize: 12.4, color: slScaduto(t) ? '#C40B45' : ADM.MUTED, fontWeight: 650, marginTop: 3 }}>{slQuando(t.passo.quando)}</div>
              </div>
              <AdmButton variant="secondary" size="sm" icon="check" onClick={() => {
                const fatto = t.passo.testo;
                slAggiorna(t.id, x => ({ passo: null, diario: x.diario.concat([{ id: 'd' + Date.now(), t: new Date(), da: 'admin0', testo: '✓ ' + fatto }]) }));
                setPasso({ testo: '', quando: slGiorno(2) });
              }}>Fatto</AdmButton>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {campo('Seguita da', (
          <AdmSelect value={t.chi} onChange={(v) => slAggiorna(t.id, { chi: v })}
            options={team.map(x => ({ value: x.id, label: x.isYou ? 'Tu (Marco Rinaldi)' : x.nome }))} buttonStyle={{ padding: '5px 10px 5px 12px', fontSize: 13 }}/>
        ))}
        {campo('Chiusura prevista', aperta ? <HubData valore={t.chiusura} onCambia={(d) => slAggiorna(t.id, { chiusura: d })} style={{ width: 170, padding: '6px 10px' }}/> : slQuando(t.chiusura))}
        {campo('Da dove arriva', t.fonte)}
        {campo('Aperta il', t.creata.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' }))}
      </div>

      {/* Il diario */}
      <div style={{ marginTop: 18, fontSize: 15, fontWeight: 750, letterSpacing: '-0.02em' }}>Diario</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <HubInput valore={nota} onCambia={setNota} placeholder="Aggiungi una nota: com'è andata la chiamata…"
          onKeyDown={(e) => { if (e.key === 'Enter' && nota.trim()) { slNota(t.id, nota.trim()); setNota(''); } }}/>
        <AdmButton variant="primary" size="md" disabled={!nota.trim()} onClick={() => { slNota(t.id, nota.trim()); setNota(''); }}>Aggiungi</AdmButton>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        {t.diario.slice().reverse().map(n => (
          <div key={n.id} style={{ display: 'flex', gap: 10 }}>
            <SlAvatar id={n.da} size={26}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.4, lineHeight: 1.45, color: ADM.TEXT }}>{n.testo}</div>
              <div style={{ fontSize: 11.4, color: ADM.MUTED_SOFT, marginTop: 2 }}>{n.t.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} · {n.t.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </div>
    </HubPannello>
  );
}

// ─── Nuova trattativa ──────────────────────────────────────────────────────
function SlNuova({ open, onClose, onCreata }) {
  const vuota = () => ({ localeId: '', prospect: '', citta: '', piano: 'plus', fase: 'contatto', fonte: SL_FONTI[0], passo: '', quando: slGiorno(1), chi: 'admin0' });
  const [f, setF] = useStateSl(vuota);
  useEffectSl(() => { if (open) setF(vuota()); }, [open]);
  const metti = (k, v) => setF(x => Object.assign({}, x, { [k]: v }));
  const ok = (f.localeId || f.prospect.trim()) && f.passo.trim();
  const locali = (typeof LOCALI !== 'undefined' ? LOCALI : []).slice().sort((a, b) => a.nome.localeCompare(b.nome));
  const crea = () => {
    const t = slCrea(f);
    onCreata(t.id);
  };
  return (
    <HubModale open={open} onClose={onClose} titolo="Nuova trattativa" sotto="Chi, quale piano, e la prossima cosa da fare. Il resto si aggiunge strada facendo." larghezza={600}
      footer={<React.Fragment><div style={{ flex: 1 }}/><AdmButton variant="ghost" size="md" onClick={onClose}>Annulla</AdmButton><AdmButton variant="primary" size="md" icon="plus" disabled={!ok} onClick={crea}>Crea trattativa</AdmButton></React.Fragment>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <HubCampo label="Locale" nota={f.localeId ? 'Legata alla scheda del locale in rubrica.' : 'Se il locale non ha ancora un account, scrivi solo il nome: resta un prospect.'}>
          <div style={{ display: 'flex', gap: 8 }}>
            <AdmSelect block value={f.localeId} onChange={(v) => metti('localeId', v)} maxHeight={260}
              options={[{ value: '', label: 'Non è in rubrica (prospect)' }].concat(locali.map(l => ({ value: l.id, label: l.nome + ' · ' + l.citta })))}
              buttonStyle={{ padding: '9px 12px 9px 14px' }}/>
          </div>
        </HubCampo>
        {!f.localeId && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <HubCampo label="Nome del locale"><HubInput valore={f.prospect} onCambia={(v) => metti('prospect', v)} placeholder="Es. Osteria Bonelli" autoFocus/></HubCampo>
            <HubCampo label="Città"><HubInput valore={f.citta} onCambia={(v) => metti('citta', v)} placeholder="Roma"/></HubCampo>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <HubCampo label="Piano">
            <AdmSelect block value={f.piano} onChange={(v) => metti('piano', v)} options={(typeof PIANI !== 'undefined' ? PIANI : []).filter(p => p.price > 0).map(p => ({ value: p.id, label: p.label + ' · ' + slEuro(p.price * 12) + '/anno' }))} buttonStyle={{ padding: '9px 12px 9px 14px' }}/>
          </HubCampo>
          <HubCampo label="Fase">
            <AdmSelect block value={f.fase} onChange={(v) => metti('fase', v)} options={SL_APERTE.map(id => ({ value: id, label: slFase(id).label }))} buttonStyle={{ padding: '9px 12px 9px 14px' }}/>
          </HubCampo>
          <HubCampo label="Da dove arriva">
            <AdmSelect block value={f.fonte} onChange={(v) => metti('fonte', v)} options={SL_FONTI} buttonStyle={{ padding: '9px 12px 9px 14px' }}/>
          </HubCampo>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <HubCampo label="Prossimo passo"><HubInput valore={f.passo} onCambia={(v) => metti('passo', v)} placeholder="Es. Fissare la demo"/></HubCampo>
          <HubCampo label="Entro"><HubData valore={f.quando} onCambia={(d) => metti('quando', d)}/></HubCampo>
        </div>
      </div>
    </HubModale>
  );
}

// Creare una trattativa: la usano il modulo qui sopra e Byuppino.
function slCrea(f) {
  const l = f.localeId ? slLocale(f.localeId) : null;
  const t = {
    id: slNuovoId(), localeId: f.localeId || null, prospect: l ? null : (f.prospect || '').trim(), citta: l ? null : (f.citta || '').trim() || '—',
    titolo: (l ? l.nome : f.prospect) + ' · ' + slPianoDi(f.piano).label, piano: f.piano, fase: f.fase || 'contatto', fonte: f.fonte || 'Contatto diretto',
    chi: f.chi || 'admin0', creata: new Date(), chiusura: slGiorno(30),
    passo: f.passo ? { testo: f.passo, quando: f.quando || slGiorno(1) } : null,
    diario: [{ id: 'c' + Date.now(), t: new Date(), da: 'admin0', testo: 'Trattativa aperta' + (f.daByuppino ? ' da Byuppino.' : '.') }],
  };
  slScrivi([t].concat(slLeggi()));
  return t;
}

// ═══ La pagina ═════════════════════════════════════════════════════════════
function DeskSalesPage() {
  const lista = slUsaStore();
  const [vista, setVista] = useStateSl('bacheca');
  const [aperta, setAperta] = useStateSl(null);
  const [nuova, setNuova] = useStateSl(false);
  const [trascina, setTrascina] = useStateSl(null);
  const [perdita, setPerdita] = useStateSl(null);
  const [cerca, setCerca] = useStateSl('');
  const [sort, setSort] = useStateSl({ campo: 'passo', verso: 'asc' });
  const n = slNumeri(lista);
  const q = cerca.trim().toLowerCase();
  const filtrate = lista.filter(t => !q || (slNome(t) + ' ' + slCitta(t) + ' ' + t.id + ' ' + (t.passo ? t.passo.testo : '')).toLowerCase().includes(q));
  const lascia = (id, fase) => {
    // Persa vuole il motivo: si apre la trattativa con la domanda già pronta.
    if (fase === 'persa') { setPerdita(id); setAperta(id); return; }
    slSposta(id, fase);
  };
  const ordina = (a, b) => (a.passo ? a.passo.quando : Infinity) - (b.passo ? b.passo.quando : Infinity);
  const perElenco = filtrate.slice().sort((a, b) => {
    const v = sort.verso === 'asc' ? 1 : -1;
    if (sort.campo === 'valore') return (slValore(a) - slValore(b)) * v;
    if (sort.campo === 'fase') return (SL_FASI.findIndex(f => f.id === a.fase) - SL_FASI.findIndex(f => f.id === b.fase)) * v;
    if (sort.campo === 'nome') return slNome(a).localeCompare(slNome(b)) * v;
    if (sort.campo === 'chiusura') return ((a.chiusura || 0) - (b.chiusura || 0)) * v;
    const pa = a.passo ? a.passo.quando.getTime() : 9e15, pb = b.passo ? b.passo.quando.getTime() : 9e15;
    return (pa - pb) * v;
  });

  return (
    <div style={{ padding: '22px 28px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <style>{SL_CSS}</style>
      <HubTestata titolo="Sales"
        sotto="Le trattative in corso: con chi stiamo parlando, a che punto siamo, quanto vale e qual è la prossima cosa da fare."
        azioni={<HubStrumento forte icona="plus" onClick={() => setNuova(true)}>Nuova trattativa</HubStrumento>}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        <HubTile icona="target" valore={slEuro(n.pipeline)} etichetta="Pipeline aperta, all'anno" sotto={n.aperte + ' trattative in corso'}/>
        <HubTile icona="gauge" valore={slEuro(n.ponderata)} etichetta="Ponderata sulla fase" sotto="quello che ci si può aspettare"/>
        <HubTile icona="trendUp" valore={n.vinteMese.length} tono="OK" etichetta="Vinte questo mese" sotto={slEuro(n.vinteMese.reduce((a, t) => a + slValore(t), 0)) + ' all\'anno'}/>
        <HubTile icona="flag" valore={n.scaduti} tono={n.scaduti ? 'DANGER' : null} etichetta="Passi in ritardo" sotto={'chiude il ' + n.tasso + '% · ultimi 90 giorni'}/>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HubSegmenti attivo={vista} onCambia={setVista} voci={[{ id: 'bacheca', label: 'Bacheca' }, { id: 'elenco', label: 'Elenco', conteggio: lista.length }]}/>
        <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca un locale, un passo…"/>
        <div style={{ flex: 1 }}/>
        {vista === 'bacheca' && <span style={{ fontSize: 12.6, color: ADM.MUTED, fontWeight: 600 }}>Trascina una scheda per cambiarne la fase</span>}
      </div>

      {vista === 'bacheca' ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {SL_APERTE.map(fase => (
            <SlColonna key={fase} fase={fase} voci={filtrate.filter(t => t.fase === fase).sort(ordina)}
              onApri={setAperta} trascina={trascina} onTrascina={setTrascina} onLascia={lascia}/>
          ))}
          <SlChiuse voci={filtrate.filter(t => !SL_APERTE.includes(t.fase))} onApri={setAperta} trascina={trascina} onTrascina={setTrascina} onLascia={lascia}/>
        </div>
      ) : (
        <AdmCard padding={0} style={{ overflow: 'hidden' }}>
          <HubTabella
            colonne={[
              { id: 'nome', label: 'Trattativa', w: '1.6fr' },
              { id: 'fase', label: 'Fase', w: '130px' },
              { id: 'valore', label: 'Valore', w: '120px', destra: true },
              { id: 'passo', label: 'Prossimo passo', w: '1.5fr' },
              { id: 'chiusura', label: 'Chiusura', w: '110px' },
              { id: 'chi', label: 'Chi', w: '50px', ordinabile: false },
            ]}
            righe={perElenco} chiave={t => t.id} onRiga={t => setAperta(t.id)}
            sort={sort} onSort={(c) => setSort(s => ({ campo: c, verso: s.campo === c && s.verso === 'asc' ? 'desc' : 'asc' }))}
            vuoto={<HubVuoto icona="target" titolo="Nessuna trattativa" desc="Prova a cercare in un altro modo."/>}
            cella={(c, t) => {
              if (c === 'nome') return <div><div style={{ fontSize: 14, fontWeight: 700 }}>{slNome(t)}</div><div style={{ fontSize: 12, color: ADM.MUTED, marginTop: 1 }}>{t.id} · {slCitta(t)} · {slPianoDi(t.piano).label}</div></div>;
              if (c === 'fase') return <SlPillolaFase fase={t.fase} piccola/>;
              if (c === 'valore') return <span style={{ fontSize: 14, fontWeight: 700 }}>{slEuro(slValore(t))}</span>;
              if (c === 'passo') return t.passo
                ? <div><div style={{ fontSize: 13.2, fontWeight: 600, color: slScaduto(t) ? '#C40B45' : ADM.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.passo.testo}</div><div style={{ fontSize: 11.8, color: slScaduto(t) ? '#C40B45' : ADM.MUTED, fontWeight: slScaduto(t) ? 700 : 500 }}>{slQuando(t.passo.quando)}{slScaduto(t) ? ' · in ritardo' : ''}</div></div>
                : <span style={{ fontSize: 12.6, color: ADM.MUTED_SOFT }}>{SL_APERTE.includes(t.fase) ? 'nessuno — aggiungilo' : t.fase === 'persa' ? t.motivo : '—'}</span>;
              if (c === 'chiusura') return <span style={{ fontSize: 12.8, color: ADM.MUTED }}>{slQuando(t.chiusaIl || t.chiusura)}</span>;
              if (c === 'chi') return <SlAvatar id={t.chi} size={26}/>;
              return null;
            }}/>
        </AdmCard>
      )}

      {aperta && <SlDettaglio id={aperta} chiediPerdita={perdita === aperta} onClose={() => { setAperta(null); setPerdita(null); }}/>}
      <SlNuova open={nuova} onClose={() => setNuova(false)} onCreata={(id) => {
        setNuova(false); setAperta(id);
        if (window.deskAvviso) window.deskAvviso({ testo: 'Trattativa ' + id + ' aperta', annulla: () => { slScrivi(slLeggi().filter(t => t.id !== id)); setAperta(null); } });
      }}/>
    </div>
  );
}

const SL_CSS = `
.sl-scheda { transition: transform 0.16s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.16s ease; }
.sl-scheda:hover { transform: translateY(-2px); box-shadow: 0 18px 30px -20px rgba(73,40,68,0.6) !important; }
.sl-scheda:active { cursor: grabbing; }
.sl-riga { transition: background 0.12s ease; }
.sl-riga:hover { background: #fff !important; }
`;

window.DeskSalesPage = DeskSalesPage;
window.slLeggi = slLeggi;
window.slCrea = slCrea;
window.slNumeri = slNumeri;
window.__slScrivi = slScrivi;
