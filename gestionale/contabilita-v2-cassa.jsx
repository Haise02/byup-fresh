// Tab Cassa v2 — elenco chiusure cassa (storico quadrature)

// ─── Trasmissione all'Agenzia delle Entrate ────────────────────────────────
// Il canale è la procedura "documento commerciale online" (via OpenAPI): ogni
// documento parte DA SOLO e in tempo reale, non esiste un invio unico a fine
// giornata. Lo stato di trasmissione appartiene quindi al singolo scontrino —
// id di trasmissione, esito, tentativi, timestamp, motivo dello scarto,
// gestione — e la riga della chiusura non ha uno stato proprio: è solo il
// riepilogo dei documenti di quel giorno.
// Conseguenza pratica: uno scarto isola UN documento, il resto della giornata
// resta trasmesso.

// Storico chiusure: per ogni giornata il totale incassato, di cui contanti e
// non contanti. `docSpec` descrive la giornata di documenti da generare.
const CASH_CLOSURES = [
  { id:'cc-12', date:'12/03/2025', contanti: 642.30, nonContanti: 1180.50, docSpec:{ n: 26 } },
  { id:'cc-11', date:'11/03/2025', contanti: 528.00, nonContanti: 1342.10, docSpec:{ n: 24 } },
  // La giornata "viva": 34 documenti, uno scartato e non ancora gestito (è lui
  // che tiene acceso il pallino), uno in coda di ritrasmissione, un reso e un
  // annullo.
  { id:'cc-10', date:'10/03/2025', contanti: 711.40, nonContanti:  980.75,
    docSpec:{ n: 34, reso: 18.50, annullo: 12.00, ritrasmissioni: 1, scarto:'aliquota' } },
  { id:'cc-09', date:'09/03/2025', contanti: 489.20, nonContanti: 1520.00, docSpec:{ n: 30 } },
  { id:'cc-08', date:'08/03/2025', contanti: 856.90, nonContanti: 2104.30, docSpec:{ n: 38 } },
  { id:'cc-07', date:'07/03/2025', contanti: 402.10, nonContanti:  765.40, docSpec:{ n: 19 } },
  // Scarto già gestito: resta a memoria, ma non suona più.
  { id:'cc-06', date:'06/03/2025', contanti: 615.70, nonContanti: 1188.20,
    docSpec:{ n: 28, scarto:'aliquota', gestito:{ quando:'07/03/2025 09:20', come:'manuale',
      nota:'Aliquota corretta al 10% sul prodotto e documento ritrasmesso a mano.' } } },
  { id:'cc-05', date:'05/03/2025', contanti: 733.50, nonContanti: 1402.60, docSpec:{ n: 31 } },
  { id:'cc-04', date:'04/03/2025', contanti: 388.90, nonContanti:  902.40, docSpec:{ n: 21 } },
  { id:'cc-03', date:'03/03/2025', contanti: 561.20, nonContanti: 1265.80, docSpec:{ n: 27 } },
];

// I motivi di scarto, in italiano: il codice dell'Agenzia non dice niente a
// chi deve rimediare, e il rimedio sta sempre su un'altra schermata.
const CC_SCARTI = {
  aliquota: {
    motivo:   'L\'aliquota IVA della riga "Tagliere salumi e formaggi" non è valida',
    causa:    'Il prodotto è passato in cassa con un\'aliquota non prevista per la somministrazione. L\'Agenzia rifiuta l\'intero documento, non la singola riga.',
    azione:   'Correggi l\'aliquota del prodotto nel catalogo, poi ritrasmetti il documento.',
    vaiLabel: 'Apri Impostazioni → Menù',
    vaiHref:  'byup Impostazioni.html?page=menu-cucina&sub=libreria',
  },
};

