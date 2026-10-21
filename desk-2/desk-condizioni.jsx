// Desk — Condizioni e vantaggi del locale (20 ottobre 2026)
//
// Una tab della scheda del locale per tutto quello che lo fa uscire dal
// listino, deciso a mano da noi:
//   · PREZZO DEL PIANO: un piano con lo sconto, a prezzo fisso o gratis, per
//     sempre, per N mesi o fino a una data — poi torna a listino da solo;
//   · PROMOZIONI dal catalogo (configurazione assistita, ordini oltre piano
//     inclusi, kit QR…), ognuna con la sua scadenza;
//   · VISIBILITÀ IN APP: il posizionamento del locale (in evidenza nella
//     città, primo nella categoria, nella Home…). Il motore dei posizionamenti
//     arriva dopo il lancio: qui si decide già, l'app lo leggerà;
//   · FEDELTÀ E PREMI: badge e premi del programma fedeltà (anche questo in
//     arrivo);
//   · UN REGALO, per l'assistenza: un mese gratis, ordini in più (passa dal
//     registro degli accrediti, con il suo tetto e il quattr'occhi), un kit…
//   · lo STORICO: ogni atto con chi, quando e perché; si revoca, non si
//     cancella.
//
// Le concessioni grosse — più di 3 mesi gratis, o più di HUB_LEVE-equivalenti
// 500 € di valore — nascono «in attesa»: le conferma un Super Admin diverso
// da chi le ha disposte, come gli accrediti (P-69). Nel prototipo la
// conferma si simula dallo storico.
//
// Prototipo: i dati vivono in COND_STORE, in memoria. Byuppino ci scrive con
// condApplicaPrezzo e condRegala («fai il 20% per 3 mesi alla Trattoria
// della Nonna», «regala un mese gratis a Sorbillo»).

const { useState: useStateCd, useEffect: useEffectCd } = React;

const COND_TIPI_PREZZO = [
  { id: 'listino', label: 'Listino' },
  { id: 'sconto',  label: 'Sconto %' },
  { id: 'fisso',   label: 'Prezzo fisso' },
  { id: 'gratis',  label: 'Gratis' },
];
const COND_DURATE = [
  { id: 'mesi',   label: 'Per N mesi' },
  { id: 'data',   label: 'Fino al' },
  { id: 'sempre', label: 'Per sempre' },
];
const COND_MOTIVI = ['Accordo commerciale', 'Assistenza / disservizio', 'Locale fondatore', 'Partnership', 'Lancio in città', 'Altro'];
const COND_PROMO = [
  { id: 'setup',    icona: 'sparkles',   t: 'Configurazione assistita', s: 'Menù, sale e stampanti li configuriamo noi', mesi: 1 },
  { id: 'oltre',    icona: 'layers',     t: 'Ordini oltre piano inclusi', s: 'Niente costo per gli ordini oltre il piano', mesi: 3 },
  { id: 'kitqr',    icona: 'grid',       t: 'Kit QR da tavolo in omaggio', s: 'Segnatavoli stampati e spediti', mesi: 0 },
  { id: 'amico',    icona: 'users',      t: 'Porta un amico', s: 'Un mese gratis per ogni locale che ci presenta', mesi: 12 },
  { id: 'annuale',  icona: 'calendar',   t: 'Annuale al prezzo di 10 mesi', s: 'Al prossimo rinnovo, se sceglie l\'annuale', mesi: 12 },
];
const COND_VISIBILITA = [
  { id: 'standard',  t: 'Standard',                  s: 'Come tutti: ordine dei risultati dell\'app' },
  { id: 'citta',     t: 'In evidenza nella sua città', s: 'Tra i primi nella mappa e nella ricerca della città' },
  { id: 'categoria', t: 'Primo nella sua categoria', s: 'In cima a «Pizzerie», «Trattorie»… nella sua zona' },
  { id: 'home',      t: 'Nella Home · «Da provare»', s: 'Nel carosello della Home dell\'app, in tutta Italia' },
];
const COND_DURATE_VIS = [{ id: 14, label: '2 settimane' }, { id: 30, label: '1 mese' }, { id: 90, label: '3 mesi' }, { id: 0, label: 'Fino a revoca' }];
const COND_FEDELTA = [
  { id: 'fondatore', icona: 'star',     t: 'Badge «Locale fondatore»', s: 'In app accanto al nome: è tra i primi a crederci' },
  { id: 'partner',   icona: 'shield',   t: 'Partner certificato byup', s: 'Badge e priorità nell\'assistenza' },
  { id: 'dodici',    icona: 'calendar', t: 'Un mese gratis ogni 12 pagati', s: 'Si accumula da solo, si scala dal rinnovo' },
  { id: 'cashback',  icona: 'money',    t: 'Cashback del 5% sul canone', s: 'Nei mesi sopra i 1.000 ordini' },
];
const COND_REGALI = [
  { id: 'mese',   icona: 'calendar', t: '1 mese gratis',            valore: (l) => condListino(l) },
  { id: 'unita',  icona: 'plus',     t: '500 ordini in più',        valore: () => 0, unita: 500 },
  { id: 'setup',  icona: 'sparkles', t: 'Configurazione assistita', valore: () => 0 },
  { id: 'kitqr',  icona: 'grid',     t: 'Kit QR da tavolo',         valore: () => 0 },
  { id: 'vis',    icona: 'eye',      t: '2 settimane in evidenza',  valore: () => 0 },
  { id: 'altro',  icona: 'pencil',   t: 'Altro…',                   valore: () => 0 },
];

