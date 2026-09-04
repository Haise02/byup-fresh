// Tab Cassa v2 — elenco chiusure cassa (storico quadrature)

// ─── Trasmissione all'Agenzia delle Entrate ────────────────────────────────
// Il canale è la procedura "documento commerciale online" (via OpenAPI): ogni
// documento parte DA SOLO e in tempo reale — tranne fra le 23:55 e le 00:00
// italiane, quando il canale non trasmette: quello che ha in mano lo accoda
// al giorno nuovo (stato `waiting`), spostando la giornata fiscale del
// documento (P-100 · scheda OpenAPI 31/08). Per questo in quella finestra
// l'emissione è bloccata alla cassa e su Byup Staff, e `waiting` riguarda
// solo ciò che il canale aveva già preso in carico sul bordo della finestra.
// E nel prototipo il documento nasce
// dal PAGAMENTO — ogni elemento di `payments` in contabilita-v2-conti.jsx ha il
// suo `scontrinoNum`, quindi un conto diviso in tre pagamenti produce tre
// scontrini distinti, ognuno col suo esito.
//
// Di conseguenza lo stato di trasmissione appartiene al pagamento e NIENTE
// ALTRO lo possiede: il conto e la chiusura di giornata lo DERIVANO.
//   • Conti  → casa dello stato: il chip sulla riga del pagamento e il
//              dettaglio dello scarto (è lì che si agisce)
//   • Cassa  → vigilanza: il riepilogo per giornata e il rimando a Conti
// Qui vivono il registro delle azioni (localStorage) e le derivazioni, perché
// questo file è caricato prima di conti.jsx; i dati stanno in CONTI_MOCK.

// ─── Registro delle azioni sugli scarti, per DOCUMENTO ─────────────────────
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