// ─── Generazione dei documenti ─────────────────────────────────────────────
// Deterministica dall'id della giornata: gli stessi documenti a ogni render e
// a ogni ricarico (con Math.random ballerebbero sotto gli occhi). Gli importi
// sono costruiti per sommare ESATTAMENTE ai contanti e al non contante della
// riga: è quella la quadratura che il ristoratore verifica.
function ccSeed(str) {
  let s = 0;
  for (let i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const ccR2 = (n) => Math.round(n * 100) / 100;
// Il meno va davanti al simbolo, come nella quadratura: "− € 18.50",
// non "€ -18.50".
const ccEuro = (n) => (n < 0 ? `− € ${Math.abs(n).toFixed(2)}` : `€ ${n.toFixed(2)}`);

// Ripartisce `tot` in `n` importi a due decimali che sommano esatto.
function ccSplit(tot, n, rnd) {
  const pesi = Array.from({length: n}, () => 0.55 + rnd());
  const somma = pesi.reduce((s, p) => s + p, 0);
  const out = pesi.map(p => ccR2(tot * p / somma));
  const delta = ccR2(tot - out.reduce((s, v) => s + v, 0));
  out[n - 1] = ccR2(out[n - 1] + delta);
  return out;
}

const CC_DOCS = {};
function ccDocs(c) {
  if (!CC_DOCS[c.id]) CC_DOCS[c.id] = ccBuildDocs(c);
  return CC_DOCS[c.id];
}

function ccBuildDocs(c) {
  const sp = c.docSpec || {};
  const rnd = ccSeed(c.id);
  const nTot = sp.n || 24;
  const resoAbs = sp.reso || 0;
  const annulloImp = sp.annullo || 0;
  const nVend = nTot - (resoAbs ? 1 : 0) - (annulloImp ? 1 : 0);

  // Il reso è in contanti: le vendite in contanti devono coprirlo, così il
  // netto della giornata torna al totale della riga.
  const targetCash = ccR2(c.contanti + resoAbs);
  const targetCard = c.nonContanti;
  const nCash = Math.max(1, Math.min(nVend - 1,
    Math.round(nVend * targetCash / (targetCash + targetCard))));
  const nCard = nVend - nCash;

  const docs = [];
  const aggiungi = (importo, pagamento, tipo) => {
    const r = rnd() < 0.24 ? 22 : 10;            // bevande e alcolici al 22
    const iva = ccR2(importo * r / (100 + r));
    docs.push({
      importo: ccR2(importo), pagamento, tipo, aliquota: r,
      iva10: r === 10 ? iva : 0,
      iva22: r === 22 ? iva : 0,
    });
  };
  ccSplit(targetCash, nCash, rnd).forEach(v => aggiungi(v, 'Contanti', 'vendita'));
  ccSplit(targetCard, nCard, rnd).forEach(v => aggiungi(v, rnd() < 0.55 ? 'Carta' : 'byup', 'vendita'));
  if (resoAbs) aggiungi(-resoAbs, 'Contanti', 'reso');
  // L'annullo mostra l'importo del documento annullato ma non entra nei totali.
  if (annulloImp) aggiungi(annulloImp, 'Carta', 'annullo');

  // Orari: due servizi, pranzo e cena. Si ordina per ora e si numera dopo.
  docs.forEach(d => {
    const cena = rnd() < 0.62;
    d._m = (cena ? 19 * 60 : 12 * 60) + Math.floor(rnd() * (cena ? 265 : 175));
  });
  docs.sort((a, b) => a._m - b._m);
  const gg = c.date.slice(0, 2), mm = c.date.slice(3, 5);
  docs.forEach((d, i) => {
    const prog = String(i + 1).padStart(4, '0');
    d.id = `${c.id}-${prog}`;
    d.num = `0001-${prog}`;
    d.ora = `${String(Math.floor(d._m / 60)).padStart(2,'0')}:${String(d._m % 60).padStart(2,'0')}`;
    delete d._m;
    d.tx = {
      esito: 'ok',
      idTrasm: `AE-25${mm}${gg}-${prog}`,
      inviato: `${c.date} ${d.ora}`,
      tentativi: 1,
    };
  });

  // Gli esiti speciali cadono su documenti fissi della giornata, così la scena
  // è sempre la stessa: uno scarto a metà servizio, una coda poco dopo.
  const iScarto = Math.floor(docs.length * 0.45);
  const iCoda = Math.floor(docs.length * 0.70);
  if (sp.scarto) {
    const d = docs[iScarto];
    d.tx = {
      idTrasm: null, inviato: null, tentativi: 3,
      scarto: { ...CC_SCARTI[sp.scarto], rilevato: `${c.date} ${d.ora}` },
    };
    if (sp.gestito) d.tx.gestito = sp.gestito;
  }
  for (let k = 0; k < (sp.ritrasmissioni || 0); k++) {
    const d = docs[iCoda + k];
    if (!d || d.tx.scarto) continue;
    d.tx = { esito:'ritrasmissione', idTrasm: null, inviato: null, tentativi: 2, prossimo: '14:30' };
  }
  return docs;
}

// Totali della giornata, derivati dai documenti: l'annullo non conta, il reso
// sottrae. È questa la quadratura mostrata in testa al dettaglio.
const CC_TOT = {};
function ccTotali(c) {
  if (CC_TOT[c.id]) return CC_TOT[c.id];
  const docs = ccDocs(c);
  let vendite = 0, resi = 0, nAnnulli = 0, iva10 = 0, iva22 = 0;
  docs.forEach(d => {
    if (d.tipo === 'annullo') { nAnnulli++; return; }
    if (d.tipo === 'reso') resi += -d.importo; else vendite += d.importo;
    iva10 += d.iva10; iva22 += d.iva22;
  });
  CC_TOT[c.id] = {
    n: docs.length, vendite: ccR2(vendite), resi: ccR2(resi), nAnnulli,
    totale: ccR2(vendite - resi), iva10: ccR2(iva10), iva22: ccR2(iva22),
  };
  return CC_TOT[c.id];
}

// ─── Scarti: cosa ha fatto il ristoratore, per DOCUMENTO ───────────────────
// Stesso pattern di byupReadModules/byupWriteModules: localStorage + evento,
// così il pallino sopravvive al ricarico. È il punto della misura: un
// documento scartato non si "dimentica" da solo.
const BYUP_FISC_KEY = 'byup_fisc_documenti';
window.byupReadFisc = function () {
  try { const s = localStorage.getItem(BYUP_FISC_KEY); return s ? JSON.parse(s) : {}; }
  catch (e) { return {}; }
};
window.byupWriteFisc = function (v) {
  try { localStorage.setItem(BYUP_FISC_KEY, JSON.stringify(v)); } catch (e) {}
  // Notifica i listener della stessa pagina (storage fira solo per altre tab)
  window.dispatchEvent(new Event('byup-fisc-change'));
};

const fiscOra = () => {
  const d = new Date();
  return `${ccFmtDate(d)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
const fiscFraMinuti = (m) => {
  const d = new Date(Date.now() + m * 60000);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
// 'gg/mm/aaaa HH:MM' → chiave ordinabile: il log deve stare in ordine di
// accadimento anche se un timestamp arriva dal mock e un altro dall'orologio.
const fiscOrdine = (t) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(t || '');
  return m ? `${m[3]}${m[2]}${m[1]}${m[4]}${m[5]}` : '';
};

// Stato effettivo di un DOCUMENTO = mock + azioni salvate.
// `aperto` è la sola cosa che accende il pallino: uno scarto senza gestione,
// anche se una ritrasmissione è in volo (un tentativo non è una soluzione).
function docInfo(d) {
  const tx = d.tx || {};
  const salvato = window.byupReadFisc()[d.id] || {};
  const gestito = salvato.gestito || tx.gestito || null;
  const ritento = salvato.ritento || null;
  let tipo;
  if (!tx.scarto) tipo = tx.esito === 'ritrasmissione' ? 'ritrasmissione' : 'ok';
  else if (gestito) tipo = 'gestito';
  else tipo = ritento ? 'ritrasmissione' : 'scartato';
  return {
    ...tx, tipo, gestito, ritento,
    visto: salvato.visto || null, nota: salvato.nota || null,
    aperto: !!tx.scarto && !gestito,
  };
}

// Riepilogo di giornata: NON è uno stato suo, è l'aggregato dei documenti.
function giornataInfo(c) {
  const info = ccDocs(c).map(docInfo);
  const n = info.length;
  const scartati = info.filter(i => i.aperto).length;      // scarti non gestiti
  const gestiti  = info.filter(i => i.tipo === 'gestito').length;
  const coda     = info.filter(i => !i.scarto && i.tipo === 'ritrasmissione');
  if (scartati) return { tipo:'scartata', n, scartati,
    label: `${scartati} ${scartati === 1 ? 'scartato' : 'scartati'} su ${n}` };
  if (coda.length) return { tipo:'coda', n, scartati: 0,
    label: `${coda.length} in ritrasmissione`,
    sotto: `prossimo tentativo alle ${coda[0].ritento ? coda[0].ritento.prossimo : coda[0].prossimo}` };
  if (gestiti) return { tipo:'gestita', n, scartati: 0,
    label: `${gestiti} ${gestiti === 1 ? 'gestito' : 'gestiti'} su ${n}` };
  return { tipo:'ok', n, scartati: 0, label: `${n}/${n} trasmessi` };
}

// Il badge conta i DOCUMENTI scartati e non gestiti, non le giornate.
window.byupScartiAperti = function () {
  return CASH_CLOSURES.reduce((s, c) => s + ccDocs(c).filter(d => docInfo(d).aperto).length, 0);
};

// La ritrasmissione manuale NON chiude lo scarto: mette in volo un tentativo.
// Il pallino resta finché l'esito non c'è — mentire qui sarebbe peggio che
// non avere il pallino. La nota si conserva su ENTRAMBE le azioni.
window.byupFiscRiprova = function (id, nota) {
  const s = window.byupReadFisc();
  const prec = s[id] || {};
  const n = Math.min((prec.ritento ? prec.ritento.tentativo : 3) + 1, 5);
  s[id] = {
    ...prec,
    nota: (nota || '').trim() || prec.nota || null,
    ritento: { tentativo: n, quando: fiscOra(), prossimo: fiscFraMinuti(30) },
  };
  window.byupWriteFisc(s);
};
window.byupFiscSegnaGestita = function (id, nota) {
  const s = window.byupReadFisc();
  const prec = s[id] || {};
  const testo = (nota || '').trim() || prec.nota || null;
  s[id] = { ...prec, nota: testo, gestito: { quando: fiscOra(), come:'manuale', nota: testo } };
  window.byupWriteFisc(s);
};
// "Aperto il …" nel log: si scrive una volta sola, alla prima apertura.
window.byupFiscVisto = function (id) {
  const s = window.byupReadFisc();
  if (s[id] && s[id].visto) return;
  s[id] = { ...(s[id] || {}), visto: fiscOra() };
  window.byupWriteFisc(s);
};

// Ri-renderizza il componente a ogni cambio degli scarti (stessa pagina e
// altre tab), come fa la sidebar con i moduli.
function useFiscTick() {
  const [, forza] = React.useState(0);
  React.useEffect(() => {
    const agg = () => forza(x => x + 1);
    window.addEventListener('byup-fisc-change', agg);
    window.addEventListener('storage', agg);
    return () => {
      window.removeEventListener('byup-fisc-change', agg);
      window.removeEventListener('storage', agg);
    };
  }, []);
}

// gg/mm/aaaa da un Date
function ccFmtDate(d) {
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// Calendario a comparsa per selezionare un giorno
function CassaDatePicker({ selected, onPick, onClear }) {
  const init = selected ? new Date(selected.split('/').reverse().join('-')) : new Date();
  const [view, setView] = React.useState(() => { const d = new Date(init); d.setDate(1); return d; });
  const monthLabel = view.toLocaleDateString('it-IT', {month:'long', year:'numeric'});

  const firstDow = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
  const grid = [];
  for (let i = 0; i < firstDow; i++) grid.push(null);
  for (let n = 1; n <= daysInMonth; n++) grid.push(new Date(view.getFullYear(), view.getMonth(), n));
  while (grid.length % 7 !== 0) grid.push(null);

  const goPrev = () => { const d = new Date(view); d.setMonth(d.getMonth()-1); setView(d); };
  const goNext = () => { const d = new Date(view); d.setMonth(d.getMonth()+1); setView(d); };

  const navBtn = {
    width:28, height:28, borderRadius:6, background:'#fff',
    border:`1px solid ${PN.BORDER}`, cursor:'pointer', fontFamily:'inherit',
    color: PN.TEXT, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center',
  };

  return (
    <div onClick={e=>e.stopPropagation()} style={{
      position:'absolute', top:'100%', right:0, marginTop:8, zIndex:60,
      width:280, padding:14, background:'#fff', borderRadius:12,
      border:`1px solid ${PN.BORDER}`, boxShadow:'0 12px 36px rgba(15,17,21,0.14)',
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
        <button onClick={goPrev} style={navBtn}>‹</button>
        <span style={{fontSize: C.T_SM, fontWeight:700, color: PN.TEXT, textTransform:'capitalize'}}>{monthLabel}</span>
        <button onClick={goNext} style={navBtn}>›</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:4}}>
        {['L','M','M','G','V','S','D'].map((d,i) => (
          <span key={i} style={{fontSize:10, fontWeight:700, color: PN.MUTED, textAlign:'center', padding:2}}>{d}</span>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4}}>
        {grid.map((day,i) => {
          if (!day) return <span key={i}/>;
          const iso = ccFmtDate(day);
          const isSel = iso === selected;
          return (
            <button key={i} onClick={() => onPick(iso)} style={{
              padding:'7px 0', borderRadius:7, border:'none', fontFamily:'inherit',
              background: isSel ? PN.TEXT : 'transparent',
              color: isSel ? '#fff' : PN.TEXT,
              fontSize: C.T_SM, fontWeight: isSel ? 700 : 500, cursor:'pointer',
            }}>{day.getDate()}</button>
          );
        })}
      </div>
      {selected && (
        <button onClick={onClear} style={{
          width:'100%', marginTop:10, padding:'8px', borderRadius:8,
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
          fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, cursor:'pointer', fontFamily:'inherit',
        }}>Mostra tutte</button>
      )}
    </div>
  );
}

// ─── Chip di stato ─────────────────────────────────────────────────────────
// Stessa pill di StatusPill (Costi): piena, radius pill, 12.5/700, e le sue
// coppie colore — verde pagato, ambra da pagare, rosso scaduto — più un grigio
// neutro per lo scarto già gestito, che non deve più chiamare.
const FISC_CHIP = {
  ok:             { color:'#065F46', bg:'#D1FAE5' },
  coda:           { color:'#92400E', bg:'#FEF3C7' },
  ritrasmissione: { color:'#92400E', bg:'#FEF3C7' },
  scartata:       { color:'#991B1B', bg:'#FEE2E2' },
  scartato:       { color:'#991B1B', bg:'#FEE2E2' },
  // Inchiostro pieno, non muted: su C.SURF_ALT il grigio PN.MUTED sta sotto il
  // 4.5:1 richiesto a questa dimensione. Senza tinta resta comunque quieto.
  gestita:        { color: PN.TEXT,  bg: C.SURF_ALT },
  gestito:        { color: PN.TEXT,  bg: C.SURF_ALT },
};

function FiscPill({ tipo, label }) {
  const s = FISC_CHIP[tipo] || FISC_CHIP.ok;
  return (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius: C.R_PILL,
      background: s.bg, color: s.color, fontSize: 12.5, fontWeight: 700,
      width:'fit-content', whiteSpace:'nowrap',
    }}>{label}</span>
  );
}

// Riepilogo di giornata: l'aggregato dei documenti, non uno stato inventato.
function GiornataChip({ info }) {
  return (
    <span style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
      <FiscPill tipo={info.tipo} label={info.label}/>
      {info.sotto && (
        <span style={{fontSize: 12, color: PN.MUTED, marginTop: 3, whiteSpace:'nowrap'}}>{info.sotto}</span>
      )}
    </span>
  );
}

const DOC_LABEL = { ok:'Trasmesso', ritrasmissione:'In ritrasmissione', scartato:'Scartato', gestito:'Gestito' };
const DOC_TIPO  = { vendita:'Vendita', reso:'Reso', annullo:'Annullo' };

// ─── Dettaglio di una giornata ─────────────────────────────────────────────
// Stesso scheletro delle modali della sezione (ContNuovoCosto): overlay velato
// ancorato al <main>, foglio bianco pieno, header con badge icona.
// Due viste in un foglio solo: l'elenco dei documenti e, con un passo avanti,
// il dettaglio dello scarto del singolo documento.
function GiornataSheet({ closure, onClose }) {
  useFiscTick();
  const [docId, setDocId] = React.useState(null);
  const docs = ccDocs(closure);
  const tot = ccTotali(closure);
  const doc = docId ? docs.find(d => d.id === docId) : null;

  // columnGap esplicito: senza, "DOCUMENTO" e "TIPO" si toccano e si
  // leggono come un'unica etichetta.
  const dcols = '54px 96px 78px 92px 78px 78px 96px 1fr';
  const dgap = 14;

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      zIndex: 60, display:'grid', placeItems:'center', padding: 28,
      animation:'scartoFade 0.16s ease',
    }}>
      <style>{`
        @keyframes scartoFade { from {opacity: 0;} to {opacity: 1;} }
        @keyframes scartoPop {
          from {opacity: 0; transform: scale(0.965) translateY(10px);}
          to   {opacity: 1; transform: none;}
        }
        .cont-scarto-sheet textarea:focus {
          border-color: ${PN.PINK};
          box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.14);
        }
      `}</style>
      <div className="cont-scarto-sheet" onClick={e => e.stopPropagation()} style={{
        width: doc ? 640 : 940, maxWidth:'100%', maxHeight:'100%', background: PN.WHITE,
        borderRadius: 22, border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow:'0 32px 80px rgba(15,17,21,0.24), 0 2px 6px rgba(15,17,21,0.08)',
        display:'flex', flexDirection:'column', overflow:'hidden',
        animation:'scartoPop 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {doc
          ? <DocScarto doc={doc} closure={closure} onBack={() => setDocId(null)} onClose={onClose}/>
          : (
            <React.Fragment>
              {/* Header */}
              <div style={{
                padding:'20px 26px 18px', borderBottom:`1px solid ${PN.BORDER_SOFT}`,
                display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
              }}>
                <div style={{display:'flex', alignItems:'center', gap: 14}}>
                  <div style={{
                    width: 42, height: 42, borderRadius: C.R_MD, flexShrink: 0,
                    background: PN.PINK_BG_SOFT, color: PN.PINK_DARK,
                    display:'grid', placeItems:'center', boxShadow: PN.INSET_HIGHLIGHT,
                  }}><Ic.receipt size={19}/></div>
                  <div>
                    <div style={{fontSize: C.T_LG, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>
                      Documenti del {closure.date}
                    </div>
                    <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>
                      Ogni documento commerciale viene trasmesso da solo, in tempo reale
                    </div>
                  </div>
                </div>
                <button onClick={onClose}
                  onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.TEXT; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.transform = ''; }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.88)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = ''; }}
                  style={{
                    background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer',
                    display:'flex', padding: 8, borderRadius: 10,
                    transition:'background 130ms ease, color 130ms ease, transform 120ms ease',
                  }}><Ic.close size={17}/></button>
              </div>

              <div className="pn-scroll" style={{padding:'18px 26px 22px', overflowY:'auto'}}>
                {/* Quadratura: i documenti tornano al totale della riga */}
                <div style={{
                  display:'flex', alignItems:'center', flexWrap:'wrap', gap: 0,
                  padding:'12px 16px', borderRadius: C.R_MD, marginBottom: 16,
                  background: C.SURF, border:`1px solid ${PN.BORDER_SOFT}`,
                }}>
                  {[
                    { et:'Documenti', v: String(tot.n) },
                    { et:'Vendite', v: `€ ${tot.vendite.toFixed(2)}` },
                    { et:'Resi', v: tot.resi ? `− € ${tot.resi.toFixed(2)}` : '—' },
                    { et:'Annullati', v: tot.nAnnulli ? `${tot.nAnnulli} (esclusi)` : '—' },
                  ].map((q, i) => (
                    <div key={i} style={{paddingRight: 26, marginRight: 26, borderRight:`1px solid ${PN.BORDER}`}}>
                      <div style={{fontSize: C.T_XS, color: PN.MUTED}}>{q.et}</div>
                      <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums', marginTop: 2}}>{q.v}</div>
                    </div>
                  ))}
                  <div style={{marginLeft:'auto', textAlign:'right'}}>
                    <div style={{fontSize: C.T_XS, color: PN.MUTED}}>Totale della giornata</div>
                    <div style={{fontSize: C.T_LG, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums', letterSpacing:-0.3}}>
                      € {tot.totale.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Elenco documenti */}
                <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`}}>
                  <div style={{
                    display:'grid', gridTemplateColumns: dcols, columnGap: dgap,
                    padding:'9px 14px', background: C.TH_BG,
                    fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT,
                    textTransform:'uppercase', letterSpacing: 0.5,
                  }}>
                    <span style={{whiteSpace:'nowrap'}}>Ora</span>
                    <span style={{whiteSpace:'nowrap'}}>Documento</span>
                    <span style={{whiteSpace:'nowrap'}}>Tipo</span>
                    <span style={{textAlign:'right', whiteSpace:'nowrap'}}>Importo</span>
                    <span style={{textAlign:'right', whiteSpace:'nowrap'}}>IVA 10%</span>
                    <span style={{textAlign:'right', whiteSpace:'nowrap'}}>IVA 22%</span>
                    <span style={{whiteSpace:'nowrap'}}>Pagamento</span>
                    <span style={{whiteSpace:'nowrap'}}>Trasmissione</span>
                  </div>
                  <MaxRowsScroll maxRows={12}>
                    {docs.map((d, i) => {
                      const info = docInfo(d);
                      const apribile = !!info.scarto;
                      const annullato = d.tipo === 'annullo';
                      return (
                        <div key={d.id} data-row
                          onClick={apribile ? () => setDocId(d.id) : undefined}
                          onMouseEnter={e => { e.currentTarget.style.background = apribile ? '#FFF5F5' : '#F7F8FA'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; }}
                          style={{
                            display:'grid', gridTemplateColumns: dcols, columnGap: dgap,
                            padding:'9px 14px', alignItems:'center',
                            fontSize: C.T_SM, color: annullato ? PN.MUTED : PN.TEXT,
                            borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                            background: PN.WHITE,
                            cursor: apribile ? 'pointer' : 'default',
                            transition:'background 120ms ease',
                          }}>
                          <span style={{fontVariantNumeric:'tabular-nums'}}>{d.ora}</span>
                          <span style={{fontVariantNumeric:'tabular-nums'}}>{d.num}</span>
                          <span style={{
                            color: d.tipo === 'reso' ? PN.AMBER : (annullato ? PN.MUTED : PN.TEXT),
                            fontWeight: d.tipo === 'vendita' ? 400 : 600,
                          }}>{DOC_TIPO[d.tipo]}</span>
                          <span style={{
                            textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 600,
                            textDecoration: annullato ? 'line-through' : 'none',
                          }}>{ccEuro(d.importo)}</span>
                          <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', color: PN.MUTED}}>
                            {annullato || !d.iva10 ? '—' : ccEuro(d.iva10)}
                          </span>
                          <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', color: PN.MUTED}}>
                            {annullato || !d.iva22 ? '—' : ccEuro(d.iva22)}
                          </span>
                          <span style={{color: PN.MUTED}}>{d.pagamento}</span>
                          <span style={{minWidth: 0, display:'flex', alignItems:'center', gap: 8}}>
                            <FiscPill tipo={info.tipo} label={DOC_LABEL[info.tipo]}/>
                            {apribile && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: PN.MUTED, flexShrink: 0}}><path d="M9 5l7 7-7 7"/></svg>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </MaxRowsScroll>
                </div>
                <div style={{fontSize: C.T_XS, color: PN.MUTED_SOFT, marginTop: 10}}>
                  I documenti commerciali non riportano l'identità del cliente.
                </div>
              </div>
            </React.Fragment>
          )}
      </div>
    </div>
  );
}