const condEuro = (n) => '€ ' + new Intl.NumberFormat('it-IT', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(n);
const condPiano = (id) => (typeof PIANI !== 'undefined' ? PIANI : []).find(p => p.id === id) || { id, label: id, price: 0 };
const condListino = (l, piano) => condPiano(piano || l.piano).price;
const condData = (d) => d ? d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const condPiu = (giorni) => { const d = new Date(); d.setDate(d.getDate() + giorni); d.setHours(23, 59, 0, 0); return d; };
const condPiuMesi = (m) => { const d = new Date(); d.setMonth(d.getMonth() + m); return d; };
const condMe = () => (typeof hubUtenteCorrente === 'function' ? hubUtenteCorrente() : { id: 'admin0', nome: 'Marco Rinaldi' });

// ═══ Lo store ══════════════════════════════════════════════════════════════
const COND_STORE = { per: {}, ascolta: new Set() };
function condSeme(l) {
  const vuoto = { prezzo: null, promo: [], visibilita: null, fedelta: {}, registro: [] };
  // Due locali con qualcosa già concesso, per far vedere la tab piena.
  if (l.id === 'L1028') return Object.assign(vuoto, {
    prezzo: { piano: 'business', tipo: 'sconto', valore: 20, durata: 'mesi', mesi: 6, dal: condPiuMesi(-2), al: condPiuMesi(4), motivo: 'Locale fondatore', nota: 'Accordo firmato a Host: 20% sui primi sei mesi.', stato: 'attiva' },
    fedelta: { fondatore: true },
    registro: [
      { id: 'r1', t: condPiuMesi(-2), chi: 'admin0', cosa: 'Prezzo del piano', dett: 'Business −20% per 6 mesi · Locale fondatore', stato: 'attiva' },
      { id: 'r2', t: condPiuMesi(-2), chi: 'admin0', cosa: 'Fedeltà', dett: 'Badge «Locale fondatore» attivato', stato: 'attiva' },
    ] });
  if (l.id === 'L1021') return Object.assign(vuoto, {
    promo: [{ id: 'oltre', dal: condPiu(-20), al: condPiu(70) }],
    registro: [{ id: 'r1', t: condPiu(-20), chi: 'admin1', cosa: 'Promozione', dett: 'Ordini oltre piano inclusi fino al ' + condData(condPiu(70)), stato: 'attiva' }] });
  return vuoto;
}
function condDi(l) { if (!COND_STORE.per[l.id]) COND_STORE.per[l.id] = condSeme(l); return COND_STORE.per[l.id]; }
function condScrivi(l, fn) { COND_STORE.per[l.id] = Object.assign({}, condDi(l), fn(condDi(l))); COND_STORE.ascolta.forEach(f => f()); }
function condUsa(l) {
  const [, setN] = useStateCd(0);
  useEffectCd(() => { const f = () => setN(x => x + 1); COND_STORE.ascolta.add(f); return () => { COND_STORE.ascolta.delete(f); }; }, []);
  return condDi(l);
}
function condRegistra(l, cosa, dett, stato) {
  const r = { id: 'r' + Date.now() + Math.round(Math.random() * 99), t: new Date(), chi: condMe().id, cosa, dett, stato: stato || 'attiva' };
  condScrivi(l, c => ({ registro: [r].concat(c.registro) }));
  return r;
}

// Il calcolo del prezzo: quanto paga al mese, fino a quando, e quanto vale
// la concessione in tutto.
function condCalcola(l, p) {
  const listino = condListino(l, p.piano);
  const mese = p.tipo === 'listino' ? listino : p.tipo === 'sconto' ? Math.max(0, listino * (1 - (Number(p.valore) || 0) / 100)) : p.tipo === 'fisso' ? Math.max(0, Number(p.valore) || 0) : 0;
  const mesi = p.durata === 'mesi' ? Math.max(1, Number(p.mesi) || 1) : p.durata === 'data' && p.al ? Math.max(1, Math.round((p.al - Date.now()) / (30.4 * 864e5))) : 12;
  const al = p.durata === 'mesi' ? condPiuMesi(mesi) : p.durata === 'data' ? p.al : null;
  const concessione = Math.max(0, (listino - mese) * mesi);
  // Le grosse aspettano un secondo Super Admin.
  const grossa = (p.tipo === 'gratis' && mesi > 3) || concessione > 500 || (p.durata === 'sempre' && p.tipo !== 'listino');
  return { listino, mese, mesi, al, concessione, grossa };
}
function condDescriviPrezzo(l, p) {
  const c = condCalcola(l, p);
  const piano = condPiano(p.piano).label;
  const come = p.tipo === 'sconto' ? '−' + p.valore + '%' : p.tipo === 'fisso' ? condEuro(c.mese) + '/mese' : p.tipo === 'gratis' ? 'gratis' : 'a listino';
  const quanto = p.durata === 'sempre' ? 'per sempre' : p.durata === 'mesi' ? 'per ' + c.mesi + (c.mesi === 1 ? ' mese' : ' mesi') : 'fino al ' + condData(p.al);
  return piano + ' ' + come + (p.tipo === 'listino' ? '' : ' ' + quanto);
}

// Le due porte per chi sta fuori dalla tab (Byuppino).
function condApplicaPrezzo(l, p) {
  const c = condCalcola(l, p);
  const prima = condDi(l).prezzo, pianoPrima = l.piano, mrrPrima = l.mrr;
  const stato = c.grossa ? 'in_attesa' : 'attiva';
  const nuovo = Object.assign({}, p, { dal: new Date(), al: c.al, stato });
  if (stato === 'attiva' && p.piano !== l.piano) { l.piano = p.piano; l.mrr = condPiano(p.piano).price + (l.extras || 0); }
  condScrivi(l, () => ({ prezzo: p.tipo === 'listino' && p.piano === pianoPrima ? null : nuovo }));
  const r = condRegistra(l, 'Prezzo del piano', condDescriviPrezzo(l, p) + ' · ' + p.motivo + (p.nota ? ' · ' + p.nota : ''), stato);
  return { stato, calcolo: c, annulla: () => { l.piano = pianoPrima; l.mrr = mrrPrima; condScrivi(l, x => ({ prezzo: prima, registro: x.registro.filter(y => y.id !== r.id) })); } };
}
function condRegala(l, id, nota, motivo) {
  const g = COND_REGALI.find(x => x.id === id) || COND_REGALI[COND_REGALI.length - 1];
  let extra = '';
  if (g.unita && typeof admAccreditoDisponi === 'function') {
    const a = admAccreditoDisponi(l, g.unita, 'commerciale', 'Regalo dalla scheda · ' + (nota || motivo || ''));
    extra = a.stato === 'in_attesa' ? ' (accredito ' + a.id + ' in attesa di approvazione)' : ' (accredito ' + a.id + ')';
  }
  const r = condRegistra(l, 'Regalo', (id === 'altro' ? (nota || 'Regalo') : g.t) + extra + (motivo ? ' · ' + motivo : '') + (nota && id !== 'altro' ? ' · ' + nota : ''));
  return { titolo: id === 'altro' ? (nota || 'Regalo') : g.t, annulla: () => condScrivi(l, x => ({ registro: x.registro.filter(y => y.id !== r.id) })) };
}

// ═══ Pezzi ═════════════════════════════════════════════════════════════════
function CdSezione({ titolo, sotto, icona, badge, children, azione }) {
  return (
    <AdmCard padding={20}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <span style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: '#fff', boxShadow: '0 6px 14px -9px rgba(73,40,68,0.55)', color: ADM.DESK_PRUGNA }}>
          {React.createElement(BuIcons[icona], { size: 18 })}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 750, letterSpacing: '-0.02em' }}>{titolo}</span>
            {badge && <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#F1E3CF', color: '#6A4B1F' }}>{badge}</span>}
          </div>
          {sotto && <div style={{ fontSize: 12.8, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>{sotto}</div>}
        </div>
        {azione}
      </div>
      {children}
    </AdmCard>
  );
}
function CdEtichetta({ children }) { return <div style={{ fontSize: 12.4, fontWeight: 700, color: ADM.MUTED, marginBottom: 6 }}>{children}</div>; }
function cdAvviso(testo, annulla) { if (window.deskAvviso) window.deskAvviso({ testo, annulla }); }

// ─── Prezzo del piano ──────────────────────────────────────────────────────
function CdPrezzo({ l, c }) {
  const att = c.prezzo;
  const [f, setF] = useStateCd(() => att ? Object.assign({}, att) : { piano: l.piano === 'free' ? 'starter' : l.piano, tipo: 'sconto', valore: 20, durata: 'mesi', mesi: 3, al: condPiuMesi(3), motivo: COND_MOTIVI[0], nota: '' });
  const metti = (k, v) => setF(x => Object.assign({}, x, { [k]: v }));
  const k = condCalcola(l, f);
  const piani = (typeof PIANI !== 'undefined' ? PIANI : []);
  const applica = () => {
    const esito = condApplicaPrezzo(l, f);
    cdAvviso(esito.stato === 'in_attesa' ? 'Condizione in attesa: la conferma un altro Super Admin' : 'Prezzo applicato a ' + l.nome, esito.annulla);
  };
  return (
    <CdSezione icona="crown" titolo="Piano e prezzo" sotto="Un piano a prezzo diverso dal listino: con lo sconto, a prezzo fisso o gratis, per un periodo. Finito il periodo torna a listino da solo.">
      {att && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 16, background: att.stato === 'in_attesa' ? '#FAF1DC' : '#EAF5EF', marginBottom: 14 }}>
          <BuIcons.checkCircle size={18} color={att.stato === 'in_attesa' ? ADM.WARN : '#1F5A43'}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.4, fontWeight: 750 }}>{att.stato === 'in_attesa' ? 'In attesa di conferma · ' : 'Adesso · '}{condDescriviPrezzo(l, att)}</div>
            <div style={{ fontSize: 12, color: ADM.MUTED, marginTop: 1 }}>{att.motivo}{att.al ? ' · torna a listino il ' + condData(att.al) : ''}</div>
          </div>
          <AdmButton variant="ghost" size="sm" onClick={() => {
            const prima = att;
            condScrivi(l, () => ({ prezzo: null })); const r = condRegistra(l, 'Prezzo del piano', 'Riportato a listino', 'revocata');
            cdAvviso('Prezzo riportato a listino', () => condScrivi(l, x => ({ prezzo: prima, registro: x.registro.filter(y => y.id !== r.id) })));
          }}>Torna a listino</AdmButton>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 12 }}>
        <div>
          <CdEtichetta>Piano</CdEtichetta>
          <AdmSelect block value={f.piano} onChange={(v) => metti('piano', v)} options={piani.filter(p => p.price > 0).map(p => ({ value: p.id, label: p.label + ' · ' + condEuro(p.price) + '/mese' }))} buttonStyle={{ padding: '9px 12px 9px 14px' }}/>
        </div>
        <div>
          <CdEtichetta>Prezzo</CdEtichetta>
          <HubSegmenti attivo={f.tipo} onCambia={(v) => metti('tipo', v)} voci={COND_TIPI_PREZZO}/>
        </div>
      </div>
      {(f.tipo === 'sconto' || f.tipo === 'fisso') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <HubInput tipo="number" valore={f.valore} onCambia={(v) => metti('valore', v)} style={{ width: 110 }}/>
          <span style={{ fontSize: 13, color: ADM.MUTED, fontWeight: 600 }}>{f.tipo === 'sconto' ? '% di sconto sul listino' : '€ al mese invece di ' + condEuro(k.listino)}</span>
          {f.tipo === 'sconto' && [10, 20, 30, 50].map(v => (
            <button key={v} onClick={() => metti('valore', v)} style={{ padding: '6px 11px', borderRadius: 999, border: '1px solid rgba(73,40,68,0.12)', background: Number(f.valore) === v ? ADM.INCHIOSTRO : '#fff', color: Number(f.valore) === v ? '#fff' : ADM.TEXT, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.4, fontWeight: 700 }}>{v}%</button>
          ))}
        </div>
      )}
      {f.tipo !== 'listino' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          <HubSegmenti attivo={f.durata} onCambia={(v) => metti('durata', v)} voci={COND_DURATE}/>
          {f.durata === 'mesi' && <React.Fragment><HubInput tipo="number" valore={f.mesi} onCambia={(v) => metti('mesi', v)} style={{ width: 80 }}/><span style={{ fontSize: 13, color: ADM.MUTED, fontWeight: 600 }}>mesi</span></React.Fragment>}
          {f.durata === 'data' && <HubData valore={f.al} onCambia={(d) => metti('al', d)} style={{ width: 170 }}/>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 12, marginTop: 12 }}>
        <div><CdEtichetta>Motivo</CdEtichetta><AdmSelect block value={f.motivo} onChange={(v) => metti('motivo', v)} options={COND_MOTIVI} buttonStyle={{ padding: '9px 12px 9px 14px' }}/></div>
        <div><CdEtichetta>Nota (resta nello storico)</CdEtichetta><HubInput valore={f.nota} onCambia={(v) => metti('nota', v)} placeholder="Es. passa al Plus se gli facciamo lo sconto sui primi mesi"/></div>
      </div>

      {/* L'anteprima: cosa paga, fino a quando, quanto ci costa */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, padding: '14px 16px', borderRadius: 18, background: 'linear-gradient(150deg, #4A2945 0%, #2C1729 100%)', color: '#fff' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 750, letterSpacing: '-0.04em' }}>{k.mese === 0 ? 'Gratis' : condEuro(Math.round(k.mese * 100) / 100)}</span>
            {k.mese !== k.listino && <span style={{ fontSize: 14, opacity: 0.6, textDecoration: 'line-through' }}>{condEuro(k.listino)}</span>}
            {k.mese !== 0 && <span style={{ fontSize: 12.4, opacity: 0.7 }}>/mese</span>}
          </div>
          <div style={{ fontSize: 12.4, opacity: 0.75, marginTop: 4 }}>
            {f.tipo === 'listino' ? 'Piano ' + condPiano(f.piano).label + ' a listino' : (f.durata === 'sempre' ? 'Per sempre' : 'Dal ' + condData(new Date()) + ' al ' + condData(k.al) + ', poi ' + condEuro(k.listino) + '/mese')}
            {k.concessione > 0 && f.durata !== 'sempre' ? ' · ci costa ' + condEuro(Math.round(k.concessione)) : ''}
          </div>
          {k.grossa && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.8, fontWeight: 750, marginTop: 7, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.14)' }}><BuIcons.lock size={12}/>La conferma un altro Super Admin</div>}
        </div>
        <button onClick={applica} style={{ padding: '11px 18px', borderRadius: 999, border: 'none', cursor: 'pointer', background: '#fff', color: '#2C1729', fontFamily: 'inherit', fontWeight: 800, fontSize: 14 }}>
          {k.grossa ? 'Chiedi conferma' : 'Applica'}
        </button>
      </div>
    </CdSezione>
  );
}

