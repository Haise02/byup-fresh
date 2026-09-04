// Notifiche dropdown — campanella + tendina condivisa cross-page

// Mesi correnti per i testi delle notifiche: la demo non deve mai sembrare vecchia.
const _PN_MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const _pnMese = (back) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - back); return _PN_MESI[d.getMonth()]; };

const PN_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'update',
    title: 'Nuova versione di byup disponibile',
    body: 'Abbiamo migliorato la gestione del calendario prenotazioni e aggiunto i grafici predittivi.',
    href: 'byup Sala.html?tab=calendar',
    time: '2 ore fa',
    unread: true,
  },
  {
    id: 'n2',
    type: 'payment',
    title: 'Pagamento ricevuto',
    body: 'Hai ricevuto €1.247,80 sul tuo conto Stripe. Disponibile entro 2 giorni lavorativi.',
    href: 'byup Contabilita.html',
    time: 'Ieri',
    unread: true,
  },
  {
    id: 'n3',
    type: 'system',
    title: 'Report mensile pronto',
    body: `Il riepilogo di ${_pnMese(1)} è disponibile in Statistiche. +12% vs ${_pnMese(2)}.`,
    href: 'byup Statistiche.html',
    time: '2 giorni fa',
    unread: true,
  },
  {
    id: 'n4',
    type: 'tip',
    title: 'Suggerimento da byup',
    body: 'Aggiungi delle foto per aumentare gli ordini fino al 30%.',
    href: 'byup Impostazioni.html',
    time: '4 giorni fa',
    unread: false,
  },
  {
    id: 'n5',
    type: 'billing',
    title: 'Fattura del piano Business',
    body: `La fattura di ${_pnMese(1)} (€49,00) è disponibile in Contabilità → Fatture.`,
    href: 'byup Contabilita.html',
    time: '1 settimana fa',
    unread: false,
  },
  {
    id: 'n6',
    type: 'feature',
    title: 'Promozioni: nuova funzione',
    body: 'Ora puoi creare promo a tempo che appaiono in vetrina. Provala in Statistiche.',
    href: 'byup Statistiche.html',
    time: '2 settimane fa',
    unread: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Stato notifiche CONDIVISO fra pagine (localStorage + evento).
// La voce "Notifiche" in fondo alla sidebar non esiste più: il conteggio vive
// sull'avatar del profilo e l'elenco sta in Profilo → Notifiche. Due punti
// diversi della UI leggono la stessa cosa, quindi lo stato non può più stare
// dentro un solo componente.
// ═══════════════════════════════════════════════════════════════════════════
const BYUP_NOTIF_KEY = 'byup_notifiche_stato';
function _byupNotifStato() {
  try {
    const s = localStorage.getItem(BYUP_NOTIF_KEY);
    const v = s ? JSON.parse(s) : null;
    return { lette: (v && v.lette) || [], eliminate: (v && v.eliminate) || [] };
  } catch(e) { return { lette: [], eliminate: [] }; }
}
function _byupNotifSalva(st) {
  try {
    localStorage.setItem(BYUP_NOTIF_KEY, JSON.stringify(st));
    window.dispatchEvent(new Event('byup-notifiche-change'));
  } catch(e) {}
}
// ─── I due collegamenti che l'onboarding non chiede più ─────────────────────
// Stripe e il fiscale sono usciti dall'onboarding (4 settembre 2026): fermare
// qualcuno sulla porta per un atto che si compie su un altro sito — la
// verifica di Stripe, la delega con SPID — voleva dire non farlo entrare. Ora
// entra, e sono le prime due notifiche che trova: una porta su POS e
// integrazioni, l'altra in Dati fiscali. Restano finché il collegamento non
// c'è, perché senza il primo non incassa e senza il secondo non emette.
function _byupNotificheAttivazione() {
  const out = [];
  try {
    if (window.byupReadStripe && window.byupReadStripe().status === 'da_collegare') {
      out.push({ id: 'attiva-stripe', type: 'payment', unread: true,
        href: 'byup Impostazioni.html?page=integrazioni',
        title: 'Collega Stripe per incassare',
        body: 'Finché il conto non è collegato non ricevi pagamenti: né carte al tavolo, né in app, né online. Si collega da POS e integrazioni, e l\'identità la verifica Stripe.',
        time: 'Da fare per primo' });
    }
    const credMai = window.byupAdeCredStato && !window.byupAdeCredStato().rinnovo;
    const delegaGiu = window.byupDelegaCompleta && !window.byupDelegaCompleta();
    if (credMai || delegaGiu) {
      const manca = credMai && delegaGiu
        ? 'Mancano la delega sul portale dell\'Agenzia e le credenziali Fisconline di chi trasmette'
        : credMai ? 'Mancano le credenziali Fisconline di chi trasmette'
        : 'Manca la delega sul portale dell\'Agenzia';
      out.push({ id: `attiva-fiscale-${credMai ? 'cred' : ''}${delegaGiu ? 'delega' : ''}`, type: 'fiscal', unread: true,
        href: 'byup Impostazioni.html?page=fiscali',
        title: 'Collega i dati fiscali all\'Agenzia',
        body: `${manca}: finché non ci sono, scontrini e fatture non partono. Si fa tutto in Dati fiscali, e la delega si dà col tuo SPID in due minuti.`,
        time: 'Da fare per primo' });
    }
  } catch (e) {}
  return out;
}

// ─── Le notifiche fiscali, derivate dai registri (P-105, P-104) ─────────────
// Non sono scritte a mano: nascono dallo stato. Il censimento dei POS non sta
// più nell'onboarding — ogni strumento nasce col suo collegamento (Stripe, un
// telefono in Byup Staff) e da lì la campanella lo dice, con la finestra di
// FISC-03 e i suoi gradini; l'id porta la fase, così ogni gradino torna non
// letto anche se il precedente era stato letto: è l'insistenza voluta, perché
// la comunicazione omessa è sanzionata. Stessa cosa per la password: della
// ditta (da rinnovare da lei) o dell'incaricato di Byup (la rinnova Byup).
function _byupNotificheFiscali() {
  const out = [];
  try {
    if (window.byupReadPosCensimento && window.pnPosPromemoria) {
      window.byupReadPosCensimento().forEach(r => {
        const p = window.pnPosPromemoria(r);
        if (p.fase === 'ok') return;
        const nome = r.name;
        const href = `byup Impostazioni.html?page=fiscali&card=pos&strumento=${r.id}`;
        const daAgg = r.fiscal_link_status === 'varied' || r.fiscal_link_status === 'unlinked';
        const verbo = daAgg ? 'aggiornare' : 'comunicare';
        const t = p.fase === 'lontana' ? { title: `${daAgg ? 'Strumento da aggiornare' : 'Nuovo strumento da comunicare'} all'Agenzia`, body: `${nome}: ${p.testo.toLowerCase()}. Il foglio precompilato è in Dati fiscali.`, time: 'Alla nascita dello strumento' }
          : p.fase === 'aperta' ? { title: `Finestra aperta: ${verbo} ${nome} all'Agenzia`, body: `${p.testo}. Apri il foglio precompilato e dichiara la comunicazione.`, time: 'Finestra aperta' }
          : p.fase === 'ultimi' ? { title: `Ultimi giorni per ${verbo} ${nome}`, body: `${p.testo}. Oltre la finestra la comunicazione è tardiva, e la tardiva è sanzionata.`, time: 'Scadenza vicina' }
          : { title: `${nome}: comunicazione all'Agenzia in ritardo`, body: `${p.testo}. La comunicazione omessa o tardiva è sanzionata: falla ora dal foglio precompilato e dichiarala.`, time: 'Finestra scaduta' };
        out.push({ id: `pos-${r.id}-${p.fase}-${r.varied_at || r.activated_at}`, type: 'fiscal', href, unread: true, ...t });
      });
    }
    // P-116 (D-103) e P-120: le credenziali dell'Agenzia sono SEMPRE
    // dell'esercente, per tutte le forme — del titolare per la ditta, della
    // persona che il locale ha nominato incaricata sul portale per società ed
    // enti. Il ramo dell'«incaricato di Byup», che diceva «la rinnova Byup, tu
    // non devi fare nulla», è morto con la figura che lo reggeva.
    // I gradini sono tre e sono veri: a 14, 7 e 3 giorni parte una notifica,
    // e un'altra alla scadenza. L'id porta il gradino, così ognuno torna non
    // letto anche se il precedente era stato letto: è l'insistenza voluta,
    // perché alla scadenza l'emissione si ferma.
    if (window.byupAdeCredStato) {
      const cr = window.byupAdeCredStato();
      const chi = window.pnAdeChiRinnova ? window.pnAdeChiRinnova() : { ruolo: 'titolare' };
      const incaricato = chi.ruolo === 'incaricato';
      const dilei = incaricato ? `di ${chi.nome}` : 'del titolare';
      // Mai inserite: non è una scadenza, è un collegamento che non c'è
      // ancora — lo dice la notifica di attivazione, e una sola volta.
      if (cr.stato !== 'ok' && cr.rinnovo) {
        const gradino = cr.scaduta ? 'scaduta' : String(cr.gradino);
        out.push({ id: `cred-${gradino}-${cr.rinnovo || 'mai'}`, type: 'fiscal', href: 'byup Impostazioni.html?page=fiscali', unread: true,
          title: cr.scaduta
            ? 'Password Fisconline scaduta: gli scontrini non partono'
            : `La password Fisconline scade tra ${cr.giorni} giorn${cr.giorni === 1 ? 'o' : 'i'}${incaricato ? ` · la rinnova ${chi.nome}` : ''}`,
          body: cr.scaduta
            ? `L'emissione è ferma in cassa, in sala e sull'App Staff. Si cambia la password ${dilei} sul sito dell'Agenzia e poi si inserisce in Dati fiscali: alla conferma parte una trasmissione di prova che sblocca.`
            : `Scade il ${cr.scadenza}. ${incaricato ? `La cambia ${chi.nome} sul sito dell'Agenzia, poi si inserisce` : 'Prima la cambi sul sito dell\'Agenzia, poi la inserisci'} in Dati fiscali. Alla scadenza gli scontrini smettono di partire.`,
          time: cr.scaduta ? 'Scaduta' : `Promemoria a ${cr.gradino} giorni` });
      }
    }
  } catch (e) {}
  return out;
}
function _byupTutteLeNotifiche() { return [..._byupNotificheAttivazione(), ..._byupNotificheFiscali(), ...PN_NOTIFICATIONS]; }
window.byupReadNotifiche = function() {
  const st = _byupNotifStato();
  return _byupTutteLeNotifiche()
    .filter(n => !st.eliminate.includes(n.id))
    .map(n => ({ ...n, unread: n.unread && !st.lette.includes(n.id) }));
};
window.byupNotificheNonLette = function() {
  return window.byupReadNotifiche().filter(n => n.unread).length;
};
window.byupNotificaLetta = function(id) {
  const st = _byupNotifStato();
  if (!st.lette.includes(id)) { st.lette.push(id); _byupNotifSalva(st); }
};
window.byupNotificheTutteLette = function() {
  const st = _byupNotifStato();
  st.lette = _byupTutteLeNotifiche().map(n => n.id);
  _byupNotifSalva(st);
};
window.byupNotificaElimina = function(id) {
  const st = _byupNotifStato();
  if (!st.eliminate.includes(id)) { st.eliminate.push(id); _byupNotifSalva(st); }
};
// Hook condiviso: tiene allineati badge e sezione senza passaggi di props fra
// componenti che vivono in pagine diverse.
window.byupUseNotifiche = function() {
  const [items, setItems] = React.useState(() => window.byupReadNotifiche());
  React.useEffect(() => {
    const up = () => setItems(window.byupReadNotifiche());
    // Le notifiche fiscali cambiano coi registri: si riascoltano anche loro.
    const ev = ['byup-notifiche-change', 'storage', 'byup-pos-censimento', 'byup-ade-cred-change', 'byup-ade-incaricato-change', 'byup-stripe-change', 'byup-ade-delega-change'];
    ev.forEach(e => window.addEventListener(e, up));
    return () => { ev.forEach(e => window.removeEventListener(e, up)); };
  }, []);
  return items;
};

// ═══════════════════════════════════════════════════════════════════════════
// L'ARRIVO DI UNA NOTIFICA (P-115)
// ═══════════════════════════════════════════════════════════════════════════
// Una notifica che non avverte non è una notifica: prima le notifiche — fiscali
// comprese — si vedevano solo aprendo Profilo → Notifiche, e nulla diceva che
// ne era arrivata una. La casa resta Profilo → Notifiche; qui c'è il segnale.
// Nel mockup l'avviso è un riquadro in basso a destra che compare per qualche
// secondo con titolo e prima riga; nel prodotto sarà la notifica del browser o
// del dispositivo. Il suono suona se in Impostazioni il suono è attivo
// (byup_notif_suono): è finto quanto basta — una nota breve con WebAudio, per
// non portarsi dietro un file — e non suona mai senza che l'utente abbia
// toccato la pagina, perché il browser lo vieta.
const BYUP_NOTIF_SUONO_KEY = 'byup_notif_suono';
window.byupNotifSuonoAttivo = function () {
  try { return localStorage.getItem(BYUP_NOTIF_SUONO_KEY) !== '0'; } catch (e) { return true; }
};
window.byupNotifSuonoImposta = function (on) {
  try { localStorage.setItem(BYUP_NOTIF_SUONO_KEY, on ? '1' : '0'); } catch (e) {}
  window.dispatchEvent(new Event('byup-notif-suono'));
};
function byupNotifSuona() {
  if (!window.byupNotifSuonoAttivo()) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === 'suspended') { ctx.close(); return; }   // niente gesto: niente suono
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(1174, ctx.currentTime + 0.09);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.34);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.36);
    setTimeout(() => { try { ctx.close(); } catch (e) {} }, 600);
  } catch (e) {}
}
// L'avviso lo si annuncia da qualunque schermata: chi lo mostra è
// PnNotifArrivo, montato una volta sola nella shell.
window.byupNotificaArrivo = function (n) {
  window.dispatchEvent(new CustomEvent('byup-notifica-arrivo', { detail: n }));
};

function PnNotifArrivo() {
  const [coda, setCoda] = React.useState([]);
  React.useEffect(() => {
    const arriva = (e) => {
      const n = e.detail; if (!n) return;
      byupNotifSuona();
      setCoda(c => [...c, { ...n, k: 'a' + Date.now() + Math.random() }]);
      setTimeout(() => setCoda(c => c.slice(1)), 6000);
    };
    window.addEventListener('byup-notifica-arrivo', arriva);
    return () => window.removeEventListener('byup-notifica-arrivo', arriva);
  }, []);
  if (!coda.length) return null;
  return (
    <div data-notif-arrivo style={{
      position: 'fixed', right: 20, bottom: 20, zIndex: 400,
      display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      <style>{`@keyframes pnNotifIn { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: none; } }`}</style>
      {coda.map(n => (
        <div key={n.k}
          onClick={() => { window.byupNotificaLetta(n.id); window.location.href = n.href || 'byup Profilo.html?tab=notifiche'; }}
          style={{
            pointerEvents: 'auto', cursor: 'pointer', width: 340, maxWidth: '80vw',
            background: PN.WHITE, borderRadius: 14, padding: '13px 15px',
            border: `1px solid ${PN.BORDER_SOFT}`, borderLeft: `3px solid ${PN.PINK}`,
            boxShadow: '0 16px 40px rgba(15,17,21,0.18)',
            animation: 'pnNotifIn 260ms cubic-bezier(0.34, 1.45, 0.64, 1)',
          }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3}}>
            <span style={{width: 7, height: 7, borderRadius: '50%', background: PN.PINK, flexShrink: 0}}/>
            <span style={{fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: PN.MUTED}}>Nuova notifica</span>
          </div>
          <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, lineHeight: 1.3}}>{n.title}</div>
          <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{n.body}</div>
        </div>
      ))}
    </div>
  );
}
window.PnNotifArrivo = PnNotifArrivo;

// ═══════════════════════════════════════════════════════════════════════════
// LE DUE ATTIVAZIONI, IN FASCIA (4 settembre 2026)
// ═══════════════════════════════════════════════════════════════════════════
// Stripe e il fiscale non si chiedono più nell'onboarding, e con l'avviso in
// basso a destra si perdevano: un riquadro piccolo che si dissolve in sei
// secondi è la forma giusta per «report mensile pronto», non per «senza questo
// non incassi» e «senza questo lo scontrino non parte». Quindi:
//   — fascia a tutta larghezza, in cima, sopra il contenuto;
//   — PERSISTENTE: non si dissolve da sola, e finché la cosa non è fatta torna
//     a ogni ritorno in Panoramica. Chi la chiude con «Non ora» la mette a
//     tacere per la sessione, non per sempre;
//   — «Non ora» non è un annullamento silenzioso: apre il foglio che dice dove
//     si fa la cosa, perché chi rimanda deve sapere dove tornare.
// Le due restano comunque nella campanella, che è la loro casa.
const PN_ATTIVA_RIMANDATE = 'byup_attivazioni_rimandate';
const pnAttivaRimandate = () => {
  try { return JSON.parse(sessionStorage.getItem(PN_ATTIVA_RIMANDATE)) || []; } catch (e) { return []; }
};
const pnAttivaRimanda = (id) => {
  try {
    const l = pnAttivaRimandate();
    if (l.indexOf(id) < 0) { l.push(id); sessionStorage.setItem(PN_ATTIVA_RIMANDATE, JSON.stringify(l)); }
  } catch (e) {}
};
// Dove si fa la cosa, detto com'è scritto nel menu: è quello che uno rilegge
// quando ci torna da solo.
const PN_ATTIVA_DOVE = {
  'attiva-stripe': {
    tinta: PN.AMBER, sfondo: PN.AMBER_SOFT, bordo: '#FCD34D',
    azione: 'Collega Stripe',
    titoloDove: 'Per ricevere pagamenti serve Stripe',
    dove: 'Quando vuoi collegarlo: Impostazioni → POS e integrazioni, tessera Stripe. Finché non è collegato non incassi: né carte al tavolo, né in app, né online.',
  },
  fiscale: {
    tinta: '#B91C1C', sfondo: '#FEF2F2', bordo: '#FECACA',
    azione: 'Apri Dati fiscali',
    titoloDove: 'Per emettere gli scontrini servono i dati fiscali',
    dove: 'Quando vuoi impostarli: Impostazioni → Dati fiscali. Lì dai la delega all\'Agenzia e inserisci le credenziali di chi trasmette; finché mancano, scontrini e fatture non partono.',
  },
};
const pnAttivaStile = (id) => PN_ATTIVA_DOVE[id] || PN_ATTIVA_DOVE.fiscale;

function PnAttivazioniFascia() {
  const items = window.byupUseNotifiche();
  const [rimandate, setRimandate] = React.useState(() => pnAttivaRimandate());
  const [dove, setDove] = React.useState(null);   // la notifica di cui si spiega il dove
  const aperte = items.filter(n => String(n.id).indexOf('attiva-') === 0 && rimandate.indexOf(n.id) < 0);
  const rimanda = (n) => { pnAttivaRimanda(n.id); setRimandate(pnAttivaRimandate()); setDove(n); };
  const vai = (n) => { window.byupNotificaLetta(n.id); window.location.href = n.href; };
  if (!aperte.length && !dove) return null;

  const foglio = dove && (() => {
    const st = pnAttivaStile(dove.id);
    return (
      <div onClick={() => setDove(null)} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)',
        display: 'grid', placeItems: 'center', zIndex: 460, padding: 20,
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: 480, maxWidth: '92vw', background: PN.WHITE, borderRadius: 16,
          boxShadow: '0 24px 60px rgba(15,17,21,0.24)', padding: '24px 26px',
          animation: 'pnAttivaIn 220ms cubic-bezier(0.34, 1.35, 0.64, 1)',
        }}>
          <div style={{fontSize: 19, fontWeight: 800, color: PN.TEXT, letterSpacing: -0.3, lineHeight: 1.3}}>{st.titoloDove}</div>
          <div style={{fontSize: 15, color: PN.MUTED, marginTop: 8, lineHeight: 1.55}}>{st.dove}</div>
          <div style={{display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end'}}>
            <button onClick={() => setDove(null)} className="pn-btn-feedback" style={{
              padding: '10px 18px', borderRadius: 10, border: `1px solid ${PN.BORDER}`,
              background: PN.WHITE, color: PN.TEXT, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Ho capito</button>
            <button onClick={() => vai(dove)} className="pn-btn-feedback" style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: PN.BTN_DARK, color: PN.WHITE, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Vai adesso</button>
          </div>
        </div>
      </div>
    );
  })();

  return (
    <React.Fragment>
      <style>{`
        @keyframes pnAttivaGiu { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: none; } }
        @keyframes pnAttivaIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: none; } }
      `}</style>
      {!!aperte.length && (
        <div data-attivazioni style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 440,
          display: 'flex', flexDirection: 'column',
          animation: 'pnAttivaGiu 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '0 12px 32px -16px rgba(15,17,21,0.35)',
        }}>
          {aperte.map(n => {
            const st = pnAttivaStile(n.id);
            return (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '13px 24px',
                background: st.sfondo, borderBottom: `1px solid ${st.bordo}`,
              }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: st.tinta, color: PN.WHITE, display: 'grid', placeItems: 'center',
                }}>
                  {/* Il triangolo d'avviso, disegnato qui: BuIcons non c'è in
                      tutti i bundle che caricano questo file. */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PN.WHITE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
                  </svg>
                </span>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 15.5, fontWeight: 800, color: st.tinta, letterSpacing: -0.1}}>{n.title}</div>
                  <div style={{fontSize: 14, color: PN.TEXT, marginTop: 1, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{n.body}</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0}}>
                  <button onClick={() => rimanda(n)} className="pn-btn-feedback" style={{
                    padding: '9px 15px', borderRadius: 10, border: `1px solid ${PN.BORDER}`,
                    background: PN.WHITE, color: PN.TEXT, fontSize: 14.5, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Non ora</button>
                  <button onClick={() => vai(n)} className="pn-btn-feedback" style={{
                    padding: '9px 17px', borderRadius: 10, border: 'none',
                    background: PN.BTN_DARK, color: PN.WHITE, fontSize: 14.5, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>{st.azione}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {foglio}
    </React.Fragment>
  );
}
window.PnAttivazioniFascia = PnAttivazioniFascia;

function PnNotifBell({ dropUp = false, sidebar = false, collapsed = false }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState(PN_NOTIFICATIONS);
  const ref = React.useRef(null);
  const menuRef = React.useRef(null);
  // Posizione fixed della tendina, dal rect della campanella: la tendina vive
  // in un portal sul body, così si distende sopra il frame (che è scalato con
  // zoom) senza rischi di clipping o di stacking context.
  const [menuPos, setMenuPos] = React.useState(null);
  const unreadCount = items.filter(i => i.unread).length;

  React.useLayoutEffect(() => {
    if (!open) { setMenuPos(null); return; }
    const rect = ref.current.getBoundingClientRect();
    // dropUp/sidebar: sopra la campanella, agganciata a sinistra;
    // topbar: sotto la campanella, allineata a destra.
    setMenuPos((dropUp || sidebar)
      ? { bottom: window.innerHeight - rect.top + 8, left: rect.left }
      : { top: rect.bottom + 8, right: window.innerWidth - rect.right });
  }, [open, dropUp, sidebar]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      const inBell = ref.current && ref.current.contains(e.target);
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!inBell && !inMenu) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const markAllRead = () => setItems(items.map(i => ({...i, unread: false})));

  return (
    <div ref={ref} style={{position:'relative', ...(sidebar ? {width: collapsed ? 'auto' : '100%'} : {})}}>
      {sidebar ? (
        // Variante sidebar: riga di sistema identica a PnSysItem (Supporto/Impostazioni),
        // con badge non letti a destra (pallino sull'icona quando è collassata).
        <button onClick={() => setOpen(o => !o)} title="Notifiche"
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 12,
            padding: collapsed ? '8px' : '9px 10px',
            borderRadius: 10,
            border: 'none',
            background: open ? 'rgba(15, 17, 21, 0.045)' : 'transparent',
            color: open ? PN.TEXT : PN.MUTED,
            fontWeight: 500, fontSize: 17.5,
            cursor: 'pointer', fontFamily: 'inherit',
            position: 'relative',
            transition: 'background 160ms ease, color 160ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15, 17, 21, 0.045)'; e.currentTarget.style.color = PN.TEXT; }}
          onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; } }}
        >
          <span style={{position:'relative', display:'inline-flex'}}>
            <Icon name="bell" size={collapsed ? 18 : 21}/>
            {collapsed && unreadCount > 0 && (
              <span style={{
                position:'absolute', top: -3, right: -3,
                width: 9, height: 9, borderRadius: '50%',
                background: PN.PINK, border: '1.5px solid #fff',
              }}/>
            )}
          </span>
          {!collapsed && <span style={{flex: 1, textAlign:'left'}}>Notifiche</span>}
          {!collapsed && unreadCount > 0 && (
            <span style={{
              minWidth: 20, padding: '2px 7px', borderRadius: 999,
              background: PN.PINK, color: '#fff',
              fontSize: 12.5, fontWeight: 800, lineHeight: 1.2,
              textAlign: 'center', flexShrink: 0,
            }}>{unreadCount}</span>
          )}
        </button>
      ) : (
      <button onClick={() => setOpen(o => !o)} style={{
        position:'relative',
        width: 36, height: 36, borderRadius: 10,
        border: `1px solid ${PN.BORDER}`,
        background: open ? PN.SIDE_BG : PN.WHITE, color: PN.TEXT,
        cursor:'pointer',
        display:'grid', placeItems:'center',
      }}>
        <Icon name="bell" size={17} color={PN.TEXT}/>
        {unreadCount > 0 && (
          <span style={{
            position:'absolute', top: 5, right: 5,
            minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999,
            background: PN.PINK, border:`2px solid ${PN.WHITE}`,
            color: '#fff', fontSize: 11.5, fontWeight: 800,
            display:'grid', placeItems:'center', lineHeight: 1,
          }}>{unreadCount}</span>
        )}
      </button>
      )}

      {open && menuPos && ReactDOM.createPortal(
        // Popup su fondo BIANCO pieno (niente vetro): del token GLASS_MENU
        // restano bordo, ombra e radius. Vive in un portal sul body per
        // stare sopra al frame zoomato senza problemi di clipping.
        <div ref={menuRef} style={{
          position: 'fixed',
          ...menuPos,
          width: 380,
          ...PN.GLASS_MENU,
          background: '#fff',
          backgroundImage: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          zIndex: 9981,
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding: '14px 16px', borderBottom: `1px solid ${PN.BORDER_SOFT}`,
          }}>
            <div>
              <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>Notifiche</div>
              <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>
                {unreadCount > 0 ? `${unreadCount} non lette` : 'Tutto letto ✓'}
              </div>
            </div>
          </div>

          <div style={{maxHeight: 440, overflowY: 'auto'}} className="pn-scroll">
            {items.map(n => (
              <div key={n.id} style={{
                display:'flex', gap: 12,
                padding: '12px 16px',
                borderBottom: `1px solid ${PN.BORDER_SOFT}`,
                background: n.unread ? '#fff7fa' : '#fff',
                cursor:'pointer',
                position:'relative',
              }}
                onClick={() => {
                  setItems(prev => prev.map(i => i.id === n.id ? {...i, unread: false} : i));
                  if (n.href) window.location.href = n.href;
                }}
                onMouseEnter={e => e.currentTarget.style.background = n.unread ? '#ffeef4' : '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = n.unread ? '#fff7fa' : '#fff'}
              >
                {n.unread && (
                  <span style={{
                    position:'absolute', left: 6, top: 18,
                    width: 6, height: 6, borderRadius: '50%', background: PN.PINK,
                  }}/>
                )}
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 15, fontWeight: 600, color: PN.TEXT, marginBottom: 2, lineHeight: 1.35}}>{n.title}</div>
                  <div style={{fontSize: 14, color: PN.MUTED, lineHeight: 1.45, marginBottom: 4}}>{n.body}</div>
                  <div style={{fontSize: 13, color: '#a3a3ad', fontWeight: 500}}>{n.time}</div>
                </div>
                {/* Freccia → dice che la riga si apre (la navigazione è sul click della riga) */}
                <span style={{alignSelf:'center', flexShrink:0, color:'#C4C9D4', display:'grid', placeItems:'center'}}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </span>
                {/* Cestino → elimina la notifica (la navigazione è sul click
                    della riga, quindi qui serve lo stopPropagation) */}
                <button
                  title="Elimina notifica"
                  onClick={(e) => { e.stopPropagation(); setItems(prev => prev.filter(i => i.id !== n.id)); }}
                  style={{
                    alignSelf:'center', flexShrink: 0,
                    width: 28, height: 28, borderRadius: 8,
                    background:'transparent', border:'none', cursor:'pointer',
                    color: PN.MUTED, display:'grid', placeItems:'center',
                    transition:'background 140ms ease, color 140ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {unreadCount > 0 && (
            <div style={{
              padding: '10px 16px', textAlign:'center',
              borderTop: `1px solid ${PN.BORDER_SOFT}`,
              background: '#fafafa',
            }}>
              <button onClick={markAllRead} style={{
                background:'transparent', border:'none',
                color: PN.PINK, fontSize: 14, fontWeight: 600, fontFamily:'inherit',
                cursor:'pointer', padding: 0,
              }}>Segna come lette</button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

window.PnNotifBell = PnNotifBell;

// ═══════════════════════════════════════════════════════════════════════════
// PnNotificheSection — l'elenco completo, dentro Profilo → Notifiche.
// Sostituisce la tendina: qui c'è spazio per leggere davvero, filtrare e
// gestire, senza una voce di menu che occupava il fondo della sidebar per una
// cosa che si guarda due volte al giorno.
// ═══════════════════════════════════════════════════════════════════════════
function PnNotificheSection() {
  const items = window.byupUseNotifiche();
  const [filtro, setFiltro] = React.useState('tutte');
  const [suono, setSuono] = React.useState(() => window.byupNotifSuonoAttivo());
  // P-115: il numerino sul profilo si azzera aprendo Notifiche — è il segnale
  // «c'è qualcosa di nuovo», e qui il nuovo lo si è visto. Le righe restano
  // però evidenziate finché si è in pagina: `erano` fotografa le non lette
  // all'ingresso, altrimenti sparirebbero sotto gli occhi di chi le sta
  // leggendo, e non si capirebbe più quali erano.
  const [erano] = React.useState(() => new Set(items.filter(n => n.unread).map(n => n.id)));
  React.useEffect(() => {
    const t = setTimeout(() => window.byupNotificheTutteLette(), 1200);
    return () => clearTimeout(t);
  }, []);
  const nuova = (n) => n.unread || erano.has(n.id);
  const nonLette = items.filter(n => n.unread).length;
  const visibili = filtro === 'nonlette' ? items.filter(nuova) : items;

  const Filtro = ({ id, label, count }) => {
    const on = filtro === id;
    return (
      <button onClick={() => setFiltro(id)} style={{
        display:'inline-flex', alignItems:'center', gap: 6,
        padding:'6px 13px', borderRadius: 999,
        background: on ? PN.SIDE_ACTIVE_BG : '#fff',
        color: on ? PN.PINK_DARK : PN.MUTED,
        border: `1px solid ${on ? 'rgba(255,90,95,0.30)' : PN.BORDER}`,
        fontSize: 14, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        transition:'background 150ms ease, color 150ms ease, border-color 150ms ease',
      }}>
        {label}
        {count != null && (
          <span style={{
            fontSize: 12.5, fontWeight: 800, fontVariantNumeric:'tabular-nums',
            color: on ? PN.PINK_DARK : '#9CA3AF',
          }}>{count}</span>
        )}
      </button>
    );
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 14}}>
      {/* Header: stato in chiaro + azione di massa */}
      <div style={{
        background: PN.WHITE, borderRadius: 14, border: `1px solid ${PN.BORDER_SOFT}`,
        padding: 22, display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap',
      }}>
        <div style={{flex: 1, minWidth: 220}}>
          <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Le tue notifiche</div>
          <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3}}>
            {nonLette > 0
              ? `${nonLette} da leggere · il conteggio compare sul tuo profilo, in fondo al menu.`
              : 'Sei in pari: nessuna notifica da leggere.'}
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 8, flexShrink: 0, flexWrap:'wrap'}}>
          {/* L'interruttore del suono sta dove si leggono le notifiche: è la
              loro impostazione, e cercarla altrove sarebbe cercarla due volte. */}
          <label title="Suona quando arriva una notifica" style={{
            display:'inline-flex', alignItems:'center', gap: 7, padding:'6px 12px', borderRadius: 999,
            border: `1px solid ${PN.BORDER}`, background: PN.WHITE, cursor:'pointer',
            fontSize: 14, fontWeight: 700, color: suono ? PN.TEXT : PN.MUTED,
          }}>
            <input type="checkbox" data-notif-suono checked={suono} onChange={e => { window.byupNotifSuonoImposta(e.target.checked); setSuono(e.target.checked); }} style={{accentColor: PN.PINK_DARK}}/>
            Suono
          </label>
          <Filtro id="tutte" label="Tutte" count={items.length}/>
          <Filtro id="nonlette" label="Non lette" count={nonLette}/>
          {nonLette > 0 && (
            <button onClick={() => window.byupNotificheTutteLette()} style={{
              padding:'8px 15px', borderRadius: 999,
              background: PN.BTN_DARK, color:'#fff', border:'none',
              fontSize: 14, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              transition:'background 150ms ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = PN.BTN_DARK_HOVER; }}
              onMouseLeave={e => { e.currentTarget.style.background = PN.BTN_DARK; }}
            >Segna tutte come lette</button>
          )}
        </div>
      </div>

      {/* Elenco */}
      <div style={{
        background: PN.WHITE, borderRadius: 14, border: `1px solid ${PN.BORDER_SOFT}`,
        overflow:'hidden',
      }}>
        {visibili.length === 0 ? (
          <div style={{padding:'54px 22px', textAlign:'center'}}>
            <div style={{
              width: 46, height: 46, borderRadius:'50%', margin:'0 auto 12px',
              background: PN.SIDE_ACTIVE_BG, color: PN.PINK_DARK,
              display:'grid', placeItems:'center',
            }}>
              <Icon name="bell" size={20} color={PN.PINK_DARK}/>
            </div>
            <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>
              {filtro === 'nonlette' ? 'Nessuna notifica da leggere' : 'Nessuna notifica'}
            </div>
            <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 4}}>
              Ti avvisiamo qui quando succede qualcosa di importante.
            </div>
          </div>
        ) : visibili.map((n, i) => (
          <div key={n.id}
            onClick={() => { window.byupNotificaLetta(n.id); if (n.href) window.location.href = n.href; }}
            style={{
              display:'flex', alignItems:'flex-start', gap: 12,
              padding:'16px 20px',
              borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              background: nuova(n) ? '#FFF7F8' : PN.WHITE,
              cursor:'pointer', transition:'background 140ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = nuova(n) ? '#FFEEF1' : '#FAFAFB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = nuova(n) ? '#FFF7F8' : PN.WHITE; }}
          >
            {/* Pallino di stato: pieno coral = da leggere, cavo = già letta */}
            <span style={{
              width: 9, height: 9, borderRadius:'50%', flexShrink: 0, marginTop: 6,
              background: nuova(n) ? PN.PINK : 'transparent',
              boxShadow: nuova(n) ? 'none' : 'inset 0 0 0 1.5px #D9DBE0',
            }}/>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{
                fontSize: 15.5, fontWeight: nuova(n) ? 700 : 600, color: PN.TEXT,
                lineHeight: 1.35, marginBottom: 3,
              }}>{n.title}</div>
              <div style={{fontSize: 14.5, color: PN.MUTED, lineHeight: 1.5}}>{n.body}</div>
              <div style={{fontSize: 13.5, color:'#A3A3AD', fontWeight: 500, marginTop: 5}}>{n.time}</div>
            </div>
            <button
              title="Elimina notifica"
              onClick={(e) => { e.stopPropagation(); window.byupNotificaElimina(n.id); }}
              style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: 9,
                background:'transparent', border:'none', cursor:'pointer',
                color: PN.MUTED, display:'grid', placeItems:'center',
                transition:'background 140ms ease, color 140ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

window.PnNotificheSection = PnNotificheSection;

function PnWifiIcon({ color = '#9CA3AF', size = 15, weak = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{flexShrink:0, display:'block'}}>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"
        stroke={color} strokeWidth="2" strokeLinecap="round"
        opacity={weak ? 0.2 : 1}/>
      <path d="M5 12.55a11 11 0 0 1 14.08 0"
        stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"
        stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="20" r="1.5" fill={color}/>
    </svg>
  );
}

function PnConnectionStatus({ variant, collapsed = false }) {
  const getStatus = () => {
    if (!navigator.onLine) return 'offline';
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' ||
        (conn.downlink !== undefined && conn.downlink < 0.5))) return 'instabile';
    return 'online';
  };

  const [realStatus, setRealStatus] = React.useState(getStatus);
  // Stato demo: seedabile via ?conn=instabile|offline per demo/link diretti.
  const [demoOverride, setDemoOverride] = React.useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('conn');
      return ['online', 'instabile', 'offline'].includes(p) ? p : null;
    } catch (e) { return null; }
  });
  const [showRestored, setShowRestored] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      setRealStatus(prev => {
        const next = getStatus();
        if (prev === 'offline' && next === 'online') {
          setShowRestored(true);
          setTimeout(() => setShowRestored(false), 2500);
        }
        return next;
      });
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) conn.addEventListener('change', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      if (conn) conn.removeEventListener('change', update);
    };
  }, []);

  // Trigger demo esterno: doppio click sul logo byup in sidebar cicla gli stati.
  React.useEffect(() => {
    const cycle = () => handleDemoClick();
    window.addEventListener('byup-conn-demo', cycle);
    return () => window.removeEventListener('byup-conn-demo', cycle);
  }, [realStatus]);

  const DEMO_CYCLE = ['online', 'instabile', 'offline'];
  const handleDemoClick = () => {
    setDemoOverride(prev => {
      const current = prev ?? realStatus;
      const idx = DEMO_CYCLE.indexOf(current);
      const next = DEMO_CYCLE[(idx + 1) % DEMO_CYCLE.length];
      if (current === 'offline' && next === 'online') {
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 2500);
      }
      return next;
    });
  };

  const status = demoOverride ?? realStatus;
  const isOffline = status === 'offline';
  const isUnstable = status === 'instabile';

  return (
    <>
      {variant === 'mini' ? (
        // Event-driven: quando la connessione è ok non esiste. Compare solo
        // con un problema — chip ambra (instabile) o rosso (offline) in fondo
        // alla sidebar, dove di solito non c'è nulla: impossibile non notarlo.
        (isUnstable || isOffline) ? (
          <div
            onClick={handleDemoClick}
            title={isOffline ? 'Connessione assente' : 'Connessione instabile'}
            style={{
              display:'flex', alignItems:'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : 10,
              padding: collapsed ? '8px' : '9px 10px',
              margin: '0 0 10px',
              borderRadius: 10, cursor:'pointer',
              background: isOffline ? '#FEE2E2' : '#FEF3C7',
              border: `1px solid ${isOffline ? '#FECACA' : '#FDE68A'}`,
              animation: 'pn-banner-in .22s ease-out',
            }}>
            <PnWifiIcon
              color={isOffline ? '#DC2626' : '#D97706'}
              size={16}
              weak={isUnstable}
            />
            {!collapsed && (
              <span style={{
                fontSize: 15, fontWeight: 700,
                color: isOffline ? '#B91C1C' : '#92400E',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>
                {isOffline ? 'Connessione assente' : 'Connessione instabile'}
              </span>
            )}
          </div>
        ) : null
      ) : (
      <div
        onClick={handleDemoClick}
        title="Clicca per simulare stati connessione"
        style={{
          display:'flex', alignItems:'center', gap:5,
          padding: isUnstable ? '5px 9px' : '5px 7px',
          borderRadius:8,
          background: isUnstable ? '#FEF3C7' : isOffline ? '#FEE2E2' : 'transparent',
          border: `1px solid ${isUnstable ? '#FDE68A' : isOffline ? '#FECACA' : 'transparent'}`,
          cursor:'pointer',
          transition:'background .2s, border-color .2s',
        }}>
        <PnWifiIcon
          color={isUnstable ? '#D97706' : isOffline ? '#DC2626' : '#C4C9D4'}
          size={15}
          weak={isUnstable}
        />
        {isUnstable && (
          <span style={{fontSize:14, fontWeight:700, color:'#D97706', letterSpacing:0.1}}>
            Instabile
          </span>
        )}
      </div>
      )}

      {/* Banner offline/ripristino: montato sul body via portal — il frame è
          scalato con zoom, quindi un fixed al suo interno non coprirebbe
          l'intera finestra della piattaforma. Sul body copre tutto, sempre. */}
      {(isOffline || showRestored) && ReactDOM.createPortal(
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:9999,
          background: showRestored ? '#15803D' : '#B91C1C',
          color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          padding:'12px 24px',
          fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize:16, fontWeight:600, letterSpacing:0.1,
          boxShadow: showRestored
            ? '0 2px 12px rgba(21,128,61,0.2)'
            : '0 2px 16px rgba(185,28,28,0.25)',
          animation:'pn-banner-in .22s ease-out',
        }}>
          {showRestored
            ? '✓  Connessione ripristinata'
            : '⚠  Connessione assente. Verifica la rete'}
        </div>,
        document.body
      )}
      <style>{`
        @keyframes pn-banner-in {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </>
  );
}

window.PnWifiIcon = PnWifiIcon;
window.PnConnectionStatus = PnConnectionStatus;


// ═══════════════════════════════════════════════════════════════════════════
// Ricerca globale ⌘K — cross-page: pagine, azioni rapide, prenotazioni, conti,
// piatti. Vive in questo file perché è caricato da tutte le pagine desktop.
// L'indice è statico e rispecchia i mock delle singole pagine.
// ═══════════════════════════════════════════════════════════════════════════

const PN_SEARCH_INDEX = [
  // Pagine
  { g:'Pagine', label:'Panoramica',       sub:'Dashboard del locale',             href:'byup Panoramica.html', keys:'home dashboard widget' },
  { g:'Pagine', label:'Sala',             sub:'Tavoli, mappa e conti aperti',     href:'byup Sala.html', keys:'tavoli mappa sala' },
  { g:'Pagine', label:'Vendita diretta',  sub:'Cassa e ordini da banco',          href:'byup Sala.html?tab=vendita', keys:'cassa banco pos vendita' },
  { g:'Pagine', label:'Prenotazioni',     sub:'Timeline e calendario',            href:'byup Sala.html?tab=calendar', keys:'calendario timeline booking' },
  { g:'Pagine', label:'Cucina',           sub:'Comande in tempo reale (KDS)',     href:'byup Cucina.html', keys:'kds comande cucina' },
  { g:'Pagine', label:'Statistiche',      sub:'Operazioni, economici, app',       href:'byup Statistiche.html', keys:'analytics report kpi statistiche' },
  { g:'Pagine', label:'Contabilità',      sub:'Cassa, conti, costi, IVA, export', href:'byup Contabilita.html', keys:'iva costi export fatture contabilita' },
  { g:'Pagine', label:'Impostazioni',     sub:'Vetrina, menù, sala, personale, dati fiscali, POS', href:'byup Impostazioni.html', keys:'vetrina menu piatti personale operazioni fiscali pos integrazioni impostazioni' },
  { g:'Pagine', label:'Supporto',         sub:'Chat, guide e assistenza',          href:'byup Supporto.html', keys:'aiuto help assistenza supporto' },
  { g:'Pagine', label:'Profilo',          sub:'Account, piani e fatturazione',     href:'byup Profilo.html', keys:'account password piano abbonamento profilo' },
  // Azioni rapide
  { g:'Azioni rapide', label:'Apri cassa',              sub:'Vendita diretta',        href:'byup Sala.html?tab=vendita', keys:'cassa apri incasso' },
  { g:'Azioni rapide', label:'Nuova prenotazione',      sub:'Prenotazioni · timeline', href:'byup Sala.html?tab=calendar', keys:'prenota nuovo tavolo' },
  { g:'Azioni rapide', label:'Esporta dati contabili',  sub:'Contabilità · Export',   href:'byup Contabilita.html', keys:'export csv pdf commercialista' },
  { g:'Azioni rapide', label:'Carica menu con AI',      sub:'Impostazioni · Menù',    href:'byup Impostazioni.html', keys:'menu ai importa pdf foto' },
  { g:'Azioni rapide', label:'Modifica menu',           sub:'Impostazioni · Menù',    href:'byup Impostazioni.html?page=menu-cucina&sub=menu', keys:'menu modifica categorie composizione piatti pranzo cena' },
  { g:'Azioni rapide', label:'Invita un ristorante',    sub:'Profilo · Piani e abbonamenti', href:'byup Profilo.html?tab=piani&invita=1', keys:'referral codice invito link collega passaparola due mesi gratis' },
  // Prenotazioni (mock timeline Sala + Panoramica)
  ...[['Bruni','Tavolo 1 · 6 coperti · 13:00'],['Borrelli','Tavolo 2 · 3 coperti · 12:45'],['Barbieri','Tavolo 2 · 4 coperti · 13:30'],['Martina Ciani','Tavolo 3 · 2 coperti · 13:15'],['Mele','Tavolo 4 · 2 coperti · 12:45'],['Bellini','Tavolo 4 · 2 coperti · 13:30'],['Famiglia Ferri','Tavolo 5 · 4 coperti · 12:00'],['Coppia Rossi','Tavolo 6 · 2 coperti · 12:00'],['Caruso','Tavolo 6 · 2 coperti · 13:00'],['Luca Bianchi','Tavolo 7 · 3 coperti · 12:00'],['Esposito','Tavolo 8 · 2 coperti · 12:45'],['Battaglia','Tavolo 8 · 2 coperti · 13:30'],['Pellegrini','Tavolo 9 · 3 coperti · 13:30'],['Gallo azienda','Tavolo 11 · 6 coperti · 12:15'],['Conte','Tavolo 12 · 6 coperti · 20:15'],['Greco','Tavolo 5 · 3 coperti · 21:00'],['De Luca','Tavolo 9 · 2 coperti · 21:30']]
    .map(([n, d]) => ({ g:'Prenotazioni', label:n, sub:'Prenotazione · ' + d, href:'byup Sala.html?tab=calendar', keys:'prenotazione ' + n.toLowerCase() })),
  // Conti (mock Contabilità)
  ...[['Mario Rossi','Tavolo 4 · €85,00 · da saldare €45,00'],['Simone De Luca','Asporto · €64,50 · da saldare'],['Roberto Esposito','Tavolo 10 · €128,00 · da saldare'],['Giulia Russo','Tavolo 12 · €312,00 · da saldare €42,00'],['Lucia Marchesi','Tavolo 1 · €72,00 · saldato'],['Francesco Rossi','Tavolo 3 · €95,50 · saldato'],['Carlo Russo','Tavolo 8 · €215,00 · saldato'],['Andrea Mele','Tavolo 7 · €485,00 · saldato'],['Anna Costa','Asporto · €38,50 · saldato'],['Coppia Neri','Tavolo 6 · €58,00 · rimborso parziale']]
    .map(([n, d]) => ({ g:'Conti', label:n, sub:'Conto · ' + d, href:'byup Contabilita.html', keys:'conto scontrino ' + n.toLowerCase() })),
  // Piatti (mock Menù)
  ...[['Bruschetta al pomodoro','Antipasti · €6,50'],['Carbonara','Primi · €13,00'],['Cacio e Pepe','Primi · €12,00'],['Amatriciana','Primi · €13,00'],['Lasagna','Primi · €13,50'],['Pizza Margherita','Pizze · €9,00'],['Pizza Diavola','Pizze · €11,00'],['Tagliata di manzo','Secondi · €18,00'],['Tagliere misto','Antipasti · €14,00'],['Tiramisù','Dolci · €6,50'],['Spritz','Bar · €6,50'],['Espresso','Bar · €1,50'],['Cappuccino','Bar · €1,80']]
    .map(([n, d]) => ({ g:'Piatti', label:n, sub:'Piatto · ' + d, href:'byup Impostazioni.html', keys:'piatto menu ' + n.toLowerCase() })),
];

function PnGlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o); setQ(''); }
      if (e.key === 'Escape') setOpen(false);
    };
    const onOpen = () => { setOpen(true); setQ(''); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('byup-open-search', onOpen);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('byup-open-search', onOpen); };
  }, []);

  React.useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  if (!open) return null;

  const query = q.trim().toLowerCase();
  const matches = query.length >= 2
    ? PN_SEARCH_INDEX.filter(it =>
        it.label.toLowerCase().includes(query) ||
        it.sub.toLowerCase().includes(query) ||
        (it.keys || '').includes(query))
    : [];
  const groups = [];
  matches.forEach(m => {
    let g = groups.find(x => x.name === m.g);
    if (!g) { g = { name: m.g, items: [] }; groups.push(g); }
    if (g.items.length < 4) g.items.push(m);
  });
  const first = groups[0] && groups[0].items[0];
  const go = (it) => { window.location.href = it.href; };

  return ReactDOM.createPortal(
    <div onClick={() => setOpen(false)} style={{
      position:'fixed', inset:0, zIndex:9990,
      background:'rgba(15,17,21,0.42)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
      display:'flex', justifyContent:'center', alignItems:'flex-start', paddingTop:'11vh',
      fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:640, maxWidth:'92%', background:'#fff', borderRadius:16,
        boxShadow:'0 32px 80px rgba(15,17,21,0.35)', overflow:'hidden',
        animation:'pn-banner-in .18s ease-out',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:11, padding:'15px 18px', borderBottom: matches.length ? '1px solid #ECEDF1' : 'none'}}>
          <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && first) go(first); }}
            placeholder="Cerca prenotazioni, conti, piatti, pagine…"
            style={{flex:1, border:'none', outline:'none', fontSize:17, fontFamily:'inherit', color:'#16181D', background:'transparent'}}/>
          <span style={{padding:'3px 8px', borderRadius:7, background:'#F3F4F6', color:'#6B7280', fontSize:12.5, fontWeight:700}}>ESC</span>
        </div>
        {query.length >= 2 && matches.length === 0 && (
          <div style={{padding:'26px 18px', textAlign:'center', fontSize:14.5, color:'#9CA3AF'}}>Nessun risultato per “{q}”</div>
        )}
        {groups.length > 0 && (
          <div style={{maxHeight:'54vh', overflowY:'auto', padding:'6px 0 8px'}}>
            {groups.map(g => (
              <div key={g.name}>
                <div style={{padding:'10px 18px 5px', fontSize:11.5, fontWeight:800, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.07em'}}>{g.name}</div>
                {g.items.map((it, i) => (
                  <div key={it.g + it.label + i} onClick={() => go(it)}
                    style={{display:'flex', alignItems:'center', gap:12, padding:'9px 18px', cursor:'pointer'}}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF5F6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:15.5, fontWeight:600, color:'#16181D'}}>{it.label}
                        {it === first && <span style={{marginLeft:9, padding:'2px 7px', borderRadius:6, background:'#F3F4F6', color:'#6B7280', fontSize:11.5, fontWeight:700}}>↵</span>}
                      </div>
                      <div style={{fontSize:13, color:'#8A8F98', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{it.sub}</div>
                    </div>
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#C4C9D4" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {query.length < 2 && (
          <div style={{padding:'12px 18px 14px', fontSize:13, color:'#9CA3AF'}}>
            Almeno 2 caratteri · <strong style={{color:'#6B7280'}}>Invio</strong> apre il primo risultato
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

window.PnGlobalSearch = PnGlobalSearch;

// Auto-mount su un root dedicato: il componente vive fuori dall'albero della
// pagina, così la ricerca esiste su ogni schermata che carica questo file.
(function () {
  if (window.__pnSearchMounted || !document.body || !window.ReactDOM || !ReactDOM.createRoot) return;
  window.__pnSearchMounted = true;
  const host = document.createElement('div');
  document.body.appendChild(host);
  ReactDOM.createRoot(host).render(React.createElement(PnGlobalSearch));
})();