// ─── Dettaglio dello scarto di un DOCUMENTO ────────────────────────────────
function DocScarto({ doc, closure, onBack, onClose }) {
  const info = docInfo(doc);
  const sc = doc.tx.scarto;
  const chiuso = !!info.gestito;
  const [nota, setNota] = React.useState(() => info.nota || '');

  // "Aperto il …" si scrive solo finché lo scarto è vivo: segnarlo su uno già
  // chiuso metterebbe nel log un evento successivo alla gestione.
  React.useEffect(() => { if (!chiuso) window.byupFiscVisto(doc.id); }, [doc.id, chiuso]);

  // Il log in ordine di accadimento — ordinato sui timestamp, non sull'ordine
  // in cui capita di costruirlo.
  const passi = [
    { txt:'Scarto rilevato', t: sc.rilevato },
    info.visto && { txt:'Aperto', t: info.visto },
    info.ritento && { txt:`Ritrasmissione avviata · tentativo ${info.ritento.tentativo} di 5`, t: info.ritento.quando },
    info.gestito && { txt: info.gestito.come === 'ritrasmissione' ? 'Gestito · ritrasmissione riuscita' : 'Gestito', t: info.gestito.quando },
  ].filter(Boolean).sort((a, b) => fiscOrdine(a.t).localeCompare(fiscOrdine(b.t)));

  const Blocco = ({ titolo, children }) => (
    <div style={{marginTop: 18}}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: PN.MUTED,
        textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 6,
      }}>{titolo}</div>
      <div style={{fontSize: C.T_SM, color: PN.TEXT, lineHeight: 1.55}}>{children}</div>
    </div>
  );

  return (
    <React.Fragment>
      {/* Header con il passo indietro all'elenco */}
      <div style={{
        padding:'20px 26px 18px', borderBottom:`1px solid ${PN.BORDER_SOFT}`,
        display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
      }}>
        <div style={{display:'flex', alignItems:'center', gap: 14, minWidth: 0}}>
          <button onClick={onBack} title="Torna ai documenti"
            onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.9)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{
              width: 42, height: 42, borderRadius: C.R_MD, flexShrink: 0,
              background:'transparent', border:`1px solid ${PN.BORDER}`, color: PN.TEXT,
              display:'grid', placeItems:'center', cursor:'pointer',
              transition:'background 130ms ease, transform 120ms ease',
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
          </button>
          <div style={{minWidth: 0}}>
            <div style={{fontSize: C.T_LG, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>
              {chiuso ? 'Scarto gestito' : 'Documento scartato'}
            </div>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2, fontVariantNumeric:'tabular-nums'}}>
              N. {doc.num} · {closure.date} {doc.ora} · {ccEuro(doc.importo)}
            </div>
          </div>
        </div>
        <button onClick={onClose}
          onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.TEXT; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.transform = ''; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.88)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = ''; }}
          style={{
            background:'transparent', border:'none', color: PN.MUTED, cursor:'pointer',
            display:'flex', padding: 8, borderRadius: 10,
            transition:'background 130ms ease, color 130ms ease, transform 120ms ease',
          }}><Ic.close size={17}/></button>
      </div>

      <div className="pn-scroll" style={{padding:'20px 26px 22px', overflowY:'auto'}}>
        <div style={{
          padding:'14px 16px', borderRadius: C.R_MD,
          background: chiuso ? C.SURF : PN.PINK_BG_SOFT,
          border: `1px solid ${chiuso ? PN.BORDER_SOFT : '#FFD9D7'}`,
          fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT, lineHeight: 1.4,
        }}>{sc.motivo}</div>

        <Blocco titolo="Causa probabile">{sc.causa}</Blocco>

        <Blocco titolo="Cosa fare">
          {sc.azione}
          <div style={{marginTop: 10}}>
            <button onClick={() => { window.location.href = sc.vaiHref; }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = PN.WHITE; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER_HAIR; e.currentTarget.style.background = PN.WHITE_HUSH; }}
              style={{
                display:'inline-flex', alignItems:'center', gap: 7,
                padding:'8px 13px', borderRadius: C.R_SM,
                background: PN.WHITE_HUSH, border: `1px solid ${PN.BORDER_HAIR}`,
                boxShadow:'inset 0 1px 1px rgba(15,17,21,0.04)',
                fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
                cursor:'pointer', fontFamily:'inherit',
                transition:'border-color 150ms, background 150ms',
              }}>
              {sc.vaiLabel}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: PN.MUTED}}><path d="M7 17 17 7M8 7h9v9"/></svg>
            </button>
          </div>
        </Blocco>

        {chiuso ? (
          info.gestito.nota && <Blocco titolo="Nota">{info.gestito.nota}</Blocco>
        ) : (
          <div style={{marginTop: 18}}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: PN.MUTED,
              textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 6,
            }}>Nota (facoltativa)</div>
            <textarea value={nota} onChange={e => setNota(e.target.value)}
              placeholder="Cosa hai fatto per sistemarlo — resta nel log del documento"
              style={{
                width:'100%', boxSizing:'border-box',
                padding:'11px 13px', border:`1px solid ${PN.BORDER}`, borderRadius: 10,
                fontSize: C.T_SM, fontFamily:'inherit', color: PN.TEXT,
                outline:'none', resize:'vertical', minHeight: 78,
                transition:'border-color 130ms ease, box-shadow 150ms ease',
              }}/>
          </div>
        )}

        <Blocco titolo="Cos'è successo">
          <div style={{position:'relative', paddingLeft: 2}}>
            {passi.map((p, i) => (
              <div key={i} style={{display:'flex', gap: 10, position:'relative', paddingBottom: i === passi.length - 1 ? 0 : 12}}>
                {i < passi.length - 1 && (
                  <span style={{position:'absolute', left: 4.5, top: 14, bottom: -2, borderLeft:`1.5px dashed ${PN.BORDER}`}}/>
                )}
                <span style={{
                  width: 10, height: 10, borderRadius:'50%', flexShrink: 0, marginTop: 5,
                  background: PN.WHITE, position:'relative', zIndex: 1,
                  boxShadow: `inset 0 0 0 2px ${i === passi.length - 1 && chiuso ? PN.GREEN : (i === 0 ? '#991B1B' : 'rgba(15,17,21,0.22)')}`,
                }}/>
                <div style={{fontSize: C.T_SM, color: PN.TEXT, lineHeight: 1.5, minWidth: 0}}>
                  {p.txt} il <span style={{fontVariantNumeric:'tabular-nums', color: PN.MUTED}}>{p.t}</span>
                </div>
              </div>
            ))}
          </div>
        </Blocco>

        <div style={{fontSize: C.T_XS, color: PN.MUTED_SOFT, marginTop: 16, lineHeight: 1.5}}>
          Lo scarto riguarda solo questo documento: gli altri della giornata sono stati trasmessi regolarmente.
        </div>
      </div>

      {!chiuso && (
        <div style={{
          padding:'14px 22px', borderTop:`1px solid ${PN.BORDER_SOFT}`,
          background: PN.WHITE_OFF,
          display:'flex', alignItems:'center', gap: 10,
        }}>
          <div style={{flex: 1, fontSize: C.T_XS, color: PN.MUTED_SOFT}}>
            Finché lo scarto è aperto resta segnalato in Contabilità.
          </div>
          <button onClick={() => { window.byupFiscSegnaGestita(doc.id, nota); onBack(); }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{
              padding:'10px 18px', background:'transparent', border:`1px solid ${PN.BORDER}`,
              borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
              cursor:'pointer', fontFamily:'inherit',
              display:'inline-flex', alignItems:'center', gap: 6,
              transition:'background 130ms ease, border-color 130ms ease, transform 120ms ease',
            }}><Ic.check size={14}/> Segna come gestito</button>
          <button onClick={() => { window.byupFiscRiprova(doc.id, nota); onBack(); }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 90, 95, 0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{
              padding:'10px 22px', background: PN.PINK, color:'#fff', border:'none',
              borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700,
              cursor:'pointer', fontFamily:'inherit',
              display:'inline-flex', alignItems:'center', gap: 6,
              transition:'filter 130ms ease, box-shadow 150ms ease, transform 120ms ease',
            }}><Ic.recurring size={13}/> Riprova ora</button>
        </div>
      )}
    </React.Fragment>
  );
}