// ─── Promozioni ────────────────────────────────────────────────────────────
function CdPromo({ l, c }) {
  return (
    <CdSezione icona="tag" titolo="Promozioni" sotto="Dal catalogo delle promozioni, ognuna con la sua scadenza.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {COND_PROMO.map(p => {
          const att = c.promo.find(x => x.id === p.id);
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 16, background: att ? '#EAF5EF' : 'rgba(255,255,255,0.7)', border: '1px solid ' + (att ? '#CBE6D7' : 'rgba(73,40,68,0.07)') }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#fff', color: att ? '#1F5A43' : ADM.MUTED, flexShrink: 0 }}>{React.createElement(BuIcons[p.icona], { size: 15 })}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.4, fontWeight: 700 }}>{p.t}</span>
                <span style={{ display: 'block', fontSize: 11.8, color: att ? '#1F5A43' : ADM.MUTED, marginTop: 1, fontWeight: att ? 650 : 400 }}>{att ? (att.al ? 'Attiva fino al ' + condData(att.al) : 'Data una volta') : p.s}</span>
              </span>
              {att ? (
                <AdmButton variant="ghost" size="sm" onClick={() => {
                  condScrivi(l, x => ({ promo: x.promo.filter(y => y.id !== p.id) })); const r = condRegistra(l, 'Promozione', p.t + ' tolta', 'revocata');
                  cdAvviso('Promozione tolta', () => condScrivi(l, x => ({ promo: x.promo.concat([att]), registro: x.registro.filter(y => y.id !== r.id) })));
                }}>Togli</AdmButton>
              ) : (
                <AdmButton variant="secondary" size="sm" icon="plus" onClick={() => {
                  const nuova = { id: p.id, dal: new Date(), al: p.mesi ? condPiuMesi(p.mesi) : null };
                  condScrivi(l, x => ({ promo: x.promo.concat([nuova]) })); const r = condRegistra(l, 'Promozione', p.t + (nuova.al ? ' fino al ' + condData(nuova.al) : ''));
                  cdAvviso('Promozione applicata', () => condScrivi(l, x => ({ promo: x.promo.filter(y => y.id !== p.id), registro: x.registro.filter(y => y.id !== r.id) })));
                }}>Applica</AdmButton>
              )}
            </div>
          );
        })}
      </div>
    </CdSezione>
  );
}