// Finestra di divieto notturna: copia guardata della definizione che sta in
// sala-salda-modal.jsx — pagine e bundle diversi, stessa finestra. Qui serve a
// docInfo: lo stato `waiting` esiste solo mentre la finestra è attiva (vera, o
// simulata con `?notte=1`), perché a mezzanotte il canale trasmette davvero e
// il documento torna un trasmesso qualunque.
if (!window.byupNotteInfo) {
  // `?notte=1` avvia la notte demo e la àncora ADESSO; le navigazioni interne
  // la perdono dall'URL (la sidebar riscrive ?tab=…), quindi l'ancora vive in
  // sessionStorage e l'orologio finto continua a correre invece di ripartire.
  // Passata la mezzanotte finta, la demo è semplicemente finita.
  let notteT0 = null;
  try {
    if (new URLSearchParams(window.location.search).get('notte') === '1') {
      notteT0 = Date.now();
      sessionStorage.setItem('byup_notte_t0', String(notteT0));
    } else {
      const salvato = sessionStorage.getItem('byup_notte_t0');
      if (salvato) notteT0 = parseInt(salvato, 10);
    }
  } catch (e) {}
  const notteBase = (() => { const d = new Date(); d.setHours(23, 58, 30, 0); return d.getTime(); })();
  const notteOra = () => notteT0 ? new Date(notteBase + (Date.now() - notteT0)) : new Date();
  window.byupNotteInfo = function () {
    const d = notteOra();
    const dentro = d.getHours() === 23 && d.getMinutes() >= 55;
    const mancano = dentro ? 86400 - (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) : 0;
    return { dentro, mancano };
  };
  window.byupNotteConta = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const fiscOra = () => {
  const d = new Date();
  return `${ccFmtDate(d)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
const fiscFraMinuti = (m) => {
  const d = new Date(Date.now() + m * 60000);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
// 'aaaa-mm-gg HH:MM' → 'gg/mm/aaaa HH:MM'. Le date dei conti sono ri-ancorate
// a oggi a runtime: i timestamp fiscali si derivano da lì, mai scritti a mano.
const fiscTs = (ora) => {
  const [d, t] = String(ora || '').split(' ');
  const [Y, M, D] = String(d || '').split('-');
  return D ? `${D}/${M}/${Y} ${t || '00:00'}` : '';
};
// Giorno successivo a `ora`, a un orario dato: serve per datare una gestione
// avvenuta prima che questa console esistesse, senza scrivere date a mano.
const fiscGiornoDopo = (ora, hhmm) => {
  const g = String(ora || '').split(' ')[0];
  if (!g) return '';
  const d = new Date(g + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return `${ccFmtDate(d)} ${hhmm}`;
};
// chiave ordinabile: il log deve stare in ordine di accadimento anche se un
// timestamp arriva dai dati e un altro dall'orologio.
const fiscOrdine = (t) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(t || '');
  return m ? `${m[3]}${m[2]}${m[1]}${m[4]}${m[5]}` : '';
};

// I motivi di scarto, in italiano: il codice dell'Agenzia non dice niente a chi
// deve rimediare, e il rimedio sta sempre su un'altra schermata.
const CC_SCARTI = {
  aliquota: {
    motivo:   'Aliquota IVA non valida sulla riga "Tagliere salumi e formaggi"',
    causa:    'Il prodotto è passato in cassa con un\'aliquota non prevista per la somministrazione. L\'Agenzia rifiuta l\'intero documento, non la singola riga.',
    azione:   'Correggi l\'aliquota del prodotto nel catalogo, poi ritrasmetti il documento.',
    vaiLabel: 'Apri Impostazioni → Menù',
    vaiHref:  'byup Impostazioni.html?page=menu-cucina&sub=libreria',
  },
  // La chiave si chiama ancora `delega` per il pagamento mock che la cita
  // (p5a in contabilita-v2-conti.jsx), ma la causa è un'altra: i corrispettivi
  // NON passano dalla delega. La delega a Byup copre fatture elettroniche e
  // dispositivi (D-39/D-40); la trasmissione dei corrispettivi usa le
  // credenziali dell'Agenzia dell'esercente (P-104), ed è quella che scade.
  // Stesso rimando della voce `credenziali`: la card di P-104 in Dati fiscali.
  delega: {
    motivo:   'Le credenziali dell\'Agenzia sono scadute',
    causa:    'La trasmissione dei corrispettivi usa le credenziali Fisconline del titolare, e la password scade ogni novanta giorni: da quando è scaduta ogni invio viene rifiutato. Non c\'entra la delega, che copre fatture e dispositivi.',
    azione:   'Prima cambia la password sul sito dell\'Agenzia delle Entrate, poi inseriscila in Impostazioni → Dati fiscali: alla conferma parte una trasmissione di prova.',
    vaiLabel: 'Apri Impostazioni → Dati fiscali',
    vaiHref:  'byup Impostazioni.html?page=fiscali',
  },
  dispositivo: {
    motivo:   'Il punto cassa non risulta censito all\'Agenzia',
    causa:    'Il dispositivo che ha emesso il documento non è fra quelli registrati per il locale: succede quando si incassa da un POS aggiunto da poco e non ancora abbinato.',
    azione:   'Abbina il dispositivo nella pagina POS e integrazioni, poi ritrasmetti il documento.',
    vaiLabel: 'Apri Impostazioni → POS e integrazioni',
    vaiHref:  'byup Impostazioni.html?page=integrazioni',
  },
  // La password Fisconline dell'esercente scade ogni novanta giorni (PT §12.2):
  // il canale trasmette con quelle credenziali, quindi da quando è scaduta ogni
  // invio viene rifiutato. In produzione il canale espone la richiamata
  // `receipt-credentials`, da sottoscrivere come innesco del promemoria — qui è
  // solo documentata, non si simula. L'ordine dei passi nell'azione è il
  // contenuto: prima la password si cambia sul sito dell'Agenzia, poi si
  // inserisce in Byup, dove all'inserimento parte una trasmissione di prova.
  credenziali: {
    motivo:   'La password Fisconline è scaduta',
    causa:    'La trasmissione dei corrispettivi usa le credenziali Fisconline del titolare, e la password scade ogni novanta giorni: da quando è scaduta ogni invio viene rifiutato.',
    azione:   'Prima cambia la password sul sito dell\'Agenzia delle Entrate, poi inseriscila in Impostazioni → Dati fiscali: alla conferma parte una trasmissione di prova che la verifica subito.',
    vaiLabel: 'Apri Impostazioni → Dati fiscali',
    vaiHref:  'byup Impostazioni.html?page=fiscali',
  },
};

// Scadenza della password Fisconline: lo stato vive in un posto solo
// (byupAdeCredStato, panoramica-tokens.jsx — P-120), perché lo leggono la
// scheda di Dati fiscali, le notifiche, i quattro punti di emissione e questa
// fascia. Le credenziali sono SEMPRE dell'esercente (D-103): del titolare per
// la ditta individuale, della persona che il locale ha nominato incaricata sul
// portale per società ed enti — e i testi nominano quella persona, perché chi
// legge deve sapere se tocca a lui. La fascia compare dal PRIMO gradino (14
// giorni), non a scadenza avvenuta: a scadenza avvenuta l'emissione è già
// ferma, e avvisare allora è tardi.
const ccCredStato = () => (window.byupAdeCredStato ? window.byupAdeCredStato() : { stato: 'ok', scaduta: false, giorni: 99, gradino: null });
const ccCredScadute = () => ccCredStato().scaduta;
const ccCredChi = () => (window.pnAdeChiRinnova ? window.pnAdeChiRinnova() : { ruolo: 'titolare' });

// IVA del documento: aliquota decisa dall'id del pagamento (stabile), importo
// scorporato. Le colonne IVA della chiusura sono la somma di queste.
// MOCK in attesa di P-107: l'hash IGNORA le righe, quindi anche l'aliquota
// dichiarata sulla riga fuori menù (P-11) non arriva qui — chiusure e
// riepiloghi IVA restano una finzione finché P-107 non li rifà sulle righe.
const ccR2 = (n) => Math.round(n * 100) / 100;
const ccEuro = (n) => (n < 0 ? `− € ${Math.abs(n).toFixed(2)}` : `€ ${n.toFixed(2)}`);
function docIva(p) {
  let s = 0;
  for (let i = 0; i < p.id.length; i++) s = (s * 31 + p.id.charCodeAt(i)) >>> 0;
  const r = (s % 100) < 24 ? 22 : 10;
  const iva = ccR2(p.amount * r / (100 + r));
  return { aliquota: r, iva10: r === 10 ? iva : 0, iva22: r === 22 ? iva : 0 };
}

// Stato effettivo di un DOCUMENTO = quello che dicono i dati + quello che ha
// fatto il ristoratore. `aperto` è la sola cosa che accende il pallino: uno
// scarto senza gestione, anche se una ritrasmissione è in volo (un tentativo
// non è una soluzione).
function docInfo(p) {
  const f = p.fisc || {};
  const salvato = window.byupReadFisc()[p.id] || {};
  const gestito = salvato.gestito || (f.gestito ? { ...f.gestito, quando: f.gestito.quando || fiscGiornoDopo(p.ora, '09:20') } : null);
  const ritento = salvato.ritento || null;
  const scarto = f.scarto ? { ...CC_SCARTI[f.scarto] , rilevato: fiscTs(p.ora) } : null;
  // Accodato dal canale nella finestra di divieto: waiting solo FINCHÉ la
  // finestra è attiva — dopo mezzanotte quel documento è partito davvero, e
  // il mock racconta il dopo come un trasmesso qualunque. Niente id AE e
  // niente "inviato": non è ancora successo, e fabbricarli sarebbe mentire.
  const attesa = !scarto && f.esito === 'waiting' && window.byupNotteInfo().dentro;
  let tipo;
  if (attesa) tipo = 'waiting';
  else if (!scarto) tipo = f.esito === 'ritrasmissione' ? 'ritrasmissione' : 'ok';
  else if (gestito) tipo = 'gestito';
  else tipo = ritento ? 'ritrasmissione' : 'scartato';
  return {
    tipo, scarto, gestito, ritento,
    idTrasm: (scarto || attesa) ? null : (f.idTrasm || (p.scontrinoNum ? p.scontrinoNum.replace('SC-', 'AE-') : null)),
    inviato: (scarto || attesa) ? null : fiscTs(p.ora),
    tentativo: ritento ? ritento.tentativo : (f.tentativo || 2),
    prossimo: ritento ? ritento.prossimo : (f.prossimo || '14:30'),
    visto: salvato.visto || null,
    nota: salvato.nota || null,
    aperto: !!scarto && !gestito,
  };
}

// Tutti i documenti, cioè tutti i pagamenti dei conti. Unica sorgente.
function ccDocumenti() {
  const out = [];
  (window.CONTI_MOCK || []).forEach(c => (c.payments || []).forEach(p => out.push({ conto: c, p })));
  return out;
}

// ─── Chiusure di giornata, DERIVATE dai documenti ──────────────────────────
// Una chiusura è l'insieme dei documenti emessi in quel giorno: i totali e lo
// stato di trasmissione sono somme, non numeri scritti da qualche altra parte.
// MOCK in attesa del rifacimento fiscale: come docIva, i totali di chiusura
// IGNORANO le rettifiche (annulli e resi di Conti, P-16/17/18) — una finzione
// dichiarata, finché il rifacimento non li deriva dalle righe rettificate.
// E la tabella fonde ancora DUE assi (P-19/P-20): la trasmissione è per
// giornata FISCALE (solare), la quadratura contanti è per giornata di
// SERVIZIO (rollover di sede, byup_rollover_time) — con un rollover diverso
// da mezzanotte una delle due colonne mente. Si ripara col rifacimento
// fiscale, non qui.
function ccChiusure() {
  const perGiorno = {};
  ccDocumenti().forEach(({ p }) => {
    const g = String(p.ora || '').split(' ')[0];
    if (!g) return;
    (perGiorno[g] = perGiorno[g] || []).push(p);
  });
  return Object.keys(perGiorno).sort().reverse().map(g => {
    const docs = perGiorno[g].slice().sort((a, b) => String(a.ora).localeCompare(String(b.ora)));
    let contanti = 0, nonContanti = 0, piattaforma = 0, iva10 = 0, iva22 = 0;
    docs.forEach(p => {
      const iv = docIva(p);
      iva10 += iv.iva10; iva22 += iv.iva22;
      // P-04: l'incasso piattaforma è avvenuto LÀ — non è contante in
      // cassetto né transito sul POS nostro: resta nel totale della
      // giornata (il documento è nostro), fuori dalle due colonne.
      if (p.method === 'contanti') contanti += p.amount;
      else if (p.method === 'piattaforma') piattaforma += p.amount;
      else nonContanti += p.amount;
    });
    const [Y, M, D] = g.split('-');
    return {
      id: g, iso: g, date: `${D}/${M}/${Y}`,
      docs, contanti: ccR2(contanti), nonContanti: ccR2(nonContanti),
      iva10: ccR2(iva10), iva22: ccR2(iva22),
      totale: ccR2(contanti + nonContanti + piattaforma),
    };
  });
}

// Riepilogo di giornata: NON è uno stato suo, è l'aggregato dei documenti.
function giornataInfo(chiusura) {
  const info = chiusura.docs.map(docInfo);
  const n = info.length;
  const scartati = info.filter(i => i.aperto).length;          // scarti non gestiti
  const gestiti  = info.filter(i => i.tipo === 'gestito').length;
  const coda     = info.filter(i => !i.scarto && i.tipo === 'ritrasmissione');
  const attesa   = info.filter(i => i.tipo === 'waiting').length;
  // Il waiting non vince mai su un problema vero: se la giornata ha scarti o
  // ritrasmissioni sta nella riga sotto il chip, non al suo posto.
  const sotto = attesa ? `${attesa} in attesa di mezzanotte` : null;
  if (scartati) return { stato:'scartato', tipo:'scartata', n, scartati, sotto,
    label: `${scartati} ${scartati === 1 ? 'scartato' : 'scartati'} su ${n}` };
  if (coda.length) return { stato:'coda', tipo:'coda', n, scartati: 0, sotto,
    label: `${coda.length} in ritrasmissione` };
  if (attesa) return { stato:'waiting', tipo:'waiting', n, scartati: 0,
    label: `${attesa} in attesa di mezzanotte` };
  if (gestiti) return { stato:'gestito', tipo:'gestita', n, scartati: 0,
    label: `${gestiti} ${gestiti === 1 ? 'gestito' : 'gestiti'} su ${n}` };
  return { stato:'ok', tipo:'ok', n, scartati: 0, label: `${n}/${n} trasmessi` };
}

// Il badge conta i DOCUMENTI scartati e non gestiti, non le giornate.
window.byupScartiAperti = function () {
  return ccDocumenti().filter(({ p }) => docInfo(p).aperto).length;
};

// La ritrasmissione manuale NON chiude lo scarto: mette in volo un tentativo.
// Il pallino resta finché l'esito non c'è — mentire qui sarebbe peggio che non
// avere il pallino. La nota si conserva su ENTRAMBE le azioni.
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

Object.assign(window, { docInfo, docIva, ccDocumenti, ccChiusure, giornataInfo, fiscTs, fiscOrdine, ccEuro, CC_SCARTI });

// gg/mm/aaaa da un Date
function ccFmtDate(d) {
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// ─── Selettore di periodo (P-106) ──────────────────────────────────────────
// Un calendario solo, due tocchi: il primo giorno apre il periodo, il secondo
// lo chiude (se viene prima, si scambiano); due tocchi sullo stesso giorno
// sono un giorno solo. Le scorciatoie coprono i casi che non meritano tocchi.
// Il periodo è {da, a} in ISO 'aaaa-mm-gg', che si confronta come stringa.
// Lo usano Cassa E Conti: vive qui perché questo file si carica prima.
const ccIso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function ccPeriodoLabel(p) {
  if (!p) return 'Filtra per data';
  const it = (iso) => iso.split('-').reverse().join('/');
  if (p.da === p.a) return it(p.da);
  // Il "da" senza anno: l'anno lo dice già il "a", e due anni per esteso
  // trasformano il bottone in una riga di tabella.
  return `${p.da.slice(8,10)}/${p.da.slice(5,7)} – ${it(p.a)}`;
}
function CcPeriodoPicker({ selected, onPick, onClear }) {
  const init = selected ? new Date(selected.a + 'T12:00:00') : new Date();
  const [view, setView] = React.useState(() => { const d = new Date(init); d.setDate(1); return d; });
  // Il primo tocco, in attesa del secondo. Vive solo qui dentro: fuori dal
  // popover esistono solo periodi completi.
  const [pending, setPending] = React.useState(null);
  const monthLabel = view.toLocaleDateString('it-IT', {month:'long', year:'numeric'});

  const firstDow = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
  const grid = [];
  for (let i = 0; i < firstDow; i++) grid.push(null);
  for (let n = 1; n <= daysInMonth; n++) grid.push(new Date(view.getFullYear(), view.getMonth(), n));
  while (grid.length % 7 !== 0) grid.push(null);

  const goPrev = () => { const d = new Date(view); d.setMonth(d.getMonth()-1); setView(d); };
  const goNext = () => { const d = new Date(view); d.setMonth(d.getMonth()+1); setView(d); };

  const scegli = (iso) => {
    if (!pending) { setPending(iso); return; }
    const [da, a] = pending <= iso ? [pending, iso] : [iso, pending];
    setPending(null);
    onPick({ da, a });
  };
  const oggi = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const presetGiorni = (n) => {
    const a = oggi(); const d = new Date(a); d.setDate(d.getDate() - (n - 1));
    setPending(null); onPick({ da: ccIso(d), a: ccIso(a) });
  };
  const presetMese = () => {
    const a = oggi(); const d = new Date(a); d.setDate(1);
    setPending(null); onPick({ da: ccIso(d), a: ccIso(a) });
  };

  const navBtn = {
    width:28, height:28, borderRadius:6, background:'#fff',
    border:`1px solid ${PN.BORDER}`, cursor:'pointer', fontFamily:'inherit',
    color: PN.TEXT, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center',
  };
  const presetBtn = {
    flex:1, padding:'6px 4px', borderRadius:7,
    background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
    fontSize: 11.5, fontWeight:700, color: PN.TEXT,
    cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
  };

  return (
    <div onClick={e=>e.stopPropagation()} style={{
      position:'absolute', top:'100%', right:0, marginTop:8, zIndex:60,
      width:280, padding:14, background:'#fff', borderRadius:12,
      border:`1px solid ${PN.BORDER}`, boxShadow:'0 12px 36px rgba(15,17,21,0.14)',
    }}>
      {/* Scorciatoie sopra il calendario: chi cerca "ieri e oggi" non deve
          imparare il gesto dei due tocchi per usarle. «Oggi e ieri» (P-111) è
          l'intervallo che un verificatore può chiedere di vedere, e resta a
          giorni interi come le altre. */}
      <div style={{display:'flex', gap:6, marginBottom:12, flexWrap:'wrap'}}>
        <button style={presetBtn} onClick={() => presetGiorni(1)}>Oggi</button>
        <button style={presetBtn} onClick={() => presetGiorni(2)}>Oggi e ieri</button>
        <button style={presetBtn} onClick={() => presetGiorni(7)}>Ultimi 7 giorni</button>
        <button style={presetBtn} onClick={presetMese}>Questo mese</button>
      </div>
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
          const iso = ccIso(day);
          // Con un primo tocco in sospeso il periodo vecchio non si evidenzia
          // più: si sta già scegliendo il prossimo.
          const estremo = pending ? iso === pending
            : !!selected && (iso === selected.da || iso === selected.a);
          const dentro = !pending && !!selected && iso > selected.da && iso < selected.a;
          return (
            <button key={i} onClick={() => scegli(iso)} style={{
              padding:'7px 0', borderRadius:7, border:'none', fontFamily:'inherit',
              background: estremo ? PN.TEXT : dentro ? C.SURF_ALT : 'transparent',
              color: estremo ? '#fff' : PN.TEXT,
              fontSize: C.T_SM, fontWeight: estremo ? 700 : 500, cursor:'pointer',
            }}>{day.getDate()}</button>
          );
        })}
      </div>
      <div style={{
        marginTop:10, fontSize:11.5, color: PN.MUTED, textAlign:'center',
        minHeight: 15,
      }}>
        {pending
          ? <>Inizio: <b style={{color: PN.TEXT}}>{pending.split('-').reverse().join('/')}</b> · tocca il giorno di fine</>
          : 'Tocca due giorni per un periodo'}
      </div>
      {selected && !pending && (
        <button onClick={onClear} style={{
          width:'100%', marginTop:10, padding:'8px', borderRadius:8,
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
          fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, cursor:'pointer', fontFamily:'inherit',
        }}>Mostra tutte</button>
      )}
    </div>
  );
}
window.CcPeriodoPicker = CcPeriodoPicker;
window.ccPeriodoLabel = ccPeriodoLabel;

// ─── «In caso di controllo» (P-111 · progetto tecnico §4.3) ─────────────────
// Nel regime attuale la prova non è una schermata del gestionale: sono i
// documenti memorizzati dal sistema dell'Agenzia, che l'esercente mostra dal
// portale con le proprie credenziali. Quello che segue quindi NON è la
// finestra per il verificatore — quella non si costruisce (§4.3), e chi la
// costruisce promette una funzione senza valore probatorio: è l'istruzione,
// col percorso esatto e il collegamento, più la scorciatoia all'unica lista
// che il gestionale ha già, i conti del periodo.
//
// Sta in un foglio, non in un riquadro fisso in coda a Conti: un controllo è
// raro, e un paragrafo permanente sotto una lista lunga è rumore tutti i
// giorni e irraggiungibile il giorno che serve. Lo aprono il link grigio in
// coda alle tab, ⌘K e la FAQ del Supporto — una copia sola del testo. Nel
// regime della Soluzione non compare: al suo posto c'è la console.
const ccPortale = () => window.PN_PORTALE_FC || 'https://ivaservizi.agenziaentrate.gov.it/portale/';

// Il link non deve catturare l'occhio — niente riempimento, niente bordo,
// niente peso — ma sta in alto e non scorre via, perché il giorno che serve
// si ha fretta. Chi non lo cerca non lo vede; chi lo cerca sa dov'è.
function CcControlloLink({ onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} title="Dove sono gli scontrini trasmessi, e come mostrarli"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        alignSelf:'center', marginBottom: 4, padding:'4px 2px',
        background:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
        fontSize: 12, fontWeight: 500, color: hover ? PN.TEXT : PN.MUTED,
        textDecoration:'underline', textUnderlineOffset: 3, whiteSpace:'nowrap',
        transition:'color 140ms ease',
      }}>In caso di controllo</button>
  );
}

const CC_METODO = { contanti:'Contanti', carta:'Carta', byup:'Byup app', piattaforma:'Piattaforma' };

// I documenti del periodo: i pagamenti dei conti e le loro rettifiche, che
// sono documenti a sé ed sono partite anche loro — senza, i totali non
// tornerebbero con quelli del portale. Il periodo si applica alla data del
// DOCUMENTO, non a quella del conto: è la data che il portale elenca.
function ccDocsPeriodo(periodo) {
  const dentro = (ora) => {
    const g = String(ora || '').split(' ')[0];
    return !!g && (!periodo || (g >= periodo.da && g <= periodo.a));
  };
  const rif = (c) => [c.tavolo, c.cliente].filter(Boolean).join(' · ');
  const giorno = (ora) => String(ora || '').split(' ')[0];
  // Il documento accodato nella finestra di divieto parte a mezzanotte: la sua
  // giornata fiscale è quella del giorno dopo, ed è lì che il portale lo
  // elenca. Metterlo sotto la data di emissione farebbe cercare invano.
  const giornataDopo = (ora) => { const d = new Date(giorno(ora) + 'T12:00:00'); d.setDate(d.getDate() + 1); return ccIso(d); };
  const out = [];
  ccDocumenti().forEach(({ conto, p }) => {
    if (dentro(p.ora)) {
      const i = docInfo(p);
      out.push({ tipo:'Documento', numero: p.scontrinoNum || '—', ora: p.ora, importo: p.amount,
        giornata: i.tipo === 'waiting' ? giornataDopo(p.ora) : giorno(p.ora),
        metodo: CC_METODO[p.method] || p.method, esito: DOC_LABEL[i.tipo] || i.tipo,
        id: i.idTrasm || '', dettaglio: i.scarto ? i.scarto.motivo : '', rif: rif(conto) });
    }
    const rett = typeof rettDi === 'function' ? rettDi(p) : null;
    if (!rett) return;
    (rett.resi || []).forEach((r, k) => {
      if (!dentro(r.ora)) return;
      const f = rettFisc(p, r, k);
      out.push({ tipo:'Reso', numero: rettDocReso(p, k), ora: r.ora, importo: -r.amount, giornata: giorno(r.ora),
        metodo: CC_METODO[p.method] || p.method, esito: f.idTrasm ? 'Trasmesso' : (DOC_LABEL[f.esito] || f.esito),
        id: f.idTrasm || '', dettaglio: r.motivo || '', rif: `Reso di ${p.scontrinoNum}` });
    });
    if (rett.annullo && dentro(rett.annullo.ora)) {
      const f = rettFisc(p, rett.annullo, 0, true);
      out.push({ tipo:'Annullo', numero: rettDocAnnullo(p), ora: rett.annullo.ora, importo: -rett.annullo.amount, giornata: giorno(rett.annullo.ora),
        metodo: CC_METODO[p.method] || p.method, esito: f.idTrasm ? 'Trasmesso' : (DOC_LABEL[f.esito] || f.esito),
        id: f.idTrasm || '', dettaglio: rett.annullo.motivo || '', rif: `Annullo di ${p.scontrinoNum}` });
    }
  });
  return out.sort((a, b) => String(a.ora).localeCompare(String(b.ora)));
}

// Punto e virgola e virgola decimale: il file si apre in Excel italiano senza
// che i numeri diventino testo. Il BOM perché gli accenti non si sfascino.
// La prima riga dice che cos'è e per che periodo: chi lo riapre fra un mese
// non deve indovinarlo dal nome del file.
function ccCsvPeriodo(docs, periodo) {
  const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const eur = (n) => n.toFixed(2).replace('.', ',');
  const it = (iso) => String(iso || '').split('-').reverse().join('/');
  const testa = ['tipo','numero_documento','data','ora','giornata_fiscale','importo','metodo','esito_dichiarato','identificativo_canale','riferimento','dettaglio'];
  const righe = docs.map(d => [d.tipo, d.numero, it(String(d.ora).split(' ')[0]), String(d.ora).split(' ')[1] || '',
    it(d.giornata), eur(d.importo), d.metodo, d.esito, d.id, d.rif, d.dettaglio].map(q).join(';'));
  const quando = ccPeriodoLabel(periodo);
  const nota = `# Documenti emessi da Byup Fresh · ${periodo ? quando : 'tutte le date'} · ${docs.length} document${docs.length === 1 ? 'o' : 'i'}. Elenco per il confronto con gli invii giornalieri del portale dell'Agenzia delle Entrate: i documenti che fanno prova sono quelli memorizzati dal sistema dell'Agenzia.`;
  return '﻿' + [nota, testa.join(';'), ...righe].join('\n');
}

function ccScarica(nome, contenuto) {
  const url = URL.createObjectURL(new Blob([contenuto], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = nome; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function CcControlloSheet({ onClose }) {
  // Parte da «oggi e ieri»: è l'intervallo che di solito viene chiesto, ed è
  // già una delle scorciatoie del selettore. Si cambia col selettore di
  // sempre — quello di Cassa e di Conti — e il periodo scelto è quello con
  // cui si arriva nella lista: la stessa finestra da confrontare col portale.
  const [periodo, setPeriodo] = React.useState(() => {
    const a = new Date(); a.setHours(0,0,0,0);
    const d = new Date(a); d.setDate(d.getDate() - 1);
    return { da: ccIso(d), a: ccIso(a) };
  });
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const pickerRef = React.useRef(null);
  React.useEffect(() => {
    if (!pickerOpen) return;
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const docs = ccDocsPeriodo(periodo);
  const totale = docs.reduce((t, d) => t + d.importo, 0);
  const [scaricato, setScaricato] = React.useState(false);
  const scarica = () => {
    const nome = periodo ? `Byup-documenti-${periodo.da}_${periodo.a}.csv` : 'Byup-documenti.csv';
    ccScarica(nome, ccCsvPeriodo(docs, periodo));
    setScaricato(true); setTimeout(() => setScaricato(false), 2200);
  };

  const btn = (label, onClick, primario, href) => {
    const st = {
      padding:'10px 16px', borderRadius: C.R_PILL, fontSize: C.T_SM, fontWeight: 700,
      cursor:'pointer', fontFamily:'inherit', textDecoration:'none', whiteSpace:'nowrap',
      background: primario ? PN.TEXT : PN.WHITE, color: primario ? '#fff' : PN.TEXT,
      border: primario ? 'none' : `1px solid ${PN.BORDER}`,
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 7,
    };
    return href
      ? <a href={href} target="_blank" rel="noopener noreferrer" className="pn-btn-feedback" style={st}>{label}</a>
      : <button onClick={onClick} style={st}>{label}</button>;
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, zIndex: 900, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:'min(560px, 100%)', maxHeight:'calc(var(--pn-vh, 100vh) - 40px)',
        background: PN.WHITE, borderRadius: 20, overflow:'visible',
        boxShadow:'0 30px 80px rgba(15,17,21,0.30)',
        display:'flex', flexDirection:'column',
      }}>
        <div style={{padding:'20px 24px 0', display:'flex', alignItems:'flex-start', gap: 14}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 11.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.5, textTransform:'uppercase'}}>Contabilità</div>
            <div style={{fontSize: 21, fontWeight: 800, color: PN.TEXT, letterSpacing: -0.3, marginTop: 2}}>In caso di controllo</div>
          </div>
          <button onClick={onClose} aria-label="Chiudi" style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            background: PN.WHITE, border:`1px solid ${PN.BORDER}`, color: PN.MUTED,
            fontSize: 15, cursor:'pointer', fontFamily:'inherit', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{padding:'14px 24px 0', fontSize: C.T_MD, color: PN.TEXT, lineHeight: 1.6}}>
          Nel regime attuale gli scontrini sono memorizzati dal sistema dell'Agenzia delle Entrate.
          Se un verificatore lo chiede, mostra i tuoi invii dal portale: <b>Fatture e Corrispettivi → Consultazione → Corrispettivi → Invii giornalieri</b>,
          con le tue credenziali Fisconline. Da qui puoi filtrare lo stesso periodo e stampare l'elenco per confrontarlo.
        </div>

        {/* Il periodo si sceglie qui e si porta dietro: chi arriva in Conti ci
            arriva già filtrato sulla finestra che gli è stata chiesta. */}
        <div style={{
          margin:'18px 24px 0', padding:'12px 14px', borderRadius: C.R_MD,
          background: C.SURF_ALT, display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap',
        }}>
          <div style={{minWidth: 0}}>
            <div style={{fontSize: C.T_SM, color: PN.TEXT, fontWeight: 700}}>Periodo chiesto</div>
            <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 2}}>
              {docs.length === 0 ? 'Nessun documento' : `${docs.length} document${docs.length === 1 ? 'o' : 'i'} · ${ccEuro(totale)}`}
            </div>
          </div>
          <div ref={pickerRef} style={{position:'relative', marginLeft:'auto'}}>
            <button onClick={() => setPickerOpen(o => !o)} style={{
              display:'inline-flex', alignItems:'center', gap: 7, padding:'8px 13px',
              borderRadius: C.R_SM, background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
              fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
            }}>
              <Ic.calendar size={14}/> {ccPeriodoLabel(periodo)}
            </button>
            {pickerOpen && (
              <CcPeriodoPicker
                selected={periodo}
                onPick={(p) => { setPeriodo(p); setPickerOpen(false); }}
                onClear={() => { setPeriodo(null); setPickerOpen(false); }}
              />
            )}
          </div>
        </div>

        <div style={{padding:'16px 24px 0', display:'flex', gap: 10, flexWrap:'wrap'}}>
          {btn(<React.Fragment>Apri il portale <span aria-hidden="true">↗</span></React.Fragment>, null, true, ccPortale())}
          {btn(scaricato ? 'Scaricato ✓' : 'Scarica i dati del periodo', scarica)}
        </div>

        <div style={{padding:'14px 24px 20px', fontSize: C.T_XS, color: PN.MUTED, lineHeight: 1.5}}>
          Il file è l'elenco di Byup, e serve a confrontare: i documenti che fanno prova sono quelli memorizzati dal sistema dell'Agenzia.
        </div>
      </div>
    </div>
  );
}
window.CcControlloLink = CcControlloLink;
window.CcControlloSheet = CcControlloSheet;

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
  // Blu informativo, non ambra: waiting non è un guasto da rimediare ma una
  // certezza programmata — parte a mezzanotte da solo. L'ambra è della coda
  // di ritrasmissione, che invece è un problema in lavorazione.
  waiting:        { color:'#1E40AF', bg:'#DBEAFE' },
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