function ContCassa({ cassaOpen = false, setCassaOpen }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [selDate, setSelDate] = React.useState(null); // 'gg/mm/aaaa' o null
  const pickerRef = React.useRef(null);
  const [giornataId, setGiornataId] = React.useState(null); // giornata aperta nel dettaglio
  useFiscTick();

  // Stato apertura/chiusura cassa
  const [apriModal, setApriModal] = React.useState(false);
  const [chiudiModal, setChiudiModal] = React.useState(false);
  const [fondoCassa, setFondoCassa] = React.useState(null);
  const [aperturaOra, setAperturaOra] = React.useState(null);

  function handleCassaClick() {
    if (cassaOpen) { setChiudiModal(true); } else { setApriModal(true); }
  }
  function confermaApertura(amount) {
    setFondoCassa(amount);
    setAperturaOra(new Date().toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'}));
    setCassaOpen && setCassaOpen(true);
    setApriModal(false);
  }
  function confermaChiusura() {
    setCassaOpen && setCassaOpen(false);
    setFondoCassa(null);
    setAperturaOra(null);
    setChiudiModal(false);
  }

  React.useEffect(() => {
    if (!pickerOpen) return;
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);

  // Totali e stato della riga sono DERIVATI dai documenti della giornata: la
  // chiusura non ha numeri propri da qualche altra parte.
  const allRows = CASH_CLOSURES.map(c => {
    const t = ccTotali(c);
    return { ...c, totale: t.totale, iva10: t.iva10, iva22: t.iva22, giornata: giornataInfo(c) };
  });
  const rows = selDate ? allRows.filter(r => r.date === selDate) : allRows;
  const totIncassato = rows.reduce((s,r)=>s+r.totale,0);
  // Il conteggio è sui DOCUMENTI di tutte le giornate, non su quelle filtrate:
  // uno scarto non smette di esistere perché stai guardando un altro giorno.
  const scartiAperti = allRows.reduce((s,r) => s + r.giornata.scartati, 0);
  const giornataAperta = giornataId ? CASH_CLOSURES.find(c => c.id === giornataId) : null;

  // minmax e non fr puri: con le sole frazioni, alla larghezza minima del
  // frame (1280) "Totale incassato" andava a capo e "Contanti" si attaccava a
  // "Carta e digitale". Il minimo di ogni colonna è la sua intestazione;
  // l'ultima tiene "prossimo tentativo alle HH:MM" per intero.
  const cols = 'minmax(96px, 0.9fr) minmax(152px, 1fr) minmax(74px, 0.72fr) minmax(74px, 0.72fr) minmax(88px, 0.85fr) minmax(140px, 0.95fr) minmax(216px, 1.56fr)';

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Banner stato cassa */}
      <div style={{
        display:'flex', alignItems:'center', gap: 14,
        padding: '14px 18px',
        background: cassaOpen ? '#ECFDF5' : '#FEF2F2',
        border: `1px solid ${cassaOpen ? '#A7F3D0' : '#FECACA'}`,
        borderRadius: C.R_MD,
      }}>
        <span style={{
          width:10, height:10, borderRadius:'50%',
          background: cassaOpen ? PN.GREEN : PN.RED,
          boxShadow: `0 0 0 4px ${cassaOpen ? '#A7F3D055' : '#FECACA55'}`,
        }}/>
        <div style={{flex:1}}>
          <div style={{fontSize: C.T_SM, fontWeight: 700, color: cassaOpen ? '#065F46' : '#991B1B'}}>
            {cassaOpen ? 'Cassa aperta' : 'Cassa chiusa'}
          </div>
          <div style={{fontSize: C.T_XS, color: cassaOpen ? '#047857' : '#B91C1C', marginTop: 2}}>
            {cassaOpen
              ? `Aperta alle ${aperturaOra || '09:30'} · Da: Marco${fondoCassa != null ? ` · Fondo €${fondoCassa.toFixed(2)}` : ''}`
              : 'Quadratura completata correttamente'}
          </div>
        </div>
        <button
          onClick={handleCassaClick}
          className="cassa-btn"
          style={{
            padding:'9px 18px', borderRadius: C.R_PILL,
            background: cassaOpen ? PN.TEXT : '#059669', color:'#fff', border:'none',
            fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            animation: cassaOpen ? 'none' : 'cassaPulse 2s ease-out infinite',
          }}>{cassaOpen ? 'Chiudi cassa' : 'Apri cassa'}</button>
      </div>

      {/* Popup apertura cassa */}
      <ApriCassaModal
        open={apriModal}
        onClose={() => setApriModal(false)}
        onConfirm={confermaApertura}
      />

      {/* Popup conferma chiusura cassa */}
      <ChiudiCassaModal
        open={chiudiModal}
        fondoCassa={fondoCassa}
        aperturaOra={aperturaOra}
        onClose={() => setChiudiModal(false)}
        onConfirm={confermaChiusura}
      />

      {/* Card chiusure */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 16, flexWrap:'wrap', gap: 12}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap'}}>
              <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Chiusure cassa</div>
              {/* Il richiamo in testata: stesso conteggio del pallino in menu,
                  si spegne solo quando lo scarto è gestito. */}
              {scartiAperti > 0 && (
                <span style={{
                  display:'inline-flex', alignItems:'center', gap: 6,
                  padding:'3px 10px', borderRadius: C.R_PILL,
                  background:'#FEE2E2', color:'#991B1B',
                  fontSize: 12.5, fontWeight: 700,
                }}>
                  <span style={{width: 7, height: 7, borderRadius:'50%', background:'#DC2626', flexShrink: 0}}/>
                  {scartiAperti} {scartiAperti === 1 ? 'documento scartato' : 'documenti scartati'}
                </span>
              )}
            </div>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>{rows.length} chiusure · €{totIncassato.toFixed(2)} incassati</div>
          </div>
        </div>

        {/* Search + actions */}
        <div style={{display:'flex', gap: 10, marginBottom: 14, flexWrap:'wrap'}}>
          <div style={{
            flex:'1 1 240px', display:'flex', alignItems:'center', gap: 8,
            padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
            background: PN.WHITE,
          }}>
            <span style={{color: PN.MUTED}}><Ic.search size={15}/></span>
            <input placeholder="Cerca per data…" style={{
              flex:1, border:'none', outline:'none', fontSize: C.T_SM, fontFamily:'inherit',
            }}/>
          </div>
          <div ref={pickerRef} style={{position:'relative'}}>
            <button onClick={() => setPickerOpen(o => !o)}
              style={{...iconBtn, transition: 'background 140ms ease, border-color 140ms ease, transform 130ms ease'}}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}>
              <Ic.calendar size={14}/> {selDate || 'Filtra per data'}
            </button>
            {pickerOpen && (
              <CassaDatePicker
                selected={selDate}
                onPick={(iso) => { setSelDate(iso); setPickerOpen(false); }}
                onClear={() => { setSelDate(null); setPickerOpen(false); }}
              />
            )}
          </div>
        </div>

        {/* Tabella chiusure */}
        <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`}}>
          <div style={{
            display:'grid', gridTemplateColumns: cols,
            padding:'10px 14px', background: C.TH_BG,
            fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT,
            textTransform:'uppercase', letterSpacing: 0.5,
          }}>
            <span style={{whiteSpace:'nowrap'}}>Data</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>Totale incassato</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>IVA 10%</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>IVA 22%</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>Contanti</span>
            <span style={{textAlign:'right', whiteSpace:'nowrap'}}>Carta e digitale</span>
            <span style={{paddingLeft: 14, whiteSpace:'nowrap'}}>Trasmissione AE</span>
          </div>
          <MaxRowsScroll maxRows={10}>
          {rows.map((r,i) => (
            <div key={r.id} role="button" tabIndex={0}
              onClick={() => setGiornataId(r.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGiornataId(r.id); } }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FA'; }}
              onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; }}
              style={{
              display:'grid', gridTemplateColumns: cols,
              padding:'12px 14px', alignItems:'center',
              fontSize: C.T_SM, color: PN.TEXT,
              borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              background: PN.WHITE,
              cursor:'pointer',
              transition:'background 120ms ease',
            }}>
              <span style={{display:'flex', alignItems:'center', gap: 8, fontVariantNumeric:'tabular-nums'}}>
                <span style={{color: PN.MUTED}}><Ic.calendar size={14}/></span>
                {r.date}
              </span>
              <span style={{textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, letterSpacing: -0.2}}>€ {r.totale.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.iva10.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.iva22.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.contanti.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.nonContanti.toFixed(2)}</span>
              <span style={{paddingLeft: 14, minWidth: 0, display:'flex', alignItems:'center', gap: 8}}>
                <GiornataChip info={r.giornata}/>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: PN.MUTED_SOFT, flexShrink: 0, marginLeft:'auto'}}><path d="M9 5l7 7-7 7"/></svg>
              </span>
            </div>
          ))}
          </MaxRowsScroll>
        </div>
      </div>

      {/* Dettaglio della giornata — si ancora al <main> come ContNuovoCosto e
          ContShareModal, quindi copre l'area contenuto e non la card. */}
      {giornataAperta && (
        <GiornataSheet closure={giornataAperta} onClose={() => setGiornataId(null)}/>
      )}
    </div>
  );
}

// ─── Reusable styles & components ───────────────────
const iconBtn = {
  padding:'9px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
  borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
  cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 8,
};
const iconOnlyBtn = {
  background:'transparent', border:`1px solid ${PN.BORDER}`,
  borderRadius: C.R_SM, padding:'6px 9px', cursor:'pointer',
  color: PN.MUTED, display:'inline-flex', alignItems:'center', justifyContent:'center',
};
window.iconBtn = iconBtn;
window.iconOnlyBtn = iconOnlyBtn;

function FilterChip({ active, onClick, label, count }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
      display:'inline-flex', alignItems:'center', gap: 6,
      padding:'7px 14px',
      background: active ? PN.TEXT : hover ? '#F4F5F7' : PN.WHITE,
      border: `1px solid ${active || hover ? PN.TEXT : PN.BORDER}`,
      color: active ? '#fff' : PN.TEXT,
      borderRadius: C.R_PILL, fontSize: C.T_SM, fontWeight: 600,
      cursor:'pointer', fontFamily:'inherit',
      transform: pressed ? 'scale(0.95)' : hover ? 'scale(1.06)' : 'scale(1)',
      boxShadow: hover ? '0 4px 12px rgba(15, 17, 21, 0.10)' : 'none',
      transition: 'transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1), background 140ms ease, border-color 140ms ease, box-shadow 150ms ease',
    }}>
      {label}
      {count != null && <span style={{
        background: active ? 'rgba(255,255,255,0.2)' : C.SURF_ALT,
        color: active ? '#fff' : PN.MUTED,
        padding:'1px 8px', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700,
      }}>{count}</span>}
    </button>
  );
}
window.FilterChip = FilterChip;
window.ContCassa = ContCassa;
window.GiornataChip = GiornataChip;
window.GiornataSheet = GiornataSheet;
window.useFiscTick = useFiscTick;