// ─── Visibilità in app ─────────────────────────────────────────────────────
function CdVisibilita({ l, c }) {
  const att = c.visibilita;
  const [scelta, setScelta] = useStateCd(att ? att.id : 'standard');
  const [durata, setDurata] = useStateCd(30);
  const vet = typeof vetAttiva === 'function' ? vetAttiva(l) : null;
  const applica = () => {
    const prima = att;
    const v = scelta === 'standard' ? null : { id: scelta, dal: new Date(), al: durata ? condPiu(durata) : null };
    condScrivi(l, () => ({ visibilita: v }));
    const o = COND_VISIBILITA.find(x => x.id === scelta);
    const r = condRegistra(l, 'Visibilità in app', scelta === 'standard' ? 'Tornato a standard' : o.t + (v.al ? ' fino al ' + condData(v.al) : ' fino a revoca'), scelta === 'standard' ? 'revocata' : 'attiva');
    cdAvviso(scelta === 'standard' ? 'Visibilità standard' : 'Posizionamento deciso: ' + o.t, () => condScrivi(l, x => ({ visibilita: prima, registro: x.registro.filter(y => y.id !== r.id) })));
  };
  return (
    <CdSezione icona="eye" titolo="Visibilità in app" badge="dal lancio dei posizionamenti"
      sotto="Dove compare il locale nell'app dei clienti. Il motore dei posizionamenti arriva dopo il lancio: quello che decidi qui l'app lo leggerà.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {COND_VISIBILITA.map(o => {
          const on = scelta === o.id;
          return (
            <button key={o.id} onClick={() => setScelta(o.id)} style={{
              textAlign: 'left', padding: '11px 12px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit',
              border: '1.5px solid ' + (on ? ADM.INCHIOSTRO : 'rgba(73,40,68,0.08)'), background: on ? '#fff' : 'rgba(255,255,255,0.6)',
              boxShadow: on ? '0 10px 22px -16px rgba(73,40,68,0.6)' : 'none',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid ' + (on ? ADM.INCHIOSTRO : 'rgba(73,40,68,0.25)'), display: 'grid', placeItems: 'center' }}>{on && <span style={{ width: 7, height: 7, borderRadius: '50%', background: ADM.INCHIOSTRO }}/>}</span>
                <span style={{ fontSize: 13.2, fontWeight: 750, color: ADM.TEXT }}>{o.t}</span>
              </span>
              <span style={{ display: 'block', fontSize: 11.8, color: ADM.MUTED, marginTop: 4, lineHeight: 1.4 }}>{o.s}</span>
              {att && att.id === o.id && <span style={{ display: 'block', fontSize: 11.4, fontWeight: 750, color: '#1F5A43', marginTop: 5 }}>Attivo {att.al ? 'fino al ' + condData(att.al) : 'fino a revoca'}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        {scelta !== 'standard' && <AdmSelect value={durata} onChange={(v) => setDurata(Number(v))} options={COND_DURATE_VIS.map(d => ({ value: d.id, label: d.label }))}/>}
        <div style={{ flex: 1, fontSize: 12, color: ADM.MUTED }}>
          {vet ? <span>Ha anche la <b>Vetrina speciale</b> fino al {condData(vet.al)} (si gestisce da Account).</span> : 'La Vetrina speciale resta in Account, con il suo registro.'}
        </div>
        <AdmButton variant="primary" size="sm" onClick={applica} disabled={(att ? att.id : 'standard') === scelta && scelta === 'standard'}>Applica</AdmButton>
      </div>
    </CdSezione>
  );
}

// ─── Fedeltà e premi ───────────────────────────────────────────────────────
function CdFedelta({ l, c }) {
  return (
    <CdSezione icona="star" titolo="Fedeltà e premi" badge="in arrivo" sotto="Badge e premi del programma fedeltà dei locali. Si accendono già qui; li applica il programma quando parte.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {COND_FEDELTA.map(x => {
          const on = !!c.fedelta[x.id];
          return (
            <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 4px' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', background: on ? '#FFF1D6' : '#F3EEF0', color: on ? '#B7791F' : ADM.MUTED, flexShrink: 0 }}>{React.createElement(BuIcons[x.icona], { size: 15 })}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.4, fontWeight: 700 }}>{x.t}</span>
                <span style={{ display: 'block', fontSize: 11.8, color: ADM.MUTED, marginTop: 1 }}>{x.s}</span>
              </span>
              <AdmSwitch size="sm" checked={on} onChange={(v) => {
                condScrivi(l, z => ({ fedelta: Object.assign({}, z.fedelta, { [x.id]: v }) }));
                const r = condRegistra(l, 'Fedeltà', x.t + (v ? ' attivato' : ' tolto'), v ? 'attiva' : 'revocata');
                cdAvviso(x.t + (v ? ' attivato' : ' tolto'), () => condScrivi(l, z => ({ fedelta: Object.assign({}, z.fedelta, { [x.id]: !v }), registro: z.registro.filter(y => y.id !== r.id) })));
              }}/>
            </div>
          );
        })}
      </div>
    </CdSezione>
  );
}