const DOC_LABEL = { ok:'Trasmesso', ritrasmissione:'In ritrasmissione', scartato:'Scartato', gestito:'Gestito', waiting:'In attesa di mezzanotte' };

function ContCassa({ cassaOpen = false, setCassaOpen, onApriConti }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [selPeriodo, setSelPeriodo] = React.useState(null); // {da, a} ISO o null
  const pickerRef = React.useRef(null);
  useFiscTick();

  // ── Chiusura di giornata e conteggio del fondo: DUE gesti (P-20 · D-22) ──
  // La chiusura CONTABILE può avvenire da sola all'ora del cambio giornata
  // (P-19, byup_rollover_time — la sede mock ha le 04:00: smette alle 2);
  // il conteggio del contante resta il gesto di una persona, registrabile
  // anche dopo, con lo scostamento calcolato AL CONTEGGIO, con ora e autore.
  // Lo stato demo di partenza racconta proprio quel locale: giornata chiusa
  // da sola alle 04:00, fondo di ieri ancora da contare.
  const rollover = (() => {
    try { return localStorage.getItem('byup_rollover_time') || '04:00'; }
    catch (e) { return '04:00'; }
  })();
  const [apriModal, setApriModal] = React.useState(false);
  const [chiudiModal, setChiudiModal] = React.useState(false);  // chiusura di giornata
  const [contaModal, setContaModal] = React.useState(false);    // conteggio del fondo
  const [fondoCassa, setFondoCassa] = React.useState(150);      // il fondo con cui la giornata era partita
  const [aperturaOra, setAperturaOra] = React.useState(null);
  const [chiusura, setChiusura] = React.useState({ ora: rollover, auto: true }); // {ora, auto} | null
  const [conteggio, setConteggio] = React.useState(null); // {contato, atteso, differenza, ora, autore} | null

  function confermaApertura(amount) {
    setFondoCassa(amount);
    setAperturaOra(new Date().toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'}));
    setChiusura(null);
    setConteggio(null);
    setCassaOpen && setCassaOpen(true);
    setApriModal(false);
  }
  function confermaChiusuraGiornata() {
    setChiusura({ ora: new Date().toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'}), auto: false });
    setCassaOpen && setCassaOpen(false);
    setChiudiModal(false);
  }
  function confermaConteggio(c) {
    setConteggio(c);
    setContaModal(false);
  }

  React.useEffect(() => {
    if (!pickerOpen) return;
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);

  // Le chiusure sono DERIVATE dai documenti (i pagamenti dei conti): totali,
  // IVA e stato di trasmissione sono somme, non numeri scritti altrove.
  const allRows = ccChiusure().map(c => ({ ...c, giornata: giornataInfo(c) }));
  // `iso` si confronta come stringa: il periodo è un between, non un uguale.
  const rows = selPeriodo ? allRows.filter(r => r.iso >= selPeriodo.da && r.iso <= selPeriodo.a) : allRows;
  const totIncassato = rows.reduce((s,r)=>s+r.totale,0);
  // Il conteggio è sui DOCUMENTI di tutte le giornate, non su quelle filtrate:
  // uno scarto non smette di esistere perché stai guardando un altro giorno.
  const scartiAperti = allRows.reduce((s,r) => s + r.giornata.scartati, 0);

  // Colonne larghe quanto il loro contenuto (misurato: intestazione o cella, la
  // maggiore) e spazio residuo distribuito con space-between: i vuoti fra le
  // colonne restano tutti uguali e crescono insieme alla finestra, senza
  // accumularsi in fondo. Con le frazioni — uguali o no — le colonne
  // diventavano larghe uguali e il vuoto dipendeva dalla lunghezza
  // dell'etichetta: "Carta e digitale" e "Trasmissione" restavano appiccicate
  // mentre "IVA 10%" nuotava. Le larghezze sono fisse perché intestazione e
  // righe sono griglie separate: con `auto` ogni riga si misurerebbe da sé e
  // le colonne non sarebbero più allineate fra loro.
  const cols = '107px 135px 56px 57px 72px 122px 160px';

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Avviso bloccante: password Fisconline scaduta. Compare qui perché è
          qui che si vede il danno — gli scontrini non partono — ma la cura sta
          nei Dati fiscali, e ci si va col bottone. I testi sono quelli di
          CC_SCARTI.credenziali: una voce sola, due superfici. */}
      {ccCredStato().stato !== 'ok' && (() => {
        const cr = ccCredStato();
        const chi = ccCredChi();
        const incaricato = chi.ruolo === 'incaricato';
        const urgente = cr.scaduta || cr.gradino === 3;
        return (
        <div data-cc-cred={cr.stato} style={{
          display:'flex', alignItems:'flex-start', gap: 14,
          padding: '14px 18px',
          background: urgente ? '#FEF2F2' : PN.AMBER_SOFT,
          border: `1px solid ${urgente ? '#FECACA' : '#FCD34D'}`,
          borderRadius: C.R_MD,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: urgente ? '#DC2626' : PN.AMBER,
            display:'grid', placeItems:'center', flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/>
            </svg>
          </div>
          <div style={{flex:1, minWidth: 0}}>
            <div style={{fontSize: C.T_SM, fontWeight: 700, color: urgente ? '#991B1B' : '#8A5A00'}}>
              {cr.scaduta
                ? 'La password Fisconline è scaduta: gli scontrini non partono'
                : `La password Fisconline scade tra ${cr.giorni} giorn${cr.giorni === 1 ? 'o' : 'i'}`}
              {incaricato ? ` · la rinnova ${chi.nome}` : ''}
            </div>
            <div style={{fontSize: C.T_XS, color: urgente ? '#B91C1C' : '#8A5A00', marginTop: 2, lineHeight: 1.5}}>
              {cr.scaduta
                ? `${CC_SCARTI.credenziali.causa.replace('del titolare', incaricato ? `di ${chi.nome}` : 'del titolare')} ${CC_SCARTI.credenziali.azione}`
                : `Scade il ${cr.scadenza}. ${incaricato ? `La cambia ${chi.nome} sul sito dell'Agenzia, poi si inserisce` : 'Prima la cambi sul sito dell\'Agenzia, poi la inserisci'} in Impostazioni → Dati fiscali: alla conferma parte una trasmissione di prova. Alla scadenza l'emissione si ferma in cassa, in sala e sull'App Staff.`}
            </div>
          </div>
          <button
            onClick={() => { window.location.href = CC_SCARTI.credenziali.vaiHref; }}
            className="pn-btn-feedback"
            style={{
              padding:'9px 18px', borderRadius: C.R_PILL, alignSelf:'center',
              background: urgente ? '#DC2626' : PN.AMBER, color:'#fff', border:'none', flexShrink: 0,
              fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            }}>{CC_SCARTI.credenziali.vaiLabel}</button>
        </div>
        );
      })()}

      {/* Banner stato cassa — tre fasi: aperta · giornata chiusa col fondo
          ancora da contare (il caso nuovo di P-20) · quadrata. */}
      {(() => {
        const daContare = !cassaOpen && chiusura && !conteggio;
        const bg = cassaOpen ? '#ECFDF5' : daContare ? '#FFFBEB' : '#FEF2F2';
        const bordo = cassaOpen ? '#A7F3D0' : daContare ? '#FCD34D' : '#FECACA';
        const fgTitolo = cassaOpen ? '#065F46' : daContare ? '#92400E' : '#991B1B';
        const fgSotto = cassaOpen ? '#047857' : daContare ? '#B45309' : '#B91C1C';
        const pallino = cassaOpen ? PN.GREEN : daContare ? PN.AMBER : PN.RED;
        const diffZero = conteggio && Math.abs(conteggio.differenza) < 0.01;
        return (
          <div style={{
            display:'flex', alignItems:'center', gap: 14,
            padding: '14px 18px',
            background: bg, border: `1px solid ${bordo}`,
            borderRadius: C.R_MD, flexWrap:'wrap',
          }}>
            <span style={{
              width:10, height:10, borderRadius:'50%',
              background: pallino,
              boxShadow: `0 0 0 4px ${bordo}55`,
            }}/>
            <div style={{flex:1, minWidth: 220}}>
              <div style={{fontSize: C.T_SM, fontWeight: 700, color: fgTitolo}}>
                {cassaOpen ? 'Cassa aperta'
                  : daContare ? `Giornata chiusa alle ${chiusura.ora}${chiusura.auto ? ' (cambio giornata)' : ''} · fondo da contare`
                  : 'Giornata chiusa'}
              </div>
              <div style={{fontSize: C.T_XS, color: fgSotto, marginTop: 2}}>
                {cassaOpen
                  ? `Aperta alle ${aperturaOra || '09:30'} · Da: Marco${fondoCassa != null ? ` · Fondo €${fondoCassa.toFixed(2)}` : ''}`
                  : daContare
                    ? (chiusura.auto
                        ? 'La chiusura contabile è avvenuta da sola; il contante si conta quando ci sei.'
                        : 'La chiusura contabile è fatta; il contante si conta quando ci sei.')
                    : conteggio
                      ? (diffZero
                          ? `Quadratura senza scostamenti · fondo contato alle ${conteggio.ora} da ${conteggio.autore}`
                          : `Scostamento ${conteggio.differenza > 0 ? '−' : '+'}€${Math.abs(conteggio.differenza).toFixed(2)} · contato alle ${conteggio.ora} da ${conteggio.autore}`)
                      : 'Quadratura completata correttamente'}
              </div>
            </div>
            {cassaOpen ? (
              <button
                onClick={() => setChiudiModal(true)}
                className="cassa-btn"
                style={{
                  padding:'9px 18px', borderRadius: C.R_PILL,
                  background: PN.TEXT, color:'#fff', border:'none', flexShrink: 0,
                  fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>Chiudi giornata</button>
            ) : daContare ? (
              <span style={{display:'inline-flex', gap: 8, flexShrink: 0}}>
                <button
                  onClick={() => setApriModal(true)}
                  className="cassa-btn"
                  style={{
                    padding:'9px 18px', borderRadius: C.R_PILL,
                    background:'transparent', color:'#92400E', border:'1px solid #FCD34D',
                    fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                  }}>Apri cassa</button>
                <button
                  onClick={() => setContaModal(true)}
                  className="cassa-btn"
                  style={{
                    padding:'9px 18px', borderRadius: C.R_PILL,
                    background: PN.AMBER, color:'#fff', border:'none',
                    fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                    animation: 'cassaPulse 2s ease-out infinite',
                  }}>Conta il fondo</button>
              </span>
            ) : (
              <button
                onClick={() => setApriModal(true)}
                className="cassa-btn"
                style={{
                  padding:'9px 18px', borderRadius: C.R_PILL,
                  background: '#059669', color:'#fff', border:'none', flexShrink: 0,
                  fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                  animation: 'cassaPulse 2s ease-out infinite',
                }}>Apri cassa</button>
            )}
          </div>
        );
      })()}

      {/* Popup apertura cassa */}
      <ApriCassaModal
        open={apriModal}
        onClose={() => setApriModal(false)}
        onConfirm={confermaApertura}
      />

      {/* Chiusura di giornata: la parte contabile, IVA compresa (finta e
          dichiarata) — il fondo NON si conta qui. */}
      <ChiudiGiornataModal
        open={chiudiModal}
        onClose={() => setChiudiModal(false)}
        onConfirm={confermaChiusuraGiornata}
      />

      {/* Conteggio del fondo: il gesto della persona, anche dopo. */}
      <ContaFondoModal
        open={contaModal}
        fondoCassa={fondoCassa}
        onClose={() => setContaModal(false)}
        onConfirm={confermaConteggio}
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
              <Ic.calendar size={14}/> {ccPeriodoLabel(selPeriodo)}
            </button>
            {pickerOpen && (
              <CcPeriodoPicker
                selected={selPeriodo}
                onPick={(p) => { setSelPeriodo(p); setPickerOpen(false); }}
                onClear={() => { setSelPeriodo(null); setPickerOpen(false); }}
              />
            )}
          </div>
        </div>

        {/* Tabella chiusure */}
        <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`}}>
          <div style={{
            display:'grid', gridTemplateColumns: cols, justifyContent:'space-between',
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
            <span style={{whiteSpace:'nowrap'}}>Trasmissione</span>
          </div>
          <MaxRowsScroll maxRows={10}>
          {rows.map((r,i) => (
            <div key={r.id}
              onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FA'; }}
              onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; }}
              style={{
              display:'grid', gridTemplateColumns: cols, justifyContent:'space-between',
              padding:'12px 14px', alignItems:'center',
              fontSize: C.T_SM, color: PN.TEXT,
              borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              background: PN.WHITE,
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
              {/* Il chip è un rimando, non un contenitore: la lista dei
                  documenti è in Conti, e lì si va. */}
              <span style={{minWidth: 0}}>
                <button onClick={() => onApriConti && onApriConti(r.iso, r.giornata.stato)}
                  title={`Apri i documenti del ${r.date} in Conti`}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.96)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap: 8,
                    background:'transparent', border:'none', padding: 0,
                    cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                    transition:'filter 140ms ease',
                  }}>
                  <GiornataChip info={r.giornata}/>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: PN.MUTED_SOFT, flexShrink: 0}}><path d="M7 17 17 7M8 7h9v9"/></svg>
                </button>
              </span>
            </div>
          ))}
          </MaxRowsScroll>
        </div>
      </div>

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
window.FiscPill = FiscPill;
window.DOC_LABEL = DOC_LABEL;
window.useFiscTick = useFiscTick;