// ─── Un regalo ─────────────────────────────────────────────────────────────
function CdRegalo({ l }) {
  const [scelto, setScelto] = useStateCd(null);
  const [nota, setNota] = useStateCd('');
  const [motivo, setMotivo] = useStateCd('Assistenza / disservizio');
  const [avvisa, setAvvisa] = useStateCd(true);
  const g = COND_REGALI.find(x => x.id === scelto);
  const regala = () => {
    const esito = condRegala(l, scelto, nota.trim(), motivo);
    cdAvviso('Regalo a ' + l.nome + ': ' + esito.titolo + (avvisa ? ' · il locale riceve il messaggio' : ''), esito.annulla);
    setScelto(null); setNota('');
  };
  return (
    <CdSezione icona="gift" titolo="Fai un regalo" sotto="Per l'assistenza o per dire grazie: un mese, ordini in più, un kit. Resta nello storico, e il locale lo trova nella bacheca del gestionale.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        {COND_REGALI.map(x => {
          const on = scelto === x.id;
          return (
            <button key={x.id} onClick={() => setScelto(on ? null : x.id)} style={{
              padding: '12px 10px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
              border: '1.5px solid ' + (on ? ADM.PINK : 'rgba(73,40,68,0.08)'), background: on ? '#FFF1F4' : 'rgba(255,255,255,0.7)',
            }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', margin: '0 auto', display: 'grid', placeItems: 'center', background: on ? ADM.PINK : '#fff', color: on ? '#fff' : ADM.DESK_PRUGNA, boxShadow: '0 6px 14px -9px rgba(73,40,68,0.5)' }}>{React.createElement(BuIcons[x.icona], { size: 16 })}</span>
              <span style={{ display: 'block', fontSize: 12.6, fontWeight: 750, marginTop: 7, color: ADM.TEXT, lineHeight: 1.25 }}>{x.t}</span>
              {x.valore(l) > 0 && <span style={{ display: 'block', fontSize: 11, color: ADM.MUTED, marginTop: 2 }}>vale {condEuro(x.valore(l))}</span>}
            </button>
          );
        })}
      </div>
      {g && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, animation: 'hubFlyIn 0.15s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10 }}>
            <AdmSelect block value={motivo} onChange={setMotivo} options={COND_MOTIVI} buttonStyle={{ padding: '9px 12px 9px 14px' }}/>
            <HubInput valore={nota} onCambia={setNota} placeholder={scelto === 'altro' ? 'Cosa regali? Es. cena per due con lo staff' : 'Perché? Es. stampante ferma sabato sera'} autoFocus/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AdmSwitch size="sm" checked={avvisa} onChange={setAvvisa}/>
            <span style={{ flex: 1, fontSize: 12.6, color: ADM.MUTED }}>Avvisa il locale nella bacheca del gestionale</span>
            {g.unita && <span style={{ fontSize: 11.8, color: ADM.MUTED_SOFT }}>passa dal registro degli accrediti</span>}
            <AdmButton variant="cta" size="sm" icon="gift" disabled={scelto === 'altro' && !nota.trim()} onClick={regala}>Regala</AdmButton>
          </div>
        </div>
      )}
    </CdSezione>
  );
}

// ─── Lo storico ────────────────────────────────────────────────────────────
function CdStorico({ l, c }) {
  const nome = (id) => typeof admNomeMembro === 'function' ? admNomeMembro(id) : id;
  const io = condMe().id;
  const stati = { attiva: { t: 'Attiva', bg: '#EAF5EF', fg: '#1F5A43' }, in_attesa: { t: 'In attesa', bg: '#FAF1DC', fg: '#92400E' }, revocata: { t: 'Chiusa', bg: '#F3EEF0', fg: ADM.MUTED } };
  return (
    <CdSezione icona="clock" titolo="Storico" sotto="Ogni condizione, promozione e regalo: chi, quando e perché. Le condizioni si chiudono, non si cancellano.">
      {c.registro.length === 0 && <div style={{ fontSize: 13, color: ADM.MUTED, padding: '6px 0 2px' }}>Tutto a listino: nessuna condizione speciale finora.</div>}
      {c.registro.map((r, i) => {
        const st = stati[r.stato] || stati.attiva;
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? `1px solid ${ADM.BORDER_SOFT}` : 'none' }}>
            <span style={{ width: 92, flexShrink: 0, fontSize: 12, color: ADM.MUTED }}>{condData(r.t)}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.2, fontWeight: 700 }}>{r.cosa}</span>
              <span style={{ display: 'block', fontSize: 12.2, color: ADM.MUTED, marginTop: 1 }}>{r.dett}</span>
            </span>
            <span style={{ fontSize: 12, color: ADM.MUTED, whiteSpace: 'nowrap' }}>{nome(r.chi)}</span>
            <span style={{ fontSize: 11.4, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: st.bg, color: st.fg, whiteSpace: 'nowrap' }}>{st.t}</span>
            {r.stato === 'in_attesa' && (
              <AdmButton variant="ghost" size="sm" onClick={() => {
                // Nel prototipo la conferma del secondo Super Admin si simula
                // qui: chi l'ha disposta non può confermarla davvero.
                condScrivi(l, x => ({ registro: x.registro.map(y => y.id === r.id ? Object.assign({}, y, { stato: 'attiva', dett: y.dett + ' · confermata da Laura Bianchi' }) : y),
                  prezzo: x.prezzo && x.prezzo.stato === 'in_attesa' ? Object.assign({}, x.prezzo, { stato: 'attiva' }) : x.prezzo }));
                if (c.prezzo && c.prezzo.stato === 'in_attesa' && c.prezzo.piano !== l.piano) { l.piano = c.prezzo.piano; l.mrr = condPiano(c.prezzo.piano).price + (l.extras || 0); }
                cdAvviso('Confermata (simulazione del secondo Super Admin)');
              }}>{r.chi === io ? 'Simula conferma' : 'Conferma'}</AdmButton>
            )}
          </div>
        );
      })}
    </CdSezione>
  );
}

// ═══ La tab ════════════════════════════════════════════════════════════════
function DrwCondizioni({ locale: l }) {
  const c = condUsa(l);
  const chip = [];
  if (c.prezzo) chip.push({ t: condDescriviPrezzo(l, c.prezzo) + (c.prezzo.stato === 'in_attesa' ? ' · in attesa' : ''), i: 'crown' });
  c.promo.forEach(p => { const d = COND_PROMO.find(x => x.id === p.id); if (d) chip.push({ t: d.t, i: d.icona }); });
  if (c.visibilita) chip.push({ t: (COND_VISIBILITA.find(x => x.id === c.visibilita.id) || {}).t, i: 'eye' });
  COND_FEDELTA.filter(x => c.fedelta[x.id]).forEach(x => chip.push({ t: x.t, i: x.icona }));
  return (
    <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '12px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)' }}>
        <span style={{ fontSize: 13, fontWeight: 750 }}>Rispetto al listino:</span>
        {chip.length === 0 && <span style={{ fontSize: 13, color: ADM.MUTED }}>niente di diverso — piano {condPiano(l.piano).label} a {condEuro(condListino(l))}/mese</span>}
        {chip.map((x, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, background: '#fff', fontSize: 12.4, fontWeight: 700, boxShadow: '0 4px 12px -8px rgba(73,40,68,0.5)' }}>
            {React.createElement(BuIcons[x.i], { size: 13 })}{x.t}
          </span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <CdPrezzo key={l.id} l={l} c={c}/>
          <CdPromo l={l} c={c}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <CdRegalo l={l}/>
          <CdVisibilita key={l.id} l={l} c={c}/>
          <CdFedelta l={l} c={c}/>
        </div>
      </div>
      <CdStorico l={l} c={c}/>
    </div>
  );
}

window.DrwCondizioni = DrwCondizioni;
window.condApplicaPrezzo = condApplicaPrezzo;
window.condRegala = condRegala;
window.condCalcola = condCalcola;
window.condDescriviPrezzo = condDescriviPrezzo;
window.COND_REGALI = COND_REGALI;
